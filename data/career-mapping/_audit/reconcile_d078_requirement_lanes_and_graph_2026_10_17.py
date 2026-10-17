#!/usr/bin/env python3
"""Reconcile current D078 learner lanes into an auditable ledger and graph.

The runtime contracts are the source for learner-visible domain, area, and role
items. Legacy role priority snapshots and graph visibility flags are not used to
infer whether an item is compulsory.
"""

from __future__ import annotations

import gzip
import json
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
BACKEND = ROOT / "backend"
GRAPH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
GRAPH_GZ = GRAPH.with_suffix(GRAPH.suffix + ".gz")
DISPOSITION = ROOT / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json"
LEDGER = ROOT / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_AND_SEQUENCE_RECONCILIATION_2026_10_17.json"
REPORT = ROOT / "docs/manual-review/D078_REQUIREMENT_LANE_AND_SEQUENCE_RECONCILIATION_2026_10_17.md"

if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from d078_guided_content import (  # noqa: E402
    _d078_role_area_names,
    d078_area_context_items,
    d078_domain_context_items,
    d078_role_context_items,
)


def canonical_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(value or "").casefold()).strip("-")


def learner_items() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    rows.extend(d078_domain_context_items())
    for area_id in sorted({
        "D078:sociology-social-anthropology",
        "D078:economics-applied-analysis",
        "D078:politics-governance-public-policy",
        "D078:psychology-social-behaviour",
        "D078:human-geography-population",
        "D078:social-research-evaluation",
        "D078:computational-digital-social-science",
    }):
        rows.extend(d078_area_context_items(area_id))
    for role_name in sorted(_d078_role_area_names()):
        rows.extend(d078_role_context_items(f"D078|{role_name}"))

    contexts_by_identity = {
        (str(row.get("itemType") or "").casefold(), str(row.get("itemKey") or "").casefold()): (
            str(row.get("contextLevel") or ""), str(row.get("contextKey") or "")
        )
        for row in rows
    }

    seen: set[tuple[str, str, str, str]] = set()
    result = []
    for row in rows:
        level = str(row.get("requirementLevel") or "")
        if level not in {"needed", "useful", "optional"}:
            raise ValueError(f"Unclassified runtime D078 item: {row.get('itemKey')}")
        if not str(row.get("requirementReason") or "").strip():
            raise ValueError(f"Missing learner-facing lane rationale: {row.get('itemKey')}")
        identity = (
            str(row.get("contextLevel") or ""), str(row.get("contextKey") or ""),
            str(row.get("itemType") or ""), str(row.get("itemKey") or ""),
        )
        if identity in seen:
            continue
        seen.add(identity)
        sequence_relationships = []
        for rel in row.get("relationships") or []:
            if not isinstance(rel, dict) or rel.get("sequencePolicy") != "conditional_prerequisite":
                continue
            target_context = contexts_by_identity.get((
                str(rel.get("toItemType") or "").casefold(),
                str(rel.get("toItemKey") or "").casefold(),
            ))
            if not target_context:
                raise ValueError(f"Conditional relationship target is missing from learner content: {rel.get('toItemKey')}")
            sequence_relationships.append({
                **rel, "toContextLevel": target_context[0], "toContextKey": target_context[1],
            })
        result.append({
            "context_level": identity[0], "context_key": identity[1],
            "item_type": identity[2], "item_key": identity[3],
            "name": row.get("name"), "requirement_level": level,
            "requirement_reason": row["requirementReason"],
            "requirement_scope": row.get("requirementScope") or {},
            "sequence_relationships": sequence_relationships,
            "guidance_owner": row.get("guidanceOwner"),
        })
    return result


def role_candidate_disposition(node: dict[str, Any], by_position: dict[int, dict[str, Any]]) -> dict[str, Any]:
    position = node.get("queue_position")
    record = by_position.get(int(position)) if position is not None else None
    if not record:
        raise ValueError(f"Role-item graph node lacks an exact queue-position disposition: {node.get('id')}")
    lane = str(record.get("requirement_lane") or "")
    if lane not in {"needed", "conditional", "useful_optional", "choose_one_alternative", "unapproved"}:
        raise ValueError(f"Invalid role-item lane at queue position {position}: {lane}")
    return {
        "lane": lane,
        "condition": record.get("condition"),
        "rationale": record.get("rationale"),
        "evidence_gap": record.get("evidence_gap"),
        "route_owner_context": record.get("context_key"),
        "skippable": lane != "needed",
        "blocks_progression": False,
        "auto_add": False,
        "auto_order": False,
        "can_select_alongside_needed": lane in {"conditional", "useful_optional"},
    }


