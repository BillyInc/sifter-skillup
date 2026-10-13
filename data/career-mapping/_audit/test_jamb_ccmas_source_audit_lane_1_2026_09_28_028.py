import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_028_physio_pst416.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst416_source_hour_conflict_is_explicit_and_not_promoted():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    hours = evidence["source_record"]["lecture_hours"]
    assert hours == {
        "global_table_extraction": 15,
        "detailed_block_heading": 30,
        "adjudicated_value": None,
        "conflict": True,
    }
    assert evidence["local_reconciliation_handoff"]["fields_held_pending_source_resolution"] == [
        "lecture_hours",
        "practical_hours",
    ]


def test_pst416_local_outcomes_match_and_reconciliation_repairs_checkpointed_summary_defect():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 416"
    )
    assert course["units"] == 1 and course["status"] == "C"
    assert course["lh"] is None and course["ph"] is None
    assert len(course["skills_learned"]) == evidence["source_record"]["learning_outcome_count"] == 6
    # Increment 028 records the original 400-character truncation as evidence;
    # local reconciliation has since restored the remaining source topics.
    assert evidence["local_comparison"]["course_content_summary_length"] == 400
    assert evidence["local_comparison"]["course_content_summary_cutoff"] == "ends mid-word at 'healthca'"
    assert len(course["content_summary"]) > 400
    assert "healthcare environments" in course["content_summary"].lower()
    assert "handwashing" in course["content_summary"].lower()
    assert course.get("source_url") == evidence["primary_source"]["url"]
    assert course.get("source_accessed_on") == evidence["access_date"]
    assert course.get("source_locator")
    handoff = evidence["local_reconciliation_handoff"]
    assert handoff["status"] == "ready_for_local_reconciliation"
    assert handoff["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 422"
