"""Regression checks for Lane A Administration held occurrence 9."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
LEDGER = ROOT / "jamb" / "administration_offerings.json"
OFFICIAL_ADMIN = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_hotel_and_tourism_management_uses_only_its_exact_awarder_cell() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    row = doc["programmes"][8]

    assert doc["faculty"] == "Administration"
    assert row["jamb_name"] == "Hotel and Tourism Management"
    assert row["institutions"] == ["NOUN", "WESTERN-DEL"]
    assert row["source_context_status"] == "source_text_confirmed"

    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["evidence_hold"] is False
    assert verification["official_source_url"] == OFFICIAL_ADMIN
    assert verification["pdf_table_locator"] == (
        "Administration.txt:1362-1365; printed p. 70; "
        "exact HOTEL AND TOURISM MANAGEMENT title-awarder cell"
    )
    assert verification["access_date"] == "2026-09-28"
    assert verification["disposition"] == "confirmed_exact_source_cell"
    assert verification["checkpoint"].endswith("_018")

    contexts = row["source_offering_contexts"]
    assert len(contexts) == 1
    assert contexts[0]["source_title"] == "HOTEL AND TOURISM MANAGEMENT"
    assert contexts[0]["institutions"] == ["NOUN", "WESTERN-DEL"]
    assert contexts[0]["source_text_verified"] is True
    assert "distinct offering contexts" in row["note"]
    assert row["utme_subjects"] == "Mathematics, Economics and any other subject."
    assert row["olevel_requirement"].startswith("Five (5) SSC credit passes")
