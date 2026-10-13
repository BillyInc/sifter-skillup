"""Regression checks for exact Administration awarder cells 16 and 23."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
LEDGER = ROOT / "jamb" / "administration_offerings.json"
OFFICIAL_ADMIN = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_secretarial_administration_does_not_absorb_neighboring_titles() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    row = doc["programmes"][15]

    assert row["jamb_name"] == "Secretarial Administration"
    assert row["institutions"] == ["CRAWFORD"]
    assert row["source_context_status"] == "source_text_confirmed"
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is True
    assert evidence["official_source_url"] == OFFICIAL_ADMIN
    assert "Administration.txt:2120-2123" in evidence["pdf_table_locator"]
    assert "printed p. 86" in evidence["pdf_table_locator"]
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "confirmed_exact_source_cell"
    assert evidence["checkpoint"].endswith("_019")
    assert row["source_offering_contexts"][0]["source_title"] == (
        "SECRETARIAL ADMINISTRATION"
    )
    assert "separate title contexts" in row["note"]


def test_local_government_studies_is_separate_from_local_government_and_development() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    row = doc["programmes"][22]

    assert row["jamb_name"] == "Local Government Studies"
    assert row["institutions"] == ["OAU"]
    assert row["source_context_status"] == "source_text_confirmed"
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is True
    assert evidence["official_source_url"] == OFFICIAL_ADMIN
    assert "Administration.txt:2033-2035, 2045-2052" in evidence["pdf_table_locator"]
    assert "printed p. 84" in evidence["pdf_table_locator"]
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "confirmed_exact_source_cell"
    assert evidence["checkpoint"].endswith("_019")
    assert row["source_offering_contexts"][0]["institutions"] == ["OAU"]
    assert "ABU, UMYUK, UNN, and UDU" in row["note"]
