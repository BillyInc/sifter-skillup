import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_025_physio_pst413.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst413_source_table_and_detail_title_variation_is_explicit():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["source_record"]["course_code"] == "PST 413"
    assert evidence["source_record"]["units"] == 2
    assert evidence["source_record"]["practical_hours"] == 90
    assert evidence["source_record"]["learning_outcome_count"] == 5
    assert "22882-22884" in evidence["primary_source"]["global_structure_locator"]
    assert "23946-23969" in evidence["primary_source"]["detailed_course_locator"]
    assert evidence["source_conflict"]["disposition"] == "source_internal_title_variation"


def test_pst413_local_repair_matches_table_load_and_retains_title_variation():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 413"
    )
    assert course["units"] == 2 and course["lh"] is None and course["ph"] == 90
    assert course["title"] == evidence["source_record"]["global_table_title"]
    assert len(course["skills_learned"]) == 5
    assert "skin protection and repair" in course["content_summary"]
    assert "detail title" in course["source_locator"]
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 414"
