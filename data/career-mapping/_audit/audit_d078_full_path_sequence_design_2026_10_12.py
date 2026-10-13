"""Validate the D078 route sequence design without promoting student data."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
SEQUENCE = ROOT / "data/career-mapping/_audit/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.json"
OUT = ROOT / "data/career-mapping/_audit/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.json"

# These are the 27 explicit area item/task order-like declarations outside the
# 19 separately source-checked reference records. They are deliberately not
# hard learning dependencies; the student-display gate for each relation is
# still independent.
DIRECT_EDGE_DISPOSITIONS: dict[tuple[str, str, str], tuple[str, str]] = {
    ("area-item:d078-sociology-social-anthropology:d078-sociology-social-anthropology-core-task-family:1:social-theory-and-concepts", "area_enrichment_item:d078-soc-question-design", "builds_on"): ("co_taught_concept_context", "Theory can inform question framing; no evidence establishes a universal blocking prerequisite."),
    ("area_enrichment_item:d078-soc-survey-design", "area_enrichment_item:d078-soc-survey-analysis-r", "builds_on"): ("conditional_project_workflow", "Inspect design and sampling before interpreting a selected survey dataset; the learner need not have designed that survey."),
    ("area_enrichment_item:d078-soc-survey-analysis-r", "area_enrichment_item:d078-econ-labour-statistics", "builds_on"): ("no_dependency_established", "Shared data skills do not make one area item a prerequisite for the other."),
    ("domain-item:d078-computational-social-research", "area_enrichment_item:d078-a03-method-policy-text-as-data", "builds_on"): ("specialist_route_context", "Policy text-as-data is one specialist application, not a prerequisite for the broader computational approach."),
    ("area-task:d078-politics-governance-public-policy-monitoring-evaluation", "area_enrichment_item:d078-a03-method-evaluate-ai-public-intervention", "builds_on"): ("task_scope_context", "The AI-intervention evaluation is a specialized example within the broader evaluation task."),
    ("domain-item:d078-computational-social-research", "area_enrichment_item:d078-a04-method-digital-trace-inquiry", "builds_on"): ("specialist_route_context", "Digital-trace inquiry can use non-computational methods; no hard dependency."),
    ("domain-item:d078-computational-social-research", "area_enrichment_item:d078-a04-method-llm-social-agent-simulation-experimental", "builds_on"): ("specialist_route_context", "Experimental LLM-agent simulation is an optional computational application, not a prerequisite for the broader method."),
    ("domain-item:d078-care-for-research-data", "area_enrichment_item:d078-a04-competency-digital-data-provenance", "builds_on"): ("co_taught_safeguard", "Data stewardship and provenance assessment can be taught together and applied during the data task."),
    ("area-task:d078-psychology-social-behaviour-qualitative-group-inquiry", "area_enrichment_item:d078-a04-method-human-in-loop-llm-qualitative-analysis", "builds_on"): ("optional_method_context", "Qualitative concepts contextualize optional AI assistance; AI is not required for qualitative inquiry."),
    ("area_enrichment_item:d078-a04-method-human-in-loop-llm-qualitative-analysis", "area_enrichment_item:d078-a04-competency-audit-ai-qualitative-coding", "requires"): ("embedded_quality_control", "Source-level checking is part of the workflow, not a separate prerequisite course."),
    ("area_enrichment_item:d078-a04-skill-cognitive-pretesting-and-equivalence", "area_relationship_reference:d078-a04-skill-cognitive-pretesting-and-equivalence:precedes:large-scale-fielding-and-group-score-comparison", "precedes"): ("split_workflow_and_distinct_claim_gate", "Pretest, revise, then field; independently require equivalence evidence before group-score comparison."),
    ("area_enrichment_item:d078-human-geography-population-spatial-concepts-and-place", "area_enrichment_item:d078-human-geography-population-spatial-data-provenance-scale", "builds_on"): ("co_taught_foundation", "Place/scale and data provenance are related introductory concepts; no hard prerequisite established."),
    ("area_enrichment_item:d078-human-geography-population-spatial-data-provenance-scale", "area_enrichment_item:d078-human-geography-population-spatial-analysis-method", "requires"): ("conditional_project_gate", "Inspect source, geographic unit and scale before interpreting the selected spatial analysis; not a gate on learning the method."),
    ("area_enrichment_item:d078-human-geography-population-spatial-analysis-method", "area_enrichment_item:d078-human-geography-population-spatial-pattern-communication", "builds_on"): ("project_workflow_not_learning_gate", "Communication follows a completed analysis in a project, but can be learned alongside analysis."),
    ("area_enrichment_item:d078-human-geography-population-population-measures", "area_enrichment_item:d078-human-geography-population-census-survey-admin-appraisal", "builds_on"): ("direction_not_supported", "Appraise a data source before deriving measures from it; do not encode the declared reverse order."),
    ("area_enrichment_item:d078-human-geography-population-population-measures", "area_enrichment_item:d078-human-geography-population-migration-urbanisation-interpretation", "builds_on"): ("co_taught_application", "Measures inform interpretation and should be explained within that selected task."),
    ("area_enrichment_item:d078-human-geography-population-population-measures", "area_enrichment_item:d078-human-geography-population-demographic-estimation-projection", "requires"): ("conditional_conceptual_preparation", "Teach measures, projection assumptions and uncertainty together; no hard block without stronger evidence."),
    ("area_enrichment_item:d078-social-research-evaluation-study-question-design", "area_enrichment_item:d078-social-research-evaluation-sampling-and-measurement", "builds_on"): ("integrated_design_workflow", "The question informs sampling and measurement choices; teach as an integrated design activity."),
    ("area_enrichment_item:d078-social-research-evaluation-sampling-and-measurement", "area_enrichment_item:d078-social-research-evaluation-research-ethics-data-stewardship", "requires"): ("direction_not_supported_safeguard", "Ethical/data checks begin during design and before relevant collection/use, not after sampling."),
    ("area_enrichment_item:d078-social-research-evaluation-programme-theory-and-logic", "area_enrichment_item:d078-social-research-evaluation-evaluation-design-and-evidence", "builds_on"): ("conditional_evaluation_workflow", "Clarify expected change before evaluation design when a theory/logic model is used; not required for every descriptive review."),
    ("area_enrichment_item:d078-social-research-evaluation-evaluation-design-and-evidence", "area_enrichment_item:d078-social-research-evaluation-quantitative-analysis-choice", "requires"): ("conditional_method_choice", "Choose analysis to fit the evaluation design; quantitative analysis is not always appropriate."),
    ("area_enrichment_item:d078-computational-digital-social-science-computational-question-formulation", "area_enrichment_item:d078-computational-digital-social-science-data-provenance-and-digital-ethics", "requires"): ("conditional_data_safeguard", "Assess provenance, permissions and risks before access/use; this is a project safeguard, not a course prerequisite."),
    ("area_enrichment_item:d078-computational-digital-social-science-data-provenance-and-digital-ethics", "area_enrichment_item:d078-computational-digital-social-science-reproducible-data-cleaning", "builds_on"): ("concurrent_data_stewardship", "Apply provenance and ethical handling throughout data work; no separate course gate established."),
    ("area_enrichment_item:d078-computational-digital-social-science-reproducible-data-cleaning", "area_enrichment_item:d078-computational-digital-social-science-interpretable-statistical-modeling", "builds_on"): ("conditional_project_workflow", "Prepare a selected dataset before fitting its model; cleaning and modelling may be taught together."),
    ("area_enrichment_item:d078-computational-digital-social-science-digital-trace-construct-and-sampling", "area_enrichment_item:d078-computational-digital-social-science-content-analysis-and-text-classification", "requires"): ("conditional_claim_gate", "Define construct, platform/data scope and sampling before making text-classification claims."),
    ("area_enrichment_item:d078-computational-digital-social-science-digital-trace-construct-and-sampling", "area_enrichment_item:d078-computational-digital-social-science-network-analysis-method", "requires"): ("conditional_claim_gate", "Define nodes/ties and source scope before analysing relationship data as a network."),
    ("area_enrichment_item:d078-computational-digital-social-science-digital-trace-construct-and-sampling", "area_enrichment_item:d078-computational-digital-social-science-predictive-text-modeling", "requires"): ("conditional_claim_gate", "Define construct and sampling, then validate predictions; keep non-computational alternatives visible."),
}


def read(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    graph = read(GRAPH)
    sequence = read(SEQUENCE)
    nodes = {row["id"]: row for row in graph["nodes"]}
    edges = graph["edges"]
    order_types = {"requires", "builds_on", "precedes"}
    direct_edges = [
        edge for edge in edges
        if edge.get("relationship") in order_types
        and not edge.get("source", "").startswith("area_relationship_reference:")
    ]
    actual = {(e["source"], e["target"], e["relationship"]): e for e in direct_edges}
    missing = sorted(set(actual) - set(DIRECT_EDGE_DISPOSITIONS))
    stale = sorted(set(DIRECT_EDGE_DISPOSITIONS) - set(actual))
    if missing or stale:
        raise SystemExit(f"direct order-edge coverage mismatch: missing={missing}; stale={stale}")

    records = []
    for key, (decision, rationale) in DIRECT_EDGE_DISPOSITIONS.items():
        edge = actual[key]
        if edge.get("student_visible") or edge.get("sequence_approved"):
            raise SystemExit(f"unapproved direct relation was exposed/approved: {key}")
        records.append({
            "source": key[0], "target": key[1], "declared_relationship": key[2],
            "graph_status": edge.get("status"), "decision": decision,
            "hard_learning_dependency": False, "student_visible": False,
            "rationale": rationale,
        })

    checks = sequence.get("source_checks", [])
    checked_refs = sum(int(row.get("reference_records", 0)) for row in checks)
    if len(sequence.get("records", [])) != 19 or checked_refs != 19 or len(checks) != 2:
        raise SystemExit("expected 19 reconciled critical references across two source checks")
    expected_hard = {
        ("domain-item:d078-quantitative-approach", "area_enrichment_item:d078-econ-applied-econometrics"),
        ("area_enrichment_item:d078-econ-applied-econometrics", "area_enrichment_item:d078-econ-causal-ml"),
        ("area_enrichment_item:d078-econ-agent-based-modeling", "area_enrichment_item:d078-econ-casevo-llm-sim"),
    }
    reviewed_candidates = sequence.get("candidate_order_edges", [])
    if {(row.get("source"), row.get("target")) for row in reviewed_candidates} != expected_hard or len(reviewed_candidates) != 3:
        raise SystemExit("source-checked hard-order edge set differs from the approved design")
    candidates = []
    for reviewed in reviewed_candidates:
        row = dict(reviewed)
        if row.get("student_visible"):
            raise SystemExit(f"student visibility gate unexpectedly open on {row.get('id')}")
        if row.get("status") != "hidden_candidate_source_supported_route_scoped":
            raise SystemExit(f"source-supported route scope missing for {row.get('id')}")
        if not (ROOT / row["source_check_artifact"]).is_file():
            raise SystemExit(f"missing source check artifact for {row.get('id')}")
        # The evidence review produced candidates; the completed local full-path
        # design disposition and the user's confirmation approve these three
        # conditional sequence rules. Approval does not expose them to students.
        row.update({
            "status": "approved_route_scoped_sequence_hidden_until_release",
            "sequence_approved": True,
            "student_visible": False,
            "approval_basis": "completed_D078_full_path_sequence_design_and_user_confirmation_2026-10-12",
        })
        candidates.append(row)

    role_candidate_prereq_edges = [
        edge for edge in edges
        if edge.get("relationship") == "prerequisite_for"
        and edge.get("status") == "provisional_design_review"
        and nodes.get(edge.get("target"), {}).get("kind") == "role_item_candidate"
    ]
    if len(role_candidate_prereq_edges) != 402:
        raise SystemExit(f"role prerequisite note count changed unexpectedly: {len(role_candidate_prereq_edges)}")

    out = {
        "schema_version": "2026-10-12.d078-full-path-sequence-design.v1",
        "domain_id": "D078",
        "status": "sequence_design_approved_hidden_content_and_ui_release_gates_open",
        "sequence_approved": True,
        "sequence_approval_basis": "completed_D078_full_path_sequence_design_and_user_confirmation_2026-10-12",
        "student_visible": False,
        "canonical_promotion": False,
        "role_fit_reopened": False,
        "subject_matcher_touched": False,
        "route_layers": ["fixed_programme_context", "domain", "selected_area_branches", "optional_role_branches", "separate_editable_plan_stacks"],
        "strict_learning_dependencies": candidates,
        "strict_learning_dependency_count": 3,
        "critical_reference_disposition_count": 19,
        "direct_area_order_declaration_count": len(records),
        "direct_area_order_dispositions": records,
        "raw_role_prerequisite_notes_not_hard_edges": len(role_candidate_prereq_edges),
        "all_edges_hidden": all(not edge.get("student_visible") for edge in edges),
        "graph_counts": {"nodes": len(nodes), "edges": len(edges)},
        "interpretation": "Route arrows describe navigation/inheritance. Only three source-checked, route-scoped dependencies impose item order; safeguards, workflow order, alternatives, complements and raw prerequisite notes do not become universal learner blockers.",
    }
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": out["status"],
        "direct_area_order_declarations_dispositioned": len(records),
        "critical_references_source_checked": checked_refs,
        "approved_hidden_learning_dependencies": len(candidates),
        "role_prerequisite_notes_not_hard_edges": len(role_candidate_prereq_edges),
        "all_edges_hidden": out["all_edges_hidden"],
        "output": str(OUT.relative_to(ROOT)),
    }, indent=2))


if __name__ == "__main__":
    main()
