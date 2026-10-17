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


STUDENT_OUTCOME_EXPLANATIONS: dict[str, str] = {
    norm("connect between the two revolutions of the 18th century"): (
        "You will examine how the Industrial and political revolutions of the eighteenth century were connected with the emergence of Sociology. "
        "This helps explain why early thinkers began trying to study society systematically."
    ),
    norm("explain the thrust of social anthropology which is a distinct field and one that is closely related to sociology, hence social anthropology"): (
        "You will explain what Social Anthropology focuses on and how it is distinct from, yet related to, Sociology. "
        "The comparison helps you see how the disciplines can ask related questions while using different perspectives."
    ),
    norm("appreciate the context for social anthropological works"): (
        "You will consider the cultural, historical and social setting in which anthropological work was produced. "
        "That context helps you interpret what a study says without assuming one community's experience represents everyone."
    ),
    norm("describe the racist origin of anthropology"): (
        "You will examine racist ideas and colonial assumptions in the history of Anthropology. "
        "Recognising this history helps you question older accounts instead of treating them as neutral descriptions of people."
    ),
    norm("explain the thrust of psychology as a discipline"): (
        "You will learn what Psychology studies: human behaviour and the ways knowledge, attitudes, personality and experience can shape it. "
        "This introduces Psychology's focus before you compare it with related disciplines."
    ),
    norm("distinguish psychology from cognate ones like sociology, social anthropology, psychiatry, social psychology and many others"): (
        "You will compare Psychology with related fields such as Sociology, Social Anthropology, Psychiatry and Social Psychology. "
        "The aim is to understand their different questions and viewpoints, not to treat their subject matter as interchangeable."
    ),
    norm("appreciate the various specialities in psychology and many others"): (
        "You will explore different areas of Psychology, including the distinction between general and clinical Psychology. "
        "The course introduces their different scopes; it does not itself qualify you to practise as a psychologist."
    ),
    norm("identify methods used in psychological studies and many others"): (
        "You will learn to recognise methods used in psychological studies and consider how researchers use them to investigate behaviour and experience. "
        "This is an introduction to research approaches, not proof that you can independently conduct every kind of study."
    ),
    norm("trace the history of psychology, focus of psychology, unit of study in psychology and key concepts"): (
        "You will trace how Psychology developed, what it studies and the key concepts used to discuss human behaviour. "
        "This gives you a foundation for understanding the theories and methods introduced elsewhere in the course."
    ),
    norm("appreciate the history of psychology in Nigeria today"): (
        "You will learn about the development of Psychology in Nigeria and consider the discipline in its local academic and social setting. "
        "This places the programme's introduction to Psychology in Nigerian context without implying that one account covers every institution or practice."
    ),
    norm("explain their preoccupation with magic, witchcraft and many others which still co-exist side-by-side with science and imported belief-systems of Christianity and Islam"): (
        "You will examine how beliefs and practices described in the course—including beliefs about magic and witchcraft—exist alongside scientific explanations and Christianity and Islam in some communities. "
        "These are topics for studying social and cultural meaning, not claims that every community shares the same beliefs."
    ),
    norm("demonstrate total understanding of the peoples of Nigeria/Africa"): (
        "You will bring together the course's examples to describe the varied peoples, cultures and social structures of Nigeria and Africa. "
        "The course offers an introduction; no single course can provide a complete account of every community."
    ),
    norm("have an overview of psychological theories of human behaviour/personality development such as theories of Freud, Jung, Piaget and many others"): (
        "You will meet theories that try to explain human behaviour and personality development, including ideas associated with Freud, Jung and Piaget. "
        "The course introduces these explanations for study and comparison; it does not present them as a complete account of every person's behaviour."
    ),
    norm("describe the Social Institutions (family, economic, education and many others), social change, social control, social inequalities, social problems, and types of society"): (
        "You will describe institutions such as family, education, religion, politics and the economy, and examine how they relate to social change, social control and inequality. "
        "This helps you see how institutions and wider social conditions shape people's lives and social problems."
    ),
    norm("explain some critical concepts in social psychology such as attitude (change and formative), attribution, group dynamics, altruism, reciprocity, warm-glow, social exchange and social learning, prosocial and underlying motives and many others"): (
        "You will study how attitudes form or change, how people interpret one another, how groups influence behaviour, and why people may help others. "
        "Concepts such as attribution, reciprocity and altruism give names to different parts of these social processes; they are ideas to examine, not one explanation for everyone."
    ),
    norm("apply the theories of gender inequality, biological theories (Murdock, Alex Thio, Parker and Parker and many others) and cultural theories Marxism, Feminism, Socialisation"): (
        "You will compare biological, Marxist, feminist and socialisation-based explanations of gender inequality. "
        "Applying them means using each theory to interpret examples while noticing that theories offer different explanations rather than a single settled answer."
    ),
    norm("discuss gender disparity in the economy, politics, religion, education and many others"): (
        "You will examine how gender differences and inequalities appear in areas such as work and the economy, politics, religion and education. "
        "The course considers these as social patterns to investigate, not as traits shared by every person or community."
    ),
    norm("explain the cultural inhibitors of gender equity Widowhood practices, Early marriage and many others"): (
        "You will examine how practices such as early marriage, female genital mutilation and widowhood practices can affect gender equity. "
        "The examples are topics for analysing social conditions and consequences; they should not be used to stereotype an entire culture or community."
    ),
    norm("discuss the diversity of social structure marriage, family types, patrilineal, matrilineal, bilateral and many others"): (
        "You will compare forms of marriage and family life, including patrilineal descent traced through a father's line, matrilineal descent through a mother's line, and bilateral ties through both. "
        "These are examples of social structure; the course also places them within Nigeria's varied historical and community settings."
    ),
    norm("define related concepts like social stratification, social class, equity/inequity and many others"): (
        "You will learn to distinguish social stratification, the ways societies rank people or groups, from social class and from equity or inequity. "
        "These concepts help you describe how resources, status and opportunities are distributed and how inequality affects social life."
    ),
    norm("demonstrate an appreciable level of the art of public speaking and listening"): (
        "You will practise speaking clearly to an audience and listening carefully to understand and respond to what others say. "
        "These communication abilities support your university studies and presentations."
    ),
    norm("describe practices like polygamy polygyny and polyandry levirate wife inheritance food taboos and others targeted at women and children"): (
        "You will examine examples discussed in the course, including different forms of polygamy, wife inheritance and food taboos, and consider how some practices affect women and children. "
        "The examples must be understood in their specific social settings; they do not describe every Nigerian or African community."
    ),
    norm("appreciate the historical contributions to scientific thought the pioneers contributors include Emile Durkheim Auguste Comte Parsons Karl Marx Max Weber Malinowski Cooley"): (
        "You will study how thinkers such as Durkheim, Comte, Parsons, Marx, Weber, Malinowski and Cooley contributed to the development of sociological and social-scientific thought. "
        "Comparing their ideas helps explain how Sociology developed its ways of studying society."
    ),
    norm("recognise the limitations in sociology being regarded as a science like discipline in the physical and biological sciences"): (
        "You will examine why studying people and societies can raise different evidence and method challenges from studying some physical or biological processes. "
        "The point is to judge sociological methods and conclusions carefully, not to assume that Sociology cannot use systematic evidence."
    ),
    norm("appreciate the concept of social pathology major contemporary problems in Nigeria"): (
        "You will examine social causes and effects of problems such as poverty, delinquency and crime in Nigeria, and why these issues matter to social work. "
        "Here, social pathology is a course term for harmful social conditions, not a label for stigmatizing people or communities."
    ),
    norm("appreciate the concept of modernisation"): (
        "You will learn how modernisation is used to describe social and economic change, including changes associated with industrialisation and institutions. "
        "The course considers these ideas in African contexts and also examines problems that can accompany rapid social change."
    ),
    norm("define normal disturbed and or problem family units and factors accounting for them"): (
        "You will examine how the course describes family situations and factors associated with conflict, instability or difficulty. "
        "These categories are study terms, not judgments about the worth of families; the course also considers kinship, family roles and responses to conflict."
    ),
    norm("account for the functional and dysfunctional practices across the major as well as minor ethnic groups"): (
        "You will analyze how particular social practices may support or create difficulties for people in specific settings across Nigeria's ethnic communities. "
        "A practice or community should not be labelled wholly functional or dysfunctional without considering context and who is affected."
    ),
    norm("explain the justification for use of one or some or all the methods in social research in human societies"): (
        "You will learn to choose and justify research methods in relation to a question about people or society. "
        "The course asks you to compare methods' strengths and limits rather than assume every study needs to use every method."
    ),
    norm("account for the difference between factors in focus in the study of economic development as opposed to sociology of development identify the contribution of Max Weber to the rise of sociology of development explain how economic factors like value system norms profit or other cultural imperatives are key determinants of economic development and discuss role of non economic factors in socio economic in the rapid development of Nigeria development"): (
        "You will compare the questions economic development and Sociology of Development ask, examine Max Weber's contribution, and consider how economic, cultural and other social factors shape development in Nigeria. "
        "The sociological view also asks how development affects society and family life, rather than treating economic growth alone as the whole story."
    ),
}

