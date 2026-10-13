import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-29_043_audiology_aud312_duplicate.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def _rows():
    document = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Audiology")
    return [row for row in package["courses"] if row.get("code") == "AUD 312"]


def test_aud312_checkpoint_confirms_one_source_course_and_two_local_rows():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["source_record"]["source_occurrences_global_table"] == 1
    assert evidence["source_record"]["source_occurrences_detailed_block"] == 1
    assert evidence["primary_source"]["accessed_on"] == "2026-09-29"
    assert "1277" in evidence["primary_source"]["global_structure_locator"]
    assert "2161-2186" in evidence["primary_source"]["detailed_course_locator"]
    assert evidence["local_reconciliation_handoff"]["do_not_silently_delete_or_merge"] is True


def test_both_aud312_rows_retain_the_checkpointed_conflicts_and_defects():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    rows = _rows()
    assert len(rows) == 2
    assert [(row["units"], row["lh"]) for row in rows] == [(1, 15), (2, 30)]
    assert all(len(row["skills_learned"]) == 9 for row in rows)
    assert "some advanced auditory tests" in rows[0]["skills_learned"][3]
    assert "Allied Health Sciences" in rows[1]["skills_learned"][4]
    assert [len(row["content_summary"]) for row in rows] == [400, 400]
    assert rows[0]["content_summary"].endswith("Co")
    assert rows[1]["content_summary"].endswith("cooperat")
    assert all(not row.get("source_url") and not row.get("source_locator") and not row.get("source_accessed_on") for row in rows)
    findings = {row["field"]: row["disposition"] for row in evidence["findings"]}
    assert findings["duplicate local course occurrences"] == "confirmed_structural_duplicate"
    assert findings["learning outcomes in both rows"] == "confirmed_outcome_merge_and_omission"
