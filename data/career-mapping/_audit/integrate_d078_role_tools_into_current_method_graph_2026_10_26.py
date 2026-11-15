"""Integrate the reviewed role-tool contract into the current D078 method graph.

Role tool options remain optional task supports. This does not create learning
prerequisites, alter role/area membership, or approve the global student gate.
"""
from __future__ import annotations

import gzip
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
NODE_REFERENCE_GRAPH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json.gz"
CONTRACT = ROOT / "data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json"
SOURCE_ARTIFACT = CONTRACT.name
DATE = "2026-10-26"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def load_json(path: Path) -> dict[str, Any]:
    if path.suffix == ".gz":
        with gzip.open(path, "rt", encoding="utf-8") as stream:
            return json.load(stream)
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main() -> None:
    graph = load_json(GRAPH)
    reference_graph = load_json(NODE_REFERENCE_GRAPH)
    contract = load_json(CONTRACT)
    nodes = graph.setdefault("nodes", [])
    edges = graph.setdefault("edges", [])
    nodes[:] = [node for node in nodes if not (
        node.get("role_tool_generated")
        or (node.get("role_tool_source_artifact") == SOURCE_ARTIFACT and (
            node.get("kind") == "role_task_context" or str(node.get("id", "")).startswith("role-tool:")
        ))
    )]
    for node in nodes:
        node.pop("role_tool_source_artifact", None)
    edges[:] = [edge for edge in edges if edge.get("role_tool_source_artifact") != SOURCE_ARTIFACT]
    by_id = {str(node.get("id")): node for node in nodes}
    # Recover only IDs that current route/edge contracts already reference.
    # Their canonical node records remain in the pre-method-graph source graph;
    # this repairs prior accidental omission without importing its old routes.
    referenced: set[str] = set()
    array_fields = (
        "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
        "domain_downstream_item_ids", "tool_ids", "domain_tool_ids",
        "explanatory_item_ids", "task_family_ids", "role_item_ids",
        "method_specific_role_item_ids", "role_ids", "role_route_ids",
    )
    for collection in ("method_area_routes", "method_area_role_routes", "combination_area_routes", "combination_area_role_routes"):
        for route in graph.get(collection, []):
            for field in array_fields:
                referenced.update(str(value) for value in route.get(field, []))
    for design in graph.get("combination_designs", []):
        referenced.add(str(design.get("id")))
        for route in design.get("area_routes", []):
            for field in array_fields:
                referenced.update(str(value) for value in route.get(field, []))
            for contribution in route.get("method_contributions", []):
                for field in array_fields:
                    referenced.update(str(value) for value in contribution.get(field, []))
    missing_refs = referenced - set(by_id)
    reference_nodes = {str(node.get("id")): node for node in reference_graph.get("nodes", [])}
    unrecoverable = sorted(missing_refs - set(reference_nodes))
    if unrecoverable:
        raise SystemExit(f"Referenced graph nodes cannot be recovered from the retained source graph: {unrecoverable[:20]}")
    recovered_ids = sorted(missing_refs)
    for node_id in recovered_ids:
        node = dict(reference_nodes[node_id])
        nodes.append(node)
        by_id[node_id] = node
    role_ids = {str(node.get("id")) for node in nodes if node.get("kind") == "role" and node.get("domain_id") == "D078"}
    area_keys = {
        str(node["id"]): str(node.get("area_id"))
        for node in nodes if node.get("kind") == "area_of_specialization" and node.get("area_id")
    }
    if len(role_ids) != 19:
        raise SystemExit(f"Expected 19 D078 role nodes in current graph; found {len(role_ids)}")

    canonical_to_node: dict[str, str] = {}
    for node in nodes:
        canonical = node.get("canonical_tool_id")
        if canonical:
            canonical_to_node.setdefault(str(canonical), str(node["id"]))

    routes = contract.get("routes", [])
    if len(routes) != 95:
        raise SystemExit(f"Expected 95 reviewed role-tool contracts; found {len(routes)}")
    per_role: dict[str, set[str]] = {}
    task_nodes: dict[str, dict[str, Any]] = {}
    ui_routes: list[dict[str, Any]] = []
    for route in routes:
        role_id = str(route["role_id"])
        if role_id not in role_ids:
            raise SystemExit(f"Role-tool contract references unknown D078 role: {role_id}")
        canonical = str(route["canonical_tool_id"])
        tool_node_id = canonical_to_node.get(canonical)
        if not tool_node_id:
            source_id = route.get("source_graph_node_id")
            source_node = by_id.get(str(source_id)) if source_id else None
            if source_node:
                tool_node_id = str(source_node["id"])
                source_node["canonical_tool_id"] = canonical
            else:
                tool_node_id = f"role-tool:{slug(canonical)}"
                tool_node = {
                    "id": tool_node_id,
                    "kind": "tool",
                    "item_type": "tool",
                    "canonical_tool_id": canonical,
                    "label": route["name"],
                    "meaning": route["plain_meaning"],
                    "official_reference": route.get("official_reference"),
                    "source_refs": [ref.get("url") for ref in route.get("source_references", []) if ref.get("url")],
                    "student_visible": True,
                    "approval": "approved_optional_tool_identity",
                    "sequence_approved": False,
                    "role_tool_source_artifact": SOURCE_ARTIFACT,
                    "role_tool_generated": True,
                }
                nodes.append(tool_node)
                by_id[tool_node_id] = tool_node
            canonical_to_node[canonical] = tool_node_id

        per_role.setdefault(role_id, set()).add(canonical)
        task_id = str(route["task_node_id"])
        task_node = task_nodes.setdefault(task_id, {
            "id": task_id,
            "kind": "role_task_context",
            "domain_id": "D078",
            "role_id": role_id,
            "label": route["relationships"][0]["target"],
            "description": "A bounded example of work this role may do. The tool links explain possible task support; they are not requirements for entering the role.",
            "source_refs": [ref.get("url") for ref in route.get("role_task_evidence", []) if ref.get("url")],
            "student_visible": True,
            "sequence_approved": False,
            "role_tool_source_artifact": SOURCE_ARTIFACT,
            "role_tool_generated": True,
        })
        ui_routes.append({
            "id": str(route["id"]),
            "role_id": role_id,
            "tool_node_id": tool_node_id,
            "canonical_tool_id": canonical,
            "area_ids": [area_keys.get(str(area_id), str(area_id)) for area_id in route.get("area_ids", [])],
            "task_node_id": task_id,
            "name": route["name"],
            "contextual_use": route["contextual_use"],
            "expected_output": route["expected_output"],
            "requirement_level": "optional",
            "requirement_lane": "useful_optional_edge",
            "prerequisites": list(route.get("prerequisites", [])),
            "alternatives": list(route.get("alternatives", [])),
            "limitations": list(route.get("limitations", [])),
            "official_reference": route.get("official_reference"),
            "learning_resource": route.get("learning_resource"),
            "source_references": list(route.get("source_references", [])),
            "source_locators": list(route.get("source_locators", [])),
        })

        provenance = [ref.get("url") for ref in route.get("source_references", []) if ref.get("url")]
        edge_id = f"role-tool-option:{slug(role_id)}:{slug(canonical)}"
        edges.append({
            "id": edge_id,
            "source": role_id,
            "target": tool_node_id,
            "relationship": "role_to_tool_option",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "sequence_approved": False,
            "requirement_lane": "useful_optional_edge",
            "source_refs": provenance,
            "route_context": route,
            "rationale": route["contextual_use"],
            "role_tool_source_artifact": SOURCE_ARTIFACT,
        })
        edges.append({
            "id": f"role-tool-support:{slug(role_id)}:{slug(canonical)}",
            "source": tool_node_id,
            "target": task_id,
            "relationship": "tool_supports_role_task",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "sequence_approved": False,
            "requirement_lane": "useful_optional_edge",
            "source_refs": provenance,
            "rationale": route["contextual_use"],
            "role_tool_source_artifact": SOURCE_ARTIFACT,
        })

    nodes.extend(task_nodes.values())
    relationship_counts: dict[str, int] = {"tool_supports_role_task": 0, "tool_alternative_for_role_task": 0}
    for route in routes:
        source_id = canonical_to_node[str(route["canonical_tool_id"])]
        for relation in route.get("relationships", []):
            if relation.get("type") != "alternative_to":
                continue
            target_id = canonical_to_node.get(str(relation.get("target_id")))
            if not target_id:
                raise SystemExit(f"Alternative tool identity is unresolved: {relation}")
            edges.append({
                "id": f"role-tool-alternative:{slug(route['role_id'])}:{slug(route['canonical_tool_id'])}:{slug(relation['target_id'])}",
                "source": source_id,
                "target": target_id,
                "relationship": "tool_alternative_for_role_task",
                "status": "resolved_ready_for_use",
                "student_visible": True,
                "sequence_approved": False,
                "requirement_lane": "useful_optional_edge",
                "source_refs": [ref.get("url") for ref in route.get("source_references", []) if ref.get("url")],
                "route_context": route,
                "rationale": relation.get("explanation"),
                "role_tool_source_artifact": SOURCE_ARTIFACT,
            })
            relationship_counts["tool_alternative_for_role_task"] += 1

    relationship_counts["tool_supports_role_task"] = len(routes)
    if len(per_role) != 19 or any(len(values) < 5 for values in per_role.values()):
        raise SystemExit("Role-tool coverage must include all 19 roles and at least five reviewed options per role")
    graph["role_tool_integration"] = {
        "source_artifact": SOURCE_ARTIFACT,
        "date": DATE,
        "role_count": len(per_role),
        "role_tool_route_count": len(routes),
        "distinct_canonical_tools": len(canonical_to_node),
        "minimum_distinct_tool_choices_per_role": min(len(values) for values in per_role.values()),
        "maximum_distinct_tool_choices_per_role": max(len(values) for values in per_role.values()),
        "role_task_context_nodes": len(task_nodes),
        "explicit_relationship_edges": relationship_counts,
        "sequence_effect": "none; all role-tool options are optional and create no prerequisite edges",
        "deduplication": "Canonical tool identities are shared; role-specific use and task fit remain in each contextual relationship.",
        "student_visible_global_gate_changed": False,
        "recovered_referenced_nodes_from_retained_source_graph": len(recovered_ids),
    }
    graph["role_tool_routes"] = ui_routes
    graph.setdefault("source_artifacts", [])
    source_path = "data/career-mapping/_audit/" + SOURCE_ARTIFACT
    if source_path not in graph["source_artifacts"]:
        graph["source_artifacts"].append(source_path)
    graph.setdefault("validation", {})["role_tool_route_edges"] = len(routes)
    graph["validation"]["role_tool_task_support_edges"] = relationship_counts["tool_supports_role_task"]
    graph["validation"]["role_tool_alternative_edges"] = relationship_counts["tool_alternative_for_role_task"]
    graph["validation"]["role_tool_distinct_canonical_tools"] = len(canonical_to_node)
    graph["validation"]["total_nodes"] = len(nodes)
    graph["validation"]["total_edges"] = len(edges)

    temp = GRAPH.with_name(GRAPH.name + ".tmp")
    with gzip.open(temp, "wt", encoding="utf-8", compresslevel=9, newline="\n") as stream:
        json.dump(graph, stream, ensure_ascii=False, separators=(",", ":"))
        stream.write("\n")
    temp.replace(GRAPH)
    print(json.dumps(graph["role_tool_integration"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
