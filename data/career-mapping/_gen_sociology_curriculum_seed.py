"""Generate the idempotent SQL seed for the clean Sociology contract."""

from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
CONTRACT = HERE / "_audit" / "sociology_curriculum_contract_2026-09-17.json"
OUT = ROOT / "backend" / "seed_sociology_curriculum_contract_2026-09-17.sql"


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def json_sql(value: object) -> str:
    return sql(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def main() -> None:
    payload = json.loads(CONTRACT.read_text(encoding="utf-8"))
    programme = payload["programme"]
    outcomes = [
        item
        for course in programme["courses"]
        for item in course["outcomes"]
        if item.get("studentDisplay") and item.get("dataState") == "source_backed"
    ]
    abilities = [
        item
        for item in payload["programmeAbilities"]["rows"]
        if item.get("studentDisplay") and item.get("dataState") == "source_backed"
    ]

    outcome_values = ",\n".join(
        "(" + ", ".join([
            sql(item["outcomeId"]),
            sql(next(course["code"] for course in programme["courses"] if item["outcomeId"] in course["outcomeIds"])),
            sql(next(course["title"] for course in programme["courses"] if item["outcomeId"] in course["outcomeIds"])),
            str(item["sourceLocator"].get("level") or "NULL"),
            sql(next(course["displayGroup"] for course in programme["courses"] if item["outcomeId"] in course["outcomeIds"])),
            str(item["sourceLocator"].get("outcomeIndex") or 0),
            sql(item["sourceText"]),
            sql(item["studentText"]),
            json_sql(item["sourceLocator"]),
            "TRUE",
            sql(item["dataState"]),
        ]) + ")"
        for item in outcomes
    )
    ability_values = ",\n".join(
        "(" + ", ".join([
            sql(item["displayTitle"]),
            sql(item["abilityId"]),
            sql(item["sourceText"]),
            sql(item["studentText"]),
            json_sql(item["sourceLocator"]),
            "TRUE",
            sql(item["dataState"]),
        ]) + ")"
        for item in abilities
    )

    output = f"""-- Clean Sociology curriculum contract seed.
-- Apply after migration_sociology_curriculum_contract_2026-09-17.sql.
-- This seed replaces only the Sociology rows in the two contract tables.
-- It does not update legacy skills_profile JSONB fields and does not touch
-- domain, subgroup or role records.

BEGIN;

WITH parent AS (
    SELECT id FROM skillup_dev.programmes
    WHERE lower(trim(discipline)) = 'social sciences'
      AND lower(trim(name)) = 'sociology'
    ORDER BY id
    LIMIT 1
)
DELETE FROM skillup_dev.programme_curriculum_outcomes
WHERE programme_id = (SELECT id FROM parent);

WITH parent AS (
    SELECT id FROM skillup_dev.programmes
    WHERE lower(trim(discipline)) = 'social sciences'
      AND lower(trim(name)) = 'sociology'
    ORDER BY id
    LIMIT 1
)
INSERT INTO skillup_dev.programme_curriculum_outcomes
(programme_id, outcome_id, course_code, course_title, course_level,
 display_group, outcome_index, source_text, student_text, source_locator, student_display,
 data_state)
SELECT parent.id, rows.outcome_id, rows.course_code, rows.course_title,
       rows.course_level, rows.display_group, rows.outcome_index, rows.source_text,
       rows.student_text, rows.source_locator, rows.student_display,
       rows.data_state
FROM parent
CROSS JOIN (VALUES
{outcome_values}
) AS rows(outcome_id, course_code, course_title, course_level, display_group,
         outcome_index, source_text, student_text, source_locator, student_display, data_state);

WITH parent AS (
    SELECT id FROM skillup_dev.programmes
    WHERE lower(trim(discipline)) = 'social sciences'
      AND lower(trim(name)) = 'sociology'
    ORDER BY id
    LIMIT 1
)
DELETE FROM skillup_dev.programme_abilities
WHERE programme_id = (SELECT id FROM parent);

WITH parent AS (
    SELECT id FROM skillup_dev.programmes
    WHERE lower(trim(discipline)) = 'social sciences'
      AND lower(trim(name)) = 'sociology'
    ORDER BY id
    LIMIT 1
)
INSERT INTO skillup_dev.programme_abilities
(programme_id, display_title, ability_id, source_text, student_text, source_locator,
 student_display, data_state)
SELECT parent.id, rows.display_title, rows.ability_id, rows.source_text, rows.student_text,
       rows.source_locator, rows.student_display, rows.data_state
FROM parent
CROSS JOIN (VALUES
{ability_values}
) AS rows(display_title, ability_id, source_text, student_text, source_locator,
          student_display, data_state);

COMMIT;
"""
    OUT.write_text(output, encoding="utf-8")
    print(json.dumps({"output": str(OUT), "outcomes": len(outcomes), "abilities": len(abilities)}, indent=2))


if __name__ == "__main__":
    main()
