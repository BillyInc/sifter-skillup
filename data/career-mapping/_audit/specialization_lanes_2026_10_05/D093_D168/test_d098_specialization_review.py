import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D098_specialization_review.json").read_text(encoding="utf-8"))


def test_d098_recommendation_has_four_distinct_output_based_areas():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 4
    assert len({area["key"] for area in areas}) == 4
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False


def test_sources_have_claim_limits_and_geographic_context():
    sources = REVIEW["source_register"]
    ids = {source["source_id"] for source in sources}
    assert len(ids) == len(sources) >= 6
    assert all(source["locator"] and source["supports"] and source["does_not_support"] for source in sources)
    assert "India" in next(x["does_not_support"] for x in sources if x["source_id"] == "INDIA_DGT_TOOL_DIE_CURRICULUM_2024")
    assert "United States" in next(x["does_not_support"] for x in sources if x["source_id"] == "NIST_DIMENSIONAL_METROLOGY")


def test_role_fit_and_canonical_implementation_remain_separate():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"
    assert "independently" in REVIEW["criteria_disposition"]["S6_ROLE_SEPARATION"]


def test_computational_scanner_hits_are_not_promoted_to_a_specialization():
    cross_check = REVIEW["computational_cross_check"]
    assert cross_check["hit_count"] == 2
    assert cross_check["automated_lexical_candidate"] is True
    assert "does not establish" in cross_check["disposition"]
    assert cross_check["role_or_membership_used_to_set_specialization_count"] is False


def test_metrology_standalone_decision_is_explicitly_open():
    alternative = next(
        x for x in REVIEW["alternatives_and_boundaries"]
        if x["alternative"].startswith("Use three candidate areas")
    )
    assert alternative["disposition"] == "retained_as_plausible_alternative"
    assert "taxonomy question" in REVIEW["candidate_specializations"][3]["boundary"]
