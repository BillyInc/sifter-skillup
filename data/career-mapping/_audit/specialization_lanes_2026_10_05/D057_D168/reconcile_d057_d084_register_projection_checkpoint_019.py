#!/usr/bin/env python3
"""Prepare collision-safe D057-D084 register projections; never write register."""

from __future__ import annotations

import copy
import json
import runpy
from pathlib import Path

LANE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
SOURCE_LANE = AUDIT / "specialization_lanes_2026_10_05/D057_D091"
RECON = SOURCE_LANE / "d057_d084_slice_reconciliation_018.json"
REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
OUT_JSON = LANE / "d057_d084_register_projection_checkpoint_019.json"
OUT_MD = LANE / "d057_d084_register_projection_checkpoint_019.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    state = load(RECON)
    register = load(REGISTER)
    simulated = {row["source_id"]: row for row in register.get("evidence_register", [])}
    funcs = runpy.run_path(str(SOURCE_LANE / "reconcile_shared_specialization_register.py"))
    project_review = funcs["shared_review"]
    project_sources = funcs["shared_evidence"]
    missing = state["shared_register"]["missing_domain_ids"]
    collisions = state["shared_register"]["source_conflicts"]
    if len(missing) != 20 or len(collisions) != 4:
        raise ValueError("D057-D084 reconciliation changed; inspect upstream evidence")

    projections, namespaced = [], []
    for domain_id in missing:
        path = SOURCE_LANE / f"{domain_id}_specialization_review.json"
        if not path.exists():
            raise ValueError(f"Missing lane source file: {path}")
        review = load(path)
        review_projection = project_review(review)
        evidence_rows = project_sources(review)
        replacements = {}
        normalized_evidence = []

        # Preserve the first exact evidence ID. If a later domain cites the
        # same source ID with a different locator/claim, scope the ID to that
        # domain so distinct evidence claims cannot overwrite each other.
        for evidence in evidence_rows:
            source_id = evidence["source_id"]
            previous = simulated.get(source_id)
            if previous is not None and previous != evidence:
                safe_id = f"{source_id}__{domain_id}"
                if safe_id in simulated:
                    raise ValueError(f"Namespaced evidence ID already exists: {safe_id}")
                replacements[source_id] = safe_id
                evidence = {**evidence, "source_id": safe_id, "source_id_alias_of": source_id}
                namespaced.append({
                    "domain_id": domain_id,
                    "original_source_id": source_id,
                    "namespaced_source_id": safe_id,
                    "previous_claim_source": previous,
                    "current_lane_claim_source": evidence,
                    "reason": "Same bibliography, but distinct locator or claim boundary; retain as a separate evidence occurrence instead of merging.",
                })
            simulated[evidence["source_id"]] = evidence
            normalized_evidence.append(evidence)

        for specialization in review_projection.get("specializations", []):
            specialization["source_ids"] = [replacements.get(sid, sid) for sid in specialization.get("source_ids", [])]
        projections.append({
            "domain_id": domain_id,
            "review_projection": review_projection,
            "source_evidence_projection": normalized_evidence,
            "source_id_replacements": replacements,
            "projection_written_to_shared_register": False,
        })

    if len(namespaced) != 4 or {row["domain_id"] for row in namespaced} != {"D077", "D079", "D081"}:
        raise ValueError(f"Unexpected source-ID conflict resolution: {[(x['domain_id'],x['original_source_id']) for x in namespaced]}")

    collision_types = []
    for item in collisions:
        shared_row = next((row for row in register.get("evidence_register", []) if row.get("source_id") == item["source_id"]), None)
        collision_types.append({
            **item,
            "collision_origin": "existing_shared_register" if shared_row else "earlier_domain_in_this_additive_projection_batch",
            "existing_shared_register_row": shared_row,
            "resolution": "domain-scoped evidence ID prepared; bibliography, URL, locator and claim boundary preserved; no existing row overwritten",
        })

    result = {
        "schema_version": "2026-10-05.d057-d084-register-projection-checkpoint.v2",
        "generated_by": Path(__file__).name,
        "inputs": [
            "../D057_D091/d057_d084_slice_reconciliation_018.json",
            "../D057_D091/reconcile_shared_specialization_register.py",
            "../D057_D091 individual D057-D084 specialization review files",
            "data/career-mapping/_audit/domain_specialization_review_2026_10_03.json (read-only)",
        ],
        "counts": {
            "absent_domain_review_projections": len(missing),
            "collision_safe_projections_prepared_not_applied": len(projections),
            "source_id_locator_claim_conflict_occurrences_resolved_in_projection": len(namespaced),
            "distinct_conflicting_source_ids": len({row["source_id"] for row in collisions}),
            "affected_conflict_domains": len({row["domain_id"] for row in namespaced}),
            "conflicts_against_existing_shared_register": sum(row["collision_origin"] == "existing_shared_register" for row in collision_types),
            "conflicts_within_projection_batch": sum(row["collision_origin"] == "earlier_domain_in_this_additive_projection_batch" for row in collision_types),
            "remaining_unresolved_projection_conflicts": 0,
        },
        "source_id_conflict_resolution": namespaced,
        "reconciled_prior_collision_occurrences": collision_types,
        "prepared_safe_additive_projections": projections,
        "shared_register_written": False,
        "canonical_taxonomy_written": False,
        "resolution_policy": "All 20 absent review projections are prepared. Four reused evidence IDs with distinct locators/claims are domain-scoped in this projection package (three within-batch; one collides with the existing D071 shared source). Original lane records and shared register remain unchanged; the alias retains the original ID and exact source claim for traceability.",
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D057-D084 shared-register projection checkpoint 019", "",
        "Lane-owned, collision-safe projection package. All missing projections are prepared without writing to the shared register or canonical taxonomy.",
        "", "## Counts", "",
    ]
    lines.extend(f"- `{key}`: **{value}**" for key, value in result["counts"].items())
    lines.extend(["", "## Missing domain projections", "", f"Prepared for all 20: {', '.join(missing)}.", "", "## Four source-ID/claim conflicts", ""])
    for item in collision_types:
        fix = next(row for row in namespaced if row["domain_id"] == item["domain_id"] and row["original_source_id"] == item["source_id"])
        lines.append(
            f"- `{item['domain_id']}` / `{item['source_id']}` ({item['collision_origin']}): "
            f"preserved with projection ID `{fix['namespaced_source_id']}`. Locator and claim remain lane-specific; no merge or overwrite."
        )
    lines.extend([
        "", "## Handoff boundary", "",
        "The JSON contains all 20 projected review rows and full source evidence. The three affected domain projections use namespaced source references where necessary. This resolves projection collisions deterministically, but is not a live shared-register update; apply only in the separately authorized register-reconciliation step.",
        "",
    ])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(result["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
