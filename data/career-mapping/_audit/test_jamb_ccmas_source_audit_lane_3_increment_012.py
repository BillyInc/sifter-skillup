import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_012.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_lane_3_increment_012_counts_new_package_rows_and_dispositions():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["findings"][0]
    rows = {row["code"]: row for row in finding["course_rows"]}

    assert checkpoint["scope"]["ccmas_package_indices"] == [172, 172]
    assert checkpoint["scope"]["cumulative_course_row_occurrences_source_compared_in_package"] == 10
    assert checkpoint["scope"]["package_row_occurrences_remaining_for_source_adjudication"] == 39
    assert set(rows) == {"PEE 306", "PEE 307", "PEE 309", "PEE 310"}
    assert rows["PEE 306"]["disposition"] == "confirmed_defect"
    assert rows["PEE 307"]["disposition"] == "confirmed_match"
    assert rows["PEE 309"]["disposition"] == "confirmed_defect"
    assert rows["PEE 310"]["disposition"] == "confirmed_defect"


def test_lane_3_increment_012_details_match_the_existing_local_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    package = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    local = {row["code"]: row for row in package["courses"]}
    evidence = {row["code"]: row for row in checkpoint["findings"][0]["course_rows"]}

    for code in ("PEE 306", "PEE 307", "PEE 309", "PEE 310"):
        assert local[code]["title"] == evidence[code]["local_title"]
        assert local[code]["units"] == int(evidence[code]["local_units_status_hours"].split(";")[0])
        assert len(local[code]["skills_learned"]) == evidence[code]["local_outcome_count"]

    assert local["PEE 306"]["content_summary"].strip().endswith("Uses")
    assert local["PEE 309"]["content_summary"].strip().endswith("governing")
    assert local["PEE 310"]["content_summary"].strip().endswith("Fluid flow concepts.")