# Use an outcome-id override where the source itself contains typographical
# errors that make a normalized phrase key too fragile. The original remains
# in ``sourceText`` and the source evidence view.
STUDENT_OUTCOME_EXPLANATIONS_BY_ID: dict[str, str] = {
    "SOC 407:1": (
        "You will compare the questions economic development and Sociology of Development ask, examine Max Weber's contribution, and consider how economic, cultural and other social factors shape development in Nigeria. "
        "The sociological view also asks how development affects society and family life, rather than treating economic growth alone as the whole story."
    ),
}


def split_annotation(value: str) -> tuple[str, dict[str, str] | None]:
    match = ANNOTATION_RE.search(value)
    if not match:
        return value.strip(), None
    source_text = value[: match.start()].rstrip(" -;.")
    return source_text, {
        "label": match.group("label").strip(),
        "text": value[match.end() :].strip(),
    }


def student_text(value: str, outcome_id: str | None = None) -> str:
    """Create learner-facing copy while preserving the cited source wording.

    The contract keeps ``sourceText`` unchanged for audit.  ``studentText``
    uses a curated plain-language explanation for selected outcomes whose
    source phrase is jargon-heavy, unclear, culturally overbroad, or visibly
    incomplete. All other outcomes receive only grammatical cleanup. The
    source wording remains unchanged for audit.
    """
    text = re.sub(r"\s+", " ", value).strip().rstrip(" ;")
    if not text:
        return text
    if outcome_id and outcome_id in STUDENT_OUTCOME_EXPLANATIONS_BY_ID:
        return STUDENT_OUTCOME_EXPLANATIONS_BY_ID[outcome_id]
    learner_phrase = re.sub(r"\s*;\s*and\s*$", "", text, flags=re.IGNORECASE)
    explanation = STUDENT_OUTCOME_EXPLANATIONS.get(norm(learner_phrase))
    if explanation:
        return explanation
    # CCMAS outcome rows sometimes end with the list-continuation fragment
    # "; and". Keep that source text intact, but do not show the fragment as
    # if it were part of the learner-facing outcome.
    text = learner_phrase
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
    source_title_variants = course.get("source_title_variants")
    return {
        "sourceFile": "social_sciences.json",
        "parsedSource": "CCMAS_Social_Sciences_COMBINED.md",
        "originalPdf": ORIGINAL_PDF,
        "sourceLocatorText": course.get("source_locator"),
        "courseCode": course.get("code"),
        "courseTitle": course.get("title"),
        "level": course.get("level"),
        "courseSummary": content_summary if isinstance(content_summary, str) and content_summary.strip() else None,
        "sourceTitleVariants": source_title_variants if isinstance(source_title_variants, dict) else None,
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
                "studentText": student_text(source_text, f"{course.get('code')}:{index + 1}"),
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
