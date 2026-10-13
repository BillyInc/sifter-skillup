import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
CHECKPOINT = HERE / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_045.json"


def test_checkpoint_reconciles_prior_exact_contexts_before_new_searches():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    coverage = data["coverage_reconciled_before_search"]
    assert [item["canonical_row"] for item in coverage["prior_exact_offering_contexts_reused"]] == [171, 172]
    assert coverage["prior_exact_offering_contexts_reused"][0]["source_context_count"] == 2
    assert data["progress"]["new_occurrence_contexts_checked"] == 8
    assert [item["canonical_identity_row"] for item in data["occurrence_decisions"]] == list(range(173, 181))


def test_exact_data_management_awarder_cell_is_separate_from_neighbours():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    row = next(item for item in data["occurrence_decisions"] if item["canonical_identity_row"] == 174)
    assert row["current_institutions"] == ["NOUN"]
    assert row["disposition"] == "confirmed_exact_jamb_title_and_awarder_cell_match"
    context = " ".join(row["observed_context"])
    assert "MANAGEMENT INFORMATION SYSTEM" in context
    assert "INFORMATION AND COMMUNICATION TECHNOLOGY" in context


def test_unresolved_cells_are_not_inferred_from_neighbouring_or_similar_contexts():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = {item["canonical_identity_row"]: item for item in data["occurrence_decisions"]}
    for row in (173, 175, 176, 177, 178, 179, 180):
        assert rows[row]["disposition"].startswith("unresolved")
    assert "not an awarding-institution cell" in rows[176]["finding"]
    assert "different title/context" in rows[173]["finding"]
    assert "row 180" in rows[179]["finding"].lower()
    assert "Electronics and Computer Technology" in rows[180]["finding"]
    assert data["progress"]["shared_offering_ledger_edited"] is False
    assert data["progress"]["downstream_domain_audit_performed"] is False


def test_official_source_urls_and_resume_cursor_are_recorded():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    urls = {item["url"] for item in data["sources"]}
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf" in urls
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf" in urls
    assert data["progress"]["next_cursor"].startswith("Reconcile exact source-checkpoint coverage for rows 181-190")
