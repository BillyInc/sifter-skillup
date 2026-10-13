import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_049_accounting_acc204_detail.json"


def test_increment_049_preserves_partition_and_exact_course_identity():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["partition"] == {"jamb_canonical_rows": [1, 140], "ccmas_package_indices": [1, 79]}
    assert data["reconciliation_before_search"]["record_id"] == "administration_management.json::Accounting::0014"
    assert data["reconciliation_before_search"]["record_fingerprint_sha256"] == "300a87419e1457b86dd4a9cff551d5d3ccb5bdf6cab52e6a409e3c5949b5d107"
    assert data["course_finding"]["course_code"] == "ACC 204"


def test_increment_049_does_not_repeat_closed_workload_or_neighbor_checks():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert "does not repeat the workload check" in data["reconciliation_before_search"]["already_closed_field"]
    assert len(data["reconciliation_before_search"]["already_closed_neighbors_skipped"]) == 2
    assert data["progress"]["prior_workload_checks_repeated"] == 0
    assert data["course_finding"]["field_findings"]["units_status_hours"]["disposition"] == "carried_forward_without_recheck"


def test_increment_049_records_authoritative_outcome_discrepancy_and_provenance():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = data["course_finding"]["field_findings"]

    assert data["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert data["source"]["accessed_on"] == "2026-09-29"
    assert finding["learning_outcomes"]["source_count"] == 9
    assert finding["learning_outcomes"]["local_count"] == 5
    assert finding["learning_outcomes"]["disposition"] == "confirmed_defect"
    assert finding["content"]["disposition"] == "confirmed_match"
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
