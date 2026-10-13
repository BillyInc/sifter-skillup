"""Consolidate the 168 specialization-review artifacts without changing taxonomy.

The repository contains individual, range-level and central review documents.
This produces one audit ledger so coverage, candidate labels, dispositions and
source references can be reconciled before any canonical subgroup write.
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
OUT_JSON = AUDIT / "specialization_review_evidence_register_2026_10_06.json"
OUT_MD = AUDIT / "SPECIALIZATION_REVIEW_EVIDENCE_REGISTER_2026-10-06.md"

DOMAIN_ID = re.compile(r"D\d{3}")
EXCLUDED_NAME_PARTS = {"inventory", "artifact_coverage", "specialization_coverage"}
STATUS_KEYS = {
    "review_status",
    "decision_status",
    "final_reconciliation_disposition",
    "route_disposition",
}
LABEL_KEYS = {"label", "name", "title"}
CANDIDATE_KEYS = {
    "candidate_specializations",
    "candidate_areas",
    "specializations",
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


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def walk_domain_records(value: Any, domain_ids: set[str]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    if isinstance(value, dict):
        if value.get("domain_id") in domain_ids:
            records.append(value)
        for child in value.values():
            records.extend(walk_domain_records(child, domain_ids))
    elif isinstance(value, list):
        for child in value:
            records.extend(walk_domain_records(child, domain_ids))
    return records


def walk_values(value: Any):
    yield value
    if isinstance(value, dict):
        for child in value.values():
            yield from walk_values(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_values(child)


def extract_record_facts(record: dict[str, Any]) -> tuple[set[str], set[str], set[str]]:
    statuses: set[str] = set()
    labels: set[str] = set()
    source_ids: set[str] = set()
    for value in walk_values(record):
        if not isinstance(value, dict):
            continue
        for key in STATUS_KEYS:
            item = value.get(key)
            if isinstance(item, str) and item.strip():
                statuses.add(item.strip())
        for key in CANDIDATE_KEYS:
            items = value.get(key)
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        for label_key in LABEL_KEYS:
                            label = item.get(label_key)
                            if isinstance(label, str) and label.strip():
                                labels.add(label.strip())
                    elif isinstance(item, str) and item.strip():
                        labels.add(item.strip())
        for key in SOURCE_KEYS:
            items = value.get(key)
            if isinstance(items, str) and items.strip():
                source_ids.add(items.strip())
            elif isinstance(items, list):
                for item in items:
                    if isinstance(item, str) and item.strip():
                        source_ids.add(item.strip())
                    elif isinstance(item, dict):
                        for source_key in ("source_id", "id", "url"):
                            source = item.get(source_key)
                            if isinstance(source, str) and source.strip():
                                source_ids.add(source.strip())
                    
    return statuses, labels, source_ids


def main() -> None:
    catalogue = load(DOMAIN_STRUCTURE)
    domain_ids = {key for key in catalogue if DOMAIN_ID.fullmatch(key)}
    files = [CENTRAL, *LANES.rglob("*.json")]
    rows = {
        domain_id: {
            "domain_id": domain_id,
            "artifact_paths": set(),
            "review_statuses": set(),
            "candidate_area_labels": set(),
            "source_reference_ids_or_urls": set(),
            "central_register_present": False,
        }
        for domain_id in domain_ids
    }
    malformed: list[str] = []

    for path in files:
        if any(part in path.name.lower() for part in EXCLUDED_NAME_PARTS):
            continue
        try:
            payload = load(path)
        except (OSError, json.JSONDecodeError):
            malformed.append(str(path.relative_to(ROOT)))
            continue
        relative = str(path.relative_to(ROOT))
        for record in walk_domain_records(payload, domain_ids):
            domain_id = record["domain_id"]
            statuses, labels, source_ids = extract_record_facts(record)
            rows[domain_id]["artifact_paths"].add(relative)
            rows[domain_id]["review_statuses"].update(statuses)
            rows[domain_id]["candidate_area_labels"].update(labels)
            rows[domain_id]["source_reference_ids_or_urls"].update(source_ids)
            if path.resolve() == CENTRAL.resolve():
                rows[domain_id]["central_register_present"] = True

    normalized = []
    for domain_id in sorted(rows, key=lambda value: int(value[1:])):
        row = rows[domain_id]
        normalized.append(
            {
                "domain_id": domain_id,
                "artifact_paths": sorted(row["artifact_paths"]),
                "review_statuses": sorted(row["review_statuses"]),
                "candidate_area_labels": sorted(row["candidate_area_labels"]),
                "source_reference_count": len(row["source_reference_ids_or_urls"]),
                "central_register_present": row["central_register_present"],
                "canonical_implementation": "not_assessed_by_this_consolidator",
            }
        )

    report = {
        "schema_version": "2026-10-06.specialization-review-evidence-register.v1",
        "purpose": "Consolidated review evidence ledger; not semantic sign-off, academic approval, or canonical application.",
        "catalogue_domain_count": len(domain_ids),
        "domains_with_review_artifacts": sum(bool(row["artifact_paths"]) for row in normalized),
        "domains_with_candidate_or_boundary_labels": sum(bool(row["candidate_area_labels"]) for row in normalized),
        "domains_with_source_references": sum(row["source_reference_count"] > 0 for row in normalized),
        "domains_in_central_register": sum(row["central_register_present"] for row in normalized),
        "domains_missing_any_review_artifact": [row["domain_id"] for row in normalized if not row["artifact_paths"]],
        "malformed_json_files": malformed,
        "domains": normalized,
        "canonical_taxonomy_changed": False,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# Specialization review evidence register — 2026-10-06",
        "",
        "This consolidates individual and range-level review artifacts. It proves evidence coverage only; it does not approve the recommendations or apply canonical taxonomy changes.",
        "",
        f"- Catalogue domains: **{report['catalogue_domain_count']}**",
        f"- Domains with review artifacts: **{report['domains_with_review_artifacts']}**",
        f"- Domains with candidate/boundary labels: **{report['domains_with_candidate_or_boundary_labels']}**",
        f"- Domains with source references: **{report['domains_with_source_references']}**",
        f"- Domains in the central consolidated register: **{report['domains_in_central_register']}**",
        f"- Malformed JSON files: **{len(report['malformed_json_files'])}**",
        "",
        "Canonical taxonomy changed: **No**.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "domains"}, indent=2))


if __name__ == "__main__":
    main()
