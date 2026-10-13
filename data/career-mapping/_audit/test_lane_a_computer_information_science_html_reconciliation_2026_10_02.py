import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "engineering_offerings.json"


def test_lane_a_computer_information_science_removes_only_heading_fragments_and_stays_held():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    record = next(
        row
        for row in data["programmes"]
        if row["jamb_name"] == "Computer and Information Science"
    )

    assert record["institutions"] == ["BAUCHI", "SUMMIT"]
    assert record["source_verification"]["evidence_hold"] is True
    assert record["source_verification"]["verified_against_pdf"] is False
    assert record["source_html_review"]["reviewed_on"] == "2026-10-02"
    assert [item["institution_code"] for item in record["source_html_review"]["sources"]] == [
        "BAUCHI",
        "SUMMIT",
    ]
    assert all(item["url"].startswith("https://") for item in record["source_html_review"]["sources"])
