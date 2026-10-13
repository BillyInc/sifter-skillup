import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
UPDATE = json.loads((HERE / "D109_D112_global_evidence_update_2026_10_06.json").read_text(encoding="utf-8"))
INVENTORY = json.loads((HERE / "exact_global_specialization_gap_inventory_2026_10_06.json").read_text(encoding="utf-8"))


def test_scope_is_global_only_and_noncanonical():
    assert "No Nigeria-specific research" in UPDATE["scope"]
    assert all(row["canonical_write"] is False for row in UPDATE["records"])
    assert all(row["role_assignments"] == "none" for row in UPDATE["records"])
    assert INVENTORY["counts"]["nigeria_specific_research_performed"] is False
    assert INVENTORY["counts"]["canonical_edits"] == 0
    assert INVENTORY["counts"]["role_to_specialization_links_created"] == 0


def test_updates_only_existing_d109_to_d112_residuals():
    assert [row["domain_id"] for row in UPDATE["records"]] == ["D109", "D110", "D111", "D112"]
    assert all(row["open_questions"] for row in UPDATE["records"])
    assert all(row["evidence"] for row in UPDATE["records"])


def test_each_source_has_locator_claim_and_limit():
    for row in UPDATE["records"]:
        for source in row["evidence"]:
            assert source["publisher"]
            assert source["title"]
            assert source["url"].startswith("https://")
            assert source["locator"]
            assert source["supports"]
            assert source["limit"]


def test_inventory_covers_all_target_ids_without_missing_artifacts():
    counts = INVENTORY["counts"]
    assert counts["target_ids_expected"] == 23
    assert counts["target_ids_with_existing_review_or_adjudication"] == 23
    assert counts["target_ids_missing_artifacts"] == []
    assert len(INVENTORY["target_domain_reviews"]) == 23


def test_d098_three_versus_four_conflict_is_not_hidden():
    counts = INVENTORY["counts"]
    assert counts["d098_shared_register_candidate_count"] == 3
    assert counts["d098_adjudicated_candidate_count"] == 4
    assert counts["d098_conflict_still_open"] is True


def test_d057_d091_provisional_and_parent_scope_ids_are_exact_and_unique():
    counts = INVENTORY["counts"]
    assert counts["d057_d091_ids_expected"] == 35
    assert counts["d057_d091_lane_review_files_expected"] == 28
    assert counts["d057_d091_lane_review_files_found"] == 28
    assert counts["d057_d091_shared_register_only_review_records"] == 7
    assert counts["d057_d091_review_records_total"] == 35
    assert len(counts["d057_d091_provisional_status_ids"]) == 24
    assert counts["d057_d091_additional_explicit_parent_scope_open_ids"] == ["D068", "D088", "D090", "D091"]
    assert counts["d057_d091_unique_unresolved_or_provisional_count"] == 28
    assert len(counts["d057_d091_unique_unresolved_or_provisional_ids"]) == len(set(counts["d057_d091_unique_unresolved_or_provisional_ids"]))
    assert counts["d057_d091_unsettled_ids_without_recommendation_update"] == []
    assert len(counts["d057_d091_unsettled_ids_with_recommendation_update"]) == 28
