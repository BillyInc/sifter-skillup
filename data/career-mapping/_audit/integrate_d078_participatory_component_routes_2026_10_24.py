"""Materialize the evidence-backed route intersections for the D078 PAR frame.

The four evidence methods are selectable components, not a fixed named mixed-
methods design. This builder records every non-empty component selection and
the exact shared area/role routes already supported by the canonical method
route tables and the D078 participatory area/task crosswalk.
"""
from __future__ import annotations

import itertools
import gzip
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
CROSSWALK_PATH = ROOT / "data/career-mapping/_audit/D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json"
COMBO_ID = "combo:participatory-method-choice"
NODE_PREFIX = "participatory-component-route:"
SOURCE_IDS = [
    "src:participatory-route-area-evidence",
    "src:par-methods-nature-2023",
    "src:unisa-community-engaged-research-2016",
    "src:cdc-field-epi-qualitative-2024",
    "src:cdc-evaluation-method-selection-2024",
]

SOURCE_REGISTRY = {
    "src:par-methods-nature-2023": {
        "title": "Participatory Action Research",
        "url": "https://www.nature.com/articles/s43586-023-00214-1",
        "supports": "Participatory action research shares leadership with people experiencing an issue and uses collaborative inquiry, evidence generation, analysis and action.",
        "locator": "Primer abstract and sections describing PAR project design building blocks",
        "accessed": "2026-10-24",
        "limits": "Supports the participatory framework and its design logic; does not establish that every component-method set is suitable for every question or area.",
    },
    "src:unisa-community-engaged-research-2016": {
        "title": "Policy on Research Ethics: Guidelines for Community-Engaged Research",
        "url": "https://www.unisa.ac.za/static/corporate_web/Content/Research%20%26%20innovation/Research%20ethics/Documents/Policy%20on%20Research%20Ethics_.pdf",
        "supports": "Treats participatory action research as an orientation to research rather than a data-collection technique; states that community-engaged work may use quantitative, qualitative or combined data-gathering methods shaped by context.",
        "locator": "Part 4, sections 1.2-1.4",
        "accessed": "2026-10-24",
        "limits": "Institutional ethics policy; supports the distinction between participatory orientation and evidence methods, not D078-specific area or role assignments.",
    },
    "src:cdc-field-epi-qualitative-2024": {
        "title": "Collecting and Analyzing Qualitative Data",
        "url": "https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html",
        "supports": "Describes interviews, focus-group discussions and observation as qualitative evidence methods, their uses and limitations.",
        "locator": "Chapter sections on interviews, focus groups, observation and recruitment",
        "accessed": "2026-10-24",
        "limits": "Field-epidemiology guidance; supports method identity and use, not a universal D078 area or role assignment.",
    },
    "src:cdc-evaluation-method-selection-2024": {
        "title": "Step 4 – Gather Credible Evidence",
        "url": "https://www.cdc.gov/evaluation/php/evaluation-framework-action-guide/step-4-gather-credible-evidence.html",
        "supports": "Describes surveys, interviews, observation, focus groups and purposeful integration of qualitative and quantitative evidence, with selection based on the evaluation question and community context.",
        "locator": "Common Data Collection Methods and mixed-methods guidance",
        "accessed": "2026-10-24",
        "limits": "Evaluation guidance; supports method-selection logic, not a claim that every combination is required or interchangeable.",
    },
}

COMPONENT_CONTRIBUTIONS = {
    "domain-item:participatory-and-action-research":
        "Sets the governance frame: affected people have a meaningful say in shaping the question, roles, interpretation or action.",
    "domain-item:d078-interviews":
        "Collects individual accounts and interpretations that can explain experience, meaning or process.",
    "domain-item:focus-groups-and-workshops":
        "Uses guided group discussion to examine shared views, differences and interaction; group dynamics shape what can be said.",
    "domain-item:d078-survey-method":
        "Collects standardised responses to describe patterns in a defined group; sampling and question quality limit what the results represent.",
    "domain-item:d078-observation-ethnography":
        "Records actions, interactions or settings in context; access, observer position and selectivity shape what can be claimed.",
}


def stable_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.rsplit(":", 1)[-1].lower()).strip("-")


