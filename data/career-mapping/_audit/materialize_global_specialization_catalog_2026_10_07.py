"""Normalize the 168-domain Step 1 area recommendations into a keyed catalog.

This is an integration artifact, not the student-facing taxonomy yet. It keeps
the exact recommendation, area boundary, evidence references and unresolved
limits in a stable format so the role-fit and Nigerian-context passes can join
against the same area keys before canonical student routes are activated.
"""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = ROOT.parents[1]
AUDIT = ROOT / "_audit"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
OUTPUT = ROOT / "domain_specialization_catalog.json"
REPORT = AUDIT / "GLOBAL_SPECIALIZATION_CATALOG_MATERIALIZATION_2026_10_07.json"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def slug(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.casefold())).strip("-")


def recommendation_areas(value: Any) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Read all three historical Step 1 encodings without losing metadata."""
    if isinstance(value, dict):
        areas = value.get("areas") or []
        metadata = {key: item for key, item in value.items() if key != "areas"}
        return [item for item in areas if isinstance(item, dict)], metadata
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)], {}
    return [], {"source_format": type(value).__name__}


def source_evidence_index() -> dict[str, list[dict[str, Any]]]:
    """Index source cards already captured in the specialization evidence files.

    Step 1 often stores stable source IDs on an area while its source card
    (publisher, URL, locator and claim limits) lives in the referenced review
    artifact. Reuse only exact source-ID matches; never transfer evidence by
    label similarity or domain proximity.
    """
    evidence: dict[str, dict[str, str]] = {}
    root = AUDIT / "specialization_lanes_2026_10_05"
    for path in root.rglob("*.json"):
        if path.name in {OUTPUT.name, REPORT.name}:
            continue
        try:
            payload = read_json(path)
        except (OSError, json.JSONDecodeError):
            continue
        stack = [payload]
        while stack:
            item = stack.pop()
            if isinstance(item, dict):
                sid = str(item.get("source_id") or "").strip()
                url = str(item.get("url") or "").strip()
                locator = str(item.get("locator") or "").strip()
                if sid and url and locator:
                    card = {
                        key: str(item.get(key) or "").strip()
                        for key in (
                            "publisher", "source_type", "title", "url", "host",
                            "locator", "claim_supported", "supports", "claim_limit",
                            "geographic_scope_disposition",
                        )
                        if str(item.get(key) or "").strip()
                    }
                    evidence[json.dumps([sid, url, locator], ensure_ascii=False)] = {
                        "source_id": sid, **card,
                    }
                stack.extend(item.values())
            elif isinstance(item, list):
                stack.extend(item)
    by_id: dict[str, list[dict[str, Any]]] = {}
    for card in evidence.values():
        by_id.setdefault(card["source_id"], []).append(card)
    return {key: sorted(rows, key=lambda row: (row.get("title", ""), row["url"], row["locator"]))
            for key, rows in by_id.items()}


def normalize_text(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", text.casefold()).strip()


def domain_source_cards(source_domain: dict[str, Any]) -> list[dict[str, Any]]:
    """Follow only the cited evidence-artifact chain for a domain."""
    domain_id = str(source_domain.get("domain_id") or "").strip()
    pending: list[tuple[Path, int]] = []
    initial = str(source_domain.get("evidence_artifact") or "").strip()
    if initial:
        path = Path(initial)
        pending.append((path if path.is_absolute() else REPO_ROOT / path, 0))
    seen_paths: set[Path] = set()
    cards: dict[str, dict[str, Any]] = {}
    artifact_fields = {
        "artifact", "source_artifact", "local_adjudication_artifact",
        "evidence_artifact", "source_artifact_path",
    }
    while pending:
        path, depth = pending.pop()
        path = path.resolve()
        if path in seen_paths or not path.is_file():
            continue
        seen_paths.add(path)
        try:
            payload = read_json(path)
        except (OSError, json.JSONDecodeError):
            continue
        # Many lane registers contain dozens of domains. Restrict traversal to
        # this domain before following artifact references, so citations from a
        # neighboring domain can never leak into this area's evidence.
        if isinstance(payload, dict):
            rows = payload.get("domains")
            if isinstance(rows, dict) and domain_id in rows:
                payload = rows[domain_id]
            elif isinstance(rows, list):
                matching = next((row for row in rows if isinstance(row, dict)
                                 and str(row.get("domain_id") or "") == domain_id), None)
                if matching is not None:
                    payload = matching
            elif isinstance(payload.get("domain_id"), str) and payload["domain_id"] != domain_id:
                continue
        stack = [payload]
        while stack:
            item = stack.pop()
            if isinstance(item, dict):
                sid = str(item.get("source_id") or "").strip()
                url = str(item.get("url") or "").strip()
                locator = str(item.get("locator") or "").strip()
                if sid and url and locator:
                    card = {
                        key: str(item.get(key) or "").strip()
                        for key in (
                            "publisher", "source_type", "title", "url", "host",
                            "locator", "claim_supported", "supports", "claim_limit",
                            "geographic_scope_disposition",
                        )
                        if str(item.get(key) or "").strip()
                    }
                    cards[json.dumps([sid, url, locator], ensure_ascii=False)] = {
                        "source_id": sid, **card,
                    }
                if depth < 3:
                    for key in artifact_fields:
                        raw = item.get(key)
                        if isinstance(raw, str) and raw.strip().casefold().endswith(".json"):
                            child = Path(raw.strip())
                            pending.append((child if child.is_absolute() else REPO_ROOT / child, depth + 1))
                stack.extend(item.values())
            elif isinstance(item, list):
                stack.extend(item)
    return list(cards.values())


def source_supports_area(card: dict[str, Any], label: str) -> bool:
    """Require area-specific lexical support in the captured claim/locator."""
    searchable = normalize_text(" ".join(str(card.get(key) or "") for key in (
        "title", "locator", "claim_supported", "supports",
    )))
    phrase = normalize_text(label)
    if phrase and phrase in searchable:
        return True
    stop = {"and", "of", "the", "for", "in", "to", "with", "practice", "area"}
    tokens = [token for token in phrase.split() if len(token) > 3 and token not in stop]
    if len(tokens) < 2:
        return False
    matched = sum(token in searchable.split() for token in tokens)
    return matched >= 2 and matched / len(tokens) >= 0.60


def main() -> None:
    source = read_json(STEP1)
    captured_sources = source_evidence_index()
    domains: list[dict[str, Any]] = []
    ids: set[str] = set()
    status_counts: Counter[str] = Counter()
    domains_with_empty_citations: list[str] = []
    areas_with_empty_citations: list[str] = []
    key_collisions: list[dict[str, str]] = []
    source_count_variances: list[dict[str, Any]] = []
    areas_missing_captured_source_cards: list[str] = []
    excluded_area_candidates: list[dict[str, Any]] = []
    domain_sources_without_area_match: list[str] = []

    for source_domain in source.get("domains") or []:
        domain_id = str(source_domain.get("domain_id") or "").strip()
        if not domain_id:
            continue
        areas_raw, recommendation_metadata = recommendation_areas(
            source_domain.get("recommended_areas")
        )
        top_level_count = source_domain.get("recommended_area_count")
        reported_count = top_level_count
        if isinstance(source_domain.get("recommended_areas"), dict):
            nested_count = recommendation_metadata.get("proposed_visible_area_count")
            if nested_count is not None:
                reported_count = nested_count
        observed_count = len(areas_raw)
        if (
            (reported_count is not None and int(reported_count) != observed_count)
            or (top_level_count is not None and int(top_level_count) != observed_count)
        ):
            source_count_variances.append({
                "domain_id": domain_id,
                "top_level_reported_count": int(top_level_count) if top_level_count is not None else None,
                "nested_reported_count": int(reported_count) if reported_count is not None else None,
                "normalized_area_records": observed_count,
                "reconciliation": "normalized_count_equals_the_actual_candidate_area_records",
                "note": "Historical count fields disagree; preserve this variance for audit, but use the explicit area records and their labels as the source of the normalized count.",
            })
        areas: list[dict[str, Any]] = []
        domain_cards = domain_source_cards(source_domain)
        seen: dict[str, str] = {}
        for area in areas_raw:
            label = str(area.get("label") or "").strip()
            boundary = str(
                area.get("boundary") or area.get("scope") or area.get("route_boundary") or ""
            ).strip()
            if not label:
                continue
            source_boundary = boundary
            boundary_reconciliation = None
            label_is_excluded = bool(re.search(r"\bnot (?:a )?separate area\b|\bnot a separate specialization\b", label, re.I))
            if domain_id == "D112" and label_is_excluded and "converting" in label.casefold():
                excluded_area_candidates.append({
                    "domain_id": domain_id,
                    "candidate_label": label,
                    "boundary": boundary or None,
                    "disposition": "fold_into_existing_area_as_process_topic",
                    "parent_area_key": "D112:pulp-and-paper-manufacture",
                    "parent_area_label": "Pulp and Paper Manufacture",
                    "reason": "The reconciled D112 recommendation supports two primary process areas and explicitly treats paper converting/finishing as a process/topic under pulp and paper, not as a third specialization area.",
                    "source_artifact": source_domain.get("evidence_artifact"),
                    "student_visible_as_area": False,
                })
                continue
            if domain_id == "D112" and label.casefold() == "pulp and paper manufacture":
                boundary = (
                    "Operate pulping, bleaching, stock preparation and paper-machine processes to make pulp and paper; "
                    "also understand downstream paper converting and finishing (such as cutting, folding and coating) "
                    "as processes within this specialization, not as a separate specialization area."
                )
                boundary_reconciliation = {
                    "source_boundary": source_boundary or None,
                    "decision": "include_paper_converting_and_finishing_as_downstream_process_topics",
                    "basis": "D112 global reconciliation supports two primary process areas and explicitly places converting/finishing under pulp and paper pending evidence of a distinct learner route.",
                    "excluded_candidate_key": "D112:paper-converting-and-finishing-not-a-separate-area-yet",
                }
            raw_key = str(area.get("key") or "").strip()
            area_key = raw_key or slug(label)
            if area_key in seen and seen[area_key] != label:
                key_collisions.append(
                    {"domain_id": domain_id, "area_key": area_key, "labels": f"{seen[area_key]} | {label}"}
                )
                area_key = f"{area_key}-{hashlib.sha1(label.encode('utf-8')).hexdigest()[:8]}"
            seen[area_key] = label
            source_ids = area.get("source_ids") or []
            if isinstance(source_ids, str):
                source_ids = [source_ids]
            source_ids = list(dict.fromkeys(str(item).strip() for item in source_ids if str(item).strip()))
            source_urls = area.get("source_urls") or []
            if isinstance(source_urls, str):
                source_urls = [source_urls]
            evidence = area.get("evidence") or []
            if not evidence:
                evidence = [
                    item
                    for source_id in source_ids
                    for item in captured_sources.get(source_id, [])
                ]
            if not evidence and domain_cards:
                # Some Step 1 rows cite sources at the domain decision rather
                # than repeat them on every area. Promote only source cards
                # whose own title/locator/claim text names this area.
                evidence = [card for card in domain_cards if source_supports_area(card, label)]
                if not evidence:
                    domain_sources_without_area_match.append(f"{domain_id}:{area_key}")
            if evidence:
                source_ids = list(dict.fromkeys(
                    source_ids + [str(item.get("source_id")) for item in evidence if item.get("source_id")]
                ))
                source_urls = list(dict.fromkeys(
                    source_urls + [str(item.get("url")) for item in evidence if item.get("url")]
                ))
            # De-duplicate exact source cards while preserving deterministic order.
            evidence = list({
                json.dumps(item, ensure_ascii=False, sort_keys=True): item
                for item in evidence if isinstance(item, dict)
            }.values())
            evidence.sort(key=lambda item: (str(item.get("source_id") or ""), str(item.get("url") or ""), str(item.get("locator") or "")))
            area_status = (
                "not_separate_area_candidate" if label_is_excluded
                else str(area.get("status") or "recommendation_needs_role_and_context_integration")
            )
            status_counts[area_status] += 1
            areas.append({
                "area_key": f"{domain_id}:{area_key}",
                "source_key": raw_key or None,
                "label": label,
                "boundary": boundary or None,
                "boundary_reconciliation": boundary_reconciliation,
                "source_support_claim": area.get("source_support_claim"),
                "source_ids": source_ids,
                "source_urls": list(dict.fromkeys(str(item).strip() for item in source_urls if str(item).strip())),
                "evidence": evidence,
                "recommendation_status": area_status,
                "student_visible": False,
                "nigerian_context": None,
                "role_keys": [],
            })
            if not source_ids and not source_urls and not evidence:
                domains_with_empty_citations.append(domain_id)
                areas_with_empty_citations.append(f"{domain_id}:{area_key}")
            if source_ids and not evidence:
                areas_missing_captured_source_cards.append(f"{domain_id}:{area_key}")

        domains.append({
            "domain_id": domain_id,
            "domain_name": source_domain.get("domain_name"),
            "step1_status": source_domain.get("step1_status"),
            "disposition": source_domain.get("disposition"),
            "recommendation_text": (
                recommendation_metadata.get("recommendation_text")
                or recommendation_metadata.get("count_status_or_rationale")
            ),
            "count_rationale": recommendation_metadata.get("count_status_or_rationale"),
            "defensibility_and_rejected_alternatives": recommendation_metadata.get("defensibility_and_rejected_alternatives"),
            "areas": areas,
            "recommended_area_count_normalized": len(areas),
            "source_capture_complete": bool(source_domain.get("source_capture_complete")),
            "source_capture_quality": source_domain.get("source_capture_quality") or {},
            "evidence_artifact": source_domain.get("evidence_artifact"),
            "open_items": source_domain.get("open_items") or [],
            "nigerian_context_status": "not_started",
            "canonical_status": "not_activated_pending_role_route_and_context_reconciliation",
        })
        ids.add(domain_id)

    document = {
        "schema_version": "2026-10-07.domain-specialization-catalog.v1",
        "status": "normalized_integration_catalog_not_student_active",
        "source": str(STEP1.relative_to(ROOT)).replace("\\", "/"),
        "policy": {
            "subgroups_are_areas_of_specialization_or_practice": True,
            "isco_membership_is_not_area_fit_evidence": True,
            "nigerian_context_is_separate_from_global_specialization": True,
            "student_visibility_requires_role_route_and_area_context_reconciliation": True,
            "external_academic_signoff_claim": False,
        },
        "counts": {
            "domain_records": len(domains),
            "domains_with_areas": sum(bool(item["areas"]) for item in domains),
            "no_specialization_recommended_domains": sum(not item["areas"] for item in domains),
            "area_records": sum(len(item["areas"]) for item in domains),
            "student_area_candidates_before_role_gate": sum(len(item["areas"]) for item in domains),
            "excluded_area_candidates_folded_into_existing_areas": len(excluded_area_candidates),
            "recommendation_area_statuses": dict(sorted(status_counts.items())),
            "domains_with_areas_missing_inline_citations": len(set(domains_with_empty_citations)),
            "areas_missing_inline_citations": len(areas_with_empty_citations),
            "duplicate_key_conflicts": len(key_collisions),
            "source_reported_count_variances": len(source_count_variances),
            "areas_missing_captured_source_cards": len(areas_missing_captured_source_cards),
            "domain_sources_without_area_specific_match": len(domain_sources_without_area_match),
        },
        "domain_id_integrity": {
            "duplicate_domain_ids": source.get("duplicate_domain_ids") or [],
            "missing_domain_ids": source.get("missing_domain_ids") or [],
            "unique_domain_count": len(ids),
        },
        "key_conflicts": key_collisions,
        "source_reported_count_variances": source_count_variances,
        "areas_missing_captured_source_cards": areas_missing_captured_source_cards,
        "domain_sources_without_area_specific_match": domain_sources_without_area_match,
        "excluded_area_candidates": excluded_area_candidates,
        "domains_with_areas_missing_inline_citations": sorted(set(domains_with_empty_citations)),
        "areas_missing_inline_citations": areas_with_empty_citations,
        "domains": domains,
    }
    OUTPUT.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps({
        "schema_version": "2026-10-07.domain-specialization-catalog-materialization-report.v1",
        "output": str(OUTPUT.relative_to(ROOT)).replace("\\", "/"),
        "status": document["status"],
        "counts": document["counts"],
        "integrity": document["domain_id_integrity"],
        "key_conflicts": key_collisions,
        "source_reported_count_variances": source_count_variances,
        "areas_missing_captured_source_cards": areas_missing_captured_source_cards,
        "domain_sources_without_area_specific_match": domain_sources_without_area_match,
        "excluded_area_candidates": excluded_area_candidates,
        "domains_with_areas_missing_inline_citations": document["domains_with_areas_missing_inline_citations"],
        "areas_missing_inline_citations": areas_with_empty_citations,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(document["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
