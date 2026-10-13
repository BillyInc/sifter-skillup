#!/usr/bin/env python3
"""Build explicit JAMB -> CCMAS curriculum scopes.

The JAMB bridge contains names that are not themselves CCMAS programme names.
Those rows must not inherit the complete parent programme by default.  This
writer records the smaller CCMAS course set that is evidenced by the JAMB
name, and derives domain links only when the existing CCMAS programme-domain
evidence names one of those courses as an anchor.

The output is a reviewable source artifact.  It intentionally leaves a row in
review when its name has no defensible course-level evidence.  A missing
course-level match is an external-curriculum case, not permission to fan out
the whole parent programme.
"""

from __future__ import annotations

import json
import re
import argparse
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING = ROOT / "programme_mapping.json"
CANONICAL = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
PROGRAMME_DOMAINS = ROOT / "programme_domain_final.json"
DOMAIN_EVIDENCE = ROOT / "_audit" / "programme_domain_evidence_2026-08-17.json"
OUTPUT = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"
MANUAL_SCOPE_OVERRIDES = ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json"


STOP = set(
    "a an and arts bachelor ba bsc btech business course education engineering "
    "for from in law management of programme science studies study technology "
    "the with university"
    .split()
)

# These are curriculum concepts, not domain assignments.  They only decide
# which printed CCMAS course titles are part of a JAMB variant's scope.
ALIASES = {
    "civil": ["contract", "tort", "property", "commercial", "company", "conveyancing"],
    "islamic": ["islamic", "sharia", "fiqh", "muamalat", "mirath"],
    "sharia": ["islamic", "sharia", "fiqh", "muamalat", "mirath"],
    "public": ["public", "administrative", "constitutional", "government"],
    "international": ["international", "diplomacy", "foreign", "nation"],
    "comparative": ["comparative"],
    "penology": ["punishment", "prison", "correction", "penology", "crime"],
    "criminology": ["criminology", "crime", "criminal", "forensic", "policing"],
    "demography": ["demography", "population", "social statistics", "statistics"],
    "statistics": ["statistics", "statistical", "quantitative"],
    "population": ["population", "demography"],
    "diplomacy": ["diplomacy", "international", "foreign"],
    "strategic": ["strategic", "security", "policy"],
    "political": ["political", "government", "policy"],
    "administrative": ["administrative", "public administration"],
    "peace": ["peace", "conflict", "resolution"],
    "conflict": ["conflict", "peace", "resolution"],
    "personnel": ["human resources", "personnel", "employment", "labour"],
    "human": ["human", "people", "social"],
    "resource": ["resource", "information resource"],
    "finance": ["finance", "financial", "banking", "investment"],
    "banking": ["banking", "finance", "credit"],
    "accounting": ["accounting", "financial"],
    "business": ["business", "management", "enterprise", "entrepreneurship"],
    "marketing": ["marketing", "consumer", "sales", "brand"],
    "entrepreneurship": ["entrepreneurship", "venture", "innovation", "business"],
    "tourism": ["tourism", "travel", "hospitality", "hotel"],
    "transport": ["transport", "tourism", "travel", "logistics"],
    "logistics": ["logistics", "supply chain", "transport"],
    "computer": ["computer", "computing", "programming", "software", "algorithm"],
    "information": ["information", "computing", "data", "systems"],
    "cybersecurity": ["cybersecurity", "security", "forensic"],
    "data": ["data", "statistics", "analytics", "computing"],
    "mathematics": ["mathematics", "mathematical", "numerical"],
    "physics": ["physics", "physical", "mechanics", "thermodynamics"],
    "chemistry": ["chemistry", "chemical"],
    "biology": ["biology", "biological", "botany", "zoology"],
    "microbiology": ["microbiology", "microbial", "parasitology"],
    "biotechnology": ["biotechnology", "molecular", "genetics"],
    "geology": ["geology", "geophysics", "mineral", "earth"],
    "geophysics": ["geophysics", "geology", "geophysical"],
    "plant": ["plant", "botany", "crop", "agronomy"],
    "animal": ["animal", "zoology", "livestock", "breeding"],
    "food": ["food", "nutrition", "foodservice"],
    "agriculture": ["agriculture", "agricultural", "crop", "animal", "farm"],
    "home": ["family", "consumer", "household", "clothing", "textile", "nutrition"],
    "family": ["family", "consumer", "household", "child", "welfare"],
    "french": ["french", "france"],
    "german": ["german"],
    "portuguese": ["portuguese"],
    "language": ["language", "linguistics", "literature", "translation"],
    "literature": ["literature", "poetry", "prose", "drama", "linguistics"],
    "history": ["history", "historical", "diplomatic"],
    "arabic": ["arabic", "language", "literature"],
    "christian": ["christian", "religious", "theology"],
    "theology": ["theology", "religious", "christian"],
    "film": ["film", "multimedia", "video", "production"],
    "communication": ["communication", "media", "journalism", "film"],
    "textile": ["textile", "clothing", "garment", "fabric"],
    "polymer": ["polymer", "materials", "plastic", "composite"],
    "material": ["materials", "metallurgy", "polymer", "ceramic"],
    "engineering": ["engineering", "design", "project"],
    "electrical": ["electrical", "electronics", "power"],
    "mechanical": ["mechanical", "mechanics", "thermodynamics"],
    "chemical": ["chemical", "chemistry", "process"],
    "biomedical": ["biomedical", "medical", "biology"],
    "mechatronics": ["mechatronics", "robotics", "control"],
    "agricultural": ["agricultural", "agriculture", "biosystems"],
    "surveying": ["surveying", "geoinformatics", "land"],
    "building": ["building", "construction"],
    "environmental": ["environmental", "environment", "ecology", "sustainability"],
    "geography": ["geography", "environment", "spatial"],
    "vocational": ["technology education", "vocational", "teaching"],
    "teacher": ["teaching", "education", "pedagogy"],
    "library": ["library", "information", "records"],
    "nursing": ["nursing", "clinical", "patient"],
    "pharmacy": ["pharmacy", "pharmaceutical", "drug"],
    "physiology": ["physiology", "anatomy", "biological"],
    "theatre": ["theatre", "drama", "performing"],
    "drama": ["drama", "theatre", "performing"],
    "fine": ["fine", "art", "design"],
    "music": ["music", "sound", "audio"],
    "forest": ["forest", "wildlife", "forestry"],
    "wildlife": ["wildlife", "forest", "conservation"],
    "fisheries": ["fisheries", "aquaculture", "fish"],
    "soil": ["soil", "agronomy", "crop"],
    "horticulture": ["horticulture", "landscape", "plant"],
    "sport": ["sport", "physical education", "kinetics"],
    "economics": ["economics", "economic", "finance"],
    "operations": ["operations", "industrial mathematics", "research"],
    "industrial": ["industrial", "production", "manufacturing"],
    "marine": ["marine", "ocean", "coastal", "fisheries"],
    "energy": ["energy", "power", "renewable"],
}

