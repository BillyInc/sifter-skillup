# Claude Code Recovery Instructions: Career Taxonomy Reseed

## Goal

Restore the wiped career taxonomy data in Supabase, repair dependent schema side effects, and prove the recovery is correct with an audit loop.

This is not a broad debugging task. The failure has one clear root cause:

`backend/migration_career_v2.sql` was re-applied after seed data already existed. That migration intentionally drops and recreates the career taxonomy tables for clean rebuilds. Re-running it after seeding wipes the taxonomy tables while leaving unrelated tables intact.

Claude Code must follow the order below exactly. Do not reorder the SQL files. Do not add `migration_career_v2.sql` to the recovery apply list.

## Root Cause Summary

Every table created by `backend/migration_career_v2.sql` is empty, while the rest of the product data applied successfully.

The migration drops and recreates the taxonomy tables by design. It was likely run again after `backend/seed_career_v2.sql`, which wiped exactly the career taxonomy tables.

The demand metrics survived because they are deliberately outside that migration's drop list, but their foreign key constraints were cascade-dropped. Those constraints must be repaired after reseeding.

Two side effects must be handled:

1. The recreated `skillup_dev.domain_tools` table lost its `role_id` column, so `backend/migration_role_tools.sql` must run before the career seed.
2. Some cutoff rows did not backfill `jamb_programme_id` through exact name matching, so the enrichment seed generator must include a fallback through `skillup_dev.programme_mapping`.

## Files That Must Exist

Before running the recovery, confirm these files exist:

```powershell
Test-Path .\RUN_PIPELINE.bat
Test-Path .\backend\migration_role_tools.sql
Test-Path .\backend\migration_student_pipeline_live.sql
Test-Path .\backend\migration_phase7_content.sql
Test-Path .\backend\seed_career_v2.sql
Test-Path .\backend\seed_phase8_9_enrichment.sql
Test-Path .\backend\seed_subject_options.sql
Test-Path .\backend\repair_demand_fkeys.sql
```

If any return `False`, stop and restore or create the missing file before continuing.

## Required Code Fixes Before Applying SQL

Claude Code must verify these fixes are present before touching Supabase.

### 1. Enrichment cutoff backfill must use programme_mapping

Open `data/career-mapping/_gen_enrichment_seed.py`.

Find the `programme_school_cutoff` backfill logic. It must include both:

```sql
UPDATE skillup_dev.programme_school_cutoff c SET jamb_programme_id = j.id
FROM skillup_dev.programmes p JOIN skillup_dev.jamb_programmes j ON j.name = p.name
WHERE c.programme_id = p.id AND c.jamb_programme_id IS NULL;
```

and:

```sql
UPDATE skillup_dev.programme_school_cutoff c SET jamb_programme_id = pm.jamb_programme_id
FROM skillup_dev.programme_mapping pm
WHERE c.programme_id = pm.programme_id AND c.jamb_programme_id IS NULL;
```

If the second update is missing, add it, regenerate the pipeline output, and do not proceed until it exists in the generated seed.

### 2. Demand FK repair file must exist

Confirm `backend/repair_demand_fkeys.sql` exists and is idempotent. It should restore the foreign key constraints from demand metric tables back to the recreated taxonomy tables after reseeding.

### 3. Pipeline warning must exist

Open `RUN_PIPELINE.bat`.

It must warn that `migration_career_v2.sql` drops and recreates taxonomy tables and must never be re-applied after seeding unless the follow-up recovery files are also applied.

## Step 1: Regenerate Local SQL Outputs

From the repo root, run:

```powershell
.\RUN_PIPELINE.bat
```

This refreshes generated SQL and picks up the cutoff backfill improvement.

If this fails, Claude Code must fix the generation error first, then rerun `.\RUN_PIPELINE.bat`. Do not apply SQL to Supabase until generation succeeds.

## Step 2: Apply SQL To Supabase In This Exact Order

This order is mandatory.

Do not include `backend/migration_career_v2.sql`.
Do not run all migrations again.
Do not reorder these files.

Use PowerShell:

```powershell
$uri = Read-Host "Paste Supabase connection URI"

$files = @(
  "backend\migration_role_tools.sql",
  "backend\migration_student_pipeline_live.sql",
  "backend\migration_phase7_content.sql",
  "backend\seed_career_v2.sql",
  "backend\seed_phase8_9_enrichment.sql",
  "backend\seed_subject_options.sql",
  "backend\repair_demand_fkeys.sql"
)

foreach ($f in $files) {
  Write-Host "== $f"
  psql $uri -v ON_ERROR_STOP=1 -q -f $f
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED at $f - stop, fix the error, regenerate if needed, then rerun from the correct point"
    break
  }
}
```

Why this order matters:

