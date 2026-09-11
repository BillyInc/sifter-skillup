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

## Canonical subject/JAMB deployment order (2026-09-11)

Use this section for the current subject matcher and university-offering
refresh. It supersedes older subject-pipeline snippets in this document; the
2026-09-01 compressed career taxonomy seed is a separate, staging-only refresh.

### Local build order before Supabase

The SQL files are generated artifacts. Rebuild them only after replaying the
explicit brochure confirmations, then run the local audits before applying any
SQL:

```powershell
python scripts/audit_brochure_subject_requirements.py --apply-manual-confirmations
python scripts/build_jamb_brochure_source_rules.py --apply-manual-confirmations
python data/career-mapping/_gen_seed.py
python data/career-mapping/_parse_subject_options.py
python data/career-mapping/_gen_subject_rule_records.py
python data/career-mapping/_audit_course_and_jamb_mapping.py
python data/career-mapping/_audit_subject_option_seed.py
python data/career-mapping/_audit_subject_match_exhaustive.py
```

The confirmation ledger is
`data/career-mapping/_audit/jamb_brochure_manual_source_confirmations_2026-09-11.json`.
`source_blank` and `source_missing` are confirmed non-matchable states; they
must remain in the typed rule layer but must not be emitted as subject-picker
options.

### Existing Supabase project

Run a read-only preflight first. Apply only migrations that the preflight shows
are missing, one file at a time, with `ON_ERROR_STOP` enabled:

1. `backend/migration_career_base_registry.sql`
2. `backend/migration_subject_catalog.sql`
3. `backend/migration_career_pilot.sql`
4. `backend/migration_subject_rule_records.sql`
5. `backend/migration_student_pipeline_live.sql`
6. `backend/migration_school_faculty_filter_2026-09-09.sql`
7. Requested additive migrations, after their prerequisites exist, in this
   dependency order when those flows are in scope:
   `migration_provisioning.sql`, `migration_school_identity.sql`,
   `migration_institution_team_access.sql`,
   `migration_guidance_report_paths.sql`,
   `migration_student_consent_requests.sql`,
   `migration_institution_verification_proof.sql`, then the current auth,
   lifecycle, feedback, and admin patches listed in the full runbook.

Then apply the data files in exactly this order:

1. `backend/seed_subject_catalog.sql`
2. `backend/seed_career_pilot.sql`
3. `backend/seed_subject_rule_records.sql`
4. `backend/seed_subject_options.sql`

`seed_career_pilot.sql` is the current generated programme/offering load. Its
latest local artifact contains 243 CCMAS programmes, 861 institutions, 420
JAMB identities, 9,130 university offerings, 420 national requirement rows,
2,706 requirement-source rows, 3,884 university exception rows, 1,998
structured university option rows, and 12,813 structured option items. The
exact live counts must be confirmed after deployment; local generation is not
proof that Supabase was seeded.

`seed_subject_options.sql` is a replacement transaction for the national
matcher tables. Back up the affected tables before running it. Do not apply it
before both `migration_subject_rule_records.sql` and
`seed_subject_rule_records.sql`; the runtime deliberately fails closed when
typed rules are absent or disagree with picker rows.

The current API policy keeps Direct Entry requirements in the database for a
future polytechnic route, but excludes them from current student, SS, JAMB,
and university guidance payloads. Do not delete the `direct_entry` columns or
source rows, and do not add Direct Entry back to current responses as a
workaround. No extra SQL migration is required for that API filtering change.

Do not treat a local seed count or a REST read as proof that SQL was applied.
After the four seeds succeed, run the post-apply queries below, then the
exhaustive matcher audit and the student-pipeline smoke test. If a migration or
seed fails, stop at that file and report the database error.

### Fresh or explicitly approved staging database

Apply the base, career, subject, admission/resource, provisioning, and auth
migrations from the full order below. Only after all prerequisite schema files
are successful should the four current subject seeds above be applied. Apply
`migration_career_v2.sql` and the large compressed career seed only for an
approved empty/staging taxonomy rebuild; never use that destructive rebuild to
repair a populated production project.

### Required post-apply checks

Run these checks in the same database after the seed transaction completes:

