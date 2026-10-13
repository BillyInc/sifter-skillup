import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
OFFICIAL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst321_confirmed_fields_are_fixed_and_missing_pst318_is_not_invented():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    physio = next(row for row in data["programmes"] if row["name"] == "Physiotherapy")
    course = next(row for row in physio["courses"] if row["code"] == "PST 321")

    assert (course["level"], course["units"], course["status"], course["lh"], course["ph"]) == (300, 1, "C", None, 45)
    assert len(course["skills_learned"]) == 10
    assert course["skills_learned"][3] == "measure range of motion of peripheral and spinal joints;"
    assert "Allied Health Sciences" not in course["skills_learned"][3]
    assert "practical demonstrations apply exercise selection and progression" in course["content_summary"].casefold()
    assert "PST 318" in course["content_summary"]
    assert "absent from the same programme's 300-level course table" in course["content_summary"]
    assert "unresolved" in course["source_locator"]
    assert course["source_url"] == OFFICIAL
    assert course["source_accessed_on"] == "2026-09-29"
