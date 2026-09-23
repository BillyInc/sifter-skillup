"""Audit the full-population admin accepted/internal evidence boundary.

This is a read-only local audit for the scaling lane.  It scans the canonical
contextual catalogue, projects it through the 237 CCMAS supporting packages and
the 420-identity JAMB student lookup population, and applies the admin
accepted-view rule without changing runtime code.  A row is accepted only when
approval is explicit, ownership matches the context level, provenance is
traceable, and an access date is present.  Linked or source-backed rows are
not promoted implicitly.

The audit does not fetch URLs, apply SQL, edit transport, or claim browser
proof.  It intentionally reports an empty accepted view when the local
catalogue has no explicit approval state, while retaining every other row as
internal evidence or review queue material.
"""

from __future__ import annotations

import gzip
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"
PROGRAMME_MAP = ROOT / "data" / "career-mapping" / "programme_domain_final.json"
SCALING = AUDIT / "programme_scaling_contract_2026-09-19.json"
BROAD = AUDIT / "source_enrichment_batch_broad_2026-09-19.json"
EVIDENCE_SOURCE = ROOT / "src" / "screens" / "admin" / "adminGuidanceEvidence.ts"
PANEL_SOURCE = ROOT / "src" / "components" / "admin" / "AdminGuidanceEvidencePanel.tsx"
OUT_JSON = AUDIT / "ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.json"
OUT_MD = AUDIT / "ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.md"
ROUTE_AUDIT = AUDIT / "ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json"
JAMB_ROUTE_AUDIT = AUDIT / "DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json"
JAMB_MAPPING_RECONCILIATION = AUDIT / "JAMB_MAPPING_REVIEW_RECONCILIATION_2026-09-23_001.json"

CONTEXT_LEVELS = {"programme", "domain", "subgroup", "role"}
APPROVED_STATES = {"approved", "approved_guidance_v1"}
BLOCKED_STATES = {
    "review_required",
    "no_link",
    "not_established",
    "audit_only",
    "unavailable",
    "review_only",
}
EXPLICIT_STATE_KEYS = (
    "evidence_state",
    "evidenceState",
    "review_state",
    "reviewState",
    "review_status",
    "reviewStatus",
    "approval_state",
    "approvalState",
)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return str(value or "").strip().casefold().replace("-", "_")


def explicit_state(row: dict[str, Any]) -> str | None:
    for key in EXPLICIT_STATE_KEYS:
        value = norm(row.get(key))
        if not value:
            continue
        if value in {"approved", "approved_guidance_v1"}:
            return value
        if value in {"verified", "confirmed"}:
            return "verified"
        if value in BLOCKED_STATES:
            return value
        return value
    return None


def has_trace(row: dict[str, Any]) -> bool:
    scalar_keys = ("source_url", "sourceUrl", "source_locator", "sourceLocator")
    if any(isinstance(row.get(key), str) and row[key].strip() for key in scalar_keys):
        return True
    for key in ("source_references", "sourceReferences", "source_locators", "sourceLocators"):
        value = row.get(key)
        if isinstance(value, list) and any(item not in (None, "", {}, []) for item in value):
            return True
    return False


def has_access_date(row: dict[str, Any]) -> bool:
    for key in (
        "source_accessed_at",
        "sourceAccessedAt",
        "accessed_at",
        "accessedAt",
        "observed_at",
        "observedAt",
        "verified_at",
        "verifiedAt",
    ):
        if isinstance(row.get(key), str) and row[key].strip():
            return True
    return False


def context_level(row: dict[str, Any]) -> str:
    return norm(row.get("context_level") or row.get("level"))


def context_key(row: dict[str, Any]) -> str:
    return str(row.get("context_key") or row.get("contextKey") or "").strip()


def owner(row: dict[str, Any]) -> str:
    return norm(row.get("guidance_owner") or row.get("guidanceOwner") or row.get("owner"))


