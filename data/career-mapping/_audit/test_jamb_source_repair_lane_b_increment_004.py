import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
ARTS = ROOT / "data" / "career-mapping" / "jamb" / "arts_hum_offerings.json"


def test_lane_b_arts_requested_range_41_to_60_is_not_repeated():
    rows = json.loads(ARTS.read_text(encoding="utf-8"))["programmes"]
    assert len(rows) == 43
    assert [row["jamb_name"] for row in rows[40:43]] == [
        "Igbo",
        "Modern Language and Translation",
        "Geography and Environmental Studies",
    ]
    assert all(
        row["source_verification"].get("status") == "evidence_hold"
        for row in rows[40:43]
    )
    assert all(
        row["source_verification"].get("verified_against_pdf") is False
        for row in rows[40:43]
    )
    assert all(row["source_verification"].get("hold_reason") for row in rows[40:43])
    assert len(rows[40:60]) == 3
