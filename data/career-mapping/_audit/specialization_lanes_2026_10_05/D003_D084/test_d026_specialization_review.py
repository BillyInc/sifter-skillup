import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D026_specialization_review.json").read_text(encoding="utf-8"))


def test_d026_uses_global_functions_without_claiming_who_sets_specialization_count():
    assert REVIEW["domain_id"] == "D026"
    assert REVIEW["decision"]["count"] == 9
    assert len(REVIEW["candidate_specializations"]) == 9
    assert "not a WHO-prescribed" in REVIEW["decision"]["disposition"]
    assert "not a universal specialization taxonomy" in " ".join(REVIEW["limitations"])


def test_isco_families_and_existing_role_counts_do_not_define_candidate_structure():
    current = REVIEW["current_state"]
    assert current["current_visible_specialization_count"] == 5
    assert len(current["current_subgroups"]) == 5
    assert current["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_candidate_sources_are_explicit_and_resolvable():
    ids = {row["source_id"] for row in REVIEW["source_register"]}
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= ids
        assert area["boundary"]
