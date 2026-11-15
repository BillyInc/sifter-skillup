"""Integrate current, individually gated role-item contracts into D078 graph.

This updates the current method-aware graph in place, preserving its method,
area, role, and combination routes. Approved role items become visible only
when the current per-item display gate passes. Ineligible and unapproved rows
remain in the graph as hidden audit records and never enter selectable route
arrays.
"""
from __future__ import annotations

import gzip
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH_JSON = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
SOURCE_ARTIFACT = "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
ROLE_TASK_ROUTE_DISPOSITIONS = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_TASK_ROUTE_DISPOSITIONS_2026_11_03.json"

import sys
sys.path.insert(0, str(ROOT / "data" / "career-mapping"))
from _build_d078_role_item_contract_seed_2026_10_15 import records, student_display_gate  # noqa: E402


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def load_graph() -> dict[str, Any]:
    # The compressed artifact is the canonical current graph. Both transport
    # forms are rewritten together below so the UI exporter cannot read stale JSON.
    with gzip.open(GRAPH_GZ, "rt", encoding="utf-8") as stream:
        return json.load(stream)


def learning_link_payload(record: dict[str, Any]) -> list[dict[str, Any]]:
    link = record.get("learning_link") or {}
    url = str(link.get("url") or "").strip()
    if not url.startswith("https://"):
        return []
    review = record.get("learning_link_review") or {}
    return [{
        "title": link.get("title") or record.get("label"),
        "url": url,
        "locator": link.get("locator"),
        "access": link.get("access") or link.get("access_status"),
        "why_this_resource": link.get("fit"),
        "limitations": link.get("limits") or link.get("limit"),
        "review_status": review.get("status"),
        "reviewed_on": review.get("checked_on"),
    }]


def role_item_node(record: dict[str, Any], owner_ids: list[str], owner_labels: list[str], eligible: bool, reason: str) -> dict[str, Any]:
    position = int(record["queue_position"])
    label = str(record["label"]).strip()
    approval_status = record.get("approval_status")
    if eligible:
        approval = "approved_role_item_contract_student_card_eligible"
    elif approval_status == "unapproved":
        approval = "unapproved_role_item_contract_hidden"
    else:
        approval = "approved_role_item_contract_not_student_card_eligible"
    lane = str(record.get("requirement_lane") or "useful_optional")
    lane_to_level = {
        "needed": "needed",
        "useful_optional": "useful",
        "conditional": "conditional",
        "choose_one_alternative": "optional",
        "unapproved": "optional",
    }
    evidence_urls = [
        str(row.get("url")) for row in record.get("evidence", [])
        if str(row.get("url") or "").startswith("https://")
    ]
    evidence_urls.extend(str(url) for url in record.get("resolved_source_urls", []) if str(url).startswith("https://"))
    source_refs = list(dict.fromkeys(evidence_urls))
    meaning = str(record.get("plain_language_meaning") or "").strip()
    output = str(record.get("task_output") or "").strip()
    role_application = str(record.get("role_application") or "").strip()
    scope = dict(record.get("requirement_scope") or {})
    scope.update({
        "lane": lane,
        "condition": record.get("requirement_condition"),
        "rationale": record.get("requirement_rationale"),
        "evidence_gap": record.get("requirement_evidence_gap"),
        "skippable": lane != "needed",
        "blocks_progression": False,
        "auto_add": False,
        "auto_order": False,
    })
    return {
        "id": f"role-item:{position}:{slug(label)}-{slug(str(record.get('priority_snapshot') or ''))}",
        "kind": "role_item_candidate",
        "item_type": "role_downstream_learning_item",
        "layer": "role_route_candidate",
        "queue_position": position,
        "label": label,
        "meaning": meaning,
        "plain_language_meaning": meaning,
        "what_it_is": meaning,
        "contextual_use": role_application,
        "role_application": role_application,
        "why_it_matters": role_application or str(record.get("role_task_basis") or "").strip(),
        "learner_output": output,
        "task_output": output,
        "role_task_basis": record.get("role_task_basis"),
        "role_owner_ids": owner_ids,
        "role_owner_labels": owner_labels,
        "requirement_lane": lane,
        "requirement_level": lane_to_level.get(lane, "useful"),
        "requirement_reason": record.get("requirement_rationale") or record.get("approval_reason"),
        "requirement_scope": scope,
        "requirement_lane_source": "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json",
        "prerequisites": record.get("prerequisites") or [],
        "complements": record.get("complements") or [],
        "valid_alternatives": record.get("valid_alternatives") or [],
        "relationship_annotations": {
            "prerequisites": record.get("prerequisites") or [],
            "complements": record.get("complements") or [],
            "alternatives": record.get("valid_alternatives") or [],
            "note": "Plain-language annotations are not promoted to typed graph edges unless both endpoints resolve to reviewed graph items.",
        },
        "limitations": record.get("limits_nonreplacement") or [],
        "learning_links": learning_link_payload(record),
        "source_refs": source_refs,
        "source_locators": record.get("source_locators") or [],
        "role_item_contract": record,
        "approval_status": approval_status,
        "approval_reason": record.get("approval_reason"),
        "approval": approval,
        "student_display_approved": eligible,
        "student_display_eligibility_reason": reason,
        "student_visible": eligible,
        "reconciliation_status": "student_card_eligible" if eligible else "retained_hidden_for_audit",
        "sequence_approved": False,
        "skippable": lane != "needed",
        "blocking_policy": "never",
        "canonical_promotion": False,
        "requirement_lane_disposition": record.get("requirement_lane"),
        "source_artifact": SOURCE_ARTIFACT,
    }


