import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_019_physio_pst323.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst323_checkpoint_cites_exact_global_and_detail_source_rows():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_code"] == "PST 323"
    assert evidence["source_record"]["course_title"] == "Electrotherapy III: High Frequency Currents"
    assert evidence["source_record"]["learning_outcome_count"] == 5
    assert "22869-22871" in evidence["primary_source"]["global_structure_locator"]
    assert "23809-23829" in evidence["primary_source"]["detailed_course_locator"]


def test_pst323_local_mismatches_and_dash_semantics_are_preserved():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 323"
    )
    assert course["ph"] is None
    assert len(course["skills_learned"]) == 5
    assert "Allied Health Sciences" in course["skills_learned"][3]
    assert len(course["content_summary"]) == 400
    assert course["content_summary"].endswith("Production of HFC.")
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 324"
