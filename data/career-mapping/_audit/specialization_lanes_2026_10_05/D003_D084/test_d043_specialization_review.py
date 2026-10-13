import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D043_specialization_review.json").read_text(encoding="utf-8"))


def test_existing_isco_group_is_not_counted_as_a_student_specialization():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D043"
    assert state["active_role_mappings"] == 62
    assert state["stored_subgroup_records"] == 1
    assert state["visible_subgroups"] == 0
    assert state["current_subgroups"][0]["data_state"] == "excluded"
    assert "not an area of specialization" in state["current_subgroups"][0]["finding"]


def test_candidate_areas_have_independent_journalism_publishing_boundary():
    areas = REVIEW["candidate_specializations"]
    assert REVIEW["decision"]["candidate_count"] == len(areas) == 3
    assert "No source mandates three areas" in REVIEW["decision"]["candidate_count_status"]
    assert {a["key"] for a in areas} == {
        "reporting-and-journalism",
        "editorial-verification-and-newsroom-practice",
        "publishing-and-digital-publication-production",
    }
    assert all(a["boundary"] and a["source_ids"] for a in areas)


def test_parent_and_computational_scope_are_not_inferred_from_titles_or_tools():
    assert "actual tasks" in REVIEW["decision"]["disposition"]
    assert "not automatically computational specializations" in REVIEW["decision"]["computational_disposition"]
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_candidate_source_references_resolve():
    sources = {s["source_id"] for s in REVIEW["sources"]}
    assert {sid for area in REVIEW["candidate_specializations"] for sid in area["source_ids"]} <= sources
    assert {"UNESCO_BOOKS_PRESS", "IFJ_GLOBAL_CHARTER", "UNESCO_PUBLISHING_RECOMMENDATION"} <= sources
