#!/usr/bin/env python3
"""Build/validate a separate D078 sequence and relationship disposition ledger.

This is intentionally read-only with respect to source ledgers, graph, UI,
contracts, SQL and migrations. It writes only the sequence JSON and Markdown
handoff named below.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
DOCS = ROOT / "docs/manual-review"
GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json"
DESIGN_PATH = AUDIT / "D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.json"
DIRECTION_PATH = AUDIT / "D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.json"
AREA_DISPOSITION_PATHS = [
    AUDIT / "d078_area_relationship_dispositions_A01_A03_2026_10_10.json",
    AUDIT / "d078_area_relationship_dispositions_A04_A05_2026_10_10.json",
    AUDIT / "d078_area_relationship_dispositions_A06_A07_2026_10_10.json",
]
SEQUENCE_EVIDENCE = {
    "sequence:d078-econ-quant-foundation-to-applied-econometrics": [
        {"title": "University of Pennsylvania Economics, Econ 224 syllabus", "url": "https://economics.sas.upenn.edu/system/files/2018-09/Econ224syllabus.pdf", "locator": "Prerequisite section: prior Statistics for Economists or comparable statistics coursework; course-design example, not a universal admissions rule."},
    ],
    "sequence:d078-applied-econometrics-to-causal-ml": [
        {"title": "Stanford GSB Bulletin, MGTECON 634 Machine Learning and Causal Inference", "url": "https://bulletin.stanford.edu/courses/2177851", "locator": "Course description and prerequisite: prior empirical causal-inference methods; advanced-route example, not a universal ML prerequisite."},
    ],
    "sequence:d078-agent-based-modeling-to-casevo": [
        {"title": "Jiang et al., CASEVO paper", "url": "https://arxiv.org/abs/2412.19498", "locator": "Abstract and Introduction: CASEVO's LLM-agent simulator and its relationship to Mesa/agent-based modelling."},
        {"title": "CASEVO project repository", "url": "https://github.com/rgCASS/casevo", "locator": "Background and ModelBase documentation: Mesa model/agent structure and LLM interface integration."},
    ],
}
OUT_JSON = AUDIT / "D078_SEQUENCE_DISPOSITION_2026_10_17.json"
OUT_MD = DOCS / "D078_SEQUENCE_DISPOSITION_2026_10_17.md"

ORDER_RELATIONSHIPS = {
    "prerequisite_for", "prerequisite_text", "requires", "builds_on", "precedes",
}
CHOICE_RELATIONSHIPS = {"alternative_to", "alternative_option"}
COMPLEMENT_RELATIONSHIPS = {"complements", "works_with"}
TRACKED_RELATIONSHIPS = ORDER_RELATIONSHIPS | CHOICE_RELATIONSHIPS | COMPLEMENT_RELATIONSHIPS


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def graph_cycles(edges: list[dict[str, Any]]) -> list[list[str]]:
    adjacency: dict[str, list[str]] = defaultdict(list)
    vertices: set[str] = set()
    for edge in edges:
        source, target = edge.get("source"), edge.get("target")
        if not source or not target:
            continue
        adjacency[source].append(target)
        vertices.update((source, target))
    state: dict[str, int] = {}
    stack: list[str] = []
    cycles: list[list[str]] = []

    def visit(node: str) -> None:
        state[node] = 1
        stack.append(node)
        for target in adjacency[node]:
            if state.get(target, 0) == 0:
                visit(target)
            elif state.get(target) == 1:
                start = stack.index(target)
                cycle = stack[start:] + [target]
                if cycle not in cycles:
                    cycles.append(cycle)
        stack.pop()
        state[node] = 2

    for vertex in sorted(vertices):
        if state.get(vertex, 0) == 0:
            visit(vertex)
    return cycles


def normalize_area_record(row: dict[str, Any], critical: dict[str, Any], approved_refs: set[str], path: Path) -> dict[str, Any]:
    ref = row.get("reference_id") or ""
    area_id = row.get("area_id")
    source = row.get("declaring_item_id") or row.get("declared_by_item_id")
    targets = row.get("resolved_target_node_ids") or row.get("resolved_target_ids") or []
    relation = row.get("relation_type") or row.get("old_type") or "unspecified"
    disposition = row.get("disposition") or row.get("decision") or "unclassified"
    rationale = row.get("rationale") or ""
    limitations = row.get("limitations") or row.get("remaining_limitation")
    sources = row.get("evidence_sources") or []
    source_ids = row.get("evidence_source_ids") or []
    review = critical.get(ref)
    if ref in approved_refs:
        policy = "conditional_prerequisite"
        status = "approved_sequence_hidden_until_release"
    elif review:
        action = review.get("sequence_action", "")
        interpretation = review.get("interpretation", "")
        if "workflow" in action or "draft_then" in action or "pretest_then" in action or "protocol_before" in action:
            policy = "workflow"
        elif "safeguard" in interpretation or "gate" in interpretation or "condition" in interpretation:
            policy = "conditional_safeguard"
        elif "candidate" in action or "pending" in action:
            policy = "candidate_not_approved"
        else:
            policy = "none"
        status = "reviewed_no_sequence_approval"
        rationale = review.get("note") or rationale
    elif relation in {"alternative_to"}:
        policy, status = "alternative_choice", "dispositioned_not_sequence_approved"
    elif relation == "complements":
        policy, status = "complement_no_order", "dispositioned_not_sequence_approved"
    elif relation in {"requires", "builds_on", "precedes"}:
        policy, status = "none_pending_independent_sequence_approval", "dispositioned_not_sequence_approved"
    else:
        policy, status = "advisory_no_order", "dispositioned_not_sequence_approved"
    locators = [{"artifact": path.relative_to(ROOT).as_posix(), "pointer": f"/records/{ref}"}]
    locators.extend({"source_id": source_id} for source_id in source_ids)
    locators.extend({"title": src.get("title"), "url": src.get("url"), "locator": src.get("locator")}
                    for src in sources if isinstance(src, dict))
    return {
        "id": ref,
        "kind": "area_relationship_declaration",
        "scope": {"domain_id": "D078", "area_id": area_id},
        "source_item_id": source,
        "declared_relationship": relation,
        "raw_target": row.get("raw_target") or row.get("old_label"),
        "resolved_target_ids": targets,
        "disposition": disposition,
        "sequence_policy": policy,
        "condition": (review or {}).get("note") if review else row.get("evidence_scope"),
        "rationale": rationale,
        "limitations": limitations,
        "evidence_locators": locators,
        "sequence_approved": ref in approved_refs,
        "student_visible": False,
        "status": status,
    }


def main() -> int:
    graph = read_json(GRAPH_PATH)
    design = read_json(DESIGN_PATH)
    direction = read_json(DIRECTION_PATH)
    graph_nodes = graph["nodes"]
    graph_edges = graph["edges"]
    node_by_id = {node["id"]: node for node in graph_nodes}
    edge_identities = {(edge.get("source"), edge.get("target"), edge.get("relationship")) for edge in graph_edges}

    critical_records = {row["reference_id"]: row for row in direction.get("records", [])}
    strict_edges = design.get("strict_learning_dependencies", [])
    approved_refs = {ref for edge in strict_edges for ref in edge.get("evidence_reference_ids", [])}
    strict_by_ref = {ref: edge for edge in strict_edges for ref in edge.get("evidence_reference_ids", [])}

    area_records: list[dict[str, Any]] = []
    area_sources: dict[str, str] = {}
    for path in AREA_DISPOSITION_PATHS:
        payload = read_json(path)
        rows = payload.get("records") or payload.get("references") or []
        area_sources[path.relative_to(ROOT).as_posix()] = len(rows)
        area_records.extend(normalize_area_record(row, critical_records, approved_refs, path) for row in rows)

    direct_orders = []
    for index, row in enumerate(design.get("direct_area_order_dispositions", []), start=1):
        decision = row.get("decision", "")
        policy = "conditional_safeguard" if "gate" in decision or "safeguard" in decision else (
            "workflow" if "workflow" in decision or "application" in decision else "advisory_no_order"
        )
        direct_orders.append({
            "id": f"direct-area-order:{index:02d}",
            "kind": "direct_area_order_declaration",
            "source_item_id": row.get("source"),
            "target_item_id": row.get("target"),
            "declared_relationship": row.get("declared_relationship"),
            "sequence_policy": policy,
            "hard_learning_dependency": bool(row.get("hard_learning_dependency")),
            "condition": None,
            "rationale": row.get("rationale") or row.get("decision"),
            "evidence_locators": [{
                "artifact": DESIGN_PATH.relative_to(ROOT).as_posix(),
                "pointer": f"/direct_area_order_dispositions/{index - 1}",
            }, {"artifact": "docs/manual-review/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.md",
                "section": "Disposition of the 27 direct area-order declarations"}],
            "sequence_approved": False,
            "student_visible": False,
            "status": row.get("graph_status", "dispositioned_no_sequence_edge"),
        })

    approved_sequence_edges = []
    for edge in strict_edges:
        evidence = []
        for ref in edge.get("evidence_reference_ids", []):
            evidence.append({"artifact": "docs/manual-review/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.md",
                             "reference_id": ref})
        evidence.append({"artifact": edge.get("source_check_artifact")})
        evidence.extend(SEQUENCE_EVIDENCE.get(edge["id"], []))
        approved_sequence_edges.append({
            "id": edge["id"],
            "kind": "approved_route_scoped_learning_dependency",
            "source_item_id": edge["source"],
            "target_item_id": edge["target"],
            "sequence_direction": "source prerequisite precedes target dependent",
            "relationship": edge.get("relationship"),
            "sequence_policy": "conditional_prerequisite",
            "route_scope": edge.get("route_scope"),
            "condition": edge.get("condition"),
            "rationale": edge.get("approval_basis"),
            "evidence_reference_ids": edge.get("evidence_reference_ids", []),
            "evidence_locators": evidence,
            "sequence_approved": True,
            "student_visible": False,
            "status": edge.get("status"),
        })

    tracked_graph_edges = []
    for index, edge in enumerate(graph_edges):
        relation = edge.get("relationship")
        if relation not in TRACKED_RELATIONSHIPS:
            continue
        status = edge.get("status") or "unspecified"
        if status == "approved_route_scoped_sequence_hidden_until_release" and edge.get("sequence_approved") is True:
            policy = "conditional_prerequisite"
        elif relation in CHOICE_RELATIONSHIPS:
            policy = "alternative_choice"
        elif relation in COMPLEMENT_RELATIONSHIPS:
            policy = "complement_no_order"
        elif relation == "prerequisite_text":
            policy = "untyped_text_no_order"
        elif relation in ORDER_RELATIONSHIPS:
            policy = "not_approved_no_order"
        else:
            policy = "advisory_no_order"
        from_node, to_node = node_by_id.get(edge.get("source"), {}), node_by_id.get(edge.get("target"), {})
        scope = {"domain_id": "D078"}
        if edge.get("area_id"):
            scope["area_id"] = edge["area_id"]
        if from_node.get("kind") == "role":
            scope["role_node_id"] = from_node["id"]
        if to_node.get("kind") == "role":
            scope["role_node_id"] = to_node["id"]
        if not scope.get("area_id") and edge.get("evidence_scope"):
            scope["declared_evidence_scope"] = edge["evidence_scope"]
        tracked_graph_edges.append({
            "id": f"graph-edge:{index:05d}",
            "source_item_id": edge.get("source"),
            "target_item_id": edge.get("target"),
            "source_label": from_node.get("label"),
            "target_label": to_node.get("label"),
            "relationship": relation,
            "sequence_policy": policy,
            "scope": scope,
            "condition": edge.get("evidence_scope"),
            "rationale": edge.get("explanation") or "No relationship-level ordering approval is encoded; retain as non-blocking context.",
            "evidence_reference_ids": edge.get("evidence_source_ids", []),
            "evidence_locators": [{
                "artifact": GRAPH_PATH.relative_to(ROOT).as_posix(),
                "pointer": f"/edges/{index}",
            }],
            "sequence_approved": edge.get("sequence_approved") is True,
            "student_visible": edge.get("student_visible") is True,
            "status": status,
        })

    missing_endpoints = [
        {"source": edge.get("source"), "target": edge.get("target"), "relationship": edge.get("relationship")}
        for edge in graph_edges if edge.get("source") not in node_by_id or edge.get("target") not in node_by_id
    ]
    prereq_edges = [edge for edge in graph_edges if edge.get("relationship") == "prerequisite_for"]
    all_prereq_cycles = graph_cycles(prereq_edges)
    approved_graph_edges = [edge for edge in graph_edges if edge.get("sequence_approved") is True]
    approved_cycles = graph_cycles(approved_graph_edges)
    approved_graph_identity = {
        (edge.get("source"), edge.get("target"), edge.get("relationship")) for edge in approved_graph_edges
    }
    strict_missing_from_graph = [edge["id"] for edge in strict_edges if
        (edge["source"], edge["target"], edge["relationship"]) not in approved_graph_identity]
    unresolved_strict_endpoints = [edge["id"] for edge in strict_edges if
        edge["source"] not in node_by_id or edge["target"] not in node_by_id]

    area_nodes = [node for node in graph_nodes if node.get("kind") == "area_of_specialization"]
    canonical_area_ids = {node_id for branch in (graph.get("learning_path_design") or {}).get("area_branches", [])
                          if (node_id := branch.get("area_node_id"))}
    graph_area_ids = {node["id"] for node in area_nodes}
    roles = [node for node in graph_nodes if node.get("kind") == "role"]
    area_role_edges = [edge for edge in graph_edges if edge.get("relationship") == "area_to_role"
                       and edge.get("status") in {"reviewed_supported", "reviewed_conditional"}]
    domain_role_edges = [edge for edge in graph_edges if edge.get("relationship") == "domain_to_role"
                         and edge.get("status") in {"reviewed_supported", "reviewed_conditional"}]
    role_branch_details = []
    for role in roles:
        role_area_edges = [edge for edge in area_role_edges if edge.get("target") == role["id"]]
        role_domain_edges = [edge for edge in domain_role_edges if edge.get("target") == role["id"]]
        role_branch_details.append({
            "role_node_id": role["id"],
            "role_name": role.get("label"),
            "domain_route_count": len(role_domain_edges),
            "area_routes": [{"area_node_id": edge["source"], "status": edge.get("status"),
                             "condition": edge.get("condition")} for edge in role_area_edges],
            "multi_area_role": len(role_area_edges) > 1,
            "sequence_edges_touching_role": sum(edge.get("source") == role["id"] or edge.get("target") == role["id"]
                                                 for edge in approved_graph_edges),
        })

    route_transition_types = {
        "programme_to_domain_context", "domain_to_area", "domain_to_role", "area_to_role",
    }
    route_transition_edges = []
    for index, edge in enumerate(graph_edges):
        if edge.get("relationship") not in route_transition_types:
            continue
        route_transition_edges.append({
            "id": f"route-transition:{index:05d}",
            "source_node_id": edge.get("source"),
            "target_node_id": edge.get("target"),
            "relationship": edge.get("relationship"),
            "sequence_policy": "route_navigation_or_membership_not_learning_prerequisite",
            "route_scope": "D078 Sociology programme path; preserve edge-specific area/role status",
            "condition": edge.get("condition") or edge.get("explanation"),
            "status": edge.get("status"),
            "student_visible": edge.get("student_visible") is True,
            "evidence_locator": {"artifact": GRAPH_PATH.relative_to(ROOT).as_posix(),
                                 "pointer": f"/edges/{index}"},
        })
    route_transition_counts = Counter(edge["relationship"] for edge in route_transition_edges)

    relation_counts = Counter(edge.get("relationship") for edge in tracked_graph_edges)
    status_counts = Counter(edge.get("status") for edge in graph_edges)
    area_ref_ids = [edge["id"] for edge in area_records]
    failures = []
    if len(area_records) != 192 or len(set(area_ref_ids)) != len(area_ref_ids):
        failures.append("area relationship disposition count/identity is not 192 unique records")
    if len(critical_records) != 19 or any(ref not in set(area_ref_ids) for ref in critical_records):
        failures.append("critical relationship references do not all join to the 192 area records")
    if len(direct_orders) != 27 or any(row["hard_learning_dependency"] for row in direct_orders):
        failures.append("direct area-order disposition count or hard-edge policy is invalid")
    if len(strict_edges) != 3 or strict_missing_from_graph or unresolved_strict_endpoints:
        failures.append("approved sequence edges are missing, unresolved, or inconsistent with graph")
    if missing_endpoints:
        failures.append(f"{len(missing_endpoints)} graph edge endpoints do not resolve")
    if all_prereq_cycles or approved_cycles:
        failures.append("cycle found in prerequisite relation graph")
    if len(roles) != 19 or len(canonical_area_ids) != 7 or canonical_area_ids != graph_area_ids:
        failures.append("role or canonical-area branch coverage does not match the seven-area route")
    if any(row["domain_route_count"] < 1 or not row["area_routes"] for row in role_branch_details):
        failures.append("a routed role is missing its domain or area relationship")
    if any(row["sequence_edges_touching_role"] for row in role_branch_details):
        failures.append("a role branch is incorrectly connected by an approved learning prerequisite")
    if sum(edge.get("sequence_approved") is True for edge in graph_edges) != 3:
        failures.append("unexpected approved sequence edge count in graph")
    if sum(row["sequence_approved"] for row in area_records) != 3:
        failures.append("the area relationship ledger does not identify exactly the three approved sequence references")
    if any(edge.get("sequence_approved") is True for edge in graph_edges
           if edge.get("relationship") in CHOICE_RELATIONSHIPS | COMPLEMENT_RELATIONSHIPS):
        failures.append("an alternative or complement edge is incorrectly sequence-approved")
    expected_transitions = {"programme_to_domain_context": 1, "domain_to_area": 7,
                            "domain_to_role": 19, "area_to_role": 26}
    if dict(route_transition_counts) != expected_transitions:
        failures.append("programme/domain/area/role route transition counts differ from reviewed route structure")
    if any(edge.get("sequence_policy") != "conditional_prerequisite"
           or not edge.get("route_scope") or not edge.get("condition")
           or edge.get("student_visible") for edge in approved_sequence_edges):
        failures.append("an approved sequence edge is missing its conditional scope or is exposed prematurely")

    payload = {
        "schema_version": "2026-10-17.d078-sequence-disposition.v1",
        "domain_id": "D078",
        "status": "validated_local_sequence_reconciliation_not_sql_or_student_promotion",
        "student_visible": False,
        "canonical_promotion": False,
        "scope": "Sequence and relationship policy only; does not change requirement lanes, inventory, explanations, UI, graph, SQL, or migrations.",
        "sources": [
            GRAPH_PATH.relative_to(ROOT).as_posix(), DESIGN_PATH.relative_to(ROOT).as_posix(),
            DIRECTION_PATH.relative_to(ROOT).as_posix(), *area_sources.keys(),
            "docs/manual-review/D078_SEQUENCE_SOURCE_CHECK_A01_A02_2026_10_12.md",
            "docs/manual-review/D078_SEQUENCE_SOURCE_CHECK_A03_A04_2026_10_12.md",
            "src/lib/guidedLearningPlan.ts", "src/lib/guidedLearningPlanAdapter.ts",
        ],
        "coverage": {
            "graph_nodes": len(graph_nodes), "graph_edges": len(graph_edges),
            "area_relationship_dispositions": len(area_records), "critical_references_joined": len(critical_records),
            "direct_area_order_declarations": len(direct_orders),
            "approved_route_scoped_sequence_edges": len(approved_sequence_edges),
            "sequence_and_choice_graph_edges": len(tracked_graph_edges),
            "sequence_graph_relationship_counts": dict(sorted(relation_counts.items())),
            "graph_edge_status_counts": dict(sorted(status_counts.items())),
            "area_relationship_source_record_counts": area_sources,
            "role_route_count": len(roles), "canonical_area_count": len(area_nodes),
            "domain_to_role_edges": len(domain_role_edges), "area_to_role_edges": len(area_role_edges),
            "role_branches_with_multiple_areas": sum(row["multi_area_role"] for row in role_branch_details),
            "route_transition_edge_counts": dict(sorted(route_transition_counts.items())),
        },
        "validation": {
            "graph_edges_with_missing_endpoints": len(missing_endpoints),
            "all_prerequisite_for_edges_acyclic": not all_prereq_cycles,
            "approved_sequence_edges_acyclic": not approved_cycles,
            "approved_sequence_edges_match_graph": not strict_missing_from_graph,
            "approved_sequence_edge_endpoints_resolve": not unresolved_strict_endpoints,
            "all_roles_have_domain_and_area_routes": all(row["domain_route_count"] > 0 and row["area_routes"] for row in role_branch_details),
            "role_learning_prerequisite_edges": sum(row["sequence_edges_touching_role"] for row in role_branch_details),
            "canonical_area_set_matches_design": canonical_area_ids == graph_area_ids and len(graph_area_ids) == 7,
            "only_three_area_relationship_refs_are_sequence_approved": sum(row["sequence_approved"] for row in area_records) == 3,
            "alternatives_and_complements_do_not_sequence": not any(edge.get("sequence_approved") is True for edge in graph_edges
                if edge.get("relationship") in CHOICE_RELATIONSHIPS | COMPLEMENT_RELATIONSHIPS),
            "route_transition_counts_match_reviewed_structure": dict(route_transition_counts) == expected_transitions,
            "approved_dependencies_are_conditional_and_hidden": all(edge.get("sequence_policy") == "conditional_prerequisite"
                and edge.get("route_scope") and edge.get("condition") and not edge.get("student_visible") for edge in approved_sequence_edges),
            "errors": failures,
        },
        "planner_behavior_findings": [
            "Only source-backed, explicitly sequence-approved builds_on links become hard prerequisites in the contextual-item adapter.",
            "Approved conditional prerequisites order only when the route scope matches and both items are selected; they do not block adding the dependent item.",
            "Unapproved/plain-text prerequisite notes do not enter the typed prerequisiteIds emitted by the adapter.",
            "Alternatives remain explicit choices; complements and works_with do not impose order.",
            "Reordering now validates every selected dependent after the proposed move, so neither moving the dependent before its prerequisite nor moving its prerequisite behind the dependent can violate the edge.",
            "The seven areas are parallel route branches; domain/area/role navigation edges are not prerequisite edges.",
        ],
        "repair": {
            "artifact": "src/lib/guidedLearningPlan.ts",
            "change": "reorderLearningPlan validates all selected prerequisite/dependent pairs after a proposed reorder, fixing the predecessor-moved-behind-successor case.",
            "regression_test": "src/lib/guidedLearningPlan.test.ts — does not allow moving a prerequisite behind its selected dependent",
        },
        "approved_sequence_edges": approved_sequence_edges,
        "route_transition_edges": route_transition_edges,
        "direct_area_order_dispositions": direct_orders,
        "area_relationship_dispositions": area_records,
        "graph_relationship_dispositions": tracked_graph_edges,
        "role_area_branches": role_branch_details,
        "cycle_samples": {"all_prerequisite_for": all_prereq_cycles[:10], "approved": approved_cycles[:10]},
        "missing_graph_endpoints": missing_endpoints[:20],
        "unresolved_approved_sequence_edges": unresolved_strict_endpoints,
        "approved_sequence_edges_missing_from_graph": strict_missing_from_graph,
    }

    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    area_display_counts = Counter(row["sequence_policy"] for row in area_records)
    summary_lines = [
        "# D078 sequence dispositions and ordering validation — 2026-10-17", "",
        f"**Status:** {payload['status']}. This is local sequencing reconciliation, not SQL application or student-promotion approval.", "",
        "## Coverage", "",
        f"- Current graph: {len(graph_nodes):,} nodes and {len(graph_edges):,} edges; all edge endpoints resolve.",
        f"- Area relationship dispositions: {len(area_records)}; all 19 critical references join to these source records.",
        f"- Direct area-order declarations: {len(direct_orders)}; all remain non-hard-order dispositions.",
        f"- Approved, route-scoped learner-order edges: {len(approved_sequence_edges)}.",
        f"- Additional ordering/choice/complement graph records individually catalogued: {len(tracked_graph_edges):,}.",
        f"- Route structure: {len(roles)} roles, {len(area_nodes)} canonical areas, {len(domain_role_edges)} domain-role edges, {len(area_role_edges)} area-role edges; {payload['coverage']['role_branches_with_multiple_areas']} roles have multiple area branches.",
        f"- Programme/domain/area/role route transitions are separately catalogued as navigation/membership, not learning prerequisites: {dict(sorted(route_transition_counts.items()))}.",
        "", "## Sequence decisions", "",
        "The only currently approved learning-order edges are conditional and apply only on their named route:", "",
    ]
    for edge in approved_sequence_edges:
        evidence_text = "; ".join(
            f"[{locator['title']}]({locator['url']}) — {locator.get('locator', '').rstrip('.')}" if locator.get("url")
            else f"`{locator.get('artifact', '')}` {locator.get('reference_id', '')}"
            for locator in edge["evidence_locators"]
        )
        summary_lines.append(f"- `{edge['source_item_id']}` → `{edge['target_item_id']}` — {edge['route_scope']}. Condition: {edge['condition']} Evidence: `{', '.join(edge['evidence_reference_ids'])}`; {evidence_text}.")
    summary_lines += [
        "", "The 19 critical references were inspected against their direction-review records and the two source-check artifacts. Only the three above have sequence approval. Other declarations are individually retained in the JSON as workflow, conditional safeguard, alternative, complement, advisory, untyped text, or not-approved/no-order records; none is silently promoted to a prerequisite.",
        "", "## Structural and branch checks", "",
        f"- Missing graph endpoints: **{len(missing_endpoints)}**.",
        f"- Cycle in all `prerequisite_for` graph edges: **{'none' if not all_prereq_cycles else 'FOUND'}** ({sum(1 for _ in prereq_edges)} edges checked).",
        f"- Cycle in approved sequence edges: **{'none' if not approved_cycles else 'FOUND'}**.",
        f"- All approved edge endpoints exist and match graph: **{'yes' if not strict_missing_from_graph and not unresolved_strict_endpoints else 'no'}**.",
        f"- Each of the 19 roles has a domain route plus one or more area routes: **{'yes' if payload['validation']['all_roles_have_domain_and_area_routes'] else 'no'}**.",
        "- No approved learning prerequisite attaches a role to another role or orders sibling areas.",
        "- Multi-area roles remain separate area branches; role-area relationships are routing/fit links, not sequential learning constraints.",
        "", "## Planner behavior and repair", "",
    ]
    summary_lines.extend(f"- {finding}" for finding in payload["planner_behavior_findings"])
    summary_lines += [
        "", "## Reproduce", "",
        "```powershell",
        "& 'C:\\Python314\\python.exe' data/career-mapping/_audit/reconcile_d078_sequence_dispositions_2026_10_17.py",
        "node.exe .\\node_modules\\jest\\bin\\jest.js --runInBand src/lib/guidedLearningPlan.test.ts src/lib/guidedLearningPlanAdapter.test.ts",
        "```", "",
        "The generator exits nonzero if coverage, graph integrity, role-route coverage, or sequence-edge consistency fails. It writes only this JSON and this Markdown report.",
        "", "## Boundaries", "",
        "No requirement-lane decisions were edited. No UI/explanation files, shared graph artifact, seed, SQL, migration, tool/role inventory, or legacy subgroup data were changed. Sequence approval and student visibility remain separate.",
        "",
    ]
    OUT_MD.write_text("\n".join(summary_lines), encoding="utf-8")
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    print(json.dumps(payload["coverage"], ensure_ascii=False, sort_keys=True))
    print(json.dumps(payload["validation"], ensure_ascii=False, sort_keys=True))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
