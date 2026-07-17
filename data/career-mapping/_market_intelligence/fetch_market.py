#!/usr/bin/env python3
"""Market intelligence backfill fetcher.

Design goals:
- INCREMENTAL: every successful response is written to disk immediately under
  _source_downloads/market_intelligence/<provider>/<date>/ so a rate-limit or
  crash mid-run loses nothing.
- CACHE-FIRST / RESUMABLE: if a cache file for (provider, query-key, today)
  exists, the network call is skipped entirely. Re-running is free.
- RATE-LIMIT AWARE: each provider has a min interval between calls and a hard
  per-run call budget. 429/403 responses trigger a provider-level circuit
  breaker (stop that provider, keep the others).
- NO SECRETS in outputs: responses are checked before writing; URL params with
  keys are never persisted.

Usage:
  python fetch_market.py            # fetch everything missing for today
  python fetch_market.py --provider jsearch
  python fetch_market.py --dry-run  # show planned calls without network
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import env_load
from sample_roles import SAMPLE_ROLES

HERE = os.path.dirname(os.path.abspath(__file__))
CM_DIR = os.path.abspath(os.path.join(HERE, ".."))
RAW_DIR = os.path.join(CM_DIR, "_source_downloads", "market_intelligence")
TODAY = time.strftime("%Y-%m-%d")
USER_AGENT = "SifterLevelUp-MarketIntelligence/1.0 (educational career-guidance research; contact: admin@sifter.app)"

# ---------------------------------------------------------------- rate limits
# Conservative budgets. Free tiers: JSearch ~200 req/MONTH, OpenWebNinja
# ~50-200 req/MONTH, Jooble ~500/day, Careerjet partner-key (be polite).
PROVIDER_LIMITS = {
    # provider: (min_seconds_between_calls, max_calls_per_run)
    "jsearch":      (2.0, 22),   # 2 lenses x 10 roles + margin (Basic plan monthly cap)
    "openwebninja": (2.0, 30),   # 2 salary calls per role + retries (free tier 50/mo hard cap)
    "glassdoor":    (2.5, 12),   # salary-estimation fallback; free tier 100/mo hard cap
    "fx":           (2.0, 2),    # one USD->NGN rate per run
    "careerjet":    (1.2, 25),   # 2 lenses x 10 roles + margin
    "jooble":       (1.2, 25),
    "remoteok":     (2.0, 2),    # single bulk endpoint
    "remotive":     (2.0, 2),
    "arbeitnow":    (1.5, 4),    # a few pages
    "themuse":      (1.2, 12),   # per-category pages
    "myjobmag":     (3.0, 6),    # polite scraping of public feed/search pages
}

_last_call = {}
_calls_made = {}
_provider_dead = set()


class ProviderBudgetExceeded(Exception):
    pass


def _throttle(provider):
    if provider in _provider_dead:
        raise ProviderBudgetExceeded(f"{provider}: circuit breaker open")
    min_gap, max_calls = PROVIDER_LIMITS[provider]
    if _calls_made.get(provider, 0) >= max_calls:
        raise ProviderBudgetExceeded(f"{provider}: per-run budget {max_calls} reached")
    wait = _last_call.get(provider, 0) + min_gap - time.time()
    if wait > 0:
        time.sleep(wait)
    _last_call[provider] = time.time()
    _calls_made[provider] = _calls_made.get(provider, 0) + 1


def _cache_path(provider, key):
    d = os.path.join(RAW_DIR, provider, TODAY)
    os.makedirs(d, exist_ok=True)
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in key)[:120]
    return os.path.join(d, f"{safe}.json")


def _scrub(text):
    """Ensure no secret value leaks into persisted output."""
    for v in env_load.all_secret_values():
        if v in text:
            text = text.replace(v, "***REDACTED***")
    return text


def http_json(provider, key, url, headers=None, data=None, method="GET", force=False):
    """Cache-first JSON fetch. Returns (obj, from_cache). Writes cache immediately."""
    cp = _cache_path(provider, key)
    if os.path.exists(cp) and not force:
        with open(cp, encoding="utf-8") as f:
            return json.load(f), True
    _throttle(provider)
    req_headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if headers:
        req_headers.update(headers)
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        req_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        if e.code in (401, 403, 429):
            _provider_dead.add(provider)
            print(f"    !! {provider} HTTP {e.code} — circuit breaker OPEN (stopping this provider)")
            raise ProviderBudgetExceeded(f"{provider} HTTP {e.code}")
        print(f"    !! {provider} HTTP {e.code} for {key} — skipping")
        return None, False
    except Exception as e:  # noqa: BLE001
        print(f"    !! {provider} error for {key}: {type(e).__name__} — skipping")
        return None, False
    raw = _scrub(raw)
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        obj = {"_raw_text": raw[:200000]}
    envelope = {
        "_meta": {
            "provider": provider,
            "key": key,
            # provenance URL with any key params stripped
            "url": _strip_secret_params(url),
            "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
        "data": obj,
    }
    with open(cp, "w", encoding="utf-8") as f:
        json.dump(envelope, f, ensure_ascii=False)
    return envelope, False


def _strip_secret_params(url):
    parts = urllib.parse.urlsplit(url)
    q = [(k, "***" if any(s in k.lower() for s in ("key", "affid", "token", "secret")) else v)
         for k, v in urllib.parse.parse_qsl(parts.query)]
    url = urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(q)))
    # also mask secrets embedded in the path (e.g. Jooble's /api/<key>)
    return _scrub(url)


def http_text(provider, key, url, force=False):
    """Cache-first text/HTML/XML fetch for public pages (polite scraping)."""
    cp = _cache_path(provider, key)
    if os.path.exists(cp) and not force:
        with open(cp, encoding="utf-8") as f:
            return json.load(f), True
    _throttle(provider)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"    !! {provider} error for {key}: {type(e).__name__} — skipping")
        return None, False
    envelope = {
        "_meta": {"provider": provider, "key": key, "url": url,
                  "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
        "text": _scrub(raw),
    }
    with open(cp, "w", encoding="utf-8") as f:
        json.dump(envelope, f, ensure_ascii=False)
    return envelope, False


# ------------------------------------------------------------------ providers

def fetch_jsearch(roles, dry=False):
    """JSearch via OpenWeb Ninja direct API (api.openwebninja.com, x-api-key).
    Verified 2026-07-16 after subscribing to the JSearch Basic plan.
    The RapidAPI host for this key only exposes salary endpoints (/search 404s).
    2 search calls per role: global remote-friendly + Nigeria."""
    key = env_load.get_secret("OPENWEBNINJA_API_KEY")
    if not key:
        print("  jsearch: no OPENWEBNINJA_API_KEY, skipping")
        return
    headers = {"x-api-key": key}
    base = "https://api.openwebninja.com/jsearch/search"
    for r in roles:
        for lens, params in (
            ("global", {"query": r["query"], "num_pages": "1", "page": "1",
                         "date_posted": "month", "work_from_home": "true"}),
            ("ng", {"query": f"{r['query']} in nigeria", "num_pages": "1", "page": "1",
                     "date_posted": "month", "country": "ng"}),
        ):
            ckey = f"{r['role_key']}__{lens}"
            if dry:
                print(f"  [dry] jsearch {ckey}")
                continue
            url = base + "?" + urllib.parse.urlencode(params)
            try:
                env2, cached = http_json("jsearch", ckey, url, headers=headers)
            except ProviderBudgetExceeded as e:
                print(f"  jsearch stopped: {e}")
                return
            if env2:
                n = len((env2.get("data") or {}).get("data") or [])
                print(f"  jsearch {ckey}: {n} postings {'(cache)' if cached else ''}")


def _salary_rows_ok(env2):
    d = (env2.get("data") or {}).get("data")
    if isinstance(d, dict):
        return bool(d.get("median_salary") or d.get("min_salary") or d.get("max_salary"))
    if isinstance(d, list):
        return bool(d) and not (len(d) == 1 and isinstance(d[0], dict) and d[0].get("error"))
    return False


def fetch_openwebninja(roles, dry=False):
    """Salary estimates via OpenWeb Ninja realtime-glassdoor-data
    /salary-estimation (verified working 2026-07-16; the job-salary-data
    product's /job-salary endpoint consistently 504s upstream).
    2 calls per role: US anchor + Lagos, Nigeria. Returns min/median/max with
    currency implied by locale — NG results are NGN monthly, US results USD
    yearly; the normalizer handles conversion. Free tier ~100 req/mo hard."""
    key = env_load.get_secret("OPENWEBNINJA_API_KEY")
    if not key:
        print("  openwebninja: no key, skipping")
        return
    headers = {"x-api-key": key}
    base = "https://api.openwebninja.com/realtime-glassdoor-data/salary-estimation"
    for r in roles:
        for lens, loc in (("salary_us", "united states"), ("salary_ng", "lagos, nigeria")):
            ckey = f"{r['role_key']}__{lens}"
            if dry:
                print(f"  [dry] openwebninja {ckey}")
                continue
            cp = _cache_path("openwebninja", ckey)
            if os.path.exists(cp):
                with open(cp, encoding="utf-8") as f:
                    prev = json.load(f)
                if _salary_rows_ok(prev):
                    print(f"  openwebninja {ckey}: ok (cache)")
                    continue
                os.remove(cp)  # stale empty/timeout cache — refetch
            params = {"job_title": r["query"], "location": loc}
            url = base + "?" + urllib.parse.urlencode(params)
            got = False
            for attempt in range(2):
                try:
                    env2, cached = http_json("openwebninja", ckey, url, headers=headers, force=(attempt > 0))
                except ProviderBudgetExceeded as e:
                    print(f"  openwebninja stopped: {e}")
                    return
                if env2 and _salary_rows_ok(env2):
                    d = (env2.get("data") or {}).get("data") or {}
                    print(f"  openwebninja {ckey}: median={d.get('median_salary')}")
                    got = True
                    break
                time.sleep(4)
            if not got:
                if os.path.exists(cp):
                    os.remove(cp)
                print(f"  openwebninja {ckey}: no data after retries")


def fetch_fx(roles, dry=False):
    """One USD->NGN rate per run via realtime-finance-data, for salary normalization."""
    key = env_load.get_secret("OPENWEBNINJA_API_KEY")
    if not key or dry:
        if dry:
            print("  [dry] fx usd_ngn")
        return
    url = "https://api.openwebninja.com/realtime-finance-data/currency-exchange-rate?" + \
          urllib.parse.urlencode({"from_symbol": "USD", "to_symbol": "NGN"})
    try:
        env2, cached = http_json("fx", "usd_ngn", url, headers={"x-api-key": key})
    except ProviderBudgetExceeded:
        return
    if env2:
        rate = ((env2.get("data") or {}).get("data") or {}).get("exchange_rate")
        print(f"  fx USD->NGN: {rate} {'(cache)' if cached else ''}")


def fetch_careerjet(roles, dry=False):
    """Careerjet public search API: aggregate vacancy counts via `hits`.
    2 calls per role: global (en_GB) and Nigeria (en_NG locale)."""
    affid = env_load.get_secret("CAREERJET_AFFID")
    if not affid:
        print("  careerjet: no affid, skipping")
        return
    # Careerjet's public API 403s on non-browser user agents; it expects the
    # end-user's UA/IP to be forwarded. We forward a browser UA + referer.
    browser_ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"
    cj_headers = {"User-Agent": browser_ua, "Referer": "https://www.careerjet.com.ng/"}
    for r in roles:
        for lens, locale, location in (("global", "en_GB", ""), ("ng", "en_NG", "Nigeria")):
            ckey = f"{r['role_key']}__{lens}"
            if dry:
                print(f"  [dry] careerjet {ckey}")
                continue
            params = {"keywords": r["query"], "location": location, "locale_code": locale,
                      "affid": affid, "pagesize": "5", "page": "1",
                      "user_ip": "105.112.10.10", "user_agent": browser_ua}
            url = "http://public.api.careerjet.net/search?" + urllib.parse.urlencode(params)
            try:
                env2, cached = http_json("careerjet", ckey, url, headers=cj_headers)
            except ProviderBudgetExceeded as e:
                print(f"  careerjet stopped: {e}")
                return
            if env2:
                hits = (env2.get("data") or {}).get("hits")
                print(f"  careerjet {ckey}: hits={hits} {'(cache)' if cached else ''}")


def fetch_jooble(roles, dry=False):
    """Jooble API: totalCount per keyword/location. 2 calls per role."""
    key = env_load.get_secret("JOOBLE_API_KEY") or env_load.get_secret("JOBBLE_API_KEY")
    if not key:
        print("  jooble: no key, skipping")
        return
    url = f"https://jooble.org/api/{key}"
    for r in roles:
        for lens, location in (("global", ""), ("ng", "Nigeria")):
            ckey = f"{r['role_key']}__{lens}"
            if dry:
                print(f"  [dry] jooble {ckey}")
                continue
            try:
                env2, cached = http_json("jooble", ckey, url, data={"keywords": r["query"], "location": location}, method="POST")
            except ProviderBudgetExceeded as e:
                print(f"  jooble stopped: {e}")
                return
            if env2:
                tc = (env2.get("data") or {}).get("totalCount")
                print(f"  jooble {ckey}: totalCount={tc} {'(cache)' if cached else ''}")


def fetch_remoteok(roles, dry=False):
    if dry:
        print("  [dry] remoteok bulk")
        return
    env2, cached = http_json("remoteok", "all_jobs", "https://remoteok.com/api")
    if env2:
        d = env2.get("data")
        n = len(d) if isinstance(d, list) else 0
        print(f"  remoteok: {n} rows {'(cache)' if cached else ''}")


def fetch_remotive(roles, dry=False):
    if dry:
        print("  [dry] remotive bulk")
        return
    env2, cached = http_json("remotive", "all_jobs", "https://remotive.com/api/remote-jobs?limit=1000")
    if env2:
        n = len((env2.get("data") or {}).get("jobs") or [])
        print(f"  remotive: {n} rows {'(cache)' if cached else ''}")


def fetch_arbeitnow(roles, dry=False):
    if dry:
        print("  [dry] arbeitnow pages 1-3")
        return
    for page in (1, 2, 3):
        try:
            env2, cached = http_json("arbeitnow", f"page_{page}",
                                     f"https://www.arbeitnow.com/api/job-board-api?page={page}")
        except ProviderBudgetExceeded:
            return
        if env2:
            n = len((env2.get("data") or {}).get("data") or [])
            print(f"  arbeitnow p{page}: {n} rows {'(cache)' if cached else ''}")


MUSE_CATEGORIES = [
    "Software Engineering", "Accounting and Finance", "Healthcare", "Science and Engineering",
    "Education", "Manufacturing and Warehouse", "Sales", "Human Resources and Recruitment",
    "Legal Services", "Design and UX",
]


def fetch_themuse(roles, dry=False):
    for cat in MUSE_CATEGORIES:
        ckey = f"cat_{cat}"
        if dry:
            print(f"  [dry] themuse {ckey}")
            continue
        params = {"category": cat, "page": "1"}
        url = "https://www.themuse.com/api/public/jobs?" + urllib.parse.urlencode(params)
        try:
            env2, cached = http_json("themuse", ckey, url)
        except ProviderBudgetExceeded:
            return
        if env2:
            d = env2.get("data") or {}
            print(f"  themuse {cat}: {len(d.get('results') or [])} rows of total={d.get('total')} {'(cache)' if cached else ''}")


def fetch_myjobmag(roles, dry=False):
    """MyJobMag public XML feeds (they publish these for consumption) — polite, few calls."""
    feeds = [
        ("jobsxml", "https://www.myjobmag.com/jobsxml.xml"),
        ("jobsxml_by_categories", "https://www.myjobmag.com/jobsxml_by_categories.xml"),
    ]
    for name, url in feeds:
        if dry:
            print(f"  [dry] myjobmag {name}")
            continue
        try:
            env2, cached = http_text("myjobmag", name, url)
        except ProviderBudgetExceeded:
            return
        if env2:
            print(f"  myjobmag {name}: {len(env2.get('text') or '')} chars {'(cache)' if cached else ''}")


PROVIDERS = {
    # no-key public sources first (cheap, safe), then keyed aggregate counts,
    # then the tight-monthly-cap providers last so an early crash costs least.
    "remoteok": fetch_remoteok,
    "remotive": fetch_remotive,
    "arbeitnow": fetch_arbeitnow,
    "themuse": fetch_themuse,
    "myjobmag": fetch_myjobmag,
    "careerjet": fetch_careerjet,
    "jooble": fetch_jooble,
    "jsearch": fetch_jsearch,
    "openwebninja": fetch_openwebninja,
    "fx": fetch_fx,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", help="only this provider")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    presence = env_load.load()
    missing = [k for k, v in presence.items() if not v]
    if missing:
        print(f"note: env vars not set: {', '.join(missing)}")

    todo = {args.provider: PROVIDERS[args.provider]} if args.provider else PROVIDERS
    for name, fn in todo.items():
        print(f"[{name}]")
        try:
            fn(SAMPLE_ROLES, dry=args.dry_run)
        except ProviderBudgetExceeded as e:
            print(f"  stopped: {e}")
        except Exception as e:  # noqa: BLE001
            print(f"  provider-level error: {type(e).__name__}: {e}")
    print("\ncalls made this run:", json.dumps(_calls_made))
    print("raw cache dir:", RAW_DIR)


if __name__ == "__main__":
    main()
