"""Export the minimum typed UI projection source from the canonical D078 graph.

The checked-in route graph remains authoritative. This creates a compact JSON
bundle for Metro/Vite instead of importing the full audit artifact at runtime.
"""

from __future__ import annotations

import json
import gzip
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
OUT = ROOT / "src/data/d078MethodAwareUiData.json"

NODE_FIELDS = {
    "id", "kind", "item_type", "label", "name", "domain_id", "area_id", "role_id",
    "programme_id", "theme_id", "course_id", "course_title", "course_code",
    "description", "narration", "overview", "overview_evidence", "overview_contract_id",
    "student_orientation", "orientation_evidence_by_field", "programme_transition",
    "meaning", "plain_language_meaning", "meaning_in_domain",
    "programme_learning_context",
    "what_it_is", "learner_output", "limitations", "requirement_lane", "requirement_level",
    "requirement_reason", "requirement_scope", "blocking_policy", "skippable", "student_visible",
    "approval", "relationships", "relationship_resolution_records", "learning_links", "resources", "source_refs", "why_combine",
    "how_used", "how_it_is_used", "condition", "limits", "selection_rule", "combination_mode",
    "required_method_ids", "selectable_component_method_ids", "foundation_links", "design", "task_family_id",
    "sequence_kind", "sequence_order", "plainMeaning", "explanation", "what_you_might_produce",
    "display_group", "theme_label", "student_text", "source_text", "course_anchor_ids",
    "resolution_state", "display_readiness", "external_tool_resolution",
    "route_resolution", "route_display_condition", "learning_resource_ids",
    "selectable", "canonical_linked_item_ids", "resolution_rationale",
    "contextual_application", "downstream_route_context", "integration_contract", "context_source",
    "role_item_reconciliation", "role_application", "task_output", "programme_meaning",
    "domain_meaning", "area_meaning", "prerequisites", "complements", "valid_alternatives",
    "limits_nonreplacement", "evidence", "use_case", "contextual_use",
    "method_contributions", "match_rule", "ambiguous_match_rule", "route_basis",
    "route_status", "student_explanation", "route_derivation",
}


