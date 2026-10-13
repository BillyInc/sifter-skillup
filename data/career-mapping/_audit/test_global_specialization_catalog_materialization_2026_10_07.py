"""Integrity tests for the normalized specialization integration catalog."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = Path(__file__).with_name("materialize_global_specialization_catalog_2026_10_07.py")
CATALOG = ROOT / "domain_specialization_catalog.json"


def test_materializer_normalizes_all_three_step1_area_shapes():
    subprocess.run([sys.executable, str(SCRIPT)], check=True, cwd=ROOT)
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    source = json.loads((ROOT / "_audit/specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/global_step1_specialization_reconciliation_2026_10_06.json").read_text(encoding="utf-8-sig"))
    assert catalog["counts"]["domain_records"] == 168
    assert catalog["counts"]["area_records"] == 708
    assert catalog["counts"]["student_area_candidates_before_role_gate"] == 708
    assert catalog["counts"]["excluded_area_candidates_folded_into_existing_areas"] == 1
    assert catalog["counts"]["no_specialization_recommended_domains"] == 4
    assert catalog["counts"]["source_reported_count_variances"] == 53
    assert catalog["counts"]["area_records"] == sum(
        domain["recommended_area_count_normalized"] for domain in catalog["domains"]
    )
    assert catalog["domain_id_integrity"]["unique_domain_count"] == 168
    assert {item["domain_id"] for item in catalog["domains"]} == {item["domain_id"] for item in source["domains"]}


def test_area_keys_are_domain_scoped_and_legacy_recommendation_is_not_activated():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    keys = []
    for domain in catalog["domains"]:
        for area in domain["areas"]:
            assert area["area_key"].startswith(domain["domain_id"] + ":")
            assert area["student_visible"] is False
            assert area["role_keys"] == []
            keys.append(area["area_key"])
    assert len(keys) == len(set(keys))
    d112 = next(item for item in catalog["domains"] if item["domain_id"] == "D112")
    assert [area["label"] for area in d112["areas"]] == [
        "Timber and Engineered-Wood Processing",
        "Pulp and Paper Manufacture",
    ]
    pulp_and_paper = d112["areas"][1]
    assert "downstream paper converting and finishing" in pulp_and_paper["boundary"]
    assert pulp_and_paper["boundary_reconciliation"]["decision"] == (
        "include_paper_converting_and_finishing_as_downstream_process_topics"
    )
    folded = next(
        item for item in catalog["excluded_area_candidates"]
        if item["domain_id"] == "D112"
    )
    assert folded["disposition"] == "fold_into_existing_area_as_process_topic"
    assert folded["parent_area_key"] == "D112:pulp-and-paper-manufacture"
    assert folded["student_visible_as_area"] is False


def test_canonical_records_retain_open_context_and_evidence_gaps():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    assert catalog["status"] == "normalized_integration_catalog_not_student_active"
    assert catalog["policy"]["nigerian_context_is_separate_from_global_specialization"] is True
    assert catalog["counts"]["domains_with_areas_missing_inline_citations"] == 85
    assert catalog["counts"]["areas_missing_inline_citations"] > 0
    assert catalog["counts"]["areas_missing_captured_source_cards"] == 0
    assert catalog["domain_id_integrity"]["duplicate_domain_ids"] == []
    assert catalog["domain_id_integrity"]["missing_domain_ids"] == []


def test_source_cards_are_scoped_to_domain_and_attached_only_with_area_specific_support():
    import importlib.util

    spec = importlib.util.spec_from_file_location("specialization_materializer", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    step1 = json.loads((ROOT / "_audit/specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/global_step1_specialization_reconciliation_2026_10_06.json").read_text(encoding="utf-8-sig"))
    domain = next(row for row in step1["domains"] if row["domain_id"] == "D021")
    cards = module.domain_source_cards(domain)
    assert {card["source_id"] for card in cards} == {
        "UIA_UNESCO_ARCHITECTURAL_EDUCATION_CHARTER_2017",
        "UNHABITAT_INTERNATIONAL_GUIDELINES_URBAN_TERRITORIAL_PLANNING",
        "IFLA_LANDSCAPE_ARCHITECT_DEFINITION_2020",
    }
    assert all(module.source_supports_area(card, "Urban and Regional Planning") for card in cards if "planning" in card["source_id"].casefold())
