#!/usr/bin/env python3
"""Populate visible domains below the role-count floor from checked sources.

This is taxonomy enrichment, not Nigerian demand estimation. Exact ESCO records
provide the role spine; existing specialist framework records remain in their
own overlay. The generated rows carry the mapping method so a later reviewer can
replace a weak cross-domain placement without mistaking it for local evidence.
"""

import json
import os
import re
import csv
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
META = os.path.join(HERE, "domain_meta.json")
BASE = os.path.join(HERE, "role_library_v3_cleaned.json")
EMERGING = os.path.join(HERE, "emerging_role_overlays.json")
ESCO = os.path.join(HERE, "taxonomies", "esco_occupations.json")
ONET_OCCUPATIONS = os.path.join(HERE, "_source_extracts", "onet_31_0", "Occupation Data.txt")
ONET_ALIASES = os.path.join(HERE, "_source_extracts", "onet_31_0", "Job Titles.txt")
CROSSWALK = os.path.join(HERE, "_tax_src", "esco_onet_crosswalk.csv")
OUT = os.path.join(HERE, "thin_domain_role_overlays.json")
SOURCE_REGISTRY = os.path.join(HERE, "domain_role_source_registry.json")
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}
ROLE_CUTOFF = 15
ROLE_TARGET = int(os.environ.get("ROLE_TARGET", "20"))

