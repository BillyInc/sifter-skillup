"""Join the existing D078 graph with all area-lane handoffs and reviewed role routes.

The output is a hidden design/reconciliation artifact. It does not edit canonical
career records, change role-fit decisions, or promote learner-visible material.
Only the seven current D078 Areas of Specialization are represented as area nodes.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
LANES = AUDIT / "d078_area_enrichment_lanes_2026_10_10"
GRAPH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
REPORT = ROOT / "docs/manual-review/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.md"
ROLES_FILE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
EMERGING_SUPPLEMENT = AUDIT / "D078_DOMAIN_WIDE_EMERGING_TASK_SET_ENRICHMENT_2026_10_10.json"
EMERGING_DISPOSITION = AUDIT / "D078_DOMAIN_WIDE_EMERGING_SUPPLEMENT_DISPOSITION_2026_10_10.json"
AREA_ITEM_CONTEXT_OVERLAY = AUDIT / "D078_AREA_ITEM_CONTEXT_RECONCILIATION_2026_10_10.json"
DOMAIN_AREA_ROUTE_CROSSWALK = AUDIT / "D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json"
CONTENT_CLOSURE = AUDIT / "D078_DOMAIN_AREA_CONTENT_CONTRACT_CLOSURE_2026_10_10.json"
AREA_RESOURCE_REPAIR_FILES = (
    ROOT / "docs/manual-review/D078_AREA_RESOURCE_REPAIR_A05_A06_2026_10_12.json",
    ROOT / "docs/manual-review/D078_AREA_RESOURCE_REPAIR_A07_2026_10_12.json",
)
AREA_RELATIONSHIP_DISPOSITION_FILES = (
    AUDIT / "d078_area_relationship_dispositions_A01_A03_2026_10_10.json",
    AUDIT / "d078_area_relationship_dispositions_A04_A05_2026_10_10.json",
    AUDIT / "d078_area_relationship_dispositions_A06_A07_2026_10_10.json",
)
SEQUENCE_DIRECTION_REVIEW = AUDIT / "D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.json"
FULL_PATH_SEQUENCE_DESIGN = AUDIT / "D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.json"
SOCIOLOGY_THEME_AUDIT = AUDIT / "sociology_programme_theme_narration_audit_2026_10_08.json"
SOCIOLOGY_CURRICULUM_CONTRACT = AUDIT / "sociology_curriculum_contract_2026-09-17.json"
PROGRAMME_DOMAIN_EVIDENCE = AUDIT / "programme_domain_evidence_2026-08-17.json"
AREA_RELATIONSHIP_DISPOSITION_PATHS = [
    str(path.relative_to(ROOT)).replace("\\", "/")
    for path in AREA_RELATIONSHIP_DISPOSITION_FILES
]

AREA_LABELS = {
    "D078:sociology-social-anthropology": "Sociology and Social Anthropology",
    "D078:economics-applied-analysis": "Economics and Applied Economic Analysis",
    "D078:politics-governance-public-policy": "Politics, Governance and Public Policy",
    "D078:psychology-social-behaviour": "Social Behaviour and Interaction",
    "D078:human-geography-population": "Human Geography and Population Studies",
    "D078:social-research-evaluation": "Social Research and Evaluation",
    "D078:computational-digital-social-science": "Computational and Digital Social Science",
}

LANE_FILES = {
    "area_01_02_deep": "D078_AREAS_01_02_DEEP_ENRICHMENT_2026_10_10.json",
    "area_01_02_complete": "AREAS_01_02_DEEP_ENRICHMENT_2026_10_10.json",
    "area_01_02_fallback": "local_fallback_areas_001_002.json",
    "area_03_04_base": "D078_AREAS_03_04_ENRICHMENT_CHECKPOINT_2026_10_10.json",
    "area_03_04_extended": "D078_AREAS_03_04_EXTENDED_ENRICHMENT_2026_10_10.json",
    "area_03_04_emerging": "D078_AREAS_03_04_EMERGING_TASKS_SUPPLEMENT_2026_10_10.json",
    "area_05_07": "d078_area_enrichment_areas_5_7_2026_10_10.json",
}


def slug(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(value or "").lower()).strip("-")[:140]


def norm(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def sanitize_retired_area_labels(value: Any) -> Any:
    """Prevent retired area headings from leaking through copied source prose."""
    replacements = (
        (re.compile(r"social, cultural\s*(?:&|and)\s*economic research", re.I), "social-science research"),
        (re.compile(r"computational\s+and\s+quantitative\s+social\s+research", re.I), "quantitative or computational social-science work"),
    )
    if isinstance(value, str):
        for pattern, replacement in replacements:
            value = pattern.sub(replacement, value)
        return value
    if isinstance(value, list):
        return [sanitize_retired_area_labels(item) for item in value]
    if isinstance(value, dict):
        return {key: sanitize_retired_area_labels(item) for key, item in value.items()}
    return value


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def merge_resource_rows(existing: list[dict[str, Any]], incoming: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Merge provenance/resource rows by stable source identity and URL."""
    merged: dict[tuple[str, str], dict[str, Any]] = {}
    for row in [*existing, *incoming]:
        if not isinstance(row, dict):
            continue
        source_id = str(row.get("source_id") or "").strip()
        url = str(row.get("url") or row.get("uri") or "").strip()
        if not source_id or not url:
            continue
        key = (source_id, url)
        merged[key] = {**merged.get(key, {}), **row, "source_id": source_id, "url": url}
    return [merged[key] for key in sorted(merged)]


def apply_area_resource_repairs(nodes: dict[str, dict[str, Any]],
                                source_artifacts: list[str]) -> dict[str, Any]:
    """Attach the disjoint A05-A07 evidence/resource repairs to hidden area nodes.

    This consumes the source-checked ledgers as item-level resource evidence;
    it does not approve student visibility, sequencing, ownership or role fit.
    """
    expected_records = 35
    resolved = 0
    by_area: Counter[str] = Counter()
    unresolved_references: list[dict[str, str]] = []
    source_registry: dict[str, dict[str, Any]] = {}
    repair_paths: list[str] = []

    for path in AREA_RESOURCE_REPAIR_FILES:
        if not path.exists():
            raise FileNotFoundError(f"Expected D078 area resource repair ledger is missing: {path}")
        document = load_json(path)
        artifact = str(path.relative_to(ROOT)).replace("\\", "/")
        repair_paths.append(artifact)
        compact_ledger = path.name.startswith("D078_AREA_RESOURCE_REPAIR_A05_A06")
        registry_rows = document.get("source_registry") or []
        registry = {str(row.get("source_id")): row for row in registry_rows if row.get("source_id")}

        for record in document.get("records", []):
            if compact_ledger:
                item_id = str(record.get("item_id") or "")
                node = next((n for n in nodes.values()
                             if n.get("kind") == "area_enrichment_item" and n.get("item_id") == item_id), None)
                area_id = record.get("area_id")
                label = record.get("label")
                finding = record.get("source_check_finding")
                limit = record.get("item_limit")
                evidence_ids = record.get("evidence_source_ids") or []
                free_ids = record.get("free_learning_source_ids") or []
                missing = sorted(set(evidence_ids + free_ids) - set(registry))
                unresolved_references.extend({"item_id": item_id, "source_id": source_id} for source_id in missing)
                evidence = []
                for source_id in evidence_ids:
                    source = registry.get(source_id)
                    if not source:
                        continue
                    normalized = {
                        "source_id": source_id, "title": source.get("title"),
                        "publisher": source.get("publisher"), "url": source.get("url"),
                        "locator": source.get("exact_locator"), "supports": finding,
                        "limits": source.get("scope_limit"), "cost_access": source.get("access_cost"),
                        "accessed_on": source.get("accessed_on"),
                    }
                    evidence.append(normalized)
                    source_registry.setdefault(source_id, normalized)
                free_resources = []
                for source_id in free_ids:
                    source = registry.get(source_id)
                    if not source:
                        continue
                    free_resources.append({
                        "source_id": source_id, "title": source.get("title"),
                        "publisher": source.get("publisher"), "url": source.get("url"),
                        "locator": source.get("exact_locator"), "what_supported": finding,
                        "limitations": source.get("scope_limit"), "cost_access": source.get("access_cost"),
                        "accessed_on": source.get("accessed_on"),
                    })
                route_rows: list[dict[str, Any]] = []
                unresolved = []
            else:
                node = nodes.get(str(record.get("id") or ""))
                area_id = record.get("area_id") or (node or {}).get("area_id")
                label = record.get("label") or (node or {}).get("label")
                finding = None
                limit = None
                evidence = [row for row in record.get("evidence_sources", []) if isinstance(row, dict)]
                free_resources = [row for row in record.get("free_task_specific_learning_resources", []) if isinstance(row, dict)]
                route_rows = [row for row in record.get("paid_or_official_routes", []) if isinstance(row, dict)]
                unresolved = record.get("unresolved") or []
                for source in [*evidence, *free_resources, *route_rows]:
                    source_id = str(source.get("source_id") or "").strip()
                    url = str(source.get("url") or "").strip()
                    if not source_id or not url:
                        unresolved_references.append({"item_id": str(record.get("id") or ""), "source_id": source_id or "missing_source_id_or_url"})
                        continue
                    prior = source_registry.get(source_id)
                    if prior and prior.get("url") != url:
                        raise ValueError(f"Conflicting URLs for area source identity {source_id}")
                    source_registry.setdefault(source_id, source)

            identity = str(record.get("item_id") or record.get("id") or "")
            if node is None:
                unresolved_references.append({"item_id": identity, "source_id": "area_graph_node_not_found"})
                continue
            if node.get("area_id") != area_id:
                raise ValueError(f"Area resource repair area mismatch for {identity}")
            if node.get("student_visible"):
                raise ValueError(f"Area resource repair cannot approve visibility: {node['id']}")
            if not evidence or not free_resources:
                unresolved_references.append({"item_id": identity, "source_id": "missing_evidence_or_free_learning_route"})
                continue
            closure = node.setdefault("content_contract_closure", {})
            if not isinstance(closure, dict):
                raise ValueError(f"Area content contract closure has an unexpected shape: {node['id']}")
            closure["evidence_sources"] = merge_resource_rows(closure.get("evidence_sources") or [], evidence)
            closure["evidence_source_ids"] = sorted(set(closure.get("evidence_source_ids") or []) | {r["source_id"] for r in evidence})
            closure["free_task_specific_learning_resources"] = merge_resource_rows(
                closure.get("free_task_specific_learning_resources") or [], free_resources
            )
            closure["free_task_specific_learning_resource_ids"] = sorted(
                set(closure.get("free_task_specific_learning_resource_ids") or [])
                | {r["source_id"] for r in free_resources}
            )
            if route_rows:
                closure["additional_official_or_paid_learning_routes"] = merge_resource_rows(
                    closure.get("additional_official_or_paid_learning_routes") or [], route_rows
                )
            node["content_contract_closure"] = closure
            node["area_resource_repair"] = {
                "artifact": artifact,
                "status": "source_and_learning_routes_attached_hidden_not_approved",
                "record_label": label,
                "source_check_finding": finding,
                "item_limit": limit,
                "unresolved_branches": unresolved,
                "student_visible": False,
                "sequence_approved": False,
            }
            node["student_visible"] = False
            by_area[str(area_id)] += 1
            resolved += 1

    if resolved != expected_records:
        raise ValueError(f"Expected {expected_records} area resource records to attach; attached {resolved}")
    if unresolved_references:
        raise ValueError(f"Area resource repair references need reconciliation: {unresolved_references[:12]}")
    for artifact in repair_paths:
        if artifact not in source_artifacts:
            source_artifacts.append(artifact)
    return {
        "records": resolved,
        "records_by_area": dict(sorted(by_area.items())),
        "source_identities": len(source_registry),
        "unresolved_source_or_item_references": 0,
        "student_visible": False,
        "sequence_approved": False,
        "canonical_promotions": 0,
        "source_registry": source_registry,
    }


def area_key(value: object) -> str | None:
    text = str(value or "").strip()
    if text in AREA_LABELS:
        return text
    folded = norm(text)
    for key, label in AREA_LABELS.items():
        if folded == norm(label):
            return key
    return None


def add_edge(edges: list[dict[str, Any]], source: str, target: str,
             relationship: str, status: str, **details: Any) -> None:
    candidate = {"source": source, "target": target,
                 "relationship": relationship, "status": status, **details}
    if not any(e.get("source") == source and e.get("target") == target
               and e.get("relationship") == relationship
               and e.get("status") == status for e in edges):
        edges.append(candidate)


def contract_entries(value: Any) -> list[Any]:
    """Return declared relationship values without turning prose into approval."""
    if isinstance(value, list):
        return value
    if value in (None, ""):
        return []
    return [value]


def is_not_established(value: Any) -> bool:
    return isinstance(value, dict) and str(value.get("state", "")).startswith("not_established")


def relationship_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(value or "").lower()).strip("-")


