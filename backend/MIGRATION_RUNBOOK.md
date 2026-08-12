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
| 0 | `supabase-schema.sql` | Base app tables, especially `skillup_dev.users`. | none |
| 1 | `backend/migration_v2.sql` | Adds auth/session/game/feed/profile columns and tables used by backend v2. | #0 |
| 2 | `backend/migration_v2_atomic.sql` | Helper functions and RLS cleanup for backend-only tables. | #1 |
| 3 | `backend/migration_career_base_registry.sql` | Stable base career registry: `schools`, `programmes`. | #0 |
| 4 | `backend/migration_career_pilot.sql` | JAMB programme registry, JAMB↔programme mapping, school programme offerings, textual subject requirements. | #3 |
| 5 | `backend/migration_career_v2.sql` | Drops the empty pre-sweep taxonomy tables and recreates the post-sweep shape: `domains`, `domain_subgroups`, `domain_roles`, `domain_tools`, `domain_certifications`, `programme_domain` (incl. `in_demand_score`, `elite_flag`), `programme_role_score`, `jamb_programme_domain`, `domain_overlap`; user tables `saved_items`, `user_notes` (+`category`,`entity_label`), `opportunity_subscriptions`; `mapping_feedback`, `enrichment_version`; **`institution_members`**; demand tables `domain_demand_metrics`, `role_demand_metrics`. | #3 and #4 |
| 6 | `backend/migration_admission_intelligence.sql` | Phase 8 admission tables: `national_jamb_floor`, `programme_school_cutoff`, `school_aggregate_formula`, `course_competitiveness`, `admission_snapshot_version`. | #5 |
| 7 | `backend/migration_enrichment_v1.sql` | Phase 9 enrichment **columns** (additive) on `domain_certifications`, `domains`/`domain_subgroups`/`domain_roles`, and `domain_tools`. | #5 and #6 |
| 8 | `backend/migration_market_intelligence_v1.sql` | Source registry, market metric provenance, posting windows, value/demand bands and volume x value quadrants. | #5 |
| 9 | `backend/migration_provisioning.sql` | Institution provisioning, school codes, claim codes, student affiliations/consents, merge candidates. | #5 |
| 10 | `backend/migration_student_pipeline_live.sql` | Student starting points, selected subjects, structured subject options, pathway choices, JAMB/cutoff views. | #4, #6, #9 |
| 10a | `backend/migration_ss3_secondary_starting_point_patch.sql` | Existing-project patch that allows the split `ss3_secondary` starting-point type. | #10 |
| 11 | `backend/migration_institution_team_access.sql` | Extends `institution_members` with scoped seats, creates `institution_member_invites`, and supports multiple officials per school/university/tutorial centre. | #5 and #9 |
| 12 | `backend/migration_user_feedback.sql` | Phase 12 `user_feedback` table (admin inbox + ReviewModal). | #0 |

> **Do NOT run `migration_career_intelligence.sql`.** It is superseded and mixed
> obsolete taxonomy tables with the base `schools`/`programmes` registry. Use
> `migration_career_base_registry.sql` instead.

### B. Seeds (data — DML, run AFTER all migrations)

| # | File | Rows | Depends on |
|---|------|------|------------|
| 13 | `backend/seed_career_pilot.sql` | programmes, schools, `jamb_programmes`, `programme_mapping`, `school_programmes`, `programme_subject_requirements` | migrations #4 |
| 14 | `backend/seed_career_v2.sql` | 168 domains · 278 sub-groups · 4,092 roles · 7,393 tools · 508 certs · 2,528 programme→domain · 70,560 readiness · 5,573 JAMB→domain · 4,112 overlap. **Gitignored (~39 MB)** — regenerate with `python data/career-mapping/_gen_career_seed.py`. | #13 |
| 15 | `backend/seed_phase8_9_enrichment.sql` | Admission pilot rows (cut-offs, formulas, competitiveness, floor, snapshot) + Phase 9 enrichment `UPDATE`s. Regenerate with `python data/career-mapping/_gen_enrichment_seed.py`. | #13 and #14 |

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
