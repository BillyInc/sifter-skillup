import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D045_specialization_review.json").read_text(encoding="utf-8"))


def test_zero_active_paths_are_reported_as_coverage_gap_not_no_occupations():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D045"
    assert state["active_role_mappings"] == 0
    assert state["visible_subgroups"] == 0
    assert "not evidence that the field has no occupations" in state["domain_scope_issue"]
    assert REVIEW["decision"]["coverage_status"].startswith("critical_gap")


def test_legacy_subgroups_are_not_accepted_from_isco_membership_or_counts():
    groups = REVIEW["current_state"]["current_subgroups"]
    assert len(groups) == 3
    assert all(g["state"] == "excluded" and g["role_count"] == 0 for g in groups)
    assert "not a coherent specialization boundary" in groups[0]["finding"]
    assert "not a public-administration specialization by themselves" in groups[2]["finding"]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 4
    assert "Sources do not prescribe this exact count" in REVIEW["decision"]["candidate_count_status"]


def test_candidate_areas_have_boundaries_sources_and_are_not_approved_paths():
    candidates = REVIEW["candidate_specializations"]
    assert all(row["description"] and row["boundary"] and row["source_ids"] for row in candidates)
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "neither ISCO 11/24/33 membership" in REVIEW["audit_requirements"][1]


def test_computational_is_treated_as_cross_cutting_and_sources_are_authoritative():
    assert "cross-cutting methods" in REVIEW["decision"]["computational_disposition"]
    sources = {row["source_id"] for row in REVIEW["sources"]}
    assert {"OECD_SOUND_GOVERNANCE", "UN_CEPA_GOVERNANCE", "WORLD_BANK_PUBLIC_FINANCE"} <= sources
