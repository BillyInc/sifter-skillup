"""Guard the row-141 follow-up and first detailed GST 111 source check."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_004.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_004.md"


def test_row_141_remains_unresolved_without_exact_awarder_evidence() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    item = checkpoint["jamb_occurrence_followup"]
    row = next(record for record in report["jamb_identities"] if record["canonical_order"] == 141)
    assert item["occurrence_id"] in {occ["occurrence_id"] for occ in row["source_occurrences"]}
    assert item["disposition"] == "unresolved"
    assert item["field_findings"]["institution_awarder_cell"] == "not source-verified"
    assert "not treated as offering evidence" in item["this_increment_search_result"]


def test_gst111_source_load_outcomes_and_content_truncation_are_pinned() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    course = checkpoint["ccmas_increment"]
    assert course["course_code"] == "GST 111"
    assert course["source_url"].startswith("https://www.nuc.edu.ng/")
    assert course["printed_locator"].startswith("pp. 469-470")
    assert course["source_fields"]["learning_outcomes"] == 7
    assert course["local_fields"]["learning_outcomes"] == 7
    assert course["source_fields"]["lecture_hours"] == 15
    assert course["source_fields"]["practical_hours"] == 45
    assert course["disposition"] == "confirmed_defect"
    assert "truncated" in course["finding"]


def test_cumulative_coverage_and_partition_boundaries() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["ccmas_partition"]["course_rows"] == 3144
    assert coverage["ccmas_partition"]["package_080_detail_rows_with_source_evidence"] == 17
    assert coverage["ccmas_partition"]["package_080_detail_rows_remaining"] == 25
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["no_shared_ledger_edits"] is True
    assert coverage["no_other_partition_touched"] is True
    assert coverage["no_downstream_domain_subgroup_role_audit"] is True
    assert checkpoint["next_cursor"]["ccmas_course_ordinal"] == 2
    assert "25 remain" in MARKDOWN.read_text(encoding="utf-8")
