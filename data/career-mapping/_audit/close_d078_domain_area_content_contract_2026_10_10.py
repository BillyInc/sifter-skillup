"""Close the D078 domain/area content contract before role-item reconciliation.

This is a local audit artifact, not a canonical/Supabase write.  The existing
area candidates were produced by more than one enrichment lane and therefore
use a few different field names.  This pass normalises those aliases, resolves
source and learning-resource identities where the local registry can resolve
them, and records explicit non-established dispositions instead of silently
inventing prerequisites, alternatives, outputs, or limitations.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
TASK_SETS_PATH = AUDIT / "d078_area_role_task_sets_2026_10_09.json"
OUT_JSON = AUDIT / "D078_DOMAIN_AREA_CONTENT_CONTRACT_CLOSURE_2026_10_10.json"
OUT_MD = ROOT / "docs" / "manual-review" / "D078_DOMAIN_AREA_CONTENT_CONTRACT_CLOSURE_2026_10_10.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def clean(value: Any) -> Any:
    if isinstance(value, str):
        value = value.strip()
        return value or None
    if isinstance(value, list):
        return [clean(item) for item in value if clean(item) is not None]
    if isinstance(value, dict):
        return {str(k): clean(v) for k, v in value.items() if clean(v) is not None}
    return value


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        value = clean(record.get(name))
        if value is not None and value != [] and value != {}:
            return value
    return None


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def id_from(value: Any) -> str | None:
    if isinstance(value, str):
        return value.strip() or None
    if isinstance(value, dict):
        for key in ("source_id", "id", "resource_id", "learning_resource_id"):
            if value.get(key):
                return str(value[key]).strip()
    return None


def collect_ids(value: Any) -> list[str]:
    result: list[str] = []
    for item in as_list(value):
        item_id = id_from(item)
        if item_id and item_id not in result:
            result.append(item_id)
    return result


def source_object(value: Any) -> dict[str, Any] | None:
    if isinstance(value, dict):
        return clean(value)
    if isinstance(value, str):
        return {"source_id": value}
    return None


def build_registries(task_sets: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    sources: dict[str, dict[str, Any]] = {}
    registry = task_sets.get("source_registry") or {}
    if isinstance(registry, dict):
        for key, value in registry.items():
            if isinstance(value, dict):
                sources[str(key)] = {"source_id": str(key), **clean(value)}

    resources: dict[str, dict[str, Any]] = {}
    for area in task_sets.get("area_task_sets") or []:
        for family in (area.get("task_families") or []) + (area.get("additional_task_families") or []):
            for field in ("authoritative_work_sources", "authoritative_work_source_ids", "explanatory_sources", "explanatory_source_ids", "free_task_specific_learning_resources", "free_task_specific_learning_source_ids"):
                for item in as_list(family.get(field)):
                    if isinstance(item, dict):
                        item_id = id_from(item)
                        if item_id:
                            if "learning" in field or "free_task" in field:
                                resources.setdefault(item_id, {"source_id": item_id, **clean(item)})
                            else:
                                sources.setdefault(item_id, {"source_id": item_id, **clean(item)})

    # The area lanes deliberately preserve their own evidence ledgers.  Merge
    # those ledgers too: several inherited candidates use the lane's source ID
    # vocabulary rather than the later task-set registry vocabulary.
    lane_dir = AUDIT / "d078_area_enrichment_lanes_2026_10_10"
    for path in lane_dir.glob("*.json"):
        try:
            lane = load(path)
        except (OSError, json.JSONDecodeError):
            continue
        for field in ("source_records", "sources"):
            for item in as_list(lane.get(field)):
                if isinstance(item, dict) and (item.get("source_id") or item.get("id")):
                    source_id = str(item.get("source_id") or item.get("id"))
                    sources.setdefault(source_id, {"source_id": source_id, **clean(item)})
        registry = lane.get("source_registry") or {}
        if isinstance(registry, dict):
            for source_id, item in registry.items():
                if isinstance(item, dict):
                    sources.setdefault(str(source_id), {"source_id": str(source_id), **clean(item)})
        elif isinstance(registry, list):
            for item in registry:
                if isinstance(item, dict) and (item.get("source_id") or item.get("id")):
                    source_id = str(item.get("source_id") or item.get("id"))
                    sources.setdefault(source_id, {"source_id": source_id, **clean(item)})
        for field in ("learning_resources", "free_task_specific_learning_resources"):
            for item in as_list(lane.get(field)):
                if isinstance(item, dict) and item.get("source_id"):
                    resources.setdefault(str(item["source_id"]), clean(item))
    return sources, resources


def resolve_refs(ids: Iterable[str], registry: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for item_id in ids:
        raw = registry.get(item_id, {"source_id": item_id})
        row = {"source_id": item_id}
        row.update({k: v for k, v in raw.items() if k != "source_id"})
        rows.append(row)
    return rows


def non_established(label: str, explanation: str) -> dict[str, Any]:
    return {"state": "not_established_for_this_candidate", "label": label, "explanation": explanation}


def normalise_area(node: dict[str, Any], source_registry: dict[str, dict[str, Any]], resource_registry: dict[str, dict[str, Any]]) -> dict[str, Any]:
    raw = clean(node.get("source_record") or {})
    what = first(raw, "what_it_is", "definition", "purpose_and_area_context", "meaning_in_area_and_D078", "domain_area_meaning")
    programme = first(raw, "programme_meaning", "meaning_in_selected_programme")
    domain_area = first(raw, "meaning_in_area_and_D078", "meaning_in_D078", "meaning_in_domain", "domain_area_meaning", "area_context")
    task_use = first(raw, "task_use_and_output", "task_use", "task_and_output", "what_it_does_for_task", "task_connection", "role_use")
    output = first(raw, "learner_output", "output", "expected_output")
    prerequisites = first(raw, "prerequisites", "prerequisite_disposition")
    relationships = first(raw, "relationships", "relationship_disposition")
    complements = first(raw, "complements", "complementary_items")
    alternatives = first(raw, "alternatives", "valid_alternatives", "alternative_disposition")
    limitations = first(raw, "limitations", "limitations_or_non_substitutions", "limits")

    if what is None:
        what = non_established("What this item is", "No standalone definition was supplied in the inherited row; keep the candidate hidden until a source-backed definition is added.")
    if programme is None:
        programme = "No direct curriculum transfer is asserted. D078 programme-to-domain evidence supplies route context; this area candidate is enrichment unless separately supported by programme evidence."
    if domain_area is None:
        domain_area = non_established("Meaning in D078 and this area", "The inherited row did not provide a distinct domain/area explanation; do not infer one from the item label alone.")
    if task_use is None:
        task_use = non_established("Task/use and output", "No bounded task-and-output statement is recorded for this candidate.")
    if output is None:
        output = non_established("Learner output", "No distinct occupational deliverable is established; a student-facing output must not be invented from technical compatibility.")
    if prerequisites is None:
        prerequisites = non_established("Prerequisites", "No formal prerequisite is established for this candidate; route-specific preparation may still be needed.")
    if relationships is None:
        if complements is not None:
            relationships = [{"type": "complements", "target": item, "why": "Recorded as a complement in the inherited candidate row."} for item in as_list(complements)]
        else:
            relationships = non_established("Relationships", "No source-backed prerequisite, complement, dependency, or alternative relationship is established for this candidate.")
    if alternatives is None:
        alternatives = non_established("Valid alternatives", "No valid alternative is established; do not treat technically compatible items as interchangeable.")
    if limitations is None:
        limitations = non_established("Limitations and non-substitutions", "No separate limitation is established in the inherited row; the candidate remains hidden until its scope is bounded.")

    evidence_ids = collect_ids(first(raw, "evidence_source_ids", "evidence_refs", "evidence", "evidence_sources"))
    explanation_ids = collect_ids(first(raw, "explanatory_source_ids", "explanation_links", "explanatory_sources"))
    learning_ids = collect_ids(first(raw, "free_task_specific_learning_resource_ids", "learning_resource_ids", "free_task_learning_links", "learning_links"))
    evidence_refs = resolve_refs(evidence_ids, source_registry)
    explanation_refs = resolve_refs(explanation_ids, source_registry)
    learning_refs = resolve_refs(learning_ids, {**source_registry, **resource_registry})
    all_refs = evidence_refs + explanation_refs + learning_refs
    unresolved = [ref["source_id"] for ref in all_refs if not ref.get("url")]

    closure = {
        "what_it_is": what,
        "meaning_in_selected_programme": programme,
        "meaning_in_D078_and_area": domain_area,
        "task_use_and_output": task_use,
        "learner_output": output,
        "prerequisites": prerequisites,
        "relationships": relationships,
        "valid_alternatives": alternatives,
        "limitations_and_non_substitutions": limitations,
        "evidence_source_ids": evidence_ids,
        "evidence_sources": evidence_refs,
        "explanatory_source_ids": explanation_ids,
        "explanatory_sources": explanation_refs,
        "free_task_specific_learning_resource_ids": learning_ids,
        "free_task_specific_learning_resources": learning_refs,
        "category": "area_specific_enrichment_candidate",
        "category_rationale": "The item is retained as an area-owned candidate because its task/use is scoped to the selected area. It is not silently promoted to the shared D078 foundation, and it is not student-visible until the integrated route and evidence gates pass.",
        "checkpoint_context": {
            "programme": "D078 programme-to-domain context only; no direct CCMAS transfer is implied unless separately evidenced.",
            "domain": "Domain enrichment or overlap is recorded separately; area ownership is retained.",
            "area_of_specialization": "Area-specific task/use and output are the primary placement context.",
            "role": "Role-level placement is deliberately deferred to the separate role-item reconciliation lane."
        },
        "source_identity_status": "resolved" if not unresolved else "source_identity_or_url_unresolved",
        "unresolved_source_ids": unresolved,
        "student_visible": False,
        "approval": "area_content_contract_closed_candidate_not_student_approved",
    }
    return {
        "node_id": node["id"],
        "item_id": node.get("item_id"),
        "label": node.get("label"),
        "area_id": node.get("area_id"),
        "item_type": node.get("item_type"),
        "closure": closure,
    }


def normalise_domain(node: dict[str, Any]) -> dict[str, Any]:
    required = ("meaning", "learner_output", "prerequisites", "relationships", "limitations", "learning_links", "evidence", "category_rationale", "checkpoint_context")
    prerequisites = clean(node.get("prerequisites"))
    prerequisite_disposition = prerequisites if prerequisites else non_established("Prerequisites", "No formal prerequisite is established at the D078 domain layer; route-specific preparation may still be needed.")
    missing = [key for key in required if key != "prerequisites" and clean(node.get(key)) in (None, [], {})]
    return {
        "node_id": node["id"],
        "item_id": node.get("contract_id"),
        "label": node.get("label"),
        "category": node.get("category"),
        "missing_fields": missing,
        "closure": {
            "meaning": node.get("meaning"),
            "learner_output": node.get("learner_output"),
            "prerequisites": prerequisite_disposition,
            "relationships": node.get("relationships"),
            "limitations": node.get("limitations"),
            "learning_links": node.get("learning_links"),
            "evidence": node.get("evidence"),
            "category_rationale": node.get("category_rationale"),
            "checkpoint_context": node.get("checkpoint_context"),
            "student_visible": False,
            "approval": "domain_content_contract_closed_candidate_not_student_approved",
        },
        "student_visible": False,
        "closure_status": "closed_candidate" if not missing else "structural_gap",
    }


def main() -> None:
    graph = load(GRAPH_PATH)
    task_sets = load(TASK_SETS_PATH)
    source_registry, resource_registry = build_registries(task_sets)
    area_nodes = [node for node in graph["nodes"] if node.get("kind") == "area_enrichment_item"]
    domain_nodes = [node for node in graph["nodes"] if node.get("kind") == "domain_learning_item"]
    areas = [normalise_area(node, source_registry, resource_registry) for node in area_nodes]
    domains = [normalise_domain(node) for node in domain_nodes]
    area_gaps = [row for row in areas if row["closure"]["source_identity_status"] != "resolved"]
    domain_gaps = [row for row in domains if row["missing_fields"]]

    for node in graph["nodes"]:
        if node.get("kind") == "area_enrichment_item":
            row = next(item for item in areas if item["node_id"] == node["id"])
            node["content_contract_closure"] = row["closure"]
            node["student_visible"] = False
            node["approval"] = "area_content_contract_closed_candidate_not_student_approved"
        elif node.get("kind") == "domain_learning_item":
            row = next(item for item in domains if item["node_id"] == node["id"])
            node["content_contract_closure_status"] = row["closure_status"]
            node["content_contract_closure"] = row["closure"]
            node["student_visible"] = False

    graph["area_reconciliation"] = {
        "status": "domain_area_content_contract_closed_role_reconciliation_open",
        "area_candidate_count": len(areas),
        "area_source_identity_gaps": len(area_gaps),
        "domain_candidate_count": len(domains),
        "domain_structural_gaps": len(domain_gaps),
        "student_visible": False,
        "next_step": "delegate role-item reconciliation after this hidden graph checkpoint",
    }
    graph["final_graph_ready"] = False
    graph["status"] = "hidden_domain_area_contract_closed_role_item_reconciliation_open"
    GRAPH_PATH.write_text(json.dumps(graph, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    artifact = {
        "schema_version": "2026-10-10.domain-area-contract-closure.v1",
        "artifact_type": "d078_domain_area_content_contract_closure",
        "reviewed_on": str(date.today()),
        "status": "closed_for_hidden_graph_role_reconciliation_open" if not area_gaps and not domain_gaps else "closure_has_source_identity_gaps",
        "policy": {
            "global_evidence_is_valid": True,
            "nigerian_context_adds_local_context_but_is_not_a_global_disqualifier": True,
            "ccmas_transfer_is_not_required_when_d078_programme_to_domain_evidence_exists": True,
            "domain_enrichment_is_not_labelled_curriculum_taught": True,
            "role_fit_is_not_reopened": True,
            "all_student_visible": False,
        },
        "counts": {
            "domain_items": len(domains),
            "area_items": len(areas),
            "domain_structural_gaps": len(domain_gaps),
            "area_source_identity_gaps": len(area_gaps),
            "area_items_with_explicit_non_established_dispositions": sum(1 for row in areas if any(isinstance(row["closure"].get(k), dict) and row["closure"][k].get("state") == "not_established_for_this_candidate" for k in ("what_it_is", "meaning_in_D078_and_area", "task_use_and_output", "learner_output", "prerequisites", "relationships", "valid_alternatives", "limitations_and_non_substitutions"))),
        },
        "domain_records": domains,
        "area_records": areas,
        "source_registry_count": len(source_registry),
        "learning_resource_registry_count": len(resource_registry),
        "next_step": "Rebuild the hidden dependency graph from this closure, then hand the separate 173 role-item reconciliation to one agent.",
    }
    OUT_JSON.write_text(json.dumps(artifact, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    md = [
        "# D078 Domain/Area Content-Contract Closure",
        "",
        f"Reviewed: {artifact['reviewed_on']}",
        "",
        "This is a local, hidden contract checkpoint. It does not make any item student-visible or reopen role-fit adjudication.",
        "",
        "## Result",
        "",
        f"- Domain items normalised: {len(domains)}; structural gaps: {len(domain_gaps)}.",
        f"- Area candidates normalised: {len(areas)}; unresolved source identities/URLs: {len(area_gaps)}.",
        f"- Area candidates with explicit non-established dispositions: {artifact['counts']['area_items_with_explicit_non_established_dispositions']}.",
        "- Global evidence remains valid. Nigerian sources add local context but their absence does not disqualify a globally relevant item.",
        "- A direct CCMAS transfer is not required where the D078 programme-to-domain route is already supported; such items are labelled domain enrichment rather than curriculum-taught content.",
        "- Missing alternatives, relationships, prerequisites, outputs or limits are recorded explicitly as not established, never silently inferred.",
        "",
        "## Next step",
        "",
        "Rebuild the hidden dependency graph from this closure artifact. Only after that checkpoint is verified should the separate role-item reconciliation lane process the 173 downstream records.",
    ]
    OUT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"status": artifact["status"], "counts": artifact["counts"], "graph": str(GRAPH_PATH), "artifact": str(OUT_JSON)}, indent=2))


if __name__ == "__main__":
    main()
