"""Consolidate existing global specialization evidence for D057-D112.

This is an audit-only projection. It does not edit canonical taxonomy or source
review artifacts. It fails closed if the append-only outputs already exist.
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[6]
AUDIT = ROOT / "data/career-mapping/_audit"
LANES = AUDIT / "specialization_lanes_2026_10_05"
OUT = Path(__file__).resolve().parent
REGISTER_OUT = OUT / "step1_d057_d112_reconciliation_register_2026_10_06_012.json"
CHECKPOINT_OUT = OUT / "STEP1_D057_D112_CHECKPOINT_012.md"
CHECKPOINT_JSON_OUT = OUT / "step1_d057_d112_checkpoint_012.json"
SUPPLEMENTAL = OUT / "step1_supplemental_domain_evidence_2026_10_06.json"
CANONICAL_STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
DOMAIN_META = ROOT / "data/career-mapping/domain_meta.json"
CENTRAL_REGISTER = AUDIT / "domain_specialization_review_2026_10_03.json"
GLOBAL_RECON_DIR = LANES / "D001_D112_GLOBAL_RECONCILIATION"

DOMAIN_IDS = [f"D{i:03d}" for i in range(57, 113)]


def load_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def find_review_files(domain_id: str) -> list[Path]:
    matches = []
    for path in LANES.rglob(f"{domain_id}_specialization_review.json"):
        # Exclude files inside prior generated STEP 1 projections, if rerunning
        # from a later checkpoint or a copied workspace.
        if "STEP1_RECONCILIATION_2026_10_06" not in str(path):
            matches.append(path)
    return sorted(matches)


def get_review_parts(payload: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    decision = payload.get("decision", {})
    if not isinstance(decision, dict):
        decision = {"disposition": decision}
    areas = payload.get("candidate_specializations") or payload.get("specializations") or payload.get("candidate_areas") or []
    sources = payload.get("source_register") or payload.get("evidence") or []
    return decision, [x for x in areas if isinstance(x, dict)], [x for x in sources if isinstance(x, dict)]


def central_parts(payload: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    decision_text = payload.get("decision", "")
    decision = {
        "recommendation": decision_text,
        "count": payload.get("specialization_count"),
        "count_status": payload.get("review_status"),
        "criteria_disposition": payload.get("criteria_disposition", {}),
        "alternatives_considered": payload.get("alternatives_considered", []),
        "uncertainties": payload.get("uncertainties", []),
    }
    areas = payload.get("specializations", [])
    return decision, [x for x in areas if isinstance(x, dict)], []


def central_area_sources(areas: list[dict[str, Any]], central_evidence: dict[str, dict[str, Any]], central_by_url: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    sources = []
    for area in areas:
        urls = area.get("sources") or []
        ids = area.get("source_ids") or []
        for index, url in enumerate(urls):
            sid = ids[index] if index < len(ids) else None
            source = dict(central_evidence.get(str(sid), {})) if sid else dict(central_by_url.get(str(url), {}))
            source.setdefault("source_id", sid)
            source.setdefault("url", url)
            sources.append(source)
    return sources


def global_parts(payload: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    rec = payload.get("recommendation", {})
    if not isinstance(rec, dict):
        rec = {"recommendation": rec}
    sources = payload.get("evidence_reconciliation", {}).get("source_records", [])
    return rec, [x for x in rec.get("candidate_areas", []) if isinstance(x, dict)], [x for x in sources if isinstance(x, dict)]


def as_area(area: dict[str, Any]) -> dict[str, Any]:
    return {
        "key": area.get("key") or area.get("id"),
        "label": area.get("label") or area.get("name"),
        "boundary": area.get("description") or area.get("plain_language_scope") or area.get("scope"),
        "source_support_claim": area.get("source_support") or area.get("source_support_claim"),
        "source_ids": area.get("source_ids") or [],
        "source_urls": area.get("sources") or [],
        "evidence": area.get("evidence") or [],
        "status": area.get("status"),
    }


def extract_current_subgroups(domain_id: str, structure: dict[str, Any], review_payloads: list[dict[str, Any]]) -> dict[str, Any]:
    current = structure.get(domain_id, {})
    subgroups = current.get("subgroups", []) if isinstance(current, dict) else []
    stored = [
        {
            "code": subgroup.get("isco_submajor"),
            "label": subgroup.get("label"),
            "role_count_context_only": subgroup.get("role_count"),
            "description": subgroup.get("description"),
        }
        for subgroup in subgroups
        if isinstance(subgroup, dict)
    ]
    review_baselines = []
    for payload in review_payloads:
        state = payload.get("current_state") or payload.get("baseline_inventory") or {}
        if not isinstance(state, dict):
            continue
        labels = state.get("current_subgroups") or state.get("current_visible_subgroups") or state.get("current_specialization_labels")
        if labels is not None:
            review_baselines.append({
                "artifact": payload.get("_artifact"),
                "labels": labels,
                "reported_visible_count": state.get("current_visible_specialization_count", state.get("baseline_visible_count")),
                "basis": state.get("current_basis") or state.get("baseline_note"),
                "role_membership_excluded_as_fit_evidence": True,
            })
    return {
        "current_domain_structure_subgroup_records": stored,
        "current_record_count": len(stored),
        "current_role_count_context_only": current.get("role_count") if isinstance(current, dict) else None,
        "prior_review_baselines": review_baselines,
        "comparison_note": "Stored domain_structure subgroup rows are shown verbatim as the current structural baseline. Role counts are context only and are not evidence that a role fits the domain or specialization.",
    }


def source_key(source: dict[str, Any]) -> tuple[str, str]:
    return (str(source.get("source_id") or ""), str(source.get("url") or ""))


def combine_sources(*source_lists: list[dict[str, Any]], central_evidence: dict[str, dict[str, Any]], central_by_url: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    combined: dict[tuple[str, str], dict[str, Any]] = {}
    for sources in source_lists:
        for source in sources:
            if not isinstance(source, dict):
                continue
            sid = source.get("source_id")
            url = source.get("url")
            enriched = dict(central_evidence.get(str(sid), {})) if sid else dict(central_by_url.get(str(url), {}))
            enriched.update(source)
            key = source_key(enriched)
            if key == ("", ""):
                continue
            combined[key] = enriched
    return sorted(combined.values(), key=lambda item: (str(item.get("source_id") or ""), str(item.get("url") or "")))


def evidence_status(sources: list[dict[str, Any]]) -> dict[str, Any]:
    if not sources:
        return {"status": "no_source_record_reconciled", "source_count": 0, "locator_count": 0, "claim_limit_count": 0}
    locators = sum(bool(str(s.get("locator") or "").strip()) for s in sources)
    limits = sum(bool(str(s.get("claim_limit") or s.get("does_not_support") or s.get("limit") or "").strip()) for s in sources)
    return {
        "status": "source_records_present_with_gaps" if locators < len(sources) or limits < len(sources) else "source_records_and_claim_limits_present",
        "source_count": len(sources),
        "source_id_count": sum(bool(str(s.get("source_id") or "").strip()) for s in sources),
        "missing_source_id_count": sum(not bool(str(s.get("source_id") or "").strip()) for s in sources),
        "locator_count": locators,
        "claim_limit_count": limits,
    }


def recommendation_summary(decision: dict[str, Any], areas: list[dict[str, Any]]) -> dict[str, Any]:
    if "candidate_area_count" in decision:
        count = decision.get("candidate_area_count")
    elif "count" in decision:
        count = decision.get("count")
    else:
        count = len(areas) if areas else None
    rationale = decision.get("criteria_disposition", {})
    if isinstance(rationale, dict):
        count_reason = rationale.get("S4_SET_COVERAGE_AND_COUNT") or rationale.get("S4_COUNT_AND_COVERAGE") or rationale.get("set_coverage_and_count")
    else:
        count_reason = None
    return {
        "proposed_visible_area_count": count,
        "candidate_label_count": len(areas),
        "candidate_set_status": decision.get("candidate_area_count_status") or decision.get("count_status") or decision.get("review_status"),
        "count_status_or_rationale": decision.get("count_status") or count_reason,
        "recommendation_text": decision.get("recommendation") or decision.get("disposition") or decision.get("count_disposition"),
        "areas": [as_area(area) for area in areas],
        "defensibility_and_rejected_alternatives": {
            "criteria_count_and_coverage": count_reason,
            "alternatives_considered": decision.get("alternatives_considered") or decision.get("flat_vs_split") or decision.get("candidate_areas_not_approved"),
            "boundary_or_exclusion_rules": decision.get("boundary_and_exclusion_rules") or decision.get("boundary_notes"),
            "explicit_non_decisions": decision.get("explicit_non_decisions"),
            "residual_uncertainties": decision.get("residual_uncertainties") or decision.get("uncertainties") or decision.get("limitations"),
        },
    }


def classify_disposition(decision: dict[str, Any], areas: list[dict[str, Any]], current: dict[str, Any]) -> tuple[str, str]:
    text = " ".join(str(value) for value in decision.values() if isinstance(value, (str, int, float, list)))
    low = text.casefold()
    n = decision.get("candidate_area_count", decision.get("count", len(areas)))
    labels = {norm(area.get("label") or area.get("name")) for area in areas if area.get("label") or area.get("name")}
    current_labels = {norm(item.get("label")) for item in current.get("current_domain_structure_subgroup_records", []) if item.get("label")}
    if isinstance(n, int) and n == 0:
        if any(token in low for token in ("parent-scope", "parent scope", "boundary open", "needs scope split", "scope split", "unresolved", "pending", "further validation", "candidate learning routes")):
            return "d", "The recommendation keeps the visible area count at zero for now, but the record explicitly leaves parent boundaries or candidate-area evidence unresolved."
        if any(token in low for token in ("domain to role", "domain→role", "direct domain", "without specialization", "no specialization")):
            return "c", "The source review explicitly recommends a direct domain-to-role structure with no specialization areas."
        return "a", "The documented recommendation retains a flat/no-specialization structure without a recorded unresolved parent-scope blocker."
    if labels and current_labels and labels == current_labels and any(token in low for token in ("retain", "keep current", "no change")):
        return "a", "Recommended area labels match the current stored subgroup labels and the review explicitly recommends retaining them."
    if not areas and not isinstance(n, int):
        return "d", "The existing artifact does not provide a parseable area set/count; this lane cannot safely infer a disposition."
    if any(token in low for token in ("parent boundary open", "parent-scope decision unresolved", "parent scope unresolved", "scope split unresolved")):
        return "d", "The review flags an unresolved parent-scope decision that could change the specialization set."
    return "b", "The review recommends a changed, renamed, merged, split, added, removed, or newly defined specialization set; this remains a recommendation, not a canonical edit."


def actual_specialization_blocker(disposition: str, decision: dict[str, Any], reason: str) -> Any:
    if disposition != "d":
        return None
    # Keep the blocker narrow: pending role fit or external academic sign-off
    # is a separate gate and must not hold a defensible area/count decision.
    candidates = [
        decision.get("candidate_area_count_status"),
        decision.get("count_status"),
        decision.get("parent_scope_disposition"),
        decision.get("parent_domain_fit"),
    ]
    residuals = decision.get("residual_uncertainties") or decision.get("uncertainties") or decision.get("limitations") or []
    if isinstance(residuals, str):
        residuals = [residuals]
    candidates.extend(residuals if isinstance(residuals, list) else [])
    if not any(value for value in candidates):
        candidates.append(reason)
    def is_scope_blocker(value: Any) -> bool:
        text = str(value or "").casefold()
        return any(token in text for token in (
            "unresolved", "not establish", "does not establish", "provisional", "open", "missing",
            "scope", "boundary", "candidate count", "no complete", "no evidence", "curriculum",
        )) and not any(token in text for token in ("role-to", "role fit", "role assignment", "role membership"))
    blockers = [value for value in candidates if is_scope_blocker(value)]
    return blockers or [reason]


def build() -> tuple[dict[str, Any], dict[str, Any], str]:
    if any(path.exists() for path in (REGISTER_OUT, CHECKPOINT_OUT, CHECKPOINT_JSON_OUT)):
        raise SystemExit("Append-only output exists already. Create a new numbered checkpoint/register version; do not overwrite.")

    structure = load_json(CANONICAL_STRUCTURE, {})
    meta = load_json(DOMAIN_META, {})
    central = load_json(CENTRAL_REGISTER, {})
    central_rows = {row.get("domain_id"): row for row in central.get("domain_reviews", [])}
    central_sources = {row.get("source_id"): row for row in central.get("evidence_register", []) if row.get("source_id")}
    central_sources_by_url = {row.get("url"): row for row in central.get("evidence_register", []) if row.get("url")}
    rows = []
    for domain_id in DOMAIN_IDS:
        domain_name = meta.get(domain_id, {}).get("domain_name") or domain_id
        central_row = central_rows.get(domain_id)
        if central_row:
            domain_name = central_row.get("domain_name") or domain_name

        review_paths = find_review_files(domain_id)
        review_payloads = []
        review_parts = []
        for path in review_paths:
            payload = load_json(path, {})
            payload["_artifact"] = str(path.relative_to(ROOT))
            review_payloads.append(payload)
            dec, ars, srcs = get_review_parts(payload)
            review_parts.append((path, payload, dec, ars, srcs))

        global_path = GLOBAL_RECON_DIR / f"{domain_id}_global_specialization_reconciliation.json"
        global_payload = load_json(global_path, {})
        global_decision, global_areas, global_sources = global_parts(global_payload) if global_payload else ({}, [], [])

        central_decision, central_areas, _ = central_parts(central_row) if central_row else ({}, [], [])
        # Most domain-review files contain full evidence and detailed rejected
        # alternatives. For the later range, the append-only global projection
        # is the most recent reconciliation artifact; otherwise prefer the
        # domain-specific review, falling back to the central source register.
        if domain_id == "D064" and global_payload and review_parts:
            # The checked-in cross-jurisdiction professional evidence supports
            # keeping the two Australian-listed routes separately visible as
            # candidates. Do not translate jurisdictional variation into a
            # claim of a universal licensing taxonomy.
            lane_variant = next((part for part in review_parts if part[3]), None)
            if lane_variant:
                path, _, chosen_decision, chosen_areas, primary_sources = lane_variant
                chosen_kind, chosen_path = "source_evidence_adjudication_of_existing_conflict", str(path.relative_to(ROOT))
        elif global_payload:
            chosen_kind, chosen_path = "global_reconciliation", str(global_path.relative_to(ROOT))
            chosen_decision, chosen_areas = global_decision, global_areas
            primary_sources = global_sources
        elif review_parts:
            path, _, chosen_decision, chosen_areas, primary_sources = review_parts[-1]
            chosen_kind, chosen_path = "domain_specific_review", str(path.relative_to(ROOT))
        elif central_row:
            chosen_kind, chosen_path = "central_register_fallback", str(CENTRAL_REGISTER.relative_to(ROOT))
            chosen_decision, chosen_areas = central_decision, central_areas
            primary_sources = []
        else:
            chosen_kind, chosen_path = "missing_review_evidence", None
            chosen_decision, chosen_areas, primary_sources = {}, [], []

        if chosen_kind in {"domain_specific_review", "source_evidence_adjudication_of_existing_conflict"}:
            selected_review = next((payload for path, payload, *_ in review_parts if str(path.relative_to(ROOT)) == chosen_path), None)
            if selected_review:
                chosen_decision.setdefault("review_status", selected_review.get("review_status"))

        # A global projection may omit a more specific source locator/limit
        # captured in the domain review. Preserve both records; deduplicate on
        # source ID + URL and prefer the fuller reviewed record on collisions.
        specific_sources = [source for part in review_parts for source in part[4]]
        if chosen_kind == "central_register_fallback":
            primary_sources = central_area_sources(chosen_areas, central_sources, central_sources_by_url)
        sources = combine_sources(primary_sources, specific_sources, central_evidence=central_sources, central_by_url=central_sources_by_url)
        current = extract_current_subgroups(domain_id, structure, review_payloads)
        disposition, disposition_reason = classify_disposition(chosen_decision, chosen_areas, current)

        # Compare candidate labels/counts from all recorded sources. Do not
        # silently overwrite a disagreement; only a dated global reconciliation
        # can explicitly supersede an older candidate projection.
        variants = []
        for path, payload, decision, areas, _ in review_parts:
            variants.append({
                "artifact": str(path.relative_to(ROOT)),
                "status": payload.get("review_status"),
                "count": decision.get("candidate_area_count", decision.get("count", len(areas))),
                "labels": [a.get("label") or a.get("name") for a in areas],
                "summary": decision.get("disposition") or decision.get("recommendation"),
            })
        if central_row:
            variants.append({
                "artifact": str(CENTRAL_REGISTER.relative_to(ROOT)),
                "status": central_row.get("review_status"),
                "count": central_row.get("specialization_count"),
                "labels": [a.get("label") for a in central_areas],
                "summary": central_row.get("decision"),
            })
        if global_payload:
            variants.append({
                "artifact": str(global_path.relative_to(ROOT)),
                "status": global_decision.get("review_status"),
                "count": global_decision.get("candidate_area_count", len(global_areas)),
                "labels": [a.get("label") for a in global_areas],
                "summary": global_decision.get("recommendation"),
            })
        signatures = {(v.get("count"), tuple(norm(label) for label in v.get("labels", []) if label)) for v in variants}
        if len(signatures) <= 1:
            conflict = {"status": "no_count_or_label_conflict_detected", "variants": variants, "resolution": "All located recommendations have the same candidate count and labels; the selected artifact supplies the detailed rationale/evidence."}
        elif domain_id == "D064" and global_payload and len(signatures) > 1:
            conflict = {
                "status": "evidence_reconciled_internal_candidate_set",
                "variants": variants,
                "resolution": "Use the nine-area candidate set in the D064 source review for this internal global learning taxonomy: the captured Australian Psychology Board endorsement framework and APS practice-area guidance list community psychology and clinical neuropsychology separately; the candidate review supplies distinct learning boundaries for health versus community practice and for brain-behaviour assessment/rehabilitation versus broader clinical psychology. The earlier eight-area projection merged health with community and nested clinical neuropsychology to avoid implying universal equivalence. That caution is retained as a jurisdiction-labelled claim limit, not used to erase the distinct candidate routes. The set remains provisional: the checked-in APA and UK frameworks do not establish the same nine-area list, and none mandates a global count.",
                "evidence_source_ids": ["AUSTRALIA_AREAS_OF_PRACTICE", "APS_PSYCHOLOGY_PRACTICE_AREAS", "APA_RECOGNIZED_SPECIALTIES", "UK_HCPC_PROTECTED_TITLES"],
                "claim_limits": ["Australia separately lists the areas but does not create globally portable qualifications.", "APA and UK recognition lists differ; nine is an internal candidate synthesis, not a universal regulator or academic taxonomy.", "No role-to-area assignment is inferred."],
                "canonical_write": False,
            }
        elif global_payload:
            explicit = global_decision.get("conflict_reconciliation")
            if explicit and explicit.get("decision"):
                conflict = {"status": "explicitly_adjudicated_conflict", "variants": variants, "resolution": explicit.get("decision"), "adjudication_artifact": global_payload.get("originating_artifacts"), "canonical_write": explicit.get("canonical_write", False)}
            else:
                conflict = {"status": "unresolved_recommendation_conflict", "variants": variants, "resolution": "A later global projection exists, but it contains no explicit adjudication of the differing count/labels. Preserve both recommendations and leave the area-set decision unresolved."}
        else:
            conflict = {"status": "unresolved_recommendation_conflict", "variants": variants, "resolution": "No later global reconciliation explicitly adjudicates this disagreement. Keep it open; do not choose by role membership or silently promote either set."}

        if conflict["status"] == "unresolved_recommendation_conflict":
            disposition = "d"
            disposition_reason = "Existing review artifacts disagree on candidate count/labels and no explicit adjudication is captured; preserve the conflict as unresolved."

        source_status = evidence_status(sources)
        status_text = str(chosen_decision.get("count_status") or chosen_decision.get("review_status") or "")
        if disposition == "d" or "provisional" in status_text.casefold() or "open" in status_text.casefold() or conflict["status"] == "unresolved_recommendation_conflict":
            confidence = "low_to_moderate_provisional"
        elif source_status["status"] == "source_records_and_claim_limits_present" and len(sources) >= 2:
            confidence = "moderate_internal_recommendation_not_external_signoff"
        else:
            confidence = "low_provisional_or_evidence_incomplete"

        rows.append({
            "domain_id": domain_id,
            "domain_name": domain_name,
            "global_only": True,
            "disposition": {
                "code": disposition,
                "label": {
                    "a": "retain current subgroup structure",
                    "b": "rename/merge/split/add/remove specialization areas",
                    "c": "direct domain→role with no specialization",
                    "d": "evidence/parent-scope decision still unresolved",
                }[disposition],
                "reason": disposition_reason,
            },
            "recommended_final_student_facing_areas": recommendation_summary(chosen_decision, chosen_areas),
            "exact_current_subgroup_comparison": current,
            "role_isco_membership_fit_rule": "Role titles, ISCO membership, subgroup member counts, and role-frequency data were not used as evidence that an area belongs in this domain or that a role fits an area.",
            "evidence": {
                "coverage": source_status,
                "sources": sources,
                "claim_limit_note": "Citations support only the claims recorded in each source entry; source presence does not establish an exhaustive academic taxonomy or external sign-off.",
            },
            "existing_recommendation_reconciliation": conflict,
            "confidence": confidence,
            "remaining_blocker": actual_specialization_blocker(disposition, chosen_decision, disposition_reason),
            "separate_later_gate": "Audit each role against the reconciled domain and specialization using role-task evidence. This pending role-fit audit is not a blocker to deciding the domain's specialization count, labels, boundaries, or parent fit.",
            "external_academic_signoff_status": chosen_decision.get("external_academic_signoff_status") or global_decision.get("external_academic_signoff_status") or "not recorded in selected artifact; no external sign-off claimed",
            "selected_existing_artifact": {"kind": chosen_kind, "path": chosen_path},
            "other_existing_review_artifacts": [str(path.relative_to(ROOT)) for path in review_paths],
            "role_to_specialization_assignments": None,
            "nigerian_context": "deferred_by_scope",
            "canonical_edit": False,
        })

    supplemental = load_json(SUPPLEMENTAL, {})
    supplemental_domains = supplemental.get("domains", {})
    for row in rows:
        adjudication = supplemental_domains.get(row["domain_id"])
        if not adjudication:
            continue
        added_sources = adjudication.get("sources", [])
        source_by_id = {source.get("source_id"): source for source in added_sources}
        area_rows = []
        for index, area in enumerate(adjudication.get("areas", []), start=1):
            ids = area.get("source_ids", [])
            area_rows.append({
                "key": re.sub(r"[^a-z0-9]+", "-", area["label"].casefold()).strip("-"),
                "label": area["label"],
                "boundary": area["boundary"],
                "source_support_claim": "Supported as an internally synthesized learning area by the official academic/professional curriculum evidence listed; not a universal prescribed taxonomy.",
                "source_ids": ids,
                "source_urls": [source_by_id[source_id]["url"] for source_id in ids if source_id in source_by_id],
                "evidence": [{"source_id": source_id, "claim_limit": source_by_id[source_id].get("claim_limit")} for source_id in ids if source_id in source_by_id],
                "status": "source_supported_internal_recommendation",
            })
        row["disposition"] = {
            "code": adjudication["disposition"],
            "label": "rename/merge/split/add/remove specialization areas",
            "reason": "The checked academic/professional curriculum evidence now supports a domain-level specialization structure; the earlier deferral was not dependent on the later role-fit audit.",
        }
        row["recommended_final_student_facing_areas"] = {
            "proposed_visible_area_count": adjudication["count"],
            "candidate_label_count": len(area_rows),
            "candidate_set_status": "source-supported internal recommendation; not a universal or regulator-mandated taxonomy",
            "count_status_or_rationale": adjudication["count_rationale"],
            "recommendation_text": adjudication["count_rationale"],
            "areas": area_rows,
            "defensibility_and_rejected_alternatives": {
                "criteria_count_and_coverage": adjudication["count_rationale"],
                "alternatives_considered": adjudication["rejected_alternatives"],
                "boundary_or_exclusion_rules": "Use the recorded area boundaries. Cross-cutting competencies, technologies, system types, supervisory topics, and modalities stay within relevant learning paths unless independent education evidence establishes a distinct learner route.",
                "explicit_non_decisions": "No role-to-specialization assignment, role/ISCO membership inference, national-context addition, or canonical taxonomy edit is made in this Step 1 reconciliation.",
                "residual_uncertainties": ["This is an auditable internal synthesis, not external academic-body sign-off or a claim that one taxonomy is universally prescribed."],
            },
        }
        combined_sources = row["evidence"]["sources"] + [source for source in added_sources if source.get("source_id") not in {s.get("source_id") for s in row["evidence"]["sources"]}]
        row["evidence"]["sources"] = combined_sources
        row["evidence"]["coverage"] = evidence_status(combined_sources)
        row["evidence"]["claim_limit_note"] = "Sources support only the claims stated in each record. The areas are an internally synthesized, source-backed student taxonomy, not an externally mandated global list."
        row["existing_recommendation_reconciliation"] = {
            "status": "domain_level_evidence_adjudication",
            "variants": row["existing_recommendation_reconciliation"].get("variants", []),
            "resolution": adjudication["conflict_resolution"],
            "evidence_source_ids": [source["source_id"] for source in added_sources],
            "claim_limits": [source["claim_limit"] for source in added_sources],
            "canonical_write": False,
        }
        row["confidence"] = adjudication["confidence"]
        row["remaining_blocker"] = None
        row["selected_existing_artifact"] = {"kind": "step1_domain_level_source_adjudication", "path": str(SUPPLEMENTAL.relative_to(ROOT))}

    d068 = next(row for row in rows if row["domain_id"] == "D068")
    d068["remaining_blocker"] = [
        "Exact unresolved parent decision: should the current D068 root remain one parent spanning rehabilitation/function-focused therapies, diagnostic laboratory science, and medical imaging, or should these become separate root domains? The checked sources establish distinct professional scopes (WHO rehabilitation workforce; IFBLS biomedical laboratory competence; World Physiotherapy specialty groups; ASHA audiology/speech-language scopes) but do not establish that these sectors form one shared parent curriculum. Missing evidence/decision: a source-backed root-domain boundary ruling, or comparative international curricula demonstrating a coherent common foundation and additive specialization paths across all three sectors. Until the parent boundary is settled, a final area count under D068 would be misleading. This is a genuine parent-scope issue, not a pending role-fit audit."
    ]

    counts = {code: sum(row["disposition"]["code"] == code for row in rows) for code in "abcd"}
    coverage_counts: dict[str, int] = {}
    for row in rows:
        key = row["evidence"]["coverage"]["status"]
        coverage_counts[key] = coverage_counts.get(key, 0) + 1

    register = {
        "schema_version": "2026-10-06.step1-specialization-subgroup-reconciliation.v1",
        "lane": "D057-D112",
        "scope": "Global specialization/subgroup evidence reconciliation only. No Nigerian-context pass, role-to-specialization assignment, or canonical edits.",
        "append_only": True,
        "supersedes_register": "prior 001-011 projections: 001 source extraction/count semantics; 002 conflict policy; 003/004 evidence lookup; 005 evidence-based D064 reconciliation; 006 separates true blockers from later role-fit; 007 carries review status; 008 records precise blockers; 009 adds targeted curriculum evidence but its counts were computed before adjudication; 010 recomputes all counts after adjudication; 011 accurately describes evidence method; 012 makes the remaining D068 parent-boundary decision precise",
        "created_on": date.today().isoformat(),
        "expected_domain_count": 56,
        "covered_domain_count": len(rows),
        "disposition_counts": counts,
        "source_coverage_counts": coverage_counts,
        "method": [
            "Read existing domain-specific reviews, dated global reconciliation projections, central-register recommendations, and their captured source registers before synthesizing this lane.",
            "Use domain_structure.json only to quote the current stored subgroup baseline; do not infer taxonomy fit from ISCO membership or role counts.",
            "Preserve recommendation conflicts and unresolved parent-scope/evidence decisions; do not silently convert candidate recommendations into approved taxonomy.",
            "Carry source IDs, URLs, locators, support claims, and claim limits forward from existing evidence records; targeted official academic/professional curriculum sources were added only for D057, D058 and D060 to resolve count/structure decisions that prior classification sources could not decide.",
        ],
        "canonical_files_changed": False,
        "domains": rows,
    }
    missing = [domain_id for domain_id, row in zip(DOMAIN_IDS, rows) if row["domain_id"] != domain_id]
    if len(rows) != 56 or missing:
        raise SystemExit(f"Coverage invariant failed: rows={len(rows)} missing/order_errors={missing}")

    checkpoint = {
        "schema_version": "2026-10-06.step1-lane-checkpoint.v1",
        "lane": "D057-D112",
        "expected": 56,
        "supersedes_checkpoint": "STEP1_D057_D112_CHECKPOINT_011.md; 012 states the exact unresolved D068 parent-scope decision and missing evidence",
        "rows_written": len(rows),
        "disposition_counts": counts,
        "source_coverage_counts": coverage_counts,
        "domains_without_selected_review_artifact": [row["domain_id"] for row in rows if row["selected_existing_artifact"]["kind"] == "missing_review_evidence"],
        "domains_with_unresolved_recommendation_conflict": [row["domain_id"] for row in rows if row["existing_recommendation_reconciliation"]["status"] == "unresolved_recommendation_conflict"],
        "domains_with_zero_source_records": [row["domain_id"] for row in rows if row["evidence"]["coverage"]["source_count"] == 0],
        "domains_with_source_metadata_gaps": [row["domain_id"] for row in rows if row["evidence"]["coverage"]["status"] != "source_records_and_claim_limits_present"],
        "total_missing_source_ids": sum(row["evidence"]["coverage"]["missing_source_id_count"] for row in rows),
        "scope_exclusions": ["Nigeria-specific context", "role-to-specialization mapping", "canonical taxonomy changes"],
    }
    lines = [
        "# Step 1 global specialization/subgroup reconciliation — D057–D112",
        "",
        "This checkpoint consolidates existing review/source-register evidence and targeted official academic/professional curriculum evidence for D057, D058 and D060. It is an internal reconciliation, not external academic sign-off, and it does not edit canonical taxonomy.",
        "",
        f"- Domains covered: **{len(rows)}/56**",
        f"- Dispositions: retain current structure **{counts['a']}**; proposed structural change **{counts['b']}**; direct domain→role/no specialization **{counts['c']}**; unresolved evidence/parent scope **{counts['d']}**.",
        f"- Source coverage: `{json.dumps(coverage_counts, ensure_ascii=False)}`",
        f"- Recommendation conflicts without an explicit later adjudication: **{len(checkpoint['domains_with_unresolved_recommendation_conflict'])}**",
        f"- Domains with no captured source records: **{len(checkpoint['domains_with_zero_source_records'])}**",
        f"- Domains with source metadata gaps: **{len(checkpoint['domains_with_source_metadata_gaps'])}**; missing source-ID count: **{checkpoint['total_missing_source_ids']}**.",
        "- Role membership/ISCO grouping was not accepted as domain-fit or specialization-fit evidence.",
        "- Nigerian context and role→specialization assignments remain out of scope.",
        "- Canonical files changed: **No**.",
        "",
        "## Per-domain reconciled register",
        "",
    ]
    for row in rows:
        rec = row["recommended_final_student_facing_areas"]
        lines += [
            f"### {row['domain_id']} — {row['domain_name']}",
            "",
            f"- Disposition: **{row['disposition']['label']}** — {row['disposition']['reason']}",
            f"- Current stored subgroups ({row['exact_current_subgroup_comparison']['current_record_count']}): " + ("; ".join(f"`{s['code']}` {s['label']}" for s in row['exact_current_subgroup_comparison']['current_domain_structure_subgroup_records']) or "none"),
            f"- Recommended visible area count: **{rec['proposed_visible_area_count'] if rec['proposed_visible_area_count'] is not None else 'unresolved'}**; candidate labels captured: **{rec['candidate_label_count']}**; count rationale/status: {rec['count_status_or_rationale'] or rec['candidate_set_status'] or 'not explicitly captured'}",
        ]
        for area in rec["areas"]:
            lines.append(f"  - **{area['label'] or '(label missing)'}** — {area['boundary'] or 'boundary not captured'}")
        lines += [
            f"- Evidence: **{row['evidence']['coverage']['status']}** ({row['evidence']['coverage']['source_count']} source records; {row['evidence']['coverage']['missing_source_id_count']} source IDs missing); selected artifact `{row['selected_existing_artifact']['path'] or 'none'}`.",
            f"- Existing-recommendation reconciliation: **{row['existing_recommendation_reconciliation']['status']}**.",
            f"- Confidence: {row['confidence']}; blocker: {row['remaining_blocker'] or 'none explicitly captured'}.",
            "",
        ]
    lines += [
        "## Audit limits",
        "",
        "This projection normalizes existing evidence; it does not replace checking the cited source itself. Candidate labels remain recommendations where the source review says provisional. Any source conflict, missing locator, unresolved parent boundary, or absent source record remains explicit in the JSON register. No roles were assigned to areas, and no Nigerian-specific source was added.",
        "",
        f"Machine-readable register: `{REGISTER_OUT.name}`.",
    ]
    return register, checkpoint, "\n".join(lines) + "\n"


def main() -> None:
    register, checkpoint, markdown = build()
    REGISTER_OUT.write_text(json.dumps(register, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_JSON_OUT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_OUT.write_text(markdown, encoding="utf-8")
    print(json.dumps({"register": str(REGISTER_OUT), "checkpoint": str(CHECKPOINT_OUT), **checkpoint}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
