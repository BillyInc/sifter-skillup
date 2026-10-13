import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_014.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_014_continues_after_increment_013_without_closing_package():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    scope = checkpoint["scope"]
    assert scope["ccmas_package_indices"] == [172, 172]
    assert scope["cumulative_course_row_occurrences_source_compared_in_package"] == 18
    assert scope["package_row_occurrences_remaining_for_source_adjudication"] == 31
    assert scope["full_packages_completed"] == 0
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [1, 2, 3, 4]
    assert [row["code"] for row in rows] == ["GST 111", "GST 112", "GET 101", "GET 102"]


def test_increment_014_retains_programme_table_course_block_conflicts():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    assert rows["GET 101"]["official_programme_table_units_status_hours"].endswith("LH 30; PH not listed")
    assert rows["GET 101"]["official_course_block_units_status_hours"].endswith("LH 15; PH not listed")
    assert rows["GET 101"]["field_dispositions"]["lecture_hours"] == "source_conflict"
    assert rows["GET 102"]["official_programme_table_units_status_hours"].endswith("LH 15; PH 30")
    assert rows["GET 102"]["official_course_block_units_status_hours"].endswith("LH 15; PH 45")
    assert rows["GET 102"]["field_dispositions"]["practical_hours"] == "source_conflict"


def test_increment_014_records_only_content_defects_where_local_summary_is_truncated():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}
    for code in ("GST 111", "GST 112", "GET 101", "GET 102"):
        assert "content_summary" in rows[code]["field_dispositions"]
        assert rows[code]["field_dispositions"]["content_summary"] == "confirmed_defect"
    assert rows["GET 101"]["disposition"] == "source_conflict"
    assert rows["GET 102"]["disposition"] == "source_conflict"


def test_increment_014_current_rows_still_match_the_captured_local_fields():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    local = package["courses"]
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = local[evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_outcome_count"]
        assert row["content_summary"].endswith(evidence["local_content_summary_ends_with"])
