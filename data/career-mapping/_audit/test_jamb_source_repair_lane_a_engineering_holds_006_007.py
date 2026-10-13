"""Exact title-awarder checks for Petroleum and Gas and Gas Engineering."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf"


def test_petroleum_gas_and_gas_engineering_cells_are_distinct() -> None:
    rows = json.loads(
        (ROOT / "jamb" / "engineering_offerings.json").read_text(encoding="utf-8")
    )["programmes"]
    expected = {
        6: (
            "Petroleum and Gas Engineering",
            "PETROLEUM AND GAS ENGINEERING",
            ["BAZE", "CUST", "DELSUT", "LAGOS", "FED-OTUOKE", "FUTIA", "OAUSTECH", "MAIDUGURI", "MARITIME-UNI", "NILE", "PHC", "TOPFAITH"],
        ),
        7: ("Gas Engineering", "GAS ENGINEERING", ["OAUSTECH"]),
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
        assert evidence["disposition"] == "confirmed_exact_source_cell_and_corrected_awarders"
        assert evidence["checkpoint"].endswith("_029")
        context = row["source_offering_contexts"][0]
        assert context["source_title"] == source_title
        assert context["institutions"] == institutions

    assert "engineering.txt:1929-1955" in rows[5]["source_verification"]["pdf_table_locator"]
    assert "engineering.txt:1957-1958" in rows[6]["source_verification"]["pdf_table_locator"]
