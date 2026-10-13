"""Reconcile existing global specialization evidence for D001-D056.

Audit-only. Reads prior reviews/registers and current subgroup records; never
changes canonical taxonomy or assigns roles to specializations.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = next(parent for parent in HERE.parents if (parent / "data/career-mapping").is_dir())
AUDIT = ROOT / "data/career-mapping/_audit"
LANE = AUDIT / "specialization_lanes_2026_10_05"
SOURCE_REGISTER = AUDIT / "specialization_review_evidence_register_2026_10_06.json"
CONTENT_COVERAGE = AUDIT / "specialization_review_content_coverage_2026_10_06.json"
CENTRAL = AUDIT / "domain_specialization_review_2026_10_03.json"
STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
DOMAIN_META = ROOT / "data/career-mapping/domain_meta.json"
EXCEPTIONS = LANE / "D001_D112_GLOBAL_RECONCILIATION/GLOBAL_SPECIALIZATION_EXCEPTION_RECONCILIATION_2026_10_06.json"
GLOBAL_AREA = LANE / "GLOBAL_AREA_SUBGROUP_RECONCILIATION_2026_10_06/global_area_subgroup_reconciliation_register_2026_10_06.json"
OUT_JSON = HERE / "d001_d056_step1_reconciliation_register_2026_10_06.json"
OUT_MD = HERE / "D001_D056_STEP1_RECONCILIATION_CHECKPOINT_2026_10_06.md"
LOCAL_ADJUDICATIONS = HERE / "local_specialization_adjudications_2026_10_06.json"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def get_domain_list(payload: dict[str, Any], key: str, domain_id: str) -> dict[str, Any] | None:
    for row in payload.get(key, []) or []:
        if isinstance(row, dict) and row.get("domain_id") == domain_id:
            return row
    return None


def candidate_rows(record: dict[str, Any]) -> list[dict[str, Any]]:
    for key in ("candidate_specializations", "candidate_areas", "specializations", "candidate_subgroups", "candidate_subject_fields"):
        rows = record.get(key)
        if isinstance(rows, list):
            result = []
            for value in rows:
                if isinstance(value, str):
                    result.append({"label": value, "scope": "", "boundary": ""})
                elif isinstance(value, dict):
                    label = value.get("label") or value.get("name") or value.get("title")
                    if label:
                        result.append({
                            "label": str(label),
                            "scope": value.get("scope") or value.get("description") or value.get("plain_language_scope") or "",
                            "boundary": value.get("boundary") or value.get("route_boundary") or "",
                        })
            return result
    return []


def source_rows(record: dict[str, Any], artifact: str, evidence_by_id: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    raw = record.get("source_register") or record.get("sources") or record.get("evidence") or record.get("external_sources") or []
    if isinstance(raw, dict):
        raw = [
            {"source_id": source_id, **source}
            for source_id, source in raw.items()
            if isinstance(source, dict)
        ]
    result = []
    for index, item in enumerate(raw, 1):
        if isinstance(item, str):
            source = evidence_by_id.get(item, {})
            result.append({**source, "source_id": source.get("source_id", item), "url": source.get("url", item), "source_artifact_locator": f"{artifact}#sources[{index}]"})
            continue
        if not isinstance(item, dict):
            continue
        url = item.get("url") or item.get("source_url")
        result.append({
            "source_id": item.get("source_id"),
            "publisher": item.get("publisher"),
            "title": item.get("title"),
            "url": url,
            "locator": item.get("locator") or item.get("source_locator"),
            "supports": item.get("supports") or item.get("claim_supported") or item.get("source_support"),
            "claim_limit": item.get("does_not_support") or item.get("claim_limit") or item.get("limitation") or item.get("limit"),
            "geographic_scope": item.get("geographic_scope") or item.get("geographic_scope_disposition"),
            "source_artifact_locator": f"{artifact}#sources[{index}]",
        })
    # The central register stores source URLs on each area and full source
    # records in its evidence register. Resolve those references exactly.
    areas = (record.get("specializations") or record.get("candidate_specializations") or
             record.get("candidate_areas") or record.get("candidate_subject_fields") or [])
    for area_index, area_record in enumerate(areas):
        if not isinstance(area_record, dict):
            continue
        ids = area_record.get("source_ids") or []
        urls = area_record.get("sources") or []
        if not urls:
            urls = ids
        for source_index, value in enumerate(urls):
            source_id = ids[source_index] if source_index < len(ids) else None
            source = evidence_by_id.get(str(source_id), {}) if source_id else {}
            if isinstance(value, str) and value.startswith("http"):
                source = {**source, "url": value}
            elif isinstance(value, str):
                source = evidence_by_id.get(value, source)
                source_id = source_id or value
            result.append({
                **source,
                "source_id": source_id or source.get("source_id"),
                "url": source.get("url"),
                "source_artifact_locator": f"{artifact}#specializations[{area_index}].sources[{source_index}]",
            })
    return result


def current_rows(domain: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for item in domain.get("subgroups", []) or []:
        rows.append({
            "isco_submajor": item.get("isco_submajor"),
            "current_label": item.get("label"),
            "data_state": item.get("data_state"),
            "student_visibility_reason": item.get("student_visibility_reason"),
        })
    return rows


def main() -> None:
    coverage = read(SOURCE_REGISTER)
    coverage_by_id = {row["domain_id"]: row for row in coverage["domains"]}
    central = read(CENTRAL)
    central_by_id = {row["domain_id"]: row for row in central["domain_reviews"]}
    evidence_by_id = {row["source_id"]: row for row in central.get("evidence_register", []) if row.get("source_id")}
    combined_5356 = LANE / "D003_D084/D053_D056_global_specialization_review_2026_10_06.json"
    if combined_5356.is_file():
        shared_sources = read(combined_5356).get("sources", {})
        if isinstance(shared_sources, dict):
            evidence_by_id.update({key: {"source_id": key, **value} for key, value in shared_sources.items() if isinstance(value, dict)})
    structure = read(STRUCTURE)
    domain_meta = read(DOMAIN_META)
    exceptions = read(EXCEPTIONS)
    exception_cases = exceptions.get("candidate_list_conflicts", {}).get("domains", {})
    exception_cases |= exceptions.get("additional_reconciliations", {})
    global_area = read(GLOBAL_AREA)
    area_by_id = {row["domain_id"]: row for row in global_area.get("domain_cases", [])}
    local_adjudications = read(LOCAL_ADJUDICATIONS).get("domains", {}) if LOCAL_ADJUDICATIONS.is_file() else {}
    # Local source-locator corrections are indexed before processing area-level
    # source_ids so the exact citations resolve to their corrected metadata.
    for adjudication in local_adjudications.values():
        for source in adjudication.get("sources", []) or []:
            if isinstance(source, dict) and source.get("source_id"):
                evidence_by_id[source["source_id"]] = source
    lane_registers = []
    for relative in (
        "REMAINING_LANE_1_2026_10_06/remaining_lane_1_specialization_reconciliation_2026_10_06.json",
        "REMAINING_LANE_2_2026_10_06/remaining_lane_2_specialization_register_2026_10_06.json",
        "REMAINING_LANE_3_2026_10_06/remaining_lane_3_register_2026_10_06.json",
    ):
        path = LANE / relative
        if path.is_file():
            register = read(path)
            lane_registers.append((str(path.relative_to(ROOT)), {row["domain_id"]: row for row in register.get("domains", []) if row.get("domain_id")}))

    rows: list[dict[str, Any]] = []
    for number in range(1, 57):
        domain_id = f"D{number:03d}"
        evidence_coverage = coverage_by_id[domain_id]
        central_row = central_by_id.get(domain_id)
        per_domain_path = LANE / f"D003_D084/{domain_id}_specialization_review.json"
        record_sources: list[tuple[str, dict[str, Any]]] = []

        if per_domain_path.is_file():
            raw = read(per_domain_path)
            record_sources.append((str(per_domain_path.relative_to(ROOT)), raw))
        elif number >= 53 and number <= 56 and combined_5356.is_file():
            raw = read(combined_5356)
            found = get_domain_list(raw, "domains", domain_id)
            if found:
                record_sources.append((str(combined_5356.relative_to(ROOT)), found))
        if central_row:
            record_sources.append((str(CENTRAL.relative_to(ROOT)), central_row))

        exception = exception_cases.get(domain_id)
        if exception:
            record_sources.append((str(EXCEPTIONS.relative_to(ROOT)), exception))
        area_case = area_by_id.get(domain_id)
        if area_case:
            record_sources.append((str(GLOBAL_AREA.relative_to(ROOT)), area_case))
        for artifact, by_id in lane_registers:
            if domain_id in by_id:
                record_sources.append((artifact, by_id[domain_id]))

        proposals: list[dict[str, Any]] = []
        sources: list[dict[str, Any]] = []
        statuses: list[str] = []
        open_items: list[str] = []
        for artifact, record in record_sources:
            # Area records often cite only source_ids, while the full source
            # records live in a sibling source_register/sources catalog. Join
            # those records before resolving citations; otherwise a valid
            # source is duplicated as an empty citation row and falsely fails
            # the source-locator completeness gate.
            for key in ("source_register", "sources", "external_sources", "evidence"):
                catalog = record.get(key) or []
                if isinstance(catalog, dict):
                    catalog = [
                        {"source_id": source_id, **source}
                        for source_id, source in catalog.items()
                        if isinstance(source, dict)
                    ]
                if isinstance(catalog, list):
                    for source in catalog:
                        if isinstance(source, dict) and source.get("source_id"):
                            evidence_by_id[source["source_id"]] = source
            areas = candidate_rows(record)
            if areas:
                proposals.append({
                    "artifact": artifact,
                    "review_status": record.get("review_status") or record.get("status"),
                    "decision": record.get("decision") or record.get("explicit_disposition") or record.get("next_disposition"),
                    "candidate_areas": areas,
                    "candidate_area_count": len(areas),
                })
            status = record.get("review_status") or record.get("status")
            if status:
                statuses.append(str(status))
            for key in ("uncertainties", "remaining_review", "remaining_open_issue", "limitations", "residual_uncertainties"):
                value = record.get(key)
                if isinstance(value, str) and value.strip():
                    open_items.append(value.strip())
                elif isinstance(value, list):
                    open_items.extend(str(entry) for entry in value if entry)
            sources.extend(source_rows(record, artifact, evidence_by_id))

        adjudication = local_adjudications.get(domain_id)
        if adjudication:
            decision_artifact = str(LOCAL_ADJUDICATIONS.relative_to(ROOT))
            if adjudication.get("candidate_areas"):
                proposals.append({
                    "artifact": decision_artifact,
                    "review_status": adjudication.get("disposition"),
                    "decision": adjudication.get("decision"),
                    "candidate_areas": adjudication["candidate_areas"],
                    "candidate_area_count": len(adjudication["candidate_areas"]),
                })
            for index, source in enumerate(adjudication.get("sources", []), 1):
                sources.append({
                    **source,
                    "source_artifact_locator": f"{decision_artifact}#domains.{domain_id}.sources[{index}]",
                })

        distinct = {}
        for proposal in proposals:
            key = tuple(sorted(norm(a["label"]) for a in proposal["candidate_areas"]))
            distinct.setdefault(key, []).append(proposal["artifact"])
        conflicts = len(distinct) > 1

        domain = structure.get(domain_id, {})
        current = current_rows(domain)
        visible = [row for row in current if row.get("data_state") not in {"excluded", "review_only", "inactive"}]
        recommended = proposals[-1]["candidate_areas"] if proposals else []
        recommendation_set = {norm(area["label"]) for area in recommended}
        current_set = {norm(str(row.get("current_label") or "")) for row in visible}
        explicitly_no_area = any("no_specialization" in str(p.get("decision", "")).casefold() or "direct domain" in str(p.get("decision", "")).casefold() for p in proposals)

        if adjudication and adjudication.get("disposition"):
            disposition = adjudication["disposition"]
            # The signed-off internal candidate set in this audit layer
            # adjudicates competing candidate proposals without erasing them.
            conflicts = False
            if proposals:
                distinct = {tuple(sorted(norm(a["label"]) for a in recommended)): [proposals[-1]["artifact"]]}
        elif not proposals or not sources:
            disposition = "evidence_record_incomplete_reconciliation_open"
        elif explicitly_no_area and not recommendation_set:
            disposition = "direct_domain_role_no_specialization_recommended"
        elif conflicts:
            disposition = "candidate_set_conflict_reconciliation_open"
        elif any(any(word in item.casefold() for word in ("parent scope", "root scope", "definition")) for item in open_items):
            disposition = "parent_scope_decision_open"
        else:
            disposition = "candidate_set_reconciled_against_captured_reviews_pending_canonical_decision"

        source_complete = bool(sources) and all(s.get("url") and s.get("locator") and (s.get("supports") or s.get("claim_limit")) for s in sources)
        rows.append({
            "domain_id": domain_id,
            "domain_name": domain_meta.get(domain_id, {}).get("domain_name") or evidence_coverage.get("domain_name"),
            "disposition": disposition,
            "captured_review_statuses": sorted(set(statuses)),
            "review_artifacts": evidence_coverage.get("artifact_paths", []),
            "proposal_variants": proposals,
            "distinct_candidate_sets": len(distinct),
            "candidate_set_conflict": conflicts,
            "current_subgroup_comparison": {
                "records": current,
                "visible_records": visible,
                "candidate_labels_match_visible_records": bool(recommended) and recommendation_set == current_set,
                "comparison_note": "Structural comparison only; ISCO membership and role links are not specialization-fit evidence.",
            },
            "supporting_sources": sources,
            "source_capture_quality": {
                "captured_source_rows": len(sources),
                "has_url_locator_and_support_or_limit_for_each_row": source_complete,
                "independent_source_reverification_performed": False,
            },
            "open_reconciliation_items": sorted(set(open_items)),
            "specialization_structure_reconciled": bool(adjudication and adjudication.get("disposition")),
            "role_audit_is_a_specialization_blocker": False if adjudication and adjudication.get("disposition") else None,
            "local_adjudication_artifact": str(LOCAL_ADJUDICATIONS.relative_to(ROOT)) if adjudication else None,
            "central_register_present": central_row is not None,
            "role_to_specialization_assignments_made": False,
            "nigerian_context_applied": False,
            "canonical_taxonomy_changed": False,
        })

    counts = Counter(row["disposition"] for row in rows)
    payload = {
        "schema_version": "2026-10-06.step1-global-specialization-reconciliation.v1",
        "scope": "D001-D056; reconcile captured global-source candidate reviews and current subgroup records only. No Nigerian context, role-to-specialization assignment, web refresh, academic sign-off, or canonical mutation.",
        "counts": {
            "catalogue_domain_count": 56,
            "domains_with_disposition": len(rows),
            "domains_with_captured_review_artifacts": sum(bool(row["review_artifacts"]) for row in rows),
            "domains_with_source_rows": sum(bool(row["supporting_sources"]) for row in rows),
            "domains_with_candidate_set_conflicts": sum(row["candidate_set_conflict"] for row in rows),
            "domains_with_reconciled_area_decision": sum(row["specialization_structure_reconciled"] for row in rows),
            "domains_with_current_subgroup_comparison": sum("current_subgroup_comparison" in row for row in rows),
            "by_disposition": dict(sorted(counts.items())),
        },
        "domains": rows,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# STEP 1 Global Specialization/Subgroup Reconciliation — D001–D056",
        "",
        "Append-only evidence reconciliation from captured review artifacts and current subgroup records. This does not independently re-open source URLs, approve a universal taxonomy, change canonical data, apply Nigerian context, or assign roles to specializations.",
        "",
        f"- Explicit domain dispositions: **{len(rows)}/56**",
        f"- Domains with source rows captured: **{payload['counts']['domains_with_source_rows']}/56**",
        f"- Candidate-set conflicts: **{payload['counts']['domains_with_candidate_set_conflicts']}**",
        "- Canonical changes / role-to-area assignments / Nigerian context: **0 / 0 / 0**",
        "",
        "## Disposition counts",
        "",
    ]
    lines.extend(f"- `{key}`: {value}" for key, value in payload["counts"]["by_disposition"].items())
    lines.extend(["", "## Domain-by-domain summary", ""])
    for row in rows:
        labels = row["proposal_variants"][-1]["candidate_areas"] if row["proposal_variants"] else []
        names = "; ".join(area["label"] for area in labels) or "No candidate area recorded"
        lines.append(f"- **{row['domain_id']} — {row['domain_name']}** — `{row['disposition']}`; variants={row['distinct_candidate_sets']}; source rows={len(row['supporting_sources'])}. {names}")
    lines.extend(["", "Full evidence, artifact locators, current subgroup records and unresolved items are in the adjacent JSON register.", ""])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
