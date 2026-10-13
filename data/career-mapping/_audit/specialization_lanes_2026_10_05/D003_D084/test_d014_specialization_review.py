import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D014_specialization_review.json").read_text(encoding="utf-8"))


def test_d014_recommends_six_distinct_actuarial_practice_contexts():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 6
    assert len({area["key"] for area in areas}) == 6
    assert all(area["label"] and area["scope"] and area["boundary"] for area in areas)
    assert "mortality" in " ".join(item["topic"] for item in REVIEW["cross_cutting_not_separate_specializations"]).lower()


def test_d014_uses_global_sources_and_keeps_roles_out_of_scope():
    sources = REVIEW["source_register"]
    assert len(sources) >= 6
    assert all(source["url"].startswith("https://") and source["locator"] and source["supports"] and source["does_not_support"] for source in sources)
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
    assert "role-to-specialization" in REVIEW["criteria_disposition"]["role_separation"].lower()
