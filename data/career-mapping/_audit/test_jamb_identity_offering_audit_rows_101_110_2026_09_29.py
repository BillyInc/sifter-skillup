import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_101_110_2026-09-29.json")


def test_rows_101_110_preserves_faculty_occurrences_and_parse_spill():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert len(rows) == 13
    assert {row["canonical_order"] for row in rows} == set(range(101, 111))
    assert sum(row["canonical_order"] == 101 for row in rows) == 2
    assert sum(row["canonical_order"] == 108 for row in rows) == 2
    assert sum(row["canonical_order"] == 109 for row in rows) == 2

    engineering_cs = next(row for row in rows if row["canonical_order"] == 101 and row["source_faculty"].startswith("Engineering"))
    assert engineering_cs["disposition"] == "confirmed_defect"
    assert "CYBER SECURITY SCIENCE" in engineering_cs["locator"]
    assert data["additional_source_contexts"][0]["source_title"] == "Cyber Security Science"
    assert data["coverage_summary"]["next_cursor"] == 111
