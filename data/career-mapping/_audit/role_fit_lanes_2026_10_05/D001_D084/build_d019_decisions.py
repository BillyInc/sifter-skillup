"""Materialize manually adjudicated D019 role-to-parent-domain decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D019_role_domain_fit_2026_10_05.json"
RULINGS={
"battery simulation engineer":("conditional","Battery modeling is relevant where the modeled system is renewable-generation storage; this broad profile also covers batteries for unrelated applications."),
"battery system engineer":("conditional","Battery-system development fits renewable engineering when the storage solution is integrated with renewable generation; the occupation also serves EV/electronics applications."),
"electric power generation engineer":("conditional","The role designs power-generation systems and explicitly seeks sustainable solutions, but may work on non-renewable generation; renewable-source assignment is required."),
"electrical engineer":("conditional","The profile covers electrical equipment, power stations, transmission and distribution generally; D019 fit is specifically renewable-generation or renewable-grid work."),
"electrical power distributor":("conditional","The role maintains networks delivering electricity to consumers; include where operating/integrating renewable generation into the grid, not distribution work irrespective of source."),
"electrical transmission system operator":("conditional","The role operates the electricity transmission grid; D019 fit is the renewable-generation integration/dispatch portion, since the occupation serves all generation sources."),
"electricity distribution technician":("conditional","The role builds and maintains power lines and distribution systems; D019 fit requires work on renewable-connected lines or renewable system interconnection."),
"electromechanical engineer":("conditional","The role designs mixed electrical/mechanical equipment; include where the equipment is part of a renewable generation/storage plant, not generic electromechanical machinery."),
"geothermal power plant operator":("supported","The role operates and maintains a geothermal power plant producing electricity, a direct renewable-energy source and plant operation task."),
"hydroelectric plant operator":("supported","The role operates and maintains a plant generating power from moving water, directly matching renewable generation."),
"offshore renewable energy plant operator":("supported","The role operates offshore wind, wave or tidal generation equipment, explicitly renewable marine energy."),
"onshore wind farm technician":("supported","The role operates, diagnoses and repairs onshore wind farms and turbines."),
"overhead line worker":("conditional","The role builds/maintains overhead electrical cables; D019 fit is limited to lines serving or connecting renewable generation, not all grid-line work."),
"power distribution engineer":("conditional","The role designs/optimizes electricity distribution facilities; the task is D019-relevant when serving renewable generation/interconnection, while the profile covers all electricity sources."),
"power plant control room operator":("conditional","The role operates power plants and associated controls, but the profile is source-neutral; renewable plant assignment must be established."),
"power production plant operator":("conditional","The role operates energy production plants across sources; D019 fit requires a renewable plant such as solar, wind, hydro, geothermal or biomass."),
"solar energy technician":("supported","The role installs and maintains solar collection/panel systems and connects them through inverters to electricity systems."),
"solar power plant operator":("supported","The role operates and maintains solar electricity-generation equipment directly within D019."),
"steam turbine operator":("conditional","The role operates power-generating steam turbines, but steam generation may be fossil or nuclear; D019 fit requires a renewable heat source such as geothermal or biomass."),
"substation engineer":("conditional","The role designs substations for generation/transmission/distribution generally; D019 fit is renewable generation interconnection and associated substation engineering."),
}

def source_url(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None

def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows=[r for r in q["role_mappings"] if r["domain_id"]=="D019"]
    if len(rows)!=20 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D019 exact queue changed; re-adjudicate before generation")
    decisions=[]
    for r in rows:
        status,basis=RULINGS[r["role_name"]]
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=source_url(x))))
        if not refs: raise SystemExit(f"Missing task source for {r['role_key']}")
        decisions.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Task evidence is copied from the exact-key ESCO source payload. The occupation profile may be source-neutral; conditional fit requires the renewable-generation context stated in the rationale. This is task-fit evidence, not a claim that the occupation is exclusively renewable."})
    c=Counter(x["domain_fit_status"] for x in decisions)
    a={"schema_version":1,"domain_id":"D019","domain_name":rows[0]["domain_name"],"scope":"D019 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Compare the exact task with renewable electricity generation/storage and related renewable-connected transmission/network work. Supported requires an explicitly renewable source/plant. Conditional means the occupation can perform relevant work but the source task is generation-source-neutral or the renewable integration context must be established. No fit from title/ISCO/subgroup alone.","source_limit_policy":"ESCO task profiles describe representative tasks, not each employer's assignment. Generic power-grid/plant work is not assumed to be renewable. This is parent-domain fit only.","counts":{"reviewed_role_mappings":len(decisions),**{s:c.get(s,0) for s in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
