import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_030.json"


def _courses():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    return {course["code"]: course for course in package["courses"]}


def test_checkpoint_030_adjudicates_all_five_course_rows_and_exact_next_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["course_ordinals"] == [21, 25]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert checkpoint["progress"]["next_cursor"].startswith("CCMAS package index 080, course ordinals 26-30")
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_030_records_observed_defects_and_preserves_no_source_content_for_ger207():
    courses = _courses()
    assert courses["GER 207"]["content_summary"] is None
    assert len(courses["GER 207"]["skills_learned"]) == 6
    assert "New Arts 480" in courses["GER 208"]["skills_learned"][3]
    assert courses["GER 209"]["ph"] is None and courses["GER 209"]["lh"] is None
    assert courses["GER 209"]["content_summary"] is None
    assert courses["GER 210"]["content_summary"].endswith("300 Level")
    assert courses["GST 312"]["content_summary"].startswith("Learning Outcomes")
    assert courses["GST 312"]["content_summary"].endswith("ethn")
