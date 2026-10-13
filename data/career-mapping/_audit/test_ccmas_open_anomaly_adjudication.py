import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "_audit" / "ccmas_open_anomaly_adjudication_2026-09-26_002.json"


def test_ledger_scope_and_source_guard():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    assert data["scope"] == {
        "source_files": 17,
        "programme_packages": 237,
        "course_records": 9854,
        "source_json_edited": False,
        "downstream_audited": False,
    }
    assert "downstream" in data["scope_guard"]
    assert all("source" in row and "repair_instruction" in row for row in data["adjudications"])


def test_open_ledger_contains_all_deferred_page_header_codes():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    page_codes = {
        row["code"] for row in data["adjudications"] if row["class"].startswith("page_header")
    }
    assert page_codes == {"DTH 527", "OCT 525", "OPT 203", "OPT 698", "POT 317", "CHM 107"}


def test_open_ledger_preserves_combined_and_shared_contexts():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    faa = next(row for row in data["adjudications"] if row["code"] == "FAA 451")
    lis = next(row for row in data["adjudications"] if row["code"] == "LIS 215")
    assert "combined" in faa["status"]
    assert len(lis["source"]["urls"]) == 2
    assert data["additional_related_records_to_review_with_same_repairs"][0]["codes"] == ["LIS 216", "LIS 222"]


def test_ledger_retains_unadjudicated_queue_counts():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    queues = data["still_open_unadjudicated_queues"]
    assert queues["empty_content_unique_keys"] == 1088
    assert queues["title_truncation_candidates"] == 164
    assert queues["duplicate_course_code_groups"] == 50
    assert queues["source_review_required"] is True
