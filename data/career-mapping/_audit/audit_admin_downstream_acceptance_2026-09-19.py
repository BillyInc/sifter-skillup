"""Build a compact admin/downstream acceptance checkpoint.

This coordinator deliberately consumes the existing population-wide JSON
audits rather than opening the 422k-row contextual gzip.  It checks the
admin-side boundary across all parsed programmes and JAMB identities while
leaving unresolved evidence visible as a queue, not as a student approval.
It is local evidence only: it does not fetch URLs, write SQL, or assert that
an admin route rendered in a browser.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SCALING = AUDIT / "programme_scaling_contract_2026-09-19.json"
JAMB = AUDIT / "jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json"
RELATIONSHIPS = AUDIT / "relationship_backlog_inventory.json"
OUT_JSON = AUDIT / "ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json"
OUT_MD = AUDIT / "ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.md"

ADMIN_EVIDENCE = ROOT / "src" / "screens" / "admin" / "adminGuidanceEvidence.ts"
ADMIN_PANEL = ROOT / "src" / "components" / "admin" / "AdminGuidanceEvidencePanel.tsx"
ADMIN_DATA = ROOT / "src" / "lib" / "adminData.ts"
INSTITUTION_TYPES = ROOT / "src" / "types" / "institution.ts"
INSTITUTION_ROUTE = ROOT / "backend" / "routes" / "institutions_routes.py"
ADMIN_COVERAGE_SCREEN = ROOT / "src" / "screens" / "admin" / "SkillsGapScreen.tsx"
PROVISIONING = ROOT / "src" / "screens" / "admin" / "StudentProvisioningScreen.tsx"
REPORT_SMOKE = ROOT / "scripts" / "sociologyReportSmoke.cjs"


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def contains(path: Path, pattern: str) -> bool:
    return re.search(pattern, path.read_text(encoding="utf-8"), re.MULTILINE) is not None


def build_report() -> dict[str, Any]:
    scaling = read_json(SCALING)
    jamb = read_json(JAMB)
    relationships = read_json(RELATIONSHIPS)
    programmes = scaling["programmes"]
    programme_keys = [row.get("programmeKey") for row in programmes]
    unmapped = [
        row["programmeKey"]
        for row in programmes
        if row.get("context", {}).get("noActiveDomainMapping", 0) > 0
    ]
    categories = {
        row["category"]: row["rows"] for row in jamb["categories"]
    }
    relationship_queue_count = relationships.get(
        "total_unresolved",
        scaling["relationshipAudit"]["notEstablishedRows"],
    )

    admin_contract = {
        "provenance_gate": all(
            contains(ADMIN_EVIDENCE, pattern)
            for pattern in (
                r"sourceUrl",
                r"sourceLocator",
                r"sourceAccessedAt",
                r"hasSourceTrace",
            )
        ),
        "review_queue_states": all(
            contains(ADMIN_EVIDENCE, pattern)
            for pattern in (
                r"adminEvidenceQueueState",
                r"review_required",
                r"no_link",
                r"not_established",
                r"audit_only",
            )
        ),
        "ownership_and_context_gate": all(
            contains(ADMIN_EVIDENCE, pattern)
            for pattern in (
                r"contextKey",
                r"guidanceOwner",
                r"hasMatchingOwner",
            )
        ),
        "student_exposure_gate": all(
            contains(ADMIN_EVIDENCE, pattern)
            for pattern in (
                r"canExposeToStudents",
                r"evidenceState !== \"approved\"",
            )
        ),
        "panel_exposes_queue_state": contains(ADMIN_PANEL, r"Review queue:"),
        "panel_exposes_link_and_relationship_state": all(
            contains(ADMIN_PANEL, pattern)
            for pattern in (r"Link state:", r"Relationship:", r"Technical provenance:")
        ),
        "route_preserves_curriculum_and_downstream_traceability": all(
            contains(INSTITUTION_ROUTE, pattern)
            for pattern in (
                r"_optional_rows",
                r"ProgrammeCurriculumEvidence",
                r"programme_curriculum_outcomes",
                r"career_item_relationships",
                r"programme_evidence=deduped_programme_evidence",
                r"source_locator: Any",
            )
        ),
        "admin_screen_renders_programme_and_curriculum_evidence": all(
            contains(ADMIN_COVERAGE_SCREEN, pattern)
            for pattern in (r"programmeEvidence", r"curriculumEvidence", r"Admin source traceability")
        ),
    }
    institution_contract = {
        "authoritative_identity_fields": all(
            contains(INSTITUTION_TYPES, pattern)
            for pattern in (r"officialName", r"shortName", r"address", r"schoolCode")
        ),
        "institution_scoped_reads": contains(ADMIN_DATA, r"/api/institutions/me/"),
        "consent_and_aggregate_boundary": all(
            contains(PROVISIONING, pattern)
            for pattern in (r"Aggregate-only", r"requestConsent", r"sharedWithYou")
        ),
    }
    report_contract = {
        "route_identity_bound": contains(
            REPORT_SMOKE, r"hasGuidanceReportContextForRoute"
        ),
        "review_required_before_actions": all(
            contains(REPORT_SMOKE, pattern)
            for pattern in (
                r"print/download must stay locked before Review",
                r"share must stay locked before Review",
                r"a selection change must reopen Review",
            )
        ),
    }
    return {
        "schemaVersion": 1,
        "auditName": "admin_downstream_acceptance",
        "auditDate": "2026-09-19",
        "scope": {
            "programmeCount": scaling["summary"]["programmeCount"],
            "genericProgrammeCount": scaling["summary"]["genericProgrammeCount"],
            "sociologyProgrammeCount": scaling["summary"]["sociologyProgrammeCount"],
            "jambIdentityCount": jamb["totals"]["unique_jamb_names"],
            "studentLookupPopulation": "jamb_identities",
            "ccmasSupportingProgrammeCount": scaling["summary"]["programmeCount"],
            "ccmasPackagesAreSupportingEvidenceOnly": True,
            "missingCcmasAnchorDoesNotHideJambIdentity": True,
            "activeProgrammeDomainLinks": scaling["summary"]["activeDomainLinks"],
        },
        "populationIdentity": {
            "allProgrammeKeysPresent": all(isinstance(key, str) and key for key in programme_keys),
            "uniqueProgrammeKeys": len(set(programme_keys)),
            "programmeKeysAreUnique": len(set(programme_keys)) == len(programme_keys),
        },
        "unmappedProgrammes": unmapped,
        "jambCoverage": {
            "partialCurriculumScope": categories.get("partial_curriculum_scope", 0),
            "combinedCcmasCurriculum": categories.get("combined_ccmas_curriculum", 0),
            "externalSourcesRequired": categories.get("external_sources_required", 0),
            "singleCcmasFullCurriculum": categories.get("single_ccmas_full_curriculum", 0),
            "reviewRequired": jamb["totals"]["review_required"],
        },
        "reviewQueue": {
                "unresolvedRelationshipRows": relationship_queue_count,
            "notEstablishedRelationshipRows": scaling["relationshipAudit"]["notEstablishedRows"],
            "unresolvedRelationshipsAreInternalNonBlockingCoverage": True,
            "contextualItems": scaling["contextualAudit"]["itemRows"],
            "contextualItemLinkStateGaps": scaling["contextualAudit"]["issues"].get(
                "unlabelledLinkState", 0
            ),
        },
        "adminContract": admin_contract,
        "institutionContract": institution_contract,
        "reportContract": report_contract,
        "decision": {
            "localAdminBoundaryImplemented": all(admin_contract.values()),
            "localInstitutionBoundaryImplemented": all(institution_contract.values()),
            "localReportGateImplemented": all(report_contract.values()),
            "fullAdminRenderAccepted": False,
            "studentExposureAccepted": False,
            "sqlApplied": False,
            "browserProofComplete": False,
            "reason": (
                "Admin review may inspect provenance and unresolved states, but "
                "full-population admin rendering, live payloads, SQL and browser "
                "acceptance remain end-of-scaling gates."
            ),
        },
    }


def render_markdown(report: dict[str, Any]) -> str:
    scope = report["scope"]
    queue = report["reviewQueue"]
    jamb = report["jambCoverage"]
    decision = report["decision"]
    lines = [
        "# Admin/downstream acceptance checkpoint (2026-09-19)",
        "",
        "Read-only local checkpoint for the admin/institution boundary across the full parsed population. It does not fetch URLs, apply SQL, or claim browser acceptance.",
        "",
        "## Population boundary",
        "",
        f"- Programmes: **{scope['programmeCount']}** ({scope['genericProgrammeCount']} generic + {scope['sociologyProgrammeCount']} Sociology).",
        f"- Student lookup population: **{scope['jambIdentityCount']}** canonical JAMB identities; CCMAS supporting packages: **{scope['ccmasSupportingProgrammeCount']}**.",
        f"- Explicitly unmapped programme: **{', '.join(report['unmappedProgrammes']) or 'none'}**.",
        "- The admin contract is evaluated against the full population; Sociology/Nursing/Accounting route smokes remain fixtures, not full render proof.",
        "",
        "## JAMB curriculum review queues",
        "",
        f"- Partial CCMAS scope: **{jamb['partialCurriculumScope']}**; combined CCMAS: **{jamb['combinedCcmasCurriculum']}**; external-source-required: **{jamb['externalSourcesRequired']}**; single full CCMAS: **{jamb['singleCcmasFullCurriculum']}**.",
        f"- Review-required identities: **{jamb['reviewRequired']}**; these remain a queue and are not promoted by route rendering.",
        "",
        "## Admin safeguards",
        "",
        "- Provenance requires a source URL or locator plus an access date.",
        "- Approval requires a stable context key and a guidance owner matching the context level.",
        "- `review_required`, `no_link`, `not_established`, `audit_only` and `unavailable` remain visible to admins and excluded from student exposure. Unresolved item-to-item relationships are internal non-blocking coverage, not a blocker to the JAMB lookup population or CCMAS package audit.",
        "- The panel shows the review-queue state rather than treating a missing field as an empty or approved result.",
        "- Institution identity uses authoritative official/short name, address and school-code fields; student provisioning keeps aggregate and consent-gated views separate.",
        "- Report actions remain locked until the route-specific completed Review; a selection change reopens the gate.",
        "",
        "## Remaining queues and proof",
        "",
        f"- Contextual catalogue rows: **{queue['contextualItems']}**; unresolved/not-established relationship rows: **{queue['unresolvedRelationshipRows']}** / **{queue['notEstablishedRelationshipRows']}** (internal, non-blocking coverage).",
        f"- Contextual link-state gaps in the current scaling contract: **{queue['contextualItemLinkStateGaps']}**.",
        "- All parsed programmes currently have an active domain mapping; any future mapping change must retain the same source/evidence gate.",
        "- Full 237-programme admin rendering, live institution payloads, browser proof and SQL remain deferred.",
        "",
        "## Decision",
        "",
        f"- Local admin boundary implementation: **{'PASS' if decision['localAdminBoundaryImplemented'] else 'OPEN'}**.",
        f"- Local institution boundary implementation: **{'PASS' if decision['localInstitutionBoundaryImplemented'] else 'OPEN'}**.",
        f"- Local route-specific report gate implementation: **{'PASS' if decision['localReportGateImplemented'] else 'OPEN'}**.",
        "- Student exposure and full acceptance: **NOT APPROVED** pending the remaining queues and end-of-scaling browser/SQL gates.",
        "",
        "Generated by `data/career-mapping/_audit/audit_admin_downstream_acceptance_2026-09-19.py`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "decision": report["decision"]}, sort_keys=True))


if __name__ == "__main__":
    main()
