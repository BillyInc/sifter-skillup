import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_034_physio_pst513.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst513_source_supported_content_and_provenance_are_complete():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 513"
    )
    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (500, 2, "C", 30, None)
    assert len(course["skills_learned"]) == 4
    assert "meta-analysis" in course["content_summary"]
    assert "manuscript preparation" in course["content_summary"]
    assert "journal publication" in course["content_summary"]
    assert course["source_url"] == URL
    assert "printed p. 589" in course["source_locator"] and "printed p. 621" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["next_cursor"]["next_course_code"] == "PST 514"
