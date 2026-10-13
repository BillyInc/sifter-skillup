"""Workstream C: reconcile raw and canonical role routes for D113-D168.

The script is proposal-only. It compares the raw role library with the active
canonical role files and reuses dated parent-domain and area-fit evidence. It
never edits canonical role/domain files, area definitions, or the area-source
reconciler. Title, ISCO/ESCO membership and subgroup membership are explicitly
excluded as fit proof.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
OUT = Path(__file__).resolve().parent
RAW_FILE = DATA / "role_library_v3.json"
CANONICAL_FILES = [
    DATA / "role_library_v3_cleaned.json",
    DATA / "thin_domain_role_overlays.json",
    DATA / "emerging_role_overlays.json",
]
DOMAIN_META_FILE = DATA / "domain_meta.json"
AREA_CATALOG_FILE = DATA / "domain_specialization_catalog.json"
AREA_REVIEW_FILE = (
    AUDIT
    / "role_enrichment_lanes_2026_10_06"
    / "D113_D168"
    / "D113_D168_existing_role_area_fit_review_2026_10_07.json"
)
DOMAIN_REVIEW_DIR = AUDIT / "role_fit_lanes_2026_10_05" / "D085_D168"
DOMAINS = tuple(f"D{number:03}" for number in range(113, 169))
EXCLUDED = {"excluded", "review_only", "audit_only"}
NOW = datetime.now(timezone.utc).isoformat()


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalized_key(domain_id: Any, role_name: Any) -> str:
    return f"{str(domain_id or '').strip()}|{str(role_name or '').strip().casefold()}"


def domain_id(value: Any) -> str:
    text = str(value or "")
    return text if text in DOMAINS else ""


def role_rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [row for row in payload if isinstance(row, dict)]
    if isinstance(payload, dict):
        return [row for row in payload.get("roles", []) if isinstance(row, dict)]
    return []


def is_active(row: dict[str, Any]) -> bool:
    status = str(row.get("student_path_status") or row.get("data_state") or "active").casefold()
    return status not in EXCLUDED


def source_hashes(paths: list[Path]) -> dict[str, str]:
    return {
        str(path.relative_to(ROOT)).replace("/", "\\"): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in paths
    }


def normalize_parent_status(value: Any) -> str:
    lowered = str(value or "").strip().casefold()
    if lowered in {"supported", "supported_for_domain", "reviewed_supported"}:
        return "supported"
    if lowered in {"conditional", "conditional_for_domain", "reviewed_conditional"}:
        return "conditional"
    if lowered in {"unsupported", "unsupported_for_domain", "not_supported", "reviewed_unsupported"}:
        return "unsupported"
    return "external-review"


def citations_for_refs(refs: list[Any], source_map: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for ref in refs:
        value = str(ref)
        source = source_map.get(value)
        if isinstance(source, dict):
            rows.append({"source_id": value, **source})
        elif value.startswith(("http://", "https://")):
            rows.append({
                "source_id": None,
                "url": value,
                "locator": "URL retained by the dated role/domain audit.",
                "supports": None,
                "limitation": "Exact passage must be reopened before final canonical promotion.",
            })
        else:
            rows.append({
                "source_id": value,
                "url": None,
                "locator": None,
                "supports": None,
                "limitation": "Source identifier is not resolvable from this report's source map.",
            })
    return rows


def load_domain_reviews() -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]], list[str]]:
    decisions: dict[str, dict[str, Any]] = {}
    sources: dict[str, dict[str, Any]] = {}
    missing = []
    for did in DOMAINS:
        path = DOMAIN_REVIEW_DIR / f"{did}_role_domain_fit_review_2026_10_05.json"
        if not path.exists():
            missing.append(did)
            continue
        report = read(path)
        source_map = report.get("sources", {}) if isinstance(report.get("sources"), dict) else {}
        sources[did] = {
            "audit_date": report.get("audit_date"),
            "source_map": source_map,
            "scope": report.get("scope"),
            "method": report.get("method"),
            "report": str(path.relative_to(ROOT)).replace("/", "\\"),
        }
        for decision in report.get("decisions", []):
            if not isinstance(decision, dict):
                continue
            role_name = decision.get("role_name") or str(decision.get("role_key", "")).split("|", 1)[-1]
            decisions[normalized_key(did, role_name)] = decision
    return decisions, sources, missing


def load_area_reviews() -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    if not AREA_REVIEW_FILE.exists():
        return {}, {"missing": str(AREA_REVIEW_FILE.relative_to(ROOT)).replace("/", "\\")}
    report = read(AREA_REVIEW_FILE)
    records = {}
    for record in report.get("records", []):
        if isinstance(record, dict) and record.get("normalized_role_key"):
            records[str(record["normalized_role_key"])] = record
    return records, {
        "report": str(AREA_REVIEW_FILE.relative_to(ROOT)).replace("/", "\\"),
        "created_at_utc": report.get("created_at_utc"),
        "policy": report.get("policy", {}),
    }


def area_boundaries(catalog: dict[str, Any]) -> dict[str, dict[str, Any]]:
    result = {}
    for domain in catalog.get("domains", []):
        did = domain_id(domain.get("domain_id"))
        if not did:
            continue
        result[did] = {
            "domain_name": domain.get("domain_name"),
            "step1_status": domain.get("step1_status"),
            "disposition": domain.get("disposition"),
            "recommendation_text": domain.get("recommendation_text"),
            "areas": [
                {
                    "area_key": area.get("area_key"),
                    "label": area.get("label"),
                    "boundary": area.get("boundary"),
                    "source_ids": area.get("source_ids", []),
                    "source_urls": area.get("source_urls", []),
                    "student_visible": area.get("student_visible"),
                    "recommendation_status": area.get("recommendation_status"),
                }
                for area in domain.get("areas", [])
            ],
        }
    return result


def route_rows(row: dict[str, Any], did: str) -> list[dict[str, Any]]:
    routes = row.get("role_domain_routes")
    if not isinstance(routes, list):
        return []
    return [
        {
            "domain_id": route.get("domain_id"),
            "status": route.get("status"),
            "route_type": route.get("route_type"),
            "evidence": route.get("evidence"),
            "is_current_domain": route.get("domain_id") == did,
        }
        for route in routes
        if isinstance(route, dict)
    ]


def classify(
    raw_row: dict[str, Any],
    canonical_rows: list[dict[str, Any]],
    domain_decision: dict[str, Any] | None,
    domain_source: dict[str, Any] | None,
    area_record: dict[str, Any] | None,
    boundaries: dict[str, Any],
    raw_duplicate: bool,
) -> tuple[str, dict[str, Any]]:
    did = domain_id(raw_row.get("domain_id"))
    key = normalized_key(did, raw_row.get("role_name"))
    canonical_row = canonical_rows[0] if canonical_rows else None
    exact_sources = sorted({str(row.get("_source_file")) for row in canonical_rows})
    routes = route_rows(canonical_row or {}, did)
    current_supported_routes = [
        route for route in routes
        if str(route.get("status", "")).casefold() == "supported"
        and route.get("is_current_domain")
    ]
    current_secondary = any(
        str(route.get("route_type", "")).casefold() == "secondary"
        for route in current_supported_routes
    )
    parent_source_status = None
    parent_status = "external-review"
    parent_refs: list[Any] = []
    parent_citations: list[dict[str, Any]] = []
    parent_rationale = "No exact dated parent-domain decision was found for this raw role key."
    if area_record:
        parent = area_record.get("parent_domain_fit", {})
        parent_status = normalize_parent_status(parent.get("status"))
        parent_source_status = parent.get("source_audit_status")
        parent_refs = list(parent.get("source_ids") or [])
        parent_citations = list(parent.get("citations") or [])
        parent_rationale = parent.get("rationale") or parent_rationale
    elif domain_decision:
        parent_source_status = domain_decision.get("domain_fit")
        parent_status = normalize_parent_status(parent_source_status)
        parent_refs = list(domain_decision.get("source_refs") or [])
        source_map = (domain_source or {}).get("source_map", {})
        parent_citations = citations_for_refs(parent_refs, source_map)
        parent_rationale = domain_decision.get("rationale") or parent_rationale

    area_fit = area_record.get("area_fit", {}) if area_record else {}
    area_status = str(area_fit.get("status") or "").casefold()
    area_citations = list(area_fit.get("citations") or [])
    area_key = area_fit.get("area_key")
    area_label = area_fit.get("area_label")
    area_boundary = area_fit.get("area_boundary")
    task = (area_record or {}).get("exact_role_task_evidence") or raw_row.get("description") or ""
    task = str(task).strip()

    if raw_duplicate or len(canonical_rows) > 1:
        classification = "duplicate"
        reason = "The exact role key occurs more than once in the raw or canonical source set; reconcile source ownership before any route decision."
    elif parent_status == "unsupported" or str(parent_source_status or "").casefold() in {"unsupported", "unsupported_for_domain", "not_supported"}:
        classification = "unsupported"
        reason = "The dated task review rejects the role's work activity for this parent domain; title and taxonomy membership cannot override that negative check. If the raw role is absent from canonical, it remains a dropped-but-unsupported proposal rather than an automatic re-add."
    elif parent_status == "conditional" or str(parent_source_status or "").casefold() in {"conditional", "conditional_for_domain"}:
        classification = "conditional"
        reason = "The parent-domain task evidence is conditional or scope-dependent; retain the qualification and do not promote the area route. If the raw role is absent from canonical, it remains a dropped-but-conditional proposal."
    elif not canonical_rows:
        classification = "external-review"
        reason = "Source-backed raw role is absent from the active canonical role files and has no stronger resolved negative/conditional disposition; do not silently re-add it without a fresh task/domain/area review."
    elif area_status in {"supported_existing_decision_reconciled", "supported", "direct_domain_to_role"}:
        classification = "secondary" if current_secondary else "supported"
        reason = "Parent task fit and the recorded role-to-area/direct-route evidence pass the current gate; route multiplicity is retained explicitly."
    else:
        classification = "external-review"
        reason = "Parent fit is supported or not rejected, but the role-to-area task/boundary evidence is not independently resolved in the current artifact."

    decision = {
        "role_key": key,
        "domain_id": did,
        "domain_name": raw_row.get("domain_name") or boundaries.get("domain_name"),
        "role_name": raw_row.get("role_name"),
        "classification": classification,
        "proposal": {
            "action": {
                "supported": "retain_supported_route",
                "secondary": "retain_secondary_route_with_explicit_route_type",
                "conditional": "retain_conditional_for_review",
                "unsupported": "do_not_promote_this_parent_route",
                "duplicate": "deduplicate_after_source_ownership_review",
                "external-review": "hold_for_external_or_exact_task_review",
            }[classification],
            "reason": reason,
            "canonical_edit": False,
        },
        "raw_source_record": {
            "source_index": raw_row.get("_source_index"),
            "source": raw_row.get("source"),
            "esco_code": raw_row.get("esco_code"),
            "isco_group": raw_row.get("isco_group"),
            "description": raw_row.get("description"),
            "also_known_as": raw_row.get("also_known_as"),
        },
        "canonical_match": {
            "present": bool(canonical_rows),
            "source_files": exact_sources,
            "canonical_role_names": sorted({str(row.get("role_name")) for row in canonical_rows}),
            "canonical_route_rows": routes,
            "stored_domain_fit_statuses": sorted({str(row.get("domain_fit_review_status")) for row in canonical_rows if row.get("domain_fit_review_status")}),
            "stored_area_fit_statuses": sorted({str(row.get("specialization_fit_review_status")) for row in canonical_rows if row.get("specialization_fit_review_status")}),
        },
        "task_and_scope_evidence": {
            "task_text": task or None,
            "parent_domain_fit": {
                "status": parent_status,
                "source_audit_status": parent_source_status,
                "rationale": parent_rationale,
                "source_refs": parent_refs,
                "citations": parent_citations,
                "audit_date": (domain_source or {}).get("audit_date"),
                "scope": (domain_source or {}).get("scope"),
            },
            "area_fit": {
                "status": area_status or "not_recorded",
                "area_key": area_key,
                "area_label": area_label,
                "area_boundary": area_boundary,
                "source_refs": area_fit.get("source_ids", []) if area_record else [],
                "citations": area_citations,
                "audit_created_at": area_record.get("area_fit", {}).get("audit_date") if area_record else None,
            },
            "current_domain_definition": {
                "domain_name": boundaries.get("domain_name"),
                "step1_status": boundaries.get("step1_status"),
                "disposition": boundaries.get("disposition"),
                "recommendation_text": boundaries.get("recommendation_text"),
            },
            "current_area_boundaries": boundaries.get("areas", []),
        },
        "multiple_routes": routes,
        "negative_checks": {
            "title_used_as_fit_proof": False,
            "isco_or_esco_membership_used_as_fit_proof": False,
            "subgroup_membership_used_as_fit_proof": False,
            "task_text_present": bool(task),
            "explicit_parent_scope_available": bool((domain_source or {}).get("scope")),
            "area_boundary_available": bool(boundaries.get("areas")),
            "parent_rejection_preserved": classification == "unsupported",
            "missing_canonical_match_flagged": not bool(canonical_rows),
        },
        "provenance": {
            "domain_review_report": (domain_source or {}).get("report"),
            "domain_audit_date": (domain_source or {}).get("audit_date"),
            "area_review_report": str(AREA_REVIEW_FILE.relative_to(ROOT)).replace("/", "\\") if AREA_REVIEW_FILE.exists() else None,
            "area_review_created_at": None,
        },
        "canonical_files_edited": False,
    }
    return classification, decision


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    raw_all = role_rows(read(RAW_FILE))
    raw_rows = []
    for index, row in enumerate(raw_all):
        did = domain_id(row.get("domain_id"))
        if did:
            copy = dict(row)
            copy["_source_index"] = index
            raw_rows.append(copy)

    canonical_by_key: dict[str, list[dict[str, Any]]] = defaultdict(list)
    canonical_only_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for path in CANONICAL_FILES:
        for index, row in enumerate(role_rows(read(path))):
            did = domain_id(row.get("domain_id"))
            if not did or not is_active(row):
                continue
            copy = dict(row)
            copy["_source_file"] = path.name
            copy["_source_index"] = index
            canonical_by_key[normalized_key(did, row.get("role_name"))].append(copy)

    raw_by_key: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in raw_rows:
        raw_by_key[normalized_key(row.get("domain_id"), row.get("role_name"))].append(row)

    domain_decisions, domain_sources, missing_domain_reviews = load_domain_reviews()
    area_reviews, area_review_meta = load_area_reviews()
    boundaries = area_boundaries(read(AREA_CATALOG_FILE))
    domain_meta = read(DOMAIN_META_FILE)
    for did in DOMAINS:
        boundaries.setdefault(did, {})
        boundaries[did].setdefault("domain_name", (domain_meta.get(did) or {}).get("domain_name"))

    decisions = []
    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    counts = Counter()
    for did in DOMAINS:
        for key, rows in sorted(raw_by_key.items()):
            if not key.startswith(f"{did}|"):
                continue
            row = rows[0]
            classification, decision = classify(
                row,
                canonical_by_key.get(key, []),
                domain_decisions.get(key),
                domain_sources.get(did),
                area_reviews.get(key),
                boundaries.get(did, {}),
                len(rows) > 1,
            )
            decision["raw_duplicate_count"] = len(rows)
            decisions.append(decision)
            by_domain[did].append(decision)
            counts[classification] += 1

        partial = {
            "schema_version": "2026-10-07.role-reconciliation-workstream-c-checkpoint.v1",
            "lane": "D113-D168",
            "last_completed_domain": did,
            "completed_domains": [item for item in DOMAINS if int(item[1:]) <= int(did[1:])],
            "counts_through_domain": dict(sorted(Counter(d["classification"] for d in decisions).items())),
            "role_records_through_domain": len(decisions),
            "next_domain": f"D{int(did[1:]) + 1:03}" if did != DOMAINS[-1] else None,
            "canonical_files_edited": False,
            "area_definitions_edited": False,
            "area_source_reconciler_edited": False,
            "computational_files_edited": False,
        }
        write(OUT / f"checkpoint_{did}.json", partial)

    raw_keys = set(raw_by_key)
    canonical_keys = set(canonical_by_key)
    dropped = sorted(raw_keys - canonical_keys)
    canonical_only = sorted(canonical_keys - raw_keys)
    duplicate_raw = sorted(key for key, rows in raw_by_key.items() if len(rows) > 1)
    duplicate_canonical = sorted(key for key, rows in canonical_by_key.items() if len(rows) > 1)

    canonical_only_records = []
    for key in canonical_only:
        rows = canonical_by_key[key]
        canonical_only_records.append({
            "role_key": key,
            "domain_id": rows[0].get("domain_id"),
            "role_name": rows[0].get("role_name"),
            "source_files": sorted({row.get("_source_file") for row in rows}),
            "duplicate": len(rows) > 1,
            "note": "Present in current active canonical files but absent from raw role_library_v3.json; preserved as a comparison fact, not treated as a raw dropped role.",
        })

    source_inputs = [RAW_FILE, DOMAIN_META_FILE, AREA_CATALOG_FILE, AREA_REVIEW_FILE, *CANONICAL_FILES]
    source_inputs.extend(
        DOMAIN_REVIEW_DIR / f"{did}_role_domain_fit_review_2026_10_05.json"
        for did in DOMAINS
        if (DOMAIN_REVIEW_DIR / f"{did}_role_domain_fit_review_2026_10_05.json").exists()
    )
    result = {
        "schema_version": "2026-10-07.role-reconciliation-workstream-c.v1",
        "generated_at_utc": NOW,
        "workstream": "C",
        "scope": "Role parent-domain fit and role-to-area-of-specialization fit for D113-D168 only.",
        "terminology": "area of specialization = subgroup = area of practice",
        "classification_definitions": {
            "supported": "Current parent-domain task evidence is supported and the role-to-area/direct-route evidence is supported for the current primary route.",
            "secondary": "The role has a supported current-domain route explicitly marked secondary among multiple routes; it is not silently treated as primary.",
            "conditional": "Task/domain scope supports only a qualified or context-dependent parent route.",
            "unsupported": "The recorded work activity fails the current parent-domain boundary; this negative result is preserved.",
            "duplicate": "The exact role key is duplicated in the raw or canonical source set and requires ownership/deduplication review.",
            "external-review": "The raw role was dropped, lacks an exact dated decision, or lacks independently resolved area-boundary evidence.",
        },
        "policy": {
            "task_work_activity_is_primary_evidence": True,
            "domain_and_area_boundaries_checked": True,
            "authoritative_provenance_and_audit_dates_retained": True,
            "explicit_scope_and_exclusions_retained": True,
            "multiple_routes_retained": True,
            "negative_checks_retained": True,
            "title_used_as_fit_proof": False,
            "isco_or_esco_membership_used_as_fit_proof": False,
            "subgroup_membership_used_as_fit_proof": False,
            "canonical_files_edited": False,
            "area_definitions_edited": False,
            "area_source_reconciler_edited": False,
        },
        "inputs": {
            "raw_role_library": str(RAW_FILE.relative_to(ROOT)).replace("/", "\\"),
            "canonical_role_files": [str(path.relative_to(ROOT)).replace("/", "\\") for path in CANONICAL_FILES],
            "domain_meta": str(DOMAIN_META_FILE.relative_to(ROOT)).replace("/", "\\"),
            "area_catalog": str(AREA_CATALOG_FILE.relative_to(ROOT)).replace("/", "\\"),
            "area_review": area_review_meta,
            "domain_review_dir": str(DOMAIN_REVIEW_DIR.relative_to(ROOT)).replace("/", "\\"),
            "missing_domain_review_files": missing_domain_reviews,
            "sha256": source_hashes([path for path in source_inputs if path.exists()]),
        },
        "counts": {
            "domains_checked": len(DOMAINS),
            "raw_rows": len(raw_rows),
            "raw_unique_role_keys": len(raw_by_key),
            "canonical_active_source_rows": sum(len(rows) for rows in canonical_by_key.values()),
            "canonical_active_unique_role_keys": len(canonical_by_key),
            "raw_dropped_from_canonical": len(dropped),
            "canonical_only_not_in_raw": len(canonical_only),
            "raw_duplicate_keys": len(duplicate_raw),
            "canonical_duplicate_keys": len(duplicate_canonical),
            "classifications": dict(sorted(counts.items())),
        },
        "role_decisions": decisions,
        "dropped_source_backed_role_keys": dropped,
        "raw_duplicate_role_keys": duplicate_raw,
        "canonical_duplicate_role_keys": duplicate_canonical,
        "canonical_only_records": canonical_only_records,
        "integrity": {
            "one_decision_per_raw_unique_key": len(decisions) == len(raw_by_key),
            "all_domains_present": len({decision["domain_id"] for decision in decisions}) == len(DOMAINS),
            "dropped_roles_not_auto_added": True,
            "canonical_files_edited": False,
            "area_definitions_edited": False,
            "area_source_reconciler_edited": False,
            "computational_files_edited": False,
        },
        "limitations": [
            "This is a disjoint proposal/reconciliation artifact, not a canonical seed or API update.",
            "Dropped raw roles are flagged for external review; absence from the active canonical files is not treated as proof that the source role is wrong.",
            "Area route promotion requires an independently recorded task-to-boundary decision; current area membership is not used as proof.",
        ],
    }
    proposal = {
        "schema_version": "2026-10-07.role-reconciliation-workstream-c-proposals.v1",
        "scope": result["scope"],
        "canonical_edits_proposed": False,
        "proposals": [
            {
                "role_key": decision["role_key"],
                "classification": decision["classification"],
                "action": decision["proposal"]["action"],
                "reason": decision["proposal"]["reason"],
                "canonical_edit_required": False,
            }
            for decision in decisions
        ],
        "dropped_source_backed_roles_require_external_review": dropped,
    }
    write(OUT / "D113_D168_role_reconciliation.json", result)
    write(OUT / "D113_D168_role_reconciliation_proposals.json", proposal)
    checkpoint = {
        "schema_version": "2026-10-07.role-reconciliation-workstream-c-checkpoint.v1",
        "status": "completed",
        "lane": "D113-D168",
        "completed_domains": list(DOMAINS),
        "next_domain": None,
        "result_file": "D113_D168_role_reconciliation.json",
        "proposal_file": "D113_D168_role_reconciliation_proposals.json",
        "counts": result["counts"],
        "classifications": result["classification_definitions"],
        "canonical_files_edited": False,
        "area_definitions_edited": False,
        "area_source_reconciler_edited": False,
        "computational_files_edited": False,
    }
    write(OUT / "D113_D168_role_reconciliation_checkpoint.json", checkpoint)
    md = [
        "# Workstream C — D113–D168 role reconciliation",
        "",
        "Status: **completed as a disjoint proposal/reconciliation pass**. Canonical role files, area definitions and the area-source reconciler were not edited.",
        "",
        "## Scope and evidence",
        "",
        "- Audited all 56 domains D113–D168.",
        "- Compared raw `role_library_v3.json` with the active cleaned/overlay role files.",
        "- Parent fit uses dated task/work-activity decisions and explicit domain scope.",
        "- Role→area fit uses recorded area boundaries, task evidence, source provenance and negative checks.",
        "- Titles, ISCO/ESCO membership and existing subgroup membership were not used as proof.",
        "",
        "## Counts",
        "",
        f"- Raw rows: **{result['counts']['raw_rows']}**; raw unique keys: **{result['counts']['raw_unique_role_keys']}**.",
        f"- Raw source-backed keys absent from active canonical files: **{result['counts']['raw_dropped_from_canonical']}**.",
        f"- Canonical-only keys not present in raw: **{result['counts']['canonical_only_not_in_raw']}**.",
        f"- Raw duplicate keys: **{result['counts']['raw_duplicate_keys']}**; canonical duplicate keys: **{result['counts']['canonical_duplicate_keys']}**.",
        f"- Classifications: **{result['counts']['classifications']}**.",
        "",
        "## Classification meaning",
        "",
        "Supported means the parent task fit and current area/direct route pass the evidence gate. Secondary means a supported non-primary route is explicitly retained. Conditional means scope-dependent. Unsupported preserves a negative task/domain result. Duplicate marks exact-key source duplication. External-review marks dropped roles or unresolved task/area evidence.",
        "",
        "## Checkpoint and proposals",
        "",
        "- `D113_D168_role_reconciliation_checkpoint.json` — final machine-readable checkpoint.",
        "- `D113_D168_role_reconciliation.json` — full decisions, provenance, boundaries and raw/canonical comparison.",
        "- `D113_D168_role_reconciliation_proposals.json` — non-mutating proposals.",
        "- `checkpoint_D113.json` through `checkpoint_D168.json` — incremental domain checkpoints.",
        "",
        "The D113–D168 assigned domain range is exhausted; no canonical changes were made.",
    ]
    (OUT / "D113_D168_role_reconciliation_checkpoint.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"status": "completed", "counts": result["counts"], "output": str(OUT)}, indent=2))


if __name__ == "__main__":
    main()
