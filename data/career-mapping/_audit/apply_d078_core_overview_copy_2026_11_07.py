"""Refresh the D078 Sociology programme and Social Sciences overview copy.

This focused update changes student-facing text and field-level evidence only.
It preserves every graph node, edge, lane, route and ownership assignment.
"""
from __future__ import annotations

import gzip
import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"

SOURCE_RECORDS = {
    "src:d078-openstax-sociology-scope-3e": {
        "title": "What Is Sociology? Introduction to Sociology 3e",
        "publisher": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-3e/pages/1-1-what-is-sociology",
        "supports": "Sociology studies groups and group interactions, societies and social interactions from close relationships to large social settings.",
        "locator": "Section 1.1 opening definition and discussion of society, social institutions and individual/group settings.",
        "limits": "An introductory textbook account; examples explain core scope but do not cover every sociological tradition or local curriculum.",
        "accessed": "2026-11-07",
    },
    "src:d078-esrc-research-consent": {
        "title": "Consent: Research Ethics Guidance",
        "publisher": "UK Research and Innovation, Economic and Social Research Council",
        "url": "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/consent/",
        "supports": "Informed consent requires enough accessible information for a voluntary decision; it includes what participation and data use involve, possible withdrawal, and limits to confidentiality where relevant.",
        "locator": "Sections 'What is freely given informed consent?', 'Giving information to participants', 'Consent', and voluntary participation/withdrawal guidance.",
        "limits": "UKRI/ESRC guidance; the applicable institution, local ethics process and law govern each study. Consent can require a justified alternative in some designs.",
        "accessed": "2026-11-07",
    },
    "src:d078-ons-administrative-data-glossary": {
        "title": "Administrative Data Census Project Glossary",
        "publisher": "Office for National Statistics",
        "url": "https://www.ons.gov.uk/census/censustransformationprogramme/administrativedatacensusproject/glossary",
        "supports": "Administrative data are information people have already provided to government while accessing public services; related records are made for service and administrative purposes.",
        "locator": "Administrative data entry and examples of information supplied while accessing public services.",
        "limits": "The examples and data systems are UK-specific; they support the general distinction between service records and research-collected information, not a claim about every country's records.",
        "accessed": "2026-11-07",
    },
    "src:d078-ons-what-are-data": {
        "title": "What Are Data?",
        "publisher": "Office for National Statistics",
        "url": "https://www.ons.gov.uk/aboutus/usingpublicdatatoproducestatistics/learningaboutdata/learnmoreaboutwhoweareandwhatwedo/whataredata",
        "supports": "Data are collected facts and figures that can appear as numbers, words or images; they require interpretation before they become useful information.",
        "locator": "Opening definition, quantitative and qualitative examples, and section 'How do we use data to create statistics?'.",
        "limits": "An introductory statistics-agency explanation, not a full information-science definition; its examples reflect UK official statistics.",
        "accessed": "2026-11-07",
    },
}

DOMAIN_OVERVIEW = (
    "The social sciences study people, groups and societies: how people relate, how shared arrangements such as families, schools, workplaces and governments shape "
    "everyday life, and how societies change. A research question guides what evidence (information that can help answer it) researchers gather or examine and which "
    "research methods (planned ways to gather or examine information) they use. Researchers compare evidence with possible explanations and report what it supports, "
    "what remains uncertain and why."
)

DOMAIN_TRANSFER = (
    "Your Sociology courses are a starting point for the wider Social Sciences & Behavioural Research field. Course links show recorded learning goals, not proof that "
    "you have mastered them. Begin with three shared, required foundations: frame a research question, judge what evidence can support and communicate what it shows. "
    "Then compare methods by the questions they can answer and the evidence they use. "
    "Choose a method or a named combined research design (a plan that uses methods together or in a stated order and explains how their findings connect). The journey "
    "then shows the domain learning, areas of specialization and roles supported by that choice, with the reason each appears. Optional items can be skipped; conditional "
    "items apply only in their stated context."
)

