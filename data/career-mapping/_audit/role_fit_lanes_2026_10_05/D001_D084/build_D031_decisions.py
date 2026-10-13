"""Materialize D031 sales-role decisions from exact tasks and a fail-closed rule set."""
from __future__ import annotations
import json,re
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent; WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"; OUTPUT=HERE/"D031_role_domain_fit_2026_10_05.json"
# These exceptions are exact-key adjudications of task text that is sales-adjacent,
# procurement-only, or belongs to a neighbouring marketing/operations discipline.
UNSUPPORTED={"bid manager","chief marketing officer","costume buyer","destination manager","digital marketing manager","green coffee buyer","ICT buyer","marketing manager","promotion manager","purchase planner","purchaser","set buyer","standalone public buyer","tourism product manager"}
CONDITIONAL={"after-sales service technician","aftersales service manager","auction house manager","banking products manager","category manager","checkout supervisor","motor vehicle aftersales manager","non-vessel operating common carrier","personal shopper","retail entrepreneur","shop supervisor","waste broker"}
DIRECT=re.compile(r"\b(sell|sells|selling|sales|sale|seller|sellers|wholesale merchant|wholesale merchants|broker|brokers|brokerage|trader|traders|trade goods|trading floor|representatives? in selling|representatives? to sell|buy and sell|buyer and seller|buyers and sellers)\b",re.I)
PROCUREMENT=re.compile(r"\b(procurement|purchase orders?|purchasers?|purchasing|select and purchase|purchase stock|purchase planners?)\b",re.I)
def src(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def classify(row):
    name=row["role_name"]; task=row["role_task_text"]
    if name in UNSUPPORTED: return "unsupported","The exact task is procurement/buying, marketing, tender administration or tourism-product activity rather than selling, brokering or trading to buyers; this disposition follows the described task, not the title."
    if name in CONDITIONAL: return "conditional","The task is adjacent customer/service, retail supervision, purchase-on-behalf, auction or transport/waste brokerage work. It fits the sales parent only where the specific transaction/buyer-facing activity described is central; service or operations alone is not sales."
    if DIRECT.search(task) and not PROCUREMENT.search(task): return "supported","The exact task explicitly sells goods/services, brokers or trades between buyers and sellers, or serves retail/wholesale buyers—activities named in the parent-domain scope."
    if PROCUREMENT.search(task): return "unsupported","The task selects suppliers, places purchase orders or procures stock for an organisation; it is a buying/procurement function, not selling goods or services to buyers."
    return "unresolved","The task description does not clearly establish selling, buyer-facing retail/wholesale, brokering/trading, or a bounded related commercial transaction; do not infer parent-domain fit from title or membership."
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D031"]
    if len(rows)!=122: raise SystemExit("D031 queue count changed; rebuild adjudication")
    ds=[]
    for r in rows:
        status,basis=classify(r); refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=src(x))))
        if not refs: raise SystemExit(f"Missing source reference for {r['role_key']}")
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Exact-key ESCO task text and linked profile support the task evidence. This rule adjudicates fit to the broad sales/buyer-facing/trade scope only; it does not establish local licensing, product competence, or that every job in an occupation performs the same activity."})
    c=Counter(d["domain_fit_status"] for d in ds)
    a={"schema_version":1,"domain_id":"D031","domain_name":rows[0]["domain_name"],"scope":"D031 only; exact task fit to parent Sales and Business Development domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Compare exact task descriptions with the declared scope: getting goods/services to buyers through retail/wholesale selling, brokerage/trading, technical/product sales, account-facing transactions and commercial strategy. Procurement-only and marketing-only tasks are separated. Exact task-text rules are fail-closed: task evidence must contain a sales/trade cue; otherwise the row remains unresolved for evidence review. No fit inferred from role title, ISCO/ESCO group or subgroup.","source_limit_policy":"ESCO task profiles are representative; conditional cases remain bounded to actual buyer/customer transactions. Automated lexical detection is used only for the exact D031 queue and its outcomes are review statuses, not edits to canonical data.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
