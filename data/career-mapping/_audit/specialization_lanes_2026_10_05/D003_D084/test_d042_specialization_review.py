import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D042_specialization_review.json").read_text(encoding="utf-8"))


def test_review_detects_live_performance_audiovisual_parent_scope_mix():
    assert REVIEW["domain_id"] == "D042"
    assert REVIEW["current_state"]["active_role_mappings"] == 101
    assert REVIEW["current_state"]["visible_subgroup_count"] == 3
    assert len(REVIEW["current_state"]["visible_subgroups"]) == 3
    assert "Performing Arts and Entertainment" in REVIEW["decision"]["disposition"]
    assert "Music Production" in REVIEW["decision"]["disposition"]


def test_candidate_areas_are_provisional_and_not_derived_from_current_count():
    decision = REVIEW["decision"]
    areas = REVIEW["candidate_specializations"]
    assert decision["candidate_count"] == len(areas) == 6
    assert "no source prescribes six areas" in decision["candidate_count_status"]
    assert REVIEW["current_state"]["records_used_to_set_candidate_count"] is False
    assert all(area["boundary"] and area["source_ids"] for area in areas)


def test_computational_is_not_inferred_from_media_technology_use():
    assert "not by themselves computational specializations" in REVIEW["decision"]["computational_disposition"]
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")


def test_every_cited_candidate_source_resolves():
    sources = {source["source_id"] for source in REVIEW["sources"]}
    assert {source for area in REVIEW["candidate_specializations"] for source in area["source_ids"]} <= sources
    assert {"UNESCO_CULTURAL_DOMAIN_GLOSSARY", "SCREENSKILLS_FILM_TV_MAP", "EBU_PRODUCTION_TECHNOLOGY"} <= sources
