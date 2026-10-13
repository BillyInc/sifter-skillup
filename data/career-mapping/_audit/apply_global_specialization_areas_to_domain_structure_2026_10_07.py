"""Apply the reconciled area-of-specialization catalog to canonical domain data.

The project uses subgroup / area of specialization / area of practice to mean
the same student-facing layer. This additive projection preserves legacy
ISCO subgroup records until role routes and runtime consumers are migrated; it
does not falsely activate an area whose role routes or evidence are unresolved.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
CATALOG = DATA / "domain_specialization_catalog.json"
STRUCTURE = DATA / "domain_structure.json"
REPORT = AUDIT / "GLOBAL_SPECIALIZATION_CANONICAL_APPLY_2026_10_07.json"
REPORT_MD = AUDIT / "GLOBAL_SPECIALIZATION_CANONICAL_APPLY_2026_10_07.md"
D098_REPAIR = AUDIT / "D098_AREA_BOUNDARY_EVIDENCE_REPAIR_2026_10_07.json"
ROLE_LANES = [
    AUDIT / "role_enrichment_lanes_2026_10_06" / "D001_D056" / "D001_D056_existing_role_area_fit_review_2026_10_07.json",
    AUDIT / "role_enrichment_lanes_2026_10_06" / "D057_D112" / "D057_D112_existing_role_area_fit_review_2026_10_07.json",
    AUDIT / "role_enrichment_lanes_2026_10_06" / "D113_D168" / "D113_D168_existing_role_area_fit_review_2026_10_07.json",
]
ROLE_FILES = [DATA / "role_library_v3_cleaned.json", DATA / "thin_domain_role_overlays.json", DATA / "emerging_role_overlays.json"]


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source_rows(value: Any) -> list[dict[str, Any]]:
    """Collect only explicit source records with URL and locator/evidence text."""
    found: list[dict[str, Any]] = []

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            url = node.get("url") or node.get("source_url")
            locator = node.get("locator") or node.get("source_locator")
            source_id = node.get("source_id") or node.get("id")
            if url and locator and (node.get("supports") or node.get("claim_limit") or node.get("limits")):
                found.append({
                    "source_id": str(source_id).strip() if source_id else None,
                    "publisher": node.get("publisher"),
                    "title": node.get("title"),
                    "url": str(url).strip(),
                    "locator": str(locator).strip(),
                    "supports": node.get("supports"),
                    "claim_limit": node.get("claim_limit") or node.get("limits"),
                    "source_artifact_locator": node.get("source_artifact_locator"),
                })
            for child in node.values():
                walk(child)
        elif isinstance(node, list):
            for child in node:
                walk(child)

    walk(value)
    deduped: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in found:
        key = (str(row.get("source_id") or ""), row["url"], row["locator"])
        deduped.setdefault(key, row)
    return list(deduped.values())


def find_domain_record(value: Any, domain_id: str) -> dict[str, Any] | None:
    """Find the exact domain record within shared lane registers."""
    if isinstance(value, dict):
        if str(value.get("domain_id") or "") == domain_id:
            return value
        for child in value.values():
            found = find_domain_record(child, domain_id)
            if found is not None:
                return found
    elif isinstance(value, list):
        for child in value:
            found = find_domain_record(child, domain_id)
            if found is not None:
                return found
    return None


def evidence_artifact_path(domain: dict[str, Any]) -> Path:
    raw = str(domain.get("evidence_artifact") or "").replace("\\", "/")
    path = (ROOT / raw).resolve()
    if ROOT.resolve() not in path.parents:
        raise ValueError(f"Evidence artifact escapes repository: {raw}")
    return path


def area_key(area: dict[str, Any], domain_id: str) -> str:
    key = str(area.get("area_key") or "").strip()
    if not key.startswith(f"{domain_id}:"):
        raise ValueError(f"Invalid stable area key for {domain_id}: {key!r}")
    return key


def main() -> None:
    catalog = read(CATALOG)
    structure = read(STRUCTURE)
    step1 = read(STEP1)
    repair = read(D098_REPAIR)
    manual_area_repairs = {str(row["area_id"]): row for row in repair.get("areas") or []}
    step1_by_id = {str(row["domain_id"]): row for row in step1.get("domains") or []}
    catalog_domains = catalog.get("domains") or []
    ids = [str(row.get("domain_id") or "") for row in catalog_domains]
    if len(ids) != 168 or len(set(ids)) != 168 or set(ids) != set(step1_by_id):
        raise ValueError("Expected an exact, unique 168-domain catalog matching Step 1")
    area_count = sum(len(row.get("areas") or []) for row in catalog_domains)
    if area_count != 708:
        raise ValueError(f"Expected 708 area recommendations, found {area_count}")
    if catalog.get("key_conflicts"):
        raise ValueError("Catalog has unresolved stable-key conflicts")

    # Count current parent-domain disposition from canonical source rows, using
    # unique domain|role keys. Do not substitute the old small 2025 review set.
    role_by_key: dict[str, dict[str, Any]] = {}
    duplicate_role_keys: list[str] = []
    for path in ROLE_FILES:
        payload = read(path)
        rows = payload if isinstance(payload, list) else payload.get("roles") or []
        for row in rows:
            if str(row.get("student_path_status") or "").casefold() == "excluded":
                continue
            key = f"{row.get('domain_id')}|{str(row.get('role_name') or '').casefold().strip()}"
            if key in role_by_key:
                duplicate_role_keys.append(key)
                # Prefer the more recent record only if the dispositions agree;
                # conflicting duplicates stay visible as an integrity blocker.
                prior = role_by_key[key]
                if prior.get("domain_fit_review_status") != row.get("domain_fit_review_status"):
                    raise ValueError(f"Conflicting duplicate role-domain disposition: {key}")
            else:
                role_by_key[key] = row
    parent_fit_statuses: dict[str, int] = {}
    for row in role_by_key.values():
        status = str(row.get("domain_fit_review_status") or "missing")
        parent_fit_statuses[status] = parent_fit_statuses.get(status, 0) + 1

    role_area_statuses: dict[str, int] = {}
    lane_record_counts: dict[str, int] = {}
    for path in ROLE_LANES:
        lane = read(path)
        rows = lane.get("records") or lane.get("roles") or []
        lane_record_counts[path.parent.name] = len(rows)
        for row in rows:
            if path.parent.name == "D113_D168":
                # This lane's raw direct-route candidate count is 55, but its
                # final disposition gates 12 on parent fit; use that final
                # disposition to avoid counting conditional-parent routes.
                status = str(row.get("disposition") or "review_required")
                status = "direct_or_supported_route" if status == "supported_or_direct_route" else "review_required"
            else:
                fit = row.get("area_fit") or {}
                status = str(fit.get("status") or "review_required") if isinstance(fit, dict) else str(fit)
            # The middle lane names aliases separately; they are not silently
            # counted as verified role routes.
            role_area_statuses[status] = role_area_statuses.get(status, 0) + 1
    lane_role_total = sum(lane_record_counts.values())
    if lane_role_total != len(role_by_key):
        raise ValueError(f"Role-area lane total {lane_role_total} != active unique roles {len(role_by_key)}")

    report_domains: list[dict[str, Any]] = []
    total_attached_refs = 0
    areas_without_direct_refs: list[dict[str, str]] = []
    parent_scope_open_item_domains: list[str] = []
    domains_with_open_items: list[str] = []
    no_area_domains: list[str] = []
    duplicate_area_ids: list[str] = []
    for entry in catalog_domains:
        domain_id = str(entry["domain_id"])
        source_domain = step1_by_id[domain_id]
        artifact = evidence_artifact_path(source_domain)
        raw_evidence = read(artifact) if artifact.exists() else {}
        domain_evidence = find_domain_record(raw_evidence, domain_id) or {}
        refs = source_rows(domain_evidence)
        supplemental_rel = source_domain.get("supplemental_source_capture_artifact")
        if supplemental_rel:
            supplemental_path = (ROOT / str(supplemental_rel).replace("\\", "/")).resolve()
            if ROOT.resolve() in supplemental_path.parents and supplemental_path.exists():
                supplemental = read(supplemental_path)
                supplemental_domain = find_domain_record(supplemental, domain_id)
                refs.extend(source_rows(supplemental_domain or supplemental))
        refs_by_id: dict[str, list[dict[str, Any]]] = {}
        for ref in refs:
            if ref.get("source_id"):
                refs_by_id.setdefault(str(ref["source_id"]), []).append(ref)

        canonical = structure.get(domain_id)
        if not isinstance(canonical, dict):
            raise ValueError(f"Canonical domain missing: {domain_id}")
        areas_out: list[dict[str, Any]] = []
        local_keys: set[str] = set()
        for area in entry.get("areas") or []:
            key = area_key(area, domain_id)
            if key in local_keys:
                duplicate_area_ids.append(key)
                continue
            local_keys.add(key)
            repair_row = manual_area_repairs.get(key)
            if repair_row:
                area["boundary"] = repair_row["boundary"]
                area["source_ids"] = [str(ref["source_id"]) for ref in repair_row["source_references"]]
                area["source_urls"] = [str(ref["url"]) for ref in repair_row["source_references"]]
                area["evidence"] = repair_row["source_references"]
                area["source_support_claim"] = repair_row.get("review_note") or repair["review_note"]
            ids_for_area = list(area.get("source_ids") or [])
            refs_for_area = [ref for source_id in ids_for_area for ref in refs_by_id.get(str(source_id), [])]
            if repair_row:
                refs_for_area = list(repair_row.get("source_references") or [])
            # Explicit URLs captured on the recommendation are retained, but
            # without a locator/claim they are not upgraded to verified refs.
            inline_urls = list(area.get("source_urls") or [])
            if not refs_for_area:
                areas_without_direct_refs.append({"domain_id": domain_id, "area_key": key, "label": str(area.get("label") or "")})
            total_attached_refs += len(refs_for_area)
            areas_out.append({
                "area_id": key,
                "label": area.get("label"),
                "description": area.get("boundary"),
                "boundary": area.get("boundary"),
                "source_ids": ids_for_area,
                "source_references": refs_for_area,
                "uncorroborated_source_urls": inline_urls,
                "recommendation_status": area.get("recommendation_status"),
                "area_status": "review_required_pending_role_route_and_evidence_gate",
                "student_visible": False,
                "nigerian_context": area.get("nigerian_context"),
            })

        if not areas_out:
            no_area_domains.append(domain_id)
        decision = source_domain.get("disposition")
        if source_domain.get("open_items"):
            domains_with_open_items.append(domain_id)
        if any(
            any(term in str(item).casefold() for term in (
                "parent-domain", "parent domain", "root scope", "root mapping",
                "neighboring domain", "neighboring domains", "cross-domain ownership", "parent scope",
            ))
            for item in source_domain.get("open_items") or []
        ):
            parent_scope_open_item_domains.append(domain_id)

        canonical["areas_of_specialization"] = areas_out
        canonical["areas_of_specialization_evidence"] = refs
        canonical["areas_of_specialization_status"] = "applied_as_canonical_source_data_pending_route_and_evidence_gates"
        canonical["areas_of_specialization_source"] = str(CATALOG.relative_to(ROOT)).replace("\\", "/")

        report_domains.append({
            "domain_id": domain_id,
            "area_count": len(areas_out),
            "source_artifact": str(artifact.relative_to(ROOT)).replace("\\", "/") if artifact.exists() else None,
            "captured_source_reference_count": len(refs),
            "areas_missing_area_linked_source_reference": sum(
                not row["source_references"] for row in areas_out
            ),
            "student_visible": False,
            "area_layer_status": "applied_pending_role_routes_evidence_and_runtime_migration",
        })

    if duplicate_area_ids:
        raise ValueError(f"Duplicate area IDs: {duplicate_area_ids[:10]}")

    # Preserve all pre-existing subgroup records and unrelated domain fields.
    write(STRUCTURE, structure)
    catalog["status"] = "canonical_area_data_applied_pending_role_routes_evidence_and_runtime_migration"
    catalog["policy"]["student_visibility_requires_role_route_and_area_context_reconciliation"] = True
    catalog["canonical_application"] = {
        "applied_at": "2026-10-07",
        "target": "domain_structure.json:areas_of_specialization",
        "applied_area_count": area_count,
        "legacy_subgroups_preserved_for_route_compatibility": True,
        "student_visible": False,
        "remaining_gates": [
            "area-linked evidence for every area",
            "role-to-area or justified direct-domain route for every active role",
            "runtime and seed migration to stable area_id",
            "specialization context and domain scope decisions",
        ],
    }
    write(CATALOG, catalog)

    report = {
        "schema_version": "2026-10-07.global-specialization-canonical-apply.v1",
        "status": "applied_with_student_visibility_gated",
        "terminology": "subgroup equals area of specialization equals area of practice",
        "counts": {
            "domains": len(report_domains),
            "areas_applied": area_count,
            "domains_with_no_area_recommended": len(no_area_domains),
            "unique_area_ids": area_count,
            "area_records_without_area_linked_source_reference": len(areas_without_direct_refs),
        "domains_with_open_items": len(domains_with_open_items),
        "domains_with_parent_scope_related_open_items": len(parent_scope_open_item_domains),
        "role_area_review_statuses": role_area_statuses,
        "role_parent_domain_statuses": parent_fit_statuses,
        "active_unique_role_count": len(role_by_key),
        "role_area_lane_counts": lane_record_counts,
        "role_area_review_total": lane_role_total,
        "duplicate_role_keys_across_source_rows": len(duplicate_role_keys),
        },
        "no_area_domains": no_area_domains,
        "domains_with_open_items": domains_with_open_items,
        "domains_with_parent_scope_related_open_items": parent_scope_open_item_domains,
        "duplicate_role_keys_across_source_rows": sorted(set(duplicate_role_keys)),
        "area_records_without_area_linked_source_reference": areas_without_direct_refs,
        "domains": report_domains,
        "safety": {
            "legacy_subgroups_modified": False,
            "roles_modified": False,
            "student_visibility_enabled": False,
            "reason": "Current seed/API keys routes by ISCO subgroup and role-area dispositions remain incomplete; the additive canonical area records must not be misrepresented as released student routes.",
        },
    }
    write(REPORT, report)
    lines = [
        "# Global area-of-specialization canonical apply — 2026-10-07",
        "",
        "Applied the 708 reconciled recommendations into `domain_structure.json` as `areas_of_specialization`, preserving the existing subgroup records and all other domain fields.",
        "",
        "**Terminology:** subgroup = area of specialization = area of practice.",
        "",
        "This is a canonical source-data application, but it is not a student release: student visibility remains off until role routes, area-linked evidence, and seed/API migration are complete.",
        "",
        f"- Domains: {len(report_domains)}",
        f"- Areas applied: {area_count}",
        f"- No-area decisions: {len(no_area_domains)}",
        f"- Area records without an exact area-linked source reference: {len(areas_without_direct_refs)}",
        f"- Domains with open source/review notes: {len(domains_with_open_items)}",
        f"- Domains with parent/root/neighbor-scope-related notes (text-screened, not adjudicated): {len(parent_scope_open_item_domains)}",
        f"- Active unique roles: {len(role_by_key)}",
        f"- Current parent-domain status counts: `{json.dumps(parent_fit_statuses, sort_keys=True)}`",
        f"- Latest complete role-area lane status counts: `{json.dumps(role_area_statuses, sort_keys=True)}`",
        "",
        "The machine-readable report lists every remaining evidence gap and domain disposition. No role files or runtime/API code were changed by this apply.",
    ]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
