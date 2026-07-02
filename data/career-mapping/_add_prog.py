#!/usr/bin/env python3
"""Extract one programme (all course blocks of a given prefix) from a pdftxt and APPEND
it to a discipline json. Usage: python _add_prog.py <pdftxt> <PREFIX> <Programme Name> <ccmas_json> <qual> <years>"""
import json, re, sys
pdftxt, prefix, name, jpath, qual, years = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], int(sys.argv[6])
lines = open(pdftxt, encoding="utf-8", errors="replace").read().split("\n")
N = len(lines)
# course block: PREFIX<opt space>NNN: Title (N Units C/E: LH x; PH y)
HEAD = re.compile(r"^\s*(" + prefix + r")\s?(\d{3}[A-Z]?)\s*:\s*(.+?)\s*$")
UNITS = re.compile(r"\(\s*(\d+)\s*Units?\s*;?\s*([CER])\s*[:;]?\s*(?:LH\s*(\d+))?\s*(?:;?\s*PH\s*(\d+))?", re.I)
ABLE = re.compile(r"able to|expected to", re.I)
NUM = re.compile(r"^\s*(?:\d{1,2}[.)]|[-–•])\s+(.*)$")
CONTENT = re.compile(r"course content", re.I)
ANYCODE = re.compile(r"^\s*[A-Z]{2,4}\s?\d{3}[A-Z]?\s*:")

courses = {}; order = []
i = 0
while i < N:
    m = HEAD.match(lines[i])
    if m:
        code = f"{m.group(1)} {m.group(2)}"
        rest = m.group(3); um = UNITS.search(rest)
        title = rest[:um.start()].strip(" .") if um else re.sub(r"\(.*$", "", rest).strip(" .")
        units = int(um.group(1)) if um and um.group(1) else None
        status = "E" if (um and um.group(2) in ("E","R")) else "C"
        lh = int(um.group(3)) if um and um.group(3) else None
        ph = int(um.group(4)) if um and um.group(4) else None
        lvl = int(m.group(2)[:3])//100*100
        skills=[]; content=None; j=i+1; mode=None
        while j < N and j < i+55:
            l2=lines[j]
            if ANYCODE.match(l2) and j>i+1: break
            if ABLE.search(l2): mode="lo"; j+=1; continue
            if CONTENT.search(l2): mode="content"; j+=1; continue
            if mode=="lo":
                mm=NUM.match(l2)
                if mm: skills.append(mm.group(1).strip().rstrip(";.").strip())
                elif l2.strip() and skills: skills[-1]+=" "+l2.strip()
            elif mode=="content" and l2.strip(): content=((content or "")+" "+l2.strip()).strip()
            j+=1
        if code not in courses:
            courses[code]={"level":lvl,"code":code,"title":title,"units":units,"status":status,"lh":lh,"ph":ph,
                "skills_learned":[s for s in skills if len(s)>4],"content_summary":content[:400] if content else None}
            order.append(code)
    i+=1
clist=[courses[c] for c in order]
d=json.load(open(jpath,encoding="utf-8"))
# skip if already present
if any(p["code"]==prefix or p["name"].lower()==name.lower() for p in d["programmes"]):
    print(f"{name} already present, skipping"); sys.exit()
d["programmes"].append({"code":prefix,"name":name,"qualification":qual,"duration_years":years,
    "objectives":[],"employability_skills":[],"skills_21st_century":[],
    "skills_profile":[], "courses":clist})
json.dump(d,open(jpath,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
ws=sum(1 for c in clist if c["skills_learned"])
print(f"appended {name} to {jpath.split('/')[-1]}: {len(clist)} courses, {ws} with skills")
