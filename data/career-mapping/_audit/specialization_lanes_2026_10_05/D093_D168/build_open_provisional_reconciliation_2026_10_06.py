#!/usr/bin/env python3
"""Build the global-only D098-D168 specialization residual checkpoint.

This consumes existing lane review artifacts and read-only catalogue inventories.
It does not edit canonical taxonomy, role libraries, shared registers, subgroup
scripts, role links, or any Nigerian-context artifact.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / "data/career-mapping").is_dir())
LANE = ROOT / "data/career-mapping/_audit/specialization_lanes_2026_10_05"
SOURCE_DIRS = [
    LANE / "D093_D168",
    LANE / "D057_D168",
]
OUT_JSON = HERE / "open_provisional_specialization_reconciliation_2026_10_06.json"
OUT_MD = HERE / "OPEN_PROVISIONAL_SPECIALIZATION_RECONCILIATION_2026_10_06.md"
CHECKPOINT_JSON = HERE / "D098_D168_reconciliation_checkpoint_011.json"
CHECKPOINT_MD = HERE / "D098_D168_reconciliation_checkpoint_011.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def domain_number(domain_id: str) -> int:
    return int(domain_id[1:])


def review_files() -> dict[str, Path]:
    found: dict[str, Path] = {}
    # D093_D168 is the authoritative location for D098; D057_D168 owns D099-D168.
    for directory in SOURCE_DIRS:
        for path in directory.glob("D???_specialization_*.json"):
            data = load(path)
            domain_id = data.get("domain_id")
            if not domain_id or not 98 <= domain_number(domain_id) <= 168:
                continue
            if domain_id == "D098" or domain_id not in found:
                found[domain_id] = path
    return found


def candidate_areas(data: dict[str, Any]) -> list[dict[str, Any]]:
    areas = data.get("candidate_areas") or data.get("candidate_specializations") or []
    normalized = []
    for area in areas:
        if isinstance(area, str):
            normalized.append({"label": area})
        else:
            normalized.append(dict(area))
    return normalized


def source_rows(data: dict[str, Any]) -> list[dict[str, Any]]:
    rows = data.get("sources") or data.get("evidence") or []
    result = []
    for row in rows:
        row = dict(row)
        result.append(
            {
                "source_id": row.get("source_id"),
                "publisher": row.get("publisher"),
                "title": row.get("title"),
                "url": row.get("url"),
                "locator": row.get("locator"),
                "supports": row.get("supports"),
                "limitation": row.get("limitation") or row.get("limitations"),
                "geographic_scope": row.get("geographic_scope", "global/international or comparative source"),
            }
        )
    return result


def parent_scope(data: dict[str, Any]) -> str:
    return data.get("parent_scope_disposition") or data.get("parent_scope_basis") or ""


def residual(data: dict[str, Any]) -> str:
    return (
        data.get("remaining_review")
        or data.get("omissions_and_over_splitting")
        or data.get("no_specialization_disposition")
        or "No separate residual field was supplied; count remains an internal candidate synthesis pending catalogue reconciliation."
    )


RESIDUAL_OVERRIDES = {
    "D098": "Resolve whether Dimensional Metrology and Measurement Systems remains a standalone student card or is taught as a shared technical route across precision machining, tooling and instruments; the four-area recommendation remains provisional.",
}


def computational_summary(domain_id: str, computational: dict[str, Any]) -> dict[str, Any]:
    row = next((item for item in computational.get("domains", []) if item.get("domain_id") == domain_id), None)
    if row is None:
        return {
            "status": "not_in_method_signal_queue",
            "classification": None,
            "case_disposition": "The current deterministic scan did not place this domain in the method-signal queue. This is not evidence that computation is absent.",
            "role_task_record_match_count": 0,
            "role_fit_inferred": False,
            "promotion_rule": "Do not create a specialization or role link from absence of a lexical signal.",
        }
    return {
        "status": "method_or_role_task_signal_requires_contextual_review",
        "classification": row.get("classification"),
        "case_disposition": row.get("case_disposition"),
        "role_task_record_match_count": row.get("role_task_record_match_count", 0),
        "role_fit_inferred": bool(row.get("role_fit_inferred", False)),
        "promotion_rule": "Method or role-task signals remain contextual; they do not prove parent fit, a specialization, or a student requirement.",
    }


def fit_disposition(data: dict[str, Any], areas: list[dict[str, Any]]) -> tuple[str, str]:
    text = " ".join(
        str(value or "")
        for value in (parent_scope(data), data.get("decision"), data.get("review_status"))
    ).lower()
    if not areas and data.get("no_specialization_disposition"):
        return (
            "direct_domain_to_role_until_scope_or_authority_is_named",
            "No globally defensible child set is established for the present parent; keep direct domain-to-role routing with the stated limits.",
        )
    if any(token in text for token in ("split", "inconsistent", "ambiguous", "scope open", "boundary open", "mixed parent", "root boundary")):
        return (
            "conditional_parent_scope_boundary",
            "Candidate areas are usable only after the stated parent boundary is resolved; do not treat current role links as proof of fit.",
        )
    return (
        "fit_supported_for_provisional_candidate_routes",
        "The sources support recognizable practice or learning routes within the stated parent, while the exact count remains an internal synthesis.",
    )


def main() -> None:
    files = review_files()
    computational = load(ROOT / "data/career-mapping/_audit/computational_method_signal_domain_dispositions_2026_10_05.json")
    structure = load(ROOT / "data/career-mapping/domain_structure.json")
    rows = []
    for number in range(98, 169):
        domain_id = f"D{number:03d}"
        path = files.get(domain_id)
        if path is None:
            raise ValueError(f"Missing unresolved review artifact for {domain_id}")
        data = load(path)
        areas = candidate_areas(data)
        labels = [area.get("label") for area in areas]
        sources = source_rows(data)
        fit, route_note = fit_disposition(data, areas)
        canonical = structure.get(domain_id, {})
        canonical_subgroups = canonical.get("subgroups") or []
        row = {
            "domain_id": domain_id,
            "domain_name": data.get("domain_name"),
            "source_review_file": path.relative_to(ROOT).as_posix(),
            "review_status": data.get("review_status"),
            "current_subgroup_record_count_read_only": data.get("current_subgroup_count", len(canonical_subgroups)),
            "current_subgroup_labels_read_only": data.get("current_subgroups", [item.get("name", item.get("label", "")) for item in canonical_subgroups]),
            "domain_fit_disposition": fit,
            "domain_fit_basis": parent_scope(data),
            "recommended_student_area_count": len(areas),
            "student_facing_labels_candidate_only": labels,
            "student_route_disposition": "direct_domain_to_role" if not areas else "candidate_areas_after_parent_fit",
            "student_route_note": route_note,
            "explicit_disposition": data.get("decision"),
            "boundary_and_exclusion_rules": data.get("boundary_and_exclusion_rules", []),
            "remaining_open_issue": RESIDUAL_OVERRIDES.get(domain_id, residual(data)),
            "sources": sources,
            "source_record_count": len(sources),
            "source_limit": data.get("evidence_limit") or "Sources support practice boundaries, not a universal specialization count or catalogue sign-off.",
            "computational_coverage": computational_summary(domain_id, computational),
            "canonical_taxonomy_changed": False,
            "role_to_specialization_assigned": False,
            "nigerian_context_started": False,
        }
        rows.append(row)

    zero_current = [row["domain_id"] for row in rows if row["current_subgroup_record_count_read_only"] == 0]
    zero_candidate = [row["domain_id"] for row in rows if row["recommended_student_area_count"] == 0]
    conditional = [row["domain_id"] for row in rows if row["domain_fit_disposition"] == "conditional_parent_scope_boundary"]
    source_urls = sorted({source["url"] for row in rows for source in row["sources"] if source.get("url")})
    computational_signals = [
        row["domain_id"]
        for row in rows
        if row["computational_coverage"]["status"] != "not_in_method_signal_queue"
    ]
    payload = {
        "schema_version": "2026-10-06.open-provisional-specialization-reconciliation.v1",
        "scope": "Global-only specialization reconciliation for unresolved D098-D168 records; no Nigerian research, canonical taxonomy writes, shared-register writes, subgroup-script edits, role-link edits, or role-to-specialization assignments.",
        "closed_ids_not_repeated": [f"D{number:03d}" for number in range(85, 98)],
        "closed_reuse_basis": "D085-D097 were already source-reconciled in the prior D001-D112 global lane; this checkpoint consumes that closure and does not recreate those reviews.",
        "open_or_provisional_ids": [row["domain_id"] for row in rows],
        "counts": {
            "unresolved_domains": len(rows),
            "candidate_area_labels": sum(row["recommended_student_area_count"] for row in rows),
            "zero_candidate_area_direct_domain_to_role": len(zero_candidate),
            "zero_current_subgroup_domains_in_scope": len(zero_current),
            "conditional_parent_scope_domains": len(conditional),
            "source_records": sum(row["source_record_count"] for row in rows),
            "unique_source_urls": len(source_urls),
            "computational_method_signal_domains": len(computational_signals),
            "canonical_taxonomy_changes": 0,
            "role_to_specialization_assignments": 0,
            "nigerian_context_reviews": 0,
        },
        "zero_candidate_area_ids": zero_candidate,
        "zero_current_subgroup_ids": zero_current,
        "conditional_parent_scope_ids": conditional,
        "computational_signal_ids": computational_signals,
        "source_urls": source_urls,
        "records": rows,
        "global_evidence_limits": [
            "Professional bodies, standards, international frameworks and comparative curricula establish recognizable practices and boundaries; they do not prescribe a universal count for this catalogue.",
            "A candidate label is a student-facing wording proposal only until independent curriculum and role-task reconciliation accepts it.",
            "Current subgroup counts and role links are diagnostic read-only context; ISCO membership and role volume do not establish domain fit or area count.",
            "Computational methods and role-task signals remain contextual. No signal establishes a computational area, universal requirement, parent fit, or role assignment.",
            "Licensing, protected titles, legal authority and professional scope remain jurisdiction-specific and are not represented as global requirements.",
        ],
        "tests": [
            "python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_open_provisional_reconciliation_2026_10_06.py",
            "python -m json.tool data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/open_provisional_specialization_reconciliation_2026_10_06.json",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D098-D168 open/provisional specialization reconciliation",
        "",
        "Date: 2026-10-06. Global sources only; no Nigerian research or canonical writes.",
        "",
        "D085-D097 are closed in the prior global lane and were not repeated. D098 retains its open metrology boundary; D099-D168 are carried forward only because their candidate count, parent boundary, labels, or direct-domain disposition remains provisional.",
        "",
        "## Counts",
        "",
        f"- Unresolved domains: **{len(rows)}**",
        f"- Candidate student-facing labels: **{payload['counts']['candidate_area_labels']}**",
        f"- Zero-area direct-domain routes: **{len(zero_candidate)}** ({', '.join(zero_candidate) or 'none'})",
        f"- Zero-current-subgroup domains in the read-only catalogue inventory: **{len(zero_current)}** ({', '.join(zero_current) or 'none'})",
        f"- Parent-boundary conditional domains: **{len(conditional)}**",
        f"- Source records / unique URLs: **{payload['counts']['source_records']} / {len(source_urls)}**",
        f"- Computational method-signal domains: **{len(computational_signals)}**; signals remain contextual.",
        "",
        "## Reconciliation table",
        "",
        "| ID | Domain | Fit disposition | Candidate count | Student-facing labels (candidate only) | Route | Residual |",
        "|---|---|---|---:|---|---|---|",
    ]
    for row in rows:
        labels = "; ".join(row["student_facing_labels_candidate_only"]) or "(none)"
        residual_text = row["remaining_open_issue"].replace("|", "/").replace("\n", " ")
        lines.append(
            f"| {row['domain_id']} | {row['domain_name']} | {row['domain_fit_disposition']} | {row['recommended_student_area_count']} | {labels} | {row['student_route_disposition']} | {residual_text} |"
        )
    lines.extend([
        "",
        "## Source and computational record",
        "",
        "Each JSON record retains every inherited source URL, locator, support claim, geographic scope and limitation from the current lane artifact. The computational field records whether the domain is in the current method-signal queue and prevents lexical or role-task signals from becoming a specialization or role link.",
        "",
        "### Source locators by domain",
        "",
    ])
    for row in rows:
        lines.append(f"#### {row['domain_id']} — {row['domain_name']}")
        if not row["sources"]:
            lines.append("- No source record was carried by the inherited review artifact; the candidate set remains open and cannot be treated as globally evidenced.")
        for source in row["sources"]:
            publisher = source.get("publisher") or "Unspecified publisher"
            title = source.get("title") or "Unspecified title"
            url = source.get("url") or "URL missing in inherited artifact"
            locator = (source.get("locator") or "Locator missing in inherited artifact").replace("|", "/").replace("\n", " ")
            limitation = (source.get("limitation") or "Limitation missing in inherited artifact").replace("|", "/").replace("\n", " ")
            lines.append(f"- **{publisher} — {title}** — {url} — locator: {locator} — limit: {limitation}")
        lines.append("")
    lines.extend([
        "## Limits and non-decisions",
        "",
        *[f"- {limit}" for limit in payload["global_evidence_limits"]],
        "",
        "No canonical taxonomy, role library, shared register, subgroup script, role link, or Nigerian-context artifact was edited.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    checkpoint = {
        "schema_version": "2026-10-06.specialization-reconciliation-checkpoint.v1",
        "lane": "D098-D168",
        "checkpoint": 11,
        "complete": True,
        "completed_ids": [row["domain_id"] for row in rows],
        "remaining_ids": [],
        "closed_ids_not_repeated": payload["closed_ids_not_repeated"],
        "aggregate_counts": payload["counts"],
        "artifact_json": OUT_JSON.relative_to(ROOT).as_posix(),
        "artifact_markdown": OUT_MD.relative_to(ROOT).as_posix(),
        "canonical_taxonomy_files_touched": False,
        "roles_mapped_to_specializations": False,
        "nigerian_context_started": False,
        "next_action": "No unresolved D098-D168 artifact remains in this reconciliation lane; proceed only to the separately scoped role-domain audit and later local/canonical approval workflow.",
    }
    CHECKPOINT_JSON.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# D098-D168 specialization reconciliation checkpoint 011\n\n"
        "Global-only residual reconciliation is complete for the open/provisional set. D085-D097 were closed in the prior lane and not repeated.\n\n"
        f"- Completed: **{len(rows)}/71** IDs\n"
        f"- Candidate labels: **{payload['counts']['candidate_area_labels']}**\n"
        f"- Direct domain-to-role zero-area dispositions: **{len(zero_candidate)}**\n"
        f"- Current zero-subgroup domains: **{len(zero_current)}**\n"
        f"- Parent-boundary conditional domains: **{len(conditional)}**\n"
        f"- Computational method-signal domains: **{len(computational_signals)}**\n"
        "- Canonical taxonomy changes: **0**\n"
        "- Role-to-specialization assignments: **0**\n"
        "- Nigerian-context research: **0**\n\n"
        "The exact labels, source URLs/locators, limits, dispositions, counts and residuals are in the JSON/Markdown artifact. Candidate labels remain noncanonical.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
