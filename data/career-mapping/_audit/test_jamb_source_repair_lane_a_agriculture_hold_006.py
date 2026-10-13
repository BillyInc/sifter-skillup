"""Regression checks for Agriculture occurrence 6's exact source cell."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_animal_production_is_separated_from_neighboring_compound_titles() -> None:
    doc = json.loads((ROOT / "jamb" / "agriculture_offerings.json").read_text(encoding="utf-8"))
    row = doc["programmes"][5]

    expected = ["ADSU", "BAUCHI", "DELSUT", "DOU", "LASUSTECH", "MINNA", "UM UDIKE"]
    assert row["jamb_name"] == "Animal Production"
    assert row["institutions"] == expected
    assert row["source_context_status"] == "source_text_confirmed"
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is True
    assert evidence["evidence_hold"] is False
    assert evidence["official_source_url"] == OFFICIAL
    assert evidence["pdf_table_locator"] == (
        "Agriculture.txt:1768-1783; printed p. 109; "
        "exact ANIMAL PRODUCTION title and awarding-institution cell"
    )
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "confirmed_exact_source_cell"
    assert evidence["checkpoint"].endswith("_024")
    assert row["source_offering_contexts"][0]["source_title"] == "ANIMAL PRODUCTION"
    assert row["source_offering_contexts"][0]["institutions"] == expected
    assert "separate source contexts" in evidence["disposition_reason"]

