import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D010_specialization_review.json").read_text(encoding="utf-8"))


def test_d010_three_practice_areas_are_distinct_and_bounded():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 3
    assert len({a["key"] for a in areas}) == 3
    assert all(a["label"] and a["scope"] and a["boundary"] for a in areas)


def test_d010_preserves_data_science_boundary_and_no_role_assignments():
    assert len(REVIEW["source_register"]) >= 4
    assert all(s["locator"] and s["supports"] and s["does_not_support"] for s in REVIEW["source_register"])
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
