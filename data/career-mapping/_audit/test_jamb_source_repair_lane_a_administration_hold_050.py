"""Regression checks for Lane A Administration held occurrence 50."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL_ADMIN = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_transport_and_tourism_exact_awarder_cell_is_recorded() -> None:
    doc = json.loads((ROOT / "jamb" / "administration_offerings.json").read_text(encoding="utf-8"))
    row = doc["programmes"][49]

    assert row["jamb_name"] == "Transport and Tourism"
    assert row["institutions"] == ["REDEEMERS"]
    assert row["source_context_status"] == "source_text_confirmed"
    evidence = row["source_verification"]
    assert evidence["verified_against_pdf"] is True
    assert evidence["official_source_url"] == OFFICIAL_ADMIN
    assert "Administration.txt:1412-1414" in evidence["pdf_table_locator"]
    assert "printed p. 72" in evidence["pdf_table_locator"]
    assert evidence["access_date"] == "2026-09-28"
    assert evidence["disposition"] == "confirmed_exact_source_cell"
    assert evidence["checkpoint"].endswith("_020")
    context = row["source_offering_contexts"][0]
    assert context["source_title"] == "TRANSPORT AND TOURISM"
    assert context["institutions"] == ["REDEEMERS"]
    assert "Requirements columns blank in source" in row["note"]


def test_lane_a_counts_reconcile_after_five_hold_resolutions() -> None:
    totals: Counter[str] = Counter()
    for filename in (
        "administration_offerings.json",
        "agriculture_offerings.json",
        "engineering_offerings.json",
    ):
        rows = json.loads((ROOT / "jamb" / filename).read_text(encoding="utf-8"))["programmes"]
        totals.update(row.get("source_context_status", "pending") for row in rows)

    assert sum(totals.values()) == 125
    assert totals == Counter({"source_text_confirmed": 99, "evidence_hold": 26})
