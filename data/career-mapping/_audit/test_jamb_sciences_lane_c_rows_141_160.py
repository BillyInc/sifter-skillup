"""Regression checks for Sciences Lane C source occurrences 141-160."""

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

EXPECTED_NAMES = [
    "Food Science & Nutrition",
    "Geological Sciences",
    "Geology and Mineral Sciences",
    "Geology and Geophysics",
    "Geology and Applied Geophysics",
    "Geology and Petroleum Studies",
    "Geology and Mineral Science",
    "Marine Geology",
    "Geography and Environmental Management",
    "Building Technology",
    "Statistics with Demography",
    "Digital Entrepreneurship",
    "Botany and Ecological Studies",
    "Plant Science and Forestry",
    "Plant Science and Microbiology",
    "Biotechnology and Food Technology",
    "Ecology",
    "Applied Ecology",
    "Ecology and Environmental Studies",
    "Textile Science and Technology",
]

# The local extraction preserves exact title/institution cells for these rows.
LOCAL_SOURCE_ROWS = [
    ("Food Science & Nutrition", "FOOD SCIENCE & NUTRITION", "EKSU", ((3029, 3031),)),
    ("Geological Sciences", "GEOLOGICAL SCIENCES", "UNIZIK", ((3729, 3730),)),
    ("Geology and Mineral Sciences", "GEOLOGY AND MINERAL SCIENCES", "CRAWFORD", ((3732, 3734),)),
    ("Geology and Geophysics", "GEOLOGY AND GEOPHYSICS", "AEFUNA", ((3736, 3738),)),
    ("Geology and Applied Geophysics", "GEOLOGY AND APPLIED GEOPHYSICS", "HENSARD", ((3740, 3742),)),
    ("Geology and Petroleum Studies", "GEOLOGY AND PETROLEUM STUDIES", "WESTERN-DEL", ((3784, 3786),)),
    ("Geology and Mineral Science", "GEOLOGY AND MINERAL SCIENCE", "KWASU", ((3792, 3794),)),
    ("Marine Geology", "MARINE GEOLOGY", "MARITIME-UNI", ((3796, 3797),)),
    ("Building Technology", "BUILDING TECHNOLOGY", "KASU", ((4246, 4247),)),
    ("Statistics with Demography", "STATISTICS WITH DEMOGRAPHY", "GOUU", ((4463, 4465),)),
    ("Digital Entrepreneurship", "DIGITAL ENTREPRENEURSHIP", "CCU", ((4529, 4531),)),
    ("Botany and Ecological Studies", "BOTANY AND ECOLOGICAL STUDIES", "UYO", ((4845, 4848),)),
    ("Biotechnology and Food Technology", "BIOTECHNOLOGY AND FOOD TECHNOLOGY", "LASUSTECH", ((5072, 5074),)),
    ("Ecology", "ECOLOGY", "BAUCHI", ((5083, 5084),)),
    ("Applied Ecology", "APPLIED ECOLOGY", "BAUCHI", ((5094, 5095),)),
    (
        "Ecology and Environmental Studies",
        "ECOLOGY AND ENVIRONMENTAL STUDIES",
        "JABU",
        ((5097, 5100),),
    ),
    (
        "Textile Science and Technology",
        "TEXTILE SCIENCE AND TECHNOLOGY",
        "ABU",
        ((5281, 5284),),
    ),
]

OFFICIAL_INDEXED_ROWS = {
    "Plant Science and Forestry": ("PLANT SCIENCE AND FORESTRY", "EKSU"),
    "Plant Science and Microbiology": ("PLANT SCIENCE AND MICROBIOLOGY", "WESTERN-DEL"),
    "Geography and Environmental Management": ("GEOGRAPHY AND ENVIRONMENTAL MANAGEMENT", "GOUU"),
}


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def test_rows_141_160_have_exact_source_evidence_or_explicit_hold() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[140:160]
    assert [row["jamb_name"] for row in bounded] == EXPECTED_NAMES
    source_lines = TEXT.read_text(encoding="cp1252").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    assert compact("Faculty/School/College of Science") in compact("\n".join(source_lines[2:6]))

    for name, exact_title, institution, ranges in LOCAL_SOURCE_ROWS:
        row = next(item for item in bounded if item["jamb_name"] == name)
        snippets = ["\n".join(source_lines[start - 1 : end]) for start, end in ranges]
        source = compact("\n".join(snippets))
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_original_title"] == exact_title, name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        title_tokens = [compact(token) for token in re.findall(r"[A-Za-z0-9]+", exact_title)]
        assert all(token in source for token in title_tokens), name
        assert compact(institution) in source, name
        assert row["source_support_note"], name
        for start, end in ranges:
            assert f"{start}-{end}" in row["source_locator"], (name, start, end)

    for name, (exact_title, institution) in OFFICIAL_INDEXED_ROWS.items():
        row = next(item for item in bounded if item["jamb_name"] == name)
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_original_title"] == exact_title, name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        expected_page = "p. 532" if name == "Geography and Environmental Management" else "printed p. 548"
        assert expected_page in row["source_locator"], name
        assert institution in row["source_support_note"], name

    # Cumulative totals include the later independently dispositioned slices.
    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in rows) == 182
    assert sum(row.get("source_context_status") == "evidence_hold" for row in rows) == 5
    assert sum("source_context_status" not in row for row in rows) == 0
