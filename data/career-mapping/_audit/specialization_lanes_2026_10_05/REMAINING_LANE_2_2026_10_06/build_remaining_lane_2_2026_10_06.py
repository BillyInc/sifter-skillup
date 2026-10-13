"""Build the disjoint global-first specialization lane for 31 domains.

This lane consolidates existing review artifacts, adds the missing D054 review,
and emits exact, reviewable recommendations.  It does not edit canonical
domain, subgroup, role, or generator files.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
LANES = AUDIT / "specialization_lanes_2026_10_05"
OUT = LANES / "REMAINING_LANE_2_2026_10_06"

DOMAIN_IDS = [
    "D005", "D009", "D013", "D026", "D030", "D034", "D038", "D042",
    "D046", "D050", "D054", "D058", "D068", "D074", "D078", "D082",
    "D100", "D104", "D108", "D112", "D125", "D129", "D133", "D137",
    "D141", "D145", "D149", "D153", "D157", "D161", "D165",
]


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value.rstrip() + "\n", encoding="utf-8")


def source(url: str, source_id: str, publisher: str, title: str, locator: str, supports: str, limit: str) -> dict[str, Any]:
    return {
        "source_id": source_id,
        "publisher": publisher,
        "source_type": "official_global_or_international_practice_source",
        "title": title,
        "url": url,
        "host": urlparse(url).netloc,
        "access_date": "2026-10-06",
        "locator": locator,
        "supports": supports,
        "limit": limit,
        "geographic_scope": "global_or_international",
    }


D054_SOURCES = [
    source(
        "https://www.energy.gov/sites/default/files/2022-10/Dual_Challenge-Vol_3-2021-09-20%20%281%29.pdf",
        "DOE_OIL_GAS_UPSTREAM_MIDSTREAM_DOWNSTREAM",
        "U.S. Department of Energy",
        "Meeting the Dual Challenge, Volume III",
        "Oil and natural gas processing section: upstream exploration/production; midstream transport/delivery; downstream refining, gas processing and distribution.",
        "Supports three distinct value-chain segments for oil and gas operations.",
        "A US government technical source; it defines the operational chain, not a universal student-specialization count or licensing rule.",
    ),
    source(
        "https://www.energy.gov/documents/doe-fy-2027-volume-3",
        "DOE_OFFICE_OIL_GAS_PROGRAMS",
        "U.S. Department of Energy",
        "Office of Oil and Gas FY 2027",
        "Office of Oil and Gas overview: Production Technologies (upstream), Transportation and Storage (midstream), and Power, Fuels and Chemicals (downstream).",
        "Independent official corroboration of the three value-chain boundaries.",
        "Program-structure evidence, not proof that every organization uses identical labels or that each branch is a separate qualification.",
    ),
    source(
        "https://jpt.spe.org/strengthening-our-core-disciplines",
        "SPE_CORE_PETROLEUM_DISCIPLINES",
        "Society of Petroleum Engineers",
        "Strengthening Our Core Disciplines",
        "Core disciplines: drilling, completions, reservoir/geosciences and production operations; other disciplines include HSE, management, economics, facilities and materials.",
        "Supports upstream technical practice boundaries and identifies cross-cutting disciplines that should not automatically become top-level areas here.",
        "SPE technical-discourse evidence is profession-specific and does not prescribe this catalogue's count.",
    ),
    source(
        "https://www.iogp.org/workstreams/safety/safety/managementsystems/",
        "IOGP_OPERATING_MANAGEMENT_SYSTEM_FRAMEWORK",
        "International Association of Oil & Gas Producers",
        "Operating management system framework",
        "Framework applies across upstream and downstream activities from construction to decommissioning throughout the value chain and lifecycle.",
        "Supports treating HSE, integrity, lifecycle and management as cross-cutting controls rather than an invented fourth value-chain specialization.",
        "Framework scope does not establish role coverage or a mandatory learner taxonomy.",
    ),
]


def find_review(domain_id: str) -> tuple[Path | None, dict[str, Any] | None]:
    candidates = [
        LANES / "D003_D084" / f"{domain_id}_specialization_review.json",
        LANES / "D057_D091" / f"{domain_id}_specialization_review.json",
        LANES / "D057_D168" / f"{domain_id}_specialization_candidate_review_2026_10_05.json",
        LANES / "D001_D112_GLOBAL_RECONCILIATION" / f"{domain_id}_global_specialization_reconciliation.json",
    ]
    for path in candidates:
        if path.exists():
            return path, read_json(path)
    return None, None


def current_domain(domain_id: str, structure: dict[str, Any], meta: dict[str, Any]) -> dict[str, Any]:
    row = structure.get(domain_id, {})
    subgroups = row.get("subgroups", [])
    return {
        "domain_id": domain_id,
        "domain_name": meta.get(domain_id, {}).get("domain_name", domain_id),
        "domain_description": meta.get(domain_id, {}).get("description", ""),
        "role_count_stored": row.get("role_count", 0),
        "subgroup_count_stored": len(subgroups),
        "active_subgroups": [
            {
                "isco_submajor": s.get("isco_submajor"),
                "label": s.get("label"),
                "role_count": s.get("role_count", 0),
                "data_state": s.get("data_state", "active"),
                "definition_source": (s.get("source_provenance") or {}).get("source"),
                "student_visibility_reason": s.get("student_visibility_reason"),
            }
            for s in subgroups
            if s.get("data_state", "active") != "excluded"
        ],
        "excluded_subgroups": [
            {"isco_submajor": s.get("isco_submajor"), "label": s.get("label"), "role_count": s.get("role_count", 0)}
            for s in subgroups
            if s.get("data_state") == "excluded"
        ],
    }


def extract_areas(raw: dict[str, Any]) -> list[dict[str, Any]]:
    areas = raw.get("specializations") or raw.get("candidate_areas") or raw.get("candidate_specializations") or []
    if isinstance(areas, dict):
        areas = list(areas.values())
    result = []
    for area in areas:
        if isinstance(area, str):
            result.append({"label": area})
        elif isinstance(area, dict):
            result.append({
                "label": area.get("label") or area.get("name"),
                "scope": area.get("description") or area.get("plain_language_scope") or area.get("scope"),
                "status": area.get("student_display_status") or area.get("status"),
            })
    return result


def source_count(raw: dict[str, Any]) -> int:
    return len(extract_evidence(raw))


def extract_evidence(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Carry source records into the lane register instead of only counting them."""
    records: list[dict[str, Any]] = []
    for key in ("evidence", "source_register", "sources", "supplemental_evidence"):
        value = raw.get(key, [])
        if isinstance(value, list):
            records.extend(item for item in value if isinstance(item, dict))
    return records


