import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_041_050_2026-09-29.json")


def test_rows_041_050_checkpoint_keeps_duplicate_faculties_and_orphan_spelling():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert len(rows) == 12  # 11 linked rows plus the assigned orphan spelling
    assert {row["canonical_order"] for row in rows} == set(range(41, 51))
    assert sum(row["canonical_order"] == 45 for row in rows) == 2
    assert sum(row["canonical_order"] == 46 for row in rows) == 2

    orphan = next(row for row in rows if row["canonical_order"] == 50)
    assert orphan["occurrence_id"] is None
    assert orphan["canonical_name"] != orphan["source_title"]
    assert orphan["disposition"] == "source_conflict"
    assert {row["canonical_order"] for row in data["additional_source_contexts"]} == {47, 50}
    assert data["coverage_summary"]["next_cursor"] == 51
