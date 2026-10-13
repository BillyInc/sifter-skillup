import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_021_030_2026-09-29.json")


def test_rows_021_030_keeps_occurrences_and_missing_faculty_contexts_distinct():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert len(rows) == 12
    assert {row["canonical_order"] for row in rows} == set(range(21, 31))
    assert len({row["occurrence_id"] for row in rows}) == 12
    assert all(row["coverage_reference"] and row["locator"] for row in rows)

    international_relations = [row for row in rows if row["canonical_order"] == 21]
    assert {row["source_faculty"] for row in international_relations} == {"Administration", "Social/Management Sciences"}
    assert len(data["additional_source_contexts"]) == 4
    assert {row["canonical_order"] for row in data["additional_source_contexts"] if row["disposition"] == "confirmed_defect"} == {25, 26, 28}
    assert data["coverage_summary"]["next_cursor"] == 31
    assert data["coverage_summary"]["fully_closed_rows"] == 0
