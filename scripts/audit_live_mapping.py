"""Read-only comparison of the active repository map with the live Supabase schema."""

from __future__ import annotations

import json
import os
import re
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CAREER = ROOT / "data" / "career-mapping"
BACKEND = ROOT / "backend"
OUT = ROOT / "docs" / "manual-review"
REPORT_JSON = OUT / "live-data-mapping-audit-2026-08-17.json"
REPORT_MD = OUT / "live-data-mapping-audit-2026-08-17.md"


def env_values() -> dict[str, str]:
    values: dict[str, str] = {}
    for line in (BACKEND / ".env").read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip('"')
    return values


def get_rows(base_url: str, key: str, table: str, select: str, page_size: int = 1000) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0
    while True:
        query = urllib.parse.urlencode({"select": select, "limit": page_size, "offset": offset})
        request = urllib.request.Request(
            f"{base_url}/rest/v1/{table}?{query}",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Accept-Profile": "skillup_dev",
                "Prefer": "count=exact",
                "Range": f"{offset}-{offset + page_size - 1}",
            },
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            batch = json.load(response)
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


def norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def main() -> None:
    values = env_values()
    base_url = values["SUPABASE_URL"]
    key = values.get("SUPABASE_SERVICE_KEY") or values["SUPABASE_ANON_KEY"]
    tables = {
        "domains": get_rows(base_url, key, "domains", "id,domain_key,name,excluded"),
        "jamb_programme_domain": get_rows(base_url, key, "jamb_programme_domain", "jamb_name,domain_id,match_type"),
        "jamb_programmes": get_rows(base_url, key, "jamb_programmes", "id,jamb_name"),
        "schools": get_rows(base_url, key, "schools", "id"),
        "school_programmes": get_rows(base_url, key, "school_programmes", "id,school_id,jamb_programme_id"),
        "programme_subject_requirements": get_rows(base_url, key, "programme_subject_requirements", "id,jamb_programme_id"),
    }
    active_map = json.loads((CAREER / "jamb_domain_map.json").read_text(encoding="utf-8"))
    domain_uuid_by_key = {row["domain_key"]: row["id"] for row in tables["domains"]}
    domain_key_by_uuid = {row["id"]: row["domain_key"] for row in tables["domains"]}
    expected_edges = {
        (name, domain_uuid_by_key.get(link.get("domain_id")), link.get("match_type"))
        for name, payload in active_map.items()
        for link in payload.get("links", [])
    }
    actual_edges = {
        (row.get("jamb_name"), row.get("domain_id"), row.get("match_type"))
        for row in tables["jamb_programme_domain"]
    }
    expected_edges.discard((None, None, None))
    live_jamb_ids = {row["id"] for row in tables["jamb_programmes"]}
    live_school_ids = {row["id"] for row in tables["schools"]}
    live_programme_ids = live_jamb_ids
    broken_offerings = [
        row for row in tables["school_programmes"]
        if row.get("school_id") not in live_school_ids or row.get("jamb_programme_id") not in live_programme_ids
    ]
    broken_requirements = [
        row for row in tables["programme_subject_requirements"]
        if row.get("jamb_programme_id") not in live_programme_ids
    ]
    pair_counts = Counter((row.get("school_id"), row.get("jamb_programme_id")) for row in tables["school_programmes"])
    duplicate_pairs = [
        {"school_id": school_id, "jamb_programme_id": programme_id, "count": count}
        for (school_id, programme_id), count in pair_counts.items()
        if count > 1
    ]
    live_names = {row.get("jamb_name") for row in tables["jamb_programmes"]}
    map_names = set(active_map)
    normalized_name_gaps = sorted(
        [name for name in live_names if norm(name) not in {norm(mapped) for mapped in map_names}],
        key=norm,
    )
    mismatches = {
        "missing_from_live": sorted(expected_edges - actual_edges, key=lambda item: (norm(item[0]), str(item[1]), str(item[2]))),
        "extra_in_live": sorted(actual_edges - expected_edges, key=lambda item: (norm(item[0]), str(item[1]), str(item[2]))),
    }
    report = {
        "audit": "live_repository_mapping_comparison",
        "read_only": True,
        "tables": {name: len(rows) for name, rows in tables.items()},
        "mapping": {
            "repository_edges": len(expected_edges),
            "live_edges": len(actual_edges),
            "missing_from_live": len(mismatches["missing_from_live"]),
            "extra_in_live": len(mismatches["extra_in_live"]),
            "unknown_repository_domain_keys": sorted({edge[1] for edge in expected_edges if edge[1] is None}),
            "live_domain_ids_without_registry_key": sorted({edge[1] for edge in actual_edges if edge[1] not in domain_key_by_uuid}),
        },
        "foreign_keys": {
            "broken_live_offerings": broken_offerings,
            "broken_live_requirements": broken_requirements,
            "duplicate_live_school_programme_pairs": duplicate_pairs,
        },
        "identity": {
            "live_jamb_names": len(live_names),
            "repository_map_names": len(map_names),
            "live_names_without_normalized_repository_match": normalized_name_gaps,
        },
        "edge_mismatches": mismatches,
        "note": "This checks live mapping and relational integrity only. It does not validate the semantic truth of partial CCMAS scopes or shared brochure requirements.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    structural_errors = (
        len(mismatches["missing_from_live"])
        + len(mismatches["extra_in_live"])
        + len(broken_offerings)
        + len(broken_requirements)
        + len(duplicate_pairs)
        + len(report["mapping"]["unknown_repository_domain_keys"])
        + len(report["mapping"]["live_domain_ids_without_registry_key"])
    )
    lines = [
        "# Live data mapping audit — 2026-08-17",
        "",
        "Read-only comparison of the corrected repository mapping with the live `skillup_dev` schema.",
        "",
        f"- Structural live-data errors: **{structural_errors}**",
        f"- Repository domain edges: **{len(expected_edges)}**",
        f"- Live domain edges: **{len(actual_edges)}**",
        f"- Live JAMB programmes: **{len(tables['jamb_programmes'])}**",
        f"- Live schools: **{len(tables['schools'])}**",
        f"- Live school/programme rows: **{len(tables['school_programmes'])}**",
        f"- Live requirement rows: **{len(tables['programme_subject_requirements'])}**",
        "",
        "## Interpretation",
        "",
        "A zero structural count means the live relational data agrees with the current repository map. It does not certify the source interpretation of partial curriculum scopes or shared requirement text.",
        "",
        "Machine-readable details are in `live-data-mapping-audit-2026-08-17.json`.",
        "",
    ]
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"report": str(REPORT_JSON), "structural_errors": structural_errors, "summary": report["tables"], "mapping": report["mapping"], "foreign_keys": {key: len(value) for key, value in report["foreign_keys"].items()}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
