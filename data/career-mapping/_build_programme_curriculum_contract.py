"""Build the generic programme-owned CCMAS curriculum contract.

Sociology is deliberately excluded: it has a reviewed contract and seed of its
own. Every other parsed CCMAS programme is converted from course-scoped
learning outcomes. Legacy ``skills_profile`` and ``employability_skills`` are
never used as course outcomes. The latter is preserved as staff-audit-only
programme abilities until its source field is separately reconciled.

The output is an idempotent SQL seed. It is written outside the repository by
default so the large generated file is not accidentally committed; use the
transport splitter afterwards when the compressed parts are ready for Git.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
CCMAS_DIR = HERE / "ccmas"
REVIEW = HERE / "_audit" / "ccmas_original_source_review_2026-09-18.json"
AUDIT_OUT = HERE / "_audit" / "programme_curriculum_contract_2026-09-18.json"
DEFAULT_OUT = Path("C:/tmp/programme_curriculum_contract_2026-09-18.sql")
ANNOTATION_RE = re.compile(r"\s+>\s+\*\*\[(?P<label>[^]]+)\]:\*\*", re.IGNORECASE)


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def clean_source_text(value: str) -> tuple[str, str | None]:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    match = ANNOTATION_RE.search(text)
    if not match:
        return text.rstrip(" ;"), None
    source = text[: match.start()].rstrip(" -;.")
    note = f"{match.group('label').strip()}: {text[match.end():].strip()}"
    return source, note


def student_text(value: str) -> str:
    text = re.sub(r"\s+", " ", value).strip().rstrip(" ;.")
    if not text:
        return text
    lower = text[:1].lower() + text[1:]
    if lower.startswith("ability to "):
        return f"You will build the ability to {lower[len('ability to '):]}"
    if lower.startswith("competence in "):
        return f"You will build competence in {lower[len('competence in '):]}"
    if lower.startswith("have an overview of "):
        return f"You will gain an overview of {lower[len('have an overview of '):]}"
    if lower.startswith("have an idea of "):
        return f"You will gain an introduction to {lower[len('have an idea of '):]}"
    if lower.startswith("be able to "):
        return f"You will learn to {lower[len('be able to '):]}"
    if lower.startswith("appreciate "):
        return f"You will learn to understand {lower[len('appreciate '):]}"
    if lower.startswith(("identify ", "define ", "explain ", "describe ", "discuss ", "analyse ", "analyze ", "apply ", "evaluate ", "develop ", "design ", "conduct ", "demonstrate ", "recognise ", "recognize ", "understand ", "distinguish ", "outline ", "construct ", "write ", "prepare ", "collect ", "trace ", "list ", "mention ", "state ", "compare ", "differentiate ", "calculate ", "compute ", "use ", "perform ", "implement ", "manage ", "create ", "solve ", "critically ")):
        return f"You will learn to {lower}"
    if lower.startswith("you "):
        return lower[:1].upper() + lower[1:]
    return f"You will study {lower}"


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def json_sql(value: object) -> str:
    return sql(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def level(value: Any) -> int | None:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def load_review() -> dict[tuple[str, str, str, str], dict[str, Any]]:
    if not REVIEW.exists():
        return {}
    payload = json.loads(REVIEW.read_text(encoding="utf-8"))
    return {
        (
            row.get("discipline") or "",
            row.get("programme") or "",
            row.get("courseCode") or "",
            row.get("courseTitle") or "",
        ): row
        for row in payload.get("courseRows") or []
    }


def source_locator(
    source_file: str,
    source_payload: dict[str, Any],
    programme: dict[str, Any],
    course: dict[str, Any],
    outcome_index: int,
    review: dict[str, Any] | None,
    annotation: str | None,
) -> dict[str, Any]:
    return {
        "sourceFile": source_file,
        "parsedSource": source_payload.get("source_file"),
        "originalPdf": (review or {}).get("originalPdf"),
        "originalPages": (review or {}).get("originalPages") or [],
        "courseSummary": course.get("content_summary"),
        "discipline": source_payload.get("discipline"),
        "programme": programme.get("name"),
        "courseCode": course.get("code"),
        "courseTitle": course.get("title"),
        "level": course.get("level"),
        "outcomeIndex": outcome_index,
        "documentFlags": source_payload.get("document_flags") or [],
        "courseFlags": course.get("flags") or [],
        "sourceReview": {
            "dataState": (review or {}).get("dataState", "source_backed"),
            "decision": (review or {}).get("decision"),
            "resolution": (review or {}).get("resolution"),
            "originalChecked": (review or {}).get("originalChecked", False),
        },
        "excludedAnnotation": annotation,
    }


def ability_rows(programme: dict[str, Any], source_payload: dict[str, Any], source_file: str) -> list[dict[str, Any]]:
    """Preserve legacy programme abilities for staff audit, never as student copy.

    The field mixes genuine ability statements with employability/demand prose
    and differs by discipline. It is therefore deliberately review-only until
    a separate source reconciliation promotes a row.
    """
    rows = []
    for index, value in enumerate(programme.get("employability_skills") or []):
        if not isinstance(value, str) or not value.strip():
            continue
        rows.append({
            "displayTitle": "Programme ability record",
            "abilityId": f"legacy-ability:{index + 1}",
            "sourceText": value.strip(),
            "studentText": "",
            "sourceLocator": {
                "sourceFile": source_file,
                "parsedSource": source_payload.get("source_file"),
                "discipline": source_payload.get("discipline"),
                "programme": programme.get("name"),
                "field": "employability_skills",
                "index": index,
                "sourceFlags": source_payload.get("document_flags") or [],
                "reviewReason": "Mixed employability, demand and ways-of-working prose; not promoted to student-facing programme abilities.",
            },
            "studentDisplay": False,
            "dataState": "review_only",
        })
    return rows


def build_programme(source_file: str, payload: dict[str, Any], programme: dict[str, Any], reviews: dict[tuple[str, str, str, str], dict[str, Any]]) -> dict[str, Any]:
    outcomes: list[dict[str, Any]] = []
    review_outcomes = 0
    annotations = 0
    for course in programme.get("courses") or []:
        key = (
            payload.get("discipline") or "",
            programme.get("name") or "",
            course.get("code") or "",
            course.get("title") or "",
        )
        source_review = reviews.get(key)
        state = (source_review or {}).get("dataState", "source_backed")
        display = state == "source_backed"
        for index, raw in enumerate(course.get("skills_learned") or []):
            if not isinstance(raw, str) or not raw.strip():
                continue
            source_text, annotation = clean_source_text(raw)
            if annotation:
                annotations += 1
            if not source_text:
                continue
            if state == "review_only":
                review_outcomes += 1
            outcomes.append({
                "outcomeId": f"{course.get('code')}:{index + 1}",
                "courseCode": course.get("code"),
                "courseTitle": course.get("title") or "Recorded course",
                "courseLevel": level(course.get("level")),
                "displayGroup": "shared_university" if str(course.get("code") or "").upper().startswith(("GST ", "ENT ")) else "programme_core",
                "outcomeIndex": index,
                "sourceText": source_text,
                "studentText": student_text(source_text),
                "sourceLocator": source_locator(source_file, payload, programme, course, index, source_review, annotation),
                "studentDisplay": display,
                "dataState": state,
            })
    return {
        "discipline": payload.get("discipline"),
        "sourceFile": source_file,
        "programme": programme.get("name"),
        "code": programme.get("code"),
        "qualification": programme.get("qualification"),
        "durationYears": programme.get("duration_years"),
        "outcomes": outcomes,
        "abilities": ability_rows(programme, payload, source_file),
        "courseCount": len(programme.get("courses") or []),
        "outcomeCount": len(outcomes),
        "studentOutcomeCount": sum(row["studentDisplay"] for row in outcomes),
        "reviewOutcomeCount": review_outcomes,
        "annotationCount": annotations,
    }


def parent_cte(programme: dict[str, Any]) -> str:
    return """WITH parent AS (\n    SELECT id FROM skillup_dev.programmes\n    WHERE lower(trim(discipline)) = {discipline}\n      AND lower(trim(name)) = {name}\n    ORDER BY id\n    LIMIT 1\n)""".format(discipline=sql(str(programme["discipline"]).casefold()), name=sql(str(programme["programme"]).casefold()))


def emit_sql(programmes: list[dict[str, Any]]) -> str:
    blocks: list[str] = [
        "-- Generic source-grounded CCMAS programme curriculum contract seed.",
        "-- Apply after the Sociology contract seed and the general contract migration.",
        "-- Sociology is intentionally excluded; its reviewed seed owns its rows.",
        "-- Review-only rows are retained for staff audit but never returned to students.",
        "",
        "BEGIN;",
    ]
    for programme in programmes:
        outcomes = programme["outcomes"]
        abilities = programme["abilities"]
        if not outcomes and not abilities:
            continue
        parent = parent_cte(programme)
        blocks.append(f"-- {programme['discipline']} / {programme['programme']}")
        blocks.append(parent)
        blocks.append("DELETE FROM skillup_dev.programme_curriculum_outcomes WHERE programme_id = (SELECT id FROM parent);")
        if outcomes:
            values = ",\n".join(
                "(" + ", ".join(
                    [
                        sql(row["outcomeId"]),
                        sql(row["courseCode"]),
                        sql(row["courseTitle"]),
                        "NULL" if row["courseLevel"] is None else str(row["courseLevel"]),
                        sql(row["displayGroup"]),
                        str(row["outcomeIndex"]),
                        sql(row["sourceText"]),
                        sql(row["studentText"]),
                        json_sql(row["sourceLocator"]),
                        "TRUE" if row["studentDisplay"] else "FALSE",
                        sql(row["dataState"]),
                    ]
                ) + ")"
                for row in outcomes
            )
            blocks.extend([
                "INSERT INTO skillup_dev.programme_curriculum_outcomes",
                "(programme_id, outcome_id, course_code, course_title, course_level, display_group, outcome_index, source_text, student_text, source_locator, student_display, data_state)",
                "SELECT parent.id, rows.outcome_id, rows.course_code, rows.course_title, rows.course_level, rows.display_group, rows.outcome_index, rows.source_text, rows.student_text, rows.source_locator, rows.student_display, rows.data_state",
                "FROM parent CROSS JOIN (VALUES",
                values,
                ") AS rows(outcome_id, course_code, course_title, course_level, display_group, outcome_index, source_text, student_text, source_locator, student_display, data_state);",
            ])
        blocks.append("DELETE FROM skillup_dev.programme_abilities WHERE programme_id = (SELECT id FROM parent);")
        if abilities:
            values = ",\n".join(
                "(" + ", ".join(
                    [
                        sql(row["displayTitle"]),
                        sql(row["abilityId"]),
                        sql(row["sourceText"]),
                        sql(row["studentText"]),
                        json_sql(row["sourceLocator"]),
                        "TRUE" if row["studentDisplay"] else "FALSE",
                        sql(row["dataState"]),
                    ]
                ) + ")"
                for row in abilities
            )
            blocks.extend([
                "INSERT INTO skillup_dev.programme_abilities",
                "(programme_id, display_title, ability_id, source_text, student_text, source_locator, student_display, data_state)",
                "SELECT parent.id, rows.display_title, rows.ability_id, rows.source_text, rows.student_text, rows.source_locator, rows.student_display, rows.data_state",
                "FROM parent CROSS JOIN (VALUES",
                values,
                ") AS rows(display_title, ability_id, source_text, student_text, source_locator, student_display, data_state);",
            ])
    blocks.extend(["COMMIT;", ""])
    return "\n".join(blocks)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--audit-out", type=Path, default=AUDIT_OUT)
    args = parser.parse_args()
    reviews = load_review()
    programmes: list[dict[str, Any]] = []
    skipped_sociology = 0
    for source_path in sorted(CCMAS_DIR.glob("*.json")):
        payload = json.loads(source_path.read_text(encoding="utf-8"))
        for programme in payload.get("programmes") or []:
            if norm(payload.get("discipline")) == "social sciences" and norm(programme.get("name")) == "sociology":
                skipped_sociology += 1
                continue
            programmes.append(build_programme(source_path.name, payload, programme, reviews))
    sql_text = emit_sql(programmes)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(sql_text, encoding="utf-8")
    audit = {
        "schemaVersion": 1,
        "generatedOn": date.today().isoformat(),
        "contractName": "generic_ccmas_programme_curriculum_guidance",
        "sourcePolicy": "Course-scoped CCMAS outcomes are student-facing only when the original-source reconciliation is source_backed. Review-only rows remain in the seed for staff audit but are filtered from the student API. Legacy skills_profile arrays and generic employability prose do not define curriculum outcomes.",
        "programmeCount": len(programmes),
        "sociologyExcluded": skipped_sociology,
        "courseCount": sum(item["courseCount"] for item in programmes),
        "outcomeCount": sum(item["outcomeCount"] for item in programmes),
        "studentOutcomeCount": sum(item["studentOutcomeCount"] for item in programmes),
        "reviewOutcomeCount": sum(item["reviewOutcomeCount"] for item in programmes),
        "programmeAbilityCount": sum(len(item["abilities"]) for item in programmes),
        "studentAbilityCount": 0,
        "annotationCount": sum(item["annotationCount"] for item in programmes),
        "programmes": [
            {key: value for key, value in item.items() if key not in {"outcomes", "abilities"}}
            for item in programmes
        ],
        "seedPath": str(args.out),
    }
    args.audit_out.parent.mkdir(parents=True, exist_ok=True)
    args.audit_out.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in audit.items() if key not in {"programmes"}}, indent=2))


if __name__ == "__main__":
    main()
