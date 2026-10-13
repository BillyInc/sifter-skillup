import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_036_physio_pst515.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst515_confirmed_content_and_provenance_are_complete():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 515"
    )
    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (500, 2, "C", 30, None)
    assert len(course["skills_learned"]) == 5
    assert "Vertebra-Basilar Insufficiency (VBI)" in course["content_summary"]
    assert all(name in course["content_summary"] for name in ("Cyriax", "Mennel", "Kaltenborn", "Maitland", "Nwuga", "McKenzie"))
    assert course["source_url"] == URL
    assert "printed p. 589" in course["source_locator"] and "printed p. 622" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst516_is_skipped_only_with_prior_audit_evidence():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["coverage_carry_forward"]["PST516_disposition"] == "skip_as_previously_source_checked_and_repaired"
    assert "increment 003" in evidence["coverage_carry_forward"]["PST516_evidence"]
    assert evidence["next_cursor"]["next_course_code"] == "PST 521"
