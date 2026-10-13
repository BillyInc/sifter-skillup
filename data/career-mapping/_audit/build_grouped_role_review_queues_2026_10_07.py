"""Build current, grouped role-fit work queues without editing canonical roles.

This reducer consumes the current canonical role sources and the current
role-area apply ledger. Exact duplicate task profiles are grouped only within
the same domain and only when their current decision basis/candidate routes
also match. It preserves every role key in each case group so later scripted
application remains auditable.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
STRUCTURE_PATH = ROOT / "domain_structure.json"
META_PATH = ROOT / "domain_meta.json"
ROLE_PATHS = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
AREA_APPLY_PATH = AUDIT / "role_enrichment_lanes_2026_10_06" / "ROLE_AREA_ROUTE_APPLY_2026_10_07.json"
OUT = AUDIT / "GROUPED_ROLE_REVIEW_QUEUES_2026_10_07"
BATCH_SIZE = 100


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize(text: Any) -> str:
    return re.sub(r"\s+", " ", str(text or "").casefold()).strip()


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def role_rows(path: Path) -> list[dict[str, Any]]:
    obj = read(path)
    rows = obj if isinstance(obj, list) else obj.get("roles") if isinstance(obj, dict) else None
    if not isinstance(rows, list):
        raise ValueError(f"Unsupported role source format: {path}")
    return rows


def compact_role(row: dict[str, Any], source_file: Path, domain_name: str) -> dict[str, Any]:
    task = row.get("role_task_summary") or row.get("role_description") or row.get("description") or ""
    return {
        "role_key": role_key(row),
        "domain_id": str(row.get("domain_id") or ""),
        "domain_name": domain_name,
        "role_title": str(row.get("role_name") or ""),
        "role_task_evidence": str(task),
        "task_source_refs": row.get("role_task_source_refs") or row.get("source_refs") or row.get("role_source_refs") or [],
        "domain_fit_status": row.get("domain_fit_review_status"),
        "domain_fit_basis": row.get("domain_fit_review_basis"),
        "domain_fit_source_refs": row.get("domain_fit_review_source_refs") or [],
        "area_fit_status": row.get("specialization_fit_status") or row.get("specialization_fit_review_status"),
        "area_key": row.get("specialization_fit_area_key"),
        "area_fit_basis": row.get("specialization_fit_review_basis"),
        "area_fit_source_refs": row.get("specialization_fit_review_source_refs") or [],
        "source_file": source_file.relative_to(ROOT).as_posix(),
    }


def unique_roles(domain_names: dict[str, str]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    duplicates: dict[str, list[str]] = defaultdict(list)
    for path in ROLE_PATHS:
        for row in role_rows(path):
            key = role_key(row)
            compact = compact_role(row, path, domain_names.get(str(row.get("domain_id")), str(row.get("domain_id"))))
            if key in result:
                duplicates[key].append(compact["source_file"])
                # Prefer the cleaned library as canonical source, but merge
                # absent task/source fields from overlays for review context.
                if path.name == "role_library_v3_cleaned.json":
                    prior = result[key]
                    for field in ("role_task_evidence", "task_source_refs", "domain_fit_basis", "domain_fit_source_refs", "area_fit_basis", "area_fit_source_refs"):
                        if not compact.get(field) and prior.get(field):
                            compact[field] = prior[field]
                    result[key] = compact
                else:
                    for field in ("role_task_evidence", "task_source_refs", "domain_fit_basis", "domain_fit_source_refs", "area_fit_basis", "area_fit_source_refs"):
                        if not result[key].get(field) and compact.get(field):
                            result[key][field] = compact[field]
            else:
                result[key] = compact
    return result


def make_groups(rows: list[dict[str, Any]], key_fn) -> list[dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        group_key = json.dumps(key_fn(row), ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        groups[group_key].append(row)
    result = []
    for group_key, members in groups.items():
        sha = hashlib.sha256(group_key.encode("utf-8")).hexdigest()[:14]
        result.append({"group_id": f"G-{sha}", "member_count": len(members), "group_basis": json.loads(group_key), "members": sorted(members, key=lambda x: x["role_key"])})
    return sorted(result, key=lambda x: (-x["member_count"], x["group_id"]))


def emit_lane(lane: str, groups: list[dict[str, Any]], source_rows: int, source_statuses: dict[str, int]) -> dict[str, Any]:
    batches_dir = OUT / lane
    batches_dir.mkdir(parents=True, exist_ok=True)
    batches = []
    for offset in range(0, len(groups), BATCH_SIZE):
        batch_num = offset // BATCH_SIZE + 1
        part = groups[offset:offset + BATCH_SIZE]
        name = f"batch-{batch_num:03d}.json"
        obj = {
            "schema_version": "2026-10-07.grouped-role-review-batch.v1",
            "lane": lane,
            "batch_number": batch_num,
            "groups": part,
            "group_count": len(part),
            "role_count": sum(x["member_count"] for x in part),
            "instruction": "Review every distinct case group; use the shared basis only for members with identical role task, domain, evidence basis and route candidates. Return a row-level disposition for every role_key. Never infer fit from ISCO/ESCO membership alone.",
        }
        write(batches_dir / name, obj)
        batches.append({"file": f"{lane}/{name}", "groups": len(part), "roles": obj["role_count"]})
    return {
        "lane": lane,
        "source_role_rows": source_rows,
        "source_status_counts": source_statuses,
        "distinct_case_groups": len(groups),
        "reduction_ratio": round(1 - len(groups) / max(1, source_rows), 4),
        "batch_size_groups": BATCH_SIZE,
        "batch_count": len(batches),
        "batches": batches,
    }


def main() -> None:
    structure = read(STRUCTURE_PATH)
    meta = read(META_PATH)
    domain_names = {str(k): str(v.get("domain_name") or v.get("name") or k) if isinstance(v, dict) else str(v) for k, v in meta.items()}
    roles = unique_roles(domain_names)

    # Parent-domain conditional queue: consolidate exact same domain/task/basis
    # cases; keep source refs and per-role keys, never infer a shared answer.
    conditional = [r for r in roles.values() if normalize(r.get("domain_fit_status")) == "conditional"]
    domain_groups = make_groups(
        conditional,
        lambda r: [r["domain_id"], normalize(r["role_task_evidence"]), normalize(r["domain_fit_basis"]), tuple(sorted(r["domain_fit_source_refs"]))],
    )

    # Area/direct residual: use the current row-level route applier as queue
    # authority, and enrich from its task/area evidence, not stale lane counts.
    area_ledger = read(AREA_APPLY_PATH)
    area_residuals = area_ledger.get("residuals") or []
    enriched_area = []
    for residual in area_residuals:
        key = str(residual.get("role_key") or "")
        canonical = roles.get(key, {})
        domain_id = str(residual.get("domain_id") or canonical.get("domain_id") or "")
        domain = structure.get(domain_id, {})
        areas = {str(a.get("area_id")): a for a in domain.get("areas_of_specialization") or []}
        candidates = []
        for candidate in residual.get("candidate_areas") or []:
            area_key = str(candidate.get("area_key") or "")
            area = areas.get(area_key, {})
            candidates.append({
                "area_key": area_key,
                "label": candidate.get("label") or area.get("label"),
                "boundary": candidate.get("boundary") or area.get("boundary"),
                "source_refs": candidate.get("area_source_urls") or [x.get("url") for x in area.get("source_references") or [] if x.get("url")],
                "candidate_score": candidate.get("rank_score"),
            })
        task = residual.get("role_task_evidence") or canonical.get("role_task_evidence") or ""
        enriched_area.append({
            "role_key": key,
            "domain_id": domain_id,
            "domain_name": domain_names.get(domain_id, domain_id),
            "role_title": residual.get("role_title") or canonical.get("role_title"),
            "role_task_evidence": task,
            "task_source_refs": residual.get("task_source_refs") or canonical.get("task_source_refs") or [],
            "parent_status": residual.get("parent_status") or canonical.get("domain_fit_status"),
            "parent_domain_evidence": residual.get("parent_domain_evidence") or [],
            "candidate_areas": candidates,
            "candidate_key_set": sorted(x["area_key"] for x in candidates),
            "route_reason": residual.get("reason") or residual.get("disposition_reason"),
        })
    area_groups = make_groups(
        enriched_area,
        lambda r: [r["domain_id"], normalize(r["role_task_evidence"]), normalize(r.get("route_reason")), r["parent_status"], tuple(r["candidate_key_set"])],
    )

    summary = {
        "schema_version": "2026-10-07.grouped-role-review-queues.v1",
        "generated_from_current_canonical_sources": True,
        "terminology": "subgroup equals area of specialization equals area of practice",
        "source_files": [p.relative_to(ROOT).as_posix() for p in ROLE_PATHS] + [AREA_APPLY_PATH.relative_to(ROOT).as_posix(), STRUCTURE_PATH.relative_to(ROOT).as_posix()],
        "role_key_count_after_deduplication": len(roles),
        "lanes": [
            emit_lane("role_domain_conditional", domain_groups, len(conditional), dict(Counter(normalize(r.get("domain_fit_status")) for r in conditional))),
            emit_lane("role_area_direct_route_residual", area_groups, len(enriched_area), dict(Counter(normalize(r.get("status")) for r in area_residuals))),
        ],
        "queue_safety": {
            "canonical_files_edited": False,
            "area_visibility_changed": False,
            "role_fit_decisions_changed": False,
            "groups_are_review_units_not_automatic_dispositions": True,
            "all_member_role_keys_preserved": True,
            "area_boundaries_and_evidence_included": True,
        },
    }
    write(OUT / "manifest.json", summary)
    print(json.dumps({"role_keys": summary["role_key_count_after_deduplication"], "lanes": [{k: lane[k] for k in ("lane", "source_role_rows", "distinct_case_groups", "reduction_ratio", "batch_count")} for lane in summary["lanes"]]}, indent=2))


if __name__ == "__main__":
    main()
