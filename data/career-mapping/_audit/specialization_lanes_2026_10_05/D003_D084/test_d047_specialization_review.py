import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D047_specialization_review.json").read_text(encoding="utf-8"))


def test_current_groups_are_not_accepted_from_isco_buckets_or_role_counts():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D047"
    assert state["active_role_mappings"] == 21
    assert [g["role_count"] for g in state["current_subgroups"]] == [2, 8, 1, 10]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 4
    assert "not inherited from four existing ISCO buckets or 21 role mappings" in REVIEW["decision"]["candidate_count_status"]


def test_overlap_with_dedicated_sector_domains_is_explicit():
    scope = REVIEW["current_state"]["domain_scope_issue"]
    assert all(domain in scope for domain in ("D118", "D119", "D120", "D121", "D096"))
    assert "production occupation" in REVIEW["decision"]["disposition"]
    assert len(REVIEW["audit_requirements"]) >= 4


def test_candidate_areas_are_provisional_and_have_boundaries():
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert "not approved student paths" in REVIEW["decision"]["candidate_count_status"]
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_computational_topics_are_methods_not_assumed_specializations():
    assert "methods" in REVIEW["decision"]["computational_disposition"]
    sources = {s["source_id"] for s in REVIEW["sources"]}
    assert {"FAO_AGRICULTURAL_RESEARCH", "IUSS_DIVISIONS"} <= sources
