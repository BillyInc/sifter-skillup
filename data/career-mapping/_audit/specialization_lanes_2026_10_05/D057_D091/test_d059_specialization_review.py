import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D059_specialization_review.json").read_text(encoding="utf-8"))


def test_d059_recommends_two_bounded_mission_system_areas():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 2
    assert len({area["key"] for area in areas}) == 2
    assert all(area["label"] and area["scope"] and area["boundary"] for area in areas)
    assert REVIEW["current_state"]["current_set_used_as_taxonomy_evidence"] is False


def test_d059_architecture_is_not_mistaken_for_three_specializations():
    assert "not themselves a prescribed three-specialization taxonomy" in REVIEW["decision"]["disposition"]
    assert len(REVIEW["source_register"]) >= 4
    assert all(source["locator"] and source["supports"] and source["claim_limit"] for source in REVIEW["source_register"])
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
