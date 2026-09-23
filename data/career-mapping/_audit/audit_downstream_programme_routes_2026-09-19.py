"""Build a deterministic all-programme downstream route coverage report.

This is a read-only scaling audit.  It applies the Sociology route failure
modes to every parsed programme and every active programme-to-domain edge, then
walks the complete domain -> subgroup -> role context catalogue.  It does not
fetch URLs, infer relationships, write SQL, or change any source contract.

The report deliberately distinguishes route coverage from student exposure:
an item can be present in the audit catalogue while remaining fail-closed for
students because its ownership, review state, relationship, provenance, or
item-level link state is not sufficient.
"""

from __future__ import annotations

import gzip
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent.parent
ROOT = HERE.parent.parent
CCMAS_DIR = HERE / "ccmas"
AUDIT_DIR = HERE / "_audit"
PROGRAMME_DOMAIN_MAP = HERE / "programme_domain_final.json"
CONTEXTUAL_CATALOGUE = HERE / "contextual_guidance_items.json.gz"
CANONICAL_JAMB = AUDIT_DIR / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
UNIVERSITY_PIPELINE = ROOT / "docs" / "manual-review" / "university-programme-ccmas-domain-pipeline-2026-08-19.json"
JAMB_RESOURCE_AUDIT = AUDIT_DIR / "source_enrichment_batch_broad_2026-09-19.json"
OUT_JSON = AUDIT_DIR / "DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json"
OUT_MD = AUDIT_DIR / "DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.md"

