"""Exhaustive structural audit of D078's method-selection state space.

Enumerates every non-empty subset of the 23 methods (8,388,607 states) using
the graph's named-design contract, then validates every supported single,
named-combination, and participatory-component downstream reference. This is
local contract verification, not browser acceptance or student-release approval.
"""
from __future__ import annotations

import gzip
import itertools
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
TOOL_ITEM_TYPES = {"tool", "programming_language", "python_library", "computational_environment"}
ROUTE_ITEM_FIELDS = (
    "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
    "domain_downstream_item_ids", "tool_ids", "domain_tool_ids",
    "explanatory_item_ids", "role_item_ids", "method_specific_role_item_ids",
)


def is_tool_node(node: dict[str, Any]) -> bool:
    return node.get("item_type") in TOOL_ITEM_TYPES or node.get("kind") in {
        "area_tool_option", "area_tool_application_reference",
    }


def load_graph() -> dict[str, Any]:
    with gzip.open(GRAPH, "rt", encoding="utf-8") as stream:
        return json.load(stream)


def route_refs(route: dict[str, Any], fields: tuple[str, ...]) -> list[str]:
    return [str(value) for field in fields for value in route.get(field, [])]


def selectable_item_ids(route: dict[str, Any], nodes: dict[str, dict[str, Any]], methods: set[str]) -> set[str]:
    """Return item choices after removing methods and always-on foundations."""
    ids = set(route_refs(route, ROUTE_ITEM_FIELDS)) - methods
    return {
        item_id for item_id in ids
        if nodes.get(item_id, {}).get("requirement_level") != "needed"
        and nodes.get(item_id, {}).get("requirement_lane") != "needed"
    }


