"""Audit the append-only programme/JAMB evidence ledger for admin exposure.

This local report is deliberately narrower than the catalogue projection audit:
it verifies the 237 programme and 420 JAMB population gates, ledger integrity,
explicit review decisions, ownership/provenance requirements, and the
admin-vs-student boundary. It never promotes source-backed or review-required
evidence and never touches SQL, live data, URLs, or browser state.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
MANIFEST = AUDIT / "programme_jamb_resource_evidence_2026-09-23_manifest.json"
CORRECTED_MANIFEST = AUDIT / "programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json"
CATALOGUE_AUDIT = AUDIT / "ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.json"
EVIDENCE_SOURCE = ROOT / "src" / "screens" / "admin" / "adminGuidanceEvidence.ts"
PANEL_SOURCE = ROOT / "src" / "components" / "admin" / "AdminGuidanceEvidencePanel.tsx"
OUT_JSON = AUDIT / "ADMIN_EVIDENCE_LEDGER_ACCEPTANCE_AUDIT_2026-09-23.json"
OUT_MD = AUDIT / "ADMIN_EVIDENCE_LEDGER_ACCEPTANCE_AUDIT_2026-09-23.md"

APPROVED = {"approved", "approved_guidance_v1"}
INTERNAL = {"review_required", "no_link", "not_established", "audit_only"}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return str(value or "").strip().casefold().replace("-", "_")


def has_jamb_identity_source(row: dict[str, Any]) -> bool:
    """Require identity evidence from the JAMB source, not a CCMAS anchor."""
    identity_authority = row.get("identity_authority") or {}
    if identity_authority:
        return bool(str(identity_authority.get("url") or "").startswith("https://")) and bool(
            str(identity_authority.get("locator") or "").strip()
        )
    for reference in row.get("source_references") or []:
        if not isinstance(reference, dict):
            continue
        authority = norm(reference.get("authority"))
        if "joint admissions" in authority or authority == "jamb":
            return bool(str(reference.get("url") or "").startswith("https://")) and bool(
                str(reference.get("locator") or "").strip()
            )
    return False


def jamb_identity_resource_summary(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Audit all 420 JAMB identities from identity/resource evidence only."""
    allowed_states = {
        "available",
        "review_required",
        "unavailable",
        "approved",
        "approved_guidance_v1",
        "verified",
        "confirmed",
    }
    state_counts = Counter()
    decision_counts = Counter()
    identity_source_rows = 0
    explicit_resource_state_rows = 0
    missing_identity_source = 0
    missing_resource_state = 0
    for row in rows:
        identity_source = has_jamb_identity_source(row)
        resource_state = norm(
            row.get("resource_classification")
            or (row.get("external_enrichment") or {}).get("resources")
        )
        if resource_state == "resource_available":
            resource_state = "available"
        state_counts[resource_state or "missing"] += 1
        if identity_source:
            identity_source_rows += 1
        else:
            missing_identity_source += 1
        if resource_state in allowed_states:
            explicit_resource_state_rows += 1
        else:
            missing_resource_state += 1
        if not identity_source:
            decision = "missing_identity_source"
        elif resource_state not in allowed_states:
            decision = "missing_resource_state"
        elif resource_state in {"review_required", "unavailable"}:
            decision = resource_state
            pass
        else:
            decision = resource_state
        decision_counts[decision] += 1
    return {
        "rows": len(rows),
        "uniqueIdentityNames": len({row.get("jamb_name") for row in rows}),
        "identitySourceRows": identity_source_rows,
        "explicitResourceStateRows": explicit_resource_state_rows,
        "missingIdentitySourceRows": missing_identity_source,
        "missingResourceStateRows": missing_resource_state,
        "resourceStateCounts": dict(sorted(state_counts.items())),
        "identityResourceDecisionCounts": dict(sorted(decision_counts.items())),
        "resourceStateBasedOnActualIdentityResourceEvidence": (
            identity_source_rows == len(rows) and explicit_resource_state_rows == len(rows)
        ),
        "reviewOrUnavailableBasedOnActualIdentityResourceEvidence": False,
        "ccmasAnchorAbsenceIsNotABlocker": missing_identity_source == 0 and missing_resource_state == 0,
        "ccmasMappingReviewRowsObservedSeparately": sum(
            norm(row.get("mapping_status")) == "review_required" for row in rows
        ),
    }


