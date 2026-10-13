import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_041.json"


def test_checkpoint_041_is_a_bounded_five_course_computer_science_source_batch():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["jamb_canonical_identity_row"] == 145
    assert checkpoint["scope"]["course_codes"] == ["GST 111", "GST 112", "MTH 101", "MTH 102", "PHY 101"]
    assert checkpoint["progress"]["rows_source_adjudicated"] == 5
    assert checkpoint["progress"]["missing_content_rows"] == 5
    assert checkpoint["progress"]["row_145_combined_scope_closed"] is False
    assert checkpoint["reconciliation_handoff"]["shared_product_ledgers_edited"] is False


def test_checkpoint_041_matches_local_scope_rows_and_preserves_component_boundary():
    rows = json.loads(SCOPES.read_text(encoding="utf-8"))["rows"]
    row = next(item for item in rows if item["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS")
    courses = row["selected_courses"][:5]
    assert [course["code"] for course in courses] == ["GST 111", "GST 112", "MTH 101", "MTH 102", "PHY 101"]
    assert all(course["source_ccmas_programme"] == "Computer Science" for course in courses)
    assert all(course["content_summary"] is None for course in courses)
    assert all(course["learning_outcomes"] for course in courses)
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert "Do not mark the Economics component" in checkpoint["reconciliation_handoff"]["source_scope_rule"]


def test_checkpoint_041_preserves_low_severity_source_variants_and_editorial_text():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    text = json.dumps(checkpoint, ensure_ascii=False)
    assert "Individual, norms and values" in text
    assert "Algebra and Trigonometry" in text
    assert "scalars" in text
    assert "does not authorize copying" in checkpoint["cross_row_findings"][1]["finding"]
