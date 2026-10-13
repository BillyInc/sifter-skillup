#!/usr/bin/env python3
"""Build programme-owned guidance from the parsed CCMAS records.

The CCMAS PDFs remain the authority.  This builder only synthesises the
student-facing wording from course titles, course outcomes, employability
skills and the original source filename already stored in each parsed record.

It deliberately does not invent prescribed books or professional licences.
The optional open references below are labelled as foundation references, not
as books required by every Nigerian university.  Programme-specific books are
added only when an explicit source record exists (Sociology is currently the
reviewed example).
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
CCMAS_DIR = HERE / "ccmas"
OUT_SQL = ROOT / "backend" / "migration_guidance_all_programmes_2026-09-12.sql"
OUT_MANIFEST = HERE / "PROGRAMME_GUIDANCE_CATALOG_MANIFEST.json"
OUT_AUDIT = HERE / "PROGRAMME_GUIDANCE_CATALOG_AUDIT_2026-09-12.md"
VERIFIED_AT = "2026-09-12"
CCMAS_HUB = "https://www.nuc.edu.ng/ccmas/"

ORIGINAL_PDF_BY_JSON = {
    "administration_management.json": "Administration-and-Management.pdf",
    "agricultural_science.json": "Agriculture-2023.pdf",
    "allied_health.json": "Allied-Health-Sciences-2023.pdf",
    "architecture.json": "Architecture-CCMAS-2023-FINAL.pdf",
    "arts.json": "Arts-CCMAS-2023-FINAL.pdf",
    "basic_medical.json": "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "communication_media.json": "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "computing.json": "Computing-CCMAS-2023-FINAL.pdf",
    "education.json": "Education-CCMAS-2023-New.pdf",
    "engineering.json": "Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "environmental_sciences.json": "Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "law.json": "Law-ALL.pdf",
    "medicine_dentistry.json": "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "pharmacy.json": "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "sciences.json": "Sciences-CCMAS-2023-FINAL.pdf",
    "social_sciences.json": "Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "veterinary.json": "Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}


# These are open foundation references, selected by discipline. They help a
# student start learning; they are not claims that a Nigerian institution
# prescribes a particular title.
REFERENCE_BY_DISCIPLINE = {
    "Administration and Management": {
        "title": "Principles of Management",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/principles-management/pages/1-introduction",
        "description": "Free open textbook for introductory management, organisations, planning, decision-making and entrepreneurship foundations.",
    },
    "Agricultural Science": {
        "title": "Agriculture open learning collection",
        "provider": "Oregon State University Open Textbooks",
        "url": "https://open.oregonstate.education/",
        "description": "Open agricultural and natural-resource learning materials; choose the sections that match the programme curriculum.",
    },
    "Allied Health Sciences": {
        "title": "Anatomy and Physiology 2e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction",
        "description": "Free open textbook for human structure and function foundations used by many health-science routes; it is not a substitute for professional training.",
    },
    "Architecture": {
        "title": "Architecture and built-environment open learning",
        "provider": "LibreTexts Engineering",
        "url": "https://eng.libretexts.org/",
        "description": "Open engineering and built-environment reference materials; use only the sections relevant to the recorded curriculum.",
    },
    "Arts": {
        "title": "Humanities open textbooks",
        "provider": "Open Textbook Library",
        "url": "https://open.umn.edu/opentextbooks/subjects/humanities",
        "description": "Open humanities references for language, history, philosophy, religion, literature and creative-study foundations.",
    },
    "Basic Medical Sciences": {
        "title": "Anatomy and Physiology 2e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction",
        "description": "Free open textbook for human structure and function foundations; it does not establish clinical competence or licensing.",
    },
    "Communication and Media Studies": {
        "title": "Communication open textbooks",
        "provider": "Open Textbook Library",
        "url": "https://open.umn.edu/opentextbooks/subjects/communication",
        "description": "Open references for communication, media, writing and public-information foundations.",
    },
    "Computing": {
        "title": "Think Python",
        "provider": "Allen Downey / Green Tea Press",
        "url": "https://greenteapress.com/wp/think-python-2e/",
        "description": "Free open programming book for a computing foundation; Python is one option, not a universal requirement for every computing route.",
    },
    "Education": {
        "title": "Education open textbooks",
        "provider": "Open Textbook Library",
        "url": "https://open.umn.edu/opentextbooks/subjects/education",
        "description": "Open references for learning, teaching, education systems and classroom foundations.",
    },
    "Engineering": {
        "title": "Engineering open learning collection",
        "provider": "Engineering LibreTexts",
        "url": "https://eng.libretexts.org/",
        "description": "Open engineering references; the student should follow the mathematics, science and design areas that match the programme.",
    },
    "Environmental Sciences": {
        "title": "Environmental and natural-resource open learning",
        "provider": "Oregon State University Open Textbooks",
        "url": "https://open.oregonstate.education/",
        "description": "Open environmental and natural-resource learning materials; choose sections that match the curriculum record.",
    },
    "Law": {
        "title": "Business Law and the Legal Environment",
        "provider": "Open Textbook Library",
        "url": "https://open.umn.edu/opentextbooks/textbooks/business-law-and-the-legal-environment",
        "description": "Free open legal reference for introductory legal systems, contracts, courts and commercial law; Nigerian legal practice requires Nigerian authorities and professional training.",
    },
    "Medicine and Dentistry": {
        "title": "Anatomy and Physiology 2e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction",
        "description": "Free open foundation reference for human structure and function; it is not a substitute for medical or dental school training, clinical supervision or registration.",
    },
    "Pharmacy and Pharmaceutical Sciences": {
        "title": "Anatomy and Physiology 2e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction",
        "description": "Free open health-science foundation reference; it is not a substitute for pharmacy training, clinical supervision or registration.",
    },
    "Sciences": {
        "title": "OpenStax science textbooks",
        "provider": "OpenStax",
        "url": "https://openstax.org/subjects/science",
        "description": "Free open science textbooks; choose the biology, chemistry, physics, mathematics or statistics text that matches the programme.",
    },
    "Social Sciences": {
        "title": "Social Science Research: Principles, Methods and Practices",
        "provider": "UniSQ Open Textbooks",
        "url": "https://usq.pressbooks.pub/socialscienceresearch/",
        "description": "Free open social-science research reference covering research questions, design, evidence, qualitative and quantitative methods; it is a foundation aid, not a prescribed book for every programme.",
    },
    "Veterinary Medicine": {
        "title": "Anatomy and Physiology 2e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction",
        "description": "Free human-biology foundation reference only; veterinary students need animal-specific curriculum, clinical training and professional requirements.",
    },
}

TOOL_RULES = {
    "Python": (r"\bpython\b", "programming", "Python"),
    # A bare single-letter match is too permissive and creates false positives
    # from ordinary prose. Only accept explicit R-tool wording.
    "R": (r"\b(?:r studio|r programming|using r|with r|r software)\b", "statistics", "R"),
    "SQL": (r"\bsql\b", "database", "SQL"),
    "SPSS": (r"\bspss\b", "statistics", "SPSS"),
    "Excel": (r"\bexcel\b", "spreadsheet", "Excel"),
    "MATLAB": (r"\bmatlab\b", "technical computing", "MATLAB"),
    "AutoCAD": (r"\bautocad\b", "design", "AutoCAD"),
    "ArcGIS": (r"\barcgis\b", "geospatial analysis", "ArcGIS"),
    "GIS": (r"\bgis\b", "geospatial analysis", "GIS"),
    "LaTeX": (r"\blatex\b", "technical writing", "LaTeX"),
}

TOPIC_RULES = [
    ("research and evidence", ("research", "methodology", "data collection", "research project")),
    ("mathematics and quantitative reasoning", ("mathematics", "calculus", "statistics", "probability", "econometrics", "quantitative")),
    ("laboratory and scientific practice", ("laboratory", "practical chemistry", "practical physics", "microbiology", "biochemistry")),
    ("design and technical practice", ("design", "drawing", "studio", "construction", "engineering")),
    ("people, society and institutions", ("society", "social", "culture", "institution", "community", "human behaviour")),
    ("health, care and clinical foundations", ("anatomy", "physiology", "clinical", "pathology", "patient", "health")),
    ("language, communication and interpretation", ("language", "literature", "communication", "media", "linguistics", "translation")),
    ("organisations, markets and management", ("management", "business", "finance", "accounting", "marketing", "organisation", "entrepreneurship")),
    ("law, policy and professional practice", ("law", "policy", "governance", "regulation", "ethics", "justice")),
    ("environment and natural resources", ("environment", "ecology", "agriculture", "soil", "water", "forestry", "wildlife")),
    ("teaching and learning", ("teaching", "education", "curriculum", "learning", "pedagogy")),
]


def clean(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def json_sql(value: object) -> str:
    return sql(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def array_sql(values: list[str]) -> str:
    return "ARRAY[]::text[]" if not values else "ARRAY[" + ",".join(sql(v) for v in values) + "]::text[]"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-") or "item"


def programme_text(programme: dict) -> str:
    parts = [clean(programme.get("name"))]
    for course in programme.get("courses") or []:
        parts.extend([clean(course.get("title")), clean(course.get("content_summary"))])
        parts.extend(clean(x) for x in course.get("skills_learned") or [])
    parts.extend(clean(x) for x in programme.get("employability_skills") or [])
    return " ".join(x for x in parts if x).casefold()


def topics_for(programme: dict) -> list[str]:
    text = programme_text(programme)
    topics: list[str] = []
    for label, needles in TOPIC_RULES:
        if any(needle in text for needle in needles):
            topics.append(label)
    return topics[:5] or ["subject knowledge and professional practice"]


def tools_for(programme: dict) -> list[tuple[str, str, str]]:
    text = programme_text(programme)
    return [value for value, (pattern, purpose, action) in TOOL_RULES.items() if re.search(pattern, text, flags=re.IGNORECASE) for value in [(value, purpose, action)]]


def course_locators(programme: dict, source_file: str, original_pdf: str) -> list[dict]:
    courses = programme.get("courses") or []
    return [{"sourceFile": source_file, "originalPdf": original_pdf, "courseCode": clean(c.get("code")), "courseTitle": clean(c.get("title")), "level": c.get("level")} for c in courses[:8] if clean(c.get("code"))]


def refs(discipline: str, reading: dict) -> list[dict]:
    return [
        {"id": "nuc_ccmas", "title": "NUC CCMAS source page", "url": CCMAS_HUB, "region": "nigeria", "evidenceType": "official_curriculum_source"},
        {"id": "open_reference_" + slug(discipline), "title": reading["title"], "url": reading["url"], "region": "global", "evidenceType": "free_foundation_reference"},
    ]


def build() -> tuple[list[dict], list[dict], list[dict]]:
    contexts: list[dict] = []
    resources: list[dict] = []
    audit: list[dict] = []
    seen_programmes: set[tuple[str, str]] = set()
    for source in sorted(CCMAS_DIR.glob("*.json")):
        data = json.loads(source.read_text(encoding="utf-8"))
        discipline = clean(data.get("discipline"))
        original_pdf = ORIGINAL_PDF_BY_JSON.get(source.name)
        if not original_pdf:
            raise ValueError(f"No original PDF mapping for {source.name}")
        reading = REFERENCE_BY_DISCIPLINE.get(discipline)
        for programme in data.get("programmes") or []:
            name = clean(programme.get("name"))
            identity = (discipline.casefold(), name.casefold())
            if not name or identity in seen_programmes:
                continue
            seen_programmes.add(identity)
            if not reading:
                raise ValueError(f"No reference mapping for discipline: {discipline}")
            topics = topics_for(programme)
            locators = course_locators(programme, source.name, original_pdf)
            references = refs(discipline, reading)
            source_ids = ["nuc_ccmas", "open_reference_" + slug(discipline)]
            limitations = [
                "The curriculum record describes what the programme is designed to teach; it does not prove that a student already has the capability.",
                "The open reference is a learning option, not proof that every Nigerian university prescribes that book or course.",
            ]
            topic_sentence = ", ".join(topics[:-1]) + (" and " + topics[-1] if len(topics) > 1 else topics[0])

            def add_context(kind: str, key: str, title: str, meaning: str, use: str, output: str, priority: str, reason: str, prerequisites: list[str], related: list[str], extra_refs: list[dict] | None = None):
                contexts.append({
                    "discipline": discipline, "programme": name, "item_type": kind, "item_key": key, "name": title,
                    "plain_meaning": meaning, "contextual_use": use, "expected_output": output,
                    "priority": priority, "priority_reason": reason, "prerequisites": prerequisites,
                    "related_items": related, "source_ids": source_ids, "source_references": extra_refs or references,
                    "source_locators": locators, "geographic_scope": "nigeria_to_global",
                    "evidence_limitations": limitations,
                })

            add_context(
                "skill", "understand-programme-foundation", f"Understand {name}",
                f"{name} brings together {topic_sentence}.",
                "Use the curriculum as a map of the ideas, methods and applications you are likely to meet in this programme.",
                f"A simple explanation of what {name} studies and how its main subjects fit together.",
                "start_here", "Start here because the CCMAS record is the programme's national curriculum foundation.", [], ["explain-programme-ideas"],
            )
            add_context(
                "competency", "explain-programme-ideas", "Explain the programme's main ideas",
                f"This means being able to describe the key ideas in {name} in your own words and connect them to the course topics.",
                "Build this after orientation so the student can tell the difference between memorising course titles and understanding what the programme does.",
                "A short explanation, comparison, diagram, calculation, design, experiment, case analysis or other output appropriate to the programme.",
                "build_next", "Build this next because the CCMAS outcomes move from subject knowledge into understanding and application.",
                ["Understand " + name], ["apply-programme-learning"],
            )
            add_context(
                "competency", "apply-programme-learning", "Apply what the programme teaches",
                f"This is the ability to use {name}'s ideas and methods on a question, problem, project, case, design, experiment or practical task.",
                "It connects the programme foundation to later domains and roles without claiming readiness for a job or licence.",
                "A supervised piece of work that shows how the recorded knowledge or method was used.",
                "useful_later", "This comes after understanding the programme because application depends on the subject foundation.",
                ["Explain the programme's main ideas"], [],
            )
            if any("research" in programme_text(programme) or "project" in programme_text(programme) for _ in [0]):
                add_context(
                    "competency", "research-and-communicate-programme-work", "Research and communicate programme work",
                    f"The curriculum records research, project, report, presentation or evidence work connected to {name}.",
                    "Use this when moving from course learning into a supervised project or a source-backed explanation.",
                    "A traceable project, report, presentation or documented analysis with its evidence and limitations.",
                    "useful_later", "This is shown because the programme record contains research, project or communication outcomes.",
                    ["Explain the programme's main ideas"], ["Apply what the programme teaches"],
                )
            for tool, purpose, action in tools_for(programme)[:4]:
                add_context(
                    "tool", slug(tool), tool,
                    f"{tool} is named in the programme record as one way to support {purpose} work.",
                    f"In {name}, it can support {action} where the relevant course or project requires it. It is an option, not the only tool.",
                    f"A small, supervised {purpose} output using {tool} where the curriculum calls for it.",
                    "optional", "Show this only because the parsed CCMAS record names the tool or software explicitly.",
                    ["Explain the programme's main ideas"], ["Apply what the programme teaches"],
                )
            resources.append(
                {"discipline": discipline, "programme": name, "resource_type": "programme_reading", "target_name": f"NUC CCMAS: {name}", "provider": "National Universities Commission", "region": "nigeria", "access_type": "free", "delivery": "official curriculum source page", "url": CCMAS_HUB, "source_url": CCMAS_HUB, "description": f"Official CCMAS source page for the {discipline} discipline. Open the relevant document and use the source locator to inspect {name}. This is curriculum evidence, not a prescribed student textbook.", "provenance": {"ownership": "programme", "sourceFile": source.name, "programme": name, "discipline": discipline, "sourceType": "official_curriculum"}}
            )
            # Sociology's specific books are already supplied by the reviewed
            # Sociology migration. Do not attach a generic Social Sciences
            # book to Sociology and make it look like a programme-specific
            # recommendation. Every other programme receives one optional
            # discipline-level open foundation reference.
            resource_count = 1
            if name.casefold() != "sociology":
                resources.append(
                    {"discipline": discipline, "programme": name, "resource_type": "programme_reading", "target_name": reading["title"], "provider": reading["provider"], "region": "global", "access_type": "free", "delivery": "open textbook or public reference", "url": reading["url"], "source_url": reading["url"], "description": reading["description"] + " It is a foundation reference, not proof that a Nigerian university prescribes it.", "provenance": {"ownership": "programme", "sourceFile": source.name, "programme": name, "discipline": discipline, "sourceType": "free_foundation_reference"}}
                )
                resource_count = 2
            audit.append({"discipline": discipline, "programme": name, "source_file": source.name, "original_pdf": original_pdf, "course_count": len(programme.get("courses") or []), "topic_count": len(topics), "context_items": sum(1 for row in contexts if row["discipline"] == discipline and row["programme"] == name), "resources": resource_count, "programme_specific_books": "reviewed_only" if name.casefold() == "sociology" else "not_claimed"})
    return contexts, resources, audit


def render(contexts: list[dict], resources: list[dict]) -> str:
    def values(rows: list[dict], fields: list[str]) -> str:
        return ",\n".join("(" + ", ".join(sql(row.get(field)) if field not in {"source_ids", "prerequisites", "related_items", "source_references", "source_locators", "evidence_limitations", "provenance"} else (array_sql(row.get(field) or []) if field == "source_ids" else json_sql(row.get(field) or {} if field == "provenance" else row.get(field) or [])) for field in fields) + ")" for row in rows)

    resource_fields = ["discipline", "programme", "resource_type", "target_name", "provider", "region", "access_type", "delivery", "url", "source_url", "description", "provenance"]
    context_fields = ["discipline", "programme", "item_type", "item_key", "name", "plain_meaning", "contextual_use", "expected_output", "priority", "priority_reason", "prerequisites", "related_items", "source_ids", "source_references", "source_locators", "geographic_scope", "evidence_limitations"]
    chunks = [
        "-- Source-grounded programme guidance for all parsed CCMAS programmes.\n-- Run after migration_guidance_ownership_and_sociology_resources_2026-09-11.sql.\n-- Open references are optional learning aids; no unverified book is labelled required.\n\nBEGIN;\n",
        "WITH resource_rows(discipline, programme, resource_type, target_name, provider, region, access_type, delivery, url, source_url, description, provenance) AS (\nVALUES\n" + values(resources, resource_fields) + "\n)\nINSERT INTO skillup_dev.career_learning_resources\n(id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type, target_name, provider, region, access_type, delivery, url, source_url, description, source_confidence, data_state, source_provenance)\nSELECT gen_random_uuid(), p.id, NULL, NULL, NULL, 'programme', 'approved_guidance_v1', r.resource_type, r.target_name, r.provider, r.region, r.access_type, r.delivery, r.url, r.source_url, r.description, 'high', 'source_backed', r.provenance\nFROM resource_rows r\nJOIN skillup_dev.programmes p ON lower(trim(p.discipline)) = lower(trim(r.discipline)) AND lower(trim(p.name)) = lower(trim(r.programme))\nON CONFLICT DO NOTHING;\n",
        "WITH context_rows(discipline, programme, item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations) AS (\nVALUES\n" + values(contexts, context_fields) + "\n)\nINSERT INTO skillup_dev.career_context_items\n(context_level, context_key, domain_key, item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations, evidence_type, source_confidence, data_state, verified_at)\nSELECT 'programme', p.id::text, COALESCE((SELECT d.domain_key FROM skillup_dev.programme_domain pd JOIN skillup_dev.domains d ON d.id = pd.domain_id WHERE pd.programme_id = p.id ORDER BY CASE lower(pd.match_type) WHEN 'direct' THEN 1 WHEN 'functional' THEN 2 ELSE 3 END, d.domain_key LIMIT 1), 'UNMAPPED'), r.item_type, r.item_key, r.name, r.plain_meaning, r.contextual_use, r.expected_output, r.priority, r.priority_reason, r.prerequisites, r.related_items, r.source_ids, r.source_references, r.source_locators, r.geographic_scope, r.evidence_limitations, 'source_supported_synthesis', 'high', 'source_backed', DATE '" + VERIFIED_AT + "'\nFROM context_rows r\nJOIN skillup_dev.programmes p ON lower(trim(p.discipline)) = lower(trim(r.discipline)) AND lower(trim(p.name)) = lower(trim(r.programme))\nON CONFLICT (context_level, context_key, item_type, item_key) DO UPDATE SET name = EXCLUDED.name, plain_meaning = EXCLUDED.plain_meaning, contextual_use = EXCLUDED.contextual_use, expected_output = EXCLUDED.expected_output, priority = EXCLUDED.priority, priority_reason = EXCLUDED.priority_reason, prerequisites = EXCLUDED.prerequisites, related_items = EXCLUDED.related_items, source_ids = EXCLUDED.source_ids, source_references = EXCLUDED.source_references, source_locators = EXCLUDED.source_locators, geographic_scope = EXCLUDED.geographic_scope, evidence_limitations = EXCLUDED.evidence_limitations, verified_at = EXCLUDED.verified_at;\n\nCOMMIT;\n",
    ]
    return "\n".join(chunks)


def main() -> None:
    contexts, resources, audit = build()
    OUT_SQL.write_text(render(contexts, resources), encoding="utf-8")
    programmes = {(row["discipline"], row["programme"]) for row in audit}
    manifest = {
        "schema_version": "1.0.0",
        "verified_at": VERIFIED_AT,
        "source_directory": r"C:\\Users\\USER\\Downloads\\ccmas original documents",
        "source_url": CCMAS_HUB,
        "original_pdfs": sorted({row["original_pdf"] for row in audit}),
        "programmes": len(programmes),
        "context_rows": len(contexts),
        "resource_rows": len(resources),
        "context_counts": dict(Counter(row["item_type"] for row in contexts)),
        "programme_specific_books": [row["programme"] for row in audit if row["programme_specific_books"] == "reviewed_only"],
        "book_policy": "Every programme receives the official CCMAS locator. Optional discipline-level open references are added except Sociology, whose reviewed programme-specific books are supplied by the separate Sociology migration. No book is labelled prescribed without programme-specific evidence.",
        "sql_file": OUT_SQL.name,
    }
    OUT_MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Programme guidance catalogue audit (2026-09-12)", "",
        f"- Original source directory: `{manifest['source_directory']}`", f"- Official source page: {CCMAS_HUB}",
        f"- Parsed programmes covered: **{manifest['programmes']}**", f"- Programme context rows: **{manifest['context_rows']}**", f"- Programme resources: **{manifest['resource_rows']}**", "",
        "## Policy", "",
        "The programme layer is synthesized from the parsed CCMAS course titles, course outcomes, employability records and original source filename. It explains what the programme is designed to teach and how to begin learning. It does not claim that the student is already skilled, that an open reference is prescribed by a Nigerian university, or that a certification is required.", "",
        "Sociology remains the only programme with specifically reviewed Haralambos/Holborn and Giddens references. It does not receive the generic Social Sciences open reference from this migration. Other programmes receive discipline-appropriate open foundation references until a manual programme-specific reading-list review supplies stronger evidence.", "",
        "## Coverage", "",
    ]
    for row in audit:
        lines.append(f"- `{row['discipline']} / {row['programme']}` — {row['course_count']} courses, {row['context_items']} context rows, {row['resources']} references; parsed `{row['source_file']}`, original `{row['original_pdf']}`")
    OUT_AUDIT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
