"""Build the typed D078 programme-to-role learning-path design graph.

This is deliberately separate from the role-item disposition graph.  The
role-item graph answers which repaired downstream candidates can participate
in route design. This graph carries typed domain-contract records, independent
area task sets and the local emerging-domain candidates so task workflows and
their evidence remain traceable in learning-path design.

It is a local design artifact only: no canonical data, student visibility or
SQL promotion is changed here.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
PLACEMENT = ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
DOMAIN_CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
AREA_TASKS = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json"
DOMAIN_EMERGING = ROOT / "data/career-mapping/_audit/D078_DOMAIN_EMERGING_TASK_ENRICHMENT_2026_10_10.json"
DOMAIN_AREA_CROSSWALK = ROOT / "data/career-mapping/_audit/D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json"
REPORT = ROOT / "docs/manual-review/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.md"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:120]


def norm(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def concept_node(nodes: dict[str, dict[str, Any]], text: str, kind: str, source: str) -> str:
    node_id = f"concept:{kind}:{slug(text)}"
    nodes.setdefault(node_id, {
        "id": node_id,
        "kind": kind,
        "label": text,
        "source_ledger": source,
        "student_visible": False,
    })
    return node_id


def prerequisite_cycle_check(edges: list[dict[str, Any]]) -> dict[str, Any]:
    graph: dict[str, set[str]] = defaultdict(set)
    indegree: Counter[str] = Counter()
    nodes: set[str] = set()
    for edge in edges:
        if edge["relationship"] != "prerequisite_for":
            continue
        source, target = edge["source"], edge["target"]
        nodes.update((source, target))
        if target not in graph[source]:
            graph[source].add(target)
            indegree[target] += 1
            indegree.setdefault(source, 0)
    queue = deque(node for node in nodes if indegree[node] == 0)
    visited = 0
    while queue:
        node = queue.popleft()
        visited += 1
        for target in graph[node]:
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    return {"prerequisite_nodes": len(nodes), "acyclic": visited == len(nodes), "visited": visited}


def contract_rows(contract: dict[str, Any]) -> list[dict[str, Any]]:
    raw_rows = [
        *contract.get("existing_inventory", []),
        *contract.get("foundation_and_route_additions", []),
        *contract.get("route_alternatives", []),
        *contract.get("deep_search_options", []),
    ]
    alias_rows = {
        str(row.get("id")): row
        for row in contract.get("deep_search_options", [])
        if row.get("duplicate_of_existing_id")
        and row.get("graph_record_policy") == "retain_lineage_as_alias; do_not_emit_duplicate_item_node"
    }
    canonical_rows = {
        str(row.get("id")): row
        for row in raw_rows
        if str(row.get("id")) not in alias_rows
    }
    aliases_by_canonical: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for alias_id, alias in alias_rows.items():
        canonical_id = str(alias.get("duplicate_of_existing_id"))
        if canonical_id not in canonical_rows:
            raise ValueError(f"D078 domain alias {alias_id!r} has missing canonical target {canonical_id!r}")
        aliases_by_canonical[canonical_id].append(alias)

    rows: list[dict[str, Any]] = []
    for row in raw_rows:
        record_id = str(row.get("id"))
        if record_id in alias_rows:
            continue
        merged = dict(row)
        aliases = aliases_by_canonical.get(record_id, [])
        if aliases:
            # Keep the research record for audit, but fold its route-relevant
            # links into the canonical item instead of emitting a duplicate card.
            merged["lineage_alias_records"] = aliases
            for field in ("areas", "prerequisites", "relationships"):
                combined = list(merged.get(field) or [])
                for alias in aliases:
                    for value in alias.get(field) or []:
                        if value not in combined:
                            combined.append(value)
                merged[field] = combined
        rows.append(merged)
    return rows


def main() -> None:
    placement = json.loads(PLACEMENT.read_text(encoding="utf-8"))
    contract = json.loads(DOMAIN_CONTRACT.read_text(encoding="utf-8-sig"))
    area_package = json.loads(AREA_TASKS.read_text(encoding="utf-8-sig"))
    emerging_package = json.loads(DOMAIN_EMERGING.read_text(encoding="utf-8-sig"))
    domain_area_crosswalk = json.loads(DOMAIN_AREA_CROSSWALK.read_text(encoding="utf-8-sig"))
    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, Any]] = []

    placement_records = placement.get("role_item_reconciliation", {}).get("records") or []
    if len(placement_records) != 173:
        raise ValueError(f"Expected 173 role-item records from the consolidated master; got {len(placement_records)}")
    approved_role_records = [record for record in placement_records if record.get("approval_status") == "approved"]
    for record in approved_role_records:
        position = record["queue_position"]
        item_id = f"role-item:{position}:{slug(record.get('pair_key') or record.get('label') or str(position))}"
        nodes[item_id] = {
            "id": item_id,
            "kind": "role_item_candidate",
            "item_type": "role_downstream_learning_item",
            "queue_position": position,
            "label": record.get("label") or record.get("pair_key"),
            "layer": record.get("final_layer"),
            "placement_decision": record.get("placement_decision"),
            "student_visible": False,
            "approval": "provisional_design_approved",
            "source_ledger": "role_item_final_disposition",
            "programme_scope": (record.get("approval_reason") or {}).get("programme_domain_backstop"),
            "nigerian_scope": (record.get("approval_reason") or {}).get("nigerian_scope"),
        }
        for prerequisite in record.get("prerequisites", []):
            target = concept_node(nodes, prerequisite, "prerequisite", "role_item_final_disposition")
            edges.append({"source": target, "target": item_id, "relationship": "prerequisite_for", "status": "provisional_design_review"})
        for complement in record.get("complements", []):
            target = concept_node(nodes, complement, "complement", "role_item_final_disposition")
            edges.append({"source": item_id, "target": target, "relationship": "works_with", "status": "provisional_design_review"})
        for alternative in record.get("valid_alternatives", []):
            target = concept_node(nodes, alternative, "alternative", "role_item_final_disposition")
            edges.append({"source": item_id, "target": target, "relationship": "alternative_to", "status": "provisional_design_review"})

    rows = contract_rows(contract)
    domain_by_key: dict[str, str] = {}
    for row in rows:
        item_id = f"domain-item:{slug(str(row.get('id') or row.get('label') or 'unnamed'))}"
        label = row.get("label") or row.get("id") or "Unnamed domain item"
        category_rationale = row.get("category_rationale") or {}
        category_source = "source_disposition"
        if not row.get("disposition") and category_rationale.get("category"):
            category_source = "category_rationale"
        elif not row.get("disposition"):
            category_source = "source_layer_fallback"
        category = (
            row.get("disposition")
            or category_rationale.get("category")
            or row.get("layer")
        )
        nodes[item_id] = {
            "id": item_id,
            "kind": "domain_learning_item",
            "item_type": row.get("type"),
            "label": label,
            "contract_id": row.get("id"),
            "category": category,
            "category_source": category_source,
            "layer": "domain_or_route_candidate",
            "meaning": row.get("meaning"),
            "learner_output": row.get("output"),
            "prerequisites": row.get("prerequisites", []),
            "relationships": row.get("relationships", []),
            "limitations": row.get("limits", []),
            "scope": row.get("scope"),
            "learning_links": row.get("learning_links", []),
            "evidence": row.get("evidence", []),
            "category_rationale": category_rationale,
            "checkpoint_context": row.get("checkpoint_context"),
            "claim_state": row.get("claim_state"),
            "student_visible": False,
            "approval": "domain_contract_candidate_not_student_approved",
            "claim_evidence_status": row.get("claim_evidence_status"),
            "research_disposition": row.get("research_disposition"),
            "student_display_status": row.get("student_display_status"),
            "areas": row.get("areas", []),
            "lineage_alias_ids": [a.get("id") for a in row.get("lineage_alias_records", [])],
            "lineage_alias_records": row.get("lineage_alias_records", []),
            "source_ledger": "d078_domain_learning_contract",
        }
        domain_by_key[norm(row.get("id"))] = item_id
        domain_by_key[norm(label)] = item_id
        for alias in row.get("lineage_alias_records", []):
            domain_by_key[norm(alias.get("id"))] = item_id
            if alias.get("label"):
                domain_by_key[norm(alias.get("label"))] = item_id

    for row in rows:
        item_id = domain_by_key[norm(row.get("id") or row.get("label"))]
        for prerequisite in row.get("prerequisites", []):
            target = domain_by_key.get(norm(prerequisite)) or concept_node(nodes, prerequisite, "prerequisite", "d078_domain_learning_contract")
            edges.append({"source": target, "target": item_id, "relationship": "prerequisite_for", "status": "contract_relationship_review"})
        for relation in row.get("relationships", []):
            relation_type = str(relation.get("type") or relation.get("relationship_type") or "").lower()
            target_text = relation.get("target") or relation.get("to") or relation.get("target_id")
            if not target_text:
                continue
            target = domain_by_key.get(norm(target_text)) or concept_node(nodes, str(target_text), "relationship_target", "d078_domain_learning_contract")
            target_type = relation.get("target_type")
            target_definition = relation.get("target_definition")
            if target_type:
                nodes[target]["concept_type"] = target_type
            if target_definition:
                nodes[target]["plain_language_definition"] = target_definition
            if "alternative" in relation_type:
                edge_type = "alternative_to"
            elif "build" in relation_type or "require" in relation_type or "prereq" in relation_type:
                edge_type = "prerequisite_for"
                edge_source, edge_target = target, item_id
            else:
                edge_type = "works_with"
                edge_source, edge_target = item_id, target
            if edge_type == "alternative_to":
                edge_source, edge_target = item_id, target
            edges.append({
                "source": edge_source,
                "target": edge_target,
                "relationship": edge_type,
                "semantic_relationship_type": relation_type,
                "status": relation.get("status") or "contract_relationship_review",
                "explanation": relation.get("note"),
                "student_visible": False,
            })
        for area in row.get("areas", []):
            target = concept_node(nodes, str(area), "area_context", "d078_domain_learning_contract")
            edges.append({"source": item_id, "target": target, "relationship": "candidate_area_context", "status": "contract_context_review"})

    # Carry local domain emerging-task candidates into the graph without
    # treating them as approved or student-visible. Their explicit item-level
    # relationship declarations remain review edges only.
    emerging_source_registry = {
        str(source.get("source_id")): source
        for source in emerging_package.get("source_registry", [])
        if source.get("source_id")
    }
    emerging_node_by_id = {
        str(record.get("id")): f"domain-emerging:{slug(str(record.get('id') or record.get('label') or 'unnamed-emerging-item'))}"
        for record in emerging_package.get("candidate_items", [])
    }
    emerging_node_by_label = {
        norm(record.get("label")): emerging_node_by_id[str(record.get("id"))]
        for record in emerging_package.get("candidate_items", [])
        if record.get("id") and record.get("label")
    }
    for record in emerging_package.get("candidate_items", []):
        candidate_id = str(record.get("id") or record.get("label") or "unnamed-emerging-item")
        item_node = f"domain-emerging:{slug(candidate_id)}"
        nodes[item_node] = {
            "id": item_node,
            "kind": "domain_emerging_learning_item",
            "item_type": record.get("type"),
            "label": record.get("label") or candidate_id,
            "maturity": record.get("maturity"),
            "disposition": record.get("disposition"),
            "claim_state": record.get("claim_state"),
            "what_it_is": record.get("what_it_is"),
            "what_it_does_for_the_task": record.get("what_it_does_for_the_task"),
            "d078_context": record.get("d078_context"),
            "area_route_note": record.get("area_route_note"),
            "task_family": record.get("task_family"),
            "role_routes": record.get("role_routes"),
            "learner_output": record.get("learner_output"),
            "prerequisites": record.get("prerequisites", []),
            "relationships": record.get("relationships", {}),
            "typed_relationships": record.get("typed_relationships", []),
            "limitations": record.get("limitations", []),
            "learning_link_fit_note": record.get("learning_link_fit_note"),
            "practice_brief": record.get("practice_brief"),
            "review_gaps": record.get("review_gaps", []),
            "evidence_source_ids": record.get("evidence_source_ids", []),
            "explanatory_source_ids": record.get("explanatory_source_ids", []),
            "learning_resource_ids": record.get("learning_resource_ids", []),
            "evidence_sources": [
                emerging_source_registry[source_id]
                for source_id in record.get("evidence_source_ids", [])
                if source_id in emerging_source_registry
            ],
            "explanatory_sources": [
                emerging_source_registry[source_id]
                for source_id in record.get("explanatory_source_ids", [])
                if source_id in emerging_source_registry
            ],
            "learning_resources": [
                emerging_source_registry[source_id]
                for source_id in record.get("learning_resource_ids", [])
                if source_id in emerging_source_registry
            ],
            "candidate_category": record.get("type"),
            "area_route_labels": as_list(record.get("area_routes")),
            "student_visible": False,
            "approval": "emerging_domain_candidate_not_student_approved",
            "source_ledger": "d078_domain_emerging_task_enrichment",
        }
        # Area labels are connected to the authoritative seven area nodes
        # after those nodes are built below, avoiding duplicate text-only area
        # concepts that look like real routes but do not resolve to an area.
        relationships = record.get("relationships", {})
        for relation_key in ("builds_on", "extends"):
            for reference in as_list(relationships.get(relation_key)):
                target = domain_by_key.get(norm(reference))
                if target:
                    edges.append({"source": target, "target": item_node, "relationship": "prerequisite_for", "status": "emerging_candidate_relationship_review"})
        for relation_key in ("works_with", "complements"):
            for reference in as_list(relationships.get(relation_key)):
                target = domain_by_key.get(norm(reference)) or concept_node(nodes, str(reference), "emerging_complement", "d078_domain_emerging_task_enrichment")
                edges.append({"source": item_node, "target": target, "relationship": "works_with", "status": "emerging_candidate_relationship_review"})
        for reference in as_list(relationships.get("alternatives")):
            target = domain_by_key.get(norm(reference)) or concept_node(nodes, str(reference), "emerging_alternative", "d078_domain_emerging_task_enrichment")
            edges.append({"source": item_node, "target": target, "relationship": "alternative_to", "status": "emerging_candidate_relationship_review"})
        for relation in as_list(record.get("typed_relationships")):
            target_id = str(relation.get("target_id") or "")
            target_label = str(relation.get("target_label") or target_id)
            target = (
                domain_by_key.get(norm(target_id))
                or emerging_node_by_id.get(target_id)
                or emerging_node_by_label.get(norm(target_label))
            )
            if not target:
                target = concept_node(nodes, target_label, "emerging_relationship_target", "d078_domain_emerging_task_enrichment")
                nodes[target]["concept_type"] = relation.get("target_type")
                nodes[target]["plain_language_definition"] = relation.get("target_definition")
                nodes[target]["student_visible"] = False
            relationship_type = str(relation.get("type") or "related_to")
            graph_relationship = "alternative_to" if relationship_type == "alternative_to" else (
                "prerequisite_for" if relationship_type in {"requires", "builds_on"} else "works_with"
            )
            edges.append({
                "source": item_node,
                "target": target,
                "relationship": graph_relationship,
                "semantic_relationship_type": relationship_type,
                "status": relation.get("status") or "emerging_candidate_relationship_review",
                "explanation": relation.get("explanation"),
                "student_visible": False,
            })

    # Carry the independently researched area task-set candidates into the
    # graph. These remain hidden until their own evidence gates pass.
    domain_node = "domain:D078"
    nodes[domain_node] = {
        "id": domain_node,
        "kind": "domain_route",
        "domain_id": "D078",
        "label": contract.get("domain_name") or "D078",
        "student_visible": False,
        "approval": "domain_contract_candidate_not_student_approved",
        "source_ledger": "d078_domain_learning_contract",
    }
    area_node_count = 0
    task_family_node_count = 0
    area_item_node_count = 0
    area_item_type_counts: Counter[str] = Counter()
    area_route_edges = 0
    area_node_by_id: dict[str, str] = {}
    task_node_by_id: dict[str, str] = {}
    task_area_by_id: dict[str, str] = {}
    task_area_by_slug: dict[str, str] = {}
    for area in area_package.get("area_task_sets", []):
        area_id = str(area.get("area_id") or area.get("label") or "unnamed-area")
        area_node = f"area:{slug(area_id)}"
        nodes[area_node] = {
            "id": area_node,
            "kind": "area_of_specialization",
            "area_id": area_id,
            "label": area.get("label") or area_id,
            "task_set_status": area.get("task_set_status"),
            "student_visible": False,
            "approval": "area_task_set_candidate_not_student_approved",
            "source_ledger": "d078_area_role_task_sets",
        }
        area_node_by_id[area_id] = area_node
        area_node_count += 1
        edges.append({"source": domain_node, "target": area_node, "relationship": "domain_to_area", "status": "area_context_candidate"})
        area_route_edges += 1
        tasks = [*as_list(area.get("task_families")), *as_list(area.get("additional_task_families"))]
        for task in tasks:
            task_id = str(task.get("task_id") or f"{area_id}:task-family")
            task_node = f"area-task:{slug(task_id)}"
            nodes[task_node] = {
                "id": task_node,
                "kind": "area_task_family",
                "task_family_id": task_id,
                "area_id": area_id,
                "label": task.get("task_wording") or task_id,
                "task_set_status": area.get("task_set_status"),
                "student_visible": False,
                "approval": "area_task_set_candidate_not_student_approved",
                "source_ledger": "d078_area_role_task_sets",
                "authoritative_work_source_ids": task.get("authoritative_work_source_ids", []),
                "explanatory_source_ids": task.get("explanatory_source_ids", []),
                "free_task_specific_learning_source_ids": task.get("free_task_specific_learning_source_ids", []),
                "learner_output": task.get("learner_output", []),
            }
            task_node_by_id[task_id] = task_node
            task_area_by_id[task_id] = area_id
            task_area_by_slug[slug(task_id)] = area_id
            task_family_node_count += 1
            edges.append({"source": area_node, "target": task_node, "relationship": "area_to_task_family", "status": "area_context_candidate"})
            area_route_edges += 1
            for index, item in enumerate(as_list(task.get("learning_items")), start=1):
                label = item.get("label") or f"unnamed item {index}"
                item_node = f"area-item:{slug(area_id)}:{slug(task_id)}:{index}:{slug(label)}"
                nodes[item_node] = {
                    "id": item_node,
                    "kind": "area_learning_item",
                    "item_type": item.get("type"),
                    "label": label,
                    "area_id": area_id,
                    "task_family_id": task_id,
                    "student_visible": False,
                    "approval": "area_candidate_not_student_approved",
                    "source_ledger": "d078_area_role_task_sets",
                    "what_it_is": item.get("what_it_is"),
                    "programme_meaning": item.get("meaning_in_selected_programme"),
                    "domain_and_area_meaning": item.get("meaning_in_domain_and_area"),
                    "role_application": item.get("role_application"),
                    "evidence_source_ids": item.get("evidence_source_ids", []),
                    "explanatory_source_ids": item.get("explanatory_source_ids", []),
                    "free_task_specific_learning_source_ids": item.get("free_task_specific_learning_source_ids", []),
                    "resource_gate": item.get("resource_gate"),
                    "prerequisites_relationships_and_limits": item.get("prerequisites_relationships_and_limits"),
                }
                area_item_node_count += 1
                area_item_type_counts[str(item.get("type"))] += 1
                edges.append({"source": task_node, "target": item_node, "relationship": "task_to_area_item", "status": "area_context_candidate"})
                area_route_edges += 1
            for prerequisite in as_list(task.get("prerequisites")):
                target = concept_node(nodes, str(prerequisite), "area_prerequisite", "d078_area_role_task_sets")
                edges.append({"source": target, "target": task_node, "relationship": "prerequisite_for", "status": "area_context_candidate"})
            for complement in as_list(task.get("complements")):
                target = concept_node(nodes, str(complement), "area_complement", "d078_area_role_task_sets")
                edges.append({"source": task_node, "target": target, "relationship": "works_with", "status": "area_context_candidate"})
            for alternative in as_list(task.get("alternatives")):
                target = concept_node(nodes, str(alternative), "area_alternative", "d078_area_role_task_sets")
                edges.append({"source": task_node, "target": target, "relationship": "alternative_to", "status": "area_context_candidate"})

    # Add the item-by-item domain → current-area reconciliation as hidden,
    # explicitly candidate routes. Do not convert the crosswalk's suggested
    # task-family references into task edges: those references still need a
    # same-area ownership check and their route status is not student approval.
    area_node_by_label = {
        norm(node.get("label")): node["id"]
        for node in nodes.values() if node.get("kind") == "area_of_specialization"
    }
    for node in list(nodes.values()):
        if node.get("kind") != "domain_emerging_learning_item":
            continue
        for route_label in as_list(node.get("area_route_labels")):
            area_target = area_node_by_label.get(norm(route_label))
            if not area_target:
                node.setdefault("unresolved_area_route_labels", []).append(route_label)
                continue
            edges.append({
                "source": node["id"],
                "target": area_target,
                "relationship": "candidate_domain_item_area_route",
                "status": "emerging_area_route_candidate_hidden",
                "fit_note": node.get("area_route_note"),
                "route_condition": node.get("d078_context"),
                "student_visible": False,
            })

    crosswalk_counts = {
        "records": len(domain_area_crosswalk.get("records", [])),
        "routes": 0,
        "records_with_routes": 0,
        "explicit_no_area_dispositions": 0,
        "missing_domain_item_ids": [],
        "missing_area_ids": [],
        "task_family_references": 0,
        "unresolved_or_wrong_area_task_references": [],
    }
    area_label_by_id = {
        str(node.get("area_id")): node.get("label")
        for node in nodes.values() if node.get("kind") == "area_of_specialization"
    }
    for disposition in domain_area_crosswalk.get("records", []):
        contract_id = str(disposition.get("domain_item_id") or "")
        domain_node_id = domain_by_key.get(norm(contract_id))
        if not domain_node_id:
            crosswalk_counts["missing_domain_item_ids"].append(contract_id)
            continue
        domain_node_record = nodes[domain_node_id]
        domain_node_record.setdefault("candidate_area_route_dispositions", []).append({
            "crosswalk_disposition": disposition.get("domain_layer_disposition"),
            "route_condition": disposition.get("route_condition"),
            "no_area_reason": disposition.get("no_area_reason"),
            "source_artifacts": domain_area_crosswalk.get("source_artifacts", []),
            "student_visible": False,
        })
        routes = as_list(disposition.get("area_routes"))
        if not routes:
            crosswalk_counts["explicit_no_area_dispositions"] += 1
        else:
            crosswalk_counts["records_with_routes"] += 1
        for route in routes:
            area_id = str(route.get("area_id") or "")
            area_node_id = area_node_by_id.get(area_id)
            if not area_node_id:
                crosswalk_counts["missing_area_ids"].append(area_id)
                continue
            crosswalk_counts["routes"] += 1
            reference_audit = []
            for task_id in as_list(route.get("task_family_ids")):
                task_id = str(task_id)
                crosswalk_counts["task_family_references"] += 1
                owner = task_area_by_id.get(task_id) or task_area_by_slug.get(slug(task_id))
                reference_status = (
                    "same_area_candidate_reference" if owner == area_id else
                    "wrong_area_candidate_reference" if owner else
                    "not_in_baseline_pending_expanded_area_lane_check"
                )
                reference_audit.append({
                    "task_family_id": task_id,
                    "status": reference_status,
                    "recorded_owner_area_id": owner,
                })
                if owner and owner != area_id:
                    crosswalk_counts["unresolved_or_wrong_area_task_references"].append({
                        "domain_item_id": contract_id,
                        "area_id": area_id,
                        "task_family_id": task_id,
                        "recorded_owner_area_id": owner,
                    })
            domain_node_record.setdefault("candidate_area_routes", []).append({
                "area_id": area_id,
                "area_label": area_label_by_id.get(area_id),
                "fit": route.get("fit"),
                "route_condition": disposition.get("route_condition"),
                "task_family_reference_audit": reference_audit,
                "status": "candidate_route_not_student_approved",
            })
            edges.append({
                "source": domain_node_id,
                "target": area_node_id,
                "relationship": "candidate_domain_item_area_route",
                "status": "crosswalk_route_candidate_hidden",
                "domain_item_id": contract_id,
                "area_id": area_id,
                "fit": route.get("fit"),
                "route_condition": disposition.get("route_condition"),
                "task_family_reference_audit": reference_audit,
                "student_visible": False,
            })

    crosswalk_counts["missing_domain_item_ids"] = sorted(set(crosswalk_counts["missing_domain_item_ids"]))
    crosswalk_counts["missing_area_ids"] = sorted(set(crosswalk_counts["missing_area_ids"]))

    relationship_counts = Counter(edge["relationship"] for edge in edges)
    cycle = prerequisite_cycle_check(edges)
    role_nodes = sum(node["kind"] == "role_item_candidate" for node in nodes.values())
    domain_nodes = sum(node["kind"] == "domain_learning_item" for node in nodes.values())
    emerging_domain_nodes = sum(node["kind"] == "domain_emerging_learning_item" for node in nodes.values())
    output = {
        "schema_version": "2026-10-10.d078.programme-to-role-learning-path-graph.v1",
        "status": "provisional_design_graph_typed_domain_area_and_role_layers",
        "source_artifacts": [
            str(PLACEMENT.relative_to(ROOT)).replace("\\", "/"),
            str(DOMAIN_CONTRACT.relative_to(ROOT)).replace("\\", "/"),
            str(AREA_TASKS.relative_to(ROOT)).replace("\\", "/"),
            str(DOMAIN_EMERGING.relative_to(ROOT)).replace("\\", "/"),
            str(DOMAIN_AREA_CROSSWALK.relative_to(ROOT)).replace("\\", "/"),
        ],
        "student_visible": False,
        "nodes": list(nodes.values()),
        "edges": edges,
        "validation": {
            "role_item_source_records": len(placement_records),
            "approved_role_item_records": len(approved_role_records),
            "hidden_role_item_records_excluded": len(placement_records) - len(approved_role_records),
            "domain_contract_records": len(rows),
            "domain_contract_alias_records_folded_into_canonical_items": sum(
                len(row.get("lineage_alias_records", [])) for row in rows
            ),
            "domain_alias_targets_resolve": all(
                alias_id in domain_by_key
                for row in rows for alias_id in [a.get("id") for a in row.get("lineage_alias_records", [])]
            ),
            "domain_aliases_emitted_as_separate_nodes": any(
                node.get("contract_id") in {
                    a.get("id") for row in rows for a in row.get("lineage_alias_records", [])
                }
                for node in nodes.values() if node.get("kind") == "domain_learning_item"
            ),
            "role_item_nodes": role_nodes,
            "typed_domain_learning_item_nodes": domain_nodes,
            "emerging_domain_candidate_nodes": emerging_domain_nodes,
            "area_nodes": area_node_count,
            "area_task_family_nodes": task_family_node_count,
            "area_learning_item_nodes": area_item_node_count,
            "area_item_type_counts": dict(sorted(area_item_type_counts.items())),
            "area_route_edges": area_route_edges,
            "domain_area_route_crosswalk": crosswalk_counts,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "relationship_counts": dict(sorted(relationship_counts.items())),
            "typed_domain_item_counts": dict(sorted(Counter(str(row.get("type")) for row in rows).items())),
            "all_domain_items_student_visible": False,
            "emerging_domain_candidates_student_visible": False,
            "area_items_student_visible": False,
            "canonical_promotions": 0,
            "prerequisite_graph": cycle,
            "sequence_claim": "Typed domain items, hidden emerging-domain candidates, independent area task-set candidates and approved role-item candidates are available for sequence design; none are student-visible until their item-level evidence/UI gates pass.",
        },
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# D078 programme → role typed learning-path graph — 2026-10-10",
        "",
        "This is a local design artifact. It joins the approved-subset role-item crosswalk with the typed D078 domain-learning contract, independently researched area task sets, and the local domain emerging-task supplement. Candidate material remains hidden and is not promoted to students.",
        "",
        f"- Approved role-item nodes: **{role_nodes}**",
        f"- Typed domain-learning nodes: **{domain_nodes}**",
        f"- Emerging domain-task candidates: **{emerging_domain_nodes}**",
        f"- Area nodes: **{area_node_count}**",
        f"- Area task-family nodes: **{task_family_node_count}**",
        f"- Area learning-item nodes: **{area_item_node_count}**",
        f"- Total nodes: **{len(nodes)}**",
        f"- Total edges: **{len(edges)}**",
        f"- Typed domain item counts: `{dict(sorted(Counter(str(row.get('type')) for row in rows).items()))}`",
        f"- Prerequisite graph acyclic: **{cycle['acyclic']}**",
        "- Student-visible nodes: **0**",
        "- Canonical promotions: **0**",
        "",
        "The domain records retain their type and contract state, while area task-set candidates retain their area and task-family ownership. Domain-item-to-area crosswalk edges are hidden route candidates with explicit conditions, not approved learner routes. Proposed task-family references are audited for same-area ownership and are not emitted as direct task edges. The graph does not infer a tool/method→area or role link from a shared label, technical compatibility or co-occurrence.",
        "",
        f"Machine-readable artifact: `{OUTPUT.relative_to(ROOT).as_posix()}`",
    ]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(output["validation"], sort_keys=True))


if __name__ == "__main__":
    main()
