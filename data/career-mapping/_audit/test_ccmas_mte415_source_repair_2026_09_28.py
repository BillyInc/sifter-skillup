import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENGINEERING = ROOT / "ccmas" / "engineering.json"


def test_mte415_row_spill_is_removed_and_source_conflict_is_preserved():
    data = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "METALLURGICAL ENGINEERING")
    course = next(row for row in programme["courses"] if row["code"] == "MTE 415")

    assert course["title"] == "Metallurgical Engineering Laboratory II"
    assert "GET 499" not in course["title"]
    assert len(course["skills_learned"]) == 3
    assert all("Laboratory manuals" not in outcome and "500 Level" not in outcome for outcome in course["skills_learned"])
    assert course["status"] == "C"
    assert "status C" in course["source_locator"] and "status E" in course["source_locator"]
    assert course["source_url"].endswith("Engineering-Technology-CCMAS-2023-FINAL.pdf")
