#!/usr/bin/env python3
"""PHASE 2 — programme->domain links + DIRECT/FUNCTIONAL/ADJACENT. v2: PRECISION via token rarity.
Generic tokens (financial, data, analyse, management) create spurious matches, so a domain-skill is
"covered" only if it shares a SPECIFIC (rare) token with a programme skill. Fast via specific-token sets.
Method: technical overlap -> Direct/Functional; transferable -> Adjacent; NAME match = purpose (Direct);
course-title match = content (Functional). Tight thresholds + per-programme cap.
"""
import json, glob, re
from collections import defaultdict, Counter

STOP = set("a an the of and or to in for with on at by from as is are be this that your you their able "
           "students should will can may other more using use used within into related etc various including "
           "basic general principles concept concepts knowledge skills understanding apply analyse analyze "
           "evaluate describe explain identify demonstrate ability level techniques methods process".split())
def toks(s): return {t for t in re.findall(r"[a-z0-9]+", str(s).lower()) if t not in STOP and len(t) > 2}

roles = json.load(open("role_library_v3.json", encoding="utf-8"))
# ---- document frequency of every token across ALL distinct skills (domain + programme) ----
all_skill_texts = set()
for r in roles: all_skill_texts.update(r["essential_skills"])
prog_all = []
for f in glob.glob("ccmas/*.json"):
    for p in json.load(open(f, encoding="utf-8"))["programmes"]:
        prog_all += p.get("skills_profile_technical", []) + p.get("skills_profile_transferable", [])
all_skill_texts.update(prog_all)
df = Counter()
for s in all_skill_texts:
    for t in toks(s): df[t] += 1
NTOK = len(all_skill_texts)
# a token is SPECIFIC if it appears in fewer than 1.2% of skills (rare/meaningful)
GENERIC = {t for t, c in df.items() if c > 0.012 * NTOK}
def spec(s): return toks(s) - GENERIC     # specific tokens of a skill

# ---- domain index: each domain skill -> its specific-token set ----
dom_name = {}; dom_specs = defaultdict(list); dom_alltok = defaultdict(set)
for r in roles:
    dom_name[r["domain_id"]] = r["domain_name"]
    for s in r["essential_skills"]:
        sp = spec(s)
        if sp: dom_specs[r["domain_id"]].append(sp)
        dom_alltok[r["domain_id"]] |= toks(s)
# dedup domain skills per domain (by frozenset)
for d in dom_specs:
    seen = set(); uniq = []
    for sp in dom_specs[d]:
        fs = frozenset(sp)
        if fs not in seen: seen.add(fs); uniq.append(sp)
    dom_specs[d] = uniq
# domain-name STRUCTURAL words must NOT drive name-matching (else "Computer Science" == "Exercise Science")
NAME_STOP = {"science","sciences","engineering","management","studies","technology","technologies",
             "services","systems","system","design","analysis","operations","development","professional",
             "practice","applied","general","information","research","studies","science"}
dom_nametok = {d: (toks(n) - GENERIC - NAME_STOP) for d, n in dom_name.items()}
# purpose signal also fires if the programme name appears in the domain's ROLE names
# (e.g. "Computer Science" -> domain has "computer programmer" role -> purpose match)
dom_roletok = defaultdict(set)
for r in roles:
    dom_roletok[r["domain_id"]] |= (toks(r["role_name"]) - GENERIC - NAME_STOP)
dom_purpose = {d: (dom_nametok[d] | dom_roletok[d]) for d in dom_name}