def reconcile_graph(records: list[dict[str, Any]]) -> dict[str, Any]:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    disposition = json.loads(DISPOSITION.read_text(encoding="utf-8"))
    disposition_rows = disposition.get("records") or []
    role_item_dispositions = {
        int(row["queue_position"]): row for row in disposition_rows
        if row.get("context_type") == "role_item" and row.get("queue_position") is not None
    }
    if len(role_item_dispositions) != 173:
        raise ValueError(f"Expected 173 unique queue-position dispositions; got {len(role_item_dispositions)}")
    join_counts = {name: 0 for name in ("domain", "area", "area_inherited", "role_item", "role_tool")}
    by_item_identity = {
        (row["item_type"].casefold(), row["item_key"].casefold()): row
        for row in records
    }
    records_by_key: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        records_by_key.setdefault(record["item_key"].casefold(), []).append(record)
    matched_nodes = 0
    matched_records: set[tuple[str, str]] = set()
    role_candidates = 0
    for node in graph.get("nodes", []):
        item_key = node.get("item_id") or node.get("canonical_tool_id") or node.get("contract_id")
        item_type = node.get("item_type")
        if item_key and item_type:
            record = by_item_identity.get((str(item_type).casefold(), str(item_key).casefold()))
            if record is None:
                matches = records_by_key.get(str(item_key).casefold(), [])
                # Domain graph node types intentionally describe conceptual
                # bundles (e.g. knowledge_skill), while the learner contract
                # uses the concrete item type. Accept the key only when unique.
                record = matches[0] if len(matches) == 1 else None
            if record:
                node["requirement_level"] = record["requirement_level"]
                node["requirement_reason"] = record["requirement_reason"]
                node["requirement_scope"] = record["requirement_scope"]
                node["requirement_lane"] = record["requirement_scope"].get("lane") or record["requirement_level"]
                node["requirement_lane_source"] = "D078 runtime item contract"
                matched_nodes += 1
                matched_records.add((record["item_type"].casefold(), record["item_key"].casefold()))
        if node.get("kind") == "role_item_candidate":
            scope = role_candidate_disposition(node, role_item_dispositions)
            node["requirement_lane"] = scope["lane"]
            node["requirement_scope"] = scope
            node["requirement_lane_source"] = "queue-position-matched D078 requirement disposition; legacy priority snapshot ignored"
            if scope["lane"] == "unapproved":
                node["student_visible"] = False
                node["visibility_reason"] = scope["evidence_gap"] or "unapproved_requirement_lane"
            role_candidates += 1

    inserted_runtime_nodes = 0
    for record in records:
        if record["context_level"] == "role":
            continue
        identity = (record["item_type"].casefold(), record["item_key"].casefold())
        if identity in matched_records:
            continue
        node_id = (
            f"runtime-item:{record['context_level']}:{canonical_key(record['context_key'])}:"
            f"{canonical_key(record['item_key'])}"
        )
        graph["nodes"].append({
            "id": node_id,
            "kind": "runtime_learning_item",
            "item_type": record["item_type"],
            "item_id": record["item_key"],
            "label": record["name"],
            "context_level": record["context_level"],
            "context_key": record["context_key"],
            "requirement_level": record["requirement_level"],
            "requirement_lane": (record.get("requirement_scope") or {}).get("lane") or record["requirement_level"],
            "requirement_scope": record.get("requirement_scope") or {},
            "requirement_reason": record["requirement_reason"],
            "requirement_lane_source": "D078 runtime item contract",
            "student_visible": True,
            "approval": "approved_runtime_item_contract",
            "runtime_contract_reference": {
                "context_level": record["context_level"],
                "context_key": record["context_key"],
                "item_type": record["item_type"],
                "item_key": record["item_key"],
            },
        })
        matched_records.add(identity)
        inserted_runtime_nodes += 1

    role_tool_edges = 0
    role_tool_dispositions = {
        str(row.get("item_id") or ""): row for row in disposition_rows
        if row.get("context_type") == "role_tool"
    }
    if len(role_tool_dispositions) != 95:
        raise ValueError(f"Expected 95 unique role-tool lane decisions; got {len(role_tool_dispositions)}")
    runtime_foundation_scopes = {
        record["item_key"]: record["requirement_scope"]
        for record in records
        if record["context_level"] == "domain"
        and record["item_key"] in {
            "d078-research-question-design",
            "d078-evaluate-evidence-and-limits",
            "d078-communicate-evidence",
        }
    }
    graph_nodes = graph.get("nodes", [])
    graph_edges = graph.get("edges", [])
    # Apply each reviewed disposition by its canonical join key. This keeps the
    # 501 review records auditable even though the runtime API contains a
    # different set of 499 currently eligible item/context rows.
    for decision in disposition_rows:
        kind = decision.get("context_type")
        matched = []
        if kind == "domain":
            item_id = str(decision.get("item_id") or "")
            matched = [node for node in graph_nodes if node.get("kind") in {"domain_learning_item", "domain_emerging_learning_item"}
                       and str(node.get("contract_id") or node.get("item_id") or "") == item_id]
        elif kind == "area":
            item_id = str(decision.get("item_id") or "")
            context_key = str(decision.get("context_key") or "")
            matched = [node for node in graph_nodes if node.get("kind") == "area_enrichment_item"
                       and str(node.get("item_id") or "") == item_id
                       and str(node.get("area_id") or "") == context_key]
        elif kind == "area_inherited":
            item_id = str(decision.get("item_id") or "")
            matched = [node for node in graph_nodes if node.get("kind") == "area_learning_item"
                       and str(node.get("id") or "") == item_id]
        elif kind == "role_item":
            position = int(decision.get("queue_position"))
            matched = [node for node in graph_nodes if node.get("kind") == "role_item_candidate"
                       and int(node.get("queue_position") or -1) == position]
        elif kind == "role_tool":
            decision_id = str(decision.get("item_id") or "")
            matched = [edge for edge in graph_edges
                       if str(((edge.get("route_context") or {}).get("id") if isinstance(edge.get("route_context"), dict) else "") or "") == decision_id
                       and edge.get("relationship") in {"tool_supports_role_task", "tool_alternative_for_role_task"}]
        if not matched:
            raise ValueError(f"Requirement disposition did not resolve to a canonical graph node/edge: {kind}:{decision.get('item_id')}")
        scope = {
            "lane": decision["requirement_lane"],
            "condition": decision.get("condition"),
            "rationale": decision.get("rationale"),
            "evidence_gap": decision.get("evidence_gap"),
            "source_decision": decision.get("source_decision"),
            "consolidated_into": decision.get("consolidated_into"),
            "scope_kind": "role_task_tool_choice" if kind == "role_tool" else "item_context_requirement",
            "skippable": decision["requirement_lane"] != "needed",
            "blocks_progression": False,
            "auto_add": False,
            "auto_order": False,
            "can_select_alongside_needed": decision["requirement_lane"] in {"conditional", "useful_optional", "choose_one_alternative"},
        }
        if kind == "domain" and str(decision.get("item_id")) in runtime_foundation_scopes:
            scope = {
                **runtime_foundation_scopes[str(decision.get("item_id"))],
                "source_decision": decision.get("source_decision"),
                "evidence_gap": decision.get("evidence_gap"),
            }
        for target in matched:
            target["requirement_lane"] = scope["lane"]
            target["requirement_scope"] = scope
            if scope["lane"] in {"conditional", "useful_optional"}:
                target["requirement_level"] = "useful"
            elif scope["lane"] == "choose_one_alternative":
                target["requirement_level"] = "optional"
            if kind == "area":
                for relation_edge in graph_edges:
                    if relation_edge.get("target") != target.get("id") or relation_edge.get("relationship") not in {"area_to_learning_item", "task_to_area_item"}:
                        continue
                    relation_edge["requirement_lane"] = scope["lane"]
                    relation_edge["requirement_level"] = target.get("requirement_level")
                    relation_edge["requirement_scope"] = scope
                    relation_edge["skippable"] = True
                    relation_edge["blocking_policy"] = "never"
                    relation_edge["auto_add_target"] = False
                    relation_edge["auto_order_target"] = False
            target["requirement_lane_source"] = DISPOSITION.relative_to(ROOT).as_posix()
            target["lane_disposition_id"] = decision.get("item_id")
            if kind == "area" and decision.get("source_decision") == "exclude" and decision.get("consolidated_into"):
                replacement = [node for node in graph_nodes
                               if node.get("kind") == "area_enrichment_item"
                               and node.get("area_id") == decision.get("context_key")
                               and node.get("item_id") == decision.get("consolidated_into")]
                if len(replacement) != 1:
                    raise ValueError(f"Area consolidation target is not uniquely resolved: {decision.get('item_id')} -> {decision.get('consolidated_into')}")
                target["student_visible"] = False
                target["visibility_reason"] = "Consolidated duplicate; show the current canonical item instead."
                target["superseded_by_node_id"] = replacement[0]["id"]
                scope["student_eligible"] = False
                scope["lane_disposition"] = "superseded_by_canonical_item"
                scope["consolidated_into_node_id"] = replacement[0]["id"]
                for edge in graph_edges:
                    if edge.get("source") == target.get("id") or edge.get("target") == target.get("id"):
                        edge["student_visible"] = False
                        edge["visibility_reason"] = "Endpoint is a consolidated duplicate; use its canonical replacement."
            if scope["lane"] == "unapproved":
                target["student_visible"] = False
                target["visibility_reason"] = decision.get("evidence_gap") or "unapproved_requirement_lane"
        join_counts[kind] += 1
    if join_counts != {"domain": 53, "area": 144, "area_inherited": 36, "role_item": 173, "role_tool": 95}:
        raise ValueError(f"Incomplete or duplicate 501-record disposition join: {join_counts}")
    for edge in graph.get("edges", []):
        if edge.get("relationship") in {"tool_supports_role_task", "tool_alternative_for_role_task"}:
            edge["requirement_level"] = "optional"
            edge["requirement_reason"] = "A tool choice for a particular role task; the learner may use a valid alternative or continue without this tool when the task does not call for it."
            edge["choice_policy"] = "skippable_option_no_auto_add"
            route = edge.get("route_context") or {}
            decision_id = str(route.get("id") or "") if isinstance(route, dict) else ""
            decision = role_tool_dispositions.get(decision_id)
            if decision:
                edge["requirement_lane"] = decision["requirement_lane"]
                edge["requirement_scope"] = {
                    "lane": decision["requirement_lane"],
                    "condition": decision.get("condition"),
                    "rationale": decision.get("rationale"),
                    "scope_kind": "role_task_tool_choice",
                    "alternatives_are_cumulative": False,
                    "skippable": True,
                    "blocks_progression": False,
                    "auto_add": False,
                    "auto_order": False,
                    "can_select_alongside_needed": True,
                }
                edge["lane_disposition_id"] = decision_id
            else:
                edge["requirement_lane"] = "choose_one_alternative"
                edge["requirement_scope"] = {
                    "lane": "choose_one_alternative",
                    "scope_kind": "alternative_edge_for_role_task_tool",
                    "alternatives_are_cumulative": False,
                    "skippable": True,
                    "blocks_progression": False,
                    "auto_add": False,
                    "auto_order": False,
                    "can_select_alongside_needed": True,
                }
            role_tool_edges += 1

    sequence_edges: list[dict[str, Any]] = []
    for row in records:
        for rel in row["sequence_relationships"]:
            dependent_id = f"area_enrichment_item:{canonical_key(rel.get('fromItemKey'))}"
            prerequisite_id = (
                f"domain-item:{canonical_key(rel.get('toItemKey'))}"
                if rel.get("toContextLevel") == "domain"
                else f"area_enrichment_item:{canonical_key(rel.get('toItemKey'))}"
            )
            candidates = [
                edge for edge in graph.get("edges", [])
                if edge.get("source") == prerequisite_id
                and edge.get("target") == dependent_id
                and edge.get("relationship") == "prerequisite_for"
            ]
            if len(candidates) != 1:
                raise ValueError(f"Expected one graph edge for approved sequence {prerequisite_id} -> {dependent_id}; got {len(candidates)}")
            edge = candidates[0]
            edge.update({
                "status": "approved_conditional_sequence",
                "sequence_approved": True,
                "sequence_policy": "conditional_prerequisite",
                "sequence_condition": rel.get("sequenceCondition"),
                "sequence_scope": rel.get("sequenceScope"),
                "learner_explanation": rel.get("learnerExplanation"),
                "source_references": rel.get("sourceReferences") or [],
                "blocking_policy": "never",
                "skippable": True,
                "auto_add_target": False,
                "auto_order_target": True,
            })
            sequence_edges.append({
                "source": prerequisite_id, "target": dependent_id,
                "sequence_policy": "conditional_prerequisite",
                "condition": rel.get("sequenceCondition"),
                "scope": rel.get("sequenceScope"),
            })

    graph["requirement_lane_reconciliation"] = {
        "source": LEDGER.relative_to(ROOT).as_posix(),
        "generated_on": date.today().isoformat(),
        "runtime_learner_item_count": len(records),
        "graph_nodes_matched_to_runtime_items": matched_nodes,
        "runtime_nodes_added_for_missing_approved_items": inserted_runtime_nodes,
        "role_item_candidates_with_explicit_lane": role_candidates,
        "role_tool_task_edges_classified_optional": role_tool_edges,
        "requirement_disposition_source_record_count": len(disposition_rows),
        "requirement_disposition_graph_joins_by_context": join_counts,
        "role_item_queue_positions_joined": len(role_item_dispositions),
        "role_tool_disposition_ids": len(role_tool_dispositions),
        "disposition_count_policy": "The 501 review decisions and 499 current runtime item/context rows are different populations. The runtime set contains 52 visible domain items, 150 directly-owned area items, and 297 role item/tool rows; two held domain decisions do not become runtime cards, and inherited task context is represented as graph lineage. All 501 decisions join exact graph targets by context and item ID, inherited-node ID, role queue position, or role-tool decision ID; no decision is silently dropped.",
        "lane_counts": dict(Counter(row["requirement_level"] for row in records)),
        "needed_lane_policy": "Only an explicitly approved route dependency can be needed in a matching route; selecting or viewing the general domain/area/role does not make every item compulsory.",
        "priority_snapshot_policy": "Legacy essential/optional occurrence snapshots are audit lineage only and do not set learner requirement lanes.",
        "item_type_policy": "Skills, methods, tools, knowledge and certifications are classified by route/task evidence, never by item type.",
        "runtime_records_mapped_to_graph": len(matched_records),
        "unmapped_runtime_items": [
            {"item_type": row["item_type"], "item_key": row["item_key"], "context_level": row["context_level"], "context_key": row["context_key"]}
            for row in records
            if (row["item_type"].casefold(), row["item_key"].casefold()) not in matched_records
            and row["context_level"] != "role"
        ],
        "all_non_role_runtime_items_mapped": all(
            (row["item_type"].casefold(), row["item_key"].casefold()) in matched_records
            for row in records if row["context_level"] != "role"
        ),
    }
    graph["sequence_policy_contract"]["approved_edge_count"] = len(sequence_edges)
    validation = graph.setdefault("validation", {})
    validation["approved_sequence_edges"] = len(sequence_edges)
    sequence_audit = validation.setdefault("sequence_policy_audit", {})
    sequence_audit["approved_route_scoped_sequence_edges"] = len(sequence_edges)
    sequence_audit["compulsory_same_route_blocking_edges"] = 0
    sequence_audit["optional_or_useful_blocking_edges"] = 0
    # These are route-scoped ordering hints, not progression gates. They only
    # order a learner's selected matching items when the condition applies and
    # equivalent preparation is absent; adding a dependent remains possible.
    graph["sequence_policy_contract"]["approved_conditional_order_edges"] = [
        {
            "source": edge["source"],
            "target": edge["target"],
            "condition": edge["condition"],
            "scope": edge["scope"],
            "blocking_policy": "never",
        }
        for edge in sequence_edges
    ]
    graph["sequence_policy_contract"]["approved_blocking_edges"] = []
    graph["sequence_policy_contract"]["approved_blocking_edge_count"] = 0
    graph["sequence_policy_contract"]["graph_regeneration_deferred_until_task_2"] = False
    graph["sequence_policy_contract"]["requirement_lanes_reconciled"] = True
    graph["sequence_policy_contract"]["student_visible"] = False
    graph["sequence_policy_contract"]["graph_role"] = "internal dependency model; the UI renders only the selected route and its explanatory relationships"
    graph["sequence_policy_contract"]["non_auto_add"] = True
    graph["sequence_policy_contract"]["condition_and_equivalent_prior_learning_are_runtime_checks"] = True
    return graph, sequence_edges, matched_nodes, role_candidates


