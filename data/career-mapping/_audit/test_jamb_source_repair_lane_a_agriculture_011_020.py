import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
AGRICULTURE = ROOT / "data" / "career-mapping" / "jamb" / "agriculture_offerings.json"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_lane_a_agriculture_occurrences_011_to_020_have_bounded_source_outcomes():
    rows = json.loads(AGRICULTURE.read_text(encoding="utf-8"))["programmes"]
    block = rows[10:20]
    expected_names = [
        "Soil Science",
        "Family, Nutrition and Consumer Sciences",
        "Food Science with Business",
        "Forestry and Fisheries",
        "Forestry, Wildlife & Fisheries",
        "Plant Breeding and Seed Technology",
        "Home Economics",
        "Hotel Management & Tourism",
        "Home Science, Nutrition and Dietetics",
        "Home Science & Management",
    ]
    assert [row["jamb_name"] for row in block] == expected_names

    verified = {
        0: (
            [
                "AAU", "ABSU", "AKSU", "BENIN", "CALABAR", "COOU", "DELSU",
                "DELSUT", "IMSU", "MAKURDI", "MAUTY", "OAU", "RSU", "SALEM",
                "UMUDIKE", "UNN", "UYO",
            ],
            "printed pp. 121-123",
        ),
        1: (["OAU"], "printed p. 124"),
        2: (["BELLS"], "printed p. 130"),
        4: (["EKSU", "OOU"], "printed p. 143"),
        6: (
            ["BELLS", "FUNAAB", "ILORIN", "LASUED", "MAKURDI", "MAUTY", "OAU", "OOU", "UMUDIKE", "UNIOSUN", "UYO"],
            "printed pp. 144-145",
        ),
        7: (["BIU", "FED-WUKARI", "GREGORY", "UMUDIKE", "UNI-AFRICA", "WESLEYUNI"], "printed p. 145"),
        8: (["MKAR"], "printed p. 148"),
        9: (["FED-GASHUA", "FED-DUTSINMA"], "printed p. 146"),
    }
    for index, (institutions, locator) in verified.items():
        row = block[index]
        verification = row["source_verification"]
        assert row["source_context_status"] == "source_text_confirmed"
        assert row["institutions"] == institutions
        assert verification["verified_against_pdf"] is True
        assert verification["official_source_url"] == OFFICIAL_URL
        assert locator in verification["pdf_table_locator"]
        assert verification["verification_date"] == "2026-09-28"
        assert verification["note"]

    for index, locator in [(3, "printed p. 75"), (5, "printed p. 143")]:
        row = block[index]
        verification = row["source_verification"]
        assert row["source_context_status"] == "evidence_hold"
        assert verification["verified_against_pdf"] is False
        assert verification["evidence_hold"] is True
        assert verification["official_source_url"] == OFFICIAL_URL
        assert locator in verification["pdf_table_locator"]
        assert verification["verification_date"] == "2026-09-28"
        assert verification["note"]
