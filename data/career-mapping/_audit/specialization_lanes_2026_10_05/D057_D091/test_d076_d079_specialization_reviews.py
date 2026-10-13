import json
from pathlib import Path


HERE = Path(__file__).parent


def load_review(domain_id):
    return json.loads((HERE / f"{domain_id}_specialization_review.json").read_text(encoding="utf-8"))


def test_d076_d077_recommendations_flag_parent_scope_and_role_separation():
    for domain_id in ("D076", "D077"):
        review = load_review(domain_id)
        assert review["review_status"] == "provisional_parent_scope_split_recommended"
        assert review["decision"]["role_assignment_status"] == "not_reviewed_here"
        assert len(review["candidate_specializations"]) == review["decision"]["count"]
        source_ids = {source["source_id"] for source in review["source_register"]}
        assert all(set(area["source_ids"]) <= source_ids for area in review["candidate_specializations"])


def test_d077_current_subgroup_snapshot_matches_taxonomy_and_does_not_treat_isco_as_specialization_count():
    review = load_review("D077")
    domain_structure = json.loads(
        (HERE.parents[2] / "domain_structure.json").read_text(encoding="utf-8")
    )
    actual = domain_structure["D077"]["subgroups"]
    snapshot = review["current_state"]["visible_subgroups"]
    assert review["current_state"]["current_visible_specialization_count"] == len(actual) == 2
    assert [(row["label"], row["role_count"]) for row in snapshot] == [
        (row["label"], row["role_count"]) for row in actual
    ]
    assert all("ISCO" in row["provenance"] for row in snapshot)
    assert "not used as the learner taxonomy" in next(
        row["does_not_support"] for row in review["source_register"]
        if row["source_id"] == "ILO_ISCO08_PROTECTIVE_TASKS"
    )


def test_d078_includes_bounded_computational_social_science():
    review = load_review("D078")
    assert review["decision"]["count"] == len(review["candidate_specializations"]) == 7
    comp = next(area for area in review["candidate_specializations"] if area["key"] == "computational-digital-social-science")
    assert "ISA_DIGITAL_SOCIOLOGY" in comp["source_ids"]
    assert "cross-cutting" in comp["boundary"]
    assert review["computational_cross_check"]["declared_computational_layer"] is True
    sources = {source["source_id"] for source in review["source_register"]}
    assert all(set(area["source_ids"]) <= sources for area in review["candidate_specializations"])


def test_d079_separates_customs_trade_and_immigration_scope():
    review = load_review("D079")
    assert review["decision"]["count"] == len(review["candidate_specializations"]) == 3
    assert any(item["disposition"] == "not_recommended_without_border-management_scope" for item in review["alternatives_and_boundaries"])
    assert "WCO_CUSTOMS_PROFESSIONAL_STANDARDS" in {source["source_id"] for source in review["source_register"]}
