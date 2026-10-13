"""Integrate existing Nigerian evidence with the finalized global areas.

This is an additive audit ledger.  It does not edit domain_structure.json,
role libraries, or canonical seeds.  Existing Nigerian records are attached
at the scope they actually support: domain-level context is not silently
promoted to area-of-specialization evidence.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
STEP1 = AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
GLOBAL = STEP1 / "global_step1_specialization_reconciliation_2026_10_06.json"
WEB = ROOT / "data" / "career-mapping" / "nigerian_web_source_evidence_audit.json"
DOMAIN = ROOT / "data" / "career-mapping" / "nigerian_domain_field_enrichment_2026-08-25.json"
PROFESSIONAL = ROOT / "data" / "career-mapping" / "nigerian_global_professional_overlays.json"
THIN = ROOT / "data" / "career-mapping" / "nigerian_thin_domain_overlays.json"
OUT_JSON = AUDIT / "local_nigerian_specialization_context_2026_10_06.json"
OUT_MD = AUDIT / "LOCAL_NIGERIAN_SPECIALIZATION_CONTEXT_2026-10-06.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def areas(domain: dict[str, Any]) -> list[dict[str, Any]]:
    result = []
    raw_recommended = domain.get("recommended_areas") or []
    if isinstance(raw_recommended, dict):
        raw_recommended = [raw_recommended]
    for area in raw_recommended:
        if not isinstance(area, dict):
            continue
        # D057-D112 stores the reconciled area list under a wrapper's
        # ``areas`` field; other lanes store area objects directly.
        candidates = area.get("areas") if isinstance(area.get("areas"), list) else [area]
        for candidate in candidates:
            if isinstance(candidate, dict) and candidate.get("label"):
                result.append(
                    {
                        "label": candidate["label"],
                        "boundary": candidate.get("boundary") or candidate.get("scope") or candidate.get("route_boundary"),
                    }
                )
    return result


def sources_by_id(*payloads: dict[str, Any]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for payload in payloads:
        for raw in payload.get("verified_sources") or []:
            if isinstance(raw, dict) and raw.get("source_id"):
                result.setdefault(raw["source_id"], raw)
        for raw in payload.get("sources") or []:
            if isinstance(raw, dict) and raw.get("id"):
                result.setdefault(raw["id"], raw)
    return result


def main() -> None:
    global_register = load(GLOBAL)
    web = load(WEB)
    domain_payload = load(DOMAIN)
    professional = load(PROFESSIONAL)
    thin = load(THIN)
    all_sources = sources_by_id(web, domain_payload, professional, thin)
    profiles = [
        *[p for p in domain_payload.get("profiles", []) if isinstance(p, dict)],
        *[p for p in professional.get("profiles", []) if isinstance(p, dict)],
        *[p for p in thin.get("profiles", []) if isinstance(p, dict)],
    ]
    by_domain: dict[str, list[dict[str, Any]]] = {}
    for profile in profiles:
        for domain_id in profile.get("domain_ids") or []:
            by_domain.setdefault(domain_id, []).append(profile)

    domain_rows = []
    area_rows = []
    for domain in global_register.get("domains", []):
        domain_id = domain["domain_id"]
        matching = by_domain.get(domain_id, [])
        source_ids = list(dict.fromkeys(source_id for p in matching for source_id in (p.get("source_ids") or [])))
        source_records = [all_sources[source_id] for source_id in source_ids if source_id in all_sources]
        domain_rows.append(
            {
                "domain_id": domain_id,
                "domain_name": domain.get("domain_name"),
                "nigerian_context_disposition": "domain_context_available" if source_records else "no_current_verified_domain_context",
                "source_ids": source_ids,
                "sources": source_records,
                "profile_ids": [p.get("id") for p in matching if p.get("id")],
                "limitation": "Domain-level Nigerian evidence is not automatically an area-specific claim; area-specific applicability requires an explicit source statement or targeted review.",
            }
        )
        for area in areas(domain):
            area_rows.append(
                {
                    "domain_id": domain_id,
                    "domain_name": domain.get("domain_name"),
                    "area_label": area["label"],
                    "area_boundary": area["boundary"],
                    "nigerian_context_disposition": (
                        "domain_context_inherited_area_specificity_not_established"
                        if source_records
                        else "area_context_source_gap"
                    ),
                    "domain_source_ids": source_ids,
                    "not_claimed": "No Nigerian licensing, demand, curriculum, or practice claim is assigned to this area solely because its parent domain has a Nigerian source.",
                }
            )

    report = {
        "schema_version": "2026-10-06.local-nigerian-specialization-context.v1",
        "purpose": "Local integration of existing Nigerian evidence with the finalized global specialization register.",
        "global_register": str(GLOBAL.relative_to(ROOT)),
        "catalogue_domain_count": len(domain_rows),
        "recommended_area_count": len(area_rows),
        "domains_with_verified_domain_context": sum(r["nigerian_context_disposition"] == "domain_context_available" for r in domain_rows),
        "domains_without_verified_domain_context": sum(r["nigerian_context_disposition"] != "domain_context_available" for r in domain_rows),
        "areas_with_domain_context_only": sum(r["nigerian_context_disposition"] == "domain_context_inherited_area_specificity_not_established" for r in area_rows),
        "areas_without_any_current_domain_context": sum(r["nigerian_context_disposition"] == "area_context_source_gap" for r in area_rows),
        "canonical_taxonomy_changed": False,
        "role_assignments_changed": False,
        "global_specialization_labels_changed": False,
        "domain_rows": domain_rows,
        "area_rows": area_rows,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    OUT_MD.write_text(
        "\n".join(
            [
                "# Local Nigerian specialization-context integration — 2026-10-06",
                "",
                "This ledger attaches existing Nigerian evidence at its supported scope. It does not replace globally recognized areas or infer area-specific claims from a domain-level source.",
                "",
                f"- Domains checked: **{report['catalogue_domain_count']}**",
                f"- Recommended areas carried forward: **{report['recommended_area_count']}**",
                f"- Domains with verified Nigerian context: **{report['domains_with_verified_domain_context']}**",
                f"- Areas with domain context only (area-specificity still unestablished): **{report['areas_with_domain_context_only']}**",
                f"- Areas with no current domain context: **{report['areas_without_any_current_domain_context']}**",
                "",
                "Canonical taxonomy, role assignments, and global specialization labels changed: **No**.",
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({k: v for k, v in report.items() if k not in {"domain_rows", "area_rows"}}, indent=2))


if __name__ == "__main__":
    main()
