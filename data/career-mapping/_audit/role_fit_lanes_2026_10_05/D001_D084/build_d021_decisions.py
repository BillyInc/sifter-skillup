"""Materialize manually adjudicated D021 role-to-parent-domain decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D021_role_domain_fit_2026_10_05.json"
RULINGS={
"architect":("supported","The ESCO profile designs and oversees buildings, urban spaces and infrastructure under planning and building constraints, directly matching D021."),
"Architects and Surveyors":("unresolved","This is a WEF trend label combining two broad occupations and provides no task description; the growth category cannot establish D021 fit."),
"Architects, Except Landscape and Naval":("supported","O*NET describes planning and designing buildings and structures, a direct architectural task in D021."),
"building inspector":("supported","The role inspects building construction, quality, resistance and code/specification compliance, directly in D021's built-environment scope."),
"cadastral technician":("supported","The role maps and updates property boundaries, ownership and land-use records for a community, directly supporting land administration/planning."),
"cartographer":("conditional","The profile creates maps for many purposes; D021 fit requires topographic, urban, land-use or planning maps rather than unrelated cartography."),
"Cartographers and Photogrammetrists":("conditional","O*NET describes maps and spatial data for many purposes; include where the work supplies topographic, cadastral or urban-planning information."),
"civil engineering technician":("conditional","The role supports construction planning and execution; D021 fit is limited to building/urban-development project support, while the occupation also serves civil infrastructure."),
"engineering assistant":("conditional","The profile assists engineers and administers project/site information across fields; D021 fit requires architecture, planning or built-environment project duties."),
"Geodetic Surveyors":("supported","The role measures large areas of Earth's surface using GNSS, satellite and LIDAR observations, directly supporting land/site surveying and spatial planning."),
"geographic information systems specialist":("conditional","The role processes land/geospatial data into maps; D021 fit requires use in land-use, urban, building or transport planning, rather than unrelated GIS applications."),
"hydrographic surveyor":("conditional","The role maps marine topography; D021 fit is limited to coastal, harbor or marine-infrastructure planning, not hydrography generally."),
"interior architect":("supported","The role plans building interiors and spatial layouts, explicitly within D021's building/interior design scope."),
"land planner":("supported","The role analyzes sites and prepares land-use/development plans with safety and efficiency considerations, directly matching D021."),
"land surveyor":("supported","The role measures site positions and boundaries for construction purposes, directly supporting architecture and built-environment planning."),
"landscape architect":("supported","The role plans and designs gardens/natural spaces and allocates their layout, directly matching D021's designed spaces around buildings."),
"landscape designer":("supported","The role designs public outdoor areas, parks, gardens and landmarks, a direct built-environment/public-space design activity."),
"mobility services manager":("conditional","The role develops sustainable/interconnected mobility programs; D021 fit requires integration into urban/transport planning, not operating a mobility service alone."),
"smart city consultant":("conditional","The role advises smart-city sustainability and digital initiatives; fit is limited to urban-planning/built-environment integration, not generic digital transformation."),
"surveying technician":("supported","The role maps land, creates construction drawings and uses precision measurement equipment, directly supporting D021 site and planning work."),
"transport planner":("supported","The role analyzes transport systems and develops transport policies/plans considering social, environmental and economic factors, directly within D021's urban/transport planning scope."),
"urban planner":("supported","The role develops town/city/region plans based on community, transport, economic, social and sustainability needs, directly matching D021."),
}
def source_url(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D021"]
    if len(rows)!=22 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D021 exact queue changed; re-adjudicate before generation")
    decisions=[]
    for r in rows:
        status,basis=RULINGS[r["role_name"]]
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=source_url(x))))
        if r["role_name"]=="Architects and Surveyors" and not refs: refs=["https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"]
        if not refs: raise SystemExit(f"Missing source ref for {r['role_key']}")
        decisions.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Task text is copied from the exact-key ESCO/O*NET payload. These sources summarize occupational tasks; conditional decisions require the planning/built-environment context stated. WEF is trend provenance only, not task evidence."})
    c=Counter(x["domain_fit_status"] for x in decisions)
    a={"schema_version":1,"domain_id":"D021","domain_name":rows[0]["domain_name"],"scope":"D021 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Compare actual tasks to building/interior design, urban/land/transport planning, site surveying/inspection and built-environment construction support. Supported requires direct role tasks in that scope. Conditional means a broad or adjacent occupation fits only in the specific planning/project context stated. WEF trend titles without duties remain unresolved. No inference from occupational-family/subgroup membership.","source_limit_policy":"ESCO/O*NET task profiles are representative rather than universal; O*NET is US-based. The ARCON registration clause is Nigeria-specific and is excluded from global role-fit reasoning. WEF trend labels cannot establish task fit.","counts":{"reviewed_role_mappings":len(decisions),**{s:c.get(s,0) for s in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
