from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from d078_guided_areas import d078_guided_area_data, d078_routed_role_keys, is_d078_area_id  # noqa: E402


def test_current_d078_areas_are_the_seven_catalog_areas():
    data = d078_guided_area_data()
    assert len(data["areas"]) == 7
    assert all(area["id"].startswith("D078:") for area in data["areas"])
    assert {area["name"] for area in data["areas"]} == {
        "Sociology and Social Anthropology",
        "Economics and Applied Economic Analysis",
        "Politics, Governance and Public Policy",
        "Social Behaviour and Interaction",
        "Human Geography and Population Studies",
        "Social Research and Evaluation",
        "Computational and Digital Social Science",
    }
    assert all("Computational Science" not in area["name"] for area in data["areas"])
    assert is_d078_area_id("D078:sociology-social-anthropology")
    assert not is_d078_area_id("D078|sg:312")


def test_each_area_has_a_separated_explanatory_student_overview():
    data = d078_guided_area_data()
    assert all(len(area["description"].split()) >= 35 for area in data["areas"])
    assert all(area["description"].count(".") >= 2 for area in data["areas"])
    computational = next(area for area in data["areas"] if area["id"] == "D078:computational-digital-social-science")
    assert "not a universal requirement" in computational["description"]


def test_role_routes_are_available_by_normalized_role_label():
    data = d078_guided_area_data()
    all_routes = [route for routes in data["roleAreas"].values() for route in routes]
    assert all_routes
    assert {route["status"] for route in all_routes} <= {
        "reviewed_supported",
        "reviewed_conditional",
    }
    assert all(route["areaId"] in data["areaIds"] for route in all_routes)
    assert all(route["areaId"] for route in data["roleAreas"].get("sociologist", []))


def test_every_canonical_area_keeps_its_reviewed_role_routes():
    data = d078_guided_area_data()
    assert [len(area["roleRoutes"]) for area in data["areas"]] == [7, 6, 4, 3, 3, 2, 1]
    assert all(area["roleRoutes"] for area in data["areas"])
    assert all(
        route["status"] in {"reviewed_supported", "reviewed_conditional"}
        for area in data["areas"]
        for route in area["roleRoutes"]
    )
    assert all(
        route["condition"]
        for area in data["areas"]
        for route in area["roleRoutes"]
        if route["status"] == "reviewed_conditional"
    )
    assert all(
        route["studentVisible"] is True
        for area in data["areas"]
        for route in area["roleRoutes"]
    )
    assert all(
        route["sourceReferences"] and route["positiveTaskEvidence"] and route["rationale"]
        for area in data["areas"]
        for route in area["roleRoutes"]
    )
    assert all(
        route["domainRouteStatus"] in {"reviewed_supported", "reviewed_conditional"}
        and route["domainRouteReason"]
        and route["domainRouteSources"]
        for area in data["areas"]
        for route in area["roleRoutes"]
    )
    assert all(
        route["domainRouteCondition"]
        for area in data["areas"]
        for route in area["roleRoutes"]
        if route["domainRouteStatus"] == "reviewed_conditional"
    )


def test_roles_with_multiple_reviewed_area_routes_keep_each_route():
    data = d078_guided_area_data()
    assert {
        area_id
        for area_id in (
            route["areaId"] for route in data["roleAreas"]["criminologist"]
        )
    } == {
        "D078:psychology-social-behaviour",
        "D078:sociology-social-anthropology",
    }
    assert {
        area_id
        for area_id in (
            route["areaId"] for route in data["roleAreas"]["statistician"]
        )
    } == {
        "D078:computational-digital-social-science",
        "D078:social-research-evaluation",
    }


