import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_025.json"


def _german_courses():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    return package["courses"]


def test_checkpoint_025_records_only_source_supported_findings_for_ger104_to_108():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["ccmas_package_index"] == 80
    assert checkpoint["scope"]["course_codes"] == ["GER 104", "GER 105", "GER 106", "GER 107", "GER 108"]
    decisions = {row["code"]: row for row in checkpoint["course_decisions"]}
    assert decisions["GER 104"]["disposition"] == "confirmed_extraction_artifact_in_outcome"
    assert decisions["GER 105"]["disposition"] == "confirmed_match_compared_fields"
    assert decisions["GER 106"]["disposition"] == "confirmed_outcome_merge_and_extraction_artifact"
    assert decisions["GER 107"]["disposition"] == "confirmed_match_compared_fields"
    assert decisions["GER 108"]["disposition"] == "confirmed_content_truncation"
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_025_source_defects_are_present_and_boundary_protected_in_current_data():
    courses = _german_courses()
    by_code = {course["code"]: course for course in courses}
    assert "New Arts 472" in by_code["GER 104"]["skills_learned"][4]
    assert len(by_code["GER 106"]["skills_learned"]) == 7
    assert "New Arts 473" in by_code["GER 106"]["skills_learned"][5]
    assert by_code["GER 108"]["content_summary"].endswith("Learn how to")
    assert len(by_code["GER 105"]["skills_learned"]) == 7
    assert len(by_code["GER 107"]["skills_learned"]) == 7


def test_checkpoint_025_next_cursor_is_exact_and_package_remains_open():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert checkpoint["progress"]["next_cursor"].startswith("CCMAS package index 080, German course ordinals 11-15")
