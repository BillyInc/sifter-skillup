import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENGINEERING = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"


def test_confirmed_petroleum_engineering_summaries_are_restored_with_item_provenance():
    data = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    courses = {
        row["code"]: row
        for programme in data["programmes"]
        for row in programme["courses"]
        if row.get("code") in {"PEE 313", "PEE 401", "PEE 405"}
        and row.get("title", "").startswith(("Applied Geophysics", "Entrepreneurship and Startup", "Introduction to Well Logging"))
    }

    assert set(courses) == {"PEE 313", "PEE 401", "PEE 405"}
    expected_terms = {
        "PEE 313": ("borehole geophysical logging", "prospecting and petroleum exploration"),
        "PEE 401": ("AfCFTA", "Nigerian-content opportunities", "financial management and sustainability"),
        "PEE 405": ("PETREL", "recent advances in logging and interpretation"),
    }
    for code, row in courses.items():
        assert all(term.casefold() in row["content_summary"].casefold() for term in expected_terms[code])
        assert row["source_url"] == SOURCE_URL
        assert row["source_accessed_on"] == "2026-09-29"
        assert "printed p. 1086" in row["source_locator"]
        assert row["skills_learned"]

    assert len(courses["PEE 313"]["skills_learned"]) == 3
    assert len(courses["PEE 401"]["skills_learned"]) == 4
    assert len(courses["PEE 405"]["skills_learned"]) == 8
