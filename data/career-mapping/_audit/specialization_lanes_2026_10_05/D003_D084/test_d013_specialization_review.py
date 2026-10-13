import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D013_specialization_review.json").read_text(encoding="utf-8"))


def test_d013_four_workflows_are_supported_and_current_groups_not_used_as_taxonomy():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 4
    assert len({area["key"] for area in areas}) == 4
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["computational_cross_check"]["role_and_membership_data_used_to_set_specialization_count"] is False


def test_d013_computational_scan_is_candidate_only_and_roles_are_unassigned():
    assert "22 source-field hits" in REVIEW["computational_cross_check"]["observed_candidate_signal"]
    assert "Candidate signal only" in REVIEW["computational_cross_check"]["disposition"]
    assert len(REVIEW["source_register"]) >= 4
    assert all(source["locator"] and source["supports"] and source["does_not_support"] for source in REVIEW["source_register"])
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
