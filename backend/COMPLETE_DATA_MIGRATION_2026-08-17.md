# Sifter LevelUp complete data migration

Status: reconciled and regenerated on 2026-08-17.

This is the authoritative runbook for the current career, JAMB, domain,
admission, and source-backed resource data. SQL files are generated outputs;
the partition manifest, JSON parts, and generators under
`data/career-mapping/` are the sources of truth.

Do not paste every SQL file in `backend/` into Supabase in filename order.
Several files are historical patches, rollback scripts, or superseded schema
variants.

## Current generated outputs

| Output | Current contents |
|---|---:|
| `seed_career_pilot.sql` | 243 programmes, 778 schools, 420 JAMB offerings, 416 mappings, 7,889 school offerings |
| `seed_career_v2.sql` | 160 domains, 460 subgroups, 5,038 roles, 47,111 tools, 240 certifications, 2,058 programme-domain links, 70,560 programme-role scores, 3,342 JAMB-domain links, 4,000 overlaps |
| `seed_career_resources_v1_parts/` | 160,914 source-backed resource rows in 322 batches, split into pushable SQL transactions |
| `refresh_jamb_programme_domain_2026-08-17.sql` | 3,342 JAMB-domain links; standalone replacement only |

The resource artifacts are intentionally partitioned. The JSON parts are
build inputs and are not read by the application at runtime. The SQL parts
seed the `skillup_dev.career_learning_resources` table consumed by the backend.

- JSON manifest: `data/career-mapping/learning_resource_population.manifest.json`
- JSON parts: `data/career-mapping/learning_resource_population_parts/part-*.json`
- SQL manifest: `backend/seed_career_resources_v1.manifest.json`
- SQL parts: `backend/seed_career_resources_v1_parts/part-*.sql`
- Each SQL part is a complete transaction. Run `part-001.sql` through the
  final numbered part in order after `migration_career_resources_v1.sql`.
- The old monolithic `learning_resource_population.json` and
  `seed_career_resources_v1.sql` files are intentionally not used.

The JAMB inheritance audit is clean: all 416 names have an explicit scope,
with 111 full CCMAS, 28 combined CCMAS, 272 course-scoped partial CCMAS, and
5 separately evidenced external curricula.

The resource gate is also green: 160 visible domains, zero resource
validation errors, zero unsourced roles, and no invalid domain, subgroup, or
role foreign-key references in the generated population.

## Authoritative source files

