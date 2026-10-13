import json
from pathlib import Path


def test_detail_candidate_extraction_covers_queue():
    path = Path(__file__).resolve().parent / "jamb_ccmas_course_detail_candidates_2026-09-29.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    queue = json.loads((path.parent / "jamb_ccmas_targeted_repair_queue_2026-09-29.json").read_text(encoding="utf-8"))
    expected = queue["counts"]["distinct_course_records"]
    assert data["counts"]["unique_course_records"] >= expected
    extracted = {(row["source_key"], row["course_code"]) for row in data["course_record_queue"]}
    locator_queue = json.loads(
        (path.parent / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.json").read_text(encoding="utf-8")
    )
    locator_keys = {(row["source_key"], row["course_code"]) for row in locator_queue["course_record_queue"]}
    assert locator_keys <= extracted
    assert sum(value for key, value in data["counts"].items() if key.startswith("state:")) == data["counts"]["unique_course_records"]
    assert all("automated_detail_candidates" in item for item in data["course_record_queue"])
