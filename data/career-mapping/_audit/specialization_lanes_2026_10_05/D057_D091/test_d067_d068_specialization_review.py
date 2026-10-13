import json
from pathlib import Path


HERE = Path(__file__).parent
DENTISTRY = json.loads((HERE / "D067_specialization_review.json").read_text(encoding="utf-8"))
ALLIED = json.loads((HERE / "D068_specialization_review.json").read_text(encoding="utf-8"))


def _source_ids(review):
    return {source["source_id"] for source in review["source_register"]}


def test_dentistry_areas_are_bounded_and_references_resolve():
    areas = DENTISTRY["candidate_specializations"]
    assert len(areas) == DENTISTRY["decision"]["count"] == 8
    assert all(set(area["source_ids"]) <= _source_ids(DENTISTRY) for area in areas)
    assert "not a universal list" in DENTISTRY["decision"]["count_status"]


def test_dentistry_separates_global_principles_from_us_recognition():
    ada = next(s for s in DENTISTRY["source_register"] if s["source_id"] == "ADA_RECOGNIZED_DENTAL_SPECIALTIES")
    assert "U.S.-specific" in ada["does_not_support"]
    assert DENTISTRY["decision"]["role_assignment_status"] == "not_reviewed_here"


def test_allied_health_recommends_no_subgroups_until_parent_scope_is_fixed():
    assert ALLIED["decision"]["count"] == 0
    assert ALLIED["candidate_specializations"] == []
    assert ALLIED["review_status"].startswith("source_reviewed_parent_scope_split")
    assert "not mean these professions lack specialties" in ALLIED["decision"]["count_status"]


def test_allied_health_does_not_treat_isco_as_specialization_evidence():
    assert "not areas of specialization" in ALLIED["current_state"]["current_basis"]
    assert ALLIED["decision"]["canonical_implementation_status"] == "not_implemented"
