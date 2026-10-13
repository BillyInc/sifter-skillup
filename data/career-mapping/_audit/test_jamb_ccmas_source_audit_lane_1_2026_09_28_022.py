import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_022_physio_pst326.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst326_checkpoint_has_exact_owner_and_source_locators():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["package_index"] == 38
    assert evidence["source_record"]["course_code"] == "PST 326"
    assert evidence["source_record"]["learning_outcome_count"] == 7
    assert "22873-22875" in evidence["primary_source"]["global_structure_locator"]
    assert "23868-23889" in evidence["primary_source"]["detailed_course_locator"]


def test_pst326_truncation_is_recorded_without_touching_product_data():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 326"
    )
    assert course["ph"] is None
    assert len(course["skills_learned"]) == 7
    assert len(course["content_summary"]) == 400
    assert course["content_summary"].endswith("maintenance")
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 411"
