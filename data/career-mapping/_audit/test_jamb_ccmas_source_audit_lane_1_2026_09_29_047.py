import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_047_accounting_acc201_detail.json"


def test_increment_047_reuses_closed_workload_evidence_without_rechecking_it():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    prior = data["reconciliation_before_search"]["already_closed_field"]

    assert "does not recheck or recount workload" in prior
    assert data["course_finding"]["field_findings"]["units_status_hours"]["disposition"] == "carried_forward_without_recheck"
    assert data["progress"]["prior_workload_checks_repeated"] == 0
    assert data["course_finding"]["increment_disposition"].startswith("confirmed_match_for_new_content")


def test_increment_047_pins_content_and_outcome_result_to_exact_record():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = data["course_finding"]

    assert data["reconciliation_before_search"]["course_ordinal"] == 11
    assert row["course_code"] == "ACC 201"
    assert row["field_findings"]["learning_outcomes"]["source_count"] == 8
    assert row["field_findings"]["learning_outcomes"]["disposition"] == "confirmed_match"
    assert row["field_findings"]["content"]["disposition"] == "confirmed_match"
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
