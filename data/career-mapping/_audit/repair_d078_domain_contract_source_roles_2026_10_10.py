"""Attach explicit source roles to the D078 domain contract.

This is a deterministic local repair.  It does not adjudicate role fit, alter
canonical data, or promote a learning item to students.  Several contract
records already contained evidence and learning URLs, but the implementation
contract had not separated those links into:

* what the item/task is;
* why it is relevant at the D078 checkpoint; and
* an explanatory or task-specific learning resource.

The repair uses only URLs already present in the D078 contract or its checked-
in source register.  Missing source identity is not invented; such records
remain hidden and are reported.
"""

from __future__ import annotations

import json
from copy import deepcopy
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CONTRACT = AUDIT / "d078_domain_learning_contract_2026_10_08.json"
INVENTORY = AUDIT / "d078_full_domain_item_inventory_2026_10_08.json"
REPORT = AUDIT / "D078_DOMAIN_CONTRACT_SOURCE_ROLE_REPAIR_2026_10_10.json"

SECTIONS = (
    "existing_inventory",
    "foundation_and_route_additions",
    "route_alternatives",
    "deep_search_options",
)


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def clean(value: Any) -> Any:
    if isinstance(value, str):
        return value.strip() or None
    if isinstance(value, list):
        return [clean(x) for x in value if clean(x) is not None]
    if isinstance(value, dict):
        return {str(k): clean(v) for k, v in value.items() if clean(v) is not None}
    return value


def source_registry() -> dict[str, dict[str, Any]]:
    inventory = load(INVENTORY)
    return {
        str(row.get("id")): row
        for row in inventory.get("source_register", [])
        if row.get("id")
    }


