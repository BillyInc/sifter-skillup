import json
from pathlib import Path


AUDIT_DIR = Path(__file__).resolve().parent
CHECKPOINT = AUDIT_DIR / "jamb_ccmas_source_audit_lane_3_2026-09-29_increment_036_structural_ent211_get201.json"
NEXT_CHECKPOINT = AUDIT_DIR / "jamb_ccmas_source_audit_lane_3_2026-09-29_increment_037_structural_get202_get203.json"
LATEST_CHECKPOINT = AUDIT_DIR / "jamb_ccmas_source_audit_lane_3_2026-09-29_increment_038_structural_get204.json"
FOLLOWING_CHECKPOINT = AUDIT_DIR / "jamb_ccmas_source_audit_lane_3_2026-09-29_increment_039_structural_get205_get206.json"
ENGINEERING = AUDIT_DIR.parents[0] / "ccmas" / "engineering.json"


def test_structural_engineering_increment_covers_gap_and_records_conflict():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    engineering = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    programme = next(p for p in engineering["programmes"] if p["name"] == "STRUCTURAL ENGINEERING")
    local = {course["code"]: (i, course) for i, course in enumerate(programme["courses"], 1)}

    rows = checkpoint["course_rows"]
    assert [(row["ordinal"], row["code"]) for row in rows] == [(16, "ENT 211"), (17, "GET 201")]
    assert [(local[row["code"]][0], local[row["code"]][1]["code"]) for row in rows] == [(16, "ENT 211"), (17, "GET 201")]
    assert rows[0]["disposition"] == "confirmed_defect"
    assert rows[0]["field_findings"]["content_summary"].startswith("confirmed_defect")
    assert rows[1]["disposition"] == "source_conflict"
    assert rows[1]["observed_source_fields"]["table"]["lecture_hours"] == 45
    assert rows[1]["observed_source_fields"]["detail"]["lecture_hours"] == 30
    assert "ordinal 18 GET 202" in checkpoint["next_cursors"]["ccmas"]
    assert checkpoint["shared_ledger_edits"] is False


def test_lane3_jamb_prior_awarder_coverage_is_not_overstated():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    prior = checkpoint["prior_coverage_reconciliation"]
    assert prior["jamb_prior_closed_awarder_rows_in_281_290"] == [287, 288]
    assert prior["jamb_prior_directory_title_only_rows_in_281_290"] == [281, 282, 283, 284, 285, 286, 289, 290]
    assert "exact official programme awarder cell" in checkpoint["next_cursors"]["jamb"]
    assert prior["current_discovery_baseline"]["jamb_orphan_occurrences"] == 1


def test_structural_engineering_increment_037_preserves_source_conflicts():
    checkpoint = json.loads(NEXT_CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["course_rows"]
    assert [(row["ordinal"], row["code"]) for row in rows] == [(18, "GET 202"), (19, "GET 203")]
    assert all(row["disposition"] == "source_conflict" for row in rows)
    assert rows[0]["observed_source_fields"]["table"]["status"] == "C"
    assert rows[0]["observed_source_fields"]["detail"]["status"] == "E"
    assert rows[0]["local_fields"]["content_summary_length"] == 400
    assert rows[1]["observed_source_fields"]["table"]["units"] == 2
    assert rows[1]["observed_source_fields"]["detail"]["units"] == 3
    assert "ordinal 20 GET 204" in checkpoint["next_cursor"]


def test_structural_engineering_increment_038_records_and_repairs_verified_truncation():
    checkpoint = json.loads(LATEST_CHECKPOINT.read_text(encoding="utf-8"))
    engineering = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    programme = next(p for p in engineering["programmes"] if p["name"] == "STRUCTURAL ENGINEERING")
    local = programme["courses"][19]
    row = checkpoint["course_row"]

    assert (row["ordinal"], row["code"]) == (20, "GET 204")
    assert local["code"] == row["code"]
    # The append-only checkpoint records the historical 400-character
    # truncation.  The current CCMAS source ledger must contain the repaired,
    # source-complete summary rather than preserving that stale truncation.
    assert len(local["content_summary"]) > row["local_fields"]["content_summary_length"]
    assert local["content_summary"].endswith("practical energy conservation.")
    assert row["field_findings"]["title_units_status_hours_outcomes"] == "confirmed_match"
    assert row["disposition"] == "confirmed_defect"
    assert checkpoint["scope"]["package_rows_compared_after_increment"] == 20
    assert checkpoint["scope"]["package_rows_remaining"] == 27
    assert "ordinal 21 GET 205" in checkpoint["next_cursor"]


def test_structural_engineering_increment_039_distinguishes_match_and_conflict():
    checkpoint = json.loads(FOLLOWING_CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["course_rows"]
    assert [(row["ordinal"], row["code"]) for row in rows] == [(21, "GET 205"), (22, "GET 206")]
    assert rows[0]["disposition"] == "confirmed_match"
    assert rows[1]["disposition"] == "source_conflict"
    assert rows[1]["observed_source_fields"]["table"]["title"] == "Fundamentals of Thermodynamics"
    assert rows[1]["observed_source_fields"]["detail"]["title"] == "Fundamentals of Engineering Thermodynamics"
    assert rows[1]["local_fields"]["content_summary_length"] == 400
    assert checkpoint["scope"]["package_rows_compared_after_increment"] == 22
    assert checkpoint["scope"]["package_rows_remaining"] == 25
    assert "ordinal 23 GET 208" in checkpoint["next_cursor"]
