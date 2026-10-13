import json
import sys
from pathlib import Path


HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from reconcile_shared_specialization_register import shared_evidence, shared_review  # noqa: E402


def test_lane_review_adapts_to_shared_register_without_inventing_visibility():
    source = json.loads((HERE / "D061_specialization_review.json").read_text(encoding="utf-8"))
    adapted = shared_review(source)
    assert adapted["domain_id"] == "D061"
    assert adapted["specialization_count"] == 3
    assert adapted["current_visible_specialization_count"] is None
    assert "null is intentional" in adapted["current_subgroup_record_basis"]
    assert adapted["external_academic_signoff_status"] == "not_obtained"


def test_legacy_d059_source_and_specialization_fields_are_preserved():
    source = json.loads((HERE / "D059_specialization_review.json").read_text(encoding="utf-8"))
    adapted = shared_review(source)
    assert adapted["domain_id"] == "D059"
    assert adapted["specialization_count"] == 2
    assert all(row["source_ids"] for row in adapted["specializations"])
    assert all(row["sources"] for row in adapted["specializations"])
    evidence = shared_evidence(source)
    assert all(item["claim_supported"] and item["claim_limit"] for item in evidence)


def test_d059_lane_and_shared_register_have_six_criteria_and_auditable_evidence():
    lane = json.loads((HERE / "D059_specialization_review.json").read_text(encoding="utf-8"))
    register = json.loads((HERE.parents[2] / "_audit" / "domain_specialization_review_2026_10_03.json").read_text(encoding="utf-8"))
    shared = next(row for row in register["domain_reviews"] if row["domain_id"] == "D059")
    required = {
        "S1_PARENT_DOMAIN_FIT",
        "S2_RECOGNIZED_AREA",
        "S3_DISTINCT_BOUNDARIES",
        "S4_SET_COVERAGE_AND_COUNT",
        "S5_STUDENT_FACING_CLARITY",
        "S6_ROLE_SEPARATION",
    }
    assert required <= set(lane["criteria_disposition"])
    assert required <= set(shared["criteria_disposition"])
    urls = {row["url"] for row in lane["source_register"] if row.get("url")}
    assert len(urls) >= 2
    assert lane["decision"]["alternatives_considered"]
    assert lane["limitations"]
    assert any("role-to-domain" in value for value in lane["criteria_disposition"].values())
    assert len(shared["alternatives_considered"]) >= 2
    assert shared["uncertainties"]


def test_reconciliation_does_not_mark_provisional_reviews_closed_or_change_role_state():
    source = json.loads((HERE / "D064_specialization_review.json").read_text(encoding="utf-8"))
    adapted = shared_review(source)
    assert adapted["review_status"].startswith("provisional_")
    assert "no canonical taxonomy or role mapping was changed" in adapted["boundary_notes"][0]


def test_shared_register_contains_newly_reconciled_source_reviewed_lane_entries():
    register = json.loads((HERE.parents[2] / "_audit" / "domain_specialization_review_2026_10_03.json").read_text(encoding="utf-8"))
    reviews = {row["domain_id"]: row for row in register["domain_reviews"]}
    evidence = {row["source_id"] for row in register["evidence_register"]}
    assert {"D059", "D061"} <= set(reviews)
    assert reviews["D059"]["specialization_count"] == 2
    assert reviews["D061"]["specialization_count"] == 3
    assert "NASA_SMALLSAT_SPACECRAFT_SYSTEMS" in evidence
    assert "CII_CURRENT_CLAIMS_UNDERWRITING_PATHWAY" in evidence
    assert "D067" not in reviews and "D068" not in reviews
