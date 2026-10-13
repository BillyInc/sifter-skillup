import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ccmas" / "sciences.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf"


def course(programme_name, code):
    data = json.loads(DATA.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == programme_name)
    return next(row for row in programme["courses"] if row.get("code") == code)


def test_biology_bio414_duplicate_removed_and_source_content_completed():
    row = course("Biology", "BIO 414")
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (400, 2, "C", 15, 45)
    assert len(row["skills_learned"]) == 4
    assert "summarise the roles of Nucleic acids" not in row["skills_learned"]
    assert all(topic in row["content_summary"].casefold() for topic in ("dna and rna", "gene regulation", "genome evolution", "plant and animal breeding", "genetic engineering"))
    assert "marriage" in row["source_anomaly_note"]
    assert row["source_url"] == SOURCE_URL and "printed pp. 98-99" in row["source_locator"]


def test_slts_bio414_is_repaired_without_collapsing_its_distinct_hours():
    row = course("Science Laboratory Technology", "BIO 414")
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (400, 2, "C", 30, None)
    assert len(row["skills_learned"]) == 4
    assert row["source_url"] == SOURCE_URL and "printed p. 714" in row["source_locator"]


def test_btg304_full_genetic_engineering_scope_is_restored():
    row = course("Biotechnology", "BTG 304")
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (300, 2, "C", 15, 45)
    assert len(row["skills_learned"]) == 3
    assert all(topic in row["content_summary"].casefold() for topic in ("dna/rna isolation", "restriction", "cloning vectors", "gene targeting", "crispr", "genetic diagnosis", "human genome project"))
    assert row["source_url"] == SOURCE_URL and "printed pp. 121-122" in row["source_locator"]
