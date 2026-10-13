import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_027.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_027_advances_next_five_railway_course_occurrences():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [11, 12, 13, 14, 15]
    assert [row["code"] for row in rows] == ["PHY 101", "PHY 103", "PHY 107", "PHY 108", "RAE 102"]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 15
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 27
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "ENT 211"


def test_increment_027_distinguishes_four_truncated_summaries_from_complete_rae102():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["disposition"] for row in rows[:4]] == [
        "confirmed_content_truncation_detail_qualifier_preserved",
        "confirmed_content_truncation_detail_qualifier_preserved",
        "confirmed_content_truncation",
        "confirmed_content_truncation",
    ]
    assert rows[4]["disposition"] == "source_title_variant_preserved_other_fields_confirmed_match"
    assert rows[4]["local_content_summary_chars"] == 371
    assert rows[4]["content_summary_status"] == "complete_and_aligned_with_published_course_contents"


def test_increment_027_checkpoint_matches_current_railway_rows_without_mutation():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]
    assert [len(programme["courses"][ordinal - 1]["content_summary"]) for ordinal in range(11, 15)] == [400] * 4
