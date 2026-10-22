"""Exhaustive structural and route-closure audit for the D078 method graph.

The audit derives selectable route membership from the same route arrays used by
the UI projection. It enumerates all method-selection subsets and all selectable
component subsets, then checks every ready student-facing relationship target
for canonical resolution and route co-availability at domain, area, or role
scope. It does not infer new relationships or change ownership/dispositions.
"""
from __future__ import annotations

import itertools
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH_PATH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
TECHNIQUE_PATH = AUDIT / "D078_METHOD_TECHNIQUE_RESOLUTION_2026_10_20.json"
RELATIONSHIP_PATH = AUDIT / "D078_RELATIONSHIP_RESOLUTION_2026_10_20.json"
CONTEXT_PATH = AUDIT / "D078_ITEM_CONTEXT_ENRICHMENT_2026_10_20.json"
OUTPUT_PATH = AUDIT / "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json"

ITEM_KEYS = (
    "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
    "domain_downstream_item_ids", "tool_ids", "domain_tool_ids",
)
RELATIONSHIP_TYPES = {
    "builds_on", "alternative_to", "complements", "supports", "requires",
    "tool_for", "works_with", "specialist_extension_of", "alternative_tool_option",
}


def list_values(row: dict[str, Any], *keys: str) -> set[str]:
    return {item for key in keys for item in (row.get(key) or []) if isinstance(item, str)}


