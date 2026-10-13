import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ccmas" / "arts.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf"


def german_rows():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "Modern European Languages B.A (German)")
    return {row["code"]: row for row in programme["courses"] if row.get("code") in {"GER 406", "GER 407"}}


def test_ger406_contains_only_its_six_outcomes_and_own_content():
    rows = german_rows()
    row = rows["GER 406"]
    assert len(row["skills_learned"]) == 6
    assert row["skills_learned"][0].startswith("explain some selected texts")
    assert row["skills_learned"][5].startswith("teach, research and introduce others")
    assert row["content_summary"] == "Exposure of students to some selected texts from the 18th century to the present day."
    assert "GER 407" not in row["content_summary"]
    assert row["source_url"] == SOURCE_URL
    assert "printed p. 488" in row["source_locator"]


def test_ger407_is_restored_as_separate_source_course():
    rows = german_rows()
    assert set(rows) == {"GER 406", "GER 407"}
    row = rows["GER 407"]
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (400, 6, "C", None, 270)
    assert len(row["skills_learned"]) == 3
    assert row["skills_learned"][0].startswith("apply the rules of grammar")
    assert row["skills_learned"][2].startswith("translate, interpret and evaluate texts written in German")
    assert row["content_summary"] == "An independent essay on a topic in literature, language or civilisation approved by the department."
    assert "nation, international and global" in row["source_anomaly_note"]
    assert row["source_url"] == SOURCE_URL
    assert "printed pp. 488-489" in row["source_locator"]
