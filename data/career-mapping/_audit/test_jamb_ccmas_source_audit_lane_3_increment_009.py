import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_009.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_009_records_source_proven_peE101_extraction_defect():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["findings"][0]
    row = finding["course_rows"][0]

    assert checkpoint["scope"]["ccmas_package_indices"] == [172, 172]
    assert checkpoint["scope"]["package"] == "PETROLEUM ENGINEERING"
    assert checkpoint["scope"]["local_course_count"] == 49
    assert checkpoint["scope"]["package_rows_remaining_for_source_adjudication"] == 48
    assert finding["package_status"] == "open_not_full_course_by_course_audit"
    assert row["code"] == "PEE 101"
    assert row["official_table_units_status_hours"] == "2; C; LH 15; PH 45"
    assert row["official_detail_units_status_hours"] == "2; C; LH 15; PH 45"
    assert row["local_units_status_hours"] == "2; C; LH null; PH null"
    assert row["disposition"] == "confirmed_defect"
    assert "content_summary truncated" in row["defect_fields"]
    assert "printed p. 1085" in " ".join(row["source_locators"])
    assert "printed pp. 1093–1094" in " ".join(row["source_locators"])


def test_lane_3_increment_009_describes_the_current_shared_record_without_editing_it():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    row = next(course for course in package["courses"] if course["code"] == "PEE 101")
    expected = checkpoint["findings"][0]["course_rows"][0]

    assert row["title"] == expected["local_title"]
    assert row["units"] == 2 and row["status"] == "C"
    assert row.get("lh") is None and row.get("ph") is None
    assert row["content_summary"] == expected["local_content_summary"]
    assert len(row["skills_learned"]) == expected["local_outcome_count"]


def test_lane_3_increment_009_keeps_petroleum_packages_separate():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    reconciliation = checkpoint["prior_coverage_reconciliation"]

    assert reconciliation["previous_increment_package"] == 171
    assert reconciliation["previous_increment_programme"] == "PETROLEUM AND GAS ENGINEERING"
    assert reconciliation["current_package_is_distinct"] is True
    assert reconciliation["prior_exact_package_172_peE101_source_checkpoint_found"] is False