def load(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    with gzip.open(path.with_suffix(path.suffix + ".gz"), "rt", encoding="utf-8") as source:
        return json.load(source)


def main() -> None:
    graph = load(GRAPH_PATH)
    crosswalk = load(CROSSWALK_PATH)
    combo = next((row for row in graph["combination_designs"] if row.get("id") == COMBO_ID), None)
    if not combo or combo.get("combination_mode") != "design_frame_with_selectable_methods":
        raise SystemExit("The participatory design frame is absent or has changed mode.")

    required = combo.get("required_method_ids", [])
    components = combo.get("selectable_component_method_ids", [])
    if len(required) != 1 or len(components) != 4:
        raise SystemExit("Expected one required participatory frame and four selectable evidence methods.")

    method_routes = graph.get("method_area_routes", [])
    role_routes = graph.get("method_area_role_routes", [])
    method_route_by_id = {row["route_node_id"]: row for row in method_routes if row.get("route_node_id")}
    role_route_by_id = {row["route_node_id"]: row for row in role_routes if row.get("route_node_id")}
    method_area = {
        method_id: {row["area_id"]: row for row in method_routes if row.get("method_id") == method_id}
        for method_id in [*required, *components]
    }
    if any(not method_area[method_id] for method_id in method_area):
        raise SystemExit("At least one participatory/component method lacks method-to-area evidence.")

    participation_record = next(
        (row for row in crosswalk.get("records", []) if row.get("domain_item_id") == "participatory_and_action_research"),
        None,
    )
    if not participation_record:
        raise SystemExit("The participatory/action research source crosswalk record is missing.")
    crosswalk_areas = {row.get("area_id") for row in participation_record.get("area_routes", [])}
    if crosswalk_areas != set(method_area[required[0]]):
        raise SystemExit("The participatory method routes do not exactly match the reviewed area/task crosswalk.")

    nodes = graph["nodes"]
    nodes[:] = [node for node in nodes if not str(node.get("id", "")).startswith(NODE_PREFIX)]
    edges = graph["edges"]
    edges[:] = [edge for edge in edges if not str(edge.get("id", "")).startswith(NODE_PREFIX)]
    node_map = {node["id"]: node for node in nodes}
    area_nodes_by_id = {
        node.get("area_id"): node for node in nodes
        if node.get("kind") == "area_of_specialization" and node.get("area_id")
    }
    role_by_method_area = {
        (method_id, area_id): {
            row["role_id"]: row for row in role_routes
            if row.get("method_id") == method_id and row.get("area_id") == area_id
        }
        for method_id in [*required, *components]
        for area_id in method_area[method_id]
    }

    def add_node(node: dict) -> None:
        nodes.append(node)
        node_map[node["id"]] = node

    def add_edge(source: str, target: str, relation: str, **metadata: object) -> None:
        edge_id = f"{NODE_PREFIX}{stable_slug(source)}->{stable_slug(target)}:{relation}"
        metadata.setdefault("source_ids", SOURCE_IDS)
        edges.append({"id": edge_id, "source": source, "target": target, "relationship": relation, **metadata})

    variants = []
    for size in range(1, len(components) + 1):
        for selected in itertools.combinations(components, size):
            active = [*required, *selected]
            common_areas = sorted(set.intersection(*(set(method_area[mid]) for mid in active)))
            variant_id = f"{NODE_PREFIX}{'-'.join(stable_slug(mid) for mid in selected)}"
            variant = {
                "id": variant_id,
                "selected_component_method_ids": list(selected),
                "active_method_ids": active,
                "route_basis": "intersection_of_reviewed_method_area_and_method_role_routes",
                "source_ids": SOURCE_IDS,
                "source_route_ids": [],
                "area_routes": [],
            }
            variant_node = {
                "id": variant_id,
                "kind": "combination_component_route_variant",
                "label": "Participatory frame with " + " + ".join(node_map[mid]["label"] for mid in selected),
                "combination_id": COMBO_ID,
                "selected_component_method_ids": list(selected),
                "active_method_ids": active,
                "route_basis": variant["route_basis"],
                "source_refs": SOURCE_IDS,
                "source_route_ids": [],
                "student_visible": False,
                "student_explanation": "This is a learner-selected evidence-method set inside the participatory frame. It is not a universal design recommendation. Only common, source-backed area and role routes are available.",
            }
            add_node(variant_node)
            add_edge(COMBO_ID, variant_id, "selects_participatory_component_set",
                     selected_component_method_ids=list(selected), source_ids=SOURCE_IDS)

            for area_id in common_areas:
                area_catalog_node = area_nodes_by_id.get(area_id)
                if not area_catalog_node:
                    raise SystemExit(f"Reviewed route refers to missing canonical area node: {area_id}")
                area_route_id = f"{variant_id}:area:{stable_slug(area_id)}"
                method_contributions = []
                for method_id in active:
                    route = method_area[method_id][area_id]
                    variant["source_route_ids"].append(route["route_node_id"])
                    method_contributions.append({
                        "method_id": method_id,
                        "contribution": COMPONENT_CONTRIBUTIONS[method_id],
                        "method_area_route_id": route["route_node_id"],
                        "task_family_ids": route.get("task_family_ids", []),
                        "area_item_ids": route.get("area_item_ids", []),
                        "explanatory_item_ids": route.get("explanatory_item_ids", []),
                        "task_linked_domain_item_ids": route.get("task_linked_domain_item_ids", []),
                        "available_item_ids": route.get("available_item_ids", []),
                        "tool_ids": route.get("tool_ids", []),
                        "domain_downstream_item_ids": route.get("domain_downstream_item_ids", []),
                        "domain_tool_ids": route.get("domain_tool_ids", []),
                    })
                common_roles = sorted(set.intersection(*(
                    set(role_by_method_area[(method_id, area_id)]) for method_id in active
                )))
                area_route = {
                    "id": area_route_id,
                    "area_id": area_id,
                    "method_route_ids": [row["method_area_route_id"] for row in method_contributions],
                    "method_contributions": method_contributions,
                    "role_route_ids": [],
                    "role_ids": common_roles,
                    "route_basis": variant["route_basis"],
                    "source_ids": SOURCE_IDS,
                }
                area_node = {
                    "id": area_route_id,
                    "kind": "combination_component_area_route",
                    "label": f"{variant_node['label']} -> {area_catalog_node.get('label', area_id)}",
                    "combination_id": COMBO_ID,
                    "variant_id": variant_id,
                    "area_id": area_id,
                    "method_ids": active,
                    "method_route_ids": area_route["method_route_ids"],
                    "method_contributions": method_contributions,
                    "role_ids": common_roles,
                    "route_basis": variant["route_basis"],
                    "source_refs": SOURCE_IDS,
                    "student_visible": False,
                    "student_explanation": "This area remains in the route because every selected method, including the participatory frame, has a reviewed area/task route here. Each method’s items and tools stay attributed to that method.",
                }
                add_node(area_node)
                add_edge(variant_id, area_route_id, "projects_common_area_route",
                         area_id=area_id, method_route_ids=area_route["method_route_ids"], source_ids=SOURCE_IDS)
                add_edge(area_route_id, area_catalog_node["id"], "recommends_area",
                         route_basis=variant["route_basis"], blocks_other_areas=False)

                for role_id in common_roles:
                    matching_role_routes = [role_by_method_area[(method_id, area_id)][role_id] for method_id in active]
                    role_route_id = f"{area_route_id}:role:{stable_slug(role_id)}"
                    role_contributions = [{
                        "method_id": method_id,
                        "method_role_route_id": role_row["route_node_id"],
                        "role_item_ids": role_row.get("role_item_ids", []),
                        "method_specific_role_item_ids": role_row.get("method_specific_role_item_ids", []),
                    } for method_id, role_row in zip(active, matching_role_routes)]
                    variant["source_route_ids"].extend(row["method_role_route_id"] for row in role_contributions)
                    role_contributions_by_id = {role_id: role_contributions}
                    role_node = {
                        "id": role_route_id,
                        "kind": "combination_component_role_route",
                        "label": f"{area_node['label']} -> {node_map.get(role_id, {}).get('label', role_id)}",
                        "combination_id": COMBO_ID,
                        "variant_id": variant_id,
                        "area_id": area_id,
                        "role_id": role_id,
                        "method_ids": active,
                        "method_role_route_ids": [row["method_role_route_id"] for row in role_contributions],
                        "method_contributions": role_contributions,
                        "role_contributions_by_id": role_contributions_by_id,
                        "route_basis": variant["route_basis"],
                        "source_refs": SOURCE_IDS,
                        "student_visible": False,
                        "student_explanation": "This role remains available because each selected method has a reviewed route to the role through this area. The methods are learning approaches, not a claim that the employer requires every method.",
                    }
                    add_node(role_node)
                    add_edge(area_route_id, role_route_id, "offers_role_after_area_choice",
                             role_id=role_id, method_role_route_ids=role_node["method_role_route_ids"])
                    add_edge(role_route_id, role_id, "selects_role_through_area",
                             area_id=area_id, method_specific_role_fit_claim=False)
                    area_route["role_route_ids"].append(role_route_id)
                    area_route.setdefault("role_contributions_by_id", {})[role_id] = role_contributions
                variant["area_routes"].append(area_route)
            variants.append(variant)
            variant["source_route_ids"] = list(dict.fromkeys(variant["source_route_ids"]))
            variant_node["source_route_ids"] = variant["source_route_ids"]

    registry = graph.setdefault("external_source_registry", {})
    registry.update(SOURCE_REGISTRY)
    combo["component_route_variants"] = variants
    combo["component_route_variant_count"] = len(variants)
    combo["route_derivation"] = (
        "For the participatory frame plus one or more explicitly selected component methods, "
        "select the precomputed component_route_variant for that exact method set. An area is "
        "eligible only if each active method has a reviewed method_area_route for it. Keep an area only where every explicitly selected component method has that route. A role is "
        "eligible only if each active method has a reviewed method_area_role_route for that same "
        "area and role. Keep each method's tasks, items, tools and role items attributed to its "
        "source route; never union routes outside the exact variant or infer missing fit."
    )
    combo["sources"] = list(dict.fromkeys([*combo.get("sources", []), *SOURCE_IDS]))
    contract = {
        "contract_id": "d078_participatory_component_intersection_v1",
        "selection_rule": "required participatory frame plus one or more explicitly selected component methods",
        "framework_role": "Participatory action research is the shared governance and inquiry orientation; the selected components are evidence-gathering methods used within that orientation.",
        "variant_count": len(variants),
        "area_rule": "intersection of method_area_route.area_id for every active method",
        "role_rule": "intersection of method_area_role_route.role_id within each eligible area for every active method",
        "content_rule": "Expose only contribution records attached to the selected methods' source route IDs; preserve item/tool/role-item ownership and requirement lanes.",
        "no_inference_rule": "A missing method-area or method-area-role source route excludes that branch. Do not substitute another area's or method's route.",
        "external_evidence_scope": "External sources support the participatory orientation, method-choice logic and cautions; they do not independently assert each D078 area/role pairing or certify every selected method set.",
        "local_route_evidence_scope": "Each variant preserves the exact reviewed method-area and method-area-role route node IDs used to derive its intersections.",
        "sources": SOURCE_IDS,
        "local_route_evidence": "D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json: participatory_and_action_research area_routes",
        "student_explanation": "Choose one evidence method or combine several when they fit your research question and community agreement. The app keeps an area or role only when the graph supports every method you selected there.",
        "limits": "The selectable sets are route configurations, not 15 universally recommended or named research designs. Method suitability, participation, power, consent, access and safety remain question- and community-specific.",
    }
    combo["integration_contract"] = contract
    node_map[COMBO_ID]["integration_contract"] = contract
    node_map[COMBO_ID]["source_refs"] = combo["sources"]
    node_map[COMBO_ID]["route_derivation"] = combo["route_derivation"]

    graph["participatory_component_route_summary"] = {
        "variant_count": len(variants),
        "area_route_instances": sum(len(variant["area_routes"]) for variant in variants),
        "role_route_instances": sum(len(area["role_route_ids"]) for variant in variants for area in variant["area_routes"]),
        "route_derivation": combo["route_derivation"],
    }
    serialized = (json.dumps(graph, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    GRAPH_PATH.write_bytes(serialized)
    GRAPH_GZ_PATH.write_bytes(gzip.compress(serialized, compresslevel=9, mtime=0))
    print(json.dumps(graph["participatory_component_route_summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
