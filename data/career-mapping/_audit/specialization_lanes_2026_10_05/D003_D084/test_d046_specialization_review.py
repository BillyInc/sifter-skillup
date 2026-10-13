import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D046_specialization_review.json").read_text(encoding="utf-8"))


def test_legacy_group_counts_do_not_define_the_candidate_specializations():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D046"
    assert state["active_role_mappings"] == 12
    assert [g["role_count"] for g in state["current_subgroups"]] == [8, 3, 1]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 3
    assert "do not prescribe this count" in REVIEW["decision"]["candidate_count_status"]


def test_current_subgroups_have_explicit_scope_findings():
    groups = REVIEW["current_state"]["current_subgroups"]
    assert len(groups) == 3
    assert all(g["finding"] for g in groups)
    assert "psychologists/counsellors" in groups[0]["finding"]
    assert "not a clearly delimited area of specialization" in groups[1]["finding"]
    assert "Routine nannying/day-care is not equivalent" in groups[2]["finding"]


def test_candidates_have_boundaries_and_are_not_yet_role_assignments():
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "do not prescribe a universal subgroup count" in REVIEW["limitations"][0]


def test_computational_is_not_promoted_without_defined_practice_and_tasks():
    assert "not automatic specializations" in REVIEW["decision"]["computational_disposition"]
    assert any(s["source_id"] == "IFSW_IASSW_GLOBAL_STANDARDS" for s in REVIEW["sources"])
