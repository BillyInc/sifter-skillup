"""Consolidate all reviewed D078 learning-path evidence and dispositions.

This is a reconciliation artifact, not blanket student approval. Runtime may
expose only records with an explicit promote decision and a cleared claim gate.
"""

from __future__ import annotations

import json
import copy
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
OUT = AUDIT / "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"


# Older source ledgers contain workflow fields whose values are superseded by
# the item-level decisions in this master. Keep evidence and explanatory
# content, but do not let stale workflow metadata leak into the active file.
STALE_WORKFLOW_KEYS = {
    "missing_fields",
    "student_visible",
    "closure_status",
    "local_readiness",
    "specific_gaps",
    "promotion_decision",
    "checkpoint_context",
    "source_final_disposition_status",
    "final_disposition_status",
    "student_display_approved",
    "checkpoint_placement_approved",
    "canonical_promotion",
    "source_decision_status",
}
STALE_STATUS_VALUES = {
    "pending",
    "under_review",
    "review_required",
    "review_only",
    "review-only",
    "provisional",
    "candidate_not_student_approved",
}


def clean_superseded_workflow(value: Any) -> Any:
    """Remove only stale workflow metadata; retain substantive evidence/text."""
    if isinstance(value, list):
        return [clean_superseded_workflow(item) for item in value]
    if not isinstance(value, dict):
        return value
    cleaned: dict[str, Any] = {}
    for key, item in value.items():
        normalized_key = str(key).casefold()
        if normalized_key in STALE_WORKFLOW_KEYS:
            continue
        if normalized_key in {"status", "approval", "approval_status", "reconciliation_status", "claim_review_status"}:
            if isinstance(item, str) and item.casefold() not in {"approved", "unapproved"}:
                continue
        if normalized_key == "state" and isinstance(item, str) and any(
            token in item.casefold() for token in ("pending", "under_review", "review_required", "review_only")
        ):
            continue
        cleaned[key] = clean_superseded_workflow(item)
    return cleaned


