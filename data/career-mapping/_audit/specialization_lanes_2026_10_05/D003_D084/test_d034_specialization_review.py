import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D034_specialization_review.json").read_text(encoding="utf-8"))


def test_specialization_set_is_not_current_isco_group_copy():
    assert REVIEW["domain_id"] == "D034"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 5
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 4
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["current_state"]["active_role_mappings"] == 157


def test_source_locators_cover_end_to_end_scope_and_limit_inference():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 4
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"] and set(area["source_ids"]) <= set(sources)
        assert area["boundary"]


def test_process_framework_is_not_misrepresented_as_job_taxonomy():
    assert "job taxonomy" in REVIEW["source_register"][1]["does_not_support"]
    assert "SCOR is a process reference model" in REVIEW["limitations"][1]
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_local_rules_and_cumulative_path_are_explicit():
    assert "jurisdiction" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert "foundation" in REVIEW["criteria_disposition"]["student_navigation"].lower()
    assert "all 157 links" in REVIEW["criteria_disposition"]["role_fit"]
