"""Build D043 journalism/digital-publishing decisions from role-task evidence."""
from __future__ import annotations
import json,re
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D043_role_domain_fit_2026_10_05.json"
UNESCO_FIELD="https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf"
UNESCO_JOURNALISM="https://www.unesco.org/en/articles/media-and-information-literacy-journalism"
NEWS=re.compile(r"\b(news\w*|journalis\w*|report\w*|article\w*|newspaper\w*|magazine\w*|journal\w*|manuscript\w*|book\w*|publication\w*|publish\w*|editor\w*|written material|written document\w*|online article\w*|column\w*|correspondent\w*|fact\w*|verify\w*|interview\w*|copy editor\w*|blog\w*|vlog\w*|technical writer\w*|dictionary|lexicograph\w*|translator\w*|translation\w*|translate\w*|subtitle\w*|caption\w*)\b",re.I)
TEXT_WORK=re.compile(r"\b(write\w*|research\w*|gather\w*|edit\w*|revise\w*|review\w*|verify\w*|fact.?check\w*|assign\w*|select\w*|report\w*|present\w*|translate\w*|compile\w*|prepare\w*|produce\w*|create\w*|transcrib\w*|publish\w*|coordinate\w*)\b",re.I)
NON_TEXT=re.compile(r"\b(paint\w*|sculpt\w*|ceramic\w*|craft\w*|perform\w*|broadcast productions|film production|motion pictures|television series|visual productions|draw people|prerecorded music|art object\w*)\b",re.I)
CONTEXT_DEPENDENT=re.compile(r"\b(opinion|may relate|wide range of subjects|for publication or performance|commercial potential|technical materials|scientific documents|spoken communication|oral or sign language|visual productions|books and other forms of literature|manuals|translate\w*|translation\w*|broadcast productions|host broadcast)\b",re.I)

def source_url(ref:str)->str|None:
    if ref.startswith("ESCO:"):return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"):return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"):return ref[4:].split("@",1)[0]
    return None

def decide(task:str)->tuple[str,str,str]:
    t=" ".join((task or "").split())
    if not t or len(t)<60 or re.search(r"All media and communication workers not listed separately",t,re.I):
        return("unresolved","The stored text is generic or missing; it does not establish journalistic reporting or publishing tasks. No fit is inferred from title/trend category.","Requires a role-specific task source; trend labels are not task profiles.")
    n=NEWS.search(t); tw=TEXT_WORK.search(t)
    if NON_TEXT.search(t) and not re.search(r"\b(news\w*|journalis\w*|newspaper\w*|magazine\w*|article\w*|written material|written document\w*|publication\w*)\b",t,re.I):
        return("unsupported","The task is principally visual art, performance, or audiovisual production rather than journalism or written/digital publishing.","UNESCO ISCED-F distinguishes journalism/reporting from audiovisual production; media-sector adjacency is not enough.")
    if n and tw:
        phrase=t[max(0,n.start()-45):min(len(t),n.end()+100)].strip()
        if CONTEXT_DEPENDENT.search(t) and not re.search(r"\b(news editor|journalist|news stories|research and write|fact.?check|verify|manuscripts? that can be published|review texts|edit written material|newspaper editors?|magazine editors?|articles about|articles for)\b",t,re.I):
            return("conditional",f"The role produces/transforms text in a potentially publishable context (“{phrase}”), but the task profile does not establish journalism, editorial verification, or an actual publishing workflow. Include when the documented work is editorial/digital publication rather than private, performance-only, or spoken content.","A written output or online platform alone does not establish journalism; publication medium and editorial function matter.")
        return("supported",f"The task explicitly involves reporting, researching, writing, editing, verification, or preparing text for news/publication (“{phrase}”). That fits the journalism/publishing boundary; UNESCO treats verification and accurate reporting as core journalism practice.","ESCO/O*NET task descriptions are representative. This does not claim all writing is journalism, or establish licensing/demand.")
    if n:
        return("conditional","The task references news, writing, or publication but does not establish a substantive reporting/editorial/publishing responsibility. Keep conditional until the content workflow and medium are clear.","A media setting, title, or incidental written task is not enough to establish fit.")
    if tw and re.search(r"\b(technical materials|scientific documents|manuals|operating and maintenance instructions|spoken communication|oral or sign language|host broadcast productions?)\b",t,re.I):
        return("conditional","The task creates or handles written, translated, technical, scientific, or broadcast-adjacent content, but does not establish an editorial/newsroom workflow or publication channel. Include only when the documented assignment is preparing content for public/digital publication or journalism.","The task description establishes content work, not its publication context; no newsroom or digital-publishing responsibility is assumed.")
    return("unsupported","The task does not establish gathering/reporting news, creating or editing publishable written content, fact-checking, or an editorial/digital publishing workflow.","This excludes the current mapping on the stored task evidence; it does not deny possible collaboration with publishers.")

def main()->None:
    data=json.loads(WORKLIST.read_text(encoding="utf-8"));rows=[r for r in data["role_mappings"] if r["domain_id"]=="D043"]
    if len(rows)!=62 or {r["domain_name"] for r in rows}!={"Journalism and Digital Publishing"}:raise SystemExit("D043 exact-key queue changed")
    ds=[]
    for r in rows:
        status,basis,limit=decide(r.get("role_task_text") or "")
        refs=list(dict.fromkeys(source_url(x) for x in r["task_source_refs"] if source_url(x)))
        if not refs:
            status,basis,limit="unresolved","No joined role-task source URL is available; no fit is inferred.","UNESCO sources define the domain boundary only; attach/verify a role-specific occupational source before resolving this row."
            refs.extend((UNESCO_FIELD,UNESCO_JOURNALISM))
        else:refs.extend((UNESCO_FIELD,UNESCO_JOURNALISM))
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r.get("role_task_text") or "","basis":basis,"source_refs":list(dict.fromkeys(refs)),"source_limit":limit})
    c=Counter(x["domain_fit_status"] for x in ds)
    out={"schema_version":1,"domain_id":"D043","domain_name":"Journalism and Digital Publishing","scope":"D043 only; parent-domain fit from actual role tasks. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Require task evidence for gathering/reporting/verifying news or creating, editing, translating, or preparing written content for publication. Distinguish reporting/editorial/publishing from audiovisual production, fine arts, generic speech/performance writing, and unrelated written analysis. No title/subgroup inference.","scope_sources":[UNESCO_FIELD,UNESCO_JOURNALISM],"source_limit_policy":"UNESCO ISCED-F distinguishes journalism/reporting from audiovisual media production; UNESCO journalism guidance emphasizes fact verification and accuracy. These sources guide scope, not role licensure or demand; individual tasks come from cited occupational profiles.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":out["counts"]},ensure_ascii=False))
if __name__=="__main__":main()
