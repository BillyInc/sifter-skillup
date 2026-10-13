import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
ARTS = ROOT / "data" / "career-mapping" / "jamb" / "arts_hum_offerings.json"
ARTS_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "arts_hum.txt"
ARTS_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf"


def test_lane_b_first_20_arts_occurrences_are_verified_or_held():
    rows = json.loads(ARTS.read_text(encoding="utf-8"))["programmes"]
    assert len(rows) >= 20
    first_twenty = rows[:20]
    assert all("source_verification" in row for row in first_twenty)
    assert all("source_verification" not in row for row in rows[20:])

    verified = {
        row["jamb_name"]: row["source_verification"]
        for row in first_twenty
        if row["source_verification"].get("verified_against_pdf") is True
    }
    assert set(verified) == {"Classical Studies", "Christian Studies"}

    classical = verified["Classical Studies"]
    assert classical["official_source_url"] == ARTS_URL
    assert classical["verification_date"] == "2026-09-26"
    assert classical["verified_institution_codes"] == ["IBADAN"]
    assert "arts_hum.txt:375-384" in classical["pdf_table_locator"]

    christian = verified["Christian Studies"]
    assert christian["official_source_url"] == ARTS_URL
    assert christian["verification_date"] == "2026-09-26"
    assert christian["verified_institution_codes"] == ["AJAYI", "ILORIN", "KWASU"]
    assert "arts_hum.txt:449-452" in christian["pdf_table_locator"]

    holds = [
        row["source_verification"]
        for row in first_twenty
        if row["source_verification"].get("verified_against_pdf") is False
    ]
    assert len(holds) == 18
    assert all(hold["status"] == "evidence_hold" for hold in holds)
    assert all(hold["local_extracted_window"].startswith("arts_hum.txt:") for hold in holds)
    assert all(hold["hold_reason"] for hold in holds)
    assert all("official_source_url" not in hold for hold in holds)
    assert all("verification_date" not in hold for hold in holds)

    source_lines = ARTS_TEXT.read_text(encoding="cp1252").splitlines()
    classical_window = "\n".join(source_lines[374:384])
    assert "CLASSICAL STUDIES" in classical_window
    assert "IBADAN" in classical_window

    christian_window = "\n".join(source_lines[448:452])
    assert "CHRISTIAN STUDIES" in christian_window
    assert all(code in christian_window for code in ("AJAYI", "ILORIN", "KWASU"))
