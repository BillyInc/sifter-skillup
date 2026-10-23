"""Build an idempotent repair for the live Sociology theme-resource rows.

The canonical 2026-09-11 migration is the content authority, but its programme
resource INSERT is not idempotent. This generator extracts only that INSERT,
stages its exact rows, updates matching Sociology programme readings, inserts
missing rows, and writes a transaction-safe repair migration.
"""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql"
OUTPUT = ROOT / "backend/migration_sociology_theme_resource_repair_2026-10-23.sql"
INSERT_MARKER = "INSERT INTO skillup_dev.career_learning_resources\n    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type,"
NEXT_INSERT_MARKER = "\n\n-- Domain-owned orientation and foundation resources."

RESOURCE_COLUMNS = (
    "id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type, "
    "target_name, provider, region, access_type, delivery, url, source_url, description, "
    "source_confidence, data_state, source_provenance"
)
UPDATE_COLUMNS = (
    "target_name, ownership_scope, review_status, provider, region, access_type, delivery, url, "
    "source_url, description, source_confidence, data_state, source_provenance"
)


def extract_canonical_insert(source: str) -> str:
    start = source.find(INSERT_MARKER)
    if start < 0:
        raise ValueError("Canonical Sociology programme-resource INSERT was not found")
    end = source.find(NEXT_INSERT_MARKER, start + len(INSERT_MARKER))
    if end < 0:
        raise ValueError("The next resource INSERT was not found; refusing a broad migration copy")
    block = source[start:end].rstrip()
    if not block.endswith(";"):
        raise ValueError("Canonical Sociology programme-resource INSERT has no terminating semicolon")
    block = block[:-1] + "\nWHERE rows.resource_type = 'programme_reading';"
    return block.replace(
        "INSERT INTO skillup_dev.career_learning_resources",
        "INSERT INTO _sociology_theme_resource_seed",
        1,
    )


def build_sql(source: str) -> str:
    staged_insert = extract_canonical_insert(source)
    if staged_insert.count("'programme_reading'") < 18:
        raise ValueError("Expected the complete 18-row programme-reading source set")
    stage = f"""-- Generated from migration_guidance_ownership_and_sociology_resources_2026-09-11.sql.
-- Reconciles Sociology's exact theme-linked programme readings without replaying
-- the broader, insert-only migration. Safe to run repeatedly as one transaction.
BEGIN;

CREATE TEMP TABLE _sociology_theme_resource_seed
ON COMMIT DROP AS
SELECT * FROM skillup_dev.career_learning_resources WITH NO DATA;

{staged_insert}

DO $$
DECLARE
    seeded_rows integer;
    duplicate_targets integer;
BEGIN
    SELECT count(*) INTO seeded_rows FROM _sociology_theme_resource_seed;
    IF seeded_rows <> 18 THEN
        RAISE EXCEPTION 'Expected 18 canonical Sociology programme-reading rows; found %', seeded_rows;
    END IF;

    SELECT count(*) INTO duplicate_targets
    FROM (
        SELECT lower(target_name)
        FROM skillup_dev.career_learning_resources
        WHERE programme_id IN (
            SELECT id FROM skillup_dev.programmes WHERE lower(name) = 'sociology'
        )
          AND resource_type = 'programme_reading'
          AND lower(target_name) IN (SELECT lower(target_name) FROM _sociology_theme_resource_seed)
        GROUP BY lower(target_name)
        HAVING count(*) > 1
    ) AS duplicates;
    IF duplicate_targets > 0 THEN
        RAISE EXCEPTION 'Sociology contains % duplicate programme-reading identities; resolve them before applying this repair', duplicate_targets;
    END IF;
END $$;

UPDATE skillup_dev.career_learning_resources AS target
SET {', '.join(f'{column} = source.{column}' for column in UPDATE_COLUMNS.split(', '))}
FROM _sociology_theme_resource_seed AS source
WHERE target.programme_id = source.programme_id
  AND target.resource_type = source.resource_type
  AND lower(target.target_name) = lower(source.target_name)
  AND target.domain_id IS NULL
  AND target.subgroup_id IS NULL
  AND target.role_id IS NULL;

INSERT INTO skillup_dev.career_learning_resources ({RESOURCE_COLUMNS})
SELECT {RESOURCE_COLUMNS.replace(' ', '')}
FROM _sociology_theme_resource_seed AS source
WHERE NOT EXISTS (
    SELECT 1
    FROM skillup_dev.career_learning_resources AS target
    WHERE target.programme_id = source.programme_id
      AND target.resource_type = source.resource_type
      AND lower(target.target_name) = lower(source.target_name)
);

DO $$
DECLARE
    mapped_rows integer;
    mapped_themes integer;
BEGIN
    SELECT count(*) INTO mapped_rows
    FROM skillup_dev.career_learning_resources AS target
    JOIN _sociology_theme_resource_seed AS source
      ON target.programme_id = source.programme_id
     AND target.resource_type = source.resource_type
     AND lower(target.target_name) = lower(source.target_name)
    WHERE target.ownership_scope = 'programme'
      AND target.review_status = 'approved_guidance_v1'
      AND target.data_state = 'source_backed'
      AND target.source_provenance ->> 'guidance_layer' = 'sociology_programme_v1';

    SELECT count(DISTINCT theme_key) INTO mapped_themes
    FROM skillup_dev.career_learning_resources AS target
    JOIN _sociology_theme_resource_seed AS source
      ON target.programme_id = source.programme_id
     AND target.resource_type = source.resource_type
     AND lower(target.target_name) = lower(source.target_name)
    CROSS JOIN LATERAL jsonb_array_elements_text(
      CASE WHEN jsonb_typeof(target.source_provenance -> 'theme_keys') = 'array'
           THEN target.source_provenance -> 'theme_keys' ELSE '[]'::jsonb END
    ) AS theme_keys(theme_key)
    WHERE target.source_provenance ->> 'guidance_layer' = 'sociology_programme_v1';

    IF mapped_rows <> 18 THEN
        RAISE EXCEPTION 'Expected 18 reviewed Sociology resource rows after repair; found %', mapped_rows;
    END IF;
    IF mapped_themes <> 14 THEN
        RAISE EXCEPTION 'Expected mapped resources for all 14 active Sociology themes; found %', mapped_themes;
    END IF;
END $$;

COMMIT;
"""
    return stage


def main() -> None:
    sql = build_sql(SOURCE.read_text(encoding="utf-8"))
    OUTPUT.write_text(sql, encoding="utf-8", newline="\n")
    print(f"Generated {OUTPUT} ({len(sql.encode('utf-8'))} bytes)")


if __name__ == "__main__":
    main()
