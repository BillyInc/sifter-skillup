"""Generate partitioned SQL for the source-backed career resources.

The population parts are the source of truth. Each SQL part is an independent
transaction and can be applied in numeric order after the migration.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from _learning_resource_population_io import load_population


HERE = Path(__file__).resolve().parent
BACKEND = HERE.parent.parent / "backend"
PARTS_DIR = BACKEND / "seed_career_resources_v1_parts"
MANIFEST_PATH = BACKEND / "seed_career_resources_v1.manifest.json"
BATCH_SIZE = 500
MAX_PART_BYTES = 8 * 1024 * 1024

COLUMNS = [
    "id", "domain_id", "subgroup_id", "role_id", "resource_type", "target_name",
    "provider", "region", "access_type", "delivery", "url", "price", "currency",
    "price_period", "price_as_of", "price_source", "source_url", "description",
    "source_confidence", "data_state", "source_provenance",
]


def sql_text(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_json(value: object) -> str:
    if value is None:
        value = {}
    encoded = json.dumps(json_safe(value), ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    return sql_text(encoded) + "::jsonb"


def json_safe(value: object) -> object:
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: json_safe(item) for key, item in value.items()}
    return value


def sql_number(value: object) -> str:
    if value is None:
        return "NULL"
    return format(float(value), ".15g")


def value_for(column: str, row: dict) -> str:
    value = row.get(column)
    if column == "price":
        return sql_number(value)
    if column == "source_provenance":
        return sql_json(value)
    return sql_text(value)


def render_batch(batch: list[dict], columns: str, updates: str) -> str:
    values = ["(" + ", ".join(value_for(column, row) for column in COLUMNS) + ")" for row in batch]
    return "\n".join([
        f"INSERT INTO skillup_dev.career_learning_resources ({columns}) VALUES",
        ",\n".join(values),
        "ON CONFLICT (domain_id, subgroup_id, role_id, resource_type, target_name, provider, url) DO UPDATE SET",
        f"        {updates};",
        "",
    ])


def write_part(index: int, total_parts: int, sections: list[str], row_count: int) -> dict:
    lines = [
        "-- Source-backed Sifter LevelUp career-resource population.",
        f"-- Part {index:03d} of {total_parts:03d}; execute parts in numeric order.",
        "-- Generated from partitioned learning_resource_population_parts.",
        "-- Apply backend/migration_career_resources_v1.sql before these parts.",
        "BEGIN;",
        "",
        *sections,
        "COMMIT;",
        "",
    ]
    payload = "\n".join(lines).encode("utf-8")
    filename = f"part-{index:03d}.sql"
    path = PARTS_DIR / filename
    path.write_bytes(payload)
    return {
        "file": f"seed_career_resources_v1_parts/{filename}",
        "part": index,
        "row_count": row_count,
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
    }


def main() -> None:
    population = load_population()
    rows = population["resources"]
    if not rows:
        raise SystemExit("resource population is empty")

    columns = ", ".join(COLUMNS)
    update_columns = [column for column in COLUMNS if column not in {"id"}]
    updates = ",\n        ".join(f"{column} = EXCLUDED.{column}" for column in update_columns)
    batches = []
    for offset in range(0, len(rows), BATCH_SIZE):
        batch = rows[offset : offset + BATCH_SIZE]
        batches.append((render_batch(batch, columns, updates), len(batch)))

    PARTS_DIR.mkdir(parents=True, exist_ok=True)
    for old_part in PARTS_DIR.glob("part-*.sql"):
        old_part.unlink()

    header_bytes = len("-- Source-backed Sifter LevelUp career-resource population.\nBEGIN;\n\nCOMMIT;\n".encode("utf-8"))
    grouped: list[tuple[list[str], int]] = []
    sections: list[str] = []
    section_bytes = header_bytes
    section_rows = 0
    for rendered, batch_rows in batches:
        rendered_bytes = len(rendered.encode("utf-8"))
        if sections and section_bytes + rendered_bytes > MAX_PART_BYTES:
            grouped.append((sections, section_rows))
            sections = []
            section_bytes = header_bytes
            section_rows = 0
        sections.append(rendered)
        section_bytes += rendered_bytes
        section_rows += batch_rows
    if sections:
        grouped.append((sections, section_rows))

    part_manifest = [
        write_part(index, len(grouped), sections, row_count)
        for index, (sections, row_count) in enumerate(grouped, start=1)
    ]
    manifest = {
        "schema_version": "1.0.0",
        "storage": "partitioned_sql_transactions",
        "source_population": "data/career-mapping/learning_resource_population.manifest.json",
        "resource_rows": len(rows),
        "batch_size": BATCH_SIZE,
        "batches": len(batches),
        "max_part_bytes": MAX_PART_BYTES,
        "parts": part_manifest,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"rows": len(rows), "batches": len(batches), "parts": len(part_manifest), "manifest": str(MANIFEST_PATH)}, indent=2))


if __name__ == "__main__":
    main()
