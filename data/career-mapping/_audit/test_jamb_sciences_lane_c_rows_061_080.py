"""Regression checks for the bounded Sciences lane C source slice 061-080."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb" / "sciences_offerings.json"
TEXT = ROOT / "_jamb_txt" / "Sciences.txt"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
DATE = "2026-09-28"

ROWS = [
    ("Data Science and Analytics", 4478, 4482),
    ("Marine Science", 5532, 5538),
    ("INFORMATION TECHNOLOGY AND HEALTH INFORMATICS", 9041, 9045),
    ("MANAGEMENT INFORMATION SYSTEM", 9050, 9073),
    ("INFORMATION SYSTEMS AND TECHNOLOGY", 9158, 9162),
    ("CYBER SECURITY SCIENCE", 9196, 9200),
    ("COMMUNICATIONS TECHNOLOGY", 9382, 9385),
    ("INFORMATION SCIENCE AND MEDIA STUDIES", 9452, 9456),
    ("PURE AND APPLIED BIOLOGY", None, None),
    ("APPLIED BIOLOGY AND BIOTECHNOLOGY", 10142, 10146),
    ("MARINE BIOLOGY", 10250, 10253),
    ("FISHERIES AND AQUACULTURE", 10254, 10257),
    ("Physics Electronics", 1435, 1438),
    ("Physics/Industrial Physics", None, None),
    ("Applied Physics", 1977, 1984),
    ("Applied Biochemistry", 2026, 2042),
    ("Chemistry and Industrial Chemistry", 2531, 2534),
    ("Fisheries", 3552, 3555),
    ("Applied Geology", 3788, 3790),
    ("Surveying and Geoinformatics", None, None),
]

HOLD_REASONS = {
    "PURE AND APPLIED BIOLOGY": "No exact PURE AND APPLIED BIOLOGY programme cell",
    "Physics/Industrial Physics": "No exact PHYSICS/INDUSTRIAL PHYSICS programme cell",
    "Surveying and Geoinformatics": "KASU appears beneath the next distinct programme",
}


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def source_window(start: int, end: int) -> str:
    lines = TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(lines[start - 1 : end])


def test_rows_061_080_have_item_specific_evidence_or_hold() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[60:80]
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in ROWS]

    for row, (name, start, end) in zip(bounded, ROWS):
        if start is None:
            assert row["source_context_status"] == "source_text_confirmed", name
            assert row["source_url"] == URL, name
            assert row["source_accessed_on"] == DATE, name
            assert row["source_locator"], name
            assert row["source_support_note"], name
            continue

        window = compact(source_window(start, end))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        assert f"Sciences.txt:{start}-{end}" in row["source_locator"], name
        assert all(compact(token) in window for token in re.findall(r"[A-Za-z0-9]+", name)), name
        missing = [institution for institution in row["institutions"] if compact(institution) not in window]
        assert not missing, (name, missing)

    assert sum(
        row.get("source_context_status") == "source_text_confirmed" for row in bounded
    ) == 20
    assert sum(row.get("source_context_status") == "evidence_hold" for row in bounded) == 0
