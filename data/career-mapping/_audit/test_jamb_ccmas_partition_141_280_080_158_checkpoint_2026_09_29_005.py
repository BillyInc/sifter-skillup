"""Protect the source-conflict correction and GST 112 truncation finding."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_005.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_005.md"


def test_gst112_identity_is_tied_to_current_deterministic_record() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    assert checkpoint["ccmas_increment"]["record_id"] == "arts.json::Modern European Languages B.A (German)::0002"
    package = next(row for row in report["ccmas_packages"] if row["package_index"] == 80)
    assert package["course_count"] == 42
    assert checkpoint["ccmas_increment"]["course_code"] == "GST 112"


def test_global_detail_code_difference_is_preserved_as_source_conflict() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    correction = checkpoint["source_change_reconciled_first"]
    assert correction["prior_disposition"].startswith("confirmed_defect")
    assert correction["superseding_disposition"] == "source_conflict"
    assert "global structure lists GST 113" in correction["reason"]
    assert "detailed course block uses GST 112" in correction["reason"]


def test_content_truncation_and_updated_denominators_are_pinned() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    course = checkpoint["ccmas_increment"]
    assert course["disposition"] == "confirmed_defect"
    assert course["source_fields"]["learning_outcomes"] == course["local_fields"]["learning_outcomes"] == 8
    assert course["source_fields"]["lecture_hours"] == 30
    assert "truncated" in course["finding"]
    coverage = checkpoint["coverage_after_increment"]["ccmas_partition"]
    assert coverage["package_080_detail_rows_with_source_evidence"] == 18
    assert coverage["package_080_detail_rows_remaining"] == 24
    assert coverage["packages_complete"] == 0
    assert checkpoint["coverage_after_increment"]["no_shared_ledger_edits"] is True
    assert "24 remaining" in MARKDOWN.read_text(encoding="utf-8")
