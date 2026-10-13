import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_014_physio_pst316.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst316_checkpoint_records_exact_source_context_and_locators():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    scope = evidence["scope"]
    source = evidence["primary_source"]
    record = evidence["source_record"]
    assert scope["package_index"] == 38
    assert scope["programme_section"] == "DPT Physiotherapy"
    assert record["course_code"] == "PST 316"
    assert record["course_title"] == "Massage"
    assert record["units"] == 2
    assert record["lecture_hours"] == 15
    assert record["practical_hours"] == 45
    assert "22855-22856" in source["global_structure_locator"]
    assert "23686-23707" in source["detailed_course_locator"]
    assert len(record["learning_outcomes"]) == 7


def test_pst316_source_findings_are_repaired_and_provenance_is_retained():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 316"
    )
    assert evidence["local_comparison"]["content_summary_length"] == 400
    assert evidence["repair_handoff"]["ledger_edited"] is False
    assert "Allied Health Sciences" not in course["skills_learned"][-1]
    assert course["content_summary"].endswith("indications and contraindications.")
    assert course["source_accessed_on"] == "2026-09-29"
    assert "printed pp. 608-609" in course["source_locator"]
    assert evidence["local_comparison"]["identity_owner_title_units_status_hours"] == "match"
    assert {row["disposition"] for row in evidence["findings"]} >= {
        "confirmed_match",
        "confirmed_defect",
        "provenance_gap",
    }
