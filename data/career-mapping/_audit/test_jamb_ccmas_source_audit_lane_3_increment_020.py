import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_020.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_020_advances_exact_cursor_and_keeps_title_variant():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [21, 22, 23, 24]
    assert [row["code"] for row in rows] == ["GET 204", "GET 205", "GET 206", "GET 209"]
    assert rows[2]["official_detail_title"] == "Fundamentals of Engineering Thermodynamics"
    assert checkpoint["summary"]["next_cursor"] == {"package_index": 172, "local_course_ordinal": 25, "course_code": "GET 210"}
    assert checkpoint["findings"][0]["package_row_occurrences_remaining_for_source_adjudication"] == 12


def test_increment_020_matches_local_rows_and_records_reconciliation_handoff():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"].replace(" ", "") == evidence["code"].replace(" ", "")
        assert row["title"] == evidence["local_title"]
    assert checkpoint["local_reconciliation_handoff"]["finding_ordinals"] == [21, 22, 23, 24]
    assert checkpoint["local_reconciliation_handoff"]["handoff_status"] == "findings_recorded_for_local_reconciliation"
