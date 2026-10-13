import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "engineering_offerings.json"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf"


def test_lane_a_engineering_021_to_030_uses_exact_source_cells_and_stops_at_30():
    programmes = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]
    block = programmes[20:30]
    assert [row["jamb_name"] for row in block] == [
        "Software Engineering",
        "Meteorology",
        "Hotel Management and Tourism",
        "Home Economics and Food Management",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Chemical Engineering",
        "Biomedical Engineering",
        "Agricultural Engineering",
        "Agricultural and Bio-Resources Engineering",
    ]

    for row in block:
        evidence = row["source_verification"]
        assert row["source_context_status"] == "source_text_confirmed"
        assert row["source_url"] == URL
        assert row["source_accessed_on"] == "2026-09-28"
        assert evidence["official_source_url"] == URL
        assert evidence["verification_date"] == "2026-09-28"
        assert evidence["verified_against_pdf"] is True
        assert evidence["evidence_hold"] is False
        assert evidence["pdf_table_locator"]
        assert evidence["note"]
        assert len(row["institutions"]) == len(set(row["institutions"]))

    # The first and fourth cells had clear adjacent-row extraction spillover.
    assert block[0]["institutions"] == [
        "AUGUSTINE",
        "AUST",
        "BABCOCK",
        "BOWEN",
        "CHRISLAND",
        "CUST",
        "FED-DUTSE",
        "FUTO",
        "KOLADAISI",
        "MAITAMA",
        "MINNA",
        "MOUNTAIN TOP",
        "NILE",
        "VERITAS",
    ]
    assert "HIGHWAY ENGINEERING" not in block[0]["institutions"]
    assert "FUT-DAURA" not in block[0]["institutions"]
    assert block[3]["institutions"] == ["WESLEYUNI"]
    assert "ELECTRICAL/ELECTRONICS" not in block[3]["institutions"]
    assert "UDU-ELUON" not in block[3]["institutions"]

    # Same-name or similar-name source offerings remain separate cells.
    assert block[1]["institutions"] == ["FUTA", "UMYUK", "MINNA"]
    assert "METEOROLOGY AND CLIMATE CHANGE" in block[1]["source_verification"]["note"]
    assert block[2]["institutions"] == ["WESLEYUNI"]
    assert block[4]["institutions"] == [
        "ABU", "ABUJA", "BAYERO", "DELSUT", "FUTO", "HUSTECH", "KADPOLY-ABU",
        "KHAIRUN", "KSUSTAA", "KUST", "MADUKA", "MARITIME-UNI", "NDU",
        "OFFA-DEG", "PHC", "RSU", "UNIZIK", "UNN", "WIGWE",
    ]
    assert len(block[5]["institutions"]) == 96
    assert "FED=DUTSINMA" in block[5]["institutions"]  # source cell spelling retained
    assert len(block[6]["institutions"]) == 53
    assert block[7]["institutions"] == [
        "ABUAD", "ACHIEVERS", "BELLS", "DANUMS", "FUTO", "ILORIN", "LAGOS",
        "LCITY", "SUMAS", "TECH-IBADAN", "UNIZIK", "UNN",
    ]
    assert len(block[8]["institutions"]) == 33
    assert block[9]["institutions"] == ["MINNA", "TSUJ", "UMUDIKE", "UNIZIK", "UNN"]
    assert "index on printed p. 336" in block[9]["source_locator"]

    # The bounded increment stops before Engineering occurrence 31.
    assert programmes[19]["jamb_name"] == "Estate Management"
    assert programmes[30]["jamb_name"] == "Production Engineering"
