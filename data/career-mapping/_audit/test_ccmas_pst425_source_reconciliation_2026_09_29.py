import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_031_physio_pst425.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst425_contamination_and_truncation_are_repaired_with_source_locators():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 425"
    )
    assert len(course["skills_learned"]) == 5
    assert course["skills_learned"][4].endswith("psychiatric and psychological conditions.")
    assert "Allied Health Sciences" not in course["skills_learned"][4]
    assert "psychological testing tools" in course["content_summary"]
    assert "transference and counter-transference" in course["content_summary"]
    assert course["source_url"] == URL
    assert "printed p. 588" in course["source_locator"] and "printed p. 620" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst425_global_vs_detailed_hours_disagreement_is_preserved():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 425"
    )
    assert (course["lh"], course["ph"]) == (15, 45)
    assert "global course table" in course["source_conflict_note"]
    assert "PH 15" in course["source_conflict_note"] and "LH 15" in course["source_conflict_note"]
    assert "pending source-owner clarification" in course["source_conflict_note"]
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    finding = next(item for item in evidence["findings"] if item["field"] == "lecture_hours/practical_hours")
    assert finding["disposition"] == "source_internal_conflict_unresolved"
    assert evidence["next_cursor"]["next_course_code"] == "PST 426"
