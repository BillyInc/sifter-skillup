"""Refresh D078 role-route visibility from current reviewed graph evidence.

This is deliberately route-scoped: it does not approve learning-item nodes,
publish the whole graph, alter role-fit decisions, or use old visibility flags
as evidence. A role node becomes selectable only when both its parent-domain
route and at least one area route satisfy their evidence contract.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"


def _first_reviewed_statement(value: Any) -> str | None:
    if not value:
        return None
    statement = str(value)
    for marker in (
        " Local reconciliation of ",
        " Role-agent exact-key review ",
        " Second-pass ",
    ):
        statement = statement.split(marker, 1)[0]
    if ": " in statement:
        statement = statement.split(": ", 1)[1]
    return statement.strip() or None


def _https_refs(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    return [value for value in values if isinstance(value, str) and value.startswith("https://")]


def _domain_route_is_visible(edge: dict[str, Any]) -> bool:
    evidence = edge.get("evidence") or {}
    status = edge.get("status")
    basis = evidence.get("basis")
    refs = _https_refs(evidence.get("source_refs"))
    condition = _first_reviewed_statement(
        evidence.get("conditional_use_case") or basis
    )
    return bool(
        status in {"reviewed_supported", "reviewed_conditional"}
        and basis
        and refs
        and (status == "reviewed_supported" or condition)
    )


def _area_route_is_visible(edge: dict[str, Any], domain_ok: bool) -> bool:
    refs = _https_refs(edge.get("source_refs"))
    status = edge.get("status")
    condition = edge.get("scope_condition") or edge.get("condition")
    return bool(
        domain_ok
        and status in {"reviewed_supported", "reviewed_conditional"}
        and edge.get("rationale")
        and edge.get("positive_task_evidence")
        and refs
        and (status == "reviewed_supported" or condition)
    )


def refresh() -> dict[str, Any]:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8-sig"))
    roles = {
        node["id"]: node
        for node in graph.get("nodes", [])
        if node.get("kind") == "role" and node.get("domain_id") == "D078"
    }
    domain_edges: dict[str, dict[str, Any]] = {}
    for edge in graph.get("edges", []):
        if edge.get("relationship") == "domain_to_role" and edge.get("target") in roles:
            visible = _domain_route_is_visible(edge)
            edge["student_visible"] = visible
            edge["visibility_scope"] = "selectable_role_route"
            edge["visibility_reason"] = (
                "Current reviewed domain-route evidence and source references are present; "
                "conditional scope is retained in the route explanation."
                if visible else
                "Not selectable: current domain-route evidence, source or conditional scope is incomplete."
            )
            domain_edges[edge["target"]] = edge

    area_counts: dict[str, int] = {role_id: 0 for role_id in roles}
    visible_area_routes = 0
    conditional_area_routes = 0
    for edge in graph.get("edges", []):
        if edge.get("relationship") != "area_to_role" or edge.get("target") not in roles:
            continue
        parent = domain_edges.get(edge["target"])
        visible = _area_route_is_visible(edge, bool(parent and parent.get("student_visible")))
        edge["student_visible"] = visible
        edge["visibility_scope"] = "selectable_role_route"
        edge["visibility_reason"] = (
            "Current reviewed area-task fit is supported by the parent-domain route, "
            "positive task evidence and source references."
            if visible else
            "Not selectable: current area evidence or its parent-domain route is incomplete."
        )
        if visible:
            visible_area_routes += 1
            area_counts[edge["target"]] = area_counts.get(edge["target"], 0) + 1
            conditional_area_routes += edge.get("status") == "reviewed_conditional"

    visible_roles = 0
    for role_id, role in roles.items():
        domain_edge = domain_edges.get(role_id)
        visible = bool(
            domain_edge
            and domain_edge.get("student_visible")
            and area_counts.get(role_id, 0) > 0
        )
        role["student_visible"] = visible
        role["visibility_scope"] = "selectable_role_card_after_area_selection"
        role["visibility_reason"] = (
            "Selectable because a reviewed D078 domain route and at least one reviewed "
            "canonical-area route are present; role learning additions remain selection-scoped."
            if visible else
            "Not selectable because both a reviewed D078 domain route and at least one reviewed area route are required."
        )
        visible_roles += visible

    # Keep the artifact itself audit-only. Item-node promotion and the separate
    # student-facing approval decision are not implied by route visibility.
    graph["student_visible"] = False
    graph["route_visibility_reconciliation"] = {
        "decision": "recomputed_from_current_route_evidence",
        "scope": "D078 domain-to-role, area-to-role and selectable role nodes only",
        "visible_domain_role_routes": sum(
            edge.get("student_visible") is True for edge in domain_edges.values()
        ),
        "domain_role_routes": len(domain_edges),
        "visible_area_role_routes": visible_area_routes,
        "area_role_routes": sum(
            edge.get("relationship") == "area_to_role"
            and edge.get("target") in roles
            for edge in graph.get("edges", [])
        ),
        "conditional_visible_area_routes": conditional_area_routes,
        "visible_role_cards": visible_roles,
        "role_nodes": len(roles),
        "roles_with_multiple_area_routes": sum(count > 1 for count in area_counts.values()),
        "selection_policy": "Role-specific learning additions are imported only after that role is selected.",
        "learning_item_visibility_changed": False,
        "whole_graph_student_approval_changed": False,
    }
    GRAPH_PATH.write_text(
        json.dumps(graph, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return graph["route_visibility_reconciliation"]


if __name__ == "__main__":
    print(json.dumps(refresh(), ensure_ascii=False, indent=2))