def build_area_source_registry(lane_documents: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
    registry: dict[str, dict[str, Any]] = {}
    for document in lane_documents.values():
        for field in ("source_records", "sources"):
            for source in contract_entries(document.get(field)):
                if isinstance(source, dict) and (source.get("source_id") or source.get("id")):
                    source_id = str(source.get("source_id") or source.get("id"))
                    registry.setdefault(source_id, {"source_id": source_id, **source})
        raw_registry = document.get("source_registry") or {}
        if isinstance(raw_registry, dict):
            for source_id, source in raw_registry.items():
                if isinstance(source, dict):
                    registry.setdefault(str(source_id), {"source_id": str(source_id), **source})
        else:
            for source in contract_entries(raw_registry):
                if isinstance(source, dict) and (source.get("source_id") or source.get("id")):
                    source_id = str(source.get("source_id") or source.get("id"))
                    registry.setdefault(source_id, {"source_id": source_id, **source})
    return registry


def add_area_contract_relationships(nodes: dict[str, dict[str, Any]],
                                    edges: list[dict[str, Any]],
                                    lane_source_registry: dict[str, dict[str, Any]]) -> dict[str, int]:
    """Materialize area contract links as hidden graph candidates.

    Target references are matched only on exact normalized IDs/labels. Any
    unmatched text is retained as a hidden reference node, never guessed into
    a canonical learning item. Source links are item-level provenance; they
    are not represented as relationship-specific proof.
    """
    exact_index: dict[str, str] = {}
    unique_suffix_candidates: defaultdict[str, set[str]] = defaultdict(set)
    for node_id, node in nodes.items():
        for key in (node_id, node.get("item_id"), node.get("task_family_id"), node.get("label")):
            if key:
                normalized = relationship_key(key)
                exact_index.setdefault(normalized, node_id)
                # Some contracts refer to the source ID suffix without its
                # namespace. Accept only globally unique suffixes; ambiguous
                # suffixes remain unresolved rather than being guessed.
                if ":" in str(key):
                    suffix = relationship_key(str(key).rsplit(":", 1)[-1])
                    if suffix:
                        unique_suffix_candidates[suffix].add(node_id)
    for suffix, candidates in unique_suffix_candidates.items():
        if len(candidates) == 1:
            exact_index.setdefault(suffix, next(iter(candidates)))

    stats = Counter()
    for item_id, item in list(nodes.items()):
        if item.get("kind") != "area_enrichment_item":
            continue
        closure = item.get("content_contract_closure") or {}
        source_registry = {
            source.get("source_id"): source
            for source in contract_entries(closure.get("evidence_sources"))
            if isinstance(source, dict) and source.get("source_id")
        }
        source_registry = {**lane_source_registry, **source_registry}
        evidence_sources = [
            {"source_id": source.get("source_id"), "url": source.get("url")}
            for source in source_registry.values()
            if isinstance(source, dict) and source.get("source_id") and source.get("url")
        ]

        def endpoint(value: Any, relation_kind: str, *, annotation: bool = False) -> str:
            target_id = value.get("target_id") if isinstance(value, dict) else None
            target_key = value.get("target_key") if isinstance(value, dict) else None
            target = value.get("target") if isinstance(value, dict) else value
            text = str(target or target_key or target_id or "").strip()
            resolved = exact_index.get(relationship_key(target_id)) if target_id else None
            resolved = resolved or exact_index.get(relationship_key(target_key)) if target_key else resolved
            resolved = resolved or exact_index.get(relationship_key(text))
            if resolved:
                stats["resolved_target_references"] += 1
                return resolved
            ref_id = f"area_relationship_reference:{slug(item.get('item_id'))}:{slug(relation_kind)}:{slug(text)}"
            if ref_id not in nodes:
                ref_kind = "area_relationship_annotation" if annotation else "area_relationship_reference"
                nodes[ref_id] = {
                    "id": ref_id,
                    "kind": ref_kind,
                    "label": text.replace("_", " "),
                    "area_id": item.get("area_id"),
                    "reference_for_item": item_id,
                    "reference_type": relation_kind,
                    "is_learning_item": False,
                    "resolution_status": (
                        "descriptive_relationship_text_not_a_catalog_item"
                        if annotation else "unresolved_typed_target_not_matched_to_catalog_item"
                    ),
                    "student_visible": False,
                    "approval": "relationship_annotation_candidate_not_sequence_approved",
                    "source_artifacts": item.get("source_artifacts", []),
                }
                stats["descriptive_relationship_annotations" if annotation else "unresolved_typed_target_references"] += 1
            return ref_id

        def add_declared_edge(value: Any, relation_kind: str, *, target_first: bool = False,
                              annotation: bool = False) -> None:
            if is_not_established(value):
                stats["not_established_relationships"] += 1
                return
            target_value = (
                value.get("target") or value.get("target_key") or value.get("target_id")
                if isinstance(value, dict) else value
            )
            if not str(target_value or "").strip():
                stats["empty_relationships"] += 1
                return
            target_id = endpoint(value, relation_kind, annotation=annotation)
            source_id, end_id = (target_id, item_id) if target_first else (item_id, target_id)
            explanation = (value.get("why") or value.get("explanation")) if isinstance(value, dict) else None
            relation_source_ids = value.get("evidence_source_ids", []) if isinstance(value, dict) else []
            if not isinstance(relation_source_ids, list):
                relation_source_ids = [relation_source_ids]
            relation_sources = [
                {
                    "source_id": source_id,
                    "url": source_registry[source_id].get("url") or source_registry[source_id].get("uri"),
                    "title": source_registry[source_id].get("title") or source_registry[source_id].get("name"),
                }
                for source_id in relation_source_ids
                if source_id in source_registry and (source_registry[source_id].get("url") or source_registry[source_id].get("uri"))
            ]
            stats["relationship_evidence_source_ids"] += len(relation_source_ids)
            stats["resolved_relationship_evidence_source_ids"] += len(relation_sources)
            add_edge(
                edges, source_id, end_id, relation_kind,
                "area_relationship_candidate_not_sequence_approved",
                area_id=item.get("area_id"),
                declared_by_item_id=item.get("item_id"),
                explanation=explanation,
                evidence_source_ids=relation_source_ids or closure.get("evidence_source_ids", []),
                evidence_sources=relation_sources if relation_source_ids else evidence_sources,
                relationship_evidence_source_ids_unresolved=[
                    source_id for source_id in relation_source_ids
                    if source_id not in source_registry or not (source_registry[source_id].get("url") or source_registry[source_id].get("uri"))
                ],
                evidence_scope=(
                    "relationship-specific source IDs recorded; source/content fit still requires verification"
                    if relation_source_ids else
                    "item-level provenance only; relationship-specific evidence has not been separately adjudicated"
                ),
                student_visible=False,
                sequence_approved=False,
            )
            stats["relationship_edges"] += 1

        for relation in contract_entries(closure.get("relationships")):
            if not isinstance(relation, dict):
                add_declared_edge(relation, "declared_relationship")
                continue
            rel = str(relation.get("type") or "declared_relationship").strip().lower()
            if rel in {"requires", "builds_on", "prerequisite", "prerequisites"}:
                add_declared_edge(relation, rel, target_first=True)
            else:
                add_declared_edge(relation, rel)

        for prerequisite in contract_entries(closure.get("prerequisites")):
            add_declared_edge(prerequisite, "prerequisite_text", target_first=True, annotation=True)
        for alternative in contract_entries(closure.get("valid_alternatives")):
            add_declared_edge(alternative, "alternative_option", annotation=True)
        for complement in contract_entries(closure.get("complements")):
            add_declared_edge(complement, "complements", annotation=True)

    return {
        "area_item_relationship_edges": stats["relationship_edges"],
        "resolved_target_references": stats["resolved_target_references"],
        "unresolved_typed_target_references": stats["unresolved_typed_target_references"],
        "descriptive_relationship_annotations": stats["descriptive_relationship_annotations"],
        "relationship_evidence_source_ids": stats["relationship_evidence_source_ids"],
        "resolved_relationship_evidence_source_ids": stats["resolved_relationship_evidence_source_ids"],
        "unresolved_relationship_evidence_source_ids": (
            stats["relationship_evidence_source_ids"] - stats["resolved_relationship_evidence_source_ids"]
        ),
        "not_established_relationships": stats["not_established_relationships"],
        "empty_relationships": stats["empty_relationships"],
    }


def normalize_area_relationship_dispositions() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Normalize the three disjoint handoffs and preserve local reconciliation."""
    normalized: list[dict[str, Any]] = []
    sources: list[dict[str, Any]] = []
    for path in AREA_RELATIONSHIP_DISPOSITION_FILES:
        document = load_json(path)
        sources.append({
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "schema_version": document.get("schema_version"),
            "area_scope": document.get("area_scope") or document.get("scope", {}).get("included_area_ids", []),
            "external_verification": document.get("external_verification"),
            "external_sources_checked": document.get("external_sources_checked"),
        })
        rows = document.get("records") or document.get("references") or []
        if not isinstance(rows, list):
            raise ValueError(f"Area relationship handoff has no record list: {path}")
        for row in rows:
            if path.name.startswith("d078_area_relationship_dispositions_A01_A03"):
                decision_map = {
                    "resolved_existing_node": "resolve_to_existing_node",
                    "explanatory_annotation": "retain_as_non_item_annotation",
                    "new_learning_item_candidate": "new_item_candidate_hidden",
                    "unsupported_hidden": "unsupported_hidden",
                }
                decision = decision_map.get(row.get("disposition"), row.get("disposition"))
                targets = row.get("resolved_target_node_ids") or []
                candidate = row.get("candidate_item")
                relation = row.get("relation_type")
                label = row.get("raw_target")
                declared_by = row.get("declaring_item_id")
                rationale = row.get("rationale")
                limitation = row.get("limitations")
                source_ids = row.get("evidence_source_ids") or []
                recommended_relation = row.get("recommended_relationship_type")
            else:
                decision = row.get("decision")
                targets = row.get("resolved_target_ids") or []
                candidate = row.get("candidate_item")
                relation = row.get("old_type")
                label = row.get("old_label")
                declared_by = row.get("declared_by_item_id")
                rationale = row.get("rationale")
                limitation = row.get("remaining_limitation")
                source_ids = row.get("evidence_source_ids") or []
                recommended_relation = row.get("recommended_relationship_type")
            record = {
                "reference_id": row.get("reference_id"),
                "area_id": row.get("area_id"),
                "decision": decision,
                "raw_relationship_type": relation,
                "recommended_relationship_type": recommended_relation or relation,
                "raw_target": label,
                "declaring_item_source_id": declared_by,
                "resolved_target_ids": list(targets),
                "candidate_item": candidate,
                "context_target_candidate_ids": row.get("context_target_candidate_ids", []),
                "rationale": rationale,
                "evidence_source_ids": list(source_ids) if isinstance(source_ids, list) else [source_ids],
                "evidence_sources": row.get("evidence_sources") or row.get("external_sources") or [],
                "remaining_limitation": limitation,
                "student_visible": row.get("student_visible", False),
                "sequence_approved": row.get("sequence_approved", False),
                "handoff_path": str(path.relative_to(ROOT)).replace("\\", "/"),
            }
            normalized.append(record)

    # The Politics item names data visualisation as a candidate, but the graph
    # already has a precise domain-wide complement node that combines the task
    # with plain-language communication. Resolve to that existing concept;
    # do not create a second item or treat visualisation as mandatory.
    for record in normalized:
        if (record["area_id"] == "D078:politics-governance-public-policy"
                and relationship_key(record.get("raw_target")) == "data-visualisation"
                and record["decision"] == "new_item_candidate_hidden"):
            record["decision"] = "resolve_to_existing_node"
            record["resolved_target_ids"] = [
                "concept:emerging_complement:data-visualisation-and-plain-language-research-communication"
            ]
            record["candidate_item"] = None
            record["local_reconciliation_note"] = (
                "The current graph already contains an exact domain-wide data-visualisation/"
                "plain-language research-communication complement; retain the A03 relation "
                "to that node instead of creating duplicate area candidate content."
            )

    return normalized, sources


def apply_area_relationship_dispositions(
    nodes: dict[str, dict[str, Any]], edges: list[dict[str, Any]],
) -> dict[str, Any]:
    """Attach dispositions to every typed reference without approving display/order."""
    records, artifacts = normalize_area_relationship_dispositions()
    by_id: dict[str, dict[str, Any]] = {}
    for record in records:
        ref_id = record.get("reference_id")
        if not ref_id or ref_id in by_id:
            raise ValueError(f"Missing or duplicate relationship reference ID: {ref_id!r}")
        by_id[ref_id] = record

    typed_refs = {
        node_id: node for node_id, node in nodes.items()
        if node.get("kind") == "area_relationship_reference"
    }
    missing_handoffs = sorted(set(typed_refs) - set(by_id))
    stale_handoffs = sorted(set(by_id) - set(typed_refs))
    if missing_handoffs or stale_handoffs:
        raise ValueError(
            "Area relationship handoffs must exactly cover current typed references; "
            f"missing={missing_handoffs[:5]} ({len(missing_handoffs)}), "
            f"stale={stale_handoffs[:5]} ({len(stale_handoffs)})"
        )

    counts: Counter[str] = Counter()
    new_candidate_ids: set[str] = set()
    for ref_id, record in by_id.items():
        ref = nodes[ref_id]
        decision = record["decision"]
        targets = record["resolved_target_ids"]
        for target_id in targets:
            if target_id not in nodes:
                raise ValueError(f"Disposition target does not exist: {ref_id} -> {target_id}")
        if record.get("student_visible") or record.get("sequence_approved"):
            raise ValueError(f"Area relationship handoff prematurely approved: {ref_id}")

        ref["disposition_status"] = decision
        ref["disposition_rationale"] = record.get("rationale")
        ref["disposition_limitations"] = record.get("remaining_limitation")
        ref["disposition_evidence_source_ids"] = record.get("evidence_source_ids", [])
        ref["disposition_handoff"] = record["handoff_path"]
        ref["student_visible"] = False
        ref["sequence_approved"] = False

        if decision == "resolve_to_existing_node":
            counts["resolved_reference_records"] += 1
            counts["resolved_target_links"] += len(targets)
            ref["resolution_status"] = "dispositioned_exact_target_hidden_not_sequence_approved"
            ref["resolved_target_ids"] = targets
            if record.get("local_reconciliation_note"):
                ref["local_reconciliation_note"] = record["local_reconciliation_note"]
            source_item = ref.get("reference_for_item")
            if not source_item or source_item not in nodes:
                raise ValueError(f"Relationship declaration has no graph source item: {ref_id}")
            rel = record.get("recommended_relationship_type") or ref.get("reference_type")
            for target_id in targets:
                add_edge(
                    edges,
                    ref_id,
                    target_id,
                    "disposition_resolves_to",
                    "hidden_target_resolution_not_a_learning_requirement",
                    area_id=ref.get("area_id"),
                    declared_by_item_id=source_item,
                    original_relationship_type=ref.get("reference_type"),
                    resolved_relationship_type=rel,
                    rationale=record.get("rationale"),
                    evidence_source_ids=record.get("evidence_source_ids", []),
                    evidence_sources=record.get("evidence_sources", []),
                    student_visible=False,
                    sequence_approved=False,
                )
                # Preserve the actual learning relationship separately from the
                # bookkeeping edge above. It remains hidden until sequence review.
                add_edge(
                    edges,
                    source_item,
                    target_id,
                    "area_relationship_disposition_candidate",
                    "hidden_relationship_fit_requires_sequence_review",
                    area_id=ref.get("area_id"),
                    declared_relationship_type=ref.get("reference_type"),
                    recommended_relationship_type=rel,
                    orientation_requires_review=rel in {"requires", "builds_on", "prerequisite", "precedes"},
                    rationale=record.get("rationale"),
                    limitations=record.get("remaining_limitation"),
                    evidence_source_ids=record.get("evidence_source_ids", []),
                    evidence_sources=record.get("evidence_sources", []),
                    evidence_scope="disposition ledger supports target interpretation; route sequence remains unapproved",
                    student_visible=False,
                    sequence_approved=False,
                )
        elif decision == "retain_as_non_item_annotation":
            counts["annotation_reference_records"] += 1
            ref["kind"] = "area_relationship_annotation"
            ref["is_learning_item"] = False
            ref["resolution_status"] = "dispositioned_as_explanatory_annotation_hidden"
            ref["annotation_text"] = record.get("raw_target")
            ref["context_target_candidate_ids"] = record.get("context_target_candidate_ids", [])
        elif decision == "new_item_candidate_hidden":
            candidate = record.get("candidate_item") or {}
            if record.get("handoff_path", "").endswith("A04_A05_2026_10_10.json"):
                candidate_id = (candidate.get("candidate_item_id") if isinstance(candidate, dict) else None)
                candidate_label = candidate.get("suggested_title") if isinstance(candidate, dict) else None
                candidate_payload = {
                    "required_contract": candidate.get("required_contract"),
                    "evidence_source_ids": candidate.get("evidence_source_ids", []),
                    "evidence_urls": candidate.get("evidence_urls", []),
                }
            else:
                candidate_id = candidate.get("id") if isinstance(candidate, dict) else None
                candidate_label = candidate.get("label") if isinstance(candidate, dict) else None
                candidate_payload = candidate
            if not candidate_id:
                raise ValueError(f"Candidate disposition lacks a stable candidate ID: {ref_id}")
            node_id = str(candidate_id)
            if node_id not in nodes:
                nodes[node_id] = {
                    "id": node_id,
                    "kind": "area_relationship_candidate_item",
                    "item_type": candidate.get("type", "conditional_method_candidate") if isinstance(candidate, dict) else "conditional_method_candidate",
                    "area_id": ref.get("area_id"),
                    "label": candidate_label or record.get("raw_target") or node_id,
                    "source_reference_ids": [],
                    "candidate_content_contract": candidate_payload,
                    "evidence_source_ids": record.get("evidence_source_ids", []),
                    "student_visible": False,
                    "sequence_approved": False,
                    "approval": "hidden_candidate_requires_content_contract_and_route_review",
                    "source_artifacts": [record["handoff_path"]],
                }
            nodes[node_id].setdefault("source_reference_ids", []).append(ref_id)
            new_candidate_ids.add(node_id)
            counts["new_candidate_reference_records"] += 1
            ref["resolution_status"] = "dispositioned_to_hidden_candidate_item"
            ref["resolved_candidate_id"] = node_id
            add_edge(
                edges, ref_id, node_id, "disposition_resolves_to_candidate",
                "hidden_candidate_target_not_sequence_approved",
                area_id=ref.get("area_id"), rationale=record.get("rationale"),
                student_visible=False, sequence_approved=False,
            )
        elif decision == "unsupported_hidden":
            counts["unsupported_reference_records"] += 1
            ref["resolution_status"] = "dispositioned_unsupported_hidden"
            ref["final_hidden_reason"] = record.get("remaining_limitation") or record.get("rationale")
        else:
            raise ValueError(f"Unrecognized disposition {decision!r} for {ref_id}")

    return {
        "status": "all_typed_references_dispositioned_hidden_sequence_unapproved",
        "reference_records": len(by_id),
        "resolved_reference_records": counts["resolved_reference_records"],
        "resolved_target_links": counts["resolved_target_links"],
        "annotation_reference_records": counts["annotation_reference_records"],
        "new_candidate_reference_records": counts["new_candidate_reference_records"],
        "unique_hidden_candidate_items": len(new_candidate_ids),
        "unsupported_reference_records": counts["unsupported_reference_records"],
        "unresolved_reference_records": 0,
        "sequence_critical_records_dispositioned_not_approved": sum(
            record.get("raw_relationship_type") in {"requires", "builds_on", "prerequisite", "prerecedes", "precedes"}
            for record in records
        ),
        "student_visible": False,
        "sequence_approved": False,
        "handoff_artifacts": artifacts,
        "records": records,
        "local_reconciliation": [
            record for record in records if record.get("local_reconciliation_note")
        ],
    }


def apply_sequence_direction_review(nodes: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Attach local sequence interpretation without approving or exposing it."""
    if not SEQUENCE_DIRECTION_REVIEW.exists():
        raise FileNotFoundError(f"Missing D078 sequence-direction review: {SEQUENCE_DIRECTION_REVIEW}")
    review = json.loads(SEQUENCE_DIRECTION_REVIEW.read_text(encoding="utf-8"))
    if review.get("domain_id") != "D078":
        raise ValueError("Sequence-direction review must be scoped to D078")
    if review.get("student_visible") or review.get("sequence_approved"):
        raise ValueError("Local sequence review cannot approve visibility or final sequence")
    source_checks = review.get("source_checks") or []
    check_by_area: dict[str, dict[str, Any]] = {}
    for check in source_checks:
        artifact = ROOT / str(check.get("artifact", ""))
        if check.get("status") != "completed_opened_record_specific_sources" or not artifact.is_file():
            raise ValueError(f"Sequence source check is incomplete or missing: {check.get('artifact')}")
        for area_id in check.get("area_ids", []):
            if area_id in check_by_area:
                raise ValueError(f"Overlapping sequence source-check coverage for {area_id}")
            check_by_area[area_id] = check

    critical_types = {"requires", "builds_on", "prerequisite", "prerecedes", "precedes"}
    critical_refs = {
        node_id: node for node_id, node in nodes.items()
        if node.get("reference_type") in critical_types
    }
    reviewed: dict[str, dict[str, Any]] = {}
    for row in review.get("records", []):
        ref_id = row.get("reference_id")
        if not ref_id or ref_id in reviewed:
            raise ValueError(f"Missing or duplicate sequence review reference ID: {ref_id!r}")
        reviewed[ref_id] = row
    missing = sorted(set(critical_refs) - set(reviewed))
    stale = sorted(set(reviewed) - set(critical_refs))
    if missing or stale:
        raise ValueError(
            "Sequence review must exactly cover critical relationship references; "
            f"missing={missing[:5]} ({len(missing)}), stale={stale[:5]} ({len(stale)})"
        )

    interpretations: Counter[str] = Counter()
    for ref_id, row in reviewed.items():
        node = critical_refs[ref_id]
        source_check = check_by_area.get(node.get("area_id"))
        if not source_check:
            raise ValueError(f"No independent source check covers sequence reference {ref_id}")
        for target_id in row.get("candidate_prerequisite_node_ids", []):
            if target_id not in nodes:
                raise ValueError(f"Sequence review names an unresolved candidate node: {ref_id} -> {target_id}")
        node["local_sequence_review_status"] = review.get("status")
        node["sequence_interpretation"] = row["interpretation"]
        node["sequence_action"] = row["sequence_action"]
        node["sequence_review_note"] = row["note"]
        node["candidate_prerequisite_node_ids"] = row.get("candidate_prerequisite_node_ids", [])
        node["sequence_source_check_status"] = source_check["status"]
        node["sequence_source_check_artifact"] = source_check["artifact"]
        node["sequence_approved"] = False
        node["student_visible"] = False
        interpretations[row["interpretation"]] += 1

    return {
        "status": review.get("status"),
        "review_artifact": str(SEQUENCE_DIRECTION_REVIEW.relative_to(ROOT)).replace("\\", "/"),
        "reference_records": len(reviewed),
        "unreviewed_critical_references": 0,
        "interpretation_counts": dict(sorted(interpretations.items())),
        "source_checks": source_checks,
        "candidate_sequence_edges_created": 0,
        "student_visible": False,
        "sequence_review_complete": True,
        "sequence_approved": False,
        "note": "This local direction review distinguishes learning order from workflow conditions and annotations. It creates no sequence edges and grants no student visibility pending exact edge integration and full route review.",
    }


def add_sociology_programme_route(
    graph: dict[str, Any], nodes: dict[str, dict[str, Any]], edges: list[dict[str, Any]]
) -> dict[str, Any]:
    """Attach fixed Sociology curriculum context and the hidden D078 route transition."""
    theme_audit = load_json(SOCIOLOGY_THEME_AUDIT)
    curriculum = load_json(SOCIOLOGY_CURRICULUM_CONTRACT)
    programme_evidence = load_json(PROGRAMME_DOMAIN_EVIDENCE).get("Social Sciences::Sociology::D078")
    if not theme_audit.get("pass") or theme_audit.get("activeThemeCount") != 14:
        raise ValueError("Sociology theme audit must pass with 14 active themes")
    if theme_audit.get("courseMapCount") != 34 or theme_audit.get("contractCourseCount") != 34:
        raise ValueError("Sociology theme and curriculum contract course counts must agree")
    if not programme_evidence or programme_evidence.get("match_type") != "direct":
        raise ValueError("A direct programme-to-D078 evidence record is required")
    if programme_evidence.get("course_anchor_quality") != "strong" or programme_evidence.get("course_anchor_count") != 19:
        raise ValueError("Expected strong Sociology-to-D078 mapping with 19 course anchors")
    if programme_evidence.get("transferable_evidence_count", 0) < 1:
        raise ValueError("Programme-to-domain evidence has no transferable evidence rows")
    if curriculum.get("programme", {}).get("code") != "SOC" or len(curriculum.get("programme", {}).get("courses", [])) != 34:
        raise ValueError("Sociology curriculum contract identity/count is unexpected")
    if "domain:D078" not in nodes:
        raise ValueError("D078 route node is missing")

    programme_id = "programme:social-sciences:sociology"
    programme_node = {
        "id": programme_id,
        "kind": "programme_context",
        "label": "Sociology (B.Sc.)",
        "programme_code": "SOC",
        "domain_id": "D078",
        "curriculum_course_count": 34,
        "theme_count": len(theme_audit["themes"]),
        "fixed_curriculum": True,
        "selectable": False,
        "student_visible": False,
        "approval": "hidden_route_design_candidate_not_student_approved",
        "source_artifacts": [
            str(SOCIOLOGY_CURRICULUM_CONTRACT.relative_to(ROOT)).replace("\\", "/"),
            str(SOCIOLOGY_THEME_AUDIT.relative_to(ROOT)).replace("\\", "/"),
            str(PROGRAMME_DOMAIN_EVIDENCE.relative_to(ROOT)).replace("\\", "/"),
        ],
        "scope_note": "The 14 student-facing themes are evidence-traceable groupings of fixed CCMAS course content, not official CCMAS theme labels and not optional extra-learning selections.",
    }
    if programme_id in nodes and nodes[programme_id] != programme_node:
        raise ValueError("Existing Sociology programme context node conflicts with the audited source")
    nodes[programme_id] = programme_node

    theme_ids: list[str] = []
    for theme in theme_audit["themes"]:
        theme_id = f"programme-theme:sociology:{theme['themeKey']}"
        course_codes = list(theme.get("courseCodes", []))
        course_map = {course.get("code"): course for course in curriculum["programme"]["courses"]}
        missing_courses = [code for code in course_codes if code not in course_map]
        if missing_courses:
            raise ValueError(f"Theme {theme['themeKey']} references missing curriculum courses: {missing_courses}")
        theme_node = {
            "id": theme_id,
            "kind": "programme_theme",
            "programme_id": programme_id,
            "theme_key": theme["themeKey"],
            "label": theme["title"],
            "description": theme["themeDescription"],
            "narration": theme["narration"],
            "course_count": len(course_codes),
            "course_anchors": [
                {
                    "course_code": code,
                    "course_title": course_map[code]["title"],
                    "display_group": course_map[code].get("displayGroup"),
                }
                for code in course_codes
            ],
            "fixed_curriculum": True,
            "selectable": False,
            "student_visible": False,
            "approval": "hidden_route_design_candidate_not_student_approved",
            "source_artifacts": programme_node["source_artifacts"][:2],
            "curriculum_source_label": curriculum.get("sourceAuthority", {}).get("originalPdf"),
        }
        if theme_id in nodes and nodes[theme_id] != theme_node:
            raise ValueError(f"Existing programme theme node conflicts with audit: {theme_id}")
        nodes[theme_id] = theme_node
        theme_ids.append(theme_id)
        add_edge(edges, theme_id, programme_id, "fixed_curriculum_theme_of", "hidden_route_context_candidate")

    transition_id = "sequence:programme-sociology-to-domain-d078"
    transition = {
        "id": transition_id,
        "source": programme_id,
        "target": "domain:D078",
        "relationship": "programme_to_domain_context",
        "status": "hidden_direct_mapping_candidate",
        "match_type": "direct",
        "course_anchor_quality": "strong",
        "course_anchor_count": 19,
        "transferable_evidence_count": programme_evidence["transferable_evidence_count"],
        "evidence_key": "Social Sciences::Sociology::D078",
        "evidence_artifact": str(PROGRAMME_DOMAIN_EVIDENCE.relative_to(ROOT)).replace("\\", "/"),
        "student_facing_explanation": "The Sociology programme provides the learner's starting context. The Social Sciences domain then broadens that foundation into connected ways of studying people, institutions and society; domain enrichment is not being described as CCMAS-taught content.",
        "student_visible": False,
        "sequence_approved": False,
    }
    existing = [edge for edge in edges if edge.get("id") == transition_id]
    if existing and existing[0] != transition:
        raise ValueError("Existing programme-to-domain transition conflicts with the evidence record")
    if not existing:
        edges.append(transition)

    path_definition = {
        "status": "approved_route_sequence_hidden_until_release",
        "ordered_layers": [
            {"layer": "programme_context", "node_id": programme_id, "fixed_curriculum": True, "selectable": False},
            {"layer": "shared_domain_foundation", "node_id": "domain:D078", "selectable": "approved supplemental items only"},
            {"layer": "selected_area_of_specialization", "node_ids": sorted(n["id"] for n in nodes.values() if n.get("kind") == "area_of_specialization"), "selection": "one or more"},
            {"layer": "optional_role", "selection": "zero or more; shown only when chosen"},
        ],
        "branch_rules": [
            "Area-specific additions attach only to the selected area; shared domain learning is inherited without duplication.",
            "Role-specific additions attach only to the selected role and its supported area/domain route.",
            "Prerequisites, complements, alternatives and conditional task safeguards remain distinct; selection does not imply mastery.",
            "Saving at programme/domain level does not silently import area or role detail; unselected areas may be shown as advisory choices.",
        ],
        "fixed_curriculum_theme_node_ids": sorted(theme_ids),
        "programme_domain_transition_edge_id": transition_id,
        "student_visible": False,
        "sequence_approved": True,
    }
    graph["learning_path_design"] = path_definition
    return {
        "programme_node_id": programme_id,
        "programme_theme_nodes": len(theme_ids),
        "programme_domain_transition_edges": 1,
        "course_anchor_count": programme_evidence["course_anchor_count"],
        "course_anchor_quality": programme_evidence["course_anchor_quality"],
        "student_visible": False,
        "sequence_approved": True,
    }


def add_candidate_sequence_edges(
    nodes: dict[str, dict[str, Any]], edges: list[dict[str, Any]], review: dict[str, Any]
) -> dict[str, Any]:
    """Add approved, source-checked sequence rules while keeping them hidden until release."""
    known_refs = {
        node_id for node_id, node in nodes.items()
        if node.get("reference_type") in {"requires", "builds_on", "prerequisite", "prerecedes", "precedes"}
    }
    edge_ids = {edge.get("id") for edge in edges if edge.get("id")}
    added = 0
    approved_rows = review.get("strict_learning_dependencies", [])
    if len(approved_rows) != 3 or review.get("sequence_approved") is not True:
        raise ValueError("The approved full-path sequence design must contain exactly three approved dependencies")
    for row in approved_rows:
        if row.get("status") != "approved_route_scoped_sequence_hidden_until_release":
            raise ValueError(f"Sequence edge is not approved, source-supported and route-scoped: {row.get('id')}")
        if row.get("student_visible") or row.get("sequence_approved") is not True:
            raise ValueError(f"Approved sequence edge must remain hidden and explicitly approved: {row.get('id')}")
        if row.get("source") not in nodes or row.get("target") not in nodes:
            raise ValueError(f"Sequence edge endpoint missing: {row.get('id')}")
        if not row.get("route_scope") or not row.get("condition") or not row.get("evidence_reference_ids"):
            raise ValueError(f"Sequence edge is missing scope, condition or evidence: {row.get('id')}")
        if not row.get("source_check_artifact") or not (ROOT / row["source_check_artifact"]).is_file():
            raise ValueError(f"Sequence edge lacks its source-check artifact: {row.get('id')}")
        if any(ref_id not in known_refs for ref_id in row["evidence_reference_ids"]):
            raise ValueError(f"Sequence edge cites an unknown reviewed reference: {row.get('id')}")
        if row["id"] in edge_ids:
            raise ValueError(f"Duplicate sequence candidate edge: {row['id']}")
        edge = {
            "id": row["id"],
            "source": row["source"],
            "target": row["target"],
            "relationship": row["relationship"],
            "status": row["status"],
            "route_scope": row["route_scope"],
            "condition": row["condition"],
            "evidence_reference_ids": row["evidence_reference_ids"],
            "source_check_artifact": row["source_check_artifact"],
            "sequence_approved": True,
            "student_visible": False,
            "approval_basis": row.get("approval_basis"),
        }
        edges.append(edge)
        edge_ids.add(row["id"])
        added += 1
    return {
        "approved_sequence_edges_created": added,
        "candidate_sequence_edges_created": added,
        "sequence_approved": added == 3,
        "student_visible": False,
    }


def attach_full_path_sequence_design(graph: dict[str, Any]) -> dict[str, Any]:
    """Embed local sequence dispositions in the hidden graph without approval.

    The design sidecar is an input to the graph build, but its hard-order
    candidates remain unapproved and invisible. This records why the other
    direct area order-like declarations do not constrain learner sequence.
    """
    if not FULL_PATH_SEQUENCE_DESIGN.is_file():
        raise FileNotFoundError(
            "Run audit_d078_full_path_sequence_design_2026_10_12.py before "
            "rebuilding the D078 graph so sequence dispositions are available."
        )
    design = load_json(FULL_PATH_SEQUENCE_DESIGN)
    dispositions = design.get("direct_area_order_dispositions", [])
    dependencies = design.get("strict_learning_dependencies", [])
    if len(dispositions) != 27 or design.get("direct_area_order_declaration_count") != 27:
        raise ValueError("Full-path sequence design must disposition all 27 direct area order declarations")
    if len(dependencies) != 3 or design.get("strict_learning_dependency_count") != 3:
        raise ValueError("Full-path sequence design must carry exactly three route-scoped dependency candidates")
    if design.get("student_visible") or design.get("canonical_promotion"):
        raise ValueError("Full-path sequence design cannot promote student visibility or canonical state")
    if any(row.get("hard_learning_dependency") or row.get("student_visible") for row in dispositions):
        raise ValueError("Direct area dispositions cannot silently become hard dependencies or visible relations")
    if design.get("sequence_approved") is not True or any(
        row.get("sequence_approved") is not True or row.get("student_visible")
        for row in dependencies
    ):
        raise ValueError("All three route-scoped sequence decisions must be approved and remain hidden")

    embedded = {
        "status": "sequence_design_approved_hidden_release_gates_open",
        "route_layers": design.get("route_layers", []),
        "direct_area_order_declaration_count": len(dispositions),
        "direct_area_order_dispositions": dispositions,
        "strict_learning_dependency_candidate_count": len(dependencies),
        "strict_learning_dependencies": dependencies,
        "raw_role_prerequisite_notes_not_hard_edges": design.get("raw_role_prerequisite_notes_not_hard_edges"),
        "sequence_approved": True,
        "student_visible": False,
        "canonical_promotion": False,
        "design_document": "docs/manual-review/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.md",
        "audit_artifact": str(FULL_PATH_SEQUENCE_DESIGN.relative_to(ROOT)).replace("\\", "/"),
    }
    graph.setdefault("area_reconciliation", {}).setdefault("relationship_graph", {})[
        "full_path_sequence_design"
    ] = embedded
    return embedded


def main() -> None:
    # Recreate the unexpanded baseline first, so reruns are deterministic and
    # never accumulate duplicate nodes/edges from a previous expanded graph.
    baseline_builder = AUDIT / "build_d078_programme_to_role_learning_path_graph_2026_10_10.py"
    subprocess.run([sys.executable, str(baseline_builder)], cwd=ROOT, check=True)
    graph = load_json(GRAPH)
    roles = load_json(ROLES_FILE)
    nodes: dict[str, dict[str, Any]] = {n["id"]: n for n in graph["nodes"]}
    edges = list(graph["edges"])
    source_artifacts = list(graph.get("source_artifacts", []))
    lane_documents = {lane: load_json(LANES / filename)
                      for lane, filename in LANE_FILES.items()}
    all_lane_paths = [f"data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/{f}"
                      for f in LANE_FILES.values()]

    # Index the current seven area nodes already materialized by the base graph.
    area_nodes = {}
    for node in nodes.values():
        if node.get("kind") == "area_of_specialization":
            key = area_key(node.get("area_id")) or area_key(node.get("label"))
            if key:
                area_nodes[key] = node["id"]
    if set(area_nodes) != set(AREA_LABELS):
        raise ValueError(f"Base graph does not contain exactly the seven current areas: {sorted(area_nodes)}")

    # Preserve the old graph's area tasks/items, then append every distinct item
    # and task family from the three disjoint enrichment lanes. Duplicate IDs are
    # represented once with all source artifacts and parent task links retained.
    task_nodes: dict[str, str] = {}
    item_nodes: dict[str, str] = {}
    lane_counts: dict[str, dict[str, int]] = {}

    def insert_task(task_id: object, area_value: object, label: object,
                    payload: dict[str, Any], lane: str, source_path: str) -> str | None:
        akey = area_key(area_value)
        if not akey:
            raise ValueError(f"Task family has missing/non-current area: {task_id!r} in {source_path}")
        raw_id = str(task_id or label or "unnamed-task")
        node_id = f"area-task:{slug(raw_id)}"
        if node_id not in nodes:
            nodes[node_id] = {
                "id": node_id, "kind": "area_task_family", "task_family_id": raw_id,
                "area_id": akey, "label": str(label or raw_id),
                "student_visible": False, "approval": "area_candidate_not_student_approved",
                "source_artifacts": [source_path], "lane": lane,
                "source_record": payload,
            }
        else:
            old = nodes[node_id]
            if old.get("area_id") != akey:
                raise ValueError(f"Task ID collision across areas: {raw_id}")
            old.setdefault("source_artifacts", [])
            if source_path not in old["source_artifacts"]:
                old["source_artifacts"].append(source_path)
            old.setdefault("source_records", []).append({"lane": lane, "record": payload})
        task_nodes[raw_id] = node_id
        add_edge(edges, area_nodes[akey], node_id, "area_to_task_family", "area_candidate")
        return node_id

    def insert_item(item: dict[str, Any], area_value: object, task_ref: object,
                    lane: str, source_path: str) -> None:
        akey = area_key(area_value)
        raw_id = str(item.get("item_id") or item.get("id") or
                     f"{akey}:{task_ref or 'unassigned'}:{item.get('label') or 'unnamed-item'}")
        if not akey:
            raise ValueError(f"Area item {raw_id!r} has missing/non-current area in {source_path}")
        application_reference = item.get("type") == "tool_application_reference"
        node_kind = "area_tool_application_reference" if application_reference else "area_enrichment_item"
        node_id = f"{node_kind}:{slug(raw_id)}"
        if node_id not in nodes:
            nodes[node_id] = {
                "id": node_id, "kind": node_kind, "item_id": raw_id,
                "label": item.get("label") or raw_id,
                "item_type": item.get("type"), "area_id": akey,
                "student_visible": False, "approval": "area_candidate_not_student_approved",
                "source_artifacts": [source_path], "lane": lane,
                "source_record": item,
            }
        else:
            old = nodes[node_id]
            if old.get("area_id") != akey:
                raise ValueError(f"Item ID collision across areas: {raw_id}")
            old.setdefault("source_artifacts", [])
            if source_path not in old["source_artifacts"]:
                old["source_artifacts"].append(source_path)
            old.setdefault("source_records", []).append({"lane": lane, "record": item})
        item_nodes[raw_id] = node_id
        if task_ref:
            ref = str(task_ref)
            parent = task_nodes.get(ref) or f"area-task:{slug(ref)}"
            if parent in nodes:
                add_edge(edges, parent, node_id, "task_to_area_item", "area_candidate")
        add_edge(edges, area_nodes[akey], node_id, "area_to_learning_item", "area_candidate")

    # Areas 1-2: detailed items, completed synthesis package, and fallback.
    lane = "area_01_02_deep"
    doc = lane_documents[lane]
    path = all_lane_paths[list(LANE_FILES).index(lane)]
    family_area: dict[str, str] = {}
    family_payload: dict[str, dict[str, Any]] = {}
    for family in doc.get("area_task_families", []):
        fid = family.get("id")
        fam_node = insert_task(fid, family.get("area"), family.get("name"), family, lane, path)
        family_area[str(fid)] = str(family.get("area"))
        family_payload[str(fid)] = family
        for ref in family.get("items", []):
            family_area.setdefault(str(ref), str(family.get("area")))
            item_nodes.setdefault(str(ref), "")
    item_map = {str(x.get("id")): x for x in doc.get("items", []) if x.get("id")}
    complete_lane = lane_documents["area_01_02_complete"]
    complete_path = all_lane_paths[list(LANE_FILES).index("area_01_02_complete")]
    for area in complete_lane.get("areas", []):
        akey = area_key(area.get("area_id"))
        for family in area.get("task_families", []):
            fid = family.get("task_id")
            insert_task(fid, akey, family.get("name"), family, "area_01_02_complete", complete_path)
            family_area[str(fid)] = akey or ""
            family_payload[str(fid)] = family
            for item in family.get("candidate_items", family.get("items", [])):
                if isinstance(item, dict):
                    insert_item(item, akey, fid, "area_01_02_complete", complete_path)
                    item_map.setdefault(str(item.get("id") or item.get("item_id")), item)
                else:
                    found = item_map.get(str(item))
                    if found:
                        insert_item(found, akey, fid, "area_01_02_deep", path)
    # Ensure every research item is included, even if its family reference is indirect.
    for item_id, item in item_map.items():
        if item_id in item_nodes and item_nodes[item_id]:
            continue
        akey = next((area_key(family_area.get(str(f.get("id")))) for f in doc.get("area_task_families", [])
                     if item_id in [str(x) for x in f.get("items", [])]), None)
        if not akey:
            # IDs are namespaced SOC-/ECO- in the source ledger; this is a stable
            # item-identity cue, not a role or area-fit inference.
            akey = "D078:sociology-social-anthropology" if item_id.startswith("SOC-") else None
            if item_id.startswith("ECO-"):
                akey = "D078:economics-applied-analysis"
        if not akey:
            raise ValueError(f"Cannot resolve area ownership for item {item_id}")
        insert_item(item, akey, None, "area_01_02_deep", path)

    fallback_lane = lane_documents["area_01_02_fallback"]
    fallback_path = all_lane_paths[list(LANE_FILES).index("area_01_02_fallback")]
    for area in fallback_lane.get("areas", []):
        akey = area_key(area.get("area_id"))
        for family in area.get("task_families", []):
            insert_task(family.get("task_id"), akey, family.get("task_wording"), family,
                        "area_01_02_fallback", fallback_path)
            for item in family.get("learning_items", []):
                if isinstance(item, dict):
                    insert_item(item, akey, family.get("task_id"), "area_01_02_fallback", fallback_path)

    # Areas 3-4: base, extension, and emerging supplement.
    base_lane = lane_documents["area_03_04_base"]
    base_path = all_lane_paths[list(LANE_FILES).index("area_03_04_base")]
    for area in base_lane.get("areas", []):
        akey = area_key(area.get("area_id"))
        for family in area.get("task_families", []):
            insert_task(family.get("task_id"), akey, family.get("name"), family,
                        "area_03_04_base", base_path)
            for item in family.get("items", []):
                if isinstance(item, dict):
                    insert_item(item, akey, family.get("task_id"), "area_03_04_base", base_path)
        for item in area.get("area_owned_additions", []):
            if isinstance(item, dict):
                insert_item(item, akey, item.get("task_family_id"), "area_03_04_base", base_path)

    for lane in ("area_03_04_extended", "area_03_04_emerging"):
        doc = lane_documents[lane]
        path = all_lane_paths[list(LANE_FILES).index(lane)]
        for family in doc.get("task_families", []):
            akey = area_key(family.get("area_id"))
            family_id = family.get("task_family_id") or family.get("task_id")
            insert_task(family_id, akey, family.get("label") or family.get("name"), family, lane, path)
            for item in family.get("items", []):
                if isinstance(item, dict):
                    if item.get("owner_type") == "domain" or item.get("route_ownership") == "domain":
                        continue
                    if item.get("type") == "tool_application_reference":
                        ref_node = f"area_tool_application_reference:{slug(item.get('item_id') or item.get('label'))}"
                        insert_item(item, akey, family_id, lane, path)
                        domain_tool = None
                        label_norm = norm(item.get("label"))
                        if "networkx" in label_norm:
                            domain_tool = "domain-item:d078-networkx-tool"
                        elif "casevo" in label_norm:
                            domain_tool = "domain-item:d078-casevo-tool"
                        if domain_tool in nodes:
                            add_edge(edges, domain_tool, ref_node,
                                     "domain_tool_applied_within_area",
                                     "area_application_reference_not_new_domain_item",
                                     student_visible=False)
                        continue
                    insert_item(item, akey, family_id, lane, path)
        for item in doc.get("candidate_items", []):
            # Some records are explicitly references to already-existing domain
            # candidates; keep them in the lineage manifest, not as area items.
            ownership = str(item.get("route_ownership") or item.get("ownership") or "").lower()
            if ownership in {"domain", "domain_foundation", "inherited_domain"} or item.get("type") == "tool_application_reference":
                continue
            akey = area_key(item.get("area_id") or item.get("area"))
            if not akey:
                for family in doc.get("task_families", []):
                    candidate_ids = family.get("candidate_item_ids", [])
                    if item.get("item_id") in candidate_ids:
                        akey = area_key(family.get("area_id"))
                        break
            if not akey:
                raise ValueError(f"Unowned area candidate {item.get('item_id')} in {path}")
            insert_item(item, akey, item.get("task_family_id"), lane, path)

    # Areas 5-7: preserve each separately enriched item and task family.
    lane = "area_05_07"
    doc = lane_documents[lane]
    path = all_lane_paths[list(LANE_FILES).index(lane)]
    for area in doc.get("areas", []):
        akey = area_key(area.get("area_id"))
        for family in area.get("task_families", []):
            insert_task(family.get("task_id"), akey, family.get("task_wording"), family,
                        lane, path)
        for item in area.get("area_owned_additions", []):
            if isinstance(item, dict):
                insert_item(item, akey, item.get("task_family_id"), lane, path)

    # Preserve the separate D078-wide emerging supplement as hidden domain
    # candidates. This adds no area/role ownership and does not reopen fit.
    # The items must remain visible in the audit graph so later reconciliation
    # cannot silently omit a researched candidate from the planned inventory.
    supplement_path = str(EMERGING_SUPPLEMENT.relative_to(ROOT)).replace("\\", "/")
    disposition_doc = load_json(EMERGING_DISPOSITION)
    disposition_by_id = {row["candidate_id"]: row for row in disposition_doc.get("records", [])}
    supplement_doc = load_json(EMERGING_SUPPLEMENT)
    supplement_candidates = supplement_doc.get("candidate_task_sets", [])
    if set(disposition_by_id) != {str(row.get("id")) for row in supplement_candidates}:
        raise ValueError("D078 emerging supplement and its disposition have mismatched candidate IDs")

    domain_item_by_key: dict[str, str] = {}
    for node_id, node in nodes.items():
        if node.get("kind") == "domain_learning_item":
            for value in (node.get("contract_id"), node.get("label")):
                if value:
                    domain_item_by_key[norm(value)] = node_id
    supplement_node_ids: dict[str, str] = {}
    for candidate in supplement_candidates:
        candidate_id = str(candidate["id"])
        disposition = disposition_by_id[candidate_id]
        node_id = f"domain-supplement:{slug(candidate_id)}"
        if node_id in nodes:
            raise ValueError(f"Duplicate D078 supplement graph node: {node_id}")
        nodes[node_id] = {
            "id": node_id,
            "kind": "domain_supplement_candidate",
            "item_id": candidate_id,
            "item_type": candidate.get("maturity"),
            "label": candidate.get("label"),
            "layer": candidate.get("placement"),
            "candidate_disposition": disposition.get("disposition"),
            "resource_link_disposition": disposition.get("resource_link_disposition"),
            "verified_free_task_specific_learning_link": disposition.get("verified_free_task_specific_learning_link"),
            "official_reference_links": candidate.get("official_reference_links", []),
            "free_learning_links": candidate.get("free_learning_links", []),
            "video_learning_links": candidate.get("video_learning_links", []),
            "paid_learning_alternatives": candidate.get("paid_learning_alternatives", []),
            "prerequisite_item_ids": disposition.get("prerequisite_item_ids", []),
            "complement_item_ids": disposition.get("complement_item_ids", []),
            "distinct_from_item_ids": disposition.get("distinct_from", []),
            "source_artifacts": [supplement_path],
            "student_visible": False,
            "approval": "domain_supplement_candidate_not_route_approved",
            "area_ownership": "not_assigned_pending_area_task_evidence",
            "role_ownership": "not_assigned_role_fit_audit_closed",
            "source_record": candidate,
            "local_disposition_record": disposition,
        }
        supplement_node_ids[candidate_id] = node_id
        add_edge(edges, "domain:D078", node_id, "domain_to_supplement_candidate",
                 "candidate_inventory_only", student_visible=False)

    for candidate in supplement_candidates:
        candidate_id = str(candidate["id"])
        row = disposition_by_id[candidate_id]
        node_id = supplement_node_ids[candidate_id]
        for prereq in row.get("prerequisite_item_ids", []):
            target = domain_item_by_key.get(norm(prereq))
            if target:
                add_edge(edges, target, node_id, "prerequisite_for",
                         "candidate_relationship_not_sequence_approved", student_visible=False)
        for complement in row.get("complement_item_ids", []):
            target = domain_item_by_key.get(norm(complement))
            if target:
                add_edge(edges, node_id, target, "works_with",
                         "candidate_relationship_not_sequence_approved", student_visible=False)
        for distinct in row.get("distinct_from", []):
            target = domain_item_by_key.get(norm(distinct))
            if target:
                add_edge(edges, node_id, target, "distinct_from",
                         "candidate_distinction_not_sequence_approved", student_visible=False)

    # Attach the locally repaired item-context fields to their exact area nodes.
    # The overlay enriches the graph for reconciliation, but does not approve
    # learner visibility or alter the existing item/area/role route decisions.
    context_overlay_path = str(AREA_ITEM_CONTEXT_OVERLAY.relative_to(ROOT)).replace("\\", "/")
    context_overlay = load_json(AREA_ITEM_CONTEXT_OVERLAY)
    context_nodes = {
        str(node.get("item_id")): node for node in nodes.values()
        if node.get("kind") in {"area_enrichment_item", "area_learning_item", "area_tool_application_reference"}
        and node.get("item_id")
    }
    context_rows = context_overlay.get("records", [])
    expected_alternative_ids = {
        "SOC-K1", "SOC-C1", "SOC-C2", "SOC-C3",
        "ECON-K1", "ECON-C1", "ECON-C2", "ECON-C3",
    }
    actual_alternative_ids = {
        row["item_id"] for row in context_rows
        if "alternative_disposition" in row.get("proposed_fields", {})
    }
    if context_rows and actual_alternative_ids != expected_alternative_ids:
        raise ValueError(
            "Area-item alternative dispositions differ from the audited gap set: "
            f"missing={sorted(expected_alternative_ids - actual_alternative_ids)}, "
            f"unexpected={sorted(actual_alternative_ids - expected_alternative_ids)}"
        )
    unmatched_context_ids = sorted(str(row.get("item_id")) for row in context_rows
                                   if str(row.get("item_id")) not in context_nodes)
    if unmatched_context_ids:
        raise ValueError(f"Area-item content overlay IDs do not resolve to graph nodes: {unmatched_context_ids}")
    for row in context_rows:
        node = context_nodes[str(row["item_id"])]
        if node.get("area_id") != row.get("area_id"):
            raise ValueError(f"Area-item content overlay has mismatched area for {row['item_id']}")
        if node.get("student_visible"):
            raise ValueError(f"Area-item overlay cannot silently approve visibility: {row['item_id']}")
        node["learning_context_reconciliation"] = row
        node["learning_context_reconciliation_status"] = row.get("status")
        if context_overlay_path not in node.setdefault("source_artifacts", []):
            node["source_artifacts"].append(context_overlay_path)

    # Add role entities and connect them only through the existing canonical
    # D078 route decisions. This consumes, but does not reopen, role-fit review.
    role_nodes: dict[str, str] = {}
    eligible_roles: dict[str, dict[str, Any]] = {}
    excluded_roles = Counter()
    for role in roles:
        if role.get("domain_id") != "D078":
            continue
        number = role.get("role_number")
        name = role.get("role_name") or f"D078 role {number}"
        role_key = f"{number}:{slug(name)}"
        node_id = f"role:D078:{role_key}"
        domain_route = next((route for route in role.get("role_domain_routes", [])
                             if route.get("domain_id") == "D078"), None)
        domain_status = domain_route.get("status") if domain_route else None
        area_routes = [route for route in role.get("role_area_routes", [])
                       if area_key(route.get("area_id"))]
        area_routes = [route for route in area_routes
                       if route.get("status") in {"supported", "conditional"}]
        unsupported = domain_status in {"unsupported", "review_required", None} or role.get("specialization_fit_status") == "unsupported"
        if area_routes and domain_status not in {"supported", "conditional"}:
            raise ValueError(f"Area route without a valid D078 domain route: {name}")
        # A pathway role must pass both reviewed gates: D078 parent fit and at
        # least one current area fit. Domain-only and area-only rows are not
        # represented as pathway roles.
        if unsupported:
            excluded_roles["unsupported_or_unresolved"] += 1
            continue
        if domain_status not in {"supported", "conditional"}:
            excluded_roles["no_supported_or_conditional_domain_route"] += 1
            continue
        if not area_routes:
            excluded_roles["domain_only_no_area_route"] += 1
            continue
        domain_evidence = (domain_route or {}).get("evidence") or {}
        node = {
            "id": node_id, "kind": "role", "role_number": number,
            "label": name, "domain_id": "D078",
            "domain_route_status": domain_status,
            "area_route_status": role.get("specialization_fit_status"),
            "student_visible": False,
            "route_policy": "existing_reviewed_route_consumed_without_reassessment",
            "domain_route_evidence": domain_evidence,
            "source_refs": domain_evidence.get("source_refs", role.get("domain_fit_review_source_refs", [])),
        }
        nodes[node_id] = node
        role_nodes[norm(name)] = node_id
        eligible_roles[norm(name)] = role

        add_edge(
            edges, "domain:D078", node_id, "domain_to_role",
            f"reviewed_{domain_status}", student_visible=False,
            route_type=domain_route.get("route_type"), evidence=domain_evidence,
            conditional_use_case=(domain_route.get("qualification") or domain_evidence.get("basis"))
            if domain_status == "conditional" else None,
        )

        for route in area_routes:
            akey = area_key(route.get("area_id"))
            details = {k: route.get(k) for k in (
                "rationale", "positive_task_evidence", "negative_neighbouring_domain_check",
                "scope_condition", "source_refs", "provenance") if route.get(k) is not None}
            add_edge(edges, area_nodes[akey], node_id, "area_to_role",
                     f"reviewed_{route['status']}", student_visible=False, **details)

    # Use the already-dispositioned role snapshots only to link a role item to
    # roles whose stored route is not unsupported; no new fit decision is made.
    placement_path = AUDIT / "D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"
    placement = load_json(placement_path)
    role_item_links = 0
    for record in placement.get("records", []):
        if record.get("final_disposition_status") != "approved_for_provisional_d078_learning_path":
            continue
        item_id = f"role-item:{record['queue_position']}:{slug(record.get('pair_key') or record.get('label') or record['queue_position'])}"
        if item_id not in nodes:
            continue
        for role_name in record.get("roles_snapshot", []):
            role_id = role_nodes.get(norm(role_name))
            if role_id and norm(role_name) in eligible_roles:
                add_edge(edges, item_id, role_id, "role_item_candidate_for_role",
                         "existing_role_item_disposition_route_context", student_visible=False)
                role_item_links += 1

    # Confirm all area identities in output are current and exclusively the seven
    # approved area IDs; do not derive any area from old taxonomy fields.
    area_ids_in_graph = {node.get("area_id") for node in nodes.values()
                         if node.get("kind") == "area_of_specialization"}
    if area_ids_in_graph != set(AREA_LABELS):
        raise ValueError(f"Unexpected area output: {sorted(str(x) for x in area_ids_in_graph)}")
    for edge in edges:
        if edge.get("relationship") == "area_to_role":
            target = nodes[edge["target"]]
            if target.get("domain_id") != "D078" or edge["source"] not in area_nodes.values():
                raise ValueError("Area-role edge escapes the current D078 area set")

    # Reconcile domain-item area suggestions against the complete merged area
    # task-family inventory. Only same-area task references receive explicit
    # hidden candidate edges; missing or foreign-area references remain visible
    # as audit findings rather than being treated as valid learning links.
    route_crosswalk = load_json(DOMAIN_AREA_ROUTE_CROSSWALK)
    domain_contract_nodes = {
        str(node.get("contract_id")): node["id"]
        for node in nodes.values()
        if node.get("kind") == "domain_learning_item" and node.get("contract_id")
    }
    task_by_ref = {}
    for node in nodes.values():
        if node.get("kind") == "area_task_family":
            task_ref = str(node.get("task_family_id") or "")
            if task_ref:
                task_by_ref[task_ref] = node
                task_by_ref[slug(task_ref)] = node
                if task_ref.startswith("D078:"):
                    unprefixed = task_ref.removeprefix("D078:")
                    task_by_ref[unprefixed] = node
                    task_by_ref[slug(unprefixed)] = node
    crosswalk_route_audit = {
        "crosswalk_records": len(route_crosswalk.get("records", [])),
        "area_routes": 0,
        "same_area_task_references": 0,
        "unresolved_task_references": [],
        "wrong_area_task_references": [],
        "missing_domain_items": [],
        "missing_areas": [],
        "hidden_area_candidate_edges": 0,
    }
    for record in route_crosswalk.get("records", []):
        item_id = str(record.get("domain_item_id") or "")
        item_node_id = domain_contract_nodes.get(item_id)
        if not item_node_id:
            crosswalk_route_audit["missing_domain_items"].append(item_id)
            continue
        for route in record.get("area_routes", []):
            area_id = str(route.get("area_id") or "")
            target_area = area_nodes.get(area_key(area_id) or "")
            if not target_area:
                crosswalk_route_audit["missing_areas"].append(area_id)
                continue
            crosswalk_route_audit["area_routes"] += 1
            task_audit = []
            valid_task_nodes = []
            for reference in route.get("task_family_ids", []):
                raw_ref = str(reference)
                unprefixed_ref = raw_ref.removeprefix("D078:")
                task_node = (task_by_ref.get(raw_ref) or task_by_ref.get(slug(raw_ref))
                             or task_by_ref.get(unprefixed_ref) or task_by_ref.get(slug(unprefixed_ref)))
                if not task_node:
                    task_audit.append({"task_family_id": raw_ref, "status": "unresolved_task_family_id"})
                    crosswalk_route_audit["unresolved_task_references"].append({
                        "domain_item_id": item_id, "area_id": area_id, "task_family_id": raw_ref,
                    })
                elif area_key(task_node.get("area_id")) != area_key(area_id):
                    task_audit.append({
                        "task_family_id": raw_ref, "status": "task_belongs_to_different_area",
                        "actual_area_id": task_node.get("area_id"),
                    })
                    crosswalk_route_audit["wrong_area_task_references"].append({
                        "domain_item_id": item_id, "area_id": area_id,
                        "task_family_id": raw_ref, "actual_area_id": task_node.get("area_id"),
                    })
                else:
                    task_audit.append({
                        "task_family_id": raw_ref, "status": "same_area_candidate_task",
                        "actual_area_id": task_node.get("area_id"),
                    })
                    valid_task_nodes.append(task_node["id"])
                    crosswalk_route_audit["same_area_task_references"] += 1
            item_node = nodes[item_node_id]
            routes = item_node.setdefault("candidate_area_routes", [])
            route_record = next((value for value in routes if value.get("area_id") == area_id), None)
            if route_record is None:
                route_record = {
                    "area_id": area_id,
                    "area_label": AREA_LABELS[area_key(area_id)],
                    "fit": route.get("fit"),
                    "route_condition": record.get("route_condition"),
                    "status": "candidate_route_not_student_approved",
                }
                routes.append(route_record)
            route_record["task_family_reference_audit"] = task_audit
            for task_node_id in valid_task_nodes:
                add_edge(
                    edges, item_node_id, task_node_id,
                    "candidate_domain_item_task_route", "crosswalk_same_area_task_candidate_hidden",
                    domain_item_id=item_id, area_id=area_id,
                    fit=route.get("fit"), route_condition=record.get("route_condition"),
                    student_visible=False,
                )
            area_edge = next((edge for edge in edges
                              if edge.get("source") == item_node_id
                              and edge.get("target") == target_area
                              and edge.get("relationship") == "candidate_domain_item_area_route"
                              and edge.get("domain_item_id") == item_id), None)
            if area_edge:
                area_edge["task_family_reference_audit"] = task_audit
                crosswalk_route_audit["hidden_area_candidate_edges"] += 1
    crosswalk_route_audit["missing_domain_items"] = sorted(set(crosswalk_route_audit["missing_domain_items"]))
    crosswalk_route_audit["missing_areas"] = sorted(set(crosswalk_route_audit["missing_areas"]))

    # Source lineage: retain all existing graph sources and add every lane file.
    for path in all_lane_paths:
        if path not in source_artifacts:
            source_artifacts.append(path)
    if supplement_path not in source_artifacts:
        source_artifacts.append(supplement_path)
    disposition_path = str(EMERGING_DISPOSITION.relative_to(ROOT)).replace("\\", "/")
    if disposition_path not in source_artifacts:
        source_artifacts.append(disposition_path)
    if context_overlay_path not in source_artifacts:
        source_artifacts.append(context_overlay_path)
    crosswalk_path = str(DOMAIN_AREA_ROUTE_CROSSWALK.relative_to(ROOT)).replace("\\", "/")
    if crosswalk_path not in source_artifacts:
        source_artifacts.append(crosswalk_path)
    if str(ROLES_FILE.relative_to(ROOT)).replace("\\", "/") not in source_artifacts:
        source_artifacts.append(str(ROLES_FILE.relative_to(ROOT)).replace("\\", "/"))
    if str(placement_path.relative_to(ROOT)).replace("\\", "/") not in source_artifacts:
        source_artifacts.append(str(placement_path.relative_to(ROOT)).replace("\\", "/"))

    area_candidate_items = [n for n in nodes.values() if n.get("kind") == "area_enrichment_item"]
    area_application_references = [n for n in nodes.values() if n.get("kind") == "area_tool_application_reference"]
    area_task_nodes = [n for n in nodes.values() if n.get("kind") == "area_task_family"]
    area_role_edges = [e for e in edges if e.get("relationship") == "area_to_role"]
    domain_role_edges = [e for e in edges if e.get("relationship") == "domain_to_role"]
    role_counts = Counter(e["status"] for e in area_role_edges)
    path_roles = [n for n in nodes.values() if n.get("kind") == "role"]
    graph.update({
        "schema_version": "2026-10-10.d078.programme-to-role-learning-path-graph.v2",
        "status": "hidden_sequence_approved_item_release_gates_open",
        "final_graph_ready": False,
        "graph_scope_note": "Hidden programme-to-role learning-path graph contains the 53 canonical domain contract items, eight emerging candidates, three domain-wide supplements, all seven current area task sets and 144 area enrichment candidates, plus the existing dispositioned role routes and role-item handoff. The domain-to-area task crosswalk is structurally resolved. Full-path sequence design is approved; item-level promotion decisions, rendered learner verification and explicit release approval remain separate open gates. This status does not reopen role-fit adjudication or the JAMB subject-matcher lane.",
        "source_artifacts": source_artifacts,
        "student_visible": False,
        "nodes": list(nodes.values()),
        "edges": edges,
        "area_reconciliation": {
            "current_area_ids": sorted(AREA_LABELS),
            "current_area_labels": list(AREA_LABELS.values()),
            "area_node_count": len(area_ids_in_graph),
            "old_graph_area_items_retained": sum(n.get("kind") == "area_learning_item" for n in nodes.values()),
            "new_unique_area_enrichment_items": len(area_candidate_items),
            "area_application_references_to_existing_domain_items": len(area_application_references),
            "domain_wide_emerging_supplement_candidates": len(supplement_node_ids),
            "area_item_content_reconciliation_records": len(context_rows),
            "domain_item_area_route_crosswalk": crosswalk_route_audit,
            "area_item_content_reconciliation_nodes_resolved": len(context_rows) - len(unmatched_context_ids),
            "area_item_alternative_dispositions": sum(
                "alternative_disposition" in row.get("proposed_fields", {}) for row in context_rows
            ),
            "area_item_prerequisite_dispositions": sum(
                "prerequisite_disposition" in row.get("proposed_fields", {}) for row in context_rows
            ),
            "supplement_nodes_hidden_without_area_or_role_ownership": all(
                not nodes[node_id].get("student_visible")
                and nodes[node_id].get("area_ownership") == "not_assigned_pending_area_task_evidence"
                and nodes[node_id].get("role_ownership") == "not_assigned_role_fit_audit_closed"
                for node_id in supplement_node_ids.values()
            ),
            "new_unique_area_task_families": len({n.get("task_family_id") for n in area_task_nodes}),
            "source_lane_item_record_counts": {k: sum(1 for n in area_candidate_items if k in str(n.get("lane"))) for k in LANE_FILES},
            "area_enrichment_item_ids": sorted(n.get("item_id") for n in area_candidate_items),
            "all_lane_artifacts_included": all(p in source_artifacts for p in all_lane_paths),
        },
        "role_route_reconciliation": {
            "canonical_d078_role_rows": sum(r.get("domain_id") == "D078" for r in roles),
            "role_nodes": len(path_roles),
            "domain_to_role_edges": len(domain_role_edges),
            "area_to_role_edges": len(area_role_edges),
            "supported_area_route_edges": role_counts.get("reviewed_supported", 0),
            "conditional_area_route_edges": role_counts.get("reviewed_conditional", 0),
            "domain_only_roles_excluded": excluded_roles.get("domain_only_no_area_route", 0),
            "role_item_to_role_edges": role_item_links,
            "unsupported_or_unrouted_role_counts": dict(excluded_roles),
            "role_fit_reopened": False,
        },
    })
    graph = sanitize_retired_area_labels(graph)
    graph["validation"].update({
        "area_nodes": len(area_ids_in_graph),
        "area_learning_item_nodes": sum(n.get("kind") == "area_learning_item" for n in nodes.values()),
        "new_area_enrichment_item_nodes": len(area_candidate_items),
        "area_application_reference_nodes": len(area_application_references),
        "area_task_family_nodes": sum(n.get("kind") == "area_task_family" for n in nodes.values()),
        "role_nodes": sum(n.get("kind") == "role" for n in nodes.values()),
        "domain_to_role_edges": len(domain_role_edges),
        "area_to_role_edges": len(area_role_edges),
        "role_item_to_role_edges": role_item_links,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "all_student_visible": False,
        "canonical_promotions": 0,
        "area_set_exactly_seven_current_areas": len(area_ids_in_graph) == 7,
        "role_area_edges_use_only_current_area_nodes": all(e["source"] in area_nodes.values() for e in area_role_edges),
        "role_fit_reopened": False,
        "domain_wide_emerging_supplement_nodes": len(supplement_node_ids),
        "area_item_context_overlay_records": len(context_rows),
        "all_area_item_context_overlay_ids_resolve": not unmatched_context_ids,
        "all_area_item_context_overlay_nodes_hidden": all(
            not context_nodes[str(row["item_id"])].get("student_visible") for row in context_rows
        ),
        "all_area_item_context_overlay_alternatives_are_disposed": all(
            "alternative_disposition" in row.get("proposed_fields", {})
            for row in context_rows if row["item_id"] in expected_alternative_ids
        ) and actual_alternative_ids == expected_alternative_ids,
        "all_domain_wide_supplement_candidates_present": len(supplement_node_ids) == len(supplement_candidates),
        "all_domain_wide_supplement_nodes_hidden": all(not nodes[node_id].get("student_visible") for node_id in supplement_node_ids.values()),
        "domain_wide_supplement_resource_bundles_present": all(
            nodes[node_id].get("official_reference_links")
            and (nodes[node_id].get("free_learning_links") or nodes[node_id].get("video_learning_links") or nodes[node_id].get("paid_learning_alternatives"))
            for node_id in supplement_node_ids.values()
        ),
        "sequence_claim": "The programme-to-role route design is approved. Exactly three evidence-backed, route-scoped learning dependencies are approved and encoded; 27 other area-order declarations and 19 critical references were dispositioned, with workflow conditions and safeguards kept separate from prerequisites. Student visibility remains off pending separate content and rendered-UI release gates. Existing role routes are consumed without reopening fit adjudication.",
        "every_path_role_has_domain_and_area_route": len(path_roles) > 0 and all(
            any(e.get("relationship") == "domain_to_role" and e.get("target") == n["id"] for e in edges)
            and any(e.get("relationship") == "area_to_role" and e.get("target") == n["id"] for e in edges)
            for n in path_roles
        ),
    })

    # Apply the locally closed domain/area content contract after the
    # deterministic graph rebuild.  This keeps the builder reproducible while
    # ensuring the graph carries the normalised aliases/source dispositions
    # that were verified locally.  The closure is still hidden and does not
    # approve or promote any learner-facing record.
    if CONTENT_CLOSURE.exists():
        closure = load_json(CONTENT_CLOSURE)
        area_closures = {row["node_id"]: row["closure"] for row in closure.get("area_records", [])}
        domain_closures = {row["node_id"]: row for row in closure.get("domain_records", [])}
        for node_id, contract in area_closures.items():
            if node_id in nodes:
                nodes[node_id]["content_contract_closure"] = contract
                nodes[node_id]["student_visible"] = False
                nodes[node_id]["approval"] = "area_content_contract_closed_candidate_not_student_approved"
        for node_id, row in domain_closures.items():
            if node_id in nodes:
                nodes[node_id]["content_contract_closure"] = row.get("closure")
                nodes[node_id]["content_contract_closure_status"] = row.get("closure_status")
                nodes[node_id]["student_visible"] = False
        closure_path = str(CONTENT_CLOSURE.relative_to(ROOT)).replace("\\", "/")
        if closure_path not in source_artifacts:
            source_artifacts.append(closure_path)
        graph["status"] = "hidden_sequence_approved_item_promotion_and_ui_release_gates_open"
        graph["area_reconciliation"]["content_contract_closure"] = {
            "status": closure.get("status"),
            "domain_items": closure.get("counts", {}).get("domain_items"),
            "area_items": closure.get("counts", {}).get("area_items"),
            "domain_structural_gaps": closure.get("counts", {}).get("domain_structural_gaps"),
            "area_source_identity_gaps": closure.get("counts", {}).get("area_source_identity_gaps"),
            "student_visible": False,
        }
        graph["graph_scope_note"] = "Hidden learning-path graph includes the 53 domain items and 144 area candidates after local content-contract closure, all seven current Areas of Specialization, and the already-reconciled role-item handoff. Global evidence is valid; Nigerian context is additive, not a disqualifier; direct CCMAS transfer is not required when the Sociology-to-D078 programme/domain connection is supported. Sequence design is approved. Remaining release work concerns item-level promote/scope/hold dispositions and learner-facing UI/content approval; role-fit adjudication is closed and is not reopened."
        graph["nodes"] = list(nodes.values())
    area_resource_repair_audit = apply_area_resource_repairs(nodes, source_artifacts)
    area_candidate_items = [node for node in nodes.values() if node.get("kind") == "area_enrichment_item"]
    resource_ready_area_items = [
        node for node in area_candidate_items
        if node.get("content_contract_closure", {}).get("evidence_sources")
        and node.get("content_contract_closure", {}).get("free_task_specific_learning_resources")
    ]
    area_resource_repair_registry = area_resource_repair_audit.pop("source_registry", {})
    for path in AREA_RESOURCE_REPAIR_FILES:
        artifact = str(path.relative_to(ROOT)).replace("\\", "/")
        if artifact not in source_artifacts:
            source_artifacts.append(artifact)
        if artifact not in graph.setdefault("source_artifacts", []):
            graph["source_artifacts"].append(artifact)
    area_resource_repair_audit["area_items_with_evidence_and_free_learning_route"] = len(resource_ready_area_items)
    area_resource_repair_audit["area_items_still_missing_evidence_or_free_learning_route"] = len(area_candidate_items) - len(resource_ready_area_items)
    graph["area_reconciliation"]["area_resource_repairs"] = area_resource_repair_audit

    area_source_registry = build_area_source_registry(lane_documents)
    for source_id, source in area_resource_repair_registry.items():
        prior = area_source_registry.get(source_id)
        if prior and prior.get("url") and source.get("url") and prior["url"] != source["url"]:
            raise ValueError(f"Conflicting existing/repair URLs for source identity {source_id}")
        area_source_registry.setdefault(source_id, source)
    area_relationship_audit = add_area_contract_relationships(nodes, edges, area_source_registry)
    area_relationship_disposition_audit = apply_area_relationship_dispositions(nodes, edges)
    sequence_direction_review_audit = apply_sequence_direction_review(nodes)
    programme_route_audit = add_sociology_programme_route(graph, nodes, edges)
    sequence_edge_audit = add_candidate_sequence_edges(nodes, edges, load_json(FULL_PATH_SEQUENCE_DESIGN))
    sequence_direction_review_audit["candidate_sequence_edges_created"] = sequence_edge_audit["candidate_sequence_edges_created"]
    sequence_direction_review_audit["approved_sequence_edges_created"] = sequence_edge_audit["approved_sequence_edges_created"]
    sequence_direction_review_audit["note"] = (
        "The 19 critical references have source-checked interpretations. Only explicitly "
        "source-supported, route-scoped learner orders are represented as hidden candidate "
        "edges; task gates, alternatives, complements and workflow order remain distinct. "
        "The separate full-path sequence design approves exactly three route-scoped "
        "dependencies. This review does not itself approve visibility or item promotion."
    )
    area_relationship_audit["pre_disposition_resolved_target_references"] = area_relationship_audit["resolved_target_references"]
    area_relationship_audit["pre_disposition_unresolved_typed_target_references"] = area_relationship_audit["unresolved_typed_target_references"]
    area_relationship_audit["pre_disposition_descriptive_relationship_annotations"] = area_relationship_audit["descriptive_relationship_annotations"]
    area_relationship_audit["resolved_target_references"] += area_relationship_disposition_audit["resolved_reference_records"]
    area_relationship_audit["unresolved_typed_target_references"] = area_relationship_disposition_audit["unresolved_reference_records"]
    area_relationship_audit["descriptive_relationship_annotations"] += area_relationship_disposition_audit["annotation_reference_records"]
    area_relationship_audit["new_hidden_candidate_reference_records"] = area_relationship_disposition_audit["new_candidate_reference_records"]
    area_relationship_audit["unique_hidden_candidate_items"] = area_relationship_disposition_audit["unique_hidden_candidate_items"]
    area_relationship_audit["unsupported_hidden_reference_records"] = area_relationship_disposition_audit["unsupported_reference_records"]
    graph["area_reconciliation"]["relationship_graph"] = {
        **area_relationship_audit,
        "disposition_reconciliation": area_relationship_disposition_audit,
        "sequence_direction_review": sequence_direction_review_audit,
        "candidate_sequence_edge_audit": sequence_edge_audit,
        "programme_route_audit": programme_route_audit,
        "status": "relationship_references_dispositioned_sequence_design_approved_relationships_hidden",
        "student_visible": False,
        "sequence_approved": False,
        "sequence_design_approved": True,
        "note": "Declared prerequisites, alternatives, complements and typed relationships are part of the rebuilt learning-path graph. Every typed reference has a hidden disposition. The 19 sequencing-critical references have completed disjoint source checks and local reconciliation; the three source-supported route-scoped learning orders are approved and represented as hidden sequence edges. Workflow safeguards remain distinct. Student visibility and release approval remain separate gates.",
    }
    full_path_sequence_design = attach_full_path_sequence_design(graph)
    graph["nodes"] = list(nodes.values())
    graph["edges"] = edges
    sequence_review_path = str(SEQUENCE_DIRECTION_REVIEW.relative_to(ROOT)).replace("\\", "/")
    if sequence_review_path not in graph["source_artifacts"]:
        graph["source_artifacts"].append(sequence_review_path)
    for source_check in sequence_direction_review_audit["source_checks"]:
        source_check_path = source_check["artifact"]
        if source_check_path not in graph["source_artifacts"]:
            graph["source_artifacts"].append(source_check_path)
    for artifact in (
        "docs/manual-review/D078_FULL_PATH_SEQUENCE_DESIGN_2026_10_12.md",
        str(FULL_PATH_SEQUENCE_DESIGN.relative_to(ROOT)).replace("\\", "/"),
    ):
        if artifact not in graph["source_artifacts"]:
            graph["source_artifacts"].append(artifact)
    for source_path in (SOCIOLOGY_THEME_AUDIT, SOCIOLOGY_CURRICULUM_CONTRACT, PROGRAMME_DOMAIN_EVIDENCE):
        artifact = str(source_path.relative_to(ROOT)).replace("\\", "/")
        if artifact not in graph["source_artifacts"]:
            graph["source_artifacts"].append(artifact)
    # The baseline builder computes validation totals before area-reference
    # dispositions add annotation/candidate nodes and bookkeeping edges. Refresh
    # graph-wide totals only after all layers are attached so the manifest
    # describes the actual serialized graph, not the pre-disposition snapshot.
    graph["validation"].update({
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "relationship_disposition_reference_records": area_relationship_disposition_audit["reference_records"],
        "relationship_disposition_unresolved_records": area_relationship_disposition_audit["unresolved_reference_records"],
        "relationship_disposition_student_visible": False,
        "relationship_disposition_sequence_approved": False,
        "sequence_direction_review_records": sequence_direction_review_audit["reference_records"],
        "sequence_direction_review_unreviewed_critical_references": sequence_direction_review_audit["unreviewed_critical_references"],
        "sequence_direction_review_source_checks": len(sequence_direction_review_audit["source_checks"]),
        "sequence_direction_review_sequence_approved": False,
        "full_path_sequence_design_sequence_approved": True,
        "candidate_sequence_edges": sequence_edge_audit["candidate_sequence_edges_created"],
        "approved_sequence_edges": sequence_edge_audit["approved_sequence_edges_created"],
        "full_path_area_order_declarations_dispositioned": full_path_sequence_design["direct_area_order_declaration_count"],
        "full_path_strict_dependency_candidates": full_path_sequence_design["strict_learning_dependency_candidate_count"],
        "full_path_sequence_design_integrated": True,
        "full_path_sequence_design_student_visible": False,
        "programme_theme_nodes": programme_route_audit["programme_theme_nodes"],
        "programme_domain_transition_edges": programme_route_audit["programme_domain_transition_edges"],
    })
    # The closure includes inherited audit prose as evidence context; apply the
    # retired-area-label guard after attaching it so retired names cannot leak
    # into the generated graph through newly attached content-contract fields.
    graph = sanitize_retired_area_labels(graph)
    GRAPH.write_text(json.dumps(graph, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Integrate the already-completed role-item handoff and full path inventory
    # as part of this deterministic rebuild. This is not role-fit adjudication:
    # the integration script consumes the existing 173-record dispositions and
    # preserves every node hidden. Keeping it in the rebuild prevents the
    # serialized graph from stopping at the pre-integration candidate union.
    role_item_integration = AUDIT / "integrate_d078_role_item_reconciliation_hidden_graph_2026_10_10.py"
    subprocess.run([sys.executable, str(role_item_integration)], cwd=ROOT, check=True)
    graph = load_json(GRAPH)
    nodes = {node["id"]: node for node in graph["nodes"]}
    edges = graph["edges"]
    area_candidate_items = [node for node in nodes.values() if node.get("kind") == "area_enrichment_item"]
    path_roles = [node for node in nodes.values() if node.get("kind") == "role"]
    area_role_edges = [edge for edge in edges if edge.get("relationship") == "area_to_role"]
    domain_role_edges = [edge for edge in edges if edge.get("relationship") == "domain_to_role"]
    role_counts = Counter(edge.get("status") for edge in area_role_edges)
    role_item_links = sum(edge.get("relationship") == "reconciled_role_item_to_role" for edge in edges)

    repaired_area_nodes = [node for node in nodes.values() if node.get("area_resource_repair")]
    repair_source_ids = {
        row.get("source_id")
        for node in repaired_area_nodes
        for field in ("evidence_sources", "free_task_specific_learning_resources", "additional_official_or_paid_learning_routes")
        for row in (node.get("content_contract_closure") or {}).get(field, [])
        if row.get("source_id")
    }
    unresolved_repair_branches = sum(
        len((node.get("area_resource_repair") or {}).get("unresolved_branches") or [])
        for node in repaired_area_nodes
    )
    report = [
        "# D078 programme → role learning-path graph — HIDDEN CANDIDATE UNION (2026-10-10)",
        "",
        f"**Not the final or student-ready graph.** The union includes the current candidate inventory: 53 canonical domain contract items, 8 emerging candidates, 3 domain-wide supplements, all seven area task sets, 144 area-enrichment items, and reconciled role-item/profile snapshots. Its domain-to-area crosswalk resolves {crosswalk_route_audit['crosswalk_records']} item records, {crosswalk_route_audit['area_routes']} routes and {crosswalk_route_audit['same_area_task_references']} same-area task references with {len(crosswalk_route_audit['unresolved_task_references']) + len(crosswalk_route_audit['wrong_area_task_references'])} unresolved or wrong-area references. The 173-record role-item handoff is integrated and the full-path sequence design is approved; rendered guided-experience verification and content/student-release gates remain separate. All content remains hidden; no canonical data or SQL seed is changed.",
        "",
        "The graph includes the reconciled role-item handoff as part of learning-path design. Sequence approval is distinct from approval to display a particular item or relationship. Existing role-route decisions are consumed without reopening role-fit review.",
        "",
        "## Domain-item to area-task mapping",
        "",
        f"- Domain crosswalk records: **{crosswalk_route_audit['crosswalk_records']}**; area routes: **{crosswalk_route_audit['area_routes']}**; same-area task references: **{crosswalk_route_audit['same_area_task_references']}**.",
        f"- Missing domain items/areas: **{len(crosswalk_route_audit['missing_domain_items']) + len(crosswalk_route_audit['missing_areas'])}**; unresolved or wrong-area task references: **{len(crosswalk_route_audit['unresolved_task_references']) + len(crosswalk_route_audit['wrong_area_task_references'])}**.",
        "- These are hidden candidate routes, not approval of item claims, learning links, or student visibility.",
        "",
        "## Area and enrichment coverage",
        "",
        f"- Current Areas of Specialization represented: **{len(area_ids_in_graph)}**.",
        f"- Earlier graph area-item records retained: **{graph['area_reconciliation']['old_graph_area_items_retained']}**.",
        f"- New unique area-enrichment items added: **{len(area_candidate_items)}**.",
        f"- Separate domain-wide emerging supplement candidates included (hidden; no area/role ownership assigned): **{len(supplement_node_ids)}**.",
        f"- Each supplement has an official reference and a free, paid or video learning destination: **{all(nodes[node_id].get('official_reference_links') and (nodes[node_id].get('free_learning_links') or nodes[node_id].get('video_learning_links') or nodes[node_id].get('paid_learning_alternatives')) for node_id in supplement_node_ids.values())}**.",
        f"- Area-item content repairs attached to exact graph items (programme context/task/use/output): **{graph['area_reconciliation']['area_item_content_reconciliation_nodes_resolved']} / {len(context_rows)}**; alternatives: **{graph['area_reconciliation']['area_item_alternative_dispositions']}**; prerequisite dispositions: **{graph['area_reconciliation']['area_item_prerequisite_dispositions']}**.",
        f"- Area-resource repairs now attached to exact graph items: **{len(repaired_area_nodes)} / 35**; unique linked source/learning-route identities: **{len(repair_source_ids)}**; bounded scope branches retained for follow-up: **{unresolved_repair_branches}**.",
        f"- Area relationship declarations: **{area_relationship_audit['area_item_relationship_edges']}**; after disposition, **{area_relationship_audit['resolved_target_references']}** typed references resolve to existing graph items, **{area_relationship_audit['descriptive_relationship_annotations']}** remain non-item annotations, **{area_relationship_audit['new_hidden_candidate_reference_records']}** point to **{area_relationship_audit['unique_hidden_candidate_items']}** hidden candidate items, **{area_relationship_audit['unsupported_hidden_reference_records']}** are explicitly unsupported, and **{area_relationship_audit['unresolved_typed_target_references']}** remain undispositioned.",
        f"- The programme route now includes {programme_route_audit['programme_theme_nodes']} fixed, non-selectable Sociology themes and one hidden direct Sociology→D078 transition supported by {programme_route_audit['course_anchor_count']} strong course anchors. The themes are student-facing groupings of curriculum courses, not official CCMAS theme labels.",
        f"- Three route-scoped learning-order dependencies are source-checked and approved (statistics foundations→applied econometrics when needed; applied econometrics→causal ML on the advanced causal route; agent-based economics modelling→CASEVO on that implementation route). They remain hidden until the separate content/UI release gates pass.",
        f"- All dispositioned targets and candidate nodes remain hidden. The 19 sequencing-critical references have reconciled local interpretations and record-specific source checks ({sequence_direction_review_audit['reference_records']} / 19); workflow safeguards, conditions, alternatives and complements are not converted into learner prerequisites.",
        f"- Task-family nodes retained/added: **{len(area_task_nodes)}**.",
        f"- All seven area-lane artifacts are listed in source lineage: **{graph['area_reconciliation']['all_lane_artifacts_included']}**.",
        "- The 53-domain/144-area content-contract normalization is locally closed; sequence design is approved. Item-level promotion decisions and rendered learner-display gates remain separate. Hidden is not treated as unsupported.",
        "",
        "## Role-to-area routes",
        "",
        f"- D078 role records in source inventory: **{graph['role_route_reconciliation']['canonical_d078_role_rows']}**; roles passing both gates and represented in this pathway: **{graph['role_route_reconciliation']['role_nodes']}**.",
        f"- Supported area routes: **{role_counts.get('reviewed_supported', 0)}**.",
        f"- Conditional area routes: **{role_counts.get('reviewed_conditional', 0)}**.",
        f"- Domain-only roles excluded from the pathway: **{graph['role_route_reconciliation']['domain_only_roles_excluded']}**.",
        f"- Roles excluded because they fail one or both fit gates: `{dict(excluded_roles)}`.",
        f"- Existing role-item-to-role context links: **{role_item_links}**.",
        "- Every routed role has an explicit D078-domain edge; area links are separate and point only to one of the seven current Areas of Specialization.",
        "- Supported and conditional statuses remain distinct. Conditional domain/area edges preserve the recorded use-case, qualification, or scope condition and sources.",
        f"- Explicit D078 domain-to-role edges: **{graph['role_route_reconciliation']['domain_to_role_edges']}**.",
        "- Role-fit review was not reopened. Only roles passing both existing D078 and area route decisions are in the path; none is forced into an area.",
        "",
        "## Safety and scope",
        "",
        "- Student-visible nodes: **0**.",
        "- Canonical promotions: **0**.",
        "- The graph does not claim Sociology curriculum teaches every D078 area; programme curriculum and cross-area enrichment remain distinct.",
        "- Role-linked learning items use the completed handoff's dispositions and existing route statuses; this graph work does not create new fit decisions.",
        "",
        f"Machine-readable graph: `{GRAPH.relative_to(ROOT).as_posix()}`",
    ]
    REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps({
        "area_nodes": len(area_ids_in_graph),
        "old_area_items_retained": graph["area_reconciliation"]["old_graph_area_items_retained"],
        "new_area_items": len(area_candidate_items),
        "unique_area_task_families": graph["area_reconciliation"]["new_unique_area_task_families"],
        "role_rows": graph["role_route_reconciliation"]["canonical_d078_role_rows"],
        "area_role_edges": len(area_role_edges),
        "supported_area_routes": role_counts.get("reviewed_supported", 0),
        "conditional_area_routes": role_counts.get("reviewed_conditional", 0),
        "domain_only_roles_excluded": graph["role_route_reconciliation"]["domain_only_roles_excluded"],
        "every_path_role_has_both_routes": graph["validation"]["every_path_role_has_domain_and_area_route"],
        "role_fit_reopened": False,
        "student_visible": False,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
    }, indent=2))


if __name__ == "__main__":
    main()
