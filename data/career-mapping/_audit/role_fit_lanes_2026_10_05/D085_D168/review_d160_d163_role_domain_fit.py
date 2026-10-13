"""Generate exact-key, source-aware parent-domain reviews for D160-D163."""
import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
S, C, U, R = "supported", "conditional", "unsupported_for_domain", "unresolved"
SOURCES = {
    "QUEUE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact role key, recorded role task and parent-domain scope.", "limit": "The catalogue text is the mapping under review, not independent proof of the occupation."},
    "AICI": {"publisher": "Association of Image Consultants International", "url": "https://www.aici.org/page/Image_Consulting", "locator": "Image consulting includes personal image/wardrobe consultation, personal shopping and styling; services and specialties vary.", "limit": "Professional association description, not a statutory scope or universal job taxonomy."},
    "ILO_HAIR": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Groups 5141/5142 describe hair care, hairstyling, beauty treatments and makeup tasks.", "limit": "ISCO is used only to clarify task functions; it does not establish this catalogue's domain mapping."},
    "OCHA_HPC": {"publisher": "United Nations Office for the Coordination of Humanitarian Affairs", "url": "https://www.unocha.org/humanitarian-programme-cycle", "locator": "Humanitarian programme cycle covers needs assessment/analysis, planning, resource mobilization, implementation and monitoring/evaluation/reporting.", "limit": "Operational framework, not a universal job-title register."},
    "WHO_EMT": {"publisher": "World Health Organization", "url": "https://www.who.int/news-room/questions-and-answers/item/emergencies-emergency-medical-teams", "locator": "Emergency medical teams provide clinical care to people affected by disasters, outbreaks and other emergencies; WHO also defines coordination/preparedness standards.", "limit": "Emergency-health functions do not automatically make every EMS or clinical role humanitarian-aid work."},
    "SPHERE": {"publisher": "Sphere Association", "url": "https://spherestandards.org/handbook/", "locator": "Humanitarian Charter and minimum standards for humanitarian response and accountable assistance.", "limit": "Standards for humanitarian response, not a role taxonomy."},
    "UNHCR_RSD": {"publisher": "UN High Commissioner for Refugees", "url": "https://emergency.unhcr.org/protection/legal-framework/refugee-status-determination-rsd", "locator": "Refugee status determination, access to legal representation, appeal mechanisms and legal/administrative case decisions.", "limit": "UNHCR operational guidance; domestic immigration law and authorization to practise vary by jurisdiction."},
    "UNHCR_ASYLUM": {"publisher": "UN High Commissioner for Refugees", "url": "https://help.unhcr.org/global/asylum-and-refugee-status/", "locator": "Asylum and refugee-status process, including legal or administrative eligibility decisions under applicable law.", "limit": "General information; national procedures and legal rights differ."},
    "WIPO_IP": {"publisher": "World Intellectual Property Organization", "url": "https://www.wipo.int/en/web/patents/faq_patents", "locator": "Patent application drafting and prosecution may require patent-agent/attorney support; authorized representation and qualifications depend on national/regional law.", "limit": "WIPO does not define one globally uniform licensing route or protected title."},
    "WIPO_HANDBOOK": {"publisher": "World Intellectual Property Organization", "url": "https://tind.wipo.int/record/28661/files/wipo_pub_489.pdf", "locator": "IP professionals advise on acquisition, protection, licensing, maintenance and conflicts concerning industrial property rights.", "limit": "Professional titles and reserved legal functions are jurisdiction-dependent."},
}

