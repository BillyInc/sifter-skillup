import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D066_specialization_review.json").read_text(encoding="utf-8"))


def test_veterinary_areas_are_eight_bounded_and_source_registered():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 8
    assert len({area["key"] for area in areas}) == 8
    source_ids = {source["source_id"] for source in REVIEW["source_register"]}
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    assert all(set(area["source_ids"]) <= source_ids for area in areas)


def test_global_guidance_and_uk_recognition_are_not_conflated():
    assert any("international" in source["source_type"] for source in REVIEW["source_register"])
    assert any("UK" in source["does_not_support"] for source in REVIEW["source_register"])
    assert any("not a global accreditation syllabus" in item for item in REVIEW["limitations"])


def test_specialty_count_is_not_copied_from_rcvs_titles_or_role_buckets():
    assert "not a count prescribed" in REVIEW["criteria_disposition"]["S4_SET_COVERAGE_AND_COUNT"]
    assert "role counts" in REVIEW["criteria_disposition"]["S6_ROLE_SEPARATION"]
    assert any(x["disposition"] == "rejected_as_root_level_oversegmentation" for x in REVIEW["alternatives_and_boundaries"])


def test_computational_hits_do_not_invent_a_separate_veterinary_area():
    c = REVIEW["computational_cross_check"]
    assert c["hit_count"] == 3
    assert "Do not create a computational veterinary subgroup" in c["disposition"]


def test_no_role_or_canonical_taxonomy_changes_are_claimed():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"
