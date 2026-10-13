import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D028_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_set_is_not_derived_from_current_occupation_buckets():
    assert REVIEW["domain_id"] == "D028"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "provisional" in REVIEW["review_status"]


def test_sources_support_functions_but_not_a_fixed_universal_taxonomy():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 5
    assert all(s["url"].startswith("https://") and s["locator"] and s["supports"] and s["does_not_support"] for s in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= set(sources)
        assert area["boundary"]
    assert "no source located prescribes four" in REVIEW["decision"]["count_status"]


def test_adjacent_domains_and_task_fit_are_explicitly_protected():
    scope = REVIEW["decision"]["parent_scope_issue"]
    assert "marketing" in scope and "procurement" in scope and "logistics" in scope
    assert "title 'consultant' is not sufficient" in " ".join(a["boundary"] for a in REVIEW["candidate_specializations"])
    assert REVIEW["current_state"]["active_role_mappings"] == 45
