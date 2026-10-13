"""Exact source contexts and canonical-identity holds for two Admin rows."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parents[1]
OFFICIAL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


def test_administration_rows_preserve_separate_exact_offering_contexts() -> None:
    rows = json.loads(
        (ROOT / "jamb" / "administration_offerings.json").read_text(encoding="utf-8")
    )["programmes"]
    expected = {
        28: [
            ("PUBLIC RELATIONS AND ADVERTISING", ["IGBINEDION"]),
            ("PUBLIC RELATION", ["ABUJA", "IMSU", "BSU"]),
            ("ADVERTISING", ["ABUJA", "IMSU", "BSU"]),
        ],
        31: [
            ("OFFICE AND INFORMATION TECHNOLOGY", ["LASUSTECH"]),
            ("INFORMATION RESOURCE MANAGEMENT", ["BABCOCK", "LCITY"]),
        ],
    }
    for occurrence, contexts in expected.items():
        row = rows[occurrence - 1]
        evidence = row["source_verification"]
        assert row["source_context_status"] == "evidence_hold"
        assert evidence["official_source_url"] == OFFICIAL
        assert evidence["access_date"] == "2026-09-28"
        assert evidence["disposition"] == "source_cells_confirmed_canonical_identity_held"
        assert evidence["checkpoint"].endswith("_028")
        actual = [
            (context["source_title"], context["institutions"])
            for context in row["source_offering_contexts"]
        ]
        assert actual == contexts
