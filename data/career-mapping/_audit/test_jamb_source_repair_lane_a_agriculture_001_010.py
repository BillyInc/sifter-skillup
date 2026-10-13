import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
AGRICULTURE = ROOT / "data" / "career-mapping" / "jamb" / "agriculture_offerings.json"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"


def test_lane_a_agriculture_occurrences_001_to_010_have_bounded_source_outcomes():
    rows = json.loads(AGRICULTURE.read_text(encoding="utf-8"))["programmes"]
    block = rows[:10]

    assert [row["jamb_name"] for row in block] == [
        "Agriculture",
        "Biotechnology",
        "Horticulture",
        "Fisheries",
        "Agronomy",
        "Animal Production",
        "Animal Science",
        "Animal Breeding and Genetics",
        "Crop Production",
        "Crop Science",
    ]
    assert block[4]["source_context_status"] == "source_text_confirmed"
    assert block[4]["source_verification"] == {
        "verified_against_pdf": True,
        "official_source_url": OFFICIAL_URL,
        "pdf_table_locator": "Agriculture brochure p. 103, AGRONOMY heading and complete awarding-institution cell",
        "verification_date": "2026-09-28",
        "note": "The official cell names ADSU, ESUTECH, HENSARD, IBADAN, NASARAWA, TSUJ and UNIOSUN, matching the parsed institutions exactly; the programme is under the Agriculture faculty heading.",
    }
    assert block[4]["institutions"] == [
        "ADSU",
        "ESUTECH",
        "HENSARD",
        "IBADAN",
        "NASARAWA",
        "TSUJ",
        "UNIOSUN",
    ]

    horticulture = block[2]
    assert horticulture["source_context_status"] == "source_text_confirmed"
    assert horticulture["institutions"] == ["FUNAAB", "MINNA"]
    assert horticulture["source_verification"]["official_source_url"] == OFFICIAL_URL
    assert horticulture["source_verification"]["pdf_table_locator"] == (
        "Agriculture.txt:3817-3819; printed p. 149; "
        "exact HORTICULTURE title-awarder cell"
    )
    assert horticulture["source_verification"]["access_date"] == "2026-09-28"
    assert horticulture["source_verification"]["disposition"] == "confirmed_exact_source_cell"
    assert horticulture["source_offering_contexts"][0]["source_title"] == "HORTICULTURE"

    animal_production = block[5]
    assert animal_production["source_context_status"] == "source_text_confirmed"
    assert animal_production["institutions"] == [
        "ADSU", "BAUCHI", "DELSUT", "DOU", "LASUSTECH", "MINNA", "UM UDIKE"
    ]
    assert "Agriculture.txt:1768-1783" in animal_production["source_verification"]["pdf_table_locator"]
    assert animal_production["source_verification"]["access_date"] == "2026-09-28"

    animal_breeding = block[7]
    assert animal_breeding["source_context_status"] == "source_text_confirmed"
    assert animal_breeding["institutions"] == ["FUNAAB"]
    assert "Agriculture.txt:2027-2033" in animal_breeding["source_verification"]["pdf_table_locator"]

    animal_science = block[6]
    assert animal_science["source_context_status"] == "source_text_confirmed"
    assert animal_science["institutions"] == [
        "AAU", "BENIN", "BOUEDST", "CALABAR", "COOU", "DELSU", "FUA-ZURU",
        "IBADAN", "JABU", "MAIDUGURI", "MAKURDI", "NASARAWA", "OAU", "PHC",
        "RSU", "UNN", "AKSU", "EBSU", "TSUJ", "UDA", "UNIOSUN", "UNIZIK", "UYO",
    ]
    assert "Agriculture.txt:1938-2002" in animal_science["source_verification"]["pdf_table_locator"]

    crop_science = block[9]
    assert crop_science["source_context_status"] == "source_text_confirmed"
    assert crop_science["institutions"] == ["DELSUT", "FUA-ZURU", "JABU", "RSU", "UDA", "UNN"]
    assert "Agriculture.txt:2214-2221" in crop_science["source_verification"]["pdf_table_locator"]

    holds = block[:2] + block[3:4] + [block[8]]
    assert len(holds) == 4
    for row in holds:
        verification = row["source_verification"]
        assert row["source_context_status"] == "evidence_hold"
        assert verification["verified_against_pdf"] is False
        assert verification["evidence_hold"] is True
        assert verification["official_source_url"] == OFFICIAL_URL
        assert verification["pdf_table_locator"]
        assert verification["verification_date"] == "2026-09-28"
        assert verification["note"]

    # Later Agriculture increments may now carry verification metadata. This
    # regression stays scoped to rows 1–10 rather than asserting a stale
    # catalogue-tail state.
