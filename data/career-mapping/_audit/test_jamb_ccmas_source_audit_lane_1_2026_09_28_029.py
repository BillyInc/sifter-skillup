import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_029_physio_pst422.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst422_original_findings_are_recorded_and_current_row_is_reconciled():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 422"
    )
    assert course["units"] == 2 and course["status"] == "C"
    assert course["lh"] is None and course["ph"] == 90
    assert len(course["skills_learned"]) == 4
    assert len(course["content_summary"]) > 400
    assert "Guillain-Barre syndrome" in course["content_summary"]
    assert course["source_url"].endswith("Allied-Health-Sciences-2023.pdf")
    assert course["source_accessed_on"] == "2026-09-29"
    assert evidence["source_record"]["practical_hours"] == 90
    assert evidence["local_comparison"]["course_content_summary_truncated"] is True
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False


def test_pst422_source_outcome_anomaly_is_preserved_and_flagged():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    anomaly = next(
        finding
        for finding in evidence["findings"]
        if finding["field"] == "learning outcome 3"
    )
    assert anomaly["disposition"] == "source_anomaly_candidate"
    assert "orthopaedic" in evidence["source_record"]["learning_outcome_topics"][2]
    assert "do not silently" in anomaly["basis"].casefold()
    current = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 422"
    )
    assert "orthopaedic conditions" in current["skills_learned"][2]
    assert "orthopaedic conditions" in current["source_conflict_note"]
    assert evidence["next_cursor"]["next_course_code"] == "PST 424"
