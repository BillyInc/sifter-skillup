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
