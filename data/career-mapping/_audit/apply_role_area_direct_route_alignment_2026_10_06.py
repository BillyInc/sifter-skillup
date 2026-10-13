"""Align explicit direct-domain decisions across the role-fit status fields.

The specialization reconciliation already records a direct domain -> role
decision for some roles.  This additive repair keeps the older subgroup/area
status from contradicting that explicit decision.  It never infers a route
from ISCO, title, or subgroup membership.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
REPORT = AUDIT / "role_area_direct_route_alignment_2026_10_06.json"
REPORT_MD = AUDIT / "ROLE_AREA_DIRECT_ROUTE_ALIGNMENT_2026_10_06.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def rows(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = load(path)
    if isinstance(payload, list):
        return payload, payload
    values = payload.get("roles") if isinstance(payload, dict) else None
    if not isinstance(values, list):
        raise ValueError(f"Expected role list in {path}")
    return payload, values


def key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payloads: dict[Path, Any] = {}
    changes: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    for path in SOURCE_FILES:
        payload, role_rows = rows(path)
        payloads[path] = payload
        for row in role_rows:
            if row.get("specialization_fit_status") != "direct_domain_role":
                continue
            if str(row.get("student_path_status") or "").casefold() == "excluded":
                skipped.append({"role_key": key(row), "reason": "excluded_student_path"})
                continue
            before = {
                "subgroup_fit_status": row.get("subgroup_fit_status"),
                "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
                "subgroup_fit_review_source_register": row.get("subgroup_fit_review_source_register"),
            }
            if row.get("subgroup_fit_status") == "direct_domain_role":
                skipped.append({"role_key": key(row), "reason": "already_aligned"})
                continue
            row["subgroup_fit_status"] = "direct_domain_role"
            row["subgroup_fit_review_basis"] = (
                "Explicit direct domain-to-role decision from the completed global "
                "domain -> subgroup/area-of-practice reconciliation. No separate "
                "area route was recommended for this domain; ISCO and current "
                "subgroup membership were not used as fit proof."
            )
            row["subgroup_fit_review_source_register"] = (
                "_audit\\specialization_lanes_2026_10_05\\STEP1_RECONCILIATION_2026_10_06\\"
                "global_step1_specialization_reconciliation_2026_10_06.json"
            )
            changes.append({
                "role_key": key(row),
                "source_file": str(path.relative_to(ROOT)),
                "before": before,
                "after": {
                    "subgroup_fit_status": row.get("subgroup_fit_status"),
                    "subgroup_fit_review_basis": row.get("subgroup_fit_review_basis"),
                    "subgroup_fit_review_source_register": row.get("subgroup_fit_review_source_register"),
                },
            })

    if args.apply:
        for path, payload in payloads.items():
            write(path, payload)

    report = {
        "schema_version": "2026-10-06.role-area-direct-route-alignment.v1",
        "dry_run": not args.apply,
        "scope": "Align explicit direct-domain specialization decisions with subgroup/area status.",
        "change_count": len(changes),
        "skipped_count": len(skipped),
        "action_counts": dict(Counter("align_direct_domain_role" for _ in changes)),
        "changes": changes,
        "skipped": skipped,
        "guards": {
            "isco_used_as_fit_proof": False,
            "current_subgroup_membership_used_as_fit_proof": False,
            "new_route_inferred": False,
            "conditional_rows_forced": False,
        },
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "# Direct domain -> role area-status alignment — 2026-10-06\n\n"
        f"Mode: **{'APPLIED' if args.apply else 'DRY RUN'}**.\n\n"
        f"Explicit direct-domain rows aligned: **{len(changes)}**.\n\n"
        "Only pre-existing direct-domain specialization decisions were aligned; "
        "no new route was inferred.\n",
        encoding="utf-8",
    )
    print(json.dumps({"dry_run": not args.apply, "change_count": len(changes), "skipped_count": len(skipped)}, indent=2))


if __name__ == "__main__":
    main()
