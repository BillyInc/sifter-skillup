"""Regression evidence for the two held-context resolutions in Lane C 015."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"
CHECKPOINT = ROOT / "_audit" / "jamb_sciences_lane_c_checkpoint_2026-09-28_015.md"
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"


def test_two_exact_chemistry_offering_cells_are_confirmed():
    rows = json.loads(OFFERINGS.read_text(encoding="utf-8"))["programmes"]
    expected = {
        "Industrial Chemistry and Chemical Entrepreneurship": (
            "INDUSTRIAL CHEMISTRY AND CHEMICAL ENTREPRENEURSHIP", "CCU", "2536-2540"
        ),
        "Industrial and Environmental Chemistry": (
            "INDUSTRIAL AND ENVIRONMENTAL CHEMISTRY", "FOUNTAIN", "2655-2659"
        ),
    }
    for name, (source_title, institution, locator) in expected.items():
        row = next(item for item in rows if item["jamb_name"] == name)
        assert row["source_context_status"] == "source_text_confirmed"
        assert row["source_original_title"] == source_title
        assert row["institutions"] == [institution]
        assert locator in row["source_locator"]
        assert row["source_url"] == OFFICIAL
        assert row["source_accessed_on"] == "2026-09-28"
        assert row["source_support_note"]
        assert "evidence_hold_reason" not in row


def test_lane_c_015_records_five_open_holds_without_calling_them_unavailable():
    rows = json.loads(OFFERINGS.read_text(encoding="utf-8"))["programmes"]
    confirmed = sum(row.get("source_context_status") == "source_text_confirmed" for row in rows)
    held = sum(row.get("source_context_status") == "evidence_hold" for row in rows)
    assert len(rows) == 187
    assert confirmed == 182
    assert held == 5
    assert {row["jamb_name"] for row in rows if row.get("source_context_status") == "evidence_hold"} == {
        "Chemistry", "BIOLOGY", "Computer Science and Information Technology",
        "Geography and Geosciences", "ANTHROPOLOGY",
    }
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "182 official-source-confirmed, 5 evidence-held, 0 unreviewed of 187" in checkpoint
    assert "not unavailability decisions" in checkpoint
    assert "No downstream mapping" in checkpoint
