import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
IDS=[f"D{i:03d}" for i in range(155,161)]

def test_checkpoint_cursor_and_guards():
    cp=json.loads((HERE/"d113_d168_checkpoint_008.json").read_text(encoding="utf-8"))
    assert cp["completed_count"]==48 and cp["completed_ids"][-6:]==IDS
    assert cp["next_cursor"]=="D161" and cp["remaining_count"]==8
    assert cp["canonical_taxonomy_files_touched"] is False
    assert cp["roles_mapped_to_specializations"] is False

def test_reviews_are_complete_and_per_domain():
    batch=json.loads((HERE/"D155_D160_reviews_checkpoint_008.json").read_text(encoding="utf-8"))
    assert [r["domain_id"] for r in batch["domains"]]==IDS
    for r in batch["domains"]:
        assert r["current_state"] and r["parent_scope_disposition"] and r["decision"]
        assert r["candidate_areas"] and r["computational_signal"] and r["jurisdiction_note"]
        assert r["sources"] and r["review_status"]
        for src in r["sources"]:
            assert src["url"].startswith("https://") and src["locator"] and src["supports"] and src["limitation"]
        assert (HERE/f"{r['domain_id']}_specialization_candidate_review_2026_10_05.json").exists()
        assert "not canonical taxonomy approval" in (HERE/f"{r['domain_id']}_specialization_candidate_review_2026_10_05.md").read_text(encoding="utf-8")

