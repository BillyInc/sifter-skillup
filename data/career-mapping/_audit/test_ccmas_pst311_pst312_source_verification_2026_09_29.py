import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ccmas" / "allied_health.json"
EVIDENCE = ROOT / "_audit" / "jamb_ccmas_source_audit_lane_1_2026-09-29_038_physio_pst311_pst312.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def _course(code, title):
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Physiotherapy")
    return next(c for c in package["courses"] if c.get("code") == code and c.get("title") == title)


def test_dpt_pst311_is_distinguished_from_other_same_code_curriculum_rows():
    row = _course("PST 311", "Introduction to Physiotherapy Profession")
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (300, 2, "C", 15, 45)
    assert len(row["skills_learned"]) == 5
    assert "walking aids" in row["content_summary"]
    assert row["source_url"] == URL
    assert "printed p. 587" in row["source_locator"] and "printed p. 606" in row["source_locator"]
    assert row["source_accessed_on"] == "2026-09-28"


def test_dpt_pst312_has_all_six_source_outcomes_and_full_topics():
    row = _course("PST 312", "Exercise Physiology")
    assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == (300, 2, "C", 15, 45)
    assert len(row["skills_learned"]) == 6
    assert "effects of exercise on body organs" in row["skills_learned"][5]
    assert "body composition" in row["content_summary"]
    assert "Allied Health Sciences" not in row["skills_learned"][5]
    assert row["source_url"] == URL
    assert "printed p. 587" in row["source_locator"] and "printed pp. 606-607" in row["source_locator"]
    assert row["source_accessed_on"] == "2026-09-28"


def test_checkpoint_preserves_exact_context_and_next_covered_pst313_cursor():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["course_codes"] == ["PST 311", "PST 312"]
    assert evidence["next_cursor"]["next_course_code"] == "PST 313"
    assert "increment 011" in evidence["next_cursor"]["instruction"]
