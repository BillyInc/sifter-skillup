import json
from pathlib import Path


def test_guarded_repair_report_has_preimage_ledger():
    path = Path(__file__).resolve().parent / "ccmas_course_detail_guarded_repairs_2026-09-29_applied.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    queue = json.loads((path.parent / "jamb_ccmas_targeted_repair_queue_2026-09-29.json").read_text(encoding="utf-8"))
    assert data["counts"]["records_seen"] >= queue["counts"]["distinct_course_records"]
    assert all(item["guard"] for item in data["changes"])
    assert all(item["evidence"]["official_source_url"] for item in data["changes"])
