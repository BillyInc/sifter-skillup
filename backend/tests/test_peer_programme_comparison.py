import asyncio
from types import SimpleNamespace

import pytest


class Query:
    def __init__(self, rows):
        self.rows = rows
        self.filters = []

    def select(self, *_args, **_kwargs):
        return self

    def in_(self, key, values):
        self.filters.append(("in", key, set(map(str, values))))
        return self

    def eq(self, key, value):
        self.filters.append(("eq", key, str(value)))
        return self

    def limit(self, *_args):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def execute(self):
        rows = self.rows
        for kind, key, value in self.filters:
            if kind == "in":
                rows = [row for row in rows if str(row.get(key)) in value]
            else:
                rows = [row for row in rows if str(row.get(key)) == value]
        return SimpleNamespace(data=rows)


class FakeService:
    def __init__(self):
        self.rows = {
            "schools": [
                {"id": "school-a", "name": "Current University", "institution_type": "university"},
                {"id": "school-b", "name": "Peer University", "institution_type": "university"},
            ],
            "school_programmes": [
                {"id": "offer-a1", "school_id": "school-a", "jamb_programme_id": "jamb-accounting"},
                {"id": "offer-b1", "school_id": "school-b", "jamb_programme_id": "jamb-accounting"},
                {"id": "offer-b2", "school_id": "school-b", "jamb_programme_id": "jamb-health"},
                # Same visible title, but a distinct JAMB identity/faculty
                # context: it must not collapse into the shared Accounting row.
                {"id": "offer-b3", "school_id": "school-b", "jamb_programme_id": "jamb-accounting-social"},
            ],
            "jamb_programmes": [
                {"id": "jamb-accounting", "jamb_name": "Accounting", "jamb_faculty": "Administration"},
                {"id": "jamb-health", "jamb_name": "Public Health", "jamb_faculty": "Medical"},
                {"id": "jamb-accounting-social", "jamb_name": "Accounting", "jamb_faculty": "Social Sciences"},
            ],
            "programme_mapping": [
                {"jamb_programme_id": "jamb-accounting", "programme_id": "p-accounting"},
                {"jamb_programme_id": "jamb-health", "programme_id": "p-health"},
                {"jamb_programme_id": "jamb-accounting-social", "programme_id": "p-accounting-social"},
            ],
            "domain_subgroups": [
                {"id": "sg-finance", "domain_id": "d-finance"},
                {"id": "sg-health", "domain_id": "d-health"},
            ],
            "domain_roles": [
                {"id": "role-1", "domain_id": "d-finance"},
                {"id": "role-2", "domain_id": "d-finance"},
                {"id": "role-3", "domain_id": "d-health"},
            ],
        }

    def table(self, name):
        return Query(self.rows.get(name, []))


def test_university_comparison_lists_peer_only_offerings_and_exact_reach(monkeypatch):
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "_svc", lambda: FakeService())
    monkeypatch.setattr(ir, "_assert_own_institution", lambda _path, _user: "school-a")
    monkeypatch.setattr(ir, "_org_from_school", lambda _school: SimpleNamespace(type="university"))
    monkeypatch.setattr(
        ir,
        "_programme_domain_rows",
        lambda ids, cap=4000: [
            {"programme_id": "p-accounting", "domain_id": "d-finance"},
            {"programme_id": "p-health", "domain_id": "d-health"},
            {"programme_id": "p-accounting-social", "domain_id": "d-social-finance"},
        ] if ids else [],
    )

    response = asyncio.run(ir.get_peer_programme_comparison(
        peer_school_id="school-b", current_user={"id": "admin-a"},
    ))
    data = response.data
    assert data["current"]["institutionId"] == "school-a"
    assert data["peer"]["institutionId"] == "school-b"
    public_health = next(
        row for row in data["programmesPeerTeachesNotCurrent"]
        if row["jambProgrammeId"] == "jamb-health"
    )
    assert public_health["programmeName"] == "Public Health"
    assert public_health["offeringId"] == "offer-b2"
    assert public_health["domainsAccessible"] == 1
    assert public_health["specializationsAccessible"] == 1
    assert public_health["rolesAccessible"] == 1
    same_name_different_context = next(
        row for row in data["programmesPeerTeachesNotCurrent"]
        if row["jambProgrammeId"] == "jamb-accounting-social"
    )
    assert same_name_different_context["programmeName"] == "Accounting"
    assert same_name_different_context["jambFaculty"] == "Social Sciences"
    assert same_name_different_context["offeringId"] == "offer-b3"
    assert data["programmesBothTeach"][0]["current"]["jambProgrammeId"] == "jamb-accounting"
    assert data["programmesBothTeach"][0]["current"]["offeringId"] == "offer-a1"
    assert data["programmesBothTeach"][0]["peer"]["offeringId"] == "offer-b1"
    assert data["peer"]["demandStatus"] == "coming_soon"
    assert data["peer"]["domainsInDemand"] is None


def test_non_university_admin_must_choose_both_universities(monkeypatch):
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "_assert_own_institution", lambda _path, _user: "school-owner")
    monkeypatch.setattr(ir, "_org_from_school", lambda _school: SimpleNamespace(type="secondary_school"))
    with pytest.raises(ir.HTTPException) as exc:
        asyncio.run(ir.get_peer_programme_comparison(peer_school_id="school-b", current_user={"id": "admin"}))
    assert exc.value.status_code == 422


def test_school_owner_can_compare_two_selected_universities(monkeypatch):
    import routes.institutions_routes as ir

    monkeypatch.setattr(ir, "_svc", lambda: FakeService())
    monkeypatch.setattr(ir, "_assert_own_institution", lambda _path, _user: "school-owner")
    monkeypatch.setattr(ir, "_org_from_school", lambda _school: SimpleNamespace(type="secondary_school"))
    monkeypatch.setattr(ir, "_programme_domain_rows", lambda ids, cap=4000: [])

    response = asyncio.run(ir.get_peer_programme_comparison(
        peer_school_id="school-b",
        compare_school_id="school-a",
        current_user={"id": "school-admin"},
    ))
    assert response.data["current"]["institutionId"] == "school-a"
    assert response.data["peer"]["institutionId"] == "school-b"
