import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_043.json"


def test_checkpoint_043_covers_only_computer_science_ordinals_11_to_15():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["source_component_course_ordinals"] == [11, 15]
    assert checkpoint["scope"]["course_codes"] == ["COS 102", "GST 212", "ENT 211", "MTH 201", "MTH 202"]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["missing_content_rows"] == 5
    assert checkpoint["progress"]["workload_source_conflict_rows"] == 1
    assert checkpoint["progress"]["row_145_combined_scope_closed"] is False
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_043_matches_component_rows_without_collapsing_repeated_codes():
    rows = json.loads(SCOPES.read_text(encoding="utf-8"))["rows"]
    row = next(item for item in rows if item["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS")
    courses = [course for course in row["selected_courses"] if course.get("source_ccmas_programme") == "Computer Science"][10:15]
    assert [course["code"] for course in courses] == ["COS 102", "GST 212", "ENT 211", "MTH 201", "MTH 202"]
    assert all(course["content_summary"] is None for course in courses)
    assert courses[2]["lecture_hours"] == 30 and courses[2]["practical_hours"] == 0


def test_checkpoint_043_keeps_ent_211_internal_conflict_unresolved():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    ent = next(item for item in checkpoint["course_decisions"] if item["code"] == "ENT 211")
    assert "internal_workload_conflict_unresolved" in ent["source_status"]
    assert "LH 30, PH 0" in ent["source"] and "LH 15, PH 45" in ent["source"]
    assert "unresolved" in ent["finding"]
    assert "asses" in json.dumps(checkpoint, ensure_ascii=False)
