"""Make reviewed D078 emerging candidates selectable on evidenced routes.

The compressed canonical graph is authoritative. This repair updates only the
eight emerging candidate nodes and their method/area route projections. It does
not promote the graph globally, change compulsory foundations, role ownership,
or SQL contracts.
"""
from __future__ import annotations

import gzip
import importlib.util
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH_PATH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
REPORT_PATH = AUDIT / "D078_EMERGING_CANDIDATE_ROUTE_REPAIR_2026_10_28.json"

prior_script = AUDIT / "repair_d078_relationship_routes_2026_10_20.py"
spec = importlib.util.spec_from_file_location("d078_route_repair", prior_script)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Cannot load reviewed route map: {prior_script}")
route_map = importlib.util.module_from_spec(spec)
spec.loader.exec_module(route_map)

ROUTES: dict[str, set[str]] = {
    item_id: methods for item_id, methods in route_map.ROUTES.items()
    if item_id.startswith("domain-emerging:")
}
ITEM_AREAS: dict[str, set[str]] = route_map.ITEM_AREAS
CONDITIONS: dict[str, str] = route_map.CONDITIONS

CONDITIONAL = {
    "domain-emerging:d078-emerging-ai-social-impact-assessment",
    "domain-emerging:d078-emerging-ai-use-validation-and-provenance",
}
EXPERIMENTAL = {
    "domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation",
    "domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation",
    "domain-emerging:d078-emerging-ai-assisted-social-text-annotation",
    "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing",
}


def read_graph() -> dict[str, Any]:
    with gzip.open(GRAPH_PATH, "rt", encoding="utf-8") as source:
        return json.load(source)


def write_graph(graph: dict[str, Any]) -> None:
    with gzip.open(GRAPH_PATH, "wt", encoding="utf-8", newline="\n") as target:
        json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))


def add(values: list[str], value: str) -> None:
    if value not in values:
        values.append(value)


def remove_candidates(values: list[str], candidate_ids: set[str]) -> list[str]:
    return [value for value in values if value not in candidate_ids]


def add_to_method_route(route: dict[str, Any], item_id: str, is_tool: bool) -> None:
    if is_tool:
        for key in ("tool_ids", "domain_tool_ids"):
            add(route.setdefault(key, []), item_id)
    else:
        for key in ("task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids"):
            add(route.setdefault(key, []), item_id)


def add_to_contribution(contribution: dict[str, Any], item_id: str, is_tool: bool) -> None:
    if is_tool:
        for key in ("tool_ids", "domain_tool_ids"):
            add(contribution.setdefault(key, []), item_id)
    else:
        for key in ("task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids"):
            add(contribution.setdefault(key, []), item_id)


