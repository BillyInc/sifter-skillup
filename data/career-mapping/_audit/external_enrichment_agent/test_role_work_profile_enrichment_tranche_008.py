import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ARTIFACT = HERE / "role_work_profile_enrichment_tranche_008_2026-09-23.json"
LEDGER = HERE / "role_work_profile_enrichment_append_only_tranche_008_2026-09-23.jsonl"


def test_tranche_008_is_audit_only_and_exact_crosswalk_only():
    payload = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    c = payload["counts"]
    assert payload["read_only"] is True
    assert payload["append_only"] is True
    assert c["esco_only_roles_in_scope"] == 99
    assert c["exact_crosswalk_profile_candidates"] == len(payload["records"])
    assert c["canonical_work_profile_rows_added"] == 0
    assert c["canonical_work_profile_rows_still_absent"] == 119
    assert c["genuinely_unavailable"] == 0


def test_every_candidate_retains_exact_crosswalk_and_profile_sources():
    payload = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    for row in payload["records"]:
        assert row["identity"]["crosswalk_match_type"] == "exactMatch"
        assert row["review_state"] == "review_required"
        assert row["canonical_work_profile_row_status"] == "absent_audit_only"
        assert row["work_profile_fields"]["activities"]
        assert row["work_profile_fields"]["work_activities"]
        assert row["work_profile_fields"]["job_zones"]
        assert len(row["source_links"]) == 4
        assert all(link["url"].startswith("https://") and link["locator"] and link["accessed_on"] for link in row["source_links"])


def test_append_only_ledger_matches_candidate_rows():
    payload = json.loads(ARTIFACT.read_text(encoding="utf-8"))
    rows = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert len(rows) == len(payload["records"])
    assert {row["role_key"] for row in rows} == {row["role_key"] for row in payload["records"]}
