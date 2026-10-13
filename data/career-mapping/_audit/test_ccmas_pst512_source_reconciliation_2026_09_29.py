import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_033_physio_pst512.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst512_confirmed_course_fields_and_provenance_are_reconciled():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 512"
    )
    assert course["title"] == "Physiotherapy Clinical Rotation in Neurology-II"
    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (500, 2, "C", None, 90)
    assert len(course["skills_learned"]) == 4
    assert "communicating management information" in course["content_summary"]
    assert course["source_url"] == URL
    assert "printed p. 589" in course["source_locator"] and "printed p. 621" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst512_title_variation_is_disclosed_without_duplication():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 512"
    )
    assert "detailed course heading" in course["source_conflict_note"]
    assert "omits the suffix II" in course["source_conflict_note"]
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["coverage_reconciliation"]["PST511_disposition"] == "skipped_as_already_source_checked_and_repaired"
    assert evidence["next_cursor"]["next_course_code"] == "PST 513"
