import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_006.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_006_records_source_backed_pge171_findings_without_claiming_closure():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["lane"] == 3
    assert checkpoint["scope"]["ccmas_package_indices"] == [171, 171]
    assert checkpoint["scope"]["full_packages_completed"] == 0
    assert checkpoint["source"]["url"].endswith("Engineering-Technology-CCMAS-2023-FINAL.pdf")

    package = checkpoint["findings"][0]
    assert package["package_index"] == 171
    assert package["local_course_count"] == 51
    assert package["package_status"] == "open_not_full_course_by_course_audit"
    assert package["package_rows_remaining_for_source_adjudication"] == 49

    rows = {row["code"]: row for row in package["course_rows"]}
    assert rows["GET 102"]["disposition"] == "source_conflict"
    assert "Solid Mechanics I" in rows["GET 102"]["official_table_title"]
    assert "Solid Modelling I" in rows["GET 102"]["official_detailed_course_title"]
    assert rows["PGE 101"]["disposition"] == "table_metadata_and_content_repaired; title_and_hour_source_variations_preserved"
    assert rows["PGE 101"]["official_units_status_hours"] == "2; C; LH 15; PH 45"
    assert rows["PGE 101"]["local_title_at_audit"] == "Introduction to Petroleum and Gas Industry with Field 15 45 Trip"
    assert rows["PGE 101"]["current_local_title"] == "Introduction to Petroleum and Gas Industry with Field Trip"
    assert "LH 15" in rows["PGE 101"]["rationale"] and "LH 30" in rows["PGE 101"]["rationale"]
    assert rows["PGE 101"]["outcomes_match"] is True


def test_lane_3_increment_006_observations_still_match_current_source_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(item for item in source["programmes"] if item["name"] == "PETROLEUM AND GAS ENGINEERING")
    courses = {item["code"]: item for item in package["courses"]}

    assert source["source_file"] == "CCMAS_Engineering_COMBINED.md"
    assert len(courses) == checkpoint["findings"][0]["local_course_count"]
    assert courses["GET 102"]["title"] == "Engineering Graphics and Solid Mechanics I"
    assert courses["GET 102"]["units"] == 2
    assert courses["GET 102"]["lh"] == 15
    assert courses["GET 102"]["ph"] == 45
    assert courses["PGE 101"]["title"] == checkpoint["findings"][0]["course_rows"][1]["current_local_title"]
    assert courses["PGE 101"]["lh"] == 15
    assert courses["PGE 101"]["ph"] == 45
