import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
SOCIAL = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOCIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def test_lane_b_social_management_row_2_identity_is_verified_from_ibass():
    rows = json.loads(SOCIAL.read_text(encoding="utf-8"))["programmes"]
    assert rows[0]["jamb_name"] == "Accounting and Finance"

    row = rows[1]
    assert row["jamb_name"] == "Criminology and Penology"
    assert row["institutions"] == ["RSU", "SALEM"]
    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == SOCIAL_URL
    assert verification["verification_date"] == "2026-09-28"
    assert verification["verified_institution_codes"] == ["RSU", "SALEM"]
    locator = verification["pdf_table_locator"]
    assert "Social Sciences faculty table" in locator
    assert "CRIMINOLOGY AND PENOLOGY row" in locator
    assert "COURSE/DEGREE AWARDING INSTITUTIONS cell" in locator
    assert "printed page number" in locator
    assert "shared/blank requirement cells" in verification["note"]

    # Keep the increment bounded at row 2; row 3 is the next unreviewed item.
    assert rows[2]["jamb_name"] == "Criminology"
    assert "source_verification" not in rows[2]
