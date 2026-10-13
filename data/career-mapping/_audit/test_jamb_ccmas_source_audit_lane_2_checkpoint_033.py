import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_033.json"


def test_checkpoint_033_records_five_rows_and_exact_next_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["course_ordinals"] == [36, 40]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["confirmed_match_rows"] == 1
    assert checkpoint["progress"]["confirmed_defect_rows"] == 4
    assert "course ordinals 41-45" in checkpoint["progress"]["next_cursor"]
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_033_observed_states_are_still_present_in_the_audited_source():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    courses = {course["code"]: course for course in package["courses"]}

    assert courses["GER 401"]["ph"] is None and courses["GER 401"]["lh"] is None
    assert courses["GER 401"]["skills_learned"] == []
    assert courses["GER 402"]["units"] is None and courses["GER 402"]["ph"] is None
    assert len(courses["GER 402"]["skills_learned"]) == 2
    assert len(courses["GER 403"]["skills_learned"]) == 5
    assert len(courses["GER 404"]["skills_learned"]) == 2
    assert courses["GER 405"]["skills_learned"] == []


def test_checkpoint_033_keeps_ger405_source_cross_reference_explicit():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert "GER 405 references GER 404 outcomes and contents" in checkpoint["reconciliation_handoff"]["source_cross_references_to_preserve"]
    assert "do not replace" in checkpoint["reconciliation_handoff"]["source_scope_rule"].lower()