# Values are (disposition, reason, authoritative support). Disposition is per
# exact parent/role key; it is never inherited from ISCO, subgroup or title.
REVIEWS = {
 "D160": {
  "Fashion Designers": (C,"Designs clothing/accessories; this is a product-design function, not client styling or image consulting. It is relevant only where the role's actual remit includes styling/wardrobe services.","AICI"),
  "Hairdressers, Hairstylists, and Cosmetologists": (S,"The recorded services explicitly include hairstyling, makeup, wig dressing and appearance-related beauty services named within this parent scope.","ILO_HAIR"),
  "beauty salon attendant": (C,"Provides salon reception, scheduling, stock, payments and client information; the record supports salon-context operations, not delivery of styling/image-consulting work.","QUEUE"),
  "beauty salon manager": (C,"Manages a beauty salon and its services, but the record does not establish a styling/image-consulting specialty rather than general salon management.","AICI"),
  "beauty vocational teacher": (C,"Teaches cosmetology, makeup and hair-design practical skills, so it can support this field; it is an educator role rather than a styling service role itself.","ILO_HAIR"),
  "clothing fashion designer": (C,"Develops clothing collections and trend-led concepts. Styling may use this expertise, but clothing product design alone does not establish image-consulting or personal-shopping duties.","AICI"),
  "fashion designer": (C,"Designs fashion products and ranges, including clothing, footwear or accessories; that is adjacent to styling, but not equivalent to styling people/products for clients or productions.","AICI"),
  "fashion model": (C,"Models clothing/cosmetics and maintains appearance for promotion; it participates in image presentation but does not perform styling, consulting or shopping tasks.","AICI"),
  "hair stylist": (S,"Styles performers' hair and wigs to an artistic brief, directly matching the parent scope's hair designers and complete-look work.","ILO_HAIR"),
  "hairdresser": (S,"Provides customised cutting, colouring and styling and hair/scalp treatments, directly matching hair-design and appearance-service scope.","ILO_HAIR"),
  "hairdresser assistant": (C,"Assists with shampooing and hair treatments; the task record is support work and does not establish independent styling duties.","ILO_HAIR"),
  "performance hairdresser": (S,"Styles and maintains performers' hair and wigs to a production's artistic brief, directly within styling and media-production work.","ILO_HAIR"),
 },
 "D161": {
  "Ambulance Drivers and Attendants, Except Emergency Medical Technicians": (C,"Transports sick or injured people; this is an emergency-health support task, but the record does not establish humanitarian/disaster deployment.","WHO_EMT"),
  "Emergency Management Directors": (S,"Plans and directs disaster response, preparedness training and emergency plans for natural, wartime and technological hazards, squarely matching emergency-response coordination.","SPHERE"),
  "Emergency Medical Technicians": (C,"Provides basic emergency medical care and may transport patients. It is in scope when deployed as emergency/disaster humanitarian care; the generic task does not establish that context.","WHO_EMT"),
  "Emergency Medicine Physicians": (C,"Provides urgent recognition, stabilization and treatment. The clinical function is relevant to humanitarian emergencies when deployed in that setting, but ordinary emergency-department practice is not by itself humanitarian aid.","WHO_EMT"),
  "ICT disaster recovery analyst": (U,"Maintains business ICT continuity, backups and data recovery; the recorded beneficiary and work are organizational IT continuity, not relief delivery or disaster-response programming.","OCHA_HPC"),
  "crisis helpline operator": (C,"Provides remote support to people in distress, but the task spans personal crises and does not establish humanitarian emergency or international-development programming.","SPHERE"),
  "crisis situation social worker": (C,"Assesses risk and stabilizes people in crisis; relevant in emergency/displacement response, but the generic task also covers non-humanitarian clinical/community work.","SPHERE"),
  "emergency ambulance driver": (C,"Responds to medical emergencies and transports patients. Humanitarian/disaster deployment would fit; routine ambulance response alone does not demonstrate it.","WHO_EMT"),
  "emergency medical dispatcher": (C,"Takes emergency calls and dispatches ambulances/paramedics; this is emergency-service operations, but not necessarily humanitarian relief or disaster response.","WHO_EMT"),
  "emergency response coordinator": (S,"Assesses community/institution hazards, plans and tests response, educates at-risk parties and prepares supplies, directly matching emergency preparedness and coordination.","SPHERE"),
  "emergency response worker": (S,"Works on disaster/emergency missions, protects people, limits damage and transports food/medical supplies, directly matching response and relief delivery.","SPHERE"),
  "humanitarian advisor": (S,"Advises on strategies to reduce humanitarian crises and coordinates partners at national/international level, directly matching humanitarian programming.","OCHA_HPC"),
  "mine rescue officer": (C,"Coordinates underground mine rescue; it is a specialized industrial emergency function, but the task does not establish humanitarian aid, community disaster response or development work.","SPHERE"),
  "monitoring and evaluation officer": (C,"Designs and follows monitoring/evaluation over a programme cycle; directly relevant when the programme is humanitarian/development work, but the generic task spans other sectors.","OCHA_HPC"),
  "paramedic in emergency responses": (C,"Provides acute pre-hospital care. WHO recognizes emergency medical teams in disasters, but the task record does not establish deployment in humanitarian/emergency-response programmes.","WHO_EMT"),
  "procurement category specialist": (C,"Provides category-market and contract expertise; this supports humanitarian logistics when assigned to relief procurement, but the generic task is not sector-specific.","OCHA_HPC"),
  "rescue centre manager": (C,"Manages a rescue centre and safe rescue missions; this may be disaster response, but the task does not identify humanitarian/community disaster operations rather than other rescue settings.","SPHERE"),
  "rescue diver": (C,"Responds to underwater emergencies and rescues people/property; specialized rescue is relevant only when performed in a humanitarian/disaster-response context.","SPHERE"),
 },
 "D162": {
  "Customs Brokers": (U,"Handles customs documentation, tariffs, duties and import/export clearance; these are trade/customs functions, not immigration-law or asylum casework.","UNHCR_ASYLUM"),
  "Customs and Border Protection Officers": (C,"The record includes enforcing immigration laws at U.S. borders, but centers inspection/enforcement rather than legal advice, asylum representation or refugee-status casework; the U.S. agency context is not generalized globally.","UNHCR_RSD"),
  "customs and excise officer": (U,"Controls goods, customs barriers and excise/tax compliance, not immigration or asylum legal matters.","UNHCR_ASYLUM"),
  "customs officer": (U,"Inspects goods and enforces customs/tax restrictions; no immigration legal advice or asylum casework is recorded.","UNHCR_ASYLUM"),
  "immigration adviser": (S,"Advises people on immigration legislation and documentation to comply with immigration law, directly matching the parent’s adviser/casework scope; authorization requirements remain jurisdiction-specific.","UNHCR_RSD"),
  "immigration officer": (C,"Checks entry eligibility and documents and may interview prospective immigrants, but the task is border administration/enforcement, not legal representation or asylum casework.","UNHCR_RSD"),
  "immigration policy officer": (S,"Develops refugee/asylum integration and migration-transit policies and international cooperation, directly matching immigration/asylum policy work.","UNHCR_RSD"),
  "passport officer": (U,"Issues and records travel documents; the recorded task is document administration, not immigration-law advice, representation or asylum determination.","UNHCR_ASYLUM"),
 },
 "D163": {
  "Paralegals and Legal Assistants": (C,"Researches facts and precedent and prepares litigation documents; this supports IP practice only when assigned to patent, trademark, copyright or related matters, which the generic task does not specify.","WIPO_HANDBOOK"),
  "intellectual property consultant": (S,"Advises on patents, copyright, trademarks, valuation, protection procedures and patent brokerage, directly matching IP practice; regulated representation is jurisdiction-dependent.","WIPO_HANDBOOK"),
  "legal assistant": (C,"Provides legal research, case preparation and court administration, but the task does not identify IP matters; retain only with an IP-specific caseload.","WIPO_HANDBOOK"),
  "licensing manager": (S,"Manages product/IP rights, third-party licence compliance and licensing negotiations, directly matching IP licensing and rights management.","WIPO_HANDBOOK"),
  "licensing officer": (U,"Processes general licence applications and eligibility/fee compliance; no intellectual-property rights or patent practice is recorded.","WIPO_HANDBOOK"),
  "patent engineer": (S,"Analyzes inventions and patent rights and advises companies on IP protection, directly matching patent practice; this role label does not itself establish authorization to perform reserved legal representation.","WIPO_IP"),
 },
}

