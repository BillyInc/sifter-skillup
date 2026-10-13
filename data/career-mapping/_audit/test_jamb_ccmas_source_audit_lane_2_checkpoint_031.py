import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_031.json"


def test_checkpoint_031_adjudicates_all_five_rows_and_preserves_cursor_and_scope():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["course_ordinals"] == [26, 30]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["confirmed_defect_rows"] == 5
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert "course ordinals 31-35" in checkpoint["progress"]["next_cursor"]
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_031_records_each_observed_local_condition_without_mutating_shared_rows():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    courses = {course["code"]: course for course in package["courses"]}

    assert courses["ENT 312"]["ph"] is None
    assert len(courses["ENT 312"]["skills_learned"]) == 8
    assert "New Arts 482" in courses["ENT 312"]["skills_learned"][-1]
    assert courses["ENT 312"]["content_summary"].rstrip().endswith("personal savings,")

    assert courses["FAC 301"]["content_summary"] in (None, "")
    assert "Meaning and characteristics of research" in courses["FAC 301"]["skills_learned"][-1]

    assert courses["FAC 302"]["content_summary"].startswith("Learning Outcomes ")
    assert len(courses["GER 301"]["skills_learned"]) == 4
    assert "into English or any other language" in courses["GER 301"]["skills_learned"][2]
    assert "New Arts 484" in courses["GER 302"]["skills_learned"][-1]


def test_checkpoint_031_holds_unreadable_fac301_outcome_instead_of_guessing():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    held = checkpoint["source_conflicts"][0]
    assert held["course_code"] == "FAC 301"
    assert held["disposition"] == "hold_exact_outcome_wording_for_readable_primary_source"
    assert "do not infer" in checkpoint["reconciliation_handoff"]["source_scope_rule"].lower()