def ids_for_owner(owner: str, eligible_by_owner: dict[str, list[str]]) -> list[str]:
    return sorted(eligible_by_owner.get(owner, []), key=lambda value: int(value.split(":", 2)[1]))


def main() -> None:
    graph = load_graph()
    ledger = records()
    route_review = json.loads(ROLE_TASK_ROUTE_DISPOSITIONS.read_text(encoding="utf-8"))
    route_decisions = {int(row["queue_position"]): row for row in route_review.get("decisions", [])}
    excluded_route_positions = {
        position for position, row in route_decisions.items()
        if row.get("decision") == "exclude_from_d078_student_route"
    }
    nodes = graph.setdefault("nodes", [])
    by_id = {str(node["id"]): node for node in nodes}
    roles_by_label = {
        str(node.get("label") or "").strip().casefold(): str(node["id"])
        for node in nodes if node.get("kind") == "role" and node.get("domain_id") == "D078"
    }
    if len(roles_by_label) != 19:
        raise ValueError(f"Expected all 19 canonical D078 roles; found {len(roles_by_label)}")

    by_position = {int(row["queue_position"]): (row, owners) for row, owners in ledger}
    existing_candidates = {
        int(node["queue_position"]): node
        for node in nodes
        if node.get("kind") == "role_item_candidate" and node.get("queue_position") is not None
    }
    # Older graph nodes encode the queue position in their ID but did not keep
    # it as a field. Recover that identity before reconciling the ledger.
    for node in nodes:
        match = re.match(r"role-item:(\d+):", str(node.get("id") or ""))
        if node.get("kind") == "role_item_candidate" and match:
            position = int(match.group(1))
            existing_candidates.setdefault(position, node)

    if not set(existing_candidates).issubset(by_position):
        raise ValueError("Current graph contains role-item candidate IDs absent from the reconciled ledger")

    eligible_by_owner: dict[str, list[str]] = defaultdict(list)
    eligibility_counts: Counter[str] = Counter()
    all_items_by_owner: dict[str, list[str]] = defaultdict(list)
    eligible_positions: set[int] = set()
    for row, owners in ledger:
        position = int(row["queue_position"])
        eligible, reason = student_display_gate(row, owners)
        route_decision = route_decisions.get(position)
        if route_decision and route_decision.get("decision") == "exclude_from_d078_student_route":
            eligible = False
            reason = "excluded_by_reviewed_role_task_route_disposition"
        eligibility_counts[reason] += 1
        owner_ids: list[str] = []
        for owner in owners:
            label = owner.split("|", 1)[-1].strip().casefold()
            role_id = roles_by_label.get(label)
            if role_id:
                owner_ids.append(role_id)
                if eligible:
                    eligible_by_owner[role_id].append(f"role-item:{position}:{slug(str(row['label']))}-{slug(str(row.get('priority_snapshot') or ''))}")
                all_items_by_owner[role_id].append(f"role-item:{position}:{slug(str(row['label']))}-{slug(str(row.get('priority_snapshot') or ''))}")
        owner_labels: list[str] = []
        for owner in owners:
            label = owner.split("|", 1)[-1].strip()
            if label.casefold() in roles_by_label:
                owner_labels.append(label)
        node = existing_candidates.get(position)
        if node is None:
            node = role_item_node(row, owner_ids, owner_labels, eligible, reason)
            nodes.append(node)
            by_id[str(node["id"])] = node
            existing_candidates[position] = node
        else:
            updated = role_item_node(row, owner_ids, owner_labels, eligible, reason)
            # Keep the stable graph ID, replacing only this role-item node's
            # stale audit-only summary with the authoritative current contract.
            node.clear()
            node.update(updated)
        if route_decision:
            node["role_task_route_disposition"] = route_decision
            node["role_task_route_review_artifact"] = str(ROLE_TASK_ROUTE_DISPOSITIONS.relative_to(ROOT)).replace("\\", "/")
            if route_decision.get("decision") == "conditional_task_route":
                node["requirement_scope"]["condition"] = route_decision["condition"]
                node["route_context_explanation"] = route_decision["explanation"]
            elif route_decision.get("decision") == "exclude_from_d078_student_route":
                node.update({
                    "approval": "unapproved_role_task_route_excluded",
                    "student_display_approved": False,
                    "student_visible": False,
                    "student_selectable": False,
                    "student_display_eligibility_reason": route_decision["reason"],
                    "reconciliation_status": "retained_hidden_for_audit",
                    "student_display_disposition": {
                        "decision": "unapproved_for_d078_student_route",
                        "basis": "The local role-task review found no supported D078 task/foundation route for this item.",
                        "reason": route_decision["reason"],
                        "reviewed_on": route_review["date"],
                    },
                })
        if eligible:
            eligible_positions.add(position)

    if len(existing_candidates) != len(ledger):
        raise ValueError(f"Graph role-item coverage incomplete: {len(existing_candidates)} nodes for {len(ledger)} contracts")
    expected_eligible = 166 - len(excluded_route_positions)
    if len(eligible_positions) != expected_eligible:
        raise ValueError(f"Current role-route gate changed unexpectedly: expected {expected_eligible} eligible, got {len(eligible_positions)}")

    # A role's items are role-owned, not method-specific. The selected method
    # still gates the area and role route; once that role is opened, show its
    # reviewed role-owned items regardless of which method exposed the role.
    route_count = 0
    for route in graph.get("method_area_role_routes", []):
        role_id = str(route.get("role_id") or "")
        route["role_item_ids"] = ids_for_owner(role_id, eligible_by_owner)
        route["method_specific_role_item_ids"] = []
        route_count += 1
    for route in graph.get("combination_area_role_routes", []):
        role_id = str(route.get("role_id") or "")
        route["role_item_ids"] = ids_for_owner(role_id, eligible_by_owner)
        route["method_specific_role_item_ids"] = []
        route_count += 1

    method_route_by_id = {
        str(route.get("route_node_id")): route
        for route in graph.get("method_area_role_routes", [])
        if route.get("route_node_id")
    }
    for route_node_id, route in method_route_by_id.items():
        route_node = by_id.get(route_node_id)
        if route_node is not None:
            route_node["role_item_ids"] = list(route.get("role_item_ids", []))
            route_node["method_specific_role_item_ids"] = []
    for node in nodes:
        kind = node.get("kind")
        if kind == "combination_area_role_route":
            role_id = str(node.get("role_id") or "")
            node["role_item_ids"] = ids_for_owner(role_id, eligible_by_owner)
            node["method_specific_role_item_ids"] = []
        elif kind == "combination_component_role_route":
            role_id = str(node.get("role_id") or "")
            role_items = ids_for_owner(role_id, eligible_by_owner)
            node["role_item_ids"] = role_items
            node["method_specific_role_item_ids"] = []
            for contribution in node.get("method_contributions", []):
                # The items belong to the role, not exclusively to this method
                # contribution. Keep them available after the combined route
                # reaches the role without falsely labelling them method-only.
                contribution["role_item_ids"] = role_items
                contribution["method_specific_role_item_ids"] = []
    for design in graph.get("combination_designs", []):
        for variant in design.get("component_route_variants", []):
            for area_route in variant.get("area_routes", []):
                role_contributions = area_route.setdefault("role_contributions_by_id", {})
                for role_id in area_route.get("role_ids", []):
                    role_id = str(role_id)
                    contributions = role_contributions.setdefault(role_id, [])
                    # Keep the exact method -> area -> role evidence already
                    # materialized by the combination builder. Role-owned
                    # items are an additional layer after the role is opened;
                    # they must not replace the method contributions that
                    # justify this role's presence in the selected route.
                    contributions[:] = [
                        row for row in contributions
                        if row.get("method_id") != "role-owned"
                    ]
                    contributions.append({
                        "method_id": "role-owned",
                        "role_item_ids": ids_for_owner(role_id, eligible_by_owner),
                        "method_specific_role_item_ids": [],
                    })

    # Keep method-specific role items empty: the approved contract contains
    # role-owned work items, not evidence that an item is exclusive to a method.

    # Rebuild selected-role reveal edges from the current route contracts.
    edges = graph.setdefault("edges", [])
    edges[:] = [edge for edge in edges if edge.get("relationship") != "selected_role_reveals_role_item"]
    routes_for_edges: list[tuple[str, str]] = []
    for route in graph.get("method_area_role_routes", []):
        route_node_id = str(route.get("route_node_id") or "")
        if route_node_id:
            routes_for_edges.extend((route_node_id, item_id) for item_id in route.get("role_item_ids", []))
    for route in graph.get("combination_area_role_routes", []):
        route_node_id = str(route.get("id") or "")
        if route_node_id:
            routes_for_edges.extend((route_node_id, item_id) for item_id in route.get("role_item_ids", []))
    for source_id, item_id in sorted(set(routes_for_edges)):
        item = by_id.get(item_id)
        if item is None or item.get("student_visible") is not True:
            raise ValueError(f"A selectable role-item route points to a hidden or missing item: {source_id} -> {item_id}")
        edges.append({
            "id": f"selected_role_reveals_role_item:{source_id}->{item_id}",
            "source": source_id,
            "target": item_id,
            "relationship": "selected_role_reveals_role_item",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "sequence_approved": False,
            "blocking_policy": "never",
            "role_owner": by_id.get(source_id, {}).get("role_id"),
            "explanation": (
                "This role-owned item appears only after the learner follows the selected domain -> "
                "method or named design -> supported area -> role path. It continues that selected "
                "route; it is not a detached choice or a claim that the method is a role requirement."
            ),
            "selection_path": ["domain:D078", "selected_method_or_design", "supported_area", "selected_role"],
            "task_family_specific": False,
        })

    expected_edges = len(set(routes_for_edges))
    if expected_edges != sum(edge.get("relationship") == "selected_role_reveals_role_item" for edge in edges):
        raise ValueError("Selected-role reveal edges do not match the current role route contracts")
    per_role = {role_id: len(ids) for role_id, ids in eligible_by_owner.items()}
    if set(per_role) != set(roles_by_label.values()):
        missing = sorted(set(roles_by_label.values()) - set(per_role))
        raise ValueError(f"At least one canonical role has no approved selectable role items: {missing}")

    hidden_positions = sorted(set(by_position) - eligible_positions)
    graph["role_item_integration"] = {
        "source_artifact": SOURCE_ARTIFACT,
        "source_records": len(ledger),
        "approved_dispositions": sum(row.get("approval_status") == "approved" for row, _ in ledger),
        "unapproved_dispositions": sum(row.get("approval_status") == "unapproved" for row, _ in ledger),
        "student_card_eligible_records": len(eligible_positions),
        "retained_hidden_audit_records": len(hidden_positions),
        "hidden_queue_positions": hidden_positions,
        "eligibility_reasons": dict(sorted(eligibility_counts.items())),
        "all_19_roles_have_selectable_items": True,
        "method_specific_role_item_records": 0,
        "role_items_excluded_for_no_supported_task_or_foundation_route": len(excluded_route_positions),
        "role_item_scope": (
            "Role-owned items are revealed only inside the selected domain -> method or named design -> "
            "supported area -> selected role flow. Items without a reviewed task-family link remain "
            "role-route learning options within that selected path; they are never detached choices "
            "or falsely labelled method-specific."
        ),
        "global_graph_student_visibility_changed": False,
        "per_item_visibility_is_authoritative": True,
    }
    coverage = graph.setdefault("learning_path_design", {}).setdefault("role_item_coverage", {})
    coverage.update({
        "all_records_integrated": len(ledger),
        "approved_dispositions": graph["role_item_integration"]["approved_dispositions"],
        "unapproved_final_dispositions": graph["role_item_integration"]["unapproved_dispositions"],
        "individually_card_eligible": len(eligible_positions),
        "hidden_not_card_eligible": len(hidden_positions),
        "student_visible": len(eligible_positions) > 0,
        "student_visibility_basis": "current per-item approval, routed role owner and reviewed HTTPS learning/reference link; historical false flags are audit-only",
        "route_context_basis": "selected domain -> selected method or named design -> supported area -> selected role -> reviewed role task/foundation; role items without a supported path remain hidden",
        "role_item_owner_edges": expected_edges,
        "all_19_roles_have_selectable_items": True,
        "method_specific_role_item_records": 0,
    })
    validation = graph.setdefault("validation", {})
    validation.update({
        "role_item_contract_records": len(ledger),
        "role_item_nodes_with_current_disposition": len(existing_candidates),
        "role_item_student_card_eligible": len(eligible_positions),
        "role_item_hidden_for_item_specific_reason": len(hidden_positions),
        "role_item_selectable_route_edges": expected_edges,
        "all_role_item_route_targets_exist": True,
        "all_role_item_route_targets_student_visible": True,
        "all_19_roles_have_role_item_cards": True,
        "method_specific_role_item_records": 0,
        "global_graph_student_visibility_unchanged": graph.get("student_visible") is False,
    })

    # Keep the separate learner-facing role sequence contract synchronized
    # with the authoritative per-item gate. This was previously left at 161
    # after the graph had moved to 166 eligible role cards, creating a stale
    # count that could be mistaken for a still-open approval gate.
    sequence_contract = graph.setdefault("role_learning_sequence_contract", {})
    eligible_lane_counts = Counter(
        str(row.get("requirement_lane") or "useful_optional")
        for row, _ in ledger
        if student_display_gate(row, _)[0]
        and int(row["queue_position"]) not in excluded_route_positions
    )
    role_item_ids = {
        str(node.get("id")) for node in nodes
        if node.get("kind") == "role_item_candidate"
    }
    approved_role_dependency_edges = sum(
        1 for edge in edges
        if edge.get("relationship") in {"prerequisite_for", "requires", "precedes", "builds_on"}
        and edge.get("sequence_approved") is True
        and (
            str(edge.get("source")) in role_item_ids
            or str(edge.get("target")) in role_item_ids
        )
    )
    sequence_contract.update({
        "eligible_role_item_count": len(eligible_positions),
        "role_item_lane_counts": dict(sorted(eligible_lane_counts.items())),
        "approved_role_item_dependency_edges": approved_role_dependency_edges,
        "role_item_sequence_policy": (
            "Use only item-specific, source-backed, reviewed dependency edges for order. "
            "Free-text preparation notes remain explanatory until their exact target, "
            "route scope, and relationship evidence are reviewed; safeguards and "
            "task conditions are not learning blockers. Every selectable role item must "
            "remain downstream of the selected domain -> method/design -> area -> role path; "
            "no role item is an independent domain-wide choice."
        ),
    })
    schema_version = str(graph.get("schema_version") or "2026-10-22.d078-method-area-role-route-graph.v6")
    schema_version = re.sub(r"(?:\+role-items-2026-10-29)+$", "", schema_version)
    graph["schema_version"] = schema_version + "+role-items-2026-10-29"

    payload = (json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    temp_json = GRAPH_JSON.with_suffix(".json.tmp")
    temp_json.write_bytes(payload)
    temp_json.replace(GRAPH_JSON)
    temp_gz = GRAPH_GZ.with_name(GRAPH_GZ.name + ".tmp")
    with temp_gz.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as compressed:
            compressed.write(payload)
    temp_gz.replace(GRAPH_GZ)
    print(json.dumps({
        "graph": str(GRAPH_GZ.relative_to(ROOT)),
        "schema_version": graph["schema_version"],
        "role_item_nodes": len(existing_candidates),
        "eligible_items": len(eligible_positions),
        "hidden_audit_items": len(hidden_positions),
        "role_routes_updated": route_count,
        "role_item_route_edges": expected_edges,
        "eligible_per_role": per_role,
        "eligibility_reasons": dict(sorted(eligibility_counts.items())),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
