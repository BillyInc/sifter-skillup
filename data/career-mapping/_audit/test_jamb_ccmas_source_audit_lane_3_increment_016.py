import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_016.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_016_continues_from_saved_package_ordinals():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    scope = checkpoint["scope"]
    assert scope["ccmas_package_indices"] == [172, 172]
    assert scope["cumulative_course_row_occurrences_source_compared_in_package"] == 26
    assert scope["package_row_occurrences_remaining_for_source_adjudication"] == 23
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [9, 10, 11, 12]
    assert [row["code"] for row in rows] == ["MTH 101", "MTH 102", "MTH 103", "PHY 101"]


def test_mth101_uses_petroleum_specific_outcomes_and_records_truncated_content():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    assert rows["MTH 101"]["local_outcome_count"] == 5
    assert rows["MTH 101"]["official_outcome_count"] == 5
    assert rows["MTH 101"]["field_dispositions"]["content_summary"] == "confirmed_defect"
    assert rows["MTH 102"]["local_outcome_count"] == 9
    assert rows["MTH 102"]["official_outcome_count"] == 9
    assert rows["MTH 102"]["disposition"] == "confirmed_match"


def test_truncated_mth103_and_phy101_summaries_are_recorded_as_field_defects():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    for code in ("MTH 103", "PHY 101"):
        assert rows[code]["field_dispositions"]["content_summary"] == "confirmed_defect"
        assert rows[code]["local_outcome_count"] == rows[code]["official_outcome_count"]


def test_increment_016_still_matches_current_local_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = package["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_outcome_count"]
        assert row["content_summary"].endswith(evidence["local_content_summary_ends_with"])
