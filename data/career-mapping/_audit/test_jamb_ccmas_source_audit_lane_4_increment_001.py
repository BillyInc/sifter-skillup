import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data" / "career-mapping" / "_audit" / "jamb_ccmas_source_audit_lane_4_2026-09-29_increment_001_law_conflicts.json"


def _load():
    return json.loads(CHECKPOINT.read_text(encoding="utf-8"))


def test_lane_four_checkpoint_is_append_only_and_scoped_to_law():
    data = _load()
    assert data["lane"] == 4
    assert data["increment"] == 1
    assert data["scope"]["ccmas_source_file"] == "law.json"
    assert data["scope"]["package_count"] == 1
    assert data["scope"]["course_occurrences_compared"] == 5
    assert data["shared_ledgers_edited"] is False
    assert data["generated_seed_or_sql_edited"] is False


def test_lane_four_records_have_exact_source_dispositions_and_next_cursor():
    data = _load()
    records = data["records"]
    assert [record["course_code"] for record in records] == [
        "ICL 101", "ICL 304", "ENT 211", "LAW 599", "ICL 301"
    ]
    assert len([r for r in records if r["disposition"] == "source_conflict"]) == 4
    assert records[-1]["disposition"] == "confirmed_match_with_locator_normalization"
    assert data["scope"]["next_cursor"].endswith("after:ICL 304")
    for record in records:
        assert record.get("table_locator")
        assert record.get("detail_locator")
        assert record["local_action"]
