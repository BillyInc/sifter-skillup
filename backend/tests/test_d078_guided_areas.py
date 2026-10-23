import json
from pathlib import Path
import sys

import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from d078_guided_areas import (  # noqa: E402
    d078_guided_area_data,
    d078_role_routes_for_key,
    d078_routed_role_keys,
    is_d078_area_id,
)


def _graph_roles():
    graph = json.loads(
        (ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
        .read_text(encoding="utf-8-sig")
    )
    return [row for row in graph["nodes"] if row.get("kind") == "role" and row.get("domain_id") == "D078"]


def _api_roles():
    return [
        {"role_key": f"D078|{role['label']}", "role_name": role["label"]}
        for role in _graph_roles()
    ]


def test_current_d078_areas_and_role_membership_come_from_method_aware_graph():
    data = d078_guided_area_data()
    assert len(data["areas"]) == 7
    assert len(data["rolesByGraphId"]) == 19
    assert sum(len(area["roleRoutes"]) for area in data["areas"]) == 26
    assert sum(route["methodRouteCount"] for routes in data["roleAreas"].values() for route in routes) == 421
    assert all(
        route["methodToRoleFitClaim"] == ["not_inferred_from_area_membership"]
        for routes in data["roleAreas"].values()
        for route in routes
    )
    assert {area["id"] for area in data["areas"]} == data["areaIds"]
    assert is_d078_area_id("D078:sociology-social-anthropology")
    assert not is_d078_area_id("D078|sg:312")


def test_every_graph_role_has_exact_api_identity_and_one_or_more_area_routes():
    role_rows = _api_roles()
    assert len(d078_routed_role_keys(role_rows)) == 19
    for role in _graph_roles():
        api_key = f"D078|{role['label']}"
        routes = d078_role_routes_for_key(api_key)
        assert routes
        assert all(route["roleGraphId"] == role["id"] for route in routes)
        assert all(route["areaId"].startswith("D078:") for route in routes)
    assert len([name for name, routes in d078_guided_area_data()["roleAreas"].items() if len(routes) > 1]) == 7


def test_cross_area_roles_retain_each_canonical_area_join():
    data = d078_guided_area_data()
    assert {route["areaId"] for route in d078_role_routes_for_key("D078|statistician")} == {
        "D078:computational-digital-social-science",
        "D078:social-research-evaluation",
    }
    assert {route["areaId"] for route in d078_role_routes_for_key("D078|criminologist")} == {
        "D078:psychology-social-behaviour",
        "D078:sociology-social-anthropology",
    }
    assert sum(len(area["roleRoutes"]) for area in data["areas"]) == 26


def test_missing_graph_role_api_join_fails_visibly():
    rows = _api_roles()
    rows = [row for row in rows if row["role_key"] != "D078|sociologist"]
    with pytest.raises(ValueError, match="missing=.*sociologist"):
        d078_routed_role_keys(rows)


def test_ambiguous_or_mismatched_graph_role_api_join_fails_visibly():
    rows = _api_roles()
    rows.append(dict(next(row for row in rows if row["role_key"] == "D078|statistician")))
    with pytest.raises(ValueError, match="ambiguous=.*statistician"):
        d078_routed_role_keys(rows)

    mismatched = _api_roles()
    statistician = next(row for row in mismatched if row["role_key"] == "D078|statistician")
    statistician["role_name"] = "sociologist"
    with pytest.raises(ValueError, match="does not resolve"):
        d078_routed_role_keys(mismatched)

    extra_unmapped_role = _api_roles() + [
        {"role_key": "D078|philosopher", "role_name": "philosopher"}
    ]
    assert len(d078_routed_role_keys(extra_unmapped_role)) == 19


def test_route_payload_does_not_claim_unstored_approval_or_method_fit():
    routes = d078_role_routes_for_key("D078|statistician")
    assert routes
    for route in routes:
        assert route["methodSpecificFitClaim"] is False
        assert route["methodToRoleFitClaim"] == ["not_inferred_from_area_membership"]
        assert route["methodRouteCount"] > 0
        assert "studentVisible" not in route
        assert "status" not in route


def test_domain_role_route_visibility_migration_keeps_item_approval_independent():
    migration = (ROOT / "backend/migration_d078_role_route_visibility_2026-10-15.sql").read_text(encoding="utf-8").casefold()
    assert "set student_visible = (" in migration
    assert "route.data_state = 'source_backed'" in migration
    assert "route.positive_task_evidence" in migration
    assert "route.source_references" in migration
    assert "route.route_status = 'conditional'" in migration
    assert "route.scope_condition" in migration
    assert "where route.domain_key = 'd078'" in migration
