"""Regression guard for the unresolved official JAMB Robotics/WIGWE pairing."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb" / "sciences_offerings.json"
CHECKPOINT = ROOT / "_audit" / "jamb_sciences_lane_c_checkpoint_2026-09-28_014.md"
LATEST_CHECKPOINT = ROOT / "_audit" / "jamb_sciences_lane_c_checkpoint_2026-09-28_015.md"


def test_robotics_wigwe_is_confirmed_from_exact_official_jamb_cell() -> None:
    rows = json.loads(JAMB.read_text(encoding="utf-8"))["programmes"]
    matches = [
        row
        for row in rows
        if row.get("jamb_name") == "Robotics (Artificial Intelligence)"
        and "WIGWE" in row.get("institutions", [])
    ]
    assert len(matches) == 1
    row = matches[0]
    assert row["source_context_status"] == "source_text_confirmed"
    assert row["source_url"] == "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
    assert row["source_accessed_on"] == "2026-09-28"
    assert "Sciences.txt:8886-8888" in row["source_locator"]
    assert "printed page 649" in row["source_locator"]
    assert "exact ROBOTICS (ARTIFICIAL INTELLIGENCE) programme heading" in row["source_support_note"]

    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "2026-09-28" in checkpoint
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf" in checkpoint
    assert "Sciences.txt:8886-8888" in checkpoint
    assert "resolves the hold retained at checkpoint 013" in checkpoint
    latest = LATEST_CHECKPOINT.read_text(encoding="utf-8")
    assert "182 official-source-confirmed, 5 evidence-held, 0 unreviewed of 187" in latest
