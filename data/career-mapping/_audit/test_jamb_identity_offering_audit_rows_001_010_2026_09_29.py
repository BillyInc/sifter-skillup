import json
from pathlib import Path


AUDIT_DIR = Path(__file__).resolve().parent
REPORT = AUDIT_DIR / "jamb_identity_offering_audit_rows_001_010_2026-09-29.json"


def test_rows_001_010_checkpoint_preserves_exact_occurrences_and_open_gaps():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = data["offering_occurrences"]

    assert [row["canonical_order"] for row in rows] == list(range(1, 11))
    assert len({row["occurrence_id"] for row in rows}) == 10
    assert all(row["official_url"].startswith("https://ibass.jamb.gov.ng/") for row in rows)
    assert all(row["source_faculty"] and row["locator"] for row in rows)

    by_order = {row["canonical_order"]: row for row in rows}
    assert by_order[1]["disposition"] == "unresolved"
    assert by_order[2]["disposition"] == "unresolved"
    assert by_order[3]["disposition"] == "unresolved"
    assert by_order[4]["disposition"] == "source_conflict"
    assert by_order[8]["disposition"] == "candidate"
    assert by_order[9]["disposition"] == "unresolved"

    same_name = data["same_name_contexts"][0]["contexts"]
    assert len(same_name) == 2
    assert {item["faculty"] for item in same_name} == {"Law", "Social/Management Sciences"}
    assert len({item["occurrence_id"] for item in same_name}) == 2
    assert data["coverage_summary"]["next_cursor"] == 11
    assert data["coverage_summary"]["fully_closed_rows"] == 0
