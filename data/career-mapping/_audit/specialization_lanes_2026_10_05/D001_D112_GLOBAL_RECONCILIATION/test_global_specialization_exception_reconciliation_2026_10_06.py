from __future__ import annotations

import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).with_name(
    "audit_global_specialization_exception_reconciliation_2026_10_06.py"
)
SPEC = importlib.util.spec_from_file_location("global_specialization_reconciliation", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_reconciles_all_current_manifest_candidate_conflicts():
    report = MODULE.build_report()
    assert report["coverage"]["catalogue_domains"] == 168
    assert report["coverage"]["domains_with_review_artifact"] == 168
    assert report["coverage"]["candidate_artifact_domains_scanned"] == 168
    assert report["candidate_list_conflicts"]["count"] == 7
    assert report["candidate_list_conflicts"]["domain_ids"] == [
        "D098", "D118", "D119", "D120", "D121", "D122", "D123"
    ]


def test_d098_three_vs_four_is_explicit_and_not_hidden():
    report = MODULE.build_report()
    conflict = report["candidate_list_conflicts"]["domains"]["D098"]
    assert {len(v["labels"]) for v in conflict["variants"]} == {3, 4}
    assert len(conflict["reconciliation"]["recommendation"]) == 4
    assert conflict["reconciliation"]["unresolved"]


def test_parent_scope_boundaries_are_explicit_for_d120_and_d123():
    report = MODULE.build_report()
    d120 = report["candidate_list_conflicts"]["domains"]["D120"]["reconciliation"]
    d123 = report["candidate_list_conflicts"]["domains"]["D123"]["reconciliation"]
    assert len(d120["recommendation"]) == 3
    assert "Post-harvest" in d120["parent_fit"]
    assert "radiotherapy" in d123["parent_fit"].lower()
    assert d123["unresolved"]


def test_local_d053_d056_are_present_but_remain_provisional():
    report = MODULE.build_report()
    rows = report["additional_provisional_cases"]["d053_d056"]
    assert [row["domain_id"] for row in rows] == ["D053", "D054", "D055", "D056"]
    assert all(row["candidate_count"] > 0 for row in rows)
    assert all(row["status"] for row in rows)
    provisional = report["additional_provisional_cases"]["d057_d066_detail"]
    assert [row["domain_id"] for row in provisional] == [
        "D057", "D058", "D060", "D062", "D063", "D064", "D065", "D066"
    ]
    assert all(row["open_issue"] for row in provisional)


def test_sources_have_claim_limits_and_no_nigerian_scope():
    report = MODULE.build_report()
    assert all(
        source.get("publisher")
        and source.get("url", "").startswith("https://")
        and source.get("claim")
        and source.get("limit")
        for source in report["source_register"].values()
    )
    assert "no Nigerian-specific research" in report["scope"]


def test_catalogue_residual_queue_is_explicit_and_deduplicated():
    report = MODULE.build_report()
    queue = report["catalogue_residual_inventory"]
    assert queue["domain_records_found"] == 168
    assert queue["domains_with_explicit_residual_status_or_fields"] == 97
    assert len(queue["residual_domain_ids"]) == len(set(queue["residual_domain_ids"]))
    assert queue["domains_without_extractable_per_domain_status"] == []
    assert {"D003", "D023", "D053", "D098", "D123", "D124", "D133", "D164"}.issubset(
        set(queue["residual_domain_ids"])
    )
    assert "D004" not in queue["residual_domain_ids"]


def test_noncanonical_state_alone_is_not_counted_as_an_open_issue():
    queue = MODULE.build_report()["catalogue_residual_inventory"]
    assert "D001" not in queue["residual_domain_ids"]
    assert "D002" not in queue["residual_domain_ids"]
    assert "D057" in queue["residual_domain_ids"]  # explicit provisional source review remains


def test_d003_candidate_set_is_reconciled_but_parent_scope_gate_remains():
    item = MODULE.build_report()["additional_reconciliations"]["D003"]
    assert item["candidate_count"] == 5
    assert len(item["candidate_labels"]) == 5
    assert "parent description" in item["fit_finding"]
    assert "before later canonical publication" in item["remaining_gate"]
    assert {"CS2023_AI_KNOWLEDGE_AREA", "AAAI26_TECHNICAL_AREAS"} == set(item["source_ids"])

