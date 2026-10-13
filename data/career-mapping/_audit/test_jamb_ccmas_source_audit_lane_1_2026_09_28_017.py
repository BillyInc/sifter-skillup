import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_017_physio_pst321.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst321_exact_course_evidence_and_prior_table_coverage_are_recorded():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["package_index"] == 38
    assert evidence["source_record"]["course_code"] == "PST 321"
    assert evidence["source_record"]["practical_hours"] == 45
    assert evidence["source_record"]["learning_outcome_count"] == 10
    assert "ccmas_physiotherapy_source_audit_2026-09-28_001.md" in evidence["prior_coverage_reused"][0]["artifact"]
    assert "22863-22865" in evidence["primary_source"]["global_structure_locator"]
    assert "23767-23782" in evidence["primary_source"]["detailed_course_locator"]


def test_pst321_repair_matches_audited_findings_and_preserves_pst318_conflict():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 321"
    )
    assert evidence["local_comparison"]["practical_hours"]["local"] is None
    assert evidence["local_comparison"]["content_summary"] is None
    assert course["ph"] == 45
    assert "PST 318" in course["content_summary"]
    assert "remains unresolved" in course["content_summary"]
    assert len(course["skills_learned"]) == 10
    assert course["skills_learned"][3] == "measure range of motion of peripheral and spinal joints;"
    assert course["source_url"] == evidence["primary_source"]["url"]
    assert course["source_accessed_on"] == evidence["access_date"]
    assert evidence["source_conflict"]["reference"] == "PST 318"
    assert evidence["source_conflict"]["disposition"] == "unresolved_source_internal_conflict"
