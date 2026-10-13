import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_091_100_2026-09-29.json")


def test_rows_091_100_keeps_adjacent_aviation_offerings_distinct():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert [row["canonical_order"] for row in rows] == list(range(91, 101))
    assert len({row["occurrence_id"] for row in rows}) == 10
    aviation = [row for row in rows if row["canonical_order"] in {95, 96}]
    assert [row["source_title"] for row in aviation] == ["Aviation Management", "Aviation Security"]
    assert all(row["local_awarder_codes"] == ["AZMAN"] for row in aviation)
    assert data["coverage_summary"]["next_cursor"] == 101
