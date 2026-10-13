"""Materialize exact-key D026 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D026_role_domain_fit_2026_10_05.json"
RULINGS = {
"biostatistician": ("supported", "Applies statistical methods to biological/public-health studies and health data, directly supporting population-health evidence and decisions."),
"community health worker": ("supported", "Provides community health advice and supports prevention and maternal/community care, directly within population-health practice."),
"disease surveillance officer": ("supported", "Collects, analyses and reports outbreak data to guide prevention and public-health response."),
"emergency response coordinator": ("supported", "Assesses community/institutional hazards and coordinates preparedness and response plans for emergencies."),
"environmental health inspector": ("supported", "Investigates compliance with environmental/public-health law and evaluates hazards affecting communities."),
"environmental health officer": ("supported", "Inspects and enforces food, housing, sanitation and environmental-health protections."),
"ergonomist": ("conditional", "Improving human-system safety and health fits when the assignment addresses population or occupational health risks; general efficiency/product design alone is adjacent."),
"first aid instructor": ("conditional", "Teaches immediate lifesaving measures that contribute to preparedness and health protection, but instruction alone is not population-health surveillance or service delivery."),
"food regulatory advisor": ("supported", "Audits and monitors food-industry compliance, a direct food-safety and public-health protection function."),
"food safety inspector": ("supported", "Inspects food environments and products to prevent population exposure to unsafe food."),
"food safety specialist": ("supported", "Implements processes to prevent food-safety problems, directly protecting community health."),
"hazardous materials inspector": ("conditional", "Inspects hazardous-material handling against health/safety rules; public-health fit depends on protection from community/worker exposure, not generic compliance alone."),
"hazardous waste inspector": ("conditional", "Checks hazardous-waste disposal and site controls; fit depends on exposure prevention and health-protection duties, otherwise it is environmental compliance."),
"health and safety inspector": ("conditional", "The profile concerns workplace labour standards and safety; fit is occupational-health inspection, not general labour-policy enforcement."),
"health and safety officer": ("conditional", "Work-environment risk assessment supports occupational health when the duties prevent health injury; generic corporate compliance alone is insufficient."),
"health communication specialist": ("supported", "Develops and shares evidence-based messages to promote health and inform the public, a direct public-health function."),
"health economist": ("supported", "Analyses health costs, financing and resource allocation to inform population-health policy and system decisions."),
"health programme officer": ("supported", "Plans, implements and monitors prevention and community-health programmes, directly within public-health delivery."),
"healthcare inspector": ("conditional", "Inspects care facilities for legal standards and quality; fit is the protection of patients/population through health-service oversight, not general regulatory inspection."),
"industrial waste inspector": ("conditional", "Industrial waste compliance fits where duties prevent hazardous exposure and protect community health; environmental permitting alone is adjacent."),
"occupational health and safety inspector": ("conditional", "Audits workplaces and investigates accidents; fits the occupational-health and injury-prevention component of public health, not generic environmental enforcement."),
"public health physician": ("supported", "Leads disease prevention and population-health strategy rather than one-patient clinical care, directly matching D026."),
"radiation protection officer": ("conditional", "Protecting people from ionising-radiation exposure is health protection; fit depends on public/worker exposure-risk remit rather than equipment-only technical compliance."),
"statistician": ("conditional", "Statistical analysis fits when applied to health surveillance, health services or disease-prevention evidence; the occupation's generic cross-sector task is not inherently public health."),
"transport health and safety inspector": ("conditional", "Transport safety inspection fits where it prevents injuries and protects public/worker health; transport-standard compliance alone is not public health."),
"vector control officer": ("supported", "Plans and implements control of disease-transmitting vectors, directly preventing population-level disease."),
}
EXTRA_SOURCES = {
"biostatistician": ["https://www.cdc.gov/nerd-academy/data-collection/index.html", "https://www.cdc.gov/surv-manual/php/table-of-contents/chapter-20-analysis-of-surveillance-data.html"],
"disease surveillance officer": ["https://www.cdc.gov/ophdst/data-research/index.html"],
"emergency response coordinator": ["https://www.who.int/publications/i/item/B09726"],
"health communication specialist": ["https://www.cdc.gov/public-health-risk-communication/php/about/understanding-risk-communication.html"],
"health economist": ["https://www.who.int/teams/health-financing-and-economics/economic-analysis"],
"health programme officer": ["https://eurohealthobservatory.who.int/publications/i/developing-the-public-health-workforce"],
"public health physician": ["https://eurohealthobservatory.who.int/publications/i/developing-the-public-health-workforce"],
"vector control officer": ["https://www.who.int/teams/control-of-neglected-tropical-diseases/interventions/strategies/vector-control"],
}

def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"): return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/" + ref[5:].split("@", 1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@", 1)[0]
    return None

def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in queue["role_mappings"] if row["domain_id"] == "D026"]
    if len(rows) != 26 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D026 exact role queue changed; re-adjudicate before generation")
    decisions=[]
    for row in rows:
        status,basis=RULINGS[row["role_name"]]
        refs=list(dict.fromkeys(url for ref in row["task_source_refs"] if (url:=source_url(ref))))
        refs.extend(url for url in EXTRA_SOURCES.get(row["role_name"],[]) if url not in refs)
        if not refs: raise SystemExit(f"Missing task source reference for {row['role_key']}")
        decisions.append({"role_key":row["role_key"],"domain_fit_status":status,"task_evidence":row["role_task_text"],
            "basis":basis,"source_refs":refs,
            "source_limit":"ESCO/O*NET tasks are representative occupational evidence; O*NET is US-contextual. WHO/CDC sources support public-health functions, not universal job titles or local legal scope. Conditional cases require the health-protection, clinical or population-health assignment specified."})
    counts=Counter(item["domain_fit_status"] for item in decisions)
    artifact={"schema_version":1,"domain_id":"D026","domain_name":rows[0]["domain_name"],
        "scope":"D026 only; task fit to parent Public Health domain. No subgroup or role-to-specialization decisions.",
        "domain_scope":rows[0]["parent_domain_scope"],
        "method":"Compare exact tasks with community/population health protection, prevention, surveillance, health communication, emergency preparedness/response and population-health evidence. Supported means direct public-health action or evidence; conditional requires the health-protection or population-health assignment stated in the rationale; broader safety/environmental/regulatory work is not automatically public health. No fit inferred from title, ISCO/ESCO family or subgroup membership.",
        "source_limit_policy":"ESCO/O*NET descriptions are representative; O*NET is US-based. WHO/CDC sources corroborate public-health functions but do not determine jurisdiction-specific titles, licensing or regulatory authority.",
        "counts":{"reviewed_role_mappings":len(decisions),**{key:counts.get(key,0) for key in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(artifact,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":artifact["counts"]},ensure_ascii=False))

if __name__=="__main__": main()
