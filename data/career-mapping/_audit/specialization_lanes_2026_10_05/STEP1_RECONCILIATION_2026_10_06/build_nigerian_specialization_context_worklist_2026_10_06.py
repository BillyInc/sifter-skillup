"""Build three auditable Nigerian-context research lanes from the closed global AOS register.

This is a worklist generator, not an evidence adjudicator. Existing Nigerian
domain anchors are provided as leads only; they are not treated as proof that a
specific specialization exists, is regulated, or is locally distinct.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = next(parent for parent in HERE.parents if (parent / "data/career-mapping").is_dir())
GLOBAL_REGISTER = HERE / "global_step1_specialization_reconciliation_2026_10_06.json"
NIGERIAN_EVIDENCE = ROOT / "data/career-mapping/nigerian_web_source_evidence_audit.json"
OUT_DIR = HERE / "STEP2_NIGERIAN_CONTEXT_2026_10_06"
LANES = ((1, 56), (57, 112), (113, 168))


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def build_worklist() -> dict[str, Any]:
    global_register = read(GLOBAL_REGISTER)
    nigeria = read(NIGERIAN_EVIDENCE)
    evidence_by_domain: dict[str, dict[str, Any]] = {}
    for row in nigeria.get("domain_coverage", []) + nigeria.get("supplemental_hidden_domain_coverage", []):
        domain_id = row.get("domain_id")
        if not domain_id:
            continue
        existing = evidence_by_domain.setdefault(domain_id, {
            "source_audit_rows": [],
            "candidate_source_ids": [],
            "statuses": [],
        })
        existing["source_audit_rows"].append(row)
        existing["candidate_source_ids"].extend(row.get("verified_web_anchor_ids", []))
        existing["statuses"].append(row.get("status"))

    source_catalog = {
        source.get("source_id"): source
        for source in nigeria.get("verified_sources", [])
        if source.get("source_id")
    }
    domains = []
    for row in sorted(global_register["domains"], key=lambda item: int(item["domain_id"][1:])):
        domain_id = row["domain_id"]
        local = evidence_by_domain.get(domain_id, {})
        candidate_ids = sorted(set(local.get("candidate_source_ids", [])))
        candidate_sources = [source_catalog[source_id] for source_id in candidate_ids if source_id in source_catalog]
        areas = row.get("recommended_areas", [])
        if isinstance(areas, dict):
            areas = areas.get("areas", [])
        domains.append({
            "domain_id": domain_id,
            "domain_name": row["domain_name"],
            "global_step1_disposition": row["step1_status"],
            "approved_global_specialization_areas": [
                {"label": area.get("label"), "boundary": area.get("boundary")}
                for area in areas
            ],
            "no_specialization_recommended": row["step1_status"] == "no_specialization_recommended",
            "existing_nigeria_source_leads": candidate_sources,
            "existing_nigeria_source_ids_without_full_source_record": [
                source_id for source_id in candidate_ids if source_id not in source_catalog
            ],
            "existing_nigeria_coverage_statuses": sorted(set(local.get("statuses", []))),
            "research_disposition_required_per_area": (
                "review_global_area_for_nigeria_specific_distinction_or_emphasis"
                if areas else "confirm_no_separate_specialization; record only relevant domain-level Nigerian context"
            ),
            "evidence_status": "not_yet_researched_at_specialization_level",
            "instruction": (
                "Existing domain source leads are discovery pointers only. Verify the exact Nigerian claim against a primary source and explain whether it changes local practice, regulation, curriculum, credential, or industry context for this exact global area. Do not change the global area label/count based only on Nigerian evidence."
            ),
        })

    by_id = {row["domain_id"]: row for row in domains}
    lane_rows = []
    for start, end in LANES:
        lane_id = f"D{start:03d}_D{end:03d}"
        lane_rows.append({
            "lane_id": lane_id,
            "domain_id_range": [f"D{start:03d}", f"D{end:03d}"],
            "assigned_domain_count": end - start + 1,
            "domains": [by_id[f"D{n:03d}"] for n in range(start, end + 1)],
        })

    return {
        "schema_version": "2026-10-06.nigerian-specialization-context-worklist.v1",
        "scope": "Nigeria-specific overlay for finalized global areas of specialization across the 168-domain catalogue. This worklist is not proof of completed research or local area fit.",
        "global_step1_complete": global_register.get("step1_decisions_complete") is True,
        "global_domain_count": len(domains),
        "area_count": sum(len(row["approved_global_specialization_areas"]) for row in domains),
        "domains_with_existing_nigeria_source_leads": sum(bool(row["existing_nigeria_source_leads"]) for row in domains),
        "domains_without_indexed_nigeria_source_leads": [row["domain_id"] for row in domains if not row["existing_nigeria_source_leads"]],
        "domains_with_no_specialization_recommended": [row["domain_id"] for row in domains if row["no_specialization_recommended"]],
        "existing_audit_limit": "The pre-existing Nigerian evidence audit reports 160 domain rows (plus supplemental hidden-domain rows) and the separate context coverage report reflects an older 160-domain/542-subgroup snapshot. Its source IDs are carried here only as leads; local claims must be revalidated against primary evidence and tied to the current domain/area.",
        "research_contract": {
            "allowed_local_overlay": ["Nigeria-specific law/regulation", "local professional or statutory body and credential context", "Nigerian curriculum/practice emphasis", "locally evidenced industries and work settings"],
            "must_not": ["replace globally recognized area labels or counts", "infer local demand from generic/global evidence", "treat an ISCO subgroup or role title as specialization evidence", "invent a local credential, regulator, or distinct specialization"],
            "per_area_required_fields": ["disposition", "exact_nigerian_claim", "source_publisher", "source_title", "exact_url", "locator", "access_date", "what_it_supports", "limits", "global_area_label_preserved", "confidence"],
            "valid_dispositions": ["nigeria_specific_overlay_supported", "global_area_applies_no_material_local_difference_found", "no_primary_nigerian_evidence_found_after_search", "unresolved_source_or_scope_conflict"],
        },
        "inputs": {
            "global_specialization_register": str(GLOBAL_REGISTER.relative_to(ROOT)),
            "existing_nigerian_evidence_audit": str(NIGERIAN_EVIDENCE.relative_to(ROOT)),
        },
        "lanes": lane_rows,
    }


def write_outputs(payload: dict[str, Any]) -> list[Path]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = []
    overall_path = OUT_DIR / "nigerian_specialization_context_worklist_2026_10_06.json"
    overall_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    outputs.append(overall_path)
    for lane in payload["lanes"]:
        path = OUT_DIR / f"{lane['lane_id']}_nigerian_context_worklist_2026_10_06.json"
        lane_payload = {
            "schema_version": payload["schema_version"],
            "scope": payload["scope"],
            "global_step1_complete": payload["global_step1_complete"],
            "research_contract": payload["research_contract"],
            "existing_audit_limit": payload["existing_audit_limit"],
            **lane,
        }
        path.write_text(json.dumps(lane_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        outputs.append(path)
    md = [
        "# Nigerian specialization-context research worklist — 2026-10-06",
        "",
        "Generated from the closed 168-domain global Step 1 register. Existing Nigerian citations are leads, not proof of a specialization-level claim.",
        "",
        f"- Global Step 1 complete: **{payload['global_step1_complete']}**",
        f"- Domains: **{payload['global_domain_count']}**; global specialization areas: **{payload['area_count']}**",
        f"- Domains with existing source leads: **{payload['domains_with_existing_nigeria_source_leads']}**",
        f"- Domains with no specialization recommended: **{len(payload['domains_with_no_specialization_recommended'])}**",
        "",
        "## Disjoint lanes",
        "",
    ]
    md.extend(f"- `{lane['lane_id']}`: {lane['assigned_domain_count']} domains; {sum(len(row['approved_global_specialization_areas']) for row in lane['domains'])} specialization areas" for lane in payload["lanes"])
    md.extend(["", "The lane JSON files contain domain names, the approved global area labels/boundaries, existing Nigerian source leads, per-area research dispositions, required evidence fields, and explicit anti-inference rules.", ""])
    md_path = OUT_DIR / "NIGERIAN_SPECIALIZATION_CONTEXT_WORKLIST_2026_10_06.md"
    md_path.write_text("\n".join(md), encoding="utf-8")
    outputs.append(md_path)
    return outputs


if __name__ == "__main__":
    result = build_worklist()
    paths = write_outputs(result)
    print(json.dumps({
        "domains": result["global_domain_count"],
        "areas": result["area_count"],
        "domains_with_existing_nigeria_source_leads": result["domains_with_existing_nigeria_source_leads"],
        "no_specialization_domains": result["domains_with_no_specialization_recommended"],
        "outputs": [path.as_posix() for path in paths],
    }, ensure_ascii=False, indent=2))
