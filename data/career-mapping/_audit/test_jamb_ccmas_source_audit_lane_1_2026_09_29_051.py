import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_051_accounting_ent312_detail.json"


def test_increment_051_pins_exact_accounting_course_occurrence_and_reconciles_neighbors():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["reconciliation_before_search"]["record_id"] == "administration_management.json::Accounting::0017"
    assert data["reconciliation_before_search"]["record_fingerprint_sha256"] == "d1f7503d14146eb7486fd07ba2ce9460111d9b2e6c29b544329b38a03b5933cd"
    assert len(data["reconciliation_before_search"]["already_closed_neighbors_skipped"]) == 2
    assert data["progress"]["prior_source_checks_repeated"] == 0


def test_increment_051_confirms_load_and_source_backed_outcome_content_defects():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    fields = data["course_finding"]["field_findings"]

    assert fields["units_status_hours"]["source"] == fields["units_status_hours"]["local"]
    assert fields["units_status_hours"]["disposition"] == "confirmed_match"
    assert fields["learning_outcomes"]["source_count"] == 9
    assert fields["learning_outcomes"]["local_count"] == 10
    assert fields["learning_outcomes"]["disposition"] == "confirmed_defect"
    assert fields["content"]["disposition"] == "confirmed_defect"


def test_increment_051_records_authoritative_source_and_scope_guards():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert "printed pp. 40-42" in data["source"]["locators"][1]
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
