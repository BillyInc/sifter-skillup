"""Regression checks for Sciences Lane C source occurrences 161-180."""

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

EXPECTED = [
    ("Zoology and Aquaculture", "ZOOLOGY AND AQUACULTURE", "CALEB", ((5410, 5413),)),
    ("Animal Biology and Environment", "ANIMAL BIOLOGY AND ENVIRONMENT", "BENIN", ((5418, 5422),)),
    ("Conservation Biology", "CONSERVATION BIOLOGY", "AUN", ((5491, 5494),)),
    (
        "Conservation and Environmental Biology",
        "CONSERVATION AND ENVIRONMENTAL BIOLOGY",
        "ADUN",
        ((5494, 5498),),
    ),
    (
        "Environmental Science and Technology",
        "ENVRIONMENTAL SCIENCE AND TECHNOLOGY",
        "WESLEYUNI",
        ((5499, 5503),),
    ),
    ("Environmental Biology", "ENVIRONMENTAL BIOLOGY", "MAIDUGURI", ((5504, 5507),)),
    (
        "Environmental Biology and Fisheries",
        "ENVIRONMENTAL BIOLOGY AND FISHERIES",
        "AAUA",
        ((5508, 5510),),
    ),
    (
        "Marine Science and Technology",
        "MARINE SCIENCE AND TECHNOLOGY",
        "FUTA",
        ((5512, 5512), (5532, 5535)),
    ),
    ("Aviation Business", "AVIATION BUSINESS", "AAAU", ((5540, 5541),)),
    ("Geoscience", "GEOSCIENCE", "AKSU", ((6867, 6870),)),
    ("Earth Science", "EARTH SCIENCE", "LAUTECH", ((6875, 6876),)),
    ("Sport Science", "SPORT SCIENCE", "ABUAD", ((6972, 6976),)),
    (
        "Microbiology and Biotechnology",
        "MICROBIOLOGY AND BIOTECHNOLOGY",
        "ABUAD",
        ((7375, 7378),),
    ),
    (
        "Microbiology/Parasitology",
        "MICROBIOLOGY/PARASITOLOGY",
        "DANUMS",
        ((7379, 7382),),
    ),
    (
        "Biology/Biotechnology",
        "BIOLOGY/BIOTECHNOLOGY",
        "DANUMS",
        ((7383, 7385),),
    ),
    (
        "Microbiology and Industrial Biotechnology",
        "MICROBIOLOGY AND INDUSTRIAL BIOTECHNOLOGY",
        "CALEB",
        ((7391, 7394), (7420, 7421)),
    ),
    (
        "Industrial Microbiology",
        "INDUSTRIAL MICROBIOLOGY",
        "IMSU",
        ((7422, 7425),),
    ),
    (
        "Environmental Chemistry and Toxicology",
        "ENVIRONMENTAL CHEMISTRY AND TOXICOLOGY",
        "GSU",
        ((7589, 7594),),
    ),
    (
        "Energy and Petroleum Studies",
        "ENERGY AND PETROLEUM STUDIES",
        "NOVENA",
        ((7596, 7599),),
    ),
    (
        "Parasitology and Entomology",
        "PARASITOLOGY AND ENTOMOLOGY",
        "UNIZIK",
        ((7600, 7604),),
    ),
]


def compact(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def test_rows_161_180_have_exact_current_ibass_evidence() -> None:
    document = json.loads(JAMB.read_text(encoding="utf-8"))
    rows = document["programmes"]
    bounded = rows[160:180]
    assert [row["jamb_name"] for row in bounded] == [item[0] for item in EXPECTED]
    source_lines = (
        TEXT.read_text(encoding="cp1252")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .split("\n")
    )

    for row, (name, title, institution, ranges) in zip(bounded, EXPECTED, strict=True):
        evidence = "\n".join(
            "\n".join(source_lines[start - 1 : end]) for start, end in ranges
        )
        assert row["source_context_status"] == "source_text_confirmed", name
        assert row["source_original_title"] == title, name
        assert row["source_url"] == URL, name
        assert row["source_accessed_on"] == DATE, name
        assert row["source_support_note"], name
        assert all(
            compact(token) in compact(evidence)
            for token in re.findall(r"[A-Za-z0-9]+", title)
        ), name
        assert compact(institution) in compact(evidence), name
        cited_ranges = [
            (int(first), int(last))
            for first, last in re.findall(r"(\d+)-(\d+)", row["source_locator"])
        ]
        cited_points = [
            int(point)
            for point in re.findall(r"(?<!\d)(\d+)(?![-\d])", row["source_locator"])
        ]
        for start, end in ranges:
            assert any(first <= start and last >= end for first, last in cited_ranges) or (
                start == end and start in cited_points
            ), (name, start, end)

    assert sum(row.get("source_context_status") == "source_text_confirmed" for row in rows) == 182
    assert sum(row.get("source_context_status") == "evidence_hold" for row in rows) == 5
    assert sum("source_context_status" not in row for row in rows) == 0
