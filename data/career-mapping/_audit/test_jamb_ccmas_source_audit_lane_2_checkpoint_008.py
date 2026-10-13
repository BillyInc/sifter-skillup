import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_008_matches_current_german_records():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = package["courses"][15:20]
    assert [row["code"] for row in rows] == ["GER 202", "GER 203", "GER 204", "GER 205", "GER 206"]
    assert [len(row.get("skills_learned") or []) for row in rows] == [6, 6, 9, 5, 4]
    assert [row.get("lh") for row in rows] == [30, 30, None, 30, 30]
    assert rows[2].get("ph") is None
    assert len(rows[3]["content_summary"]) == 400


def test_lane_2_checkpoint_008_preserves_the_ger_204_source_conflict():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_008.json").read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_rows_detailed_checked"] == 20
    assert checkpoint["progress"]["package_080_rows_remaining_for_detailed_check"] == 21
    assert checkpoint["progress"]["package_080_complete"] is False
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    by_code = {row["code"]: row for row in correction["row_reconciliation"]}
    assert by_code["GER 204"]["source_outcome_blocks"] == [5, 4]
    assert by_code["GER 204"]["local_outcomes"] == 9
