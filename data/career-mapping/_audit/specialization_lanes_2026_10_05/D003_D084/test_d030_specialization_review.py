import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D030_specialization_review.json").read_text(encoding="utf-8"))


def test_candidate_count_and_zero_current_student_visible_subgroups_are_explicit():
    assert REVIEW["domain_id"] == "D030"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 7
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 0
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["role_count_is_not_used_to_set_specialization_count"] is True
    assert REVIEW["current_state"]["active_role_mappings"] == 46


def test_sources_support_candidate_boundaries_but_not_universal_taxonomy():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 6
    assert all(s["url"].startswith("https://") and s["locator"] and s["supports"] and s["does_not_support"] for s in sources.values())
    for area in REVIEW["candidate_specializations"]:
        assert area["source_ids"]
        assert set(area["source_ids"]) <= set(sources)
        assert area["boundary"]
    assert "not a universal count" in REVIEW["decision"]["count_status"]


def test_role_fit_and_adjacent_domain_boundaries_are_not_inferred_from_isco():
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
    assert "sales" in REVIEW["decision"]["parent_scope_issue"].lower()
    assert "product management" in REVIEW["decision"]["parent_scope_issue"].lower()
    assert "marketing analytics" in " ".join(area["label"] for area in REVIEW["candidate_specializations"]).lower()
    assert "current role counts" in REVIEW["criteria_disposition"]["role_fit"]


def test_cross_cutting_themes_and_jurisdictional_limits_are_documented():
    assert any(row["candidate"] == "Marketing Ethics and Essential Capabilities" for row in REVIEW["alternatives_and_boundaries"])
    assert "jurisdiction" in REVIEW["criteria_disposition"]["global_vs_local"]
    assert REVIEW["limitations"]