# These are title anchors, not invented roles. A candidate must match one of
# these anchors in the preferred occupation title. Alternative/job titles are
# retained for display and later review, but are not sufficient by themselves
# to place a new occupation in a domain: they are often broad or reused across
# unrelated occupations.
KEYWORDS = {
    "D132": ["aerospace", "satellite", "astronaut", "astrophysic", "astronom", "spacecraft", "orbital", "rocket", "mission control"],
    "D059": ["spacecraft", "satellite", "aerospace", "avionics", "propulsion", "orbital", "mission control", "rocket"],
    "D163": ["patent", "trademark", "intellectual property", "copyright", "licensing", "legal assistant", "corporate lawyer"],
    "D058": ["instructional", "e-learning", "elearning", "learning management", "educational", "teacher", "trainer", "curriculum", "education researcher"],
    "D137": ["radiation", "radiotherap", "radiograph", "medical physic", "radiology", "dosimetry", "oncology", "nuclear medicine"],
    "D146": ["hvac", "heating", "ventilation", "air conditioning", "electrical installation", "building automation", "fire protection", "mechanical service", "building services"],
    "D161": ["humanitarian", "emergency", "disaster", "relief", "aid worker", "refugee", "crisis", "rescue", "response coordinator"],
    "D135": ["nuclear", "radiation", "reactor", "radiochem", "radiological", "radioactive", "nuclear medicine"],
    "D144": ["climate", "meteorolog*", "weather", "atmospher*", "hydrolog*", "oceanograph*", "climatolog*"],
    "D150": ["minister of religion", "religious", "theology", "chaplain", "pastoral", "priest", "faith", "church", "imam", "religion"],
    "D003": ["artificial intelligence", "machine learning", "data scientist", "neural", "natural language", "computer vision", "deep learning", "robot*", "algorithm*"],
    "D067": ["dentist", "dental", "orthodont", "prosthodont", "oral", "maxillofacial", "hygienist"],
    "D128": ["social work", "social worker", "youth", "welfare", "community development", "caseworker", "care worker", "child protection", "foster care"],
    "D160": ["fashion", "stylist", "image consultant", "make-up", "make up", "hairdresser", "visual merch", "wardrobe", "beauty"],
    "D162": ["immigration", "asylum", "migrant", "refugee", "border", "visa", "human rights", "passport", "customs"],
    "D091": ["driving instructor", "driving teacher", "motor instructor", "driving examiner", "vehicle instructor", "railway instructor", "motorcycle instructor", "driver examiner", "road test examiner", "driver trainer", "driver education", "road tester"],
    "D096": ["agricultural machinery", "farm machinery", "tractor", "agricultural mechanic", "automotive mechanic", "vehicle technician", "equipment mechanic"],
    "D095": ["automotive mechanic", "vehicle technician", "motor vehicle", "automotive service", "automotive technician", "automobile mechanic", "vehicle mechanic", "motor vehicle technician", "auto mechanic", "motor vehicle inspector", "automotive instructor"],
    "D130": ["recruitment", "employment", "human resources", "career adviser", "job placement", "talent acquisition", "personnel"],
    "D147": ["process control", "automation", "scada", "plc", "instrumentation", "control engineer", "industrial automation", "smart home"],
    "D156": ["land survey", "surveyor", "cadastral", "geodesy", "geomatics", "cartograph", "topograph", "hydrographic survey"],
    "D167": ["virtual reality", "augmented reality", "immersive", "3d", "multimedia", "spatial computing", "animation", "digital media"],
    "D125": ["medical secretary", "medical administrator", "medical records", "medical transcription", "clinical administration", "medical receptionist", "medical practice", "health records"],
    "D126": ["complementary", "alternative medicine", "herbal", "acupuncture", "homeopath", "naturopath", "osteopath", "chiropractic", "massage"],
    "D136": ["aeronaut", "aerospace", "aircraft", "aviation engineer", "flight", "avionics", "aerodrome"],
    "D145": ["neuroscience", "neuropsych*", "cognitive", "brain", "neurolog*", "clinical psychologist", "sensory scientist"],
    "D152": ["museum", "curator", "heritage", "archive", "archivist", "cultural", "conservation", "librarian", "exhibition"],
    "D012": ["fintech", "financial technology", "payment", "banking software", "blockchain", "financial analyst", "quantitative", "financial markets"],
    "D065": ["translator", "translation", "interpreter", "locali", "linguist", "language engineer", "sign language"],
    "D117": ["railway", "rail", "locomotive", "train", "metro", "tram", "rail transport", "rolling stock"],
    "D121": ["forestry", "forest", "wildlife", "conservation", "ranger", "silviculture", "park", "forest worker"],
    "D138": ["biomedical", "medical engineering", "bioengineering", "prosthetic", "clinical engineering", "medical device", "orthotic"],
    "D151": ["criminology", "criminal justice", "criminologist", "correctional", "prison", "forensic", "police", "probation"],
    "D005": ["cloud", "devops", "infrastructure", "server", "network", "systems administrator", "cloud architect"],
    "D123": ["radiograph*", "radiology", "medical imaging", "sonograph*", "ultrasound", "mri", "ct scan", "imaging", "nuclear medicine radiographer"],
    "D155": ["nanotechnology", "nanomaterial", "materials science", "material engineer", "semiconductor", "microfabrication", "nanoelectronics", "surface science"],
    "D166": ["autonomous vehicle", "self-driving", "driverless", "vehicle systems", "transport automation", "robot*", "automotive test"],
    "D168": ["esport", "gaming", "streamer", "caster", "broadcast", "content creator", "community manager", "sport manager", "event manager", "video game"],
    "D074": ["occupational health", "health and safety", "safety officer", "workplace safety", "industrial hygiene", "safety inspector", "safety engineer"],
    "D084": ["payroll", "bookkeeping", "bookkeeper", "accounts clerk", "accounting technician", "wages"],
    "D127": ["early childhood", "nursery", "preschool", "kindergarten", "childcare", "child care", "early years"],
    "D006": ["internet of things", "iot", "connected device", "embedded", "sensor", "telemetry", "smart device"],
    "D061": ["insurance", "underwriter", "actuary", "claims", "broker", "risk consultant"],
    "D063": ["economist", "economics", "economic analyst", "policy analyst", "econometric"],
    "D134": ["naval", "marine engineering", "ship", "maritime", "shipbuilding", "offshore", "marine"],
    "D140": ["robotics", "robot*", "automation", "mechatronics", "control systems", "autonomous system"],
    "D154": ["exercise", "sports therapy", "physiotherapy", "fitness", "kinesiolog", "athletic", "sports medicine", "sport therapist"],
    "D004": ["cybersecurity", "information security", "security analyst", "penetration", "forensic", "incident", "cyber"],
    "D051": ["real estate", "property", "valuation", "estate agent", "facilities", "valuer", "broker"],
    "D057": ["digital health", "health informatics", "clinical informatics", "telemedicine", "electronic health", "medical data", "medical records", "healthcare information"],
    "D081": ["office administrator", "secretary", "administrative assistant", "office manager", "executive assistant", "clerical"],
    "D141": ["quantum"],
    "D149": ["diplomat", "diplomacy", "international relations", "foreign affairs", "ambassador", "consular", "foreign correspondent"],
    "D164": ["urban mobility", "smart city", "transport planner", "urban planner", "traffic", "public transport", "mobility"],
    "D165": ["wellness", "lifestyle", "health coach", "nutritionist", "fitness coach", "wellbeing", "weight loss"],
    "D103": ["jewellery", "jewelry", "goldsmith", "silversmith", "gemologist", "watchmaker"],
    "D105": ["basketry", "handicraft", "textile craft", "craftsman", "weaver", "potter", "artisan"],
    "D122": ["medical laboratory", "laboratory technician", "clinical laboratory", "pathology", "medical technologist", "bacteriology"],
    "D025": ["pharmacist", "pharmacy", "pharmaceutical", "dispensing", "drug"],
    "D064": ["psychologist", "counsellor", "counselor", "psychotherapy", "mental health", "clinical psychologist"],
    "D099": ["mason", "bricklayer", "tiler", "plasterer", "stone worker", "construction worker"],
    "D119": ["livestock", "poultry", "dairy", "animal husbandry", "farm manager", "veterinary", "breeder"],
}

