"""Protect D078 learning-inventory area references from retired labels."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]


def read_json(relative_path: str):
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8"))


def test_inventory_uses_the_seven_current_d078_areas_not_legacy_subgroups():
    structure = read_json("data/career-mapping/domain_structure.json")
    inventory = read_json(
        "data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json"
    )
    current = structure["D078"]["areas_of_specialization"]
    current_labels = {area["label"] for area in current}
    retired = {
        "Computational and Quantitative Social Research",
        "Social, Cultural & Economic Research",
    }

    assert len(current) == 7
    assert inventory["scope_and_non_scope"]["area_names_used_for_possible_support_only"] == [
        area["label"] for area in current
    ]
    for item in inventory["candidate_items"]:
        assert set(item.get("areas", [])) <= current_labels
        assert not (set(item.get("areas", [])) & retired)


def test_legacy_cluster_material_is_explicitly_historical_not_an_area_route():
    inventory = read_json(
        "data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json"
    )
    assert inventory["existing_subgroup_cluster_skill_dispositions"]
    for item in inventory["existing_subgroup_cluster_skill_dispositions"]:
        assert item["taxonomy_state"] == "retired_legacy_evidence_only_not_a_current_area"
        assert "legacy_subgroup_label" in item
        assert "area" not in item


def test_approved_research_design_targets_resolve_to_current_area_ids_and_labels():
    structure = read_json("data/career-mapping/domain_structure.json")
    guidance = read_json(
        "data/career-mapping/_audit/sociology_domain_guidance_2026_10_08.json"
    )
    current = {
        area["area_id"]: area["label"]
        for area in structure["D078"]["areas_of_specialization"]
    }
    assert guidance["path_targets"]
    for target in guidance["path_targets"]:
        assert target["target_key"] in current
        assert target["target_label"] == current[target["target_key"]]
