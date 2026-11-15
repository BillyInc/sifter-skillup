"""Export the minimum typed UI projection source from the canonical D078 graph.

The checked-in route graph remains authoritative. This creates a compact JSON
bundle for Metro/Vite instead of importing the full audit artifact at runtime.
"""

from __future__ import annotations

import json
import gzip
import os
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
OUT = ROOT / "src/data/d078MethodAwareUiData.json"

NODE_FIELDS = {
    "id", "kind", "item_type", "label", "name", "domain_id", "area_id", "role_id",
    "programme_id", "theme_id", "course_id", "course_title", "course_code",
    "description", "narration", "overview", "overview_evidence", "overview_contract_id",
    "scope_limit", "overview_source_artifact", "overview_source_status",
    "overview_source_references", "supported_role_ids", "supported_area_ids",
    "area_overview_is_not_a_learning_requirement", "role_context_is_not_job_readiness",
    "student_orientation", "orientation_evidence_by_field", "programme_transition",
    "meaning", "plain_language_meaning", "meaning_in_domain",
    "programme_learning_context",
    "what_it_is", "why_it_matters", "field_context", "task_conditions",
    "learner_output", "limitations", "valid_alternatives", "requirement_lane", "requirement_level",
    "requirement_reason", "requirement_scope", "blocking_policy", "skippable", "student_visible",
    "student_display_approved", "student_display_eligibility_reason", "approval_status",
    "approval", "relationships", "relationship_resolution_records", "learning_links", "resources", "source_refs", "why_combine",
    "review_status", "source_references", "area_task_family_links", "task_family_selection_role",
    "source_task_id", "area_ids", "task_evidence_text",
    "how_used", "how_it_is_used", "condition", "limits", "selection_rule", "combination_mode",
    "required_method_ids", "selectable_component_method_ids", "foundation_links", "design", "task_family_id",
    "sequence_kind", "sequence_order", "plainMeaning", "explanation", "what_you_might_produce",
    "display_group", "theme_label", "student_text", "source_text", "course_anchor_ids",
    "resolution_state", "display_readiness", "external_tool_resolution",
    "route_resolution", "route_display_condition", "learning_resource_ids",
    "selectable", "student_selectable", "canonical_linked_item_ids", "resolution_rationale",
    "contextual_application", "downstream_route_context", "integration_contract", "context_source",
    "shared_area_foundation", "task_preparation_context",
    "role_item_reconciliation", "role_task_relationship_verified", "role_task_item_reconciliation_status",
    "role_task_item_reconciliation_reason", "source_ledger_role_task_relationship_verified",
    "role_application", "task_output", "programme_meaning",
    "domain_meaning", "area_meaning", "prerequisites", "complements", "valid_alternatives",
    "alternative_note_dispositions",
    "limits_nonreplacement", "evidence", "use_case", "contextual_use",
    "method_contributions", "match_rule", "ambiguous_match_rule", "route_basis",
    "route_status", "student_explanation", "route_derivation", "canonical_tool_id",
    "official_reference", "required_selected_domain_item_ids", "inherited_domain_item_ids",
    "display_stage",
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
        referenced.update(route.get("area_foundation_ids", []))
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
    projected_route_relations = {
        "method_applies_to_area_task", "method_contribution_applies_to_area_task",
        "domain_item_supports_area_task", "task_has_area_learning_item",
        "area_task_family_supports_role_task", "role_task_family_of_role",
    }
    for edge in graph.get("edges", []):
        is_reviewed_sequence = (
            str(edge.get("id", "")).startswith("area-sequence:")
            and edge.get("sequence_approved") is True
        )
        if (edge.get("relationship") in projected_route_relations or is_reviewed_sequence) and edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True:
            referenced.update((edge.get("source"), edge.get("target")))
    role_tool_routes = graph.get("role_tool_routes", [])
    for route in role_tool_routes:
        referenced.update([route.get("role_id"), route.get("tool_node_id"), route.get("task_node_id")])
    combo_area_route_nodes = [node for node in graph["nodes"] if node.get("kind") == "combination_area_route"]
    combo_role_route_nodes = [node for node in graph["nodes"] if node.get("kind") == "combination_area_role_route"]
    referenced.update(node["id"] for node in combo_area_route_nodes)
    referenced.update(node["id"] for node in combo_role_route_nodes)
    route_item_fields = (
        "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
        "tool_ids", "domain_downstream_item_ids", "domain_tool_ids",
        "explanatory_item_ids", "task_family_ids", "area_foundation_ids", "role_ids", "role_route_ids",
        "role_item_ids", "method_specific_role_item_ids",
    )
    for route_node in combo_area_route_nodes + combo_role_route_nodes:
        for field in route_item_fields:
            referenced.update(route_node.get(field, []))
        for contribution in route_node.get("method_contributions", []):
            for field in route_item_fields:
                referenced.update(contribution.get(field, []))
        for role_id, contributions in route_node.get("role_contributions_by_id", {}).items():
            referenced.add(role_id)
            for contribution in contributions:
                for field in route_item_fields:
                    referenced.update(contribution.get(field, []))
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
            referenced.update(area_route.get("area_foundation_ids", []))
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
    def relationship_evidence(edge: dict) -> tuple[list[dict], str | None]:
        """Preserve pair-specific evidence from the source graph for UI gates."""
        refs: list[dict] = []
        basis = edge.get("evidence_basis")

        def add_reference(value, default_role: str) -> None:
            if isinstance(value, str):
                value = {"url": value}
            if not isinstance(value, dict):
                return
            url = str(value.get("url") or value.get("source_url") or "").strip()
            locator = str(value.get("locator") or "").strip()
            if not url and not locator:
                return
            ref = dict(value)
            ref.setdefault("source_role", default_role)
            refs.append(ref)

        for value in edge.get("source_references") or []:
            add_reference(value, "relationship_evidence")

        relationship = edge.get("relationship")
        if relationship in {"alternative_to", "alternative_tool_option"}:
            for value in edge.get("evidence_sources") or []:
                add_reference(value, "alternative_relationship_evidence")
            # Tool alternatives may carry the pair-specific references inside
            # a role-tool context. Do not treat generic tool/task references as
            # evidence for the alternative relationship itself.
            route_context = edge.get("route_context") or {}
            for nested in route_context.get("relationships") or []:
                if nested.get("type") != "alternative_to":
                    continue
                for value in nested.get("source_references") or []:
                    item = dict(value) if isinstance(value, dict) else {"url": value}
                    evidence_type = str(item.pop("evidenceType", "") or "")
                    item.setdefault("source_role", "alternative_relationship_evidence")
                    if evidence_type:
                        item["evidence_type"] = evidence_type
                    add_reference(item, "alternative_relationship_evidence")
            if any(ref.get("source_role") == "alternative_relationship_evidence" for ref in refs):
                basis = basis or "source_backed_alternative_relationship"

        if relationship == "tool_alternative_for_role_task":
            route_context = edge.get("route_context") or {}
            for nested in route_context.get("relationships") or []:
                if nested.get("type") != "alternative_to":
                    continue
                for value in nested.get("source_references") or []:
                    item = dict(value) if isinstance(value, dict) else {"url": value}
                    evidence_type = str(item.pop("evidenceType", "") or "")
                    item.setdefault("source_role", "role_task_tool_alternative_evidence")
                    if evidence_type:
                        item["evidence_type"] = evidence_type
                    add_reference(item, "role_task_tool_alternative_evidence")
            if any(ref.get("source_role") == "role_task_tool_alternative_evidence" for ref in refs):
                basis = basis or "source_backed_role_task_tool_alternative"

        unique: dict[tuple[str, str, str], dict] = {}
        for ref in refs:
            key = (
                str(ref.get("source_role") or ""),
                str(ref.get("url") or ref.get("source_url") or ""),
                str(ref.get("locator") or ""),
            )
            unique[key] = ref
        return list(unique.values()), basis

    typed_relationship_edges = []
    for edge in graph["edges"]:
        if not (
            edge.get("status") == "resolved_ready_for_use"
            and edge.get("student_visible") is True
            and (edge.get("source") in clean_nodes or edge.get("target") in clean_nodes)
            and edge.get("source") in all_node_ids
            and edge.get("target") in all_node_ids
        ):
            continue
        source_references, evidence_basis = relationship_evidence(edge)
        typed_relationship_edges.append(
        {
            "id": edge["id"],
            "sourceId": edge["source"],
            "targetId": edge["target"],
            "relationship": edge["relationship"],
            "status": edge.get("status"),
            "blockingPolicy": edge.get("blocking_policy", "never"),
            "sequencePolicy": edge.get("sequence_policy", "none"),
            "sequenceApproved": edge.get("sequence_approved", False),
            "sequenceScope": edge.get("sequence_scope"),
            "explanation": edge.get("explanation") or edge.get("rationale"),
            "explanationBasis": edge.get("explanation_basis"),
            # Resolution is graph identity, while availability is the active
            # projection. Keep a resolved edge from a projected source even if
            # its destination is outside this route; the panel can then show
            # the approved hidden-target explanation without exposing an ID.
            "sourceResolved": edge["source"] in all_node_ids,
            "targetResolved": edge["target"] in all_node_ids,
            "routeAvailability": edge.get("route_availability", {}).get("state"),
            "routeAvailabilityReason": edge.get("route_availability", {}).get("reason"),
            "evidenceBasis": evidence_basis,
            "evidenceSourceIds": edge.get("evidence_source_ids", []) or edge.get("source_ids", []),
            "sourceReferences": source_references,
            "alternativeReviewDisposition": edge.get("alternative_review_disposition"),
            "selectable": edge.get("selectable", False),
            "condition": edge.get("condition"),
            "areaId": edge.get("area_id"),
            "roleId": (edge.get("route_context") or {}).get("role_id"),
            "roleTaskId": (edge.get("route_context") or {}).get("task_node_id"),
            "roleAreaIds": (edge.get("route_context") or {}).get("area_ids", []),
            "fitClaimLimit": edge.get("fit_claim_limit"),
            "confidence": edge.get("confidence"),
            "recommendationOnly": edge.get("recommendation_only", False),
        })
    payload = {
        "source_schema_version": graph["schema_version"],
        "student_visible": graph["student_visible"],
        "student_ui_gate": graph.get("student_ui_gate", {}),
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
        "area_task_family_selection_contract": graph.get("area_task_family_selection_contract", {}),
        "area_foundation_contract": graph.get("area_foundation_contract", {}),
        "area_role_overview_reconciliation": graph.get("area_role_overview_reconciliation", {}),
        "area_sequence_reconciliation": graph.get("area_sequence_reconciliation", {}),
        "role_learning_sequence_contract": graph.get("role_learning_sequence_contract", {}),
        "alternative_relationship_reconciliation": graph.get("alternative_relationship_reconciliation", {}),
        # The exhaustive per-route inventory is an audit artifact (and is
        # retained in the canonical compressed graph). The app uses the
        # aggregate counts only; embedding every audited route here makes the
        # Metro/Vite bundle needlessly enormous.
        "selection_progression_contract": {
            "version": graph.get("selection_progression_contract", {}).get("version"),
            "counts": graph.get("selection_progression_contract", {}).get("counts", {}),
        },
        "method_area_routes": graph["method_area_routes"],
        "method_area_role_routes": graph["method_area_role_routes"],
        "role_tool_routes": role_tool_routes,
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
    encoded_payload = (json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    with tempfile.NamedTemporaryFile(dir=OUT.parent, delete=False) as handle:
        output_temp = Path(handle.name)
        handle.write(encoded_payload)
    try:
        os.replace(output_temp, OUT)
    finally:
        output_temp.unlink(missing_ok=True)
    print(json.dumps({"output": str(OUT), "bytes": OUT.stat().st_size, "nodes": len(clean_nodes),
                      "methods": len(payload["method_node_ids"]),
                      "combinations": len(payload["combination_designs"]),
                      "area_routes": len(payload["method_area_routes"]),
                      "role_routes": len(payload["method_area_role_routes"])}))


if __name__ == "__main__":
    main()
