import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D029_specialization_review.json").read_text(encoding="utf-8"))


def test_areas_are_source_based_and_not_derived_from_current_isco_buckets():
    assert REVIEW["domain_id"] == "D029"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 11
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "provisional" not in REVIEW["review_status"]
    assert "candidate_set_recommended" in REVIEW["review_status"]


def test_each_candidate_has_sources_and_an_explicit_scope_boundary():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 9
    assert all(s["url"].startswith("https://") and s["locator"] and s["supports"] and s["does_not_support"] for s in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= set(sources)
        assert area["boundary"]


def test_global_professional_reference_and_local_law_limits_are_explicit():
    assert "not a universal global standard" in REVIEW["decision"]["count_status"]
    assert "jurisdiction" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert "No role-to-domain fit" in REVIEW["criteria_disposition"]["role_fit"]
    assert any("current three ISCO-derived subgroup rows" in s["supports"] for s in REVIEW["source_register"])


def test_no_unsupported_role_or_credential_claims_are_made():
    assert REVIEW["current_state"]["active_role_mappings"] == 16
    assert REVIEW["limitations"]
    assert "does not populate skills, tools, competencies, certifications or learning links" in " ".join(REVIEW["limitations"])
    assert all("certification" not in area["description"].lower() for area in REVIEW["candidate_specializations"])
