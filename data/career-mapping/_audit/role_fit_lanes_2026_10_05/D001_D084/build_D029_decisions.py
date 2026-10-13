"""Materialize exact-key D029 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent; WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"; OUTPUT=HERE/"D029_role_domain_fit_2026_10_05.json"
SUPPORTED={"compensation analyst","corporate trainer","corporate training manager","equality and inclusion manager","human resources assistant","human resources manager","human resources officer","labour relations officer","recruitment consultant","talent acquisition manager"}
CONDITIONAL={"business coach","career guidance advisor","employee volunteering programme coordinator","employment and vocational integration consultant","occupational analyst","volunteer manager"}
def src(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D029"]
    if len(rows)!=16 or {r["role_name"] for r in rows}!=SUPPORTED|CONDITIONAL: raise SystemExit("D029 exact queue changed or inventory incomplete")
    ds=[]
    for r in rows:
        name=r["role_name"]; status="supported" if name in SUPPORTED else "conditional"
        if status=="supported": basis="The task directly handles recruitment/selection, employee compensation, learning and development, equality/inclusion, labour relations, or HR process delivery—the people-management work stated in the domain scope."
        else: basis="The task overlaps coaching, career guidance, employment access, occupational analysis or volunteer coordination; it fits HR only when explicitly applied to an employer's workforce, employee development, staffing or people programme, not the external labour market or volunteer service alone."
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=src(x))))
        if not refs: raise SystemExit(f"Missing source: {r['role_key']}")
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Exact-key ESCO occupational task profile; the role description is representative and does not establish every employer's responsibilities. Conditional fit is restricted to internal workforce/employee responsibilities described."})
    c=Counter(x["domain_fit_status"] for x in ds)
    a={"schema_version":1,"domain_id":"D029","domain_name":rows[0]["domain_name"],"scope":"D029 only; role-task fit to parent Human Resources domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Assess tasks against staffing/recruitment, employee learning/coaching, compensation, labour relations, equality/inclusion and workforce policy. Conditional occupations qualify only where the task is applied inside an employer workforce/employee programme; external jobseeker and volunteer-only service is not assumed to be HR. No inference from title or subgroup.","source_limit_policy":"ESCO profiles are representative occupational descriptions; actual HR boundaries vary across organisations and labour jurisdictions.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
