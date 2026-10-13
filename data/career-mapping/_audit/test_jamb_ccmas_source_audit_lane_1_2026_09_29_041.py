import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-29_041_audiology_aud321.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def _row():
    document = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Audiology")
    return next(row for row in package["courses"] if row.get("code") == "AUD 321")


def test_aud321_checkpoint_has_primary_locators_and_keeps_title_conflict():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["prior_coverage_checked"]["exact_course_source_checkpoint_previously_present"] is False
    assert evidence["primary_source"]["accessed_on"] == "2026-09-29"
    assert "1269-1271" in evidence["primary_source"]["global_structure_locator"]
    assert "2025-2051" in evidence["primary_source"]["detailed_course_locator"]
    title_finding = next(row for row in evidence["findings"] if row["field"] == "global versus detailed course title")
    assert title_finding["disposition"] == "source_internal_conflict_preserve_both"


def test_aud321_row_matches_checkpointed_findings_without_mutation():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    row = _row()
    assert (row["level"], row["units"], row["status"]) == (300, 6, "C")
    assert row["lh"] is None and row["ph"] is None
    assert len(row["skills_learned"]) == evidence["source_record"]["learning_outcome_count"] == 12
    assert "Allied Health Sciences" in row["skills_learned"][3]
    assert "12 weeks" not in row["content_summary"]
    assert not row.get("source_url") and not row.get("source_locator") and not row.get("source_accessed_on")
    findings = {item["field"]: item["disposition"] for item in evidence["findings"]}
    assert findings["practical_hours"] == "confirmed_local_omission"
    assert findings["learning_outcome_4"] == "confirmed_extraction_contamination"
    assert findings["placement_description"] == "confirmed_summary_omission"