def main() -> None:
    if GRAPH.exists():
        graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    else:
        with gzip.open(GRAPH_GZ, "rt", encoding="utf-8") as source:
            graph = json.load(source)
    nodes = {node["id"]: node for node in graph["nodes"]}
    all_node_ids = set(nodes)
    referenced: set[str] = set(graph["foundation_item_ids"])
    referenced.update(graph["method_node_ids"])
    referenced.update(graph["programme_transition"]["programme_theme_ids"])
    referenced.update(graph["programme_transition"]["programme_outcome_ids"])
    referenced.update({"domain:D078", graph["programme_transition"]["programme_id"]})
    for layer in graph.get("domain_learning_layers", []):
        referenced.update(layer.get("item_ids", []))
        if layer.get("node_id"):
            referenced.add(layer["node_id"])
    for route in graph["method_area_routes"]:
        referenced.add(route["route_node_id"])
        referenced.update(route.get("task_family_ids", []))
        for key in (
            "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
            "tool_ids", "domain_downstream_item_ids", "domain_tool_ids",
            "explanatory_item_ids",
        ):
            referenced.update(route.get(key, []))
    for route in graph["method_area_role_routes"]:
        referenced.add(route["route_node_id"])
        referenced.add(route["role_id"])
        referenced.update(route.get("role_item_ids", []))
        referenced.update(route.get("method_specific_role_item_ids", []))
    combo_area_route_nodes = [node for node in graph["nodes"] if node.get("kind") == "combination_area_route"]
    combo_role_route_nodes = [node for node in graph["nodes"] if node.get("kind") == "combination_area_role_route"]
    referenced.update(node["id"] for node in combo_area_route_nodes)
    referenced.update(node["id"] for node in combo_role_route_nodes)
    for combination in graph["combination_designs"]:
        referenced.add(combination["id"])
        for contribution in combination.get("method_contributions", []):
            if contribution.get("method_id"):
                referenced.add(contribution["method_id"])
        for area_route in combination.get("area_routes", []):
            referenced.update(area_route.get("role_ids", []))
            referenced.update(area_route.get("role_route_ids", []))
            referenced.update(area_route.get("role_item_ids", []))
            referenced.update(area_route.get("method_specific_role_item_ids", []))
            referenced.update(area_route.get("area_item_ids", []))
            referenced.update(area_route.get("task_family_ids", []))
            referenced.update(area_route.get("tool_ids", []))
            referenced.update(area_route.get("domain_tool_ids", []))
            referenced.update(area_route.get("task_linked_domain_item_ids", []))
            referenced.update(area_route.get("domain_downstream_item_ids", []))
            referenced.update(area_route.get("explanatory_item_ids", []))
    referenced.update(node["id"] for node in graph["nodes"] if node.get("kind") == "area_of_specialization")
    clean_nodes = {
        node_id: {key: value for key, value in nodes[node_id].items() if key in NODE_FIELDS}
        for node_id in sorted(referenced)
        if node_id in nodes
    }
    typed_relationship_edges = [
        {
            "id": edge["id"],
            "sourceId": edge["source"],
            "targetId": edge["target"],
            "relationship": edge["relationship"],
            "status": edge.get("status"),
            "blockingPolicy": edge.get("blocking_policy", "never"),
            "sequencePolicy": edge.get("sequence_policy", "none"),
            "explanation": edge.get("explanation"),
            "explanationBasis": edge.get("explanation_basis"),
            # Resolution is graph identity, while availability is the active
            # projection. Keep a resolved edge from a projected source even if
            # its destination is outside this route; the panel can then show
            # the approved hidden-target explanation without exposing an ID.
            "sourceResolved": edge["source"] in all_node_ids,
            "targetResolved": edge["target"] in all_node_ids,
            "routeAvailability": edge.get("route_availability", {}).get("state"),
            "routeAvailabilityReason": edge.get("route_availability", {}).get("reason"),
        }
        for edge in graph["edges"]
        if edge.get("status") == "resolved_ready_for_use"
        and edge.get("student_visible") is True
        and (edge.get("source") in clean_nodes or edge.get("target") in clean_nodes)
        and edge.get("source") in all_node_ids
        and edge.get("target") in all_node_ids
    ]
    payload = {
        "source_schema_version": graph["schema_version"],
        "student_visible": graph["student_visible"],
        "programme_transition": graph["programme_transition"],
        "programme_method_context": graph.get("programme_method_context", {}),
        "domain_learning_layers": graph.get("domain_learning_layers", []),
        "method_item_fit_audit": graph.get("method_item_fit_audit", {}),
        "external_source_registry": graph.get("external_source_registry", {}),
        "foundation_item_ids": graph["foundation_item_ids"],
        "method_choice_node_id": graph["method_choice_node_id"],
        "method_node_ids": graph["method_node_ids"],
        "combination_designs": [
            {**combination, "integration_contract": nodes.get(combination["id"], {}).get("integration_contract") or combination.get("integration_contract"),
             "method_contributions": nodes.get(combination["id"], {}).get("method_contributions", combination.get("method_contributions", [])),
             "match_rule": nodes.get(combination["id"], {}).get("match_rule", combination.get("match_rule")),
             "ambiguous_match_rule": nodes.get(combination["id"], {}).get("ambiguous_match_rule", combination.get("ambiguous_match_rule"))}
            for combination in graph["combination_designs"]
        ],
        "method_combination_selection_contract": graph.get("method_combination_selection_contract", {}),
        "method_area_routes": graph["method_area_routes"],
        "method_area_role_routes": graph["method_area_role_routes"],
        "combination_area_routes": [
            {key: value for key, value in node.items() if key != "student_visible"}
            for node in combo_area_route_nodes
        ],
        "combination_area_role_routes": [
            {key: value for key, value in node.items() if key != "student_visible"}
            for node in combo_role_route_nodes
        ],
        "typed_relationship_edges": typed_relationship_edges,
        "nodes_by_id": clean_nodes,
        "context_enrichment_summary": graph.get("context_enrichment_summary", {}),
        "routing_policy": graph.get("routing_policy", {}),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "bytes": OUT.stat().st_size, "nodes": len(clean_nodes),
                      "methods": len(payload["method_node_ids"]),
                      "combinations": len(payload["combination_designs"]),
                      "area_routes": len(payload["method_area_routes"]),
                      "role_routes": len(payload["method_area_role_routes"])}))


if __name__ == "__main__":
    main()
