"""Rebuild the D078 path graph with the already-researched area tool options.

The base graph remains available for comparison. Added tool-support edges are
informational only; they do not create or change learning prerequisites.
"""

from __future__ import annotations

import json
import gzip
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
SOURCE = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json"
OUTPUT = SOURCE
CHECKPOINT = "docs/manual-review/D078_SPARSE_AREA_TASK_LINKED_TOOL_ENRICHMENT_2026_10_15.md"
sys.path.insert(0, str(ROOT / "backend"))
from d078_guided_content import d078_guided_content  # noqa: E402
sys.path.insert(0, str(ROOT / "data" / "career-mapping"))
from _build_d078_role_item_contract_seed_2026_10_15 import (  # noqa: E402
    records as role_contract_records,
    student_display_gate,
)


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def main() -> None:
    graph: dict[str, Any] = json.loads(SOURCE.read_text(encoding="utf-8-sig"))
    runtime = d078_guided_content()
    option_ids = {
        "D078-HG-TOOL-GEODA", "D078-HG-TOOL-GEOPANDAS", "D078-HG-TOOL-PYSAL-ESDA",
        "D078-HG-TOOL-ARCGIS-SPATIAL-ANALYST", "D078-A04-TOOL-NVIVO",
        "D078-A04-TOOL-TAGUETTE", "D078-A04-TOOL-R", "D078-A04-TOOL-PYTHON",
        "D078-A04-TOOL-SPSS", "D078-A04-TOOL-STATA", "D078-A04-TOOL-LIMESURVEY",
        "D078-A04-TOOL-PSYTOOLKIT", "D078-A04-TOOL-PSYCHOPY", "D078-A04-TOOL-OPENSESAME",
    }
    options = [
        item
        for rows in runtime["areaItems"].values()
        for item in rows
        if item.get("itemKey") in option_ids
    ]
    if {item["itemKey"] for item in options} != option_ids:
        raise ValueError("The reviewed tool-option set is incomplete or contains duplicate item identities")

    nodes = graph.setdefault("nodes", [])
    edges = graph.setdefault("edges", [])
    existing_nodes = {node.get("id"): node for node in nodes}
    existing_node_ids = set(existing_nodes)
    area_nodes = {
        node.get("area_id"): node
        for node in nodes
        if node.get("kind") == "area_of_specialization" and node.get("area_id")
    }
    task_nodes = {
        node.get("item_id"): node
        for node in nodes
        if node.get("kind") == "area_enrichment_item" and node.get("item_id")
    }
    new_nodes = []
    new_edges = []
    for item in options:
        node_id = f"area_tool_option:{slug(item['itemKey'])}"
        area_id = item["contextKey"]
        area = area_nodes.get(area_id)
        task_id = item.get("useCaseKey")
        task = task_nodes.get(task_id)
        if not area or not task:
            raise ValueError(f"Missing canonical area or task graph node for {item['itemKey']}: {area_id} / {task_id}")
        proposed_node = {
            "id": node_id,
            "kind": "area_tool_option",
            "item_id": item["itemKey"],
            "label": item["name"],
            "item_type": "tool",
            "area_id": area_id,
            "student_visible": False,
            "approval": "approved_scoped_area_tool_option",
            "approval_status": "approved",
            "approval_reason": "Local disposition from the existing 2026-10-15 task-linked research checkpoint; individual source, task, learning link, limits and optional scope are carried in the runtime contract.",
            "sequence_approved": False,
            "source_artifacts": [CHECKPOINT, "backend/d078_guided_content.py"],
            "source_record": item,
        }
        existing = existing_nodes.get(node_id)
        if existing:
            if existing.get("source_record") != item:
                raise ValueError(f"Tool graph node conflicts with current reviewed contract: {item['itemKey']}")
        else:
            new_nodes.append(proposed_node)
            existing_nodes[node_id] = proposed_node
        refs = [ref["url"] for ref in item.get("sourceReferences", []) if str(ref.get("url") or "").startswith("https://")]
        new_edges.extend([
            {
                "id": f"area_to_tool_option:{slug(area_id)}:{slug(item['itemKey'])}",
                "source": area["id"], "target": node_id,
                "relationship": "area_to_tool_option", "status": "approved_content_scope",
                "sequence_approved": False, "source_refs": refs,
                "rationale": f"This optional tool supports a bounded task in {area.get('label') or area_id}.",
            },
            {
                "id": f"task_to_tool_option:{slug(task_id)}:{slug(item['itemKey'])}",
                "source": task["id"], "target": node_id,
                "relationship": "supports", "status": "approved_non_sequence_support",
                "sequence_approved": False, "source_refs": refs,
                "rationale": item["contextualUse"],
            },
        ])
        for relationship in item.get("relationships", []):
            target_id = relationship.get("toItemKey")
            if target_id not in option_ids:
                continue
            new_edges.append({
                "id": f"area_tool_relationship:{slug(item['itemKey'])}:{slug(target_id)}:{relationship['relationshipType']}",
                "source": node_id, "target": f"area_tool_option:{slug(target_id)}",
                "relationship": relationship["relationshipType"],
                "status": "approved_non_sequence_relationship",
                "sequence_approved": False,
                "source_refs": [ref["url"] for ref in relationship.get("sourceReferences", []) if str(ref.get("url") or "").startswith("https://")],
                "learner_explanation": relationship.get("learnerExplanation"),
            })

    # Carry an area-owned tool into role detail only as an area-route display
    # relationship. This records the UI path, not a claim that the role itself
    # requires or routinely uses the tool.
    role_nodes = {node.get("id"): node for node in nodes if node.get("kind") == "role" and node.get("domain_id") == "D078"}
    area_to_role = [edge for edge in edges if edge.get("relationship") == "area_to_role"]
    for item in options:
        tool_node_id = f"area_tool_option:{slug(item['itemKey'])}"
        area_node_id = area_nodes[item["contextKey"]]["id"]
        for route_edge in area_to_role:
            if route_edge.get("source") != area_node_id or route_edge.get("target") not in role_nodes:
                continue
            role_node = role_nodes[route_edge["target"]]
            new_edges.append({
                "id": f"area_tool_option_role_view:{slug(item['itemKey'])}:{slug(role_node['id'])}",
                "source": tool_node_id,
                "target": role_node["id"],
                "relationship": "area_tool_option_carried_into_role_view",
                "status": "selected_area_route_display_only",
                "student_visible": False,
                "sequence_approved": False,
                "display_only": True,
                "selected_area_id": item["contextKey"],
                "source_refs": [ref["url"] for ref in item.get("sourceReferences", []) if str(ref.get("url") or "").startswith("https://")],
                "rationale": (
                    f"The UI may show this optional {area_nodes[item['contextKey']].get('label') or 'area'}-owned tool while the learner views {role_node.get('label')} through this selected area. "
                    "This records display inheritance only; it does not claim the role requires or routinely uses the tool."
                ),
            })

    nodes.extend(new_nodes)
    edge_ids = {edge.get("id") for edge in edges}
    for edge in new_edges:
        edge_id = edge.get("id")
        if edge_id not in edge_ids:
            edges.append(edge)
            edge_ids.add(edge_id)
    # Keep the former group rows for audit, but make clear that the distinct
    # cards now replace them in the learner experience.
    for node in nodes:
        if node.get("item_id") in {"D078-A04-tool-nvivo-tagging", "D078-A04-tools-quantitative-alternatives"}:
            node["approval"] = "superseded_by_individual_area_tool_options"
            node["student_visible"] = False
            node["superseded_by"] = [item["itemKey"] for item in options if item["contextKey"] == "D078:psychology-social-behaviour"]

    # Refresh the graph's role-item dispositions from the current master
    # reconciliation. Historical false flags are retained only as audit data;
    # current item-card eligibility is recomputed by the same gate as the SQL
    # contract builder. Global release remains explicitly off.
    contract_rows = role_contract_records()
    role_item_nodes = {
        int(node["queue_position"]): node
        for node in nodes
        if node.get("kind") == "role_item_candidate" and node.get("queue_position") is not None
    }
    contract_positions = {int(row["queue_position"]) for row, _ in contract_rows}
    approved_positions = {
        int(row["queue_position"])
        for row, _ in contract_rows
        if row.get("approval_status") == "approved"
    }
    unapproved_positions = contract_positions - approved_positions
    if len(contract_rows) != 173:
        raise ValueError(f"Expected 173 role-item source dispositions; got {len(contract_rows)}")
    if set(role_item_nodes) != contract_positions:
        raise ValueError(
            "Graph role-item audit nodes must match all final source dispositions; "
            f"missing={len(contract_positions - set(role_item_nodes))}, "
            f"unexpected={len(set(role_item_nodes) - contract_positions)}, "
            f"final unapproved dispositions remain audit-only={sorted(unapproved_positions)}"
        )

    display_reason_counts: dict[str, int] = {}
    approved_count = 0
    unapproved_count = 0
    display_eligible_count = 0
    for record, owners in contract_rows:
        current_approval = record["approval_status"]
        node = role_item_nodes.get(int(record["queue_position"]))
        if node is None:
            raise ValueError(f"Final role-item disposition has no graph audit node: {record['queue_position']}")
        eligible, eligibility_reason = student_display_gate(record, owners)
        approved_count += current_approval == "approved"
        unapproved_count += current_approval == "unapproved"
        display_eligible_count += eligible
        display_reason_counts[eligibility_reason] = display_reason_counts.get(eligibility_reason, 0) + 1

        nested = node.setdefault("role_item_reconciliation", {})
        for field in (
            "approval_status", "approval_reason", "student_visibility", "state",
            "placement_decision", "final_layer", "learning_link_review",
            "role_snapshot_reconciliation",
        ):
            if field in record:
                nested[field] = record[field]
        historical_flags = nested.setdefault("historical_gate_values", {})
        for field in ("student_display_approved", "student_visibility", "role_task_relationship_verified"):
            if field in record:
                historical_flags[field] = record[field]
        nested["historical_gate_values_are_audit_only"] = True
        nested.pop("role_task_relationship_verified", None)
        nested["student_display_approved"] = eligible
        nested["student_display_eligibility_reason"] = eligibility_reason

        node["approval_status"] = current_approval
        node["approval_reason"] = record.get("approval_reason")
        node["student_display_approved"] = eligible
        node["student_display_eligibility_reason"] = eligibility_reason
        node["approval"] = (
            "approved_role_item_contract_hidden_pending_global_release"
            if current_approval == "approved"
            else "unapproved_role_item_contract_hidden"
        )
        node["reconciliation_status"] = (
            "hidden" if current_approval == "unapproved"
            else "conditional_for_later_integration"
            if record.get("placement_decision") in {"conditional", "conditional_route_candidate"}
            else "approved_for_later_integration"
        )
        node["student_visible"] = False
        node["canonical_promotion"] = False

    role_id_by_label = {
        str(node.get("label") or "").strip().casefold(): node["id"]
        for node in nodes if node.get("kind") == "role"
    }
    expected_route_edges = {
        (int(record["queue_position"]), role_id_by_label[str(owner).strip().casefold()])
        for record, _ in contract_rows
        if record.get("approval_status") == "approved"
        for owner in (record.get("role_snapshot_reconciliation", {}).get("current_area_routed_role_owners") or [])
        if str(owner).strip().casefold() in role_id_by_label
    }
    actual_route_edges = {
        (int(edge["queue_position"]), edge["target"])
        for edge in edges
        if edge.get("relationship") == "reconciled_role_item_to_role"
    }
    if expected_route_edges != actual_route_edges:
        raise ValueError(
            "Reconciled role-owner edges differ from the current master ledger: "
            f"missing={len(expected_route_edges - actual_route_edges)}, "
            f"unexpected={len(actual_route_edges - expected_route_edges)}"
        )
    if (approved_count, unapproved_count, display_eligible_count, len(actual_route_edges)) != (171, 2, 166, 224):
        raise ValueError(
            "Unexpected current role-item disposition totals: "
            f"approved={approved_count}, unapproved={unapproved_count}, "
            f"display_eligible={display_eligible_count}, role_edges={len(actual_route_edges)}"
        )
    role_item_coverage = graph.setdefault("learning_path_design", {}).setdefault("role_item_coverage", {})
    for obsolete_key in (
        "approved_for_later_integration",
        "conditional_for_later_integration",
        "hidden_final_disposition",
    ):
        role_item_coverage.pop(obsolete_key, None)
    role_item_coverage.update({
        "all_records_integrated": len(contract_rows),
        "approved_dispositions": approved_count,
        "approved_direct_placements": sum(
            record.get("approval_status") == "approved"
            and record.get("placement_decision") not in {"conditional", "conditional_route_candidate"}
            for record, _ in contract_rows
        ),
        "approved_conditional_placements": sum(
            record.get("approval_status") == "approved"
            and record.get("placement_decision") in {"conditional", "conditional_route_candidate"}
            for record, _ in contract_rows
        ),
        "unapproved_final_dispositions": unapproved_count,
        "unapproved_final_disposition_positions": sorted(unapproved_positions),
        "individually_card_eligible": display_eligible_count,
        "candidate_item_nodes_with_supported_role_edge": len({position for position, _ in actual_route_edges}),
        "optional_role_details_import_only_after_role_selection": True,
        "student_visible": False,
    })

    # Re-running the integration is a normal audit/rebuild operation. Keep its
    # version marker idempotent instead of appending the same suffix forever.
    schema_version = str(graph.get("schema_version", "d078-learning-path"))
    schema_version = re.sub(r"(?:\+area-tools-2026-10-15)+$", "", schema_version)
    graph["schema_version"] = f"{schema_version}+area-tools-2026-10-15"
    graph["source_artifacts"] = list(dict.fromkeys([*graph.get("source_artifacts", []), CHECKPOINT]))
    graph["area_tool_option_integration"] = {
        "source_checkpoint": CHECKPOINT,
        # Keep the historical key for consumers, but report integrated content
        # totals rather than only the delta from this particular script run.
        "added_item_count": len(options),
        "integrated_item_count": len(options),
        "integrated_edge_count": sum(
            edge.get("id", "").startswith(("area_to_tool_option:", "task_to_tool_option:", "area_tool_relationship:", "area_tool_option_role_view:"))
            for edge in edges
        ),
        "added_edge_count": len(new_edges),
        "selected_area_role_view_edges_added": sum(edge.get("relationship") == "area_tool_option_carried_into_role_view" for edge in new_edges),
        "selected_area_role_view_edges_are_display_only": all(edge.get("display_only") is True for edge in new_edges if edge.get("relationship") == "area_tool_option_carried_into_role_view"),
        "items": [item["itemKey"] for item in options],
        "all_added_edges_are_non_sequencing": all(edge.get("sequence_approved") is False for edge in new_edges),
        "existing_sequence_edges_changed": False,
        "area_count_unchanged": 7,
        "student_release_status": "not_granted_by_this_audit_graph",
    }
    graph["validation"] = {
        **(graph.get("validation") or {}),
        "area_tool_option_nodes_added": len(new_nodes),
        "area_tool_option_nodes_total": sum(node.get("kind") == "area_tool_option" for node in nodes),
        "area_tool_option_support_edges_added": sum(
            edge.get("id", "").startswith(("area_to_tool_option:", "task_to_tool_option:", "area_tool_relationship:", "area_tool_option_role_view:"))
            for edge in edges
        ),
        "all_new_edges_non_sequencing": all(edge.get("sequence_approved") is False for edge in new_edges),
        "canonical_area_count_remains_seven": len(area_nodes) == 7,
        "role_item_source_records": len(contract_rows),
        "approved_role_item_records": approved_count,
        "hidden_role_item_records_excluded": unapproved_count,
        "unapproved_role_item_positions_retained_as_hidden_audit_nodes": sorted(unapproved_positions),
        "role_item_current_card_eligible_records": display_eligible_count,
        "role_item_current_card_ineligible_reason_counts": display_reason_counts,
        "reconciled_role_item_owner_edges": len(actual_route_edges),
        "role_item_owner_edges_match_current_master": True,
        "role_item_nodes_remain_globally_hidden": all(not node.get("student_visible") for node in role_item_nodes.values()),
        "historical_role_item_gate_flags_are_non_blocking_audit_only": True,
    }
    payload = (json.dumps(graph, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    OUTPUT.write_bytes(payload)
    stable_json = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
    stable_json.write_bytes(payload)
    stable_gzip = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json.gz"
    with stable_gzip.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, compresslevel=9, mtime=0) as compressed:
            compressed.write(payload)
    print(f"Wrote {OUTPUT}: +{len(new_nodes)} area tool nodes, +{len(new_edges)} non-sequencing edges")
    print(
        f"Role disposition refreshed: approved={approved_count}, unapproved={unapproved_count}, "
        f"card_eligible={display_eligible_count}, owner_edges={len(actual_route_edges)}; "
        "global student visibility remains false"
    )


if __name__ == "__main__":
    main()
