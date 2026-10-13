import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D063_specialization_review.json").read_text(encoding="utf-8"))


def test_d063_six_candidate_areas_are_distinct_and_source_registered():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 6
    assert len({area["key"] for area in areas}) == 6
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    registered = {source["source_id"] for source in REVIEW["source_register"]}
    assert all(set(area["source_ids"]) <= registered for area in areas)


def test_computational_economics_is_evidence_backed_not_just_a_lexical_hit():
    comp = next(area for area in REVIEW["candidate_specializations"] if area["key"] == "computational-economics-and-economic-modelling")
    assert {"SCE_COMPUTATIONAL_ECONOMICS", "SOUTHAMPTON_ECON2040", "EDINBURGH_ECNM10115", "MCGILL_ECON581"} <= set(comp["source_ids"])
    assert REVIEW["computational_cross_check"]["hit_count"] == 13
    assert "Unlike a lexical-only recommendation" in REVIEW["computational_cross_check"]["disposition"]


def test_jel_is_not_misrepresented_as_a_required_student_taxonomy():
    jel = next(source for source in REVIEW["source_register"] if source["source_id"] == "AEA_JEL_CLASSIFICATION_2026")
    assert "not an accreditation standard or mandated learning-path taxonomy" in REVIEW["limitations"][0]
    assert "practical candidate synthesis" in REVIEW["criteria_disposition"]["S4_SET_COVERAGE_AND_COUNT"]


def test_open_domain_boundaries_and_scope_are_explicit():
    assert REVIEW["review_status"].startswith("provisional_")
    questions = " ".join(REVIEW["current_state"]["scope_questions"])
    assert "D011" in questions
    assert "Public policy" in questions
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"


def test_sources_have_scope_and_claim_limits():
    sources = REVIEW["source_register"]
    assert len(sources) >= 8
    assert all(source["url"] and source["locator"] and source["supports"] and source["does_not_support"] for source in sources)
    assert any("UK" in source["does_not_support"] for source in sources)
    assert any("Canada" in source["does_not_support"] for source in sources)
