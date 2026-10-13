import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_011_020_2026-09-29.json")


def test_rows_011_020_checkpoint_matches_current_occurrence_slice():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert [row["canonical_order"] for row in rows] == list(range(11, 21))
    assert len({row["occurrence_id"] for row in rows}) == 10
    assert all(row["official_url"].startswith("https://ibass.jamb.gov.ng/") for row in rows)
    assert all(row["coverage_reference"] and row["locator"] for row in rows)

    by_order = {row["canonical_order"]: row for row in rows}
    assert by_order[10 + 5]["disposition"] == "confirmed_defect"
    assert by_order[18]["disposition"] == "unresolved"
    assert by_order[19]["disposition"] == "candidate"
    assert by_order[20]["disposition"] == "unresolved"
    assert data["coverage_summary"]["next_cursor"] == 21
    assert data["coverage_summary"]["fully_closed_rows"] == 0
