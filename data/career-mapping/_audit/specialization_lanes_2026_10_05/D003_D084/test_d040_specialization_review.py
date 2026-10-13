import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D040_specialization_review.json").read_text(encoding="utf-8"))


def test_areas_are_source_informed_and_not_copied_from_current_rows():
    assert REVIEW["domain_id"] == "D040"
    assert REVIEW["decision"]["count"] == len(REVIEW["candidate_specializations"]) == 4
    assert REVIEW["current_state"]["current_visible_specialization_count"] == 3
    assert REVIEW["current_state"]["current_records_used_to_set_candidate_count"] is False
    assert REVIEW["current_state"]["active_role_mappings"] == 0


def test_sources_support_practice_distinctions_not_a_fixed_taxonomy():
    sources = {row["source_id"]: row for row in REVIEW["source_register"]}
    assert len(sources) == 4
    assert all(row["url"].startswith("https://") and row["locator"] and row["supports"] and row["does_not_support"] for row in sources.values())
    assert all(set(area["source_ids"]) <= set(sources) for area in REVIEW["candidate_specializations"])
    assert "not a fixed or externally mandated taxonomy" in REVIEW["decision"]["disposition"]


def test_school_support_and_generic_coaching_boundaries_are_explicit():
    assert "zero active role mappings" in REVIEW["decision"]["disposition"]
    assert "school classroom assistance" in REVIEW["decision"]["disposition"]
    assert "school-level classroom support" in REVIEW["alternatives_and_boundaries"][1]["reason"]
    assert "Nigerian-specific titles" in REVIEW["criteria_disposition"]["global_vs_local"]