# Title hits such as "mission" or "facility" are too broad on their own.
EXCLUDE = {
    # These are already represented in the canonical AI population or belong
    # to the dedicated robotics domain; do not duplicate/reassign them from a
    # broad title anchor.
    "D003": ["industrial robot", "robotics", "data scientist"],
    "D005": ["network marketer", "railway", "sewerage", "water network", "picture archiving", "food servers"],
    "D006": ["physiotherapist", "biotechnical", "food biotechnologist"],
    "D025": ["addiction counsellor", "drug and alcohol"],
    "D064": ["embassy counsellor", "environmental health inspector"],
    "D067": ["equine", "army corporal", "pastoral worker", "floral designer", "substance abuse"],
    "D081": ["secretary of state"],
    "D091": ["railway"],
    "D126": ["animal massage", "animal osteopath"],
    "D152": ["agricultural", "horticulture", "nature conservation", "water conservation"],
    "D168": ["brick and tile", "pottery", "casino", "gaming dealer", "gaming inspector", "molders, shapers, and casters", "pourers and casters"],
    "D132": ["police", "missionary", "commissioner", "fire commissioner", "electricity", "gas transmission", "interior", "welder", "de-icer"],
    "D059": ["police", "missionary", "commissioner", "electricity", "gas transmission", "commissioning"],
    "D150": ["secretary of state", "government minister", "political affairs", "speechwriter", "secondary school", "learning mentor"],
    "D161": ["missionary", "immigration", "cyber incident", "social counsellor", "special-interest"],
    "D146": ["swimming facility", "sport facility", "recreational facilities", "mine ventilation", "wholesale merchant", "sales representative"],
    "D167": ["specialised seller", "shop manager", "gaming dealer", "web designer"],
    "D168": ["weather forecaster", "translator", "telecommunications engineer", "disc jockey", "brick and tile", "pottery", "casino", "gaming dealer", "gaming inspector", "molders, shapers, and casters", "pourers and casters"],
    "D160": ["vlogger", "editorial assistant", "shop manager"],
    "D145": ["physicist", "sociologist", "seismologist", "remote sensing", "research manager"],
    "D166": ["vocational teacher", "assembler", "engineering drafter", "industrial robot"],
    "D096": ["construction equipment", "wholesale merchant", "sales representative", "rental service", "import export"],
    "D134": ["import export", "distribution manager"],
    "D165": ["animal feed", "specialised veterinarian", "vlogger"],
}