def coverage(prog_spec_union, domain_specs):
    """fraction of domain skills whose specific tokens are (mostly) present in programme's specific tokens."""
    if not domain_specs: return 0.0
    hits = 0
    for sp in domain_specs:
        inter = sp & prog_spec_union
        if inter and len(inter) >= max(1, (len(sp) + 1) // 2):   # >=half the specific tokens present
            hits += 1
    return hits / len(domain_specs)

def score_programme(p):
    tech_union = set().union(*[spec(s) for s in p.get("skills_profile_technical", [])] or [set()])
    trans_union = set().union(*[spec(s) for s in p.get("skills_profile_transferable", [])] or [set()])
    course_tok = set()
    for c in p.get("courses", []): course_tok |= toks(c.get("title", ""))
    name_tok = toks(p["name"]) - GENERIC - NAME_STOP
    cand = []
    for did, dspecs in dom_specs.items():
        if not dspecs: continue
        tech_cov = coverage(tech_union, dspecs)
        trans_cov = coverage(trans_union, dspecs)
        total = tech_cov + trans_cov
        if total < 0.05: continue
        strong_name = bool(name_tok & dom_nametok[did])   # matches domain NAME (precise purpose)
        weak_name = bool(name_tok & dom_roletok[did])      # matches a role name (recall)
        course_match = len(course_tok & dom_alltok[did]) >= 4
        cand.append({"domain_id": did, "domain_name": dom_name[did], "tech_cov": round(tech_cov,3),
                     "trans_cov": round(trans_cov,3), "score": round(total,3),
                     "strong_name": strong_name, "weak_name": weak_name, "course_match": course_match})
    cand.sort(key=lambda x: -x["score"])
    top3 = {c["domain_id"] for c in cand[:3]}
    links = []
    for c in cand:
        # DIRECT: domain-NAME match (precise) OR a role-name match that is high-conf AND a top-3 link
        if (c["strong_name"] and c["tech_cov"] >= 0.08) or \
           (c["weak_name"] and c["tech_cov"] >= 0.32 and c["domain_id"] in top3):
            mt = "direct"
        elif c["tech_cov"] >= 0.10 and (c["course_match"] or c["tech_cov"] >= 0.14):
            mt = "functional"
        elif c["trans_cov"] >= 0.06 or c["score"] >= 0.10:
            mt = "adjacent"
        else:
            continue
        c["match_type"] = mt
        links.append(c)
    rank = {"direct": 0, "functional": 1, "adjacent": 2}
    links.sort(key=lambda x: (rank[x["match_type"]], -x["score"]))
    if links:
        best = links[0]["score"]
        links = [l for l in links if l["match_type"] == "direct" or l["score"] >= max(0.10, 0.45*best)]
    return links[:20]

out = {}; n = 0
for f in sorted(glob.glob("ccmas/*.json")):
    d = json.load(open(f, encoding="utf-8"))
    for p in d["programmes"]:
        out[f"{d['discipline']}::{p['name']}"] = {"discipline": d["discipline"], "programme": p["name"],
                                                  "code": p.get("code"), "links": score_programme(p)}
        n += 1
json.dump(out, open("programme_domain_scores.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

tot = sum(len(v["links"]) for v in out.values())
mt = Counter(l["match_type"] for v in out.values() for l in v["links"])
feeders = Counter(l["domain_id"] for v in out.values() for l in v["links"])
print(f"generic tokens excluded: {len(GENERIC)} / {len(df)} ; specific-token matching")
print(f"scored {n} programmes -> {tot} links ({tot/n:.1f} avg/prog); types {dict(mt)}")
print(f"programmes w/ 0 links: {sum(1 for v in out.values() if not v['links'])}")
print(f"domains w/ 0 feeders: {sum(1 for d in dom_name if feeders.get(d,0)==0)} ; Sales D031 feeders: {feeders.get('D031',0)}")
def show(sub):
    for k, v in out.items():
        if sub.lower() in k.lower():
            print(f"\n  {k}: {len(v['links'])} links")
            for l in v["links"][:9]:
                print(f"     [{l['match_type']:10}] {l['domain_name'][:36]:38} score={l['score']} tech={l['tech_cov']} trans={l['trans_cov']}")
            break
show("Sociology"); show("Accounting"); show("Computer Science")
