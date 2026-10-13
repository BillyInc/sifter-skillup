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
GRAPH_PATH = ROOT / "data" / "career-mapping" / "_audit" / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"


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
    area_routes: dict[str, list[dict[str, Any]]] = {}
    role_areas: dict[str, list[dict[str, Any]]] = {}
    for edge in graph.get("edges", []):
        if edge.get("relationship") != "area_to_role":
            continue
        area_node = area_nodes_by_graph_id.get(edge.get("source"))
        role_node = roles.get(edge.get("target"))
        if not area_node or not role_node:
            continue
        route = {
            "areaId": area_node["area_id"],
            "areaName": area_node.get("label"),
            "status": edge.get("status"),
            "rationale": edge.get("rationale"),
            "condition": edge.get("condition"),
            "positiveTaskEvidence": edge.get("positive_task_evidence"),
            "sourceReferences": [
                {"url": ref}
                for ref in edge.get("source_refs", [])
                if isinstance(ref, str) and ref.startswith("https://")
            ],
        }
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
            "description": row.get("boundary") or row.get("description"),
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
