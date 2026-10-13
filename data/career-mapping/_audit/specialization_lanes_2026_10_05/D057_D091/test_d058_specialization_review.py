import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D058_specialization_review.json").read_text(encoding="utf-8"))


def test_d058_keeps_candidate_areas_provisional_and_rejects_job_family_shortcut():
    assert REVIEW["review_status"] == "source_reviewed_provisional_set_and_parent_boundary"
    assert REVIEW["decision"]["count"] is None
    assert len(REVIEW["decision"]["candidate_areas_for_follow_up"]) == 4
    assert all(area["status"] == "candidate_only" for area in REVIEW["decision"]["candidate_areas_for_follow_up"])
    assert REVIEW["current_state"]["current_set_used_as_taxonomy_evidence"] is False


def test_d058_sources_are_located_and_geographic_limits_are_recorded():
    sources = REVIEW["source_register"]
    assert len(sources) >= 5
    assert all(source["locator"] and source["supports"] and source["claim_limit"] for source in sources)
    assert "U.S.-origin" in " ".join(REVIEW["limitations"])
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
