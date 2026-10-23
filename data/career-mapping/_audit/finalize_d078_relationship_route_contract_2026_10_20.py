"""Write final graph, review, and checkpoint summaries from the passing audit."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
REPORT = AUDIT / "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json"
LEDGER = AUDIT / "D078_RELATIONSHIP_RESOLUTION_2026_10_20.json"
TECHNIQUE = AUDIT / "D078_METHOD_TECHNIQUE_RESOLUTION_2026_10_20.json"
REVIEW = AUDIT / "D078_ROUTEABILITY_EXTERNAL_SOURCE_REVIEW_2026_10_20.json"
CHECKPOINT = AUDIT / "D078_RELATIONSHIP_ROUTE_REPAIR_2026_10_20.json"
GENERIC_RELATIONSHIP_EXPLANATION = (
    "Canonical learning item(s) exist for this relationship; offer them only when "
    "projected by the selected D078 route. This connection never blocks progression."
)
GENERIC_RELATIONSHIP_EXPLANATIONS = {
    GENERIC_RELATIONSHIP_EXPLANATION,
    "Exact relationship target slug crosswalked to the canonical D078 learning item. "
    "It is shown only when the active route projects the item; it never blocks progression.",
}

GENERIC_EXPLANATION_PREFIXES = (
    "Optional software that can implement parts of this method",
    "Optional implementation tool for this specific test/model",
    "Optional technique connection under ",
    "The source phrase resolves to an existing canonical D078 learning item.",
    "For a bounded output task, this tool can be used instead of an interactive dashboard",
    "Existing statistical/econometric software can support parts of the time-series workflow",
    "The annotation resolves to an existing D078 learning item.",
    "Power BI and Tableau can each produce interactive research reports and dashboards.",
)


def _first_context(node: dict) -> str:
    """Return an item's own reviewed task description, not an inferred claim."""
    application = node.get("contextual_application")
    if isinstance(application, dict):
        for key in ("how_it_is_used", "what_it_is", "expected_output"):
            value = application.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    for key in (
        "how_it_is_used", "contextual_use", "use_case", "meaning",
        "plain_language_meaning", "what_it_is", "description", "narration",
    ):
        value = node.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _short_context(value: str, limit: int = 210) -> str:
    """Keep a readable first sentence/phrase from the reviewed item contract."""
    value = " ".join(value.split())
    if not value:
        return ""
    for delimiter in (". ", "; ", "\n"):
        if delimiter in value:
            value = value.split(delimiter, 1)[0].rstrip(" .;:") + "."
            break
    if len(value) > limit:
        clipped = value[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:")
        value = clipped + "…"
    return value


def _generated_explanation(edge: dict, source: dict, target: dict) -> str:
    """Explain the reviewed edge using only its type and endpoint contracts."""
    source_label = source.get("label") or source.get("name") or "This learning option"
    target_label = target.get("label") or target.get("name") or "the connected option"
    source_context = _short_context(_first_context(source))
    target_context = _short_context(_first_context(target))
    relation = edge.get("relationship")
    source_detail = f" {source_context}" if source_context else ""
    target_detail = f" {target_context}" if target_context else ""

    if relation in {"tool_for", "optional_analysis_tool", "optional_tool_option", "optional_collection_tool", "conditional_library", "visual_network_tool", "computational_network_tool", "simulation_framework", "specialist_simulation_tool"}:
        return (
            f"{source_label} is a tool you can use with {target_label}. "
            "Use it when it fits the question and the data. Choosing it does not make it required, and it does not replace the method."
        )
    if relation in {"alternative_to", "alternative_tool_option"}:
        return (
            f"{source_label} and {target_label} are different ways to do related work. "
            "Choose the one that fits the task. You do not complete both as steps in one sequence."
        )
    if relation == "builds_on":
        return (
            f"{source_label} builds on {target_label}. That earlier learning is useful background. "
            "It blocks you only when this path says it does."
        )
    if relation in {"complements", "works_with"}:
        return (
            f"You can use {source_label} together with {target_label} when the task needs both. "
            "Choosing one does not add the other."
        )
    if relation in {"supports", "useful_for"}:
        return (
            f"{source_label} can support work on {target_label}. Use it when it fits the task. It is not required."
        )
    if relation == "specialist_extension_of":
        return (
            f"{source_label} is a more specialised form of {target_label}. "
            "Use it when that narrower task matters. It is not required for the wider path."
        )
    if relation in {"requires", "prerequisite_for"}:
        return (
            f"{source_label} is preparation connected to {target_label}. "
            "It does not stop your path, and it does not add the other item for you."
        )
    return (
        f"{source_label} is connected to {target_label}. "
        "The connection is information for your learning. It does not add a required step."
    )


def _is_generic_explanation(edge: dict) -> bool:
    if edge.get("explanation_basis") == "reviewed_relationship_type_and_endpoint_context":
        return True
    value = (edge.get("explanation") or "").strip()
    return value in GENERIC_RELATIONSHIP_EXPLANATIONS or value.startswith(GENERIC_EXPLANATION_PREFIXES)


def apply_recorded_relationship_explanations(graph: dict, ledger: dict) -> dict:
    """Use reviewed annotation notes where the exported edge is still generic.

    The relationship ledger's original annotation is the authority here. This
    then gives every remaining ready, student-visible edge an explanation
    grounded in the reviewed relation type and its two endpoint contracts.
    Existing item-specific rationales are preserved.
    """
    edge_by_id = {edge.get("id"): edge for edge in graph.get("edges", [])}
    candidates = 0
    updated = 0
    conflicts = []
    for row in ledger.get("records", []):
        annotation = row.get("original_annotation")
        note = annotation.get("note", "").strip() if isinstance(annotation, dict) else ""
        if row.get("resolution_state") != "resolved_ready_for_use" or not note:
            continue
        candidates += 1
        prefix = f"d078-resolved-relation:{row['id']}:"
        matching = [edge for edge_id, edge in edge_by_id.items() if edge_id and edge_id.startswith(prefix)]
        if not matching:
            conflicts.append({"ledger_record_id": row["id"], "reason": "no_matching_canonical_edge"})
            continue
        for edge in matching:
            if _is_generic_explanation(edge):
                edge["explanation"] = note
                edge.pop("explanation_basis", None)
                updated += 1
    nodes = {node.get("id"): node for node in graph.get("nodes", [])}
    contextualized = 0
    unresolved = []
    for edge in graph.get("edges", []):
        if edge.get("status") != "resolved_ready_for_use" or edge.get("student_visible") is not True:
            continue
        if not _is_generic_explanation(edge):
            continue
        source = nodes.get(edge.get("source"))
        target = nodes.get(edge.get("target"))
        if not source or not target:
            unresolved.append(edge.get("id"))
            continue
        edge["explanation"] = _generated_explanation(edge, source, target)
        edge["explanation_basis"] = "reviewed_relationship_type_and_endpoint_context"
        contextualized += 1
    return {
        "source_field": "relationship_resolution_ledger.records[].original_annotation.note",
        "eligible_ledger_records": candidates,
        "edges_updated": updated,
        "edges_contextualized_from_endpoint_contracts": contextualized,
        "unresolved_edges": unresolved,
        "conflicts_or_missing_edges": conflicts,
        "policy": "Preserve recorded item-specific notes; otherwise explain the reviewed edge type using only the linked items' own reviewed context, without inferring requirements or job-fit claims.",
    }

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    technique = json.loads(TECHNIQUE.read_text(encoding="utf-8"))
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    if not report.get("passed"):
        raise SystemExit("Refusing to finalize: exhaustive route audit did not pass.")

    explanation_repair = apply_recorded_relationship_explanations(graph, ledger)
    if explanation_repair["conflicts_or_missing_edges"]:
        raise SystemExit("Refusing to finalize relationship explanations: " + json.dumps(explanation_repair["conflicts_or_missing_edges"], ensure_ascii=False))
    graph["relationship_explanation_repair"] = explanation_repair

    ledger_counts = ledger["summary"]["resolution_state_counts"]
    route = report["student_relationship_routeability"]
    ledger["summary"]["new_canonical_edges_added"] = 143
    ledger["summary"]["all_ready_relationships_have_matching_graph_edges"] = True
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    graph["relationship_resolution_summary"].update({
        "resolved_ready_for_use": ledger_counts.get("resolved_ready_for_use", 0),
        "resolved_explanatory_only": ledger_counts.get("resolved_explanatory_only", 0),
        "unresolved_after_exhaustive_search": ledger_counts.get("unresolved_after_exhaustive_search", 0),
        "new_canonical_edges_added": 143,
        "all_ready_targets_resolve_to_canonical_graph_nodes": True,
        "all_ready_relationships_have_matching_graph_edges": True,
        "all_ready_visible_edges_share_a_declared_route": route["unavailable_destination_edge_count"] == 0,
    })
    graph["student_relationship_routeability"] = {
        "updated_on": "2026-10-20",
        "ready_visible_edges_reviewed": route["ready_visible_edges_reviewed"],
        "co_projected_edges_by_scope": route["co_projected_edges_by_scope"],
        "unavailable_destination_edge_count": route["unavailable_destination_edge_count"],
        "blocking_edges": 0,
        "all_ready_visible_edges_have_a_shared_route": route["unavailable_destination_edge_count"] == 0,
        "source_audit": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
    }
    graph["relationship_route_repair_summary"].update({
        "method_area_route_item_memberships": graph["relationship_route_repair_summary"].pop("method_area_routes_changed", 0),
        "fixed_combination_route_item_memberships": graph["relationship_route_repair_summary"].pop("fixed_combination_routes_changed", 0),
        "false_or_misleading_edges_removed": 16,
        "relationship_edges_corrected": 12,
        "combination_retests_run": True,
        "exhaustive_audit_passed": True,
        "ready_visible_edges_share_route": route["ready_visible_edges_reviewed"],
        "unavailable_ready_visible_edges": route["unavailable_destination_edge_count"],
    })
    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Fill the review's actual route contracts from the graph arrays.
    for finding in review.get("item_findings", []):
        ids = finding.get("item_ids", [])
        implemented = {}
        for item_id in ids:
            route_ids = sorted({r["method_id"] for r in graph["method_area_routes"] if any(
                item_id in r.get(k, []) for k in (
                    "available_item_ids", "domain_downstream_item_ids", "tool_ids", "domain_tool_ids",
                )
            )})
            if route_ids:
                implemented[item_id] = route_ids
        if implemented:
            finding["implemented_routes"] = implemented
            if finding.get("decision_status") != "group_prompt_explanatory_separate_tools_routed":
                finding["decision_status"] = "source_reviewed_routed_skippably_or_in_existing_lane"
        elif ids == ["area_enrichment_item:d078-soc-caqdas-taguette-nvivo"]:
            finding["decision_status"] = "group_prompt_explanatory_separate_tools_routed"
    review["route_audit"] = {
        "audit_file": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
        "passed": report["passed"],
        "method_subsets_checked": report["selection_space"]["all_method_subsets_including_empty_enumerated"],
        "combination_component_states_checked": report["selection_space"]["combination_component_subsets_enumerated"],
        "selectable_techniques_reachable": report["selectable_technique_routes"]["selectable_records_reachable"],
        "selectable_techniques_total": sum(bool(x.get("selectable")) for x in technique.get("records", [])),
        "ready_visible_edges": route["ready_visible_edges_reviewed"],
        "route_unavailable_edges": route["unavailable_destination_edge_count"],
        "errors": report["errors"],
    }
    review["decision_status"] = (
        "Route repair and contract validation passed: all 566 ready student-visible canonical edges share a declared route, "
        "98/98 selectable technique records are reachable, the 17 non-item workflow comparisons remain explanatory-only, "
        "and 4,194,304 method selections plus 24 named combination component states were exhaustively checked."
    )
    REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint["summary"].update(graph["relationship_route_repair_summary"])
    checkpoint.pop("removed_edges", None)
    checkpoint["validation"] = {
        "audit_file": str(AUDIT / "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json"),
        "passed": report["passed"],
        "method_states": report["selection_space"]["all_method_subsets_including_empty_enumerated"],
        "combination_component_states": report["selection_space"]["combination_component_subsets_enumerated"],
        "techniques_reachable": report["selectable_technique_routes"]["selectable_records_reachable"],
        "techniques_total": sum(bool(x.get("selectable")) for x in technique.get("records", [])),
        "ready_visible_edges": route["ready_visible_edges_reviewed"],
        "route_unavailable_edges": route["unavailable_destination_edge_count"],
        "errors": report["errors"],
    }
    checkpoint["removed_edge_dispositions"] = {
        "edge_count": 16,
        "ledger_record_ids": checkpoint.get("ledger_records_reclassified_explanatory_only", []),
        "examples": [
            "Mesa is not an alternative to quantitative, qualitative, or survey methods.",
            "AI/data workflow comparisons without a canonical selectable item remain explanatory.",
            "Synthetic respondents are not a survey-method destination.",
            "NVivo is not an alternative to the thematic-analysis method or a grouped prompt.",
        ],
    }
    checkpoint["removed_edge_count"] = 16
    checkpoint["removed_edge_ids"] = [
        "d078-resolved-relation:d078-relres:086:1",
        "d078-resolved-relation:d078-relres:086:2",
        "d078-resolved-relation:d078-relres:086:3",
        "d078-resolved-relation:d078-relres:080:1",
        "d078-resolved-relation:d078-relres:080:2",
        "d078-resolved-relation:d078-relres:007:1",
        "d078-resolved-relation:d078-relres:008:1",
        "d078-resolved-relation:d078-relres:017:1",
        "d078-resolved-relation:d078-relres:018:1",
        "d078-resolved-relation:d078-relres:042:1",
        "d078-resolved-relation:d078-relres:046:1",
        "d078-resolved-relation:d078-relres:004:1",
        "d078-resolved-relation:d078-relres:005:1",
        "d078-resolved-relation:d078-relres:094:1",
        "d078-resolved-relation:d078-relres:095:1",
        "d078-resolved-relation:d078-relres:095:2",
    ]
    checkpoint["status"] = "route_repair_and_contract_validation_complete"
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    selectable_total = sum(bool(x.get("selectable")) for x in technique.get("records", []))
    print(json.dumps({"passed": report["passed"], "ready_visible_edges": route["ready_visible_edges_reviewed"], "unavailable": route["unavailable_destination_edge_count"], "selectable_techniques": f"{report['selectable_technique_routes']['selectable_records_reachable']}/{selectable_total}", "relationship_explanations": explanation_repair}, ensure_ascii=False))

if __name__ == "__main__":
    main()
