import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CONTRACT_PATH = ROOT / "data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json"
SEED_PATH = ROOT / "backend/seed_d078_role_tools_2026-10-16.sql"


def test_each_d078_role_has_five_optional_source_linked_tool_routes_and_seed_rows():
    contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    routes = contract["routes"]

    assert contract["role_count"] == 19
    assert contract["minimum_distinct_tools_per_role"] == 5
    assert len(routes) == 95
    assert len({route["role_id"] for route in routes}) == 19
    per_role = Counter(route["role_id"] for route in routes)
    assert set(per_role.values()) == {5}

    for route in routes:
        assert route["requirement_level"] == "optional"
        assert route["plain_meaning"]
        assert route["contextual_use"]
        assert route["expected_output"]
        assert route["prerequisites"]
        assert route["alternatives"]
        assert route["limitations"]
        assert route["official_reference"]["url"].startswith("https://")
        assert route["learning_resource"]["url"].startswith("https://")
        support = [edge for edge in route["relationships"] if edge.get("type") == "supports"]
        assert support and all(edge.get("target_id") == route["task_node_id"] for edge in support)
        assert all(edge.get("sequence_approved") is False for edge in route["relationships"])
        assert route["claim_review_state"] == "approved"
        assert route["student_visible"] is True

    seed = SEED_PATH.read_text(encoding="utf-8").casefold()
    assert seed.count("on conflict (context_level,context_key,item_type,item_key)") == 95
    assert "requirement_level" in seed
