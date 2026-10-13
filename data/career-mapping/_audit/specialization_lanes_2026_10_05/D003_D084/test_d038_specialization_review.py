import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D038_specialization_review.json").read_text(encoding="utf-8"))


def test_provisional_area_set_is_not_inferred_from_isco_count_or_empty_roles():
    assert REVIEW["domain_id"] == "D038"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 4
    assert REVIEW["current_state"]["active_role_mappings"] == 0
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert "no branch is ready for student display" in REVIEW["decision"]["disposition"]


def test_sources_support_distinct_functions_without_prescribing_taxonomy():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 4
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    assert all(area["source_ids"] and set(area["source_ids"]) <= set(sources) for area in REVIEW["candidate_specializations"])
    assert "not a mandated taxonomy" in REVIEW["decision"]["disposition"]


def test_domain_scope_and_local_law_boundaries_are_explicit():
    assert "combines organizational compliance" in REVIEW["decision"]["parent_scope_issue"]
    assert "jurisdiction- and sector-specific" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert "not an individual certification" in REVIEW["limitations"][2]
