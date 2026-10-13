"""Write an exact interim checkpoint from the current D001-D056 handoff."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


HERE = Path(__file__).resolve().parent
LANE = HERE / "role_enrichment_lanes_2026_10_06" / "D001_D056"
HANDOFF = LANE / "D001_D056_role_enrichment_final_handoff_2026_10_07.json"
OUT_JSON = LANE / "D001_D056_role_enrichment_interim_checkpoint_2026_10_07.json"
OUT_MD = LANE / "D001_D056_role_enrichment_interim_checkpoint_2026_10_07.md"


def main() -> None:
    handoff = json.loads(HANDOFF.read_text(encoding="utf-8"))
    domains = handoff["coverage_floor"]["domains"]
    entries = handoff["entries"]
    add_count = sum(entry["disposition"] == "add" for entry in entries)
    review_count = sum(entry["disposition"] == "review_only" for entry in entries)
    alias_count = sum(entry["disposition"] == "alias_existing" for entry in entries)
    remaining = sum(row["remaining_active_floor_deficit_after_safe_add_candidates"] for row in domains)
    payload = {
        "schema_version": "2026-10-07.role-enrichment-interim-checkpoint.v1",
        "lane": "D001-D056",
        "checkpoint_written_at_utc": datetime.now(timezone.utc).isoformat(),
        "lane_is_running": True,
        "status": "interim_checkpoint_saved_continue_lane",
        "source_handoff": str(HANDOFF.relative_to(Path(__file__).resolve().parents[3])).replace("\\", "/"),
        "scope": "Sparse/no-role enrichment with independent parent-domain and area-of-specialization fit gates.",
        "progress": {
            "current_merged_active_role_records": handoff["counts"]["current_merged_active_role_records"],
            "target_sparse_domain_count": handoff["counts"]["target_domain_count"],
            "candidate_records": len(entries),
            "candidate_domain_count": handoff["counts"]["candidate_domain_count"],
            "add_candidates": add_count,
            "review_only_candidates": review_count,
            "alias_existing_candidates": alias_count,
            "global_source_records": handoff["counts"]["source_catalog_global_count"],
            "nigerian_context_source_records": handoff["counts"]["source_catalog_nigerian_context_count"],
            "candidate_records_with_nigerian_context": handoff["counts"]["candidate_records_with_nigerian_context"],
            "candidate_records_without_nigerian_context": handoff["counts"]["candidate_records_without_nigerian_context"],
            "area_records_remapped_from_legacy_hints": handoff["counts"]["area_records_remapped_from_legacy_hints"],
            "area_records_retaining_legacy_label": handoff["counts"]["area_records_retaining_legacy_label"],
            "candidate_coverage_floor_satisfied_for_all_sparse_domains": True,
            "remaining_active_floor_deficit_after_safe_add_candidates": remaining,
        },
        "remaining_domain_deficits": domains,
        "area_reconciliation": handoff["area_reconciliation"],
        "fit_gates": handoff["integrity"],
        "next_action": [
            "Continue reviewing the 54 review-only candidates for stronger exact-title/task evidence.",
            "Use the reconciled global area names and boundaries; do not restore older ISCO-derived subgroup labels as final area names.",
            "Do not activate a candidate without both parent-domain and named-area fit evidence.",
            "Keep global occupational evidence separate from Nigerian context.",
            "Do not edit canonical role/domain/subgroup/overlay files in this lane.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D001-D056 role-enrichment interim checkpoint — 2026-10-07",
        "",
        "Lane status: **running; continue after this checkpoint**.",
        "",
        f"Current merged active role records: **{payload['progress']['current_merged_active_role_records']}**.",
        f"Sparse domains covered: **{payload['progress']['target_sparse_domain_count']}**.",
        f"Candidate records: **{payload['progress']['candidate_records']}** across **{payload['progress']['candidate_domain_count']}** domains.",
        f"Dispositions: **{add_count} add**, **{review_count} review-only**, **{alias_count} alias-existing**.",
        f"Global source records: **{payload['progress']['global_source_records']}**; Nigerian context sources: **{payload['progress']['nigerian_context_source_records']}**.",
        f"Area records remapped from legacy hints: **{payload['progress']['area_records_remapped_from_legacy_hints']}**; retained legacy final labels: **{payload['progress']['area_records_retaining_legacy_label']}**.",
        f"Remaining active-floor deficit after safe add candidates: **{remaining}**; these are not silently filled because their current candidates remain review-only.",
        "",
        "## Per-domain exact status",
        "",
        "| Domain | Active now | Candidates | Add | Review-only | Projected after add | Remaining deficit |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for row in domains:
        lines.append(
            f"| {row['domain_id']} {row['domain_name']} | {row['current_active_role_count']} | {row['candidate_count']} | {row['add_candidate_count']} | {row['review_only_candidate_count']} | {row['projected_active_role_count_if_all_add_candidates_accepted']} | {row['remaining_active_floor_deficit_after_safe_add_candidates']} |"
        )
    lines += [
        "",
        "## Gate status",
        "",
        "Every candidate has separate parent-domain and reconciled-global-area fit fields, global evidence, disposition and Nigerian-context separation. ISCO/subgroup membership is not used as fit proof.",
        "Final area names and boundaries come from the Step 1 global reconciliation artifact; legacy ISCO-derived subgroup labels remain audit hints only.",
        "",
        "Canonical files remain untouched by this lane. The lane continues after this checkpoint.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "lane_is_running": True, "progress": payload["progress"]}, indent=2))


if __name__ == "__main__":
    main()
