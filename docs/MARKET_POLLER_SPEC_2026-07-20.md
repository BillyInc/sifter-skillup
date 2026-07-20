# MARKET POLLER SPEC — Background Demand/Role Population (2026-07-20)

Audience: a Claude Code/Codex session implementing this. Companion to
`HANDOFF_REMAINING_WORK_2026-07-20.md` (§2.6). Read `CLAUDE.md` first.

## Goal

A backend background service that **progressively replaces the derived demand
baseline** (`source_confidence='low'`, method `taxonomy_derived`) in
`domain_demand_metrics` / `role_demand_metrics` with **real API data**, for
160 live domains and ~4,000 live roles × 3 lenses (`global`, `ng_remote`,
`ng_local`).

Owner requirement: results land in **JSON files first** (the DB populate step
reads those files) — never write API responses straight to the DB. This keeps
every run replayable, auditable, and quota-safe.

## Architecture (use what exists — do not introduce new infra)

- **Celery + Redis** are already in the stack (`backend/celery_worker.py`,
  docker-compose services `celery worker` + `celery beat`). Add tasks there.
- Raw HTTP caching convention (already established, REUSE IT):
  `data/career-mapping/_source_downloads/market_intelligence/<provider>/<YYYY-MM-DD>/<key>.json`
  with envelope `{"_meta": {"provider", "key", "url", "fetched_at"}, "data": <json>}`
  (or `"text"` for XML/HTML). Never refetch a key that exists for today's date.
- New module: `backend/market_poller/` —
  - `providers.py` — one thin client per provider (below), all reading keys from env.
  - `registry.py` — the query-dedup registry (below).
  - `tasks.py` — Celery tasks + beat schedule.
  - `extract.py` — cache → normalized JSONL records.
  - `emit_sql.py` — JSONL → idempotent upsert SQL (reuse the exact column lists,
    uuid5 namespace `5c1f7e00-0000-4000-8000-0000ca4ee401`, and `ON CONFLICT
    (role_id, rank_lens, month)` / `(domain_id, rank_lens, month)` keys from
    `data/career-mapping/_market_intelligence/gen_demand_baseline.py` — read that
    file before writing any code; it is the reference for scoring and row shape).

## Secrets (verbatim, non-negotiable)

- Load provider credentials from `.env` / `backend/.env` only. Do not print secrets.
- Verify no generated output (JSON, SQL, logs) contains API keys — the raw-cache
  envelope stores the URL: **strip key/apikey/token query params before saving**.

## Providers & budgets (all previously proven in the sample run)

| Provider | Env var | Use for | Budget/quirks |
|---|---|---|---|
| Careerjet | `CAREERJET_AFFID` | hits count, global+ng | free, throttle ≥1s, worked well |
| Jooble | `JOOBLE_API_KEY` | count, global | free; NG-locale key still pending — when granted add `JOOBLE_NG_API_KEY` |
| JSearch (RapidAPI) | `RAPIDAPI_KEY` | postings+remote share | ~200 req/mo free — spend ONLY on top-60 domains |
| OpenWebNinja real-time-jobs-data (RapidAPI) | `RAPIDAPI_KEY` | role-level sweep, `country=ng` + `work_from_home` | metered; the P2 workhorse |
| Glassdoor (RapidAPI) | `RAPIDAPI_KEY` | salary anchors (US + Lagos) | metered; batch carefully |
| RemoteOK / Remotive / Arbeitnow / TheMuse | none | bulk remote boards | free, quarterly refresh |
| MyJobMag | none | NG feed (XML) | free, quarterly |
| exchangerate.host | none | USD→NGN | 1 call/run |

Known quirk backlog: retry `supply_chain_manager` ng_local salary (transient
provider failure in the sample run).

## The query-dedup registry (build FIRST)

`data/career-mapping/_market_intelligence/query_registry.json`:
- Collapse the ~4,000 role names + aliases (`also_known_as`) into **~2,800 unique
  query strings**; map `query -> [role_key...]`. One API call fans out to every
  role sharing the query.
- Domain queries: 1 representative query per domain (pick the highest-role_count
  role name, or the domain name if clearer) → `domain_query -> domain_key`.
- Registry is committed to the repo; regeneration is deterministic
  (`python -m market_poller.registry` from `backend/`).

## Phases & cadence (Celery beat)

**P1 — domain sweep (run first, ~days):** 160 domains × 2 lenses on Careerjet +
Jooble global (~640 calls) + JSearch top-60 domains (~120) + Glassdoor salary for
~165 domain-representative roles × US/Lagos (~330). Drip at ≤1 call/2s per
provider; a nightly task processes ~100 queries/provider until the sweep completes.

**P2 — role sweep (after P1):** the 2,800 registry queries on OpenWebNinja
(`country=ng`, and `work_from_home=true` for ng_remote) + Careerjet global.
Drip ~300 queries/day ≈ 10 days/provider pass. This run is **monthly snapshot #1**.

**P3 — recurring:** monthly re-run of P2 (snapshot N — from snapshot 2 compute real
`postings_yoy`/`trend_pct`); quarterly bulk-board refresh (RemoteOK etc.) + P1.

## Output files (the deliverable the DB populate reads)

All under `data/career-mapping/_source_extracts/market_intelligence/`:
1. `domain_demand_real.jsonl` — one record per (domain_key, lens):
   `{domain_key, lens, month, postings_count, remote_pct, salary_min, salary_max,
   salary_currency, volume_score, value_score, top_employers[], sources[
   {source, url, metric, value, fetched_at}], source_confidence}`
2. `role_demand_real.jsonl` — same shape keyed by `role_key` (`"D001|software developer"`).
3. `poller_state.json` — per-provider cursor: `{provider: {last_query_index,
   calls_today, date, completed: bool}}` so runs resume, never re-spend quota.

Scoring: reuse `gen_demand_baseline.py`'s `log_score`, `band`, `quadrant`,
`QUAD_LABEL` verbatim (import or copy — do not invent new scales).
Confidence rules: ≥2 independent posting sources + salary anchor → `high`;
1 source or no salary → `medium`. NEVER emit `low` from this pipeline (low is
reserved for the derived baseline). Honesty rules: `postings_count` only when it
is a real count; yoy/trend NULL until snapshot 2.

## DB populate step (manual trigger, not automatic)

`python -m market_poller.emit_sql` → `backend/seed_demand_real_<YYYY-MM>.sql`
upserting over the baseline rows (same deterministic ids ⇒ same
`(role_id/domain_id, rank_lens, month)` conflict keys), plus provenance INSERTs
into `market_metric_sources`. The owner applies the SQL (psql), then
`RUN_PIPELINE.bat check` must still pass, plus one new check to add to
`backend/_verify_seed.py`: count of `source_confidence != 'low'` rows strictly
increases after each apply.

## Acceptance criteria

1. `docker-compose up -d` starts the beat schedule; tasks drip within budgets;
   killing and restarting mid-sweep loses no progress (poller_state.json).
2. Raw cache envelopes contain no secrets (grep for the key values — automated
   test with a fake key in CI).
3. After P1 apply: all 160 domains × global+ng_local carry `medium|high`
   confidence with a `sources[]` trail; app demand strips drop the
   "estimated" label for those lenses.
4. After P2 apply: ≥70% of roles carry at least one real lens row.
5. Derived rows remain untouched wherever real data is still missing (the app
   always has a complete, labelled surface).



claude --resume 79e5a0af-9981-4bef-85da-ddc5548446ea --- level up

claude --resume 5008f21f-0fc3-4ace-94c6-d11abf98d854 -- kys fetcher