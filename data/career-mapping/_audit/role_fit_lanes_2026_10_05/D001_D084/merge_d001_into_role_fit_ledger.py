"""Merge D001 decisions into the central role-fit ledger without replacing it."""
from __future__ import annotations

import argparse
import collections
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
CENTRAL_LEDGER = ROOT / "data/career-mapping/_audit/role_taxonomy_fit_review_2026_10_05.json"
D001_REPORT = HERE / "D001_reviewed_decisions.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="merge D001 only; preserve existing ledger rows")
    args = parser.parse_args()
    ledger = json.loads(CENTRAL_LEDGER.read_text(encoding="utf-8"))
    report = json.loads(D001_REPORT.read_text(encoding="utf-8"))
    rows = ledger["role_reviews"]
    before_by_key = {row["role_key"]: row for row in rows}
    assert len(before_by_key) == len(rows), "central ledger has duplicate role keys"
    assert len([row for row in rows if row["role_key"].startswith("D119|")]) == 20

    incoming = []
    for reviewed in report["D001_reviews"]:
        key = reviewed["role_key"]
        meta = reviewed["canonical_review_metadata"]
        status = meta["domain_fit_review_status"]
        specialization_status = meta["specialization_fit_review_status"]
        if key in before_by_key:
            old = before_by_key[key]
            assert old.get("domain_fit_status") == status
            assert old.get("specialization_fit_status") == specialization_status
            continue
        incoming.append({
            "role_key": key,
            "domain_fit_status": status,
            "specialization_fit_status": specialization_status,
            "specialization_key": None,
            "specialization_candidate": meta.get("specialization_fit_candidate"),
            "student_path_disposition": (
                "exclude_from_D001_student_path" if status == "unsupported"
                else "unresolved_task_evidence" if status == "unresolved"
                else "conditional_scope_review" if status == "conditional"
                else "retain_candidate_path"
            ),
            "domain_fit_basis": meta["domain_fit_review_basis"],
            "specialization_fit_basis": meta["specialization_fit_review_basis"],
            # Compatibility field used by the existing catalogue audit tests;
            # the distinct fields above remain authoritative for each decision.
            "basis": meta["domain_fit_review_basis"],
            "source_refs": meta["domain_fit_review_source_refs"],
        })

    assert len(incoming) + len([k for k in before_by_key if k.startswith("D001|")]) == 37
    if args.apply:
        existing_d119 = [row for row in rows if row["role_key"].startswith("D119|")]
        ledger["role_reviews"] = rows + incoming
        after_d119 = [row for row in ledger["role_reviews"] if row["role_key"].startswith("D119|")]
        assert after_d119 == existing_d119, "D119 ledger rows changed during merge"
        CENTRAL_LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "mode": "apply" if args.apply else "dry_run",
        "existing_rows": len(rows),
        "existing_d119_rows_preserved": len([row for row in rows if row["role_key"].startswith("D119|")]),
        "new_d001_rows": len(incoming),
        "result_rows": len(rows) + len(incoming),
        "new_domain_statuses": dict(collections.Counter(row["domain_fit_status"] for row in incoming)),
        "new_specialization_statuses": dict(collections.Counter(row["specialization_fit_status"] for row in incoming)),
        "central_register_changed": args.apply,
        "domain_specialization_review_register_changed": False,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
