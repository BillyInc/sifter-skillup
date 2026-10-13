"""Regression checks for the seven official-source Lane C hold resolutions."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"
CHECKPOINT = ROOT / "_audit" / "jamb_sciences_lane_c_checkpoint_2026-09-28_014.md"
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"


def test_seven_exact_official_offering_contexts_are_promoted() -> None:
    rows = json.loads(OFFERINGS.read_text(encoding="utf-8"))["programmes"]
    expected = {
        "Physics/Industrial Physics": {"BENIN", "UNIZIK"},
        "Computer Science and Information Science": {"BINGHAM", "LCITY"},
        "INFORMATION SCIENCE": {"UNIOSUN"},
        "Geography and Environmental Management": {"GOUU"},
        "Surveying and Geoinformatics": {"UNN"},
        "PURE AND APPLIED BIOLOGY": {"BOWEN", "LAUTECH"},
        "Robotics (Artificial Intelligence)": {"WIGWE"},
    }
    for title, institutions in expected.items():
        matches = [row for row in rows if row.get("jamb_name") == title]
        assert len(matches) == 1
        row = matches[0]
        assert row["source_context_status"] == "source_text_confirmed"
        assert set(row["institutions"]) == institutions
        assert row["source_url"] == OFFICIAL
        assert row["source_accessed_on"] == "2026-09-28"
        assert ("IBASS Sciences brochure, p. " in row["source_locator"]
                or "Sciences.txt:" in row["source_locator"])
        assert "official IBASS Sciences" in row["source_support_note"]
        assert "evidence_hold_reason" not in row


def test_lane_c_checkpoint_count_and_scope_are_explicit() -> None:
    rows = json.loads(OFFERINGS.read_text(encoding="utf-8"))["programmes"]
    confirmed = sum(row.get("source_context_status") == "source_text_confirmed" for row in rows)
    held = sum(row.get("source_context_status") == "evidence_hold" for row in rows)
    assert len(rows) == 187
    assert confirmed == 182
    assert held == 5

    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "180 official-source-confirmed, 7 evidence-held, 0 unreviewed of 187" in checkpoint
    assert OFFICIAL in checkpoint
    assert "No previously confirmed row was repeated" in checkpoint
    assert "no downstream mapping or seed was changed" in checkpoint
    survey = next(row for row in rows if row.get("jamb_name") == "Surveying and Geoinformatics")
    assert survey["institutions"] == ["UNN"]
    assert "KASU starts the next distinct BUILDING TECHNOLOGY row" in survey["source_locator"]
