"""Joining an existing school must not grant its admin workspace.

Exploit that these tests pin: any account holding the shared educator access
code could POST /api/institutions/verify with another school's name/address (or
its organization_id). The server reused that school and linked the caller as a
member, and the admin/provisioning routes only check that a membership exists.
The caller could then read the roster, print login cards with live claim codes
and delete students, who may be minors.

Rule enforced now: a school that already has another active member can only be
joined through a pending, unexpired invitation addressed to the caller's email
(institution_member_invites, created by an owner/admin). A school nobody has
claimed yet can still be claimed by its first member, and an existing member
can re-submit.
"""
import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

import routes.institutions_routes as ir


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, store, table):
        self._store = store
        self._table = table
        self._filters = []
        self._mode = "select"
        self._payload = None
        self._limit = None

    # builders -------------------------------------------------------------
    def select(self, *_a, **_k):
        self._mode = "select"
        return self

    def insert(self, payload):
        self._mode = "insert"
        self._payload = payload
        return self

    def update(self, payload):
        self._mode = "update"
        self._payload = payload
        return self

    def eq(self, column, value):
        self._filters.append(("eq", column, value))
        return self

    def neq(self, column, value):
        self._filters.append(("neq", column, value))
        return self

    def ilike(self, column, value):
        self._filters.append(("ilike", column, value))
        return self

    def order(self, *_a, **_k):
        return self

    def limit(self, n):
        self._limit = n
        return self

    # execution ------------------------------------------------------------
    def _matches(self, row):
        for op, column, value in self._filters:
            have = row.get(column)
            if op == "eq" and have != value:
                return False
            if op == "neq" and have == value:
                return False
            if op == "ilike" and str(have or "").casefold() != str(value).casefold():
                return False
        return True

    def execute(self):
        rows = self._store.setdefault(self._table, [])
        if self._mode == "insert":
            row = dict(self._payload)
            row.setdefault("id", f"{self._table}-{len(rows) + 1}")
            rows.append(row)
            return _Result([row])
        matched = [r for r in rows if self._matches(r)]
        if self._mode == "update":
            for row in matched:
                row.update(self._payload)
            return _Result([dict(r) for r in matched])
        if self._limit is not None:
            matched = matched[: self._limit]
        return _Result([dict(r) for r in matched])


class _FakeSvc:
    def __init__(self):
        self.store = {}

    def table(self, name):
        return _Query(self.store, name)


@pytest.fixture
def svc(monkeypatch):
    fake = _FakeSvc()
    monkeypatch.setattr(ir, "_svc", lambda: fake)
    return fake


def _future(hours=24):
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def _past(hours=24):
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


ATTACKER = {"id": "attacker", "email": "attacker@example.com"}
OWNER = {"id": "owner", "email": "owner@example.com"}


def _school_with_owner(svc):
    svc.store["schools"] = [
        {"id": "school-b", "name": "School B", "institution_type": "secondary_school",
         "address": "1 Main Street, Lagos", "school_code": "SB1"}
    ]
    svc.store["institution_members"] = [
        {"id": "m1", "user_id": "owner", "school_id": "school-b", "role": "owner",
         "verified": True, "seat_status": "active"}
    ]


