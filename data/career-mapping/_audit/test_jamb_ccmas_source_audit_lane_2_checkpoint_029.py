import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_029.json"


def _courses():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    return {course["code"]: course for course in package["courses"]}


def test_checkpoint_029_records_exact_source_scope_and_local_reconciliation_boundary():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    decisions = {item["code"]: item for item in checkpoint["course_decisions"]}
    assert checkpoint["scope"]["course_ordinals"] == [16, 20]
    assert decisions["GER 203"]["disposition"] == "confirmed_merged_outcomes"
    assert decisions["GER 204"]["official_source_conflict"].startswith("The NUC PDF prints two GER 204 blocks")
    assert decisions["GER 205"]["disposition"] == "confirmed_content_truncation_and_field_spill"
    assert decisions["GER 202"]["disposition"] == "confirmed_match_compared_fields"
    assert decisions["GER 206"]["disposition"] == "confirmed_match_compared_fields"
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_029_matches_expected_local_defects_without_editing_shared_rows():
    courses = _courses()
    assert len(courses["GER 203"]["skills_learned"]) == 6
    assert courses["GER 204"]["ph"] is None and courses["GER 204"]["lh"] is None
    assert len(courses["GER 204"]["skills_learned"]) == 9
    assert len(courses["GER 205"]["skills_learned"]) == 5
    assert courses["GER 205"]["content_summary"].endswith("rea")
    assert len(courses["GER 202"]["skills_learned"]) == 6
    assert len(courses["GER 206"]["skills_learned"]) == 4


def test_checkpoint_029_keeps_package_open_and_exact_next_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert checkpoint["progress"]["next_cursor"].startswith("CCMAS package index 080, course ordinals 21-25")
