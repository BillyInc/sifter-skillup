import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
AUDIT = ROOT / "data/career-mapping/_audit"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_repaired_contract_reconciles_every_row_and_current_foundation_spine():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    graph = load(AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
    records = contract["records"]
    assert len(records) == 501
    assert contract["counts"]["records_in_scope"] == 490
    assert contract["counts"]["by_disposition"] == {
        "needed_core": 3,
        "useful_edge": 132,
        "optional_conditional": 355,
        "out_of_scope": 11,
    }
    assert Counter(row["requirement_lane"] for row in records) == {
        "needed_core": 3,
        "useful_edge": 132,
        "optional_conditional": 355,
        "out_of_scope": 11,
    }
    assert {row["item_id"] for row in records if row["requirement_lane"] == "needed_core"} == {
        node.removeprefix("domain-item:") for node in graph["foundation_item_ids"]
    }
    assert contract["counts"]["stale_aggregate_corrections"]["ledger_records_actually_needed"] == 4
    assert contract["counts"]["stale_aggregate_corrections"]["ledger_records_actually_conditional"] == 261


def test_each_canonical_area_and_current_role_has_item_specific_dispositions():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    summary = load(AUDIT / "D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.json")
    graph = load(AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
    assert len(summary["canonical_areas"]) == 7
    assert all(area["items_total"] > 0 for area in summary["canonical_areas"].values())
    current_roles = {row["role_id"].rsplit(":", 1)[-1] for row in graph["method_area_role_routes"]}
    assert len(current_roles) == 19
    assert set(summary["current_roles"]) == current_roles
    assert all(role["items_total"] > 0 for role in summary["current_roles"].values())
    for row in contract["records"]:
        if row["scope_status"] == "in_scope":
            assert row.get("rationale")
            assert row.get("context_summary")
            assert row["item_label"].casefold() in row["rationale"].casefold()


def test_responsibility_and_casevo_keep_task_and_method_conditions():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    records = {row["item_id"]: row for row in contract["records"] if row["context_type"] == "domain"}
    responsibility = records["d078-responsible-research"]
    assert responsibility["requirement_lane"] == "optional_conditional"
    assert "people or identifiable/sensitive information" in responsibility["condition"]
    casevo = records["d078-casevo-tool"]
    assert casevo["requirement_lane"] == "optional_conditional"
    assert "agent-based social-simulation" in casevo["condition"]
    assert "Mesa remains an alternative" in casevo["condition"]
    assert casevo["evidence_gap"] is None


def test_existing_task_and_route_conditions_are_preserved_except_casevo_resolution():
    original = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json")
    repaired = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    original_by_id = {
        (row["context_type"], json.dumps(row.get("context_key"), sort_keys=True), row["item_id"]): row
        for row in original["records"]
    }
    changed = []
    for row in repaired["records"]:
        key = (row["context_type"], json.dumps(row.get("context_key"), sort_keys=True), row["item_id"])
        prior = original_by_id[key]
        if row.get("condition") != (prior.get("condition") or None):
            changed.append(row["item_id"])
    assert changed == ["d078-casevo-tool"]


def test_out_of_scope_rows_are_traceable_and_no_in_scope_gap_remains():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    out = [row for row in contract["records"] if row["requirement_lane"] == "out_of_scope"]
    assert len(out) == 11
    assert all(row.get("scope_reason") and row.get("checked_evidence") for row in out)
    assert not [row for row in contract["records"] if row["scope_status"] == "in_scope" and row.get("evidence_gap")]
    assert contract["counts"]["residual_unresolved_in_scope"] == 0
