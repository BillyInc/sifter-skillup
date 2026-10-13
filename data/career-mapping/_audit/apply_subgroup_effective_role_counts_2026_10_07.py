"""Recompute stored domain/subgroup role counts from effective student routes.

The seed generator routes roles through ``effective_subgroup_code``; raw ISCO
membership is not sufficient because explicit overrides and direct-domain
routes exist. By default this script is a dry run. Pass ``--apply`` to update
only ``role_count`` fields in domain_structure.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
STRUCTURE = ROOT / "domain_structure.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
REPORT = AUDIT / "subgroup_effective_role_counts_2026_10_07.json"
sys.path.insert(0, str(ROOT))

from _role_overlay_loader import load_overlay_roles  # noqa: E402
from _role_subgroup_route import effective_subgroup_code  # noqa: E402


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def merged_active_roles() -> list[dict[str, Any]]:
    rows = read_json(ROLE_LIBRARY) + load_overlay_roles()
    by_key: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = f"{row.get('domain_id')}|{row.get('role_name')}"
        by_key[key] = row
    return [
        row for row in by_key.values()
        if str(row.get("student_path_status") or "active").casefold() != "excluded"
    ]


def calculate_updates(
    structure: dict[str, Any], roles: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    domain_counts: Counter[str] = Counter()
    subgroup_counts: Counter[tuple[str, str]] = Counter()
    for role in roles:
        domain_id = str(role.get("domain_id") or "")
        if domain_id not in structure:
            continue
        domain_counts[domain_id] += 1
        subgroup_code = effective_subgroup_code(role)
        if subgroup_code:
            subgroup_counts[(domain_id, subgroup_code)] += 1

    domain_updates: list[dict[str, Any]] = []
    subgroup_updates: list[dict[str, Any]] = []
    for domain_id, domain in structure.items():
        expected = domain_counts[domain_id]
        stored = domain.get("role_count")
        if stored != expected:
            domain_updates.append({"domain_id": domain_id, "stored": stored, "recomputed": expected})
        for subgroup in domain.get("subgroups") or []:
            code = str(subgroup.get("isco_submajor") or "")
            expected_subgroup_count = subgroup_counts[(domain_id, code)]
            stored_subgroup_count = subgroup.get("role_count")
            if stored_subgroup_count != expected_subgroup_count:
                subgroup_updates.append({
                    "domain_id": domain_id,
                    "isco_submajor": code,
                    "label": subgroup.get("label"),
                    "stored": stored_subgroup_count,
                    "recomputed": expected_subgroup_count,
                })
    totals = {
        "active_merged_role_records": len(roles),
        "roles_with_effective_subgroup_route": sum(subgroup_counts.values()),
        "roles_on_direct_domain_route": len(roles) - sum(subgroup_counts.values()),
        "domain_role_count_total": sum(domain_counts.values()),
    }
    return domain_updates, subgroup_updates, totals


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write only the derived role_count fields")
    args = parser.parse_args()

    structure = read_json(STRUCTURE)
    roles = merged_active_roles()
    role_keys = [f"{row.get('domain_id')}|{row.get('role_name')}" for row in roles]
    if len(role_keys) != len(set(role_keys)):
        raise SystemExit("Refusing count reconciliation: duplicate merged role keys remain.")
    if len(structure) != 168:
        raise SystemExit(f"Refusing count reconciliation: expected 168 domains, got {len(structure)}.")

    domain_updates, subgroup_updates, totals = calculate_updates(structure, roles)
    if args.apply:
        for row in domain_updates:
            structure[row["domain_id"]]["role_count"] = row["recomputed"]
        for row in subgroup_updates:
            subgroup = next(
                item for item in structure[row["domain_id"]].get("subgroups", [])
                if str(item.get("isco_submajor") or "") == row["isco_submajor"]
            )
            subgroup["role_count"] = row["recomputed"]
        STRUCTURE.write_text(json.dumps(structure, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    report = {
        "schema_version": "2026-10-07.subgroup-effective-role-counts.v1",
        "status": "applied" if args.apply else "dry_run",
        "inputs": ["domain_structure.json", "role_library_v3_cleaned.json", "emerging_role_overlays.json", "_role_subgroup_route.py"],
        "policy": {
            "uses_seed_generator_route_resolver": True,
            "raw_isco_membership_used_as_subgroup_fit": False,
            "direct_domain_roles_counted_in_domain_only": True,
            "only_role_count_fields_changed": True,
        },
        "counts": {
            **totals,
            "domain_count_fields_to_update": len(domain_updates),
            "subgroup_count_fields_to_update": len(subgroup_updates),
        },
        "domain_updates": domain_updates,
        "subgroup_updates": subgroup_updates,
        "canonical_file_written": str(STRUCTURE.relative_to(ROOT)).replace("\\", "/") if args.apply else None,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], **report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
