import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "D099_D112_source_gap_supplement_002.json").read_text(encoding="utf-8"))
EXPECTED_GAPS = {"D101", "D104", "D105", "D107", "D109", "D110", "D111", "D112"}


def test_source_gap_queue_is_exact_and_fully_researched():
    rows = DATA["domains"]
    assert {row["domain_id"] for row in rows} == EXPECTED_GAPS
    assert len(rows) == 8
    assert DATA["summary"]["previously_open_source_gap_domains"] == 8
    assert DATA["summary"]["source_gap_domains_now_researched"] == 8
    assert DATA["summary"]["source_gap_domains_with_added_primary_or_authoritative_sources"] == 8


def test_each_disposition_has_traceable_evidence_and_limits():
    for row in DATA["domains"]:
        assert row["disposition"]
        assert row["proposed_areas"]
        assert row["evidence"]
        for source in row["evidence"]:
            assert source["source_id"]
            assert source["publisher"]
            assert source["url"].startswith("https://")
            assert source["locator"]
            assert source["supports"]
            assert source["limit"]
        assert row["remaining_uncertainty"]


def test_review_does_not_write_canonical_taxonomy_or_role_links():
    assert DATA["scope"]["canonical_taxonomy_written"] is False
    assert DATA["scope"]["role_links_written_or_inferred"] is False
    assert DATA["summary"]["canonical_changes"] == 0
    assert DATA["summary"]["role_assignments"] == 0
