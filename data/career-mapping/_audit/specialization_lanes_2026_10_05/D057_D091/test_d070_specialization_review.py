import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D070_specialization_review.json").read_text(encoding="utf-8"))


def test_six_areas_are_distinct_bounded_and_source_registered():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 6
    assert len({area["key"] for area in areas}) == 6
    source_ids = {source["source_id"] for source in REVIEW["source_register"]}
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    assert all(set(area["source_ids"]) <= source_ids for area in areas)


def test_unesco_is_not_misrepresented_as_prescribing_six_student_specializations():
    assert "internal synthesis" in REVIEW["decision"]["count_status"]
    assert "universal academic specialization count" in next(
        source["does_not_support"] for source in REVIEW["source_register"]
        if source["source_id"] == "UNESCO_PERFORMING_ARTS_SCOPE"
    )


def test_recorded_media_and_cross_discipline_areas_remain_explicitly_provisional():
    assert "recorded-media" in REVIEW["current_state"]["scope_questions"][0]
    assert any(item["disposition"] == "retained_as_compact_alternative" for item in REVIEW["alternatives_and_boundaries"])
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"


def test_role_fit_is_not_inferred_from_isco_or_current_group_membership():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert "No role counts, ISCO membership" in REVIEW["criteria_disposition"]["S6_ROLE_SEPARATION"]
