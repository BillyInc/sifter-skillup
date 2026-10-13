"""Build the D078 dependency graph from locally approved records only."""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_APPROVED_LEARNING_PATH_DEPENDENCY_GRAPH_2026_10_10.json"
REPORT = ROOT / "docs/manual-review/D078_APPROVED_LEARNING_PATH_DEPENDENCY_GRAPH_2026_10_10.md"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:100]


def concept_node(nodes: dict[str, dict[str, Any]], text: str, kind: str) -> str:
    node_id = f"concept:{kind}:{slug(text)}"
    nodes.setdefault(node_id, {"id": node_id, "kind": kind, "label": text, "student_visible": False})
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


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = [record for record in source["records"] if record["final_disposition_status"] == "approved_for_provisional_d078_learning_path"]
    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, Any]] = []
    for record in records:
        position = record["queue_position"]
        item_id = f"item:{position}:{slug(record.get('pair_key') or record.get('label') or str(position))}"
        nodes[item_id] = {
            "id": item_id,
            "kind": "learning_item",
            "queue_position": position,
            "label": record.get("label") or record.get("pair_key"),
            "layer": record.get("final_layer"),
            "placement_decision": record.get("placement_decision"),
            "student_visible": False,
            "approval": "provisional_design_approved",
            "programme_scope": record["approval_basis"]["programme_domain_backstop"],
            "nigerian_scope": record["approval_basis"]["nigerian_scope"],
        }
        for prerequisite in record.get("prerequisites", []):
            target = concept_node(nodes, prerequisite, "prerequisite")
            edges.append({"source": target, "target": item_id, "relationship": "prerequisite_for", "status": "provisional_design_review"})
        for complement in record.get("complements", []):
            target = concept_node(nodes, complement, "complement")
            edges.append({"source": item_id, "target": target, "relationship": "works_with", "status": "provisional_design_review"})
        for alternative in record.get("valid_alternatives", []):
            target = concept_node(nodes, alternative, "alternative")
            edges.append({"source": item_id, "target": target, "relationship": "alternative_to", "status": "provisional_design_review"})
        for role in record.get("roles_snapshot", []):
            target = concept_node(nodes, role, "role_context")
            edges.append({"source": item_id, "target": target, "relationship": "candidate_role_context", "status": "provisional_design_review"})

    relationship_counts = Counter(edge["relationship"] for edge in edges)
    cycle = prerequisite_cycle_check(edges)
    output = {
        "schema_version": "2026-10-10.d078.approved-learning-path-dependency-graph.v1",
        "status": "provisional_design_graph_from_approved_subset",
        "source_artifact": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "student_visible": False,
        "nodes": list(nodes.values()),
        "edges": edges,
        "validation": {
            "source_records": len(source["records"]),
            "approved_subset_records": len(records),
            "hidden_records_excluded_from_graph": len(source["records"]) - len(records),
            "learning_item_nodes": sum(node["kind"] == "learning_item" for node in nodes.values()),
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "relationship_counts": dict(sorted(relationship_counts.items())),
            "student_visible_edges": 0,
            "canonical_promotions": 0,
            "prerequisite_graph": cycle,
            "sequence_claim": "Graph contains only locally approved bounded candidates; it does not claim a final student sequence until UI, evidence and canonical gates pass.",
        },
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# D078 approved-subset learning-path dependency graph — 2026-10-10",
        "",
        "This graph is rebuilt from the local final disposition, not from all 173 repair records. It is a provisional design artifact, not canonical data and not student-facing.",
        "",
        f"- Input disposition records: **{len(source['records'])}**",
        f"- Approved subset records included: **{len(records)}**",
        f"- Hidden records excluded: **{len(source['records']) - len(records)}**",
        f"- Learning-item nodes: **{output['validation']['learning_item_nodes']}**",
        f"- Total nodes: **{len(nodes)}**",
        f"- Total edges: **{len(edges)}**",
        f"- Relationship counts: `{dict(sorted(relationship_counts.items()))}`",
        f"- Prerequisite graph acyclic: **{cycle['acyclic']}**",
        "- Student-visible edges: **0**",
        "- Canonical promotions: **0**",
        "",
        "The graph contains bounded route candidates. Global-only items remain explicitly marked as having no Nigerian claim; enrichment items supported by the programme/domain CCMAS backstop remain labelled domain enrichment rather than verbatim curriculum content.",
        "",
        "Prerequisites, complements, alternatives and role context are still subject to the guided-experience UI/evidence gate before they can be rendered as requirements or guarantees.",
        "",
        f"Machine-readable artifact: `{OUTPUT.relative_to(ROOT).as_posix()}`",
    ]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(output["validation"], sort_keys=True))


if __name__ == "__main__":
    main()
