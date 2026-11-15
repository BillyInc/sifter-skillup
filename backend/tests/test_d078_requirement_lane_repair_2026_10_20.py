import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
AUDIT = ROOT / "data/career-mapping/_audit"

# Contract history: this file was written against a four-lane contract
# (needed_core / useful_edge / optional_conditional / out_of_scope).  Commit
# 798cce1 (2026-10-22) deliberately replaced it with a TWO-lane contract: only
# needed_core and useful_edge are learning lanes; conditions stay on the
# records as task context.  See
# data/career-mapping/_audit/D078_REQUIREMENT_USEFULNESS_CHECKPOINT_2026_10_20.md
# ("355 former optional_conditional records moved to useful_edge ... conditions
# remain in their records, not as a third requirement lane").
LEARNING_LANES = {"needed_core", "useful_edge"}
NON_LANE_DISPOSITIONS = {"out_of_scope", "unresolved"}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def record_key(row):
    return (row["context_type"], json.dumps(row.get("context_key"), sort_keys=True), row["item_id"])


def test_repaired_contract_reconciles_every_row_and_current_foundation_spine():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    graph = load(AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
    records = contract["records"]
    # Source ledger size is unchanged at 501 rows.
    assert len(records) == 501
    assert contract["counts"]["records_total"] == len(records)
    # Every source row appears exactly once: no duplicated or dropped row.
    assert len({record_key(row) for row in records}) == len(records)
    # 798cce1 / usefulness checkpoint: 488 in scope = 3 needed_core + 485
    # useful_edge; 12 out_of_scope and 1 unresolved (tax policy analyst,
    # "audit techniques") sit outside the learning lanes.
    expected = {"needed_core": 3, "useful_edge": 485, "out_of_scope": 12, "unresolved": 1}
    assert contract["counts"]["records_in_scope"] == 488
    assert contract["counts"]["by_disposition"] == expected
    assert Counter(row["requirement_lane"] for row in records) == expected
    # Partition invariants so a re-pinned number cannot hide a lost row.
    assert set(expected) == LEARNING_LANES | NON_LANE_DISPOSITIONS
    assert set(contract["policy"]["lane_values"]) == LEARNING_LANES
    assert contract["validation"]["two_learning_lanes_only"] is True
    in_scope = [row for row in records if row["scope_status"] == "in_scope"]
    assert len(in_scope) == contract["counts"]["records_in_scope"]
    assert {row["requirement_lane"] for row in in_scope} == LEARNING_LANES
    assert all(row["requirement_lane"] in NON_LANE_DISPOSITIONS for row in records if row["scope_status"] != "in_scope")
    assert sum(contract["counts"]["by_disposition"].values()) == contract["counts"]["records_total"]
    assert sum(contract["counts"]["by_context_type"].values()) == contract["counts"]["records_total"]
    assert {row["item_id"] for row in records if row["requirement_lane"] == "needed_core"} == {
        node.removeprefix("domain-item:") for node in graph["foundation_item_ids"]
    }
    assert contract["counts"]["stale_aggregate_corrections"]["ledger_records_actually_needed"] == 4
    assert contract["counts"]["stale_aggregate_corrections"]["ledger_records_actually_conditional"] == 261


def test_each_canonical_area_and_current_role_has_item_specific_dispositions():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    summary = load(AUDIT / "D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.json")
    graph = load(AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
    # 798cce1 renamed the summary key items_total -> records_total (total and
    # areas) and record_references_total (roles, which can share records).
    assert summary["counts"]["records_total"] == len(contract["records"])
    assert len(summary["canonical_areas"]) == 7
    assert all(area["records_total"] > 0 for area in summary["canonical_areas"].values())
    current_roles = {row["role_id"].rsplit(":", 1)[-1] for row in graph["method_area_role_routes"]}
    assert len(current_roles) == 19
    # Summary role keys are full node ids ("role:D078:<n>:<slug>"); the graph
    # route role_id carries the same id, so compare slugs.
    assert {key.rsplit(":", 1)[-1] for key in summary["current_roles"]} == current_roles
    assert set(summary["current_roles"]) == {row["role_id"] for row in graph["method_area_role_routes"]}
    assert all(role["record_references_total"] > 0 for role in summary["current_roles"].values())
    # Each entry's disposition breakdown must add up to its own total.  Areas
    # hold only learning lanes; roles may also reference out_of_scope/unresolved
    # records (the genealogist, tax policy analyst, etc. rows above).
    for area in summary["canonical_areas"].values():
        assert set(area["by_disposition"]) <= LEARNING_LANES
        assert sum(area["by_disposition"].values()) == area["records_total"]
    for role in summary["current_roles"].values():
        assert set(role["by_disposition"]) <= LEARNING_LANES | NON_LANE_DISPOSITIONS
        assert sum(role["by_disposition"].values()) == role["record_references_total"]
    for row in contract["records"]:
        if row["scope_status"] == "in_scope":
            assert row.get("rationale")
            assert row.get("context_summary")
            assert row["item_label"].casefold() in row["rationale"].casefold()


def test_responsibility_and_casevo_keep_task_and_method_conditions():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    records = {row["item_id"]: row for row in contract["records"] if row["context_type"] == "domain"}
    # Two-lane contract (798cce1): conditions are retained verbatim as task
    # context on useful_edge records; they no longer define a third lane.
    responsibility = records["d078-responsible-research"]
    assert responsibility["requirement_lane"] == "useful_edge"
    assert "people or identifiable/sensitive information" in responsibility["condition"]
    casevo = records["d078-casevo-tool"]
    assert casevo["requirement_lane"] == "useful_edge"
    assert "agent-based social-simulation" in casevo["condition"]
    assert "Mesa remains an alternative" in casevo["condition"]
    assert casevo["evidence_gap"] is None
    assert "optional_conditional" not in {row["requirement_lane"] for row in contract["records"]}


def test_existing_task_and_route_conditions_are_preserved_except_casevo_resolution():
    original = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json")
    repaired = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    original_by_id = {record_key(row): row for row in original["records"]}
    changed = {}
    for row in repaired["records"]:
        prior = original_by_id[record_key(row)]
        if row.get("condition") != (prior.get("condition") or None):
            changed[row["item_id"]] = (prior.get("condition"), row.get("condition"))
    # Casevo's condition was resolved (original test intent).  798cce1 also
    # rewrote the genealogist "interpret pedigree charts" row when it moved out
    # of scope (usefulness checkpoint: "152:interpret pedigree charts|essential
    # is out of scope").  No other condition may change.
    assert sorted(changed) == ["152:interpret pedigree charts|essential", "d078-casevo-tool"]
    # The pedigree rewrite must keep the original text, differing only in the
    # apostrophe of "pair's" (a mojibake sequence became "?").
    old, new = changed["152:interpret pedigree charts|essential"]

    def normalise(text):
        return re.sub(r"pair.{1,6}s source", "pair's source", text)

    assert normalise(old) == normalise(new)
    # Every other record (including the 355 former optional_conditional rows,
    # now useful_edge) keeps its original condition verbatim.
    assert len(repaired["records"]) - len(changed) == 499


def test_out_of_scope_rows_are_traceable_and_no_in_scope_gap_remains():
    contract = load(AUDIT / "D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json")
    out = [row for row in contract["records"] if row["requirement_lane"] == "out_of_scope"]
    # 798cce1: 11 -> 12 because "interpret pedigree charts|essential"
    # (genealogist) was moved out of scope.
    assert len(out) == 12
    assert contract["counts"]["out_of_scope"] == len(out)
    assert any(row["item_id"] == "152:interpret pedigree charts|essential" for row in out)

    def reason(row):
        # Older rows carry scope_reason/checked_evidence at top level; the
        # pedigree row nests them under out_of_scope_reason.
        nested = row.get("out_of_scope_reason") or {}
        return (
            row.get("scope_reason") or nested.get("evidence_decision"),
            row.get("checked_evidence") or nested.get("checked_evidence"),
        )

    for row in out:
        recorded_reason, checked_evidence = reason(row)
        assert recorded_reason and checked_evidence, row["item_id"]
        assert row["scope_status"].startswith("out_of_scope")
    assert not [row for row in contract["records"] if row["scope_status"] == "in_scope" and row.get("evidence_gap")]
    assert contract["counts"]["residual_unresolved_in_scope"] == 0
    # The single unresolved record sits outside the learning lanes and must
    # carry its own evidence gap and next action (checkpoint, item 69).
    unresolved = [row for row in contract["records"] if row["requirement_lane"] == "unresolved"]
    assert [row["item_id"] for row in unresolved] == ["69:audit techniques|optional"]
    assert contract["counts"]["unresolved"] == contract["counts"]["residual_unresolved"] == 1
    assert unresolved[0]["scope_status"] == "unresolved"
    assert unresolved[0]["evidence_gap"]
    assert unresolved[0]["unresolved_reason"]["next_resolvable_action"]
