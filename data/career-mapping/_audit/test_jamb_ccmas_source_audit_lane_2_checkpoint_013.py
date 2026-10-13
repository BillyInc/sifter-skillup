import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_checkpoint_013_uses_the_actual_ccmas_field_names():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    rows_by_ordinal = {i + 1: row for i, row in enumerate(package["courses"])}

    assert checkpoint["local_field_contract"] == {
        "outcomes_key": "skills_learned",
        "lecture_hours_key": "lh",
        "practical_hours_key": "ph",
    }
    for finding in checkpoint["row_reconciliation"]:
        row = rows_by_ordinal[finding["ordinal"]]
        assert row["code"] == finding["code"]
        assert len(row.get("skills_learned") or []) == finding["local_outcomes"]
        assert row.get("lh") == finding.get("local_lh")
        assert row.get("ph") == finding.get("local_ph")
        if "local_units" in finding:
            assert row.get("units") == finding["local_units"]


def test_lane_2_checkpoint_013_explicitly_corrects_earlier_increments():
    checkpoint = json.loads((AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_013.json").read_text(encoding="utf-8"))
    assert len(checkpoint["corrects_and_supersedes"]) == 6
    assert checkpoint["progress"]["package_080_local_rows_reconciled_to_actual_field_names"] == 41
    assert checkpoint["progress"]["package_080_row_screen_complete"] is True
    assert checkpoint["progress"]["package_080_outcome_textual_reconciliation_complete"] is False
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert checkpoint["progress"]["package_080_reconciliation_and_repair_complete"] is False
    assert checkpoint["separate_structural_finding"]["local_presence"] is False
