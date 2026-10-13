"""Regression checks for the audit-only Physiotherapy CCMAS increment 007."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
CHECKPOINT = ROOT / "_audit" / "ccmas_physiotherapy_source_audit_2026-09-28_007.md"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_increment_007_is_append_only_audit_for_next_unchecked_dpt_course() -> None:
    text = CHECKPOINT.read_text(encoding="utf-8")
    assert URL in text
    assert "PST 311 — Introduction to Physiotherapy Profession" in text
    assert "18/48 DPT-owned blocks; 30 remain unchecked" in text
    assert "PST 312 — Exercise Physiology" in text
    assert "No `allied_health.json`, JAMB mapping, downstream mapping, or seed was edited." in text
    assert "provider-specific 30%" in text


def test_increment_007_confirmed_gaps_are_repaired_on_the_exact_local_dpt_row() -> None:
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p.get("name") == "Physiotherapy")
    row = next(
        course
        for course in package["courses"]
        if course.get("code") == "PST 311"
        and course.get("title") == "Introduction to Physiotherapy Profession"
    )

    assert row["level"] == 300
    assert row["units"] == 2
    assert row["status"] == "C"
    assert row["lh"] == 15
    assert row["ph"] == 45
    assert len(row["skills_learned"]) == 5
    assert row["content_summary"].endswith("assessment of walking aids.")
    assert "clinical record-keeping and vital signs" in row["content_summary"]
    assert "reflexes, muscle bulk and strength" in row["content_summary"]
    assert row["source_url"] == URL
    assert row["source_locator"].endswith("printed p. 606, lines 23585-23604")
    assert row["source_accessed_on"] == "2026-09-28"
