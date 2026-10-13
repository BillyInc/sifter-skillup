import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
JAMB = ROOT / "data" / "career-mapping" / "jamb"
AGRICULTURE_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf"
ENGINEERING_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf"


def load_programmes(filename):
    return json.loads((JAMB / filename).read_text(encoding="utf-8"))["programmes"]


def test_lane_a_agriculture_021_to_027_and_engineering_001_to_010_are_bounded():
    agriculture = load_programmes("agriculture_offerings.json")
    engineering = load_programmes("engineering_offerings.json")

    agriculture_block = agriculture[20:27]
    assert [row["jamb_name"] for row in agriculture_block] == [
        "Pasture & Range Management",
        "Livestock Production Technology",
        "Animal Physiology",
        "Crop Protection",
        "Plant Science",
        "Farm Management & Agric. Extension",
        "Eco-Tourism and Wildlife Management",
    ]
    assert [row["source_context_status"] for row in agriculture_block] == [
        "source_text_confirmed",
        "source_text_confirmed",
        "source_text_confirmed",
        "source_text_confirmed",
        "evidence_hold",
        "evidence_hold",
        "source_text_confirmed",
    ]
    for offset, row in enumerate(agriculture_block):
        verification = row["source_verification"]
        assert verification["official_source_url"] == AGRICULTURE_URL
        assert verification["verification_date"] == "2026-09-28"
        assert verification["pdf_table_locator"]
        assert verification["note"]
        assert verification["verified_against_pdf"] is (offset in {0, 1, 2, 3, 6})
        assert verification["evidence_hold"] is (offset not in {0, 1, 2, 3, 6})

    # Occurrence 28 was already confirmed before this increment and remains intact.
    assert agriculture[27]["jamb_name"] == "Environmental Management and Technology"
    assert agriculture[27]["source_context_status"] == "source_text_confirmed"
    assert agriculture[27]["source_accessed_on"] == "2026-09-26"
    assert agriculture[27]["institutions"] == ["FUNAAB", "KWASU"]

    engineering_block = engineering[:10]
    assert [row["jamb_name"] for row in engineering_block] == [
        "Building",
        "Civil Engineering",
        "Computer and Information Science",
        "Polymer and Textile Engineering",
        "Water Resources and Environmental Engr",
        "Petroleum and Gas Engineering",
        "Gas Engineering",
        "Computer Science",
        "Systems Engineering",
        "Food Engineering",
    ]
    for offset, row in enumerate(engineering_block):
        verification = row["source_verification"]
        resolved = offset in {5, 6}
        assert row["source_context_status"] == (
            "source_text_confirmed" if resolved else "evidence_hold"
        )
        assert verification["verified_against_pdf"] is resolved
        assert verification["evidence_hold"] is (not resolved)
        assert verification["official_source_url"] == ENGINEERING_URL
        assert verification["verification_date"] == "2026-09-28"
        assert verification["pdf_table_locator"]
        assert verification["note"]
