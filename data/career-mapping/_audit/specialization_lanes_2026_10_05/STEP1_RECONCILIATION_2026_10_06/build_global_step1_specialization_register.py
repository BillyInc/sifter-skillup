"""Integrate the current Step 1 specialization reconciliation evidence.

Audit-only: validates coverage and reports decisions, source-capture gaps,
and explicit phase boundaries. It does not mutate canonical taxonomy or roles.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = next(parent for parent in HERE.parents if (parent / "data/career-mapping").is_dir())
OUT_JSON = HERE / "global_step1_specialization_reconciliation_2026_10_06.json"
OUT_MD = HERE / "GLOBAL_STEP1_SPECIALIZATION_RECONCILIATION_2026_10_06.md"

INPUTS = {
    "D001-D056": HERE / "LOCAL_D001_D056/d001_d056_step1_reconciliation_register_2026_10_06.json",
    "D001-D028-agent-reconciliation": HERE / "AGENT_LOCAL_D001_D028/STEP1_D001_D028_RECONCILIATION_2026_10_06/d001_d028_adjudication_register_2026_10_06.json",
    "D029-D056-agent-reconciliation": HERE / "AGENT_LOCAL_D029_D056/d029_d056_specialization_adjudication_2026_10_06.json",
    "D068-parent-scope-resolution": HERE / "D068_PARENT_SCOPE_RESOLUTION_2026_10_06/d068_step1_parent_scope_adjudication_2026_10_06.json",
    "D057-D112": HERE / "AGENT_D057_D112/step1_d057_d112_reconciliation_register_2026_10_06_012.json",
    "D113-D168": HERE / "AGENT_D113_D168/d113_d168_step1_reconciliation_register_2026_10_06_v005.json",
}
COMPUTATIONAL = ROOT / "data/career-mapping/_audit/computational_residual_resolution_2026_10_06.json"
SOURCE_CAPTURE_ADDENDUM = HERE / "supplemental_source_capture_2026_10_06.json"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def local_rows(path: Path) -> list[dict[str, Any]]:
    payload = read(path)
    result = []
    for row in payload["domains"]:
        proposals = row.get("proposal_variants", [])
        areas = proposals[-1].get("candidate_areas", []) if proposals else []
        result.append({
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "lane": "D001-D056",
            "step1_status": "recommendation_reconciled" if row.get("specialization_structure_reconciled") else "candidate_set_needs_final_reconciliation",
            "disposition": row.get("disposition"),
            "recommended_area_count": len(areas),
            "recommended_areas": areas,
            "current_subgroup_comparison": row.get("current_subgroup_comparison"),
            "source_capture_complete": row.get("source_capture_quality", {}).get("has_url_locator_and_support_or_limit_for_each_row", False),
            "source_capture_quality": row.get("source_capture_quality"),
            "open_items": row.get("open_reconciliation_items", []),
            "evidence_artifact": str(path.relative_to(ROOT)),
            "canonical_taxonomy_changed": row.get("canonical_taxonomy_changed", False),
            "role_to_specialization_assigned": row.get("role_to_specialization_assignments_made", False),
            "nigerian_context_applied": row.get("nigerian_context_applied", False),
        })
    return result


def agent_local_rows(path: Path) -> list[dict[str, Any]]:
    """Use the scoped adjudication to supersede preliminary D029-D056 rows."""
    payload = read(path)
    result = []
    for row in payload["records"]:
        sources = row.get("sources", [])
        source_complete = bool(sources) and all(
            source.get("url")
            and source.get("locator")
            and source.get("supports")
            and source.get("limits")
            for source in sources
        )
        hold = row.get("parent_or_evidence_hold")
        result.append({
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "lane": "D029-D056 (agent reconciliation)",
            "step1_status": "recommendation_reconciled" if row.get("decision_status") == "resolved_recommendation" and not hold else "parent_scope_unresolved",
            "disposition": row.get("decision_status"),
            "recommended_area_count": row.get("final_area_count", 0),
            "recommended_areas": row.get("final_student_facing_areas", []),
            "current_subgroup_comparison": row.get("exact_current_subgroup_comparison"),
            "source_capture_complete": source_complete,
            "source_capture_quality": {"source_count": len(sources), "all_sources_have_url_locator_support_and_limit": source_complete},
            "open_items": [hold] if hold else [],
            "evidence_artifact": str(path.relative_to(ROOT)),
            "canonical_taxonomy_changed": bool(row.get("canonical_taxonomy_edited")),
            "role_to_specialization_assigned": bool(row.get("role_mappings_changed_or_assigned")),
            "nigerian_context_applied": bool(row.get("nigerian_context_added")),
        })
    return result


def agent_d001_d028_rows(path: Path) -> list[dict[str, Any]]:
    payload = read(path)
    result = []
    for row in payload["records"]:
        sources = row.get("sources", [])
        source_complete = bool(sources) and all(
            source.get("url") and source.get("locator") and source.get("supports") and source.get("limits")
            for source in sources
        )
        hold = bool(row.get("genuine_hold"))
        result.append({
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "lane": "D001-D028 (agent reconciliation)",
            "step1_status": "recommendation_reconciled" if row.get("disposition", "").startswith("resolved") and not hold and source_complete else "parent_scope_unresolved",
            "disposition": row.get("disposition"),
            "recommended_area_count": row.get("candidate_area_count", 0),
            "recommended_areas": row.get("recommended_areas", []),
            "current_subgroup_comparison": row.get("exact_current_subgroup_comparison"),
            "source_capture_complete": source_complete,
            "source_capture_quality": {"source_count": len(sources), "all_sources_have_url_locator_support_and_limit": source_complete},
            "open_items": [row.get("hold_reason")] if hold and row.get("hold_reason") else [],
            "evidence_artifact": str(path.relative_to(ROOT)),
            "canonical_taxonomy_changed": bool(row.get("canonical_taxonomy_changed")),
            "role_to_specialization_assigned": bool(row.get("role_links_changed")),
            "nigerian_context_applied": bool(row.get("nigerian_context_added")),
        })
    return result


def kepler_rows(path: Path) -> list[dict[str, Any]]:
    payload = read(path)
    supplemental_sources = read(SOURCE_CAPTURE_ADDENDUM).get("records", [])
    supplements_by_domain: dict[str, list[dict[str, Any]]] = {}
    for source in supplemental_sources:
        supplements_by_domain.setdefault(source["domain_id"], []).append(source)
    result = []
    for row in payload["domains"]:
        areas = row.get("recommended_final_student_facing_areas", []) or []
        coverage = row.get("evidence", {}).get("coverage", {})
        supplements = supplements_by_domain.get(row["domain_id"], [])
        supplement_complete = all(
            source.get("url") and source.get("locator") and source.get("supports") and source.get("limits")
            for source in supplements
        )
        # The addendum enriches already-counted URL-only source rows; it must
        # not inflate the source total by counting the same source twice.
        source_count = coverage.get("source_count", 0)
        locator_count = coverage.get("locator_count", 0) + (len(supplements) if supplement_complete else 0)
        claim_limit_count = coverage.get("claim_limit_count", 0) + (len(supplements) if supplement_complete else 0)
        source_id_count = coverage.get("source_id_count", 0) + (len(supplements) if supplement_complete else 0)
        missing_source_count = max(0, coverage.get("missing_source_id_count", 0) - (len(supplements) if supplement_complete else 0))
        blocker = row.get("remaining_blocker") or []
        if isinstance(blocker, str):
            blocker = [blocker] if blocker else []
        result.append({
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "lane": "D057-D112",
            "step1_status": "parent_scope_unresolved" if blocker else "recommendation_reconciled",
            "disposition": row.get("disposition"),
            "recommended_area_count": len(areas),
            "recommended_areas": areas,
            "current_subgroup_comparison": row.get("exact_current_subgroup_comparison"),
            "source_capture_complete": source_count > 0 and source_count == locator_count == claim_limit_count == source_id_count and missing_source_count == 0,
            "source_capture_quality": {**coverage, "source_count": source_count, "source_id_count": source_id_count, "missing_source_id_count": missing_source_count, "locator_count": locator_count, "claim_limit_count": claim_limit_count, "supplemental_source_capture_count": len(supplements)},
            "supplemental_source_capture_artifact": str(SOURCE_CAPTURE_ADDENDUM.relative_to(ROOT)) if supplements else None,
            "open_items": blocker,
            "evidence_artifact": str(path.relative_to(ROOT)),
            "canonical_taxonomy_changed": False,
            "role_to_specialization_assigned": bool(row.get("role_to_specialization_assignments")),
            "nigerian_context_applied": False,
        })
    return result


def turing_rows(path: Path) -> list[dict[str, Any]]:
    payload = read(path)
    result = []
    for row in payload["records"]:
        areas = row.get("final_student_facing_areas", row.get("recommended_final_student_facing_areas", [])) or []
        coverage = row.get("source_evidence_coverage", {})
        no_area = row.get("disposition") == "direct_domain_role_with_no_specialization"
        result.append({
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "lane": "D113-D168",
            "step1_status": ("no_specialization_recommended" if no_area else "recommendation_reconciled") if row.get("step1_reconciliation_status") == "resolved" else "unresolved",
            "disposition": row.get("step1_reconciliation_status"),
            "recommended_area_count": len(areas),
            "recommended_areas": areas,
            "current_subgroup_comparison": row.get("exact_current_subgroup_comparison"),
            "source_capture_complete": bool(coverage.get("all_sources_have_url_locator_claim_support_and_limit")),
            "source_capture_quality": coverage,
            "open_items": [row.get("remaining_blocker")] if row.get("remaining_blocker") else [],
            "evidence_artifact": str(path.relative_to(ROOT)),
            "canonical_taxonomy_changed": row.get("canonical_taxonomy_changed", False),
            "role_to_specialization_assigned": row.get("role_to_specialization_assigned", False),
            "nigerian_context_applied": row.get("nigerian_context_started", False),
        })
    return result


def d068_rows(path: Path) -> list[dict[str, Any]]:
    payload = read(path)
    recommendation = payload["recommendation"]
    sources = payload.get("source_register", [])
    source_complete = bool(sources) and all(
        source.get("url") and source.get("locator") and source.get("supports") and source.get("limits")
        for source in sources
    )
    stored_rows = payload.get("current_state", {}).get("stored_rows", [])
    return [{
        "domain_id": payload["scope"]["domain_id"],
        "domain_name": payload["scope"]["recorded_domain_name"],
        "lane": "D068 (parent-scope adjudication)",
        "step1_status": "recommendation_reconciled" if payload.get("disposition", "").startswith("resolved_recommendation") and source_complete else "unresolved",
        "disposition": payload.get("disposition"),
        "recommended_area_count": recommendation.get("recommended_count", 0),
        "recommended_areas": recommendation.get("areas", []),
        "current_subgroup_comparison": {"current_record_count": len(stored_rows), "current_domain_structure_subgroup_records": stored_rows, "role_counts_used_as_fit_evidence": False},
        "source_capture_complete": source_complete,
        "source_capture_quality": {"source_count": len(sources), "source_id_count": sum(bool(source.get("source_id")) for source in sources), "locator_count": sum(bool(source.get("locator")) for source in sources), "claim_limit_count": sum(bool(source.get("supports")) and bool(source.get("limits")) for source in sources)},
        "open_items": [] if source_complete else ["D068 source register is incomplete"],
        "evidence_artifact": str(path.relative_to(ROOT)),
        "canonical_taxonomy_changed": False,
        "role_to_specialization_assigned": False,
        "nigerian_context_applied": False,
    }]


def main() -> None:
    rows = local_rows(INPUTS["D001-D056"])
    d001_d028 = agent_d001_d028_rows(INPUTS["D001-D028-agent-reconciliation"])
    reconciled_local = agent_local_rows(INPUTS["D029-D056-agent-reconciliation"])
    replacements = {row["domain_id"]: row for row in d001_d028 + reconciled_local}
    rows = [replacements.get(row["domain_id"], row) for row in rows]
    rows += kepler_rows(INPUTS["D057-D112"]) + turing_rows(INPUTS["D113-D168"])
    d068 = d068_rows(INPUTS["D068-parent-scope-resolution"])[0]
    rows = [d068 if row["domain_id"] == "D068" else row for row in rows]
    rows.sort(key=lambda row: int(row["domain_id"][1:]))
    ids = [row["domain_id"] for row in rows]
    expected = [f"D{i:03d}" for i in range(1, 169)]
    counts = Counter(row["step1_status"] for row in rows)
    complete_statuses = {"recommendation_reconciled", "no_specialization_recommended"}
    compute = read(COMPUTATIONAL)
    payload = {
        "schema_version": "2026-10-06.global-step1-specialization-reconciliation.v1",
        "scope": "Global area-of-specialization structure reconciliation and computational-specialization overlay only; role audit, Nigerian context, and canonical application are separate later gates.",
        "catalogue_domain_count": 168,
        "unique_domain_count": len(set(ids)),
        "missing_domain_ids": sorted(set(expected) - set(ids)),
        "duplicate_domain_ids": sorted(domain_id for domain_id, n in Counter(ids).items() if n > 1),
        "step1_status_counts": dict(sorted(counts.items())),
        "step1_decisions_dispositioned_count": sum(row["step1_status"] in complete_statuses for row in rows),
        "step1_decisions_complete": len(rows) == 168 and all(row["step1_status"] in complete_statuses for row in rows),
        "source_capture_complete_count": sum(row["source_capture_complete"] for row in rows),
        "domains_with_current_subgroup_comparison": sum(row["current_subgroup_comparison"] is not None for row in rows),
        "canonical_taxonomy_changed_count": sum(row["canonical_taxonomy_changed"] for row in rows),
        "role_to_specialization_assigned_count": sum(row["role_to_specialization_assigned"] for row in rows),
        "nigerian_context_applied_count": sum(row["nigerian_context_applied"] for row in rows),
        "computational_overlay_counts": compute.get("counts", {}),
        "inputs": {lane: str(path.relative_to(ROOT)) for lane, path in INPUTS.items()},
        "domains": rows,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Global Step 1 specialization reconciliation — 2026-10-06",
        "",
        "This consolidates the local D001-D056 baseline with scoped D001-D028, D029-D056 and D068 adjudications plus the prior D057-D112 and D113-D168 registers. A Step 1 decision is a source-backed internal taxonomy recommendation, not a canonical taxonomy edit or academic-body sign-off. Role links and Nigerian context are handled in separate gates.",
        "",
        f"- Catalogue rows / unique IDs: **{len(rows)} / {payload['unique_domain_count']}**",
        f"- Step 1 decisions dispositioned: **{payload['step1_decisions_dispositioned_count']}/168** (164 recommended area sets; 4 explicit no-specialization dispositions)",
        f"- Step 1 complete: **{'yes' if payload['step1_decisions_complete'] else 'no'}**",
        f"- Missing IDs / duplicate IDs: **{len(payload['missing_domain_ids'])} / {len(payload['duplicate_domain_ids'])}**",
        f"- Source-capture complete: **{payload['source_capture_complete_count']}/168**",
        f"- Current subgroup comparison captured: **{payload['domains_with_current_subgroup_comparison']}/168**",
        f"- Canonical changes / role-to-specialization assignments / Nigerian additions: **{payload['canonical_taxonomy_changed_count']} / {payload['role_to_specialization_assigned_count']} / {payload['nigerian_context_applied_count']}**",
        "",
        "## Step 1 status counts",
        "",
    ]
    lines.extend(f"- `{status}`: **{count}**" for status, count in payload["step1_status_counts"].items())
    lines.extend(["", "## Open decisions", ""])
    for row in rows:
        if row["step1_status"] != "recommendation_reconciled":
            detail = "; ".join(str(item) for item in row["open_items"])
            lines.append(f"- **{row['domain_id']} — {row['domain_name']}**: `{row['step1_status']}`; {detail or 'local final recommendation decision is still pending.'}")
    lines.extend([
        "",
        "## Computational overlay",
        "",
        f"- Parent-specific dispositions: **{compute.get('counts', {}).get('parent_specific_dispositions', 0)}**",
        f"- Method groups dispositioned: **{compute.get('counts', {}).get('method_groups_without_explicit_role_link_resolved', 0)}/{compute.get('counts', {}).get('method_groups_total', 0)}**",
        "- The computational overlay does not infer role links or change canonical taxonomy.",
        "",
        "Full per-domain comparisons, source-capture details, and artifact paths are in the adjacent JSON.",
        "",
    ])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({key: value for key, value in payload.items() if key != "domains"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
