"""Append graph-derived, pack-specific expected menus to the Sociology E2E guide."""
from __future__ import annotations

import json
import runpy
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
PACK_TEST_PATH = ROOT / "data/career-mapping/_audit/test_sociology_e2e_matrix_graph_routes_2026_11_06.py"
MATRIX_PATH = ROOT / "docs/manual-review/SOCIOLOGY_END_TO_END_MANUAL_TEST_MATRIX_2026_10_26.md"
START = "<!-- GENERATED GRAPH-EXACT ROUTE INVENTORY START -->"
END = "<!-- GENERATED GRAPH-EXACT ROUTE INVENTORY END -->"
SOCIETY_ID = "runtime-item:domain:d078:d078-society-and-social-world-knowledge"

# A deliberate spread of general-area, single-family, and multi-family checks.
# The selected IDs are validated against each exact method/design + area route.
TASK_FOCUS_SELECTIONS = {
    1: ["area-task:d078-econ-construct-and-analyze-data"],
    2: ["area-task:d078-social-research-evaluation-design-social-study"],
    3: ["area-task:d078-human-geography-population-population-change"],
    4: ["area-task:d078-psychology-social-behaviour-qualitative-group-inquiry"],
    5: ["area-task:d078-politics-governance-public-policy-policy-evidence-brief"],
    6: ["area-task:d078-psychology-social-behaviour-behavioural-research-design",
        "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry"],
    7: ["area-task:d078-social-research-evaluation-design-social-study"],
    8: ["area-task:d078-social-anthro-fieldwork-and-community-evidence"],
    9: [],  # ABM has no reviewed Statistician task-family link on this route.
    10: [],  # Network analysis has no reviewed Sociologist task-family link on this route.
    11: ["area-task:d078-human-geography-population-spatial-patterns"],
    12: ["area-task:d078-social-research-evaluation-design-social-study"],
    13: ["area-task:d078-psychology-social-behaviour-qualitative-group-inquiry"],
    14: [],  # Explicitly tests the valid no-focus path.
    15: ["area-task:d078-social-research-evaluation-design-social-study"],
    16: ["area-task:d078-politics-governance-public-policy-policy-evidence-brief"],
    17: ["area-task:d078-social-anthro-secondary-and-documentary-research"],
    18: ["area-task:d078-social-anthro-secondary-and-documentary-research"],
    19: [],  # Economic Adviser has no reviewed family link on this mixed-method route.
    20: ["area-task:d078-social-research-evaluation-programme-evaluation"],
    21: ["area-task:d078-social-research-evaluation-programme-evaluation"],
    22: ["area-task:d078-psychology-social-behaviour-quantitative-behavioural-analysis"],
    23: ["area-task:d078-econ-construct-and-analyze-data"],
    24: ["area-task:d078-politics-governance-public-policy-institution-and-policy-analysis"],
    25: ["area-task:d078-computational-digital-social-science-reproducible-social-data"],
    26: ["area-task:d078-human-geography-population-spatial-patterns"],
    27: ["area-task:d078-politics-governance-public-policy-policy-evidence-brief"],
    28: ["area-task:d078-human-geography-population-spatial-patterns"],
    29: ["area-task:d078-psychology-social-behaviour-behavioural-research-design"],
    30: ["area-task:d078-social-research-evaluation-programme-evaluation"],
    31: ["area-task:d078-sociology-social-anthropology-interpret-social-evidence"],
    32: ["area-task:d078-psychology-social-behaviour-qualitative-group-inquiry"],
    33: ["area-task:d078-politics-governance-public-policy-citizen-participation-process"],
    34: ["area-task:d078-human-geography-population-spatial-patterns"],
    35: ["area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios"],
    36: ["area-task:d078-sociology-social-anthropology-interpret-social-evidence"],
    37: ["area-task:d078-psychology-social-behaviour-qualitative-group-inquiry"],
    38: ["area-task:d078-social-research-evaluation-programme-evaluation"],
}

EXTRA_AREA_FOCUS_SELECTIONS = {
    38: {
        "D078:sociology-social-anthropology": {
            "role_label": "Sociologist",
            "task_family_ids": ["area-task:d078-sociology-social-anthropology-interpret-social-evidence"],
            "area_foundation_action": "select",
        }
    }
}


def label(nodes: dict[str, dict], item_id: str) -> str:
    node = nodes.get(item_id, {})
    if not node:
        area_node = next((candidate for candidate in nodes.values()
                          if candidate.get("kind") == "area_of_specialization"
                          and candidate.get("area_id") == item_id), None)
        node = area_node or {}
    value = node.get("student_title") or node.get("display_label") or node.get("label") or item_id
    value = str(value).strip()
    return value[:1].upper() + value[1:] if value else item_id


def route_for(routes: list[dict], spec: tuple) -> dict:
    kind, method_ids, combination_id, area_id, _role, _extra_areas = spec
    matches = [route for route in routes
               if route["route_kind"] == kind
               and set(route["sequence_plan"]["method_ids"]) == set(method_ids)
               and route.get("combination_id") == combination_id
               and route["area_id"] == area_id]
    if len(matches) != 1:
        raise ValueError(f"Expected one route for {spec!r}; found {len(matches)}")
    return matches[0]


def validate_stage_order(graph: dict, route: dict) -> dict[str, dict]:
    """Fail generation if any route moves Society or downstream learning out of contract order."""
    expected = graph["selection_progression_contract"]["sequence_invariants"]["stage_order"]
    stages = route["sequence_plan"]["stages"]
    actual = [stage.get("stage_id") for stage in stages]
    if actual != expected:
        raise ValueError(f"Wrong stage order for {route['route_id']}: {actual}; expected {expected}")
    by_id = {stage["stage_id"]: stage for stage in stages}
    foundations = by_id["domain_foundations"].get("item_ids", [])
    society = by_id["society_and_social_world_orientation"]
    method = by_id["method_or_named_design"]
    if len(foundations) != 3:
        raise ValueError(f"{route['route_id']} must begin with exactly three compulsory domain foundations")
    if society.get("item_ids") != [SOCIETY_ID]:
        raise ValueError(f"{route['route_id']} must show the optional Society choice exactly between foundations and methods")
    if (society.get("selection_policy") != "optional_select_or_skip_before_methods"
            or society.get("skippable") is not True
            or society.get("blocks_progression") is not False):
        raise ValueError(f"{route['route_id']} has an incorrect Society select/skip policy")
    if society.get("position") != 2 or method.get("position") != 3:
        raise ValueError(f"{route['route_id']} puts Society after or outside the pre-method slot")
    later_item_ids = set()
    for stage in stages[2:]:
        later_item_ids.update(stage.get("item_ids", []))
        later_item_ids.update(stage.get("tool_ids", []))
        later_item_ids.update(stage.get("layer_two_three_item_ids", []))
        for values in stage.get("item_ids_by_requirement_lane", {}).values():
            later_item_ids.update(values)
    if SOCIETY_ID in later_item_ids:
        raise ValueError(f"{route['route_id']} duplicates Society after method selection")
    return by_id


