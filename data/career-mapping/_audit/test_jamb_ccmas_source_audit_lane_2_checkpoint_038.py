import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
COMPUTING = ROOT / "ccmas" / "computing.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_038.json"


def test_checkpoint_038_covers_exact_five_source_audited_rows_and_preserves_next_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["jamb_canonical_identity_row"] == 144
    assert checkpoint["scope"]["course_codes"] == ["GST 111", "COS 101", "ICT 201", "ICT 301", "ICT 305"]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["identity_144_missing_summaries_remaining_from_prior_set"] == ["ICT 309", "CSC 308"]
    assert "ICT 309 and CSC 308" in checkpoint["progress"]["next_cursor"]
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_038_records_independently_supported_structural_conflicts():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    decisions = {row["code"]: row for row in checkpoint["course_decisions"]}
    assert "LH 15" in decisions["GST 111"]["source"] and "LH 30" in decisions["GST 111"]["source"]
    assert "Six MTH 201/MTH 202 outcomes" in decisions["ICT 201"]["finding"]
    assert "final five are the ICT 305 outcomes" in decisions["ICT 301"]["local"]
    assert "three outcome entries" in decisions["ICT 305"]["local"]
    assert len(checkpoint["source_conflicts"]) == 2


def test_checkpoint_038_matches_current_local_rows_without_mutating_them():
    data = json.loads(COMPUTING.read_text(encoding="utf-8"))
    ict = next(programme for programme in data["programmes"] if programme["code"] == "ICT")
    courses = {course["code"]: course for course in ict["courses"]}
    assert len(courses["GST 111"]["skills_learned"]) == 7
    assert "content_summary" not in courses["GST 111"]
    assert len(courses["COS 101"]["skills_learned"]) == 6
    assert "content_summary" not in courses["COS 101"]
    assert len(courses["ICT 201"]["skills_learned"]) == 11
    assert any("Real-valued functions" in item for item in courses["ICT 201"]["skills_learned"])
    assert len(courses["ICT 301"]["skills_learned"]) == 10
    assert len(courses["ICT 305"]["skills_learned"]) == 3
    assert all("content_summary" not in courses[code] for code in ("ICT 201", "ICT 301", "ICT 305"))
