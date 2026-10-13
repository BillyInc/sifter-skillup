"""Undo only the trial changes made by reconcile_role_fit_from_task_triangulation.

The trial pass is retained as an audit artifact, but its broad area ranking is
not accepted as a fit adjudication. This script restores the exact prior fit
status/key values captured in that pass's before-image and then reconstructs
the explicit primary route arrays from those restored legacy decisions.
Evidence references gathered during the trial are retained as audit evidence.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REPORT = AUDIT / "ROLE_TASK_TRIANGULATION_RECONCILIATION_2026_10_07.json"
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
DATE_NOTE = "Task-triangulation reconciliation 2026-10-07: "


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=True) + "\n", encoding="utf-8")


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict):
        return [x for group in payload.values() if isinstance(group, list) for x in group if isinstance(x, dict)]
    return []


def refs(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    result = []
    for item in value:
        if isinstance(item, str) and item.strip():
            result.append(item.strip())
        elif isinstance(item, dict) and item.get("url"):
            result.append(str(item["url"]).strip())
    return list(dict.fromkeys(result))


def main() -> None:
    report = read(REPORT)
    if report.get("mode") != "APPLIED":
        raise SystemExit("Refusing rollback: trial report is not marked APPLIED")
    containers = {path: read(path) for path in ROLE_FILES}
    by_key = {
        f"{row.get('domain_id')}|{str(row.get('role_name') or '').casefold()}": row
        for path, payload in containers.items() for row in rows(payload)
    }
    restored_parent = 0
    restored_area = 0
    missing = []

    for item in report.get("applied_parent", []):
        key = f"{item.get('domain_id')}|{str(item.get('role_name') or '').casefold()}"
        row = by_key.get(key)
        if row is None:
            missing.append(key)
            continue
        before = item.get("before", {})
        row["domain_fit_review_status"] = before.get("domain_fit_review_status")
        row["domain_fit_review_basis"] = before.get("domain_fit_review_basis")
        row["role_domain_lane_review_status"] = "reviewed_conditional"
        restored_parent += 1

    for item in report.get("applied_area", []):
        key = f"{item.get('domain_id')}|{str(item.get('role_name') or '').casefold()}"
        row = by_key.get(key)
        if row is None:
            missing.append(key)
            continue
        before = item.get("before", {})
        row["specialization_fit_review_status"] = before.get("specialization_fit_review_status")
        row["specialization_fit_status"] = before.get("specialization_fit_status")
        row["specialization_fit_area_key"] = before.get("specialization_fit_area_key")
        parent = row.get("domain_fit_review_status")
        row["specialization_fit_domain_gate"] = (
            "parent_domain_fit_supported" if parent == "supported"
            else "parent_domain_fit_unresolved" if parent == "conditional"
            else "parent_domain_fit_unsupported" if parent == "unsupported"
            else row.get("specialization_fit_domain_gate")
        )
        old_routes = []
        if before.get("specialization_fit_review_status") in {"supported", "conditional"} and before.get("specialization_fit_area_key"):
            old_routes.append({
                "area_id": before["specialization_fit_area_key"],
                "status": "supported" if before.get("specialization_fit_status") == "supported" else "conditional",
                "route_type": "primary",
                "evidence": {
                    "basis": row.get("specialization_fit_review_basis") or "",
                    "source_refs": refs(row.get("specialization_fit_review_source_refs")),
                },
            })
        if old_routes:
            row["role_area_routes"] = old_routes
        else:
            row.pop("role_area_routes", None)
            row.pop("role_area_routes_updated", None)
        restored_area += 1

    # Restore direct/no-area rows promoted by the trial. These were not part of
    # the normal area candidate list and have no area key to recover.
    for item in report.get("applied_direct", []):
        key = f"{item.get('domain_id')}|{str(item.get('role_name') or '').casefold()}"
        row = by_key.get(key)
        if row is None:
            missing.append(key)
            continue
        before = item.get("before", {})
        row["specialization_fit_review_status"] = before.get("specialization_fit_review_status")
        row["specialization_fit_status"] = before.get("specialization_fit_status")
        row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
        restored_area += 1

    for path, payload in containers.items():
        write(path, payload)

    result = {
        "status": "rolled_back_trial_fit_promotions",
        "trial_report": str(REPORT.relative_to(ROOT)),
        "parent_rows_restored": restored_parent,
        "area_rows_restored": restored_area,
        "missing_keys": missing,
        "scope": "Restored only fit status/key before-images captured by the trial; retained gathered source references as audit evidence.",
    }
    write(AUDIT / "ROLE_TASK_TRIANGULATION_TRIAL_ROLLBACK_2026_10_07.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
