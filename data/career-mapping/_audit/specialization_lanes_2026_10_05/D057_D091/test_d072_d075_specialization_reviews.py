import json
from pathlib import Path


HERE = Path(__file__).parent


def load_review(domain_id):
    return json.loads((HERE / f"{domain_id}_specialization_review.json").read_text(encoding="utf-8"))


def test_d072_geospatial_candidates_are_sourced_and_scope_bounded():
    review = load_review("D072")
    assert review["decision"]["count"] == len(review["candidate_specializations"]) == 5
    source_ids = {item["source_id"] for item in review["source_register"]}
    assert all(set(item["source_ids"]) <= source_ids for item in review["candidate_specializations"])
    assert "IHO_HYDROGRAPHY" in source_ids
    assert "FIG_HYDROGRAPHY" not in {source for item in review["candidate_specializations"] for source in item["source_ids"]}
    assert "not_reviewed_here" == review["decision"]["role_assignment_status"]


def test_d073_d074_d075_have_bounded_sourced_areas():
    for domain_id, expected_count in (("D073", 4), ("D074", 4), ("D075", 4)):
        review = load_review(domain_id)
        areas = review["candidate_specializations"]
        sources = {item["source_id"] for item in review["source_register"]}
        assert len(areas) == review["decision"]["count"] == expected_count
        assert len({area["key"] for area in areas}) == expected_count
        assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
        assert all(set(area["source_ids"]) <= sources for area in areas)
        assert review["decision"]["role_assignment_status"] == "not_reviewed_here"
        assert review["decision"]["canonical_implementation_status"] == "not_implemented"


def test_regional_and_jurisdiction_specific_claims_are_not_globalized():
    d074 = load_review("D074")
    d075 = load_review("D075")
    assert any("national law" in item.lower() for item in d074["limitations"])
    assert any("region-specific" in item for item in d075["limitations"])
    assert "not_obtained" == d075["decision"]["external_academic_signoff_status"]
