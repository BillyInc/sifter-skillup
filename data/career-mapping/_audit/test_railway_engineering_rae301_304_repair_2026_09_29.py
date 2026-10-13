import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data" / "career-mapping" / "_audit" / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_032.json"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf"


def railway_rows():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(row for row in data["programmes"] if row["name"] == "RAILWAY ENGINEERING")
    return {row["code"]: row for row in package["courses"] if row["code"] in {"RAE 301", "RAE 302", "RAE 303", "RAE 304"}}


def test_checkpoint_records_four_final_railway_source_findings():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["code"] for row in rows] == ["RAE 301", "RAE 302", "RAE 303", "RAE 304"]
    assert checkpoint["findings"][0]["package_status"] == "all_42_course_occurrences_source_compared_package_closed"


def test_rae301_removes_rae302_outcomes_and_restores_source_content():
    rows = railway_rows()
    row = rows["RAE 301"]
    assert len(row["skills_learned"]) == 2
    assert all("soil" not in outcome.lower() and "bearing capacity" not in outcome.lower() for outcome in row["skills_learned"])
    assert all(topic in row["content_summary"] for topic in ["high-speed", "bridges, tunnels", "locomotives"])
    assert row["source_url"] == URL and "printed p. 1143" in row["source_locator"]


def test_rae302_summary_covers_official_course_content_and_preserves_four_outcomes():
    row = railway_rows()["RAE 302"]
    assert len(row["skills_learned"]) == 4
    assert all(topic in row["content_summary"] for topic in ["soil formation", "compaction", "earth pressure", "consolidation"])
    assert row["source_url"] == URL and "printed p. 1144" in row["source_locator"]


def test_rae303_restores_full_operations_scope_and_records_hours_discrepancy():
    row = railway_rows()["RAE 303"]
    assert len(row["skills_learned"]) == 3
    assert all(topic in row["content_summary"] for topic in ["shunting", "train timetables", "locomotive"])
    assert "schedule lists 45 practical hours" in row["content_summary"]
    assert "PH 45" in row["source_locator"] and "PH unspecified" in row["source_locator"]
    assert row["source_url"] == URL


def test_rae304_restores_track_topics_and_retains_schedule_detail_hours_difference():
    row = railway_rows()["RAE 304"]
    assert len(row["skills_learned"]) == 7
    assert all(topic in row["content_summary"] for topic in ["switches and crossings", "overhead-line electrification", "slab track", "track maintenance"])
    assert "schedule lists 15 lecture and 45 practical hours" in row["content_summary"]
    assert "LH 15, PH 45" in row["source_locator"] and "LH 30, PH unspecified" in row["source_locator"]
    assert row["source_url"] == URL


def test_repairs_do_not_change_rae_course_identity_or_load_metadata():
    rows = railway_rows()
    expected = {"RAE 301": (300, 2, "C", 30, None), "RAE 302": (300, 3, "C", 45, None), "RAE 303": (300, 2, "C", 30, 45), "RAE 304": (300, 2, "C", 15, 45)}
    for code, row in rows.items():
        assert (row["level"], row["units"], row["status"], row["lh"], row["ph"]) == expected[code]
