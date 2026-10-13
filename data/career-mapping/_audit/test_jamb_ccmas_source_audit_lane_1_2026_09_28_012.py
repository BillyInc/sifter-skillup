import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_012_physio_pst314.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst314_source_evidence_identifies_exact_programme_course_and_locators():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    source = evidence["primary_source"]
    record = evidence["source_record"]
    assert evidence["scope"]["package_index"] == 38
    assert evidence["scope"]["programme"] == "Physiotherapy"
    assert record["course_code"] == "PST 314"
    assert record["course_title"] == "Practical Electrotherapy I"
    assert record["practical_hours"] == 45
    assert "22843-22855" in source["global_structure_locator"]
    assert "23646-23655" in source["detailed_course_locator"]
    assert source["url"].startswith("https://www.nuc.edu.ng/")


def test_pst314_local_defects_and_repair_are_recorded_without_editing_ledger():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    row = next(
        course
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for course in programme["courses"]
        if course.get("code") == "PST 314"
    )
    assert row["ph"] is None
    assert row["content_summary"] is None
    assert row["skills_learned"][3].endswith("Allied Health Sciences               608               New")
    assert evidence["local_comparison"]["practical_hours"] is None
    assert evidence["repair_handoff"]["ledger_edited"] is False
    findings = {finding["field"]: finding["result"] for finding in evidence["findings"]}
    assert findings["level_units_status_and_hours"] == "confirmed_local_defect"
    assert findings["learning_outcomes"] == "confirmed_extraction_contamination"