def main() -> None:
    graph = read_graph()
    nodes = {node["id"]: node for node in graph["nodes"]}
    missing = set(ROUTES) - set(nodes)
    if missing:
        raise SystemExit("Missing expected emerging candidates: " + ", ".join(sorted(missing)))

    graph_methods = set(graph["method_node_ids"])
    invalid_methods = set().union(*ROUTES.values()) - graph_methods
    if invalid_methods:
        raise SystemExit("Candidate route references unknown methods: " + ", ".join(sorted(invalid_methods)))

    areas = {route["area_id"] for route in graph["method_area_routes"]}
    invalid_areas = set().union(*(ITEM_AREAS.get(item_id, set()) for item_id in ROUTES)) - areas
    if invalid_areas:
        raise SystemExit("Candidate route references unknown areas: " + ", ".join(sorted(invalid_areas)))

    # Clear only these candidates from route projections before rebuilding,
    # making reruns deterministic and removing any stale over-broad placement.
    route_fields = ("task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids", "tool_ids", "domain_tool_ids")
    for route in graph["method_area_routes"]:
        for key in route_fields:
            route[key] = remove_candidates(route.get(key, []), set(ROUTES))

    method_route_index = {(route["method_id"], route["area_id"]): route for route in graph["method_area_routes"]}
    expected_single_routes: set[tuple[str, str, str]] = set()
    for item_id, method_ids in ROUTES.items():
        node = nodes[item_id]
        is_tool = node.get("item_type") == "tool"
        allowed_areas = ITEM_AREAS.get(item_id)
        for method_id in method_ids:
            for (candidate_method, area_id), route in method_route_index.items():
                if candidate_method != method_id or (allowed_areas and area_id not in allowed_areas):
                    continue
                add_to_method_route(route, item_id, is_tool)
                expected_single_routes.add((item_id, method_id, area_id))

        # Preserve maturity and item ownership. Only the student visibility,
        # choice lane and route-specific explanation are resolved here.
        condition = CONDITIONS[item_id]
        node["student_visible"] = True
        node["selectable"] = True
        node["approval"] = "approved_conditional_route_option" if item_id in CONDITIONAL else "approved_useful_route_option"
        node["requirement_lane"] = "conditional" if item_id in CONDITIONAL else "optional"
        node["requirement_level"] = node["requirement_lane"]
        node["requirement_reason"] = condition
        node["requirement_scope"] = {"condition": condition, "method_ids": sorted(method_ids), "area_ids": sorted(allowed_areas or areas)}
        node["route_display_condition"] = condition
        node["meaning"] = node.get("meaning") or node.get("what_it_is") or node.get("label")
        node["why_it_matters"] = node.get("why_it_matters") or condition
        node["contextual_use"] = node.get("contextual_use") or condition
        node["skippable"] = True
        node["blocking_policy"] = "never"
        node["auto_add"] = False
        node["maturity"] = "experimental" if item_id in EXPERIMENTAL else "emerging"
        node["route_resolution"] = {
            "state": "resolved_selectable_route_option",
            "verified_on": "2026-10-28",
            "route_method_ids": sorted(method_ids),
            "owner_layer": "domain",
            "student_selectable": True,
            "skippable": True,
            "blocking_policy": "never",
            "auto_add": False,
            "auto_order": False,
            "condition": condition,
            "allowed_area_ids": sorted(allowed_areas or areas),
            "maturity": node["maturity"],
        }

    # Keep combination routes exact: an emerging item appears only in the
    # contribution for a component method that independently supports it.
    expected_combo_routes: set[tuple[str, str, str, str]] = set()
    route_node_ids: set[str] = set()
    for design in graph["combination_designs"]:
        member_methods = set(design.get("method_ids", []))
        for route in design.get("area_routes", []):
            area_id = route["area_id"]
            for contribution in route.get("method_contributions", []):
                for key in route_fields:
                    contribution[key] = remove_candidates(contribution.get(key, []), set(ROUTES))
                method_id = contribution.get("method_id")
                if method_id not in member_methods:
                    continue
                for item_id, method_ids in ROUTES.items():
                    allowed_areas = ITEM_AREAS.get(item_id)
                    if method_id not in method_ids or (allowed_areas and area_id not in allowed_areas):
                        continue
                    add_to_contribution(contribution, item_id, nodes[item_id].get("item_type") == "tool")
                    expected_combo_routes.add((design["id"], area_id, method_id, item_id))
            # Aggregate convenience fields remain a union of this exact named
            # design's component contributions; UI projection reads each
            # contribution separately and can retain method attribution.
            for key in route_fields:
                route[key] = []
                for contribution in route.get("method_contributions", []):
                    for value in contribution.get(key, []):
                        add(route[key], value)
            if route.get("route_node_id"):
                route_node_ids.add(route["route_node_id"])

    # Frame designs store their selectable component variants separately.
    for design in graph["combination_designs"]:
        for variant in design.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                area_id = route["area_id"]
                for contribution in route.get("method_contributions", []):
                    for key in route_fields:
                        contribution[key] = remove_candidates(contribution.get(key, []), set(ROUTES))
                    method_id = contribution.get("method_id")
                    for item_id, method_ids in ROUTES.items():
                        allowed_areas = ITEM_AREAS.get(item_id)
                        if method_id not in method_ids or (allowed_areas and area_id not in allowed_areas):
                            continue
                        add_to_contribution(contribution, item_id, nodes[item_id].get("item_type") == "tool")
                        expected_combo_routes.add((variant["id"], area_id, method_id, item_id))
                for key in route_fields:
                    route[key] = []
                    for contribution in route.get("method_contributions", []):
                        for value in contribution.get(key, []):
                            add(route[key], value)
                if route.get("route_node_id"):
                    route_node_ids.add(route["route_node_id"])

    # The graph also stores combination route nodes consumed by the compact
    # UI export. Mirror each reviewed route record into its node by route ID.
    for design in graph["combination_designs"]:
        route_records = list(design.get("area_routes", []))
        route_records += [r for v in design.get("component_route_variants", []) for r in v.get("area_routes", [])]
        for route in route_records:
            route_node = nodes.get(route.get("route_node_id"))
            if not route_node:
                continue
            for key in route_fields:
                route_node[key] = list(route.get(key, []))
            route_node["method_contributions"] = route.get("method_contributions", [])

    # Verify every edge of the mapping before saving.
    actual_single_routes = {
        (item_id, route["method_id"], route["area_id"])
        for route in graph["method_area_routes"]
        for field in route_fields
        for item_id in route.get(field, [])
        if item_id in ROUTES
    }
    missing_single = expected_single_routes - actual_single_routes
    if missing_single:
        raise SystemExit(f"Candidate single-method routes missing after repair: {len(missing_single)}")

    graph["emerging_candidate_route_repair"] = {
        "date": "2026-10-28",
        "candidate_ids": sorted(ROUTES),
        "candidate_count": len(ROUTES),
        "single_method_area_route_count": len(expected_single_routes),
        "combination_method_contribution_count": len(expected_combo_routes),
        "requirement_policy": "candidate-specific optional/conditional; skippable; never blocks method or area progression",
        "combination_policy": "attach only to the exact method contribution that supports the item; do not union unrelated method paths",
        "graph_global_student_visible_unchanged": True,
        "sql_changed": False,
    }
    write_graph(graph)
    REPORT_PATH.write_text(json.dumps(graph["emerging_candidate_route_repair"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(graph["emerging_candidate_route_repair"], ensure_ascii=False))


if __name__ == "__main__":
    main()
