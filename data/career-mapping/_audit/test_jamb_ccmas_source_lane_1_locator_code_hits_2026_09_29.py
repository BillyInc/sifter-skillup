"""Regression checks for the append-only residual locator checkpoint."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
OUTPUT = AUDIT / "jamb_ccmas_source_audit_lane_1_residual_locator_198_2026-09-29_002.json"


def test_residual_lane_is_exactly_scoped_and_complete() -> None:
    payload = json.loads(OUTPUT.read_text(encoding="utf-8"))
    assert payload["scope"]["records_targeted"] == 198
    assert payload["scope"]["records_processed"] == 198
    assert payload["scope"]["same_page_candidates_excluded"] == 2189
    assert payload["scope"]["not_located_records_excluded"] == 55
    assert payload["scope"]["canonical_data_changed"] is False
    assert len(payload["records"]) == 198


def test_every_record_keeps_required_source_locator_fields() -> None:
    payload = json.loads(OUTPUT.read_text(encoding="utf-8"))
    for record in payload["records"]:
        assert record["source_file"]
        assert record["package"]
        assert record["course_code"]
        assert record["official_pdf_url"].startswith("http")
        best = record["source_evidence"]["best"]
        assert best["extracted_page_ordinal"]
        assert best["line"]
        assert best["excerpt"]
        assert record["canonical_edit_applied"] is False
