import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
SOCIAL = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOCIAL_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
SOCIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def _assert_verified(row, expected_codes, locator_parts):
    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == SOCIAL_URL
    assert verification["verification_date"] == "2026-09-28"
    assert verification["verified_institution_codes"] == expected_codes
    locator = verification["pdf_table_locator"]
    for part in locator_parts:
        assert part in locator
    return verification


def test_lane_b_social_management_rows_4_and_5_are_verified_from_ibass():
    rows = json.loads(SOCIAL.read_text(encoding="utf-8"))["programmes"]
    source_text = SOCIAL_TEXT.read_text(encoding="cp1252")

    row4 = rows[3]
    assert row4["jamb_name"] == "Criminology and Security Studies"
    codes4 = row4["institutions"]
    assert len(codes4) == 63
    verification4 = _assert_verified(
        row4,
        codes4,
        ["printed pp. 614–615", "SOCIAL SCIENCES faculty table", "CRIMINOLOGY AND SECURITY STUDIES row", "COURSE/DEGREE AWARDING INSTITUTIONS cell"],
    )
    assert "requirements are shared across three criminology offerings" in verification4["note"]
    start4 = source_text.index("CRIMINOLOGY AND        d)")
    end4 = source_text.index("VENITE", start4) + len("VENITE")
    window4 = source_text[start4:end4]
    for code in codes4:
        assert code in window4
    assert window4.count("COOU") == 2
    assert "prints COOU twice" in verification4["note"]

    row5 = rows[4]
    assert row5["jamb_name"] == "Demography and Social Statistics"
    codes5 = ["COVENANT", "FED-KEBBI", "FED-OYE EKITI", "OAU", "UNIOSUN"]
    assert row5["institutions"] == codes5
    _assert_verified(
        row5,
        codes5,
        ["printed p. 624", "SOCIAL SCIENCES table", "DEMOGRAPHY AND SOCIAL STATISTICS row", "COURSE/DEGREE AWARDING INSTITUTIONS cell"],
    )
    start5 = source_text.index("DEMOGRAPHY AND     Two (2) 'A' level")
    end5 = source_text.index("DEMOGRAPHY AND", start5 + len("DEMOGRAPHY AND"))
    window5 = source_text[start5:end5]
    for code in codes5:
        assert code in window5

    # Keep this increment bounded: the adjacent variants are the next boundary.
    assert rows[5]["jamb_name"] == "Demography and Statistics"
    assert "source_verification" not in rows[5]
    assert rows[6]["jamb_name"] == "Demography and Social Studies"
    assert "source_verification" not in rows[6]
