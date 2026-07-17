#!/usr/bin/env python3
"""Normalize raw market-intelligence downloads into per-role, per-lens records.

Inputs (all already on disk — no network):
- _source_downloads/market_intelligence/<provider>/<date>/*.json  (raw cache)
- role_library_v3_cleaned.json, domain_tools.json                (taxonomy)
- _enrichment/certs_enrichment.csv, tools_demand.csv             (enrichment)
- taxonomies/wef_2025_roles.json                                 (WEF signal)
- _source_extracts/github_innovationgraph_summary.json           (NG tech signal)

Outputs (incremental — each record appended as computed):
- _source_extracts/market_intelligence/market_backfill_sample.jsonl
- _source_extracts/market_intelligence/market_backfill_sample.csv

Scoring model (0-100, documented per field in the coverage report):
- posting_volume_score: log-scaled blend of Careerjet hits + Jooble totalCount
  (global), Careerjet NG hits + MyJobMag matches (ng_local), remote-board
  matches (ng_remote).
- value_score: salary anchors (OpenWeb Ninja/Glassdoor median; RemoteOK ranges)
  scaled against lens-specific reference bands.
- growth_or_recency_score: share of postings in the last 7/30 days (recency
  proxy — NOT historical growth; see limitations) + WEF growing-role flag.
- remote_access_score: share of matched postings that are remote/worldwide.
- employer_diversity_score: unique employers / matched postings.
"""
import csv
import glob
import html
import json
import math
import os
import re
import sys
import time
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sample_roles import SAMPLE_ROLES

HERE = os.path.dirname(os.path.abspath(__file__))
CM = os.path.abspath(os.path.join(HERE, ".."))
RAW = os.path.join(CM, "_source_downloads", "market_intelligence")
OUT_DIR = os.path.join(CM, "_source_extracts", "market_intelligence")
os.makedirs(OUT_DIR, exist_ok=True)
NOW = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
TODAY = time.strftime("%Y-%m-%d")

# Reference salary bands (annual USD) used to scale value_score per lens.
# Global/remote: 15k -> 150k log scale. NG local (NGN converted): uses fx rate.
USD_LO, USD_HI = 15_000, 150_000
NGN_LO, NGN_HI = 1_200_000, 30_000_000  # annual NGN band for ng_local scaling

CERT_PATTERNS = [
    # generic, cross-domain certification mentions mined from posting text
    (r"\bICAN\b", "ICAN"), (r"\bACCA\b", "ACCA"), (r"\bCFA\b", "CFA"),
    (r"\bCIPM\b", "CIPM"), (r"\bCIPD\b", "CIPD"), (r"\bPHR\b|\bSPHR\b", "PHR/SPHR"), (r"\bSHRM\b", "SHRM"),
    (r"\bPMP\b", "PMP"), (r"\bPRINCE2\b", "PRINCE2"),
    (r"\bAWS Certified\b|\bAWS certification\b", "AWS Certified"),
    (r"\bAzure\b.{0,20}certif", "Microsoft Azure Certified"),
    (r"\bCISSP\b", "CISSP"), (r"\bCEH\b", "CEH"), (r"\bCompTIA\b", "CompTIA"),
    (r"\bCOREN\b", "COREN"), (r"\bNSE\b(?!\w)", "NSE (Nigerian Society of Engineers)"),
    (r"\bNMCN\b|\bnursing licen[cs]e\b|\bregistered nurse licen[cs]e\b", "NMCN / RN licence"),
    (r"\bNCLEX\b", "NCLEX"), (r"\bBLS\b(?!\w)|\bACLS\b", "BLS/ACLS"),
    (r"\bTRCN\b", "TRCN"), (r"\bPGDE\b", "PGDE"), (r"\bQTS\b", "QTS"),
    (r"\bcalled to (the )?bar\b|\bbar licen[cs]e\b|\bNigerian Law School\b", "Call to Bar (Nigeria)"),
    (r"\bCSCP\b", "APICS CSCP"), (r"\bCPIM\b", "APICS CPIM"), (r"\bCILT\b", "CILT"),
    (r"\bSix Sigma\b|\bLean Six Sigma\b", "Lean Six Sigma"),
    (r"\bGoogle UX\b", "Google UX Certificate"), (r"\bNYSC\b", "NYSC"),
    (r"\bCIA\b(?!\w)", "CIA (Internal Audit)"), (r"\bCISA\b", "CISA"),
]