def group_choice_actions(nodes: dict[str, dict], group: dict,
                         alternative_pairs: list[dict]) -> tuple[list[str], list[str], set[str]]:
    """Choose a deterministic, graph-valid sample without inventing order for parallel choices."""
    lanes = group.get("item_ids_by_requirement_lane", {})
    lane_order = ["needed", "conditional", "useful_optional", "useful", "tool_choice"]
    lane_order.extend(lane for lane in lanes if lane not in lane_order)
    item_ids = list(dict.fromkeys(item_id for lane in lane_order for item_id in lanes.get(lane, [])))
    tool_ids = list(dict.fromkeys(group.get("tool_ids", [])))
    candidates = list(dict.fromkeys(item_ids + tool_ids))
    if not candidates:
        return ["- No selectable item or tool is recorded in this group."], [], set()

    selected: list[str] = []
    action_notes: list[str] = []
    sequence_edges = [edge for edge in group.get("sequence_edges", [])
                      if edge.get("policy") == "workflow"
                      and edge.get("source") in candidates and edge.get("target") in candidates]
    if sequence_edges:
        selected_set = {edge["source"] for edge in sequence_edges} | {edge["target"] for edge in sequence_edges}
        indegree = {item_id: 0 for item_id in selected_set}
        adjacency = {item_id: set() for item_id in selected_set}
        for edge in sequence_edges:
            source, target = edge["source"], edge["target"]
            if target not in adjacency[source]:
                adjacency[source].add(target)
                indegree[target] += 1
        rank = {item_id: index for index, item_id in enumerate(candidates)}
        ready = sorted((item_id for item_id, degree in indegree.items() if degree == 0), key=rank.__getitem__)
        while ready:
            current = ready.pop(0)
            selected.append(current)
            for target in sorted(adjacency[current], key=rank.__getitem__):
                indegree[target] -= 1
                if indegree[target] == 0:
                    ready.append(target)
                    ready.sort(key=rank.__getitem__)
        if len(selected) != len(selected_set):
            raise ValueError(f"Sequence cycle in group {group.get('group_id')}")
        action_notes.append("Follow this exact graph-reviewed order: " + " → ".join(f"**{label(nodes, item_id)}**" for item_id in selected) + ".")

    group_alternatives = [edge for edge in alternative_pairs
                          if edge.get("source") in candidates and edge.get("target") in candidates
                          and edge.get("source") not in selected and edge.get("target") not in selected]
    if group_alternatives:
        pair = group_alternatives[0]
        source, target = pair["source"], pair["target"]
        selected.append(source)
        action_notes.append(
            f"Compare **{label(nodes, source)}** with **{label(nodes, target)}**; for this pack select **{label(nodes, source)}** and leave **{label(nodes, target)}** unselected."
        )

    if not any(item_id in item_ids for item_id in selected) and item_ids:
        selected.append(item_ids[0])
    if not any(item_id in tool_ids for item_id in selected) and tool_ids:
        selected.append(tool_ids[0])
    selected = list(dict.fromkeys(selected))
    skipped = [item_id for item_id in candidates if item_id not in selected]
    if selected:
        action_notes.insert(0, "Select this pack's exact choice(s): " + ", ".join(f"**{label(nodes, item_id)}**" for item_id in selected) + ".")
    if not action_notes:
        action_notes.append(
            "These selected choices are parallel in the reviewed graph; select them in either order and do not infer a prerequisite."
        )
    if skipped:
        action_notes.append("Leave this exact visible choice unchecked for the skip test: **" + label(nodes, skipped[0]) + "**. Other unselected choices stay unchecked.")
    action_notes.append("After each tap, only the selected card is checked and only its row is added to the tray; this choice alone does not change the downstream route.")
    if selected:
        action_notes.append("Toggle one selected optional card off and confirm its tray row disappears; toggle it back on before continuing so the pack's final selected set is restored.")
    return action_notes, selected, set(skipped)


def render_group_actions(nodes: dict[str, dict], group: dict,
                         alternative_pairs: list[dict], pack_number: int,
                         prefix: str) -> tuple[list[str], set[str]]:
    actions, selected, _skipped = group_choice_actions(nodes, group, alternative_pairs)
    title = group.get("title") or group.get("group_id") or prefix
    lines = [f"**Pack {pack_number} action — {title}:**", *actions]
    return lines, set(selected)


def render_role_stage(nodes: dict[str, dict], role_path: dict | None,
                      selected_family_ids: list[str], alternative_pairs: list[dict],
                      pack_number: int, role_label: str) -> tuple[list[str], set[str]]:
    lines: list[str] = []
    selected_ids: set[str] = set()
    if not selected_family_ids:
        return ["No task-family focus was selected, so this pack must not display standalone role learning items or tools. The role overview remains available."], selected_ids
    if not role_path:
        return [f"No role path is recorded for **{role_label}** on this route."], selected_ids
    task_paths = [path for path in role_path.get("role_task_paths", [])
                  if path.get("task_family_id") in selected_family_ids]
    if not task_paths:
        return [f"No reviewed role-task connection links the selected focus to **{role_label}**. Show no role item/tool cards for this pack."], selected_ids
    for task_path in task_paths:
        groups = task_path.get("learning_order_groups", [])
        if not groups:
            groups = [{
                "group_id": task_path.get("role_task_id", "role-task"),
                "title": label(nodes, task_path.get("role_task_id", "role task")),
                "item_ids_by_requirement_lane": task_path.get("role_item_ids_by_requirement_lane", {}),
                "tool_ids": task_path.get("role_tool_ids", []),
                "sequence_edges": task_path.get("sequence_edges", []),
            }]
        task_label = label(nodes, task_path.get("role_task_id", "role task"))
        lines.append(f"**Role-task context after opening {role_label}: {task_label}**")
        for group_index, group in enumerate(groups, start=1):
            group_title = group.get("title") or group.get("group_id") or task_label
            lines.append(f"**Role learning group {group_index}: {group_title}**")
            for lane, ids in group.get("item_ids_by_requirement_lane", {}).items():
                if ids:
                    lines.append(f"Role learning choices in the `{lane}` lane (select or skip; no prerequisite is inferred):")
                    lines.extend(bullets(nodes, ids))
            if group.get("tool_ids"):
                lines.append("Role-task tools for this exact context:")
                lines.extend(bullets(nodes, group["tool_ids"]))
            actions, chosen, _skipped = group_choice_actions(nodes, group, alternative_pairs)
            lines.append(f"**Pack {pack_number} role action — {group_title}:**")
            lines.extend(actions)
            selected_ids.update(chosen)
    return lines, selected_ids