def main() -> None:
    records = learner_items()
    graph, sequence_edges, matched_nodes, role_candidates = reconcile_graph(records)
    lane_counts = dict(Counter(row["requirement_level"] for row in records))
    runtime_context_counts = dict(Counter(row["context_level"] for row in records))
    disposition = json.loads(DISPOSITION.read_text(encoding="utf-8"))
    disposition_lane_counts = dict(Counter(row["requirement_lane"] for row in disposition.get("records", [])))
    ledger = {
        "schema_version": "2026-10-17.d078-requirement-lane.v1",
        "domain_key": "D078",
        "generated_on": date.today().isoformat(),
        "canonical_area_count": 7,
        "records": records,
        "summary": {
            "runtime_item_context_records": len(records),
            "runtime_context_counts": runtime_context_counts,
            "lane_counts": lane_counts,
            "requirement_disposition_record_count": len(disposition.get("records", [])),
            "requirement_disposition_lane_counts": disposition_lane_counts,
            "requirement_disposition_graph_joins_by_context": graph["requirement_lane_reconciliation"]["requirement_disposition_graph_joins_by_context"],
            "conditional_sequence_edges": len(sequence_edges),
            "sequence_edges": sequence_edges,
            "needed_item_count": lane_counts.get("needed", 0),
            "needed_policy": "The three shared D078 foundations are the explicit compulsory spine; all later domain, area and role additions remain skippable unless a selected route states a separate condition.",
        },
    }
    LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with GRAPH_GZ.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as zipped:
            zipped.write(GRAPH.read_bytes())
    area_counts = Counter(row["context_key"] for row in records if row["context_level"] == "subgroup")
    role_context_count = len({row["context_key"] for row in records if row["context_level"] == "role"})
    report = [
        "# D078 requirement lanes and conditional sequence reconciliation — 2026-10-17",
        "",
        "## Result",
        "",
        f"Reconciled {len(records)} distinct learner item/context records from the current approved runtime contracts across the domain, seven canonical Areas of Specialization, and {role_context_count} role contexts.",
        "",
        f"- Runtime item/context population by owner: {runtime_context_counts}; this is distinct from the 501 review-disposition records.",
        f"- Lane totals: {', '.join(f'{name} {count}' for name, count in sorted(lane_counts.items()))}.",
        f"- The separate requirement-disposition ledger contains {len(disposition.get('records', []))} records; lane totals: {', '.join(f'{name} {count}' for name, count in sorted(disposition_lane_counts.items()))}.",
        f"- All 501 disposition records joined exactly to graph targets by context-specific keys: {graph['requirement_lane_reconciliation']['requirement_disposition_graph_joins_by_context']}.",
        f"- Approved conditional ordering edges: {len(sequence_edges)}; each is scoped to its stated route condition and has `blocking_policy=never`.",
        f"- Graph nodes annotated from runtime item contracts: {matched_nodes}; role-item candidates with a requirement disposition: {role_candidates}.",
        f"- Approved domain/area items missing from the former graph were added as explicit runtime nodes: {graph['requirement_lane_reconciliation']['runtime_nodes_added_for_missing_approved_items']}; 95 role-tool decisions classify {graph['requirement_lane_reconciliation']['role_tool_task_edges_classified_optional']} related graph edges as selectable tool choices.",
        f"- Unique non-role runtime identities mapped into graph nodes: {graph['requirement_lane_reconciliation']['runtime_records_mapped_to_graph']}; all mapped: {graph['requirement_lane_reconciliation']['all_non_role_runtime_items_mapped']}.",
        "- A general domain/area/role view does not make every card compulsory. No lane was inferred from item type, student-visibility flags, or legacy `priority_snapshot` values.",
        "- The three shared research/evidence foundations are conditionally needed only when the selected area/role task calls for them; outside that scope they remain useful and skippable. Their 1–3 order is pedagogical, not a hard dependency.",
        "- Conditional, useful and alternative items remain selectable alongside the core route; they are not auto-added and do not block progression. Alternatives are not cumulative.",
        "",
        "## Area coverage",
        "",
        *[f"- {area}: {count} learner item/context records" for area, count in sorted(area_counts.items())],
        "",
        "## Files",
        "",
        f"- Lane ledger: `{LEDGER.relative_to(ROOT).as_posix()}`",
        f"- Reconciled graph: `{GRAPH.relative_to(ROOT).as_posix()}` and its deterministic gzip mirror.",
        "- Seed generators persist the requirement scope independently of the base `requirement_level`; apply `migration_d078_requirement_lanes_2026-10-17.sql` before D078 domain/area and role-tool seeds, and after the path-target and role-item-contract schema migrations.",
        "",
        "This is local generated data, not a live Supabase deployment or a blanket student-release approval.",
    ]
    REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(f"records={len(records)} lanes={lane_counts} conditional_edges={len(sequence_edges)} graph_matched={matched_nodes} role_candidates={role_candidates}")
    print(f"wrote {LEDGER.relative_to(ROOT)}; {GRAPH.relative_to(ROOT)}; {REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
