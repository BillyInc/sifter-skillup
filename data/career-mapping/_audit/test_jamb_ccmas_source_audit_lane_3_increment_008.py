import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_008.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_008_preserves_nuc_internal_hour_and_unit_conflicts():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    package = checkpoint["findings"][0]
    rows = {row["code"]: row for row in package["course_rows"]}

    assert checkpoint["scope"]["cumulative_course_rows_with_exact_table_or_detail_comparison"] == 4
    assert package["local_course_count"] == 51
    assert package["package_rows_remaining_for_source_adjudication"] == 47
    assert package["package_status"] == "open_not_full_course_by_course_audit"
    for code in ("PGE 301", "PGE 302"):
        assert rows[code]["disposition"] == "source_conflict"
        assert "printed p.1048" in " ".join(rows[code]["source_locators"])

    assert rows["PGE 301"]["official_table_units_status_hours"] != rows["PGE 301"]["official_detail_units_status_hours"]
    assert rows["PGE 302"]["official_table_units_status_hours"] != rows["PGE 302"]["official_detail_units_status_hours"]


def test_lane_3_increment_008_conflicts_match_current_table_aligned_local_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM AND GAS ENGINEERING")
    rows = {row["code"]: row for row in programme["courses"]}
    expected = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}

    for code in ("PGE 301", "PGE 302"):
        assert rows[code]["title"] == expected[code]["local_title"]
        assert rows[code]["units"] == int(expected[code]["local_units_status_hours"].split(";")[0])
    assert rows["PGE 301"]["lh"] == 45 and rows["PGE 301"]["ph"] is None
    assert rows["PGE 302"]["lh"] is None and rows["PGE 302"]["ph"] == 45
