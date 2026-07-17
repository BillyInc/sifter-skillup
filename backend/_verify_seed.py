#!/usr/bin/env python3
"""Phase 4 — verify the seeded product data against expected counts.

Usage: cd backend && python _verify_seed.py     (run AFTER applying the SQL files)
Read-only. Prints PASS/FAIL per check with actual vs expected.
"""
import json
import os
import urllib.request
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
CM = os.path.join(HERE, "..", "data", "career-mapping")

env = {}
for line in open(os.path.join(HERE, ".env"), encoding="utf-8-sig"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"')
URL = env["SUPABASE_URL"]
KEY = env.get("SUPABASE_SERVICE_KEY") or env["SUPABASE_ANON_KEY"]


def rest(path):
    req = urllib.request.Request(
        f"{URL}/rest/v1/{path}",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}",
                 "Accept-Profile": "skillup_dev", "Prefer": "count=exact", "Range": "0-0"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        cr = r.headers.get("Content-Range", "/0").split("/")[-1]
        return int(cr) if cr.isdigit() else 0


# expected values derived from the source files at generation time
meta = json.load(open(os.path.join(CM, "domain_meta.json"), encoding="utf-8"))
pdf = json.load(open(os.path.join(CM, "programme_domain_final.json"), encoding="utf-8"))
jdm = json.load(open(os.path.join(CM, "jamb_domain_map.json"), encoding="utf-8"))
reach = set()
for v in pdf.values():
    for l in (v["links"] if isinstance(v, dict) and "links" in v else v):
        reach.add(l["domain_id"])
for e in jdm.values():
    for l in e.get("links", []):
        reach.add(l["domain_id"])
HIDDEN = {d for d in meta if meta[d].get("excluded") or d not in reach}
N_DOMAINS = len(meta) - len(HIDDEN)
roles = json.load(open(os.path.join(CM, "role_library_v3.json"), encoding="utf-8"))
N_ROLES = sum(1 for r in roles if r["domain_id"] in meta and r["domain_id"] not in HIDDEN)

ok = fail = 0
def check(label, actual, expect, mode="eq"):
    global ok, fail
    good = (actual == expect) if mode == "eq" else (actual >= expect)
    print(f"{'PASS' if good else 'FAIL'}  {label:55s} actual={actual} expected{'=' if mode=='eq' else '>='}{expect}")
    ok, fail = ok + good, fail + (not good)


check("domains (live, university-reachable)", rest("domains?select=id&limit=1"), N_DOMAINS)
check("hidden domains absent", rest("domains?select=id&domain_key=in.(" + ",".join(sorted(HIDDEN)) + ")&limit=1"), 0)
check("domain_roles", rest("domain_roles?select=id&limit=1"), N_ROLES)
check("subgroups", rest("domain_subgroups?select=id&limit=1"), 1, "ge")
check("subgroups w/o cluster_skills", rest("domain_subgroups?select=id&cluster_skills=eq.[]&limit=1"), 0)
check("role-scoped tools (L3T)", rest("domain_tools?select=id&scope=eq.role&limit=1"), 1, "ge")
check("domain tools", rest("domain_tools?select=id&scope=eq.domain&limit=1"), 1, "ge")
check("certifications", rest("domain_certifications?select=id&limit=1"), 400, "ge")
check("subject_catalog", rest("subject_catalog?select=id&limit=1"), 44)
check("domain demand rows (3 lenses)", rest("domain_demand_metrics?select=id&limit=1"), N_DOMAINS * 3)
check("role demand rows (3 lenses)", rest("role_demand_metrics?select=id&limit=1"), N_ROLES * 3)
check("demand rows labelled low-confidence exist", rest("role_demand_metrics?select=id&source_confidence=eq.low&limit=1"), 1, "ge")
check("real-overlay demand rows exist", rest("role_demand_metrics?select=id&source_confidence=neq.low&limit=1"), 1, "ge")
check("jamb programmes", rest("jamb_programmes?select=id&limit=1"), 380, "ge")
check("schools", rest("schools?select=id&limit=1"), 700, "ge")
check("school_programmes (institution naming)", rest("school_programmes?select=id&limit=1"), 2000, "ge")
check("programme subject requirements", rest("programme_subject_requirements?select=id&limit=1"), 380, "ge")
check("cutoffs carry jamb_programme_id", rest("programme_school_cutoff?select=id&jamb_programme_id=is.null&limit=1"), 0)
check("structured UTME subject options", rest("programme_subject_options?select=id&exam_type=eq.utme&limit=1"), 100, "ge")
check("subject option items", rest("programme_subject_option_items?select=id&limit=1"), 500, "ge")
check("requirements marked parsed", rest("programme_subject_requirements?select=id&parse_status=eq.parsed&limit=1"), 100, "ge")
check("programme→domain links", rest("programme_domain?select=id&limit=1"), 2000, "ge")
check("programme role scores", rest("programme_role_score?select=id&limit=1"), 60000, "ge")

print(f"\n{ok} passed, {fail} failed")
raise SystemExit(1 if fail else 0)