MANUAL = [
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology business analyst", "isco_group": 2421, "description": "Translates quantum technology capabilities into use cases, market requirements and implementation decisions for organisations.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT business analyst qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "use-case analysis", "requirements analysis", "business communication"], "optional_skills": ["market analysis", "technology strategy"]},
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology product strategist", "isco_group": 2422, "description": "Shapes product direction, partnerships and responsible adoption plans for quantum technology products and services.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT product strategist qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "product strategy", "technology roadmapping", "responsible innovation"], "optional_skills": ["business development", "stakeholder communication"]},
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology training specialist", "isco_group": 2359, "description": "Designs and delivers learning that helps technical and non-technical teams understand and use quantum technologies.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT training and development qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "instructional design", "technical explanation", "learning assessment"], "optional_skills": ["curriculum mapping", "workshop facilitation"]},
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology practitioner", "isco_group": 2511, "description": "Applies quantum technology concepts and tools in a technical or applied work setting.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT practitioner qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "technical problem solving", "experimentation", "responsible technology use"], "optional_skills": ["quantum software", "quantum hardware"]},
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology engineering professional", "isco_group": 2151, "description": "Engineers quantum technology systems and supports their design, integration, testing and operation.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT engineering professional qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "systems engineering", "hardware-software integration", "testing and validation"], "optional_skills": ["control systems", "laboratory methods"]},
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology hardware and software specialist", "isco_group": 2512, "description": "Develops or supports the hardware and software components used in quantum technology systems.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT hardware/software specialist qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "software development", "hardware integration", "technical documentation"], "optional_skills": ["quantum programming", "instrumentation"]},
    {"domain_id": "D141", "domain_name": "Quantum Computing, Quantum Information", "role_name": "quantum technology core innovator", "isco_group": 2166, "description": "Creates new quantum technology methods, products or research directions at the frontier of the field.", "source_provenance": {"sources": ["qt_cfqt"], "evidence": "CFQT v3.0 QT core innovator qualification profile.", "mapping_method": "specialist framework role profile"}, "source_confidence": "medium", "data_state": "source_backed", "essential_skills": ["quantum technology literacy", "research design", "innovation", "scientific communication"], "optional_skills": ["quantum algorithms", "quantum sensing"]},
]


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def unique(values):
    result = []
    seen = set()
    for value in values or []:
        key = norm(value)
        if key and key not in seen:
            seen.add(key)
            result.append(str(value).strip())
    return result


_SOURCE_REGISTRY_CACHE = None
_META_CACHE = None


def source_sets_for(domain_id, taxonomy_source):
    """Return global placement evidence separately from Nigerian context."""
    global _SOURCE_REGISTRY_CACHE, _META_CACHE
    if _SOURCE_REGISTRY_CACHE is None:
        _SOURCE_REGISTRY_CACHE = load(SOURCE_REGISTRY)
    if _META_CACHE is None:
        _META_CACHE = load(META)
    registry = _SOURCE_REGISTRY_CACHE
    meta = _META_CACHE
    domain = meta.get(domain_id) or {}
    ids = list(registry.get("default_sources") or [])
    ids.extend((registry.get("cluster_sources") or {}).get(domain.get("cluster", ""), []))
    ids.extend((registry.get("domain_overrides") or {}).get(domain_id, []))
    ids.append(taxonomy_source)
    ids = list(dict.fromkeys(str(value) for value in ids if value))
    catalog = registry.get("source_catalog") or {}
    global_ids = [source_id for source_id in ids if (catalog.get(source_id) or {}).get("region") in {"global", "global_proxy"}]
    local_ids = [source_id for source_id in ids if (catalog.get(source_id) or {}).get("region") == "nigeria"]
    return global_ids, local_ids


def title_hits(record, terms):
    labels = [record.get("label")]
    hits = []
    for raw_term in terms:
        raw = str(raw_term or "").strip().lower()
        prefix = raw.endswith("*")
        term = norm(raw[:-1] if prefix else raw)
        if not term:
            continue
        term_tokens = term.split()
        matched = False
        for label in labels:
            tokens = norm(label).split()
            for index in range(len(tokens) - len(term_tokens) + 1):
                window = tokens[index:index + len(term_tokens)]
                if prefix:
                    matched = all(
                        (word.startswith(expected) if position == len(term_tokens) - 1 else word == expected)
                        for position, (word, expected) in enumerate(zip(window, term_tokens))
                    )
                else:
                    matched = all(
                        word == expected or word == f"{expected}s"
                        for word, expected in zip(window, term_tokens)
                    )
                if matched:
                    break
            if matched:
                break
        if matched:
            hits.append(raw_term)
    return hits


