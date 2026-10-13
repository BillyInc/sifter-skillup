import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "engineering_offerings.json"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf"


def test_lane_a_engineering_011_to_020_is_bounded_and_source_adjudicated():
    programmes = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]
    block = programmes[10:20]
    assert [row["jamb_name"] for row in block] == [
        "Food Science and Engineering",
        "Food Technology",
        "Architecture",
        "Quantity Surveying",
        "Statistics",
        "Economics",
        "Geography",
        "Urban and Regional Planning",
        "Industrial Design",
        "Estate Management",
    ]

    assert [row["source_context_status"] for row in block] == [
        "source_text_confirmed",
        "source_text_confirmed",
        "evidence_hold",
        "evidence_hold",
        "evidence_hold",
        "evidence_hold",
        "evidence_hold",
        "evidence_hold",
        "evidence_hold",
        "evidence_hold",
    ]
    for offset, row in enumerate(block):
        verification = row["source_verification"]
        assert verification["official_source_url"] == URL
        assert verification["verification_date"] == "2026-09-28"
        assert verification["pdf_table_locator"]
        assert verification["note"]
        assert verification["verified_against_pdf"] is (offset in {0, 1})
        assert verification["evidence_hold"] is (offset not in {0, 1})

    assert block[0]["institutions"] == ["LAUTECH"]
    assert block[1]["institutions"] == ["BELLS", "IBADAN"]

    # Earlier rows were handled in checkpoint 011; this increment stops before
    # the next unreviewed Software Engineering occurrence.
    assert [row["jamb_name"] for row in programmes[:10]] == [
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
    assert programmes[19]["jamb_name"] == "Estate Management"
    assert programmes[20]["jamb_name"] == "Software Engineering"
