"""Build D042 media-production/broadcast role decisions from actual task text."""
from __future__ import annotations
import json,re
from collections import Counter
from pathlib import Path
HERE=Path(__file__).resolve().parent
WORKLIST=HERE/"D009_D044_parent_domain_review_worklist.json"
OUTPUT=HERE/"D042_role_domain_fit_2026_10_05.json"
UNESCO="https://uis.unesco.org/sites/default/files/medias/fichiers/2025/04/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf"
DIRECT=re.compile(r"\b(stage performance|live performance|performance\w*|television|radio|broadcast\w*|film|motion picture|video production|camera\w*|audio\w*|sound quality|microphone|set\w*|theatr\w*|performers|on stage|animation\w*|production\w*|screen|record\w*|editing images|lighting design|costumes?|scen\w*|cinema|music production|music arrang\w*|choir\w*|dance\w*|dancers?|circus|puppets?|filming|extras? perform|mask\w*.{0,40}live performance|video games?|multimedia|telecommunication signals|programme schedule|programme director|act(?:or|ress|ing)|musician\w*)\b",re.I)
ACT=re.compile(r"\b(play roles|perform\w*|produc\w*|direct\w*|record\w*|edit\w*|operate\w*|set up|maintain\w*|broadcast\w*|supervis\w*|coordinate\w*|create\w*|write\w*|design\w*|stage\w*|film\w*|shoot\w*|transmit\w*|recruit\w*|schedule\w*|mix\w*|compose\w*|interpret\w*)\b",re.I)
ADJACENT=re.compile(r"\b(arts? organisation|business needs|artistic vision|client\w*|event\w*|venue\w*|decide how much broadcast time|programme schedule|media content|visual layout)\b",re.I)
UNRELATED=re.compile(r"\b(tattoo\w*|piercing|restor\w* art|fine arts?|skin|body art|business needs of an organisation devoted to arts)\b",re.I)

def source_url(ref:str)->str|None:
    if ref.startswith("ESCO:"):return ref[5:].split("@",1)[0]
    if ref.startswith("ONET:"):return "https://www.onetonline.org/link/summary/"+ref[5:].split("@",1)[0]
    if ref.startswith("URL:"):return ref[4:].split("@",1)[0]
    return None

def decide(task:str)->tuple[str,str,str]:
    t=" ".join((task or "").split())
    if not t or len(t)<60:return("unresolved","The role task is too sparse to establish media-production or broadcasting work; no fit is inferred from title or subgroup.","Requires a fuller task source.")
    m=DIRECT.search(t); a=ACT.search(t)
    if UNRELATED.search(t) and not re.search(r"\bfilm|television|broadcast|stage performance\b",t,re.I):
        return("unsupported","The described work is visual art/body art/conservation rather than production of stage, screen, radio, television, recorded, or broadcast content.","Visual or arts-sector adjacency does not establish media-production tasks.")
    if m and a:
        phrase=t[max(0,m.start()-45):min(len(t),m.end()+95)].strip()
        if ADJACENT.search(t) and not re.search(r"\b(camera|audio|broadcast|film|video|stage|screen|record|television|radio|production|performers)\b",t,re.I):
            return("conditional",f"The task is adjacent to media/arts production (“{phrase}”), but the profile does not establish hands-on production, performance, or broadcast operations. Include only when that production responsibility is explicit.","The UNESCO field taxonomy helps distinguish media production from journalism/visual arts; it is not proof of an individual occupation's tasks.")
        return("supported",f"The task directly describes production/performance/broadcast work (“{phrase}”), matching the media-production boundary for stage, screen, radio/TV, recorded media, or related production.","The occupational task profile is representative; it does not establish a universal licence, employment demand, or every incumbent's assignment.")
    if ADJACENT.search(t):
        return("conditional","The task is connected to media/arts settings but does not clearly establish production or broadcast responsibility. Keep conditional pending evidence of a direct production task.","Setting or employer alone is not sufficient evidence of occupational fit.")
    return("unsupported","The task does not establish creation, performance, production, recording, technical operation, scheduling, or transmission of media/broadcast content.","This excludes the current mapping on the stored task evidence; collaboration with media teams is not sufficient.")

def main()->None:
    data=json.loads(WORKLIST.read_text(encoding="utf-8"));rows=[r for r in data["role_mappings"] if r["domain_id"]=="D042"]
    if len(rows)!=101 or {r["domain_name"] for r in rows}!={"Media Production and Broadcasting"}:raise SystemExit("D042 exact-key queue changed")
    ds=[]
    for r in rows:
        status,basis,limit=decide(r.get("role_task_text") or "")
        refs=list(dict.fromkeys(source_url(x) for x in r["task_source_refs"] if source_url(x)))
        if not refs:status,basis,limit="unresolved","No joined role-task source URL is available; no fit is inferred.","Attach/verify a role-specific occupational source."
        else:refs.append(UNESCO)
        ds.append({"role_key":r["role_key"],"domain_fit_status":status,"task_evidence":r.get("role_task_text") or "","basis":basis,"source_refs":list(dict.fromkeys(refs)),"source_limit":limit})
    c=Counter(x["domain_fit_status"] for x in ds)
    out={"schema_version":1,"domain_id":"D042","domain_name":"Media Production and Broadcasting","scope":"D042 only; parent-domain fit from task evidence. No subgroup or role-to-specialization decisions.","domain_scope":rows[0]["parent_domain_scope"],"method":"Use tasks that create, perform, produce, record, edit, operate, schedule, or transmit stage/screen/radio/TV/recorded/multimedia content. Separate journalism's reporting/content verification and graphic communication design. Arts-sector, event, or visual-art adjacency alone is not sufficient. No title/subgroup inference.","scope_sources":[UNESCO],"source_limit_policy":"UNESCO ISCED-F describes the media-production field and distinguishes it from journalism; it is an education-field boundary, not proof of occupational qualification or demand. Occupational task profiles supply role-level evidence.","counts":{"reviewed_role_mappings":len(ds),**{k:c.get(k,0) for k in ("supported","conditional","unsupported","unresolved")}},"decisions":ds}
    OUTPUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"output":str(OUTPUT),"counts":out["counts"]},ensure_ascii=False))
if __name__=="__main__":main()
