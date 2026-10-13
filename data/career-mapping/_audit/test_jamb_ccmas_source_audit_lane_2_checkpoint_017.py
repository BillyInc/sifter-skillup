import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "arts.json"


def test_checkpoint_017_current_structured_values_and_row_order():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {r["code"]: r for r in package["courses"]}
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_017.json").read_text(encoding="utf-8"))
    assert [r["code"] for r in checkpoint["row_reconciliation"]] == ["GER 202", "GER 203", "GER 204", "GER 205", "GER 206"]
    for finding in checkpoint["row_reconciliation"]:
        row = by_code[finding["code"]]
        assert len(row.get("skills_learned") or []) == finding["local_outcome_count"]
        assert row.get("lh") == finding["local_lh"]
        assert row.get("ph") == finding["local_ph"]
    assert by_code["GER 204"]["ph"] is None
    assert len(by_code["GER 204"]["skills_learned"]) == 9
    assert by_code["GER 205"]["content_summary"] and len(by_code["GER 205"]["content_summary"]) == 400


def test_checkpoint_017_preserves_the_ger204_source_conflict():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_017.json").read_text(encoding="utf-8"))
    conflict = checkpoint["source_conflicts"][0]
    assert conflict["course"] == "GER 204"
    assert conflict["type"].startswith("duplicate detailed course blocks")
    assert "do not choose" in conflict["disposition"]
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False


def test_checkpoint_017_only_hands_off_supported_repairs():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_017.json").read_text(encoding="utf-8"))
    handoff = {item["code"]: item["pointer"] for item in checkpoint["repair_handoff"]}
    assert set(handoff) == {"GER 203", "GER 204", "GER 205"}
    assert "do not select" in handoff["GER 204"]
    assert "GER 202" not in handoff and "GER 206" not in handoff
