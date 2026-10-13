"""Materialize manually adjudicated D020 role-to-parent-domain decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D020_role_domain_fit_2026_10_05.json"
RULINGS={
"biogas technician":("conditional","The role operates and maintains biogas equipment. D020 fit is where this treats organic waste or controls landfill/digester emissions; the source may frame the task as energy production rather than environmental remediation."),
"environmental engineer":("supported","The role integrates environmental/sustainability measures into projects to protect natural resources and sites, matching D020's pollution/resource-protection engineering scope."),
"environmental expert":("supported","The role identifies environmental problems and develops technological/production-process solutions to address them."),
"environmental health inspector":("supported","The role investigates environmental/public-health complaints and enforces environmental-health legislation, directly matching D020's compliance-inspection scope."),
"environmental mining engineer":("supported","The role manages environmental performance of mining operations and implements strategies to reduce environmental impacts."),
"hazardous materials inspector":("supported","The role inspects hazardous-material facilities, tests emergency/risk plans and enforces environmental/health/safety handling requirements."),
"hazardous waste inspector":("supported","The role inspects industrial sites for waste-disposal compliance and checks hazardous-waste equipment and public-safety practices."),
"incinerator operator":("supported","The role operates and maintains machinery that treats solid waste by incineration under waste-safety controls."),
"industrial waste inspector":("supported","The role inspects industrial waste practices, samples materials and enforces environmental/waste regulations."),
"liquid waste treatment plant operator":("supported","The role operates liquid-waste treatment equipment, removes pollutants/chemicals and tests samples to verify treatment."),
"occupational health and safety inspector":("conditional","The role audits workplaces and enforces health/safety rules; D020 fit is limited to duties that specifically inspect environmental hazards/compliance, not general occupational safety."),
"recycling specialist":("supported","The role researches and implements recycling/waste-management policy, inspects operations and supports recycling equipment/workers."),
"solid waste operator":("supported","The role operates waste-treatment/distribution equipment, tests for pollution and ensures compliant solid-waste disposal."),
"waste management supervisor":("supported","The role supervises collection, recycling and disposal operations and develops waste-management methods under environmental standards."),
"waste treatment engineer":("supported","The role designs waste collection/treatment facilities and processes to minimize environmental impact and meet environmental standards."),
"wastewater engineer":("supported","The role designs sewerage and wastewater treatment networks to meet environmental standards and reduce ecosystem impacts."),
"wastewater treatment operator":("supported","The role operates water/wastewater treatment equipment, removes harmful substances and tests water before release/distribution."),
"wastewater treatment technician":("supported","The role assists wastewater purification and maintains/repairs sewage-treatment equipment."),
"water plant technician":("supported","The role maintains water-treatment/supply equipment and measures water quality to ensure safe treatment and distribution."),
"water treatment systems operator":("supported","The role operates and maintains water-treatment equipment and tests water to ensure it is safe for use and distribution."),
}

def source_url(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None

def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows=[r for r in q["role_mappings"] if r["domain_id"]=="D020"]
    if len(rows)!=20 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D020 exact queue changed; re-adjudicate before generation")
    decisions=[]
    for r in rows:
        status,basis=RULINGS[r["role_name"]]
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=source_url(x))))
        if not refs: raise SystemExit(f"Missing task source for {r['role_key']}")
        decisions.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Task evidence is copied from the exact-key ESCO profile. Occupational descriptions summarize representative duties and do not establish the work scope of every employer. Conditional fit requires the environmental-control context stated in the rationale."})
    c=Counter(x["domain_fit_status"] for x in decisions)
    a={"schema_version":1,"domain_id":"D020","domain_name":rows[0]["domain_name"],"scope":"D020 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Compare the exact tasks to environmental engineering work addressing pollution, waste and water quality through environmental process/design solutions, treatment operations, monitoring and environmental compliance. Supported requires explicit environmental/waste/water-control tasks. Conditional means adjacent energy or general safety tasks fit only in the specified environmental context. No fit inferred from title or occupational/subgroup membership.","source_limit_policy":"ESCO task profiles describe representative occupations, not universal employer assignments. Conditional status is context-bounded; it is not a claim that every role in the occupation is environmental engineering.","counts":{"reviewed_role_mappings":len(decisions),**{s:c.get(s,0) for s in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
