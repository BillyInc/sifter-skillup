#!/usr/bin/env python3
"""STEP 3 — JAMB-NUANCE AGGREGATE.
A JAMB admission name can BLEND several CCMAS programmes (e.g. "Political Science and
International Relations" = POL + IRS; "Economics and Statistics" = ECO + STA). The bridge
records only the PRIMARY programme (structured) + secondaries in prose. Here we build a
per-JAMB-name skills profile = UNION of the skills_profile_technical / _transferable of the
PRIMARY programme plus any SECONDARY component programmes. Output: jamb/jamb_skills_nuance.json
keyed by jamb_name -> {components:[{discipline,code,name,role}], skills_profile_technical,
skills_profile_transferable, skills_count}. Deterministic; validates every component exists.

Single-programme JAMB names get a 1-component profile (just their primary) so EVERY linked
JAMB name has a resolved skills profile — the blends are where the union actually adds skills.
"""
import json, glob, re

# ── canonical skills index ──
# key by (discipline, NAME) — a CCMAS code is NOT unique within a discipline
# (Engineering 'GET' spans 30 programmes), so code-keying silently collapses them.
prog = {}                      # (disc, name) -> {name, code, tech, trans}
by_disc_code = {}              # (disc, code) -> [(disc,name) keys]  (may be many for GET)
code_only = {}                 # code -> [(disc,name) keys]  (pilot rows carry code only)
for f in glob.glob("ccmas/*.json"):
    d = json.load(open(f, encoding="utf-8"))
    disc = d["discipline"]
    for p in d["programmes"]:
        key = (disc, p["name"])
        prog[key] = {"name": p["name"], "code": p["code"],
                     "tech": p.get("skills_profile_technical", []),
                     "trans": p.get("skills_profile_transferable", [])}
        by_disc_code.setdefault((disc, p["code"]), []).append(key)
        code_only.setdefault(p["code"], []).append(key)

# custom Type-D programmes carry their own course skills? (enrichment files) — include if present
for f in [
    "enrichment/anthropology.json",
    "enrichment/intelligence_security.json",
    "enrichment/social_justice.json",
    "enrichment/french.json",
    "enrichment/sport_science.json",
    "enrichment/sport_management_education.json",
]:
    d = json.load(open(f, encoding="utf-8"))
    # custom files list courses with skills_learned; roll them up as technical
    tech = []
    for c in d.get("courses", []):
        tech += c.get("skills_learned", [])
    prog[("__custom__", d["programme"])] = {"name": d["programme"], "code": "CUSTOM", "tech": tech, "trans": []}

# pilot rows are code-only; their faculty tells us the discipline for ambiguous codes.
FACULTY_DISC = {"Social/Management Sciences": "Social Sciences", "Law": "Law",
                "Administration": "Administration and Management"}
def resolve_key(disc, code, faculty=None, name=None):
    """Resolve to a (disc,name) prog key. Prefer explicit name (unique), then (disc,code)
    when the code is unique in the discipline, then unique code-only, then faculty hint."""
    if disc and name and (disc, name) in prog: return (disc, name)
    if disc:
        ks = by_disc_code.get((disc, code), [])
        if len(ks) == 1: return ks[0]        # code unique within discipline
        if len(ks) > 1: return None          # ambiguous (e.g. GET) -> name was required
    ks = code_only.get(code, [])
    if len(ks) == 1: return ks[0]
    if len(ks) > 1 and faculty in FACULTY_DISC:      # ambiguous -> use faculty hint
        fd = FACULTY_DISC[faculty]
        for k in ks:
            if k[0] == fd: return k
    return None