def link_index(row: dict[str, Any]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for item in as_list(row.get("learning_links")):
        if isinstance(item, dict) and item.get("url"):
            source_id = str(item.get("source_id") or item.get("url"))
            result.setdefault(source_id, clean(item))
    return result


def evidence_rows(row: dict[str, Any], registry: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    """Resolve existing evidence references without fabricating URLs."""
    links = link_index(row)
    result: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for evidence in as_list(row.get("evidence")):
        if not isinstance(evidence, dict):
            continue
        source_id = str(evidence.get("source_id") or "").strip()
        if not source_id:
            continue
        base = deepcopy(registry.get(source_id) or links.get(source_id) or {})
        url = base.get("url") or evidence.get("url")
        if not url:
            continue
        locator = evidence.get("exact_locator") or evidence.get("locator") or base.get("locator")
        key = (source_id, str(locator or ""))
        if key in seen:
            continue
        seen.add(key)
        result.append({
            "source_id": source_id,
            "title": base.get("title") or source_id,
            "publisher": base.get("publisher"),
            "url": url,
            "locator": locator,
            "accessed_on": base.get("accessed_on") or row.get("reviewed_on") or "2026-10-10",
            "scope_limit": base.get("scope_limit") or "Source is retained for this bounded candidate claim; it does not establish a universal D078 requirement.",
        })
    return result


def learning_rows(row: dict[str, Any], registry: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    """Resolve existing learning links and retain their instructional metadata."""
    links = link_index(row)
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in as_list(row.get("learning_links")):
        if not isinstance(item, dict) or not item.get("url"):
            continue
        source_id = str(item.get("source_id") or item["url"])
        if source_id in seen:
            continue
        seen.add(source_id)
        base = deepcopy(registry.get(source_id) or links.get(source_id) or {})
        merged = {**base, **clean(item)}
        result.append({
            "source_id": source_id,
            "title": merged.get("title") or merged.get("label") or source_id,
            "publisher": merged.get("publisher"),
            "url": merged["url"],
            "locator": merged.get("locator"),
            "accessed_on": merged.get("accessed_on") or "2026-10-10",
            "role": merged.get("role") or "task_specific_learning_resource_candidate",
            "instructional_fit": merged.get("instructional_fit") or "existing_link_not_revalidated_by_this_repair",
            "scope_note": merged.get("scope_note") or merged.get("scope_limit"),
        })
    return result


def with_role(source: dict[str, Any], role: str, reason: str) -> dict[str, Any]:
    result = deepcopy(source)
    result["claim_role"] = role
    result["role_basis"] = reason
    result["evidence_state"] = "attached_pending_final_claim_and_checkpoint_review"
    return result


def repair_record(row: dict[str, Any], registry: dict[str, dict[str, Any]]) -> dict[str, Any]:
    evidence = evidence_rows(row, registry)
    learning = learning_rows(row, registry)
    # Deep-search records sometimes retain local ledger IDs (for example S01
    # or S09) while the official URL is stored on the learning-link record.
    # Resolve that identity from the existing official link rather than
    # inventing a second source record.
    resolved_evidence = evidence or [
        {
            "source_id": item.get("source_id"),
            "title": item.get("title") or item.get("label") or item.get("source_id"),
            "publisher": item.get("publisher"),
            "url": item.get("url"),
            "locator": item.get("locator"),
            "accessed_on": item.get("accessed_on") or "2026-10-10",
            "scope_limit": item.get("scope_note") or "Official or explanatory link retained for this bounded candidate; it does not establish a universal D078 requirement.",
        }
        for item in learning[:1]
    ]
    item_sources = [with_role(resolved_evidence[0], "item_definition_or_task_identity", "Existing evidence or official learning link identifies the named item/task; exact claim scope remains pending final review.")] if resolved_evidence else []

    # Nigerian CCMAS or named Nigerian practice evidence is useful checkpoint
    # context when present.  Otherwise retain the strongest existing evidence
    # as bounded D078 context, never as proof of a universal requirement.
    preferred = [x for x in evidence if x.get("source_id") in {"nuc_ccmas", "nuc_social_sciences_ccmas_2023_research_curriculum", "nbs_social_stats", "niser_policy"}]
    checkpoint = preferred[:1] or resolved_evidence[:1]
    checkpoint_sources = [with_role(x, "D078_checkpoint_context_candidate", "Existing source supports bounded domain or Nigerian context; exact route coverage remains subject to final review.") for x in checkpoint]

    explanatory = learning[:1]
    explanatory_sources = [with_role(x, "independent_or_task_specific_explanation_candidate", "Existing learning URL explains or demonstrates the item/task; instructional fit and access remain separately reviewed.") for x in explanatory]

    changed = False
    if not row.get("item_definition_sources") and item_sources:
        row["item_definition_sources"] = item_sources
        changed = True
    if not row.get("checkpoint_fit_sources") and checkpoint_sources:
        row["checkpoint_fit_sources"] = checkpoint_sources
        changed = True
    if not row.get("explanatory_sources") and explanatory_sources:
        row["explanatory_sources"] = explanatory_sources
        changed = True

    audit = row.setdefault("link_role_audit", {})
    if item_sources:
        audit["official_task_or_item_source"] = "candidate_source_role_attached_pending_adjudication"
    if checkpoint_sources:
        audit["checkpoint_fit_source"] = "candidate_source_role_attached_pending_adjudication"
    if explanatory_sources:
        audit["independent_explanatory_source"] = "candidate_source_role_attached_pending_adjudication"
    if learning:
        audit["free_task_specific_learning_resource"] = "existing_link_attached_pending_revalidation"
    if changed:
        row["claim_evidence_status"] = "source_roles_attached_pending_final_claim_and_checkpoint_review"
        row["research_disposition"] = "source_role_repaired_pending_final_review"
        row["exhaustive_search_status"] = "source_identity_resolved_for_available_links; claim_scope_review_pending"
        row["student_display_status"] = "not_confirmed_pending_final_claim_checkpoint_and_learning_link_review"
        row["display_readiness"] = "not_confirmed_pending_review"
        row["canonical_status"] = "not_promoted"
    return {
        "id": row.get("id"),
        "label": row.get("label"),
        "changed": changed,
        "item_definition_sources": len(row.get("item_definition_sources") or []),
        "checkpoint_fit_sources": len(row.get("checkpoint_fit_sources") or []),
        "explanatory_sources": len(row.get("explanatory_sources") or []),
        "learning_links": len(learning),
        "unresolved_evidence_without_url": sum(1 for x in as_list(row.get("evidence")) if isinstance(x, dict) and x.get("source_id") and not next((y for y in evidence if y.get("source_id") == x.get("source_id")), None)),
    }


def main() -> None:
    contract = load(CONTRACT)
    registry = source_registry()
    records = []
    for section in SECTIONS:
        for row in contract.get(section, []):
            records.append(repair_record(row, registry))

    contract.setdefault("source_role_repair", {})
    contract["source_role_repair"].update({
        "status": "repaired_from_existing_contract_sources_pending_final_review",
        "repaired_on": str(date(2026, 10, 10)),
        "method": "Use existing evidence/source registry and existing learning URLs; no source URL was invented.",
        "student_visible": False,
        "canonical_changes": False,
        "records_with_source_roles_attached": sum(1 for r in records if r["item_definition_sources"] and r["checkpoint_fit_sources"] and r["explanatory_sources"]),
        "records_still_missing_source_role": sum(1 for r in records if not (r["item_definition_sources"] and r["checkpoint_fit_sources"] and r["explanatory_sources"])),
    })
    CONTRACT.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps({
        "status": "completed_local_source_role_repair",
        "contract": str(CONTRACT.relative_to(ROOT)),
        "student_visible": False,
        "canonical_changes": False,
        "records": records,
        "counts": {
            "records": len(records),
            "changed": sum(1 for r in records if r["changed"]),
            "complete_source_role_triplets": sum(1 for r in records if r["item_definition_sources"] and r["checkpoint_fit_sources"] and r["explanatory_sources"]),
            "remaining_source_role_gaps": sum(1 for r in records if not (r["item_definition_sources"] and r["checkpoint_fit_sources"] and r["explanatory_sources"])),
        },
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": "completed_local_source_role_repair",
        "records": len(records),
        "changed": sum(1 for r in records if r["changed"]),
        "complete_source_role_triplets": sum(1 for r in records if r["item_definition_sources"] and r["checkpoint_fit_sources"] and r["explanatory_sources"]),
        "remaining_source_role_gaps": sum(1 for r in records if not (r["item_definition_sources"] and r["checkpoint_fit_sources"] and r["explanatory_sources"])),
    }, indent=2))


if __name__ == "__main__":
    main()
