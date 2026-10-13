import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_034.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_034_covers_structural_rows_6_to_10_and_advances():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [6, 7, 8, 9, 10]
    assert [row["code"] for row in rows] == ["CHM 102", "CHM 107", "CHM 108", "MTH 101", "MTH 102"]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 10
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 37
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "PHY 101"


def test_increment_034_preserves_truncation_vs_complete_summary_dispositions():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert rows[0]["local_content_summary_chars"] == 400
    assert rows[0]["disposition"] == "confirmed_content_summary_truncation"
    assert rows[1]["disposition"] == "source_aligned_with_non_substantive_grammar_normalization"
    assert rows[2]["disposition"] == "confirmed_source_alignment"
    assert rows[4]["local_learning_outcome_count"] == rows[4]["official_learning_outcome_count"] == 9


def test_increment_034_evidence_matches_shared_structural_source_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "STRUCTURAL ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]

