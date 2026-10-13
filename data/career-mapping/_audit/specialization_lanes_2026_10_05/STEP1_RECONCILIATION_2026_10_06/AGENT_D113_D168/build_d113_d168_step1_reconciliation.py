"""Create an append-only D113-D168 evidence reconciliation from checked-in reviews.

This is a local consolidation of existing evidence only. It does not search the
web, alter canonical taxonomy, modify source reviews, or assign roles to areas.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / "data/career-mapping").is_dir())
AUDIT = ROOT / "data/career-mapping/_audit"
LANE = AUDIT / "specialization_lanes_2026_10_05"
SOURCE_REGISTER = LANE / "D093_D168/open_provisional_specialization_reconciliation_2026_10_06.json"
CENTRAL_REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
GLOBAL_REGISTER = LANE / "GLOBAL_AREA_SUBGROUP_RECONCILIATION_2026_10_06/global_area_subgroup_reconciliation_register_2026_10_06.json"
STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
OUT_JSON = HERE / "d113_d168_step1_reconciliation_register_2026_10_06.json"
OUT_MD = HERE / "D113_D168_STEP1_RECONCILIATION_CHECKPOINT_2026_10_06.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm_label(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def areas_from_review(review: dict[str, Any]) -> list[dict[str, Any]]:
    raw = review.get("candidate_areas") or review.get("candidate_specializations") or []
    result: list[dict[str, Any]] = []
    for area in raw:
        if isinstance(area, str):
            result.append({"label": area, "scope": "", "route_boundary": ""})
        else:
            result.append(
                {
                    "label": area.get("label") or area.get("name") or "",
                    "scope": area.get("scope") or area.get("description") or "",
                    "route_boundary": area.get("route_boundary") or area.get("boundary") or "",
                }
            )
    return [area for area in result if area["label"]]


def source_rows(review: dict[str, Any], source_file: str) -> list[dict[str, Any]]:
    raw = review.get("sources") or review.get("evidence") or []
    rows = []
    for index, item in enumerate(raw, 1):
        rows.append(
            {
                "source_id": item.get("source_id"),
                "source_artifact_locator": f"{source_file}#sources[{index}]",
                "publisher": item.get("publisher"),
                "title": item.get("title"),
                "url": item.get("url"),
                "locator": item.get("locator"),
                "supports": item.get("supports"),
                "claim_limit": item.get("limitation") or item.get("limitations"),
                "geographic_scope": item.get("geographic_scope"),
            }
        )
    return rows


def register_map(path: Path, key: str) -> dict[str, dict[str, Any]]:
    data = load(path)
    return {row["domain_id"]: row for row in data.get(key, []) if row.get("domain_id")}


def label_values(row: dict[str, Any], key: str) -> list[str]:
    vals = row.get(key) or []
    return [v if isinstance(v, str) else (v.get("label") or v.get("name") or "") for v in vals]


def make_record(
    source_record: dict[str, Any],
    structure: dict[str, Any],
    central: dict[str, dict[str, Any]],
    global_cases: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    domain_id = source_record["domain_id"]
    review_rel = source_record["source_review_file"]
    review = load(ROOT / review_rel)
    areas = areas_from_review(review)
    current = structure.get(domain_id, {})
    current_groups = current.get("subgroups") or []
    current_rows = [
        {
            "isco_submajor": group.get("isco_submajor"),
            "current_label": group.get("label"),
            "data_state": group.get("data_state"),
            "student_visibility_reason": group.get("student_visibility_reason"),
        }
        for group in current_groups
    ]
    current_visible = [g for g in current_rows if g.get("data_state") not in {"excluded", "review_only", "inactive"}]

    comparisons = []
    conflicts = []
    for name, row, key in (
        ("central_2026_10_03", central.get(domain_id), "specializations"),
        ("global_area_subgroup_2026_10_06", global_cases.get(domain_id), "candidate_areas"),
    ):
        if row is None:
            continue
        other_labels = label_values(row, key)
        primary_labels = [a["label"] for a in areas]
        same = {norm_label(x) for x in other_labels} == {norm_label(x) for x in primary_labels}
        comparison = {
            "register": name,
            "register_disposition": row.get("decision") or row.get("disposition"),
            "register_labels": other_labels,
            "matches_primary_candidate_set": same,
            "only_label_wording_difference": ({norm_label(x) for x in other_labels} == {norm_label(x) for x in primary_labels}) and (set(other_labels) != set(primary_labels)),
        }
        comparisons.append(comparison)
        if not same:
            conflicts.append(
                {
                    "register": name,
                    "existing_labels": other_labels,
                    "current_review_labels": primary_labels,
                    "status": "material_set_difference_unresolved",
                    "resolution": "Do not silently prefer either set. Keep both evidence-backed proposals visible; disposition remains unresolved pending explicit source adjudication.",
                }
            )

    sources = source_rows(review, review_rel)
    source_complete = bool(sources) and all(
        row.get("url") and row.get("locator") and row.get("supports") and row.get("claim_limit")
        for row in sources
    )
    fit_disposition = source_record.get("domain_fit_disposition", "")
    parent_open = "conditional" in fit_disposition or bool(source_record.get("remaining_open_issue")) and "resolve" in str(source_record.get("remaining_open_issue", "")).casefold()
    if not areas:
        disposition = "direct_domain_role_with_no_specialization"
    elif conflicts or parent_open:
        disposition = "evidence_or_parent_scope_decision_unresolved"
    elif not current_visible:
        disposition = "rename_merge_split_add_or_remove_specialization_areas"
    else:
        recommended = {norm_label(a["label"]) for a in areas}
        visible = {norm_label(str(g.get("label", ""))) for g in current_visible}
        disposition = (
            "retain_current_subgroup_structure"
            if recommended == visible
            else "rename_merge_split_add_or_remove_specialization_areas"
        )

    explicit = review.get("decision") or review.get("explicit_disposition") or source_record.get("explicit_disposition")
    omissions = review.get("omissions_and_over_splitting") or review.get("boundary_and_exclusion_rules") or source_record.get("remaining_open_issue")
    confidence = review.get("confidence") or source_record.get("confidence")
    return {
        "domain_id": domain_id,
        "domain_name": source_record.get("domain_name"),
        "disposition": disposition,
        "recommended_final_student_facing_areas": areas,
        "recommendation_status": source_record.get("review_status"),
        "decision_basis": explicit,
        "why_area_count_or_no_area_is_defensible": review.get("decision") or source_record.get("explicit_disposition"),
        "rejected_over_splits_and_omissions": omissions,
        "exact_current_subgroup_comparison": {
            "record_count": len(current_rows),
            "records": current_rows,
            "visible_records": current_visible,
            "candidate_set_matches_current_visible_set": bool(areas) and {norm_label(a["label"]) for a in areas} == {norm_label(str(g.get("label", ""))) for g in current_visible},
            "comparison_basis": "Read-only structural comparison. ISCO membership and role links are explicitly excluded as evidence that an area or role fits.",
        },
        "role_isco_fit_evidence_used": False,
        "source_review_artifact": review_rel,
        "supporting_sources": sources,
        "source_evidence_coverage": {
            "status": "complete_fields_in_captured_review" if source_complete else "incomplete_or_missing_source_fields",
            "source_record_count": len(sources),
            "all_sources_have_url_locator_claim_support_and_limit": source_complete,
            "note": "A captured citation is not independent verification of the linked source. Source IDs are null where the original review did not supply one; artifact locators identify the actual captured citation row without inventing source IDs.",
        },
        "existing_recommendation_reconciliation": {
            "comparisons": comparisons,
            "conflicts": conflicts,
            "status": "conflict_unresolved" if conflicts else ("consistent_with_overlapping_registers" if comparisons else "no_overlapping_consolidated_recommendation_found"),
        },
        "confidence": confidence if confidence is not None else "not_explicitly_scored_in_source_review",
        "remaining_blocker": source_record.get("remaining_open_issue") or review.get("remaining_review") or "No explicit blocker recorded in captured source review.",
        "parent_scope_disposition": source_record.get("domain_fit_disposition"),
        "parent_scope_basis": source_record.get("domain_fit_basis"),
        "source_claim_limit": source_record.get("source_limit"),
        "canonical_taxonomy_changed": False,
        "role_to_specialization_assigned": False,
        "nigerian_context_started": False,
    }


def render_markdown(data: dict[str, Any]) -> str:
    counts = data["counts"]
    lines = [
        "# STEP 1 Global Specialization/Subgroup Reconciliation — D113–D168",
        "",
        "Append-only lane register built from existing checked-in review artifacts. This is global-only: no Nigerian context, role-to-specialization assignment, external refresh, or canonical change.",
        "",
        f"- Explicit dispositions: **{counts['explicit_dispositions']}/56**",
        f"- Source/evidence coverage rows: **{counts['source_coverage_rows']}/56**; complete captured citation fields: **{counts['complete_captured_citation_rows']}**",
        f"- Recommendation conflicts with overlapping registers: **{counts['domains_with_material_conflicts']}**",
        f"- Current subgroup structure checked against `domain_structure.json`: **{counts['current_structure_comparisons']}/56**",
        f"- Domains dispositioned direct domain→role/no-specialization: **{counts['direct_domain_role_no_area']}**",
        f"- Canonical taxonomy edits: **{counts['canonical_changes']}**; role→specialization assignments: **{counts['role_specialization_assignments']}**",
        "",
        "## Disposition counts",
        "",
    ]
    for key, count in data["counts"]["by_disposition"].items():
        lines.append(f"- `{key}`: {count}")
    lines.extend(["", "## Domain-by-domain register", ""])
    for row in data["records"]:
        lines.extend([
            f"### {row['domain_id']} — {row['domain_name']}",
            "",
            f"- Disposition: `{row['disposition']}`",
            f"- Current subgroups ({row['exact_current_subgroup_comparison']['record_count']}): "
            + ("; ".join(f"{g.get('isco_submajor')}: {g.get('current_label')} [{g.get('data_state')}]" for g in row['exact_current_subgroup_comparison']['records']) or "none recorded"),
            "- Recommendation: " + ("; ".join(f"**{a['label']}** — {a.get('scope','')} Boundary: {a.get('route_boundary','')}" for a in row['recommended_final_student_facing_areas']) or "No global specialization set recommended; retain direct domain→role pending the stated scope/authority decision."),
            f"- Why/count and rejected splits: {row.get('why_area_count_or_no_area_is_defensible') or 'Not stated in captured review.'} {row.get('rejected_over_splits_and_omissions') or ''}",
            f"- Fit safeguard: role/ISCO membership used as fit evidence = **{row['role_isco_fit_evidence_used']}**.",
            f"- Source coverage: `{row['source_evidence_coverage']['status']}` ({row['source_evidence_coverage']['source_record_count']} citation rows). Confidence: `{row['confidence']}`.",
            f"- Remaining blocker: {row['remaining_blocker']}",
            f"- Existing recommendation reconciliation: `{row['existing_recommendation_reconciliation']['status']}`.",
        ])
        for conflict in row["existing_recommendation_reconciliation"]["conflicts"]:
            lines.append(f"  - Conflict ({conflict['register']}): existing {conflict['existing_labels']} vs current review {conflict['current_review_labels']}. {conflict['resolution']}")
        for source in row["supporting_sources"]:
            lines.append(f"  - Evidence: {source.get('publisher')} — [{source.get('title')}]({source.get('url')}); locator: {source.get('locator')}; supports: {source.get('supports')}; claim limit: {source.get('claim_limit')}; captured at `{source.get('source_artifact_locator')}`.")
        lines.append("")
    lines.extend([
        "## Reconciliation limits",
        "",
        "This lane reuses existing domain-specific evidence and makes conflicts explicit. It does not independently reopen each external source URL. Captured source locators and claim limits are retained; any absent source ID stays null and is not fabricated. Material recommendation conflicts and parent-scope cases remain explicitly unresolved rather than being silently collapsed.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    if OUT_JSON.exists() or OUT_MD.exists():
        raise SystemExit("Append-only outputs already exist; refusing to overwrite them.")
    source_data = load(SOURCE_REGISTER)
    source_records = {r["domain_id"]: r for r in source_data["records"]}
    central = register_map(CENTRAL_REGISTER, "domain_reviews")
    global_cases = register_map(GLOBAL_REGISTER, "domain_cases")
    structure = load(STRUCTURE)
    expected_ids = [f"D{i:03d}" for i in range(113, 169)]
    if set(expected_ids) - set(source_records):
        raise SystemExit(f"Missing source reconciliation rows: {sorted(set(expected_ids)-set(source_records))}")
    records = [make_record(source_records[domain_id], structure, central, global_cases) for domain_id in expected_ids]
    dispositions: dict[str, int] = {}
    for row in records:
        dispositions[row["disposition"]] = dispositions.get(row["disposition"], 0) + 1
    counts = {
        "expected_domains": 56,
        "explicit_dispositions": sum(bool(r["disposition"]) for r in records),
        "source_coverage_rows": sum(bool(r["source_evidence_coverage"]) for r in records),
        "complete_captured_citation_rows": sum(r["source_evidence_coverage"]["all_sources_have_url_locator_claim_support_and_limit"] for r in records),
        "domains_with_material_conflicts": sum(bool(r["existing_recommendation_reconciliation"]["conflicts"]) for r in records),
        "current_structure_comparisons": sum(bool(r["exact_current_subgroup_comparison"]) for r in records),
        "direct_domain_role_no_area": dispositions.get("direct_domain_role_with_no_specialization", 0),
        "canonical_changes": 0,
        "role_specialization_assignments": 0,
        "by_disposition": dispositions,
    }
    data = {
        "schema_version": "2026-10-06.step1-specialization-reconciliation.v1",
        "scope": {"first_domain_id": "D113", "last_domain_id": "D168", "domain_count": 56, "phase": "global specialization/subgroup reconciliation only"},
        "append_only": True,
        "source_artifacts": [str(p.relative_to(ROOT)).replace("\\", "/") for p in [SOURCE_REGISTER, CENTRAL_REGISTER, GLOBAL_REGISTER, STRUCTURE]],
        "method_limits": [
            "Use existing captured evidence as the starting point; do not repeat research already represented in source reviews.",
            "Read current subgroup records only to report exact structural comparison; ISCO/role membership is not evidence of fit.",
            "Do not erase conflicts. A materially different candidate set remains unresolved unless captured evidence explicitly adjudicates it.",
            "Do not edit canonical taxonomy or assign roles to areas of specialization.",
            "No Nigerian context in this step.",
        ],
        "counts": counts,
        "records": records,
    }
    if counts["explicit_dispositions"] != 56 or counts["source_coverage_rows"] != 56 or counts["current_structure_comparisons"] != 56:
        raise SystemExit("Coverage gate failed; refusing to create checkpoint.")
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_MD.write_text(render_markdown(data), encoding="utf-8")
    print(json.dumps(counts, ensure_ascii=False, indent=2))
    print(OUT_JSON)
    print(OUT_MD)


if __name__ == "__main__":
    main()