class TestJoinAuthorization:
    def test_cannot_join_school_that_already_has_members_without_invite(self, svc):
        _school_with_owner(svc)
        with pytest.raises(HTTPException) as exc:
            ir._authorize_join(ATTACKER, "school-b")
        assert exc.value.status_code == 409

    def test_matching_pending_invite_allows_join(self, svc):
        _school_with_owner(svc)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-b", "invited_email": "Attacker@Example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future()}
        ]
        invite = ir._authorize_join(ATTACKER, "school-b")
        assert invite and invite["role"] == "counsellor"

    def test_expired_invite_is_refused(self, svc):
        _school_with_owner(svc)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-b", "invited_email": "attacker@example.com",
             "role": "counsellor", "status": "pending", "expires_at": _past()}
        ]
        with pytest.raises(HTTPException):
            ir._authorize_join(ATTACKER, "school-b")

    def test_invite_for_someone_else_is_refused(self, svc):
        _school_with_owner(svc)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-b", "invited_email": "other@example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future()}
        ]
        with pytest.raises(HTTPException):
            ir._authorize_join(ATTACKER, "school-b")

    def test_revoked_or_accepted_invites_do_not_count(self, svc):
        _school_with_owner(svc)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-b", "invited_email": "attacker@example.com",
             "role": "counsellor", "status": "revoked", "expires_at": _future()},
            {"id": "i2", "school_id": "school-b", "invited_email": "attacker@example.com",
             "role": "counsellor", "status": "accepted", "expires_at": _future()},
        ]
        with pytest.raises(HTTPException):
            ir._authorize_join(ATTACKER, "school-b")

    def test_invite_for_a_different_school_does_not_help(self, svc):
        _school_with_owner(svc)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-z", "invited_email": "attacker@example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future()}
        ]
        with pytest.raises(HTTPException):
            ir._authorize_join(ATTACKER, "school-b")

    def test_user_without_email_cannot_use_invites(self, svc):
        _school_with_owner(svc)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-b", "invited_email": "",
             "role": "counsellor", "status": "pending", "expires_at": _future()}
        ]
        with pytest.raises(HTTPException):
            ir._authorize_join({"id": "attacker", "email": None}, "school-b")

    def test_first_claim_of_unclaimed_school_is_allowed(self, svc):
        svc.store["schools"] = [{"id": "school-c", "name": "School C"}]
        assert ir._authorize_join(ATTACKER, "school-c") is None

    def test_revoked_members_do_not_block_a_first_claim(self, svc):
        svc.store["schools"] = [{"id": "school-c", "name": "School C"}]
        svc.store["institution_members"] = [
            {"id": "m1", "user_id": "old", "school_id": "school-c", "role": "owner",
             "verified": True, "seat_status": "revoked"}
        ]
        assert ir._authorize_join(ATTACKER, "school-c") is None

    def test_existing_member_may_resubmit(self, svc):
        _school_with_owner(svc)
        assert ir._authorize_join(OWNER, "school-b") is None

    def test_lookup_failure_fails_closed(self, monkeypatch):
        class _Broken:
            def table(self, _name):
                raise RuntimeError("db down")

        monkeypatch.setattr(ir, "_svc", lambda: _Broken())
        with pytest.raises(HTTPException) as exc:
            ir._authorize_join(ATTACKER, "school-b")
        assert exc.value.status_code in (409, 503)


class TestFindOrCreateSchoolDoesNotTouchAnotherSchool:
    """The check must run before the school row is modified."""

    def _claim(self, **overrides):
        data = dict(
            organization_name="School B",
            organization_type="secondary_school",
            address="1 Main Street, Lagos",
            city="Hijacked City",
            state="Hijacked State",
            country="Nigeria",
        )
        data.update(overrides)
        return ir.VerificationClaim(**data)

    def test_name_and_address_reuse_is_refused_and_row_untouched(self, svc, monkeypatch):
        _school_with_owner(svc)
        monkeypatch.setattr(ir, "_require_school_identity_schema", lambda _svc: None)
        before = dict(svc.store["schools"][0])
        with pytest.raises(HTTPException):
            ir._find_or_create_school(self._claim(), ATTACKER)
        assert svc.store["schools"][0] == before

    def test_organization_id_selection_is_refused_and_row_untouched(self, svc, monkeypatch):
        _school_with_owner(svc)
        monkeypatch.setattr(ir, "_require_school_identity_schema", lambda _svc: None)
        before = dict(svc.store["schools"][0])
        with pytest.raises(HTTPException):
            ir._find_or_create_school(self._claim(organization_id="school-b"), ATTACKER)
        assert svc.store["schools"][0] == before


class TestVerifyRoute:
    def _call(self, claim, user):
        return asyncio.run(ir.submit_verification(claim, user))

    def test_http_exception_is_not_swallowed_into_a_generic_failure(self, svc, monkeypatch):
        """submit_verification wraps its body in `except Exception`; the 409 must
        reach the client, not be turned into success=False."""
        _school_with_owner(svc)
        monkeypatch.setattr(ir, "_require_school_identity_schema", lambda _svc: None)
        user = dict(ATTACKER, admin_access_granted_at="2026-01-01T00:00:00Z")
        claim = ir.VerificationClaim(
            organization_name="School B", organization_type="secondary_school",
            address="1 Main Street, Lagos",
        )
        with pytest.raises(HTTPException) as exc:
            self._call(claim, user)
        assert exc.value.status_code == 409
        members = svc.store["institution_members"]
        assert all(m["user_id"] != "attacker" for m in members)

    def test_accepting_an_invite_links_the_invited_role_and_closes_the_invite(self, svc, monkeypatch):
        _school_with_owner(svc)
        monkeypatch.setattr(ir, "_require_school_identity_schema", lambda _svc: None)
        svc.store["institution_member_invites"] = [
            {"id": "i1", "school_id": "school-b", "invited_email": "attacker@example.com",
             "role": "counsellor", "status": "pending", "expires_at": _future(),
             "invited_by": "owner"}
        ]
        user = dict(ATTACKER, admin_access_granted_at="2026-01-01T00:00:00Z")
        claim = ir.VerificationClaim(
            organization_name="School B", organization_type="secondary_school",
            address="1 Main Street, Lagos", role="owner",
        )
        self._call(claim, user)
        mine = [m for m in svc.store["institution_members"] if m["user_id"] == "attacker"]
        assert len(mine) == 1
        assert mine[0]["role"] == "counsellor", "an invite must not be upgradable by the claim body"
        # The inviter is an active owner who still holds their seat, so the invited
        # member is vouched for. (An invite whose inviter is gone is refused: see
        # test_institution_review_round2.)
        assert mine[0]["verified"] is True
        assert svc.store["institution_member_invites"][0]["status"] == "accepted"
        assert svc.store["institution_member_invites"][0]["accepted_by"] == "attacker"


