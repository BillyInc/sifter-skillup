import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "D069_D075_boundary_update_2026_10_06.json").read_text(encoding="utf-8"))


def test_exact_scope_counts_and_noncanonical_boundary():
    assert [r["domain_id"] for r in DATA["records"]] == [f"D{i:03}" for i in range(69, 76)]
    assert {r["domain_id"] for r in DATA["records"] if r["new_evidence_added"]} == {"D070", "D071", "D075"}
    assert all(r["canonical_write"] is False for r in DATA["records"])
    assert all(r["role_assignments"] == "none" for r in DATA["records"])


def test_counts_remain_candidate_syntheses_and_questions_are_open():
    assert {r["domain_id"]: r["candidate_area_count"] for r in DATA["records"]} == {
        "D069": 7, "D070": 6, "D071": 4, "D072": 5, "D073": 4, "D074": 4, "D075": 4
    }
    assert all(r["open_questions"] for r in DATA["records"])


def test_sources_have_specific_locators_and_limits():
    for row in DATA["records"]:
        for src in row.get("evidence", []):
            assert src["url"].startswith("https://")
            assert src["locator"] and src["supports"] and src["limit"]


def test_overlaps_are_recorded_not_mapped():
    d070 = next(r for r in DATA["records"] if r["domain_id"] == "D070")
    d075 = next(r for r in DATA["records"] if r["domain_id"] == "D075")
    assert any("audiovisual" in q.lower() for q in d070["open_questions"])
    assert any("D106" in q and "D111" in q for q in d075["open_questions"])
