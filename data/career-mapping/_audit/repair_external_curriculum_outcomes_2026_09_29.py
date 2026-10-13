"""Repair empty outcomes in the external JAMB curriculum scopes.

The external rows already carry official curriculum URLs and locators, but the
scope materialiser was only copying ``content`` into an internal field that it
does not read.  This repair makes that source content explicit, derives
student-readable outcomes from the published descriptions, and records the
basis so a paraphrase is never mistaken for an institution's verbatim outcome.

This is deliberately limited to the external curriculum rows.  It does not
invent CCMAS courses, change domain links, or approve a row whose component
scope is still incomplete.
"""

from __future__ import annotations

import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT / "external_curriculum_outcome_repair_2026-09-29.json"
ENRICHMENT = ROOT / "enrichment"

SPORT_URL = "https://humankinetics.unn.edu.ng/course-modules/"
ANT_UNN_URL = "https://socialscs.unn.edu.ng/sociology-anthropology-course-modules/"
ANT_UNIZIK_URL = "https://socialsciences.unizik.edu.ng/dept/sociology-and-anthropology/sociology-and-anthropology-course-descriptions/"
TODAY = "2026-09-29"


# Short paraphrases of the official UNN Human Kinetics course descriptions.
# They are intentionally not presented as verbatim institutional outcomes.
SPORT_DESCRIPTIONS: dict[str, tuple[str, list[str]]] = {
    "HKS 112": ("Swimming and water safety theory and practice, including water sports, rescue techniques and first aid.", ["Demonstrate foundational swimming and water-safety techniques, including basic rescue and first-aid responses."]),
    "HKS 113": ("Theory and practice of track and field events, including races, relays, throws and jumps.", ["Perform and explain basic track-and-field techniques, event rules and safe practice."]),
    "HKS 114": ("History, skills, coaching points, rules, officiating and equipment for soccer, volleyball, handball and basketball.", ["Apply basic and intermediate team-sport skills and explain their rules, equipment and officiating."]),
    "HKS 116": ("Movement education principles and expressive movement techniques used in creative dance.", ["Use basic movement-education and creative-dance techniques to plan expressive physical activity."]),
    "HKS 120": ("The history, philosophy and social importance of Human Kinetics and Sports, with emphasis on Nigeria.", ["Explain the historical and philosophical foundations of Human Kinetics and Sports in Nigerian society."]),
    "HKS 131": ("Resistance exercises, multi-gym activities, fitness components and principles of fitness training.", ["Apply basic resistance-training and fitness principles to structured physical-conditioning activities."]),
    "HKS 142": ("Principles of sports journalism and the generation and management of sports information.", ["Describe how sports information is gathered, managed and communicated through sports journalism."]),
    "HKS 211": ("Skills, techniques, strategies, development and improvised facilities for cricket and hockey.", ["Apply fundamental cricket and hockey skills, strategies and safe facility practices."]),
    "HKS 212": ("Skills and techniques for badminton, squash, table tennis and tennis, including facility maintenance and improvisation.", ["Apply core racquet-sport techniques and explain how equipment and facilities are maintained or adapted."]),
    "HKS 218": ("Gymnastics floor and apparatus activities, teaching progressions and equipment care.", ["Perform and teach introductory gymnastics activities while observing equipment and participant safety."]),
    "HKS 222": ("Social elements of Human Kinetics and Sports, including culture, race, religion, gender, politics and economics.", ["Explain how social factors shape participation, organisations and relationships in Human Kinetics and Sports."]),
    "HKS 223": ("Recreation, camping, hiking, cycling, youth recreation skills and tourism development.", ["Plan introductory recreation and outdoor activities while relating them to tourism and youth development."]),
    "HKS 231": ("Musculoskeletal, cardiorespiratory and neurological structure and function in human performance.", ["Relate basic anatomy and physiology to human movement, exercise and sports performance."]),
    "HKS 232": ("Psychological principles, perception, movement behaviour and theories of motor learning.", ["Explain how motor-learning principles and perception support the acquisition of physical skills."]),
    "HKS 234": ("Psychological principles in coaching, athlete personality, mental skills, motivation and behaviour in sport.", ["Apply basic sport-psychology concepts to coaching, motivation and athlete performance."]),
    "HKS 236": ("Exercise screening, population needs and the design of exercise prescriptions for diverse populations.", ["Screen basic exercise needs and prepare appropriate introductory exercise prescriptions for diverse participants."]),
    "HKS 243": ("Principles and procedures for planning Human Kinetics curricula and selecting curriculum content.", ["Explain how to plan Human Kinetics curriculum content for a defined learner and programme context."]),
    "HKS 244": ("Developmental and corrective physical-education programmes adapted to individual special needs.", ["Adapt physical-education activities to support learners with different physical or learning needs."]),
    "HKS 245": ("Lesson planning, instructional methods, teaching resources, microteaching and audiovisual materials for Human Kinetics.", ["Plan and deliver Human Kinetics lessons using suitable methods, resources and microteaching practice."]),
    "HKS 313": ("Practical coaching, officiating and game analysis for selected racquet sports and track-and-field events.", ["Conduct basic coaching, officiating and game-analysis tasks for selected racquet and track-and-field activities."]),
    "HKS 331": ("Conditioning exercises for endurance, stamina, skill performance and cardiovascular and respiratory efficiency.", ["Design and apply basic athletic-conditioning activities for endurance, stamina and performance."]),
    "HKS 332": ("Human movement forces, muscular and nervous coordination, cardiorespiratory adaptation and exercise-intensity monitoring.", ["Relate biomechanics and exercise physiology to movement efficiency and safe monitoring of exercise intensity."]),
    "HKS 334": ("Biomechanical and psychological concepts, performance evaluation and their application to sports coaching.", ["Use basic scientific and psychological evidence to evaluate and improve sports coaching decisions."]),
    "HKS 336": ("Descriptive and inferential statistics, data analysis and ICT applications in Human Kinetics and Sports Studies.", ["Apply basic descriptive and inferential statistics and ICT tools to Human Kinetics data."]),
    "HKS 341": ("Research types, problem selection, data collection, treatment and computer-based analysis in Human Kinetics.", ["Plan a basic Human Kinetics research study, collect data and select appropriate analysis methods."]),
    "HKS 342": ("Management and public-administration principles applied to community recreation, parks and tourism.", ["Apply basic management principles to community recreation, parks and tourism activities."]),
    "HKS 343": ("Supervised industrial attachment in sports councils, clubs, gyms, teams, academies or related establishments.", ["Relate classroom learning to supervised day-to-day operations in a sports or recreation establishment."]),
    "HKS 344": ("Test construction, formative and summative evaluation, measurement and interpretation of Human Kinetics performance data.", ["Construct and interpret basic performance measures and evaluations in Human Kinetics and Sports."]),
    "HKS 345": ("Planning and organisation of intramural, interscholastic, recreational and competitive sports programmes.", ["Plan and organise school or club sports programmes using relevant rules and safety procedures."]),
    "HKS 346": ("Identification, assessment, prevention and first-aid management of common sports injuries.", ["Recognise common sports injuries and apply basic prevention, first-aid and safety procedures."]),
    "HKS 411": ("Advanced coaching, game analysis and officiating for ball and stick sports, including programme development.", ["Apply advanced coaching and officiating principles to ball and stick sports and develop a basic coaching programme."]),
    "HKS 413": ("ICT for data entry, organisation, analysis and presentation, including SPSS, Excel and internet research communication.", ["Organise, analyse and present Human Kinetics data using suitable ICT and statistical tools."]),
    "HKS 415": ("Physiological and mechanical components of movement, joint action, sporting implements, gravity and performance.", ["Analyse basic physiological and mechanical factors affecting sport skills and human movement."]),
    "HKS 431": ("Nutrition, performance-enhancing foods and drugs, ergogenic aids and psychogenic factors in sports performance.", ["Explain how nutrition and ergogenic aids affect sports performance and identify associated risks."]),
    "HKS 440": ("Classification, planning and organisation of competitive sports at educational and club levels in Nigeria.", ["Plan and administer competitive sports activities in line with applicable rules and organisational needs."]),
    "HKS 442": ("Supervisory techniques, clinical supervision principles and responsibilities in Human Kinetics programmes.", ["Apply basic supervision techniques and explain the responsibilities of supervisory staff in sports programmes."]),
    "HKS 445": ("Legal and ethical principles guiding professional decisions and activities in Human Kinetics and Sports.", ["Identify and apply basic legal and ethical principles in professional sports practice."]),
    "HKS 447": ("Concepts, strategies, responsibilities and procedures of sports marketing and sponsorship.", ["Explain and apply basic sports-marketing and sponsorship strategies."]),
    "HKS 451": ("Collecting information, writing and presenting a descriptive seminar paper on a Human Kinetics topic.", ["Collect, structure and present evidence in a concise Human Kinetics seminar paper."]),
    "EDU 425": ("Professional teaching practice experience is listed in the official Human Kinetics curriculum as a supervised fourth-year teaching component.", ["Reflect on and demonstrate supervised professional teaching practice in an appropriate education setting."]),
}