def _reset_limiters():
    ir.access_code_limiter.reset()
    ir.access_code_ip_limiter.reset()


class TestAccessCodeRateLimit:
    def test_failed_attempts_are_limited_per_user_and_ip(self):
        limiter = ir.access_code_limiter
        _reset_limiters()
        for _ in range(ir.ACCESS_CODE_FAILURES_PER_WINDOW):
            assert limiter.check("user:u1") is None
            limiter.record("user:u1")
        assert limiter.check("user:u1") is not None
        assert limiter.check("user:u2") is None, "another user is unaffected"
        _reset_limiters()

    def test_wrong_code_attempts_return_429_with_retry_after(self, monkeypatch):
        from types import SimpleNamespace

        monkeypatch.setattr(ir.settings, "EDUCATOR_ACCESS_CODES", ["REAL-CODE"], raising=False)
        _reset_limiters()
        request = SimpleNamespace(client=SimpleNamespace(host="203.0.113.9"), headers={})
        user = {"id": "u1"}

        async def attempt(code):
            return await ir.validate_admin_access_code(
                ir.AdminAccessCodeRequest(code=code), request, user
            )

        for _ in range(ir.ACCESS_CODE_FAILURES_PER_WINDOW):
            result = asyncio.run(attempt("WRONG"))
            assert result.success is False
        with pytest.raises(HTTPException) as exc:
            asyncio.run(attempt("WRONG"))
        assert exc.value.status_code == 429
        assert int(exc.value.headers["Retry-After"]) >= 1
        _reset_limiters()

    def test_successful_validation_is_not_counted(self, monkeypatch, svc):
        from types import SimpleNamespace

        svc.store["users"] = [{"id": "u1"}]
        monkeypatch.setattr(ir.settings, "EDUCATOR_ACCESS_CODES", ["REAL-CODE"], raising=False)
        _reset_limiters()
        request = SimpleNamespace(client=SimpleNamespace(host="203.0.113.10"), headers={})
        for _ in range(ir.ACCESS_CODE_FAILURES_PER_WINDOW + 3):
            result = asyncio.run(
                ir.validate_admin_access_code(
                    ir.AdminAccessCodeRequest(code="REAL-CODE"), request, {"id": "u1"}
                )
            )
            assert result.success is not False
        _reset_limiters()

    def test_one_users_failures_do_not_lock_out_another_user_on_the_same_address(self, monkeypatch):
        """Behind the nginx proxy every caller shares one client address, so the
        strict limit must be per user, not per address."""
        from types import SimpleNamespace

        monkeypatch.setattr(ir.settings, "EDUCATOR_ACCESS_CODES", ["REAL-CODE"], raising=False)
        _reset_limiters()
        shared = SimpleNamespace(client=SimpleNamespace(host="127.0.0.1"), headers={})

        def attempt(user_id, code):
            return asyncio.run(
                ir.validate_admin_access_code(
                    ir.AdminAccessCodeRequest(code=code), shared, {"id": user_id}
                )
            )

        for _ in range(ir.ACCESS_CODE_FAILURES_PER_WINDOW):
            assert attempt("noisy", "WRONG").success is False
        with pytest.raises(HTTPException) as exc:
            attempt("noisy", "WRONG")
        assert exc.value.status_code == 429
        # a different account behind the same proxy address is unaffected
        assert attempt("quiet", "WRONG").success is False
        _reset_limiters()

    def test_the_address_limit_still_stops_a_flood_from_one_address(self, monkeypatch):
        from types import SimpleNamespace

        monkeypatch.setattr(ir.settings, "EDUCATOR_ACCESS_CODES", ["REAL-CODE"], raising=False)
        _reset_limiters()
        request = SimpleNamespace(client=SimpleNamespace(host="198.51.100.7"), headers={})
        # many different accounts, each below its own limit, from one address
        blocked = None
        for n in range(ir.ACCESS_CODE_IP_FAILURES_PER_WINDOW + 5):
            try:
                asyncio.run(
                    ir.validate_admin_access_code(
                        ir.AdminAccessCodeRequest(code="WRONG"), request, {"id": f"user-{n}"}
                    )
                )
            except HTTPException as exc:
                blocked = (n, exc.status_code)
                break
        assert blocked is not None, "a flood from one address was never limited"
        assert blocked[1] == 429
        assert blocked[0] >= ir.ACCESS_CODE_IP_FAILURES_PER_WINDOW
        _reset_limiters()


