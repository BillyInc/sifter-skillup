import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
CHECKPOINT = HERE / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_044.json"


def test_checkpoint_records_only_rows_161_170_and_preserves_occurrence_units():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert data["scope"]["canonical_identity_rows"] == [161, 170]
    assert data["scope"]["row_count"] == 10
    assert data["scope"]["source_faculty"] == "Sciences"
    decisions = data["occurrence_decisions"]
    assert [row["canonical_identity_row"] for row in decisions] == [161, 165, 167, 168, 170]
    assert len({row["source_occurrence_id"] for row in decisions}) == len(decisions)


def test_applied_biochemistry_roster_mismatch_is_explicit_and_audit_only():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = next(item for item in data["occurrence_decisions"] if item["canonical_identity_row"] == 165)
    assert row["current_institutions"] == ["ESUTECH", "UNIZIK"]
    assert row["disposition"] == "confirmed_defect"
    assert "UNIZIK" in row["finding"]
    assert data["progress"]["shared_offering_ledger_edited"] is False
    assert data["progress"]["downstream_domain_audit_performed"] is False


def test_adjacent_and_same_name_offerings_remain_separate():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    assert "Marine Biology & Fisheries" in " ".join(rows[161]["observed_context"])
    assert rows[161]["current_institutions"] == ["AKSU", "LAGOS"]
    assert "MICROBIOLOGY AND INDUSTRIAL BIOTECHNOLOGY" in " ".join(rows[170]["observed_context"])
    assert rows[170]["current_institutions"] == ["AEFUNA", "FED-WUKARI"]


def test_checkpoint_retains_exact_primary_source_locators_and_next_cursor():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert data["source"]["url"] == "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"
    assert all(item["source_locator"] for item in data["occurrence_decisions"])
    assert "printed p. 680" in data["occurrence_decisions"][0]["source_locator"]
    assert "printed page not independently established" in data["occurrence_decisions"][2]["source_locator"]
    assert data["progress"]["next_cursor"].startswith("Reconcile exact source-checkpoint coverage for rows 171-180")
