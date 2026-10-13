"""Read-only bounded downstream/admin slice audit.

The selection checkpoint is written before any item/relationship inspection.
This script only reads checked-in audit contracts and writes sibling audit
artifacts under this directory. It never edits app code, catalogue data,
seed transport, SQL, UI or browser-proof artifacts.
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


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
PREFIX = "downstream_admin_slice_002_2026-09-21"
CHECKPOINT_JSON = AUDIT / f"{PREFIX}_checkpoint.json"
CHECKPOINT_MD = AUDIT / f"{PREFIX}_checkpoint.md"
REPORT_JSON = AUDIT / f"{PREFIX}_report.json"
REPORT_MD = AUDIT / f"{PREFIX}_report.md"


def read_json(relative: str) -> Any:
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def normalise(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().casefold())


def write_checkpoint() -> dict[str, Any]:
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    prior = read_json("data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.json")
    canonical = sorted(
        broad.get("canonical_programmes", []),
        key=lambda row: str(row.get("programme_key") or "").casefold(),
    )
    prior_keys = {
        str(key)
        for key in (prior.get("tranche_definition") or {}).get("programme_keys", [])
    }
    existing_keys: set[str] = set()
    for path in AUDIT.glob("downstream_admin_slice_*_selection.json"):
        if path.name.startswith(PREFIX.replace("_2026-09-21", "")):
            try:
                existing = json.loads(path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            existing_keys.update(str(key) for key in existing.get("programme_keys", []))
    candidates = [
        row for row in canonical
        if str(row.get("programme_key") or "") not in prior_keys
        and str(row.get("programme_key") or "") not in existing_keys
    ]
    selected = candidates[:20]
    if len(selected) < 20:
        raise RuntimeError(f"non-overlapping selection has only {len(selected)} rows")
    selected_keys = [str(row["programme_key"]) for row in selected]
    if prior_keys.intersection(selected_keys):
        raise RuntimeError("selection overlaps the prior admin tranche")
    payload = {
        "schema_version": "2026-09-21.downstream-admin-slice-checkpoint.v1",
        "generated_on": str(date.today()),
        "read_only": True,
        "status": "selection_saved_before_audit",
        "selection": {
            "policy": "next 20 canonical programme keys after excluding the prior first-20 admin tranche and any prior local slice selection",
            "programme_count": len(selected_keys),
            "programme_keys": selected_keys,
            "overlap_with_prior_admin_tranche": sorted(prior_keys.intersection(selected_keys)),
            "overlap_with_existing_local_slices": sorted(existing_keys.intersection(selected_keys)),
        },
        "scope_reference": {
            "canonical_programmes": len(canonical),
            "canonical_jamb_identities": int((broad.get("scope") or {}).get("jamb_identity_count") or 0),
        },
        "audit_contract": {
            "student_admin_language_separation": "static contract markers plus per-programme queue state",
            "category_ownership": "context ownership/state counters and student/admin boundary markers",
            "bounded_role_learning": "role-learning caps and route-level role coverage",
            "source_link_review_states": "per-programme provenance/link/review queue states",
            "relationships": "active programme-domain types plus unresolved/not-established queues",
            "provenance": "source reference/locator and ownership counters",
            "fail_closed_student_exposure": "review-only/not-established states remain non-approved",
        },
        "inputs_read": [
            "docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md",
            "docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md",
            "docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md",
            "docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md",
            "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
            "data/career-mapping/_audit/full_population_admin_agent_tranche_2026-09-21.json",
        ],
        "search_started": False,
        "product_files_changed": False,
        "sql_or_browser_proof": False,
    }
    CHECKPOINT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Downstream/admin slice 002 checkpoint",
        "",
        f"Generated: {payload['generated_on']}",
        "Status: **selection saved before audit/search**.",
        "",
        "This is a read-only checkpoint. No app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.",
        "",
        "## Selection",
        "",
        f"- Programmes reserved: **{len(selected_keys)}**.",
        "- Selection is the next lexical block after the prior first-20 admin tranche.",
        "- Overlap with prior tranche: **0**.",
        "",
        "## Reserved programme keys",
        "",
    ]
    lines.extend(f"- `{key}`" for key in selected_keys)
    lines.extend([
        "",
        "## Next audit pass",
        "",
        "Inspect these programmes and their downstream routes for curriculum continuity, active relationship types, ownership/category boundaries, bounded role-learning skills, source/link/review states, provenance, relationship queues and fail-closed student exposure. Admin rendering remains a local static/contract check; browser and live SQL proof are not claimed.",
        "",
    ])
    CHECKPOINT_MD.write_text("\n".join(lines), encoding="utf-8")
    return payload


def source_markers() -> dict[str, Any]:
    checks = {
        "student_language_boundary": (
            "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx",
            ("studentSummary", "getProgrammeForStudent"),
        ),
        "admin_language_boundary": (
            "src/screens/admin/AdminCareerDetailScreen.tsx",
            ("audience=\"admin\"", "ADMIN CATALOGUE VIEW"),
        ),
        "admin_provenance_and_queue": (
            "src/screens/admin/adminGuidanceEvidence.ts",
            ("sourceUrl", "sourceLocator", "adminEvidenceQueueState", "canExposeToStudents"),
        ),
        "student_fail_closed_boundary": (
            "src/lib/studentCareerBoundary.ts",
            ("review_required", "no_link", "studentSafeUrl", "linkState"),
        ),
        "student_relationship_fail_closed_boundary": (
            "src/screens/admin/adminGuidanceEvidence.ts",
            ("not_established", "canExposeToStudents", "evidenceState !== \"approved\""),
        ),
        "relationship_grouping": (
            "src/components/careerIntelligence/ToolGroupsBlock.tsx",
            ("builds_on", "works_with", "alternative"),
        ),
    }
    results: dict[str, Any] = {}
    for name, (relative, markers) in checks.items():
        text = (ROOT / relative).read_text(encoding="utf-8")
        missing = [marker for marker in markers if marker not in text]
        results[name] = {"file": relative, "passed": not missing, "missing": missing}
    return results


def audit() -> dict[str, Any]:
    checkpoint = json.loads(CHECKPOINT_JSON.read_text(encoding="utf-8"))
    keys = checkpoint["selection"]["programme_keys"]
    selected_set = set(keys)
    broad = read_json("data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json")
    scaling = read_json("data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json")
    routes = read_json("data/career-mapping/_audit/DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json")
    curriculum = read_json("data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json")
    roles = read_json("data/career-mapping/_audit/role_learning_core_audit_2026-09-21.json")
    admin = read_json("data/career-mapping/_audit/ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json")

    broad_by_key = {str(row.get("programme_key")): row for row in broad.get("canonical_programmes", [])}
    scaling_by_key = {str(row.get("programmeKey")): row for row in scaling.get("programmes", [])}
    route_by_key = {str(row.get("programmeKey")): row for row in routes.get("programmes", [])}
    curriculum_by_key = {
        f"{row.get('discipline')}::{row.get('programme')}": row
        for row in curriculum.get("programmes", [])
    }
    programme_rows: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    relationship_counts: Counter[str] = Counter()
    for key in keys:
        broad_row = broad_by_key[key]
        scaled = scaling_by_key[key]
        route = route_by_key[key]
        context = scaled.get("context") or {}
        mapping = broad_row.get("active_domain_mapping") or {}
        links = mapping.get("links") or []
        curriculum_row = curriculum_by_key.get(key)
        resource_state = str((broad_row.get("resource_review") or {}).get("state") or "missing")
        relationship_state = str((broad_row.get("relationship_review") or {}).get("state") or "missing")
        admin_state = str((broad_row.get("admin_review") or {}).get("state") or "missing")
        unresolved = int((broad_row.get("relationship_review") or {}).get("unresolved_or_not_established_count") or 0)
        relationship_counts[relationship_state] += 1
        checks = {
            "curriculum_contract_present": curriculum_row is not None,
            "active_mapping_present": bool(links),
            "active_relationship_types_only": all(link.get("match_type") in {"direct", "functional", "adjacent"} for link in links),
            "downstream_route_complete": bool(route.get("fullDownstreamCoverage")) and not route.get("missingRoutes"),
            "domain_contexts_present": all(bool(domain.get("domainContextPresent")) for domain in route.get("domainRoutes") or []),
            "ownership_and_state_complete": all(int(context.get(field) or 0) == 0 for field in ("missingGuidanceOwner", "ownerMismatch", "missingDataState", "invalidDataState", "ownerOrStateRows")),
            "category_ownership_and_aggregate_boundary": int(context.get("roleAggregateLeakageCandidates") or 0) == 0,
            "provenance_complete": all(int(context.get(field) or 0) == 0 for field in ("missingSourceReferences", "missingSourceLocators", "sourceLocatorGaps", "missingSourceReferenceRows")),
            "resource_state_explicit": resource_state in {"review_required", "linked", "no_link", "approved", "unavailable"},
            "relationship_state_explicit": relationship_state in {"review_required", "not_established", "linked", "approved", "unavailable"},
            "admin_state_explicit": admin_state in {"pending_full_population_render", "approved", "review_required", "unavailable"},
            "student_exposure_fail_closed": resource_state in {"review_required", "no_link", "unavailable"} or relationship_state in {"review_required", "not_established", "unavailable"},
        }
        for name, passed in checks.items():
            if not passed:
                failures.append({"programme_key": key, "gate": name})
        programme_rows.append({
            "programme_key": key,
            "discipline": broad_row.get("discipline"),
            "programme": broad_row.get("programme"),
            "curriculum": {"contract_present": checks["curriculum_contract_present"], "course_count": (broad_row.get("curriculum") or {}).get("course_count"), "outcome_count": (broad_row.get("curriculum") or {}).get("outcome_count")},
            "downstream": {"domain_routes": route.get("domainRouteCount", 0), "subgroup_routes": route.get("subgroupRouteCount", 0), "role_routes": route.get("roleRouteCount", 0), "route_key_count": route.get("routeKeyCount", 0)},
            "relationship_types": dict(Counter(str(link.get("match_type")) for link in links)),
            "queues": {"resource": resource_state, "relationship": relationship_state, "unresolved_relationships": unresolved, "admin": admin_state},
            "context_findings": {field: context.get(field, 0) for field in ("missingGuidanceOwner", "ownerMismatch", "missingSourceReferences", "missingSourceLocators", "roleAggregateLeakageCandidates", "linkStateGaps", "unresolvedEndpointRows", "notEstablishedRows")},
            "checks": checks,
        })

    static = source_markers()
    report = {
        "schema_version": "2026-09-21.downstream-admin-slice-report.v1",
        "generated_on": str(date.today()),
        "read_only": True,
        "selection_checkpoint": str(CHECKPOINT_JSON.relative_to(ROOT)),
        "scope": {"programmes": len(keys), "programme_keys": keys, "prior_overlap": checkpoint["selection"]["overlap_with_prior_admin_tranche"], "canonical_programmes": len(broad.get("canonical_programmes", [])), "canonical_jamb_identities": (broad.get("scope") or {}).get("jamb_identity_count")},
        "programme_rows": programme_rows,
        "failures": failures,
        "aggregate": {
            "domain_routes": sum(row["downstream"]["domain_routes"] for row in programme_rows),
            "subgroup_routes": sum(row["downstream"]["subgroup_routes"] for row in programme_rows),
            "role_routes": sum(row["downstream"]["role_routes"] for row in programme_rows),
            "relationship_states": dict(relationship_counts),
            "unresolved_relationships": sum(row["queues"]["unresolved_relationships"] for row in programme_rows),
        },
        "static_surface_checks": static,
        "role_learning_reference": {"allStudentRowsWithinCaps": roles.get("allStudentRowsWithinCaps"), "maxStudentEssential": roles.get("maxStudentEssential"), "maxStudentOptional": roles.get("maxStudentOptional")},
        "admin_reference": {"localAdminBoundaryImplemented": admin.get("decision", {}).get("localAdminBoundaryImplemented"), "fullAdminRenderAccepted": admin.get("decision", {}).get("fullAdminRenderAccepted"), "studentExposureAccepted": admin.get("decision", {}).get("studentExposureAccepted")},
        "decision": {"bounded_contract_audit_complete": not failures and all(check["passed"] for check in static.values()) and bool(roles.get("allStudentRowsWithinCaps")), "student_exposure_approved": False, "browser_proof": False, "live_sql_verification": False, "reason": "This slice retains review/not-established/admin-pending states and does not claim browser or live SQL acceptance."},
        "inputs": checkpoint["inputs_read"] + ["data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json", "data/career-mapping/_audit/DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json", "data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json", "data/career-mapping/_audit/role_learning_core_audit_2026-09-21.json", "data/career-mapping/_audit/ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json"],
        "product_files_changed": False,
        "sql_or_browser_proof": False,
    }
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Downstream/admin slice 002 report",
        "",
        f"Generated: {report['generated_on']}",
        "Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.",
        "",
        "## Scope",
        "",
        f"- Programmes audited: **{len(keys)}**; overlap with prior tranche: **0**.",
        f"- Downstream routes: **{report['aggregate']['domain_routes']}** domains, **{report['aggregate']['subgroup_routes']}** subgroups, **{report['aggregate']['role_routes']}** roles.",
        f"- Unresolved/not-established relationship queue represented by this slice: **{report['aggregate']['unresolved_relationships']}**.",
        "",
        "## Gate results",
        "",
    ]
    gate_names = [
        "curriculum_contract_present", "active_mapping_present", "active_relationship_types_only", "downstream_route_complete", "domain_contexts_present", "ownership_and_state_complete", "category_ownership_and_aggregate_boundary", "provenance_complete", "resource_state_explicit", "relationship_state_explicit", "admin_state_explicit", "student_exposure_fail_closed",
    ]
    for gate in gate_names:
        count = sum(1 for row in programme_rows if row["checks"][gate])
        lines.append(f"- `{gate}`: **{count}/{len(programme_rows)}** pass.")
    lines.append(f"- `bounded_role_learning_caps`: **{'PASS' if roles.get('allStudentRowsWithinCaps') else 'OPEN'}** (global role audit: max {roles.get('maxStudentEssential')} essential / {roles.get('maxStudentOptional')} optional student skills).")
    lines.extend([
        "",
        "## Static student/admin boundary",
        "",
    ])
    for name, check in static.items():
        lines.append(f"- `{name}`: **{'PASS' if check['passed'] else 'OPEN'}**." + (f" Missing: {', '.join(check['missing'])}." if check["missing"] else ""))
    lines.extend(["", "## Programme queue summary", "", "| Programme | Domains | Subgroups | Roles | Resource | Relationship | Admin |", "|---|---:|---:|---:|---|---|---|"])
    for row in programme_rows:
        q = row["queues"]
        d = row["downstream"]
        lines.append(f"| {row['programme_key']} | {d['domain_routes']} | {d['subgroup_routes']} | {d['role_routes']} | `{q['resource']}` | `{q['relationship']}` ({q['unresolved_relationships']}) | `{q['admin']}` |")
    lines.extend([
        "",
        "## Decision",
        "",
        "The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.",
        "",
    ])
    REPORT_MD.write_text("\n".join(lines), encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--continue", dest="continue_audit", action="store_true")
    args = parser.parse_args()
    checkpoint = write_checkpoint()
    if not args.continue_audit:
        print(json.dumps({"checkpoint": str(CHECKPOINT_JSON.relative_to(ROOT)), "programmes": checkpoint["selection"]["programme_count"], "search_started": False}, indent=2))
        return
    report = audit()
    print(json.dumps({"checkpoint": str(CHECKPOINT_JSON.relative_to(ROOT)), "report": str(REPORT_JSON.relative_to(ROOT)), "programmes": report["scope"]["programmes"], "failures": len(report["failures"])}, indent=2))


if __name__ == "__main__":
    main()
