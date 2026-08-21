"""Emit an idempotent SQL refresh for the corrected JAMB domain links."""

from __future__ import annotations

import json
import uuid
from pathlib import Path


ROOT = Path(__file__).parent
ACTIVE_MAP = ROOT / "jamb_domain_map.json"
OUTPUT = ROOT.parent.parent / "backend" / "refresh_jamb_programme_domain_2026-08-17.sql"
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")


def uid(*parts: str) -> str:
    return str(uuid.uuid5(NS, "|".join(parts)))


def quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    domain_map = json.loads(ACTIVE_MAP.read_text(encoding="utf-8"))
    rows = []
    for jamb_name, entry in sorted(domain_map.items()):
        for link in entry.get("links") or []:
            domain_id = link.get("domain_id")
            match_type = link.get("match_type")
            if not domain_id or match_type not in {"direct", "functional", "adjacent"}:
                continue
            rows.append((uid("jpd", jamb_name, domain_id), jamb_name, uid("domain", domain_id), match_type))

    lines = [
        "-- Generated from data/career-mapping/jamb_domain_map.json",
        "-- Full, combined, course-scoped partial, and explicitly evidenced external rows are materialized from the canonical audit.",
        "BEGIN;",
        "DELETE FROM skillup_dev.jamb_programme_domain;",
    ]
    if rows:
        lines.append("INSERT INTO skillup_dev.jamb_programme_domain (id, jamb_name, domain_id, match_type) VALUES")
        values = [f"({quote(row[0])}::uuid, {quote(row[1])}, {quote(row[2])}::uuid, {quote(row[3])})" for row in rows]
        lines.append(",\n".join(values) + ";")
    lines.extend(["COMMIT;", ""])
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "rows": len(rows)}, indent=2))


if __name__ == "__main__":
    main()
