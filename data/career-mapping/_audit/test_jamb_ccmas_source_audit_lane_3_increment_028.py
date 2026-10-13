import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_028.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_028_covers_only_the_next_eight_railway_occurrences():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == list(range(16, 24))
    assert [row["code"] for row in rows] == [
        "ENT 211", "GST 212", "GET 201", "GET 202", "GET 203", "GET 204", "GET 205", "GET 206"
    ]
    assert checkpoint["scope"]["unique_course_occurrences_source_compared_after_this_increment"] == 23
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 19
    assert checkpoint["summary"]["next_cursor"]["course_code"] == "GET 208"


def test_increment_028_preserves_proven_field_corruption_and_hours_conflicts():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    by_ordinal = {row["ordinal"]: row for row in rows}
    assert "field_boundary" in by_ordinal[17]["disposition"]
    assert "continues after the complete outcome" in by_ordinal[17]["structural_conflict"]
    assert by_ordinal[20]["local_units_status_hours"] == "units null; status C; LH null; PH null"
    assert len(checkpoint["local_reconciliation_handoff"]["unresolved_source_conflicts"]) == 3
    assert by_ordinal[22]["disposition"] == "confirmed_match"


def test_increment_028_matches_current_local_occurrences_without_mutating_them():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"] == evidence["code"]
        assert row["title"] == evidence["local_title"]
        assert len(row["skills_learned"]) == evidence["local_learning_outcome_count"]
    assert len(programme["courses"][19]["title"]) > 40
