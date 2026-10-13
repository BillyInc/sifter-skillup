import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPORT = HERE / "D057_D112_existing_role_area_fit_deterministic_2026_10_07.json"
PRIOR = HERE / "D057_D112_existing_role_area_fit_review_2026_10_07.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def by_key(report):
    return {row["role_key"]: row for row in report["roles"]}


def test_batch_covers_every_role_and_keeps_area_fit_separate_from_parent_fit():
    report = load(REPORT)
    assert report["counts"]["active_role_records"] == 1034
    assert report["counts"]["unique_role_keys"] == 1034
    assert len({row["role_key"] for row in report["roles"]}) == 1034
    assert all(row["parent_domain_fit"]["status"] for row in report["roles"])
    assert all(row["decision"]["status"] for row in report["roles"])
    assert report["method"]["excluded_inputs"]
    assert "ISCO/ESCO" in " ".join(report["method"]["excluded_inputs"])


def test_selected_area_routes_have_area_source_citations_and_locators():
    report = load(REPORT)
    selected = [row for row in report["roles"] if row["decision"]["status"] == "supported"]
    assert selected, "The deterministic pass should retain its actually supported routes."
    for row in selected:
        decision = row["decision"]
        assert decision["selected_area_key"]
        assert decision["area_source_urls"], row["role_key"]
        assert decision["area_source_ids"], row["role_key"]
        assert decision["area_evidence_locators"], row["role_key"]
        assert decision["automatic_acceptance_rule_passed"] is True


def test_generic_phrase_overlap_does_not_auto_assign_unrelated_roles():
    report = by_key(load(REPORT))
    false_positive_prone = {
        "D066|veterinary nurse": "Laboratory Animal Science and Veterinary Research",
        "D066|animal behaviourist": "Livestock, Poultry and Aquatic Animal Health and Production",
        "D066|aquatic animal health professional": "Laboratory Animal Science and Veterinary Research",
        "D088|aesthetician": "Body Therapy and Massage",
        "D090|pet sitter": "Animal Grooming and Coat Care",
        "D095|tyre fitter": "Heavy-Vehicle Service and Repair",
        "D070|lighting technician": "Live Performance Production and Technical Theatre",
    }
    for role_key, weakly_matched_area in false_positive_prone.items():
        row = report[role_key]
        decision = row["decision"]
        assert not (
            decision["status"] == "supported"
            and decision["selected_area_label"] == weakly_matched_area
        ), (role_key, decision)


def test_prior_explicit_decisions_remain_traceable_without_being_silently_dropped():
    prior = by_key(load(PRIOR))
    report = by_key(load(REPORT))
    explicit_prior = {
        key for key, row in prior.items()
        if row["area_fit"]["status"] != "review_required"
    }
    assert len(explicit_prior) == 15
    assert explicit_prior <= set(report)
    for key in explicit_prior:
        assert report[key].get("prior_explicit_disposition_validation", {}).get(
            "present_in_prior_review"
        ) is True
