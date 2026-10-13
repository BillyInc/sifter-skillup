import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_029.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_029_advances_exactly_railway_rows_24_to_28():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [24, 25, 26, 27, 28]
    assert [row["code"] for row in rows] == ["GET 208", "GET 209", "GET 210", "GET 211", "RAE 201"]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 28
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 14
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "GET 299"


def test_increment_029_keeps_railway_offering_hours_conflict_unresolved():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    railway = rows[-1]
    assert railway["code"] == "RAE 201"
    assert railway["official_table_units_status_hours"] == "2; C; LH 30; PH not listed"
    assert railway["official_detail_units_status_hours"] == "3; C; LH 45; PH not listed"
    assert len(checkpoint["local_reconciliation_handoff"]["unresolved_source_conflicts"]) == 1


def test_increment_029_evidence_matches_current_local_course_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]

