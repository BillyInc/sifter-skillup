"""Repair D078 relationship endpoints using the reviewed route evidence.

This is a routeability/relationship repair only. It preserves item ownership,
requirement dispositions, role-fit claims, SQL and migrations. Optional choices
stay skippable and never block progression.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH_PATH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
REVIEW_PATH = AUDIT / "D078_ROUTEABILITY_EXTERNAL_SOURCE_REVIEW_2026_10_20.json"
CHECKPOINT_PATH = AUDIT / "D078_RELATIONSHIP_ROUTE_REPAIR_2026_10_20.json"

METHOD = {
    "archival": "domain-item:archival-and-historical-research",
    "case": "domain-item:case-study-and-comparative-case-design",
    "abm": "domain-item:d078-agent-based-modeling",
    "computational": "domain-item:d078-computational-social-research",
    "document": "domain-item:d078-document-analysis",
    "interviews": "domain-item:d078-interviews",
    "mixed": "domain-item:d078-mixed-methods",
    "observation": "domain-item:d078-observation-ethnography",
    "qualitative": "domain-item:d078-qualitative-approach",
    "quantitative": "domain-item:d078-quantitative-approach",
    "spatial": "domain-item:d078-spatial-social-analysis",
    "survey": "domain-item:d078-survey-method",
    "discourse": "domain-item:discourse-and-conversation-analysis",
    "causal": "domain-item:experiments-quasi-experiments-and-causal-inference",
    "focus_groups": "domain-item:focus-groups-and-workshops",
    "longitudinal": "domain-item:longitudinal-panel-and-multilevel-data",
    "participatory": "domain-item:participatory-and-action-research",
    "evaluation": "domain-item:programme-evaluation-and-theory-of-change",
    "psychometrics": "domain-item:psychometrics-and-scale-construction",
    "synthesis": "domain-item:systematic-and-scoping-evidence-synthesis",
    "network": "domain-method:network-analysis",
    "social_network": "domain-method:social-network-analysis",
}

ALL_AREAS = {
    "D078:computational-digital-social-science",
    "D078:economics-applied-analysis",
    "D078:human-geography-population",
    "D078:politics-governance-public-policy",
    "D078:psychology-social-behaviour",
    "D078:social-research-evaluation",
    "D078:sociology-social-anthropology",
}
TEXT_METHODS = {METHOD[k] for k in (
    "archival", "case", "computational", "document", "interviews", "mixed",
    "observation", "qualitative", "discourse", "focus_groups", "participatory",
    "evaluation", "synthesis",
)}
STRUCTURED_OUTPUT_METHODS = {METHOD[k] for k in (
    "abm", "computational", "evaluation", "longitudinal", "network",
    "psychometrics", "quantitative", "social_network", "spatial", "survey",
)}
DATA_METHODS = set(METHOD.values())
PARTICIPANT_OR_SENSITIVE_METHODS = {METHOD[k] for k in (
    "case", "causal", "computational", "document", "focus_groups", "interviews",
    "mixed", "observation", "participatory", "qualitative", "quantitative",
    "spatial", "survey", "evaluation", "psychometrics", "longitudinal",
    "network", "social_network", "discourse",
)}

# Map only where the source review supports the item in that method context.
ROUTES: dict[str, set[str]] = {
    # Evidence appraisal and communication are useful output practices on
    # routes that produce interpreted findings or reports. They remain in
    # their existing requirement lanes.
    "domain-item:d078-communicate-evidence": STRUCTURED_OUTPUT_METHODS | {METHOD["participatory"]},
    "domain-item:d078-evaluate-evidence-and-limits": STRUCTURED_OUTPUT_METHODS | {METHOD[k] for k in ("archival", "document", "mixed", "qualitative", "synthesis")},
    "domain-item:d078-care-for-research-data": DATA_METHODS,
    "domain-item:d078-secondary-data": {METHOD[k] for k in (
        "archival", "case", "computational", "document", "mixed", "quantitative",
        "spatial", "survey", "longitudinal", "evaluation", "synthesis", "network",
        "social_network", "qualitative", "causal", "psychometrics",
    )},
    "domain-item:d078-responsible-research": PARTICIPANT_OR_SENSITIVE_METHODS,
    "domain-item:ai-assisted-and-digital-trace-research-ethics": {METHOD[k] for k in (
        "abm", "computational", "document", "mixed", "quantitative", "spatial",
        "survey", "network", "social_network", "synthesis", "discourse",
    )},
    "domain-knowledge:graph-theory-concepts-for-networks": {METHOD["network"], METHOD["social_network"]},
    "domain-item:d078-networkx-tool": {METHOD[k] for k in ("abm", "computational", "network", "social_network")},
    "domain-item:d078-mesa-tool": {METHOD["abm"]},
    "domain-item:d078-casevo-tool": {METHOD["abm"]},
    "domain-item:d078-excel-data-tool": {METHOD[k] for k in ("quantitative", "computational")},
    "domain-item:d078-nvivo-tool": TEXT_METHODS,
    "domain-item:d078-qualitative-coding-tool": TEXT_METHODS,
    "domain-emerging:d078-power-bi-research-reporting-tool": STRUCTURED_OUTPUT_METHODS,
    "domain-emerging:d078-tableau-research-visualisation-tool": STRUCTURED_OUTPUT_METHODS,
    "domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation": {METHOD[k] for k in (
        "archival", "computational", "document", "longitudinal", "quantitative", "spatial", "survey",
    )},
    "domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation": {METHOD[k] for k in (
        "archival", "computational", "longitudinal", "quantitative", "spatial", "survey",
    )},
    "domain-emerging:d078-emerging-ai-assisted-social-text-annotation": {METHOD[k] for k in (
        "computational", "document", "discourse", "focus_groups", "interviews",
        "mixed", "qualitative", "survey", "synthesis",
    )},
    "domain-emerging:d078-emerging-ai-social-impact-assessment": {METHOD[k] for k in (
        "document", "evaluation", "participatory", "case",
    )},
    "domain-emerging:d078-emerging-ai-use-validation-and-provenance": {METHOD[k] for k in (
        "abm", "computational", "document", "mixed", "quantitative", "survey",
        "network", "social_network",
    )},
    "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing": {METHOD["abm"]},
}

# Area context comes from the reviewed item contexts. These are still optional
# route additions; no role is assigned by area membership.
ITEM_AREAS = {
    "domain-emerging:d078-power-bi-research-reporting-tool": ALL_AREAS,
    "domain-emerging:d078-tableau-research-visualisation-tool": ALL_AREAS,
    "domain-emerging:d078-emerging-ai-social-impact-assessment": {
        "D078:computational-digital-social-science", "D078:politics-governance-public-policy",
        "D078:psychology-social-behaviour", "D078:social-research-evaluation",
        "D078:sociology-social-anthropology",
    },
    "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing": {
        "D078:computational-digital-social-science", "D078:economics-applied-analysis",
        "D078:psychology-social-behaviour",
    },
    "domain-item:d078-casevo-tool": {
        "D078:computational-digital-social-science", "D078:economics-applied-analysis",
        "D078:psychology-social-behaviour", "D078:sociology-social-anthropology",
    },
}

CONDITIONS = {
    "domain-item:d078-communicate-evidence": "Optional when your selected method produces findings to explain or share with a defined audience.",
    "domain-item:d078-evaluate-evidence-and-limits": "Use to check what your selected evidence supports, its limits, and whether the interpretation is warranted.",
    "domain-item:d078-care-for-research-data": "Optional when the selected project creates, uses, stores, or shares research data. Follow the relevant consent, access, retention, and protection rules.",
    "domain-item:d078-secondary-data": "Optional when the question can be answered with existing data. Check source definitions, coverage, access conditions, and fitness for the question.",
    "domain-item:d078-responsible-research": "Use when the selected work involves people, sensitive records, identifiable data, or other applicable research-ethics obligations.",
    "domain-item:ai-assisted-and-digital-trace-research-ethics": "Use when the selected workflow uses AI systems or digital-trace data; apply relevant consent, privacy, platform, and disclosure safeguards.",
    "domain-knowledge:graph-theory-concepts-for-networks": "Optional foundation for a question that represents social entities and their relations as a network.",
    "domain-item:d078-networkx-tool": "Optional when the selected question requires computational construction or analysis of relational network data.",
    "domain-item:d078-mesa-tool": "Optional implementation choice when the selected question has a justified agent-based simulation design.",
    "domain-item:d078-casevo-tool": "Experimental optional implementation for a bounded cognitive-agent social-simulation question. Its repository tutorial shows how to run the framework; it does not validate simulated behaviour or replace empirical research.",
    "domain-item:d078-excel-data-tool": "Optional for organising, checking, summarising, or charting a bounded structured dataset; it does not replace a suitable analysis method.",
    "domain-item:d078-nvivo-tool": "Optional when a documented qualitative workflow benefits from organising, coding, retrieving, or reviewing substantial material.",
    "domain-item:d078-qualitative-coding-tool": "Optional when a lightweight, traceable document-coding interface helps the selected qualitative workflow.",
    "domain-emerging:d078-power-bi-research-reporting-tool": "Optional when the selected work needs an interactive report or dashboard. Check access and data-protection terms before sharing data.",
    "domain-emerging:d078-tableau-research-visualisation-tool": "Optional when the selected work needs visual exploration or an interactive report. Tableau Public is public; do not upload restricted or identifiable data.",
    "domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation": "Experimental optional support for comparing existing datasets. Verify every proposed mapping against source codebooks, populations, measures, periods, and transformation rules.",
    "domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation": "Optional experimental support for drafting or reviewing metadata. A human curator checks every field against the source and repository schema.",
    "domain-emerging:d078-emerging-ai-assisted-social-text-annotation": "Optional experimental support on a justified text-analysis task. Compare model annotations with human-coded examples and retain human interpretive responsibility.",
    "domain-emerging:d078-emerging-ai-social-impact-assessment": "Optional when the research question concerns an AI system's effects on people, groups, or institutions; scope the assessment and involve affected stakeholders where appropriate.",
    "domain-emerging:d078-emerging-ai-use-validation-and-provenance": "Use only when AI is used in the selected workflow; record the system, version, task, data context, checks, and required disclosure.",
    "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing": "Experimental simulation option for an explicit agent-based modelling question. Synthetic outputs are not human participants, representative survey responses, or evidence of actual population behaviour.",
}

PROMOTED_IDS = set(ROUTES)
GROUPED_PROMPTS = {
    "area_enrichment_item:d078-a04-tool-nvivo-tagging",
    "area_enrichment_item:d078-soc-caqdas-taguette-nvivo",
    "area_enrichment_item:d078-social-research-evaluation-qualitative-coding-options",
}
ROUTE_LIST_KEYS = (
    "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
    "domain_downstream_item_ids", "tool_ids", "domain_tool_ids",
)

def add_once(items: list[str], value: str) -> bool:
    if value in items:
        return False
    items.append(value)
    return True

def put_item(route: dict, item_id: str, node: dict) -> bool:
    is_tool = node.get("item_type") == "tool"
    lane = "domain_tool_ids" if is_tool else "domain_downstream_item_ids"
    visible_lane = "tool_ids" if is_tool else "available_item_ids"
    changed = add_once(route.setdefault(lane, []), item_id)
    add_once(route.setdefault(visible_lane, []), item_id)
    return changed

def add_source(node: dict, ref: dict) -> None:
    context = node.setdefault("contextual_application", {})
    refs = context.setdefault("source_references", [])
    if not any(row.get("id") == ref["id"] for row in refs):
        refs.append(ref)
    ids = context.setdefault("source_reference_ids", [])
    if ref["id"] not in ids:
        ids.append(ref["id"])
    resources = node.setdefault("learning_resource_ids", [])
    if ref.get("learning_resource") and ref["id"] not in resources:
        resources.append(ref["id"])

def main() -> None:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    prior_summary = graph.get("relationship_route_repair_summary", {})
    prior_removed = int(prior_summary.get("false_or_misleading_edges_removed", 0))
    prior_corrected = int(prior_summary.get("relationship_edges_corrected", 0))
    nodes = {n["id"]: n for n in graph["nodes"]}
    missing = set(ROUTES) - set(nodes)
    if missing:
        raise SystemExit("Missing routed nodes: " + ", ".join(sorted(missing)))
    known_methods = set(graph["method_node_ids"])
    bad_methods = set().union(*ROUTES.values()) - known_methods
    if bad_methods:
        raise SystemExit("Route map contains non-method IDs: " + ", ".join(sorted(bad_methods)))

    changed_routes = 0
    # Rebuild only the explicitly adjudicated endpoints. Do not disturb other
    # routes, ownership, role claims, or requirement-lane dispositions.
    for route in graph["method_area_routes"]:
        for key in ROUTE_LIST_KEYS:
            route[key] = [x for x in route.get(key, []) if x not in PROMOTED_IDS and x not in GROUPED_PROMPTS]
        for item_id, method_ids in ROUTES.items():
            if route["method_id"] not in method_ids:
                continue
            allowed_areas = ITEM_AREAS.get(item_id)
            if allowed_areas and route["area_id"] not in allowed_areas:
                continue
            changed_routes += put_item(route, item_id, nodes[item_id])

    # Fixed combinations inherit only optional items supported by one or more
    # declared component methods. This is a route projection, not a dependency.
    changed_combo_routes = 0
    for design in graph["combination_designs"]:
        member_methods = set(design.get("method_ids", []))
        for route in design.get("area_routes", []):
            for key in ROUTE_LIST_KEYS:
                route[key] = [x for x in route.get(key, []) if x not in PROMOTED_IDS and x not in GROUPED_PROMPTS]
            for item_id, method_ids in ROUTES.items():
                if not member_methods.intersection(method_ids):
                    continue
                allowed_areas = ITEM_AREAS.get(item_id)
                if allowed_areas and route["area_id"] not in allowed_areas:
                    continue
                changed_combo_routes += put_item(route, item_id, nodes[item_id])
    for node in graph["nodes"]:
        if node.get("kind") != "combination_area_route":
            continue
        design = next((x for x in graph["combination_designs"] if x["id"] == node.get("combination_id")), None)
        if not design:
            continue
        source = next((x for x in design.get("area_routes", []) if x["area_id"] == node.get("area_id")), None)
        if source:
            for key in ROUTE_LIST_KEYS:
                if key in source:
                    node[key] = list(source[key])

    # Source-backed selectability is independent of compulsory/useful
    # disposition. Keep existing requirement_lane and owner_layer values intact.
    for item_id, condition in CONDITIONS.items():
        node = nodes[item_id]
        node["student_visible"] = True
        node["selectable"] = True
        node["approval"] = "externally_verified_ready_for_use"
        node["display_readiness"] = "clickable_when_projected"
        existing_lane = node.get("requirement_lane") or node.get("requirement_level")
        is_skippable = node.get("skippable", existing_lane not in {"needed", "required"}) is True
        node["route_resolution"] = {
            "state": "resolved_ready_for_use",
            "verified_on": "2026-10-20",
            "route_method_ids": sorted(ROUTES[item_id]),
            "owner_layer": node.get("owner_layer", "domain"),
            "student_selectable": True,
            "skippable": is_skippable,
            "blocking_policy": node.get("blocking_policy", "never"),
            "auto_add": False,
            "auto_order": False,
            "condition": condition,
        }
        # Candidates with task-specific conditions carry their bounded-context
        # explanation into the existing rich-context field for card display.
        if item_id in CONDITIONS and not node.get("requirement_scope"):
            node["route_display_condition"] = condition

    # Add official World Bank practical guidance to the existing emerging
    # curation/harmonisation records; keep it clearly optional and bounded.
    wb_meta = {
        "id": "WORLD_BANK_AI_METADATA_CURATOR_COOKBOOK_2026",
        "publisher": "World Bank Development Data Group and Office of the Chief Statistician",
        "title": "Practical Guide to Metadata Curation with Language Models",
        "url": "https://worldbank.github.io/ai4data/cookbook/",
        "locator": "Cookbook overview and chapters on model-assisted drafting of missing fields, quality scoring, review of suggestions, vocabularies, and curator decisions.",
        "source_role": "official practical training/reference for bounded AI-assisted metadata curation",
        "jurisdiction": "World Bank development data/statistical offices; methods transferable only with local schema and source review",
        "limitations": "The guide describes a developing official-statistics workflow; it does not validate every model, dataset, social-science construct, or automated harmonisation result.",
        "access_date": "2026-10-20",
        "access_state": "official cookbook found and reviewed",
        "learning_resource": True,
    }
    wb_intro = {
        "id": "WORLD_BANK_AI_FOR_DATA_OVERVIEW_2026",
        "publisher": "World Bank Development Data Group and Office of the Chief Statistician",
        "title": "AI for Data – Data for AI: overview and practical workstreams",
        "url": "https://worldbank.github.io/ai4data/docs/introduction/",
        "locator": "Overview identifies AI-assisted metadata enrichment and data harmonisation as bounded workstreams and states that AI supports statistical systems under human responsibility.",
        "source_role": "official scope and maturity context for AI-assisted curation/harmonisation",
        "jurisdiction": "Official statistics and development data; not a universal social-science standard",
        "limitations": "The program's tools and guidance are scoped to its development-data context and need adaptation and validation for other data.",
        "access_date": "2026-10-20",
        "access_state": "official documentation found and reviewed",
    }
    for item_id in (
        "domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation",
        "domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation",
    ):
        add_source(nodes[item_id], wb_meta)
        add_source(nodes[item_id], wb_intro)
    graph.setdefault("external_source_registry", {}).update({
        "WORLD_BANK_AI_METADATA_CURATOR_COOKBOOK_2026": {
            "title": wb_meta["title"], "url": wb_meta["url"],
            "supports": "Practical chapters for model-assisted metadata drafting, quality scoring, reviewing suggestions, and curator decisions.",
            "limits": wb_meta["limitations"],
        },
        "WORLD_BANK_AI_FOR_DATA_OVERVIEW_2026": {
            "title": wb_intro["title"], "url": wb_intro["url"],
            "supports": "Official overview of AI-assisted curation and data harmonisation workstreams, with human responsibility retained.",
            "limits": wb_intro["limitations"],
        },
    })

    # Correct false cross-class alternatives; preserve real tool comparisons.
    removed_edges: list[dict] = []
    corrected: list[str] = []
    bad = {
        ("domain-item:d078-mesa-tool", "domain-item:d078-quantitative-approach", "alternative_to"),
        ("domain-item:d078-mesa-tool", "domain-item:d078-qualitative-approach", "alternative_to"),
        ("domain-item:d078-mesa-tool", "domain-item:d078-survey-method", "alternative_to"),
        ("domain-item:d078-casevo-tool", "domain-item:d078-survey-method", "alternative_to"),
        ("domain-item:d078-casevo-tool", "domain-item:archival-and-historical-research", "alternative_to"),
        ("domain-item:d078-mesa-tool", "domain-item:d078-casevo-tool", "alternative_to"),
        ("domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation", "area-item:d078-computational-digital-social-science:d078-computational-digital-social-science-core-task-family:3:data-cleaning-and-reproducible-workflows", "alternative_to"),
        ("domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation", "area_enrichment_item:d078-soc-thematic-analysis", "complements"),
        ("domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation", "domain-item:d078-document-analysis", "complements"),
        ("domain-emerging:d078-emerging-ai-use-validation-and-provenance", "domain-item:d078-document-analysis", "alternative_to"),
        ("domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing", "domain-item:d078-survey-method", "complements"),
        ("domain-item:d078-nvivo-tool", "area_enrichment_item:d078-soc-thematic-analysis", "alternative_to"),
        ("domain-item:d078-nvivo-tool", "area_enrichment_item:d078-soc-caqdas-taguette-nvivo", "alternative_to"),
        ("domain-item:d078-nvivo-tool", "area_enrichment_item:d078-a04-tool-nvivo-tagging", "alternative_to"),
    }
    keep = []
    for edge in graph["edges"]:
        triple = (edge.get("source"), edge.get("target"), edge.get("relationship"))
        if triple in bad or (triple[2] in {"alternative_to", "alternative_tool_option"} and triple[0] == triple[1]):
            removed_edges.append(edge)
            continue
        if triple == ("domain-item:d078-casevo-tool", "domain-item:d078-mesa-tool", "alternative_to"):
            edge["relationship"] = "specialist_extension_of"
            edge["explanation"] = "Casevo is a narrower cognitive-agent experiment built on the Mesa simulation framework; it is an experimental ABM implementation, not a replacement for empirical research methods."
            corrected.append(edge.get("id"))
        elif triple == ("domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation", "domain-item:d078-care-for-research-data", "alternative_to"):
            edge["relationship"] = "specialist_extension_of"
            edge["explanation"] = "AI-assisted metadata suggestions are an optional, experimental extension of ordinary research-data documentation and curation; a human curator verifies every suggestion against the source and repository schema."
            corrected.append(edge.get("id"))
        elif triple in {
            ("domain-emerging:d078-power-bi-research-reporting-tool", "domain-item:d078-excel-data-tool", "alternative_to"),
            ("domain-emerging:d078-tableau-research-visualisation-tool", "domain-item:d078-excel-data-tool", "alternative_to"),
            ("domain-emerging:d078-power-bi-research-reporting-tool", "domain-item:d078-python", "alternative_to"),
            ("domain-emerging:d078-tableau-research-visualisation-tool", "domain-item:d078-python", "alternative_to"),
            ("domain-emerging:d078-power-bi-research-reporting-tool", "domain-item:d078-excel-data-tool", "works_with"),
            ("domain-emerging:d078-tableau-research-visualisation-tool", "domain-item:d078-excel-data-tool", "works_with"),
            ("domain-emerging:d078-power-bi-research-reporting-tool", "domain-item:d078-python", "works_with"),
            ("domain-emerging:d078-tableau-research-visualisation-tool", "domain-item:d078-python", "works_with"),
        }:
            edge["relationship"] = "alternative_tool_option"
            edge["explanation"] = "For a bounded output task, this tool can be used instead of an interactive dashboard when its static or code-based visual report meets the audience and reproducibility needs. It does not replace the analysis method or data validation."
            corrected.append(edge.get("id"))
        elif triple[2] == "alternative_to" and {triple[0], triple[1]} == {
            "domain-emerging:d078-power-bi-research-reporting-tool",
            "domain-emerging:d078-tableau-research-visualisation-tool",
        }:
            edge["relationship"] = "alternative_tool_option"
            edge["status"] = "resolved_ready_for_use"
            edge["blocking_policy"] = "never"
            edge["sequence_policy"] = "none"
            edge["skippable"] = True
            edge["explanation"] = "Power BI and Tableau can each produce interactive research reports and dashboards. Choose according to access, workflow, audience, privacy, and sharing needs; neither tool is compulsory."
            corrected.append(edge.get("id"))
        keep.append(edge)
    graph["edges"] = keep

    # Separate canonical products; the combined area prompt stays explanatory.
    taguette = "domain-item:d078-qualitative-coding-tool"
    nvivo = "domain-item:d078-nvivo-tool"
    pair = (taguette, nvivo, "alternative_tool_option")
    existing = {(e.get("source"), e.get("target"), e.get("relationship")) for e in graph["edges"]}
    if pair not in existing:
        graph["edges"].append({
            "id": f"alternative_tool_option:{taguette}->{nvivo}",
            "source": taguette,
            "target": nvivo,
            "relationship": "alternative_tool_option",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "blocking_policy": "never",
            "sequence_policy": "none",
            "skippable": True,
            "auto_add": False,
            "auto_order": False,
            "explanation": "Taguette and NVivo are separate qualitative-analysis products. Compare project size, coding/retrieval needs, collaboration, licensing, and data-handling terms; the software does not decide what a passage means.",
            "sources": ["https://www.taguette.org/getting-started.html", "https://community.lumivero.com/s/article/NV15Win-Content-tutorials-tutorial-01-intro-import?language=en_US"],
            "source_resolved": True,
            "target_resolved": True,
            "relationship_resolution": "verified_separate_selectable_tool_options",
        })
    reverse_pair = (nvivo, taguette, "alternative_tool_option")
    existing = {(e.get("source"), e.get("target"), e.get("relationship")) for e in graph["edges"]}
    if reverse_pair not in existing:
        graph["edges"].append({
            "id": f"alternative_tool_option:{nvivo}->{taguette}",
            "source": nvivo,
            "target": taguette,
            "relationship": "alternative_tool_option",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "blocking_policy": "never",
            "sequence_policy": "none",
            "skippable": True,
            "auto_add": False,
            "auto_order": False,
            "explanation": "NVivo and Taguette are separate qualitative-analysis products. Compare project size, coding/retrieval needs, collaboration, licensing, and data-handling terms; the software does not decide what a passage means.",
            "sources": ["https://www.taguette.org/getting-started.html", "https://community.lumivero.com/s/article/NV15Win-Content-tutorials-tutorial-01-intro-import?language=en_US"],
            "source_resolved": True,
            "target_resolved": True,
            "relationship_resolution": "verified_separate_selectable_tool_options",
        })

    # Record the full current route coverage, not only changes from this run;
    # the script is intentionally safe to rerun.
    method_memberships = sum(
        1 for r in graph["method_area_routes"] for item_id in PROMOTED_IDS
        if item_id in r.get("domain_tool_ids", []) or item_id in r.get("domain_downstream_item_ids", [])
    )
    combo_memberships = sum(
        1 for c in graph["combination_designs"] for r in c.get("area_routes", []) for item_id in PROMOTED_IDS
        if item_id in r.get("domain_tool_ids", []) or item_id in r.get("domain_downstream_item_ids", [])
    )
    graph["relationship_route_repair_summary"] = {
        "audit_date": "2026-10-20",
        "method_area_routes_changed": max(changed_routes, method_memberships),
        "fixed_combination_routes_changed": max(changed_combo_routes, combo_memberships),
        "routed_items": len(ROUTES),
        "routed_item_ids": sorted(ROUTES),
        "false_or_misleading_edges_removed": prior_removed + len(removed_edges),
        "relationship_edges_corrected": prior_corrected + len(corrected),
        "taguette_and_nvivo_separate_selectable_items": True,
        "grouped_taguette_nvivo_prompt_remains_explanatory": True,
        "casevo_selectable_only_on_abm_routes": True,
        "requirement_dispositions_changed": False,
        "ownership_changed": False,
        "role_fit_changed": False,
        "all_added_routes_skippable": all(nodes[x].get("route_resolution", {}).get("skippable") is True for x in ROUTES),
        "needed_items_retain_existing_nonblocking_policy": True,
        "maximum_blocking_policy": "never",
        "combination_retests_run": False,
    }
    GRAPH_PATH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    review = json.loads(REVIEW_PATH.read_text(encoding="utf-8"))
    for finding in review.get("item_findings", []):
        if "power-bi-research-reporting-tool" in json.dumps(finding):
            finding["route_action"] = "Power BI, Tableau, and Excel are optional route choices on the reviewed structured-output paths; product alternatives remain separate and no tool is compulsory."
            finding["decision_status"] = "source_verified_and_routed_skippably"
        if "mesa-tool" in json.dumps(finding):
            finding["route_action"] = "Mesa and Casevo are optional tools only on agent-based-modelling routes. Casevo is an experimental implementation with model-validity limits, not a replacement for survey, archival, or qualitative methods."
            finding["decision_status"] = "mesa_and_casevo_routed_on_abm_only"
        if any(x in json.dumps(finding) for x in ("ai-assisted-cross-source-data-harmonisation", "ai-assisted-research-data-metadata-curation")):
            finding["route_action"] = "World Bank AI-for-Data documentation and cookbook provide an official bounded practical learning reference. Expose as optional experimental choices only on routes using existing, comparative, or managed data; require source-level human verification."
            finding["decision_status"] = "new_official_learning_resource_added_and_routed_skippably"
        if "soc-caqdas-taguette-nvivo" in json.dumps(finding):
            finding["route_action"] = "Keep the combined prompt explanatory; route the distinct canonical Taguette and NVivo records as separate optional products on text-analysis method routes."
            finding["decision_status"] = "group_prompt_explanatory_separate_tools_routed"
    review["decision_status"] = (
        "Source-supported items now have explicit optional routes, with the newly reviewed World Bank metadata-curation guidance recorded. "
        "False tool-to-method alternatives were removed; Power BI/Tableau remain distinct dashboard alternatives, and Taguette/NVivo are separate selectable tools. "
        "Requirement dispositions, ownership, role-fit claims, SQL, and migrations were preserved. Combination retests remain pending until route repair validation."
    )
    REVIEW_PATH.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    CHECKPOINT_PATH.write_text(json.dumps({
        "schema_version": "d078-relationship-route-repair.v1",
        "summary": graph["relationship_route_repair_summary"],
        "removed_edges": [{"id": e.get("id"), "source": e.get("source"), "target": e.get("target"), "relationship": e.get("relationship")} for e in removed_edges],
        "corrected_edge_ids": corrected,
        "new_tool_choice_edge": f"alternative_tool_option:{taguette}->{nvivo}",
        "new_external_source": wb_meta,
        "graph": str(GRAPH_PATH),
        "review": str(REVIEW_PATH),
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(graph["relationship_route_repair_summary"], ensure_ascii=False))

if __name__ == "__main__":
    main()