DOMAIN_ORIENTATION = {
    "whatItStudies": (
        "Sociology examines relationships, groups and social institutions (lasting arrangements and organizations that shape shared life). Economics studies how people "
        "make choices when resources are limited; political science studies public decisions and who can make them; behavioural research asks how people think and act, "
        "and how other people and settings influence behaviour. These fields can overlap, so the social question guides which perspectives help."
    ),
    "whatPeopleDo": (
        "Researchers ask questions, observe activity or examine documents, administrative records (information created when organizations register people or provide "
        "services, usually for purposes other than research) and digital traces (records created when people use digital services, such as posts, searches or purchases). "
        "They may count or measure information, interpret words or actions in their setting, or combine approaches. They check whose activity may be missing and protect "
        "private information."
    ),
    "questions": [
        "How do relationships in families and communities, workplaces and public organizations shape choices and opportunities?",
        "How does access to money, services or decision-making power differ among groups, and how do people respond?",
        "How do shared practices, organizations and societies change over time?",
        "What evidence shows whether a public service or community programme reaches the people it was designed to support?",
    ],
    "outputs": [
        "A question and study plan naming the people, places or records needed, how they will be gathered or examined, and what the study cannot establish.",
        "Organized survey answers, interview accounts, observations, documents or service records, handled with appropriate care.",
        "Tables, summaries or comparisons showing patterns and differences in the collected information.",
        "A report explaining what the evidence supports, where it is uncertain and what a reader can reasonably conclude.",
    ],
    "howWorkHappens": [
        "Start with a focused question about people, groups, shared arrangements or social change.",
        "Choose evidence that fits: a survey uses planned questions to gather comparable answers; an interview is a guided conversation that gathers accounts; observation means watching and recording what happens; document research examines existing texts and records, including who created them, why and whose views may be missing.",
        "When people take part, explain what the study asks them to do and how their information will be used. Seek informed consent (a voluntary decision made after receiving clear information) and follow the appropriate ethics review (a review of possible harm, participant rights, privacy and safeguards).",
        "Compare the evidence with the question, consider other explanations and state what the study can support, what remains uncertain and what further evidence may be needed.",
    ],
    "whereProgrammeFits": (
        "Your Sociology programme is one route into the wider social sciences. Its recorded course themes include social relationships, culture (shared ways of living and "
        "making meaning), family, inequality (unequal access to resources, opportunities or influence), crime, social change and research. These give context for the wider "
        "field. A course outcome is a learning goal recorded for a course; it describes programme content, not proof that a student has mastered it."
    ),
}

