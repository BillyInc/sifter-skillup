import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_023_physio_pst411_womens_health.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_dpt_pst411_is_source_joined_by_programme_context_not_code_alone():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["source_record"]["programme_owner"] == "DPT Physiotherapy"
    assert evidence["source_record"]["course_code"] == "PST 411"
    assert evidence["source_record"]["course_title"] == "Physiotherapy in Women's Health"
    assert evidence["source_record"]["learning_outcome_count"] == 7
    distinct = evidence["primary_source"]["distinct_same_code_occurrence"]
    assert distinct["programme"] == "Speech-Language Therapy"
    assert distinct["course_title"] == "Research Methods in Medical Rehabilitation"
    assert "23891-23919" in evidence["primary_source"]["detailed_course_locator"]


def test_dpt_pst411_local_summary_and_separate_context_rows_are_recorded():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    programmes = json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
    rows = [
        row
        for programme in programmes
        for row in programme["courses"]
        if row.get("code") == "PST 411"
    ]
    dpt = next(row for row in rows if row["title"] == "Physiotherapy in Women's Health")
    slt = next(row for row in rows if row["title"] == "Research Methods in Medical Rehabilitation")
    assert len(rows) == 2
    assert len(dpt["skills_learned"]) == 7
    assert len(slt["skills_learned"]) == 12
    assert len(dpt["content_summary"]) == 400
    assert dpt["content_summary"].endswith("cephalopelvic dispropor")
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 412"
