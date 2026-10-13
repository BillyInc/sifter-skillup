"""Audit-only reconciliation proposals for role -> domain and role -> area fit.

This file deliberately does not edit canonical role, domain, or area files.  It
reads the current canonical/overlay records, the raw role library, source-backed
work profiles, domain descriptions, and the current area catalog, then writes a
disjoint JSON/Markdown checkpoint into this directory.

The decisive evidence is source-backed role work: activities, work-activity
signals, and the source description when activities are unavailable.  Role title,
ISCO group, subgroup membership, and an existing mapping by themselves never
create a supported disposition.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable


TARGET = Path(__file__).resolve().parent
# target / lane / _audit / career-mapping / data / repo
ROOT = TARGET.parents[4]
CAREER = ROOT / "data" / "career-mapping"
AUDIT = CAREER / "_audit"
TODAY = "2026-10-07"
DOMAIN_IDS = {f"D{i:03d}" for i in range(1, 57)}

INPUTS = [
    CAREER / "role_library_v3.json",
    CAREER / "role_library_v3_cleaned.json",
    CAREER / "thin_domain_role_overlays.json",
    CAREER / "emerging_role_overlays.json",
    CAREER / "role_work_profiles.json",
    CAREER / "domain_meta.json",
    CAREER / "domain_structure.json",
]

STOPWORDS = {
    "and", "the", "for", "with", "from", "that", "this", "into", "their",
    "within", "across", "where", "which", "will", "using", "used", "use",
    "work", "works", "working", "role", "roles", "area", "areas", "domain",
    "systems", "system", "services", "service", "process", "processes",
    "data", "information", "including", "such", "than", "also", "other",
    "may", "can", "are", "its", "not", "only", "through", "based", "these",
    "into", "over", "under", "their", "them", "they", "have", "has", "being",
}

AUTHORITATIVE_HOSTS = (
    "onetonline.org", "onetcenter.org", "data.europa.eu", "esco.ec.europa.eu",
    "ilo.org", "iso.org", "nist.gov", "computer.org", "acm.org", "ieee.org",
    "sfia-online.org", "dama.org", "gov.ng", "edu.ng", "org.ng",
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id', '')}|{(row.get('role_name') or row.get('role_title') or '').strip()}"


def norm_key(row: dict[str, Any]) -> tuple[str, str]:
    return (
        str(row.get("domain_id", "")).upper(),
        (row.get("role_name") or row.get("role_title") or "").strip().casefold(),
    )


def text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return " ".join(text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(text(v) for v in value.values())
    return ""


def tokens(value: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z][a-z0-9+/#.-]{2,}", value.casefold())
        if token not in STOPWORDS and not token.isdigit()
    }


def refs_from(row: dict[str, Any]) -> list[str]:
    refs: list[str] = []
    for field in ("domain_fit_review_source_refs", "specialization_fit_review_source_refs"):
        value = row.get(field)
        if isinstance(value, list):
            refs.extend(str(x) for x in value if x)
    for route_field in ("role_domain_routes", "role_area_routes"):
        routes = row.get(route_field)
        if not isinstance(routes, list):
            continue
        for route in routes:
            if not isinstance(route, dict):
                continue
            evidence = route.get("evidence") or {}
            if not isinstance(evidence, dict):
                continue
            if isinstance(evidence.get("source_refs"), list):
                refs.extend(str(x) for x in evidence["source_refs"] if x)
    return list(dict.fromkeys(refs))


def source_backed(row: dict[str, Any], profile: dict[str, Any] | None) -> bool:
    status = str((profile or {}).get("source_record_status") or row.get("data_state") or "")
    if status.casefold() in {"source_backed", "verified", "supported"}:
        return True
    if (profile or {}).get("source_links") or refs_from(row):
        return True
    source = str(row.get("source") or "").casefold()
    # A raw role marked only as an internal audit/creative addition is not
    # treated as source-backed without an attached source record.
    return source in {"esco", "onet", "esco/onet", "ilo", "global_esco", "global_onet"}


def authoritative_refs(refs: Iterable[str]) -> list[str]:
    result = []
    for ref in refs:
        low = str(ref).casefold()
        if any(host in low for host in AUTHORITATIVE_HOSTS) or low.startswith("data\\"):
            result.append(str(ref))
    return list(dict.fromkeys(result))


def task_evidence(row: dict[str, Any], profile: dict[str, Any] | None) -> tuple[str, list[str]]:
    """Return evidence text and its provenance labels; never includes title/ISCO."""
    pieces: list[str] = []
    labels: list[str] = []
    if profile:
        activities = profile.get("activities")
        if isinstance(activities, list) and activities:
            pieces.append(text(activities))
            labels.append("source_profile.activities")
        activities2 = profile.get("work_activities")
        if isinstance(activities2, list) and activities2:
            pieces.append(text(activities2))
            labels.append("source_profile.work_activities")
    if not pieces and row.get("description"):
        pieces.append(str(row["description"]))
        labels.append("role_record.description_fallback")
    return " ".join(pieces), labels


def profile_index(profiles: list[dict[str, Any]]) -> dict[tuple[str, str], dict[str, Any]]:
    result: dict[tuple[str, str], dict[str, Any]] = {}
    for profile in profiles:
        did = str(profile.get("domain_id", "")).upper()
        name = (profile.get("role_name") or "").strip().casefold()
        if did and name and (did, name) not in result:
            result[(did, name)] = profile
    return result


def source_profile_refs(row: dict[str, Any], profile: dict[str, Any] | None) -> list[str]:
    refs = refs_from(row)
    if profile:
        links = profile.get("source_links")
        if isinstance(links, list):
            refs.extend(str(item.get("url")) for item in links if isinstance(item, dict) and item.get("url"))
        source = profile.get("source")
        if isinstance(source, dict) and source.get("url"):
            refs.append(str(source["url"]))
    return list(dict.fromkeys(refs))


def route_for_domain(row: dict[str, Any], domain_id: str) -> list[dict[str, Any]]:
    routes = row.get("role_domain_routes")
    if not isinstance(routes, list):
        return []
    return [r for r in routes if isinstance(r, dict) and str(r.get("domain_id", domain_id)).upper() == domain_id]


def route_for_area(row: dict[str, Any]) -> list[dict[str, Any]]:
    routes = row.get("role_area_routes")
    return routes if isinstance(routes, list) else []


def candidate_scores(evidence: str, definition: str) -> tuple[int, list[str]]:
    ev = tokens(evidence)
    de = tokens(definition)
    hits = sorted(ev & de)
    return len(hits), hits


def domain_fit(
    row: dict[str, Any],
    profile: dict[str, Any] | None,
    domain: dict[str, Any],
    domain_id: str,
    current: bool,
) -> dict[str, Any]:
    evidence, evidence_fields = task_evidence(row, profile)
    refs = source_profile_refs(row, profile)
    auth_refs = authoritative_refs(refs)
    domain_definition = text(domain.get("description"))
    hit_count, hits = candidate_scores(evidence, domain_definition)
    routes = route_for_domain(row, domain_id)
    explicit_status = str(row.get("domain_fit_review_status") or "").casefold()
    route_statuses = [str(r.get("status") or "").casefold() for r in routes]
    has_task_evidence = bool(evidence.strip())
    has_authoritative_provenance = bool(auth_refs)

    if explicit_status == "unsupported":
        disposition = "unsupported"
        reason = "Current source-backed review explicitly rejects this exact parent-domain link; no title/ISCO inference used."
    elif explicit_status in {"supported", "reviewed_supported"} and has_task_evidence and refs:
        disposition = "secondary" if any(str(r.get("route_type")) == "secondary" for r in routes) else "supported"
        reason = "Existing reviewed link is corroborated by source-backed role task/work evidence and retained source references."
    elif explicit_status in {"conditional", "review_required", "unresolved"} or "conditional" in route_statuses:
        disposition = "conditional" if has_task_evidence else "external-review"
        reason = "Existing evidence is explicitly qualified; the role is not promoted beyond that qualification."
    elif not has_task_evidence or not refs:
        disposition = "external-review"
        reason = "No source-backed task/work-activity evidence and provenance sufficient for deterministic parent-domain adjudication."
    elif hit_count >= 3 and has_authoritative_provenance:
        disposition = "conditional"
        reason = "Task evidence has a domain anchor, but no prior reviewed parent-domain decision exists; retained as conditional rather than auto-promoted."
    else:
        disposition = "external-review"
        reason = "Source-backed text exists but does not provide a sufficiently specific, independently reviewed domain anchor."

    return {
        "disposition": disposition,
        "reason": reason,
        "evidence_fields": evidence_fields,
        "task_token_hits_against_domain_definition": hits,
        "task_token_hit_count": hit_count,
        "source_refs": refs,
        "authoritative_source_refs": auth_refs,
        "source_date": row.get("source_date") or (profile or {}).get("source_date") or None,
        "source_date_status": "provided" if row.get("source_date") or (profile or {}).get("source_date") else "not_provided_in_local_record",
        "existing_status": explicit_status or None,
        "existing_route_statuses": route_statuses,
        "current_record": current,
    }


def area_fit(
    row: dict[str, Any],
    profile: dict[str, Any] | None,
    structure: dict[str, Any],
    parent: dict[str, Any],
) -> dict[str, Any]:
    evidence, evidence_fields = task_evidence(row, profile)
    refs = source_profile_refs(row, profile)
    areas = structure.get("areas_of_specialization") or []
    area_by_id = {str(a.get("area_id")): a for a in areas if isinstance(a, dict) and a.get("area_id")}
    routes = route_for_area(row)
    explicit_status = str(row.get("specialization_fit_status") or "").casefold()
    gate = str(row.get("specialization_fit_domain_gate") or "").casefold()
    domain_ok = parent["disposition"] in {"supported", "secondary", "conditional"}

    if not areas:
        return {
            "disposition": "external-review",
            "reason": "The domain has no current area-of-specialization catalogue entry; role-to-area fit is not inferable from subgroup membership.",
            "candidate_area_id": None,
            "candidate_scores": [],
            "evidence_fields": evidence_fields,
            "source_refs": refs,
            "domain_gate": domain_ok,
        }

    supported_routes = [r for r in routes if str(r.get("status") or "").casefold() in {"supported", "reviewed_supported"}]
    conditional_routes = [r for r in routes if str(r.get("status") or "").casefold() in {"conditional", "review_required", "unresolved"}]
    unsupported_routes = [r for r in routes if str(r.get("status") or "").casefold() == "unsupported"]
    if explicit_status == "unsupported" or unsupported_routes:
        return {
            "disposition": "unsupported",
            "reason": "Existing route evidence rejects the exact role-to-area assignment; subgroup/ISCO membership is not used as proof.",
            "candidate_area_id": None,
            "candidate_scores": [],
            "evidence_fields": evidence_fields,
            "source_refs": refs,
            "domain_gate": domain_ok,
        }
    if not domain_ok:
        return {
            "disposition": "conditional" if parent["disposition"] == "conditional" else "external-review",
            "reason": "The parent-domain route is not fully supported, so no role-to-area route is promoted.",
            "candidate_area_id": None,
            "candidate_scores": [],
            "evidence_fields": evidence_fields,
            "source_refs": refs,
            "domain_gate": False,
        }
    if supported_routes and evidence.strip() and refs:
        selected = []
        for route in supported_routes:
            area_id = str(route.get("area_id") or "")
            area = area_by_id.get(area_id)
            if not area:
                continue
            score, hits = candidate_scores(evidence, f"{area.get('label', '')} {area.get('description', '')} {area.get('boundary', '')}")
            selected.append({"area_id": area_id, "score": score, "hits": hits, "route_type": route.get("route_type")})
        if selected:
            primary = any(item.get("route_type") == "primary" for item in selected)
            return {
                "disposition": "supported" if primary else "secondary",
                "reason": "Existing role-to-area route is corroborated by source-backed task/work evidence and the stored area boundary; not inferred from subgroup membership.",
                "candidate_area_id": selected[0]["area_id"],
                "candidate_scores": selected,
                "evidence_fields": evidence_fields,
                "source_refs": refs,
                "domain_gate": True,
            }
    if explicit_status in {"conditional", "review_required", "unresolved"} or conditional_routes:
        return {
            "disposition": "conditional" if evidence.strip() else "external-review",
            "reason": "The existing role-to-area evidence is qualified and cannot be promoted without a specific area-boundary match.",
            "candidate_area_id": None,
            "candidate_scores": [],
            "evidence_fields": evidence_fields,
            "source_refs": refs,
            "domain_gate": True,
        }

    scored: list[dict[str, Any]] = []
    for area in areas:
        if not isinstance(area, dict):
            continue
        definition = f"{area.get('label', '')} {area.get('description', '')} {area.get('boundary', '')}"
        score, hits = candidate_scores(evidence, definition)
        scored.append({"area_id": area.get("area_id"), "label": area.get("label"), "score": score, "hits": hits})
    scored.sort(key=lambda item: (-int(item["score"]), str(item["area_id"])))
    best = scored[0] if scored else None
    second = scored[1] if len(scored) > 1 else None
    margin = int(best["score"] - second["score"]) if best and second else 0
    if best and best["score"] >= 4 and margin >= 2 and refs:
        disposition = "conditional"
        reason = "A unique task-to-boundary candidate exists, but there is no prior reviewed route; retained conditional for human/source confirmation."
        candidate = best["area_id"]
    elif evidence.strip() and refs:
        disposition = "conditional" if best and best["score"] >= 2 else "external-review"
        reason = "Source-backed task evidence is present, but no unique area-boundary match is strong enough for deterministic promotion."
        candidate = best["area_id"] if best and best["score"] >= 2 else None
    else:
        disposition = "external-review"
        reason = "No usable source-backed task evidence for a role-to-area decision."
        candidate = None
    return {
        "disposition": disposition,
        "reason": reason,
        "candidate_area_id": candidate,
        "candidate_scores": scored[:5],
        "evidence_fields": evidence_fields,
        "source_refs": refs,
        "domain_gate": True,
    }


def combined_disposition(parent: dict[str, Any], area: dict[str, Any]) -> str:
    """Conservative final route status, retaining the strongest negative gate."""
    if parent["disposition"] == "unsupported" or area["disposition"] == "unsupported":
        return "unsupported"
    if parent["disposition"] == "external-review" or area["disposition"] == "external-review":
        return "external-review"
    if parent["disposition"] == "conditional" or area["disposition"] == "conditional":
        return "conditional"
    if parent["disposition"] == "secondary" or area["disposition"] == "secondary":
        return "secondary"
    return "supported"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args()
    TARGET.mkdir(parents=True, exist_ok=True)

    raw = read_json(CAREER / "role_library_v3.json")
    cleaned = read_json(CAREER / "role_library_v3_cleaned.json")
    thin = read_json(CAREER / "thin_domain_role_overlays.json").get("roles", [])
    emerging = read_json(CAREER / "emerging_role_overlays.json").get("roles", [])
    profiles = read_json(CAREER / "role_work_profiles.json").get("profiles", [])
    meta = read_json(CAREER / "domain_meta.json")
    structure = read_json(CAREER / "domain_structure.json")

    raw_scope = [r for r in raw if str(r.get("domain_id", "")).upper() in DOMAIN_IDS]
    cleaned_scope = [r for r in cleaned if str(r.get("domain_id", "")).upper() in DOMAIN_IDS]
    thin_scope = [r for r in thin if str(r.get("domain_id", "")).upper() in DOMAIN_IDS]
    emerging_scope = [r for r in emerging if str(r.get("domain_id", "")).upper() in DOMAIN_IDS]
    profile_map = profile_index(profiles)

    raw_by_key: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    current_by_key: dict[tuple[str, str], list[tuple[str, dict[str, Any]]]] = defaultdict(list)
    for row in raw_scope:
        raw_by_key[norm_key(row)].append(row)
    for source_file, rows in (("role_library_v3_cleaned.json", cleaned_scope), ("thin_domain_role_overlays.json", thin_scope), ("emerging_role_overlays.json", emerging_scope)):
        for row in rows:
            current_by_key[norm_key(row)].append((source_file, row))

    records: list[dict[str, Any]] = []
    duplicate_records: list[dict[str, Any]] = []
    dropped: list[dict[str, Any]] = []
    for key in sorted(set(raw_by_key) | set(current_by_key)):
        did, role_name_norm = key
        raws = raw_by_key.get(key, [])
        currents = current_by_key.get(key, [])
        row = currents[0][1] if currents else raws[0]
        source_files = sorted({source for source, _ in currents})
        profile = profile_map.get(key)
        parent = domain_fit(row, profile, meta.get(did, {}), did, bool(currents))
        area = area_fit(row, profile, structure.get(did, {}), parent)
        source_refs = source_profile_refs(row, profile)
        final_disposition = combined_disposition(parent, area)
        record = {
            "record_type": "role_route_proposal",
            "role_key": role_key(row),
            "domain_id": did,
            "domain_name": (meta.get(did) or {}).get("domain_name") or row.get("domain_name"),
            "role_name": row.get("role_name") or row.get("role_title"),
            "canonical_source_files": source_files,
            "present_in_cleaned_canonical": any(source == "role_library_v3_cleaned.json" for source in source_files),
            "present_in_current_overlay": any(source != "role_library_v3_cleaned.json" for source in source_files),
            "present_in_raw_role_library": bool(raws),
            "dropped_from_current_canonical_union": bool(raws) and not currents,
            "raw_occurrence_count": len(raws),
            "current_occurrence_count": len(currents),
            "source_backed": source_backed(row, profile),
            "raw_source_values": sorted({str(r.get("source")) for r in raws if r.get("source")}),
            "profile_source_record_status": (profile or {}).get("source_record_status"),
            "parent_domain_fit": parent,
            "area_of_specialization_fit": area,
            "proposal_status": final_disposition,
            "canonical_change": False,
            "canonical_change_reason": "This workstream is proposal/checkpoint-only; no source record is edited.",
            "evidence_summary": {
                "task_evidence_fields": parent["evidence_fields"],
                "source_refs": source_refs,
                "authoritative_source_refs": authoritative_refs(source_refs),
                "title_or_isco_used_as_proof": False,
                "subgroup_membership_used_as_proof": False,
                "negative_checks": {
                    "parent_domain_explicitly_rejected": parent["disposition"] == "unsupported",
                    "area_route_explicitly_rejected": area["disposition"] == "unsupported",
                    "ambiguous_or_missing_area_anchor": area["disposition"] in {"conditional", "external-review"},
                    "missing_source_backed_task_evidence": not bool(parent["evidence_fields"]),
                },
            },
        }
        records.append(record)
        if raws and not currents and source_backed(row, profile):
            dropped.append({
                "role_key": role_key(row),
                "domain_id": did,
                "role_name": row.get("role_name") or row.get("role_title"),
                "raw_source": row.get("source"),
                "raw_occurrence_count": len(raws),
                "profile_source_record_status": (profile or {}).get("source_record_status"),
                "source_refs": source_profile_refs(row, profile),
                "proposed_parent_disposition": parent["disposition"],
                "proposed_area_disposition": area["disposition"],
                "action": "review_proposal_only; do_not_reintroduce_automatically",
            })
        if len(raws) > 1:
            for index, raw_row in enumerate(raws[1:], start=2):
                duplicate_records.append({
                    "record_type": "duplicate",
                    "role_key": role_key(raw_row),
                    "domain_id": did,
                    "role_name": raw_row.get("role_name") or raw_row.get("role_title"),
                    "raw_occurrence_index": index,
                    "duplicate_of_occurrence": 1,
                    "classification": "duplicate",
                    "reason": "Exact normalized domain-and-role key repeats in raw role library; no title/ISCO inference used.",
                    "source": raw_row.get("source"),
                })

    counts = Counter()
    parent_counts = Counter()
    area_counts = Counter()
    for record in records:
        counts[record["proposal_status"]] += 1
        parent_counts[record["parent_domain_fit"]["disposition"]] += 1
        area_counts[record["area_of_specialization_fit"]["disposition"]] += 1
    for disposition in ("supported", "secondary", "conditional", "unsupported", "external-review"):
        counts.setdefault(disposition, 0)
        parent_counts.setdefault(disposition, 0)
        area_counts.setdefault(disposition, 0)
    counts["duplicate"] = len(duplicate_records)

    batch_ranges = [(1, 14), (15, 28), (29, 42), (43, 56)]
    batches = []
    for start, end in batch_ranges:
        ids = {f"D{i:03d}" for i in range(start, end + 1)}
        batch_records = [r for r in records if r["domain_id"] in ids]
        batch_dropped = [r for r in dropped if r["domain_id"] in ids]
        batch = {
            "batch_id": f"D{start:03d}_D{end:03d}",
            "domain_ids": [f"D{i:03d}" for i in range(start, end + 1)],
            "role_records": len(batch_records),
            "dropped_raw_source_backed_roles": len(batch_dropped),
            "proposal_counts": dict(Counter(r["proposal_status"] for r in batch_records)),
            "parent_domain_counts": dict(Counter(r["parent_domain_fit"]["disposition"] for r in batch_records)),
            "area_counts": dict(Counter(r["area_of_specialization_fit"]["disposition"] for r in batch_records)),
            "checkpoint_status": "complete",
        }
        for field in ("proposal_counts", "parent_domain_counts", "area_counts"):
            for disposition in ("supported", "secondary", "conditional", "unsupported", "external-review"):
                batch[field].setdefault(disposition, 0)
        batches.append(batch)

    manifest = {
        "schema_version": "2026-10-07.role-parent-area-reconciliation.v1",
        "workstream": "A",
        "scope": "D001-D056 only",
        "generated_on": TODAY,
        "audit_only": True,
        "canonical_files_edited": [],
        "classification_enum": ["supported", "secondary", "conditional", "unsupported", "duplicate", "external-review"],
        "policy": {
            "parent_domain_fit_requires_task_or_work_activity_evidence": True,
            "area_fit_requires_area_boundary_and_task_evidence": True,
            "title_is_not_proof": True,
            "isco_is_not_proof": True,
            "subgroup_membership_is_not_proof": True,
            "multiple_routes_are_preserved": True,
            "negative_checks_are_preserved": True,
            "dropped_raw_roles_are_not_reintroduced": True,
        },
        "inputs": [{"path": str(path.relative_to(ROOT)), "sha256": sha256(path)} for path in INPUTS],
        "input_counts": {
            "raw_rows_d001_d056": len(raw_scope),
            "cleaned_rows_d001_d056": len(cleaned_scope),
            "thin_overlay_rows_d001_d056": len(thin_scope),
            "emerging_overlay_rows_d001_d056": len(emerging_scope),
            "unique_raw_role_keys": len(raw_by_key),
            "unique_current_role_keys": len(current_by_key),
            "union_role_keys": len(records),
            "raw_duplicate_rows": len(duplicate_records),
            "dropped_raw_source_backed_roles": len(dropped),
        },
        "proposal_counts": dict(counts),
        "parent_domain_disposition_counts": dict(parent_counts),
        "area_disposition_counts": dict(area_counts),
        "batch_checkpoints": batches,
        "role_records": records,
        "duplicate_records": duplicate_records,
        "dropped_source_backed_raw_roles": dropped,
    }

    md_lines = [
        "# Workstream A — D001–D056 role/domain and role/area reconciliation",
        "",
        f"Generated {TODAY}. This is an audit-only proposal artifact; canonical role, domain, overlay, and area files were not edited.",
        "",
        "## Decision policy",
        "",
        "A role is assessed from source-backed task/work-activity evidence, the parent-domain definition, and the area boundary. Role title, ISCO group, subgroup membership, or an existing relationship alone is not proof. Existing reviewed routes are preserved as evidence but are not promoted when their own status is conditional or unsupported. Multiple routes remain explicit. Raw roles absent from the current canonical union are listed for review and are not reintroduced automatically.",
        "",
        "## Counts",
        "",
        f"- Raw rows in scope: {len(raw_scope)}; unique raw role keys: {len(raw_by_key)}.",
        f"- Current canonical/overlay rows in scope: {len(cleaned_scope) + len(thin_scope) + len(emerging_scope)}; unique current keys: {len(current_by_key)}.",
        f"- Union role keys assessed: {len(records)}.",
        f"- Raw duplicate rows: {len(duplicate_records)}.",
        f"- Source-backed raw keys absent from the current canonical union: {len(dropped)}.",
        f"- Proposed route dispositions: {json.dumps(dict(counts), ensure_ascii=False, sort_keys=True)}.",
        f"- Parent-domain dispositions: {json.dumps(dict(parent_counts), ensure_ascii=False, sort_keys=True)}.",
        f"- Area-of-specialization dispositions: {json.dumps(dict(area_counts), ensure_ascii=False, sort_keys=True)}.",
        "",
        "## Checkpoints",
        "",
    ]
    for batch in batches:
        md_lines.append(f"- {batch['batch_id']}: {batch['role_records']} union role keys; {batch['dropped_raw_source_backed_roles']} dropped raw source-backed keys; proposals {json.dumps(batch['proposal_counts'], sort_keys=True)}; status `{batch['checkpoint_status']}`.")
    md_lines.extend([
        "",
        "## Files",
        "",
        "- `d001_d056_role_reconciliation_proposals.json` contains every union role key, duplicate raw rows, and dropped source-backed raw roles.",
        "- `d001_d056_role_reconciliation_manifest.json` contains source hashes, policy, and counts.",
        "- `d001_d056_role_reconciliation_checkpoint.md` is this human-readable checkpoint.",
        "- `reconcile_d001_d056_role_parent_area_fit.py` reproduces the outputs without mutating canonical data.",
    ])

    if args.no_write:
        print(json.dumps({"proposal_counts": dict(counts), "parent_counts": dict(parent_counts), "area_counts": dict(area_counts), "dropped": len(dropped)}, indent=2))
        return

    write_json(TARGET / "d001_d056_role_reconciliation_proposals.json", {**manifest, "manifest_file": "d001_d056_role_reconciliation_manifest.json"})
    write_json(TARGET / "d001_d056_role_reconciliation_manifest.json", {k: v for k, v in manifest.items() if k not in {"role_records", "duplicate_records", "dropped_source_backed_raw_roles"}})
    (TARGET / "d001_d056_role_reconciliation_checkpoint.md").write_text("\n".join(md_lines) + "\n", encoding="utf-8")
    for batch in batches:
        bid = batch["batch_id"]
        bstart = int(bid[1:4])
        bend = int(bid[6:9])
        ids = {f"D{i:03d}" for i in range(bstart, bend + 1)}
        batch_payload = {
            "schema_version": manifest["schema_version"],
            "workstream": "A",
            "batch": batch,
            "role_records": [r for r in records if r["domain_id"] in ids],
            "dropped_source_backed_raw_roles": [r for r in dropped if r["domain_id"] in ids],
            "duplicate_records": [r for r in duplicate_records if r["domain_id"] in ids],
            "canonical_files_edited": [],
        }
        write_json(TARGET / f"{bid}_checkpoint.json", batch_payload)
        (TARGET / f"{bid}_checkpoint.md").write_text(
            f"# {bid} checkpoint\n\nStatus: `complete`\n\n"
            f"Union role keys: {batch['role_records']}\n\n"
            f"Dropped raw source-backed keys: {batch['dropped_raw_source_backed_roles']}\n\n"
            f"Proposal counts: `{json.dumps(batch['proposal_counts'], sort_keys=True)}`\n\n"
            "This checkpoint is audit-only and does not edit canonical files.\n",
            encoding="utf-8",
        )
    print(json.dumps({"target": str(TARGET), "proposal_counts": dict(counts), "parent_counts": dict(parent_counts), "area_counts": dict(area_counts), "dropped": len(dropped), "duplicates": len(duplicate_records)}, indent=2))


if __name__ == "__main__":
    main()
