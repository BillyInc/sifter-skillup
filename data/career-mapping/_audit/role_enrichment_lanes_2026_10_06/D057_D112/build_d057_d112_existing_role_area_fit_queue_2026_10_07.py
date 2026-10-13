"""Create an exhaustive, non-canonical D057-D112 role/area fit review queue.

The output preserves existing source-backed parent-domain decisions, but does
not infer an area from ISCO/ESCO membership or a current subgroup. Text overlap
is only a search aid; all area decisions remain review_required until an
independent task-to-boundary adjudication is recorded.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
OUT = HERE / "D057_D112_existing_role_area_fit_review_2026_10_07.json"
CHECKPOINT = HERE / "D057_D112_existing_role_area_fit_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D057_D112_existing_role_area_fit_checkpoint_2026_10_07.md"
CONTEXT = (AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
           / "STEP2_NIGERIAN_CONTEXT_2026_10_06" / "D057_D112"
           / "D057_D112_nigerian_context_evidence_2026_10_06.json")
STEP1 = (AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06"
         / "global_step1_specialization_reconciliation_2026_10_06.json")
META = DATA / "domain_meta.json"
AREAS = DATA / "domain_specialization_catalog.json"
ROLE_FILES = [DATA / "role_library_v3_cleaned.json",
              DATA / "thin_domain_role_overlays.json",
              DATA / "emerging_role_overlays.json"]
PARENT_REVIEW = AUDIT / "role_domain_review_decision_apply_2026_10_07.json"

# First manually adjudicated domain batch. Role task wording and parent-domain
# sources are carried from the active role records; area boundaries and area
# evidence are taken only from the normalized Global Step 1 catalog.
MANUAL_AREA_DECISIONS = {
    "D057|medical records clerk": ("supported", "D057:clinical-and-care-delivery-informatics", "Task is organising, maintaining, archiving and electronically transferring patient records; this is directly within the area's clinical records and care-information boundary."),
    "D057|picture archiving and communication systems administrator": ("supported", "D057:clinical-and-care-delivery-informatics", "Task administers PACS and makes diagnostic images available to clinical staff; this is a clinical information system supporting care workflows."),
    "D057|clinical coder": ("supported", "D057:clinical-and-care-delivery-informatics", "Task interprets clinical records and maps diagnoses/procedures to health classifications; the work is anchored in clinical records and information systems."),
    "D057|medical records manager": ("supported", "D057:clinical-and-care-delivery-informatics", "Task manages, secures and supervises patient-record operations, directly within clinical information governance and records."),
    "D057|clinical informatics manager": ("supported", "D057:clinical-and-care-delivery-informatics", "Task leads information systems in medical institutions and uses clinical knowledge to improve care services; exact match to clinical workflows and system implementation."),
    "D057|Health Informatics Specialists": ("supported", "D057:clinical-and-care-delivery-informatics", "The documented tasks design, develop, modify and implement computerized healthcare systems and educate clinical staff; direct clinical-system implementation fit."),
    "D057|Medical Records Specialists": ("supported", "D057:clinical-and-care-delivery-informatics", "The task profile compiles and maintains patient records and classifies/codes diagnoses and procedures; direct fit to clinical records and information management."),
    "D057|health informatics specialist": ("alias_existing", "D057:clinical-and-care-delivery-informatics", "The lowercase generic record overlaps the separately sourced Health Informatics Specialists role with materially equivalent task scope; preserve as an alias candidate, not an additional role."),
    "D057|healthcare institution manager": ("review_required", None, "The recorded tasks concern general hospital/facility operations, not specifically clinical informatics; parent fit is conditional and area ownership is not established."),
    "D057|waiting list coordinator": ("not_fit", None, "The recorded work schedules waiting lists and operating-room resources; the parent-domain audit finds no digital-health/informatics duties. Healthcare setting alone does not establish fit."),
    "D057|telemedicine coordinator": ("review_required", "D057:clinical-and-care-delivery-informatics", "Remote-care coordination maps conceptually to digital care delivery, but the exact occupational identity/task profile lacks a direct task source; retain conditional."),
    "D057|digital health product manager": ("review_required", "D057:clinical-and-care-delivery-informatics", "The recorded healthcare-specific product-development duties could fit clinical-system implementation, but exact role/task source is not independently established."),
    "D057|mHealth developer": ("review_required", "D057:clinical-and-care-delivery-informatics", "The described mobile-health applications for patient engagement, remote monitoring and clinical support fit the boundary, but the exact role profile lacks a direct occupational source."),
    "D057|electronic health records specialist": ("review_required", "D057:clinical-and-care-delivery-informatics", "EHR configuration and implementation fit the area boundary, but the exact title/task profile lacks its own validated source locator."),
    "D058|digital literacy teacher": ("direct_domain_role", None, "The source task is teaching basic computer use/digital literacy. The current recommended areas concern learning design, edtech systems, and learning analytics; none is a defensible specialization fit for this teaching role, so retain a direct domain-to-role route."),
    "D058|ICT trainer": ("supported", "D058:learning-experience-and-instructional-design", "Task evidence includes training-needs analysis, designing/updating training programs and materials, and delivering instruction; this matches the recommended instruction-design boundary, not merely ICT subgroup membership."),
    "D058|corporate trainer": ("review_required", None, "The role's supplied tasks describe general employee training, not specifically digital learning, edtech, or instructional design. Parent fit is conditional, so no area route is justified yet."),
    "D059|telecommunications engineer": ("review_required", "D059:ground-systems-space-communications-and-mission-operations", "General telecommunications tasks do not establish space communications. Keep conditional until a source-backed assignment shows satellite/spacecraft links, telemetry/command or ground stations."),
    "D059|astronaut": ("direct_domain_role", None, "The role performs crewed spaceflight and mission duties, but neither recommended area is an astronaut practice area; retain a direct domain-to-role route rather than forcing it into spacecraft engineering or ground systems."),
    "D059|aerospace engineer": ("review_required", "D059:spacecraft-and-payload-systems-engineering", "The occupation spans aeronautical and astronautical engineering; only its spacecraft/satellite assignments fit this domain and area. A specific space assignment is required."),
    "D059|aerospace engineering drafter": ("review_required", "D059:spacecraft-and-payload-systems-engineering", "The supplied drawing tasks span aircraft and spacecraft. Area fit is limited to spacecraft/satellite design drawings; the current record does not constrain the role to that assignment."),
    "D059|aerospace engineering technician": ("review_required", "D059:spacecraft-and-payload-systems-engineering", "The task spans aircraft and spacecraft testing. Keep conditional until the actual work is restricted to spacecraft/satellite systems."),
    "D059|avionics technician": ("review_required", "D059:spacecraft-and-payload-systems-engineering", "The role spans aircraft and spacecraft avionics; only space-vehicle system assignments fit this area, and the current generic role record does not separate them."),
    "D059|satellite engineer": ("supported", "D059:spacecraft-and-payload-systems-engineering", "The documented tasks develop, test, manufacture, command and monitor satellite systems in orbit; direct fit to spacecraft systems engineering."),
    "D059|Aerospace Engineering and Operations Technologists and Technicians": ("supported", "D059:spacecraft-and-payload-systems-engineering", "The documented duties operate/test integrated systems and instruments used to launch, track, position and evaluate space vehicles; direct spacecraft systems/operations fit."),
    "D059|Aerospace Engineers": ("alias_existing", "D059:spacecraft-and-payload-systems-engineering", "Same broad aerospace engineer occupation as the lowercase candidate; do not count twice. Parent and area applicability remains limited to documented spacecraft assignments."),
    "D059|Avionics Technicians": ("alias_existing", "D059:spacecraft-and-payload-systems-engineering", "Same avionics technician occupation family as the lowercase candidate; retain as a title variant, not a second role. Space-vehicle assignment limitation remains."),
}
ALIAS_TARGETS = {
    "D057|health informatics specialist": "D057|Health Informatics Specialists",
    "D059|Aerospace Engineers": "D059|aerospace engineer",
    "D059|Avionics Technicians": "D059|avionics technician",
}

def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def rows_from(path: Path):
    payload = read(path)
    return payload if isinstance(payload, list) else payload.get("roles", [])

def role_key(row):
    return f"{row.get('domain_id')}|{row.get('role_name')}"

def tokens(value):
    return {t for t in re.findall(r"[a-z0-9+#]{3,}", str(value or "").casefold())
            if t not in {"the", "and", "for", "with", "from", "into", "their", "this", "that", "work", "role", "roles", "area", "areas", "practice", "services", "service"}}

def main():
    global_step1 = read(STEP1)
    catalog = read(AREAS)
    metadata = read(META)
    parent_apply = read(PARENT_REVIEW)
    parent_decisions = {r["role_key"]: r for r in parent_apply.get("changes", [])
                        if r.get("role_key")}
    step_domains = {d["domain_id"]: d for d in global_step1.get("domains", [])}
    catalog_domains = {d["domain_id"]: d for d in catalog.get("domains", [])}
    meta_domains = metadata
    source_rows = []
    for path in ROLE_FILES:
        for row in rows_from(path):
            try:
                n = int(str(row.get("domain_id", "D000"))[1:])
            except ValueError:
                continue
            if not (57 <= n <= 112) or row.get("student_path_status") == "excluded":
                continue
            source_rows.append((path, row))
    seen = set()
    reviewed = []
    for path, row in source_rows:
        key = role_key(row)
        if key in seen:
            continue
        seen.add(key)
        did = row["domain_id"]
        dm = meta_domains.get(did, {})
        domain_scope = dm.get("description", "")
        step_domain = step_domains.get(did, {})
        raw_areas = step_domain.get("recommended_areas") or []
        if isinstance(raw_areas, dict):
            raw_areas = raw_areas.get("areas") or []
        role_text = row.get("description", "")
        role_tokens = tokens(role_text)
        scored = []
        for area in raw_areas:
            label = area.get("label") or ""
            boundary = area.get("boundary") or ""
            overlap = sorted(role_tokens & tokens(label + " " + boundary))
            scored.append({"area_key": area.get("area_key"), "label": label,
                           "boundary": boundary, "text_overlap_terms": overlap,
                           "text_overlap_is_fit_evidence": False,
                           "source_ids": area.get("source_ids", []),
                           "source_urls": area.get("source_urls", [])})
        scored.sort(key=lambda a: len(a["text_overlap_terms"]), reverse=True)
        p = parent_decisions.get(key, {})
        after = p.get("after", {})
        parent_status = (after.get("domain_fit_review_status")
                         or row.get("domain_fit_review_status")
                         or "review_required")
        parent_reason = (after.get("domain_fit_review_basis")
                         or row.get("domain_fit_review_basis")
                         or "No exact source-backed parent-domain disposition is stored on this active role row.")
        parent_refs = (after.get("domain_fit_review_source_refs")
                       or row.get("domain_fit_review_source_refs") or [])
        if isinstance(parent_refs, str):
            parent_refs = [parent_refs]
        source_code = row.get("esco_code") or row.get("isco_group")
        area_status = "review_required" if scored else "direct_domain_role_candidate_requires_review"
        area_key = None
        area_rationale = "No independent task-to-recommended-area adjudication is yet recorded for this role. Candidate text overlap is a navigation aid only, not fit proof. Current subgroup/ISCO/ESCO membership was not used."
        area_source_ids = []
        area_source_urls = []
        manual_decision = MANUAL_AREA_DECISIONS.get(key)
        if manual_decision:
            area_status, area_key, area_rationale = manual_decision
            area_row = next((a for a in step_domain.get("recommended_areas", {}).get("areas", [])
                             if a.get("area_key") == area_key), None) if area_key else None
            if area_row:
                area_source_ids = area_row.get("source_ids", [])
                area_source_urls = area_row.get("source_urls", [])
        reviewed.append({
            "role_key": key,
            "domain_id": did,
            "role_title": row.get("role_name"),
            "role_source_file": str(path.relative_to(ROOT)).replace("\\", "/"),
            "role_task_evidence": role_text,
            "role_task_source": {
                "source_system": row.get("source"),
                "source_code": source_code,
                "source_id": f"{str(row.get('source') or 'unknown').upper()}:{source_code or key}",
                "source_urls": parent_refs,
                "locator": "Role description field in the cited occupational record; task wording shown verbatim from the checked-in source-backed role record.",
                "limitation": "The role record's source identifier/code is not by itself proof of parent-domain or area fit; the cited role task text must be checked against each boundary.",
            },
            "parent_domain_boundary": domain_scope,
            "parent_domain_fit": {"status": parent_status,
                                  "rationale": parent_reason,
                                  "source_urls": parent_refs,
                                  "source_status_origin": "existing exact role-domain review or stored review fields"},
            "recommended_area_candidates": scored,
            "area_fit": {
                "status": area_status,
                "area_key": area_key,
                "rationale": area_rationale,
                "area_evidence_source_ids": area_source_ids,
                "area_evidence_source_urls": area_source_urls,
                "alias_target_role_key": ALIAS_TARGETS.get(key),
            },
            "canonical_files_edited": False,
        })
    context = read(CONTEXT)
    context_by_key = {(r["domain_id"], r["global_area_label"]): r for r in context.get("records", [])}
    expected = {(d["domain_id"], a["label"]) for d in catalog.get("domains", [])
                if 57 <= int(d["domain_id"][1:]) <= 112 for a in d.get("areas", [])}
    context_covered = len(expected & set(context_by_key))
    counts = Counter(r["parent_domain_fit"]["status"] for r in reviewed)
    area_status_counts = Counter(r["area_fit"]["status"] for r in reviewed)
    area_count = sum(len(catalog_domains.get(did, {}).get("areas", [])) for did in catalog_domains
                     if 57 <= int(did[1:]) <= 112)
    payload = {
        "schema_version": "2026-10-07.d057-d112.existing-role-area-fit-review.v1",
        "lane": "D057-D112",
        "status": "inventory_complete_fit_adjudication_in_progress",
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "counts": {"active_role_records": len(reviewed), "unique_role_keys": len(seen),
                   "domains_with_roles": len({r["domain_id"] for r in reviewed}),
                   "normalized_area_records": area_count,
                   "parent_fit_statuses_from_existing_domain_review": dict(counts),
                   "area_fit_statuses": dict(area_status_counts),
                   "area_fit_review_required": area_status_counts["review_required"],
                   "direct_domain_role_candidates": area_status_counts["direct_domain_role"],
                   "role_records_adjudicated_in_this_batch": sum(r["area_fit"]["status"] != "review_required" for r in reviewed),
                   "nigerian_context_expected_area_records": len(expected),
                   "nigerian_context_records_found_in_prior_ledger": context_covered},
        "policy": {"parent_fit_separate_from_area_fit": True,
                   "isco_esco_membership_used_as_fit_evidence": False,
                   "title_alone_used_as_fit_evidence": False,
                   "text_overlap_is_only_navigation": True,
                   "nigerian_context_separate_from_global_area_definition": True,
                   "canonical_files_edited": False},
        "context_ledger": {"path": str(CONTEXT.relative_to(ROOT)).replace("\\", "/"),
                           "prior_disposition_counts": context.get("disposition_counts", {}),
                           "coverage_exactly_matches_catalog": context_covered == len(expected),
                           "note": "Previously generated full-lane evidence ledger; it is revalidated separately, not regenerated or copied into canonical taxonomy."},
        "roles": reviewed,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    checkpoint = {"schema_version": "2026-10-07.d057-d112.existing-role-area-fit-checkpoint.v1",
                  "lane": "D057-D112", "status": "in_progress",
                  "counts": payload["counts"], "next_cursor": "first role in role_library_v3_cleaned order without independently adjudicated recommended-area fit",
                  "canonical_files_edited": False, "review_artifact": str(OUT.relative_to(ROOT)).replace("\\", "/")}
    CHECKPOINT.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# D057–D112 existing-role area-fit checkpoint — 2026-10-07\n\n"
        f"Enumerated {len(reviewed)} active role records across {len({r['domain_id'] for r in reviewed})} domains and {area_count} normalized recommended areas.\n\n"
        f"Parent-fit statuses carried from the exact role-domain review: {dict(counts)}. Area-fit statuses: {dict(area_status_counts)}. Area decisions still requiring independent task-to-boundary adjudication: {payload['counts']['area_fit_review_required']}.\n\n"
        f"Prior Nigerian context ledger coverage: {context_covered}/{len(expected)} catalog area records. Canonical files were not edited.\n\n"
        "Text overlap is only a search aid, not a fit decision. Continue from the first unadjudicated role record.\n",
        encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))

if __name__ == "__main__":
    main()
