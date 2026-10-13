import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
LEDGER = AUDIT / "SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json"
CHECKPOINT = AUDIT / "SPARSE_ROLE_ENRICHMENT_CHECKPOINT_2026_10_07_003.json"

EXPECTED_DOMAINS = {
    "D003", "D037", "D038", "D039", "D040", "D044", "D045", "D049", "D050", "D051",
    "D052", "D053", "D054", "D055", "D058", "D065", "D071", "D075", "D076", "D079",
    "D080", "D087", "D088", "D089", "D091", "D101", "D125", "D132", "D137", "D150",
    "D153", "D156", "D157", "D162", "D163",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_sparse_ledger_covers_all_floor_domains_and_deficit_slots():
    data = load(LEDGER)
    rows = data["floor_inventory"]
    assert {row["domain_id"] for row in rows} == EXPECTED_DOMAINS
    assert len(rows) == 35
    assert sum(row["deficit_slots"] for row in rows) == 247
    assert sum(row["candidate_coverage_count"] for row in rows) == 247
    assert all(row["candidate_coverage_state"] == "all_deficit_slots_have_named_candidates" for row in rows)


def test_sparse_candidates_have_separate_domain_and_area_gates():
    data = load(LEDGER)
    candidates = data["candidate_records"]
    assert len(candidates) == 283
    assert all(candidate["domain_id"] in EXPECTED_DOMAINS for candidate in candidates)
    assert all(candidate["area_of_specialization"] for candidate in candidates)
    assert all(candidate["area_status"] == "reconciled_global_recommendation" for candidate in candidates)
    assert all(candidate["area_boundary"] for candidate in candidates)
    assert all(candidate["area_evidence_source_refs"] for candidate in candidates)
    assert all(candidate["area_fit_rationale"] for candidate in candidates)
    assert all(candidate["parent_domain_fit_rationale"] for candidate in candidates)
    assert all(candidate["candidate_tasks"] for candidate in candidates)
    assert all(candidate["global_evidence"] for candidate in candidates)
    assert all("nigerian_context" in candidate for candidate in candidates)
    assert all(
        candidate.get("review_only_reason")
        for candidate in candidates
        if candidate["disposition"] == "review_only"
    )
    assert not any(
        isinstance(evidence, dict) and evidence.get("resolution")
        for candidate in candidates
        for evidence in candidate["global_evidence"]
    )


def test_sparse_enrichment_is_audit_only_and_checkpoint_is_in_progress():
    data = load(LEDGER)
    checkpoint = load(CHECKPOINT)
    assert data["canonical_files_edited"] is False
    assert data["integrity"]["canonical_files_edited"] is False
    assert checkpoint["lane_status"] == "in_progress"
    assert checkpoint["canonical_files_edited"] is False
    assert checkpoint["counts"]["candidate_slot_coverage_gap"] == 0


def test_sparse_candidates_use_reconciled_global_area_register():
    data = load(LEDGER)
    checkpoint = load(CHECKPOINT)
    reconciliation = data["specialization_reconciliation"]
    assert reconciliation["legacy_isco_area_labels_used_as_final_names"] is False
    assert reconciliation["candidate_records_using_reconciled_area_labels"] == len(data["candidate_records"])
    assert checkpoint["specialization_reconciliation"]["legacy_isco_area_labels_used_as_final_names"] is False
    assert checkpoint["counts"]["candidate_records_remapped_to_reconciled_areas"] == 235