# The title alone cannot select these rows reliably.  These rules are tied to
# the CCMAS course-code families in the current source files.
MANUAL_CODE_PREFIXES = {
    "Common Law": ["PUL", "CIL", "PPL", "JIL", "CLE", "LAW"],
    "Business Management": ["AMS", "BUA"],
    "Management": ["AMS", "BUA"],
    "Management Studies": ["AMS", "BUA"],
    "Biostatistics": ["STA"],
    "Kanuri": ["LIN"],
    "Fulfulde": ["LIN"],
    "Electronics Engineering": ["ELE", "GET"],
    # This is a named, source-backed CCMAS course family. Keyword matching
    # missed it when the extracted course titles were corrupt.
    "Actuarial Science": ["ACS"],
}

# These names have no usable programme-specific CCMAS curriculum in the
# resolved repository.  Their enrichment files carry the external curriculum
# and the independently evidenced domain links.
EXTERNAL_SCOPE_NAMES = {"Sport Science", "Sport Management (Education)"}

MANUAL_SCOPE_DOMAIN_LINKS = {
    # One exact CCMAS course title is sufficient here because the selected
    # course is itself named "Artificial Intelligence" and the mapped domain
    # is Artificial Intelligence. This is a narrow, identity-level direct
    # evidence exception, not a general relaxation of the multi-course gate.
    "Robotics (Artificial Intelligence)": [
        {
            "domain_id": "D003",
            "domain_name": "Artificial Intelligence",
            "match_type": "direct",
            "source": "exact_ccmas_course_title_domain_identity",
            "evidence": "CSC 309 is titled Artificial Intelligence in the declared Computer Science CCMAS package; it directly supports the matching Artificial Intelligence domain. Robotics-specific curriculum remains outside this CCMAS evidence.",
            "scope_course_titles": ["Artificial Intelligence"],
            "scope_course_codes": ["CSC 309"],
            "scope_course_count": 1,
        }
    ],
    "Pasture & Range Management": [
        {
            "domain_id": "D119",
            "domain_name": "Livestock, Poultry, Dairy",
            "match_type": "direct",
            "source": "jamb_curriculum_scope_ccmas_course_title_domain_definition",
            "evidence": "ANS 409 Pasture and Range Production and Management; D119 definition covers livestock rearing on farms and ranches.",
            "scope_course_titles": ["Pasture and Range Production and Management"],
            "scope_course_codes": ["ANS 409"],
            "scope_course_count": 1,
        },
        {
            "domain_id": "D047",
            "domain_name": "Agricultural Science",
            "match_type": "functional",
            "source": "jamb_curriculum_scope_ccmas_course_title_domain_definition",
            "evidence": "ANS 409 applies pasture and range management within agricultural production; D047 definition covers crop and livestock farming systems.",
            "scope_course_titles": ["Pasture and Range Production and Management"],
            "scope_course_codes": ["ANS 409"],
            "scope_course_count": 1,
        },
    ]
    ,
    # UNIZIK identifies this award under Arts and names Chinese and Igbo
    # language options. The relevant CCMAS option curricula contain language
    # and translation study; keep the downstream path limited to the domain
    # directly supported by those course anchors. Media, journalism and music
    # links from broad keyword overlap are not evidence for this programme.
    "African and Asian Studies": [
        {
            "domain_id": "D065",
            "domain_name": "Translation, Interpretation",
            "match_type": "direct",
            "source": "unizik_programme_options_and_ccmas_course_anchors",
            "evidence": "UNIZIK lists Chinese and Igbo language options for African and Asian Studies. The selected CCMAS option curricula include IGB 307 Translation and cognate language/translation courses CHS 203 and CHS 303; this supports language/translation study, not an assumed direct route into media, journalism, or music occupations.",
            "scope_course_titles": ["Translation", "Translation: Theory and Practice", "Advanced Translation"],
            "scope_course_codes": ["IGB 307", "CHS 203", "CHS 303"],
            "scope_course_count": 3,
            "scope_anchor_gate": {
                "relationship": "direct",
                "distinct_source_course_anchors": 3,
                "repeated_specific_anchor_families": ["translation", "interpretation"],
                "transferable_evidence_anchors": 3,
                "gate": "two_scoped_courses_plus_one_repeated_specific_anchor_family",
            },
        }
    ]
}

# These JAMB titles are direct aliases or ordinary field-name variants of the
# named CCMAS programme. With no university-specific curriculum available,
# use the complete exact CCMAS package as the national curriculum proxy rather
# than a keyword-selected handful of courses. The list is explicit so an
# unrelated broad/granular JAMB name never inherits a whole package by chance.
FULL_COMPONENT_SCOPE_ALIASES = {
    "MATHEMATICAL SCIENCES",
    "Agronomy",
    "Classical Studies",
    "Yoruba",
    "Electronics",
    "Education and Business Administration",
    "ICT Engineering",
    # The UNIZIK degree has two named language-option branches. Include each
    # declared CCMAS option package in the source-backed reference scope.
    "African and Asian Studies",
}

# A checked external source may establish that a JAMB-listed identity exists
# without exposing a course-level curriculum. Close such cases explicitly as
# unsupported for student curriculum/domain guidance instead of leaving a
# generic "source required" hold or borrowing a neighbouring programme.
EXTERNAL_SCOPE_VERIFIED_NO_CURRICULUM = {
    "Environmental Science and Technology": {
        "reason": (
            "The JAMB Sciences brochure lists this Wesley University offering, but the available official Wesley programme catalogue and CEDM prospectus do not provide a course curriculum for this exact award. The university currently lists Urban and Regional Planning, Estate Management, and Surveying and Geoinformatics as its CEDM degrees; none is treated as equivalent. No CCMAS or external course rows/domain paths are assigned until an exact curriculum is published."
        ),
        "evidence": [
            {
                "authority": "Joint Admissions and Matriculation Board",
                "title": "IBASS Degree Programmes — Sciences",
                "url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
                "locator": "Sciences degree brochure; Environmental Science and Technology awarder cell lists WESLEYUNI.",
                "accessed_on": "2026-10-02",
                "supports": "Confirms the JAMB programme identity and offering context, not the course curriculum.",
            },
            {
                "authority": "Wesley University, Ondo",
                "title": "College of Environmental Design and Management — Programmes",
                "url": "https://wesleyuni.edu.ng/php/cedm.php",
                "locator": "Courses/programmes section, lines 60–74: Urban and Regional Planning, Estate Management, Surveying and Geoinformatics.",
                "accessed_on": "2026-10-02",
                "supports": "Current official list of CEDM programmes; it does not identify Environmental Science and Technology or establish equivalence.",
            },
            {
                "authority": "Wesley University, Ondo",
                "title": "College of Environmental Design and Management Prospectus",
                "url": "https://www.wesleyuni.edu.ng/assets/pdf/cedm.pdf",
                "locator": "Official 55-page prospectus; course/curriculum sections are for Urban and Regional Planning, not the exact JAMB award title.",
                "accessed_on": "2026-10-02",
                "supports": "A related institutional source was checked and deliberately not substituted for the exact programme curriculum.",
            },
        ],
    }
}

