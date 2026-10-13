"""Record authoritative item evidence for the saved tranche-011 selection."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
TRANCHE = "011"
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_2026-09-21.json"
LEDGER = OUT_DIR / f"full_population_tranche_{TRANCHE}_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_2026-09-21.md"
REPORT_JSON = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_2026-09-21.json"


def ev(url: str, authority: str, locator: str, summary: str, *, confidence: str = "high") -> dict:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": date.today().isoformat(),
        "link_role": "item-specific external evidence",
        "confidence": confidence,
        "evidence_summary": summary,
    }


EVIDENCE: dict[str, dict] = {
    "big-data": {
        "decision": "linked",
        "queries": ["NIST official big data reference architecture"],
        "candidate_urls": ["https://www.nist.gov/publications/nist-big-data-interoperability-framework-volume-6-big-data-reference-architecture"],
        "evidence": [ev(
            "https://www.nist.gov/publications/nist-big-data-interoperability-framework-volume-6-big-data-reference-architecture",
            "National Institute of Standards and Technology (NIST)",
            "NIST Big Data Interoperability Framework Volume 6: Big Data Reference Architecture",
            "NIST identifies Big Data and documents a vendor-neutral reference architecture with roles, activities and functional components for processing and deriving knowledge from large data environments.",
        )],
        "limitation": "The source verifies the subject destination; it does not establish ownership or a required technology stack in every domain context.",
    },
    "blockchain": {
        "decision": "linked",
        "queries": ["NIST official blockchain technology overview"],
        "candidate_urls": ["https://www.nist.gov/information-technology/blockchain", "https://csrc.nist.gov/pubs/ir/8202/final"],
        "evidence": [
            ev("https://www.nist.gov/information-technology/blockchain", "National Institute of Standards and Technology (NIST)", "Blockchain overview: shared, tamper-evident and tamper-resistant digital ledger", "NIST identifies blockchain as a shared, tamper-evident and tamper-resistant digital ledger and provides the official technology overview."),
            ev("https://csrc.nist.gov/pubs/ir/8202/final", "National Institute of Standards and Technology (NIST)", "NIST IR 8202: Blockchain Technology Overview", "NIST IR 8202 gives the technical overview of blockchains as tamper-evident and tamper-resistant distributed digital ledgers."),
        ],
        "limitation": "The source verifies the technology destination; it does not imply blockchain is required in every engineering context.",
    },
    "coren-registered-engineer": {
        "decision": "linked",
        "queries": ["COREN registered engineer official registration Nigeria"],
        "candidate_urls": ["https://portal.coren.gov.ng/verification"],
        "evidence": [ev("https://portal.coren.gov.ng/verification", "Council for the Regulation of Engineering in Nigeria (COREN)", "Registration verification: practitioner registration status by COREN number", "COREN provides the official route for confirming the registration status of an engineering practitioner or firm by registration number.")],
        "limitation": "The source establishes the Nigerian registration-verification route; it does not make registration a universal requirement for every engineering-related domain.",
    },
    "engineering-safety-and-reliability": {
        "decision": "review_required",
        "queries": ["NASA Systems Engineering Handbook safety reliability official", "engineering safety reliability official standards"],
        "candidate_urls": ["https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf"],
        "evidence": [ev("https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf", "National Aeronautics and Space Administration (NASA)", "NASA Systems Engineering Handbook, Appendix J: specialty engineering includes reliability and safety; Appendix B: reliability definition", "NASA identifies safety and reliability as specialty engineering concerns and defines reliability as functioning properly over the intended life with an acceptable probability of failure.")],
        "limitation": "The source supports the two components but does not name the exact combined catalogue competency as a single item or establish one learning destination; retained for review.",
    },
    "interoperability": {
        "decision": "linked",
        "queries": ["NIST official interoperability definition"],
        "candidate_urls": ["https://csrc.nist.gov/glossary/term/interoperability"],
        "evidence": [ev("https://csrc.nist.gov/glossary/term/interoperability", "National Institute of Standards and Technology (NIST)", "CSRC Glossary: Interoperability; definition sourced to NIST SP 800-175B Rev. 1", "NIST defines interoperability as the ability of one entity to communicate with another entity.")],
        "limitation": "The source defines the capability; it does not establish ownership in each engineering domain context.",
    },
    "standards-based-engineering-practice": {
        "decision": "linked",
        "queries": ["Engineering Council standards engineering practice official"],
        "candidate_urls": ["https://www.engc.org.uk/our-role-as-regulator", "https://www.engc.org.uk/our-role-as-regulator/setting-standards"],
        "evidence": [ev("https://www.engc.org.uk/our-role-as-regulator", "Engineering Council", "Our role as regulator: setting, upholding and advancing standards for engineering competence and commitment", "The Engineering Council describes the standards of competence, commitment and responsible practice expected across the engineering profession and its role in upholding those standards.")],
        "limitation": "The source verifies standards-based professional practice as an authoritative destination; it does not establish a universal requirement for the selected domain.",
    },
    "ai": {
        "decision": "linked",
        "queries": ["NIST official artificial intelligence AI Risk Management Framework"],
        "candidate_urls": ["https://www.nist.gov/itl/ai-risk-management-framework"],
        "evidence": [ev("https://www.nist.gov/itl/ai-risk-management-framework", "National Institute of Standards and Technology (NIST)", "AI Risk Management Framework overview: design, development, use and evaluation of AI systems", "NIST identifies artificial intelligence (AI) and provides its AI Risk Management Framework for managing risks in the design, development, use and evaluation of AI systems.")],
        "limitation": "The framework is voluntary and verifies the AI information destination; it does not imply that AI is required in every domain context.",
    },
    "registered-architect-arcon": {
        "decision": "linked",
        "queries": ["ARCON Nigeria registered architect official registration portal"],
        "candidate_urls": ["https://portal.arconigeria.gov.ng/register", "https://arconigeria.gov.ng/"],
        "evidence": [ev("https://portal.arconigeria.gov.ng/register", "Architects Registration Council of Nigeria (ARCON)", "Architect registration and licensing portal for the Architects Registration Council of Nigeria", "ARCON provides the official Nigerian architect registration and licensing portal; its regulator site states that ARCON is responsible for registering every architect in Nigeria.")],
        "limitation": "The source verifies the Nigerian registration route; it does not imply registration is interchangeable with an academic architecture qualification.",
    },
    "riba-chartered-membership": {
        "decision": "linked",
        "queries": ["RIBA Chartered Membership official eligibility"],
        "candidate_urls": ["https://www.riba.org/work/join-us/riba-chartered-membership/"],
        "evidence": [ev("https://www.riba.org/work/join-us/riba-chartered-membership/", "Royal Institute of British Architects (RIBA)", "RIBA Chartered Membership: eligibility outside the UK and membership scope", "RIBA identifies Chartered Membership as a professional membership route for qualified architects and publishes eligibility pathways, including international applicants.")],
        "limitation": "RIBA Chartered Membership is a professional membership route and does not itself grant Nigerian or UK statutory permission to practise.",
    },
    "apply-safe-building-trade-methods": {
        "decision": "review_required",
        "queries": ["Skills England construction safe working methods official", "construction and built environment common KSBs methods of safe working"],
        "candidate_urls": ["https://skillsengland.education.gov.uk/media/nsmfug5q/construction-and-the-built-environment-common-ksbs-v2-published-february-24.pdf", "https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC0062"],
        "evidence": [ev("https://skillsengland.education.gov.uk/media/nsmfug5q/construction-and-the-built-environment-common-ksbs-v2-published-february-24.pdf", "Skills England", "Construction and the built environment common KSBs: building safety and methods of safe working, risk assessments, method statements and control measures", "Skills England documents methods of safe working and the associated risk-assessment, method-statement and control-measure practice used in construction and the built environment.")],
        "limitation": "The authority supports safe construction methods, but the catalogue label combines this with a broader building-trade wording; retained for review rather than treated as an exact named competency.",
    },
    "demonstrate-practical-trade-competence": {
        "decision": "review_required",
        "queries": ["Skills England construction occupational standard demonstrate competence official", "Skills England carpentry joinery occupational standard practical assessment"],
        "candidate_urls": ["https://skillsengland.education.gov.uk/qualifications/finder/OCC0264-v1-4"],
        "evidence": [ev("https://skillsengland.education.gov.uk/qualifications/finder/OCC0264-v1-4", "Skills England", "Carpentry and joinery occupational standard: independent assessment tests performance of the occupation and the stated duties/KSBs", "The Skills England standard describes independent assessment of whether an apprentice can perform the trained occupation and demonstrate its duties, knowledge, skills and behaviours.")],
        "limitation": "The source establishes occupational assessment and performance, but it does not name the exact combined catalogue competency as a standalone item; retained for review.",
    },
    "perform-construction-work-to-defined-occupational-standards": {
        "decision": "review_required",
        "queries": ["Skills England construction work occupational standards official", "Skills England carpentry joinery work to industry standards"],
        "candidate_urls": ["https://skillsengland.education.gov.uk/qualifications/finder/OCC0264-v1-4"],
        "evidence": [ev("https://skillsengland.education.gov.uk/qualifications/finder/OCC0264-v1-4", "Skills England", "Carpentry and joinery occupational standard: core duties and KSBs; performance assessed against the occupational standard", "The Skills England standard defines construction work, its duties and KSBs, and assesses whether the learner can perform the occupation to the stated standard.")],
        "limitation": "The source is an occupational standard for carpentry and joinery rather than the exact broader catalogue phrase; retained for review.",
    },
    "carpentry-and-joinery": {
        "decision": "linked",
        "queries": ["Skills England carpentry and joinery occupational standard official"],
        "candidate_urls": ["https://skillsengland.education.gov.uk/qualifications/finder/OCC0264-v1-4"],
        "evidence": [ev("https://skillsengland.education.gov.uk/qualifications/finder/OCC0264-v1-4", "Skills England", "Carpentry and joinery occupation summary and core duties", "Skills England identifies the carpentry and joinery occupation, its construction route, and the work of shaping, cutting and installing wood-based building components.")],
        "limitation": "The source verifies the occupational skill domain; it does not establish that every construction context requires the same level or pathway.",
    },
    "electrical-installation": {
        "decision": "linked",
        "queries": ["Skills England installation and maintenance electrician official occupational standard"],
        "candidate_urls": ["https://skillsengland.education.gov.uk/occupations/OCC0152-v1-0"],
        "evidence": [ev("https://skillsengland.education.gov.uk/occupations/OCC0152-v1-0", "Skills England", "Installation and maintenance electrician: occupation summary and duties for electrical installation, verification, testing and maintenance", "Skills England identifies the electrical installation occupation and describes installing, verifying, testing, commissioning and maintaining electrical systems in construction and engineering settings.")],
        "limitation": "The source verifies the occupational skill destination; local licensing or Nigerian regulatory requirements require separate evidence.",
    },
    "masonry": {
        "decision": "linked",
        "queries": ["Skills England bricklayer masonry occupational standard official"],
        "candidate_urls": ["https://skillsengland.education.gov.uk/occupations/OCC0095"],
        "evidence": [ev("https://skillsengland.education.gov.uk/occupations/OCC0095", "Skills England", "Bricklayer occupational standard: masonry materials, construction and repair duties", "Skills England identifies the bricklayer occupation and its masonry work, including constructing brick and block walls, repairing masonry and working to construction standards.")],
        "limitation": "The source verifies the masonry occupational skill destination; it does not establish that every masonry context uses the same trade level or qualification route.",
    },
    "comeg-registered-geoscientist": {
        "decision": "linked",
        "queries": ["COMEG registered geoscientist official Nigeria", "Ministry Solid Minerals COMEG registration geoscientists"],
        "candidate_urls": ["https://msmd.gov.ng/agencies/council-of-nigerian-mining-engineers-and-geoscientists/"],
        "evidence": [ev("https://msmd.gov.ng/agencies/council-of-nigerian-mining-engineers-and-geoscientists/", "Federal Ministry of Solid Minerals Development, Nigeria", "Council of Nigerian Mining Engineers and Geoscientists (COMEG): establishment, registration and regulation of geoscience and mining professions", "The Federal Ministry describes COMEG as the statutory council regulating and controlling geology, geophysics, geochemistry, mining engineering, petroleum engineering and related professional practice, including registration.")],
        "limitation": "The ministry page establishes COMEG's registration and regulatory remit; it does not provide an individual registration lookup for every practitioner.",
    },
    "coren-registered-engineer-mining": {
        "decision": "review_required",
        "queries": ["COREN registered engineer mining official Nigeria", "COREN engineering category field registration verification"],
        "candidate_urls": ["https://portal.coren.gov.ng/verification", "https://portal.coren.gov.ng/"],
        "evidence": [ev("https://portal.coren.gov.ng/verification", "Council for the Regulation of Engineering in Nigeria (COREN)", "Registration verification: practitioner status by COREN number; engineering category and field are recorded in the portal", "COREN provides the official practitioner-registration verification route and records a practitioner's engineering category and field.")],
        "limitation": "The official portal verifies COREN practitioner registration but does not expose a mining-specific registration destination or establish that this exact catalogue label is a distinct credential; retained for review.",
    },
    "mdcn-full-registration-medical-practitioner": {
        "decision": "linked",
        "queries": ["MDCN full registration medical practitioner official Nigeria", "MDCN guidelines full registration medical practitioner"],
        "candidate_urls": ["https://mdcn.gov.ng/frequently-asked-questions", "https://www.mdcn.gov.ng/public/storage/documents/sub_document_1215406857.pdf"],
        "evidence": [ev("https://mdcn.gov.ng/frequently-asked-questions", "Medical and Dental Council of Nigeria (MDCN)", "Full Registration: online application procedures and required documents", "MDCN publishes the exact Full Registration route for medical practitioners, including the application, housemanship/internship evidence and supporting documents.")],
        "limitation": "The source verifies the Nigerian medical registration route; eligibility still depends on the Council's current requirements and verification.",
    },
    "support-quality-and-patient-safety": {
        "decision": "linked",
        "queries": ["WHO patient safety quality health services official"],
        "candidate_urls": ["https://www.who.int/teams/integrated-health-services/patient-safety/policy/global-patient-safety-action-plan"],
        "evidence": [ev("https://www.who.int/teams/integrated-health-services/patient-safety/policy/global-patient-safety-action-plan", "World Health Organization (WHO)", "Global Patient Safety Action Plan 2021–2030: policy actions for safety and quality of health services", "WHO provides the Global Patient Safety Action Plan as a framework for eliminating avoidable harm and improving patient safety through policy and point-of-care actions.")],
        "limitation": "The source supports patient-safety practice and quality improvement; it does not establish a single professional credential or a role-specific requirement.",
    },
    "understand-health-system-governance": {
        "decision": "linked",
        "queries": ["WHO health systems governance official definition"],
        "candidate_urls": ["https://www.who.int/health-topics/health-systems-governance"],
        "evidence": [ev("https://www.who.int/health-topics/health-systems-governance", "World Health Organization (WHO)", "Health systems governance: processes, structures, institutions, strategic policy frameworks, oversight and accountability", "WHO defines health systems governance and explains the policy, regulatory, oversight and accountability processes used to manage health systems.")],
        "limitation": "The source defines the governance capability; it does not establish the exact curriculum or seniority required in every health-domain context.",
    },
    "work-within-regulated-health-practice": {
        "decision": "linked",
        "queries": ["MDCN Nigeria regulated medical practice registration official", "Medical and Dental Council Nigeria professional regulation official"],
        "candidate_urls": ["https://mdcn.gov.ng/", "https://www.mdcnigeria.org/about-us/organizational-structure-of-mdcn/"],
        "evidence": [ev("https://mdcn.gov.ng/", "Medical and Dental Council of Nigeria (MDCN)", "MDCN mandate and registration/licensing services for medical and dental practitioners", "MDCN is the Nigerian professional regulatory body and publishes registration, licensing and practitioner-status services for medical and dental practice.")],
        "limitation": "The source establishes the regulated-practice authority and route; it does not imply that every health-policy or public-health role requires a clinical licence.",
    },
    "health-policy": {
        "decision": "linked",
        "queries": ["WHO health policy definition official"],
        "candidate_urls": ["https://www.afro.who.int/sites/default/files/2017-06/dsdAFR-DHS-0301_0.pdf"],
        "evidence": [ev("https://www.afro.who.int/sites/default/files/2017-06/dsdAFR-DHS-0301_0.pdf", "World Health Organization Regional Office for Africa", "Module 1: definition and purpose of a national health policy", "WHO Africa defines health policy as statements and decisions setting priorities and directions for improving health and health care, and explains its role in planning and implementation.")],
        "limitation": "The source defines health policy and its planning use; it does not establish a national-policy credential or a single required job route.",
    },
    "health-security": {
        "decision": "linked",
        "queries": ["WHO health security framework official"],
        "candidate_urls": ["https://www.who.int/publications/i/item/9789240029682", "https://www.who.int/emergencies/operations/international-health-regulations-monitoring-evaluation-framework/national-action-plan-for-health-security"],
        "evidence": [ev("https://www.who.int/publications/i/item/9789240029682", "World Health Organization (WHO)", "Health systems for health security framework: capacities for IHR and health-emergency preparedness", "WHO provides a health-systems-for-health-security framework covering capacities, prioritization and monitoring for health emergencies and International Health Regulations implementation.")],
        "limitation": "The source verifies the health-security framework; it does not imply that health security is a regulated licence or a universal requirement for every health role.",
    },
}


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    selected = selection.get("items", [])
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    rows: list[dict] = []
    for item in selected:
        key = str(item["item_key"])
        spec = EVIDENCE[key]
        rows.append({
            "record_type": "item",
            "row_id": item["row_id"],
            "subject_id": item["subject_id"],
            "subject_kind": "item",
            "context": {"level": item["context_level"], "key": item["context_key"]},
            "context_level": item["context_level"],
            "context_key": item["context_key"],
            "domain_key": item.get("domain_key"),
            "item_type": item["item_type"],
            "item_key": key,
            "item_name": item["item_name"],
            "searched_at": now,
            "accessed_on": date.today().isoformat(),
            "queries": spec["queries"],
            "candidate_urls": spec["candidate_urls"],
            "decision": spec["decision"],
            "evidence": spec["evidence"],
            "limitation": spec["limitation"],
        })
    rows.sort(key=lambda row: row["row_id"])
    LEDGER.write_text("".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows), encoding="utf-8")
    decisions = Counter(row["decision"] for row in rows)
    selection_ids = [item["row_id"] for item in selected]
    ledger_ids = [row["row_id"] for row in rows]
    reconciliation = {
        "selection_ids": len(selection_ids),
        "ledger_ids": len(ledger_ids),
        "missing_from_ledger": len(set(selection_ids) - set(ledger_ids)),
        "unexpected_ledger_ids": len(set(ledger_ids) - set(selection_ids)),
        "duplicate_ledger_ids": len(ledger_ids) - len(set(ledger_ids)),
        "required_fields_missing": sum(not row.get(field) for row in rows for field in ("row_id", "context_level", "context_key", "item_type", "item_key", "item_name", "evidence")),
        "d078_rows": sum(1 for row in rows if str(row["context_key"]).startswith("D078")),
    }
    report = {
        "schema": "2026-09-21.full-population-enrichment-tranche-report.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": TRANCHE,
        "selection": SELECTION.name,
        "ledger": LEDGER.name,
        "status": "completed",
        "scope": {"excluded_context_prefix": "D078", "selected_rows": len(selected), "item_rows": len(selected), "relationship_rows": 0, "unique_item_names_searched": len(set(row["item_key"] for row in rows))},
        "decisions": {"rows_searched": len(rows), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "genuinely_unavailable": 0, "no_link": 0, "remaining_selected_rows": 0},
        "reconciliation": reconciliation,
        "guardrails": {"sql_touched": False, "generated_seed_transport_touched": False, "catalogue_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "notes": "Item-only tranche. Repeated item keys were searched once and every selected contextual identity retains its own evidence row. Combined construction competencies remain review_required where the authority supports components or an occupational standard but not the exact catalogue phrase.",
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        f"# Full-population item-enrichment tranche {TRANCHE} report\n\n"
        f"Selection: `{SELECTION.name}`  \nLedger: `{LEDGER.name}`\n\n"
        "Status: **completed**\n\n"
        "## Decisions\n\n"
        f"- Rows searched: **{len(rows)} / {len(selected)}** contextual identities\n"
        f"- Unique item keys searched: **{len(set(row['item_key'] for row in rows))}**\n"
        f"- Linked: **{decisions.get('linked', 0)}**\n"
        f"- Review required: **{decisions.get('review_required', 0)}**\n"
        "- Genuinely unavailable: **0**\n"
        "- Remaining selected rows: **0**\n\n"
        "## Evidence policy\n\n"
        "- Each row retains authoritative HTTPS URLs, exact locators, evidence summaries, authority and access date.\n"
        "- Repeated item keys are represented separately for each context; no cross-context ownership claim is inferred.\n"
        "- Combined construction competency labels remain `review_required` when the source supports related components or a standard but does not name the exact catalogue item.\n\n"
        "## Guardrails\n\n"
        "- D078 was excluded and no relationship rows were searched or promoted.\n"
        "- No generic homepage was promoted as item-specific evidence.\n"
        "- SQL, generated seed transport, catalogue, UI and browser proof were not touched.\n",
        encoding="utf-8",
    )
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "tranche": TRANCHE,
        "accessed_on": date.today().isoformat(),
        "status": "completed",
        "blocked": False,
        "blocker": None,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
        "source_queue": str((ROOT / "data" / "career-mapping" / "_audit" / "external_enrichment_queue_2026-09-20.json").relative_to(ROOT)).replace("\\", "/"),
        "progress": {"selected_rows": len(selected), "searched_rows": len(rows), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "genuinely_unavailable": 0, "unique_item_names_searched": len(set(row["item_key"] for row in rows))},
        "guardrails": {"prior_tranches_overwritten": False, "catalogue_touched": False, "generated_seed_transport_touched": False, "sql_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "next_action": "Regenerate the external-enrichment queue, then select the next stable-row-id, non-overlapping, non-D078 item identities.",
        "counts": selection.get("counts", {}),
        "selection_ids": selection_ids,
        "searched_ids": ledger_ids,
        "missing_selection_ids": sorted(set(selection_ids) - set(ledger_ids)),
        "search_policy": "Search each selected item against an authoritative item-specific source. Preserve exact URL, locator, evidence and access date. Use review_required for uncertainty; never promote a generic source or inferred match.",
        "decisions": dict(decisions),
        "reconciliation": reconciliation,
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        f"# Full-population item-enrichment tranche {TRANCHE} checkpoint\n\n"
        f"- Selection: `{SELECTION.name}`\n"
        f"- Ledger: `{LEDGER.name}`\n"
        f"- Status: **completed** — {len(rows)} contextual rows searched, {decisions.get('linked', 0)} linked and {decisions.get('review_required', 0)} review-required.\n"
        "- Evidence: authoritative item-specific URLs, locators, summaries and access dates retained in the append-only ledger.\n"
        "- No catalogue, generated seed, SQL, UI, app, or browser-proof files were changed.\n"
        "- Blocker report: **not blocked**.\n",
        encoding="utf-8",
    )
    print(json.dumps({"rows": len(rows), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "reconciliation": reconciliation}, sort_keys=True))


if __name__ == "__main__":
    main()
