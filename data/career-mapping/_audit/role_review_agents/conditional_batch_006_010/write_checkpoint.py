"""Write the resumable machine-readable checkpoint for completed batches 006-010."""

from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
RESULT = HERE / "conditional_batch_006_010_decisions.json"
CHECKPOINT = HERE / "conditional_batch_006_010_checkpoint.json"

payload = json.loads(RESULT.read_text(encoding="utf-8-sig"))
checkpoint = {
    "schema_version": "2026-10-07.role-review-agent-checkpoint.v1",
    "lane": "role_domain_conditional",
    "completed_batches": [6, 7, 8, 9, 10],
    "completed_batch_files": payload["assignment"]["batch_files"],
    "completed_groups": payload["assignment"]["groups"],
    "completed_unique_role_keys": payload["assignment"]["unique_role_keys"],
    "counts": payload["counts"],
    "decisions": payload["decisions"],
    "exact_next_batch": 11,
    "exact_next_batch_file": "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-011.json",
    "status": "resumable_checkpoint",
    "processing_paused_by_user": False,
    "canonical_role_files_changed": [],
    "area_files_changed": [],
    "area_source_reconciler_changed": False,
    "result_file": RESULT.name,
}
CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "completed_batches": checkpoint["completed_batches"],
    "completed_groups": checkpoint["completed_groups"],
    "counts": checkpoint["counts"],
    "exact_next_batch": checkpoint["exact_next_batch"],
    "checkpoint": str(CHECKPOINT),
}, indent=2))
