"""Regression checks for Lane A Administration offering occurrences 24–33."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
LEDGER = ROOT / "jamb" / "administration_offerings.json"
SOURCE = ROOT / "_jamb_txt" / "Administration.txt"
SOCIAL_LEDGER = ROOT / "jamb" / "social_management_offerings.json"
OFFICIAL_ADMIN = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_administration_occurrences_24_to_33_are_the_bounded_slice() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = doc["programmes"]
    expected = [
        "Accounting and Finance",
        "Cooperative and Rural Development",
        "Logistics and Supply Chain Management",
        "Development and Communication Studies",
        "Public Relations and Advertising",
        "Transport and Logistics Management",
        "Insurance and Actuarial Science",
        "Office and Information Technology / Information Resource Management",
        "Accountancy and Forensic Studies",
        "Finance and Investment",
    ]
    assert doc["faculty"] == "Administration"
    assert [row["jamb_name"] for row in rows[23:33]] == expected
    assert rows[33]["jamb_name"] == "Securities and Investment"

    for row in rows[23:33]:
        verification = row["source_verification"]
        if row["source_context_status"] == "evidence_hold":
            contexts = row["source_offering_contexts"]
            assert contexts and all(item["official_source_url"] == OFFICIAL_ADMIN for item in contexts)
            assert all(item["source_text_verified"] for item in contexts)
        else:
            assert verification["official_source_url"] == OFFICIAL_ADMIN
            assert verification["verified_against_pdf"] is True


def test_accounting_and_finance_source_faculty_contexts_stay_separate() -> None:
    admin = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"][23]
    social = json.loads(SOCIAL_LEDGER.read_text(encoding="utf-8"))["programmes"]
    social_matches = [row for row in social if row.get("jamb_name") == "Accounting and Finance"]

    assert admin["source_context_status"] == "source_text_confirmed"
    assert admin["institutions"] == ["BCU"]
    assert "printed p. 48" in admin["source_verification"]["pdf_table_locator"]
    assert len(social_matches) == 1
    assert "FEDOTUOKE" in social_matches[0]["institutions"]


def test_distinct_public_relations_and_office_offerings_are_not_collapsed() -> None:
    rows = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]
    pr = next(row for row in rows if row["jamb_name"] == "Public Relations and Advertising")
    office = next(
        row
        for row in rows
        if row["jamb_name"] == "Office and Information Technology / Information Resource Management"
    )

    assert pr["source_context_status"] == "evidence_hold"
    assert [(x["source_title"], x["institutions"]) for x in pr["source_offering_contexts"]] == [
        ("PUBLIC RELATIONS AND ADVERTISING", ["IGBINEDION"]),
        ("PUBLIC RELATION", ["ABUJA", "IMSU", "BSU"]),
        ("ADVERTISING", ["ABUJA", "IMSU", "BSU"]),
    ]
    assert office["source_context_status"] == "evidence_hold"
    assert [(x["source_title"], x["institutions"]) for x in office["source_offering_contexts"]] == [
        ("OFFICE AND INFORMATION TECHNOLOGY", ["LASUSTECH"]),
        ("INFORMATION RESOURCE MANAGEMENT", ["BABCOCK", "LCITY"]),
    ]
    assert all(x["source_text_verified"] for x in pr["source_offering_contexts"] + office["source_offering_contexts"])


def test_source_windows_support_the_exact_title_and_awarder_cells() -> None:
    text = SOURCE.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")

    def window(start: int, end: int) -> str:
        return "\n".join(text[start - 1 : end])

    assert "COOPERATIVE AND RURAL" in window(1216, 1222)
    assert all(code in window(1216, 1222) for code in ["BOUEDST", "EKSU", "UAGRIC-IMO", "UNIOSUN"])
    assert "LOGISTICS AND SUPPLY" in window(1430, 1438)
    assert all(code in window(1430, 1438) for code in ["CANADIAN-UNI", "PHOENIX", "LASU", "NILE"])
    assert "DEVELOPMENT AND" in window(1770, 1777)
    assert all(code in window(1770, 1777) for code in ["ABUJA", "BSU", "IMSU", "RSU"])
    assert "TRANSPORT AND" in window(1422, 1429) and all(
        code in window(1422, 1429) for code in ["CUST", "BOUEDST", "UNI-ILESA"]
    )
    assert "INSURANCE AND" in window(1630, 1636) and all(
        code in window(1630, 1636) for code in ["BAZE", "IMSU", "WESLEYUNI"]
    )
    assert "ACCOUNTANCY AND" in window(240, 249) and all(code in window(240, 249) for code in ["BCU", "LUX-MUNDI"])
    assert "FINANCE AND INVESTMENT" in window(595, 603) and all(
        code in window(595, 603) for code in ["PRIME-UNI", "WESLEYUNI"]
    )
    public_relations = window(2392, 2405)
    assert "PUBLIC RELATIONS AND" in public_relations and "PUBLIC RELATION\n" in public_relations
    assert "ADVERTISING\nABUJA\nIMSU\nBSU" in public_relations
    assert "OFFICE AND INFORMATION" in window(2145, 2154)
    assert "INFORMATION RESOURCE" in window(2149, 2154)
    assert all(code in window(2145, 2154) for code in ["LASUSTECH", "BABCOCK", "LCITY"])
