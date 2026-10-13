import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
IDS = [f"D{i:03d}" for i in range(161, 167)]


def test_checkpoint_cursor_and_write_guards():
    cp = json.loads((HERE / "d113_d168_checkpoint_009.json").read_text(encoding="utf-8"))
    assert cp["completed_count"] == 54
    assert cp["completed_ids"][-6:] == IDS
    assert cp["remaining_ids"] == ["D167", "D168"]
    assert cp["next_cursor"] == "D167"
    assert cp["canonical_taxonomy_files_touched"] is False
    assert cp["roles_mapped_to_specializations"] is False
    assert cp["excluded_ids_skipped"] == []


def test_batch_sources_boundaries_and_individual_artifacts():
    batch = json.loads((HERE / "D161_D166_reviews_checkpoint_009.json").read_text(encoding="utf-8"))
    assert [row["domain_id"] for row in batch["domains"]] == IDS
    assert batch["canonical_changes"] == 0
    assert batch["role_specialization_assignments"] == 0
    for row in batch["domains"]:
        assert row["current_subgroup_count"] == len(row["current_subgroups"])
        assert row["parent_scope_disposition"] and row["decision"]
        assert row["candidate_areas"] and row["omissions_and_over_splitting"]
        assert row["computational_signal"] and row["jurisdiction_note"]
        assert row["sources"]
        for source in row["sources"]:
            assert source["url"].startswith("https://")
            assert source["locator"] and source["supports"] and source["limitation"]
        assert (HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.json").exists()
        md = (HERE / f"{row['domain_id']}_specialization_candidate_review_2026_10_05.md").read_text(encoding="utf-8")
        assert "not canonical taxonomy approval" in md


def test_sae_levels_are_not_misrepresented_as_learning_sequence():
    row = next(r for r in json.loads((HERE / "D161_D166_reviews_checkpoint_009.json").read_text(encoding="utf-8"))["domains"] if r["domain_id"] == "D166")
    assert "not a learning ladder" in row["parent_scope_disposition"]
    assert "not student progression" in row["decision"]
    assert "not an individual certification" in row["jurisdiction_note"]