def is_excluded(label, domain_id):
    value = norm(label)
    return any(norm(term) in value for term in EXCLUDE.get(domain_id, []))


def esco_row(domain_id, domain_name, record, hits, score):
    global_ids, local_ids = source_sets_for(domain_id, "global_esco")
    return {
        "domain_id": domain_id,
        "domain_name": domain_name,
        "role_name": record.get("label"),
        "also_known_as": unique(record.get("alt_labels")),
        "source": "esco",
        "isco_group": int(str(record.get("isco_group") or "0").split(".")[0] or 0),
        "esco_code": record.get("code"),
        "description": record.get("definition") or "Source-backed occupation from the ESCO taxonomy.",
        "essential_skills": unique(record.get("essential_skills")),
        "optional_skills": unique(record.get("optional_skills")),
        "source_provenance": {
            "sources": global_ids,
            "context_sources": local_ids,
            "evidence": "Exact ESCO occupation record; the domain placement is a documented cross-domain taxonomy mapping.",
            "mapping_method": "curated_domain_source_family_title_anchor",
            "matched_terms": hits,
            "mapping_score": score,
            "region": "global",
        },
        "source_confidence": "medium",
        "data_state": "source_backed",
    }


def onet_row(domain_id, domain_name, record, title, hits, score, isco_group=None):
    global_ids, local_ids = source_sets_for(domain_id, "global_onet")
    return {
        "domain_id": domain_id,
        "domain_name": domain_name,
        "role_name": title,
        "also_known_as": [],
        "source": "onet",
        "onet_code": record.get("O*NET-SOC Code"),
        "isco_group": isco_group,
        "description": record.get("Description") or "Source-backed occupation title from the O*NET taxonomy.",
        "source_provenance": {
            "sources": global_ids,
            "context_sources": local_ids,
            "evidence": "Exact O*NET preferred occupation record; the domain placement is a curated cross-domain taxonomy mapping.",
            "mapping_method": "curated_domain_source_family_title_anchor",
            "matched_terms": hits,
            "mapping_score": score,
            "region": "global_proxy",
        },
        "source_confidence": "medium",
        "data_state": "source_backed",
    }


