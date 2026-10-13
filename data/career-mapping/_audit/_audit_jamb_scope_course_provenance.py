"""Measure source/provenance completeness in generated JAMB curriculum scopes.

This is a traceability audit, not a decision that an uncited course is wrong.
It reports course occurrences and de-duplicated CCMAS/custom course keys that
do not retain a URL, locator, and access date in the materialized scope.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"
OUTPUT = ROOT / "_audit" / "jamb_scope_course_provenance_audit_2026-09-26.json"
CITATION_FIELDS = ("source_url", "source_locator", "source_accessed_on")


def complete_citation(course: dict) -> bool:
    return all(course.get(field) for field in CITATION_FIELDS)


def main() -> None:
    scopes = json.loads(INPUT.read_text(encoding="utf-8"))
    rows = scopes.get("rows", [])
    occurrences: list[tuple[str, dict]] = [
        (row.get("jamb_name", ""), course)
        for row in rows
        for course in row.get("selected_courses", [])
    ]

    grouped: dict[tuple, list[dict]] = defaultdict(list)
    for _, course in occurrences:
        key = (
            course.get("source_ccmas_file"),
            course.get("source_ccmas_programme"),
            course.get("code"),
            course.get("title"),
        )
        grouped[key].append(course)

    missing_by_jamb: Counter[str] = Counter()
    total_by_jamb: Counter[str] = Counter()
    for jamb_name, course in occurrences:
        total_by_jamb[jamb_name] += 1
        if not complete_citation(course):
            missing_by_jamb[jamb_name] += 1

    unique_without_citation = [
        {
            "source_ccmas_file": key[0],
            "source_ccmas_programme": key[1],
            "code": key[2],
            "title": key[3],
            "occurrence_count": len(courses),
            "jamb_names": sorted({name for name, course in occurrences if course in courses}),
        }
        for key, courses in grouped.items()
        if not any(complete_citation(course) for course in courses)
    ]

    report = {
        "schema_version": 1,
        "audit_date": "2026-09-26",
        "input": str(INPUT.relative_to(ROOT)),
        "scope": "selected course records materialized for the 420 canonical JAMB identities; does not assert course correctness",
        "citation_fields_required": list(CITATION_FIELDS),
        "jamb_identity_count": len(rows),
        "identity_rows_without_any_scope_evidence": [
            row.get("jamb_name") for row in rows if not row.get("scope_evidence")
        ],
        "selected_course_occurrences": len(occurrences),
        "selected_course_occurrences_without_complete_citation": sum(
            not complete_citation(course) for _, course in occurrences
        ),
        "unique_course_keys": len(grouped),
        "unique_course_keys_without_any_complete_citation": len(unique_without_citation),
        "unique_keys_missing_source_ccmas_file": sum(not key[0] for key in grouped),
        "unique_keys_missing_source_ccmas_programme": sum(not key[1] for key in grouped),
        "missing_course_citation_by_jamb_identity": [
            {
                "jamb_name": name,
                "selected_course_count": total_by_jamb[name],
                "missing_complete_citation_count": count,
            }
            for name, count in sorted(missing_by_jamb.items())
        ],
        "unique_course_keys_without_citation": unique_without_citation,
        "decision": "Traceability gap only; investigate source records and linked package locators before deciding whether any course data is incorrect or unsupported.",
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "unique_course_keys_without_citation" and key != "missing_course_citation_by_jamb_identity"}, ensure_ascii=False, indent=2))
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    main()
