"""Repair area-level evidence links from captured, source-backed review files.

Only exact source-ID/URL matches or direct textual support matches are applied.
General domain citations are not copied wholesale onto every area.  Missing
evidence stays an explicit residual for targeted external sourcing.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT
AUDIT = DATA / "_audit"
STRUCTURE = DATA / "domain_structure.json"
CATALOG = DATA / "domain_specialization_catalog.json"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
REPORT = AUDIT / "GLOBAL_SPECIALIZATION_AREA_EVIDENCE_LINK_REPAIR_2026_10_07.json"

STOP = {
    "and", "or", "of", "the", "for", "in", "to", "with", "a", "an", "from",
    "as", "by", "on", "within", "across", "practice", "area", "areas",
    "specialization", "specializations", "domain", "global", "distinct", "related",
}


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_url(value: Any) -> str:
    return str(value or "").strip().rstrip("/").casefold()


def tokens(value: Any) -> set[str]:
    words = set(re.findall(r"[a-z0-9]+", str(value or "").casefold())) - STOP
    return {word for word in words if len(word) > 2}


def source_record(node: dict[str, Any], artifact: Path) -> dict[str, Any] | None:
    url = node.get("url") or node.get("source_url")
    locator = node.get("locator") or node.get("source_locator")
    supports = node.get("supports") or node.get("claim_supported") or node.get("claim_support")
    limit = node.get("claim_limit") or node.get("limits")
    if not url or not locator or not (supports or limit):
        return None
    return {
        "source_id": str(node.get("source_id") or node.get("id") or "").strip() or None,
        "publisher": node.get("publisher"),
        "title": node.get("title"),
        "url": str(url).strip(),
        "locator": str(locator).strip(),
        "supports": supports,
        "claim_limit": limit,
        "source_artifact_locator": node.get("source_artifact_locator"),
        "_artifact": str(artifact.relative_to(ROOT)).replace("\\", "/"),
    }


def collect_sources(node: Any, artifact: Path, out: list[dict[str, Any]]) -> None:
    if isinstance(node, dict):
        row = source_record(node, artifact)
        if row:
            out.append(row)
        for value in node.values():
            collect_sources(value, artifact, out)
    elif isinstance(node, list):
        for value in node:
            collect_sources(value, artifact, out)


def index_source_files() -> tuple[dict[str, list[dict[str, Any]]], dict[str, list[dict[str, Any]]]]:
    by_id: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_url: dict[str, list[dict[str, Any]]] = defaultdict(list)
    roots = [
        AUDIT / "specialization_lanes_2026_10_05",
        AUDIT / "domains",
    ]
    files = sorted({p for root in roots if root.exists() for p in root.rglob("*.json")})
    # A few foundational domain reviews live directly under _audit.
    files.extend(p for p in (
        AUDIT / "domain_specialization_review_2026_10_03.json",
        AUDIT / "specialization_review_evidence_register_2026_10_06.json",
    ) if p.exists())
    for path in files:
        try:
            value = read(path)
        except (OSError, json.JSONDecodeError):
            continue
        rows: list[dict[str, Any]] = []
        collect_sources(value, path, rows)
        for row in rows:
            if row.get("source_id"):
                by_id[row["source_id"]].append(row)
            by_url[normalize_url(row.get("url"))].append(row)
    return by_id, by_url


def dedupe(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in rows:
        key = (str(row.get("source_id") or ""), normalize_url(row.get("url")), str(row.get("locator") or ""))
        clean = {k: v for k, v in row.items() if not k.startswith("_")}
        clean["source_artifact"] = row.get("_artifact")
        result.setdefault(key, clean)
    return list(result.values())


def direct_text_support(area: dict[str, Any], source: dict[str, Any]) -> tuple[bool, float]:
    """Return a conservative lexical match for an explicitly area-supporting claim."""
    label_tokens = tokens(area.get("label"))
    if not label_tokens:
        return False, 0.0
    claim_tokens = tokens(" ".join(str(source.get(k) or "") for k in ("supports", "title", "locator")))
    overlap = label_tokens & claim_tokens
    ratio = len(overlap) / len(label_tokens)
    # Require multiple distinctive label terms. Very broad sources are kept
    # at the domain level and cannot pass this rule merely by saying "practice".
    required = 2 if len(label_tokens) > 1 else 1
    if len(overlap) >= required and ratio >= 0.60:
        return True, ratio
    return False, ratio


def main() -> None:
    catalog = read(CATALOG)
    structure = read(STRUCTURE)
    source_by_id, source_by_url = index_source_files()
    counts: Counter[str] = Counter()
    unresolved: list[dict[str, Any]] = []
    applied: list[dict[str, Any]] = []
    duplicate_conflicts: list[dict[str, Any]] = []

    for domain in catalog.get("domains") or []:
        domain_id = str(domain.get("domain_id") or "")
        canonical_domain = structure.get(domain_id)
        if not canonical_domain:
            raise ValueError(f"Missing canonical domain {domain_id}")
        canonical_areas = {str(row.get("area_id") or ""): row for row in canonical_domain.get("areas_of_specialization") or []}
        domain_refs = canonical_domain.get("areas_of_specialization_evidence") or []
        for area in domain.get("areas") or []:
            area_id = str(area.get("area_key") or area.get("area_id") or "")
            record = canonical_areas.get(area_id)
            if not record:
                raise ValueError(f"Missing canonical area record {area_id}")
            existing = list(record.get("source_references") or [])
            existing_keys = {(str(x.get("source_id") or ""), normalize_url(x.get("url")), str(x.get("locator") or "")) for x in existing}
            candidates: list[tuple[str, dict[str, Any], float]] = []
            source_ids = area.get("source_ids") or []
            if isinstance(source_ids, str):
                source_ids = [source_ids]
            for source_id in source_ids:
                matched = source_by_id.get(str(source_id), [])
                if matched:
                    candidates.extend(("exact_source_id", row, 1.0) for row in matched)
                else:
                    counts["unresolved_catalog_source_ids"] += 1
            source_urls = area.get("source_urls") or []
            if isinstance(source_urls, str):
                source_urls = [source_urls]
            for url in source_urls:
                matched = source_by_url.get(normalize_url(url), [])
                if matched:
                    candidates.extend(("exact_source_url_with_locator", row, 1.0) for row in matched)

            if not source_ids and not source_urls:
                for source in domain_refs:
                    ok, score = direct_text_support(area, source)
                    if ok:
                        candidates.append(("area_label_matches_captured_support", source, score))

            selected: dict[tuple[str, str, str], tuple[str, dict[str, Any], float]] = {}
            for method, candidate, score in candidates:
                key = (str(candidate.get("source_id") or ""), normalize_url(candidate.get("url")), str(candidate.get("locator") or ""))
                if key in existing_keys:
                    continue
                prior = selected.get(key)
                if prior and prior[1].get("supports") != candidate.get("supports"):
                    duplicate_conflicts.append({"area_id": area_id, "source_key": key, "reason": "same ID/URL/locator has conflicting support text"})
                    continue
                selected.setdefault(key, (method, candidate, score))

            for method, candidate, score in selected.values():
                new_ref = {k: v for k, v in candidate.items() if not k.startswith("_")}
                new_ref["source_artifact"] = candidate.get("_artifact")
                new_ref["area_link_resolution"] = {"method": method, "label_support_overlap": round(score, 3)}
                existing.append(new_ref)
                existing_keys.add((str(new_ref.get("source_id") or ""), normalize_url(new_ref.get("url")), str(new_ref.get("locator") or "")))
                applied.append({"domain_id": domain_id, "area_id": area_id, "label": area.get("label"), "source_id": new_ref.get("source_id"), "url": new_ref.get("url"), "method": method, "overlap": round(score, 3)})
                counts[method] += 1

            record["source_references"] = dedupe(existing)
            record["source_evidence_status"] = "source_linked" if record["source_references"] else "source_link_unresolved"
            record["area_evidence_link_check"] = {
                "checked_against_catalog_and_captured_review_sources": True,
                "resolution_methods": sorted({x.get("area_link_resolution", {}).get("method", "existing_reviewed_link") for x in record["source_references"]}),
                "unresolved_catalog_source_ids": [str(x) for x in source_ids if str(x) not in source_by_id],
            }
            if not record["source_references"]:
                unresolved.append({
                    "domain_id": domain_id,
                    "area_id": area_id,
                    "label": area.get("label"),
                    "boundary": area.get("boundary"),
                    "catalog_source_ids": source_ids,
                    "catalog_source_urls": source_urls,
                    "reason": "No captured source with area-specific support and a usable locator was found; targeted external source search required.",
                })

    report = {
        "schema_version": "2026-10-07.specialization-area-evidence-link-repair.v1",
        "status": "source_backed_links_applied_with_targeted_residual_queue",
        "terminology": "subgroup equals area of specialization equals area of practice",
        "counts": {
            "canonical_area_records": sum(len(d.get("areas_of_specialization") or []) for d in structure.values()),
            "already_linked_before_run": sum(1 for d in structure.values() for a in d.get("areas_of_specialization") or [] if a.get("source_evidence_status") == "source_linked"),
            "newly_linked_source_records": len(applied),
            "unresolved_area_records": len(unresolved),
            "unresolved_source_id_instances": counts["unresolved_catalog_source_ids"],
            "duplicate_source_conflicts": len(duplicate_conflicts),
        },
        "resolution_counts": dict(counts),
        "new_links": applied,
        "unresolved": unresolved,
        "duplicate_conflicts": duplicate_conflicts,
        "policy": "Exact source IDs/URLs or a conservative match between area label and source-supported claim only. Domain-level sources are not blanket-copied to child areas.",
    }
    write(STRUCTURE, structure)
    write(REPORT, report)
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
