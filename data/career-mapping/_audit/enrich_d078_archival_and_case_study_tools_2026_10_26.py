"""Add externally verified, route-specific tool options to undercovered D078 routes.

Only the three method/area routes that lacked any projected tool are enriched.
Existing source-backed domain tools are reused. Zotero and Tropy are added as
canonical domain tool records because neither had a node in the graph.
Every option remains optional, skippable and non-blocking.
"""
from __future__ import annotations

import gzip
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
AS_OF = "2026-10-26"

ZOTERO_DOCS = "https://www.zotero.org/support/quick_start_guide"
TROPY_DOCS = "https://docs.tropy.org/"
TAGUETTE_DOCS = "https://www.taguette.org/getting-started.html"
TAGUETTE_APP = "https://app.taguette.org/"
NVIVO_DOCS = "https://lumivero.com/products/nvivo-desktop/"
R_TS_DOCS = "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/ts.html"
STATA_TS_DOCS = "https://www.stata.com/features/time-series/"
EVIEWS_TS_DOCS = "https://help.eviews.com/content/timeser-Time_Series_Regression.html"


def read_graph() -> dict[str, Any]:
    with gzip.open(GRAPH, "rt", encoding="utf-8") as stream:
        return json.load(stream)


def write_graph(graph: dict[str, Any]) -> None:
    temp = GRAPH.with_name(GRAPH.name + ".tmp")
    with gzip.open(temp, "wt", encoding="utf-8", compresslevel=9, newline="\n") as stream:
        json.dump(graph, stream, ensure_ascii=False, separators=(",", ":"))
        stream.write("\n")
    temp.replace(GRAPH)


def tool_node(item_id: str, label: str, meaning: str, condition: str,
              rationale: str, limitations: list[str], url: str,
              link_label: str, free_access: str) -> dict[str, Any]:
    return {
        "id": item_id,
        "kind": "domain_learning_item",
        "item_type": "tool",
        "label": label,
        "layer": "domain_or_route_candidate",
        "requirement_lane": "useful_optional",
        "requirement_scope": {
            "lane": "useful_optional",
            "condition": condition,
            "rationale": rationale,
            "evidence_gap": None,
            "source_decision": "external_official_documentation_reviewed_2026_10_26",
            "consolidated_into": None,
            "scope_kind": "item_context_requirement",
            "skippable": True,
            "blocks_progression": False,
            "auto_add": False,
            "auto_order": False,
            "can_select_alongside_needed": True,
        },
        "requirement_level": "useful",
        "requirement_reason": "Optional tool for the stated task; the learning route remains complete without selecting it.",
        "skippable": True,
        "blocking_policy": "never",
        "student_visible": True,
        "approval": "externally_verified_ready_for_use",
        "resolution_state": "resolved_ready_for_use",
        "display_readiness": "clickable_when_projected",
        "meaning": meaning,
        "learner_output": "A small, documented example showing how the tool supports the chosen task, plus a note about what the tool cannot decide.",
        "limitations": limitations,
        "scope": "International tool option; no Nigerian licence, institutional access, archive access or internet availability is assumed.",
        "category": "optional_tool_not_foundation",
        "category_rationale": {
            "category": "optional_tool_not_foundation",
            "why": rationale,
            "breadth": "Useful for a particular source-handling or analysis task, not required for every learner or every project.",
            "boundary": "The tool does not choose the research question, validate evidence, establish representativeness or replace method training.",
            "evidence_limit": "Official product documentation supports the described functions; it does not prove that the tool is suitable for every project, dataset or access context.",
        },
        "learning_links": [{
            "label": link_label,
            "url": url,
            "publisher": "Official project/provider documentation",
            "access": free_access,
            "language": "English",
            "verified_on": AS_OF,
            "role": "official_item_or_task_source",
        }],
        "resources": [{
            "url": url,
            "source": "official_or_primary_documentation",
            "accessed_on": AS_OF,
        }],
        "evidence": [{
            "url": url,
            "accessed_on": AS_OF,
            "publisher": "Official project/provider documentation",
            "locator": "Product purpose, features and stated limitations checked against the route-specific task.",
        }],
        "external_tool_resolution": {
            "resolution_state": "resolved_ready_for_use",
            "display_readiness": "clickable_when_projected",
            "verified_on": AS_OF,
            "sources": [url],
            "rationale": "Official documentation supports this optional tool's specific source-management role; access and fit remain the learner's choice.",
        },
    }


