"""Read-only coverage report for D078 method/area routes and tool sources."""
from __future__ import annotations

import gzip
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"


def main() -> None:
    with gzip.open(GRAPH, "rt", encoding="utf-8") as stream:
        graph = json.load(stream)
    nodes = {row["id"]: row for row in graph["nodes"]}
    areas = {row.get("area_id"): row.get("label") for row in graph["nodes"]
             if row.get("kind") == "area_of_specialization"}
    methods = {item_id: nodes.get(item_id, {}).get("label", item_id)
               for item_id in graph.get("method_node_ids", [])}
    rows = []
    route_tool_evidence_gaps = []
    source_registry = graph.get("external_source_registry", {})

    def has_reviewable_source(node: dict) -> bool:
        """Recognize the graph's canonical and legacy embedded source shapes.

        Area-owned tool contracts keep complete source references under
        ``source_record.sourceReferences`` (and sometimes under a typed
        relationship). Emerging/domain items use source-ID lists resolved by
        ``external_source_registry``. Looking only at top-level ``evidence``
        or ``learning_links`` incorrectly reports these as unsourced.
        """
        if any(node.get(key) for key in ("evidence", "resources", "learning_links", "source_references", "source_refs")):
            return True
        if any(source_id in source_registry for key in (
            "evidence_source_ids", "explanatory_source_ids", "learning_resource_ids", "source_ids"
        ) for source_id in node.get(key, [])):
            return True
        record = node.get("source_record") or {}
        if record.get("linkUrl") and record.get("linkEvidence"):
            return True
        reference_lists = [record.get("sourceReferences", [])]
        reference_lists.extend(
            relation.get("sourceReferences", [])
            for relation in record.get("relationships", [])
            if isinstance(relation, dict)
        )
        if any(ref.get("url", "").startswith("https://") for refs in reference_lists for ref in refs if isinstance(ref, dict)):
            return True
        return False
    for route in graph.get("method_area_routes", []):
        tools = sorted(set(route.get("tool_ids", []) + route.get("domain_tool_ids", [])))
        for tool_id in tools:
            tool = nodes.get(tool_id, {})
            direct_route_edges = [edge for edge in graph.get("edges", [])
                                  if edge.get("relationship") == "method_route_reveals_tool"
                                  and edge.get("source") == route.get("route_node_id")
                                  and edge.get("target") == tool_id]
            method_edges = [edge for edge in graph.get("edges", [])
                            if edge.get("relationship") == "tool_for"
                            and edge.get("source") == tool_id
                            and edge.get("target") == route.get("method_id")]
            node_sources = has_reviewable_source(tool)
            edge_sources = any(edge.get("evidence_sources") for edge in direct_route_edges + method_edges)
            if not (node_sources or edge_sources):
                route_tool_evidence_gaps.append({
                    "method": methods.get(route.get("method_id"), route.get("method_id")),
                    "area": areas.get(route.get("area_id"), route.get("area_id")),
                    "tool_id": tool_id,
                    "label": tool.get("label"),
                })
        rows.append({
            "method": methods.get(route.get("method_id"), route.get("method_id")),
            "method_id": route.get("method_id"),
            "area": areas.get(route.get("area_id"), route.get("area_id")),
            "area_id": route.get("area_id"),
            "task_families": [nodes.get(item, {}).get("label", item) for item in route.get("task_family_ids", [])],
            "area_items": [nodes.get(item, {}).get("label", item) for item in route.get("area_item_ids", [])],
            "domain_items": [nodes.get(item, {}).get("label", item) for item in
                              route.get("task_linked_domain_item_ids", []) + route.get("domain_downstream_item_ids", [])],
            "tools": [nodes.get(item, {}).get("label", item) for item in tools],
            "tool_ids": tools,
            "role_ids": sorted({row.get("role_id") for row in graph.get("method_area_role_routes", [])
                                 if row.get("method_id") == route.get("method_id")
                                 and row.get("area_id") == route.get("area_id")}),
        })

    item_fields = ("area_item_ids", "task_linked_domain_item_ids", "domain_downstream_item_ids")
    misbucketed = Counter()
    unresolved = []
    for route in graph.get("method_area_routes", []):
        for field in item_fields:
            for item_id in route.get(field, []):
                if item_id not in nodes:
                    unresolved.append({"field": field, "item_id": item_id})
                elif nodes[item_id].get("item_type") == "tool" or nodes[item_id].get("kind") in {
                    "area_tool_option", "area_tool_application_reference",
                }:
                    misbucketed[field] += 1

    report = {
        "graph_date": "2026-10-19 (updated route-tool projection 2026-10-26)",
        "method_area_route_count": len(rows),
        "method_count": len(methods),
        "canonical_area_count": len(areas),
        "routes_without_explicit_tool_option": [
            {"method": row["method"], "area": row["area"], "task_families": row["task_families"],
             "area_items": row["area_items"], "domain_items": row["domain_items"]}
            for row in rows if not row["tools"]
        ],
        "routes_without_area_owned_learning_item": [
            {"method": row["method"], "area": row["area"], "task_families": row["task_families"],
             "domain_items": row["domain_items"]}
            for row in rows if not row["area_items"]
        ],
        "routes_without_domain_downstream_item": [
            {"method": row["method"], "area": row["area"], "task_families": row["task_families"],
             "area_items": row["area_items"]}
            for row in rows if not row["domain_items"]
        ],
        "route_tool_source_evidence_gaps": route_tool_evidence_gaps,
        "typed_tool_records_left_in_learning_item_fields": dict(misbucketed),
        "unresolved_route_item_ids": unresolved,
        "canonical_tool_nodes": [
            {"id": item_id, "label": node.get("label"), "owner_layer": node.get("owner_layer"),
             "area_id": node.get("area_id")}
            for item_id, node in nodes.items()
            if node.get("item_type") == "tool" or node.get("kind") in {
                "area_tool_option", "area_tool_application_reference",
            }
        ],
        "sociology_area_routes": [row for row in rows if row["area"] == "Sociology and Social Anthropology"],
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
