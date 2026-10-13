import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_027_physio_pst415.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst415_source_phrase_anomaly_and_scope_are_explicit():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_code"] == "PST 415"
    assert evidence["source_record"]["learning_outcome_count"] == 6
    assert "patents" not in evidence["source_record"]["course_title"].lower()
    phrase_finding = next(item for item in evidence["findings"] if "fifth vital signs" in item["field"])
    assert phrase_finding["disposition"] == "source_anomaly_candidate"
    assert "23992-24012" in evidence["primary_source"]["detailed_course_locator"]


def test_pst415_summary_is_complete_and_source_phrase_is_documented():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 415"
    )
    assert course["ph"] is None
    assert len(course["skills_learned"]) == 6
    assert "multidimensional" in course["content_summary"]
    assert "pharmacologic and non-pharmacologic" in course["content_summary"]
    assert "Pain as a fifth vital signs" in course["source_anomaly_note"]
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 416"
