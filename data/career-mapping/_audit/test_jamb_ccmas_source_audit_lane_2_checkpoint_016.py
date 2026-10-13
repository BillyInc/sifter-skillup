import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "arts.json"


def test_checkpoint_016_matches_current_package_rows_and_scope():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {row["code"]: row for row in package["courses"]}
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_016.json").read_text(encoding="utf-8"))

    for finding in checkpoint["row_reconciliation"]:
        row = by_code[finding["code"]]
        assert len(row.get("skills_learned") or []) == finding["local_outcome_count"]
        assert row.get("lh") == finding["local_lh"]
        assert row.get("ph") == finding["local_ph"]
    assert [r["code"] for r in checkpoint["row_reconciliation"]] == ["GER 207", "GER 208", "GER 209", "GER 210", "GST 312"]
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False


def test_checkpoint_016_detects_specific_field_contamination():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {row["code"]: row for row in package["courses"]}
    assert "New Arts 480" in by_code["GER 208"]["skills_learned"][3]
    assert by_code["GER 209"]["content_summary"] is None
    assert by_code["GER 209"]["skills_learned"][3].endswith("Here techniques of translation are expressed")
    assert by_code["GER 210"]["content_summary"].endswith("300 Level")
    assert by_code["GST 312"]["content_summary"].startswith("Learning Outcomes")


def test_checkpoint_016_handoff_and_non_signoff_are_explicit():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_016.json").read_text(encoding="utf-8"))
    assert {item["code"] for item in checkpoint["repair_handoff"]} == {"GER 207", "GER 208", "GER 209", "GER 210", "GST 312"}
    assert checkpoint["progress"]["lane_2_packages_fully_closed"] == 0
    gst = next(row for row in checkpoint["row_reconciliation"] if row["code"] == "GST 312")
    assert "GST 311 vs detailed GST 312" in gst["disposition"]
