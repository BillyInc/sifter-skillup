import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D050_specialization_review.json").read_text(encoding="utf-8"))


def test_zero_active_roles_and_historical_isco_counts_are_distinguished():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D050"
    assert state["active_role_mappings"] == 0
    assert [g["role_count"] for g in state["current_subgroups"]] == [0, 0, 0]
    assert [g["historical_evidence_role_count"] for g in state["current_subgroups"]] == [None, 16, 18]
    assert REVIEW["decision"]["candidate_count"] == len(REVIEW["candidate_specializations"]) == 4


def test_candidates_are_provisional_and_have_sources_and_boundaries():
    assert "provisional" in REVIEW["decision"]["candidate_count_status"]
    assert all(c["description"] and c["boundary"] and c["source_ids"] for c in REVIEW["candidate_specializations"])
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_isa_95_system_levels_are_not_presented_as_a_learning_sequence():
    text = REVIEW["decision"]["computational_disposition"].lower()
    assert "not a learner sequence" in text
    assert "not automatically separate specializations" in text


def test_superseded_iec_report_is_explicitly_limited():
    source = next(s for s in REVIEW["sources"] if s["source_id"] == "IEC_SMART_MANUFACTURING_USE_CASES")
    assert "replaced" in source["locator"]
    assert "superseded report as the current normative reference" in source["does_not_support"]