TOOL_PATTERNS = [
    (r"\bPython\b", "Python"), (r"\bJavaScript\b|\bJS\b(?!\w)", "JavaScript"), (r"\bTypeScript\b", "TypeScript"),
    (r"\bJava\b(?!Script)", "Java"), (r"\bC#\b", "C#"), (r"\bSQL\b", "SQL"), (r"\bReact\b", "React"),
    (r"\bNode\.?js\b", "Node.js"), (r"\bAWS\b", "AWS"), (r"\bAzure\b", "Azure"), (r"\bDocker\b", "Docker"),
    (r"\bKubernetes\b", "Kubernetes"), (r"\bGit\b(?!Hub)", "Git"), (r"\bDjango\b", "Django"), (r"\bFlutter\b", "Flutter"),
    (r"\bExcel\b", "Microsoft Excel"), (r"\bQuickBooks\b", "QuickBooks"), (r"\bSage\b(?!\w)", "Sage"),
    (r"\bSAP\b", "SAP"), (r"\bERP\b", "ERP"), (r"\bXero\b", "Xero"), (r"\bPower ?BI\b", "Power BI"),
    (r"\bTableau\b", "Tableau"), (r"\bAutoCAD\b", "AutoCAD"), (r"\bRevit\b", "Revit"),
    (r"\bCivil ?3D\b", "Civil 3D"), (r"\bETABS\b", "ETABS"), (r"\bSTAAD\b", "STAAD"), (r"\bPrimavera\b", "Primavera"),
    (r"\bMS Project\b|\bMicrosoft Project\b", "Microsoft Project"),
    (r"\bFigma\b", "Figma"), (r"\bSketch\b(?!\w)", "Sketch"), (r"\bAdobe XD\b", "Adobe XD"),
    (r"\bPhotoshop\b", "Photoshop"), (r"\bIllustrator\b", "Illustrator"),
    (r"\bSalesforce\b", "Salesforce"), (r"\bHubSpot\b", "HubSpot"), (r"\bCRM\b", "CRM"),
    (r"\bEMR\b|\bEHR\b", "EMR/EHR"), (r"\bepic\b(?! game)", "Epic (EHR)"),
    (r"\bWMS\b", "WMS"), (r"\bTMS\b", "TMS"),
    (r"\bWorkday\b", "Workday"), (r"\bBambooHR\b", "BambooHR"), (r"\bSeamlessHR\b", "SeamlessHR"),
    (r"\bGoogle Workspace\b", "Google Workspace"), (r"\bMicrosoft Office\b|\bMS Office\b", "Microsoft Office"),
]


# ------------------------------------------------------------------ loaders

def _latest(provider, key):
    """Latest cached raw file for provider/key across date folders."""
    paths = sorted(glob.glob(os.path.join(RAW, provider, "*", f"{key}.json")))
    if not paths:
        return None
    with open(paths[-1], encoding="utf-8") as f:
        return json.load(f)


def load_bulk_remote_jobs():
    """RemoteOK + Remotive + Arbeitnow rows normalized to a common shape."""
    jobs = []
    env = _latest("remoteok", "all_jobs")
    if env:
        for r in env["data"]:
            if not isinstance(r, dict) or "position" not in r:
                continue
            jobs.append({
                "source": "remoteok", "title": r.get("position") or "",
                "company": r.get("company") or "", "location": r.get("location") or "",
                "date": (r.get("date") or "")[:10], "tags": r.get("tags") or [],
                "salary_min": r.get("salary_min"), "salary_max": r.get("salary_max"),
                "remote": True, "url": r.get("url") or "",
                "worldwide": "worldwide" in (r.get("location") or "").lower() or not r.get("location"),
            })
    env = _latest("remotive", "all_jobs")
    if env:
        for r in env["data"].get("jobs", []):
            loc = (r.get("candidate_required_location") or "").lower()
            jobs.append({
                "source": "remotive", "title": r.get("title") or "",
                "company": r.get("company_name") or "", "location": loc,
                "date": (r.get("publication_date") or "")[:10], "tags": r.get("tags") or [],
                "salary_min": None, "salary_max": None, "salary_text": r.get("salary") or "",
                "remote": True, "url": r.get("url") or "",
                "worldwide": any(w in loc for w in ("worldwide", "anywhere", "africa", "emea")) or loc == "",
            })
    for page in (1, 2, 3):
        env = _latest("arbeitnow", f"page_{page}")
        if not env:
            continue
        for r in env["data"].get("data", []):
            jobs.append({
                "source": "arbeitnow", "title": r.get("title") or "",
                "company": r.get("company_name") or "", "location": r.get("location") or "",
                "date": "", "tags": (r.get("tags") or []) + (r.get("job_types") or []),
                "salary_min": None, "salary_max": None,
                "remote": bool(r.get("remote")), "url": r.get("url") or "",
                "worldwide": bool(r.get("remote")),
            })
    return jobs


