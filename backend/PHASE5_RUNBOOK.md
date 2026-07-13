# Phase 5 — Apply the career taxonomy to Supabase

Everything below is generated/validated. Two files must be run against your
Supabase Postgres **in order**, then the smoke test confirms the endpoints serve real data.

## What was built
- `migration_career_v2.sql` — schema (drops the EMPTY pre-sweep taxonomy tables, recreates
  the post-sweep shape; preserves all user tables). Idempotent.
- `seed_career_v2.sql` — data (168 domains · 278 sub-groups · 4092 roles · 7393 tools ·
  508 certs · 2528 programme→domain · 70560 readiness rows · 5573 JAMB→domain · 4112 overlap).
  Idempotent (uuid5 + ON CONFLICT). **Gitignored** (39 MB build artifact — regenerate with
  `python data/career-mapping/_gen_career_seed.py`).
- `routes/career_routes.py` — endpoints: `/domains/{key}`, `/roles/{key}`, extended
  `/programmes/{id}`, `/search`, `/jamb/{name}/domains`, `/pivot`.
- `src/types/career.ts` — v2 contract (additive; `tsc` clean).

## Step 1 — apply schema + seed (Supabase SQL Editor OR psql)
The Supabase REST keys in `.env` can't run DDL, so use one of:

**A. Supabase Dashboard → SQL Editor** (simplest)
1. Paste + run `backend/migration_career_v2.sql`.
2. Paste + run `backend/seed_career_v2.sql` (39 MB — if the editor rejects the size,
   use option B).

**B. psql with the DB connection string** (Supabase → Project Settings → Database → Connection string)
```
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
  -f backend/migration_career_v2.sql
psql "postgresql://..." -f backend/seed_career_v2.sql
```
Both are idempotent — safe to re-run.

## Step 2 — live smoke test (after Step 1)
```
cd backend && uv run uvicorn main:app --reload      # terminal 1
python backend/_smoke_phase5.py                       # terminal 2
```
Expects `status: "real"` (not coming_soon) for: Computer Science programme domains,
Quantitative Finance domain (sub-groups + tools + gateway certs), "machine learning
engineer" search, Criminology pivot.

## Rollback
Re-running the migration re-drops+recreates the taxonomy tables (empty), leaving user
data intact. To fully remove: `DROP TABLE` the 9 taxonomy tables in `skillup_dev`.
