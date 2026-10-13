"""Regression checks for Lane A Administration occurrences 51–60."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parents[1]
LEDGER = ROOT / "jamb" / "administration_offerings.json"
OFFICIAL_ADMIN = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_administration_51_to_60_are_the_exact_bounded_slice() -> None:
    doc = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = doc["programmes"]
    expected = [
        "Aviation Management",
        "Aviation Security",
        "Personnel Management",
        "Industrial Relations and Human Resources Management",
        "Islamic Studies",
        "International Relations",
        "International Relations and Strategic Studies",
        "International Studies and Diplomacy",
        "Marketing and Consumer Studies",
        "Information and Media Studies",
    ]
    assert doc["faculty"] == "Administration"
    assert [row["jamb_name"] for row in rows[50:60]] == expected
    assert rows[49]["jamb_name"] == "Transport and Tourism"
    assert len(rows) == 60


def test_all_ten_exact_title_awarder_cells_are_source_confirmed() -> None:
    rows = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"][50:60]
    expected = [
        ("Aviation Management", ["AZMAN"], "p. 73", "1450-1451"),
        ("Aviation Security", ["AZMAN"], "p. 73", "1453-1454"),
        ("Personnel Management", ["GREGORY"], "p. 73", "1455-1458"),
        (
            "Industrial Relations and Human Resources Management",
            ["COVENANT"],
            "p. 74",
            "1489-1495",
        ),
        ("Islamic Studies", ["CUAB"], "p. 75", "1529-1530"),
        ("International Relations", ["OAU"], "p. 78", "1685-1688"),
        (
            "International Relations and Strategic Studies",
            ["NOVENA"],
            "p. 78",
            "1689-1692",
        ),
        (
            "International Studies and Diplomacy",
            ["KASU"],
            "p. 78",
            "1714-1718",
        ),
        (
            "Marketing and Consumer Studies",
            ["IBADAN"],
            "p. 81",
            "1841-1846",
        ),
        (
            "Information and Media Studies",
            ["ABUJA"],
            "p. 87",
            "2163-2168",
        ),
    ]
    for row, (name, institutions, page, source_lines) in zip(rows, expected, strict=True):
        assert row["jamb_name"] == name
        assert row["institutions"] == institutions
        assert row["source_context_status"] == "source_text_confirmed"
        verification = row["source_verification"]
        assert verification["verified_against_pdf"] is True
        assert verification["official_source_url"] == OFFICIAL_ADMIN
        assert verification["verification_date"] == "2026-09-28"
        assert page in verification["pdf_table_locator"]
        assert source_lines in verification["pdf_table_locator"]


def test_adjacent_offerings_and_shared_requirement_notes_remain_distinct() -> None:
    rows = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"][50:60]
    assert rows[0]["institutions"] == ["AZMAN"]
    assert rows[1]["institutions"] == ["AZMAN"]
    assert rows[0]["jamb_name"] != rows[1]["jamb_name"]
    assert rows[2]["institutions"] == ["GREGORY"]
    assert rows[3]["institutions"] == ["COVENANT"]
    assert rows[5]["institutions"] == ["OAU"]
    assert rows[6]["institutions"] == ["NOVENA"]
    assert "shares the requirements columns" in rows[9]["note"].lower()
    assert "public administration" in rows[9]["note"].lower()
    assert rows[9]["utme_subjects"] == "Government, Economics and any other subject."


def test_lane_a_counts_reconcile_from_all_three_current_ledgers() -> None:
    totals: Counter[str] = Counter()
    for filename in (
        "administration_offerings.json",
        "agriculture_offerings.json",
        "engineering_offerings.json",
    ):
        rows = json.loads((ROOT / "jamb" / filename).read_text(encoding="utf-8"))["programmes"]
        totals.update(row.get("source_context_status", "pending") for row in rows)

    assert sum(totals.values()) == 125
    assert totals == Counter(
        {"source_text_confirmed": 99, "evidence_hold": 26}
    )
