"""
Tests for routes/institutions_routes.py access control.

Two separate defects are covered here.

1. AUTHORISATION. Eight admin-dashboard reads were guarded only by
   `Auth.get_current_user`, so ANY logged-in account — a plain student —
   could call the institution summary, programme demand, domain ranking,
   alerts, skills gap, role demand, affiliation and vs-national endpoints.
   Only `/peers` was correctly `require_admin`.

2. HONESTY OF THE PATH PARAMETER. Six of those routes take an
   `{institution_id}` that the handlers never read — every query resolved the
   org from `current_user`. That is not a leak (you always got your own data),
   but the API lied: a request for institution X returned the caller's numbers
   stamped with X's identity, which is worse than an error because it reads as
   genuine cross-institution data.

Style follows test_feedback_routes.py: real auth chain (JWT + mocked users
lookup) so the actual dependency executes, mocked service client, no live DB.
"""
from unittest.mock import MagicMock

import pytest

USER_ID = "test-user-123"  # matches the auth_header fixture's JWT sub

# Every route that must refuse a non-admin. `/peers` was already gated; it is
# included so a future refactor cannot silently loosen it.
ADMIN_ONLY_PATHS = [
    "/api/institutions/me/summary",
    "/api/institutions/me/programme-demand",
    "/api/institutions/me/domain-ranking",
    "/api/institutions/me/alerts",
    "/api/institutions/me/programme-intelligence",
    "/api/institutions/me/skills-gap",
    "/api/institutions/me/role-demand",
    "/api/institutions/me/peers",
    "/api/institutions/me/affiliation",
    "/api/institutions/me/vs-national",
]

# Demand tables currently contain only taxonomy-derived baseline rows. These
# surfaces must remain empty until source-backed labour-market ingestion is
# explicitly enabled.
DEMAND_SURFACE_PATHS = [
    "/api/institutions/me/programme-demand",
    "/api/institutions/me/domain-ranking",
    "/api/institutions/me/skills-gap",
    "/api/institutions/me/role-demand",
    "/api/institutions/me/vs-national",
]


def _user_row(**overrides):
    row = {
        "id": USER_ID,
        "username": "InstTester",
        "auth_provider": "guest",
        "account_type": "student",
    }
    row.update(overrides)
    return row


@pytest.fixture
def inst_db(mock_db, monkeypatch):
    """Point the institutions module's captured `db` at the shared mock."""
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "db", mock_db, raising=False)
    sc = mock_db.get_service_client.return_value
    # Generic reads return empty; these tests assert on status codes, not data.
    sc.schema.return_value.table.return_value.select.return_value.execute.return_value = MagicMock(data=[])
    return mock_db


def _login_as(inst_db, user_row):
    sc = inst_db.get_service_client.return_value
    (
        sc.table.return_value.select.return_value.eq.return_value
        .single.return_value.execute.return_value
    ) = MagicMock(data=user_row)


def _org_is(monkeypatch, org_id):
    """Pin the caller's resolved institution."""
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "_resolve_org", lambda _user: org_id, raising=False)


class TestAdminOnlyGate:
    @pytest.mark.parametrize("path", ADMIN_ONLY_PATHS)
    def test_student_is_refused(self, client, auth_header, inst_db, monkeypatch, path):
        """A plain student must not reach any institution intelligence surface."""
        _login_as(inst_db, _user_row(account_type="student"))
        _org_is(monkeypatch, "school-1")
        r = client.get(path, headers=auth_header)
        assert r.status_code == 403, f"{path} allowed a student: {r.status_code}"

    @pytest.mark.parametrize("path", ADMIN_ONLY_PATHS)
    def test_institution_admin_is_allowed(
        self, client, auth_header, inst_db, monkeypatch, path
    ):
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, "school-1")
        r = client.get(path, headers=auth_header)
        assert r.status_code == 200, f"{path} refused an admin: {r.text}"

    @pytest.mark.parametrize("path", ADMIN_ONLY_PATHS)
    def test_educator_is_allowed(
        self, client, auth_header, inst_db, monkeypatch, path
    ):
        """Educators are institution staff too — require_admin covers both."""
        _login_as(inst_db, _user_row(account_type="educator"))
        _org_is(monkeypatch, "school-1")
        r = client.get(path, headers=auth_header)
        assert r.status_code == 200, f"{path} refused an educator: {r.text}"


class TestDemandSurfacesStayUnavailable:
    @pytest.mark.parametrize("path", DEMAND_SURFACE_PATHS)
    def test_demand_surface_is_empty_before_source_backed_ingestion(
        self, client, auth_header, inst_db, monkeypatch, path
    ):
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, "school-1")
        response = client.get(path, headers=auth_header)
        assert response.status_code == 200, response.text
        body = response.json()
        assert body.get("data") == [], f"{path} emitted unsupported demand data"


class TestPathParameterIsHonoured:
    """`{institution_id}` must mean what it says, or refuse."""

    PARAMETERISED = [
        "summary", "programme-demand", "domain-ranking",
        "alerts", "skills-gap", "role-demand", "peers", "affiliation",
    ]

    @pytest.mark.parametrize("leaf", PARAMETERISED)
    def test_another_institutions_id_is_refused(
        self, client, auth_header, inst_db, monkeypatch, leaf
    ):
        """Previously this returned the caller's OWN data labelled as
        school-999 — a confident-looking answer to a question never asked."""
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, "school-1")
        r = client.get(f"/api/institutions/school-999/{leaf}", headers=auth_header)
        assert r.status_code == 403, f"{leaf} served another institution's id"

    @pytest.mark.parametrize("leaf", PARAMETERISED)
    def test_own_id_is_accepted(
        self, client, auth_header, inst_db, monkeypatch, leaf
    ):
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, "school-1")
        r = client.get(f"/api/institutions/school-1/{leaf}", headers=auth_header)
        assert r.status_code == 200, r.text

    @pytest.mark.parametrize("leaf", PARAMETERISED)
    def test_me_alias_is_accepted(
        self, client, auth_header, inst_db, monkeypatch, leaf
    ):
        """The frontend has always called /api/institutions/me/... — that only
        ever worked because the value was discarded. It is now explicit."""
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, "school-1")
        r = client.get(f"/api/institutions/me/{leaf}", headers=auth_header)
        assert r.status_code == 200, r.text

    def test_admin_with_no_org_cannot_probe_ids(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """An admin account with no institution membership must not be able to
        walk institution ids looking for one that answers."""
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, None)
        r = client.get("/api/institutions/school-1/summary", headers=auth_header)
        assert r.status_code == 403, r.text

    def test_summary_reports_the_resolved_org_not_the_url(
        self, client, auth_header, inst_db, monkeypatch
    ):
        """`institution_code` echoed the raw path value, so calling
        /me/summary reported the institution's code as the literal 'me'."""
        _login_as(inst_db, _user_row(account_type="institution_admin"))
        _org_is(monkeypatch, "school-1")
        r = client.get("/api/institutions/me/summary", headers=auth_header)
        assert r.status_code == 200, r.text
        code = r.json()["data"]["institutionCode"]
        assert code != "me", "the URL segment leaked into the response as data"
        assert code == "school-1"
