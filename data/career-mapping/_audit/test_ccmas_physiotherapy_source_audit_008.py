"""Regression checks for audit-only Physiotherapy CCMAS increment 008."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
CHECKPOINT = ROOT / "_audit" / "ccmas_physiotherapy_source_audit_2026-09-28_008.md"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_increment_008_records_next_exact_dpt_course_and_cumulative_count() -> None:
    text = CHECKPOINT.read_text(encoding="utf-8")
    assert URL in text
    assert "PST 312 — Exercise Physiology" in text
    assert "global DPT-table entry (printed p. 587, PDF lines 22843–22850)" in text
    assert "detailed course block (printed pp. 606–607, PDF lines 23605–23619)" in text
    assert "19/48 DPT-owned blocks; 29 remain unchecked" in text
    assert "400-character" in text and "page furniture" in text
    assert "No provider-specific 30% curriculum was required" in text
    assert "No CCMAS rows, JAMB data, mappings, or seeds were edited" in text


def test_increment_008_confirmed_local_defects_are_repaired_on_exact_dpt_row() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    row = next(
        course
        for course in package["courses"]
        if course.get("code") == "PST 312"
        and course.get("title") == "Exercise Physiology"
    )

    assert row["level"] == 300
    assert row["units"] == 2
    assert row["status"] == "C"
    assert row["lh"] == 15 and row["ph"] == 45
    assert len(row["skills_learned"]) == 6
    assert row["skills_learned"][-1] == "have a good knowledge of effects of exercise on body organs"
    assert row["content_summary"].endswith("effects on body composition.")
    assert "regular exercise" in row["content_summary"]
    assert row["source_url"] == URL
    assert row["source_locator"].endswith("printed pp. 606-607, lines 23605-23619")
    assert row["source_accessed_on"] == "2026-09-28"