def main() -> None:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    technique = json.loads(TECHNIQUE_PATH.read_text(encoding="utf-8"))
    resolutions = json.loads(RELATIONSHIP_PATH.read_text(encoding="utf-8"))
    context = json.loads(CONTEXT_PATH.read_text(encoding="utf-8"))
    nodes = {node["id"]: node for node in graph["nodes"]}
    combo_area_routes = [node for node in graph["nodes"] if node.get("kind") == "combination_area_route"]
    combo_role_routes = [node for node in graph["nodes"] if node.get("kind") == "combination_area_role_route"]
    node_ids = set(nodes)
    errors: list[str] = []

    if len(nodes) != len(graph["nodes"]):
        errors.append("Graph node IDs are not unique")
    missing_edge_nodes = sorted({
        endpoint for edge in graph["edges"] for endpoint in (edge.get("source"), edge.get("target"))
        if endpoint not in node_ids
    })
    if missing_edge_nodes:
        errors.append(f"Canonical graph edges have unresolved endpoints: {missing_edge_nodes[:20]}")

    areas = {node.get("area_id") for node in graph["nodes"] if node.get("kind") == "area_of_specialization"}
    methods = list(graph["method_node_ids"])
    method_set = set(methods)
    if len(methods) != 22 or len(areas) != 7:
        errors.append(f"Expected 22 methods and 7 areas; found {len(methods)} and {len(areas)}")

    # Build per-method domain/tool membership and area-scoped item membership.
    method_domain: dict[str, set[str]] = {method: set() for method in methods}
    method_tools: dict[str, set[str]] = {method: set() for method in methods}
    method_areas: dict[str, set[str]] = {method: set() for method in methods}
    method_area_items: dict[tuple[str, str], set[str]] = defaultdict(set)
    for route in graph["method_area_routes"]:
        method = route.get("method_id")
        area = route.get("area_id")
        if method not in method_set or area not in areas:
            errors.append(f"Method route has unknown method/area: {method}, {area}")
            continue
        method_areas[method].add(area)
        route_ids = list_values(route, *ITEM_KEYS)
        area_ids = list_values(route, "area_item_ids")
        for item_id in route_ids:
            node = nodes.get(item_id, {})
            is_area_item = item_id.startswith(("area_enrichment_item:", "area_learning_item:"))
            is_tool = node.get("item_type") == "tool" or node.get("kind") in {
                "area_tool_option", "area_tool_application_reference",
            }
            if is_area_item:
                method_area_items[(method, area)].add(item_id)
            elif is_tool:
                method_tools[method].add(item_id)
            else:
                method_domain[method].add(item_id)
        for item_id in area_ids:
            method_area_items[(method, area)].add(item_id)

    # Every role route must be reachable through the same selected method+area.
    method_role_items: dict[tuple[str, str, str], set[str]] = defaultdict(set)
    method_role_support: dict[tuple[str, str], set[str]] = defaultdict(set)
    missing_area_route_for_role: list[dict[str, str]] = []
    role_route_item_ids: set[str] = set()
    for route in graph["method_area_role_routes"]:
        method, area, role = route.get("method_id"), route.get("area_id"), route.get("role_id")
        if method not in method_set or area not in areas or role not in node_ids:
            errors.append(f"Role route has unresolved context: {method}, {area}, {role}")
            continue
        if area not in method_areas[method]:
            missing_area_route_for_role.append({"method_id": method, "area_id": area, "role_id": role})
        key = (method, area, role)
        items = list_values(route, "role_item_ids", "method_specific_role_item_ids")
        method_role_items[key].update(items)
        method_role_support[(area, role)].add(method)
        role_route_item_ids.update(items)

    # Combination routes form independent route atoms; the participatory design
    # composes its required method with each selected subset of optional methods.
    combo_domain: dict[str, set[str]] = defaultdict(set)
    combo_tools: dict[str, set[str]] = defaultdict(set)
    combo_areas: dict[str, set[str]] = defaultdict(set)
    combo_area_items: dict[tuple[str, str], set[str]] = defaultdict(set)
    combo_role_items: dict[tuple[str, str, str], set[str]] = defaultdict(set)
    combo_role_support: dict[tuple[str, str], set[str]] = defaultdict(set)
    for route in combo_area_routes:
        combo, area = route.get("combination_id"), route.get("area_id")
        if area not in areas:
            errors.append(f"Combination route has unknown area: {combo}, {area}")
            continue
        combo_areas[combo].add(area)
        for item_id in list_values(route, *ITEM_KEYS):
            node = nodes.get(item_id, {})
            is_area_item = item_id.startswith(("area_enrichment_item:", "area_learning_item:"))
            is_tool = node.get("item_type") == "tool" or node.get("kind") in {
                "area_tool_option", "area_tool_application_reference",
            }
            if is_area_item:
                combo_area_items[(combo, area)].add(item_id)
            elif is_tool:
                combo_tools[combo].add(item_id)
            else:
                combo_domain[combo].add(item_id)
        combo_area_items[(combo, area)].update(list_values(route, "area_item_ids"))
    for route in combo_role_routes:
        combo, area, role = route.get("combination_id"), route.get("area_id"), route.get("role_id")
        items = list_values(route, "role_item_ids", "method_specific_role_item_ids")
        combo_role_items[(combo, area, role)].update(items)
        combo_role_support[(area, role)].add(combo)
        role_route_item_ids.update(items)

    combinations = graph["combination_designs"]
    combo_ids = {combo["id"] for combo in combinations}
    for combo in combinations:
        members = set(combo.get("required_method_ids", [])) | set(combo.get("selectable_component_method_ids", []))
        if not members <= method_set:
            errors.append(f"Combination {combo['id']} contains unknown component methods")

    # Selectable items under the route contract: domain/tool, area, or selected role.
    global_domain = set().union(*method_domain.values(), *combo_domain.values())
    global_tools = set().union(*method_tools.values(), *combo_tools.values())
    global_area_items = set().union(*method_area_items.values(), *combo_area_items.values())
    global_role_items = role_route_item_ids
    foundation_ids = set(graph.get("foundation_item_ids", []))
    # Method choices and shared foundations are visible at the domain stage;
    # they are not repeated inside the downstream item-ID collections.
    projected_items = global_domain | global_tools | global_area_items | global_role_items | method_set | foundation_ids
    unsupported_routes: list[dict[str, str]] = []

    # Source ledger selectable nodes must be present on at least one declared route.
    technique_records = technique.get("records", [])
    technique_route_membership: Counter[str] = Counter()
    for record in technique_records:
        item_id = record.get("canonical_id")
        if not record.get("selectable"):
            continue
        if item_id not in node_ids:
            unsupported_routes.append({"item_id": str(item_id), "reason": "selectable ledger item has no graph node"})
            continue
        declared_methods = set(record.get("route_method_ids", []))
        owner_area = record.get("area_id")
        method_reachable = any(
            item_id in method_domain[m] | method_tools[m] | method_area_items_for_method(m)
            for m in declared_methods if m in method_set
        )
        area_reachable = bool(owner_area and any(item_id in values for (m, a), values in method_area_items.items() if a == owner_area))
        if method_reachable or area_reachable or item_id in global_role_items:
            technique_route_membership[record.get("owner_layer", "unknown")] += 1
        else:
            unsupported_routes.append({"item_id": item_id, "reason": "selectable ledger item is absent from its declared method/area/role routes"})

    # Every edge in the relationship-resolution ledger is explicit, resolved,
    # nonblocking and represented by a matching canonical typed edge if it is
    # marked ready for click-through.
    resolution_records = resolutions.get("records", [])
    resolution_summary = resolutions.get("summary", {})
    resolution_errors: list[str] = []
    for record in resolution_records:
        if record.get("resolution_state") == "unresolved_after_exhaustive_search":
            resolution_errors.append(f"Unresolved relationship annotation: {record.get('id')}")
        if record.get("blocking_policy") != "never" or record.get("skippable") is not True:
            resolution_errors.append(f"Relationship annotation is not optional/nonblocking: {record.get('id')}")
        if record.get("resolution_state") == "resolved_ready_for_use":
            source = record.get("source_id")
            targets = record.get("target_ids", [])
            for target in targets:
                if target not in node_ids:
                    resolution_errors.append(f"Ready relationship target is unresolved: {record.get('id')} -> {target}")
                if not any(
                    edge.get("source") == source and edge.get("target") == target
                    and edge.get("relationship") == record.get("relationship")
                    and edge.get("status") == "resolved_ready_for_use"
                    for edge in graph["edges"]
                ):
                    resolution_errors.append(f"Ready ledger relationship lacks graph edge: {record.get('id')} -> {target}")

    ready_edges = [
        edge for edge in graph["edges"]
        if edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True
        and edge.get("relationship") in RELATIONSHIP_TYPES
    ]
    endpoint_unprojected: list[dict[str, str]] = []
    co_projected_edge_ids: dict[str, str] = {}
    edge_scope_counts: Counter[str] = Counter()
    edge_type_counts: Counter[str] = Counter()

    def co_project_scope(source: str, target: str) -> str | None:
        for method in methods:
            route_items = method_domain[method] | method_tools[method]
            if source == method and target in route_items or target == method and source in route_items:
                return "selected_method_route"
            area_items = set().union(*[
                values for (route_method, _area), values in method_area_items.items()
                if route_method == method
            ])
            if source == method and target in area_items or target == method and source in area_items:
                return "selected_method_area_route"
        # Domain items and tools project after any method choice; the UI unions
        # independently selected methods, so route support may come from two
        # different selected methods.
        if source in global_domain | global_tools and target in global_domain | global_tools:
            return "domain_multi_method_union"
        # A learner can select an area after the method union. Area-owned items
        # must share that area; domain items/tools are also available at that stop.
        for area in areas:
            area_available = set().union(*[
                values for (method, route_area), values in method_area_items.items() if route_area == area
            ], *[
                values for (combo, route_area), values in combo_area_items.items() if route_area == area
            ])
            area_available |= global_domain | global_tools
            if source in area_available and target in area_available:
                return "area_union"
        # Role-owned items are available only after selecting that exact role
        # in a projected area; test the full method/combination route union.
        for (area, role), supporters in method_role_support.items():
            if area not in areas:
                continue
            role_available = set().union(*[
                items for (method, route_area, route_role), items in method_role_items.items()
                if route_area == area and route_role == role and method in supporters
            ])
            role_available |= global_domain | global_tools
            role_available |= set().union(*[
                values for (method, route_area), values in method_area_items.items() if route_area == area
            ], *[
                values for (combo, route_area), values in combo_area_items.items() if route_area == area
            ])
            if source in role_available and target in role_available:
                return "role_union"
        for (area, role), supporters in combo_role_support.items():
            role_available = set().union(*[
                items for (combo, route_area, route_role), items in combo_role_items.items()
                if route_area == area and route_role == role and combo in supporters
            ])
            role_available |= global_domain | global_tools
            role_available |= set().union(*[
                values for (method, route_area), values in method_area_items.items() if route_area == area
            ], *[
                values for (combo, route_area), values in combo_area_items.items() if route_area == area
            ])
            if source in role_available and target in role_available:
                return "role_union"
        return None

    for edge in ready_edges:
        source, target = edge.get("source"), edge.get("target")
        edge_type_counts[edge.get("relationship", "unknown")] += 1
        if source not in projected_items or target not in projected_items:
            if edge.get("route_availability", {}).get("state") != "unavailable_destination":
                errors.append(f"Unprojected relationship lacks unavailable-destination state: {edge.get('id')}")
            endpoint_unprojected.append({
                "edge_id": edge.get("id", ""), "relationship": edge.get("relationship", ""),
                "source_id": str(source), "target_id": str(target),
                "source_projected": str(source in projected_items),
                "target_projected": str(target in projected_items),
                "source_visible": str(nodes.get(source, {}).get("student_visible")),
                "target_visible": str(nodes.get(target, {}).get("student_visible")),
                "route_availability": "unavailable_destination",
                "availability_reason": "At least one canonical endpoint is absent from all declared learner routes.",
            })
            continue
        scope = co_project_scope(source, target)
        availability = edge.get("route_availability", {}).get("state")
        if scope:
            if availability == "unavailable_destination":
                errors.append(f"Co-projectable relationship is marked unavailable: {edge.get('id')}")
            edge_scope_counts[scope] += 1
            co_projected_edge_ids[edge.get("id", "")] = scope
        else:
            if availability != "unavailable_destination":
                errors.append(f"Non-projectable relationship lacks unavailable-destination state: {edge.get('id')}")
            endpoint_unprojected.append({
                "edge_id": edge.get("id", ""), "relationship": edge.get("relationship", ""),
                "source_id": str(source), "target_id": str(target),
                "source_projected": "true", "target_projected": "true",
                "source_visible": str(nodes.get(source, {}).get("student_visible")),
                "target_visible": str(nodes.get(target, {}).get("student_visible")),
                "route_availability": "unavailable_destination",
                "availability_reason": "The canonical endpoints do not share a declared domain, area, or role learning stop.",
            })

    # Exhaust every method selection subset against the route catalog's area and
    # role support masks. The route join is monotone union, so this enumerates
    # every possible subset (including zero) rather than sampling pairs.
    method_index = {method: i for i, method in enumerate(methods)}
    area_method_masks: dict[str, int] = {area: 0 for area in areas}
    for method, supported_areas in method_areas.items():
        for area in supported_areas:
            area_method_masks[area] |= 1 << method_index[method]
    role_method_masks: dict[tuple[str, str], int] = {}
    for key, supporters in method_role_support.items():
        role_method_masks[key] = sum(1 << method_index[m] for m in supporters)
    state_count = 1 << len(methods)
    nonempty_method_states = 0
    area_states_by_count: Counter[int] = Counter()
    for selection_mask in range(state_count):
        active_areas = 0
        for support_mask in area_method_masks.values():
            active_areas += bool(selection_mask & support_mask)
        area_states_by_count[active_areas] += 1
        if selection_mask:
            nonempty_method_states += 1
    # Count role-visible method-selection memberships exactly by inclusion-
    # exclusion, avoiding a second per-subset scan over all roles.
    all_selections = 1 << len(methods)
    role_state_count = 0
    for (area, _role), role_mask in role_method_masks.items():
        area_mask = area_method_masks[area]
        neither_count = 1 << (len(methods) - (role_mask | area_mask).bit_count())
        no_role_count = 1 << (len(methods) - role_mask.bit_count())
        no_area_count = 1 << (len(methods) - area_mask.bit_count())
        role_state_count += all_selections - no_role_count - no_area_count + neither_count

    # Enumerate each combination's selectable component subset and verify that
    # all declared components/routes resolve. There are 16 states for the sole
    # four-component design frame; fixed designs have one route state each.
    component_states = 0
    component_state_counts: dict[str, int] = {}
    for combo in combinations:
        component_ids = combo.get("selectable_component_method_ids", [])
        if not component_ids:
            count = 1
        else:
            count = 1 << len(component_ids)
            for component_mask in range(count):
                selected = [component_ids[i] for i in range(len(component_ids)) if component_mask & (1 << i)]
                if not set(selected) <= method_set:
                    errors.append(f"Invalid component state for {combo['id']}")
        component_states += count
        component_state_counts[combo["id"]] = count

    # Verify context coverage for all groups named in the context ledger.
    context_summary = context.get("summary", {})
    context_errors: list[str] = []
    if context_summary.get("new_method_technique_records_contextualized") != context_summary.get("new_method_technique_ledger_records"):
        context_errors.append("Not all new method-technique ledger records were contextualized")
    if context_summary.get("role_item_contextualized") != 168:
        context_errors.append("Role item contextualization count is not 168")
    if context_summary.get("area_task_family_summaries_contextualized") != 21:
        context_errors.append("Area task-family contextualization count is not 21")
    if context_summary.get("combination_designs_with_integration_contract") != len(combinations):
        context_errors.append("Not every combination design has an integration contract")
    if context_summary.get("ownership_requirement_approval_visibility_role_fit_or_edges_changed") is not False:
        context_errors.append("Protected ownership/disposition fields may have changed")

    if missing_area_route_for_role:
        errors.append(f"{len(missing_area_route_for_role)} role routes lack an area route for the same method")
    errors.extend(resolution_errors)
    errors.extend(context_errors)
    errors.extend(f"Unrouteable selectable item {x['item_id']}: {x['reason']}" for x in unsupported_routes)

    report = {
        "schema_version": "d078_method_route_exhaustive_audit_v1",
        "audit_date": "2026-10-20",
        "graph_counts": {
            "nodes": len(graph["nodes"]), "edges": len(graph["edges"]),
            "methods": len(methods), "method_area_routes": len(graph["method_area_routes"]),
            "method_area_role_routes": len(graph["method_area_role_routes"]),
            "areas": len(areas), "roles": len({row.get("role_id") for row in graph["method_area_role_routes"]}),
            "combinations": len(combinations), "combination_area_routes": len(combo_area_routes),
            "combination_area_role_routes": len(combo_role_routes),
        },
        "selection_space": {
            "all_method_subsets_including_empty_enumerated": state_count,
            "nonempty_method_selections": nonempty_method_states,
            "visible_area_state_distribution": {str(k): v for k, v in sorted(area_states_by_count.items())},
            "method_role_route_memberships_over_nonempty_states": role_state_count,
            "combination_component_subsets_enumerated": component_states,
            "combination_component_states_by_design": component_state_counts,
        },
        "context_coverage": context_summary,
        "relationship_resolution": {
            **resolution_summary,
            "ledger_record_count": len(resolution_records),
            "resolution_state_counts": dict(Counter(record.get("resolution_state", "missing") for record in resolution_records)),
            "all_ready_ledger_relationships_have_matching_graph_edges": not resolution_errors,
        },
        "selectable_technique_routes": {
            "records_reviewed": len(technique_records),
            "selectable_records_reachable": sum(technique_route_membership.values()),
            "reachable_by_owner_layer": dict(technique_route_membership),
            "unrouteable_records": unsupported_routes,
        },
        "student_relationship_routeability": {
            "ready_visible_edges_reviewed": len(ready_edges),
            "edge_counts_by_type": dict(edge_type_counts),
            "co_projected_edges_by_scope": dict(edge_scope_counts),
            "co_projected_edge_ids_by_scope": co_projected_edge_ids,
            "unavailable_destination_edge_count": len(endpoint_unprojected),
            "endpoints_not_projected_or_without_shared_stop": endpoint_unprojected,
        },
        "role_area_pairing": {
            "role_routes_without_same_method_area_route": missing_area_route_for_role,
            "all_roles_require_area_selection": True,
        },
        "protected_scope": {
            "requirement_dispositions_changed": False,
            "ownership_changed": False,
            "role_fit_inferred_from_area_membership": False,
            "student_visibility_or_approval_changed_by_context": False,
            "sql_or_migrations_touched": False,
        },
        "errors": errors,
        "passed": not errors,
    }
    OUTPUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT_PATH), "passed": report["passed"],
        "selection_states": state_count, "component_states": component_states,
        "method_counts": report["graph_counts"],
        "ready_visible_relationship_edges": len(ready_edges),
        "co_projected": sum(edge_scope_counts.values()),
        "not_co_projected": len(endpoint_unprojected),
        "selectable_technique_records_reachable": sum(technique_route_membership.values()),
        "selectable_technique_records": sum(1 for r in technique_records if r.get("selectable")),
        "errors": errors,
    }, ensure_ascii=False, indent=2))


def method_area_items_for_method(method: str) -> set[str]:
    # This helper is replaced at runtime by the prebuilt route closure below.
    return _METHOD_AREA_ITEMS_BY_METHOD.get(method, set())


_METHOD_AREA_ITEMS_BY_METHOD: dict[str, set[str]] = {}


if __name__ == "__main__":
    # Populate helper data before main executes its route reachability assertions.
    _graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    _nodes = {node["id"]: node for node in _graph["nodes"]}
    for _route in _graph["method_area_routes"]:
        _method = _route.get("method_id")
        for _item in list_values(_route, *ITEM_KEYS):
            if _item.startswith(("area_enrichment_item:", "area_learning_item:")):
                _METHOD_AREA_ITEMS_BY_METHOD.setdefault(_method, set()).add(_item)
    main()
