import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D065_specialization_review.json").read_text(encoding="utf-8"))


def test_six_candidate_areas_are_bounded_and_sources_resolve():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 6
    assert len({area["key"] for area in areas}) == 6
    source_ids = {source["source_id"] for source in REVIEW["source_register"]}
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    assert all(set(area["source_ids"]) <= source_ids for area in areas)


def test_computational_linguistics_is_supported_independently_of_the_scan():
    area = next(x for x in REVIEW["candidate_specializations"] if x["key"] == "computational-linguistics-and-language-technology")
    assert "ACL_WHAT_IS_COMPUTATIONAL_LINGUISTICS" in area["source_ids"]
    assert REVIEW["computational_cross_check"]["hit_count"] == 1
    assert "not on the scanner" in REVIEW["computational_cross_check"]["disposition"]


def test_regional_and_country_sources_are_not_called_global_standards():
    assert "UK" in " ".join(REVIEW["limitations"])
    regional = next(source for source in REVIEW["source_register"] if source["source_id"] == "FIT_AI_TRANSLATION_INTERPRETING_TERMINOLOGY")
    assert "Latin America" in regional["does_not_support"]
    assert "A worldwide consensus" in regional["does_not_support"]


def test_subject_contexts_are_not_split_without_distinct_path_evidence():
    assert any(x["alternative"].startswith("Create a separate specialization for every subject matter") and x["disposition"] == "rejected_as_default" for x in REVIEW["alternatives_and_boundaries"])
    assert "not a global standard" in REVIEW["decision"]["recommendation"]


def test_scope_excludes_role_assignment_and_canonical_edits():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"
