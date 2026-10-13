import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
IDS = [f"D{i:03d}" for i in range(137, 143)]


def test_checkpoint_progress_is_contiguous_and_next_cursor_is_correct():
    cp = json.loads((HERE / "d113_d168_checkpoint_005.json").read_text(encoding="utf-8"))
    assert cp["completed_count"] == 30
    assert cp["completed_ids"][-6:] == IDS
    assert cp["remaining_ids"][0] == "D143"
    assert cp["remaining_count"] == 26
    assert cp["canonical_taxonomy_files_touched"] is False
    assert cp["roles_mapped_to_specializations"] is False


def test_six_review_artifacts_are_evidence_complete_and_separate_candidates():
    batch = json.loads((HERE / "D137_D142_reviews_checkpoint_005.json").read_text(encoding="utf-8"))
    assert [row["domain_id"] for row in batch["domains"]] == IDS
    for row in batch["domains"]:
        assert row["current_state"] and row["parent_scope_disposition"]
        assert row["decision"] and row["omissions_and_over_splitting"]
        assert row["computational_signal"] and row["jurisdiction_note"]
        assert row["review_status"] and row["sources"] and row["candidate_areas"]
        assert (HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.json").exists()
        md = (HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.md").read_text(encoding="utf-8")
        assert "not canonical taxonomy approval" in md
        for source in row["sources"]:
            assert source["url"].startswith("https://")
            assert source["locator"] and source["supports"] and source["limitation"]

