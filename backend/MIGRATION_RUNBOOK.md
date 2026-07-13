# Career Intelligence — Migration & Seed Runbook

Single source of truth for standing up the career-intelligence schema + data on
Supabase (schema `skillup_dev`). Everything is idempotent (uuid5 ids + `ON
CONFLICT` / `IF NOT EXISTS`), so every file is safe to re-run.

The Supabase REST keys in `.env` cannot run DDL — use the **Supabase Dashboard →
SQL Editor** (paste + run each file) or **psql** with the DB connection string
(Project Settings → Database → Connection string).

```
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -f <file>
```

## Run in THIS order

### A. Migrations (schema — DDL)

| # | File | Creates / alters | Depends on |
|---|------|------------------|------------|
| 1 | `migration_career_v2.sql` | Drops the empty pre-sweep taxonomy tables and recreates the post-sweep shape: `domains`, `domain_subgroups`, `domain_roles`, `domain_tools`, `domain_certifications`, `programme_domain` (incl. `in_demand_score`, `elite_flag`), `programme_role_score`, `jamb_programme_domain`, `domain_overlap`; user tables `saved_items`, `user_notes` (+`category`,`entity_label`), `opportunity_subscriptions`; `mapping_feedback`, `enrichment_version`; **`institution_members`** (admin/educator → school link, powers the school-scoped admin dashboard + admin-only peer rule); **and the demand tables `domain_demand_metrics`, `role_demand_metrics`** (moved here from the superseded `migration_career_intelligence.sql` so one runbook builds the whole schema). Preserves all non-career user tables. | the base app schema (`users`, `programmes`, `schools`, `jamb_programmes` from the pilot migration) |
| 2 | `migration_admission_intelligence.sql` | Phase 8 admission tables: `national_jamb_floor`, `programme_school_cutoff`, `school_aggregate_formula`, `course_competitiveness`, `admission_snapshot_version`. | #1 (FK `schools`, `programmes`) |
| 3 | `migration_enrichment_v1.sql` | Phase 9 enrichment **columns** (additive) on `domain_certifications` (official_url, seniority_tier, tier_type, price, currency, price_as_of, price_source), `domains`/`domain_subgroups`/`domain_roles` (skill-URI JSONB), `domain_tools` (demand_score, demand_source, demand_as_of, tool_url), `domain_roles` (currency_status, currency_verified_at, currency_source). | #1 and #2 |
| 4 | `migration_user_feedback.sql` | Phase 12 `user_feedback` table (admin inbox + ReviewModal). | the base `users` table |

> **Do NOT run `migration_career_intelligence.sql`.** It is superseded — its
> demand tables now live in `migration_career_v2.sql` (#1). Running it after #1
> is harmless (`IF NOT EXISTS`) but unnecessary. It is kept only for history.

### B. Seeds (data — DML, run AFTER all migrations)

| # | File | Rows | Depends on |
|---|------|------|------------|
| 5 | `seed_career_pilot.sql` | programmes, schools, `jamb_programmes`, `programme_mapping`, `school_programmes`, `programme_subject_requirements` | migrations A |
| 6 | `seed_career_v2.sql` | 168 domains · 278 sub-groups · 4,092 roles · 7,393 tools · 508 certs · 2,528 programme→domain · 70,560 readiness · 5,573 JAMB→domain · 4,112 overlap. **Gitignored (~39 MB)** — regenerate with `python data/career-mapping/_gen_career_seed.py`. | #5 (FK programmes/jamb) |
| 7 | `seed_phase8_9_enrichment.sql` | Admission pilot rows (cut-offs, formulas, competitiveness, floor, snapshot) + Phase 9 enrichment `UPDATE`s (cert URLs/prices, tool demand, skill URIs, role currency) + `enrichment_version` stamps. Regenerate with `python data/career-mapping/_gen_enrichment_seed.py`. | migrations A + #6 (updates taxonomy rows) |

## Smoke test (after A + B)

```
cd backend && uv run uvicorn main:app --reload      # terminal 1
uv run python _smoke_phase5.py                        # terminal 2 (expects status:"real")
```

Asserts `real` (not `coming_soon`) for: a programme's domains, a domain detail
(sub-groups/tools/gateway certs), a role search, a JAMB→domains lookup, a pivot,
and — once Phase 1 S2 ships — a saved-item round-trip.

## Rollback

Re-running `migration_career_v2.sql` re-drops+recreates the 11 taxonomy/demand
tables empty, leaving user data intact. To fully remove: `DROP TABLE` those
tables in `skillup_dev`.

## Note on demand + enrichment data

Migrations create the demand tables and enrichment columns, but the **data** is
seeded thin (pilot samples). Full demand ingestion (monthly cron) and
enrichment-at-scale land in **Phase 2** of the build. Endpoints degrade
gracefully (`coming_soon` / honest-empty) until then.
