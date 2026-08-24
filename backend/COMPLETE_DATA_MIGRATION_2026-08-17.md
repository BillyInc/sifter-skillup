# Sifter LevelUp complete data migration

Status: reconciled and regenerated on 2026-08-22.

This is the authoritative runbook for the current career, JAMB, domain,
admission, and source-backed resource data. SQL files are generated outputs;
the partition manifest, JSON parts, and generators under
`data/career-mapping/` are the sources of truth.

The generated SQL has been locally regenerated and audited. It has not been
executed against Supabase by this audit; the post-seed queries below are the
required proof of a successful Supabase run.

A read-only check of the configured Supabase project on 2026-08-24 found the
older live subject state (506 options, 4,593 option items, and 0 typed rule
records). The API now refuses to use national option rows unless they agree
with the typed rule layer, so this stale state fails closed rather than
producing untrusted matches. Apply both subject seeds in the order below, then
rerun the post-seed queries.

Do not paste every SQL file in `backend/` into Supabase in filename order.
Several files are historical patches, rollback scripts, or superseded schema
variants.

## Current generated outputs

| Output | Current contents |
|---|---:|
| `seed_career_pilot.sql` | 243 CCMAS/custom programmes, 861 schools, 420 JAMB programme names, 420 mappings, 9,130 unique university offerings, 420 national requirement rows, 3,884 university exceptions, 2,031 university subject options, 12,213 university option items, 2,706 brochure source variants |
| `seed_subject_catalog.sql` | 46 canonical subjects |
| `seed_subject_options.sql` | 596 national subject options and 7,793 national option items; replacement seed for directly matchable subject combinations |
| `seed_subject_rule_records.sql` | 1,260 typed UTME/O-level/direct-entry rule records: 676 matchable, 137 structured source rules, 3 cross-references, 420 direct-entry records, 24 explicit source-missing records |
| `seed_career_v2.sql` | 160 domains, 460 subgroups, 5,038 roles, 47,111 tools, 240 certifications, 2,058 programme-domain links, 70,246 programme-role scores, 709 JAMB-domain links, 4,000 overlaps |
| `seed_career_resources_v1_parts/` | 160,914 source-backed resource rows in 322 batches, split into pushable SQL transactions |
| `refresh_jamb_programme_domain_2026-08-17.sql` | 709 JAMB-domain links; standalone replacement only |

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

The JAMB inheritance audit resolves all 420 names to an explicit scope, with
113 full CCMAS, 28 combined CCMAS, 273 course-scoped partial CCMAS, and 6
separately evidenced external curricula. The university/programme graph is
complete and structurally valid: all 420 names have a canonical mapping and
all 9,130 offerings resolve through that chain. This does not mean every
source sentence is a machine-matchable subject rule: 172 programme layers still
need subject parsing review. Their official text is retained for programme
detail and review, but is not used to manufacture a subject-match result.

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
2. `backend/migration_subject_catalog.sql`
3. `backend/migration_career_pilot.sql`
4. `backend/migration_subject_rule_records.sql`
5. `backend/migration_career_v2.sql`
6. `backend/migration_admission_intelligence.sql`
7. `backend/migration_enrichment_v1.sql`
8. `backend/migration_market_intelligence_v1.sql`
9. `backend/migration_role_tools.sql`
10. `backend/migration_role_detail_enrichment.sql`
11. `backend/migration_source_backed_career_layers.sql`
12. `backend/migration_career_resources_v1.sql`

`migration_subject_catalog.sql` is required before
`migration_career_pilot.sql` on a fresh database because the latter creates
the school-specific subject-option item table with a foreign key to
`subject_catalog`. `migration_student_pipeline_live.sql` retains an
`IF NOT EXISTS` copy for compatibility; do not use that duplicate as a reason
to move the catalog migration later.

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
8. `backend/migration_saved_resource_support.sql`
   Adds source-backed resource URLs as a saveable `resource` item in My World.
9. `backend/migration_student_consent_requests.sql`
10. `backend/migration_institution_verification_proof.sql`

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
2. `backend/seed_career_pilot.sql`
3. `backend/seed_subject_rule_records.sql`
4. `backend/seed_subject_options.sql`
5. `backend/seed_career_v2.sql`
6. `backend/seed_phase8_9_enrichment.sql`
7. `backend/seed_demand_baseline.sql` if demand baseline data is wanted
8. `backend/seed_career_resources_v1_parts/` in numeric filename order; keep
   `seed_career_resources_v1.manifest.json` for row counts and checksums
9. `backend/patch_subject_catalog_streams.sql`