def edge(route_node_id: str, tool_id: str, explanation: str,
         sources: list[str], condition: str | None = None) -> dict[str, Any]:
    edge_id = f"method_route_reveals_tool:{route_node_id}->{tool_id}"
    return {
        "id": edge_id,
        "source": route_node_id,
        "target": tool_id,
        "relationship": "method_route_reveals_tool",
        "status": "resolved_ready_for_use",
        "resolution_state": "resolved_ready_for_use",
        "student_visible": True,
        "display_readiness": "resolved_ready_for_use",
        "requirement_lane": "useful_optional",
        "skippable": True,
        "blocks_progression": False,
        "blocking_policy": "never",
        "sequence_policy": "none",
        "sequence_approved": True,
        "auto_add": False,
        "auto_order": False,
        "condition": condition,
        "explanation": explanation,
        "evidence_sources": sources,
    }


def main() -> None:
    graph = read_graph()
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    previously_existing_node_ids = set(nodes)

    new_nodes = [
        tool_node(
            "domain-item:d078-zotero-reference-manager",
            "Zotero for collecting and citing research sources",
            "Zotero stores and organizes references to books, articles, reports, webpages, letters and manuscripts, attaches notes or files, and can insert citations and bibliographies. It helps you keep track of where a claim came from; it does not judge whether a source is reliable or interpret the source for you.",
            "Useful when a route involves collecting and tracing multiple books, articles, reports or primary-source records.",
            "The route includes research-source management; Zotero can retain bibliographic details and organize sources for later checking and citation.",
            ["Imported bibliographic details can be incomplete or wrong and should be checked against the source.", "Zotero organizes citations; it does not assess source quality, archive provenance or the meaning of evidence.", "Online storage and attachment-sync access may depend on account, storage and network conditions."],
            ZOTERO_DOCS,
            "Official Zotero quick-start guide: collect, organize and cite sources",
            "Public documentation; Zotero software is free to download, with separate storage limits/services.",
        ),
        tool_node(
            "domain-item:d078-tropy-archival-material-manager",
            "Tropy for organizing photographs of archival material",
            "Tropy helps organize and describe photographs of research material. You can group photographs into items, record details such as date, author, folder or archive, add tags and notes, and search those records later. It is useful when archival material has been photographed, but it is not a citation manager, text-analysis package or substitute for checking provenance and permissions.",
            "Use only when the selected archival route includes photographs or scans of research material that need descriptive records.",
            "The archival route asks learners to check provenance, context, gaps and preservation limits; Tropy's official documentation describes metadata and notes for photographs of research material.",
            ["Tropy is not a citation manager and does not generate word-processor citations.", "It organizes photographs and descriptive notes; it does not perform qualitative interpretation or establish authenticity.", "A digitized image can still omit context, be incomplete or be restricted by archive terms and copyright."],
            TROPY_DOCS,
            "Official Tropy documentation: organize and describe photographs of research material",
            "Free and open-source software; public documentation.",
        ),
    ]
    for node in new_nodes:
        existing = nodes.get(node["id"])
        if existing and existing.get("label") != node["label"]:
            raise ValueError(f"Refusing to overwrite a different node: {node['id']}")
        if not existing:
            graph["nodes"].append(node)
            nodes[node["id"]] = node

    source_registry = graph.setdefault("external_source_registry", {})
    source_records = {
        "src:zotero-official-quick-start": {"title": "Zotero official quick-start guide", "url": ZOTERO_DOCS,
            "supports": "Reference management: collecting, organizing and citing sources including books, reports, webpages, letters and manuscripts.",
            "limits": "Does not judge evidence quality or interpret source content."},
        "src:tropy-official-documentation": {"title": "Tropy official documentation", "url": TROPY_DOCS,
            "supports": "Organizing and describing photographs of research materials with metadata, tags and notes.",
            "limits": "Explicitly not a citation manager or qualitative-analysis system."},
        "src:taguette-getting-started": {"title": "Taguette official getting-started guide", "url": TAGUETTE_DOCS,
            "supports": "Document upload, code/tag creation, annotation and retrieval of coded passages.",
            "limits": "Does not generate a valid interpretation or decide what codes mean."},
        "src:taguette-official-app": {"title": "Taguette official project page", "url": TAGUETTE_APP,
            "supports": "Open-source web-based document tagging for qualitative data analysis.",
            "limits": "Product description is not a substitute for qualitative-method instruction."},
        "src:nvivo-official-desktop": {"title": "Lumivero NVivo Desktop official product documentation", "url": NVIVO_DOCS,
            "supports": "Organizing, coding, querying and comparing interviews, documents, surveys and multimedia, including mixed-methods workflows.",
            "limits": "Vendor capability statement; commercial licensing and data governance must be checked."},
        "src:r-time-series-manual": {"title": "R stats package: time-series objects", "url": R_TS_DOCS,
            "supports": "Representing numeric observations indexed by time and frequency.",
            "limits": "Documentation for data representation; does not establish a suitable economic model or inference."},
        "src:stata-time-series": {"title": "Stata official time-series features", "url": STATA_TS_DOCS,
            "supports": "Time-series analysis, models, diagnostics and forecasting features.",
            "limits": "Product documentation; software access, assumptions and data quality remain separate considerations."},
        "src:eviews-time-series-regression": {"title": "EViews official help: time-series regression", "url": EVIEWS_TS_DOCS,
            "supports": "ARMA, ARIMA and ARFIMA specifications and diagnostics for time-series data.",
            "limits": "Commercial tool; software help does not determine whether the model fits the research question or data."},
    }
    for source_id, source in source_records.items():
        prior = source_registry.get(source_id)
        if prior and prior.get("url") != source["url"]:
            raise ValueError(f"Source registry identity conflict: {source_id}")
        source_registry[source_id] = source

    routes = {
        (route["method_id"], route["area_id"]): route
        for route in graph.get("method_area_routes", [])
    }
    required_route_keys = {
        ("domain-item:archival-and-historical-research", "D078:economics-applied-analysis"),
        ("domain-item:archival-and-historical-research", "D078:sociology-social-anthropology"),
        ("domain-item:case-study-and-comparative-case-design", "D078:sociology-social-anthropology"),
    }
    missing_routes = required_route_keys - routes.keys()
    if missing_routes:
        raise ValueError(f"Expected route(s) missing: {sorted(missing_routes)}")

    route_specs = {
        ("domain-item:archival-and-historical-research", "D078:economics-applied-analysis"): [
            ("domain-item:d078-zotero-reference-manager",
             "Use this as an optional way to keep the reports, publications and source notes behind historical economic indicators traceable. It manages references; it does not validate the statistics.", [ZOTERO_DOCS]),
            ("domain-item:r-statistical-computing",
             "Choose R only if you need to arrange and inspect numeric observations across time. R's official stats documentation supports time-series objects; it does not decide whether a comparison or model is economically valid.", [R_TS_DOCS]),
            ("domain-item:stata-quantitative-social-science-workflow",
             "Choose Stata only when the archival task includes time-indexed economic series that need statistical analysis. Its official documentation covers time-series models; this is optional and licensing may apply.", [STATA_TS_DOCS]),
            ("domain-item:d078-eviews-tool",
             "Choose EViews only for a time-series task that needs its econometric workflow. Official help documents time-series regression and ARMA/ARIMA/ARFIMA; it is commercial, and model choice still needs justification.", [EVIEWS_TS_DOCS]),
        ],
        ("domain-item:archival-and-historical-research", "D078:sociology-social-anthropology"): [
            ("domain-item:d078-zotero-reference-manager",
             "Use Zotero optionally to keep books, reports, articles and archival descriptions organized and citable. Check imported details; Zotero does not establish provenance or interpret a document.", [ZOTERO_DOCS]),
            ("domain-item:d078-tropy-archival-material-manager",
             "Use Tropy only if your evidence includes photographs or scans of archival documents that need descriptions, notes and provenance fields. It is not a citation manager or a qualitative-analysis tool.", [TROPY_DOCS]),
            ("domain-item:d078-qualitative-coding-tool",
             "Use Taguette optionally when you need to mark and retrieve passages across document text. You still define the codes, interpret context and check contradictory evidence.", [TAGUETTE_DOCS, TAGUETTE_APP]),
            ("domain-item:d078-nvivo-tool",
             "Use NVivo optionally for a larger or more varied documentary dataset that benefits from coding, queries, cases or analytic memos. It is licensed software; it does not generate defensible interpretations automatically.", [NVIVO_DOCS]),
        ],
        ("domain-item:case-study-and-comparative-case-design", "D078:sociology-social-anthropology"): [
            ("domain-item:d078-zotero-reference-manager",
             "Use Zotero optionally to keep the multiple sources for a bounded case organized and citable. Verify imported metadata and assess each source yourself.", [ZOTERO_DOCS]),
            ("domain-item:d078-qualitative-coding-tool",
             "Use Taguette optionally when the case includes documents or transcripts that you need to code and retrieve. Coding software does not choose the case, establish causation or interpret findings for you.", [TAGUETTE_DOCS, TAGUETTE_APP]),
            ("domain-item:d078-nvivo-tool",
             "Use NVivo optionally when a case or comparison contains substantial interviews, documents or multimedia and benefits from organizing, coding and comparing material. Licensing and data-protection fit must be checked.", [NVIVO_DOCS]),
            ("domain-item:d078-tropy-archival-material-manager",
             "Use Tropy only when a case relies on photographed archival material that needs descriptive records; it is not needed for every case study and does not analyze the evidence.", [TROPY_DOCS]),
        ],
    }

    existing_edge_ids = {edge_record.get("id") for edge_record in edges}
    added_edges = 0
    for route_key, specs in route_specs.items():
        route = routes[route_key]
        route_node_id = route["route_node_id"]
        for tool_id, explanation, sources in specs:
            if tool_id not in nodes or nodes[tool_id].get("item_type") != "tool":
                raise ValueError(f"Tool node is missing or not typed as a tool: {tool_id}")
            condition = nodes[tool_id].get("requirement_scope", {}).get("condition")
            relation = edge(route_node_id, tool_id, explanation, sources, condition)
            if relation["id"] not in existing_edge_ids:
                edges.append(relation)
                existing_edge_ids.add(relation["id"])
                added_edges += 1

    graph["external_route_tool_enrichment"] = {
        "date": AS_OF,
        "scope": "Three previously tool-empty method/area routes only; existing researched canonical tools reused where available.",
        "sources": [
            {"source_id": source_id, **source} for source_id, source in source_records.items()
        ],
        "new_tool_nodes_added": sum(1 for node in new_nodes if node["id"] not in previously_existing_node_ids),
        "route_specific_edges_added_this_run": added_edges,
        "rules": [
            "Tool links are useful/optional, skippable and non-blocking.",
            "No tool is represented as a substitute for method, evidence appraisal, provenance or interpretation.",
            "Tropy is conditional on photographed/scanned archival material; it is not represented as qualitative-analysis software or a citation manager.",
            "Economics archival statistical software is conditional on analyzing time-indexed numeric indicators; reference management remains a separate task.",
            "No area-owned tools are projected into a different area.",
        ],
        "student_visibility_policy_changed": False,
    }

    write_graph(graph)
    print(json.dumps({
        "new_nodes_added": [node["id"] for node in new_nodes],
        "route_specific_edges_added": added_edges,
        "routes_enriched": len(route_specs),
        "source_count": len(graph["external_route_tool_enrichment"]["sources"]),
        "student_visibility_policy_changed": False,
    }, indent=2))


if __name__ == "__main__":
    main()
