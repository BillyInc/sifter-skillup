import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D052_specialization_review.json").read_text(encoding="utf-8"))


def test_current_groups_do_not_set_candidate_specialization_count():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D052"
    assert state["active_role_mappings"] == 0
    assert [g["role_count"] for g in state["current_subgroups"]] == [0, 0, 0, 0]
    assert [g["historical_evidence_role_count"] for g in state["current_subgroups"]] == [4, 10, 52, 17]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 3


def test_candidate_areas_are_provisional_and_task_bounded():
    assert "provisional" in REVIEW["decision"]["candidate_count_status"]
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_engineering_and_trades_are_not_assumed_to_be_management_specializations():
    issue = REVIEW["current_state"]["domain_scope_issue"].lower()
    assert "engineering-design" in issue
    assert "trade-execution" in issue


def test_nigerian_specialization_pass_is_explicitly_pending():
    assert any("Nigerian specialization terminology" in item for item in REVIEW["audit_requirements"])
    assert any("Nigerian-specific specialization variations have not yet been audited" in item for item in REVIEW["limitations"])
