import json
from pathlib import Path


HERE = Path(__file__).parent


def load_review(domain_id):
    return json.loads((HERE / f"{domain_id}_specialization_review.json").read_text(encoding="utf-8"))


def test_d080_parent_mismatch_is_explicit_and_not_promoted_as_final_count():
    review = load_review("D080")
    assert review["review_status"] == "provisional_parent_scope_split_recommended"
    assert "Do not publish" in review["decision"]["recommendation"]
    assert review["decision"]["role_assignment_status"] == "not_reviewed_here"
    sources = {source["source_id"] for source in review["source_register"]}
    assert all(set(area["source_ids"]) <= sources for area in review["candidate_specializations"])


def test_d081_d082_d083_d084_have_bounded_sourced_candidates():
    expected_counts = {"D081": 4, "D082": 2, "D083": 4, "D084": 2}
    for domain_id, expected_count in expected_counts.items():
        review = load_review(domain_id)
        areas = review["candidate_specializations"]
        sources = {source["source_id"] for source in review["source_register"]}
        assert len(areas) == review["decision"]["count"] == expected_count
        assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
        assert all(set(area["source_ids"]) <= sources for area in areas)
        assert review["decision"]["role_assignment_status"] == "not_reviewed_here"
        assert review["decision"]["canonical_implementation_status"] == "not_implemented"


def test_d082_excludes_specialist_contexts_and_d084_labels_local_law():
    d082 = load_review("D082")
    d084 = load_review("D084")
    assert any(item["disposition"] == "rejected_without_context_specific_learning_contract" for item in d082["alternatives_and_boundaries"])
    assert any("jurisdiction" in area["boundary"].lower() for area in d084["candidate_specializations"])
    assert any("UK-specific" in source["source_type"] for source in d084["source_register"])
