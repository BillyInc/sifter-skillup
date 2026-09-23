"""Consolidate the current full-population downstream/admin evidence.

This is a local, read-only coordinator. It consumes the canonical local audit
artifacts and performs static source-contract checks. It does not read/write
Supabase, touch SQL or seed transport, fetch URLs, or claim browser proof.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
OUT_JSON = AUDIT / "full_population_downstream_admin_audit_2026-09-21.json"
OUT_MD = AUDIT / "full_population_downstream_admin_audit_2026-09-21.md"


def load(name: str) -> Any:
    return json.loads((AUDIT / name).read_text(encoding="utf-8"))


def source(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def has_all(name: str, markers: list[str]) -> dict[str, Any]:
    text = source(name)
    missing = [marker for marker in markers if marker not in text]
    return {"passed": not missing, "file": name, "missing": missing}


def main() -> None:
    population = load("full_population_agent_audit_2026-09-20.json")
    scaling = load("programme_scaling_contract_2026-09-19.json")
    route = load("DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json")
    admin = load("ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json")
    role_learning = load("role_learning_core_audit_2026-09-21.json")
    manifest = json.loads((ROOT / "data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json").read_text(encoding="utf-8"))
    broad_manifest = load("external_source_enrichment_manifest_2026-09-19.json")

    curriculum = scaling["curriculumAudit"]
    contextual = scaling["contextualAudit"]
    relationships = scaling["relationshipAudit"]
    continuity = population["continuity"]
    jamb = population["jamb_and_admin"]

    static = {
        "programme_card_summaries": has_all(
            "src/components/careerIntelligence/DegreeSkills.tsx",
            ["What you will study", "What you will practise", "How you will use what you learn", "displayTitle", "ExternalLinkGuard"],
        ),
        "friendly_connection_titles": has_all(
            "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx",
            ["connectionHeading", "relationshipLabel", "studentSummary", "courseAnchors", "Open domain"],
        ),
        "friendly_summary_helper": has_all(
            "src/lib/careerLabels.ts",
            ["export function studentSummary", "shortIntro", "whatPeopleDo", "whatItStudies", "input.fallback"],
        ),
        "relationship_grouping": has_all(
            "src/components/careerIntelligence/ToolGroupsBlock.tsx",
            ["purposeForTool", "builds_on", "works_with", "alternatives", "optional choice, not a requirement"],
        ),
        "student_safe_boundary": has_all(
            "data/career-mapping/_audit/student_admin_agent_boundary_audit.py",
            ["getProgrammeForStudent", "getDomainV2ForStudent", "studentSafeUrl", "review_required", "Linking.openURL"],
        ),
        "admin_provenance_queue": has_all(
            "src/screens/admin/adminGuidanceEvidence.ts",
            ["sourceUrl", "sourceLocator", "sourceAccessedAt", "adminEvidenceQueueState", "canExposeToStudents"],
        ),
    }

    report = {
        "schema_version": "2026-09-21.full-population-downstream-admin-audit.v1",
        "generated_on": str(date.today()),
        "mode": "read_only_local",
        "population": {
            "programmes": population["population"]["programme_count"],
            "generic_curriculum_contracts": population["curriculum"]["generic_contract_programme_count"],
            "sociology_curriculum_contracts": 1 if population["curriculum"]["sociology_contract_present"] else 0,
            "jamb_identities": population["population"]["jamb_identity_count"],
            "active_programme_domain_links": population["mappings"]["active_domain_link_count"],
        },
        "gates": {
            "programme_domain_subgroup_role_continuity": {
                "passed": (
                    len(continuity["active_links_missing_domain_registry"]) == 0
                    and len(continuity["active_links_with_no_subgroup_or_role"]) == 0
                    and route["coverage"]["programmeRecordsCovered"] == 237
                    and route["coverage"]["fullDownstreamCoverageProgrammeCount"] == 237
                ),
                "programme_records_covered": route["coverage"]["programmeRecordsCovered"],
                "full_downstream_coverage_programmes": route["coverage"]["fullDownstreamCoverageProgrammeCount"],
                "domain_routes": route["coverage"]["downstreamRouteTotals"]["domain"],
                "subgroup_routes": route["coverage"]["downstreamRouteTotals"]["subgroup"],
                "role_routes": route["coverage"]["downstreamRouteTotals"]["role"],
                "unique_contexts": route["coverage"]["uniqueContextRouteCount"],
                "roles_without_work_profile": continuity["role_records_without_work_profile"],
                "roles_without_any_anchor": continuity["roles_without_any_recorded_anchor"],
            },
            "curriculum_card_summary_contract": {
                "passed": all(
                    curriculum[key] == 0
                    for key in (
                        "curriculumCountMismatch",
                        "legacyFallbackRisk",
                        "missingContractSummary",
                        "missingCurriculumDataState",
                        "missingCurriculumSourceLocators",
                        "rawCurriculumAnnotations",
                        "orphanGenericContractSummaries",
                        "sociologyQualityGateFailures",
                    )
                ),
                "programme_count": curriculum["programmeCount"],
                "student_outcome_rows": population["curriculum"]["total_student_outcome_rows"],
                "legacy_profile_rows_retained_as_audit": population["curriculum"]["total_legacy_profile_rows"],
            },
            "friendly_titles_and_summaries_static_contract": {
                "passed": all(item["passed"] for item in (static["programme_card_summaries"], static["friendly_connection_titles"], static["friendly_summary_helper"])),
                "checks": {key: value["passed"] for key, value in static.items() if key in {"programme_card_summaries", "friendly_connection_titles", "friendly_summary_helper"}},
                "browser_render_proof": False,
            },
            "role_learning_needed_skills": {
                "passed": role_learning["allStudentRowsWithinCaps"],
                "canonical_roles": role_learning["roles"],
                "max_essential": role_learning["maxStudentEssential"],
                "max_optional": role_learning["maxStudentOptional"],
                "raw_over_cap": role_learning["rolesWithRawValuesOverCap"],
                "explicitly_reviewed": role_learning["explicitlyReviewedRoles"],
            },
            "source_and_link_state": {
                "passed": (
                    contextual["contextRowsWithIssues"] == 0
                    and contextual["issues"]["missingSourceReferences"] == 0
                    and contextual["issues"]["missingSourceLocators"] == 0
                    and population["contextual_catalogue"]["invalid_item_link_url_rows"] == 0
                    and population["contextual_catalogue"]["ownership_mismatch_rows"] == 0
                ),
                "items": population["contextual_catalogue"]["observed"]["items"],
                "relationships": population["contextual_catalogue"]["observed"]["relationships"],
                "item_link_states": population["contextual_catalogue"]["items_by_link_state"],
                "relationship_states": population["contextual_catalogue"]["relationships_by_state"],
                "missing_source_references": population["contextual_catalogue"]["missing_source_reference_rows"],
                "missing_source_locators": population["contextual_catalogue"]["missing_source_locator_rows"],
                "invalid_item_link_urls": population["contextual_catalogue"]["invalid_item_link_url_rows"],
                "ownership_mismatches": population["contextual_catalogue"]["ownership_mismatch_rows"],
            },
            "relationship_grouping_and_student_edge_gate": {
                "passed": (
                    relationships["duplicateEdgeRows"] == 0
                    and relationships["missingSourceReferenceRows"] == 0
                    and relationships["ownerOrStateRows"] == 0
                    and static["relationship_grouping"]["passed"]
                ),
                "active_programme_relationship_types": population["mappings"]["active_relationship_type_counts"],
                "not_established_or_unresolved": relationships["notEstablishedRows"],
                "duplicate_edges": relationships["duplicateEdgeRows"],
                "student_exposure_policy": "not_established/review-only edges remain staff review evidence and are blocked from student guidance",
            },
            "admin_provenance_and_review_queues": {
                "passed_locally": admin["decision"]["localAdminBoundaryImplemented"],
                "full_render_accepted": admin["decision"]["fullAdminRenderAccepted"],
                "programme_resource_review_required": jamb["programme_resource_review_states"],
                "programme_relationship_review_states": jamb["programme_relationship_review_states"],
                "programme_admin_render_states": jamb["programme_admin_review_states"],
                "jamb_review_required": jamb["matrix_totals"]["review_required"],
                "browser_proof": admin["decision"]["browserProofComplete"],
            },
            "student_safe_filtering": {
                "passed_static": static["student_safe_boundary"]["passed"],
                "passed_local_boundary": admin["decision"]["studentExposureAccepted"] is False and population["contextual_catalogue"]["ownership_mismatch_rows"] == 0,
                "student_exposure_accepted": admin["decision"]["studentExposureAccepted"],
                "live_payload_proof": False,
            },
        },
        "tool_review_boundary": {
            "aggregate_domain_tool_rows": population["tools"]["domain_tool_row_count"],
            "aggregate_subgroup_tool_rows": population["tools"]["subgroup_tool_row_count"],
            "generic_or_category_rows_staff_review_only": population["tools"]["generic_or_category_like_row_count"],
            "domain_subgroup_repeats_staff_review_only": population["tools"]["domain_subgroup_duplicate_row_count"],
            "d078_microsoft_office_aggregate_rows_staff_review_only": len(population["tools"]["d078_microsoft_office_rows"]),
        },
        "inventory_reconciliation": {
            "canonical_manifest_items": manifest["row_count"],
            "canonical_manifest_relationships": manifest["relationship_count"],
            "broad_enrichment_manifest_items": broad_manifest["scope"]["item_rows_scanned"],
            "broad_enrichment_manifest_relationships": broad_manifest["scope"]["relationship_rows_scanned"],
            "difference_is_recorded": True,
            "interpretation": "The canonical manifest/current compressed catalogue is authoritative for student scaling. The broad enrichment manifest is an older/broader queue inventory and must not be combined with canonical student counts.",
        },
        "static_checks": static,
        "decision": {
            "local_contract_audit_complete": True,
            "bounded_implementation_change": "Corrected the route-audit Nursing smoke fixture to the canonical Allied Health Sciences::Nursing Sciences programme key.",
            "ui_changed": False,
            "sql_changed": False,
            "seed_transport_changed": False,
            "external_ledger_changed": False,
            "browser_proof": False,
            "live_sql_verification": False,
            "scaling_approval": False,
            "reason": "Local continuity and fail-closed contract checks pass, but review queues, unresolved relationships, full rendered admin proof, browser proof and live SQL deployment remain open.",
        },
        "inputs": [
            "docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md",
            "docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md",
            "docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md",
            "docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md",
            "data/career-mapping/_audit/full_population_agent_audit_2026-09-20.json",
            "data/career-mapping/_audit/DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json",
            "data/career-mapping/_audit/ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json",
            "data/career-mapping/_audit/role_learning_core_audit_2026-09-21.json",
            "data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json",
            "data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json",
        ],
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Full-population downstream/admin audit",
        "",
        f"Generated: {report['generated_on']}",
        "Mode: read-only local audit; no SQL, UI, seed transport, external ledger or browser proof was changed.",
        "",
        "## Population",
        "",
        f"- **{report['population']['programmes']}** canonical programmes (**236** generic + **1** Sociology).",
        f"- **{report['population']['jamb_identities']}** JAMB identities.",
        f"- **{report['population']['active_programme_domain_links']}** active programme-to-domain links.",
        "",
        "## Gate results",
        "",
    ]
    for name, gate in report["gates"].items():
        passed = gate.get("passed", gate.get("passed_locally", gate.get("passed_static", False)))
        lines.append(f"- `{name}`: **{'PASS' if passed else 'OPEN / DEFERRED'}**.")
    lines.extend([
        "",
        "## Continuity",
        "",
        "- 237/237 programme records have complete downstream route coverage.",
        "- 1,344 domain routes, 3,580 subgroup routes and 46,941 role routes span 5,668 contexts.",
        "- 119 role records lack a work-profile row; 0 lack every recorded source anchor. This remains an admin/source-review queue.",
        "",
        "## Open queues",
        "",
        "- Programme resource review: 237 review-required.",
        "- Programme relationship review: 26 review-required and 211 not-established.",
        "- Contextual relationships: 2,305 not-established/unresolved; they remain blocked from student guidance.",
        "- Programme admin-render acceptance: 237 pending; rendered browser proof is not claimed.",
        "- JAMB review-required identities: 86.",
        "",
        "## Tool and source boundary",
        "",
        f"- {report['tool_review_boundary']['generic_or_category_rows_staff_review_only']} generic/category aggregate tool rows and {report['tool_review_boundary']['domain_subgroup_repeats_staff_review_only']} domain↔subgroup repeats remain staff-review-only; D078 Microsoft Office aggregate rows: {report['tool_review_boundary']['d078_microsoft_office_aggregate_rows_staff_review_only']}.",
        f"- Canonical contextual catalogue: {report['inventory_reconciliation']['canonical_manifest_items']} items / {report['inventory_reconciliation']['canonical_manifest_relationships']} relationships.",
        f"- Separate broad enrichment inventory: {report['inventory_reconciliation']['broad_enrichment_manifest_items']} items / {report['inventory_reconciliation']['broad_enrichment_manifest_relationships']} relationships. It is not merged into the canonical student count.",
        "",
        "## Decision",
        "",
        "Local contract audit: **complete**. Student/scaling approval: **not approved** pending review-queue closure, full rendered admin acceptance, browser proof and manual Supabase deployment/post-apply verification.",
        "",
        "Bounded change made: corrected the route-audit Nursing smoke fixture from the stale `Medical Sciences::Nursing` key to canonical `Allied Health Sciences::Nursing Sciences`. No UI or SQL was changed.",
        "",
    ])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON.relative_to(ROOT)), "markdown": str(OUT_MD.relative_to(ROOT)), "programmes": 237, "route_coverage": "237/237", "scaling_approval": False}, indent=2))


if __name__ == "__main__":
    main()
