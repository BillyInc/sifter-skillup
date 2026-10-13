import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-29_042_audiology_aud311.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def _row():
    document = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Audiology")
    return next(row for row in package["courses"] if row.get("code") == "AUD 311")


def test_aud311_source_and_checkpoint_locators_are_explicit():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["primary_source"]["accessed_on"] == "2026-09-29"
    assert "1276" in evidence["primary_source"]["global_structure_locator"]
    assert "2133-2160" in evidence["primary_source"]["detailed_course_locator"]
    assert evidence["next_cursor"]["next_course_code"] == "AUD 312"


def test_aud311_checkpoint_matches_current_row_without_editing_it():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    row = _row()
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (300, 1, "C", 15, None)
    assert len(row["skills_learned"]) == evidence["source_record"]["learning_outcome_count"] == 11
    assert "Allied Health Sciences" in row["skills_learned"][-1]
    assert len(row["content_summary"]) == evidence["local_comparison"]["content_summary_length"] == 400
    assert row["content_summary"].endswith("Professio")
    assert "\u2013" in row["content_summary"]
    assert not row.get("source_url") and not row.get("source_locator") and not row.get("source_accessed_on")
    assert evidence["adjacent_structure_finding"]["official_table_occurrences"] == 1
    assert evidence["adjacent_structure_finding"]["local_audiology_rows"] == 2
