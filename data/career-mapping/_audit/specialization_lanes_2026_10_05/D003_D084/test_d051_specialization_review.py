import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D051_specialization_review.json").read_text(encoding="utf-8"))


def test_isco_subgroups_are_not_used_to_set_specialization_count():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D051"
    assert state["active_role_mappings"] == 8
    assert state["stored_subgroup_records"] == 4
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 5
    assert "not prescribed" in REVIEW["decision"]["candidate_count_status"]


def test_parent_fit_crosscheck_is_distinct_from_specialization_assignment():
    fit = REVIEW["current_state"]["role_parent_fit_crosscheck"]
    assert (fit["reviewed"], fit["supported"], fit["unsupported"]) == (8, 2, 6)
    assert len(fit["supported_role_keys"]) == 2
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_candidates_have_professional_source_and_task_boundary():
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert any(s["source_id"] == "IVSC_INTERNATIONAL_VALUATION_STANDARDS" for s in REVIEW["sources"])
    assert any(s["source_id"] == "RICS_PROPERTY_FINANCE_INVESTMENT_PATHWAY" for s in REVIEW["sources"])


def test_jurisdiction_specific_practice_is_not_globalized():
    assert any("jurisdiction-specific" in x for x in REVIEW["audit_requirements"])
    assert any("local markets and legal rules vary" in x for x in REVIEW["limitations"])
