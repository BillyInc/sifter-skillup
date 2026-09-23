"""Write the first concrete external-enrichment ledger for Sociology/D078.

This is an evidence-ledger writer, not a catalogue mutator.  It records the
item-specific searches performed for the 26 D078 domain/subgroup items and
the explicit result that D078 has no unresolved relationship rows.  The
catalogue, SQL, generated seeds, UI and browser-proof artifacts are untouched.
"""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_agent"
ACCESS_DATE = "2026-09-20"
SEARCHED_AT = "2026-09-20T00:00:00Z"


def source(
    key: str,
    title: str,
    authority: str,
    url: str,
    locator: str,
    exact_evidence: str,
) -> dict[str, str]:
    return {
        "source_key": key,
        "title": title,
        "authority": authority,
        "url": url,
        "locator": locator,
        "accessed_on": ACCESS_DATE,
        "exact_evidence": exact_evidence,
    }


SOURCES: dict[str, dict[str, str]] = {
    "nih_start_here": source(
        "nih_start_here",
        "Start Here: Evidence Synthesis",
        "National Institutes of Health Library",
        "https://www.nihlibrary.nih.gov/services/evidence-synthesis/start-here",
        "Refine the Question; Evidence Synthesis Methods; captured page sections corresponding to lines 45-62 and 79-87.",
        "The page says that the research question determines the review type, screening criteria, extraction and synthesis approach, and describes a protocol-to-search-to-synthesis workflow.",
    ),
    "nih_dms": source(
        "nih_dms",
        "NIH Data Management and Sharing Policy",
        "National Institutes of Health",
        "https://grants.nih.gov/policy-and-compliance/policy-topics/sharing-policies/dms",
        "What is Data Management and Sharing?; What is a Data Management and Sharing Plan?; captured page sections corresponding to lines 7-35.",
        "The policy describes managing scientific data during the research lifecycle and planning how data will be preserved and shared through appropriate repositories or other mechanisms.",
    ),
    "ncbi_communicating": source(
        "ncbi_communicating",
        "Communicating Science Effectively",
        "National Academies of Sciences, Engineering, and Medicine via NCBI Bookshelf",
        "https://www.ncbi.nlm.nih.gov/books/NBK425719/",
        "Chapter 2, The Complexities of Communicating Science; captured page sections corresponding to lines 36-47.",
        "The chapter explains that science communication serves different audiences and requires communication of scientific information in ways responsive to audience needs.",
    ),
    "ncbi_sharing": source(
        "ncbi_sharing",
        "On Being a Scientist: Sharing of Research Results",
        "National Academies of Sciences, Engineering, and Medicine via NCBI Bookshelf",
        "https://www.ncbi.nlm.nih.gov/books/NBK214573/",
        "Sharing of Research Results; captured page sections corresponding to lines 36-48.",
        "The chapter describes sharing research results through peer-reviewed journals, citation of prior work and other appropriate dissemination methods.",
    ),
    "dartmouth_methods": source(
        "dartmouth_methods",
        "Methods Courses",
        "Dartmouth Department of Sociology",
        "https://sociology.dartmouth.edu/undergraduate/courses/methods",
        "Methods-course descriptions, especially Quantitative Social Data Analysis and research methods; captured page sections corresponding to lines 109-161.",
        "The page identifies sociology statistics and research-methods courses and describes research design, conceptualization, operationalization, measurement, statistics and scientific inquiry.",
    ),
    "rutgers_methods": source(
        "rutgers_methods",
        "Research Methods",
        "Rutgers Department of Sociology",
        "https://sociology.rutgers.edu/research/research-methods",
        "Experimental Research Design, qualitative/quantitative methods and Social Network Analysis sections; captured page sections corresponding to lines 24-49.",
        "The page describes experimental research design, quantitative statistical techniques, and social network analysis as a relational approach using networks, nodes, ties and edges.",
    ),
    "purdue_papers": source(
        "purdue_papers",
        "Types of APA Papers",
        "Purdue Online Writing Lab",
        "https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/types_of_apa_papers.html",
        "Experimental report and scientific-method structure; captured page sections corresponding to lines 40-62.",
        "The guide describes scientific and social-science reports using Introduction, Method, Results, Discussion and References sections.",
    ),
    "nist_eda": source(
        "nist_eda",
        "Exploratory Data Analysis",
        "National Institute of Standards and Technology",
        "https://itl.nist.gov/div898/handbook/eda/section1/eda11.htm",
        "EDA definition, goals and techniques; captured page sections corresponding to lines 5-23.",
        "The NIST handbook defines exploratory data analysis and lists graphical and quantitative techniques for investigating data and discovering structure.",
    ),
    "eu_dissemination": source(
        "eu_dissemination",
        "Dissemination and exploitation of research results",
        "European Commission",
        "https://research-and-innovation.ec.europa.eu/strategy/dissemination-and-exploitation-research-results_en",
        "What is dissemination?; captured page sections corresponding to lines 40-65.",
        "The page defines dissemination as making research results available to scientific communities and other audiences so they can be used and discussed.",
    ),
    "cornell_networks": source(
        "cornell_networks",
        "Social Networks",
        "Cornell University Department of Sociology",
        "https://sociology.cornell.edu/research/social-networks",
        "Social Networks research description; captured page sections corresponding to lines 27-29.",
        "The page describes social network analysis as conceptualizing and modeling society as people and groups linked by relationships.",
    ),
    "mit_game": source(
        "mit_game",
        "Game Theory with Engineering Applications",
        "MIT OpenCourseWare",
        "https://ocw.mit.edu/courses/6-254-game-theory-with-engineering-applications-spring-2010/pages/syllabus/",
        "Course description and fundamentals of game theory; captured page sections corresponding to lines 107-118.",
        "The course page names game theory and describes its fundamentals, including applications involving social and economic networks.",
    ),
    "mit_math": source(
        "mit_math",
        "Mathematics for Computer Science",
        "MIT OpenCourseWare",
        "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/",
        "Course description and topics; captured page sections corresponding to lines 83-96 and 117-121.",
        "The course page names mathematics and covers definitions, proofs, sets, relations, graphs and probability; it is a general mathematics course rather than a sociology-specific source.",
    ),
    "networkx": source(
        "networkx",
        "NetworkX",
        "NetworkX project documentation",
        "https://networkx.org/en/",
        "Project description and capabilities; captured page sections corresponding to lines 4-12.",
        "The project page identifies NetworkX as open-source software for creating, manipulating and studying the structure, dynamics and functions of complex networks.",
    ),
    "esco_languages": source(
        "esco_languages",
        "Development of the ESCO Skills Hierarchy",
        "European Commission ESCO materials",
        "https://esco.ec.europa.eu/system/files/2021-07/00266efc-e358-4fa8-b8e3-877d99059efcESCO_Skills_Hierarchy_-_MAI_20190524.pdf",
        "PDF page 6, Language skills and knowledge; captured PDF lines 67-82.",
        "The language-skills section explicitly lists the generic skill concept ‘Speak different languages’ alongside other language competence concepts.",
    ),
    "researchcomp": source(
        "researchcomp",
        "ResearchComp: European Competence Framework for Researchers",
        "European Commission / ResearchComp",
        "https://research-and-innovation.ec.europa.eu/jobs-research/researchcomp-european-competence-framework-researchers_en",
        "ResearchComp framework destination; the linked research-career material identifies the framework and describes working with people from diverse backgrounds and communication as researcher skills.",
        "The official ResearchComp route is a researcher-competence framework; supporting material identifies teamwork with people from diverse backgrounds and clear communication as research-career skills.",
    ),
}


