import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_045_accounting_rows_001-005.json"


def test_increment_045_covers_only_unadjudicated_accounting_rows():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = data["course_findings"]

    assert [row["course_ordinal"] for row in rows] == [1, 2, 3, 4, 5]
    assert [row["course_code"] for row in rows] == ["GST 111", "GST 112", "AMS 101", "AMS 102", "AMS 103"]
    assert all(row["package_index"] == 1 and row["programme"] == "Accounting" for row in rows)
    assert all(row["record_fingerprint_sha256"] for row in rows)
    assert data["reconciliation_before_search"]["not_repeated"] == [
        "Accounting global 31-course count",
        "ACC 490 (course ordinal 31)",
    ]


def test_increment_045_preserves_source_conflicts_and_course_level_findings():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    by_code = {row["course_code"]: row for row in data["course_findings"]}

    assert by_code["GST 111"]["field_findings"]["title"]["disposition"] == "source_conflict"
    assert by_code["GST 112"]["field_findings"]["title"]["disposition"] == "source_conflict"
    assert by_code["AMS 103"]["field_findings"]["title"]["disposition"] == "confirmed_defect"
    assert all(
        row["field_findings"]["units_status_hours"]["disposition"] == "confirmed_match"
        for row in data["course_findings"]
    )
    assert all(row["field_findings"]["content"]["disposition"] == "confirmed_defect" for row in data["course_findings"])
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert data["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
