"""Protect the GER 104 source comparison and disjoint partition boundary."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_007.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_007.md"


def test_ger104_locator_and_course_identity_match_the_current_package() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    item = checkpoint["ccmas_increment"]
    package = next(row for row in report["ccmas_packages"] if row["package_index"] == 80)
    assert item["course_code"] == "GER 104"
    assert item["record_id"].endswith("::0006")
    assert item["programme"] == package["programme"]
    assert item["printed_locator"].startswith("printed pp. 471-472")


def test_source_title_conflict_and_page_header_spill_remain_distinct() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    findings = {row["field"]: row for row in checkpoint["ccmas_increment"]["field_findings"]}
    assert findings["title"]["disposition"] == "source_conflict"
    assert findings["load_outcomes_content"]["disposition"] == "confirmed_match"
    assert findings["outcome_text"]["disposition"] == "confirmed_defect"
    assert "New Arts 472" in findings["outcome_text"]["detail"]


def test_updated_denominators_and_next_row_are_pinned() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["ccmas_partition"]["package_080_detail_rows_with_source_evidence"] == 20
    assert coverage["ccmas_partition"]["package_080_detail_rows_remaining"] == 22
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["no_shared_ledger_edits"] is True
    assert coverage["no_other_partition_touched"] is True
    assert checkpoint["next_cursor"]["ccmas_course_ordinal"] == 7
    assert "22 remaining" in MARKDOWN.read_text(encoding="utf-8")
