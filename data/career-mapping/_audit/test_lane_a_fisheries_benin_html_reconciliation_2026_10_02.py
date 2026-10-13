import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "agriculture_offerings.json"


def test_lane_a_fisheries_keeps_benin_unassigned_without_jamb_faculty_context():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    record = next(row for row in data["programmes"] if row["jamb_name"] == "Fisheries")

    assert "BENIN" not in record["institutions"]
    assert record["source_verification"]["evidence_hold"] is True
    assert record["source_verification"]["verified_against_pdf"] is False
    assert "source_html_review" not in record
    assert "does not identify which JAMB faculty/source occurrence owns Fisheries" in record["source_support_note"]
