import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_071_080_2026-09-29.json")


def test_rows_071_080_preserves_dual_faculty_and_missing_engineering_context():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert len(rows) == 11
    assert {row["canonical_order"] for row in rows} == set(range(71, 81))
    assert sum(row["canonical_order"] == 72 for row in rows) == 2
    logistics = next(row for row in rows if row["canonical_order"] == 74)
    assert logistics["disposition"] == "confirmed_defect"
    assert data["additional_source_contexts"][0]["canonical_order"] == 74
    assert data["additional_source_contexts"][0]["source_faculty"] == "Engineering/Environmental/Technology"
    assert data["coverage_summary"]["next_cursor"] == 81
