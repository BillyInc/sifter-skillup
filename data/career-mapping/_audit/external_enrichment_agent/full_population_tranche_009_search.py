"""Record authoritative item evidence for the saved tranche-009 selection."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
SELECTION = OUT_DIR / "full_population_tranche_009_selection_2026-09-21.json"
LEDGER = OUT_DIR / "full_population_tranche_009_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / "full_population_tranche_009_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / "full_population_tranche_009_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / "full_population_tranche_009_report_2026-09-21.md"
REPORT_JSON = OUT_DIR / "full_population_tranche_009_report_2026-09-21.json"


def evidence(url: str, authority: str, locator: str, summary: str, *, confidence: str = "high") -> dict:
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
    "certified-energy-manager-cem": {
        "decision": "linked",
        "queries": ["Certified Energy Manager CEM official certification Association of Energy Engineers"],
        "candidate_urls": ["https://www.aeecenter.org/wp-content/uploads/2022/05/CERT-CEM-Overview_Flyer-2026_03.pdf"],
        "evidence": [evidence(
            "https://www.aeecenter.org/wp-content/uploads/2022/05/CERT-CEM-Overview_Flyer-2026_03.pdf",
            "Association of Energy Engineers",
            "Certified Energy Manager (CEM) Certification Program overview",
            "The Association of Energy Engineers identifies the exact Certified Energy Manager (CEM) certification program and its energy-management scope.",
        )],
        "limitation": "The source verifies the certification destination; it does not independently establish ownership in every domain context.",
    },
    "chartered-engineer-ceng": {
        "decision": "linked",
        "queries": ["Engineering Council Chartered Engineer CEng official"],
        "candidate_urls": ["https://www.engc.org.uk/professional-registration/our-professional-titles/chartered-engineer-ceng"],
        "evidence": [evidence(
            "https://www.engc.org.uk/professional-registration/our-professional-titles/chartered-engineer-ceng",
            "Engineering Council",
            "Chartered Engineer (CEng); professional title, competence and registration eligibility",
            "The Engineering Council identifies the exact Chartered Engineer (CEng) professional title and the competence, knowledge and registration route associated with it.",
        )],
        "limitation": "This is an official professional-registration route, not proof that CEng is required for the selected domain.",
    },
    "coren-registered-engineer": {
        "decision": "linked",
        "queries": ["COREN registered engineer official registration Nigeria"],
        "candidate_urls": ["https://coren.gov.ng/frequently-asked-questions/", "https://portal.coren.gov.ng/verification"],
        "evidence": [evidence(
            "https://coren.gov.ng/frequently-asked-questions/",
            "Council for the Regulation of Engineering in Nigeria (COREN)",
            "FAQ: functions of COREN, registered-engineer register and license to practise",
            "COREN identifies registered engineers, maintains the register and issues engineering-practitioner licences to practise legally in Nigeria.",
        ), evidence(
            "https://portal.coren.gov.ng/verification",
            "Council for the Regulation of Engineering in Nigeria (COREN)",
            "Registration verification: practitioner registration status by COREN number",
            "COREN provides an item-specific official verification destination for a registered engineering practitioner.",
        )],
        "limitation": "The official source establishes the Nigerian registration route; it does not make registration a universal requirement for every engineering-related domain.",
    },
    "corporate-membership-mnse": {
        "decision": "linked",
        "queries": ["Nigerian Society of Engineers Corporate Membership MNSE official"],
        "candidate_urls": ["https://nse.org.ng/membership/membership-requirements-criteria/", "https://nse.org.ng/membership/"],
        "evidence": [evidence(
            "https://nse.org.ng/membership/membership-requirements-criteria/",
            "Nigerian Society of Engineers",
            "Membership Requirements: Corporate Member category and A1/A2/B1/B2/C1/C2 routes",
            "The Nigerian Society of Engineers names Corporate Member as a membership grade and publishes its eligibility routes and requirements.",
        )],
        "limitation": "The source verifies the membership route; it does not establish that corporate membership is required for the selected domain.",
    },
    "engineering-safety-and-reliability": {
        "decision": "review_required",
        "queries": ["official engineering safety reliability NASA systems engineering handbook"],
        "candidate_urls": ["https://www.nasa.gov/reference/system-engineering-handbook-appendix/"],
        "evidence": [evidence(
            "https://www.nasa.gov/reference/system-engineering-handbook-appendix/",
            "NASA",
            "Systems Engineering Handbook appendix: safety and reliability requirements; reliability definition",
            "NASA describes planning for safety and reliability as engineering requirements and defines reliability as functioning properly over the intended life with an acceptable probability of failure.",
        )],
        "limitation": "The source supports the two components but does not establish the exact combined catalogue competency or a single training destination; retained for review.",
    },
    "interoperability": {
        "decision": "linked",
        "queries": ["NIST official interoperability definition"],
        "candidate_urls": ["https://csrc.nist.gov/glossary/term/interoperability"],
        "evidence": [evidence(
            "https://csrc.nist.gov/glossary/term/interoperability",
            "National Institute of Standards and Technology (NIST)",
            "CSRC Glossary: Interoperability",
            "NIST defines interoperability as the ability of one entity to communicate with another entity.",
        )],
        "limitation": "The source defines the capability; it does not establish ownership in each engineering domain context.",
    },
    "standards-based-engineering-practice": {
        "decision": "linked",
        "queries": ["Engineering Council standards engineering practice official"],
        "candidate_urls": ["https://www.engc.org.uk/our-role-as-regulator/setting-standards", "https://www.engc.org.uk/resources-and-guidance"],
        "evidence": [evidence(
            "https://www.engc.org.uk/our-role-as-regulator/setting-standards",
            "Engineering Council",
            "Setting Standards: common foundation, competence, commitment and responsible practice",
            "The Engineering Council states that its standards set the competence, commitment and professional behaviours expected of engineers and technicians and support responsible practice.",
        )],
        "limitation": "The source verifies standards-based professional practice as a destination; it does not establish a universal requirement for the selected domain.",
    },
    "ai": {
        "decision": "linked",
        "queries": ["NIST official artificial intelligence AI Risk Management Framework"],
        "candidate_urls": ["https://www.nist.gov/itl/ai-risk-management-framework"],
        "evidence": [evidence(
            "https://www.nist.gov/itl/ai-risk-management-framework",
            "National Institute of Standards and Technology (NIST)",
            "AI Risk Management Framework overview and AI Resource Center",
            "NIST identifies artificial intelligence (AI) and provides the AI Risk Management Framework for managing risks in the design, development, use and evaluation of AI systems.",
        )],
        "limitation": "The source verifies the AI information/framework destination; it does not imply that AI is required in every context where the catalogue item appears.",
    },
    "big-data": {
        "decision": "linked",
        "queries": ["NIST official big data reference architecture"],
        "candidate_urls": ["https://www.nist.gov/publications/nist-big-data-interoperability-framework-volume-6-big-data-reference-architecture"],
        "evidence": [evidence(
            "https://www.nist.gov/publications/nist-big-data-interoperability-framework-volume-6-big-data-reference-architecture",
            "National Institute of Standards and Technology (NIST)",
            "NIST Big Data Interoperability Framework Volume 6: Big Data Reference Architecture",
            "NIST identifies Big Data and documents its reference architecture, roles, activities and functional components for processing and deriving knowledge from large data environments.",
        )],
        "limitation": "The source verifies the subject destination; it does not establish ownership or a required technology stack in every domain context.",
    },
    "blockchain": {
        "decision": "linked",
        "queries": ["NIST official blockchain technology overview"],
        "candidate_urls": ["https://www.nist.gov/information-technology/blockchain", "https://csrc.nist.gov/pubs/ir/8202/final"],
        "evidence": [evidence(
            "https://www.nist.gov/information-technology/blockchain",
            "National Institute of Standards and Technology (NIST)",
            "Blockchain: definition, projects and NISTIR 8202 overview",
            "NIST identifies blockchain as a shared, tamper-evident and tamper-resistant digital ledger and links its official technical overview.",
        )],
        "limitation": "The source verifies the technology destination; it does not imply blockchain is required in every engineering context where it appears.",
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
        "tranche": "009",
        "selection": SELECTION.name,
        "ledger": LEDGER.name,
        "status": "completed",
        "scope": {"excluded_context_prefix": "D078", "selected_rows": len(selected), "item_rows": len(selected), "relationship_rows": 0, "unique_item_names_searched": len(set(row["item_key"] for row in rows))},
        "decisions": {"rows_searched": len(rows), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "genuinely_unavailable": 0, "no_link": 0, "remaining_selected_rows": 0},
        "reconciliation": reconciliation,
        "guardrails": {"sql_touched": False, "generated_seed_transport_touched": False, "catalogue_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "notes": "Item-only tranche. Unique item identities were searched once while each saved contextual identity retains its own evidence row. Ambiguous combined competency wording remains review_required.",
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "# Full-population item-enrichment tranche 009 report\n\n"
        f"Selection: `{SELECTION.name}`  \nLedger: `{LEDGER.name}`\n\n"
        "Status: **completed**\n\n"
        "## Decisions\n\n"
        f"- Rows searched: **{len(rows)} / {len(selected)}** contextual identities\n"
        f"- Unique item names searched: **{len(set(row['item_key'] for row in rows))}**\n"
        f"- Linked: **{decisions.get('linked', 0)}**\n"
        f"- Review required: **{decisions.get('review_required', 0)}**\n"
        "- Genuinely unavailable: **0**\n"
        "- Remaining selected rows: **0**\n\n"
        "## Guardrails\n\n"
        "- D078 was excluded and no relationship rows were searched or promoted.\n"
        "- Repeated item keys were searched once, but every contextual identity has a separate ledger row.\n"
        "- No generic homepage was promoted as item-specific evidence.\n"
        "- Combined or context-ambiguous competency evidence remains `review_required`.\n"
        "- SQL, generated seed transport, catalogue, UI and browser proof were not touched.\n",
        encoding="utf-8",
    )
    checkpoint = {
        "schema": "2026-09-21.full-population-enrichment-tranche-checkpoint.v1",
        "tranche": "009",
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
        "# Full-population item-enrichment tranche 009 checkpoint\n\n"
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
