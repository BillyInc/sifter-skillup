import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D009_specialization_review.json").read_text(encoding="utf-8"))


def test_d009_four_areas_cover_distinct_data_science_competency_clusters():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 4
    assert len({area["key"] for area in areas}) == 4
    assert all(area["label"] and area["scope"] and area["boundary"] for area in areas)


def test_d009_source_claims_have_locators_and_limits_and_no_role_decisions():
    assert len(REVIEW["source_register"]) >= 5
    assert all(source["locator"] and source["supports"] and source["does_not_support"] for source in REVIEW["source_register"])
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
    assert "No roles" in REVIEW["limitations"][-1]
