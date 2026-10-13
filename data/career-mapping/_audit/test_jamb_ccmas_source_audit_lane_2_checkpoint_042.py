import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_042.json"


def test_checkpoint_042_covers_only_computer_science_ordinals_6_to_10():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["source_component_course_ordinals"] == [6, 10]
    assert checkpoint["scope"]["course_codes"] == ["PHY 102", "PHY 107", "PHY 108", "STA 111", "COS 101"]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["missing_content_rows"] == 5
    assert checkpoint["progress"]["row_145_combined_scope_closed"] is False
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_042_matches_scope_rows_and_keeps_repeated_course_identity():
    rows = json.loads(SCOPES.read_text(encoding="utf-8"))["rows"]
    row = next(item for item in rows if item["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS")
    courses = row["selected_courses"][5:10]
    assert [course["code"] for course in courses] == ["PHY 102", "PHY 107", "PHY 108", "STA 111", "COS 101"]
    assert all(course["source_ccmas_programme"] == "Computer Science" for course in courses)
    assert all(course["content_summary"] is None and course["learning_outcomes"] for course in courses)
    assert "This is the Computer Science instance" in json.loads(CHECKPOINT.read_text(encoding="utf-8"))["course_decisions"][4]["finding"]


def test_checkpoint_042_records_source_editorial_wording_without_correcting_it():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    text = json.dumps(checkpoint, ensure_ascii=False)
    assert "the basic physical of Maxwell’s equations" in text
    assert "preserve exact NUC wording" in checkpoint["cross_row_findings"][1]["disposition"]