`seed_subject_rule_records.sql` replaces the complete typed rule-record layer.
`seed_subject_options.sql` deliberately deletes and replaces the national
parsed-option tables before inserting the current 596 options and 7,793
items. Run both after `seed_career_pilot.sql`; take a backup before using the
replacement seed on an existing production database. The rule-record layer
preserves every source condition and blank cell; only matchable records become
subject-picker rows.

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
SELECT 'subject_catalog' AS table_name, COUNT(*) AS rows FROM skillup_dev.subject_catalog
UNION ALL SELECT 'jamb_programmes', COUNT(*) FROM skillup_dev.jamb_programmes
UNION ALL SELECT 'programme_subject_requirements', COUNT(*) FROM skillup_dev.programme_subject_requirements
UNION ALL SELECT 'programme_subject_options', COUNT(*) FROM skillup_dev.programme_subject_options
UNION ALL SELECT 'programme_subject_option_items', COUNT(*) FROM skillup_dev.programme_subject_option_items
UNION ALL SELECT 'programme_subject_rule_records', COUNT(*) FROM skillup_dev.programme_subject_rule_records
UNION ALL SELECT 'schools', COUNT(*) FROM skillup_dev.schools
UNION ALL SELECT 'school_programmes', COUNT(*) FROM skillup_dev.school_programmes
UNION ALL SELECT 'school_programme_requirement_exceptions', COUNT(*) FROM skillup_dev.school_programme_requirement_exceptions
UNION ALL SELECT 'school_programme_subject_options', COUNT(*) FROM skillup_dev.school_programme_subject_options
UNION ALL SELECT 'school_programme_subject_option_items', COUNT(*) FROM skillup_dev.school_programme_subject_option_items
UNION ALL SELECT 'programme_mapping', COUNT(*) FROM skillup_dev.programme_mapping
UNION ALL SELECT 'domains', COUNT(*) FROM skillup_dev.domains
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

SELECT COUNT(*) AS options_without_current_typed_authority
FROM skillup_dev.programme_subject_options o
LEFT JOIN skillup_dev.programme_subject_rule_records r
  ON r.jamb_programme_id = o.jamb_programme_id
 AND r.requirement_id = o.requirement_id
 AND r.exam_type = o.exam_type
WHERE r.id IS NULL
   OR r.rule_status NOT IN ('matchable', 'cross_reference')
   OR regexp_replace(o.source_text, '\\s+\\[resolved:\\s*as in [^\\]]+\\]\\s*$', '', 'i') <> r.source_text;

SELECT COUNT(*) AS incomplete_subject_options
FROM (
  WITH required_counts AS (
    SELECT option_id, COUNT(*) AS required_count
    FROM skillup_dev.programme_subject_option_items
    WHERE requirement_role = 'required'
    GROUP BY option_id
  ), group_counts AS (
    SELECT option_id, group_key, MAX(min_from_group) AS group_min
    FROM skillup_dev.programme_subject_option_items
    WHERE requirement_role = 'one_of'
    GROUP BY option_id, group_key
  ), capacities AS (
    SELECT o.id, o.min_required,
           COALESCE(r.required_count, 0) + COALESCE(g.group_capacity, 0)
             AS represented_capacity
    FROM skillup_dev.programme_subject_options o
    LEFT JOIN required_counts r ON r.option_id = o.id
    LEFT JOIN (
      SELECT option_id, SUM(group_min) AS group_capacity
      FROM group_counts
      GROUP BY option_id
    ) g ON g.option_id = o.id
  )
  SELECT id FROM capacities WHERE represented_capacity < min_required
) x;
```

Expected current counts are 46 subjects, 420 JAMB programmes, 420 national
requirement rows, 596 national subject options, 7,793 national option items,
1,260 typed subject-rule records,
861 schools, 9,130 unique school-programme offerings, 3,884 university
exceptions, 2,031 university subject options, 12,213 university option items,
420 programme mappings, 160 visible domains, 460 subgroups, 5,038 roles,
2,058 programme-domain links, 709 JAMB-domain links, and 160,914 resource
rows. The 9,130 offering pairs and all 420 mapping chains were independently
audited with zero structural errors. The typed rule layer covers every
national requirement layer; 14 rows are explicitly source-missing and are not
invented into subject combinations.
All three orphan checks must return zero.

## Local verification already completed

- Resource gate: PASS; 160,914 rows and zero mechanical validation errors.
- Resource FK reconciliation: zero invalid domain, subgroup, or role IDs.
- JAMB inheritance audit: 420/420 names resolved; zero stale names and zero
  component mismatches.
- Seed regeneration: all 420 programme mappings link to a programme; the
  subject-option completeness audit passed for all 596 emitted options.
- Python compilation and JSON parsing passed for the generators and canonical
  artifacts.
