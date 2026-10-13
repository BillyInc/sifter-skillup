"""Second targeted D113-D168 role/domain/area reconciliation.

This is a proposal-only audit.  It reads the current canonical role files and
the completed first-pass ledger, then writes a deduplicated exact-key result.
It never edits canonical role, area, subgroup, or source-reconciler files.
"""

from __future__ import annotations

import json
import hashlib
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
FIRST = OUT / "D113_D168_role_reconciliation.json"
APPLIED = ROOT / "data/career-mapping/_audit/ROLE_AGENT_PROPOSAL_RECONCILIATION_2026_10_07.json"
CATALOG = ROOT / "data/career-mapping/domain_specialization_catalog.json"
CANONICAL = [
    ROOT / "data/career-mapping/role_library_v3_cleaned.json",
    ROOT / "data/career-mapping/thin_domain_role_overlays.json",
    ROOT / "data/career-mapping/emerging_role_overlays.json",
]
TODAY = "2026-10-07"
DOMAIN_IDS = {f"D{i:03d}" for i in range(113, 169)}

OFFICIAL_SOURCES = {
    "ESCO": {
        "url": "https://esco.ec.europa.eu/en/classification/occupation-main",
        "publisher": "European Commission, ESCO",
        "locator": "Occupation profile identified by the local ESCO code/label; the page defines the occupation concept and its linked knowledge, skills and competences.",
        "date": TODAY,
        "limit": "ESCO is corroborating occupational task/skill evidence, not proof of fit to this project's custom domain or area boundary.",
    },
    "ONET": {
        "url": "https://www.onetonline.org/help/onet/",
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "locator": "O*NET overview: occupation profiles contain tasks, work activities, skills, knowledge and abilities; exact local occupation text is retained in the canonical record.",
        "date": TODAY,
        "limit": "O*NET is a U.S. occupational reference and does not by itself establish Nigerian scope or this catalogue's parent/area fit.",
    },
    "ILO_ISCO": {
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "publisher": "International Labour Organization",
        "locator": "ISCO-08 unit-group descriptions used only as corroborating task-family context.",
        "date": TODAY,
        "limit": "ISCO membership is explicitly not used as role-domain or role-area proof.",
    },
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{str(row.get('role_name', '')).strip().casefold()}"


def active(row: dict[str, Any]) -> bool:
    return row.get("student_path_status") not in {"excluded", "review_only", "audit_only"} and row.get("data_state") not in {"excluded", "review_only", "audit_only"}


def local_sources(row: dict[str, Any]) -> list[dict[str, Any]]:
    urls: set[str] = set()
    for field in ("domain_fit_review_source_refs", "specialization_fit_review_source_refs"):
        for value in row.get(field) or []:
            if isinstance(value, str) and value.startswith(("http://", "https://")):
                urls.add(value)
    out = []
    for url in sorted(urls):
        out.append({"url": url, "publisher": "Checked-in source record", "locator": "URL retained by the current canonical role/area evidence fields.", "access_date": TODAY})
    return out


def external_sources(row: dict[str, Any]) -> list[dict[str, Any]]:
    source = str(row.get("source", "")).casefold()
    keys = ["ESCO", "ILO_ISCO"]
    if source == "onet" or not row.get("esco_code"):
        keys.insert(1, "ONET")
    return [dict(OFFICIAL_SOURCES[k], source_id=k) for k in keys]


def area_records(catalog: dict[str, Any], domain_id: str) -> list[dict[str, Any]]:
    row = next((x for x in catalog.get("domains", []) if x.get("domain_id") == domain_id), {})
    return row.get("areas") or []


def negative_checks(row: dict[str, Any], areas: list[dict[str, Any]], classification: str) -> dict[str, Any]:
    chosen = row.get("specialization_fit_area_key")
    route_keys = {x.get("area_id") for x in (row.get("role_area_routes") or []) if isinstance(x, dict)}
    all_keys = {x.get("area_key") for x in areas if x.get("area_key")}
    return {
        "title_used_as_fit_proof": False,
        "isco_or_esco_membership_used_as_fit_proof": False,
        "subgroup_membership_used_as_fit_proof": False,
        "parent_route_status": row.get("domain_fit_review_status"),
        "parent_remove_link_status": row.get("role_domain_reconciliation_status"),
        "selected_area_key": chosen,
        "stored_area_route_keys": sorted(route_keys),
        "same_domain_area_candidates_without_selected_route": sorted(all_keys - route_keys),
        "negative_neighbour_check": (
            "A route is not promoted merely because an area label or occupational group is similar;"
            " each unselected same-domain area remains an explicit negative-neighbour check."
        ),
        "classification_after_negative_check": classification,
    }


def classify(row: dict[str, Any], is_area_residual: bool) -> tuple[str, str, str | None]:
    parent = row.get("domain_fit_review_status")
    if parent == "unsupported" or row.get("role_domain_reconciliation_status") == "remove_link_only":
        return "unsupported_exact_link", "The recorded task evidence rejects this parent-domain link; no area route can be promoted.", None
    if row.get("specialization_fit_status") == "supported" or row.get("specialization_fit_review_status") == "supported":
        return "supported", "Current exact-key role-task/area-boundary reconciliation already records a supported area route.", row.get("specialization_fit_area_key")
    if row.get("specialization_fit_status") == "direct_domain_role":
        return "direct_domain_role", "The current evidence supports the parent domain but does not justify an area route; retain a direct domain-to-role path.", None
    if row.get("domain_fit_review_status") == "conditional":
        return "conditional", "Parent-domain fit is conditional; retain only with the recorded material, facility, remit, or jurisdiction qualification.", row.get("specialization_fit_area_key")
    if not is_area_residual and row.get("specialization_fit_review_status") == "not_applicable":
        return "direct_domain_role", "The exact role is parent-domain relevant but no distinct area route is established.", None
    return "still_unresolved", "Precise blocker: the role task may support the parent domain, but no independently resolved role-to-area boundary/route is recorded for this exact key. Do not infer one from title, ISCO/ESCO, subgroup, or lexical similarity.", None


def main() -> None:
    first = load(FIRST)
    applied = load(APPLIED)
    catalog = load(CATALOG)
    canonical: dict[str, dict[str, Any]] = {}
    for path in CANONICAL:
        value = load(path)
        rows = value if isinstance(value, list) else value.get("roles", [])
        for row in rows:
            if row.get("domain_id") in DOMAIN_IDS and active(row):
                canonical[role_key(row)] = row

    area_residual_keys = {
        x["role_key"] for x in applied.get("decisions", [])
        if x.get("lane") == "D113_D168" and x.get("proposed_area_status") == "review_required"
    }
    area_residual_keys &= canonical.keys()
    canonical_only_keys = {x["role_key"] for x in first.get("canonical_only_records", []) if x["role_key"] in canonical}
    target_keys = sorted(area_residual_keys | canonical_only_keys)

    first_by_key = {x["role_key"]: x for x in first.get("role_decisions", [])}
    records = []
    for key in target_keys:
        row = canonical[key]
        classification, rationale, selected_area = classify(row, key in area_residual_keys)
        areas = area_records(catalog, row["domain_id"])
        rec = {
            "exact_role_key": key,
            "domain_id": row.get("domain_id"),
            "domain_name": row.get("domain_name"),
            "role_name": row.get("role_name"),
            "source": row.get("source"),
            "queue_membership": {
                "area_residual_406_occurrences": key in area_residual_keys,
                "canonical_only_absent_from_first_pass_ledger": key in canonical_only_keys,
                "deduplicated_overlap": key in area_residual_keys and key in canonical_only_keys,
            },
            "classification": classification,
            "selected_area_key": selected_area,
            "rationale": rationale,
            "task_evidence": {
                "description": row.get("description"),
                "skills": {k: row.get(k) for k in ("essential_skills", "optional_skills") if row.get(k)},
                "first_pass_record_present": key in first_by_key,
                "first_pass_parent_disposition": (first_by_key.get(key) or {}).get("classification"),
            },
            "area_boundaries_considered": [
                {"area_key": a.get("area_key"), "label": a.get("label"), "boundary": a.get("boundary"), "source_urls": a.get("source_urls") or []}
                for a in areas
            ],
            "negative_checks": negative_checks(row, areas, classification),
            "sources": local_sources(row) + external_sources(row),
            "source_date": TODAY,
            "canonical_edit": False,
            "evidence_blocker": None if classification != "still_unresolved" else rationale,
        }
        records.append(rec)

    raw_omissions = []
    dropped = set(first.get("dropped_source_backed_role_keys", []))
    for item in first.get("role_decisions", []):
        if item.get("role_key") not in dropped:
            continue
        raw_omissions.append({
            "exact_role_key": item.get("role_key"),
            "role_name": item.get("role_name"),
            "classification": item.get("classification"),
            "source_backed_omission": True,
            "canonical_present": False,
            "task_evidence": item.get("task_and_scope_evidence", {}).get("task_text"),
            "sources": item.get("task_and_scope_evidence", {}).get("citations", []),
            "negative_checks": item.get("negative_checks", {}),
            "disposition": "raw_source_backed_omission_register_only; no canonical edit proposed",
        })

    counts = Counter(x["classification"] for x in records)
    omission_counts = Counter(x["classification"] for x in raw_omissions)
    payload = {
        "schema_version": "2026-10-07.d113-d168.second-targeted-reconciliation.v1",
        "generated_on": TODAY,
        "scope": "D113-D168 only; exact current canonical role keys absent from first-pass ledger plus 406 area residual occurrences, deduplicated.",
        "policy": "Proposal-only. Task/work evidence and area boundaries are required. Title, ISCO, ESCO and subgroup membership are not fit proof. No canonical files or area reconciler were edited.",
        "counts": {
            "current_canonical_active_rows_in_range": len(canonical),
            "current_canonical_active_unique_keys_in_range": len(canonical),
            "area_residual_occurrences_reported": 406,
            "area_residual_unique_keys": len(area_residual_keys),
            "canonical_only_unique_keys_in_range": len(canonical_only_keys),
            "deduplicated_target_unique_keys": len(target_keys),
            "already_dispositioned_outside_target": len(canonical) - len(target_keys),
            "target_classifications": dict(counts),
            "raw_source_backed_omission_unique_keys": len(raw_omissions),
            "raw_omission_classifications": dict(omission_counts),
            "canonical_edits": 0,
        },
        "source_registry": list(OFFICIAL_SOURCES.values()),
        "records": records,
        "raw_source_backed_omissions": raw_omissions,
        "limitations": [
            "The local gap inventory's 361 figure is not reproduced by the D113-D168 exact-key calculation: the in-range canonical-only set is 321 unique keys. The 406 residual occurrences deduplicate to 405 keys.",
            "The 46 active keys outside this second-pass target already have a current supported or direct-domain disposition and were not reopened.",
            "A still_unresolved record is not an unexamined row: it has an exact task record and a precise missing-evidence blocker, but the available evidence does not justify a role-to-area assignment.",
            "Raw source-backed omissions are reported separately and are not silently re-added to canonical data.",
        ],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    json_path = OUT / "D113_D168_second_pass_reconciliation.json"
    md_path = OUT / "D113_D168_second_pass_reconciliation.md"
    checkpoint_path = OUT / "D113_D168_second_pass_checkpoint.json"
    manifest_path = OUT / "D113_D168_second_pass_manifest.json"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint = {
        "schema_version": payload["schema_version"],
        "status": "COMPLETE_TARGETED_PASS",
        "scope": payload["scope"],
        "completed": ["deduplicated_area_residuals", "canonical_only_exact_keys", "raw_source_backed_omission_register"],
        "next_batch": None,
        "counts": payload["counts"],
        "outputs": [json_path.name, md_path.name, checkpoint_path.name, manifest_path.name, Path(__file__).name],
        "canonical_files_edited": [],
    }
    checkpoint_path.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "schema_version": "2026-10-07.d113-d168.second-targeted-reconciliation-manifest.v1",
        "status": "COMPLETE",
        "scope": payload["scope"],
        "inputs": [str(FIRST.relative_to(ROOT)), str(APPLIED.relative_to(ROOT)), str(CATALOG.relative_to(ROOT)), *[str(p.relative_to(ROOT)) for p in CANONICAL]],
        "outputs": {
            name: {"sha256": hashlib.sha256((OUT / name).read_bytes()).hexdigest(), "bytes": (OUT / name).stat().st_size}
            for name in [json_path.name, md_path.name, checkpoint_path.name, Path(__file__).name]
        },
        "counts": payload["counts"],
        "canonical_files_edited": [],
        "next_batch": None,
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D113-D168 second targeted role reconciliation — 2026-10-07",
        "",
        "Proposal-only result. No canonical role, area, subgroup, or source-reconciler file was edited.",
        "",
        "## Exact-key counts",
        "",
        f"- Current active canonical rows/unique keys in range: **{len(canonical)}**.",
        f"- Area residual occurrences: **406**, deduplicated to **{len(area_residual_keys)}** unique keys.",
        f"- Canonical active keys absent from the D113-D168 first-pass ledger: **{len(canonical_only_keys)}**.",
        f"- Deduplicated second-pass target: **{len(target_keys)}** unique exact keys.",
        f"- Already dispositioned and intentionally not reopened: **{len(canonical) - len(target_keys)}**.",
        f"- Raw source-backed omissions, kept separate: **{len(raw_omissions)}**.",
        "",
        "## Dispositions",
        "",
        "| disposition | unique keys | meaning |",
        "|---|---:|---|",
    ]
    meanings = {
        "supported": "Supported role-to-area route is already recorded from task/area evidence.",
        "conditional": "Parent fit is conditional; remit/material/facility qualification is required.",
        "direct_domain_role": "Parent domain is supported but no distinct area route is justified.",
        "unsupported_exact_link": "Task evidence rejects the exact parent-domain link.",
        "duplicate": "Duplicate source ownership requires deduplication before promotion.",
        "still_unresolved": "Exact blocker recorded; no safe area assignment without stronger task/boundary evidence.",
    }
    for name in ["supported", "conditional", "direct_domain_role", "unsupported_exact_link", "duplicate", "still_unresolved"]:
        lines.append(f"| {name} | {counts.get(name, 0)} | {meanings[name]} |")
    lines += [
        "",
        "## Evidence method",
        "",
        "Each record retains the current role task description/skills, current area boundaries, local source URLs where present, and official ESCO/O*NET/ILO reference URLs with locator, date and limitation. Negative-neighbour checks list same-domain areas that were not selected. No route is inferred from ISCO/ESCO or subgroup membership.",
        "",
        "## Raw omissions",
        "",
        f"The first-pass ledger contains **{len(raw_omissions)}** source-backed role keys that are not current canonical active records. They are listed in JSON with their first-pass classification and evidence, but this pass proposes no automatic re-add.",
        "",
        "Re-run: `python second_pass_d113_d168_targeted_reconciliation.py`.",
    ]
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
