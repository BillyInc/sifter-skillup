import json
from pathlib import Path


HERE = Path(__file__).parent
CHECKPOINT = HERE / "SOURCE_MAPPING_SCOPE_CHECKPOINT_2026-09-19.json"
CANONICAL = HERE.parent / "programme_domain_final.json"
JAMB = HERE / "jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json"


def test_checkpoint_matches_current_unmapped_and_queue_counts():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    canonical = json.loads(CANONICAL.read_text(encoding="utf-8"))
    jamb = json.loads(JAMB.read_text(encoding="utf-8"))

    review_required = next(
        category for category in jamb["categories"] if category["category"] == "single_ccmas_full_curriculum"
    )
    partial = next(
        category for category in jamb["categories"] if category["category"] == "partial_curriculum_scope"
    )

    assert checkpoint["inventory"]["canonical_programmes"] == len(canonical) == 237
    assert checkpoint["inventory"]["canonical_programmes_without_active_domain_link_at_checkpoint"] == 1
    assert checkpoint["inventory"]["unmapped_programme_at_checkpoint"] == "Sciences::Mathematics"
    current_empty = [key for key, value in canonical.items() if not value.get("links")]
    assert current_empty == []
    assert any(link["domain_id"] == "D009" for link in canonical["Sciences::Mathematics"]["links"])
    assert checkpoint["post_checkpoint_local_observation"]["canonical_programmes_without_active_domain_link"] == 0
    assert checkpoint["inventory"]["jamb_rows_review_required"] == review_required["review_required"] == 86
    assert checkpoint["inventory"]["jamb_rows_partial_curriculum_scope"] == partial["rows"] == 273


def test_checkpoint_does_not_claim_promotion_or_live_deployment():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = checkpoint["local_findings"][0]

    assert finding["decision"] == "external_source_review_required"
    assert finding["current_active_domain_links"] == []
    assert "without editing generated gzip or applying SQL" in checkpoint["next_step"]
