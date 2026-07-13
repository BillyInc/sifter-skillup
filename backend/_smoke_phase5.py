#!/usr/bin/env python3
"""Phase 5 live smoke test — run AFTER applying migration_career_v2.sql + seed_career_v2.sql
and starting the API. Hits each new endpoint for a flagship case and asserts real data.
Usage: python backend/_smoke_phase5.py [BASE_URL]  (default http://localhost:8000)"""
import sys, json, urllib.request, urllib.parse

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def get(path):
    url = BASE + path
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return json.load(r)
    except Exception as e:
        return {"_error": str(e)}

def check(label, path, want_status="real", probe=None):
    body = get(path)
    data = (body or {}).get("data") or {}
    status = data.get("status")
    ok = status == want_status
    extra = ""
    if ok and probe:
        try:
            extra = probe(data.get("data"))
        except Exception as e:
            ok = False; extra = f"probe failed: {e}"
    print(f"  [{'✓' if ok else '✗'}] {label:42} status={status} {extra}")
    return ok

def q(s):  # find a programme id first
    return urllib.parse.quote(s)

print(f"Phase 5 smoke test → {BASE}\n")
results = []

# 1. find Computer Science programme id via search, then its domains
sr = get("/api/career/search?q=" + q("computer science"))
progs = ((sr.get("data") or {}).get("data") or {}).get("programmes") or []
cs_id = progs[0]["id"] if progs else None
if cs_id:
    results.append(check("Computer Science programme → domains", f"/api/career/programmes/{cs_id}",
                         probe=lambda d: f"{len(d.get('domains', []))} domains"))
else:
    print("  [✗] Computer Science programme            not found in search")
    results.append(False)

# 2. Quantitative Finance domain detail
results.append(check("Quantitative Finance domain (D011)", "/api/career/domains/D011",
                     probe=lambda d: f"{len(d.get('subgroups', []))} subgroups, "
                                     f"{len(d.get('tools', {}).get('distinctive', []))} distinctive tools"))

# 3. Software Engineering domain (should have EMPTY gateway certs — unlicensed field)
results.append(check("Software Engineering domain (D001)", "/api/career/domains/D001",
                     probe=lambda d: f"{len(d.get('gatewayCertifications', []))} gateway certs (expect 0)"))

# 4. disambiguation: machine learning engineer
results.append(check("search 'machine learning engineer'", "/api/career/search?q=" + q("machine learning engineer"),
                     probe=lambda d: f"{len(d.get('roles', []))} role groups"))

# 5. disambiguation: nursing (should surface domains + roles)
results.append(check("search 'nursing'", "/api/career/search?q=nursing",
                     probe=lambda d: f"{len(d.get('domains', []))} domains, {len(d.get('roles', []))} roles"))

# 6. Criminology pivot (career-changer 'fields you can move into')
results.append(check("Criminology pivot (D151)", "/api/career/pivot?from_domain_key=D151",
                     probe=lambda d: "top: " + ", ".join(m["domainName"] for m in (d.get("moves") or [])[:3])))

# 7. JAMB → domains
results.append(check("JAMB 'Computer Science' → domains", "/api/career/jamb/" + q("Computer Science") + "/domains",
                     probe=lambda d: f"{len(d.get('domains', []))} domains"))

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
