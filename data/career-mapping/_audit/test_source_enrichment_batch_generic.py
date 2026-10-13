import json
import re
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BATCH = ROOT / "source_enrichment_batch_generic_2026-09-19.json"


def test_generic_batch_has_three_distinct_reviewed_candidates_and_fails_closed():
    payload = json.loads(BATCH.read_text(encoding="utf-8"))
    records = payload["records"]

    assert len(records) == 3
    assert payload["accessed_on"] == "2026-09-19"
    assert date.fromisoformat(payload["accessed_on"]) == date(2026, 9, 19)
    assert len({r["candidate"]["programme"] for r in records}) == 3
    assert len({r["candidate"]["domain_id"] for r in records}) == 3
    assert all(r["candidate"]["programme"] != "Sociology" for r in records)

    for record in records:
        candidate = record["candidate"]
        assert candidate["prior_state"] == "review_required"
        assert candidate["source_audit_locator"]
        assert record["decision"] in {"verified", "review_required", "no_link"}
        assert record["confidence"] in {"high", "medium", "low"}
        assert record["evidence_summary"]
        assert record["promotion"]
        assert record["sources"]
        for source in record["sources"]:
            assert re.fullmatch(r"https://[^\s]+", source["url"])
            assert source["access_date"] == "2026-09-19"
            assert source["evidence_locator"]

    law = next(
        r for r in records if r["candidate"]["programme"] == "Common and Islamic Law"
    )
    assert law["decision"] == "review_required"
    assert law["promotion"] == "not_promoted"
    assert "exact combined-programme curriculum" in law["limitation"]

    verified = [r for r in records if r["decision"] == "verified"]
    assert len(verified) == 2
    assert all(r["promotion"] == "verified_edge_candidate_only" for r in verified)
