# Market Intelligence Backfill — Coverage Report (Sample Run)

Date: 2026-07-16
Scope: 10-role validation sample across ICT, accounting/finance, healthcare,
engineering, education, logistics, sales, HR, legal, product/design.
Output: `_source_extracts/market_intelligence/market_backfill_sample.jsonl` (+ CSV mirror), 30 records = 10 roles × 3 lenses.

## 1. Provider status

| Provider | Status | What it gave us | Calls used | Rate-limit notes |
|---|---|---|---:|---|
| Careerjet API | ✅ working | Aggregate vacancy counts (`hits`) global + Nigeria per role | 20 | Requires browser-style UA + referer + plausible `user_ip`; 403s otherwise. Partner key, be polite (1.2s gap). |
| Jooble API | ⚠️ partial | Global `totalCount` per role. **Nigeria returns 0** — the key is scoped to a non-NG country feed; `ng.jooble.org` 403s with this key | 20 + 3 probes | ~500/day documented. Request an NG-scoped key from Jooble to fix the ng_local gap. |
| JSearch (via OpenWeb Ninja direct API) | ✅ working | 10 postings/role/lens with employer, remote flag, posted date, description (tools/certs mined), O*NET SOC | 21 | RapidAPI host for this key only exposes salary endpoints (`/search` 404s). Direct `api.openwebninja.com/jsearch/search` works after JSearch Basic subscription. Monthly cap — budget 2 calls/role. |
| OpenWeb Ninja realtime-glassdoor-data `/salary-estimation` | ✅ working | Salary min/median/max: US (USD/yr) + Lagos (NGN/mo, annualized ×12) per role | ~25 | `job-salary-data/job-salary` 504s consistently upstream — use the Glassdoor product instead. 19/20 anchors captured (supply_chain_manager NG failed repeatedly). |
| OpenWeb Ninja realtime-finance-data | ✅ working | USD→NGN = 1379.59 (2026-07-16), used for NGN scaling | 1 | One call per run. |
| RemoteOK public API | ✅ working | 101 remote postings snapshot; salary ranges where present | 1 | Bulk endpoint. Quarterly refresh. |
| Remotive public API | ✅ working | 39 postings + candidate-location restrictions ("Worldwide"/"EMEA") | 1 | Bulk endpoint. |
| Arbeitnow public API | ✅ working | 300 postings (3 pages), remote flags | 3 | Bulk. Mostly German market — used for global/remote tags only. |
| The Muse public API | ✅ working | Category totals (e.g. Software Engineering 101,951; Legal 4,429) + 20-job samples | 13 | 2 category names needed fixing (`Science and Engineering`, `Human Resources and Recruitment`, `Manufacturing and Warehouse`). |
| MyJobMag XML feeds | ✅ working | 100-item Nigerian feed; titles matched per role, employers extracted | 2 | Public feeds published for consumption. Polite 3s gap. |
| JSearch RapidAPI host (`jsearch.p.rapidapi.com`) | ❌ for search | Only `/estimated-salary` + `/company-job-salary` exist on this subscription; both return 0 rows | ~30 (mostly wasted before diagnosis) | Do not use for search. Direct OpenWeb Ninja host supersedes it. |
| OpenWeb Ninja job-salary-data | ❌ unusable now | `/job-salary` 504s or returns `{"error":"timeout"}` rows | ~35 | Vendor-side issue. The Glassdoor salary-estimation endpoint returns the same figures reliably — consider cancelling this subscription. |

### Other subscribed OpenWeb Ninja products (evaluated, not yet integrated)
- **real-time-jobs-data** (`/realtime-jobs-data/google-jobs/search` + `/glassdoor/*`): **recommended as the workhorse for scale-up** — Google-for-Jobs postings incl. `country=ng`, `work_from_home`, `job_onet_soc`, plus the same Glassdoor salary endpoint under one quota.
- **realtime-glassdoor-data company endpoints**: employer enrichment (size, industry, rating) for top-employer records — second-pass, dedupe employers across roles first.
- **Not useful for this platform**: localbusinessdata (Maps POI), local-rank-tracker (SEO), real-time-forums-search (anecdotal), web-unblocker (keep dormant as scraping fallback), realtimenewsdata (optional flavor text later).

## 2. Field coverage (30 records)

