"""Integrate approved, optional role-tool route contracts into the D078 graph."""
from __future__ import annotations
import gzip, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
CONTRACT = AUDIT / "D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json"

def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8-sig"))
    contract = json.loads(CONTRACT.read_text(encoding="utf-8-sig"))
    nodes = graph.setdefault("nodes", [])
    edges = graph.setdefault("edges", [])
    # Idempotently replace only records owned by this integration script.
    nodes[:] = [n for n in nodes if n.get("source_artifact") != CONTRACT.name]
    edges[:] = [e for e in edges if e.get("source_artifact") != CONTRACT.name]
    by_id = {n.get("id"): n for n in nodes}
    role_ids = {n.get("id") for n in nodes if n.get("kind") == "role" and n.get("domain_id") == "D078"}
    if len(role_ids) != 19:
        raise SystemExit(f"Expected the reconciled 19 D078 roles; found {len(role_ids)}")
    tool_nodes: dict[str, str] = {}
    task_nodes: dict[str, str] = {}
    for row in contract["routes"]:
        tool_key = row["tool_key"]
        canonical = row["canonical_tool_id"]
        if canonical not in tool_nodes:
            source_node_id = row.get("source_graph_node_id")
            existing = by_id.get(source_node_id) if source_node_id else None
            existing = existing or next((n for n in nodes if n.get("canonical_tool_id") == canonical), None)
            if existing:
                existing["canonical_tool_id"] = canonical
                tool_nodes[canonical] = existing["id"]
            else:
                node_id = f"tool:{slug(canonical)}"
                base = {
                    "id": node_id, "kind": "tool", "item_type": "tool", "canonical_tool_id": canonical,
                    "label": row["name"], "meaning": row["plain_meaning"], "official_reference":row["official_reference"],
                    "student_visible": True, "approval": "approved_optional_tool_identity", "sequence_approved": False,
                    "source_artifact": CONTRACT.name,
                }
                nodes.append(base); by_id[node_id] = base; tool_nodes[canonical] = node_id
        role_id = row["role_id"]
        if role_id not in role_ids:
            raise SystemExit(f"Unresolved role owner: {role_id}")
        task_id = row["task_node_id"]
        if task_id not in task_nodes:
            task_node = {
                "id": task_id, "kind": "role_task_context", "domain_id": "D078",
                "role_id": role_id, "label": row["relationships"][0]["target"],
                "description": "A bounded task context used to explain why an optional tool may help on this role route; it is not a separate qualification or required sequence.",
                "source_refs": [ref["url"] for ref in row["role_task_evidence"]],
                "student_visible": True, "sequence_approved": False, "source_artifact": CONTRACT.name,
            }
            nodes.append(task_node); by_id[task_id] = task_node; task_nodes[task_id] = task_id
            edges.append({"id": f"role_task:{slug(role_id)}", "source": role_id, "target": task_id,
                "relationship": "role_has_task_context", "status": "approved_context_link",
                "student_visible": True, "sequence_approved": False,
                "source_refs": task_node["source_refs"], "source_artifact": CONTRACT.name})
        edge_id = f"role_tool:{slug(role_id)}:{slug(canonical)}"
        edges.append({
            "id":edge_id, "source":role_id, "target":tool_nodes[canonical], "relationship":"role_to_tool_option",
            "status":"approved_optional_route_tool", "student_visible":True, "sequence_approved":False,
            "source_refs":[ref["url"] for ref in row["source_references"]], "route_context":row,
            "rationale":row["contextual_use"], "source_artifact":CONTRACT.name,
        })
    relationship_counts: dict[str, int] = {}
    for row in contract["routes"]:
        source_id = tool_nodes[row["canonical_tool_id"]]
        for relation in row["relationships"]:
            target_id = relation.get("target_id")
            if relation["type"] == "supports":
                target_id = task_nodes.get(target_id)
                rel_name = "tool_supports_role_task"
            elif relation["type"] == "alternative_to":
                target_id = tool_nodes.get(target_id)
                rel_name = "tool_alternative_for_role_task"
            else:
                continue
            if not target_id or target_id == source_id:
                raise SystemExit(f"Unresolved or self-referential tool relationship: {row['id']} {relation}")
            rel_id = f"{rel_name}:{slug(row['role_id'])}:{slug(row['canonical_tool_id'])}:{slug(target_id)}"
            edges.append({"id": rel_id, "source": source_id, "target": target_id,
                "relationship": rel_name, "status": "approved_optional_route_relationship",
                "student_visible": True, "sequence_approved": False,
                "route_context": row, "rationale": relation["explanation"],
                "source_refs": [ref["url"] for ref in row["source_references"]],
                "source_artifact": CONTRACT.name})
            relationship_counts[rel_name] = relationship_counts.get(rel_name, 0) + 1
    graph["role_tool_integration"] = {
        "source_artifact":CONTRACT.name, "role_count":19, "role_tool_route_count":len(contract["routes"]),
        "distinct_canonical_tools":len(tool_nodes), "minimum_distinct_tool_choices_per_role":5,
        "role_task_context_nodes":len(task_nodes), "explicit_relationship_edges":relationship_counts,
        "sequence_effect":"none; all role-tool options are optional and create no prerequisite edges",
        "deduplication":"One canonical tool identity is reused across domain, area and role routes; role-specific use remains on the route edge.",
    }
    # Keep the artifact's own version/provenance current when this additive
    # graph layer is rebuilt. The graph remains globally hidden until the
    # separate rendered-UI and student-promotion gates are passed.
    graph["schema_version"] = "2026-10-16.d078.programme-to-role-learning-path-graph.v3+role-tools"
    source_path = "data/career-mapping/_audit/" + CONTRACT.name
    source_artifacts = graph.setdefault("source_artifacts", [])
    if source_path not in source_artifacts:
        source_artifacts.append(source_path)
    graph.setdefault("validation", {})["total_nodes"] = len(nodes)
    graph["validation"]["total_edges"] = len(edges)
    graph["validation"]["role_tool_route_edges"] = len(contract["routes"])
    graph["validation"]["role_tool_task_support_edges"] = relationship_counts.get("tool_supports_role_task", 0)
    graph["validation"]["role_tool_alternative_edges"] = relationship_counts.get("tool_alternative_for_role_task", 0)
    graph["validation"]["role_tool_distinct_canonical_tools"] = len(tool_nodes)
    GRAPH.write_text(json.dumps(graph,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    with GRAPH.open("rb") as source, gzip.open(str(GRAPH)+".gz","wb",compresslevel=9) as target:
        target.write(source.read())
    print(f"Integrated {len(contract['routes'])} optional role-tool edges; {len(tool_nodes)} canonical tools; graph remains non-sequencing for these edges.")

if __name__ == "__main__": main()
