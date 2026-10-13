import json
import unittest
from collections import defaultdict, deque
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
ROLE_PATH = ROOT / "data/career-mapping/role_library_v3_cleaned.json"

EXPECTED_AREAS = {
    "D078:sociology-social-anthropology": "Sociology and Social Anthropology",
    "D078:economics-applied-analysis": "Economics and Applied Economic Analysis",
    "D078:politics-governance-public-policy": "Politics, Governance and Public Policy",
    "D078:psychology-social-behaviour": "Social Behaviour and Interaction",
    "D078:human-geography-population": "Human Geography and Population Studies",
    "D078:social-research-evaluation": "Social Research and Evaluation",
    "D078:computational-digital-social-science": "Computational and Digital Social Science",
}


class D078AreaRoleGraphTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
        cls.roles = json.loads(ROLE_PATH.read_text(encoding="utf-8"))
        cls.nodes = {node["id"]: node for node in cls.graph["nodes"]}
        cls.edges = cls.graph["edges"]

    def test_only_the_seven_current_areas_are_area_nodes(self):
        areas = [n for n in self.nodes.values() if n.get("kind") == "area_of_specialization"]
        self.assertEqual({n.get("area_id"): n.get("label") for n in areas}, EXPECTED_AREAS)
        self.assertFalse(any("subgroup" in str(n.get("kind", "")).lower() for n in self.nodes.values()))

    def test_every_path_role_has_both_domain_and_area_routes(self):
        roles = [n for n in self.nodes.values() if n.get("kind") == "role"]
        self.assertEqual(len(roles), 19)
        for role in roles:
            domain_edges = [e for e in self.edges if e.get("relationship") == "domain_to_role" and e.get("target") == role["id"]]
            area_edges = [e for e in self.edges if e.get("relationship") == "area_to_role" and e.get("target") == role["id"]]
            self.assertEqual(len(domain_edges), 1, role["label"])
            self.assertGreaterEqual(len(area_edges), 1, role["label"])
            self.assertIn(domain_edges[0]["status"], {"reviewed_supported", "reviewed_conditional"})
            self.assertTrue(all(e["source"] in {n["id"] for n in self.nodes.values() if n.get("kind") == "area_of_specialization"} for e in area_edges))
            self.assertTrue(all(e["status"] in {"reviewed_supported", "reviewed_conditional"} for e in area_edges))
            if domain_edges[0]["status"] == "reviewed_conditional":
                self.assertTrue(domain_edges[0].get("conditional_use_case"))
            for edge in area_edges:
                if edge["status"] == "reviewed_conditional":
                    self.assertTrue(edge.get("scope_condition"))

    def test_domain_only_and_unsupported_roles_are_not_path_nodes(self):
        path_names = {n.get("label") for n in self.nodes.values() if n.get("kind") == "role"}
        for role in self.roles:
            if role.get("domain_id") != "D078":
                continue
            domain = next((x for x in role.get("role_domain_routes", []) if x.get("domain_id") == "D078"), None)
            areas = [x for x in role.get("role_area_routes", [])
                     if x.get("area_id") in EXPECTED_AREAS and x.get("status") in {"supported", "conditional"}]
            eligible = bool(domain and domain.get("status") in {"supported", "conditional"} and areas
                            and role.get("specialization_fit_status") != "unsupported")
            self.assertEqual(role.get("role_name") in path_names, eligible, role.get("role_name"))

    def test_all_old_and_new_area_items_and_lane_sources_are_retained(self):
        validation = self.graph["validation"]
        reconciliation = self.graph["area_reconciliation"]
        self.assertEqual(validation["area_learning_item_nodes"], 36)
        self.assertEqual(validation["new_area_enrichment_item_nodes"], 144)
        self.assertEqual(validation["area_application_reference_nodes"], 2)
        self.assertEqual(sum(reconciliation["source_lane_item_record_counts"].values()), 144)
        self.assertTrue(reconciliation["all_lane_artifacts_included"])
        refs = [n for n in self.nodes.values() if n.get("kind") == "area_tool_application_reference"]
        self.assertEqual(len(refs), 2)
        for ref in refs:
            self.assertTrue(any(e.get("target") == ref["id"] and e.get("relationship") == "domain_tool_applied_within_area" for e in self.edges))

    def test_every_domain_item_keeps_its_researched_category(self):
        items = [n for n in self.nodes.values() if n.get("kind") == "domain_learning_item"]
        self.assertEqual(len(items), 53)
        for item in items:
            self.assertTrue(item.get("category"), item.get("contract_id"))
            rationale = item.get("category_rationale") or {}
            if item.get("category_source") == "category_rationale":
                self.assertEqual(item["category"], rationale.get("category"), item.get("contract_id"))

    def test_area_relationship_contracts_are_part_of_the_hidden_graph(self):
        audit = self.graph["area_reconciliation"]["relationship_graph"]
        self.assertGreater(audit["area_item_relationship_edges"], 0)
        relationship_edges = [
            edge for edge in self.edges
            if edge.get("status") == "area_relationship_candidate_not_sequence_approved"
        ]
        self.assertEqual(len(relationship_edges), audit["area_item_relationship_edges"])
        self.assertEqual(audit["unresolved_relationship_evidence_source_ids"], 0)
        for edge in relationship_edges:
            self.assertFalse(edge.get("student_visible"))
            self.assertFalse(edge.get("sequence_approved"))
            self.assertTrue(edge.get("declared_by_item_id"))
            self.assertIn("relationship-specific", edge.get("evidence_scope", ""))
            if edge.get("evidence_source_ids") and edge.get("relationship") not in {"prerequisite_text", "alternative_option"}:
                self.assertTrue(edge.get("evidence_sources") or edge.get("relationship_evidence_source_ids_unresolved"))
        alternatives = [edge for edge in relationship_edges if edge.get("relationship") in {"alternative_option", "alternative_to"}]
        self.assertTrue(alternatives)
        self.assertFalse(any(edge.get("relationship") in {"requires", "builds_on", "prerequisite_text"} for edge in alternatives))
        refs = [node for node in self.nodes.values() if node.get("kind") == "area_relationship_reference"]
        annotations = [node for node in self.nodes.values() if node.get("kind") == "area_relationship_annotation"]
        dispositions = [node for node in self.nodes.values() if node.get("disposition_status")]
        candidates = [node for node in self.nodes.values() if node.get("kind") == "area_relationship_candidate_item"]
        self.assertEqual(len(dispositions), 192)
        self.assertEqual(audit["disposition_reconciliation"]["reference_records"], 192)
        self.assertEqual(audit["disposition_reconciliation"]["unresolved_reference_records"], 0)
        self.assertTrue(all(not node.get("student_visible") and not node.get("sequence_approved") for node in dispositions))
        self.assertEqual(len(candidates), 2)
        self.assertEqual(len(annotations), audit["descriptive_relationship_annotations"])
        self.assertEqual(audit["area_item_relationship_edges"], 923)
        self.assertEqual(audit["pre_disposition_resolved_target_references"], 116)
        self.assertEqual(audit["pre_disposition_unresolved_typed_target_references"], 192)
        self.assertEqual(audit["resolved_target_references"], 176)
        self.assertEqual(audit["unresolved_typed_target_references"], 0)
        self.assertEqual(audit["descriptive_relationship_annotations"], 744)
        self.assertEqual(audit["new_hidden_candidate_reference_records"], 3)
        self.assertEqual(audit["unique_hidden_candidate_items"], 2)

        self.assertEqual(audit["disposition_reconciliation"]["sequence_critical_records_dispositioned_not_approved"], 19)
        self.assertFalse(any(node.get("resolution_status", "").startswith("unresolved") for node in dispositions))
        self.assertTrue(all(not node.get("student_visible") for node in refs))
        self.assertTrue(all(not node.get("student_visible") and not node.get("is_learning_item") for node in annotations))
        self.assertEqual(audit["status"], "relationship_references_dispositioned_sequence_design_approved_relationships_hidden")
        self.assertFalse(audit["sequence_approved"])
        self.assertFalse(audit["student_visible"])
        self.assertEqual(self.graph["validation"]["relationship_disposition_reference_records"], 192)
        self.assertEqual(self.graph["validation"]["relationship_disposition_unresolved_records"], 0)
        self.assertFalse(self.graph["validation"]["relationship_disposition_student_visible"])
        self.assertFalse(self.graph["validation"]["relationship_disposition_sequence_approved"])

    def test_sequence_direction_review_covers_19_refs_without_approving_edges(self):
        audit = self.graph["area_reconciliation"]["relationship_graph"]["sequence_direction_review"]
        critical = [
            node for node in self.nodes.values()
            if node.get("reference_type") in {"requires", "builds_on", "prerequisite", "prerecedes", "precedes"}
        ]
        self.assertEqual(len(critical), 19)
        self.assertEqual(audit["reference_records"], 19)
        self.assertEqual(audit["unreviewed_critical_references"], 0)
        self.assertEqual(audit["candidate_sequence_edges_created"], 3)
        self.assertEqual(len(audit["source_checks"]), 2)
        self.assertEqual(sum(check["reference_records"] for check in audit["source_checks"]), 19)
        self.assertFalse(audit["sequence_approved"])
        self.assertFalse(audit["student_visible"])
        for node in critical:
            self.assertEqual(node.get("local_sequence_review_status"), "source_checks_reconciled_hidden_route_sequence_candidates_built_not_approved")
            self.assertTrue(node.get("sequence_interpretation"), node["id"])
            self.assertTrue(node.get("sequence_action"), node["id"])
            self.assertEqual(node.get("sequence_source_check_status"), "completed_opened_record_specific_sources")
            self.assertTrue(node.get("sequence_source_check_artifact"), node["id"])
            self.assertFalse(node.get("sequence_approved"))
            self.assertFalse(node.get("student_visible"))
            for target_id in node.get("candidate_prerequisite_node_ids", []):
                self.assertIn(target_id, self.nodes, node["id"])

    def test_sociology_fixed_curriculum_is_context_not_selectable_extra_learning(self):
        programme = self.nodes["programme:social-sciences:sociology"]
        themes = [node for node in self.nodes.values() if node.get("kind") == "programme_theme"]
        self.assertEqual(len(themes), 14)
        self.assertEqual(programme["curriculum_course_count"], 34)
        self.assertTrue(programme["fixed_curriculum"])
        self.assertFalse(programme["selectable"])
        self.assertTrue(all(theme["fixed_curriculum"] and not theme["selectable"] for theme in themes))
        transition = [edge for edge in self.edges if edge.get("id") == "sequence:programme-sociology-to-domain-d078"]
        self.assertEqual(len(transition), 1)
        self.assertEqual((transition[0]["source"], transition[0]["target"]), (programme["id"], "domain:D078"))
        self.assertEqual(transition[0]["match_type"], "direct")
        self.assertEqual(transition[0]["course_anchor_count"], 19)
        self.assertFalse(transition[0]["student_visible"])
        design = self.graph["learning_path_design"]
        self.assertFalse(design["student_visible"])
        self.assertTrue(design["sequence_approved"])
        self.assertEqual([layer["layer"] for layer in design["ordered_layers"]], [
            "programme_context", "shared_domain_foundation", "selected_area_of_specialization", "optional_role"
        ])

    def test_only_approved_source_checked_route_scoped_sequence_edges_are_emitted_hidden(self):
        audit = self.graph["area_reconciliation"]["relationship_graph"]["sequence_direction_review"]
        approved_edges = [edge for edge in self.edges if edge.get("status") == "approved_route_scoped_sequence_hidden_until_release"]
        self.assertEqual(len(approved_edges), 3)
        self.assertEqual(audit["approved_sequence_edges_created"], 3)
        expected = {
            ("domain-item:d078-quantitative-approach", "area_enrichment_item:d078-econ-applied-econometrics"),
            ("area_enrichment_item:d078-econ-applied-econometrics", "area_enrichment_item:d078-econ-causal-ml"),
            ("area_enrichment_item:d078-econ-agent-based-modeling", "area_enrichment_item:d078-econ-casevo-llm-sim"),
        }
        self.assertEqual({(edge["source"], edge["target"]) for edge in approved_edges}, expected)
        for edge in approved_edges:
            self.assertTrue(edge.get("route_scope"))
            self.assertTrue(edge.get("condition"))
            self.assertTrue(edge.get("evidence_reference_ids"))
            self.assertTrue(edge["sequence_approved"])
            self.assertFalse(edge["student_visible"])
        adjacency = defaultdict(list)
        indegree = {node_id: 0 for node_id in self.nodes}
        for edge in self.edges:
            if edge.get("relationship") != "prerequisite_for":
                continue
            adjacency[edge["source"]].append(edge["target"])
            indegree[edge["target"]] += 1
        ready = deque(node_id for node_id, degree in indegree.items() if degree == 0)
        visited = 0
        while ready:
            source = ready.popleft()
            visited += 1
            for target in adjacency[source]:
                indegree[target] -= 1
                if indegree[target] == 0:
                    ready.append(target)
        self.assertEqual(visited, len(self.nodes), "Prerequisite/sequence edges must remain acyclic")
        self.assertEqual(self.graph["validation"]["candidate_sequence_edges"], 3)
        self.assertEqual(self.graph["validation"]["programme_theme_nodes"], 14)
        self.assertEqual(self.graph["validation"]["programme_domain_transition_edges"], 1)

    def test_full_path_sequence_dispositions_are_approved_but_hidden_until_release(self):
        audit = self.graph["area_reconciliation"]["relationship_graph"]["full_path_sequence_design"]
        self.assertEqual(audit["status"], "sequence_design_approved_hidden_release_gates_open")
        self.assertEqual(audit["direct_area_order_declaration_count"], 27)
        self.assertEqual(len(audit["direct_area_order_dispositions"]), 27)
        self.assertEqual(audit["strict_learning_dependency_candidate_count"], 3)
        self.assertEqual(len(audit["strict_learning_dependencies"]), 3)
        self.assertEqual(audit["raw_role_prerequisite_notes_not_hard_edges"], 402)
        self.assertTrue(audit["sequence_approved"])
        self.assertFalse(audit["student_visible"])
        self.assertFalse(audit["canonical_promotion"])
        for disposition in audit["direct_area_order_dispositions"]:
            self.assertFalse(disposition["hard_learning_dependency"])
            self.assertFalse(disposition["student_visible"])
        for dependency in audit["strict_learning_dependencies"]:
            self.assertTrue(dependency["sequence_approved"])
            self.assertFalse(dependency["student_visible"])
        validation = self.graph["validation"]
        self.assertTrue(validation["full_path_sequence_design_integrated"])
        self.assertEqual(validation["full_path_area_order_declarations_dispositioned"], 27)
        self.assertEqual(validation["full_path_strict_dependency_candidates"], 3)
        self.assertTrue(validation["full_path_sequence_design_sequence_approved"])
        self.assertFalse(validation["full_path_sequence_design_student_visible"])

    def test_full_guided_path_inventory_is_layered_and_nothing_is_dropped(self):
        design = self.graph["learning_path_design"]
        bands = design["domain_content_bands"]
        self.assertEqual(sum(band["item_count"] for band in bands.values()) + design["area_owned_specialist_domain_inventory"]["unique_item_count"] + design["admin_boundary_notes_not_learning_steps"]["item_count"], 53)
        self.assertEqual(bands["most_versatile_foundation"]["item_count"], 3)
        self.assertEqual(design["admin_boundary_notes_not_learning_steps"]["item_count"], 1)
        self.assertEqual(design["area_owned_specialist_domain_inventory"]["unique_item_count"], 8)
        self.assertEqual(sum(area["specialization_owned_domain_item_count"] for area in design["area_branches"]), 8)
        self.assertEqual(len(design["area_branches"]), 7)
        self.assertEqual(sum(branch["item_count"] for branch in design["area_branches"]), 144)
        self.assertEqual(sum(branch["source_and_free_resource_bundle_count"] for branch in design["area_branches"]), 144)
        self.assertEqual(sum(branch["source_or_free_resource_gap_count"] for branch in design["area_branches"]), 0)
        self.assertTrue(all(branch["inherits_domain_layer_without_duplicate_requirements"] for branch in design["area_branches"]))
        self.assertEqual(len(design["role_branches"]), 19)
        role_coverage = design["role_item_coverage"]
        self.assertEqual(role_coverage["all_records_integrated"], 173)
        self.assertEqual(role_coverage["approved_for_later_integration"], 76)
        self.assertEqual(role_coverage["conditional_for_later_integration"], 87)
        self.assertEqual(role_coverage["hidden_final_disposition"], 10)
        self.assertEqual(role_coverage["candidate_item_nodes_with_supported_role_edge"], 163)
        self.assertEqual(self.graph["validation"]["guided_path_domain_items_accounted"], 53)
        self.assertEqual(self.graph["validation"]["guided_path_area_items_accounted"], 144)
        self.assertEqual(self.graph["validation"]["guided_path_role_branches"], 19)
        self.assertEqual(self.graph["validation"]["guided_path_role_item_records"], 173)
        self.assertFalse(design["student_visible"])
        self.assertTrue(design["sequence_approved"])
        self.assertEqual(design["canonical_promotions"], 0)

    def test_area_resource_repairs_are_attached_hidden_and_cover_every_area_item(self):
        repair = self.graph["area_reconciliation"]["area_resource_repairs"]
        self.assertEqual(repair["records"], 35)
        self.assertEqual(repair["records_by_area"], {
            "D078:computational-digital-social-science": 15,
            "D078:human-geography-population": 9,
            "D078:social-research-evaluation": 11,
        })
        self.assertEqual(repair["area_items_with_evidence_and_free_learning_route"], 144)
        self.assertEqual(repair["area_items_still_missing_evidence_or_free_learning_route"], 0)
        self.assertFalse(repair["student_visible"])
        self.assertFalse(repair["sequence_approved"])
        self.assertEqual(repair["canonical_promotions"], 0)
        repaired_nodes = [node for node in self.nodes.values() if node.get("area_resource_repair")]
        self.assertEqual(len(repaired_nodes), 35)
        self.assertTrue(all(not node["student_visible"] for node in repaired_nodes))

    def test_everything_remains_hidden_and_no_retired_area_label_is_emitted(self):
        serialized = json.dumps(self.graph, ensure_ascii=False).casefold()
        self.assertEqual(self.graph["validation"]["total_nodes"], len(self.graph["nodes"]))
        self.assertEqual(self.graph["validation"]["total_edges"], len(self.graph["edges"]))
        self.assertFalse(self.graph["student_visible"])
        self.assertEqual(self.graph["validation"]["canonical_promotions"], 0)
        self.assertFalse(self.graph["validation"]["all_student_visible"])
        self.assertNotIn("social, cultural & economic research", serialized)
        self.assertNotIn("computational and quantitative social research", serialized)
        self.assertFalse(self.graph["validation"]["role_fit_reopened"])
        self.assertTrue(self.graph["validation"]["every_path_role_has_domain_and_area_route"])
        self.assertEqual(self.graph["hidden_final_disposition_items"], 10)
        self.assertEqual(self.graph["unresolved_student_items"], 0)
        item_reconciliation = self.graph["role_route_reconciliation"]["role_item_reconciliation"]
        self.assertEqual(item_reconciliation["route_candidate_records_in_rebuilt_graph"], 163)
        self.assertEqual(item_reconciliation["hidden_with_final_reason"], 10)
        self.assertEqual(self.graph["validation"]["role_item_nodes"], 173)
        self.assertEqual(self.graph["validation"]["approved_role_item_records"], 76)
        self.assertEqual(self.graph["validation"]["conditional_role_item_records"], 87)


if __name__ == "__main__":
    unittest.main()
