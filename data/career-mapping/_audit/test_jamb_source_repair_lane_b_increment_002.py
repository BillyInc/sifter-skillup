import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
ARTS = ROOT / "data" / "career-mapping" / "jamb" / "arts_hum_offerings.json"
ARTS_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "arts_hum.txt"
ARTS_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf"


def test_lane_b_arts_occurrences_21_to_40_are_verified_or_held():
    rows = json.loads(ARTS.read_text(encoding="utf-8"))["programmes"]
    assert len(rows) >= 43
    assert rows[19]["jamb_name"] == "African and Asian Studies"
    assert rows[20]["jamb_name"] == "Linguistics"

    batch = rows[20:40]
    assert len(batch) == 20
    assert all("source_verification" in row for row in batch)
    assert all("source_verification" not in row for row in rows[40:])

    verified = {
        row["jamb_name"]: row["source_verification"]
        for row in batch
        if row["source_verification"].get("verified_against_pdf") is True
    }
    assert set(verified) == {"Peace Studies", "Anthropology", "Efik-Ibibio"}

    expected = {
        "Peace Studies": ("LASU", "arts_hum.txt:4854-4858"),
        "Anthropology": ("IBADAN", "arts_hum.txt:5743-5745"),
        "Efik-Ibibio": ("UYO", "arts_hum.txt:5770-5772"),
    }
    for name, (code, locator) in expected.items():
        metadata = verified[name]
        assert metadata["official_source_url"] == ARTS_URL
        assert metadata["verification_date"] == "2026-09-26"
        assert metadata["verified_institution_codes"] == [code]
        assert locator in metadata["pdf_table_locator"]

    holds = [
        row["source_verification"]
        for row in batch
        if row["source_verification"].get("verified_against_pdf") is False
    ]
    assert len(holds) == 17
    assert all(hold["status"] == "evidence_hold" for hold in holds)
    assert all(hold["hold_reason"] for hold in holds)
    assert all("official_source_url" not in hold for hold in holds)
    assert all("verification_date" not in hold for hold in holds)

    source_lines = ARTS_TEXT.read_text(encoding="cp1252").splitlines()
    assert "PEACE STUDIES" in "\n".join(source_lines[4853:4858])
    assert "LASU" in "\n".join(source_lines[4853:4858])
    assert "ANTHROPOLOGY" in "\n".join(source_lines[5742:5745])
    assert "IBADAN" in "\n".join(source_lines[5742:5745])
    assert "EFIK-IBIBIO" in "\n".join(source_lines[5769:5772])
    assert "UYO" in "\n".join(source_lines[5769:5772])