def package_account_matcher_only(markdown: str, pack_numbers: list[int]) -> str:
    """Remove obsolete D078 instructions so each pack has one authoritative route sequence."""
    head, separator, _tail = markdown.partition(START)
    if separator:
        markdown = head
    lines = markdown.splitlines()
    result: list[str] = []
    current_pack: int | None = None
    has_action_note = False
    for line in lines:
        heading = re.match(r"^#{2,3} Package\s+(\d+)\b", line)
        if heading:
            if current_pack in pack_numbers and not has_action_note:
                result.append(
                    f"- **D078 click path:** Use only **Pack {current_pack}** in the graph-exact inventory below for every D078 action. Follow the listed order: three already-selected compulsory foundations → select or skip the optional Society choice → method/design → its linked domain items and tools → area foundation → task-family choice → linked area items and tools → role in that area → role-task-linked items and tools → tray, save, My World, and print."
                )
            current_pack = int(heading.group(1))
            has_action_note = False
            result.append(line)
            continue
        if current_pack not in pack_numbers:
            result.append(line)
            continue
        if line.startswith("- **Student/account:**") or line.startswith("- **Student / account:**"):
            result.append(line)
            continue
        matcher_line = any(token.casefold() in line.casefold() for token in (
            "subject matcher", "o-level:", "utme:", "programme result:",
            "select in this order:", "undergraduate setup:", "start:",
        ))
        if matcher_line:
            result.append(line)
            continue
        if line.startswith("- **") or line.startswith("  - **"):
            if not has_action_note:
                result.append(
                    f"- **D078 click path:** Use only **Pack {current_pack}** in the graph-exact inventory below for every D078 action. Follow the listed order: three already-selected compulsory foundations → select or skip the optional Society choice → method/design → its linked domain items and tools → area foundation → task-family choice → linked area items and tools → role in that area → role-task-linked items and tools → tray, save, My World, and print."
                )
                has_action_note = True
            continue
        result.append(line)
    if current_pack in pack_numbers and not has_action_note:
        result.append(
            f"- **D078 click path:** Use only **Pack {current_pack}** in the graph-exact inventory below for every D078 action. Follow the listed order: three already-selected compulsory foundations → select or skip the optional Society choice → method/design → its linked domain items and tools → area foundation → task-family choice → linked area items and tools → role in that area → role-task-linked items and tools → tray, save, My World, and print."
        )
    return "\n".join(result).rstrip() + "\n"


def canonicalize_pack_actions(markdown: str, pack_numbers: list[int]) -> str:
    """Keep each student's identity/matcher setup; remove stale, conflicting D078 prose."""
    head, separator, tail = markdown.partition(START)
    if separator:
        markdown = head
    lines = markdown.splitlines()
    result: list[str] = []
    current_pack: int | None = None
    inserted_action_note = False
    for line in lines:
        heading = re.match(r"^#{2,3} Package\s+(\d+)\b", line)
        if heading:
            current_pack = int(heading.group(1))
            inserted_action_note = False
            result.append(line)
            continue
        if current_pack not in pack_numbers:
            result.append(line)
            continue
        if line.startswith("- **Student/account:**") or line.startswith("- **Student / account:**"):
            result.append(line)
            continue
        matcher_line = any(token.casefold() in line.casefold() for token in (
            "subject matcher", "o-level:", "utme:", "programme result:",
            "select in this order:", "undergraduate setup:", "start:",
        ))
        if matcher_line:
            result.append(line)
            continue
        if line.startswith("- **") or line.startswith("  - **"):
            if not inserted_action_note:
                result.extend([
                    f"- **D078 click path:** Use only **Pack {current_pack}** in the graph-exact inventory below for every D078 choice. The order is three already-selected compulsory foundations → select or skip the optional Society choice → method/design → its linked domain items and tools → area foundation → task-family choice → linked area items and tools → role in that area → role-task-linked items and tools → tray, save, My World, and print.",
                ])
                inserted_action_note = True
            continue
        result.append(line)
    return "\n".join(result).rstrip() + "\n"


def bullets(nodes: dict[str, dict], ids: list[str]) -> list[str]:
    return [f"- {label(nodes, item_id)}" for item_id in dict.fromkeys(ids)]


def requirement_bullets(nodes: dict[str, dict], ids: list[str]) -> list[str]:
    lines: list[str] = []
    for item_id in dict.fromkeys(ids):
        node = nodes.get(item_id, {})
        raw_lane = str(node.get("requirement_lane") or node.get("requirement_level") or "useful_optional")
        scope = node.get("requirement_scope") if isinstance(node.get("requirement_scope"), dict) else {}
        condition = str(scope.get("condition") or node.get("requirement_condition") or "").strip()
        lane_label = {
            "needed": "needed for this selected route",
            "required": "needed for this selected route",
            "conditional": "use only when its stated condition applies",
            "useful_optional": "useful and optional",
            "useful": "useful and optional",
            "optional": "optional",
        }.get(raw_lane, raw_lane.replace("_", " "))
        detail = f" â€” {lane_label}"
        if condition:
            detail += f"; condition: {condition}"
        lines.append(f"- {label(nodes, item_id)}{detail}")
    return lines


def reviewed_sequence_order(ids: list[str], edges: list[dict]) -> list[str]:
    """Keep source/menu order for ties while applying reviewed item edges."""
    ordered_ids = list(dict.fromkeys(ids))
    candidates = set(ordered_ids)
    rank = {item_id: index for index, item_id in enumerate(ordered_ids)}
    adjacency = {item_id: set() for item_id in ordered_ids}
    indegree = {item_id: 0 for item_id in ordered_ids}
    for edge in edges:
        if (edge.get("sequence_approved") is not True
                or edge.get("sequence_policy") not in {"conditional_prerequisite", "workflow"}
                or edge.get("source") not in candidates or edge.get("target") not in candidates):
            continue
        if edge["target"] not in adjacency[edge["source"]]:
            adjacency[edge["source"]].add(edge["target"])
            indegree[edge["target"]] += 1
    ready = [item_id for item_id in ordered_ids if indegree[item_id] == 0]
    result: list[str] = []
    while ready:
        ready.sort(key=rank.__getitem__)
        current = ready.pop(0)
        result.append(current)
        for target in adjacency[current]:
            indegree[target] -= 1
            if indegree[target] == 0:
                ready.append(target)
    if len(result) != len(ordered_ids):
        raise ValueError(f"Reviewed sequence cycle in E2E menu: {sorted(candidates - set(result))}")
    return result


def stage_lanes(nodes: dict[str, dict], stage: dict) -> list[str]:
    lane_items = stage.get("item_ids_by_requirement_lane", {})
    lines: list[str] = []
    for lane in ("needed", "useful_optional", "conditional", "useful", "tool_choice"):
        ids = lane_items.get(lane, [])
        if ids:
            title = {
                "needed": "Needed lane",
                "conditional": "Useful and conditional route choices (skippable unless the card's stated need applies)",
                "useful_optional": "Useful and conditional route choices (skippable unless the card's stated need applies)",
                "useful": "Useful lane (check the item's stated context; do not infer a prerequisite)",
                "tool_choice": "Tool choices (compare; no tool is a blocker unless the graph explicitly says so)",
            }[lane]
            lines.append(f"**{title}:**")
            lines.extend(requirement_bullets(nodes, ids))
    unknown = [lane for lane in lane_items if lane not in {
        "needed", "conditional", "useful_optional", "useful", "tool_choice"
    }]
    for lane in unknown:
        ids = lane_items[lane]
        if ids:
            lines.append(f"**Graph lane `{lane}`:**")
            lines.extend(bullets(nodes, ids))
    tools = stage.get("tool_ids", [])
    if tools:
        lines.append("**Additional tools offered on this exact route:**")
        lines.extend(bullets(nodes, tools))
    return lines


