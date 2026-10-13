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
    "enrichment/sport_science.json",
    "enrichment/sport_management_education.json",
    "enrichment/portuguese.json",
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
    # UNIZIK's official undergraduate catalogue names the award "Igbo,
    # African and Asian Studies" and lists Chinese Language and Igbo Language
    # as options. Keep both matching CCMAS curricula as separate option
    # branches; this is a national reference, not a claim about UNIZIK's exact
    # course schedule.
    "African and Asian Studies": [("Arts", "CHS")],
    # The official JAMB Sciences identity names both Biotechnology and
    # Molecular Biology. Keep the latter as a narrow Biology CCMAS component
    # (BIO 414 only); do not inherit the full Biology curriculum. The exact
    # FUHS-ILA awarder context and selected course scope are recorded in the
    # manual scope override and remain held pending course/domain adjudication.
    "BIOTECHNOLOGY AND MOLECULAR BIOLOGY": [("Sciences", "BIO")],
    # JAMB has distinct Accounting and Finance offerings in Administration
    # (BCU) and Social/Management Sciences (FEDOTUOKE). Retain both separate
    # NUC CCMAS curriculum components as a held reference union. This does not
    # claim either university uses the full union as its exact course plan.
    "Accounting and Finance": [("Administration and Management", "ACC")],
    # JAMB names Chemistry and Industrial Chemistry as distinct curriculum
    # facets. Retain the separate Chemistry CCMAS package alongside the
    # primary Industrial Chemistry package as a held reference union; this
    # does not assert an institution-specific course schedule.
    "Chemistry and Industrial Chemistry": [("Sciences", "CHM")],
    # The Sciences JAMB identity names Economics alongside Computer Science.
    # Keep the separate Economics CCMAS package as a supporting curriculum
    # component; the full union is a reference scope, not an institution-
    # specific combined degree plan.
    "COMPUTER SCIENCE WITH ECONOMICS": [("Social Sciences", "ECO")],
    # JAMB's official Sciences awarder table lists the distinct programme
    # "Industrial Mathematics and Computer Science" at REDEEMERS. NUC has
    # separate Industrial Mathematics (Sciences) and Computer Science
    # (Computing) CCMAS packages. Keep both as an explicit reference union;
    # the offering-specific course scope and domain links remain held for
    # course/outcome and source-provenance review.
    "Industrial Mathematics and Computer Science": [("Computing", "COS")],
    # Two explicit options under one JAMB identity, not one simultaneous
    # course schedule. Preserve both CCMAS standards as distinct option
    # branches; institution-specific selection and downstream links remain
    # under review.
    "Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)": [("Sciences", "PHE")],
    # Both named curriculum families are retained without asserting a
    # campus-specific course schedule or inheriting either parent's paths.
    "Industrial Physics with Applied Geophysics": [("Sciences", "IPH")],
    # The JAMB title names the electronics facet alongside Industrial Physics.
    # PHE is a distinct CCMAS standard; IT-application depth still needs its
    # own course/outcome and learning-resource evidence.
    "Industrial Physics with Electronics and IT Application": [("Sciences", "PHE")],
    # JAMB explicitly lists the blended identity, and both named CCMAS
    # programmes exist as distinct standards. Keep Mathematics as a distinct
    # component instead of treating three MTH courses embedded in the CS
    # package as a complete Mathematics curriculum. The union is a CCMAS
    # reference scope, not proof of any institution's exact degree plan.
    "Mathematics with Computer Science": [("Sciences", "MTH")],
    # These two distinct JAMB identities also name both Computer Science and
    # Mathematics. Preserve Mathematics as a separate CCMAS reference
    # component; the held union is not an institution-specific timetable and
    # must not publish downstream links until both facets are reconciled.
    "COMPUTER SCIENCE AND MATHEMATICS": [("Sciences", "MTH")],
    "COMPUTER SCIENCE WITH MATHEMATICS": [("Sciences", "MTH")],
    # The JAMB title explicitly names both regulated subject areas. Retain the
    # Actuarial Science CCMAS package as a distinct component; do not certify a
    # blended course slice or inherit either parent's domains until a scoped
    # course/outcome pass establishes the offering-level selection.
    "Insurance and Actuarial Science": [("Administration and Management", "ACS")],
    "Economics and Statistics": [("Sciences", "STA")],
    # Statistics Education combines the mathematics-teacher preparation
    # package with the substantive Statistics curriculum. The education
    # package alone does not cover the named Statistics facet.
    "Statistics Education": [("Sciences", "STA")],
    # Portuguese/English is a true curriculum blend: English is the primary
    # CCMAS component and Portuguese is supplied by the checked-in external
    # reference curriculum. Retain both components explicitly in the bridge.
    "Portuguese/English": [("__custom__", "Portuguese")],
    "Economics with/and Operation Research": [("Sciences", "IMT")],  # OR hosted in Industrial Maths
    "Economics and Development Studies": [("Social Sciences", "DES")],
    # TASUED's official undergraduate programme is titled Home Economics &
    # Hotel Management and its course list includes both home-economics and
    # hotel-management/service learning. Retain the distinct CCMAS HTM package
    # as a supporting reference curriculum, not an institution-specific full
    # course schedule. Source: https://tasued.edu.ng/home-economics-and-hotel-management/
    "Home Economics and Hotel Management": [("Administration and Management", "HTM")],
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
    # FUNAAB's official admission catalogue lists Agricultural Economics and
    # Farm Management separately from Agricultural Extension and Rural
    # Development. Preserve both CCMAS curriculum families for the combined
    # JAMB display identity; this is not a university-specific course plan.
    "Farm Management & Agric. Extension": [("Agricultural Science", "AGE")],
    # UNN's official department lists three combined-honours options:
    # French/German, French/Russian, and German/Russian. Keep all three
    # corresponding CCMAS language standards rather than French alone.
    "French and German/Russian": [("Arts", "GER"), ("Arts", "RUS")],
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
    row_unresolved = []
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
        item = (jname, "primary", disc, code)
        unresolved.append(item)
        row_unresolved.append(item)
    for (sdisc, scode) in SECONDARY.get(jname, []):
        # custom Type-D programmes are keyed by (disc, name) directly
        if (sdisc, scode) in prog:
            comps.append(((sdisc, scode), "secondary")); continue
        sk = resolve_key(sdisc, scode)
        if sk: comps.append((sk, "secondary"))
        else:
            item = (jname, "secondary", sdisc, scode)
            unresolved.append(item)
            row_unresolved.append(item)
    if not comps:
        out[jname] = {
            "components": [],
            "skills_profile_technical": [],
            "skills_profile_transferable": [],
            "skills_count": 0,
            "is_blend": False,
            "mapping_status": "review_required",
            "unresolved_components": [
                {"role": role, "discipline": item_disc, "code": item_code}
                for _, role, item_disc, item_code in row_unresolved
            ],
        }
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
                  "is_blend": len(complist) > 1,
                  "mapping_status": "review_required" if row_unresolved else "resolved",
                  "unresolved_components": [
                      {"role": role, "discipline": item_disc, "code": item_code}
                      for _, role, item_disc, item_code in row_unresolved
                  ]}

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
