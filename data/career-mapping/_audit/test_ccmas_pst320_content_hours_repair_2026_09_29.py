import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
OFFICIAL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst320_restores_ph_and_full_source_topics_without_changing_outcomes():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    owner = next(row for row in data["programmes"] if row["name"] == "Physiotherapy")
    course = next(row for row in owner["courses"] if row["code"] == "PST 320")

    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (300, 2, "C", 15, 45)
    assert len(course["skills_learned"]) == 8
    assert "perceived exertion" in course["content_summary"]
    assert "fractures" in course["content_summary"]
    assert "medicine balls, wobble boards and tilt tables" in course["content_summary"]
    assert "individual/group exercise-programme design and prescription" in course["content_summary"]
    assert course["source_url"] == OFFICIAL
    assert course["source_accessed_on"] == "2026-09-29"
    assert "printed p. 587" in course["source_locator"]
    assert "printed p. 610" in course["source_locator"]
