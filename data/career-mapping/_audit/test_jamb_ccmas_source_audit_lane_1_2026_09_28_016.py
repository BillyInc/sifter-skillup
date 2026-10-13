import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = Path(__file__).resolve().parent
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_016_physio_pst320.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst320_detailed_checkpoint_reuses_prior_global_table_audit():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["package_index"] == 38
    assert evidence["source_record"]["course_code"] == "PST 320"
    assert evidence["source_record"]["learning_outcome_count"] == 8
    assert "ccmas_physiotherapy_source_audit_2026-09-28_001.md" in evidence["prior_coverage_reused"][0]["artifact"]
    assert "22860-22862" in evidence["primary_source"]["global_structure_locator"]
    assert "23733-23766" in evidence["primary_source"]["detailed_course_locator"]


def test_pst320_audit_mismatches_are_repaired_with_item_level_provenance():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 320"
    )
    assert course["ph"] == 45
    assert evidence["local_comparison"]["content_summary_length"] == 400
    assert evidence["repair_handoff"]["ledger_edited"] is False
    assert course["content_summary"].endswith("individual/group exercise-programme design and prescription.")
    assert len(course["skills_learned"]) == 8
    assert course["source_accessed_on"] == "2026-09-29"
    assert "printed p. 610" in course["source_locator"]
    assert [finding["disposition"] for finding in evidence["findings"]].count("confirmed_defect") == 2
