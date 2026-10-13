import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SOURCE = ROOT / "data" / "career-mapping" / "ccmas" / "arts.json"


def test_checkpoint_015_rows_match_current_local_structured_fields():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(p for p in data["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    by_code = {row["code"]: row for row in package["courses"]}
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_015.json").read_text(encoding="utf-8"))

    assert [r["code"] for r in checkpoint["row_reconciliation"]] == ["ENT 312", "FAC 301", "FAC 302", "GER 301", "GER 302"]
    for finding in checkpoint["row_reconciliation"]:
        row = by_code[finding["code"]]
        assert len(row.get("skills_learned") or []) == finding["local_outcome_count"]
        assert row.get("lh") == finding["local_lh"]
        assert row.get("ph") == finding["local_ph"]
    assert by_code["ENT 312"]["content_summary"].endswith("personal savings, ")
    assert by_code["FAC 301"]["content_summary"] is None
    assert by_code["FAC 302"]["content_summary"].startswith("Learning Outcomes")
    assert "divisible verbs" in by_code["GER 301"]["content_summary"]
    assert "Intensive listening and speech practice" in by_code["GER 302"]["content_summary"]


def test_checkpoint_015_keeps_the_fac301_duplicate_block_corroboration_explicit():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_015.json").read_text(encoding="utf-8"))
    fac = next(r for r in checkpoint["row_reconciliation"] if r["code"] == "FAC 301")
    assert "same official NUC Arts PDF" in fac["disposition"]
    assert "printed p. 67" in next(x["pointer"] for x in checkpoint["repair_handoff"] if x["code"] == "FAC 301")
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False


def test_checkpoint_015_handoff_has_only_confirmed_local_repairs():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_015.json").read_text(encoding="utf-8"))
    pointers = {entry["code"]: entry["pointer"] for entry in checkpoint["repair_handoff"]}
    assert set(pointers) == {"ENT 312", "FAC 301", "FAC 302", "GER 301"}
    assert "GER 302" not in pointers
    assert checkpoint["progress"]["lane_2_packages_fully_closed"] == 0
