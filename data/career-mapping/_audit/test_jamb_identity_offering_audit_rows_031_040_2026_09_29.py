import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_031_040_2026-09-29.json")


def test_rows_031_040_checkpoint_preserves_source_spelling_and_context_gap():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]
    assert [row["canonical_order"] for row in rows] == list(range(31, 41))
    assert len({row["occurrence_id"] for row in rows}) == 10
    assert all(row["coverage_reference"] and row["official_url"] for row in rows)

    typo = next(row for row in rows if row["canonical_order"] == 34)
    assert "INTERNTIONAL" in typo["locator"]
    assert typo["disposition"] == "source_conflict"
    assert data["additional_source_contexts"][0]["canonical_order"] == 40
    assert data["coverage_summary"]["next_cursor"] == 41
    assert data["coverage_summary"]["fully_closed_rows"] == 0
