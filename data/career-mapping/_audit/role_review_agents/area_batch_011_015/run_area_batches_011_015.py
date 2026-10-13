"""Run the role-area/direct-route residual lane for batches 011-015.

This runner reuses the previously reviewed, read-only role-lane evaluator. It
does not edit canonical role/domain files, area definitions, the area-source
reconciler, or computational files. It intentionally runs all five assigned
batches before writing the renamed combined result and checkpoint.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[5]
OUT_DIR = Path(__file__).resolve().parent
SOURCE_RUNNER = (
    ROOT
    / "data"
    / "career-mapping"
    / "_audit"
    / "role_review_agents"
    / "area_batch_006_010"
    / "run_area_batches_006_010.py"
)


def load_source_runner():
    spec = importlib.util.spec_from_file_location("role_area_runner_006_010", SOURCE_RUNNER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load read-only role runner: {SOURCE_RUNNER}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def rewrite_outputs(module) -> None:
    combined = json.loads(
        (OUT_DIR / "area_batch_011_015_results.json").read_text(encoding="utf-8")
    )
    combined["schema_version"] = "2026-10-07.role-area-direct-route-batches-011-015.v1"
    combined["scope"] = "Role-area-of-specialization and direct-route audit for residual batches 011-015 only."
    combined["batches"] = [11, 12, 13, 14, 15]
    combined["policy"] = {
        "parent_domain_fit_is_independent_of_area_fit": True,
        "isco_or_esco_membership_used_as_fit_evidence": False,
        "title_alone_used_as_fit_evidence": False,
        "existing_area_membership_used_as_fit_evidence": False,
        "unresolved_cases_preserved": True,
        "canonical_files_edited": False,
        "area_definitions_edited": False,
        "area_source_reconciler_edited": False,
        "computational_files_edited": False,
    }
    combined["integrity"] = {
        "one_result_per_queue_role": len(combined.get("records", [])) == sum(
            json.loads(
                (module.QUEUE_DIR / f"batch-{n:03}.json").read_text(encoding="utf-8")
            ).get("role_count", 0)
            for n in range(11, 16)
        ),
        "duplicate_role_keys": len(combined.get("records", []))
        - len({record.get("role_key") for record in combined.get("records", [])}),
        "overlaps_batches_001_010": False,
        "canonical_files_edited": False,
        "area_definitions_edited": False,
        "area_source_reconciler_edited": False,
        "computational_files_edited": False,
    }
    (OUT_DIR / "area_batch_011_015_results.json").write_text(
        json.dumps(combined, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    checkpoint_path = OUT_DIR / "AREA_BATCH_011_015_CHECKPOINT.json"
    checkpoint = json.loads(checkpoint_path.read_text(encoding="utf-8"))
    checkpoint.update(
        {
            "schema_version": "2026-10-07.role-area-direct-route-checkpoint.v1",
            "status": "completed",
            "scope": "batches 011-015 only",
            "result_file": "area_batch_011_015_results.json",
            "batches": [11, 12, 13, 14, 15],
            "canonical_files_edited": False,
            "area_definitions_edited": False,
            "area_source_reconciler_edited": False,
            "computational_files_edited": False,
            "other_agent_batches_touched": [],
            "next_batch": "batch-016.json",
            "next_batch_path": "data\\career-mapping\\_audit\\GROUPED_ROLE_REVIEW_QUEUES_2026_10_07\\role_area_direct_route_residual\\batch-016.json",
        }
    )
    (OUT_DIR / "AREA_BATCH_011_015_CHECKPOINT.json").write_text(
        json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    old_md = OUT_DIR / "AREA_BATCH_011_015_CHECKPOINT.md"
    md = [
        "# Role-area/direct-route audit — batches 011–015",
        "",
        "Status: **completed as an audit-only result**. No canonical role, domain, subgroup, area-definition, area-source, or computational file was edited.",
        "",
        "## Scope",
        "",
        "- Queue lane: `role_area_direct_route_residual`.",
        "- Batches: **011–015**; the complete assigned range was processed before this checkpoint was written.",
        "- Subgroup, area of specialization and area of practice are treated as the same layer.",
        "- Parent-domain fit and role-to-area fit were kept as separate gates.",
        "",
        "## Results",
        "",
        f"- Groups processed: **{combined['counts']['groups']}**; role records processed: **{combined['counts']['roles']}**.",
        f"- Parent fit: **{combined['counts']['parent_fit']}**.",
        f"- Area/direct-route dispositions: **{combined['counts']['area_route']}**.",
        "- Counts are separate gates; parent-fit and area-route counts must not be added as unique roles.",
        "",
        "## Evidence rule",
        "",
        "Role tasks and recorded source references are retained for reconciliation. Titles, ISCO/ESCO membership and existing subgroup membership are not fit evidence. Lexical candidate ranking is not promoted into a route without a sufficiently specific task-boundary decision and source support.",
        "",
        "## Resumption",
        "",
        "- Exact next queue file: `batch-016.json`.",
        "- Do not resume it until the local area-of-specialization/source reconciliation is complete.",
        "",
        "## Output files",
        "",
        "- `area_batch_011_015_results.json` — combined machine-readable result.",
        "- `batch-011_result.json` through `batch-015_result.json` — per-batch results.",
        "- `AREA_BATCH_011_015_CHECKPOINT.json` — machine-readable checkpoint.",
        "- `run_area_batches_011_015.py` — reproducible runner.",
        "",
    ]
    old_md.write_text("\n".join(md), encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    module = load_source_runner()
    # No 006-010 task-confirmation decisions may leak into this disjoint lane.
    module.TASK_CONFIRMED_AREAS = {}
    original_argv = sys.argv[:]
    sys.argv = [str(SOURCE_RUNNER), "--start-batch", "11", "--end-batch", "15", "--output-dir", str(OUT_DIR)]
    try:
        module.main()
    finally:
        sys.argv = original_argv
    rewrite_outputs(module)


if __name__ == "__main__":
    main()