def method_contribution_lines(nodes: dict[str, dict], stage: dict) -> list[str]:
    """Render the pre-area menu as per-method groups, with shared choices listed once."""
    ordered_groups = stage.get("learning_order_groups", [])
    if ordered_groups:
        lines: list[str] = []
        for group in ordered_groups:
            source_layer = group.get("source_layer")
            method_ids = group.get("method_ids", [])
            if source_layer:
                lines.append(
                    f"**{group.get('title') or f'Domain learning layer {source_layer}'} "
                    f"(Layer {source_layer}; optional, route-linked choices):**"
                )
                method_ids_by_item = group.get("method_ids_by_item", {})
            else:
                method_labels = [label(nodes, method_id) for method_id in method_ids]
                owner_text = ", ".join(method_labels) if method_labels else "no single method attribution established"
                lines.append(f"**Method-linked choices: {owner_text}:**")
                method_ids_by_item = {}

            lane_ids = group.get("item_ids_by_requirement_lane", {})
            lane_titles = {
                "needed": "Needed for this exact route (check the stated prerequisite/condition)",
                "conditional": "Conditional; select only when its stated condition applies",
                "useful_optional": "Useful and optional",
                "useful": "Useful and optional",
                "tool_choice": "Tools to compare; none blocks progression",
            }
            lane_order = ["needed", "conditional", "useful_optional", "useful", "tool_choice"]
            lane_order.extend(lane for lane in lane_ids if lane not in lane_order)
            emitted: set[str] = set()
            for lane in lane_order:
                ids = [item_id for item_id in lane_ids.get(lane, []) if item_id not in emitted]
                if ids:
                    lines.append(f"_{lane_titles.get(lane, lane.replace('_', ' ').capitalize())}:_")
                    lines.extend(requirement_bullets(nodes, ids))
                    emitted.update(ids)
            for item_id, supporting_methods in method_ids_by_item.items():
                if supporting_methods:
                    lines.append(
                        f"- **Route context:** {label(nodes, item_id)} is linked to "
                        f"{', '.join(label(nodes, method_id) for method_id in supporting_methods)}."
                    )
            tools = group.get("tool_ids", [])
            if tools:
                lines.append("_Tools attached to this method contribution; compare and select only what you plan to use:_")
                lines.extend(bullets(nodes, tools))
            if not lane_ids and not tools:
                lines.append("- No additional learning item or tool is attached to this group on this exact route.")
            lines.append("- This group is skippable; its placement organizes the route and does not make it a prerequisite.")
        return lines

    contributions = stage.get("method_contributions", [])
    if not contributions:
        return stage_lanes(nodes, stage)

    lane_order = ("needed", "conditional", "useful_optional", "useful", "tool_choice")
    lane_titles = {
        "needed": "Needed for this route",
        "conditional": "Conditional; select only when its stated condition applies",
        "useful_optional": "Useful and optional",
        "useful": "Useful and optional",
        "tool_choice": "Tools to compare; none blocks progression",
    }
    lane_ids = stage.get("item_ids_by_requirement_lane", {})
    shared_items = set(stage.get("shared_item_ids_across_selected_methods", []))
    shared_tools = set(stage.get("shared_tool_ids_across_selected_methods", []))
    emitted: set[str] = set()
    lines: list[str] = []

    for contribution in contributions:
        method_id = contribution.get("method_id", "")
        method_label = contribution.get("method_label") or label(nodes, method_id)
        lines.append(f"**{method_label} — this method's contribution before areas:**")
        explanation = str(contribution.get("contribution") or "").strip()
        if explanation:
            lines.append(f"{explanation}")
        contribution_items = set(contribution.get("item_ids", [])) - shared_items
        contribution_items &= set().union(*(set(values) for values in lane_ids.values())) if lane_ids else set()
        for lane in lane_order:
            ids = [item_id for item_id in lane_ids.get(lane, [])
                   if item_id in contribution_items and item_id not in emitted]
            if ids:
                lines.append(f"_{lane_titles[lane]}:_")
                lines.extend(requirement_bullets(nodes, ids))
                emitted.update(ids)
        tool_ids = [item_id for item_id in contribution.get("tool_ids", [])
                    if item_id not in shared_tools and item_id not in emitted]
        if tool_ids:
            lines.append("_Method-linked tools; compare the alternatives and select only those useful to you:_")
            lines.extend(bullets(nodes, tool_ids))
            emitted.update(tool_ids)

    shared_ids = [item_id for item_id in stage.get("layer_two_three_item_ids", [])
                  if item_id in shared_items and item_id not in emitted]
    for lane in lane_order:
        shared_ids.extend(item_id for item_id in lane_ids.get(lane, [])
                          if item_id in shared_items and item_id not in emitted and item_id not in shared_ids)
    if shared_ids:
        lines.append("**Learning choices shared by more than one selected method (shown once):**")
        lines.extend(requirement_bullets(nodes, shared_ids))
        emitted.update(shared_ids)

    shared_tool_ids = [item_id for item_id in stage.get("tool_ids", [])
                        if item_id in shared_tools and item_id not in emitted]
    if shared_tool_ids:
        lines.append("**Tools shared by more than one selected method (shown once):**")
        lines.extend(bullets(nodes, shared_tool_ids))
        emitted.update(shared_tool_ids)

    remaining = [item_id for item_id in stage.get("layer_two_three_item_ids", [])
                 + stage.get("tool_ids", []) if item_id not in emitted]
    for ids in lane_ids.values():
        remaining.extend(item_id for item_id in ids if item_id not in emitted and item_id not in remaining)
    if remaining:
        lines.append("**Additional route-linked choices, not attributed to one method alone:**")
        lines.extend(requirement_bullets(nodes, remaining))
    return lines


def role_path_for(stage: dict, role_id: str) -> dict | None:
    return next((path for path in stage.get("role_paths", []) if path.get("role_id") == role_id), None)


