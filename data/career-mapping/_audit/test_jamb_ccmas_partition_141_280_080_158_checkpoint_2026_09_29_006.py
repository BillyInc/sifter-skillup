"""Protect the GER 102 source comparison and package-080 denominator."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_006.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_006.md"


def test_german_course_record_and_locator_are_scoped_correctly() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    item = checkpoint["ccmas_increment"]
    package = next(row for row in report["ccmas_packages"] if row["package_index"] == 80)
    assert item["record_id"].endswith("::0004")
    assert item["course_code"] == "GER 102"
    assert package["programme"] == item["programme"]
    assert package["course_count"] == 42
    assert item["printed_locator"].startswith("printed pp. 470-471")


def test_title_conflict_and_page_header_defect_are_separate() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    findings = {row["field"]: row for row in checkpoint["ccmas_increment"]["field_findings"]}
    assert findings["title"]["disposition"] == "source_conflict"
    assert findings["learning_outcome_text"]["disposition"] == "confirmed_defect"
    assert findings["load_and_learning_outcomes"]["disposition"] == "confirmed_match"
    assert findings["content_summary"]["disposition"] == "confirmed_match"


def test_cumulative_remaining_course_rows_and_partition_boundaries() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["ccmas_partition"]["package_080_detail_rows_with_source_evidence"] == 19
    assert coverage["ccmas_partition"]["package_080_detail_rows_remaining"] == 23
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["no_shared_ledger_edits"] is True
    assert coverage["no_other_partition_touched"] is True
    assert coverage["no_downstream_domain_subgroup_role_audit"] is True
    assert "23 remaining" in MARKDOWN.read_text(encoding="utf-8")
