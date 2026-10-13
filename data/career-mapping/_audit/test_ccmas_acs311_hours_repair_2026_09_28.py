import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "administration_management.json"


def test_acs311_course_load_matches_nuc_global_table_and_retains_exact_locators():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "Actuarial Science")
    course = next(row for row in programme["courses"] if row["code"] == "ACS 311")

    assert course["title"] == "Entrepreneurship in Actuarial Profession"
    assert (course["units"], course["status"], course["lh"], course["ph"]) == (2, "C", 15, 45)
    assert "global course structure, printed p. 55" in course["source_locator"]
    assert "printed pp. 70–71" in course["source_locator"]
    assert course["source_url"].endswith("Administration-and-Management.pdf")
    assert course["source_accessed_on"] == "2026-09-28"
