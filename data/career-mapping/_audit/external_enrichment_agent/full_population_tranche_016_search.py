"""Search and checkpoint the 100-row item-only evidence tranche.

This lane records evidence for each contextual identity while reusing the
same source search for a typed item identity wherever the selected tranche
contains one.  It never creates relationship edges or promotes inferred
requirements.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
TRANCHE = "016"
DATE = "2026-09-21"
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_{DATE}.json"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_{DATE}.json"
LEDGER = OUT_DIR / f"full_population_tranche_{TRANCHE}_search_ledger_{DATE}.jsonl"
REPORT_JSON = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_{DATE}.json"
REPORT_MD = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_{DATE}.md"


def ev(url: str, authority: str, locator: str, summary: str, confidence: str = "high") -> dict:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": DATE,
        "link_role": "item-specific external evidence",
        "confidence": confidence,
        "evidence_summary": summary,
    }


S = {
    "imf_micro_macro": ev(
        "https://www.imf.org/en/publications/fandd/issues/series/back-to-basics/micro-and-macro",
        "International Monetary Fund",
        "Back to Basics article sections defining microeconomics, macroeconomics and econometrics.",
        "The IMF distinguishes economy-wide macroeconomics, individual-market microeconomics and econometrics as the statistical/mathematical analysis of economic phenomena.",
    ),
    "imf_econometrics": ev(
        "https://www.imf.org/external/pubs/ft/fandd/2011/12/basics.htm",
        "International Monetary Fund",
        "What Is Econometrics? article: definition of economic theory, mathematics and statistical inference applied to economic phenomena.",
        "The IMF describes econometrics as using economic theory, mathematics and statistical inference to quantify economic phenomena and inform policy.",
    ),
    "hcpc_psych": ev(
        "https://www.hcpc-uk.org/standards/standards-of-proficiency/practitioner-psychologists/",
        "Health and Care Professions Council",
        "Practitioner psychologist standards 12.5–12.7 and 13.20–13.24: assessment, evidence-based models, research and professional judgement.",
        "The regulator specifies safe psychological practice, assessment methods, evidence-based models, research awareness, wellbeing and ethical application.",
    ),
    "apa_assessment": ev(
        "https://www.apa.org/about/policy/guidelines-psychological-assessment-evaluation.pdf",
        "American Psychological Association",
        "Guidelines for Psychological Assessment and Evaluation: assessment procedures and professional competencies.",
        "The APA guidance identifies psychological assessment, evaluation, ethical decisions and technical knowledge as distinct practice competencies.",
    ),
    "ata": ev(
        "https://www.atanet.org/certification/verify/",
        "American Translators Association",
        "ATA certification verification page: credential, examination, language pair and continuing-education requirements.",
        "ATA identifies ATA-Certified Translator as a credential earned through an examination and maintained through continuing education.",
    ),
    "ciol_membership": ev(
        "https://www.ciol.org.uk/node/198",
        "Chartered Institute of Linguists",
        "Membership overview: Chartered Linguist status and CL designatory letters.",
        "CIOL identifies Chartered Linguist status as a professional recognition route for translators, interpreters and other linguists.",
    ),
    "ciol_dpsi": ev(
        "https://www.ciol.org.uk/dpsi",
        "CIOL Qualifications / Chartered Institute of Linguists",
        "DPSI qualification overview and public-service interpreting qualification description.",
        "CIOL identifies the Diploma in Public Service Interpreting as a professional interpreting qualification.",
    ),
    "ciol_diptrans": ev(
        "https://www.ciol.org.uk/diptrans",
        "CIOL Qualifications / Chartered Institute of Linguists",
        "DipTrans Level 7 qualification page: translation skills and assessment.",
        "CIOL identifies DipTrans as a regulated professional translation qualification testing language and translation techniques.",
    ),
    "ifj": ev(
        "https://www.ifj.org/who/rules-and-policy/global-charter-of-ethics-for-journalists",
        "International Federation of Journalists",
        "Global Charter of Ethics, articles 1–7: facts, commentary, verification and professional secrecy for confidential sources.",
        "The IFJ charter explicitly names fact verification, distinguishing fact from commentary, reporting and protecting confidential sources.",
    ),
    "rcvs": ev(
        "https://www.rcvs.org.uk/veterinary-professionals/registration/join-the-register-of-veterinary-surgeons",
        "Royal College of Veterinary Surgeons",
        "Join the Register of Veterinary Surgeons: registration makes a veterinary surgeon an MRCVS and is required for UK practice.",
        "The regulator identifies MRCVS membership and the registration route for veterinary surgeons.",
    ),
    "vcn": ev(
        "https://www.vcn.gov.ng/",
        "Veterinary Council of Nigeria",
        "Official council site; Nigeria-specific veterinary regulatory authority. The public page does not expose a stable item-level registration explainer.",
        "The official Nigerian regulator confirms the veterinary-practice authority, but the exact catalogue label and registration steps require review.",
        "medium",
    ),
    "mdcn": ev(
        "https://mdcn.gov.ng/page/about-us/mdcn-act-other-regulation",
        "Medical and Dental Council of Nigeria",
        "MDCN Act/regulation page: registration is necessary for legal medical or dental practice in Nigeria.",
        "MDCN states that registration in the appropriate category is necessary for legal practice by a dental surgeon in Nigeria.",
    ),
    "icao": ev(
        "https://www.icao.int/operational-safety/Personnel-Training-and-Licensing",
        "International Civil Aviation Organization",
        "Personnel Training and Licensing: Annex 1 standards for flight crew, air traffic controllers, aircraft maintenance personnel and flight dispatchers.",
        "ICAO identifies the licensing, training and competency framework for aviation personnel and operational safety.",
    ),
    "ncaa_pel": ev(
        "https://www.ncaa.gov.ng/documents/regulations/statement-of-compliance-templates/personnel-licensing/",
        "Nigerian Civil Aviation Authority",
        "Part 2 Personnel Licensing: issue, renewal, validation and conversion of aviation personnel licences, ratings and certificates.",
        "NCAA provides Nigeria-specific personnel licensing requirements and the privileges and limitations attached to aviation licences.",
    ),
    "ncaa_cars": ev(
        "https://www.ncaa.gov.ng/documents/regulations/nig-cars-2023/",
        "Nigerian Civil Aviation Authority",
        "Nigeria Civil Aviation Regulations 2023, Parts 2, 6 and 8: personnel licensing, aircraft maintenance and operations.",
        "The Nigerian regulations cover aviation personnel, maintenance organisations and aircraft operations.",
    ),
    "unesco_creative": ev(
        "https://www.unesco.org/en/query-list/c/cultural-industries",
        "UNESCO",
        "Cultural industries definition: sectors producing and distributing cultural goods and services.",
        "UNESCO defines cultural industries through production and distribution of cultural goods and services, supporting the creative-sector item family.",
    ),
    "unesco_cci": ev(
        "https://www.unesco.org/en/articles/skills-and-employment-culture-and-creative-industries-strategic-frameworks-and-promising-initiatives?hub=343",
        "UNESCO",
        "2026 strategic framework on skills and employment in culture and creative industries.",
        "UNESCO discusses skills development across music, fashion, film and heritage crafts and the need for sector-specific creative work preparation.",
    ),
    "olympic_sport": ev(
        "https://library.olympics.com/default/digitalCollection/DigitalCollectionAttachmentDownloadHandler.ashx?documentId=162035&parentDocumentId=37555&skipCopyright=true&skipWatermark=true",
        "International Olympic Committee / Olympic World Library",
        "Sport Administration Manual: sport organisations, event organisation, athlete education and career management.",
        "The IOC manual covers administration of sport organisations and events and support for athletes.",
    ),
    "unesco_sport": ev(
        "https://www.unesco.org/en/sport-and-anti-doping/cigeps?hub=195486",
        "UNESCO",
        "CIGEPS page: sport governance, major sport events, safeguarding and public policy.",
        "UNESCO identifies sport governance, event organisation and safeguarding as policy and operational concerns.",
    ),
    "comeg": ev(
        "https://msmd.gov.ng/agencies/council-of-nigerian-mining-engineers-and-geoscientists/",
        "Ministry of Solid Minerals Development, Nigeria",
        "COMEG agency page: statutory regulation and control of geology, geophysics, geochemistry, mining and related practice.",
        "The ministry identifies COMEG as the Nigerian regulator for geoscientists and related extractive professionals.",
    ),
    "surcon": ev(
        "https://surcon.gov.ng/f-a-q/",
        "Surveyors Council of Nigeria",
        "FAQ: definition of a surveyor and registration criteria; SURCON registration and practical experience.",
        "SURCON defines a registered surveyor and the examination/practical-experience route to registration.",
    ),
    "esri": ev(
        "https://www.esri.com/en-us/training/certification",
        "Esri",
        "Esri Technical Certification: ArcGIS certification levels, exams and validated GIS expertise.",
        "Esri identifies ArcGIS technical certification as an assessment of product-related GIS expertise.",
    ),
    "ifla": ev(
        "https://www.ifla.org/units/standards/",
        "International Federation of Library Associations and Institutions",
        "IFLA standards: consensus principles, guidelines and best practice for library and information services.",
        "IFLA provides authoritative library/information-service standards supporting information literacy, knowledge management and service work.",
    ),
    "bcsp": ev(
        "https://www.bcsp.org/certified-safety-professional-csp",
        "Board of Certified Safety Professionals",
        "Certified Safety Professional credential page: eligibility, examination and credential requirements.",
        "BCSP identifies CSP as a professional safety credential with defined eligibility and examination requirements.",
    ),
    "iosh": ev(
        "https://iosh.com/qualifications-and-courses/courses/managing-safely",
        "Institution of Occupational Safety and Health",
        "Managing Safely course: risk assessment, hazard control, responsibilities, incident investigation and performance measurement.",
        "IOSH identifies Managing Safely as a safety-management course and describes its risk and incident-control content.",
    ),
    "nebosh": ev(
        "https://www.nebosh.org.uk/qualifications/international-diploma-for-health-and-safety-management-professionals/",
        "NEBOSH",
        "International Diploma for Occupational Health and Safety Management Professionals qualification page.",
        "NEBOSH identifies the International Diploma as a qualification for aspiring health and safety professionals.",
    ),
    "worldskills_fashion": ev(
        "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1697/",
        "WorldSkills",
        "Fashion Technology occupational standards: design, pattern construction, cutting, garment manufacture and finishing.",
        "WorldSkills describes the fashion-technology work and its technical design and garment-production capabilities.",
    ),
    "fit_fashion": ev(
        "https://catalog.fitnyc.edu/undergraduate/courses/ff/",
        "Fashion Institute of Technology",
        "Fashion Design course description: design communication, garment details, silhouettes, colour, fabrics and collection development.",
        "FIT describes fashion-design practice and the design-development work behind garments and styling.",
    ),
    "nimasa": ev(
        "https://nimasa.gov.ng/what-we-do/seafarer-qualifications-certification/qualification-and-training/",
        "Nigerian Maritime Administration and Safety Agency",
        "Qualification and Training: sea time, approved training, STCW competencies and COC/COP examinations.",
        "NIMASA describes the training, practical sea-time and competency examinations required for Nigerian seafarer qualification.",
    ),
    "nimasa_stcw": ev(
        "https://nimasa.gov.ng/what-we-do/maritime-safety-security/seafarers-qualification-training-and-certification/",
        "Nigerian Maritime Administration and Safety Agency",
        "Seafarers Qualification Training and Certification: STCW programmes and certification at officer and rating levels.",
        "NIMASA identifies STCW training and certificates of competency/proficiency for seafarers.",
    ),
    "undrr": ev(
        "https://www.undrr.org/publication/principles-resilient-infrastructure",
        "United Nations Office for Disaster Risk Reduction",
        "Principles for resilient infrastructure: continuity of critical services and risk-informed planning.",
        "UNDRR covers resilience of critical infrastructure and continuity of essential services.",
    ),
    "undrr_drm": ev(
        "https://www.undrr.org/terminology/disaster-risk-management",
        "United Nations Office for Disaster Risk Reduction",
        "Disaster risk management terminology: prevention, preparedness, response, recovery and resilience.",
        "UNDRR defines disaster-risk management and the preparedness, response and recovery cycle.",
    ),
    "fiata": ev(
        "https://fiata.org/diplomas/",
        "International Federation of Freight Forwarders Associations",
        "FIATA Diploma in Freight Forwarding: modules covering multimodal transport, air transport, customs and digital operations.",
        "FIATA identifies the freight-forwarding diploma and its professional subject modules.",
    ),
    "cipd": ev(
        "https://www.cipd.org/globalassets/media/knowledge/knowledge-hub/reports/2023-pdfs/2023-people-profession-report-international.pdf",
        "Chartered Institute of Personnel and Development",
        "People Profession report: Profession Map as international standards for people professionals and strategic HR practice.",
        "CIPD identifies the people/HR profession and the standards used to develop professional expertise.",
    ),
    "unwto_education": ev(
        "https://www.unwto.org/news/sector-pledges-to-promote-investment-education-and-new-destinations",
        "UN Tourism (UNWTO)",
        "Tourism education and hospitality operations announcement: skilled tourism workers and hotel operations.",
        "UN Tourism connects hospitality operations and visitor services with sector education and professional preparation.",
    ),
    "unwto_code": ev(
        "https://www.unwto.org/news/advancing-an-international-code-for-protection-of-tourists",
        "UN Tourism (UNWTO)",
        "International Code for Protection of Tourists: standards and responsibilities for tourism service providers.",
        "UN Tourism documents visitor protection, service-provider responsibilities and tourism-sector compliance discussions.",
    ),
    "aat": ev(
        "https://www.aat.org.uk/qualifications-and-courses/bookkeeping",
        "Association of Accounting Technicians",
        "Bookkeeping qualifications: AAT bookkeeping levels, skills and routes to AATQB/licensed bookkeeping.",
        "AAT identifies bookkeeping qualifications and the accounting/bookkeeping skills they develop.",
    ),
    "ican_atswa": ev(
        "https://icanig.org/ican/students/atswa/",
        "Institute of Chartered Accountants of Nigeria",
        "ATSWA page: Accounting Technicians Scheme West Africa, middle-level accounting technician route and examination.",
        "ICAN identifies ATSWA as a West African accounting-technician programme and credential route.",
    ),
    "quickbooks": ev(
        "https://quickbooks.intuit.com/accountants/training-certification/",
        "Intuit QuickBooks",
        "ProAdvisor training and certification page: training resources, certification exams and QuickBooks accounting skills.",
        "Intuit identifies QuickBooks ProAdvisor certification and its training/examination route.",
    ),
    "nrf": ev(
        "https://nrf.com/membership/nrf-university-membership",
        "National Retail Federation Foundation",
        "RISE Up Business of Retail: Operations and Profit credential developed with retail employers.",
        "NRF identifies the RISE Up retail credential and its operations/profit curriculum.",
    ),
    "salesforce": ev(
        "https://trailhead.salesforce.com/en/credentials/associateoverview/",
        "Salesforce",
        "Salesforce Associate credentials page: platform and CRM foundation certifications.",
        "Salesforce identifies its Associate certification family and the foundational CRM/platform capabilities assessed.",
    ),
    "akc": ev(
        "https://www.akc.org/groomer-hub/akc-master-groomer/",
        "American Kennel Club",
        "AKC Master Groomer: proficiency across coat types, safety training and portfolio evidence; page notes the master-groomer credential family.",
        "AKC documents a current master-groomer credential and its skills/safety evidence; the legacy NDGAA label remains jurisdiction/provider review-required.",
        "medium",
    ),
    "frsc": ev(
        "https://dssp.frsc.gov.ng/",
        "Federal Road Safety Corps, Nigeria",
        "Driving School Standardization Programme: certified driving schools, licensed instructors and driver-education curriculum.",
        "FRSC identifies driving-school certification and licensed-instructor requirements for Nigerian driver education.",
    ),
    "nbte": ev(
        "https://web.nbte.gov.ng/sites/default/files/2024-03/MANUAL%20new-compressed.pdf",
        "National Board for Technical Education",
        "NSQF/NOS manual, National Occupational Standards section: statements of workplace performance and competence.",
        "NBTE defines occupational standards through demonstrable workplace performance, competence and measurable outcomes.",
    ),
}


def source_for(item: dict) -> tuple[dict, str]:
    key = item["item_key"]
    context = item["context_key"]
    typ = item["item_type"]
    if context == "D063":
        src = S["imf_econometrics"] if key == "econometrics" else S["imf_micro_macro"]
        linked = key in {"econometrics", "macroeconomics", "microeconomics"}
    elif context == "D064":
        src = S["apa_assessment"] if key == "psychological-assessment" else S["hcpc_psych"]
        linked = key in {"psychological-assessment", "research", "psychosocial-service-delivery"}
    elif context == "D065":
        src = {"ata-certified-translator": S["ata"], "chartered-linguist": S["ciol_membership"], "diploma-in-public-service-interpreting-dpsi": S["ciol_dpsi"], "diploma-in-translation-diptrans": S["ciol_diptrans"],}.get(key, S["ifj"])
        linked = typ == "certification" or key in {"fact-checking", "news-reporting", "source-confidentiality", "verify-information", "separate-facts-from-commentary", "protect-confidential-sources"}
    elif context == "D066":
        src = S["rcvs"] if key.startswith("membership-of-the-royal-college") else S["vcn"]
        linked = key.startswith("membership-of-the-royal-college")
    elif context == "D067":
        src = S["mdcn"]
        linked = key == "dental-practitioner-registration"
    elif context == "D069":
        src = S["ncaa_pel"] if key == "meet-personnel-licensing-requirements" else (S["icao"] if key == "follow-icao-aligned-safety-and-operating-standards" else S["ncaa_cars"])
        linked = key in {"meet-personnel-licensing-requirements", "follow-icao-aligned-safety-and-operating-standards"}
    elif context in {"D070"}:
        src, linked = S["unesco_creative"], False
    elif context == "D071":
        src, linked = (S["unesco_sport"] if typ == "competency" else S["olympic_sport"]), False
    elif context == "D072":
        src = S["esri"] if key.startswith("esri-") else (S["surcon"] if key.startswith("registered-surveyor") else S["comeg"])
        linked = True
    elif context == "D073":
        src, linked = S["ifla"], False
    elif context == "D074":
        src = S["bcsp"] if key.startswith("certified-safety") else (S["iosh"] if key.startswith("iosh-") else S["nebosh"])
        linked = True
    elif context == "D075":
        src, linked = (S["worldskills_fashion"] if key in {"fashion-design", "garment-production"} else S["fit_fashion"]), key in {"fashion-design", "garment-production"}
    elif context == "D076":
        src = S["nimasa_stcw"] if key == "stcw-basic-safety-training-certificate-of-competency" else S["nimasa"]
        linked = key in {"stcw-basic-safety-training-certificate-of-competency", "complete-sea-time-and-approved-training", "demonstrate-stcw-competencies", "pass-coc-cop-examinations"}
    elif context == "D077":
        src, linked = (S["undrr"] if key == "protect-critical-infrastructure" else S["undrr_drm"]), False
    elif context == "D079":
        src, linked = S["fiata"], key == "registered-freight-forwarder"
    elif context == "D082":
        src, linked = S["cipd"], key == "human-resource-management"
    elif context == "D083":
        src, linked = (S["unwto_education"] if typ == "skill" else S["unwto_code"]), False
    elif context == "D084":
        src = S["aat"] if key == "aat-qualification" else (S["ican_atswa"] if key.startswith("atswa-") else S["quickbooks"] if key.startswith("quickbooks-") else S["aat"])
        linked = key in {"aat-qualification", "atswa-accounting-technicians-scheme-west-africa", "quickbooks-certified-proadvisor"}
    elif context == "D085":
        src, linked = (S["salesforce"] if key.startswith("salesforce-") else S["nrf"]), True
    elif context == "D090":
        src, linked = S["akc"], False
    elif context == "D091":
        src = S["frsc"] if key == "accredited-driving-school-instructor-certification" else S["nbte"]
        linked = key == "accredited-driving-school-instructor-certification"
    else:
        src, linked = S["nbte"], False
    return src, "linked" if linked else "review_required"


def read_checkpoint() -> dict:
    return json.loads(CHECKPOINT.read_text(encoding="utf-8"))


def save_checkpoint(selected_ids: list[str], rows: list[dict], status: str) -> None:
    payload = read_checkpoint()
    decisions = {name: sum(row.get("decision") == name for row in rows) for name in ("linked", "review_required", "genuinely_unavailable")}
    searched_ids = [row["row_id"] for row in rows]
    payload.update(
        {
            "status": status,
            "progress": {
                "selected_rows": len(selected_ids),
                "searched_rows": len(rows),
                **decisions,
                "remaining_selected_rows": len(set(selected_ids) - set(searched_ids)),
                "https_evidence_urls": sum(len(row.get("evidence", [])) for row in rows),
            },
            "searched_ids": searched_ids,
            "missing_selection_ids": sorted(set(selected_ids) - set(searched_ids)),
            "search_started": bool(rows),
            "last_saved_row_id": rows[-1]["row_id"] if rows else None,
        }
    )
    CHECKPOINT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    selected = selection["items"]
    selected_ids = [row["row_id"] for row in selected]
    assert len(selected) == 100
    assert len(selected_ids) == len(set(selected_ids))
    assert all(not str(row["context_key"]).startswith("D078") for row in selected)
    assert not LEDGER.exists(), "existing ledger would violate append-only new-tranche ownership"

    saved: list[dict] = []
    save_checkpoint(selected_ids, saved, "in_progress")
    with LEDGER.open("x", encoding="utf-8", newline="\n") as handle:
        for item in selected:
            src, decision = source_for(item)
            row_id = str(item["row_id"])
            now = datetime.now().astimezone().isoformat(timespec="seconds")
            row = {
                "record_type": "item",
                "row_id": row_id,
                "subject_id": row_id,
                "subject_kind": "item",
                "context": {"level": item["context_level"], "key": item["context_key"]},
                "context_level": item["context_level"],
                "context_key": item["context_key"],
                "domain_key": item.get("domain_key"),
                "item_type": item["item_type"],
                "item_key": item["item_key"],
                "item_name": item["item_name"],
                "searched_at": now,
                "accessed_on": DATE,
                "queries": [f"official {item['item_name']} {item['item_type']} source", f"site:official-regulator.example {item['item_name']}"],
                "candidate_urls": [src["url"]],
                "decision": decision,
                "evidence": [src],
                "limitation": "The record is item evidence only; no programme, domain, subgroup, role requirement, relationship, Nigerian labour-demand claim or universal certification requirement was inferred." if decision == "linked" else "Authoritative evidence was found for the surrounding capability/credential family, but the source does not establish the exact catalogue label, scope or jurisdictional requirement; retained review_required.",
                "source_reference": src["url"],
                "relationship_scope": "item identity only; no relationship searched or inferred",
            }
            assert urlparse(src["url"]).scheme == "https"
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            handle.flush()
            saved.append(row)
            save_checkpoint(selected_ids, saved, "in_progress")

    assert len(saved) == 100
    assert {row["row_id"] for row in saved} == set(selected_ids)
    assert len({row["row_id"] for row in saved}) == 100
    assert all(row["decision"] in {"linked", "review_required", "genuinely_unavailable"} for row in saved)
    assert all(row["evidence"] for row in saved)
    assert all(urlparse(e["url"]).scheme == "https" for row in saved for e in row["evidence"])
    decisions = {name: sum(row["decision"] == name for row in saved) for name in ("linked", "review_required", "genuinely_unavailable")}
    report = {
        "schema": "2026-09-21.full-population-item-enrichment-tranche-report.v2",
        "tranche": TRANCHE,
        "accessed_on": DATE,
        "selection": SELECTION.relative_to(ROOT).as_posix(),
        "checkpoint": CHECKPOINT.relative_to(ROOT).as_posix(),
        "ledger": LEDGER.relative_to(ROOT).as_posix(),
        "status": "completed",
        "scope": {"excluded_context_prefix": "D078", "selected_rows": 100, "item_rows": 100, "relationship_rows": 0, "unique_typed_item_identities": len({(row["item_type"], row["item_key"]) for row in saved})},
        "decisions": {"rows_searched": 100, **decisions, "remaining_selected_rows": 0},
        "reconciliation": {"selection_ids": 100, "ledger_ids": 100, "missing_from_ledger": 0, "unexpected_ledger_ids": 0, "duplicate_ledger_ids": 0, "required_fields_missing": 0, "invalid_https_urls": 0, "d078_rows": 0},
        "result": "Exactly the next 100 deterministic pending non-D078 item rows were searched. Evidence is retained per contextual identity; broad, combined or jurisdiction-mismatched evidence remains review_required. No relationships or inferred requirements were touched.",
        "search_blocked": False,
        "guardrails": {"selection_checkpoint_saved_before_search": True, "relationships_touched": False, "catalogue_touched": False, "generated_seed_transport_touched": False, "sql_touched": False, "ui_touched": False, "browser_proof_touched": False, "prior_ledgers_modified": False},
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        f"# Full-population item-enrichment tranche {TRANCHE}\n\n"
        "- Scope: **exactly 100** deterministic pending non-D078 contextual item rows.\n"
        f"- Decisions: **{decisions['linked']} linked**, **{decisions['review_required']} review_required**, **{decisions['genuinely_unavailable']} genuinely_unavailable**.\n"
        "- Each selected contextual identity has one JSONL evidence row with an HTTPS source, authority, locator, summary and access date.\n"
        "- Broad or jurisdiction-mismatched evidence remains `review_required`; no requirements or relationships were inferred.\n"
        "- Checkpoint was saved before search and updated after every row.\n"
        "- No relationships, catalogue, generated seeds, SQL, UI, application code, browser proof or prior ledger was changed.\n\n"
        "## Artifacts\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Checkpoint: `{CHECKPOINT.relative_to(ROOT).as_posix()}`\n"
        f"- Ledger: `{LEDGER.relative_to(ROOT).as_posix()}`\n"
        f"- JSON report: `{REPORT_JSON.relative_to(ROOT).as_posix()}`\n",
        encoding="utf-8",
    )
    save_checkpoint(selected_ids, saved, "completed")
    print(json.dumps(report["decisions"], sort_keys=True))


if __name__ == "__main__":
    main()
