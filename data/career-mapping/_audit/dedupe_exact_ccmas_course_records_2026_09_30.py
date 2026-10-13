"""Remove only exact duplicate CCMAS course records and selected snapshots."""

from __future__ import annotations

import argparse
import copy
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "dedupe_exact_ccmas_course_records_2026-09-30.json"
REPORT_MD = AUDIT / "dedupe_exact_ccmas_course_records_2026-09-30.md"

COURSE_FIELDS = (
    "level", "code", "title", "units", "status", "lh", "ph", "flags",
    "content_summary", "skills_learned",
)
SELECTED_FIELDS = (
    "source_ccmas_file", "source_ccmas_programme", "code", "title", "units",
    "status", "lecture_hours", "practical_hours", "content_summary",
    "learning_outcomes", "scope_facet",
)


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def signature(row: dict[str, Any], fields: tuple[str, ...]) -> str:
    return json.dumps({field: row.get(field) for field in fields}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def dedupe_rows(rows: list[dict[str, Any]], fields: tuple[str, ...]) -> tuple[list[dict[str, Any]], int]:
    seen: set[str] = set()
    retained: list[dict[str, Any]] = []
    removed = 0
    for row in rows:
        key = signature(row, fields)
        if key in seen:
            removed += 1
            continue
        seen.add(key)
        retained.append(row)
    return retained, removed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    package_changes: list[dict[str, Any]] = []
    package_duplicates_remaining: list[dict[str, Any]] = []
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = load(path)
        for programme in document.get("programmes", []):
            before = len(programme.get("courses", []))
            retained, removed = dedupe_rows(programme.get("courses", []), COURSE_FIELDS)
            if removed:
                package_changes.append({"source_file": path.name, "programme": programme.get("name"), "removed": removed, "before": before, "after": len(retained)})
                if args.apply:
                    programme["courses"] = retained
            # Record remaining same-code groups, including legitimate-looking
            # distinct titles, instead of silently deleting them.
            by_code: dict[str, list[dict[str, Any]]] = {}
            for course in retained:
                by_code.setdefault(str(course.get("code") or ""), []).append(course)
            for code, rows in by_code.items():
                if code and len(rows) > 1:
                    package_duplicates_remaining.append({"source_file": path.name, "programme": programme.get("name"), "code": code, "titles": [row.get("title") for row in rows], "count": len(rows)})
        if args.apply and any(change["source_file"] == path.name for change in package_changes):
            path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    scope_changes: list[dict[str, Any]] = []
    scopes = load(SCOPES)
    for scope in scopes.get("rows", []):
        before = len(scope.get("selected_courses", []))
        retained, removed = dedupe_rows(scope.get("selected_courses", []), SELECTED_FIELDS)
        if removed:
            scope_changes.append({"jamb_name": scope.get("jamb_name"), "removed": removed, "before": before, "after": len(retained)})
            if args.apply:
                scope["selected_courses"] = retained
    if args.apply and scope_changes:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "2026-09-30.exact-ccmas-course-deduplication.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "rule": "Only exact course-record signatures are deduplicated; same-code rows with different title, workload, content, or outcomes remain preserved.",
        "package_groups_changed": len(package_changes),
        "package_rows_removed": sum(row["removed"] for row in package_changes),
        "scope_rows_changed": len(scope_changes),
        "scope_rows_removed": sum(row["removed"] for row in scope_changes),
        "remaining_same_code_groups": len(package_duplicates_remaining),
        "package_changes": package_changes,
        "scope_changes": scope_changes,
        "remaining_same_code": package_duplicates_remaining,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join([
            "# Exact CCMAS course-record deduplication — 2026-09-30",
            "",
            f"- Mode: **{report['mode']}**",
            f"- Package groups changed: **{report['package_groups_changed']}**",
            f"- Package rows removed: **{report['package_rows_removed']}**",
            f"- JAMB scope rows changed: **{report['scope_rows_changed']}**",
            f"- JAMB scope rows removed: **{report['scope_rows_removed']}**",
            f"- Remaining same-code groups with distinct records: **{report['remaining_same_code_groups']}**",
            "",
            "Only exact duplicate records were removed; distinct source titles and workloads remain for evidence review.",
            "",
        ]),
        encoding="utf-8",
    )
    print(json.dumps({"json": str(REPORT), "markdown": str(REPORT_MD), "mode": report["mode"], "package_rows_removed": report["package_rows_removed"], "scope_rows_removed": report["scope_rows_removed"], "remaining_same_code_groups": report["remaining_same_code_groups"]}, indent=2))


if __name__ == "__main__":
    main()
