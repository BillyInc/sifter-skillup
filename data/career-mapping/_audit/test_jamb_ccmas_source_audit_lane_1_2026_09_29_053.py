import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_053_accounting_acc305_detail.json"


def test_increment_053_pins_acc305_and_reuses_prior_workload_evidence():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["reconciliation_before_search"]["record_id"] == "administration_management.json::Accounting::0021"
    assert data["reconciliation_before_search"]["record_fingerprint_sha256"] == "4ad18aeb3f26c0b0a7fca2ddc9597119634ee213e1ec331e9f0846704e384a8c"
    assert "without recheck" in data["reconciliation_before_search"]["already_closed_field"]
    assert data["progress"]["prior_workload_checks_repeated"] == 0


def test_increment_053_distinguishes_course_outcomes_from_auxiliary_mismatched_field():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    fields = data["course_finding"]["field_findings"]

    assert fields["learning_outcomes"]["source_count"] == 3
    assert fields["learning_outcomes"]["disposition"] == "confirmed_match"
    assert fields["content"]["disposition"] == "confirmed_match"
    assert fields["skills_learned_auxiliary_field"]["disposition"] == "confirmed_defect"
    assert fields["units_status_hours"]["disposition"] == "carried_forward_without_recheck"


def test_increment_053_pins_authoritative_provenance_and_scope():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert "printed pp. 43-44" in data["source"]["locators"][1]
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