def role_path_lines(nodes: dict[str, dict], path: dict) -> list[str]:
    lines: list[str] = []
    task_paths = path.get("role_task_paths", [])
    for task_path in task_paths:
        family_id = task_path.get("task_family_id")
        if family_id:
            lines.append(f"**Role task context: {label(nodes, family_id)}**")
        for lane, ids in task_path.get("role_item_ids_by_requirement_lane", {}).items():
            if ids:
                lines.append(f"**Role-item lane `{lane}` (choices, not invented prerequisites):**")
                lines.extend(bullets(nodes, ids))
        tools = task_path.get("role_tool_ids", [])
        if tools:
            lines.append("**Role-task tools:**")
            lines.extend(bullets(nodes, tools))
    if not task_paths:
        for lane, ids in path.get("role_item_ids_by_requirement_lane", {}).items():
            if ids:
                lines.append(f"**Role-item lane `{lane}` (choices, not invented prerequisites):**")
                lines.extend(bullets(nodes, ids))
        tools = path.get("role_tool_ids", [])
        if tools:
            lines.append("**Role tools:**")
            lines.extend(bullets(nodes, tools))
    return lines


def reviewed_edges(edges: list[dict], relationship: str, *, source: str | None = None,
                   target: str | None = None) -> list[dict]:
    return [edge for edge in edges
            if edge.get("relationship") == relationship
            and (source is None or edge.get("source") == source)
            and (target is None or edge.get("target") == target)
            and edge.get("status") == "resolved_ready_for_use"
            and edge.get("student_visible") is True]


def task_focus_lines(nodes: dict[str, dict], edges: list[dict], family_ids: list[str],
                     selected_family_ids: list[str], area_tool_ids: set[str] | None = None,
                     area_foundation_ids: set[str] | None = None) -> list[str]:
    lines: list[str] = []
    if not selected_family_ids:
        return ["No task-family focus is selected in this pack. The general route for the area remains available; this is a valid path and must not block progression."]

    lines.append("The task-family focus is selected only after the method/design and area. Select the exact focus card(s) named below; do not add unselected focus cards.")
    for family_id in selected_family_ids:
        if family_id not in family_ids:
            raise ValueError(f"Selected task family {family_id} is not offered by this exact route")
        lines.append(f"**Selected task family: {label(nodes, family_id)}**")

        domain_edges = reviewed_edges(edges, "domain_item_supports_area_task", target=family_id)
        if domain_edges:
            lines.append("**Domain learning that supports this focus (carry it forward only if already selected; never auto-add it):**")
            lines.extend(bullets(nodes, list(dict.fromkeys(edge["source"] for edge in domain_edges))))
        else:
            lines.append("No separate selected-domain-item support edge is recorded for this focus.")

        area_foundations = area_foundation_ids or set()
        item_edges = [edge for edge in reviewed_edges(edges, "task_has_area_learning_item", source=family_id)
                      if edge.get("target") not in area_foundations]
        if item_edges:
            area_item_ids = reviewed_sequence_order([edge["target"] for edge in item_edges], edges)
            by_lane = {"useful_and_conditional": area_item_ids}
            for lane, ids in by_lane.items():
                lines.append(f"**Area learning linked to this focus — {lane.replace('_', ' ')}; preserve the item's own condition and skippability:**")
                lines.extend(bullets(nodes, list(dict.fromkeys(ids))))
            # Tool choices are part of the selected area-item route when the
            # graph attaches them to one of these exact items. Do not list
            # every tool from the area as if every task family used it.
            attached_tools: dict[str, list[str]] = {}
            offered_tools = area_tool_ids or set()
            for item_id in area_item_ids:
                attached_tools[item_id] = list(dict.fromkeys(
                    edge["target"] for edge in edges
                    if edge.get("relationship") == "area_item_has_contextual_tool_option"
                    and edge.get("source") == item_id
                    and edge.get("target") in offered_tools
                    and str(edge.get("explanation") or "").strip()
                ))
            for item_id, tool_ids in attached_tools.items():
                if not tool_ids:
                    continue
                lines.append(f"**Tools attached to {label(nodes, item_id)} (optional choices for this item):**")
                lines.extend(bullets(nodes, tool_ids))
        else:
            lines.append("No reviewed area-learning item edge is recorded for this focus; do not borrow items from another focus.")

        role_task_edges = reviewed_edges(edges, "area_task_family_supports_role_task", source=family_id)
        if not role_task_edges:
            lines.append("**Role transition after this focus:** no reviewed task-family-to-role-task link is recorded. The area's route roles may still be listed, but do not claim this focus specifically prepares the learner for a role or display standalone role items/tools.")
            continue

        lines.append("**Role-task connections opened downstream by this focus (role-owned cards stay hidden until a role is opened):**")
        for relation in role_task_edges:
            task_id = relation["target"]
            role_edges = reviewed_edges(edges, "role_task_family_of_role", source=task_id)
            role_ids = list(dict.fromkeys(edge["target"] for edge in role_edges))
            role_names = ", ".join(label(nodes, role_id) for role_id in role_ids) or "no resolved role node"
            lines.append(f"- **{role_names}** — {label(nodes, task_id)}")
    return lines


def area_attached_tool_actions(nodes: dict[str, dict], edges: list[dict],
                               area_stage: dict, family_groups: dict[str, dict],
                               selected_family_ids: list[str], alternative_pairs: list[dict],
                               pack_number: int) -> tuple[list[str], set[str]]:
    """Add explicit select/skip actions for tools attached to focus-linked area items."""
    lines: list[str] = []
    selected_ids: set[str] = set()
    offered_tools = set(area_stage.get("tool_ids", []))
    for family_id in selected_family_ids:
        group = family_groups.get(family_id, {})
        item_ids = list(dict.fromkeys(
            item_id
            for values in group.get("item_ids_by_requirement_lane", {}).values()
            for item_id in values
        ))
        for item_id in item_ids:
            tool_ids = list(dict.fromkeys(
                edge["target"] for edge in edges
                if edge.get("relationship") == "area_item_has_contextual_tool_option"
                and edge.get("source") == item_id
                and edge.get("target") in offered_tools
                and str(edge.get("explanation") or "").strip()
            ))
            if not tool_ids:
                continue
            tool_group = {
                "group_id": f"area-item-tools:{item_id}",
                "title": f"Tools attached to {label(nodes, item_id)}",
                "item_ids_by_requirement_lane": {},
                "tool_ids": tool_ids,
                "sequence_edges": [],
            }
            action_lines, chosen = render_group_actions(
                nodes, tool_group, alternative_pairs, pack_number, "area item tools",
            )
            lines.append(f"**Tools for {label(nodes, item_id)} — compare and choose within this item context:**")
            lines.extend(bullets(nodes, tool_ids))
            lines.extend(action_lines)
            selected_ids.update(chosen)
    return lines, selected_ids


def sequence_edges(nodes: dict[str, dict], plan: dict) -> list[str]:
    stage_ids = {"method_linked_domain_learning", "area_learning_and_tools", "role_task_learning_and_tools"}
    edges = [edge for edge in plan.get("sequence_edges", [])
             if edge.get("source_stage") in stage_ids or edge.get("target_stage") in stage_ids]
    lines = []
    for edge in edges:
        policy = edge.get("policy", "reviewed workflow")
        source = label(nodes, edge["source"])
        target = label(nodes, edge["target"])
        condition = edge.get("condition", "")
        lines.append(f"- {source} → {target} ({policy}; {condition})")
    return lines