def load_onet_candidates(esco):
    """Load exact O*NET titles and alternate titles with safe ISCO joins."""
    occupations = {}
    with open(ONET_OCCUPATIONS, encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            code = str(row.get("O*NET-SOC Code") or "").strip()
            title = str(row.get("Title") or "").strip()
            if code and title:
                occupations[code] = row

    # The crosswalk is the only safe path from an O*NET SOC to an ISCO subgroup.
    onet_to_isco = defaultdict(set)
    with open(CROSSWALK, encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.reader(handle))
    header_index = next(
        (index for index, row in enumerate(rows[:40]) if any("o*net" in str(cell).lower() for cell in row) and any("esco" in str(cell).lower() for cell in row)),
        None,
    )
    if header_index is not None:
        header = [str(cell).strip().lower() for cell in rows[header_index]]
        onet_column = next((i for i, cell in enumerate(header) if cell == "o*net id" or "o*net-soc" in cell), None)
        uri_column = next((i for i, cell in enumerate(header) if "esco or isco uri" in cell), None)
        if onet_column is not None and uri_column is not None:
            for row in rows[header_index + 1 :]:
                if len(row) <= max(onet_column, uri_column):
                    continue
                onet_code = str(row[onet_column]).strip()
                occupation = esco.get(str(row[uri_column]).strip())
                if occupation and occupation.get("isco_group"):
                    onet_to_isco[onet_code].add(int(str(occupation["isco_group"]).split(".")[0]))

    candidates = []
    for code, row in occupations.items():
        candidates.append((code, str(row.get("Title") or "").strip(), row, onet_to_isco.get(code, set()), []))
    # Job Titles are retained in the source archive as aliases, not independent
    # occupations. They are not used for automatic domain placement because a
    # lay title can be broad or shared across occupations.
    return candidates


def main():
    meta = load(META)
    registry = load(SOURCE_REGISTRY)
    base = load(BASE)
    emerging = load(EMERGING).get("roles") or []
    esco = load(ESCO)
    onet_candidates = load_onet_candidates(esco)
    existing = defaultdict(set)
    for role in base + emerging:
        existing[str(role.get("domain_id"))].add(norm(role.get("role_name")))

    roles = []
    counts = {}
    gaps = []
    for domain_id, domain in meta.items():
        if domain_id in HIDDEN or domain.get("excluded"):
            continue
        current = len(existing[domain_id])
        if current >= ROLE_CUTOFF:
            continue
        needed = ROLE_TARGET - current
        terms = KEYWORDS.get(domain_id, [])
        candidates = []
        for code, record in esco.items():
            label = str(record.get("label") or "").strip()
            key = norm(label)
            if not key or key in existing[domain_id] or is_excluded(label, domain_id):
                continue
            hits = title_hits(record, terms)
            if not hits:
                continue
            score = sum(8 if " " in term else 4 for term in hits)
            score += min(3, len(record.get("alt_labels") or []))
            # Prefer an exact ESCO record when both taxonomies name the role.
            candidates.append((score + 10, key, label, "esco", record, hits, None))
        for code, title, record, isco_values, aliases in onet_candidates:
            key = norm(title)
            if not key or key in existing[domain_id] or is_excluded(title, domain_id):
                continue
            hits = title_hits({"label": title, "alt_labels": aliases}, terms)
            if not hits:
                continue
            score = sum(8 if " " in term else 4 for term in hits)
            isco = sorted(isco_values)[0] if isco_values else None
            candidates.append((score, key, title, "onet", record, hits, isco))
        candidates.sort(key=lambda item: (-item[0], item[2].lower(), item[3]))
        selected = []
        seen = set()
        for score, key, label, source, record, hits, isco in candidates:
            if key in seen:
                continue
            seen.add(key)
            if source == "esco":
                selected.append(esco_row(domain_id, domain.get("domain_name"), record, hits, score))
            else:
                selected.append(onet_row(domain_id, domain.get("domain_name"), record, label, hits, score, isco))
            if len(selected) >= needed:
                break

        # The CFQT profiles are specialist source roles, not ESCO occupations.
        if domain_id == "D141":
            selected = [row for row in MANUAL if norm(row["role_name"]) not in existing[domain_id]][:needed]

        if len(selected) < needed:
            gap = {"domain_id": domain_id, "domain_name": domain.get("domain_name"), "needed": needed, "found": len(selected)}
            gaps.append(gap)
            if os.environ.get("ALLOW_THIN_GAPS") != "1":
                raise SystemExit(
                    f"{domain_id} {domain.get('domain_name')}: only {len(selected)} of {needed} source-backed roles found; "
                    "add a specialist source or refine its title anchors instead of inventing rows"
                )
        roles.extend(selected)
        counts[domain_id] = {"before": current, "added": len(selected), "after": current + len(selected), "selected": [row["role_name"] for row in selected]}

    used_source_ids = sorted({source_id for role in roles for source_id in ((role.get("source_provenance") or {}).get("sources") or []) + ((role.get("source_provenance") or {}).get("context_sources") or [])})
    source_catalog = registry.get("source_catalog") or {}
    output = {
        "schema_version": 1,
        "purpose": "Source-backed role population for visible domains below the 15-role floor.",
        "role_floor": ROLE_CUTOFF,
        "role_cutoff": ROLE_CUTOFF,
        "role_target": ROLE_TARGET,
        "sources": {source_id: source_catalog[source_id] for source_id in used_source_ids if source_id in source_catalog},
        "mapping_policy": "Exact ESCO occupation records may be attached to more than one relevant domain. This layer does not assert Nigerian demand, salary, licensing or university teaching. Local evidence remains in nigerian_context.actual_enrichment.",
        "roles": roles,
        "coverage": counts,
        "gaps": gaps,
    }
    with open(OUT, "w", encoding="utf-8") as handle:
        json.dump(output, handle, ensure_ascii=False, indent=1)
        handle.write("\n")
    print(json.dumps({"domains": len(counts), "roles_added": len(roles), "gaps": gaps, "min_after": min(item["after"] for item in counts.values()) if counts else ROLE_CUTOFF}, indent=2))


if __name__ == "__main__":
    main()
