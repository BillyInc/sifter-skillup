#!/usr/bin/env python3
"""Build the derived programme skill arrays from granular CCMAS records.

The course records remain the source of truth.  This step only creates derived
arrays used by downstream matching; it must not turn maintainer annotations or
shared-course rows into a single undifferentiated student list.

The output boundaries are:
* ``skills_profile_technical``: clean course-outcome wording, still owned by the
  programme (including shared/general courses when the programme records them);
* ``skills_profile_transferable``: the programme's explicit employability and
  21st-century ability records, not course outcomes;
* ``skills_profile``: the union of those two arrays for compatibility.

Exact-normalised deduplication is used.  Prefix-based deduplication is unsafe:
two different outcomes can share an opening phrase while requiring different
learning.  Appended ``[... NOTE]`` annotations are retained in the source
record for audit but are removed from the derived arrays.
"""
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

# Parser/maintainer annotations are metadata, not programme learning.  The
# annotation itself remains in the raw CCMAS input and in the audit artifact.
ANNOTATION = re.compile(r"\s+>\s+\*\*\[[^]]+\]:\*\*.*$", re.IGNORECASE)

def clean_outcome(s):
    return clean(ANNOTATION.sub("", str(s or "")))

def dedup(items):
    """Deduplicate only exact-normalised wording; never merge by prefix."""
    best = {}
    for s in items:
        s = clean_outcome(s)
        if len(norm(s)) < 5: continue
        k = norm(s)
        if k not in best: best[k] = s
    return list(best.values())

tp = tsk = 0
for f in sorted(glob.glob("ccmas/*.json")):
    d = json.load(open(f, encoding="utf-8"))
    for p in d["programmes"]:
        tech_raw = []
        for c in p["courses"]:
            tech_raw.extend(c.get("skills_learned", []))
        # Keep explicit programme abilities separate from course outcomes.  A
        # shared GST/ENT/SSC course is still part of this programme's recorded
        # curriculum; it is not automatically a transferable ability.
        transferable = dedup(list(p.get("employability_skills", [])) + list(p.get("skills_21st_century", [])))
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
