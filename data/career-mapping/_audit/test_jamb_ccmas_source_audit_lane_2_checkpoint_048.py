import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
CHECKPOINT = HERE / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_048.json"


def test_prior_rows_201_204_are_reused_and_only_residual_rows_searched():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = data["coverage_reconciled_before_search"]
    assert [item["canonical_row"] for item in coverage["prior_exact_source_contexts_reused"]] == [201, 202, 203, 204]
    assert coverage["new_source_checks"] == [205, 206, 207, 208, 209, 210]


def test_literal_industral_spelling_and_exact_eawarders_are_recorded():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    assert rows[205]["current_institutions"] == ["EBSU"]
    assert rows[205]["disposition"] == "confirmed_exact_table_spelling_and_awarder_cell_match"
    assert "INDUSTRAL MATHEMATICS/COMPUTER" in rows[205]["finding"]


def test_adjacent_geology_contexts_and_open_chemistry_cells_are_preserved():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    assert rows[209]["current_institutions"] == ["UNIZIK"]
    assert rows[210]["current_institutions"] == ["CRAWFORD"]
    assert rows[206]["disposition"] == "unresolved"
    assert rows[207]["disposition"] == "unresolved"
    assert data["progress"]["shared_offering_ledger_edited"] is False


def test_official_brochure_source_and_resume_cursor_are_recorded():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert data["source"]["url"].endswith("brochure-degree-sciences.pdf")
    assert data["progress"]["next_cursor"].startswith("Reconcile exact checkpoint coverage for rows 211-220")
