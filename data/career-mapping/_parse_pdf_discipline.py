#!/usr/bin/env python3
"""Deterministically extract a CCMAS discipline (programmes + courses + per-course skills)
from a pdftotext -layout dump of the ORIGINAL NUC PDF.
Usage: python _parse_pdf_discipline.py <pdftxt> <Discipline> <out.json> <body_start_line>
Course blocks look like:  CODE: Title  (N Units C: LH X; PH Y)  /  Learning Outcomes /
"...should be able to:" / 1. ... 2. ... / Course Contents / <prose>."""
import json, re, sys
from collections import Counter

txt, discipline, out = sys.argv[1], sys.argv[2], sys.argv[3]
body_start = int(sys.argv[4]) if len(sys.argv) > 4 else 0
lines = open(txt, encoding="utf-8", errors="replace").read().split("\n")

_DEG = r"(?:B\.?\s?Sc\.?|B\.?\s?Tech\.?|B\.?\s?A\.?|B\.?\s?Eng\.?|B\.?\s?Pharm\.?|Bachelor|Doctor|Master|DVM)"
_STARTS = re.compile(r"^\s*" + _DEG, re.I)
_STRIP = re.compile(r"^((?:" + _DEG + r"|of|and|in|/|\.|\s)+)", re.I)
_PROGN = re.compile(r"^\s*PROGRAMME\s+\d+(?:\s+OF\s+\d+)?\s*:\s*(.+?)\s*$", re.I)
def prog_name(ln):
    s = ln.strip()
    pn = _PROGN.match(s)                    # ".md" style: "PROGRAMME 4 OF 39: Biology"
    if pn:
        nm = pn.group(1).strip(" .")
        return nm if 3 < len(nm) < 60 else None
    if "....." in s or len(s) > 72 or not _STARTS.match(s): return None
    s = re.sub(r"\([^)]*\)", "", s).strip()          # drop parenthetical degree abbrevs
    s = _STRIP.sub("", s).strip(" ./-")               # drop leading degree tokens + of/and/in
    if 3 < len(s) < 55 and not s[0].islower() and not s[0].isdigit(): return s
    return None
class _Pm:  # shim so existing `pm = PROG.match(ln)` code path works
    def __init__(self, name): self._n = name
    def group(self, i): return self._n
class PROG:
    @staticmethod
    def match(ln):
        nm = prog_name(ln)
        return _Pm(nm) if nm else None
COURSE = re.compile(r"^\s*([A-Z]{2,4}\s?\d{3}[a-z]?)\s*:\s*(.+?)\s*$")
UNITS = re.compile(r"\(\s*(\d+)\s*Units?\s*([CER])\s*[:;]?\s*(?:LH\s*(\d+))?\s*(?:;\s*PH\s*(\d+))?", re.I)
ABLE = re.compile(r"able to|expected to", re.I)
NUM = re.compile(r"^\s*(?:\d{1,2}[.)]|[-–•])\s+(.*)$")
CONTENT = re.compile(r"course content", re.I)
LEVEL = re.compile(r"^\s*(\d{3})\s*Level", re.I)

programmes = []
cur_prog = None
i = body_start
n = len(lines)

def new_prog(name):
    p = {"code": None, "name": name.strip().rstrip("."), "qualification": None,
         "duration_years": None, "objectives": [], "employability_skills": [],
         "skills_21st_century": [], "courses": []}
    programmes.append(p); return p

while i < n:
    ln = lines[i]
    pm = PROG.match(ln)
    if pm and len(ln.strip()) < 60 and "....." not in ln:
        nm = pm.group(1).strip()
        if 3 < len(nm) < 55 and not nm[0].islower():
            cur_prog = new_prog(nm)
            i += 1; continue
    cm = COURSE.match(ln)
    if cm and cur_prog is not None:
        code = re.sub(r"\s+", " ", cm.group(1)).strip()
        rest = cm.group(2)
        # units may be in rest or on the previous non-empty line
        um = UNITS.search(rest)
        title = rest
        if not um:
            for k in range(i-1, max(i-3, 0), -1):
                if UNITS.search(lines[k]): um = UNITS.search(lines[k]); break
        else:
            title = rest[:um.start()].strip()
        title = re.sub(r"\(.*?\)$", "", title).strip(" .")
        units = int(um.group(1)) if um and um.group(1) else None
        status = (um.group(2).upper() if um else "C")
        status = "E" if status in ("E", "R") else "C"
        lh = int(um.group(3)) if um and um.group(3) else None
        ph = int(um.group(4)) if um and um.group(4) else None
        lvl = int(code[-3:]) // 100 * 100 if code[-3:].isdigit() else None
        # scan forward for outcomes + content
        skills = []; content = None; j = i + 1; mode = None
        while j < n and j < i + 60:
            l2 = lines[j]
            if COURSE.match(l2) and j > i + 1: break
            if PROG.match(l2) and "....." not in l2 and len(l2.strip()) < 60: break
            if ABLE.search(l2): mode = "lo"; j += 1; continue
            if CONTENT.search(l2): mode = "content"; j += 1; continue
            if mode == "lo":
                m = NUM.match(l2)
                if m: skills.append(m.group(1).strip().rstrip(";.").strip())
                elif l2.strip() and skills: skills[-1] += " " + l2.strip()
            elif mode == "content":
                if l2.strip():
                    content = ((content or "") + " " + l2.strip()).strip()
            j += 1
        cur_prog["courses"].append({
            "level": lvl, "code": code, "title": title, "units": units, "status": status,
            "lh": lh, "ph": ph, "skills_learned": [s for s in skills if len(s) > 4],
            "content_summary": (content[:400] if content else None)})
    i += 1

# infer programme code from dominant non-generic course prefix
GEN = {"GST", "ENT", "SSC", "MTH", "PHY", "CHM", "BIO", "STA", "COS", "FAA"}
used = set()
for p in programmes:
    pref = Counter(re.match(r"^([A-Z]{2,4})", c["code"]).group(1) for c in p["courses"] if (c.get("level") or 0) >= 300 and re.match(r"^([A-Z]{2,4})", c["code"]))
    ng = [k for k in pref if k not in GEN]
    code = (max(ng, key=lambda k: pref[k]) if ng else (pref.most_common(1)[0][0] if pref else "XXX"))
    base = code; x = 1
    while code in used: x += 1; code = f"{base}{x}"
    p["code"] = code; used.add(code)
    p["qualification"] = "B.Sc"; p["duration_years"] = 5 if any((c.get("level") or 0) >= 500 for c in p["courses"]) else 4

programmes = [p for p in programmes if len(p["courses"]) >= 3]
json.dump({"discipline": discipline, "source_file": txt.split("/")[-1], "document_flags": [], "programmes": programmes},
          open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
tc = sum(len(p["courses"]) for p in programmes)
ts = sum(1 for p in programmes for c in p["courses"] if c["skills_learned"])
print(f"{out}: {len(programmes)} programmes, {tc} courses, {ts} with skills ({100*ts//tc if tc else 0}%)")
for p in programmes:
    print(f"  [{p['code']:5}] {p['name'][:38]:38} {len(p['courses'])} courses")
