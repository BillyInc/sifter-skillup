import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_017.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_017_resumes_without_repeating_peE101():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    scope = checkpoint["scope"]
    assert scope["ccmas_package_indices"] == [172, 172]
    assert scope["cumulative_course_row_occurrences_source_compared_in_package"] == 29
    assert scope["package_row_occurrences_remaining_for_source_adjudication"] == 20
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [13, 14, 15]
    assert [row["code"] for row in rows] == ["PHY 103", "PHY 107", "PHY 108"]
    assert 16 not in [row["ordinal"] for row in rows]


def test_all_three_physics_summaries_are_truncated_but_outcomes_match():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    for code in ("PHY 103", "PHY 107", "PHY 108"):
        assert rows[code]["field_dispositions"]["content_summary"] == "confirmed_defect"
        assert rows[code]["local_outcome_count"] == rows[code]["official_outcome_count"]
        assert rows[code]["field_dispositions"]["programme_table_identity_structure_outcomes"] == "confirmed_match"


def test_increment_017_matches_current_local_package_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = package["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_outcome_count"]
        assert row["content_summary"].endswith(evidence["local_content_summary_ends_with"])
