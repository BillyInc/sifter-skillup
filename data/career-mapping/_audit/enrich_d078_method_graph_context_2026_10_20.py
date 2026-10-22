"""Attach source-backed context to D078 graph items and refresh its UI contract.

This is a presentation-context pass only. It does not change item ownership,
requirements, approvals, visibility, route membership, role fit, or typed edges.
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from copy import deepcopy
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH_PATH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
TECHNIQUE_LEDGER_PATH = AUDIT / "D078_METHOD_TECHNIQUE_RESOLUTION_2026_10_20.json"
RELATIONSHIP_LEDGER_PATH = AUDIT / "D078_RELATIONSHIP_RESOLUTION_2026_10_20.json"
ROLE_GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
EMERGING_LEDGER_PATH = AUDIT / "D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.json"
LEDGER_PATH = AUDIT / "D078_ITEM_CONTEXT_ENRICHMENT_2026_10_20.json"

sys.path.insert(0, str(ROOT))
from backend.d078_guided_content import d078_guided_content  # noqa: E402


PROTECTED_FIELDS = (
    "kind", "item_type", "label", "layer", "area_id", "role_id",
    "requirement_lane", "requirement_level", "requirement_reason",
    "requirement_scope", "requirement_lane_source", "skippable",
    "blocking_policy", "approval", "student_visible", "placement_decision",
    "method_to_role_fit_claim", "resolution_state", "display_readiness",
    "selectable", "owner_layer",
)
ITEM_KINDS = {
    "domain_learning_item", "domain_emerging_learning_item",
    "domain_method", "domain_knowledge",
    "area_learning_item", "area_enrichment_item", "area_tool_option",
    "area_tool_application_reference", "role_item_candidate",
    "runtime_learning_item",
}

# These are explanatory expansions of the existing area task-family summaries.
# Every target is a canonical area item already in the graph's area routes; this
# table does not create typed relationships or turn the summaries into items.
AREA_TASK_EXPANSIONS = {
    "computational-question-formulation": ["area_enrichment_item:d078-computational-digital-social-science-computational-question-formulation"],
    "digital-social-data-provenance-and-ethics": ["area_enrichment_item:d078-computational-digital-social-science-data-provenance-and-digital-ethics"],
    "data-cleaning-and-reproducible-workflows": ["area_enrichment_item:d078-computational-digital-social-science-reproducible-data-cleaning", "area_enrichment_item:d078-computational-digital-social-science-pandas-tabular-research-data"],
    "statistics-or-text-network-analysis-when-appropriate": ["area_enrichment_item:d078-computational-digital-social-science-interpretable-statistical-modeling", "area_enrichment_item:d078-computational-digital-social-science-content-analysis-and-text-classification", "area_enrichment_item:d078-computational-digital-social-science-network-analysis-method"],
    "simulation-model-evaluation-and-interpretation": ["area_enrichment_item:d078-computational-digital-social-science-agent-based-social-simulation"],
    "human-spatial-patterns-and-place": ["area_enrichment_item:d078-human-geography-population-spatial-concepts-and-place", "area_enrichment_item:d078-human-geography-population-spatial-pattern-communication"],
    "population-measures-and-demographic-change": ["area_enrichment_item:d078-human-geography-population-population-measures"],
    "census-survey-administrative-data-appraisal": ["area_enrichment_item:d078-human-geography-population-census-survey-admin-appraisal"],
    "gis-spatial-analysis-only-when-a-spatial-question-supports-it": ["area_enrichment_item:d078-human-geography-population-spatial-analysis-method", "area_enrichment_item:d078-human-geography-population-qgis-spatial-tool", "area_tool_option:d078-hg-tool-arcgis-spatial-analyst", "area_tool_option:d078-hg-tool-geoda", "area_tool_option:d078-hg-tool-geopandas", "area_tool_option:d078-hg-tool-pysal-esda"],
    "migration-urbanisation-interpretation": ["area_enrichment_item:d078-human-geography-population-migration-urbanisation-interpretation"],
    "research-question-design": ["area_enrichment_item:d078-social-research-evaluation-study-question-design"],
    "sampling-and-measurement": ["area_enrichment_item:d078-social-research-evaluation-sampling-and-measurement"],
    "survey-interview-focus-group-document-methods": ["area_enrichment_item:d078-social-research-evaluation-field-and-document-method-choice"],
    "quantitative-qualitative-mixed-analysis": ["area_enrichment_item:d078-social-research-evaluation-quantitative-analysis-choice", "area_enrichment_item:d078-social-research-evaluation-qualitative-coding-options"],
    "programme-policy-evaluation": ["area_enrichment_item:d078-social-research-evaluation-evaluation-design-and-evidence", "area_enrichment_item:d078-social-research-evaluation-programme-theory-and-logic"],
    "ethics-data-stewardship-reporting": ["area_enrichment_item:d078-social-research-evaluation-research-ethics-data-stewardship", "area_enrichment_item:d078-social-research-evaluation-stakeholder-use-and-reporting"],
    "qualitative-and-quantitative-inquiry": ["domain-item:d078-qualitative-approach", "domain-item:d078-quantitative-approach", "domain-item:d078-mixed-methods"],
    "interviews-observation-document-analysis": ["area_enrichment_item:d078-soc-interview-focusgroup", "area_enrichment_item:d078-soc-document-analysis", "area_enrichment_item:d078-soc-ethnographic-fieldwork"],
    "ethnographic-and-comparative-reasoning": ["area_enrichment_item:d078-soc-ethnographic-fieldwork", "domain-item:case-study-and-comparative-case-design"],
    "research-ethics-and-reflexivity": ["area_enrichment_item:d078-soc-digital-trace-ethics", "domain-item:d078-responsible-research"],
}


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def unique_records(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in rows:
        key = json.dumps(row, sort_keys=True, ensure_ascii=False)
        if key not in seen:
            seen.add(key)
            result.append(row)
    return result


def main() -> None:
    graph = read_json(GRAPH_PATH)
    prior_relationship_summary = graph.get("relationship_resolution_summary", {})
    technique_ledger = read_json(TECHNIQUE_LEDGER_PATH)
    relationship_ledger = read_json(RELATIONSHIP_LEDGER_PATH)
    role_graph = read_json(ROLE_GRAPH_PATH)
    emerging_ledger = read_json(EMERGING_LEDGER_PATH)
    emerging_records = {
        f"domain-emerging:{record['id']}": record
        for record in emerging_ledger.get("candidate_items", [])
        if record.get("id")
    }
    emerging_sources = {row.get("source_id"): row for row in emerging_ledger.get("source_registry", [])}
    area_records_by_area = d078_guided_content()["areaItems"]
    nodes = {node["id"]: node for node in graph["nodes"]}
    original = {node_id: {key: deepcopy(node.get(key)) for key in PROTECTED_FIELDS if key in node}
                for node_id, node in nodes.items()}
    role_source = {node["id"]: node for node in role_graph["nodes"]}

    area_records_by_key: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for area_id, records in area_records_by_area.items():
        for record in records:
            area_records_by_key[(area_id, norm(record.get("name", "")))].append(record)

    technique_by_id = {record["canonical_id"]: record for record in technique_ledger["records"]
                       if record.get("canonical_id")}

    # Reconcile the exhaustive target-resolution ledger into the rebuilt graph.
    # Keep the per-annotation resolution record on its source node and materialize
    # one canonical typed edge per unique source/target/type tuple.
    edge_by_key: dict[tuple[str, str, str], dict[str, Any]] = {}
    for edge in graph["edges"]:
        key = (edge.get("source", ""), edge.get("target", ""), edge.get("relationship", ""))
        edge_by_key.setdefault(key, edge)
    canonical_edges_added = 0
    relationship_record_ids_by_key: dict[tuple[str, str, str], list[str]] = defaultdict(list)
    for record in relationship_ledger["records"]:
        source_id = record.get("source_id")
        source_node = nodes.get(source_id)
        if source_node is None:
            raise AssertionError(f"Relationship ledger source does not resolve: {record.get('id')} -> {source_id}")
        source_records = source_node.setdefault("relationship_resolution_records", [])
        if not any(existing.get("id") == record.get("id") for existing in source_records):
            source_records.append(deepcopy(record))
        if record.get("resolution_state") != "resolved_ready_for_use":
            continue
        for target_id in record.get("target_ids", []):
            if target_id not in nodes:
                raise AssertionError(f"Relationship ledger target does not resolve: {record.get('id')} -> {target_id}")
            key = (source_id, target_id, record.get("relationship", ""))
            relationship_record_ids_by_key[key].append(record["id"])
            existing = edge_by_key.get(key)
            if existing:
                resolution_ids = existing.setdefault("resolution_record_ids", [])
                if record["id"] not in resolution_ids:
                    resolution_ids.append(record["id"])
                existing["resolution_state"] = "resolved_ready_for_use"
                existing["status"] = "resolved_ready_for_use"
                existing["student_visible"] = record.get("student_visible") is True
                existing["display_readiness"] = record.get("display_readiness")
                existing["blocking_policy"] = "never"
                existing["sequence_policy"] = "none"
                existing["skippable"] = True
                existing["auto_add"] = False
                existing["auto_order"] = False
                existing["explanation"] = record.get("rationale")
                existing["evidence_sources"] = record.get("evidence_sources", [])
                continue
            edge = {
                "id": f"d078-resolved-relation:{record['id']}:{len(relationship_record_ids_by_key[key])}",
                "source": source_id,
                "target": target_id,
                "relationship": record.get("relationship"),
                "status": "resolved_ready_for_use",
                "resolution_state": "resolved_ready_for_use",
                "student_visible": record.get("student_visible") is True,
                "display_readiness": record.get("display_readiness"),
                "blocking_policy": "never",
                "sequence_policy": "none",
                "sequence_approved": False,
                "skippable": True,
                "auto_add": False,
                "auto_order": False,
                "explanation": record.get("rationale"),
                "evidence_sources": record.get("evidence_sources", []),
                "resolution_record_ids": [record["id"]],
            }
            graph["edges"].append(edge)
            edge_by_key[key] = edge
            canonical_edges_added += 1
    graph["relationship_resolution_summary"] = {
        **relationship_ledger.get("summary", {}),
        "canonical_relationship_tuples_in_graph_from_ledger": len(relationship_record_ids_by_key),
        "canonical_edges_added_during_rebuild": prior_relationship_summary.get("canonical_edges_added_during_rebuild", canonical_edges_added),
        "relationship_records_persisted_on_source_nodes": len(relationship_ledger["records"]),
        "all_ready_targets_resolve_to_canonical_graph_nodes": True,
        "ready_edges_nonblocking_and_skippable": True,
    }

    # One explicit gap is source-backed in the graph: Excel is a resolved
    # alternative to pandas but was absent from the quantitative/computational
    # method routes. Add it to those two routes only. Do not expand tool links
    # across every route where a broad tool happens to occur.
    alternative_route_additions: list[dict[str, str]] = []
    excel_id = "domain-item:d078-excel-data-tool"
    pandas_id = "domain-item:d078-pandas-tool"
    explicit_excel_methods = {
        "domain-item:d078-quantitative-approach",
        "domain-item:d078-computational-social-research",
    }
    evidence_edge = next((edge for edge in graph["edges"] if edge.get("relationship") in {"alternative_to", "alternative_tool_option"}
                          and {edge.get("source"), edge.get("target")} == {pandas_id, excel_id}
                          and edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True), None)
    if evidence_edge:
        for route in graph["method_area_routes"]:
            if route.get("method_id") in explicit_excel_methods and excel_id not in route.get("domain_tool_ids", []):
                route.setdefault("domain_tool_ids", []).append(excel_id)
                alternative_route_additions.append({
                    "edge_id": evidence_edge.get("id", ""),
                    "method_id": route["method_id"],
                    "area_id": route["area_id"],
                    "item_id": excel_id,
                })

    # Build explicit route trails from the graph's existing route tables. A
    # route makes an item discoverable; it does not make it a role requirement.
    domain_route_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for route in graph["method_area_routes"]:
        method_id = route["method_id"]
        method_node = nodes.get(method_id, {})
        linked_ids: set[str] = set()
        for field in (
            "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
            "tool_ids", "domain_downstream_item_ids", "domain_tool_ids",
            "explanatory_item_ids",
        ):
            linked_ids.update(route.get(field, []))
        roles = [row["role_id"] for row in graph["method_area_role_routes"]
                 if row["method_id"] == method_id and row["area_id"] == route["area_id"]]
        for item_id in linked_ids:
            domain_route_rows[item_id].append({
                "method_id": method_id,
                "method_label": method_node.get("label", method_id),
                "area_id": route["area_id"],
                "area_label": nodes.get(route["area_id"], {}).get("label", route["area_id"]),
                "task_family_ids": route.get("task_family_ids", []),
                "role_ids": sorted(set(roles)),
                "route_source": "method_area_routes and method_area_role_routes",
                "role_fit_claim": "not_inferred_from_area_membership",
            })

    area_role_routes: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in graph["method_area_role_routes"]:
        area_role_routes[row["area_id"]].append({
            "role_id": row["role_id"],
            "role_label": nodes.get(row["role_id"], {}).get("label", row["role_id"]),
            "method_id": row["method_id"],
            "fit_claim": row.get("method_to_role_fit_claim", "not_inferred_from_area_membership"),
        })
    task_families = {node.get("task_family_id"): node for node in graph["nodes"]
                     if node.get("kind") == "area_task_family"}

    relationships_by_source: dict[str, list[dict[str, Any]]] = defaultdict(list)
    node_ids = set(nodes)
    for edge in graph["edges"]:
        if edge.get("status") != "resolved_ready_for_use" or edge.get("student_visible") is not True:
            continue
        source_id, target_id = edge.get("source"), edge.get("target")
        if source_id not in node_ids or target_id not in node_ids:
            continue
        relationships_by_source[source_id].append({
            "type": edge.get("relationship"),
            "target_id": target_id,
            "target_label": nodes[target_id].get("label", nodes[target_id].get("name", target_id)),
            "explanation": edge.get("explanation"),
            "status": edge.get("status"),
            "blocking_policy": edge.get("blocking_policy", "never"),
            "sequence_policy": edge.get("sequence_policy", "none"),
            "selectable_only_when_projected": True,
        })

    updated: dict[str, dict[str, Any]] = {}
    area_match_counts: CounterLike = CounterLike()
    role_context_count = 0
    technique_context_count = 0
    area_task_expansion_count = 0
    domain_method_context_count = 0
    emerging_context_count = 0
    emerging_source_reference_count = 0

    for node in graph["nodes"]:
        kind = node.get("kind")
        if kind not in ITEM_KINDS and kind != "method_combination_design":
            continue
        context: dict[str, Any] = {
            "schema_version": "d078_contextual_application_v1",
            "item_id": node["id"],
            "item_label": node.get("label", node.get("name", node["id"])),
            "item_type": node.get("item_type"),
            "owner_layer": node.get("layer") or node.get("owner_layer") or (
                "domain" if kind.startswith("domain") else
                "area" if kind.startswith("area") else
                "role" if kind == "role_item_candidate" else "route"
            ),
            "what_it_is": node.get("meaning") or node.get("plain_language_meaning") or node.get("what_it_is"),
            "how_it_is_used": node.get("meaning_in_domain") or node.get("contextual_use") or node.get("use_case") or
                              (node.get("requirement_scope") or {}).get("condition") or
                              (node.get("requirement_scope") or {}).get("rationale") or
                              node.get("requirement_reason") or node.get("scope") or
                              node.get("what_it_is") or node.get("meaning") or node.get("plain_language_meaning"),
            "why_it_may_matter": (node.get("requirement_scope") or {}).get("condition") or (node.get("requirement_scope") or {}).get("rationale") or node.get("requirement_reason"),
            "expected_output": node.get("learner_output") or node.get("task_output"),
            "limitations": node.get("limitations") or node.get("limits_nonreplacement") or node.get("limits"),
            "source_references": node.get("learning_links") or node.get("source_refs") or node.get("evidence") or
                                 (node.get("external_tool_resolution") or {}).get("sources") or
                                 node.get("evidence_source_ids") or node.get("source_ids") or node.get("source_artifacts") or [],
            "typed_relationships": unique_records(relationships_by_source.get(node["id"], [])),
            "context_scope_note": "Route links show where this item can support learning; they do not claim a job requirement, universal use, or automatic mastery.",
        }
        technique_record = technique_by_id.get(node["id"])

        emerging_record = emerging_records.get(node["id"])
        if kind == "domain_emerging_learning_item" and emerging_record:
            emerging_context_count += 1
            source_ids = unique_records([
                {"source_id": source_id}
                for source_id in (emerging_record.get("evidence_source_ids", []) +
                                  emerging_record.get("explanatory_source_ids", []) +
                                  emerging_record.get("learning_resource_ids", []))
            ])
            resolved_sources = []
            for source in source_ids:
                record = emerging_sources.get(source["source_id"])
                if record:
                    resolved_sources.append({
                        "id": record.get("source_id"),
                        "publisher": record.get("publisher"),
                        "title": record.get("title"),
                        "url": record.get("url"),
                        "locator": record.get("locator"),
                        "source_role": record.get("source_role"),
                        "jurisdiction": record.get("jurisdiction"),
                        "limitations": record.get("limitations"),
                        "access_date": record.get("access_date"),
                        "access_state": record.get("access_state"),
                    })
            emerging_source_reference_count += len(resolved_sources)
            context.update({
                "what_it_is": emerging_record.get("what_it_is") or emerging_record.get("d078_context") or context.get("what_it_is"),
                "how_it_is_used": emerging_record.get("what_it_does_for_the_task") or emerging_record.get("d078_context") or context.get("how_it_is_used"),
                "why_it_may_matter": emerging_record.get("disposition") or context.get("why_it_may_matter"),
                "expected_output": emerging_record.get("learner_output") or context.get("expected_output"),
                "limitations": emerging_record.get("limitations", []) or emerging_record.get("review_gaps", []),
                "source_references": resolved_sources,
                "source_reference_ids": [source["source_id"] for source in source_ids],
                "context_source": "D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10 candidate and source registry",
                "evidence_state": emerging_record.get("claim_state"),
                "maturity": emerging_record.get("maturity"),
                "conditional_area_context": emerging_record.get("area_routes", []),
                "role_context_boundary": emerging_record.get("role_routes"),
                "emerging_relationship_notes": {
                    "note": "Source-ledger alternatives, complements, prerequisites and framework mentions remain explanatory prose unless separately represented by a resolved canonical graph edge.",
                    "relationships": deepcopy(emerging_record.get("relationships", {})),
                },
                "display_boundary": "This candidate remains hidden and nonselectable under its existing disposition; context enrichment does not approve or expose it.",
            })

        if kind in {"domain_learning_item", "domain_emerging_learning_item", "domain_method", "domain_knowledge"}:
            domain_method_context_count += node["id"].startswith(("domain-method:", "domain-knowledge:"))
            method_ids = set()
            if technique_record:
                technique_context_count += 1
                method_ids.update(technique_record.get("route_method_ids", []))
                context.update({
                    "how_it_is_used": node.get("meaning_in_domain") or technique_record.get("rationale") or context["how_it_is_used"],
                    "verified_sources": technique_record.get("sources", []),
                    "verification": {
                        "state": technique_record.get("resolution_state"),
                        "verified_on": technique_record.get("verified_on"),
                        "source_backed": technique_record.get("source_backed"),
                    },
                    "selection_behavior": {
                        "selectable": technique_record.get("selectable"),
                        "skippable": technique_record.get("skippable"),
                        "blocking_policy": technique_record.get("blocking_policy"),
                        "sequence_policy": technique_record.get("sequence_policy"),
                    },
                })
            method_ids.update(row["method_id"] for row in domain_route_rows.get(node["id"], []))
            context["method_context"] = [
                {"method_id": method_id, "label": nodes.get(method_id, {}).get("label", method_id)}
                for method_id in sorted(method_ids) if method_id in nodes
            ]
            context["downstream_routes"] = unique_records(domain_route_rows.get(node["id"], []))
            context["programme_context"] = {
                "programme_id": graph["programme_transition"].get("programme_id"),
                "programme_label": graph["programme_transition"].get("programme_label"),
                "boundary": "The selected Sociology programme is the entry context; this domain item is not claimed as a course outcome unless a course anchor is explicitly recorded.",
            }
            if node["id"] in technique_by_id:
                context["new_method_technique_record"] = True

        elif kind in {"area_enrichment_item", "area_tool_option", "area_tool_application_reference", "area_learning_item"}:
            area_id = node.get("area_id")
            key = (area_id, norm(node.get("label", "")))
            records = area_records_by_key.get(key, [])
            context["area_id"] = area_id
            context["area_label"] = nodes.get(area_id, {}).get("label", area_id)
            context["area_role_routes"] = unique_records(area_role_routes.get(area_id, []))
            if technique_record:
                context.update({
                    "verified_sources": technique_record.get("sources", []),
                    "verification": {
                        "state": technique_record.get("resolution_state"),
                        "display_readiness": technique_record.get("display_readiness"),
                        "verified_on": technique_record.get("verified_on"),
                        "source_backed": technique_record.get("source_backed"),
                    },
                    "resolution_rationale": technique_record.get("rationale"),
                    "linked_canonical_item_ids": technique_record.get("linked_item_ids", []),
                    "selection_behavior": {
                        "selectable": technique_record.get("selectable"),
                        "skippable": technique_record.get("skippable"),
                        "blocking_policy": technique_record.get("blocking_policy"),
                    },
                })
                if technique_record.get("rationale") and not context.get("how_it_is_used"):
                    context["how_it_is_used"] = technique_record["rationale"]
            if node["id"] == "area_enrichment_item:d078-a04-tool-nvivo-tagging":
                context["what_it_is"] = "An explanatory software-group record superseded by the two separately selectable area tool options."
                context["how_it_is_used"] = technique_record.get("rationale") if technique_record else node.get("resolution_rationale")
            if node["id"] == "area_enrichment_item:d078-a04-tools-quantitative-alternatives":
                context["what_it_is"] = "An explanatory comparison heading for four existing area tool options; learners select the workflow tool that fits their analysis."
                context["linked_canonical_item_ids"] = [
                    item["id"] for item in graph["nodes"]
                    if item.get("kind") == "area_tool_option" and item.get("area_id") == area_id
                    and item.get("label") in {"R", "Python", "SPSS", "Stata"}
                ]
                context["how_it_is_used"] = (node.get("requirement_scope") or {}).get("condition")
            if node["id"] == "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo":
                context["what_it_is"] = (node.get("requirement_scope") or {}).get("condition")
                context["how_it_is_used"] = "Choose an agent-based simulation framework only after specifying the social mechanism and model assumptions. The recorded options are distinct frameworks, not an assertion of equivalence."
            if kind == "area_learning_item":
                suffix = node["id"].rsplit(":", 1)[-1]
                expansion_ids = AREA_TASK_EXPANSIONS.get(suffix, [])
                invalid = [item_id for item_id in expansion_ids if item_id not in nodes]
                if invalid:
                    raise AssertionError(f"Noncanonical area task expansion target(s) for {node['id']}: {invalid}")
                context["area_task_family_id"] = node.get("task_family_id")
                family = task_families.get(node.get("task_family_id"), {})
                context["area_task_family_context"] = {
                    "label": family.get("label"),
                    "learner_output": family.get("learner_output", []),
                    "source_ids": family.get("authoritative_work_source_ids", []) + family.get("explanatory_source_ids", []),
                }
                context["explanatory_expansion_item_ids"] = expansion_ids
                area_task_expansion_count += bool(expansion_ids)
                context["explanatory_expansion_note"] = (
                    "These are existing canonical items for exploring this task-family heading. "
                    "The heading is explanatory and these mappings do not add relationship edges or requirements."
                )
                if not expansion_ids:
                    context["how_it_is_used"] = (
                        f"This is an area task-family heading for {node.get('label')}; "
                        "the current graph has no separately linked canonical learning item for this heading."
                    )
            if records:
                area_match_counts[kind] += 1
                context["area_context_records"] = [{
                    "name": record.get("name"),
                    "item_type": record.get("itemType"),
                    "plain_meaning": record.get("plainMeaning"),
                    "contextual_use": record.get("contextualUse"),
                    "expected_output": record.get("expectedOutput"),
                    "programme_context": record.get("programmeContext"),
                    "domain_context": record.get("domainContext"),
                    "area_context": record.get("areaContext"),
                    "use_case_key": record.get("useCaseKey"),
                    "prerequisites": record.get("prerequisites", []),
                    "relationships": record.get("relationships", []),
                    "source_references": record.get("sourceReferences", []),
                    "evidence_limitations": record.get("evidenceLimitations", []),
                } for record in records]
                if len(records) == 1:
                    record = records[0]
                    context["what_it_is"] = record.get("plainMeaning") or context["what_it_is"]
                    context["how_it_is_used"] = record.get("contextualUse") or context["how_it_is_used"]
                    context["expected_output"] = record.get("expectedOutput") or context["expected_output"]
                    context["source_references"] = record.get("sourceReferences", []) or context["source_references"]
                    context["limitations"] = record.get("evidenceLimitations", []) or context["limitations"]
            context["item_route_note"] = "Area-level use is bounded to the named area and route. Connected roles indicate possible downstream relevance, not a role requirement."

        elif kind == "role_item_candidate":
            source = role_source.get(node["id"], {})
            reconciliation = source.get("role_item_reconciliation", {})
            role_context_count += bool(reconciliation)
            context.update({
                "role_item_reconciliation": reconciliation,
                "what_it_is": reconciliation.get("plain_language_meaning") or context["what_it_is"],
                "how_it_is_used": reconciliation.get("role_application") or context["how_it_is_used"],
                "expected_output": reconciliation.get("task_output") or source.get("task_output") or context["expected_output"],
                "programme_context": reconciliation.get("programme_meaning"),
                "domain_context": reconciliation.get("domain_meaning"),
                "area_context": reconciliation.get("area_meaning"),
                "role_context": reconciliation.get("role_application"),
                "prerequisites": reconciliation.get("prerequisites", []),
                "complements": reconciliation.get("complements", []),
                "valid_alternatives": reconciliation.get("valid_alternatives", []),
                "evidence_limits": reconciliation.get("evidence_limits") or reconciliation.get("evidence_limitations"),
                "source_references": reconciliation.get("source_references") or reconciliation.get("evidence") or reconciliation.get("source_ids") or context["source_references"],
                "context_source": "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json role_item_reconciliation",
            })

        elif kind == "method_combination_design":
            members = unique_records([
                {"id": item_id, "label": nodes.get(item_id, {}).get("label", item_id), "component_role": "required"}
                for item_id in node.get("required_method_ids", [])
            ] + [
                {"id": item_id, "label": nodes.get(item_id, {}).get("label", item_id), "component_role": "selectable_component"}
                for item_id in node.get("selectable_component_method_ids", [])
            ])
            combo_record = next((row for row in graph["combination_designs"] if row["id"] == node["id"]), {})
            context = {
                "schema_version": "d078_combination_integration_v1",
                "what_it_is": node.get("label"),
                "how_it_is_used": node.get("how_used"),
                "expected_output": None,
                "design_id": node["id"],
                "design_label": node.get("label"),
                "design_type": node.get("design"),
                "integration_reason": node.get("why_combine"),
                "sequence_and_integration": node.get("how_used"),
                "selection_condition": node.get("condition"),
                "limits": node.get("limits"),
                "required_and_selectable_components": members,
                "source_references": node.get("source_refs", []),
                "downstream_route_ids": [route.get("area_id") for route in combo_record.get("area_routes", [])],
                "dependency_policy": "Represent only the component order and integration stated by this design. Do not infer computational dependencies between every cross-method pair.",
            }

        if not context.get("expected_output"):
            if kind == "method_combination_design":
                context["expected_output_status"] = "Design does not define one standalone output; use the deliverable implied by the selected study and its stated integration."
            else:
                context["expected_output_status"] = "Not separately specified in the source record; no learner output has been inferred."
        else:
            context["expected_output_status"] = "From the existing graph or source-backed area/role context."

        node["contextual_application"] = context
        node["context_source"] = "D078 graph and resolved source-backed context records; see contextual_application fields"
        if kind == "method_combination_design":
            node["integration_contract"] = context
        updated[node["id"]] = context

    # Expand the task-family headings using the already-contextualized canonical
    # items. Keep the mapping explanatory; it is not a typed relationship edge.
    for node in graph["nodes"]:
        if node.get("kind") != "area_learning_item":
            continue
        context = node["contextual_application"]
        expansion_ids = context.get("explanatory_expansion_item_ids", [])
        expansion_contexts = []
        for item_id in expansion_ids:
            target = nodes[item_id]
            target_context = updated.get(item_id, {})
            expansion_contexts.append({
                "id": item_id,
                "label": target.get("label", item_id),
                "what_it_is": target_context.get("what_it_is") or target.get("meaning") or target.get("plain_language_meaning") or target.get("what_it_is"),
                "how_it_is_used": target_context.get("how_it_is_used") or (target.get("requirement_scope") or {}).get("condition"),
                "expected_output": target_context.get("expected_output") or target.get("learner_output"),
                "source_references": target_context.get("source_references", []),
            })
        context["explanatory_expansion_context"] = expansion_contexts
        if expansion_contexts:
            context["how_it_is_used"] = " ".join(
                entry["how_it_is_used"] for entry in expansion_contexts if entry.get("how_it_is_used")
            ) or context.get("how_it_is_used")
            outputs = [entry["expected_output"] for entry in expansion_contexts if entry.get("expected_output")]
            context["expected_output"] = outputs or context.get("expected_output") or context.get("area_task_family_context", {}).get("learner_output")
        else:
            context["expected_output"] = context.get("area_task_family_context", {}).get("learner_output")
        updated[node["id"]] = context

    # Add a graph-level summary to make the context completeness auditable.
    for node_id, before in original.items():
        after = nodes[node_id]
        for field, value in before.items():
            if after.get(field) != value:
                raise AssertionError(f"Protected field changed on {node_id}: {field}")

    expected_new = set(technique_by_id)
    missing_new = sorted(item_id for item_id in expected_new if item_id not in updated)
    if missing_new:
        raise AssertionError(f"Technique ledger items missing contextual_application: {missing_new}")
    if len([node for node in graph["nodes"] if node.get("kind") == "role_item_candidate" and node["id"] in updated]) != 168:
        raise AssertionError("Expected all 168 role candidates to have contextual_application")
    if len([node for node in graph["nodes"] if node.get("kind") == "area_learning_item" and node["id"] in updated]) != 21:
        raise AssertionError("Expected all 21 area task-family summaries to have contextual_application")
    missing_method_context = sorted(item_id for item_id in graph["method_node_ids"] if item_id not in updated)
    if missing_method_context:
        raise AssertionError(f"Method-choice catalogue items missing contextual_application: {missing_method_context}")

    graph["context_enrichment_summary"] = {
        "audit_date": "2026-10-20",
        "schema_version": "d078_contextual_application_v1",
        "items_contextualized": len(updated),
        "new_method_technique_ledger_records": len(expected_new),
        "new_method_technique_records_contextualized": len(expected_new - set(missing_new)),
        "area_item_context_matches_by_kind": dict(area_match_counts),
        "area_task_family_summaries_contextualized": 21,
        "area_task_family_summaries_with_existing_item_expansions": area_task_expansion_count,
        "domain_method_and_knowledge_nodes_contextualized": domain_method_context_count,
        "emerging_candidate_items_contextualized": emerging_context_count,
        "emerging_candidate_source_references_attached": emerging_source_reference_count,
        "emerging_candidate_count_in_ledger": len(emerging_records),
        "alternative_route_endpoint_additions": alternative_route_additions,
        "route_repair_scope": "Only the source-backed pandas-to-Excel alternative was added to the quantitative and computational-social-research routes; no blanket alternative expansion was applied.",
        "resolved_visible_alternative_edges_reviewed": sum(
            1 for edge in graph["edges"]
            if edge.get("relationship") in {"alternative_to", "alternative_tool_option"}
            and edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True
        ),
        "role_item_contextualized": role_context_count,
        "combination_designs_with_integration_contract": sum(
            1 for node in graph["nodes"] if node.get("kind") == "method_combination_design" and "contextual_application" in node
        ),
        "typed_relationships_copied_from_resolved_visible_graph_edges_only": True,
        "ownership_requirement_approval_visibility_role_fit_or_edges_changed": False,
        "source_contract": "Context is attached from the existing graph, D078 guided content, the method-technique and relationship-resolution ledgers, the prior role reconciliation graph, and the D078 emerging-item evidence/source registry. Emerging candidate prose remains explanatory and hidden; the only route repair is the source-backed pandas-to-Excel alternative. Requirement dispositions, ownership, visibility, approval and role fit are unchanged.",
    }
    GRAPH_PATH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    LEDGER_PATH.write_text(json.dumps({
        "schema_version": "d078_item_context_enrichment_v1",
        "audit_date": "2026-10-20",
        "summary": graph["context_enrichment_summary"],
        "items": updated,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(graph["context_enrichment_summary"], ensure_ascii=False, indent=2))


class CounterLike(defaultdict):
    def __init__(self):
        super().__init__(int)


if __name__ == "__main__":
    main()
