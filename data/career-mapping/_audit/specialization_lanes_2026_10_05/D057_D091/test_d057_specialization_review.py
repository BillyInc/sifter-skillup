import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D057_specialization_review.json").read_text(encoding="utf-8"))


def test_d057_does_not_confuse_who_architecture_types_with_specializations():
    assert REVIEW["review_status"] == "source_reviewed_provisional_candidate_set"
    assert REVIEW["decision"]["count"] == 0
    assert len(REVIEW["candidate_specializations"]) == 3
    assert all(item["status"] == "candidate_not_approved" for item in REVIEW["candidate_specializations"])
    assert REVIEW["current_state"]["current_set_used_as_taxonomy_evidence"] is False


def test_d057_sources_have_locators_limits_and_no_role_mapping():
    sources = REVIEW["source_register"]
    assert len(sources) >= 4
    assert all(source["locator"] and source["supports"] and source["claim_limit"] for source in sources)
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
    assert REVIEW["computational_cross_check"]["role_membership_used"] is False
