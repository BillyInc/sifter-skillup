import json
from pathlib import Path


def test_source_batch_plan_preserves_deterministic_reduction():
    path = Path(__file__).resolve().parent / "ccmas_source_batch_reconciliation_plan_2026-09-29.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["status"] == "deterministic_batch_plan_ready"
    assert data["counts"]["source_documents"] == 15
    assert data["counts"]["affected_packages"] == 117
    assert data["counts"]["unique_course_records"] == 2442
    assert data["counts"]["affected_jamb_occurrences"] == 5449
    assert data["counts"]["candidate_reusable_records"] >= 0
    assert sum(item["unique_course_records"] for item in data["source_batches"]) == 2442
    assert sum(item["affected_jamb_occurrences"] for item in data["source_batches"]) == 5449
    assert all(item["verification_rule"] for item in data["source_batches"])
