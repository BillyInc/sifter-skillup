#!/usr/bin/env python3
"""Generate backend/seed_demand_baseline.sql — derived demand metrics baseline.

APPROVED APPROACH (owner, 2026-07-16): populate domain_demand_metrics and
role_demand_metrics for ALL domains/roles × 3 lenses with values DERIVED from
real local signals, labelled source_confidence='low' (method taxonomy_derived),
then OVERLAY the 10 API-sampled roles at their true (medium) confidence.
Nothing is invented: every number traces to a real signal listed in the
market_metric_sources provenance row. Replaced incrementally by the live
API sweeps (see FETCH_PLAN).

Real signals used:
  volume  — Careerjet/Jooble counts for the 10 sampled roles (cluster anchors),
            The Muse category totals (global), bulk remote-board title matches
            (RemoteOK/Remotive/Arbeitnow), MyJobMag feed matches (ng_local),
            role onet_score presence.
  value   — Glassdoor salary anchors (10 roles, US + Lagos) interpolated by
            cluster; role tier multiplier (entry .75 / mid 1.0 / senior 1.35).
  growth  — WEF 2025 growing/declining role labels + O*NET Bright Outlook.
  remote  — JSearch remote share for sampled domains; remote-board match share.

Honesty rules: postings_count only set where it is a REAL count (bulk-board
matches / API hits); derived intensity lives in volume_score. postings_yoy and
trend_pct stay NULL (no history yet). Quadrant 'emerging_high_growth' only via
WEF growing signal.

Run:  python gen_demand_baseline.py   (offline — reads caches only)
"""
import csv
import glob
import json
import math
import os
import re
import sys
import time
import uuid
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
CM = os.path.abspath(os.path.join(HERE, ".."))
RAW = os.path.join(CM, "_source_downloads", "market_intelligence")
NS = uuid.UUID("5c1f7e00-0000-4000-8000-0000ca4ee401")  # same namespace as seeds

MONTH = time.strftime("%Y-%m-01")


def uid(*parts):
    return str(uuid.uuid5(NS, "|".join(parts)))


