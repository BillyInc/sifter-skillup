# Data Fetch Plan — 2026-07-16

Priority-ordered plan to replace derived/labelled data with real data.
Credentials: load from `.env` / `backend/.env` only — never print or commit.
All fetchers live in `data/career-mapping/_market_intelligence/` and cache raw
responses under `_source_downloads/market_intelligence/<provider>/<date>/`.

## P1 — Domain-level demand sweep (days; free/cheap quotas)

Goal: replace every `source_confidence='low'` DOMAIN baseline with real counts.
~160 live domains × 2 lenses (global, ng) on the proven providers:

| Provider | Calls | Quota notes |
|---|---|---|
| Careerjet (hits count) | ~320 | free, throttle ~1/s, worked well in sample |
| Jooble global count | ~320 | free key, worked in sample; NG-locale key still pending |
| JSearch (global + remote share) | ~200 (top domains only) | 200 req/mo free tier — spend on the 60 highest-traffic domains |
| Glassdoor salary anchors | ~330 (165 representative roles × US/Lagos) | RapidAPI metered — batch carefully |
| FX rate | 1 | exchangerate.host |

Output: `domain_demand_real.jsonl` → regenerate `seed_demand_baseline.sql`
(real rows upsert over derived rows on the same `(domain_id, lens, month)` key;
confidence low→medium/high automatically).

## P2 — Role-level sweep (1–2 weeks; needs multi-key rotation)

Goal: real demand for the ~4,000 unsampled roles.
- Query-dedup registry first: collapse role aliases → **~2,800 unique queries**
  (saves ~30% of calls).
- Provider: real-time-jobs-data (`country=ng`, `work_from_home=true` variant)
  + Careerjet global for the volume side.
- Budget: ~2,800 × 3 lenses ≈ 8,400 calls → needs key rotation or a paid month;
  schedule as a background drip (~300/day ≈ 4 weeks on free keys, or 3 days paid).
- This run is also **monthly snapshot #1** — snapshot #2 unlocks real
  postings_yoy / trend_pct and replaces the WEF-only growth signal.

## P3 — Annual / manual (calendar-gated)

| Item | When | Source |
|---|---|---|
| Cut-offs 10 → 50 universities | Dec–Jan (post-UTME) | university portals, MySchoolGist-class aggregators; verify each against the school's own page |
| School aggregate formulas for the same 50 | Dec–Jan | school admission pages |
| BLS OEWS salary structure (global anchor refresh) | May release | bls.gov bulk files |
| Stack Overflow developer survey (tech salary/stack) | Jul–Aug release | survey.stackoverflow.co |
| Robert Walters / Hays NG salary guide | annual PDF | manual extraction |
| Cert prices + URLs (489 remaining) | quarterly batches of ~60 | issuing-body pages (already cached in `_source_downloads/prof_body_pages/`) |
| Jooble NG-locale key | whenever granted | jooble.org partner request — unblocks ng_local counts at domain level |
| supply_chain_manager ng_local salary retry | with P1 run | provider had a transient failure in the sample |

## P4 — Recurring refresh loop

- **Monthly**: demand snapshot (P2 pipeline re-run, small delta cost once the
  registry exists) → real trend lines after month 2.
- **Quarterly**: bulk remote boards (RemoteOK/Remotive/Arbeitnow/Muse/MyJobMag)
  + Careerjet/Jooble counts + cert-price batch.
- **Annually**: P3 items; JAMB brochure re-extraction when the new brochure
  drops (programme names, subjects, institutions).

## Explicitly NOT fetch items

- IBASS scraping — **removed**: the JAMB brochure already carries
  institution-specific programme naming and it is extracted and seeded.
- Elite pathways / opportunities / scholarships — needs schema + routes first.
- Polytechnic/NCE curricula (L0) — manual extraction project, deferred with the
  non-university pipeline.
- Demo/test accounts — owner decision: live accounts only.
