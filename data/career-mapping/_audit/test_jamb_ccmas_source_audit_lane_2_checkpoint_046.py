import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
CHECKPOINT = HERE / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_046.json"


def test_coverage_reuses_exact_cells_and_limits_new_searches():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = data["coverage_reconciled_before_search"]
    assert [item["canonical_row"] for item in coverage["exact_source_contexts_reused"]] == [186, 188, 189, 190]
    assert coverage["new_source_checks"] == [181, 182, 183, 184, 185, 187]
    assert data["progress"]["new_source_occurrences_checked"] == 6


def test_human_biology_and_applied_botany_exact_cells_match():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    assert rows[181]["current_institutions"] == ["ABUAD"]
    assert rows[181]["disposition"] == "confirmed_exact_jamb_title_and_awarder_cell_match"
    assert rows[182]["current_institutions"] == ["BAUCHI"]
    assert rows[182]["disposition"] == "confirmed_exact_jamb_title_and_awarder_cell_match"


def test_title_variants_and_separate_faculty_contexts_stay_unresolved():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    for row in (183, 184, 185, 187):
        assert rows[row]["disposition"].startswith("unresolved")
    assert "Physics Engineering" in rows[185]["finding"]
    assert "Geography and Meteorology" in rows[187]["finding"]
    assert data["progress"]["shared_offering_ledger_edited"] is False
    assert data["progress"]["downstream_domain_audit_performed"] is False


def test_checkpoint_uses_official_brochure_and_sets_next_cursor():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert data["sources"][0]["url"].endswith("brochure-degree-sciences.pdf")
    assert data["progress"]["next_cursor"].startswith("Reconcile exact checkpoint coverage for rows 191-200")
