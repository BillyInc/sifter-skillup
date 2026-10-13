import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_040.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
INHERITANCE = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"


def _row(path):
    rows = json.loads(path.read_text(encoding="utf-8"))["rows"]
    return next(row for row in rows if row["jamb_name"] == "INFORMATION AND COMMUNICATION SCIENCE")


def test_checkpoint_040_adjudicates_both_facets_and_each_existing_link_without_approving_weak_anchors():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["progress"]["named_facets_adjudicated"] == 2
    assert checkpoint["progress"]["current_domain_links_adjudicated"] == 4
    decisions = {row["domain_id"]: row for row in checkpoint["domain_link_decisions"]}
    assert decisions["D008"]["disposition"] == "supported_functional_link"
    assert decisions["D003"]["disposition"] == "anchor_does_not_support_ai_link"
    assert decisions["D005"]["disposition"] == "anchor_does_not_support_cloud_link"
    assert decisions["D140"]["disposition"] == "anchors_do_not_support_robotics_link"
    assert checkpoint["progress"]["identity_144_scope_and_domain_review_complete"] is True


def test_checkpoint_040_flags_source_count_scope_evidence_and_course_data_anomalies():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    findings = " ".join(item["finding"] for item in checkpoint["cross_artifact_and_provenance_findings"])
    assert "four domain_links" in findings and "domain_link_count=7" in findings
    assert "scope_evidence, source_contexts and unrepresented_facets are empty" in findings
    assert "27 skills_learned entries" in findings
    assert "ICT 201" in findings and "CSC 432" in findings and "IFT 442" in findings
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_040_findings_match_saved_scope_and_inheritance_artifacts():
    scope = _row(SCOPES)
    inheritance = _row(INHERITANCE)
    assert scope["jamb_name"] == "INFORMATION AND COMMUNICATION SCIENCE"
    assert scope["scope_evidence"] == []
    assert scope["source_contexts"] == []
    assert scope["unrepresented_facets"] == []
    assert len(scope["selected_courses"]) == 10
    assert inheritance["current_jamb_domain_link_count"] == 4
    assert inheritance["component_domain_evidence"][0]["domain_link_count"] == 7
    assert len(inheritance["domain_links"]) == 4
