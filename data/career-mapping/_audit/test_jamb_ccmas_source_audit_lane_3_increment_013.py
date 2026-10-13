import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_013.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_013_records_new_rows_and_source_conflict():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["findings"][0]
    rows = {row["code"]: row for row in finding["course_rows"]}

    assert checkpoint["scope"]["ccmas_package_indices"] == [172, 172]
    assert checkpoint["scope"]["cumulative_course_row_occurrences_source_compared_in_package"] == 14
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 35
    assert set(rows) == {"PEE 312", "PEE 313", "PEE 401", "PEE 405"}
    assert rows["PEE 312"]["disposition"] == "source_conflict"
    assert rows["PEE 312"]["official_table_units_status_hours"].endswith("PH 90")
    assert rows["PEE 312"]["official_detail_units_status_hours"].endswith("PH 45")
    for code in ("PEE 313", "PEE 401", "PEE 405"):
        assert rows[code]["disposition"] == "confirmed_defect"


def test_lane_3_increment_013_matches_current_shared_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    local = {row["code"]: row for row in package["courses"]}
    evidence = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}

    for code in ("PEE 312", "PEE 313", "PEE 401", "PEE 405"):
        assert local[code]["title"] == evidence[code]["local_title"]
        assert local[code]["units"] == int(evidence[code]["local_units_status_hours"].split(";")[0])
        assert len(local[code]["skills_learned"]) == evidence[code]["local_outcome_count"]
    assert local["PEE 312"]["ph"] == 90
    assert local["PEE 313"]["content_summary"].endswith("prospecting and petroleum exploration.")
    assert local["PEE 401"]["content_summary"].startswith("Nigerian and global business environments")
    assert local["PEE 405"]["content_summary"].endswith("recent advances in logging and interpretation.")
    for code in ("PEE 313", "PEE 401", "PEE 405"):
        assert local[code]["source_accessed_on"] == "2026-09-29"
