import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_002_accounting.json"
ACTUARIAL = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_003_actuarial.json"
ACCOUNTING_FINANCE = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_004_accounting_finance_context.json"
JAMB_QUEUE = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_005_jamb_occurrence_reconciliation.json"
AVIATION = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_006_aviation_avm404.json"
FINANCE = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_007_finance_fin101.json"


def test_accounting_package_contact_hour_findings_are_source_scoped():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["ccmas_package_index"] == 1
    assert evidence["scope"]["local_course_rows"] == 31
    defects = [row for row in evidence["field_findings"] if row["classification"] == "confirmed_defect"]
    assert len(defects) == 18
    assert {row["course_code"] for row in defects} == {
        "ACC 201", "ACC 202", "ACC 203", "ACC 204", "ACC 206",
        "ACC 301", "ACC 302", "ACC 303", "ACC 305", "ACC 306", "ACC 307", "ACC 308", "ACC 311",
        "ACC 401", "ACC 402", "ACC 403", "ACC 404", "ACC 405",
    }
    conflict = [row for row in evidence["field_findings"] if row["classification"] == "source_conflict"]
    assert len(conflict) == 1
    assert conflict[0]["course_code"] == "ACC 101"
    assert conflict[0]["source_global_table"]["practical_hours"] != conflict[0]["source_detailed_block"]["practical_hours"]
    outcome_defects = [row for row in evidence["course_detail_findings"] if row["classification"] == "confirmed_defect"]
    assert {row["course_code"] for row in outcome_defects} == {"ACC 101", "ACC 102", "ACC 203", "ACC 206"}
    assert "Compare all 31 detailed course contents" in evidence["remaining"]["items"][0]
    assert evidence["no_product_edits"] is True


def test_actuarial_acs311_hours_discrepancy_is_explicit_and_package_stays_open():
    evidence = json.loads(ACTUARIAL.read_text(encoding="utf-8"))
    finding = evidence["findings"][0]
    assert finding["course_code"] == "ACS 311"
    assert finding["source_fields"]["lecture_hours"] == 15
    assert finding["local_fields"]["lecture_hours"] == 30
    assert finding["classification"] == "confirmed_defect"
    assert evidence["package_status"]["completion_credit"] is False


def test_accounting_finance_preserves_both_offering_contexts_and_both_ccmas_components():
    evidence = json.loads(ACCOUNTING_FINANCE.read_text(encoding="utf-8"))
    contexts = evidence["jamb_source_contexts"]
    assert {(row["source_faculty"], row["awarder"]) for row in contexts} == {
        ("Administration", "BCU"),
        ("Social/Management Sciences", "FEDOTUOKE"),
    }
    assert len(set(row["occurrence_id"] for row in contexts)) == 2
    assert evidence["curriculum_scope"]["selected_courses_by_component"]["Accounting"]["count"] == 31
    assert evidence["curriculum_scope"]["selected_courses_by_component"]["Finance / Banking and Finance"]["count"] == 34
    assert evidence["curriculum_scope"]["scope_status"] == "combined_scope_review_required"
    assert evidence["curriculum_scope"]["domain_links_approved"] == []


def test_lane_one_jamb_reconciliation_carries_all_occurrences_and_orphan_without_false_closure():
    evidence = json.loads(JAMB_QUEUE.read_text(encoding="utf-8"))
    assert evidence["scope"]["canonical_identities"] == 140
    assert evidence["scope"]["canonical_linked_occurrences"] == 150
    assert evidence["scope"]["orphan_occurrences_assigned_to_lane"] == 1
    all_occurrences = [
        occurrence
        for identity in evidence["identities"]
        for occurrence in identity["source_occurrences"]
    ]
    assert len(all_occurrences) == 150
    assert all(
        row["source_disposition_in_this_lane"]
        in {
            "prior_checkpoint_join_required",
            "existing_pdf_flag_locator_requires_source_pointer_audit",
            "confirmed_match_carried_forward",
        }
        for row in all_occurrences
    )
    carried = [row for row in all_occurrences if row["source_disposition_in_this_lane"] == "confirmed_match_carried_forward"]
    assert {row["occurrence_id"] for row in carried} == {"a5edd843e2f91232", "edb439100ecfa68a"}
    assert evidence["orphan_source_occurrences"][0]["source_title"] == "Sociology and Anthropology"
    assert evidence["status"] == "coverage_reconciled_source_adjudication_open"


def test_avm404_empty_outcomes_are_source_consistent_but_summary_truncated():
    evidence = json.loads(AVIATION.read_text(encoding="utf-8"))
    assert evidence["comparison"]["learning_outcomes"]["classification"] == "confirmed_match"
    assert evidence["comparison"]["learning_outcomes"]["local_value"] == []
    assert evidence["comparison"]["content_summary"]["classification"] == "confirmed_defect"
    assert evidence["package_completion_credit"] is False


def test_fin101_matches_source_but_retains_provenance_gap_and_open_package():
    evidence = json.loads(FINANCE.read_text(encoding="utf-8"))
    assert evidence["comparison"]["identity"]["classification"] == "confirmed_match"
    assert evidence["comparison"]["course_load"]["classification"] == "confirmed_match"
    assert evidence["comparison"]["learning_outcomes"]["source_count"] == 8
    assert evidence["comparison"]["learning_outcomes"]["classification"] == "confirmed_match"
    assert evidence["comparison"]["item_level_provenance"]["classification"] == "confirmed_provenance_gap"
    assert evidence["package_completion_credit"] is False
