"""Count specialization-review artifacts against the canonical domain catalogue.

This is an artifact-coverage check only. A document counts as evidence that a
domain has a review record, not as proof that the recommendation is correct,
complete, approved, or applied to canonical data.
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
CENTRAL_REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
OUT_JSON = AUDIT / "specialization_review_artifact_coverage_2026_10_06.json"
OUT_MD = AUDIT / "SPECIALIZATION_REVIEW_ARTIFACT_COVERAGE_2026-10-06.md"

DOMAIN_FILE = re.compile(r"^(D\d{3})_")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def domain_ids_from_payload(payload: Any) -> set[str]:
    ids: set[str] = set()
    if not isinstance(payload, dict):
        return ids
    if isinstance(payload.get("domain_id"), str):
        ids.add(payload["domain_id"])
    for row in payload.get("domains", []):
        if isinstance(row, dict) and isinstance(row.get("domain_id"), str):
            ids.add(row["domain_id"])
    for row in payload.get("domain_reviews", []):
        if isinstance(row, dict) and isinstance(row.get("domain_id"), str):
            ids.add(row["domain_id"])
    return ids


def collect_review_artifacts() -> tuple[dict[str, list[str]], list[str]]:
    coverage: dict[str, list[str]] = {}
    malformed: list[str] = []

    central = load_json(CENTRAL_REGISTER)
    for domain_id in domain_ids_from_payload(central):
        coverage.setdefault(domain_id, []).append(str(CENTRAL_REGISTER.relative_to(ROOT)))

    for path in sorted(LANES.rglob("*.json")):
        try:
            payload = load_json(path)
        except (OSError, json.JSONDecodeError):
            malformed.append(str(path.relative_to(ROOT)))
            continue

        ids = domain_ids_from_payload(payload)
        match = DOMAIN_FILE.match(path.name)
        if match:
            ids.add(match.group(1))
        for domain_id in ids:
            coverage.setdefault(domain_id, []).append(str(path.relative_to(ROOT)))

    return coverage, malformed


def build_report() -> dict[str, Any]:
    catalogue = load_json(DOMAIN_STRUCTURE)
    expected = set(catalogue)
    coverage, malformed = collect_review_artifacts()
    covered = expected & set(coverage)
    invalid_ids = sorted(set(coverage) - expected)
    missing = sorted(expected - covered)
    return {
        "schema_version": "2026-10-06.specialization-review-artifact-coverage.v1",
        "purpose": "Artifact presence only; not semantic sign-off or canonical application.",
        "catalogue_domain_count": len(expected),
        "domains_with_review_artifacts": len(covered),
        "domains_without_review_artifacts": len(missing),
        "missing_domain_ids": missing,
        "invalid_domain_ids_in_review_artifacts": invalid_ids,
        "malformed_review_json_files": malformed,
        "artifact_paths_by_domain": {
            domain_id: sorted(set(paths)) for domain_id, paths in sorted(coverage.items()) if domain_id in expected
        },
        "canonical_taxonomy_changed": False,
    }


def main() -> None:
    report = build_report()
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# Specialization review artifact coverage — 2026-10-06",
        "",
        "This deterministic scan counts review records against `domain_structure.json`. Artifact presence does not mean the recommendation is correct, complete, externally approved, or applied.",
        "",
        f"- Catalogue domains: **{report['catalogue_domain_count']}**",
        f"- Domains with at least one review artifact: **{report['domains_with_review_artifacts']}**",
        f"- Domains without a review artifact: **{report['domains_without_review_artifacts']}**",
        f"- Invalid IDs in review artifacts: **{len(report['invalid_domain_ids_in_review_artifacts'])}**",
        f"- Malformed JSON review files: **{len(report['malformed_review_json_files'])}**",
        "",
        "## Missing review artifacts",
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
