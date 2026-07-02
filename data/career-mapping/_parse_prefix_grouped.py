#!/usr/bin/env python3
"""For list-heavy CCMAS disciplines whose programme HEADINGS don't parse but whose
course blocks DO: extract every course block, group by course-prefix into programmes,
and align prefixes (by first-occurrence order) to the ordered ToC programme names.
Usage: python _parse_prefix_grouped.py <pdftxt> <Discipline> <out.json>
Names are best-effort (agents correct later); coverage is the point."""
import json, re, sys
from collections import Counter, OrderedDict

txt_path, discipline, out = sys.argv[1], sys.argv[2], sys.argv[3]
lines = open(txt_path, encoding="utf-8", errors="replace").read().split("\n")
N = len(lines)

# 1) ordered ToC programme names: "B. Sc. Ed. Economics .......... 346"
toc = []
for l in lines[:900]:
    m = re.match(r"^\s*(?:B\.?\s?(?:Sc|A|Ed|Tech|Pharm)\.?\s*)+\(?\s?(?:Ed|Hons)?\.?\)?\s*([A-Z][A-Za-z&,'/.\- ]{3,55}?)\s*\.{4,}\s*\d+\s*$", l)
    if m:
        nm = re.sub(r"\s+", " ", m.group(1)).strip(" .")
        nm = re.sub(r"\bEducation\b\s*$", "Education", nm)
        if 3 < len(nm) < 55: toc.append(nm)

COURSE = re.compile(r"^\s*([A-Z]{2,4})\s?(\d{3}[a-z]?)\s*:\s*(.+?)\s*$")
UNITS = re.compile(r"\(\s*(\d+)\s*Units?\s*([CER])\s*[:;]?\s*(?:LH\s*(\d+))?\s*(?:;\s*PH\s*(\d+))?", re.I)
ABLE = re.compile(r"able to|expected to", re.I)
NUM = re.compile(r"^\s*(?:\d{1,2}[.)]|[-–•])\s+(.*)$")
CONTENT = re.compile(r"course content", re.I)
GEN = {"GST","ENT","SSC","MTH","PHY","CHM","BIO","STA","COS","EDU","TEE","GSE","FAA","GST","ICT"}

# 2) parse every course block; remember prefix + first line
courses = []  # (line, prefix, code, dict)
i = 0
while i < N:
    m = COURSE.match(lines[i])
    if m:
        prefix, num, rest = m.group(1), m.group(2), m.group(3)
        code = f"{prefix} {num}"
        um = UNITS.search(rest)
        title = rest[:um.start()].strip() if um else rest
        title = re.sub(r"\(.*?\)$", "", title).strip(" .")
        units = int(um.group(1)) if um and um.group(1) else None
        status = "E" if (um and um.group(2).upper() in ("E","R")) else "C"
        lh = int(um.group(3)) if um and um.group(3) else None
        ph = int(um.group(4)) if um and um.group(4) else None
        lvl = int(num[:3])//100*100
        skills=[]; content=None; j=i+1; mode=None
        while j < N and j < i+55:
            l2=lines[j]
            if COURSE.match(l2) and j>i+1: break
            if ABLE.search(l2): mode="lo"; j+=1; continue
            if CONTENT.search(l2): mode="content"; j+=1; continue
            if mode=="lo":
                mm=NUM.match(l2)
                if mm: skills.append(mm.group(1).strip().rstrip(";.").strip())
                elif l2.strip() and skills: skills[-1]+=" "+l2.strip()
            elif mode=="content" and l2.strip(): content=((content or "")+" "+l2.strip()).strip()
            j+=1
        courses.append((i, prefix, code, {"level":lvl,"code":code,"title":title,"units":units,
            "status":status,"lh":lh,"ph":ph,"skills_learned":[s for s in skills if len(s)>4],
            "content_summary":content[:400] if content else None}))
    i += 1

# 3) group by prefix, order prefixes by first occurrence
first_line = OrderedDict()
by_prefix = {}
for ln, pref, code, d in courses:
    if pref in GEN: continue
    by_prefix.setdefault(pref, []).append(d)
    if pref not in first_line: first_line[pref] = ln
prefixes = sorted(by_prefix, key=lambda p: first_line[p])
prefixes = [p for p in prefixes if len(by_prefix[p]) >= 5]   # real programmes

# 4) align to ToC names by order (best-effort)
programmes = []
for idx, pref in enumerate(prefixes):
    name = toc[idx] if idx < len(toc) else f"{pref} programme"
    cs = by_prefix[pref]
    lvls = [c["level"] for c in cs if c["level"]]
    programmes.append({"code": pref, "name": name, "qualification": None,
        "duration_years": 5 if any(l>=500 for l in lvls) else 4,
        "objectives": [], "employability_skills": [], "skills_21st_century": [],
        "_prefix_grouped": True, "courses": cs})

json.dump({"discipline": discipline, "source_file": txt_path.split("/")[-1], "document_flags": [],
           "programmes": programmes}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
tc = sum(len(p["courses"]) for p in programmes)
ts = sum(1 for p in programmes for c in p["courses"] if c["skills_learned"])
print(f"{out}: {len(programmes)} programmes (prefixes), {tc} courses, {ts} skills ({100*ts//tc if tc else 0}%)")
print(f"ToC names found: {len(toc)}")
for p in programmes[:8]: print(f"  [{p['code']:5}] {p['name'][:34]:34} {len(p['courses'])}c")
