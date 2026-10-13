import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D039_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_areas_are_provisional_and_not_counted_from_existing_rows():
    assert REVIEW["domain_id"] == "D039"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 2
    assert REVIEW["current_state"]["active_role_mappings"] == 0
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False


def test_education_level_mismatch_is_explicit():
    assert "school-level" in REVIEW["decision"]["parent_scope_issue"]
    assert "school principals" in REVIEW["alternatives_and_boundaries"][0]["disposition"]
    assert all("D039_" in source_id for area in REVIEW["candidate_specializations"] for source_id in area["source_ids"])


def test_global_source_set_supports_functions_without_fixed_subgroup_claim():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 4
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    assert "not a prescribed taxonomy" in REVIEW["decision"]["disposition"]
    assert "zero active role mappings" in REVIEW["criteria_disposition"]["role_fit"]
