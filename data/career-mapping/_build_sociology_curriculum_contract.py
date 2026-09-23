"""Build the reviewed Sociology programme contract from checked-in data.

This first slice is intentionally data-only.  It does not invent student
copy, domain foundations, subgroup additions or role requirements.  It keeps
the raw CCMAS source intact while producing a provenance-aware contract that a
later API migration can expose.
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
SOURCE = HERE / "ccmas" / "social_sciences.json"
MAPPING = HERE / "programme_domain_final.json"
EVIDENCE = HERE / "_audit" / "programme_domain_evidence_2026-08-17.json"
OUT = HERE / "_audit" / "sociology_curriculum_contract_2026-09-17.json"
ORIGINAL_PDF = "Social-Sciences-CCMAS-FINAL-2023-A.pdf"
ANNOTATION_RE = re.compile(r"\s+>\s+\*\*\[(?P<label>[^]]+)\]:\*\*", re.IGNORECASE)


def norm(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def split_annotation(value: str) -> tuple[str, dict[str, str] | None]:
    match = ANNOTATION_RE.search(value)
    if not match:
        return value.strip(), None
    source_text = value[: match.start()].rstrip(" -;.")
    return source_text, {
        "label": match.group("label").strip(),
        "text": value[match.end() :].strip(),
    }


def student_text(value: str) -> str:
    """Make the source phrase readable without adding a new claim.

    The contract keeps ``sourceText`` unchanged for audit.  ``studentText``
    only adds a grammatical subject/verb or expands the explicit ability and
    competence prefixes; it does not summarise, rank or infer curriculum
    content.
    """
    text = re.sub(r"\s+", " ", value).strip().rstrip(" ;")
    if not text:
        return text
    lower = text[:1].lower() + text[1:]
    if lower.startswith("ability to "):
        return f"You will build the ability to {lower[len('ability to '):]}"
    if lower.startswith("competence in "):
        return f"You will build competence in {lower[len('competence in '):]}"
    if lower.startswith("subject-specific and transferable skills"):
        return f"You will develop {lower}"
    if lower.startswith("have an overview of "):
        return f"You will gain an overview of {lower[len('have an overview of '):]}"
    if lower.startswith("have an idea of "):
        return f"You will gain an introduction to {lower[len('have an idea of '):]}"
    return f"You will learn to {lower}"


ABILITY_PRESENTATIONS: dict[str, tuple[str, str]] = {
    norm("ability to demonstrate adequate knowledge and understanding of the essentials in all the subject knowledge / areas identified"): (
        "Build your Sociology foundation",
        "You will learn the main knowledge and ideas covered across the Sociology programme.",
    ),
    norm("ability to apply such knowledge and understanding to the solution of social problems"): (
        "Apply what you learn",
        "You will learn to apply sociological knowledge to social problems.",
    ),
    norm("ability to recognise and analyse new problems and plan strategies for their solutions"): (
        "Investigate new problems",
        "You will learn to identify new problems, analyse them and plan possible solutions.",
    ),
    norm("communication skills in presenting sociological scientific research materials and arguments clearly and correctly, both orally and in writing, to a range of audiences"): (
        "Communicate your findings",
        "You will learn to present sociological research and arguments clearly in speech and writing for different audiences.",
    ),
    norm("competence in statistical and qualitative data, processing skills relating to sociological data using the computer"): (
        "Work with social research data",
        "You will learn to process statistical and qualitative data about society using a computer.",
    ),
    norm("competence in the use of information technology such as word processing, Internet communication, information retrieval through on-line computer searches and many others; and"): (
        "Use information tools",
        "You will learn to use word processing, internet communication and online searches to find and handle information.",
    ),
    norm("subject-specific and transferable skills which allow for the pursuit of a wide range of careers after graduation"): (
        "Build wider skills for future work",
        "You will develop Sociology-related and transferable skills that can support different paths after graduation.",
    ),
}


def ability_presentation(value: str) -> tuple[str, str]:
    cleaned = re.sub(r"\s+", " ", value).strip().rstrip(" ;")
    # The source ability sometimes ends with the continuation marker
    # ``; and``.  Keep the source wording intact for audit, but match the
    # source-derived presentation when that harmless parser variation occurs.
    if norm(cleaned).startswith(
        norm("competence in the use of information technology")
    ):
        return (
            "Use information tools",
            "You will learn to use word processing, internet communication and online searches to find and handle information.",
        )
    return ABILITY_PRESENTATIONS.get(norm(cleaned), ("Use what you learn", student_text(cleaned)))


def locator(course: dict[str, Any], index: int) -> dict[str, Any]:
    # ``content_summary`` is already present in the checked-in CCMAS parse.
    # Carry it with the outcome locator so the API can render a bounded,
    # course-level explanation without inventing a second summary or adding a
    # parallel curriculum table. It remains source provenance, not a new
    # curriculum claim.
    content_summary = course.get("content_summary")
    return {
        "sourceFile": "social_sciences.json",
        "parsedSource": "CCMAS_Social_Sciences_COMBINED.md",
        "originalPdf": ORIGINAL_PDF,
        "courseCode": course.get("code"),
        "courseTitle": course.get("title"),
        "level": course.get("level"),
        "courseSummary": content_summary if isinstance(content_summary, str) and content_summary.strip() else None,
        "outcomeIndex": index,
    }


def display_group(course: dict[str, Any]) -> tuple[str, str]:
    """Classify a course for presentation without changing its source meaning.

    CCMAS records the complete course set under Sociology, but it does not
    provide a student-facing grouping field.  The prefixes and course titles
    are the only checked-in signals available for this presentation layer:
    GST/ENT courses are shared university requirements, SSC courses support
    the Social Sciences programme, and the remaining records are programme
    or explicitly related discipline courses.  This is a display grouping,
    not a reassignment or removal of any curriculum row.
    """
    code = str(course.get("code") or "").strip().upper()
    if code.startswith(("GST ", "ENT ")):
        return "shared_university", "Shared university course"
    if code.startswith("SSC "):
        return "supporting_social_sciences", "Supporting Social Sciences course"
    return "sociology_programme", "Sociology programme course"


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    programme = next(item for item in source["programmes"] if item.get("name") == "Sociology")
    mapping = json.loads(MAPPING.read_text(encoding="utf-8"))
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    programme_key = "Social Sciences::Sociology"

    courses: list[dict[str, Any]] = []
    outcomes: list[dict[str, Any]] = []
    excluded_annotations: list[dict[str, Any]] = []
    for course in programme.get("courses") or []:
        group_key, group_label = display_group(course)
        course_outcomes: list[dict[str, Any]] = []
        for index, raw in enumerate(course.get("skills_learned") or []):
            if not isinstance(raw, str) or not raw.strip():
                continue
            source_text, annotation = split_annotation(raw)
            item = {
                "outcomeId": f"{course.get('code')}:{index + 1}",
                "sourceText": source_text,
                "studentText": student_text(source_text),
                "sourceLocator": locator(course, index),
                "studentDisplay": True,
                "dataState": "source_backed",
            }
            course_outcomes.append(item)
            outcomes.append(item)
            if annotation:
                excluded_annotations.append({
                    "outcomeId": item["outcomeId"],
                    "courseCode": course.get("code"),
                    "courseTitle": course.get("title"),
                    "annotation": annotation,
                    "rawText": raw,
                    "studentDisplay": False,
                    "staffReview": True,
                })
        courses.append({
            "level": course.get("level"),
            "code": course.get("code"),
            "title": course.get("title"),
            "units": course.get("units"),
            "status": course.get("status"),
            "flags": course.get("flags") or [],
            "contentSummary": course.get("content_summary"),
            "displayGroup": group_key,
            "displayGroupLabel": group_label,
            "outcomeIds": [item["outcomeId"] for item in course_outcomes],
            "outcomes": course_outcomes,
            "sourceLocator": locator(course, 0) | {"outcomeIndex": None},
        })

    abilities = [
        {
            "displayTitle": ability_presentation(value)[0],
            "abilityId": f"ability:{index + 1}",
            "sourceText": value,
            "studentText": ability_presentation(value)[1],
            "sourceLocator": {
                "sourceFile": "social_sciences.json",
                "parsedSource": "CCMAS_Social_Sciences_COMBINED.md",
                "originalPdf": ORIGINAL_PDF,
                "programme": "Sociology",
                "field": "employability_skills",
                "index": index,
            },
            "studentDisplay": True,
            "dataState": "source_backed",
        }
        for index, value in enumerate(programme.get("employability_skills") or [])
        if isinstance(value, str) and value.strip()
    ]

    edges: list[dict[str, Any]] = []
    for link in (mapping.get(programme_key) or {}).get("links") or []:
        edge_key = f"{programme_key}::{link.get('domain_id')}"
        audit = evidence.get(edge_key) or {}
        review_only = bool(audit.get("review_required") or audit.get("source_review_required"))
        edges.append({
            "domainId": link.get("domain_id"),
            "domainName": link.get("domain_name"),
            "relationship": link.get("match_type"),
            "mappingSource": link.get("src"),
            "mappingMetadata": {k: v for k, v in link.items() if k not in {"domain_id", "domain_name", "match_type", "src"}},
            "evidence": {
                "courseAnchorQuality": audit.get("course_anchor_quality"),
                "courseAnchorCount": audit.get("course_anchor_count", 0),
                "courseAnchors": audit.get("course_anchors") or [],
                "sourceReviewRequired": bool(audit.get("source_review_required")),
                "reviewRequired": bool(audit.get("review_required")),
            },
            "studentDisplay": not review_only,
            "dataState": "review_only" if review_only else "source_backed",
            "influenceRule": "Programme outcomes may explain this programme-to-domain edge's carry-over and additions. They are never copied into the domain foundation.",
        })

    unverified_links = [
        {**link, "studentDisplay": False, "dataState": "review_only"}
        for link in (mapping.get(programme_key) or {}).get("unverified_links") or []
    ]

    unique_outcomes = {norm(item["sourceText"]) for item in outcomes if norm(item["sourceText"])}
    quality = {
        "noStudentOutcomeContainsAnnotation": all(not ANNOTATION_RE.search(item["studentText"]) for item in outcomes),
        "noStudentOutcomeContainsLisException": all("lis programme" not in item["studentText"].casefold() for item in outcomes),
        "everyOutcomeHasCourseLocator": all(item["sourceLocator"].get("courseCode") for item in outcomes),
        "abilitiesSeparateFromOutcomes": not any(norm(item["studentText"]) in unique_outcomes for item in abilities),
        "roleAggregatedRowsIncluded": False,
    }
    if not all(value for key, value in quality.items() if key != "roleAggregatedRowsIncluded") or quality["roleAggregatedRowsIncluded"]:
        raise RuntimeError(f"Sociology quality gates failed: {quality}")

    output = {
        "schemaVersion": 1,
        "contractName": "sociology_curriculum_guidance",
        "generatedOn": "2026-09-17",
        "purpose": "Clean programme-owned Sociology learning contract for review before downstream screen work.",
        "sourceAuthority": {
            "discipline": source.get("discipline"),
            "parsedSourceFile": source.get("source_file"),
            "jsonFile": "social_sciences.json",
            "originalPdf": ORIGINAL_PDF,
        },
        "programme": {
            "code": programme.get("code"),
            "name": programme.get("name"),
            "qualification": programme.get("qualification"),
            "durationYears": programme.get("duration_years"),
            "courseCount": len(courses),
            "courses": courses,
        },
        "curriculumOutcomes": {
            "rows": outcomes,
            "rowCount": len(outcomes),
            "uniqueNormalisedCount": len(unique_outcomes),
        },
        "programmeAbilities": {
            "rows": abilities,
            "rowCount": len(abilities),
            "note": "Explicit employability records from the programme source, kept separate from course outcomes and downstream domain foundations.",
        },
        "excludedSourceAnnotations": excluded_annotations,
        "downstream": {
            "programmeDomainEdges": edges,
            "unverifiedLinks": unverified_links,
            "ownershipRule": {
                "programme": "course outcomes and explicit programme abilities",
                "domain": "domain-owned foundation only",
                "subgroup": "subgroup-owned continuation only",
                "role": "role-owned continuation only",
            },
        },
        "legacyArrays": {
            "skillsProfile": "staff_audit_only",
            "skillsProfileTechnical": "staff_audit_only",
            "skillsProfileTransferable": "staff_audit_only",
            "reason": "Legacy arrays flatten ownership layers and may contain appended source annotations.",
        },
        "qualityGates": quality,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUT),
        "courses": len(courses),
        "outcomes": len(outcomes),
        "uniqueOutcomes": len(unique_outcomes),
        "abilities": len(abilities),
        "excludedAnnotations": len(excluded_annotations),
        "studentDomainEdges": sum(1 for edge in edges if edge["studentDisplay"]),
        "reviewOnlyDomainEdges": sum(1 for edge in edges if not edge["studentDisplay"]),
        "qualityGates": quality,
    }, indent=2))


if __name__ == "__main__":
    main()
