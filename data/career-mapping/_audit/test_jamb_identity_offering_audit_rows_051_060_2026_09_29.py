import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_051_060_2026-09-29.json")


def test_rows_051_060_uses_current_baseline_and_tracks_missing_context():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert [row["canonical_order"] for row in rows] == list(range(51, 61))
    assert len({row["occurrence_id"] for row in rows}) == 10
    assert len(data["additional_source_contexts"]) == 1
    assert data["additional_source_contexts"][0]["canonical_order"] == 59

    hotel = next(row for row in rows if row["canonical_order"] == 60)
    assert hotel["local_awarder_codes"] == ["NOUN", "WESTERN-DEL"]
    assert data["historical_checkpoint_differences"][0]["canonical_order"] == 60
    assert data["coverage_summary"]["next_cursor"] == 61
