import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_015_physio_pst317.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst317_checkpoint_uses_exact_owner_and_source_fields():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    source = evidence["source_record"]
    assert evidence["scope"]["package_index"] == 38
    assert evidence["scope"]["programme_section"] == "DPT Physiotherapy"
    assert source["course_code"] == "PST 317"
    assert source["course_title"] == "Exercise Therapy I: Introduction to Body Movements"
    assert (source["units"], source["status"], source["lecture_hours"]) == (2, "C", 30)
    assert "22856-22860" in evidence["primary_source"]["global_structure_locator"]
    assert "23708-23732" in evidence["primary_source"]["detailed_course_locator"]
    assert source["learning_outcome_count"] == 6


def test_pst317_summary_truncation_is_repaired_and_source_dash_is_not_inferred():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 317"
    )
    assert evidence["local_comparison"]["content_summary_length"] == 400
    assert evidence["repair_handoff"]["ledger_edited"] is False
    assert course["content_summary"].endswith("assessment of patient conditions.")
    assert len(course["skills_learned"]) == 6
    assert course["ph"] is None
    assert course["source_accessed_on"] == "2026-09-29"
    assert "printed p. 609" in course["source_locator"]
    assert evidence["local_comparison"]["content_summary_ends_mid_clause"] is True
