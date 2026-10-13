"""Protect the four detailed source comparisons added for German course rows."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_008.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_008.md"


def test_four_course_ordinals_and_source_locator_are_in_scope() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    item = checkpoint["ccmas_increment"]
    package = next(row for row in report["ccmas_packages"] if row["package_index"] == 80)
    assert [row["course_ordinal"] for row in item["detailed_findings"]] == [7, 8, 9, 10]
    assert len(item["detailed_findings"]) == 4
    assert item["programme"] == package["programme"]
    assert item["official_source_url"].startswith("https://www.nuc.edu.ng/")
    assert item["accessed_on"] == "2026-09-29"


def test_matches_and_extraction_defects_are_distinguished() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["course_code"]: row for row in checkpoint["ccmas_increment"]["detailed_findings"]}
    assert rows["GER 105"]["disposition"] == "confirmed_match"
    assert rows["GER 106"]["disposition"] == "confirmed_defect"
    assert rows["GER 107"]["disposition"] == "confirmed_match"
    assert rows["GER 108"]["field_findings"][0]["disposition"] == "source_conflict"
    assert rows["GER 108"]["field_findings"][2]["disposition"] == "confirmed_defect"


def test_cumulative_coverage_remains_partition_bounded() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["ccmas_partition"]["package_080_detail_rows_with_source_evidence"] == 24
    assert coverage["ccmas_partition"]["package_080_detail_rows_remaining"] == 18
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["no_shared_ledger_edits"] is True
    assert coverage["no_other_partition_touched"] is True
    assert coverage["no_downstream_domain_subgroup_role_audit"] is True
    assert "18 remaining" in MARKDOWN.read_text(encoding="utf-8")
