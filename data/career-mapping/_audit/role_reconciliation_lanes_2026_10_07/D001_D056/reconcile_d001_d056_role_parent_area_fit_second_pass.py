"""Second, targeted audit-only pass for residual D001-D056 role routes.

The first ledger is treated as an input, not as a write target. This pass only
reconsiders current, non-excluded exact canonical role keys that were absent
from the first ledger or whose area route remained conditional/review-required.
It never edits canonical role, overlay, domain, or area files.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


TARGET = Path(__file__).resolve().parent
ROOT = TARGET.parents[4]
CAREER = ROOT / "data" / "career-mapping"
TODAY = "2026-10-07"
DOMAIN_IDS = {f"D{i:03d}" for i in range(1, 57)}

FIRST = TARGET / "d001_d056_role_reconciliation_proposals.json"
INPUT_NAMES = [
    "role_library_v3.json",
    "role_library_v3_cleaned.json",
    "thin_domain_role_overlays.json",
    "emerging_role_overlays.json",
    "role_work_profiles.json",
    "domain_meta.json",
    "domain_structure.json",
]

STOPWORDS = {
    "and", "the", "for", "with", "from", "that", "this", "into", "their",
    "within", "across", "where", "which", "will", "using", "used", "use",
    "work", "works", "working", "role", "roles", "area", "areas", "domain",
    "systems", "system", "services", "service", "process", "processes",
    "data", "information", "including", "such", "than", "can", "may", "are",
    "not", "only", "through", "based", "these", "from", "into", "over", "under",
    "their", "them", "they", "have", "has", "being", "current", "specific",
    "provide", "provides", "support", "supports", "develop", "develops", "design",
    "designs", "manage", "manages", "ensure", "ensures", "perform", "performs",
}

EXTERNAL_SOURCES = [
    {
        "source_id": "global_esco_occupations",
        "url": "https://esco.ec.europa.eu/en/classification/occupation_main",
        "locator": "ESCO occupations pillar; occupation descriptions, scope notes, regulatory metadata and relevant knowledge/skills/competences.",
        "accessed_on": TODAY,
        "use": "occupation definition and task/skill corroboration where an ESCO record is present",
    },
    {
        "source_id": "global_esco_api",
        "url": "https://esco.ec.europa.eu/en/use-esco/use-esco-services-api/esco-web-service-api",
        "locator": "ESCO web-service API documentation; stable occupation URI is the record locator.",
        "accessed_on": TODAY,
        "use": "source retrieval/provenance method; not a fit decision by itself",
    },
    {
        "source_id": "global_onet_summary_method",
        "url": "https://www.onetonline.org/help/online/summary",
        "locator": "Summary Report sections for occupation-specific Tasks, Work Activities, Detailed Work Activities, skills and training/credentials.",
        "accessed_on": TODAY,
        "use": "task/work-activity evidence and evidence-type boundary",
    },
    {
        "source_id": "global_onet_database",
        "url": "https://www.onetcenter.org/database.html",
        "locator": "O*NET database landing page and version metadata.",
        "accessed_on": TODAY,
        "use": "source/version provenance",
    },
]


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def key(row: dict[str, Any]) -> str:
    return f"{str(row.get('domain_id', '')).upper()}|{(row.get('role_name') or row.get('role_title') or '').strip()}"


def norm_key(row: dict[str, Any]) -> str:
    return key(row).casefold()


def txt(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return " ".join(txt(v) for v in value)
    if isinstance(value, dict):
        return " ".join(txt(v) for v in value.values())
    return ""


def toks(value: str) -> set[str]:
    return {x for x in re.findall(r"[a-z][a-z0-9+/#.-]{2,}", value.casefold()) if x not in STOPWORDS}


def task_text(row: dict[str, Any], profile: dict[str, Any] | None) -> tuple[str, list[str]]:
    parts: list[str] = []
    fields: list[str] = []
    if profile and profile.get("activities"):
        parts.append(txt(profile["activities"]))
        fields.append("source_profile.activities")
    if profile and profile.get("work_activities"):
        parts.append(txt(profile["work_activities"]))
        fields.append("source_profile.work_activities")
    if not parts and row.get("description"):
        parts.append(str(row["description"]))
        fields.append("role_record.description_fallback")
    return " ".join(parts), fields


def route_refs(row: dict[str, Any], profile: dict[str, Any] | None) -> list[str]:
    refs: list[str] = []
    for field in ("domain_fit_review_source_refs", "specialization_fit_review_source_refs"):
        value = row.get(field)
        if isinstance(value, list):
            refs.extend(str(v) for v in value if v)
    for field in ("role_domain_routes", "role_area_routes"):
        for route in row.get(field) or []:
            if not isinstance(route, dict):
                continue
            ev = route.get("evidence")
            if isinstance(ev, dict) and isinstance(ev.get("source_refs"), list):
                refs.extend(str(v) for v in ev["source_refs"] if v)
    if profile:
        for link in profile.get("source_links") or []:
            if isinstance(link, dict) and link.get("url"):
                refs.append(str(link["url"]))
        if isinstance(profile.get("source"), dict) and profile["source"].get("url"):
            refs.append(str(profile["source"]["url"]))
    return list(dict.fromkeys(refs))


def source_backed(row: dict[str, Any], profile: dict[str, Any] | None) -> bool:
    status = str((profile or {}).get("source_record_status") or "").casefold()
    return status in {"source_backed", "verified", "supported"} or bool(route_refs(row, profile))


def area_routes(row: dict[str, Any]) -> list[dict[str, Any]]:
    return [r for r in (row.get("role_area_routes") or []) if isinstance(r, dict)]


def domain_routes(row: dict[str, Any]) -> list[dict[str, Any]]:
    return [r for r in (row.get("role_domain_routes") or []) if isinstance(r, dict)]


def area_definitions(structure: dict[str, Any], area_id: str | None) -> tuple[dict[str, Any] | None, list[dict[str, Any]]]:
    areas = [a for a in structure.get("areas_of_specialization") or [] if isinstance(a, dict)]
    return next((a for a in areas if a.get("area_id") == area_id), None), areas


def score_area(evidence: str, area: dict[str, Any]) -> tuple[int, list[str], list[str]]:
    ev = toks(evidence)
    definition = f"{area.get('label', '')} {area.get('description', '')} {area.get('boundary', '')}"
    at = toks(definition)
    token_hits = sorted(ev & at)
    phrase_hits: list[str] = []
    for phrase in re.findall(r"[A-Za-z][A-Za-z /&-]{3,}", str(area.get("label") or "")):
        words = [w for w in re.findall(r"[a-z]+", phrase.casefold()) if w not in STOPWORDS]
        if len(words) >= 2 and all(w in ev for w in words):
            phrase_hits.append(" ".join(words))
    return len(token_hits) + 3 * len(phrase_hits), token_hits, phrase_hits


def prior_semantic_basis(row: dict[str, Any]) -> str:
    basis = str(row.get("specialization_fit_review_basis") or "")
    # The first sentence(s) before the 2026-10-07 gate is the prior semantic
    # record. The gate itself is not evidence.
    for marker in ("Role-agent exact-key area review", "Local reconciliation of D001_D056"):
        if marker in basis:
            basis = basis.split(marker, 1)[0]
    return basis.strip()


def explicit_task_anchor(basis: str) -> bool:
    low = basis.casefold()
    markers = ("task description explicitly", "sourced task", "sourced tasks", "sourced duties", "source tasks", "source-backed task", "task centers", "directly matching", "directly match")
    return any(marker in low for marker in markers)


def build_decision(row: dict[str, Any], profile: dict[str, Any] | None, structure: dict[str, Any], first: dict[str, Any] | None, domain_meta: dict[str, Any] | None = None) -> dict[str, Any]:
    did = str(row.get("domain_id", "")).upper()
    evidence, evidence_fields = task_text(row, profile)
    refs = route_refs(row, profile)
    area = next((r for r in area_routes(row) if str(r.get("status") or "").casefold() in {"conditional", "review_required", "external-review", "unresolved"}), None)
    area_id = str((area or {}).get("area_id") or row.get("specialization_fit_area_key") or "") or None
    candidate, areas = area_definitions(structure, area_id)
    parent_status = str(row.get("domain_fit_review_status") or "").casefold()
    parent_routes = domain_routes(row)
    parent_excluded = row.get("student_path_status") == "excluded"
    prior_basis = prior_semantic_basis(row)

    scores = []
    for item in areas:
        score, hits, phrases = score_area(evidence, item)
        scores.append({"area_id": item.get("area_id"), "label": item.get("label"), "score": score, "token_hits": hits, "phrase_hits": phrases})
    scores.sort(key=lambda x: (-x["score"], str(x["area_id"])))
    chosen = next((x for x in scores if x["area_id"] == area_id), None)
    neighbour_scores = [x for x in scores if x["area_id"] != area_id]
    strongest_neighbour = neighbour_scores[0] if neighbour_scores else None
    margin = (chosen["score"] - strongest_neighbour["score"]) if chosen and strongest_neighbour else None
    area_authority = bool(candidate and candidate.get("source_references"))
    # The exact row's parent-domain status is authoritative for this route.
    # A supported secondary route to another domain must not override a
    # conditional or unsupported primary route for the current domain.
    exact_routes = [r for r in parent_routes if str(r.get("domain_id", did)).upper() == did]
    exact_primary = [r for r in exact_routes if str(r.get("route_type") or "primary").casefold() == "primary"]
    exact_statuses = {str(r.get("status") or "").casefold() for r in (exact_primary or exact_routes)}
    parent_unsupported = parent_status == "unsupported" or "unsupported" in exact_statuses
    parent_conditional = (not parent_unsupported) and (parent_status in {"conditional", "review_required", "unresolved"} or bool(exact_statuses & {"conditional", "review_required", "unresolved"}))
    parent_supported = (not parent_unsupported) and (not parent_conditional) and (parent_status in {"supported", "reviewed_supported"} or "supported" in exact_statuses)
    if parent_excluded and not parent_supported:
        parent_unsupported = True

    if parent_unsupported:
        final = "unsupported"
        remit = "Exact parent-domain link is not exposed; role evidence must not be used to create an area route under this domain."
    elif not candidate or not area_authority:
        final = "direct-domain-role" if parent_supported else "external-review"
        remit = ("Parent-domain route may remain direct only; no authoritative area definition/source anchor was available for a defensible area route."
                 if parent_supported else
                 "Parent-domain route remains conditional and no authoritative area anchor is available; no student route is promoted.")
    elif not evidence.strip() or not refs:
        final = "conditional" if parent_supported else "external-review"
        remit = "Area fit remains conditional because role task evidence or source provenance is incomplete."
    elif parent_conditional:
        final = "conditional"
        remit = "Area route cannot outrun the unresolved/conditional parent-domain gate."
    elif chosen and chosen["score"] >= 4 and (margin is None or margin >= 2) and (explicit_task_anchor(prior_basis) or chosen["phrase_hits"]):
        final = "supported"
        remit = "Unique role-task to area-boundary match; no neighboring area scored as strongly, and the parent-domain gate is supported."
    elif chosen and chosen["score"] >= 2 and (margin is None or margin >= 1):
        final = "conditional"
        remit = "Candidate area is plausible but the task/boundary signal is not sufficiently unique for automatic promotion."
    else:
        final = "conditional"
        remit = "Role has parent-domain evidence but the candidate area is broad or overlaps a neighboring area; retain a qualified route."

    if final == "supported" and not parent_supported:
        final = "conditional"
        remit = "Parent-domain support is a prerequisite; area evidence cannot override a conditional gate."

    area_source_refs = []
    if candidate:
        for source in candidate.get("source_references") or []:
            if isinstance(source, dict):
                area_source_refs.append({
                    "source_id": source.get("source_id"),
                    "url": source.get("url"),
                    "locator": source.get("locator"),
                    "accessed_on": None,
                    "date_status": "inherited_local_area_catalog_record",
                })
    secondary_domain_routes = [r for r in parent_routes if str(r.get("route_type") or "").casefold() == "secondary"]
    secondary_area_routes = [r for r in area_routes(row) if str(r.get("route_type") or "").casefold() == "secondary"]

    return {
        "role_key": key(row),
        "domain_id": did,
        "domain_name": row.get("domain_name"),
        "parent_domain_definition": (domain_meta or {}).get("description"),
        "role_name": row.get("role_name"),
        "first_pass_status": (first or {}).get("proposal_status"),
        "first_pass_key_present": first is not None,
        "parent_domain_disposition": "unsupported" if parent_unsupported else ("conditional" if parent_conditional else ("supported" if parent_supported else "external-review")),
        "area_candidate_id": area_id,
        "area_candidate_label": (candidate or {}).get("label"),
        "area_candidate_boundary": (candidate or {}).get("boundary"),
        "area_source_references": area_source_refs,
        "disposition": final,
        "route_shape": (
            "direct_domain_to_role" if final == "direct-domain-role" else
            "domain_to_area_to_role" if area_id else
            "unresolved"
        ),
        "remit": remit,
        "source_backed": source_backed(row, profile),
        "task_evidence_fields": evidence_fields,
        "source_refs": refs,
        "source_locators": [{"source_ref": ref, "locator": ref, "accessed_on": None, "date_status": "inherited_local_record; external_source_register_access_date_applies_only_to_sources_consulted_in_this_pass"} for ref in refs],
        "prior_semantic_basis": prior_basis,
        "parent_route_statuses": [r.get("status") for r in parent_routes],
        "secondary_domain_routes_preserved": [
            {"domain_id": r.get("domain_id"), "status": r.get("status"), "route_type": r.get("route_type"), "evidence": r.get("evidence")}
            for r in secondary_domain_routes
        ],
        "secondary_area_routes_preserved": [
            {"area_id": r.get("area_id"), "status": r.get("status"), "route_type": r.get("route_type"), "evidence": r.get("evidence")}
            for r in secondary_area_routes
        ],
        "current_area_route_status": (area or {}).get("status"),
        "candidate_area_score": chosen,
        "negative_neighbour_check": {
            "neighbour_area_count": len(neighbour_scores),
            "strongest_neighbour": strongest_neighbour,
            "candidate_minus_strongest_neighbour": margin,
            "neighbour_tie": bool(chosen and strongest_neighbour and chosen["score"] == strongest_neighbour["score"]),
            "negative_check_passed": bool(chosen and (strongest_neighbour is None or chosen["score"] > strongest_neighbour["score"])),
        },
        "proof_exclusions": {
            "title_used_as_proof": False,
            "isco_used_as_proof": False,
            "subgroup_membership_used_as_proof": False,
            "parent_gate_overridden": False,
        },
        "canonical_change": False,
        "canonical_files_edited": [],
    }


def main() -> None:
    first = read(FIRST)
    first_map = {r["role_key"].casefold(): r for r in first.get("role_records", [])}
    clean = read(CAREER / "role_library_v3_cleaned.json")
    thin = read(CAREER / "thin_domain_role_overlays.json").get("roles", [])
    emerging = read(CAREER / "emerging_role_overlays.json").get("roles", [])
    profiles = read(CAREER / "role_work_profiles.json").get("profiles", [])
    structure = read(CAREER / "domain_structure.json")
    domain_meta = read(CAREER / "domain_meta.json")
    profile_map = {(str(p.get("domain_id", "")).upper() + "|" + str(p.get("role_name", "")).strip()).casefold(): p for p in profiles}

    current: dict[str, dict[str, Any]] = {}
    excluded_keys: set[str] = set()
    canonical_union_keys: set[str] = set()
    for row in clean + thin + emerging:
        did = str(row.get("domain_id", "")).upper()
        if did not in DOMAIN_IDS:
            continue
        canonical_union_keys.add(norm_key(row))
        if row.get("student_path_status") == "excluded":
            excluded_keys.add(norm_key(row))
            continue
        current.setdefault(norm_key(row), row)

    residual: list[dict[str, Any]] = []
    skipped_supported: list[str] = []
    for nk, row in sorted(current.items()):
        first_row = first_map.get(nk)
        area_status = str(row.get("specialization_fit_status") or "").casefold()
        area_route_statuses = {str(r.get("status") or "").casefold() for r in area_routes(row)}
        residual_area = area_status in {"conditional", "review_required", "external-review", "unresolved"} or bool(area_route_statuses & {"conditional", "review_required", "external-review", "unresolved"})
        if first_row is not None and not residual_area and first_row.get("proposal_status") == "supported":
            skipped_supported.append(key(row))
            continue
        profile = profile_map.get(nk)
        residual.append(build_decision(row, profile, structure.get(str(row.get("domain_id")).upper(), {}), first_row, domain_meta.get(str(row.get("domain_id")).upper(), {})))

    raw = read(CAREER / "role_library_v3.json")
    current_keys = set(current)
    raw_candidates = []
    for row in raw:
        if str(row.get("domain_id", "")).upper() not in DOMAIN_IDS:
            continue
        if norm_key(row) in canonical_union_keys:
            continue
        if str(row.get("source") or "").casefold() not in {"esco", "onet", "esco/onet", "ilo", "global_esco", "global_onet"}:
            continue
        profile = profile_map.get(norm_key(row))
        raw_candidates.append({
            "role_key": key(row),
            "domain_id": str(row.get("domain_id")).upper(),
            "role_name": row.get("role_name"),
            "raw_source": row.get("source"),
            "classification": "external-review",
            "reason": "Source-backed raw role is omitted from current canonical union; no canonical role route is created in this audit-only pass.",
            "task_evidence_available": bool((profile or {}).get("activities") or row.get("description")),
            "source_refs": route_refs(row, profile),
            "source_locators": [{"source_ref": ref, "locator": ref, "accessed_on": None, "date_status": "inherited_local_record"} for ref in route_refs(row, profile)],
            "canonical_change": False,
            "canonical_files_edited": [],
        })

    decisions = Counter(x["disposition"] for x in residual)
    parent = Counter(x["parent_domain_disposition"] for x in residual)
    routes = Counter(x["route_shape"] for x in residual)
    negative = Counter("passed" if x["negative_neighbour_check"]["negative_check_passed"] else "failed_or_tied" for x in residual)
    secondary_domain_routes_preserved = sum(len(x["secondary_domain_routes_preserved"]) for x in residual)
    secondary_area_routes_preserved = sum(len(x["secondary_area_routes_preserved"]) for x in residual)
    active_absent_first = sorted(nk for nk in current if nk not in first_map)
    inputs = [{"path": str((CAREER / name).relative_to(ROOT)), "sha256": sha(CAREER / name)} for name in INPUT_NAMES]
    output = {
        "schema_version": "2026-10-07.role-parent-area-reconciliation.second-pass.v1",
        "workstream": "A-second-pass",
        "scope": "D001-D056 current non-excluded exact canonical role keys",
        "generated_on": TODAY,
        "audit_only": True,
        "canonical_files_edited": [],
        "classification_enum": ["supported", "conditional", "direct-domain-role", "unsupported", "duplicate", "external-review"],
        "policy": {
            "reconsider_only_residual_keys": True,
            "already_supported_decisions_repeated": False,
            "task_work_activity_evidence_required": True,
            "title_isco_subgroup_not_proof": True,
            "area_boundary_required_for_area_support": True,
            "parent_domain_gate_precedes_area_route": True,
            "negative_neighbour_check_required": True,
            "multiple_routes_preserved": True,
            "excluded_exact_links_not_reactivated": True,
            "raw_omissions_separate_from_canonical_decisions": True,
        },
        "external_sources_consulted": EXTERNAL_SOURCES,
        "input_hashes": inputs,
        "counts": {
            "current_non_excluded_unique_keys": len(current),
            "active_keys_absent_from_first_ledger": len(active_absent_first),
            "first_pass_supported_skipped": len(skipped_supported),
            "second_pass_residual_unique_keys": len(residual),
            "second_pass_dispositions": dict(decisions),
            "parent_dispositions": dict(parent),
            "route_shapes": dict(routes),
            "negative_neighbour_checks": dict(negative),
            "excluded_exact_canonical_keys_preserved_out_of_scope": len(excluded_keys),
            "unsupported_exact_links_in_active_residual": sum(1 for x in residual if x["disposition"] == "unsupported"),
            "secondary_domain_routes_preserved": secondary_domain_routes_preserved,
            "secondary_area_routes_preserved": secondary_area_routes_preserved,
            "raw_source_backed_omitted_candidates": len(raw_candidates),
        },
        "residual_decisions": residual,
        "source_backed_raw_omitted_candidates": raw_candidates,
        "skipped_already_supported_role_keys": skipped_supported,
        "active_keys_absent_from_first_ledger": active_absent_first,
    }
    write(TARGET / "d001_d056_role_reconciliation_second_pass.json", output)
    manifest = {k: v for k, v in output.items() if k not in {"residual_decisions", "source_backed_raw_omitted_candidates", "skipped_already_supported_role_keys"}}
    write(TARGET / "d001_d056_role_reconciliation_second_pass_manifest.json", manifest)

    lines = [
        "# D001–D056 second-pass role reconciliation checkpoint",
        "",
        f"Generated {TODAY}. Audit-only; no canonical files were edited.",
        "",
        "## Scope",
        "",
        f"The pass assessed {len(residual)} unique non-excluded exact canonical role keys that remained area-conditional/review-required or were absent from the first ledger. Already-supported first-pass decisions were skipped. Excluded exact links were not reactivated.",
        "",
        "## Results",
        "",
        f"- Current non-excluded unique keys: {len(current)}.",
        f"- Already-supported keys skipped: {len(skipped_supported)}.",
        f"- Residual keys assessed: {len(residual)}.",
        f"- Dispositions: `{json.dumps(dict(decisions), sort_keys=True)}`.",
        f"- Parent-domain dispositions: `{json.dumps(dict(parent), sort_keys=True)}`.",
        f"- Route shapes: `{json.dumps(dict(routes), sort_keys=True)}`.",
        f"- Negative-neighbour checks: `{json.dumps(dict(negative), sort_keys=True)}`.",
        f"- Source-backed raw roles omitted from canonical: {len(raw_candidates)} separate candidates; none reintroduced.",
        "",
        "## Interpretation",
        "",
        "`supported` means a unique role-task/area-boundary match with a supported parent-domain gate and no stronger neighboring area. `conditional` means the role has a plausible area route but needs an explicit remit or stronger evidence; it is not presented as an unconditional fit. `direct-domain-role` is reserved for a supported parent-domain role with no defensible area route. `unsupported` preserves a negative exact-link decision. `external-review` means the source or boundary evidence is not sufficient in the local/external set. Titles, ISCO codes and subgroup membership are never proof.",
        "",
        "## Reproduction",
        "",
        "Run `reconcile_d001_d056_role_parent_area_fit_second_pass.py`. It rewrites only the second-pass artifacts in this folder.",
        "",
        "## External source register",
        "",
    ]
    for source in EXTERNAL_SOURCES:
        lines.append(f"- `{source['source_id']}` — {source['url']} — locator: {source['locator']} — accessed {source['accessed_on']}.")
    (TARGET / "d001_d056_role_reconciliation_second_pass_checkpoint.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(output["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
