"""Read-only Workstream B reconciliation for roles in D057-D112.

The script creates proposal/checkpoint artifacts only.  It never edits a
canonical role, domain, area, subgroup, or overlay file.  Parent-domain and
role-to-area decisions are based on task/work-activity text, the stored domain
boundary, area boundaries, cited provenance, scope exclusions, and negative
checks.  Titles, ISCO/ESCO membership and subgroup membership are retained as
metadata only and are never fit evidence.
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
FIRST_DOMAIN = 57
LAST_DOMAIN = 112
GENERATED_DATE = "2026-10-07"

RAW = DATA / "role_library_v3.json"
CANONICAL_FILES = [
    DATA / "role_library_v3_cleaned.json",
    DATA / "thin_domain_role_overlays.json",
    DATA / "emerging_role_overlays.json",
]
DOMAIN_META = DATA / "domain_meta.json"
DOMAIN_CATALOG = DATA / "domain_specialization_catalog.json"
WORK_PROFILES = DATA / "role_work_profiles.json"
PARENT_REVIEW = AUDIT / "role_domain_review_decision_apply_2026_10_07.json"
PRIOR_AREA_REVIEW = (
    AUDIT / "role_enrichment_lanes_2026_10_06" / "D057_D112"
    / "D057_D112_existing_role_area_fit_review_2026_10_07.json"
)
PRIOR_AREA_DETERMINISTIC = (
    AUDIT / "role_enrichment_lanes_2026_10_06" / "D057_D112"
    / "D057_D112_existing_role_area_fit_deterministic_2026_10_07.json"
)

OUT = HERE / "D057_D112_role_reconciliation_proposals_2026_10_07.json"
CHECKPOINT = HERE / "D057_D112_role_reconciliation_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D057_D112_role_reconciliation_checkpoint_2026_10_07.md"

TOKEN_RE = re.compile(r"[a-z0-9+#]+", re.I)
STOP = set(
    "a an and are as at be by for from has have in into is its of on or the their "
    "this to was were with within across based each including not only work role "
    "roles area areas practice services service general relevant".split()
)
GENERIC = set(
    "access apply assess assessment assist build care client clients community "
    "conduct coordinate create customer customers data decision decisions design "
    "develop diagnose digital education electrical environment environments evaluate "
    "evaluation experience experiences facility field fit function health help "
    "implement improve install institution institutions instruction intervention "
    "learning manage management method methods monitor operation operations organize "
    "perform person people plan policy provide provision record records report "
    "research resource results role service services skill skills software support "
    "system systems task technology test train training treatment use user users "
    "work animal animals veterinary".split()
)


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def rows_from(path: Path):
    value = read(path)
    return value if isinstance(value, list) else value.get("roles", [])


def domain_number(value) -> int:
    try:
        return int(str(value).upper().replace("D", ""))
    except (TypeError, ValueError):
        return -1


def in_scope(value) -> bool:
    number = domain_number(value)
    return FIRST_DOMAIN <= number <= LAST_DOMAIN


def norm(value) -> str:
    return " ".join(TOKEN_RE.findall(str(value or "").casefold()))


def tokens(value) -> list[str]:
    return [t for t in TOKEN_RE.findall(str(value or "").casefold()) if t not in STOP and len(t) > 2]


def role_key(row: dict) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def norm_role_key(row: dict) -> str:
    return role_key(row).casefold()


def unique(values):
    return list(dict.fromkeys(v for v in values if v not in (None, "", [])))


def source_file_label(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def source_urls(row: dict, parent: dict | None = None) -> list[str]:
    values = []
    if parent:
        after = parent.get("after", {})
        values.extend(after.get("domain_fit_review_source_refs") or [])
    values.extend(row.get("domain_fit_review_source_refs") or [])
    values.extend(row.get("role_domain_lane_review_sources") or [])
    # Some overlays store URLs in provenance; retain only actual URLs here.
    provenance = row.get("source_provenance") or {}
    values.extend(provenance.get("urls") or [])
    return unique([str(v) for v in values if str(v).startswith(("http://", "https://"))])


def task_text(row: dict, profile: dict | None) -> str:
    pieces = [row.get("description") or ""]
    if profile:
        pieces.extend(profile.get("activities") or [])
        pieces.extend(a.get("name", "") for a in profile.get("work_activities") or [])
    return " ".join(str(p).strip() for p in pieces if str(p).strip())


def work_profile_sources(profile: dict | None) -> list[dict]:
    if not profile:
        return []
    refs = []
    for item in profile.get("source_links") or []:
        if isinstance(item, dict) and item.get("url"):
            refs.append({
                "source_id": item.get("source_id"),
                "label": item.get("label"),
                "url": item.get("url"),
                "region": (profile.get("source") or {}).get("region"),
            })
    source = profile.get("source") or {}
    if source.get("url") and not any(x.get("url") == source.get("url") for x in refs):
        refs.append({
            "source_id": (source.get("ids") or [None])[0],
            "label": source.get("name"),
            "url": source.get("url"),
            "region": source.get("region"),
        })
    return refs


def boundary_phrases(boundary: str) -> set[str]:
    ts = tokens(boundary)
    phrases = set()
    for size in (2, 3, 4):
        for i in range(max(0, len(ts) - size + 1)):
            part = ts[i:i + size]
            if len(set(part)) >= 2:
                phrases.add(" ".join(part))
    # Preserve compact clauses such as "clinical decision support".
    for clause in re.split(r"[,;:.()]+|\b(?:and|including|such as|while|whereas)\b", boundary, flags=re.I):
        part = tokens(clause)
        if 2 <= len(part) <= 8:
            phrases.add(" ".join(part))
    return phrases


def area_candidates(text: str, areas: list[dict]) -> list[dict]:
    """Return routes as evidence-bearing suggestions, never title-only matches."""
    text_norm = f" {norm(text)} "
    text_tokens = set(tokens(text))
    scored = []
    for area in areas:
        boundary = area.get("boundary") or area.get("description") or ""
        label = area.get("label") or ""
        boundary_tokens = set(tokens(boundary))
        label_tokens = {t for t in tokens(label) if t not in GENERIC}
        phrase_hits = sorted(
            p for p in boundary_phrases(boundary) if f" {p} " in text_norm
        )
        substantive = sorted(
            t for t in text_tokens & boundary_tokens if t not in GENERIC and len(t) > 3
        )
        label_hits = sorted(t for t in text_tokens & label_tokens)
        exclusions = []
        match = re.search(r"\bexcludes?\s+([^.;]+)", boundary, flags=re.I)
        if match:
            exclusions = sorted(set(tokens(match.group(1))) & text_tokens)
        source_ids = unique(area.get("source_ids") or [])
        source_urls_list = unique(area.get("source_urls") or [])
        evidence = area.get("evidence") or []
        source_ids.extend(e.get("source_id") for e in evidence)
        source_urls_list.extend(e.get("url") for e in evidence)
        source_ids = unique(source_ids)
        source_urls_list = unique(source_urls_list)
        # Exact phrases are the only automatic strong signal. Unigrams and
        # label hits are retained for review but cannot prove fit alone.
        score = len(phrase_hits) * 4 + len(substantive) * 0.75 + len(label_hits) * 0.35
        scored.append({
            "area_key": area.get("area_key") or area.get("key"),
            "label": label,
            "boundary": boundary,
            "score": round(score, 3),
            "matched_task_boundary_phrases": phrase_hits,
            "matched_substantive_boundary_terms": substantive,
            "matched_area_label_terms": label_hits,
            "explicit_scope_exclusion_terms_found": exclusions,
            "source_ids": source_ids,
            "source_urls": source_urls_list,
            "claim_limits": unique(e.get("claim_limit") for e in evidence),
        })
    return sorted(scored, key=lambda x: (-x["score"], x["label"]))


def duplicate_match(raw_row: dict, canonical_by_code: dict[tuple[str, str], list[dict]]) -> dict | None:
    code = raw_row.get("esco_code")
    if not code:
        return None
    candidates = canonical_by_code.get((raw_row.get("domain_id"), str(code)), [])
    raw_words = set(tokens(raw_row.get("description")))
    for candidate in candidates:
        candidate_words = set(tokens(candidate.get("description")))
        union = raw_words | candidate_words
        similarity = len(raw_words & candidate_words) / len(union) if union else 0.0
        if similarity >= 0.50:
            return {
                "role_key": role_key(candidate),
                "matching_esco_code": str(code),
                "description_token_jaccard": round(similarity, 3),
            }
    return None


def load_catalog() -> dict[str, dict]:
    payload = read(DOMAIN_CATALOG)
    domains = {}
    for domain in payload.get("domains", []):
        if in_scope(domain.get("domain_id")):
            domains[domain["domain_id"]] = domain
    return domains


def build_sources():
    raw_rows = [r for r in rows_from(RAW) if in_scope(r.get("domain_id"))]
    canonical_by_key: dict[str, dict] = {}
    canonical_source_by_key: dict[str, str] = {}
    excluded_counts = Counter()
    for path in CANONICAL_FILES:
        for row in rows_from(path):
            if not in_scope(row.get("domain_id")):
                continue
            if row.get("student_path_status") == "excluded":
                excluded_counts[row.get("domain_id")] += 1
                continue
            key = norm_role_key(row)
            if key not in canonical_by_key:
                canonical_by_key[key] = row
                canonical_source_by_key[key] = source_file_label(path)
    raw_by_key = {norm_role_key(r): r for r in raw_rows}
    canonical_by_code: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for row in canonical_by_key.values():
        if row.get("esco_code"):
            canonical_by_code[(row.get("domain_id"), str(row.get("esco_code")))].append(row)
    return raw_rows, canonical_by_key, canonical_source_by_key, raw_by_key, canonical_by_code, excluded_counts


def parent_decision_for(row: dict, parent_by_key: dict[str, dict]) -> dict:
    return parent_by_key.get(norm_role_key(row), {})


def parent_fit(row: dict, parent_decision: dict, profile: dict | None) -> dict:
    after = parent_decision.get("after", {})
    status = after.get("domain_fit_review_status") or row.get("domain_fit_review_status")
    rationale = after.get("domain_fit_review_basis") or row.get("domain_fit_review_basis")
    refs = source_urls(row, parent_decision)
    if status in {"supported", "conditional", "unsupported"}:
        return {
            "status": status,
            "rationale": rationale or "Stored parent-domain decision; task evidence must remain the fit basis.",
            "source_urls": refs,
            "evidence_date": row.get("role_domain_lane_review_date") or GENERATED_DATE,
            "source_status": "stored_source_backed_decision" if refs else "stored_decision_without_url",
        }
    # The raw source has a description but no durable provenance. Do not turn
    # that into support; it needs external/source confirmation.
    if task_text(row, profile):
        return {
            "status": "external-review",
            "rationale": "Task text exists, but no authoritative parent-domain decision and no durable source locator/date are attached to this record.",
            "source_urls": refs,
            "evidence_date": None,
            "source_status": "source_locator_or_decision_missing",
        }
    return {
        "status": "external-review",
        "rationale": "No usable task/work-activity evidence is present for parent-domain adjudication.",
        "source_urls": refs,
        "evidence_date": None,
        "source_status": "task_evidence_missing",
    }


def prior_area_for(key: str, prior_by_key: dict[str, dict], deterministic_by_key: dict[str, dict]) -> dict:
    exact = prior_by_key.get(key)
    if exact:
        return exact.get("area_fit") or {}
    exact = deterministic_by_key.get(key)
    if exact:
        return exact.get("area_fit") or {}
    return {}


def reconcile_area(row: dict, parent: dict, profile: dict | None, areas: list[dict], prior: dict, raw_only: bool) -> tuple[dict, list[dict]]:
    text = task_text(row, profile)
    candidates = area_candidates(text, areas)
    parent_status = parent["status"]
    negative = []
    for candidate in candidates:
        if candidate["explicit_scope_exclusion_terms_found"]:
            negative.append({
                "area_key": candidate["area_key"],
                "check": "explicit_area_boundary_exclusion",
                "terms": candidate["explicit_scope_exclusion_terms_found"],
            })
    if parent_status == "unsupported":
        return {
            "status": "unsupported",
            "route_type": "none",
            "area_key": None,
            "rationale": "The stored task-based parent-domain review contradicts the parent link; no child area route can repair that contradiction.",
            "negative_checks": negative,
            "evidence_date": parent.get("evidence_date"),
        }, candidates
    # Existing explicit adjudications are reused, but still gated by the
    # current parent status and the area key's current catalog boundary.
    prior_status = prior.get("status")
    prior_key = prior.get("area_key")
    if prior_status == "alias_existing":
        return {
            "status": "duplicate",
            "route_type": "alias_existing",
            "area_key": prior_key,
            "rationale": prior.get("rationale") or "Existing review identifies this record as an alias of another role.",
            "alias_target_role_key": prior.get("alias_target_role_key"),
            "negative_checks": negative,
            "evidence_date": GENERATED_DATE,
        }, candidates
    if prior_status == "direct_domain_role":
        return {
            "status": "supported" if parent_status == "supported" else "conditional",
            "route_type": "direct_domain_role",
            "area_key": None,
            "rationale": prior.get("rationale") or "Existing review supports a direct domain-to-role route; forcing an area would be misleading.",
            "negative_checks": negative,
            "evidence_date": GENERATED_DATE,
        }, candidates
    if prior_status == "supported" and prior_key and parent_status == "supported":
        return {
            "status": "supported",
            "route_type": "area_primary",
            "area_key": prior_key,
            "rationale": prior.get("rationale") or "Existing task-to-area adjudication is retained and parent-domain support is current.",
            "negative_checks": negative,
            "evidence_date": GENERATED_DATE,
        }, candidates

    if not areas:
        return {
            "status": "supported" if parent_status == "supported" else "conditional",
            "route_type": "direct_domain_role",
            "area_key": None,
            "rationale": "This domain has no active area definition; preserve a direct domain-to-role route rather than inventing an area.",
            "negative_checks": negative,
            "evidence_date": parent.get("evidence_date"),
        }, candidates
    viable = [c for c in candidates if not c["explicit_scope_exclusion_terms_found"]]
    top = viable[0] if viable else None
    second = viable[1] if len(viable) > 1 else None
    if not top or not top["source_ids"] or not top["source_urls"]:
        status = "conditional" if top and (top["matched_task_boundary_phrases"] or top["matched_substantive_boundary_terms"]) else "external-review"
        return {
            "status": status,
            "route_type": "area_candidate" if top else "none",
            "area_key": top["area_key"] if top else None,
            "rationale": "A bounded area candidate exists but authoritative area provenance is incomplete; do not promote it." if top else "No source-backed area route can be selected from the task/work-activity evidence.",
            "negative_checks": negative + ([{"check": "no_area_candidate_with_authoritative_provenance"}] if not top else []),
            "evidence_date": None,
        }, candidates
    if parent_status == "conditional":
        return {
            "status": "conditional",
            "route_type": "area_conditional",
            "area_key": top["area_key"],
            "rationale": "The task suggests this area, but the parent-domain route remains conditional; child support cannot outrun the parent gate.",
            "negative_checks": negative,
            "evidence_date": parent.get("evidence_date"),
        }, candidates
    if top["matched_task_boundary_phrases"] and not top["explicit_scope_exclusion_terms_found"]:
        routes = "area_primary"
        if second and second["matched_task_boundary_phrases"] and top["score"] - second["score"] < 2:
            routes = "area_primary_with_secondary_route"
        return {
            "status": "supported",
            "route_type": routes,
            "area_key": top["area_key"],
            "rationale": "Task/work-activity text contains a distinctive phrase that falls inside the area boundary; source records and scope checks are present.",
            "secondary_area_keys": [second["area_key"]] if routes == "area_primary_with_secondary_route" else [],
            "negative_checks": negative,
            "evidence_date": parent.get("evidence_date"),
        }, candidates
    if top["matched_substantive_boundary_terms"] or top["matched_area_label_terms"]:
        return {
            "status": "conditional",
            "route_type": "area_candidate",
            "area_key": top["area_key"],
            "rationale": "The task has partial substantive overlap with the area, but no distinctive multi-word task-to-boundary phrase; retain conditional rather than treating lexical overlap as proof.",
            "negative_checks": negative,
            "evidence_date": parent.get("evidence_date"),
        }, candidates
    return {
        "status": "external-review",
        "route_type": "none",
        "area_key": None,
        "rationale": "No defensible task-to-area route was found. Title, ISCO/ESCO and subgroup membership were not used to fill the gap.",
        "negative_checks": negative + [{"check": "no_distinctive_task_boundary_signal"}],
        "evidence_date": None,
    }, candidates


def main() -> None:
    raw_rows, canonical_by_key, canonical_sources, raw_by_key, canonical_by_code, excluded_counts = build_sources()
    meta = read(DOMAIN_META)
    catalog = load_catalog()
    profiles = read(WORK_PROFILES).get("profiles", [])
    profile_by_key = {f"{p.get('domain_id')}|{str(p.get('role_name', '')).casefold()}": p for p in profiles if in_scope(p.get("domain_id"))}
    parent_payload = read(PARENT_REVIEW)
    parent_by_key = {str(x.get("role_key", "")).casefold(): x for x in parent_payload.get("changes", []) if x.get("role_key")}
    prior_payload = read(PRIOR_AREA_REVIEW)
    prior_by_key = {str(x.get("role_key", "")).casefold(): x for x in prior_payload.get("roles", []) if x.get("role_key")}
    deterministic_payload = read(PRIOR_AREA_DETERMINISTIC)
    deterministic_by_key = {str(x.get("role_key", "")).casefold(): x for x in deterministic_payload.get("roles", []) if x.get("role_key")}

    records = []
    canonical_keys = set(canonical_by_key)
    raw_keys = set(raw_by_key)
    all_keys = sorted(canonical_keys | raw_keys)
    duplicate_keys = Counter()
    for row in raw_rows:
        duplicate_keys[norm_role_key(row)] += 1
    for key in all_keys:
        canonical = canonical_by_key.get(key)
        raw = raw_by_key.get(key)
        row = canonical or raw
        did = row.get("domain_id")
        profile = profile_by_key.get(f"{did}|{str(row.get('role_name', '')).casefold()}")
        parent_decision = parent_decision_for(row, parent_by_key)
        parent = parent_fit(row, parent_decision, profile)
        domain = meta.get(did, {})
        cat_domain = catalog.get(did, {})
        areas = cat_domain.get("areas", [])
        prior = prior_area_for(key, prior_by_key, deterministic_by_key)
        raw_only = raw is not None and canonical is None
        duplicate = duplicate_match(raw, canonical_by_code) if raw_only else None
        if duplicate:
            area = {
                "status": "duplicate",
                "route_type": "duplicate_source_code",
                "area_key": None,
                "rationale": "The raw record shares an ESCO code and materially overlapping task description with an active canonical role; preserve the canonical record instead of restoring a duplicate.",
                "duplicate_of": duplicate,
                "negative_checks": [],
                "evidence_date": None,
            }
            candidates = []
        else:
            area, candidates = reconcile_area(row, parent, profile, areas, prior, raw_only)
        if raw_only and parent["status"] == "external-review" and area["status"] in {"supported", "conditional"}:
            # A source-backed role cannot be proposed as a clean route when the
            # parent proof itself is not locatable.
            area["status"] = "external-review"
            area["route_type"] = "parent_evidence_gap"
            area["rationale"] = "An area candidate may exist, but the raw source record lacks a durable parent-domain provenance/date; review the source before proposing restoration."
        area_routes = []
        if area.get("area_key") or area.get("route_type") == "direct_domain_role":
            area_routes.append({
                "area_key": area.get("area_key"),
                "route_type": area.get("route_type"),
                "status": area.get("status"),
            })
        for secondary_key in area.get("secondary_area_keys") or []:
            area_routes.append({
                "area_key": secondary_key,
                "route_type": "secondary",
                "status": "secondary",
                "rationale": "The task has a second bounded area signal; retain it as an additional route rather than collapsing it into the primary area.",
            })
        area["routes"] = area_routes
        records.append({
            "role_key": role_key(row),
            "domain_id": did,
            "domain_name": domain.get("domain_name") or row.get("domain_name"),
            "role_title": row.get("role_name"),
            "canonical_present": canonical is not None,
            "canonical_source_file": canonical_sources.get(key),
            "raw_present": raw is not None,
            "raw_source_file": source_file_label(RAW) if raw is not None else None,
            "source_comparison": "active_canonical_and_raw" if canonical is not None and raw is not None else ("raw_dropped_from_active_canonical" if raw_only else "canonical_overlay_or_new_record"),
            "task_work_activity_evidence": task_text(row, profile),
            "task_evidence_locator": "role description plus role_work_profiles activities when present; title/ISCO/ESCO/subgroup excluded from fit evidence",
            "work_profile_source_records": work_profile_sources(profile),
            "work_profile_limitations": (profile or {}).get("limitations") or [],
            "role_source": row.get("source"),
            "role_source_code": row.get("esco_code") or row.get("isco_group"),
            "role_source_urls": source_urls(row, parent_decision),
            "evidence_date": parent.get("evidence_date"),
            "domain_boundary": domain.get("description", ""),
            "domain_boundary_source": "data/career-mapping/domain_meta.json",
            "parent_domain_fit": parent,
            "area_definitions_count": len(areas),
            "area_candidates": candidates[:5],
            "area_fit": area,
            "negative_checks": area.get("negative_checks", []),
            "isco_or_subgroup_metadata_not_used_as_fit_evidence": True,
            "canonical_files_edited": False,
            "raw_duplicate_check": duplicate,
        })

    disposition_counts = Counter(r["area_fit"]["status"] for r in records)
    secondary_route_count = sum(
        1 for r in records for route in r["area_fit"].get("routes", [])
        if route.get("status") == "secondary"
    )
    parent_counts = Counter(r["parent_domain_fit"]["status"] for r in records)
    source_counts = Counter(r["source_comparison"] for r in records)
    domain_summary = []
    for i in range(FIRST_DOMAIN, LAST_DOMAIN + 1):
        did = f"D{i:03d}"
        rs = [r for r in records if r["domain_id"] == did]
        domain_summary.append({
            "domain_id": did,
            "domain_name": (meta.get(did) or {}).get("domain_name"),
            "raw_records": sum(r["raw_present"] for r in rs),
            "active_canonical_records": sum(r["canonical_present"] for r in rs),
            "raw_dropped_records": sum(r["source_comparison"] == "raw_dropped_from_active_canonical" for r in rs),
            "area_definitions": (len(catalog.get(did, {}).get("areas", []))),
            "parent_statuses": dict(Counter(r["parent_domain_fit"]["status"] for r in rs)),
            "area_dispositions": dict(Counter(r["area_fit"]["status"] for r in rs)),
            "excluded_canonical_records_not_audited": excluded_counts.get(did, 0),
        })
    payload = {
        "schema_version": "2026-10-07.workstream-b.d057-d112.role-domain-area-reconciliation.v1",
        "lane": "D057-D112",
        "status": "proposal_complete_canonical_files_untouched",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": {
            "first_domain": "D057",
            "last_domain": "D112",
            "inclusive_domain_count": LAST_DOMAIN - FIRST_DOMAIN + 1,
            "canonical_sources": [source_file_label(p) for p in CANONICAL_FILES],
            "raw_source": source_file_label(RAW),
        },
        "counts": {
            "raw_records": len(raw_rows),
            "active_canonical_records": len(canonical_by_key),
            "raw_dropped_from_active_canonical": sum(r["source_comparison"] == "raw_dropped_from_active_canonical" for r in records),
            "canonical_overlay_or_new_records_not_in_raw": sum(r["source_comparison"] == "canonical_overlay_or_new_record" for r in records),
            "excluded_canonical_records_not_audited": sum(excluded_counts.values()),
            "records_reconciled": len(records),
            "parent_domain_dispositions": dict(parent_counts),
            "area_route_dispositions": dict(disposition_counts),
            "secondary_area_routes": secondary_route_count,
            "source_comparison": dict(source_counts),
            "domains_with_records": len({r["domain_id"] for r in records}),
            "domains_with_area_definitions": sum(bool(catalog.get(f"D{i:03d}", {}).get("areas")) for i in range(FIRST_DOMAIN, LAST_DOMAIN + 1)),
        },
        "policy": {
            "task_and_work_activity_evidence_required": True,
            "domain_and_area_boundaries_required": True,
            "authoritative_provenance_and_date_required_for_support": True,
            "explicit_scope_and_negative_checks": True,
            "multiple_routes_retained": True,
            "title_used_as_fit_evidence": False,
            "isco_used_as_fit_evidence": False,
            "subgroup_membership_used_as_fit_evidence": False,
            "canonical_files_edited": False,
            "raw_dropped_roles_are_proposals_only": True,
        },
        "records": records,
        "domain_summary": domain_summary,
        "next_action": "Review external-review and conditional records against authoritative role task sources before any canonical proposal is applied.",
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-10-07.workstream-b.d057-d112.checkpoint.v1",
        "lane": "D057-D112",
        "status": "complete_proposal_only",
        "completed_domains": [f"D{i:03d}" for i in range(FIRST_DOMAIN, LAST_DOMAIN + 1)],
        "next_domain": None,
        "completed_records": len(records),
        "counts": payload["counts"],
        "decisions": payload["counts"]["area_route_dispositions"],
        "exact_output_files": [source_file_label(OUT), source_file_label(CHECKPOINT), source_file_label(CHECKPOINT_MD), source_file_label(HERE / Path(__file__).name)],
        "canonical_files_edited": False,
        "area_files_edited": False,
        "note": "This checkpoint is the Workstream B proposal ledger. It is not a canonical import or deployment claim.",
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md = []
    md.append("# Workstream B checkpoint — D057–D112 role/domain/area reconciliation")
    md.append("")
    md.append(f"Generated: `{GENERATED_DATE}`. This is a proposal-only, read-only reconciliation; canonical files were not edited.")
    md.append("")
    md.append("## What was compared")
    md.append("")
    md.append(f"- Raw role library: **{len(raw_rows):,}** records in D057–D112.")
    md.append(f"- Active canonical records across cleaned/thin/emerging files: **{len(canonical_by_key):,}**.")
    md.append(f"- Raw records dropped from that active canonical set: **{payload['counts']['raw_dropped_from_active_canonical']:,}**.")
    md.append(f"- Canonical overlay/new records not present in raw: **{payload['counts']['canonical_overlay_or_new_records_not_in_raw']:,}**.")
    md.append(f"- Canonical records explicitly excluded from active paths and therefore not route-audited: **{sum(excluded_counts.values()):,}**.")
    md.append("")
    md.append("## Dispositions")
    md.append("")
    md.append("| Level | Counts |")
    md.append("|---|---:|")
    md.append(f"| Parent-domain fit | `{dict(parent_counts)}` |")
    md.append(f"| Role→area/direct route | `{dict(disposition_counts)}` |")
    md.append("")
    md.append("`supported` means the task/work-activity evidence has a bounded route and provenance. `secondary` is retained for a non-primary route. `conditional` means the route is plausible but a parent, assignment, or boundary gate remains. `unsupported` means a negative task/boundary check rejects the route. `duplicate` means the raw record duplicates a canonical source record. `external-review` means evidence or provenance is insufficient for a defensible route.")
    md.append("")
    md.append("## Guardrails")
    md.append("")
    md.append("Titles, ISCO/ESCO membership and subgroup membership were not used as fit proof. Each record retains task text, work activities where available, domain/area boundaries, source URLs/date fields, candidate routes, exclusions and negative checks. Raw dropped roles remain proposals only.")
    md.append("")
    md.append("## Domain summary")
    md.append("")
    md.append("| Domain | Raw | Active canonical | Raw dropped | Areas | Area dispositions |")
    md.append("|---|---:|---:|---:|---:|---|")
    for d in domain_summary:
        md.append(f"| {d['domain_id']} {d.get('domain_name') or ''} | {d['raw_records']} | {d['active_canonical_records']} | {d['raw_dropped_records']} | {d['area_definitions']} | `{d['area_dispositions']}` |")
    md.append("")
    md.append("## Exact artifacts")
    md.append("")
    md.append(f"- `{source_file_label(OUT)}` — full machine-readable proposal ledger.")
    md.append(f"- `{source_file_label(CHECKPOINT)}` — resumable completion checkpoint.")
    md.append(f"- `{source_file_label(CHECKPOINT_MD)}` — this human-readable checkpoint.")
    md.append(f"- `{source_file_label(HERE / Path(__file__).name)}` — reproducible read-only script.")
    CHECKPOINT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "checkpoint": str(CHECKPOINT), "counts": payload["counts"]}, indent=2))


if __name__ == "__main__":
    main()
