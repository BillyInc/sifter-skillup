import json
from pathlib import Path


HERE = Path(__file__).parent
MANIFEST = HERE / "specialization_coverage_D057_D168_2026_10_05.json"


def test_full_d057_d168_range_is_partitioned_without_skipped_ids():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    rows = data["domains"]
    assert len(rows) == 112
    assert [row["domain_id"] for row in rows] == [f"D{i:03d}" for i in range(57, 169)]
    assert data["counts"]["domain_ids_with_any_review_artifact"] == 51
    assert data["counts"]["domain_ids_without_any_review_artifact"] == 61


def test_projection_conflict_is_not_counted_as_completed_or_canonical():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    by_id = {row["domain_id"]: row for row in data["domains"]}
    assert by_id["D098"]["coverage_state"] == "lane_review_and_shared_projection_conflict"
    assert by_id["D098"]["lane_projection_exactly_matches_shared_record"] is False
    assert by_id["D098"]["candidate_taxonomy_is_canonical"] is False
    assert by_id["D099"]["coverage_state"] == "no_review_artifact_found"
