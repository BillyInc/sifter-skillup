"""Second targeted Workstream B pass for D057-D112.

Reads the first Workstream B ledger plus current role sources, exact ESCO
occupation data and O*NET work profiles. Produces a proposal-only ledger and
checkpoint under this folder; canonical files are read-only inputs.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
FIRST = HERE / "D057_D112_role_reconciliation_proposals_2026_10_07.json"
RAW = DATA / "role_library_v3.json"
CANONICAL_FILES = [
    DATA / "role_library_v3_cleaned.json",
    DATA / "thin_domain_role_overlays.json",
    DATA / "emerging_role_overlays.json",
]
ESCO = DATA / "taxonomies" / "esco_occupations.json"
WORK_PROFILES = DATA / "role_work_profiles.json"
META = DATA / "domain_meta.json"
AREA_CATALOG = DATA / "domain_specialization_catalog.json"
PARENT_REVIEW = AUDIT / "role_domain_review_decision_apply_2026_10_07.json"
ACCESS_DATE = "2026-10-07"
ESCO_VERSION = "ESCO v1.2.1 (normalized local source dataset)"

OUT = HERE / "D057_D112_role_reconciliation_second_pass_2026_10_07.json"
CHECKPOINT = HERE / "D057_D112_role_reconciliation_second_pass_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D057_D112_role_reconciliation_second_pass_checkpoint_2026_10_07.md"
MANIFEST = HERE / "D057_D112_role_reconciliation_second_pass_manifest_2026_10_07.json"

TOK = re.compile(r"[a-z0-9+#]+", re.I)
STOP = set("a an and are as at be by for from has have in into is its of on or the their this to was were with within across based each including not only work role roles area areas practice services service general relevant".split())
GENERIC = set("access apply assess assessment assist build care client clients community conduct coordinate create customer customers data decision decisions design develop diagnose digital education electrical environment environments evaluate evaluation experience experiences facility field fit function health help implement improve install institution institutions instruction intervention learning manage management method methods monitor operation operations organize perform person people plan policy provide provision record records report research resource results role service services skill skills software support system systems task technology test train training treatment use user users work".split())


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def rows_from(path: Path):
    payload = read(path)
    return payload if isinstance(payload, list) else payload.get("roles", [])


def domain_num(value) -> int:
    try:
        return int(str(value).upper().replace("D", ""))
    except (ValueError, TypeError):
        return -1


def in_range(value) -> bool:
    return 57 <= domain_num(value) <= 112


def tokens(value) -> list[str]:
    return [t for t in TOK.findall(str(value or "").casefold()) if t not in STOP and len(t) > 2]


def norm_key(row: dict) -> str:
    return f"{row.get('domain_id')}|{str(row.get('role_name', '')).strip().casefold()}"


def role_key(row: dict) -> str:
    return f"{row.get('domain_id')}|{str(row.get('role_name', '')).strip()}"


def unique(values):
    return list(dict.fromkeys(x for x in values if x not in (None, "", [])))


def esco_code(row: dict):
    value = row.get("esco_code")
    if value in (None, "", "nan", "NaN"):
        return None
    return str(value).strip()


def work_text(row: dict, profile: dict | None, esco_record: dict | None) -> str:
    chunks = [row.get("description") or ""]
    if esco_record and esco_record.get("definition"):
        chunks.append(esco_record["definition"])
    if profile:
        chunks.extend(profile.get("activities") or [])
        chunks.extend(a.get("name", "") for a in profile.get("work_activities") or [])
    return " ".join(str(x).strip() for x in chunks if str(x).strip())


def url_records(row: dict, parent: dict, profile: dict | None, esco_record: dict | None, esco_uri: str | None) -> list[dict]:
    refs = []
    after = parent.get("after", {})
    for url in (after.get("domain_fit_review_source_refs") or row.get("domain_fit_review_source_refs") or []):
        if isinstance(url, str) and url.startswith("http"):
            refs.append({"source_id": "stored_role_domain_review", "url": url, "locator": "Exact task description or role-domain review locator in the cited occupational profile", "access_date": ACCESS_DATE, "source_version": None})
    if esco_uri:
        refs.append({"source_id": "ESCO_OCCUPATION", "url": esco_uri, "locator": f"ESCO occupation concept URI; code {esco_code(row)}; definition, essential/optional skills", "access_date": ACCESS_DATE, "source_version": ESCO_VERSION})
    if profile:
        for source in profile.get("source_links") or []:
            if source.get("url"):
                refs.append({"source_id": source.get("source_id") or "role_work_profile", "url": source["url"], "locator": source.get("label") or "O*NET/occupational profile task and work-activity record", "access_date": ACCESS_DATE, "source_version": "role_work_profiles.json checked-in snapshot"})
        source = profile.get("source") or {}
        if source.get("url"):
            refs.append({"source_id": (source.get("ids") or ["role_work_profile"])[0], "url": source["url"], "locator": source.get("name") or "Profile source metadata", "access_date": ACCESS_DATE, "source_version": "role_work_profiles.json checked-in snapshot"})
    unique_refs = []
    seen = set()
    for ref in refs:
        if ref["url"] not in seen:
            unique_refs.append(ref)
            seen.add(ref["url"])
    return unique_refs


def phrase_hits(task: str, boundary: str) -> list[str]:
    tt = set(tokens(task))
    bt = tokens(boundary)
    hits = []
    for size in (2, 3, 4):
        for i in range(max(0, len(bt) - size + 1)):
            phrase = bt[i:i + size]
            # A boundary phrase must be distinctive on its face.
            if len(set(phrase)) >= 2 and sum(t not in GENERIC for t in phrase) >= 1:
                text = " ".join(phrase)
                if all(t in tt for t in phrase):
                    hits.append(text)
    return sorted(set(hits), key=lambda x: (-len(x.split()), x))


def candidate_areas(task: str, areas: list[dict]) -> list[dict]:
    task_tokens = set(tokens(task))
    out = []
    for area in areas:
        boundary = area.get("boundary") or area.get("description") or ""
        area_tokens = set(tokens(boundary))
        phrases = phrase_hits(task, boundary)
        shared = sorted(t for t in task_tokens & area_tokens if t not in GENERIC)
        exclusions = []
        found = re.search(r"\bexcludes?\s+([^.;]+)", boundary, re.I)
        if found:
            exclusions = sorted(set(tokens(found.group(1))) & task_tokens)
        ev = area.get("evidence") or []
        refs = []
        for item in ev:
            if item.get("url"):
                refs.append({
                    "source_id": item.get("source_id"),
                    "url": item["url"],
                    "locator": item.get("locator") or "See source evidence card in normalized domain specialization catalog",
                    "supports": item.get("supports") or item.get("claim_limit"),
                    "claim_limit": item.get("claim_limit"),
                    "access_date": item.get("access_date") or ACCESS_DATE,
                })
        refs.extend({"source_id": "area_catalog_source_url", "url": url, "locator": "Area source URL in domain_specialization_catalog.json", "supports": area.get("source_support_claim"), "claim_limit": area.get("claim_limits"), "access_date": ACCESS_DATE} for url in area.get("source_urls", []) if url)
        out.append({
            "area_key": area.get("area_key"),
            "label": area.get("label"),
            "boundary": boundary,
            "task_boundary_phrase_hits": phrases,
            "distinctive_shared_terms": shared,
            "negative_scope_terms_found": exclusions,
            "area_sources": refs,
            "area_claim_limit": area.get("source_support_claim") or area.get("recommendation_status"),
            "candidate_not_fit_proof": True,
        })
    return sorted(out, key=lambda x: (-len(x["task_boundary_phrase_hits"]), -len(x["distinctive_shared_terms"]), x.get("label") or ""))


def competitor_checks(selected: dict | None, alternatives: list[dict]) -> list[dict]:
    checks = []
    for alt in alternatives:
        if selected and alt.get("area_key") == selected.get("area_key"):
            continue
        selected_hits = set((selected or {}).get("task_boundary_phrase_hits") or [])
        alt_hits = set(alt.get("task_boundary_phrase_hits") or [])
        selected_terms = set((selected or {}).get("distinctive_shared_terms") or [])
        alt_terms = set(alt.get("distinctive_shared_terms") or [])
        if len(checks) >= 3:
            break
        checks.append({
            "neighbor_area_key": alt.get("area_key"),
            "neighbor_label": alt.get("label"),
            "neighbor_phrase_hits": sorted(alt_hits),
            "terms_absent_from_selected_route": sorted(set(tokens(alt.get("boundary"))) - set(tokens((selected or {}).get("boundary", ""))))[:12],
            "negative_check_result": "not selected as primary without its own distinctive task-to-boundary evidence; not an exclusion unless the task explicitly contradicts its boundary",
        })
    return checks


def get_parent_status(row: dict, existing: dict) -> tuple[str, str, list[str]]:
    after = existing.get("after", {})
    status = after.get("domain_fit_review_status") or row.get("domain_fit_review_status") or "external-review"
    rationale = after.get("domain_fit_review_basis") or row.get("domain_fit_review_basis") or "No exact parent-domain decision with rationale is recorded."
    refs = after.get("domain_fit_review_source_refs") or row.get("domain_fit_review_source_refs") or []
    return status, rationale, [x for x in refs if isinstance(x, str) and x.startswith("http")]


def choose_route(record: dict, task: str, areas: list[dict], esco_record: dict | None, parent_status: str, parent_rationale: str, prior_area: dict, raw_omitted: bool, duplicate_of: dict | None) -> dict:
    if duplicate_of:
        return {
            "status": "duplicate", "route_type": "duplicate_source_identity", "area_key": None,
            "rationale": "Exact ESCO identity plus materially matching task record is already represented by an active canonical key; do not propose a second record.",
            "duplicate_of": duplicate_of,
        }
    if parent_status == "unsupported":
        return {
            "status": "unsupported", "route_type": "none", "area_key": None,
            "rationale": "Existing task-based parent-domain review rejects this exact parent link. Area or subgroup membership cannot override the parent-boundary contradiction.",
        }
    candidates = candidate_areas(task, areas)
    if prior_area.get("status") == "alias_existing":
        return {"status": "duplicate", "route_type": "alias_existing", "area_key": prior_area.get("area_key"), "rationale": prior_area.get("rationale"), "alias_target_role_key": prior_area.get("alias_target_role_key")}
    if prior_area.get("status") == "direct_domain_role":
        return {"status": "direct domain→role", "route_type": "direct_domain_role", "area_key": None, "rationale": prior_area.get("rationale") or "Existing task review finds no defensible area route; preserve the supported parent-domain path directly."}
    if not areas:
        return {"status": "direct domain→role" if parent_status == "supported" else "conditional", "route_type": "direct_domain_role", "area_key": None, "rationale": "No area definitions exist for this domain; do not fabricate one."}
    viable = [x for x in candidates if not x["negative_scope_terms_found"]]
    top = viable[0] if viable else None
    if not top:
        return {"status": "external-review", "route_type": "none", "area_key": None, "rationale": "No viable area route; the available task evidence does not support choosing among area boundaries."}
    # Conditional decisions have a concrete remit instead of being a blank hold.
    remit = []
    if parent_status == "conditional":
        remit.append("resolve the parent-domain assignment condition: " + parent_rationale)
    if not esco_record and not record.get("role_source_urls"):
        remit.append("recover an exact occupational source locator (title/code alone is insufficient)")
    if not top["task_boundary_phrase_hits"]:
        remit.append("obtain task evidence distinguishing this area from adjacent areas; current overlap is not unique proof")
    if top["task_boundary_phrase_hits"] and len(top["task_boundary_phrase_hits"]) >= 2 and parent_status == "supported":
        # Do not repeat supported routes from pass one; only emit secondary
        # when the previous ledger already supports the exact key.
        return {
            "status": "conditional", "route_type": "conditional_area_candidate", "area_key": top["area_key"],
            "rationale": "Distinctive task phrases point to this area, but the first-pass review did not establish a manually adjudicated route. Kept conditional pending exact route reconciliation rather than silently promoting a heuristic.",
            "remit": ["confirm the task-to-area boundary against the cited occupational profile and inspect competing routes"],
        }
    if parent_status == "conditional" or remit:
        return {
            "status": "conditional", "route_type": "conditional_area_candidate", "area_key": top["area_key"],
            "rationale": "The task supports a plausible area candidate, but at least one explicit gate remains open; this is a scoped conditional route, not a confirmed fit.",
            "remit": unique(remit),
        }
    if not esco_record and not record.get("role_source_urls"):
        return {
            "status": "external-review", "route_type": "area_candidate_source_gap", "area_key": top["area_key"],
            "rationale": "The task text suggests an area, but no authoritative exact-role source locator is attached or matched locally.",
            "remit": ["retrieve and record authoritative task source, exact locator, publication/version and access date"],
        }
    if not top["task_boundary_phrase_hits"]:
        # If the role is parent-supported but no unique area boundary is
        # evidenced, a direct route is safer than inventing an area link.
        return {
            "status": "direct domain→role", "route_type": "direct_domain_role", "area_key": None,
            "rationale": "Parent-domain fit is supported, but task evidence does not establish a distinct area route. Keep this role directly under the domain rather than infer an area from title, classification or subgroup.",
        }
    return {
        "status": "conditional", "route_type": "conditional_area_candidate", "area_key": top["area_key"],
        "rationale": "Task evidence points toward this area but needs an explicit independent boundary adjudication before canonical promotion.",
        "remit": ["confirm the exact task-to-area scope and assess all neighboring area routes"],
    }


def main():
    first = read(FIRST)
    first_records = first["records"]
    # The first ledger stores the stable key as `role_key`, while current
    # source rows store it as domain_id + role_name.  Use the ledger key
    # directly; otherwise every prior decision would appear absent and the
    # second pass would incorrectly repeat supported routes.
    first_by_key = {str(r.get("role_key", "")).casefold(): r for r in first_records if r.get("role_key")}
    canonical_rows = {}
    canonical_file = {}
    excluded = Counter()
    for path in CANONICAL_FILES:
        for row in rows_from(path):
            if not in_range(row.get("domain_id")):
                continue
            if row.get("student_path_status") == "excluded":
                excluded[row.get("domain_id")] += 1
                continue
            canonical_rows.setdefault(norm_key(row), row)
            canonical_file.setdefault(norm_key(row), str(path.relative_to(ROOT)).replace("\\", "/"))
    raw_rows = {norm_key(r): r for r in rows_from(RAW) if in_range(r.get("domain_id"))}
    esco = read(ESCO)
    esco_by_code = defaultdict(list)
    for uri, item in esco.items():
        if item.get("code"):
            esco_by_code[str(item["code"])].append((uri, item))
    profiles = read(WORK_PROFILES).get("profiles", [])
    profile_by_key = {f"{p.get('domain_id')}|{str(p.get('role_name','')).casefold()}": p for p in profiles if in_range(p.get("domain_id"))}
    meta = read(META)
    catalog = {d["domain_id"]: d for d in read(AREA_CATALOG).get("domains", []) if in_range(d.get("domain_id"))}
    parent = read(PARENT_REVIEW)
    parent_by_key = {str(x.get("role_key", "")).casefold(): x for x in parent.get("changes", []) if x.get("role_key")}

    # Build the targeted set: only exact active canonical keys not already
    # supported in pass one, plus all raw source records omitted from active
    # canonical data as a separate proposal queue.
    canonical_targets = []
    for key, row in canonical_rows.items():
        prior = first_by_key.get(key.casefold())
        if prior is None or prior["area_fit"]["status"] in {"conditional", "external-review"}:
            canonical_targets.append((key, row, prior, False))
    raw_omitted = [(key, row, first_by_key.get(key.casefold()), True) for key, row in raw_rows.items() if key not in canonical_rows]

    # Identify probable duplicates by exact ESCO concept identity and high task-text overlap.
    canonical_by_uri = defaultdict(list)
    for key, row in canonical_rows.items():
        code = esco_code(row)
        for uri, _item in esco_by_code.get(code, []) if code else []:
            canonical_by_uri[uri].append((key, row))

    output = []
    for key, row, prior, is_raw_omitted in canonical_targets + raw_omitted:
        code = esco_code(row)
        exact_esco = esco_by_code.get(code, []) if code else []
        # Disambiguate by preferred/alt label if the code maps to multiple records.
        selected = None
        row_label = str(row.get("role_name", "")).casefold()
        for uri, item in exact_esco:
            labels = [str(item.get("label", "")).casefold(), *(str(x).casefold() for x in item.get("alt_labels", []))]
            if row_label in labels or any(row_label == x for x in labels):
                selected = (uri, item)
                break
        if not selected and len(exact_esco) == 1:
            selected = exact_esco[0]
        uri, esco_record = selected if selected else (None, None)
        profile = profile_by_key.get(f"{row.get('domain_id')}|{row_label}")
        task = work_text(row, profile, esco_record)
        parent_decision = parent_by_key.get(key)
        pstatus, prationale, prefs = get_parent_status(row, parent_decision or {})
        parent_status = pstatus
        # Existing exact raw/canonical decisions are retained, but an old
        # unsupported parent finding remains visible as a negative check.
        if prior and prior.get("parent_domain_fit", {}).get("status") in {"supported", "conditional", "unsupported"}:
            parent_status = prior["parent_domain_fit"]["status"]
            prationale = prior["parent_domain_fit"].get("rationale") or prationale
            prefs = unique(pref for pref in prefs + prior["parent_domain_fit"].get("source_urls", []) if str(pref).startswith("http"))
        areas = catalog.get(row.get("domain_id"), {}).get("areas", [])
        prior_area = prior.get("area_fit", {}) if prior else {}
        # Existing manually reviewed direct/alias/area decisions are honored.
        dup = None
        if is_raw_omitted and uri:
            for canon_key, canon_row in canonical_by_uri.get(uri, []):
                if canon_key == key:
                    continue
                left = set(tokens(task))
                right = set(tokens(canon_row.get("description")))
                similarity = len(left & right) / len(left | right) if left | right else 0
                if similarity >= 0.50:
                    dup = {"role_key": role_key(canon_row), "esco_uri": uri, "task_token_jaccard": round(similarity, 3)}
                    break
        route = choose_route({"role_source_urls": prefs}, task, areas, esco_record, parent_status, prationale, prior_area, is_raw_omitted, dup)
        candidates = candidate_areas(task, areas)
        selected_candidate = next((c for c in candidates if c.get("area_key") == route.get("area_key")), None)
        negative = []
        if parent_status == "unsupported":
            negative.append({"check": "parent_boundary", "result": "existing task-based review rejects the exact domain link", "rationale": prationale, "sources": prefs})
        for c in candidates:
            if c.get("negative_scope_terms_found"):
                negative.append({"check": "area_explicit_exclusion", "area_key": c.get("area_key"), "terms": c["negative_scope_terms_found"]})
        # Adjacent areas are explicitly checked rather than silently ignored.
        for c in candidates:
            if selected_candidate and c["area_key"] == selected_candidate["area_key"]:
                continue
            if len([x for x in negative if x.get("check") == "neighbor_area_boundary"]) >= 3:
                break
            negative.append({
                "check": "neighbor_area_boundary",
                "area_key": c.get("area_key"),
                "label": c.get("label"),
                "distinctive_task_phrases_present": c.get("task_boundary_phrase_hits", []),
                "result": "not promoted as a competing route unless its own task/boundary evidence is independently supported",
            })
        sources = url_records(row, parent_decision or {}, profile, esco_record, uri)
        source_ok = bool(sources)
        if route["status"] == "external-review" and source_ok and esco_record and task:
            # A real source exists; residual is fit ambiguity, not absent source.
            route["remit"] = route.get("remit") or ["adjudicate the competing domain/area boundary using the cited task definition; current evidence is not unique"]
        output.append({
            "exact_role_key": role_key(row),
            "domain_id": row.get("domain_id"),
            "domain_name": (meta.get(row.get("domain_id")) or {}).get("domain_name") or row.get("domain_name"),
            "canonical_present": not is_raw_omitted,
            "source_backed_raw_omitted_candidate": is_raw_omitted,
            "canonical_source_file": canonical_file.get(key),
            "raw_source_file": "data/career-mapping/role_library_v3.json" if is_raw_omitted else None,
            "raw_esco_code": code,
            "esco_uri": uri,
            "esco_preferred_label": (esco_record or {}).get("label"),
            "esco_definition": (esco_record or {}).get("definition"),
            "role_description": row.get("description"),
            "role_skills": {"essential": row.get("essential_skills", []), "optional": row.get("optional_skills", [])},
            "esco_skills": {"essential": (esco_record or {}).get("essential_skills", []), "optional": (esco_record or {}).get("optional_skills", [])},
            "onet_esco_work_activities": profile.get("activities", []) if profile else [],
            "work_activities": profile.get("work_activities", []) if profile else [],
            "task_evidence_used": task,
            "domain_boundary": (meta.get(row.get("domain_id")) or {}).get("description", ""),
            "area_boundaries_checked": [{"area_key": a.get("area_key"), "label": a.get("label"), "boundary": a.get("boundary") or a.get("description")} for a in areas],
            "parent_domain_disposition": {"status": parent_status, "rationale": prationale, "source_urls": prefs, "access_date": ACCESS_DATE},
            "route_disposition": route,
            "existing_cross_domain_routes": row.get("role_domain_routes") or [],
            "secondary_routes_preserved": [
                x for x in (row.get("role_domain_routes") or [])
                if str(x.get("route_type", "")).casefold() == "secondary"
            ],
            "candidate_routes": candidates,
            "negative_neighbor_checks": negative,
            "source_records": sources,
            "source_provenance": {
                "esco_dataset_version": ESCO_VERSION if esco_record else None,
                "esco_local_artifact": "data/career-mapping/taxonomies/esco_occupations.json" if esco_record else None,
                "esco_concept_uri": uri,
                "access_date": ACCESS_DATE,
                "missing_authoritative_locator": not source_ok,
            },
            "prior_first_pass_status": prior.get("area_fit", {}).get("status") if prior else None,
            "prior_first_pass_rationale": prior.get("area_fit", {}).get("rationale") if prior else None,
            "isco_and_subgroup_membership_used_as_fit_proof": False,
            "title_used_as_fit_proof": False,
            "canonical_files_edited": False,
        })

    counts = Counter(r["route_disposition"]["status"] for r in output)
    canonical_counts = Counter(r["route_disposition"]["status"] for r in output if r["canonical_present"])
    raw_counts = Counter(r["route_disposition"]["status"] for r in output if r["source_backed_raw_omitted_candidate"])
    parent_counts = Counter(r["parent_domain_disposition"]["status"] for r in output)
    omitted_with_esco = sum(bool(r["esco_uri"]) for r in output if r["source_backed_raw_omitted_candidate"])
    canonical_with_esco = sum(bool(r["esco_uri"]) for r in output if r["canonical_present"])
    payload = {
        "schema_version": "2026-10-07.workstream-b.d057-d112.second-pass.v1",
        "lane": "D057-D112",
        "status": "targeted_second_pass_complete_proposal_only",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": {
            "domains": [f"D{i:03d}" for i in range(57, 113)],
            "canonical_selection": "non-excluded exact canonical role keys missing from pass one or first-pass conditional/external-review only; already-supported and direct routes omitted from repeat review",
            "raw_omission_selection": "raw role_library_v3 records absent from active canonical cleaned/thin/emerging set, reported separately",
        },
        "counts": {
            "unique_canonical_exact_keys_reconciled": sum(r["canonical_present"] for r in output),
            "unique_raw_omitted_exact_keys_reconciled_separately": sum(r["source_backed_raw_omitted_candidate"] for r in output),
            "unique_exact_keys_total": len(output),
            "canonical_route_dispositions": dict(canonical_counts),
            "raw_omitted_candidate_dispositions": dict(raw_counts),
            "all_route_dispositions": dict(counts),
            "parent_domain_dispositions": dict(parent_counts),
            "canonical_with_exact_esco_source": canonical_with_esco,
            "raw_omitted_with_exact_esco_source": omitted_with_esco,
            "canonical_without_exact_esco_match": sum(not r["esco_uri"] for r in output if r["canonical_present"]),
            "raw_omitted_without_exact_esco_match": sum(not r["esco_uri"] for r in output if r["source_backed_raw_omitted_candidate"]),
            "canonical_with_role_work_profile": sum(bool(r["onet_esco_work_activities"] or r["work_activities"]) for r in output if r["canonical_present"]),
            "excluded_canonical_not_in_second_pass": sum(excluded.values()),
        },
        "method": {
            "primary_task_evidence": ["canonical role description", "exact ESCO definition and skill relations when code+label resolves", "O*NET/ESCO work-profile activities when present"],
            "fit_basis": ["task/work activity", "parent-domain scope", "area definition/boundary", "explicit exclusions and neighbor checks", "provenance and access date"],
            "classification": ["supported", "secondary", "conditional", "direct domain→role", "unsupported", "duplicate", "external-review"],
            "authority_note": "ESCO is an authoritative occupational classification, not a domain/specialization taxonomy. Its exact occupational definition supports task identity; role-to-domain/area fit is independently adjudicated against local boundaries.",
            "title_isco_subgroup_fit_inference": False,
            "external_source_policy": "Use exact ESCO concept URIs and existing official O*NET/ESCO task profile URLs first. If neither source resolves to the exact task, retain external-review with a precise evidence request; do not treat a general landing page as exact role proof.",
            "canonical_files_edited": False,
        },
        "external_authority_references": [
            {"publisher": "European Commission ESCO", "title": "ESCO classification: Occupations", "url": "https://esco.ec.europa.eu/en/classification/occupation_main", "locator": "Official description of occupation records, definitions/scope notes and occupational profiles", "last_version_note": "ESCO v1.2.1, last update 2025-12-10", "access_date": ACCESS_DATE, "claim_limit": "Supports occupation identity/task-source methodology; not proof of this product's domain or area taxonomy."},
            {"publisher": "European Commission ESCO", "title": "ESCO download", "url": "https://esco.ec.europa.eu/en/use-esco/download", "locator": "Dataset download page and supported formats", "last_version_note": "ESCO v1.2.1, last update 2025-12-10", "access_date": ACCESS_DATE, "claim_limit": "Authoritative source/download process; local extracted record still must match exact code and preferred/alternative label."},
        ],
        "records": output,
    }
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    checkpoint = {
        "schema_version": "2026-10-07.workstream-b.d057-d112.second-pass-checkpoint.v1",
        "status": "complete_for_assigned_range_proposal_only",
        "completed_domains": [f"D{i:03d}" for i in range(57, 113)],
        "next_domain": None,
        "counts": payload["counts"],
        "route_decisions": dict(counts),
        "exact_output_files": [str(p.relative_to(ROOT)).replace("\\", "/") for p in (OUT, MANIFEST, CHECKPOINT, CHECKPOINT_MD, HERE / Path(__file__).name)],
        "canonical_files_edited": False,
        "remaining_external_review_keys": [r["exact_role_key"] for r in output if r["route_disposition"]["status"] == "external-review"],
        "note": "Every assigned residual exact key has a disposition. External-review entries identify the specific missing authoritative evidence, not a generic hold.",
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    manifest_files = [OUT, CHECKPOINT, CHECKPOINT_MD, HERE / Path(__file__).name]
    manifest = {
        "schema_version": "2026-10-07.workstream-b.d057-d112.second-pass-manifest.v1",
        "lane": "D057-D112",
        "status": "complete_proposal_only",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": payload["scope"],
        "counts": payload["counts"],
        "input_files": [
            str(p.relative_to(ROOT)).replace("\\", "/")
            for p in (FIRST, RAW, *CANONICAL_FILES, ESCO, WORK_PROFILES, META, AREA_CATALOG, PARENT_REVIEW)
        ],
        "output_files": [],
        "canonical_files_edited": False,
        "area_files_edited": False,
    }
    for path in manifest_files:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        manifest["output_files"].append({
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": digest,
            "bytes": path.stat().st_size,
        })
    manifest["output_files"].append({
        "path": str(MANIFEST.relative_to(ROOT)).replace("\\", "/"),
        "sha256": None,
        "bytes": None,
        "note": "Manifest self-hash intentionally omitted.",
    })
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md = [
        "# D057–D112 role reconciliation — targeted second pass",
        "",
        f"Generated/accessed: {ACCESS_DATE}. Proposal-only; no canonical role/area/domain/overlay file was edited.",
        "",
        "## Scope and counts",
        "",
        f"- Non-excluded canonical residual exact keys dispositioned: **{payload['counts']['unique_canonical_exact_keys_reconciled']:,}**.",
        f"- Raw source roles absent from active canonical data, separately dispositioned as candidates: **{payload['counts']['unique_raw_omitted_exact_keys_reconciled_separately']:,}**.",
        f"- Total unique exact keys in this targeted pass: **{payload['counts']['unique_exact_keys_total']:,}**.",
        f"- Canonical dispositions: `{json.dumps(payload['counts']['canonical_route_dispositions'], sort_keys=True)}`.",
        f"- Raw-omitted candidate dispositions: `{json.dumps(payload['counts']['raw_omitted_candidate_dispositions'], sort_keys=True)}`.",
        f"- Parent-domain dispositions: `{json.dumps(payload['counts']['parent_domain_dispositions'], sort_keys=True)}`.",
        f"- Exact ESCO concept sources matched: **{canonical_with_esco:,}/{payload['counts']['unique_canonical_exact_keys_reconciled']:,} canonical**, **{omitted_with_esco:,}/{payload['counts']['unique_raw_omitted_exact_keys_reconciled_separately']:,} raw-omitted**.",
        "",
        "## Evidence and decision policy",
        "",
        "For ESCO roles, the exact local concept URI, preferred label, definition, and skill relations are matched by ESCO code plus label and cited to the European Commission classification. O*NET work-profile activities and source links are included where available. The current domain and area boundaries are checked separately. ESCO/ISCO classifications establish occupational identity and task context, not automatic fit to this product's domain/area taxonomy.",
        "",
        "Conditional rows have a concrete remit. Direct domain→role is used where parent fit is supported but no area route is independently established. Secondary routes are preserved rather than replacing the primary route. Unsupported rows retain explicit parent/boundary contradictions. External-review is reserved for an exact-source or task/route evidence gap, with a record-specific request in JSON.",
        "",
        "## Authoritative external references checked",
        "",
        "- European Commission ESCO Occupations page: https://esco.ec.europa.eu/en/classification/occupation_main (official occupation concepts include definitions/scope notes and occupational profiles; accessed 2026-10-07).",
        "- European Commission ESCO Download page: https://esco.ec.europa.eu/en/use-esco/download (official versioned classification datasets; v1.2.1 last updated 2025-12-10; accessed 2026-10-07).",
        "- The local ESCO v1.2.1 dataset provides exact concept URIs and definitions for most residual ESCO records. Individual exact URIs and role locators are stored per record in the JSON.",
        "",
        "## Checkpoint and files",
        "",
        f"- Full proposal ledger: `{OUT.relative_to(ROOT).as_posix()}`",
        f"- Machine checkpoint: `{CHECKPOINT.relative_to(ROOT).as_posix()}`",
        f"- Machine manifest: `{MANIFEST.relative_to(ROOT).as_posix()}`",
        f"- Reproducible script: `{(HERE / Path(__file__).name).relative_to(ROOT).as_posix()}`",
        "",
        "The checkpoint lists every remaining external-review exact key and its per-record remit. Those entries are not silently promoted or discarded.",
    ]
    CHECKPOINT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "checkpoint": str(CHECKPOINT), "counts": payload["counts"]}, indent=2))


if __name__ == "__main__":
    main()
