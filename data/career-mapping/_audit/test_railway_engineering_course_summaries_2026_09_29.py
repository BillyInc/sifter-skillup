import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ccmas" / "engineering.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"


def railway_rows():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    return {row["code"]: row for row in programme["courses"]}


def test_railway_gst111_summary_covers_full_source_topic_set():
    row = railway_rows()["GST 111"]
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (100, 2, "C", 15, 45)
    assert len(row["skills_learned"]) == 7
    assert all(topic in row["content_summary"].casefold() for topic in ("sound patterns", "reasoning", "copyright", "editing", "reports", "ict", "public speaking"))
    assert row["source_url"] == SOURCE_URL and "printed pp. 1124-1125" in row["source_locator"]


def test_railway_gst112_summary_covers_full_source_topic_set():
    row = railway_rows()["GST 112"]
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (100, 2, "C", 30, None)
    assert len(row["skills_learned"]) == 8
    assert all(topic in row["content_summary"].casefold() for topic in ("colonial rule", "self-reliance", "civil war", "judiciary", "citizenship", "indigenous languages", "re-orientation", "current socio-political"))
    assert row["source_url"] == SOURCE_URL and "printed p. 1125" in row["source_locator"]


def test_railway_get101_summary_covers_full_source_topic_set():
    row = railway_rows()["GET 101"]
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (100, 1, "C", 15, None)
    assert len(row["skills_learned"]) == 5
    assert all(topic in row["content_summary"].casefold() for topic in ("philosophy", "professional bodies", "ethics", "risk analysis", "technical, soft and digital", "professional associations"))
    assert row["source_url"] == SOURCE_URL and "common GET 101" in row["source_locator"]
