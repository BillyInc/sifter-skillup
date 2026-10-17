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
GRAPH_PATH = ROOT / "data" / "career-mapping" / "_audit" / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"


def _load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def _role_key(label: str) -> str:
    return re.sub(r"\s+", " ", label).strip().casefold()


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
    domain_routes: dict[str, dict[str, Any]] = {}

    def _reviewed_condition(value: Any) -> str | None:
        if not value:
            return None
        # Evidence ledgers append reconciliation history to the first reviewed
        # statement. Keep that original scope explanation, not the staff notes.
        condition = str(value)
        for marker in (
            " Local reconciliation of ",
            " Role-agent exact-key review ",
            " Second-pass ",
        ):
            condition = condition.split(marker, 1)[0]
        if ": " in condition:
            condition = condition.split(": ", 1)[1]
        return condition.strip() or None

    for edge in graph.get("edges", []):
        if edge.get("relationship") != "domain_to_role":
            continue
        role_node = roles.get(edge.get("target"))
        if not role_node:
            continue
        evidence = edge.get("evidence") or {}
        condition = _reviewed_condition(
            evidence.get("conditional_use_case") or evidence.get("basis")
        )
        domain_routes[_role_key(str(role_node.get("label") or ""))] = {
            "status": edge.get("status"),
            "condition": condition,
            "rationale": evidence.get("basis"),
            "positiveTaskEvidence": evidence.get("positive_task_evidence"),
            "sourceReferences": [
                {"url": ref}
                for ref in evidence.get("source_refs", [])
                if isinstance(ref, str) and ref.startswith("https://")
            ],
        }
    area_routes: dict[str, list[dict[str, Any]]] = {}
    role_areas: dict[str, list[dict[str, Any]]] = {}
    for edge in graph.get("edges", []):
        if edge.get("relationship") != "area_to_role":
            continue
        area_node = area_nodes_by_graph_id.get(edge.get("source"))
        role_node = roles.get(edge.get("target"))
        if not area_node or not role_node:
            continue
        domain_route = domain_routes.get(
            _role_key(str(role_node.get("label") or "")), {}
        )
        route = {
            "areaId": area_node["area_id"],
            "areaName": area_node.get("label"),
            "roleGraphId": role_node.get("id"),
            "roleName": role_node.get("label"),
            "roleNumber": role_node.get("role_number"),
            "domainRouteStatus": domain_route.get("status"),
            "domainRouteCondition": domain_route.get("condition"),
            "domainRouteReason": domain_route.get("rationale"),
            "domainTaskEvidence": domain_route.get("positiveTaskEvidence"),
            "domainRouteSources": domain_route.get("sourceReferences") or [],
            "status": edge.get("status"),
            "rationale": edge.get("rationale"),
            # The reviewed graph stores conditional route boundaries in
            # `scope_condition`; older consumers read only `condition`, which
            # silently erased the explanation from cross-area role cards.
            "condition": edge.get("scope_condition") or edge.get("condition"),
            "positiveTaskEvidence": edge.get("positive_task_evidence"),
            "sourceReferences": [
                {"url": ref}
                for ref in edge.get("source_refs", [])
                if isinstance(ref, str) and ref.startswith("https://")
            ],
        }
        route["studentVisible"] = bool(
            route["domainRouteStatus"] in {"reviewed_supported", "reviewed_conditional"}
            and (route["domainRouteStatus"] == "reviewed_supported" or route["domainRouteCondition"])
            and route["status"] in {"reviewed_supported", "reviewed_conditional"}
            and route["rationale"]
            and route["positiveTaskEvidence"]
            and route["sourceReferences"]
            and (
                route["status"] == "reviewed_supported"
                or route["condition"]
            )
        )
        if route["studentVisible"]:
            area_routes.setdefault(area_node["area_id"], []).append(route)
            role_areas.setdefault(_role_key(str(role_node.get("label") or "")), []).append(route)

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
            "roleRoutes": sorted(area_routes.get(area_id, []), key=lambda item: (item.get("areaName") or "", item.get("status") or "")),
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
        "areaIds": {row["id"] for row in areas},
    }


def is_d078_area_id(value: str) -> bool:
    return value in d078_guided_area_data()["areaIds"]


def d078_routed_role_keys(role_rows: list[dict[str, Any]]) -> set[str]:
    """Return role keys whose current records have a source-backed area route.

    Role-card availability is derived from the current reviewed route graph,
    not from stale `student_visible` or empty-item flags on a seed snapshot.
    This makes route cards available as soon as their evidence contract passes,
    while role learning items keep their own independent content gate.
    """
    routed_names = set(d078_guided_area_data()["roleAreas"])
    return {
        str(row.get("role_key") or "").strip().casefold()
        for row in role_rows
        if str(row.get("role_key") or "").strip()
        and _role_key(str(row.get("role_name") or "")) in routed_names
    }
