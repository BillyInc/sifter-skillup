import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_022.json"
CCMAS = ROOT / "data" / "career-mapping" / "ccmas" / "engineering.json"


def test_increment_022_corrects_cursor_and_records_omitted_siwes_outcomes():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["findings"][0]["course_rows"]
    assert [row["ordinal"] for row in rows] == [29, 30, 31, 32]
    assert [row["code"] for row in rows] == ["GET 299", "GST 312", "ENT 312", "GET 304"]
    assert rows[0]["official_outcome_count"] == 4 and rows[0]["local_outcome_count"] == 2
    assert "preserved as written" in checkpoint["prior_coverage_reconciliation"]["previous_checkpoint_cursor_correction"]
    assert checkpoint["summary"]["next_cursor"] == {"package_index": 172, "local_course_ordinal": 33, "course_code": "GET 305"}


def test_increment_022_evidence_matches_local_package_rows():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    source = json.loads(CCMAS.read_text(encoding="utf-8"))
    programme = next(row for row in source["programmes"] if row["name"] == "PETROLEUM ENGINEERING")
    for evidence in checkpoint["findings"][0]["course_rows"]:
        row = programme["courses"][evidence["ordinal"] - 1]
        assert row["code"].replace(" ", "") == evidence["code"].replace(" ", "")
        assert row["title"] == evidence["local_title"]
    assert len(programme["courses"][28]["skills_learned"]) == 2
