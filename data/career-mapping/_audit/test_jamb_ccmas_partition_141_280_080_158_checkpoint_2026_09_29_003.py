"""Guard detailed course evidence and source-conflict reconciliation for package 080."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_003.json"
PREVIOUS = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_001.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_003.md"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf"


def test_package_scope_and_detail_row_accounting() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    package = checkpoint["ccmas_increment"]
    assert checkpoint["partition"]["jamb_canonical_rows"] == [141, 280]
    assert checkpoint["partition"]["ccmas_package_indices"] == [80, 158]
    assert package["package_index"] == 80
    assert package["local_course_rows"] == 42
    assert package["course_rows_detailed_checked_this_increment"] == 14
    assert len(package["course_rows_with_prior_closed_detailed_checks_reused"]) == 2
    assert package["detailed_course_rows_remaining"] == 26
    assert len(package["detailed_findings"]) == 14
    assert package["source_url"] == SOURCE_URL
    assert package["accessed_on"] == "2026-09-29"


def test_global_vs_detail_conflicts_are_preserved_not_mislabeled_as_defects() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    previous = json.loads(PREVIOUS.read_text(encoding="utf-8"))
    findings = {row["course_code"]: row for row in checkpoint["ccmas_increment"]["detailed_findings"]}
    assert findings["GST 212"]["disposition"] == "source_conflict"
    assert findings["GST 222"]["disposition"] == "source_conflict"
    assert findings["FAC 202"]["disposition"] == "source_conflict"
    prior_findings = previous["reconciliation"]["ccmas_completed_tranche"]["field_findings"]
    assert next(row for row in prior_findings if row["local_record"].endswith("::GST 212"))["disposition"] == "source_conflict"
    assert next(row for row in prior_findings if "GST 222 and GST 312" in row["local_record"])["disposition"] == "source_conflict"
    assert next(row for row in prior_findings if row["local_record"].endswith("::FAC 202"))["disposition"] == "source_conflict"


def test_source_gaps_and_resume_cursor_remain_explicit() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    findings = {row["course_code"]: row for row in checkpoint["ccmas_increment"]["detailed_findings"]}
    for code in ("FAC 201", "GER 201", "GER 203", "GER 207", "GER 209", "GER 210"):
        assert findings[code]["disposition"] == "confirmed_defect"
        assert findings[code]["locator"].startswith("printed p")
    assert findings["GER 202"]["disposition"] == "confirmed_match"
    assert findings["GER 208"]["disposition"] == "confirmed_match"
    assert checkpoint["ccmas_increment"]["next_cursor"]["course_ordinal"] == 1
    assert checkpoint["ccmas_increment"]["next_cursor"]["jamb_canonical_order"] == 141
    coverage = checkpoint["coverage_after_increment"]
    assert coverage["ccmas_partition"]["packages_complete"] == 0
    assert coverage["jamb_partition"]["parsed_source_occurrences"] == 141
    assert coverage["shared_ledger_edits"] is False
    assert coverage["downstream_review"] is False
    markdown = MARKDOWN.read_text(encoding="utf-8")
    assert "14 detailed course rows checked in this increment" in markdown
    assert "26 remain" in markdown
