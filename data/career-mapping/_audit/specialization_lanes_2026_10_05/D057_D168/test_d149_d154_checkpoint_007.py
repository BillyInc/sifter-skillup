import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
IDS=[f"D{i:03d}" for i in range(149,155)]

def test_checkpoint_cursor_and_protected_scope():
    cp=json.loads((HERE/"d113_d168_checkpoint_007.json").read_text(encoding="utf-8"))
    assert cp["completed_count"]==42 and cp["completed_ids"][-6:]==IDS
    assert cp["next_cursor"]=="D155" and cp["remaining_count"]==14
    assert cp["canonical_taxonomy_files_touched"] is False
    assert cp["roles_mapped_to_specializations"] is False

def test_domain_reviews_include_sources_and_student_scope_disposition():
    batch=json.loads((HERE/"D149_D154_reviews_checkpoint_007.json").read_text(encoding="utf-8"))
    assert [r["domain_id"] for r in batch["domains"]]==IDS
    for r in batch["domains"]:
        assert r["current_subgroup_count"]>=0 and r["current_state"]
        assert r["parent_scope_disposition"] and r["decision"]
        assert r["candidate_areas"] and r["computational_signal"] and r["jurisdiction_note"]
        assert r["review_status"] and r["sources"]
        for src in r["sources"]:
            assert src["url"].startswith("https://")
            assert src["locator"] and src["supports"] and src["limitation"]
        assert (HERE/f"{r['domain_id']}_specialization_candidate_review_2026_10_05.json").exists()
        assert "not canonical taxonomy approval" in (HERE/f"{r['domain_id']}_specialization_candidate_review_2026_10_05.md").read_text(encoding="utf-8")

