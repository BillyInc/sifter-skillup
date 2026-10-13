import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "arts.json"


def test_checkpoint_018_counts_and_hours_match_current_rows():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {r["code"]: r for r in package["courses"]}
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_018.json").read_text(encoding="utf-8"))
    for finding in checkpoint["row_reconciliation"]:
        row = by_code[finding["code"]]
        assert len(row.get("skills_learned") or []) == finding["local_outcome_count"]
        assert row.get("lh") == finding["local_lh"]
        assert row.get("ph") == finding["local_ph"]
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False


def test_checkpoint_018_detects_current_field_spills_without_rewriting_data():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {r["code"]: r for r in package["courses"]}
    assert by_code["GST 212"]["content_summary"].endswith("Logic as an")
    assert by_code["FAC 201"]["content_summary"] is None
    assert len(by_code["FAC 201"]["skills_learned"]) == 1
    assert len(by_code["FAC 202"]["content_summary"]) == 400
    assert "into English or any other language" in by_code["GER 201"]["skills_learned"][3]


def test_checkpoint_018_separates_local_repairs_from_source_quality_conflicts():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_018.json").read_text(encoding="utf-8"))
    fac = next(row for row in checkpoint["row_reconciliation"] if row["code"] == "FAC 201")
    assert "NUC source itself" in fac["disposition"]
    assert any(x["course"] == "FAC 201" and x["type"].startswith("Digital Humanities block") for x in checkpoint["source_conflicts"])
    assert checkpoint["progress"]["lane_2_packages_fully_closed"] == 0
