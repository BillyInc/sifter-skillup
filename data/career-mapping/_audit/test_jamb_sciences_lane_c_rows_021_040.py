"""Regression checks for the bounded Sciences lane C source slice 021-040."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAMB = ROOT / "jamb" / "sciences_offerings.json"
TEXT = ROOT / "_jamb_txt" / "Sciences.txt"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
DATE = "2026-09-26"


ROWS = [
    ("INFORMATION SYSTEMS", 9121, 9156),
    ("Data Science", 4503, 4527),
    ("Environmental Management and Toxicology", 7548, 7583),
    ("FORENSIC SCIENCE", 436, 458),
    ("Applied Geophysics", 6782, 6823),
    ("INFORMATION AND COMMUNICATION TECHNOLOGY", 9075, 9103),
    ("Animal and Environmental Biology", 5453, 5472),
    ("Geophysics", 6833, 6847),
    ("Industrial Physics", 1945, 1973),
    ("LIBRARY AND INFORMATION SCIENCE", 9392, 9428),
    ("Geography", 4100, 4116),
    ("Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics", 8129, 8162),
    ("Petroleum Chemistry", 2625, 2637),
    ("Pure and Industrial Chemistry", 3261, 3285),
    ("APPLIED BIOLOGY", 10130, 10137),
    ("Food Science and Technology", 3016, 3023),
    ("Environmental Management", 7530, 7537),
    ("METEOROLOGY", 10298, 10307),
    ("Chemical Sciences", 2578, 2623),
    ("Geology and Mining", 3744, 3749),
]


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def source_window(start: int, end: int) -> str:
    lines = TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(lines[start - 1 : end])


def test_rows_021_040_have_exact_local_source_evidence() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[20:40]
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in ROWS]

    for row, (name, start, end) in zip(bounded, ROWS):
        window = compact(source_window(start, end))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        assert f"Sciences.txt:{start}-{end}" in row["source_locator"], name
        assert all(compact(token) in window for token in re.findall(r"[A-Za-z0-9]+", name)), name
        missing = [institution for institution in row["institutions"] if compact(institution) not in window]
        assert not missing, (name, missing)

    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in rows) == 182
    assert sum(row.get("source_context_status") == "evidence_hold" for row in rows) == 5
