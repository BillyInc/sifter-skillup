import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data" / "career-mapping" / "_audit" / "jamb_ccmas_source_audit_lane_4_2026-09-29_increment_002_law_400_level.json"


def _load():
    return json.loads(CHECKPOINT.read_text(encoding="utf-8"))


def test_lane_four_increment_two_is_append_only_and_has_correct_denominator():
    data = _load()
    scope = data["scope"]
    assert data["lane"] == 4
    assert data["increment"] == 2
    assert scope["ccmas_source_file"] == "law.json"
    assert scope["package_count"] == 1
    assert scope["package_course_occurrences"] == 145
    assert scope["course_ordinals_compared"] == [30, 31, 32, 33, 34]
    assert scope["course_occurrences_compared_in_lane_4"] == 10
    assert scope["remaining_course_occurrences_in_lane_4"] == 135
    assert data["shared_ledgers_edited"] is False
    assert data["generated_seed_or_sql_edited"] is False
    assert data["ui_edited"] is False


def test_lane_four_increment_two_records_each_source_locator_and_cursor():
    data = _load()
    records = data["records"]
    assert [record["course_code"] for record in records] == [
        "PUL 401", "PUL 402", "PPL 403", "PPL 404", "PPL 405"
    ]
    assert all(record["table_locator"] and record["detail_locator"] for record in records)
    assert all(record["disposition"] == "confirmed_defect" for record in records)
    assert data["scope"]["next_cursor"].endswith("after:PPL 405")
    assert all(record["local_action"] for record in records)
