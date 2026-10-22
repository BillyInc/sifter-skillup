import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from routes import career_routes as cr  # noqa: E402
from d078_guided_areas import d078_guided_area_data  # noqa: E402
from d078_guided_content import (  # noqa: E402
    d078_area_context_items as reviewed_area_context_items,
    d078_domain_context_items as reviewed_domain_context_items,
    d078_role_context_items as reviewed_role_context_items,
)


class _Query:
    def __init__(self, rows):
        self.rows = list(rows)
        self.filters = []
        self.max_rows = None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.filters.append((key, value))
        return self

    def in_(self, key, values):
        self.filters.append((key, set(values)))
        return self

    def like(self, *_args, **_kwargs):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, value):
        self.max_rows = value
        return self

    def execute(self):
        rows = self.rows
        for key, expected in self.filters:
            if isinstance(expected, set):
                rows = [row for row in rows if row.get(key) in expected]
            else:
                rows = [row for row in rows if row.get(key) == expected]
        if self.max_rows is not None:
            rows = rows[: self.max_rows]
        return type("Result", (), {"data": rows})()


class _Service:
    def __init__(self, roles, tables=None):
        self.tables = {
            "domains": [{"id": "domain-uuid", "domain_key": "D078", "name": "Social Sciences"}],
            "domain_roles": roles,
        }
        self.tables.update(tables or {})

    def table(self, name):
        return _Query(self.tables.get(name, []))


def _api_roles():
    graph = d078_guided_area_data()
    roles = graph["rolesByGraphId"].values()
    return [
        {
            "id": f"api:{role['id']}",
            "domain_id": "domain-uuid",
            "role_key": f"D078|{role['label'].casefold()}",
            "role_name": role["label"],
            "data_state": "source_backed",
            "description": f"Reviewed role description for {role['label']}.",
            "source_provenance": {},
        }
        for role in roles
    ]


