import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_013_physio_pst315.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst315_evidence_has_exact_owner_source_locators_and_scope():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    source = evidence["primary_source"]
    record = evidence["source_record"]
    assert evidence["scope"]["package_index"] == 38
    assert evidence["scope"]["programme"] == "Physiotherapy"
    assert record["course_code"] == "PST 315"
    assert record["course_title"] == "Kinesiology and Pathokinesiology"
    assert record["learning_outcome_count"] == 8
    assert len(record["course_content_topic_sequence"]) == 8
    assert "22843-22855" in source["global_structure_locator"]
    assert "23656-23685" in source["detailed_course_locator"]


def test_pst315_local_summary_truncation_is_recorded_and_ledger_is_unchanged():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    row = next(
        course
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for course in programme["courses"]
        if course.get("code") == "PST 315"
    )
    assert len(row["content_summary"]) == 400
    assert row["content_summary"].endswith("common activities of dail")
    assert len(row["skills_learned"]) == 8
    assert row["ph"] is None
    assert evidence["local_comparison"]["content_summary_truncated"] is True
    assert evidence["repair_handoff"]["ledger_edited"] is False