def test_every_reviewed_d078_role_has_a_selectable_area_route():
    data = d078_guided_area_data()
    role_names = {
        route["roleName"].casefold()
        for area in data["areas"]
        for route in area["roleRoutes"]
    }
    assert len(role_names) == 19
    assert "philosopher" not in role_names
    assert len([name for name, routes in data["roleAreas"].items() if len(routes) > 1]) == 7
    assert all(routes for routes in data["roleAreas"].values())
    assert {
        route["roleName"].casefold()
        for area in data["areas"]
        for route in area["roleRoutes"]
        if route["domainRouteStatus"] == "reviewed_conditional"
    } == {
        "archaeologist",
        "genealogist",
        "thanatology researcher",
        "statistician",
        "geographer",
    }


def test_role_card_availability_comes_from_current_route_evidence_not_item_seed_flag():
    rows = [
        {"role_key": f"D078|{name}", "role_name": name}
        for name in d078_guided_area_data()["roleAreas"]
    ]
    assert len(d078_routed_role_keys(rows)) == 19
    # No guidanceAvailable/student_visible field is needed on these rows: the
    # reviewed cross-area route is the dynamic role-card availability source.
    assert "d078|sociologist" in d078_routed_role_keys(rows)
    assert "d078|philosopher" not in d078_routed_role_keys(rows)


def test_taxonomy_seed_recomputes_role_visibility_from_evidence_not_a_fixed_release_list():
    root = Path(__file__).resolve().parents[2]
    migration = (root / "backend/migration_d078_role_route_visibility_2026-10-15.sql").read_text(encoding="utf-8").casefold()
    seed = (root / "backend/seed_d078_specialization_taxonomy_2026-10-12.sql").read_text(encoding="utf-8").casefold()
    # The migration is the dynamic recomputation gate. The seed supplies the
    # individually reviewed route rows and their starting flags; it does not
    # contain a second copied SQL gate that can drift from the migration.
    assert "set student_visible = (" in migration
    assert "route.data_state = 'source_backed'" in migration
    assert "route.positive_task_evidence" in migration
    assert "route.source_references" in migration
    assert "route.route_status = 'conditional'" in migration
    assert "route.scope_condition" in migration
    assert "where route.domain_key = 'd078'" in migration
    assert "role_name in (" not in migration
    assert "insert into skillup_dev.career_role_area_routes" in seed
    assert "student_visible" in seed
    assert "'supported'" in seed and "'conditional'" in seed
    assert "role_name in (" not in seed


def test_current_graph_route_flags_are_reconciled_without_promoting_the_whole_graph():
    root = Path(__file__).resolve().parents[2]
    graph_path = root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
    import json

    graph = json.loads(graph_path.read_text(encoding="utf-8-sig"))
    summary = graph["route_visibility_reconciliation"]
    role_ids = {
        node["id"]
        for node in graph["nodes"]
        if node.get("kind") == "role" and node.get("domain_id") == "D078"
    }
    domain_edges = [
        edge for edge in graph["edges"]
        if edge.get("relationship") == "domain_to_role" and edge.get("target") in role_ids
    ]
    area_edges = [
        edge for edge in graph["edges"]
        if edge.get("relationship") == "area_to_role" and edge.get("target") in role_ids
    ]
    assert all(edge.get("student_visible") is True for edge in domain_edges)
    assert all(edge.get("student_visible") is True for edge in area_edges)
    assert all(edge.get("visibility_scope") == "selectable_role_route" for edge in domain_edges + area_edges)
    assert all(
        node.get("student_visible") is True
        for node in graph["nodes"]
        if node.get("kind") == "role" and node.get("domain_id") == "D078"
    )
    assert summary["visible_role_cards"] == len(role_ids)
    assert summary["roles_with_multiple_area_routes"] == 7
    assert summary["learning_item_visibility_changed"] is False
    assert graph["student_visible"] is False
    # The dependency design is complete even while the graph artifact remains
    # an internal model. Student release is governed separately by the
    # contextual-content/API and rendered-UI gates.
    assert graph["final_graph_ready"] is True
    assert graph["learning_path_design"]["branch_semantics"]["role_additions_are_only_added_for_selected_role"] is True