COMPUTATIONAL_COPY = {
    "meaning": (
        "Computational social research applies algorithms, statistical models and simulations to questions about society and social behaviour. An algorithm is a precise set of steps a "
        "computer can carry out, such as sorting or counting records. A statistical model uses mathematical relationships in recorded information to estimate patterns or "
        "compare factors. A simulation runs a simplified model under stated rules to explore what could happen. These approaches organize or measure information, estimate "
        "relationships, or explore what follows from a model's rules; they are research procedures, not just software use."
    ),
    "why_it_matters": (
        "Computational approaches can help when a question requires searching, organizing or comparing many survey answers, records, texts or relationships, or when a "
        "researcher needs to measure a pattern across them consistently. A simulation can explore what stated rules produce. The question and the quality and coverage of "
        "the available information determine whether the approach is useful."
    ),
    "contextual_use": (
        "Digital traces are records created through people's use of digital services, such as posts, searches or transactions. For example, a researcher might compare "
        "topics in two online communities, map documented partnerships among local organizations, or run a simulation to explore how an idea could spread if stated "
        "interaction rules held. The first two describe recorded activity; the simulation shows what follows from its assumptions, not what will happen in real life."
    ),
    "learner_output": (
        "A short analysis plan naming the social question; the data (recorded information) and its source; the chosen procedure and why it fits; checks for missing, "
        "inaccurate or unevenly collected information; privacy protections; and what conclusions the result can and cannot support."
    ),
    "limitations": [
        "Digital records may leave out people who do not use a service or whose activity is not recorded; a pattern in the available records may not represent everyone.",
        "A simulation shows what follows from its stated rules and assumptions; it does not prove that people behave that way in real life.",
        "A relationship between two measured features does not by itself show that one caused the other.",
        "An online post that appears public may still contain private or identifying details. Check people's expectations, consent where required, platform rules, local law and the responsible institution's ethics process.",
    ],
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def add_refs(node: dict[str, Any], source_ids: list[str], registry: dict[str, dict]) -> None:
    prior = {str(item.get("source_id")) for item in node.get("source_references", []) if isinstance(item, dict)}
    for source_id in source_ids:
        if source_id in prior:
            continue
        node.setdefault("source_references", []).append({"source_id": source_id, **registry[source_id]})
        prior.add(source_id)


def main() -> None:
    before_hash = digest(GRAPH)
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    original_node_ids = [node["id"] for node in graph["nodes"]]
    original_edges = [(edge.get("id"), edge.get("source"), edge.get("target"), edge.get("relationship")) for edge in graph["edges"]]
    nodes = {node["id"]: node for node in graph["nodes"]}
    domain = nodes.get("domain:D078")
    programme = nodes.get("programme:social-sciences:sociology")
    computational = nodes.get("domain-item:d078-computational-social-research")
    if not domain or not programme or not computational:
        raise SystemExit("Expected Sociology programme, D078 domain and computational social-research item")

    registry = graph.setdefault("external_source_registry", {})
    for source_id, source in SOURCE_RECORDS.items():
        previous = registry.get(source_id)
        if previous and previous.get("url") != source["url"]:
            raise SystemExit(f"Source ID collision: {source_id}")
        registry[source_id] = source

    domain["overview"] = DOMAIN_OVERVIEW
    domain["student_orientation"] = DOMAIN_ORIENTATION
    graph["programme_transition"]["domain_overview"] = DOMAIN_OVERVIEW
    graph["programme_transition"]["transfer_summary"] = DOMAIN_TRANSFER

    domain_sources = {
        "whatItStudies": ["src:d078-unesco-iscoped-social-sciences", "src:d078-openstax-sociology-scope-3e", "external:nuc-social-sciences-ccmas-2023"],
        "whatPeopleDo": ["src:d078-openstax-sociology-research-3e", "src:d078-ons-administrative-data-glossary", "src:d078-digital-trace-data-2025", "src:d078-esrc-research-consent"],
        "questions": ["src:d078-openstax-sociology-research-3e", "external:nuc-social-sciences-ccmas-2023"],
        "outputs": ["src:d078-openstax-sociology-research-3e", "src:d078-aapor-transparency-initiative"],
        "howWorkHappens": ["src:d078-openstax-sociology-research-3e", "src:d078-esrc-research-consent", "src:d078-aapor-survey-best-practices"],
        "whereProgrammeFits": ["external:nuc-social-sciences-ccmas-2023", "src:d078-openstax-sociology-scope-3e", "src:d078-openstax-sociology-research-3e"],
    }
    domain["orientation_evidence_by_field"] = {
        field: [{"source_id": source_id, **registry[source_id]} for source_id in source_ids]
        for field, source_ids in domain_sources.items()
    }
    add_refs(domain, sorted({source_id for source_ids in domain_sources.values() for source_id in source_ids}), registry)
    add_refs(programme, [
        "external:nuc-social-sciences-ccmas-2023",
        "src:d078-openstax-sociology-scope-3e",
        "src:d078-openstax-sociology-research-3e",
        "src:d078-esrc-research-consent",
    ], registry)
    for field, value in COMPUTATIONAL_COPY.items():
        computational[field] = value
    add_refs(computational, [
        "src:d078-computational-social-science-review-2020",
        "src:d078-digital-trace-data-2025",
        "src:d078-esrc-research-consent",
        "src:d078-esrc-internet-mediated-research",
        "src:d078-ons-what-are-data",
    ], registry)

    current_node_ids = [node["id"] for node in graph["nodes"]]
    current_edges = [(edge.get("id"), edge.get("source"), edge.get("target"), edge.get("relationship")) for edge in graph["edges"]]
    if current_node_ids != original_node_ids or current_edges != original_edges:
        raise SystemExit("Copy refresh changed graph nodes, edges or relationships")
    if digest(GRAPH) != before_hash:
        raise SystemExit("Graph changed while preparing copy refresh; refusing to overwrite concurrent work")

    json_bytes = (json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    with tempfile.NamedTemporaryFile(dir=GRAPH.parent, delete=False) as handle:
        json_temp = Path(handle.name)
        handle.write(json_bytes)
    with tempfile.NamedTemporaryFile(dir=GRAPH_GZ.parent, delete=False) as handle:
        gz_temp = Path(handle.name)
    try:
        with gzip.open(gz_temp, "wt", encoding="utf-8", newline="") as target:
            json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))
        if digest(GRAPH) != before_hash:
            raise SystemExit("Graph changed before copy refresh could be saved; refusing to overwrite concurrent work")
        os.replace(json_temp, GRAPH)
        os.replace(gz_temp, GRAPH_GZ)
    finally:
        json_temp.unlink(missing_ok=True)
        gz_temp.unlink(missing_ok=True)

    print(json.dumps({
        "programme_id": programme["id"],
        "domain_id": domain["id"],
        "computational_item_id": computational["id"],
        "new_source_records": len(SOURCE_RECORDS),
        "domain_orientation_fields_with_sources": len(domain_sources),
        "node_count": len(original_node_ids),
        "edge_count": len(original_edges),
        "structure_unchanged": True,
        "graph_sha256": digest(GRAPH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
