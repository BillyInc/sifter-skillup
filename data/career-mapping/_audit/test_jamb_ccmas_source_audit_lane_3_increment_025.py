import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_025.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_025_advances_only_the_next_three_railway_occurrences():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [1, 2, 3]
    assert [row["code"] for row in rows] == ["GST 111", "GST 112", "GET 101"]
    assert checkpoint["scope"]["course_rows_source_compared_in_this_increment"] == 3
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 39
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "GET 102"


def test_increment_025_records_content_truncation_without_misclassifying_aligned_fields():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    for row in checkpoint["findings"][0]["course_rows"]:
        assert row["disposition"] == "confirmed_content_truncation"
        assert row["local_learning_outcome_count"] == row["official_learning_outcome_count"]
        assert row["local_units_status_hours"] == row["official_units_status_hours"]
        assert row["local_content_summary_chars"] == 400


def test_increment_025_evidence_matches_current_railway_rows_and_does_not_mutate_them():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["content_summary"]) == 400
        assert len(row["skills_learned"]) == evidence["official_learning_outcome_count"]
