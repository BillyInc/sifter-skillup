import json
import re
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BATCH = ROOT / "source_enrichment_batch_2026-09-19.json"


def test_batch_is_exactly_three_source_linked_records_and_fail_closed():
    payload = json.loads(BATCH.read_text(encoding="utf-8"))
    records = payload["records"]

    assert len(records) == 3
    assert payload["accessed_on"] == "2026-09-19"
    assert {record["candidate"]["context_key"] for record in records} >= {
        "D078",
        "D001|Blockchain Engineers",
    }

    for record in records:
        assert record["decision"] in {"verified", "review_required", "no_link"}
        assert re.fullmatch(r"https://[^\s]+", record["url"])
        assert record["access_date"] == "2026-09-19"
        assert record["source_locator"]
        assert record["evidence_summary"]
        assert record["confidence"] in {"high", "medium", "low"}
        assert record["scope"]
        assert record["candidate"]["source_audit"]

    docker = next(
        record
        for record in records
        if record["candidate"]["item_name"] == "Docker"
    )
    assert docker["decision"] == "review_required"
    assert docker["promotion"] == "not_promoted"
    assert "does not establish" in docker["evidence_summary"]

    assert date.fromisoformat(payload["accessed_on"]) == date(2026, 9, 19)
