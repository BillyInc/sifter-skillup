"""Integrity tests for the Galileo D001-D056 review-only handoff."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
HANDOFF = Path(__file__).resolve().parent / "role_enrichment_lanes_2026_10_06" / "D001_D056" / "D001_D056_role_enrichment_final_handoff_2026_10_07.json"


def payload() -> dict:
    return json.loads(HANDOFF.read_text(encoding="utf-8"))


def test_handoff_integrity_gates_pass():
    data = payload()
    integrity = data["integrity"]
    assert all(value for key, value in integrity.items() if key != "canonical_files_edited")
    assert integrity["canonical_files_edited"] is False


def test_every_sparse_domain_has_candidate_coverage_floor():
    data = payload()
    domains = data["coverage_floor"]["domains"]
    assert len(domains) == 14
    assert all(row["current_active_role_count"] + row["candidate_count"] >= 10 for row in domains)
    assert all(row["candidate_coverage_reaches_floor"] is True for row in domains)


def test_every_candidate_has_independent_domain_and_area_fit():
    entries = payload()["entries"]
    keys = [entry["candidate_key"] for entry in entries]
    assert len(keys) == len(set(keys))
    for entry in entries:
        assert entry["domain_fit_status"] in {"supported_candidate", "conditional"}
        assert entry["domain_fit_rationale"]
        area = entry["area_of_specialization"]
        assert area["code"].startswith("D") and "-S" in area["code"]
        assert area["label"] and area["boundary"] and isinstance(area["source_ids"], list) and area["fit_rationale"]
        assert area["source_artifact"].endswith("global_step1_specialization_reconciliation_2026_10_06.json")
        assert entry["area_fit_status"] in {"supported_candidate", "conditional_review_required"}
        assert entry["global_evidence"]
        assert all(source["url"].startswith("http") and source["locator"] for source in entry["global_evidence"])
        if entry["disposition"] == "add":
            assert entry["area_fit_status"] == "supported_candidate"


def test_reconciled_global_area_names_replace_legacy_hints():
    data = payload()
    reconciliation = data["area_reconciliation"]
    assert reconciliation["legacy_isco_labels_are_final_names"] is False
    assert reconciliation["remapped_entry_count"] == 133
    assert reconciliation["retained_legacy_label_count"] == 0
    for entry in data["entries"]:
        area = entry["area_of_specialization"]
        audit = entry["area_reconciliation"]
        assert audit["source_artifact"].endswith("global_step1_specialization_reconciliation_2026_10_06.json")
        assert audit["reconciled_area_label"] == area["label"]
        assert audit["reconciled_boundary"] == area["boundary"]
        assert audit["changed_from_legacy_hint"] is True


def test_global_and_nigerian_evidence_are_separate():
    for entry in payload()["entries"]:
        assert all(not source["scope"].startswith("Nigeria") for source in entry["global_evidence"])
        assert entry["nigerian_context_claim_limit"]


def test_counts_and_review_only_boundaries_are_explicit():
    data = payload()
    entries = data["entries"]
    assert len(entries) == 133
    assert sum(entry["disposition"] == "add" for entry in entries) == 79
    review_only = [entry for entry in entries if entry["disposition"] == "review_only"]
    assert len(review_only) == 54
    assert all(entry["disposition_reason"] for entry in review_only)
    assert all(entry["area_fit_status"] == "conditional_review_required" for entry in review_only)
    assert sum(
        row["remaining_active_floor_deficit_after_safe_add_candidates"]
        for row in data["coverage_floor"]["domains"]
    ) == 46
