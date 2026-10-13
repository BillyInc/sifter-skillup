import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_050_accounting_gst312_detail.json"


def test_increment_050_pins_accounting_occurrence_and_keeps_shared_course_context_distinct():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["reconciliation_before_search"]["record_id"] == "administration_management.json::Accounting::0016"
    assert data["reconciliation_before_search"]["record_fingerprint_sha256"] == "67dbad5daee4c174eb31258fb517ea600018bb750ce0ffe93cc2be8845a09f73"
    assert "not merged" in data["reconciliation_before_search"]["exact_context_note"]


def test_increment_050_records_outcome_duplication_and_truncated_summary():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    fields = data["course_finding"]["field_findings"]

    assert fields["learning_outcomes"]["source_count"] == 5
    assert fields["learning_outcomes"]["local_count"] == 9
    assert fields["learning_outcomes"]["disposition"] == "confirmed_defect"
    assert "ends mid-sentence" in fields["content"]["comparison"]
    assert fields["content"]["disposition"] == "confirmed_defect"
    assert fields["units_status_hours"]["disposition"] == "carried_forward_without_recheck"


def test_increment_050_has_exact_source_provenance_and_scope_guards():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert "printed pp. 40-41" in data["source"]["locator"]
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
