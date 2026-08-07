"""
Tests for the owner-code gate on POST /api/institutions/verify.

THE HOLE THIS CLOSES
--------------------
Gating the eight institution endpoints behind Auth.require_admin is only worth
something if `account_type` cannot be self-assigned. It could be.

The intended design is documented in the code: an owner-issued access code is
"required before entering admin mode". POST /api/institutions/access-code/validate
HMAC-compares the submitted code against settings.EDUCATOR_ACCESS_CODES — and
then stored NOTHING. It returned {accepted: true} and the frontend kept that in
local state.

Meanwhile POST /api/institutions/verify accepted any authenticated user, took a
free-text organisation name, and wrote users.account_type = 'educator'
immediately. require_admin checks only account_type.

So the gate was client-side: skip /access-code/validate, POST /verify, become an
educator in one request, and walk through every endpoint the sibling change had
just locked. These tests assert that path is closed and that the legitimate one
still works.
"""
from unittest.mock import MagicMock

import pytest

USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub


def _user_row(**overrides):
    row = {
        "id": USER_ID,
        "username": "EscalationTester",
        "auth_provider": "guest",
        "account_type": "student",
    }
    row.update(overrides)
    return row


@pytest.fixture
def inst_db(mock_db, monkeypatch):
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "db", mock_db, raising=False)
    sc = mock_db.get_service_client.return_value
    sc.schema.return_value.table.return_value.select.return_value.execute.return_value = MagicMock(data=[])
    sc.schema.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{}])
    return mock_db


def _login_as(inst_db, user_row):
    sc = inst_db.get_service_client.return_value
    (
        sc.table.return_value.select.return_value.eq.return_value
        .single.return_value.execute.return_value
    ) = MagicMock(data=user_row)


class TestVerifyRequiresOwnerCode:
    def test_student_without_grant_cannot_self_promote(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """The whole escalation in one request. Must be refused."""
        _login_as(inst_db, _user_row(account_type="student"))
        import routes.institutions_routes as ir

        promoted = []
        monkeypatch.setattr(
            ir, "_find_or_create_school",
            lambda claim: (_ for _ in ()).throw(
                AssertionError("reached org creation despite no owner-code grant")
            ),
        )
        monkeypatch.setattr(
            ir, "_attach_member",
            lambda *a, **kw: promoted.append(a),
        )

        r = client.post(
            "/api/institutions/verify",
            headers=auth_header,
            json={"organizationName": "Totally Real University", "role": "owner"},
        )
        assert r.status_code == 403, r.text
        assert "owner-issued access code" in r.json()["detail"]
        assert promoted == [], "membership was attached despite the refusal"

    def test_guest_without_grant_is_refused(self, client, auth_header, inst_db):
        _login_as(inst_db, _user_row(account_type="guest"))
        r = client.post(
            "/api/institutions/verify",
            headers=auth_header,
            json={"organizationName": "Anywhere Poly"},
        )
        assert r.status_code == 403, r.text

    def test_null_grant_is_refused_not_treated_as_present(
        self, client, auth_header, inst_db
    ):
        """An explicit NULL column must read as 'never granted'."""
        _login_as(inst_db, _user_row(admin_access_granted_at=None))
        r = client.post(
            "/api/institutions/verify",
            headers=auth_header,
            json={"organizationName": "Some School"},
        )
        assert r.status_code == 403, r.text

    def test_user_with_grant_may_claim(self, client, auth_header, inst_db, monkeypatch):
        """The legitimate path still works end to end."""
        _login_as(
            inst_db,
            _user_row(admin_access_granted_at="2026-08-07T00:00:00+00:00"),
        )
        import routes.institutions_routes as ir
        from routes.institutions_routes import Organization

        monkeypatch.setattr(
            ir, "_find_or_create_school",
            lambda claim: Organization(
                id="school-1", type="university", name="Real University",
                verification_status="unverified",
            ),
        )
        monkeypatch.setattr(ir, "_attach_member", lambda *a, **kw: None)

        r = client.post(
            "/api/institutions/verify",
            headers=auth_header,
            json={"organizationName": "Real University", "role": "owner"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True


class TestAccessCodeRecordsTheGrant:
    def test_valid_code_persists_the_grant(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """Validating the code used to store nothing at all — that is precisely
        why /verify could not check it."""
        from config import settings

        monkeypatch.setattr(settings, "EDUCATOR_ACCESS_CODES", ["LETMEIN"], raising=False)
        _login_as(inst_db, _user_row())
        sc = inst_db.get_service_client.return_value
        update = sc.schema.return_value.table.return_value.update

        r = client.post(
            "/api/institutions/access-code/validate",
            headers=auth_header,
            json={"code": "LETMEIN"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["data"]["accepted"] is True

        writes = [
            c.args[0]
            for c in update.call_args_list
            if c.args
            and isinstance(c.args[0], dict)
            and "admin_access_granted_at" in c.args[0]
        ]
        assert writes, "the grant was never recorded"
        assert writes[-1]["admin_access_granted_at"]

    def test_invalid_code_records_nothing(
        self, client, auth_header, inst_db, monkeypatch
    ):
        from config import settings

        monkeypatch.setattr(settings, "EDUCATOR_ACCESS_CODES", ["LETMEIN"], raising=False)
        _login_as(inst_db, _user_row())
        sc = inst_db.get_service_client.return_value
        update = sc.schema.return_value.table.return_value.update

        r = client.post(
            "/api/institutions/access-code/validate",
            headers=auth_header,
            json={"code": "WRONG"},
        )
        assert r.json()["success"] is False
        writes = [
            c.args[0]
            for c in update.call_args_list
            if c.args
            and isinstance(c.args[0], dict)
            and "admin_access_granted_at" in c.args[0]
        ]
        assert not writes, f"a rejected code still recorded a grant: {writes}"

    def test_zero_row_update_reports_failure(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """PostgREST does not raise when an UPDATE matches no row — it returns an
        empty result. Catching only exceptions would report accepted=true for a
        write that changed nothing, and /verify would then refuse the same user:
        the exact contradiction the fail-closed block exists to prevent."""
        from config import settings

        monkeypatch.setattr(settings, "EDUCATOR_ACCESS_CODES", ["LETMEIN"], raising=False)
        _login_as(inst_db, _user_row())
        sc = inst_db.get_service_client.return_value
        # Matched nothing: no exception, empty data.
        sc.schema.return_value.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

        r = client.post(
            "/api/institutions/access-code/validate",
            headers=auth_header,
            json={"code": "LETMEIN"},
        )
        assert r.json()["success"] is False, (
            "a write that matched no row was reported as an unlocked grant"
        )

    def test_failure_to_record_reports_failure(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """Fail closed: telling the user they are unlocked when the grant was
        not stored sends them to a /verify that will refuse them."""
        from config import settings

        monkeypatch.setattr(settings, "EDUCATOR_ACCESS_CODES", ["LETMEIN"], raising=False)
        _login_as(inst_db, _user_row())
        sc = inst_db.get_service_client.return_value
        sc.schema.return_value.table.return_value.update.return_value.eq.return_value.execute.side_effect = RuntimeError("db down")

        r = client.post(
            "/api/institutions/access-code/validate",
            headers=auth_header,
            json={"code": "LETMEIN"},
        )
        assert r.json()["success"] is False
        assert "try again" in r.json()["message"].lower()
