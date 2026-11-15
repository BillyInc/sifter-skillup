"""Repair typed tool projection on the D078 method/area route graph.

This pass does not invent tool-method or tool-area relationships. It uses only
canonical tool nodes and reviewed graph edges already marked ready for use.
It moves tool records out of learning-item buckets, projects them into the
appropriate tool bucket, and refreshes nested combination contributions from
their canonical single-method route.
"""
from __future__ import annotations

import gzip
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
DATE = "2026-10-26"
TOOL_RELATIONSHIPS = {"tool_for", "works_with", "area_item_has_contextual_tool_option"}
ROUTE_TOOL_RELATIONSHIP = "method_route_reveals_tool"
TOOL_ITEM_TYPES = {"tool", "programming_language", "python_library", "computational_environment"}
ITEM_FIELDS = ("area_item_ids", "task_linked_domain_item_ids", "domain_downstream_item_ids")
TOOL_FIELDS = ("tool_ids", "domain_tool_ids")
PROJECTION_FIELDS = (
    "task_family_ids", "area_item_ids", "task_linked_domain_item_ids",
    "available_item_ids", "tool_ids", "domain_downstream_item_ids",
    "domain_tool_ids",
)


def read_graph() -> dict[str, Any]:
    with gzip.open(GRAPH, "rt", encoding="utf-8") as stream:
        return json.load(stream)


def write_graph(graph: dict[str, Any]) -> None:
    temp = GRAPH.with_name(GRAPH.name + ".tmp")
    with gzip.open(temp, "wt", encoding="utf-8", compresslevel=9, newline="\n") as stream:
        json.dump(graph, stream, ensure_ascii=False, separators=(",", ":"))
        stream.write("\n")
    temp.replace(GRAPH)


def is_tool(node: dict[str, Any]) -> bool:
    return node.get("item_type") in TOOL_ITEM_TYPES or node.get("kind") in {
        "area_tool_option", "area_tool_application_reference",
    }


def owner_area(node: dict[str, Any]) -> str | None:
    area_id = node.get("area_id")
    if area_id:
        return str(area_id)
    owner = str(node.get("owner_layer") or "")
    return owner.removeprefix("area:") if owner.startswith("area:") else None


def scoped_bucket(node: dict[str, Any], route_area_id: str) -> str | None:
    area_id = owner_area(node)
    if area_id:
        return "tool_ids" if area_id == route_area_id else None
    return "domain_tool_ids"


def dedupe(values: list[str]) -> list[str]:
    return sorted(set(values))