def load_myjobmag_jobs():
    """Parse MyJobMag RSS XML items (title/industry/date)."""
    env = _latest("myjobmag", "jobsxml")
    items = []
    if not env:
        return items
    text = env["text"]
    for m in re.finditer(r"<item>(.*?)</item>", text, re.S):
        block = m.group(1)
        def tag(t):
            mm = re.search(rf"<{t}>(.*?)</{t}>", block, re.S)
            return html.unescape(mm.group(1).strip()) if mm else ""
        title = tag("title")
        items.append({
            "source": "myjobmag", "title": title,
            "company": title.split(" at ")[-1] if " at " in title else "",
            "industry": tag("industry"), "date": tag("pubDate"), "url": tag("link"),
        })
    return items


def load_themuse():
    """The Muse per-category totals + rows."""
    out = {}
    for p in glob.glob(os.path.join(RAW, "themuse", "*", "cat_*.json")):
        with open(p, encoding="utf-8") as f:
            env = json.load(f)
        cat = env["_meta"]["key"].replace("cat_", "")
        d = env["data"]
        out[cat] = {"total": d.get("total") or 0, "results": d.get("results") or []}
    return out


def load_counts(provider, role_key, lens):
    env = _latest(provider, f"{role_key}__{lens}")
    if not env:
        return None
    d = env.get("data") or {}
    if provider == "careerjet":
        return d.get("hits")
    if provider == "jooble":
        return d.get("totalCount")
    return None


def load_jsearch(role_key, lens):
    env = _latest("jsearch", f"{role_key}__{lens}")
    if not env:
        return []
    return (env.get("data") or {}).get("data") or []


def load_salary(role_key, lens):
    """Glassdoor salary-estimation response: data is a dict with
    min/median/max_salary. US queries return USD/year; Lagos queries return
    NGN/month (Glassdoor Nigeria convention). Returns a normalized dict:
    {min, max, median, currency, period} annualized."""
    env = _latest("openwebninja", f"{role_key}__{lens}")
    if not env:
        return None
    d = (env.get("data") or {}).get("data")
    if isinstance(d, list):
        d = d[0] if d else None
    if not isinstance(d, dict) or d.get("error"):
        return None
    med = d.get("median_salary") or d.get("median_base_salary")
    lo = d.get("min_salary") or d.get("min_base_salary")
    hi = d.get("max_salary") or d.get("max_base_salary")
    if not (med or lo or hi):
        return None
    if lens == "salary_ng":
        # Glassdoor Lagos figures are NGN per month -> annualize
        factor = 12
        currency = "NGN"
    else:
        factor = 1
        currency = "USD"
    return {
        "min_salary": round(lo * factor) if lo else None,
        "max_salary": round(hi * factor) if hi else None,
        "median_salary": round(med * factor) if med else None,
        "salary_currency": currency,
        "salary_period": "year",
        "location": d.get("location"),
        "confidence": d.get("confidence"),
    }


def load_fx():
    env = _latest("fx", "usd_ngn")
    if env:
        d = (env.get("data") or {}).get("data") or {}
        rate = d.get("exchange_rate")
        if rate:
            return float(rate)
    return 1500.0  # fallback anchor if the FX call failed; noted in limitations


def load_wef():
    p = os.path.join(CM, "taxonomies", "wef_2025_roles.json")
    if not os.path.exists(p):
        return {"growing": [], "declining": []}
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    growing, declining = [], []
    def walk(x):
        if isinstance(x, dict):
            for k, v in x.items():
                lk = str(k).lower()
                if "grow" in lk and isinstance(v, list):
                    growing.extend(str(i).lower() for i in v if isinstance(i, str))
                elif "declin" in lk and isinstance(v, list):
                    declining.extend(str(i).lower() for i in v if isinstance(i, str))
                else:
                    walk(v)
        elif isinstance(x, list):
            for i in x:
                walk(i)
    walk(d)
    return {"growing": growing, "declining": declining}


