import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D036_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_set_is_independent_of_isco_group_count():
    assert REVIEW["domain_id"] == "D036"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 3
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["current_state"]["active_role_mappings"] == 44


def test_sources_support_practice_boundaries_not_fixed_taxonomy():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 4
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"] and set(area["source_ids"]) <= set(sources)
        assert area["boundary"]
    assert "do not prescribe" in REVIEW["decision"]["count_status"]


def test_buyer_side_procurement_is_separated_from_adjacent_trade_and_logistics():
    assert "seller-side trading" in REVIEW["decision"]["parent_scope_issue"]
    assert "Commodity Trading" in REVIEW["alternatives_and_boundaries"][2]["candidate"]
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_jurisdictional_law_and_cumulative_learning_are_explicit():
    assert "jurisdiction-specific" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert "foundations" in REVIEW["criteria_disposition"]["student_navigation"].lower()
    assert "all 44 links" in REVIEW["criteria_disposition"]["role_fit"]