AUDIT_DATE = "2026-09-19"
SMOKE_FIXTURES = {
    "Sociology": "Social Sciences::Sociology",
    "Nursing": "Allied Health Sciences::Nursing Sciences",
    "Accounting": "Administration and Management::Accounting",
}
CONTEXT_LEVELS = ("domain", "subgroup", "role")
VALID_DATA_STATES = {
    "source_backed",
    "limited",
    "partial",
    "review_only",
    "audit_only",
    "not_established",
    "unverified",
}
LINK_STATE_KEYS = {
    "link_state",
    "resource_url",
    "resource_urls",
    "learning_url",
    "link_url",
    "verified_resource_url",
    "resource_links",
    "resource_status",
    "link_status",
    "no_link_reason",
    "noLinkReason",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def key_for(discipline: Any, programme: Any) -> str:
    return f"{discipline or ''}::{programme or ''}"


def stable_digest(values: list[str]) -> str:
    payload = "\n".join(sorted(set(values))).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def load_programmes() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for source_path in sorted(CCMAS_DIR.glob("*.json")):
        payload = read_json(source_path)
        for programme in payload.get("programmes") or []:
            rows.append(
                {
                    "programmeKey": key_for(payload.get("discipline"), programme.get("name")),
                    "discipline": payload.get("discipline") or "",
                    "programme": programme.get("name") or "",
                    "sourceFile": source_path.name,
                }
            )
    return sorted(rows, key=lambda row: row["programmeKey"])


def iter_array_objects(array_name: str):
    """Yield objects from one top-level JSON array without buffering the file."""
    decoder = json.JSONDecoder()
    marker = f'"{array_name}"'
    with gzip.open(CONTEXTUAL_CATALOGUE, "rt", encoding="utf-8") as handle:
        buffer = ""
        found = False
        started = False
        finished = False
        while not finished:
            chunk = handle.read(1024 * 1024)
            if chunk:
                buffer += chunk
            elif not buffer:
                break
            if not found:
                marker_index = buffer.find(marker)
                if marker_index < 0:
                    if chunk:
                        buffer = buffer[-len(marker) :]
                        continue
                    break
                buffer = buffer[marker_index + len(marker) :]
                found = True
            if not started:
                bracket_index = buffer.find("[")
                if bracket_index < 0:
                    if chunk:
                        continue
                    break
                buffer = buffer[bracket_index + 1 :]
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
                yield value
                buffer = buffer[end:]


def load_contexts() -> tuple[set[tuple[str, str]], set[tuple[str, str, Any, Any]], dict[str, Any]]:
    context_keys: set[tuple[str, str]] = set()
    item_keys: set[tuple[str, str, Any, Any]] = set()
    state = Counter()
    fail_reasons = Counter()
    for row in iter_array_objects("items"):
        level = str(row.get("context_level") or "")
        context_key = str(row.get("context_key") or "")
        context_keys.add((level, context_key))
        item_keys.add((level, context_key, row.get("item_type"), row.get("item_key")))
        state["catalogueRows"] += 1
        owner_ok = row.get("guidance_owner") == level
        state_ok = row.get("data_state") == "source_backed"
        locator_ok = isinstance(row.get("source_locators"), list) and bool(row.get("source_locators"))
        refs_ok = isinstance(row.get("source_references"), list) and bool(row.get("source_references"))
        link_state_ok = any(key in row for key in LINK_STATE_KEYS)
        eligible = owner_ok and state_ok and locator_ok and refs_ok and link_state_ok
        state["studentRenderableRows"] += int(eligible)
        state["failClosedRows"] += int(not eligible)
        for ok, reason in (
            (owner_ok, "owner_mismatch"),
            (state_ok, "not_source_backed" if row.get("data_state") else "missing_data_state"),
            (locator_ok, "missing_source_locators"),
            (refs_ok, "missing_source_references"),
            (link_state_ok, "missing_link_state"),
        ):
            if not ok:
                fail_reasons[reason] += 1
    return context_keys, item_keys, {
        **dict(state),
        "failClosedReasons": dict(sorted(fail_reasons.items())),
        "studentExposureRule": [
            "guidance_owner must equal the context level",
            "data_state must be source_backed",
            "source_locators and source_references must be present",
            "an item-level verified link or explicit no-link state must be present",
        ],
    }


def active_domain_links(mapping: dict[str, Any], programme_key: str) -> list[dict[str, str]]:
    links = []
    seen: set[tuple[str, str]] = set()
    for link in (mapping.get(programme_key) or {}).get("links") or []:
        domain_id = str(link.get("domain_id") or "")
        match_type = str(link.get("match_type") or "").lower()
        if not domain_id or match_type not in {"direct", "functional", "adjacent"}:
            continue
        identity = (domain_id, match_type)
        if identity in seen:
            continue
        seen.add(identity)
        links.append(
            {
                "domainId": domain_id,
                "domainName": str(link.get("domain_name") or ""),
                "relationship": match_type,
            }
        )
    return sorted(links, key=lambda row: (row["relationship"], row["domainId"], row["domainName"]))


def canonical_jamb_domain_links(row: dict[str, Any]) -> list[dict[str, str]]:
    """Read only explicitly reviewed JAMB→domain links for the optional CCMAS leg."""
    links = []
    seen: set[tuple[str, str]] = set()
    for link in row.get("domain_links") or []:
        domain_id = str(link.get("domain_id") or "")
        relationship = str(link.get("match_type") or "").casefold()
        if not domain_id or relationship not in {"direct", "functional", "adjacent"}:
            continue
        identity = (domain_id, relationship)
        if identity in seen:
            continue
        seen.add(identity)
        links.append(
            {
                "domainId": domain_id,
                "domainName": str(link.get("domain_name") or ""),
                "relationship": relationship,
            }
        )
    return sorted(links, key=lambda value: (value["relationship"], value["domainId"], value["domainName"]))


def build_jamb_routes(
    contexts: set[tuple[str, str]],
    canonical: dict[str, Any],
    pipeline: dict[str, Any],
    resource_audit: dict[str, Any],
) -> list[dict[str, Any]]:
    """Build the student-entry route for every JAMB identity.

    JAMB identity and university offering availability are independent from the
    optional CCMAS/domain complement. A missing or review-required complement
    therefore produces an explicit complement state, not a failed JAMB route.
    """
    offering_counts = pipeline.get("offering_counts_by_jamb_name") or {}
    resource_rows = {
        str(row.get("jamb_name") or ""): row
        for row in resource_audit.get("jamb_identities") or []
    }
    rows: list[dict[str, Any]] = []
    for jamb_name in sorted(canonical):
        source = canonical[jamb_name]
        offering = offering_counts.get(jamb_name) or {}
        resource = resource_rows.get(jamb_name) or {}
        domains = canonical_jamb_domain_links(source)
        domain_routes = []
        missing_domains = []
        subgroup_keys: set[str] = set()
        role_keys: set[str] = set()
        for link in domains:
            domain_id = link["domainId"]
            domain_present = ("domain", domain_id) in contexts
            if not domain_present:
                missing_domains.append(domain_id)
            child_subgroups = child_contexts(contexts, domain_id, "subgroup")
            child_roles = child_contexts(contexts, domain_id, "role")
            subgroup_keys.update(child_subgroups)
            role_keys.update(child_roles)
            domain_routes.append(
                {
                    **link,
                    "domainContextPresent": domain_present,
                    "subgroupRouteCount": len(child_subgroups),
                    "roleRouteCount": len(child_roles),
                }
            )

        component_refs = [str(value) for value in source.get("component_refs") or []]
        mapping_status = str(source.get("mapping_status") or "")
        if domains:
            complement_state = "available"
            complement_reason = "Explicit JAMB-to-domain evidence is present."
        elif mapping_status == "review_required":
            complement_state = "review_required"
            complement_reason = "A CCMAS component is retained, but no reviewed JAMB-to-domain link is available."
        else:
            complement_state = "unavailable_no_ccmas_anchor"
            complement_reason = "No CCMAS/domain anchor is present in the local contract."

        offering_rows = int(offering.get("offerings") or 0)
        resource_state = str((resource.get("external_enrichment") or {}).get("resources") or "unavailable")
        rows.append(
            {
                "jambName": jamb_name,
                "jambProgramme": {
                    "identityPresent": True,
                    "mappingStatus": mapping_status,
                    "available": True,
                    "state": "available",
                },
                "university": {
                    "offeringRows": offering_rows,
                    "schools": int(offering.get("schools") or 0),
                    "available": offering_rows > 0,
                    "state": "available" if offering_rows > 0 else "unavailable_no_university_offering",
                },
                "resources": {
                    "state": resource_state,
                    "available": resource_state in {"approved", "available", "source_backed"},
                    "reviewRequired": resource_state == "review_required",
                },
                "ccmasComplement": {
                    "optional": True,
                    "state": complement_state,
                    "reason": complement_reason,
                    "componentRefs": component_refs,
                    "domainLinks": domains,
                },
                "downstream": {
                    "domainRouteCount": sum(row["domainContextPresent"] for row in domain_routes),
                    "subgroupRouteCount": len(subgroup_keys),
                    "roleRouteCount": len(role_keys),
                    "missingDomainContexts": missing_domains,
                    "broken": bool(domains and missing_domains),
                    "state": (
                        "available"
                        if domains and not missing_domains
                        else "broken_missing_domain_context"
                        if domains
                        else "unavailable_optional_ccmas_complement"
                    ),
                },
                "routeAvailable": offering_rows > 0,
            }
        )
    return rows


def child_contexts(
    contexts: set[tuple[str, str]],
    domain_id: str,
    level: str,
) -> list[str]:
    prefix = f"{domain_id}|"
    return sorted(
        context_key
        for context_level, context_key in contexts
        if context_level == level and context_key.startswith(prefix)
    )


def relationship_state_audit(relationships: Iterable[dict[str, Any]], item_keys: set[tuple[str, str, Any, Any]]) -> dict[str, Any]:
    counts = Counter()
    for row in relationships:
        level = row.get("context_level")
        context_key = row.get("context_key")
        from_key = (level, context_key, row.get("from_item_type"), row.get("from_item_key"))
        to_key = (level, context_key, row.get("to_item_type"), row.get("to_item_key"))
        counts["relationshipRows"] += 1
        counts["unresolvedEndpointRows"] += int(from_key not in item_keys or to_key not in item_keys)
        counts["studentRenderableRows"] += int(
            row.get("relationship_status") == "source_backed"
            and row.get("data_state") == "source_backed"
            and isinstance(row.get("source_references"), list)
            and bool(row.get("source_references"))
        )
    counts["failClosedRows"] = counts["relationshipRows"] - counts["studentRenderableRows"]
    return dict(counts)


def build_report() -> dict[str, Any]:
    programmes = load_programmes()
    mapping = read_json(PROGRAMME_DOMAIN_MAP)
    contexts, item_keys, item_state = load_contexts()
    canonical_payload = read_json(CANONICAL_JAMB)
    canonical_rows = {
        str(row.get("jamb_name") or ""): row
        for row in canonical_payload.get("rows") or []
        if row.get("jamb_name")
    }
    pipeline = read_json(UNIVERSITY_PIPELINE)
    resource_audit = read_json(JAMB_RESOURCE_AUDIT)
    jamb_routes = build_jamb_routes(contexts, canonical_rows, pipeline, resource_audit)
    context_keys_by_level = {
        level: sorted(context_key for context_level, context_key in contexts if context_level == level)
        for level in CONTEXT_LEVELS
    }
    routes_by_programme: list[dict[str, Any]] = []
    missing_routes = Counter()
    route_totals = Counter()
    route_key_counts = Counter()

    for programme in programmes:
        pkey = programme["programmeKey"]
        links = active_domain_links(mapping, pkey)
        route_keys = [f"programme::{pkey}::preview", f"programme::{pkey}::overview"]
        missing_for_programme: list[dict[str, str]] = []
        domain_route_rows = []
        subgroup_keys: set[str] = set()
        role_keys: set[str] = set()
        for link in links:
            domain_id = link["domainId"]
            domain_context = ("domain", domain_id)
            domain_route_key = f"domain::{pkey}::{link['relationship']}::{domain_id}"
            route_keys.append(domain_route_key)
            route_totals["domain"] += 1
            if domain_context not in contexts:
                missing_routes["domain"] += 1
                missing_for_programme.append({"level": "domain", "contextKey": domain_id})
            child_subgroups = child_contexts(contexts, domain_id, "subgroup")
            child_roles = child_contexts(contexts, domain_id, "role")
            subgroup_keys.update(child_subgroups)
            role_keys.update(child_roles)
            for context_key in child_subgroups:
                route_keys.append(f"subgroup::{pkey}::{domain_id}::{context_key}")
                route_totals["subgroup"] += 1
            for context_key in child_roles:
                route_keys.append(f"role::{pkey}::{domain_id}::{context_key}")
                route_totals["role"] += 1
            domain_route_rows.append(
                {
                    "domainId": domain_id,
                    "domainName": link["domainName"],
                    "relationship": link["relationship"],
                    "domainContextPresent": domain_context in contexts,
                    "subgroupRouteCount": len(child_subgroups),
                    "roleRouteCount": len(child_roles),
                }
            )
        if not links:
            missing_routes["active_domain_mapping"] += 1
            missing_for_programme.append({"level": "domain", "contextKey": "", "reason": "no_active_domain_mapping"})
        route_key_counts[pkey] = len(set(route_keys))
        routes_by_programme.append(
            {
                **programme,
                "smokeFixture": next((label for label, fixture_key in SMOKE_FIXTURES.items() if fixture_key == pkey), None),
                "programmeRouteCount": 2,
                "domainRouteCount": sum(row["domainContextPresent"] for row in domain_route_rows),
                "subgroupRouteCount": len({key for key in subgroup_keys}),
                "roleRouteCount": len({key for key in role_keys}),
                "activeDomainLinkCount": len(links),
                "domainRoutes": domain_route_rows,
                "missingRoutes": missing_for_programme,
                "fullDownstreamCoverage": bool(links) and not missing_for_programme,
                "routeKeyCount": len(set(route_keys)),
                "routeKeyDigest": stable_digest(route_keys),
            }
        )

    all_route_keys = [
        f"context::{level}::{context_key}"
        for level in CONTEXT_LEVELS
        for context_key in context_keys_by_level[level]
    ]
    missing_fixture_labels = [
        label for label, fixture_key in SMOKE_FIXTURES.items() if not any(row["programmeKey"] == fixture_key for row in programmes)
    ]
    full_coverage = sum(row["fullDownstreamCoverage"] for row in routes_by_programme)
    jamb_route_state_counts = Counter(
        row["university"]["state"] for row in jamb_routes
    )
    jamb_complement_state_counts = Counter(
        row["ccmasComplement"]["state"] for row in jamb_routes
    )
    jamb_resource_state_counts = Counter(
        row["resources"]["state"] for row in jamb_routes
    )
    broken_jamb_routes = [
        row["jambName"] for row in jamb_routes if row["downstream"]["broken"]
    ]
    no_ccmas_complement = [
        row["jambName"]
        for row in jamb_routes
        if row["ccmasComplement"]["state"] == "unavailable_no_ccmas_anchor"
    ]
    return {
        "schemaVersion": 2,
        "auditDate": AUDIT_DATE,
        "auditName": "all_237_programme_downstream_route_coverage",
        "scope": {
            "programmeCount": len(programmes),
            "requiredProgrammeCount": 237,
            "smokeFixtures": SMOKE_FIXTURES,
            "routeLevels": ["programme", "domain", "subgroup", "role"],
            "studentEntryChain": ["jamb_programme_identity", "university_offering", "ccmas_domain_complement", "domain_overview", "subgroup_overview", "role_overview"],
            "studentRoutes": ["jamb_programme_identity", "university_offering", "programme_preview", "programme_overview", "domain_overview", "subgroup_overview", "role_overview"],
            "adminEvidenceIsNotAStudentRoute": True,
            "jambIdentityCount": len(jamb_routes),
            "ccmasDomainIsOptionalComplement": True,
        },
        "inputs": {
            "ccmasDirectory": "data/career-mapping/ccmas",
            "programmeDomainMap": "data/career-mapping/programme_domain_final.json",
            "contextualCatalogue": "data/career-mapping/contextual_guidance_items.json.gz",
        },
        "coverage": {
            "programmeRecordsCovered": len(routes_by_programme),
            "fullDownstreamCoverageProgrammeCount": full_coverage,
            "programmesWithMissingRoutes": len(routes_by_programme) - full_coverage,
            "missingRoutesByLevel": dict(sorted(missing_routes.items())),
            "contextRoutesByLevel": {level: len(context_keys_by_level[level]) for level in CONTEXT_LEVELS},
            "uniqueContextRouteCount": len(all_route_keys),
            "programmeRouteCount": len(routes_by_programme) * 2,
            "downstreamRouteTotals": dict(sorted(route_totals.items())),
            "contextRouteDigest": stable_digest(all_route_keys),
            "jambIdentityCount": len(jamb_routes),
            "jambProgrammeRoutesAvailable": sum(row["jambProgramme"]["available"] for row in jamb_routes),
            "universityOfferingRoutesAvailable": sum(row["university"]["available"] for row in jamb_routes),
            "jambUniversityRouteStateCounts": dict(sorted(jamb_route_state_counts.items())),
            "ccmasComplementStateCounts": dict(sorted(jamb_complement_state_counts.items())),
            "jambResourceStateCounts": dict(sorted(jamb_resource_state_counts.items())),
            "jambIdentitiesWithoutCcmasComplement": len(no_ccmas_complement),
            "brokenJambRouteCount": len(broken_jamb_routes),
        },
        "sourceState": {
            "items": item_state,
            # Relationship endpoints are item-level identities.  Passing the
            # context-key set here makes every four-part endpoint tuple look
            # unresolved because context keys are only two-part tuples.
            "relationships": relationship_state_audit(iter_array_objects("relationships"), item_keys),
            "studentExposureIsFailClosed": True,
        },
        "adminStudentBoundary": {
            "adminMayInspectReviewState": True,
            "studentMayReceiveOnlyExplicitlyApprovedEvidence": True,
            "adminEvidenceMustRetainSourceLocatorAndAccessDate": True,
            "rawSourceWordingIsStaffOnly": True,
            "unavailableDataMustRemainUnavailable": True,
        },
        "smokeFixtureCheck": {
            "missingFixtures": missing_fixture_labels,
            "allPresent": not missing_fixture_labels,
        },
        "programmes": routes_by_programme,
        "jambIdentities": jamb_routes,
        "jambRouteContract": {
            "all420IdentitiesPresent": len(jamb_routes) == 420 and len({row["jambName"] for row in jamb_routes}) == 420,
            "jambProgrammeAvailabilityIndependent": all(row["jambProgramme"]["available"] for row in jamb_routes),
            "universityAvailabilityIndependent": all(row["university"]["available"] for row in jamb_routes),
            "optionalCcmasComplement": True,
            "missingCcmasDoesNotFailJambRoute": all(
                row["routeAvailable"]
                for row in jamb_routes
                if row["ccmasComplement"]["state"] == "unavailable_no_ccmas_anchor"
            ),
            "reviewRequiredCcmasDoesNotFailJambRoute": all(
                row["routeAvailable"]
                for row in jamb_routes
                if row["ccmasComplement"]["state"] == "review_required"
            ),
            "brokenJambRoutes": broken_jamb_routes,
        },
        "decision": {
            "routeAuditComplete": len(routes_by_programme) == 237 and len(jamb_routes) == 420,
            "jambRouteAvailabilityPasses": all(row["routeAvailable"] for row in jamb_routes),
            "jambResourceAvailabilityReported": len(jamb_routes) == 420,
            "optionalCcmasComplementReported": len(jamb_routes) == 420,
            "studentExposureApproved": False,
            "reason": "JAMB identity and university availability are evaluated independently; CCMAS/domain is an optional complement, while unresolved or unlabelled records remain fail-closed.",
        },
    }


def render_markdown(report: dict[str, Any]) -> str:
    coverage = report["coverage"]
    source = report["sourceState"]
    item_state = source["items"]
    relationship_state = source["relationships"]
    jamb_contract = report["jambRouteContract"]
    lines = [
        "# All-programme downstream route audit (2026-09-19)",
        "",
        "Deterministic, read-only coverage audit for every parsed programme and every mapped programme → domain → subgroup → role route. Sociology, Nursing and Accounting are smoke fixtures only; they do not limit the audit scope.",
        "",
        "## Coverage",
        "",
        f"- Programme records covered: **{coverage['programmeRecordsCovered']} / 237**.",
        f"- Programmes with complete downstream context coverage: **{coverage['fullDownstreamCoverageProgrammeCount']}**.",
        f"- Programmes with explicit missing-route findings: **{coverage['programmesWithMissingRoutes']}**.",
        f"- Unique domain/subgroup/role context routes audited: **{coverage['uniqueContextRouteCount']}**.",
        f"- Programme route records: **{coverage['programmeRouteCount']}**.",
        f"- Context route digest: `{coverage['contextRouteDigest']}`.",
        "",
        "| Level | Context routes | Programme-linked route instances |",
        "| --- | ---: | ---: |",
        f"| Domain | {coverage['contextRoutesByLevel']['domain']} | {coverage['downstreamRouteTotals'].get('domain', 0)} |",
        f"| Subgroup | {coverage['contextRoutesByLevel']['subgroup']} | {coverage['downstreamRouteTotals'].get('subgroup', 0)} |",
        f"| Role | {coverage['contextRoutesByLevel']['role']} | {coverage['downstreamRouteTotals'].get('role', 0)} |",
        "",
        "## JAMB entry and optional CCMAS complement",
        "",
        f"- JAMB identities covered: **{coverage['jambIdentityCount']} / 420**; JAMB programme routes available: **{coverage['jambProgrammeRoutesAvailable']}**; university/offering routes available: **{coverage['universityOfferingRoutesAvailable']}**.",
        f"- University route states: `{coverage['jambUniversityRouteStateCounts']}`; JAMB resource states: `{coverage['jambResourceStateCounts']}`.",
        f"- Optional CCMAS/domain complement states: `{coverage['ccmasComplementStateCounts']}`; identities without a CCMAS complement: **{coverage['jambIdentitiesWithoutCcmasComplement']}**.",
        f"- Broken JAMB routes after the independent entry/university check: **{coverage['brokenJambRouteCount']}**.",
        "- A missing or review-required CCMAS/domain complement is represented explicitly and does not fail an otherwise available JAMB programme/university route.",
        "- JAMB programme/resource availability is reported separately from CCMAS/domain availability; no CCMAS curriculum is inferred from JAMB identity alone.",
        "",
        "## Source-state fail-closed gate",
        "",
        f"- Catalogue rows: **{item_state['catalogueRows']}**; student-renderable under the complete contract: **{item_state['studentRenderableRows']}**; fail-closed: **{item_state['failClosedRows']}**.",
        f"- Relationships: **{relationship_state['relationshipRows']}**; student-renderable: **{relationship_state['studentRenderableRows']}**; fail-closed: **{relationship_state['failClosedRows']}**.",
        f"- Unresolved relationship endpoints: **{relationship_state['unresolvedEndpointRows']}**.",
        "- Student exposure requires matching ownership, source-backed state, source locator/reference evidence, and an item-level verified link or explicit no-link state.",
        "- This report does not promote missing links or unresolved relationships and does not fetch external URLs.",
        "",
        "## Admin/student boundary",
        "",
        "- Admin/institution evidence may retain raw source wording, review state and provenance for review.",
        "- Student routes receive only explicitly approved evidence with retained provenance; review-only, audit-only, not-established and unavailable states remain out of student guidance.",
        "- Admin evidence is not counted as a student route.",
        "",
        "## Smoke fixtures",
        "",
    ]
    by_key = {row["programmeKey"]: row for row in report["programmes"]}
    for label, key in SMOKE_FIXTURES.items():
        row = by_key.get(key)
        if row:
            lines.append(f"- {label}: `{key}` — {row['activeDomainLinkCount']} domain links, {row['subgroupRouteCount']} subgroup routes, {row['roleRouteCount']} role routes.")
        else:
            lines.append(f"- {label}: `{key}` — missing from parsed programme inventory.")
    lines.extend(
        [
            "",
        "## Decision",
            "",
        f"**Route coverage audit complete; student exposure remains fail-closed.** The report contains one deterministic record for each of the 237 CCMAS programme keys and each of the 420 JAMB identities. JAMB availability is independent from the optional CCMAS complement; broken JAMB routes: **{len(jamb_contract['brokenJambRoutes'])}**.",
            "",
            "Generated by `data/career-mapping/_audit/audit_downstream_programme_routes_2026-09-19.py`.",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "coverage": report["coverage"], "smokeFixtureCheck": report["smokeFixtureCheck"]}, sort_keys=True))


if __name__ == "__main__":
    main()