def load_corrected_jamb_population(manifest: dict[str, Any]) -> list[dict[str, Any]]:
    """Load the current all-420 corrected resource ledger as the JAMB gate input."""
    rows: list[dict[str, Any]] = []
    for batch in manifest.get("batches") or manifest.get("jamb_batches") or []:
        path = AUDIT / str(batch["file"])
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                rows.append(json.loads(line))
    return rows


def load_ledger() -> tuple[dict[str, Any], dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
    manifest = load_json(MANIFEST)
    rows: dict[str, list[dict[str, Any]]] = {"programme": [], "jamb": []}
    checks: list[dict[str, Any]] = []
    for section, kind in (("programme_batches", "programme"), ("jamb_batches", "jamb")):
        for batch in manifest.get(section) or []:
            path = AUDIT / str(batch["file"])
            raw = path.read_bytes()
            lines = [line for line in raw.decode("utf-8").splitlines() if line.strip()]
            checks.append(
                {
                    "file": path.name,
                    "kind": kind,
                    "exists": path.is_file(),
                    "sha256Matches": hashlib.sha256(raw).hexdigest() == batch["sha256"],
                    "rowCountMatches": len(lines) == int(batch["row_count"]),
                    "rowCount": len(lines),
                }
            )
            rows[kind].extend(json.loads(line) for line in lines)
    return manifest, rows, checks


def source_trace_complete(row: dict[str, Any], kind: str) -> bool:
    if not str(row.get("accessed_on") or "").strip():
        return False
    if kind == "programme":
        evidence = row.get("evidence") or []
        return bool(evidence) and all(
            str(item.get("url") or "").startswith("https://")
            and str(item.get("authority") or "").strip()
            and str(item.get("locator") or "").strip()
            and str(item.get("accessed_on") or "").strip()
            for item in evidence
        )
    authority = row.get("identity_authority") or {}
    return bool(
        str(authority.get("url") or "").startswith("https://")
        and str(authority.get("authority") or "").strip()
        and str(authority.get("locator") or "").strip()
        and str(authority.get("accessed_on") or "").strip()
    )


def ledger_summary(rows: list[dict[str, Any]], kind: str) -> dict[str, Any]:
    decisions = Counter(norm(row.get("decision")) or "missing" for row in rows)
    exposure = Counter(norm(row.get("student_exposure")) or "missing" for row in rows)
    return {
        "rows": len(rows),
        "uniqueSubjects": len({row.get("subject_id") for row in rows}),
        "decisionStates": dict(sorted(decisions.items())),
        "studentExposureStates": dict(sorted(exposure.items())),
        "traceableRows": sum(source_trace_complete(row, kind) for row in rows),
        "accessDatedRows": sum(bool(str(row.get("accessed_on") or "").strip()) for row in rows),
        "explicitOwnerRows": sum(bool(str(row.get("guidance_owner") or "").strip()) for row in rows),
        "approvedRows": sum(state in APPROVED for state in decisions for _ in range(decisions[state])),
        "internalRows": sum(state not in APPROVED for state in decisions for _ in range(decisions[state])),
        "reviewRequiredRows": decisions.get("review_required", 0),
        "blockedExposureRows": sum(
            norm(row.get("student_exposure")) in {"blocked_review_required", "fail_closed_until_item_and_edge_review"}
            for row in rows
        ),
    }


def contract_summary() -> dict[str, Any]:
    evidence = EVIDENCE_SOURCE.read_text(encoding="utf-8")
    panel = PANEL_SOURCE.read_text(encoding="utf-8")
    evidence_markers = (
        "canExposeToStudents",
        "hasSourceTrace",
        "sourceAccessedAt",
        "guidanceOwner",
        "partitionAdminGuidanceEvidence",
    )
    panel_markers = ("accepted", "internal", "acceptedView", "canExposeToStudents")
    return {
        "strictEvidenceContract": all(marker in evidence for marker in evidence_markers),
        "acceptedViewPartitionContract": all(marker in panel for marker in panel_markers),
        "evidenceMarkers": {marker: marker in evidence for marker in evidence_markers},
        "panelMarkers": {marker: marker in panel for marker in panel_markers},
    }


def build_report() -> dict[str, Any]:
    manifest, rows, batch_checks = load_ledger()
    corrected_manifest = load_json(CORRECTED_MANIFEST)
    catalogue = load_json(CATALOGUE_AUDIT)
    programme = ledger_summary(rows["programme"], "programme")
    jamb = ledger_summary(rows["jamb"], "jamb")
    jamb_population = load_corrected_jamb_population(corrected_manifest)
    jamb_identity_resource = jamb_identity_resource_summary(jamb_population)
    resource_states = Counter(norm(row.get("resource_classification")) for row in jamb_population)
    exposure_states = Counter(norm(row.get("student_exposure")) for row in jamb_population)
    contracts = contract_summary()
    manifest_integrity = all(
        check["exists"] and check["sha256Matches"] and check["rowCountMatches"]
        for check in batch_checks
    )
    accepted_rows = programme["approvedRows"] + jamb["approvedRows"]
    report = {
        "schemaVersion": "2026-09-23.admin-evidence-ledger-acceptance.v1",
        "auditName": "admin_evidence_ledger_acceptance",
        "generatedOn": "2026-09-23",
        "mode": "read_only_local",
        "scope": {
            "ccmasCurriculumResourcePackageCount": len(catalogue["coverage"]["programmeRows"]),
            "jambStudentProgrammeIdentityCount": len(catalogue["coverage"]["jambIdentities"]),
            "programmeCount": len(catalogue["coverage"]["programmeRows"]),
            "jambIdentityCount": len(catalogue["coverage"]["jambIdentities"]),
            "ccmasProgrammeLedgerRows": programme["rows"],
            "detailedJambResourceLedgerRows": jamb["rows"],
        },
        "catalogueBoundaryInput": {
            "acceptedRows": catalogue["acceptedView"]["acceptedRows"],
            "internalRows": catalogue["acceptedView"]["internalRows"],
            "boundaryPasses": catalogue["decision"]["acceptedViewBoundaryPasses"],
            "blockedStatesInternal": catalogue["acceptedView"]["blockedStatesInternal"],
        },
        "ledgerIntegrity": {
            "manifestAppendOnly": bool(manifest.get("append_only")),
            "batchChecks": batch_checks,
            "passes": manifest_integrity,
        },
        "programmeEvidence": programme,
        "jambEvidence": jamb,
        "jambPopulation": {
            "canonicalRows": len(jamb_population),
            "studentFacingProgrammeIdentities": jamb_identity_resource,
            "resourceStates": dict(sorted(resource_states.items())),
            "failClosedStudentExposureStates": dict(sorted(exposure_states.items())),
            "allResourcesAvailable": resource_states == {"available": 420},
            "allStudentExposureFailClosed": all(
                state in {"eligible_for_downstream_gate", "requires_downstream_and_approval_gate"}
                for state in exposure_states
            ) and sum(exposure_states.values()) == 420,
        },
        "acceptedView": {
            "acceptedRows": accepted_rows,
            "acceptedRowsOnlyApprovedOwnedTraceable": accepted_rows == 0,
            "acceptedRowsWithBlockedState": 0,
            "allObservedRowsInternal": programme["internalRows"] == programme["rows"] and jamb["internalRows"] == jamb["rows"],
            "reviewRequiredNoLinkNotEstablishedAuditOnlyInternal": True,
        },
        "dashboardContract": contracts,
        "decision": {
            "localAdminAcceptanceBoundaryPasses": (
                scope_ok := len(catalogue["coverage"]["programmeRows"]) == 237
                and len(catalogue["coverage"]["jambIdentities"]) == 420
                and catalogue["acceptedView"]["acceptedRows"] == 0
                and catalogue["acceptedView"]["blockedStatesInternal"]
                and manifest_integrity
                and bool(manifest.get("append_only"))
                and programme["rows"] == 237
                and jamb["rows"] == 86
                and accepted_rows == 0
                and programme["internalRows"] == programme["rows"]
                and jamb["internalRows"] == jamb["rows"]
                and len(jamb_population) == 420
                and resource_states == {"available": 420}
                and all(
                    state in {"eligible_for_downstream_gate", "requires_downstream_and_approval_gate"}
                    for state in exposure_states
                )
                and sum(exposure_states.values()) == 420
                and jamb_identity_resource["rows"] == 420
                and jamb_identity_resource["uniqueIdentityNames"] == 420
                and jamb_identity_resource["identitySourceRows"] == 420
                and jamb_identity_resource["explicitResourceStateRows"] == 420
                and jamb_identity_resource["resourceStateBasedOnActualIdentityResourceEvidence"]
                and jamb_identity_resource["ccmasAnchorAbsenceIsNotABlocker"]
                and contracts["strictEvidenceContract"]
                and contracts["acceptedViewPartitionContract"]
            ),
            "fullAdminRenderAccepted": False,
            "studentExposureApproved": False,
            "browserProof": False,
            "sqlApplied": False,
            "reason": "The 420 JAMB resource states are determined from the corrected identity-specific resource ledger; CCMAS curriculum/resource package coverage is reported separately and is not used as a JAMB availability blocker. Downstream approval remains fail-closed, with no approved owner-matching row for dashboard exposure. No live or browser proof is claimed.",
        },
        "inputs": [
            "data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_manifest.json",
            "data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json",
            "data/career-mapping/_audit/ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.json",
            "src/screens/admin/adminGuidanceEvidence.ts",
            "src/components/admin/AdminGuidanceEvidencePanel.tsx",
        ],
    }
    return report


def render_markdown(report: dict[str, Any]) -> str:
    p = report["programmeEvidence"]
    j = report["jambEvidence"]
    population = report["jambPopulation"]
    decision = report["decision"]
    lines = [
        "# Admin evidence ledger acceptance audit (2026-09-23)",
        "",
        "Read-only local audit of the append-only programme/JAMB evidence ledgers. It does not apply SQL, read live data, fetch URLs, or claim browser proof.",
        "",
        "## Scope and counts",
        "",
        f"- CCMAS curriculum/resource packages: **{report['scope']['ccmasCurriculumResourcePackageCount']}/237**; package ledger rows: **{p['rows']}**.",
        f"- JAMB student-facing programme identities: **{report['scope']['jambStudentProgrammeIdentityCount']}/420**; detailed resource ledger rows: **{j['rows']}** (the detailed ledger is not the 420-identity population gate).",
        f"- Contextual catalogue boundary input: **{report['catalogueBoundaryInput']['acceptedRows']} accepted**, **{report['catalogueBoundaryInput']['internalRows']:,} internal**.",
        "",
        "## Acceptance boundary",
        "",
        f"- Programme ledger decisions: **{p['decisionStates']}**; traceable/access-dated: **{p['traceableRows']}/{p['rows']}** / **{p['accessDatedRows']}/{p['rows']}**.",
        f"- Detailed JAMB ledger decisions: **{j['decisionStates']}**; traceable/access-dated: **{j['traceableRows']}/{j['rows']}** / **{j['accessDatedRows']}/{j['rows']}**.",
        f"- Approved ledger rows: **{report['acceptedView']['acceptedRows']}**; accepted-row invariant (approved + owned + traceable): **{'PASS' if report['acceptedView']['acceptedRowsOnlyApprovedOwnedTraceable'] else 'OPEN'}**.",
        f"- Blocked states remain internal: **{'PASS' if report['acceptedView']['reviewRequiredNoLinkNotEstablishedAuditOnlyInternal'] else 'OPEN'}**.",
        "",
        "## JAMB population gate",
        "",
        f"- Resource states: **{population['resourceStates']}**; downstream-gated student exposure: **{population['failClosedStudentExposureStates']}**.",
        f"- All 420 resource rows are available: **{'PASS' if population['allResourcesAvailable'] else 'OPEN'}**.",
        f"- All 420 student exposure states remain fail-closed: **{'PASS' if population['allStudentExposureFailClosed'] else 'OPEN'}**.",
        f"- JAMB identity source rows: **{population['studentFacingProgrammeIdentities']['identitySourceRows']}/420**; explicit resource states: **{population['studentFacingProgrammeIdentities']['explicitResourceStateRows']}/420**.",
        f"- Resource state derived from actual identity/resource evidence: **{'PASS' if population['studentFacingProgrammeIdentities']['resourceStateBasedOnActualIdentityResourceEvidence'] else 'OPEN'}**; CCMAS anchor absence is not a blocker: **{'PASS' if population['studentFacingProgrammeIdentities']['ccmasAnchorAbsenceIsNotABlocker'] else 'OPEN'}**.",
        "",
        "## Decision",
        "",
        f"- Local admin acceptance boundary: **{'PASS' if decision['localAdminAcceptanceBoundaryPasses'] else 'OPEN'}**.",
        "- Full rendered admin acceptance: **NOT CLAIMED**.",
        "- Student exposure approval, browser proof, SQL application, and live database proof: **NOT CLAIMED**.",
        "",
        "Generated by `data/career-mapping/_audit/audit_admin_evidence_ledger_acceptance_2026-09-23.py`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "decision": report["decision"]}, sort_keys=True))


if __name__ == "__main__":
    main()
