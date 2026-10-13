"""Materialize exact-key D028 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D028_role_domain_fit_2026_10_05.json"
RULINGS={
"accounting manager":"conditional","airport chief executive":"supported","animal facility manager":"conditional","bank treasurer":"unsupported","branch manager":"supported","budget manager":"conditional","building information modelling consultant":"unsupported","business analyst":"conditional","business consultant":"supported","business intelligence manager":"conditional","business manager":"supported","business service manager":"supported","chemical plant manager":"conditional","chief executive officer":"supported","chief operating officer":"supported","corporate social responsibility manager":"conditional","corporate treasurer":"unsupported","defence administration officer":"conditional","department manager":"supported","director of compliance and information security":"conditional","EU funds manager":"unsupported","facilities manager":"conditional","financial manager":"conditional","foundry manager":"conditional","health safety and environmental manager":"conditional","lean manager":"conditional","logistics analyst":"unsupported","manufacturing cost estimator":"unsupported","manufacturing facility manager":"conditional","policy manager":"conditional","power plant manager":"conditional","process officer":"conditional","procurement department manager":"unsupported","programme manager":"conditional","project manager":"conditional","public employment service manager":"conditional","quality services manager":"conditional","security manager":"conditional","social entrepreneur":"supported","social security administrator":"conditional","strategic planning manager":"supported","sustainability manager":"conditional","tourism policy director":"conditional","water treatment plant manager":"conditional","wood factory manager":"conditional",
}
def src(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D028"]
    if len(rows)!=45 or {r["role_name"] for r in rows}!=set(RULINGS): raise SystemExit("D028 exact queue changed; re-adjudicate")
    ds=[]
    for r in rows:
        status=RULINGS[r["role_name"]]; name=r["role_name"]
        if status=="supported": basis="The task manages an enterprise, broad business/service operation, branch or department, or provides cross-organisational strategy/management consulting—work explicitly within the general-management parent scope."
        elif status=="conditional": basis="The task manages a defined specialist function, facility, public service or sector operation. It fits General Management only to the extent the assignment includes broad unit/people/resource/operational leadership described in the parent scope; specialist technical work alone belongs elsewhere."
        else: basis="The task is principally a specialist finance, supply-chain, construction/BIM, estimating or procurement occupation; its title or seniority does not establish broad organisational/department management in this parent domain."
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=src(x))))
        if not refs: raise SystemExit(f"Missing task source: {r['role_key']}")
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"ESCO task description is the exact-key evidence and represents the occupation, not every employer's job design. Conditional status is restricted to broad unit/people/resource leadership; it does not transfer specialist functional work into general management."})
    c=Counter(x["domain_fit_status"] for x in ds)
    artifact={"schema_version":1,"domain_id":"D028","domain_name":rows[0]["domain_name"],"scope":"D028 only; role-task fit to parent General Management domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Assess actual task scope: organisation/department/branch leadership, broad budgets/operations, organisational strategy and business improvement. Distinguish general management from specialist functional occupations even where their title includes manager/director. Supported denotes direct broad management; conditional denotes sector/function management only when the described unit-leadership responsibilities apply; unsupported denotes specialist tasks without general-management duties. No inference from title or subgroup.","source_limit_policy":"ESCO occupation tasks are representative descriptions; actual job scope varies by organisation. This disposition is parent-domain fit, not seniority or a claim that every jobholder performs all duties.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(artifact,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":artifact["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