def _patch_domain_dependencies(monkeypatch, roles):
    monkeypatch.setattr(cr, "_svc", lambda: _Service(roles))
    monkeypatch.setattr(cr, "_published_elite_entity_ids", lambda _kind: set())
    monkeypatch.setattr(cr, "_career_resources", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(cr, "_domain_guidance_foundations", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(cr, "_career_context_items", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(cr, "d078_domain_context_items", lambda: [])
    monkeypatch.setattr(cr, "d078_area_context_items", lambda _area_id: [])


def test_domain_api_serializes_all_graph_area_and_role_joins(monkeypatch):
    roles = _api_roles()
    _patch_domain_dependencies(monkeypatch, roles)

    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    envelope = response.data
    assert envelope["status"] == "real"
    data = envelope["data"]
    areas = data["subgroups"]
    assert len(areas) == 7
    assert len(data["roles"]) == 19
    assert sum(area["roleCount"] for area in areas) == 26
    graph_role_ids = {role["role_key"] for role in roles}
    for area in areas:
        for option in area["areaRoleOptions"]:
            assert option["key"] in graph_role_ids
            assert option["areaId"] == area["id"]
            assert option["roleGraphId"].startswith("role:D078:")
            assert option["methodRouteCount"] > 0
    assert {role["key"] for role in data["roles"]} == graph_role_ids


def test_domain_and_all_area_payloads_include_owned_lane_explanations_and_relationships(monkeypatch):
    roles = _api_roles()
    _patch_domain_dependencies(monkeypatch, roles)
    monkeypatch.setattr(cr, "d078_domain_context_items", reviewed_domain_context_items)
    monkeypatch.setattr(cr, "d078_area_context_items", reviewed_area_context_items)

    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    assert response.data["status"] == "real"
    data = response.data["data"]
    domain_items = data["contextItems"]
    assert domain_items
    for item in domain_items:
        assert item["contextLevel"] == item["guidanceOwner"] == "domain"
        assert item["contextKey"] == "D078"
        assert item["requirementLevel"] in {"needed", "useful", "optional"}
        assert item["requirementReason"].strip()
        assert item["plainMeaning"].strip()
        assert item["contextualUse"].strip()
        for edge in item["relationships"]:
            assert edge["relationshipStatus"] == "source_backed"
            assert edge["relationshipType"] in {
                "builds_on", "works_with", "supports", "alternative", "complements", "qualifies_for"
            }
            assert edge["learnerExplanation"].strip()

    areas = data["subgroups"]
    assert len(areas) == 7
    for area in areas:
        assert area["contextItems"]
        for item in area["contextItems"]:
            assert item["contextLevel"] == item["guidanceOwner"] == "subgroup"
            assert item["contextKey"] == area["id"]
            assert item["requirementLevel"] in {"needed", "useful", "optional"}
            assert item["requirementReason"].strip()
            assert item["plainMeaning"].strip()
            assert item["contextualUse"].strip()
            for edge in item["relationships"]:
                assert edge["relationshipStatus"] == "source_backed"
                assert edge["relationshipType"] in {
                    "builds_on", "works_with", "supports", "alternative", "complements", "qualifies_for"
                }
                assert edge["learnerExplanation"].strip()

    # Each canonical-area endpoint resolves through the same D078 response
    # builder and retains its own item/role scope instead of a legacy subgroup.
    for area_id in d078_guided_area_data()["areaIds"]:
        area_response = asyncio.run(cr.get_subgroup(area_id, programme_id=None))
        assert area_response.data["status"] == "real"
        area_payload = next(
            area for area in area_response.data["data"]["subgroups"]
            if area["id"] == area_id
        )
        assert area_payload["contextItems"]
        assert all(item["contextKey"] == area_id for item in area_payload["contextItems"])


def test_domain_api_resolves_sociology_programme_context_only_from_approved_evidence(monkeypatch):
    roles = _api_roles()
    service = _Service(roles, {
        "programmes": [{"id": "sociology-programme", "name": "Sociology"}],
        "programme_domain": [{
            "programme_id": "sociology-programme",
            "domain_id": "domain-uuid",
            "match_type": "direct",
        }],
        "programme_domain_evidence": [{
            "programme_id": "sociology-programme",
            "domain_id": "domain-uuid",
            "match_type": "direct",
            "course_anchors": [{"title": "Introduction to Sociology", "code": "SOC 101", "matched_anchors": ["SOC 101"]}],
            "transferable_evidence": [{"evidence": "Analyses social structures and society dynamics."}],
            "source_review_required": False,
            "review_required": False,
            "data_state": "source_backed",
            "source_provenance": {},
        }],
    })
    monkeypatch.setattr(cr, "_svc", lambda: service)
    monkeypatch.setattr(cr, "_published_elite_entity_ids", lambda _kind: set())
    monkeypatch.setattr(cr, "_career_resources", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(cr, "_domain_guidance_foundations", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(cr, "_career_context_items", lambda *_args, **_kwargs: [])
    monkeypatch.setattr(cr, "d078_domain_context_items", reviewed_domain_context_items)
    monkeypatch.setattr(cr, "d078_area_context_items", reviewed_area_context_items)
    monkeypatch.setattr(cr, "_programme_curriculum_contract", lambda *_args: {
        "status": "available", "outcomes": [], "programmeThemes": []
    })

    response = asyncio.run(cr.get_domain("D078", programme_id="sociology-programme"))
    assert response.data["status"] == "real"
    connection = response.data["data"]["programmeConnection"]
    assert connection["programmeId"] == "sociology-programme"
    assert connection["programmeName"] == "Sociology"
    assert connection["relationship"] == "direct"
    assert connection["courseAnchors"][0]["title"] == "Introduction to Sociology"
    assert connection["explanation"].strip()


def test_role_payload_includes_selected_area_and_reviewed_inherited_items_without_legacy_skills(monkeypatch):
    role = next(row for row in _api_roles() if row["role_key"] == "D078|statistician")
    role["essential_skills"] = ["legacy aggregate essential skill"]
    role["optional_skills"] = ["legacy aggregate optional skill"]
    _patch_domain_dependencies(monkeypatch, [role])
    monkeypatch.setattr(cr, "d078_role_context_items", reviewed_role_context_items)
    monkeypatch.setattr(cr, "d078_domain_context_items", reviewed_domain_context_items)
    monkeypatch.setattr(cr, "d078_area_context_items", reviewed_area_context_items)
    role_resource = {
        "id": "role-owned-statistician-resource",
        "roleId": role["id"],
        "ownershipScope": "role",
        "reviewStatus": "approved_guidance_v1",
        "resourceType": "skill_learning",
        "targetName": "Statistical methods guide",
        "url": "https://example.org/statistical-methods",
        "dataState": "source_backed",
        "sourceProvenance": {"guidance_owner": "role", "ownership": "role_owned"},
    }
    unrelated_resource = {
        **role_resource,
        "id": "unrelated-subgroup-resource",
        "ownershipScope": "subgroup",
        "sourceProvenance": {"guidance_owner": "subgroup", "ownership": "subgroup_owned"},
    }
    audit_resource = {
        **role_resource,
        "id": "audit-only-resource",
        "ownershipScope": "audit_only",
        "sourceProvenance": {"guidance_owner": "audit_only", "ownership": "audit_only"},
    }
    monkeypatch.setattr(
        cr,
        "_career_resources",
        lambda *_args, **_kwargs: [role_resource, unrelated_resource, audit_resource],
    )

    selected_area = "D078:social-research-evaluation"
    response = asyncio.run(
        cr.get_role("D078|statistician", programme_id=None, area_id=selected_area)
    )
    assert response.data["status"] == "real"
    data = response.data["data"]
    assert data["subgroupId"] == selected_area
    assert data["parentContext"]["subgroupId"] == selected_area
    assert len(data["parentContext"]["domainItems"]) >= 3
    assert data["parentContext"]["subgroupItems"]
    assert data["contextItems"]
    assert data["resources"] == [role_resource]
    assert data["essentialSkills"] == []
    assert data["optionalSkills"] == []
    assert "legacy aggregate essential skill" not in data["essentialSkills"]
    assert "legacy aggregate optional skill" not in data["optionalSkills"]
    for item in data["parentContext"]["domainItems"]:
        assert item["contextLevel"] == item["guidanceOwner"] == "domain"
        assert item["requirementLevel"] and item["requirementReason"]
    for item in data["parentContext"]["subgroupItems"]:
        assert item["contextLevel"] == item["guidanceOwner"] == "subgroup"
        assert item["contextKey"] == selected_area
        assert item["requirementLevel"] and item["requirementReason"]
    for item in data["contextItems"]:
        assert item["contextLevel"] == item["guidanceOwner"] == "role"
        assert item["contextKey"] == "D078|statistician"
        assert item["requirementLevel"] in {"needed", "useful", "optional"}
        assert item["requirementReason"].strip()
        assert item["plainMeaning"].strip()
        assert item["contextualUse"].strip()


def test_role_endpoints_resolve_all_19_graph_roles_only_under_connected_areas(monkeypatch):
    roles = _api_roles()
    _patch_domain_dependencies(monkeypatch, roles)
    monkeypatch.setattr(cr, "d078_role_context_items", reviewed_role_context_items)
    monkeypatch.setattr(cr, "d078_domain_context_items", reviewed_domain_context_items)
    monkeypatch.setattr(cr, "d078_area_context_items", reviewed_area_context_items)
    routes = d078_guided_area_data()["roleAreasByKey"]
    assert len(routes) == 19
    api_role_keys = {row["role_key"].casefold(): row["role_key"] for row in roles}
    for role_key, role_routes in routes.items():
        selected_area = role_routes[0]["areaId"]
        api_role_key = api_role_keys.get(role_key.casefold())
        assert api_role_key is not None, role_key
        response = asyncio.run(cr.get_role(api_role_key, programme_id=None, area_id=selected_area))
        assert response.data["status"] == "real", (role_key, response.data)
        data = response.data["data"]
        assert data["key"].casefold() == role_key.casefold()
        assert data["subgroupId"] == selected_area
        assert any(route["areaId"] == selected_area for route in data["areaRoutes"])
        assert data["contextItems"], role_key
        assert all(item["guidanceOwner"] == item["contextLevel"] == "role" for item in data["contextItems"])
        assert data["essentialSkills"] == []
        assert data["optionalSkills"] == []


def test_role_api_carries_sociology_programme_connection_from_domain_envelope(monkeypatch):
    role = next(row for row in _api_roles() if row["role_key"] == "D078|sociologist")
    _patch_domain_dependencies(monkeypatch, [role])
    monkeypatch.setattr(cr, "d078_role_context_items", reviewed_role_context_items)
    connection = {"programmeId": "sociology-programme", "programmeName": "Sociology", "relationship": "direct"}

    async def domain_response(_domain_key, *, programme_id):
        assert programme_id == "sociology-programme"
        return cr.ResponseModel(data=cr._real({"programmeConnection": connection}))

    monkeypatch.setattr(cr, "get_domain", domain_response)
    response = asyncio.run(cr.get_role(
        "D078|sociologist",
        programme_id="sociology-programme",
        area_id="D078:sociology-social-anthropology",
    ))
    assert response.data["status"] == "real"
    assert response.data["data"]["programmeConnection"] == connection


def test_domain_api_keeps_reviewed_role_resources_in_the_matching_role_bucket(monkeypatch):
    roles = _api_roles()
    statistician = next(role for role in roles if role["role_key"] == "D078|statistician")
    resource = {
        "id": "statistician-learning-resource",
        "roleId": statistician["id"],
        "ownershipScope": "role",
        "reviewStatus": "approved_guidance_v1",
        "resourceType": "skill_reference",
        "targetName": "Statistical analysis reference",
        "url": "https://example.org/statistics",
        "dataState": "source_backed",
        "sourceProvenance": {"guidance_owner": "role", "ownership": "role_owned"},
    }
    _patch_domain_dependencies(monkeypatch, roles)
    calls = []

    def resources(_svc, **kwargs):
        calls.append(kwargs)
        return [resource] if kwargs.get("include_role", True) else []

    monkeypatch.setattr(cr, "_career_resources", resources)

    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    envelope = response.data
    assert envelope["status"] == "real"
    data = envelope["data"]
    statistician_payload = next(role for role in data["roles"] if role["key"] == "D078|statistician")
    assert statistician_payload["resources"] == [resource]
    assert data["resources"] == []
    assert calls and calls[0].get("include_role", True) is True


def test_domain_api_returns_pending_envelope_for_missing_or_ambiguous_role_join(monkeypatch):
    missing = [row for row in _api_roles() if row["role_key"] != "D078|sociologist"]
    _patch_domain_dependencies(monkeypatch, missing)
    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    assert response.data["status"] == "coming_soon"
    assert response.data["data"] is None


def test_domain_api_does_not_attach_unmapped_legacy_role_to_an_area(monkeypatch):
    roles = _api_roles()
    roles.append({
        "id": "legacy-philosopher",
        "domain_id": "domain-uuid",
        "role_key": "D078|philosopher",
        "role_name": "philosopher",
        "data_state": "source_backed",
        "description": "Legacy role row without a current graph area join.",
        "source_provenance": {},
    })
    _patch_domain_dependencies(monkeypatch, roles)

    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    assert response.data["status"] == "real"
    data = response.data["data"]
    assert len(data["roles"]) == 19
    assert all(role["key"] != "D078|philosopher" for role in data["roles"])
    assert all(
        option["key"] != "D078|philosopher"
        for area in data["subgroups"]
        for option in area["areaRoleOptions"]
    )


def test_domain_api_fails_visibly_if_graph_role_is_hidden_by_api_state(monkeypatch):
    roles = _api_roles()
    statistician = next(role for role in roles if role["role_key"] == "D078|statistician")
    statistician["data_state"] = "review_only"
    _patch_domain_dependencies(monkeypatch, roles)

    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    assert response.data["status"] == "coming_soon"
    assert response.data["data"] is None

    ambiguous = _api_roles()
    ambiguous.append(dict(next(row for row in ambiguous if row["role_key"] == "D078|statistician")))
    _patch_domain_dependencies(monkeypatch, ambiguous)
    response = asyncio.run(cr.get_domain("D078", programme_id=None))
    assert response.data["status"] == "coming_soon"
    assert response.data["data"] is None


def test_role_api_uses_exact_graph_identity_and_selected_area_context(monkeypatch):
    role = next(row for row in _api_roles() if row["role_key"] == "D078|statistician")
    _patch_domain_dependencies(monkeypatch, [role])
    monkeypatch.setattr(cr, "_student_role_skill_lists", lambda _role: ([], []))
    monkeypatch.setattr(cr, "d078_role_context_items", lambda _key: [])
    monkeypatch.setattr(cr, "merge_d078_context_items", lambda base, extra: list(base) + list(extra))

    selected_area = "D078:social-research-evaluation"
    response = asyncio.run(cr.get_role("D078|statistician", programme_id=None, area_id=selected_area))
    envelope = response.data
    assert envelope["status"] == "real"
    data = envelope["data"]
    assert data["key"] == "D078|statistician"
    assert set(data["areaIds"]) == {
        "D078:computational-digital-social-science",
        "D078:social-research-evaluation",
    }
    assert data["subgroupId"] == selected_area
    assert data["parentContext"]["subgroupId"] == selected_area
    assert data["areaRoutes"]


def test_role_api_rejects_a_mismatched_graph_role_name(monkeypatch):
    role = next(row for row in _api_roles() if row["role_key"] == "D078|statistician")
    role["role_name"] = "sociologist"
    _patch_domain_dependencies(monkeypatch, [role])
    response = asyncio.run(cr.get_role("D078|statistician", programme_id=None, area_id=None))
    assert response.data["status"] == "coming_soon"
    assert response.data["data"] is None


def test_role_api_rejects_an_area_not_linked_to_the_selected_role(monkeypatch):
    role = next(row for row in _api_roles() if row["role_key"] == "D078|statistician")
    _patch_domain_dependencies(monkeypatch, [role])
    response = asyncio.run(
        cr.get_role(
            "D078|statistician",
            programme_id=None,
            area_id="D078:sociology-social-anthropology",
        )
    )
    assert response.data["status"] == "coming_soon"
    assert response.data["data"] is None


def test_role_api_requires_an_explicit_area_for_area_scoped_d078_roles(monkeypatch):
    role = next(row for row in _api_roles() if row["role_key"] == "D078|sociologist")
    _patch_domain_dependencies(monkeypatch, [role])
    response = asyncio.run(
        cr.get_role("D078|sociologist", programme_id=None, area_id=None)
    )
    assert response.data["status"] == "coming_soon"
    assert response.data["data"] is None

    connected_area = "D078:sociology-social-anthropology"
    response = asyncio.run(
        cr.get_role("D078|sociologist", programme_id=None, area_id=connected_area)
    )
    assert response.data["status"] == "real"
    assert response.data["data"]["subgroupId"] == connected_area