# These are verified named-component gaps, not curriculum declarations. Keep
# the source-backed candidate course rows for audit, but do not certify the
# partial slice or expose inherited domain links until each named component
# and offering context has a reviewed course/outcome scope.
MANUAL_SCOPE_REVIEW_HOLDS = {}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (value or "").lower())


def course_prefix(code: str) -> str:
    return re.sub(r"[^A-Z]", "", (code or "").upper()).rstrip("0123456789")


def terms_for(name: str) -> set[str]:
    terms: set[str] = set()
    for word in re.findall(r"[a-z]+", name.lower()):
        if word in STOP:
            continue
        terms.update(ALIASES.get(word, [word]))
    return terms


def source_registry() -> dict[tuple[str, str], list[tuple[str, dict]]]:
    result = defaultdict(list)
    for path in (ROOT / "ccmas").glob("*.json"):
        document = load(path)
        for programme in document.get("programmes", []):
            result[(document["discipline"], programme["name"])].append((path.name, programme))
    return result


def resolve_source_programme(
    programmes: dict[tuple[str, str], list[tuple[str, dict]]],
    component: dict,
) -> tuple[str, dict] | None:
    candidates = programmes.get((component.get("discipline"), component.get("name")), [])
    code = component.get("ccmas_code") or component.get("code")
    if code:
        coded = [item for item in candidates if item[1].get("code") == code]
        if len(coded) == 1:
            return coded[0]
    return candidates[0] if len(candidates) == 1 else None


def resolve_full_component_courses(
    component_ref: str,
    programmes: dict[tuple[str, str], list[tuple[str, dict]]],
    external_curricula: dict[str, tuple[str, dict]],
) -> tuple[list[dict], dict]:
    """Load one entire declared CCMAS or custom curriculum component exactly."""
    discipline, separator, programme_name = (component_ref or "").partition("::")
    if not separator or not discipline or not programme_name:
        return [], {"component_ref": component_ref, "status": "invalid_component_reference"}
    if discipline == "__custom__":
        external_item = external_curricula.get(programme_name)
        if not external_item:
            return [], {"component_ref": component_ref, "status": "custom_curriculum_not_found"}
        source_file, programme = external_item
        courses = []
        for source_course in programme.get("courses", []):
            course = dict(source_course)
            # Some custom bundles are explicitly assembled from named CCMAS
            # course records. Resolve those identities back to the full source
            # package so summaries/outcomes and workload are not lost merely
            # because the custom bundle stores a compact course reference.
            source_code = str(source_course.get("source_ccmas_programme") or "").strip()
            source_discipline = str(source_course.get("source_ccmas_discipline") or "").strip()
            code = str(source_course.get("code") or "").strip().upper()
            title = norm(str(source_course.get("title") or ""))
            source_matches = []
            if source_code and source_discipline and code and title:
                for (candidate_discipline, _candidate_name), package_rows in programmes.items():
                    if candidate_discipline != source_discipline:
                        continue
                    for package_file, package in package_rows:
                        if str(package.get("code") or "").strip().upper() != source_code:
                            continue
                        for package_course in package.get("courses", []):
                            if (str(package_course.get("code") or "").strip().upper() == code
                                    and norm(str(package_course.get("title") or "")) == title):
                                source_matches.append((package_file, package, package_course))
            if len(source_matches) == 1:
                package_file, package, package_course = source_matches[0]
                course = {**package_course, **source_course}
                # Source text always wins for curriculum fields; bundle-specific
                # labels/attribution remain below as metadata.
                for field in ("content_summary", "skills_learned", "units", "status", "lh", "ph"):
                    if package_course.get(field) is not None:
                        course[field] = package_course[field]
                course["source_ccmas_file"] = package_file
                course["source_ccmas_programme"] = package.get("name")
            elif source_code and source_discipline:
                return [], {
                    "component_ref": component_ref,
                    "status": "declared_ccmas_course_not_unique_or_missing",
                    "course_code": code,
                    "source_ccmas_programme": source_code,
                    "candidate_count": len(source_matches),
                }
            course.update({
                "source_external_file": source_file,
                "source_external_programme": programme.get("programme", programme_name),
                "source_kind": course.get("source_kind") or ("ccmas_related" if course.get("source_ccmas_file") else "external_curriculum"),
                "scope_match_terms": [programme_name],
                "scope_facet": programme_name,
            })
            courses.append(course)
        external_sources = programme.get("sources", []) or (programme.get("enrichment_basis") or {}).get("sources", [])
        derived_ccmas_files = sorted({course.get("source_ccmas_file") for course in courses if course.get("source_ccmas_file")})
        if external_sources:
            source_evidence = []
            for item in external_sources:
                if isinstance(item, str):
                    source_evidence.append({
                        "url": item,
                        "locator": next((course.get("source_locator") for course in courses if course.get("source_locator")), None),
                        "accessed_on": next((course.get("source_accessed_on") for course in courses if course.get("source_accessed_on")), None),
                        "role": (programme.get("enrichment_basis") or {}).get("note") or "programme-level source recorded in the repository enrichment bundle",
                    })
                else:
                    source_evidence.append({
                        "authority": item.get("institution"),
                        "url": item.get("url"),
                        "locator": item.get("locator"),
                        "accessed_on": item.get("accessed_on"),
                        "role": item.get("role"),
                    })
            if any(not item.get("url") or not item.get("role") for item in source_evidence):
                return [], {"component_ref": component_ref, "status": "programme_source_metadata_incomplete", "source_file": source_file}
        elif derived_ccmas_files:
            source_evidence = [{"source_ccmas_file": item, "role": "declared related CCMAS curriculum source"} for item in derived_ccmas_files]
        else:
            source_evidence = []
        if not source_evidence:
            return [], {"component_ref": component_ref, "status": "programme_source_evidence_missing", "source_file": source_file}
    else:
        matches = programmes.get((discipline, programme_name), [])
        if len(matches) != 1:
            return [], {"component_ref": component_ref, "status": "ccmas_package_not_unique", "candidate_count": len(matches)}
        source_file, programme = matches[0]
        courses = []
        for source_course in programme.get("courses", []):
            course = dict(source_course)
            course.update({
                "source_ccmas_file": source_file,
                "source_ccmas_programme": programme["name"],
                "scope_match_terms": [programme_name],
                "scope_facet": programme_name,
            })
            courses.append(course)
    if not courses or any(not course.get("code") or not course.get("title") for course in courses):
        return [], {"component_ref": component_ref, "status": "course_identity_incomplete", "course_count": len(courses)}
    result = {"component_ref": component_ref, "status": "resolved", "source_file": source_file, "course_count": len(courses)}
    if discipline == "__custom__":
        result["source_evidence"] = source_evidence
    return courses, result


