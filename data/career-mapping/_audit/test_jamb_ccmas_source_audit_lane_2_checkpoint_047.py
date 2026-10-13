import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
CHECKPOINT = HERE / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_047.json"


def test_checkpoint_reuses_row_194_and_checks_only_open_cells():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = data["coverage_reconciled_before_search"]
    assert [item["canonical_row"] for item in coverage["prior_exact_source_contexts_reused"]] == [194]
    assert coverage["new_source_checks"] == [191, 192, 193, 195, 196, 197, 198, 199, 200]


def test_adjacent_physics_programmes_keep_their_awarders_separate():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    expected = {
        191: ["CALEB"],
        192: ["UNN"],
        193: ["GOUU"],
        194: ["BAUCHI"],
        195: ["ADSU"],
        196: ["PAUL"],
        197: ["ABSU"],
        198: ["COVENANT"],
        199: ["COVENANT"],
        200: ["COVENANT"],
    }
    assert {row: rows[row]["current_institutions"] for row in expected} == expected
    assert rows[194]["disposition"] == "source_conflict_locator_only"
    assert data["progress"]["shared_offering_ledger_edited"] is False


def test_option_branches_and_locator_conflict_are_explicit():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    assert "branches" in rows[193]["boundary"]
    assert "p. 490" in rows[194]["source_locator"]
    assert "p. 494" in rows[194]["source_locator"]
    assert data["progress"]["downstream_domain_audit_performed"] is False
