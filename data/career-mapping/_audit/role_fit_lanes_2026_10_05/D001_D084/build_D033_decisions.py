"""Materialize exact-key D033 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent; WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"; OUTPUT=HERE/"D033_role_domain_fit_2026_10_05.json"
SUPPORTED={"chief product officer","clothing development manager","games development manager","insurance product manager","product development manager","product manager","research and development manager"}
CONDITIONAL={"business analyst","business consultant","business intelligence manager","business manager","building information modelling consultant","enterprise architect","ICT business analysis manager","ICT business analyst","ICT consultant","ICT research consultant","ICT research manager","ICT system analyst","innovation officer","lean manager","policy manager","process officer","programme manager","research manager","strategic planning manager","user experience analyst"}
UNSUPPORTED={"artificial intelligence engineer","blockchain architect","branch manager","computer scientist","computer vision engineer","data analyst","data engineer","data scientist","director of compliance and information security","embedded system designer","EU funds manager","green ICT consultant","health safety and environmental manager","ICT system architect","ICT system developer","ICT system integration consultant","integration engineer","IT auditor","logistics analyst","manufacturing cost estimator","procurement department manager","social security administrator","sustainability manager","tourism policy director"}
def src(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D033"]
    if len(rows)!=51 or {r["role_name"] for r in rows}!=SUPPORTED|CONDITIONAL|UNSUPPORTED: raise SystemExit("D033 exact queue changed or inventory incomplete")
    ds=[]
    for r in rows:
        name=r["role_name"]
        if name in SUPPORTED: status="supported"; basis="The task owns or coordinates product direction, lifecycle, development or market-ready product creation, directly matching the parent product-management scope."
        elif name in CONDITIONAL: status="conditional"; basis="The task supplies analysis, requirements, architecture, user insight, process improvement or research that can support product decisions. It fits only when the described work is connected to product requirements/lifecycle; general consulting, analytics or operations alone is not product management."
        else: status="unsupported"; basis="The exact task is engineering implementation, general business/functional management, compliance, procurement, policy or another specialist activity; it does not establish product direction, ownership or lifecycle responsibility."
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=src(x))))
        if not refs: raise SystemExit(f"Missing task source: {r['role_key']}")
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Exact-key ESCO task profile supports the described activity, not universal product ownership. Conditional cases require an explicit connection to product requirements, roadmap, development or lifecycle. Engineering roles are not treated as product management merely because they build a product."})
    c=Counter(x["domain_fit_status"] for x in ds)
    a={"schema_version":1,"domain_id":"D033","domain_name":rows[0]["domain_name"],"scope":"D033 only; exact task fit to parent Product Management domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Assess task evidence for ownership of product vision, roadmap, requirements, lifecycle and coordination from idea through development/market delivery. Analysts, consultants and architects are conditional only where tasks connect to product decisions. Engineering implementation, general operations and unrelated functions do not qualify by proximity to a product. No inference from title or subgroup.","source_limit_policy":"ESCO task descriptions are representative and role boundaries vary. Product contribution is not equated with product-management accountability.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
