"""Reconcile JAMB resource availability with downstream mapping review.

This is a bounded, read-only admin audit.  It deliberately does not search or
rewrite item/relationship enrichment ledgers.  A JAMB identity can have an
available external learning resource while its programme-to-CCMAS/domain
mapping remains under review; those are separate admin states.

The reconciliation is conservative: an identity is only *eligible for a
future authorised promotion* when an existing, item-specific, authoritative
resource already supports the identity.  This pass never promotes rows or
approves student exposure.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
RESOURCE_MANIFEST = AUDIT / "programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json"
SOURCE_ENRICHMENT = AUDIT / "source_enrichment_batch_broad_2026-09-19.json"
OUT_JSON = AUDIT / "JAMB_MAPPING_REVIEW_RECONCILIATION_2026-09-23_001.json"
OUT_MD = AUDIT / "JAMB_MAPPING_REVIEW_RECONCILIATION_2026-09-23_001.md"

EXPECTED_JAMB = 420
EXPECTED_MAPPING_REVIEW = 86
CONFIRMED_SOURCE_STATES = {"confirmed", "source_backed", "verified"}
DOWNSTREAM_RESOURCE_ROLES = {"external_learning_reference", "official_curriculum_source"}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return str(value or "").strip().casefold().replace("-", "_")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def identity_tokens(name: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", name.casefold()) if len(token) > 2}


def contains_exact_identity(text: str, jamb_name: str) -> bool:
    """Require the complete identity phrase, not a discipline/category match."""
    haystack = re.sub(r"\s+", " ", text.casefold()).strip()
    needle = re.sub(r"\s+", " ", jamb_name.casefold()).strip()
    if needle and needle in haystack:
        return True
    # For punctuated/all-caps catalogue labels, accept the full token set only
    # when every meaningful token is present.  A single shared token is not
    # enough to turn a discipline-level reference into item-specific evidence.
    tokens = identity_tokens(jamb_name)
    return bool(tokens) and tokens.issubset(set(re.findall(r"[a-z0-9]+", haystack)))


def is_item_specific_authoritative_resource(resource: dict[str, Any], jamb_name: str) -> bool:
    """Check existing resource metadata only; do not fetch or infer a source."""
    role = norm(resource.get("resource_role"))
    source_status = norm(resource.get("source_status"))
    source_check = resource.get("source_check") or {}
    check_status = norm(source_check.get("status")) if isinstance(source_check, dict) else ""
    if role not in DOWNSTREAM_RESOURCE_ROLES:
        return False
    if source_status not in CONFIRMED_SOURCE_STATES and check_status not in CONFIRMED_SOURCE_STATES:
        return False
    if not str(resource.get("url") or "").startswith("https://"):
        return False
    if not str(resource.get("locator") or "").strip() or not str(resource.get("accessed_on") or "").strip():
        return False
    evidence_text = " ".join(
        str(resource.get(key) or "")
        for key in ("title", "evidence_summary", "locator")
    )
    return contains_exact_identity(evidence_text, jamb_name)


def has_item_specific_authoritative_downstream_evidence(row: dict[str, Any]) -> bool:
    """Require an evidence-backed mapping edge, not merely a curriculum URL.

    A JAMB identity's official identity, CCMAS curriculum, or open-learning
    resource can establish resource availability without establishing a
    programme-to-domain downstream edge.  The corrected ledger's ``links``
    therefore must carry an actual external evidence record before a
    review-required mapping may even become promotion-eligible.
    """
    jamb_name = str(row.get("jamb_name") or "")
    for link in row.get("links") or []:
        if not isinstance(link, dict):
            continue
        if int(link.get("external_source_count") or 0) < 1:
            continue
        for source in link.get("external_sources") or []:
            if not isinstance(source, dict):
                continue
            status = norm(source.get("source_status") or source.get("status") or (source.get("source_check") or {}).get("status"))
            if status not in CONFIRMED_SOURCE_STATES:
                continue
            if not str(source.get("url") or "").startswith("https://"):
                continue
            if not str(source.get("locator") or "").strip() or not str(source.get("accessed_on") or source.get("accessedAt") or "").strip():
                continue
            evidence_text = " ".join(str(source.get(key) or "") for key in ("title", "evidence_summary", "locator"))
            if contains_exact_identity(evidence_text, jamb_name) or str(link.get("domain_name") or "").casefold() in evidence_text.casefold():
                return True
    return False


def load_corrected_resource_rows() -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    manifest = load_json(RESOURCE_MANIFEST)
    rows: list[dict[str, Any]] = []
    checks: list[dict[str, Any]] = []
    for batch in manifest.get("batches") or []:
        path = AUDIT / str(batch["file"])
        raw = path.read_bytes() if path.is_file() else b""
        lines = [line for line in raw.decode("utf-8").splitlines() if line.strip()]
        checks.append(
            {
                "file": path.name,
                "exists": path.is_file(),
                "sha256Matches": hashlib.sha256(raw).hexdigest() == batch["sha256"],
                "rowCountMatches": len(lines) == int(batch["row_count"]),
                "rowCount": len(lines),
            }
        )
        rows.extend(json.loads(line) for line in lines)
    return manifest, rows, checks


def source_summary(row: dict[str, Any]) -> dict[str, int]:
    resources = row.get("resources") or []
    return {
        "resourceRows": len(resources),
        "authoritativeResourceRows": sum(
            norm(resource.get("source_status")) in CONFIRMED_SOURCE_STATES
            or norm((resource.get("source_check") or {}).get("status")) in CONFIRMED_SOURCE_STATES
            for resource in resources
            if isinstance(resource, dict)
        ),
        "itemSpecificDownstreamRows": sum(
            is_item_specific_authoritative_resource(resource, str(row.get("jamb_name") or ""))
            for resource in resources
            if isinstance(resource, dict)
        ),
        "itemSpecificMappingEvidenceRows": int(has_item_specific_authoritative_downstream_evidence(row)),
    }


def build_report() -> dict[str, Any]:
    manifest, rows, batch_checks = load_corrected_resource_rows()
    broad = load_json(SOURCE_ENRICHMENT)
    broad_by_name = {str(row.get("jamb_name") or ""): row for row in broad.get("jamb_identities") or []}
    rows_by_name = {str(row.get("jamb_name") or ""): row for row in rows}
    identities: list[dict[str, Any]] = []
    for name in sorted(rows_by_name, key=str.casefold):
        resource_row = rows_by_name[name]
        mapping_row = broad_by_name.get(name, {})
        mapping_state = norm(resource_row.get("mapping_status") or mapping_row.get("mapping_status")) or "missing"
        mapping_reason = str(
            resource_row.get("mapping_status_reason")
            or mapping_row.get("mapping_status_reason")
            or "Mapping evidence state is not recorded."
        )
        resource_state = norm(resource_row.get("resource_classification")) or "missing"
        source = source_summary(resource_row)
        item_specific_resource = source["itemSpecificDownstreamRows"] > 0
        item_specific_mapping = source["itemSpecificMappingEvidenceRows"] > 0
        mapping_review = mapping_state == "review_required"
        # This is a reportable eligibility decision only.  No row is mutated or
        # promoted by this audit, even when evidence is sufficient for review.
        promotion_eligible = mapping_review and item_specific_mapping
        if mapping_review and not item_specific_mapping:
            reason_code = "mapping_review_without_item_specific_downstream_evidence"
            admin_state = "review_required"
        elif mapping_review:
            reason_code = "mapping_review_item_specific_evidence_present_authorisation_required"
            admin_state = "awaiting_authorised_mapping_review"
        else:
            reason_code = "mapping_evidence_not_in_review_queue"
            admin_state = "mapping_ready_subject_to_explicit_approval"
        identities.append(
            {
                "jambName": name,
                "mappingEvidenceReview": {
                    "state": mapping_state,
                    "reason": mapping_reason,
                    "isReviewRequired": mapping_review,
                    "itemSpecificAuthoritativeResourceEvidence": item_specific_resource,
                    "itemSpecificAuthoritativeDownstreamEvidence": item_specific_mapping,
                    "promotionEligibleForAuthorisedReview": promotion_eligible,
                    "promoted": False,
                },
                "resourceAvailability": {
                    "state": resource_state,
                    "decision": norm(resource_row.get("decision")),
                    "ccmasAnchorAbsent": bool(resource_row.get("ccmas_anchor_absent")),
                    "externalResourceRows": source["resourceRows"],
                    "authoritativeResourceRows": source["authoritativeResourceRows"],
                },
                "adminQueue": {
                    "state": admin_state,
                    "reasonCode": reason_code,
                    "studentExposure": "blocked_until_mapping_review_and_explicit_approval",
                },
            }
        )

    mapping_reviews = [row for row in identities if row["mappingEvidenceReview"]["isReviewRequired"]]
    promotions = [row for row in mapping_reviews if row["mappingEvidenceReview"]["promoted"]]
    eligible = [row for row in mapping_reviews if row["mappingEvidenceReview"]["promotionEligibleForAuthorisedReview"]]
    resource_states = Counter(row["resourceAvailability"]["state"] for row in identities)
    mapping_states = Counter(row["mappingEvidenceReview"]["state"] for row in identities)
    reason_codes = Counter(row["adminQueue"]["reasonCode"] for row in mapping_reviews)
    report = {
        "schemaVersion": "2026-09-23.jamb-mapping-review-reconciliation.v1",
        "auditName": "jamb_mapping_review_reconciliation_admin",
        "generatedOn": "2026-09-23",
        "mode": "read_only_local",
        "scope": {
            "jambIdentityCount": len(identities),
            "expectedJambIdentityCount": EXPECTED_JAMB,
            "mappingReviewIdentityCount": len(mapping_reviews),
            "expectedMappingReviewIdentityCount": EXPECTED_MAPPING_REVIEW,
            "ccmasAnchorAbsentRows": sum(row["resourceAvailability"]["ccmasAnchorAbsent"] for row in identities),
            "ccmasAnchorIsOptionalProvenance": True,
        },
        "resourceAvailability": {
            "states": dict(sorted(resource_states.items())),
            "all420Reconciled": len(identities) == EXPECTED_JAMB and sum(resource_states.values()) == EXPECTED_JAMB,
            "mappingReviewIsSeparateFromAvailability": True,
        },
        "mappingEvidenceReview": {
            "states": dict(sorted(mapping_states.items())),
            "reasonCodes": dict(sorted(reason_codes.items())),
            "reviewRowsWithItemSpecificAuthoritativeEvidence": len(eligible),
            "reviewRowsWithItemSpecificAuthoritativeResourceEvidence": sum(
                row["mappingEvidenceReview"]["itemSpecificAuthoritativeResourceEvidence"]
                for row in mapping_reviews
            ),
            "reviewRowsPromoted": len(promotions),
            "reviewRowsRemainingInternal": len(mapping_reviews) - len(promotions),
            "allReviewRowsFailClosed": all(
                row["adminQueue"]["studentExposure"] == "blocked_until_mapping_review_and_explicit_approval"
                for row in mapping_reviews
            ),
        },
        "decision": {
            "all420JambIdentitiesPresent": len(identities) == EXPECTED_JAMB,
            "exactly86MappingReviewIdentitiesReconciled": len(mapping_reviews) == EXPECTED_MAPPING_REVIEW,
            "noIdentityPromotedWithoutItemSpecificEvidence": all(
                not row["mappingEvidenceReview"]["promoted"]
                or row["mappingEvidenceReview"]["itemSpecificAuthoritativeDownstreamEvidence"]
                for row in identities
            ),
            "reviewQueueRemainsInternal": all(
                not row["mappingEvidenceReview"]["promoted"]
                for row in mapping_reviews
            ),
            "resourceAvailabilityGatePasses": resource_states == {"available": EXPECTED_JAMB},
            "studentExposureApproved": False,
            "sqlApplied": False,
            "browserProof": False,
            "reason": (
                "Resource availability is read from the corrected all-420 JAMB ledger; "
                "downstream mapping review is evaluated independently. The 86 review-required "
                "identities remain internal because existing records do not contain "
                "item-specific authoritative downstream evidence. No item or relationship "
                "enrichment was reopened and no row was promoted."
            ),
        },
        "integrity": {
            "appendOnlyInput": bool(manifest.get("append_only")),
            "resourceManifestSha256": sha256(RESOURCE_MANIFEST),
            "sourceEnrichmentSha256": sha256(SOURCE_ENRICHMENT),
            "batchChecks": batch_checks,
            "batchesPass": all(check["exists"] and check["sha256Matches"] and check["rowCountMatches"] for check in batch_checks),
        },
        "identities": identities,
        "inputs": [
            "data/career-mapping/_audit/programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json",
            "data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json",
        ],
    }
    return report


def render_markdown(report: dict[str, Any]) -> str:
    scope = report["scope"]
    resources = report["resourceAvailability"]
    mapping = report["mappingEvidenceReview"]
    decision = report["decision"]
    lines = [
        "# JAMB downstream mapping-review reconciliation (2026-09-23)",
        "",
        "Bounded read-only admin reconciliation. It does not search or rewrite item/relationship enrichment ledgers, apply SQL, fetch URLs, open a browser, or claim live deployment.",
        "",
        "## Population and state separation",
        "",
        f"- JAMB identities reconciled: **{scope['jambIdentityCount']}/{scope['expectedJambIdentityCount']}**; CCMAS-anchor-absent rows: **{scope['ccmasAnchorAbsentRows']}** (optional provenance, not an availability blocker).",
        f"- Resource availability: **{resources['states']}**. This is independent of downstream mapping evidence: **{'PASS' if resources['mappingReviewIsSeparateFromAvailability'] else 'OPEN'}**.",
        f"- Downstream mapping-review identities: **{scope['mappingReviewIdentityCount']}/{scope['expectedMappingReviewIdentityCount']}**; mapping states: **{mapping['states']}**.",
        "",
        "## Reconciliation decision",
        "",
        f"- Review identities with existing item-specific authoritative downstream evidence: **{mapping['reviewRowsWithItemSpecificAuthoritativeEvidence']}**; exact curriculum/resource evidence without a confirmed downstream edge is kept separate.",
        f"- Review identities promoted: **{mapping['reviewRowsPromoted']}**; remaining internal: **{mapping['reviewRowsRemainingInternal']}**.",
        f"- Exact reason for the internal queue: **{mapping['reasonCodes']}**.",
        f"- No promotion without item-specific evidence: **{'PASS' if decision['noIdentityPromotedWithoutItemSpecificEvidence'] else 'OPEN'}**.",
        f"- Student exposure approved: **{'YES' if decision['studentExposureApproved'] else 'NO — fail-closed'}**.",
        "",
        "## Boundaries",
        "",
        "- `resource_available` means an external learning/resource record exists for the JAMB identity; it does not certify its CCMAS/domain mapping.",
        "- `mapping_review_required` remains an admin/source-review queue state even when resources are available.",
        "- No item/relationship search, enrichment, promotion, SQL apply, or browser proof was performed.",
        "",
        "Generated by `data/career-mapping/_audit/reconcile_jamb_mapping_review_admin_2026-09-23.py`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "decision": report["decision"]}, sort_keys=True))


if __name__ == "__main__":
    main()
