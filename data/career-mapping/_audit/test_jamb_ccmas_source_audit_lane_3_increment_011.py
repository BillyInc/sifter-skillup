import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_011.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_011_preserves_the_two_siwes_source_occurrences():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["findings"][0]
    rows = {row["course_ordinal"]: row for row in finding["course_rows"]}

    assert checkpoint["scope"]["ccmas_package_indices"] == [172, 172]
    assert checkpoint["scope"]["cumulative_course_row_occurrences_source_compared_in_package"] == 6
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 43
    assert set(rows) == {44, 49}
    assert rows[44]["official_title"] == "SIWES II: Students Work Experience Scheme"
    assert rows[44]["disposition"] == "confirmed_defect"
    assert rows[49]["code"] == "GET 399"
    assert rows[49]["local_title"].startswith("SIWES I:")
    assert rows[49]["disposition"] == "confirmed_defect"
    stages = {row["stage"]: row["code"] for row in rows[49]["official_stage_code_pairs"]}
    assert stages == {"SIWES I": "GET 299", "SIWES II": "GET 399", "SIWES III": "GET 499"}


def test_lane_3_increment_011_evidence_matches_the_current_separate_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    actual = {index: package["courses"][index - 1] for index in (44, 49)}
    evidence = {row["course_ordinal"]: row for row in checkpoint["findings"][0]["course_rows"]}

    for index in (44, 49):
        assert actual[index]["code"] == evidence[index]["code"]
        assert actual[index]["title"] == evidence[index]["local_title"]
        assert len(actual[index]["skills_learned"]) == evidence[index]["local_learning_outcome_count"]
        assert actual[index]["content_summary"].startswith("On-the-job experience")
