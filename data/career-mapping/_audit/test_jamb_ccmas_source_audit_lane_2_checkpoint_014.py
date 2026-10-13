import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "arts.json"


def test_checkpoint_014_itemizes_exact_package_080_rows_and_current_outcomes():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_014.json").read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in package["courses"]}

    assert len(checkpoint["row_reconciliation"]) == 11
    for finding in checkpoint["row_reconciliation"]:
        row = rows[finding["code"]]
        assert len(row.get("skills_learned") or []) == finding["local_outcome_count"]
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert checkpoint["progress"]["lane_2_packages_fully_closed"] == 0


def test_checkpoint_014_keeps_source_cross_references_and_missing_ger_407_distinct():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_014.json").read_text(encoding="utf-8"))
    rows = {row["code"]: row for row in checkpoint["row_reconciliation"]}

    assert "cross-reference" in rows["GER 303"]["source_outcome_form"]
    assert "cross-reference" in rows["GER 405"]["source_outcome_form"]
    assert "GER 407 itself is absent locally" in rows["GER 406"]["disposition"]
    assert checkpoint["source"]["url"].startswith("https://www.nuc.edu.ng/")


def test_checkpoint_014_markdown_matches_audit_scope():
    md = (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_014.md").read_text(encoding="utf-8")
    assert "GER 303–GER 406" in md
    assert "No shared CCMAS product JSON, mapping, or seed was edited." in md
