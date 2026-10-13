import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D031_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_count_and_current_state_are_explicit():
    assert REVIEW["domain_id"] == "D031"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 6
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 4
    assert REVIEW["current_state"]["active_role_mappings"] == 122
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert "not a count prescribed by a universal" in REVIEW["decision"]["count_status"]


def test_candidate_areas_have_sources_and_boundaries():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 6
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= set(sources)
        assert area["boundary"]


def test_buyer_seller_and_parent_domain_boundaries_are_explicit():
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "procurement" in REVIEW["decision"]["parent_scope_issue"].lower()
    assert "product management" in REVIEW["decision"]["parent_scope_issue"].lower()
    assert "role-to-domain fit" in REVIEW["criteria_disposition"]["role_fit"].lower()
    assert any(row["candidate"] == "Buying, Procurement and Sourcing" for row in REVIEW["alternatives_and_boundaries"])


def test_global_scope_and_jurisdiction_limits_are_documented():
    assert "not Nigeria-specific" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert "jurisdiction" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert REVIEW["limitations"]