def combine_component_domain_links(component_links: list[tuple[str, list[dict]]]) -> list[dict]:
    """Union component links; for the same domain retain the strongest evidenced tier."""
    tier_rank = {"adjacent": 1, "functional": 2, "direct": 3}
    grouped: dict[str, list[tuple[str, dict]]] = defaultdict(list)
    for component_ref, links in component_links:
        for link in links:
            grouped[str(link.get("domain_id") or "")].append((component_ref, link))
    result = []
    for domain_id, supports in grouped.items():
        strongest_rank = max(tier_rank.get(link.get("match_type"), 0) for _, link in supports)
        strongest = [(ref, link) for ref, link in supports if tier_rank.get(link.get("match_type"), 0) == strongest_rank]
        if not strongest_rank:
            continue
        base = dict(strongest[0][1])
        component_supports = [
            {
                "component_ref": ref,
                "match_type": link.get("match_type"),
                "scope_course_codes": link.get("scope_course_codes", []),
                "scope_course_titles": link.get("scope_course_titles", []),
            }
            for ref, link in supports
        ]
        base["component_refs"] = sorted({ref for ref, _ in supports})
        base["component_supports"] = component_supports
        base["scope_course_titles"] = sorted({title for _, link in strongest for title in link.get("scope_course_titles", [])})
        base["scope_course_codes"] = sorted({code for _, link in strongest for code in link.get("scope_course_codes", [])})
        base["scope_course_count"] = len(base["scope_course_codes"])
        base["match_type"] = strongest[0][1].get("match_type")
        base["source"] = "combined_ccmas_component_course_evidence"
        result.append(base)
    return sorted(result, key=lambda item: (str(item.get("domain_id")), str(item.get("match_type"))))


def resolve_manual_scope_courses(
    override: dict,
    component_refs: list[str],
    programmes: dict[tuple[str, str], list[tuple[str, dict]]],
    external_curricula: dict[str, tuple[str, dict]] | None = None,
) -> list[dict]:
    """Resolve explicit, manually sourced course codes across CCMAS components.

    This path is intentionally exact-match and fail-closed. It never chooses
    courses from title keywords and never derives domain links; the override
    record must carry the evidence and a separate later pass must review
    downstream mappings.
    """
    selected: list[dict] = []
    seen: set[tuple[str, str]] = set()
    allowed_components = set(component_refs)
    component_courses = override.get("component_courses", [])
    configured_components = {item.get("component_ref") for item in component_courses}
    undeclared_components = configured_components - allowed_components
    if undeclared_components:
        raise ValueError(
            f"{override.get('jamb_name')}: manual scope components are not declared "
            f"in the canonical component references: {sorted(undeclared_components)}"
        )
    missing_components = allowed_components - configured_components
    unexplained = missing_components - set(override.get("unrepresented_component_reasons", {}))
    if unexplained:
        raise ValueError(
            f"{override.get('jamb_name')}: declared CCMAS components lack selected courses "
            f"or an explicit reason: {sorted(unexplained)}"
        )
    external_curricula = external_curricula or {}
    for component in component_courses:
        component_ref = component.get("component_ref")
        if component_ref not in allowed_components:
            raise ValueError(
                f"{override.get('jamb_name')}: manual scope component {component_ref!r} "
                "is not declared in the canonical component references"
            )
        discipline, separator, programme_name = (component_ref or "").partition("::")
        if not separator or not discipline or not programme_name:
            raise ValueError(f"Invalid CCMAS component reference: {component_ref!r}")
        is_external = discipline == "__custom__"
        if is_external:
            external_item = external_curricula.get(programme_name)
            if not external_item:
                raise ValueError(
                    f"{override.get('jamb_name')}: expected external curriculum for "
                    f"{component_ref!r}, found none"
                )
            source_file, source_programme = external_item
        else:
            candidates = programmes.get((discipline, programme_name), [])
            if len(candidates) != 1:
                raise ValueError(
                    f"{override.get('jamb_name')}: expected one source programme for "
                    f"{component_ref!r}, found {len(candidates)}"
                )
            source_file, source_programme = candidates[0]
        courses_by_code: dict[str, list[dict]] = defaultdict(list)
        for course in source_programme.get("courses", []):
            courses_by_code[str(course.get("code", "")).strip()].append(course)
        codes = component.get("course_codes", [])
        if component.get("all_source_courses") is True:
            codes = [str(course.get("code", "")).strip() for course in source_programme.get("courses", [])]
            if not codes or any(not code for code in codes):
                raise ValueError(
                    f"{override.get('jamb_name')}: {component_ref} full-package selection "
                    "contains a missing course code"
                )
        if not codes:
            raise ValueError(f"{override.get('jamb_name')}: empty course list for {component_ref}")
        for code in codes:
            exact = courses_by_code.get(str(code).strip(), [])
            if len(exact) != 1:
                raise ValueError(
                    f"{override.get('jamb_name')}: {component_ref} course {code!r} "
                    f"must resolve exactly once, found {len(exact)}"
                )
            identity = (component_ref, str(code).strip())
            if identity in seen:
                raise ValueError(f"Duplicate manual course reference: {identity}")
            seen.add(identity)
            item = dict(exact[0])
            item.update({
                "scope_match_terms": [component.get("facet", programme_name)],
                "scope_facet": component.get("facet", programme_name),
            })
            if is_external:
                item["source_external_file"] = source_file
                item["source_external_programme"] = source_programme.get("programme", programme_name)
            else:
                item["source_ccmas_file"] = source_file
                item["source_ccmas_programme"] = source_programme["name"]
            selected.append(item)
    if not selected:
        raise ValueError(f"{override.get('jamb_name')}: manual scope selected no CCMAS courses")
    return selected


def external_registry() -> dict[str, tuple[str, dict]]:
    result = {}
    for path in (ROOT / "enrichment").glob("*.json"):
        document = load(path)
        result[document["programme"]] = (path.name, document)
    return result


