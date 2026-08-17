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


def text_tokens(value: str) -> set[str]:
    return {token for token in re.findall(r"[a-z][a-z0-9]+", value.lower()) if len(token) > 2 and token not in STOP}


def as_text(value) -> str:
    return value if isinstance(value, str) else ""


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
        courses = programme.get("courses", [])
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
            anchor_phrases = [phrase.lower().strip() for phrase in anchor_phrases if isinstance(phrase, str) and len(phrase.strip()) > 2]
            course_anchors = []
            for course in courses:
                title = as_text(course.get("title", ""))
                haystack = " ".join([title, as_text(course.get("content_summary", "")), *[as_text(item) for item in course.get("skills_learned", [])]]).lower()
                matched = sorted({phrase for phrase in anchor_phrases if phrase in haystack})
                if matched:
                    course_anchors.append({"title": title, "matched_anchors": matched[:12]})

            if len(course_anchors) >= 2:
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
                "review_required": quality == "weak" or (link.get("match_type") == "direct" and quality != "strong"),
            }

    OUTPUT_PATH.write_text(json.dumps(evidence, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Wrote {len(evidence)} evidence records to {OUTPUT_PATH.name}.")
    print("Quality counts:", dict(quality_counts))


if __name__ == "__main__":
    main()
