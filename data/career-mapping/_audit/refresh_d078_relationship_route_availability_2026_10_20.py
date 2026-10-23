"""Apply route-availability results from the exhaustive route audit to edges."""
from __future__ import annotations
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
REPORT = AUDIT / "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json"

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    routeable = report["student_relationship_routeability"]["co_projected_edge_ids_by_scope"]
    hidden = {x["edge_id"]: x for x in report["student_relationship_routeability"]["endpoints_not_projected_or_without_shared_stop"]}
    updated = {"available": 0, "unavailable": 0}
    for edge in graph["edges"]:
        if edge.get("status") != "resolved_ready_for_use" or edge.get("student_visible") is not True:
            continue
        edge_id = edge.get("id")
        if edge_id in routeable:
            scope = routeable[edge_id]
            edge["route_availability"] = {
                "state": "available_in_declared_route",
                "reason": "The canonical endpoints share the route scope confirmed by the exhaustive graph audit.",
                "scope": scope,
                "route_audit": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
            }
            updated["available"] += 1
        elif edge_id in hidden:
            row = hidden[edge_id]
            edge["route_availability"] = {
                "state": "unavailable_destination",
                "reason": row["availability_reason"],
                "route_audit": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
                "source_projected_anywhere": row["source_projected"] in {"True", "true"},
                "target_projected_anywhere": row["target_projected"] in {"True", "true"},
            }
            updated["unavailable"] += 1
    graph["student_relationship_routeability"] = {
        "updated_on": "2026-10-20",
        "ready_visible_edges_recomputed": sum(updated.values()),
        "available_edges": updated["available"],
        "unavailable_destination_edges": updated["unavailable"],
        "blocking_edges": 0,
        "source_audit": "D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json",
        "note": "Every availability label is copied from the exhaustive projection result. Unavailable targets are not student destinations and are not promoted by an edge.",
    }
    GRAPH.write_text(json.dumps(graph, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(graph["student_relationship_routeability"], ensure_ascii=False))

if __name__ == "__main__":
    main()
