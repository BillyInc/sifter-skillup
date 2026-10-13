"""Verify Sociology CCMAS printed-page locators against extracted original PDF text.

The extracted source retains form-feed page boundaries and printed footer
numbers. Course section page spans are derived from the heading sequence in the
Sociology curriculum section (printed pages 322-339), not neighbouring
programme schedules. Use --apply only after reviewing the generated audit.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
SOURCE_JSON = ROOT / "data/career-mapping/ccmas/social_sciences.json"
SOURCE_TEXT = ROOT / "data/career-mapping/_audit/ccmas_original_source_text_2026-09-29/social_sciences.txt"
AUDIT_JSON = ROOT / "data/career-mapping/_audit/sociology_course_locator_audit_2026_10_08.json"
PROGRAMME = "Sociology"
SECTION_START = 322
SECTION_END = 339


def printed_page(text: str) -> int | None:
    matches = re.findall(r"(?m)^\s*Social Sciences\s+(\d+)\s*$", text)
    return int(matches[-1]) if matches else None


def course_heading_pattern(code: str) -> re.Pattern[str]:
    escaped = re.escape(code).replace(r"\ ", r"\s+")
    return re.compile(rf"(?im)^\s*{escaped}\s*[:：]\s*")


def page_text_by_printed_number(source_text: str) -> dict[int, str]:
    result: dict[int, str] = {}
    for page in source_text.split("\f"):
        number = printed_page(page)
        if number is not None:
            result[number] = page
    return result


def locator(code: str, start: int, end: int) -> str:
    if start == end:
        page_text = f"p. {start}"
    else:
        # Use an ASCII hyphen in generated transport locators so a legacy
        # Windows console cannot turn the en dash into mojibake.
        page_text = f"pp. {start}-{end}"
    return (
        "Original CCMAS source: Sociology; "
        f"{code}; "
        f"Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed {page_text}"
    )


def derive(canonical: dict[str, Any], source_text: str) -> dict[str, Any]:
    programmes = canonical.get("programmes", [])
    programme = next((p for p in programmes if p.get("name") == PROGRAMME), None)
    if programme is None:
        raise ValueError("Sociology programme not found in canonical CCMAS JSON")

    page_map = page_text_by_printed_number(source_text)
    missing_pages = [n for n in range(SECTION_START, SECTION_END + 1) if n not in page_map]
    if missing_pages:
        raise ValueError(f"Missing extracted PDF pages: {missing_pages}")

    courses = programme.get("courses", [])
    headings: list[dict[str, Any]] = []
    for course in courses:
        code = str(course.get("code") or "").strip()
        pattern = course_heading_pattern(code)
        occurrences: list[int] = []
        for number in range(SECTION_START, SECTION_END + 1):
            if pattern.search(page_map[number]):
                occurrences.append(number)
        if len(occurrences) != 1:
            raise ValueError(f"Expected exactly one detail heading for {code}; found {occurrences}")
        headings.append({"code": code, "title": course.get("title"), "start": occurrences[0], "course": course})

    headings.sort(key=lambda row: (row["start"], next(
        match.start()
        for match in course_heading_pattern(row["code"]).finditer(page_map[row["start"]])
    )))

    # The detailed course contents run until the following course heading.
    # If the next heading begins on a later page, the current course text may
    # continue above that heading on the same page, so include that page.
    for index, row in enumerate(headings):
        end = headings[index + 1]["start"] if index + 1 < len(headings) else SECTION_END
        if end < row["start"]:
            raise ValueError(f"Non-monotonic page sequence at {row['code']}")
        row["end"] = end
        row["expected_locator"] = locator(row["code"], row["start"], end)
        row["current_locator"] = row["course"].get("source_locator")
        row["matches"] = row["current_locator"] == row["expected_locator"]

    soc301 = next((row["course"] for row in headings if row["code"] == "SOC 301"), None)
    title_variants = (soc301 or {}).get("source_title_variants") or {}
    title_reconciliation_recorded = (
        title_variants.get("programme_schedule") == "Methods of Social Research & Statistics"
        and title_variants.get("detailed_course_section") == "Methods for Social Research"
        and bool(str(title_variants.get("resolution") or "").strip())
    )

    return {
        "date": "2026-10-08",
        "status": "source_text_page-boundary_audit",
        "authority": str(SOURCE_TEXT.relative_to(ROOT)).replace("\\", "/"),
        "originalPdf": "Social-Sciences-CCMAS-FINAL-2023-A.pdf",
        "printedPageSection": [SECTION_START, SECTION_END],
        "programme": PROGRAMME,
        "courseCount": len(headings),
        "allCourseHeadingsUnique": True,
        "allCurrentLocatorsMatch": all(row["matches"] for row in headings),
        "soc301TitleReconciliationRecorded": title_reconciliation_recorded,
        "courses": [
            {key: row[key] for key in ("code", "title", "start", "end", "current_locator", "expected_locator", "matches")}
            for row in headings
        ],
    }, headings


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write derived Sociology course locators into the source JSON")
    args = parser.parse_args()

    canonical = json.loads(SOURCE_JSON.read_text(encoding="utf-8"))
    source_text = SOURCE_TEXT.read_text(encoding="utf-8")
    audit, rows = derive(canonical, source_text)

    AUDIT_JSON.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.apply:
        programme = next(p for p in canonical["programmes"] if p.get("name") == PROGRAMME)
        for row in rows:
            row["course"]["source_locator"] = row["expected_locator"]
        SOURCE_JSON.write_text(json.dumps(canonical, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "audit": str(AUDIT_JSON),
        "sourceJson": str(SOURCE_JSON),
        "courses": audit["courseCount"],
        "currentMatches": sum(row["matches"] for row in rows),
        "wouldCorrect": sum(not row["matches"] for row in rows),
        "soc301TitleReconciliationRecorded": audit["soc301TitleReconciliationRecorded"],
        "applied": args.apply,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
