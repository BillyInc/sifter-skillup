"""Locally approved, item-scoped D078 learning content for guided responses.

The audit graph remains an internal artifact. Runtime visibility is determined
by explicit per-item dispositions, never by the graph's global visibility flag.
This module does not alter or re-adjudicate role-fit routes.
"""

from __future__ import annotations

import json
import hashlib
import re
from urllib.parse import urlparse
from functools import lru_cache
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MASTER_PATH = ROOT / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
DOMAIN = "D078"
DOMAIN_SOURCE_SECTIONS = (
    "existing_inventory",
    "foundation_and_route_additions",
    "route_alternatives",
    "deep_search_options",
)


def _read(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def _https(value: Any) -> bool:
    return bool(re.match(r"^https://[^\s]+$", str(value or ""), re.IGNORECASE))


def _stable_source_id(source: dict[str, Any]) -> str | None:
    identity = source.get("source_id") or source.get("id")
    if identity:
        return str(identity)
    url = str(source.get("url") or "").strip()
    return f"url_{hashlib.sha256(url.encode('utf-8')).hexdigest()[:16]}" if _https(url) else None


def _domain_contract_records(contract: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        row["id"]: row
        for section in DOMAIN_SOURCE_SECTIONS
        for row in contract.get(section, [])
        if row.get("id")
    }


def _source_reference(source: dict[str, Any], role: str | None = None) -> dict[str, Any] | None:
    url = source.get("url")
    if not _https(url):
        return None
    # A source previously flagged as unsafe for student display remains
    # available to staff audit, but is not surfaced as an external link.
    limits = " ".join(str(source.get(key) or "") for key in ("limits", "scope_limit", "scope_note", "limitations"))
    if "do not use it as a student-facing link" in limits.casefold():
        return None
    return {
        "id": _stable_source_id(source),
        "title": source.get("title") or source.get("label") or source.get("publisher") or "Source",
        "url": url,
        "region": source.get("jurisdiction") or source.get("geographic_scope"),
        "evidenceType": role or source.get("claim_role") or source.get("kind"),
    }


def _sources_to_refs(sources: list[dict[str, Any]], role: str | None = None) -> list[dict[str, Any]]:
    refs = [_source_reference(row, role) for row in sources]
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for ref in refs:
        key = f"{ref['id'] or ''}|{ref['url']}" if ref else ""
        if ref and key not in seen:
            seen.add(key)
            out.append(ref)
    return out


def _explanation(value: Any) -> str | None:
    if isinstance(value, dict):
        if value.get("state") == "not_established_for_this_candidate":
            return None
        value = value.get("explanation") or value.get("value") or value.get("description")
    text = str(value or "").strip()
    return text or None


def _source_locators(sources: list[dict[str, Any]], role: str | None = None) -> list[dict[str, Any]]:
    out = []
    for source in sources:
        locator = source.get("locator") or source.get("exact_locator")
        if not locator:
            continue
        out.append({
            "sourceId": _stable_source_id(source),
            "title": source.get("title") or source.get("label"),
            "url": source.get("url"),
            "locator": locator,
            "claimRole": role or source.get("claim_role") or source.get("kind"),
        })
    return out


def _item_type(raw: str) -> str:
    normalized = str(raw or "").casefold().replace("-", "_")
    if normalized in {"competency", "skill", "method", "knowledge", "certification", "resource"}:
        return normalized
    if normalized in {"emerging_method", "skill_method"}:
        return "method"
    if normalized in {
        "tool", "tool_option", "python_library", "tool_framework", "experimental_framework",
        "emerging_tool_use", "tool_group", "programming_language", "computational_environment", "framework",
    }:
        return "tool"
    # Unknown taxonomy terms are not exposed under a fabricated student type.
    raise ValueError(f"Unsupported D078 guided item type: {raw}")


def _domain_item_type(row: dict[str, Any], contract_row: dict[str, Any]) -> str:
    raw = str(contract_row.get("type") or "").casefold()
    if raw in {"competency", "skill", "method", "knowledge", "tool", "software", "framework"}:
        return "tool" if raw in {"software", "framework"} else raw
    if raw == "knowledge_skill":
        # These combined labels describe learner capabilities, not software.
        return "skill"
    # Some older source rows use `software`/`language` only in their id/title.
    identity = f"{row.get('item_id', '')} {row.get('label', '')}".casefold()
    if any(term in identity for term in ("tool", "python", "r statistical", "stata", "spSS", "nvivo", "networkx", "mesa", "casevo", "jupyter", "pandas", "scikit-learn", "jamovi", "excel", "matplotlib")):
        return "tool"
    return "method"


def _domain_evidence(contract_row: dict[str, Any], closure: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    role_sources = {
        "item_identity": contract_row.get("item_definition_sources") or [],
        "checkpoint_fit": contract_row.get("checkpoint_fit_sources") or [],
        "plain_meaning": contract_row.get("explanatory_sources") or [],
    }
    all_sources = [source for sources in role_sources.values() for source in sources]
    if not all_sources:
        # Existing inventory records predate the role-specific contract; use
        # their explicit source IDs and exact locators as bounded evidence.
        all_sources = [
            {**source, "source_id": source.get("source_id"), "locator": source.get("exact_locator"), "claim_role": "domain_evidence"}
            for source in closure.get("evidence", [])
        ]
        role_sources["item_identity"] = all_sources
        role_sources["checkpoint_fit"] = all_sources
        role_sources["plain_meaning"] = all_sources
    refs = _sources_to_refs(all_sources)
    # Retain exact current learning-link metadata in addition to claim evidence.
    link_refs = [
        {
            "source_id": _stable_source_id(link),
            "title": link.get("label"),
            "publisher": link.get("publisher"),
            "url": link.get("url"),
            "locator": link.get("locator"),
            "accessed": link.get("verified_on") or link.get("accessed_on"),
            "access": link.get("access"),
            "limits": link.get("scope_limit"),
            "claim_role": link.get("role"),
        }
        for link in contract_row.get("learning_links", [])
        if _https(link.get("url"))
    ]
    return refs, role_sources | {"learning_link": link_refs}


def _domain_item(row: dict[str, Any], contract_row: dict[str, Any], decision: dict[str, Any]) -> dict[str, Any]:
    closure = row["closure"]
    refs, sources_by_role = _domain_evidence(contract_row, closure)
    link = decision.get("learning_link_override")
    if not link:
        candidate_links = closure.get("learning_links", [])
        link = next((item for item in candidate_links if item.get("role") == "free_task_specific_learning_resource"), None)
        link = link or (candidate_links[0] if candidate_links else None)
    if not link or not _https(link.get("url")):
        raise ValueError(f"Promoted domain item has no verified HTTPS learning link: {row.get('item_id')}")
    link_locator = link.get("locator") or link.get("exact_locator")
    link_ref = {
        "id": _stable_source_id(link),
        "title": link.get("label") or link.get("title"),
        "url": link["url"],
        "region": "global",
        "evidenceType": "task_specific_learning_resource",
    }
    evidence_refs = refs + ([link_ref] if link_ref["url"] not in {ref["url"] for ref in refs} else [])
    claims = {}
    for key, sources in sources_by_role.items():
        if key == "learning_link":
            continue
        claim_refs = _sources_to_refs(sources)
        locators = _source_locators(sources, key)
        if claim_refs and locators:
            claims[key] = {"source_references": claim_refs, "source_locators": locators}
    # A local disposition explicitly reviews this item's user-facing context.
    checkpoint_sources = sources_by_role.get("checkpoint_fit", []) or sources_by_role.get("item_identity", [])
    plain_sources = sources_by_role.get("plain_meaning", []) or sources_by_role.get("item_identity", [])
    contextual_sources = checkpoint_sources or plain_sources
    claims["plain_meaning"] = {"source_references": _sources_to_refs(plain_sources), "source_locators": _source_locators(plain_sources, "plain_meaning")}
    claims["contextual_use"] = {"source_references": _sources_to_refs(contextual_sources), "source_locators": _source_locators(contextual_sources, "contextual_use")}
    claims["item_identity"] = claims.get("item_identity") or claims.get("checkpoint_fit") or claims["plain_meaning"]
    output = closure.get("learner_output")
    if isinstance(output, dict):
        output_text = output.get("explanation") if output.get("state") == "not_established_for_this_candidate" else output.get("value") or output.get("description")
    else:
        output_text = str(output or "").strip() or None
    if output_text and output_text != "No distinct occupational deliverable is established; a student-facing output must not be invented from technical compatibility.":
        claims["expected_output"] = claims.get("contextual_use")
    id_type = _domain_item_type(row, contract_row)
    category = (closure.get("category_rationale") or {}).get("category") or row.get("category") or "domain_learning_option"
    use_case = contract_row.get("use_case") or decision.get("display_scope")
    linksources = sources_by_role.get("learning_link", [])
    geographic_scope = "nigeria_to_global" if any(str(source.get("publisher") or "").casefold().find("nigeria") >= 0 or source.get("source_id") == "nuc_ccmas" for source in refs) else "global"
    return {
        "contextLevel": "domain",
        "contextKey": DOMAIN,
        "domainId": DOMAIN,
        "itemType": id_type,
        "itemKey": row["item_id"],
        "name": row["label"],
        "plainMeaning": closure.get("meaning"),
        "contextualUse": use_case,
        "expectedOutput": output_text if claims.get("expected_output") else None,
        "themeKey": category,
        "themeLabel": str(category).replace("_", " ").capitalize(),
        "useCaseKey": category if "shared_foundation" not in category else None,
        "requirementLevel": "useful" if "shared_foundation" in category or "conditional" in category or "useful" in category else "optional",
        "requirementReason": decision.get("display_scope"),
        "priority": None,
        "priorityReason": None,
        "learningOrder": None,
        "prerequisites": [],
        "relatedItems": [],
        "relationships": [],
        "pathTargets": [],
        "sourceIds": [ref.get("id") for ref in evidence_refs if ref.get("id")],
        "sourceReferences": evidence_refs,
        "sourceLocators": [
            locator
            for role, sources in sources_by_role.items()
            if role != "learning_link"
            for locator in _source_locators(sources, role)
        ],
        "geographicScope": geographic_scope,
        "evidenceLimitations": list(closure.get("limitations") or []) + [decision.get("curriculum_note", "")],
        "evidenceType": "source_supported_synthesis",
        "sourceConfidence": "medium",
        "dataState": "source_backed",
        "claimReviewState": "approved",
        "claimEvidence": {"claims": claims, "reviewed_by": "local_d078_item_disposition", "decision_id": decision.get("item_id")},
        "linkState": "linked",
        "linkUrl": link.get("url"),
        "linkTitle": link.get("label") or link.get("title"),
        "linkSourceReference": {"source_id": _stable_source_id(link), "title": link.get("label") or link.get("title"), "publisher": link.get("publisher"), "url": link.get("url"), "locator": link_locator, "accessed_on": link.get("accessed_on") or link.get("verified_on"), "scope_limit": link.get("scope_limit") or link.get("limits")},
        "linkAccessedAt": link.get("accessed_on") or link.get("verified_on") or "2026-10-12",
        "linkConfidence": "medium",
        "linkEvidence": {"url": link.get("url"), "locator": link_locator, "supports": "Task-specific learning resource for the item", "access": link.get("access")},
        "linkKind": "free_task_specific_learning_resource",
        "linkLevel": link.get("level"),
        "linkLanguage": link.get("language") or "English",
        "linkAccess": link.get("access") or link.get("accessibility") or "Open resource; check the provider's current access terms.",
        "linkDuration": link.get("duration"),
        "guidanceOwner": "domain",
        "verifiedAt": "2026-10-12",
    }


def _area_item(row: dict[str, Any], decision: dict[str, Any]) -> dict[str, Any]:
    closure = row["closure"]
    sources = list(closure.get("evidence_sources") or [])
    explanatory = list(closure.get("explanatory_sources") or [])
    learning = list(closure.get("free_task_specific_learning_resources") or [])
    if decision.get("learning_link_override"):
        learning = [decision["learning_link_override"], *learning]
    if not sources or not learning:
        raise ValueError(f"Promoted area item lacks item evidence or task-specific learning link: {row.get('item_id')}")
    link = learning[0]
    if not _https(link.get("url")):
        raise ValueError(f"Promoted area item has an invalid learning URL: {row.get('item_id')}")
    source_refs = _sources_to_refs(sources + explanatory)
    linked_source = next((source for source in sources + explanatory if (source.get("source_id") or source.get("id")) == _stable_source_id(link) or source.get("url") == link.get("url")), {})
    link_title = link.get("title") or link.get("label") or linked_source.get("title") or f"Open learning resource ({urlparse(link['url']).netloc})"
    link_ref = _source_reference(link, "task_specific_learning_resource")
    if link_ref and link_ref["url"] not in {ref["url"] for ref in source_refs}:
        source_refs.append(link_ref)
    locators = _source_locators(sources + explanatory)
    link_locator = _source_locators([link], "task_specific_learning_resource")
    claims = {
        "item_identity": {"source_references": _sources_to_refs(sources), "source_locators": _source_locators(sources, "item_identity")},
        "checkpoint_fit": {"source_references": _sources_to_refs(sources), "source_locators": _source_locators(sources, "checkpoint_fit")},
        "plain_meaning": {"source_references": _sources_to_refs(explanatory or sources), "source_locators": _source_locators(explanatory or sources, "plain_meaning")},
        "contextual_use": {"source_references": _sources_to_refs(sources), "source_locators": _source_locators(sources, "contextual_use")},
    }
    if not all(value["source_references"] and value["source_locators"] for value in claims.values()):
        raise ValueError(f"Promoted area item has an incomplete claim source role: {row.get('item_id')}")
    output = closure.get("learner_output")
    output_text = None
    if isinstance(output, dict) and output.get("state") != "not_established_for_this_candidate":
        output_text = output.get("value") or output.get("description") or output.get("explanation")
    output_text = output_text or _explanation(decision.get("learner_output")) or _explanation(decision.get("task_use_and_output"))
    if output_text:
        claims["expected_output"] = claims["contextual_use"]
    item_type = _item_type(row.get("item_type", ""))
    category = closure.get("category") or "area_specific_enrichment"
    context_parts = [
        _explanation(decision.get("meaning_in_D078_and_area")),
        _explanation(decision.get("meaning_in_selected_programme")),
        _explanation(decision.get("task_use_and_output")),
        _explanation(decision.get("task_use")),
        _explanation(closure.get("meaning_in_D078_and_area")),
        _explanation(closure.get("meaning_in_selected_programme")),
    ]
    context_use = " ".join(dict.fromkeys(part for part in context_parts if part))
    if decision.get("display_scope"):
        context_use = f"{context_use} Route note: {decision['display_scope']}".strip()
    supplemental = closure.get("supplemental_research") or []
    source_ids = [ref.get("id") for ref in source_refs if ref.get("id")]
    geo = "nigeria_to_global" if any(str(source.get("jurisdiction") or "").casefold() == "nigeria" or "nigeria" in str(source.get("publisher") or "").casefold() for source in sources) else "global"
    limitations = list(closure.get("limitations_and_non_substitutions") or [])
    for repair in supplemental:
        if repair.get("item_limit"):
            limitations.append(repair["item_limit"])
        for unresolved in repair.get("unresolved", []):
            if unresolved.get("reason"):
                limitations.append(unresolved["reason"])
    if decision.get("display_scope") not in limitations:
        limitations.append(decision.get("display_scope", ""))
    requirement = "optional" if item_type == "tool" or "optional" in str(decision.get("display_scope", "")).casefold() else "useful"
    return {
        "contextLevel": "subgroup",
        "contextKey": row["area_id"],
        "domainId": DOMAIN,
        "itemType": item_type,
        "itemKey": row["item_id"],
        "name": row["label"],
        "plainMeaning": _explanation(decision.get("what_it_is")) or _explanation(closure.get("what_it_is")),
        "contextualUse": context_use,
        "expectedOutput": output_text or _explanation(decision.get("learner_output")) or _explanation(decision.get("task_use_and_output")),
        "themeKey": category,
        "themeLabel": str(category).replace("_", " ").capitalize(),
        "useCaseKey": row["area_id"].split(":", 1)[-1],
        "requirementLevel": requirement,
        "requirementReason": decision.get("display_scope"),
        "priority": None,
        "priorityReason": None,
        "learningOrder": None,
        # The closure's plain-text prerequisite notes are audit annotations,
        # not approved relationship edges. Only explicit local relationship
        # dispositions may surface as a learner-facing prerequisite.
        "prerequisites": list(decision.get("approved_prerequisite_labels") or []),
        "relatedItems": [],
        "relationships": [],
        "pathTargets": [],
        "sourceIds": list(dict.fromkeys(source_ids)),
        "sourceReferences": source_refs,
        "sourceLocators": locators + link_locator,
        "geographicScope": geo,
        "evidenceLimitations": [str(value) for value in limitations if value],
        "evidenceType": "source_supported_synthesis",
        "sourceConfidence": "medium",
        "dataState": "source_backed",
        "claimReviewState": "approved",
        "claimEvidence": {"claims": claims, "reviewed_by": "local_d078_item_disposition", "decision_id": decision.get("item_id")},
        "linkState": "linked",
        "linkUrl": link.get("url"),
        "linkTitle": link_title,
        "linkSourceReference": {**link, "source_id": _stable_source_id(link), "title": link_title, "locator": link.get("locator") or link.get("exact_locator")},
        "linkAccessedAt": link.get("accessed") or link.get("accessed_on") or "2026-10-12",
        "linkConfidence": "medium",
        "linkEvidence": {"url": link.get("url"), "locator": link.get("locator") or link.get("exact_locator"), "supports": link.get("what_it_teaches") or link.get("what_supported") or link.get("supports"), "access": link.get("cost_access") or link.get("access_cost")},
        "linkKind": "free_task_specific_learning_resource",
        "linkLevel": link.get("level"),
        "linkLanguage": link.get("language") or "English",
        "linkAccess": link.get("cost_access") or link.get("access_cost") or "Free learning resource; review the provider's current access terms.",
        "linkDuration": link.get("duration"),
        "guidanceOwner": "subgroup",
        "verifiedAt": "2026-10-12",
    }


@lru_cache(maxsize=1)
def d078_guided_content() -> dict[str, Any]:
    master = _read(MASTER_PATH)
    domain_contract = _domain_contract_records(master["domain_contract"])
    domain_items: list[dict[str, Any]] = []
    area_items: dict[str, list[dict[str, Any]]] = {}
    for entry in master.get("domain_items", []):
        row = entry["source_record"]
        decision = entry["disposition"]
        # The consolidated master is the final disposition authority. Do not
        # re-gate an approved row on superseded readiness fields in its source
        # handoff; those fields are not the current approval decision.
        if decision.get("approval_status", "approved") != "approved":
            continue
        contract_row = domain_contract.get(row.get("item_id"))
        if not contract_row:
            raise ValueError(f"D078 domain item does not resolve to the embedded type/source contract: {row.get('item_id')}")
        runtime_decision = {
            **decision,
            "display_scope": decision.get("display_scope") or decision.get("student_scope") or decision.get("use_case"),
        }
        domain_items.append(_domain_item(row, contract_row, runtime_decision))
    for area in master.get("areas", []):
        for entry in area.get("items", []):
            row = entry["source_record"]
            decision = entry["disposition"]
            if decision.get("approval_status", "approved") != "approved":
                continue
            # A supported alias is approved as content coverage but should
            # not create a duplicate learner choice beside its canonical card.
            if decision.get("learner_display_mode") == "consolidated_alias":
                continue
            runtime_decision = {
                **decision,
                "display_scope": decision.get("display_scope") or decision.get("student_scope") or decision.get("rationale"),
            }
            runtime_item = _area_item(row, runtime_decision)
            area_items.setdefault(row["area_id"], []).append(runtime_item)
    return {"domainItems": domain_items, "areaItems": area_items, "approvedCount": len(domain_items) + sum(len(rows) for rows in area_items.values())}


def d078_domain_context_items() -> list[dict[str, Any]]:
    return d078_guided_content()["domainItems"]


def d078_area_context_items(area_id: str) -> list[dict[str, Any]]:
    return list(d078_guided_content()["areaItems"].get(area_id, []))


def merge_d078_context_items(existing: list[dict[str, Any]] | None, promoted: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Merge only explicitly approved D078 identities, preferring local review."""
    by_identity = {
        (str(row.get("itemType") or ""), str(row.get("itemKey") or "")): row
        for row in (existing or [])
    }
    for row in promoted:
        by_identity[(str(row.get("itemType") or ""), str(row.get("itemKey") or ""))] = row
    return sorted(by_identity.values(), key=lambda row: (row.get("priority") or "optional", row.get("itemType") or "", row.get("name") or ""))
