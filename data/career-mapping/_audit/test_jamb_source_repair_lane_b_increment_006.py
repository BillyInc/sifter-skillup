import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
SOCIAL = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOCIAL_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
SOCIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def test_lane_b_social_management_row_3_criminology_is_verified_from_ibass():
    rows = json.loads(SOCIAL.read_text(encoding="utf-8"))["programmes"]
    assert rows[1]["jamb_name"] == "Criminology and Penology"

    row = rows[2]
    assert row["jamb_name"] == "Criminology"
    expected_codes = ["BAYERO", "CALEB", "JEWEL", "POL-ACAD"]
    assert row["institutions"] == expected_codes

    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == SOCIAL_URL
    assert verification["verification_date"] == "2026-09-28"
    assert verification["verified_institution_codes"] == expected_codes
    locator = verification["pdf_table_locator"]
    assert "printed p. 614" in locator
    assert "SOCIAL SCIENCES faculty table" in locator
    assert "CRIMINOLOGY row" in locator
    assert "COURSE/DEGREE AWARDING INSTITUTIONS cell" in locator
    assert "shared/blank requirement representation is retained" in verification["note"]

    # The official PDF extraction places the row and its institution cell on p. 614.
    source_text = SOCIAL_TEXT.read_text(encoding="cp1252")
    row_start = source_text.index("CRIMINOLOGY       (lxxi)")
    source_window = source_text[row_start : row_start + 500]
    for code in expected_codes:
        assert code in source_window
    # Keep the increment bounded at row 3; row 4 is the next catalogue item.
    # It may already carry evidence from a separate source pass, so do not
    # require its metadata to be blank here.
    assert rows[3]["jamb_name"] == "Criminology and Security Studies"
