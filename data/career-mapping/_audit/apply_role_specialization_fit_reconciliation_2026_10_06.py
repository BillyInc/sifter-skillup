"""Apply source-backed role -> corrected area-of-practice dispositions.

The global specialization reconciliation is the parent structure for this
pass.  This script does not rebuild subgroups or infer an area from ISCO.  It
only applies decisions already recorded in the role-fit review and marks
roles in domains whose completed review explicitly chose a direct
domain -> role route.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ROLE_REVIEW = AUDIT / "role_taxonomy_fit_review_2026_10_05.json"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
SOURCE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
REPORT = AUDIT / "role_specialization_fit_reconciliation_apply_2026_10_06.json"
REPORT_MD = AUDIT / "ROLE_SPECIALIZATION_FIT_RECONCILIATION_APPLY_2026_10_06.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows_and_container(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = load(path)
    if isinstance(payload, list):
        return payload, payload
    rows = payload.get("roles") if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        raise ValueError(f"Expected a role list in {path}")
    return payload, rows


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def write(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the guarded metadata changes")
    args = parser.parse_args()

    role_review = load(ROLE_REVIEW).get("role_reviews", [])
    supported = {
        str(row.get("role_key")): row
        for row in role_review
        if row.get("domain_fit_status") == "supported"
        and row.get("specialization_fit_status") == "supported"
        and row.get("specialization_key")
    }
    step1 = load(STEP1)
    direct_domains = {
        str(row.get("domain_id")): row
        for row in step1.get("domains", [])
        if row.get("step1_status") == "no_specialization_recommended"
        and row.get("disposition") == "resolved"
        and int(row.get("recommended_area_count") or 0) == 0
    }

    containers: dict[Path, Any] = {}
    all_rows: list[tuple[Path, dict[str, Any]]] = []
    for path in SOURCE_FILES:
        payload, rows = rows_and_container(path)
        containers[path] = payload
        all_rows.extend((path, row) for row in rows)

    changes: list[dict[str, Any]] = []
    seen_supported: set[str] = set()
    seen_direct: set[str] = set()
    for path, row in all_rows:
        key = role_key(row)
        domain_id = str(row.get("domain_id") or "")
        before = {
            "specialization_fit_status": row.get("specialization_fit_status"),
            "specialization_fit_candidate": row.get("specialization_fit_candidate"),
            "specialization_fit_review_basis": row.get("specialization_fit_review_basis"),
            "specialization_fit_review_source_refs": row.get("specialization_fit_review_source_refs"),
        }
        decision = supported.get(key)
        action = None
        if decision:
            row["specialization_fit_status"] = "supported"
            row["specialization_fit_candidate"] = str(decision["specialization_key"])
            row["specialization_fit_review_basis"] = str(decision.get("basis") or "")
            row["specialization_fit_review_source_refs"] = list(decision.get("source_refs") or [])
            row["specialization_fit_review_date"] = "2026-10-06"
            row["specialization_fit_domain_gate"] = "parent_domain_fit_supported"
            action = "retain_supported_role_area_fit"
            seen_supported.add(key)
        elif domain_id in direct_domains and str(row.get("student_path_status") or "").casefold() != "excluded":
            row["specialization_fit_status"] = "direct_domain_role"
            row["specialization_fit_candidate"] = None
            row["specialization_fit_review_basis"] = (
                "The completed specialization reconciliation resolved this domain to a direct domain-to-role route; "
                "no separate area of practice was recommended."
            )
            row["specialization_fit_review_source_refs"] = [
                str(STEP1.relative_to(ROOT)).replace("/", "\\")
            ]
            row["specialization_fit_review_date"] = "2026-10-06"
            row["specialization_fit_domain_gate"] = "parent_domain_route_only"
            action = "retain_direct_domain_role"
            seen_direct.add(key)
        if action and before != {
            "specialization_fit_status": row.get("specialization_fit_status"),
            "specialization_fit_candidate": row.get("specialization_fit_candidate"),
            "specialization_fit_review_basis": row.get("specialization_fit_review_basis"),
            "specialization_fit_review_source_refs": row.get("specialization_fit_review_source_refs"),
        }:
            changes.append({
                "role_key": key,
                "source_file": str(path.relative_to(ROOT)),
                "action": action,
                "before": before,
                "after": {
                    "specialization_fit_status": row.get("specialization_fit_status"),
                    "specialization_fit_candidate": row.get("specialization_fit_candidate"),
                    "specialization_fit_review_basis": row.get("specialization_fit_review_basis"),
                    "specialization_fit_review_source_refs": row.get("specialization_fit_review_source_refs"),
                },
            })

    if args.apply:
        for path, payload in containers.items():
            write(path, payload)

    report = {
        "schema_version": "2026-10-06.role-specialization-fit-reconciliation.v1",
        "dry_run": not args.apply,
        "scope": "Role fit against the already reconciled domain -> subgroup/area-of-practice layer.",
        "source_role_review_count": len(role_review),
        "source_backed_supported_review_count": len(supported),
        "resolved_direct_domain_count": len(direct_domains),
        "supported_review_keys_found": len(seen_supported),
        "direct_domain_keys_found": len(seen_direct),
        "change_count": len(changes),
        "action_counts": dict(Counter(row["action"] for row in changes)),
        "changes": changes,
        "guards": {
            "isco_used_as_fit_proof": False,
            "area_fit_without_parent_domain_gate": False,
            "subgroup_taxonomy_rebuilt": False,
            "nigerian_context_applied": False,
            "unsupported_or_conditional_rows_forced": False,
        },
        "remaining_review_required": (
            "Roles without an explicit supported source-backed specialization disposition remain review-only; "
            "this pass does not guess an area from a title, ISCO family, or current membership."
        ),
    }
    write(REPORT, report)
    lines = [
        "# Role → corrected area-of-practice reconciliation — 2026-10-06",
        "",
        f"Mode: {'APPLIED' if args.apply else 'DRY RUN'}.",
        "",
        f"Source-backed supported role-area reviews: **{len(supported)}**.",
        f"Resolved direct-domain routes: **{len(direct_domains)}** domains.",
        f"Metadata changes: **{len(changes)}**.",
        "",
        "Only rows with an explicit supported role-area review or a resolved direct-domain route were changed. Parent-domain fit was required; ISCO membership and current subgroup membership were not treated as proof.",
        "",
        "Remaining conditional/unresolved rows stay review-only.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("dry_run", "source_backed_supported_review_count", "resolved_direct_domain_count", "change_count", "action_counts")}, indent=2))


if __name__ == "__main__":
    main()
