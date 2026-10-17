import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
AUDIT = ROOT / "data/career-mapping/_audit"


def load(name: str):
    return json.loads((AUDIT / name).read_text(encoding="utf-8"))


def test_all_501_requirement_decisions_join_their_exact_graph_context():
    disposition = load("D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json")
    graph = load("D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json")
    nodes = graph["nodes"]
    edges = graph["edges"]
    counts = Counter()

    for record in disposition["records"]:
        kind = record["context_type"]
        if kind == "domain":
            matches = [n for n in nodes if n.get("kind") in {"domain_learning_item", "domain_emerging_learning_item"}
                       and (n.get("contract_id") or n.get("item_id")) == record["item_id"]]
        elif kind == "area":
            matches = [n for n in nodes if n.get("kind") == "area_enrichment_item"
                       and n.get("item_id") == record["item_id"]
                       and n.get("area_id") == record["context_key"]]
        elif kind == "area_inherited":
            matches = [n for n in nodes if n.get("kind") == "area_learning_item" and n.get("id") == record["item_id"]]
        elif kind == "role_item":
            matches = [n for n in nodes if n.get("kind") == "role_item_candidate"
                       and n.get("queue_position") == record["queue_position"]]
        elif kind == "role_tool":
            matches = [e for e in edges if (e.get("route_context") or {}).get("id") == record["item_id"]
                       and e.get("relationship") in {"tool_supports_role_task", "tool_alternative_for_role_task"}]
        else:
            matches = []
        assert matches, f"unjoined disposition: {kind}:{record.get('item_id')}"
        assert all(m.get("requirement_lane") == record["requirement_lane"] for m in matches), record.get("item_id")
        expected_blocking = kind == "domain" and record["item_id"] in {
            "d078-research-question-design",
            "d078-evaluate-evidence-and-limits",
            "d078-communicate-evidence",
        }
        assert all((m.get("requirement_scope") or {}).get("blocks_progression") is expected_blocking for m in matches)
        counts[kind] += 1

    assert counts == {"domain": 53, "area": 144, "area_inherited": 36, "role_item": 173, "role_tool": 95}
    assert sum(counts.values()) == 501


def test_shared_research_foundations_are_the_compulsory_spine_and_ordered():
    graph = load("D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json")
    foundation_order = {
        "d078-research-question-design": 1,
        "d078-evaluate-evidence-and-limits": 2,
        "d078-communicate-evidence": 3,
    }
    found = {}
    for node in graph["nodes"]:
        contract_id = node.get("contract_id")
        if contract_id in foundation_order:
            scope = node["requirement_scope"]
            assert node["requirement_level"] == "needed"
            assert node["requirement_lane"] == "needed"
            assert scope["base_requirement_level"] == "needed"
            assert scope["recommended_teaching_order"] == foundation_order[contract_id]
            assert scope["ordering_semantics"] == "compulsory_foundation_spine"
            assert scope["skippable"] is False and scope["blocks_progression"] is True
            assert scope["can_select_alongside_needed"] is False
            found[contract_id] = scope
    assert set(found) == set(foundation_order)
    assert graph["sequence_policy_contract"]["approved_blocking_edge_count"] == 0


def test_only_three_conditioned_order_edges_exist_and_none_block_progression():
    graph = load("D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json")
    nodes = {node["id"] for node in graph["nodes"]}
    ordered = [edge for edge in graph["edges"] if edge.get("sequence_approved") is True]
    assert len(ordered) == 3
    assert len(graph["sequence_policy_contract"]["approved_conditional_order_edges"]) == 3
    for edge in ordered:
        assert edge["source"] in nodes and edge["target"] in nodes
        assert edge["blocking_policy"] == "never"
        assert edge["auto_add_target"] is False
        assert edge.get("sequence_condition")
        assert edge.get("sequence_scope")

    # Kahn's algorithm on the approved-order subgraph: a cycle would mean the
    # proposed ordering cannot be followed consistently.
    adjacency = {node_id: [] for node_id in nodes}
    indegree = {node_id: 0 for node_id in nodes}
    for edge in ordered:
        adjacency[edge["source"]].append(edge["target"])
        indegree[edge["target"]] += 1
    ready = [node_id for node_id, degree in indegree.items() if degree == 0]
    visited = 0
    while ready:
        source = ready.pop()
        visited += 1
        for target in adjacency[source]:
            indegree[target] -= 1
            if indegree[target] == 0:
                ready.append(target)
    assert visited == len(nodes)


def test_all_seven_area_routes_and_multi_area_role_edges_survive_lane_overlay():
    graph = load("D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json")
    areas = {node["id"] for node in graph["nodes"] if node.get("kind") == "area_of_specialization"}
    roles = {node["id"] for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"}
    area_edges = [edge for edge in graph["edges"] if edge.get("relationship") == "area_to_role"]
    assert len(areas) == 7
    assert len(roles) == 19
    assert len(area_edges) == 26
    assert {edge["source"] for edge in area_edges} == areas
    assert {edge["target"] for edge in area_edges} <= roles
    role_area_counts = Counter(edge["target"] for edge in area_edges)
    assert sum(count > 1 for count in role_area_counts.values()) == 7


def test_generated_seeds_keep_all_scope_and_alternative_lanes():
    root = ROOT
    domain_seed = (root / "backend/seed_d078_guided_content_2026-10-12.sql").read_text(encoding="utf-8")
    role_seed = (root / "backend/seed_d078_role_item_contracts_2026-10-15.sql").read_text(encoding="utf-8")
    tool_seed = (root / "backend/seed_d078_role_tools_2026-10-16.sql").read_text(encoding="utf-8")
    tool_routes = load("D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json")["routes"]
    assert "requirement_scope" in domain_seed
    assert "migration_d078_requirement_lanes_2026-10-17.sql" in domain_seed
    assert "requirement_lane, requirement_condition, requirement_rationale" in role_seed
    assert "migration_d078_requirement_lanes_2026-10-17.sql" in role_seed
    assert "requirement_scope" in tool_seed
    assert len(tool_routes) == 95
    assert all(row["requirement_scope"]["lane"] == "choose_one_alternative" for row in tool_routes)
    assert all(row["requirement_scope"]["skippable"] is True for row in tool_routes)
    assert all(row["requirement_scope"]["blocks_progression"] is False for row in tool_routes)
