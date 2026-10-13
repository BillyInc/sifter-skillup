import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
SOCIAL = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOCIAL_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
SOCIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def _assert_verified(row, expected_name, expected_code, title, locator_phrase):
    assert row["jamb_name"] == expected_name
    assert row["institutions"] == [expected_code]
    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == SOCIAL_URL
    assert verification["verification_date"] == "2026-09-28"
    assert verification["verified_institution_codes"] == [expected_code]
    locator = verification["pdf_table_locator"]
    assert "printed p. 624" in locator
    assert "SOCIAL SCIENCES faculty table" in locator
    assert title in locator
    assert "COURSE/DEGREE AWARDING INSTITUTIONS first-column cell" in locator
    assert locator_phrase in locator
    assert "requirement text flows across the grouped block" in verification["note"]


def test_lane_b_social_management_rows_6_and_7_are_verified_from_ibass():
    rows = json.loads(SOCIAL.read_text(encoding="utf-8"))["programmes"]
    source_text = SOCIAL_TEXT.read_text(encoding="cp1252")

    _assert_verified(
        rows[5],
        "Demography and Statistics",
        "GOUU",
        "DEMOGRAPHY AND STATISTICS",
        "with GOUU listed beneath the title",
    )
    _assert_verified(
        rows[6],
        "Demography and Social Studies",
        "UDU",
        "DEMOGRAPHY AND SOCIAL STUDIES",
        "with UDU listed beneath the title",
    )

    first_demography = source_text.index("DEMOGRAPHY AND     Two (2) 'A' level")
    statistics = source_text.index("DEMOGRAPHY AND", first_demography + len("DEMOGRAPHY AND"))
    gouu = source_text.index("GOUU", statistics)
    studies = source_text.index("DEMOGRAPHY AND", statistics + len("DEMOGRAPHY AND"))
    udu = source_text.index("UDU", studies)
    assert "STATISTICS" in source_text[statistics:gouu]
    assert gouu < studies < udu
    assert "SOCIAL STUDIES" in source_text[studies:udu]

    # This increment ends at row 7; row 8 remains the next unreviewed item.
    assert rows[7]["jamb_name"] == "Population Studies"
    assert "source_verification" not in rows[7]
