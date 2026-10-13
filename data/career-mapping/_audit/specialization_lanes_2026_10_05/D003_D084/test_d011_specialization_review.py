import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D011_specialization_review.json").read_text(encoding="utf-8"))


def test_d011_three_financial_method_areas_have_bounded_purposes():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 3
    assert len({area["key"] for area in areas}) == 3
    assert all(area["label"] and area["scope"] and area["boundary"] for area in areas)


def test_d011_sources_support_practice_distinctions_without_role_assignment():
    assert len(REVIEW["source_register"]) >= 4
    assert all(source["locator"] and source["supports"] and source["does_not_support"] for source in REVIEW["source_register"])
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
