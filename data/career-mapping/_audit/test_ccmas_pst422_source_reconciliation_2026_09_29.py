import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst422_reconciles_confirmed_hours_content_and_item_level_provenance():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in data["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 422"
    )
    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (400, 2, "C", None, 90)
    assert "Guillain-Barre syndrome" in course["content_summary"]
    assert "proprioceptive neuromuscular facilitation" in course["content_summary"]
    assert len(course["skills_learned"]) == 4
    assert course["source_url"] == URL
    assert "printed p. 588" in course["source_locator"] and "printed p. 618" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-29"


def test_pst422_source_anomaly_is_preserved_and_not_normalized():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in data["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 422"
    )
    assert "orthopaedic conditions" in course["skills_learned"][2]
    assert "orthopaedic conditions" in course["source_conflict_note"]
    assert "no correction is inferred" in course["source_conflict_note"]


def test_pst423_is_already_repaired_and_source_backed_before_lane_advance():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    course = next(
        row
        for programme in data["programmes"]
        if programme["name"] == "Physiotherapy"
        for row in programme["courses"]
        if row.get("code") == "PST 423"
    )
    assert course["ph"] == 45 and course["units"] == 1 and course["status"] == "C"
    assert course["source_url"] == URL
    assert "printed p. 588" in course["source_locator"] and "printed p. 619" in course["source_locator"]
    assert course["source_accessed_on"] == "2026-09-26"
    assert "Allied Health Sciences  619" not in course["content_summary"]
