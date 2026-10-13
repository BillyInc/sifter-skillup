"""Build D044 parent-domain decisions from role-task evidence only."""
from __future__ import annotations
import json,re
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D044_role_domain_fit_2026_10_05.json"
AIGA="https://educators.aiga.org/wp-content/uploads/2010/01/NASAD-Briefing-Paper-Degree-Programs1.pdf"
UNESCO="https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf"

def source_url(ref:str)->str|None:
    if ref.startswith("ESCO:"):return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"):return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"):return ref[4:].split("@",1)[0]
    return None

def decide(task:str)->tuple[str,str,str]:
    t=" ".join((task or "").split())
    explicit=re.search(r"\b(graphic design|visual communication|visual elements|layout|illustrations?|visual representation|visual and textual content|graphics|drawn representation corresponding to the idea)\b",t,re.I)
    generic=re.search(r"\b(create|design|draw|illustrat|plan|project|develop|produce)\w*\b",t,re.I)
    if explicit and generic:
        phrase=t[max(0,explicit.start()-50):min(len(t),explicit.end()+100)].strip()
        if re.search(r"\b(client|brief|audience|message|text|publication|website|communicat|content)\w*\b",t,re.I):
            return ("supported",f"The task describes visual communication/design work (“{phrase}”) for a message, audience, client, text, publication, or interface. This matches AIGA/NASAD's distinction of graphic design as communication design, not visual art generally.","This supports the stated task profile, not a universal design credential or proof every assignment is graphic design.")
        return ("conditional",f"The task includes visual/design activity (“{phrase}”), but does not establish a communication-design brief, audience, or message. Fit is conditional on that communication-design context.","Visual creation alone does not make an occupation graphic design; fine art, object/industrial design, and production crafts remain distinct.")
    if not t or len(t)<60:return ("unresolved","The task text is too sparse to distinguish graphic/communication design from other visual work; no fit is inferred from title or subgroup.","Requires a fuller role-specific task source.")
    return ("unsupported","The described work is not visual communication/design; it concerns another art, production, restoration, performance, or image-reporting function.","This excludes the current parent-domain mapping only; it does not deny that the occupation may collaborate with designers.")

def main()->None:
    data=json.loads(WORKLIST.read_text(encoding="utf-8"));rows=[r for r in data["role_mappings"] if r["domain_id"]=="D044"]
    if len(rows)!=12 or {r["domain_name"] for r in rows}!={"Graphic Design"}:raise SystemExit("D044 exact-key queue changed")
    ds=[]
    for r in rows:
        status,basis,limit=decide(r.get("role_task_text") or "")
        refs=list(dict.fromkeys(source_url(x) for x in r["task_source_refs"] if source_url(x)))
        if not refs:status,basis,limit="unresolved","No joined role-task source URL is available; no fit is inferred.","Attach/verify a role-specific occupational source."
        else:refs.extend((AIGA,UNESCO))
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r.get("role_task_text") or "","basis":basis,"source_refs":list(dict.fromkeys(refs)),"source_limit":limit})
    c=Counter(d["domain_fit_status"] for d in ds)
    out={"schema_version":1,"domain_id":"D044","domain_name":"Graphic Design","scope":"D044 only; parent-domain fit from role tasks. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Require task evidence for graphic/communication design, visual content or interface/layout design for a message, client, audience, publication, text, or product brief. Do not infer from being an artist, visual creator, photographer, or design-adjacent occupation. No title/subgroup inference.","scope_sources":[AIGA,UNESCO],"source_limit_policy":"AIGA/NASAD and UNESCO ISCED-F distinguish communication design/media production from fine art and other design fields; task profiles remain representative, not licensure or demand evidence.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":out["counts"]},ensure_ascii=False))
if __name__=="__main__":main()
