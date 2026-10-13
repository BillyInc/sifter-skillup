import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_024.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_024_closes_only_the_two_reconciled_occurrences():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    package = checkpoint["findings"][0]
    assert [row["ordinal"] for row in package["course_rows"]] == [45, 46]
    assert [row["code"] for row in package["course_rows"]] == ["GET 402", "GET 404"]
    assert checkpoint["prior_coverage_reconciliation"]["prior_increment_023_coverage_reconciled"] is True
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 49
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 0
    assert checkpoint["summary"]["next_cursor"] == {
        "package_index": 173,
        "programme": "RAILWAY ENGINEERING",
        "source_file": "engineering.json",
        "local_course_ordinal": 1,
        "course_code": "GST 111",
    }


def test_increment_024_keeps_the_hours_defect_and_source_title_conflict_distinct():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    get402, get404 = checkpoint["findings"][0]["course_rows"]
    assert get402["local_units_status_hours"] == "2; C; LH 90; PH null"
    assert get402["official_detail_units_status_hours"] == "2; C; PH 90"
    assert get402["field_dispositions"]["contact_hours"] == "confirmed_defect_labour_hours_populated_instead_of_practical_hours"
    assert get404["local_title"] == get404["official_table_title"]
    assert get404["official_table_title"] != get404["official_detail_title"]
    assert get404["disposition"] == "source_conflict_title_variation_preserved_no_local_title_change"


def test_increment_024_matches_exact_local_course_occurrences_without_editing_them():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert row["units"] == 2
        assert row["status"] == "C"
    get402 = programme["courses"][44]
    assert get402["lh"] == 90 and get402["ph"] is None
    assert len(get402["skills_learned"]) == 2
    get404 = programme["courses"][45]
    assert len(get404["skills_learned"]) == 6
