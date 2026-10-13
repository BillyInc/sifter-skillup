"""Materialize exact-key D025 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D025_role_domain_fit_2026_10_05.json"
RULINGS = {
"clinical pharmacologist": ("supported", "Studies drug effects in humans and translates pharmacology into safe, effective therapeutics; clinical pharmacology is explicitly a human-drug field."),
"clinical trial assistant": ("conditional", "Maintains essential records and supports clinical drug research; fit is limited to pharmaceutical/clinical-trial operations, not general research administration."),
"community pharmacist": ("supported", "Dispensing prescription medicines, counselling patients and providing pharmacy-based screening are direct pharmacy practice."),
"hospital pharmacist": ("supported", "Medication management, clinical pharmacy and drug-therapy monitoring are direct pharmacy practice."),
"import export manager in pharmaceutical goods": ("conditional", "The role coordinates pharmaceutical-goods trade; pharmacy-domain fit is limited to medicine-specific compliant supply operations, not generic international trade management."),
"import export specialist in pharmaceutical goods": ("conditional", "Customs and documentation work is medicine-specific supply-chain support, but does not establish dispensing, formulation or clinical pharmacy practice."),
"industrial pharmacist": ("supported", "Oversight of medicine manufacturing, quality assurance and regulatory compliance is an established industrial-pharmacy function."),
"pharmaceutical engineer": ("conditional", "Designing technology for pharmaceutical research/manufacture supports drug production; general plant engineering is not pharmacy-specific."),
"pharmaceutical goods distribution manager": ("conditional", "Medicine distribution is a pharmacy supply-chain function when focused on safe pharmaceutical products and handling; generic logistics is not."),
"pharmaceutical quality specialist": ("supported", "Inspection and testing to assure pharmaceutical product quality is directly within drug quality practice."),
"pharmaceutical sales representative": ("unsupported", "Product promotion and sales to healthcare professionals alone do not establish medicine preparation, dispensing, safety, quality or clinical pharmacy work."),
"pharmacist": ("supported", "Preparing/dispensing medicines, advising patients and monitoring medicine safety are central pharmacy tasks."),
"pharmacovigilance specialist": ("supported", "Monitoring and evaluating adverse drug reactions is a direct medicine-safety function within pharmacy and drug regulation."),
"pharmacy assistant": ("conditional", "Stock, cash-desk and administrative duties support pharmacy operations but do not themselves establish medication-dispensing or clinical responsibilities."),
"pharmacy lecturer": ("conditional", "Teaching the pharmacy discipline is a pharmacy-domain education role, though it is not direct patient or product practice."),
"pharmacy manager": ("supported", "Managing staff and services in a pharmacy setting is direct operational leadership within the domain."),
"pharmacy technician": ("supported", "Supervised medicine receipt, storage, stock control and, where permitted, dispensing directly support pharmacy services."),
"regulatory affairs pharmacist": ("supported", "Managing medicine approval submissions and drug-regulatory compliance is a direct pharmaceutical practice function."),
"specialist pharmacist": ("supported", "Specialist services in pharmacy companies and hospital pharmacies are direct advanced pharmacy practice."),
"wholesale merchant in pharmaceutical goods": ("conditional", "Wholesale matching and trade concern pharmaceutical products, but fit is limited to medicine-specific compliant distribution, not generic wholesale commerce."),
}
EXTRA_SOURCES = {
"clinical pharmacologist": ["https://www.ascpt.org/Resources/Knowledge-Center/What-is-Clinical-Pharmacology"],
"community pharmacist": ["https://www.bls.gov/ooh/healthcare/pharmacists.htm"],
"pharmacovigilance specialist": ["https://www.fda.gov/drugs/surveillance-post-drug-approval-activities/postmarketing-surveillance-programs"],
"pharmacy manager": ["https://www.bls.gov/ooh/healthcare/pharmacists.htm"],
"regulatory affairs pharmacist": ["https://www.bls.gov/ooh/healthcare/pharmacists.htm"],
}

def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"): return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/" + ref[5:].split("@", 1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@", 1)[0]
    return None

def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in queue["role_mappings"] if row["domain_id"] == "D025"]
    if len(rows) != 20 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D025 exact role queue changed; re-adjudicate before generation")
    decisions = []
    for row in rows:
        status, basis = RULINGS[row["role_name"]]
        refs = list(dict.fromkeys(url for ref in row["task_source_refs"] if (url := source_url(ref))))
        refs.extend(url for url in EXTRA_SOURCES.get(row["role_name"], []) if url not in refs)
        if not refs: raise SystemExit(f"Missing task source reference for {row['role_key']}")
        decisions.append({"role_key": row["role_key"], "domain_fit_status": status,
            "task_evidence": row["role_task_text"], "basis": basis, "source_refs": refs,
            "source_limit": "ESCO/O*NET role tasks are representative, jurisdictionally situated occupational evidence; O*NET is US-based. BLS, ASCPT and FDA support the particular profession/function noted but do not establish universal licensing or local scope. Conditional cases require the specific medicine/pharmacy context described."})
    counts = Counter(item["domain_fit_status"] for item in decisions)
    artifact = {"schema_version": 1, "domain_id": "D025", "domain_name": rows[0]["domain_name"],
        "scope": "D025 only; task fit to parent Pharmacy domain. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare exact tasks with medicine preparation, dispensing, clinical medication advice/monitoring, pharmaceutical manufacture and quality, medicine safety, pharmacy operations and closely bounded pharmaceutical supply functions. Supported requires a direct pharmacy/drug-safety task; conditional applies to education, research, engineering, trade or general operational work only where the stated medicine-specific function is evidenced; unsupported means the task is sales-only without pharmacy practice. No inference from title, occupation family or subgroup.",
        "source_limit_policy": "ESCO/O*NET descriptions are representative and jurisdictionally situated; O*NET and BLS are US-contextual. ASCPT and FDA sources support clinical pharmacology and post-market safety functions. No source is treated as a universal licensing rule.",
        "counts": {"reviewed_role_mappings": len(decisions), **{key: counts.get(key, 0) for key in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions}
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))

if __name__ == "__main__": main()
