import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def course():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "Physiotherapy")
    return next(row for row in programme["courses"] if row.get("code") == "PST 416")


def test_pst416_complete_summary_and_item_provenance_preserve_unresolved_hours_and_outcomes():
    row = course()
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (400, 1, "C", None, None)
    assert len(row["skills_learned"]) == 6
    assert "ends" not in row["content_summary"]
    assert all(
        topic in row["content_summary"].casefold()
        for topic in ("applied microbiology", "epidemiology", "risk assessment", "current literature", "standard precautions", "handwashing", "physiotherapy-specific disinfection")
    )
    assert row["source_url"] == SOURCE_URL
    assert "global course structure printed p. 588" in row["source_locator"]
    assert "detailed heading, outcomes and contents printed p. 617" in row["source_locator"]
    assert "conflicts" in row["source_locator"]
    assert row["source_accessed_on"] == "2026-09-29"
