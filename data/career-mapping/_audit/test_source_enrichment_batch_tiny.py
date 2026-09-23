import json
import re
from datetime import date
from pathlib import Path


HERE = Path(__file__).parent
EVIDENCE_PATH = HERE / "source_enrichment_batch_tiny_2026-09-19.json"


def test_tiny_web_source_batch_has_two_verified_records():
    payload = json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))
    records = payload["records"]

    assert payload["batch_id"] == "source_enrichment_batch_tiny_2026-09-19"
    assert payload["access_date"] == "2026-09-19"
    assert len(records) == 2
    assert {record["programme"] for record in records} == {"Psychology", "Political Science"}

    urls = set()
    for record in records:
        assert record["item_type"] == "programme_learning_resource"
        assert record["context_level"] == "programme"
        assert record["source_authority"] == "University of Ibadan" or record["source_authority"].startswith(
            "University of Ibadan,"
        )
        assert re.fullmatch(r'https://[^"\s]+', record["source_url"])
        assert record["source_url"].startswith("https://")
        assert any(host in record["source_url"] for host in ("https://ui.edu.ng/", ".ui.edu.ng/"))
        assert record["access_date"] == str(date(2026, 9, 19))
        assert record["source_url"] not in urls
        urls.add(record["source_url"])
        for field in ("candidate_name", "source_title", "locator", "evidence", "scope"):
            assert record[field].strip()
        assert record["decision"] == "verified_resource"
        assert record["confidence"] == "high"
