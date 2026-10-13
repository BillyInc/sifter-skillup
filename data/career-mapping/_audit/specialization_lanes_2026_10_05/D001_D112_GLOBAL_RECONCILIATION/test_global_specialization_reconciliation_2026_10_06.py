import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
SUMMARY = json.loads((HERE / "global_specialization_reconciliation_2026_10_06.json").read_text(encoding="utf-8"))
PROVISIONAL = {"D057", "D058", "D060", "D062", "D063", "D064", "D065", "D066"}
EXPECTED = {"D001", "D002", *PROVISIONAL, "D092", *{f"D{i:03d}" for i in range(93, 113)}}


def load_domain(domain_id):
    return json.loads((HERE / f"{domain_id}_global_specialization_reconciliation.json").read_text(encoding="utf-8"))


def test_exact_global_reconciliation_inventory_and_noncanonical_boundary():
    counts = SUMMARY["counts"]
    assert set(SUMMARY["domain_ids"]) == EXPECTED
    assert counts["expected_domain_ids"] == counts["examined_domain_ids"] == 31
    assert counts["missing_domain_ids"] == []
    assert counts["per_domain_artifacts_written"] == 31
    assert counts["canonical_files_changed"] == 0
    assert counts["role_assignments_made"] == 0
    assert counts["nigeria_specific_research_performed"] is False
    assert counts["domains_with_nigeria_specific_material"] == []
    assert counts["domains_with_missing_candidate_evidence"] == []


def test_eight_carried_forward_provisional_reviews_are_exact_and_source_backed():
    for domain_id in PROVISIONAL:
        record = load_domain(domain_id)
        assert record["review_scope"].startswith("GLOBAL only")
        assert record["canonical_write"] is False
        assert record["role_assignments"] == "none; role-to-domain fit and role-to-specialization assignment are outside this lane"
        assert record["recommendation"]["review_status"]
        assert record["evidence_reconciliation"]["unique_source_urls"] > 0
        assert record["recommendation"]["parent_scope_disposition"]


def test_d098_conflict_is_verified_not_silently_overwritten():
    record = load_domain("D098")
    recommendation = record["recommendation"]
    assert recommendation["conflict_reconciliation"]["shared_register_candidate_count"] == 3
    assert recommendation["conflict_reconciliation"]["adjudicated_candidate_count"] == 4
    labels = {x["label"] for x in recommendation["candidate_areas"]}
    assert labels == {
        "Precision Machining and Toolmaking",
        "Precision Instruments and Optical Devices",
        "Dimensional Metrology and Measurement Systems",
        "Horology (Clock and Watchmaking)",
    }
    assert record["canonical_write"] is False


def test_each_target_domain_has_a_named_markdown_and_json_record():
    for domain_id in EXPECTED:
        record = load_domain(domain_id)
        assert record["domain_name"]
        assert (HERE / f"{domain_id}_global_specialization_reconciliation.md").is_file()
        assert record["evidence_reconciliation"]["unique_source_urls"] > 0
