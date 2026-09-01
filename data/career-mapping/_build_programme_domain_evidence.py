"""Build verifiable CCMAS curriculum evidence for every surviving mapping link."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
META_PATH = ROOT / "domain_meta.json"
STRUCTURE_PATH = ROOT / "domain_structure.json"
OUTPUT_PATH = ROOT / "_audit" / "programme_domain_evidence_2026-08-17.json"

STOP = set(
    "a an and are as at be by for from in into is of on or the to with this that their its all any basic general introduction introductory principles principle management study studies science scientific technology education training professional practice processes process organization organisation organisational role roles people field domain course courses methods method theory theories applied application applications advanced use using work working skills skill development develop".split()
)

EXTRA_ANCHORS = {
    "D003": ["artificial intelligence", "machine learning", "neural network", "deep learning"],
    "D012": ["fintech", "payment", "banking app", "blockchain", "backend"],
    "D020": ["waste", "wastewater", "pollution", "water treatment", "environmental compliance", "sustainability"],
    "D028": ["budgets", "strategic", "leadership", "operations", "business administration"],
    "D030": ["marketing", "market", "advertising", "brand", "consumer", "customer", "sales", "public relations", "promotion", "audience"],
    "D033": ["product", "innovation", "venture", "e-commerce", "value proposition", "business model"],
    "D037": ["law", "legal", "court", "litigation", "jurisprudence"],
    "D042": ["broadcast", "broadcasting", "film", "multimedia", "journalism", "mass communication", "media production", "television", "radio"],
    "D039": ["teaching", "lesson", "curriculum", "instruction", "assessment", "pedagogy", "teacher education", "school management"],
    "D047": ["agriculture", "agricultural", "agribusiness", "crop", "livestock", "soil", "farm", "fisheries", "aquaculture", "extension"],
    "D048": ["food science", "food technology", "brewing", "food processing", "food microbiology", "food chemistry"],
    "D075": ["fashion", "textile", "garment", "clothing", "apparel", "dress", "pattern", "sewing"],
    "D076": ["marine", "maritime", "ocean", "seamanship", "navigation", "ship", "vessel"],
    # The Nigerian LSM curriculum names global trade, customs regulations,
    # freight, warehousing and supply-chain operations explicitly. These are
    # domain concepts from D079's definition/foundation, not generated
    # synonyms, and prevent a valid CCMAS anchor from being missed because
    # "Customs, Trade" is not a contiguous phrase in the course title.
    "D079": ["customs", "customs regulations", "global trade", "import export", "freight", "warehousing", "forwarding", "supply chain"],
    "D045": ["public administration", "government", "public policy", "civil service", "public sector"],
    "D073": ["library", "librarianship", "archive", "archival", "information resource", "records management"],
    "D081": ["office administration", "secretarial", "office practice", "shorthand", "typing", "administrative practice"],
    "D083": ["hospitality", "tourism", "travel", "tourism management", "hotel", "tour operation", "event management"],
    "D109": ["metallurgical", "metallurgy", "metal processing", "foundry", "mineral processing", "extractive metallurgy"],
    "D110": ["chemical engineering", "chemical processing", "industrial chemistry", "petrochemical", "polymer", "rubber", "process plant"],
    "D111": ["textile", "garment", "clothing", "apparel", "spinning", "weaving", "dyeing"],
    "D118": ["crop science", "crop production", "horticulture", "agronomy", "plant breeding", "weed science"],
    "D120": ["fisheries", "aquaculture", "fish production", "fish farming", "aquatic"],
    "D126": ["complementary medicine", "alternative medicine", "herbal medicine", "acupuncture", "homeopathy"],
    "D130": ["human resource", "human resources", "recruitment", "employment", "talent acquisition", "labour market", "industrial relations"],
    "D150": ["religious studies", "religion", "theology", "christian", "islamic", "sharia", "ministry", "pastoral"],
    "D151": ["criminology", "security studies", "forensic", "criminal justice", "policing"],
    "D152": ["archaeology", "museum", "cultural heritage", "curation", "conservation", "archive"],
    "D153": ["music", "sound", "audio", "recording", "music production", "composition"],
    "D165": ["nutrition", "dietetic", "wellness", "lifestyle medicine", "health promotion", "fitness"],
    "D004": ["cybersecurity", "cyber security", "information security", "network security", "digital forensics", "cryptography"],
    "D007": ["ui/ux", "user interface", "user experience", "interaction design", "interface design"],
    "D008": ["telecommunications", "telecommunication", "communication systems", "radio frequency", "signal processing", "wireless"],
    "D044": ["graphic design", "visual communication", "illustration", "typography", "branding design"],
    "D055": ["chemical engineering", "process engineering", "unit operations", "thermodynamics", "mass transfer", "heat transfer"],
    "D077": ["security services", "security management", "protective services", "guarding", "correctional"],
    "D097": ["welding", "fabrication", "blacksmithing", "metal joining", "plasma cutting"],
    "D102": ["carpentry", "joinery", "wood technology", "woodworking", "furniture making"],
    "D112": ["wood processing", "pulp", "paper", "sawmilling", "timber processing"],
    "D057": ["health records", "medical informatics", "clinical coding", "health information", "database"],
    "D063": ["economics", "microeconomics", "macroeconomics", "economic", "market", "finance", "policy"],
    "D078": ["sociology", "social science", "social research", "social statistics", "demography", "criminology", "archaeology", "anthropology", "political science"],
    "D128": ["social work", "social welfare", "youth", "vulnerable", "community development", "child protection", "family support"],
    "D149": ["international relations", "diplomacy", "foreign affairs", "embassy", "geopolit", "foreign policy", "treaty"],
    "D158": ["corporate finance", "financial statements", "financial management", "investment", "securities", "capital budgeting"],
    "D159": ["credit", "loans", "borrower", "financial statements", "risk", "lending"],
}

REVIEW_SOURCE_STATES = {
    "source_missing",
    "extraction_gap",
    "table_omitted",
    "programme_conflict",
}

# The CCMAS extraction stores transferable curriculum evidence separately from
# discipline/technical skills.  Keep the gate conservative: only retain an
# item when the source text contains a recognizable transferable-competency
# signal.  The item itself is always copied from CCMAS; these terms only
# classify evidence and do not create new curriculum content.
TRANSFERABLE_COMPETENCY_TERMS = {
    "communication": ("communicat", "presentation", "public speaking", "listening", "writing", "report"),
    "analysis_and_reasoning": ("analytical", "analysis", "critical reasoning", "critical thinking", "problem solving", "problem-solving", "logic", "reasoning"),
    "research_and_evidence": ("research", "evidence", "evaluate", "evaluation", "data analysis", "interpret data"),
    "planning_and_delivery": ("project", "planning", "organis", "organiz", "time management", "process"),
    "collaboration_and_leadership": ("team", "collaborat", "leadership", "negotiat", "interpersonal"),
    "digital_and_technology": ("digital", "computer", "information technology", "technology", "software"),
    "entrepreneurship_and_innovation": ("entrepreneur", "innovation", "business", "enterprise", "commercial"),
    "professional_and_ethical_practice": ("ethical", "professional", "integrity", "responsib", "sustainab"),
}

# These conflicts were checked against the original NUC CCMAS PDFs.  The
# structured layer keeps the original discrepancy for audit/display, but the
# curriculum identity used for mapping is now explicit and therefore no
# longer blocks a downstream domain link.
RECONCILED_COURSE_CONFLICTS = {
    ("Administration and Management", "Finance / Banking and Finance", "FIN 202"),
    ("Administration and Management", "Finance / Banking and Finance", "FIN 204"),
    ("Administration and Management", "Finance / Banking and Finance", "FIN 209"),
    ("Administration and Management", "Finance / Banking and Finance", "FIN 210"),
    ("Administration and Management", "Finance / Banking and Finance", "FIN 215"),
    ("Administration and Management", "Finance / Banking and Finance", "FIN 216"),
    ("Administration and Management", "Finance / Banking and Finance", "FIN 217"),
    # The source reuses TAX 311 for two different titles; course_identity
    # keeps the two curriculum concepts separate.
    ("Administration and Management", "Taxation", "TAX 311"),
    ("Administration and Management", "Taxation", "TAX 411"),
    ("Administration and Management", "Taxation", "TAX 421"),
    # HEM/HAE and VPM/VCH code variants are retained as source aliases.
    ("Medicine and Dentistry", "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "HEM 302"),
    ("Medicine and Dentistry", "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "HEM 401"),
    ("Medicine and Dentistry", "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "HEM 402"),
    ("Medicine and Dentistry", "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "HEM 403"),
    ("Medicine and Dentistry", "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "HEM 404"),
    ("Medicine and Dentistry", "Bachelor of Dental Surgery (BDS/BChD)", "HEM 302"),
    ("Medicine and Dentistry", "Bachelor of Dental Surgery (BDS/BChD)", "HEM 401"),
    ("Medicine and Dentistry", "Bachelor of Dental Surgery (BDS/BChD)", "HEM 402"),
    ("Medicine and Dentistry", "Bachelor of Dental Surgery (BDS/BChD)", "HEM 403"),
    ("Medicine and Dentistry", "Bachelor of Dental Surgery (BDS/BChD)", "HEM 404"),
    ("Veterinary Medicine", "Veterinary Medicine", "VPM 508"),
    ("Veterinary Medicine", "Veterinary Medicine", "VCH 501"),
    ("Veterinary Medicine", "Veterinary Medicine", "VCH 502"),
    # LIS P12 table identities are retained; P13/P14 content reverses or
    # reuses several codes, so title-based aliases are used for evidence.
    ("Social Sciences", "Library and Information Science", "LIS 211"),
    ("Social Sciences", "Library and Information Science", "LIS 212"),
    ("Social Sciences", "Library and Information Science", "LIS 322"),
    ("Social Sciences", "Library and Information Science", "LIS 418"),
    ("Social Sciences", "Library and Information Science", "LIS 424"),
}

RECONCILED_PROGRAMME_CONFLICTS = {
    ("Medicine and Dentistry", "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)"),
    ("Medicine and Dentistry", "Bachelor of Dental Surgery (BDS/BChD)"),
    ("Veterinary Medicine", "Veterinary Medicine"),
}


def course_source_review_required(
    discipline: str, programme_name: str, course: dict
) -> bool:
    """Return only source issues that can change the mapping identity.

    Unit/contact-hour differences and a reconciled source alias remain visible
    in the JSON audit, but they do not make an otherwise source-backed course
    unusable for curriculum/domain evidence.
    """
    if course.get("mapping_excluded"):
        return False
    state = course.get("source_state")
    if state in REVIEW_SOURCE_STATES:
        return True
    if state == "source_conflict":
        return (discipline, programme_name, course.get("code")) not in RECONCILED_COURSE_CONFLICTS
    return False


def programme_source_review_required(discipline: str, programme_name: str, programme: dict) -> bool:
    state = programme.get("source_state")
    if state in REVIEW_SOURCE_STATES:
        return True
    if state == "source_conflict":
        return (discipline, programme_name) not in RECONCILED_PROGRAMME_CONFLICTS
    return False


def text_tokens(value: str) -> set[str]:
    return {token for token in re.findall(r"[a-z][a-z0-9]+", value.lower()) if len(token) > 2 and token not in STOP}


def as_text(value) -> str:
    if not isinstance(value, str):
        return ""
    value = value.strip()
    # Extracted JSON contains literal NaN placeholders for missing fields in
    # some older taxonomy rows. They are not curriculum evidence and must
    # never become substring anchors ("nan" matches unrelated words such as
    # Nigerian and management).
    if value.lower() in {"nan", "none", "null"}:
        return ""
    return value


def transferable_evidence(programme: dict) -> list[dict]:
    """Return only source-provided, recognizable transferable evidence.

    This is deliberately not a generated capability list.  The extracted
    CCMAS item remains the evidence, while the category is an audit aid for
    the Adjacent mapping gate.
    """
    results = []
    for raw in programme.get("skills_profile_transferable", []) or []:
        text = as_text(raw)
        if not text:
            continue
        lowered = text.lower()
        categories = [
            category
            for category, terms in TRANSFERABLE_COMPETENCY_TERMS.items()
            if any(term in lowered for term in terms)
        ]
        if categories:
            results.append({"evidence": text, "categories": categories})
    return results


def load_programmes() -> tuple[dict, dict[str, str]]:
    programmes: dict = {}
    source_files: dict[str, str] = {}
    for file in (ROOT / "ccmas").glob("*.json"):
        source = json.loads(file.read_text(encoding="utf-8"))
        for programme in source.get("programmes", []):
            key = f"{source['discipline']}::{programme['name']}"
            programmes[key] = programme
            source_files[key] = file.name
    return programmes, source_files


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    structure = json.loads(STRUCTURE_PATH.read_text(encoding="utf-8"))
    programmes, source_files = load_programmes()
    evidence: dict[str, dict] = {}
    quality_counts = Counter()

    for programme_key, value in mapping.items():
        programme = programmes[programme_key]
        discipline, programme_name = programme_key.split("::", 1)
        courses = programme.get("courses", [])
        transferable_items = transferable_evidence(programme)
        programme_source_flags = []
        if programme_source_review_required(discipline, programme_name, programme):
            programme_source_flags.append({
                "source_state": programme.get("source_state"),
                "source_reference": programme.get("source_reference"),
            })
        for item in programme.get("source_omitted_courses", []) or []:
            # A course explicitly omitted from the P12 programme table is
            # retained in the audit, but it is not part of the active
            # curriculum evidence set and must not block unrelated anchors.
            if item.get("source_state") in REVIEW_SOURCE_STATES and item.get("source_state") != "table_omitted":
                programme_source_flags.append({
                    "code": item.get("code"),
                    "title": item.get("title"),
                    "source_state": item.get("source_state"),
                    "source_reference": item.get("source_reference"),
                })
        for link in value.get("links", []):
            domain_id = link["domain_id"]
            domain = meta[domain_id]
            domain_structure = structure.get(domain_id, {})
            anchor_phrases = list(EXTRA_ANCHORS.get(domain_id, []))
            anchor_phrases.extend(
                [
                    domain.get("domain_name", ""),
                    *[item.get("skill", "") for item in domain_structure.get("foundation_skills", [])[:20]],
                ]
            )
            anchor_phrases = sorted({
                phrase.lower().strip()
                for phrase in anchor_phrases
                if as_text(phrase) and len(as_text(phrase)) > 2
            }, key=lambda phrase: (-len(phrase), phrase))
            course_anchors = []
            source_flagged_courses = []
            for course in courses:
                title = as_text(course.get("title", ""))
                mapping_title = as_text(course.get("mapping_title", ""))
                course_identity = as_text(course.get("course_identity", "")) or "::".join(filter(None, [as_text(course.get("code", "")), title]))
                haystack = " ".join([title, mapping_title, as_text(course.get("content_summary", "")), *[as_text(item) for item in course.get("skills_learned", [])]]).lower()
                matched = sorted({phrase for phrase in anchor_phrases if phrase in haystack})
                if matched:
                    item = {"title": title, "mapping_title": mapping_title or None, "code": course.get("code"), "course_identity": course_identity, "matched_anchors": matched[:12]}
                    if course_source_review_required(discipline, programme_name, course):
                        item["source_flags"] = list(course.get("flags") or [])
                        item["source_state"] = course.get("source_state")
                        source_flagged_courses.append(item)
                    course_anchors.append(item)

            # The active mapping rule requires at least two specific,
            # source-backed course/objective anchors for Direct or Functional
            # links. Adjacent links use one domain-specific conceptual
            # prerequisite together with transferable-competency evidence.
            # These are evidence gates, not similarity scores.
            match_type = link.get("match_type")
            if match_type in {"direct", "functional"}:
                strong_evidence = len(course_anchors) >= 2
            else:
                strong_evidence = len(course_anchors) >= 1 and bool(transferable_items)
            if strong_evidence:
                quality = "strong"
            elif len(course_anchors) == 1:
                quality = "moderate"
            else:
                quality = "weak"
            quality_counts[quality] += 1
            evidence[f"{programme_key}::{domain_id}"] = {
                "programme_key": programme_key,
                "ccmas_source_file": source_files[programme_key],
                "ccmas_code": programme.get("code"),
                "qualification": programme.get("qualification"),
                "duration_years": programme.get("duration_years"),
                "domain_id": domain_id,
                "domain_name": domain.get("domain_name"),
                "domain_definition": domain.get("description"),
                "match_type": link.get("match_type"),
                "mapping_source": link.get("src"),
                "course_anchor_quality": quality,
                "course_anchor_count": len(course_anchors),
                "course_anchors": course_anchors[:12],
                "transferable_evidence_count": len(transferable_items),
                "transferable_evidence": transferable_items[:12],
                "adjacent_evidence_gate": (
                    "one_domain_course_anchor_plus_transferable_evidence"
                    if match_type == "adjacent" else None
                ),
                "source_review_required": bool(source_flagged_courses or programme_source_flags),
                "source_flagged_courses": source_flagged_courses[:12],
                "programme_source_flags": programme_source_flags[:12],
                # A link is not certified merely because it has one or two
                # textual hits. Direct links require strong evidence; a
                # Functional/Adjacent link with weak or moderate evidence is
                # also held for review until the named CCMAS course/outcome
                # and the specialist gap are confirmed.
                "review_required": quality != "strong" or bool(source_flagged_courses or programme_source_flags),
            }

    OUTPUT_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Wrote {len(evidence)} evidence records to {OUTPUT_PATH.name}.")
    print("Quality counts:", dict(quality_counts))


if __name__ == "__main__":
    main()
