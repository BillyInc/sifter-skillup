import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_035.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_035_covers_structural_rows_11_to_15_and_advances():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [11, 12, 13, 14, 15]
    assert [row["code"] for row in rows] == ["PHY 101", "PHY 103", "PHY 107", "PHY 108", "GST 212"]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 15
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 32
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "GET 201"


def test_increment_035_captures_gst212_outcome_content_boundary_contamination():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = checkpoint["findings"][0]["course_rows"][4]
    assert row["local_learning_outcome_count"] == row["official_learning_outcome_count"] == 8
    assert "appends syllabus text" in row["learning_outcomes_status"]
    assert "structural boundary error" in row["rationale"]


def test_increment_035_matches_local_occurrences_and_records_owner_groups():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "STRUCTURAL ENGINEERING")
    rows = checkpoint["findings"][0]["course_rows"]
    for evidence in rows:
        local = programme["courses"][evidence["ordinal"] - 1]
        assert local["code"] == evidence["code"]
        assert local["title"] == evidence["local_title"]
        assert len(local["skills_learned"]) == evidence["local_learning_outcome_count"]
        assert evidence["official_schedule_owner_group"]
    assert rows[0]["official_schedule_owner_group"].startswith("Basic Sciences")
    assert rows[-1]["official_schedule_owner_group"] == "ENT/GST (200-level general-studies grouping)"

