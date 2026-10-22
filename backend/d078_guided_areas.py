"""D078 guided-area presentation built from the current area catalog and
the already-reviewed programme-to-role graph.

This module consumes route decisions; it does not re-adjudicate role fit.
Legacy ISCO subgroup labels are deliberately not used as D078 areas.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "career-mapping" / "domain_specialization_catalog.json"
GRAPH_PATH = ROOT / "data" / "career-mapping" / "_audit" / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"


def _load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def _role_identity(value: Any) -> str:
    """Normalize display labels while preserving the D078 role-key boundary."""
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").casefold()).strip()


SOURCE_TITLES = {
    "UNESCO_ISCED_SOCIAL_SCIENCES": "UNESCO: International Standard Classification of Education fields",
    "UNESCO_ISCED_FIELD_DESCRIPTIONS": "UNESCO Institute for Statistics: Detailed field descriptions",
    "UNESCO_SOCIAL_SCIENCE_DEFINITION": "UNESCO Institute for Statistics: Social sciences field definition",
    "ISA_DIGITAL_SOCIOLOGY": "International Sociological Association: Digital Sociology",
}

# These are learner-facing explanations of the already-reviewed area
# boundaries. They explain the area before its item list; they do not create
# new roles, tools or curriculum claims. Source references remain the catalog
# references attached to each area.
AREA_STUDENT_EXPLANATIONS = {
    "D078:sociology-social-anthropology": (
        "Sociology and Social Anthropology study how people live together: relationships, institutions, culture, communities, inequality and social change. "
        "This route can use theory, interviews, observation, documents or other evidence to explain patterns in social life. "
        "It is not a claim that one course or one study can describe every community, and it does not replace any professional licence or specialist training."
    ),
    "D078:economics-applied-analysis": (
        "Economics and Applied Economic Analysis study choices, production, markets, distribution, institutions and economic outcomes. "
        "Learners may use concepts, data and models to compare incentives or explain how a defined policy or economic change affects people and organisations. "
        "An economic estimate depends on its measures, assumptions and setting; it is not automatically a causal proof or a complete account of social life."
    ),
    "D078:politics-governance-public-policy": (
        "Politics, Governance and Public Policy study how public authority is organised, how decisions are made, how policies are implemented and how people participate in civic systems. "
        "The route can lead to evidence-based analysis of institutions, laws, programmes, international relations or governance outcomes. "
        "Learning this area supports analysis and advice; it does not give the learner legal authority, public office or power to make a decision on behalf of an institution."
    ),
    "D078:psychology-social-behaviour": (
        "Social Behaviour and Interaction studies how people behave and relate to one another in groups, institutions and communities using social-science theory and evidence. "
        "It can help a learner examine interaction, attitudes or group processes as social patterns and connect them to wider settings. "
        "This area does not cover clinical assessment, counselling, psychotherapy, diagnosis, treatment or professional psychology licensure; those belong to the separate Psychology and Counselling domain."
    ),
    "D078:human-geography-population": (
        "Human Geography and Population Studies examine how people and places are connected through settlement, migration, population change, access and spatial patterns. "
        "Learners may compare defined places or populations using maps, counts, rates, field evidence or other location-based information. "
        "A map or population pattern describes evidence within a chosen place and period; it does not by itself explain the cause or grant authority to approve a statutory plan."
    ),
    "D078:social-research-evaluation": (
        "Social Research and Evaluation focuses on designing, carrying out and interpreting studies that answer social questions or examine programmes and policies. "
        "It brings together suitable qualitative, quantitative or mixed approaches, evidence handling, interpretation and communication rather than requiring every method at once. "
        "The right design depends on the question and available evidence, and an evaluation cannot prove more than its coverage, comparison and assumptions allow."
    ),
    "D078:computational-digital-social-science": (
        "Computational and Digital Social Science uses code, digital traces, networks, text, simulations or other data-intensive approaches to study social processes and digital society. "
        "The computational method must remain connected to a social question, sound research design and ethical interpretation; tools such as Python, R or a notebook are ways to carry out work, not the research question itself. "
        "Programming is therefore an optional route advantage where the task needs it, not a universal requirement for every Social Sciences learner or role."
    ),
}


@lru_cache(maxsize=1)
def d078_guided_area_data() -> dict[str, Any]:
    catalog = _load(CATALOG_PATH)
    graph = _load(GRAPH_PATH)
    domain = next((row for row in catalog.get("domains", []) if row.get("domain_id") == "D078"), None)
    if not domain:
        raise ValueError("D078 is missing from the current specialization catalog")
    area_nodes_by_graph_id = {
        row.get("id"): row
        for row in graph.get("nodes", [])
        if row.get("kind") == "area_of_specialization" and row.get("area_id")
    }
    area_nodes_by_key = {
        row.get("area_id"): row for row in area_nodes_by_graph_id.values() if row.get("area_id")
    }
    roles = {
        row.get("id"): row
        for row in graph.get("nodes", [])
        if row.get("kind") == "role" and row.get("id")
    }
    method_routes_by_area_role: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for method_route in graph.get("method_area_role_routes", []):
        area_key = str(method_route.get("area_id") or "")
        role_id = str(method_route.get("role_id") or "")
        if area_key in area_nodes_by_key and role_id in roles:
            method_routes_by_area_role.setdefault((area_key, role_id), []).append(method_route)

    area_routes: dict[str, list[dict[str, Any]]] = {}
    role_areas: dict[str, list[dict[str, Any]]] = {}
    role_areas_by_key: dict[str, list[dict[str, Any]]] = {}
    for edge in graph.get("edges", []):
        if edge.get("relationship") != "area_contains_supported_role":
            continue
        area_node = area_nodes_by_graph_id.get(edge.get("source"))
        role_node = roles.get(edge.get("target"))
        if not area_node or not role_node:
            continue
        area_id = str(area_node["area_id"])
        role_id = str(role_node["id"])
        method_routes = method_routes_by_area_role.get((area_id, role_id), [])
        route = {
            "areaId": area_id,
            "areaName": area_node.get("label"),
            "roleGraphId": role_id,
            "roleName": role_node.get("label"),
            "roleNumber": role_node.get("role_number"),
            "routeSource": edge.get("route_source"),
            "methodSpecificFitClaim": edge.get("method_specific_fit_claim"),
            "methodRouteCount": len(method_routes),
            "methodRouteIds": sorted(str(item.get("route_node_id")) for item in method_routes if item.get("route_node_id")),
            "roleItemIds": sorted({
                item_id for method_route in method_routes
                for item_id in method_route.get("role_item_ids", [])
                if isinstance(item_id, str)
            }),
            "methodSpecificRoleItemIds": sorted({
                item_id for method_route in method_routes
                for item_id in method_route.get("method_specific_role_item_ids", [])
                if isinstance(item_id, str)
            }),
            "methodToRoleFitClaim": sorted({
                str(method_route.get("method_to_role_fit_claim"))
                for method_route in method_routes
                if method_route.get("method_to_role_fit_claim")
            }),
        }
        area_routes.setdefault(area_id, []).append(route)
        normalized_name = _role_identity(role_node.get("label"))
        role_areas.setdefault(normalized_name, []).append(route)
        role_areas_by_key.setdefault(f"D078|{normalized_name}".casefold(), []).append(route)

    areas = []
    for index, row in enumerate(domain.get("areas", [])):
        area_id = str(row.get("area_key") or "")
        graph_node = area_nodes_by_key.get(area_id)
        if not area_id or not graph_node:
            raise ValueError(f"D078 area catalog entry is absent from the reviewed graph: {area_id}")
        source_urls = row.get("source_urls") or []
        source_ids = row.get("source_ids") or []
        areas.append({
            "id": area_id,
            "name": row.get("label") or graph_node.get("label"),
            "description": AREA_STUDENT_EXPLANATIONS.get(
                area_id,
                row.get("boundary") or row.get("description"),
            ),
            "sourceConfidence": "medium" if source_urls else "review_required",
            "dataState": "source_backed" if source_urls else "review_required",
            "displayOrder": index,
            "roleRoutes": sorted(area_routes.get(area_id, []), key=lambda item: (item.get("roleNumber") or 0, item.get("roleGraphId") or "")),
            "sources": [
                {"id": source_ids[i] if i < len(source_ids) else None,
                 "title": SOURCE_TITLES.get(source_ids[i], source_ids[i]) if i < len(source_ids) else "Area source",
                 "url": url,
                 "locator": row.get("boundary") or "Area boundary and scope"}
                for i, url in enumerate(source_urls)
                if isinstance(url, str) and url.startswith("https://")
            ],
            "contextKey": area_id,
        })
    if len(areas) != 7:
        raise ValueError(f"D078 current area set must contain seven entries; found {len(areas)}")
    return {
        "areas": areas,
        "roleAreas": role_areas,
        "roleAreasByKey": role_areas_by_key,
        "rolesByGraphId": roles,
        "areaIds": {row["id"] for row in areas},
    }


def is_d078_area_id(value: str) -> bool:
    return value in d078_guided_area_data()["areaIds"]


def d078_role_routes_for_key(role_key: str) -> list[dict[str, Any]]:
    """Return routes only for the exact stable D078 API role key."""
    return d078_guided_area_data()["roleAreasByKey"].get(str(role_key or "").strip().casefold(), [])


def d078_routed_role_keys(role_rows: list[dict[str, Any]]) -> set[str]:
    """Return role keys with exact identities in the canonical area-role map.

    This checks graph/API identity completeness only. It does not treat graph
    membership as approval of any learning item, method fit, or route copy;
    item-level content remains subject to its own ownership/evidence gate.
    """
    data = d078_guided_area_data()
    routed_names = set(data["roleAreas"])
    role_keys = {name: f"D078|{name}" for name in routed_names}
    seen: dict[str, list[dict[str, Any]]] = {}
    for row in role_rows:
        role_key = str(row.get("role_key") or "").strip().casefold()
        if not role_key.startswith("d078|"):
            continue
        name = _role_identity(row.get("role_name"))
        expected_key = role_keys.get(name)
        key_name = _role_identity(role_key.split("|", 1)[1])
        if expected_key:
            if role_key != expected_key.casefold():
                raise ValueError(f"D078 API role does not resolve to a canonical graph role: {row.get('role_key')!r}")
            seen.setdefault(name, []).append(row)
        elif key_name in routed_names:
            raise ValueError(f"D078 API role does not resolve to a canonical graph role: {row.get('role_key')!r}")
    missing = sorted(routed_names - seen.keys())
    ambiguous = sorted(name for name in routed_names if len(seen.get(name, [])) > 1)
    if missing or ambiguous:
        raise ValueError(f"D078 role identity join incomplete: missing={missing}; ambiguous={ambiguous}")
    return {role_keys[name].casefold() for name in seen}
