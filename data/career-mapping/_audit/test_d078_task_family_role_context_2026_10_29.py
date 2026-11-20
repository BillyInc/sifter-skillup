"""Regression checks for the D078 area task-family → role-task graph repair."""
from __future__ import annotations

import json
from itertools import combinations
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
UI_DATA = ROOT / "src/data/d078MethodAwareUiData.json"


class D078TaskFamilyRoleContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.graph = json.loads(GRAPH.read_text(encoding="utf-8"))
        cls.nodes = {node["id"]: node for node in cls.graph["nodes"]}
        cls.edges = cls.graph["edges"]
        cls.ui = json.loads(UI_DATA.read_text(encoding="utf-8"))

    def test_optional_family_focus_only_uses_method_routed_families(self):
        routed = {family_id for route in self.graph["method_area_routes"] for family_id in route.get("task_family_ids", [])}
        for design in self.graph.get("combination_designs", []):
            for route in design.get("area_routes", []):
                routed.update(route.get("task_family_ids", []))
                for contribution in route.get("method_contributions", []):
                    routed.update(contribution.get("task_family_ids", []))
            for variant in design.get("component_route_variants", []):
                for route in variant.get("area_routes", []):
                    routed.update(route.get("task_family_ids", []))
                    for contribution in route.get("method_contributions", []):
                        routed.update(contribution.get("task_family_ids", []))
        for route in self.graph.get("nodes", []):
            if route.get("kind") == "combination_component_area_route":
                routed.update(route.get("task_family_ids", []))
        families = {node_id for node_id, node in self.nodes.items() if node.get("kind") == "area_task_family"}
        self.assertTrue(routed.issubset(families))
        self.assertTrue(all(self.nodes[node_id].get("approval") == "approved" for node_id in routed))
        self.assertTrue(all(self.nodes[node_id].get("student_visible") is True for node_id in routed))
        self.assertTrue(all(self.nodes[node_id].get("student_visible") is False for node_id in families - routed))
        contract = self.graph["area_task_family_selection_contract"]
        self.assertEqual(contract["minimum_selections"], 0)
        self.assertTrue(contract["multiple_selection_allowed"])
        self.assertIn("do not block", contract["no_family_selected_behavior"])

    def test_stale_programme_area_and_specialist_flags_are_reconciled(self):
        programme = self.nodes["programme:social-sciences:sociology"]
        self.assertEqual((programme.get("approval"), programme.get("student_visible")), ("approved", True))
        themes = [node for node in self.nodes.values() if node.get("kind") == "programme_theme"]
        outcomes = [node for node in self.nodes.values() if node.get("kind") == "programme_outcome"]
        areas = [node for node in self.nodes.values() if node.get("kind") == "area_of_specialization"]
        self.assertEqual(len(themes), 14)
        self.assertEqual(len(outcomes), 236)
        self.assertTrue(all(node.get("approval") == "approved" and node.get("student_visible") is True for node in themes + outcomes))
        self.assertEqual(len(areas), 7)
        self.assertTrue(all(node.get("approval") == "approved" and node.get("student_visible") is True and node.get("student_selectable") is True for node in areas))
        overview = self.graph["domain_overview_contract"]
        self.assertEqual(overview["domain_node_id"], "domain:D078")
        self.assertTrue(set(overview["orientation_fields"]).issubset(overview["evidence_fields"]))
        self.assertTrue(self.graph["student_visible"])
        self.assertTrue(self.ui["student_visible"])

        predictive = self.nodes["area_enrichment_item:d078-computational-digital-social-science-predictive-text-modeling"]
        self.assertEqual(predictive.get("approval"), "approved")
        self.assertTrue(predictive.get("student_visible"))
        self.assertTrue(predictive.get("student_selectable"))
        self.assertEqual(predictive.get("requirement_lane"), "conditional")
        self.assertTrue(predictive.get("skippable"))
        self.assertEqual(predictive.get("blocking_policy"), "never")
        self.assertIn("AfriSenti", predictive.get("task_context", ""))
        self.assertEqual(predictive.get("review_disposition", {}).get("decision"), "approved_conditional_specialist_learning_route")
        route_edges = [edge for edge in self.edges if edge.get("target") == predictive["id"] and edge.get("relationship") == "task_has_area_learning_item"]
        self.assertEqual(len(route_edges), 1)
        self.assertTrue(route_edges[0].get("student_visible"))

    def test_route_referenced_learning_cards_have_final_item_decisions(self):
        selectable_fields = (
            "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
            "domain_downstream_item_ids", "tool_ids", "domain_tool_ids", "role_item_ids",
            "method_specific_role_item_ids",
        )
        route_collections = (
            "method_area_routes", "method_area_role_routes", "combination_area_routes",
            "combination_area_role_routes",
        )
        referenced = {
            item_id
            for collection in route_collections
            for route in self.graph.get(collection, [])
            for field in selectable_fields
            for item_id in route.get(field, [])
        }
        for item_id in referenced:
            node = self.nodes[item_id]
            self.assertIs(node.get("student_visible"), True, item_id)
            self.assertIsNot(node.get("student_selectable"), False, item_id)
            self.assertNotEqual(node.get("approval"), "unapproved", item_id)

        area_candidates = [
            self.nodes[item_id]
            for item_id in referenced
            if self.nodes[item_id].get("kind") == "area_enrichment_item"
        ]
        for node in area_candidates:
            self.assertEqual(node.get("approval"), "approved", node["id"])
            self.assertTrue(node.get("meaning") or node.get("plain_language_meaning"), node["id"])
            self.assertTrue(node.get("learner_output"), node["id"])
            self.assertTrue(node.get("limitations"), node["id"])
            self.assertTrue(any(ref.get("url", "").startswith("http") for ref in node.get("evidence", [])), node["id"])
            self.assertTrue(any(ref.get("url", "").startswith("http") for ref in node.get("learning_links", [])), node["id"])
            self.assertTrue(node.get("area_task_contexts"), node["id"])

    def test_generic_inherited_area_placeholders_are_absent_from_the_graph(self):
        generic_id = "area-item:d078-human-geography-population:d078-human-geography-population-core-task-family:4:gis-spatial-analysis-only-when-a-spatial-question-supports-it"
        self.assertNotIn(generic_id, self.nodes)
        self.assertFalse(any(node.get("kind") == "area_learning_item" for node in self.nodes.values()))
        self.assertFalse(any(edge.get("source", "").startswith("area-item:") or edge.get("target", "").startswith("area-item:")
                             for edge in self.edges))

    def test_method_domain_and_area_learning_links_are_visible_and_nonblocking(self):
        relations = {
            "method_applies_to_area_task",
            "method_contribution_applies_to_area_task",
            "domain_item_supports_area_task",
            "task_has_area_learning_item",
        }
        active = [edge for edge in self.edges if edge.get("relationship") in relations]
        eligible = [edge for edge in active if edge.get("student_visible") is True]
        excluded = [edge for edge in active if edge.get("status") == "excluded_from_student_route"]
        self.assertEqual((len(active), len(eligible), len(excluded)), (684, 677, 7))
        self.assertTrue(all(edge.get("status") == "resolved_ready_for_use" for edge in eligible))
        self.assertTrue(all(edge.get("blocking_policy") == "never" for edge in active))
        self.assertTrue(all(edge.get("sequence_policy") == "none" for edge in active))
        self.assertTrue(all(
            (edge.get("relationship") == "domain_item_supports_area_task"
             and edge.get("evidence_basis") == "no_exact_reviewed_domain_area_task_crosswalk")
            or (edge.get("relationship") == "task_has_area_learning_item"
                and edge.get("evidence_basis") == "no_unique_exact_source_task_item_membership")
            for edge in excluded
        ))

    def test_domain_and_area_item_links_have_exact_relationship_evidence(self):
        domain_links = [edge for edge in self.edges if edge.get("relationship") == "domain_item_supports_area_task"]
        area_links = [edge for edge in self.edges if edge.get("relationship") == "task_has_area_learning_item"]
        self.assertEqual(len(domain_links), 260)
        self.assertEqual(len(area_links), 125)
        for edge in domain_links:
            if edge.get("status") == "excluded_from_student_route":
                self.assertIs(edge.get("student_visible"), False)
                self.assertEqual(edge.get("evidence_basis"), "no_exact_reviewed_domain_area_task_crosswalk")
                continue
            self.assertEqual(edge.get("evidence_basis"), "reviewed_domain_item_area_task_synthesis")
            self.assertTrue(edge.get("route_fit"))
            self.assertTrue(edge.get("fit_claim_limit"))
            self.assertTrue(edge.get("source_references"))
            self.assertTrue(any(ref.get("source_role") == "domain_item_evidence" for ref in edge["source_references"]))
            self.assertTrue(any(ref.get("source_role") == "area_task_evidence" for ref in edge["source_references"]))
        for edge in area_links:
            if edge.get("status") == "excluded_from_student_route":
                self.assertIs(edge.get("student_visible"), False)
                self.assertEqual(edge.get("evidence_basis"), "no_unique_exact_source_task_item_membership")
                continue
            if edge.get("evidence_basis") == "reviewed_internal_task_learning_concept_to_existing_canonical_item":
                self.assertTrue(edge.get("id", "").startswith("reviewed-local-task-item:"))
                self.assertEqual(edge.get("blocking_policy"), "never")
                self.assertEqual(edge.get("sequence_policy"), "none")
                self.assertTrue(edge.get("recommendation_only"))
                self.assertTrue(edge.get("condition"))
                self.assertTrue(edge.get("fit_claim_limit"))
                self.assertTrue(any(ref.get("source_role") == "area_task_item_relationship_evidence" for ref in edge["source_references"]))
                self.assertTrue(any(ref.get("source_role") == "task_specific_learning_resource" for ref in edge["source_references"]))
                continue
            if edge.get("evidence_basis") == "reviewed_canonical_domain_tool_area_context":
                self.assertTrue(edge.get("id", "").startswith("canonical-area-tool-context:"))
                self.assertIn(edge.get("target"), {"domain-item:d078-mesa-tool", "domain-item:d078-casevo-tool"})
                self.assertTrue(edge.get("area_id"))
                self.assertEqual(edge.get("blocking_policy"), "never")
                self.assertTrue(any(ref.get("source_role") == "domain_item_evidence" for ref in edge.get("source_references", [])))
                self.assertTrue(any(ref.get("source_role") == "area_task_evidence" for ref in edge.get("source_references", [])))
                continue
            if edge.get("evidence_basis") == "reviewed_peer_method_paper_and_project_learning_material":
                self.assertEqual(
                    edge.get("id"),
                    "verified-source-family-item:area-task:d078-human-geography-population-spatial-patterns->area_enrichment_item:d078-human-geography-geographical-random-forest",
                )
                self.assertEqual(edge.get("relationship"), "task_has_area_learning_item")
                self.assertEqual(edge.get("blocking_policy"), "never")
                self.assertIn("selected Human Geography spatial-pattern task context", edge.get("condition", ""))
                self.assertTrue(any(ref.get("source_role") == "area_item_evidence" for ref in edge.get("source_references", [])))
                self.assertTrue(any(ref.get("source_role") == "task_specific_learning_resource" for ref in edge.get("source_references", [])))
                continue
            self.assertEqual(edge.get("evidence_basis"), "reviewed_area_task_item_synthesis")
            self.assertTrue(edge.get("condition"))
            self.assertTrue(edge.get("fit_claim_limit"))
            self.assertTrue(edge.get("source_references"))
            self.assertTrue(any(ref.get("source_role") == "area_item_evidence" for ref in edge["source_references"]))
            self.assertTrue(any(ref.get("source_role") == "area_task_evidence" for ref in edge["source_references"]))

    def test_local_sociology_task_item_links_reach_every_matching_sequence_route(self):
        addenda = self.graph["area_task_item_link_addenda"]
        self.assertEqual(addenda["applied_count"], 3)
        self.assertFalse(addenda["creates_new_learning_items"])
        self.assertFalse(addenda["creates_prerequisites_or_order"])
        routes = self.graph["selection_progression_contract"]["routes"]
        for link in addenda["links"]:
            edge = next(edge for edge in self.edges if edge.get("id") == link["edge_id"])
            self.assertEqual(edge.get("status"), "resolved_ready_for_use")
            self.assertEqual(edge.get("requirement_lane"), "useful_optional")
            matching_routes = [
                route for route in routes
                if link["family_id"] in {
                    family_id
                    for stage in route["sequence_plan"]["stages"]
                    for family_id in stage.get("task_family_ids", [])
                }
            ]
            self.assertTrue(matching_routes, link["family_id"])
            for route in matching_routes:
                area_stage = next(
                    stage for stage in route["sequence_plan"]["stages"]
                    if stage["stage_id"] == "area_learning_and_tools"
                )
                projected = set(area_stage.get("item_ids", []))
                projected.update(item for values in area_stage.get("item_ids_by_requirement_lane", {}).values() for item in values)
                projected.update(area_stage.get("tool_ids", []))
                self.assertIn(link["item_id"], projected, route["route_id"])

    def test_area_sequence_contains_only_approved_or_source_supported_nonblocking_edges(self):
        edges = [edge for edge in self.edges if str(edge.get("id", "")).startswith("area-sequence:")]
        self.assertEqual(len(edges), 15)
        self.assertEqual(sum(edge.get("sequence_policy") == "conditional_prerequisite" for edge in edges), 3)
        self.assertEqual(sum(edge.get("sequence_policy") == "workflow" for edge in edges), 12)
        self.assertTrue(all(edge.get("sequence_approved") is True for edge in edges))
        self.assertTrue(all(edge.get("blocking_policy") == "never" for edge in edges))
        self.assertTrue(all(edge.get("recommendation_only") is True for edge in edges))
        self.assertTrue(all(edge.get("source_references") for edge in edges))
        self.assertTrue(all(edge.get("condition") and edge.get("fit_claim_limit") for edge in edges))
        self.assertTrue(self.graph["area_sequence_reconciliation"]["cycle_check_passed"])
        self.assertEqual(self.graph["area_sequence_reconciliation"]["other_area_relationship_dispositions_remain_non_sequence"], 22)

    def test_role_items_remain_optional_and_are_not_given_invented_item_order(self):
        contract = self.graph["role_learning_sequence_contract"]
        self.assertEqual(contract["eligible_role_item_count"], 164)
        self.assertEqual(contract["role_item_lane_counts"], {"conditional": 94, "useful_optional": 70})
        self.assertEqual(contract["approved_role_item_dependency_edges"], 0)
        self.assertFalse(contract["role_items_are_method_specific"])
        self.assertTrue(contract["all_role_items_skippable"])
        self.assertTrue(contract["role_path_complete_without_optional_role_item"])

    def test_role_task_items_follow_refreshed_ledger_not_stale_graph_flags(self):
        summary = self.graph["role_task_item_reconciliation"]
        edges = [edge for edge in self.edges if edge.get("relationship") == "role_task_supports_role_item"]
        self.assertEqual(summary["ledger_records"], 173)
        self.assertEqual(summary["verified_role_task_item_records_exposed"], 164)
        self.assertEqual(summary["typed_role_task_item_context_edges"], 220)
        self.assertEqual(summary["hidden_by_final_no_area_route_disposition"], 7)
        self.assertEqual(summary["hidden_by_item_scope_conflict"], 2)
        self.assertEqual(summary["unresolved_owner_or_task_join"], 0)
        self.assertEqual(len(edges), 220)
        for edge in edges:
            self.assertEqual(edge.get("evidence_basis"), "locally_verified_bounded_role_task_output_plus_item_and_role_sources")
            self.assertTrue(edge.get("source_references"))
            self.assertTrue(edge.get("condition"))
            self.assertTrue(edge.get("fit_claim_limit"))
            self.assertTrue(edge.get("recommendation_only"))
            self.assertEqual(edge.get("blocking_policy"), "never")
            self.assertEqual(edge.get("sequence_policy"), "none")
        hidden = [node for node in self.nodes.values() if node.get("kind") == "role_item_candidate" and node.get("student_visible") is False]
        # A role-owned item is visible only when the rebuilt graph places it
        # under a reviewed task context. Route-less and explicitly unapproved
        # records remain hidden; forensic anthropology and human physiology
        # retain their item-specific scope-conflict explanations.
        self.assertEqual(len(hidden), 9)
        self.assertEqual(sum(node.get("student_display_eligibility_reason") == "no_current_role_owner" for node in hidden), 3)
        self.assertEqual(sum(node.get("student_display_eligibility_reason") == "no_supported_d078_learning_route" for node in hidden), 2)
        self.assertEqual(sum(node.get("student_display_eligibility_reason") == "unapproved_item_disposition" for node in hidden), 2)
        self.assertEqual(sum(node.get("approval_status") == "unapproved" for node in hidden), 2)
        self.assertEqual(sum(node.get("id") in {
            "role-item:127:forensic-anthropology-optional",
            "role-item:143:human-physiology-optional",
        } for node in hidden), 2)

    def test_role_task_context_has_reviewed_area_and_role_evidence(self):
        family_role = [edge for edge in self.edges if edge.get("relationship") == "area_task_family_supports_role_task"]
        role_edges = [edge for edge in self.edges if edge.get("relationship") == "role_task_family_of_role"]
        self.assertEqual(len(family_role), 47)
        self.assertEqual(len(role_edges), 19)
        self.assertEqual(sum(node.get("kind") == "role_task_family" for node in self.nodes.values()), 19)
        for edge in family_role:
            family = self.nodes[edge["source"]]
            task = self.nodes[edge["target"]]
            self.assertEqual(family["area_id"] in task["area_ids"], True)
            self.assertGreaterEqual(len(edge.get("evidence_source_ids", [])), 2)
            self.assertTrue(edge.get("condition"))
            self.assertTrue(edge.get("fit_claim_limit"))
            self.assertEqual(edge.get("blocking_policy"), "never")
            self.assertEqual(edge.get("sequence_policy"), "none")
        self.assertTrue(all(edge["source"] in self.nodes and edge["target"] in self.nodes for edge in family_role + role_edges))

    def test_role_prerequisites_are_audited_before_any_later_alternatives_or_ui_pass(self):
        audit = self.graph["role_prerequisite_reconciliation"]
        self.assertEqual(audit["status"], "reviewed_role_foundation_and_item_preparation_notes_dispositioned")
        self.assertEqual(audit["current_d078_roles_reviewed"], 19)
        self.assertEqual(audit["role_item_records_reviewed"], 173)
        self.assertEqual(audit["role_item_preparation_notes_preserved"], 405)
        self.assertEqual(audit["distinct_role_item_preparation_notes"], 382)
        self.assertEqual(audit["visible_role_foundation_nodes"], 0)
        self.assertEqual(audit["approved_role_learning_dependency_edges"], 0)
        self.assertEqual(len(audit["per_role_decisions"]), 19)
        self.assertTrue(all(row["role_task_context_node_id"] for row in audit["per_role_decisions"]))
        self.assertTrue(all(row["selected_area_task_context_ids"] for row in audit["per_role_decisions"]))
        self.assertTrue(all(
            row["separate_role_foundation_before_task"] == "not_supported_by_reviewed_sequence_evidence"
            for row in audit["per_role_decisions"]
        ))
        self.assertTrue(audit["alternatives_and_ui_progression_are_out_of_scope"])

        role_items = [node for node in self.nodes.values() if node.get("kind") == "role_item_candidate"]
        self.assertEqual(len(role_items), 173)
        self.assertTrue(all(node.get("preparation_context_is_sequence_edge") is False for node in role_items))
        self.assertTrue(all(node.get("preparation_context_source_locator") for node in role_items))
        self.assertTrue(all(node.get("preparation_context_policy") for node in role_items))
        self.assertEqual(sum(len(node.get("preparation_context_notes", [])) for node in role_items), 405)

        task_nodes = [node for node in self.nodes.values() if node.get("kind") == "role_task_family"]
        self.assertEqual(len(task_nodes), 19)
        self.assertTrue(all(node.get("task_conditions_semantics") == "contextual_conditions_not_role_learning_prerequisites" for node in task_nodes))
        self.assertTrue(all(node.get("separate_role_foundation_before_task") is False for node in task_nodes))

    def test_alternative_edges_and_all_prose_notes_have_explicit_dispositions(self):
        audit = self.graph["alternative_relationship_reconciliation"]
        self.assertEqual(audit["status"], "all_typed_alternative_edges_and_prose_notes_dispositioned")
        self.assertEqual(audit["typed_alternative_edge_count"], 164)
        self.assertEqual(audit["approved_selectable_typed_edge_count"], 164)
        self.assertEqual(audit["unapproved_typed_edge_count"], 0)
        self.assertEqual(audit["non_pairwise_candidate_count"], 2)
        self.assertEqual(len(audit["non_pairwise_candidate_dispositions"]), 2)
        self.assertEqual(audit["prose_alternative_note_count"], 419)
        self.assertEqual(audit["notes_with_one_exact_target_candidate"], 0)
        self.assertEqual(audit["structured_alternative_relationship_note_count"], 42)
        self.assertEqual(audit["notes_covered_by_approved_typed_groups"], 5)
        self.assertTrue(audit["no_fuzzy_target_creation"])

        typed_alternatives = [edge for edge in self.edges if edge.get("relationship") in {
            "alternative_to", "alternative_tool_option", "tool_alternative_for_role_task",
        }]
        approved = [edge for edge in typed_alternatives if edge.get("alternative_review_disposition") == "approved"]
        unapproved = [edge for edge in typed_alternatives if edge.get("alternative_review_disposition") == "unapproved"]
        self.assertEqual((len(approved), len(unapproved)), (164, 0))
        for edge in approved:
            self.assertIn(edge["source"], self.nodes)
            self.assertIn(edge["target"], self.nodes)
            self.assertNotEqual(edge["source"], edge["target"])
            self.assertTrue(edge.get("explanation"))
            self.assertTrue(edge.get("source_references"))
            self.assertEqual(edge.get("alternative_is_exclusive"), False)
            self.assertEqual(edge.get("blocking_policy"), "never")
            self.assertEqual(edge.get("sequence_policy"), "none")
        self.assertTrue(all(edge.get("student_visible") is False and edge.get("selectable") is False for edge in unapproved))

        # The false concept stubs were replaced with real method endpoints;
        # the legitimate R/Python area pair is now a typed, optional choice.
        live_pairs = {(edge.get("source"), edge.get("target")) for edge in approved}
        self.assertIn(("domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach"), live_pairs)
        self.assertIn(("area_enrichment_item:d078-computational-digital-social-science-r-social-data-workflow",
                       "area_enrichment_item:d078-computational-digital-social-science-python-social-data-workflow"), live_pairs)
        self.assertIn(("area_tool_option:d078-a04-tool-nvivo", "area_tool_option:d078-a04-tool-taguette"), live_pairs)
        self.assertIn(("area_tool_option:d078-a04-tool-r", "area_tool_option:d078-a04-tool-python"), live_pairs)
        area_scoped_nvivo_taguette = [edge for edge in approved
            if {edge.get("source"), edge.get("target")} == {
                "domain-item:d078-nvivo-tool", "domain-item:d078-qualitative-coding-tool",
            } and edge.get("area_id") in {
                "D078:sociology-social-anthropology", "D078:social-research-evaluation",
            }]
        self.assertEqual({edge.get("area_id") for edge in area_scoped_nvivo_taguette}, {
            "D078:sociology-social-anthropology", "D078:social-research-evaluation",
        })
        self.assertTrue(all(edge.get("source_note_pointer") and edge.get("source_references") for edge in area_scoped_nvivo_taguette))
        self.assertTrue(all(edge.get("alternative_is_exclusive") is False for edge in area_scoped_nvivo_taguette))
        nvivo_taguette = next(edge for edge in approved if edge.get("source") == "area_tool_option:d078-a04-tool-nvivo" and edge.get("target") == "area_tool_option:d078-a04-tool-taguette")
        self.assertIn("Taguette focuses on highlighting and tagging text documents", nvivo_taguette["explanation"])
        self.assertIn("NVivo provides a broader set of coding workflows", nvivo_taguette["explanation"])
        self.assertFalse(any(edge.get("target", "").startswith("concept:relationship_target:") and edge.get("student_visible") for edge in typed_alternatives))
        synthetic_scenario = next(edge for edge in approved
            if edge.get("source") == "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing"
            and edge.get("target") == "domain-item:d078-scenario-analysis")
        self.assertIn("scenario analysis compares plausible future conditions", synthetic_scenario["explanation"].lower())
        self.assertTrue(any(ref.get("endpoint") == synthetic_scenario["source"]
            and "pnas.org/doi/10.1073/pnas.2518075122" in ref.get("url", "")
            for ref in synthetic_scenario["source_references"]))
        self.assertTrue(all(not any(edge.get("id") == row["edge_id"] for edge in typed_alternatives)
            for row in audit["non_pairwise_candidate_dispositions"]))

        notes = [note for node in self.nodes.values() for note in node.get("alternative_note_dispositions", [])]
        self.assertEqual(len(notes), 419)
        self.assertTrue(all(note.get("selectable_from_note_alone") is False for note in notes))
        grouped = [note for note in notes if note.get("disposition") == "covered_by_approved_typed_alternative_group"]
        self.assertEqual(len(grouped), 5)
        self.assertTrue(all(len(note.get("typed_edge_ids", [])) > 0 for note in grouped))
        expected_student_notes = sum(
            len(node.get("alternative_note_dispositions", []))
            for node in self.nodes.values()
            if node.get("student_visible") is True and node["id"] in self.ui["nodes_by_id"]
        )
        self.assertEqual(
            sum(len(node.get("alternative_note_dispositions", [])) for node in self.ui["nodes_by_id"].values()),
            expected_student_notes,
        )
        ui_alternatives = [edge for edge in self.ui["typed_relationship_edges"] if edge.get("relationship") in {
            "alternative_to", "alternative_tool_option", "tool_alternative_for_role_task",
        }]
        self.assertEqual(len(ui_alternatives), 164)
        self.assertTrue(all(edge.get("evidenceBasis") and edge.get("sourceReferences") for edge in ui_alternatives))

    def test_ui_projection_contains_family_role_edges_and_source_explanations(self):
        ui_edges = [edge for edge in self.ui["typed_relationship_edges"] if edge.get("relationship") == "area_task_family_supports_role_task"]
        # Two broad/duplicate family-to-role links were removed when their
        # method routes were reconciled to canonical families.
        self.assertEqual(len(ui_edges), 47)
        self.assertTrue(all(edge.get("condition") and edge.get("fitClaimLimit") for edge in ui_edges))
        self.assertTrue(all(edge.get("sourceReferences") for edge in ui_edges))
        self.assertEqual(self.ui["area_task_family_selection_contract"]["minimum_selections"], 0)
        self.assertTrue(self.ui["student_visible"])
        self.assertFalse(self.ui["student_ui_gate"]["enabled"])
        self.assertFalse(self.ui["student_ui_gate"]["student_facing_approved"])
        ui_sequence = [edge for edge in self.ui["typed_relationship_edges"] if str(edge.get("id", "")).startswith("area-sequence:")]
        self.assertEqual(len(ui_sequence), 15)
        self.assertTrue(all(edge.get("sequenceApproved") is True and edge.get("sourceReferences") for edge in ui_sequence))
        self.assertEqual(self.ui["role_learning_sequence_contract"]["eligible_role_item_count"], 164)
        self.assertEqual(len(self.ui["method_node_ids"]), 23)
        foundation_contract = self.ui["area_foundation_contract"]
        expected_foundations = {
            "D078:computational-digital-social-science": ["area_enrichment_item:d078-computational-digital-social-science-computational-question-formulation"],
            "D078:economics-applied-analysis": ["area-foundation:d078-economics-economic-concepts-and-indicators"],
            "D078:human-geography-population": ["area_enrichment_item:d078-human-geography-population-spatial-concepts-and-place"],
            "D078:politics-governance-public-policy": ["area_enrichment_item:d078-a03-knowledge-institutions-policy"],
            "D078:psychology-social-behaviour": ["area_enrichment_item:d078-a04-knowledge-behavioural-constructs"],
            "D078:social-research-evaluation": [],
            "D078:sociology-social-anthropology": ["area-foundation:d078-sociology-social-anthropology-social-concepts"],
        }
        self.assertEqual(foundation_contract["foundation_count"], 6)
        expected_foundation_map = {area_id: item_ids for area_id, item_ids in expected_foundations.items() if item_ids}
        self.assertEqual(foundation_contract["foundation_ids_by_area"], expected_foundation_map)
        self.assertEqual(set(foundation_contract["decisions_by_area"]), set(expected_foundations))
        self.assertEqual(foundation_contract["no_additional_foundation_areas"], ["D078:social-research-evaluation"])
        self.assertFalse(foundation_contract["foundations_are_progression_blockers"])
        self.assertTrue(all(
            foundation_id in self.ui["nodes_by_id"]
            and self.ui["nodes_by_id"][foundation_id].get("student_visible") is True
            and self.ui["nodes_by_id"][foundation_id].get("student_selectable") is True
            and self.ui["nodes_by_id"][foundation_id].get("blocking_policy") == "never"
            and self.ui["nodes_by_id"][foundation_id].get("skippable") is True
            for foundation_id in foundation_contract["foundation_nodes"]
        ))

    def test_area_foundations_are_route_scoped_optional_and_not_duplicate_domain_items(self):
        contract = self.graph["area_foundation_contract"]
        node_ids = set(self.nodes)
        for area_id, decision in contract["decisions_by_area"].items():
            self.assertEqual(decision["foundation_is_progression_blocker"], False)
            self.assertTrue(set(decision["foundation_ids"]).issubset(node_ids))
            for item_id in decision["foundation_ids"]:
                node = self.nodes[item_id]
                self.assertEqual(node.get("area_id"), area_id)
                self.assertEqual(node.get("requirement_lane"), "useful_optional")
                self.assertTrue(node.get("skippable"))
                self.assertEqual(node.get("blocking_policy"), "never")
                self.assertTrue(node.get("source_references"))
        self.assertEqual(contract["decisions_by_area"]["D078:social-research-evaluation"]["foundation_ids"], [])
        for route in self.graph["selection_progression_contract"]["routes"]:
            expected = contract["foundation_ids_by_area"].get(route["area_id"], [])
            self.assertEqual(route["area_foundation_ids"], expected, route["route_id"])
            area_stage = route["sequence_plan"]["stages"][4]
            self.assertEqual(area_stage["area_foundation_ids"], expected, route["route_id"])
            self.assertFalse(area_stage["blocks_progression"])

    def test_task_preparation_context_is_present_only_as_nonblocking_selected_work_guidance(self):
        reconciliation = self.graph["area_task_preparation_reconciliation"]
        self.assertEqual(reconciliation["task_context_count"], 46)
        self.assertEqual(reconciliation["specialist_task_families_reviewed"], 14)
        self.assertEqual(reconciliation["selectable_task_families_dispositioned"], 46)
        self.assertEqual(reconciliation["source_task_records_reviewed"], 14)
        self.assertFalse(reconciliation["creates_prerequisite_or_sequence_edges"])
        self.assertEqual(reconciliation["display_policy"], "only after the exact area task family is selected")
        visible_families = {
            node_id for node_id, node in self.nodes.items()
            if node.get("kind") == "area_task_family" and node.get("student_visible") is True
        }
        self.assertEqual(len(visible_families), 46)
        for family_id in visible_families:
            context = self.nodes[family_id].get("task_preparation_context")
            self.assertIsInstance(context, dict, family_id)
            self.assertTrue(context.get("source_references"), family_id)
            self.assertEqual(context.get("blocking_policy"), "never", family_id)
            self.assertEqual(context.get("sequence_policy"), "none", family_id)
            self.assertEqual(context.get("exact_learning_prerequisite_targets"), [], family_id)
            self.assertFalse(context.get("prerequisite_edge_created"), family_id)
            self.assertFalse(context.get("sequence_edge_created"), family_id)
            if context.get("display_when_selected") is False:
                self.assertEqual(context.get("prerequisite_review_disposition"), "no_exact_learning_prerequisite_target_established_in_reviewed_route_evidence")
        for route in self.graph["selection_progression_contract"]["routes"]:
            stages = route["sequence_plan"]["stages"]
            choices, learning = stages[5], stages[6]
            contexts = {row["task_family_id"]: row for row in choices["preparation_contexts"]}
            self.assertTrue(set(choices["task_family_ids"]).issubset(contexts), route["route_id"])
            self.assertTrue(learning["follows_selected_task_preparation_context"])
            self.assertFalse(choices["blocks_progression"])

    def test_every_area_and_role_has_a_source_backed_overview_in_student_graph(self):
        areas = [node for node in self.nodes.values() if node.get("kind") == "area_of_specialization"]
        roles = [node for node in self.nodes.values() if node.get("kind") == "role"]
        self.assertEqual(len(areas), 7)
        self.assertEqual(len(roles), 19)
        for node in areas:
            self.assertTrue(node.get("description"), node["id"])
            self.assertEqual(node.get("overview"), node.get("description"), node["id"])
            self.assertTrue(node.get("source_references"), node["id"])
            self.assertTrue(node.get("supported_role_ids"), node["id"])
            self.assertTrue(node.get("area_overview_is_not_a_learning_requirement"), node["id"])
        for node in roles:
            self.assertTrue(node.get("description"), node["id"])
            self.assertEqual(node.get("overview"), node.get("description"), node["id"])
            self.assertTrue(node.get("overview_source_references"), node["id"])
            self.assertTrue(node.get("supported_area_ids"), node["id"])
            self.assertTrue(node.get("role_context_is_not_job_readiness"), node["id"])
            self.assertTrue(all(area_id in {area.get("area_id") for area in areas} for area_id in node["supported_area_ids"]))
        for node_id in [node["id"] for node in areas + roles]:
            ui_node = self.ui["nodes_by_id"][node_id]
            self.assertTrue(ui_node.get("description"), node_id)
            self.assertTrue(ui_node.get("overview_source_artifact"), node_id)

    def test_selection_progression_contract_covers_method_design_area_role_item_and_tool_paths(self):
        contract = self.graph["selection_progression_contract"]
        self.assertEqual(contract["version"], "d078-selection-progression-contract-2026-11-14-v9")
        self.assertEqual(len(contract["routes"]), 207)
        self.assertEqual(contract["counts"]["method_area_routes"], 117)
        self.assertEqual(contract["counts"]["named_design_area_routes"], 31)
        # The exact named-combination contribution reconciliation removes one
        # stale duplicate path; the current graph has 243 distinct reviewed
        # domain-item-to-area-task edges across all supported routes.
        self.assertEqual(contract["counts"]["selected_domain_item_area_task_edges"], 243)
        self.assertEqual(contract["counts"]["task_family_area_item_edges"], 123)
        self.assertEqual(contract["counts"]["area_task_role_paths"], 47)
        self.assertEqual(contract["counts"]["role_item_context_edges"], 220)
        node_ids = set(self.nodes)
        for route in contract["routes"]:
            self.assertIn(route["area_start"], {"area_foundation_then_task_family_choices", "task_family_choices_directly"})
            self.assertTrue(set(route["area_foundation_ids"]).issubset(node_ids))
            self.assertTrue(set(route["task_family_ids"]).issubset(node_ids))
            self.assertTrue(set(route["role_ids"]).issubset(node_ids))
            for stage in route["sequence_plan"]["stages"]:
                for item_id in stage.get("item_ids", []):
                    self.assertIn(item_id, node_ids)
                for item_id in stage.get("method_ids", []):
                    self.assertIn(item_id, node_ids)
                for item_id in stage.get("task_family_ids", []):
                    self.assertIn(item_id, node_ids)
                for item_id in stage.get("role_ids", []):
                    self.assertIn(item_id, node_ids)
                for lane_items in stage.get("item_ids_by_requirement_lane", {}).values():
                    self.assertTrue(set(lane_items).issubset(node_ids))
                for item_id in stage.get("tool_ids", []):
                    self.assertIn(item_id, node_ids)
                for role_path in stage.get("role_paths", []):
                    self.assertIn(role_path["role_id"], node_ids)
                    for lane_items in role_path.get("role_item_ids_by_requirement_lane", {}).values():
                        self.assertTrue(set(lane_items).issubset(node_ids))
                    for item_id in role_path.get("unmapped_route_role_item_ids", []):
                        self.assertIn(item_id, node_ids)
                    for task_path in role_path.get("role_task_paths", []):
                        self.assertIn(task_path["role_task_id"], node_ids)
                        self.assertTrue(set(task_path.get("role_tool_ids", [])).issubset(node_ids))
        self.assertEqual(self.ui["selection_progression_contract"]["counts"], contract["counts"])
        self.assertEqual(self.graph["role_learning_sequence_contract"]["approved_role_item_dependency_edges"], 0)

    def test_every_student_route_item_has_a_reviewed_context_edge(self):
        area_edges = [edge for edge in self.edges if edge.get("relationship") == "task_has_area_learning_item"
                      and edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True]
        role_edges = [edge for edge in self.edges if edge.get("relationship") == "role_task_supports_role_item"
                      and edge.get("status") == "resolved_ready_for_use" and edge.get("student_visible") is True]
        area_edge_targets = {edge["target"] for edge in area_edges}
        role_edge_targets = {edge["target"] for edge in role_edges}
        route_area_items = set()
        all_routed_families = {
            family_id
            for route in self.graph.get("method_area_routes", []) + self.graph.get("combination_area_routes", [])
            for family_id in route.get("task_family_ids", [])
        }
        for route in self.graph.get("method_area_routes", []) + self.graph.get("combination_area_routes", []):
            for item_id in route.get("area_item_ids", []):
                item = self.nodes.get(item_id, {})
                if item.get("student_visible") is True and item.get("student_selectable") is not False:
                    route_area_items.add(item_id)
                    self.assertTrue(any(edge["target"] == item_id and edge["source"] in all_routed_families
                                        and (item.get("area_id") == edge.get("area_id") or edge.get("area_id") is None)
                                        for edge in area_edges), item_id)
        route_role_pairs = {
            (str(route.get("route_node_id") or ""), item_id)
            for route in self.graph.get("method_area_role_routes", [])
            for item_id in route.get("role_item_ids", []) + route.get("method_specific_role_item_ids", [])
            if self.nodes.get(item_id, {}).get("student_visible") is True
            and self.nodes.get(item_id, {}).get("student_selectable") is not False
        } | {
            (str(route.get("id") or ""), item_id)
            for route in self.graph.get("combination_area_role_routes", [])
            for item_id in route.get("role_item_ids", []) + route.get("method_specific_role_item_ids", [])
            if self.nodes.get(item_id, {}).get("student_visible") is True
            and self.nodes.get(item_id, {}).get("student_selectable") is not False
        }
        role_reveal_pairs = {
            (str(edge.get("source") or ""), str(edge.get("target") or ""))
            for edge in self.edges if edge.get("relationship") == "selected_role_reveals_role_item"
        }
        role_task_item_ids = {str(edge.get("target") or "") for edge in role_edges}
        route_role_item_ids = {item_id for _, item_id in route_role_pairs}
        self.assertTrue(route_area_items)
        self.assertTrue(route_role_pairs)
        self.assertTrue(route_area_items.issubset(area_edge_targets))
        self.assertTrue(route_role_pairs.issubset(role_reveal_pairs))
        # Every role item is downstream of the selected domain ->
        # method/design -> area -> role path. A role-task link adds a more
        # specific task-family explanation; it is not needed to make the
        # role-owned item a detached or domain-wide choice.
        self.assertTrue(role_task_item_ids.issubset(route_role_item_ids))
        self.assertTrue(role_task_item_ids.issubset(role_edge_targets))
        method_area_pairs = {
            (route.get("method_id"), route.get("area_id"))
            for route in self.graph.get("method_area_routes", [])
        }
        for route in self.graph.get("method_area_role_routes", []):
            self.assertTrue(route.get("method_id") and route.get("area_id") and route.get("role_id"))
            self.assertIn((route["method_id"], route["area_id"]), method_area_pairs)
            for item_id in route.get("role_item_ids", []):
                self.assertIn(route["role_id"], self.nodes[item_id].get("role_owner_ids", []), item_id)
        for route in self.graph.get("combination_area_role_routes", []):
            self.assertTrue(route.get("combination_id") and route.get("area_id") and route.get("role_id"))
            for item_id in route.get("role_item_ids", []):
                self.assertIn(route["role_id"], self.nodes[item_id].get("role_owner_ids", []), item_id)
        for edge in self.edges:
            if edge.get("relationship") == "selected_role_reveals_role_item":
                self.assertEqual(edge.get("selection_path"), ["domain:D078", "selected_method_or_design", "supported_area", "selected_role"])
                self.assertFalse(edge.get("task_family_specific"))
        self.assertEqual(len(route_role_item_ids), 164)
        self.assertEqual(len(role_task_item_ids), 164)
        self.assertEqual(route_role_item_ids, role_task_item_ids)
        self.assertEqual(self.graph["role_learning_sequence_contract"]["role_item_placement_policy"], "Embed a role item under its reviewed role task family. Use a role foundation only when evidence shows it applies across the relevant role tasks. If neither route is supported, keep the item out of student selection; do not create a general standalone role-item lane.")
        for position in (127, 143):
            excluded = next(node for node in self.nodes.values() if node.get("queue_position") == position)
            self.assertFalse(excluded.get("student_visible"), excluded["id"])
            self.assertFalse(excluded.get("student_selectable"), excluded["id"])

    def test_mesa_and_casevo_have_one_selectable_identity_with_area_context(self):
        aliases = {
            "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo": {
                "domain-item:d078-mesa-tool", "domain-item:d078-casevo-tool",
            },
            "area_enrichment_item:soc-t2": {"domain-item:d078-mesa-tool"},
            "area_enrichment_item:soc-a2": {"domain-item:d078-casevo-tool"},
            "area_enrichment_item:d078-econ-casevo-llm-sim": {"domain-item:d078-casevo-tool"},
        }
        for alias_id, canonical_ids in aliases.items():
            alias = self.nodes[alias_id]
            self.assertFalse(alias.get("student_visible"), alias_id)
            self.assertFalse(alias.get("student_selectable"), alias_id)
            self.assertEqual(set(alias.get("canonical_linked_item_ids", [])), canonical_ids)
            self.assertFalse(any(edge.get("target") == alias_id and edge.get("relationship") == "task_has_area_learning_item"
                                 and edge.get("student_visible") is True for edge in self.edges), alias_id)
        canonical_ids = {item_id for target_set in aliases.values() for item_id in target_set}
        for item_id in canonical_ids:
            node = self.nodes[item_id]
            self.assertEqual(node.get("kind"), "domain_learning_item")
            self.assertTrue(node.get("student_visible"), item_id)
            self.assertTrue(node.get("student_selectable"), item_id)
        context_edges = [edge for edge in self.edges if edge.get("relationship") == "task_has_area_learning_item"
                         and edge.get("target") in canonical_ids and edge.get("deduplicated_from_area_node_id")]
        self.assertEqual(len(context_edges), 5)
        self.assertTrue(all(edge.get("area_id") and edge.get("status") == "resolved_ready_for_use" for edge in context_edges))

    def test_all_candidates_have_final_dispositions_and_selectable_candidates_have_exact_routes(self):
        disposition = self.graph["area_task_candidate_dispositions"]
        self.assertTrue(disposition["all_candidates_dispositioned"])
        self.assertEqual(disposition["pending_or_under_review_count"], 0)
        self.assertEqual(disposition["decision_counts"], {
            "approved_merged": 13,
            "approved_reclassified_foundation": 0,
            "approved_routed_optional_family": 3,
        })
        routed = {
            family_id for route in self.graph["method_area_routes"]
            for family_id in route.get("task_family_ids", [])
        }
        for family_id in (
            "area-task:econ-03", "area-task:econ-04",
            "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios",
        ):
            self.assertIn(family_id, routed)
            route_edges = [edge for edge in self.edges if edge.get("relationship") == "method_applies_to_area_task" and edge.get("target") == family_id]
            self.assertTrue(route_edges)
            self.assertTrue(all(edge.get("source_references") for edge in route_edges))

    def test_gated_economics_family_has_exact_domain_option_and_typed_item_links(self):
        family_id = "area-task:econ-04"
        required_option = "domain-emerging:d078-emerging-ai-use-validation-and-provenance"
        self.assertEqual(self.nodes[family_id]["required_selected_domain_item_ids"], [required_option])
        self.assertEqual(self.nodes["area_enrichment_item:econ-a1"]["required_selected_domain_item_ids"], [required_option])
        self.assertEqual(self.nodes["area_enrichment_item:econ-c2"]["required_selected_domain_item_ids"], [required_option])
        route_methods = {
            route["method_id"] for route in self.graph["method_area_routes"]
            if family_id in route.get("task_family_ids", [])
        }
        self.assertEqual(route_methods, {
            "domain-item:d078-quantitative-approach",
            "domain-item:d078-computational-social-research",
        })
        item_targets = {
            edge["target"] for edge in self.edges
            if edge.get("relationship") == "task_has_area_learning_item" and edge.get("source") == family_id
        }
        self.assertEqual(item_targets, {"area_enrichment_item:econ-a1", "area_enrichment_item:econ-c2"})

    def test_every_family_selection_subset_keeps_its_exact_route_content_resolvable(self):
        ui_nodes = self.ui["nodes_by_id"]
        routes = self.graph["method_area_routes"] + [
            node for node in self.graph["nodes"] if node.get("kind") == "combination_area_route"
        ]
        family_item_edges = [
            edge for edge in self.edges
            if edge.get("relationship") in {"task_has_area_learning_item", "domain_item_supports_area_task"}
            and edge.get("status") == "resolved_ready_for_use"
            and edge.get("student_visible") is True
        ]
        role_by_family: dict[str, set[str]] = {}
        task_by_id = {node_id: node for node_id, node in self.nodes.items() if node.get("kind") == "role_task_family"}
        for edge in self.edges:
            if edge.get("relationship") == "area_task_family_supports_role_task":
                role_task = task_by_id[edge["target"]]
                role_by_family.setdefault(edge["source"], set()).add(role_task["role_id"])

        subset_count = 0
        for route in routes:
            route_families = route.get("task_family_ids", [])
            area_id = route["area_id"]
            self.assertTrue(all(self.nodes[node_id]["area_id"] == area_id for node_id in route_families))
            for size in range(len(route_families) + 1):
                for selected in combinations(route_families, size):
                    subset_count += 1
                    selected_set = set(selected)
                    area_items = {
                        edge["target"] for edge in family_item_edges
                        if edge.get("relationship") == "task_has_area_learning_item" and edge["source"] in selected_set
                    }
                    inherited_domain_items = {
                        edge["source"] for edge in family_item_edges
                        if edge.get("relationship") == "domain_item_supports_area_task" and edge["target"] in selected_set
                    }
                    self.assertTrue(area_items <= ui_nodes.keys())
                    self.assertTrue(inherited_domain_items <= ui_nodes.keys())
                    route_roles = set(route.get("role_ids", []))
                    focused_roles = set().union(*(role_by_family.get(family_id, set()) for family_id in selected)) if selected else set()
                    self.assertTrue(focused_roles <= route_roles)
        self.assertEqual(subset_count, sum(2 ** len(route.get("task_family_ids", [])) for route in routes))


if __name__ == "__main__":
    unittest.main()
