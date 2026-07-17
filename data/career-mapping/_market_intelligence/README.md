# Market Intelligence Pipeline

Reproducible backfill for role/domain market-intelligence records across three
lenses: `global`, `ng_remote`, `ng_local`.

## Files

| File | Purpose |
|---|---|
| `env_load.py` | Loads provider keys from repo `.env` / `backend/.env` only. Never prints values. Run directly to check presence. |
| `sample_roles.py` | The 10-role validation sample with aliases and match terms. |
| `fetch_market.py` | Cache-first, rate-limited fetcher. Every response saved immediately to `_source_downloads/market_intelligence/<provider>/<date>/`. Re-runs skip cached calls (free). |
| `normalize_market.py` | Offline normalizer -> `_source_extracts/market_intelligence/market_backfill_sample.jsonl` + `.csv`. No network. |
| `COVERAGE_REPORT_2026-07-16.md` | Source coverage, gaps, in-product safety table. |

## Run

```bash
cd data/career-mapping/_market_intelligence
python env_load.py                      # verify keys present (no values printed)
python fetch_market.py --dry-run        # show planned calls
python fetch_market.py                  # fetch all providers (cache-first)
python fetch_market.py --provider jooble  # one provider only
python normalize_market.py              # rebuild normalized records (offline)
```

Fetch order is cheapest-first (public bulk feeds, then keyed counts, then
monthly-capped providers) so an interruption costs the least quota.

## Rate limits (encoded in `PROVIDER_LIMITS` in fetch_market.py)

| Provider | Gap between calls | Per-run cap | Real-world limit |
|---|---:|---:|---|
| RemoteOK/Remotive | 2s | 2 | none documented, be polite |
| Arbeitnow | 1.5s | 4 | none documented |
| The Muse | 1.2s | 12 | 3600/hr documented |
| MyJobMag feeds | 3s | 6 | public feed, be polite |
| Careerjet | 1.2s | 25 | partner key; needs browser UA+referer+user_ip or 403 |
| Jooble | 1.2s | 25 | ~500/day; **key is country-scoped** (current key: no NG results) |
| JSearch (OpenWeb Ninja direct) | 2s | 22 | Basic plan monthly cap — 2 calls/role |
| Glassdoor salary (OpenWeb Ninja) | 2s | 30 | free tier ~100/mo hard |
| FX (OpenWeb Ninja finance) | 2s | 2 | 1 call/run |

A 401/403/429 opens a circuit breaker for that provider (other providers
continue). Timeout rows are never cached, so re-running retries only the gaps.

## Refresh cadence

### Quarterly (posting volume, recency, remote access, employers)
1. `python fetch_market.py` — new date folder = fresh snapshot; old snapshots
   are kept, giving you a growing time series.
2. `python normalize_market.py`
3. After 2+ snapshots, replace the recency proxy in
   `growth_or_recency_score` with real delta between snapshots.

### Annual (salary anchors, taxonomy, WEF/O*NET/ESCO)
1. Re-run the `openwebninja` + `fx` providers (salary anchors).
2. Bump O*NET/ESCO/WEF source files under `_source_downloads/taxonomy/`.
3. Manual anchors: BLS OEWS (browser download), Robert Walters Africa Salary
   Survey, MyJobMag annual reports, Stack Overflow survey.
4. Review `CERT_PATTERNS` / `TOOL_PATTERNS` in normalize_market.py for new
   tools/certs worth mining.

## Scale-up beyond the sample (agreed plan)

- Build a **query registry** `(provider, canonical_query, lens) -> [role_ids]`
  from role aliases before fetching — each unique query fetched once, results
  fanned out to all consuming roles/subgroups/domains. Prevents duplicate
  spend on shared aliases.
- Bulk sources (RemoteOK/Remotive/Arbeitnow/Muse/MyJobMag) cover ALL roles via
  offline matching, zero extra calls.
- Keyed sweeps run role-level for priority roles, alias-level otherwise;
  subgroup/domain records are offline roll-ups of role records.
- Multiple API keys: put keys in `.env` as `JOOBLE_API_KEY_2`, etc., and
  extend `env_load.SECRET_NAMES` + a key-rotation list in the fetcher.

## Safety rails

- No secrets are ever printed or persisted: responses are scrubbed against all
  loaded key values before caching; provenance URLs have key params masked.
- Verify with: `python env_load.py` (presence only) and the secret scan in the
  coverage workflow: grep raw+extract dirs for each key value (done 2026-07-16, clean).
- Raw restricted content (full job descriptions from keyed APIs) stays in
  `_source_downloads/` (gitignore-check before committing); normalized extracts
  contain only derived fields, counts, and short provenance references.
