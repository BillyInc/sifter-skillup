#!/usr/bin/env python3
"""Deterministically extract per-course LEARNING OUTCOMES (the skills) from CCMAS .md
P13 sections, plus a short content summary from P14, and ATTACH them to the courses
in an existing ccmas/<discipline>.json (matched by course code).
Usage: python _extract_skills.py <source.md> <ccmas_json>"""
import json, re, sys

src, jpath = sys.argv[1], sys.argv[2]
lines = open(src, encoding="utf-8", errors="replace").read().split("\n")

# heading: optional leading #### or ** (bold), then CODE: Title, optional trailing **
CODE_HEAD = re.compile(r"^\s*(?:#{1,4}\s+|\*{2}\s*)?([A-Z]{2,4}\s?\d{3})\s*:\s*(.+?)\s*\*{0,2}\s*$")
# alt heading: "**Course Code:** GST 112 | **Course Title:** ..." (Computing/Law style)
CODE_HEAD2 = re.compile(r"\*{0,2}\s*Course Code\s*:?\s*\*{0,2}\s*([A-Z]{2,4}\s?\d{3})", re.I)
# outcome bullet: numbered (1. / 1)) OR dash/bullet (- • –)
NUM = re.compile(r"^\s*(?:\d{1,2}[.)]|[-–•])\s+(.*)$")
ABLE = re.compile(r"able to|expected to", re.I)  # "should be able to" / "are expected to" / "will be able to"
CONTENT_HD = re.compile(r"course content", re.I)
STOPHD = re.compile(r"^\s*\[SOURCE|^#{1,4}\s*P1[24]\.|^#{1,4}\s*PROGRAMME|GLOBAL COURSE STRUCTURE", re.I)

# skills_by_code: course_code -> list of outcome strings (union across programmes; outcomes are course-intrinsic)
skills_by_code = {}
content_by_code = {}

cur = None          # current course code
mode = None         # 'lo' (capturing outcomes) | 'content' | None
buf = []            # outcome items
content_buf = []

def flush():
    global cur, buf, content_buf
    if cur:
        if buf:
            skills_by_code.setdefault(cur, [])
            for o in buf:
                o = o.strip().rstrip(";.").strip()
                o = re.sub(r"\s+", " ", o)
                if o and o.lower() not in ("and",) and o not in skills_by_code[cur]:
                    skills_by_code[cur].append(o)
        if content_buf and cur not in content_by_code:
            txt = re.sub(r"\s+", " ", " ".join(content_buf)).strip()
            if txt: content_by_code[cur] = txt[:400]
    buf = []; content_buf = []

for ln in lines:
    h2 = CODE_HEAD2.search(ln)            # "Course Code: CODE" inline form
    if h2:
        flush(); cur = h2.group(1).strip(); mode = "lo" if ABLE.search(ln) else None
        continue
    h = CODE_HEAD.match(ln)
    if h and (ABLE.search(ln) is None):
        # new course heading like "### COS 101: Introduction to..."
        flush(); cur = h.group(1).replace(" ", " ").strip(); mode = None
        continue
    if cur is None:
        continue
    if ABLE.search(ln):
        mode = "lo"; continue
    if CONTENT_HD.search(ln):
        mode = "content"; continue
    if STOPHD.search(ln):
        mode = None; continue
    if mode == "lo":
        m = NUM.match(ln)
        if m:
            buf.append(m.group(1))
        elif ln.strip() and buf:
            buf[-1] += " " + ln.strip()   # wrapped continuation
    elif mode == "content":
        if ln.strip():
            content_buf.append(ln.strip())
flush()

# attach to ccmas json
d = json.load(open(jpath, encoding="utf-8"))
def norm(c): return c.replace(" ", "").upper()
sk = {norm(k): v for k, v in skills_by_code.items()}
ct = {norm(k): v for k, v in content_by_code.items()}
nattach = 0; ncourses = 0
for p in d["programmes"]:
    for c in p["courses"]:
        ncourses += 1
        k = norm(c["code"])
        if k in sk:
            c["skills_learned"] = sk[k]; nattach += 1
        else:
            c.setdefault("skills_learned", [])
        if k in ct and not c.get("content_summary"):
            c["content_summary"] = ct[k]
json.dump(d, open(jpath, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
total_outcomes = sum(len(v) for v in skills_by_code.values())
print(f"{jpath.split('/')[-1]}: parsed {len(skills_by_code)} distinct courses w/ outcomes "
      f"({total_outcomes} outcome bullets); attached skills to {nattach}/{ncourses} course rows; "
      f"{len(content_by_code)} content summaries")
