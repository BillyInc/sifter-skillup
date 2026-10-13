import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_046_accounting_rows_006_009_010.json"


def test_increment_046_only_adds_uncovered_accounting_course_rows():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = data["course_findings"]

    assert [row["course_ordinal"] for row in rows] == [6, 9, 10]
    assert [row["course_code"] for row in rows] == ["AMS 104", "GST 212", "ENT 211"]
    assert all(row["record_fingerprint_sha256"] for row in rows)
    assert "7 and 8" in data["reconciliation_before_search"]["coverage_decision"]
    assert "without repeating" in data["progress"]["next_cursor"]["ccmas"]


def test_increment_046_records_source_specific_field_dispositions():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    by_code = {row["course_code"]: row for row in data["course_findings"]}

    assert by_code["AMS 104"]["overall_disposition"] == "candidate"
    assert by_code["GST 212"]["field_findings"]["outcomes"]["disposition"] == "confirmed_defect"
    assert by_code["ENT 211"]["field_findings"]["outcomes"]["disposition"] == "confirmed_match"
    assert by_code["ENT 211"]["field_findings"]["content"]["disposition"] == "confirmed_defect"
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
