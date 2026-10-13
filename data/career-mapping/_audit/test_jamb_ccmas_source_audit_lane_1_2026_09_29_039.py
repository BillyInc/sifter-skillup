import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-29_039_physio_pst421_pst423_coverage.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def _course(code):
    document = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Physiotherapy")
    return next(row for row in package["courses"] if row.get("code") == code)


def test_checkpoint_records_primary_source_and_next_uncovered_package():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["primary_source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert evidence["primary_source"]["accessed_on"] == "2026-09-29"
    assert evidence["next_cursor"] == {
        "next_ccmas_package_index": 39,
        "package": "Allied Health Sciences / Audiology",
        "instruction": "Check the exact source checkpoint coverage first; continue with the first uncovered Audiology course/source occurrence.",
    }
    assert evidence["shared_curriculum_or_offering_ledger_edited"] is False


def test_pst421_current_row_matches_recorded_nuc_comparison():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    record = next(row for row in evidence["comparisons"] if row["course_code"] == "PST 421")
    course = _course("PST 421")
    assert course["title"] == record["course_title"]
    assert (course["units"], course["status"], course["lh"], course["ph"]) == (2, "C", 30, 0)
    assert len(course["skills_learned"]) == record["detailed_block"]["learning_outcome_count"] == 6
    assert course["source_url"] == evidence["primary_source"]["url"]
    assert course["source_locator"] and course["source_accessed_on"] == "2026-09-26"
    assert "spinal column" in course["content_summary"].lower()


def test_pst423_current_row_matches_recorded_nuc_comparison_and_is_footer_clean():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    record = next(row for row in evidence["comparisons"] if row["course_code"] == "PST 423")
    course = _course("PST 423")
    assert course["title"] == record["course_title"]
    assert (course["units"], course["status"], course["lh"], course["ph"]) == (1, "C", 0, 45)
    assert len(course["skills_learned"]) == record["detailed_block"]["learning_outcome_count"] == 3
    assert course["source_url"] == evidence["primary_source"]["url"]
    assert course["source_locator"] and course["source_accessed_on"] == "2026-09-26"
    assert "euthanasia" in course["content_summary"].lower()
    assert "allied health sciences" not in course["content_summary"].lower()
