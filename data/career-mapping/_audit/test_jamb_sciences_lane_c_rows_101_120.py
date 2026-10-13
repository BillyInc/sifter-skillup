"""Regression checks for bounded Sciences lane C source slice 101-120."""

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
    ("ELECTRONICS AND COMPUTER SYSTEMS", "ELECTRONICS AND COMPUTER SYSTEMS", ((9657, 9665),)),
    ("ELECTRONICS AND COMMUNICATIONS", "ELECTRONICS AND COMMUNICATIONS", ((9667, 9669),)),
    ("ARCHEAOLOGY", "ARCHEAOLOGY", ((9701, 9703),)),
    ("HUMAN BIOLOGY", "HUMAN BIOLOGY", ((9879, 9880),)),
    ("APPLIED BOTANY", "APPLIED BOTANY", ((10113, 10114),)),
    ("APPLIED BIOLOGY AND GENETICS", "APPLIED BIOLOGY AND GENETICS", ((10138, 10140),)),
    ("CELL BIOLOGY & GENETICS", "CELL BIOLOGY & GENETICS", ((10147, 10150), (10169, 10174))),
    ("OPERATIONS RESEARCH", "OPERATIONS RESEARCH", ((10191, 10195),)),
    ("ENGINEERING PHYSICS", "ENGINEERING PHYSICS", ((22, 24), (10217, 10220))),
    ("BIOINFORMATICS", "BIOINFORMATICS", ((10223, 10225),)),
    ("ANTHROPOLOGY", None, ((10226, 10228),)),
    ("MARINE BIOLOGY & FISHERIES", "MARINE BIOLOGY & FISHERIES", ((10246, 10249),)),
    ("OCEANOGRAPHY", "OCEANOGRAPHY", ((10259, 10260),)),
    ("METEOROLOGY AND CLIMATE SCIENCE", "METEOROLOGY AND CLIMATE SCIENCE", ((10319, 10323),)),
    ("NATURAL AND ENVIRONMENTAL SCIENCE", "NATURAL AND ENVIRONMENTAL SCIENCE", ((10325, 10333),)),
    ("HOME SCIENCE", "HOME SCIENCE", ((10355, 10356),)),
    ("Physics and Computer Electronic", "PHYSICS AND COMPUTER ELECTRONIC", ((1431, 1436),)),
    ("Electrons", "ELECTRONS", ((1463, 1464),)),
    ("Physics with Solar Energy", "PHYSICS WITH SOLAR ENERGY", ((1474, 1477),)),
    ("Physics and Energy Studies", "PHYSICS AND ENERGY STUDIES", ((1478, 1480),)),
]

HOLD_REASON = (
    "The official table pairs IBADAN with ANTHROPOLOGY (BIOLOGICAL), not the "
    "unqualified ANTHROPOLOGY catalogue identity"
)


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def lines() -> list[str]:
    return TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")


def window(source_lines: list[str], start: int, end: int) -> str:
    return "\n".join(source_lines[start - 1 : end])


def test_rows_101_120_have_exact_source_evidence_or_item_specific_hold() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[100:120]
    source_lines = lines()
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in ROWS]
    assert compact(FACULTY_HEADER) in compact(window(source_lines, 3, 6))

    for row, (name, source_title, ranges) in zip(bounded, ROWS):
        if source_title is None:
            assert row["source_context_status"] == "evidence_hold", name
            assert HOLD_REASON in row["evidence_hold_reason"], name
            source_hold = compact("\n".join(window(source_lines, start, end) for start, end in ranges))
            assert compact("ANTHROPOLOGY") in source_hold
            assert compact("BIOLOGICAL") in source_hold
            assert compact("IBADAN") in source_hold
            for key in ("source_url", "source_locator", "source_accessed_on", "source_original_title"):
                assert key not in row, (name, key)
            continue

        snippets = [window(source_lines, start, end) for start, end in ranges]
        text = compact("\n".join(snippets))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        assert row["source_original_title"] == source_title, name
        assert row["source_support_note"], name
        assert FACULTY_HEADER in row["source_locator"], name
        for start, end in ranges:
            assert f"{start}-{end}" in row["source_locator"], (name, start, end)
        title_words = [compact(token) for token in re.findall(r"[A-Za-z0-9]+", source_title)]
        assert all(token in text for token in title_words), name
        assert all(compact(institution) in text for institution in row["institutions"]), name

    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in rows) == 182
    assert sum(row.get("source_context_status") == "evidence_hold" for row in rows) == 5
    assert sum("source_context_status" not in row for row in rows) == 0
