import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_032_physio_pst426.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst426_title_summary_outcomes_and_provenance_are_reconciled():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 426"
    )
    assert course["title"] == "Clinical Practice I (Neurophysiotherapy and Musculoskeletal)"
    assert len(course["skills_learned"]) == 4
    assert course["skills_learned"][3].endswith("conditions commonly seen in physiotherapy.")
    assert "500 Level" not in course["skills_learned"][3]
    assert "externally moderated professional clinical examination" in course["content_summary"].casefold()
    assert all(code in course["content_summary"] for code in ("PST 412", "PST 413", "PST 421", "PST 422"))
    assert course["source_url"] == URL
    assert "printed p. 588" in course["source_locator"] and "printed p. 620" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst426_hour_disagreement_remains_explicit_and_unresolved():
    course = next(
        row
        for programme in json.loads(SOURCE.read_text(encoding="utf-8"))["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 426"
    )
    assert (course["lh"], course["ph"]) == (None, None)
    assert "global course table" in course["source_conflict_note"]
    assert "PH 45" in course["source_conflict_note"]
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["next_cursor"]["next_course_code"] == "PST 511"
    assert evidence["findings"][1]["disposition"] == "source_internal_conflict_unresolved"
