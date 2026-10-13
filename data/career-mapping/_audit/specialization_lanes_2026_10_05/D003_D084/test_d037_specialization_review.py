import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D037_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_families_are_provisional_and_not_based_on_empty_role_counts():
    assert REVIEW["domain_id"] == "D037"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 7
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 3
    assert REVIEW["current_state"]["active_role_mappings"] == 0
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert "provisional" in REVIEW["decision"]["disposition"]


def test_sources_are_authoritative_and_do_not_claim_a_fixed_global_taxonomy():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 3
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    assert "not an official standard" in REVIEW["decision"]["count_status"]
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"] and set(area["source_ids"]) <= set(sources)
        assert area["boundary"]


def test_support_functions_and_jurisdictional_practice_are_not_conflated():
    assert "as a substantive legal specialization by default" in REVIEW["alternatives_and_boundaries"][0]["disposition"]
    assert "jurisdiction-specific" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert "zero active role mappings" in REVIEW["criteria_disposition"]["role_fit"]