def select_courses(name: str, programme: dict) -> tuple[list[dict], str]:
    courses = programme.get("courses", [])
    prefixes = set(MANUAL_CODE_PREFIXES.get(name, []))
    if prefixes:
        selected = [c for c in courses if course_prefix(c.get("code")) in prefixes]
        return selected, "manual_ccmas_code_family"

    terms = terms_for(name)
    hits = []
    for course in courses:
        haystack = " ".join(
            [course.get("title") or "", course.get("content_summary") or ""]
        ).lower()
        matched = sorted(term for term in terms if term in haystack)
        if matched:
            hits.append((course, matched))

    selected = []
    for course, matched in hits:
        item = dict(course)
        item["scope_match_terms"] = matched
        selected.append(item)
    return selected, "ccmas_title_or_content_anchor"


GENERIC_DOMAIN_ANCHORS = {
    "analysis", "business", "communication", "data", "development", "education",
    "general", "health", "information", "knowledge", "management", "market",
    "marketing", "professional", "research", "science", "service", "services",
    "social", "study", "studies", "system", "systems", "technology", "work",
}

def specific_anchor_families(anchors: list[dict]) -> dict[str, set[str]]:
    """Return repeated non-generic concept cues, grouped by distinct source course."""
    family_by_term = {"marketing": "market", "markets": "market", "market": "market"}
    result: dict[str, set[str]] = defaultdict(set)
    for anchor in anchors:
        identity = norm(anchor.get("course_identity"))
        if not identity:
            continue
        for raw_term in anchor.get("matched_anchors") or []:
            words = re.findall(r"[a-z0-9]+", str(raw_term).casefold())
            specific_words = [word for word in words if word not in GENERIC_DOMAIN_ANCHORS]
            if not specific_words:
                continue
            term = "".join(specific_words)
            result[family_by_term.get(term, term)].add(identity)
    return result


def supported_links(programme_key: str, selected: list[dict], links: dict, evidence: dict) -> list[dict]:
    selected_course_ids = {
        norm(f"{c.get('code', '')}::{c.get('title', '')}")
        for c in selected
        if c.get("code") and c.get("title")
    }
    result = []
    parent = links.get(programme_key, {}).get("links", [])
    for link in parent:
        record = evidence.get(f"{programme_key}::{link.get('domain_id')}") or {}
        # The parent mapping may contain a link that the programme-level
        # evidence audit itself marked weak.  A partial/custom curriculum must
        # not inherit that weak fan-out merely because one selected course
        # happens to contain a generic anchor word.
        if record.get("review_required"):
            continue
        anchors = record.get("course_anchors", [])
        supported = [
            c for c in anchors if norm(c.get("course_identity")) in selected_course_ids
        ]
        # Reapply the relationship evidence gate to this JAMB-specific slice;
        # a parent CCMAS package passing is not enough if the narrower slice
        # carries too little evidence for the same Direct/Functional tier.
        # Direct and Functional require two distinct source course anchors.
        # Adjacent requires one course anchor plus transferable evidence from
        # a course in this selected slice (not merely the parent package).
        supported_ids = {
            norm(c.get("course_identity"))
            for c in supported
            if c.get("course_identity")
        }
        transferable = [
            item for item in (record.get("transferable_evidence") or [])
            if norm(item.get("course_identity")) in selected_course_ids
        ]
        repeated_specific_families = {
            family: identities
            for family, identities in specific_anchor_families(supported).items()
            if len(identities) >= 2
        }
        match_type = link.get("match_type")
        if match_type in {"direct", "functional"} and (
            len(supported_ids) < 2 or not repeated_specific_families
        ):
            continue
        if match_type == "adjacent" and (
            not supported_ids or not transferable or not specific_anchor_families(supported)
        ):
            continue
        if match_type not in {"direct", "functional", "adjacent"} or not supported:
            continue
        item = dict(link)
        item["source"] = "jamb_curriculum_scope_ccmas_course_anchors"
        item["scope_course_titles"] = [c.get("title") for c in supported]
        item["scope_course_codes"] = sorted({str(c.get("code")) for c in supported if c.get("code")})
        item["scope_course_count"] = len(supported)
        item["scope_anchor_gate"] = {
            "relationship": match_type,
            "distinct_source_course_anchors": len(supported_ids),
            "repeated_specific_anchor_families": sorted(repeated_specific_families),
            "transferable_evidence_anchors": len(transferable),
            "gate": "two_scoped_courses_plus_one_repeated_specific_anchor_family" if match_type in {"direct", "functional"} else "one_scoped_course_anchor_plus_scoped_transferable_evidence_plus_specific_anchor",
        }
        result.append(item)
    return result


def supported_external_links(
    custom: dict,
    links: dict,
    evidence: dict,
    programmes: dict[tuple[str, str], tuple[str, dict]],
) -> list[dict]:
    """Map a custom curriculum through the CCMAS course anchors it explicitly reuses.

    D_custom has no CCMAS programme of its own, but the repository's reviewed
    enrichments identify the related CCMAS programme for every course.  The
    external curriculum selects those courses; the parent CCMAS domain link is
    exposed only when that exact course is an anchor for the domain.
    """
    by_source: dict[str, list[dict]] = defaultdict(list)
    for course in custom.get("courses", []):
        source_code = course.get("source_ccmas_programme")
        source_disc = course.get("source_ccmas_discipline")
        if not source_code or not source_disc:
            continue
        source_programme = next(
            (
                (key, item)
                for key, candidates in programmes.items()
                for _source_file, item in candidates
                if key[0] == source_disc and item.get("code") == source_code
            ),
            None,
        )
        if source_programme:
            by_source[f"{source_programme[0][0]}::{source_programme[0][1]}"].append(course)

    result = []
    for programme_key, selected in by_source.items():
        for link in supported_links(programme_key, selected, links, evidence):
            item = dict(link)
            item["external_source_programmes"] = [programme_key]
            result.append(item)
    deduped = {}
    for link in result:
        key = link.get("domain_id")
        if not key:
            continue
        current = deduped.get(key)
        if current is None:
            item = dict(link)
            item["source"] = "jamb_external_curriculum_ccmas_course_anchors"
            deduped[key] = item
        else:
            current["scope_course_titles"] = sorted(set(current.get("scope_course_titles", [])) | set(link.get("scope_course_titles", [])))
            current["scope_course_codes"] = sorted(set(current.get("scope_course_codes", [])) | set(link.get("scope_course_codes", [])))
            current["external_source_programmes"] = sorted(set(current.get("external_source_programmes", [])) | set(link.get("external_source_programmes", [])))
    return list(deduped.values())


