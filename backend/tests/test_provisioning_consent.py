"""Error-path contracts for the consent and roster surfaces.

Three separate lies the API used to tell are pinned here.

1. CONSENT. grant_consent / revoke_consent call _validate_consent_scope (400)
   and _require_student_affiliation (403) from inside their own try block. With
   no `except HTTPException: raise` guard those deliberate raises were caught by
   the generic handler and re-raised as 500, so a client could not tell "you
   sent a bad scope" from "the backend is down".

2. ROSTER. A backend failure returned HTTP 200 with an all-zero RosterResponse,
   which is byte-for-byte what a school with no affiliated students returns.
   The two cases must be distinguishable, so both are asserted here side by
   side: the failure is a 500 (explicitly NOT a 200), and a genuinely empty
   school is still a 200 with zeros.

3. MOCK FIDELITY. conftest's autouse patch_all_db_modules hands every module a
   bare MagicMock, and `MagicMock() or []` is truthy while iterating as empty —
   so a forgotten stub silently exercises the empty path and passes. The roster
   tests therefore also assert a populated roster end to end (non-trivial
   student list, real counts) from the same fixture, so the failure test cannot
   be passing for the wrong reason.

Mocking follows tests/test_domain_reach.py: `_svc()` is
get_service_client().schema("skillup_dev") and `_users()` is
get_service_client().table("users") with NO .schema(), so the two are stubbed
as two separate chains off the same service-client mock.
"""
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

import main  # noqa: F401  (ensures every route module is in sys.modules)

USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub
SCHOOL_ID = "school-1"

CONSENT_URL = "/api/provisioning/students/consent"
ROSTER_URL = "/api/provisioning/roster"


class _Query:
    """A PostgREST-shaped chainable stub.

    `not_` has to be a chainable *property*: get_roster's consent query is
    `.is_("revoked_at", "null").not_.is_("granted_at", "null")`.
    A result that is an Exception instance is raised from execute(), which is
    how a backend failure is simulated on one specific table.
    """

    def __init__(self, result):
        self._result = result

    def _chain(self, *args, **kwargs):
        return self

    select = _chain
    eq = _chain
    neq = _chain
    in_ = _chain
    is_ = _chain
    gt = _chain
    order = _chain
    limit = _chain
    update = _chain
    upsert = _chain
    insert = _chain
    delete = _chain

    @property
    def not_(self):
        return self

    def execute(self):
        if isinstance(self._result, Exception):
            raise self._result
        return SimpleNamespace(data=list(self._result))


def _user_row(**overrides):
    row = {
        "id": USER_ID,
        "username": "ProvTester",
        "auth_provider": "guest",
        "account_type": "student",
    }
    row.update(overrides)
    return row


@pytest.fixture
def prov_db(mock_db, monkeypatch):
    """Point routes.provisioning_routes' captured `db` at the shared mock.

    Returns a setter for the `_svc()` (schema-qualified) tables; the `_users()`
    and auth chains are stubbed separately below because they do NOT go through
    .schema().
    """
    import routes.provisioning_routes as pr

    monkeypatch.setattr(pr, "db", mock_db, raising=False)
    sc = mock_db.get_service_client.return_value

    tables: dict = {}

    def _table(name):
        return _Query(tables.get(name, []))

    sc.schema.return_value.table.side_effect = _table

    def set_tables(**rows):
        tables.update(rows)

    return SimpleNamespace(mock=mock_db, sc=sc, tables=tables, set_tables=set_tables)


def _login_as(prov_db, user_row):
    """Stub the bare .table("users")…single() chain used by Auth."""
    (
        prov_db.sc.table.return_value.select.return_value.eq.return_value
        .single.return_value.execute.return_value
    ) = MagicMock(data=user_row)


def _users_rows(prov_db, rows):
    """Stub `_users()` — the bare .table("users").select().in_() chain."""
    (
        prov_db.sc.table.return_value.select.return_value
        .in_.return_value.execute.return_value
    ) = MagicMock(data=rows)


