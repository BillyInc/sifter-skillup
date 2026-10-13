"""Consolidate and reconcile the remaining global specialization lane.

This is deliberately append-only.  It reads the existing domain/subgroup
artifacts and produces a disjoint lane register; it does not mutate canonical
domain_structure.json, domain_meta.json, role libraries, or seed files.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
LANE = Path(__file__).resolve().parent
STRUCTURE_PATH = ROOT / "data" / "career-mapping" / "domain_structure.json"
META_PATH = ROOT / "data" / "career-mapping" / "domain_meta.json"
SOURCE_REGISTRY_PATH = ROOT / "data" / "career-mapping" / "domain_role_source_registry.json"

ASSIGNED_IDS = [
    "D006", "D010", "D014", "D027", "D031", "D035", "D039", "D043",
    "D047", "D051", "D055", "D060", "D069", "D075", "D079", "D083",
    "D101", "D105", "D109", "D116", "D126", "D130", "D134", "D138",
    "D142", "D146", "D150", "D154", "D158", "D162", "D166",
]

# D055 was the only assigned domain without a prior review artifact.  These
# sources are global professional/accreditation references, not Nigerian
# context and not evidence for role membership.
D055_MANUAL = {
    "source_id": "D055_GLOBAL_CHEMICAL_ENGINEERING_TRIANGULATION_2026_10_06",
    "publisher": "ABET; AIChE; IChemE",
    "title": "Chemical engineering curriculum and professional specialism triangulation",
    "urls": [
        "https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs-2026-2027/",
        "https://www.aiche.org/community/sites/default/files/docs/conferences/2015che_academicindustryalignmentstudy.compressed.pdf",
        "https://www.icheme.org/accreditation-guide",
        "https://www.aiche.org/sites/default/files/community/186226/aiche-community-site-page/190376/typical-cheme-curriculum.pdf",
    ],
    "locator": "Chemical/biochemical engineering curriculum criteria and professional curriculum/special-interest structures covering process design, transport, reactions, separations, process control, biochemical, energy, materials and environmental applications.",
    "claim_supported": "Chemical engineering has recognizable process/system and application-oriented areas that can support a student-facing specialization set, while the sources do not prescribe this catalogue's exact count.",
    "claim_limit": "These are global professional and accreditation references. They do not prove any individual role-to-domain or role-to-specialization link, licensing status, or Nigerian context.",
    "geographic_scope": "global_or_international_or_comparative",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def text_values(value: Any) -> Iterable[str]:
    if isinstance(value, str) and value.strip():
        yield value.strip()
    elif isinstance(value, list):
        for item in value:
            yield from text_values(item)


def artifact_candidates(domain_id: str) -> list[Path]:
    base = AUDIT / "specialization_lanes_2026_10_05"
    patterns = [
        f"**/{domain_id}_global_specialization_reconciliation.json",
        f"**/{domain_id}_specialization_review.json",
        f"**/{domain_id}_specialization_candidate_review_2026_10_05.json",
    ]
    found: list[Path] = []
    for pattern in patterns:
        found.extend(sorted(base.glob(pattern)))
    # Keep the first occurrence of each path but preserve the deliberate
    # precedence above: final reconciliation, then review, then candidate.
    result: list[Path] = []
    for path in found:
        if path not in result:
            result.append(path)
    return result


def extract_areas(doc: dict[str, Any]) -> list[dict[str, Any]]:
    raw: Any = doc.get("candidate_areas")
    if raw is None:
        raw = doc.get("candidate_specializations")
    if not isinstance(raw, list):
        return []
    areas: list[dict[str, Any]] = []
    for item in raw:
        if isinstance(item, str):
            areas.append({"label": item})
        elif isinstance(item, dict):
            label = item.get("label") or item.get("name") or item.get("title")
            if label:
                areas.append(item)
    return areas


def extract_unapproved_areas(doc: dict[str, Any]) -> list[dict[str, Any]]:
    """Keep explicitly unapproved candidates visible without promoting them."""
    decision = doc.get("decision")
    if not isinstance(decision, dict):
        return []
    raw = decision.get("candidate_areas_not_approved")
    if not isinstance(raw, list):
        return []
    result = []
    for item in raw:
        if isinstance(item, dict) and item.get("label"):
            result.append(item)
    return result


def source_dicts(doc: Any) -> Iterable[dict[str, Any]]:
    """Yield source-like records from known evidence fields only."""
    if isinstance(doc, dict):
        for key, value in doc.items():
            if key.lower() in {
                "source_register", "sources", "source_records", "evidence",
                "evidence_register", "evidence_reconciliation",
            }:
                yield from source_dicts(value)
            elif key.lower() in {
                "source_id", "id", "url", "urls", "publisher", "title",
                "locator", "claim_supported", "claim_limit", "geographic_scope",
            }:
                # This branch is intentionally handled by the parent object;
                # recurse only through known source containers above.
                continue
    elif isinstance(doc, list):
        for item in doc:
            if isinstance(item, dict):
                if any(k in item for k in ("source_id", "url", "urls", "publisher", "title")):
                    yield item
                else:
                    yield from source_dicts(item)


def normalize_source(item: dict[str, Any]) -> dict[str, Any] | None:
    sid = item.get("source_id") or item.get("id") or item.get("source")
    urls = item.get("urls") or item.get("url")
    if isinstance(urls, str):
        urls = [urls]
    if not sid and not urls and not item.get("title"):
        return None
    sid = str(sid) if sid else None
    # Global-first: exclude explicit Nigerian/local records from this lane.
    if sid and sid.lower().startswith("ng_"):
        return None
    geo = str(item.get("geographic_scope") or "").lower()
    if "nigeria" in geo or "nigerian" in geo:
        return None
    result = {
        "source_id": sid,
        "publisher": item.get("publisher"),
        "title": item.get("title"),
        "urls": urls or [],
        "locator": item.get("locator"),
        "claim_supported": item.get("claim_supported"),
        "claim_limit": item.get("claim_limit"),
        "geographic_scope": item.get("geographic_scope") or "global_or_international_or_comparative",
    }
    return result


def source_catalog_entries(domain_id: str, meta: dict[str, Any], registry: dict[str, Any]) -> list[dict[str, Any]]:
    names: list[str] = []
    cluster = meta.get("cluster")
    names.extend(registry.get("default_sources") or [])
    names.extend((registry.get("cluster_sources") or {}).get(cluster, []) or [])
    names.extend((registry.get("domain_overrides") or {}).get(domain_id, []) or [])
    cat = registry.get("source_catalog") or {}
    result = []
    seen = set()
    for sid in names:
        if not str(sid).startswith("global_") or sid in seen:
            continue
        seen.add(sid)
        value = cat.get(sid)
        if isinstance(value, dict):
            result.append(normalize_source({"source_id": sid, **value}) or {"source_id": sid})
        else:
            result.append({"source_id": sid, "urls": []})
    return result


def current_state(domain_id: str, structure: dict[str, Any]) -> dict[str, Any]:
    item = structure.get(domain_id) or {}
    subgroups = item.get("subgroups") or []
    normalized = []
    for sub in subgroups:
        provenance = sub.get("source_provenance") or {}
        data_state = sub.get("data_state") or provenance.get("data_state")
        normalized.append({
            "isco_submajor": sub.get("isco_submajor"),
            "label": sub.get("label"),
            "raw_isco_label": sub.get("raw_isco_label") or provenance.get("raw_isco_label"),
            "data_state": data_state or ("excluded" if sub.get("excluded") else "active_or_unspecified"),
            "role_count": sub.get("role_count", 0),
            "source_ids": provenance.get("sources") or [],
        })
    return {
        "role_count": item.get("role_count", 0),
        "has_subgroups": bool(item.get("has_subgroups")),
        "current_subgroups": normalized,
        "visible_subgroup_count": sum(1 for x in normalized if x["data_state"] != "excluded"),
        "excluded_subgroup_count": sum(1 for x in normalized if x["data_state"] == "excluded"),
        "subgroup_label_assessment": [
            {
                **x,
                "label_disposition": (
                    "excluded_from_student_display; not accepted as specialization"
                    if x["data_state"] == "excluded"
                    else "requires_domain_scope_and_role_task_reconciliation_before_specialization_promotion"
                ),
            }
            for x in normalized
        ],
    }


def collect_artifact(domain_id: str) -> tuple[list[Path], list[dict[str, Any]]]:
    docs = []
    paths = artifact_candidates(domain_id)
    for path in paths:
        docs.append(read_json(path))
    return paths, docs


def disposition_from_docs(docs: list[dict[str, Any]], areas: list[dict[str, Any]]) -> str:
    statuses = [str(x.get("review_status") or x.get("final_reconciliation_disposition") or "") for x in docs]
    if not areas:
        return "retain_domain_to_role_pending_scope_specific_route_review"
    if any("pending" in s or "open" in s or "provisional" in s or "mixed" in s for s in statuses):
        return "candidate_specialization_set_requires_reconciliation_before_canonical_write"
    return "candidate_specialization_set_recorded_canonical_write_pending"


def unresolved_from_docs(docs: list[dict[str, Any]]) -> list[str]:
    values: list[str] = []
    keys = ("remaining_review", "limitations", "source_limitations", "uncertainties", "final_reconciliation_disposition")
    for doc in docs:
        for key in keys:
            value = doc.get(key)
            for text in text_values(value):
                if text not in values:
                    values.append(text)
    return values[:30]


def build_record(domain_id: str, structure: dict[str, Any], meta: dict[str, Any], registry: dict[str, Any]) -> dict[str, Any]:
    paths, docs = collect_artifact(domain_id)
    if domain_id == "D055":
        docs = [
            {
                "domain_id": "D055",
                "domain_name": meta[domain_id].get("domain_name"),
                "review_status": "source_gap_closed_candidate_set_recommended_pending_role_reconciliation",
                "candidate_areas": [
                    {"label": "Process Systems, Design and Operations", "scope": "Process design, unit operations, process integration, control and safe plant operation."},
                    {"label": "Biochemical and Bioprocess Engineering", "scope": "Biological production, bioreactors, downstream processing and scale-up."},
                    {"label": "Energy, Fuels and Sustainable Process Engineering", "scope": "Energy conversion, fuels, decarbonisation and resource-efficient process systems."},
                    {"label": "Materials, Polymers and Product Engineering", "scope": "Chemical product, polymer, materials and formulation/process-product development."},
                    {"label": "Environmental and Water Process Engineering", "scope": "Pollution prevention, treatment, resource recovery and environmental process systems."},
                ],
                "decision": "Five candidate areas are supported as a student-facing synthesis of process-system foundations and globally recognized application areas. Petroleum, pharmaceutical, food and nuclear contexts remain examples or cross-domain applications unless separate task-level evidence establishes a distinct route.",
                "source_records": [D055_MANUAL],
                "limitations": ["The sources support recognizable areas and curriculum boundaries but do not prescribe this exact count.", "Role-to-domain and role-to-specialization fit must be audited independently."],
            }
        ]
        paths = []

    areas: list[dict[str, Any]] = []
    unapproved_areas: list[dict[str, Any]] = []
    for doc in docs:
        for area in extract_areas(doc):
            label = area.get("label")
            if label and not any(x.get("label") == label for x in areas):
                areas.append(area)
        for area in extract_unapproved_areas(doc):
            label = area.get("label")
            if label and not any(x.get("label") == label for x in unapproved_areas):
                unapproved_areas.append(area)
    sources: list[dict[str, Any]] = []
    seen = set()
    for doc in docs:
        for item in source_dicts(doc):
            norm = normalize_source(item)
            if not norm:
                continue
            key = (norm.get("source_id"), tuple(norm.get("urls") or []), norm.get("title"))
            if key not in seen:
                seen.add(key)
                sources.append(norm)
    for item in source_catalog_entries(domain_id, meta[domain_id], registry):
        key = (item.get("source_id"), tuple(item.get("urls") or []), item.get("title"))
        if key not in seen:
            seen.add(key)
            sources.append(item)
    if domain_id == "D055":
        sources = [D055_MANUAL]

    statuses = [str(x.get("review_status") or x.get("final_reconciliation_disposition") or "") for x in docs]
    domain_name = meta[domain_id].get("domain_name") or (structure.get(domain_id) or {}).get("domain_name")
    state = current_state(domain_id, structure)
    return {
        "domain_id": domain_id,
        "domain_name": domain_name,
        "lane": "REMAINING_LANE_3_2026_10_06",
        "global_first": True,
        "nigerian_context_used": False,
        "audit_status": "audited_from_existing_evidence_and_lane_reconciled",
        "prior_artifacts": [str(p.relative_to(ROOT)).replace("\\", "/") for p in paths],
        "prior_review_statuses": statuses,
        "current_state": state,
        "candidate_areas_of_specialization": areas,
        "candidate_area_count": len(areas),
        "explicitly_unapproved_candidate_areas": unapproved_areas,
        "explicitly_unapproved_candidate_area_count": len(unapproved_areas),
        "disposition": disposition_from_docs(docs, areas),
        "role_domain_fit": "independent_role_domain_audit_required; current subgroup/ISCO membership is not proof",
        "role_specialization_fit": "not assigned in this lane; preserve until specialization IDs and independent role-task evidence are reconciled",
        "canonical_patch_recommendation": {
            "write_now": False,
            "action": "create_or_update_independent_specialization_layer_without_reassigning_roles",
            "preserve_current_isco_fields": True,
            "preserve_current_role_domain_links": True,
            "exact_candidate_labels": [x.get("label") for x in areas],
            "requires_local_integration": True,
        },
        "evidence_sources": sources,
        "unresolved_items": unresolved_from_docs(docs),
    }


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def markdown(register: dict[str, Any]) -> str:
    lines = [
        "# Remaining Lane 3 — Global Specialization Reconciliation (2026-10-06)",
        "",
        "This checkpoint covers all 31 assigned domain IDs. It is a global-first evidence reconciliation; Nigerian context is explicitly excluded.",
        "",
        "## Scope and accounting",
        "",
        f"- Assigned domains: **{register['accounting']['assigned_domain_count']}**",
        f"- Prior review artifacts reused: **{register['accounting']['domains_with_prior_artifacts']}**",
        f"- Source gap closed in this lane: **{register['accounting']['source_gap_closed_count']}** (D055)",
        f"- Candidate specialization sets recorded: **{register['accounting']['candidate_set_count']}**",
        f"- Explicit no-universal-set dispositions: **{register['accounting']['no_universal_set_count']}**",
        f"- Domains with no current candidate area and therefore a retained direct-route recommendation: **{register['accounting']['no_candidate_area_count']}**",
        f"- Explicitly unapproved candidate areas kept as review notes: **{register['accounting']['explicitly_unapproved_candidate_area_count']}**",
        f"- Canonical files changed: **0**",
        "",
        "## Safety rules applied",
        "",
        "- Existing evidence artifacts were read before producing this register.",
        "- Role-to-domain fit is kept independent from role-to-specialization fit.",
        "- ISCO membership and current subgroup membership are not used as proof of specialization fit.",
        "- Candidate labels are exact patch recommendations only; no canonical role reassignment or broad taxonomy write was made.",
        "- A domain with no defensible universal specialization set is not forced into invented areas.",
        "",
        "## Domain decisions",
        "",
        "| Domain | Current subgroups | Candidate areas | Lane disposition | Remaining caution |",
        "|---|---:|---:|---|---|",
    ]
    for row in register["domain_records"]:
        caution = row["unresolved_items"][0] if row["unresolved_items"] else "Independent role reconciliation still required."
        if row["explicitly_unapproved_candidate_area_count"]:
            caution = f"{row['explicitly_unapproved_candidate_area_count']} candidate areas remain explicitly unapproved; " + caution
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {len(row['current_state']['current_subgroups'])} | {row['candidate_area_count']} | {row['disposition']} | {caution.replace('|','/')} |")
    lines.extend([
        "",
        "## Integration handoff",
        "",
        "Local integration must create stable specialization identifiers and compatible seed/API support before student-facing promotion. It must then reconcile each role against the parent domain and, separately, against the chosen specialization using role tasks—not ISCO inheritance.",
        "",
        "The per-domain machine-readable records contain the exact candidate labels, current subgroup records, source entries, limitations and patch recommendation.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    structure = read_json(STRUCTURE_PATH)
    meta = read_json(META_PATH)
    registry = read_json(SOURCE_REGISTRY_PATH)
    records = [build_record(did, structure, meta, registry) for did in ASSIGNED_IDS]
    accounting = {
        "assigned_domain_count": len(records),
        "domains_with_prior_artifacts": sum(bool(r["prior_artifacts"]) for r in records),
        "source_gap_closed_count": sum(r["domain_id"] == "D055" for r in records),
        "candidate_set_count": sum(bool(r["candidate_areas_of_specialization"]) for r in records),
        "no_universal_set_count": sum(r["domain_id"] == "D126" for r in records),
        "no_candidate_area_count": sum(not r["candidate_areas_of_specialization"] for r in records),
        "explicitly_unapproved_candidate_area_count": sum(r["explicitly_unapproved_candidate_area_count"] for r in records),
        "canonical_files_changed": [],
    }
    register = {
        "schema_version": "remaining-lane-3-specialization-register-2026-10-06.v1",
        "register_kind": "global_specialization_reconciliation_lane",
        "scope": {"domain_ids": ASSIGNED_IDS, "global_first": True, "nigerian_context_used": False},
        "accounting": accounting,
        "authoritative_inputs": {
            "domain_structure": {"path": str(STRUCTURE_PATH.relative_to(ROOT)).replace("\\", "/"), "sha256": sha256(STRUCTURE_PATH)},
            "domain_meta": {"path": str(META_PATH.relative_to(ROOT)).replace("\\", "/"), "sha256": sha256(META_PATH)},
            "domain_role_source_registry": {"path": str(SOURCE_REGISTRY_PATH.relative_to(ROOT)).replace("\\", "/"), "sha256": sha256(SOURCE_REGISTRY_PATH)},
        },
        "policy": [
            "A specialization is a defensible area of practice or learning inside the parent domain, not an ISCO occupational bucket.",
            "Role-to-domain fit is audited independently from role-to-specialization fit.",
            "No canonical promotion occurs until stable specialization identifiers and independent role-task evidence exist.",
        ],
        "domain_records": records,
    }
    write_json(LANE / "remaining_lane_3_register_2026_10_06.json", register)
    (LANE / "REMAINING_LANE_3_CHECKPOINT_2026_10_06.md").write_text(markdown(register), encoding="utf-8")
    for name, chunk in (("001", records[:10]), ("002", records[10:20]), ("003", records[20:])):
        write_json(LANE / f"remaining_lane_3_checkpoint_{name}_2026_10_06.json", {
            "schema_version": register["schema_version"],
            "checkpoint": name,
            "scope": [r["domain_id"] for r in chunk],
            "completed_domain_count": len(chunk),
            "records": chunk,
        })


if __name__ == "__main__":
    main()
