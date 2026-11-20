from types import SimpleNamespace

import pytest
from fastapi import HTTPException


class _Query:
    def __init__(self, table, rows):
        self.table = table
        self.rows = rows
        self.filters = {}

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.filters[key] = value
        return self

    def neq(self, key, value):
        self.filters[f"not_{key}"] = value
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def execute(self):
        data = [row for row in self.rows.get(self.table, []) if all(
            row.get(key) != value if key.startswith("not_")
            else row.get(key) == value
            for key, value in self.filters.items()
        )]
        return SimpleNamespace(data=data)


class _Service:
    def __init__(self, rows):
        self.rows = rows

    def table(self, name):
        return _Query(name, self.rows)


def test_provisioning_uses_the_explicit_active_school_membership(monkeypatch):
    import routes.provisioning_routes as routes

    rows = {
        "institution_members": [
            {"user_id": "owner-1", "school_id": "provider-1", "seat_status": "active"},
            {"user_id": "owner-1", "school_id": "school-1", "seat_status": "active"},
        ],
        "schools": [
            {"id": "provider-1", "institution_type": "tutorial_centre"},
            {"id": "school-1", "institution_type": "secondary_school"},
        ],
    }
    monkeypatch.setattr(routes, "_svc", lambda: _Service(rows))

    assert routes._provisioning_context({"id": "owner-1"}, "school-1") == (
        "school-1",
        "secondary_school",
    )


def test_provisioning_rejects_an_organisation_the_user_does_not_belong_to(monkeypatch):
    import routes.provisioning_routes as routes

    monkeypatch.setattr(
        routes,
        "_svc",
        lambda: _Service({"institution_members": [], "schools": []}),
    )

    with pytest.raises(HTTPException) as error:
        routes._provisioning_context({"id": "owner-1"}, "school-not-owned")
    assert error.value.status_code == 403


def test_provisioning_rejects_a_revoked_selected_membership(monkeypatch):
    import routes.provisioning_routes as routes

    monkeypatch.setattr(
        routes,
        "_svc",
        lambda: _Service({
            "institution_members": [
                {"user_id": "owner-1", "school_id": "school-1", "seat_status": "revoked"}
            ],
            "schools": [{"id": "school-1", "institution_type": "secondary_school"}],
        }),
    )

    with pytest.raises(HTTPException) as error:
        routes._provisioning_context({"id": "owner-1"}, "school-1")
    assert error.value.status_code == 403


@pytest.mark.parametrize("stage", ["ss1", "ss2", "ss3"])
def test_secondary_schools_can_provision_each_secondary_stage(stage):
    import routes.provisioning_routes as routes

    assert routes._validate_provisioning_type(stage, "secondary_school") == stage


def test_tutorial_centres_remain_jamb_only():
    import routes.provisioning_routes as routes

    assert routes._validate_provisioning_type("jamb", "tutorial_centre") == "jamb"
    with pytest.raises(HTTPException) as error:
        routes._validate_provisioning_type("ss1", "tutorial_centre")
    assert error.value.status_code == 403


def test_tutorial_centres_start_learners_at_olevel_and_utme():
    import routes.provisioning_routes as routes

    for org in ("tutorial_centre", "jamb_cafe"):
        # O-level is the existing "ss3" starting point; UTME is "jamb".
        assert routes._validate_provisioning_type("ss3", org) == "ss3"
        assert routes._validate_provisioning_type("jamb", org) == "jamb"
        for stage in ("ss1", "ss2", "undergraduate", "", None):
            with pytest.raises(HTTPException) as error:
                routes._validate_provisioning_type(stage, org)
            assert error.value.status_code in (400, 403)


def test_secondary_schools_still_cannot_create_utme_accounts():
    import routes.provisioning_routes as routes

    with pytest.raises(HTTPException) as error:
        routes._validate_provisioning_type("jamb", "secondary_school")
    assert error.value.status_code == 403


def test_tutorial_olevel_guidance_context_has_no_stream():
    import routes.provisioning_routes as routes

    for org in ("tutorial_centre", "jamb_cafe"):
        assert routes._guidance_context_is_allowed(org, "ss3", None, None)
        assert routes._guidance_context_is_allowed(org, "jamb", None, None)
        assert not routes._guidance_context_is_allowed(org, "ss3", None, "science")
        assert not routes._guidance_context_is_allowed(org, "ss1", None, None)
    # Secondary schools keep requiring a stream; universities stay undergraduate.
    assert not routes._guidance_context_is_allowed("secondary_school", "ss3", None, None)
    assert routes._guidance_context_is_allowed("secondary_school", "ss3", None, "science")
    assert not routes._guidance_context_is_allowed("university", "ss3", None, None)


def test_secondary_school_owner_may_use_the_bulk_flow_but_university_may_not(monkeypatch):
    """/drafts (bulk import) and /generate share _provisioning_context: the only
    organisation type refused is university, so secondary schools can bulk create."""
    import routes.provisioning_routes as routes

    rows = {
        "institution_members": [
            {"user_id": "owner-1", "school_id": "school-1", "seat_status": "active"},
            {"user_id": "owner-2", "school_id": "uni-1", "seat_status": "active"},
        ],
        "schools": [
            {"id": "school-1", "institution_type": "secondary_school"},
            {"id": "uni-1", "institution_type": "university"},
        ],
    }
    monkeypatch.setattr(routes, "_svc", lambda: _Service(rows))

    assert routes._provisioning_context({"id": "owner-1"}) == ("school-1", "secondary_school")
    with pytest.raises(HTTPException) as error:
        routes._provisioning_context({"id": "owner-2"})
    assert error.value.status_code == 403
    # A user with no membership cannot reach the flow at all.
    with pytest.raises(HTTPException) as error:
        routes._provisioning_context({"id": "student-1"})
    assert error.value.status_code == 409


def test_provisioning_endpoints_require_admin_account_type():
    """Authorization stays server-side: both bulk endpoints depend on require_admin."""
    import inspect
    import routes.provisioning_routes as routes

    for name in ("create_drafts", "generate_accounts"):
        source = inspect.getsource(getattr(routes, name))
        assert "Depends(Auth.require_admin)" in source, name
