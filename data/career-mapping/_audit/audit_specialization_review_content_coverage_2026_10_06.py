"""Audit whether every catalogue domain has substantive specialization-review evidence.

This distinguishes review-artifact presence from the smaller consolidated register.
It requires a domain-specific record, a review/disposition field, and source or
evidence fields somewhere in the containing review document.  It does not prove
that a recommendation is correct, complete, approved, or canonical.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
LANES = AUDIT / "specialization_lanes_2026_10_05"
DOMAIN_STRUCTURE = ROOT / "data" / "career-mapping" / "domain_structure.json"
CENTRAL = AUDIT / "domain_specialization_review_2026_10_03.json"
OUT_JSON = AUDIT / "specialization_review_content_coverage_2026_10_06.json"
OUT_MD = AUDIT / "SPECIALIZATION_REVIEW_CONTENT_COVERAGE_2026-10-06.md"

DOMAIN_ID = re.compile(r"D\d{3}")
REVIEW_KEYS = {
    "candidate_specializations",
    "candidate_areas",
    "specialization",
    "recommendation",
    "final_reconciliation_disposition",
    "role_specialization_assignments",
    "specialization_count",
    "review_status",
    "decision",
    "parent_scope_disposition",
}
SOURCE_KEYS = {
    "sources",
    "source_register",
    "external_sources",
    "evidence_register",
    "source_ids",
    "source_refs",
    "evidence_reconciliation",
    "authoritative_global_source_evidence",
    "references",
}
EXCLUDED_NAME_PARTS = {"inventory", "artifact_coverage", "specialization_coverage"}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def flags(value: Any) -> tuple[bool, bool]:
    has_review = False
    has_source = False
    if isinstance(value, dict):
        keys = set(value)
        has_review = bool(keys & REVIEW_KEYS)
        has_source = bool(keys & SOURCE_KEYS)
        for child in value.values():
            child_review, child_source = flags(child)
            has_review |= child_review
            has_source |= child_source
    elif isinstance(value, list):
        for child in value:
            child_review, child_source = flags(child)
            has_review |= child_review
            has_source |= child_source
    return has_review, has_source


def domain_records(value: Any, domain_ids: set[str]) -> list[tuple[str, dict[str, Any]]]:
    records: list[tuple[str, dict[str, Any]]] = []
    if isinstance(value, dict):
        domain_id = value.get("domain_id")
        if isinstance(domain_id, str) and domain_id in domain_ids:
            records.append((domain_id, value))
        for child in value.values():
            records.extend(domain_records(child, domain_ids))
    elif isinstance(value, list):
        for child in value:
            records.extend(domain_records(child, domain_ids))
    return records


def build_report() -> dict[str, Any]:
    catalogue = load(DOMAIN_STRUCTURE)
    domain_ids = {key for key in catalogue if DOMAIN_ID.fullmatch(key)}
    paths = [CENTRAL, *LANES.rglob("*.json")]
    by_domain: dict[str, set[str]] = {}
    malformed: list[str] = []

    for path in paths:
        if any(part in path.name.lower() for part in EXCLUDED_NAME_PARTS):
            continue
        try:
            payload = load(path)
        except (OSError, json.JSONDecodeError):
            malformed.append(str(path.relative_to(ROOT)))
            continue

        document_review, document_source = flags(payload)
        for domain_id, record in domain_records(payload, domain_ids):
            record_review, record_source = flags(record)
            if (record_review or document_review) and (record_source or document_source):
                by_domain.setdefault(domain_id, set()).add(str(path.relative_to(ROOT)))

    covered = set(by_domain)
    return {
        "schema_version": "2026-10-06.specialization-review-content-coverage.v1",
        "purpose": "Content-based review evidence coverage; not semantic sign-off or canonical application.",
        "catalogue_domain_count": len(domain_ids),
        "domains_with_substantive_review_evidence": len(covered),
        "domains_without_substantive_review_evidence": len(domain_ids - covered),
        "missing_domain_ids": sorted(domain_ids - covered, key=lambda value: int(value[1:])),
        "malformed_json_files": malformed,
        "central_register_domain_count": len(load(CENTRAL).get("domain_reviews", [])),
        "artifact_paths_by_domain": {
            domain_id: sorted(paths) for domain_id, paths in sorted(by_domain.items())
        },
        "canonical_taxonomy_changed": False,
    }


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# Specialization review content coverage — 2026-10-06",
        "",
        "This checks for a domain-specific review record containing a specialization/disposition field and source/evidence fields. Presence is not proof that the recommendation is correct, complete, externally approved, or applied to canonical taxonomy.",
        "",
        f"- Catalogue domains: **{report['catalogue_domain_count']}**",
        f"- Domains with substantive review evidence: **{report['domains_with_substantive_review_evidence']}**",
        f"- Domains without substantive review evidence: **{report['domains_without_substantive_review_evidence']}**",
        f"- Consolidated central-register rows: **{report['central_register_domain_count']}**",
        f"- Malformed JSON files: **{len(report['malformed_json_files'])}**",
        "",
        "## Interpretation",
        "",
        "The substantive-evidence count includes both individual domain review files and range-level review documents. The central register is a separate consolidation layer and may contain fewer rows.",
        "",
        "## Missing domains",
        "",
        ", ".join(report["missing_domain_ids"]) if report["missing_domain_ids"] else "None.",
        "",
        "Canonical taxonomy changed: **No**.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "artifact_paths_by_domain"}, indent=2))


if __name__ == "__main__":
    main()
