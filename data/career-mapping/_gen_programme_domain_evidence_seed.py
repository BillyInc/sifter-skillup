#!/usr/bin/env python3
"""Generate the source-grounded programme-to-domain evidence seed.

The active programme_domain table stores the relationship label, but not the
course anchors that justify it. This additive seed carries those existing
audit records into a queryable table so the guidance UI can explain a mapping
without reconstructing or inventing evidence.
"""
from __future__ import annotations

import json
import os
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")
OUT = ROOT / "backend" / "seed_programme_domain_evidence_2026-09-17.sql"
AUDIT_OUT = HERE / "_audit" / "programme_domain_evidence_seed_2026-09-17.json"


def uid(*parts: str) -> str:
    return str(uuid.uuid5(NS, "|".join(parts)))


def q(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def jsonb(value: object) -> str:
    text = json.dumps(value if value is not None else [], ensure_ascii=False, separators=(",", ":"))
    return q(text) + "::jsonb"


def main() -> None:
    source = HERE / "_audit" / "programme_domain_evidence_2026-08-17.json"
    records = json.loads(source.read_text(encoding="utf-8"))
    rows: list[list[str]] = []
    unresolved: list[str] = []

    for key, record in records.items():
        programme_key = str(record.get("programme_key") or key.rsplit("::", 1)[0])
        if "::" not in programme_key:
            unresolved.append(key)
            continue
        discipline, programme = programme_key.split("::", 1)
        programme_id = uid("programme", "ccmas", discipline, programme)
        domain_key = str(record.get("domain_id") or "").strip()
        match_type = str(record.get("match_type") or "").strip().lower()
        if not domain_key or match_type not in {"direct", "functional", "adjacent"}:
            unresolved.append(key)
            continue
        rows.append([
            q(uid("programme_domain_evidence", programme_id, domain_key)),
            q(programme_id),
            q(uid("domain", domain_key)),
            q(programme_key),
            q(domain_key),
            q(record.get("match_type")),
            q(record.get("mapping_source")),
            q(record.get("course_anchor_quality")),
            str(int(record.get("course_anchor_count") or 0)),
            jsonb(record.get("course_anchors") or []),
            str(int(record.get("transferable_evidence_count") or 0)),
            jsonb(record.get("transferable_evidence") or []),
            "true" if record.get("source_review_required") else "false",
            "true" if record.get("review_required") else "false",
            jsonb({
                "ccmas_source_file": record.get("ccmas_source_file"),
                "ccmas_code": record.get("ccmas_code"),
                "qualification": record.get("qualification"),
                "duration_years": record.get("duration_years"),
                "domain_name": record.get("domain_name"),
                "domain_definition": record.get("domain_definition"),
                "audit_source": "programme_domain_evidence_2026-08-17",
                "source_flagged_courses": record.get("source_flagged_courses") or [],
                "programme_source_flags": record.get("programme_source_flags") or [],
                "adjacent_evidence_gate": record.get("adjacent_evidence_gate"),
            }),
        ])

    columns = (
        "id, programme_id, domain_id, programme_key, domain_key, match_type, "
        "mapping_source, course_anchor_quality, course_anchor_count, course_anchors, "
        "transferable_evidence_count, transferable_evidence, source_review_required, "
        "review_required, source_provenance"
    )
    updates = ", ".join(
        f"{column}=EXCLUDED.{column}"
        for column in columns.split(", ")[3:]
    )
    lines = [
        "-- Generated from the checked programme/domain audit; no evidence is invented.",
        "BEGIN;",
    ]
    for offset in range(0, len(rows), 100):
        chunk = rows[offset : offset + 100]
        lines.append(f"INSERT INTO skillup_dev.programme_domain_evidence ({columns}) VALUES")
        lines.append(",\n".join("  (" + ", ".join(row) + ")" for row in chunk))
        lines.append(
            "ON CONFLICT (programme_id, domain_id) DO UPDATE SET "
            + updates
            + ";"
        )
    lines.extend(["COMMIT;", ""])
    OUT.write_text("\n".join(lines), encoding="utf-8")
    AUDIT_OUT.write_text(json.dumps({
        "source": str(source.relative_to(ROOT)),
        "rows": len(rows),
        "unresolved": unresolved,
        "review_required": sum(1 for record in records.values() if record.get("review_required")),
        "source_review_required": sum(1 for record in records.values() if record.get("source_review_required")),
    }, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT}: {len(rows)} rows")
    print(f"unresolved: {len(unresolved)}")


if __name__ == "__main__":
    main()
