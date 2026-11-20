"""Source-backed, copy-only expansion for the D078 computational area."""

from __future__ import annotations

import gzip
import hashlib
import json
import os
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
TARGET = "area:d078-computational-digital-social-science"

SOURCES = {
    "src:annual-review-css-2020": {
        "title": "Edelmann et al., Computational Social Science and Sociology",
        "publisher": "Annual Review of Sociology",
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev-soc-121919-054621",
        "supports": "Computational social science combines social science with computing and engineering methods, applies computational methods to digital sources, and connects analysis with theories of human behaviour.",
        "locator": "Abstract and opening definition: computational methods applied to social-media, administrative and historical-archive data; conclusion calls for attention to sociological theory.",
        "limits": "Review definition and examples; it does not establish that all social-science work is computational or that digital data are automatically valid.",
        "accessed": "2026-11-05",
    },
    "src:edinburgh-css-course": {
        "title": "Understanding Society with Big Data: Computational Social Science",
        "publisher": "University of Edinburgh, Open Course Materials",
        "url": "https://auth.opencourse.inf.ed.ac.uk/css",
        "supports": "The course sequence includes forming social research questions, collecting data, choosing methods, text and network analysis, bias, ethics, and explaining findings and limitations.",
        "locator": "Learning Outcomes and Course Outline: question formulation; data and method choice; descriptive analysis of textual/network data; ethical challenges, bias, findings and limitations.",
        "limits": "A course outline illustrates a teaching sequence and examples; it is not a universal curriculum or a claim that every route needs every technique.",
        "accessed": "2026-11-05",
    },
    "src:d078-digital-trace-data-2025": {
        "title": "Best practices for studies using digital data donation",
        "publisher": "Open-access research article",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/",
        "supports": "Digital trace data are information created through digital interactions; examples include social-media use, email and transactions.",
        "locator": "Introduction: definition and examples of digital trace data.",
        "limits": "The examples do not establish that every trace is accessible, representative, or ethically reusable.",
        "accessed": "2026-11-05",
    },
    "src:columbia-social-network-analysis": {
        "title": "Social Network Analysis",
        "publisher": "Columbia University Mailman School of Public Health",
        "url": "https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis",
        "supports": "Network analysis represents actors and their ties and can describe patterns in relationships.",
        "locator": "Overview of social network representations, actors, ties and network measures.",
        "limits": "The representation and measures answer only the defined relationship question; they do not by themselves establish why a relationship exists.",
        "accessed": "2026-11-05",
    },
    "src:abm-empirical-social-research": {
        "title": "Agent-Based Models in Empirical Social Research",
        "publisher": "Sociological Methods & Research",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/",
        "supports": "Agent-based models represent actors following rules and require justified construction, evaluation and careful interpretation when compared with empirical evidence.",
        "locator": "Abstract and sections on model construction, empirical grounding, evaluation and sensitivity analysis.",
        "limits": "Fit to observed data and sensitivity checks do not make every model a universal prediction.",
        "accessed": "2026-11-05",
    },
    "src:d078-esrc-internet-mediated-research": {
        "title": "Internet-mediated research ethics guidance",
        "publisher": "UK Research and Innovation, Economic and Social Research Council",
        "url": "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/",
        "supports": "Research using online material still requires attention to privacy, consent, identifiability, platform rules and appropriate ethics review.",
        "locator": "Guidance sections on online material, privacy, consent, identifiability, platform rules and ethics review.",
        "limits": "UK guidance; apply the relevant institutional process and laws for the learner's setting.",
        "accessed": "2026-11-05",
    },
}

