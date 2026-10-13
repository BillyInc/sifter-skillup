import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_035_physio_pst514.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst514_footer_summary_and_provenance_reconciled():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 514"
    )
    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (500, 2, "C", 30, None)
    assert len(course["skills_learned"]) == 3 and "Allied Health Sciences" not in course["skills_learned"][2]
    assert "Mann-Witney U" in course["content_summary"] and "ANOA" in course["content_summary"]
    assert "MANOVA" in course["content_summary"] and "Regression Analysis" in course["content_summary"]
    assert course["source_url"] == URL
    assert "printed p. 589" in course["source_locator"] and "printed pp. 621-622" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst514_source_test_name_spelling_anomalies_are_not_silently_normalized():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 514"
    )
    assert "Mann-Witney" in course["source_conflict_note"]
    assert "ANOA" in course["source_conflict_note"]
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    finding = next(item for item in evidence["findings"] if item["field"] == "source wording in test names")
    assert finding["disposition"] == "source_text_anomalies_preserved"
    assert evidence["next_cursor"]["next_course_code"] == "PST 515"
