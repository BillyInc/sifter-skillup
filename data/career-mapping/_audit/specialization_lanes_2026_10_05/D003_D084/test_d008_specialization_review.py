import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D008_specialization_review.json").read_text(encoding="utf-8"))


def test_d008_recommendation_is_four_bounded_network_practice_areas():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 4
    assert len({a["key"] for a in areas}) == 4
    assert all(a["label"] and a["scope"] and a["boundary"] and a["source_basis"] for a in areas)


def test_d008_uses_sources_but_does_not_overclaim_taxonomy_or_role_fit():
    assert len(REVIEW["source_register"]) >= 5
    assert all(s["locator"] and s["supports"] and s["does_not_support"] for s in REVIEW["source_register"])
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
    assert "No role-to-domain or role-to-specialization" in REVIEW["limitations"][-1]
    assert REVIEW["decision"]["count_status"].startswith("internal synthesis")