def blocked_link_or_data_state(row: dict[str, Any]) -> str | None:
    for key in ("link_state", "linkState", "data_state", "dataState", "relationship_status", "relationshipStatus"):
        value = norm(row.get(key))
        if value in BLOCKED_STATES:
            return value
    return None


def acceptance_reason(row: dict[str, Any]) -> str:
    state = explicit_state(row)
    if state in BLOCKED_STATES:
        return state
    blocked = blocked_link_or_data_state(row)
    if blocked:
        return blocked
    level = context_level(row)
    if level not in CONTEXT_LEVELS or not context_key(row):
        return "identity_incomplete"
    guidance_owner = owner(row)
    if not guidance_owner:
        return "identity_incomplete"
    if guidance_owner != level:
        return "owner_mismatch"
    if state not in APPROVED_STATES:
        return "awaiting_explicit_approval"
    if not has_trace(row) or not has_access_date(row):
        return "provenance_incomplete"
    return "accepted"


def empty_stats() -> dict[str, Any]:
    return {
        "rows": 0,
        "acceptedRows": 0,
        "internalRows": 0,
        "reasons": Counter(),
        "explicitStates": Counter(),
        "linkStates": Counter(),
        "dataStates": Counter(),
        "traceableRows": 0,
        "accessDatedRows": 0,
        "levels": Counter(),
    }


def update_stats(stats: dict[str, Any], row: dict[str, Any]) -> str:
    reason = acceptance_reason(row)
    stats["rows"] += 1
    stats["reasons"][reason] += 1
    stats["explicitStates"][explicit_state(row) or "missing"] += 1
    stats["linkStates"][norm(row.get("link_state") or row.get("linkState")) or "missing"] += 1
    stats["dataStates"][norm(row.get("data_state") or row.get("dataState")) or "missing"] += 1
    stats["levels"][context_level(row) or "missing"] += 1
    if has_trace(row):
        stats["traceableRows"] += 1
    if has_access_date(row):
        stats["accessDatedRows"] += 1
    if reason == "accepted":
        stats["acceptedRows"] += 1
    else:
        stats["internalRows"] += 1
    return reason


def serialise_stats(stats: dict[str, Any]) -> dict[str, Any]:
    result = dict(stats)
    for key in ("reasons", "explicitStates", "linkStates", "dataStates", "levels"):
        result[key] = dict(sorted(stats[key].items()))
    return result


def active_domains(programme_map: dict[str, Any]) -> dict[str, list[str]]:
    active_match_types = {"direct", "functional", "adjacent"}
    return {
        programme_key: sorted(
            {
                str(link.get("domain_id"))
                for link in row.get("links") or []
                if link.get("domain_id") and norm(link.get("match_type")) in active_match_types
            }
        )
        for programme_key, row in programme_map.items()
    }


def iter_catalogue_array(array_name: str) -> Iterable[dict[str, Any]]:
    """Stream one top-level catalogue array without buffering 121k rows."""
    decoder = json.JSONDecoder()
    marker = f'"{array_name}"'
    with gzip.open(CATALOGUE, "rt", encoding="utf-8") as stream:
        buffer = ""
        found = False
        started = False
        finished = False
        while not finished:
            chunk = stream.read(1024 * 1024)
            if chunk:
                buffer += chunk
            elif not buffer:
                break
            if not found:
                marker_index = buffer.find(marker)
                if marker_index < 0:
                    if chunk:
                        buffer = buffer[-len(marker):]
                        continue
                    break
                buffer = buffer[marker_index + len(marker):]
                found = True
            if not started:
                bracket_index = buffer.find("[")
                if bracket_index < 0:
                    if chunk:
                        continue
                    break
                buffer = buffer[bracket_index + 1:]
                started = True
            while True:
                buffer = buffer.lstrip()
                if buffer.startswith("]"):
                    finished = True
                    break
                if buffer.startswith(","):
                    buffer = buffer[1:]
                    continue
                if not buffer:
                    break
                try:
                    value, end = decoder.raw_decode(buffer)
                except json.JSONDecodeError:
                    break
                if isinstance(value, dict):
                    yield value
                buffer = buffer[end:]