```sql
SELECT count(*) FROM skillup_dev.jamb_programmes;
SELECT count(*) FROM skillup_dev.programme_mapping;
SELECT count(*) FROM skillup_dev.programme_subject_requirements;
SELECT count(*) FROM skillup_dev.jamb_programme_requirement_sources;
SELECT count(*) FROM skillup_dev.school_programmes;
SELECT count(*) FILTER (WHERE utme_subjects IS NOT NULL)
FROM skillup_dev.school_programmes;
SELECT count(*) FILTER (WHERE olevel_requirement IS NOT NULL)
FROM skillup_dev.school_programmes;
SELECT count(*) FILTER (WHERE direct_entry IS NOT NULL)
FROM skillup_dev.school_programmes;
```

The expected current seed totals are 420, 420, 420, 2,706, and 9,130 for the
first five queries. The three offering-field checks should be non-zero and
match the generated seed's post-load counts. Then run
`_audit_subject_option_seed.py` and
`_audit_subject_match_exhaustive.py`; the exhaustive audit must report zero
oracle mismatches. Finally smoke-test the student pipeline and confirm the
current API payloads contain programme requirements but no Direct Entry fields.

## Current career refresh since the last push (2026-09-01)

The current career seed is transported in compressed, ordered parts:

`backend/seed_career_v2_2026-09-01_parts_gz/`

The reconstructed local SQL output is
`backend/seed_career_v2_2026-09-01.sql`; it is ignored by Git because it is
about 672 MB. The compressed parts exist so the generated artifact can pass
repository file-size limits. There are 23 `.sql.gz` parts, each below 41 MB
compressed, and each contains complete SQL statements in order.

This is a generated development/staging seed, not a schema migration. It
contains the corrected ISCO-backed subgroup hierarchy, current source-backed
context/provenance payload and reviewed no-direct-local-match rows. It contains
160 visible domains, 542 subgroups, 5,093 roles, 48,585 tools and 5,090 role
work-profile rows. Apply it to production only after a production preflight,
backup and explicit approval of the data refresh.

### Correct order for the current career seed

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
12. `backend/migration_certification_lifecycle.sql` — retain closed or
    superseded credentials while exposing their current availability.
13. `backend/migration_career_resources_v1.sql` when resource data is being
    used
14. `backend/migration_saved_resource_support.sql` after `saved_items` exists
15. Decompressed current SQL parts in
    `backend/seed_career_v2_2026-09-01_parts_gz/`, in numeric order

The `.sql.gz` files are not executable by Supabase. Before applying the
preview, decompress/reassemble them from the repository root:

```powershell
python data/career-mapping/split_large_artifacts.py join-sql `
  backend/seed_career_v2_2026-09-01_parts_gz/manifest.json `
  backend/seed_career_v2_2026-09-01.sql
```

The command verifies every compressed-part checksum before writing the
reconstructed SQL. Then pass the reconstructed file to `psql` with
`ON_ERROR_STOP` enabled:

```powershell
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" `
  -v ON_ERROR_STOP=1 `
  -f backend/seed_career_v2_2026-09-01.sql
```

If the SQL Editor must be used, decompress and run the numbered parts
separately in numeric order. Each part is a complete transaction. Do not paste
or upload `.sql.gz` bytes to Supabase.

### Manual-only deployment mode

If the product owner says they will run the SQL manually, do not write to
Supabase from the application service client, REST API, RPC, `psql`, or an
automated SQL tool. Prepare the files, validate them locally, and stop with the
exact order and verification queries. A local seed generation or read-only API
check is not proof that Supabase was updated.

After the career seed has completed, run
`backend/seed_certification_lifecycle.sql`. It applies the evergreen status
overlay to the loaded domain and role credential rows. This includes the
temporarily unavailable TensorFlow Developer Certificate, retired AWS and
Microsoft Azure routes, the Salesforce Associate name that was superseded by
Platform Foundations, and the retained training and membership records.
Names are matched after lower-casing and removing punctuation, so typographic
dashes, slashes, and parentheses in the seed cannot prevent a lifecycle update.
Re-running it is safe. “Recheck” means a scheduled provider-status refresh; it
does not mean that the record is pending or missing a source.

