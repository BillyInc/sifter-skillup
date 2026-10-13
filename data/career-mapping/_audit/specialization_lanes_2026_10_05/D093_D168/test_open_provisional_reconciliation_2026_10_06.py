from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ARTIFACT = HERE / "open_provisional_specialization_reconciliation_2026_10_06.json"


def test_open_provisional_reconciliation_is_complete_and_noncanonical():
    data = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    expected = [f"D{number:03d}" for number in range(98, 169)]
    assert data["open_or_provisional_ids"] == expected
    assert data["counts"]["unresolved_domains"] == 71
    assert data["closed_ids_not_repeated"] == [f"D{number:03d}" for number in range(85, 98)]
    assert data["counts"]["canonical_taxonomy_changes"] == 0
    assert data["counts"]["role_to_specialization_assignments"] == 0
    assert data["counts"]["nigerian_context_reviews"] == 0


def test_each_record_has_fit_count_labels_sources_limits_and_computational_guard():
    data = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    assert len(data["records"]) == 71
    for row in data["records"]:
        assert row["domain_fit_disposition"]
        assert row["recommended_student_area_count"] == len(row["student_facing_labels_candidate_only"])
        assert row["source_record_count"] == len(row["sources"])
        assert row["source_limit"]
        assert row["computational_coverage"]["promotion_rule"]
        assert row["canonical_taxonomy_changed"] is False
        assert row["role_to_specialization_assigned"] is False
        assert row["nigerian_context_started"] is False
        for source in row["sources"]:
            assert source["url"]
            assert source["locator"]
            assert source["limitation"]


def test_zero_candidate_domains_keep_direct_domain_route():
    data = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    by_id = {row["domain_id"]: row for row in data["records"]}
    assert data["zero_candidate_area_ids"] == ["D124", "D126", "D129", "D133"]
    for domain_id in data["zero_candidate_area_ids"]:
        row = by_id[domain_id]
        assert row["student_route_disposition"] == "direct_domain_to_role"
        assert row["recommended_student_area_count"] == 0
        assert row["student_facing_labels_candidate_only"] == []


def test_current_zero_subgroup_inventory_is_reported_separately():
    data = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    assert data["counts"]["zero_current_subgroup_domains_in_scope"] == len(data["zero_current_subgroup_ids"])
