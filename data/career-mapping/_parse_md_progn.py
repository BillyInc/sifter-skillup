#!/usr/bin/env python3
"""Parse a CCMAS .md that uses `PROGRAMME N OF NN: Name` headers + P12 space-aligned
course tables (`CODE Title Units Status LH PH [CATEGORY: ..]`) + P13 `CODE: Title (N Units..)`
+ "able to:" outcome blocks. Combines: header boundaries -> programmes; space-table -> courses;
P13 -> per-course skills.  Usage: python _parse_md_progn.py <md> <Discipline> <out.json>"""
import json, re, sys
from collections import Counter

md, discipline, out = sys.argv[1], sys.argv[2], sys.argv[3]
lines = open(md, encoding="utf-8", errors="replace").read().split("\n")
N = len(lines)

HEAD = re.compile(r"^\s*PROGRAMME\s+\d+(?:\s+OF\s+\d+)?\s*:\s*(.+?)\s*$", re.I)
# space table row: CODE  Title...  Units  Status(C/E)  LH  PH   (LH/PH may be '-' ; PH optional)
ROW = re.compile(r"^\s*([A-Z]{2,4}\s?\d{3}[A-Z]?)\s+(.+?)\s+(\d+)\s+([CER])\s+(\d+|[-–])\s*(\d+|[-–])?\s*(?:\[CATEGORY)?", )
P12 = re.compile(r"GLOBAL COURSE STRUCTURE|P12\.", re.I)
P13 = re.compile(r"COURSE LEARNING OUTCOME|P13\.|COURSE CONTENT|P14\.", re.I)
CBLK = re.compile(r"^\s*#{0,4}\**\s*([A-Z]{2,4}\s?\d{3}[A-Z]?)\s*:\s*(.+)$")
ABLE = re.compile(r"able to|expected to", re.I)
NUM = re.compile(r"^\s*(?:\d{1,2}[.)]|[-–•])\s+(.*)$")

# --- pass 1: programme boundaries (use the LAST occurrence block = Part 2 with courses) ---
heads = [(i, HEAD.match(l).group(1).strip(" .")) for i, l in enumerate(lines) if HEAD.match(l)]
# keep the second half (Part 2) if headers repeat
if heads:
    names = [h[1] for h in heads]
    # find where the sequence restarts (Part 2)
    seen = {}; part2_start = 0
    for k,(ln,nm) in enumerate(heads):
        if nm in seen: part2_start = k; break
        seen[nm] = ln
    body_heads = heads[part2_start:] if part2_start else heads
else:
    body_heads = []

progs = []
for idx,(ln,nm) in enumerate(body_heads):
    end = body_heads[idx+1][0] if idx+1 < len(body_heads) else N
    seg = lines[ln:end]
    courses = {}; mode = None
    order = []
    for l in seg:
        if P12.search(l): mode = "p12"; continue
        if P13.search(l): mode = "p13"; break_after=True  # p13 begins; handle below
        if mode == "p12":
            m = ROW.match(l)
            if m and "TOTAL" not in l.upper():
                code = re.sub(r"\s+"," ",m.group(1)).strip()
                title = m.group(2).strip(" .")
                if len(title) < 3: continue
                lh = None if m.group(5) in ("-","–") else int(m.group(5))
                ph = None if not m.group(6) or m.group(6) in ("-","–") else int(m.group(6))
                lvl = int(re.search(r"\d{3}",code).group())//100*100
                if code not in courses:
                    courses[code] = {"level":lvl,"code":code,"title":title,"units":int(m.group(3)),
                        "status":"E" if m.group(4) in ("E","R") else "C","lh":lh,"ph":ph,
                        "skills_learned":[],"content_summary":None}
                    order.append(code)
    # pass P13 skills within this segment
    cur=None; smode=None
    for l in seg:
        cb = CBLK.match(l)
        if cb and ABLE.search(l) is None:
            cur = re.sub(r"\s+"," ",cb.group(1)).strip(); smode=None; continue
        if cur is None: continue
        if ABLE.search(l): smode="lo"; continue
        if re.search(r"course content",l,re.I): smode="content"; continue
        if smode=="lo":
            mm=NUM.match(l)
            if mm and cur in courses: courses[cur]["skills_learned"].append(mm.group(1).strip().rstrip(";.").strip())
            elif l.strip() and cur in courses and courses[cur]["skills_learned"]:
                courses[cur]["skills_learned"][-1]+=" "+l.strip()
    clist=[courses[c] for c in order]
    if len(clist)>=3:
        pref=Counter(re.match(r"([A-Z]+)",c["code"]).group(1) for c in clist)
        GEN={"GST","ENT","EDU","SSC","TEE","GSE","ICT"}
        ng=[k for k in pref if k not in GEN]
        code=max(ng,key=lambda k:pref[k]) if ng else pref.most_common(1)[0][0]
        progs.append({"code":code,"name":nm,"qualification":None,
            "duration_years":5 if any(c["level"]>=500 for c in clist) else 4,
            "objectives":[],"employability_skills":[],"skills_21st_century":[],"courses":clist})

# unique codes
used=set()
for p in progs:
    b=p["code"];c=b;x=1
    while c in used:x+=1;c=f"{b}{x}"
    p["code"]=c;used.add(c)
json.dump({"discipline":discipline,"source_file":md.split("/")[-1],"document_flags":[],"programmes":progs},
          open(out,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
tc=sum(len(p["courses"]) for p in progs); ts=sum(1 for p in progs for c in p["courses"] if c["skills_learned"])
print(f"{out}: {len(progs)} programmes, {tc} courses, {ts} skills ({100*ts//tc if tc else 0}%)")
