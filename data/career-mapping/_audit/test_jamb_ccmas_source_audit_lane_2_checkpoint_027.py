import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_027.json"


def _courses():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    return {course["code"]: course for course in package["courses"]}


def test_checkpoint_027_records_current_source_confirmed_fields_and_anomalies():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    decisions = {item["code"]: item for item in checkpoint["course_decisions"]}
    assert checkpoint["scope"]["course_ordinals"] == [11, 15]
    assert decisions["GST 212"]["disposition"] == "confirmed_content_truncation_and_field_spill"
    assert decisions["GST 222"]["source_conflict"].startswith("The official heading explicitly reads '2 Units C- LH 30'")
    assert decisions["FAC 201"]["disposition"].endswith("official_source_semantic_anomaly")
    assert decisions["FAC 202"]["disposition"].endswith("official_source_semantic_anomaly")
    assert decisions["GER 201"]["disposition"] == "confirmed_outcome_merge_and_extraction_artifact"
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_027_defects_are_still_present_in_current_shared_curriculum():
    courses = _courses()
    assert courses["GST 212"]["content_summary"].endswith("Logic as an")
    assert "inference. Informal fallacies" in courses["GST 212"]["skills_learned"][-1]
    assert courses["GST 222"]["status"] == "C"
    assert courses["GST 222"]["lh"] is None
    assert "New Arts 475" in courses["GST 222"]["content_summary"]
    assert courses["FAC 201"]["content_summary"] is None
    assert len(courses["FAC 201"]["skills_learned"]) == 1
    assert courses["FAC 202"]["content_summary"].endswith("to hel")
    assert len(courses["GER 201"]["skills_learned"]) == 5
    assert "New Arts 477" in courses["GER 201"]["skills_learned"][-1]


def test_checkpoint_027_marks_package_open_and_names_next_exact_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert checkpoint["progress"]["next_cursor"].startswith("CCMAS package index 080, course ordinals 16-20")
