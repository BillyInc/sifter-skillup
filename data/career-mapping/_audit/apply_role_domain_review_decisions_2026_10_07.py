"""Apply the source-backed role -> parent-domain review ledger.

This pass is deliberately limited to the role/domain layer.  It consumes the
completed D001-D168 review lanes and the later global increments, then applies
only exact decisions to role records that still exist in the current canonical
role sources.  It never recreates a stale mapping and never edits the domain
or subgroup taxonomy.

The review lanes are source evidence, not an instruction to infer from ISCO,
title similarity, subgroup membership, or role frequency.  A conditional or
unresolved decision remains explicit; only a source-backed unsupported decision
excludes that exact parent-domain path.  A previously excluded exact link is
reactivated only when the latest decision is supported and the old exclusion is
the prior deterministic role-domain reconciliation.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REVIEW_ROOT = AUDIT / "role_fit_lanes_2026_10_05"
PRIMARY_DIRS = (REVIEW_ROOT / "D001_D084", REVIEW_ROOT / "D085_D168")
INCREMENT_DIR = REVIEW_ROOT / "GLOBAL_CONTINUATION_2026_10_06"
SOURCE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
REPORT = AUDIT / "role_domain_review_decision_apply_2026_10_07.json"
REPORT_MD = AUDIT / "ROLE_DOMAIN_REVIEW_DECISION_APPLY_2026_10_07.md"
APPLY_DATE = "2026-10-07"

SUPPORTED = "supported"
CONDITIONAL = "conditional"
UNRESOLVED = "unresolved"
UNSUPPORTED = "unsupported"
UNSUPPORTED_INPUTS = {"unsupported", "unsupported_for_domain", "not_supported"}
ACCEPTED = {SUPPORTED, CONDITIONAL, UNRESOLVED, UNSUPPORTED}
PRIOR_RECONCILIATION_STATES = {
    "remove_link_only",
    "preserve_exclude",
    "reclassify_exact",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )


def write_text(path: Path, value: str) -> None:
    path.write_text(value.rstrip() + "\n", encoding="utf-8")


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def source_rows(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = read_json(path)
    if isinstance(payload, list):
        return payload, payload
    if isinstance(payload, dict) and isinstance(payload.get("roles"), list):
        return payload, payload["roles"]
    raise ValueError(f"Unsupported role source shape: {path}")


def decision_status(row: dict[str, Any]) -> str | None:
    raw = row.get("domain_fit_status")
    if raw is None:
        raw = row.get("domain_fit")
    if raw is None:
        raw = row.get("new_disposition")
    if raw is None:
        return None
    value = str(raw).strip().casefold()
    if value in UNSUPPORTED_INPUTS:
        return UNSUPPORTED
    return value if value in ACCEPTED else None


def source_refs(decision: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for field in ("source_refs", "evidence_refs", "domain_fit_review_source_refs"):
        raw = decision.get(field) or []
        if isinstance(raw, str):
            raw = [raw]
        if not isinstance(raw, list):
            continue
        for item in raw:
            if isinstance(item, str) and item.strip():
                values.append(item.strip())
            elif isinstance(item, dict) and item.get("url"):
                values.append(str(item["url"]).strip())
    return list(dict.fromkeys(values))


def basis(decision: dict[str, Any]) -> str:
    for field in (
        "basis",
        "rationale",
        "task_evidence",
        "task_evidence_verified",
        "domain_scope_evidence",
    ):
        value = decision.get(field)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return "Source-backed role-to-parent-domain review decision; no further basis text was supplied."


def load_lane_decisions() -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    """Load the primary lanes, then apply the numbered late increments."""

    decisions: dict[str, dict[str, Any]] = {}
    provenance: dict[str, list[str]] = defaultdict(list)
    duplicate_primary: dict[str, list[str]] = defaultdict(list)
    ignored: list[dict[str, Any]] = []

    for directory in PRIMARY_DIRS:
        for path in sorted(directory.glob("*.json")):
            payload = read_json(path)
            rows = payload.get("decisions") if isinstance(payload, dict) else None
            if not isinstance(rows, list):
                continue
            for row in rows:
                if not isinstance(row, dict) or "role_key" not in row:
                    continue
                status = decision_status(row)
                if status is None:
                    ignored.append({
                        "file": str(path.relative_to(ROOT)),
                        "role_key": row.get("role_key"),
                        "reason": "missing_or_unknown_domain_fit_status",
                    })
                    continue
                key = str(row["role_key"])
                if key in decisions:
                    duplicate_primary[key].append(str(path.relative_to(ROOT)))
                    continue
                copied = dict(row)
                copied["_normalized_status"] = status
                copied["_source_file"] = str(path.relative_to(ROOT))
                decisions[key] = copied
                provenance[key].append(str(path.relative_to(ROOT)))

    if duplicate_primary:
        raise ValueError(
            "Duplicate primary role-domain decisions found: "
            + ", ".join(sorted(duplicate_primary))
        )

    for path in sorted(INCREMENT_DIR.glob("role_domain_fit_dispositions_increment_*.json")):
        payload = read_json(path)
        rows = payload.get("decisions") if isinstance(payload, dict) else None
        if not isinstance(rows, list):
            continue
        for row in rows:
            if not isinstance(row, dict) or "role_key" not in row:
                continue
            status = decision_status(row)
            if status is None:
                ignored.append({
                    "file": str(path.relative_to(ROOT)),
                    "role_key": row.get("role_key"),
                    "reason": "missing_or_unknown_increment_status",
                })
                continue
            key = str(row["role_key"])
            copied = dict(row)
            copied["_normalized_status"] = status
            copied["_source_file"] = str(path.relative_to(ROOT))
            copied["_overrode_primary"] = key in decisions
            decisions[key] = copied
            provenance[key].append(str(path.relative_to(ROOT)))

    for key, row in decisions.items():
        row["_provenance_files"] = provenance[key]

    return decisions, ignored


def current_sources() -> tuple[
    dict[Path, Any],
    dict[str, list[tuple[Path, dict[str, Any]]]],
    dict[Path, list[dict[str, Any]]],
]:
    containers: dict[Path, Any] = {}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = defaultdict(list)
    rows_by_path: dict[Path, list[dict[str, Any]]] = {}
    for path in SOURCE_FILES:
        payload, rows = source_rows(path)
        containers[path] = payload
        rows_by_path[path] = rows
        for row in rows:
            locations[role_key(row)].append((path, row))
    return containers, locations, rows_by_path


def append_basis(old: Any, new: str) -> str:
    previous = str(old or "").strip()
    if not previous:
        return new
    if new in previous:
        return previous
    return f"{previous} {new}"


def append_refs(old: Any, new: list[str]) -> list[str]:
    previous = old if isinstance(old, list) else []
    return list(dict.fromkeys([str(item) for item in previous if str(item).strip()] + new))


def is_prior_reconciliation_exclusion(row: dict[str, Any]) -> bool:
    state = str(row.get("role_domain_reconciliation_status") or "")
    reason = str(row.get("student_path_exclusion_reason") or "").casefold()
    return state in PRIOR_RECONCILIATION_STATES and "role-to-domain reconciliation" in reason


def apply_decision(row: dict[str, Any], decision: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    status = decision["_normalized_status"]
    before = {
        "domain_fit_review_status": row.get("domain_fit_review_status"),
        "domain_fit_review_basis": row.get("domain_fit_review_basis"),
        "domain_fit_review_source_refs": row.get("domain_fit_review_source_refs"),
        "student_path_status": row.get("student_path_status"),
        "student_path_exclusion_reason": row.get("student_path_exclusion_reason"),
        "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
    }
    refs = source_refs(decision)
    reason = (
        "Source-backed role-to-parent-domain review 2026-10-07: "
        + basis(decision)
    )
    row["domain_fit_review_status"] = status
    row["domain_fit_review_basis"] = append_basis(row.get("domain_fit_review_basis"), reason)
    row["domain_fit_review_source_refs"] = append_refs(
        row.get("domain_fit_review_source_refs"), refs
    )
    row["role_domain_lane_review_date"] = APPLY_DATE
    row["role_domain_lane_review_status"] = f"reviewed_{status}"
    row["role_domain_lane_review_sources"] = list(decision["_provenance_files"])

    action = f"mark_{status}"
    if status == UNSUPPORTED:
        row["student_path_status"] = "excluded"
        row["student_path_exclusion_reason"] = append_basis(
            row.get("student_path_exclusion_reason"),
            "Source-backed parent-domain review does not support this exact role-to-domain path; "
            "the occupation record is retained for provenance and other parent links are not adjudicated here.",
        )
        action = "exclude_unsupported_exact_parent_link"
    elif status == SUPPORTED and is_prior_reconciliation_exclusion(row):
        row["student_path_status"] = "active"
        row.pop("student_path_exclusion_reason", None)
        action = "reactivate_source_supported_exact_parent_link"

    after = {
        "domain_fit_review_status": row.get("domain_fit_review_status"),
        "domain_fit_review_basis": row.get("domain_fit_review_basis"),
        "domain_fit_review_source_refs": row.get("domain_fit_review_source_refs"),
        "student_path_status": row.get("student_path_status"),
        "student_path_exclusion_reason": row.get("student_path_exclusion_reason"),
        "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
    }
    return action, {"before": before, "after": after}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write canonical role-source changes")
    args = parser.parse_args()

    decisions, ignored = load_lane_decisions()
    containers, locations, rows_by_path = current_sources()
    duplicate_current = {key: value for key, value in locations.items() if len(value) > 1}

    status_counts = Counter(row["_normalized_status"] for row in decisions.values())
    matched = 0
    matched_rows = 0
    stale: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    action_counts: Counter[str] = Counter()
    reactivated: list[str] = []
    unchanged: list[str] = []

    for key, decision in sorted(decisions.items()):
        current = locations.get(key) or []
        if not current:
            stale.append({
                "role_key": key,
                "status": decision["_normalized_status"],
                "source_files": decision["_provenance_files"],
            })
            continue
        matched += 1
        for path, row in current:
            matched_rows += 1
            action, diff = apply_decision(row, decision)
            before = diff["before"]
            after = diff["after"]
            if before == after:
                unchanged.append(f"{key}@{path.name}")
                continue
            action_counts[action] += 1
            if action == "reactivate_source_supported_exact_parent_link":
                reactivated.append(key)
            changes.append({
                "role_key": key,
                "source_file": str(path.relative_to(ROOT)),
                "duplicate_current_key": len(current) > 1,
                "action": action,
                "review_status": decision["_normalized_status"],
                "review_sources": decision["_provenance_files"],
                "before": before,
                "after": after,
            })

    report = {
        "schema_version": "2026-10-07.role-domain-review-decision-apply.v1",
        "mode": "APPLIED" if args.apply else "DRY_RUN",
        "scope": "Exact current role-to-parent-domain links only; subgroup/domain taxonomy untouched.",
        "review_source_directories": [str(path.relative_to(ROOT)) for path in PRIMARY_DIRS],
        "late_increment_directory": str(INCREMENT_DIR.relative_to(ROOT)),
        "decision_counts": dict(status_counts),
        "decision_count": len(decisions),
        "current_source_row_count": sum(len(rows) for rows in rows_by_path.values()),
        "matched_current_decisions": matched,
        "matched_current_rows": matched_rows,
        "stale_review_decisions_not_recreated": len(stale),
        "unchanged_current_rows": len(unchanged),
        "change_count": len(changes),
        "action_counts": dict(action_counts),
        "reactivated_supported_links": len(reactivated),
        "duplicate_current_keys": sorted(duplicate_current),
        "ignored_review_rows": ignored,
        "stale_review_keys": stale,
        "reactivated_keys": reactivated,
        "changes": changes,
        "guards": {
            "isco_used_as_fit_proof": False,
            "subgroup_membership_used_as_fit_proof": False,
            "stale_review_recreated": False,
            "duplicate_current_keys_deleted": False,
            "domain_or_subgroup_taxonomy_edited": False,
            "conditional_forced_to_supported": False,
            "unresolved_forced_to_supported": False,
            "unsupported_occupation_deleted": False,
        },
    }

    if args.apply:
        for path, payload in containers.items():
            write_json(path, payload)

    write_json(REPORT, report)
    lines = [
        "# Role-to-domain review decision apply — 2026-10-07",
        "",
        f"Mode: **{report['mode']}**.",
        "",
        f"Review decisions loaded: **{len(decisions)}**.",
        f"Current role rows: **{report['current_source_row_count']}**.",
        f"Exact decisions matched to current rows: **{matched}**.",
        f"Stale decisions not recreated: **{len(stale)}**.",
        f"Canonical row changes: **{len(changes)}**.",
        f"Supported links reactivated after source review: **{len(reactivated)}**.",
        "",
        "## Review dispositions",
        "",
    ]
    for key in sorted(status_counts):
        lines.append(f"- `{key}`: **{status_counts[key]}**")
    lines.extend([
        "",
        "## Guards",
        "",
        "- Decisions were matched by exact `domain_id|role_name` only; duplicate current rows were updated in place and not deleted.",
        "- Late numbered increments override earlier unresolved lane entries.",
        "- Stale review keys were reported and not recreated.",
        "- Conditional and unresolved rows remain explicit; they were not promoted.",
        "- Unsupported links exclude only the exact parent-domain path; occupation records remain.",
        "- No domain structure or subgroup catalogue file was edited.",
    ])
    write_text(REPORT_MD, "\n".join(lines))
    print(json.dumps({
        "mode": report["mode"],
        "decision_count": report["decision_count"],
        "matched_current_decisions": report["matched_current_decisions"],
        "stale_review_decisions_not_recreated": report["stale_review_decisions_not_recreated"],
        "change_count": report["change_count"],
        "action_counts": report["action_counts"],
        "report": str(REPORT),
    }, indent=2))


if __name__ == "__main__":
    main()
