import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_035.json"


def test_checkpoint_035_keeps_jamb_cells_distinct_and_faculty_occurrence_exact():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_036.json").read_text(encoding="utf-8"))
    assert checkpoint["scope"]["jamb_canonical_identity_row"] == 144  # original label retained for append-only history
    assert correction["progress"]["checkpoint_035_relabelled_identity"] == 173
    assert correction["progress"]["row_144_covered_by_checkpoint_035"] is False
    assert checkpoint["current_occurrence"]["institutions"] == ["FUHS-ILA"]
    assert checkpoint["current_occurrence"]["source_context_status"] == "source_text_confirmed"
    assert "Sciences.txt:417-420" in checkpoint["jamb_source"]["locator"]
    assert "411-416" in checkpoint["jamb_source"]["source_boundary"]


def test_checkpoint_035_documents_named_facet_scope_gap_and_source_course_candidates():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    scope = checkpoint["ccmas_scope"]["current_scope"]
    assert scope["component_refs"] == ["Sciences::Biotechnology"]
    assert scope["selected_course_count"] == 22
    assert "BTG 304" not in scope["selected_course_codes"]
    assert "BIO 414" not in scope["selected_course_codes"]
    findings = checkpoint["ccmas_scope"]["source_findings"]
    assert {x["course_code"] for x in findings} >= {"BTG 301", "BTG 302", "BTG 304", "BTG 305", "BIO 414"}
    assert checkpoint["progress"]["curriculum_scope_source_adjudication_closed"] is False


def test_checkpoint_035_captures_local_course_quality_and_derivative_conflicts():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    quality = checkpoint["ccmas_scope"]["local_course_quality_findings"]
    assert {x["code"] for x in quality} == {"BIO 414", "BTG 304"}
    flags = checkpoint["ccmas_scope"]["downstream_link_audit_flags"]
    assert any("reports seven links" in x["detail"].lower() for x in flags)
    assert any("D027" in x["detail"] for x in flags)
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False
