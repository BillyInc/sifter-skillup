import json
from pathlib import Path


REPORT = Path(__file__).with_name("jamb_identity_offering_audit_rows_061_070_2026-09-29.json")


def test_rows_061_070_preserves_both_actuarial_faculty_cells():
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    rows = [row for row in data["offering_occurrences"] if row["canonical_order"] == 64]
    assert len(data["offering_occurrences"]) == 11
    assert {row["source_faculty"] for row in rows} == {"Administration", "Social/Management Sciences"}
    admin = next(row for row in rows if row["source_faculty"] == "Administration")
    social = next(row for row in rows if row["source_faculty"] == "Social/Management Sciences")
    assert "RHEMA" in admin["local_awarder_codes"]
    assert "RHEMA" not in admin["locator"]
    assert social["occurrence_id"] is None
    assert "PC-UNI" in social["locator"]
    assert data["coverage_summary"]["next_cursor"] == 71
