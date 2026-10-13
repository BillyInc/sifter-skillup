import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
FIRST = 113
LAST = 168


def test_every_reviewed_domain_has_scope_sources_and_explicit_boundaries():
    rows = []
    for path in HERE.glob("D*_D*_reviews_checkpoint_*.json"):
        rows.extend(json.loads(path.read_text(encoding="utf-8"))["domains"])
    ids = [row["domain_id"] for row in rows]
    assert len(ids) == len(set(ids)), "Duplicate domain review across batches"
    for row in rows:
        assert row["parent_scope_disposition"].strip()
        assert row["current_state"].strip()
        assert row["omissions_and_over_splitting"].strip()
        assert row["computational_signal"].strip()
        assert row["jurisdiction_note"].strip()
        assert row["review_status"].strip()
        if row["candidate_areas"]:
            assert row["sources"], row["domain_id"]
        else:
            assert row["no_specialization_disposition"], row["domain_id"]
        for source in row["sources"]:
            assert source["url"].startswith("https://")
            assert source["locator"] and source["supports"] and source["limitation"]


def test_written_individual_artifacts_match_batch_rows():
    for batch_path in HERE.glob("D*_D*_reviews_checkpoint_*.json"):
        batch = json.loads(batch_path.read_text(encoding="utf-8"))
        for row in batch["domains"]:
            domain_id = row["domain_id"]
            assert (HERE / f"{domain_id}_specialization_candidate_review_2026_10_05.json").exists()
            md = (HERE / f"{domain_id}_specialization_candidate_review_2026_10_05.md").read_text(encoding="utf-8")
            assert f"# {domain_id}:" in md
            assert "not canonical taxonomy approval" in md


def test_exact_range_coverage_is_checked_not_assumed():
    rows = []
    for path in HERE.glob("D*_D*_reviews_checkpoint_*.json"):
        rows.extend(json.loads(path.read_text(encoding="utf-8"))["domains"])
    ids = {row["domain_id"] for row in rows}
    expected = {f"D{i:03d}" for i in range(FIRST, LAST + 1)}
    # During incremental work, coverage is a subset; the final flag is asserted
    # in the final checkpoint/test after the 56-domain lane is complete.
    assert ids <= expected
    checkpoint_files = list(HERE.glob("d113_d168_checkpoint_*.json"))
    if checkpoint_files and json.loads(checkpoint_files[-1].read_text(encoding="utf-8")).get("complete"):
        assert ids == expected
