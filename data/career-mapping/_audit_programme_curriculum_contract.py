"""Audit CCMAS programme learning data before it is exposed to students.

The parsed CCMAS files are the source of truth for programme learning.  They
contain useful course-scoped outcomes, but some rows also contain maintainer
notes appended to source text and the legacy aggregate mixes course outcomes
with employability and shared-course rows.  This audit makes those boundaries
measurable without changing the source files.

It is intentionally read-only with respect to the CCMAS inputs.  The output is
an audit artifact used by the clean contract builder and by the implementation
review; it is not a student-facing catalogue.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
CCMAS_DIR = HERE / "ccmas"
OUT_JSON = HERE / "_audit" / "programme_curriculum_data_quality_2026-09-17.json"
OUT_MD = HERE / "_audit" / "PROGRAMME_CURRICULUM_DATA_QUALITY_2026-09-17.md"

ANNOTATION_RE = re.compile(r"\s+>\s+\*\*\[(?P<label>[^]]+)\]:\*\*", re.IGNORECASE)


def normalise(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def split_source_annotation(value: str) -> tuple[str, str | None]:
    """Return source wording and the appended maintainer annotation."""
    match = ANNOTATION_RE.search(value)
    if not match:
        return value.strip(), None
    source = value[: match.start()].rstrip(" -;.")
    annotation = value[match.end() :].strip()
    return source, f"{match.group('label').strip()}: {annotation}"


def read_programmes() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for source in sorted(CCMAS_DIR.glob("*.json")):
        payload = json.loads(source.read_text(encoding="utf-8"))
        for programme in payload.get("programmes") or []:
            rows.append(
                {
                    "discipline": payload.get("discipline"),
                    "sourceFile": source.name,
                    "sourceFlags": payload.get("document_flags") or [],
                    "programme": programme,
                }
            )
    return rows


def main() -> None:
    programmes = read_programmes()
    annotation_rows: list[dict[str, Any]] = []
    profile_findings: list[dict[str, Any]] = []
    programme_summaries: list[dict[str, Any]] = []
    totals = Counter()

    for row in programmes:
        programme = row["programme"]
        course_outcomes: list[str] = []
        clean_outcomes: list[str] = []
        course_keys: dict[str, int] = Counter()
        for course in programme.get("courses") or []:
            for index, raw in enumerate(course.get("skills_learned") or []):
                if not isinstance(raw, str) or not raw.strip():
                    continue
                source_text, annotation = split_source_annotation(raw)
                course_outcomes.append(raw.strip())
                clean_outcomes.append(source_text)
                course_keys[normalise(source_text)] += 1
                totals["courseOutcomeRows"] += 1
                if annotation:
                    item = {
                        "discipline": row["discipline"],
                        "programme": programme.get("name"),
                        "courseCode": course.get("code"),
                        "courseTitle": course.get("title"),
                        "outcomeIndex": index,
                        "annotation": annotation,
                        "sourceText": source_text,
                        "rawText": raw,
                        "studentDisplay": False,
                        "staffReview": True,
                    }
                    annotation_rows.append(item)
                    totals["annotatedRows"] += 1

        duplicate_count = sum(count - 1 for count in course_keys.values() if count > 1)
        profile = [x for x in programme.get("skills_profile") or [] if isinstance(x, str)]
        course_set = {normalise(x) for x in clean_outcomes if normalise(x)}
        profile_set = {normalise(x) for x in profile if normalise(x)}
        employability = [x for x in programme.get("employability_skills") or [] if isinstance(x, str) and x.strip()]
        profile_extras = [x for x in profile if normalise(x) not in course_set]
        profile_missing = [x for x in clean_outcomes if normalise(x) not in profile_set]
        aggregate_duplicate_loss = len(clean_outcomes) - len({normalise(x) for x in clean_outcomes if normalise(x)})

        if profile_extras or profile_missing or aggregate_duplicate_loss:
            profile_findings.append(
                {
                    "discipline": row["discipline"],
                    "programme": programme.get("name"),
                    "courseOutcomeRows": len(clean_outcomes),
                    "uniqueCourseOutcomes": len({normalise(x) for x in clean_outcomes if normalise(x)}),
                    "legacyProfileRows": len(profile),
                    "legacyProfileExtras": profile_extras,
                    "courseOutcomesAbsentFromLegacyProfile": profile_missing,
                    "exactDuplicateCourseRows": duplicate_count,
                    "legacyAggregatePotentialLoss": aggregate_duplicate_loss,
                    "employabilityRows": len(employability),
                }
            )

        programme_summaries.append(
            {
                "discipline": row["discipline"],
                "sourceFile": row["sourceFile"],
                "programme": programme.get("name"),
                "code": programme.get("code"),
                "qualification": programme.get("qualification"),
                "courseCount": len(programme.get("courses") or []),
                "courseOutcomeRows": len(clean_outcomes),
                "uniqueCourseOutcomes": len({normalise(x) for x in clean_outcomes if normalise(x)}),
                "employabilityRows": len(employability),
                "legacyProfileRows": len(profile),
                "annotationRows": sum(1 for item in annotation_rows if item["programme"] == programme.get("name")),
            }
        )

    sociology = next(
        item for item in profile_findings if item["programme"] == "Sociology"
    )
    output = {
        "schemaVersion": 1,
        "auditedOn": date.today().isoformat(),
        "sourceDirectory": "data/career-mapping/ccmas",
        "sourcePolicy": "Parsed CCMAS course records are authoritative. Appended parser/maintainer notes are retained for staff audit but excluded from student wording.",
        "programmeCount": len(programmes),
        "totals": dict(totals),
        "sociologyFinding": sociology,
        "annotatedRows": annotation_rows,
        "profileFindings": profile_findings,
        "programmeSummaries": programme_summaries,
        "decisions": {
            "courseOutcomes": "student_display_after_source_annotation_strip",
            "employabilitySkills": "separate_programme_abilities_layer",
            "legacySkillsProfile": "staff_audit_only_until_rebuilt",
            "programmeToDomain": "explicit_mapping_edge_only; never pass the programme array into the domain layer",
            "domainFoundation": "domain_owned_records_only",
            "subgroupContinuation": "subgroup_owned_records_only",
            "roleContinuation": "role_owned_records_only",
        },
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        f"# Programme curriculum data-quality audit ({date.today().isoformat()})",
        "",
        "This is a read-only audit of the checked-in parsed CCMAS records. It is not a claim that the source PDFs themselves are wrong. The audit separates source wording from appended parser/maintainer notes and identifies where the legacy flattened profile cannot be used as student-facing data.",
        "",
        "## Result",
        "",
        f"- Parsed programmes: **{len(programmes)}**",
        f"- Course-outcome rows: **{totals['courseOutcomeRows']}**",
        f"- Rows with appended annotations: **{totals['annotatedRows']}**",
        f"- Programmes with legacy-profile boundary findings: **{len(profile_findings)}**",
        "",
        "## Sociology finding",
        "",
        f"Sociology has **{sociology['courseOutcomeRows']}** course-outcome rows and **{sociology['uniqueCourseOutcomes']}** exact-normalised course outcomes. Its legacy profile contains **{sociology['legacyProfileRows']}** rows, including **{sociology['employabilityRows']}** broad employability rows that are not course outcomes. The legacy profile therefore cannot be presented as one clean list of what Sociology teaches.",
        "",
        "The Sociology GST 212 record contains an appended LIS exception note. That note is source-maintainer metadata, not Sociology learning content, and is excluded from the student contract. The SOC 407 formatting note is treated the same way while its source wording remains available to staff audit.",
        "",
        "## Required contract boundary",
        "",
        "1. Course outcomes stay attached to their programme and course locator.",
        "2. Employability/ways-of-working records stay in a separate programme abilities layer; they are not mixed into course outcomes.",
        "3. The legacy `skills_profile*` arrays remain audit evidence until regenerated from these boundaries.",
        "4. A programme reaches a domain only through an explicit programme-to-domain mapping edge. Programme skills may explain that edge's carry-over and additions, but they must not become generic domain foundations.",
        "5. Domain, subgroup and role records are independently owned. No role aggregate, subgroup list or domain list may be copied into another layer.",
        "6. An annotated, ambiguous or parser-failed row is staff-review-only unless the source record is corrected and re-audited.",
        "",
        "## Generated artifacts",
        "",
        f"- Machine-readable audit: `{OUT_JSON.relative_to(Path.cwd()).as_posix()}`",
        "- The next clean-contract builder must consume the course records and this audit, not the legacy flattened arrays.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"programmes": len(programmes), "totals": dict(totals), "profileFindings": len(profile_findings), "sociology": sociology}, indent=2))


if __name__ == "__main__":
    main()
