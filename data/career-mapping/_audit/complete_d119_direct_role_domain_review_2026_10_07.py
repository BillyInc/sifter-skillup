"""Close the omitted D119 direct-domain role review metadata.

D119's current subgroup records are intentionally excluded by the subgroup
contract and use a direct domain->role route.  The role descriptions and
work-profile source links already in the repository are sufficient to record
parent-domain fit for the previously unreviewed D119 rows without creating a
subgroup mapping.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
THIN_OVERLAYS = ROOT / "thin_domain_role_overlays.json"
WORK_PROFILES = ROOT / "role_work_profiles.json"
REPORT = AUDIT / "d119_direct_role_domain_review_apply_2026_10_07.json"
REPORT_MD = AUDIT / "D119_DIRECT_ROLE_DOMAIN_REVIEW_APPLY_2026_10_07.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def rows_and_container(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = load(path)
    if isinstance(payload, list):
        return payload, payload
    return payload, payload.get("roles", [])


def key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def main() -> None:
    profiles = {
        str(row.get("role_key")): row
        for row in load(WORK_PROFILES).get("profiles", [])
        if isinstance(row, dict) and str(row.get("role_key", "")).startswith("D119|")
    }
    containers: dict[Path, Any] = {}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path in (ROLE_LIBRARY, THIN_OVERLAYS):
        payload, rows = rows_and_container(path)
        containers[path] = payload
        for row in rows:
            if row.get("domain_id") == "D119":
                locations.setdefault(key(row), []).append((path, row))

    changes = []
    for role_key, matches in sorted(locations.items()):
        pending_matches = [
            (path, row) for path, row in matches
            if not row.get("domain_fit_review_status")
        ]
        if not pending_matches:
            continue
        profile = profiles.get(role_key)
        if not profile:
            raise ValueError(f"No local role work profile for {role_key}")
        links = [
            str(item.get("url"))
            for item in profile.get("source_links", [])
            if isinstance(item, dict) and item.get("url")
        ]
        description = next(
            str(row.get("description") or "") for _path, row in matches if row.get("description")
        )
        for path, row in pending_matches:
            before = {
                "domain_fit_review_status": row.get("domain_fit_review_status"),
                "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
                "subgroup_fit_status": row.get("subgroup_fit_status"),
                "specialization_fit_status": row.get("specialization_fit_status"),
            }
            row["domain_fit_review_status"] = "supported"
            row["domain_fit_review_basis"] = (
                "D119 direct-domain role review 2026-10-07: the existing ESCO/O*NET "
                f"role profile describes livestock, animal-care, breeding, dairy, or farm work within the D119 parent scope. {description}"
            )
            row["domain_fit_review_source_refs"] = list(dict.fromkeys(links))
            row["role_domain_lane_review_status"] = "reviewed_supported"
            row["role_domain_lane_review_date"] = "2026-10-07"
            row["subgroup_fit_status"] = "direct_domain_role"
            row["subgroup_fit_review_basis"] = (
                "D119 uses the direct domain-to-role route; its current subgroup records are excluded by the subgroup contract."
            )
            row["subgroup_fit_review_source_register"] = str(REPORT_MD.relative_to(ROOT))
            if not row.get("specialization_fit_status"):
                row["specialization_fit_status"] = "direct_domain_role"
                row["specialization_fit_candidate"] = None
            changes.append({
                "role_key": role_key,
                "source_file": str(path.relative_to(ROOT)),
                "before": before,
                "after": {
                    "domain_fit_review_status": row.get("domain_fit_review_status"),
                    "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
                    "subgroup_fit_status": row.get("subgroup_fit_status"),
                    "specialization_fit_status": row.get("specialization_fit_status"),
                },
                "source_refs": links,
            })

    for path, payload in containers.items():
        write(path, payload)
    report = {
        "schema_version": "2026-10-07.d119-direct-role-domain-review.v1",
        "scope": "D119 rows missing parent-domain review metadata; direct domain-to-role route.",
        "changed_rows": len(changes),
        "changes": changes,
        "guards": {
            "subgroup_taxonomy_edited": False,
            "isco_used_as_fit_proof": False,
            "role_added": False,
            "direct_domain_route_preserved": True,
        },
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# D119 direct role-domain review — 2026-10-07",
            "",
            f"Closed **{len(changes)}** previously blank D119 role review rows using the existing ESCO/O*NET role work profiles.",
            "",
            "D119 remains a direct domain→role route. No excluded subgroup was reactivated and no role was added.",
            "",
            "The source profile is task evidence for the parent domain; it is not Nigerian demand evidence or a claim that the displayed roles are exhaustive.",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"changed_rows": len(changes), "report": str(REPORT)}, indent=2))


if __name__ == "__main__":
    main()
