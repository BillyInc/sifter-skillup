import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REGISTER = HERE / "d113_d168_step1_reconciliation_register_2026_10_06.json"
BOUNDARIES = HERE / "d113_d168_area_boundary_amendment_002.json"
CATALOGUE = HERE / "d113_d168_catalogue_source_amendment_003.json"
VISIBILITY = HERE / "d113_d168_subgroup_visibility_amendment_004.json"


def test_exact_domain_range_and_one_disposition_per_domain():
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    rows = data["records"]
    expected = [f"D{i:03d}" for i in range(113, 169)]
    assert [row["domain_id"] for row in rows] == expected
    assert all(row["disposition"] for row in rows)
    assert data["counts"]["explicit_dispositions"] == 56


def test_every_row_has_read_only_structure_and_captured_source_coverage():
    rows = json.loads(REGISTER.read_text(encoding="utf-8"))["records"]
    for row in rows:
        assert "records" in row["exact_current_subgroup_comparison"]
        assert row["role_isco_fit_evidence_used"] is False
        assert row["source_evidence_coverage"]["status"]
        assert row["source_evidence_coverage"]["source_record_count"] == len(row["supporting_sources"])
        assert row["confidence"]
        assert row["remaining_blocker"]
        for source in row["supporting_sources"]:
            assert source["url"].startswith("https://")
            assert source["locator"]
            assert source["supports"]
            assert source["claim_limit"]
            assert source["source_artifact_locator"]


def test_material_conflicts_remain_visible_not_silently_resolved():
    rows = json.loads(REGISTER.read_text(encoding="utf-8"))["records"]
    conflicted = [row for row in rows if row["existing_recommendation_reconciliation"]["conflicts"]]
    assert len(conflicted) == 8
    for row in conflicted:
        assert row["disposition"] == "evidence_or_parent_scope_decision_unresolved"
        assert row["existing_recommendation_reconciliation"]["status"] == "conflict_unresolved"
        assert all(c["status"] == "material_set_difference_unresolved" for c in row["existing_recommendation_reconciliation"]["conflicts"])


def test_boundary_amendment_covers_every_candidate_area_and_marks_synthesis():
    rows = json.loads(REGISTER.read_text(encoding="utf-8"))["records"]
    supplement = json.loads(BOUNDARIES.read_text(encoding="utf-8"))
    expected = sum(len(row["recommended_final_student_facing_areas"]) for row in rows)
    assert supplement["area_boundary_count"] == expected
    assert len(supplement["records"]) == expected
    assert all(item["boundary_statement"] for item in supplement["records"])
    assert all(item["boundary_basis"] for item in supplement["records"])
    assert supplement["source_review_boundary_count"] + supplement["internally_synthesized_boundary_count"] == expected


def test_no_canonical_change_nigerian_pass_or_role_area_assignment():
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    assert all(not row["canonical_taxonomy_changed"] for row in data["records"])
    assert all(not row["role_to_specialization_assigned"] for row in data["records"])
    assert all(not row["nigerian_context_started"] for row in data["records"])


def test_catalogue_names_and_source_id_absence_are_reconciled_without_fabrication():
    amendment = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    assert amendment["catalogue_name_corrections"] == [{
        "domain_id": "D133",
        "review_artifact_name": "Luxury and Bespoke Specialist Interiors",
        "catalogue_domain_name": "Luxury & Bespoke Specialist Interiors",
        "authority": "data/career-mapping/domain_meta.json",
    }]
    coverage = amendment["citation_coverage"]
    assert coverage["captured_source_rows"] == 139
    assert coverage["rows_with_formal_source_id"] == 0
    assert coverage["rows_with_url_and_locator"] == 139
    assert coverage["source_ids_not_fabricated"] is True


def test_student_visibility_amendment_uses_state_and_explicit_reason_for_all_domains():
    amendment = json.loads(VISIBILITY.read_text(encoding="utf-8"))
    assert len(amendment["records"]) == 56
    totals = amendment["totals_across_56_domains"]
    assert totals == {
        "visible_subgroup_records": 137,
        "hidden_subgroup_records": 90,
        "all_subgroup_records": 227,
    }
    for row in amendment["records"]:
        for subgroup in row["current_subgroup_records"]:
            if subgroup["data_state"] == "excluded" or subgroup["student_visibility_reason"]:
                assert subgroup["student_visible_under_current_contract"] is False
