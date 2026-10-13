"""Build a source-traceability ledger for Sociology programme theme narration.

This is a structural evidence audit, not an academic approval shortcut.  It
links the explicit presentation map and learner-facing theme narration to the
course summaries, outcomes and printed CCMAS locators in the regenerated
programme contract.  It deliberately does not infer domain, area or role
requirements from the programme curriculum.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
THEME_SOURCE = ROOT / "src" / "components" / "careerIntelligence" / "DegreeSkills.tsx"
MAP_SOURCE = ROOT / "src" / "components" / "careerIntelligence" / "programmeCurriculumThemes.ts"
CONTRACT = ROOT / "data" / "career-mapping" / "_audit" / "sociology_curriculum_contract_2026-09-17.json"
OUT = ROOT / "data" / "career-mapping" / "_audit" / "sociology_programme_theme_narration_audit_2026_10_08.json"


def parse_string(value: str) -> str:
    """Decode the small JSON-compatible string literals used in the TS file."""
    return json.loads(value)


def parse_theme_meta(source: str) -> dict[str, dict[str, str]]:
    block = source.split("const THEME_META", 1)[1].split("const SOCIOLOGY_THEME_NARRATION:", 1)[0]
    pattern = re.compile(
        r'^\s*(\w+): \{ key: "([^"]+)", title: "((?:\\.|[^"\\])*)".*?description: "((?:\\.|[^"\\])*)" \},?$',
        re.MULTILINE,
    )
    return {
        key: {"themeKey": theme_key, "title": parse_string(f'"{title}"'), "description": parse_string(f'"{description}"')}
        for key, theme_key, title, description in pattern.findall(block)
    }


def parse_narration(source: str) -> dict[str, str]:
    block = source.split("const SOCIOLOGY_THEME_NARRATION:", 1)[1].split("function outcomeAction", 1)[0]
    pattern = re.compile(r'^\s*(\w+):\s*((?:"(?:\\.|[^"\\])*")|(?:`(?:\\.|[^`\\])*`)),?\s*$', re.MULTILINE)
    result: dict[str, str] = {}
    for key, literal in pattern.findall(block):
        result[key] = parse_string(literal) if literal.startswith('"') else literal[1:-1]
    return result


def parse_course_map(source: str) -> dict[str, str]:
    block = source.split("SOCIOLOGY_REVIEWED_THEME_BY_CODE:", 1)[1].split("};", 1)[0]
    return dict(re.findall(r'^\s*"([^"]+)":\s*"([^"]+)",?$', block, re.MULTILINE))


def build() -> dict[str, Any]:
    source = THEME_SOURCE.read_text(encoding="utf-8")
    map_source = MAP_SOURCE.read_text(encoding="utf-8")
    contract = json.loads(CONTRACT.read_text(encoding="utf-8"))
    meta = parse_theme_meta(source)
    narration = parse_narration(source)
    course_map = parse_course_map(map_source)
    courses = {str(course.get("code")): course for course in contract["programme"]["courses"]}
    active_keys = sorted(set(course_map.values()))
    themes: list[dict[str, Any]] = []
    errors: list[str] = []

    for theme_key in active_keys:
        course_codes = [code for code, assigned in course_map.items() if assigned == theme_key]
        anchors: list[dict[str, Any]] = []
        for code in course_codes:
            course = courses.get(code)
            if not course:
                errors.append(f"theme {theme_key} references missing course {code}")
                continue
            locator = course.get("sourceLocator") or {}
            anchors.append({
                "courseCode": code,
                "courseTitle": course.get("title"),
                "contentSummary": course.get("contentSummary"),
                "outcomeCount": len(course.get("outcomes") or []),
                "sourceLocatorText": locator.get("sourceLocatorText"),
                "originalPdf": locator.get("originalPdf"),
                "printedPages": locator.get("sourceLocatorText"),
            })
        if theme_key not in meta:
            errors.append(f"theme {theme_key} has no theme metadata")
        if not str(narration.get(theme_key) or "").strip():
            errors.append(f"theme {theme_key} has no learner-facing narration")
        if not anchors:
            errors.append(f"theme {theme_key} has no course evidence anchor")
        themes.append({
            "themeKey": theme_key,
            "title": (meta.get(theme_key) or {}).get("title"),
            "themeDescription": (meta.get(theme_key) or {}).get("description"),
            "narration": narration.get(theme_key),
            "courseCodes": course_codes,
            "courseAnchors": anchors,
            "evidenceBasis": "Course title, content summary, outcomes and printed CCMAS locator; theme grouping is presentation-only.",
            "studentCopyStatus": "local_structural_review",
        })

    return {
        "audit": "sociology_programme_theme_narration_traceability",
        "reviewedOn": "2026-10-08",
        "status": "local_evidence_alignment_audit",
        "scope": "Sociology programme overview only; no domain, area, role or matcher inference",
        "sourceContract": str(CONTRACT.relative_to(ROOT)).replace("\\", "/"),
        "themeSource": str(THEME_SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "courseMapSource": str(MAP_SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "courseMapCount": len(course_map),
        "contractCourseCount": len(courses),
        "activeThemeCount": len(active_keys),
        "themeCountWithNarration": sum(bool(str(narration.get(key) or "").strip()) for key in active_keys),
        "themeCountWithCourseEvidence": sum(any(item["themeKey"] == key and item["courseAnchors"] for item in themes) for key in active_keys),
        "errors": errors,
        "pass": not errors and len(course_map) == len(courses),
        "themes": themes,
    }


def main() -> None:
    result = build()
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUT),
        "courseMapCount": result["courseMapCount"],
        "contractCourseCount": result["contractCourseCount"],
        "activeThemeCount": result["activeThemeCount"],
        "themeCountWithNarration": result["themeCountWithNarration"],
        "themeCountWithCourseEvidence": result["themeCountWithCourseEvidence"],
        "pass": result["pass"],
        "errors": result["errors"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
