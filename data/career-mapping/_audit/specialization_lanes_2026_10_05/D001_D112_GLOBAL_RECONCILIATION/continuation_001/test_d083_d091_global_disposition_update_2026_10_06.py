import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "D083_D091_global_disposition_update_2026_10_06.json").read_text(encoding="utf-8"))


def test_update_is_global_only_and_noncanonical():
    assert "No canonical taxonomy edits" in DATA["scope"]
    assert all(row["canonical_write"] is False for row in DATA["records"])
    assert all(row.get("role_assignments", "none").startswith("none") for row in DATA["records"])


def test_exact_residual_ids_and_recommendation_counts():
    rows = {row["domain_id"]: row for row in DATA["records"]}
    assert set(rows) == {"D083", "D084", "D088", "D090", "D091"}
    assert rows["D083"]["recommended_internal_candidate_count"] == 3
    assert rows["D084"]["recommended_internal_candidate_count"] == 2
    assert rows["D088"]["prior_candidate_count"] == 6
    assert rows["D090"]["recommended_internal_candidate_count_for_companion_animal_scope"] == 3
    assert rows["D091"]["recommended_internal_candidate_count"] == 4


def test_each_recommendation_has_source_limits_and_local_boundary():
    for row in DATA["records"]:
        assert row.get("sources")
        assert row.get("open_local_reconciliation")
        for source in row["sources"]:
            assert source["publisher"]
            assert source["url"].startswith("https://")
            assert source["locator"]
            assert source["supports"]
            assert source["does_not_support"]


def test_previous_shared_register_only_reviews_are_not_repeated():
    assert DATA["unchanged_reviewed_ids"] == ["D085", "D086", "D087", "D089"]
