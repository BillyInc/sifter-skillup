#!/usr/bin/env python3
"""Deterministically extract JAMB faculty offerings (name-variations + per-university
institution lists) from a layout-preserved brochure .txt.
Usage: python _parse_jamb.py <txt> <faculty> <degree> <out.json> <index_end_line> <body_start_line>
Institution lists (column-0 codes between programme headings) are reliable.
Requirement/waiver prose is NOT parsed here (needs the column layout) -> left null."""
import json, re, sys
from collections import Counter

txt, faculty, degree, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
idx_end = int(sys.argv[5]); body_start = int(sys.argv[6])
lines = open(txt, encoding="utf-8", errors="replace").read().split("\n")

# ── 1. index name-variations: "<num>  <Name>" pairs (multi-column, names may wrap) ──
idx_names = {}
for ln in lines[:idx_end]:
    for m in re.finditer(r"(?<!\d)(\d{1,3})\.?\s{1,}([A-Za-z][A-Za-z0-9/&,.'()\- ]{3,55}?)(?=\s{3,}\d{1,3}\.?\s|\s*$)", ln):
        n = int(m.group(1)); nm = re.sub(r"\s+", " ", m.group(2)).strip(" .,-")
        if len(nm) > 3 and not nm.isdigit():
            idx_names[n] = nm
names = sorted(set(idx_names.values()), key=lambda s: -len(s))
upper = {n.upper(): n for n in names}

STOP = {"SCIENCES","ADMINISTRATION","SOCIAL SCIENCES","DIRECT ENTRY","UTME","SUBJECTS",
        "REQUIREMENTS","AWARDING INSTITUTIONS","SPECIAL CONSIDERATION","COURSE/DEGREE",
        "ALL PROGRAMMES","FACULTY","NOTE","DEGREE AWARDING","INSTITUTIONS","COURSE/"}
CODE_RE = re.compile(r"[A-Z0-9][A-Z0-9'&./ -]{1,24}$")

def cell0(ln):
    if not ln or ln[0] == " ": return None
    return re.split(r"\s{2,}", ln.rstrip())[0].strip()

def match_heading(c):
    cu = c.upper()
    if cu in upper: return upper[cu]
    # multiword prefix of a unique index name
    if " " in cu and len(cu) >= 6:
        cand = [n for n in names if n.upper().startswith(cu + " ")]
        if len(cand) == 1: return cand[0]
    return None

def is_code(c):
    if not c or c in STOP: return False
    if re.fullmatch(r"\d{2,4}", c): return False
    if not CODE_RE.fullmatch(c): return False
    if c.upper() in upper: return False
    return True

progs = []; cur = None
for i, ln in enumerate(lines):
    if i < body_start: continue
    c = cell0(ln)
    if c is None: continue
    h = match_heading(c)
    if h:
        if cur is not None: cur["line_range"][1] = i  # close previous at this heading
        cur = {"jamb_name": h, "institutions": [], "utme_subjects": None,
               "olevel_requirement": None, "direct_entry": None, "institution_waivers": [],
               "first_line": i + 1,  # anchor: first heading occurrence (requirement columns sit here)
               "line_range": [i + 1, len(lines)]}  # 1-based start; end patched at next heading
        progs.append(cur); continue
    if cur is not None and is_code(c):
        if c not in cur["institutions"]: cur["institutions"].append(c)

# keep programmes that actually have institutions; merge dup headings (union ranges)
merged = {}
for p in progs:
    k = p["jamb_name"].upper()
    if k in merged:
        for inst in p["institutions"]:
            if inst not in merged[k]["institutions"]: merged[k]["institutions"].append(inst)
        a, b = merged[k]["line_range"]; c2, d2 = p["line_range"]
        merged[k]["line_range"] = [min(a, c2), max(b, d2)]
    else:
        merged[k] = p
final = [p for p in merged.values() if p["institutions"]]

# tight enrichment scope: first_line -> next programme's first_line (by document order)
_by_start = sorted(final, key=lambda p: p["first_line"])
for j, p in enumerate(_by_start):
    nxt = _by_start[j + 1]["first_line"] if j + 1 < len(_by_start) else len(lines)
    p["scope"] = [p["first_line"], nxt]

json.dump({"faculty": faculty, "source": txt.split("\\")[-1].split("/")[-1], "degree": degree,
           "note": "Deterministic extraction: name-variations + per-university institution lists. Requirement/waiver prose pending.",
           "programmes": final},
          open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{out}: {len(idx_names)} index names, {len(final)} programmes with institutions, "
      f"{sum(len(p['institutions']) for p in final)} offerings")
for p in sorted(final, key=lambda x: -len(x['institutions']))[:12]:
    print(f"  {p['jamb_name'][:42]:42} {len(p['institutions'])}")
