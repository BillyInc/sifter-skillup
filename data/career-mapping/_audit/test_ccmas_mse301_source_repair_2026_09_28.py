import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENGINEERING = ROOT / "ccmas" / "engineering.json"


def test_materials_engineering_mse301_uses_its_own_nuc_source_block():
    data = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "MATERIALS ENGINEERING")
    course = next(row for row in programme["courses"] if row["code"] == "MSE 301")

    assert len(course["skills_learned"]) == 6
    assert "mineral and ore deposits" in course["skills_learned"][0]
    assert "NIAFlow" in course["skills_learned"][4]
    assert "marine sediments" not in " ".join(course["skills_learned"])
    assert "mineral-concentration methods" in course["content_summary"]
    assert "printed pp. 878-879" in course["source_locator"]
    assert course["source_url"].endswith("Engineering-Technology-CCMAS-2023-FINAL.pdf")
