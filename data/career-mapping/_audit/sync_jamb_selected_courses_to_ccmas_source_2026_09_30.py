"""Guardedly synchronize selected JAMB CCMAS rows from unique local sources."""

from __future__ import annotations

import argparse
import copy
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import resolve_course_source_row


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "sync_jamb_selected_courses_to_ccmas_source_2026-09-30.json"
REPORT_MD = AUDIT / "sync_jamb_selected_courses_to_ccmas_source_2026-09-30.md"

FIELD_MAP = {
    "title": "title",
    "units": "units",
    "status": "status",
    "lecture_hours": "lh",
    "practical_hours": "ph",
    "content_summary": "content_summary",
    "learning_outcomes": "skills_learned",
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").casefold().split())


def same(left: Any, right: Any) -> bool:
    if isinstance(left, list) or isinstance(right, list):
        return left == right
    if isinstance(left, str) or isinstance(right, str):
        return norm(left) == norm(right)
    return left == right


def package_registry() -> dict[tuple[str, str, str], list[dict[str, Any]]]:
    result: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = load(path)
        for programme in document.get("programmes", []):
            for course in programme.get("courses", []):
                key = (path.name, str(programme.get("name") or ""), norm(course.get("code")))
                result.setdefault(key, []).append(course)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    scopes = load(SCOPES)
    source_index = package_registry()
    changes: list[dict[str, Any]] = []
    skipped = Counter()
    for scope in scopes.get("rows", []):
        for selected in scope.get("selected_courses", []):
            source_file = selected.get("source_ccmas_file")
            programme = selected.get("source_ccmas_programme")
            code = selected.get("code")
            if not source_file or not programme:
                continue
            candidates = source_index.get((str(source_file), str(programme), norm(code)), [])
            source = resolve_course_source_row(selected, candidates)
            if source is None:
                skipped["ambiguous_or_missing_source_course"] += 1
                continue
            field_changes: list[dict[str, Any]] = []
            for selected_field, source_field in FIELD_MAP.items():
                before = copy.deepcopy(selected.get(selected_field))
                after = copy.deepcopy(source.get(source_field))
                if after in (None, "", []):
                    skipped[f"empty_source_{selected_field}"] += 1
                    continue
                if same(before, after):
                    continue
                field_changes.append({"field": selected_field, "before": before, "after": after})
                if args.apply:
                    selected[selected_field] = after
            if field_changes:
                changes.append({
                    "jamb_name": scope.get("jamb_name"),
                    "source_file": source_file,
                    "source_programme": programme,
                    "course_code": code,
                    "fields": field_changes,
                })

    if args.apply:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    field_counts = Counter(field["field"] for change in changes for field in change["fields"])
    report = {
        "schema": "2026-09-30.jamb-selected-ccmas-source-sync.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "rule": "Only unique source package/course matches are synchronized; empty source fields never erase selected values.",
        "scope_file": str(SCOPES),
        "selected_rows_changed": len(changes),
        "field_changes": sum(len(change["fields"]) for change in changes),
        "field_counts": dict(sorted(field_counts.items())),
        "skipped": dict(sorted(skipped.items())),
        "changes": changes,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join([
            "# JAMB selected-course CCMAS source sync — 2026-09-30",
            "",
            f"- Mode: **{report['mode']}**",
            f"- Selected rows changed: **{report['selected_rows_changed']}**",
            f"- Field changes: **{report['field_changes']}**",
            "",
            "Only unique local CCMAS package/course matches were synchronized; empty source values were never used to erase selected data.",
            "",
        ]),
        encoding="utf-8",
    )
    print(json.dumps({"json": str(REPORT), "markdown": str(REPORT_MD), "mode": report["mode"], "selected_rows_changed": report["selected_rows_changed"], "field_changes": report["field_changes"], "field_counts": report["field_counts"]}, indent=2))


if __name__ == "__main__":
    main()
