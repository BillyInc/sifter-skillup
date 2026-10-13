import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_052_accounting_acc302_detail.json"


def test_increment_052_pins_acc302_and_carries_forward_closed_workload_check():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["reconciliation_before_search"]["record_id"] == "administration_management.json::Accounting::0019"
    assert data["reconciliation_before_search"]["record_fingerprint_sha256"] == "ff8b4f29b271d4bbbfc6eeb4785ab8468a26c184339588480def66fe15322896"
    assert "without recheck" in data["reconciliation_before_search"]["already_closed_field"]
    assert data["progress"]["prior_workload_checks_repeated"] == 0


def test_increment_052_confirms_detailed_outcomes_and_content():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    fields = data["course_finding"]["field_findings"]

    assert fields["learning_outcomes"]["source_count"] == 10
    assert fields["learning_outcomes"]["local_count"] == 10
    assert fields["learning_outcomes"]["disposition"] == "confirmed_match"
    assert fields["content"]["disposition"] == "confirmed_match"
    assert fields["units_status_hours"]["disposition"] == "carried_forward_without_recheck"


def test_increment_052_retains_exact_official_source_and_scope_guards():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert "printed p. 42" in data["source"]["locator"]
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
