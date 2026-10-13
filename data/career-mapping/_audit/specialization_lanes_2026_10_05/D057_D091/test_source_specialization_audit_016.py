import json
from pathlib import Path


HERE = Path(__file__).parent
AUDIT = json.loads((HERE / "source_specialization_audit_016.json").read_text(encoding="utf-8"))


def test_followup_covers_exact_assigned_domain_range_and_prior_unexamined_count():
    expected = [f"D{i:03d}" for i in range(57, 92)]
    assert AUDIT["assigned_domain_ids"] == expected
    assert AUDIT["prior_checkpoint_015_status"]["source_count_reviewed"] == 35
    assert AUDIT["prior_checkpoint_015_status"]["unexamined"] == 0
    assert AUDIT["remaining_lane_work"]["unexamined_assigned_domains"] == 0


def test_all_seven_flagged_findings_have_distinct_source_backed_dispositions():
    findings = AUDIT["followup_findings"]
    assert len(findings) == 7
    assert {item["domain_id"] for item in findings} == {
        "D064", "D067", "D075", "D076", "D077", "D080", "D091"
    }
    sources = {item["source_id"]: item for item in AUDIT["sources"]}
    for finding in findings:
        assert finding["status"]
        assert finding["finding"]
        assert finding["source_ids"]
        assert set(finding["source_ids"]) <= sources.keys()


def test_sources_have_locators_and_do_not_overclaim_credential_or_count_authority():
    for source in AUDIT["sources"]:
        assert source["url"].startswith("http")
        assert source["locator"]
        assert source["supports"]
        assert source["does_not_support"]
    d067 = next(row for row in AUDIT["followup_findings"] if row["domain_id"] == "D067")
    assert "ADA" in d067["finding"]
    assert "twelve" in d067["finding"]
    assert any("Dental Anesthesiology" in item for item in d067["crosswalk_gaps"])
    d077 = next(row for row in AUDIT["followup_findings"] if row["domain_id"] == "D077")
    assert d077["status"] == "candidate_not_supported_under_security_parent"


def test_no_shared_register_or_canonical_or_role_specialization_writes_claimed():
    assert AUDIT["remaining_lane_work"]["shared_register_reconciliation_pending"] == 16
    assert AUDIT["remaining_lane_work"]["canonical_edits_authorized"] is False
    assert AUDIT["remaining_lane_work"]["role_to_specialization_assignment"] == "deferred"


def test_register_preflight_corrects_stale_pending_count_without_writes():
    preflight = json.loads((HERE / "shared_register_preflight_017.json").read_text(encoding="utf-8"))
    assert preflight["range_count"] == 18
    assert preflight["already_present_and_exactly_matching_lane_projection"] == ["D070", "D071"]
    assert preflight["absent_count"] == 16
    assert preflight["additive_dry_run_ready_count"] == 15
    assert preflight["source_record_collision"]["domain_id"] == "D077"
    assert preflight["writes_performed"] is False
    assert preflight["canonical_taxonomy_edits"] is False


def test_register_preflight_absent_and_ready_sets_are_disjoint_and_complete():
    preflight = json.loads((HERE / "shared_register_preflight_017.json").read_text(encoding="utf-8"))
    absent = set(preflight["actually_absent"])
    ready = set(preflight["additive_dry_run_ready"])
    assert len(absent) == preflight["absent_count"] == 16
    assert len(ready) == preflight["additive_dry_run_ready_count"] == 15
    assert ready < absent
    assert absent - ready == {"D077"}
