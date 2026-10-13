import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_007.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_007_carries_mse301_as_repaired_not_open_defect():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["repair_status"]["current_disposition"] == "confirmed_defect_repaired"
    assert checkpoint["repair_status"]["repair_verified"] is True
    assert checkpoint["repair_status"]["course_code"] == "MSE 301"
    assert checkpoint["summary"]["package_completed"] is False

    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "MATERIALS ENGINEERING")
    course = next(row for row in programme["courses"] if row["code"] == "MSE 301")
    assert len(course["skills_learned"]) == 6
    assert all("ocean" not in outcome.lower() and "marine sediment" not in outcome.lower() for outcome in course["skills_learned"])
    assert "mineral" in course["content_summary"].lower()
    assert course["source_url"] == checkpoint["source"]["url"]
    assert "printed pp. 878-879" in course["source_locator"]
