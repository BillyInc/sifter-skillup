import json
from pathlib import Path


def test_scope_sync_report_has_source_guard():
    path = Path(__file__).resolve().parent / "jamb_scope_verified_ccmas_detail_sync_2026-09-29_applied.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["counts"]["verified_course_keys"] > 0
    assert all(item["guard"] for item in data["changes"])
    assert all(item["official_source_url"] for item in data["changes"])
