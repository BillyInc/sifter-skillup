"""Regression checks for the unresolved Plant Breeding title mismatch."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
LEDGER = ROOT / "jamb" / "agriculture_offerings.json"
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_seed_technology_index_title_is_not_blended_with_seed_science_detail_cell() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    row = doc["programmes"][15]

    assert row["jamb_name"] == "Plant Breeding and Seed Technology"
    assert row["source_context_status"] == "evidence_hold"
    # Preserve the existing parsed array until the title mismatch is adjudicated.
    assert row["institutions"] == ["AND SEED SCIENCE", "MAKURDI"]
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is False
    assert evidence["evidence_hold"] is True
    assert evidence["official_source_url"] == OFFICIAL
    assert "Agriculture.txt:26" in evidence["pdf_table_locator"]
    assert "Agriculture.txt:3491-3493" in evidence["pdf_table_locator"]
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "held_title_awarder_mismatch"
    assert evidence["checkpoint"].endswith("_022")
    source_context = row["source_offering_contexts"][0]
    assert source_context["source_title"] == "PLANT BREEDING AND SEED SCIENCE"
    assert source_context["institutions"] == ["MAKURDI"]
    assert source_context["identity_with_jamb_title"] == "not_established"