def load_domain_tools():
    p = os.path.join(CM, "domain_tools.json")
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# ------------------------------------------------------------------ helpers

def matches(role, text):
    t = (text or "").lower()
    return any(term in t for term in role["match_terms"])


def log_score(value, lo, hi):
    """Log-scale value into 0-100 between lo and hi."""
    if value is None or value <= 0:
        return 0
    v = math.log10(max(value, 1))
    a, b = math.log10(lo), math.log10(hi)
    return round(max(0, min(100, (v - a) / (b - a) * 100)))


def mine(patterns, texts, top=8):
    c = Counter()
    for text in texts:
        if not text:
            continue
        for pat, label in patterns:
            if re.search(pat, text, re.I):
                c[label] += 1
    return [{"name": k, "mentions": v} for k, v in c.most_common(top)]


def recency_score(dates, window_days=30):
    """Share of postings from last 7 days vs the window -> 0-100."""
    import datetime
    today = datetime.date.today()
    parsed = []
    for ds in dates:
        if not ds:
            continue
        try:
            parsed.append(datetime.date.fromisoformat(ds[:10]))
        except ValueError:
            try:
                parsed.append(datetime.datetime.strptime(ds[:16].strip(), "%a, %d %b %Y").date())
            except Exception:  # noqa: BLE001
                continue
    if not parsed:
        return None
    recent = sum(1 for d in parsed if (today - d).days <= 7)
    return round(min(100, recent / max(len(parsed), 1) * 100 * 2))  # 50%+ in last week => 100


def diversity_score(companies):
    companies = [c for c in companies if c]
    if not companies:
        return None
    return round(len(set(c.lower() for c in companies)) / len(companies) * 100)


MUSE_CAT_BY_AREA = {
    "ICT": "Software_Engineering", "accounting/finance": "Accounting_and_Finance",
    "healthcare": "Healthcare", "engineering": "Science_and_Engineering",
    "education": "Education", "logistics": "Manufacturing_and_Warehouse",
    "sales": "Sales", "HR": "Human_Resources_and_Recruitment",
    "legal": "Legal_Services", "product/design": "Design_and_UX",
}


# ------------------------------------------------------------------ record builder

