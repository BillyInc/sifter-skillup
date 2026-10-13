import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
HANDOFF = AUDIT / "jamb_ccmas_lane_3_repair_handoff_2026-09-28_increment_001.json"


def test_lane_3_repair_handoff_contains_all_confirmed_petroleum_package_defects():
    handoff = json.loads(HANDOFF.read_text(encoding="utf-8"))
    records = {row["record"]: row for row in handoff["repair_items"]}

    assert handoff["scope"]["ccmas_package_index"] == 172
    assert handoff["scope"]["confirmed_defects_handed_off"] == 11
    assert len(records) == 11
    assert "PETROLEUM ENGINEERING::PEE 101" in records
    assert "PETROLEUM ENGINEERING::PEE 401" in records
    assert "PETROLEUM ENGINEERING::GET 399::ordinal 44" in records
    assert "PETROLEUM ENGINEERING::GET 399::ordinal 49" in records
    assert handoff["scope"]["shared_product_ledger_edited"] is False


def test_lane_3_repair_handoff_keeps_the_peE312_table_detail_conflict_explicit():
    handoff = json.loads(HANDOFF.read_text(encoding="utf-8"))
    conflicts = {row["record"]: row for row in handoff["source_conflicts"]}

    row = conflicts["PETROLEUM ENGINEERING::PEE 312"]
    assert row["global_table"] == "90"
    assert row["detailed_block"] == "45"
    assert row["local"] == "90"
    assert "preserve both" in row["disposition"]
