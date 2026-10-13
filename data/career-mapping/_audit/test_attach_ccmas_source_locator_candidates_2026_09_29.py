import json
from pathlib import Path


def test_locator_enrichment_covers_every_unique_repair_unit():
    path = Path(__file__).resolve().parent / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    queue = json.loads((path.parent / "jamb_ccmas_targeted_repair_queue_2026-09-29.json").read_text(encoding="utf-8"))
    expected = queue["counts"]["distinct_course_records"]
    assert data["counts"]["unique_course_records"] == expected
    assert sum(value for key, value in data["counts"].items() if key.startswith("locator:")) == expected
    assert all(item["automated_source_locator"]["state"] for item in data["course_record_queue"])
