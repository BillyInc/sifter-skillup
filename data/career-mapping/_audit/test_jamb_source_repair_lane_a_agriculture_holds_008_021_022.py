"""Exact title-awarder source checks for three Agriculture Lane-A rows."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_animal_breeding_pasture_and_livestock_exact_cells() -> None:
    rows = json.loads(
        (ROOT / "jamb" / "agriculture_offerings.json").read_text(encoding="utf-8")
    )["programmes"]
    expected = {
        8: ("Animal Breeding and Genetics", "ANIMAL BREEDING AND GENETICS", ["FUNAAB"]),
        21: ("Pasture & Range Management", "PASTURE AND RANGE MANAGEMENT", ["FUNAAB"]),
        22: ("Livestock Production Technology", "LIVESTOCK PRODUCTION TECHNOLOGY", ["NDU"]),
    }
    for occurrence, (jamb_name, source_title, institutions) in expected.items():
        row = rows[occurrence - 1]
        assert row["jamb_name"] == jamb_name
        assert row["institutions"] == institutions
        assert row["source_context_status"] == "source_text_confirmed"
        evidence = row["source_verification"]
        assert evidence["verified_against_pdf"] is True
        assert evidence["evidence_hold"] is False
        assert evidence["official_source_url"] == OFFICIAL
        assert evidence["access_date"] == "2026-09-28"
        assert evidence["disposition"] in {
            "confirmed_exact_source_cell",
            "confirmed_exact_source_cell_and_corrected_awarders",
        }
        assert evidence["checkpoint"].endswith("_026")
        context = row["source_offering_contexts"][0]
        assert context["source_title"] == source_title
        assert context["institutions"] == institutions

    assert "Agriculture.txt:2027-2033" in rows[7]["source_verification"]["pdf_table_locator"]
    assert "Agriculture.txt:1823-1825" in rows[20]["source_verification"]["pdf_table_locator"]
    assert "Agriculture.txt:1818-1821" in rows[21]["source_verification"]["pdf_table_locator"]
