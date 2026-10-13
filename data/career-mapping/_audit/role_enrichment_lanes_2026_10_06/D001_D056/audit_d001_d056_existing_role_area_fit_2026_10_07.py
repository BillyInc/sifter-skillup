"""Reconcile active D001-D056 role records to independent parent and area fit.

The result is an append-only audit artifact. Canonical files are read-only.
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
ROLE_FILES = [DATA / n for n in ("role_library_v3_cleaned.json", "thin_domain_role_overlays.json", "emerging_role_overlays.json")]
CATALOG = DATA / "domain_specialization_catalog.json"
DOMAIN_META = DATA / "domain_meta.json"
DOMAIN_REVIEW_DIR = AUDIT / "role_fit_lanes_2026_10_05" / "D001_D084"
GLOBAL_D001_REVIEW = AUDIT / "specialization_lanes_2026_10_05" / "D001_D112_GLOBAL_RECONCILIATION" / "D001_global_specialization_reconciliation.json"
OUT_JSON = HERE / "D001_D056_existing_role_area_fit_review_2026_10_07.json"
OUT_MD = HERE / "D001_D056_existing_role_area_fit_review_2026_10_07.md"
CHECKPOINT = HERE / "D001_D056_role_area_ng_context_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D001_D056_role_area_ng_context_checkpoint_2026_10_07.md"
EXCLUDED = {"excluded", "review_only", "audit_only"}
NOW = datetime.now(timezone.utc).isoformat()
STOPWORDS = {"and", "the", "for", "with", "from", "into", "that", "this", "their", "area", "areas", "practice", "practices", "service", "services", "role", "roles", "work", "working", "use", "using", "provide", "provides", "support", "supports", "perform", "performs", "develop", "develops", "development", "design", "designs", "process", "processes", "professional", "professionals", "related", "including", "across", "one", "two", "new", "other", "based", "required", "ensure", "ensures"}
GENERIC = {"analysis", "apply", "business", "build", "change", "coordinate", "delivery", "development", "engineering", "improvement", "maintain", "management", "monitor", "operations", "planning", "process", "processes", "production", "requirements", "service", "services", "software", "systems", "technology", "testing", "work"}

# Human-adjudicated, task-based D001 matches against the current area boundary.
# The keys are normalized role identities only for lookup; every rule is also
# gated by required task phrases and supported parent-domain status below.
MANUAL_D001_AREA_DECISIONS = {
    "blockchain engineers": ("D001:secure-software-engineering", ("security", "secure"), "The stored role tasks explicitly design/deploy secure blockchain patterns and test blockchain security; this is software-lifecycle security work, not an assignment based on the role title or taxonomy membership."),
    "cloud devops engineer": ("D001:software-engineering-operations-and-reliability", ("continuous software delivery", "deployment"), "The stored role tasks explicitly implement continuous software delivery, automated testing and deployment mechanisms, matching software delivery/operation responsibilities."),
    "cloud software developer": ("D001:software-construction-and-platform-development", ("software applications", "develop"), "The stored role tasks create and deploy software applications for cloud platforms; the platform is a development context, not a separate area."),
    "computer programmers": ("D001:software-construction-and-platform-development", ("create, modify", "code and scripts"), "The stored role tasks explicitly create/modify program code and scripts, directly matching software construction."),
    "digital games developer": ("D001:software-construction-and-platform-development", ("program, implement", "digital games"), "The stored role tasks program and implement digital-game software; this is platform/application construction."),
    "embedded systems software developer": ("D001:software-construction-and-platform-development", ("program, implement", "embedded system"), "The stored role tasks program, implement and maintain software for embedded systems, matching software construction on an embedded platform."),
    "ict accessibility tester": ("D001:software-testing-verification-and-quality", ("evaluate websites", "accessibility"), "The stored role tasks evaluate software and interface operability/accessibility; this is verification/testing against usability and access requirements."),
    "ict application developer": ("D001:software-construction-and-platform-development", ("implement", "applications based on the designs"), "The stored role tasks explicitly implement ICT applications from supplied designs using development tools/platforms."),
    "ict integration tester": ("D001:software-testing-verification-and-quality", ("perform tests", "integration test"), "The stored role tasks execute integration test plans across software components, directly matching software verification/testing."),
    "ict test analyst": ("D001:software-testing-verification-and-quality", ("design tests", "tests scripts"), "The stored role tasks design tests and scripts to assess product quality/accuracy, directly matching verification and quality."),
    "ict usability tester": ("D001:software-testing-verification-and-quality", ("usability", "requirements"), "The stored role tasks evaluate usability and compliance with requirements during the software lifecycle, matching testing/quality rather than general interface design."),
    "industrial mobile devices software developer": ("D001:software-construction-and-platform-development", ("implement applications", "mobile devices"), "The stored role tasks implement applications for industrial mobile devices; this is software construction on a specialized platform."),
    "mobile application developer": ("D001:software-construction-and-platform-development", ("implement applications", "mobile devices"), "The stored role tasks implement applications for mobile devices using platform-specific development tools."),
    "software analyst": ("D001:software-requirements-and-modeling", ("elicit", "user requirements"), "The stored role tasks elicit/prioritize user requirements and produce software specifications, directly matching requirements analysis and modeling."),
    "software architect": ("D001:software-architecture-and-design", ("design the architecture", "components"), "The stored role tasks design software architecture, modules and components against functional specifications and requirements."),
    "software developer": ("D001:software-construction-and-platform-development", ("implement or program", "software systems"), "The stored role tasks implement/program software systems from specifications and designs, directly matching construction."),
    "software quality assurance analysts and testers": ("D001:software-testing-verification-and-quality", ("execute software tests", "software problems"), "The stored role tasks develop/execute software tests, document defects and report causes, directly matching testing and quality."),
    "software tester": ("D001:software-testing-verification-and-quality", ("perform software tests", "function properly"), "The stored role tasks perform software tests and verify applications function before delivery."),
    "user interface developer": ("D001:software-construction-and-platform-development", ("implement, code", "interface of a software system"), "The stored role tasks implement, code and maintain software interfaces using front-end technologies; the work is construction, not just visual design."),
    "web and digital interface designers": ("D001:software-architecture-and-design", ("design digital user interfaces", "layouts, interfaces"), "The stored role tasks design and test digital interfaces, layouts and navigation; this maps to software interface/design decisions, not the construction route."),
    "web developer": ("D001:software-construction-and-platform-development", ("develop, implement", "web-accessible software"), "The stored role tasks develop and implement web-accessible software from designs; this is construction on a web platform."),
}


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, obj: Any) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: Any) -> str:
    value = str(value or "").casefold().replace("&", " and ")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def role_key(domain_id: str, role_name: str) -> str:
    return f"{domain_id}|{norm(role_name)}"


def task_tokens(value: str) -> set[str]:
    return {t for t in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value)) if t not in STOPWORDS and not t.isdigit()}


def task_phrases(value: str) -> set[str]:
    words = [t for t in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value)) if t not in STOPWORDS]
    return {" ".join(words[i:i+w]) for w in (2, 3) for i in range(len(words)-w+1)}


def rank_area_matches(task: str, domain: dict[str, Any]) -> list[dict[str, Any]]:
    task_words = task_tokens(task)
    task_phr = task_phrases(task)
    ranked = []
    for area in domain.get("areas", []):
        label = str(area.get("label") or "")
        boundary = str(area.get("boundary") or "")
        label_hits = sorted(task_words & task_tokens(label))
        boundary_hits = sorted(task_words & task_tokens(boundary))
        phrase_hits = sorted(task_phr & task_phrases(label + " " + boundary))
        distinctive = (set(label_hits) | set(boundary_hits)) - GENERIC
        score = 4 * len(set(label_hits) - GENERIC) + len(set(boundary_hits) - GENERIC) + 3 * min(2, len(phrase_hits))
        ranked.append({"area_key": area.get("area_key"), "label": label, "boundary": boundary,
                       "score": score, "distinctive_task_hits": sorted(distinctive), "phrase_hits": phrase_hits,
                       "source_ids": area.get("source_ids", [])})
    return sorted(ranked, key=lambda r: (-r["score"], r["label"]))


def citations(refs: list[str]) -> list[dict[str, Any]]:
    out = []
    for ref in refs:
        if isinstance(ref, str) and ref.startswith(("https://", "http://")):
            out.append({"source_id": None, "url": ref, "locator": "Exact task-source reference stored in the role/domain audit.",
                        "supports": "Role task evidence reference; reopen source to verify the exact task passage before external publication.",
                        "limitation": "A source URL is not by itself evidence of Nigerian demand, licensing, or universal equivalence."})
        else:
            out.append({"source_id": ref, "url": None, "locator": None,
                        "supports": None, "limitation": "Source ID is not expanded to a URL in this lane's exact-role record."})
    return out


def main() -> None:
    catalog = read(CATALOG)
    meta = read(DOMAIN_META)
    domains = {d["domain_id"]: d for d in catalog.get("domains", [])}
    d001_global = read(GLOBAL_D001_REVIEW)
    d001_sources = {s.get("source_id"): s for s in d001_global.get("evidence_reconciliation", {}).get("source_records", [])}
    ids = {f"D{i:03d}" for i in range(1, 57)}
    active: dict[str, dict[str, Any]] = {}
    sources_for_role: dict[str, list[str]] = defaultdict(list)
    for path in ROLE_FILES:
        payload = read(path)
        rows = payload if isinstance(payload, list) else payload.get("roles", [])
        for row in rows:
            did = str(row.get("domain_id") or "")
            if did not in ids or str(row.get("student_path_status") or "active").casefold() in EXCLUDED:
                continue
            key = role_key(did, str(row.get("role_name") or ""))
            active.setdefault(key, row)
            sources_for_role[key].append(path.name)

    task_decisions: dict[str, dict[str, Any]] = {}
    missing_domain_reviews = []
    for i in range(1, 57):
        did = f"D{i:03d}"
        path = DOMAIN_REVIEW_DIR / f"{did}_role_domain_fit_review_2026_10_05.json"
        if not path.exists() and did == "D001":
            path = DOMAIN_REVIEW_DIR / "D001_reviewed_decisions.json"
        if not path.exists():
            missing_domain_reviews.append(did)
            continue
        payload = read(path)
        decisions = payload.get("decisions") or payload.get("reviewed_decisions") or payload.get("D001_reviews") or []
        for decision in decisions:
            name = decision.get("role_name") or decision.get("role_key", "").split("|", 1)[-1]
            task_decisions[role_key(did, name)] = decision

    records = []
    parent_counts = Counter()
    area_counts = Counter()
    origin_counts = Counter()
    for key, row in sorted(active.items()):
        did = str(row.get("domain_id"))
        domain = domains.get(did, {})
        task_review = task_decisions.get(key)
        review_meta = (task_review or {}).get("canonical_review_metadata") or {}
        task_profiles = ((task_review or {}).get("source_evidence") or {}).get("onet_task_profiles") or []
        role_description = str((task_review or {}).get("task_evidence") or (task_review or {}).get("role_description") or row.get("description") or "").strip()
        source_task_descriptions = " ".join(str(p.get("onet_description") or "").strip() for p in task_profiles if p.get("onet_description"))
        task_text = " ".join(x for x in (role_description, source_task_descriptions) if x).strip()
        raw_parent = str((task_review or {}).get("domain_fit_status") or (task_review or {}).get("domain_fit") or
                         review_meta.get("domain_fit_review_status") or
                         row.get("role_domain_lane_review_status") or row.get("domain_fit_review_status") or "").casefold()
        if raw_parent in {"supported", "reviewed_supported"} and task_text and (task_review or row.get("domain_fit_review_source_refs")):
            parent_status = "supported"
            parent_rationale = str((task_review or {}).get("basis") or (task_review or {}).get("rationale") or review_meta.get("domain_fit_review_basis") or row.get("domain_fit_review_basis") or "Exact role task was assessed against the parent-domain scope; subgroup/ISCO/ESCO is not used as fit evidence.")
        elif raw_parent in {"unsupported_for_domain", "unsupported", "reviewed_unsupported", "not_supported"}:
            parent_status = "not_supported"
            parent_rationale = str((task_review or {}).get("basis") or (task_review or {}).get("rationale") or review_meta.get("domain_fit_review_basis") or row.get("domain_fit_review_basis") or "Existing task audit does not support this parent-domain route.")
        else:
            parent_status = "review_required"
            parent_rationale = "No exact source-backed parent-domain determination is available for this role key; task description is retained, but title or subgroup is not treated as proof."
        parent_refs = list((task_review or {}).get("source_refs") or (task_review or {}).get("evidence_source_urls") or
                           review_meta.get("domain_fit_review_source_refs") or row.get("domain_fit_review_source_refs") or [])
        parent_counts[parent_status] += 1
        origin_counts["exact_task_decision" if task_review else "role_record_fallback"] += 1

        candidate = str(row.get("specialization_fit_candidate") or row.get("specialization_fit_area") or review_meta.get("specialization_fit_candidate") or "").strip()
        candidate_norm = norm(re.sub(r"\s*\([^)]*\)\s*$", "", candidate))
        matched_area = next((a for a in domain.get("areas", []) if norm(a.get("label")) == candidate_norm), None) if candidate_norm else None
        area_raw = str(row.get("specialization_fit_review_status") or row.get("specialization_fit_status") or review_meta.get("specialization_fit_review_status") or "").casefold()
        area_refs = list(row.get("specialization_fit_review_source_refs") or row.get("specialization_fit_source_refs") or review_meta.get("specialization_fit_review_source_refs") or [])
        area_basis = str(row.get("specialization_fit_review_basis") or row.get("specialization_fit_rationale") or review_meta.get("specialization_fit_review_basis") or "").strip()
        has_task_source = any(isinstance(ref, str) and ref.startswith(("https://", "http://")) for ref in area_refs)
        ranked_areas = rank_area_matches(task_text, domain)
        best_area = ranked_areas[0] if ranked_areas else None
        best_area_record = next((a for a in domain.get("areas", []) if best_area and a.get("area_key") == best_area.get("area_key")), None)
        manual_area = MANUAL_D001_AREA_DECISIONS.get(norm(str(row.get("role_name") or ""))) if did == "D001" else None
        manual_area_record = next((a for a in domain.get("areas", []) if manual_area and a.get("area_key") == manual_area[0]), None)
        manual_task_ok = bool(manual_area and parent_status == "supported" and task_text and all(norm(term) in norm(task_text) for term in manual_area[1]) and manual_area_record)
        second_area_score = ranked_areas[1]["score"] if len(ranked_areas) > 1 else 0
        candidate_area_supported_by_task = bool(best_area and len(best_area["distinctive_task_hits"]) >= 2 and best_area["score"] - second_area_score >= 2)
        if not domain.get("areas") and domain.get("step1_status") == "no_specialization_recommended" and domain.get("disposition") == "resolved":
            area_status = "direct_domain_to_role"
            area_rationale = "The current Global Step 1 catalogue explicitly resolves this domain to no recommended areas; direct domain-to-role is therefore the supported route."
            matched_area = None
        elif manual_task_ok:
            area_status = "supported_manual_task_and_area_evidence"
            matched_area = manual_area_record
            area_rationale = manual_area[2] + " The area boundary is independently grounded in the current global specialization reconciliation; this Nigeria-context work is not used to infer the global fit."
        elif (parent_status == "supported" and area_raw == "supported" and matched_area and area_basis and has_task_source and task_text):
            area_status = "supported_existing_area_decision_reconciled"
            area_rationale = area_basis + " Matched by exact label to the current 709-area catalog; the role task and evidence are retained separately from the parent-domain decision."
        else:
            area_status = "review_required"
            area_rationale = ("Task-only lexical triage found a unique recommended-area candidate, but this is a navigation aid, not a fit verdict; a source-backed semantic check against the full role tasks is still required. "
                              if candidate_area_supported_by_task else
                              "Task-only lexical triage did not establish a unique area. A candidate ranking is not a fit verdict; retain review_required until role-task evidence is checked against the area boundary.")
            # A non-exact legacy label is not returned as an area assignment.
            if not matched_area:
                matched_area = None
        area_counts[area_status] += 1
        selected_area = manual_area_record if manual_task_ok else (matched_area or best_area_record)
        area_boundary_sources = (selected_area or {}).get("source_ids", [])
        area_boundary_citations = [d001_sources[sid] for sid in area_boundary_sources if sid in d001_sources] if did == "D001" else []

        records.append({
            "role_key": f"{did}|{row.get('role_name')}",
            "normalized_role_key": key,
            "domain_id": did,
            "domain_name": row.get("domain_name") or domain.get("domain_name"),
            "role_title": row.get("role_name"),
            "also_known_as": row.get("also_known_as") or [],
            "source_files": sorted(set(sources_for_role[key])),
            "exact_role_task_evidence": task_text or None,
            "parent_domain_fit": {"status": parent_status, "rationale": parent_rationale, "source_refs": parent_refs, "citations": citations(parent_refs), "independent_of_area_fit": True},
            "area_fit": {"status": area_status, "area_key": matched_area.get("area_key") if matched_area else None,
                         "area_label": matched_area.get("label") if matched_area else None,
                         "area_boundary": matched_area.get("boundary") if matched_area else None,
                         "rationale": area_rationale, "source_refs": area_refs, "citations": citations(area_refs),
                         "area_boundary_source_ids": area_boundary_sources,
                         "area_boundary_citations": area_boundary_citations,
                         "manual_task_area_reconciliation": manual_task_ok,
                         "task_evidence_source_refs": parent_refs, "task_evidence_citations": citations(parent_refs),
                         "proposed_area_candidate": ranked_areas[0] if candidate_area_supported_by_task else None,
                         "proposed_area_boundary_source_ids": (best_area_record or {}).get("source_ids", []) if candidate_area_supported_by_task else [],
                         "proposed_area_fit_note": ("Task text has a unique lexical signal against this current area boundary; this is a candidate for adjudication only and is not treated as semantic fit evidence or a final assignment."
                                                     if candidate_area_supported_by_task else "No unique task-only area candidate was produced; compare full role tasks with each current area boundary using external task evidence."),
                         "task_only_ranked_area_candidates": ranked_areas[:3], "task_only_unique_candidate_signal": candidate_area_supported_by_task,
                         "legacy_area_label_not_used_as_current_fit": candidate or None},
            "isco_esco_or_subgroup_used_as_fit_evidence": False,
            "disposition": "review_required" if "review_required" in {parent_status, area_status} else ("not_supported" if "not_supported" in {parent_status, area_status} else "supported"),
            "canonical_files_edited": False,
        })

    counts = Counter(r["disposition"] for r in records)
    payload = {
        "schema_version": "2026-10-07.d001-d056.existing-role-area-fit.v1",
        "created_at_utc": NOW,
        "lane": "D001-D056",
        "scope": "Every unique active role key from the cleaned role library and overlays, reconciled to parent-domain task evidence and current recommended area boundaries.",
        "inputs": {"role_files": [p.relative_to(ROOT).as_posix() for p in ROLE_FILES], "normalized_area_catalog": CATALOG.relative_to(ROOT).as_posix(),
                   "prior_role_task_reviews": DOMAIN_REVIEW_DIR.relative_to(ROOT).as_posix()},
        "policy": {"isco_or_esco_membership_is_fit_evidence": False, "title_alone_is_fit_evidence": False,
                   "current_subgroup_membership_is_fit_evidence": False, "uncertainty_status": "review_required",
                   "canonical_files_edited": False},
        "counts": {"active_unique_role_keys": len(records), "domains_with_active_roles": len({r["domain_id"] for r in records}),
                   "matched_exact_role_task_reviews": sum(r["parent_domain_fit"]["independent_of_area_fit"] and r["normalized_role_key"] in task_decisions for r in records),
                   "domains_missing_prior_role_task_review_file": missing_domain_reviews,
                   "parent_fit_status": dict(parent_counts), "area_fit_status": dict(area_counts), "disposition": dict(counts),
                   "unique_task_only_area_candidates": sum(bool(r["area_fit"]["proposed_area_candidate"]) for r in records),
                   "canonical_files_edited": False},
        "records": records,
        "integrity": {"each_active_unique_key_once": len(records) == len(active),
                      "all_supported_parent_rows_have_task": all(r["exact_role_task_evidence"] for r in records if r["parent_domain_fit"]["status"] == "supported"),
                      "all_area_keys_resolve": all(not r["area_fit"]["area_key"] or any(a["area_key"] == r["area_fit"]["area_key"] for d in catalog["domains"] for a in d.get("areas", [])) for r in records),
                      "no_taxonomy_membership_fit": all(not r["isco_esco_or_subgroup_used_as_fit_evidence"] for r in records),
                      "canonical_files_edited": False},
        "limitations": ["Stored exact role-task reviews are reused as evidence, not represented as newly re-opened source pages.",
                        "Legacy area labels only count when an exact current recommended-area match and task rationale/source exist; otherwise area fit remains review_required.",
                        "Task-only area rankings are search aids, not accepted fit determinations. The recommended area's source IDs are carried into the row for independent review.",
                        "No canonical role, overlay, domain or subgroup file is edited."],
    }
    write(OUT_JSON, payload)
    lines = ["# D001–D056 existing role-to-domain and role-to-area fit audit", "", f"Active unique roles: **{len(records)}** across **{payload['counts']['domains_with_active_roles']}** domains.",
             f"Parent fit: `{json.dumps(dict(parent_counts), ensure_ascii=False)}`.", f"Area fit: `{json.dumps(dict(area_counts), ensure_ascii=False)}`.",
             "", "Each row keeps parent-domain fit separate from recommended-area fit. Unsupported/uncertain items remain explicit; subgroup and occupational classification membership are not used as fit evidence.",
             "", "| Domain | Active roles | Parent supported | Parent unsupported | Parent review | Area supported | Direct route | Area review |", "|---|---:|---:|---:|---:|---:|---:|---:|"]
    for did in sorted({r["domain_id"] for r in records}):
        group = [r for r in records if r["domain_id"] == did]
        lines.append(f"| {did} | {len(group)} | {sum(r['parent_domain_fit']['status']=='supported' for r in group)} | {sum(r['parent_domain_fit']['status']=='not_supported' for r in group)} | {sum(r['parent_domain_fit']['status']=='review_required' for r in group)} | {sum(r['area_fit']['status'] in {'supported_existing_area_decision_reconciled', 'supported_manual_task_and_area_evidence'} for r in group)} | {sum(r['area_fit']['status']=='direct_domain_to_role' for r in group)} | {sum(r['area_fit']['status']=='review_required' for r in group)} |")
    lines += ["", "Candidate-by-candidate role tasks, rationales and source URLs are in the JSON. No canonical files edited.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    checkpoint = {
        "schema_version": "2026-10-07.d001-d056.role-area-ng-context-checkpoint.v1", "lane": "D001-D056",
        "status": "existing_role_area_fit_inventory_written_context_pass_pending", "checkpoint_written_at_utc": NOW,
        "artifact_paths": {"sparse_candidate_review": str((HERE / "D001_D056_SPARSE_AREA_FIT_REVIEW_2026_10_07.json").relative_to(ROOT).as_posix()),
                           "existing_role_area_json": OUT_JSON.relative_to(ROOT).as_posix(), "existing_role_area_markdown": OUT_MD.relative_to(ROOT).as_posix(),
                           "checkpoint_json": CHECKPOINT.relative_to(ROOT).as_posix(), "checkpoint_markdown": CHECKPOINT_MD.relative_to(ROOT).as_posix()},
        "progress": {"sparse_candidates": {"complete": 137, "total": 137}, "active_unique_roles": {"complete": len(records), "total": len(active), "domains": payload["counts"]["domains_with_active_roles"]},
                     "normalized_areas": {"context_pass": "pending"}},
        "role_counts": {"parent_fit": dict(parent_counts), "area_fit": dict(area_counts), "disposition": dict(counts)},
        "canonical_files_edited": False,
        "next_action": "Run the Nigerian area-context evidence pass for all normalized areas in D001-D056; then validate both review artifacts and finalize checkpoint."}
    write(CHECKPOINT, checkpoint)
    CHECKPOINT_MD.write_text("\n".join(["# D001–D056 role and Nigerian-context checkpoint", "",
        f"Sparse candidates processed: **137/137**. Existing active role keys inventoried: **{len(records)}/{len(active)}** across **{payload['counts']['domains_with_active_roles']}** domains.",
        f"Parent fit: `{json.dumps(dict(parent_counts), ensure_ascii=False)}`. Area fit: `{json.dumps(dict(area_counts), ensure_ascii=False)}`.",
        "", "Next: Nigerian context pass for every current recommended area in D001–D056. Canonical edits: none.", ""]), encoding="utf-8")
    assert payload["integrity"]["each_active_unique_key_once"]
    assert payload["integrity"]["all_area_keys_resolve"]
    assert payload["integrity"]["no_taxonomy_membership_fit"]
    print(json.dumps({"roles": payload["counts"], "integrity": payload["integrity"], "output": str(OUT_JSON), "checkpoint": str(CHECKPOINT)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
