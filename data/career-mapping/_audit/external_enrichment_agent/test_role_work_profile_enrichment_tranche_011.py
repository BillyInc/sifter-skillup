import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ARTIFACT = HERE / "role_work_profile_enrichment_tranche_011_2026-09-23.json"
SELECTION = HERE / "role_work_profile_enrichment_tranche_011_2026-09-23_selection.json"
PRE_CHECKPOINT = HERE / "role_work_profile_enrichment_tranche_011_pre_search_checkpoint_2026-09-23.json"
LEDGER = HERE / "role_work_profile_enrichment_append_only_tranche_011_2026-09-23.jsonl"
CHECKPOINT = HERE / "role_work_profile_enrichment_tranche_011_checkpoint_2026-09-23.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_selection_was_checkpointed_before_profile_extraction():
    selection = load(SELECTION)
    checkpoint = load(PRE_CHECKPOINT)
    assert selection["status"] == "selected"
    assert checkpoint["status"] == "pre_search_checkpoint"
    assert checkpoint["counts"]["profile_rows_searched"] == 0
    assert checkpoint["selection"].endswith(SELECTION.name)


def test_tranche_contains_only_complete_exact_onet_candidates():
    payload = load(ARTIFACT)
    counts = payload["counts"]
    records = payload["records"]
    assert payload["read_only"] is True
    assert payload["append_only"] is True
    assert "item enrichment" in payload["scope"]
    assert "relationship enrichment" in payload["scope"]
    assert counts["candidate_rows_with_work_profile_fields"] == len(records)
    assert counts["exact_onet_job_title_identity_matches"] == counts["roles_selected"]
    assert counts["canonical_work_profile_rows_added"] == 0
    assert counts["canonical_work_profile_rows_still_absent"] == 119
    for record in records:
        assert record["review_state"] == "review_required"
        assert record["canonical_work_profile_row_status"] == "absent_audit_only"
        assert record["resolution"] == "exact_onet_job_title_profile_candidate"
        assert record["identity"]["exact_job_titles_identity_match"] is True
        assert record["work_profile_fields"]["activities"]
        assert record["work_profile_fields"]["work_activities"]
        assert record["work_profile_fields"]["job_zones"]
        assert len(record["source_links"]) == 4
        assert all(link["url"].startswith("https://") and link["locator"] and link["accessed_on"] for link in record["source_links"])


def test_append_only_ledger_and_checkpoint_match_report():
    payload = load(ARTIFACT)
    ledger = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]
    checkpoint = load(CHECKPOINT)
    assert len(ledger) == len(payload["records"])
    assert {row["role_key"] for row in ledger} == {row["role_key"] for row in payload["records"]}
    assert all(row["canonical_work_profile_row_status"] == "absent_audit_only" for row in ledger)
    assert checkpoint["status"] == "complete"
    assert checkpoint["counts"] == payload["counts"]


def test_no_promotion_or_unrelated_lane_claims():
    text = ARTIFACT.read_text(encoding="utf-8").casefold()
    assert "nigerian demand" in text
    assert "canonical_work_profile_row_status" in text
    assert "generated_profile_row" not in text
    assert "item enrichment" in text
    assert "relationship enrichment" in text
