"""Build a review-only dependency graph from the reconciled D078 records."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_RECONCILIATION_2026_10_09.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_LEARNING_PATH_DEPENDENCY_GRAPH_2026_10_09.json"
REPORT = ROOT / "docs/manual-review/D078_LEARNING_PATH_DEPENDENCY_GRAPH_2026_10_09.md"


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:100]


def concept_node(nodes: dict[str, dict[str, Any]], text: str, kind: str) -> str:
    node_id = f"concept:{kind}:{slug(text)}"
    nodes.setdefault(node_id, {"id": node_id, "kind": kind, "label": text, "student_visible": False})
    return node_id


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = source["records"]
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
            "placement_decision": record.get("placement_decision"),
            "student_visible": False,
            "approval": False,
        }
        for prerequisite in record.get("prerequisites", []):
            target = concept_node(nodes, prerequisite, "prerequisite")
            edges.append({"source": target, "target": item_id, "relationship": "prerequisite_for", "status": "review_only"})
        for complement in record.get("complements", []):
            target = concept_node(nodes, complement, "complement")
            edges.append({"source": item_id, "target": target, "relationship": "works_with", "status": "review_only"})
        for alternative in record.get("valid_alternatives", []):
            target = concept_node(nodes, alternative, "alternative")
            edges.append({"source": item_id, "target": target, "relationship": "alternative_to", "status": "review_only"})
        for role in record.get("roles_snapshot", []):
            target = concept_node(nodes, role, "role_context")
            edges.append({"source": item_id, "target": target, "relationship": "candidate_role_context", "status": "review_only"})

    relationship_counts = Counter(edge["relationship"] for edge in edges)
    output = {
        "schema_version": "2026-10-09.d078.learning-path-dependency-graph.v1",
        "status": "review_only",
        "source_artifact": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "student_visible": False,
        "nodes": list(nodes.values()),
        "edges": edges,
        "validation": {
            "source_records": len(records),
            "learning_item_nodes": sum(node["kind"] == "learning_item" for node in nodes.values()),
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "relationship_counts": dict(sorted(relationship_counts.items())),
            "student_visible_edges": 0,
            "approval_promotions": 0,
            "sequence_claim": "No prerequisite ordering is student-approved; local review is still required.",
        },
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "\n".join(
            [
                "# D078 learning-path dependency graph — 2026-10-09",
                "",
                "This graph is a review-only dependency model generated from the reconciled repair artifacts. It is not canonical and is not student-facing.",
                "",
                f"- Source learning-item records: **{len(records)}**",
                f"- Learning-item nodes: **{output['validation']['learning_item_nodes']}**",
                f"- Total nodes: **{len(nodes)}**",
                f"- Total edges: **{len(edges)}**",
                f"- Relationship counts: `{dict(sorted(relationship_counts.items()))}`",
                "- Student-visible edges: **0**",
                "- Approved prerequisite sequence: **none yet**",
                "",
                "Prerequisites, complements, alternatives and candidate role context are represented as review-only edges. They must not be rendered as requirements or route guarantees until the later approval and student-safety gates pass.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(json.dumps(output["validation"], sort_keys=True))


if __name__ == "__main__":
    main()
