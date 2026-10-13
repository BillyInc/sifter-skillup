import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_010.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_010_captures_new_rows_and_open_package_coverage():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["findings"][0]
    rows = {row["code"]: row for row in finding["course_rows"]}

    assert checkpoint["scope"]["ccmas_package_indices"] == [172, 172]
    assert checkpoint["scope"]["cumulative_course_rows_source_compared_in_package"] == 4
    assert checkpoint["scope"]["package_rows_remaining_for_source_adjudication"] == 45
    assert set(rows) == {"PEE 201", "PEE 304", "PEE 305"}
    assert rows["PEE 201"]["disposition"] == "confirmed_defect"
    assert rows["PEE 201"]["official_outcome_count"] == rows["PEE 201"]["local_outcome_count"] == 6
    assert rows["PEE 304"]["disposition"] == "confirmed_defect"
    assert rows["PEE 304"]["official_outcome_count"] == 3
    assert rows["PEE 304"]["local_outcome_count"] == 2
    assert rows["PEE 305"]["disposition"] == "source_conflict"
    assert rows["PEE 305"]["official_table_title"] != rows["PEE 305"]["official_detail_title"]


def test_lane_3_increment_010_matches_the_current_shared_records():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    local = {row["code"]: row for row in package["courses"]}
    evidence = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}

    assert local["PEE 201"]["title"] == evidence["PEE 201"]["local_title"]
    assert len(local["PEE 201"]["skills_learned"]) == evidence["PEE 201"]["local_outcome_count"]
    assert local["PEE 201"]["content_summary"] == evidence["PEE 201"]["local_content_summary"]
    assert local["PEE 304"]["title"] == evidence["PEE 304"]["local_title"]
    assert len(local["PEE 304"]["skills_learned"]) == evidence["PEE 304"]["local_outcome_count"]
    assert local["PEE 304"]["content_summary"] == evidence["PEE 304"]["local_content_summary"]
    assert local["PEE 305"]["title"] == evidence["PEE 305"]["local_title"]
