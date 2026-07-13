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

# 8. pivot/gap — career-changer B1 (Criminology → Cybersecurity domain)
results.append(check("pivot/gap D151→D004", "/api/career/pivot/gap?from_domain_key=D151&to_domain_key=D004",
                     probe=lambda d: f"coverage={d.get('coverage')}, "
                                     f"{len(d.get('bridgeSkills') or [])} bridge skills"))

# ── Authenticated round-trips (Phase 1 S2 writes) ─────────────
# Needs a bearer token. Pass one as argv[2], or set SMOKE_TOKEN. Skipped if absent.
import os
TOKEN = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("SMOKE_TOKEN")

def auth_req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)
    except Exception as e:
        return {"_error": str(e)}

if TOKEN:
    print("\n  — authenticated write round-trips —")
    # saved: POST a domain, then GET the list and confirm it's there
    posted = auth_req("POST", "/api/career/saved", {"entityType": "domain", "entityId": "D011", "label": "Quant Finance"})
    saved_id = ((posted.get("data") or {}).get("data") or {}).get("id")
    lst = auth_req("GET", "/api/career/saved")
    saved_rows = ((lst.get("data") or {}).get("data")) or []
    ok_saved = bool(saved_id) and any(r.get("entityId") == "D011" for r in saved_rows)
    print(f"  [{'✓' if ok_saved else '✗'}] saved POST→GET round-trip            {len(saved_rows)} saved rows")
    results.append(ok_saved)
    # note: POST a categorized note, GET all, confirm category present
    npost = auth_req("POST", "/api/career/notes", {"entityType": "domain", "entityId": "D011", "body": "check", "category": "Research"})
    note_id = ((npost.get("data") or {}).get("data") or {}).get("id")
    nlist = auth_req("GET", "/api/career/notes")
    note_rows = ((nlist.get("data") or {}).get("data")) or []
    ok_note = bool(note_id) and any(r.get("category") == "Research" for r in note_rows)
    print(f"  [{'✓' if ok_note else '✗'}] note POST→GET (with category)         {len(note_rows)} notes")
    results.append(ok_note)
    # cleanup best-effort
    if saved_id:
        auth_req("DELETE", f"/api/career/saved/{saved_id}")
    if note_id:
        auth_req("DELETE", f"/api/career/notes/{note_id}")
else:
    print("\n  (skipped auth round-trips — pass a token as argv[2] or SMOKE_TOKEN to test saved/notes writes)")

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)
