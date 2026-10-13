import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D071_specialization_review.json").read_text(encoding="utf-8"))


def test_four_management_areas_are_bounded_and_sourced():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 4
    assert len({area["key"] for area in areas}) == 4
    source_ids = {source["source_id"] for source in REVIEW["source_register"]}
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    assert all(set(area["source_ids"]) <= source_ids for area in areas)


def test_north_american_and_international_evidence_scopes_are_separated():
    assert any("North American" in item for item in REVIEW["limitations"])
    assert any("UNESCO" in source["publisher"] for source in REVIEW["source_register"])
    assert "no source mandates" in REVIEW["decision"]["count_status"]


def test_role_families_are_not_inferred_from_current_domain_description():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert any(item["disposition"] == "held_for_role_to_domain_audit" for item in REVIEW["alternatives_and_boundaries"])
    assert "No ISCO membership" in REVIEW["criteria_disposition"]["S6_ROLE_SEPARATION"]
