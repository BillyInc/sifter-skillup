"""Structural and route-policy checks for the D078 method path graph."""

from __future__ import annotations

import json
import gzip
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "data/career-mapping/_audit"))
from apply_d078_student_language_2026_10_20 import _clean as student_copy

GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
DOMAIN_OVERVIEW_CONTRACT_PATH = ROOT / "data/career-mapping/_audit/D078_DOMAIN_OVERVIEW_CONTRACT_2026_10_19.json"


class D078MethodAreaRoleRouteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if GRAPH_PATH.exists():
            cls.graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
        else:
            with gzip.open(GRAPH_GZ_PATH, "rt", encoding="utf-8") as source:
                cls.graph = json.load(source)
        cls.nodes = {node["id"]: node for node in cls.graph["nodes"]}
        cls.edges = cls.graph["edges"]
        cls.edge_pairs = {(edge["source"], edge["target"], edge["relationship"]) for edge in cls.edges}

    def test_serialized_graph_has_unique_nodes_and_resolved_edges(self) -> None:
        self.assertEqual(len(self.nodes), len(self.graph["nodes"]))
        self.assertTrue(all(edge["source"] in self.nodes and edge["target"] in self.nodes for edge in self.edges))

    def test_all_seven_canonical_areas_and_nineteen_supported_roles_are_included(self) -> None:
        areas = [node for node in self.nodes.values() if node.get("kind") == "area_of_specialization"]
        roles = [node for node in self.nodes.values() if node.get("kind") == "role"]
        self.assertEqual(len(areas), 7)
        self.assertEqual(len(roles), 19)
        self.assertEqual(self.graph["validation"]["legacy_area_count"], 0)
        area_ids = {node["area_id"] for node in areas}
        route_area_ids = {route["area_id"] for route in self.graph["method_area_routes"]}
        self.assertTrue(route_area_ids.issubset(area_ids))

    def test_full_sociology_curriculum_context_is_preserved(self) -> None:
        transition = self.graph["programme_transition"]
        themes = [node for node in self.nodes.values() if node.get("kind") == "programme_theme"]
        outcomes = [node for node in self.nodes.values() if node.get("kind") == "programme_outcome"]
        self.assertEqual(transition["theme_count"], 14)
        self.assertEqual(transition["outcome_count"], 236)
        self.assertEqual(len(themes), 14)
        self.assertEqual(len(outcomes), 236)
        self.assertTrue(self.graph["validation"]["all_programme_outcomes_remain_grouped_under_their_themes"])
        self.assertTrue(self.graph["validation"]["programme_domain_transition_resolves"])

    def test_social_sciences_overview_and_approved_orientation_are_embedded(self) -> None:
        contract = json.loads(DOMAIN_OVERVIEW_CONTRACT_PATH.read_text(encoding="utf-8"))
        domain = self.nodes["domain:D078"]
        expected_fields = {
            "whatItStudies", "whatPeopleDo", "questions", "outputs",
            "howWorkHappens", "whereProgrammeFits",
        }
        self.assertEqual(self.graph["schema_version"], "2026-10-22.d078-method-area-role-route-graph.v6")
        self.assertEqual(domain["overview_contract_id"], contract["schema_version"])
        self.assertEqual(domain["overview"], student_copy(contract["overview"]))
        self.assertEqual(set(domain["student_orientation"]), expected_fields)
        self.assertEqual(
            domain["student_orientation"],
            {key: value for key, value in contract["orientation"].items() if key in expected_fields},
        )
        self.assertEqual(set(domain["orientation_evidence_by_field"]), expected_fields)
        for field in expected_fields:
            self.assertTrue(domain["orientation_evidence_by_field"][field], field)
            for source in domain["orientation_evidence_by_field"][field]:
                self.assertTrue(source["url"].startswith("https://"), field)
                self.assertTrue(source.get("locator"), field)
        unsupported = domain["orientation_scope_notes"]["not_individually_approved_in_this_contract"]
        for field in unsupported:
            self.assertNotIn(field, domain["student_orientation"])

    def test_domain_overview_addition_does_not_promote_graph_or_require_sql_seed(self) -> None:
        self.assertFalse(self.graph["student_visible"])
        seed_policy = self.graph["domain_overview_contract"]["seed_policy"]
        self.assertFalse(seed_policy["new_sql_seed_required_for_overview_copy"])
        self.assertEqual(
            seed_policy["orientation_seed_source"],
            "backend/migration_domain_student_orientation_2026-09-18.sql",
        )

    def test_existing_domain_items_flow_into_economics_mixed_methods_route(self) -> None:
        route = next(
            route for route in self.graph["method_area_routes"]
            if route["method_id"] == "domain-item:d078-mixed-methods"
            and route["area_id"] == "D078:economics-applied-analysis"
        )
        expected = {
            "domain-item:reliability-validity-and-uncertainty",
            "domain-item:case-study-and-comparative-case-design",
            "domain-item:experiments-quasi-experiments-and-causal-inference",
            "domain-item:programme-evaluation-and-theory-of-change",
            "domain-item:systematic-and-scoping-evidence-synthesis",
        }
        self.assertTrue(expected.issubset(set(route["available_item_ids"])))
        task_id = "area-task:d078-economics-applied-analysis-policy-evaluation"
        for item_id in expected:
            self.assertIn((item_id, task_id, "domain_item_supports_area_task"), self.edge_pairs)

    def test_method_choice_is_gated_by_all_three_foundations(self) -> None:
        choice = self.graph["method_choice_node_id"]
        gates = {
            edge["source"]
            for edge in self.edges
            if edge["target"] == choice and edge["relationship"] == "foundation_gate"
        }
        self.assertEqual(gates, set(self.graph["foundation_item_ids"]))

    def test_each_method_route_has_task_area_item_and_role_paths(self) -> None:
        for route in self.graph["method_area_routes"]:
            self.assertTrue(route["task_family_ids"], route["route_node_id"])
            self.assertTrue(route["available_item_ids"], route["route_node_id"])
            self.assertTrue(route["role_route_ids"], route["route_node_id"])
            self.assertFalse(route["role_item_ids"], route["route_node_id"])
            route_node = self.nodes[route["route_node_id"]]
            self.assertEqual(set(route_node["role_route_ids"]), set(route["role_route_ids"]))
            for role_route_id in route["role_route_ids"]:
                role_route = self.nodes[role_route_id]
                self.assertEqual(role_route["area_id"], route["area_id"])
                self.assertIn(role_route["role_id"], route["role_ids"])
                self.assertTrue(role_route["role_item_ids"])

    def test_combination_area_routes_expose_downstream_content_but_not_all_role_items(self) -> None:
        fixed_routes = [
            route
            for combo in self.graph["combination_designs"]
            if combo["combination_mode"] == "fixed_evidence_combination"
            for route in combo["area_routes"]
        ]
        self.assertTrue(fixed_routes)
        for route in fixed_routes:
            route_node = self.nodes[route["route_node_id"]]
            self.assertEqual(route_node["task_family_ids"], [])
            self.assertEqual(route_node["available_item_ids"], [])
            self.assertFalse(route_node["role_item_ids"])
            self.assertTrue(route_node["method_contributions"])
            self.assertEqual(len(route_node["method_contributions"]), len(route_node["method_ids"]))
            for contribution in route_node["method_contributions"]:
                self.assertTrue(contribution["task_family_ids"] or contribution["area_item_ids"] or contribution["available_item_ids"])
                contribution_id = f"{route_node['id']}:method:{contribution['method_id'].split(':')[-1]}"
                self.assertIn(contribution_id, self.nodes)
                self.assertEqual(self.nodes[contribution_id]["method_id"], contribution["method_id"])
                contribution_tasks = {
                    edge["target"] for edge in self.edges
                    if edge["source"] == contribution_id
                    and edge["relationship"] == "method_contribution_applies_to_area_task"
                }
                self.assertEqual(contribution_tasks, set(contribution["task_family_ids"]))
            area_edge = next(edge for edge in self.edges
                             if edge["source"] == route_node["id"]
                             and edge["relationship"] == "recommends_area")
            self.assertNotIn("task_family_ids", area_edge)
            self.assertTrue(route["role_route_ids"])
            for role_route_id in route["role_route_ids"]:
                self.assertTrue(self.nodes[role_route_id]["role_item_ids"])

    def test_supported_combination_counts_and_participatory_menu_semantics(self) -> None:
        designs = self.graph["combination_designs"]
        pair_designs = [
            combo for combo in designs
            if combo["combination_mode"] == "fixed_evidence_combination" and len(combo["method_ids"]) == 2
        ]
        self.assertEqual(len(pair_designs), 7)
        case_study = next(combo for combo in designs if combo["id"] == "combo:case-study-multiple-sources")
        self.assertEqual(len(case_study["method_ids"]), 4)
        participatory = next(combo for combo in designs if combo["id"] == "combo:participatory-method-choice")
        self.assertEqual(participatory["combination_mode"], "design_frame_with_selectable_methods")
        self.assertEqual(len(participatory["required_method_ids"]), 1)
        self.assertEqual(len(participatory["selectable_component_method_ids"]), 4)
        self.assertFalse(participatory["area_routes"])
        self.assertIn("every explicitly selected component method", participatory["route_derivation"])

    def test_every_method_pair_has_an_explicit_combination_disposition(self) -> None:
        contract = self.graph["method_combination_selection_contract"]
        self.assertEqual(contract["method_count"], 22)
        self.assertEqual(contract["unordered_pair_count"], 231)
        self.assertEqual(len(contract["pair_dispositions"]), 231)
        self.assertEqual(len({tuple(row["method_ids"]) for row in contract["pair_dispositions"]}), 231)
        self.assertTrue(all(row["disposition"] for row in contract["pair_dispositions"]))
        self.assertIn("Never project the union", contract["multi_selection_policy"])

    def test_fixed_combination_areas_and_roles_are_supported_by_each_component(self) -> None:
        routes_by_method = {}
        role_routes_by_method = {}
        for route in self.graph["method_area_routes"]:
            routes_by_method.setdefault(route["method_id"], set()).add(route["area_id"])
        for route in self.graph["method_area_role_routes"]:
            role_routes_by_method.setdefault(route["method_id"], set()).add((route["area_id"], route["role_id"]))
        for combo in self.graph["combination_designs"]:
            if combo["combination_mode"] != "fixed_evidence_combination":
                continue
            self.assertEqual(combo["match_rule"], "exact_selected_method_set")
            self.assertTrue(combo["method_contributions"])
            for route in combo["area_routes"]:
                for method_id in combo["required_method_ids"]:
                    self.assertIn(route["area_id"], routes_by_method[method_id])
                for role_id in route["role_ids"]:
                    for method_id in combo["required_method_ids"]:
                        self.assertIn((route["area_id"], role_id), role_routes_by_method[method_id])
                self.assertEqual(len(route["method_contributions"]), len(combo["required_method_ids"]))

    def test_network_methods_have_conceptual_and_tool_relationships(self) -> None:
        expected = {
            ("domain-method:social-network-analysis", "domain-method:network-analysis", "specialist_extension_of"),
            ("domain-knowledge:graph-theory-concepts-for-networks", "domain-method:network-analysis", "conditional_conceptual_preparation_for"),
            ("domain-knowledge:graph-theory-concepts-for-networks", "domain-method:social-network-analysis", "conditional_conceptual_preparation_for"),
            ("domain-item:d078-networkx-tool", "domain-method:network-analysis", "tool_for"),
            ("domain-item:d078-networkx-tool", "domain-method:social-network-analysis", "works_with"),
            ("domain-item:d078-social-network-tool", "domain-method:social-network-analysis", "works_with"),
        }
        self.assertTrue(expected.issubset(self.edge_pairs))
        self.assertTrue(self.graph["validation"]["network_analysis_methods_tools_and_concepts_linked"])

    def test_each_combination_has_resolved_sources_and_explanatory_contract(self) -> None:
        registry = self.graph["external_source_registry"]
        for combo in self.graph["combination_designs"]:
            self.assertTrue(combo["sources"], combo["id"])
            self.assertTrue(set(combo["sources"]).issubset(registry), combo["id"])
            node = self.nodes[combo["id"]]
            for field in ("why_combine", "how_used", "condition", "limits", "foundation_links"):
                self.assertTrue(node.get(field), (combo["id"], field))

    def test_participatory_component_variants_are_exact_supported_intersections(self) -> None:
        combo_id = "combo:participatory-method-choice"
        combo = next(row for row in self.graph["combination_designs"] if row["id"] == combo_id)
        self.assertEqual(combo.get("component_route_variant_count"), 15)
        variants = combo.get("component_route_variants", [])
        self.assertEqual(len(variants), 15)
        self.assertTrue(combo.get("integration_contract", {}).get("framework_role"))
        method_routes = self.graph["method_area_routes"]
        role_routes = self.graph["method_area_role_routes"]
        registry = self.graph["external_source_registry"]
        for variant in variants:
            components = set(variant["selected_component_method_ids"])
            self.assertTrue(components)
            active = set(combo["required_method_ids"]) | components
            self.assertEqual(set(variant["active_method_ids"]), active)
            self.assertTrue(set(variant["source_ids"]).issubset(registry))
            expected_areas = set.intersection(*(
                {row["area_id"] for row in method_routes if row["method_id"] == method_id}
                for method_id in active
            ))
            self.assertEqual({row["area_id"] for row in variant["area_routes"]}, expected_areas)
            for area_route in variant["area_routes"]:
                expected_roles = set.intersection(*(
                    {row["role_id"] for row in role_routes
                     if row["method_id"] == method_id and row["area_id"] == area_route["area_id"]}
                    for method_id in active
                ))
                self.assertEqual(set(area_route["role_ids"]), expected_roles)
                for contribution in area_route["method_contributions"]:
                    source_route = next(row for row in method_routes
                                        if row["route_node_id"] == contribution["method_area_route_id"])
                    for field in ("task_family_ids", "area_item_ids", "explanatory_item_ids",
                                  "task_linked_domain_item_ids", "available_item_ids", "tool_ids",
                                  "domain_downstream_item_ids", "domain_tool_ids"):
                        self.assertEqual(contribution.get(field, []), source_route.get(field, []))
                for role_id in area_route["role_ids"]:
                    role_contributions = area_route["role_contributions_by_id"][role_id]
                    self.assertEqual({row["method_id"] for row in role_contributions}, active)
                    for contribution in role_contributions:
                        source_route = next(row for row in role_routes
                                            if row["route_node_id"] == contribution["method_role_route_id"])
                        self.assertEqual(source_route["role_id"], role_id)
                        self.assertEqual(source_route["area_id"], area_route["area_id"])
                        self.assertEqual(contribution["role_item_ids"], source_route["role_item_ids"])
                        self.assertEqual(contribution["method_specific_role_item_ids"], source_route["method_specific_role_item_ids"])
                        self.assertIn(source_route["route_node_id"], variant["source_route_ids"])
                variant_node = self.nodes[variant["id"]]
                self.assertFalse(variant_node["student_visible"])
                self.assertTrue(variant_node.get("source_refs"))

    def test_role_item_exposure_is_scoped_to_selected_role(self) -> None:
        owner_by_item: dict[str, set[str]] = {}
        for edge in self.edges:
            if edge["relationship"] == "selected_role_reveals_role_item":
                owner_by_item.setdefault(edge["target"], set()).add(edge["role_owner"])
        for node in self.nodes.values():
            if node.get("kind") in {"method_to_area_route", "combination_area_route"}:
                self.assertFalse(node.get("role_item_ids"), node["id"])
            if node.get("kind") in {"method_area_role_route", "combination_area_role_route"}:
                owner = node["role_id"]
                self.assertTrue(node.get("role_item_ids"), node["id"])
                self.assertTrue(all(owner in owner_by_item.get(item, set()) for item in node["role_item_ids"]))

    def test_graph_stays_a_design_artifact_not_a_student_release(self) -> None:
        self.assertFalse(self.graph["student_visible"])
        self.assertFalse(self.graph["validation"]["student_visibility_promoted"])


if __name__ == "__main__":
    unittest.main()
