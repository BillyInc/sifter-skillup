import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_020_physio_pst324.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst324_checkpoint_reuses_table_and_records_exact_detail_source():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_code"] == "PST 324"
    assert evidence["source_record"]["course_description"] == "Practical demonstration of PST 322 and PST 323."
    assert len(evidence["source_record"]["learning_outcomes"]) == 2
    assert "ccmas_physiotherapy_source_audit_2026-09-28_001.md" in evidence["prior_coverage_reused"][0]["artifact"]
    assert "22872-22873" in evidence["primary_source"]["global_structure_locator"]
    assert "23830-23836" in evidence["primary_source"]["detailed_course_locator"]


def test_pst324_missing_practical_hours_and_summary_are_handed_off_only():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 324"
    )
    assert course["ph"] is None
    assert course["lh"] is None
    assert course["content_summary"] is None
    assert len(course["skills_learned"]) == 2
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 325"
