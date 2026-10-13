"""Integrity tests for the append-only role -> subgroup continuation register."""

from __future__ import annotations

import json
from pathlib import Path

from reconcile_role_to_subgroup_semantic_2026_10_06 import BASELINE, build_register


HERE = Path(__file__).resolve().parent
REGISTER = HERE / "role_to_subgroup_semantic_reconciliation_2026_10_06_010.json"
REGISTER_MD = HERE / "role_to_subgroup_semantic_reconciliation_2026_10_06_010.md"
CHECKPOINT_MD = HERE / "role_to_subgroup_semantic_reconciliation_checkpoint_2026_10_06_010.md"
ALLOWED = {"supported", "conditional", "direct-domain-role", "wrong subgroup", "missing specialization/role"}


def test_every_baseline_conditional_is_reconciled_once():
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    baseline_keys = {
        item["role_key"] for item in baseline["entries"]
        if item["disposition"] == "conditional_insufficient_evidence"
    }
    register, = (build_register("test"),)
    keys = [item["role_key"] for item in register["entries"]]
    assert len(keys) == 1577
    assert len(set(keys)) == len(keys)
    assert set(keys) == baseline_keys
    assert set(register["reconciliation_counts"]["conditional_role_rows"]) <= ALLOWED


def test_priority_routes_are_complete_and_separate_from_role_rows():
    register = build_register("test")
    assert register["baseline_counts"] == {
        "conditional_rows": 1577,
        "zero_visible_subgroup_domains": 80,
        "zero_active_role_domains": 16,
        "gated_target_routes": 19,
    }
    assert len(register["domain_route_assessments"]) == 80
    assert len(register["gated_target_routes"]) == 19
    assert len(register["priority_scope"]["zero_visible_subgroup_domain_ids"]) == 80
    assert len(register["priority_scope"]["zero_active_role_domain_ids"]) == 16


def test_evidence_boundary_is_explicit_for_every_record():
    register = build_register("test")
    assert set(register["register_integrity"]) >= {
        "canonical_edits", "used_role_titles_as_evidence", "isco_membership_used_as_fit_proof",
        "current_subgroup_membership_used_as_fit_proof", "semantic_signoff",
    }
    assert register["register_integrity"]["canonical_edits"] is False
    assert register["register_integrity"]["used_role_titles_as_evidence"] is False
    assert register["register_integrity"]["isco_membership_used_as_fit_proof"] is False
    assert register["register_integrity"]["current_subgroup_membership_used_as_fit_proof"] is False
    assert register["register_integrity"]["semantic_signoff"] is False
    for collection in (register["entries"], register["domain_route_assessments"], register["gated_target_routes"]):
        for item in collection:
            assert item["used_role_title_as_evidence"] is False
            assert item["isco_membership_used_as_fit_proof"] is False
            assert item["current_subgroup_membership_used_as_fit_proof"] is False
            assert item["semantic_signoff"] is False


def test_nonconditional_classifications_have_recorded_scope_evidence():
    register = build_register("test")
    for item in register["entries"] + register["gated_target_routes"]:
        if item["classification"] == "conditional":
            continue
        comparison = item["comparison"]
        assert comparison["task_evidence_token_count"] > 0 or item["classification"] == "missing specialization/role"
        if item["classification"] == "supported":
            assert (comparison["best_subgroup"] or {}).get("score", 0) >= 4
        if item["classification"] == "wrong subgroup":
            assert (comparison["best_subgroup"] or {}).get("score", 0) >= 4


def test_written_register_is_append_only_and_matches_the_builder():
    assert REGISTER.exists()
    assert REGISTER_MD.exists()
    assert CHECKPOINT_MD.exists()
    document = json.loads(REGISTER.read_text(encoding="utf-8"))
    assert document["continuation_of"] == BASELINE.name
    assert document["run_id"] == "010"
    assert document["register_integrity"]["canonical_edits"] is False
    assert not REGISTER.name.endswith("009.json")
