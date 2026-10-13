"""Regression checks for the bounded Sciences lane C source slice 121-140."""

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
    ("Physics with Computational Modeling", "PHYSICS WITH COMPUTATIONAL MODELING", ((1501, 1501), (1509, 1511))),
    ("Physics/Astrology", "PHYSICS/ASTROLOGY", ((1513, 1514),)),
    ("Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)", "PHYSICAL SCIENCES", ((1516, 1520),)),
    ("Energy Studies", "ENERGY STUDIES", ((1522, 1523),)),
    ("Physics and Applied Physics", "PHYSICS AND APPLIED PHYSICS", ((1941, 1945),)),
    ("Pure and Applied Physics", "PURE AND APPLIED PHYSICS", ((1977, 1980),)),
    ("Pure Physics", "PURE PHYSICS", ((1985, 1986),)),
    ("Pure and Industrial Physics", "PURE AND INDUSTRIAL PHYSICS", ((2001, 2008),)),
    ("Industrial Physics with Renewable Energy", "INDUSTRIAL PHYSICS WITH RENEWABLE ENERGY", ((2005, 2008),)),
    ("Applied and Renewable Energy", "APPLIED AND RENEWABLE ENERGY", ((2010, 2012),)),
    ("Industrial Physics with Applied Geophysics", "INDUSTRIAL PHYSICS WITH APPLIED GEOPHYSICS", ((2014, 2017),)),
    ("Industrial Physics with Electronics and IT Application", "INDUSTRIAL PHYSICS WITH ELECTRONICS AND IT APPLICATION", ((2019, 2024),)),
    ("Industrial Mathematics and Computer Science", "INDUSTRIAL MATHEMATICS AND COMPUTER SCIENCE", ((2113, 2117),)),
    ("Industrial Mathematics /Applied Statistics", "INDUSTRIAL MATHEMATICS /APPLIED STATISTICS", ((2119, 2122),)),
    ("Applied Mathematics with Statistics", "APPLIED MATHEMATICS WITH STATISTICS", ((2124, 2127),)),
    ("Applied Statistics", "APPLIED STATISTICS", ((2138, 2140),)),
    ("Industral Mathematics/Computer", "INDUSTRAL MATHEMATICS/COMPUTER", ((2141, 2144),)),
    ("Industrial Chemistry and Chemical Entrepreneurship", "INDUSTRIAL CHEMISTRY AND CHEMICAL ENTREPRENEURSHIP", ((2536, 2540),)),
    ("Industrial and Environmental Chemistry", "INDUSTRIAL AND ENVIRONMENTAL CHEMISTRY", ((2655, 2659),)),
    ("Brewing Science and Technology", "BREWING SCIENCE AND TECHNOLOGY", ((3024, 3028),)),
]


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def test_rows_121_140_have_exact_source_evidence_or_item_specific_hold() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[120:140]
    source_lines = TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in ROWS]
    assert compact("Faculty/School/College of Science") in compact("\n".join(source_lines[2:6]))

    for row, (name, original_title, ranges) in zip(bounded, ROWS):
        snippets = ["\n".join(source_lines[start - 1 : end]) for start, end in ranges]
        source = compact("\n".join(snippets))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        if name == "Physics with Computational Modeling":
            assert compact("PHYSICS WITH") in compact(snippets[0]), name
            assert compact("COMPUTATIONAL") in compact(snippets[1]), name
            assert compact("MODELING") in compact(snippets[1]), name
        elif name == "Industral Mathematics/Computer":
            assert compact("INDUSTRAL") in source and compact("MATHEMATICS") in source, name
            assert compact("COMPUTE") in source and compact("EBSU") in source, name
        else:
            title_tokens = [compact(token) for token in re.findall(r"[A-Za-z0-9]+", original_title)]
            assert all(token in source for token in title_tokens), name
        assert row["source_support_note"], name
        assert all(compact(code) in source for code in row["institutions"]), name
        for start, end in ranges:
            assert f"{start}-{end}" in row["source_locator"], (name, start, end)

    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in bounded) == 20
    assert sum(row.get("source_context_status") == "evidence_hold" for row in bounded) == 0
    assert sum("source_context_status" not in row for row in bounded) == 0
