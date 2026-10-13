import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_032.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_032_closes_railway_occurrence_coverage_and_advances_lane():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [39, 40, 41, 42]
    assert [row["code"] for row in rows] == ["RAE 301", "RAE 302", "RAE 303", "RAE 304"]
    assert checkpoint["findings"][0]["package_status"] == "all_42_course_occurrences_source_compared_package_closed"
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 0
    assert checkpoint["summary"]["next_cursor"]["programme"] == "STRUCTURAL ENGINEERING"


def test_increment_032_records_rae301_cross_course_contamination():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = checkpoint["findings"][0]["course_rows"][0]
    assert row["local_learning_outcome_count"] == 6
    assert row["official_learning_outcome_count"] == 2
    assert "RAE 302" in row["structural_conflict"]


def test_increment_032_evidence_matches_shared_railway_source_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        expected_outcomes = 2 if evidence["code"] == "RAE 301" else evidence["local_learning_outcome_count"]
        assert len(row["skills_learned"]) == expected_outcomes
