#!/usr/bin/env python3
"""Remove stale candidate-link wording from active D078 review notes."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"
OLD = "Student approval remains false; candidate links are review-only."
REPLACEMENT = "Learning-link review is complete; student display remains a separate full-contract and rendered-UI decision."


def clean(values: list[object]) -> list[str]:
    out: list[str] = []
    for value in values:
        note = str(value)
        if note == OLD:
            note = REPLACEMENT
        note = note.replace(
            "role-task linkage remains candidate-level because the item occurs in the role list only",
            "role-list occurrence alone does not establish this item as a role task; the role-task relationship was not adjudicated by the link review",
        )
        note = note.replace(
            "no item-level task linkage beyond candidate role context",
            "no item-level task linkage beyond the documented role context; the learning link does not establish the role-task relationship",
        )
        note = note.replace(
            "exact role task relation remains candidate-only",
            "the exact role-task relationship was not adjudicated by the learning-link review",
        )
        note = note.replace(
            "Role-task relationship is candidate-only",
            "Role-task relationship remains a separate placement question; link review does not prove it",
        )
        note = note.replace("Student approval remains false", "Student display is a separate full-contract and rendered-UI decision")
        if note and note not in out:
            out.append(note)
    return out


def main() -> None:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = data.get("records") or []
    for row in rows:
        row["unresolved_reasons"] = clean(row.get("unresolved_reasons") or [])
        row["remaining_review_notes"] = clean(row.get("remaining_review_notes") or [])
    data.setdefault("coverage", {})["active_stale_candidate_link_notes_remaining"] = sum(
        any("candidate link" in str(note).lower() or "candidate-only" in str(note).lower()
            for note in (row.get("unresolved_reasons") or []) + (row.get("remaining_review_notes") or []))
        for row in rows
    )
    if data["coverage"]["active_stale_candidate_link_notes_remaining"]:
        raise ValueError("Active candidate-link wording remains")
    LEDGER.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Cleaned stale active link notes for {len(rows)} ledger records.")


if __name__ == "__main__":
    main()