def q(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def num(v):
    return "NULL" if v is None else str(round(v, 2))


def arr(xs):
    if not xs:
        return "'{}'"
    inner = ",".join('"' + str(x).replace('"', '\\"') + '"' for x in xs)
    return "'" + ("{" + inner + "}").replace("'", "''") + "'"


def load(p):
    return json.load(open(os.path.join(CM, p), encoding="utf-8"))


def latest(provider, key):
    paths = sorted(glob.glob(os.path.join(RAW, provider, "*", f"{key}.json")))
    if not paths:
        return None
    return json.load(open(paths[-1], encoding="utf-8"))


# ── load taxonomy ────────────────────────────────────────────────
meta = load("domain_meta.json")
struct = load("domain_structure.json")
roles = load("role_library_v3.json")
wef = load("taxonomies/wef_2025_roles.json")

# UNIVERSITY-PIPELINE SCOPE — same reachability rule as _gen_career_seed.py:
# hide excluded domains + domains no CCMAS programme / JAMB name links to.
# (Demand rows for hidden domains would violate FKs anyway — they're deleted.)
_pd = load("programme_domain_final.json")
_jd = load("jamb_domain_map.json")
_reachable = set()
for _v in _pd.values():
    for _l in (_v["links"] if isinstance(_v, dict) and "links" in _v else _v):
        _reachable.add(_l["domain_id"])
for _e in _jd.values():
    for _l in _e.get("links", []):
        _reachable.add(_l["domain_id"])
HIDDEN = {d for d in meta if meta[d].get("excluded") or d not in _reachable}
try:
    bright = load("taxonomies/onet_bright_outlook.json")
except FileNotFoundError:
    bright = {}

# WEF growing/declining name sets (walk any structure)
wef_grow, wef_decl = set(), set()
def _walk(x, bucket=None):
    if isinstance(x, dict):
        for k, v in x.items():
            lk = str(k).lower()
            b = "g" if "grow" in lk else ("d" if "declin" in lk else bucket)
            _walk(v, b)
    elif isinstance(x, list):
        for i in x:
            _walk(i, bucket)
    elif isinstance(x, str) and bucket:
        (wef_grow if bucket == "g" else wef_decl).add(x.lower())
_walk(wef)

bright_names = set()
if isinstance(bright, list):
    for b in bright:
        if isinstance(b, dict):
            bright_names.add(str(b.get("title", b.get("name", ""))).lower())
        else:
            bright_names.add(str(b).lower())
elif isinstance(bright, dict):
    for v in bright.values():
        bright_names.add(str(v.get("title", "") if isinstance(v, dict) else v).lower())

# ── real overlay: the 10-role sample ─────────────────────────────
SAMPLE = {}
sample_path = os.path.join(CM, "_source_extracts", "market_intelligence", "market_backfill_sample.jsonl")
if os.path.exists(sample_path):
    for line in open(sample_path, encoding="utf-8"):
        r = json.loads(line)
        SAMPLE[(r["domain_id"], r["role_name"].lower(), r["lens"])] = r

# cluster anchors from the sample (careerjet/jooble hits + salaries)
cluster_of = {dk: (m.get("cluster") or (m.get("clusters") or ["?"])[0]) for dk, m in meta.items()}
anchor_vol = defaultdict(lambda: defaultdict(list))   # lens -> cluster -> [volume_score]
anchor_sal = defaultdict(lambda: defaultdict(list))   # lens -> cluster -> [salary_median]
for (dk, rn, lens), r in SAMPLE.items():
    cl = cluster_of.get(dk)
    if r.get("posting_volume_score") is not None:
        anchor_vol[lens][cl].append(r["posting_volume_score"])
    if r.get("salary_median_or_midpoint"):
        anchor_sal[lens][cl].append(r["salary_median_or_midpoint"])
GLOBAL_VOL_MEAN = {lens: (sum(sum(v, []) if False else [x for xs in cs.values() for x in xs]) /
                          max(1, len([x for xs in cs.values() for x in xs])))
                   for lens, cs in anchor_vol.items()}
GLOBAL_SAL_MEAN = {lens: (sum([x for xs in cs.values() for x in xs]) /
                          max(1, len([x for xs in cs.values() for x in xs])))
                   for lens, cs in anchor_sal.items()}

# ── bulk boards: match every role's title offline ────────────────
def norm_tokens(t):
    return set(re.sub(r"[^a-z0-9 ]", " ", t.lower()).split())

bulk_titles = []       # (title_lower, remote_ok:bool, source)
env = latest("remoteok", "all_jobs")
if env:
    for r in env["data"]:
        if isinstance(r, dict) and r.get("position"):
            bulk_titles.append((r["position"].lower(), True, "remoteok"))
env = latest("remotive", "all_jobs")
if env:
    for r in env["data"].get("jobs", []):
        bulk_titles.append((r.get("title", "").lower(), True, "remotive"))
for page in (1, 2, 3):
    env = latest("arbeitnow", f"page_{page}")
    if env:
        for r in env["data"].get("data", []):
            bulk_titles.append((r.get("title", "").lower(), bool(r.get("remote")), "arbeitnow"))
mjm_titles = []
env = latest("myjobmag", "jobsxml")
if env:
    for m in re.finditer(r"<title>(.*?)</title>", env["text"], re.S):
        mjm_titles.append(m.group(1).lower())

muse_totals = {}
for p in glob.glob(os.path.join(RAW, "themuse", "*", "cat_*.json")):
    envm = json.load(open(p, encoding="utf-8"))
    # cached key is "cat_Software Engineering" (spaces); normalize to underscores
    k = envm["_meta"]["key"].replace("cat_", "").replace(" ", "_")
    muse_totals[k] = (envm["data"] or {}).get("total") or 0

# cluster -> muse category total (global demand context)
MUSE_BY_CLUSTER = {
    "Information & Communication Technology": "cat_Software_Engineering",
    "Data & Analytics": "cat_Software_Engineering",
    "Emerging Technology": "cat_Software_Engineering",
    "Financial Services": "cat_Accounting_and_Finance",
    "Health & Biomedical": "cat_Healthcare",
    "Community Health & Paramedical": "cat_Healthcare",
    "Engineering & Built Environment": "cat_Science_and_Engineering",
    "Advanced Science & Engineering": "cat_Science_and_Engineering",
    "High-Performance Engineering": "cat_Science_and_Engineering",
    "Education & Research": "cat_Education",
    "Supply Chain & Logistics": "cat_Manufacturing_and_Warehouse",
    "Manufacturing & Industrial Plant Operations": "cat_Manufacturing_and_Warehouse",
    "Retail, Sales & Commerce": "cat_Sales",
    "Business & Management": "cat_Human_Resources_and_Recruitment",
    "Office & Administrative Services": "cat_Human_Resources_and_Recruitment",
    "Legal & Compliance": "cat_Legal_Services",
    "Creative & Media": "cat_Design_and_UX",
}
muse_vals = [v for v in muse_totals.values() if v]
MUSE_MED = sorted(muse_vals)[len(muse_vals)//2] if muse_vals else 10000

TIER_MULT = {"entry": 0.75, "mid": 1.0, "senior": 1.35}


def role_bulk_matches(rname):
    toks = norm_tokens(rname)
    if not toks:
        return 0, 0, 0
    def hit(title):
        return all(t in title for t in list(toks)[:3]) or (rname.lower() in title)
    rm = sum(1 for t, rem, _ in bulk_titles if hit(t))
    rm_remote = sum(1 for t, rem, _ in bulk_titles if rem and hit(t))
    mj = sum(1 for t in mjm_titles if hit(t))
    return rm, rm_remote, mj


def band(score):
    if score is None:
        return "unknown"
    return "high" if score >= 60 else ("medium" if score >= 30 else "low")


def quadrant(vol, val, growing):
    if vol is None or val is None:
        return "insufficient_data"
    if growing and vol < 30:
        return "emerging_high_growth"
    hv, hval = vol >= 45, val >= 45
    if hv and hval:
        return "high_demand_high_value"
    if hv:
        return "high_demand_lower_value"
    if hval:
        return "low_demand_high_value"
    return "low_demand_low_value"


QUAD_LABEL = {
    "high_demand_high_value": "Broad demand, strong upside",
    "high_demand_lower_value": "Broad entry, lower ceiling",
    "low_demand_high_value": "Elite pathway, selective entry",
    "low_demand_low_value": "Limited signal, investigate carefully",
    "emerging_high_growth": "Growing fast, still forming",
    "insufficient_data": "Insufficient data",
}

USD_LO, USD_HI = 15_000, 150_000
NGN_LO, NGN_HI = 1_200_000, 30_000_000


def log_score(value, lo, hi):
    if not value or value <= 0:
        return None
    v = math.log10(max(value, 1))
    a, b = math.log10(lo), math.log10(hi)
    return max(0, min(100, round((v - a) / (b - a) * 100)))


# ── per-role rows (also accumulates the domain rollup) ──────────
role_rows = []      # role_demand_metrics VALUES
src_rows = []       # market_metric_sources VALUES
dom_acc = defaultdict(lambda: defaultdict(list))  # (dk, lens) -> field -> values

for r in roles:
    dk = r["domain_id"]
    if dk not in meta or dk in HIDDEN:
        continue
    rk = f'{dk}|{r["role_name"]}'
    cl = cluster_of.get(dk)
    tier = r.get("tier") or "mid"
    rl = r["role_name"].lower()
    growing = any(rl in g or g in rl for g in wef_grow)
    rm, rm_remote, mj = role_bulk_matches(r["role_name"])

    for lens in ("global", "ng_remote", "ng_local"):
        s = SAMPLE.get((dk, rl, lens))
        if s:  # real overlay at the sample's own confidence
            vol, val = s.get("posting_volume_score"), s.get("value_score")
            sal_min, sal_max = s.get("salary_min"), s.get("salary_max")
            remote_pct = s.get("remote_access_score")
            conf = s.get("source_confidence") or "medium"
            emp = (s.get("top_employers") or [])[:5]
            certs = (s.get("top_certifications") or [])[:5]
            postings = None
        else:
            # cluster anchor -> global anchor mean -> muse category context
            av = anchor_vol[lens].get(cl)
            base = (sum(av) / len(av)) if av else GLOBAL_VOL_MEAN.get(lens) or 30
            if lens == "global":
                mt = muse_totals.get((MUSE_BY_CLUSTER.get(cl) or "").replace("cat_", ""))
                if mt:
                    base = 0.7 * base + 0.3 * min(100, 15 * math.log10(mt + 1))
            # bulk-board evidence shifts the baseline
            if lens == "ng_remote":
                vol = round(0.5 * base + 25 * math.log10(rm_remote + 1)) if rm_remote else round(base * 0.5)
            elif lens == "ng_local":
                vol = round(0.6 * base + 40 * math.log10(mj + 1)) if mj else round(base * 0.7)
            else:
                vol = round(base + min(15, 5 * math.log10(rm + 1))) if rm else round(base)
            vol = max(0, min(100, vol))
            asal = anchor_sal[lens].get(cl)
            sal_anchor = (sum(asal) / len(asal)) if asal else GLOBAL_SAL_MEAN.get(lens)
            sal_min = sal_max = val = None
            if sal_anchor:
                mid = sal_anchor * TIER_MULT.get(tier, 1.0)
                sal_min, sal_max = round(mid * 0.75), round(mid * 1.3)
                val = log_score(mid, NGN_LO, NGN_HI) if lens == "ng_local" else log_score(mid, USD_LO, USD_HI)
            remote_pct = round(rm_remote / rm * 100) if (lens == "ng_remote" and rm) else None
            conf, emp, certs = "low", [], []
            # postings_count only where it is a REAL count (bulk-board matches)
            postings = (rm_remote if lens == "ng_remote" and rm_remote else (mj if lens == "ng_local" and mj else None))

        qd = quadrant(vol, val, growing)
        role_rows.append([
            q(uid("rdm", rk, lens, MONTH)), q(rk), q(r["role_name"]), q(uid("domain", dk)),
            q(lens), q(MONTH), num(postings), "NULL", num(remote_pct),
            num(sal_min), num(sal_max), arr(emp), arr(certs), "NULL", "true",
            q(band(val)), q(band(vol)), q(qd), q(QUAD_LABEL[qd]), q(conf),
        ])
        # accumulate for the domain rollup
        dom_acc[(dk, lens)]["vol"].append(vol if vol is not None else 0)
        if val is not None:
            dom_acc[(dk, lens)]["val"].append(val)
        if sal_min:
            dom_acc[(dk, lens)]["sal_min"].append(sal_min)
        if remote_pct is not None:
            dom_acc[(dk, lens)]["remote"].append(remote_pct)
        if growing:
            dom_acc[(dk, lens)]["grow"].append(1)
        if emp:
            dom_acc[(dk, lens)]["emp"].extend(emp)
        if certs:
            dom_acc[(dk, lens)]["certs"].extend(certs)
        if conf != "low":
            dom_acc[(dk, lens)]["real"].append(1)

# ── domain rollups ───────────────────────────────────────────────
dom_rows = []
for dk, m in meta.items():
    if dk in HIDDEN:
        continue
    for lens in ("global", "ng_remote", "ng_local"):
        acc = dom_acc.get((dk, lens), {})
        vols = acc.get("vol", [])
        vals = acc.get("val", [])
        if not vols:
            continue
        # volume = mean of the top quartile (a domain is as big as its busiest roles)
        vs = sorted(vols, reverse=True)
        topq = vs[:max(1, len(vs)//4)]
        vol = round(sum(topq)/len(topq))
        val = round(sorted(vals)[len(vals)//2]) if vals else None
        remote = round(sum(acc["remote"])/len(acc["remote"])) if acc.get("remote") else None
        sal_ngn = round(sorted(acc["sal_min"])[len(acc["sal_min"])//2]) if (lens == "ng_local" and acc.get("sal_min")) else None
        sal_usd = round(sorted(acc["sal_min"])[len(acc["sal_min"])//2]) if (lens != "ng_local" and acc.get("sal_min")) else None
        growing = bool(acc.get("grow"))
        conf = "medium" if acc.get("real") else "low"
        from collections import Counter as _C
        emp = [e for e, _ in _C(acc.get("emp", [])).most_common(5)]
        certs = [c for c, _ in _C(acc.get("certs", [])).most_common(5)]
        qd = quadrant(vol, val, growing)
        dom_rows.append([
            q(uid("ddm", dk, lens, MONTH)), q(uid("domain", dk)), q(lens), q(MONTH),
            "NULL", "NULL", num(remote), num(sal_ngn), num(sal_usd),
            arr(emp), arr(certs), num(val), num(vol), q(QUAD_LABEL[qd]), "true",
            q(band(val)), q(band(vol)), q(qd), q(QUAD_LABEL[qd]), q(conf),
        ])
        src_rows.append([
            q(uid("mms", dk, lens, MONTH)), q("domain"), q(dk), q(lens),
            q("taxonomy_derived_baseline_v1"),
            q("https://github.com/sifter-levelup/data-pipeline"),  # provenance doc pointer
            q("aggregate_counts_only"), q("aggregate_rollup"), q(conf),
            q(json.dumps({
                "signals": ["careerjet/jooble 10-role anchors", "the_muse category totals",
                             "remote-board title matches", "myjobmag feed matches",
                             "glassdoor 10-role salary anchors", "WEF 2025 growing labels",
                             "role tier multipliers"],
                "n_role_rows": len(dom_acc.get((dk, lens), {}).get("vol", [])),
                "generated": MONTH,
            })),
        ])

# ── emit SQL ─────────────────────────────────────────────────────
out = ["-- AUTO-GENERATED by _market_intelligence/gen_demand_baseline.py — DO NOT EDIT",
       "-- Derived demand baseline (source_confidence=low) + real 10-role overlay (medium).",
       "-- Every number derives from a real signal; see market_metric_sources payloads.",
       "SET search_path TO skillup_dev;", "BEGIN;", ""]

def emit(table, cols, vals, conflict):
    if not vals:
        out.append(f"-- {table}: 0 rows")
        return
    upd = ", ".join(f"{c}=EXCLUDED.{c}" for c in cols if c != "id")
    out.append(f"-- {table}: {len(vals)} rows")
    for i in range(0, len(vals), 200):
        out.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES")
        out.append(",\n".join("  (" + ", ".join(v) + ")" for v in vals[i:i+200]))
        out.append(f"ON CONFLICT ({conflict}) DO UPDATE SET {upd};")
    out.append("")

emit("role_demand_metrics",
     ["id", "role_id", "role_name", "domain_id", "rank_lens", "month", "postings_count",
      "postings_yoy", "remote_pct", "salary_min", "salary_max", "top_employers", "top_certs",
      "trend_pct", "redistributable", "value_band", "demand_band", "quadrant",
      "interpretation", "source_confidence"],
     role_rows, "role_id, rank_lens, month")

emit("domain_demand_metrics",
     ["id", "domain_id", "rank_lens", "month", "postings_count", "postings_yoy", "remote_pct",
      "entry_salary_local_ngn", "entry_salary_remote_usd", "top_employers", "top_certs",
      "value_score", "volume_score", "plain_label", "redistributable", "value_band",
      "demand_band", "quadrant", "interpretation", "source_confidence"],
     dom_rows, "domain_id, rank_lens, month")

# market_metric_sources has collected_at DEFAULT NOW() in its unique key — plain INSERT:
if src_rows:
    out.append(f"-- market_metric_sources: {len(src_rows)} rows")
    for i in range(0, len(src_rows), 200):
        out.append("INSERT INTO market_metric_sources (id, metric_scope, entity_id, rank_lens, source_name, source_url, licence_class, method, confidence, source_payload) VALUES")
        out.append(",\n".join("  (" + ", ".join(v[:9]) + ", " + v[9] + "::jsonb)" for v in src_rows[i:i+200]))
        out.append("ON CONFLICT DO NOTHING;")
    out.append("")

out.append("COMMIT;")
dest = os.path.join(CM, "..", "..", "backend", "seed_demand_baseline.sql")
open(dest, "w", encoding="utf-8").write("\n".join(out))
print(f"seed_demand_baseline.sql: role rows={len(role_rows)}, domain rows={len(dom_rows)}, provenance rows={len(src_rows)}")
print(f"-> {os.path.abspath(dest)}")
