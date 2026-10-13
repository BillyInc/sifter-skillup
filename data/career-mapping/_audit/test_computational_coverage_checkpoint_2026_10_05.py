import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REPORT = json.loads((AUDIT / "computational_coverage_checkpoint_2026_10_05.json").read_text(encoding="utf-8"))
SOURCE_REVIEW = json.loads((AUDIT / "computational_external_source_review_2026_10_05.json").read_text(encoding="utf-8"))


def test_exact_full_catalogue_partition_and_taxonomy_layer_counts():
    counts = REPORT["counts"]
    assert counts["catalogue_domains"] == counts["raw_scan_domains"] == 168
    assert counts["triage_partition_total"] == 168
    assert counts["triaged_candidate_domains"] == 107
    assert counts["triage_no_specific_signal_domains"] == 61
    assert counts["triage_method_or_role_task_signal_domains"] == 73
    assert counts["method_signal_domains_already_in_declared_layer_set"] == 31
    assert counts["method_signal_domains_outside_declared_layer_set"] == 42
    assert counts["method_signal_domains_with_direct_and_role_task_signals"] == 21
    assert counts["method_signal_domains_with_role_task_only"] == 52
    assert counts["base_domain_subgroup_records_scanned"] == 557
    assert counts["emerging_subgroup_layer_records_scanned"] == 76


def test_candidate_scan_layers_are_distinguished_and_no_isco_inference_is_claimed():
    assert REPORT["raw_hit_source_types"] == {
        "domain": 24,
        "domain_layer": 17,
        "emerging_subgroup": 28,
        "role_occupational_competencies": 877,
        "role_tasks": 459,
        "subgroup": 82,
    }
    assert REPORT["counts"]["unique_role_task_candidate_rows"] == 325
    assert REPORT["counts"]["role_task_signal_domains"] == 74
    assert "not treated as student-facing areas" in REPORT["interpretation"]["subgroups"]


def test_explicit_role_method_link_report_is_exact_and_conservative():
    counts = REPORT["counts"]
    assert counts["declared_computational_method_group_records"] == 39
    assert counts["coverage_audit_roles_in_declared_domains"] == 620
    assert counts["explicit_role_method_links_only"] == 4
    assert counts["manifest_groups_without_explicit_role_method_link"] == 38
    assert counts["invalid_explicit_role_links"] == 0
    assert counts["manifest_groups_missing_source_layer"] == 0


def test_external_sources_are_located_claim_bounded_and_cover_all_review_candidates():
    sources = {row["source_id"]: row for row in SOURCE_REVIEW["sources"]}
    assert len(sources) == 12
    for source in sources.values():
        assert source["url"].startswith("https://")
        assert source["locator"]
        assert source["supports"]
        assert source["does_not_support"]

    candidate_rows = SOURCE_REVIEW["candidate_dispositions"]
    assert len(candidate_rows) == 7
    assert {row["candidate_id"] for row in candidate_rows} == {
        "D065_COMPUTATIONAL_LINGUISTICS",
        "D041_COMPUTATIONAL_SCIENCE_AND_ENGINEERING",
        "PHYSICS_RESEARCH_METHODS",
        "COMPUTATIONAL_CHEMISTRY_AND_BIOLOGY",
        "CFD_AND_COMPUTATIONAL_MECHANICS",
        "D078_COMPUTATIONAL_SOCIAL_RESEARCH",
        "D145_COMPUTATIONAL_NEUROSCIENCE_METHODS",
    }
    assert all(row["disposition"] and row["next_action"] for row in candidate_rows)
    assert "No new role title is proposed" in SOURCE_REVIEW["limits"][-1]


def test_d065_external_field_recognition_does_not_claim_local_domain_fit_or_invent_role():
    row = next(row for row in SOURCE_REVIEW["candidate_dispositions"] if row["candidate_id"] == "D065_COMPUTATIONAL_LINGUISTICS")
    assert row["disposition"] == "recognized_global_field_candidate_local_parent_and_role_fit_unproven"
    assert "generic ISCO" in row["deterministic_local_evidence"]
    assert "Do not create an NLP occupation" in row["next_action"]


def test_d057_d084_reconciliation_has_no_missing_review_files_and_no_role_specialization_links():
    report = json.loads((AUDIT / "specialization_lanes_2026_10_05/D057_D091/d057_d084_slice_reconciliation_018.json").read_text(encoding="utf-8"))
    assert report["counts"]["review_files_expected"] == 28
    assert report["counts"]["review_files_found"] == 28
    assert report["counts"]["review_files_missing"] == 0
    assert report["counts"]["candidate_specialization_rows"] == 114
    assert report["counts"]["domains_present_in_shared_register_exact_match"] == 8
    assert report["counts"]["domains_absent_from_shared_register"] == 20
    assert report["counts"]["distinct_source_id_conflicts"] == 4
    assert report["counts"]["domains_with_role_to_specialization_assignments"] == 0
    assert report["shared_register"]["written"] is False
