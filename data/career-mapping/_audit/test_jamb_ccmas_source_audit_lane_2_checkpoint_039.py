import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
COMPUTING = ROOT / "ccmas" / "computing.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_039.json"


def test_checkpoint_039_closes_remaining_row_144_summary_rows_and_keeps_scope_open():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["course_codes"] == ["ICT 309", "CSC 308"]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 2
    assert checkpoint["progress"]["identity_144_seven_missing_summaries_audited"] == 7
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False
    assert "facet and four-domain-link evidence adjudication" in checkpoint["progress"]["next_cursor"]


def test_checkpoint_039_captures_source_variants_and_never_normalises_them_silently():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    decisions = {row["code"]: row for row in checkpoint["course_decisions"]}
    assert "Mobile Communication and Network" in decisions["ICT 309"]["source"]
    assert "Mobile Communication& Network" in decisions["ICT 309"]["source"]
    assert "Operating Systems" in decisions["CSC 308"]["source"]
    assert "Operating System" in decisions["CSC 308"]["source"]
    assert "recourses" in decisions["CSC 308"]["finding"]
    assert "do not rewrite the NUC source text" in decisions["CSC 308"]["repair_pointer"]


def test_checkpoint_039_matches_the_current_local_records_without_editing_shared_data():
    data = json.loads(COMPUTING.read_text(encoding="utf-8"))
    ict = next(programme for programme in data["programmes"] if programme["code"] == "ICT")
    courses = {course["code"]: course for course in ict["courses"]}
    assert len(courses["ICT 309"]["skills_learned"]) == 4
    assert len(courses["CSC 308"]["skills_learned"]) == 7
    assert "content_summary" not in courses["ICT 309"]
    assert "content_summary" not in courses["CSC 308"]
