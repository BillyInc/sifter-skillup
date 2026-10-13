"""Regression checks for the bounded Sciences lane C source slice 081-100."""

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
FACULTY_HEADER = "Faculty/School/College of Science"

ROWS = [
    ("Plant Biology and Biotechnology", 4901, 4905),
    ("Applied Zoology", 5414, 5416),
    ("Geography and Geosciences", None, None),
    ("Molecular Biology", 7387, 7389),
    ("Mathematics and Economics / Mathematics with Economics", 8056, 8063),
    ("Computer Science and Information Science", None, None),
    ("BIOTECHNOLOGY AND MOLECULAR BIOLOGY", 417, 420),
    ("DATA MANAGEMENT", 9047, 9048),
    ("COMMUNICATION AND WIRELESS TECHNOLOGY", 9169, 9171),
    ("TELECOMMUNICATION MANAGEMENT", 9173, 9175),
    ("TELECOMMUNICATION SCIENCE", 9192, 9194),
    ("TELECOMMUNICATION AND WIRELESS TECHNOLOGY", 9377, 9381),
    ("COMMUNICATION AND DIGITAL MEDIA STUDIES", 9387, 9390),
    ("LIBRARY AND INFORMATION TECHNOLOGY", 9441, 9444),
    ("INFORMATION AND MEDIA TECHNOLOGY", 9441, 9479),  # prior evidence, preserve
    ("INFORMATION AND MEDIA SCIENCE", 9474, 9476),
    ("INFORMATION SCIENCE", None, None),
    ("MATHEMATICAL SCIENCES", 9618, 9624),
    ("COMPUTER SCIENCE WITH MATHEMATICS", 9632, 9634),
    ("ELECTRONICS AND COMPUTER TECHNOLOGY", 9657, 9662),
]

HOLD_REASONS = {
    "Geography and Geosciences": "No exact Geography and Geosciences programme cell",
    "Computer Science and Information Science": "No exact Computer Science and Information Science programme cell",
    "INFORMATION SCIENCE": "does not establish an exact Information Science programme block with UNIOSUN",
}

PAGE_EVIDENCE = {
    "Computer Science and Information Science": (
        "IBASS Sciences brochure, p. 624",
        "COMPUTER SCIENCE AND INFORMATION SCIENCE",
        ["BINGHAM", "LCITY"],
    ),
    "INFORMATION SCIENCE": (
        "IBASS Sciences brochure, p. 638",
        "INFORMATION SCIENCE",
        ["UNIOSUN"],
    ),
}


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def lines() -> list[str]:
    return TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")


def source_window(start: int, end: int) -> str:
    return "\n".join(lines()[start - 1 : end])


def test_rows_081_100_have_exact_source_evidence_or_explicit_hold() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[80:100]
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in ROWS]

    faculty = compact(source_window(3, 6))
    assert compact(FACULTY_HEADER) in faculty

    for row, (name, start, end) in zip(bounded, ROWS):
        if start is None:
            if name in PAGE_EVIDENCE:
                locator, title, institutions = PAGE_EVIDENCE[name]
                assert row["source_context_status"] == "source_text_confirmed", name
                assert row["source_url"] == URL, name
                assert row["source_accessed_on"] == DATE, name
                assert locator in row["source_locator"], name
                assert row["source_original_title"] == title, name
                assert row["institutions"] == institutions, name
                continue
            assert row["source_context_status"] == "evidence_hold", name
            assert HOLD_REASONS[name] in row["evidence_hold_reason"], name
            assert "source_url" not in row, name
            assert "source_locator" not in row, name
            assert "source_accessed_on" not in row, name
            continue

        if name == "INFORMATION AND MEDIA TECHNOLOGY":
            assert row["source_context_status"] == "source_text_confirmed"
            assert row["source_url"] == URL
            assert row["source_accessed_on"] == "2026-09-26"
            assert "Sciences.txt:9441-9479" in row["source_locator"]
            continue

        window = compact(source_window(start, end))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        assert row["source_support_note"], name
        assert FACULTY_HEADER in row["source_locator"], name
        assert f"{start}-{end}" in row["source_locator"], name
        institutions = [
            token for token in row["institutions"]
            if compact(token) in window
        ]
        assert len(institutions) == len(row["institutions"]), (name, row["institutions"])
        source_title = row["source_original_title"]
        assert all(compact(token) in window for token in re.findall(r"[A-Za-z0-9]+", source_title)), name

    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in rows) == 182
    assert sum(row.get("source_context_status") == "evidence_hold" for row in rows) == 5
    for number, row in enumerate(rows[100:], 101):
        assert row.get("source_context_status") in {"source_text_confirmed", "evidence_hold"}, number