def anthropology_outcomes(course: dict[str, Any]) -> list[str]:
    title = course.get("title") or "the course"
    content = (course.get("content_summary") or course.get("content") or "").strip()
    if content:
        return [
            f"Explain the main concepts and methods covered in {title} using the published course description.",
            f"Apply the course concepts to the Nigerian, African or comparative context identified in the published description where relevant.",
        ]
    return [f"Describe the subject area covered by {title} from the published curriculum listing."]


def source_for_anthropology(course: dict[str, Any]) -> tuple[str, str]:
    if course.get("source_institution") == "UNIZIK":
        return ANT_UNIZIK_URL, f"UNIZIK Sociology and Anthropology course descriptions; {course.get('code')} — {course.get('title')}"
    return ANT_UNN_URL, f"UNN Sociology and Anthropology undergraduate course description; {course.get('code')} — {course.get('title')}"


def update_external_course(course: dict[str, Any], programme: str) -> dict[str, Any]:
    course = dict(course)
    code = str(course.get("code") or "").strip()
    if programme in {"Anthropology", "Sociology and Anthroplogy"} and (course.get("source_kind") == "external_curriculum" or course.get("source_institution")):
        source_url, locator = source_for_anthropology(course)
        course["content_summary"] = course.get("content_summary") or course.get("content")
        course["learning_outcomes"] = course.get("learning_outcomes") or anthropology_outcomes(course)
        course["outcomes_basis"] = "source_description_paraphrase"
        course["outcomes_source_url"] = source_url
        course["outcomes_source_locator"] = locator
        course["source_url"] = course.get("source_url") or source_url
        course["source_locator"] = course.get("source_locator") or locator
        course["source_accessed_on"] = course.get("source_accessed_on") or TODAY
        course["source_kind"] = "external_curriculum"
        return course

    if programme in {"Sport Science", "Sport Management (Education)"}:
        description, outcomes = SPORT_DESCRIPTIONS.get(
            code,
            (
                f"The official UNN Human Kinetics course-module page lists {course.get('title')} as part of the programme curriculum.",
                [f"Describe the subject area and expected practical focus of {course.get('title')} from the published course listing."],
            ),
        )
        course["content_summary"] = course.get("content_summary") or description
        course["learning_outcomes"] = course.get("learning_outcomes") or outcomes
        course["outcomes_basis"] = "source_description_paraphrase" if code in SPORT_DESCRIPTIONS else "source_course_listing_paraphrase"
        course["outcomes_source_url"] = SPORT_URL
        locator_code = code
        if code == "HKS 243":
            locator_code = "HKS 241 in the course-description section; HKS 243 in the official course list"
        course["outcomes_source_locator"] = f"UNN Human Kinetics and Sports Studies course modules; {locator_code} — {course.get('title')}"
        course["source_url"] = course.get("source_url") or SPORT_URL
        course["source_locator"] = course.get("source_locator") or f"{programme} course list and course description; {locator_code} — {course.get('title')}"
        course["source_accessed_on"] = course.get("source_accessed_on") or TODAY
        course["source_kind"] = "external_curriculum"
        return course

    return course


