"""Materialize manually adjudicated D022 role-to-parent-domain decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D022_role_domain_fit_2026_10_05.json"
RULINGS={
"assayer":("supported","The role tests precious-metal ores/materials to determine composition and value, a direct minerals/extraction support task."),
"Calibration Technologists and Technicians":("conditional","The occupation calibrates measurement instruments across sectors; D022 fit requires calibration work on mine, drilling, geological or mineral-processing equipment."),
"chemical metallurgist":("supported","The role extracts usable metals from ores and studies metal properties, directly matching mineral extraction and processing."),
"Derrick Operators, Oil and Gas":("supported","The O*NET task rigs derrick equipment and circulates drilling fluid through oil/gas wells, directly within D022."),
"derrickhand":("supported","The role handles drill pipes and drilling-fluid conditions on extraction rigs, directly supporting oil/gas drilling operations."),
"dewatering technician":("conditional","The role operates pumping/vacuum systems to remove liquids and chemicals; D022 fit requires mine/deposit dewatering, not general construction/industrial dewatering."),
"drill operator":("supported","The role supervises rigging/drilling and monitors well activity and emergencies, directly within extraction operations."),
"driller":("conditional","The profile covers drilling for mineral exploration and shotfiring as well as construction; D022 fit is the mineral/extraction assignment, not construction drilling."),
"drilling engineer":("supported","The role designs/tests wells and supervises land/offshore oil-and-gas drilling, directly within D022."),
"Earth Drillers, Except Oil and Gas":("conditional","The role drills for mineral exploration/core sampling as well as water, salt and soil testing; fit requires mineral exploration/extraction work."),
"environmental geologist":("conditional","The profile assesses impacts of mineral operations and reclamation/pollution; D022 fit is mining geology/environmental performance, while remediation practice may also sit in environmental engineering."),
"exploration geologist":("supported","The role prospectively identifies and evaluates economically viable mineral deposits and executes exploration, directly within D022."),
"explosives engineer":("supported","The role designs mine/drilling blast patterns, calculates charges and supervises controlled blasting and misfire investigations."),
"Explosives Workers, Ordnance Handling Experts, and Blasters":("conditional","The O*NET group includes demolition and earth-removal blasting as well as extraction; D022 fit requires mine/quarry/extraction blasting."),
"Extraction Workers, All Other":("unresolved","The residual O*NET category contains no task statement beyond 'all extraction workers not listed separately'; the actual extraction activity cannot be independently verified from this profile."),
"geochemist":("conditional","The role studies chemical elements in rocks/soils and coordinates mineral sampling; D022 fit requires ore/mineral exploration or extraction geochemistry rather than unrelated environmental/geochemical research."),
"geologist":("conditional","The profile spans many geological specialties; D022 fit requires mineral, petroleum or quarry exploration/site work, not geology in general."),
"geophysicist":("conditional","The role applies physical measurements to geological structures; D022 fit requires resource exploration/extraction geophysics, not other earth-science applications."),
"geotechnician":("supported","The role collects/processes rock and soil samples for geomechanical testing and includes mine-geotechnical work, directly supporting extraction-site operations."),
"Helpers--Extraction Workers":("supported","The O*NET helper supports drillers, blasters, derrick operators and mining-machine operators, directly within extraction crews."),
"hydrogeologist":("supported","The profile studies groundwater to keep mine workings dry and ensure process-water supply, directly supporting mine planning/operation."),
"hydrologist":("conditional","The role studies water distribution/quality generally; D022 fit is mine-water management, extraction-site supply or dewatering, not hydrology in other sectors."),
"liquid fuel engineer":("supported","The role evaluates and designs extraction methods for subsurface liquid fuels such as petroleum, directly within D022."),
"Loading and Moving Machine Operators, Underground Mining":("supported","The O*NET role operates underground equipment to load/move coal, ore or rock, a direct extraction task."),
"metallurgical technician":("conditional","The profile supports experiments on minerals/metals and oil/gas and improves processing methods across sectors; D022 fit requires mining, mineral or extraction-process work."),
"metallurgist":("supported","The role extracts and processes metals from ores and develops alloys, directly matching D022 mineral processing."),
"mine development engineer":("supported","The role designs mine development, tunneling, sinking and extraction access operations, directly within D022."),
"mine geologist":("supported","The role locates/classifies mineral resources and advises mine managers/engineers on their geological structure."),
"mine health and safety engineer":("supported","The role develops systems to prevent illness/injury and improve safety conditions specifically in mines."),
"mine manager":("supported","The role plans and directs mine production, safety and environmental impact and coordinates mining operations."),
"mine mechanical engineer":("supported","The role procures, installs and maintains mechanical equipment specifically for mining operations."),
"mine planning engineer":("supported","The role designs future mine layouts and production/development plans using geological characteristics and structure."),
"mine production manager":("supported","The role coordinates mine production schedules for drilling, blasting, extraction and waste management."),
"mine safety officer":("supported","The role oversees safety systems and risk/accident reporting specifically at mining operations."),
"mine surveying technician":("supported","The role performs boundary, topographic and progress surveys for mining operations."),
"mine ventilation engineer":("supported","The role designs and manages air-circulation systems to supply fresh air and remove noxious gases in underground mines."),
"mineral processing engineer":("supported","The role develops equipment and techniques to process/refine ore and raw minerals, directly within D022."),
"mineralogist":("conditional","The role studies mineral composition/structure broadly; D022 fit requires mineral-resource characterization tied to exploration, extraction or processing."),
"Mining, Petroleum and Other Extraction Workers":("unresolved","The WEF trend category groups several extraction occupations but does not provide a task profile for a specific role; growth/trend evidence alone cannot establish role fit."),
"mud logger":("supported","The role analyzes drilling-fluid samples and identifies hydrocarbon position during drilling, directly supporting petroleum exploration."),
"oil and gas production manager":("supported","The role plans and coordinates drilling, extraction and waste-management operations in oil/gas production."),
"oil rig motorhand":("supported","The role maintains engines and equipment that power oil-rig drilling operations."),
"petroleum engineer":("supported","The role evaluates oil/gas fields and designs extraction methods to recover petroleum resources, directly within D022."),
"pipeline pump operator":("conditional","The role pumps crude oil/gas and other substances through pipelines; D022 fit is field-gathering/extraction operations, not midstream transport/distribution alone."),
"process metallurgist":("supported","The role evaluates ores and metals/alloys and their processing performance, directly matching mineral processing."),
"quarry engineer":("supported","The role selects extraction methods and plans quarry operations for raw materials, directly within D022."),
"quarry manager":("supported","The role manages quarry extraction, processing and transport operations under health/safety requirements."),
"Rock Splitters, Quarry":("supported","The O*NET role separates dimension stone blocks from quarry rock, a direct quarry extraction task."),
"Roof Bolters, Mining":("supported","The O*NET role installs roof-support bolts in underground mines, a direct mine-operation/safety task."),
"Rotary Drill Operators, Oil and Gas":("supported","The O*NET role operates drilling rigs to extract oil/gas or collect exploration samples, directly within D022."),
"roughneck":("supported","The role handles drill-pipe connections and core sampling on a drilling rig, directly supporting extraction drilling."),
"roustabout":("supported","The role maintains/repairs oilfield rig equipment and performs field-site labor, directly supporting oil/gas extraction operations."),
"Roustabouts, Oil and Gas":("supported","The O*NET role assembles/repairs oilfield equipment and supports rig operations, directly within D022."),
"surface miner":("supported","The role performs mine-site operations such as pumping, dust suppression and material/equipment movement in surface extraction."),
"tool pusher":("supported","The role manages day-to-day drilling-rig operations, materials and workforce readiness, directly within D022."),
"tunnel boring machine operator":("conditional","The role operates tunneling machines for varied projects; D022 fit requires mine/extraction tunnels rather than civil transport or utility tunneling."),
"underground heavy equipment operator":("supported","The role operates heavy machinery to excavate and load ore/raw minerals in underground mines."),
"underground miner":("supported","The role carries out underground mine inspection, transport and ancillary extraction operations."),
"Underground Mining Machine Operators, All Other":("supported","The O*NET residual is explicitly limited to underground mining machine operators; despite residual title, the stated occupational domain is mining machinery operation."),
"well-digger":("conditional","The role drills/maintains wells for ore and other liquids/gases but also water wells; D022 fit requires mineral/fuel extraction wells."),
}
def source_url(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D022"]
    if len(rows)!=60 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D022 exact queue changed; re-adjudicate before generation")
    decisions=[]
    for r in rows:
        status,basis=RULINGS[r["role_name"]]
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=source_url(x))))
        if r["role_evidence_state"]=="unsourced" and not refs: refs=["https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"]
        if not refs: raise SystemExit(f"Missing source ref for {r['role_key']}")
        decisions.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Task evidence is taken from the exact-key ESCO/O*NET payload. These are representative occupational tasks; O*NET is US-based. Conditional cases require mineral/fuel extraction or mining context. WEF trend provenance is not used as task evidence."})
    c=Counter(x["domain_fit_status"] for x in decisions)
    a={"schema_version":1,"domain_id":"D022","domain_name":rows[0]["domain_name"],"scope":"D022 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Compare exact tasks to finding/exploring/extracting minerals, oil/gas and quarry materials; mine/quarry planning and operations; drilling, geological/mineral testing, underground equipment, and extraction safety. Supported requires direct task evidence. Conditional is used for cross-sector earth-science, drilling, pumping or blasting work only in the extraction setting named in the rationale. Residual trend labels without tasks remain unresolved. No fit inferred from title/subgroup/ISCO family.","source_limit_policy":"ESCO/O*NET occupational tasks are representative; O*NET is US-based. WEF growth/stability categories do not define duties. This is parent-domain task fit, not a claim about licensing or a specific employer's assignment.","counts":{"reviewed_role_mappings":len(decisions),**{s:c.get(s,0) for s in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
