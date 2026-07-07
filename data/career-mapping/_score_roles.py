#!/usr/bin/env python3
"""PHASE 3 — role-level coverage scoring within each matched domain.
For each (programme, matched-domain), score EVERY role: coverage = programme skills that cover
the role's ESCO essential skills / |role essential skills|. Uses the SAME specific-token matching
as domain scoring (precision via rare tokens). CORRECTED RULE (user): DO NOT HIDE by coverage —
label all roles Ready(>=50%) / Bridge(20-49%) / Stretch(<20%, shown, usually senior/elite dests).
Emit role bridge_skills (uncovered essentials = the gap to learn) + covered_skills, tier, sub-group.
Output: programme_role_scores.json  (per programme -> per matched domain -> ranked labelled roles).
"""
import json, glob, re
from collections import defaultdict, Counter

STOP = set("a an the of and or to in for with on at by from as is are be this that your you their able "
           "students should will can may other more using use used within into related etc various including "
           "basic general principles concept concepts knowledge skills understanding apply analyse analyze "
           "evaluate describe explain identify demonstrate ability level techniques methods process".split())
def toks(s): return {t for t in re.findall(r"[a-z0-9]+", str(s).lower()) if t not in STOP and len(t) > 2}

roles = json.load(open("role_library_v3.json", encoding="utf-8"))
final = json.load(open("programme_domain_final.json", encoding="utf-8"))
struct = json.load(open("domain_structure.json", encoding="utf-8"))

# document frequency over all skills -> GENERIC tokens (same precision approach as domain scoring)
allsk = set()
for r in roles: allsk.update(r["essential_skills"])
prog_skills = {}   # name -> (technical, transferable) kept SEPARATE — technical is the distinctive signal
for f in glob.glob("ccmas/*.json"):
    for p in json.load(open(f, encoding="utf-8"))["programmes"]:
        tech = p.get("skills_profile_technical", []); trans = p.get("skills_profile_transferable", [])
        prog_skills[p["name"].strip().lower()] = (tech, trans)
        allsk.update(tech); allsk.update(trans)
df = Counter()
for s in allsk:
    for t in toks(s): df[t] += 1
N = len(allsk)
GENERIC = {t for t, c in df.items() if c > 0.012 * N}
def spec(s): return toks(s) - GENERIC

import math
def skill_covered(role_spec, tech_sets, trans_sets):
    """Covered if a SINGLE programme skill shares ENOUGH of the role skill's specific tokens.
    Threshold scales with role-skill length: 1-token skills need that 1 rare token present;
    MULTI-token role skills need >=2 shared. That >=2 rule is the key fix — Arabic's incidental
    "computer hardware software" shares only 1 token ("software") with "software testing" -> NOT
    covered; but "prepare financial statements" shares 2 with "financial statements" -> covered.
    No programme-side fraction (CCMAS skills are verbose sentences; that would false-negative)."""
    if not role_spec: return False
    need = 1 if len(role_spec) == 1 else max(2, math.ceil(0.6 * len(role_spec)))
    for ps in tech_sets:
        if len(role_spec & ps) >= need: return True
    for ps in trans_sets:                 # transferable: same bar (>=2 for multi-token), avoids foundation leak
        if len(role_spec) >= 2 and len(role_spec & ps) >= need: return True
    return False

roles_by_dom = defaultdict(list)
for r in roles: roles_by_dom[r["domain_id"]].append(r)
# sub-group label per ISCO sub-major, from domain_structure
sub_label = {}
for did, d in struct.items():
    for sg in d.get("subgroups", []):
        sub_label[(did, sg["isco_submajor"])] = sg["label"]

# READINESS from the STRONG signal: domain match_type (agent-verified) x role tier.
# Token-coverage can't bridge CCMAS<->ESCO vocabulary ("computer programming" vs "solve problems
# using programming language C/PYTHON"), so it drives only the illustrative skills-GAP, not the label.
READINESS = {
    ("direct","entry"):"ready", ("direct","mid"):"ready", ("direct","senior"):"bridge",
    ("functional","entry"):"bridge", ("functional","mid"):"bridge", ("functional","senior"):"stretch",
    ("adjacent","entry"):"bridge", ("adjacent","mid"):"stretch", ("adjacent","senior"):"stretch",
}
def label(match_type, tier):
    return READINESS.get((match_type, tier or "mid"), "stretch")

out = {}
for key, v in final.items():
    disc, prog = key.split("::", 1)
    tech, trans = prog_skills.get(prog.strip().lower(), ([], []))
    tech_sets = [spec(s) for s in tech if spec(s)]
    trans_sets = [spec(s) for s in trans if spec(s)]
    dom_out = []
    for link in v["links"]:
        did = link["domain_id"]
        scored = []
        for r in roles_by_dom.get(did, []):
            ess = r["essential_skills"]
            if not ess: continue
            covered, gap = [], []
            for e in ess:
                if skill_covered(spec(e), tech_sets, trans_sets): covered.append(e)
                else: gap.append(e)
            cov = len(covered) / len(ess)
            sm = str(r.get("isco_group", ""))[:2]
            # SLIM output: role metadata (isco_group, also_known_as, elite_status) + covered_skills
            # are all derivable from role_library_v3.json at serve time -> not duplicated here per
            # (programme,domain,role). Keeps this generated file small enough for git (<50MB blocker).
            scored.append({"role": r["role_name"], "coverage": round(cov, 2),
                           "label": label(link["match_type"], r.get("tier")),
                           "tier": r.get("tier"),
                           "sub_group": sub_label.get((did, sm), None),
                           "bridge_skills": gap[:8]})
        # rank: ready > bridge > stretch, then coverage desc
        order = {"ready": 0, "bridge": 1, "stretch": 2}
        scored.sort(key=lambda x: (order[x["label"]], -x["coverage"]))
        dom_out.append({"domain_id": did, "domain_name": link["domain_name"], "match_type": link["match_type"],
                        "n_roles": len(scored),
                        "n_ready": sum(1 for s in scored if s["label"] == "ready"),
                        "n_bridge": sum(1 for s in scored if s["label"] == "bridge"),
                        "roles": scored})
    out[key] = {"discipline": disc, "programme": prog, "domains": dom_out}

json.dump(out, open("programme_role_scores.json", "w", encoding="utf-8"), ensure_ascii=False)

# report + gate
tot_roles = sum(len(d["roles"]) for v in out.values() for d in v["domains"])
lab = Counter(r["label"] for v in out.values() for d in v["domains"] for r in d["roles"])
no_ready = sum(1 for v in out.values() for d in v["domains"] if d["n_ready"] + d["n_bridge"] == 0)
print(f"scored {len(out)} programmes; {tot_roles} (programme,domain,role) scores")
print(f"role labels: {dict(lab)}")
print(f"matched (programme,domain) pairs with 0 ready/bridge roles: {no_ready}")
# sample: Accounting in its domains
for k, v in out.items():
    if k.endswith("::Accounting"):
        print(f"\nsample — {k}:")
        for d in v["domains"][:2]:
            print(f"  [{d['match_type']}] {d['domain_name']}: {d['n_ready']} ready, {d['n_bridge']} bridge / {d['n_roles']} roles")
            for r in d["roles"][:3]:
                print(f"      {r['label']:7} {r['coverage']:.0%} {r['role'][:34]:36} (tier={r['tier']}, gap {len(r['bridge_skills'])})")
        break
