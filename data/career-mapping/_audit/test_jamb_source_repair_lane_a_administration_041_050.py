"""Regression checks for Lane A Administration occurrences 41–50."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parents[1]
LEDGER = ROOT / "jamb" / "administration_offerings.json"
OFFICIAL_ADMIN = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_administration_occurrences_41_to_50_are_the_bounded_slice() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = doc["programmes"]
    expected = [
        "Accounting and Data Analytics",
        "Finance and Financial Technology",
        "Agribusiness and Economics",
        "Supply Chain Management",
        "Cooperative Management",
        "Cooperative Economics and Management",
        "Social Innovation and Entrepreneurship",
        "Entrepreneurship and Business Management",
        "Film and Video Studies",
        "Transport and Tourism",
    ]
    assert doc["faculty"] == "Administration"
    assert [row["jamb_name"] for row in rows[40:50]] == expected
    assert rows[39]["jamb_name"] == "Strategic Communication"
    assert rows[50]["jamb_name"] == "Aviation Management"


def test_verified_source_cells_preserve_each_exact_offering_and_page() -> None:
    rows = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"][40:49]
    expected = [
        ("Accounting and Data Analytics", ["WIGWE"], "p. 49"),
        ("Finance and Financial Technology", ["WIGWE"], "p. 56"),
        ("Agribusiness and Economics", ["HUSTECH"], "p. 60"),
        ("Supply Chain Management", ["BINGHAM"], "p. 61"),
        ("Cooperative Management", ["NOUN"], "p. 66"),
        ("Cooperative Economics and Management", ["UNIZIK"], "p. 66"),
        ("Social Innovation and Entrepreneurship", ["WIGWE"], "p. 68"),
        ("Entrepreneurship and Business Management", ["NOUN"], "p. 69"),
        ("Film and Video Studies", ["WESTERN-DEL"], "p. 69"),
    ]
    for row, (name, institutions, page) in zip(rows, expected, strict=True):
        assert row["jamb_name"] == name
        assert row["institutions"] == institutions
        assert row["source_context_status"] == "source_text_confirmed"
        verification = row["source_verification"]
        assert verification["verified_against_pdf"] is True
        assert verification["official_source_url"] == OFFICIAL_ADMIN
        assert verification["verification_date"] == "2026-09-28"
        assert page in verification["pdf_table_locator"]


def test_transport_and_tourism_exact_awarder_cell_is_now_confirmed() -> None:
    row = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"][49]
    assert row["jamb_name"] == "Transport and Tourism"
    assert row["institutions"] == ["REDEEMERS"]
    assert row["source_context_status"] == "source_text_confirmed"
    verification = row["source_verification"]
    assert verification["evidence_hold"] is False
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == OFFICIAL_ADMIN
    assert "Administration.txt:1412-1414" in verification["pdf_table_locator"]
    assert "printed p. 72" in verification["pdf_table_locator"]
    assert verification["access_date"] == "2026-09-28"
    assert verification["checkpoint"].endswith("_020")


def test_lane_a_counters_are_reconciled_from_all_three_current_ledgers() -> None:
    lane_files = [
        "administration_offerings.json",
        "agriculture_offerings.json",
        "engineering_offerings.json",
    ]
    totals: Counter[str] = Counter()
    for filename in lane_files:
        rows = json.loads((ROOT / "jamb" / filename).read_text(encoding="utf-8"))["programmes"]
        totals.update(row.get("source_context_status", "pending") for row in rows)

    assert sum(totals.values()) == 125
    assert totals == Counter({"source_text_confirmed": 99, "evidence_hold": 26})
