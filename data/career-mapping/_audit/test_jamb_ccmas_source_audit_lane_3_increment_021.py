import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_021.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_021_advances_coverage_and_preserves_source_variants():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [25, 26, 27, 28]
    assert [row["code"] for row in rows] == ["GET 210", "GET 211", "GET 301", "PEE 201"]
    assert rows[1]["outcomes_status"].endswith("options rather than treating all as mandatory")
    assert rows[2]["programme_table_level"].startswith("200 Level")
    assert rows[3]["official_detail_title"] == "Petroleum Geology with Field Trip"
    assert checkpoint["summary"]["next_cursor"] == {"package_index": 172, "local_course_ordinal": 29, "course_code": "PEE 202"}


def test_increment_021_source_rows_match_current_package_without_modifying_it():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"].replace(" ", "") == evidence["code"].replace(" ", "")
        assert row["title"] == evidence["local_title"]
    assert programme["courses"][26]["level"] == 200
    assert checkpoint["local_reconciliation_handoff"]["finding_ordinals"] == [25, 26, 27, 28]
