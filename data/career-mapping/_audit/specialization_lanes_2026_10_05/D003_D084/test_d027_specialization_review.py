import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D027_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_set_is_provisional_and_not_derived_from_isco_counts():
    assert REVIEW["domain_id"] == "D027"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 9
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "provisional" in REVIEW["review_status"]


def test_candidate_sources_resolve_and_have_limits():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert {"D027_IFCC_LABORATORY_MEDICINE_DISCIPLINES", "D027_IUPHAR_PHARMACOLOGY_EDUCATION", "D027_ISCB_COMPUTATIONAL_BIOLOGY"} <= set(sources)
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= set(sources)
        assert area["boundary"]
    for source in sources.values():
        assert source["url"].startswith("https://")
        assert source["locator"] and source["supports"] and source["does_not_support"]


def test_isco_occupational_groups_and_biology_adjacent_roles_are_not_fit_evidence():
    assert len(REVIEW["current_state"]["current_subgroups"]) == 3
    assert all("ISCO" in row["basis"] for row in REVIEW["current_state"]["current_subgroups"])
    assert "stored memberships are inventory only" in REVIEW["current_state"]["structural_note"]
    assert "actual tasks" in REVIEW["decision"]["parent_scope_issue"]
