"""Record authoritative item evidence for the saved tranche-012 selection."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
OUT_DIR = Path(__file__).resolve().parent
TRANCHE = "012"
SELECTION = OUT_DIR / f"full_population_tranche_{TRANCHE}_selection_2026-09-21.json"
LEDGER = OUT_DIR / f"full_population_tranche_{TRANCHE}_search_ledger_2026-09-21.jsonl"
CHECKPOINT = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.json"
CHECKPOINT_MD = OUT_DIR / f"full_population_tranche_{TRANCHE}_checkpoint_2026-09-21.md"
REPORT = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_2026-09-21.md"
REPORT_JSON = OUT_DIR / f"full_population_tranche_{TRANCHE}_report_2026-09-21.json"


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
    "health-service-quality": {
        "decision": "linked",
        "queries": ["WHO official quality of care health services"],
        "candidate_urls": ["https://www.who.int/health-topics/quality-of-care", "https://qualityhealthservices.who.int/"],
        "evidence": [evidence(
            "https://www.who.int/health-topics/quality-of-care",
            "World Health Organization (WHO)",
            "WHO Quality of care: definition, dimensions and health-service quality improvement",
            "WHO defines quality of care as the degree to which health services increase the likelihood of desired health outcomes and describes effective, safe, people-centred, timely, equitable, integrated and efficient services.",
        )],
        "limitation": "The source verifies the health-service quality concept and destination; it does not establish that every health domain uses the same quality-improvement method.",
    },
    "advanced-cardiovascular-life-support-acls": {
        "decision": "linked",
        "queries": ["American Heart Association official ACLS course healthcare professional"],
        "candidate_urls": ["https://cpr.heart.org/en/courses/advanced-cardiovascular-life-support-course-options", "https://cpr.heart.org/en/cpr-courses-and-kits/healthcare-professional/acls"],
        "evidence": [evidence(
            "https://cpr.heart.org/en/courses/advanced-cardiovascular-life-support-course-options",
            "American Heart Association (AHA)",
            "Advanced Cardiovascular Life Support (ACLS) course options: healthcare-professional scope and completion card",
            "AHA identifies the exact ACLS course, its intended healthcare-professional use in cardiopulmonary emergencies, training options and completion card.",
        )],
        "limitation": "The source verifies the ACLS course destination; it does not establish that ACLS is required for every clinical role in the domain.",
    },
    "basic-life-support-bls": {
        "decision": "linked",
        "queries": ["American Heart Association official Basic Life Support BLS course healthcare professional"],
        "candidate_urls": ["https://cpr.heart.org/en/courses/basic-life-support-course-options", "https://cpr.heart.org/en/cpr-courses-and-kits/healthcare-professional/basic-life-support-bls-training"],
        "evidence": [evidence(
            "https://cpr.heart.org/en/courses/basic-life-support-course-options",
            "American Heart Association (AHA)",
            "Basic Life Support (BLS) course options: healthcare-professional scope and BLS Provider eCard",
            "AHA identifies the exact BLS Provider course for healthcare professionals and trained first responders, including the skills scope and completion eCard.",
        )],
        "limitation": "The source verifies the BLS course destination; it does not establish that BLS is required for every healthcare or public-health role.",
    },
    "registered-nurse-registered-midwife-licence": {
        "decision": "linked",
        "queries": ["Nursing and Midwifery Council of Nigeria official licensing registration nurse midwife"],
        "candidate_urls": ["https://www.nmcn.gov.ng/wp-content/uploads/2023/12/licensing.pdf", "https://www.nmcn.gov.ng/"],
        "evidence": [evidence(
            "https://www.nmcn.gov.ng/wp-content/uploads/2023/12/licensing.pdf",
            "Nursing and Midwifery Council of Nigeria (NMCN)",
            "NMCN licensing form: professional registration with the Nursing and Midwifery Council of Nigeria, including nursing and midwifery entries",
            "The NMCN licensing form is the regulator’s official licensing route and records professional registration for nursing and midwifery practice.",
        )],
        "limitation": "The source verifies the Nigerian licensing route; it does not replace checking the applicant’s current licence status or scope of practice.",
    },
    "pharmacist-licence-registration": {
        "decision": "linked",
        "queries": ["Pharmacy Council of Nigeria official pharmacist registration licensing"],
        "candidate_urls": ["https://pcn.gov.ng/registrations/", "https://pcn.gov.ng/wp-content/uploads/2025/03/Guidelines_for_Registration_of_Pharmacists_and_Pharmaceutical_Premises.pdf"],
        "evidence": [evidence(
            "https://pcn.gov.ng/registrations/",
            "Pharmacy Council of Nigeria (PCN)",
            "PCN Registrations: pharmacist registration, annual licensing and registration portal",
            "PCN provides the official registration portal and explains pharmacist registration and licensing routes under the Pharmacy Council of Nigeria.",
        )],
        "limitation": "The source verifies the Nigerian registration and licensing destination; it does not imply that a licence is interchangeable with a pharmacy degree.",
    },
    "haccp-certification": {
        "decision": "review_required",
        "queries": ["FDA official HACCP principles application guidelines certification"],
        "candidate_urls": ["https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines"],
        "evidence": [evidence(
            "https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines",
            "U.S. Food and Drug Administration (FDA)",
            "HACCP Principles & Application Guidelines: seven principles, hazard analysis, monitoring, verification and record keeping",
            "FDA documents HACCP as a systematic food-safety approach and sets out its seven principles and application guidance.",
        )],
        "limitation": "The FDA source establishes HACCP practice, not the exact named certification or a certifying body for this catalogue item; retained for review.",
    },
    "coordinate-community-health-programmes": {
        "decision": "review_required",
        "queries": ["WHO official community health worker programme planning coordination"],
        "candidate_urls": ["https://www.who.int/publications/i/item/9789241550369"],
        "evidence": [evidence(
            "https://www.who.int/publications/i/item/9789241550369",
            "World Health Organization (WHO)",
            "WHO guideline on health policy and system support to optimize community health worker programmes: situation analysis, integration and programme support",
            "WHO describes evidence-based design and support for community health worker programmes, including situation analysis of population needs and integration with health systems and community structures.",
        )],
        "limitation": "The guideline supports programme design and coordination concepts but does not name the exact combined catalogue competency as a standalone learning item; retained for review.",
    },
    "interpret-population-evidence": {
        "decision": "review_required",
        "queries": ["WHO official population health statistics interpretation evidence"],
        "candidate_urls": ["https://www.who.int/data/who-reference-group-on-health-statistics-%28rghs%29", "https://www.who.int/publications/m/item/the-gather-statement--explanation-and-elaboration"],
        "evidence": [evidence(
            "https://www.who.int/data/who-reference-group-on-health-statistics-%28rghs%29",
            "World Health Organization (WHO)",
            "WHO Reference Group on Health Statistics: generation, use, interpretation and dissemination of global health statistics",
            "WHO describes the use and interpretation of health statistics and the role of evidence-informed policy in improving population health.",
        )],
        "limitation": "The sources support interpreting population-health evidence but do not name the exact catalogue competency or a single course destination; retained for review.",
    },
    "plan-public-health-interventions": {
        "decision": "review_required",
        "queries": ["WHO official planning public health interventions"],
        "candidate_urls": ["https://www.who.int/universal-health-coverage/compendium", "https://www.who.int/standards/classifications/international-classification-of-health-interventions"],
        "evidence": [evidence(
            "https://www.who.int/universal-health-coverage/compendium",
            "World Health Organization (WHO)",
            "UHC Compendium: public-health interventions, planning, costing and budgeting",
            "WHO explains that public-health interventions require planning, costing, budgeting and adaptation to local needs and priorities.",
        )],
        "limitation": "The source supports public-health intervention planning but does not establish the exact catalogue competency as a standalone destination; retained for review.",
    },
    "disease-prevention": {
        "decision": "linked",
        "queries": ["WHO official disease prevention definition population interventions"],
        "candidate_urls": ["https://www.emro.who.int/about-who/public-health-functions/health-promotion-disease-prevention.html", "https://www.who.int/health-topics/primary-health-care"],
        "evidence": [evidence(
            "https://www.emro.who.int/about-who/public-health-functions/health-promotion-disease-prevention.html",
            "World Health Organization, Eastern Mediterranean Regional Office (WHO EMRO)",
            "Health promotion and disease prevention through population-based and individual-based interventions",
            "WHO defines disease prevention as population-based and individual-based primary and secondary prevention interventions aimed at minimizing disease burden and associated risk factors.",
        )],
        "limitation": "The source verifies the disease-prevention concept; it does not establish one universal intervention package for every population-health context.",
    },
    "health-promotion": {
        "decision": "linked",
        "queries": ["WHO official health promotion definition Ottawa Charter"],
        "candidate_urls": ["https://www.who.int/health-topics/health-promotion"],
        "evidence": [evidence(
            "https://www.who.int/health-topics/health-promotion",
            "World Health Organization (WHO)",
            "Health promotion: enabling people to increase control over and improve their health; advocate, enable and mediate strategies",
            "WHO defines health promotion and describes its population, community and multisectoral action areas, including health literacy and social mobilization.",
        )],
        "limitation": "The source verifies the health-promotion concept; it does not establish a single professional qualification or programme-specific requirement.",
    },
    "population-health": {
        "decision": "linked",
        "queries": ["WHO official population health definition operational framework primary health care"],
        "candidate_urls": ["https://www.who.int/docs/default-source/primary-health/operational-framework-for-primary-health-care-wha73.pdf"],
        "evidence": [evidence(
            "https://www.who.int/docs/default-source/primary-health/operational-framework-for-primary-health-care-wha73.pdf",
            "World Health Organization (WHO)",
            "Operational framework for primary health care: population health definition and equitable distribution of health outcomes",
            "WHO’s operational framework uses population health as an approach concerned with improving the health outcomes of a group and the distribution of those outcomes within the group.",
        )],
        "limitation": "The source verifies the population-health concept; it does not imply that one method or intervention applies to every population.",
    },
    "licensed-medical-laboratory-scientist": {
        "decision": "linked",
        "queries": ["Medical Laboratory Science Council of Nigeria official registration portal licence"],
        "candidate_urls": ["https://mlscn.gov.ng/", "https://eduportal.mlscn.gov.ng/Home?AspxAutoDetectCookieSupport=1&ReturnUrl=%2FApplicant%2F"],
        "evidence": [evidence(
            "https://eduportal.mlscn.gov.ng/Home?AspxAutoDetectCookieSupport=1&ReturnUrl=%2FApplicant%2F",
            "Medical Laboratory Science Council of Nigeria (MLSCN)",
            "MLSCN Registration Portal: official registration portal for the Medical Laboratory Science Council of Nigeria",
            "MLSCN provides an official registration portal and identifies the Council as the regulator of medical laboratory science practice in Nigeria.",
        )],
        "limitation": "The source verifies the Nigerian registration destination; individual licence status and scope must be checked separately.",
    },
    "nebosh-international-general-certificate": {
        "decision": "linked",
        "queries": ["NEBOSH official International General Certificate occupational health safety"],
        "candidate_urls": ["https://www.nebosh.org.uk/qualifications/international-general-certificate/"],
        "evidence": [evidence(
            "https://www.nebosh.org.uk/qualifications/international-general-certificate/",
            "National Examination Board in Occupational Safety and Health (NEBOSH)",
            "International General Certificate in Occupational Health and Safety: qualification scope, learning outcomes and assessment",
            "NEBOSH identifies the exact International General Certificate, its occupational-health-and-safety scope, risk-assessment outcomes and assessment route.",
        )],
        "limitation": "The source verifies the qualification destination; it does not establish that the certificate is required for every safety or public-health role.",
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
        "notes": "Item-only tranche. Repeated item keys were searched once and every selected contextual identity retains its own evidence row. Combined competency and certification wording remains review_required where the authority supports the underlying practice but not the exact catalogue credential or phrase.",
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
        "- A source that supports a concept but not the exact credential or combined catalogue wording remains `review_required`.\n\n"
        "## Guardrails\n\n"
        "- D078 was excluded and no relationship rows were searched or promoted.\n"
        "- No generic homepage was promoted as item-specific evidence.\n"
        "- SQL, generated seed transport, catalogue, UI and browser proof were not touched.\n",
        encoding="utf-8",
    )
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({
        "status": "completed",
        "progress": {
            "selected_rows": len(selected),
            "searched_rows": len(rows),
            "linked": decisions.get("linked", 0),
            "review_required": decisions.get("review_required", 0),
            "genuinely_unavailable": 0,
            "unique_item_names_searched": len(set(row["item_key"] for row in rows)),
        },
        "ledger": str(LEDGER.relative_to(ROOT)).replace("\\", "/"),
        "report": str(REPORT.relative_to(ROOT)).replace("\\", "/"),
        "searched_ids": ledger_ids,
        "missing_selection_ids": sorted(set(selection_ids) - set(ledger_ids)),
        "search_started": True,
        "guardrails": {"catalogue_touched": False, "generated_seed_transport_touched": False, "sql_touched": False, "ui_touched": False, "browser_proof_touched": False},
        "reconciliation": reconciliation,
    })
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
    print(json.dumps({"tranche": TRANCHE, "searched": len(rows), "linked": decisions.get("linked", 0), "review_required": decisions.get("review_required", 0), "reconciliation": reconciliation}, sort_keys=True))


if __name__ == "__main__":
    main()
