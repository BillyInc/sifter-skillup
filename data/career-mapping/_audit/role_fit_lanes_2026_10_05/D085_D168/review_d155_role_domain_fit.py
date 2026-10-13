"""Build exact-key D155 role-to-parent-domain fit review; audit-only."""
import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE=Path(__file__).resolve().parent
QUEUE=LANE/'D085_D168_role_fit_queue_2026_10_05.json'
OUT_JSON=LANE/'D155_role_domain_fit_review_2026_10_05.json'
OUT_MD=LANE/'D155_role_domain_fit_review_2026_10_05.md'
SOURCES={
 'QUEUE_TASK_PROFILE': {'publisher':'Checked-in role/domain audit queue','url':'D085_D168_role_fit_queue_2026_10_05.json','locator':'Exact D155 role keys, stored task descriptions and parent scope.','supports':'The actual duties assessed for each mapping.','limit':'The queue is the mapping under review, not independent verification of the full occupation.'},
 'NIST_MATERIALS_SCIENCE': {'publisher':'U.S. National Institute of Standards and Technology (NIST), Materials Science and Engineering Division','url':'https://www.metallurgy.nist.gov/','locator':'Division scope: structure-property-processing relationships; metallurgy, polymers, functional and nanoscale materials, advanced devices and manufacturing.','supports':'Distinguishing advanced/materials-engineering work from generic chemistry or measurement tasks.','limit':'NIST is a U.S. national institute; its research portfolio is an authoritative technical example, not a universal taxonomy or employment rule.'},
 'NIST_NANOTECHNOLOGY': {'publisher':'U.S. National Institute of Standards and Technology (NIST)','url':'https://www.nist.gov/nanotechnology','locator':'Nanotechnology program covers nanoscale measurement, standards, nanochemistry and nanomaterials.','supports':'Nanoscale science, engineering and measurement as a specific task context.','limit':'A U.S. national program page; it clarifies technical scope but does not define occupational titles globally.'},
 'SIA_FRONT_END_FABRICATION': {'publisher':'Semiconductor Industry Association (SIA)','url':'https://www.semiconductors.org/semiconductors-101/how-are-semiconductors-made/stage-3-front-end-manufacturing/','locator':'Front-end wafer fabrication description: oxidation, lithography, doping, deposition, etching, planarization and metrology.','supports':'Semiconductor-processing records involving material layers, wafers and fabrication operations.','limit':'Industry overview; semiconductor manufacturing alone does not prove that a role works on advanced/nanoscale materials or materials R&D.'},
 'NIST_NANOMANUFACTURING': {'publisher':'NIST','url':'https://www.nist.gov/publications/integration-interoperability-and-information-management-what-are-key-issues','locator':'Nanomanufacturing definition: design, produce, control, modify, manipulate and assemble nanoscale objects/features into products or systems.','supports':'The specialized nanoscale production boundary.','limit':'A technical conference paper from 2007; useful definition, not current job taxonomy.'},
}
S='supported'; C='conditional'; U='unsupported_for_domain'
DECISIONS={
 'D155|Materials Engineers':(C,'The task spans many conventional materials (metals, ceramics, glass, polymers and composites); no advanced-materials or nanoscale assignment is specified, so only an identified advanced-materials remit establishes the link.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|Nanotechnology Engineering Technologists and Technicians':(S,'Operates equipment and manipulates nanoscale objects in commercial-scale production; the task expressly establishes the nanoscale technology remit.',['QUEUE_TASK_PROFILE','NIST_NANOTECHNOLOGY','NIST_NANOMANUFACTURING']),
 'D155|Semiconductor Processing Technicians':(C,'Performs wafer, furnace, crystal-growth, polishing and chemical-bath fabrication tasks. These are materially relevant semiconductor processes, but the record does not establish advanced-materials research or a specific nanoscale fabrication context.',['QUEUE_TASK_PROFILE','SIA_FRONT_END_FABRICATION']),
 'D155|advanced materials scientist':(S,'Researches novel materials with enhanced properties across technology, energy and biomedical applications, directly matching advanced-materials research.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|analytical chemist':(C,'Analyzes chemical composition and behavior, but the task is cross-sector and does not establish advanced-materials or nanoscale substances.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|chemical engineer':(C,'Develops large-scale chemical/physical production processes from raw materials; fit depends on an advanced-materials or nanomaterials process assignment not stated in the task.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|chemist':(C,'Conducts broad chemical analysis, research and industrial quality work. The record does not specify advanced materials, nanoscale characterization or materials development.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|materials engineer':(C,'Develops and analyzes materials across many industries and material classes. The task fits the parent when the material is advanced or nanoscale, but does not make that specialization universal.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|metrologist':(C,'Develops measurement systems and methods across science. Nanoscale/metrology work fits, but the stored task does not specify materials or nanoscale measurement.',['QUEUE_TASK_PROFILE','NIST_NANOTECHNOLOGY']),
 'D155|microelectronics materials engineer':(S,'Designs and supervises materials for microelectronics/MEMS and investigates material structures and failure mechanisms; this is explicit advanced electronic-materials engineering.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|nanoelectronics specialist':(S,'Develops electronic components and circuits at nanoscale, directly establishing nanotechnology and advanced-device work.',['QUEUE_TASK_PROFILE','NIST_NANOTECHNOLOGY']),
 'D155|nanofabrication technician':(S,'Fabricates nanoscale structures/devices in cleanroom research and production settings, directly matching the domain.',['QUEUE_TASK_PROFILE','NIST_NANOMANUFACTURING']),
 'D155|nanomaterials engineer':(S,'Designs and develops materials at nanoscale for electronics, medicine, energy and manufacturing, directly matching the parent.',['QUEUE_TASK_PROFILE','NIST_NANOTECHNOLOGY']),
 'D155|semiconductor processor':(C,'Manufactures, tests and repairs semiconductor devices in cleanrooms. Semiconductor fabrication is relevant, but the task does not establish a nanoscale/advanced-materials specialty rather than general device production.',['QUEUE_TASK_PROFILE','SIA_FRONT_END_FABRICATION']),
 'D155|surface science engineer':(S,'Engineers material-surface properties, coatings, adhesion and interfaces; these are direct materials-science tasks within advanced materials.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
 'D155|synthetic materials engineer':(C,'Develops synthetic-material processes and production installations, but the record does not specify advanced performance properties or nanoscale materials.',['QUEUE_TASK_PROFILE','NIST_MATERIALS_SCIENCE']),
}

def main():
 q=json.loads(QUEUE.read_text(encoding='utf-8'))['unresolved_rows']; rows=[r for r in q if r['domain_id']=='D155']; by={r['role_key']:r for r in rows}
 if len(by)!=len(rows) or set(by)!=set(DECISIONS): raise SystemExit('D155 exact-key mismatch; refusing partial generation.')
 decisions=[]
 for key,(fit,why,refs) in DECISIONS.items():
  r=by[key]; decisions.append({'role_key':key,'role_name':r['role_name'],'task_evidence':r['role_description'],'esco_uri':(r.get('esco_occupation_uris') or [None])[0],'onet_codes':r.get('onet_occupation_codes',[]),'domain_fit':fit,'rationale':why,'source_refs':refs})
 tally=Counter(x['domain_fit'] for x in decisions)
 payload={'schema_version':'1.0','audit_date':date.today().isoformat(),'domain_id':'D155','domain_name':rows[0]['domain_name'],'scope':rows[0]['domain_scope'],'method':'Exact-key task-to-parent-domain comparison. No inference from job title, ISCO/subgroup, or role frequency. Specialized scope must be present in the stored duties; broad occupations are conditional when the task record leaves the relevant materials/nanoscale context unspecified. No role-to-specialization assignment is made.','counts':{'mappings_reviewed':len(decisions),'supported':tally[S],'conditional':tally[C],'unsupported_for_domain':tally[U],'unresolved':tally['unresolved']},'decisions':decisions,'sources':SOURCES,'correction_proposals':[],'separate_coverage_candidates':[],'notes':['Conditional means the broad role can fit only where an advanced-materials or nanoscale assignment is established; it is not a confirmed requirement for every holder of that occupation.','Semiconductor process work is distinguished from nanoscale materials R&D; the source supports process context, not automatic domain fit.','No Nigeria-specific variant is inferred from these global task descriptions.','No canonical role/domain/subgroup data or role-to-specialization assignment was changed.']}
 OUT_JSON.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 lines=[f"# D155 role-to-parent-domain fit review — {payload['audit_date']}",'',f"Scope: {payload['scope']}",'',f"- Exact queued roles reviewed: **{len(decisions)}**",f"- Supported: **{tally[S]}**",f"- Conditional: **{tally[C]}**",f"- Unsupported for this parent: **{tally[U]}**",f"- Unresolved: **{tally['unresolved']}**",'','| Exact role key | Recorded task evidence | Parent fit | Rationale |','|---|---|---|---|']
 for x in decisions: lines.append(f"| `{x['role_key']}` | {x['task_evidence'].replace('|','\\|').replace(chr(10),' ')} | {x['domain_fit']} | {x['rationale'].replace('|','\\|')} |")
 lines+=['','## Sources and limitations','']+[f"- **{k} — {v['publisher']}**: [{v['url']}]({v['url']}). {v['locator']} Supports: {v['supports']} Limit: {v['limit']}" for k,v in SOURCES.items()]+['','## Audit notes','']+[f'- {n}' for n in payload['notes']]
 OUT_MD.write_text('\n'.join(lines)+'\n',encoding='utf-8'); print(json.dumps(payload['counts'],indent=2))
if __name__=='__main__': main()
