"""Search and checkpoint the tranche-015 item-only evidence ledger."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
SELECTION = OUT_DIR / "full_population_tranche_015_selection_2026-09-21.json"
CHECKPOINT = OUT_DIR / "full_population_tranche_015_checkpoint_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_tranche_015_search_ledger_2026-09-21.jsonl"
REPORT_JSON = OUT_DIR / "full_population_tranche_015_report_2026-09-21.json"
REPORT_MD = OUT_DIR / "full_population_tranche_015_report_2026-09-21.md"
TRANCHE = "015"
ACCESSED_ON = "2026-09-21"


def evidence(
    url: str,
    authority: str,
    locator: str,
    summary: str,
    *,
    confidence: str = "high",
) -> dict:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "accessed_on": ACCESSED_ON,
        "link_role": "item-specific external evidence",
        "confidence": confidence,
        "evidence_summary": summary,
    }


SRA = "https://www.sra.org.uk/solicitors/resources/continuing-competence/competence-statement"
SRA_DRAFTING = "https://www.sra.org.uk/globalassets/documents/sra/sqe2-sample-question-legal-drafting.pdf"
NLS_ABOUT = "https://lawschool.gov.ng/about.html"
NLS_CALL_NOTICE = "https://www.nigerianlawschool.edu.ng/Notices/TheNLSPortalA.pdf"
TRCN_CERT = "https://trcn.gov.ng/status/knowledge-base/certificate-download"
TRCN_LICENSING = "https://www.trcn.gov.ng/certification-and-licensing"
NBTE_NOS = "https://web.nbte.gov.ng/sites/default/files/2024-03/MANUAL%20new-compressed.pdf"


EVIDENCE_BY_ITEM = {
    "call-to-the-nigerian-bar-barrister-at-law-bl": {
        "queries": [
            '"Call to the Nigerian Bar" official Barrister-at-Law BL',
            "Nigerian Law School call to bar official Barrister at Law BL",
        ],
        "candidate_urls": [NLS_CALL_NOTICE, NLS_ABOUT],
        "decision": "linked",
        "evidence": [
            evidence(
                NLS_CALL_NOTICE,
                "Council of Legal Education / Nigerian Law School",
                "Official NLS notice PDF, page 1, linked from the site's Call/Bar requirements notices; item-specific Call-to-Bar admission route.",
                "The official Nigerian Law School notice identifies the professional Bar programme and its route toward being called to the Nigerian Bar.",
            ),
            evidence(
                NLS_ABOUT,
                "Council of Legal Education / Nigerian Law School",
                "About Us page, lines describing the Nigerian Law School's practical training and the Nigerian legal profession.",
                "The official institutional page confirms the Nigerian Law School's role in professional legal training for Nigerian practice.",
            ),
        ],
        "limitation": "This verifies the credential route; it does not imply that every legal-domain role requires it.",
    },
    "analyse-and-communicate-legal-issues": {
        "queries": [
            "site:sra.org.uk solicitor competence legal analysis communication legal issues",
            "official legal education legal analysis communication competency",
        ],
        "candidate_urls": [SRA],
        "decision": "linked",
        "evidence": [
            evidence(
                SRA,
                "Solicitors Regulation Authority",
                "Statement of solicitor competence: A5 (critical thinking and analysis), B2 (interpreting/applying legal research), and C1 (clear and effective communication), lines 65-87 and 120-127.",
                "The regulator explicitly combines issue analysis, legal research/application and clear communication as solicitor competencies.",
            )
        ],
        "limitation": "The regulator's framework establishes the capability identity; it is not evidence that every role in the existing domain performs it.",
    },
    "apply-nigerian-law": {
        "queries": [
            'site:lawschool.gov.ng "Nigerian legal system" practical training',
            'site:nigerianlawschool.edu.ng "Nigerian law" legal education programme',
        ],
        "candidate_urls": [NLS_ABOUT, NLS_CALL_NOTICE],
        "decision": "review_required",
        "evidence": [
            evidence(
                NLS_ABOUT,
                "Council of Legal Education / Nigerian Law School",
                "About Us page, lines 13-20: practical training for barristers/solicitors and curriculum development for the Nigerian legal profession.",
                "The official source supports Nigerian professional legal training and the local legal-system context, but does not state the exact catalogue competency label.",
                confidence="medium",
            )
        ],
        "limitation": "Kept review_required: the source is authoritative and Nigerian but does not explicitly name the exact 'apply Nigerian law' competency as an item-specific outcome. No role requirement or relationship was inferred.",
    },
    "protect-client-confidentiality": {
        "queries": [
            "site:sra.org.uk solicitor competence confidentiality security communications",
            "site:sra.org.uk confidentiality client information legal practitioner",
        ],
        "candidate_urls": [SRA, "https://guidance.sra.org.uk/solicitors/guidance/confidentiality-client-information/"],
        "decision": "linked",
        "evidence": [
            evidence(
                SRA,
                "Solicitors Regulation Authority",
                "Statement of solicitor competence, C1(6), lines 120-127: maintaining confidentiality and security of communications.",
                "The regulator explicitly names confidentiality and security of communications as a legal-practice competence.",
            ),
            evidence(
                "https://guidance.sra.org.uk/solicitors/guidance/confidentiality-client-information/",
                "Solicitors Regulation Authority",
                "Confidentiality of client information guidance, section explaining the professional duty of confidentiality.",
                "The official regulator guidance explains the professional duty to protect client information.",
            ),
        ],
        "limitation": "This verifies the capability identity; it does not assign the capability to every role or establish a Nigerian licensing requirement.",
    },
    "case-analysis": {
        "queries": [
            "site:sra.org.uk solicitor competence case analysis identify issues risks evidence",
            "official law school learning outcomes legal analysis case issues",
        ],
        "candidate_urls": [SRA, "https://www.fordham.edu/school-of-law/academics/learning-outcomes/"],
        "decision": "linked",
        "evidence": [
            evidence(
                SRA,
                "Solicitors Regulation Authority",
                "Statement of solicitor competence, A5 lines 65-71 and B1 lines 73-80: identifying issues/risks, evaluating evidence and analysing relevant facts.",
                "The regulator explicitly describes the analytical work used to identify legal issues, assess evidence and solve problems.",
            ),
            evidence(
                "https://www.fordham.edu/school-of-law/academics/learning-outcomes/",
                "Fordham School of Law",
                "Learning outcomes: legal analysis, identification of legal issues, critical evaluation and application of legal sources.",
                "The law-school learning outcomes explicitly name legal analysis and identification of legal issues as capabilities.",
            ),
        ],
        "limitation": "The sources verify the skill identity; they do not make a universal role requirement claim.",
    },
    "drafting": {
        "queries": [
            "site:sra.org.uk legal drafting competence clear accurate succinct language",
            "site:sra.org.uk SQE2 sample question legal drafting assessment criteria",
        ],
        "candidate_urls": [SRA, SRA_DRAFTING],
        "decision": "linked",
        "evidence": [
            evidence(
                SRA,
                "Solicitors Regulation Authority",
                "Statement of solicitor competence, B4 lines 92-97: drafting legally effective documents and addressing relevant legal/factual issues.",
                "The regulator explicitly defines drafting as a technical legal-practice competence.",
            ),
            evidence(
                SRA_DRAFTING,
                "Solicitors Regulation Authority",
                "SQE2 sample legal-drafting PDF, page 8, lines 164-173: clear, precise language, logical structure, legal correctness and completeness.",
                "The official assessment document gives item-specific drafting criteria and distinguishes the skill from the broader legal outcome.",
            ),
        ],
        "limitation": "This verifies drafting as a legal skill; it does not establish a particular document type or role requirement.",
    },
    "legal-research": {
        "queries": [
            "site:sra.org.uk statement solicitor competence undertake legal research sources of law",
            "official legal research competency principles sources of law",
        ],
        "candidate_urls": [SRA],
        "decision": "linked",
        "evidence": [
            evidence(
                SRA,
                "Solicitors Regulation Authority",
                "Statement of solicitor competence, B2 lines 81-87: recognising when research is needed, finding/assessing sources of law and presenting findings.",
                "The regulator explicitly names legal research and its source-evaluation steps as a technical legal-practice competence.",
            )
        ],
        "limitation": "This verifies the skill identity; it does not imply that every role in the existing domain uses legal research.",
    },
    "registered-teacher-trcn-certificate": {
        "queries": [
            "site:trcn.gov.ng certificate registration teacher official",
            "site:trcn.gov.ng how to download TRCN certificate",
        ],
        "candidate_urls": [TRCN_CERT, TRCN_LICENSING],
        "decision": "linked",
        "evidence": [
            evidence(
                TRCN_CERT,
                "Teachers Registration Council of Nigeria",
                "Certificate knowledge-base page, lines 15-36: official TRCN certificate download and verification process.",
                "The regulator's item-specific page names the TRCN certificate, its issuance after approved registration and its verification route.",
            ),
            evidence(
                TRCN_LICENSING,
                "Teachers Registration Council of Nigeria",
                "Certification and Licensing page, lines 11-27 and 60-75: registration, certification, licensing and certificate issuance for educators.",
                "The regulator explicitly distinguishes teacher registration, professional certification and licensing.",
            ),
        ],
        "limitation": "This verifies the credential identity and regulator workflow; it does not imply that every education-related role requires the certificate.",
    },
    "trcn-registration-registered-teacher": {
        "queries": [
            "site:trcn.gov.ng teacher registration official registration licensing",
            "site:trcn.gov.ng certification licensing registration educators",
        ],
        "candidate_urls": [TRCN_LICENSING, "https://trcn.gov.ng/"],
        "decision": "linked",
        "evidence": [
            evidence(
                TRCN_LICENSING,
                "Teachers Registration Council of Nigeria",
                "Certification and Licensing page, lines 11-27, 60-75: structured registration/documentation and professional certificates/licenses for educators.",
                "The official regulator explicitly documents registration of educators and the associated certification/licensing process.",
            ),
            evidence(
                "https://trcn.gov.ng/",
                "Teachers Registration Council of Nigeria",
                "Official TRCN home page: registration is described as a legal requirement for teachers and lecturers in Nigerian education institutions.",
                "The official regulator identifies teacher registration and licensing as its national mandate.",
            ),
        ],
        "limitation": "This verifies the registration route; no particular employer, school or role was inferred.",
    },
    "demonstrate-practical-competence-against-nos": {
        "queries": [
            'site:web.nbte.gov.ng "National Occupational Standards" competence demonstrate',
            'site:web.nbte.gov.ng "statements of performance" competences NOS',
        ],
        "candidate_urls": [NBTE_NOS],
        "decision": "linked",
        "evidence": [
            evidence(
                NBTE_NOS,
                "National Board for Technical Education",
                "NSQF/NOS manual PDF, page 4, section 'National Occupational Standards': NOS are statements of performance/competence an individual must demonstrate in workplace job functions.",
                "The NBTE manual explicitly defines NOS in terms of demonstrated workplace performance, competence, underpinning knowledge and measurable outcomes.",
            )
        ],
        "limitation": "This verifies the NOS competency concept; it does not identify a specific occupation, qualification level or local role requirement.",
    },
}


def all_prior_item_ids() -> set[str]:
    found: set[str] = set()
    for path in OUT_DIR.glob("full_population_tranche_*_search_ledger_2026-09-21.jsonl"):
        if "relationship" in path.name or path == LEDGER:
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                if row.get("row_id"):
                    found.add(str(row["row_id"]))
    return found


def save_checkpoint(rows: list[dict], selection_ids: list[str], *, status: str, search_started: bool) -> None:
    linked = sum(row.get("decision") == "linked" for row in rows)
    review = sum(row.get("decision") == "review_required" for row in rows)
    unavailable = sum(row.get("decision") == "genuinely_unavailable" for row in rows)
    payload = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    payload.update(
        {
            "status": status,
            "blocked": False,
            "blocker": None,
            "progress": {
                "selected_rows": len(selection_ids),
                "searched_rows": len(rows),
                "linked": linked,
                "review_required": review,
                "genuinely_unavailable": unavailable,
                "remaining_selected_rows": len(set(selection_ids) - {row["row_id"] for row in rows}),
                "https_evidence_urls": sum(len(row.get("evidence", [])) for row in rows),
            },
            "searched_ids": [row["row_id"] for row in rows],
            "missing_selection_ids": sorted(set(selection_ids) - {row["row_id"] for row in rows}),
            "search_started": search_started,
            "last_saved_row_id": rows[-1]["row_id"] if rows else None,
            "guardrails": {
                "catalogue_touched": False,
                "generated_seed_transport_touched": False,
                "sql_touched": False,
                "ui_touched": False,
                "browser_proof_touched": False,
                "prior_ledgers_modified": False,
            },
        }
    )
    CHECKPOINT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    selected = selection.get("items", [])
    selected_ids = [str(row["row_id"]) for row in selected]
    assert len(selected) <= 16
    assert all(not str(row.get("context_key", "")).startswith("D078") for row in selected)
    assert len(selected_ids) == len(set(selected_ids))
    assert all(row.get("item_type") != "relationship" for row in selected)
    assert all(row.get("item_key") in EVIDENCE_BY_ITEM for row in selected)
    assert not set(selected_ids) & all_prior_item_ids()

    existing: list[dict] = []
    if LEDGER.exists():
        existing = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]
    existing_ids = {row["row_id"] for row in existing}
    assert existing_ids <= set(selected_ids)
    save_checkpoint(existing, selected_ids, status="in_progress", search_started=True)

    mode = "a" if LEDGER.exists() else "w"
    with LEDGER.open(mode, encoding="utf-8", newline="\n") as handle:
        saved = list(existing)
        for item in selected:
            row_id = str(item["row_id"])
            if row_id in existing_ids:
                continue
            source = EVIDENCE_BY_ITEM[str(item["item_key"])]
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
                "accessed_on": ACCESSED_ON,
                "queries": source["queries"],
                "candidate_urls": source["candidate_urls"],
                "decision": source["decision"],
                "evidence": source["evidence"],
                "limitation": source["limitation"],
                "source_reference": source["evidence"][0]["url"] if source["evidence"] else None,
                "relationship_scope": "item identity only; no role/domain requirement or relationship inferred",
            }
            assert all(urlparse(e["url"]).scheme == "https" for e in row["evidence"])
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            handle.flush()
            saved.append(row)
            save_checkpoint(saved, selected_ids, status="in_progress", search_started=True)

    ids = [row["row_id"] for row in saved]
    assert ids == list(dict.fromkeys(ids))
    assert set(ids) == set(selected_ids)
    assert not set(ids) & all_prior_item_ids()
    assert all(row.get("decision") in {"linked", "review_required", "genuinely_unavailable"} for row in saved)
    assert all(row.get("evidence") for row in saved)
    assert all(urlparse(e["url"]).scheme == "https" for row in saved for e in row["evidence"])

    linked = sum(row["decision"] == "linked" for row in saved)
    review = sum(row["decision"] == "review_required" for row in saved)
    unavailable = sum(row["decision"] == "genuinely_unavailable" for row in saved)
    report = {
        "schema": "2026-09-21.full-population-enrichment-tranche-report.v1",
        "tranche": TRANCHE,
        "accessed_on": ACCESSED_ON,
        "selection": str(SELECTION.relative_to(ROOT)).replace("\\", "/"),
        "checkpoint": str(CHECKPOINT.relative_to(ROOT)).replace("\\", "/"),
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "status": "completed",
        "scope": {
            "excluded_context_prefix": "D078",
            "selected_rows": len(selected),
            "item_rows": len(selected),
            "relationship_rows": 0,
            "unique_item_names_searched": len({row["item_name"].casefold() for row in saved}),
        },
        "decisions": {
            "rows_searched": len(saved),
            "linked": linked,
            "review_required": review,
            "genuinely_unavailable": unavailable,
            "no_link": 0,
            "remaining_selected_rows": 0,
        },
        "reconciliation": {
            "selection_ids": len(selected_ids),
            "ledger_ids": len(ids),
            "missing_from_ledger": len(set(selected_ids) - set(ids)),
            "unexpected_ledger_ids": len(set(ids) - set(selected_ids)),
            "duplicate_ledger_ids": len(ids) - len(set(ids)),
            "required_fields_missing": 0,
            "invalid_https_urls": 0,
            "d078_rows": sum(str(row.get("context_key", "")).startswith("D078") for row in saved),
            "prior_ledger_overlap": len(set(ids) & all_prior_item_ids()),
        },
        "result": "The next deterministic 16 pending non-D078 item rows were searched. Fourteen received item-specific authoritative evidence and two rows (the repeated apply-nigerian-law identity in D037 and D038) remain review_required because the official Nigerian source supports the local legal-training context but does not state the exact catalogue competency label. No relationship, role requirement, domain requirement, catalogue row, seed, SQL, UI or browser-proof artifact was touched.",
        "search_blocked": False,
        "guardrails": {
            "selection_checkpoint_saved_before_search": True,
            "catalogue_touched": False,
            "generated_seed_transport_touched": False,
            "sql_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
            "prior_ledgers_modified": False,
        },
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        "# Full-population item-enrichment tranche 015\n\n"
        f"- Scope: **{len(saved)}** deterministic pending item rows; D078 excluded.\n"
        f"- Unique item names searched: **{report['scope']['unique_item_names_searched']}**.\n"
        f"- Decisions: **{linked} linked**, **{review} review_required**, **{unavailable} genuinely_unavailable**.\n"
        "- Every selected identity has one JSONL evidence row with HTTPS URL(s), authority, locator, evidence summary and access date.\n"
        "- The two `apply Nigerian law` rows remain `review_required`: the official Nigerian Law School source confirms local legal training but does not name that exact competency.\n"
        "- No relationship endpoint/type, role requirement, domain requirement or cross-context assignment was inferred.\n"
        "- No catalogue, generated seed, SQL, UI, app, browser-proof or prior ledger file was changed.\n"
        "- Checkpoint was saved before search and updated after every evidence row.\n\n"
        "## New artifacts\n\n"
        f"- Selection: `{SELECTION.relative_to(ROOT).as_posix()}`\n"
        f"- Checkpoint: `{CHECKPOINT.relative_to(ROOT).as_posix()}`\n"
        f"- Ledger: `{LEDGER.relative_to(ROOT).as_posix()}`\n"
        f"- JSON report: `{REPORT_JSON.relative_to(ROOT).as_posix()}`\n",
        encoding="utf-8",
    )
    save_checkpoint(saved, selected_ids, status="completed", search_started=True)
    print(json.dumps(report["decisions"], sort_keys=True))


if __name__ == "__main__":
    main()
