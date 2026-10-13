import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_026_physio_pst414.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst414_source_anomaly_is_distinguished_from_local_mismatch():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_code"] == "PST 414"
    assert evidence["source_record"]["learning_outcome_count"] == 4
    patent_finding = next(item for item in evidence["findings"] if item["field"] == "learning outcome 4 wording 'patents'")
    assert patent_finding["disposition"] == "source_anomaly_candidate"
    assert "NUC source itself says" in patent_finding["basis"]
    assert "23970-23990" in evidence["primary_source"]["detailed_course_locator"]


def test_pst414_summary_is_complete_and_official_wording_anomaly_is_preserved():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 414"
    )
    assert course["ph"] is None
    assert len(course["skills_learned"]) == 4
    assert "patents" in course["skills_learned"][3]
    assert "lung-" in course["content_summary"] and "motor-function" in course["content_summary"]
    assert "quality of life" in course["content_summary"]
    assert "patents" in course["skills_learned"][3]
    assert "official NUC PST 414 outcome 4" in course["source_anomaly_note"]
    assert course["source_url"] == evidence["primary_source"]["url"]
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 415"