def build_records():
    fx = load_fx()
    wef = load_wef()
    remote_jobs = load_bulk_remote_jobs()
    mjm_jobs = load_myjobmag_jobs()
    muse = load_themuse()
    dtools = load_domain_tools()

    out_jsonl = os.path.join(OUT_DIR, "market_backfill_sample.jsonl")
    # start fresh each normalize run (fetch is incremental; normalize is cheap)
    if os.path.exists(out_jsonl):
        os.remove(out_jsonl)

    records = []
    for role in SAMPLE_ROLES:
        rk = role["role_key"]
        print(f"[{rk}]")

        # shared signals
        js_global = load_jsearch(rk, "global")
        js_ng = load_jsearch(rk, "ng")
        cj_global = load_counts("careerjet", rk, "global")
        cj_ng = load_counts("careerjet", rk, "ng")
        jb_global = load_counts("jooble", rk, "global")
        sal_us = load_salary(rk, "salary_us")
        sal_ng = load_salary(rk, "salary_ng")
        wef_growing = any(role["query"] in g or any(t in g for t in role["match_terms"][:3]) for g in wef["growing"])

        rm_matches = [j for j in remote_jobs if matches(role, j["title"])]
        rm_accessible = [j for j in rm_matches if j.get("worldwide")]
        mjm_matches = [j for j in mjm_jobs if matches(role, j["title"])]
        muse_cat = muse.get(MUSE_CAT_BY_AREA.get(role["area"], ""), {"total": 0, "results": []})

        domain_tool_names = [t["tool"] for t in (dtools.get(role["domain_id"], {}) or {}).get("distinctive_tools", [])[:8]]

        js_texts_g = [f"{j.get('job_title', '')} {j.get('job_description', '')}" for j in js_global]
        js_texts_n = [f"{j.get('job_title', '')} {j.get('job_description', '')}" for j in js_ng]
        rm_texts = [f"{j['title']} {' '.join(map(str, j.get('tags') or []))}" for j in rm_matches]
        mjm_texts = [j["title"] for j in mjm_matches]

        base = {
            "role_key": rk, "role_name": role["role_name"], "area": role["area"],
            "domain_id": role["domain_id"], "domain_name": role["domain_name"],
            "esco_code": role["esco_code"], "isco_group": role["isco_group"],
            "evidence_window_start": "2026-06-16", "evidence_window_end": TODAY,
            "last_refreshed_at": NOW, "usd_ngn_rate_used": fx,
        }

        # ---------------- global ----------------
        g_remote_share = None
        if js_global:
            g_remote_share = round(sum(1 for j in js_global if j.get("job_is_remote")) / len(js_global) * 100)
        g_sal_min = sal_us.get("min_salary") if sal_us else None
        g_sal_max = sal_us.get("max_salary") if sal_us else None
        g_sal_med = sal_us.get("median_salary") if sal_us else None
        if g_sal_med is None:
            # fallback: RemoteOK salary ranges on matched remote roles
            ss = [(j["salary_min"], j["salary_max"]) for j in rm_matches
                  if j.get("salary_min") and j.get("salary_max") and j["salary_min"] > 1000]
            if ss:
                g_sal_min = round(sum(s[0] for s in ss) / len(ss))
                g_sal_max = round(sum(s[1] for s in ss) / len(ss))
                g_sal_med = round((g_sal_min + g_sal_max) / 2)
        g_conf_reasons = []
        g_sources = []
        if cj_global is not None:
            g_sources.append({"source": "Careerjet API", "url": "http://public.api.careerjet.net/search",
                              "metric": "hits", "value": cj_global, "redistributable": "aggregate_counts_only"})
        if jb_global is not None:
            g_sources.append({"source": "Jooble API", "url": "https://jooble.org/api/about",
                              "metric": "totalCount", "value": jb_global, "redistributable": "aggregate_counts_only"})
        if js_global:
            g_sources.append({"source": "JSearch (OpenWeb Ninja)", "url": "https://www.openwebninja.com/api/jsearch",
                              "metric": "postings_sampled", "value": len(js_global), "redistributable": "derived_fields_only"})
        if muse_cat["total"]:
            g_sources.append({"source": "The Muse public API", "url": "https://www.themuse.com/api/public/jobs",
                              "metric": "category_total", "value": muse_cat["total"], "redistributable": "aggregate_counts_only"})
        if sal_us:
            g_sources.append({"source": "OpenWeb Ninja job-salary-data (Glassdoor-derived)",
                              "url": "https://www.openwebninja.com/api/job-salary-data",
                              "metric": "salary_estimate", "value": "min/median/max",
                              "redistributable": "derived_aggregates_only_reference"})
        vol_inputs = [x for x in (cj_global, jb_global) if x]
        g_vol = round(sum(log_score(v, 100, 500_000) for v in vol_inputs) / len(vol_inputs)) if vol_inputs else None
        g_rec = recency_score([j.get("job_posted_at_datetime_utc", "") for j in js_global])
        if wef_growing:
            g_rec = min(100, (g_rec or 50) + 15)
        n_srcs = len(vol_inputs) + (1 if js_global else 0)
        g_conf = "high" if (n_srcs >= 2 and sal_us) else ("medium" if n_srcs >= 2 or sal_us else "low")
        g_conf_reasons.append(f"{n_srcs} independent posting-volume sources; salary anchor {'present' if (sal_us or g_sal_med) else 'missing'}")
        records.append({**base, "lens": "global",
            "posting_volume_score": g_vol,
            "value_score": log_score(g_sal_med, USD_LO, USD_HI) if g_sal_med else None,
            "growth_or_recency_score": g_rec,
            "remote_access_score": g_remote_share,
            "employer_diversity_score": diversity_score([j.get("employer_name") for j in js_global]),
            "top_tools": [t["name"] for t in mine(TOOL_PATTERNS, js_texts_g)] or domain_tool_names[:5],
            "top_certifications": [c["name"] for c in mine(CERT_PATTERNS, js_texts_g)],
            "top_employers": [e for e, _ in Counter(j.get("employer_name") for j in js_global if j.get("employer_name")).most_common(5)],
            "salary_min": g_sal_min, "salary_max": g_sal_max, "salary_median_or_midpoint": g_sal_med,
            "salary_currency": "USD", "salary_period": "year", "seniority_level": "all",
            "location_scope": "global (US-anchored salary)",
            "source_confidence": g_conf, "confidence_reason": "; ".join(g_conf_reasons),
            "redistributable": "derived_scores_and_aggregates_only",
            "sources": g_sources,
            "notes_on_limitations": "Recency proxy from 30-day posting sample, not historical growth. Salary anchored to US market"
                                     + ("" if sal_us else "; salary from RemoteOK matched ranges (small n)" if g_sal_med else "; no salary anchor found"),
        })

        # ---------------- ng_remote ----------------
        nr_sal_min = nr_sal_max = nr_sal_med = None
        ss = [(j["salary_min"], j["salary_max"]) for j in rm_accessible
              if j.get("salary_min") and j.get("salary_max") and j["salary_min"] > 1000]
        if ss:
            nr_sal_min = round(sum(s[0] for s in ss) / len(ss))
            nr_sal_max = round(sum(s[1] for s in ss) / len(ss))
            nr_sal_med = round((nr_sal_min + nr_sal_max) / 2)
        elif g_sal_med:
            nr_sal_min, nr_sal_max, nr_sal_med = g_sal_min, g_sal_max, g_sal_med
        nr_sources = [{"source": s, "url": u, "metric": "matched_postings", "value": v, "redistributable": "derived_fields_only"}
                      for s, u, v in [
                          ("RemoteOK public API", "https://remoteok.com/api", sum(1 for j in rm_matches if j["source"] == "remoteok")),
                          ("Remotive public API", "https://remotive.com/api/remote-jobs", sum(1 for j in rm_matches if j["source"] == "remotive")),
                          ("Arbeitnow public API", "https://www.arbeitnow.com/api/job-board-api", sum(1 for j in rm_matches if j["source"] == "arbeitnow")),
                      ] if v]
        nr_conf = "medium" if len(rm_accessible) >= 5 else "low"
        records.append({**base, "lens": "ng_remote",
            "posting_volume_score": log_score(len(rm_accessible), 1, 60),
            "value_score": log_score(nr_sal_med, USD_LO, USD_HI) if nr_sal_med else None,
            "growth_or_recency_score": recency_score([j.get("date", "") for j in rm_matches]),
            "remote_access_score": round(len(rm_accessible) / len(rm_matches) * 100) if rm_matches else None,
            "employer_diversity_score": diversity_score([j["company"] for j in rm_matches]),
            "top_tools": [t["name"] for t in mine(TOOL_PATTERNS, rm_texts)] or domain_tool_names[:5],
            "top_certifications": [c["name"] for c in mine(CERT_PATTERNS, rm_texts)],
            "top_employers": [e for e, _ in Counter(j["company"] for j in rm_accessible if j["company"]).most_common(5)],
            "salary_min": nr_sal_min, "salary_max": nr_sal_max, "salary_median_or_midpoint": nr_sal_med,
            "salary_currency": "USD", "salary_period": "year", "seniority_level": "all",
            "location_scope": "remote roles open to Worldwide/Anywhere/EMEA/Africa candidates",
            "source_confidence": nr_conf,
            "confidence_reason": f"{len(rm_matches)} remote-board matches, {len(rm_accessible)} Nigeria-accessible; single snapshot",
            "redistributable": "derived_scores_and_aggregates_only",
            "sources": nr_sources,
            "notes_on_limitations": "Remote boards skew tech/US-EU; non-tech roles under-represented. 'Nigeria-accessible' inferred from candidate-location strings (Worldwide/Anywhere/EMEA/Africa). Salary falls back to global anchor when boards lack ranges.",
        })

        # ---------------- ng_local ----------------
        nl_sal_min = sal_ng.get("min_salary") if sal_ng else None
        nl_sal_max = sal_ng.get("max_salary") if sal_ng else None
        nl_sal_med = sal_ng.get("median_salary") if sal_ng else None
        nl_currency = (sal_ng.get("salary_currency") if sal_ng else None) or "NGN"
        nl_sources = []
        if cj_ng is not None:
            nl_sources.append({"source": "Careerjet API (en_NG)", "url": "http://public.api.careerjet.net/search",
                               "metric": "hits", "value": cj_ng, "redistributable": "aggregate_counts_only"})
        if mjm_matches:
            nl_sources.append({"source": "MyJobMag public jobs XML feed", "url": "https://www.myjobmag.com/jobsxml.xml",
                               "metric": "matched_items", "value": len(mjm_matches), "redistributable": "feed_provided_for_consumption"})
        if js_ng:
            nl_sources.append({"source": "JSearch (OpenWeb Ninja) country=ng", "url": "https://www.openwebninja.com/api/jsearch",
                               "metric": "postings_sampled", "value": len(js_ng), "redistributable": "derived_fields_only"})
        if sal_ng:
            nl_sources.append({"source": "OpenWeb Ninja job-salary-data (Glassdoor-derived, Nigeria)",
                               "url": "https://www.openwebninja.com/api/job-salary-data",
                               "metric": "salary_estimate", "value": "min/median/max",
                               "redistributable": "derived_aggregates_only_reference"})
        nl_vol_parts = []
        if cj_ng is not None:
            nl_vol_parts.append(log_score(cj_ng, 5, 2000))
        if mjm_matches:
            nl_vol_parts.append(log_score(len(mjm_matches), 1, 40))
        nl_vol = round(sum(nl_vol_parts) / len(nl_vol_parts)) if nl_vol_parts else None
        nl_value = None
        if nl_sal_med:
            if nl_currency.upper() == "NGN":
                nl_value = log_score(nl_sal_med, NGN_LO, NGN_HI)
            else:
                nl_value = log_score(nl_sal_med * (fx if nl_currency.upper() == "USD" else 1), NGN_LO, NGN_HI)
        n_nl = len(nl_sources)
        nl_conf = "high" if (n_nl >= 3 and nl_sal_med) else ("medium" if n_nl >= 2 else "low")
        records.append({**base, "lens": "ng_local",
            "posting_volume_score": nl_vol,
            "value_score": nl_value,
            "growth_or_recency_score": recency_score([j.get("job_posted_at_datetime_utc", "") for j in js_ng] +
                                                     [j.get("date", "") for j in mjm_matches]),
            "remote_access_score": round(sum(1 for j in js_ng if j.get("job_is_remote")) / len(js_ng) * 100) if js_ng else None,
            "employer_diversity_score": diversity_score([j.get("employer_name") for j in js_ng] +
                                                        [j["company"] for j in mjm_matches]),
            "top_tools": [t["name"] for t in mine(TOOL_PATTERNS, js_texts_n + mjm_texts)] or domain_tool_names[:5],
            "top_certifications": [c["name"] for c in mine(CERT_PATTERNS, js_texts_n + mjm_texts)],
            "top_employers": [e for e, _ in Counter([j.get("employer_name") for j in js_ng if j.get("employer_name")] +
                                                    [j["company"] for j in mjm_matches if j["company"]]).most_common(5)],
            "salary_min": nl_sal_min, "salary_max": nl_sal_max, "salary_median_or_midpoint": nl_sal_med,
            "salary_currency": nl_currency if nl_sal_med else None, "salary_period": "year" if nl_sal_med else None,
            "seniority_level": "all", "location_scope": "Nigeria",
            "source_confidence": nl_conf,
            "confidence_reason": f"{n_nl} Nigerian-lens sources; salary anchor {'present' if nl_sal_med else 'missing'}",
            "redistributable": "derived_scores_and_aggregates_only",
            "sources": nl_sources,
            "notes_on_limitations": "Careerjet NG hits and MyJobMag feed are point-in-time counts, not trends. "
                                     + ("" if nl_sal_med else "No Nigerian salary anchor from APIs yet; use salary-guide manual anchors next. ")
                                     + "Nigerian postings rarely publish salaries.",
        })

        # incremental save after each role
        with open(out_jsonl, "a", encoding="utf-8") as f:
            for rec in records[-3:]:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print(f"  saved 3 lens records ({rk})")

    # CSV mirror
    csv_path = os.path.join(OUT_DIR, "market_backfill_sample.csv")
    flat_keys = [k for k in records[0].keys() if k != "sources"]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=flat_keys + ["sources_json"])
        w.writeheader()
        for rec in records:
            row = {k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v)
                   for k, v in rec.items() if k != "sources"}
            row["sources_json"] = json.dumps(rec["sources"], ensure_ascii=False)
            w.writerow(row)
    print(f"\nwrote {len(records)} records -> {out_jsonl}")
    print(f"csv mirror -> {csv_path}")
    return records


if __name__ == "__main__":
    build_records()
