"""Regression checks for Agriculture occurrence 27's exact source cell."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_ecotourism_wildlife_management_exact_awarders_are_confirmed() -> None:
    doc = json.loads((ROOT / "jamb" / "agriculture_offerings.json").read_text(encoding="utf-8"))
    row = doc["programmes"][26]

    expected = ["FUTA", "IBADAN", "LAUTECH"]
    assert row["jamb_name"] == "Eco-Tourism and Wildlife Management"
    assert row["institutions"] == expected
    assert row["source_context_status"] == "source_text_confirmed"
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is True
    assert evidence["evidence_hold"] is False
    assert evidence["official_source_url"] == OFFICIAL
    assert evidence["pdf_table_locator"] == (
        "Agriculture.txt:3969-3974; printed p. 153; "
        "exact ECOTOURISM & WILDLIFE MANAGEMENT title-awarder cell"
    )
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "confirmed_exact_source_cell"
    assert evidence["checkpoint"].endswith("_025")
    context = row["source_offering_contexts"][0]
    assert context["source_title"] == "ECOTOURISM & WILDLIFE MANAGEMENT"
    assert context["institutions"] == expected
    assert "requirements and waivers" in evidence["note"]
