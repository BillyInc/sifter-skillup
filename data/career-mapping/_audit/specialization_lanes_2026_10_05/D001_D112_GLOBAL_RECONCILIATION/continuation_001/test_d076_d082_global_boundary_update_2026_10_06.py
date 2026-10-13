import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "D076_D082_global_boundary_update_2026_10_06.json").read_text(encoding="utf-8"))


def test_exact_scope_and_noncanonical_boundary():
    assert [r["domain_id"] for r in DATA["records"]] == [f"D{i:03}" for i in range(76, 83)]
    assert [r["domain_id"] for r in DATA["records"] if r["new_evidence_added"]] == ["D078"]
    assert all(r["canonical_write"] is False for r in DATA["records"])
    assert all(r["role_assignments"] == "none" for r in DATA["records"])


def test_candidate_counts_and_parent_boundaries_are_explicit():
    assert {r["domain_id"]: r["candidate_area_count"] for r in DATA["records"]} == {
        "D076": 4, "D077": 4, "D078": 7, "D079": 3, "D080": 4, "D081": 4, "D082": 2
    }
    assert all(r["open_questions"] for r in DATA["records"])
    assert "parent" in next(r for r in DATA["records"] if r["domain_id"] == "D077")["disposition"].lower()


def test_d078_has_multiple_global_programme_sources_with_claim_limits():
    row = next(r for r in DATA["records"] if r["domain_id"] == "D078")
    assert len(row["evidence"]) == 3
    assert all(e["limit"] and e["locator"] for e in row["evidence"])
    assert "not a claim" in row["disposition"].lower()
