import json
from pathlib import Path


HERE = Path(__file__).resolve().parent


def load(name):
    return json.loads((HERE / name).read_text(encoding="utf-8-sig"))


def test_d099_d112_all_have_domain_specific_reviews_and_evidence_limits():
    ids = [f"D{n:03d}" for n in range(99, 113)]
    for did in ids:
        review = load(f"{did}_specialization_candidate_review_2026_10_05.json")
        assert review["domain_id"] == did
        assert review["domain_name"] != did
        assert review["candidate_areas"]
        assert review["boundary_and_exclusion_rules"]
        assert review["evidence"]
        assert all(e.get("url") and e.get("locator") and e.get("limitation") for e in review["evidence"])
        assert review["explicit_non_decisions"]
        assert bool(review["source_triage_excerpt"]) == (did in {"D101", "D104", "D105", "D107", "D109", "D110", "D111", "D112"})


def test_provenance_crosswalk_covers_all_thirteen_existing_reviews():
    audit = load("d085_d097_source_provenance_audit_001.json")
    assert audit["domain_count"] == 13
    assert audit["domains_passed"] == 13
    assert audit["domains_requiring_repair"] == 0
    assert audit["source_reference_count"] == 97
    assert audit["unique_source_id_count"] == 60
    assert all(not ref["issues"] for domain in audit["domains"] for ref in domain["references"])


def test_d098_adjudicates_metrology_route_and_four_area_composition_without_role_assignment():
    review = load("d098_three_vs_four_area_adjudication_001.json")
    assert "FOUR" in review["count_disposition"]
    assert "distinct specialist learning route" in review["metrology_independent_route_finding"]
    assert len(review["recommended_internal_candidate_set"]) == 4
    labels = [x["label"] for x in review["recommended_internal_candidate_set"]]
    assert any("Metrology" in x for x in labels)
    assert any("Horology" in x for x in labels)
    assert review["canonical_write"] is False


def test_computational_title_reconciliation_uses_exact_same_domain_only():
    review = load("computational_unmatched_title_reconciliation_001.json")
    assert len(review["signals"]) == 4
    statuses = {(x["domain_id"], x["signal_title"]): x["disposition"] for x in review["signals"]}
    assert statuses[("D139", "technical artist")] == "exact_local_title_found"
    assert statuses[("D140", "robotics engineer")] == "exact_local_title_found"
    assert statuses[("D139", "gameplay programmer")] == "no_exact_local_title_or_known_alias"
    assert statuses[("D139", "game environment artist")] == "no_exact_local_title_or_known_alias"
    gameplay = next(x for x in review["signals"] if x["signal_title"] == "gameplay programmer")
    assert gameplay["containing_titles_not_promoted_to_exact_match"]
    assert review["canonical_roles_changed"] is False
