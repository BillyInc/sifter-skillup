import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_037_physio_pst521.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst521_content_and_provenance_are_complete():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 521"
    )
    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (500, 2, "C", 30, None)
    assert len(course["skills_learned"]) == 4
    assert "home versus institutional care" in course["content_summary"]
    assert "multidisciplinary approaches" in course["content_summary"]
    assert "traditional family support" in course["content_summary"]
    assert course["source_url"] == URL
    assert "printed p. 589" in course["source_locator"] and "printed p. 623" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"
    assert json.loads(EVIDENCE.read_text(encoding="utf-8"))["next_cursor"]["next_course_code"] == "PST 522"
