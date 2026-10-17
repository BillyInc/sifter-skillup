"""Integrate the completed role-item handoff into the hidden D078 graph.

This is an implementation integration step, not a new role/domain/area fit
audit.  It preserves every agent disposition, keeps all records hidden, and
retains role-fit and taxonomy decisions unchanged.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
GRAPH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json"
HANDOFF = AUDIT / "D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
OUT = AUDIT / "D078_ROLE_ITEM_RECONCILIATION_INTEGRATION_2026_10_15.json"
REPORT = ROOT / "docs" / "manual-review" / "D078_ROLE_ITEM_RECONCILIATION_INTEGRATION_2026_10_15.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def slug(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(value or "").lower()).strip("-")[:120]


def selected_contract(record: dict[str, Any]) -> dict[str, Any]:
    fields = (
        "queue_position", "pair_key", "label", "priority_snapshot", "roles_snapshot",
        "placement_decision", "candidate_layer_if_revalidated", "final_layer",
        "category_rationale", "task_output", "plain_language_meaning",
        "programme_meaning", "domain_meaning", "area_meaning", "role_application",
        "prerequisites", "complements", "valid_alternatives", "limits_nonreplacement",
        "evidence", "nigeria_context", "learning_link", "source_locators",
        "resolved_source_urls", "unresolved_reasons", "final_disposition_status",
        "student_visibility", "role_task_reconciliation", "area_route_ids_reconciled",
        "area_route_labels_reconciled", "state", "approval_basis", "approval_reason",
        "role_task_relationship_verified", "checkpoint_placement_approved",
        "student_display_approved", "source_approval_rejected", "integration_disposition",
        "role_snapshot_reconciliation", "approval_status", "reconciliation_status",
        "learning_link_review", "content_link_repair_provenance", "original_unresolved_reasons",
    )
    return {field: record.get(field) for field in fields if field in record}


def add_edge(edges: list[dict[str, Any]], edge: dict[str, Any]) -> None:
    if not any(
        existing.get("source") == edge.get("source")
        and existing.get("target") == edge.get("target")
        and existing.get("relationship") == edge.get("relationship")
        for existing in edges
    ):
        edges.append(edge)


def build_learning_path_inventory(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> dict[str, Any]:
    """Create the full layered route manifest after all role items are integrated.

    This organizes existing reviewed inventory and dispositions; it does not
    change fit, approve claims, or make any item student-visible.
    """
    by_id = {node["id"]: node for node in nodes}
    domain_items = [node for node in nodes if node.get("kind") == "domain_learning_item"]
    area_items = [node for node in nodes if node.get("kind") == "area_enrichment_item"]
    roles = [node for node in nodes if node.get("kind") == "role"]
    role_items = [node for node in nodes if node.get("kind") == "role_item_candidate"]
    if len(domain_items) != 53 or len(area_items) != 144 or len(roles) != 19 or len(role_items) != 173:
        raise ValueError(
            "D078 guided-path inventory changed unexpectedly: "
            f"domain={len(domain_items)}, area={len(area_items)}, roles={len(roles)}, role_items={len(role_items)}"
        )

    shared = [node for node in domain_items if node.get("category") == "shared_foundation_for_research_routes"]
    boundary_notes = [node for node in domain_items if node.get("category") == "no_domain_wide_certification"]
    specialization_owned = [node for node in domain_items if str(node.get("category", "")).startswith("specialization_owned")]
    additional = [node for node in domain_items if node not in shared and node not in boundary_notes and node not in specialization_owned]
    if len(shared) + len(additional) + len(boundary_notes) + len(specialization_owned) != len(domain_items):
        raise ValueError("Domain item bands do not account for every D078 domain contract item")

    area_ids = sorted({node.get("area_id") for node in area_items if node.get("area_id")})
    area_nodes = [node for node in nodes if node.get("kind") == "area_of_specialization"]
    area_by_name = {str(node.get("label", "")).strip().casefold(): node for node in area_nodes}
    specialist_items_by_area: dict[str, list[str]] = {node["id"]: [] for node in area_nodes}
    specialization_owned_routes = []
    for item in specialization_owned:
        labels = item.get("areas") or []
        if not labels:
            raise ValueError(f"Area-owned domain inventory item has no owning area: {item['id']}")
        target_area_ids = []
        for label in labels:
            area = area_by_name.get(str(label).strip().casefold())
            if not area:
                raise ValueError(f"Area-owned domain item targets an unknown current area: {item['id']} -> {label}")
            specialist_items_by_area[area["id"]].append(item["id"])
            target_area_ids.append(area["id"])
        specialization_owned_routes.append({
            "item_node_id": item["id"],
            "label": item.get("label"),
            "item_type": item.get("item_type"),
            "area_node_ids": sorted(target_area_ids),
            "domain_category": item.get("category"),
            "render_location": "selected_area_layer_not_versatile_domain_foundation",
            "dedupe_by_item_identity_before_display": True,
            "student_visible": False,
        })
    area_branches = []
    for area_id in area_ids:
        area_node = next((node for node in area_nodes if node.get("area_id") == area_id), None)
        if not area_node:
            raise ValueError(f"Area enrichment has no matching current area node: {area_id}")
        items = [node for node in area_items if node.get("area_id") == area_id]
        resource_ready = [
            node for node in items
            if node.get("content_contract_closure", {}).get("evidence_sources")
            and node.get("content_contract_closure", {}).get("free_task_specific_learning_resources")
        ]
        area_branches.append({
            "area_node_id": area_node["id"],
            "area_id": area_id,
            "label": area_node.get("label"),
            "item_node_ids": sorted(node["id"] for node in items),
            "item_count": len(items),
            "specialization_owned_domain_item_node_ids": sorted(specialist_items_by_area.get(area_node["id"], [])),
            "specialization_owned_domain_item_count": len(specialist_items_by_area.get(area_node["id"], [])),
            "source_and_free_resource_bundle_count": len(resource_ready),
            "source_or_free_resource_gap_count": len(items) - len(resource_ready),
            "inherits_domain_layer_without_duplicate_requirements": True,
            "only_add_selected_area_items": True,
            "student_visible": False,
            "selection_approved": False,
        })
    if len(area_branches) != 7 or sum(branch["item_count"] for branch in area_branches) != 144:
        raise ValueError("All 144 area items must be assigned once across the seven current areas")

    route_edges = [edge for edge in edges if edge.get("relationship") == "reconciled_role_item_to_role"]
    role_item_ids_by_role: dict[str, set[str]] = {role["id"]: set() for role in roles}
    for edge in route_edges:
        if edge.get("source") in by_id and edge.get("target") in role_item_ids_by_role:
            role_item_ids_by_role[edge["target"]].add(edge["source"])
    role_branches = []
    for role in sorted(roles, key=lambda item: item.get("label", "")):
        item_ids = sorted(role_item_ids_by_role[role["id"]])
        assigned = [by_id[item_id] for item_id in item_ids]
        role_branches.append({
            "role_node_id": role["id"],
            "role_label": role.get("label"),
            "role_item_candidate_node_ids": [node["id"] for node in assigned if node.get("reconciliation_status") in {"approved_for_later_integration", "conditional_for_later_integration"}],
            "hidden_final_disposition_node_ids": [node["id"] for node in assigned if node.get("reconciliation_status") == "hidden"],
            "linked_record_count": len(assigned),
            "student_visible": False,
            "details_imported_only_when_role_selected": True,
        })
    routed_ids = {item_id for ids in role_item_ids_by_role.values() for item_id in ids}
    expected_routed_ids = {
        node["id"] for node in role_items
        if (node.get("role_item_reconciliation") or {}).get("role_snapshot_reconciliation", {}).get("current_area_routed_role_owners")
    }
    if routed_ids != expected_routed_ids:
        raise ValueError(
            "Every role-item record with a current area-routed owner must have a graph edge; "
            f"expected {len(expected_routed_ids)}, found {len(routed_ids)}"
        )

    return {
        "status": "complete_hidden_path_inventory_sequence_approved_release_gates_open",
        "programme_context_node_id": "programme:social-sciences:sociology",
        "fixed_programme_theme_node_ids": sorted(node["id"] for node in nodes if node.get("kind") == "programme_theme"),
        "shared_domain_node_id": "domain:D078",
        "ordered_layers": [
            {"layer": "programme_context", "node_id": "programme:social-sciences:sociology", "fixed_curriculum": True, "selectable": False},
            {"layer": "shared_domain_foundation", "node_id": "domain:D078", "selectable": "approved supplemental items only"},
            {"layer": "selected_area_of_specialization", "node_ids": sorted(node["id"] for node in nodes if node.get("kind") == "area_of_specialization"), "selection": "one or more"},
            {"layer": "optional_role", "selection": "zero or more; shown only when chosen"},
        ],
        "programme_domain_transition_edge_id": "sequence:programme-sociology-to-domain-d078",
        "domain_content_bands": {
            "most_versatile_foundation": {
                "item_node_ids": sorted(node["id"] for node in shared),
                "item_count": len(shared),
                "scope_note": "Shared across supported research routes, not every D078 area or role.",
            },
            "useful_additional_edge": {
                "item_node_ids": sorted(node["id"] for node in additional),
                "item_count": len(additional),
                "display_rule": "Route-relevant, optional or conditional items are explained in their use case; they are not universal requirements.",
            },
        },
        "area_owned_specialist_domain_inventory": {
            "item_routes": specialization_owned_routes,
            "unique_item_count": len(specialization_owned),
            "placement_rule": "Keep the inventory and provenance record; surface the item only within its evidenced owning area, not again as a shared domain requirement.",
        },
        "admin_boundary_notes_not_learning_steps": {
            "item_node_ids": sorted(node["id"] for node in boundary_notes),
            "item_count": len(boundary_notes),
        },
        "area_branches": area_branches,
        "role_branches": role_branches,
        "role_item_coverage": {
            "all_records_integrated": len(role_items),
            "approved_for_later_integration": sum(node.get("reconciliation_status") == "approved_for_later_integration" for node in role_items),
            "conditional_for_later_integration": sum(node.get("reconciliation_status") == "conditional_for_later_integration" for node in role_items),
            "hidden_final_disposition": sum(node.get("reconciliation_status") == "hidden" for node in role_items),
            "candidate_item_nodes_with_supported_role_edge": len(routed_ids),
            "optional_role_details_import_only_after_role_selection": True,
        },
        "branch_semantics": {
            "shared_domain_learning_is_inherited_once": True,
            "area_additions_are_only_added_for_selected_area": True,
            "role_additions_are_only_added_for_selected_role": True,
            "multiple_area_or_role_routes_keep_separate_stacks": True,
            "alternatives_do_not_stack_as_cumulative_requirements": True,
            "complements_are_grouped_only_when_evidence_supports_joint_use": True,
            "prerequisites_are_inspectable_and_never_silently_auto_added": True,
            "selection_is_focus_preference_not_mastery": True,
            "save_at_programme_domain_does_not_import_area_or_role_details": True,
        },
        "student_visible": False,
        "sequence_approved": True,
        "canonical_promotions": 0,
    }


def main() -> None:
    graph = load(GRAPH)
    handoff = load(HANDOFF)
    records = handoff.get("role_item_reconciliation", {}).get("records") or []
    if len(records) != 173 or len({r.get("queue_position") for r in records}) != 173:
        raise ValueError("The role-item handoff must contain 173 unique queue positions before integration")

    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    by_queue = {node.get("queue_position"): node for node in nodes if node.get("kind") == "role_item_candidate"}
    role_nodes = {
        str(node.get("label", "")).strip().casefold(): node
        for node in nodes if node.get("kind") == "role"
    }
    current_role_owner_keys = set(role_nodes)
    added_hidden_nodes: list[int] = []
    existing_integrated = 0
    hidden_count = 0
    unresolved_count = 0
    disposition_counts: Counter[str] = Counter()
    route_count = 0
    role_edge_count = 0
    bounded_task_verified_count = 0
    records_with_current_role_owner = 0

    for record in records:
        position = int(record["queue_position"])
        final_status = str(record.get("approval_status") or "unapproved")
        if final_status == "approved":
            disposition = (
                "conditional_for_later_integration"
                if record.get("placement_decision") in {"conditional", "conditional_route_candidate"}
                else "approved_for_later_integration"
            )
        else:
            disposition = "hidden"
        disposition_counts[disposition] += 1
        contract = selected_contract(record)
        node = by_queue.get(position)
        if node is None:
            node = {
                "id": f"role-item-reconciled:{position}:{slug(record.get('pair_key') or record.get('label'))}",
                "kind": "role_item_candidate",
                "item_type": "role_downstream_learning_item",
                "queue_position": position,
                "label": record.get("label") or record.get("pair_key"),
                "source_ledger": "D078_ROLE_ITEM_RECONCILIATION_AGENT_CHECKPOINT_2026_10_10",
                "programme_scope": "domain_enrichment_not_curriculum_transfer",
                "nigerian_scope": (record.get("approval_basis") or {}).get("nigerian_scope"),
            }
            nodes.append(node)
            by_queue[position] = node
            added_hidden_nodes.append(position)
        else:
            existing_integrated += 1

        node["role_item_reconciliation"] = contract
        node["reconciliation_status"] = disposition
        node["placement_decision"] = record.get("placement_decision")
        node["layer"] = record.get("final_layer") or record.get("candidate_layer_if_revalidated")
        node["area_route_ids_reconciled"] = record.get("area_route_ids_reconciled") or []
        node["student_visible"] = False
        node["approval"] = "role_item_contract_reconciled_hidden"
        node["role_fit_reopened"] = False
        node["canonical_promotion"] = False
        bounded_task_verified_count += bool(
            (record.get("approval_reason") or record.get("approval_basis") or {}).get("direct_task_output_evidence")
        )
        route_count += len(record.get("area_route_ids_reconciled") or [])
        if disposition == "hidden":
            hidden_count += 1
            # A final hidden disposition is intentionally excluded from the
            # learner route; it is not an unresolved student candidate when
            # the handoff records why it is withheld.  Keep genuinely
            # unclassified/missing-reason records as unresolved.
            reasons = record.get("unresolved_reasons")
            if not isinstance(reasons, list) or not any(str(reason).strip() for reason in reasons):
                unresolved_count += 1
        elif disposition not in {
            "approved_for_later_integration",
            "conditional_for_later_integration",
        }:
            unresolved_count += 1

        role_labels = (record.get("role_snapshot_reconciliation") or {}).get("current_area_routed_role_owners") or []
        if any(str(role_label).strip().casefold() in current_role_owner_keys for role_label in role_labels):
            records_with_current_role_owner += 1
        for role_label in role_labels:
            role = role_nodes.get(str(role_label).strip().casefold())
            if role:
                add_edge(edges, {
                    "source": node["id"],
                    "target": role["id"],
                    "relationship": "reconciled_role_item_to_role",
                    "status": "role_item_contract_candidate_hidden",
                    "queue_position": position,
                    "student_visible": False,
                    "role_fit_reopened": False,
                })
                role_edge_count += 1

    learning_path_design = build_learning_path_inventory(nodes, edges)
    full_path_sequence = graph.get("area_reconciliation", {}).get("relationship_graph", {}).get("full_path_sequence_design", {})
    if full_path_sequence.get("sequence_approved") is not True:
        raise ValueError("Cannot integrate the full learner path before the approved sequence design is present")
    if len(full_path_sequence.get("strict_learning_dependencies", [])) != 3:
        raise ValueError("Expected the three approved route-scoped dependencies in the sequence design")
    learning_path_design["sequence_approved"] = True
    learning_path_design["sequence_design_artifact"] = full_path_sequence.get("audit_artifact")
    closure = graph.get("area_reconciliation", {}).get("content_contract_closure", {})
    graph["status"] = "hidden_sequence_approved_item_promotion_and_ui_release_gates_open"
    graph["final_graph_ready"] = False
    graph["student_visible"] = False
    # Keep the release decision explicit in the graph itself.  The promotion
    # gate must not infer approval from a missing field, and hidden candidate
    # records must not be mistaken for student-ready content.
    graph["content_contracts_approved"] = False
    graph["student_facing_approval"] = False
    graph["learning_path_design"] = learning_path_design
    graph["hidden_final_disposition_items"] = hidden_count
    graph["unresolved_student_items"] = unresolved_count
    graph["nodes"] = nodes
    graph["edges"] = edges
    graph.setdefault("source_artifacts", [])
    handoff_path = str(HANDOFF.relative_to(ROOT)).replace("\\", "/")
    if handoff_path not in graph["source_artifacts"]:
        graph["source_artifacts"].append(handoff_path)
    # The graph builder intentionally emits a fresh graph without the later
    # handoff namespace.  Initialise it here so integration is idempotent after
    # a graph rebuild as well as after a repeated handoff run.
    graph.setdefault("role_route_reconciliation", {})
    graph["role_route_reconciliation"]["role_item_reconciliation"] = {
        "status": "integrated_hidden_handoff_complete",
        "input_records": 173,
        "approved_for_later_integration": disposition_counts.get("approved_for_later_integration", 0),
        "conditional_for_later_integration": disposition_counts.get("conditional_for_later_integration", 0),
        "route_candidate_records_in_rebuilt_graph": (
            disposition_counts.get("approved_for_later_integration", 0)
            + disposition_counts.get("conditional_for_later_integration", 0)
        ),
        "hidden_with_final_reason": hidden_count,
        "unresolved_student_items": unresolved_count,
        "bounded_task_verified": bounded_task_verified_count,
        "current_area_routes": records_with_current_role_owner,
        "existing_graph_nodes_integrated": existing_integrated,
        "hidden_nodes_added": len(added_hidden_nodes),
        "reconciled_area_route_references": route_count,
        "reconciled_role_edges_added_or_existing": role_edge_count,
        "student_visible": False,
        "role_fit_reopened": False,
        "subject_matcher_modified": False,
        "integration_scope_note": (
            "Approved and conditional handoff records are already represented in the rebuilt graph as route candidates; "
            "their later learning-path placement/review is part of this design pass. Final-hidden records remain "
            "internal disposition nodes and are not learner-path items."
        ),
    }
    graph["validation"]["role_item_source_records"] = len(records)
    graph["validation"]["approved_role_item_records"] = disposition_counts.get("approved_for_later_integration", 0)
    graph["validation"]["conditional_role_item_records"] = disposition_counts.get("conditional_for_later_integration", 0)
    graph["validation"]["hidden_role_item_records"] = hidden_count
    graph["validation"]["role_item_nodes"] = len(records)
    graph["validation"]["role_item_reconciliation_integrated"] = True
    graph["validation"]["role_item_reconciliation_all_173_processed"] = True
    graph["validation"]["guided_path_domain_items_accounted"] = sum(
        band["item_count"] for band in learning_path_design["domain_content_bands"].values()
    ) + learning_path_design["area_owned_specialist_domain_inventory"]["unique_item_count"] + learning_path_design["admin_boundary_notes_not_learning_steps"]["item_count"]
    graph["validation"]["guided_path_area_items_accounted"] = sum(
        branch["item_count"] for branch in learning_path_design["area_branches"]
    )
    graph["validation"]["guided_path_role_branches"] = len(learning_path_design["role_branches"])
    graph["validation"]["guided_path_role_item_records"] = learning_path_design["role_item_coverage"]["all_records_integrated"]
    graph["validation"]["total_nodes"] = len(nodes)
    graph["validation"]["total_edges"] = len(edges)
    graph["validation"]["relationship_counts"] = dict(Counter(
        str(edge.get("relationship") or "unknown") for edge in edges
    ))
    graph["validation"]["all_student_visible"] = any(
        bool(node.get("student_visible")) for node in nodes
    )
    graph["graph_scope_note"] = "The hidden graph includes the locally closed 53 domain items, 144 area candidates, the completed 173-record role-item reconciliation handoff, and the approved full-path sequence design. Item-level promotion, rendered UI verification, student visibility and canonical promotion remain separate open gates. Role-fit adjudication and the subject matcher were not reopened."
    GRAPH.write_text(json.dumps(graph, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    result = {
        "schema_version": "2026-10-15.d078.role-item-reconciliation-integration.v2",
        "reviewed_on": str(date.today()),
        "status": "integrated_hidden_handoff_sequence_and_ui_gates_open",
        "counts": {
            "input_records": 173,
            "approved_for_later_integration": disposition_counts.get("approved_for_later_integration", 0),
            "conditional_for_later_integration": disposition_counts.get("conditional_for_later_integration", 0),
            "route_candidate_records_in_rebuilt_graph": (
                disposition_counts.get("approved_for_later_integration", 0)
                + disposition_counts.get("conditional_for_later_integration", 0)
            ),
            "hidden_with_final_reason": hidden_count,
            "unresolved_student_items": unresolved_count,
            "bounded_task_verified": bounded_task_verified_count,
            "with_current_area_route": records_with_current_role_owner,
            "existing_graph_nodes_integrated": existing_integrated,
            "hidden_nodes_added": len(added_hidden_nodes),
            "hidden_node_queue_positions_added": added_hidden_nodes,
            "role_edges_added_or_existing": sum(
                edge.get("relationship") == "reconciled_role_item_to_role" for edge in edges
            ),
            "role_item_records_with_role_edges": len({
                edge.get("source") for edge in edges
                if edge.get("relationship") == "reconciled_role_item_to_role"
            }),
            "total_graph_nodes": len(nodes),
            "total_graph_edges": len(edges),
            "area_relationship_candidate_edges": graph.get("area_reconciliation", {}).get("relationship_graph", {}).get("area_item_relationship_edges", 0),
            "student_visible": 0,
        },
        "domain_area_closure": closure,
        "guardrails": {
            "role_fit_reopened": False,
            "taxonomy_changed": False,
            "subject_matcher_modified": False,
            "canonical_changes": False,
            "student_visible": False,
        },
        "next_step": "Run one integrated programme-domain-area-role implementation verification, then proceed to the guided UI/UX sequence gates; do not restart role-fit adjudication.",
    }
    OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "\n".join([
            "# D078 Role-Item Reconciliation Integration",
            "",
            "The completed agent handoff is integrated into the hidden programme-to-role graph. This is not a new role-fit audit.",
            "",
            f"- Records integrated: **{result['counts']['input_records']} / 173**.",
            f"- Approved route candidates already in the rebuilt graph: **{result['counts']['approved_for_later_integration']}**.",
            f"- Conditional route candidates already in the rebuilt graph: **{result['counts']['conditional_for_later_integration']}**.",
            f"- Approved + conditional route candidates included in graph design: **{result['counts']['route_candidate_records_in_rebuilt_graph']}**.",
            f"- Hidden with final reasons: **{result['counts']['hidden_with_final_reason']}**.",
            f"- Unresolved student candidates (missing/invalid disposition or hidden reason): **{result['counts']['unresolved_student_items']}**.",
            f"- Bounded task contracts verified: **{result['counts']['bounded_task_verified']}**.",
            f"- Records attached to at least one current, graph-routed role: **{result['counts']['with_current_area_route']}**.",
            f"- Unique role-item-to-role relationships represented: **{result['counts']['role_edges_added_or_existing']}** across **{result['counts']['role_item_records_with_role_edges']}** role-item records.",
            f"- Student-visible promotions: **{result['counts']['student_visible']}**.",
            "",
            "Each role-item graph node retains the reconciled task/output, programme/domain/area/role context, placement rationale, prerequisites, complements, alternatives, limitations, source locators and learning-link disposition. Edges connect each record only to its currently routed role owners; role selection remains the point at which those role details enter a saved plan. Final-hidden records remain separated from learner-path candidates. Role/domain/area fit, taxonomy and the subject matcher were not reopened or modified. Nigerian context is additive; global evidence remains valid. The graph stays an internal audit/design artifact, not a student screen.",
            "",
            "Next: run one integrated programme → domain → area → role verification and continue the guided implementation. Do not return to role-fit adjudication.",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(result["counts"], indent=2))


if __name__ == "__main__":
    main()
