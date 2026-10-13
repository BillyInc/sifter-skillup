import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_018_physio_pst322.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst322_uses_existing_table_adjudication_and_exact_detail_locator():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_code"] == "PST 322"
    assert evidence["source_record"]["units"] == 2
    assert evidence["source_record"]["lecture_hours"] == 30
    assert evidence["source_record"]["practical_hours"].startswith("none")
    assert "ccmas_physiotherapy_source_audit_2026-09-28_001.md" in evidence["prior_coverage_reused"][0]["artifact"]
    assert "22866-22868" in evidence["primary_source"]["global_structure_locator"]
    assert "23783-23808" in evidence["primary_source"]["detailed_course_locator"]


def test_pst322_repair_preserves_matching_outcomes_and_dash_semantics():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 322"
    )
    assert course["units"] == 2
    assert course["lh"] == 30
    assert course["ph"] is None
    assert course["title"] == evidence["source_record"]["course_title"]
    assert len(course["skills_learned"]) == 6
    assert all(topic in course["content_summary"].casefold() for topic in ("ultraviolet", "ultrasound", "laser"))
    assert course["source_url"] == evidence["primary_source"]["url"]
    assert course["source_accessed_on"] == evidence["access_date"]
    assert evidence["local_reconciliation_handoff"]["status"] == "ready_for_local_reconciliation"
    assert evidence["local_reconciliation_handoff"]["product_ledger_edited_in_audit"] is False
    assert evidence["next_cursor"]["next_course_code"] == "PST 323"
