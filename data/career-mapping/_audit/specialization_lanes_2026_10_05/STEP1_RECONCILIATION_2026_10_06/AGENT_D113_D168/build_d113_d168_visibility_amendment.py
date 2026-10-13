"""Append corrected student-visibility interpretation for exact subgroup comparison."""

from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / "data/career-mapping").is_dir())
REGISTER = HERE / "d113_d168_step1_reconciliation_register_2026_10_06.json"
OUT = HERE / "d113_d168_subgroup_visibility_amendment_004.json"
CHECKPOINT = HERE / "D113_D168_STEP1_RECONCILIATION_CHECKPOINT_004.md"
STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"


def is_student_visible(group: dict) -> bool:
    state = str(group.get("data_state") or "").casefold()
    reason = str(group.get("student_visibility_reason") or "").strip()
    return state not in {"excluded", "review_only", "inactive"} and not reason


def main() -> None:
    if OUT.exists() or CHECKPOINT.exists():
        raise SystemExit("Append-only amendment already exists; refusing to overwrite.")
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
    amendments = []
    hidden = visible = 0
    for row in data["records"]:
        groups = structure.get(row["domain_id"], {}).get("subgroups", [])
        statuses = []
        for group in groups:
            shown = is_student_visible(group)
            visible += int(shown)
            hidden += int(not shown)
            statuses.append({
                "isco_submajor": group.get("isco_submajor"),
                "label": group.get("label"),
                "data_state": group.get("data_state"),
                "student_visibility_reason": group.get("student_visibility_reason"),
                "student_visible_under_current_contract": shown,
            })
        visible_labels = {g["label"].casefold().strip() for g in statuses if g["student_visible_under_current_contract"]}
        candidate_labels = {a["label"].casefold().strip() for a in row["recommended_final_student_facing_areas"]}
        amendments.append({
            "domain_id": row["domain_id"],
            "catalogue_domain_name": row["domain_name"],
            "current_subgroup_records": statuses,
            "current_student_visible_subgroup_count": len(visible_labels),
            "candidate_area_count": len(candidate_labels),
            "candidate_set_matches_current_student_visible_set": bool(candidate_labels) and candidate_labels == visible_labels,
            "comparison_basis": "Current subgroup record state and explicit student_visibility_reason; this is presentation-state comparison only, not role/ISCO fit evidence.",
        })
    payload = {
        "schema_version": "2026-10-06.step1-subgroup-visibility-amendment.v1",
        "append_only_amendment": "004",
        "amends_register": REGISTER.name,
        "visibility_rule": "A subgroup is treated as student-visible only when data_state is not excluded/review_only/inactive and student_visibility_reason is empty.",
        "totals_across_56_domains": {"visible_subgroup_records": visible, "hidden_subgroup_records": hidden, "all_subgroup_records": visible + hidden},
        "records": amendments,
    }
    if len(amendments) != 56:
        raise SystemExit("Visibility amendment must cover all 56 domains.")
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D113–D168 STEP 1 Reconciliation — Checkpoint 004",
        "",
        "Corrected visibility interpretation appended after validation showed that subgroup `data_state` alone overcounts student-visible records. Use this amendment for current visible subgroup comparisons; base-register rows retain raw state/reason fields.",
        "",
        "- Domains with explicit visibility disposition: **56/56**.",
        f"- Current subgroup records across the range: **{visible + hidden}**; visible under current state/reason contract: **{visible}**; hidden: **{hidden}**.",
        "- Visibility requires both a non-excluded state and an empty `student_visibility_reason`.",
        "- This correction only fixes presentation-state comparison; role/ISCO membership is not treated as fit evidence.",
        "- Read this together with base register and amendments 002 and 003. Material recommendation conflicts and parent-scope decisions remain unresolved as listed in the base register.",
        "",
    ]
    CHECKPOINT.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(payload["totals_across_56_domains"], indent=2))
    print(OUT)
    print(CHECKPOINT)


if __name__ == "__main__":
    main()
