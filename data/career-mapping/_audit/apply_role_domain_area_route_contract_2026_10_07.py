"""Materialise explicit role -> domain/area routes from reviewed canonical rows.

The legacy fields remain for compatibility.  The route arrays make the
non-exclusive model explicit and prevent a conditional row from being read as
an unsupported role.  No new fit is inferred from ISCO, frequency or title
alone; the route evidence is copied from the reviewed row's existing basis and
source references.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ROLE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
REPORT = ROOT / "_audit" / "ROLE_DOMAIN_AREA_ROUTE_CONTRACT_2026_10_07.json"
DATE = "2026-10-07"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        return [item for value in payload.values() if isinstance(value, list) for item in value if isinstance(item, dict)]
    return []


def refs(value: Any) -> list[str]:
    if isinstance(value, list):
        out = []
        for item in value:
            if isinstance(item, str) and item.strip():
                out.append(item.strip())
            elif isinstance(item, dict) and item.get("url"):
                out.append(str(item["url"]).strip())
        return list(dict.fromkeys(out))
    return [str(value).strip()] if value else []


def row_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{str(row.get('role_name') or '').casefold()}"


def domain_route(row: dict[str, Any], route_type: str = "primary") -> dict[str, Any]:
    status = str(row.get("domain_fit_review_status") or "review_required")
    status = "supported" if status == "supported" else "conditional" if status == "conditional" else "review_required"
    basis = str(row.get("domain_fit_review_basis") or "").strip()
    route = {
        "domain_id": row.get("domain_id"),
        "status": status,
        "route_type": route_type,
        "evidence": {
            "basis": basis,
            "source_refs": refs(row.get("domain_fit_review_source_refs")),
        },
    }
    if status == "conditional":
        route["qualification"] = basis
    return route


def area_route(row: dict[str, Any]) -> dict[str, Any] | None:
    area_id = row.get("specialization_fit_area_key")
    if not area_id or row.get("specialization_fit_review_status") not in {"supported", "conditional"}:
        return None
    status = "supported" if row.get("specialization_fit_status") == "supported" else "conditional"
    return {
        "area_id": area_id,
        "status": status,
        "route_type": "primary",
        "evidence": {
            "basis": str(row.get("specialization_fit_review_basis") or "").strip(),
            "source_refs": refs(row.get("specialization_fit_review_source_refs")),
        },
    }


def main() -> None:
    containers = {path: read(path) for path in ROLE_FILES}
    locations = [(path, row) for path, payload in containers.items() for row in rows(payload)]

    by_title: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for _, row in locations:
        title = str(row.get("role_name") or "").casefold().strip()
        if title:
            by_title[title].append(row)

    changed = []
    conditional_primary = 0
    supported_primary = 0
    cross_domain_alternatives = 0
    area_routes = 0

    for path, row in locations:
        current_domain = row.get("domain_id")
        current = domain_route(row)
        alternatives = []
        for other in by_title.get(str(row.get("role_name") or "").casefold().strip(), []):
            if other is row or other.get("domain_id") == current_domain:
                continue
            if other.get("domain_fit_review_status") == "supported":
                alternatives.append(domain_route(other, "secondary"))
        route_map = {(r.get("domain_id"), r.get("route_type")): r for r in [current, *alternatives]}
        new_domain_routes = list(route_map.values())
        old_domain_routes = row.get("role_domain_routes")
        if old_domain_routes != new_domain_routes:
            row["role_domain_routes"] = new_domain_routes
            row["role_domain_routes_updated"] = DATE
            changed.append({
                "source_file": str(path.relative_to(ROOT)),
                "role_key": row_key(row),
                "domain_route_count": len(new_domain_routes),
                "has_secondary_domain_route": len(new_domain_routes) > 1,
            })
        if current["status"] == "conditional":
            conditional_primary += 1
        elif current["status"] == "supported":
            supported_primary += 1
        cross_domain_alternatives += max(0, len(new_domain_routes) - 1)

        primary_area = area_route(row)
        existing_area_routes = row.get("role_area_routes")
        if primary_area and not existing_area_routes:
            row["role_area_routes"] = [primary_area]
            row["role_area_routes_updated"] = DATE
            area_routes += 1
            if not any(item.get("role_key") == row_key(row) for item in changed):
                changed.append({
                    "source_file": str(path.relative_to(ROOT)),
                    "role_key": row_key(row),
                    "area_route_count": 1,
                })

    for path, payload in containers.items():
        write(path, payload)

    report = {
        "schema_version": "2026-10-07.role-domain-area-route-contract.v1",
        "status": "applied",
        "date": DATE,
        "policy": {
            "domain_fit_is_not_inferred_from_isco": True,
            "conditional_routes_preserve_their_qualification": True,
            "same_title_cross_domain_routes_are_explicit": True,
            "area_fit_is_not_inferred_from_subgroup_membership": True,
            "legacy_singular_fields_preserved": True,
        },
        "counts": {
            "role_rows_processed": len(locations),
            "primary_supported_domain_routes": supported_primary,
            "primary_conditional_domain_routes": conditional_primary,
            "secondary_supported_domain_routes_added_or_retained": cross_domain_alternatives,
            "primary_area_routes_added": area_routes,
            "rows_changed": len(changed),
        },
        "changed_rows": changed,
    }
    write(REPORT, report)
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