def alternatives(nodes: dict[str, dict], plan: dict, visible_ids: set[str]) -> list[str]:
    lines = []
    seen: set[tuple[str, str]] = set()
    for edge in plan.get("alternative_choice_pairs", []):
        source_id, target_id = edge.get("source"), edge.get("target")
        pair_key = tuple(sorted((source_id or "", target_id or "")))
        # A cross-route alternative is only actionable here when both choices
        # are already present in this exact route's visible menus. One matching
        # endpoint is not enough: that can pull in another role's tool or item.
        if (source_id in visible_ids and target_id in visible_ids and pair_key not in seen):
            seen.add(pair_key)
            lines.append(
                f"- Compare **{label(nodes, source_id)}** with **{label(nodes, target_id)}**: "
                f"{edge.get('explanation', 'The graph records these as alternatives.') }"
            )
    return lines


def main() -> None:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    nodes = {node["id"]: node for node in graph["nodes"]}
    edges = graph["edges"]
    routes = graph["selection_progression_contract"]["routes"]
    pack_specs = runpy.run_path(str(PACK_TEST_PATH))["PACKS"]
    designs = {design["id"]: design for design in graph.get("combination_designs", [])}
    generated = [START, "## Graph-exact expected menus for every student pack", "",
            "The package sections above identify the student and give the exact matcher/account setup. This generated section is the sole authority for D078 click actions; it replaces older D078 prose so no pack can send the student downstream early. The graph contract is validated for every route before this document is written. Required screen order: three already-selected compulsory domain foundations → the optional Society and the social world choice (select or skip) → method or methods → the exact named design when supported → that route's domain learning and tools → selected area and its optional foundation → task-family choice(s) → only the selected focus's area learning and attached tools → role within that area → only reviewed role-task-linked learning/tools → tray, save, My World and print. Optional choices stay optional. Within a stage, use only explicit reviewed sequence edges; otherwise choices are parallel, not alphabetically ordered or guessed.", ""]

    for number, spec in pack_specs.items():
        route = route_for(routes, spec)
        plan = route["sequence_plan"]
        stages = validate_stage_order(graph, route)
        kind, method_ids, combination_id, area_id, role_label, _extra_areas = spec
        role_id = next((node_id for node_id, node in nodes.items()
                        if node_id.startswith("role:D078:") and node.get("label", "").casefold() == role_label.casefold()), None)
        if role_id is None:
            raise ValueError(f"Unknown role in pack {number}: {role_label}")

        matching_routes = [candidate for candidate in routes
                           if candidate["route_kind"] == route["route_kind"]
                           and candidate["sequence_plan"]["method_ids"] == plan["method_ids"]
                           and candidate.get("combination_id") == combination_id]
        area_names = list(dict.fromkeys(label(nodes, candidate["area_id"]) for candidate in matching_routes))
        family_stage = stages["area_task_family_choices"]
        family_ids = family_stage.get("task_family_ids", [])
        role_stage = stages["role_task_learning_and_tools"]
        selected_role_path = role_path_for(role_stage, role_id)

        selected_for_pack: list[str] = list(stages["domain_foundations"].get("item_ids", []))
        generated.extend([f"### Pack {number}: exact screen-by-screen route and selections", "",
                          f"**Route key:** `{route['route_id']}`", "",
                          "1. **Social Sciences domain entry.** Confirm these three compulsory foundation cards are already selected:"])
        generated.extend(bullets(nodes, stages["domain_foundations"].get("item_ids", [])))
        orientation_ids = stages["society_and_social_world_orientation"].get("item_ids", [])
        generated.extend(["2. **Optional Society choice, before any method appears or is selected.** This is a separate selectable orientation between the compulsory foundations and the method grid:"])
        generated.extend(bullets(nodes, orientation_ids) or ["- No orientation item is recorded."])
        orientation_selected = number % 2 == 1 or number == 34
        if orientation_ids:
            orientation_action = "select" if orientation_selected else "skip (leave unchecked)"
            generated.append(f"**Pack {number} pre-method action:** {orientation_action} **{label(nodes, SOCIETY_ID)}**. Then verify that the methods are available either way. If selected, its tray row appears immediately; if skipped, no row appears and the next stage is still methods. It is never a fourth compulsory foundation.")
            if orientation_selected:
                selected_for_pack.append(SOCIETY_ID)
        if len(stages["domain_foundations"].get("item_ids", [])) != 3:
            raise ValueError(f"Pack {number} does not start with the three compulsory domain foundations")
        generated.extend(["",
                          "3. **Method/design choice, only after the Society select-or-skip check.** Select these exact method card(s):"])
        generated.extend(bullets(nodes, method_ids))
        selected_for_pack.extend(method_ids)
        if combination_id:
            design = designs.get(combination_id, {})
            design_label = nodes.get(combination_id, {}).get("label") or design.get("design", combination_id.replace("combo:", "").replace("-", " "))
            generated.extend([f"After those components are selected, choose **{design_label}** (`{combination_id}`). Verify this exact design replaces the individual methods' separate downstream menus; do not union other designs' content.", ""])
            selected_for_pack.append(combination_id)
        else:
            generated.extend(["This is a single-method route. The method remains usable on its own; a combined design should appear only if the learner adds a compatible method and the graph has an exact supported design for that selected set.", ""])

        domain_stage = stages["method_linked_domain_learning"]
        generated.extend(["4. **After method/design selection and before opening an area: domain learning and tools.** Only the groups and cards in this exact route menu should appear. For every group, perform the generated select/skip/compare actions immediately below its menu; no area is opened until this stage is checked."])
        generated.extend(method_contribution_lines(nodes, domain_stage) or ["- No method-linked domain item or tool choices are recorded for this route."])
        for group in domain_stage.get("learning_order_groups", []):
            action_lines, chosen = render_group_actions(nodes, group, plan.get("alternative_choice_pairs", []), number, "domain group")
            generated.extend(action_lines)
            selected_for_pack.extend(item_id for item_id in chosen if item_id not in selected_for_pack)
        generated.append("")

        generated.extend(["5. **Area choices after completing domain learning.** Expected areas on this exact method/design route:"])
        generated.extend([f"- {name}" for name in area_names] or ["- No downstream area is recorded."])
        area_start = stages["area_start"]
        selected_for_pack.append(area_id)
        area_foundation_ids = area_start.get("area_foundation_ids", [])
        generated.append(f"Open **{label(nodes, area_id)}**. Before selecting any task family, follow this pack's explicit select-or-skip action for the area's foundation; it is skippable, not a progression blocker:")
        generated.extend(bullets(nodes, area_foundation_ids) or ["- No separate area-foundation item is recorded for this route."])
        area_foundation_selected = number % 2 == 1 or number == 34
        if area_foundation_ids:
            foundation_action = "select" if area_foundation_selected else "leave unselected"
            generated.append(f"**Pack {number} area-foundation action:** {foundation_action} the listed foundation, then verify its immediate tray state before choosing a task family.")
            if area_foundation_selected:
                selected_for_pack.extend(area_foundation_ids)
        else:
            generated.append("**Area-foundation action:** none; this route begins directly with its task-family choices.")
        generated.append("")

        generated.append("6. **Task-family focus, then area learning/tools:**")
        generated.append("Select only the task-family focus or focuses named for this pack; every other focus remains unchecked. A selected focus reveals only its own reviewed area learning and tools. Selecting no focus is also valid and uses only the graph's general-area group.")
        generated.extend(bullets(nodes, family_ids) or ["- No task-family choice is recorded for this route."])
        selected_family_ids = TASK_FOCUS_SELECTIONS[number]
        selected_for_pack.extend(selected_family_ids)
        generated.extend(task_focus_lines(
            nodes, edges, family_ids, selected_family_ids,
            set(stages["area_learning_and_tools"].get("tool_ids", [])),
            set(stages["area_start"].get("area_foundation_ids", [])),
        ))
        area_stage = stages["area_learning_and_tools"]
        family_groups = {group.get("task_family_id"): group
                         for group in area_stage.get("task_family_learning_groups", [])}
        if selected_family_ids:
            for family_id in selected_family_ids:
                group = family_groups.get(family_id)
                if group is None:
                    raise ValueError(f"Pack {number} selected family {family_id} has no graph learning group")
                generated.append(f"**Exact area-stage menu for selected focus: {label(nodes, family_id)}**")
                for lane, ids in group.get("item_ids_by_requirement_lane", {}).items():
                    if ids:
                        generated.append(f"Requirement lane `{lane}` — these are the area items for this focus:")
                        generated.extend(requirement_bullets(nodes, ids))
                if group.get("tool_ids"):
                    generated.append("Tools in this selected focus group, with their item relationship shown above:")
                    generated.extend(bullets(nodes, group["tool_ids"]))
                action_lines, chosen = render_group_actions(nodes, group, plan.get("alternative_choice_pairs", []), number, "area focus")
                generated.extend(action_lines)
                selected_for_pack.extend(item_id for item_id in chosen if item_id not in selected_for_pack)
            tool_action_lines, chosen_tools = area_attached_tool_actions(
                nodes, edges, area_stage, family_groups, selected_family_ids,
                plan.get("alternative_choice_pairs", []), number,
            )
            generated.extend(tool_action_lines)
            selected_for_pack.extend(item_id for item_id in chosen_tools if item_id not in selected_for_pack)
        else:
            general_group = area_stage.get("general_area_learning_group", {})
            generated.append("**No-focus route: general area learning and tools shown when no task-family card is selected:**")
            generated.extend(stage_lanes(nodes, {
                "item_ids_by_requirement_lane": general_group.get("item_ids_by_requirement_lane", {}),
                "tool_ids": general_group.get("tool_ids", []),
            }) or ["- No general area-owned items or tools are recorded for this route."])
            action_lines, chosen = render_group_actions(nodes, general_group, plan.get("alternative_choice_pairs", []), number, "general area")
            generated.extend(action_lines)
            selected_for_pack.extend(item_id for item_id in chosen if item_id not in selected_for_pack)
        generated.append("")

        area_role_ids = route.get("role_ids", [])
        generated.append("7. **Roles available from this area route:**")
        generated.extend(bullets(nodes, area_role_ids) or ["- No role is recorded for this route."])
        generated.append(f"After the area-learning check, open **{role_label}** from this area. Role learning cards remain hidden until the role itself is open, and only an exact selected-family-to-role-task link may reveal them.")
        role_lines, selected_role_items = render_role_stage(
            nodes, selected_role_path, selected_family_ids,
            plan.get("alternative_choice_pairs", []), number, role_label,
        )
        generated.extend(role_lines)
        selected_for_pack.extend(item_id for item_id in selected_role_items if item_id not in selected_for_pack)
        selected_for_pack.append(role_id)
        generated.append("")

        for extra_area_id, extra_spec in EXTRA_AREA_FOCUS_SELECTIONS.get(number, {}).items():
            extra_route = route_for(routes, (kind, method_ids, combination_id, extra_area_id,
                                             extra_spec["role_label"], []))
            extra_stages = validate_stage_order(graph, extra_route)
            extra_family_ids = extra_stages["area_task_family_choices"].get("task_family_ids", [])
            extra_selected_families = extra_spec["task_family_ids"]
            extra_role_id = next((node_id for node_id, node in nodes.items()
                                  if node_id.startswith("role:D078:")
                                  and node.get("label", "").casefold() == extra_spec["role_label"].casefold()), None)
            if extra_role_id is None or extra_role_id not in extra_route.get("role_ids", []):
                raise ValueError(f"Extra-area role {extra_spec['role_label']} is not offered in pack {number}")
            generated.extend([f"### Additional selected area: {label(nodes, extra_area_id)}", "",
                              "Select this area in addition to the primary area above. Its choices remain scoped to the same selected method/design.",
                              "Area foundation before task-family choice:"])
            extra_foundation_ids = extra_stages["area_start"].get("area_foundation_ids", [])
            generated.extend(bullets(nodes, extra_foundation_ids)
                             or ["- No separate area-foundation item is recorded for this route."])
            if extra_foundation_ids:
                action = extra_spec.get("area_foundation_action", "leave unselected")
                generated.append(f"**Pack {number} additional-area foundation action:** {action} the listed foundation and check its immediate tray state before selecting a task family.")
                if action == "select":
                    selected_for_pack.extend(extra_foundation_ids)
            else:
                generated.append("**Additional-area foundation action:** none; proceed directly to task-family choices.")
            generated.append("Task-family choices:")
            generated.extend(bullets(nodes, extra_family_ids) or ["- No task-family choice is recorded for this route."])
            selected_for_pack.extend(extra_selected_families)
            generated.extend(task_focus_lines(
                nodes, edges, extra_family_ids, extra_selected_families,
                set(extra_stages["area_learning_and_tools"].get("tool_ids", [])),
                set(extra_stages["area_start"].get("area_foundation_ids", [])),
            ))
            extra_area_stage = extra_stages["area_learning_and_tools"]
            extra_groups = {group.get("task_family_id"): group
                            for group in extra_area_stage.get("task_family_learning_groups", [])}
            for extra_family in extra_selected_families:
                extra_group = extra_groups.get(extra_family)
                if extra_group is None:
                    raise ValueError(f"Pack {number} additional area has no learning group for {extra_family}")
                generated.append(f"Exact additional-area menu for **{label(nodes, extra_family)}**:")
                for lane, ids in extra_group.get("item_ids_by_requirement_lane", {}).items():
                    if ids:
                        generated.append(f"Requirement lane `{lane}`:")
                        generated.extend(requirement_bullets(nodes, ids))
                if extra_group.get("tool_ids"):
                    generated.append("Tools in this exact selected focus:")
                    generated.extend(bullets(nodes, extra_group["tool_ids"]))
                action_lines, chosen = render_group_actions(
                    nodes, extra_group,
                    extra_route["sequence_plan"].get("alternative_choice_pairs", []),
                    number, "additional area",
                )
                generated.extend(action_lines)
                selected_for_pack.extend(item_id for item_id in chosen if item_id not in selected_for_pack)
                tool_action_lines, chosen_tools = area_attached_tool_actions(
                    nodes, edges, extra_area_stage, extra_groups, [extra_family],
                    extra_route["sequence_plan"].get("alternative_choice_pairs", []), number,
                )
                generated.extend(tool_action_lines)
                selected_for_pack.extend(item_id for item_id in chosen_tools if item_id not in selected_for_pack)
            generated.append("Roles available in this additional area:")
            generated.extend(bullets(nodes, extra_route.get("role_ids", []))
                             or ["- No role is recorded for this route."])
            generated.append(f"Open the selected additional role **{extra_spec['role_label']}** only after this area's learning check.")
            extra_role_stage = extra_stages["role_task_learning_and_tools"]
            extra_role_path = role_path_for(extra_role_stage, extra_role_id)
            extra_role_lines, extra_role_items = render_role_stage(
                nodes, extra_role_path, extra_selected_families,
                extra_route["sequence_plan"].get("alternative_choice_pairs", []),
                number, extra_spec["role_label"],
            )
            generated.extend(extra_role_lines)
            selected_for_pack.append(extra_role_id)
            selected_for_pack.append(extra_area_id)
            selected_for_pack.extend(item_id for item_id in extra_role_items if item_id not in selected_for_pack)
            generated.append("")

        visible_ids = set(method_ids) | {role_id, area_id, *selected_for_pack}
        if combination_id:
            visible_ids.add(combination_id)
        for group in domain_stage.get("learning_order_groups", []):
            visible_ids.update(item_id for values in group.get("item_ids_by_requirement_lane", {}).values() for item_id in values)
            visible_ids.update(group.get("tool_ids", []))
        if selected_family_ids:
            for family_id in selected_family_ids:
                group = family_groups.get(family_id, {})
                visible_ids.add(family_id)
                visible_ids.update(item_id for values in group.get("item_ids_by_requirement_lane", {}).values() for item_id in values)
                visible_ids.update(group.get("tool_ids", []))
        else:
            general_group = area_stage.get("general_area_learning_group", {})
            visible_ids.update(item_id for values in general_group.get("item_ids_by_requirement_lane", {}).values() for item_id in values)
            visible_ids.update(general_group.get("tool_ids", []))
        if selected_role_path and selected_family_ids:
            for task_path in selected_role_path.get("role_task_paths", []):
                if task_path.get("task_family_id") not in selected_family_ids:
                    continue
                groups = task_path.get("learning_order_groups", [])
                if groups:
                    for group in groups:
                        visible_ids.update(
                            item_id
                            for values in group.get("item_ids_by_requirement_lane", {}).values()
                            for item_id in values
                        )
                        visible_ids.update(group.get("tool_ids", []))
                else:
                    for values in task_path.get("role_item_ids_by_requirement_lane", {}).values():
                        visible_ids.update(values)
                    visible_ids.update(task_path.get("role_tool_ids", []))
        comparison_plans = [plan]
        for extra_area_id, _extra_spec in EXTRA_AREA_FOCUS_SELECTIONS.get(number, {}).items():
            extra_route = route_for(routes, (kind, method_ids, combination_id, extra_area_id,
                                             _extra_spec["role_label"], []))
            comparison_plans.append(extra_route["sequence_plan"])
            extra_stages = validate_stage_order(graph, extra_route)
            extra_group_map = {group.get("task_family_id"): group for group in extra_stages["area_learning_and_tools"].get("task_family_learning_groups", [])}
            for family_id in _extra_spec["task_family_ids"]:
                group = extra_group_map.get(family_id, {})
                visible_ids.add(family_id)
                visible_ids.update(item_id for values in group.get("item_ids_by_requirement_lane", {}).values() for item_id in values)
                visible_ids.update(group.get("tool_ids", []))
        base_visible_ids = set(visible_ids)
        all_comparison_pairs = [edge for candidate_plan in comparison_plans
                                for edge in candidate_plan.get("alternative_choice_pairs", [])]
        comparison_plan = {"alternative_choice_pairs": all_comparison_pairs}
        comparison_lines = alternatives(nodes, comparison_plan, base_visible_ids)
        generated.append("8. **Alternatives and order checks:**")
        if comparison_lines:
            generated.extend(comparison_lines)
        else:
            generated.append("- No typed, source-reviewed alternative pair is attached to these exact route choices; do not invent one from similar names.")
        ordered = sequence_edges(nodes, plan)
        if ordered:
            generated.append("- Follow these reviewed route order relationships:")
            generated.extend(ordered)
        else:
            generated.append("- No reviewed relative-order edge is recorded among these route choices. They remain parallel/skippable; do not impose an alphabetical or guessed order.")
        generated.extend(["- Deselecting any optional item/tool removes it from the route and saved selection; it must not block the next stage. Returning to an earlier stage must preserve other still-selected choices.", ""])
        selected_for_pack = list(dict.fromkeys(selected_for_pack))
        generated.append("9. **Exact final tray state for this pack (plus the package's Sociology programme and named institution):**")
        generated.extend(bullets(nodes, selected_for_pack)
                         or ["- No optional learning item is selected in this pack; the programme/domain/method/area/role context remains selected as specified above."])
        generated.extend(["Only these selected learning rows, the three compulsory foundations, the selected method/design, the chosen area(s), and the chosen role(s) belong in this pack's final route. Skipped items, tools and alternatives are absent. Save this exact state before leaving the route.", ""])
        generated.extend([
            "10. **Save, My World, and print/download.** Save the route, open My World, restore this exact selection, and print/download. Confirm the report identifies this package's student name and username, attached institution, exact Sociology programme, Social Sciences, selected method(s)/design, area(s), task focus(es), role(s), and only the rows listed in this pack's final tray state. Skipped choices and unselected alternatives must not appear. Sociology alone is not proof of institution affiliation; if the export reports a missing institution, stop and record the profile attachment issue instead of substituting another university.",
            "",
        ])

    generated.extend([END, ""])
    existing = MATRIX_PATH.read_text(encoding="utf-8")
    if START in existing and END in existing:
        before = existing.split(START, 1)[0].rstrip()
        after = existing.split(END, 1)[1].lstrip()
        before = package_account_matcher_only(before, list(pack_specs))
        updated = before.rstrip() + "\n\n" + "\n".join(generated) + after
    else:
        existing = package_account_matcher_only(existing, list(pack_specs))
        updated = existing.rstrip() + "\n\n" + "\n".join(generated)
    MATRIX_PATH.write_text(updated, encoding="utf-8")
    print(f"updated {MATRIX_PATH.relative_to(ROOT)} with {len(pack_specs)} graph-derived pack inventories")


if __name__ == "__main__":
    main()
