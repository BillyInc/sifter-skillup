import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ARTIFACT = HERE / "role_work_profile_enrichment_tranche_007_2026-09-23.json"
LEDGER = HERE / "role_work_profile_enrichment_append_only_2026-09-23.jsonl"
TRACE = HERE.parents[1] / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"


def test_candidate_artifact_has_exact_counts_and_is_audit_only():
    payload = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    counts = payload["counts"]
    assert payload["read_only"] is True
    assert payload["append_only"] is True
    assert counts["roles_selected"] == 20
    assert counts["exact_official_identity_matches"] == 20
    assert counts["source_backed_profile_candidates"] == 20
    assert counts["candidate_rows_with_work_profile_fields"] == 20
    assert counts["canonical_work_profile_rows_added"] == 0
    assert counts["esco_only_roles_retained_review_only"] == 99
    assert counts["remaining_canonical_work_profile_rows_absent"] == 119
    assert counts["genuinely_unavailable"] == 0


def test_candidates_are_exact_trace_roles_and_retain_source_locators():
    payload = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    expected = {
        f"{row['domain_id']}|{row['role_name']}": row
        for row in trace["roles"]
        if row.get("work_profile_status") == "not_available"
        and str(row.get("source") or "").casefold() == "onet"
    }
    assert set(expected) == {row["role_key"] for row in payload["records"]}
    for row in payload["records"]:
        assert row["review_state"] == "review_required"
        assert row["canonical_work_profile_row_status"] == "absent_audit_only"
        assert row["identity"]["exact_title_match"] is True
        fields = row["work_profile_fields"]
        assert fields["activities"]
        assert fields["work_activities"]
        assert fields["job_zones"]
        assert len(row["source_links"]) == 3
        for link in row["source_links"]:
            assert link["url"].startswith("https://")
            assert link["locator"]
            assert link["accessed_on"]


def test_append_only_jsonl_has_one_record_per_candidate():
    payload = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    lines = [line for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]
    records = [json.loads(line) for line in lines]
    assert len(records) == 20
    assert {record["role_key"] for record in records} == {
        record["role_key"] for record in payload["records"]
    }
    assert all(record["canonical_work_profile_row_status"] == "absent_audit_only" for record in records)
