import json
from pathlib import Path


HERE = Path(__file__).parent
OUTPUT = HERE / "d057_d084_register_projection_checkpoint_019.json"


def test_all_absent_d057_d084_reviews_have_a_prepared_projection():
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    assert data["counts"]["absent_domain_review_projections"] == 20
    assert data["counts"]["collision_safe_projections_prepared_not_applied"] == 20
    assert len(data["prepared_safe_additive_projections"]) == 20
    assert data["counts"]["remaining_unresolved_projection_conflicts"] == 0


def test_all_four_evidence_collisions_are_namespaced_without_register_write():
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    assert data["counts"]["source_id_locator_claim_conflict_occurrences_resolved_in_projection"] == 4
    assert data["counts"]["conflicts_against_existing_shared_register"] == 1
    assert data["counts"]["conflicts_within_projection_batch"] == 3
    assert {row["domain_id"] for row in data["source_id_conflict_resolution"]} == {"D077", "D079", "D081"}
    assert data["shared_register_written"] is False
    assert data["canonical_taxonomy_written"] is False
    for projection in data["prepared_safe_additive_projections"]:
        assert projection["projection_written_to_shared_register"] is False