The preview must not be run before `migration_source_backed_career_layers.sql`:
its domain, subgroup, role and tool inserts use the source-confidence,
data-state, provenance and Nigerian-context columns created by that migration.
It must not be run before `migration_role_tools.sql` because role-scoped tool
rows use `domain_tools.role_id` and the `scope='role'` constraint.

Do not apply the current seed to a populated production database without a
production preflight, backup and explicit approval. The population gate now
permits this regenerated seed after the 2026-08-29 structural repair, while
roles without a supported subgroup taxonomy remain direct domain-to-role rows;
reviewed no-direct-local-match rows remain explicit. A green population gate is
not a substitute for production deployment verification.

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
| 11a | `backend/migration_certification_lifecycle.sql` | Retains changing credentials and records credential type, availability, current recommendation, reopening possibility, and status evidence for domain and role-owned credentials. | #9 and #11 |
| 12 | `backend/migration_career_resources_v1.sql` | Source-backed learning-resource table and indexes. | #5 and #8 |
| 12a | `backend/migration_contextual_career_items.sql` | Adds the learner-facing contextual evidence table. Each emitted skill, competency, tool and certification row carries its meaning, context-specific use, learning priority, connections, source links, source locator and evidence limitation. | #8, #9, #11a and #12 |
| 13 | `backend/migration_provisioning.sql` | Institution provisioning, school codes, claim codes, student affiliations/consents, merge candidates. | #5 |
| 14 | `backend/migration_student_pipeline_live.sql` | Student starting points, selected subjects, structured subject options, pathway choices, JAMB/cutoff views. | #4, #6, #13 |
| 14aa | `backend/migration_school_faculty_filter_2026-09-09.sql` | Appends `jamb_faculty` to the school programme view so the university → faculty → programme picker filters real offerings. | #14 |
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

### Contextual career item transport

After applying migration **12a**, load the nine ordered gzip parts in
`backend/seed_contextual_career_items_parts_gz/` in numeric order through the
repository's normal seed loader. The parts contain 195,248 source-backed
records. Reassemble or decompress them only in the controlled migration
environment; do not commit an uncompressed copy. Confirm that the loader
reports 195,248 rows and that every row has `data_state = 'source_backed'` and
at least one public source URL before treating the migration as complete.

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
`backend/seed_career_v2_preview_2026-08-26_parts_gz/` transport is the current development
preview and follows the dependency-critical order documented at the top of
this runbook. Do not substitute it for `seed_career_v2.sql` in production.

## 2026-09-01 authoritative correction

The older seed counts above are historical and must not be used for the current
career refresh. The current source inputs produce 160 visible domains, 542 supported
subgroups, 5,093 roles, 48,585 tools, 240 certifications, 1,683
programme-domain links, 70,246 programme-role scores, 3,163 JAMB-domain links,
4,000 domain-overlap rows and 5,050 role work profiles.

Before rebuilding the current career seed after any role or structure change,
run these commands from the repository root:

```powershell
python data/career-mapping/_apply_emerging_domain_structure.py
python data/career-mapping/_build_source_backed_layers.py
python data/career-mapping/_audit_role_completeness.py
python data/career-mapping/validate_career_resource_seed_gate.py
$env:CAREER_SEED_OUTPUT_PATH='C:\tmp\seed_career_canonical_2026-09-01.sql'
python data/career-mapping/_gen_career_seed.py
Remove-Item Env:CAREER_SEED_OUTPUT_PATH
python data/career-mapping/split_large_artifacts.py split-sql `
  C:\tmp\seed_career_canonical_2026-09-01.sql `
  backend/seed_career_v2_2026-09-01_parts_gz --max-bytes 40000000 --gzip
```

The structural pass is required because the role library's existing ISCO
sub-major ownership must be materialized into `domain_structure.json` before
the seed can create the subgroup foreign keys used by grouped roles, tools and
resources. Roles without a supported subgroup taxonomy retain a direct
domain-to-role path with a null subgroup foreign key. Do not hand-edit generated
SQL to repair this relationship.

### Pre-2026-09-01 JAMB-domain repair

If the database was loaded with the 2026-08-31 preview, the historical
`refresh_jamb_programme_domain_2026-08-17.sql`, or another older JAMB-domain
transport, apply `backend/migration_jamb_domain_mapping_corrections_2026-09-08.sql`
after that load. It repairs the 147 links that were incorrectly labelled
`functional` instead of `adjacent` and removes one extra Project Management
link. The 2026-09-01 authoritative seed already contains these corrections;
the repair is safe to run after it as well.

