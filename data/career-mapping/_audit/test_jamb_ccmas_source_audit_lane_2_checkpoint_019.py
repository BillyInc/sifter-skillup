import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "arts.json"


def test_checkpoint_019_is_bound_to_package_080_actual_rows():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {r["code"]: r for r in package["courses"]}
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_019.json").read_text(encoding="utf-8"))
    for finding in checkpoint["row_reconciliation"]:
        row = by_code[finding["code"]]
        assert len(row.get("skills_learned") or []) == finding["local_outcome_count"]
        assert row.get("lh") == finding["local_lh"]
        assert row.get("ph") == finding["local_ph"]
    assert [r["code"] for r in checkpoint["row_reconciliation"]] == ["GER 104", "GER 105", "GER 106", "GER 107", "GER 108"]


def test_checkpoint_019_tracks_pagination_and_400_character_truncation():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {r["code"]: r for r in package["courses"]}
    assert "New Arts 472" in by_code["GER 104"]["skills_learned"][4]
    assert len(by_code["GER 108"]["content_summary"]) == 400
    assert "New Arts 474" in by_code["GER 108"]["content_summary"]
    assert len(by_code["GER 106"]["skills_learned"]) == 7


def test_checkpoint_019_keeps_title_conflicts_out_of_repair_handoff():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_019.json").read_text(encoding="utf-8"))
    handoff = {r["code"] for r in checkpoint["repair_handoff"]}
    conflicts = {r["course"] for r in checkpoint["source_conflicts"]}
    assert "GER 104" in conflicts and "GER 108" in conflicts
    assert "GER 104" in handoff  # only remove verified pagination; title stays disputed
    assert "GER 108" in handoff  # restore verified content; title stays disputed
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
