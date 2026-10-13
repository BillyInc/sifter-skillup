import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D049_specialization_review.json").read_text(encoding="utf-8"))


def test_current_zero_role_state_is_not_confused_with_historical_isco_evidence():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D049"
    assert state["active_role_mappings"] == 0
    assert [g["role_count"] for g in state["current_subgroups"]] == [0, 0, 0]
    assert [g["evidence_role_count"] for g in state["current_subgroups"]] == [18, 13, 10]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 5


def test_candidates_are_provisional_and_grounded_in_authoritative_sources():
    assert "provisional" in REVIEW["decision"]["candidate_count_status"]
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert any(s["source_id"] == "ISO_TC22_ROAD_VEHICLES" for s in REVIEW["sources"])
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_service_credentials_are_not_misrepresented_as_global_requirements():
    ase = next(s for s in REVIEW["sources"] if s["source_id"] == "ASE_SERVICE_CREDENTIALS")
    assert "United States" in ase["publisher"]
    assert "globally required" in ase["does_not_support"]


def test_computational_is_a_contextual_method_not_an_inferred_job_group():
    disposition = REVIEW["decision"]["computational_disposition"].lower()
    assert "do not create a generic computational subgroup" in disposition
    assert "driving automation" in disposition