def anthropology_links(custom: dict) -> list[dict]:
    """Return only the independently source-supported Anthropology links.

    The Anthropology enrichment has no CCMAS code.  Its source-backed course
    titles support Social Sciences directly and cultural-heritage work
    functionally; no wider domain fan-out is inferred from the word
    "anthropology" alone.
    """
    titles = " ".join(course.get("title") or "" for course in custom.get("courses", [])).lower()
    links = []
    if "anthropology" in titles or "societies" in titles or "culture" in titles:
        links.append({
            "domain_id": "D078",
            "domain_name": "Social Sciences",
            "match_type": "direct",
            "source": "jamb_external_curriculum_anthropology_sources",
            "scope_course_titles": [course.get("title") for course in custom.get("courses", []) if course.get("title")],
        })
    if "heritage" in titles or "ethnography" in titles or "cultures" in titles:
        links.append({
            "domain_id": "D152",
            "domain_name": "Museum Curation, Cultural Heritage, Archives",
            "match_type": "functional",
            "source": "jamb_external_curriculum_anthropology_sources",
            "scope_course_titles": [course.get("title") for course in custom.get("courses", []) if "heritage" in (course.get("title") or "").lower() or "ethnography" in (course.get("title") or "").lower() or "cultures" in (course.get("title") or "").lower()],
        })
    return links


