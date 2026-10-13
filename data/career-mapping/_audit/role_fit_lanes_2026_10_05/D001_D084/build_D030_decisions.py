"""Materialize exact-key D030 parent-domain role-fit decisions."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent; WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"; OUTPUT=HERE/"D030_role_domain_fit_2026_10_05.json"
SUPPORTED={"advertising copywriter","advertising manager","advertising media buyer","advertising media planner","advertising specialist","brand manager","chief marketing officer","communication manager","creative director","digital marketing manager","employer branding manager","market research analyst","marketing assistant","marketing consultant","marketing manager","online community manager","online marketer","pricing specialist","promotion assistant","promotion manager","public relations manager","public relations officer","spokesperson"}
UNSUPPORTED={"activism officer","bid manager","licensing manager"}
CONDITIONAL={"aftersales service manager","business developer","category manager","client relations manager","commercial director","customer experience manager","destination manager","eBusiness manager","fundraising manager","hospitality revenue manager","ICT account manager","ICT business development manager","intercultural communication consultant","membership manager","network marketer","online sales channel manager","product and services manager","public affairs consultant","sales manager","tourism product manager"}
def src(ref):
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None
def main():
    q=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in q["role_mappings"] if r["domain_id"]=="D030"]
    if len(rows)!=46 or {r["role_name"] for r in rows}!=SUPPORTED|UNSUPPORTED|CONDITIONAL: raise SystemExit("D030 exact queue changed or ruling inventory incomplete")
    ds=[]
    for r in rows:
        name=r["role_name"]
        if name in SUPPORTED: status="supported"; basis="The task directly creates, researches, positions, promotes or communicates a brand/product/service to a market or audience, matching the parent marketing scope."
        elif name in UNSUPPORTED: status="unsupported"; basis="The exact task is political/social advocacy, tender/bid administration or licensing/IP control; it does not establish market research, brand management, promotion or marketing communications."
        else: status="conditional"; basis="The task overlaps growth, customer relations/experience, commercial channels, revenue, fundraising or product distribution. It fits this marketing parent only when the described work actually includes market positioning, promotion, customer/audience research or marketing-channel strategy; sales/service/operations alone are not enough."
        refs=list(dict.fromkeys(u for x in r["task_source_refs"] if (u:=src(x))))
        if not refs: raise SystemExit(f"Missing task source: {r['role_key']}")
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r["role_task_text"],"basis":basis,"source_refs":refs,"source_limit":"Exact-key ESCO occupational task text supports the disposition. Conditional fit depends on the stated marketing responsibility and is not inferred from a commercial title or customer contact alone."})
    c=Counter(x["domain_fit_status"] for x in ds)
    a={"schema_version":1,"domain_id":"D030","domain_name":rows[0]["domain_name"],"scope":"D030 only; role-task fit to parent Marketing and Brand Management domain. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Compare tasks with market/audience research, brand positioning, advertising, promotion, digital marketing, marketing communications and market-facing channel strategy. Conditional roles need explicit marketing work beyond sales, service, advocacy or administration. Unsupported roles lack that function in their task profile. No inference from title or subgroup.","source_limit_policy":"ESCO task profiles describe representative work and do not establish that every commercial or communications role performs marketing. Conditional decisions are bounded to marketing tasks stated in the rationale.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(a,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(json.dumps({"output":str(OUTPUT),"counts":a["counts"]},ensure_ascii=False))
if __name__=="__main__": main()
