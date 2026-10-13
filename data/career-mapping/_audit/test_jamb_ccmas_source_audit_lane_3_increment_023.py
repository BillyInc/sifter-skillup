import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_023.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_023_uses_occurrence_cursor_and_skips_prior_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [33, 34, 35]
    assert [row["code"] for row in rows] == ["GET 305", "GET 306", "GET 307"]
    assert checkpoint["prior_coverage_reconciliation"]["actual_unreviewed_ordinals_found_by_comparing_all_checkpoints_to_the_49_row_package"] == [33, 34, 35, 45, 46]
    assert checkpoint["summary"]["next_cursor"] == {"package_index": 172, "local_course_ordinal": 45, "course_code": "GET 402"}


def test_increment_023_evidence_matches_local_package_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"].replace(" ", "") == evidence["code"].replace(" ", "")
        assert row["title"] == evidence["local_title"]
        assert len(row["content_summary"]) == 400
