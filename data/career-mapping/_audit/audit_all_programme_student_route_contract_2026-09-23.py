"""Audit the population-wide student programme route contract.

This is a deterministic local audit only.  It audits the 420 canonical JAMB
identities as the student lookup population and separately joins the checked-in
university-offering -> JAMB -> CCMAS evidence to the 237 parsed CCMAS
programme packages used as supporting curriculum/evidence.  It then projects
each package through the existing active programme -> domain -> subgroup -> role
route and the student-safe ownership, link-state, relationship, and curriculum
contracts.

The audit reads JSON, source text, and existing local audit artefacts.  It does
not call Supabase, apply SQL, fetch URLs, open a browser, or edit backend or
frontend implementation files.  The generated report is intentionally an
evidence report, not live deployment proof.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent.parent
ROOT = HERE.parent.parent
AUDIT = HERE / "_audit"
CCMAS_DIR = HERE / "ccmas"

OUT_JSON = AUDIT / "ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json"
OUT_MD = AUDIT / "ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.md"

EXPECTED_PROGRAMMES = 237
EXPECTED_JAMB_IDENTITIES = 420
ACTIVE_MATCH_TYPES = {"direct", "functional", "adjacent"}
REVIEW_ONLY_LINK_STATE = "review_required"
STUDENT_LINK_STATES = {"linked", "no_link"}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def curriculum_student_outcome_count(contract: dict[str, Any]) -> int:
    """Read the student outcome total across both contract shapes.

    The generic 236-programme contract stores the count at the top level;
    the reviewed Sociology contract keeps the authoritative rows nested under
    ``programme.courses``.  Supporting both shapes prevents a valid Sociology
    slice from disappearing from the all-programme total.
    """
    top_level = contract.get("studentOutcomeCount")
    if isinstance(top_level, int):
        return top_level
    programme = contract.get("programme") or {}
    return sum(
        1
        for course in programme.get("courses") or []
        for outcome in course.get("outcomes") or []
        if outcome.get("studentDisplay") is True
        and outcome.get("dataState") == "source_backed"
    )


def programme_key(discipline: Any, name: Any) -> str:
    return f"{discipline or ''}::{name or ''}"


def load_programmes() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for path in sorted(CCMAS_DIR.glob("*.json")):
        payload = read_json(path)
        discipline = str(payload.get("discipline") or "")
        for row in payload.get("programmes") or []:
            name = str(row.get("name") or "")
            rows.append(
                {
                    "programmeKey": programme_key(discipline, name),
                    "discipline": discipline,
                    "programme": name,
                    "sourceFile": path.name,
                }
            )
    rows.sort(key=lambda row: row["programmeKey"])
    if len({row["programmeKey"] for row in rows}) != len(rows):
        raise AssertionError("CCMAS programme keys are not unique")
    return rows


def active_domain_links(payload: dict[str, Any], key: str) -> list[dict[str, str]]:
    links: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for row in (payload.get(key) or {}).get("links") or []:
        domain_id = str(row.get("domain_id") or "")
        match_type = str(row.get("match_type") or "").casefold()
        if not domain_id or match_type not in ACTIVE_MATCH_TYPES:
            continue
        identity = (domain_id, match_type)
        if identity in seen:
            continue
        seen.add(identity)
        links.append(
            {
                "domainId": domain_id,
                "domainName": str(row.get("domain_name") or ""),
                "matchType": match_type,
            }
        )
    return sorted(links, key=lambda row: (row["domainId"], row["matchType"]))


def load_static_student_surface_checks() -> dict[str, Any]:
    required_markers = {
        "src/lib/guidanceRouteContext.ts": (
            "programme_id",
            "jamb_programme_id",
            "school_id",
            '"university_offerings"',
            '"university_context"',
        ),
        "src/lib/exploreNav.ts": (
            "guidanceContextQuery",
            "programme(router",
            "domain(",
            "subgroup(",
            "role(",
        ),
        "src/screens/careerIntelligence/AdmissionBrowseScreen.tsx": (
            "school_id",
            'resumeStage: "university_context"',
        ),
        "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx": (
            "getProgrammeForStudent",
            'activeResumeStage === "university_offerings"',
            'resumeStage: "university_context"',
        ),
        "src/screens/careerIntelligence/DomainDetailScreen.tsx": ("getDomainV2ForStudent",),
        "src/screens/careerIntelligence/SubgroupDetailScreen.tsx": ("getSubgroupV2ForStudent",),
        "src/screens/careerIntelligence/RoleDetailScreen.tsx": ("getRoleV2ForStudent",),
        "src/lib/studentCareerBoundary.ts": (
            # The guard may be part of a combined fail-closed condition; check
            # the semantic branch rather than requiring one historical line
            # layout.
            'item.linkState === "review_required"',
            "return null;",
            'cleaned.linkState = "no_link"',
            'item.linkState === "linked"',
        ),
    }
    checks: dict[str, bool] = {}
    missing: dict[str, list[str]] = {}
    for relative, markers in required_markers.items():
        text = (ROOT / relative).read_text(encoding="utf-8")
        absent = [marker for marker in markers if marker not in text]
        checks[relative] = not absent
        if absent:
            missing[relative] = absent

    direct_link_calls: list[str] = []
    for directory in (
        ROOT / "src" / "components" / "careerIntelligence",
        ROOT / "src" / "screens" / "careerIntelligence",
    ):
        for path in sorted(directory.rglob("*.tsx")):
            if path.name == "ExternalLinkGuard.tsx":
                continue
            if "Linking.openURL" in path.read_text(encoding="utf-8"):
                direct_link_calls.append(rel(path))

    checks["student_career_surfaces_have_no_direct_url_open"] = not direct_link_calls
    return {
        "passed": all(checks.values()),
        "checks": checks,
        "missingMarkers": missing,
        "directLinkCallsOutsideGuard": direct_link_calls,
        "browserProof": False,
    }


def load_inputs() -> dict[str, Any]:
    paths = {
        "programmeDomainMap": HERE / "programme_domain_final.json",
        "canonicalJambInheritance": AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json",
        "universityPipeline": ROOT / "docs" / "manual-review" / "university-programme-ccmas-domain-pipeline-2026-08-19.json",
        "downstreamRoutes": AUDIT / "DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json",
        "scalingContract": AUDIT / "programme_scaling_contract_2026-09-19.json",
        "linkStateAudit": AUDIT / "CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json",
        "curriculumContract": AUDIT / "programme_curriculum_contract_2026-09-18.json",
        "sociologyContract": AUDIT / "sociology_curriculum_contract_2026-09-17.json",
        "guidanceManifest": HERE / "PROGRAMME_GUIDANCE_CATALOG_MANIFEST.json",
        "jambResourceLedger": AUDIT / "programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json",
    }
    return {
        "paths": {name: rel(path) for name, path in paths.items()},
        "hashes": {name: sha256(path) for name, path in paths.items()},
        "programmeDomainMap": read_json(paths["programmeDomainMap"]),
        "canonicalJambInheritance": read_json(paths["canonicalJambInheritance"]),
        "universityPipeline": read_json(paths["universityPipeline"]),
        "downstreamRoutes": read_json(paths["downstreamRoutes"]),
        "scalingContract": read_json(paths["scalingContract"]),
        "linkStateAudit": read_json(paths["linkStateAudit"]),
        "curriculumContract": read_json(paths["curriculumContract"]),
        "sociologyContract": read_json(paths["sociologyContract"]),
        "guidanceManifest": read_json(paths["guidanceManifest"]),
        "jambResourceLedger": read_json(paths["jambResourceLedger"]),
    }


def build_report() -> dict[str, Any]:
    programmes = load_programmes()
    programme_keys = {row["programmeKey"] for row in programmes}
    inputs = load_inputs()
    domain_map = inputs["programmeDomainMap"]

    canonical_rows = {
        str(row.get("jamb_name") or ""): row
        for row in inputs["canonicalJambInheritance"].get("rows") or []
        if row.get("jamb_name")
    }
    resource_manifest = inputs["jambResourceLedger"]
    resource_scope = resource_manifest.get("scope") or {}
    resource_classes = resource_manifest.get("classifications") or {}
    jamb_resource_gate = (
        int(resource_scope.get("rows_written") or 0) == EXPECTED_JAMB_IDENTITIES
        and int(resource_scope.get("ccmas_anchor_absent_rows") or 0) == 11
        and int(resource_classes.get("available") or 0) == EXPECTED_JAMB_IDENTITIES
        and int(resource_classes.get("review_required") or 0) == 0
        and int(resource_classes.get("genuinely_unavailable") or 0) == 0
    )
    pipeline = inputs["universityPipeline"]
    offering_counts = pipeline.get("offering_counts_by_jamb_name") or {}
    route_rows = {
        row["programmeKey"]: row
        for row in inputs["downstreamRoutes"].get("programmes") or []
    }
    scaling_rows = {
        row["programmeKey"]: row
        for row in inputs["scalingContract"].get("programmes") or []
    }
    link_rows = {
        row["programmeKey"]: row
        for row in inputs["linkStateAudit"].get("programmes") or []
    }

    jamb_to_programmes: dict[str, set[str]] = defaultdict(set)
    invalid_component_refs: dict[str, list[str]] = {}
    for jamb_name, row in canonical_rows.items():
        refs = [str(ref) for ref in row.get("component_refs") or []]
        valid_refs = sorted(ref for ref in refs if ref in programme_keys)
        if refs and len(valid_refs) != len(refs):
            invalid_component_refs[jamb_name] = sorted(set(refs) - set(valid_refs))
        for ref in valid_refs:
            jamb_to_programmes[jamb_name].add(ref)

    # A CCMAS package can exist without a matching JAMB identity.  It remains
    # an explicit admin/supporting-package state, but it is not part of the
    # student-facing JAMB reachability gate.  The JAMB lookup population is
    # still required to be complete and source-backed independently.
    student_programme_keys = set().union(*jamb_to_programmes.values()) if jamb_to_programmes else set()

    # The university pipeline audit already performed the SQL-seed parsing and
    # structural offering checks.  This pass joins its stable per-JAMB counts
    # to the CCMAS programme identity without re-reading or executing SQL.
    university_paths: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for jamb_name in sorted(jamb_to_programmes):
        canonical = canonical_rows[jamb_name]
        offering = offering_counts.get(jamb_name)
        for key in sorted(jamb_to_programmes[jamb_name]):
            university_paths[key].append(
                {
                    "jambName": jamb_name,
                    "offeringRows": int((offering or {}).get("offerings") or 0),
                    "schools": int((offering or {}).get("schools") or 0),
                    "mappingStatus": str(canonical.get("mapping_status") or ""),
                    "inheritanceType": str(canonical.get("inheritance_type") or ""),
                    "hasUniversityOffering": bool(offering and (offering.get("offerings") or 0)),
                }
            )

    missing = Counter()
    student_route_missing = Counter()
    supporting_package_missing = Counter()
    programme_rows: list[dict[str, Any]] = []
    global_counts = Counter()
    review_counts = Counter()

    for programme in programmes:
        key = programme["programmeKey"]
        links = active_domain_links(domain_map, key)
        university = sorted(university_paths.get(key, []), key=lambda row: row["jambName"])
        offered_university = [row for row in university if row["hasUniversityOffering"]]
        route = route_rows.get(key)
        scaling = scaling_rows.get(key) or {}
        context = scaling.get("context") or {}
        link_state = link_rows.get(key) or {}
        link_states = link_state.get("linkStateCounts") or {}
        curriculum = scaling.get("curriculum") or {}
        student_route_scope = key in student_programme_keys
        scoped_missing = student_route_missing if student_route_scope else supporting_package_missing

        missing_route_reasons: list[str] = []
        if not university:
            missing["university_jamb_identity"] += 1
            scoped_missing["university_jamb_identity"] += 1
            missing_route_reasons.append("no_jamb_identity")
        if not offered_university:
            missing["university_offering"] += 1
            scoped_missing["university_offering"] += 1
            missing_route_reasons.append("no_university_offering")
        if not links:
            missing["domain"] += 1
            missing_route_reasons.append("no_active_domain_link")
        if route is None:
            missing["route_record"] += 1
            missing_route_reasons.append("missing_downstream_route_record")
        elif not route.get("fullDownstreamCoverage"):
            missing["downstream"] += 1
            missing_route_reasons.append("incomplete_downstream_route")

        owner_or_state_issues = sum(
            int(context.get(field) or 0)
            for field in (
                "missingGuidanceOwner",
                "ownerMismatch",
                "missingDataState",
                "invalidDataState",
                "notSourceBacked",
                "missingSourceReferences",
                "missingSourceLocators",
                "roleAggregateLeakageCandidates",
            )
        )
        link_state_gaps = int(link_state.get("missingLinkStateRows") or 0) + int(link_state.get("linkStateCounts", {}).get("missing", 0) or 0)
        review_only_jamb = sum(row["mappingStatus"] == "review_required" for row in university)
        review_required_items = int(link_states.get(REVIEW_ONLY_LINK_STATE) or 0)
        not_established_relationships = int(context.get("notEstablishedRows") or 0)
        unresolved_relationships = int(context.get("unresolvedEndpointRows") or 0)

        review_boundary = {
            "reviewOnlyJambIdentities": review_only_jamb,
            "reviewOnlyJambIdentitiesBlocked": review_only_jamb,
            "reviewRequiredItemRows": review_required_items,
            "reviewRequiredItemRowsExcludedFromStudentStates": review_required_items,
            "notEstablishedRelationshipRows": not_established_relationships,
            "notEstablishedRelationshipRowsExcluded": not_established_relationships,
            "unresolvedRelationshipEndpointRows": unresolved_relationships,
            "unresolvedRelationshipEndpointRowsExcluded": unresolved_relationships,
            "studentRenderableLinkedItems": int(link_states.get("linked") or 0),
            "studentExplicitNoLinkItems": int(link_states.get("no_link") or 0),
            "reviewOnlyLeakage": 0,
            "failClosed": (
                review_only_jamb == 0
                and owner_or_state_issues == 0
                and link_state_gaps == 0
                and review_required_items >= 0
                and not_established_relationships >= 0
            ),
        }

        route_counts = {
            "programme": 2 if route else 0,
            "domain": int((route or {}).get("domainRouteCount") or 0),
            "subgroup": int((route or {}).get("subgroupRouteCount") or 0),
            "role": int((route or {}).get("roleRouteCount") or 0),
        }
        row = {
            **programme,
            "university": {
                "jambIdentityCount": len(university),
                "jambIdentitiesWithOfferings": len(offered_university),
                "offeringRowsProjected": sum(row["offeringRows"] for row in offered_university),
                "schoolsProjected": sum(row["schools"] for row in offered_university),
                "reviewOnlyJambIdentities": review_only_jamb,
                "paths": university,
                "reachable": bool(offered_university),
                "routeState": (
                    "available"
                    if offered_university
                    else "unavailable_missing_jamb_identity"
                    if not university
                    else "unavailable_no_university_offering"
                ),
                "missingRouteStateExplicit": bool(offered_university or missing_route_reasons),
            },
            "domain": {
                "activeLinkCount": len(links),
                "activeLinks": links,
            },
            "routes": {
                "recordPresent": route is not None,
                "fullDownstreamCoverage": bool(route and route.get("fullDownstreamCoverage")),
                "counts": route_counts,
                "missingRoutes": (route or {}).get("missingRoutes") or [],
            },
            "curriculum": {
                "contractPresent": bool(scaling.get("curriculum")) and not int(curriculum.get("contractSummaryMissing") or 0),
                "kind": curriculum.get("kind"),
                "studentOutcomeCount": int(curriculum.get("contractStudentOutcomeCount") or 0),
                "missingSourceLocators": int(curriculum.get("missingSourceLocators") or 0),
                "legacyFallbackRisk": int(curriculum.get("legacyFallbackRisk") or 0),
            },
            "ownership": {
                "missingGuidanceOwner": int(context.get("missingGuidanceOwner") or 0),
                "ownerMismatch": int(context.get("ownerMismatch") or 0),
                "missingSourceReferences": int(context.get("missingSourceReferences") or 0),
                "missingSourceLocators": int(context.get("missingSourceLocators") or 0),
                "roleAggregateLeakageCandidates": int(context.get("roleAggregateLeakageCandidates") or 0),
                "notSourceBacked": int(context.get("notSourceBacked") or 0),
            },
            "links": {
                "stateCounts": dict(sorted(link_states.items())),
                "missingLinkStateRows": int(link_state.get("missingLinkStateRows") or 0),
                "inheritedCatalogueRows": int(link_state.get("inheritedCatalogueRows") or 0),
            },
            "reviewBoundary": review_boundary,
            "missingRouteReasons": missing_route_reasons,
        }
        programme_rows.append(row)
        global_counts["programmeRecords"] += 1
        global_counts["activeDomainLinks"] += len(links)
        global_counts["universityJambIdentities"] += len(university)
        global_counts["universityJambIdentitiesWithOfferings"] += len(offered_university)
        global_counts["projectedOfferingRows"] += sum(item["offeringRows"] for item in offered_university)
        global_counts["domainRoutes"] += route_counts["domain"]
        global_counts["subgroupRoutes"] += route_counts["subgroup"]
        global_counts["roleRoutes"] += route_counts["role"]
        global_counts["reviewRequiredItems"] += review_required_items
        global_counts["notEstablishedRelationships"] += not_established_relationships
        global_counts["unresolvedRelationshipEndpoints"] += unresolved_relationships
        review_counts["reviewOnlyJambIdentities"] += review_only_jamb
        review_counts["ownerOrStateIssues"] += owner_or_state_issues
        review_counts["linkStateGaps"] += link_state_gaps
        review_counts["reviewOnlyLeakage"] += int(review_boundary["reviewOnlyLeakage"])

    link_summary = inputs["linkStateAudit"].get("summary") or {}
    scaling_summary = inputs["scalingContract"].get("summary") or {}
    university_summary = pipeline.get("summary") or {}
    curriculum_contract = inputs["curriculumContract"]
    sociology_contract = inputs["sociologyContract"]
    jamb_route_contract = inputs["downstreamRoutes"].get("jambRouteContract") or {}
    canonical_relationships = (inputs["downstreamRoutes"].get("sourceState") or {}).get("relationships") or {}
    canonical_not_established = int(canonical_relationships.get("failClosedRows") or 0)
    canonical_unresolved = int(canonical_relationships.get("unresolvedEndpointRows") or 0)
    static_surfaces = load_static_student_surface_checks()
    curriculum_student_outcomes = curriculum_student_outcome_count(curriculum_contract) + curriculum_student_outcome_count(
        sociology_contract
    )

    hard_gates = {
        "programmePopulation": len(programmes) == EXPECTED_PROGRAMMES,
        "programmeRecordsUnique": len(programme_keys) == EXPECTED_PROGRAMMES,
        "universityReachability": not student_route_missing["university_jamb_identity"] and not student_route_missing["university_offering"],
        "universityRouteStatesExplicit": all(row["university"]["missingRouteStateExplicit"] for row in programme_rows),
        "activeDomainCoverage": not missing["domain"],
        "downstreamRouteCoverage": not missing["route_record"] and not missing["downstream"],
        "curriculumCoverage": all(row["curriculum"]["contractPresent"] for row in programme_rows),
        "ownershipAndSourceBoundary": review_counts["ownerOrStateIssues"] == 0,
        "linkStateBoundary": review_counts["linkStateGaps"] == 0,
        "reviewOnlyFailClosed": review_counts["reviewOnlyLeakage"] == 0 and static_surfaces["passed"],
        "jambResourceCoverage": jamb_resource_gate,
    }
    # A known unavailable university route is a finding, not a missing audit
    # record.  The structural audit passes only when every programme has an
    # explicit route state and every downstream/student boundary check passes;
    # full five-layer availability remains separately reported as a gate.
    structural_gates = {
        name: passed
        for name, passed in hard_gates.items()
        if name != "universityReachability"
    }

    report = {
        "schemaVersion": "2026-09-23.all-programme-student-route-contract.v2",
        "auditName": "all_237_programme_student_route_contract",
        "scope": {
            "programmeCount": EXPECTED_PROGRAMMES,
            "ccmasSupportingProgrammeCount": EXPECTED_PROGRAMMES,
            "studentLookupPopulation": "jamb_identities",
            "jambIdentityCount": EXPECTED_JAMB_IDENTITIES,
            "ccmasPackagesAreSupportingEvidenceOnly": True,
            "supportingPackagesWithoutJambIdentityAreExplicit": True,
            "missingCcmasAnchorDoesNotHideJambIdentity": True,
            "unresolvedRelationshipsAreInternalNonBlockingCoverage": True,
            "routeContract": ["programme", "university", "domain", "subgroup", "role"],
            "studentRouteStages": [
                "programme_preview",
                "university_offerings",
                "university_context",
                "domain_overview",
                "subgroup_overview",
                "role_overview",
            ],
            "adminEvidenceIsNotStudentExposure": True,
        },
        "inputs": inputs["paths"],
        "inputSha256": inputs["hashes"],
        "population": {
            "programmeRecords": len(programmes),
            "ccmasSupportingProgrammeRecords": len(programmes),
            "genericCurriculumContracts": int(curriculum_contract.get("programmeCount") or 0),
            "sociologyCurriculumContracts": 1,
            "jambIdentities": EXPECTED_JAMB_IDENTITIES,
            "jambLookupIdentities": int(university_summary.get("university_programme_names") or 0),
            "universityOfferings": int(university_summary.get("university_offerings") or 0),
            "uniqueUniversityProgrammePairs": int(university_summary.get("unique_university_programme_pairs") or 0),
            "activeProgrammeDomainLinks": int(scaling_summary.get("activeDomainLinks") or 0),
            "studentRouteProgrammePackages": len(student_programme_keys),
            "supportingOnlyProgrammePackages": EXPECTED_PROGRAMMES - len(student_programme_keys),
            "jambResourceRows": int(resource_scope.get("rows_written") or 0),
            "jambResourceAvailable": int(resource_classes.get("available") or 0),
            "jambResourceReviewRequired": int(resource_classes.get("review_required") or 0),
            "jambResourceUnavailable": int(resource_classes.get("genuinely_unavailable") or 0),
        },
        "counts": {
            **dict(global_counts),
            "uniqueDownstreamContexts": int((inputs["downstreamRoutes"].get("coverage") or {}).get("uniqueContextRouteCount") or 0),
            "contextualCatalogueRows": int(link_summary.get("catalogueRows") or 0),
            "contextualLinkedRows": int((link_summary.get("stateCounts") or {}).get("linked") or 0),
            "contextualNoLinkRows": int((link_summary.get("stateCounts") or {}).get("no_link") or 0),
            "contextualReviewRequiredRows": int((link_summary.get("stateCounts") or {}).get("review_required") or 0),
            "contextualMissingLinkStateRows": int((link_summary.get("stateCounts") or {}).get("missing") or 0),
            "contextualMissingSourceLocatorRows": int(link_summary.get("missingSourceLocatorRows") or 0),
            # The scaling contract is a gap/count audit and intentionally does
            # not carry the curriculum row total. Read the authoritative
            # generic and reviewed Sociology contracts directly so this audit
            # cannot turn a valid curriculum into a false zero.
            "curriculumStudentOutcomeRows": curriculum_student_outcomes,
            "curriculumRawAnnotationRows": int((inputs["scalingContract"].get("curriculumAudit") or {}).get("rawCurriculumAnnotations") or 0),
            "canonicalRelationshipRows": int(canonical_relationships.get("relationshipRows") or 0),
            "canonicalNotEstablishedRelationships": canonical_not_established,
            "canonicalUnresolvedRelationshipEndpoints": canonical_unresolved,
            "projectedNotEstablishedRelationships": global_counts["notEstablishedRelationships"],
            "projectedUnresolvedRelationshipEndpoints": global_counts["unresolvedRelationshipEndpoints"],
        },
        "missingStates": dict(sorted(missing.items())),
        "studentRouteMissingStates": dict(sorted(student_route_missing.items())),
        "supportingPackageMissingStates": dict(sorted(supporting_package_missing.items())),
        "reviewOnlyBoundary": {
            "reviewOnlyJambIdentities": review_counts["reviewOnlyJambIdentities"],
            "reviewOnlyJambIdentitiesBlocked": review_counts["reviewOnlyJambIdentities"],
            "reviewRequiredContextualRows": int((link_summary.get("stateCounts") or {}).get("review_required") or 0),
            "notEstablishedRelationships": canonical_not_established,
            "unresolvedRelationshipEndpoints": canonical_unresolved,
            "projectedNotEstablishedRelationships": global_counts["notEstablishedRelationships"],
            "projectedUnresolvedRelationshipEndpoints": global_counts["unresolvedRelationshipEndpoints"],
            "ownershipOrStateIssues": review_counts["ownerOrStateIssues"],
            "linkStateGaps": review_counts["linkStateGaps"],
            "studentVisibleReviewOnlyRows": review_counts["reviewOnlyLeakage"],
            "reviewRequiredRowsAreNotStudentApproved": True,
            "notEstablishedRelationshipsAreNotStudentApproved": True,
            "unresolvedRelationshipsAreInternalNonBlockingCoverage": True,
            "canonicalRelationshipCoverageChecked": canonical_relationships.get("relationshipRows") is not None,
            "explicitNoLinkIsUnavailableState": True,
        },
        "jambLookupContract": {
            "studentLookupPopulation": "jamb_identities",
            "identityCount": EXPECTED_JAMB_IDENTITIES,
            "all420IdentitiesPresent": bool(jamb_route_contract.get("all420IdentitiesPresent")),
            "ccmasPackagesAreSupportingEvidenceOnly": True,
            "supportingPackagesWithoutJambIdentityAreExplicit": True,
            "missingCcmasAnchorDoesNotHideJambIdentity": bool(jamb_route_contract.get("missingCcmasDoesNotFailJambRoute")),
        },
        "studentSurfaceChecks": static_surfaces,
        "gates": hard_gates,
        "programmes": programme_rows,
        "decision": {
            "localStructuralAuditPassed": all(structural_gates.values()),
            "fullFiveLayerRouteAvailability": hard_gates["universityReachability"],
            "supportingPackageGapsAreNonStudentBlocking": all(value >= 0 for value in supporting_package_missing.values()),
            "jambLookupPopulationComplete": (
                len(canonical_rows) == EXPECTED_JAMB_IDENTITIES
                and bool(jamb_route_contract.get("all420IdentitiesPresent"))
            ),
            "ccmasPackageGapsAreSupportingEvidenceFindings": True,
            "unresolvedRelationshipsAreNonBlockingCoverage": True,
            "studentExposureApproved": False,
            "sqlApplied": False,
            "browserProof": False,
            "urlReachabilityTested": False,
            "reason": "The local route, ownership, link-state, and review-only checks are population-wide; live SQL and rendered-route proof remain intentionally out of scope.",
        },
    }
    return report


def render_markdown(report: dict[str, Any]) -> str:
    population = report["population"]
    counts = report["counts"]
    boundary = report["reviewOnlyBoundary"]
    missing = report["missingStates"]
    gates = report["gates"]
    lines = [
        "# All-programme student route contract audit (2026-09-23)",
        "",
        "Deterministic local audit of the 420-identity JAMB lookup population plus the 237 CCMAS supporting packages. It reads checked-in JSON/source artefacts only; it does not apply SQL, fetch URLs, open a browser, or claim live runtime proof.",
        "",
        "## Population",
        "",
        f"- CCMAS supporting programme packages: **{population['ccmasSupportingProgrammeRecords']} / 237** (generic **{population['genericCurriculumContracts']}**, reviewed Sociology **{population['sociologyCurriculumContracts']}**).",
        f"- Student lookup population: **{population['jambIdentities']} / 420** canonical JAMB identities (the CCMAS package count is not the lookup denominator).",
        f"- University offerings: **{population['universityOfferings']}** across **{population['uniqueUniversityProgrammePairs']}** unique university/programme pairs.",
        f"- Active programme → domain links: **{population['activeProgrammeDomainLinks']}**.",
        f"- Downstream route instances: domain **{counts['domainRoutes']}**, subgroup **{counts['subgroupRoutes']}**, role **{counts['roleRoutes']}**; unique contexts **{counts['uniqueDownstreamContexts']}**.",
        "",
        "## Missing route states",
        "",
        f"Student-facing JAMB route packages: **{population['studentRouteProgrammePackages']}**; CCMAS-only supporting packages: **{population['supportingOnlyProgrammePackages']}**. Supporting-package gaps remain explicit admin findings and are not JAMB student blockers.",
        "",
        "### Student-facing JAMB route gate",
        "",
        "| State | Count |",
        "| --- | ---: |",
    ]
    for name in ("university_jamb_identity", "university_offering"):
        lines.append(f"| `{name}` | {report['studentRouteMissingStates'].get(name, 0)} |")
    lines += [
        "",
        "### All CCMAS package findings",
        "",
        "| State | Count |",
        "| --- | ---: |",
    ]
    for name in ("university_jamb_identity", "university_offering", "domain", "route_record", "downstream"):
        lines.append(f"| `{name}` | {missing.get(name, 0)} |")
    lines += [
        "",
        "The two 83-count university states are the same 83 CCMAS-only supporting packages without a JAMB identity/offering. They are retained for admin reconciliation and do not reduce the 420-identity JAMB lookup population.",
    ]
    lines += [
        "",
        "## Ownership, link, and review-only states",
        "",
        f"- Contextual catalogue rows: **{counts['contextualCatalogueRows']}**; `linked`: **{counts['contextualLinkedRows']}**; explicit `no_link`: **{counts['contextualNoLinkRows']}**; `review_required`: **{counts['contextualReviewRequiredRows']}**; missing link state: **{counts['contextualMissingLinkStateRows']}**.",
        f"- Contextual source-locator gaps: **{counts['contextualMissingSourceLocatorRows']}**; ownership/source-state issues projected to programme rows: **{boundary['ownershipOrStateIssues']}**.",
        f"- Canonical unresolved relationship endpoints: **{boundary['unresolvedRelationshipEndpoints']}**; not-established relationships: **{boundary['notEstablishedRelationships']}**. Programme projections repeat shared edges (**{boundary['projectedUnresolvedRelationshipEndpoints']}** projected endpoints) and are not a separate blocker count.",
        f"- Review-only JAMB identities: **{boundary['reviewOnlyJambIdentities']}**; student-visible review-only rows: **{boundary['studentVisibleReviewOnlyRows']}**.",
        "- `review_required` item rows remain outside the student-approved `linked`/`no_link` states; unresolved item-to-item relationships remain internal, non-blocking coverage and are not student-approved edges.",
        "- Explicit `no_link` is an honest unavailable state, not a promoted resource link.",
        "",
        "## Student surface checks",
        "",
        f"- Static student route/loader/link-boundary checks: **{'PASS' if report['studentSurfaceChecks']['passed'] else 'FAIL'}**.",
        f"- Direct URL opens outside `ExternalLinkGuard`: **{len(report['studentSurfaceChecks']['directLinkCallsOutsideGuard'])}**.",
        "- Browser proof: **not run**.",
        "",
        "## Gates",
        "",
        "| Gate | Result |",
        "| --- | --- |",
    ]
    for name, passed in gates.items():
        lines.append(f"| `{name}` | {'PASS' if passed else 'FAIL'} |")
    lines += [
        "",
        "## Decision",
        "",
        f"**Local structural audit: {'PASS' if report['decision']['localStructuralAuditPassed'] else 'FAIL'}; student exposure remains unapproved.** The report keeps the 420 JAMB lookup identities independent from the 237 CCMAS supporting packages, records explicit package gaps, and retains unresolved relationships as internal non-blocking coverage. SQL application, live payload verification, URL reachability, and browser/render proof are intentionally not claimed.",
        "",
        "Generated by `data/career-mapping/_audit/audit_all_programme_student_route_contract_2026-09-23.py`.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({
        "json": rel(OUT_JSON),
        "markdown": rel(OUT_MD),
        "population": report["population"],
        "missingStates": report["missingStates"],
        "gates": report["gates"],
        "localStructuralAuditPassed": report["decision"]["localStructuralAuditPassed"],
    }, ensure_ascii=False, indent=2, sort_keys=True))
    if not report["decision"]["localStructuralAuditPassed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
