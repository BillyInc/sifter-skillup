# Career Intelligence — Migration & Seed Runbook

Single source of truth for standing up the career-intelligence schema + data on
Supabase (schema `skillup_dev`). Additive migrations are safe to re-run. The
subject-option seed is a deliberate replacement transaction: it deletes and
rebuilds the national matcher rows, so treat it as a controlled refresh on an
existing database.

The Supabase REST keys in `.env` cannot run DDL — use the **Supabase Dashboard →
SQL Editor** (paste + run each file) or **psql** with the DB connection string
(Project Settings → Database → Connection string).

```
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -f <file>
```

## Current career refresh since the last push (2026-08-26)

The current preview SQL is transported in compressed, ordered parts:

`backend/seed_career_v2_preview_2026-08-25_parts_gz/`

The local generator output remains
`backend/seed_career_v2_preview_2026-08-25.sql`; the compressed parts exist so
the generated artifact can pass repository file-size limits. Each `.sql.gz`
part is below 41 MB compressed and contains complete SQL statements in order.

This is a development preview seed, not a migration and not the production
seed. It exists so the corrected subgroup labels and the current Nigerian
context/provenance payload can be inspected in a controlled development
database while role-level Nigerian enrichment is still incomplete. It contains
all current domain, subgroup and role rows, but it is explicitly marked as
unresolved and must not be applied to production.

### Correct order for the career preview

On an empty or explicitly approved staging database, apply the applicable
schema files in this order before the preview seed:

1. `backend/migration_career_base_registry.sql`
2. `backend/migration_subject_catalog.sql`
3. `backend/migration_career_pilot.sql`
4. `backend/migration_subject_rule_records.sql`
5. `backend/migration_career_v2.sql` — staging/empty taxonomy rebuild only
6. `backend/migration_admission_intelligence.sql`
7. `backend/migration_role_tools.sql`
8. `backend/migration_source_backed_career_layers.sql`
9. `backend/migration_enrichment_v1.sql`
10. `backend/migration_market_intelligence_v1.sql`
11. `backend/migration_role_detail_enrichment.sql` when role-owned
    certification/detail data is being used
12. `backend/migration_career_resources_v1.sql` when resource data is being
    used
13. `backend/migration_saved_resource_support.sql` after `saved_items` exists
14. Decompressed preview SQL parts in
    `backend/seed_career_v2_preview_2026-08-25_parts_gz/`, in numeric order

The `.sql.gz` files are not executable by Supabase. Before applying the
preview, decompress/reassemble them from the repository root:

```powershell
python data/career-mapping/split_large_artifacts.py join-sql `
  backend/seed_career_v2_preview_2026-08-25_parts_gz/manifest.json `
  backend/seed_career_v2_preview_2026-08-25.sql
```

Then pass the decompressed SQL file to `psql`, or decompress and run each
numbered part separately in the Supabase SQL Editor. Do not paste the `.gz`
bytes into Supabase. Each part is a complete transaction and must be applied
in numeric order.

The preview must not be run before `migration_source_backed_career_layers.sql`:
its domain, subgroup, role and tool inserts use the source-confidence,
data-state, provenance and Nigerian-context columns created by that migration.
It must not be run before `migration_role_tools.sql` because role-scoped tool
rows use `domain_tools.role_id` and the `scope='role'` constraint.

