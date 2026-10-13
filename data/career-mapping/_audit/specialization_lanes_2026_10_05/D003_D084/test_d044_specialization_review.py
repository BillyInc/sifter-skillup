import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D044_specialization_review.json").read_text(encoding="utf-8"))


def test_existing_subgroups_mix_visual_communication_with_adjacent_disciplines():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D044"
    assert state["active_role_mappings"] == 12
    assert len(state["current_subgroups"]) == 3
    assert all(row["finding"] for row in state["current_subgroups"])
    assert "industrial/product design" in state["current_subgroups"][0]["finding"]
    assert "not automatically graphic design" in state["current_subgroups"][1]["finding"]


def test_candidate_areas_are_visual_communication_practice_not_roles_or_tools():
    areas = REVIEW["candidate_specializations"]
    assert REVIEW["decision"]["candidate_count"] == len(areas) == 5
    assert "No source mandates this exact count" in REVIEW["decision"]["candidate_count_status"]
    assert all(area["description"] and area["boundary"] for area in areas)
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_industrial_design_is_separate_and_computation_is_not_inferred_from_tools():
    assert "ICoD distinguishes visual communication" in REVIEW["decision"]["disposition"]
    assert "not computational specializations" in REVIEW["decision"]["computational_disposition"]
    sources = {source["source_id"] for source in REVIEW["sources"]}
    assert {"ICOD_VISUAL_COMMUNICATION", "UNESCO_FCS_2025"} <= sources
