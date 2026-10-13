"""Regression checks for the unresolved standalone Plant Science cell."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_standalone_plant_science_is_not_inferred_from_compound_title_cells() -> None:
    doc = json.loads((ROOT / "jamb" / "agriculture_offerings.json").read_text(encoding="utf-8"))
    row = doc["programmes"][24]

    assert row["jamb_name"] == "Plant Science"
    assert row["source_context_status"] == "evidence_hold"
    assert row["institutions"] == ["ABSU", "RSU"]
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is False
    assert evidence["evidence_hold"] is True
    assert evidence["official_source_url"] == OFFICIAL
    assert "Agriculture.txt:28" in evidence["pdf_table_locator"]
    assert "Agriculture.txt:2359-2377" in evidence["pdf_table_locator"]
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "held_exact_standalone_cell_not_established"
    assert evidence["issue_id"] == "LANE-A-AGR-025-PLANT-SCIENCE-TITLE-CELL"
    assert evidence["checkpoint"].endswith("_023")
    assert [context["source_title"] for context in row["source_offering_contexts"]] == [
        "PLANT SCIENCE AND BIOTECHNOLOGY",
        "PLANT SCIENCE AND CROP PRODUCTION",
    ]
    assert [context["institutions"] for context in row["source_offering_contexts"]] == [
        ["ABSU", "RSU"],
        ["JABU"],
    ]
    assert all(context["identity_with_jamb_title"] == "not_established" for context in row["source_offering_contexts"])

