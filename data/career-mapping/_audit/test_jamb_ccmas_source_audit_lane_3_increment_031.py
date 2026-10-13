import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_031.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_031_covers_exact_next_five_railway_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [34, 35, 36, 37, 38]
    assert [row["code"] for row in rows] == ["GET 304", "GET 305", "GET 306", "GET 307", "GET 399"]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 38
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 4
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "RAE 301"


def test_increment_031_captures_get399_cross_course_outcome_contamination():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    siwes = checkpoint["findings"][0]["course_rows"][-1]
    assert siwes["code"] == "GET 399"
    assert siwes["local_learning_outcome_count"] == 15
    assert siwes["official_learning_outcome_count"] == 7
    assert "GET 402" in siwes["structural_conflict"]
    assert "GET 404" in siwes["structural_conflict"]


def test_increment_031_evidence_matches_current_local_rows_without_edits():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]

