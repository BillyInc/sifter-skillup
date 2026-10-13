"""Emit a source-linked D001 report and reconcile the lane/D119 totals."""
from __future__ import annotations

import collections
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
LANE_JSON = HERE / "D001_D084_inventory_and_triage.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
FIT_LEDGER = ROOT / "data/career-mapping/_audit/role_taxonomy_fit_review_2026_10_05.json"
D085_QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D085_D168_role_fit_queue_2026_10_05.json"


def main() -> None:
    lane = json.loads(LANE_JSON.read_text(encoding="utf-8"))
    base = json.loads(ROLE_LIBRARY.read_text(encoding="utf-8"))
    sys.path.insert(0, str(ROOT / "data/career-mapping"))
    from _role_overlay_loader import load_overlay_roles

    merged = {
        f"{row.get('domain_id')}|{row.get('role_name')}": row
        for row in base + load_overlay_roles()
    }
    d001 = [row for row in lane["records"] if row.get("domain_id") == "D001"]
    assert len(d001) == 37 and len({row["role_key"] for row in d001}) == 37
    assert all(row.get("canonical_review_metadata", {}).get("domain_fit_review_status") for row in d001)
    assert all(row.get("canonical_review_metadata", {}).get("specialization_fit_review_status") for row in d001)

    ledger = json.loads(FIT_LEDGER.read_text(encoding="utf-8"))["role_reviews"]
    d119 = [row for row in ledger if row.get("role_key", "").startswith("D119|")]
    d119_keys = {row["role_key"] for row in d119}
    assert len(d119) == len(d119_keys) == 20
    assert all(key in merged for key in d119_keys), "D119 key no longer resolves to a canonical record"
    assert all(row.get("domain_fit_status") and row.get("specialization_fit_status") for row in d119)
    assert all(row.get("domain_fit_status") != "not_individually_reviewed" for row in d119)

    queue = json.loads(D085_QUEUE.read_text(encoding="utf-8"))["counts"]
    assert queue["whole_catalogue_canonical_mappings"] == 3919
    assert queue["whole_catalogue_without_explicit_semantic_review_status"] == 3914
    assert queue["d119_role_key_decision_matches"] == 20 and queue["d119_role_key_decision_mismatches"] == 0
    assert queue["lane_mappings_total"] == 1693

    d001_fit = collections.Counter(row["canonical_review_metadata"]["domain_fit_review_status"] for row in d001)
    d001_spec = collections.Counter(row["canonical_review_metadata"]["specialization_fit_review_status"] for row in d001)
    live_status_counts = collections.Counter(
        row.get("domain_fit_review_status") or "no_explicit_status"
        for row in merged.values()
    )
    lane_remaining = 2206 - len(d001)
    assert lane_remaining == 2169

    reviewed = {
        "schema_version": 1,
        "as_of": "2026-10-05",
        "scope": "Aquinas role-fit lane, D001 only; no other role taxonomy records edited by this report builder",
        "domain": {"id": "D001", "name": "Software Engineering", "scope": d001[0]["domain_scope"]},
        "method": "Each D001 role-task record is compared independently to the D001 parent scope and candidate specialization boundary. ISCO/ESCO grouping, current subgroup membership, title similarity and frequency are not fit evidence.",
        "counts": {
            "d001_mapping_rows": 37,
            "d001_domain_fit": dict(d001_fit),
            "d001_specialization_fit": dict(d001_spec),
            "d001_unsupported_student_paths_excluded": sum(
                row["canonical_review_metadata"]["student_path_status"] == "excluded" for row in d001
            ),
            "D001_D084_remaining_without_individual_review": lane_remaining,
            "D085_D168_excluding_D119_remaining": queue["lane_mappings_total"],
            "D119_prior_ledger_rows_reconciled": len(d119),
            "D119_domain_and_specialization_decisions_present": len(d119),
            "all_canonical_mappings": queue["whole_catalogue_canonical_mappings"],
            "pre_lane_generated_mappings_without_explicit_semantic_status": queue["whole_catalogue_without_explicit_semantic_review_status"],
            "pre_lane_generated_explicit_status_counts": queue["whole_catalogue_explicit_semantic_status_counts"],
            "current_live_canonical_domain_fit_status_field_counts": dict(live_status_counts),
        },
        "D001_reviews": d001,
        "D119_reconciliation": {
            "review_repeated": False,
            "ledger_key_matches": queue["d119_role_key_decision_matches"],
            "ledger_key_mismatches": queue["d119_role_key_decision_mismatches"],
            "keys_with_both_domain_and_specialization_disposition": len(d119),
            "dispositions": d119,
        },
        "count_explanation": (
            "The 3,914 figure is the source inventory's pre-lane count lacking an explicit canonical semantic-status field; "
            "the five explicit unsupported statuses make 3,919 total. The 20 D119 decisions live in the separate fit-review ledger, "
            "so they are verified by exact role-key reconciliation and by requiring both domain and specialization dispositions, "
            "not by repeating their source review. The 3,899 non-D119 lane rows plus the 20 prior D119 reviews partition the 3,919 mappings. "
            "Since this lane then recorded 37 D001 reviews in canonical records, the current live status-field count differs from the pre-lane snapshot."
        ),
        "evidence_limits": [
            "ESCO and O*NET support role identity/task scope; neither is a universal licence or labour-demand source.",
            "The WEF Future of Jobs Report is employer-survey outlook evidence rather than an occupational task profile; both WEF-only D001 rows remain unresolved.",
            "D001 candidate specialization fit is separately reasoned against its stated task boundary. This does not revise the excluded subgroup taxonomy or its visibility.",
        ],
    }
    json_path = HERE / "D001_reviewed_decisions.json"
    json_path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D001 Software Engineering Role-Fit Review",
        "",
        "Date: 2026-10-05. Evidence checkpoint, not catalogue-wide sign-off.",
        "",
        f"Reviewed **37/37** D001 mappings. Domain decisions: `{dict(d001_fit)}`. Candidate-specialization decisions: `{dict(d001_spec)}`. Five unsupported D001 paths are excluded; the occupation identities remain in the catalogue.",
        "",
        "## Per-role decisions and evidence",
        "",
        "The JSON companion retains the full local ESCO/O*NET task text, exact role description, parent scope, basis and source URLs per role.",
        "",
        "| Role | Domain fit | Candidate specialization fit | Student path | Task evidence source |",
        "|---|---|---|---|---|",
    ]
    for row in d001:
        review = row["canonical_review_metadata"]
        refs = review["domain_fit_review_source_refs"]
        linked = ", ".join(f"[{index + 1}]({url})" for index, url in enumerate(refs)) or "No task source"
        lines.append(
            f"| {row['role_name']} | {review['domain_fit_review_status']} | {review['specialization_fit_review_status']} | {review['student_path_status']} | {linked} |"
        )
        lines.append(
            f"| _Task basis_ | {review['domain_fit_review_basis']} | _Specialization basis_ | {review['specialization_fit_review_basis']} | |"
        )
    lines += [
        "",
        "## Catalogue reconciliation",
        "",
        "- Starting catalogue: **3,919** mappings; source inventory reported **3,914** without an explicit semantic status field and **5** explicitly unsupported.",
        "- Partition at the start: **3,899** non-D119 lane mappings + **20** D119 prior ledger decisions = **3,919**.",
        "- D119 was not source-reviewed again. All **20/20** ledger keys still resolve to canonical records and each has both domain-fit and specialization-fit dispositions; mismatches: **0**.",
        f"- After this D001 slice: **2,169** D001-D084 mappings remain unreviewed; the separate D085-D168 lane has **{queue['lane_mappings_total']}** excluding D119. D119 remains the preserved **20** reviewed ledger rows.",
        "- The 3,914 count is about explicit canonical status fields, not whether D119 was assessed: its twenty decisions are held in a separate ledger. The live canonical field count now changes because this D001 slice is persisted.",
        "- Reconciled total now: **37 D001 decisions persisted + 2,169 remaining D001-D084 rows + 1,693 D085-D168 rows outside D119 + 20 previously reviewed D119 ledger rows = 3,919**.",
        "",
        "## Source limits",
        "",
        "- ESCO: task/occupation evidence for the cited URI, not a global credentialing or labour-demand authority.",
        "- O*NET 31.0: task evidence for mapped US occupations; not evidence of country-specific licensing or global demand.",
        "- WEF Future of Jobs 2025: job-family trend evidence only. The WEF-only Full Stack Engineers and Software and Applications Developers entries remain unresolved because no task profile is linked.",
        "- No D001 role taxonomy, overlay, subgroup schema or UI structure was changed; the five unsupported paths alone are marked excluded.",
    ]
    (HERE / "D001_reviewed_decisions.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(reviewed["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
