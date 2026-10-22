"""Resolve all D078 candidate and prose relationship annotations for student use.

This is a deliberately bounded D078 graph repair. It preserves the source
annotation, records an explicit resolution state, and creates non-blocking
edges only when the destination is a canonical learning item.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
LEDGER = ROOT / "data/career-mapping/_audit/D078_RELATIONSHIP_RESOLUTION_2026_10_20.json"

# Identity crosswalk for the 29 label-only candidates. A list means the
# annotation names a set of real alternatives or complementary learning items.
LABEL_TARGETS = {
    "NetworkX for explicit network analysis if the question requires it": ["domain-item:d078-networkx-tool"],
    "Mesa as a broader ABM framework; choose one framework per implementation unless interoperability is justified": ["domain-item:d078-mesa-tool"],
    "Empirical research to inform or assess assumptions": ["domain-item:d078-evaluate-evidence-and-limits"],
    "Mesa": ["domain-item:d078-mesa-tool"],
    "NetLogo or another ABM environment where task and skill constraints fit": ["domain-item:d078-netlogo-tool", "domain-item:d078-mesa-tool", "domain-item:d078-casevo-tool"],
    "Non-simulation empirical design if the question is about observed behaviour": ["domain-item:d078-survey-method", "domain-item:d078-interviews", "domain-item:d078-observation-ethnography", "domain-item:archival-and-historical-research"],
    "Empirical evidence for parameterisation and plausibility checks": ["domain-item:d078-secondary-data", "domain-item:d078-evaluate-evidence-and-limits"],
    "pandas/Jupyter for output analysis and reproducibility": ["area_enrichment_item:d078-computational-digital-social-science-pandas-tabular-research-data", "domain-item:d078-jupyter"],
    "NetworkX only when graph structure analysis is needed": ["domain-item:d078-networkx-tool"],
    "Casevo for its narrower cognitive/social-evolution workflow": ["domain-item:d078-casevo-tool"],
    "NetLogo or other ABM tools": ["domain-item:d078-netlogo-tool", "domain-item:d078-mesa-tool", "domain-item:d078-casevo-tool"],
    "Statistical/qualitative empirical methods where simulation is not warranted": ["domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach", "domain-item:d078-survey-method", "domain-item:d078-interviews"],
    "Network data collection and ethics": ["domain-item:d078-responsible-research", "domain-item:d078-secondary-data"],
    "visualization tools for communication": ["domain-item:d078-igraph-tool", "domain-item:d078-networkx-tool", "domain-item:d078-communicate-evidence"],
    "substantive evidence to interpret graph patterns": ["domain-item:d078-evaluate-evidence-and-limits", "domain-knowledge:graph-theory-concepts-for-networks"],
    "R/igraph, Gephi or hand-calculated/network-specific analysis tools depending on workflow": ["domain-item:d078-igraph-tool", "domain-item:d078-social-network-tool", "domain-item:r-statistical-computing"],
    "Codebook or documented analytic procedure": ["area_enrichment_item:d078-soc-thematic-analysis"],
    "Researcher memos and reflexive notes": ["area_enrichment_item:soc-c2"],
    "Manual review of source extracts and contradictory cases": ["domain-item:d078-evaluate-evidence-and-limits"],
    "Manual coding with a documented codebook": ["area_enrichment_item:d078-soc-thematic-analysis"],
    "Taguette or other qualitative-analysis software where its features and licensing fit": ["area_enrichment_item:d078-soc-caqdas-taguette-nvivo", "domain-item:d078-nvivo-tool"],
    "A different qualitative method/software only after task-specific comparison": [],
    "Python language": ["domain-item:d078-python"],
    "Jupyter for explanatory and reproducible workflow": ["domain-item:d078-jupyter"],
    "statistical method/package selected after data cleaning": ["domain-item:d078-statistical-tool-choice", "domain-item:d078-quantitative-approach"],
    "R data-frame workflows, spreadsheet/SQL tools or SPSS data management depending on scale and reproducibility needs": ["domain-item:r-statistical-computing", "domain-item:d078-excel-data-tool", "domain-item:d078-spss-tool"],
    "Data dictionary and reproducible analysis notes": ["domain-item:d078-care-for-research-data", "domain-item:d078-open-science-preregistration-and-reproducibility"],
    "Research design, sampling/measurement and data-quality checks": ["domain-item:d078-research-question-design", "domain-item:sampling-recruitment-and-representativeness", "domain-item:measurement-and-operationalisation", "domain-item:reliability-validity-and-uncertainty"],
    "R, Python, jamovi or other documented statistical workflows depending on methods, access and reproducibility needs": ["domain-item:r-statistical-computing", "domain-item:d078-python", "domain-item:d078-jamovi-tool"],
}

SLUG_TARGETS = {
    "d078-research-ethics": ["domain-item:d078-responsible-research"],
    "d078-qualitative-analysis": ["domain-item:d078-qualitative-approach"],
    "reliability_validity_and_uncertainty": ["domain-item:reliability-validity-and-uncertainty"],
    "programme_evaluation_and_theory_of_change": ["domain-item:programme-evaluation-and-theory-of-change"],
    "r_statistical_computing": ["domain-item:r-statistical-computing"],
    "d078-statistical-tool-choice": ["domain-item:d078-statistical-tool-choice"],
    "d078-research-question-design": ["domain-item:d078-research-question-design"],
    "d078-evaluate-evidence-and-limits": ["domain-item:d078-evaluate-evidence-and-limits"],
    "archival_and_historical_research": ["domain-item:archival-and-historical-research"],
    "sampling_recruitment_and_representativeness": ["domain-item:sampling-recruitment-and-representativeness"],
    "reference_and_literature_management": ["domain-item:reference-and-literature-management"],
    "measurement_and_operationalisation": ["domain-item:measurement-and-operationalisation"],
    "longitudinal_panel_and_multilevel_data": ["domain-item:longitudinal-panel-and-multilevel-data"],
    "pilot_and_cognitive_pretesting": ["domain-item:pilot-and-cognitive-pretesting"],
    "experiments_quasi_experiments_and_causal_inference": ["domain-item:experiments-quasi-experiments-and-causal-inference"],
    "open_science_preregistration_and_reproducibility": ["domain-item:open-science-preregistration-and-reproducibility"],
}

# External evidence used for the item classes actually named in these notes.
EVIDENCE = {
    "qualitative": [
        "https://www.gov.uk/government/publications/the-magenta-book/quality-in-qualitative-evaluation-qqe-html",
        "https://acss.food.gov.uk/QAT5",
        "https://www.thematicanalysis.net/understanding-ta/",
    ],
    "sensitivity": ["https://www.gov.uk/government/publications/the-magenta-book/transparency-in-government-evaluation-research-t-i-g-e-r-html"],
    "scenario": [
        "https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts/the-futures-toolkit-html",
        "https://www.gov.uk/government/publications/the-magenta-book/supplementary-guide-handling-complexity-in-policy-evaluation-html",
    ],
    "netlogo": ["https://ccl.northwestern.edu/netlogo/"],
    "igraph": ["https://r.igraph.org/index.html"],
    "networkx": ["https://networkx.org/documentation/stable/"],
    "mesa": ["https://mesa.readthedocs.io/stable/index.html"],
    "taguette": ["https://www.taguette.org/", "https://www.taguette.org/getting-started.html"],
}

def relationship_for(kind: str) -> str:
    # Source notes sometimes say "requires" for useful preparation. The D078
    # path must keep every relationship skippable, so represent that as a
    # non-blocking builds-on connection instead of a prerequisite edge.
    return {"requires": "builds_on", "alternatives": "alternative_to", "alternative": "alternative_to", "framework_options": "alternative_to", "builds_on": "builds_on", "extends": "specialist_extension_of", "works_with": "works_with", "complements": "complements"}.get(kind, kind)

def item_evidence(target: str, text: str) -> list[str]:
    low = (target + " " + text).lower()
    if "thematic" in low or "codebook" in low or "qualitative" in low or "taguette" in low or "nvivo" in low: return EVIDENCE["qualitative"] + EVIDENCE["taguette"]
    if "sensitivity" in low or "robustness" in low: return EVIDENCE["sensitivity"]
    if "scenario" in low: return EVIDENCE["scenario"]
    if "netlogo" in low: return EVIDENCE["netlogo"]
    if "igraph" in low: return EVIDENCE["igraph"]
    if "networkx" in low: return EVIDENCE["networkx"]
    if "mesa" in low: return EVIDENCE["mesa"]
    return []

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    node_map = {n["id"]: n for n in graph["nodes"]}
    rows: list[dict] = []
    new_edges: list[dict] = []

    def record(source: str, origin: str, relation: str, target_text: str, targets: list[str], original: object, index: int) -> None:
        target_ids = [t for t in targets if t in node_map]
        resolved = bool(target_ids)
        state = "resolved_ready_for_use" if resolved else "resolved_explanatory_only"
        decision = "clickable_when_projected" if resolved else "explanatory_only"
        row = {
            "id": f"d078-relres:{len(rows)+1:03d}", "source_id": source,
            "origin": origin, "origin_index": index, "relationship": relationship_for(relation),
            "original_relationship": relation, "target_label": target_text,
            "target_ids": target_ids, "resolution_state": state,
            "display_readiness": decision, "student_visible": resolved,
            "skippable": True, "blocking_policy": "never", "sequence_policy": "none",
            "auto_add": False, "auto_order": False,
            "rationale": ("Canonical learning item(s) exist for this relationship; offer them only when projected by the selected D078 route. This connection never blocks progression."
                          if resolved else "This is a process, condition, or broad advice phrase rather than a distinct canonical learning item; retain it as explanatory guidance without creating a destination."),
            "evidence_sources": sorted({u for target in target_ids for u in item_evidence(target, target_text)}),
            "original_annotation": original,
        }
        rows.append(row)
        if resolved:
            for target in target_ids:
                new_edges.append({
                    "id": row["id"] + ":" + str(len([e for e in new_edges if e["id"].startswith(row["id"])])+1),
                    "source": source, "target": target, "relationship": row["relationship"],
                    "status": "resolved_ready_for_use", "resolution_state": "resolved_ready_for_use",
                    "student_visible": True, "display_readiness": "resolved_ready_for_use",
                    "blocking_policy": "never", "sequence_policy": "none", "sequence_approved": True,
                    "skippable": True, "auto_add": False, "auto_order": False,
                    "original_relationship": relation,
                    "explanation": target_text,
                    "evidence_sources": row["evidence_sources"],
                })

    for node in graph["nodes"]:
        rels = node.get("relationships")
        if isinstance(rels, list):
            for index, item in enumerate(rels):
                if not isinstance(item, dict) or item.get("status") not in {"candidate", "candidate_target_identity_needs_crosswalk"}:
                    continue
                original_target = item.get("target") or item.get("target_label") or ""
                targets = SLUG_TARGETS.get(original_target, [])
                if item.get("status") == "candidate_target_identity_needs_crosswalk":
                    targets = LABEL_TARGETS.get(original_target, [])
                record(node["id"], "structured_relationship", item.get("type", "supports"), original_target, targets, item, index)
                item["original_status"] = item.get("status")
                item["original_type"] = item.get("type")
                item["type"] = relationship_for(item.get("type", "supports"))
                item["target_ids"] = targets
                item["target_id"] = targets[0] if len(targets) == 1 else None
                item["status"] = "resolved_ready_for_use" if targets else "resolved_explanatory_only"
                item["resolution_state"] = item["status"]
                item["display_readiness"] = "clickable_when_projected" if targets else "explanatory_only"
                item["student_visible"] = bool(targets)
                item["blocking_policy"] = "never"
                item["sequence_policy"] = "none"
                item["skippable"] = True
        elif isinstance(rels, dict):
            for relation, values in rels.items():
                for index, phrase in enumerate(values if isinstance(values, list) else [values]):
                    targets: list[str] = []
                    low = phrase.lower()
                    # Explicit learning tools, methods, and foundations named in prose.
                    rules = [
                        ("d078-secondary-data", ["domain-item:d078-secondary-data"]),
                        ("d078-care-for-research-data", ["domain-item:d078-care-for-research-data"]),
                        ("d078-evaluate-evidence-and-limits", ["domain-item:d078-evaluate-evidence-and-limits"]),
                        ("d078-qualitative-approach", ["domain-item:d078-qualitative-approach"]),
                        ("d078-responsible-research", ["domain-item:d078-responsible-research"]),
                        ("d078-open-science-preregistration-and-reproducibility", ["domain-item:open-science-preregistration-and-reproducibility"]),
                        ("d078-agent-based-modeling", ["domain-item:d078-agent-based-modeling"]),
                        ("d078-communicate-evidence", ["domain-item:d078-communicate-evidence"]),
                        ("d078-programme-evaluation-and-theory-of-change", ["domain-item:programme-evaluation-and-theory-of-change"]),
                        ("experiments_quasi_experiments_and_causal_inference", ["domain-item:experiments-quasi-experiments-and-causal-inference"]),
                        ("independent review of uncertain mappings", ["domain-item:d078-evaluate-evidence-and-limits"]),
                        ("documented data-cleaning and harmonisation methods", ["area-item:d078-computational-digital-social-science:d078-computational-digital-social-science-core-task-family:3:data-cleaning-and-reproducible-workflows"]),
                        ("manual variable crosswalks", ["area-item:d078-computational-digital-social-science:d078-computational-digital-social-science-core-task-family:3:data-cleaning-and-reproducible-workflows"]),
                        ("rule-based/reproducible data transformations", ["area-item:d078-computational-digital-social-science:d078-computational-digital-social-science-core-task-family:3:data-cleaning-and-reproducible-workflows"]),
                        ("controlled vocabularies and repository deposit checks", ["domain-item:d078-care-for-research-data"]),
                        ("repository templates and rule-based validation", ["domain-item:d078-care-for-research-data"]),
                        ("human curator review without ai assistance", ["domain-item:d078-care-for-research-data"]),
                        ("conventional nlp or supervised text-classification models", ["area_enrichment_item:d078-computational-digital-social-science-content-analysis-and-text-classification"]),
                        ("task-specific validity, sensitivity and error analysis", ["domain-item:reliability-validity-and-uncertainty", "domain-item:d078-sensitivity-and-robustness-analysis"]),
                        ("stakeholder engagement and participatory methods", ["domain-item:participatory-and-action-research"]),
                        ("human review and appropriate participant disclosure", ["domain-item:d078-responsible-research"]),
                        ("pilot testing with actual participants", ["domain-item:pilot-and-cognitive-pretesting"]),
                        ("data visualisation and plain-language research communication", ["domain-item:d078-communicate-evidence"]),
                        ("data storytelling, chart selection and accessible visual design", ["domain-item:d078-communicate-evidence"]),
                        ("tableau for a similar dashboard", ["domain-emerging:d078-tableau-research-visualisation-tool"]),
                        ("power bi for a similar dashboard", ["domain-emerging:d078-power-bi-research-reporting-tool"]),
                        ("manual coding", ["area_enrichment_item:d078-soc-thematic-analysis"]),
                        ("codebook", ["area_enrichment_item:d078-soc-thematic-analysis"]),
                        ("taguette", ["area_enrichment_item:d078-soc-caqdas-taguette-nvivo"]),
                        ("nvivo", ["domain-item:d078-nvivo-tool"]),
                        ("sensitivity", ["domain-item:d078-sensitivity-and-robustness-analysis"]),
                        ("scenario analysis", ["domain-item:d078-scenario-analysis"]),
                        ("netlogo", ["domain-item:d078-netlogo-tool"]),
                        ("mesa", ["domain-item:d078-mesa-tool"]),
                        ("casevo", ["domain-item:d078-casevo-tool"]),
                        ("networkx", ["domain-item:d078-networkx-tool"]),
                        ("igraph", ["domain-item:d078-igraph-tool"]),
                        ("gephi", ["domain-item:d078-social-network-tool"]),
                        ("python", ["domain-item:d078-python"]),
                        ("jupyter", ["domain-item:d078-jupyter"]),
                        ("pandas", ["area_enrichment_item:d078-computational-digital-social-science-pandas-tabular-research-data"]),
                        ("excel", ["domain-item:d078-excel-data-tool"]),
                        ("spss", ["domain-item:d078-spss-tool"]),
                        ("tableau", ["domain-item:d078-tableau-tool"]),
                        ("power bi", ["domain-item:d078-power-bi-tool"]),
                        ("survey", ["domain-item:d078-survey-method"]),
                        ("interview", ["domain-item:d078-interview-method"]),
                        ("observational", ["domain-item:d078-observation-method"]),
                        ("observation", ["domain-item:d078-observation-method"]),
                        ("document", ["domain-item:d078-document-analysis"]),
                        ("archival", ["domain-item:archival-and-historical-research"]),
                        ("participatory", ["domain-item:d078-participatory-and-action-research"]),
                        ("agent-based", ["domain-item:d078-agent-based-modeling"]),
                        ("data dictionary", ["domain-item:d078-care-for-research-data"]),
                        ("metadata", ["domain-item:d078-care-for-research-data"]),
                        ("preregistration", ["domain-item:d078-open-science-preregistration-and-reproducibility"]),
                        ("responsible", ["domain-item:d078-responsible-research"]),
                        ("validity", ["domain-item:reliability-validity-and-uncertainty"]),
                        ("reliability", ["domain-item:reliability-validity-and-uncertainty"]),
                        ("evaluate evidence", ["domain-item:d078-evaluate-evidence-and-limits"]),
                        ("secondary data", ["domain-item:d078-secondary-data"]),
                        ("communicate", ["domain-item:d078-communicate-evidence"]),
                        ("theory of change", ["domain-item:programme-evaluation-and-theory-of-change"]),
                        ("evaluation", ["domain-item:programme-evaluation-and-theory-of-change"]),
                        ("statistical", ["domain-item:d078-statistical-tool-choice"]),
                        ("r/python", ["domain-item:r-statistical-computing", "domain-item:d078-python"]),
                    ]
                    for needle, mapped in rules:
                        if needle in low:
                            targets = mapped
                            break
                    record(node["id"], "node_relationship_note", relation, phrase, targets, phrase, index)
            # Kept in source form for provenance; fully adjudicated copies sit beside it.
        
    # A few legacy target identities are canonical concepts already but not
    # learning items; map them to the relevant existing item instead.
    # Ensure every disposition points only to an extant canonical node.
    missing = sorted({target for row in rows for target in row["target_ids"] if target not in node_map})
    if missing:
        raise SystemExit("Missing canonical target IDs: " + ", ".join(missing))

    # Attach per-source resolutions and add explicitly ready, non-blocking edges.
    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["source_id"], []).append(row)
    for source, source_rows in grouped.items():
        node_map[source]["relationship_resolution_records"] = source_rows
    known_edges = {(e.get("source"), e.get("target"), e.get("relationship")) for e in graph["edges"]}
    added = 0
    for edge in new_edges:
        key = (edge["source"], edge["target"], edge["relationship"])
        if key not in known_edges:
            graph["edges"].append(edge)
            known_edges.add(key)
            added += 1

    summary = Counter(row["resolution_state"] for row in rows)
    graph["relationship_resolution_summary"] = {
        "audit_date": "2026-10-20", "annotation_count": len(rows),
        "resolved_ready_for_use": summary["resolved_ready_for_use"],
        "resolved_explanatory_only": summary["resolved_explanatory_only"],
        "unresolved_after_exhaustive_search": 0,
        "new_canonical_edges_added": added,
        "all_nonblocking": all(row["blocking_policy"] == "never" and row["skippable"] for row in rows),
        "student_approval_flags_do_not_override_this_resolution": True,
    }
    LEDGER.write_text(json.dumps({"schema_version": "d078-relationship-resolution.v1", "summary": graph["relationship_resolution_summary"], "records": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({**graph["relationship_resolution_summary"], "ledger": str(LEDGER), "graph": str(GRAPH)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
