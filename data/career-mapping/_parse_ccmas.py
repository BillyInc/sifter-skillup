#!/usr/bin/env python3
"""Deterministically parse CCMAS course tables (regular markdown) into our schema.
Usage: python _parse_ccmas.py <source.md> <discipline> <out.json> [part2_start_line]
Header-aware: reads each table's header row to map columns, so it tolerates the
column-order variants across disciplines. Level comes from `### N Level` headings
or a Level column if present. '-'/'—'/'' -> null. Skips Total rows."""
import json, re, sys

src, discipline, out = sys.argv[1], sys.argv[2], sys.argv[3]
start = int(sys.argv[4]) if len(sys.argv) > 4 else 0
lines = open(src, encoding="utf-8", errors="replace").read().split("\n")

def cells(line):
    if "|" not in line: return None
    parts = line.split("|")
    if parts and parts[0].strip() == "": parts = parts[1:]
    if parts and parts[-1].strip() == "": parts = parts[:-1]
    return [c.strip() for c in parts]

def num(v):
    v = (v or "").replace("*", "").strip()
    if v in ("", "-", "—", "–", "nil", "Nil", "NIL"): return None
    m = re.search(r"-?\d+", v)
    return int(m.group()) if m else None

def clean(v): return re.sub(r"\s*\*+\s*", " ", (v or "")).strip().strip("*").strip()

PROG_RE = re.compile(r"^\s*#*\s*PROGRAMME(?:\s+\d+)?:\s*(?:B\.?\s?[A-Za-z]{1,4}\.?\s+)?(.+?)\s*$", re.I)
LEVEL_RE = re.compile(r"^\s*#*\s*(\d{3})\s*Level\b", re.I)
SEP_RE = re.compile(r"^\|?\s*:?-{2,}")

programmes = []
cur = None          # current programme dict
in_p12 = False      # only parse rows inside a P12 GLOBAL COURSE STRUCTURE block
level = None
colmap = None       # header column indices

def header_map(cs):
    m = {}
    for i, c in enumerate(cs):
        cl = c.lower()
        if "code" in cl: m["code"] = i
        elif "title" in cl: m["title"] = i
        elif "unit" in cl: m["units"] = i
        elif cl == "status" or "status" in cl and "category" not in cl: m["status"] = i
        elif "categor" in cl: m["category"] = i
        elif cl == "lh" or "lecture" in cl: m["lh"] = i
        elif cl == "ph" or "practical" in cl: m["ph"] = i
        elif "level" in cl: m["level"] = i
    return m if "code" in m and "title" in m else None

for i, ln in enumerate(lines):
    if i < start: continue
    pm = PROG_RE.match(ln)
    if pm:
        cur = {"code": None, "name": clean(pm.group(1)), "qualification": "B.Sc",
               "duration_years": 4, "employability_skills": [], "pathways": [], "courses": []}
        programmes.append(cur); in_p12 = False; level = None; colmap = None
        continue
    if cur is None: continue
    if re.match(r"^#+\s*P12\.", ln) or "GLOBAL COURSE STRUCTURE" in ln.upper():
        in_p12 = True; continue
    if re.match(r"^#+\s*P1[34]\.", ln) or "COURSE LEARNING OUTCOMES" in ln.upper() or "COURSE CONTENT" in ln.upper():
        in_p12 = False; continue
    lm = LEVEL_RE.match(ln.strip())
    if lm: level = int(lm.group(1)); continue
    if not in_p12 or "|" not in ln: continue
    if SEP_RE.match(ln.strip()): continue
    cs = cells(ln)
    if not cs: continue
    hm = header_map(cs)
    if hm: colmap = hm; continue
    if colmap is None: continue
    joined = " ".join(cs).lower()
    if "total" in joined: continue
    def g(k):
        idx = colmap.get(k)
        return cs[idx] if idx is not None and idx < len(cs) else None
    code = clean(g("code"))
    title = clean(g("title"))
    if not code or not title: continue
    if not re.match(r"^[A-Z]{2,4}\s?\d", code): continue   # must look like a course code
    lvl = num(g("level")) or level
    status = (clean(g("status")) or "C")[:1].upper()
    if status not in ("C", "E"): status = "C"
    if cur["code"] is None:
        m = re.match(r"^([A-Z]{2,4})", code)
        # programme code from the dominant non-generic prefix is set later; keep first seen as hint
    cur["courses"].append({"level": lvl, "code": code, "title": title,
                            "units": num(g("units")), "status": status,
                            "lh": num(g("lh")), "ph": num(g("ph")), "flags": []})

# infer programme code = most common course-code prefix that isn't a generic shared one
GENERIC = {"GST", "ENT", "SSC", "MTH", "PHY", "CHM", "BIO", "STA", "COS"}
for p in programmes:
    from collections import Counter
    pref = Counter(re.match(r"^([A-Z]{2,4})", c["code"]).group(1) for c in p["courses"] if re.match(r"^([A-Z]{2,4})", c["code"]))
    non_generic = [k for k in pref if k not in GENERIC]
    p["code"] = (max(non_generic, key=lambda k: pref[k]) if non_generic
                 else (pref.most_common(1)[0][0] if pref else "XXX"))

programmes = [p for p in programmes if p["courses"]]
json.dump({"discipline": discipline, "source_file": src.split("\\")[-1].split("/")[-1],
           "document_flags": [], "programmes": programmes},
          open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{out}: {len(programmes)} programmes, {sum(len(p['courses']) for p in programmes)} courses")
for p in programmes:
    print(f"  [{p['code']:4}] {p['name'][:40]:40} {len(p['courses'])} courses")
