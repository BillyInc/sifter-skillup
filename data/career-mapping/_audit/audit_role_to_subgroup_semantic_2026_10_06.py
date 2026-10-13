#!/usr/bin/env python3
"""Catalogue-wide semantic audit of active role -> subgroup paths.

This is deliberately disjoint from the role -> parent-domain queue.  The
current subgroup path is used only to select the records to audit; ISCO is not
treated as evidence that a role belongs in that subgroup.  The output is an
append-only, versioned register and checkpoint.  It never edits canonical
taxonomy or role-library files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INVENTORY = AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
ROLE_SOURCE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
STRUCTURE = ROOT / "domain_structure.json"
DOMAIN_REVIEWS = AUDIT / "domain_specialization_review_2026_10_03.json"
STEP1_SPECIALIZATION_REGISTER = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
COVERAGE_ROOT = AUDIT / "role_coverage_lanes_2026_10_05"
D045_COVERAGE = COVERAGE_ROOT / "D045_D084" / "role_coverage_candidate_register.json"
D085_COVERAGE_RECON = COVERAGE_ROOT / "D085_D168" / "role_coverage_candidate_reconciliation_2026_10_06.json"
COMPUTATIONAL_AUDIT = AUDIT / "computational_taxonomy_candidates_2026_10_05.json"

DEFAULT_RUN_ID = "001"

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "can", "for", "from",
    "in", "into", "is", "it", "of", "on", "or", "that", "the", "their", "this",
    "to", "use", "using", "with", "work", "works", "working", "role", "roles",
    "professional", "professionals", "provide", "provides", "support", "supports",
    "including", "related", "within", "other", "through", "such", "often", "also",
    "may", "will", "should", "under", "across", "based", "general", "tasks",
}

EXCLUDED_SUBGROUP_STATES = {"excluded", "review_only", "audit_only"}
EXCLUDED_ROLE_STATES = {"excluded", "review_only", "audit_only"}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(text(item) for item in value.values())
    return str(value).strip()


def normalize(value: Any) -> str:
    return re.sub(r"\s+", " ", text(value).casefold()).strip()


def stem(token: str) -> str:
    """Small deterministic stemmer for transparent lexical screening only."""
    token = token.casefold()
    for suffix in ("ications", "ation", "ments", "ment", "ings", "ing", "ers", "ies", "es", "s"):
        if len(token) > len(suffix) + 3 and token.endswith(suffix):
            return token[:-len(suffix)] if suffix != "ies" else token[:-3] + "y"
    return token


def tokens(value: Any) -> set[str]:
    words = re.findall(r"[a-z][a-z0-9]+", normalize(value))
    return {stem(word) for word in words if len(word) >= 4 and word not in STOPWORDS}


def phrase_terms(value: Any) -> set[str]:
    normalized = normalize(value)
    return {
        phrase
        for phrase in (
            "data analysis", "data collection", "software development", "system development",
            "systems engineering", "financial analysis", "financial management", "health care",
            "healthcare", "patient care", "clinical practice", "legal practice", "court proceedings",
            "construction management", "project management", "quality assurance", "risk assessment",
            "research methods", "statistical methods", "machine learning", "public policy",
            "social research", "emergency response", "security operations", "supply chain",
            "manufacturing process", "instructional design", "teaching learning", "laboratory analysis",
        )
        if phrase in normalized
    }


def current_active_subgroups(structure: dict[str, Any]) -> dict[tuple[str, str], dict[str, Any]]:
    active: dict[tuple[str, str], dict[str, Any]] = {}
    for domain_id, domain in structure.items():
        for subgroup in domain.get("subgroups") or []:
            code = text(subgroup.get("isco_submajor"))
            state = normalize(subgroup.get("data_state") or "active")
            if code and state not in EXCLUDED_SUBGROUP_STATES:
                active[(domain_id, code)] = subgroup
    return active


def role_key(row: dict[str, Any]) -> str:
    return text(row.get("role_key")) or f"{text(row.get('domain_id'))}|{text(row.get('role_name'))}"


def role_task_evidence(row: dict[str, Any]) -> str:
    return " ".join(
        part for part in (
            text(row.get("description")),
            text(row.get("role_description")),
            text(row.get("role_fit_review_basis")),
            text(row.get("domain_fit_review_basis")),
            text(row.get("role_evidence_summary")),
        ) if part
    ).strip()


def source_refs(row: dict[str, Any]) -> list[str]:
    refs = (
        row.get("domain_fit_review_source_refs")
        or row.get("role_fit_review_source_refs")
        or row.get("evidence_source_urls")
        or []
    )
    return sorted({text(ref) for ref in refs if text(ref)})


def current_role_mappings() -> list[dict[str, Any]]:
    """Build the audit input from current canonical role sources.

    The historical inventory is retained as provenance, but it predates the
    role-domain reconciliation and can therefore report stale parent-fit
    statuses and stale subgroup routes.  Current rows are deduplicated by the
    same exact role key used by the merged catalogue.
    """
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for path in ROLE_SOURCE_FILES:
        payload = read_json(path)
        rows = payload if isinstance(payload, list) else payload.get("roles", [])
        for row in rows:
            key = role_key(row)
            if key in seen:
                continue
            seen.add(key)
            copied = dict(row)
            if normalize(copied.get("subgroup_fit_status")) == "direct_domain_role":
                copied["isco_submajor"] = ""
            else:
                override = text(copied.get("subgroup_override_isco_submajor"))
                isco_group = re.sub(r"\D", "", text(copied.get("isco_group")))
                copied["isco_submajor"] = override or (isco_group[:2] if len(isco_group) >= 2 else "")
            result.append(copied)
    return result


def review_source_evidence(review: dict[str, Any], source_register: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    """Return only source records actually named by a domain review."""
    source_ids: set[str] = set()
    for area in review.get("specializations") or []:
        source_ids.update(text(item) for item in area.get("source_ids") or [] if text(item))
    evidence = []
    for source_id in sorted(source_ids):
        source = source_register.get(source_id)
        if source:
            evidence.append({
                "source_id": source_id,
                "publisher": text(source.get("publisher")),
                "title": text(source.get("title")),
                "url": text(source.get("url")),
                "locator": text(source.get("locator")),
                "claim_limit": text(source.get("claim_limit")),
            })
    return evidence


def domain_route_assessment(
    domain_id: str,
    domain_meta: dict[str, Any],
    structure_domain: dict[str, Any],
    role_rows: list[dict[str, Any]],
    review: dict[str, Any] | None,
    review_sources: list[dict[str, Any]],
) -> dict[str, Any]:
    active_roles = [
        row for row in role_rows
        if normalize(row.get("student_path_status") or "active") not in EXCLUDED_ROLE_STATES
    ]
    active_subgroups = [
        subgroup for subgroup in structure_domain.get("subgroups") or []
        if normalize(subgroup.get("data_state") or "active") not in EXCLUDED_SUBGROUP_STATES
    ]
    review_status = normalize((review or {}).get("review_status"))
    decision = text((review or {}).get("decision"))
    specialization_count = (review or {}).get("specialization_count")
    decision_lower = normalize(decision)
    source_reviewed = bool(review_sources)
    explicitly_direct = (
        any(phrase in decision_lower for phrase in (
            "recommend a direct domain-to-role route",
            "retain the direct domain-to-role route",
            "remain direct domain-to-role",
            "no specialization layer is warranted",
        ))
        and "reject" not in decision_lower
        and "rejected" not in decision_lower
    )
    recommends_specialization = bool(
        specialization_count and int(specialization_count) > 0
    ) or "candidate area" in decision_lower or "specialization" in decision_lower and "no specialization" not in decision_lower

    if not active_roles:
        if source_reviewed or review:
            route_disposition = "needs_role_enrichment_before_subgroup_decision"
            reason = "domain_has_no_active_role_mapping; existing global source review cannot be converted into a student subgroup path until role ownership is restored"
        else:
            route_disposition = "unresolved_ownership_and_role_enrichment"
            reason = "domain_has_no_active_role_mapping_and_no_domain-level global source review"
    elif explicitly_direct:
        route_disposition = "direct_domain_role_route_candidate"
        reason = "explicit global source review recommends a direct domain-to-role route; verify the role set before canonical approval"
    elif recommends_specialization and source_reviewed:
        route_disposition = "needs_supported_specialization_layer"
        reason = "global source review identifies a supported specialization set; current visible subgroup layer is absent and implementation is still pending"
    else:
        route_disposition = "unresolved_ownership_or_source_review"
        reason = "active roles exist but no authoritative, domain-specific decision proves either a direct route or a supported subgroup set"

    role_source_refs = sorted({ref for row in active_roles for ref in source_refs(row)})
    return {
        "domain_id": domain_id,
        "domain_name": text(domain_meta.get("domain_name")),
        "domain_scope": text(domain_meta.get("description")),
        "active_role_count": len(active_roles),
        "active_role_keys": sorted(role_key(row) for row in active_roles),
        "visible_subgroup_count": len(active_subgroups),
        "current_subgroup_records": [
            {
                "isco_submajor": text(item.get("isco_submajor")),
                "label": text(item.get("label")),
                "data_state": text(item.get("data_state") or "active"),
            }
            for item in structure_domain.get("subgroups") or []
        ],
        "domain_specialization_review_status": text((review or {}).get("review_status")) or "not_recorded",
        "domain_specialization_count_recommendation": specialization_count,
        "domain_specialization_decision": decision,
        "authoritative_global_source_evidence": review_sources,
        "existing_role_task_source_refs": role_source_refs,
        "route_disposition": route_disposition,
        "route_disposition_reason": reason,
        "nigerian_context_used": False,
        "canonical_change_recommended_by_this_scan": False,
    }


def normalize_coverage_candidates() -> list[dict[str, Any]]:
    """Load both coverage lanes into one auditable, non-canonical queue."""
    candidates: list[dict[str, Any]] = []
    if D045_COVERAGE.exists():
        document = read_json(D045_COVERAGE)
        for domain in document.get("domains") or []:
            for candidate in domain.get("candidates") or []:
                candidates.append({
                    "lane": "D045_D084",
                    "candidate_key": text(candidate.get("candidate_key")),
                    "domain_id": text(domain.get("domain_id")),
                    "domain_name": text(domain.get("domain_name")),
                    "active_role_count": domain.get("active_role_count"),
                    "candidate_title": text(candidate.get("title_or_family")),
                    "candidate_tasks": text(candidate.get("tasks")),
                    "parent_domain_fit": text(candidate.get("parent_domain_fit")),
                    "source_refs": sorted({text(x) for x in candidate.get("source_refs") or [] if text(x)}),
                    "recommendation_status": text(candidate.get("recommendation_status")),
                    "active_anchor_keys": [],
                    "comparison_result": None,
                })
    if D085_COVERAGE_RECON.exists():
        document = read_json(D085_COVERAGE_RECON)
        for candidate in document.get("candidates") or []:
            comparisons = candidate.get("active_exact_task_comparisons") or []
            candidates.append({
                "lane": "D085_D168",
                "candidate_key": text(candidate.get("candidate_key")),
                "domain_id": text(candidate.get("domain_id")),
                "domain_name": text(candidate.get("domain_name")),
                "active_role_count": candidate.get("active_role_count"),
                "candidate_title": text(candidate.get("candidate_title_or_family")),
                "candidate_tasks": text(candidate.get("candidate_task_evidence")),
                "parent_domain_fit": text(candidate.get("candidate_gap_basis")),
                "source_refs": sorted({text(x) for x in candidate.get("source_refs") or [] if text(x)}),
                "recommendation_status": text(candidate.get("original_recommendation_status")),
                "active_anchor_keys": sorted({text(x.get("role_key")) for x in comparisons if text(x.get("role_key"))}),
                "comparison_result": text(candidate.get("comparison_result")),
            })
    return sorted(candidates, key=lambda item: item["candidate_key"])


def classify_coverage_candidate(candidate: dict[str, Any]) -> tuple[str, str]:
    """Conservative queue classification; it never approves a new role."""
    blob = normalize(" ".join(
        text(candidate.get(field)) for field in (
            "candidate_title", "candidate_tasks", "parent_domain_fit", "recommendation_status", "comparison_result",
        )
    ))
    comparison = normalize(candidate.get("comparison_result"))
    recommendation = normalize(candidate.get("recommendation_status"))
    anchors = candidate.get("active_anchor_keys") or []
    if comparison == "already_active_exact_role_candidate_closed":
        return "no_addition_case", "candidate is already represented by an active exact role key"
    if "do_not_add" in recommendation or "no canonical" in recommendation or "specialization candidate only" in recommendation:
        return "no_addition_case", "source register explicitly withholds a new canonical role"
    if "overlap" in blob or "duplicate" in blob or "existing_record_or_exact_overlap" in comparison or anchors:
        return "duplicate_or_overlap", "candidate has an active comparable anchor or an explicit overlap/duplicate concern"
    if any(marker in comparison for marker in ("blocked_by_source", "missing_parent_scope", "zero_active_domain")):
        return "source_ownership_hold", "source, parent-scope, or role-ownership reconciliation is incomplete"
    if "inactive" in recommendation or "ownership" in blob or "jurisdiction" in blob or "regional" in blob:
        return "source_ownership_hold", "candidate is source-backed but title, ownership, jurisdiction, or activation evidence remains open"
    if (
        not anchors
        and candidate.get("source_refs")
        and ("direct fit" in blob or "strong potential fit" in blob)
        and "exact-key" in recommendation
    ):
        return "evidence_backed_missing_role", "source-backed task family has direct/strong parent-domain fit and no active exact anchor"
    return "source_ownership_hold", "candidate remains bounded but lacks enough exact-key evidence for a safe addition"


def classify_coverage_scope(candidate: dict[str, Any]) -> tuple[str, str]:
    """Classify the D085-D168 75-row queue by its requested semantic scope.

    This classification is separate from the four-way operational queue
    classification above.  It prevents a role-enrichment candidate from being
    counted as a specialization recommendation.
    """
    if candidate.get("lane") != "D085_D168":
        return "not_applicable_to_this_75_row_queue", "candidate belongs to the D045-D084 register"
    key = normalize(candidate.get("candidate_key"))
    blob = normalize(" ".join(text(candidate.get(field)) for field in (
        "candidate_title", "candidate_tasks", "parent_domain_fit", "recommendation_status", "comparison_result",
    )))
    comparison = normalize(candidate.get("comparison_result"))
    recommendation = normalize(candidate.get("recommendation_status"))
    if comparison == "already_active_exact_role_candidate_closed" or "do_not_add" in recommendation or "no canonical" in recommendation:
        return "no_addition", "the existing reconciliation explicitly closes or withholds a canonical addition"
    if (
        "specialization" in key
        or "specialization candidate" in blob
        or "area of specialization" in blob
        or "practice area" in blob
    ):
        return "area_of_specialization_subgroup_gap", "candidate is explicitly framed as a specialization/practice-area question; it is not counted as a role addition"
    if (
        candidate.get("active_anchor_keys")
        or "overlap" in blob
        or "duplicate" in blob
        or "ownership" in blob
        or "source" in comparison
        or "missing_parent_scope" in comparison
        or "zero_active_domain" in comparison
        or "blocked_by_source" in comparison
    ):
        return "duplicate_or_ownership_issue", "a comparable active role, source boundary, parent scope, or ownership blocker prevents treating the row as a clean role gap"
    return "role_coverage_gap", "source-backed candidate has no selected active exact anchor and remains a role-enrichment gap candidate"


def audit_row(row: dict[str, Any], subgroup: dict[str, Any]) -> dict[str, Any]:
    label = text(subgroup.get("label"))
    description = text(subgroup.get("description"))
    tasks = role_task_evidence(row)
    subgroup_tokens = tokens(f"{label} {description}")
    task_tokens = tokens(tasks)
    overlap = sorted(subgroup_tokens & task_tokens)
    subgroup_phrases = phrase_terms(f"{label} {description}")
    task_phrases = phrase_terms(tasks)
    phrase_overlap = sorted(subgroup_phrases & task_phrases)
    distinctive_label_tokens = sorted(tokens(label) & task_tokens)
    # The canonical role sources use ``domain_fit_review_status``.  Retain the
    # legacy field as a compatibility fallback so the subgroup audit consumes
    # the completed role->domain reconciliation rather than reporting every
    # row as not individually reviewed.
    domain_status = normalize(
        row.get("domain_fit_review_status") or row.get("role_to_domain_fit_status")
    )
    role_state = normalize(row.get("student_path_status") or "active")
    refs = source_refs(row)

    # An explicit, evidence-backed parent-domain rejection is the only
    # deterministic exclusion here.  A subgroup is nested in that domain, so
    # a rejected parent path cannot be a valid subgroup path.  We do not use
    # the ISCO code or the subgroup membership itself as proof.
    if domain_status in {"unsupported", "not_supported", "unsupported_for_domain"}:
        disposition = "deterministic_exclusion"
        reason = "existing_role_domain_review_explicitly_rejects_parent_domain"
    elif not tasks:
        disposition = "conditional_insufficient_evidence"
        reason = "role_has_no_task_or_role-fit-evidence_text_for_subgroup_comparison"
    elif not description and not label:
        disposition = "conditional_insufficient_evidence"
        reason = "subgroup_has_no_student-facing_label_or_scope_description"
    elif len(phrase_overlap) >= 1 or len(distinctive_label_tokens) >= 2:
        disposition = "supported_candidate"
        reason = "role-task_evidence_contains_subgroup-scope_anchor_terms"
    elif len(overlap) >= 1:
        disposition = "conditional_insufficient_evidence"
        reason = "partial_lexical_anchor_is_not_sufficient_for_semantic_sign-off"
    else:
        disposition = "conditional_insufficient_evidence"
        reason = "no_reliable_subgroup-task_anchor_found; do_not_auto-remove"

    return {
        "role_key": role_key(row),
        "domain_id": text(row.get("domain_id")),
        "domain_name": text(row.get("domain_name")),
        "role_name": text(row.get("role_name")),
        "subgroup_code": text(subgroup.get("isco_submajor")),
        "subgroup_label": label,
        "subgroup_description": description,
        "current_path_selector": "domain + current subgroup code; code is not fit evidence",
        "role_task_evidence": tasks,
        "existing_role_domain_fit_status": domain_status or "not_recorded",
        "existing_role_fit_source_refs": refs,
        "student_path_status": role_state or "active",
        "subgroup_task_anchor_terms": overlap,
        "subgroup_task_anchor_phrases": phrase_overlap,
        "disposition": disposition,
        "disposition_reason": reason,
        "isco_membership_used_as_fit_proof": False,
        "semantic_signoff": False,
    }


def build_register(run_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    inventory = read_json(INVENTORY)
    structure = read_json(STRUCTURE)
    domain_meta = read_json(ROOT / "domain_meta.json")
    domain_review_doc = read_json(DOMAIN_REVIEWS) if DOMAIN_REVIEWS.exists() else {}
    global_specialization_doc = (
        read_json(STEP1_SPECIALIZATION_REGISTER)
        if STEP1_SPECIALIZATION_REGISTER.exists()
        else {}
    )
    computational_doc = read_json(COMPUTATIONAL_AUDIT) if COMPUTATIONAL_AUDIT.exists() else {}
    domain_reviews = {
        text(item.get("domain_id")): item
        for item in domain_review_doc.get("domain_reviews") or []
        if text(item.get("domain_id"))
    }
    source_register = {
        text(item.get("source_id")): item
        for item in domain_review_doc.get("evidence_register") or []
        if text(item.get("source_id"))
    }
    rows = current_role_mappings()
    active_subgroups = current_active_subgroups(structure)
    entries = []
    not_selected = []
    for row in rows:
        role_state = normalize(row.get("student_path_status") or "active")
        if role_state in EXCLUDED_ROLE_STATES:
            continue
        code = text(row.get("isco_submajor"))
        pair = (text(row.get("domain_id")), code)
        if pair not in active_subgroups:
            not_selected.append(role_key(row))
            continue
        entries.append(audit_row(row, active_subgroups[pair]))
    entries.sort(key=lambda item: item["role_key"])
    counts = Counter(item["disposition"] for item in entries)
    roles_by_domain: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        roles_by_domain.setdefault(text(row.get("domain_id")), []).append(row)
    active_subgroup_by_domain: dict[str, int] = Counter()
    for (domain_id, _code) in active_subgroups:
        active_subgroup_by_domain[domain_id] += 1
    edge_domain_ids = sorted(
        domain_id for domain_id in structure
        if active_subgroup_by_domain.get(domain_id, 0) == 0
        or not [
            row for row in roles_by_domain.get(domain_id, [])
            if normalize(row.get("student_path_status") or "active") not in EXCLUDED_ROLE_STATES
        ]
    )
    route_assessments = []
    for domain_id in edge_domain_ids:
        review = domain_reviews.get(domain_id)
        route_assessments.append(domain_route_assessment(
            domain_id,
            domain_meta.get(domain_id) or {},
            structure.get(domain_id) or {},
            roles_by_domain.get(domain_id, []),
            review,
            review_source_evidence(review or {}, source_register),
        ))
    route_counts = Counter(item["route_disposition"] for item in route_assessments)
    coverage_candidates = normalize_coverage_candidates()
    coverage_entries = []
    for candidate in coverage_candidates:
        classification, reason = classify_coverage_candidate(candidate)
        scope_classification, scope_reason = classify_coverage_scope(candidate)
        coverage_entries.append({
            **candidate,
            "classification": classification,
            "classification_reason": reason,
            "scope_classification": scope_classification,
            "scope_classification_reason": scope_reason,
            "role_enrichment_candidate_only": True,
            "canonical_role_addition": False,
            "role_to_specialization_change": False,
            "nigerian_context_used": False,
        })
    coverage_counts = Counter(item["classification"] for item in coverage_entries)
    coverage_scope_counts = Counter(
        item["scope_classification"] for item in coverage_entries
        if item["lane"] == "D085_D168"
    )
    unresolved_domain_rows = [
        row for row in inventory.get("domains") or []
        if normalize(row.get("specialization_set_review_status")) == "not_individually_reviewed"
    ]
    register = {
        "schema_version": "2026-10-06.role-to-subgroup-semantic-register.v1",
        "run_id": run_id,
        "run_date": str(date.today()),
        "scope": "Every active role currently on an active domain->subgroup path in the merged catalogue.",
        "method": [
            "Use the already corrected domain -> subgroup/area-of-practice layer; this pass does not rebuild or reinterpret the specialization layer.",
            "Use current domain_structure.json subgroup label/description to define the claimed area-of-practice scope.",
            "Use merged inventory role task descriptions and existing role-fit evidence as the role evidence text.",
            "Use current subgroup code only to select the path under audit; never treat ISCO membership as fit proof.",
            "Only an explicit evidence-backed unsupported parent-domain decision is a deterministic exclusion.",
            "Lexical anchors are screening evidence; supported_candidate is not final semantic sign-off.",
            "No canonical domain_structure.json or role-library file is edited.",
        ],
        "global_authority_boundary": [
            {
                "publisher": "International Labour Organization",
                "title": "ISCO-08 structure and group definitions",
                "url": "https://www.ilo.org/publications/international-standard-classification-occupations-2008-isco-08-structure",
                "use": "occupation/task classification context only; ISCO grouping is not treated as proof of fit to a domain or subgroup",
            },
            {
                "publisher": "European Commission ESCO",
                "title": "ESCO occupations classification",
                "url": "https://esco.ec.europa.eu/en/classification/occupation_main",
                "use": "occupation descriptions and relevant skills/competences are task evidence; the catalogue still requires an independent subgroup-scope comparison",
            },
        ],
        "source_inputs": {
            "role_inventory": INVENTORY.relative_to(ROOT).as_posix(),
            "historical_role_inventory": INVENTORY.relative_to(ROOT).as_posix(),
            "current_role_sources": [path.relative_to(ROOT).as_posix() for path in ROLE_SOURCE_FILES],
            "subgroup_structure": STRUCTURE.relative_to(ROOT).as_posix(),
            "global_specialization_reconciliation": STEP1_SPECIALIZATION_REGISTER.relative_to(ROOT).as_posix() if STEP1_SPECIALIZATION_REGISTER.exists() else None,
            "merged_role_record_count": len(rows),
        },
        "global_specialization_reconciliation": {
            "catalogue_domain_count": global_specialization_doc.get("catalogue_domain_count", 0),
            "step1_decisions_dispositioned_count": global_specialization_doc.get("step1_decisions_dispositioned_count", 0),
            "step1_decisions_complete": global_specialization_doc.get("step1_decisions_complete", False),
            "canonical_taxonomy_changed_count": global_specialization_doc.get("canonical_taxonomy_changed_count", 0),
            "role_to_specialization_assigned_count": global_specialization_doc.get("role_to_specialization_assigned_count", 0),
            "nigerian_context_applied_count": global_specialization_doc.get("nigerian_context_applied_count", 0),
            "interpretation": "The completed specialization reconciliation supplies the parent area-of-practice layer; this register audits role fit within that corrected layer.",
        },
        "catalogue_counts": {
            "domains_in_structure": len(structure),
            "subgroup_records_in_structure": sum(len(domain.get("subgroups") or []) for domain in structure.values()),
            "active_subgroup_paths": len(active_subgroups),
            "merged_role_records": len(rows),
            "active_role_records": sum(1 for row in rows if normalize(row.get("student_path_status") or "active") not in EXCLUDED_ROLE_STATES),
            "active_roles_with_active_subgroup_path": len(entries),
            "active_roles_without_active_subgroup_path": len(not_selected),
            "domains_without_visible_subgroup": sum(1 for item in route_assessments if item["visible_subgroup_count"] == 0),
            "domains_without_active_role_mapping": sum(1 for item in route_assessments if item["active_role_count"] == 0),
            "domain_edge_cases_assessed": len(route_assessments),
            "role_coverage_candidates_loaded": len(coverage_entries),
            "role_coverage_candidate_domains": len({item["domain_id"] for item in coverage_entries}),
            "role_coverage_d085_d168_candidate_count": sum(1 for item in coverage_entries if item["lane"] == "D085_D168"),
            "role_coverage_d085_d168_candidate_domains_declared": 48,
            "unresolved_domain_structure_disposition_count": len(unresolved_domain_rows),
            "source_reviewed_specialization_recommendation_count": len(domain_reviews),
        },
        "disposition_counts": dict(sorted(counts.items())),
        "domain_route_disposition_counts": dict(sorted(route_counts.items())),
        "role_coverage_candidate_classification_counts": dict(sorted(coverage_counts.items())),
        "role_coverage_d085_d168_scope_classification_counts": dict(sorted(coverage_scope_counts.items())),
        "role_coverage_scope_is_separate_from_specialization_reviews": True,
        "unresolved_domain_structure_disposition_domain_ids": sorted(text(row.get("domain_id")) for row in unresolved_domain_rows),
        "entries": entries,
        "domain_route_assessments": route_assessments,
        "role_coverage_candidate_reconciliation": coverage_entries,
        "role_coverage_inputs": {
            "D045_D084_register": D045_COVERAGE.relative_to(ROOT).as_posix(),
            "D085_D168_reconciliation": D085_COVERAGE_RECON.relative_to(ROOT).as_posix(),
            "source_candidate_count_from_lanes": len(coverage_candidates),
        },
        "computational_coverage_audit": {
            "input": COMPUTATIONAL_AUDIT.relative_to(ROOT).as_posix(),
            "summary": computational_doc.get("summary") or {},
            "interpretation": text(computational_doc.get("interpretation")) or "not_available",
            "canonical_edits": False,
            "nigerian_context_used": False,
        },
        "out_of_scope_role_keys": sorted(not_selected),
        "register_integrity": {
            "unique_role_keys": len({item["role_key"] for item in entries}) == len(entries),
            "canonical_edits": False,
            "role_to_domain_queue_reused_as_subgroup_signoff": False,
            "all_current_zero_visible_or_zero_active_domain_cases_recorded": len(route_assessments) == len(edge_domain_ids),
            "nigerian_context_used": False,
            "all_loaded_role_coverage_candidates_classified": len(coverage_entries) == len(coverage_candidates),
        },
    }
    checkpoint = {
        "schema_version": "2026-10-06.role-to-subgroup-semantic-checkpoint.v1",
        "run_id": run_id,
        "register": f"role_to_subgroup_semantic_register_2026_10_06_{run_id}.json",
        "scope_complete_for_run": True,
        "counts": register["catalogue_counts"] | {"dispositions": register["disposition_counts"]},
        "domain_route_dispositions": register["domain_route_disposition_counts"],
        "role_coverage_candidate_classifications": register["role_coverage_candidate_classification_counts"],
        "role_coverage_candidate_count": len(register["role_coverage_candidate_reconciliation"]),
        "role_coverage_candidate_domain_count": len({item["domain_id"] for item in register["role_coverage_candidate_reconciliation"]}),
        "role_coverage_candidate_keys_by_classification": {
            classification: [
                item["candidate_key"] for item in register["role_coverage_candidate_reconciliation"]
                if item["classification"] == classification
            ]
            for classification in sorted(register["role_coverage_candidate_classification_counts"])
        },
        "zero_visible_subgroup_domain_ids": [
            item["domain_id"] for item in register["domain_route_assessments"] if item["visible_subgroup_count"] == 0
        ],
        "zero_active_role_domain_ids": [
            item["domain_id"] for item in register["domain_route_assessments"] if item["active_role_count"] == 0
        ],
        "unresolved_ownership_domain_ids": [
            item["domain_id"] for item in register["domain_route_assessments"]
            if item["route_disposition"] in {"unresolved_ownership_and_role_enrichment", "unresolved_ownership_or_source_review"}
        ],
        "deterministic_exclusion_role_keys": [
            item["role_key"] for item in entries if item["disposition"] == "deterministic_exclusion"
        ],
        "conditional_or_insufficient_role_keys": [
            item["role_key"] for item in entries if item["disposition"] == "conditional_insufficient_evidence"
        ],
        "supported_candidate_role_keys": [
            item["role_key"] for item in entries if item["disposition"] == "supported_candidate"
        ],
        "next_gate": "Resolve conditional/insufficient rows with subgroup-specific task evidence before any canonical role-to-subgroup edits.",
        "canonical_edits": False,
    }
    return register, checkpoint


def write_outputs(register: dict[str, Any], checkpoint: dict[str, Any], run_id: str) -> dict[str, str]:
    stem = f"role_to_subgroup_semantic_register_2026_10_06_{run_id}"
    json_path = AUDIT / f"{stem}.json"
    md_path = AUDIT / f"{stem}.md"
    checkpoint_path = AUDIT / f"role_to_subgroup_semantic_checkpoint_2026_10_06_{run_id}.md"
    existing = [path for path in (json_path, md_path, checkpoint_path) if path.exists()]
    if existing:
        raise FileExistsError(
            "append-only run id already exists; choose a new --run-id: "
            + ", ".join(path.name for path in existing)
        )
    json_path.write_text(json.dumps(register, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = register["catalogue_counts"]
    dispositions = register["disposition_counts"]
    md = [
        f"# Role → subgroup semantic audit register — 2026-10-06 run {run_id}",
        "",
        "This append-only register audits the current active role→subgroup paths separately from role→domain review. The subgroup code selects the path; it is not evidence of fit.",
        "",
        "## Coverage",
        "",
        f"- Merged role records inspected: **{counts['merged_role_records']:,}**.",
        f"- Active subgroup paths: **{counts['active_subgroup_paths']:,}**.",
        f"- Active roles with an active subgroup path audited: **{counts['active_roles_with_active_subgroup_path']:,}**.",
        f"- Active roles without an active subgroup path (out of scope for this register): **{counts['active_roles_without_active_subgroup_path']:,}**.",
        "",
        "## Dispositions",
        "",
        f"- Deterministic exclusions: **{dispositions.get('deterministic_exclusion', 0):,}**.",
        f"- Supported candidates requiring final semantic sign-off: **{dispositions.get('supported_candidate', 0):,}**.",
        f"- Conditional/insufficient-evidence rows: **{dispositions.get('conditional_insufficient_evidence', 0):,}**.",
        "",
        "A deterministic exclusion is emitted only when the existing role evidence explicitly rejects the parent domain. No role is removed merely because its ISCO group differs from a subgroup label, and no lexical match is treated as final sign-off.",
        "",
        "## Role-enrichment candidate reconciliation",
        "",
        f"The two existing coverage ledgers contribute **{counts['role_coverage_candidates_loaded']:,}** candidates across **{counts['role_coverage_candidate_domains']:,}** domains. They remain role-enrichment candidates, not new specialization proposals.",
        f"The D085-D168 queue contains the requested **{counts['role_coverage_d085_d168_candidate_count']:,}** candidates across **{counts['role_coverage_d085_d168_candidate_domains_declared']:,}** declared domains.",
        f"Existing source-reviewed specialization recommendations are kept separate: **{counts['source_reviewed_specialization_recommendation_count']:,}** domains; unresolved domain-structure dispositions: **{counts['unresolved_domain_structure_disposition_count']:,}** domains.",
        "",
    ]
    for classification, count in sorted(register["role_coverage_candidate_classification_counts"].items()):
        md.append(f"- `{classification}`: **{count:,}**.")
    for classification, count in sorted(register["role_coverage_d085_d168_scope_classification_counts"].items()):
        md.append(f"- D085-D168 scope `{classification}`: **{count:,}**.")
    md.extend([
        "",
        "Exact candidate keys by classification are stored in the checkpoint and full JSON register. No candidate was automatically added or assigned to a specialization.",
        "",
        "## Domain-level edge cases",
        "",
        f"The current files contain **{counts['domains_without_visible_subgroup']:,}** domains with no visible subgroup, not 72. The register records the current state from `domain_structure.json`; the difference should not be silently normalised.",
        f"It also contains **{counts['domains_without_active_role_mapping']:,}** domains with no active role mapping.",
        "",
        "Route dispositions:",
    ])
    for disposition, count in sorted(register["domain_route_disposition_counts"].items()):
        md.append(f"- `{disposition}`: **{count:,}** domain(s).")
    md.extend([
        "",
        "Exact zero-visible-subgroup domain IDs:",
        "",
        ", ".join(item["domain_id"] for item in register["domain_route_assessments"] if item["visible_subgroup_count"] == 0),
        "",
        "Exact zero-active-role domain IDs:",
        "",
        ", ".join(item["domain_id"] for item in register["domain_route_assessments"] if item["active_role_count"] == 0),
        "",
        "Unresolved ownership/source-review domain IDs:",
        "",
        ", ".join(
            item["domain_id"] for item in register["domain_route_assessments"]
            if item["route_disposition"] in {"unresolved_ownership_and_role_enrichment", "unresolved_ownership_or_source_review"}
        ),
        "",
        "Each domain entry in the JSON carries its scope, current subgroup records, active role keys, domain-review status, authoritative global source records when available, and the reason for its disposition. No Nigerian context is used in this pass.",
        "",
        "## Audit entry format",
        "",
        "Each entry records the exact role key, subgroup scope, role task/evidence text, source references, anchor terms, disposition, and whether ISCO was used as fit proof (always false).",
        "",
        "## Exact role keys by semantic disposition",
        "",
    ])
    for disposition in sorted(register["disposition_counts"]):
        md.extend([
            f"### `{disposition}` ({register['disposition_counts'][disposition]:,})",
            "",
            ", ".join(
                item["role_key"] for item in register["entries"]
                if item["disposition"] == disposition
            ),
            "",
        ])
    md.extend([
        f"Full machine-readable register: `{json_path.name}`.",
    ])
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")
    checkpoint = dict(checkpoint)
    checkpoint["register_json_sha256"] = hashlib.sha256(json_path.read_bytes()).hexdigest()
    checkpoint_lines = [
        f"# Role → subgroup semantic audit checkpoint — 2026-10-06 run {run_id}",
        "",
        "The full active role→subgroup path set has been scanned for this run. This checkpoint is evidence of coverage, not a claim that every conditional row is semantically resolved.",
        "",
        f"- Register: `{json_path.name}`",
        f"- Merged role records: **{counts['merged_role_records']:,}**",
        f"- Active subgroup paths: **{counts['active_subgroup_paths']:,}**",
        f"- Active role→subgroup records audited: **{counts['active_roles_with_active_subgroup_path']:,}**",
        f"- Deterministic exclusions: **{dispositions.get('deterministic_exclusion', 0):,}**",
        f"- Supported candidates: **{dispositions.get('supported_candidate', 0):,}**",
        f"- Conditional/insufficient evidence: **{dispositions.get('conditional_insufficient_evidence', 0):,}**",
        "",
        f"- Domain edge cases assessed: **{counts['domain_edge_cases_assessed']:,}**",
        f"- Domains without visible subgroup: **{counts['domains_without_visible_subgroup']:,}**",
        f"- Domains without active role mapping: **{counts['domains_without_active_role_mapping']:,}**",
        f"- Domain route dispositions: `{json.dumps(register['domain_route_disposition_counts'], sort_keys=True)}`",
        "",
        f"- Role-enrichment candidates loaded: **{counts['role_coverage_candidates_loaded']:,}** across **{counts['role_coverage_candidate_domains']:,}** domains.",
        f"- D085-D168 role-coverage candidates: **{counts['role_coverage_d085_d168_candidate_count']:,}** across **{counts['role_coverage_d085_d168_candidate_domains_declared']:,}** declared domains.",
        f"- Source-reviewed specialization recommendations kept separate: **{counts['source_reviewed_specialization_recommendation_count']:,}**; unresolved domain-structure dispositions kept separate: **{counts['unresolved_domain_structure_disposition_count']:,}**.",
        f"- Role-enrichment classifications: `{json.dumps(register['role_coverage_candidate_classification_counts'], sort_keys=True)}`",
        f"- D085-D168 scope classifications: `{json.dumps(register['role_coverage_d085_d168_scope_classification_counts'], sort_keys=True)}`",
        f"- Computational scan summary: `{json.dumps((register['computational_coverage_audit'].get('summary') or {}), sort_keys=True)}`",
        "",
        "Exact role-enrichment candidate keys by classification:",
    ]
    for classification in sorted(register["role_coverage_candidate_classification_counts"]):
        checkpoint_lines.extend([
            f"- `{classification}`:",
            ", ".join(
                item["candidate_key"] for item in register["role_coverage_candidate_reconciliation"]
                if item["classification"] == classification
            ),
        ])
    checkpoint_lines.extend([
        "",
        "Exact D085-D168 (75-row) candidate keys by requested scope classification:",
    ])
    for classification in sorted(register["role_coverage_d085_d168_scope_classification_counts"]):
        checkpoint_lines.extend([
            f"- `{classification}`:",
            ", ".join(
                item["candidate_key"] for item in register["role_coverage_candidate_reconciliation"]
                if item["lane"] == "D085_D168" and item["scope_classification"] == classification
            ),
        ])
    checkpoint_lines.extend([
        "",
        "Exact audited role keys by semantic disposition:",
    ])
    for disposition in sorted(register["disposition_counts"]):
        checkpoint_lines.extend([
            f"- `{disposition}`:",
            ", ".join(
                item["role_key"] for item in register["entries"]
                if item["disposition"] == disposition
            ),
        ])
    checkpoint_lines.extend([
        "",
        "Exact zero-visible-subgroup domain IDs:",
        ", ".join(item["domain_id"] for item in register["domain_route_assessments"] if item["visible_subgroup_count"] == 0),
        "",
        "Exact zero-active-role domain IDs:",
        ", ".join(item["domain_id"] for item in register["domain_route_assessments"] if item["active_role_count"] == 0),
        "",
        "Exact unresolved ownership/source-review domain IDs:",
        ", ".join(
            item["domain_id"] for item in register["domain_route_assessments"]
            if item["route_disposition"] in {"unresolved_ownership_and_role_enrichment", "unresolved_ownership_or_source_review"}
        ),
        "",
        "",
        "Canonical files changed: **no**.",
        "",
        f"Register SHA-256: `{checkpoint['register_json_sha256']}`",
        "",
        "Next gate: resolve conditional/insufficient role→subgroup rows and role-enrichment candidates with subgroup/domain-specific task evidence, then prepare a separately reviewed canonical correction set.",
    ])
    checkpoint_path.write_text("\n".join(checkpoint_lines) + "\n", encoding="utf-8")
    return {"json": json_path.as_posix(), "markdown": md_path.as_posix(), "checkpoint": checkpoint_path.as_posix()}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", default=DEFAULT_RUN_ID)
    args = parser.parse_args()
    register, checkpoint = build_register(args.run_id)
    paths = write_outputs(register, checkpoint, args.run_id)
    print(json.dumps({"counts": register["catalogue_counts"], "dispositions": register["disposition_counts"], "outputs": paths}, indent=2))


if __name__ == "__main__":
    main()
