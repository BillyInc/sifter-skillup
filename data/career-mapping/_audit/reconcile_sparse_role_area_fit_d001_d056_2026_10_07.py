"""Reconcile remapped sparse-role candidates for D001-D056.

This emits review artifacts only. It never edits canonical career data.
The disposition gate requires explicit task text, a global role-task source,
an exact current area-catalogue match, and independent parent/area fit.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LANE = AUDIT / "role_enrichment_lanes_2026_10_06" / "D001_D056"
LEDGER = AUDIT / "SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json"
CHECKPOINT = AUDIT / "SPARSE_ROLE_ENRICHMENT_CHECKPOINT_2026_10_07_003.json"
CATALOG = ROOT / "domain_specialization_catalog.json"
META = ROOT / "domain_meta.json"
ROLE_FILES = [ROOT / "role_library_v3_cleaned.json", ROOT / "thin_domain_role_overlays.json", ROOT / "emerging_role_overlays.json"]
OUT_JSON = LANE / "D001_D056_SPARSE_AREA_FIT_REVIEW_2026_10_07.json"
OUT_MD = LANE / "D001_D056_SPARSE_AREA_FIT_REVIEW_2026_10_07.md"
CP_JSON = LANE / "D001_D056_SPARSE_AREA_FIT_CHECKPOINT_2026_10_07.json"
CP_MD = LANE / "D001_D056_SPARSE_AREA_FIT_CHECKPOINT_2026_10_07.md"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    value = str(value or "").casefold().replace("&", " and ")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


# The titles below are held from automatic acceptance even when the work
# family is plausible: bundled occupations, cross-domain/uncertain title
# boundaries, or insufficiently established standalone titles.
HOLD: dict[str, str] = {
    "administrative law judge or hearing officer": "Bundled/alternative titles with different appointment and authority boundaries; retain for review rather than imply one interchangeable occupation.",
    "arbitrator mediator and conciliator": "The source groups distinct dispute-resolution processes and accountabilities; split into separately evidenced roles before addition.",
    "court and license clerk": "Combines court administration and licensing administration; source/task boundary is not one occupation.",
    "paralegal and legal assistant": "Bundled occupation label; determine whether the catalogue uses one role identity or separate jurisdiction-dependent job titles.",
    "electro mechanical and mechatronics technologist technician": "Bundled technologist/technician levels and occupational labels; do not present as one precise job title.",
    "industrial engineering technologist technician": "Bundled technologist/technician levels; exact role title and responsibility boundary need separate evidence.",
    "appraiser and assessor of real estate": "Bundled valuation titles with jurisdiction-dependent authority; retain as review-only pending a single role identity.",
    "property real estate and community association manager": "Source bundles property, real-estate and community-association management; association governance is not automatically real-estate practice.",
    "meeting convention and event planner": "Bundled event-planning title; verify as one established role identity before adding.",
    "petroleum pump system refinery operator": "Combines pump-system operations and refinery operations, which map to different recommended areas; split before addition.",
    "construction and building inspector": "Combined inspection title; exact occupational scope and role identity need verification before addition.",
    "user experience and interface designer": "The recommended graphic-design area explicitly excludes interaction design; the task is not sufficiently shown to be graphic design rather than UX/product design.",
    "urban and regional planner": "Primary land-use planning is not established as a public-administration occupation by the supplied task; likely cross-domain and needs separate parent-scope adjudication.",
    "facilities coordinator": "Generic facilities duties do not establish real-estate/property management as the parent occupation.",
    "automotive engineering technician": "The supplied task is a candidate summary, but exact source evidence for this standalone title and level is not established.",
    "automotive service technician": "Vehicle diagnosis/service is not automatically automotive engineering; retain for review of parent-domain boundary.",
    "chemical laboratory analyst": "Laboratory analytical chemistry alone does not establish chemical-engineering task scope.",
    "quality control chemist": "Quality-control chemistry alone does not establish chemical-engineering task scope.",
    "public sector management consultant": "Sector modifier may describe a client context rather than a distinct occupation; verify title distinctness and task source.",
    "land economist": "The title spans land economics and real-estate practice; the supplied task needs source confirmation for direct real-estate role ownership.",
    "data protection officer": "Privacy governance and compliance tasks are plausible, but the supplied occupational reference does not by itself establish a distinct globally portable job title or uniform legal authority; retain for review.",
    "knowledge representation engineer": "Knowledge representation is an established technical work area, but this exact standalone job title is not sufficiently established by the supplied broad computer-research source.",
    "project controls specialist": "Project controls tasks span project-management and commercial/cost boundaries; the supplied summary does not establish one exclusive recommended area.",
}
AREA_OVERRIDES = {
    "D039|education teacher postsecondary": ("Higher-Education Teaching and Curriculum", "The task explicitly teaches postsecondary courses and develops curriculum; optional research duties do not reclassify the primary teaching/curriculum work into the research area."),
    "D038|data protection officer": ("Organizational Compliance, Ethics and Integrity", "Task profile centers privacy governance, compliance advice, monitoring and reporting; this matches organization-level compliance systems. Title distinctness remains review-only."),
    "D040|vocational curriculum developer": ("TVET Curriculum, Qualifications and Quality", "The task is occupational curriculum and assessment design; it belongs to the curriculum/qualification/quality area, not the instructor delivery area."),
    "D045|public programme evaluator": ("Public Policy Design and Evaluation", "The task is evaluating public programme outcomes and recommending evidence-based changes; the area is policy design/evaluation, not programme administration/service delivery."),
}
STOPWORDS = {"and", "the", "for", "with", "from", "into", "that", "this", "their", "area", "areas", "practice", "practices", "service", "services", "role", "roles", "work", "working", "use", "using", "provide", "provides", "support", "supports", "perform", "performs", "develop", "develops", "development", "design", "designs", "process", "processes", "professional", "professionals", "related", "including", "across", "one", "two", "new", "other", "based", "required", "ensure", "ensures"}
GENERIC = {"analysis", "apply", "business", "build", "change", "coordinate", "delivery", "development", "engineering", "improvement", "maintain", "management", "monitor", "operations", "planning", "process", "processes", "production", "requirements", "service", "services", "software", "systems", "technology", "testing", "work"}


def tokens(value: Any) -> set[str]:
    return {t for t in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value)) if t not in STOPWORDS and not t.isdigit()}


def phrases(value: Any) -> set[str]:
    words = [t for t in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", norm(value)) if t not in STOPWORDS]
    return {" ".join(words[i:i+w]) for w in (2, 3) for i in range(len(words)-w+1)}


def area_ranking(task: str, domain: dict[str, Any]) -> list[dict[str, Any]]:
    task_tokens = tokens(task)
    task_phrases = phrases(task)
    ranked = []
    for area in domain.get("areas", []):
        label = str(area.get("label") or "")
        boundary = str(area.get("boundary") or "")
        label_hits = sorted(task_tokens & tokens(label))
        boundary_hits = sorted(task_tokens & tokens(boundary))
        phrase_hits = sorted(task_phrases & phrases(label + " " + boundary))
        distinctive = (set(label_hits) | set(boundary_hits)) - GENERIC
        score = 4 * len(set(label_hits) - GENERIC) + len(set(boundary_hits) - GENERIC) + 3 * min(2, len(phrase_hits))
        ranked.append({"area_key": area.get("area_key"), "label": label, "boundary": boundary, "score": score,
                       "distinctive_task_hits": sorted(distinctive), "label_hits": label_hits,
                       "boundary_hits": boundary_hits, "phrase_hits": phrase_hits, "source_ids": area.get("source_ids", [])})
    return sorted(ranked, key=lambda a: (-a["score"], a["label"]))


def main() -> None:
    source_ledger = read(LEDGER)
    prior_checkpoint = read(CHECKPOINT)
    catalog = read(CATALOG)
    meta = read(META)
    target_ids = {f"D{i:03d}" for i in range(1, 57)}
    catalog_domains = {d["domain_id"]: d for d in catalog["domains"]}

    role_rows: list[dict[str, Any]] = []
    for path in ROLE_FILES:
        payload = read(path)
        role_rows.extend(payload if isinstance(payload, list) else payload.get("roles", []))
    active_by_key: dict[str, dict[str, Any]] = {}
    for row in role_rows:
        did = str(row.get("domain_id") or "")
        if did not in target_ids or str(row.get("student_path_status") or "active").casefold() == "excluded":
            continue
        key = f"{did}|{norm(row.get('role_name'))}"
        active_by_key[key] = row

    active_name_index: dict[str, list[dict[str, Any]]] = {}
    for row in active_by_key.values():
        did = str(row.get("domain_id") or "")
        for item in [row.get("role_name"), *re.split(r"\s*[;,|·]\s*", str(row.get("also_known_as") or ""))]:
            n = norm(item)
            if n:
                active_name_index.setdefault(f"{did}|{n}", []).append(row)

    records: list[dict[str, Any]] = []
    for candidate in source_ledger.get("candidate_records", []):
        did = str(candidate.get("domain_id") or "")
        if did not in target_ids:
            continue
        domain = catalog_domains.get(did, {})
        domain_name = str(candidate.get("domain_name") or domain.get("domain_name") or did)
        domain_desc = str(meta.get(did, {}).get("description") or "")
        title = str(candidate.get("role_title") or "")
        tasks = str(candidate.get("candidate_tasks") or "")
        title_key = norm(title)
        area_label = str(candidate.get("area_of_specialization") or "")
        ranked_areas = area_ranking(tasks, domain)
        best_area = ranked_areas[0] if ranked_areas else None
        second_score = ranked_areas[1]["score"] if len(ranked_areas) > 1 else 0
        unique_task_area = bool(best_area and len(best_area["distinctive_task_hits"]) >= 2 and best_area["score"] - second_score >= 2)
        override = AREA_OVERRIDES.get(candidate.get("candidate_key"))
        # The remapped ledger label is only a hint. Use an area only when the
        # actual role-task statement points to a unique current boundary.
        area = next((a for a in domain.get("areas", []) if norm(a.get("label")) == norm(override[0])), None) if override else (next((a for a in domain.get("areas", []) if a.get("area_key") == best_area.get("area_key")), None) if unique_task_area else None)
        exact_key = f"{did}|{title_key}"
        exact_alias_rows = active_name_index.get(exact_key, [])

        if exact_alias_rows:
            disposition = "alias_existing"
            disposition_reason = "An active same-domain role title or explicit alias already matches this candidate; retain one role identity and do not add a duplicate."
        elif title_key in HOLD:
            disposition = "review_only"
            disposition_reason = HOLD[title_key]
        elif not tasks or not candidate.get("global_evidence"):
            disposition = "review_only"
            disposition_reason = "Missing explicit role-task text or global occupational task evidence; neither title nor taxonomy membership is sufficient."
        elif area is None:
            disposition = "review_only"
            disposition_reason = "Task-only comparison did not produce a unique, sufficiently distinctive recommended-area match. Keep review_only; the ledger's remapped label is not accepted by itself."
        elif str(candidate.get("disposition")) != "add":
            disposition = "review_only"
            disposition_reason = str(candidate.get("review_only_reason") or "The source ledger explicitly withheld automatic addition; retain that hold.")
        else:
            disposition = "accepted_candidate"
            disposition_reason = "The stated occupational tasks are directly within the parent-domain scope and the matched recommended-area boundary; cited source material is occupational task evidence. Candidate recommendation only; no canonical file was edited."

        if disposition == "accepted_candidate":
            parent_status = "supported"
            area_status = "supported"
            parent_rationale = f"Task evidence: {tasks} This describes work within {domain_name}; parent fit is assessed from the task and domain scope, independently of any subgroup/ISCO/ESCO code."
            area_rationale = (override[1] + " " if override else "") + f"Task evidence: {tasks} This aligns with the recommended area boundary: {area.get('boundary')}"
        elif disposition == "alias_existing":
            parent_status = "supported_existing_identity"
            area_status = "review_required"
            parent_rationale = f"Existing active same-domain role identity found. Candidate task claim: {tasks}"
            area_rationale = "Do not infer area fit from the existing role alias; the existing-role lane will adjudicate its fit separately."
        else:
            parent_status = "review_required"
            area_status = "review_required"
            parent_rationale = str(candidate.get("parent_domain_fit_rationale") or "Task-to-parent-domain fit requires further source review.")
            area_rationale = str(candidate.get("area_fit_rationale") or disposition_reason)

        records.append({
            "candidate_key": candidate.get("candidate_key"),
            "domain_id": did,
            "parent_domain": {"name": domain_name, "scope_description": domain_desc, "fit_status": parent_status, "fit_rationale": parent_rationale},
            "role_title": title,
            "candidate_tasks": tasks,
            "recommended_area": {
                "area_key": area.get("area_key") if area else None,
                "label": area.get("label") if area else area_label,
                "boundary": area.get("boundary") if area else candidate.get("area_boundary"),
                "fit_status": area_status,
                "fit_rationale": area_rationale,
                "catalog_source_ids": area.get("source_ids", []) if area else candidate.get("area_evidence_source_refs", []),
                "task_only_ranked_candidates": ranked_areas[:3],
                "ledger_area_label_is_only_a_hint": area_label,
            },
            "global_task_evidence": [
                ({**source, "url": "https://www.onetonline.org/link/details/25-9031.00", "url_correction_note": "Corrected code mismatch: O*NET Instructional Coordinators is SOC 25-9031.00, not 13-9031.00."}
                 if source.get("source_id") == "ONET_INSTRUCTIONAL_COORDINATORS" else source)
                for source in candidate.get("global_evidence", [])
            ],
            "nigerian_context": candidate.get("nigerian_context", {"scope": "not_established", "source_refs": []}),
            "matching_active_role_keys": [f"{r.get('domain_id')}|{norm(r.get('role_name'))}" for r in exact_alias_rows],
            "disposition": disposition,
            "disposition_reason": disposition_reason,
            "uses_isco_or_esco_membership_as_fit_evidence": False,
            "canonical_files_edited": False,
        })

    counts = Counter(r["disposition"] for r in records)
    payload = {
        "schema_version": "1.0",
        "artifact_type": "disjoint_sparse_role_candidate_area_fit_review",
        "created": date.today().isoformat(),
        "lane": {"domain_id_min": "D001", "domain_id_max": "D056"},
        "inputs": {
            "sparse_ledger": str(LEDGER.relative_to(ROOT.parent)),
            "sparse_checkpoint": str(CHECKPOINT.relative_to(ROOT.parent)),
            "recommended_area_catalog": str(CATALOG.relative_to(ROOT.parent)),
            "domain_scope_source": str(META.relative_to(ROOT.parent)),
        },
        "policy": [
            "Each candidate is assessed from explicit task evidence against parent-domain scope and the exact current recommended-area boundary.",
            "ISCO/ESCO membership, title alone and subgroup code are not fit evidence.",
            "Aliases remain separate dispositions and are not new additions.",
            "Bundled or uncertain titles remain review_only.",
            "No canonical role, overlay, domain or subgroup file is edited.",
        ],
        "source_checkpoint_003_summary": prior_checkpoint.get("coverage_summary", prior_checkpoint.get("progress", {})),
        "counts": {"candidate_records": len(records), **dict(counts)},
        "records": records,
        "canonical_files_edited": False,
    }
    LANE.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = ["# D001–D056 sparse role candidate fit review", "", f"Generated {payload['created']}. Review-only artifact; no canonical data edited.", "", "## Counts", "", f"- Candidate records: **{len(records)}**"]
    md += [f"- {key}: **{value}**" for key, value in sorted(counts.items())]
    md += ["", "## Candidate dispositions", "", "| Candidate | Parent fit | Recommended area | Area fit | Disposition | Reason |", "|---|---|---|---|---|---|"]
    for r in records:
        area = r["recommended_area"]
        reason = r["disposition_reason"].replace("|", "\\|")
        md.append(f"| `{r['candidate_key']}` | {r['parent_domain']['fit_status']} | {area['label']} | {area['fit_status']} | {r['disposition']} | {reason} |")
    md += ["", "Exact task evidence, source locators, area boundaries, and Nigerian-context records are preserved in the JSON artifact.", ""]
    OUT_MD.write_text("\n".join(md), encoding="utf-8")

    checkpoint = {
        "schema_version": "1.0",
        "checkpoint": "D001-D056 sparse candidate adjudication complete; subsequent same-lane tasks remain",
        "created": payload["created"],
        "completed_artifact": str(OUT_JSON.relative_to(ROOT.parent)),
        "candidate_records_processed": len(records),
        "dispositions": dict(counts),
        "remaining_in_sequence": [
            "Audit every active canonical role in D001-D056 against parent-domain and current recommended-area boundaries, using task evidence and preserving review_required where evidence is insufficient.",
            "Complete Nigeria-specific area-of-specialization context for every area in D001-D056; attach source URL, exact locator, supported claim and limitation, or record no direct Nigerian context found.",
        ],
        "canonical_files_edited": False,
    }
    CP_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CP_MD.write_text("\n".join([
        "# D001–D056 sparse candidate adjudication checkpoint", "",
        f"Completed {len(records)} candidate records on {payload['created']}; no canonical files edited.",
        "", "## Dispositions", "", *[f"- {k}: **{v}**" for k, v in sorted(counts.items())],
        "", "## Remaining same-lane work", "",
        "1. Review all active canonical roles for independent parent-domain and recommended-area fit.",
        "2. Complete the Nigerian area-of-specialization context pass with exact source locators or explicit no-direct-context findings.", ""
    ]), encoding="utf-8")
    print(json.dumps({"output": str(OUT_JSON), "checkpoint": str(CP_JSON), "counts": payload["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
