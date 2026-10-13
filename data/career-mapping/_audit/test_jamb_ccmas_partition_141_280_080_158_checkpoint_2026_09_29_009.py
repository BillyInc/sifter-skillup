"""Protect cursor reconciliation and the GST 312 package-080 source check."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_009.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_009.md"


def test_resume_cursor_skips_previously_source_checked_course_ordinals() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    correction = checkpoint["reconciliation_before_increment"]["cursor_correction"]
    assert correction["previous_cursor"] == 11
    assert correction["correct_next_unreviewed_course_ordinal"] == 25
    assert "11-24 were source-checked" in correction["reason"]


def test_gst312_fields_are_tied_to_deterministic_package_record() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    item = checkpoint["ccmas_increment"]
    package = next(row for row in report["ccmas_packages"] if row["package_index"] == 80)
    assert item["course_ordinal"] == 25
    assert item["record_id"].endswith("::0025")
    assert item["course_code"] == "GST 312"
    assert item["programme"] == package["programme"]
    assert item["official_source_url"].startswith("https://www.nuc.edu.ng/")
    assert item["field_findings"][0]["disposition"] == "confirmed_match"
    assert item["field_findings"][1]["disposition"] == "confirmed_defect"


def test_current_denominators_and_no_mutation_boundary() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["ccmas_partition"]["course_rows"] == 3144
    assert coverage["ccmas_partition"]["package_080_detail_rows_with_source_evidence"] == 25
    assert coverage["ccmas_partition"]["package_080_detail_rows_remaining"] == 17
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["no_shared_ledger_edits"] is True
    assert coverage["no_other_partition_touched"] is True
    assert coverage["no_downstream_domain_subgroup_role_audit"] is True
    assert checkpoint["next_cursor"]["ccmas_course_ordinal"] == 26
    assert "17 remaining" in MARKDOWN.read_text(encoding="utf-8")
