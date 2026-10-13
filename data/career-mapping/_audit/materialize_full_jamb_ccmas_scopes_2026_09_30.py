"""Materialize declared full CCMAS curricula into empty JAMB scope rows.

This is a deterministic repair for the narrow invariant:
``single_ccmas_full_curriculum`` + ``scope_status == full`` + one resolvable
CCMAS component + no selected courses.  It copies the exact local CCMAS
course rows and attaches the corresponding official CCMAS PDF URL.  It does
not infer partial scopes, combined curricula, domain links, or roles.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "materialize_full_jamb_ccmas_scopes_2026-09-30.json"
REPORT_MD = AUDIT / "materialize_full_jamb_ccmas_scopes_2026-09-30.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def package_registry() -> dict[tuple[str, str], dict[str, Any]]:
    result: dict[tuple[str, str], dict[str, Any]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = load(path)
        for programme in document.get("programmes", []):
            result[(path.name, str(programme.get("name") or ""))] = programme
            # Scope component refs use the human-readable CCMAS discipline,
            # while the local package key uses the JSON filename. Store both
            # forms so the resolver never relies on filename guessing.
            result[(str(document.get("discipline") or ""), str(programme.get("name") or ""))] = {
                "_source_file": path.name,
                **programme,
            }
    return result


def selected_course(course: dict[str, Any], source_file: str, programme: str) -> dict[str, Any]:
    code = str(course.get("code") or "")
    source_url = CCMAS_SOURCE_URLS.get(source_file)
    return {
        "code": code,
        "title": course.get("title"),
        "units": course.get("units"),
        "status": course.get("status"),
        "lecture_hours": course.get("lh"),
        "practical_hours": course.get("ph"),
        "content_summary": course.get("content_summary"),
        "learning_outcomes": course.get("skills_learned") or [],
        "scope_match_terms": [],
        "scope_facet": None,
        "source_ccmas_file": source_file,
        "source_ccmas_programme": programme,
        "source_url": source_url,
        "source_locator": (
            f"Original CCMAS PDF package section: {programme}; course code {code}"
        ),
        "source_accessed_on": date.today().isoformat(),
        "skills_learned": course.get("skills_learned") or [],
        "lh": course.get("lh"),
        "ph": course.get("ph"),
    }


def eligible(scope: dict[str, Any]) -> bool:
    return bool(
        scope.get("inheritance_type") == "single_ccmas_full_curriculum"
        and scope.get("scope_status") == "full"
        and not scope.get("selected_courses")
        and len(scope.get("component_refs") or []) == 1
        and not str((scope.get("component_refs") or [""])[0]).startswith("__custom__::")
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    scopes = load(SCOPES)
    packages = package_registry()
    changes: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    for scope in scopes.get("rows", []):
        if not eligible(scope):
            continue
        component = str(scope["component_refs"][0])
        source_file, separator, programme = component.partition("::")
        package = packages.get((source_file, programme))
        if not package:
            skipped.append({"jamb_name": scope.get("jamb_name"), "component_ref": component, "reason": "component_not_found"})
            continue
        resolved_source_file = str(package.get("_source_file") or source_file)
        courses = [selected_course(course, resolved_source_file, programme) for course in package.get("courses", [])]
        if not courses:
            skipped.append({"jamb_name": scope.get("jamb_name"), "component_ref": component, "reason": "package_has_no_courses"})
            continue
        changes.append({
            "jamb_name": scope.get("jamb_name"),
            "component_ref": component,
            "resolved_source_file": resolved_source_file,
            "course_count": len(courses),
            "course_codes": [course.get("code") for course in courses],
        })
        if args.apply:
            scope["selected_courses"] = courses
            scope["scope_selection_method"] = "full_ccmas_package_materialized_from_declared_component"
            scope["scope_reason"] = "resolved CCMAS programme is inherited in full and materialized from the declared package"

    if args.apply and changes:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = Counter(course_count for change in changes for course_count in [change["course_count"]])
    report = {
        "schema": "2026-09-30.full-jamb-ccmas-scope-materialization.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "rule": "Only empty full single-CCMAS scopes with one exact local component are materialized.",
        "scope_file": str(SCOPES),
        "eligible_scope_changes": len(changes),
        "applied_scope_changes": len(changes) if args.apply else 0,
        "selected_course_rows_to_add": sum(change["course_count"] for change in changes),
        "course_count_distribution": dict(sorted((str(k), v) for k, v in counts.items())),
        "skipped": skipped,
        "changes": changes,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join([
            "# Full JAMB↔CCMAS scope materialization — 2026-09-30",
            "",
            f"- Mode: **{report['mode']}**",
            f"- Eligible full scopes: **{len(changes)}**",
            f"- Applied full scopes: **{report['applied_scope_changes']}**",
            f"- Course rows materialized: **{report['selected_course_rows_to_add']}**",
            "",
            "Only exact declared full CCMAS packages were copied. Partial, combined, custom, and unresolved scopes were not changed.",
            "",
        ]),
        encoding="utf-8",
    )
    print(json.dumps({"json": str(REPORT), "markdown": str(REPORT_MD), "mode": report["mode"], "eligible_scope_changes": len(changes), "selected_course_rows_to_add": report["selected_course_rows_to_add"]}, indent=2))


if __name__ == "__main__":
    main()
