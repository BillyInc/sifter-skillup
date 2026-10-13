#!/usr/bin/env python3
"""Checkpoint existing/review-needed specialization evidence for D085-D112."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
LANE = AUDIT / "specialization_lanes_2026_10_05/D057_D168"
REGISTER_PATH = AUDIT / "domain_specialization_review_2026_10_03.json"
LANE_REVIEW_DIRS = [
    AUDIT / "specialization_lanes_2026_10_05/D057_D091",
    AUDIT / "specialization_lanes_2026_10_05/D093_D168",
    LANE,
]
OUT_JSON = LANE / "d085_d112_specialization_checkpoint_001.json"
OUT_MD = LANE / "d085_d112_specialization_checkpoint_001.md"
TRIAGE = LANE / "D099_D112_specialization_source_triage_001.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    meta = load(ROOT / "data/career-mapping/domain_meta.json")
    register = load(REGISTER_PATH)
    register_rows = {row["domain_id"]: row for row in register.get("domain_reviews", [])}
    evidence = {row["source_id"]: row for row in register.get("evidence_register", [])}
    lane_rows = {}
    for folder in LANE_REVIEW_DIRS:
        for path in folder.glob("D???_specialization_review.json"):
            row = load(path)
            lane_rows[row["domain_id"]] = row

    domains = []
    for number in range(85, 113):
        domain_id = f"D{number:03d}"
        shared = register_rows.get(domain_id)
        lane = lane_rows.get(domain_id)
        lane_path = next((p for folder in LANE_REVIEW_DIRS for p in folder.glob(f"{domain_id}_specialization_review.json")), None)
        lane_ids = {row.get("source_id") for row in (lane or {}).get("source_register", [])}
        shared_ids = {sid for area in (shared or {}).get("specializations", []) for sid in area.get("source_ids", [])}
        ids = lane_ids or shared_ids
        unresolved_ids = sorted(sid for sid in ids if sid not in evidence and not lane_ids)
        if number <= 97 and shared and shared.get("review_status") == "source_reviewed_specialization_set_recommended":
            disposition = "existing_source_reviewed_register_record_reuse_after_provenance_check"
        elif domain_id == "D098" and lane and shared:
            disposition = "material_lane_vs_register_conflict_reconcile_before_completion"
        elif not shared and not lane:
            disposition = "unreviewed_needs_source_based_specialization_review"
        elif lane and not shared:
            disposition = "lane_review_exists_but_shared_projection_absent"
        else:
            disposition = "manual_compare_review_and_register_evidence"
        domains.append({
            "domain_id": domain_id,
            "domain_name": meta[domain_id]["domain_name"],
            "register_review_present": bool(shared),
            "register_review_status": shared.get("review_status") if shared else None,
            "register_candidate_area_count": len((shared or {}).get("specializations", [])),
            "lane_review_present": bool(lane),
            "lane_review_file": lane_path.relative_to(ROOT).as_posix() if lane_path else None,
            "lane_review_status": lane.get("review_status") if lane else None,
            "lane_candidate_area_count": len(lane.get("candidate_specializations", [])) if lane else None,
            "source_id_count": len(ids),
            "unresolved_shared_evidence_ids": unresolved_ids,
            "disposition": disposition,
        })

    counts = {
        "domain_ids_in_range": len(domains),
        "existing_source_reviewed_register_records_D085_D097": sum(row["disposition"] == "existing_source_reviewed_register_record_reuse_after_provenance_check" for row in domains),
        "lane_vs_register_conflicts": sum(row["disposition"] == "material_lane_vs_register_conflict_reconcile_before_completion" for row in domains),
        "domains_without_any_review_artifact_D099_D112": sum(row["disposition"] == "unreviewed_needs_source_based_specialization_review" for row in domains),
        "domains_screened_in_source_triage_D099_D112": 14 if TRIAGE.exists() else 0,
        "total_source_ids_with_evidence_register_resolution": sum(row["source_id_count"] - len(row["unresolved_shared_evidence_ids"]) for row in domains),
        "unresolved_shared_evidence_id_references": sum(len(row["unresolved_shared_evidence_ids"]) for row in domains),
    }
    result = {
        "schema_version": "2026-10-05.specialization-D085-D112-checkpoint.v1",
        "range": {"first_domain_id": "D085", "last_domain_id": "D112", "expected_domain_count": 28},
        "counts": counts,
        "domains": domains,
        "scope_note": "D085-D097 existing source-reviewed entries are reused, not re-researched wholesale. D098 remains an explicit material projection conflict. D099-D112 are the next new review queue. Counts describe internal source review, not external academic sign-off.",
        "write_boundary": "Checkpoint only; no shared register, canonical specialization/subgroup data, role library, subgroup scripts/reports, or role-to-domain mapping was edited.",
        "next_action": "Strengthen the eight explicit source gaps in D099-D112, convert the triage into per-domain source-register reviews, then rerun full D057-D168 coverage reconciliation.",
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D085-D112 specialization checkpoint 001",
        "",
        "Existing review artifacts were inspected before starting new domain research. Existing source-reviewed rows are reused; an artifact is not treated as canonical taxonomy or external academic approval.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- `{key}`: **{value}**" for key, value in counts.items())
    lines += ["", "## Per-domain disposition", "", "| ID | Domain | Register areas | Lane areas | State | Sources |", "|---|---|---:|---:|---|---:|"]
    for row in domains:
        lines.append(f"| {row['domain_id']} | {row['domain_name']} | {row['register_candidate_area_count']} | {row['lane_candidate_area_count'] if row['lane_candidate_area_count'] is not None else '—'} | `{row['disposition']}` | {row['source_id_count']} |")
    lines += [
        "",
        "## Evidence and boundaries",
        "",
        "- D085-D097: reuse the existing register entries only after checking source IDs and claim limits; do not infer correctness from present subgroup counts.",
        "- D098: preserve both versions in lane-owned artifacts; the four-area proposal remains provisional with the metrology boundary unresolved. No roles are assigned.",
        "- D099-D112: source research must decide whether proposed areas are distinct, correctly inside their parent, and plain-language; ISCO buckets and current role counts are not specialization evidence.",
        "- D099-D112 source-screen: `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D099_D112_specialization_source_triage_001.md` records all 14 candidate boundaries and identifies the eight domains whose evidence must be strengthened before final disposition.",
        "- Geography: use global/international evidence where available; explicitly mark country-specific standards as corroboration, not global requirements.",
        "- Tests: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d085_d112_specialization_checkpoint_001.py data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d098_shared_projection_reconciliation_001.py`.",
        "",
        result["write_boundary"],
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(counts, indent=2))


if __name__ == "__main__":
    main()
