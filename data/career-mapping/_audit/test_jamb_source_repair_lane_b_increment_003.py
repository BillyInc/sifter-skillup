import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
ARTS = ROOT / "data" / "career-mapping" / "jamb" / "arts_hum_offerings.json"
ARTS_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "arts_hum.txt"


def test_lane_b_remaining_arts_occurrences_41_to_43_are_explicit_holds():
    rows = json.loads(ARTS.read_text(encoding="utf-8"))["programmes"]
    assert len(rows) == 43
    assert rows[39]["jamb_name"] == "Hausa"
    assert [row["jamb_name"] for row in rows[40:43]] == [
        "Igbo",
        "Modern Language and Translation",
        "Geography and Environmental Studies",
    ]
    assert all("source_verification" in row for row in rows[:43])

    batch = rows[40:43]
    assert all(row["source_verification"]["verified_against_pdf"] is False for row in batch)
    assert all(row["source_verification"]["status"] == "evidence_hold" for row in batch)
    assert all(row["source_verification"]["hold_reason"] for row in batch)
    assert all("official_source_url" not in row["source_verification"] for row in batch)
    assert all("verification_date" not in row["source_verification"] for row in batch)

    windows = {
        row["jamb_name"]: row["source_verification"]["local_extracted_window"]
        for row in batch
    }
    assert windows["Igbo"] == "arts_hum.txt:3696-3710"
    assert windows["Modern Language and Translation"] == "arts_hum.txt:5820-5846"
    assert windows["Geography and Environmental Studies"] == "arts_hum.txt:5879-5884"

    source_lines = ARTS_TEXT.read_text(encoding="cp1252").splitlines()
    assert "IGBO" in "\n".join(source_lines[3695:3710])
    assert "AFRICAN AND ASIAN" in "\n".join(source_lines[3695:3710])
    modern_window = "\n".join(source_lines[5819:5846])
    assert "MODERN LANGUAGES" in modern_window
    assert "UNN" in modern_window
    geography_window = "\n".join(source_lines[5878:5884])
    assert "GEOGRAPHY" in geography_window
    assert "FED-KASHERE" in geography_window
