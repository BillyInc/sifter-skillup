"""Audit the minimum active-role floor for every domain.

This is a read-only gate.  It does not invent roles or pad a domain with
titles.  A domain is below the floor until each additional role has both an
independent parent-domain task fit and an area-of-specialization fit.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
META = ROOT / "domain_meta.json"
STRUCTURE = ROOT / "domain_structure.json"
REPORT = AUDIT / "sparse_role_floor_audit_2026_10_07.json"
REPORT_MD = AUDIT / "SPARSE_ROLE_FLOOR_AUDIT_2026_10_07.md"
FLOOR = 10
EXCLUDED = {"excluded", "review_only", "audit_only"}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> None:
    meta = load(META)
    structure = load(STRUCTURE)
    rows: list[dict[str, Any]] = []
    for path in SOURCE_FILES:
        payload = load(path)
        source_rows = payload if isinstance(payload, list) else payload.get("roles", [])
        for row in source_rows:
            state = str(row.get("student_path_status") or "active").casefold()
            if state not in EXCLUDED:
                rows.append(row)

    counts = Counter(str(row.get("domain_id")) for row in rows)
    by_domain: list[dict[str, Any]] = []
    for domain_id in sorted(meta):
        domain = meta[domain_id] if isinstance(meta[domain_id], dict) else {}
        active_subgroups = [
            subgroup for subgroup in (structure.get(domain_id, {}).get("subgroups") or [])
            if str(subgroup.get("data_state") or "active").casefold() not in EXCLUDED
        ]
        active = counts.get(domain_id, 0)
        by_domain.append({
            "domain_id": domain_id,
            "domain_name": domain.get("domain_name") or domain.get("name") or domain_id,
            "active_role_count": active,
            "floor": FLOOR,
            "deficit": max(0, FLOOR - active),
            "active_subgroup_count": len(active_subgroups),
            "below_floor": active < FLOOR,
        })

    below = [row for row in by_domain if row["below_floor"]]
    report = {
        "schema_version": "2026-10-07.sparse-role-floor-audit.v1",
        "mode": "read_only",
        "active_role_rows": len(rows),
        "domain_count": len(by_domain),
        "floor": FLOOR,
        "domains_at_or_above_floor": len(by_domain) - len(below),
        "domains_below_floor": len(below),
        "zero_role_domains": sum(row["active_role_count"] == 0 for row in below),
        "total_role_deficit": sum(row["deficit"] for row in below),
        "domains": by_domain,
        "policy": {
            "no_title_only_padding": True,
            "parent_domain_task_fit_required": True,
            "area_of_specialization_fit_required": True,
            "global_and_nigerian_evidence_separate": True,
            "external_job_board_demand_is_context_not_identity_proof": True,
        },
    }
    write(REPORT, report)
    lines = [
        "# Sparse-role floor audit — 2026-10-07",
        "",
        f"Active role rows: **{len(rows)}** across **{len(by_domain)}** domains.",
        f"Required floor: **{FLOOR} active roles per domain**.",
        f"Domains below floor: **{len(below)}**; zero-role domains: **{report['zero_role_domains']}**.",
        f"Total role deficit: **{report['total_role_deficit']}** role slots.",
        "",
        "A role slot is not filled by title similarity. Each addition must fit the parent domain by actual tasks and fit a named area of specialization within that domain. Global and Nigerian context are recorded separately; job-board demand is context, not occupational identity proof.",
        "",
        "## Domains below the floor",
        "",
    ]
    for row in below:
        lines.append(
            f"- **{row['domain_id']} — {row['domain_name']}**: {row['active_role_count']} active; deficit {row['deficit']}; {row['active_subgroup_count']} active areas of specialization."
        )
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "active_role_rows": report["active_role_rows"],
        "domains_below_floor": report["domains_below_floor"],
        "zero_role_domains": report["zero_role_domains"],
        "total_role_deficit": report["total_role_deficit"],
        "report": str(REPORT),
    }, indent=2))


if __name__ == "__main__":
    main()
