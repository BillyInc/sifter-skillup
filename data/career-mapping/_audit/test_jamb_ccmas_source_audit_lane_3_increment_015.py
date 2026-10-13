import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_015.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_015_resumes_at_first_uncovered_course_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    scope = checkpoint["scope"]
    assert scope["ccmas_package_indices"] == [172, 172]
    assert scope["cumulative_course_row_occurrences_source_compared_in_package"] == 22
    assert scope["package_row_occurrences_remaining_for_source_adjudication"] == 27
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [5, 6, 7, 8]
    assert [row["code"] for row in rows] == ["CHM 101", "CHM 102", "CHM 107", "CHM 108"]


def test_chm101_fused_outcomes_and_truncated_content_are_explicit():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    assert rows["CHM 101"]["local_outcome_count"] == 9
    assert rows["CHM 101"]["official_outcome_count"] == 10
    assert rows["CHM 101"]["field_dispositions"]["learning_outcomes"] == "confirmed_defect"
    assert rows["CHM 101"]["field_dispositions"]["content_summary"] == "confirmed_defect"


def test_chm_practical_course_table_title_variants_are_not_mislabeled_as_defects():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    for code in ("CHM 107", "CHM 108"):
        assert rows[code]["disposition"] == "confirmed_match"
        assert rows[code]["field_dispositions"]["title_wording"] == "source_variation_table_vs_course_block"


def test_increment_015_evidence_still_matches_current_local_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = package["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_outcome_count"]
        assert row["content_summary"].endswith(evidence["local_content_summary_ends_with"])