| Field | Coverage | Notes |
|---|---:|---|
| posting_volume_score | 30/30 | ng_remote often 0 for non-tech roles — real signal (remote boards are tech-skewed), documented in limitations |
| value_score | 29/30 | Missing: supply_chain_manager/ng_local (upstream 504) |
| growth_or_recency_score | 26/30 | Missing where no dated postings matched (4 ng_remote records) |
| remote_access_score | 26/30 | Same ng_remote no-match records |
| employer_diversity_score | 26/30 | Same |
| top_tools | 30/30 | Mined from posting text; falls back to O*NET domain tools |
| top_certifications | 30/30 (may be empty list) | Regex-mined: ICAN, ACCA, COREN, NMCN, TRCN, PMP, AWS, etc. |
| top_employers | 26/30 | From JSearch + MyJobMag + remote boards |
| salary min/max/median | 29/30 | US anchor for global/ng_remote; Lagos NGN (annualized) for ng_local |
| source_confidence | 30/30 | high=multi-source+salary; medium=2 sources; low=thin ng_remote match |
| provenance/source URLs | 30/30 | Per-source metric + URL + redistributability class in `sources` array |
| evidence window + refreshed_at | 30/30 | 2026-06-16 → 2026-07-16 (date_posted=month) |
| notes_on_limitations | 30/30 | |

## 3. Known gaps & fixes

1. **Jooble Nigeria = 0**: key is not NG-scoped. Fix: request Nigeria API key from Jooble (they issue per-country keys), or rely on Careerjet NG + MyJobMag counts (both working).
2. **ng_remote for non-tech roles**: RemoteOK/Remotive/Arbeitnow are tech-heavy; nurse/lawyer/civil engineer legitimately score ~0. This is real market signal, not missing data — the in-product label should say "limited remote pathway" rather than hide the row.
3. **Growth is a recency proxy**: single snapshot; true growth needs quarterly snapshots (schema already separates `growth_or_recency_score` and documents the proxy in limitations).
4. **supply_chain_manager ng_local salary**: retry later (endpoint 504s); or fall back to MyJobMag salary-blog tables / Robert Walters guide (manual annual anchors).
5. **Glassdoor NGN figures are Lagos-anchored** and monthly→annualized ×12; provincial salaries will be lower. Noted per record.

## 4. What is safe to show in-product

| Safe now | Show with caution | Do not show |
|---|---|---|
| All five 0–100 scores (derived, redistributable) | Salary bands (derived aggregates; cite "market estimate, Glassdoor-derived" + as-of date) | Raw Glassdoor rows/reviews (ToS) |
| Quadrant labels (Broad demand/Elite pathway/etc.) | Top employers (factual, but small sample n=10-100/role — label as "examples of recent employers") | Raw JSearch job descriptions (restricted) |
| Top tools/certs (mined signals + O*NET) | ng_remote scores for non-tech roles (needs "thin evidence" badge from `source_confidence`) | Careerjet/Jooble raw listing content (aggregate counts only) |
| Aggregate posting counts with provenance | Recency score labeled as "recent activity", NOT "growth" until we have 2+ quarterly snapshots | |

## 5. Scale-up plan agreed with owner (2026-07-16)

Owner will create multiple API keys; extraction must cover **domain, subgroup, and role levels** with deduplication:

- **Dedup design**: one query registry keyed by `(provider, canonical_query, lens)`. Many roles share aliases (e.g. "sales manager" appears in D030 and D031) — the registry maps each unique query string to ALL (role_id, domain_id) consumers, so each query is fetched once and fanned out. Cache keys already make refetches free within a day; the registry extends this across the whole sweep.
- **Roll-up**: role → subgroup → domain aggregation happens offline from role-level records (`_score_domains.py` pattern), so subgroup/domain records cost zero extra API calls where role data exists; domains with sparse role coverage get one direct domain-alias query as fallback.
- **Bulk-first**: RemoteOK/Remotive/Arbeitnow/The Muse/MyJobMag downloads already cover ALL 4,703 roles via offline matching — no per-role calls needed.
- **Keyed spend**: Careerjet+Jooble for counts (2/query), JSearch or real-time-jobs-data for posting detail, Glassdoor salary-estimation for anchors. With ~2,800 unique canonical queries expected after aliasing dedup (from 4,703 roles), a multi-key pool at ~500/day/key needs ~3-4 keys per provider for a 2-3 day sweep.
