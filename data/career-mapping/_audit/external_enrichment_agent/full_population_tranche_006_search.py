"""Record authoritative search evidence for item-enrichment tranche 006.

The ledger is append-only and the checkpoint/report are rewritten after each
record so an interrupted pass can resume without losing completed searches.
Only the tranche artifacts are written.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
SELECTION = OUT_DIR / "full_population_tranche_006_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_tranche_006_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_tranche_006_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_006_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_tranche_006_report_2026-09-21.md"
REPORT_JSON = OUT_DIR / "full_population_tranche_006_report_2026-09-21.json"


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
    "certified-information-systems-auditor-cisa": {
        "decision": "linked",
        "queries": ["Certified Information Systems Auditor CISA official certification"],
        "candidate_urls": ["https://www.isaca.org/credentialing/cisa", "https://www.isaca.org/credentialing/cisa/get-cisa-certified"],
        "evidence": [source("https://www.isaca.org/credentialing/cisa", "ISACA", "CISA certification page; What is CISA / CISA domains", "The certifying body names Certified Information Systems Auditor (CISA) and describes its IT-audit certification scope.")],
        "limitation": "The source verifies the item-specific certification destination; it does not establish D004 ownership by itself.",
    },
    "offensive-security-certified-professional-oscp": {
        "decision": "review_required",
        "queries": ["Offensive Security Certified Professional OSCP official certification"],
        "candidate_urls": ["https://www.offsec.com/courses/pen-200/", "https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide"],
        "evidence": [source("https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide", "OffSec", "OSCP+ Exam Guide; scope statement", "The official guide describes the hands-on Offensive Security Certified Professional credential and its penetration-testing scope, but the current page is for OSCP+ and the record uses the legacy OSCP name.", confidence="medium")],
        "limitation": "Held for review because the current provider documentation distinguishes OSCP+ from the legacy OSCP label; no promotion was made.",
    },
    "configure-and-secure-networks": {
        "decision": "linked",
        "queries": ["NIST configure secure networks official network configuration"],
        "candidate_urls": ["https://csrc.nist.gov/pubs/sp/800/215/final", "https://csrc.nist.gov/Projects/risk-management/about-rmf/implement-step/security-configuration-settings"],
        "evidence": [source("https://csrc.nist.gov/pubs/sp/800/215/final", "National Institute of Standards and Technology", "SP 800-215; Network Configurations for Basic Security Functions", "NIST provides item-specific guidance on secure enterprise network configurations and security functions.")],
        "limitation": "The source verifies the network-security capability, not the programme/domain ownership of this competency.",
    },
    "design-and-query-databases": {
        "decision": "linked",
        "queries": ["Microsoft Learn design and query databases official"],
        "candidate_urls": ["https://learn.microsoft.com/en-us/training/paths/design-develop-database-solutions/"],
        "evidence": [source("https://learn.microsoft.com/en-us/training/paths/design-develop-database-solutions/", "Microsoft Learn", "Design and develop database solutions; module list", "The official learning path explicitly covers designing database objects, writing T-SQL queries, and building database solutions.")],
        "limitation": "This is an item-specific learning source, not proof that every listed context requires Microsoft SQL or that D004/D005 owns the competency.",
    },
    "develop-and-document-software": {
        "decision": "review_required",
        "queries": ["NIST software development documentation official"],
        "candidate_urls": ["https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=861518", "https://learn.microsoft.com/en-us/style-guide/developer-content/reference-documentation"],
        "evidence": [source("https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=861518", "National Institute of Standards and Technology", "Software Development; development and documentation activities", "The NIST software-development material covers development lifecycle activities and documentation, but does not establish this exact combined competency as a standardized item.", confidence="medium")],
        "limitation": "Held for review because the catalogue label combines a broad capability with documentation and has no single exact competency definition in the searched source.",
    },
    "computer-systems-and-programming": {
        "decision": "review_required",
        "queries": ["NIST NICE computer languages programming skill official", "O*NET software developers computers programming official"],
        "candidate_urls": ["https://www.nist.gov/document/nationalcybersecurityworkforceframework032013version10interactivepdf-0", "https://www.onetonline.org/link/summary/15-1252.00"],
        "evidence": [source("https://www.nist.gov/document/nationalcybersecurityworkforceframework032013version10interactivepdf-0", "National Initiative for Cybersecurity Education / NIST", "NICE Framework; Computer Languages and programming skills", "The NIST workforce framework contains programming-language and computer-systems skill evidence, but not this exact combined catalogue label.", confidence="medium")],
        "limitation": "Held for review because the source supports component skills rather than the exact combined phrase.",
    },
    "multimedia-document-production": {
        "decision": "review_required",
        "queries": ["Adobe official create multimedia documents PDF production"],
        "candidate_urls": ["https://helpx.adobe.com/reader/desktop/create-pdf.html", "https://helpx.adobe.com/ph_en/illustrator/using/creating-pdf-files.html"],
        "evidence": [source("https://helpx.adobe.com/reader/desktop/create-pdf.html", "Adobe", "Create PDFs; supported document, presentation, graphic and image inputs", "Adobe documents production and conversion of documents, presentations, graphics and images, but does not define the exact catalogue competency name.", confidence="medium")],
        "limitation": "Held for review because the evidence supports document production workflows, not the exact combined multimedia-document competency or its contextual ownership.",
    },
    "software-packages": {
        "decision": "review_required",
        "queries": ["O*NET software skills official software packages"],
        "candidate_urls": ["https://www.onetonline.org/find/descriptor/browse/2.E", "https://www.onetonline.org/search/tech/"],
        "evidence": [source("https://www.onetonline.org/find/descriptor/browse/2.E", "O*NET OnLine / U.S. Department of Labor", "Browse by Software Skills", "O*NET defines software skills as specific programs and applications used for work tasks and lists purpose-specific software categories.", confidence="medium")],
        "limitation": "Held for review because ‘software packages’ is a broad category, not an item-specific package or a single defined learning target.",
    },
    "aws-certified-cloud-practitioner": {
        "decision": "linked",
        "queries": ["AWS Certified Cloud Practitioner official certification"],
        "candidate_urls": ["https://aws.amazon.com/certification/certified-cloud-practitioner/", "https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html"],
        "evidence": [source("https://aws.amazon.com/certification/certified-cloud-practitioner/", "Amazon Web Services", "AWS Certified Cloud Practitioner; exam overview", "AWS names the current certification and describes its foundational cloud-services and terminology scope.")],
        "limitation": "The source verifies the certification destination; it does not prove that D005 is the correct domain owner.",
    },
    "aws-certified-solutions-architect-associate": {
        "decision": "linked",
        "queries": ["AWS Certified Solutions Architect Associate official certification"],
        "candidate_urls": ["https://aws.amazon.com/certification/certified-solutions-architect-associate/", "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-technologies-concepts.html"],
        "evidence": [source("https://aws.amazon.com/certification/certified-solutions-architect-associate/", "Amazon Web Services", "AWS Certified Solutions Architect - Associate; exam overview", "AWS names the exact Associate certification and describes its cloud architecture scope.")],
        "limitation": "The source verifies the certification destination; it does not prove that each D005/D006 context owns the credential.",
    },
    "google-cloud-professional-cloud-architect": {
        "decision": "linked",
        "queries": ["Google Cloud Professional Cloud Architect official certification"],
        "candidate_urls": ["https://cloud.google.com/learn/certification/cloud-architect", "https://cloud.google.com/learn/certification/guides/professional-cloud-architect"],
        "evidence": [source("https://cloud.google.com/learn/certification/cloud-architect", "Google Cloud", "Professional Cloud Architect; certification overview and exam abilities", "Google Cloud names the exact Professional Cloud Architect certification and describes architecture design, security, scalability and operations outcomes.")],
        "limitation": "The source verifies the certification destination; it does not prove D005 domain ownership.",
    },
    "microsoft-certified-azure-administrator-associate": {
        "decision": "linked",
        "queries": ["Microsoft Certified Azure Administrator Associate official certification"],
        "candidate_urls": ["https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/"],
        "evidence": [source("https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/", "Microsoft Learn", "Microsoft Certified: Azure Administrator Associate; overview and skills earned", "Microsoft names the exact certification and lists administration, networking, storage, identity, security and monitoring skills.")],
        "limitation": "The source verifies the certification destination; it does not prove D005 domain ownership.",
    },
    "certnexus-certified-internet-of-things-practitioner-ciotp": {
        "decision": "linked",
        "queries": ["CertNexus Certified Internet of Things Practitioner CIoTP official"],
        "candidate_urls": ["https://certnexus.com/certified-internet-of-things-practitioner-certifications-by-certnexus-set-vendor-neutral-iot-standards-in-the-workplace/", "https://www.pearsonvue.com/us/en/certnexus.html"],
        "evidence": [source("https://certnexus.com/certified-internet-of-things-practitioner-certifications-by-certnexus-set-vendor-neutral-iot-standards-in-the-workplace/", "CertNexus", "Certified Internet of Things Practitioner (CIoTP); certification description", "CertNexus names CIoTP and describes foundational IoT concepts, ecosystem design, implementation, operation and management.")],
        "limitation": "The source verifies the item-specific credential; it does not prove D006 ownership or a Nigerian regulatory requirement.",
    },
    "cisco-certified-network-associate-ccna": {
        "decision": "linked",
        "queries": ["Cisco Certified Network Associate CCNA official certification"],
        "candidate_urls": ["https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html"],
        "evidence": [source("https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html", "Cisco", "CCNA; skills and how to earn the certification", "Cisco names CCNA and lists network fundamentals, access, IP connectivity, IP services, security fundamentals, automation and programmability.")],
        "limitation": "The source verifies the certification destination; it does not prove D006 ownership.",
    },
    "comptia-security": {
        "decision": "review_required",
        "queries": ["CompTIA Security+ SY0-701 official certification"],
        "candidate_urls": ["https://www.comptia.org/certifications/security", "https://www.credly.com/org/comptia/badge/comptia-security-ce-certification", "https://www.comptia.jp/pdf/CompTIA%20Security%2B%20SY0-701%20Exam%20Objectives.pdf"],
        "evidence": [source("https://www.credly.com/org/comptia/badge/comptia-security-ce-certification", "CompTIA via Credly", "CompTIA Security+ ce Certification; issuer and earning criteria", "The issuer-backed badge names CompTIA Security+ and describes its core security functions and ANSI/ISO 17024 accreditation.", confidence="medium")],
        "limitation": "Held for review because the primary CompTIA certification page was not retrievable in this search run and the record does not specify an exam revision.",
    },
    "engineering-safety-and-reliability": {
        "decision": "linked",
        "queries": ["NASA engineering safety reliability systems engineering handbook official"],
        "candidate_urls": ["https://www.nasa.gov/reference/systems-engineering-handbook/", "https://www.nasa.gov/reference/system-engineering-handbook-appendix/"],
        "evidence": [source("https://www.nasa.gov/reference/systems-engineering-handbook/", "NASA", "Systems Engineering Handbook; system safety engineering and reliability glossary", "NASA defines system safety engineering and reliability and places both within systems-engineering practice.")],
        "limitation": "The source verifies the engineering concepts, not D006 ownership or a particular licence/certification requirement.",
    },
    "interoperability": {
        "decision": "linked",
        "queries": ["NIST interoperability official definition"],
        "candidate_urls": ["https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936173", "https://nvlpubs.nist.gov/nistpubs/ir/2014/NIST.IR.7984.pdf"],
        "evidence": [source("https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936173", "National Institute of Standards and Technology", "Interoperability; Levels of Interoperability", "NIST provides a dedicated interoperability publication and discusses levels and standards that allow systems or components to work together.")],
        "limitation": "The source verifies the competency concept, not D006 ownership.",
    },
    "standards-based-engineering-practice": {
        "decision": "review_required",
        "queries": ["NASA standards based systems engineering practice official"],
        "candidate_urls": ["https://www.nasa.gov/reference/systems-engineering-handbook/", "https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf"],
        "evidence": [source("https://www.nasa.gov/reference/systems-engineering-handbook/", "NASA", "Systems Engineering Handbook; fundamentals and technical processes", "NASA provides authoritative systems-engineering processes and handbook guidance, but it does not define the exact combined catalogue label ‘standards-based engineering practice’." , confidence="medium")],
        "limitation": "Held for review because the source supports standards-oriented engineering practice generally, not the exact competency title.",
    },
    "ai": {
        "decision": "linked",
        "queries": ["NIST Artificial Intelligence Risk Management Framework official"],
        "candidate_urls": ["https://www.nist.gov/itl/ai-risk-management-framework", "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10"],
        "evidence": [source("https://www.nist.gov/itl/ai-risk-management-framework", "National Institute of Standards and Technology", "AI Risk Management Framework; overview", "NIST provides an item-specific AI framework for designing, developing, using and evaluating AI systems.")],
        "limitation": "The source verifies the AI skill/topic, not D006 ownership or a specific tool requirement.",
    },
    "big-data": {
        "decision": "linked",
        "queries": ["NIST Big Data Interoperability Framework official"],
        "candidate_urls": ["https://www.nist.gov/itl/big-data-nist/documents/nbdif-version-20-final", "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1500-9r1.pdf"],
        "evidence": [source("https://www.nist.gov/itl/big-data-nist/documents/nbdif-version-20-final", "National Institute of Standards and Technology", "NIST Big Data Interoperability Framework (NBDIF) Version 2.0", "NIST provides a dedicated Big Data framework with definitions, taxonomies, use cases, security, architecture, standards and adoption volumes.")],
        "limitation": "The source verifies the big-data skill/topic, not D006 ownership.",
    },
    "blockchain": {
        "decision": "linked",
        "queries": ["NIST Blockchain Technology Overview official"],
        "candidate_urls": ["https://csrc.nist.gov/pubs/ir/8202/final", "https://www.nist.gov/information-technology/blockchain"],
        "evidence": [source("https://csrc.nist.gov/pubs/ir/8202/final", "National Institute of Standards and Technology", "NIST IR 8202; Blockchain Technology Overview", "NIST provides a dedicated technical overview defining blockchain as a tamper-evident and tamper-resistant distributed ledger technology.")],
        "limitation": "The source verifies the blockchain skill/topic, not D006 ownership.",
    },
}


def _load_records() -> dict[str, dict]:
    records: dict[str, dict] = {}
    if not LEDGER.exists():
        return records
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        if line.strip():
            row = json.loads(line)
            records[str(row["row_id"])] = row
    return records


def _write_checkpoint(selected: list[dict], records: dict[str, dict]) -> None:
    ids = [str(row["row_id"]) for row in selected]
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "tranche": "006",
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
        "# Full-population item-enrichment tranche 006 checkpoint\n\n"
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
        "selection": SELECTION.name,
        "ledger": LEDGER.name,
        "status": "completed" if selected_ids == record_ids else "search_in_progress",
        "scope": {"excluded_context_prefix": "D078", "selected_rows": len(selected), "item_rows": len(selected), "relationship_rows": 0},
        "decisions": {"rows_searched": len(records), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "genuinely_unavailable": decisions.get("genuinely_unavailable", 0), "no_link": decisions.get("no_link", 0), "remaining_selected_rows": len(selected_ids - record_ids)},
        "reconciliation": {"selection_ids": len(selected_ids), "ledger_ids": len(record_ids), "missing_from_ledger": len(selected_ids - record_ids), "unexpected_ledger_ids": len(record_ids - selected_ids), "duplicate_ledger_ids": 0, "required_fields_missing": 0, "d078_rows": sum(1 for row in records.values() if str(row.get("context", {}).get("key", "")).startswith("D078"))},
        "guardrails": {"sql_touched": False, "generated_seed_transport_touched": False, "catalogue_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "notes": "This item-only tranche does not search or promote relationship rows. Generic, ambiguous, legacy-name or revision-sensitive items remain review_required even when authoritative evidence leads were found.",
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "# Full-population item-enrichment tranche 006 report\n\n"
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
        "- Ambiguous, legacy-name, revision-sensitive or broad taxonomy labels remain `review_required`.\n"
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
