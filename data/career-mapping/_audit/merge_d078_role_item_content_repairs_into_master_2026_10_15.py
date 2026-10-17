#!/usr/bin/env python3
"""Merge repaired definitions and links while preserving master decisions."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MASTER = ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
REPAIRS = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"


def identity(row: dict) -> tuple[int, str, str]:
    return int(row["queue_position"]), str(row["pair_key"]), str(row["label"])


def main() -> None:
    master = json.loads(MASTER.read_text(encoding="utf-8"))
    repairs = json.loads(REPAIRS.read_text(encoding="utf-8"))
    target = master["role_item_reconciliation"]["records"]
    source = repairs["records"]
    target_by_id = {identity(row): row for row in target}
    source_by_id = {identity(row): row for row in source}
    if len(target_by_id) != 173 or len(source_by_id) != 173 or target_by_id.keys() != source_by_id.keys():
        raise ValueError("Master and repair lane must have the same 173 unique identities")

    decision_fields = ("approval_status", "approval_reason", "placement_decision", "final_layer", "student_visibility")
    before = {field: Counter(str(row.get(field)) for row in target) for field in decision_fields}
    for key, repaired in source_by_id.items():
        row = target_by_id[key]
        preserved = {field: row.get(field) for field in decision_fields}
        for field in ("plain_language_meaning", "learning_link", "learning_link_review", "resolved_source_urls", "source_locators"):
            if field in repaired:
                row[field] = repaired[field]
        row["role_snapshot_reconciliation"] = repaired["role_snapshot_reconciliation"]
        row["content_link_repair_provenance"] = {
            "source_artifact": REPAIRS.relative_to(ROOT).as_posix(),
            "completed_on": "2026-10-15",
            "fields_repaired": ["plain_language_meaning", "learning_link", "learning_link_review", "resolved_source_urls", "source_locators"],
            "approval_decisions_changed": False,
            "student_display_approval_changed": False,
        }
        if any(row.get(field) != value for field, value in preserved.items()):
            raise AssertionError(f"Master disposition changed for {key}")

    meanings_missing = sum(not str(row.get("plain_language_meaning") or "").strip() for row in target)
    link_reviews_missing = sum(not row.get("learning_link_review") for row in target)
    candidate_states = sum(
        str((row.get("learning_link") or {}).get(field) or "").startswith("candidate")
        for row in target for field in ("state", "url_status")
    )
    if meanings_missing or link_reviews_missing or candidate_states:
        raise ValueError(f"Incomplete merge: blank meanings={meanings_missing}, missing reviews={link_reviews_missing}, candidate states={candidate_states}")
    after = {field: Counter(str(row.get(field)) for row in target) for field in decision_fields}
    if before != after:
        raise AssertionError("Approval/placement decisions changed")

    coverage = master["role_item_reconciliation"].setdefault("coverage", {})
    coverage.update({
        "plain_language_meanings_missing": meanings_missing,
        "learning_link_reviews_missing": link_reviews_missing,
        "candidate_only_link_states_remaining": candidate_states,
        "content_and_link_repairs_merged_on": "2026-10-15",
        "approval_source_preserved": "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json",
        "student_display_approval_changed_by_content_repair": False,
    })
    master.setdefault("source_artifacts", []).append(
        "D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json (content/link repairs only; consolidated master decisions preserved)"
    )
    MASTER.write_text(json.dumps(master, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Merged {len(target)} items; blank meanings={meanings_missing}; missing link reviews={link_reviews_missing}; candidate states={candidate_states}; master decisions={dict(Counter(r.get('approval_status') for r in target))}; decisions changed=0")


if __name__ == "__main__":
    main()
