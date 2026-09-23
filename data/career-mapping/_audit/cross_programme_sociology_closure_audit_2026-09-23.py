"""Read-only cross-programme Sociology closure/scaling checkpoint.

This test reads existing local audit artefacts and source files only.  It does
not call Supabase, fetch URLs, run a browser, write generated data, or change
implementation files.  The companion markdown file records the checkpoint
interpretation and remaining blockers.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def read_json(name: str) -> dict[str, Any]:
    return json.loads((AUDIT / name).read_text(encoding="utf-8"))


def read_source(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def snapshot() -> dict[str, Any]:
    scaling = read_json("programme_scaling_contract_2026-09-19.json")
    admin = read_json("full_population_downstream_admin_audit_2026-09-21.json")
    checkpoint = read_json("full_population_downstream_checkpoint_2026-09-21.json")
    routes = read_json("DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json")
    current_route = read_json("ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json")
    current_admin = read_json("ADMIN_EVIDENCE_LEDGER_ACCEPTANCE_AUDIT_2026-09-23.json")
    links = read_json("CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json")
    jamb = read_json("jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json")
    roles = read_json("role_learning_core_audit_2026-09-21.json")
    relationships = read_json("RELATIONSHIP_RESOURCE_BACKLOG_AUDIT_2026-09-19.json")
    generic = read_json("programme_curriculum_contract_2026-09-18.json")
    sociology = read_json("sociology_curriculum_contract_2026-09-17.json")

    career_dirs = [
        ROOT / "src" / "components" / "careerIntelligence",
        ROOT / "src" / "screens" / "careerIntelligence",
    ]
    direct_link_calls: list[str] = []
    for directory in career_dirs:
        for path in directory.rglob("*.tsx"):
            if path.name == "ExternalLinkGuard.tsx":
                continue
            text = path.read_text(encoding="utf-8")
            if "Linking.openURL" in text:
                direct_link_calls.append(str(path.relative_to(ROOT)).replace("\\", "/"))

    static_contracts = {
        "programme_card_summaries": "programmeSummary" in read_source("src/components/careerIntelligence/DegreeSkills.tsx")
        or "studentAction" in read_source("src/components/careerIntelligence/DegreeSkills.tsx"),
        "friendly_connection_titles": "relationshipLabel" in read_source("src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx"),
        "friendly_summary_helper": "export function studentSummary" in read_source("src/lib/careerLabels.ts"),
        "relationship_grouping": "studentRelationshipTargets" in read_source("src/components/careerIntelligence/ToolGroupsBlock.tsx"),
        "admin_provenance_queue": "canExposeToStudents" in read_source("src/screens/admin/adminGuidanceEvidence.ts"),
        "student_boundary_audit": all(
            marker in read_source("data/career-mapping/_audit/student_admin_agent_boundary_audit.py")
            for marker in (
                "check_student_loaders_are_sanitised",
                "check_student_link_boundary_and_no_link_state",
                "check_role_item_state_controls_legacy_arrays",
                "check_student_career_components_do_not_open_urls_directly",
            )
        ),
        "no_direct_student_link_open": not direct_link_calls,
    }

    return {
        "population": admin["population"],
        "gates": admin["gates"],
        "inventory": admin["inventory_reconciliation"],
        "static_contracts": static_contracts,
        "routes": routes["coverage"],
        "route_decision": routes["decision"],
        "links": links["summary"],
        "link_decision": links["decision"],
        "jamb": {
            **jamb["totals"],
            "resource_states": current_admin["jambPopulation"]["resourceStates"],
            "resource_review_required": sum(
                count for state, count in current_admin["jambPopulation"]["resourceStates"].items()
                if state == "review_required"
            ),
            "resource_unavailable": sum(
                count for state, count in current_admin["jambPopulation"]["resourceStates"].items()
                if state == "genuinely_unavailable"
            ),
            "route_population": current_route["population"],
        },
        "jamb_categories": [
            {"category": row["category"], "rows": row["rows"]}
            for row in jamb["categories"]
        ],
        "roles": {
            "canonical": roles["roles"],
            "max_student_essential": roles["maxStudentEssential"],
            "max_student_optional": roles["maxStudentOptional"],
            "raw_over_cap": roles["rolesWithRawValuesOverCap"],
            "all_student_rows_within_caps": roles["allStudentRowsWithinCaps"],
        },
        "relationships": relationships["relationshipBacklog"],
        "scaling_summary": scaling["summary"],
        "scaling_curriculum": scaling["curriculumAudit"],
        "scaling_context": scaling["programmeContextTotals"],
        "scaling_relationships": scaling["relationshipAudit"],
        "checkpoint": checkpoint,
        "generic_curriculum": {
            "programmes": generic["programmeCount"],
            "courses": generic["courseCount"],
            "outcomes": generic["outcomeCount"],
            "student_outcomes": generic["studentOutcomeCount"],
            "review_outcomes": generic["reviewOutcomeCount"],
            "abilities": generic["programmeAbilityCount"],
            "annotations": generic["annotationCount"],
        },
        "sociology_curriculum": {
            "courses": 34,
            "outcomes": 243,
            "abilities": 7,
            "quality_gates": sociology["qualityGates"],
        },
        "direct_link_calls": direct_link_calls,
    }


def test_population_and_route_continuity() -> None:
    report = snapshot()
    population = report["population"]
    assert population == {
        "programmes": 237,
        "generic_curriculum_contracts": 236,
        "sociology_curriculum_contracts": 1,
        "jamb_identities": 420,
        "active_programme_domain_links": 1344,
    }
    assert report["routes"]["programmeRecordsCovered"] == 237
    assert report["routes"]["fullDownstreamCoverageProgrammeCount"] == 237
    assert report["routes"]["programmesWithMissingRoutes"] == 0
    assert report["routes"]["downstreamRouteTotals"] == {
        "domain": 1344,
        "subgroup": 3580,
        "role": 46941,
    }


def test_curriculum_contracts_are_programme_owned_and_fallback_free() -> None:
    report = snapshot()
    curriculum = report["scaling_curriculum"]
    assert curriculum["genericProgrammeCount"] == 236
    assert curriculum["sociologyProgrammeCount"] == 1
    assert curriculum["curriculumCountMismatch"] == 0
    assert curriculum["missingContractSummary"] == 0
    assert curriculum["missingCurriculumSourceLocators"] == 0
    assert curriculum["legacyFallbackRisk"] == 0
    assert curriculum["rawCurriculumAnnotations"] == 0
    assert curriculum["sociologyQualityGateFailures"] == 0
    assert report["gates"]["curriculum_card_summary_contract"]["student_outcome_rows"] == 81186
    assert report["gates"]["curriculum_card_summary_contract"]["legacy_profile_rows_retained_as_audit"] == 131178
    assert report["generic_curriculum"]["student_outcomes"] == 81186
    assert report["sociology_curriculum"]["quality_gates"] == {
        "noStudentOutcomeContainsAnnotation": True,
        "noStudentOutcomeContainsLisException": True,
        "everyOutcomeHasCourseLocator": True,
        "abilitiesSeparateFromOutcomes": True,
        "roleAggregatedRowsIncluded": False,
    }


def test_jamb_identity_and_review_queue_boundary() -> None:
    report = snapshot()
    jamb = report["jamb"]
    assert jamb["jamb_rows"] == 420
    assert jamb["unique_jamb_names"] == 420
    assert jamb["unavailable"] == 0
    assert jamb["review_required"] == 86
    assert {row["category"]: row["rows"] for row in report["jamb_categories"]} == {
        "partial_curriculum_scope": 273,
        "combined_ccmas_curriculum": 28,
        "external_sources_required": 6,
        "single_ccmas_full_curriculum": 113,
    }
    assert report["checkpoint"]["admin_and_jamb_queues"]["jamb_rows_without_component_refs"] == 0
    assert report["checkpoint"]["admin_and_jamb_queues"]["jamb_rows_without_source_refs"] == 0
    assert jamb["resource_states"] == {"available": 420}
    assert jamb["resource_review_required"] == 0
    assert jamb["resource_unavailable"] == 0
    assert jamb["route_population"]["jambResourceAvailable"] == 420
    assert jamb["route_population"]["jambResourceReviewRequired"] == 0
    assert jamb["route_population"]["jambResourceUnavailable"] == 0


def test_ownership_review_only_links_and_relationships_fail_closed() -> None:
    report = snapshot()
    context = report["scaling_context"]
    source_gate = report["gates"]["source_and_link_state"]
    relationship_gate = report["gates"]["relationship_grouping_and_student_edge_gate"]
    assert context["missingGuidanceOwner"] == 0
    assert context["ownerMismatch"] == 0
    assert context["roleAggregateLeakageCandidates"] == 0
    assert context["missingSourceReferences"] == 0
    assert context["missingSourceLocators"] == 0
    assert context["unlabelledLinkState"] == 0
    assert source_gate["ownership_mismatches"] == 0
    assert source_gate["missing_source_references"] == 0
    assert source_gate["missing_source_locators"] == 0
    assert source_gate["invalid_item_link_urls"] == 0
    assert source_gate["relationship_states"] == {"source_backed": 405858, "not_established": 2305}
    assert relationship_gate["not_established_or_unresolved"] == 2305
    assert report["checkpoint"]["student_safe_boundary"]["review_only_and_not_established_blocked"] is True
    assert report["checkpoint"]["contextual_source_and_relationship_state"]["ownership_mismatches"] == 0


def test_item_links_and_role_learning_caps() -> None:
    report = snapshot()
    assert report["links"]["catalogueRows"] == 121377
    assert report["links"]["programmesWithMissingLinkState"] == 0
    assert report["links"]["stateCounts"] == {"linked": 5253, "no_link": 116116, "review_required": 8}
    assert report["roles"] == {
        "canonical": 5209,
        "max_student_essential": 12,
        "max_student_optional": 5,
        "raw_over_cap": 3910,
        "all_student_rows_within_caps": True,
    }


def test_current_student_admin_static_boundary_and_open_gates() -> None:
    report = snapshot()
    assert all(report["static_contracts"].values()), report["static_contracts"]
    assert report["direct_link_calls"] == []
    assert report["gates"]["admin_provenance_and_review_queues"]["passed_locally"] is True
    assert report["gates"]["admin_provenance_and_review_queues"]["full_render_accepted"] is False
    assert report["gates"]["admin_provenance_and_review_queues"]["programme_admin_render_states"] == {
        "pending_full_population_render": 237
    }
    assert report["gates"]["student_safe_filtering"]["passed_static"] is True
    assert report["gates"]["student_safe_filtering"]["student_exposure_accepted"] is False
    assert report["gates"]["student_safe_filtering"]["live_payload_proof"] is False
    assert report["route_decision"]["studentExposureApproved"] is False
    assert report["link_decision"]["studentExposureApproved"] is False
    assert report["checkpoint"]["student_safe_boundary"]["browser_proof"] is False
    assert report["checkpoint"]["student_safe_boundary"]["live_sql_verification"] is False


if __name__ == "__main__":
    result = snapshot()
    print(json.dumps({
        "population": result["population"],
        "jamb": result["jamb"],
        "routes": result["routes"],
        "links": result["links"],
        "roles": result["roles"],
        "relationshipStates": result["relationships"]["stateCounts"],
        "directStudentLinkCalls": result["direct_link_calls"],
        "staticContracts": result["static_contracts"],
        "scalingApproval": result["gates"]["student_safe_filtering"]["student_exposure_accepted"],
    }, indent=2, sort_keys=True))
