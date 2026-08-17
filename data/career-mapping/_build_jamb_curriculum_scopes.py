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
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING = ROOT / "programme_mapping.json"
CANONICAL = ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
PROGRAMME_DOMAINS = ROOT / "programme_domain_final.json"
DOMAIN_EVIDENCE = ROOT / "_audit" / "programme_domain_evidence_2026-08-17.json"
OUTPUT = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"


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
}

# These names have no usable programme-specific CCMAS curriculum in the
# resolved repository.  Their enrichment files carry the external curriculum
# and the independently evidenced domain links.
EXTERNAL_SCOPE_NAMES = {"French", "Sport Science", "Sport Management (Education)"}

MANUAL_SCOPE_DOMAIN_LINKS = {
    "Pasture & Range Management": [
        {
            "domain_id": "D119",
            "domain_name": "Livestock, Poultry, Dairy",
            "match_type": "direct",
            "source": "jamb_curriculum_scope_ccmas_course_title_domain_definition",
            "evidence": "ANS 409 Pasture and Range Production and Management; D119 definition covers livestock rearing on farms and ranches.",
            "scope_course_titles": ["Pasture and Range Production and Management"],
        },
        {
            "domain_id": "D047",
            "domain_name": "Agricultural Science",
            "match_type": "functional",
            "source": "jamb_curriculum_scope_ccmas_course_title_domain_definition",
            "evidence": "ANS 409 applies pasture and range management within agricultural production; D047 definition covers crop and livestock farming systems.",
            "scope_course_titles": ["Pasture and Range Production and Management"],
        },
    ]
}


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


def source_registry() -> dict[tuple[str, str], tuple[str, dict]]:
    result = {}
    for path in (ROOT / "ccmas").glob("*.json"):
        document = load(path)
        for programme in document.get("programmes", []):
            result[(document["discipline"], programme["name"])] = (path.name, programme)
    return result


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


def supported_links(programme_key: str, selected: list[dict], links: dict, evidence: dict) -> list[dict]:
    selected_titles = {norm(c.get("title")) for c in selected}
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
            c for c in anchors if norm(c.get("title")) in selected_titles
        ]
        if not supported:
            continue
        item = dict(link)
        item["source"] = "jamb_curriculum_scope_ccmas_course_anchors"
        item["scope_course_titles"] = [c.get("title") for c in supported]
        item["scope_course_count"] = len(supported)
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
                (key, item[1])
                for key, item in programmes.items()
                if key[0] == source_disc and item[1].get("code") == source_code
            ),
            None,
        )
        if source_programme:
            by_source[f"{source_programme[0][0]}::{source_programme[0][1]}"].append(course)

    result = []
    for programme_key, selected in by_source.items():
        result.extend(supported_links(programme_key, selected, links, evidence))
    deduped = {}
    for link in result:
        key = link.get("domain_id")
        if not key:
            continue
        current = deduped.get(key)
        if current is None:
            item = dict(link)
            item["source"] = "jamb_external_curriculum_ccmas_course_anchors"
            item["external_source_programmes"] = [programme_key]
            deduped[key] = item
        else:
            current["scope_course_titles"] = sorted(set(current.get("scope_course_titles", [])) | set(link.get("scope_course_titles", [])))
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