def _as_admin(prov_db):
    _login_as(prov_db, _user_row(account_type="institution_admin"))
    prov_db.set_tables(institution_members=[{"school_id": SCHOOL_ID}])


# ─────────────────────────────────────────────────────────────
# 1. Consent: deliberate 400/403 must not be flattened into 500
# ─────────────────────────────────────────────────────────────

class TestGrantConsentErrorCodes:
    """POST /students/consent, exercised over HTTP."""

    def test_invalid_scope_is_400_not_500(self, client, auth_header, prov_db):
        _login_as(prov_db, _user_row())
        # An affiliation exists, so 403 cannot be the reason for any failure.
        prov_db.set_tables(student_affiliations=[{"id": "aff-1"}])

        res = client.post(
            CONSENT_URL, headers=auth_header,
            json={"school_id": SCHOOL_ID, "scope": "everything"},
        )

        assert res.status_code == 400, res.text
        assert res.status_code != 500
        assert "valid consent scope" in res.json()["detail"].lower()

    def test_consent_without_affiliation_is_403_not_500(self, client, auth_header, prov_db):
        _login_as(prov_db, _user_row())
        # No student_affiliations row for this student/school pair.
        prov_db.set_tables(student_affiliations=[])

        res = client.post(
            CONSENT_URL, headers=auth_header,
            json={"school_id": SCHOOL_ID, "scope": "progress"},
        )

        assert res.status_code == 403, res.text
        assert res.status_code != 500
        assert "link this school" in res.json()["detail"].lower()

    def test_valid_consent_still_succeeds(self, client, auth_header, prov_db):
        """The guard must not swallow the happy path."""
        _login_as(prov_db, _user_row())
        prov_db.set_tables(student_affiliations=[{"id": "aff-1"}])

        res = client.post(
            CONSENT_URL, headers=auth_header,
            json={"school_id": SCHOOL_ID, "scope": "progress"},
        )

        assert res.status_code == 200, res.text


class TestRevokeConsentErrorCodes:
    """DELETE /students/consent, exercised over HTTP.

    Over HTTP specifically, because this path was unreachable until the route
    was moved above the parameterised `DELETE /students/{user_id}`: Starlette
    matches in registration order, so the admin-gated route claimed the path
    first and answered every student's revoke with 403 "Admin access required".
    Calling the coroutine directly would still pass with that bug present.
    """

    def _revoke(self, client, auth_header, scope="progress"):
        return client.request(
            "DELETE", CONSENT_URL, headers=auth_header,
            json={"school_id": SCHOOL_ID, "scope": scope},
        )

    def test_invalid_scope_is_400_not_500(self, client, auth_header, prov_db):
        _login_as(prov_db, _user_row())
        prov_db.set_tables(student_affiliations=[{"id": "aff-1"}])

        res = self._revoke(client, auth_header, scope="everything")

        assert res.status_code == 400, res.text
        assert res.status_code != 500
        assert "valid consent scope" in res.json()["detail"].lower()

    def test_consent_without_affiliation_is_403_not_500(self, client, auth_header, prov_db):
        _login_as(prov_db, _user_row())
        prov_db.set_tables(student_affiliations=[])

        res = self._revoke(client, auth_header)

        assert res.status_code == 403, res.text
        # The admin gate on the shadowing route also answers 403, so pin the
        # reason: this must be the affiliation check, not "Admin access required".
        assert "link this school" in res.json()["detail"].lower()

    def test_valid_revoke_still_succeeds(self, client, auth_header, prov_db):
        _login_as(prov_db, _user_row())
        prov_db.set_tables(student_affiliations=[{"id": "aff-1"}])

        res = self._revoke(client, auth_header)

        assert res.status_code == 200, res.text
        assert res.json()["data"] == {"revoked": True}

    def test_revoke_route_is_not_shadowed_by_the_parameterised_delete(self):
        """Regression guard for the ordering itself.

        A student DELETEing /students/consent must not be routed into
        /students/{user_id}. Ordering is the only thing keeping them apart, so
        assert it directly rather than inferring it from a status code.
        """
        from routes.provisioning_routes import router

        # route.path carries the router's prefix, so match on the suffix.
        paths = [
            r.path for r in router.routes
            if "DELETE" in getattr(r, "methods", set())
        ]
        consent = next(i for i, x in enumerate(paths)
                       if x.endswith("/students/consent"))
        parameterised = next(i for i, x in enumerate(paths)
                             if x.endswith("/students/{user_id}"))
        assert consent < parameterised, (
            "DELETE /students/consent must be registered before "
            "/students/{user_id} or the admin gate swallows it"
        )


