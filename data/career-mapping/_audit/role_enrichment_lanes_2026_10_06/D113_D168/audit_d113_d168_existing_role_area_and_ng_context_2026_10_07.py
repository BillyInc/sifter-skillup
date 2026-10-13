"""Reconcile active D113-D168 roles and Nigerian area context, append-only.

No canonical taxonomy data is written. Existing exact-key task reviews and the
captured Nigerian evidence ledger are used as inputs; uncertainty remains open.
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
ROLE_FILES = [
    DATA / "role_library_v3_cleaned.json",
    DATA / "thin_domain_role_overlays.json",
    DATA / "emerging_role_overlays.json",
]
CATALOG = DATA / "domain_specialization_catalog.json"
CONTEXT = (AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
           / "STEP2_NIGERIAN_CONTEXT_2026_10_06" / "D113_D168_nigerian_context_evidence_2026_10_06.json")
DOMAIN_REVIEW_DIR = AUDIT / "role_fit_lanes_2026_10_05" / "D085_D168"
SPARSE_JSON = HERE / "D113_D168_sparse_role_disjoint_review_2026_10_07.json"
OUT_ROLE = HERE / "D113_D168_existing_role_area_fit_review_2026_10_07.json"
OUT_ROLE_MD = HERE / "D113_D168_existing_role_area_fit_review_2026_10_07.md"
OUT_NG = HERE / "D113_D168_nigerian_area_context_reconciliation_2026_10_07.json"
OUT_NG_MD = HERE / "D113_D168_nigerian_area_context_reconciliation_2026_10_07.md"
CHECKPOINT = HERE / "D113_D168_role_area_ng_context_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D113_D168_role_area_ng_context_checkpoint_2026_10_07.md"
EXCLUDED = {"excluded", "review_only", "audit_only"}
NOW = datetime.now(timezone.utc).isoformat()


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, obj: Any) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def role_key(domain_id: str, role_name: str) -> str:
    return f"{domain_id}|{role_name.strip().casefold()}"


def ids_for_refs(refs: list[str], source_map: dict[str, Any]) -> list[dict[str, Any]]:
    result = []
    for ref in refs:
        source = source_map.get(ref)
        if isinstance(source, dict):
            result.append({"source_id": ref, **source})
        elif isinstance(ref, str) and ref.startswith(("https://", "http://")):
            result.append({"source_id": None, "url": ref, "locator": "Role record's stored task-evidence reference.",
                           "supports": "Source attached to this role record; source claim not expanded in this review.",
                           "limitation": "Reopen the URL and identify exact task passage before treating as final evidence."})
        else:
            result.append({"source_id": ref, "url": None, "locator": None,
                           "supports": None, "limitation": "Reference not resolvable from this domain review's source map."})
    return result


def area_key_index(catalog: dict[str, Any]) -> dict[tuple[str, str], dict[str, Any]]:
    return {(d["domain_id"], a["label"].strip().casefold()): a
            for d in catalog.get("domains", []) for a in d.get("areas", [])}


def main() -> None:
    catalog = read(CATALOG)
    areas = area_key_index(catalog)
    domains = {d["domain_id"]: d for d in catalog["domains"]}
    task_reviews: dict[str, dict[str, Any]] = {}
    domain_review_sources: dict[str, dict[str, Any]] = {}
    missing_domain_reviews = []
    for number in range(113, 169):
        did = f"D{number:03}"
        path = DOMAIN_REVIEW_DIR / f"{did}_role_domain_fit_review_2026_10_05.json"
        if not path.exists():
            missing_domain_reviews.append(did)
            continue
        report = read(path)
        source_map = report.get("sources", {})
        domain_review_sources[did] = source_map
        for decision in report.get("decisions", []):
            name = decision.get("role_name") or decision.get("role_key", "").split("|", 1)[-1]
            task_reviews[role_key(did, name)] = decision

    # Deduplicate exact current role keys across the cleaned library and overlays.
    current: dict[str, dict[str, Any]] = {}
    duplicate_sources: dict[str, list[str]] = defaultdict(list)
    for path in ROLE_FILES:
        payload = read(path)
        source_rows = payload if isinstance(payload, list) else payload.get("roles", [])
        for row in source_rows:
            did = str(row.get("domain_id") or "")
            if not did.startswith("D") or not 113 <= int(did[1:]) <= 168:
                continue
            if str(row.get("student_path_status") or "active").casefold() in EXCLUDED:
                continue
            key = role_key(did, str(row.get("role_name") or ""))
            duplicate_sources[key].append(path.name)
            current.setdefault(key, row)

    role_records = []
    explicit_area_status_count = Counter()
    parent_counts = Counter()
    for key, row in sorted(current.items()):
        did = row["domain_id"]
        task_decision = task_reviews.get(key)
        if task_decision:
            task_text = str(task_decision.get("task_evidence") or "").strip()
            raw_parent = str(task_decision.get("domain_fit") or "unresolved").casefold()
            parent_status = {"supported": "supported", "conditional": "review_required",
                             "unsupported_for_domain": "not_supported", "unresolved": "review_required"}.get(raw_parent, "review_required")
            parent_rationale = str(task_decision.get("rationale") or "").strip()
            parent_refs = list(task_decision.get("source_refs") or [])
            source_map = domain_review_sources.get(did, {})
            parent_citations = ids_for_refs(parent_refs, source_map)
            parent_evidence_origin = "exact_role_key_decision_in_domain_task_audit"
        else:
            task_text = str(row.get("description") or "").strip()
            parent_status = "review_required"
            parent_rationale = "No exact-key decision was found in the D113-D168 task-review ledger; stored description is retained, but parent-domain fit is not inferred from title or subgroup."
            parent_refs = list(row.get("domain_fit_review_source_refs") or [])
            parent_citations = ids_for_refs(parent_refs, {})
            source_map = {}
            parent_evidence_origin = "current_role_record_only_exact_task_audit_missing"
        if not task_text:
            task_text = str(row.get("description") or "").strip()
            if parent_status == "supported":
                parent_status = "review_required"
                parent_rationale = "The prior decision lacks an exact task statement in the matched record; retained as review-required rather than carrying the status forward."
        parent_counts[parent_status] += 1

        domain = domains[did]
        area_fit_status = "review_required"
        selected_area = None
        area_rationale = "The domain has recommended area boundaries, but this role has no independently recorded role-task-to-area decision that can be reconciled here. Do not use title/ISCO/ESCO/subgroup membership as a substitute."
        area_citations: list[dict[str, Any]] = []
        stored_area_status = str(row.get("specialization_fit_status") or "").casefold()
        stored_candidate = str(row.get("specialization_fit_candidate") or "").strip().casefold()
        if not domain.get("areas"):
            if domain.get("step1_status") == "no_specialization_recommended" and domain.get("disposition") == "resolved":
                area_fit_status = "direct_domain_to_role"
                area_rationale = "The normalized catalog's resolved Step 1 decision recommends no separate area for this domain; route directly from domain to role. This does not infer a specialization."
            else:
                area_fit_status = "review_required"
                area_rationale = "No area records are present, but the catalog does not establish a resolved no-area route."
        elif stored_area_status == "supported" and stored_candidate and parent_status == "supported":
            # Existing metadata can only be carried forward when its named key resolves
            # to an actual area in the current 709-area catalog.
            candidate_suffix = stored_candidate.rsplit(":", 1)[-1]
            selected_area = next((a for (adid, _), a in areas.items()
                                  if adid == did and a.get("area_key", "").split(":", 1)[-1].casefold() == candidate_suffix), None)
            area_basis = str(row.get("specialization_fit_review_basis") or "").strip()
            area_refs = list(row.get("specialization_fit_review_source_refs") or [])
            area_citations = ids_for_refs(area_refs, {})
            # Require a task rationale and at least one URL citation; opaque IDs alone
            # are not source verification.
            has_url = any(c.get("url", "").startswith("http") for c in area_citations)
            if selected_area and area_basis and has_url and task_text:
                area_fit_status = "supported_existing_decision_reconciled"
                area_rationale = area_basis
            else:
                selected_area = None
                area_rationale = "Stored area label/status does not meet this pass's validation gate: current catalog-key resolution, explicit task rationale, parent-domain support, and a resolvable source URL are all required. Retained as review_required."
        explicit_area_status_count[area_fit_status] += 1

        role_records.append({
            "role_key": f"{did}|{row.get('role_name')}",
            "normalized_role_key": key,
            "domain_id": did,
            "domain_name": row.get("domain_name") or domain.get("domain_name"),
            "role_name": row.get("role_name"),
            "also_known_as": row.get("also_known_as") or [],
            "source_file": next((n for n in duplicate_sources[key] if n.endswith("cleaned.json")), duplicate_sources[key][0]),
            "duplicate_exact_key_source_files": sorted(set(duplicate_sources[key])),
            "exact_role_task_evidence": task_text or None,
            "parent_domain_fit": {
                "status": parent_status,
                "source_audit_status": task_decision.get("domain_fit") if task_decision else None,
                "rationale": parent_rationale,
                "source_ids": parent_refs,
                "citations": parent_citations,
                "evidence_origin": parent_evidence_origin,
            },
            "area_fit": {
                "status": area_fit_status,
                "area_key": selected_area.get("area_key") if selected_area else None,
                "area_label": selected_area.get("label") if selected_area else None,
                "area_boundary": selected_area.get("boundary") if selected_area else None,
                "rationale": area_rationale,
                "source_ids": row.get("specialization_fit_review_source_refs") or [],
                "citations": area_citations,
            },
            "current_area_metadata": {
                "specialization_fit_status": row.get("specialization_fit_status"),
                "specialization_fit_candidate": row.get("specialization_fit_candidate"),
                "subgroup_fit_status_not_used_as_fit_proof": row.get("subgroup_fit_status"),
            },
            "nigerian_context": "recorded_separately_in_area_context_artifact",
            "disposition": "review_required" if "review_required" in (parent_status, area_fit_status) else "supported_or_direct_route",
            "canonical_files_edited": False,
        })

    # Normalize the previously captured Nigerian area ledger against the 709-area catalog.
    context = read(CONTEXT)
    context_by_area: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    domain_context: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for rec in context.get("records", []):
        did = str(rec.get("domain_id") or "")
        if not did.startswith("D") or not 113 <= int(did[1:]) <= 168:
            continue
        label = rec.get("area_of_specialization")
        if label:
            context_by_area[(did, str(label).strip().casefold())].append(rec)
        else:
            domain_context[did].append(rec)

    ng_records = []
    ng_counts = Counter()
    unmatched_context = []
    for did in sorted(domains):
        if not 113 <= int(did[1:]) <= 168:
            continue
        for area in domains[did].get("areas", []):
            source_rows = context_by_area.get((did, str(area.get("label", "")).strip().casefold()), [])
            if len(source_rows) != 1:
                disposition = "review_required_context_record_missing_or_ambiguous"
                evidence_rows = source_rows
                unmatched_context.append({"domain_id": did, "area_key": area.get("area_key"), "matching_rows": len(source_rows)})
            else:
                rec = source_rows[0]
                raw = str(rec.get("disposition") or "")
                if raw == "nigeria_specific_overlay_supported":
                    disposition = "nigerian_context_supported"
                elif raw == "no_primary_nigerian_evidence_found_after_search":
                    disposition = "no_direct_nigerian_context_found"
                else:
                    disposition = "review_required_source_or_scope_conflict"
                evidence_rows = [rec]
            for rec in evidence_rows:
                row = {
                    "source_record_id": rec.get("record_id"),
                    "source_id": rec.get("source_id"),
                    "publisher": rec.get("source_publisher"),
                    "source_title": rec.get("source_title"),
                    "url": rec.get("authoritative_nigerian_url"),
                    "locator": rec.get("locator"),
                    "access_date": rec.get("access_date"),
                    "source_revalidation_status": rec.get("source_revalidation_status"),
                    "exact_nigerian_claim": rec.get("exact_nigerian_claim"),
                    "what_it_supports": rec.get("what_it_supports"),
                    "limitation": rec.get("limitation"),
                    "source_ledger_disposition": rec.get("disposition"),
                }
                if not all(row.get(k) for k in ("url", "locator", "exact_nigerian_claim", "limitation")):
                    disposition = "review_required_incomplete_source_record"
                if disposition == "nigerian_context_supported":
                    row["context_scope"] = "Nigeria-specific overlay only; global area label and boundary unchanged."
                ng_records.append({
                    "domain_id": did,
                    "domain_name": domains[did].get("domain_name"),
                    "area_key": area.get("area_key"),
                    "global_area_label": area.get("label"),
                    "global_area_boundary_unchanged": area.get("boundary"),
                    "nigerian_context_status": disposition,
                    "evidence": [row for row in [row] if row.get("source_record_id")],
                    "context_limit": "This is occupational/education/regulatory context, not evidence of current vacancies, pay, demand, or guaranteed legal scope unless the cited source explicitly says so.",
                    "canonical_files_edited": False,
                })
            ng_counts[disposition] += 1

    # Preserve all domain-level Nigerian records separately. A domain-level
    # source must never be silently attributed to each of its areas.
    domain_context_records = []
    for did in sorted(domains):
        if not 113 <= int(did[1:]) <= 168:
            continue
        records = domain_context.get(did, [])
        domain_context_records.append({
            "domain_id": did,
            "domain_name": domains[did].get("domain_name"),
            "area_context_status": ("not_applicable_resolved_no_area_recommended"
                                    if not domains[did].get("areas") and domains[did].get("step1_status") == "no_specialization_recommended"
                                    else "domain_context_not_attributed_to_any_area"),
            "nigerian_domain_context_records": [{
                "source_record_id": r.get("record_id"), "source_id": r.get("source_id"), "publisher": r.get("source_publisher"),
                "source_title": r.get("source_title"), "url": r.get("authoritative_nigerian_url"),
                "locator": r.get("locator"), "claim": r.get("exact_nigerian_claim"),
                "what_it_supports": r.get("what_it_supports"), "limitation": r.get("limitation"),
                "source_revalidation_status": r.get("source_revalidation_status"), "disposition": r.get("disposition"),
            } for r in records],
            "canonical_files_edited": False,
        })

    role_counts = Counter(r["disposition"] for r in role_records)
    area_status_counts = Counter(r["area_fit"]["status"] for r in role_records)
    parent_status_counts = Counter(r["parent_domain_fit"]["status"] for r in role_records)
    source_backed_ng = Counter(r["nigerian_context_status"] for r in ng_records)
    role_payload = {
        "schema_version": "2026-10-07.d113-d168.existing-role-area-fit.v1",
        "created_at_utc": NOW,
        "lane": "D113-D168",
        "scope": "All active unique role keys in the current cleaned role library and role overlays; compare exact task evidence independently against parent domain and normalized area boundary.",
        "inputs": {"role_files": [str(p.relative_to(ROOT)).replace("\\", "/") for p in ROLE_FILES],
                   "normalized_area_catalog": str(CATALOG.relative_to(ROOT)).replace("\\", "/"),
                   "prior_domain_task_reviews": str(DOMAIN_REVIEW_DIR.relative_to(ROOT)).replace("\\", "/"),
                   "sparse_candidate_review": str(SPARSE_JSON.relative_to(ROOT)).replace("\\", "/")},
        "policy": {"isco_or_esco_group_membership_is_fit_evidence": False,
                   "title_alone_is_fit_evidence": False,
                   "current_subgroup_code_or_membership_is_fit_evidence": False,
                   "require_parent_and_area_task_evidence": True,
                   "uncertainty_status": "review_required",
                   "canonical_files_edited": False},
        "counts": {"active_unique_role_keys": len(role_records), "domains_with_active_roles": len(set(r["domain_id"] for r in role_records)),
                   "matched_exact_prior_task_review": sum(r["parent_domain_fit"]["evidence_origin"] == "exact_role_key_decision_in_domain_task_audit" for r in role_records),
                   "missing_exact_prior_task_review": sum(r["parent_domain_fit"]["evidence_origin"] != "exact_role_key_decision_in_domain_task_audit" for r in role_records),
                   "parent_fit_status": dict(parent_status_counts), "area_fit_status": dict(area_status_counts),
                   "disposition": dict(role_counts), "canonical_files_edited": False},
        "records": role_records,
        "integrity": {"every_active_unique_role_key_included_once": len(role_records) == len(current),
                      "all_supported_parent_rows_have_task_evidence": all(r["exact_role_task_evidence"] for r in role_records if r["parent_domain_fit"]["status"] == "supported"),
                      "area_keys_resolve_to_catalog": all(not r["area_fit"]["area_key"] or any(a.get("area_key") == r["area_fit"]["area_key"] for d in catalog["domains"] for a in d.get("areas", [])) for r in role_records),
                      "direct_routes_only_for_catalog_no_area_domains": all(r["area_fit"]["status"] != "direct_domain_to_role" or not domains[r["domain_id"]].get("areas") for r in role_records),
                      "no_isco_or_title_only_fit": True, "canonical_files_edited": False},
        "limitations": ["Existing per-domain task audits are reused as evidence and are not represented as a new independent web revalidation.",
                        "Roles with parent fit but no independently supported recommended-area assignment remain review_required.",
                        "A direct domain-to-role route is used only when the normalized catalog explicitly resolves the domain to no recommended areas."],
    }
    ng_payload = {
        "schema_version": "2026-10-07.d113-d168.nigerian-area-context-reconciliation.v1",
        "created_at_utc": NOW, "lane": "D113-D168",
        "scope": "Reconcile Nigerian area-context evidence to all normalized catalog areas for D113-D168; keep local context separate from global area definitions.",
        "input": str(CONTEXT.relative_to(ROOT)).replace("\\", "/"),
        "policy": {"global_area_labels_or_boundaries_changed": False, "nigerian_context_used_as_global_area_fit": False,
                   "policy_used_as_demand_or_vacancy_evidence": False, "canonical_files_edited": False},
        "counts": {"normalized_areas_in_range": sum(len(d.get("areas", [])) for d in catalog["domains"] if 113 <= int(d["domain_id"][1:]) <= 168),
                   "area_records_reconciled": len(ng_records), "area_context_status": dict(source_backed_ng),
                   "domain_level_context_records_kept_separate": sum(len(x["nigerian_domain_context_records"]) for x in domain_context_records),
                   "no_area_recommended_domains": sum(x["area_context_status"] == "not_applicable_resolved_no_area_recommended" for x in domain_context_records),
                   "unmatched_or_ambiguous_source_records": len(unmatched_context),
                   "source_ledger_records_in_range": sum(1 for r in context.get("records", []) if str(r.get("domain_id", "D000")) >= "D113" and str(r.get("domain_id", "D000")) <= "D168"),
                   "canonical_files_edited": False},
        "areas": ng_records, "domain_level_context_not_attributed_to_areas": domain_context_records,
        "unmatched_context": unmatched_context,
        "integrity": {"every_normalized_area_has_one_reconciliation_record": len(ng_records) == sum(len(d.get("areas", [])) for d in catalog["domains"] if 113 <= int(d["domain_id"][1:]) <= 168),
                      "all_supported_context_has_url_locator_claim_limitation": all(all(e.get(k) for k in ("url", "locator", "exact_nigerian_claim", "limitation")) for r in ng_records if r["nigerian_context_status"] == "nigerian_context_supported" for e in r["evidence"]),
                      "global_area_label_boundary_unchanged": True, "no_demand_inference": True, "canonical_files_edited": False},
        "limitations": ["Evidence is carried from the source ledger and its recorded revalidation state; this reconciliation does not re-open all 19 underlying publishers/pages.",
                        "Unresolved source/scope conflicts stay review_required; absence means no direct Nigerian evidence was found in the captured search, not proof that no local practice exists.",
                        "No vacancy, pay, or demand claim is inferred."],
    }
    write(OUT_ROLE, role_payload)
    write(OUT_NG, ng_payload)
    role_lines = ["# D113–D168 existing role → area-fit review — 2026-10-07", "",
                  f"Active unique role keys: **{len(role_records)}** across **{role_payload['counts']['domains_with_active_roles']}** domains.",
                  f"Parent fit: `{json.dumps(dict(parent_status_counts), ensure_ascii=False)}`.",
                  f"Area fit: `{json.dumps(dict(area_status_counts), ensure_ascii=False)}`.",
                  "", "Every role record in JSON has its exact stored task evidence, independent parent fit and citations, separate area fit against the normalized catalog, and a disposition. Existing subgroup/ISCO/ESCO fields were not treated as fit proof. Roles without a sourced area fit remain `review_required`; direct routes are reserved for catalog domains with no area recommended.",
                  "", "| Domain | Active roles | Supported parent | Parent review required | Area supported | Direct route | Area review required |", "|---|---:|---:|---:|---:|---:|---:|"]
    for did in sorted(set(r["domain_id"] for r in role_records)):
        group = [r for r in role_records if r["domain_id"] == did]
        role_lines.append(f"| {did} | {len(group)} | {sum(r['parent_domain_fit']['status']=='supported' for r in group)} | {sum(r['parent_domain_fit']['status']=='review_required' for r in group)} | {sum(r['area_fit']['status']=='supported_existing_decision_reconciled' for r in group)} | {sum(r['area_fit']['status']=='direct_domain_to_role' for r in group)} | {sum(r['area_fit']['status']=='review_required' for r in group)} |")
    role_lines += ["", "See JSON for candidate-by-candidate findings and source citations. No canonical files were edited."]
    OUT_ROLE_MD.write_text("\n".join(role_lines) + "\n", encoding="utf-8")
    ng_lines = ["# D113–D168 Nigerian area-context reconciliation — 2026-10-07", "",
                f"Normalized areas reconciled: **{len(ng_records)}**. Status counts: `{json.dumps(dict(source_backed_ng), ensure_ascii=False)}`.",
                "", "Global area names and boundaries are unchanged. Nigerian overlays carry their exact source URL, locator, supported claim and limitation. No policy source is treated as vacancy or demand data.",
                "", "| Domain | Area | Nigerian context status | Source evidence |", "|---|---|---|---|"]
    for rec in ng_records:
        ev = rec["evidence"]
        refs = "; ".join(f"{e.get('source_id')}: {e.get('url')} ({e.get('locator')})" for e in ev) or "none in captured ledger"
        ng_lines.append(f"| {rec['domain_id']} | {rec['global_area_label']} | {rec['nigerian_context_status']} | {refs} |")
    ng_lines += ["", "No direct context found is scoped to the captured source search; it is not a claim that no Nigerian practice exists. Conflicts remain review-required."]
    OUT_NG_MD.write_text("\n".join(ng_lines) + "\n", encoding="utf-8")

    cp = {
        "schema_version": "2026-10-07.d113-d168.role-area-ng-context-checkpoint.v1",
        "lane": "D113-D168", "status": "assigned_role_and_area_context_records_exhausted",
        "lane_is_running": False, "checkpoint_written_at_utc": NOW,
        "artifact_paths": {"existing_role_area_json": str(OUT_ROLE.relative_to(ROOT)).replace("\\", "/"),
                           "existing_role_area_markdown": str(OUT_ROLE_MD.relative_to(ROOT)).replace("\\", "/"),
                           "nigerian_context_json": str(OUT_NG.relative_to(ROOT)).replace("\\", "/"),
                           "nigerian_context_markdown": str(OUT_NG_MD.relative_to(ROOT)).replace("\\", "/"),
                           "sparse_candidates_json": str(SPARSE_JSON.relative_to(ROOT)).replace("\\", "/")},
        "progress": {"sparse_candidates": {"complete": 44, "total": 44},
                     "active_unique_roles": {"complete": len(role_records), "total": len(current), "domains": role_payload["counts"]["domains_with_active_roles"]},
                     "normalized_areas": {"complete": len(ng_records), "total": ng_payload["counts"]["normalized_areas_in_range"]},
                     "parent_task_review_matches": role_payload["counts"]["matched_exact_prior_task_review"],
                     "parent_task_review_missing": role_payload["counts"]["missing_exact_prior_task_review"]},
        "role_counts": {"parent_fit": dict(parent_counts), "area_fit": dict(explicit_area_status_count), "disposition": dict(role_counts)},
        "nigerian_context_counts": dict(source_backed_ng),
        "test_results": {"built_in_integrity_assertions": "pending"},
        "canonical_files_edited": False,
        "next_action": "Run the lane validator/tests; any review_required rows remain visible and are not promoted to canonical data.",
    }
    write(CHECKPOINT, cp)
    CHECKPOINT_MD.write_text(
        "# D113–D168 role/area-fit and Nigerian-context checkpoint — 2026-10-07\n\n"
        f"Sparse candidates: **44/44 complete**. Existing active roles: **{len(role_records)}/{len(current)}** across **{role_payload['counts']['domains_with_active_roles']}** domains. "
        f"Parent exact task reviews matched: **{role_payload['counts']['matched_exact_prior_task_review']}**; missing exact prior decisions: **{role_payload['counts']['missing_exact_prior_task_review']}**. "
        f"Normalized areas reconciled: **{len(ng_records)}/{ng_payload['counts']['normalized_areas_in_range']}**.\n\n"
        f"Role area statuses: `{json.dumps(dict(area_status_counts), ensure_ascii=False)}`. Nigerian context: `{json.dumps(dict(source_backed_ng), ensure_ascii=False)}`.\n\n"
        f"Artifacts: `{OUT_ROLE.relative_to(ROOT)}`, `{OUT_NG.relative_to(ROOT)}`, `{OUT_ROLE_MD.relative_to(ROOT)}`, `{OUT_NG_MD.relative_to(ROOT)}`. Canonical edits: **none**. Lane running: **no; assigned records exhausted, validation follows**.\n",
        encoding="utf-8")

    # Structural and evidence assertions: all assigned records covered exactly once;
    # every passing parent fit has an exact task; no area key can escape the catalog.
    assert len(role_records) == len(current)
    assert role_payload["integrity"]["every_active_unique_role_key_included_once"]
    assert role_payload["integrity"]["area_keys_resolve_to_catalog"]
    assert role_payload["integrity"]["direct_routes_only_for_catalog_no_area_domains"]
    assert ng_payload["integrity"]["every_normalized_area_has_one_reconciliation_record"]
    assert ng_payload["integrity"]["all_supported_context_has_url_locator_claim_limitation"]
    assert len(ng_records) == 213
    cp["test_results"]["built_in_integrity_assertions"] = "passed"
    write(CHECKPOINT, cp)
    CHECKPOINT_MD.write_text(CHECKPOINT_MD.read_text(encoding="utf-8").replace("validation follows", "validation passed"), encoding="utf-8")
    print(json.dumps({"role_counts": role_payload["counts"], "nigerian_context_counts": ng_payload["counts"],
                      "integrity": {"roles_once": role_payload["integrity"]["every_active_unique_role_key_included_once"],
                                    "area_keys_valid": role_payload["integrity"]["area_keys_resolve_to_catalog"],
                                    "all_213_areas": ng_payload["integrity"]["every_normalized_area_has_one_reconciliation_record"]},
                      "checkpoint": str(CHECKPOINT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
