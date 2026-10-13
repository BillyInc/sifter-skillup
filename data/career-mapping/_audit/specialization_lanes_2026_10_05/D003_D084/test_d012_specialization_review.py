import json
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = json.loads((HERE / "D012_specialization_review.json").read_text(encoding="utf-8"))


def test_d012_areas_are_service_contexts_not_enabling_technology_buckets():
    areas = REVIEW["candidate_specializations"]
    assert len(areas) == REVIEW["decision"]["count"] == 3
    assert len({area["key"] for area in areas}) == 3
    assert all(area["label"] and area["scope"] and area["boundary"] for area in areas)
    cross = " ".join(item["topic"] for item in REVIEW["cross_cutting_not_separate_specializations"])
    assert "APIs" in cross and "Cloud" in cross and "distributed-ledger" in cross


def test_d012_sources_and_role_boundary_are_explicit():
    assert len(REVIEW["source_register"]) >= 5
    assert all(source["locator"] and source["supports"] and source["does_not_support"] for source in REVIEW["source_register"])
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert "not_reviewed_here" in REVIEW["decision"]["role_assignment_status"]
