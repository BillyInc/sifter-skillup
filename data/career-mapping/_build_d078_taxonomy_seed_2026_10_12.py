#!/usr/bin/env python3
"""Build an additive D078 seven-area and multi-area role-route SQL seed.

Inputs are the current area catalog, the already-reviewed route graph, and the
consolidated 2026-10-12 master graph. Role fit is carried forward, not
re-adjudicated. The old generic ISCO subgroup seed is deliberately not read.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "data/career-mapping/domain_specialization_catalog.json"
ROUTE_GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
MASTER_PATH = ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
ROLE_LIBRARY_PATH = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_META_PATH = ROOT / "data/career-mapping/domain_meta.json"
OUTPUT_PATH = ROOT / "backend/seed_d078_specialization_taxonomy_2026-10-12.sql"

NAMESPACE = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")
DOMAIN_KEY = "D078"
VERIFIED_AT = "2026-10-12"
EXPECTED_AREA_IDS = {
    "D078:sociology-social-anthropology",
    "D078:economics-applied-analysis",
    "D078:politics-governance-public-policy",
    "D078:psychology-social-behaviour",
    "D078:human-geography-population",
    "D078:social-research-evaluation",
    "D078:computational-digital-social-science",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def q(value: Any) -> str:
    return "'" + str(value if value is not None else "").replace("'", "''") + "'"


def uuid_for(*parts: str) -> str:
    return str(uuid.uuid5(NAMESPACE, "|".join(parts)))


def json_sql(value: Any) -> str:
    return q(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def table_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    catalog = read_json(CATALOG_PATH)
    route_graph = read_json(ROUTE_GRAPH_PATH)
    master = read_json(MASTER_PATH)
    role_library = read_json(ROLE_LIBRARY_PATH)

    domains = [row for row in catalog.get("domains", []) if row.get("domain_id") == DOMAIN_KEY]
    if len(domains) != 1:
        raise ValueError(f"Expected exactly one {DOMAIN_KEY} catalog record; got {len(domains)}")
    area_records = domains[0].get("areas", [])
    area_ids = {str(row.get("area_key") or "") for row in area_records}
    if len(area_records) != 7 or area_ids != EXPECTED_AREA_IDS:
        raise ValueError(f"D078 catalog must contain exactly the seven approved current areas; got {sorted(area_ids)}")
    if set(master.get("current_area_catalog", [])) != EXPECTED_AREA_IDS:
        raise ValueError("The consolidated master and current area catalog disagree")

    nodes = route_graph.get("nodes", [])
    edges = route_graph.get("edges", [])
    nodes_by_id = {row.get("id"): row for row in nodes if row.get("id")}
    area_nodes = {
        row.get("area_id"): row
        for row in nodes
        if row.get("kind") == "area_of_specialization" and row.get("area_id")
    }
    role_nodes = {
        row.get("id"): row
        for row in nodes
        if row.get("kind") == "role" and row.get("id")
    }
    if set(area_nodes) != EXPECTED_AREA_IDS:
        raise ValueError("The route graph does not contain exactly the seven approved area nodes")

    master_graph = master.get("learning_graph", {})
    approved_master_routes = {
        (edge.get("source"), edge.get("target"))
        for edge in master_graph.get("edges", [])
        if edge.get("relationship") == "area_to_role" and edge.get("status") == "approved"
    }
    legacy_routes = [edge for edge in edges if edge.get("relationship") == "area_to_role"]
    if len(legacy_routes) != 26:
        raise ValueError(f"Expected 26 reviewed D078 area-to-role routes; got {len(legacy_routes)}")
    if {(edge.get("source"), edge.get("target")) for edge in legacy_routes} != approved_master_routes:
        raise ValueError("The current route graph endpoints disagree with the approved master graph")

    role_names: dict[str, list[dict[str, Any]]] = {}
    for role in role_library:
        if role.get("domain_id") != DOMAIN_KEY:
            continue
        role_names.setdefault(str(role.get("role_name") or "").strip().casefold(), []).append(role)

    domain_id = uuid_for("domain", DOMAIN_KEY)
    areas: list[dict[str, Any]] = []
    for index, area in enumerate(area_records, start=1):
        evidence = area.get("evidence") or []
        references = [
            {
                "source_id": item.get("source_id"),
                "publisher": item.get("publisher"),
                "title": item.get("title"),
                "url": item.get("url"),
                "locator": item.get("locator"),
                "supports": item.get("supports"),
            }
            for item in evidence
            if item.get("url") and item.get("locator")
        ]
        if not references:
            raise ValueError(f"Area has no source references: {area['area_key']}")
        areas.append({
            "area_key": area["area_key"],
            "domain_id": domain_id,
            "domain_key": DOMAIN_KEY,
            "label": area["label"],
            "description": area.get("boundary") or area.get("description"),
            "display_order": index,
            "source_ids": area.get("source_ids") or [],
            "source_references": references,
            "source_confidence": "medium",
            "data_state": "source_backed",
            "verified_at": VERIFIED_AT,
        })

    routes: list[dict[str, Any]] = []
    for edge in legacy_routes:
        area_node = nodes_by_id.get(edge.get("source"))
        role_node = role_nodes.get(edge.get("target"))
        if not area_node or not role_node:
            raise ValueError(f"D078 route has an unresolved endpoint: {edge.get('source')} -> {edge.get('target')}")
        area_key = str(area_node.get("area_id") or "")
        role_name = str(role_node.get("label") or "").strip()
        candidates = role_names.get(role_name.casefold(), [])
        if len(candidates) != 1:
            raise ValueError(f"Expected one canonical D078 role record for {role_name!r}; got {len(candidates)}")
        role = candidates[0]
        if str(role.get("student_path_status") or "active").casefold() == "excluded":
            raise ValueError(f"An excluded role cannot enter the area-route seed: {role_name}")
        role_key = f"{DOMAIN_KEY}|{role['role_name']}"
        status = edge.get("status")
        if status == "reviewed_supported":
            route_status = "supported"
        elif status == "reviewed_conditional":
            route_status = "conditional"
        else:
            raise ValueError(f"Unexpected unreviewed route status {status!r} for {role_name} -> {area_key}")
        scope_condition = edge.get("scope_condition") or edge.get("condition")
        if route_status == "conditional" and not scope_condition:
            raise ValueError(f"Conditional route has no scope condition: {role_name} -> {area_key}")
        source_refs = list(dict.fromkeys(ref for ref in edge.get("source_refs", []) if isinstance(ref, str) and ref.startswith(("http://", "https://"))))
        if not source_refs:
            raise ValueError(f"Route has no source references: {role_name} -> {area_key}")
        route_id = uuid_for("d078_role_area_route", role_key, area_key)
        routes.append({
            "route_id": route_id,
            "domain_id": domain_id,
            "domain_key": DOMAIN_KEY,
            "area_key": area_key,
            "role_id": uuid_for("role", role_key),
            "role_key": role_key,
            "route_status": route_status,
            "student_visible": bool(edge.get("student_visible", False)),
            "rationale": edge.get("rationale") or "",
            "positive_task_evidence": edge.get("positive_task_evidence") or "",
            "negative_neighbouring_domain_check": edge.get("negative_neighbouring_domain_check") or "",
            "scope_condition": scope_condition,
            "source_references": [{"url": url} for url in source_refs],
            "source_provenance": edge.get("provenance") or [],
            "data_state": "source_backed",
            "verified_at": VERIFIED_AT,
        })
        if not routes[-1]["rationale"] or not routes[-1]["positive_task_evidence"] or not routes[-1]["negative_neighbouring_domain_check"]:
            raise ValueError(f"Route contract is incomplete: {role_name} -> {area_key}")

    statuses = {status: sum(row["route_status"] == status for row in routes) for status in ("supported", "conditional")}
    if statuses != {"supported": 18, "conditional": 8}:
        raise ValueError(f"Unexpected D078 role-route disposition counts: {statuses}")
    return areas, routes


def build_sql() -> str:
    areas, routes = table_rows()
    domain_meta = read_json(DOMAIN_META_PATH).get(DOMAIN_KEY) or {}
    domain_name = str(domain_meta.get("domain_name") or "").strip()
    if domain_name != "Social Sciences & Behavioural Research":
        raise ValueError(f"Unexpected D078 full canonical domain name: {domain_name!r}")
    domain_id = uuid_for("domain", DOMAIN_KEY)
    lines = [
        "-- Generated from current D078 domain metadata, area catalog, reviewed route graph, and approved master graph.",
        "-- Contains exactly seven current Areas of Specialization and 26 already-reviewed area-to-role routes.",
        "-- Supported/conditional distinctions are preserved; role fit is not re-adjudicated.",
        "-- Additive seed only. Requires migration_d078_specialization_taxonomy_2026-10-12.sql",
        "-- and the canonical D078 domain/role rows to have been seeded first.",
        "BEGIN;",
        "",
        "UPDATE skillup_dev.domains",
        f"SET name = {q(domain_name)}",
        f"WHERE id = {q(domain_id)}::uuid AND domain_key = {q(DOMAIN_KEY)};",
        "",
        "INSERT INTO skillup_dev.career_areas_of_specialization (",
        "    area_key, domain_id, domain_key, label, description, display_order,",
        "    source_ids, source_references, source_confidence, data_state, verified_at",
        ") VALUES",
    ]
    area_rows = []
    for row in areas:
        area_rows.append("(" + ", ".join([
            q(row["area_key"]), q(row["domain_id"]), q(row["domain_key"]), q(row["label"]),
            q(row["description"]), str(row["display_order"]),
            "ARRAY[" + ", ".join(q(value) for value in row["source_ids"]) + "]::text[]",
            json_sql(row["source_references"]), q(row["source_confidence"]), q(row["data_state"]), q(row["verified_at"]),
        ]) + ")")
    lines.append(",\n".join(area_rows))
    lines.extend([
        "ON CONFLICT (area_key) DO UPDATE SET",
        "    domain_id = EXCLUDED.domain_id, domain_key = EXCLUDED.domain_key,",
        "    label = EXCLUDED.label, description = EXCLUDED.description,",
        "    display_order = EXCLUDED.display_order, source_ids = EXCLUDED.source_ids,",
        "    source_references = EXCLUDED.source_references, source_confidence = EXCLUDED.source_confidence,",
        "    data_state = EXCLUDED.data_state, verified_at = EXCLUDED.verified_at;",
        "",
        "INSERT INTO skillup_dev.career_role_area_routes (",
        "    route_id, domain_id, domain_key, area_key, role_id, role_key, route_status,",
        "    student_visible, rationale, positive_task_evidence, negative_neighbouring_domain_check,",
        "    scope_condition, source_references, source_provenance, data_state, verified_at",
        ") VALUES",
    ])
    route_rows = []
    for row in routes:
        route_rows.append("(" + ", ".join([
            q(row["route_id"]), q(row["domain_id"]), q(row["domain_key"]), q(row["area_key"]),
            q(row["role_id"]), q(row["role_key"]), q(row["route_status"]),
            "true" if row["student_visible"] else "false", q(row["rationale"]),
            q(row["positive_task_evidence"]), q(row["negative_neighbouring_domain_check"]),
            "NULL" if row["scope_condition"] is None else q(row["scope_condition"]),
            json_sql(row["source_references"]), json_sql(row["source_provenance"]),
            q(row["data_state"]), q(row["verified_at"]),
        ]) + ")")
    lines.append(",\n".join(route_rows))
    lines.extend([
        "ON CONFLICT (role_id, area_key) DO UPDATE SET",
        "    route_id = EXCLUDED.route_id, domain_id = EXCLUDED.domain_id, domain_key = EXCLUDED.domain_key,",
        "    role_key = EXCLUDED.role_key, route_status = EXCLUDED.route_status,",
        "    student_visible = EXCLUDED.student_visible, rationale = EXCLUDED.rationale,",
        "    positive_task_evidence = EXCLUDED.positive_task_evidence,",
        "    negative_neighbouring_domain_check = EXCLUDED.negative_neighbouring_domain_check,",
        "    scope_condition = EXCLUDED.scope_condition, source_references = EXCLUDED.source_references,",
        "    source_provenance = EXCLUDED.source_provenance, data_state = EXCLUDED.data_state,",
        "    verified_at = EXCLUDED.verified_at;",
        "",
        "COMMIT;",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    sql_text = build_sql()
    OUTPUT_PATH.write_text(sql_text, encoding="utf-8")
    areas, routes = table_rows()
    print(json.dumps({
        "output": str(OUTPUT_PATH.relative_to(ROOT)),
        "areas": len(areas),
        "routes": len(routes),
        "route_statuses": {
            status: sum(row["route_status"] == status for row in routes)
            for status in ("supported", "conditional")
        },
        "legacy_subgroup_labels_emitted": False,
    }, indent=2))


if __name__ == "__main__":
    main()
