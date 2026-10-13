import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_019.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_019_records_next_unreviewed_package_rows_and_conflict():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["findings"][0]
    rows = finding["course_rows"]
    assert [row["ordinal"] for row in rows] == [17, 18, 19, 20]
    assert [row["code"] for row in rows] == ["GST 212", "ENT 211", "GET 201", "GET 202"]
    assert rows[2]["field_dispositions"]["official_workload"] == "unresolved_source_conflict_between_programme_table_and_detailed_block"
    assert checkpoint["summary"]["next_cursor"] == {"package_index": 172, "local_course_ordinal": 21, "course_code": "GET 204"}
    assert finding["package_row_occurrences_remaining_for_source_adjudication"] == 16


def test_increment_019_findings_match_current_source_records_without_editing_them():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    local = programme["courses"]
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = local[evidence["ordinal"] - 1]
        assert row["code"].replace(" ", "") == evidence["code"].replace(" ", "")
        assert row["title"] == evidence["local_title"]
    assert local[18]["units"] is None and local[18]["lh"] is None and local[18]["ph"] is None
    assert len(local[16]["skills_learned"]) == 8
    assert len(local[17]["skills_learned"]) == 8
    assert len(local[19]["skills_learned"]) == 8
