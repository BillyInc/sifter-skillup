import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D064_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_specializations_are_counted_and_have_boundaries():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 9
    assert len({area["key"] for area in areas}) == 9
    labels = {area["label"] for area in areas}
    assert "Clinical Neuropsychology" in labels
    assert "Health Psychology" in labels
    assert "Community Psychology" in labels
    assert "Psychological Research and Assessment" not in labels
    assert all(area["label"] and area["description"] and area["boundary"] for area in areas)
    sources = {source["source_id"] for source in REVIEW["source_register"]}
    assert all(set(area["source_ids"]) <= sources for area in areas)


def test_cross_region_sources_are_bounded_by_jurisdiction():
    sources = REVIEW["source_register"]
    assert any("United States" in source["does_not_support"] for source in sources)
    assert any("United Kingdom" in source["does_not_support"] for source in sources)
    assert any("Australia" in source["does_not_support"] for source in sources)
    assert "global" in " ".join(REVIEW["limitations"]).lower()


def test_counselling_routes_are_not_claimed_as_interchangeable():
    assert any("must distinguish" in question for question in REVIEW["current_state"]["scope_questions"])
    assert any("interchangeable" in item["alternative"] or "interchangeable" in item["reason"] for item in REVIEW["alternatives_and_boundaries"])


def test_computational_signal_does_not_create_unsupported_specialization():
    c = REVIEW["computational_cross_check"]
    assert c["hit_count"] == 1
    assert c["automated_lexical_candidate"] is True
    assert "Do not add a computational specialization" in c["disposition"]


def test_no_role_assignment_or_canonical_edit_is_claimed():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"
