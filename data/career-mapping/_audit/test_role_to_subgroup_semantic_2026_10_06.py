"""Focused integrity tests for the append-only role→subgroup audit."""

from __future__ import annotations

import json
from pathlib import Path

from audit_role_to_subgroup_semantic_2026_10_06 import (
    INVENTORY,
    ROLE_SOURCE_FILES,
    STRUCTURE,
    build_register,
    current_role_mappings,
)


HERE = Path(__file__).resolve().parent
REGISTER = HERE / "role_to_subgroup_semantic_register_2026_10_06_current-canonical-final-2026-10-07.json"
REGISTER_MD = HERE / "role_to_subgroup_semantic_register_2026_10_06_current-canonical-final-2026-10-07.md"
CHECKPOINT_MD = HERE / "role_to_subgroup_semantic_checkpoint_2026_10_06_current-canonical-final-2026-10-07.md"


def test_full_active_role_subgroup_population_is_covered_once():
    register, _checkpoint = build_register("test")
    entries = register["entries"]
    current_rows = current_role_mappings()
    current_active_rows = [
        row for row in current_rows
        if str(row.get("student_path_status") or "active").casefold()
        not in {"excluded", "review_only", "audit_only"}
    ]
    assert register["catalogue_counts"]["merged_role_records"] == 3964
    assert register["catalogue_counts"]["active_role_records"] == len(current_active_rows)
    assert register["catalogue_counts"]["active_roles_with_active_subgroup_path"] == len(entries)
    assert len({entry["role_key"] for entry in entries}) == len(entries)
    assert sum(register["disposition_counts"].values()) == len(entries)


def test_domain_edge_populations_are_exactly_recorded():
    register, checkpoint = build_register("test")
    assessments = register["domain_route_assessments"]
    assert len(assessments) == 88
    assert sum(item["visible_subgroup_count"] == 0 for item in assessments) == 88
    assert sum(item["active_role_count"] == 0 for item in assessments) == 16
    assert len(checkpoint["zero_visible_subgroup_domain_ids"]) == 88
    assert len(checkpoint["zero_active_role_domain_ids"]) == 16
    assert set(checkpoint["unresolved_ownership_domain_ids"]).issubset(
        {item["domain_id"] for item in assessments}
    )


def test_route_disposition_is_not_inferred_from_counts_or_isco():
    register, _checkpoint = build_register("test")
    for item in register["domain_route_assessments"]:
        assert item["nigerian_context_used"] is False
        assert item["canonical_change_recommended_by_this_scan"] is False
        assert item["route_disposition_reason"]
    for entry in register["entries"]:
        assert entry["isco_membership_used_as_fit_proof"] is False
        assert entry["semantic_signoff"] is False
        if entry["disposition"] == "deterministic_exclusion":
            assert entry["existing_role_domain_fit_status"] in {"unsupported", "not_supported", "unsupported_for_domain"}


def test_written_register_is_append_only_and_has_exact_domain_records():
    assert REGISTER.exists()
    document = json.loads(REGISTER.read_text(encoding="utf-8"))
    assert len(document["entries"]) == document["catalogue_counts"]["active_roles_with_active_subgroup_path"]
    assert len(document["domain_route_assessments"]) == document["catalogue_counts"]["domain_edge_cases_assessed"]
    assert document["register_integrity"]["canonical_edits"] is False
    assert document["register_integrity"]["nigerian_context_used"] is False
    assert Path(document["source_inputs"]["role_inventory"]).name == INVENTORY.name
    assert Path(document["source_inputs"]["subgroup_structure"]).name == STRUCTURE.name
    assert REGISTER_MD.exists()
    assert CHECKPOINT_MD.exists()
    register_markdown = REGISTER_MD.read_text(encoding="utf-8")
    checkpoint_markdown = CHECKPOINT_MD.read_text(encoding="utf-8")
    for entry in document["entries"]:
        assert entry["role_key"] in register_markdown
        assert entry["role_key"] in checkpoint_markdown


def test_seventy_five_role_coverage_candidates_have_separate_scope_classifications():
    register, checkpoint = build_register("test")
    candidates = [
        item for item in register["role_coverage_candidate_reconciliation"]
        if item["lane"] == "D085_D168"
    ]
    assert len(candidates) == 75
    allowed = {
        "role_coverage_gap",
        "area_of_specialization_subgroup_gap",
        "duplicate_or_ownership_issue",
        "no_addition",
    }
    assert {item["scope_classification"] for item in candidates} <= allowed
    assert sum(register["role_coverage_d085_d168_scope_classification_counts"].values()) == 75
    assert register["catalogue_counts"]["source_reviewed_specialization_recommendation_count"] == 42
    assert register["catalogue_counts"]["unresolved_domain_structure_disposition_count"] == 126
    assert checkpoint["role_coverage_candidate_count"] == 145


def test_computational_audit_remains_discovery_only_and_catalogue_wide():
    register, _checkpoint = build_register("test")
    summary = register["computational_coverage_audit"]["summary"]
    assert summary["catalogue_domains"] == 168
    assert summary["unrepresented_lexical_candidate_domains"] == 87
    assert register["computational_coverage_audit"]["canonical_edits"] is False
    assert register["computational_coverage_audit"]["nigerian_context_used"] is False
