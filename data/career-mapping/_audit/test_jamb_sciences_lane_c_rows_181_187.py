"""Regression checks for the final seven Sciences offering occurrences."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb" / "sciences_offerings.json"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
DATE = "2026-09-28"

CONFIRMED = {
    181: ("Optometry", "OPTOMETRY", "BENIN", "BENIN"),
    182: (
        "Computer, Information and Communication Science",
        "COMPUTER, INFORMATION AND COMMUNICATION SCIENCE",
        "FED-DUTSINMA",
        "printed page 623",
    ),
    183: (
        "Computer Science and Informatics",
        "COMPUTER SCIENCE AND INFORMATICS",
        "FED-OTUOKE",
        "printed page 623",
    ),
    184: (
        "Computing and Artificial Intelligence",
        "COMPUTING AND ARTIFICIAL INTELLIGENCE",
        "HUSTECH",
        "printed page 624",
    ),
    185: (
        "Computer with Electronics",
        "COMPUTER WITH ELECTRONICS",
        "LCITY",
        "printed page 624",
    ),
    186: (
        "Software Engineering and Digital Entrepreneurship",
        "SOFTWARE ENGINEERING AND DIGITAL ENTREPRENEURSHIP",
        "AVE-MARIA",
        "printed page 627",
    ),
    187: (
        "Robotics (Artificial Intelligence)",
        "ROBOTICS (ARTIFICIAL INTELLIGENCE)",
        "WIGWE",
        "printed page 649",
    ),
}


def test_occurrences_181_187_are_confirmed_or_explicitly_held() -> None:
    rows = json.loads(JAMB.read_text(encoding="utf-8"))["programmes"]
    assert len(rows) == 187

    for occurrence, (name, source_title, institution, locator) in CONFIRMED.items():
        row = rows[occurrence - 1]
        assert row["jamb_name"] == name
        assert row["source_context_status"] == "source_text_confirmed"
        assert row["source_original_title"] == source_title
        assert institution in row["institutions"]
        assert row["source_url"] == URL
        assert row["source_accessed_on"] == DATE
        assert locator in row["source_locator"]
        assert row["source_support_note"]

    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in rows) == 182
    assert sum(row.get("source_context_status") == "evidence_hold" for row in rows) == 5
    assert sum("source_context_status" not in row for row in rows) == 0
