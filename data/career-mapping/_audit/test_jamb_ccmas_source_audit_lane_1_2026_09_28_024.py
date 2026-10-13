import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_024_physio_pst412.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst412_checkpoint_cites_exact_dpt_row_and_course_block():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_code"] == "PST 412"
    assert evidence["source_record"]["programme_owner"] == "DPT Physiotherapy"
    assert evidence["source_record"]["learning_outcome_count"] == 6
    assert "22878-22881" in evidence["primary_source"]["global_structure_locator"]
    assert "23920-23945" in evidence["primary_source"]["detailed_course_locator"]


def test_pst412_local_repair_removes_only_footer_and_completes_content():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 412"
    )
    assert course["ph"] is None
    assert len(course["skills_learned"]) == 6
    assert "Allied Health Sciences" not in course["skills_learned"][4]
    assert "spondylolisthesis" in course["content_summary"]
    assert "joint replacements" in course["content_summary"]
    assert course["source_accessed_on"] == evidence["access_date"]
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 413"
