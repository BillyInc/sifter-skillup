import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_081_090_2026-09-29.json")


def test_rows_081_090_source_verified_cells_and_current_cursor():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert [row["canonical_order"] for row in rows] == list(range(81, 91))
    assert len({row["occurrence_id"] for row in rows}) == 10
    assert all(row["official_url"].startswith("https://ibass.jamb.gov.ng/") for row in rows)
    assert sum(row["disposition"] == "confirmed_match" for row in rows) == 5
    assert next(row for row in rows if row["canonical_order"] == 84)["disposition"] == "confirmed_defect"
    assert data["coverage_summary"]["next_cursor"] == 91