1. `migration_role_tools.sql` restores the dropped `domain_tools.role_id` column.
2. `migration_student_pipeline_live.sql` rebuilds views/functions that may have been cascade-dropped.
3. `migration_phase7_content.sql` restores phase 7 content schema safely.
4. `seed_career_v2.sql` restores the wiped taxonomy rows.
5. `seed_phase8_9_enrichment.sql` reapplies certification, URI, cutoff, and enrichment data.
6. `seed_subject_options.sql` reapplies subject options with improved parser coverage.
7. `repair_demand_fkeys.sql` restores demand metric foreign key constraints after the referenced taxonomy rows exist again.

## Step 3: Audit The Result

Run:

```powershell
.\RUN_PIPELINE.bat check
```

Expected result: all checks green.

If any check fails, Claude Code must not declare completion. It must diagnose the failed check, fix the underlying generator, seed, migration, or repair SQL, then repeat the required generation/apply/audit loop.

## Manual Audit Queries

If `RUN_PIPELINE.bat check` is unclear or incomplete, connect to Supabase with `psql` and run these manual checks.

### 1. Taxonomy tables must not be empty

```sql
SELECT 'domains' AS table_name, count(*) FROM skillup_dev.domains
UNION ALL SELECT 'domain_subgroups', count(*) FROM skillup_dev.domain_subgroups
UNION ALL SELECT 'roles', count(*) FROM skillup_dev.roles
UNION ALL SELECT 'domain_tools', count(*) FROM skillup_dev.domain_tools
UNION ALL SELECT 'certifications', count(*) FROM skillup_dev.certifications
UNION ALL SELECT 'programme_domain_alignment', count(*) FROM skillup_dev.programme_domain_alignment
UNION ALL SELECT 'role_scores', count(*) FROM skillup_dev.role_scores
UNION ALL SELECT 'jamb_programme_domain_alignment', count(*) FROM skillup_dev.jamb_programme_domain_alignment
UNION ALL SELECT 'programme_role_overlap', count(*) FROM skillup_dev.programme_role_overlap;
```

Every count must be greater than `0`.

### 2. domain_tools must have role_id

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'skillup_dev'
  AND table_name = 'domain_tools'
  AND column_name = 'role_id';
```

Expected: one row named `role_id`.

### 3. Cutoff rows must have jamb_programme_id backfilled

```sql
SELECT count(*) AS missing_jamb_programme_id
FROM skillup_dev.programme_school_cutoff
WHERE jamb_programme_id IS NULL;
```

Expected: `0`, unless there are intentionally unmapped rows documented in the seed data.

If this is not `0`, inspect the affected rows:

```sql
SELECT c.*, p.name AS programme_name
FROM skillup_dev.programme_school_cutoff c
JOIN skillup_dev.programmes p ON p.id = c.programme_id
WHERE c.jamb_programme_id IS NULL;
```

Then fix `skillup_dev.programme_mapping` or the enrichment generator, regenerate, reapply the enrichment seed, and audit again.

### 4. Demand metric foreign keys must exist

Run:

```sql
SELECT conrelid::regclass AS table_name, conname
FROM pg_constraint
WHERE connamespace = 'skillup_dev'::regnamespace
  AND contype = 'f'
  AND conname ILIKE '%domain%';
```

Confirm the demand metric tables have their expected foreign key constraints to taxonomy tables.

If constraints are missing, rerun:

```powershell
psql $uri -v ON_ERROR_STOP=1 -q -f backend\repair_demand_fkeys.sql
```

Then rerun the audit.

## Fix And Retry Rules

Claude Code must follow these rules if anything fails:

1. Stop at the first SQL apply error.
2. Read the exact error from `psql`.
3. Identify whether the failure is caused by missing schema, missing data, duplicate objects, invalid generated SQL, or missing constraints.
4. Fix the source file that generates or defines the failing SQL.
5. Run `.\RUN_PIPELINE.bat` again if any generated SQL source changed.
6. Re-apply SQL in the mandatory order from the first file needed to restore consistency.
7. Run `.\RUN_PIPELINE.bat check` again.
8. Repeat until the check passes.

Do not skip the final check.
Do not report success with known red checks.
Do not re-run `migration_career_v2.sql` as part of this recovery.

## Completion Criteria

The task is complete only when all of these are true:

1. `.\RUN_PIPELINE.bat` succeeds.
2. The seven recovery SQL files apply successfully in the exact order listed above.
3. `.\RUN_PIPELINE.bat check` passes.
4. The nine taxonomy tables have nonzero row counts.
5. `skillup_dev.domain_tools.role_id` exists.
6. `skillup_dev.programme_school_cutoff.jamb_programme_id` is fully backfilled, or every remaining null is explicitly documented and justified.
7. Demand metric foreign key constraints are restored.

If any item is false, Claude Code must fix the cause and rerun the recovery/audit loop before handing back the result.
