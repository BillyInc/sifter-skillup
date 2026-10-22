import json
import sys
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit"
sys.path.insert(0, str(AUDIT_DIR))

from finalize_d078_relationship_route_contract_2026_10_20 import (  # noqa: E402
    GENERIC_RELATIONSHIP_EXPLANATION,
    apply_recorded_relationship_explanations,
)


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def test_recorded_relationship_notes_replace_only_the_matching_generic_edges():
    graph = _read_json(AUDIT_DIR / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
    ledger = _read_json(AUDIT_DIR / "D078_RELATIONSHIP_RESOLUTION_2026_10_20.json")

    result = apply_recorded_relationship_explanations(graph, ledger)

    assert result["eligible_ledger_records"] == 33
    assert result["edges_updated"] == 0  # The checked-in canonical graph is already reconciled.
    assert result["conflicts_or_missing_edges"] == []
    note_by_edge = {}
    for row in ledger["records"]:
        annotation = row.get("original_annotation")
        note = annotation.get("note", "").strip() if isinstance(annotation, dict) else ""
        if row.get("resolution_state") != "resolved_ready_for_use" or not note:
            continue
        prefix = f"d078-resolved-relation:{row['id']}:"
        for edge in graph["edges"]:
            if edge.get("id", "").startswith(prefix):
                note_by_edge[edge["id"]] = note

    updated_edges = {edge["id"]: edge for edge in graph["edges"] if edge["id"] in note_by_edge}
    assert len(updated_edges) == 33
    assert all(updated_edges[edge_id]["explanation"] == note for edge_id, note in note_by_edge.items())

    compact = _read_json(ROOT / "src" / "data" / "d078MethodAwareUiData.json")
    compact_edges = {edge["id"]: edge for edge in compact["typed_relationship_edges"]}
    assert all(compact_edges[edge_id]["explanation"] == note for edge_id, note in note_by_edge.items())

    unrepaired_graph = deepcopy(graph)
    for edge in unrepaired_graph["edges"]:
        if edge.get("id") in note_by_edge:
            edge["explanation"] = GENERIC_RELATIONSHIP_EXPLANATION
    repair_result = apply_recorded_relationship_explanations(unrepaired_graph, ledger)
    rerun_result = apply_recorded_relationship_explanations(unrepaired_graph, ledger)
    assert repair_result["edges_updated"] == 33
    assert repair_result["conflicts_or_missing_edges"] == []
    assert rerun_result["edges_updated"] == 0


def test_relationship_note_repair_is_idempotent_and_does_not_touch_unannotated_edges():
    graph = {
        "edges": [
            {"id": "d078-resolved-relation:d078-relres:001:1", "explanation": GENERIC_RELATIONSHIP_EXPLANATION},
            {"id": "unrelated", "explanation": GENERIC_RELATIONSHIP_EXPLANATION},
        ]
    }
    ledger = {
        "records": [
            {
                "id": "d078-relres:001",
                "resolution_state": "resolved_ready_for_use",
                "original_annotation": {"note": "This connection has a specific, reviewed reason."},
            }
        ]
    }

    first = apply_recorded_relationship_explanations(graph, ledger)
    second = apply_recorded_relationship_explanations(graph, ledger)

    assert first["edges_updated"] == 1
    assert second["edges_updated"] == 0
    assert second["conflicts_or_missing_edges"] == []
    assert graph["edges"][0]["explanation"] == "This connection has a specific, reviewed reason."
    assert graph["edges"][1]["explanation"] == GENERIC_RELATIONSHIP_EXPLANATION


def test_every_student_relationship_gets_item_context_without_inventing_route_requirements():
    graph = _read_json(AUDIT_DIR / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json")
    ledger = _read_json(AUDIT_DIR / "D078_RELATIONSHIP_RESOLUTION_2026_10_20.json")
    result = apply_recorded_relationship_explanations(graph, ledger)

    nodes = {node["id"]: node for node in graph["nodes"]}
    ready = [
        edge for edge in graph["edges"]
        if edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True
    ]
    assert len(ready) == 566
    assert result["unresolved_edges"] == []
    assert all(edge.get("explanation", "").strip() for edge in ready)
    assert all(
        "Canonical learning item(s) exist for this relationship" not in edge["explanation"]
        and "Exact relationship target slug crosswalked" not in edge["explanation"]
        and not edge["explanation"].startswith("Optional technique connection under ")
        and not edge["explanation"].startswith("Optional software that can implement parts")
        and not edge["explanation"].startswith("For a bounded output task, this tool can be used")
        and not edge["explanation"].startswith("Existing statistical/econometric software can support parts")
        and not edge["explanation"].startswith("Power BI and Tableau can each produce")
        and not edge["explanation"].startswith("The annotation resolves to an existing D078 learning item.")
        for edge in ready
    )
    generated = [edge for edge in ready if edge.get("explanation_basis")]
    assert generated
    for edge in generated:
        assert edge["explanation_basis"] == "reviewed_relationship_type_and_endpoint_context"
        assert nodes[edge["source"]]["label"] in edge["explanation"]
        assert nodes[edge["target"]]["label"] in edge["explanation"]
        assert edge.get("blocking_policy", "never") != "blocks"