def spec(
    subject_id: str,
    item_type: str,
    name: str,
    decision: str,
    queries: list[str],
    sources: list[str],
    limitation: str = "",
) -> dict[str, Any]:
    return {
        "subject_id": subject_id,
        "item_type": item_type,
        "name": name,
        "decision": decision,
        "queries": queries,
        "source_keys": sources,
        "limitation": limitation,
    }


SPECS = [
    spec("domain|D078|skill|research-design", "skill", "research design", "linked", ['"research design" sociology methods official'], ["dartmouth_methods", "rutgers_methods"]),
    spec("domain|D078|skill|evidence-review", "skill", "evidence review", "linked", ['"evidence review" official research guide'], ["nih_start_here"]),
    spec("domain|D078|skill|scientific-communication", "skill", "scientific communication", "linked", ['"scientific communication" official research guide'], ["ncbi_communicating"]),
    spec("domain|D078|competency|formulate-research-questions", "competency", "formulate research questions", "linked", ['"formulate research questions" official guide'], ["nih_start_here"]),
    spec("domain|D078|competency|evaluate-evidence", "competency", "evaluate evidence", "review_required", ['"evaluate evidence" research official guide'], ["nih_start_here"], "The source establishes evidence-synthesis/search/screening workflow, but does not by itself establish every evaluation behavior implied by this competency label."),
    spec("domain|D078|competency|document-and-communicate-findings", "competency", "document and communicate findings", "linked", ['"scientific communication" official research guide'], ["ncbi_communicating", "ncbi_sharing"]),
    spec("subgroup|D078|sg:21|skill|mathematics", "skill", "mathematics", "review_required", ['"mathematics" sociology research methods official course'], ["mit_math"], "The source is an authoritative item-specific mathematics course, but it is not Sociology/D078-specific."),
    spec("subgroup|D078|sg:21|skill|statistics", "skill", "statistics", "linked", ['"statistics" sociology research methods official course'], ["dartmouth_methods"]),
    spec("subgroup|D078|sg:21|skill|scientific-research-methodology", "skill", "scientific research methodology", "linked", ['"scientific research methodology" official university research guide'], ["dartmouth_methods", "rutgers_methods"]),
    spec("subgroup|D078|sg:21|skill|draft-scientific-or-academic-papers-and-technical-documentation", "skill", "draft scientific or academic papers and technical documentation", "review_required", ['"draft scientific or academic papers and technical documentation" official'], ["purdue_papers"], "The source supports scientific/social-science paper structure, but does not establish the technical-documentation half of the label."),
    spec("subgroup|D078|sg:21|skill|manage-research-data", "skill", "manage research data", "linked", ['"manage research data" official research data management guide'], ["nih_dms"]),
    spec("subgroup|D078|sg:21|skill|interact-professionally-in-research-and-professional-environments", "skill", "interact professionally in research and professional environments", "review_required", ['"interact professionally in research" official guide'], ["researchcomp"], "ResearchComp is a strong researcher-competence candidate, but the captured evidence is broader than this exact contextual skill label and still needs human acceptance."),
    spec("subgroup|D078|sg:21|skill|disseminate-results-to-the-scientific-community", "skill", "disseminate results to the scientific community", "linked", ['"disseminate results to the scientific community" official research guide'], ["eu_dissemination", "ncbi_sharing"]),
    spec("subgroup|D078|sg:21|skill|operate-open-source-software", "skill", "operate open source software", "review_required", ['"operate open source software" official guide'], ["networkx"], "The source establishes an authoritative open-source software item and its documented capabilities, not the generic ability to operate any open-source software."),
    spec("subgroup|D078|sg:21|skill|speak-different-languages", "skill", "speak different languages", "review_required", ['"speak different languages" research skill official framework'], ["esco_languages"], "The EU/ESCO material names the exact generic skill, but this tranche does not establish that it is Sociology/D078-specific or appropriate as a student-facing foundation."),
    spec("subgroup|D078|sg:21|skill|execute-analytical-mathematical-calculations", "skill", "execute analytical mathematical calculations", "review_required", ['"execute analytical mathematical calculations" official skill'], ["nist_eda"], "NIST supports quantitative data investigation, but the page does not establish the full generic mathematical-calculation label."),
    spec("subgroup|D078|sg:21|skill|social-network-analysis", "skill", "social network analysis", "linked", ['"social network analysis" sociology official university methods'], ["cornell_networks", "rutgers_methods"]),
    spec("subgroup|D078|sg:26|skill|research-design", "skill", "research design", "linked", ['"research design" sociology methods official'], ["dartmouth_methods", "rutgers_methods"]),
    spec("subgroup|D078|sg:26|skill|statistics", "skill", "statistics", "linked", ['"statistics" sociology research methods official course'], ["dartmouth_methods"]),
    spec("subgroup|D078|sg:26|skill|sociology", "skill", "sociology", "review_required", ['"sociology" official sociology research methods learning resource'], ["rutgers_methods"], "The source is a sociology methods page, but this search did not establish an authoritative item-specific definition for the broad skill label itself."),
    spec("subgroup|D078|sg:26|skill|empirical-analysis", "skill", "empirical analysis", "linked", ['"empirical analysis" sociology official course'], ["dartmouth_methods"]),
    spec("subgroup|D078|sg:26|skill|manage-research-data", "skill", "manage research data", "linked", ['"manage research data" official research data management guide'], ["nih_dms"]),
    spec("subgroup|D078|sg:26|skill|scientific-research-methodology", "skill", "scientific research methodology", "linked", ['"scientific research methodology" official university research guide'], ["dartmouth_methods", "rutgers_methods"]),
    spec("subgroup|D078|sg:26|skill|disseminate-results-to-the-scientific-community", "skill", "disseminate results to the scientific community", "linked", ['"disseminate results to the scientific community" official research guide'], ["eu_dissemination", "ncbi_sharing"]),
    spec("subgroup|D078|sg:26|skill|social-network-analysis", "skill", "social network analysis", "linked", ['"social network analysis" sociology official university methods'], ["cornell_networks", "rutgers_methods"]),
    spec("subgroup|D078|sg:26|skill|game-theory", "skill", "game theory", "linked", ['"game theory" sociology official university course'], ["mit_game"]),
]


