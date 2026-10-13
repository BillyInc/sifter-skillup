"""Reconcile D085-D168 coverage candidates against exact active role tasks.

This produces audit-only evidence.  It does not edit canonical role, subgroup,
domain, or specialization data.  Candidate names come from the existing
coverage register; active comparison rows come from the exact role-fit queue.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
REGISTER = HERE / "role_coverage_candidate_register.json"
FIT_QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D085_D168_role_fit_queue_2026_10_05.json"
FIT_COVERAGE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_CONTINUATION_2026_10_06/exact_role_fit_coverage_2026_10_06.json"
OUT_JSON = HERE / "role_coverage_candidate_reconciliation_2026_10_06.json"
OUT_MD = HERE / "role_coverage_candidate_reconciliation_2026_10_06.md"


# Selectors are exact task-comparison anchors, not inferred replacements.  A
# selector is resolved within the named domain unless its value is prefixed by
# another domain, as for the D114 packaging overlap.
ANCHORS = {
    "D085|retail_trade_manager_family": ["D085|shop supervisor"],
    "D092|existing_library_chef_not_active": ["D092|cook", "D092|industrial cook"],
    "D092|existing_library_pastry_cook_not_active": ["D092|industrial cook"],
    "D095|existing_library_motor_vehicle_body_repairer_not_active": ["D095|coachbuilder", "D095|motor vehicle body assembler"],
    "D098|existing_library_machinist_cnc_not_active": ["D098|precision mechanic", "D098|tool and die maker"],
    "D100|existing_library_pipefitter_not_active": ["D100|plumber", "D100|pipeline maintenance worker"],
    "D108|existing_library_print_production_manager_not_active": ["D108|print studio supervisor"],
    "D109|existing_library_foundry_moulder_not_active": ["D109|casting machine operator"],
    "D111|tailor_inactive": ["D111|clothing alteration machinist", "D111|clothing sample machinist"],
    "D111|textile_industrial_engineer_inactive": ["D111|textile operations manager"],
    "D114|packaging_line_operator_overlap": ["D113|packaging and filling machine operator", "D113|Packaging and Filling Machine Operators and Tenders"],
    "D120|aquaculture_production_manager_inactive": ["D120|aquaculture hatchery manager", "D120|aquaculture mooring manager"],
    "D121|logger_tree_feller_inactive": ["D121|forestry equipment operator"],
    "D122|biomedical_scientist_inactive": ["D122|medical laboratory manager", "D122|medical laboratory technologist"],
    "D122|blood_bank_technologist_specialization_candidate": ["D122|medical laboratory technologist"],
    "D125|medical_secretary_inactive": ["D125|medical administrative assistant", "D125|medical records manager", "D125|medical transcriptionist"],
    "D126|chiropractor_inactive": ["D126|chiropractic assistant", "D126|osteopath"],
    "D128|generic_social_worker_inactive": ["D128|community social worker", "D128|consultant social worker"],
    "D128|youth_worker_inactive": ["D128|youth centre manager", "D128|youth programme director"],
    "D128|social_work_assistant_inactive": ["D128|community social worker"],
    "D131|race_engineer_inactive": ["D131|automotive engineer", "D131|mechanical engineer", "D131|powertrain engineer"],
    "D132|spacecraft_operations_controller_family": ["D132|satellite engineer", "D132|Aerospace Engineering and Operations Technologists and Technicians"],
    "D134|electro_technical_officer_missing": ["D134|marine electrician", "D134|marine engineering technician"],
    "D134|marine_surveyor_task_family": ["D134|marine cargo inspector", "D134|marine engineer"],
    "D136|flight_test_engineer_missing": ["D136|aircraft engine tester", "D136|aerodynamics engineer"],
    "D139|game_environment_artist_family": ["D139|game environment artist"],
    "D143|forensic_reporting_scientist_family": ["D143|digital forensics expert"],
    "D144|meteorological_observer_function": ["D144|meteorology technician", "D144|weather forecaster"],
    "D146|building_commissioning_function": ["D146|heating, ventilation, air conditioning engineer", "D146|heating, ventilation, air conditioning and refrigeration engineering technician"],
    "D146|building_automation_controls_function": ["D146|smart home engineer"],
    "D152|museum_curator_inactive": ["D152|exhibition curator", "D152|zoo curator"],
    "D152|conservator_inactive": ["D152|conservation scientist"],
    "D154|sports_scientist_performance_analyst_inactive": ["D154|Exercise Physiologists", "D154|kinesiologist"],
    "D154|strength_and_conditioning_coach_inactive": ["D154|personal trainer", "D154|Exercise Trainers and Group Fitness Instructors"],
    "D155|materials_characterization_and_computational_science_inactive": ["D155|Materials Engineers", "D155|metrologist", "D155|advanced materials scientist"],
    "D156|geodesist_inactive": ["D156|Geodetic Surveyors"],
    "D156|photogrammetrist_inactive": ["D156|cartographer", "D156|geographic information systems specialist"],
    "D158|investment_banker_inactive": ["D158|investment analyst", "D158|mergers and acquisitions analyst", "D158|securities analyst"],
    "D158|corporate_treasurer_inactive": ["D158|financial controller", "D158|middle office analyst"],
    "D159|structured_finance_analyst_inactive": ["D159|credit analyst", "D159|securities analyst", "D159|financial analyst"],
    "D161|humanitarian_programme_and_protection_functions": ["D161|humanitarian advisor", "D161|crisis situation social worker", "D161|monitoring and evaluation officer"],
    "D161|humanitarian_logistics_function": ["D161|procurement category specialist", "D161|emergency response coordinator"],
    "D162|immigration_lawyer_and_asylum_caseworker_inactive": ["D162|immigration adviser"],
    "D163|patent_and_trademark_representative_inactive": ["D163|patent engineer", "D163|licensing officer"],
    "D165|health_wellness_coach_function": ["D165|Fitness and Wellness Coordinators", "D165|weight loss consultant", "D165|personal trainer"],
    "D166|autonomous_vehicle_perception_sensor_fusion_candidate": ["D166|Robotics Engineers", "D166|software developer"],
    "D167|xr_interaction_designer_function": ["D167|digital media designer", "D167|XR developer"],
}


def _load_fit_statuses() -> dict[str, str]:
    """Read only terminal exact-key statuses from the current reconciliation."""
    doc = json.loads(FIT_COVERAGE.read_text(encoding="utf-8"))
    statuses: dict[str, str] = {}
    for row in doc.get("remaining_rows", []):
        statuses[row["role_key"]] = row["recomputed_status"]
    # The coverage snapshot only contains unresolved rows.  For comparison
    # anchors, the queue's lane reports are the authoritative local sources.
    lane = FIT_QUEUE.parent
    for path in sorted(lane.glob("D*_role_domain_fit_review_2026_10_05.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        for row in payload.get("decisions", []):
            key = row.get("role_key")
            status = row.get("domain_fit_status") or row.get("role_to_domain_fit_status")
            if key and status:
                statuses[key] = status
    return statuses


def _resolve_anchors(rows: list[dict], selectors: list[str]) -> list[dict]:
    by_key = {f"{r['domain_id']}|{r['role_name']}": r for r in rows}
    resolved = []
    for selector in selectors:
        if selector not in by_key:
            raise SystemExit(f"Anchor selector does not resolve exactly: {selector}")
        row = by_key[selector]
        resolved.append(row)
    return resolved


def _bucket(candidate: dict, active_count: int, parent_scope: str) -> str:
    key = candidate["candidate_key"]
    domain_id = key.split("|", 1)[0]
    if key.startswith("D119|"):
        return "blocked_by_source_count_reconciliation"
    if not parent_scope.strip():
        return "missing_parent_scope_reconciliation"
    if domain_id in {"D153", "D157"}:
        return "zero_active_domain_existing_record_reconciliation"
    if key == "D139|game_environment_artist_family":
        return "already_active_exact_role_candidate_closed"
    text = candidate["recommendation_status"].lower()
    if any(token in text for token in ("regional", "emerging", "bounded", "specialization", "source-backed", "source_backed", "cross-domain", "cross_domain", "strong_global")):
        return "bounded_source_or_ownership_candidate_deferred"
    if "overlap" in text or "duplicate" in text or "inactive" in text or "existing" in text:
        return "existing_record_or_exact_overlap_deferred"
    return "exact_task_reconciliation_deferred"


def _reason(candidate: dict, anchors: list[dict], bucket: str) -> str:
    if bucket == "already_active_exact_role_candidate_closed":
        return "The candidate family is already an exact active role key in this domain; retain the active link and remove this finding from the missing-role residual without adding a title."
    if bucket == "blocked_by_source_count_reconciliation":
        return "D119 has a source-inventory/count mismatch. Resolve the existing source ledger and exact task records before deciding whether the candidate is missing or already represented."
    if bucket == "zero_active_domain_existing_record_reconciliation":
        return "The domain has zero active role links. Existing inactive/curated records are the bounded review set; each must be checked by exact task and ownership before activation."
    if bucket == "missing_parent_scope_reconciliation":
        return "The lane artifact does not contain a prose parent-domain scope for this candidate. Exact task fit cannot be signed off until the parent scope is restored or explicitly documented; no link is inferred from the domain label or neighboring records."
    if anchors:
        return "Comparable active task records exist, but the candidate task bundle is not identical to those records. Keep the candidate open for task-boundary/ownership review; do not infer a new role from the title or source family."
    return "No exact active task anchor was selected for this candidate. The source-backed function remains a bounded review item; no canonical title or link is inferred."


def main() -> None:
    register = json.loads(REGISTER.read_text(encoding="utf-8"))
    queue_doc = json.loads(FIT_QUEUE.read_text(encoding="utf-8"))
    queue_rows = queue_doc["unresolved_rows"]
    queue_by_domain: dict[str, list[dict]] = defaultdict(list)
    for row in queue_rows:
        queue_by_domain[row["domain_id"]].append(row)
    statuses = _load_fit_statuses()

    candidates = []
    for domain in register["domains"]:
        for source_candidate in domain["candidates"]:
            key = source_candidate["candidate_key"]
            selectors = ANCHORS.get(key, [])
            anchors = _resolve_anchors(queue_rows, selectors)
            bucket = _bucket(source_candidate, domain["active_role_count"], domain["parent_scope"])
            comparisons = []
            for row in anchors:
                role_key = f"{row['domain_id']}|{row['role_name']}"
                comparisons.append({
                    "role_key": role_key,
                    "role_name": row["role_name"],
                    "role_task_evidence": row["role_description"],
                    "fit_status": statuses.get(role_key, "status_not_found_in_lane_artifacts"),
                    "comparison_scope": "Exact stored role task text; status is copied from lane review artifacts when available.",
                })
            candidates.append({
                "candidate_key": key,
                "domain_id": domain["domain_id"],
                "domain_name": domain["domain_name"],
                "active_role_count": domain["active_role_count"],
                "parent_domain_scope": domain["parent_scope"],
                "candidate_title_or_family": source_candidate["title_or_family"],
                "candidate_task_evidence": source_candidate["tasks"],
                "candidate_gap_basis": source_candidate["candidate_gap_basis"],
                "title_status": source_candidate["title_status"],
                "source_refs": source_candidate["source_refs"],
                "original_recommendation_status": source_candidate["recommendation_status"],
                "active_exact_task_comparisons": comparisons,
                "comparison_result": bucket,
                "residual_reason": _reason(source_candidate, anchors, bucket),
                "canonical_edit": False,
                "subgroup_or_specialization_edit": False,
            })

    if len(candidates) != 75:
        raise SystemExit(f"Expected 75 register candidates, found {len(candidates)}")
    if len({row["candidate_key"] for row in candidates}) != len(candidates):
        raise SystemExit("Candidate keys are not unique")

    buckets = Counter(row["comparison_result"] for row in candidates)
    active_anchor_count = sum(bool(row["active_exact_task_comparisons"]) for row in candidates)
    result = {
        "schema_version": "2026-10-06.role-coverage-candidate-reconciliation.v1",
        "scope": "D085-D168 sparse-domain and candidate missing-role reconciliation against exact stored role tasks and parent-domain scope.",
        "coverage_register": REGISTER.relative_to(ROOT).as_posix(),
        "exact_role_fit_queue": FIT_QUEUE.relative_to(ROOT).as_posix(),
        "exact_role_fit_coverage": FIT_COVERAGE.relative_to(ROOT).as_posix(),
        "candidate_count": len(candidates),
        "candidate_domains": len({row["domain_id"] for row in candidates}),
        "active_anchor_count": active_anchor_count,
        "comparison_result_counts": dict(sorted(buckets.items())),
        "sparse_context": {
            "active_role_links": 1713,
            "zero_active_domains": ["D153", "D157"],
            "sparse_domains_1_to_12_links": 16,
            "counts_are_triage_only": True,
        },
        "exact_role_fit_residual_context": {
            "canonical_exact_role_keys": 3919,
            "supported": 2348,
            "conditional": 1017,
            "unsupported": 543,
            "unresolved": 11,
            "former_unresolved_44_currently_dispositioned": 44,
            "conflicting_terminal_statuses": 0,
            "note": "The 543 unsupported links are terminal exact-task dispositions, not a reopened queue. The 11 unresolved links are catch-all records with no identifiable task profile and remain unresolved.",
        },
        "method": [
            "Use the candidate's stored task bundle and the domain's stored parent scope.",
            "Compare only to exact active role task text selected as a bounded anchor; title similarity and ISCO/subgroup membership are not fit evidence.",
            "Treat active overlap as a reason to reconcile scope, not proof that a candidate is a duplicate or a missing role.",
            "Keep existing inactive records, zero-active-domain families, and employer/emerging functions as review candidates; do not invent titles or canonical links.",
        ],
        "canonical_edits": False,
        "role_to_specialization_edits": False,
        "candidates": candidates,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D085-D168 role-coverage candidate reconciliation",
        "",
        "Date: 2026-10-06",
        "",
        "This is an audit-only reconciliation of the 75 source-backed or bounded coverage findings. It compares each candidate task bundle with the stored parent-domain scope and selected exact active role task records. It does not add, activate, move, or rename roles.",
        "",
        "## Counts",
        "",
        f"- Candidates: **{len(candidates)}** across **{len({row['domain_id'] for row in candidates})} domains**.",
        f"- Candidates with at least one exact active task anchor: **{active_anchor_count}**.",
        "- Zero-active domains: **D153 Music Production** and **D157 Tax Advisory and Transfer Pricing**.",
        "- Sparse-domain count (1-12 active links): **16**; this remains triage context, not proof of a missing role.",
        "",
        "| Reconciliation result | Count |",
        "|---|---:|",
    ]
    for bucket, count in sorted(buckets.items()):
        lines.append(f"| {bucket} | {count} |")
    lines.extend([
        "",
        "## Exact role-fit residual context",
        "",
        "The exact role-fit catalogue has 3,919/3,919 keys with a current disposition: 2,348 supported, 1,017 conditional, 543 unsupported, and 11 unresolved. The former 44-key continuation was dispositioned with 33 resolved and 11 catch-all records still unresolved. The 543 unsupported links are terminal fit results; they are not silently converted into coverage candidates.",
        "",
        "## Candidate residuals",
        "",
        "The JSON file is the complete exact-key residual ledger. The compact list below makes the remaining action visible without inventing titles:",
        "",
    ])
    for bucket in sorted(buckets):
        rows = [row for row in candidates if row["comparison_result"] == bucket]
        lines.append(f"### {bucket} ({len(rows)})")
        lines.append("")
        for row in rows:
            anchors = ", ".join(f"`{a['role_key']}`" for a in row["active_exact_task_comparisons"]) or "none"
            lines.append(f"- `{row['candidate_key']}` — {row['candidate_title_or_family']}; active exact anchors: {anchors}. {row['residual_reason']}")
        lines.append("")
    lines.extend([
        "## Boundary",
        "",
        "All 75 candidate records retain `canonical_edit: false`; no canonical JSON, subgroup mapping, role mapping, or specialization assignment was changed. Existing inactive library records and the two zero-active domains remain explicit review residuals. The next decision requires exact source-record comparison and ownership review for the listed keys; it cannot be inferred from role counts, titles, ISCO membership, or neighboring roles.",
        "",
        "Reproducible script: `reconcile_role_coverage_candidates.py`.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "candidate_count": len(candidates),
        "candidate_domains": len({row["domain_id"] for row in candidates}),
        "active_anchor_count": active_anchor_count,
        "comparison_result_counts": dict(sorted(buckets.items())),
        "output_json": OUT_JSON.as_posix(),
        "output_md": OUT_MD.as_posix(),
    }, indent=2))


if __name__ == "__main__":
    main()
