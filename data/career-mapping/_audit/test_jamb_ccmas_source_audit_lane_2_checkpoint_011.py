import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_011_matches_current_german_records():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = package["courses"][25:30]
    assert [row["code"] for row in rows] == ["ENT 312", "FAC 301", "FAC 302", "GER 301", "GER 302"]
    assert [len(row.get("skills_learned") or []) for row in rows] == [8, 7, 5, 4, 5]
    assert [row.get("lh") for row in rows] == [15, 30, 30, 30, 30]
    assert len(rows[0]["content_summary"]) == 400
    assert rows[1].get("content_summary") is None
    assert len(rows[2]["content_summary"]) == 337


def test_lane_2_checkpoint_011_preserves_source_issues():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_011.json").read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_rows_detailed_checked"] == 30
    assert checkpoint["progress"]["package_080_rows_remaining_for_detailed_check"] == 11
    assert checkpoint["progress"]["package_080_complete"] is False
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    by_code = {row["code"]: row for row in correction["row_reconciliation"]}
    assert by_code["FAC 301"]["local_outcomes"] == by_code["FAC 301"]["source_outcomes"] == 7
    assert by_code["GER 302"]["local_outcomes"] == by_code["GER 302"]["source_outcomes"] == 5
