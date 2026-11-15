"""Graph-wide verification for the D078 route sequence contract."""
from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
UI_PATH = ROOT / "src/data/d078MethodAwareUiData.json"
FOUNDATIONS = [
    "domain-item:d078-research-question-design",
    "domain-item:d078-evaluate-evidence-and-limits",
    "domain-item:d078-communicate-evidence",
]
LANE_ORDER = ["needed", "conditional", "useful", "useful_edge", "useful_optional", "optional", "choose_one_alternative"]


class D078RouteSequenceCompletenessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
        cls.nodes = {node["id"]: node for node in cls.graph["nodes"]}
        cls.edges = {edge.get("id"): edge for edge in cls.graph["edges"] if edge.get("id")}
        cls.approved_sequence_edges = {
            edge_id: edge for edge_id, edge in cls.edges.items()
            if edge.get("sequence_approved") is True
            and edge.get("sequence_policy") in {"conditional_prerequisite", "workflow"}
        }
        cls.routes = cls.graph["selection_progression_contract"]["routes"]
        cls.ui = json.loads(UI_PATH.read_text(encoding="utf-8"))

    def _stage_item_positions(self, stages: list[dict]) -> dict[str, tuple[int, int, int, str]]:
        """Map item to stage/lane/card coordinates; tools are parallel tool choices."""
        positions: dict[str, tuple[int, int, int, str]] = {}
        for stage_index, stage in enumerate(stages):
            for item_index, item_id in enumerate(stage.get("item_ids", [])):
                positions[item_id] = (stage_index, 0, item_index, "stage")
            for item_index, item_id in enumerate(stage.get("method_ids", [])):
                positions[item_id] = (stage_index, 0, item_index, "method")
            for item_index, item_id in enumerate(stage.get("area_foundation_ids", [])):
                positions[item_id] = (stage_index, 0, item_index, "area_foundation")
            lane_groups = stage.get("item_ids_by_requirement_lane", {})
            lane_rank = {lane: index for index, lane in enumerate(lane_groups)}
            for lane, item_ids in lane_groups.items():
                for item_index, item_id in enumerate(item_ids):
                    positions[item_id] = (stage_index, lane_rank.get(lane, len(LANE_ORDER)), item_index, lane)
            for item_index, item_id in enumerate(stage.get("tool_ids", [])):
                positions[item_id] = (stage_index, len(LANE_ORDER) + 1, item_index, "tool")
            for item_index, item_id in enumerate(stage.get("layer_two_three_item_ids", [])):
                positions.setdefault(item_id, (stage_index, len(LANE_ORDER) + 2, item_index, "layer_item"))
            for item_index, item_id in enumerate(stage.get("task_family_ids", [])):
                positions[item_id] = (stage_index, 0, item_index, "task_family")
            for item_index, item_id in enumerate(stage.get("role_ids", [])):
                positions[item_id] = (stage_index, 0, item_index, "role")
            for role_path in stage.get("role_paths", []):
                role_id = role_path.get("role_id")
                if role_id:
                    positions[role_id] = (stage_index, 0, 0, "role")
                for lane, item_ids in role_path.get("role_item_ids_by_requirement_lane", {}).items():
                    for item_index, item_id in enumerate(item_ids):
                        positions[item_id] = (stage_index, lane_rank.get(lane, len(LANE_ORDER)), item_index, lane)
                for task_path in role_path.get("role_task_paths", []):
                    for item_index, item_id in enumerate(task_path.get("role_tool_ids", [])):
                        positions[item_id] = (stage_index, len(LANE_ORDER) + 1, item_index, "role_tool")
        return positions

    def test_all_supported_single_design_and_component_routes_have_nine_ordered_stages(self):
        self.assertEqual(
            self.graph["selection_progression_contract"]["version"],
            "d078-selection-progression-contract-2026-11-14-v9",
        )
        self.assertEqual(len(self.routes), 207)
        self.assertEqual(
            {kind: sum(route["route_kind"] == kind for route in self.routes) for kind in (
                "single_method", "named_design", "named_design_component_variant",
            )},
            {"single_method": 117, "named_design": 31, "named_design_component_variant": 59},
        )
        seen = set()
        for route in self.routes:
            plan = route["sequence_plan"]
            self.assertEqual(plan["route_id"], route["route_id"])
            self.assertEqual(plan["area_id"], route["area_id"])
            self.assertEqual(plan["method_ids"], route["method_ids"])
            self.assertTrue(plan["cycle_check_passed"])
            self.assertTrue(plan["optional_skips_preserve_route"])
            self.assertEqual([stage["position"] for stage in plan["stages"]], list(range(1, 10)))
            self.assertEqual([stage["stage_id"] for stage in plan["stages"]], [
                "domain_foundations", "society_and_social_world_orientation", "method_or_named_design",
                "method_linked_domain_learning", "area_start", "area_task_family_choices",
                "area_learning_and_tools", "role_choices", "role_task_learning_and_tools",
            ])
            self.assertEqual(plan["stages"][0]["item_ids"], FOUNDATIONS)
            self.assertFalse(plan["stages"][0]["skippable"])
            self.assertTrue(plan["stages"][5]["zero_selection_preserves_general_route"])
            self.assertTrue(plan["stages"][5]["multiple_selection_allowed"])
            task_choices = plan["stages"][5]
            area_learning = plan["stages"][6]
            preparation = {row["task_family_id"]: row for row in task_choices["preparation_contexts"]}
            self.assertTrue(set(task_choices["task_family_ids"]).issubset(preparation), route["route_id"])
            self.assertTrue(area_learning["follows_selected_task_preparation_context"])
            for family_id, context in preparation.items():
                self.assertIn(family_id, task_choices["task_family_ids"])
                self.assertEqual(context["blocking_policy"], "never")
                self.assertEqual(context["sequence_policy"], "none")
                self.assertEqual(context["exact_learning_prerequisite_targets"], [])
                self.assertTrue(context["source_references"])
            # Selecting a method or named design is the gateway to downstream
            # route data. After that choice, learning selections and area/task
            # choices are recommendations, not progression blockers.
            for stage in plan["stages"][4:]:
                self.assertFalse(stage.get("blocks_progression", False), (route["route_id"], stage["stage_id"]))
            signature = (route["route_kind"], route["route_id"], route["area_id"])
            self.assertNotIn(signature, seen)
            seen.add(signature)

    def test_method_stage_keeps_each_method_learning_group_and_excludes_area_owned_items(self):
        """All method-specific learning stays before areas; area items/tools do not leak upward."""
        for route in self.routes:
            stage = route["sequence_plan"]["stages"][3]
            self.assertEqual(stage["stage_id"], "method_linked_domain_learning", route["route_id"])
            contributions = stage.get("method_contributions", [])
            self.assertEqual(
                {row["method_id"] for row in contributions},
                set(route["method_ids"]),
                route["route_id"],
            )
            self.assertTrue(all(row.get("source_route_id") for row in contributions), route["route_id"])
            self.assertEqual(stage.get("unattributed_route_item_ids", []), [], route["route_id"])
            self.assertEqual(stage.get("unattributed_route_tool_ids", []), [], route["route_id"])

            stage_item_ids = set(stage.get("layer_two_three_item_ids", []))
            for ids in stage.get("item_ids_by_requirement_lane", {}).values():
                stage_item_ids.update(ids)
            stage_ids = stage_item_ids | set(stage.get("tool_ids", []))
            for row in contributions:
                row_ids = set(row.get("item_ids", [])) | set(row.get("tool_ids", []))
                self.assertTrue(row_ids.issubset(stage_ids), (route["route_id"], row["method_id"]))

            for item_id in stage_ids:
                node = self.nodes[item_id]
                self.assertNotEqual(
                    node.get("display_stage"),
                    "area",
                    (route["route_id"], item_id),
                )

    def test_optional_society_choice_is_exactly_between_compulsory_foundations_and_methods(self):
        contract = self.graph["selection_progression_contract"]
        society_id = "runtime-item:domain:d078:d078-society-and-social-world-knowledge"
        expected_stages = contract["sequence_invariants"]["stage_order"]
        self.assertEqual(expected_stages, [stage["stage_id"] for stage in self.routes[0]["sequence_plan"]["stages"]])
        society = self.nodes[society_id]
        self.assertTrue(society.get("student_visible"))
        self.assertIsNot(society.get("student_selectable"), False)
        self.assertTrue(society.get("skippable"))
        self.assertIn(society.get("requirement_lane"), {"useful", "useful_optional", "optional"})
        self.assertEqual(contract["sequence_invariants"]["society_orientation"],
                         "one optional selectable choice immediately after the three compulsory domain foundations and before any method; selecting or skipping it never blocks methods")
        for route in self.routes:
            stages = route["sequence_plan"]["stages"]
            self.assertEqual(stages[0]["item_ids"], FOUNDATIONS, route["route_id"])
            self.assertEqual(stages[1]["stage_id"], "society_and_social_world_orientation")
            self.assertEqual(stages[1]["item_ids"], [society_id], route["route_id"])
            self.assertTrue(stages[1]["skippable"])
            self.assertFalse(stages[1]["blocks_progression"])
            self.assertEqual(stages[1]["selection_policy"], "optional_select_or_skip_before_methods")
            self.assertEqual(stages[2]["stage_id"], "method_or_named_design")
            self.assertTrue(stages[2]["blocks_progression"])
            self.assertNotIn(society_id, {
                item_id
                for stage in stages[2:]
                for item_id in (
                    *stage.get("item_ids", []),
                    *stage.get("layer_two_three_item_ids", []),
                    *stage.get("tool_ids", []),
                    *[item for lane in stage.get("item_ids_by_requirement_lane", {}).values() for item in lane],
                )
            }, route["route_id"])
            occurrence = next(row for row in route["sequence_plan"]["item_sequence_dispositions"]
                              if row["item_id"] == society_id)
            self.assertEqual(occurrence["stage_id"], "society_and_social_world_orientation")
            self.assertEqual(occurrence["selection_policy"], "skippable")

    def test_method_area_and_role_learning_groups_are_complete_and_context_scoped(self):
        for route in self.routes:
            with self.subTest(route=route["route_id"]):
                plan = route["sequence_plan"]
                stages = {stage["stage_id"]: stage for stage in plan["stages"]}

                method_stage = stages["method_linked_domain_learning"]
                method_group_ids = set()
                method_group_edges = set()
                for group in method_stage.get("learning_order_groups", []):
                    for lane_ids in group.get("item_ids_by_requirement_lane", {}).values():
                        method_group_ids.update(lane_ids)
                    method_group_ids.update(group.get("tool_ids", []))
                    for edge in group.get("sequence_edges", []):
                        self.assertIn(edge["source"], method_group_ids | set().union(*(
                            set(ids) for ids in group.get("item_ids_by_requirement_lane", {}).values()
                        )))
                        self.assertIn(edge["target"], method_group_ids | set(group.get("tool_ids", [])))
                        method_group_edges.add(edge["id"])
                    self.assertTrue(group["skippable"])
                    self.assertFalse(group["blocks_progression"])
                    self.assertTrue(group["group_order_is_not_a_prerequisite"])
                    self.assertEqual(group["within_group_order_policy"],
                                     "reviewed_sequence_edges_only; otherwise_parallel_choices")
                expected_method_ids = {
                    *[item for lane in method_stage.get("item_ids_by_requirement_lane", {}).values() for item in lane],
                    *method_stage.get("tool_ids", []),
                }
                self.assertEqual(method_group_ids, expected_method_ids, route["route_id"])
                layer_groups = [group for group in method_stage["learning_order_groups"]
                                if group.get("source_layer") in {2, 3}]
                self.assertEqual([group["source_layer"] for group in layer_groups], [2, 3], route["route_id"])
                self.assertLess(layer_groups[0]["source_sequence_order"], layer_groups[1]["source_sequence_order"])
                method_contribution_groups = [group for group in method_stage["learning_order_groups"]
                                              if group.get("group_id", "").startswith("method_contribution:")]
                if method_contribution_groups:
                    self.assertEqual({group["display_group_position"] for group in method_contribution_groups},
                                     {len(layer_groups) + 1})
                self.assertTrue(method_stage["learning_order_group_policy"]["optional_choices_can_be_skipped_without_blocking_area_routes"])

                area_stage = stages["area_learning_and_tools"]
                family_groups = area_stage.get("task_family_learning_groups", [])
                self.assertEqual({group["task_family_id"] for group in family_groups},
                                 set(stages["area_task_family_choices"]["task_family_ids"]), route["route_id"])
                family_item_ids = set()
                for group in family_groups:
                    self.assertTrue(group["task_family_id"])
                    self.assertEqual(
                        group["preparation_context"],
                        self.nodes[group["task_family_id"]].get("task_preparation_context", {}),
                        (route["route_id"], group["task_family_id"]),
                    )
                    self.assertTrue(group["skippable"])
                    self.assertFalse(group["blocks_progression"])
                    family_item_ids.update(item for lane in group["item_ids_by_requirement_lane"].values() for item in lane)
                    family_item_ids.update(group["tool_ids"])
                general_group = area_stage["general_area_learning_group"]
                general_ids = {item for lane in general_group["item_ids_by_requirement_lane"].values() for item in lane}
                general_ids.update(general_group["tool_ids"])
                expected_area_ids = {
                    *[item for lane in area_stage.get("item_ids_by_requirement_lane", {}).values() for item in lane],
                    *area_stage.get("tool_ids", []),
                }
                self.assertEqual(family_item_ids | general_ids, expected_area_ids, route["route_id"])
                self.assertTrue(area_stage["learning_order_group_policy"]["optional_choices_can_be_skipped_without_blocking_role_routes"])

                role_stage = stages["role_task_learning_and_tools"]
                for role_path in role_stage.get("role_paths", []):
                    task_path_item_ids = set()
                    task_path_tool_ids = set()
                    for task_path in role_path.get("role_task_paths", []):
                        groups = task_path.get("learning_order_groups", [])
                        self.assertEqual(len(groups), 1, (route["route_id"], role_path["role_id"], task_path["role_task_id"]))
                        group = groups[0]
                        self.assertEqual(group["role_id"], role_path["role_id"])
                        self.assertEqual(group["role_task_id"], task_path["role_task_id"])
                        self.assertTrue(group["role_task_context_is_required_for_display"])
                        self.assertTrue(group["all_items_and_tools_skippable"])
                        task_path_item_ids.update(item for lane in group["item_ids_by_requirement_lane"].values() for item in lane)
                        task_path_tool_ids.update(group["tool_ids"])
                    aggregate_ids = {item for lane in role_path.get("role_item_ids_by_requirement_lane", {}).values() for item in lane}
                    self.assertEqual(task_path_item_ids, aggregate_ids, (route["route_id"], role_path["role_id"]))
                    self.assertTrue(task_path_tool_ids.issubset(set(self.nodes)))
                    self.assertTrue(role_path["unmapped_role_items_are_not_selectable_without_a_reviewed_upstream_task_context"])
                self.assertIn("invent a direct domain-to-role path",
                              self.graph["selection_progression_contract"]["role_choice_order"])
                self.assertEqual(role_stage["learning_order_group_policy"]["role_items_without_a_reviewed_upstream_area_task_and_role_task_path"],
                                 "exclude_from_student_selection")

    def test_only_the_shared_foundation_spine_uses_the_needed_lane(self):
        """Conditional safeguards must not masquerade as universal route gates."""
        responsible = self.nodes["domain-item:d078-responsible-research"]
        self.assertEqual(responsible.get("requirement_lane"), "useful_edge")
        self.assertEqual((responsible.get("requirement_scope") or {}).get("lane"), "useful_edge")
        self.assertTrue(responsible.get("skippable"))
        self.assertEqual(responsible.get("blocking_policy"), "never")
        self.assertFalse((responsible.get("requirement_scope") or {}).get("blocks_progression"))
        self.assertFalse((responsible.get("requirement_scope") or {}).get("auto_order"))
        self.assertEqual(
            responsible.get("requirement_lane_source"),
            "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json.gz",
        )
        self.assertIn("when the selected research task", responsible.get("condition", ""))

        routes_with_research_ethics = 0
        for route in self.routes:
            stages = route["sequence_plan"]["stages"]
            self.assertEqual(
                set(stages[0].get("item_ids", [])),
                set(FOUNDATIONS),
                route["route_id"],
            )
            for stage in stages[1:]:
                downstream_ids = set(stage.get("item_ids", [])) | set(stage.get("tool_ids", []))
                downstream_ids.update(stage.get("layer_two_three_item_ids", []))
                downstream_ids.update(stage.get("task_family_ids", []))
                downstream_ids.update(stage.get("role_ids", []))
                for lane_items in stage.get("item_ids_by_requirement_lane", {}).values():
                    downstream_ids.update(lane_items)
                for role_path in stage.get("role_paths", []):
                    for lane_items in role_path.get("role_item_ids_by_requirement_lane", {}).values():
                        downstream_ids.update(lane_items)
                    for task_path in role_path.get("role_task_paths", []):
                        for lane_items in task_path.get("role_item_ids_by_requirement_lane", {}).values():
                            downstream_ids.update(lane_items)
                        downstream_ids.update(task_path.get("role_tool_ids", []))
                self.assertFalse(set(FOUNDATIONS) & downstream_ids, route["route_id"])
            for stage in stages[1:]:
                for item_id in stage.get("item_ids_by_requirement_lane", {}).get("needed", []):
                    self.fail(f"Non-foundation item {item_id} is shown as needed in {route['route_id']}")
            method_stage = stages[3]
            useful_items = set(method_stage.get("item_ids_by_requirement_lane", {}).get("useful_optional", []))
            if "domain-item:d078-responsible-research" in useful_items:
                routes_with_research_ethics += 1
                disposition = next(
                    row for row in route["sequence_plan"]["item_sequence_dispositions"]
                    if row["item_id"] == "domain-item:d078-responsible-research"
                )
                self.assertEqual(disposition["selection_policy"], "skippable", route["route_id"])
                self.assertEqual(disposition["requirement_lane"], "useful_optional", route["route_id"])
        self.assertGreater(routes_with_research_ethics, 0)
        self.assertLess(routes_with_research_ethics, len(self.routes))

    def test_only_evidence_backed_in_route_edges_order_items_and_are_nonblocking(self):
        checked_edges = set()
        for route in self.routes:
            plan = route["sequence_plan"]
            positions = self._stage_item_positions(plan["stages"])
            expected_for_route = {
                edge_id for edge_id, edge in self.approved_sequence_edges.items()
                if edge.get("source") in positions and edge.get("target") in positions
            }
            actual_for_route = {record["id"] for record in plan.get("sequence_edges", [])}
            self.assertEqual(actual_for_route, expected_for_route, route["route_id"])
            for record in plan.get("sequence_edges", []):
                edge = self.edges[record["id"]]
                self.assertEqual(edge.get("source"), record["source"])
                self.assertEqual(edge.get("target"), record["target"])
                self.assertTrue(edge.get("sequence_approved"))
                self.assertIn(edge.get("sequence_policy"), {"conditional_prerequisite", "workflow"})
                self.assertEqual(edge.get("blocking_policy"), "never")
                self.assertTrue(edge.get("recommendation_only"))
                self.assertTrue(edge.get("condition"))
                self.assertTrue(edge.get("source_references"))
                self.assertIn(record["source"], positions, (route["route_id"], record["source"]))
                self.assertIn(record["target"], positions, (route["route_id"], record["target"]))
                source_position = positions[record["source"]]
                target_position = positions[record["target"]]
                self.assertLessEqual(source_position[0], target_position[0], (route["route_id"], record["id"]))
                # Requirement lanes are shown separately by design. A reviewed
                # sequence may cross those lanes; the item relationship panel
                # must explain it rather than silently reclassify either item.
                if source_position[0] == target_position[0] and source_position[3] == target_position[3]:
                    self.assertLess(source_position[2], target_position[2], (route["route_id"], record["id"]))
                if source_position[0] == target_position[0] and source_position[3] != target_position[3]:
                    source_stage = plan["stages"][source_position[0]]
                    lane_groups = source_stage.get("item_ids_by_requirement_lane", {})
                    if source_position[3] in lane_groups and target_position[3] in lane_groups:
                        lane_order = {lane: index for index, lane in enumerate(lane_groups)}
                        self.assertLess(
                            lane_order[source_position[3]], lane_order[target_position[3]],
                            (route["route_id"], record["id"], source_position[3], target_position[3]),
                        )
                self.assertLessEqual(record["source_stage_position"], record["target_stage_position"])
                checked_edges.add(record["id"])
        all_approved_sequence_edges = {
            edge_id for edge_id, edge in self.edges.items()
            if edge.get("sequence_approved") is True
            and edge.get("sequence_policy") in {"conditional_prerequisite", "workflow"}
        }
        self.assertEqual(len(all_approved_sequence_edges), 15)
        self.assertEqual(sum(self.edges[edge_id]["sequence_policy"] == "conditional_prerequisite" for edge_id in all_approved_sequence_edges), 3)
        self.assertEqual(sum(self.edges[edge_id]["sequence_policy"] == "workflow" for edge_id in all_approved_sequence_edges), 12)
        self.assertEqual(checked_edges, all_approved_sequence_edges)

    def test_new_external_workflows_are_exact_route_scoped_and_nonblocking(self):
        expected = {
            "area-sequence:direct-area-order:15-reversed",
            "area-sequence:direct-area-order:13-workflow",
            "area-sequence:direct-area-order:21-workflow",
            "area-sequence:direct-area-order:22-workflow",
            "area-sequence:direct-area-order:25-workflow",
            "area-sequence:direct-area-order:26-workflow",
            "area-sequence:direct-area-order:27-workflow",
        }
        self.assertTrue(expected.issubset(self.approved_sequence_edges))
        for edge_id in expected:
            edge = self.edges[edge_id]
            self.assertEqual(edge["sequence_policy"], "workflow")
            self.assertEqual(edge["blocking_policy"], "never")
            self.assertTrue(edge["recommendation_only"])
            self.assertTrue(edge["condition"])
            self.assertTrue(edge["source_references"])
            self.assertTrue(all(ref.get("url", "").startswith("https://") for ref in edge["source_references"]))

    def test_every_route_learning_item_has_an_explicit_sequence_or_choice_disposition(self):
        """No visible item is left with an ambiguous, implicit ordering state."""
        for route in self.routes:
            plan = route["sequence_plan"]
            stage_positions = self._stage_item_positions(plan["stages"])
            expected_item_ids: set[str] = set()
            for stage in plan["stages"]:
                expected_item_ids.update(stage.get("item_ids", []))
                expected_item_ids.update(stage.get("area_foundation_ids", []))
                for lane_items in stage.get("item_ids_by_requirement_lane", {}).values():
                    expected_item_ids.update(lane_items)
                expected_item_ids.update(stage.get("tool_ids", []))
                expected_item_ids.update(stage.get("layer_two_three_item_ids", []))
                for role_path in stage.get("role_paths", []):
                    for lane_items in role_path.get("role_item_ids_by_requirement_lane", {}).values():
                        expected_item_ids.update(lane_items)
                    for task_path in role_path.get("role_task_paths", []):
                        for lane_items in task_path.get("role_item_ids_by_requirement_lane", {}).values():
                            expected_item_ids.update(lane_items)
                        expected_item_ids.update(task_path.get("role_tool_ids", []))

            dispositions = plan.get("item_sequence_dispositions", [])
            disposition_ids = {record["item_id"] for record in dispositions}
            self.assertEqual(disposition_ids, expected_item_ids, route["route_id"])
            self.assertTrue(plan.get("every_route_item_has_explicit_ordering_disposition"), route["route_id"])
            self.assertTrue(plan.get("item_sequence_disposition_policy"), route["route_id"])

            for record in dispositions:
                item_id = record["item_id"]
                node = self.nodes[item_id]
                self.assertIn(record["stage_id"], {stage["stage_id"] for stage in plan["stages"]})
                self.assertTrue(record["student_visible"], (route["route_id"], item_id))
                self.assertIn(record["selection_policy"], {"compulsory_foundation", "skippable"})
                self.assertFalse(record["render_position_is_learning_rank"])
                self.assertTrue(record["ordering_roles"])
                ordering_scope = record.get("ordering_scope", {})
                self.assertEqual(ordering_scope.get("route_stage", {}).get("stage_id"), record["stage_id"])
                self.assertEqual(ordering_scope.get("route_stage", {}).get("position"), record["stage_position"])
                self.assertTrue(ordering_scope.get("groups"), (route["route_id"], item_id))
                self.assertTrue(record.get("group_contexts"), (route["route_id"], item_id))
                self.assertTrue(all(group.get("stage_id") == record["stage_id"] for group in record["group_contexts"]))
                self.assertNotIn("independent_skippable_choice", record["ordering_roles"])
                self.assertNotEqual(record["relative_order"], "no_relative_order_claim")
                if record["selection_policy"] == "skippable":
                    self.assertNotIn("blocks", str(node.get("blocking_policy", "never")))
                if record["stage_id"] == "domain_foundations":
                    self.assertEqual(record["selection_policy"], "compulsory_foundation")
                    self.assertEqual(record["ordering_roles"], ["compulsory_foundation_spine_position"])
                    self.assertIsInstance(record["foundation_teaching_order"], int)
                    self.assertEqual(
                        record["relative_order"],
                        "ordered_foundation_position_in_progressive_route",
                    )
                    continue
                if record["stage_id"] != "domain_foundations" and not record["sequence_edge_ids"]:
                    self.assertIn("parallel_choice_in_selected_route_context", record["ordering_roles"])
                    self.assertEqual(
                        ordering_scope.get("within_group"),
                        "parallel_choices_within_the_selected_ordered_route_group",
                    )
                elif record["sequence_edge_ids"]:
                    self.assertEqual(
                        ordering_scope.get("within_group"),
                        "specific_item_pairs_ordered_only_by_attached_reviewed_edges",
                    )
                for edge_id in record["sequence_edge_ids"]:
                    edge = self.edges[edge_id]
                    self.assertIn(item_id, {edge["source"], edge["target"]})
                    self.assertTrue(edge.get("sequence_approved"))
                    self.assertIn(edge.get("sequence_policy"), {"conditional_prerequisite", "workflow"})
                for edge_id in record["alternative_edge_ids"]:
                    edge = self.edges[edge_id]
                    self.assertIn(item_id, {edge["source"], edge["target"]})
                    self.assertIn(edge.get("relationship"), {"alternative_to", "alternative_tool_option", "tool_alternative_for_role_task"})

            disposition_sequence_edges = {
                edge_id for record in dispositions for edge_id in record["sequence_edge_ids"]
            }
            self.assertEqual(disposition_sequence_edges, {record["id"] for record in plan["sequence_edges"]}, route["route_id"])
            disposition_alternative_edges = {
                edge_id for record in dispositions for edge_id in record["alternative_edge_ids"]
            }
            expected_item_alternatives = {
                edge_id for edge_id in plan["alternative_edge_ids"]
                if self.edges[edge_id]["source"] in stage_positions
                and self.edges[edge_id]["target"] in stage_positions
                and ({self.edges[edge_id]["source"], self.edges[edge_id]["target"]} & expected_item_ids)
            }
            # Exact comparisons may connect a learning item to the selected
            # method/design node (for example, newly collected survey data vs
            # existing secondary data). Require both endpoints in this route,
            # but record the edge on the learning-item disposition it touches.
            self.assertEqual(disposition_alternative_edges, expected_item_alternatives, route["route_id"])

    def test_alternatives_are_exact_comparison_pairs_not_sequence_steps(self):
        for route in self.routes:
            plan = route["sequence_plan"]
            stage_item_ids = set(self._stage_item_positions(plan["stages"]))
            for pair in plan.get("alternative_choice_pairs", []):
                edge = self.edges[pair["evidence_edge_id"]]
                self.assertEqual(edge.get("relationship"), pair["relationship"])
                self.assertEqual(edge.get("source"), pair["source"])
                self.assertEqual(edge.get("target"), pair["target"])
                self.assertIn(pair["source"], stage_item_ids)
                self.assertIn(pair["target"], stage_item_ids)
                self.assertIsNot(edge.get("selectable"), False)
                self.assertEqual(edge.get("alternative_review_disposition"), "approved")
                self.assertNotIn(pair["evidence_edge_id"], {row["id"] for row in plan.get("sequence_edges", [])})
                self.assertTrue(pair.get("explanation"))

    def test_reviewed_method_extensions_are_route_choices_not_order_edges(self):
        reconciliation = self.graph["method_extension_route_reconciliation"]
        self.assertEqual(reconciliation["route_item_exposure_edges_approved"], 5)
        self.assertEqual(reconciliation["sequence_edges_added"], 0)
        edge_ids = set(reconciliation["edge_ids"])
        self.assertEqual(len(edge_ids), 5)
        edges_by_id = {edge.get("id"): edge for edge in self.graph["edges"]}
        for edge_id in edge_ids:
            edge = edges_by_id[edge_id]
            item_id = edge["target"]
            node = self.nodes[item_id]
            self.assertTrue(node.get("student_visible"), item_id)
            self.assertNotEqual(node.get("approval"), "unapproved", item_id)
            self.assertTrue(edge.get("source_references"), edge_id)
            self.assertTrue(all(reference.get("url", "").startswith("http") for reference in edge["source_references"]))
            self.assertEqual(edge.get("sequence_policy"), "none")
            self.assertEqual(edge.get("blocking_policy"), "never")
            self.assertTrue(edge.get("recommendation_only"))
        for route in self.routes:
            selected_methods = set(route["sequence_plan"]["method_ids"])
            expected_items = {
                edges_by_id[edge_id]["target"]
                for edge_id in edge_ids
                if edges_by_id[edge_id]["source"] in selected_methods
            }
            stage = route["sequence_plan"]["stages"][3]
            actual_items = {
                item_id for lane in stage["item_ids_by_requirement_lane"].values()
                for item_id in lane
            }
            self.assertTrue(expected_items.issubset(actual_items), route["route_id"])
            for item_id in expected_items:
                disposition = next(record for record in route["sequence_plan"]["item_sequence_dispositions"]
                                   if record["item_id"] == item_id)
                self.assertEqual(disposition["selection_policy"], "skippable")
                self.assertFalse(disposition["sequence_edge_ids"])
                self.assertIn("parallel_choice_in_selected_route_context", disposition["ordering_roles"])


    def test_optional_domain_area_role_choices_do_not_block_baseline_routes(self):
        for route in self.routes:
            stages = route["sequence_plan"]["stages"]
            method_learning = stages[3]
            area_start = stages[4]
            family_stage = stages[5]
            area_learning = stages[6]
            roles = stages[7]
            role_learning = stages[8]
            self.assertTrue(method_learning["skippable_when_not_selected"])
            self.assertTrue(method_learning["skipping_preserves_baseline_area_and_role_routes"])
            self.assertTrue(area_start["foundation_skippable"])
            self.assertTrue(family_stage["zero_selection_preserves_general_route"])
            self.assertFalse(area_learning["blocks_progression"])
            self.assertTrue(area_learning["non_required_items_skippable"])
            self.assertTrue(roles["roles_are_parallel_choices_not_a_learning_sequence"])
            self.assertTrue(role_learning["all_role_items_skippable"])
            self.assertTrue(role_learning["within_group_items_are_parallel_choices_inside_ordered_route"])

    def test_order_contract_rejects_legacy_unordered_wording_and_role_item_flags(self):
        contract = self.graph["selection_progression_contract"]
        rendered = json.dumps(contract, ensure_ascii=False)
        self.assertNotIn("no_relative_order_claim", rendered)
        self.assertNotIn("independent_skippable_choice", rendered)
        self.assertIn("nine route stages are ordered", contract["ordering_model"]["route_progression"])
        self.assertIn("not an unordered route", contract["ordering_model"]["item_pair_order"])
        self.assertIn("parallel skippable choices", contract["ordering_model"]["item_pair_order"])
        for node in self.nodes.values():
            if node.get("role_sequence_status"):
                self.assertNotIn("sequence_approved", node)
                self.assertIn("ordered_role_task_context", node["role_sequence_status"])

        for route in self.routes:
            plan = route["sequence_plan"]
            self.assertEqual(plan["version"], "d078-route-sequence-plan-2026-11-14-v6")
            for stage in plan["stages"]:
                route_ordering = stage["route_ordering"]
                self.assertEqual(route_ordering["position"], stage["position"])
                self.assertEqual(route_ordering["scope"], "ordered_progressive_route_stage")

    def test_exported_ui_graph_matches_regenerated_route_plan(self):
        graph_contract = self.graph["selection_progression_contract"]
        ui_contract = self.ui["selection_progression_contract"]
        self.assertEqual(ui_contract, graph_contract)
        ui_edge_ids = {edge["id"] for edge in self.ui["typed_relationship_edges"] if edge.get("id")}
        for route in self.routes:
            self.assertTrue(all(edge_id in ui_edge_ids for edge_id in route["sequence_plan"].get("conditional_prerequisite_edge_ids", [])))
            self.assertTrue(all(edge_id in ui_edge_ids for edge_id in route["sequence_plan"].get("recommended_workflow_edge_ids", [])))


if __name__ == "__main__":
    unittest.main()
