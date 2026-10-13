import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "D057_D058_D060_cross_region_update_2026_10_06.json").read_text(encoding="utf-8"))


def test_only_requested_global_domains_and_no_canonical_writes():
    assert [r["domain_id"] for r in DATA["records"]] == ["D057", "D058", "D060"]
    assert all(r["canonical_write"] is False for r in DATA["records"])
    assert all(r["role_assignments"] == "none" for r in DATA["records"])
    assert "No Nigeria-specific" in DATA["scope"]


def test_source_records_are_auditable_and_have_limits():
    for record in DATA["records"]:
        assert record["cross_region_sources_screened"] == len(record["evidence"])
        assert record["candidate_area_count"] >= 0
        assert record["open_questions"]
        for source in record["evidence"]:
            assert source["url"].startswith("https://")
            assert source["locator"] and source["supports"] and source["limit"]


def test_d057_parent_scope_is_not_hidden_by_candidate_facets():
    row = next(r for r in DATA["records"] if r["domain_id"] == "D057")
    assert row["candidate_area_count"] == 0
    assert "compound parent" in row["count_status"]
    assert any("parent" in q.lower() for q in row["open_questions"])


def test_d058_and_d060_are_explicitly_internal_candidates_not_global_standards():
    assert next(r for r in DATA["records"] if r["domain_id"] == "D058")["candidate_area_count"] == 2
    assert next(r for r in DATA["records"] if r["domain_id"] == "D060")["candidate_area_count"] == 3
    for row in (r for r in DATA["records"] if r["domain_id"] in {"D058", "D060"}):
        assert any(term in row["count_status"].lower() for term in ("internal candidate synthesis", "not a universal", "not prescribe", "not globally prescribed", "not a mandated", "no source prescribes"))


def test_metadata_discrepancy_is_preserved_as_a_reported_issue():
    assert "zero sources" in DATA["artifact_quality_issue"]["finding"]
    assert "metadata/reporting inconsistency" in DATA["artifact_quality_issue"]["impact"]