# ─────────────────────────────────────────────────────────────
# 2. Roster: a failure and an empty school must not look alike
# ─────────────────────────────────────────────────────────────

class TestRosterFailureIsDistinguishableFromEmpty:
    def test_populated_roster_is_served(self, client, auth_header, prov_db):
        """Fixture sanity: the mock really drives the non-empty code path.

        Without this, the failure test below could pass merely because a
        forgotten stub sent the route down the `not student_ids` early return.
        """
        _as_admin(prov_db)
        prov_db.set_tables(
            student_affiliations=[
                {"student_id": "stu-1", "source": "school"},
                {"student_id": "stu-2", "source": "school"},
                {"student_id": "stu-3", "source": "self"},
            ],
            student_consents=[{"student_id": "stu-2", "scope": "progress"}],
        )
        _users_rows(prov_db, [
            {"id": "stu-1", "username": "Ada", "student_class": "ss2",
             "stream": "science", "provenance": "provisioned",
             "claim_state": "unclaimed", "chosen_direction": None, "settings": {}},
            {"id": "stu-2", "username": "Bola", "student_class": "ss3",
             "stream": "art", "provenance": "self", "claim_state": None,
             "chosen_direction": {"domain_key": "health"}, "settings": {}},
            {"id": "stu-3", "username": "Chidi", "student_class": "ss1",
             "stream": "commercial", "provenance": "self", "claim_state": None,
             "chosen_direction": None, "settings": {}},
        ])

        res = client.get(ROSTER_URL, headers=auth_header)

        assert res.status_code == 200, res.text
        data = res.json()["data"]
        names = sorted(s["full_name"] for s in data["students"])
        assert names == ["Ada", "Bola"], data  # stu-3 is aggregate-only
        assert data["total_affiliated"] == 3
        assert data["shared_with_you"] == 2
        assert data["aggregate_only"] == 1

    def test_backend_failure_is_500_not_a_zeroed_200(self, client, auth_header, prov_db):
        _as_admin(prov_db)
        prov_db.set_tables(
            student_affiliations=[
                {"student_id": "stu-1", "source": "school"},
                {"student_id": "stu-2", "source": "school"},
            ],
            # The consent read fails mid-way through a roster that really does
            # have students: exactly the outage the zeroed 200 used to hide.
            student_consents=RuntimeError("consent read failed"),
        )
        _users_rows(prov_db, [{"id": "stu-1", "username": "Ada"}])

        res = client.get(ROSTER_URL, headers=auth_header)

        assert res.status_code != 200, (
            "a backend failure must not be reported as a successful roster: "
            f"{res.text}"
        )
        assert res.status_code == 500, res.text
        assert res.json()["detail"] == "Could not load the roster."

    def test_school_with_no_affiliations_is_still_200_with_zeros(
        self, client, auth_header, prov_db
    ):
        _as_admin(prov_db)
        prov_db.set_tables(student_affiliations=[])

        res = client.get(ROSTER_URL, headers=auth_header)

        assert res.status_code == 200, res.text
        data = res.json()["data"]
        assert data["students"] == []
        assert data["total_affiliated"] == 0
        assert data["aggregate_only"] == 0
        assert data["shared_with_you"] == 0
