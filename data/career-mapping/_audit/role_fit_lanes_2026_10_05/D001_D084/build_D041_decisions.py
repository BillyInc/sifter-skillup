"""Build D041 scientific-research domain-fit decisions from exact role tasks."""
from __future__ import annotations
import json
import re
from collections import Counter
from pathlib import Path

HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D041_role_domain_fit_2026_10_05.json"
OECD="https://www.oecd.org/en/publications/frascati-manual-2015_9789264239012-en.html"
OECD_PDF="https://www.oecd.org/content/dam/oecd/en/publications/reports/2015/10/frascati-manual-2015_g1g57dcb/9789264239012-en.pdf"

def source_url(ref: str) -> str|None:
    if ref.startswith("ESCO:"): return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"): return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"): return ref[4:].split("@",1)[0]
    return None

def decide(task: str) -> tuple[str,str,str]:
    t=" ".join((task or "").split())
    if not t or len(t)<60 or "All physical scientists not listed separately" in t:
        return ("unresolved","The stored task profile does not identify a sufficiently specific scientific activity to evaluate; no fit is inferred from the generic occupational label.","Requires a role-specific task profile or primary professional description.")
    if re.search(r"\b(study and deepen existing mathematical theories|expand the knowledge|study physical phenomena|focus their research|study and practice the science of measurement|develop quantity systems|develop new methods and tools to quantify)\b",t,re.I):
        phrase=t[:min(240,len(t))]
        return ("supported",f"The task explicitly describes systematic scientific inquiry or development of scientific methods (“{phrase}”). This fits the scientific-research scope; OECD Frascati criteria distinguish qualifying research from routine service work.","Task descriptions are representative. The Frascati criteria are a research classification boundary, not a role licence or proof every assignment meets all five criteria.")
    if re.search(r"\b(researching and testing animal species|assist in researching and testing|research concerning animals)\b",t,re.I):
        return ("supported","The task explicitly provides technical support to research/testing of animal species and their environments, matching the parent scope's inclusion of laboratory technicians who support biological research.","This supports research-assistance fit, not a claim that the technician independently designs studies or holds a regulated qualification.")
    if re.search(r"\b(apply principles and processes of natural ecosystems|develop models for efficient industrial systems)\b",t,re.I):
        return ("conditional","The role applies ecological/scientific principles and develops models, but the stored description does not establish whether that work is systematic research or routine consulting/industrial optimization. Include only for assignments with a documented research/design-of-study component.","Application of scientific knowledge is not automatically research under the OECD Frascati distinction.")
    if re.search(r"\b(research|researching|testing|field and lab tests|synthesize complex scientific data|develop new sensor systems|analytical techniques|statistical studies|researching and testing animal species|monitoring or management)\b",t,re.I):
        phrase=t[:min(260,len(t))]
        return ("conditional",f"The task has a research/scientific evidence component (“{phrase}”), but the profile does not establish that the work is systematic, novel/creative, and directed to new knowledge rather than routine testing, consulting, or operational analysis. Include when that research function is part of the assignment.","OECD Frascati Manual's criteria distinguish R&D from routine testing and other adjacent activities; conditional is not a confirmed claim that every incumbent conducts R&D.")
    return ("unsupported","The task description is primarily consulting, policy, implementation, or operational advice and does not establish systematic scientific inquiry, research support, or development of new scientific knowledge/methods.","This excludes only the current mapping on stored task evidence; it does not assert the person could never contribute to a research project.")

def main()->None:
    data=json.loads(WORKLIST.read_text(encoding="utf-8")); rows=[r for r in data["role_mappings"] if r["domain_id"]=="D041"]
    if len(rows)!=11 or {r["domain_name"] for r in rows}!={"Scientific Research"}: raise SystemExit("D041 exact-key queue changed")
    decisions=[]
    for r in rows:
        status,basis,limit=decide(r.get("role_task_text") or "")
        refs=list(dict.fromkeys(source_url(x) for x in r["task_source_refs"] if source_url(x)))
        if not refs: status,basis,limit="unresolved","No joined role-task source URL is available; no fit is inferred.","Attach/verify a role-specific occupational source."
        else: refs.extend((OECD,OECD_PDF))
        decisions.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r.get("role_task_text") or "","basis":basis,"source_refs":list(dict.fromkeys(refs)),"source_limit":limit})
    counts=Counter(x["domain_fit_status"] for x in decisions)
    out={"schema_version":1,"domain_id":"D041","domain_name":"Scientific Research","scope":"D041 only; parent-domain fit from task evidence. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Assess whether described work conducts/supports systematic scientific inquiry or develops scientific knowledge/methods. Separate this from consulting, policy, routine tests, and operational analysis. Do not infer from title or subgroup.","scope_sources":[OECD,OECD_PDF],"source_limit_policy":"The OECD Frascati Manual supplies an internationally recognised research-classification framework; it does not make every scientific occupation an R&D role or establish licensing/demand.","counts":{"reviewed_role_mappings":len(decisions),**{k:counts.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":decisions}
    OUTPUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":out["counts"]},ensure_ascii=False))
if __name__=="__main__":main()