def course_source_provenance(course: dict, scope_evidence: list[dict]) -> dict[str, str | None]:
    """Carry course citations forward, or anchor a CCMAS course to its package evidence.

    Some extracted CCMAS rows have precise printed-page metadata while older
    records rely on the programme-level CCMAS locator. Preserve the precise
    citation when present; otherwise pair the authoritative package locator
    with the exact course code/title so a selected scope never loses its source
    anchor during materialization.
    """
    url = course.get("source_url")
    locator = course.get("source_locator")
    accessed_on = course.get("source_accessed_on")
    programme = course.get("source_ccmas_programme")

    if programme:
        package_evidence = next(
            (
                evidence
                for evidence in scope_evidence
                if "National Universities Commission" in evidence.get("authority", "")
                and "CCMAS" in evidence.get("title", "")
                and programme.lower() in evidence.get("locator", "").lower()
            ),
            None,
        )
        if package_evidence:
            url = url or package_evidence.get("url")
            if not locator and package_evidence.get("locator"):
                locator = (
                    f"{package_evidence['locator']} Exact course anchor: "
                    f"{course.get('code')} — {course.get('title')}."
                )
            accessed_on = accessed_on or package_evidence.get("accessed_on")

    return {
        "source_url": url,
        "source_locator": locator,
        "source_accessed_on": accessed_on,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=OUTPUT, help="scope output path; default is the canonical local scope ledger")
    parser.add_argument("--domain-evidence", type=Path, default=DOMAIN_EVIDENCE, help="programme-domain evidence JSON")
    args = parser.parse_args()
    mapping = load(MAPPING)
    canonical = load(CANONICAL)["rows"]
    programmes = source_registry()
    externals = external_registry()
    manual_scope_doc = load(MANUAL_SCOPE_OVERRIDES) if MANUAL_SCOPE_OVERRIDES.exists() else {"overrides": []}
    manual_scope_overrides = {}
    for override in manual_scope_doc.get("overrides", []):
        name = override.get("jamb_name")
        if not name or name in manual_scope_overrides:
            raise ValueError(f"Missing or duplicate manual JAMB scope override: {name!r}")
        if override.get("domain_links"):
            raise ValueError(f"Manual scope override may not publish domain links: {name}")
        required_scope_fields = ("scope_status", "scope_approval", "scope_reason", "source_evidence")
        if any(not override.get(field) for field in required_scope_fields):
            raise ValueError(f"Manual JAMB scope override is missing review/evidence fields: {name}")
        for source in override.get("source_evidence", []):
            if any(not source.get(field) for field in ("authority", "url", "locator", "supports", "accessed_on")):
                raise ValueError(f"Manual JAMB scope override has incomplete source evidence: {name}")
        manual_scope_overrides[name] = override
    parent_links = load(PROGRAMME_DOMAINS)
    evidence = load(args.domain_evidence)
    mapping_by_name = {row["jamb_name"]: row for row in mapping["mappings"]}
    rows = []
    for row in canonical:
        name = row["jamb_name"]
        inheritance = row["inheritance_type"]
        components = row.get("component_refs", [])
        selected = []
        scope_method = None
        scope_status = "full"
        scope_reason = "resolved CCMAS programme is inherited in full"
        scope_approval = "not_applicable"
        domain_links = row.get("domain_links", [])
        scope_evidence = []
        source_context = None

        manual_override = manual_scope_overrides.get(name)
        if manual_override and inheritance != "combined_ccmas_curriculum" and any(
            item.get("all_source_courses") for item in manual_override.get("component_courses", [])
        ):
            resolved_components = []
            component_links = []
            scope_evidence = manual_override.get("source_evidence", [])
            for component in manual_override.get("component_courses", []):
                component_ref = component.get("component_ref")
                component_courses, resolution = resolve_full_component_courses(
                    component_ref, programmes, externals
                )
                resolved_components.append(resolution)
                if component_courses:
                    selected.extend(component_courses)
                    component_links.append((component_ref, supported_links(component_ref, component_courses, parent_links, evidence)))
            all_resolved = bool(resolved_components) and all(item.get("status") == "resolved" for item in resolved_components)
            domain_links = combine_component_domain_links(component_links)
            scope_method = "full_declared_ccmas_component_curriculum"
            scope_status = "full" if all_resolved else "full_scope_review_required"
            scope_approval = "reviewed" if all_resolved else "pending_review"
            scope_reason = (
                "all courses in the exact declared CCMAS component are selected; domain paths are independently evidence-gated"
                if all_resolved
                else "the exact declared CCMAS component did not resolve uniquely"
            )
            source_context = {
                "components": resolved_components,
                "combination_rule": "full_declared_ccmas_component",
                "offering_context": manual_override.get("context"),
            }
        elif manual_override and inheritance not in {
            "combined_ccmas_curriculum",
            "single_ccmas_full_curriculum",
        } and name not in FULL_COMPONENT_SCOPE_ALIASES:
            selected = resolve_manual_scope_courses(manual_override, components, programmes, externals)
            scope_method = "manual_ccmas_course_outcome_scope"
            scope_status = manual_override.get("scope_status", "partial_scope_review_required")
            scope_reason = manual_override.get("scope_reason", "Manually selected CCMAS courses; see row-level evidence.")
            scope_approval = manual_override.get("scope_approval", "pending_review")
            domain_links = []
            scope_evidence = manual_override.get("source_evidence", [])
            source_context = manual_override.get("context")
        elif name in FULL_COMPONENT_SCOPE_ALIASES:
            resolved_components = []
            component_links = []
            scope_evidence = (manual_override or {}).get("source_evidence", [])
            for component_ref in components:
                component_courses, resolution = resolve_full_component_courses(
                    component_ref, programmes, externals
                )
                resolved_components.append(resolution)
                if component_courses:
                    selected.extend(component_courses)
                    component_links.append((component_ref, supported_links(
                        component_ref, component_courses, parent_links, evidence
                    )))
            all_resolved = bool(components) and all(
                item.get("status") == "resolved" for item in resolved_components
            )
            domain_links = combine_component_domain_links(component_links)
            if name in MANUAL_SCOPE_DOMAIN_LINKS:
                domain_links = MANUAL_SCOPE_DOMAIN_LINKS[name]
            scope_method = "full_declared_ccmas_component_curriculum_alias"
            scope_status = (
                "combined_scope_reviewed"
                if all_resolved and len(resolved_components) > 1
                else "full" if all_resolved else "full_scope_review_required"
            )
            scope_approval = "reviewed" if all_resolved else "pending_review"
            scope_reason = (
                "JAMB title is an evidenced programme variant; complete declared CCMAS reference packages are selected, with each domain path independently evidence-gated and any published options retained as separate reference branches"
                if all_resolved
                else "the exact CCMAS curriculum component for this explicit JAMB alias did not resolve uniquely"
            )
            source_context = {
                "components": resolved_components,
                "combination_rule": "full_declared_ccmas_component_alias",
                "offering_context": (manual_override or {}).get("context"),
            }
        elif inheritance == "partial_curriculum_scope":
            # A CCMAS-backed mapping must not be overridden by a legacy
            # enrichment file merely because a same-name custom file exists.
            # External enrichment is only the primary scope when no CCMAS
            # discipline is resolved for the JAMB identity.
            if (name in EXTERNAL_SCOPE_NAMES or name in externals) and not row.get("ccmas_discipline"):
                custom_item = externals.get(name)
                explicit_links = (custom_item[1].get("external_domain_links", []) if custom_item else [])
                if custom_item and explicit_links:
                    selected, resolution = resolve_full_component_courses(
                        f"__custom__::{name}", programmes, externals
                    )
                    source_context = {"components": [resolution], "combination_rule": "single_declared_external_curriculum"}
                    scope_status = "external_scope_evidenced" if resolution.get("status") == "resolved" else "external_scope_review_required"
                    scope_reason = (
                        "repo enrichment bundle and its declared programme-level source evidence resolve"
                        if resolution.get("status") == "resolved"
                        else f"external curriculum component did not resolve: {resolution.get('status')}"
                    )
                    scope_approval = "reviewed" if resolution.get("status") == "resolved" else "pending_review"
                    domain_links = explicit_links
                else:
                    scope_status = "external_source_required"
                    scope_reason = "resolved CCMAS parent has no programme-specific curriculum and no explicit external scope"
                    scope_approval = "external_required"
            else:
                component = row.get("primary_component") or {}
                registry_item = resolve_source_programme(programmes, component)
                if registry_item:
                    source_file, programme = registry_item
                    selected, scope_method = select_courses(name, programme)
                    for course in selected:
                        course["source_ccmas_file"] = source_file
                        course["source_ccmas_programme"] = programme["name"]
                    if selected:
                        selected_codes = {str(course.get("code")) for course in selected}
                        all_codes = {str(course.get("code")) for course in programme.get("courses", [])}
                        # A selected slice is certifiable when it is traceable to
                        # the current CCMAS programme and at least one active
                        # domain link is anchored to a selected course. This is
                        # the deterministic approval rule for JAMB variants:
                        # it prevents full-parent inheritance without creating a
                        # manual hold for a reproducible source-backed slice.
                        scope_approval = "pending_review"
                        if (
                            scope_method == "manual_ccmas_code_family"
                            or name in MANUAL_SCOPE_DOMAIN_LINKS
                            or (all_codes and selected_codes == all_codes)
                        ):
                            scope_approval = "reviewed"
                        domain_links = supported_links(
                            f"{component['discipline']}::{component['name']}",
                            selected,
                            parent_links,
                            evidence,
                        )
                        if name in MANUAL_SCOPE_DOMAIN_LINKS:
                            domain_links = MANUAL_SCOPE_DOMAIN_LINKS[name]
                        if domain_links:
                            scope_approval = "reviewed"
                        scope_reason = (
                            "source-anchored CCMAS course slice with active domain evidence is approved"
                            if scope_approval == "reviewed"
                            else "JAMB name produced a title/content candidate slice; curriculum inheritance still requires review"
                        )
                        scope_status = (
                            "partial_scope_reviewed"
                            if scope_approval == "reviewed" and domain_links
                            else "partial_scope_review_required"
                        )
                    else:
                        scope_status = "external_source_required"
                        scope_reason = "no course-title/content anchor in the resolved CCMAS programme"
                        scope_approval = "external_required"
                else:
                    scope_status = "external_source_required"
                    scope_reason = "resolved CCMAS programme source is unavailable"
                    scope_approval = "external_required"
        elif inheritance == "combined_ccmas_curriculum":
            # For a mapped combined JAMB identity, use every explicitly
            # declared CCMAS curriculum component. CCMAS is the national
            # curriculum proxy; we do not claim this is a university-specific
            # course selection. Domain links are still independently gated
            # against evidence from the courses in each component.
            resolved_components = []
            component_links = []
            # Keep programme-level JAMB/CCMAS/external citations from any
            # curated offering override, while the declared component refs
            # determine the full curriculum union below.
            scope_evidence = (manual_override or {}).get("source_evidence", [])
            for component_ref in components:
                component_courses, resolution = resolve_full_component_courses(
                    component_ref, programmes, externals
                )
                resolved_components.append(resolution)
                if component_courses:
                    selected.extend(component_courses)
                    component_links.append((component_ref, supported_links(component_ref, component_courses, parent_links, evidence)))
            all_resolved = bool(components) and all(item["status"] == "resolved" for item in resolved_components)
            domain_links = combine_component_domain_links(component_links)
            scope_method = "combined_full_declared_ccmas_curricula"
            scope_status = "combined_scope_reviewed" if all_resolved else "combined_scope_review_required"
            scope_reason = (
                "the full current CCMAS curriculum was joined for every declared component; "
                "domain links are limited to component course evidence"
                if all_resolved
                else "one or more declared combined curriculum components did not resolve uniquely"
            )
            scope_approval = "reviewed" if all_resolved else "pending_review"
            source_context = {
                "components": resolved_components,
                "combination_rule": "union_all_declared_component_curricula",
                "offering_context": (manual_override or {}).get("context"),
                "external_component_qualifications": (manual_override or {}).get("external_component_qualifications", []),
            }
        elif inheritance == "single_ccmas_full_curriculum":
            # A canonical full-curriculum JAMB mapping must carry the actual
            # complete CCMAS package in the scope ledger. The previous default
            # left `selected` empty, which made downstream domain links appear
            # to reference unselected courses even when they were anchored in
            # the declared package.
            resolved_components = []
            component_links = []
            for component_ref in components:
                component_courses, resolution = resolve_full_component_courses(
                    component_ref, programmes, externals
                )
                resolved_components.append(resolution)
                if component_courses:
                    selected.extend(component_courses)
                    component_links.append((component_ref, supported_links(
                        component_ref, component_courses, parent_links, evidence
                    )))
            all_resolved = bool(components) and all(
                item.get("status") == "resolved" for item in resolved_components
            )
            domain_links = combine_component_domain_links(component_links)
            scope_method = "full_declared_ccmas_component_curriculum"
            scope_status = "full" if all_resolved else "full_scope_review_required"
            scope_approval = "reviewed" if all_resolved else "pending_review"
            scope_reason = (
                "all courses in the exact declared CCMAS component are selected; domain paths are independently evidence-gated"
                if all_resolved
                else "the exact declared CCMAS component did not resolve uniquely"
            )
            source_context = {
                "components": resolved_components,
                "combination_rule": "full_declared_ccmas_component",
                "offering_context": (manual_override or {}).get("context"),
            }
        elif inheritance == "external_sources_required":
            custom_item = externals.get(name)
            if custom_item:
                selected, resolution = resolve_full_component_courses(
                    f"__custom__::{name}", programmes, externals
                )
                source_context = {"components": [resolution], "combination_rule": "single_declared_external_curriculum"}
                resolved = resolution.get("status") == "resolved"
                scope_status = "external_scope_evidenced" if resolved else "external_scope_review_required"
                scope_reason = (
                    "repo enrichment bundle and its declared programme-level source evidence resolve"
                    if resolved
                    else f"external curriculum component did not resolve: {resolution.get('status')}"
                )
                scope_approval = "reviewed" if resolved else "pending_review"
                scope_method = "external_enrichment_course_list"
                domain_links = custom_item[1].get("external_domain_links") or supported_external_links(
                    custom_item[1], parent_links, evidence, programmes
                )
                if name == "Anthropology":
                    anthropology_links_found = anthropology_links(custom_item[1])
                    existing = {link.get("domain_id"): link for link in domain_links}
                    for link in anthropology_links_found:
                        existing.setdefault(link.get("domain_id"), link)
                    domain_links = list(existing.values())
            else:
                # An external-only identity without a matching repository
                # curriculum bundle must not inherit the initialized `full`
                # status or any parent curriculum/domain links by accident.
                selected = []
                domain_links = []
                scope_method = "no_resolved_external_curriculum"
                disposition = EXTERNAL_SCOPE_VERIFIED_NO_CURRICULUM.get(name)
                if disposition:
                    scope_status = "external_scope_verified_no_curriculum"
                    scope_reason = disposition["reason"]
                    scope_approval = "reviewed_unsupported"
                    scope_evidence = disposition["evidence"]
                    source_context = {
                        "components": [],
                        "combination_rule": "no_supported_curriculum_source_after_external_check",
                        "student_guidance": "unsupported_no_curriculum",
                    }
                else:
                    scope_status = "external_source_required"
                    scope_reason = "no exact CCMAS component or repository external curriculum bundle resolves for this JAMB identity"
                    scope_approval = "external_required"
                    source_context = {"components": [], "combination_rule": "no_supported_curriculum_source"}

        if name in MANUAL_SCOPE_REVIEW_HOLDS:
            scope_status = "partial_scope_review_required"
            scope_reason = MANUAL_SCOPE_REVIEW_HOLDS[name]
            scope_approval = "pending_review"
            domain_links = []

        rows.append({
            "jamb_name": name,
            "mapping_type": mapping_by_name[name].get("mapping_type"),
            "inheritance_type": inheritance,
            "component_refs": components,
            "scope_status": scope_status,
            "scope_reason": scope_reason,
            "scope_approval": scope_approval,
            "scope_selection_method": scope_method,
            "source_context": source_context,
            "scope_evidence": scope_evidence,
            "source_contexts": (manual_override or {}).get("source_contexts", []),
            "unrepresented_facets": (manual_scope_overrides.get(name) or {}).get("unrepresented_facets", []),
            "facet_qualifications": (manual_scope_overrides.get(name) or {}).get("facet_qualifications", []),
            "selected_courses": [
                {
                    "code": c.get("code"),
                    "title": c.get("title"),
                    "units": c.get("units"),
                    "status": c.get("status"),
                    "lecture_hours": c.get("lh"),
                    "practical_hours": c.get("ph"),
                    "content_summary": c.get("content_summary"),
                    "learning_outcomes": c.get("skills_learned", []),
                    "scope_match_terms": c.get("scope_match_terms", []),
                    "scope_facet": c.get("scope_facet"),
                    "source_ccmas_file": c.get("source_ccmas_file"),
                    "source_ccmas_programme": c.get("source_ccmas_programme"),
                    "source_external_file": c.get("source_external_file"),
                    "source_external_programme": c.get("source_external_programme"),
                    "source_kind": c.get("source_kind"),
                    "source_institution": c.get("source_institution"),
                    "outcomes_basis": c.get("outcomes_basis"),
                    "outcomes_source_url": c.get("outcomes_source_url"),
                    "outcomes_source_locator": c.get("outcomes_source_locator"),
                    **course_source_provenance(c, scope_evidence),
                }
                for c in selected
            ],
            "domain_links": domain_links,
        })

    output = {
        "schema_version": 1,
        "contract": "Partial JAMB rows expose only domains anchored by the selected CCMAS courses; no-anchor rows require external curriculum evidence.",
        "source_files": [
            "programme_mapping.json",
            "ccmas/*.json",
            "programme_domain_final.json",
            "_audit/programme_domain_evidence_2026-08-17.json",
            "enrichment/*.json",
            "_audit/jamb_ccmas_manual_scope_overrides_2026-09-25.json",
        ],
        "rows": rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    from collections import Counter
    print("scope_status", dict(Counter(row["scope_status"] for row in rows)))
    print("partial_with_scope", sum(row["inheritance_type"] == "partial_curriculum_scope" and row["scope_status"] == "partial_scope_reviewed" for row in rows))
    print("partial_external", sum(row["inheritance_type"] == "partial_curriculum_scope" and row["scope_status"] == "external_source_required" for row in rows))
    print("partial_domain_links", sum(len(row["domain_links"]) for row in rows if row["inheritance_type"] == "partial_curriculum_scope"))


if __name__ == "__main__":
    main()
