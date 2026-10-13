import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_009_matches_current_german_records():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = package["courses"][20:25]
    assert [row["code"] for row in rows] == ["GER 207", "GER 208", "GER 209", "GER 210", "GST 312"]
    assert [len(row.get("skills_learned") or []) for row in rows] == [6, 6, 4, 6, 5]
    assert [row.get("lh") for row in rows] == [30, 30, None, 30, 30]
    assert rows[2].get("ph") is None
    assert rows[0].get("content_summary") is None
    assert rows[2].get("content_summary") is None
    assert len(rows[4]["content_summary"]) == 400


def test_lane_2_checkpoint_009_preserves_the_gst_312_source_conflict():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_009.json").read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_rows_detailed_checked"] == 25
    assert checkpoint["progress"]["package_080_rows_remaining_for_detailed_check"] == 16
    assert checkpoint["progress"]["package_080_complete"] is False
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    gst = next(row for row in correction["row_reconciliation"] if row["code"] == "GST 312")
    assert gst["local_outcomes"] == gst["source_outcomes"] == 5
