"""Check that the Sociology manual test packs name real graph routes/items."""
from __future__ import annotations

import re
import runpy
import unicodedata
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MATRIX_PATH = ROOT / "docs/manual-review/SOCIOLOGY_END_TO_END_MANUAL_TEST_MATRIX_2026_10_26.md"
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"

FRAME = "domain-item:participatory-and-action-research"
SURVEY = "domain-item:d078-survey-method"
INTERVIEWS = "domain-item:d078-interviews"
OBSERVATION = "domain-item:d078-observation-ethnography"
FOCUS_GROUPS = "domain-item:focus-groups-and-workshops"
DOCUMENTS = "domain-item:d078-document-analysis"
QUALITATIVE = "domain-item:d078-qualitative-approach"

# Each entry is the student's exact selected route and chosen area/role from
# the package. For component variants, methods include the participatory frame.
PACKS = {
    1: ("single_method", ["domain-item:d078-quantitative-approach"], None,
        "D078:economics-applied-analysis", "Economist", []),
    2: ("single_method", [INTERVIEWS], None,
        "D078:social-research-evaluation", "Social Work Researcher", []),
    3: ("single_method", [SURVEY], None,
        "D078:human-geography-population", "Demographer", []),
    4: ("single_method", [QUALITATIVE], None,
        "D078:psychology-social-behaviour", "Behavioural Scientist", []),
    5: ("named_design", [SURVEY, INTERVIEWS], "combo:explanatory-sequential",
        "D078:politics-governance-public-policy", "Economic Policy Officer", []),
    6: ("named_design", [SURVEY, INTERVIEWS], "combo:convergent-survey-interview",
        "D078:psychology-social-behaviour", "Behavioural Scientist", []),
    7: ("named_design", [INTERVIEWS, OBSERVATION], "combo:interview-and-observation",
        "D078:social-research-evaluation", "Statistician", []),
    8: ("named_design_component_variant", [FRAME, INTERVIEWS], "combo:participatory-method-choice",
        "D078:sociology-social-anthropology", "Anthropologist", []),
    9: ("single_method", ["domain-item:d078-agent-based-modeling"], None,
        "D078:computational-digital-social-science", "Statistician", []),
    10: ("single_method", ["domain-method:social-network-analysis"], None,
         "D078:sociology-social-anthropology", "Sociologist", []),
    11: ("single_method", ["domain-item:d078-spatial-social-analysis"], None,
         "D078:human-geography-population", "Geographer", []),
    12: ("single_method", ["domain-item:experiments-quasi-experiments-and-causal-inference"], None,
         "D078:social-research-evaluation", "Statistician", []),
    13: ("single_method", [FOCUS_GROUPS], None,
         "D078:psychology-social-behaviour", "Behavioural Scientist", []),
    14: ("single_method", [OBSERVATION], None,
         "D078:sociology-social-anthropology", "Genealogist", []),
    15: ("single_method", [DOCUMENTS], None,
         "D078:social-research-evaluation", "Statistician", []),
    16: ("single_method", ["domain-item:discourse-and-conversation-analysis"], None,
         "D078:politics-governance-public-policy", "Political Scientist", []),
    17: ("single_method", ["domain-item:case-study-and-comparative-case-design"], None,
         "D078:sociology-social-anthropology", "Archaeologist", []),
    18: ("single_method", ["domain-item:archival-and-historical-research"], None,
         "D078:sociology-social-anthropology", "Genealogist", []),
    19: ("single_method", ["domain-item:d078-mixed-methods"], None,
         "D078:economics-applied-analysis", "Economic Adviser", []),
    20: ("single_method", ["domain-item:systematic-and-scoping-evidence-synthesis"], None,
         "D078:social-research-evaluation", "Social Work Researcher", []),
    21: ("single_method", ["domain-item:programme-evaluation-and-theory-of-change"], None,
         "D078:social-research-evaluation", "Social Work Researcher", []),
    22: ("single_method", ["domain-item:psychometrics-and-scale-construction"], None,
         "D078:psychology-social-behaviour", "Behavioural Scientist", []),
    23: ("single_method", ["domain-item:longitudinal-panel-and-multilevel-data"], None,
         "D078:economics-applied-analysis", "Business Economics Researcher", []),
    24: ("single_method", ["domain-method:network-analysis"], None,
         "D078:politics-governance-public-policy", "Political Scientist", []),
    25: ("single_method", ["domain-item:d078-computational-social-research"], None,
         "D078:computational-digital-social-science", "Statistician", []),
    26: ("named_design_component_variant", [FRAME, OBSERVATION], "combo:participatory-method-choice",
         "D078:human-geography-population", "Geographer", []),
    27: ("named_design", [QUALITATIVE, SURVEY], "combo:exploratory-sequential",
         "D078:politics-governance-public-policy", "Tax Policy Analyst", []),
    28: ("named_design", [FOCUS_GROUPS, SURVEY], "combo:focus-group-to-survey",
         "D078:human-geography-population", "Geographer", []),
    29: ("named_design", [SURVEY, FOCUS_GROUPS], "combo:survey-followup-focus-group",
         "D078:psychology-social-behaviour", "Behavioural Scientist", []),
    30: ("named_design", ["domain-item:case-study-and-comparative-case-design", INTERVIEWS, DOCUMENTS, OBSERVATION],
         "combo:case-study-multiple-sources", "D078:social-research-evaluation", "Social Work Researcher", []),
    31: ("named_design", [DOCUMENTS, INTERVIEWS], "combo:document-and-interview-elicitation",
         "D078:sociology-social-anthropology", "Media Scientist", []),
    32: ("named_design_component_variant", [FRAME, FOCUS_GROUPS], "combo:participatory-method-choice",
         "D078:psychology-social-behaviour", "Behavioural Scientist", []),
    33: ("named_design_component_variant", [FRAME, SURVEY], "combo:participatory-method-choice",
         "D078:politics-governance-public-policy", "Economic Development Coordinator", []),
    34: ("named_design_component_variant", [FRAME, OBSERVATION], "combo:participatory-method-choice",
         "D078:human-geography-population", "Geographer", []),
    35: ("single_method", ["domain-item:d078-scenario-analysis"], None,
         "D078:politics-governance-public-policy", "Political Scientist", []),
    36: ("single_method", ["domain-item:case-study-and-comparative-case-design"], None,
         "D078:sociology-social-anthropology", "Criminologist", []),
    37: ("single_method", [QUALITATIVE], None,
         "D078:psychology-social-behaviour", "Thanatology Researcher", []),
    38: ("named_design", ["domain-item:case-study-and-comparative-case-design", INTERVIEWS,
                           "domain-item:d078-document-analysis", OBSERVATION],
         "combo:case-study-multiple-sources", "D078:social-research-evaluation",
         "Social Work Researcher", ["D078:sociology-social-anthropology"]),
}


class SociologyMatrixGraphRouteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import json

        cls.graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
        cls.nodes = {node["id"]: node for node in cls.graph["nodes"]}
        cls.routes = cls.graph["selection_progression_contract"]["routes"]
        cls.task_focus_selections = runpy.run_path(str(
            ROOT / "data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py"
        ))["TASK_FOCUS_SELECTIONS"]
        cls.extra_area_focus_selections = runpy.run_path(str(
            ROOT / "data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py"
        ))["EXTRA_AREA_FOCUS_SELECTIONS"]
        text = MATRIX_PATH.read_text(encoding="utf-8")
        package_text = text.split("<!-- GENERATED GRAPH-EXACT ROUTE INVENTORY START -->", 1)[0]
        sections = re.split(r"(?m)^(?:##|###) Package (\d+)\b[^\n]*\n", package_text)
        cls.pack_text = {int(sections[i]): sections[i + 1] for i in range(1, len(sections), 2)}
        inventory_sections = re.split(
            r"(?m)^### Pack (\d+): exact screen-by-screen route and selections\s*\n", text
        )
        cls.inventory_text = {
            int(inventory_sections[i]): inventory_sections[i + 1]
            for i in range(1, len(inventory_sections), 2)
        }
        cls.role_id_by_label = {
            node.get("label", "").casefold(): node_id
            for node_id, node in cls.nodes.items()
            if node_id.startswith("role:D078:")
        }

    @staticmethod
    def _search_text(value: str) -> str:
        value = unicodedata.normalize("NFKD", value).casefold()
        return (value.replace("’", "'").replace("‘", "'")
                .replace("–", "-").replace("—", "-").replace("×", "x"))

    @staticmethod
    def _graph_label(node: dict) -> str:
        return str(node.get("student_title") or node.get("display_label") or node.get("label") or "")

    def _route(self, pack_no: int):
        kind, method_ids, combination_id, area_id, role_label, extra_areas = PACKS[pack_no]
        candidates = [row for row in self.routes
                      if row["route_kind"] == kind
                      and set(row["sequence_plan"]["method_ids"]) == set(method_ids)
                      and row.get("combination_id") == combination_id
                      and row["area_id"] == area_id]
        self.assertEqual(len(candidates), 1, f"Package {pack_no}: route signature {kind}/{method_ids}/{combination_id}/{area_id}")
        route = candidates[0]
        role_id = self.role_id_by_label.get(role_label.casefold())
        self.assertIsNotNone(role_id, f"Package {pack_no}: unknown role label {role_label}")
        self.assertIn(role_id, route["role_ids"], f"Package {pack_no}: {role_label} is not reachable on {route['route_id']}")
        return route, extra_areas

    def test_every_package_matches_an_exact_method_design_area_and_role_route(self):
        self.assertEqual(set(self.pack_text), set(PACKS))
        for pack_no in PACKS:
            with self.subTest(package=pack_no):
                self._route(pack_no)

    def test_packages_cover_every_method_every_named_design_and_every_visible_role(self):
        selected_methods = {method_id for spec in PACKS.values() for method_id in spec[1]}
        self.assertEqual(selected_methods, set(self.graph["method_node_ids"]))
        selected_designs = {spec[2] for spec in PACKS.values() if spec[2]}
        self.assertEqual(selected_designs, {design["id"] for design in self.graph.get("combination_designs", [])})

        selected_roles = {spec[4].casefold() for spec in PACKS.values()}
        for by_area in self.extra_area_focus_selections.values():
            selected_roles.update(spec["role_label"].casefold() for spec in by_area.values())
        visible_roles = {
            node.get("label", "").casefold()
            for node_id, node in self.nodes.items()
            if node_id.startswith("role:D078:") and node.get("student_visible") is True
        }
        self.assertEqual(selected_roles, visible_roles)

    def test_added_packages_use_institutions_in_the_exact_sociology_offering(self):
        import json

        offerings = json.loads((ROOT / "data/career-mapping/jamb/social_management_offerings.json").read_text(encoding="utf-8"))
        sociology = next(row for row in offerings["programmes"] if row.get("jamb_name") == "Sociology")
        offered = set(sociology["institutions"])
        added_institutions = {
            35: ("IBADAN", "University of Ibadan"),
            36: ("FED-OYE EKITI", "Federal University Oye-Ekiti"),
            37: ("UNI-ILESA", "University of Ilesa"),
            38: ("FED-KEBBI", "Federal University Birnin Kebbi"),
        }
        for pack_no, (code, name) in added_institutions.items():
            with self.subTest(package=pack_no):
                self.assertIn(code, offered)
                self.assertIn(name.casefold(), self._search_text(self.pack_text[pack_no]))

    def test_selected_task_family_reaches_the_pack_role_through_approved_role_task_edges(self):
        builder = runpy.run_path(str(
            ROOT / "data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py"
        ))
        focus_by_pack = builder["TASK_FOCUS_SELECTIONS"]
        extra_focus_by_pack = builder["EXTRA_AREA_FOCUS_SELECTIONS"]
        visible_edges = [edge for edge in self.graph["edges"]
                         if edge.get("status") == "resolved_ready_for_use"
                         and edge.get("student_visible") is True]

        def role_reached(family_id: str, role_id: str) -> bool:
            task_ids = {
                edge["target"] for edge in visible_edges
                if edge.get("relationship") == "area_task_family_supports_role_task"
                and edge.get("source") == family_id
            }
            return any(
                edge.get("relationship") == "role_task_family_of_role"
                and edge.get("source") in task_ids
                and edge.get("target") == role_id
                for edge in visible_edges
            )

        for pack_no, spec in PACKS.items():
            with self.subTest(package=pack_no):
                primary_role_id = self.role_id_by_label[spec[4].casefold()]
                for family_id in focus_by_pack[pack_no]:
                    self.assertTrue(role_reached(family_id, primary_role_id),
                                    f"Package {pack_no}: selected task family does not reach {spec[4]}")
                for area_id, extra in extra_focus_by_pack.get(pack_no, {}).items():
                    extra_role_id = self.role_id_by_label[extra["role_label"].casefold()]
                    for family_id in extra["task_family_ids"]:
                        self.assertTrue(role_reached(family_id, extra_role_id),
                                        f"Package {pack_no}: selected additional-area task family does not reach {extra['role_label']}")

    def test_every_pack_inventory_lists_all_exact_graph_choices_by_stage(self):
        self.assertEqual(set(self.inventory_text), set(PACKS))
        builder = runpy.run_path(str(
            ROOT / "data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py"
        ))

        def add_group_ids(target: set[str], group: dict):
            for values in group.get("item_ids_by_requirement_lane", {}).values():
                target.update(values)
            target.update(group.get("tool_ids", []))

        for pack_no, spec in PACKS.items():
            with self.subTest(package=pack_no):
                route, _extra_areas = self._route(pack_no)
                plan = route["sequence_plan"]
                stages = {stage["stage_id"]: stage for stage in plan["stages"]}
                role_id = self.role_id_by_label[spec[4].casefold()]
                expected_ids = set(plan["method_ids"])
                expected_ids.update(stages["domain_foundations"].get("item_ids", []))
                expected_ids.update(stages["society_and_social_world_orientation"].get("item_ids", []))
                expected_ids.update(stages["area_task_family_choices"].get("task_family_ids", []))
                expected_ids.update(stages["area_start"].get("area_foundation_ids", []))
                expected_ids.update(route.get("role_ids", []))
                domain_stage = stages["method_linked_domain_learning"]
                for group in domain_stage.get("learning_order_groups", []):
                    add_group_ids(expected_ids, group)

                selected_families = self.task_focus_selections[pack_no]
                area_stage = stages["area_learning_and_tools"]
                if not selected_families:
                    add_group_ids(expected_ids, area_stage.get("general_area_learning_group", {}))
                else:
                    family_groups = {group.get("task_family_id"): group
                                     for group in area_stage.get("task_family_learning_groups", [])}
                    for family_id in selected_families:
                        expected_ids.add(family_id)
                        group = family_groups.get(family_id, {})
                        add_group_ids(expected_ids, group)
                        for edge in self.graph["edges"]:
                            if (edge.get("status") != "resolved_ready_for_use"
                                    or edge.get("student_visible") is not True):
                                continue
                            if edge.get("relationship") == "domain_item_supports_area_task" and edge.get("target") == family_id:
                                expected_ids.add(edge["source"])
                        for item_id in [item for lane in group.get("item_ids_by_requirement_lane", {}).values() for item in lane]:
                            for edge in self.graph["edges"]:
                                if (edge.get("relationship") == "area_item_has_contextual_tool_option"
                                        and edge.get("source") == item_id
                                        and edge.get("target") in area_stage.get("tool_ids", [])
                                        and edge.get("status") == "resolved_ready_for_use"
                                        and edge.get("student_visible") is True
                                        and str(edge.get("explanation") or "").strip()):
                                    expected_ids.add(edge["target"])
                role_stage = stages["role_task_learning_and_tools"]
                role_path = next(
                    (path for path in role_stage.get("role_paths", []) if path.get("role_id") == role_id),
                    None,
                )
                if role_path and selected_families:
                    for task_path in role_path.get("role_task_paths", []):
                        if task_path.get("task_family_id") not in selected_families:
                            continue
                        groups = task_path.get("learning_order_groups", [])
                        if groups:
                            for group in groups:
                                add_group_ids(expected_ids, group)
                        else:
                            for values in task_path.get("role_item_ids_by_requirement_lane", {}).values():
                                expected_ids.update(values)
                            expected_ids.update(task_path.get("role_tool_ids", []))

                for extra_area_id, extra in self.extra_area_focus_selections.get(pack_no, {}).items():
                    extra_route = builder["route_for"](self.routes, (
                        spec[0], spec[1], spec[2], extra_area_id, extra["role_label"], []
                    ))
                    extra_stages = {stage["stage_id"]: stage for stage in extra_route["sequence_plan"]["stages"]}
                    expected_ids.update(extra_stages["area_start"].get("area_foundation_ids", []))
                    extra_area_stage = extra_stages["area_learning_and_tools"]
                    extra_groups = {group.get("task_family_id"): group
                                    for group in extra_area_stage.get("task_family_learning_groups", [])}
                    extra_role_id = self.role_id_by_label[extra["role_label"].casefold()]
                    extra_role_path = next(path for path in extra_stages["role_task_learning_and_tools"]["role_paths"]
                                           if path["role_id"] == extra_role_id)
                    for family_id in extra["task_family_ids"]:
                        expected_ids.add(family_id)
                        add_group_ids(expected_ids, extra_groups.get(family_id, {}))
                    for task_path in extra_role_path.get("role_task_paths", []):
                        if task_path.get("task_family_id") in extra["task_family_ids"]:
                            for group in task_path.get("learning_order_groups", []):
                                add_group_ids(expected_ids, group)
                    expected_ids.update(extra_route.get("role_ids", []))
                inventory = self._search_text(self.inventory_text[pack_no])
                missing = sorted(
                    nodes_id for nodes_id in expected_ids
                    if self._search_text(self._graph_label(self.nodes.get(nodes_id, {}))) not in inventory
                )
                self.assertFalse(missing, f"Package {pack_no} inventory omits graph choices: {missing}")
                self.assertIn("deselecting any optional", inventory)
                self.assertIn("skippable", inventory)

    def test_alternative_comparisons_do_not_import_hidden_cross_route_choices(self):
        builder = runpy.run_path(str(
            ROOT / "data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py"
        ))
        visible_a = "domain-item:visible-a"
        visible_b = "domain-item:visible-b"
        hidden = "role-tool:other-role-only"
        nodes = {
            visible_a: {"student_title": "Visible A"},
            visible_b: {"student_title": "Visible B"},
            hidden: {"student_title": "Other-role-only tool"},
        }
        plan = {"alternative_choice_pairs": [
            {"source": visible_a, "target": visible_b, "explanation": "same route"},
            {"source": visible_a, "target": hidden, "explanation": "different role route"},
        ]}
        rendered = builder["alternatives"](nodes, plan, {visible_a, visible_b})
        self.assertEqual(len(rendered), 1)
        self.assertIn("Visible A", rendered[0])
        self.assertIn("Visible B", rendered[0])
        self.assertNotIn("Other-role-only tool", "\n".join(rendered))

    def test_explicitly_selected_graph_items_in_each_pack_belong_to_its_route(self):
        graph_labels = {
            self._search_text(self._graph_label(node))
            for node in self.nodes.values()
            if self._graph_label(node)
        }
        for pack_no in PACKS:
            with self.subTest(package=pack_no):
                inventory = self._search_text(self.inventory_text[pack_no])
                self.assertIn(f"pack {pack_no} action", inventory)
                self.assertIn("select this pack's exact choice(s)", inventory)
                self.assertIn("exact final tray state", inventory)
                selected_names = re.findall(r"select this pack's exact choice\(s\):([^\n]+)", inventory)
                for action_line in selected_names:
                    for phrase in re.findall(r"\*\*([^*]+)\*\*", action_line):
                        self.assertIn(
                            self._search_text(phrase), graph_labels,
                            f"Pack {pack_no} action selects a name that is not a graph node: {phrase}",
                        )

    def test_every_generated_pack_preserves_foundation_method_area_role_stage_order(self):
        for pack_no, inventory in self.inventory_text.items():
            with self.subTest(package=pack_no):
                markers = (
                    "Social Sciences domain entry",
                    "Optional Society choice, before any method appears or is selected",
                    f"Pack {pack_no} pre-method action",
                    "Method/design choice",
                    "After method/design selection and before opening an area",
                    "Area choices after completing domain learning",
                    "Pack " + str(pack_no) + " area-foundation action",
                    "Task-family focus, then area learning/tools",
                    "Roles available from this area route",
                    "Alternatives and order checks",
                    "Exact final tray state for this pack",
                    "Save, My World, and print/download",
                )
                if "Area-foundation action:** none" in inventory:
                    markers = tuple(marker for marker in markers if "area-foundation action" not in marker)
                    markers = markers[:6] + ("Area-foundation action:** none",) + markers[6:]
                positions = [inventory.find(marker) for marker in markers]
                self.assertTrue(all(position >= 0 for position in positions), f"Package {pack_no} is missing a stage marker: {markers}")
                self.assertEqual(positions, sorted(positions), f"Package {pack_no} stage order is wrong: {markers}")

    def test_optional_society_choice_is_explicit_in_every_pack_before_methods(self):
        society_id = "runtime-item:domain:d078:d078-society-and-social-world-knowledge"
        expected_title = self._search_text(self._graph_label(self.nodes[society_id]))
        for pack_no, inventory_text in self.inventory_text.items():
            with self.subTest(package=pack_no):
                inventory = self._search_text(inventory_text)
                foundations_at = inventory.find("social sciences domain entry")
                society_at = inventory.find("optional society choice, before any method appears or is selected")
                method_at = inventory.find("method/design choice, only after the society select-or-skip check")
                self.assertTrue(0 <= foundations_at < society_at < method_at,
                                f"Pack {pack_no} does not put optional Society between foundations and methods")
                self.assertIn(expected_title, inventory[society_at:method_at])
                action = f"pack {pack_no} pre-method action:"
                self.assertIn(action, inventory)
                selected = pack_no % 2 == 1 or pack_no == 34
                expected_action = "select **" if selected else "skip (leave unchecked) **"
                action_text = inventory.split(action, 1)[1].split("\n", 1)[0]
                self.assertIn(expected_action, action_text)
                self.assertIn("methods are available either way", action_text)

    def test_package_34_selects_each_stage_in_graph_order_and_uses_exact_family(self):
        route, _ = self._route(34)
        body = self._search_text(self.inventory_text[34])
        stages = {stage["stage_id"]: stage for stage in route["sequence_plan"]["stages"]}
        family_id = self.task_focus_selections[34][0]
        family_label = self._search_text(self._graph_label(self.nodes[family_id]).rstrip("."))
        ordered_markers = (
            "social sciences domain entry",
            "optional society choice, before any method appears or is selected",
            "pack 34 pre-method action",
            "method/design choice, only after the society select-or-skip check",
            "after method/design selection and before opening an area",
            "area choices after completing domain learning",
            "pack 34 area-foundation action",
            "task-family focus, then area learning/tools",
            family_label,
            "exact area-stage menu for selected focus",
            "roles available from this area route",
            "role-task context after opening geographer",
            "exact final tray state for this pack",
        )
        positions = [body.find(marker) for marker in ordered_markers]
        self.assertTrue(all(position >= 0 for position in positions), f"Pack 34 misses an ordered stage: {ordered_markers}")
        self.assertEqual(positions, sorted(positions), "Pack 34 must complete every upstream stage before opening downstream choices")
        self.assertIn("select this pack's exact choice(s)", body)
        self.assertIn("follow this exact graph-reviewed order: **spatial data provenance, geographic units and scale**", body)
        self.assertIn("compare **geoda** with **pysal esda**", body)
        self.assertEqual(stages["area_task_family_choices"]["task_family_ids"], [family_id])
        self.assertIn("area-foundation", body)

    def test_package_09_records_the_absence_of_unreviewed_abm_role_cards(self):
        route, _ = self._route(9)
        statistician_id = self.role_id_by_label["statistician"]
        role_stage = next(stage for stage in route["sequence_plan"]["stages"]
                          if stage["stage_id"] == "role_task_learning_and_tools")
        statistician = next(path for path in role_stage["role_paths"]
                            if path["role_id"] == statistician_id)
        self.assertFalse(statistician["role_item_ids_by_requirement_lane"])
        self.assertFalse(statistician["role_task_paths"])
        self.assertIn("no task-family focus was selected", self.inventory_text[9].casefold())
        self.assertIn("must not display standalone role learning items or tools", self.inventory_text[9].casefold())

    def test_package_34_shows_the_exact_spatial_area_choices_on_its_route(self):
        route, _ = self._route(34)
        area_stage = next(stage for stage in route["sequence_plan"]["stages"]
                          if stage["stage_id"] == "area_learning_and_tools")
        area_start = next(stage for stage in route["sequence_plan"]["stages"]
                          if stage["stage_id"] == "area_start")
        expected_ids = {
                "area_enrichment_item:d078-human-geography-population-spatial-analysis-method",
                "area_enrichment_item:d078-human-geography-population-spatial-data-provenance-scale",
                "area_enrichment_item:d078-human-geography-population-spatial-pattern-communication",
                "area_enrichment_item:d078-human-geography-geographical-random-forest",
        }
        self.assertEqual(area_start["area_foundation_ids"], [
            "area_enrichment_item:d078-human-geography-population-spatial-concepts-and-place",
        ])
        self.assertEqual(set(area_stage["item_ids_by_requirement_lane"]), {"useful_optional"})
        self.assertEqual(set(area_stage["item_ids_by_requirement_lane"]["useful_optional"]), expected_ids)
        self.assertEqual(
            {item_id: self.nodes[item_id]["requirement_lane"] for item_id in expected_ids},
            {
                "area_enrichment_item:d078-human-geography-population-spatial-analysis-method": "conditional",
                "area_enrichment_item:d078-human-geography-population-spatial-data-provenance-scale": "conditional",
                "area_enrichment_item:d078-human-geography-population-spatial-pattern-communication": "conditional",
                "area_enrichment_item:d078-human-geography-geographical-random-forest": "useful_optional",
            },
        )
        self.assertEqual(set(area_stage["tool_ids"]), {
            "area_enrichment_item:d078-human-geography-population-qgis-spatial-tool",
            "area_tool_option:d078-hg-tool-arcgis-spatial-analyst",
            "area_tool_option:d078-hg-tool-geoda",
            "area_tool_option:d078-hg-tool-geopandas",
            "area_tool_option:d078-hg-tool-pysal-esda",
        })
        for label in (
            "Spatial analysis and map-based comparison",
            "Spatial patterns, place and scale",
            "Spatial data provenance, geographic units and scale",
            "Explain spatial patterns without overclaiming",
            "Geographical random forest for spatially varying prediction",
        ):
            self.assertIn(label.casefold(), self.inventory_text[34].casefold())
        self.assertIn("skippable", self.inventory_text[34].casefold())
        area_tool_edges = {
            edge["target"] for edge in self.graph["edges"]
            if edge.get("relationship") == "area_item_has_contextual_tool_option"
            and edge.get("source") == "area_enrichment_item:d078-human-geography-population-spatial-analysis-method"
        }
        self.assertEqual(area_tool_edges, {
            "area_tool_option:d078-hg-tool-geoda",
            "area_tool_option:d078-hg-tool-geopandas",
            "area_tool_option:d078-hg-tool-pysal-esda",
            "area_tool_option:d078-hg-tool-arcgis-spatial-analyst",
        })
        inventory = self._search_text(self.inventory_text[34])
        self.assertIn("tools attached to spatial analysis and map-based comparison", inventory)
        for tool_name in ("geoda", "geopandas", "pysal esda", "arcgis spatial analyst"):
            self.assertIn(tool_name, inventory)
        linked_items = inventory.split("area learning linked to this focus", 1)[1].split("role-task connections opened downstream by this focus", 1)[0]
        self.assertNotIn("spatial patterns, place and scale", linked_items,
                         "The area foundation must not be repeated as a second selectable area item")

    def test_new_packages_select_domain_items_then_area_items_then_role_items(self):
        for pack_no in PACKS:
            with self.subTest(package=pack_no):
                body = self._search_text(self.inventory_text[pack_no])
                route, extra_areas = self._route(pack_no)
                stages = route["sequence_plan"]["stages"]
                self.assertIn("select this pack's exact choice(s)", body)
                self.assertIn("leave this exact visible choice unchecked", body)
                self.assertIn("toggle one selected optional card off", body)
                self.assertIn("exact final tray state", body)
                role_id = self.role_id_by_label[PACKS[pack_no][4].casefold()]
                role_stage = next(stage for stage in route["sequence_plan"]["stages"]
                                  if stage["stage_id"] == "role_task_learning_and_tools")
                selected_role_path = next(path for path in role_stage["role_paths"]
                                          if path["role_id"] == role_id)
                has_selected_role_task = any(
                    task_path.get("task_family_id") in self.task_focus_selections[pack_no]
                    for task_path in selected_role_path.get("role_task_paths", [])
                )
                if has_selected_role_task:
                    self.assertIn("role-task context after opening", body)
                elif not self.task_focus_selections[pack_no]:
                    self.assertIn("no task-family focus was selected", body)
                else:
                    self.assertIn("no reviewed role-task connection", body)
                if extra_areas:
                    self.assertIn("additional selected area", body)
                    self.assertIn("additional role", body)
                self.assertEqual(
                    [stage["stage_id"] for stage in stages],
                    self.graph["selection_progression_contract"]["sequence_invariants"]["stage_order"],
                )

    def test_every_exact_graph_item_or_tool_named_in_a_pack_is_available_on_that_route(self):
        builder = runpy.run_path(str(
            ROOT / "data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py"
        ))
        graph_labels = {
            self._search_text(self._graph_label(node))
            for node in self.nodes.values()
            if self._graph_label(node)
        }
        for pack_no in PACKS:
            with self.subTest(package=pack_no):
                self.assertIn("d078 click path", self.pack_text[pack_no].casefold())
                body = self._search_text(self.inventory_text[pack_no])
                tray_section = body.split("exact final tray state for this pack", 1)[1].split("save, my world, and print/download", 1)[0]
                tray_labels = [line[2:].strip() for line in tray_section.splitlines() if line.startswith("- ")]
                self.assertTrue(tray_labels, f"Pack {pack_no} has no explicit final selection list")
                for item_label in tray_labels:
                    # Area names are graph-owned area nodes whose node id is
                    # the specialization key rather than the node identifier.
                    normalized = self._search_text(item_label)
                    area_labels = {
                        self._search_text(builder["label"](self.nodes, node_id))
                        for node_id in {PACKS[pack_no][3], *PACKS[pack_no][5]}
                    }
                    self.assertTrue(
                        normalized in graph_labels or normalized in area_labels,
                        f"Pack {pack_no} final tray contains a label with no graph node: {item_label}",
                    )


if __name__ == "__main__":
    unittest.main()