def review_record(domain_id: str, structure: dict[str, Any], meta: dict[str, Any]) -> dict[str, Any]:
    current = current_domain(domain_id, structure, meta)
    if domain_id == "D054":
        return {
            **current,
            "review_artifact_status": "new_lane_review_completed",
            "review_basis": "official global value-chain sources plus professional petroleum-discipline corroboration",
            "specialization_count_recommendation": 3,
            "specialization_count_status": "defensible_internal_synthesis; not a universal accreditation taxonomy",
            "candidate_specializations": [
                {"label": "Upstream Exploration, Drilling and Production", "scope": "Find, evaluate and produce hydrocarbons, including geology/geoscience, wells, completions and production operations."},
                {"label": "Midstream Transportation, Processing and Storage", "scope": "Gather, process, transport and store crude oil, natural gas and related streams between production and markets/refineries."},
                {"label": "Downstream Refining, Petrochemicals and Product Distribution", "scope": "Refine crude, process gas and petrochemical feedstocks, and distribute finished fuels and products."},
            ],
            "current_subgroup_disposition": "The four excluded ISCO-derived groups are not student-facing specializations and should remain excluded until role coverage is rebuilt.",
            "role_domain_fit_status": "not established by this lane; D054 currently has zero active roles",
            "role_specialization_fit_status": "deferred until role coverage and exact task crosswalk exist",
            "patch_recommendation": {
                "action": "defer_canonical_write_until_role_coverage",
                "exact_changes": [
                    "Keep the four current D054 subgroup records excluded; do not expose their ISCO headings as specialization labels.",
                    "When role coverage is available, replace them with the three candidate value-chain areas above only after exact role-task review.",
                    "Keep HSE, asset integrity, decommissioning, economics and data as cross-cutting capabilities unless independent role/task evidence justifies a separate route.",
                ],
                "canonical_files_to_change_later": ["domain_structure.json", "domain_meta.json", "role_library_v3_cleaned.json"],
            },
            "evidence": D054_SOURCES,
            "unresolved_items": [
                "No active D054 roles currently exist, so no role-to-domain or role-to-specialization assignment can be certified.",
                "The three-area count is an internal navigation synthesis, not academic-body sign-off.",
            ],
            "global_only": True,
            "nigerian_context_added": False,
        }

    path, raw = find_review(domain_id)
    if raw is None:
        raise FileNotFoundError(f"No review artifact found for {domain_id}")
    decision = raw.get("decision") if isinstance(raw.get("decision"), dict) else {}
    status = raw.get("review_status") or raw.get("decision_status") or "artifact_status_not_explicit"
    areas = extract_areas(raw)
    count = raw.get("specialization_count") or raw.get("candidate_area_count") or decision.get("count")
    if count is None and areas:
        count = len(areas)
    text = " ".join(str(x) for x in (status, decision.get("disposition", ""), raw.get("recommendation", ""))).lower()
    if "no_global" in text or "no_universal" in text or "zero_role_coverage" in text:
        implementation = "retain_or_restructure_without_promoting_fixed_specialization_set"
    elif "parent_scope" in text or "provisional" in text or "pending" in text or "open" in text:
        implementation = "defer_canonical_write_pending_parent_boundary_or_role_reconciliation"
    else:
        implementation = "candidate_set_ready_for_local_role_reconciliation_before_canonical_write"
    uncertainties = raw.get("uncertainties") or raw.get("limitations") or raw.get("remaining_review") or []
    if isinstance(uncertainties, str):
        uncertainties = [uncertainties]
    evidence = extract_evidence(raw)
    if domain_id == "D078":
        computational_path = AUDIT / "D078_computational_specialization_review_2026_10_05.json"
        if computational_path.exists():
            computational = read_json(computational_path)
            computational_area = computational.get("specialization", {})
            evidence.extend(extract_evidence(computational_area))
    return {
        **current,
        "review_artifact_status": "existing_artifact_consolidated",
        "review_artifact": str(path.relative_to(ROOT)),
        "review_status": status,
        "recommendation_summary": decision.get("disposition") or raw.get("recommendation") or raw.get("decision"),
        "specialization_count_recommendation": count,
        "specialization_count_status": decision.get("count_status") or raw.get("candidate_area_count_status"),
        "candidate_specializations": areas,
        "current_subgroup_disposition": "Current subgroup records are evidence inputs only; ISCO membership is not treated as specialization or domain-fit proof.",
        "role_domain_fit_status": "independent role-domain audit remains separate from this specialization review",
        "role_specialization_fit_status": "deferred until specialization boundaries are reconciled",
        "implementation_disposition": implementation,
        "patch_recommendation": {
            "action": implementation,
            "exact_changes": [
                "Do not promote current ISCO-derived subgroup labels solely because they exist.",
                "Use the candidate specialization labels/scopes only after role-task crosswalk and parent-boundary checks.",
                "Preserve direct domain-to-role routes where the review explicitly rejects a specialization set or where no justified subgroup exists.",
            ],
            "canonical_files_to_change_later": ["domain_structure.json", "domain_meta.json", "role_library_v3_cleaned.json"],
        },
        "evidence": evidence,
        "evidence_reference_count": len(evidence),
        "unresolved_items": uncertainties,
        "global_only": True,
        "nigerian_context_added": False,
    }


