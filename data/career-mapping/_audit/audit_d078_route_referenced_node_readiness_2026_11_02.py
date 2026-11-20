"""Audit whether route-referenced D078 nodes are actually learner-selectable.

The route graph intentionally retains hidden candidates for provenance. This
audit distinguishes those from approved route items so a stale visibility flag
cannot silently masquerade as a selectable card.
"""
from __future__ import annotations

import gzip
import json
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
ROUTE_ITEM_FIELDS = (
    "task_family_ids", "area_item_ids", "task_linked_domain_item_ids",
    "available_item_ids", "domain_downstream_item_ids", "tool_ids",
    "domain_tool_ids", "explanatory_item_ids", "role_ids", "role_item_ids",
    "method_specific_role_item_ids",
)


def load_json(path: Path) -> Any:
    if path.exists():
        if path.suffix == ".gz":
            with gzip.open(path, "rt", encoding="utf-8-sig") as source:
                return json.load(source)
        return json.loads(path.read_text(encoding="utf-8"))
    compressed = path.with_name(path.name + ".gz")
    with gzip.open(compressed, "rt", encoding="utf-8-sig") as source:
        return json.load(source)


def walk_dicts(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_dicts(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_dicts(child)


def area_source_match(node: dict[str, Any], source_cache: dict[str, Any]) -> dict[str, Any] | None:
    for relative in node.get("source_artifacts", []):
        source_path = ROOT / relative
        key = str(source_path)
        if key not in source_cache:
            try:
                source_cache[key] = load_json(source_path)
            except FileNotFoundError:
                source_cache[key] = None
        artifact = source_cache[key]
        if artifact is None:
            continue
        matches = [
            row for row in walk_dicts(artifact)
            if row.get("label") == node.get("label")
            and (not row.get("area_id") or row.get("area_id") == node.get("area_id"))
            and any(key in row for key in ("what_it_is", "authoritative_evidence", "free_task_specific_learning_links"))
        ]
        if len(matches) == 1:
            return matches[0]
    return None


def main() -> None:
    graph = load_json(GRAPH)
    nodes = {row["id"]: row for row in graph["nodes"]}
    route_groups = (
        graph.get("method_area_routes", []),
        graph.get("method_area_role_routes", []),
        graph.get("combination_area_routes", []),
        graph.get("combination_area_role_routes", []),
    )
    referenced = {
        item_id
        for rows in route_groups
        for route in rows
        for field in ROUTE_ITEM_FIELDS
        for item_id in route.get(field, [])
    }
    hidden = [nodes[item_id] for item_id in sorted(referenced)
              if item_id in nodes and nodes[item_id].get("student_visible") is not True]
    source_cache: dict[str, Any] = {}
    area_enrichment = [node for node in hidden if node.get("kind") == "area_enrichment_item"]
    matches = {node["id"]: area_source_match(node, source_cache) for node in area_enrichment}
    profiles = Counter()
    approvals = Counter()
    reasons = Counter()
    for node in hidden:
        source = matches.get(node["id"]) if node.get("kind") == "area_enrichment_item" else None
        has_explanation = bool(
            node.get("meaning") or node.get("what_it_is") or node.get("student_facing_explanation")
            or (source and source.get("what_it_is"))
        )
        has_learning_link = bool(
            node.get("learning_links") or node.get("learning_resources")
            or node.get("source_record", {}).get("linkUrl")
            or (source and source.get("free_task_specific_learning_links"))
        )
        has_claim_evidence = bool(
            node.get("evidence") or node.get("evidence_sources") or node.get("source_references")
            or node.get("source_record", {}).get("sourceReferences")
            or (source and source.get("authoritative_evidence"))
        )
        profiles[(node.get("kind"), has_explanation, has_learning_link, has_claim_evidence)] += 1
        approvals[(node.get("kind"), node.get("approval"))] += 1
        reasons[(node.get("kind"), node.get("student_visibility_reason") or node.get("hide_reason") or node.get("review_status"))] += 1

    result = {
        "schema_version": graph.get("schema_version"),
        "route_referenced_node_count": len(referenced),
        "route_referenced_hidden_node_count": len(hidden),
        "hidden_by_kind_and_readiness": [
            {"kind": key[0], "has_explanation": key[1], "has_learning_link": key[2],
             "has_claim_evidence": key[3], "count": count}
            for key, count in sorted(profiles.items(), key=lambda pair: str(pair[0]))
        ],
        "hidden_by_kind_and_approval": [
            {"kind": key[0], "approval": key[1], "count": count}
            for key, count in sorted(approvals.items(), key=lambda pair: str(pair[0]))
        ],
        "hidden_by_kind_and_reason": [
            {"kind": key[0], "reason": key[1], "count": count}
            for key, count in sorted(reasons.items(), key=lambda pair: str(pair[0]))
        ],
        "area_enrichment_hidden_count": len(area_enrichment),
        "area_enrichment_source_record_matches": sum(value is not None for value in matches.values()),
        "area_enrichment_missing_source_record_ids": [key for key, value in matches.items() if value is None],
        "area_enrichment_source_records_with_required_student_fields": sum(
            bool(row and row.get("what_it_is") and row.get("task_connection") and row.get("learner_output")
                 and row.get("authoritative_evidence") and row.get("free_task_specific_learning_links"))
            for row in matches.values()
        ),
        "hidden_nodes": [
            {"id": node["id"], "kind": node.get("kind"), "label": node.get("label"),
             "approval": node.get("approval"), "area_id": node.get("area_id"),
             "visibility_reason": node.get("student_visibility_reason") or node.get("hide_reason") or node.get("review_status")}
            for node in hidden
        ],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
