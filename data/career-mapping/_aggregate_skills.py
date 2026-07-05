#!/usr/bin/env python3
"""BEFORE-AGGREGATE step: build a clean per-programme skill aggregate from the granular
per-course learning outcomes (+ employability + 21st-century). Runs across all ccmas/*.json.
- course-derived skills = union of every course's skills_learned (the differentiating, technical set)
- transferable skills   = employability_skills + skills_21st_century (generic/cross-cutting)
Dedup merges near-duplicates (same normalized 28-char prefix) keeping the fuller phrasing.
Writes back: programme.skills_profile (clean, all), .skills_profile_technical, .skills_profile_transferable,
and .skills_count. This is INTRINSIC to the CCMAS programme (done before JAMB)."""
import json, glob, re

# --- identify shared foundation/service courses (appear across >=4 disciplines) ---
_disc_of_code = {}
for _f in glob.glob("ccmas/*.json"):
    _d = json.load(open(_f, encoding="utf-8"))
    for _p in _d["programmes"]:
        for _c in _p["courses"]:
            _disc_of_code.setdefault(_c["code"], set()).add(_d["discipline"])
SHARED_FOUNDATION = {code for code, ds in _disc_of_code.items() if len(ds) >= 4}

def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())
def clean(s): return re.sub(r"\s+", " ", (s or "").strip()).strip(" .;,")

def dedup(items):
    """merge near-duplicates: same first-28 normalized chars -> keep the longer/fuller one."""
    best = {}
    for s in items:
        s = clean(s)
        if len(norm(s)) < 5: continue
        k = norm(s)[:28]
        if k not in best or len(s) > len(best[k]): best[k] = s
    # order by original appearance is lost; sort transferable-ish (short) first is not needed -> keep insertion of best
    return list(best.values())

tp = tsk = 0
for f in sorted(glob.glob("ccmas/*.json")):
    d = json.load(open(f, encoding="utf-8"))
    for p in d["programmes"]:
        tech_raw = []; foundation_raw = []
        for c in p["courses"]:
            (foundation_raw if c["code"] in SHARED_FOUNDATION else tech_raw).extend(c.get("skills_learned", []))
        # transferable = generic employability/21c + shared-foundation-course outcomes (GST/ENT/service sci)
        transferable = dedup(list(p.get("employability_skills", [])) + list(p.get("skills_21st_century", [])) + foundation_raw)
        # technical = only programme-DISTINCTIVE course outcomes
        technical = dedup(tech_raw)
        # full profile = transferable + technical, deduped across both
        full = dedup(transferable + technical)
        p["skills_profile"] = full
        p["skills_profile_technical"] = technical
        p["skills_profile_transferable"] = transferable
        p["skills_count"] = len(full)
        tp += 1; tsk += len(full)
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"aggregated {tp} programmes; {tsk} total skills ({tsk//tp} avg/programme)")
# spot-check
import json as _j
d = _j.load(open("ccmas/computing.json", encoding="utf-8"))
p = next(x for x in d["programmes"] if "Computer Science" in x["name"])
print(f"sample Computer Science: {p['skills_count']} total ({len(p['skills_profile_transferable'])} transferable + {len(p['skills_profile_technical'])} technical)")
