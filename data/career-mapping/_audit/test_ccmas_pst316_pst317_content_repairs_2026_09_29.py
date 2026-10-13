import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
OFFICIAL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst316_and_pst317_content_fixes_preserve_the_source_verified_course_scope():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    physio = next(row for row in data["programmes"] if row["name"] == "Physiotherapy")
    courses = {row["code"]: row for row in physio["courses"]}
    massage = courses["PST 316"]
    exercise = courses["PST 317"]

    assert (massage["title"], massage["level"], massage["units"], massage["status"], massage["lh"], massage["ph"]) == ("Massage", 300, 2, "C", 15, 45)
    assert len(massage["skills_learned"]) == 7
    assert massage["skills_learned"][-1] == "discuss Inductions and contra-indications for massage manipulations"
    assert "Allied Health Sciences" not in massage["skills_learned"][-1]
    assert "older-adult, infant and respiratory-care applications" in massage["content_summary"]
    assert "indications and contraindications" in massage["content_summary"]

    assert exercise["title"] == "Exercise Therapy I Introduction to Body Movements"
    assert (exercise["level"], exercise["units"], exercise["status"], exercise["lh"], exercise["ph"]) == (300, 2, "C", 30, None)
    assert len(exercise["skills_learned"]) == 6
    assert "nervous control" in exercise["content_summary"]
    assert "vital-capacity measurement" in exercise["content_summary"]

    for row in (massage, exercise):
        assert row["source_url"] == OFFICIAL
        assert row["source_accessed_on"] == "2026-09-29"
        assert "printed p. 587" in row["source_locator"]
