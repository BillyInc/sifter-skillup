import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D025_specialization_review.json").read_text(encoding="utf-8"))


def test_d025_candidate_set_is_global_evidence_informed_not_a_universal_standard():
    assert REVIEW["domain_id"] == "D025"
    assert REVIEW["decision"]["count"] == 8
    assert "not as a globally mandated" in REVIEW["decision"]["disposition"]
    assert "no globally agreed definition" in " ".join(REVIEW["limitations"])
    assert len(REVIEW["candidate_specializations"]) == 8


def test_isco_families_are_not_used_as_specialization_or_role_fit_evidence():
    state = REVIEW["current_state"]
    assert state["current_visible_specialization_count"] == 6
    assert len(state["current_subgroups"]) == 6
    assert all("not_a_domain_specialization" in row["specialization_fit"] or "not_specialization" in row["specialization_fit"] for row in state["current_subgroups"])
    assert state["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_every_candidate_and_cited_source_resolves():
    source_ids = {row["source_id"] for row in REVIEW["source_register"]}
    for candidate in REVIEW["candidate_specializations"]:
        assert candidate["source_ids"]
        assert set(candidate["source_ids"]) <= source_ids
        assert candidate["label"] and candidate["description"] and candidate["boundary"]
    assert all(row["url"].startswith("https://") and row["access_date"] == "2026-10-05" for row in REVIEW["source_register"])
