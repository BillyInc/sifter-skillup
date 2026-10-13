import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_006_matches_local_german_rows_6_to_10():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = package["courses"][5:10]
    assert [row["code"] for row in rows] == ["GER 104", "GER 105", "GER 106", "GER 107", "GER 108"]
    assert [len(row.get("skills_learned") or []) for row in rows] == [7, 7, 7, 7, 7]
    assert [row.get("lh") for row in rows] == [30, 30, 30, 30, 30]
    assert len(rows[-1]["content_summary"]) == 400


def test_lane_2_checkpoint_006_records_evidence_and_keeps_package_open():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_006.json").read_text(encoding="utf-8"))
    assert checkpoint["source"]["publisher"] == "National Universities Commission"
    assert checkpoint["progress"]["package_080_rows_detailed_checked"] == 10
    assert checkpoint["progress"]["package_080_rows_remaining_for_detailed_check"] == 31
    assert checkpoint["progress"]["package_080_complete"] is False
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    assert "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_006.json" in correction["corrects_and_supersedes"]
    rows = correction["row_reconciliation"]
    assert [row["local_outcomes"] for row in rows[:5]] == [7, 7, 7, 7, 7]
    assert rows[2]["source_outcomes"] == 8
