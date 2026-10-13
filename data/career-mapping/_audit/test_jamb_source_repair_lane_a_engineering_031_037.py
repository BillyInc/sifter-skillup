import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "engineering_offerings.json"
PDF_URL = "https://ibass.jamb.gov.ng/static/media/engineering2.a81443bb885b5e602704.pdf"


def test_lane_a_engineering_031_to_037_exact_offering_cells():
    programmes = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]
    assert len(programmes) == 37
    block = programmes[30:37]
    assert [row["jamb_name"] for row in block] == [
        "Production Engineering",
        "Mechatronics Engineering",
        "Electronics Engineering",
        "Electrical/Electronic Engineering",
        "Communication Technology",
        "ICT Engineering",
        "Land Surveying",
    ]

    expected_institutions = [
        ["BENIN", "EUI"],
        [
            "ABU", "ABUAD", "ACHIEVERS", "AFIT-DEG", "AEFUNA", "BAYERO", "BAZE",
            "BENIN", "BELLS", "BOWEN", "CUST", "EUI", "ESUTECH", "FED-DUTSINMA",
            "FED-OTUOKE", "FED-OYE EKITI", "FUT-DAURA", "FUNAAB", "FUTO", "HUSTECH",
            "IGBINEDION", "KHAIRUN", "KUST", "LANDMARK", "LASUSTECH", "LCITY",
            "MADUKA", "MINNA", "NDA", "NILE", "PAN-ATLANTIC", "PHC", "SUMMIT",
            "TECH-IBADAN", "TOPFAITH", "UDA", "UNN", "VENITE", "WIGWE",
        ],
        ["AUN", "FUTO", "PHC", "UNIZIK", "UNN"],
        [
            "AAU", "ABSU", "ABUAD", "ACHIEVERS", "AFIT-DEG", "AJAYI", "AKSU",
            "ALETHEIA", "AUE", "AUN", "BABCOCK", "BAUCHI", "BAZE", "BELLS", "BENIN",
            "BIDA-DEG", "BIU", "BOUEDST", "BOWEN", "CALABAR", "CARITAS", "COOU",
            "COSMOPOLITAN", "COVENANT", "CRUTECH", "CUST", "DELSU", "EBSU", "EUI",
            "EKSU", "ELIZADE", "ESUTECH", "AEFUNA", "FED-DUTSINMA", "FED-OTUOKE",
            "FED-OYE EKITI", "FEDPOADO-D", "FEDPOBAU-DEG", "FED-LOKOJA", "FUNAAB",
            "FUPRE", "FUT-DAURA", "FUTA", "FUTIA", "FUTO", "GREGORY", "IBADAN",
            "IGBINEDION", "ILORIN", "IMSU", "JOS", "KSUSTA", "KWASU", "LAGOS",
            "LASUSTECH", "LAUTECH", "LCITY", "MADONNA", "MAIDUGURI", "MAKURDI", "MAUTY",
            "MARANATHA", "NAUB", "NASARAWA", "NDA", "NDU", "NILE", "OAU", "ODUDUWA",
            "OOU", "OAUSTECH", "PAN-ATLANTIC", "PHC", "REDEEMERS", "SUMAS", "TAU",
            "TECH-IBADAN", "TOPFAITH", "TSUJ", "UAGRIC-IMO", "UDA", "UDU", "UMUDIKE",
            "UNIOSUN", "UYO", "VERITAS", "VENITE",
        ],
        ["BELLS", "TAU"],
        ["ELIZADE"],
        ["ABU", "ESUTECH", "IMSU", "RSU"],
    ]
    expected_source_titles = [
        "PRODUCTION ENGINEERING",
        "MECHATRONICS ENGINEERING",
        "ELECTRONICS ENGINEERING",
        "ELECTRICAL/ELECTRONICS ENGINEERING",
        "COMMUNICATION TECHNOLOGY",
        "INFORMATION AND COMMUNICATION TECHNOLOGY ENGINEERING",
        "LAND SURVEYING",
    ]

    for row, institutions, source_title in zip(
        block, expected_institutions, expected_source_titles
    ):
        assert row["institutions"] == institutions
        assert row["source_original_title"] == source_title
        assert row["source_faculty"] == "Engineering/Environmental/Technology"
        assert row["source_url"] == PDF_URL
        assert row["source_accessed_on"] == "2026-09-28"
        assert row["source_context_status"] == "source_text_confirmed"
        evidence = row["source_verification"]
        assert evidence["verified_against_pdf"] is True
        assert evidence["evidence_hold"] is False
        assert evidence["official_source_url"] == PDF_URL
        assert evidence["verification_date"] == "2026-09-28"
        assert evidence["pdf_table_locator"]
        assert evidence["note"]
        assert len(row["institutions"]) == len(set(row["institutions"]))

    # Keep nearby but differently titled source offerings separate.
    assert "PRODUCTION TECHNOLOGY" in block[0]["source_verification"]["note"]
    assert "MECHATRONICS AND ROBOTICS ENGINEERING" in block[1]["source_verification"]["note"]
    assert "Electrical and Information Engineering" in block[2]["source_verification"]["note"]
    assert block[3]["source_original_title"] != block[3]["jamb_name"].upper()
    assert len(block[3]["institutions"]) == 87
    assert "INFORMATION AND COMMUNICATION ENGINEERING" in block[5]["source_verification"]["note"]
    assert "COVENANT, NILE and UNIZIK" in block[5]["source_verification"]["note"]
    assert "following INFORMATION AND COMMUNICATION TECHNOLOGY offering" in block[5]["source_verification"]["note"]
    assert "LAND SURVEYING AND GEOINFORMATICS" in block[6]["source_verification"]["note"]
