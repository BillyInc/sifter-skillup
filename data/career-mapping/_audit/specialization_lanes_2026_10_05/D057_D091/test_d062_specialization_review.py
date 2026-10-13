import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D062_specialization_review.json").read_text(encoding="utf-8"))


def test_d062_two_function_areas_are_not_inherited_from_current_group_count():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 2
    assert len({x["key"] for x in areas}) == 2
    assert "do not establish an appropriate" in REVIEW["current_state"]["current_basis"]


def test_d062_parent_overlap_is_explicit_and_keeps_recommendation_provisional():
    assert REVIEW["review_status"].startswith("provisional_")
    assert "D013" in REVIEW["current_state"]["scope_boundary_issue"]
    assert "D011" in REVIEW["current_state"]["scope_boundary_issue"]
    assert "pending" in REVIEW["criteria_disposition"]["S1_PARENT_DOMAIN_FIT"]


def test_d062_market_products_are_nested_not_uncritically_split():
    assert any(x["alternative"].startswith("Create separate specialization cards") and x["disposition"] == "rejected_as_default" for x in REVIEW["alternatives_and_boundaries"])
    assert any(x["alternative"].startswith("Add FX and money-market dealing") and x["disposition"] == "retained_as_candidate_context_not_separate_area" for x in REVIEW["alternatives_and_boundaries"])


def test_d062_computational_hits_are_candidate_only_and_do_not_cross_domain_infer():
    c = REVIEW["computational_cross_check"]
    assert c["hit_count"] == 21
    assert c["automated_lexical_candidate"] is True
    assert "not source-validated" in c["observed_candidate_signal"]
    assert "No standalone computational area" in c["disposition"]


def test_d062_roles_and_canonical_taxonomy_are_untouched():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"
    assert len(REVIEW["source_register"]) >= 4
    assert all(s["locator"] and s["supports"] and s["does_not_support"] for s in REVIEW["source_register"])
