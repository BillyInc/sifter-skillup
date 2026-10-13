"""Consolidate the completed 006-011 conditional role-domain pass."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
FIRST = HERE / "conditional_batch_006_010_decisions.json"
LAST = HERE / "conditional_batch_011_011_decisions.json"
RESULT = HERE / "conditional_batches_006_011_decisions.json"
CHECKPOINT = HERE / "conditional_batches_006_011_final_checkpoint.json"
CHECKPOINT_MD = HERE / "conditional_batches_006_011_final_checkpoint.md"

first = json.loads(FIRST.read_text(encoding="utf-8-sig"))
last = json.loads(LAST.read_text(encoding="utf-8-sig"))
decisions = [*first["decisions"], *last["decisions"]]
role_keys = [row["role_key"] for row in decisions]
if len(role_keys) != len(set(role_keys)):
    raise ValueError("Duplicate role key across completed 006-011 results")
counts = dict(Counter(row["disposition"] for row in decisions))

payload = {
    "schema_version": "2026-10-07.role-review-agent-conditional-batches.v2",
    "lane": "role_domain_conditional",
    "completed_batches": [6, 7, 8, 9, 10, 11],
    "completed_batch_files": [
        "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-006.json",
        "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-007.json",
        "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-008.json",
        "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-009.json",
        "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-010.json",
        "data/career-mapping/_audit/GROUPED_ROLE_REVIEW_QUEUES_2026_10_07/role_domain_conditional/batch-011.json",
    ],
    "completed_groups": len(decisions),
    "completed_unique_role_keys": len(role_keys),
    "counts": counts,
    "decisions": decisions,
    "exact_next_batch": None,
    "exact_next_batch_reason": "batch-011 is the final batch in the role_domain_conditional lane",
    "status": "completed_assigned_conditional_lane",
    "canonical_role_files_changed": [],
    "area_files_changed": [],
    "area_source_reconciler_changed": False,
    "isco_or_subgroup_fit_inference": False,
}
RESULT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
CHECKPOINT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
CHECKPOINT_MD.write_text(
    "\n".join([
        "# Conditional role-domain final checkpoint: batches 006-011",
        "",
        "Status: **completed for the assigned continuation slice**.",
        "",
        f"- Completed batches: **006, 007, 008, 009, 010, 011**.",
        f"- Unique role keys: **{len(role_keys)}**.",
        f"- Supported: **{counts.get('supported', 0)}**.",
        f"- Unsupported exact parent-domain links: **{counts.get('unsupported', 0)}**.",
        f"- Retained `review_required`: **{counts.get('review_required', 0)}**.",
        "- Exact next conditional batch: **none**; batch 011 is the final batch in this lane.",
        "- Canonical role files changed: **none**.",
        "- Area definitions and area-source reconciler changed: **none**.",
        "- Fit was assessed from role task evidence against parent-domain scope; ISCO/ESCO or subgroup membership was not used as fit proof.",
        "",
        f"Machine-readable result and checkpoint: `{RESULT.name}` and `{CHECKPOINT.name}`.",
    ]) + "\n",
    encoding="utf-8",
)
print(json.dumps({
    "completed_batches": payload["completed_batches"],
    "completed_groups": payload["completed_groups"],
    "counts": payload["counts"],
    "exact_next_batch": payload["exact_next_batch"],
    "result": str(RESULT),
    "checkpoint": str(CHECKPOINT),
}, indent=2))