def scan_catalogue() -> tuple[dict[str, Any], dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    global_stats = {"items": empty_stats(), "relationships": empty_stats()}
    domain_stats: dict[str, dict[str, Any]] = defaultdict(lambda: {"items": empty_stats(), "relationships": empty_stats(), "contexts": set()})
    for kind in ("items", "relationships"):
        for row in iter_catalogue_array(kind):
            update_stats(global_stats[kind], row)
            domain_key = str(row.get("domain_key") or row.get("context_key") or "").split("|", 1)[0]
            if domain_key:
                domain_stats[domain_key][kind] and update_stats(domain_stats[domain_key][kind], row)
                domain_stats[domain_key]["contexts"].add((context_level(row), context_key(row)))
    return global_stats, domain_stats, {"payloadKeys": ["items", "relationships"]}


def projection(stats: dict[str, Any], domains: Iterable[str]) -> dict[str, Any]:
    result = {"items": empty_stats(), "relationships": empty_stats(), "contexts": set()}
    for domain in domains:
        source = stats.get(domain)
        if not source:
            continue
        for kind in ("items", "relationships"):
            target = result[kind]
            value = source[kind]
            target["rows"] += value["rows"]
            target["acceptedRows"] += value["acceptedRows"]
            target["internalRows"] += value["internalRows"]
            target["traceableRows"] += value["traceableRows"]
            target["accessDatedRows"] += value["accessDatedRows"]
            for key in ("reasons", "explicitStates", "linkStates", "dataStates", "levels"):
                target[key].update(value[key])
        result["contexts"].update(source["contexts"])
    return result


def synthetic_blocked_state_checks() -> dict[str, Any]:
    results = {}
    base = {
        "context_level": "domain",
        "context_key": "D001",
        "guidance_owner": "domain",
        "source_url": "https://example.org/exact-item",
        "source_locator": "lines 1-4",
        "verified_at": "2026-09-23",
        "evidence_state": "approved",
    }
    for state in ("review_required", "no_link", "not_established", "audit_only"):
        row = dict(base)
        row["link_state"] = state
        results[state] = {"accepted": acceptance_reason(row) == "accepted", "reason": acceptance_reason(row)}
    return results


def contract_checks() -> dict[str, Any]:
    evidence = EVIDENCE_SOURCE.read_text(encoding="utf-8")
    panel = PANEL_SOURCE.read_text(encoding="utf-8")
    evidence_markers = (
        "canExposeToStudents",
        "hasSourceTrace",
        "sourceAccessedAt",
        "guidanceOwner",
        "adminEvidenceQueueState",
        "partitionAdminGuidanceEvidence",
    )
    panel_markers = ("accepted", "internal", "acceptedView", "canExposeToStudents")
    return {
        "evidencePolicyMarkers": {marker: marker in evidence for marker in evidence_markers},
        "dashboardPartitionMarkers": {marker: marker in panel for marker in panel_markers},
        "acceptedViewPartitionContract": all(marker in panel for marker in panel_markers),
        "strictEvidenceContract": all(marker in evidence for marker in evidence_markers),
    }


def route_availability_review(route_audit: dict[str, Any]) -> dict[str, Any]:
    """Separate CCMAS-package route gaps from the JAMB lookup population."""
    rows = route_audit.get("programmes") or []
    unavailable = [
        row for row in rows
        if (row.get("university") or {}).get("routeState") != "available"
    ]
    missing_jamb = [
        row for row in rows
        if "no_jamb_identity" in (row.get("missingRouteReasons") or [])
    ]
    missing_offering = [
        row for row in rows
        if "no_university_offering" in (row.get("missingRouteReasons") or [])
    ]
    broken_routes = [
        row for row in rows
        if not (row.get("routes") or {}).get("fullDownstreamCoverage")
        or not (row.get("domain") or {}).get("activeLinkCount")
    ]
    # A missing JAMB identity/offering needs a source-backed mapping or a live
    # seed change. The local contract deliberately contains neither, so this
    # pass must not invent a resolution or relabel it as a broken route.
    return {
        "programmeCount": len(rows),
        "ccmasSupportingProgrammeCount": len(rows),
        "availableUniversityRoutes": len(rows) - len(unavailable),
        "availableSupportingProgrammeRoutes": len(rows) - len(unavailable),
        "explicitUnavailableProgrammes": len(unavailable),
        "explicitUnavailableSupportingPackages": len(unavailable),
        "missingUniversityJambIdentityStates": len(missing_jamb),
        "missingUniversityOfferingStates": len(missing_offering),
        "brokenDownstreamRouteProgrammes": len(broken_routes),
        "brokenDownstreamRouteKeys": [row.get("programmeKey") for row in broken_routes],
        "unavailableProgrammeKeys": [row.get("programmeKey") for row in unavailable],
        "reviewRequiredJambIdentities": int((route_audit.get("reviewOnlyBoundary") or {}).get("reviewOnlyJambIdentities") or 0),
        "unavailableStatesAreExplicit": all(
            bool((row.get("university") or {}).get("missingRouteStateExplicit"))
            for row in unavailable
        ),
        "safeLocalResolution": {
            "missingUniversityJambIdentity": False,
            "missingUniversityOffering": False,
            "reason": "No checked-in authoritative JAMB identity or university offering exists for these programme keys; resolving them locally would require inference or external/live data.",
        },
    }


def build_report() -> dict[str, Any]:
    scaling = load_json(SCALING)
    broad = load_json(BROAD)
    route_audit = load_json(ROUTE_AUDIT)
    jamb_route_audit = load_json(JAMB_ROUTE_AUDIT)
    jamb_mapping = load_json(JAMB_MAPPING_RECONCILIATION)
    programme_map = active_domains(load_json(PROGRAMME_MAP))
    global_stats, domain_stats, catalogue_meta = scan_catalogue()

    programme_rows = []
    for row in sorted(scaling["programmes"], key=lambda value: value["programmeKey"]):
        key = row["programmeKey"]
        projected = projection(domain_stats, programme_map.get(key, []))
        items = serialise_stats(projected["items"])
        relationships = serialise_stats(projected["relationships"])
        programme_rows.append(
            {
                "programmeKey": key,
                "activeDomainIds": programme_map.get(key, []),
                "catalogueRows": items["rows"] + relationships["rows"],
                "acceptedRows": items["acceptedRows"] + relationships["acceptedRows"],
                "internalRows": items["internalRows"] + relationships["internalRows"],
                "itemRows": items,
                "relationshipRows": relationships,
                "programmeReview": {
                    "resourceState": row.get("resource_review", {}).get("state"),
                    "relationshipState": row.get("relationship_review", {}).get("state"),
                    "adminState": row.get("admin_review", {}).get("state"),
                    "accepted": False,
                },
            }
        )

    jamb_rows = []
    for row in sorted(broad["jamb_identities"], key=lambda value: value["jamb_name"]):
        component_refs = [str(value) for value in row.get("component_refs") or []]
        domains = sorted({domain for key in component_refs for domain in programme_map.get(key, [])})
        projected = projection(domain_stats, domains)
        items = serialise_stats(projected["items"])
        relationships = serialise_stats(projected["relationships"])
        source_references = row.get("source_references") or []
        jamb_rows.append(
            {
                "jambName": row["jamb_name"],
                "coverageCategory": row.get("coverage_category"),
                "mappingStatus": row.get("mapping_status"),
                "componentRefs": component_refs,
                "activeDomainIds": domains,
                "catalogueRows": items["rows"] + relationships["rows"],
                "acceptedRows": items["acceptedRows"] + relationships["acceptedRows"],
                "internalRows": items["internalRows"] + relationships["internalRows"],
                "itemRows": items,
                "relationshipRows": relationships,
                "sourceReferenceCount": len(source_references),
                "resourceReviewState": (row.get("external_enrichment") or {}).get("resources"),
                "relationshipReviewState": (row.get("external_enrichment") or {}).get("relationships"),
                "accepted": False,
            }
        )

    item_stats = serialise_stats(global_stats["items"])
    relationship_stats = serialise_stats(global_stats["relationships"])
    synthetic = synthetic_blocked_state_checks()
    contracts = contract_checks()
    all_programme_rows = len(programme_rows) == 237 and all(row["acceptedRows"] == 0 for row in programme_rows)
    all_jamb_rows = len(jamb_rows) == 420 and all(row["acceptedRows"] == 0 for row in jamb_rows)
    blocked_internal = all(not value["accepted"] for value in synthetic.values())
    route_availability = route_availability_review(route_audit)
    jamb_contract = jamb_route_audit.get("jambRouteContract") or {}
    route_availability.update(
        {
            "studentLookupPopulation": "jamb_identities",
            "jambLookupPopulationCount": int((jamb_route_audit.get("scope") or {}).get("jambIdentityCount") or 0),
            "jambLookupPopulationComplete": bool(jamb_contract.get("all420IdentitiesPresent")),
            "ccmasPackagesAreSupportingEvidenceOnly": True,
            "missingCcmasAnchorDoesNotHideJambIdentity": bool(jamb_contract.get("missingCcmasDoesNotFailJambRoute")),
            "unresolvedRelationshipsAreInternalNonBlockingCoverage": True,
            "mappingReviewReconciliation": {
                "jambIdentityCount": int((jamb_mapping.get("scope") or {}).get("jambIdentityCount") or 0),
                "mappingReviewIdentityCount": int((jamb_mapping.get("scope") or {}).get("mappingReviewIdentityCount") or 0),
                "itemSpecificAuthoritativeDownstreamEvidence": int((jamb_mapping.get("mappingEvidenceReview") or {}).get("reviewRowsWithItemSpecificAuthoritativeEvidence") or 0),
                "promotedRows": int((jamb_mapping.get("mappingEvidenceReview") or {}).get("reviewRowsPromoted") or 0),
                "remainingInternalRows": int((jamb_mapping.get("mappingEvidenceReview") or {}).get("reviewRowsRemainingInternal") or 0),
                "resourceAvailabilityStates": (jamb_mapping.get("resourceAvailability") or {}).get("states") or {},
            },
        }
    )
    report = {
        "schemaVersion": "2026-09-23.admin-acceptance-scale-audit.v2",
        "auditName": "admin_acceptance_scale",
        "generatedOn": "2026-09-23",
        "mode": "read_only_local",
        "scope": {
            "programmeCount": len(programme_rows),
            "ccmasSupportingProgrammeCount": len(programme_rows),
            "jambIdentityCount": len(jamb_rows),
            "studentLookupPopulation": "jamb_identities",
            "ccmasPackagesAreSupportingEvidenceOnly": True,
            "activeProgrammeDomainLinks": sum(len(domains) for domains in programme_map.values()),
            "contextualItemRows": item_stats["rows"],
            "contextualRelationshipRows": relationship_stats["rows"],
        },
        "catalogue": catalogue_meta,
        "routeAvailability": route_availability,
        "globalRows": {"items": item_stats, "relationships": relationship_stats},
        "jambMappingReview": jamb_mapping,
        "acceptedView": {
            "acceptedRows": item_stats["acceptedRows"] + relationship_stats["acceptedRows"],
            "internalRows": item_stats["internalRows"] + relationship_stats["internalRows"],
            "explicitApprovalRequired": True,
            "ownerMatchRequired": True,
            "traceAndAccessDateRequired": True,
            "acceptedRowsWithMissingApproval": 0,
            "acceptedRowsWithOwnerMismatch": 0,
            "acceptedRowsWithMissingTrace": 0,
            "acceptedRowsWithMissingAccessDate": 0,
            "blockedStatesInternal": blocked_internal,
            "syntheticBlockedStateChecks": synthetic,
        },
        "coverage": {
            "allProgrammesAudited": all_programme_rows,
            "allJambIdentitiesAudited": all_jamb_rows,
            "programmeRows": programme_rows,
            "jambIdentities": jamb_rows,
        },
        "dashboardContract": contracts,
        "decision": {
            "acceptedViewBoundaryPasses": (
                contracts["strictEvidenceContract"]
                and contracts["acceptedViewPartitionContract"]
                and all_programme_rows
                and all_jamb_rows
                and blocked_internal
                and bool(jamb_mapping.get("decision", {}).get("all420JambIdentitiesPresent"))
                and bool(jamb_mapping.get("decision", {}).get("exactly86MappingReviewIdentitiesReconciled"))
                and bool(jamb_mapping.get("decision", {}).get("noIdentityPromotedWithoutItemSpecificEvidence"))
                and bool(jamb_mapping.get("decision", {}).get("reviewQueueRemainsInternal"))
            ),
            "routeAvailabilityReviewed": (
                route_availability["unavailableStatesAreExplicit"]
                and route_availability["brokenDownstreamRouteProgrammes"] == 0
            ),
            "jambLookupPopulationPolicyPasses": (
                route_availability["jambLookupPopulationComplete"]
                and route_availability["missingCcmasAnchorDoesNotHideJambIdentity"]
            ),
            "unresolvedRelationshipsAreNonBlockingCoverage": True,
            "fullAdminRenderAccepted": False,
            "studentExposureApproved": False,
            "browserProof": False,
            "sqlApplied": False,
            "reason": "The local accepted/internal boundary is verified across the full catalogue projection, but no live dashboard payload, browser render or SQL deployment is claimed. Explicit approval is absent from the canonical catalogue, so linked/source-backed rows remain internal until an authorised approval is recorded.",
        },
        "inputs": [
            "data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json",
            "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
            "data/career-mapping/contextual_guidance_items.json.gz",
            "data/career-mapping/programme_domain_final.json",
            "data/career-mapping/_audit/ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json",
            "src/screens/admin/adminGuidanceEvidence.ts",
            "src/components/admin/AdminGuidanceEvidencePanel.tsx",
            "data/career-mapping/_audit/JAMB_MAPPING_REVIEW_RECONCILIATION_2026-09-23_001.json",
        ],
    }
    return report


def render_markdown(report: dict[str, Any]) -> str:
    scope = report["scope"]
    accepted = report["acceptedView"]
    items = report["globalRows"]["items"]
    relationships = report["globalRows"]["relationships"]
    route_availability = report["routeAvailability"]
    decision = report["decision"]
    lines = [
        "# Admin acceptance scaling audit (2026-09-23)",
        "",
        "Read-only local audit of the dashboard accepted/internal evidence boundary. It keeps the 420-identity JAMB student lookup population separate from the 237 CCMAS supporting packages. It does not change implementation, SQL, transport, external sources, or browser proof.",
        "",
        "## Scope",
        "",
        f"- CCMAS supporting packages audited: **{scope['ccmasSupportingProgrammeCount']}**; student lookup population: **{scope['jambIdentityCount']}** canonical JAMB identities.",
        f"- Contextual rows scanned: **{scope['contextualItemRows']:,}** items and **{scope['contextualRelationshipRows']:,}** relationships.",
        "",
        "## Accepted versus internal",
        "",
        f"- Accepted-view rows: **{accepted['acceptedRows']:,}**.",
        f"- Internal/review rows: **{accepted['internalRows']:,}**.",
        "- Acceptance requires an explicit approved state, stable context identity, matching guidance owner, traceable source URL/locator/reference, and an access date.",
        "- `linked` and `source_backed` are not treated as explicit approval; they remain internal until approval is recorded.",
        f"- Internal-only state checks (`review_required`, `no_link`, `not_established`, `audit_only`): **{'PASS' if accepted['blockedStatesInternal'] else 'OPEN'}**.",
        "",
        "## State inventory",
        "",
        f"- Items: {items['linkStates']} link states; {items['reasons']} accepted/internal reasons.",
        f"- Relationships: {relationships['dataStates']} data states; {relationships['reasons']} accepted/internal reasons.",
        "",
        "## Population coverage",
        "",
        f"- 237-programme projection: **{'PASS' if report['coverage']['allProgrammesAudited'] else 'OPEN'}**; every programme row is present and has zero accepted rows under the strict local contract.",
        f"- 420-JAMB projection: **{'PASS' if report['coverage']['allJambIdentitiesAudited'] else 'OPEN'}**; every identity is present and has zero accepted rows under the strict local contract.",
        "- Programme resource/relationship review states and JAMB resource/relationship review states remain internal queues; source references do not promote them. Unresolved item-to-item relationships are non-blocking coverage for this audit.",
        "",
        "## Supporting-package route boundary",
        "",
        f"- University route available for supporting CCMAS packages: **{route_availability['availableSupportingProgrammeRoutes']} / {route_availability['ccmasSupportingProgrammeCount']}**.",
        f"- Explicit supporting-package gaps: **{route_availability['explicitUnavailableSupportingPackages']}**; missing `university_jamb_identity`: **{route_availability['missingUniversityJambIdentityStates']}**; missing `university_offering`: **{route_availability['missingUniversityOfferingStates']}**.",
        f"- Broken downstream route programmes (domain/subgroup/role): **{route_availability['brokenDownstreamRouteProgrammes']}**.",
        f"- JAMB lookup population: **{route_availability['jambLookupPopulationCount']} / 420**; all identities present: **{'PASS' if route_availability['jambLookupPopulationComplete'] else 'OPEN'}**.",
        f"- Missing CCMAS anchors do not hide JAMB identities: **{'PASS' if route_availability['missingCcmasAnchorDoesNotHideJambIdentity'] else 'OPEN'}**.",
        f"- Review-required JAMB identities kept separate: **{route_availability['reviewRequiredJambIdentities']}**.",
        f"- Resource availability versus downstream mapping review: **{route_availability['mappingReviewReconciliation']['resourceAvailabilityStates']}** resources; **{route_availability['mappingReviewReconciliation']['mappingReviewIdentityCount']}** mapping-review identities; **{route_availability['mappingReviewReconciliation']['itemSpecificAuthoritativeDownstreamEvidence']}** with item-specific downstream evidence; **{route_availability['mappingReviewReconciliation']['remainingInternalRows']}** remain internal.",
        f"- Safe local resolution: **{'YES' if route_availability['safeLocalResolution']['missingUniversityJambIdentity'] and route_availability['safeLocalResolution']['missingUniversityOffering'] else 'NO'}** — no authoritative checked-in identity/offering exists; do not infer one.",
        "",
        "## Decision",
        "",
        f"- Local accepted/internal boundary: **{'PASS' if decision['acceptedViewBoundaryPasses'] else 'OPEN'}**.",
        f"- Supporting-package route review: **{'PASS' if decision['routeAvailabilityReviewed'] else 'OPEN'}**; package gaps are explicit and broken routes are counted separately.",
        f"- JAMB lookup-scope policy: **{'PASS' if decision['jambLookupPopulationPolicyPasses'] else 'OPEN'}**; unresolved relationships remain non-blocking internal coverage.",
        "- Full rendered admin acceptance: **NOT CLAIMED**.",
        "- Browser proof, live payload proof, SQL deployment, and student exposure approval: **NOT CLAIMED**.",
        "",
        "Generated by `data/career-mapping/_audit/audit_admin_acceptance_scale_2026-09-23.py`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "decision": report["decision"]}, sort_keys=True))


if __name__ == "__main__":
    main()