def build_record(item: dict[str, Any]) -> dict[str, Any]:
    evidence = [dict(SOURCES[key]) for key in item["source_keys"]]
    return {
        "schema": "2026-09-20.external-enrichment-search-ledger-record.v1",
        "subject_id": item["subject_id"],
        "context_level": "domain" if item["subject_id"].startswith("domain|") else "subgroup",
        "context_key": "D078" if item["subject_id"].startswith("domain|") else item["subject_id"].split("|", 3)[1] + "|" + item["subject_id"].split("|", 4)[2],
        "item_type": item["item_type"],
        "name": item["name"],
        "catalogue_state_at_search": "no_link",
        "searched_at": SEARCHED_AT,
        "accessed_on": ACCESS_DATE,
        "search_queries": item["queries"],
        "searched_sources": evidence,
        "candidate_urls": [row["url"] for row in evidence],
        "decision": item["decision"],
        "promotion": "ledger_candidate_only",
        "limitation": item["limitation"] or None,
        "no_link_claim": False,
        "notes": "This ledger records external-source evidence only; it does not mutate the contextual catalogue or promote a live/UI link.",
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    records = [build_record(item) for item in SPECS]
    ledger = OUT / "d078_domain_subgroup_search_ledger_2026-09-20.jsonl"
    ledger.write_text("\n".join(json.dumps(record, ensure_ascii=False, sort_keys=True) for record in records) + "\n", encoding="utf-8")

    decision_counts: dict[str, int] = {}
    for record in records:
        decision_counts[record["decision"]] = decision_counts.get(record["decision"], 0) + 1
    domain_count = sum(record["context_level"] == "domain" for record in records)
    subgroup_count = sum(record["context_level"] == "subgroup" for record in records)
    report = {
        "schema": "2026-09-20.external-enrichment-d078-tranche-report.v1",
        "generated_at": dt.datetime.now(dt.UTC).isoformat(),
        "accessed_on": ACCESS_DATE,
        "scope": {
            "domain": "D078",
            "items_searched": len(records),
            "domain_items_searched": domain_count,
            "subgroup_items_searched": subgroup_count,
            "role_items_remaining": 699,
            "d078_contextual_items_total": 725,
            "d078_relationship_rows_total": 2519,
            "d078_unresolved_relationship_rows": 0,
            "d078_relationship_rows_left_for_verification": 2519,
        },
        "decision_counts": decision_counts,
        "genuinely_unavailable_claims": 0,
        "no_link_claims": 0,
        "ledger": ledger.relative_to(ROOT).as_posix(),
        "method": "Each record retains the exact search query, item-specific URL when found, authority, locator, access date, evidence summary and limitations. Review-required records are not promoted and none is labelled genuinely_unavailable.",
    }
    (OUT / "d078_domain_subgroup_tranche_report_2026-09-20.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    relationship_scan = {
        "schema": "2026-09-20.external-enrichment-relationship-scan.v1",
        "accessed_on": ACCESS_DATE,
        "scope": "Sociology/D078 relationship rows",
        "selector": {"context_level": "domain", "context_key": "D078"},
        "relationship_rows_total": 2519,
        "relationship_state_counts": {"source_backed": 2519},
        "unresolved_states_checked": ["not_established", "unresolved", "review_only", "missing"],
        "unresolved_rows_found": 0,
        "search_ledger_rows_written": 0,
        "interpretation": "There were no unresolved D078 relationship rows to search in this tranche. Existing source-backed relationships remain verification work and are not treated as canonically verified by this scan.",
        "no_link_claim": False,
        "genuinely_unavailable_claim": False,
    }
    (OUT / "d078_relationship_scan_2026-09-20.json").write_text(json.dumps(relationship_scan, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 domain/subgroup external-enrichment tranche — 2026-09-20",
        "",
        "This tranche records item-specific external searches for all 26 D078 domain/subgroup contextual items. It does not mutate the catalogue, SQL, generated seeds, UI or browser-proof artifacts.",
        "",
        "| Measure | Count |",
        "|---|---:|",
        f"| D078 contextual items | 725 |",
        f"| Domain items searched | {domain_count} |",
        f"| Subgroup items searched | {subgroup_count} |",
        f"| Role-owned D078 items remaining | 699 |",
        f"| D078 relationships total | 2,519 |",
        f"| D078 unresolved relationship rows | 0 |",
        f"| D078 relationship rows still requiring verification | 2,519 |",
        f"| Item decisions: linked | {decision_counts.get('linked', 0)} |",
        f"| Item decisions: review_required | {decision_counts.get('review_required', 0)} |",
        "| genuinely_unavailable claims | 0 |",
        "| no_link claims | 0 |",
        "",
        "## Interpretation",
        "",
        "`linked` means the ledger has an authoritative, item-specific candidate source. `review_required` means a source was found or searched but it is too broad, context-mismatched or only partial for promotion. No record is called `genuinely_unavailable`; the language row remains open because the exact EU/ESCO source is not Sociology/D078-specific enough for automatic promotion.",
        "",
        "The D078 relationship scan found no `not_established`, `unresolved`, `review_only` or missing relationship rows. Therefore this tranche adds no relationship evidence rows; all 2,519 D078 relationships remain verification work rather than being silently treated as proven.",
        "",
        f"Ledger: `{ledger.relative_to(ROOT).as_posix()}`",
    ]
    (OUT / "d078_domain_subgroup_tranche_report_2026-09-20.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
