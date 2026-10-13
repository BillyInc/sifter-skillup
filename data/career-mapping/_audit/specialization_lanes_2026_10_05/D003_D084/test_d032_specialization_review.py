import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D032_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_structure_is_not_copied_from_current_isco_groups():
    assert REVIEW["domain_id"] == "D032"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 3
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["current_state"]["active_role_mappings"] == 38


def test_source_records_resolve_and_have_scope_limits():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 7
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= set(sources)
        assert area["boundary"]
    assert "not a count prescribed" in REVIEW["decision"]["count_status"]


def test_portfolio_scope_is_not_silently_added_to_parent():
    assert "portfolio selection/prioritisation/governance should not silently be absorbed" in REVIEW["decision"]["parent_scope_issue"].lower()
    assert any(item["candidate"] == "Portfolio Management and Governance" for item in REVIEW["alternatives_and_boundaries"])
    assert "portfolio management" in REVIEW["decision"]["parent_scope_issue"].lower()


def test_role_fit_is_separate_and_student_path_is_cumulative():
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert REVIEW["criteria_disposition"]["role_fit"].startswith("No role-to-domain fit")
    assert "foundation" in REVIEW["criteria_disposition"]["student_navigation"].lower()
    assert len(REVIEW["limitations"]) >= 4
