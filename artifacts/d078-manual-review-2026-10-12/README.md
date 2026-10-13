# D078 manual-verification bundle

This bundle contains locally generated D078 taxonomy and guided-content SQL,
plus the reconciled graph artifacts used to validate them. It is for manual
inspection and is **not applied to Supabase**.

## Contents and counts

- Seven current Areas of Specialization; no retired/legacy subgroup labels.
- 26 reviewed Area-to-role routes: 18 supported and 8 conditional. Conditional
  scope, evidence, and boundary notes are retained.
- 190 approved contextual learning items: 52 domain items and 138 distinct
  Area cards.
- Consolidated D078 master reconciliation and the detailed programme-to-role
  graph, plus the current promotion gate and implementation-verification
  records, compressed as `.json.gz`.
- SQL migration and seeds, compressed as `.sql.gz`.

## SQL order and prerequisites

The canonical career schema and D078 domain/role rows must already exist.
Apply the taxonomy files in this order:

1. `migration_d078_specialization_taxonomy_2026-10-12.sql.gz`
2. `seed_d078_specialization_taxonomy_2026-10-12.sql.gz`
3. After the documented contextual-item schema and the 35 generic contextual
   seed parts are applied, `seed_d078_guided_content_2026-10-12.sql.gz`.

Decompress each SQL file before applying it. Preserve transaction boundaries
and follow `backend/MIGRATION_RUNBOOK.md` for the full prerequisites. Do not
apply the taxonomy rebuild migration (`migration_career_v2.sql`) as part of
this additive D078 package.

The seed updates the D078 domain display name to **Social Sciences &
Behavioural Research**. The app's local runtime currently reads its areas and
route details from the checked-in catalog/graph; this SQL package does not
switch the API to database reads or constitute public student-release approval.

## Integrity

`manifest.json` contains SHA-256 checksums and compressed sizes for every
payload. Regenerate the compressed bundle from repository sources with:

```powershell
python data/career-mapping/_audit/package_d078_manual_review_2026_10_12.py
```

The Markdown checkpoint documents state; it is not an input to the SQL
generator. Regenerate the SQL from canonical JSON inputs with:

```powershell
python data/career-mapping/_build_d078_taxonomy_seed_2026_10_12.py
```
