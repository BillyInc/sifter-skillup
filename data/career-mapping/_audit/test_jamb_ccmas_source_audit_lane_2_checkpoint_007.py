import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_007_rows_match_current_german_records():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = package["courses"][10:15]
    assert [row["code"] for row in rows] == ["GST 212", "GST 222", "FAC 201", "FAC 202", "GER 201"]
    assert [len(row.get("skills_learned") or []) for row in rows] == [8, 5, 1, 5, 5]
    assert [row.get("lh") for row in rows] == [30, None, None, 30, 30]
    assert len(rows[0]["content_summary"]) == 88
    assert rows[2].get("content_summary") is None
    assert len(rows[3]["content_summary"]) == 400


def test_lane_2_checkpoint_007_preserves_source_conflicts_and_source_quality_issue():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_007.json").read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_rows_detailed_checked"] == 15
    assert checkpoint["progress"]["package_080_rows_remaining_for_detailed_check"] == 26
    assert checkpoint["progress"]["package_080_complete"] is False
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    by_code = {row["code"]: row for row in correction["row_reconciliation"]}
    assert by_code["FAC 201"]["local_outcomes"] == 1
    assert by_code["FAC 201"]["source_outcomes"] == 7
    assert "contaminated composite" in by_code["FAC 201"]["disposition"]