## Current live partial-seed diagnosis

The latest read-only preflight observed this state:

| Object | Observed state |
|---|---:|
| `domains` | 0 rows |
| `domain_roles` | 0 rows |
| `domain_subgroups` | 460 rows |
| `jamb_programme_domain` | 3,164 rows |
| `v_jamb_programme_domain_paths` | missing |
| `v_school_jamb_programmes` | present, old shape without `jamb_faculty` |

This is why a JAMB mapping can exist while domain detail, subgroup, and role
screens remain unavailable. It is not a complete career seed. The current
`migration_career_v2.sql` is explicitly a staging/rebuild migration and drops
taxonomy tables before recreating them; do not run it against a populated
project without backup and explicit approval. If a controlled staging rebuild
is approved, use this order:

1. Apply the career schema prerequisites through `migration_career_v2.sql`.
2. Apply the role/tools/source-backed/enrichment/resource schema migrations
   required by the 2026-09-01 seed.
3. Apply `seed_career_v2_2026-09-01_parts_gz/part-001.sql.gz` through
   `part-023.sql.gz`, in numeric order, preserving each transaction.
4. Apply `migration_student_pipeline_live.sql`.
5. Apply `migration_school_faculty_filter_2026-09-09.sql`.
6. If the older 2026-08-31 or historical JAMB transport was used, apply
   `migration_jamb_domain_mapping_corrections_2026-09-08.sql`.

The correction file is not a replacement for the career seed. The authoritative
2026-09-01 seed already has the corrected Sociology mapping, including the
adjacent Criminology, Criminal Justice connection.

After the user applies the files, verify the deployment with read-only queries
in the SQL Editor:

```sql
SELECT 'domains' AS object, count(*) FROM skillup_dev.domains
UNION ALL SELECT 'domain_subgroups', count(*) FROM skillup_dev.domain_subgroups
UNION ALL SELECT 'domain_roles', count(*) FROM skillup_dev.domain_roles
UNION ALL SELECT 'jamb_programme_domain', count(*) FROM skillup_dev.jamb_programme_domain;

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'skillup_dev'
  AND table_name = 'v_school_jamb_programmes'
ORDER BY ordinal_position;

SELECT jpd.jamb_name, d.name AS domain, jpd.match_type
FROM skillup_dev.jamb_programme_domain AS jpd
JOIN skillup_dev.domains AS d ON d.id = jpd.domain_id
WHERE upper(jpd.jamb_name) = 'SOCIOLOGY'
ORDER BY jpd.match_type, d.name;

SELECT count(*) AS sociology_social_science_subgroups
FROM skillup_dev.domain_subgroups AS sg
JOIN skillup_dev.domains AS d ON d.id = sg.domain_id
WHERE d.domain_key = 'D078';

SELECT to_regclass('skillup_dev.v_jamb_programme_domain_paths') AS domain_paths_view;
```

The expected checks are: non-zero domains and roles, Sociology's Criminology,
Criminal Justice row marked `adjacent`, at least the seeded D078 subgroups,
`jamb_faculty` present in the school-offering view, and a non-null domain-path
view. If any check fails, stop the user-facing smoke test and fix the SQL
deployment state first.

## Subject-pipeline deployment order

The canonical order is the 2026-09-11 order at the top of this runbook. In
short, apply `backend/migration_subject_catalog.sql` before
`backend/migration_career_pilot.sql`, apply
`backend/migration_subject_rule_records.sql` after the career pilot migration,
then apply `backend/migration_student_pipeline_live.sql` followed by
`backend/migration_school_faculty_filter_2026-09-09.sql`. Only then run the
data files in this order:

1. `backend/seed_subject_catalog.sql`
2. `backend/seed_career_pilot.sql`
3. `backend/seed_subject_rule_records.sql`
4. `backend/seed_subject_options.sql`

The subject-option seed intentionally deletes and rebuilds only the two
national matcher tables; back up an existing production database before
running it. Do not reuse older hard-coded option/item totals: regenerate and
run the seed audit to obtain the current matcher counts.
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