def main() -> None:
    mapping = load(MAPPING)
    canonical = load(CANONICAL)["rows"]
    programmes = source_registry()
    externals = external_registry()
    parent_links = load(PROGRAMME_DOMAINS)
    evidence = load(DOMAIN_EVIDENCE)
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
        domain_links = row.get("domain_links", [])

        if inheritance == "partial_curriculum_scope_review_required":
            if name in EXTERNAL_SCOPE_NAMES or name in externals:
                custom_item = externals.get(name)
                explicit_links = (custom_item[1].get("external_domain_links", []) if custom_item else [])
                if custom_item and explicit_links:
                    selected = [dict(course) for course in custom_item[1].get("courses", [])]
                    scope_status = "external_scope_evidenced"
                    scope_reason = "official external curriculum enrichment supplies the programme-specific scope"
                    domain_links = explicit_links
                else:
                    scope_status = "external_source_required"
                    scope_reason = "resolved CCMAS parent has no programme-specific curriculum and no explicit external scope"
            else:
                component = row.get("primary_component") or {}
                registry_item = programmes.get((component.get("discipline"), component.get("name")))
                if registry_item:
                    source_file, programme = registry_item
                    selected, scope_method = select_courses(name, programme)
                    for course in selected:
                        course["source_ccmas_file"] = source_file
                        course["source_ccmas_programme"] = programme["name"]
                    if selected:
                        scope_reason = "JAMB name selects these CCMAS course-title/content anchors"
                        domain_links = supported_links(
                            f"{component['discipline']}::{component['name']}",
                            selected,
                            parent_links,
                            evidence,
                        )
                        if name in MANUAL_SCOPE_DOMAIN_LINKS:
                            domain_links = MANUAL_SCOPE_DOMAIN_LINKS[name]
                        scope_status = (
                            "partial_scope_evidenced"
                            if domain_links
                            else "partial_scope_evidenced_domain_review_required"
                        )
                    else:
                        scope_status = "external_source_required"
                        scope_reason = "no course-title/content anchor in the resolved CCMAS programme"
                else:
                    scope_status = "external_source_required"
                    scope_reason = "resolved CCMAS programme source is unavailable"
        elif inheritance == "combined_ccmas_curriculum":
            scope_status = "combined_scope_evidenced"
            scope_reason = "primary and supporting components are explicitly declared"
            if any(ref.startswith("__custom__::") for ref in components):
                custom_name = next(ref.split("::", 1)[1] for ref in components if ref.startswith("__custom__::"))
                custom_item = externals.get(custom_name)
                if custom_item:
                    custom_links = supported_external_links(custom_item[1], parent_links, evidence, programmes)
                    if custom_name == "Anthropology":
                        custom_links += anthropology_links(custom_item[1])
                    existing = {link.get("domain_id"): link for link in domain_links}
                    for link in custom_links:
                        existing.setdefault(link.get("domain_id"), link)
                    domain_links = list(existing.values())
        elif inheritance == "external_sources_required":
            scope_status = "external_scope_evidenced"
            scope_reason = "custom enrichment contains the external curriculum"
            custom_item = externals.get(name)
            if custom_item:
                selected = [dict(course) for course in custom_item[1].get("courses", [])]
                scope_method = "external_enrichment_course_list"
                domain_links = custom_item[1].get("external_domain_links") or supported_external_links(
                    custom_item[1], parent_links, evidence, programmes
                )

        rows.append({
            "jamb_name": name,
            "mapping_type": mapping_by_name[name].get("mapping_type"),
            "inheritance_type": inheritance,
            "component_refs": components,
            "scope_status": scope_status,
            "scope_reason": scope_reason,
            "scope_selection_method": scope_method,
            "selected_courses": [
                {
                    "code": c.get("code"),
                    "title": c.get("title"),
                    "scope_match_terms": c.get("scope_match_terms", []),
                    "source_ccmas_file": c.get("source_ccmas_file"),
                    "source_ccmas_programme": c.get("source_ccmas_programme"),
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
        ],
        "rows": rows,
    }
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    from collections import Counter
    print("scope_status", dict(Counter(row["scope_status"] for row in rows)))
    print("partial_with_scope", sum(row["inheritance_type"] == "partial_curriculum_scope_review_required" and row["scope_status"] == "partial_scope_evidenced" for row in rows))
    print("partial_external", sum(row["inheritance_type"] == "partial_curriculum_scope_review_required" and row["scope_status"] == "external_source_required" for row in rows))
    print("partial_domain_links", sum(len(row["domain_links"]) for row in rows if row["inheritance_type"] == "partial_curriculum_scope_review_required"))


if __name__ == "__main__":
    main()