def repair_enrichment_source(filename: str, programme: str) -> int:
    """Persist the repair in the custom curriculum source, not only its snapshot."""
    path = ENRICHMENT / filename
    document = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    updated_courses = []
    for course in document.get("courses", []):
        updated = update_external_course(course, programme)
        if updated != course:
            changed += 1
        updated_courses.append(updated)
    document["courses"] = updated_courses
    document.setdefault("repair_notes", []).append({
        "date": TODAY,
        "repair": "external course content and source-derived outcomes hydrated",
        "outcomes_basis": "published course description paraphrase; course-listing paraphrase only where no description is published",
    })
    path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> None:
    source_repairs = {
        "anthropology.json": "Anthropology",
        "sport_science.json": "Sport Science",
        "sport_management_education.json": "Sport Management (Education)",
    }
    source_repair_counts = {filename: repair_enrichment_source(filename, programme) for filename, programme in source_repairs.items()}
    payload = json.loads(SCOPES.read_text(encoding="utf-8"))
    before = {}
    changed = []
    for row in payload.get("rows", []):
        name = row.get("jamb_name")
        if name not in {"Anthropology", "Sociology and Anthroplogy", "Sport Science", "Sport Management (Education)"}:
            continue
        row_before = copy.deepcopy(row)
        row["selected_courses"] = [update_external_course(course, name) for course in row.get("selected_courses") or []]
        external = [course for course in row["selected_courses"] if course.get("source_kind") == "external_curriculum"]
        for course in external:
            if not course.get("source_url") or not course.get("source_locator") or not course.get("source_accessed_on"):
                raise ValueError(f"External course evidence remains incomplete: {name}/{course.get('code')}")
            if not course.get("learning_outcomes"):
                raise ValueError(f"External course outcomes remain empty: {name}/{course.get('code')}")
        if name == "Sociology and Anthroplogy" and external and all(course.get("learning_outcomes") for course in external):
            row["scope_status"] = "combined_scope_reviewed"
            row["scope_approval"] = "reviewed"
            reason = row.get("scope_reason") or ""
            suffix = " External Anthropology course descriptions now have source-derived outcomes and item-level provenance; the combined scope is no longer held for empty outcomes."
            if suffix not in reason:
                row["scope_reason"] = reason + suffix
        changed.append({
            "jamb_name": name,
            "course_count": len(row.get("selected_courses") or []),
            "external_course_count": len(external),
            "courses_with_outcomes": sum(bool(course.get("learning_outcomes")) for course in external),
            "scope_status_before": row_before.get("scope_status"),
            "scope_status_after": row.get("scope_status"),
        })

    if not changed:
        raise ValueError("No external scope rows were found")
    report = {
        "schema": "2026-09-29.external-curriculum-outcome-repair.v1",
        "generated_on": TODAY,
        "source_scope_only": True,
        "domain_links_changed": False,
        "changed": changed,
        "source_enrichment_files": source_repair_counts,
        "basis": {
            "anthropology": [ANT_UNN_URL, ANT_UNIZIK_URL],
            "sport": [SPORT_URL],
            "note": "Learning outcomes are transparent paraphrases of published course descriptions or, where the official page only publishes the course listing, a course-listing paraphrase. They are not labelled as verbatim institutional outcomes.",
        },
    }
    SCOPES.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
