import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENGINEERING = ROOT / "ccmas" / "engineering.json"


def test_pge101_table_cells_are_not_embedded_in_title_and_source_conflict_is_preserved():
    data = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "PETROLEUM AND GAS ENGINEERING")
    course = next(row for row in programme["courses"] if row["code"] == "PGE 101")

    assert course["title"] == "Introduction to Petroleum and Gas Industry with Field Trip"
    assert (course["units"], course["status"], course["lh"], course["ph"]) == (2, "C", 15, 45)
    assert "printed p. 1046" in course["source_locator"]
    assert "states LH 30" in course["source_locator"]
    assert "all six learning outcomes match" in course["source_locator"]
    assert course["content_summary"].endswith("landfill and biogas technology.")
    assert "200 Level" not in course["content_summary"]
    assert course["source_url"].endswith("Engineering-Technology-CCMAS-2023-FINAL.pdf")
