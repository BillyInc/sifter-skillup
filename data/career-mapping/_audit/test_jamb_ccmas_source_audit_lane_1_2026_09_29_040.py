import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-29_040_audiology_aud320.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def _row():
    document = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Audiology")
    return next(row for row in package["courses"] if row.get("code") == "AUD 320")


def test_aud320_checkpoint_has_authoritative_source_and_next_cursor():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["primary_source"]["url"] == "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
    assert evidence["primary_source"]["accessed_on"] == "2026-09-29"
    assert "p. 34" in evidence["primary_source"]["global_structure_locator"]
    assert "1268" in evidence["primary_source"]["global_structure_locator"]
    assert "2005-2024" in evidence["primary_source"]["detailed_course_locator"]
    assert evidence["next_cursor"]["next_course_code_to_coverage_check"] == "AUD 321"
    assert evidence["local_reconciliation_handoff"]["shared_curriculum_or_offering_ledger_edited"] is False


def test_aud320_current_row_matches_checkpoint_and_records_both_findings():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    comparison = evidence["local_comparison"]
    row = _row()
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (300, 1, "C", 15, None)
    assert len(row["skills_learned"]) == evidence["source_record"]["learning_outcome_count"] == 9
    assert len(row["content_summary"]) == comparison["content_summary_length"] == 400
    assert row["content_summary"].endswith("soci")
    assert not row.get("source_url") and not row.get("source_locator") and not row.get("source_accessed_on")
    dispositions = {finding["disposition"] for finding in evidence["findings"]}
    assert "confirmed_truncation" in dispositions
    assert "confirmed_gap" in dispositions
