"""Reconcile current global specialization review artifacts without canonical writes."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[6]
AUDIT = ROOT / "data/career-mapping/_audit"
LANE = AUDIT / "specialization_lanes_2026_10_05"
OUT = Path(__file__).resolve().parent
REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
SUPPLEMENT = LANE / "D057_D168/D099_D112_source_gap_supplement_002.json"
UPDATE = OUT / "D109_D112_global_evidence_update_2026_10_06.json"

TARGET_IDS = ["D001", "D002", "D092", *[f"D{i:03d}" for i in range(93, 113)]]
D057_D091_IDS = [f"D{i:03d}" for i in range(57, 92)]


def read(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    register = read(REGISTER)
    register_by_id = {row["domain_id"]: row for row in register["domain_reviews"]}
    supplement = read(SUPPLEMENT)
    supplement_by_id = {row["domain_id"]: row for row in supplement["domains"]}
    update = read(UPDATE)
    update_by_id = {row["domain_id"]: row for row in update["records"]}
    continuation_update_files = [
        OUT / name for name in [
            "D057_D058_D060_cross_region_update_2026_10_06.json",
            "D062_D068_global_resolution_update_2026_10_06.json",
            "D069_D075_boundary_update_2026_10_06.json",
            "D076_D082_global_boundary_update_2026_10_06.json",
            "D083_D091_global_disposition_update_2026_10_06.json",
        ]
    ]
    continuation_update_ids = sorted({
        row["domain_id"]
        for path in continuation_update_files
        for row in read(path).get("records", [])
    })

    target_rows = []
    for domain_id in TARGET_IDS:
        old = register_by_id.get(domain_id)
        lane_json = LANE / "D057_D168" / f"{domain_id}_specialization_candidate_review_2026_10_05.json"
        lane_md = lane_json.with_suffix(".md")
        if domain_id == "D098":
            review = read(LANE / "D057_D168/D098_three_vs_four_area_adjudication_001.json")
            original = old
            disposition = "adjudication_recommends_four; shared register still has three; projection conflict remains"
            area_count = len(review.get("recommended_internal_candidate_set", []))
            source_count = len(review.get("evidence", []))
        elif lane_json.exists():
            review = read(lane_json)
            disposition = review.get("review_status", "lane candidate review present")
            area_count = len(review.get("candidate_areas", []))
            source_count = len(review.get("evidence", []))
            if domain_id in update_by_id:
                disposition += "; supplemental global review adds/updates boundaries, still noncanonical"
                area_count = update_by_id[domain_id]["candidate_area_count"]
        elif old:
            review = old
            disposition = old.get("review_status", "shared register review present")
            area_count = len(old.get("specializations", []))
            source_count = len({u for area in old.get("specializations", []) for u in area.get("sources", [])})
        else:
            review = {}
            disposition = "missing review artifact"
            area_count = 0
            source_count = 0

        if domain_id in supplement_by_id and domain_id not in update_by_id:
            disposition += "; source-gap supplement exists; explicit resolution still required"
        residual = review.get("remaining_review", review.get("uncertainties", []))
        if isinstance(residual, str):
            residual = [residual]
        target_rows.append({
            "domain_id": domain_id,
            "domain_name": (review.get("domain_name") or (old or {}).get("domain_name")),
            "artifact_state": "lane_review_and_markdown" if lane_json.exists() and lane_md.exists() else "shared_register_or_adjudication",
            "review_status": disposition,
            "candidate_area_count": area_count,
            "source_count_or_urls": source_count,
            "residual_count": len(residual),
            "canonical_write": False,
        })

    review_57_91 = []
    for domain_id in D057_D091_IDS:
        lane_path = LANE / "D057_D091" / f"{domain_id}_specialization_review.json"
        if lane_path.exists():
            item = read(lane_path)
            status = item.get("review_status", "")
            decision = item.get("decision", {})
            detail = str(decision.get("count_status", ""))
            disposition = str(decision.get("disposition", ""))
            if "provisional" in status.lower() or "unresolved" in detail.lower() or "open" in status.lower():
                state = "provisional_or_unresolved"
            else:
                state = "reviewed_recommendation_with_limits"
        else:
            item = register_by_id.get(domain_id, {})
            status = item.get("review_status", "missing")
            detail = " | ".join(str(x) for x in item.get("uncertainties", []))
            disposition = str(item.get("decision", ""))
            specific_parent_open = domain_id in {"D068", "D088", "D090", "D091"}
            if "provisional" in status.lower() or specific_parent_open:
                state = "provisional_or_parent_scope_open"
            else:
                state = "reviewed_recommendation_with_limits"
        review_57_91.append({
            "domain_id": domain_id,
            "domain_name": item.get("domain_name"),
            "artifact_state": "lane_review" if lane_path.exists() else ("shared_register" if item else "missing"),
            "review_status": status,
            "disposition_state": state,
            "explicit_open_detail": detail,
            "canonical_write": False,
        })

    provisional = [x["domain_id"] for x in review_57_91 if "provisional" in x["review_status"].lower()]
    parent_scope_open = ["D068", "D088", "D090", "D091"]
    unresolved_57_91 = sorted(set(provisional) | set(parent_scope_open))
    lane_review_files_found = sum(x["artifact_state"] == "lane_review" for x in review_57_91)
    shared_register_only_records = sum(x["artifact_state"] == "shared_register" for x in review_57_91)
    counts = {
        "target_ids_expected": len(TARGET_IDS),
        "target_ids_with_existing_review_or_adjudication": sum(x["artifact_state"] != "missing review artifact" for x in target_rows),
        "target_ids_missing_artifacts": [x["domain_id"] for x in target_rows if x["artifact_state"] == "missing review artifact"],
        "target_register_reviews_D001_D002_D092_D097": 8,
        "d098_adjudicated_candidate_count": next(x["candidate_area_count"] for x in target_rows if x["domain_id"] == "D098"),
        "d098_shared_register_candidate_count": len(register_by_id["D098"].get("specializations", [])),
        "d098_conflict_still_open": True,
        "d099_d112_review_ids": 14,
        "d109_d112_new_global_updates": len(update_by_id),
        "d057_d091_ids_expected": len(D057_D091_IDS),
        "d057_d091_lane_review_files_expected": 28,
        "d057_d091_lane_review_files_found": lane_review_files_found,
        "d057_d091_shared_register_only_review_records": shared_register_only_records,
        "d057_d091_review_records_total": lane_review_files_found + shared_register_only_records,
        "d057_d091_provisional_status_ids": provisional,
        "d057_d091_additional_explicit_parent_scope_open_ids": parent_scope_open,
        "d057_d091_unique_unresolved_or_provisional_ids": unresolved_57_91,
        "d057_d091_unique_unresolved_or_provisional_count": len(unresolved_57_91),
        "d057_d091_continuation_disposition_update_ids": continuation_update_ids,
        "d057_d091_unsettled_ids_with_recommendation_update": sorted(set(unresolved_57_91) & set(continuation_update_ids)),
        "d057_d091_unsettled_ids_without_recommendation_update": sorted(set(unresolved_57_91) - set(continuation_update_ids)),
        "nigeria_specific_research_performed": False,
        "canonical_edits": 0,
        "role_to_specialization_links_created": 0,
    }
    payload = {
        "schema_version": "2026-10-06.global-specialization-gap-inventory.v1",
        "scope": "global specialization review only; no Nigerian/local research, canonical edits, or role-to-specialization links",
        "method": "Exact domain-ID reconciliation against current shared register, lane JSON/Markdown, D099-D112 source supplement, D098 adjudication, and this continuation's D109-D112 evidence update. Provisional status and explicit parent-scope flags are reported separately from generic source/count limitations.",
        "counts": counts,
        "target_domain_reviews": target_rows,
        "d057_d091_reviews": review_57_91,
        "limitations": [
            "A review artifact is not proof that all recommendation questions are resolved or that canonical data changed.",
            "The target IDs D001-D002 and D092-D112 have an existing recommendation artifact; their remaining work is recommendation/residual reconciliation, including D098's 3-versus-4 projection conflict and explicit D099-D112 boundaries, not redoing a blank inventory.",
            "There are 28 individual lane review files for D057-D084 and 7 additional review records in the shared register for D085-D091. The earlier count of 35 'artifacts' incorrectly combined files and register rows; the corrected report counts these separately.",
            "The 24 provisional D057-D091 statuses are mechanically read from their current review_status values; four additional explicit parent-scope cases (D068, D088, D090, D091) are listed separately then deduplicated.",
            "Continuation supplements provide recommendations for unsettled IDs but do not change the older lane/register statuses or canonical taxonomy. The exact covered and uncovered ID sets are reported separately.",
            "D087's medical hair-replacement boundary, D086 cross-domain role candidates, and D085/D089 jurisdictional caveats remain recorded in their source artifacts. They are not silently classified as a missing specialization count in this inventory; they need their respective parent/role/local-policy owners.",
            "No global evidence review can claim academic-body endorsement or a universally prescribed number of areas unless a source actually provides that standard."
        ],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "exact_global_specialization_gap_inventory_2026_10_06.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Exact global specialization gap inventory — 2026-10-06",
        "",
        "This report is generated from current artifacts. It is global-only: no Nigerian/local research, canonical taxonomy changes, or role-to-specialization links.",
        "",
        "## Exact counts",
        "",
        f"- Explicit target set D001–D002 and D092–D112: **{counts['target_ids_expected']}/{counts['target_ids_with_existing_review_or_adjudication']}** already have a review/adjudication artifact; missing: **{len(counts['target_ids_missing_artifacts'])}**.",
        f"- D098: shared register has **{counts['d098_shared_register_candidate_count']}** candidates; later adjudication has **{counts['d098_adjudicated_candidate_count']}**; reconcile this conflict before treating the recommendation as settled.",
        f"- D099–D112: **{counts['d099_d112_review_ids']}/14** candidate reviews exist; D109–D112 received new global-source updates in this continuation (**{counts['d109_d112_new_global_updates']}/4**).",
        f"- D057–D091: **{counts['d057_d091_lane_review_files_found']}/{counts['d057_d091_lane_review_files_expected']}** individual lane reports (D057–D084), plus **{counts['d057_d091_shared_register_only_review_records']}** shared-register review records (D085–D091), for **{counts['d057_d091_review_records_total']}/{counts['d057_d091_ids_expected']}** reviewed IDs total.",
        f"- Among those IDs, **{len(provisional)}** carry provisional status; explicit parent-scope holds are D068, D088, D090 and D091. Their deduplicated union is **{len(unresolved_57_91)}** unsettled IDs.",
        f"- Supplemental recommendations now cover **{len(counts['d057_d091_unsettled_ids_with_recommendation_update'])}/{len(unresolved_57_91)}** unsettled IDs; still without a continuation recommendation: **{', '.join(counts['d057_d091_unsettled_ids_without_recommendation_update']) or 'none'}**. These recommendations await local reconciliation; canonical records remain unchanged.",
        "- Canonical edits: **0**. Role-to-specialization links: **0**. Nigerian/local research: **not performed**.",
        "",
        "## D057–D091 exact provisional / parent-scope set",
        "",
        ", ".join(unresolved_57_91),
        "",
        "The provisional IDs are read from the lane's `review_status`; D068, D088, D090 and D091 are added because their current artifacts explicitly leave the parent scope unresolved/split. D087's hair-replacement boundary and D086 role-fit concerns remain noted separately and are not mislabeled as subgroup-count failures.",
        "",
        "## Target set D001–D002, D092–D112",
        "",
        "| ID | Domain | Current artifact/recommendation state | Candidate count |",
        "|---|---|---|---:|",
    ]
    for row in target_rows:
        lines.append(f"| {row['domain_id']} | {row['domain_name'] or 'name missing'} | {row['review_status']} | {row['candidate_area_count']} |")
    lines += [
        "",
        "## Interpretation and limits",
        "",
        "The previously reported 23 target IDs are not 23 unreviewed names: current artifacts already contain recommendations for all 23. Remaining work is to reconcile their stated uncertainties and conflicts, not to repeat completed source discovery. D098's shared-register projection remains three while the sourced adjudication says four. D099–D112 each have a recommendation, but explicit parent-boundary/count questions remain; the D109–D112 evidence update narrows some of those questions without promoting any subgroup.",
        "",
        "D057–D084 has 28 individual lane report files; D085–D091 has seven source-reviewed records only in the shared register. These are 35 reviewed IDs, not 35 individual lane artifacts. Artifact presence is not completion. The current machine statuses identify 24 provisional IDs; explicit parent-scope holds add D068, D088, D090 and D091, yielding 28 unique unsettled dispositions. Continuation recommendations now cover the exact IDs listed in the JSON, but only local reconciliation can accept/revise those recommendations and implement parent-scope or canonical changes. Source limitations such as 'no standard prescribes this exact count' are not treated by themselves as a blocker: our taxonomy is an internal synthesis and should say so plainly.",
        "",
        "The JSON preserves per-ID statuses and uncertainties. This inventory is only the exact current-state reconciliation; it does not claim that the entire global 168-domain specialization audit is closed.",
        "",
        "Reproduce with `python build_exact_global_specialization_gap_inventory_2026_10_06.py`.",
    ]
    (OUT / "EXACT_GLOBAL_SPECIALIZATION_GAP_INVENTORY_2026_10_06.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
