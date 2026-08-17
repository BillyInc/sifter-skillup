"""Validate whether the source-backed career resource population may seed SQL.

This is intentionally a gate, not a seed generator. It turns open research
queues into explicit evidence so a clean mechanical population build cannot be
mistaken for complete Nigerian career guidance.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from _learning_resource_population_io import load_population

HERE = Path(__file__).resolve().parent


def load(name: str):
    return json.loads((HERE / name).read_text(encoding="utf-8"))


def main() -> None:
    source = load("domain_skill_competency_certification_audit.json")
    meta = load("domain_meta.json")
    body = load("nigerian_professional_body_audit.json")
    remaining = load("nigerian_remaining_body_web_evidence.json")
    population = load_population()
    gap_text = (HERE / "_audit" / "SOURCE_POPULATION_GAP_REPORT.md").read_text(encoding="utf-8")

    visible = source["scope"]["visible_domains"]
    hidden = set(source["scope"].get("hidden_domains_excluded", []))
    non_excluded_meta = len([domain_id for domain_id in meta if domain_id not in hidden])
    domain_count_matches = visible == non_excluded_meta
    body_ids = {
        item["body_id"]
        for row in body["domains"]
        for item in row.get("nigerian_bodies", [])
        if row.get("domain_id") not in hidden
    }
    body_catalog_ids = {item["body_id"] for item in body["body_catalog"]}
    source_audit_body_ids = {
        body_id
        for row in source["domains"]
        for body_id in (row.get("nigerian_web_evidence") or {}).get("body_ids", [])
        if row.get("domain_id") not in hidden
    }
    supplemental_pending_statuses = {
        "direct_page_review_pending",
        "official_domain_unavailable_unresolved",
        "suspicious_domain_unresolved",
    }
    supplemental_reviewed_ids = {
        item["body_id"]
        for item in remaining.get("records", [])
        if item.get("status") not in supplemental_pending_statuses
    }
    supplemental_exception_ids = {
        item["body_id"]
        for item in remaining.get("records", [])
        if item.get("status") in {
            "official_page_reachable_no_extractable_text",
            "official_page_maintenance",
            "official_domain_unavailable_secondary_evidence",
            "suspicious_domain_replaced",
        }
    }
    body_reviewed = len(supplemental_reviewed_ids)
    body_pending_supplemental = len(body_ids - supplemental_reviewed_ids)
    catalog_unassigned = len(body_catalog_ids - body_ids)
    gap_domains = int(re.search(r"Domains requiring review: \*\*(\d+)", gap_text).group(1))
    unsourced_roles = int(re.search(r"Roles without any source signal: \*\*(\d+)", gap_text).group(1))
    coverage = population["coverage"]
    queue_rows = [
        line.strip()
        for line in gap_text.splitlines()
        if line.strip().startswith("| P3 | D")
    ]
    structural_only_queue = not queue_rows or all(
        line.startswith("| P3 |") and line.endswith("| no subgroups |")
        for line in queue_rows
    )

    checks = {
        "domain_denominator_reconciled": domain_count_matches,
        "all_assigned_body_ids_are_catalogued": body_ids <= body_catalog_ids,
        "all_assigned_body_ids_have_source_audit_evidence": body_ids <= source_audit_body_ids,
        "all_assigned_body_ids_have_source_audit_or_supplemental_evidence": body_ids <= (source_audit_body_ids | supplemental_reviewed_ids),
        "supplemental_direct_page_review_complete": body_pending_supplemental == 0,
        "all_domain_review_rows_are_structural_only": structural_only_queue,
        "no_unsourced_roles": unsourced_roles == 0,
        "mechanical_resource_validation": coverage["validation_errors"] == 0,
        "all_visible_domains_have_role_resources": coverage["domains_by_resource_type"].get("role_reference") == visible,
        "all_visible_domains_have_learning_resources": coverage["domains_by_resource_type"].get("skill_learning") == visible,
        "all_visible_domains_have_competency_resources": coverage["domains_by_resource_type"].get("competency_reference") == visible,
        "all_visible_domains_have_certification_resources": coverage["domains_by_resource_type"].get("certification_exam") == visible,
    }
    blocking_checks = list(checks.values())
    allowed = all(blocking_checks)
    report = {
        "sql_regeneration_allowed": allowed,
        "checks": checks,
        "counts": {
            "visible_domains": visible,
            "domain_meta_non_excluded": non_excluded_meta,
            "assigned_body_ids": len(body_ids),
            "body_catalog_ids": len(body_catalog_ids),
            "body_web_records_reviewed": body_reviewed,
            "assigned_body_ids_with_source_audit_evidence": len(body_ids & source_audit_body_ids),
            "assigned_body_ids_pending_supplemental_review": body_pending_supplemental,
            "catalog_body_ids_unassigned_to_visible_domain": catalog_unassigned,
            "domains_requiring_review": gap_domains,
            "roles_without_source_signal": unsourced_roles,
            "resource_rows": coverage["resource_rows"],
            "resource_validation_errors": coverage["validation_errors"],
        },
        "blocked_reason": (
            "Keep SQL generation blocked until every failed source and denominator check is reconciled."
            if not allowed
            else "All source and mechanical checks passed. Review the generated population before seeding."
        ),
        "informational_open_items": {
            "assigned_body_ids_pending_supplemental_review": body_pending_supplemental,
            "assigned_body_ids_reviewed_with_source_exception": len(supplemental_exception_ids),
            "note": "All assigned IDs have a recorded review disposition. Exceptions remain visible so an unavailable, maintenance, secondary-only, or unsafe destination is not represented as a clean direct-page verification.",
        },
    }
    (HERE / "CAREER_RESOURCE_SEED_GATE.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    lines = [
        "# Career resource seed gate",
        "",
        f"SQL regeneration allowed: **{'YES' if allowed else 'NO'}**",
        "",
        "| Check | Result |",
        "|---|---|",
    ]
    for name, passed in checks.items():
        if name == "supplemental_direct_page_review_complete":
            result = "PASS" if passed else "INFORMATIONAL OPEN ITEM"
        else:
            result = "PASS" if passed else "BLOCKED"
        lines.append(f"| {name} | {result} |")
    lines.extend([
        "",
        "## Counts",
        "",
        f"- Visible domains: **{visible}**",
        f"- Non-excluded `domain_meta.json` rows: **{non_excluded_meta}**",
        f"- Assigned Nigerian body IDs: **{len(body_ids)}**",
        f"- Nigerian body web records reviewed: **{body_reviewed}**",
        f"- Assigned body IDs with original source evidence: **{len(body_ids & source_audit_body_ids)}**",
        f"- Assigned body IDs pending supplemental review: **{body_pending_supplemental}**",
        f"- Catalog body IDs unassigned to visible domains: **{catalog_unassigned}**",
        f"- Domains requiring source review: **{gap_domains}**",
        f"- Roles without a source signal: **{unsourced_roles}**",
        f"- Mechanical population rows: **{coverage['resource_rows']}**",
        f"- Mechanical validation errors: **{coverage['validation_errors']}**",
        "",
        report["blocked_reason"],
    ])
    (HERE / "CAREER_RESOURCE_SEED_GATE.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