# ── EXPLICIT SECONDARY components for blended JAMB names ──
# primary already comes from programme_mapping; here we add the SECONDARY programme(s).
# Each entry: jamb_name -> [(discipline, code), ...] extra components to union in.
SECONDARY = {
    "Economics and Statistics": [("Sciences", "STA")],
    "Economics with/and Operation Research": [("Sciences", "IMT")],  # OR hosted in Industrial Maths
    "Economics and Development Studies": [("Social Sciences", "DES")],
    "Peace and Development Studies": [("Social Sciences", "PCR")],   # primary DES + Peace
    "International and Comparative Politics": [("Social Sciences", "POL")],
    "History and International Relations": [("Arts", "HIS")],
    "History and International Studies": [("Arts", "HIS")],
    "Policy and Administrative Studies": [("Administration and Management", "PAD")],
    "Political Science and Public Administration": [("Administration and Management", "PAD")],
    "Political Science and International Relations": [("Social Sciences", "IRS")],
    "Political Science and International Studies": [("Social Sciences", "IRS")],
    "Political Science and Conflict Resolution": [("Social Sciences", "PCR")],
    "Political Science and Conflict": [("Social Sciences", "PCR")],
    "Political Science and Defence Studies": [("Social Sciences", "IRS")],  # defence ~ strategic/IR
    "Political Science and Diplomacy": [("Social Sciences", "IRS")],
    "Government and Public Administration": [("Administration and Management", "PAD")],
    "Political Science / International Law and Diplomacy": [("Social Sciences", "IRS")],
    "Political Science and Public Administration": [("Administration and Management", "PAD")],
    "Sociology and Anthroplogy": [("__custom__", "Anthropology")],  # source typo kept
    "Sociology and Social Studies": [("Social Sciences", "DES")],
    "Peace Strategic and Conflict Resolution": [("Social Sciences", "IRS")],
    "Dentistry and Dental Technology": [("Allied Health Sciences", "DNT")],
    "Medical Rehabilitation": [("Allied Health Sciences", "OCT")],  # rehab: physio(primary)+occupational therapy
    "Forestry and Fisheries": [("Agricultural Science", "FAA")],
    "Forestry, Wildlife & Fisheries": [("Agricultural Science", "FAA")],
    "Creative Arts": [("Arts", "FIP"), ("Arts", "MUS")],            # theatre(primary)+film+music
    "History and Strategic Studies": [("Social Sciences", "IRS")],  # strategic ~ IR/strategic studies
    "Geography and Environmental Management": [("Environmental Sciences", "EVM")],
    "Geography and Geosciences": [("Sciences", "GEY")],
}

DASH28 = re.compile(r"[^a-z0-9]")
def norm(s): return DASH28.sub("", s.lower())[:28]
def dedup(skills):
    seen = {}
    for s in skills:
        k = norm(s)
        if k not in seen or len(s) > len(seen[k]): seen[k] = s
    return list(seen.values())

pm = json.load(open("programme_mapping.json", encoding="utf-8"))
out = {}
unresolved = []
for x in pm["mappings"]:
    jname = x["jamb_name"]
    code = x.get("ccmas_code"); disc = x.get("ccmas_discipline")
    comps = []
    # Type-D rows have no CCMAS code by design.  Their reviewed enrichment
    # curriculum is an external primary component and must still produce a
    # skills profile; it must not be silently dropped from the JAMB bridge.
    if not code:
        pk = ("__custom__", jname) if ("__custom__", jname) in prog else None
    else:
        pk = resolve_key(disc, code, x.get("jamb_faculty"), x.get("ccmas_name"))
    if pk:
        comps.append((pk, "primary"))
    else:
        unresolved.append((jname, "primary", disc, code))
    for (sdisc, scode) in SECONDARY.get(jname, []):
        # custom Type-D programmes are keyed by (disc, name) directly
        if (sdisc, scode) in prog:
            comps.append(((sdisc, scode), "secondary")); continue
        sk = resolve_key(sdisc, scode)
        if sk: comps.append((sk, "secondary"))
        else: unresolved.append((jname, "secondary", sdisc, scode))
    if not comps:
        continue
    tech, trans, complist = [], [], []
    for (k, role) in comps:
        r = prog[k]
        tech += r["tech"]; trans += r["trans"]
        complist.append({"discipline": k[0], "code": r["code"], "name": r["name"], "role": role})
    tech = dedup(tech); trans = dedup(trans)
    out[jname] = {"components": complist,
                  "skills_profile_technical": tech,
                  "skills_profile_transferable": trans,
                  "skills_count": len(tech) + len(trans),
                  "is_blend": len(complist) > 1}

json.dump(out, open("jamb/jamb_skills_nuance.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

blends = [j for j, v in out.items() if v["is_blend"]]
print(f"jamb_skills_nuance.json: {len(out)} JAMB names profiled, {len(blends)} are true blends (>1 component)")
if unresolved:
    print("\n!!! UNRESOLVED components — FIX:")
    for u in unresolved: print("  ", u)
else:
    print("all components resolved against the registry. [OK]")
print("\n--- blended JAMB names (extra skills unioned in) ---")
for j in sorted(blends):
    v = out[j]
    comp = " + ".join(f'{c["code"]}({c["role"][:4]})' for c in v["components"])
    print(f'  {j[:46]:48} = {comp:28} -> {len(v["skills_profile_technical"])} tech / {len(v["skills_profile_transferable"])} transf')
