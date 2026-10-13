import json
from pathlib import Path


ROOT = Path(__file__).parent
REVIEW = json.loads((ROOT / "D060_specialization_review.json").read_text(encoding="utf-8"))


def test_d060_is_lane_scoped_and_provisional():
    assert REVIEW["domain_id"] == "D060"
    assert REVIEW["review_status"] == "provisional_source_reviewed"
    assert REVIEW["decision"]["count"] is None
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_d060_sources_have_locators_and_claim_limits():
    assert len(REVIEW["source_register"]) >= 4
    for source in REVIEW["source_register"]:
        assert source["url"].startswith("https://")
        assert source["locator"]
        assert source["supports"]
        assert source["claim_limit"]


def test_d060_does_not_promote_candidates_or_role_buckets_as_taxonomy():
    assert REVIEW["baseline_inventory"]["use_as_taxonomy_evidence"] is False
    assert all(
        "not yet approved" in item["status"] or item["status"].startswith("candidate only;")
        for item in REVIEW["decision"]["candidate_areas_not_approved"]
    )
    assert "current four occupationally framed buckets" in REVIEW["decision"]["disposition"]
