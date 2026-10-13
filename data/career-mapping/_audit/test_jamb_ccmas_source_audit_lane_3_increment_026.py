import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_026.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_026_advances_the_next_seven_occurrences_without_skips():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == list(range(4, 11))
    assert [row["code"] for row in rows] == [
        "GET 102", "CHM 101", "CHM 102", "CHM 107", "CHM 108", "MTH 101", "MTH 103"
    ]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 10
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 32
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "PHY 101"


def test_increment_026_separates_confirmed_defects_from_exact_source_matches():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert sum(row["disposition"] == "confirmed_match" for row in rows) == 2
    assert sum(row["disposition"] != "confirmed_match" for row in rows) == 5
    chm101 = rows[1]
    assert chm101["local_learning_outcome_count"] == 9
    assert chm101["official_learning_outcome_count"] == 10
    assert "concatenated" in chm101["learning_outcomes_status"]
    assert rows[3]["disposition"] == "confirmed_match"
    assert rows[4]["disposition"] == "confirmed_match"


def test_increment_026_checkpoint_values_match_current_railway_occurrences():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert row["units"] == int(evidence["local_units_status_hours"].split(";")[0])
    assert len(programme["courses"][4]["skills_learned"]) == 9
    assert "10.determine" in programme["courses"][4]["skills_learned"][-1]