class TestAccessCodeRouteThroughFastAPI:
    """The unit tests above call the coroutine directly. These go through the
    real route so FastAPI has to inject the ``Request`` itself."""

    USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub

    @pytest.fixture
    def inst_db(self, mock_db, monkeypatch):
        from unittest.mock import MagicMock

        monkeypatch.setattr(ir, "db", mock_db, raising=False)
        sc = mock_db.get_service_client.return_value
        (
            sc.table.return_value.select.return_value.eq.return_value
            .single.return_value.execute.return_value
        ) = MagicMock(data={
            "id": self.USER_ID, "username": "Tester", "auth_provider": "guest",
            "account_type": "student",
        })
        return mock_db

    def test_wrong_codes_are_limited_through_the_real_route(
        self, client, auth_header, inst_db, monkeypatch
    ):
        monkeypatch.setattr(ir.settings, "EDUCATOR_ACCESS_CODES", ["REAL-CODE"], raising=False)
        _reset_limiters()
        seen = []
        real_scopes = ir._access_code_scopes

        def spy(request, current_user):
            seen.append(request)
            return real_scopes(request, current_user)

        monkeypatch.setattr(ir, "_access_code_scopes", spy)
        url = "/api/institutions/access-code/validate"
        for _ in range(ir.ACCESS_CODE_FAILURES_PER_WINDOW):
            r = client.post(url, headers=auth_header, json={"code": "WRONG"})
            assert r.status_code == 200, r.text
            assert r.json()["success"] is False
        r = client.post(url, headers=auth_header, json={"code": "WRONG"})
        assert r.status_code == 429, r.text
        assert int(r.headers["Retry-After"]) >= 1
        # FastAPI really injected the Request (with a client address), so the
        # per-address limiter is active in production, not silently skipped.
        assert seen and all(req is not None for req in seen)
        assert getattr(seen[0].client, "host", None)
        _reset_limiters()


def _load_private_config():
    """Evaluate config.py as a throw-away module.

    Reloading the real ``config`` would replace the shared ``settings`` object
    that every other module and test already holds, and break unrelated tests
    that run later. A private copy under another name leaves it untouched.
    """
    import importlib.util
    import pathlib

    path = pathlib.Path(__file__).resolve().parents[1] / "config.py"
    spec = importlib.util.spec_from_file_location("config_under_test", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class TestDeveloperCodeIsAnExplicitFlag:
    def test_dev_host_prefix_alone_does_not_enable_the_developer_code(self, monkeypatch):
        monkeypatch.delenv("DEVELOPER_ACCESS_ENABLED", raising=False)
        monkeypatch.delenv("EDUCATOR_ACCESS_CODES", raising=False)
        monkeypatch.setenv("DEBUG", "false")
        monkeypatch.setenv("WEB_DASHBOARD_URL", "https://dev.example.com")
        cfg = _load_private_config()
        assert cfg.settings.DEVELOPER_ACCESS_ENABLED is False
        assert "LEVELUP-EDU-DEV" not in cfg.settings.EDUCATOR_ACCESS_CODES

    def test_explicit_flag_enables_it(self, monkeypatch):
        monkeypatch.setenv("DEBUG", "false")
        monkeypatch.setenv("DEVELOPER_ACCESS_ENABLED", "true")
        monkeypatch.delenv("EDUCATOR_ACCESS_CODES", raising=False)
        cfg = _load_private_config()
        assert cfg.settings.DEVELOPER_ACCESS_ENABLED is True
        assert "LEVELUP-EDU-DEV" in cfg.settings.EDUCATOR_ACCESS_CODES

    def test_configured_owner_codes_are_unaffected_by_the_flag(self, monkeypatch):
        monkeypatch.setenv("DEBUG", "false")
        monkeypatch.delenv("DEVELOPER_ACCESS_ENABLED", raising=False)
        monkeypatch.setenv("EDUCATOR_ACCESS_CODES", "owner-one, owner-two")
        cfg = _load_private_config()
        assert cfg.settings.EDUCATOR_ACCESS_CODES == ["OWNER-ONE", "OWNER-TWO"]
