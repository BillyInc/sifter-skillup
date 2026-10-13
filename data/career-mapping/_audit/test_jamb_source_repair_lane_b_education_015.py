import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "education_offerings.json"
SOURCE = ROOT / "data" / "career-mapping" / "_jamb_txt" / "education.txt"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf"

EXPECTED = [
    "Vocational Education",
    "Technology Education",
    "Home Economics and Hotel Management",
    "Teacher Education",
    "Library Science",
    "Library and Information Science",
    "Education and Business Administration",
    "Business Education",
    "Sport Science",
    "Statistics Education",
    "Sport Management (Education)",
    "Transport Planning and Management",
]


def test_education_index_names_are_checked_without_promoting_ambiguous_awarders():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = payload["programmes"]
    text = SOURCE.read_text(encoding="cp1252").upper()
    assert [row["jamb_name"] for row in rows] == EXPECTED

    for row in rows:
        source_title = "SPORT MANAGEMENT" if row["jamb_name"] == "Sport Management (Education)" else row["jamb_name"].upper()
        assert source_title in text
        # No exact body awarder verification was added in this title-index pass.
        assert "source_verification" not in row

    vocational = rows[0]["institutions"]
    assert "EDUCATION" in vocational
    assert "INDUSTRIAL TECHNICAL" in vocational
    assert "TECHNOLOGY/INTRODUCTORY" in vocational
    assert OFFICIAL_URL.endswith("brochure-degree-education.pdf")
