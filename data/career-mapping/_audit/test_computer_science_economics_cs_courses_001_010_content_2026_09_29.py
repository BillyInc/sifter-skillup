import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "computing.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf"
EXPECTED = ["GST 111", "GST 112", "MTH 101", "MTH 102", "PHY 101", "PHY 102", "PHY 107", "PHY 108", "STA 111", "COS 101"]


def get_rows():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(row for row in data["programmes"] if row["name"] == "Computer Science")
    return {row["code"]: row for row in package["courses"] if row["code"] in EXPECTED}


def test_both_source_checkpoints_cover_ten_distinct_cs_rows():
    first = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_041.json").read_text(encoding="utf-8"))
    second = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_042.json").read_text(encoding="utf-8"))
    codes = [row["code"] for row in first["course_decisions"] + second["course_decisions"]]
    assert codes == EXPECTED
    assert all(checkpoint["scope"]["canonical_name"] == "COMPUTER SCIENCE WITH ECONOMICS" for checkpoint in [first, second])


def test_all_ten_cs_contents_are_restored_with_item_level_nuc_provenance():
    rows = get_rows()
    assert set(rows) == set(EXPECTED)
    for code in EXPECTED:
        assert rows[code]["content_summary"]
        assert rows[code]["source_url"] == URL
        assert rows[code]["source_accessed_on"] == "2026-09-29"
        assert "B.Sc. Computer Science" in rows[code]["source_locator"]


def test_course_metadata_and_outcomes_remain_unchanged_by_content_only_repair():
    rows = get_rows()
    expected = {
        "GST 111": (2, "C", 15, 45, 7), "GST 112": (2, "C", 30, 0, 8),
        "MTH 101": (2, "C", 30, 0, 5), "MTH 102": (2, "C", 30, 0, 3),
        "PHY 101": (2, "C", 30, 0, 8), "PHY 102": (2, "C", 30, 0, 8),
        "PHY 107": (1, "C", 0, 45, 5), "PHY 108": (1, "C", 0, 45, 6),
        "STA 111": (3, "C", 45, 0, 4), "COS 101": (3, "C", 30, 45, 6),
    }
    for code, row in rows.items():
        assert (row["units"], row["status"], row["lh"], row["ph"], len(row["skills_learned"])) == expected[code]


def test_summaries_represent_topic_families_from_each_exact_source_contents_block():
    rows = get_rows()
    phrases = {
        "GST 111": ["phonetics", "copyright", "ICT", "public speaking"],
        "GST 112": ["colonial rule", "Civil War", "judiciary", "re-orientation"],
        "MTH 101": ["set theory", "complex-number", "trigonometric"],
        "MTH 102": ["limits and continuity", "differentiation", "areas and volumes"],
        "PHY 101": ["Newtonian mechanics", "rotational motion", "satellite orbits"],
        "PHY 102": ["electrostatics", "Ampère's laws", "Maxwell's equations"],
        "PHY 107": ["quantitative measurement", "graph analysis", "viscosity"],
        "PHY 108": ["Continuation of PHY 107", "experimental-error", "data collection"],
        "STA 111": ["permutations and combinations", "Poisson", "exploratory data analysis"],
        "COS 101": ["humanware", "job specializations", "Practical work"],
    }
    for code, topics in phrases.items():
        summary = rows[code]["content_summary"]
        assert all(topic.lower() in summary.lower() for topic in topics), code


def test_repeated_common_codes_keep_distinct_economics_source_context():
    data = json.loads((AUDIT / "jamb_curriculum_scopes_2026-08-17.json").read_text(encoding="utf-8"))
    row = next(row for row in data["rows"] if row["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS")
    assert "Social Sciences::Economics" in row["component_refs"]
    economics = [course for course in row["selected_courses"] if course.get("source_ccmas_programme") == "Economics"]
    assert economics
    econ_gst111 = next(course for course in economics if course["code"] == "GST 111")
    cs_gst111 = get_rows()["GST 111"]
    assert econ_gst111["source_ccmas_file"] == "social_sciences.json"
    assert econ_gst111["source_ccmas_programme"] == "Economics"
    assert econ_gst111["content_summary"] != cs_gst111["content_summary"]
