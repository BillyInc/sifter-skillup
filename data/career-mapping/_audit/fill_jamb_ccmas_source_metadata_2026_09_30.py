"""Fill missing document-level source metadata on CCMAS-backed JAMB rows."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
CCMAS_DIR = ROOT / "ccmas"
REPORT = AUDIT / "fill_jamb_ccmas_source_metadata_2026-09-30.json"
REPORT_MD = AUDIT / "fill_jamb_ccmas_source_metadata_2026-09-30.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def package_courses() -> dict[tuple[str, str], set[str]]:
    result: dict[tuple[str, str], set[str]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = load(path)
        for programme in document.get("programmes", []):
            result[(path.name, str(programme.get("name") or ""))] = {
                str(course.get("code") or "") for course in programme.get("courses", [])
            }
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    scopes = load(SCOPES)
    packages = package_courses()
    changes: list[dict[str, Any]] = []
    skipped = Counter()
    access_date = date.today().isoformat()
    for scope in scopes.get("rows", []):
        for course in scope.get("selected_courses", []):
            source_file = str(course.get("source_ccmas_file") or "")
            programme = str(course.get("source_ccmas_programme") or "")
            code = str(course.get("code") or "")
            if not source_file or not programme:
                continue
            source_url = CCMAS_SOURCE_URLS.get(source_file)
            if not source_url:
                skipped["no_known_ccmas_source_url"] += 1
                continue
            if (source_file, programme) not in packages or code not in packages[(source_file, programme)]:
                skipped["source_package_or_course_not_found"] += 1
                continue
            updates: dict[str, Any] = {}
            if not course.get("source_url"):
                updates["source_url"] = source_url
            if not course.get("source_locator"):
                updates["source_locator"] = f"Original CCMAS PDF package section: {programme}; course code {code}"
            if not course.get("source_accessed_on"):
                updates["source_accessed_on"] = access_date
            if not updates:
                continue
            changes.append({
                "jamb_name": scope.get("jamb_name"),
                "source_file": source_file,
                "source_programme": programme,
                "course_code": code,
                "fields": sorted(updates),
            })
            if args.apply:
                course.update(updates)

    if args.apply:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    field_counts = Counter(field for change in changes for field in change["fields"])
    report = {
        "schema": "2026-09-30.jamb-ccmas-source-metadata-fill.v1",
        "generated_on": access_date,
        "mode": "apply" if args.apply else "dry_run",
        "rule": "Only selected rows resolving to a known local CCMAS package/course receive document-level source metadata; existing values are preserved.",
        "scope_file": str(SCOPES),
        "rows_changed": len(changes),
        "field_counts": dict(sorted(field_counts.items())),
        "skipped": dict(sorted(skipped.items())),
        "changes": changes,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "\n".join([
            "# JAMB↔CCMAS source metadata fill — 2026-09-30",
            "",
            f"- Mode: **{report['mode']}**",
            f"- Selected rows changed: **{report['rows_changed']}**",
            *[f"- `{field}`: **{count}**" for field, count in sorted(field_counts.items())],
            "",
            "This fills document-level provenance only; it does not fabricate course content or page-level evidence.",
            "",
        ]),
        encoding="utf-8",
    )
    print(json.dumps({"json": str(REPORT), "markdown": str(REPORT_MD), "mode": report["mode"], "rows_changed": report["rows_changed"], "field_counts": report["field_counts"]}, indent=2))


if __name__ == "__main__":
    main()