- `data/career-mapping/domain_meta.json`
- `data/career-mapping/domain_structure.json`
- `data/career-mapping/role_library_v3_cleaned.json` plus role overlays
- `data/career-mapping/programme_domain_final.json`
- `data/career-mapping/jamb_domain_map.json`
- `data/career-mapping/jamb/jamb_skills_nuance.json`
- `data/career-mapping/learning_resource_population.manifest.json` and `learning_resource_population_parts/`
- `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`
- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`

The user-facing domain denominator is the resource-audit scope: 160 visible
domains and these eight hidden IDs:

`D086, D087, D088, D089, D100, D101, D108, D113`

The career seed now uses that same scope. This prevents the resource seed from
referencing a domain omitted by the taxonomy seed.

## Regeneration commands

Run from `data/career-mapping` after source data changes:

```powershell
python _build_learning_resource_population.py
python validate_career_resource_seed_gate.py
python _gen_career_resource_seed.py
python _gen_career_seed.py
python _gen_seed.py
python _emit_jamb_domain_refresh_sql.py
```

The first gate must pass before `seed_career_resources_v1_parts/` is treated as
seedable. The current gate has eight informational source-exception records,
but no pending review or mechanical validation errors.

The build command recreates the JSON parts and checksum manifest. The resource
seed generator reads those parts and recreates the ordered SQL parts and SQL
manifest. Do not recreate a monolithic JSON or SQL file for deployment.

## Fresh or staging database order

Run each file in the order below. Keep each SQL file's transaction intact.

### 1. Base application schema

1. `supabase-schema.sql`
2. `backend/migration_v2.sql`
3. `backend/migration_v2_atomic.sql`
4. `backend/migration_auth_profile.sql`
5. `backend/migration_fcm_device_tokens.sql`
6. `backend/migration_v2_offline_idempotency.sql`
7. `backend/migration_v2_offline_streak.sql`

### 2. Career and admission schema

1. `backend/migration_career_base_registry.sql`
2. `backend/migration_career_pilot.sql`
3. `backend/migration_career_v2.sql`
4. `backend/migration_admission_intelligence.sql`
5. `backend/migration_enrichment_v1.sql`
6. `backend/migration_market_intelligence_v1.sql`
7. `backend/migration_role_tools.sql`
8. `backend/migration_role_detail_enrichment.sql`
9. `backend/migration_source_backed_career_layers.sql`
10. `backend/migration_career_resources_v1.sql`

`migration_career_v2.sql` recreates the taxonomy tables with `DROP TABLE ...
CASCADE`. Use it only for an empty/staging database or an explicitly approved
taxonomy rebuild after taking a database backup. Do not use it as an ordinary
production additive migration.

### 3. Provisioning, onboarding, and student pipeline schema

Apply these after the career registry exists:

1. `backend/migration_provisioning.sql`
2. `backend/migration_school_identity.sql`
3. `backend/migration_institution_team_access.sql`
4. `backend/migration_student_pipeline_live.sql`
5. `backend/migration_ss3_secondary_starting_point_patch.sql`
6. `backend/migration_provisioning_guidance_variants.sql`
7. `backend/migration_guidance_report_paths.sql`
8. `backend/migration_student_consent_requests.sql`
9. `backend/migration_institution_verification_proof.sql`

### 4. Current auth/account/admin patches

These are additive patches for the current application paths:

1. `backend/migration_goal_apply_now.sql`
2. `backend/migration_pending_account_type_patch.sql`
3. `backend/migration_signup_auth_apply_now_patch.sql`
4. `backend/migration_auth_onboarding_security_patch.sql`
5. `backend/migration_account_lifecycle_patch.sql`
6. `backend/migration_admin_access_grant.sql`
7. `backend/migration_internal_staff.sql`
8. `backend/migration_feedback_storage.sql`
9. `backend/migration_user_feedback.sql`

The consolidated patches are idempotent. Do not apply an older patch merely to
replay the same columns or tables if the consolidated patch already created
them; `IF NOT EXISTS` makes the current path safe to rerun, but it does not
make conflicting business logic equivalent.

### 5. Data seeds

Run after the schema above:

1. `backend/seed_subject_catalog.sql`
2. `backend/seed_subject_options.sql`
3. `backend/seed_career_pilot.sql`
4. `backend/seed_career_v2.sql`
5. `backend/seed_phase8_9_enrichment.sql`
6. `backend/seed_demand_baseline.sql` if demand baseline data is wanted
7. `backend/seed_career_resources_v1_parts/` in numeric filename order; keep
   `seed_career_resources_v1.manifest.json` for row counts and checksums
8. `backend/patch_subject_catalog_streams.sql`

`seed_career_v2.sql` already contains the complete current
`jamb_programme_domain` population. Do not run the JAMB refresh after it in the
normal full seed path.

## Existing database path

Before applying anything to an existing Supabase project:

1. Take a database backup or export the affected tables.
2. Check whether the career tables already exist and whether the current
   columns from `migration_source_backed_career_layers.sql`,
   `migration_role_tools.sql`, and `migration_career_resources_v1.sql` exist.
3. Apply only missing additive schema migrations.
4. Apply `seed_career_pilot.sql`, then `seed_career_v2.sql`, then the SQL files
   in `seed_career_resources_v1_parts/` in numeric order.
5. Run the verification queries below.

Do not rerun `migration_career_v2.sql` against a populated production database
unless the intended operation is a controlled taxonomy rebuild.

## Standalone JAMB refresh

`backend/refresh_jamb_programme_domain_2026-08-17.sql` is an optional JAMB-only
replacement. It deletes and repopulates the entire
`skillup_dev.jamb_programme_domain` table from the current
`jamb_domain_map.json`.

Use it only when the taxonomy seed is not being rerun. Do not run it alongside
the full `seed_career_v2.sql` path unless the final delete/insert replacement
is intentional.

## Recovery and deprecated files

- `backend/migration_career_intelligence.sql`: superseded; do not run. It
  mixes the obsolete taxonomy schema with the current base registry.
- `backend/migration_v2_down.sql`: rollback script; never include in a forward
  migration.
- `backend/repair_demand_fkeys.sql`: recovery-only; run after
  `seed_career_v2.sql` if a previous `DROP ... CASCADE` removed demand-table
  foreign keys.
- `backend/seed_career_v2.sql`: current generated taxonomy seed, not a legacy
  file despite its historical filename.
- `backend/seed_career_pilot.sql`: current generated pilot seed; regenerate it
  with `_gen_seed.py` rather than hand-editing it.
- `backend/seed_career_resources_v1.manifest.json` and
  `backend/seed_career_resources_v1_parts/`: current generated resource seed;
  apply the parts in numeric order after the migration;
  regenerate only after the resource gate passes.

## Post-seed verification

Run this in the Supabase SQL editor after the seeds finish:

```sql
SELECT 'domains' AS table_name, COUNT(*) AS rows FROM skillup_dev.domains
UNION ALL SELECT 'domain_subgroups', COUNT(*) FROM skillup_dev.domain_subgroups
UNION ALL SELECT 'domain_roles', COUNT(*) FROM skillup_dev.domain_roles
UNION ALL SELECT 'domain_tools', COUNT(*) FROM skillup_dev.domain_tools
UNION ALL SELECT 'programmes', COUNT(*) FROM skillup_dev.programmes
UNION ALL SELECT 'jamb_programmes', COUNT(*) FROM skillup_dev.jamb_programmes
UNION ALL SELECT 'programme_mapping', COUNT(*) FROM skillup_dev.programme_mapping
UNION ALL SELECT 'programme_domain', COUNT(*) FROM skillup_dev.programme_domain
UNION ALL SELECT 'jamb_programme_domain', COUNT(*) FROM skillup_dev.jamb_programme_domain
UNION ALL SELECT 'career_learning_resources', COUNT(*) FROM skillup_dev.career_learning_resources;

