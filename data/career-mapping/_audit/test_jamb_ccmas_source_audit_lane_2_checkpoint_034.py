import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_034.json"


def test_checkpoint_034_closes_package_on_source_and_advances_to_jamb_row_144():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["progress"]["local_course_rows_audited_in_package"] == 41
    assert checkpoint["progress"]["source_course_blocks_accounted_for"] == 42
    assert checkpoint["progress"]["package_080_source_audit_complete"] is True
    assert checkpoint["progress"]["confirmed_missing_source_course_rows"] == 1
    assert checkpoint["progress"]["next_cursor"].startswith("JAMB identity row 144")


def test_checkpoint_034_records_the_pre_repair_gap_and_current_data_contains_repair():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = {course["code"]: course for course in package["courses"]}
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["progress"]["local_course_rows_audited_in_package"] == 41
    assert len(package["courses"]) == 42
    assert "GER 406" in rows and "GER 407" in rows
    assert len(rows["GER 406"]["skills_learned"]) == 6
    assert "GER 407" not in rows["GER 406"]["content_summary"]
    assert rows["GER 407"]["ph"] == 270


def test_checkpoint_034_requires_separating_ger407_instead_of_discarding_it():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    missing = checkpoint["course_decisions"][1]
    assert missing["source_only_code"] == "GER 407"
    assert "6 Units C, PH 270" in missing["metadata"]
    assert "three source outcomes" in missing["outcomes"].lower()
    assert "own row" in missing["repair_pointer"]