def checkpoint_markdown(processed: list[dict[str, Any]], cursor: int) -> str:
    lines = [
        "# Remaining specialization lane 2 checkpoint",
        "",
        f"Date: {date.today().isoformat()}",
        f"Cursor: {cursor}/{len(DOMAIN_IDS)}",
        f"Processed domains: {len(processed)}/{len(DOMAIN_IDS)}",
        "Global-first only; no Nigerian context; no canonical taxonomy edits.",
        "",
        "| ID | Domain | Current visible subgroups | Candidate count | Status | Implementation disposition |",
        "|---|---|---:|---:|---|---|",
    ]
    for row in processed:
        lines.append(
            f"| {row['domain_id']} | {row['domain_name']} | {len(row['active_subgroups'])} | "
            f"{row.get('specialization_count_recommendation') if row.get('specialization_count_recommendation') is not None else '—'} | "
            f"{row.get('review_status') or row.get('review_artifact_status')} | "
            f"{row.get('implementation_disposition', 'D054 targeted review')} |"
        )
    lines.extend(["", "## Per-domain evidence and proposed changes", ""])
    for row in processed:
        lines.extend([
            f"### {row['domain_id']} — {row['domain_name']}",
            "",
            f"- Review artifact status: `{row.get('review_artifact_status')}`.",
            f"- Current stored roles: **{row.get('role_count_stored', 0)}**; visible subgroups: **{len(row.get('active_subgroups', []))}**; excluded subgroup records: **{len(row.get('excluded_subgroups', []))}**.",
            f"- Recommended specialization count: **{row.get('specialization_count_recommendation', 'not established')}**.",
            f"- Role→domain status: {row.get('role_domain_fit_status', 'not recorded')}.",
            f"- Role→specialization status: {row.get('role_specialization_fit_status', 'not recorded')}.",
            f"- Proposed implementation action: `{row.get('implementation_disposition') or row.get('patch_recommendation', {}).get('action')}`.",
        ])
        areas = row.get("candidate_specializations", [])
        if areas:
            lines.append("- Candidate areas:")
            for area in areas:
                label = area.get("label") if isinstance(area, dict) else str(area)
                scope = area.get("scope") if isinstance(area, dict) else None
                lines.append(f"  - **{label}**" + (f": {scope}" if scope else ""))
        lines.append("- Exact proposed changes:")
        for change in row.get("patch_recommendation", {}).get("exact_changes", []):
            lines.append(f"  - {change}")
        unresolved = row.get("unresolved_items", [])
        if unresolved:
            lines.append("- Unresolved items:")
            for item in unresolved:
                lines.append(f"  - {item}")
        evidence = row.get("evidence", [])
        if evidence:
            lines.append("- Evidence:")
            for item in evidence:
                lines.append(f"  - `{item.get('source_id')}` — {item.get('title')} ({item.get('url')}) — {item.get('locator')}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    structure = read_json(ROOT / "data/career-mapping/domain_structure.json")
    meta = read_json(ROOT / "data/career-mapping/domain_meta.json")
    processed: list[dict[str, Any]] = []
    for cursor, domain_id in enumerate(DOMAIN_IDS, start=1):
        row = review_record(domain_id, structure, meta)
        processed.append(row)
        checkpoint = {
            "schema_version": "2026-10-06.remaining-lane-2.checkpoint.v1",
            "lane": "REMAINING_LANE_2_2026_10_06",
            "cursor": cursor,
            "expected_domain_ids": DOMAIN_IDS,
            "processed_domain_ids": [x["domain_id"] for x in processed],
            "global_only": True,
            "nigerian_context_added": False,
            "canonical_taxonomy_changed": False,
            "domains": processed,
        }
        write_json(OUT / f"checkpoint_{cursor:03d}_2026_10_06.json", checkpoint)
        write_text(OUT / f"checkpoint_{cursor:03d}_2026_10_06.md", checkpoint_markdown(processed, cursor))

    register = {
        "schema_version": "2026-10-06.remaining-lane-2.register.v1",
        "purpose": "Complete global-first subgroup/area-of-specialization audit for the assigned 31 domains without broad canonical edits.",
        "lane": "REMAINING_LANE_2_2026_10_06",
        "date": "2026-10-06",
        "expected_domain_count": len(DOMAIN_IDS),
        "processed_domain_count": len(processed),
        "domain_ids": DOMAIN_IDS,
        "source_policy": "Use current canonical taxonomy and existing source/evidence registries; D054 uses official global/international sources recorded in this lane.",
        "global_only": True,
        "nigerian_context_added": False,
        "canonical_taxonomy_changed": False,
        "role_domain_fit_independent": True,
        "role_specialization_fit_deferred_until_specialization_set_reconciled": True,
        "counts": {
            "existing_artifacts_consolidated": sum(1 for x in processed if x["review_artifact_status"] == "existing_artifact_consolidated"),
            "new_missing_artifact_reviews": sum(1 for x in processed if x["review_artifact_status"] == "new_lane_review_completed"),
            "candidate_set_or_count_records": sum(1 for x in processed if x.get("specialization_count_recommendation") is not None),
            "no_fixed_global_set_records": sum(1 for x in processed if "no_global" in (x.get("review_status") or "") or "no_universal" in (x.get("review_status") or "")),
            "zero_visible_subgroup_domains": sum(1 for x in processed if not x.get("active_subgroups")),
            "zero_stored_role_domains": sum(1 for x in processed if not x.get("role_count_stored")),
            "domains_with_unresolved_items": sum(1 for x in processed if x.get("unresolved_items")),
        },
        "domains": processed,
        "reconciliation_policy": [
            "A specialization candidate is not canonical merely because an external source names a practice area.",
            "ISCO subgroup membership and current role placement are not evidence of role-domain or role-specialization fit.",
            "Current subgroup labels are retained as audit inputs; exact canonical patching is deferred until all role-task crosswalks and parent boundaries are reconciled.",
            "No Nigerian context, demand, licensing, salary or local professional-body claims are included in this lane.",
        ],
    }
    write_json(OUT / "remaining_lane_2_specialization_register_2026_10_06.json", register)
    write_text(OUT / "REMAINING_LANE_2_CHECKPOINT_2026_10_06.md", checkpoint_markdown(processed, len(processed)))
    print(json.dumps({"expected": len(DOMAIN_IDS), "processed": len(processed), "counts": register["counts"], "out": str(OUT)}, indent=2))


if __name__ == "__main__":
    main()
