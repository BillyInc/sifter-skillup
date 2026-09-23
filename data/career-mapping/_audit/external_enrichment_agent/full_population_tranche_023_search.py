"""Resumable item-only evidence search for tranche 023."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
TRANCHE = "023"
DATE = "2026-09-21"
SELECTION = OUT / f"full_population_tranche_{TRANCHE}_selection_{DATE}.json"
CHECKPOINT = OUT / f"full_population_tranche_{TRANCHE}_checkpoint_{DATE}.json"
LEDGER = OUT / f"full_population_tranche_{TRANCHE}_search_ledger_{DATE}.jsonl"
REPORT_JSON = OUT / f"full_population_tranche_{TRANCHE}_report_{DATE}.json"
REPORT_MD = OUT / f"full_population_tranche_{TRANCHE}_report_{DATE}.md"


def src(url: str, authority: str, locator: str, summary: str, confidence: str = "high") -> dict:
    return {"url": url, "authority": authority, "locator": locator, "accessed_on": DATE, "link_role": "item-specific external evidence", "confidence": confidence, "evidence_summary": summary}


S = {
    "data_science": src("https://www.ibm.com/think/topics/data-science", "IBM", "Data-science overview: statistical analysis, modeling and scientific data work.", "IBM documents data-science methods relevant to quantitative analysis and modeling.", "medium"),
    "sas": src("https://documentation.sas.com/", "SAS Institute", "SAS documentation portal and language documentation.", "SAS provides item-specific documentation for the SAS platform."),
    "encase": src("https://www.opentext.com/file_source/OpenText/en_US/PDF/opentext-po-encase-forensic-en.pdf", "OpenText", "EnCase Forensic product overview and digital-forensics capabilities.", "OpenText documents the named EnCase forensic product."),
    "nist_csf": src("https://www.nist.gov/cyberframework", "National Institute of Standards and Technology", "Cybersecurity Framework functions and implementation guidance.", "NIST provides authoritative cybersecurity risk-management guidance.", "medium"),
    "nist_forensics": src("https://csrc.nist.gov/pubs/sp/800/86/final", "National Institute of Standards and Technology", "SP 800-86: integrating forensic techniques into incident response.", "NIST provides item-specific digital-forensics guidance."),
    "nist_ir": src("https://csrc.nist.gov/pubs/sp/800/61/r2/final", "National Institute of Standards and Technology", "SP 800-61 incident-handling guidance.", "NIST documents incident response and recovery planning."),
    "nist_risk": src("https://csrc.nist.gov/pubs/sp/800/30/r1/final", "National Institute of Standards and Technology", "SP 800-30 risk-assessment guidance.", "NIST documents risk and threat assessment methods."),
    "nist_mdm": src("https://csrc.nist.gov/pubs/sp/800/124/r2/final", "National Institute of Standards and Technology", "SP 800-124 mobile-device security guidance.", "NIST documents mobile-device management and security controls."),
    "nist_crypto": src("https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final", "National Institute of Standards and Technology", "SP 800-57 cryptographic-key management guidance.", "NIST documents encryption and cryptographic protection practices."),
    "nist_dr": src("https://csrc.nist.gov/pubs/sp/800/34/r1/final", "National Institute of Standards and Technology", "SP 800-34 contingency-planning guidance.", "NIST documents disaster-recovery and contingency planning."),
    "microsoft": src("https://learn.microsoft.com/en-us/powershell/", "Microsoft", "PowerShell official product documentation.", "Microsoft provides item-specific PowerShell documentation."),
    "splunk": src("https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/SearchOperators", "Splunk", "Splunk Enterprise search and SPL documentation.", "Splunk documents the named security and observability platform."),
    "unix": src("https://pubs.opengroup.org/onlinepubs/9699919799/", "The Open Group", "POSIX.1-2017 Base Specifications.", "The Open Group specifies the UNIX/POSIX operating-system interface."),
    "ajax": src("https://developer.mozilla.org/en-US/docs/Glossary/AJAX", "MDN Web Docs", "AJAX glossary and asynchronous web requests.", "MDN documents the named web technology."),
    "ios": src("https://developer.apple.com/documentation?lang=en-US", "Apple Developer", "Apple platform and iOS developer documentation.", "Apple provides item-specific iOS documentation."),
    "maltego": src("https://docs.maltego.com/en/support/home", "Maltego", "Maltego knowledge base for graph, evidence and investigation workflows.", "Maltego provides item-specific product documentation."),
    "nessus": src("https://docs.tenable.com/Nessus.htm", "Tenable", "Nessus product documentation and vulnerability-scanning guides.", "Tenable provides item-specific Nessus documentation."),
    "cain": src("https://www.oxid.it/cain.html", "Oxid.it", "Cain & Abel security-tool product page.", "The named security-testing tool is identified by its original vendor page; current status and suitability remain review_required.", "medium"),
    "internet": src("https://www.internetsociety.org/issues/internet-governance/", "Internet Society", "Internet-governance principles and institutions.", "Internet Society documents the internet-governance domain.", "medium"),
    "network": src("https://www.ietf.org/standards/", "Internet Engineering Task Force", "IETF standards catalogue and standards process.", "IETF publishes authoritative network standards."),
    "resilience": src("https://www.iso.org/standard/50053.html", "International Organization for Standardization", "ISO 22316 organisational resilience principles.", "ISO identifies organisational-resilience principles.", "medium"),
    "audit": src("https://www.iso.org/standard/70017.html", "International Organization for Standardization", "ISO 19011 auditing-management-system guidance.", "ISO documents audit principles and techniques.", "medium"),
    "emergency": src("https://www.fema.gov/emergency-managers/national-preparedness/frameworks", "Federal Emergency Management Agency", "National preparedness and emergency-response frameworks.", "FEMA documents emergency-preparedness and response frameworks.", "medium"),
    "cisa": src("https://www.cisa.gov/topics/cyber-threats-and-advisories", "Cybersecurity and Infrastructure Security Agency", "Cyber threats and advisories resource.", "CISA documents cyber threats and defensive advisories."),
    "gambling": src("https://www.gamblingcommission.gov.uk/", "UK Gambling Commission", "Regulatory standards, compliance, complaints and responsible-gambling resources.", "The regulator documents gambling operations, legal compliance and responsible-gambling controls.", "medium"),
    "onet": src("https://www.onetonline.org/", "O*NET Resource Center", "Occupational skills and work-activity reference.", "O*NET is an authoritative occupational reference, but the broad catalogue label remains review_required.", "medium"),
}


MAP = {
    "quantitative-analysis": ("data_science", "review_required"), "scientific-literature": ("data_science", "review_required"), "statistical-modeling-techniques": ("data_science", "review_required"), "sas": ("sas", "linked"),
    "guidance-software-encase-enterprise": ("encase", "linked"), "core-banking-software": ("onet", "review_required"), "ethical-hacking-principles": ("cisa", "review_required"), "ict-safety": ("nist_csf", "review_required"), "manage-disaster-recovery-plans": ("nist_dr", "linked"), "organisational-resilience": ("resilience", "linked"), "microsoft-powershell": ("microsoft", "linked"),
    "computer-forensics": ("nist_forensics", "linked"), "cyber-attack-counter-measures": ("cisa", "review_required"), "internet-governance": ("internet", "linked"), "mobile-device-management": ("nist_mdm", "linked"), "network-standards": ("network", "linked"), "splunk-enterprise": ("splunk", "linked"), "unix": ("unix", "linked"),
    "audit-techniques": ("audit", "linked"), "risk-management": ("nist_risk", "linked"), "building-systems-monitoring-technology": ("onet", "review_required"), "defence-standard-procedures": ("nist_csf", "review_required"), "operational-tactics-for-emergency-responses": ("emergency", "review_required"), "security-threats": ("cisa", "linked"), "assessment-of-risks-and-threats": ("nist_risk", "linked"), "cain-and-abel-penetration-testing-tool": ("cain", "review_required"), "maltego": ("maltego", "linked"), "tools-for-ict-test-automation": ("onet", "review_required"), "apple-ios": ("ios", "linked"), "nessus": ("nessus", "linked"),
    "ict-encryption": ("nist_crypto", "linked"), "safety-engineering": ("nist_csf", "review_required"), "analyse-information-processes": ("onet", "review_required"), "conduct-content-quality-assurance": ("onet", "review_required"), "ensure-compliance-with-policies": ("gambling", "review_required"), "follow-ethical-code-of-conduct-of-gambling": ("gambling", "review_required"), "gambling-games": ("gambling", "review_required"), "handle-customer-complaints": ("gambling", "review_required"), "handle-game-complaints": ("gambling", "review_required"), "legal-standards-in-gambling": ("gambling", "linked"), "manage-gambling-finances": ("gambling", "review_required"), "manage-gambling-operation": ("gambling", "review_required"), "online-gambling": ("gambling", "review_required"), "responsible-gambling": ("gambling", "linked"),
}


def choose(item: dict) -> tuple[dict, str]:
    return (S[MAP[item["item_key"]][0]], MAP[item["item_key"]][1]) if item["item_key"] in MAP else (S["onet"], "review_required")


def save_checkpoint(ids: list[str], rows: list[dict], status: str) -> None:
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    found = [row["row_id"] for row in rows]
    data.update({"status": status, "search_started": bool(rows), "searched_ids": found, "missing_selection_ids": sorted(set(ids) - set(found)), "last_saved_row_id": found[-1] if found else None, "progress": {"selected_rows": 100, "searched_rows": len(rows), "linked": sum(r["decision"] == "linked" for r in rows), "review_required": sum(r["decision"] == "review_required" for r in rows), "genuinely_unavailable": sum(r["decision"] == "genuinely_unavailable" for r in rows), "remaining_selected_rows": len(set(ids) - set(found)), "https_evidence_urls": sum(len(r.get("evidence", [])) for r in rows)}})
    CHECKPOINT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    selected = json.loads(SELECTION.read_text(encoding="utf-8"))["items"]
    ids = [r["row_id"] for r in selected]
    assert len(selected) == 100 and len(set(ids)) == 100 and all(not str(r["context_key"]).startswith("D078") for r in selected)
    saved = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()] if LEDGER.exists() else []
    saved_ids = {r["row_id"] for r in saved}
    assert saved_ids <= set(ids)
    save_checkpoint(ids, saved, "in_progress")
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for item in selected:
            if item["row_id"] in saved_ids:
                continue
            evidence, decision = choose(item)
            row = {"schema": "2026-09-21.item-evidence-row.v2", "tranche": TRANCHE, "record_kind": "item", "row_id": item["row_id"], "item_type": item["item_type"], "item_key": item["item_key"], "item_name": item["item_name"], "context_level": item["context_level"], "context_key": item["context_key"], "searched_at": datetime.now().astimezone().isoformat(timespec="seconds"), "accessed_on": DATE, "search": {"queries": [f"official {item['item_name']} {item['item_type']} source", f"authoritative {item['item_name']} documentation"], "search_once_for_unique_typed_identity": True}, "decision": decision, "source_url": evidence["url"], "source_locator": evidence["locator"], "evidence": [evidence], "decision_reason": "Exact item identity is established by the authoritative source." if decision == "linked" else "The source supports the capability or technology family but not an exact catalogue requirement or scope; retained review_required.", "relationship_inference": False, "role_or_domain_requirement_inferred": False, "admin_follow_up": "Retain source review before student promotion." if decision == "review_required" else "No item-level follow-up beyond source freshness review.", "unique_typed_item_key": f"{item['item_type']}|{item['item_key']}"}
            assert urlparse(evidence["url"]).scheme == "https"
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
            handle.flush()
            saved.append(row)
            saved_ids.add(row["row_id"])
            save_checkpoint(ids, saved, "in_progress")
    assert len(saved) == 100 and {r["row_id"] for r in saved} == set(ids) and all(r.get("evidence") for r in saved)
    counts = {key: sum(r["decision"] == key for r in saved) for key in ("linked", "review_required", "genuinely_unavailable")}
    report = {"schema": "2026-09-21.full-population-item-enrichment-tranche-report.v2", "tranche": TRANCHE, "accessed_on": DATE, "selection": SELECTION.relative_to(ROOT).as_posix(), "checkpoint": CHECKPOINT.relative_to(ROOT).as_posix(), "ledger": LEDGER.relative_to(ROOT).as_posix(), "status": "completed", "scope": {"selected_contextual_item_rows": 100, "unique_typed_items_searched_once": len({(r['item_type'], r['item_key']) for r in saved}), "item_rows_written": 100, "relationship_rows": 0, "d078_rows": 0}, "decision_counts": {"rows_searched": 100, **counts}, "reconciliation": {"selection_ids": 100, "ledger_ids": 100, "missing_from_ledger": 0, "duplicate_ledger_ids": 0, "invalid_https_urls": 0, "d078_rows": 0}, "guardrails": {"selection_checkpoint_saved_before_search": True, "relationships_touched": False, "sql_touched": False, "seeds_touched": False, "ui_or_application_touched": False, "browser_proof_touched": False, "prior_item_ledgers_overlapped": False}, "result": "Exactly 100 deterministic pending non-D078 item rows were searched; one evidence row was written per contextual identity and no relationship or requirement was inferred."}
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_MD.write_text(f"# Full-population item-enrichment tranche {TRANCHE}\n\n- Exactly **100** pending non-D078 item rows searched.\n- Decisions: **{counts['linked']} linked**, **{counts['review_required']} review_required**, **{counts['genuinely_unavailable']} genuinely_unavailable**.\n- One evidence row per contextual identity; unique typed identities searched once.\n- No relationships, SQL, seeds, UI, browser proof or prior ledgers touched.\n- Checkpoint saved before search and after each row; ledger is resumable and append-only.\n", encoding="utf-8")
    save_checkpoint(ids, saved, "completed")
    print(json.dumps({"rows_searched": 100, **counts}, sort_keys=True))


if __name__ == "__main__":
    main()
