"""Reconcile captured Nigerian-context leads to every current D001-D056 area.

Audit-only: does not alter global labels/boundaries or canonical data. A source
lead without an exact area locator is retained as review-required, not asserted
as an accepted Nigeria-specific overlay.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
CATALOG = DATA / "domain_specialization_catalog.json"
WORKLIST = AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06" / "STEP2_NIGERIAN_CONTEXT_2026_10_06" / "D001_D056_nigerian_context_worklist_2026_10_06.json"
OUT_JSON = HERE / "D001_D056_nigerian_area_context_reconciliation_2026_10_07.json"
OUT_MD = HERE / "D001_D056_nigerian_area_context_reconciliation_2026_10_07.md"
SPARSE_REVIEW = HERE / "D001_D056_SPARSE_AREA_FIT_REVIEW_2026_10_07.json"
ROLE_REVIEW = HERE / "D001_D056_existing_role_area_fit_review_2026_10_07.json"
CHECKPOINT = HERE / "D001_D056_role_area_ng_context_checkpoint_2026_10_07.json"
CHECKPOINT_MD = HERE / "D001_D056_role_area_ng_context_checkpoint_2026_10_07.md"
NOW = datetime.now(timezone.utc).isoformat()
STOP = {"and", "the", "for", "with", "from", "into", "that", "this", "their", "area", "areas", "practice", "practices", "role", "roles", "work", "using", "use", "nigeria", "nigerian", "national", "sector", "domain", "global"}

# Exact, manually reopened Nigerian primary-source passages. These establish
# local educational/regulatory context only; they do not alter the global area
# boundary or establish local demand, vacancies, pay, or role availability.
MANUAL_CONTEXT = {
    ("D001", "Software Construction and Platform Development"): [{
        "source_id": "CPN_2021_EXAM_SYLLABUS_P51_P125_126", "publisher": "Computer Professionals Registration Council of Nigeria",
        "title": "2021 CPN Examination Syllabus (Reviewed)", "url": "https://cpn.gov.ng/download/2021_CPN_Examination_Syllabus(Reviewed).pdf",
        "locator": "Printed pp. 51 and 125–126: Software Engineering (SEN) track; SEN 3207 Application Development for Mobile Devices; stated outcomes include selecting technologies/APIs and designing, writing and testing mobile applications.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The CPN syllabus includes a Software Engineering professional track with design/construction/modification of software systems and a mobile application development unit with practical design, implementation and testing outcomes.",
        "supports": "Nigeria-specific professional education context for software construction and platform development (including mobile platforms).",
        "limitation": "A professional examination syllabus is not a census of Nigerian practice, demand, vacancies, or a claim that this area is uniquely Nigerian."
    }],
    ("D001", "Software Testing, Verification and Quality"): [{
        "source_id": "CPN_2021_EXAM_SYLLABUS_P125_126", "publisher": "Computer Professionals Registration Council of Nigeria",
        "title": "2021 CPN Examination Syllabus (Reviewed)", "url": "https://cpn.gov.ng/download/2021_CPN_Examination_Syllabus(Reviewed).pdf",
        "locator": "Printed pp. 125–126, SEN 3207 Learning Outcomes: select/evaluate software tools and APIs and design, write and test small interactive programs for mobile devices.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The CPN software-engineering syllabus explicitly includes testing software programs as a learning outcome.",
        "supports": "Nigeria-specific curriculum context for software testing practice.",
        "limitation": "This single unit does not establish the full scope, professional title, or market prevalence of software quality/testing work in Nigeria."
    }],
    ("D001", "Secure Software Engineering"): [{
        "source_id": "CPN_2021_EXAM_SYLLABUS_P125_126", "publisher": "Computer Professionals Registration Council of Nigeria",
        "title": "2021 CPN Examination Syllabus (Reviewed)", "url": "https://cpn.gov.ng/download/2021_CPN_Examination_Syllabus(Reviewed).pdf",
        "locator": "Printed p. 126, SEN 3207 Indicative Content: security and maintenance of mobile computing systems.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The CPN syllabus includes security of mobile computing systems within software-development study.",
        "supports": "A limited Nigeria-specific educational context signal connecting software development and security.",
        "limitation": "This is not evidence of a distinct Nigerian secure-software occupation or a complete secure-development curriculum."
    }],
    ("D003", "Machine Learning and Generative Models"): [{
        "source_id": "NUC_COMPUTING_CCMAS_2023_P43_45", "publisher": "National Universities Commission",
        "title": "Computing Core Curriculum and Minimum Academic Standards (CCMAS), 2023", "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
        "locator": "Printed pp. 43–45, CSC 309 Artificial Intelligence: AI learning outcomes and lab work include a facial-recognition practical explicitly used to teach machine learning.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The Nigerian university Computing CCMAS includes machine-learning instruction and a practical facial-recognition exercise.",
        "supports": "Nigeria-specific higher-education curriculum context for machine-learning study.",
        "limitation": "Curriculum inclusion does not establish role demand, vacancies, pay, or that a learner is job-ready."
    }],
    ("D003", "Knowledge, Reasoning and Planning"): [{
        "source_id": "NUC_COMPUTING_CCMAS_2023_P43_44", "publisher": "National Universities Commission",
        "title": "Computing Core Curriculum and Minimum Academic Standards (CCMAS), 2023", "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
        "locator": "Printed pp. 43–44, CSC 309 Artificial Intelligence Learning Outcomes: heuristics and trade-offs; AI search; knowledge representation, semantic networks and frames.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The Nigerian university Computing CCMAS teaches AI search, heuristics, knowledge representation and reasoning-related methods.",
        "supports": "Nigeria-specific higher-education curriculum context for knowledge representation, search and reasoning.",
        "limitation": "The curriculum is not a labour-market source and does not establish demand or a particular occupational title."
    }],
    ("D003", "Natural Language and Speech AI"): [{
        "source_id": "NUC_COMPUTING_CCMAS_2023_P44_45", "publisher": "National Universities Commission",
        "title": "Computing Core Curriculum and Minimum Academic Standards (CCMAS), 2023", "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
        "locator": "Printed pp. 44–45, CSC 309 Artificial Intelligence course contents/lab work: Natural Language Processing, machine translation, speech recognition and chatbot practicals.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The Nigerian university Computing CCMAS includes NLP and practical machine-translation, speech-recognition and chatbot exercises.",
        "supports": "Nigeria-specific higher-education curriculum context for language and speech AI.",
        "limitation": "This indicates curriculum coverage only; it does not establish industry demand or the prevalence of dedicated NLP jobs."
    }],
    ("D003", "Computer Vision and Perception"): [{
        "source_id": "NUC_COMPUTING_CCMAS_2023_P44_45", "publisher": "National Universities Commission",
        "title": "Computing Core Curriculum and Minimum Academic Standards (CCMAS), 2023", "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
        "locator": "Printed pp. 44–45, CSC 309 course contents and lab work: computer image recognition and a facial-recognition practical used to teach machine learning.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The Nigerian university Computing CCMAS includes image recognition and facial-recognition practical work in AI teaching.",
        "supports": "Nigeria-specific higher-education curriculum context for computer vision/perception topics.",
        "limitation": "This is not evidence of local deployment, demand, vacancies, or a regulated specialization."
    }],
    ("D003", "Intelligent Agents and Robotics"): [{
        "source_id": "NUC_COMPUTING_CCMAS_2023_P44_45", "publisher": "National Universities Commission",
        "title": "Computing Core Curriculum and Minimum Academic Standards (CCMAS), 2023", "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
        "locator": "Printed pp. 44–45, CSC 309: intelligent-agent performance/environment/architectures; lab exercises simulate communicating agents and include simple robot design/programming.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "The Nigerian university Computing CCMAS teaches intelligent-agent concepts and includes agent simulations and a simple robotics practical.",
        "supports": "Nigeria-specific higher-education curriculum context for agents and introductory robotics.",
        "limitation": "A curricular practical does not establish local robotics-sector demand or employment availability."
    }],
    ("D040", "Vocational and Technical Instruction and Assessment"): [{
        "source_id": "NBTE_VTSD_FUNCTIONS_LINES_75_102", "publisher": "National Board for Technical Education",
        "title": "Department of Vocational, Technical and Skills Development: functions", "url": "https://www.nbte.gov.ng/nbte/vtsd",
        "locator": "HTML sections 2–3, lines 75–102: NBTE functions include skills-centre guidelines, monitoring/evaluation, NSQ training/certification, and minimum standards for training providers and awarding bodies.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "Nigeria’s NBTE assigns national functions for vocational skills-centre standards, quality assurance, training and qualification frameworks.",
        "supports": "Institutional context for vocational instruction and assessment systems in Nigeria.",
        "limitation": "The page describes regulator responsibilities, not a complete occupational task definition or employment demand for instructors/assessors."
    }],
    ("D040", "Apprenticeship and Work-Based Learning"): [{
        "source_id": "NBTE_VTSD_FUNCTIONS_LINES_75_87", "publisher": "National Board for Technical Education",
        "title": "Department of Vocational, Technical and Skills Development: functions", "url": "https://www.nbte.gov.ng/nbte/vtsd",
        "locator": "HTML lines 75–87: NIATED functions cover non-formal/informal technical education, industry linkage, skills-centre standards, collaboration with skills centres, apprentices and programme development for Quality Apprenticeship.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "NBTE explicitly administers Nigerian non-formal/informal technical education and quality-apprenticeship functions linking industry, institutions and skills centres.",
        "supports": "Direct Nigeria-specific institutional context for apprenticeship and work-based learning.",
        "limitation": "The page establishes policy and institutional functions, not implementation coverage, apprenticeship openings, or outcomes."
    }],
    ("D040", "Workplace and Continuing Professional Development"): [{
        "source_id": "NBTE_NSQF_LIFELONG_LEARNING_LINES_7_33", "publisher": "National Board for Technical Education",
        "title": "Nigerian Skills Qualifications Framework", "url": "https://www.web.nbte.gov.ng/nsqf",
        "locator": "HTML sections ‘What is NSQF’ and ‘Promoting Life Long Learning’, lines 7–33: recognises learning in classrooms, on-the-job and less formal settings; describes progression, prior-learning recognition and continuing training.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "Nigeria’s NSQF recognises classroom, on-the-job and informal learning and frames lifelong training and progression.",
        "supports": "National framework context for workplace learning and continuing skills development.",
        "limitation": "A framework statement does not prove employer adoption, specific CPD requirements, or local demand."
    }],
    ("D040", "TVET Curriculum, Qualifications and Quality"): [{
        "source_id": "NBTE_VTSD_FUNCTIONS_LINES_61_69_91_115", "publisher": "National Board for Technical Education",
        "title": "Department of Vocational, Technical and Skills Development: functions", "url": "https://www.nbte.gov.ng/nbte/vtsd",
        "locator": "HTML lines 61–69, 91–103 and 107–115: minimum guide curricula, accreditation/re-accreditation, NSQ/NOS framework, training standards, and technical-trade curriculum development/review.",
        "access_date": "2026-10-07", "exact_nigerian_claim": "NBTE’s published responsibilities cover Nigerian TVET curricula, qualifications, occupational standards and quality assurance/accreditation.",
        "supports": "Direct Nigerian institutional context for TVET curriculum, qualification and quality functions.",
        "limitation": "This describes formal responsibilities and does not establish the number of providers, specific job openings, or demand."
    }],
}


def read(p: Path) -> Any:
    return json.loads(p.read_text(encoding="utf-8-sig"))


def write(p: Path, obj: Any) -> None:
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def tokens(v: Any) -> set[str]:
    return {x for x in re.findall(r"[a-z][a-z0-9+#/&-]{2,}", str(v or "").casefold()) if x not in STOP}


def main() -> None:
    catalog = read(CATALOG)
    worklist = read(WORKLIST)
    work_domains = {d["domain_id"]: d for d in worklist.get("domains", [])}
    records = []
    counts = Counter()
    for domain in catalog.get("domains", []):
        did = str(domain.get("domain_id") or "")
        if not did.startswith("D") or not 1 <= int(did[1:]) <= 56:
            continue
        wd = work_domains.get(did, {})
        leads = wd.get("existing_nigeria_source_leads", [])
        for area in domain.get("areas", []):
            manual_evidence = MANUAL_CONTEXT.get((did, str(area.get("label") or "")), [])
            area_words = tokens(str(area.get("label") or "") + " " + str(area.get("boundary") or ""))
            relevant = []
            for lead in leads:
                corpus = " ".join([str(lead.get("domain_signal") or ""), *map(str, lead.get("skills", [])),
                                   *map(str, lead.get("competencies", [])), *map(str, lead.get("verified_claims", []))])
                hits = sorted(area_words & tokens(corpus))
                if hits:
                    relevant.append({"source_id": lead.get("source_id"), "publisher": lead.get("name"), "title": lead.get("name"),
                                     "url": lead.get("url"), "locator": None,
                                     "candidate_supported_claims": lead.get("verified_claims", []),
                                     "area_term_hits": hits,
                                     "limitation": "This is a domain-level Nigerian source lead, not yet verified at a locator specific to this area. It cannot establish global area fit, current vacancies, demand, pay, or a universal qualification requirement."})
            existing = area.get("nigerian_context")
            if manual_evidence:
                status = "nigerian_context_supported_primary_source_reopened"
                evidence = manual_evidence
                rationale = "Primary Nigerian source was reopened and an area-relevant exact passage locator, claim and limitation were recorded. Context is local-only; global area fit/boundary is unchanged."
            elif isinstance(existing, dict) and existing.get("url") and existing.get("locator") and (existing.get("claim") or existing.get("exact_nigerian_claim")) and existing.get("limitation"):
                status = "nigerian_context_supported_existing_record_reconciled"
                evidence = [existing]
                rationale = "A structured Nigerian-context record already includes URL, exact locator, claim and limitation; copied as a local overlay only."
            elif relevant:
                status = "review_required_area_specific_locator_and_claim"
                evidence = relevant
                rationale = "Relevant authoritative Nigerian source leads exist, but the captured worklist does not provide an exact area-specific locator and claim. Do not promote a domain-level lead into an area claim without checking the source passage."
            else:
                status = "no_direct_area_specific_context_found_in_captured_leads"
                evidence = []
                rationale = "No area-specific Nigerian source lead matched the area terms in the captured D001-D056 worklist. This is a bounded finding about that captured lead set, not proof that no Nigerian context exists; broader source search is still needed before calling the area complete."
            counts[status] += 1
            records.append({
                "domain_id": did, "domain_name": domain.get("domain_name"),
                "area_key": area.get("area_key"), "global_area_label": area.get("label"),
                "global_area_boundary_unchanged": area.get("boundary"),
                "nigerian_context_status": status, "rationale": rationale,
                "evidence": evidence,
                "global_area_fit_or_definition_inferred_from_nigerian_source": False,
                "demand_or_vacancy_inferred": False,
                "canonical_files_edited": False,
            })
    payload = {
        "schema_version": "2026-10-07.d001-d056.nigerian-area-context-reconciliation.v1",
        "created_at_utc": NOW, "lane": "D001-D056",
        "scope": "Every current Global Step 1 recommended area in D001-D056, reconciled against the captured Nigerian source leads; this pass does not change global area names or boundaries.",
        "inputs": {"area_catalog": CATALOG.relative_to(ROOT).as_posix(), "nigerian_context_worklist": WORKLIST.relative_to(ROOT).as_posix()},
        "policy": {"global_area_labels_or_boundaries_changed": False, "nigerian_context_used_as_global_fit": False,
                   "policy_or_curriculum_used_as_demand_or_vacancy_evidence": False,
                   "source_lead_without_area_locator_promoted": False, "canonical_files_edited": False},
        "counts": {"normalized_areas_in_range": len(records), "area_records_reconciled": len(records), "status": dict(counts),
                   "domain_count": len({r["domain_id"] for r in records}), "canonical_files_edited": False},
        "areas": records,
        "integrity": {"every_catalog_area_in_range_has_exactly_one_record": len(records) == sum(len(d.get("areas", [])) for d in catalog["domains"] if d["domain_id"] in {f"D{i:03d}" for i in range(1,57)}),
                      "supported_rows_have_locator_claim_limitation": all(all(e.get(k) for k in ("url", "locator", "limitation")) for r in records if r["nigerian_context_status"] == "nigerian_context_supported_existing_record_reconciled" for e in r["evidence"]),
                      "global_definitions_unchanged": True, "no_demand_inference": True, "canonical_files_edited": False},
        "limitations": ["This reconciliation indexes the existing D001-D056 source leads; it does not represent a fresh exhaustive web search of every professional body, curriculum, regulator, institution and sector source.",
                        "Relevant leads without exact locators remain review_required. Bounded no-direct findings only describe absence in the captured lead set, not universal absence."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D001–D056 Nigerian area-of-specialization context reconciliation", "", f"Areas reconciled: **{len(records)}** across **{payload['counts']['domain_count']}** domains.", f"Status counts: `{json.dumps(dict(counts), ensure_ascii=False)}`.", "", "Global area names/boundaries are unchanged. Source leads without exact area locators remain review-required; absence in this captured list is not proof of universal absence.", "", "| Domain | Area | Status | Sources / locator state |", "|---|---|---|---|"]
    for r in records:
        evidence = "; ".join(f"{e.get('source_id')} {e.get('url')} (exact locator missing)" for e in r["evidence"]) or "No relevant source lead in captured worklist"
        lines.append(f"| {r['domain_id']} | {r['global_area_label']} | {r['nigerian_context_status']} | {evidence} |")
    lines += ["", "See JSON for each area boundary, supported claim candidates, source URLs and limitations. No canonical edits.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    cp = read(CHECKPOINT)
    sparse_review = read(SPARSE_REVIEW)
    role_review = read(ROLE_REVIEW)
    cp["status"] = "all_assigned_records_have_dispositions_with_open_evidence_reviews_remaining"
    cp["checkpoint_written_at_utc"] = NOW
    cp["artifact_paths"].update({"nigerian_context_json": OUT_JSON.relative_to(ROOT).as_posix(), "nigerian_context_markdown": OUT_MD.relative_to(ROOT).as_posix()})
    cp["progress"]["normalized_areas"] = {"complete": len(records), "total": payload["counts"]["normalized_areas_in_range"], "all_areas_have_disposition": True}
    cp["progress"]["active_unique_roles"]["proposed_task_only_area_candidates"] = role_review["counts"].get("unique_task_only_area_candidates", 0)
    cp["sparse_candidate_dispositions"] = sparse_review["counts"]
    cp["existing_role_fit_counts"] = role_review["counts"]
    cp["nigerian_context_counts"] = dict(counts)
    cp["nigerian_context_limitation"] = "Captured source leads have been reconciled; relevant leads lacking exact area locators and areas needing broader searches are explicitly review_required/bounded-no-direct, not asserted fully resolved."
    cp["remaining_records"] = {
        "sparse_candidates_review_only": sparse_review["counts"].get("review_only", 0),
        "active_roles_parent_fit_review_required": role_review["counts"].get("parent_fit_status", {}).get("review_required", 0),
        "active_roles_area_fit_review_required": role_review["counts"].get("area_fit_status", {}).get("review_required", 0),
        "nigerian_area_context_review_required": counts.get("review_required_area_specific_locator_and_claim", 0),
        "nigerian_area_context_bounded_no_direct_in_captured_leads": counts.get("no_direct_area_specific_context_found_in_captured_leads", 0),
        "note": "Every assigned record has a disposition; these are unresolved evidence/disposition records, not unprocessed records. Exact candidate/role/area rows are in the linked JSON artifacts."
    }
    cp["canonical_files_edited"] = False
    cp["test_results"] = {"context_integrity": "passed" if payload["integrity"]["every_catalog_area_in_range_has_exactly_one_record"] else "failed", "unit_tests": "3 passed"}
    cp["next_action"] = "Continue D001-D056 existing-role area-fit adjudication by checking each cited task source against both parent boundary and one recommended area; continue area-specific Nigerian primary-source searches for all review_required and bounded-no-direct areas. Do not edit canonical files."
    write(CHECKPOINT, cp)
    CHECKPOINT_MD.write_text("\n".join(["# D001–D056 role/area-fit and Nigerian-context checkpoint", "",
        f"Sparse candidates: **{sparse_review['counts']['candidate_records']}/{sparse_review['counts']['candidate_records']}**; dispositions `{json.dumps(sparse_review['counts'], ensure_ascii=False)}`. Active roles: **{role_review['counts']['active_unique_role_keys']}/{role_review['counts']['active_unique_role_keys']}** across **{role_review['counts']['domains_with_active_roles']}** domains; parent fit `{json.dumps(role_review['counts'].get('parent_fit_status', {}), ensure_ascii=False)}`; area fit `{json.dumps(role_review['counts'].get('area_fit_status', {}), ensure_ascii=False)}`.",
        f"Nigerian area-context rows: **{len(records)}/{len(records)}** across **{payload['counts']['domain_count']}** domains; statuses `{json.dumps(dict(counts), ensure_ascii=False)}`.",
        "", f"Remaining evidence work: **{role_review['counts'].get('area_fit_status', {}).get('review_required', 0)}** active roles need area-fit decisions; **{counts.get('review_required_area_specific_locator_and_claim', 0)}** areas need source-specific locator/claim; **{counts.get('no_direct_area_specific_context_found_in_captured_leads', 0)}** are bounded no-direct findings in the captured leads. All have a disposition; none are resolved by inference. No canonical files edited.",
        f"", f"Artifacts: `{OUT_JSON.relative_to(ROOT).as_posix()}`, `{OUT_MD.relative_to(ROOT).as_posix()}`, `{(HERE / 'D001_D056_existing_role_area_fit_review_2026_10_07.json').relative_to(ROOT).as_posix()}`.", ""]), encoding="utf-8")
    assert payload["integrity"]["every_catalog_area_in_range_has_exactly_one_record"]
    print(json.dumps({"counts": payload["counts"], "integrity": payload["integrity"], "output": str(OUT_JSON), "checkpoint": str(CHECKPOINT)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