ORIENTATION = {
    "shortIntro": (
        "This area studies social questions involving digital technology and uses computer-run steps to organize and examine information about society."
    ),
    "whatItStudies": (
        "Computational social science combines computer-based ways of processing information with questions about people, groups and society. Its digital branch also studies how technology and social life affect one another. Digital traces are records created when people use digital services, such as posts, messages or transactions. These records show some activity, not everything about a person or group."
    ),
    "whatPeopleDo": (
        "Researchers start with a social question and choose information that can help answer it. An algorithm is ordered steps a computer follows to sort, count or compare information. Network analysis maps people or groups as points and their connections as links, then measures their pattern. Text analysis compares language across documents. Statistical models use mathematical rules to estimate patterns; computer simulations run stated rules to explore possible outcomes."
    ),
    "questions": [
        "How do people in two selected online communities discuss the same public issue?",
        "Which people or groups connect otherwise separate parts of an organization or community?",
        "What patterns could form when people respond to one another under stated rules?",
    ],
    "outputs": [
        "A study plan naming the social question, information source, analysis method and limits.",
        "A table or chart comparing patterns in the selected records, or a simulated scenario that states the rules it used.",
        "An explanation of what the result supports, who or what it may leave out, and what it cannot establish by itself.",
    ],
    "howWorkHappens": [
        "Define the social question and the people, groups, place or period it concerns.",
        "Identify what records contain and how they were created. Digital traces record activity on particular services; they do not represent everyone affected by the question automatically.",
        "Choose a method that fits the question: compare written material, measure recorded connections, estimate a pattern or run a simulation. An agent-based model is a computer simulation where each represented person or group follows stated rules.",
        "Check the result against the question and available evidence. Explain missing information, choices built into the method and other limits before drawing a conclusion.",
    ],
    "limits": (
        "Online records show activity on particular services. They may miss people who do not use them or whose activity was not recorded. A model simplifies a process; a simulation shows what its rules produce, not what must happen in real life. A pattern alone does not prove its cause."
    ),
    "ethicalCare": (
        "Public visibility does not remove the need to protect privacy, consider consent and platform rules, and complete any required research ethics review (a formal check of how a study protects people)."
    ),
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    before_hash = digest(GRAPH)
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    node_ids = [node["id"] for node in graph["nodes"]]
    edge_ids = [edge.get("id") for edge in graph["edges"]]
    node = next((item for item in graph["nodes"] if item["id"] == TARGET), None)
    if node is None:
        raise SystemExit(f"Expected area node missing: {TARGET}")

    node["description"] = (
        "This area studies social questions involving digital technology and uses computer-run steps to organize and examine information about society."
    )
    node["overview"] = node["description"]
    node["student_orientation"] = ORIENTATION

    field_sources = {
        "whatItStudies": ["src:annual-review-css-2020", "src:d078-digital-trace-data-2025"],
        "whatPeopleDo": ["src:edinburgh-css-course", "src:columbia-social-network-analysis", "src:abm-empirical-social-research"],
        "questions": ["src:edinburgh-css-course", "src:annual-review-css-2020"],
        "outputs": ["src:edinburgh-css-course", "src:abm-empirical-social-research"],
        "howWorkHappens": ["src:edinburgh-css-course", "src:d078-digital-trace-data-2025"],
        "limits": ["src:d078-digital-trace-data-2025", "src:abm-empirical-social-research"],
        "ethicalCare": ["src:d078-esrc-internet-mediated-research"],
    }
    node["orientation_evidence_by_field"] = {
        field: [
            {"source_id": source_id, **SOURCES[source_id]}
            for source_id in source_ids
        ]
        for field, source_ids in field_sources.items()
    }
    new_source_refs = [
        {"source_id": source_id, **record}
        for source_id, record in SOURCES.items()
    ]
    new_source_ids = set(SOURCES)
    preserved_refs = [
        item for item in node.get("source_references", [])
        if not isinstance(item, dict) or item.get("source_id") not in new_source_ids
    ]
    node["source_references"] = [*preserved_refs, *new_source_refs]
    registry = graph.setdefault("external_source_registry", {})
    for source_id, record in SOURCES.items():
        existing = registry.get(source_id)
        if existing and existing.get("url") != record["url"]:
            raise SystemExit(f"Source registry collision for {source_id}")
        registry[source_id] = record

    if node_ids != [item["id"] for item in graph["nodes"]] or edge_ids != [edge.get("id") for edge in graph["edges"]]:
        raise SystemExit("Copy-only update unexpectedly changed graph nodes or edges")
    if digest(GRAPH) != before_hash:
        raise SystemExit("Graph changed while preparing copy update; refusing to overwrite concurrent work")

    json_bytes = (json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    with tempfile.NamedTemporaryFile(dir=GRAPH.parent, delete=False) as f_json:
        json_temp = Path(f_json.name)
        f_json.write(json_bytes)
    with tempfile.NamedTemporaryFile(dir=GRAPH_GZ.parent, delete=False) as f_gz:
        gz_temp = Path(f_gz.name)
    try:
        with gzip.open(gz_temp, "wt", encoding="utf-8", newline="") as target:
            json.dump(graph, target, ensure_ascii=False, separators=(",", ":"))
        if digest(GRAPH) != before_hash:
            raise SystemExit("Graph changed before copy update could be saved; refusing to overwrite concurrent work")
        os.replace(json_temp, GRAPH)
        os.replace(gz_temp, GRAPH_GZ)
    finally:
        json_temp.unlink(missing_ok=True)
        gz_temp.unlink(missing_ok=True)

    print(json.dumps({
        "updated_node": TARGET,
        "structured_sections": list(ORIENTATION),
        "source_records": len(SOURCES),
        "node_count": len(node_ids),
        "edge_count": len(edge_ids),
        "structure_unchanged": True,
        "graph_sha256": digest(GRAPH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
