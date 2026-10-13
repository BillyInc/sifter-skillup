#!/usr/bin/env python3
"""Build a lane-owned, non-mutating D098 shared-register reconciliation proposal."""

from __future__ import annotations

import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
LANE = AUDIT / "specialization_lanes_2026_10_05/D057_D168"
REVIEW = AUDIT / "specialization_lanes_2026_10_05/D093_D168/D098_specialization_review.json"
REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
OUT_JSON = LANE / "d098_shared_projection_reconciliation_001.json"
OUT_MD = LANE / "d098_shared_projection_reconciliation_001.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    review = load(REVIEW)
    register = load(REGISTER)
    projection = runpy.run_path(str(AUDIT / "specialization_lanes_2026_10_05/D057_D091/reconcile_shared_specialization_register.py"))
    proposed = projection["shared_review"](review)
    evidence = projection["shared_evidence"](review)
    current = next(row for row in register["domain_reviews"] if row["domain_id"] == "D098")
    current_evidence = {row["source_id"]: row for row in register["evidence_register"]}
    conflicts = []
    exact = []
    for row in evidence:
        old = current_evidence.get(row["source_id"])
        if old is None:
            continue
        if old == row:
            exact.append(row["source_id"])
        else:
            conflicts.append({
                "source_id": row["source_id"],
                "existing_title": old.get("title"),
                "proposed_title": row.get("title"),
                "existing_url": old.get("url"),
                "proposed_url": row.get("url"),
                "existing_locator": old.get("locator"),
                "proposed_locator": row.get("locator"),
                "disposition": "do_not_overwrite; resolve source identity before projection",
            })
    result = {
        "schema_version": "2026-10-05.d098-shared-projection-reconciliation.v1",
        "domain_id": "D098",
        "domain_name": review["domain_name"],
        "existing_register_candidate_count": len(current.get("specializations", [])),
        "proposed_lane_candidate_count": len(proposed.get("specializations", [])),
        "existing_register_candidate_labels": [row.get("label") for row in current.get("specializations", [])],
        "proposed_candidate_labels": [row.get("label") for row in proposed.get("specializations", [])],
        "lane_review_status": review.get("review_status"),
        "register_review_status": current.get("review_status"),
        "same_projection": current == proposed,
        "source_ids_proposed": len({row["source_id"] for row in evidence}),
        "exact_source_id_matches": exact,
        "source_id_locator_or_metadata_conflicts": conflicts,
        "proposed_review_projection": proposed,
        "proposed_evidence_rows": evidence,
        "write_boundary": "This artifact is a review proposal only. It does not mutate the shared register, canonical taxonomy, role library, or role mappings.",
        "decision": "The old three-area register row conflicts materially with the newer four-area lane review. Replace only through an explicitly reviewed follow-up; no automatic overwrite is authorized by this script.",
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D098 shared-register projection reconciliation 001",
        "",
        "Read-only comparison of the current shared register row and the lane-owned source review. This script does not write either source file.",
        "",
        f"- Current register areas: **{result['existing_register_candidate_count']}** — " + "; ".join(result["existing_register_candidate_labels"]),
        f"- Lane-reviewed proposed areas: **{result['proposed_lane_candidate_count']}** — " + "; ".join(result["proposed_candidate_labels"]),
        f"- Proposed evidence IDs: **{result['source_ids_proposed']}**",
        f"- Exact shared evidence-ID matches: **{len(exact)}**",
        f"- Conflicting existing evidence IDs: **{len(conflicts)}**",
        "- Disposition: **do not overwrite automatically**; the four-area recommendation is an internal candidate set and keeps metrology as an explicit unresolved boundary.",
        "- Canonical taxonomy or role data changed: **no**.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({key: result[key] for key in (
        "existing_register_candidate_count", "proposed_lane_candidate_count", "source_ids_proposed",
        "exact_source_id_matches", "source_id_locator_or_metadata_conflicts", "same_projection",
    )}, indent=2))


if __name__ == "__main__":
    main()