SELECT COUNT(*) AS orphan_jamb_domain_links
FROM skillup_dev.jamb_programme_domain j
LEFT JOIN skillup_dev.domains d ON d.id = j.domain_id
WHERE d.id IS NULL;

SELECT COUNT(*) AS orphan_programme_domain_links
FROM skillup_dev.programme_domain pd
LEFT JOIN skillup_dev.programmes p ON p.id = pd.programme_id
LEFT JOIN skillup_dev.domains d ON d.id = pd.domain_id
WHERE p.id IS NULL OR d.id IS NULL;

SELECT COUNT(*) AS orphan_resource_links
FROM skillup_dev.career_learning_resources r
LEFT JOIN skillup_dev.domains d ON d.id = r.domain_id
LEFT JOIN skillup_dev.domain_subgroups sg ON sg.id = r.subgroup_id
LEFT JOIN skillup_dev.domain_roles dr ON dr.id = r.role_id
WHERE d.id IS NULL OR (r.subgroup_id IS NOT NULL AND sg.id IS NULL)
   OR (r.role_id IS NOT NULL AND dr.id IS NULL);
```

Expected core counts are 160 domains, 460 subgroups, 5,038 roles, 243
programmes, 420 JAMB programmes, 416 programme mappings, 2,058
programme-domain links, 3,342 JAMB-domain links, and 160,914 resource rows.
All three orphan checks must return zero.

## Local verification already completed

- Resource gate: PASS; 160,914 rows and zero mechanical validation errors.
- Resource FK reconciliation: zero invalid domain, subgroup, or role IDs.
- JAMB inheritance audit: 416/416 names resolved; zero stale names and zero
  component mismatches.
- Seed regeneration: all 416 programme mappings link to a programme.
- Python compilation and JSON parsing passed for the generators and canonical
  artifacts.
