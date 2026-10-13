"""Resolve the generic-anchor programme/domain review set conservatively.

The course/outcome audit intentionally held these rows because a numeric count
alone is not enough. This file records the small set that has an explicit
domain concept in the CCMAS course title/content (for example, Engineering
Statistics and Data Analytics, Biostatistics, Statistical Computing, Financial
Mathematics, Information Systems, or Basic Surveying). Every other row remains
in ``unverified_links`` with an explicit exclusion reason.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).parent
MAPPING_PATH = ROOT / "programme_domain_final.json"
AUDIT_PATH = ROOT / "_audit" / "course_and_jamb_mapping_audit_2026-09-11.json"
AUDIT_REF = "semantic_mapping_review_2026-09-18"


# These are not broad domain guesses. Each decision is tied to an identifiable
# course/outcome concept in the checked-in CCMAS record. The original mapping
# type is preserved; this pass only resolves the review disposition.
RESTORE = {
    "Administration and Management::Actuarial Science::D009",
    "Administration and Management::Finance / Banking and Finance::D009",
    "Administration and Management::Logistics and Supply Chain Management::D009",
    "Administration and Management::Marketing::D009",
    "Education::Biology::D009",
    "Education::Geography::D009",
    "Environmental Sciences::Geography::D009",
    "Sciences::Biology::D009",
    "Sciences::Statistics::D009",
    "Social Sciences::Demography and Social Statistics::D009",
    "Social Sciences::Psychology::D009",
    "Administration and Management::Petroleum Information Management::D010",
    "Computing::Information Systems::D010",
    "Sciences::Industrial Mathematics::D014",
    "Environmental Sciences::Estate management::D072",
    "Engineering::AEROSPACE ENGINEERING::D009",
    "Engineering::BIOMEDICAL ENGINEERING::D009",
    "Engineering::CHEMICAL ENGINEERING::D009",
    "Engineering::CIVIL ENGINEERING::D009",
    "Engineering::COMPUTER ENGINEERING::D009",
    "Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING::D009",
    "Engineering::FOOD ENGINEERING::D009",
    "Engineering::FOOD SCIENCE AND TECHNOLOGY::D009",
    "Engineering::INDUSTRIAL AND PRODUCTION ENGINEERING::D009",
    "Engineering::MATERIALS AND METALLURGICAL ENGINEERING::D009",
    "Engineering::MATERIALS ENGINEERING::D009",
    "Engineering::MECHANICAL ENGINEERING::D009",
    "Engineering::MECHATRONICS ENGINEERING::D009",
    "Engineering::METALLURGICAL ENGINEERING::D009",
    "Engineering::MINERAL PROCESSING AND CHEMICAL-METALLURGICAL ENGINEERING::D009",
    "Engineering::MINING ENGINEERING::D009",
    "Engineering::SYSTEMS ENGINEERING::D009",
}


def main() -> None:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    moved_review_only = 0
    # Legacy weak-tier rows may satisfy the numeric count while still carrying
    # an explicit manual-review provenance. They are not safe student-facing
    # links until a source-backed semantic decision exists.
    for programme_key, record in mapping.items():
        active = list(record.get("links") or [])
        retained_active = []
        unverified = list(record.get("unverified_links") or [])
        for link in active:
            if link.get("evidence_status") != "manual_semantic_review":
                retained_active.append(link)
                continue
            moved = dict(link)
            moved["audit_ref"] = AUDIT_REF
            moved["semantic_review_status"] = "retained_unverified"
            moved["review_exclusion_reason"] = (
                "remains outside active guidance: the mapping is explicitly marked "
                "manual semantic review and has not been approved for student display."
            )
            if not any(item.get("domain_id") == moved.get("domain_id") for item in unverified):
                unverified.append(moved)
            moved_review_only += 1
        record["links"] = retained_active
        record["unverified_links"] = unverified
    review_rows = [
        row
        for row in audit.get("candidate_rows", [])
        if row.get("gate_status") == "passes_count_but_needs_semantic_review"
        and row.get("unverified_mapping")
    ]
    resolved = 0
    retained = 0
    for row in review_rows:
        key = f"{row.get('programme_key')}::{row.get('domain_id')}"
        record = mapping.get(row.get("programme_key"))
        if not record:
            raise SystemExit(f"Missing programme in authoritative mapping: {row.get('programme_key')}")
        unverified = list(record.get("unverified_links") or [])
        matches = [item for item in unverified if item.get("domain_id") == row.get("domain_id")]
        if len(matches) != 1:
            raise SystemExit(f"Expected one unverified link for {key}; found {len(matches)}")
        link = dict(matches[0])
        record["unverified_links"] = [item for item in unverified if item.get("domain_id") != row.get("domain_id")]
        if key in RESTORE:
            link["audit_ref"] = AUDIT_REF
            link["semantic_review_status"] = "approved_source_backed"
            link["semantic_review_basis"] = "CCMAS course or outcome contains an explicit target-domain concept; see regenerated evidence anchors."
            # This row is being returned to the active set. Do not leave the
            # gate-cleanup exclusion message on an active student-facing link.
            link.pop("review_exclusion_reason", None)
            record["links"] = [item for item in record.get("links", []) if item.get("domain_id") != row.get("domain_id")]
            record["links"].append(link)
            resolved += 1
        else:
            link["audit_ref"] = AUDIT_REF
            link["semantic_review_status"] = "retained_unverified"
            link["review_exclusion_reason"] = (
                "remains outside active guidance: the CCMAS evidence reached the count "
                "threshold but did not name a sufficiently specific concept for this domain."
            )
            record["unverified_links"].append(link)
            retained += 1
        record["links"] = sorted(record.get("links", []), key=lambda item: (str(item.get("domain_id") or ""), str(item.get("match_type") or "")))
        record["unverified_links"] = sorted(record.get("unverified_links", []), key=lambda item: (str(item.get("domain_id") or ""), str(item.get("match_type") or "")))

    # The source mapping may already contain rows restored by an earlier run.
    # Normalize those rows as well so reruns are idempotent and an active,
    # approved link cannot retain the old exclusion message.
    for record in mapping.values():
        for link in record.get("links", []):
            if link.get("semantic_review_status") == "approved_source_backed":
                link.pop("review_exclusion_reason", None)

    MAPPING_PATH.write_text(json.dumps(mapping, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Moved {moved_review_only} explicit manual-review links out of active guidance.")
    print(f"Restored {resolved} source-backed semantic mappings; retained {retained} unverified mappings.")


if __name__ == "__main__":
    main()
