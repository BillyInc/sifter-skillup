import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D033_specialization_review.json").read_text(encoding="utf-8"))


def test_candidates_are_source_based_not_current_group_counts():
    assert REVIEW["domain_id"] == "D033"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 3
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["current_state"]["active_role_mappings"] == 51


def test_every_area_uses_registered_evidence_and_bounds():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 4
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"] and set(area["source_ids"]) <= set(sources)
        assert area["boundary"]
    assert "not a mandated subgroup count" in REVIEW["decision"]["count_status"]


def test_product_project_marketing_and_engineering_boundaries_are_explicit():
    scope = REVIEW["decision"]["parent_scope_issue"].lower()
    assert "project/programme change portfolio" in scope
    assert "product marketing" in scope
    assert "engineering" in scope
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_no_role_fit_is_inferred_and_student_path_is_cumulative():
    assert "all 51 mappings" in REVIEW["criteria_disposition"]["role_fit"]
    assert "foundation" in REVIEW["criteria_disposition"]["student_navigation"].lower()
    assert len(REVIEW["limitations"]) >= 4
