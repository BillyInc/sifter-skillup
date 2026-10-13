import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_030.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_030_advances_only_railway_rows_29_to_33():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [29, 30, 31, 32, 33]
    assert [row["code"] for row in rows] == ["GET 299", "GST 312", "ENT 312", "GET 301", "GET 302"]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 33
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 9
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "GET 304"


def test_increment_030_records_gst_ent_identity_conflict_without_guessing():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert rows[1]["code"] == "GST 312" and rows[1]["official_table_title"] != rows[1]["official_detail_title"]
    assert rows[2]["code"] == "ENT 312" and rows[2]["official_table_title"] != rows[2]["official_detail_title"]
    assert len(checkpoint["local_reconciliation_handoff"]["unresolved_source_conflicts"]) == 1
    assert "Do not independently relabel" in checkpoint["local_reconciliation_handoff"]["findings"][1]["repair"]


def test_increment_030_matches_current_rows_in_shared_source_without_editing():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]

