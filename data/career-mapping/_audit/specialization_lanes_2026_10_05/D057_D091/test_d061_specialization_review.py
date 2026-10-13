import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D061_specialization_review.json").read_text(encoding="utf-8"))


def test_d061_three_functions_are_source_supported_not_inherited_from_isco_counts():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 3
    assert len({area["key"] for area in areas}) == 3
    assert REVIEW["current_state"]["current_basis"].startswith("ISCO-derived")
    assert "neither the labels nor current role membership" in REVIEW["current_state"]["current_basis"]


def test_d061_sources_include_global_and_cross_region_evidence_with_limits():
    sources = REVIEW["source_register"]
    assert len(sources) >= 6
    assert all(s["locator"] and s["supports"] and s["does_not_support"] for s in sources)
    assert any("international" in s["source_type"] for s in sources)
    assert any("UK" in s["does_not_support"] for s in sources)
    assert any("Canada" in s["does_not_support"] for s in sources)


def test_d061_product_lines_and_adjacent_disciplines_are_not_overpromoted():
    assert any(x["alternative"].startswith("Add a separate area for every product line") and x["disposition"] == "rejected_as_default" for x in REVIEW["alternatives_and_boundaries"])
    assert any(x["alternative"].startswith("Add actuarial and enterprise-risk") and x["disposition"] == "not_adopted_pending_parent_catalogue_review" for x in REVIEW["alternatives_and_boundaries"])
    assert "Pension-scheme" in REVIEW["current_state"]["scope_questions"][0]


def test_d061_does_not_assign_roles_or_edit_canonical_taxonomy():
    assert REVIEW["decision"]["role_assignment_status"] == "not_reviewed_here"
    assert REVIEW["decision"]["canonical_implementation_status"] == "not_implemented"
    assert REVIEW["decision"]["external_academic_signoff_status"] == "not_obtained"


def test_d061_computational_layer_remains_separate_from_specialization_decision():
    cross_check = REVIEW["computational_cross_check"]
    assert cross_check["declared_computational_layer"] is False
    assert cross_check["automated_lexical_candidate"] is False
    assert "No computational specialization" in cross_check["disposition"]
