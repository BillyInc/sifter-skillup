import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def course(code):
    data = json.loads(DATA.read_text(encoding="utf-8"))
    owner = next(row for row in data["programmes"] if row["name"] == "Physiotherapy")
    return next(row for row in owner["courses"] if row["code"] == code)


def test_pst412_footer_removed_and_complete_topics_are_present():
    row = course("PST 412")
    assert len(row["skills_learned"]) == 6
    assert "Allied Health Sciences" not in row["skills_learned"][4]
    assert row["content_summary"].endswith("fracture management.")
    assert all(word in row["content_summary"].casefold() for word in ("spondylolisthesis", "fibromyalgia", "joint replacements", "soft-tissue"))
    assert row["source_url"] == SOURCE_URL and "printed p. 615" in row["source_locator"]


def test_pst413_metadata_title_variant_and_complete_rotation_content_are_recorded():
    row = course("PST 413")
    assert row["title"] == "Physiotherapy Clinical Rotation in Orthopaedics and Traumatology"
    assert (row["units"], row["status"], row["lh"], row["ph"]) == (2, "C", None, 90)
    assert len(row["skills_learned"]) == 5
    assert "Allied Health Sciences" not in row["content_summary"]
    assert "communication of care goals" in row["content_summary"]
    assert "skin protection and repair" in row["content_summary"]
    assert "title forms" in row["source_title_variation_note"]
    assert row["source_url"] == SOURCE_URL


def test_pst414_preserves_official_patents_wording_and_flags_source_anomaly():
    row = course("PST 414")
    assert (row["units"], row["status"], row["lh"], row["ph"]) == (2, "C", 30, None)
    assert len(row["skills_learned"]) == 4
    assert "patents" in row["skills_learned"][3]
    assert "official NUC PST 414 outcome 4 says 'patents'" in row["source_anomaly_note"]
    assert all(topic in row["content_summary"].casefold() for topic in ("lung", "motor-function", "psychometric", "quality of life", "stress"))


def test_pst415_summary_covers_topics_without_silently_rewriting_source_outcome():
    row = course("PST 415")
    assert len(row["skills_learned"]) == 6
    assert "fifth vital signs" not in row["content_summary"].casefold()
    assert "Pain as a fifth vital signs" in row["source_anomaly_note"]
    assert all(topic in row["content_summary"].casefold() for topic in ("multidimensional", "pharmacologic", "holistic role"))
    assert row["source_url"] == SOURCE_URL and "printed p. 616" in row["source_locator"]
