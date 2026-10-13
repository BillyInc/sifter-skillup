import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_030_physio_pst424.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst424_content_and_provenance_repaired_from_the_detailed_source():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 424"
    )
    assert "return-to-play criteria" in course["content_summary"]
    assert "anthropometric evaluation" in course["content_summary"]
    assert len(course["skills_learned"]) == 5
    assert course["source_url"] == URL
    assert "printed p. 588" in course["source_locator"] and "printed p. 619" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst424_source_internal_workload_conflict_is_held_without_guessing():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 424"
    )
    assert (course["lh"], course["ph"]) == (30, None)
    assert "printed p. 588" in course["source_conflict_note"]
    assert "printed p. 619" in course["source_conflict_note"]
    assert "pending source-owner clarification" in course["source_conflict_note"]
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    finding = next(item for item in evidence["findings"] if item["field"] == "lecture_hours/practical_hours")
    assert finding["disposition"] == "source_internal_conflict_unresolved"
    assert evidence["next_cursor"]["next_course_code"] == "PST 425"
