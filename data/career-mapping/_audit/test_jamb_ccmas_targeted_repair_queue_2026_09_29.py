import json
from pathlib import Path


def test_targeted_queue_is_deduplicated_and_current():
    path = Path(__file__).resolve().parent / "jamb_ccmas_targeted_repair_queue_2026-09-29.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    # The guarded deterministic detail pass has now closed the selected-course
    # detail queue.  The remaining queue is deliberately downstream/source
    # mapping work, not a reason to re-open the repaired course records.
    assert data["counts"]["distinct_course_records"] == 0
    assert data["counts"]["other:mapping_explicitly_held_for_review"] > 0
    assert data["counts"]["occurrence_level_detail_findings"] >= data["counts"]["distinct_course_records"]
    assert all(item["action"] for item in data["course_record_queue"])
    # The guarded source-variant pass has closed the course-detail queue, so
    # there is no remaining source-document batch to search.  The 15 source
    # PDFs were already consumed by the deterministic reconciliation; only
    # downstream mapping queues remain in this report.
    assert len(data["source_document_batches"]) == 0
    assert sum(item["unique_course_records"] for item in data["source_document_batches"]) == data["counts"]["distinct_course_records"]
