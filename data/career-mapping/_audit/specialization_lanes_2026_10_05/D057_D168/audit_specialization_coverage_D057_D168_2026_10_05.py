#!/usr/bin/env python3
"""Inventory existing specialization-review evidence for D057-D168.

Read-only with respect to the shared register and canonical taxonomy. The only
outputs are this lane's coverage manifest and checkpoint report.
"""

from __future__ import annotations

import json
import runpy
from pathlib import Path


LANE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
REVIEW_DIRS = [
    AUDIT / "specialization_lanes_2026_10_05/D003_D084",
    AUDIT / "specialization_lanes_2026_10_05/D057_D091",
    AUDIT / "specialization_lanes_2026_10_05/D093_D168",
    LANE,
]
OUT_JSON = LANE / "specialization_coverage_D057_D168_2026_10_05.json"
OUT_MD = LANE / "specialization_coverage_checkpoint_001.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    meta = load(ROOT / "data/career-mapping/domain_meta.json")
    structure = load(ROOT / "data/career-mapping/domain_structure.json")
    register = load(REGISTER)
    projection = runpy.run_path(str(AUDIT / "specialization_lanes_2026_10_05/D057_D091/reconcile_shared_specialization_register.py"))["shared_review"]
    register_rows = {row["domain_id"]: row for row in register.get("domain_reviews", [])}
    lane_files = {}
    for folder in REVIEW_DIRS:
        for path in folder.glob("D???_specialization_review.json"):
            row = load(path)
            domain_id = row.get("domain_id")
            if not domain_id:
                raise ValueError(f"Missing domain_id in {path}")
            prior = lane_files.get(domain_id)
            if prior and prior["review_file"] != path.relative_to(ROOT).as_posix():
                # Prefer the newest in-range lane artifact but preserve all locations.
                prior["additional_review_files"].append(path.relative_to(ROOT).as_posix())
            else:
                lane_files[domain_id] = {
                    "review_file": path.relative_to(ROOT).as_posix(),
                    "additional_review_files": [],
                    "review": row,
                }

    domains = []
    for number in range(57, 169):
        domain_id = f"D{number:03d}"
        lane_record = lane_files.get(domain_id)
        shared_record = register_rows.get(domain_id)
        if domain_id not in meta:
            raise ValueError(f"Domain ID absent from domain_meta: {domain_id}")
        meta_row = meta[domain_id]
        lane_review = lane_record["review"] if lane_record else None
        canonical_subgroups = structure.get(domain_id, {}).get("subgroups", [])
        exact_projection_match = projection(lane_review) == shared_record if lane_review and shared_record else None
        status = (
            "lane_review_and_shared_projection_exact_match"
            if lane_review and shared_record and exact_projection_match else
            "lane_review_and_shared_projection_conflict"
            if lane_review and shared_record else
            "lane_review_only_shared_projection_missing"
            if lane_review else
            "shared_projection_only_lane_review_missing"
            if shared_record else
            "no_review_artifact_found"
        )
        candidate_areas = lane_review.get("candidate_specializations", []) if lane_review else (
            shared_record.get("specializations", []) if shared_record else []
        )
        source_rows = lane_review.get("source_register", []) if lane_review else []
        register_source_ids = [row.get("source_id") for row in source_rows]
        if not register_source_ids and shared_record:
            register_source_ids = sorted({sid for area in candidate_areas for sid in area.get("source_ids", [])})
        domains.append({
            "domain_id": domain_id,
            "domain_name": meta_row.get("name", meta_row.get("domain_name", "")),
            "coverage_state": status,
            "lane_review_file": lane_record["review_file"] if lane_record else None,
            "additional_review_files": lane_record["additional_review_files"] if lane_record else [],
            "lane_review_status": lane_review.get("review_status") if lane_review else None,
            "shared_register_record_present": bool(shared_record),
            "lane_projection_exactly_matches_shared_record": exact_projection_match,
            "shared_register_status": shared_record.get("review_status") if shared_record else None,
            "candidate_area_count": len(candidate_areas),
            "source_id_count": len(set(register_source_ids)),
            "current_canonical_subgroup_record_count_read_only": len(canonical_subgroups),
            "candidate_taxonomy_is_canonical": False,
            "next_disposition": (
                "reconcile_lane_review_shared_projection_conflict"
                if lane_review and shared_record and not exact_projection_match else
                "reconcile_lane_review_projection_collision_safely"
                if lane_review and not shared_record else
                "check_shared_projection_against_source_review_before_marking_complete"
                if shared_record and not lane_review else
                "review_lane_record_and_shared_projection_consistency"
                if lane_review and shared_record else
                "needs_source_review_or_explicit_no_specialization_disposition"
            ),
        })

    counts = {}
    for state in sorted({row["coverage_state"] for row in domains}):
        counts[state] = sum(row["coverage_state"] == state for row in domains)
    result = {
        "schema_version": "2026-10-05.specialization-coverage-D057-D168.v1",
        "generated_by": Path(__file__).name,
        "range": {"first_domain_id": "D057", "last_domain_id": "D168", "expected_domain_count": 112},
        "inputs": [
            "data/career-mapping/domain_meta.json",
            "data/career-mapping/domain_structure.json (read-only subgroup count only)",
            "data/career-mapping/_audit/domain_specialization_review_2026_10_03.json (read-only)",
            "data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D???_specialization_review.json",
            "data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D???_specialization_review.json",
            "data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/D???_specialization_review.json",
        ],
        "counts": {
            "domain_ids_checked": len(domains),
            "lane_review_files_found": sum(bool(row["lane_review_file"]) for row in domains),
            "shared_register_records_found": sum(row["shared_register_record_present"] for row in domains),
            "domain_ids_with_any_review_artifact": sum(row["coverage_state"] != "no_review_artifact_found" for row in domains),
            "domain_ids_without_any_review_artifact": sum(row["coverage_state"] == "no_review_artifact_found" for row in domains),
            "coverage_state_counts": counts,
        },
        "interpretation": "An artifact's presence is not a full sign-off. Lane reports remain provisional where their own status says so; register-only rows must be checked back to source evidence. No candidate subgroup was promoted to canonical taxonomy.",
        "write_boundary": "Only this lane's D057_D168 manifest/checkpoint may be written. Shared register, domain_structure, role_library_v3*.json, subgroup scripts/reports and role-to-domain data are read-only.",
        "domains": domains,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D057-D168 specialization coverage checkpoint 001",
        "",
        "Read-only inventory of existing lane reviews and shared-register projections across the complete D057-D168 range. Artifact presence is not treated as sign-off; provisional status and source provenance remain material.",
        "",
        "## Counts",
        "",
    ]
    for key, value in result["counts"].items():
        lines.append(f"- `{key}`: **{value}**")
    lines += ["", "## Domain coverage", "", "| ID | Domain | Artifact state | Lane status | Candidate areas | Sources | Next action |", "|---|---|---|---|---:|---:|---|"]
    for row in domains:
        lines.append(
            f"| {row['domain_id']} | {row['domain_name']} | `{row['coverage_state']}` | "
            f"{row['lane_review_status'] or '—'} | {row['candidate_area_count']} | {row['source_id_count']} | `{row['next_disposition']}` |"
        )
    lines += [
        "",
        "## Boundaries",
        "",
        "- Range audit: D057-D168 inclusive; no ID is silently skipped.",
        "- No canonical taxonomy or role record is edited.",
        "- Shared-register presence is not enough to call a review complete; each record must remain tied to a source-grounded lane review and its projected fields must match.",
        "- This checkpoint is a current-state discovery artifact. Missing rows require source review or an evidence-based explicit no-specialization disposition, not a guessed subgroup count.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(result["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
