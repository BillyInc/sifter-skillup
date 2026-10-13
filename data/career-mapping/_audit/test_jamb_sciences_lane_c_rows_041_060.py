"""Regression checks for the bounded Sciences lane C source slice 041-060."""

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
    ("Mathematics with Computer Science", 6054, 6068),
    ("Applied Microbiology and Brewing / Applied Microbiology", 8111, 8120),
    ("Pure and Applied Chemistry", 2567, 2576),
    ("Plant Biology", 4934, 4939),
    ("Plant Science", 4940, 4945),
    ("Genetics and Biotechnology", 5076, 5082),
    ("Environmental Health Science", 7521, 7528),
    ("Pure and Applied Mathematics", 8004, 8022),
    ("Computer Science and Information Technology", None, None),
    ("BIOCHEMISTRY AND MOLECULAR BIOLOGY", 411, 416),
    ("INFORMATION AND COMMUNICATION SCIENCE", 9111, 9120),
    ("COMPUTER SCIENCE WITH ECONOMICS", 9163, 9167),
    ("COMPUTER SCIENCE AND MATHEMATICS", 9626, 9630),
    ("COMPUTER WITH STATISTICS", 9636, 9640),
    ("METEOROLOGY AND CLIMATE CHANGE", 10310, 10316),
    ("Electronics", 1440, 1461),
    ("Pure Chemistry", 2541, 2544),
    ("Applied Chemistry", 2660, 2663),
    ("Biostatistics", 4467, 4470),
    ("Statistics and Data Sciences", 4472, 4476),
]

HOLD = "No exact COMPUTER SCIENCE AND INFORMATION TECHNOLOGY programme cell"


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def source_window(start: int, end: int) -> str:
    lines = TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(lines[start - 1 : end])


def test_rows_041_060_have_item_specific_evidence_or_hold() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[40:60]
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in ROWS]

    for row, (name, start, end) in zip(bounded, ROWS):
        if start is None:
            assert row["source_context_status"] == "evidence_hold", name
            assert HOLD in row["evidence_hold_reason"], name
            assert "source_url" not in row, name
            assert "source_locator" not in row, name
            assert "source_accessed_on" not in row, name
            assert compact(name) not in compact(TEXT.read_text(encoding="cp1252")), name
            continue

        window = compact(source_window(start, end))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        assert f"Sciences.txt:{start}-{end}" in row["source_locator"], name
        assert all(compact(token) in window for token in re.findall(r"[A-Za-z0-9]+", name)), name
        missing = [institution for institution in row["institutions"] if compact(institution) not in window]
        assert not missing, (name, missing)

    # Assert this bounded slice only. Later increments may legitimately add
    # source evidence to rows after 060, so catalogue-wide counters and
    # untouched-tail assumptions belong in the matching checkpoint test.
    assert sum(
        row.get("source_context_status") == "source_text_confirmed" for row in bounded
    ) == 19
    assert sum(row.get("source_context_status") == "evidence_hold" for row in bounded) == 1