def main():
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
    for did, decisions_by_key in REVIEWS.items():
        rows = [r for r in queue if r["domain_id"] == did]
        by = {r["role_name"]: r for r in rows}
        if len(by) != len(rows) or set(by) != set(decisions_by_key):
            raise SystemExit(f"{did}: exact queued-key mismatch; refusing to write")
        decisions = []
        for key, (status, rationale, ref) in decisions_by_key.items():
            row = by[key]
            decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "domain_fit": status, "rationale": rationale, "source_refs": ["QUEUE", ref]})
        tally = Counter(d["domain_fit"] for d in decisions)
        removals = [{"role_key": d["role_key"], "action": "remove_from_parent_domain", "candidate_transfer_domain": None, "evidence_basis": d["rationale"], "canonical_change_made": False} for d in decisions if d["domain_fit"] == U]
        payload = {"schema_version":"1.0", "audit_date":date.today().isoformat(), "domain_id":did, "domain_name":rows[0]["domain_name"], "scope":rows[0]["domain_scope"], "method":"Exact-key comparison of recorded role tasks to parent-domain scope. Status is not inferred from role title, ISCO or subgroup. Conditional means context-specific/task evidence is required before treating the path as established. No role-to-specialization decision is made. Sources clarify task/domain boundaries, not the local canonical mapping.", "counts":{"mappings_reviewed":len(decisions),"supported":tally[S],"conditional":tally[C],"unsupported_for_domain":tally[U],"unresolved":tally[R]}, "decisions":decisions, "sources":SOURCES, "correction_proposals":removals, "separate_coverage_candidates":[], "notes":["Global role functions are distinguished from jurisdiction-specific authorization, licensing or agency structures.","No Nigeria-specific occupation variant is inferred from a global role record.","No canonical role/domain/subgroup data or role-to-specialization assignment was changed."]}
        stem=f"{did}_role_domain_fit_review_2026_10_05"
        (LANE/f"{stem}.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        lines=[f"# {did} role-to-parent-domain fit review — {payload['audit_date']}","",f"**Scope:** {payload['scope']}","",f"- Exact mappings reviewed: **{len(decisions)}**",f"- Supported: **{tally[S]}**",f"- Conditional: **{tally[C]}**",f"- Unsupported for parent: **{tally[U]}**",f"- Unresolved: **{tally[R]}**","","| Exact key | Recorded task evidence | Decision | Rationale |","|---|---|---|---|"]
        for d in decisions:
            task=d["task_evidence"].replace("|","\\|").replace("\n"," ")
            why=d["rationale"].replace("|","\\|")
            lines.append(f"| `{d['role_key']}` | {task} | {d['domain_fit']} | {why} |")
        lines += ["","## Non-canonical correction proposals",""]
        lines += [f"- `{x['role_key']}` — remove from parent domain: {x['evidence_basis']} No canonical change made." for x in removals] or ["- None."]
        lines += ["","## Sources and limits",""]
        for key, src in SOURCES.items():
            lines.append(f"- **{key} — {src['publisher']}**: [{src['url']}]({src['url']}). {src['locator']} Limit: {src['limit']}")
        lines += ["","## Notes",""] + [f"- {n}" for n in payload["notes"]]
        (LANE/f"{stem}.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
        print(did, json.dumps(payload["counts"]))

if __name__ == "__main__":
    main()
