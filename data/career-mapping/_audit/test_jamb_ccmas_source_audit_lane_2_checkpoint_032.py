import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_032.json"


def test_checkpoint_032_tracks_five_source_rows_and_next_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["course_ordinals"] == [31, 35]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["confirmed_match_rows"] == 1
    assert checkpoint["progress"]["confirmed_defect_rows"] == 4
    assert "course ordinals 36-40" in checkpoint["progress"]["next_cursor"]
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_032_records_the_observed_local_rows():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    courses = {course["code"]: course for course in package["courses"]}

    assert courses["GER 303"]["skills_learned"] == []
    assert courses["GER 304"]["skills_learned"] == []
    assert len(courses["GER 305"]["skills_learned"]) == 4
    assert "into English or any other language" in courses["GER 305"]["skills_learned"][2]
    assert courses["GER 305"]["content_summary"].endswith("New Arts 485")
    assert len(courses["GER 306"]["skills_learned"]) == 5
    assert len(courses["GER 307"]["skills_learned"]) == 2
    assert "into English or any other language" in courses["GER 307"]["skills_learned"][0]
    assert courses["GER 307"]["content_summary"].endswith("400 Level")


def test_checkpoint_032_keeps_ger303_and_ger304_as_source_cross_references():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    refs = checkpoint["reconciliation_handoff"]["source_cross_references_to_preserve"]
    assert "GER 303 references GER 301 outcomes" in refs
    assert "GER 304 references GER 302 outcomes" in refs
    assert "do not expand" in checkpoint["reconciliation_handoff"]["source_scope_rule"].lower()
