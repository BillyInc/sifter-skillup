"""Regression guards for the ENT 312 source comparison in checkpoint 010."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_010.json"
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_010.md"


def test_increment_targets_next_uncovered_exact_course_row() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    item = checkpoint["ccmas_increment"]
    package = next(row for row in report["ccmas_packages"] if row["package_index"] == 80)
    assert item["course_ordinal"] == 26
    assert item["record_id"] == "arts.json::Modern European Languages B.A (German)::0026"
    assert item["course_code"] == "ENT 312"
    assert item["programme"] == package["programme"]
    assert item["official_source_url"].startswith("https://www.nuc.edu.ng/")
    assert item["printed_locator"] == "printed pp. 481-482, ENT 312 Venture Creation detailed block"
    assert item["accessed_on"] == "2026-09-29"


def test_field_defects_and_partition_denominators_are_explicit() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    item = checkpoint["ccmas_increment"]
    assert [row["disposition"] for row in item["field_findings"]] == [
        "confirmed_defect", "confirmed_defect", "confirmed_defect"
    ]
    assert item["source_fields"]["practical_hours"] == 45
    assert item["local_fields"]["practical_hours"] is None
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["ccmas_partition"]["package_080_detail_rows_with_source_evidence"] == 26
    assert coverage["ccmas_partition"]["package_080_detail_rows_remaining"] == 16
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["jamb_partition"]["identities"] == 140
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["no_shared_ledger_edits"] is True
    assert coverage["no_other_partition_touched"] is True
    assert coverage["no_downstream_domain_subgroup_role_audit"] is True
    assert "26/42" in MARKDOWN.read_text(encoding="utf-8")
    assert "16" in MARKDOWN.read_text(encoding="utf-8")
