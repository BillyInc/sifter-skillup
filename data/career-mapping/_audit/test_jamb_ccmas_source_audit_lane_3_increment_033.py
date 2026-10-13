import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_033.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_033_covers_only_structural_rows_1_to_5_and_advances_cursor():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [1, 2, 3, 4, 5]
    assert [row["code"] for row in rows] == ["GST 111", "GST 112", "GET 101", "GET 102", "CHM 101"]
    assert checkpoint["scope"]["local_course_count"] == 47
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 42
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "CHM 102"


def test_increment_033_records_chm101_merged_outcomes_and_summary_truncation():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = checkpoint["findings"][0]["course_rows"][4]
    assert row["local_learning_outcome_count"] == 9
    assert row["official_learning_outcome_count"] == 10
    assert "outcome 10" in row["learning_outcomes_status"]
    assert row["local_content_summary_chars"] == 400


def test_increment_033_evidence_matches_shared_source_rows_without_mutation():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "STRUCTURAL ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]

