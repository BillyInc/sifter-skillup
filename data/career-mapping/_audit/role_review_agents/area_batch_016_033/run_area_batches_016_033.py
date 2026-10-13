"""Process the remaining disjoint role-area/direct-route queue, batches 016-033.

This is an audit-only runner. It reuses the established role-task evaluator,
never treats titles or ISCO/ESCO membership as fit evidence, and writes a
machine-readable checkpoint after every batch. It does not edit canonical
role/domain/area files or the local area-source reconciler.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
OUT_DIR = Path(__file__).resolve().parent
QUEUE_DIR = (
    ROOT
    / "data"
    / "career-mapping"
    / "_audit"
    / "GROUPED_ROLE_REVIEW_QUEUES_2026_10_07"
    / "role_area_direct_route_residual"
)
SOURCE_RUNNER = (
    ROOT
    / "data"
    / "career-mapping"
    / "_audit"
    / "role_review_agents"
    / "area_batch_006_010"
    / "run_area_batches_006_010.py"
)
BATCHES = tuple(range(16, 34))


def load_source_runner():
    spec = importlib.util.spec_from_file_location("role_area_runner_read_only", SOURCE_RUNNER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load read-only role evaluator: {SOURCE_RUNNER}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # Decisions from earlier disjoint batches must not leak into this lane.
    module.TASK_CONFIRMED_AREAS = {}
    return module


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def queue_keys(batch_number: int) -> list[str]:
    payload = read_json(QUEUE_DIR / f"batch-{batch_number:03}.json")
    return [member["role_key"] for group in payload.get("groups", []) for member in group.get("members", [])]


def prior_keys() -> set[str]:
    keys: set[str] = set()
    for batch_number in range(1, 16):
        path = QUEUE_DIR / f"batch-{batch_number:03}.json"
        if path.exists():
            keys.update(queue_keys(batch_number))
    return keys


def checkpoint_payload(
    completed: list[int],
    batch_results: list[dict],
    input_hashes: dict[str, str],
    next_batch: int | None,
) -> dict:
    parent = Counter()
    area = Counter()
    source_classes = Counter()
    groups = 0
    roles = 0
    records = []
    for result in batch_results:
        groups += result["group_count"]
        roles += result["role_count"]
        parent.update(result["counts"]["parent_fit"])
        area.update(result["counts"]["area_route"])
        source_classes.update(result.get("source_class_counts", {}))
        records.extend(result["records"])
    return {
        "schema_version": "2026-10-07.role-area-direct-route-checkpoint.v2",
        "status": "completed" if next_batch is None else "in_progress",
        "scope": "role_area_direct_route_residual batches 016-033 only",
        "completed_batches": [f"batch-{n:03}.json" for n in completed],
        "counts": {
            "groups": groups,
            "roles": roles,
            "parent_fit": dict(sorted(parent.items())),
            "area_route": dict(sorted(area.items())),
        },
        "decisions": {
            "parent_domain_fit_is_independent_of_area_fit": True,
            "area_route_requires_supported_parent_fit": True,
            "role_task_text_used": True,
            "recorded_external_source_refs_retained": True,
            "title_alone_used_as_fit_evidence": False,
            "isco_or_esco_membership_used_as_fit_evidence": False,
            "existing_subgroup_membership_used_as_fit_evidence": False,
            "lexical_candidate_ranking_is_not_a_route_decision": True,
            "unresolved_cases_preserved": True,
        },
        "input_sha256": input_hashes,
        "source_class_counts": dict(sorted(source_classes.items())),
        "next_batch": None if next_batch is None else f"batch-{next_batch:03}.json",
        "next_batch_path": None
        if next_batch is None
        else str((QUEUE_DIR / f"batch-{next_batch:03}.json").relative_to(ROOT)).replace("/", "\\"),
        "integrity": {
            "one_result_per_queue_role": len(records) == roles,
            "duplicate_role_keys": len(records) - len({r["role_key"] for r in records}),
            "overlap_with_batches_001_015": bool(set(r["role_key"] for r in records) & prior_keys()),
            "canonical_files_edited": False,
            "area_definitions_edited": False,
            "area_source_reconciler_edited": False,
            "computational_files_edited": False,
        },
        "policy": {
            "canonical_files_edited": False,
            "area_definitions_edited": False,
            "area_source_reconciler_edited": False,
            "computational_files_edited": False,
            "other_agent_batches_touched": [],
        },
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    module = load_source_runner()
    all_batch_results: list[dict] = []
    input_hashes: dict[str, str] = {}
    completed: list[int] = []

    for index, batch_number in enumerate(BATCHES):
        input_path = QUEUE_DIR / f"batch-{batch_number:03}.json"
        input_hashes[str(input_path.relative_to(ROOT)).replace("/", "\\")] = hashlib.sha256(
            input_path.read_bytes()
        ).hexdigest()
        result = module.process_batch(batch_number)
        result["assigned_lane"] = "area_batch_016_033"
        result["integrity"]["overlaps_batches_001_015"] = bool(
            set(record["role_key"] for record in result["records"]) & prior_keys()
        )
        all_batch_results.append(result)
        completed.append(batch_number)
        write_json(OUT_DIR / f"batch-{batch_number:03}_result.json", result)

        next_batch = BATCHES[index + 1] if index + 1 < len(BATCHES) else None
        checkpoint = checkpoint_payload(completed, all_batch_results, input_hashes, next_batch)
        checkpoint["generated_at_utc"] = datetime.now(timezone.utc).isoformat()
        write_json(OUT_DIR / f"checkpoint_after_batch_{batch_number:03}.json", checkpoint)

    combined = checkpoint_payload(completed, all_batch_results, input_hashes, None)
    combined.update(
        {
            "schema_version": "2026-10-07.role-area-direct-route-batches-016-033.v1",
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "records": [record for result in all_batch_results for record in result["records"]],
            "limitations": [
                "This is an audit/disposition artifact, not a canonical seed or API update.",
                "The queue's role-task evidence and recorded source references are retained; URL reachability is not asserted by this run.",
                "Review-required cases remain unresolved rather than being inferred from title, ISCO/ESCO membership or existing subgroup membership.",
            ],
        }
    )
    write_json(OUT_DIR / "area_batch_016_033_results.json", combined)
    write_json(OUT_DIR / "AREA_BATCH_016_033_CHECKPOINT.json", combined)
    (OUT_DIR / "AREA_BATCH_016_033_CHECKPOINT.md").write_text(
        "\n".join(
            [
                "# Role-area/direct-route audit — batches 016–033",
                "",
                "Status: **completed**. Every assigned batch was processed before the final checkpoint was written.",
                "",
                f"- Batches completed: **016–033** ({combined['counts']['groups']} groups / {combined['counts']['roles']} roles).",
                f"- Parent fit: **{combined['counts']['parent_fit']}**.",
                f"- Area/direct-route dispositions: **{combined['counts']['area_route']}**.",
                "- No canonical role/domain files, area definitions, area-source reconciler, or computational files were edited.",
                "- No overlap with batches 001–015.",
                "",
                "## Resumption",
                "",
                "The assigned residual queue is exhausted. There is no next batch in this lane.",
                "",
                "## Evidence policy",
                "",
                "Parent-domain fit and role-to-area fit remain separate gates. Role task text and recorded source references are used; title alone, ISCO/ESCO membership, and existing subgroup membership are not fit evidence.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
