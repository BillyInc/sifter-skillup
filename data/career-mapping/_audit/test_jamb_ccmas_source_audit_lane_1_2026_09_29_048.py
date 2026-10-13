import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_048_accounting_acc202_detail.json"


def test_increment_048_compares_only_uncovered_acc202_detail_fields():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert data["reconciliation_before_search"]["course_ordinal"] == 12
    assert data["course_finding"]["course_code"] == "ACC 202"
    assert "does not recheck workload" in data["reconciliation_before_search"]["already_closed_field"]
    assert data["reconciliation_before_search"]["next_code_skipped"].startswith("ACC 203")
    assert data["course_finding"]["field_findings"]["units_status_hours"]["disposition"] == "carried_forward_without_recheck"


def test_increment_048_records_exact_source_and_match_result():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = data["course_finding"]
    assert row["field_findings"]["learning_outcomes"]["source_count"] == 7
    assert row["field_findings"]["learning_outcomes"]["disposition"] == "confirmed_match"
    assert row["field_findings"]["content"]["disposition"] == "confirmed_match"
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert data["progress"]["shared_ledgers_edited"] is False
