"""Verify candidate-level D078 visibility, selectability, and route boundaries."""
from __future__ import annotations

import gzip
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
UI_DATA = ROOT / "src/data/d078MethodAwareUiData.json"

spec = importlib.util.spec_from_file_location("d078_candidate_routes", AUDIT / "repair_d078_relationship_routes_2026_10_20.py")
if spec is None or spec.loader is None:
    raise RuntimeError("Cannot load the reviewed method/area route map")
route_map = importlib.util.module_from_spec(spec)
spec.loader.exec_module(route_map)
ROUTES = {item: methods for item, methods in route_map.ROUTES.items() if item.startswith("domain-emerging:")}
CONDITIONAL = {
    "domain-emerging:d078-emerging-ai-social-impact-assessment",
    "domain-emerging:d078-emerging-ai-use-validation-and-provenance",
}
ROUTE_FIELDS = ("task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids", "tool_ids", "domain_tool_ids")


def fail(message: str) -> None:
    raise SystemExit(message)


def main() -> None:
    with gzip.open(GRAPH, "rt", encoding="utf-8") as stream:
        graph = json.load(stream)
    ui = json.loads(UI_DATA.read_text(encoding="utf-8"))
    nodes = {node["id"]: node for node in graph["nodes"]}
    ui_nodes = ui["nodes_by_id"]
    areas = {route["area_id"] for route in graph["method_area_routes"]}
    expected_single: set[tuple[str, str, str]] = set()
    actual_single: set[tuple[str, str, str]] = set()

    for item_id, methods in ROUTES.items():
        node = nodes.get(item_id)
        if not node:
            fail(f"Candidate missing from canonical graph: {item_id}")
        expected_lane = "conditional" if item_id in CONDITIONAL else "optional"
        for field, expected in (("student_visible", True), ("selectable", True), ("skippable", True), ("blocking_policy", "never"), ("requirement_lane", expected_lane)):
            if node.get(field) != expected:
                fail(f"{item_id}: expected {field}={expected!r}, got {node.get(field)!r}")
        if not node.get("meaning") or not node.get("route_display_condition"):
            fail(f"Candidate lacks student-facing explanation/condition: {item_id}")
        if item_id not in ui_nodes or ui_nodes[item_id].get("student_visible") is not True or ui_nodes[item_id].get("selectable") is not True:
            fail(f"Candidate missing or hidden in the compact UI graph: {item_id}")

        allowed_areas = route_map.ITEM_AREAS.get(item_id)
        for method_id in methods:
            for area_id in areas:
                route = next((row for row in graph["method_area_routes"] if row["method_id"] == method_id and row["area_id"] == area_id), None)
                if route is None:
                    continue
                should_route = allowed_areas is None or area_id in allowed_areas
                if should_route:
                    expected_single.add((item_id, method_id, area_id))
                has_route = any(item_id in route.get(field, []) for field in ROUTE_FIELDS)
                if has_route != should_route:
                    fail(f"Incorrect single-method placement: {item_id} / {method_id} / {area_id}")
        if node.get("item_type") == "tool" and item_id not in ui_nodes:
            fail(f"Tool candidate has no UI node: {item_id}")

    for route in graph["method_area_routes"]:
        for field in ROUTE_FIELDS:
            for item_id in route.get(field, []):
                if item_id in ROUTES:
                    actual_single.add((item_id, route["method_id"], route["area_id"]))
    if actual_single != expected_single:
        fail(f"Single-route inventory mismatch: expected {len(expected_single)}, found {len(actual_single)}")

    expected_combo: set[tuple[str, str, str, str]] = set()
    actual_combo: set[tuple[str, str, str, str]] = set()
    for design in graph["combination_designs"]:
        members = set(design.get("method_ids", []))
        route_records = [(design["id"], route) for route in design.get("area_routes", [])]
        route_records += [
            (variant["id"], route)
            for variant in design.get("component_route_variants", [])
            for route in variant.get("area_routes", [])
        ]
        for route_id, route in route_records:
            area_id = route["area_id"]
            for contribution in route.get("method_contributions", []):
                method_id = contribution.get("method_id")
                if method_id not in members and not any(method_id in v.get("selected_component_method_ids", []) for v in design.get("component_route_variants", [])):
                    fail(f"Combination contains an unrelated method contribution: {design['id']}/{method_id}")
                for item_id, methods in ROUTES.items():
                    allowed_areas = route_map.ITEM_AREAS.get(item_id)
                    if method_id in methods and (allowed_areas is None or area_id in allowed_areas):
                        expected_combo.add((route_id, area_id, method_id, item_id))
                    if any(item_id in contribution.get(field, []) for field in ROUTE_FIELDS):
                        actual_combo.add((route_id, area_id, method_id, item_id))
    # The graph's frame variants are exact child routes; compare those as well
    # by their variant ID, separately from named fixed-design IDs.
    for design in graph["combination_designs"]:
        for variant in design.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                area_id = route["area_id"]
                for contribution in route.get("method_contributions", []):
                    method_id = contribution.get("method_id")
                    for item_id, methods in ROUTES.items():
                        allowed_areas = route_map.ITEM_AREAS.get(item_id)
                        key = (variant["id"], area_id, method_id, item_id)
                        should_route = method_id in methods and (allowed_areas is None or area_id in allowed_areas)
                        has_route = any(item_id in contribution.get(field, []) for field in ROUTE_FIELDS)
                        if should_route != has_route:
                            fail(f"Incorrect exact-combination placement: {key}")

    if actual_combo != expected_combo:
        fail(f"Combination contribution mismatch: expected {len(expected_combo)}, found {len(actual_combo)}")

    report = {
        "passed": True,
        "candidate_count": len(ROUTES),
        "visible_and_selectable_candidates": len([item for item in ROUTES if nodes[item]["student_visible"] and nodes[item]["selectable"]]),
        "optional_candidate_count": len(ROUTES) - len(CONDITIONAL),
        "conditional_candidate_count": len(CONDITIONAL),
        "single_method_area_route_count": len(expected_single),
        "exact_combination_method_contribution_count": len(actual_combo),
        "graph_global_student_visible": graph.get("student_visible"),
        "requirement": "all candidates skippable; none blocks progression",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