Do not apply the preview to a populated production database. The Nigerian
population gate currently remains closed because unresolved role evidence is
still represented explicitly. When role enrichment is complete, regenerate a
new production seed, rerun the provenance/reconciliation gates, and update this
runbook rather than promoting this preview by renaming it.

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
| 5a | `backend/migration_saved_resource_support.sql` | Adds `resource` as a saveable My World entity. Resource identity is its canonical URL; no resource is fabricated when no URL exists. | After #5 |
| 6 | `backend/migration_admission_intelligence.sql` | Phase 8 admission tables: `national_jamb_floor`, `programme_school_cutoff`, `school_aggregate_formula`, `course_competitiveness`, `admission_snapshot_version`. | #5 |
| 7 | `backend/migration_role_tools.sql` | Adds role-owned tools and enforces the domain/subgroup/role tool boundary. | #5 |
| 8 | `backend/migration_source_backed_career_layers.sql` | Adds source confidence, data state, provenance, Nigerian context and cross-domain role-family layers. | #5 and #7 |
| 9 | `backend/migration_enrichment_v1.sql` | Phase 9 enrichment **columns** (additive) on `domain_certifications`, `domains`/`domain_subgroups`/`domain_roles`, and `domain_tools`. | #5 and #6 |
| 10 | `backend/migration_market_intelligence_v1.sql` | Source registry, market metric provenance, posting windows, value/demand bands and volume x value quadrants. | #5 |
| 11 | `backend/migration_role_detail_enrichment.sql` | Role-owned certification/detail tables. | #5 and #7 |
| 12 | `backend/migration_career_resources_v1.sql` | Source-backed learning-resource table and indexes. | #5 and #8 |
| 13 | `backend/migration_provisioning.sql` | Institution provisioning, school codes, claim codes, student affiliations/consents, merge candidates. | #5 |
| 14 | `backend/migration_student_pipeline_live.sql` | Student starting points, selected subjects, structured subject options, pathway choices, JAMB/cutoff views. | #4, #6, #13 |
| 14a | `backend/migration_ss3_secondary_starting_point_patch.sql` | Existing-project patch that allows the split `ss3_secondary` starting-point type. | #14 |
| 14b | `backend/migration_guidance_report_paths.sql` | Durable, account-scoped selected guidance paths used by student and admin-guided reports. | #13 and #14 |
| 15 | `backend/migration_institution_team_access.sql` | Extends `institution_members` with scoped seats, creates `institution_member_invites`, and supports multiple officials per school/university/tutorial centre. | #5 and #13 |
| 16 | `backend/migration_user_feedback.sql` | Phase 12 `user_feedback` table (admin inbox + ReviewModal). | #0 |
| 17 | `backend/migration_school_identity.sql` | Adds address fields and unique readable school affiliation codes for same-name disambiguation. | #13 |
| 18 | `backend/migration_goal_apply_now.sql` | Consolidated additive patch for auth compatibility, legacy account routing support, school identity, affiliation, provisioning, claim codes and account deletion. | base `users` + `schools` tables |
| 19 | `backend/migration_institution_verification_proof.sql` | Adds institution proof-submission metadata and the private verification-proofs storage bucket. | #18 + Supabase Storage |

The consolidated patch adds `users.account_type_selected_at`. This is required
to distinguish an old completed account that inherited the historical `student`
default from a student who explicitly selected that persona. Apply it before
testing login or finishing onboarding with the updated backend.

> **Do NOT run `migration_career_intelligence.sql`.** It is superseded and mixed
> obsolete taxonomy tables with the base `schools`/`programmes` registry. Use
> `migration_career_base_registry.sql` instead.

### B. Seeds (data — DML, run AFTER all migrations)

| # | File | Rows | Depends on |
|---|------|------|------------|
| 14 | `backend/seed_career_pilot.sql` | programmes, schools, `jamb_programmes`, `programme_mapping`, `school_programmes`, `programme_subject_requirements` | migrations #4 |
| 15 | `backend/seed_career_v2.sql` | 168 domains · 278 sub-groups · 4,092 roles · 7,393 tools · 508 certs · 2,528 programme→domain · 70,560 readiness · 5,573 JAMB→domain · 4,112 overlap. **Gitignored (~39 MB)** — regenerate with `python data/career-mapping/_gen_career_seed.py`. | #14 |
| 16 | `backend/seed_phase8_9_enrichment.sql` | Admission pilot rows (cut-offs, formulas, competitiveness, floor, snapshot) + Phase 9 enrichment `UPDATE`s. Regenerate with `python data/career-mapping/_gen_enrichment_seed.py`. | #14 and #15 |

The rows above describe the historical production seed path. The new
`backend/seed_career_v2_preview_2026-08-25.sql` is the current development
preview and follows the dependency-critical order documented at the top of
this runbook. Do not substitute it for `seed_career_v2.sql` in production.

## Subject-pipeline deployment order

On a fresh database, apply `backend/migration_subject_catalog.sql` before
`backend/migration_career_pilot.sql`. Apply
`backend/migration_subject_rule_records.sql` after the career pilot migration
and before the subject seeds. Then run the data files in this order:

1. `backend/seed_subject_catalog.sql`
2. `backend/seed_career_pilot.sql`
3. `backend/seed_subject_rule_records.sql`
4. `backend/seed_subject_options.sql`

The current generated subject counts are 46 catalog subjects, 596 national
matcher options, 7,793 option items, and 1,260 typed rule records. The
subject-option seed intentionally deletes and rebuilds only the two national
matcher tables; back up an existing production database before running it.
The API will not trust an option row until the corresponding typed rule record
is present and has the same programme, requirement, exam layer, and source
text. Apply `seed_subject_rule_records.sql` before
`seed_subject_options.sql`.

### Exhaustive subject-matcher audit

Run the generated-seed audit from the backend virtual environment after both
subject seeds are applied:

```
cd backend
.venv\\Scripts\\python.exe ..\\data\\career-mapping\\_audit_subject_match_exhaustive.py
```

It exercises every emitted option, its required/group-removal mutations, and
compares the runtime matcher with an independent option-item oracle. A passing
run reports the catalogue, option, typed-rule and negative-case counts and
must report zero oracle mismatches. This is separate from the live deployment
check: a database with zero `programme_subject_rule_records` must remain
fail-closed and is not ready for subject matching.

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