def main() -> None:
    graph = load_graph()
    nodes = {str(node["id"]): node for node in graph["nodes"]}
    methods = list(graph["method_node_ids"])
    combinations = graph["combination_designs"]
    areas = {str(node.get("area_id")): node["id"] for node in graph["nodes"]
             if node.get("kind") == "area_of_specialization"}
    roles = {str(node["id"]) for node in graph["nodes"] if node.get("kind") == "role"}
    errors: list[str] = []

    if len(methods) != 23:
        errors.append(f"Expected 23 method IDs; found {len(methods)}")
    if len(areas) != 7:
        errors.append(f"Expected 7 canonical areas; found {len(areas)}")
    if len(roles) != 19:
        errors.append(f"Expected 19 roles; found {len(roles)}")
    missing_method_nodes = [item for item in methods if item not in nodes]
    if missing_method_nodes:
        errors.append(f"Unresolved method nodes: {missing_method_nodes}")

    # Item checkboxes are independent toggles within a fixed route. Do not try
    # to materialize a powerset such as 2**84. Instead validate the exact
    # route-local choice universe, prove every option is non-blocking, reject
    # any explicit item-level exclusion, and report the exact represented
    # subset counts. The runtime toggle is a pure membership toggle gated only
    # by the fixed route's selectable-ID set; therefore all subsets of that set
    # are reachable and remain in that set.
    item_route_contexts: list[tuple[str, dict[str, Any]]] = []
    item_route_contexts.extend((f"single:{route.get('method_id')}:{route.get('area_id')}", route)
                               for route in graph.get("method_area_routes", []))
    item_route_contexts.extend((f"role:{route.get('method_id')}:{route.get('area_id')}:{route.get('role_id')}", route)
                               for route in graph.get("method_area_role_routes", []))
    for design in combinations:
        for route in design.get("area_routes", []):
            context = dict(route)
            for contribution in route.get("method_contributions", []):
                for field in ROUTE_ITEM_FIELDS:
                    context[field] = list(dict.fromkeys(context.get(field, []) + contribution.get(field, [])))
            item_route_contexts.append((f"combination:{design.get('id')}:{route.get('area_id')}", context))
        for variant in design.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                context = dict(route)
                for contribution in route.get("method_contributions", []):
                    for field in ROUTE_ITEM_FIELDS:
                        context[field] = list(dict.fromkeys(context.get(field, []) + contribution.get(field, [])))
                item_route_contexts.append((f"variant:{design.get('id')}:{sorted(variant.get('selected_component_method_ids', []))}:{route.get('area_id')}", context))

    subset_state_count = 0
    max_item_choice_count = 0
    item_choice_occurrences = 0
    item_choice_errors: list[str] = []
    explicit_item_exclusion_edges = {
        "mutually_exclusive", "exclusive_with", "cannot_be_selected_with",
    }
    for context_id, route in item_route_contexts:
        choices = selectable_item_ids(route, nodes, set(methods))
        max_item_choice_count = max(max_item_choice_count, len(choices))
        item_choice_occurrences += len(choices)
        subset_state_count += 1 << len(choices)
        for item_id in choices:
            node = nodes.get(item_id)
            if node is None:
                item_choice_errors.append(f"Selectable item is unresolved: {context_id}/{item_id}")
                continue
            if node.get("requirement_scope", {}).get("blocks_progression") is True or node.get("blocking_policy") == "blocks_progression":
                item_choice_errors.append(f"Skippable choice blocks progression: {context_id}/{item_id}")
        for edge in graph.get("edges", []):
            if edge.get("relationship") in explicit_item_exclusion_edges and edge.get("source") in choices and edge.get("target") in choices:
                item_choice_errors.append(f"Explicitly incompatible choices share route {context_id}: {edge.get('source')}/{edge.get('target')}")
    errors.extend(item_choice_errors)

    # Evaluate every possible non-empty set without constructing route unions.
    # A multi-method set is usable only if the graph names an exact fixed design
    # or a valid participatory frame + one or more allowed component methods.
    selection_count = fixed_matches = frame_matches = unsupported_multis = 0
    for size in range(1, len(methods) + 1):
        for subset_tuple in itertools.combinations(methods, size):
            selection_count += 1
            selected = set(subset_tuple)
            if size == 1:
                continue
            matches: list[str] = []
            for design in combinations:
                required = set(design.get("required_method_ids", []))
                selectable = set(design.get("selectable_component_method_ids", []))
                if design.get("combination_mode") == "fixed_evidence_combination":
                    if selected == required:
                        matches.append(str(design["id"]))
                elif design.get("combination_mode") == "design_frame_with_selectable_methods":
                    if required.issubset(selected) and selected.issubset(required | selectable) and selected - required:
                        matches.append(str(design["id"]))
            if len(matches) > 1:
                # Ambiguity is allowed only as a user-visible design choice;
                # it may not silently project a route before one is selected.
                fixed_matches += len(matches)
            elif matches:
                if next(item for item in combinations if item["id"] == matches[0]).get("combination_mode") == "fixed_evidence_combination":
                    fixed_matches += 1
                else:
                    frame_matches += 1
            else:
                unsupported_multis += 1

    route_item_fields = (
        "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
        "domain_downstream_item_ids", "tool_ids", "domain_tool_ids", "explanatory_item_ids",
    )
    checked_single_routes = 0
    for route in graph.get("method_area_routes", []):
        checked_single_routes += 1
        method_id, area_id = route.get("method_id"), str(route.get("area_id"))
        if method_id not in methods:
            errors.append(f"Single route has unknown method: {method_id}")
        if area_id not in areas:
            errors.append(f"Single route has non-canonical area: {area_id}")
        for item_id in route_refs(route, route_item_fields):
            if item_id not in nodes:
                errors.append(f"Unresolved single-route item {item_id} ({method_id}/{area_id})")
        for tool_id in route.get("tool_ids", []) + route.get("domain_tool_ids", []):
            tool = nodes.get(tool_id, {})
            if not is_tool_node(tool):
                errors.append(f"Route tool field points to non-tool {tool_id} ({method_id}/{area_id})")

    checked_role_routes = 0
    for route in graph.get("method_area_role_routes", []):
        checked_role_routes += 1
        if route.get("method_id") not in methods:
            errors.append(f"Role route has unknown method: {route.get('method_id')}")
        if str(route.get("area_id")) not in areas:
            errors.append(f"Role route has non-canonical area: {route.get('area_id')}")
        if route.get("role_id") not in roles:
            errors.append(f"Role route has unknown role: {route.get('role_id')}")
        for item_id in route.get("role_item_ids", []) + route.get("method_specific_role_item_ids", []):
            if item_id not in nodes:
                errors.append(f"Unresolved role item {item_id} ({route.get('role_id')})")

    checked_combo_routes = checked_combo_contributions = 0
    for design in combinations:
        design_id = str(design.get("id"))
        required = set(design.get("required_method_ids", []))
        selectable = set(design.get("selectable_component_method_ids", []))
        if not required.issubset(set(methods)) or not selectable.issubset(set(methods)):
            errors.append(f"Combination references unknown methods: {design_id}")
        for route in design.get("area_routes", []):
            checked_combo_routes += 1
            area_id = str(route.get("area_id"))
            if area_id not in areas:
                errors.append(f"Combination route has non-canonical area: {design_id}/{area_id}")
            for role_id in route.get("role_ids", []):
                if role_id not in roles:
                    errors.append(f"Combination route has unknown role: {design_id}/{area_id}/{role_id}")
            for item_id in route_refs(route, route_item_fields):
                if item_id not in nodes:
                    errors.append(f"Unresolved combination item {item_id} ({design_id}/{area_id})")
            for contribution in route.get("method_contributions", []):
                checked_combo_contributions += 1
                if contribution.get("method_id") not in (required | selectable):
                    errors.append(f"Unexpected component method {contribution.get('method_id')} ({design_id})")
                for item_id in route_refs(contribution, route_item_fields):
                    if item_id not in nodes:
                        errors.append(f"Unresolved contribution item {item_id} ({design_id}/{area_id})")

        for variant in design.get("component_route_variants", []):
            selected_components = set(variant.get("selected_component_method_ids", []))
            if not selected_components or not selected_components.issubset(selectable):
                errors.append(f"Invalid participatory component variant: {design_id}/{sorted(selected_components)}")
            for route in variant.get("area_routes", []):
                area_id = str(route.get("area_id"))
                if area_id not in areas:
                    errors.append(f"Variant has non-canonical area: {design_id}/{area_id}")
                for role_id in route.get("role_ids", []):
                    if role_id not in roles:
                        errors.append(f"Variant has unknown role: {design_id}/{area_id}/{role_id}")
                for contribution in route.get("method_contributions", []):
                    method_id = contribution.get("method_id")
                    if method_id not in required | selected_components:
                        errors.append(f"Variant has unselected method contribution: {design_id}/{method_id}")
                    for item_id in route_refs(contribution, route_item_fields):
                        if item_id not in nodes:
                            errors.append(f"Unresolved variant item {item_id} ({design_id}/{area_id})")

    role_tool_routes = graph.get("role_tool_routes", [])
    tool_counts_by_role: dict[str, set[str]] = {}
    role_tool_edge_pairs = {
        (str(edge.get("source")), str(edge.get("target")))
        for edge in graph.get("edges", [])
        if edge.get("relationship") == "role_to_tool_option"
        and edge.get("status") == "resolved_ready_for_use"
        and edge.get("student_visible") is True
    }
    checked_role_tool_routes = 0
    for route in role_tool_routes:
        checked_role_tool_routes += 1
        role_id, tool_id = str(route.get("role_id")), str(route.get("tool_node_id"))
        if role_id not in roles:
            errors.append(f"Role-tool option has unknown role: {role_id}")
        if tool_id not in nodes or not is_tool_node(nodes.get(tool_id, {})):
            errors.append(f"Role-tool option has unresolved/non-tool node: {role_id}/{tool_id}")
        if (role_id, tool_id) not in role_tool_edge_pairs:
            errors.append(f"Role-tool option lacks a visible typed role→tool edge: {role_id}/{tool_id}")
        if route.get("requirement_level") != "optional" or route.get("requirement_lane") != "useful_optional_edge":
            errors.append(f"Role-tool option is not explicitly optional: {role_id}/{tool_id}")
        if not route.get("contextual_use") or not route.get("expected_output"):
            errors.append(f"Role-tool option lacks its role-specific explanation/output: {role_id}/{tool_id}")
        if not route.get("official_reference") or not route.get("learning_resource"):
            errors.append(f"Role-tool option lacks official or learning resource: {role_id}/{tool_id}")
        if len(route.get("source_references", [])) < 2:
            errors.append(f"Role-tool option has fewer than two source references: {role_id}/{tool_id}")
        for area_id in route.get("area_ids", []):
            if str(area_id) not in areas:
                errors.append(f"Role-tool option has non-canonical area: {role_id}/{area_id}")
        tool_counts_by_role.setdefault(role_id, set()).add(str(route.get("canonical_tool_id")))
    for role_id in roles:
        count = len(tool_counts_by_role.get(role_id, set()))
        if count < 5:
            errors.append(f"Role has fewer than five role-scoped tool options: {role_id} ({count})")

    result = {
        "graph_schema_version": graph.get("schema_version"),
        "student_visible_graph_projection_ready": graph.get("student_visible") is True,
        "student_ui_gate_closed": graph.get("student_ui_gate", {}).get("enabled") is False,
        "method_selection_subsets_exhaustively_enumerated": selection_count,
        "single_method_route_rows_checked": checked_single_routes,
        "method_area_role_route_rows_checked": checked_role_routes,
        "item_selection_route_contexts_checked": len(item_route_contexts),
        "route_item_choice_occurrences_checked": item_choice_occurrences,
        "largest_item_choice_set_in_a_route": max_item_choice_count,
        "exact_item_selection_subsets_represented_across_route_contexts": str(subset_state_count),
        "item_selection_space_validation": "all selectable items are route-local independent toggles; every subset is represented symbolically",
        "role_tool_route_rows_checked": checked_role_tool_routes,
        "roles_with_at_least_five_source_backed_optional_tool_choices": sum(
            len(tool_counts_by_role.get(role_id, set())) >= 5 for role_id in roles
        ),
        "named_combination_area_routes_checked": checked_combo_routes,
        "named_combination_method_contributions_checked": checked_combo_contributions,
        "supported_fixed_or_frame_multi_selections": fixed_matches + frame_matches,
        "fixed_design_matches": fixed_matches,
        "participatory_frame_matches": frame_matches,
        "unsupported_multi_selections_that_must_remain_gated": unsupported_multis,
        "canonical_area_count": len(areas),
        "role_count": len(roles),
        "errors": errors,
        "passed": not errors and graph.get("student_visible") is True and graph.get("student_ui_gate", {}).get("enabled") is False,
        "not_a_browser_or_live_database_test": True,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not result["passed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