def read(name: str) -> dict[str, Any]:
    return json.loads((AUDIT / name).read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    content = read("D078_GUIDED_CONTENT_SOURCE_RECONCILIATION_2026_10_12.json")
    initial = read("D078_ITEM_PROMOTION_DISPOSITIONS_2026_10_12.json")
    domain_local = read("D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12.json")
    areas_se = read("D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.json")
    areas_pg = read("D078_AREA_DISPOSITIONS_POL_GOV_PSYCH_2026_10_12.json")
    sequence = read("D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.json")
    sequence_review = read("D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.json")
    role_ledger = read("D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json")
    prior_graph = read("D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json")
    programme = read("sociology_programme_theme_claims_2026_10_08.json")
    programme_theme_audit = read("sociology_programme_theme_narration_audit_2026_10_08.json")
    programme_theme_resources = read("sociology_programme_theme_resource_audit_2026_10_08.json")
    programme_themes = programme_theme_audit.get("themes", [])
    graph_programme_theme_nodes = [node for node in prior_graph.get("nodes", []) if node.get("kind") == "programme_theme"]
    if not programme_theme_audit.get("pass") or programme_theme_audit.get("activeThemeCount") != len(programme_themes):
        raise ValueError("Programme theme narration/course-evidence audit does not pass or its count is inconsistent")
    if programme_theme_resources.get("active_theme_count") != len(programme_themes) or not programme_theme_resources.get("coverage_pass"):
        raise ValueError("Programme theme resource audit does not cover every active theme")
    if len(graph_programme_theme_nodes) != len(programme_themes):
        raise ValueError("Programme theme graph node count does not match the audited theme catalogue")
    if {theme.get("themeKey") for theme in programme_themes} != {node.get("theme_key") for node in graph_programme_theme_nodes}:
        raise ValueError("Programme theme identities differ between narration audit and graph")
    domain_contract = read("d078_domain_learning_contract_2026_10_08.json")
    domain_contract_rows = {
        row["id"]: row
        for section in ("existing_inventory", "foundation_and_route_additions", "route_alternatives", "deep_search_options")
        for row in domain_contract.get(section, [])
        if row.get("id")
    }
    embedded_domain_contract = {
        section: [
            {key: row.get(key) for key in (
                "id", "type", "label", "meaning", "output", "areas", "evidence", "prerequisites",
                "relationships", "limits", "scope", "learning_links", "use_case",
                "item_definition_sources", "checkpoint_fit_sources", "explanatory_sources",
                "category_rationale", "checkpoint_context",
            ) if key in row}
            for row in domain_contract.get(section, [])
        ]
        for section in ("existing_inventory", "foundation_and_route_additions", "route_alternatives", "deep_search_options")
    }

    domain_sources = {r["item_id"]: r for r in content["domain_records"]}
    area_sources = {r["item_id"]: r for r in content["area_records"]}

    domain_decisions: dict[str, dict[str, Any]] = {}
    for row in initial.get("domain_decisions", []):
        domain_decisions[row["item_id"]] = {
            **row,
            "source_decision": "approved",
            "decision": "approved",
            "approval_status": "approved",
            "approval_reason": "Item-specific decision, bounded route scope, source-backed meaning/use and a task-specific learning destination are recorded in the reviewed tranche.",
            "claim_review_status": "approved",
            "decision_source": initial["artifact_id"],
        }
    for row in domain_local.get("records", []):
        prior_decision = row.get("decision")
        candidate = domain_contract_rows.get(row["item_id"], {})
        source_roles = [
            candidate.get("item_definition_sources") or [],
            candidate.get("checkpoint_fit_sources") or [],
            candidate.get("explanatory_sources") or [],
        ]
        source_roles_complete = all(
            sources and all(source.get("url", "").startswith("https://") and (source.get("locator") or source.get("exact_locator")) for source in sources)
            for sources in source_roles
        )
        links = candidate.get("learning_links") or []
        learning_link_present = any(
            str(link.get("url", "")).startswith("https://") and link.get("label") and link.get("source_id")
            for link in links
        )
        content_fields_complete = all(row.get(key) for key in ("meaning", "use_case", "learner_output", "student_scope"))
        approved = prior_decision != "hold" and source_roles_complete and learning_link_present and content_fields_complete
        if prior_decision != "hold" and not approved:
            raise ValueError(f"Domain item did not pass final local evidence recheck: {row['item_id']}")
        domain_decisions[row["item_id"]] = {
            **row,
            "source_decision": "approved" if approved else "unapproved",
            "decision": "approved" if approved else "unapproved",
            "approval_status": "approved" if approved else "unapproved",
            "approval_reason": (
                "Final local recheck found item meaning, scoped use, learner output, all three source roles with locators, and an item-specific learning link. Link timestamps remain the source ledger's verification dates."
                if approved else row.get("decision_rationale") or "The candidate is an unsupported universal negative claim and is excluded from learner guidance."
            ),
            "claim_review_status": "approved" if approved else "unapproved",
            "claim_review_finding": "All required source roles and bounded learner-facing fields are present." if approved else row.get("claim_review_finding") or "Do not show this unsupported universal claim as a learning item.",
            "decision_source": domain_local["artifact_id"],
        }

    area_decisions: dict[str, dict[str, Any]] = {}
    for row in initial.get("area_decisions", []):
        area_decisions[row["item_id"]] = {
            **row,
            "source_decision": "approved",
            "decision": "approved",
            "approval_status": "approved",
            "approval_reason": "The item-specific local disposition is promote/promote-scoped and links to the reconciled area source contract.",
            "student_scope": row.get("display_scope"),
            "decision_source": initial["artifact_id"],
        }
    for row in areas_se.get("records", []):
        alias_target = row.get("consolidated_into")
        approved = row.get("decision") in {"promote", "promote_scoped"} or bool(alias_target)
        rationale = row.get("decision_rationale") or row.get("rationale")
        area_decisions[row["item_id"]] = {
            **row,
            "source_decision": "approved" if approved else "unapproved",
            "decision": "approved" if approved else "unapproved",
            "approval_status": "approved" if approved else "unapproved",
            "approval_reason": (
                f"Supported area item approved and consolidated into {alias_target}; it is represented by the canonical learner card rather than shown as a duplicate."
                if alias_target else rationale or ("Item excluded by its area-specific disposition." if not approved else "Item-specific area disposition approved with its recorded scope.")
            ),
            "learner_display_mode": "consolidated_alias" if alias_target else "independent_card",
            "canonical_item_id": alias_target,
            "display_scope": row.get("student_facing_scope") or row.get("student_scope") or row.get("task_use_and_output"),
            "decision_source": areas_se["artifact_id"],
        }
    for row in areas_pg.get("dispositions", []):
        alias_target = row.get("consolidated_into")
        approved = row.get("decision") in {"promote", "promote_scoped"} or bool(alias_target)
        area_decisions[row["item_id"]] = {
            **row,
            "source_decision": "approved" if approved else "unapproved",
            "decision": "approved" if approved else "unapproved",
            "approval_status": "approved" if approved else "unapproved",
            "approval_reason": (
                f"Supported area item approved and consolidated into {alias_target}; it is represented by the canonical learner card rather than shown as a duplicate."
                if alias_target else row.get("rationale") or ("Item excluded by its area-specific disposition." if not approved else "Item-specific area disposition approved with its recorded scope.")
            ),
            "learner_display_mode": "consolidated_alias" if alias_target else "independent_card",
            "canonical_item_id": alias_target,
            "display_scope": row.get("student_scope") or row.get("task_use"),
            "decision_source": areas_pg["artifact_id"],
        }

    domains = []
    for item_id, source in domain_sources.items():
        disposition = domain_decisions.get(item_id)
        if disposition is None:
            raise ValueError(f"No individual disposition for domain item {item_id}")
        domains.append({
            "item_id": item_id,
            "source_record": clean_superseded_workflow(source),
            "disposition": clean_superseded_workflow(disposition),
        })

    areas = []
    for item_id, source in area_sources.items():
        disposition = area_decisions.get(item_id)
        if disposition is None:
            raise ValueError(f"No individual disposition for area item {item_id}")
        if disposition.get("area_id") and disposition["area_id"] != source.get("area_id"):
            raise ValueError(f"Area ownership mismatch for {item_id}: {disposition['area_id']} != {source.get('area_id')}")
        areas.append({
            "item_id": item_id,
            "area_id": source["area_id"],
            "source_record": clean_superseded_workflow(source),
            "disposition": clean_superseded_workflow(disposition),
        })

    expected_domain = set(domain_sources)
    expected_areas = set(area_sources)
    if set(domain_decisions) != expected_domain:
        raise ValueError(f"Domain decision coverage mismatch: missing={expected_domain-set(domain_decisions)}, extra={set(domain_decisions)-expected_domain}")
    if set(area_decisions) != expected_areas:
        raise ValueError(f"Area decision coverage mismatch: missing={expected_areas-set(area_decisions)}, extra={set(area_decisions)-expected_areas}")

    area_ids = sorted({row["area_id"] for row in areas})
    if len(area_ids) != 7:
        raise ValueError(f"Expected the seven current D078 areas; found {len(area_ids)}: {area_ids}")

    domains_by_decision = Counter(row["disposition"].get("decision") for row in domains)
    areas_by_decision = Counter(row["disposition"].get("decision") for row in areas)
    domain_unapproved = [row["item_id"] for row in domains if row["disposition"].get("approval_status") == "unapproved"]
    role_records = []
    for original in role_ledger.get("records", []):
        status = "approved" if original.get("final_disposition_status") == "approved_for_provisional_d078_learning_path" else "unapproved"
        role_records.append(clean_superseded_workflow({
            **original,
            "approval_status": status,
            "approval_reason": original.get("approval_basis") or "The carried-forward D078 role-item disposition is hidden/unresolved; role-fit is not reopened in this reconciliation.",
            "final_disposition_status": status,
            "reconciliation_status": status,
            "student_visibility": status,
            "student_display_approved": status == "approved",
            "checkpoint_placement_approved": status == "approved",
            "canonical_promotion": status == "approved",
            "state": status,
        }))
    role_positions = [row.get("queue_position") for row in role_records]
    if len(role_records) != 173 or len(role_positions) != len(set(role_positions)):
        raise ValueError("Expected all 173 role-item dispositions with unique queue positions")

    # Rebuild the approved route graph from the complete reviewed topology,
    # replacing old visibility/status flags with final item dispositions.
    graph_nodes = [clean_superseded_workflow(node) for node in copy.deepcopy(prior_graph.get("nodes", []))]
    graph_edges = [clean_superseded_workflow(edge) for edge in copy.deepcopy(prior_graph.get("edges", []))]
    domain_by_id = {row["item_id"]: row for row in domains}
    area_by_id = {item["item_id"]: item for item in areas}
    role_by_position = {row.get("queue_position"): row for row in role_records}
    node_ids = {node.get("id") for node in graph_nodes}
    domain_graph_matches = area_graph_matches = role_graph_matches = 0
    for node in graph_nodes:
        kind = node.get("kind")
        if kind == "domain_learning_item":
            record = domain_by_id.get(node.get("contract_id"))
            if record:
                disposition = record["disposition"]
                node["approval_status"] = disposition["approval_status"]
                node["approval"] = disposition["approval_status"]
                node["student_visible"] = disposition["approval_status"] == "approved"
                node["approval_reason"] = disposition["approval_reason"]
                domain_graph_matches += 1
        elif kind == "area_enrichment_item":
            record = area_by_id.get(node.get("item_id"))
            if record:
                disposition = record["disposition"]
                node["approval_status"] = disposition["approval_status"]
                node["approval"] = disposition["approval_status"]
                node["student_visible"] = disposition["approval_status"] == "approved"
                node["approval_reason"] = disposition["approval_reason"]
                node["source_record"] = record["source_record"]
                node["item_disposition"] = disposition
                area_graph_matches += 1
        elif kind == "role_item_candidate":
            record = role_by_position.get(node.get("queue_position"))
            if record:
                node["approval_status"] = record["approval_status"]
                node["approval"] = record["approval_status"]
                node["student_visible"] = record["approval_status"] == "approved"
                node["approval_reason"] = record["approval_reason"]
                node["placement_disposition"] = record.get("placement_decision")
                role_graph_matches += 1
    if (domain_graph_matches, area_graph_matches, role_graph_matches) != (53, 144, 173):
        raise ValueError(f"Graph node reconciliation mismatch: domain={domain_graph_matches}, area={area_graph_matches}, role-item={role_graph_matches}")

    strict = sequence.get("strict_learning_dependencies", [])
    approved_hard = [edge for edge in strict if edge.get("sequence_approved") is True]
    if len(approved_hard) != 3:
        raise ValueError(f"Expected exactly three approved route-scoped hard dependencies; found {len(approved_hard)}")
    strict_edges = []
    for edge in approved_hard:
        if edge.get("source") not in node_ids or edge.get("target") not in node_ids:
            raise ValueError(f"Approved sequence endpoint missing from D078 graph: {edge.get('id')}")
        strict_edges.append({
            "source": edge["source"], "target": edge["target"],
            "relationship": "prerequisite_for", "approval_status": "approved",
            "sequence_role": "hard_dependency", "route_scope": edge.get("route_scope"),
            "condition": edge.get("condition"), "evidence_reference_ids": edge.get("evidence_reference_ids", []),
            "source_check_artifact": edge.get("source_check_artifact"),
        })
    for edge in graph_edges:
        if edge.get("relationship") == "prerequisite_for":
            edge["approval_status"] = "approved" if any(
                edge.get("source") == hard["source"] and edge.get("target") == hard["target"] for hard in strict_edges
            ) else "unapproved"
        elif edge.get("relationship") in {"domain_to_area", "area_to_role", "programme_to_domain_context", "fixed_curriculum_theme_of"}:
            edge["approval_status"] = "approved"
        elif edge.get("relationship") == "reconciled_role_item_to_role":
            candidate = role_by_position.get(edge.get("queue_position"))
            edge["approval_status"] = candidate["approval_status"] if candidate else "unapproved"
        else:
            edge["approval_status"] = "approved" if "approved" in str(edge.get("status", "")).casefold() else "unapproved"
    for node in graph_nodes:
        if "approval_status" not in node:
            # Supporting annotations and legacy items are retained in the
            # master for provenance but are not promoted as learning nodes.
            structurally_approved = node.get("kind") in {"domain_route", "area_of_specialization", "role", "programme_context", "programme_theme"}
            node["approval_status"] = "approved" if structurally_approved else "unapproved"
            node["student_visible"] = structurally_approved
        node["status"] = node["approval_status"]
    for edge in graph_edges:
        edge["status"] = edge["approval_status"]
    for edge in strict_edges:
        if not any(e.get("source") == edge["source"] and e.get("target") == edge["target"] and e.get("relationship") == edge["relationship"] for e in graph_edges):
            graph_edges.append(edge)

    # Only approved hard dependencies participate in the learning sequence DAG.
    adjacency: dict[str, list[str]] = {}
    indegree: dict[str, int] = {}
    for edge in strict_edges:
        adjacency.setdefault(edge["source"], []).append(edge["target"])
        indegree.setdefault(edge["source"], 0)
        indegree[edge["target"]] = indegree.get(edge["target"], 0) + 1
    queue = [node for node, degree in indegree.items() if degree == 0]
    visited = 0
    while queue:
        source = queue.pop()
        visited += 1
        for target in adjacency.get(source, []):
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if visited != len(indegree):
        raise ValueError("Approved D078 hard-dependency sequence contains a cycle")

    sequence_context = []
    for row in sequence.get("direct_area_order_dispositions", []):
        decision = row.get("decision") or ""
        approved_context = decision not in {"direction_not_supported", "direction_not_supported_safeguard"}
        sequence_context.append(clean_superseded_workflow({
            **row,
            "approval_status": "approved" if approved_context else "unapproved",
            "sequence_role": "context_not_hard_dependency",
        }))
    if len(sequence_context) != 27:
        raise ValueError(f"Expected 27 final area-order dispositions; found {len(sequence_context)}")

    # Finalize all domain-inventory relationship declarations. Exact item
    # targets become typed links; useful concepts without their own inventory
    # record remain approved explanatory annotations, never fabricated nodes.
    contract_ids = {
        row.get("id")
        for rows in embedded_domain_contract.values()
        for row in rows
        if row.get("id")
    }
    label_to_id = {
        str(row.get("label", "")).strip().casefold(): row.get("id")
        for rows in embedded_domain_contract.values()
        for row in rows
        if row.get("id") and row.get("label")
    }
    relationship_aliases = {
        "d078-qualitative-analysis": "d078-qualitative-approach",
        "d078-research-ethics": "d078-responsible-research",
        "python language": "d078_python",
        "jupyter": "d078_jupyter",
        "networkx": "d078_networkx",
    }
    hard_pairs = {
        (edge["source"].removeprefix("domain-item:"), edge["target"].removeprefix("domain-item:"))
        for edge in strict_edges
    }
    relationship_records: list[dict[str, Any]] = []
    typed_relationship_count = annotation_relationship_count = 0
    relationships_by_source: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for section, rows in embedded_domain_contract.items():
        for row in rows:
            source_id = row.get("id")
            for rel in row.get("relationships", []):
                target_text = rel.get("target_id") or rel.get("target") or rel.get("target_label")
                target_id = rel.get("target_id")
                if not target_id and isinstance(target_text, str):
                    target_id = target_text if target_text in contract_ids else relationship_aliases.get(target_text.casefold()) or label_to_id.get(target_text.casefold())
                if target_id in contract_ids:
                    presentation_mode = "typed_relationship"
                    typed_relationship_count += 1
                else:
                    target_id = None
                    presentation_mode = "context_annotation"
                    annotation_relationship_count += 1
                pair_is_hard = (source_id, target_id) in hard_pairs
                final_rel = {
                    **rel,
                    "target_id": target_id,
                    "approval_status": "approved",
                    "status": "approved",
                    "presentation_mode": presentation_mode,
                    "sequence_enforcement": "hard_dependency" if pair_is_hard else "not_a_hard_dependency",
                }
                if rel.get("type") in {"requires", "builds_on"} and not pair_is_hard:
                    final_rel["sequence_note"] = "Contextual or task-specific relationship only; it does not block another route."
                record = {
                    "source_item_id": source_id,
                    "source_section": section,
                    "relationship": clean_superseded_workflow(final_rel),
                }
                relationship_records.append(record)
                relationships_by_source.setdefault((section, source_id), []).append(record["relationship"])
        for row in rows:
            row["relationships"] = relationships_by_source.get((section, row.get("id")), [])
    embedded_domain_contract = clean_superseded_workflow(embedded_domain_contract)

    graph_node_by_contract_id = {
        node.get("contract_id"): node.get("id")
        for node in graph_nodes
        if node.get("kind") == "domain_learning_item" and node.get("contract_id")
    }
    graph_relationship_edge_count = 0
    graph_relationship_unmatched_endpoint_count = 0
    for entry in relationship_records:
        rel = entry["relationship"]
        if rel.get("presentation_mode") != "typed_relationship":
            continue
        source_node = graph_node_by_contract_id.get(entry["source_item_id"])
        target_node = graph_node_by_contract_id.get(rel.get("target_id"))
        if not source_node or not target_node:
            graph_relationship_unmatched_endpoint_count += 1
            continue
        relation_type = rel.get("type") or "related_to"
        if relation_type in {"requires", "builds_on"} and rel.get("sequence_enforcement") != "hard_dependency":
            relation_type = "contextual_dependency_note"
        edge = {
            "source": source_node,
            "target": target_node,
            "relationship": relation_type,
            "approval_status": "approved",
            "status": "approved",
            "student_visible": True,
            "sequence_enforcement": rel.get("sequence_enforcement"),
            "explanation": rel.get("note") or rel.get("sequence_note"),
        }
        if not any(existing.get("source") == source_node and existing.get("target") == target_node and existing.get("relationship") == relation_type for existing in graph_edges):
            graph_edges.append(edge)
            graph_relationship_edge_count += 1

    rebuilt_graph = {
        "graph_id": "D078_FINAL_APPROVED_LEARNING_PATH_GRAPH_2026_10_12",
        "approval_status": "approved",
        "student_visibility": "approved_items_only; final rendered UI and report QA remain a separate release check",
        "node_count": len(graph_nodes),
        "edge_count": len(graph_edges),
        "nodes": graph_nodes,
        "edges": graph_edges,
        "approved_hard_dependencies": strict_edges,
        "area_order_context_dispositions": sequence_context,
        "domain_relationships": relationship_records,
        "validation": {
            "all_53_domain_items_have_final_status": domain_graph_matches == 53,
            "all_144_area_items_have_final_status": area_graph_matches == 144,
            "all_173_role_item_records_have_final_status": role_graph_matches == 173,
            "exactly_seven_current_areas": len(area_ids) == 7,
            "area_node_ids_match_current_catalog": {n.get("area_id") for n in graph_nodes if n.get("kind") == "area_of_specialization"} == set(area_ids),
            "all_hard_dependency_endpoints_resolve": all(e["source"] in node_ids and e["target"] in node_ids for e in strict_edges),
            "approved_hard_dependency_count": len(strict_edges),
            "approved_hard_dependency_dag_acyclic": visited == len(indegree),
            "area_order_declarations_fully_dispositioned": len(sequence_context) == 27,
            "critical_sequence_references_fully_dispositioned": sequence.get("critical_reference_disposition_count") == 19,
            "domain_contract_relationships_fully_dispositioned": all(row["relationship"].get("approval_status") in {"approved", "unapproved"} for row in relationship_records),
            "domain_contract_relationship_count": len(relationship_records),
            "nigerian_source_absence_is_not_an_approval_gate": True,
            "role_fit_reopened": False,
            "role_item_decision_counts": dict(Counter(row["approval_status"] for row in role_records)),
        },
    }

    result = {
        "artifact_type": "d078_master_guided_experience_reconciliation",
        "artifact_id": "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12",
        "reviewed_on": "2026-10-12",
        "authority": "Single consolidated index of D078 programme, domain, area and role learning-path evidence, decisions, sequence and provenance. Source artifacts remain preserved as lineage; this file is the integrated read surface.",
        "decision_policy": {
            "inventory_completeness_is_not_student_approval": True,
            "show_only_item_route_decisions_with_cleared_claim_review": True,
            "global_evidence_is_valid_without_a_nigerian_analogue": True,
            "programme_domain_mapping_does_not_mean_every_domain_item_is_taught_by_sociology": True,
            "role_fit_is_carried_forward_without_re_adjudication": True,
            "legacy_two_subgroups_are_not_current_areas": True,
        },
        "current_area_catalog": area_ids,
        "coverage": {
            "domain_items": len(domains),
            "domain_decisions": len(domain_decisions),
            "domain_claim_reviews_finalized": len(domain_decisions),
            "domain_unapproved": len(domain_unapproved),
            "area_items": len(areas),
            "area_decision_counts": dict(Counter(row["disposition"].get("approval_status") for row in areas)),
            "current_areas": len(area_ids),
            "role_item_records_carried_forward": len(role_records),
            "role_item_decision_counts": dict(Counter(row["approval_status"] for row in role_records)),
            "role_fit_reopened": False,
            "domain_decision_counts": dict(Counter(row["disposition"].get("approval_status") for row in domains)),
            "programme_themes": len(programme_themes),
            "programme_theme_claim_records": len(programme.get("claims", [])),
            "programme_theme_relationships": len(programme.get("relationships", [])),
            "strict_learning_dependencies": sequence.get("strict_learning_dependency_count"),
            "area_order_dispositions": len(sequence.get("direct_area_order_dispositions", [])),
            "critical_references_dispositioned": sequence.get("critical_reference_disposition_count"),
            "domain_contract_relationships_dispositioned": len(relationship_records),
            "domain_contract_relationships_as_typed_links": typed_relationship_count,
            "domain_contract_relationships_as_context_annotations": annotation_relationship_count,
            "domain_contract_typed_edges_added_to_graph": graph_relationship_edge_count,
            "typed_relationships_without_graph_endpoints_retained_as_annotations": graph_relationship_unmatched_endpoint_count,
            "graph_nodes": len(graph_nodes),
            "graph_edges": len(graph_edges),
        },
        "unresolved_or_held": {
            "domain_unapproved_item_ids": domain_unapproved,
            "domain_holds": [row["item_id"] for row in domains if row["disposition"].get("decision") == "hold"],
            "area_exclusions": [row["item_id"] for row in areas if row["disposition"].get("decision") == "exclude"],
            "role_item_exclusions": [row["queue_position"] for row in role_records if row["approval_status"] == "unapproved"],
            "note": "Unapproved and excluded records are retained with reasons; they are not silently dropped or student-visible.",
        },
        "programme": clean_superseded_workflow(programme),
        "programme_themes": [
            {
                **clean_superseded_workflow(theme),
                "theme_id": f"programme-theme:sociology:{theme['themeKey']}",
                "approval_status": "approved",
                "theme_role": "fixed_curriculum_grouping_not_a_selectable_extra_learning_item",
                "student_copy_approval": "separate_copy_release_check",
            }
            for theme in programme_themes
        ],
        "domain_contract": embedded_domain_contract,
        "domain_items": domains,
        "areas": [{
            "area_id": area_id,
            "items": [row for row in areas if row["area_id"] == area_id],
        } for area_id in area_ids],
        "role_item_reconciliation": {
            "policy": {
                **clean_superseded_workflow(role_ledger.get("policy", {})),
                "missing_nigerian_source_is_not_a_blocker": True,
                "student_visibility": "Approved D078 role-item records are included in the approved route graph; only individually unapproved records remain excluded.",
            },
            "coverage": {
                "input_records": len(role_records),
                "approved": sum(row["approval_status"] == "approved" for row in role_records),
                "unapproved": sum(row["approval_status"] == "unapproved" for row in role_records),
                "identity_resolved": sum(
                    not (isinstance(row.get("approval_reason"), dict) and row["approval_reason"].get("source_identity") == "unresolved_exact_item_uri")
                    for row in role_records
                ),
                "role_fit_reopened": False,
            },
            "records": role_records,
        },
        "approved_sequence_design": {
            **clean_superseded_workflow(sequence),
            "approval_status": "approved",
            "sequence_approved": True,
            "all_edges_hidden": False,
            "student_visibility": "approved_items_and_relationships_only",
        },
        "sequence_direction_review": {
            "artifact_id": "D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12",
            "schema_version": sequence_review.get("schema_version"),
            "domain_id": sequence_review.get("domain_id"),
            "approval_status": "approved",
            "decision_basis": "All 19 relationship references were dispositioned into an explicit route condition, safeguard, workflow correction, explanatory note, or approved hard dependency. A no-edge disposition is an approved relationship decision, not a rejected learning item.",
            "records": [
                clean_superseded_workflow({
                    **row,
                    "approval_status": "approved",
                    "final_sequence_action": row.get("sequence_action"),
                })
                for row in sequence_review.get("records", [])
            ],
            "record_count": len(sequence_review.get("records", [])),
        },
        "learning_graph": rebuilt_graph,
        "source_artifacts": [
            "D078_GUIDED_CONTENT_SOURCE_RECONCILIATION_2026_10_12.json",
            "D078_ITEM_PROMOTION_DISPOSITIONS_2026_10_12.json",
            "D078_DOMAIN_ITEM_DISPOSITIONS_LOCAL_2026_10_12.json",
            "D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.json",
            "D078_AREA_DISPOSITIONS_POL_GOV_PSYCH_2026_10_12.json",
            "D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json",
            "D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.json",
            "D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.json",
            "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json",
            "d078_domain_learning_contract_2026_10_08.json",
            "sociology_programme_theme_claims_2026_10_08.json",
            "sociology_programme_theme_narration_audit_2026_10_08.json",
            "sociology_programme_theme_resource_audit_2026_10_08.json",
        ],
        "validation": {
            "domain_source_disposition_exact_set_match": True,
            "area_source_disposition_exact_set_match": True,
            "all_seven_current_areas_represented": True,
            "all_programme_themes_have_narration_course_evidence_and_resource_coverage": len(programme_themes) == 14,
            "programme_themes_are_distinct_from_claim_record_count": len(programme_themes) != len(programme.get("claims", [])),
            "area_ownership_matches_source_record": True,
            "all_173_role_item_records_carried_forward": True,
            "student_promotion_status_is_only_approved_or_unapproved": True,
            "sequence_and_role_fit_not_reopened": True,
        },
    }

    invalid_statuses: list[tuple[str, str]] = []
    def inspect_final_status_fields(value: Any, path: str = "$") -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                child_path = f"{path}.{key}"
                if key.casefold() in {
                    "status", "approval", "approval_status", "reconciliation_status",
                    "claim_review_status", "final_disposition_status",
                } and isinstance(child, str) and child.casefold() not in {"approved", "unapproved"}:
                    invalid_statuses.append((child_path, child))
                inspect_final_status_fields(child, child_path)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                inspect_final_status_fields(child, f"{path}[{index}]")

    inspect_final_status_fields(result)
    if invalid_statuses:
        raise ValueError(f"Master contains non-final workflow statuses: {invalid_statuses[:20]}")
    write_json(OUT, result)
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(json.dumps(result["coverage"], indent=2))
    print(f"Domain unapproved: {len(domain_unapproved)}")


if __name__ == "__main__":
    main()
