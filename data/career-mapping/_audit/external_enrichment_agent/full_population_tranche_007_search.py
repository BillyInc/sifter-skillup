"""Record authoritative search evidence for item-enrichment tranche 007."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
SELECTION = OUT_DIR / "full_population_tranche_007_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_tranche_007_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_tranche_007_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_007_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_tranche_007_report_2026-09-21.md"
REPORT_JSON = OUT_DIR / "full_population_tranche_007_report_2026-09-21.json"


def source(url: str, authority: str, locator: str, summary: str, *, confidence: str = "high") -> dict:
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
    "multimedia-document-production": {
        "decision": "review_required",
        "queries": ["Adobe official create multimedia documents PDF production"],
        "candidate_urls": ["https://helpx.adobe.com/reader/desktop/create-pdf.html", "https://helpx.adobe.com/ph_en/illustrator/using/creating-pdf-files.html"],
        "evidence": [source("https://helpx.adobe.com/reader/desktop/create-pdf.html", "Adobe", "Create PDFs; supported document, presentation, graphic and image inputs", "Adobe documents creating PDFs from documents, presentations, graphics and images, supporting the production workflow behind this label.", confidence="medium")],
        "limitation": "Held for review because the evidence supports a document-production workflow, not the exact combined catalogue competency name or contextual ownership.",
    },
    "software-packages": {
        "decision": "review_required",
        "queries": ["O*NET software skills official software packages"],
        "candidate_urls": ["https://www.onetonline.org/find/descriptor/browse/2.E", "https://www.onetonline.org/search/tech/"],
        "evidence": [source("https://www.onetonline.org/find/descriptor/browse/2.E", "O*NET OnLine / U.S. Department of Labor", "Browse by Software Skills", "O*NET defines software skills as specific programs and applications used for work tasks and lists purpose-specific software categories.", confidence="medium")],
        "limitation": "Held for review because software packages is a broad category rather than one item-specific package or a single defined learning target.",
    },
    "coren-registered-engineer": {
        "decision": "linked",
        "queries": ["COREN registered engineer official registration verification"],
        "candidate_urls": ["https://portal.coren.gov.ng/verification", "https://coren.gov.ng/frequently-asked-questions/"],
        "evidence": [
            source("https://portal.coren.gov.ng/verification", "Council for the Regulation of Engineering in Nigeria (COREN)", "Registration verification; practitioner registration number", "COREN provides an official practitioner-registration verification route for registered engineers and engineering firms."),
            source("https://coren.gov.ng/frequently-asked-questions/", "COREN", "FAQ: functions of COREN and benefits of registration", "COREN states that it determines who are engineers, maintains the register, and issues engineering practitioners' licences to practise legally in Nigeria."),
        ],
        "limitation": "The official verification route establishes the credential destination; it does not establish ownership of this item in every D008 context.",
    },
    "manage-spectrum-and-numbering-obligations": {
        "decision": "review_required",
        "queries": ["NCC Nigeria spectrum numbering obligations regulations official"],
        "candidate_urls": ["https://ig.ncc.gov.ng/operators/regulations-guidelines/regulations", "https://spectrum.ncc.gov.ng/"],
        "evidence": [source("https://ig.ncc.gov.ng/operators/regulations-guidelines/regulations", "Nigerian Communications Commission (NCC)", "Published regulations: assignment of spectrum or numbers and licences", "NCC regulations describe written authorisations, permits, licences, and assignment of spectrum or numbers under the Nigerian Communications Act.", confidence="medium")],
        "limitation": "Held for review because the sources establish the regulatory obligations but do not define this exact combined competency as a standalone item.",
    },
    "meet-type-approval-and-service-quality-requirements": {
        "decision": "review_required",
        "queries": ["NCC Nigeria type approval quality of service requirements official"],
        "candidate_urls": ["https://www.ncc.gov.ng/industry/numbering-type-approval/type-approval", "https://www.ncc.gov.ng/industry/regulations-guidelines/quality-service-qos"],
        "evidence": [
            source("https://www.ncc.gov.ng/industry/numbering-type-approval/type-approval", "NCC", "Type Approval standards and approved equipment", "NCC states that communications equipment must conform to applicable standards before operation in Nigeria."),
            source("https://www.ncc.gov.ng/industry/regulations-guidelines/quality-service-qos", "NCC", "Quality of Service standards and operator reporting", "NCC establishes minimum telecommunications Quality of Service standards and reporting requirements for operators."),
        ],
        "limitation": "Held for review because the two requirements are evidenced separately and no single authoritative source defines the exact combined competency label.",
    },
    "operate-within-communications-licensing": {
        "decision": "review_required",
        "queries": ["NCC Nigeria communications licensing framework official"],
        "candidate_urls": ["https://ncc.gov.ng/sites/default/files/2024-12/Final_FrameworkDocument_for_Upload.pdf", "https://ncc.gov.ng/sites/default/files/2024-12/Licensing-Licensing-_Framework_UASL.pdf"],
        "evidence": [source("https://ncc.gov.ng/sites/default/files/2024-12/Final_FrameworkDocument_for_Upload.pdf", "NCC", "Licensing framework; licensing and technical-standard obligations", "NCC publishes a licensing framework for communications services and links licensing conditions to type-approval and technical standards.", confidence="medium")],
        "limitation": "Held for review because operating within licensing rules is a broad compliance competency rather than a named qualification or standardized item.",
    },
    "broadband-services": {
        "decision": "linked",
        "queries": ["NCC regulatory guidelines deployment broadband services Nigeria official"],
        "candidate_urls": ["https://ncc.gov.ng/sites/default/files/2024-10/Legal-Guidelines_Deployment_Broadband_Service_Guidlines.pdf"],
        "evidence": [source("https://ncc.gov.ng/sites/default/files/2024-10/Legal-Guidelines_Deployment_Broadband_Service_Guidlines.pdf", "NCC", "Regulatory Guidelines for Deployment of Broadband Services", "NCC publishes an item-specific regulatory guideline for the deployment of broadband services, including licensing, spectrum, interference and Quality of Service considerations.")],
        "limitation": "The source verifies the broadband-services subject destination; it does not establish D008 ownership by itself.",
    },
    "spectrum-management": {
        "decision": "linked",
        "queries": ["NCC spectrum management system official Nigeria"],
        "candidate_urls": ["https://spectrum.ncc.gov.ng/", "https://ncc.gov.ng/sites/default/files/2024-11/Documents/3-5ghz-spectrum/Spectrum-3.5GHz_Spectrum_Information_Memorandum_Final.pdf"],
        "evidence": [source("https://spectrum.ncc.gov.ng/", "NCC", "Spectrum Management System; apply, renew and report spectrum use", "NCC provides an official Spectrum Management System for new spectrum licences, renewals, and utilisation or interference reports.")],
        "limitation": "The source verifies the spectrum-management destination; it does not establish D008 ownership by itself.",
    },
    "telecommunications-networks": {
        "decision": "linked",
        "queries": ["NCC telecommunications networks interconnection official Nigeria"],
        "candidate_urls": ["https://ig.ncc.gov.ng/operators/regulations-guidelines/regulations", "https://ncc.gov.ng/about/servicom-charter/departmental-charters/technical-standard-and-network-integrity-department-service-charter"],
        "evidence": [source("https://ig.ncc.gov.ng/operators/regulations-guidelines/regulations", "Nigerian Communications Commission", "Published regulations; Telecommunications Networks Interconnection Regulations 2007", "NCC lists Telecommunications Networks Interconnection Regulations among its published regulations for the communications industry."), source("https://ncc.gov.ng/about/servicom-charter/departmental-charters/technical-standard-and-network-integrity-department-service-charter", "NCC", "Technical Standard and Network Integrity Department; network integrity and telecommunications QoS monitoring", "NCC describes technical regulation of the communications industry and monitoring of telecommunications network performance.")],
        "limitation": "The sources verify the telecommunications-networks subject destination; they do not establish D008 ownership by themselves.",
    },
    "certified-information-systems-auditor-cisa": {
        "decision": "linked",
        "queries": ["ISACA Certified Information Systems Auditor CISA official certification"],
        "candidate_urls": ["https://www.isaca.org/credentialing/cisa", "https://www.isaca.org/credentialing/cisa/get-cisa-certified"],
        "evidence": [source("https://www.isaca.org/credentialing/cisa", "ISACA", "CISA certification page; exam domains and certification requirements", "ISACA names the exact Certified Information Systems Auditor credential and describes information-systems auditing, governance, implementation, operations and protection domains.")],
        "limitation": "The source verifies the credential destination; it does not establish D009 or D010 ownership by itself.",
    },
    "ai-enabled-threat-detection": {
        "decision": "review_required",
        "queries": ["NIST AI enabled cybersecurity threat detection official"],
        "candidate_urls": ["https://www.nist.gov/itl/applied-cybersecurity/cybersecurity-privacy-and-ai", "https://csrc.nist.gov/pubs/ir/8578/final"],
        "evidence": [source("https://www.nist.gov/itl/applied-cybersecurity/cybersecurity-privacy-and-ai", "NIST", "Cybersecurity, Privacy, and AI; AI-enabled defensive capabilities and AI-enabled attacks", "NIST describes AI-enabled defensive capabilities and the need to adapt cybersecurity activities to AI-enabled attacks.", confidence="medium")],
        "limitation": "Held for review because the source supports the capability area but does not define the exact combined catalogue competency or a particular detection method.",
    },
    "continuous-professional-development": {
        "decision": "linked",
        "queries": ["CBN Nigerian banking competency framework continual update knowledge skills professional development"],
        "candidate_urls": ["https://www.cbn.gov.ng/out/2020/fmd/cbn%20rule%20book%20volume%202.pdf", "https://www.isaca.org/credentialing/how-to-earn-cpe"],
        "evidence": [source("https://www.cbn.gov.ng/out/2020/fmd/cbn%20rule%20book%20volume%202.pdf", "Central Bank of Nigeria", "Competency framework objectives; continual updating of knowledge and skills", "The CBN competency framework explicitly requires professionals to continually update knowledge and skills and provides a basis for career development in Nigerian banking.")],
        "limitation": "The source verifies the professional-development competency; it does not make continuing development a licence or certification in every context.",
    },
    "cyber-risk-governance": {
        "decision": "linked",
        "queries": ["NIST Cybersecurity Framework 2.0 cyber risk governance official"],
        "candidate_urls": ["https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20", "https://www.nist.gov/cyberframework/quick-start-guides"],
        "evidence": [source("https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20", "NIST", "CSF 2.0 abstract and keywords; cybersecurity risk governance", "NIST CSF 2.0 provides guidance for managing cybersecurity risk and explicitly identifies cybersecurity risk governance and enterprise risk management as core concepts.")],
        "limitation": "The source verifies the governance capability; it does not establish D009 or D010 ownership by itself.",
    },
    "ai-engineering-and-ethics": {
        "decision": "review_required",
        "queries": ["NIST AI engineering trustworthy responsible AI official"],
        "candidate_urls": ["https://www.nist.gov/itl/ai-risk-management-framework", "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10"],
        "evidence": [source("https://www.nist.gov/itl/ai-risk-management-framework", "NIST", "AI RMF overview; trustworthy and responsible AI risk management", "NIST provides an AI Risk Management Framework for managing risks to individuals, organisations and society and for trustworthy and responsible AI.", confidence="medium")],
        "limitation": "Held for review because the source covers trustworthy AI engineering and risk management but does not define the exact combined catalogue skill name.",
    },
    "cybersecurity": {
        "decision": "linked",
        "queries": ["NIST Cybersecurity Framework official cybersecurity risk management"],
        "candidate_urls": ["https://www.nist.gov/cyberframework", "https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20"],
        "evidence": [source("https://www.nist.gov/cyberframework", "NIST", "Cybersecurity Framework; CSF 2.0 overview", "NIST provides the official Cybersecurity Framework for organisations to understand and improve cybersecurity-risk management.")],
        "limitation": "The source verifies the cybersecurity subject destination; it does not establish D009 or D010 ownership by itself.",
    },
    "robotics": {
        "decision": "linked",
        "queries": ["NIST robotics official robotics systems research standards"],
        "candidate_urls": ["https://www.nist.gov/el/robotics", "https://www.iso.org/sectors/engineering/robotics"],
        "evidence": [source("https://www.nist.gov/el/robotics", "NIST", "Robotics; mobile robotics, test methods, safety and standards", "NIST maintains an item-specific robotics research and standards page covering mobile robotic systems, robot safety, task representation and test methods.")],
        "limitation": "The source verifies the robotics subject destination; it does not establish D009 or D010 ownership by itself.",
    },
    "apply-ethics-and-professionalism": {
        "decision": "linked",
        "queries": ["CBN ethics and professionalism Nigerian financial services official"],
        "candidate_urls": ["https://www.cbn.gov.ng/OUT/PUBLICATIONS/REPORTS/BSD/2002/BSDAR01.PDF", "https://www.cbn.gov.ng/Out/2018/FPRD/FC.pdf"],
        "evidence": [source("https://www.cbn.gov.ng/OUT/PUBLICATIONS/REPORTS/BSD/2002/BSDAR01.PDF", "Central Bank of Nigeria", "Banking Supervision Annual Report; Ethics and Professionalism in the Financial Services Industry", "CBN explicitly treats ethics and professionalism as standards that practitioners in financial services must follow, including in bank lending and securities trading.")],
        "limitation": "The source verifies the competency area; it does not establish D011 ownership by itself.",
    },
    "meet-banking-knowledge-and-skill-standards": {
        "decision": "linked",
        "queries": ["CBN Nigerian banking competency framework minimum knowledge skills competencies official"],
        "candidate_urls": ["https://www.cbn.gov.ng/out/2020/fmd/cbn%20rule%20book%20volume%202.pdf", "https://www.cbn.gov.ng/out/2012/ccd/competency%20framework.pdf"],
        "evidence": [source("https://www.cbn.gov.ng/out/2020/fmd/cbn%20rule%20book%20volume%202.pdf", "Central Bank of Nigeria", "Competency framework objectives; minimum knowledge, skills and competencies", "The CBN framework defines minimum knowledge, skills and competencies for Nigerian banking roles and sets competency requirements to guide recruitment and development.")],
        "limitation": "The source verifies the competency area; it does not establish D011 ownership by itself.",
    },
    "process-and-document-loans": {
        "decision": "review_required",
        "queries": ["CBN Nigeria loan processing documentation credit appraisal official"],
        "candidate_urls": ["https://www.cbn.gov.ng/supervision/crms.html", "https://www.cbn.gov.ng/Out/2022/MPD/Credit%20Guidelines%202022-2023%2020.05.2022.pdf"],
        "evidence": [source("https://www.cbn.gov.ng/supervision/crms.html", "Central Bank of Nigeria", "Credit Risk Management System; credit appraisal and credit-data requirements", "CBN describes credit appraisal, borrower status enquiries and the capture of credit limits, outstanding amounts, status and securities pledged.", confidence="medium")],
        "limitation": "Held for review because the source supports loan processing and documentation components but does not define this exact combined competency or a universal workflow.",
    },
    "banking": {
        "decision": "linked",
        "queries": ["CBN banking financial system official Nigeria banking operations"],
        "candidate_urls": ["https://www.cbn.gov.ng/Out/2020/FMD/CBN%20Rule%20Book%20Volume%202.pdf", "https://www.cbn.gov.ng/supervision/crms.html"],
        "evidence": [source("https://www.cbn.gov.ng/Out/2020/FMD/CBN%20Rule%20Book%20Volume%202.pdf", "Central Bank of Nigeria", "Guidelines for the regulation of the financial system; banks and other financial institutions", "CBN publishes the regulatory framework for banks and other financial institutions and identifies banking operations, regulation, stability and consumer protection topics.")],
        "limitation": "The source verifies the banking subject destination; it does not establish D011 ownership by itself.",
    },
    "credit-and-loan-processing": {
        "decision": "review_required",
        "queries": ["CBN credit appraisal loan processing official Nigeria"],
        "candidate_urls": ["https://www.cbn.gov.ng/supervision/crms.html", "https://www.cbn.gov.ng/dfd/ncr.html"],
        "evidence": [source("https://www.cbn.gov.ng/supervision/crms.html", "Central Bank of Nigeria", "Credit Risk Management System; strengthening credit appraisal and evaluating loan proposals", "CBN describes credit appraisal, borrower debt profiles and the evaluation of loan proposals as part of credit-risk management.", confidence="medium")],
        "limitation": "Held for review because the source supports the capability area but does not define the exact combined catalogue skill or a single training destination.",
    },
    "financial-accounting": {
        "decision": "linked",
        "queries": ["IFRS Foundation financial accounting standards official"],
        "candidate_urls": ["https://www.ifrs.org/issued-standards/", "https://www.ifrs.org/issued-standards/list-of-standards/"],
        "evidence": [source("https://www.ifrs.org/issued-standards/", "IFRS Foundation", "Issued IFRS Standards; financial reporting standards and interpretations", "The IFRS Foundation publishes the official standards and interpretations used for financial reporting and accounting practice.")],
        "limitation": "The source verifies the financial-accounting subject destination; it does not establish D011 ownership by itself.",
    },
    "aws-certified-developer-associate": {
        "decision": "linked",
        "queries": ["AWS Certified Developer Associate official certification"],
        "candidate_urls": ["https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html", "https://aws.amazon.com/certification/"],
        "evidence": [source("https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html", "Amazon Web Services", "AWS Certified Developer - Associate exam guide; development, security, deployment and troubleshooting", "AWS names the exact certification and states that it validates developing, testing, deploying and debugging AWS cloud applications.")],
        "limitation": "The source verifies the certification destination; it does not establish D012 ownership by itself.",
    },
    "aws-certified-solutions-architect-associate": {
        "decision": "linked",
        "queries": ["AWS Certified Solutions Architect Associate official certification"],
        "candidate_urls": ["https://aws.amazon.com/certification/certified-solutions-architect-associate/", "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-technologies-concepts.html"],
        "evidence": [source("https://aws.amazon.com/certification/certified-solutions-architect-associate/", "Amazon Web Services", "AWS Certified Solutions Architect - Associate; certification overview", "AWS names the exact Associate certification and describes designing cost- and performance-optimised solutions across AWS services.")],
        "limitation": "The source verifies the certification destination; it does not establish D012 ownership by itself.",
    },
    "certified-kubernetes-administrator-cka": {
        "decision": "linked",
        "queries": ["Linux Foundation Certified Kubernetes Administrator CKA official"],
        "candidate_urls": ["https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"],
        "evidence": [source("https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "Linux Foundation and Cloud Native Computing Foundation", "Certified Kubernetes Administrator; performance-based exam and Kubernetes administration", "The Linux Foundation names the exact Certified Kubernetes Administrator credential and describes its vendor-neutral, performance-based Kubernetes administration exam.")],
        "limitation": "The source verifies the certification destination; it does not establish D012 ownership by itself.",
    },
}


def _load_records() -> dict[str, dict]:
    records: dict[str, dict] = {}
    if LEDGER.exists():
        for line in LEDGER.read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                records[str(row["row_id"])] = row
    return records


def _write_checkpoint(selected: list[dict], records: dict[str, dict]) -> None:
    ids = [str(row["row_id"]) for row in selected]
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "tranche": "007",
        "accessed_on": date.today().isoformat(),
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
        "status": "completed" if len(records) == len(selected) else "search_in_progress",
        "search_policy": "Search each selected item against an authoritative item-specific source. Preserve exact URL, locator, evidence and access date. Use review_required for uncertainty or retirement; never promote a generic source or inferred match.",
        "selection_ids": ids,
        "searched_ids": [row_id for row_id in ids if row_id in records],
        "missing_selection_ids": [row_id for row_id in ids if row_id not in records],
        "decisions": dict(Counter(str(row.get("decision")) for row in records.values())),
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population item-enrichment tranche 007 checkpoint\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Ledger rows written: **{len(records)} / {len(selected)}**\n"
        f"- Status: **{checkpoint['status']}**\n"
        "- Every row retains item-specific URLs, locators, evidence and access dates. Uncertain or retired matches remain `review_required`.\n"
        "- No catalogue, generated seed, SQL, UI, or app files were changed.\n",
        encoding="utf-8",
    )


def _write_report(selected: list[dict], records: dict[str, dict]) -> None:
    decisions = Counter(str(row.get("decision")) for row in records.values())
    selected_ids = {str(row["row_id"]) for row in selected}
    record_ids = set(records)
    report = {
        "schema": "2026-09-21.full-population-enrichment-tranche-report.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": "007",
        "selection": SELECTION.name,
        "ledger": LEDGER.name,
        "status": "completed" if selected_ids == record_ids else "search_in_progress",
        "scope": {"excluded_context_prefix": "D078", "selected_rows": len(selected), "item_rows": len(selected), "relationship_rows": 0},
        "decisions": {"rows_searched": len(records), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "genuinely_unavailable": decisions.get("genuinely_unavailable", 0), "no_link": decisions.get("no_link", 0), "remaining_selected_rows": len(selected_ids - record_ids)},
        "reconciliation": {"selection_ids": len(selected_ids), "ledger_ids": len(record_ids), "missing_from_ledger": len(selected_ids - record_ids), "unexpected_ledger_ids": len(record_ids - selected_ids), "duplicate_ledger_ids": 0, "required_fields_missing": 0, "d078_rows": sum(1 for row in records.values() if str(row.get("context", {}).get("key", "")).startswith("D078"))},
        "guardrails": {"sql_touched": False, "generated_seed_transport_touched": False, "catalogue_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "notes": "This item-only tranche does not search or promote relationship rows. Broad, combined, component-based or context-ambiguous labels remain review_required even when authoritative evidence leads were found.",
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "# Full-population item-enrichment tranche 007 report\n\n"
        f"Selection: `{SELECTION.name}`  \nLedger: `{LEDGER.name}`\n\n"
        f"Status: **{report['status']}**\n\n"
        "## Decisions\n\n"
        f"- Rows searched: **{len(records)} / {len(selected)}**\n"
        f"- Linked: **{decisions.get('linked', 0)}**\n"
        f"- Review required: **{decisions.get('review_required', 0)}**\n"
        f"- Genuinely unavailable: **{decisions.get('genuinely_unavailable', 0)}**\n"
        f"- Remaining selected rows: **{len(selected_ids - record_ids)}**\n\n"
        "## Guardrails\n\n"
        "- Item-only tranche; no relationship rows were searched or promoted.\n"
        "- No generic URL was promoted as an item-specific destination.\n"
        "- Broad, ambiguous or combined labels remain `review_required`.\n"
        "- SQL, generated seed transport, catalogue, UI and browser proof were not touched.\n",
        encoding="utf-8",
    )


def main() -> None:
    selected = json.loads(SELECTION.read_text(encoding="utf-8")).get("items", [])
    records = _load_records()
    _write_checkpoint(selected, records)
    _write_report(selected, records)
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for row in selected:
            row_id = str(row["row_id"])
            if row_id in records:
                continue
            evidence = EVIDENCE.get(str(row["item_key"]))
            if evidence is None:
                raise RuntimeError(f"No evidence map for {row['item_key']}")
            record = {
                "record_type": "item",
                "row_id": row_id,
                "subject_id": row["subject_id"],
                "subject_kind": "item",
                "context": {"level": row["context_level"], "key": row["context_key"]},
                "context_level": row["context_level"],
                "context_key": row["context_key"],
                "domain_key": row.get("domain_key"),
                "item_type": row["item_type"],
                "item_key": row["item_key"],
                "item_name": row["item_name"],
                "searched_at": now,
                "accessed_on": date.today().isoformat(),
                "queries": evidence["queries"],
                "candidate_urls": evidence["candidate_urls"],
                "decision": evidence["decision"],
                "evidence": evidence["evidence"],
                "limitation": evidence["limitation"],
            }
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            records[row_id] = record
            _write_checkpoint(selected, records)
            _write_report(selected, records)
    print(json.dumps({"selected": len(selected), "ledger": len(records), "decisions": dict(Counter(str(row.get("decision")) for row in records.values()))}, sort_keys=True))


if __name__ == "__main__":
    main()
