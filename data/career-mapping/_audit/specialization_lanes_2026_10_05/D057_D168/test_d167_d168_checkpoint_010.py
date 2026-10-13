import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def test_final_checkpoint_covers_exact_56_domain_lane():
    cp = json.loads((HERE / "d113_d168_checkpoint_010.json").read_text(encoding="utf-8"))
    expected = [f"D{i:03d}" for i in range(113, 169)]
    assert cp["complete"] is True
    assert cp["completed_ids"] == expected
    assert cp["completed_count"] == 56
    assert cp["remaining_ids"] == [] and cp["remaining_count"] == 0
    assert cp["excluded_ids_skipped"] == []
    assert cp["aggregate_counts"] == {
        "domain_reviews": 56,
        "distinct_domain_ids": 56,
        "review_batches": 10,
        "source_records": 139,
        "candidate_area_labels": 208,
        "canonical_taxonomy_changes": 0,
        "accepted_canonical_specialization_sets": 0,
        "role_to_specialization_assignments": 0,
    }
    assert cp["canonical_taxonomy_files_touched"] is False
    assert cp["roles_mapped_to_specializations"] is False


def test_all_domains_have_individual_pairs_and_batch_rows():
    batches = sorted(HERE.glob("D*_D*_reviews_checkpoint_*.json"))
    rows = [r for p in batches for r in json.loads(p.read_text(encoding="utf-8"))["domains"]]
    ids = [r["domain_id"] for r in rows]
    assert len(batches) == 10
    assert ids == [f"D{i:03d}" for i in range(113, 169)]
    for row in rows:
        jp = HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.json"
        mp = HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.md"
        assert jp.exists() and mp.exists()
        assert json.loads(jp.read_text(encoding="utf-8")) == row
        assert f"# {row['domain_id']}:" in mp.read_text(encoding="utf-8")


def test_creator_economy_taxonomy_limit_is_explicit():
    row = next(r for r in json.loads((HERE / "D167_D168_reviews_checkpoint_010.json").read_text(encoding="utf-8"))["domains"] if r["domain_id"] == "D168")
    assert "not a globally standardized profession taxonomy" in row["parent_scope_disposition"]
    assert "does not establish a creator-economy profession family" in row["decision"]
    assert "provisional; separate-parent review" in row["candidate_areas"][-1]["label"]