def main() -> None:
    graph = read_graph()
    nodes = {node["id"]: node for node in graph["nodes"]}
    area_nodes = {node.get("area_id"): node for node in graph["nodes"]
                  if node.get("kind") == "area_of_specialization"}
    methods = set(graph.get("method_node_ids", []))

    # Index only explicit, reviewed tool-to-method/item edges. Explanatory
    # prose and broad `supports` links are deliberately insufficient.
    method_tools: dict[str, set[str]] = {}
    item_tools: dict[str, set[str]] = {}
    route_tools: dict[str, set[str]] = {}
    for edge in graph.get("edges", []):
        if edge.get("relationship") == ROUTE_TOOL_RELATIONSHIP:
            source, target = edge.get("source"), edge.get("target")
            if (source in nodes and target in nodes and is_tool(nodes[target])
                    and edge.get("status") == "resolved_ready_for_use"
                    and edge.get("student_visible") is True):
                route_tools.setdefault(str(source), set()).add(str(target))
            continue
        if edge.get("relationship") not in TOOL_RELATIONSHIPS:
            continue
        if edge.get("status") != "resolved_ready_for_use" or edge.get("student_visible") is not True:
            continue
        source, target = edge.get("source"), edge.get("target")
        if source not in nodes or target not in nodes or not is_tool(nodes[source]):
            # The contextual area-tool edge is item -> tool, unlike tool_for.
            if edge.get("relationship") == "area_item_has_contextual_tool_option" and target in nodes and is_tool(nodes[target]):
                item_tools.setdefault(str(source), set()).add(str(target))
            continue
        if target in methods:
            method_tools.setdefault(str(target), set()).add(str(source))
        else:
            item_tools.setdefault(str(target), set()).add(str(source))

    changed_routes = 0
    moved_from_item_fields = Counter()
    added_from_relationships = Counter()
    skipped_area_owned_tools = 0
    route_by_key: dict[tuple[str, str], dict[str, Any]] = {}

    for route in graph.get("method_area_routes", []):
        method_id, area_id = route.get("method_id"), route.get("area_id")
        if method_id not in methods or area_id not in area_nodes:
            raise ValueError(f"Unresolved method/area route: {method_id} / {area_id}")
        route_by_key[(str(method_id), str(area_id))] = route
        before = json.dumps({field: route.get(field, []) for field in (*ITEM_FIELDS, *TOOL_FIELDS)}, sort_keys=True)

        for field in ITEM_FIELDS:
            retained: list[str] = []
            for item_id in route.get(field, []):
                node = nodes.get(item_id)
                if node and is_tool(node):
                    bucket = scoped_bucket(node, str(area_id))
                    if bucket:
                        route.setdefault(bucket, []).append(item_id)
                        moved_from_item_fields[field] += 1
                    else:
                        # An area-owned tool for another area is not an item
                        # available on this route; do not leak it downstream.
                        skipped_area_owned_tools += 1
                    continue
                retained.append(item_id)
            route[field] = retained

        # An explicit method edge is route evidence for a domain tool. An
        # area-owned tool only applies when its owner is this selected area.
        for tool_id in method_tools.get(str(method_id), set()):
            bucket = scoped_bucket(nodes[tool_id], str(area_id))
            if bucket:
                if tool_id not in route.setdefault(bucket, []):
                    route[bucket].append(tool_id)
                    added_from_relationships["method_edge"] += 1
            else:
                skipped_area_owned_tools += 1

        # A route-specific evidence edge is narrower than a general method
        # edge and can safely surface the tool only for this method/area pair.
        route_node_id = str(route.get("route_node_id"))
        for tool_id in route_tools.get(route_node_id, set()):
            bucket = scoped_bucket(nodes[tool_id], str(area_id))
            if bucket:
                if tool_id not in route.setdefault(bucket, []):
                    route[bucket].append(tool_id)
                    added_from_relationships["route_edge"] += 1
            else:
                skipped_area_owned_tools += 1

        # A tool attached to an item in this exact route remains available
        # through that item, but is rendered in the tool lane, not as an item.
        route_item_ids = {item_id for field in ITEM_FIELDS for item_id in route.get(field, [])}
        for item_id in route_item_ids:
            for tool_id in item_tools.get(item_id, set()):
                bucket = scoped_bucket(nodes[tool_id], str(area_id))
                if bucket:
                    if tool_id not in route.setdefault(bucket, []):
                        route[bucket].append(tool_id)
                        added_from_relationships["item_edge"] += 1
                else:
                    skipped_area_owned_tools += 1

        for field in (*ITEM_FIELDS, *TOOL_FIELDS):
            route[field] = dedupe(route.get(field, []))
        # This is the selectable list for the route's method/area work. Keep
        # domain-downstream items in their own lane: they are projected to the
        # overall path separately and must not be mistaken for method-specific
        # items on a combination contribution.
        # The broad availability bucket is a source snapshot and may contain
        # typed tools as well as learning items. Tools have a dedicated UI
        # lane; never leave them duplicated in the selectable item bucket.
        for item_id in route.get("available_item_ids", []):
            node = nodes.get(item_id)
            if not node or not is_tool(node):
                continue
            bucket = scoped_bucket(node, str(area_id))
            if bucket:
                route.setdefault(bucket, []).append(item_id)
                moved_from_item_fields["available_item_ids"] += 1
                route["available_item_ids"] = [candidate for candidate in route["available_item_ids"] if candidate != item_id]
            else:
                skipped_area_owned_tools += 1
                route["available_item_ids"] = [candidate for candidate in route["available_item_ids"] if candidate != item_id]

        domain_downstream = set(route.get("domain_downstream_item_ids", []))
        available = [
            item_id for item_id in route.get("available_item_ids", [])
            if item_id not in domain_downstream and not is_tool(nodes.get(item_id, {}))
        ]
        route["available_item_ids"] = dedupe(
            available
            + list(route.get("area_item_ids", []))
            + list(route.get("task_linked_domain_item_ids", []))
        )

        after = json.dumps({field: route.get(field, []) for field in (*ITEM_FIELDS, *TOOL_FIELDS)}, sort_keys=True)
        changed_routes += before != after

    # Keep the route node and every combination contribution aligned with the
    # canonical route. Combinations remain nested by method; no union is made.
    route_nodes = {node.get("id"): node for node in graph["nodes"]}
    for route in graph["method_area_routes"]:
        route_node = route_nodes.get(route.get("route_node_id"))
        if route_node:
            for field in PROJECTION_FIELDS:
                route_node[field] = list(route.get(field, []))

    refreshed_contributions = 0
    for node in graph["nodes"]:
        contributions = node.get("method_contributions")
        if not isinstance(contributions, list):
            continue
        area_id = node.get("area_id")
        for contribution in contributions:
            method_id = contribution.get("method_id")
            source = route_by_key.get((str(method_id), str(area_id)))
            if not source:
                continue
            for field in PROJECTION_FIELDS:
                contribution[field] = list(source.get(field, []))
            refreshed_contributions += 1

    # Combination records also carry their nested contribution data.
    for design in graph.get("combination_designs", []):
        for area_route in design.get("area_routes", []):
            for contribution in area_route.get("method_contributions", []):
                source = route_by_key.get((str(contribution.get("method_id")), str(area_route.get("area_id"))))
                if not source:
                    continue
                for field in PROJECTION_FIELDS:
                    contribution[field] = list(source.get(field, []))
        for variant in design.get("component_route_variants", []):
            for area_route in variant.get("area_routes", []):
                for contribution in area_route.get("method_contributions", []):
                    source = route_by_key.get((str(contribution.get("method_id")), str(area_route.get("area_id"))))
                    if not source:
                        continue
                    for field in PROJECTION_FIELDS:
                        contribution[field] = list(source.get(field, []))

    # The UI exports combination area-route nodes directly, so refresh their
    # contribution snapshots and derived selectable/tool lists as well.
    for route_node in graph["nodes"]:
        if route_node.get("kind") != "combination_area_route":
            continue
        area_id = str(route_node.get("area_id"))
        for contribution in route_node.get("method_contributions", []):
            source = route_by_key.get((str(contribution.get("method_id")), area_id))
            if not source:
                continue
            for field in PROJECTION_FIELDS:
                contribution[field] = list(source.get(field, []))
        contributions = route_node.get("method_contributions", [])
        for field in PROJECTION_FIELDS:
            # Combination routes preserve component lanes instead of
            # flattening them into a second generic item/task list.
            if field in {"task_family_ids", "available_item_ids"}:
                route_node[field] = []
            elif field == "area_item_ids":
                route_node[field] = dedupe([item for row in contributions for item in row.get(field, [])])
            elif field == "tool_ids":
                route_node[field] = dedupe([item for row in contributions for item in row.get(field, [])])
            elif field == "domain_tool_ids":
                route_node[field] = dedupe([item for row in contributions for item in row.get(field, [])])
            elif field == "domain_downstream_item_ids":
                # Component-specific Layer 2/3 items remain on their method
                # contribution and are resolved by the layer applicability
                # contract. They are not a flattened core list for the whole
                # named design.
                route_node[field] = []
            elif field == "task_linked_domain_item_ids":
                route_node[field] = dedupe([item for row in contributions for item in row.get(field, [])])
        refreshed_contributions += len(contributions)

    # Retain a machine-readable change ledger in the graph itself.
    graph["route_tool_projection_repair"] = {
        "date": DATE,
        "basis": "canonical typed tools plus source-backed resolved route-specific method_route_reveals_tool edges and reviewed tool/item relationships",
        "method_area_routes_checked": len(graph.get("method_area_routes", [])),
        "method_area_routes_changed": int(changed_routes),
        "typed_tools_moved_out_of_learning_item_fields": dict(moved_from_item_fields),
        "tools_added_from_existing_relationships": dict(added_from_relationships),
        "area_owned_tools_not_projected_outside_owner_area": skipped_area_owned_tools,
        "combination_contribution_records_refreshed": refreshed_contributions,
        "new_nodes_or_relationship_edges_created": 0,
        "student_visibility_changed": False,
    }

    # Validate that tool IDs resolve and typed tools are no longer in the
    # learning-specific method route buckets.
    for route in graph.get("method_area_routes", []):
        for field in (*ITEM_FIELDS, *TOOL_FIELDS, "available_item_ids"):
            missing = [item_id for item_id in route.get(field, []) if item_id not in nodes]
            if missing:
                raise AssertionError(f"Unresolved IDs in {field}: {missing[:5]}")
        for field in ITEM_FIELDS:
            misplaced = [item_id for item_id in route.get(field, []) if is_tool(nodes[item_id])]
            if misplaced:
                raise AssertionError(f"Tool records remain in {field}: {misplaced[:5]}")

    write_graph(graph)
    print(json.dumps(graph["route_tool_projection_repair"], indent=2))


if __name__ == "__main__":
    main()
