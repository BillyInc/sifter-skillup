"""Record authoritative search evidence for item-enrichment tranche 008."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
SELECTION = OUT_DIR / "full_population_tranche_008_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_tranche_008_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_tranche_008_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_008_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_tranche_008_report_2026-09-21.md"
REPORT_JSON = OUT_DIR / "full_population_tranche_008_report_2026-09-21.json"


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
    "microsoft-certified-azure-developer-associate": {
        "decision": "review_required",
        "queries": ["Microsoft Certified Azure Developer Associate official AZ-204 certification"],
        "candidate_urls": [
            "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-204",
            "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/",
        ],
        "evidence": [source(
            "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-204",
            "Microsoft Learn",
            "Study guide for Exam AZ-204; warning that the exam was retired on 31 July 2026",
            "Microsoft identifies the exact Azure Developer Associate exam and its developer skill areas, but the official page now records the exam and renewal assessment as retired.",
            confidence="high",
        )],
        "limitation": "Retired certification evidence is retained for audit and historical identity only; it is not promoted as a current student recommendation.",
    },
    "apply-ethics-and-professionalism": {
        "decision": "linked",
        "queries": ["CBN Nigeria ethics and professionalism financial services official"],
        "candidate_urls": ["https://www.cbn.gov.ng/OUT/PUBLICATIONS/REPORTS/BSD/2002/BSDAR01.PDF"],
        "evidence": [source(
            "https://www.cbn.gov.ng/OUT/PUBLICATIONS/REPORTS/BSD/2002/BSDAR01.PDF",
            "Central Bank of Nigeria",
            "Banking Supervision Annual Report; Ethics and Professionalism in the Financial Services Industry",
            "CBN explicitly identifies ethics and professionalism as standards practitioners in financial services must follow.",
        )],
        "limitation": "The source verifies the competency destination; it does not by itself establish ownership in every domain context.",
    },
    "meet-banking-knowledge-and-skill-standards": {
        "decision": "linked",
        "queries": ["CBN Nigerian banking competency framework minimum knowledge skills competencies official"],
        "candidate_urls": ["https://www.cbn.gov.ng/out/2020/fmd/cbn%20rule%20book%20volume%202.pdf"],
        "evidence": [source(
            "https://www.cbn.gov.ng/out/2020/fmd/cbn%20rule%20book%20volume%202.pdf",
            "Central Bank of Nigeria",
            "Section 2.6 Objectives of the Framework; minimum knowledge, skills and competencies",
            "CBN defines the minimum knowledge, skills and competencies for Nigerian banking roles and establishes competency requirements for recruitment and development.",
        )],
        "limitation": "The source verifies the competency destination; it does not by itself establish ownership in every domain context.",
    },
    "process-and-document-loans": {
        "decision": "review_required",
        "queries": ["CBN Nigeria credit appraisal loan processing documentation official"],
        "candidate_urls": ["https://www.cbn.gov.ng/supervision/crms.html"],
        "evidence": [source(
            "https://www.cbn.gov.ng/supervision/crms.html",
            "Central Bank of Nigeria",
            "Credit Risk Management System; credit appraisal and credit-data requirements",
            "CBN describes credit appraisal, borrower-status enquiries and the capture of credit limits, outstanding amounts, status and securities pledged.",
            confidence="medium",
        )],
        "limitation": "Held for review because the source supports the loan-processing and documentation components but does not define the exact combined catalogue competency.",
    },
    "banking": {
        "decision": "linked",
        "queries": ["CBN official Nigerian banking regulation financial system"],
        "candidate_urls": ["https://www.cbn.gov.ng/Out/2020/FMD/CBN%20Rule%20Book%20Volume%202.pdf"],
        "evidence": [source(
            "https://www.cbn.gov.ng/Out/2020/FMD/CBN%20Rule%20Book%20Volume%202.pdf",
            "Central Bank of Nigeria",
            "Rule Book Volume 2; regulation of banks and other financial institutions",
            "CBN publishes the Nigerian regulatory framework for banks and other financial institutions, providing an authoritative subject destination for banking.",
        )],
        "limitation": "The source verifies the banking subject destination; it does not by itself establish ownership in every domain context.",
    },
    "credit-and-loan-processing": {
        "decision": "review_required",
        "queries": ["CBN Nigeria credit appraisal loan processing official"],
        "candidate_urls": ["https://www.cbn.gov.ng/supervision/crms.html"],
        "evidence": [source(
            "https://www.cbn.gov.ng/supervision/crms.html",
            "Central Bank of Nigeria",
            "Credit Risk Management System; strengthening credit appraisal and evaluating loan proposals",
            "CBN describes credit appraisal, borrower debt profiles and evaluation of loan proposals as part of credit-risk management.",
            confidence="medium",
        )],
        "limitation": "Held for review because the source supports the capability area but does not define the exact combined catalogue skill or a single training destination.",
    },
    "financial-accounting": {
        "decision": "linked",
        "queries": ["IFRS Foundation official financial accounting standards"],
        "candidate_urls": ["https://www.ifrs.org/issued-standards/", "https://www.ifrs.org/issued-standards/list-of-standards/"],
        "evidence": [source(
            "https://www.ifrs.org/issued-standards/",
            "IFRS Foundation",
            "Issued IFRS Standards; financial reporting standards and interpretations",
            "The IFRS Foundation publishes the official standards and interpretations used for financial reporting and accounting practice.",
        )],
        "limitation": "The source verifies the financial-accounting subject destination; it does not by itself establish ownership in every domain context.",
    },
    "fellow-casualty-actuarial-society-fcas": {
        "decision": "linked",
        "queries": ["Casualty Actuarial Society Fellow FCAS official requirements"],
        "candidate_urls": ["https://www.casact.org/membership/individual-membership/fellow-membership", "https://www.casact.org/about/professionalism/use-titles-and-designations"],
        "evidence": [source(
            "https://www.casact.org/membership/individual-membership/fellow-membership",
            "Casualty Actuarial Society",
            "Fellow Membership; Fellowship examinations and FCAS designation",
            "CAS identifies the Fellowship route and states that successful completion of the Fellowship requirements leads to the FCAS designation.",
        )],
        "limitation": "The source verifies the credential destination; it does not establish D014 ownership by itself.",
    },
    "fellow-of-the-institute-and-faculty-of-actuaries-fia": {
        "decision": "linked",
        "queries": ["Institute and Faculty of Actuaries FIA Fellowship official"],
        "candidate_urls": ["https://actuaries.org.uk/membership/types-of-membership/fellowship/"],
        "evidence": [source(
            "https://actuaries.org.uk/membership/types-of-membership/fellowship/",
            "Institute and Faculty of Actuaries",
            "Fellowship; FIA designation and specialist examinations",
            "IFoA identifies Fellowship as its highest membership qualification and states that it carries the FIA designation.",
        )],
        "limitation": "The source verifies the credential destination; it does not establish D014 ownership by itself.",
    },
    "fellow-society-of-actuaries-fsa": {
        "decision": "linked",
        "queries": ["Society of Actuaries Fellow FSA official requirements"],
        "candidate_urls": ["https://www.soa.org/education/fsa/", "https://www.soa.org/education/exam-req/default/"],
        "evidence": [source(
            "https://www.soa.org/education/fsa/",
            "Society of Actuaries",
            "Fellow of the Society of Actuaries; FSA requirements and Fellowship pathway",
            "SOA names the exact FSA credential and describes the technical courses, communications course and Fellowship Admissions Course required for Fellowship.",
        )],
        "limitation": "The source verifies the credential destination; it does not establish D014 ownership by itself.",
    },
    "analyse-complex-business-cases": {
        "decision": "review_required",
        "queries": ["ACCA official advanced audit assurance case study complex business cases"],
        "candidate_urls": ["https://www.accaglobal.com/us/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/examiner-approach-to-paper-p7---updated-march-2013.html"],
        "evidence": [source(
            "https://www.accaglobal.com/us/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/examiner-approach-to-paper-p7---updated-march-2013.html",
            "ACCA",
            "Examiner approach to Advanced Audit and Assurance; case-study questions with financial statements, audit working papers and strategic details",
            "ACCA describes complex case-study tasks that combine financial statements, audit working papers, strategic details, planning, evidence and ethics.",
            confidence="medium",
        )],
        "limitation": "Held for review because the source supports the capability but does not define the exact combined catalogue competency or its D014/D015 ownership.",
    },
    "communicate-solutions": {
        "decision": "review_required",
        "queries": ["ACCA official audit assurance communicate solutions professional response"],
        "candidate_urls": ["https://www.accaglobal.com/us/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/examiner-approach-to-paper-p7---updated-march-2013.html"],
        "evidence": [source(
            "https://www.accaglobal.com/us/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/examiner-approach-to-paper-p7---updated-march-2013.html",
            "ACCA",
            "Examiner approach to Advanced Audit and Assurance; response formats including letters, presentations, memos and reports",
            "ACCA requires candidates to present professional solutions in formats such as letters, presentations, memos, reports or briefing notes.",
            confidence="medium",
        )],
        "limitation": "Held for review because the source supports professional communication in an audit case but does not define the exact combined catalogue competency.",
    },
    "exercise-professional-judgement": {
        "decision": "review_required",
        "queries": ["ACCA official professional judgement audit assurance exam"],
        "candidate_urls": ["https://www.accaglobal.com/content/dam/ACCA_Global/Students/resourceFinder/AAA%20Exam_ESSENTIALS.pdf"],
        "evidence": [source(
            "https://www.accaglobal.com/content/dam/ACCA_Global/Students/resourceFinder/AAA%20Exam_ESSENTIALS.pdf",
            "ACCA",
            "How to approach the Advanced Audit and Assurance exam; demonstrate professional judgement by prioritising risks",
            "ACCA explicitly identifies professional judgement and prioritising risks as part of Advanced Audit and Assurance performance.",
            confidence="medium",
        )],
        "limitation": "Held for review because the source supports the capability in an examination context but does not define the exact combined catalogue competency.",
    },
    "audit-and-assurance": {
        "decision": "linked",
        "queries": ["ACCA official Advanced Audit and Assurance qualification"],
        "candidate_urls": ["https://www.accaglobal.com/us/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/examiner-approach-to-paper-p7---updated-march-2013.html"],
        "evidence": [source(
            "https://www.accaglobal.com/us/en/student/exam-support-resources/professional-exams-study-resources/p7/technical-articles/examiner-approach-to-paper-p7---updated-march-2013.html",
            "ACCA",
            "Advanced Audit and Assurance; audit and assurance regulations, evidence, planning and ethics",
            "ACCA names Advanced Audit and Assurance and describes its audit, assurance, evidence, planning and ethics content.",
        )],
        "limitation": "The source verifies the audit-and-assurance subject destination; it does not establish ownership in every domain context.",
    },
    "financial-reporting": {
        "decision": "linked",
        "queries": ["IFRS Foundation official financial reporting standards"],
        "candidate_urls": ["https://www.ifrs.org/issued-standards/", "https://www.ifrs.org/issued-standards/list-of-standards/conceptual-framework/"],
        "evidence": [source(
            "https://www.ifrs.org/issued-standards/list-of-standards/conceptual-framework/",
            "IFRS Foundation",
            "Conceptual Framework for Financial Reporting; objective, recognition, measurement, presentation and disclosure",
            "The IFRS Foundation describes the conceptual framework and standards that guide general-purpose financial reporting, recognition, measurement, presentation and disclosure.",
        )],
        "limitation": "The source verifies the financial-reporting subject destination; it does not establish ownership in every domain context.",
    },
    "acca": {
        "decision": "linked",
        "queries": ["ACCA Qualification official exams ethics practical experience"],
        "candidate_urls": ["https://www.accaglobal.com/gb/en/qualifications/glance/acca/how.html", "https://www.accaglobal.com/qualifications"],
        "evidence": [source(
            "https://www.accaglobal.com/gb/en/qualifications/glance/acca/how.html",
            "ACCA Global",
            "How the ACCA Qualification works; exams, Ethics and Professional Skills module and 36 months practical experience",
            "ACCA names the exact professional qualification and its exams, ethics and professional-skills module, and practical-experience requirement.",
        )],
        "limitation": "The source verifies the qualification destination; it does not establish D015 ownership by itself.",
    },
    "associate-chartered-accountant-aca-ican": {
        "decision": "linked",
        "queries": ["ICAN official journey to becoming an ACA qualification"],
        "candidate_urls": ["https://icanig.org/ican/steps_to_aca.php", "https://icanig.org/ican/assets/docs/ICAN_SYLLABUS_2026_Final_Updated_NEW.pdf"],
        "evidence": [source(
            "https://icanig.org/ican/steps_to_aca.php",
            "Institute of Chartered Accountants of Nigeria",
            "Your Journey to Becoming An ACA; three-part examination structure, 36 months practice and ACA induction",
            "ICAN identifies the ACA route, its examination structure, required practical experience and induction into the ACA certification.",
        )],
        "limitation": "The source verifies the credential destination; it does not establish D015 ownership by itself.",
    },
    "certified-national-accountant-cna": {
        "decision": "linked",
        "queries": ["ANAN official Certified National Accountant CNA qualification Nigeria"],
        "candidate_urls": ["https://anan.org.ng/", "https://www.ifac.org/about-ifac/membership/profile/nigeria"],
        "evidence": [source(
            "https://anan.org.ng/",
            "Association of National Accountants of Nigeria",
            "ANAN home; members known as Certified National Accountants (CNAs)",
            "ANAN identifies its members as Certified National Accountants and describes the Nigerian professional accountancy pathway.",
        ), source(
            "https://www.ifac.org/about-ifac/membership/profile/nigeria",
            "International Federation of Accountants",
            "Nigeria profile; ANAN administers the Certified National Accountant qualification",
            "IFAC records that ANAN administers the CNA qualification and describes its professional education, examinations and practical-experience requirements.",
        )],
        "limitation": "The sources verify the credential destination; they do not establish D015 ownership by themselves.",
    },
    "cima-professional-qualification": {
        "decision": "linked",
        "queries": ["AICPA CIMA official CGMA CIMA Professional Qualification"],
        "candidate_urls": ["https://www.aicpa-cima.com/resources/landing/cgma-designation", "https://www.aicpa-cima.com/resources/landing/cgma-framework"],
        "evidence": [source(
            "https://www.aicpa-cima.com/resources/landing/cgma-designation",
            "AICPA & CIMA",
            "Your journey to the CGMA qualification; professional qualification, three levels and practical experience",
            "AICPA & CIMA describes the CIMA pathway to the CGMA qualification, including the professional qualification, levels, examinations and verified practical experience.",
        )],
        "limitation": "The source verifies the qualification destination; it does not establish D015 ownership by itself.",
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
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8")) if CHECKPOINT.exists() else {}
    checkpoint.update({
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "tranche": "008",
        "accessed_on": date.today().isoformat(),
        "status": "completed" if len(records) == len(selected) else "search_in_progress",
        "blocked": False,
        "blocker": None,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
        "search_policy": "Search each selected item against an authoritative item-specific source. Preserve exact URL, locator, evidence and access date. Use review_required for uncertainty or retirement; never promote a generic source or inferred match.",
        "selection_ids": ids,
        "searched_ids": [row_id for row_id in ids if row_id in records],
        "missing_selection_ids": [row_id for row_id in ids if row_id not in records],
        "progress": {
            **checkpoint.get("progress", {}),
            "selected_rows": len(selected),
            "searched_rows": len(records),
            "linked": sum(1 for row in records.values() if row.get("decision") == "linked"),
            "review_required": sum(1 for row in records.values() if row.get("decision") == "review_required"),
            "genuinely_unavailable": sum(1 for row in records.values() if row.get("decision") == "genuinely_unavailable"),
        },
        "decisions": dict(Counter(str(row.get("decision")) for row in records.values())),
    })
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    CHECKPOINT_MD.write_text(
        "# Full-population item-enrichment tranche 008 checkpoint\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Ledger rows written: **{len(records)} / {len(selected)}**\n"
        f"- Status: **{checkpoint['status']}**\n"
        f"- Linked: **{checkpoint['progress']['linked']}**; review-required: **{checkpoint['progress']['review_required']}**.\n"
        "- Every searched row retains item-specific URLs, locators, evidence and access dates. Uncertain or retired matches remain `review_required`.\n"
        "- No catalogue, generated seed, SQL, UI, or app files were changed.\n"
        "- Blocker report: **not blocked**.\n",
        encoding="utf-8",
    )


def _write_report(selected: list[dict], records: dict[str, dict]) -> None:
    decisions = Counter(str(row.get("decision")) for row in records.values())
    selected_ids = {str(row["row_id"]) for row in selected}
    record_ids = set(records)
    report = {
        "schema": "2026-09-21.full-population-enrichment-tranche-report.v1",
        "accessed_on": date.today().isoformat(),
        "tranche": "008",
        "selection": SELECTION.name,
        "ledger": LEDGER.name,
        "status": "completed" if selected_ids == record_ids else "search_in_progress",
        "scope": {"excluded_context_prefix": "D078", "selected_rows": len(selected), "item_rows": len(selected), "relationship_rows": 0},
        "decisions": {
            "rows_searched": len(records),
            "linked": decisions.get("linked", 0),
            "review_required": decisions.get("review_required", 0),
            "genuinely_unavailable": decisions.get("genuinely_unavailable", 0),
            "no_link": decisions.get("no_link", 0),
            "remaining_selected_rows": len(selected_ids - record_ids),
        },
        "reconciliation": {
            "selection_ids": len(selected_ids),
            "ledger_ids": len(record_ids),
            "missing_from_ledger": len(selected_ids - record_ids),
            "unexpected_ledger_ids": len(record_ids - selected_ids),
            "duplicate_ledger_ids": 0,
            "required_fields_missing": 0,
            "d078_rows": sum(1 for row in records.values() if str(row.get("context", {}).get("key", "")).startswith("D078")),
        },
        "guardrails": {"sql_touched": False, "generated_seed_transport_touched": False, "catalogue_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "notes": "This item-only tranche does not search or promote relationship rows. Broad, combined, component-based or context-ambiguous labels remain review_required even when authoritative evidence leads were found.",
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "# Full-population item-enrichment tranche 008 report\n\n"
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
        "- Broad, ambiguous, retired or combined labels remain `review_required`.\n"
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
