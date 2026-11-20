"""Check the Sociology manual test packs against canonical D078 route records.

This is a structural consistency check, not browser or live-database proof.
It verifies each package's named area and role are connected by at least one
method or named-design route explicitly selected in that package.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "src/data/d078MethodAwareUiData.json"
MATRIX_PATH = ROOT / "docs/manual-review/SOCIOLOGY_END_TO_END_MANUAL_TEST_MATRIX_2026_10_26.md"
PACKAGE_RE = re.compile(r"^#{2,3} Package (\d{2}) — (.+)$", re.MULTILINE)
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
LABEL_ALLOWLIST = {
    "Student / account:", "Student/account:", "Start:", "Select:", "Select in this order:",
    "Expected next screens:", "D078 choices:", "Role:", "Tray / My World:", "Expected sequence after design selection:",
    "Domain-item stage before area selection:", "Expected combination:", "Expected area stage:",
    "Continue downstream:", "Route:", "Matcher selections:", "Click sequence and expected screens:",
    "Method and design selection:", "Student:", "Undergraduate:", "O-level:", "UTME:",
}


def heading_allowlisted(label: str) -> bool:
    return label.strip().casefold() in {item.casefold() for item in LABEL_ALLOWLIST}


def main() -> int:
    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    matrix = MATRIX_PATH.read_text(encoding="utf-8")
    if "--matcher-catalog" in sys.argv:
        source_path = ROOT / "data/career-mapping/jamb/social_management_offerings.json"
        source = json.loads(source_path.read_text(encoding="utf-8-sig"))
        programmes = source.get("programmes", []) if isinstance(source, dict) else []
        sociology = [row for row in programmes if "sociology" in json.dumps(row, ensure_ascii=False).casefold()]
        print(json.dumps({"source_path": str(source_path.relative_to(ROOT)),
                          "root_type": type(source).__name__,
                          "root_keys": list(source)[:30] if isinstance(source, dict) else None,
                          "programme_count": len(programmes),
                          "sociology_rows": [{"jamb_name": row.get("jamb_name"),
                                              "institutions": row.get("institutions", []),
                                              "utme_subjects": row.get("utme_subjects"),
                                              "olevel_requirement": row.get("olevel_requirement")}
                                             for row in sociology]},
                         ensure_ascii=False, indent=2))
        return 0
    nodes = graph["nodes_by_id"]
    areas = {str(node["label"]).casefold(): str(node["area_id"])
             for node in nodes.values() if node.get("kind") == "area_of_specialization"}
    roles = {str(node["label"]).casefold(): str(node["id"])
             for node in nodes.values() if node.get("kind") == "role"}
    methods = {str(nodes[item_id].get("label", "")).casefold(): str(item_id)
               for item_id in graph.get("method_node_ids", []) if item_id in nodes}
    graph_labels = {str(node.get("label", "")).strip().casefold() for node in nodes.values()}
    graph_labels.update(str(route.get("name", "")).strip().casefold() for route in graph.get("role_tool_routes", []))
    graph_labels.update(str(route.get("name", "")).strip().casefold() for method in graph.get("method_area_routes", []) for route in method.get("tool_routes", []))
    label_to_ids: dict[str, set[str]] = {}
    for node_id, node in nodes.items():
        label = str(node.get("label", "")).strip().casefold()
        if label:
            label_to_ids.setdefault(label, set()).add(str(node_id))
    tool_ids_by_label: dict[str, set[str]] = {}
    for route in graph.get("role_tool_routes", []):
        tool_ids_by_label.setdefault(str(route.get("name", "")).strip().casefold(), set()).add(str(route.get("tool_node_id", "")))
    for method_route in graph.get("method_area_routes", []):
        for route in method_route.get("tool_routes", []):
            tool_ids_by_label.setdefault(str(route.get("name", "")).strip().casefold(), set()).add(str(route.get("tool_node_id", "")))
    designs = graph.get("combination_designs", [])
    if "--catalog" in sys.argv:
        print(json.dumps({
            "methods": [{"id": item_id, "label": nodes[item_id].get("label")}
                        for item_id in graph.get("method_node_ids", []) if item_id in nodes],
            "designs": [{"id": item.get("id"), "design": item.get("design"),
                         "label": nodes.get(str(item.get("id")), {}).get("label"),
                         "required_method_ids": item.get("required_method_ids", []),
                         "areas": [route.get("area_id") for route in item.get("area_routes", [])]}
                        for item in designs],
        }, ensure_ascii=False, indent=2))
        return 0
    package_matches = list(PACKAGE_RE.finditer(matrix))
    errors: list[str] = []
    label_errors: list[str] = []
    checked = 0

    for index, match in enumerate(package_matches):
        package_no, title = match.groups()
        end = package_matches[index + 1].start() if index + 1 < len(package_matches) else len(matrix)
        body = matrix[match.end():end]
        checked += 1

        def selected_token(line: str, label: str) -> bool:
            for token in BOLD_RE.finditer(line):
                if token.group(1).casefold() != label.casefold():
                    continue
                preceding = line[:token.start()]
                directives = list(re.finditer(r"\b(select|choose|add|tap|inspect|compare|leave|skip|open|review)\b", preceding, re.IGNORECASE))
                return bool(directives and directives[-1].group(1).casefold() in {"select", "choose", "add", "tap", "open"})
            return False

        selected_area_ids: set[str] = set()
        route_body = body.split("As a separate visibility check", 1)[0]
        for line in route_body.splitlines():
            opened = re.search(r"\bopen\s+(?:the\s+area(?:\s+card)?\s+for\s+)?\*\*([^*]+)\*\*", line, re.IGNORECASE)
            selected_area = next((label for label in areas if selected_token(line, label)), None)
            area_label = opened.group(1).casefold() if opened else selected_area
            if area_label and area_label in areas:
                selected_area_ids.add(areas[area_label])

        role_ids: set[str] = set()
        role_area_pairs: set[tuple[str, str]] = set()
        for line in body.splitlines():
            if not re.search(r"\*\*Role:\*\*", line, re.IGNORECASE):
                continue
            role_area_ids: set[str] = set()
            for bold in BOLD_RE.findall(line):
                role_id = roles.get(bold.casefold())
                if role_id:
                    role_ids.add(role_id)
                    for area_label, area_id in areas.items():
                        if area_label in line.casefold():
                            role_area_ids.add(area_id)
                    if not role_area_ids and len(selected_area_ids) == 1:
                        role_area_ids.update(selected_area_ids)
                    role_area_pairs.update((role_id, area_id) for area_id in role_area_ids)

        # Only exact graph method names in an explicit selection command count;
        # a method merely discussed as an alternative does not validate a route.
        selected_methods: set[str] = set()
        method_section = re.split(
            r"\b(?:then\s+)?open\s+(?:(?:the\s+)?area(?:\s+card)?(?:\s+for)?\s+)?\*\*",
            body.split("**Role:**", 1)[0],
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]
        for line in method_section.splitlines():
            for method_label, method_id in methods.items():
                if selected_token(line, method_label):
                    selected_methods.add(method_id)

        selected_designs = []
        for design in designs:
            design_id = str(design.get("id", ""))
            design_label = str(nodes.get(design_id, {}).get("label", ""))
            explicit_design_selection = any(selected_token(line, design_label) for line in body.splitlines())
            if explicit_design_selection:
                selected_designs.append(design)

        route_tuples: set[tuple[str, str, str]] = set()
        for route in graph.get("method_area_role_routes", []):
            route_tuples.add((str(route.get("method_id")), str(route.get("area_id")), str(route.get("role_id"))))
        if selected_designs:
            supported: set[tuple[str, str]] = set()
            for design in selected_designs:
                variants = design.get("component_route_variants", [])
                if variants:
                    selected_components = selected_methods - set(map(str, design.get("required_method_ids", [])))
                    matching_variants = [variant for variant in variants
                                         if set(map(str, variant.get("selected_component_method_ids", []))) == selected_components]
                    for variant in matching_variants:
                        for route in variant.get("area_routes", []):
                            supported.update((str(route.get("area_id")), str(role_id)) for role_id in route.get("role_ids", []))
                else:
                    for route in design.get("area_routes", []):
                        supported.update((str(route.get("area_id")), str(role_id)) for role_id in route.get("role_ids", []))
        else:
            supported = {(area_id, role_id) for method_id, area_id, role_id in route_tuples if method_id in selected_methods}

        for area_id in selected_area_ids:
            for role_id, role_area_id in role_area_pairs:
                if area_id != role_area_id:
                    continue
                if (area_id, role_id) not in supported:
                    errors.append(
                        f"Package {package_no} ({title}): selected area/role pair is not supported by the explicitly selected method/design: "
                        f"{area_id} -> {role_id}; detected methods={sorted(selected_methods)}, designs={[d.get('id') for d in selected_designs]}"
                    )

        # Verify that named domain, area and role items/tools in the package
        # exist in the appropriate route stage. This is still a local graph
        # consistency check, not browser or database proof.
        lines = route_body.splitlines()
        area_open_index = next((line_index for line_index, line in enumerate(lines)
                                if any(re.search(r"\bopen\s+(?:(?:the\s+)?area(?:\s+card)?(?:\s+for)?\s+)?\*\*" + re.escape(label) + r"\*\*", line, re.IGNORECASE)
                                       for label in areas if areas[label] in selected_area_ids)), len(lines))
        role_line_index = next((line_index for line_index, line in enumerate(lines)
                                if re.search(r"\*\*Role:\*\*", line, re.IGNORECASE)), len(lines))

        def action_labels(stage_lines: list[str]) -> set[str]:
            labels: set[str] = set()
            for line in stage_lines:
                for bold in BOLD_RE.finditer(line):
                    token = bold.group(1).strip()
                    if selected_token(line, token):
                        labels.add(token.casefold())
            return labels

        method_labels = {str(nodes.get(item_id, {}).get("label", "")).strip().casefold() for item_id in selected_methods}
        design_labels = {str(nodes.get(str(item.get("id")), {}).get("label", "")).strip().casefold() for item in selected_designs}
        area_labels = {label for label, area_id in areas.items() if area_id in selected_area_ids}
        role_labels = {label for label, role_id in roles.items() if role_id in role_ids}
        domain_labels = action_labels(lines[:area_open_index]) - method_labels - design_labels - area_labels
        area_labels_selected = action_labels(lines[area_open_index:role_line_index]) - method_labels - design_labels - area_labels - role_labels
        role_labels_selected = action_labels(lines[role_line_index:]) - method_labels - design_labels - area_labels - role_labels

        selected_combo = selected_designs[0] if selected_designs else None
        route_method_ids = selected_methods
        method_area_rows = [row for row in graph.get("method_area_routes", [])
                            if str(row.get("area_id")) in selected_area_ids and str(row.get("method_id")) in route_method_ids]
        combo_area_rows = []
        combo_role_rows = []
        if selected_combo:
            combo_id = str(selected_combo.get("id"))
            design_row = next((row for row in designs if str(row.get("id")) == combo_id), {})
            component_ids = selected_methods - set(map(str, design_row.get("required_method_ids", [])))
            variants = design_row.get("component_route_variants", [])
            if variants:
                variants = [variant for variant in variants
                            if set(map(str, variant.get("selected_component_method_ids", []))) == component_ids]
                combo_area_rows = [route for variant in variants for route in variant.get("area_routes", [])
                                   if str(route.get("area_id")) in selected_area_ids]
                combo_role_rows = [route for variant in variants for route in variant.get("area_role_routes", [])
                                   if str(route.get("area_id")) in selected_area_ids]
            else:
                combo_area_rows = [row for row in design_row.get("area_routes", []) if str(row.get("area_id")) in selected_area_ids]
            combo_id_rows = [row for row in graph.get("combination_area_routes", [])
                             if str(row.get("combination_id")) == combo_id and str(row.get("area_id")) in selected_area_ids]
            combo_area_rows.extend(combo_id_rows)
            combo_role_rows.extend(row for row in graph.get("combination_area_role_routes", [])
                                   if str(row.get("combination_id")) == combo_id and str(row.get("area_id")) in selected_area_ids)

        domain_eligible = set(map(str, graph.get("foundation_item_ids", [])))
        for layer in graph.get("domain_learning_layers", []):
            applicability = layer.get("route_applicability_by_item", {})
            for item_id in layer.get("item_ids", []):
                applies_to = set(map(str, applicability.get(item_id, []))) if isinstance(applicability, dict) else set()
                if not applies_to or applies_to.intersection(selected_methods):
                    domain_eligible.add(str(item_id))
        for row in method_area_rows + combo_area_rows:
            for key in ("domain_downstream_item_ids", "domain_tool_ids", "task_linked_domain_item_ids"):
                domain_eligible.update(map(str, row.get(key, [])))
        area_eligible: set[str] = set()
        for row in method_area_rows + combo_area_rows:
            for key in ("area_item_ids", "available_item_ids", "tool_ids"):
                area_eligible.update(map(str, row.get(key, [])))
        role_eligible: set[str] = set()
        for row in graph.get("method_area_role_routes", []):
            if str(row.get("area_id")) in selected_area_ids and str(row.get("role_id")) in role_ids and str(row.get("method_id")) in route_method_ids:
                role_eligible.update(map(str, row.get("role_item_ids", [])))
                role_eligible.update(map(str, row.get("method_specific_role_item_ids", [])))
        for row in combo_role_rows:
            if str(row.get("role_id")) in role_ids:
                for key in ("role_item_ids", "method_specific_role_item_ids", "tool_ids"):
                    role_eligible.update(map(str, row.get(key, [])))
        for row in graph.get("combination_area_role_routes", []):
            if selected_combo and str(row.get("combination_id")) == str(selected_combo.get("id")) and str(row.get("area_id")) in selected_area_ids and str(row.get("role_id")) in role_ids:
                for key in ("role_item_ids", "method_specific_role_item_ids", "tool_ids"):
                    role_eligible.update(map(str, row.get(key, [])))
        for row in graph.get("role_tool_routes", []):
            if str(row.get("role_id")) in role_ids and set(map(str, row.get("area_ids", []))).intersection(selected_area_ids):
                role_eligible.add(str(row.get("tool_node_id", "")))

        def check_stage_items(stage: str, labels: set[str], eligible: set[str]) -> None:
            for label in labels:
                if label in graph_labels:
                    candidate_ids = label_to_ids.get(label, set()) | tool_ids_by_label.get(label, set())
                    if candidate_ids and not candidate_ids.intersection(eligible):
                        errors.append(f"Package {package_no} ({title}): selected {stage} item/tool '{label}' is not available on this graph route.")

        check_stage_items("domain", domain_labels, domain_eligible)
        check_stage_items("area", area_labels_selected, area_eligible)
        check_stage_items("role", role_labels_selected, role_eligible)

        if not selected_area_ids:
            errors.append(f"Package {package_no} ({title}): no canonical area selected in an explicit open/select/choose action.")
        if not role_ids:
            errors.append(f"Package {package_no} ({title}): no canonical role detected on its **Role:** line.")
        if not selected_methods and not selected_designs:
            errors.append(f"Package {package_no} ({title}): no graph method or named design detected in an explicit selection.")
        if len(selected_methods) > 1 and not selected_designs:
            errors.append(f"Package {package_no} ({title}): multiple methods are selected but no exact named design is explicitly chosen.")
        for design in selected_designs:
            required = set(map(str, design.get("required_method_ids", [])))
            if not required.issubset(selected_methods):
                errors.append(f"Package {package_no} ({title}): design {design.get('id')} is selected without all of its required methods; missing={sorted(required - selected_methods)}.")
        if "--show-routes" in sys.argv:
            print(f"Package {package_no}: methods={[nodes.get(item_id, {}).get('label', item_id) for item_id in sorted(selected_methods)]}; "
                  f"designs={[nodes.get(str(item.get('id')), {}).get('label', item.get('id')) for item in selected_designs]}; "
                  f"areas={sorted(selected_area_ids)}; role-area-pairs={sorted(role_area_pairs)}")
        if "--labels" in sys.argv:
            for line in body.splitlines():
                if not re.search(r"\b(select|choose|add|inspect|compare|leave|skip)\b", line, re.IGNORECASE):
                    continue
                for token in BOLD_RE.finditer(line):
                    label = token.group(1).strip()
                    if label.casefold() in graph_labels or heading_allowlisted(label):
                        continue
                    if re.search(r"\b(programme|university|account|student|UTME|SS\d|Sociology result)\b", label, re.IGNORECASE):
                        continue
                    before = line[:token.start()]
                    directives = list(re.finditer(r"\b(select|choose|add|tap|inspect|compare|leave|skip|open|review)\b", before, re.IGNORECASE))
                    if directives and directives[-1].group(1).casefold() in {"select", "choose", "add", "inspect", "compare", "leave", "skip"}:
                        label_errors.append(f"Package {package_no}: action label is not an exact current graph/tool label: {label}")

    result = {"packages_checked": checked, "graph_source": str(GRAPH_PATH.relative_to(ROOT)),
              "graph_version": graph.get("source_schema_version"), "errors": errors,
              "label_errors": label_errors, "passed": not errors and not label_errors, "not_a_browser_or_live_database_test": True}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
