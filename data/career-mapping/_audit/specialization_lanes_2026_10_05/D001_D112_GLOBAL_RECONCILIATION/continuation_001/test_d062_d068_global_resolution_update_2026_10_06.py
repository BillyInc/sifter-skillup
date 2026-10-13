import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "D062_D068_global_resolution_update_2026_10_06.json").read_text(encoding="utf-8"))


def test_exact_seven_id_scope_and_noncanonical_boundary():
    assert [r["domain_id"] for r in DATA["records"]] == [f"D{i:03}" for i in range(62, 69)]
    assert all(r["canonical_write"] is False for r in DATA["records"])
    assert all(r["role_assignments"] == "none" for r in DATA["records"])
    assert sum(r["new_evidence_added"] for r in DATA["records"]) == 4


def test_new_sources_have_locator_and_claim_limit():
    for row in DATA["records"]:
        for src in row.get("evidence", []):
            assert src["url"].startswith("https://")
            assert src["locator"] and src["supports"] and src["limit"]


def test_candidate_counts_and_unresolved_scope_are_explicit():
    counts = {r["domain_id"]: r["candidate_area_count"] for r in DATA["records"]}
    assert counts == {"D062": 2, "D063": 6, "D064": 8, "D065": 6, "D066": 8, "D067": 8, "D068": 0}
    assert all(r["open_questions"] for r in DATA["records"])
    assert "parent" in next(r for r in DATA["records"] if r["domain_id"] == "D068")["disposition"].lower()


def test_no_source_is_misrepresented_as_global_taxonomy_authority():
    d063 = next(r for r in DATA["records"] if r["domain_id"] == "D063")
    assert "set subgroup count" in d063["disposition"].lower()
    d066 = next(r for r in DATA["records"] if r["domain_id"] == "D066")
    assert "not mandate one curriculum" in d066["disposition"].lower()
