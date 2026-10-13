import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D048_specialization_review.json").read_text(encoding="utf-8"))


def test_current_scope_and_counts_are_explicit_and_not_used_for_candidate_count():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D048"
    assert state["active_role_mappings"] == 43
    assert [g["role_count"] for g in state["current_subgroups"]] == [5, 1, 9, 28]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 4
    assert "not inherited from the four ISCO buckets" in REVIEW["decision"]["candidate_count_status"]


def test_food_science_title_and_applied_technology_scope_are_connected():
    assert "Food Science and Technology" in REVIEW["decision"]["disposition"]
    assert "D092" in REVIEW["decision"]["disposition"]
    assert any(s["source_id"] == "CODEX_CXC_1_1969" for s in REVIEW["sources"])


def test_candidate_specializations_have_tasks_and_boundaries():
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "do not prescribe this exact student-facing count" in REVIEW["decision"]["candidate_count_status"]


def test_computational_data_is_method_coverage_not_a_new_job_group():
    assert "methods" in REVIEW["decision"]["computational_disposition"]
    assert any(s["source_id"] == "IFT_FOOD_SCIENCE" for s in REVIEW["sources"])
