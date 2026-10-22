"""Mark resolved D078 links whose endpoints never co-occur on a learner route.

The relationship itself can be source-backed while its endpoint remains
unavailable as a learner destination. This script records the exhaustive
route audit result on the canonical graph edge without changing node
visibility, route membership, item disposition, or relationship resolution.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH_PATH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
ROUTE_AUDIT_PATH = AUDIT / "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json"


def main() -> None:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    route_audit = json.loads(ROUTE_AUDIT_PATH.read_text(encoding="utf-8"))
    report = route_audit["student_relationship_routeability"]
    unavailable = report["endpoints_not_projected_or_without_shared_stop"]
    pairs = {(row["source_id"], row["target_id"], row["relationship"]): row for row in unavailable}
    if len(pairs) != len(unavailable):
        raise SystemExit("Route audit repeats a source-target pair; resolve duplicate edge identity before marking.")

    changed = 0
    for edge in graph["edges"]:
        key = (edge.get("source"), edge.get("target"), edge.get("relationship"))
        row = pairs.get(key)
        if not row:
            continue
        if edge.get("status") != "resolved_ready_for_use" or edge.get("student_visible") is not True:
            continue
        metadata = {
            "state": "unavailable_destination",
            "reason": row["availability_reason"],
            "route_audit": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
            "source_projected_anywhere": row["source_projected"].lower() == "true",
            "target_projected_anywhere": row["target_projected"].lower() == "true",
        }
        if edge.get("route_availability") != metadata:
            edge["route_availability"] = metadata
            changed += 1

    missing = [key for key in pairs if not any(
        edge.get("source") == key[0] and edge.get("target") == key[1]
        and edge.get("relationship") == key[2]
        and edge.get("route_availability", {}).get("state") == "unavailable_destination"
        for edge in graph["edges"]
    )]
    if missing:
        raise SystemExit(f"Could not mark {len(missing)} audited source-target pairs: {missing[:5]}")

    graph["student_relationship_routeability"] = {
        "audit": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
        "unavailable_destination_edge_pairs": len(pairs),
        "learner_route_policy": "A relationship annotation never adds its target to a route; destinations must already be present in the active route projection.",
    }
    GRAPH_PATH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"marked_pairs": len(pairs), "changed_edges": changed,
                      "remaining_missing_pairs": len(missing)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
