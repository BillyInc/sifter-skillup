"""Protect the occurrence-level source evidence added in partition increment 002."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
REPORT = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
CHECKPOINT = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_002.json"
MARKDOWN = AUDIT / "jamb_ccmas_partition_141_280_080_158_checkpoint_2026-09-29_002.md"
BROCHURE_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"


def test_occurrence_ids_and_saved_source_rows_match_deterministic_report() -> None:
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    by_order = {row["canonical_order"]: row for row in report["jamb_identities"]}
    for item in checkpoint["occurrence_findings"]:
        occurrence = by_order[item["canonical_order"]]["source_occurrences"]
        assert item["occurrence_id"] in {row["occurrence_id"] for row in occurrence}
        assert item["source_faculty"] in {row["source_faculty"] for row in occurrence}


def test_confirmed_cell_and_partial_cell_have_official_locators() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["source"]["url"] == BROCHURE_URL
    assert checkpoint["source"]["accessed_on"] == "2026-09-29"
    findings = {row["canonical_order"]: row for row in checkpoint["occurrence_findings"]}
    assert findings[143]["disposition"] == "confirmed_match"
    assert findings[143]["observed_source"]["locator"] == (
        "printed p. 460, programme/degree and awarding-institutions table"
    )
    assert findings[143]["observed_source"]["awarding_institutions"] == [
        "DOU", "HENSARD", "ZAMFARA"
    ]
    assert findings[142]["disposition"] == "source_conflict"
    assert findings[142]["field_findings"]["awarder_cell"].startswith("partial")


def test_prior_complete_cells_are_reused_and_no_ledger_is_edited() -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    prior = checkpoint["prior_coverage_reconciled"]["rows_141_150_before_increment"]
    assert prior["exact_cell_complete_reused"] == [145, 146, 147, 149, 150]
    coverage = checkpoint["coverage_after_increment"]["rows_141_150"]
    assert coverage == {
        "exact_cell_complete": 6,
        "partial_cell": 2,
        "unverified_or_unresolved": 2,
        "identities": 10,
        "occurrences": 10,
    }
    assert checkpoint["coverage_after_increment"]["no_shared_ledger_edits"] is True
    markdown = MARKDOWN.read_text(encoding="utf-8")
    assert "Rows 141–150 now reconcile to **6 exact-cell complete, 2 partial, and 2 unresolved**" in markdown
