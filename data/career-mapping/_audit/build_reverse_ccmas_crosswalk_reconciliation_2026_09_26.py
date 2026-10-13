"""Record the current reverse CCMAS crosswalk reconciliation state.

The existing 83-entry JSONL ledger is an input artifact.  This script does not
rewrite it; it records which append-only adjudication checkpoints exist and
which entries still require reconciliation into a canonical source-phase
decision.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = AUDIT.parent
ACCESS_DATE = "2026-09-26"
LEDGER = AUDIT / "jamb_ccmas_mapping_quality_2026-09-24" / "unreferenced_ccmas_component_crosswalk_2026-09-25.jsonl"
OUT_JSON = AUDIT / "reverse_ccmas_crosswalk_reconciliation_2026-09-26_001.json"
OUT_MD = AUDIT / "reverse_ccmas_crosswalk_reconciliation_2026-09-26_001.md"


def load_ledger() -> list[dict]:
    return [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]


def range_checkpoint(index: int) -> str:
    start = ((index - 1) // 10) * 10 + 1
    end = min(start + 9, 83)
    ordinal = (start - 1) // 10 + 1
    return f"_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-{ordinal:03d}-entries-{start:03d}-{end:03d}-2026-09-25.md"


def resolution_checkpoint(index: int) -> str | None:
    if index > 40:
        return None
    start = ((index - 1) // 10) * 10 + 1
    end = min(start + 9, 40)
    ordinal = (start - 1) // 10 + 1
    return f"_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-resolution-{ordinal:03d}-entries-{start:03d}-{end:03d}-2026-09-25.md"


def disposition(index: int) -> dict | None:
    if index == 81:
        return {"state": "no_support_found_in_defined_420_universe", "note": "The checkpoint records no exact supported JAMB identity/offering after the documented search; the CCMAS package itself remains valid."}
    if index == 82:
        return {"state": "no_support_found_in_defined_420_universe", "note": "The checkpoint records no exact supported JAMB identity/offering after the documented search; do not split PPE across unrelated degrees."}
    if index == 83:
        return {"state": "confirmed_match_pending_ledger_reconciliation", "note": "The checkpoint records an exact Veterinary Medicine JAMB offering and Veterinary CCMAS evidence."}
    return None


def main() -> None:
    rows = load_ledger()
    reconciled = []
    for index, row in enumerate(rows, start=1):
        adjudication = range_checkpoint(index)
        resolution = resolution_checkpoint(index)
        status = "adjudication_checkpoint_present_ledger_still_candidate"
        if disposition(index):
            status = "disposition_recorded_pending_ledger_reconciliation"
        reconciled.append(
            {
                "crosswalk_entry": index,
                "component_id": row["component_id"],
                "ccmas_programme": row["ccmas_programme"],
                "ccmas_programme_code": row.get("ccmas_programme_code"),
                "ccmas_source_file": row.get("ccmas_source_file"),
                "course_count": row.get("course_count"),
                "ledger_classification": row.get("candidate_classification"),
                "reconciliation_status": status,
                "adjudication_checkpoint": adjudication,
                "resolution_checkpoint": resolution,
                "recorded_disposition": disposition(index),
                "evidence": [
                    {
                        "url": row.get("official_nuc_source", {}).get("url"),
                        "locator": row.get("official_nuc_source", {}).get("locator"),
                        "accessed_on": row.get("official_nuc_source", {}).get("access_date") or ACCESS_DATE,
                        "supports": "CCMAS programme, course, content and outcome evidence; not by itself a JAMB offering match.",
                    }
                ],
                "recommendation": "Reconcile the numbered adjudication checkpoint with the machine ledger, preserving exact JAMB faculty/institution occurrences and course/outcome evidence. Do not promote a reverse crosswalk candidate from lexical similarity alone.",
            }
        )
    report = {
        "schema_version": 1,
        "audit_date": ACCESS_DATE,
        "status": "open_reverse_crosswalk_reconciliation",
        "ledger_path": str(LEDGER.relative_to(ROOT)),
        "coverage": {
            "ccmas_components": len(rows),
            "jamb_universe_checked": 420,
            "adjudication_checkpoints_present": len(rows),
            "resolution_checkpoints_present_for_entries_001_040": 40,
            "entries_041_080_without_resolution_checkpoint": 40,
            "entries_081_083_with_recorded_dispositions_not_reflected_in_ledger": 3,
        },
        "closure_rule": "A numbered checkpoint is not a canonical mapping update. The reverse crosswalk remains open until each disposition is reconciled into the source-phase evidence ledger without collapsing distinct JAMB contexts.",
        "entries": reconciled,
        "writes": {
            "input_ledger_edited": False,
            "shared_source_or_mapping_files_edited": False,
            "downstream_files_edited": False,
        },
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Reverse CCMAS crosswalk reconciliation — 2026-09-26 (001)",
        "",
        "Status: **open**. This append-only artifact reads the 83-entry reverse crosswalk and records the existing adjudication/resolution checkpoints. It does not edit the input ledger or any shared mapping/downstream file.",
        "",
        f"Input ledger: `{LEDGER.relative_to(ROOT).as_posix()}`",
        "",
        "## Coverage",
        "",
    ]
    for key, value in report["coverage"].items():
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "All 83 entries have numbered adjudication checkpoints. Only entries 001–040 have separate resolution checkpoints. Entries 081–083 have recorded dispositions in their adjudication checkpoint, but the machine ledger still says `candidate requiring source evidence`; that is a reconciliation issue, not permission to edit or promote the ledger here.",
        "",
        "The JSON contains the exact NUC URL, programme/course locator, access date, checkpoint path, current ledger state, and repair/reconciliation recommendation for every entry.",
        "",
        report["closure_rule"],
        "",
        "Downstream domain, subgroup, role, and role-naming work remains deferred.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "coverage": report["coverage"]}, indent=2))


if __name__ == "__main__":
    main()
