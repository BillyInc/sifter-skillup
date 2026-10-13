import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_012_matches_current_german_records():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    rows = package["courses"][30:35]
    assert [row["code"] for row in rows] == ["GER 303", "GER 304", "GER 305", "GER 306", "GER 307"]
    assert [len(row.get("skills_learned") or []) for row in rows] == [0, 0, 4, 5, 2]
    assert all(row.get("lh") == 30 for row in rows)


def test_lane_2_checkpoint_012_keeps_remaining_scope_open():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_012.json").read_text(encoding="utf-8"))
    assert checkpoint["progress"]["package_080_rows_detailed_checked"] == 35
    assert checkpoint["progress"]["package_080_rows_remaining_for_detailed_check"] == 6
    assert checkpoint["progress"]["package_080_complete"] is False
    correction = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    by_code = {row["code"]: row for row in correction["row_reconciliation"]}
    assert by_code["GER 304"]["source_outcome_text"] == "Continuation of GER 302"
    assert by_code["GER 303"]["local_outcomes"] == 0
