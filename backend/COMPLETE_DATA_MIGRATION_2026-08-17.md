# Sifter LevelUp complete data migration

Status: reconciled and regenerated on 2026-08-31.

This is the authoritative runbook for the current career, JAMB, domain,
admission, and source-backed resource data. SQL files are generated outputs;
the partition manifest, JSON parts, and generators under
`data/career-mapping/` are the sources of truth.

## Current goal gate before SQL (2026-09-23)

The active scaling phase is local-first. Before applying any SQL, complete and
record the following checks:

1. Run the canonical subject/JAMB local audits.
2. Run the corrected all-420 JAMB resource audit and inspect its
   `*_corrected_004_*` manifest. The student denominator is 420 canonical JAMB
   identities; the 237 CCMAS packages are supporting curriculum evidence, and
   the 11 anchor-absent identities must not be classified unavailable merely
   because the anchor is absent.
3. Run the all-programme downstream/admin route audit for the 420 JAMB and 237
   CCMAS scopes, including ownership, provenance, student-safe filtering and
   review-state gates.
4. Finish the local scaling and browser-proof gates. Only after those gates are
   recorded may the manual SQL sequence in this document begin.

These checks are local evidence only. No generator, audit, REST read or browser
result is proof that Supabase has been deployed. This document preserves the
manual-only constraint: when the user is applying SQL manually, prepare and
validate the files and verification queries, but do not execute SQL through an
application client, REST, RPC, `psql` or an automated SQL tool.

## Canonical current deployment order (2026-09-11)

This section controls the current JAMB/offering/subject refresh. Older order
tables later in this document describe historical or staging-only paths and do
not override this sequence.

### A. Rebuild and verify the generated artifacts locally

Run from the repository root:

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

The explicit source ledger is
`data/career-mapping/_audit/jamb_brochure_manual_source_confirmations_2026-09-11.json`.
It records source-backed, confirmed-blank, and confirmed-missing brochure
contexts. Confirmed blank/missing contexts remain review-visible but are not
eligible for subject matching.

### B. Apply missing schema files to an existing Supabase project

Run a read-only preflight first. Apply only missing files, one complete
transaction at a time, in this order:

```text
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_jamb_programme_learning_resources_2026-09-23.sql
backend/migration_subject_rule_records.sql
backend/migration_student_pipeline_live.sql
backend/migration_school_faculty_filter_2026-09-09.sql
```

Then apply in-scope additive provisioning, identity, institution, consent,
verification, guidance-report, and account-lifecycle migrations only after
their prerequisite tables exist. Never use `migration_career_v2.sql` as an
ordinary production patch; it is a destructive empty/staging taxonomy rebuild.

### C. Apply the generated data seeds

After the schema succeeds, apply these files in exactly this order:

```text
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_jamb_programme_learning_resources_2026-09-23.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
```

The last file is a controlled replacement transaction for the national matcher
tables. Back up affected tables first on an existing project. Run the
post-apply queries in this document, then rerun the exhaustive matcher audit
and only afterward test provisioning, guidance, matching, or reports.

The generated SQL has been locally regenerated and audited. It has not been
executed against Supabase by this audit; the post-seed queries below are the
required proof of a successful Supabase run.

### D. Apply source-grounded guidance after the career tables and seed exist

After the local goal gate above and the canonical career schema/seed succeed,
apply these additive files in this order. `migration_career_v2.sql` is not in
this path; it is a destructive empty/staging taxonomy rebuild and is permitted
only for an explicitly approved empty staging database.

```text
backend/migration_programme_domain_evidence_2026-09-17.sql
backend/migration_programme_domain_review_corrections_2026-09-18.sql
backend/migration_contextual_career_items.sql
backend/migration_career_context_claim_validation.sql
backend/migration_career_item_relationships_2026-09-17.sql
backend/migration_career_context_path_targets.sql
backend/migration_sociology_curriculum_contract_2026-09-17.sql
backend/migration_programme_curriculum_contract_general_2026-09-18.sql
backend/migration_guidance_programme_reading_and_market_scope_2026-09-12.sql
backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql
backend/migration_domain_student_orientation_2026-09-18.sql
backend/migration_sociology_domain_tool_path_2026-09-18.sql
backend/migration_guidance_all_programmes_2026-09-12.sql
backend/migration_guidance_global_2026-09-11.sql
```

Then load `backend/seed_career_context_items_v1_parts/part-001.sql.gz` through
`part-035.sql.gz` in numeric order. The generated manifest is
`data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json`; use that
manifest as the authority for current row counts, part counts and checksums.
Historical row counts in this document must not be used as deployment proof.
Decompress one part only when executing it; do not create or apply a monolithic
uncompressed copy.

The contextual parts also contain normalized `career_item_relationships`
rows. Apply `migration_career_item_relationships_2026-09-17.sql` before the
parts, and apply `migration_career_context_path_targets.sql` before any seed
that writes theme/use-case, requirement-level, or downstream-path-target data.
Path targets are separate from item-to-item edges and must resolve to an
evidenced specialization or role. Only same-context source-backed `builds_on`/`works_with` edges whose
targets resolve to another typed item may be promoted. A `not_established` row
is an audit/source-review coverage state, not a student-facing relationship
and not evidence of a requirement.

The domain rows in that seed are built from domain-owned evidence. Role skills
and tools remain role-level context rows and are never used as the domain
foundation. The all-programmes migration adds programme-owned context and
resources for all 237 parsed CCMAS programmes. Each row records the original
CCMAS JSON filename and is anchored to the official NUC CCMAS page. Open
references are optional foundation aids, not claims that a Nigerian university
prescribes them. Sociology remains the only programme with specifically
reviewed Haralambos/Holborn and Giddens publisher/library references, with
OpenStax as the free open-text alternative.

### JAMB resource-scope correction — 2026-09-23

Student-facing lookup covers all **420 canonical JAMB identities**; the 237
CCMAS packages are supporting curriculum evidence only. A CCMAS anchor is
optional, so the 11 anchor-absent occurrences must receive the same external
learning-resource enrichment and must not be classified unavailable solely
because the anchor is absent. Use the append-only local ledger produced by
`data/career-mapping/_audit/audit_programme_jamb_resource_evidence_2026-09-23_003.py`
(`*_corrected_004_*` outputs) as current resource-scope evidence. Resource
availability is separate from downstream mapping review. Do not apply this
audit artifact as SQL; regenerate dependent seeds only after local acceptance,
then use the exact migration order above. The generated identity-specific
transport is `backend/seed_jamb_programme_learning_resources_2026-09-23.sql`;
it contains 1,273 source rows for all 420 names, including the 11 anchor-absent
identities, and retains each URL, locator and access date. Its rows remain
`review_only` until explicit admin/student approval; local generation is not
live deployment proof.

### Programme-to-domain evidence contract

After the canonical career seed has created the `programmes`, `domains`, and
`programme_domain` rows, apply:

```text
backend/migration_programme_domain_evidence_2026-09-17.sql
backend/migration_programme_domain_review_corrections_2026-09-18.sql
backend/seed_programme_domain_evidence_2026-09-17.sql
```

The current corrected evidence seed contains 1,364 active resolved rows sourced from the cleaned audit
file `data/career-mapping/_audit/programme_domain_evidence_2026-08-17.json`.
These rows preserve the audited mapping type and provide course anchors,
transferable evidence, source provenance, and review flags for a
programme-specific explanation. They do not replace or relabel the mapping.
The backend must omit unsupported anchors when this additive table is not yet
deployed; it must never synthesize them from a neighbouring programme, a role
aggregate, or a generic domain description. Rows flagged for review remain
explicitly marked as review routes in the UI.

### Clean programme curriculum contract

The legacy `jamb_programmes.skills_technical`, `skills_transferable` and
`skills_count` fields are compatibility data only. They flatten course
outcomes, programme abilities and shared records, and can contain source
annotations or unrelated exceptions. They are not a student-facing curriculum
source.

After the canonical Sociology programme exists, apply the additive schema and
seed below, in this order:

```text
backend/migration_sociology_curriculum_contract_2026-09-17.sql
backend/migration_programme_curriculum_contract_general_2026-09-18.sql
backend/seed_sociology_curriculum_contract_2026-09-17.sql
backend/seed_programme_curriculum_contract_2026-09-18_parts_gz/part-001.sql.gz ... part-004.sql.gz
```

The seed contains 236 Sociology course-outcome rows and seven separately
stored programme abilities (243 curriculum records total). The 14 reviewed
theme groupings explain these records without replacing or discarding outcome
evidence. Every outcome keeps its course code/title, source
locator and source wording; its student text is only the cleaned form of that
same record. Appended source annotations are excluded from student text and
remain in the local audit artifact. No domain, subgroup or role row is written
by this contract. The backend returns an honest `not_seeded`/`unavailable`
state when the two objects are absent and never falls back to the legacy skill
arrays.

The outcome table also stores a presentation-only `display_group`. The local
Sociology builder derives it from the checked-in course code: `SOC` and the
explicitly related `PSY` records are shown as Sociology programme courses,
`SSC` records as supporting Social Sciences courses, and `GST`/`ENT` records
as shared university courses. This keeps shared and supporting study visible
without presenting it as Sociology-specific learning. It is not an academic
reassignment and must not be used to delete or alter source rows.
The seven programme abilities likewise carry concise source-derived display
titles and faithful student wording. Their original source text remains for
staff audit and must not be rendered as the student-facing heading.

The generic contract extends the same student-facing boundary to the other
236 parsed programmes. Build it only after reconciling flagged course rows
against the original CCMAS PDFs:

```powershell
python data/career-mapping/_audit_original_ccmas_review.py --original-source-dir "C:\tmp\sifter-ccmas-original\ccmas original documents"
python data/career-mapping/_build_programme_curriculum_contract.py --out backend\seed_programme_curriculum_contract_2026-09-18.sql
python data/career-mapping/split_large_artifacts.py split-sql backend\seed_programme_curriculum_contract_2026-09-18.sql backend\seed_programme_curriculum_contract_2026-09-18_parts_gz --max-bytes 40000000 --gzip
```

After applying the general contract migration, execute the compressed parts in
numeric order after the Sociology seed. The local build currently contains
81,186 source-backed outcomes for 236 non-Sociology programmes. The original
source review manifest contains the remaining review-only course rows; those
rows are not eligible for student display. Do not treat the local seed as live
until the manual Supabase apply and post-apply counts succeed.

The local proof commands are:

```powershell
python data/career-mapping/_audit_programme_curriculum_contract.py
python data/career-mapping/_build_sociology_curriculum_contract.py
python data/career-mapping/_gen_sociology_curriculum_seed.py
```

The new `career_context_items.guidance_owner` column is part of the
contextual migration. Existing unclassified rows default to `review_only`.
Only rows whose explicit owner matches their context level can reach student
responses. Role-aggregated foundation and tool rows remain staff-audit-only;
they may support internal quality checks but cannot define a domain foundation.

The current worktree also contains the development preview of the corrected
career taxonomy/context payload. Its repository transport form is the ordered,
gzip-compressed directory
`backend/seed_career_v2_2026-09-12_parts_gz/`; the local reconstructed form is
`backend/seed_career_v2_2026-09-12.sql`. The local monolithic file is ignored
by Git because it is about 660 MB. It is a development/staging output and must
not be applied to a populated production database without preflight, backup,
approval and post-seed verification.

A read-only check of the configured Supabase project on 2026-08-24 found the
older live subject state (506 options, 4,593 option items, and 0 typed rule
records). The API now refuses to use national option rows unless they agree
with the typed rule layer, so this stale state fails closed rather than
producing untrusted matches. Apply both subject seeds in the order below, then
rerun the post-seed queries.

Do not paste every SQL file in `backend/` into Supabase in filename order.
Several files are historical patches, rollback scripts, or superseded schema
variants.

## D078/Sociology student-display reseed and retest (2026-10-14)

> **Current order of record:** use the single authoritative 15 October schema,
> seed, transport and postflight sequence in
> [`MIGRATION_RUNBOOK.md`](MIGRATION_RUNBOOK.md#authoritative-d078sociology-apply-order-15-october-2026).
> That sequence supersedes this document's older abbreviated lists. Do not
> execute a historical list below as a complete migration plan.

The local guided-screen changes are not live until the corresponding reviewed
data is seeded. On an existing database, run a read-only preflight, apply only
missing schema files in the dependency order in `MIGRATION_RUNBOOK.md`, and
do not run `migration_career_v2.sql` or otherwise rebuild the taxonomy.

The seed order is centralized in the current runbook section linked above so
schema dependencies, the D078 route-visibility recalculation, and the separate
role-item contract seed cannot be missed or applied out of order. The generic
contextual parts must precede the final D078 guided-content overlay.

The current D078 guided-content transport is compressed at
`backend/seed_d078_guided_content_2026-10-12.sql.gz`; regenerate the plain SQL
with its builder before applying. The latest local builder emits 202 domain/
area items (52 student-eligible domain and 150 area-owned cards/options), including 14
task-linked area-tool additions. The distinct 173 role-item contracts are
seeded by `backend/seed_d078_role_item_contracts_2026-10-15.sql`, after
`backend/migration_d078_role_item_contracts_2026-10-15.sql`. The seed uses the
consolidated master for placement decisions (171 approved, 2 unapproved) and
the repaired content lane for all 173 nonblank definitions and item-level link
reviews; no candidate-only link states remain. Five records have no current
canonical role owner and are retained without invented routes; the seed carries
224 supported role-owner links. The current seed marks 166 individual
role-item records `student_display_approved = true` after checking approved
disposition, current role ownership and a reviewed HTTPS learning/reference
link. The other seven retain explicit reasons: two unapproved, three approved
but without current role owners, and two with no supported D078 learning route.
The same seed now materializes 202 deduplicated approved role-owned cards into
`career_context_items`; 166 eligible records can map to multiple role owners.
This item flag does not grant SELECT on the staff-only contract table and does
not approve the whole graph. The API reads the student-owned projection and
may merge the same reviewed runtime explanations. Graph inclusion alone is not
student release.

Repository transport rule: generated audit JSON and generated seed SQL are
stored as `.json.gz` or `.sql.gz` transport artifacts when the compressed
counterpart is present. Small manifests and migration DDL remain plain text.
Decompress the selected transport before applying it; Supabase cannot execute
gzip bytes, and the raw and compressed copy of the same seed must never both
be applied.
Historical source-level false gate values are preserved only inside
`contract_payload.historical_gate_values`; the seed recomputes current item
eligibility and omits the legacy `role_task_relationship_verified = false`
field from the active payload. Those historical values must not become stale
blockers.

The required additive schemas include programme/domain evidence, Sociology
curriculum, contextual claim validation, relationship explanations and path
targets, the seven-area taxonomy, route visibility, and the role-item contract.
Their dependency order and preflight checks are in the linked runbook. Do not
blindly reapply files or treat local seed generation as live deployment.

For the current D078 slice, the runbook's **D078 SQL-to-student-display
contract** is part of the migration requirement, not optional documentation.
The SQL must load the 14-theme Sociology contract, seven canonical areas,
26 area-role routes, 202 domain/area runtime rows, the three compulsory
foundations, the 173 role-item ledger rows, the 202 student-owned role cards
projected from eligible role records, and 95 optional role-tool rows in their
dependency order. Student visibility still requires current ownership,
approved claim review, linked HTTPS evidence and a reviewed explanation; a
stale `false` field is not a blocker, but a current failed gate remains hidden
with its reason. The role-item ledger is staff/backend-only; the companion seed
also projects approved role cards into the student-owned contextual table. The
API/runtime D078 contract and student-owned contextual rows must be deployed
together. Do not treat a successful SQL transaction or
row count as proof that the student UI can display the route; perform the
post-seed programme -> domain -> area -> role payload checks in the runbook.

After seeding, verify the exact postflight counts and API checks in the linked
runbook: 14 Sociology themes; seven canonical areas and 26 routes; 202 approved
domain/area runtime items (52 student-eligible domain and 150 area-owned); 173 role-item decisions (171 approved, 2
unapproved), 166 eligible role-item records, 202 student-owned role cards and
224 supported role-owner links. Then
retest student screens, selection removal, tray, reports and print. A database
count alone does not prove the UI renders those records. If any student payload
is empty, inspect seed state, owner, claim state and link state before changing
filters; never reintroduce legacy unreviewed content to fill an empty section.
Keep SQL application manual and verify post-apply counts.

## Current generated outputs

| Output | Current contents |
|---|---:|
| `seed_career_pilot.sql` | 243 CCMAS/custom programmes, 861 schools, 420 JAMB programme names, 420 mappings, 9,130 unique university offerings, 420 national requirement rows, 3,884 university exceptions, 2,031 university subject options, 12,213 university option items, 2,706 brochure source variants |
| `seed_subject_catalog.sql` | 46 canonical subjects |
| `seed_subject_options.sql` | 604 national subject options and 8,007 national option items; replacement seed for directly matchable subject combinations |
| `seed_subject_rule_records.sql` | 1,260 typed UTME/O-level/direct-entry rule records: 678 matchable, 135 structured source rules, 2 cross-references, 420 direct-entry records, 25 explicit source-missing records |
| `seed_career_v2.sql` | 160 domains, 460 subgroups, 5,038 roles, 47,111 tools, 240 certifications, 2,058 programme-domain links, 70,246 programme-role scores, 709 JAMB-domain links, 4,000 overlaps |
| `seed_career_v2_preview_2026-08-26_parts_gz/` | Development preview transport: 20 ordered gzip parts for 160 domains, 486 subgroups, 5,050 roles, 47,471 tools, 240 certifications, 1,683 historical programme-domain links, 70,246 programme-role scores, 3,164 JAMB-domain links, and 4,000 overlaps; 11 reviewed no-direct-local-match rows remain explicit |
| `seed_career_v2_2026-09-12_parts_gz/` | Current development/staging transport: 22 ordered gzip parts for 160 visible domains, 545 supported subgroups, 5,093 roles, 48,163 tools, 240 certifications, 1,683 historical programme-domain links before the evidence-gate cleanup, 70,246 programme-role scores, 3,163 JAMB-domain links, 4,000 overlaps, and 5,090 role work profiles |
| `seed_career_resources_v1_parts/` | 160,914 source-backed resource rows in 322 batches, split into pushable SQL transactions |
| `refresh_jamb_programme_domain_2026-08-17.sql` | 709 JAMB-domain links; standalone replacement only |

## 2026-09-12 authoritative career-seed refresh

The older `seed_career_v2.sql` and 2026-08-26 preview counts in historical
notes are superseded for this refresh. The repaired generator now emits 160
visible domains, 545 supported ISCO subgroups, 5,093 roles, 48,163 tools,
240 certifications and 5,090 role work profiles. The 35 former structural
review cases are resolved by materializing the roles' existing ISCO sub-major
ownership and reconciling counts after canonical role deduplication. Roles
without a supported subgroup taxonomy retain a direct domain-to-role path with
a null subgroup reference; no subgroup mapping is invented.

The current transport is
`backend/seed_career_v2_2026-09-12_parts_gz/` with 22 ordered gzip parts. The
resource gate and role-completeness audit pass after this repair. Reviewed
no-direct-local-match rows remain explicit; they are not converted into
invented Nigerian counterparts.

The resource artifacts are intentionally partitioned. The JSON parts are
build inputs and are not read by the application at runtime. The SQL parts
seed the `skillup_dev.career_learning_resources` table consumed by the backend.

The oversized current career artifacts use the same transport rule. Their
`.gz` parts are repository storage artifacts, not executable SQL or directly
readable JSON inputs:

- `backend/seed_career_v2_preview_2026-08-25_parts_gz/` (historical)
- `backend/seed_career_v2_preview_2026-08-26_parts_gz/` (current)
- `data/career-mapping/role_tools_parts_gz/`
- `data/career-mapping/nigerian_entity_extraction_audit_2026-08-25_parts_gz/`

Each compressed part is below 41 MB. Reassemble them from the repository root
before use:

```powershell
python data/career-mapping/split_large_artifacts.py join-json `
  data/career-mapping/nigerian_entity_extraction_audit_2026-08-25_parts_gz/manifest.json `
  data/career-mapping/nigerian_entity_extraction_audit_2026-08-25.json
python data/career-mapping/split_large_artifacts.py join-sql `
  backend/seed_career_v2_preview_2026-08-26_parts_gz/manifest.json `
  backend/seed_career_v2_preview_2026-08-26.sql
```

Supabase cannot run `.gz` bytes. The reassembler verifies every part checksum.
Use the reconstructed file through a verified `psql` connection with
`ON_ERROR_STOP=1`, or decompress and apply the numbered parts in order through
the SQL Editor. Each current part is a complete transaction; never paste or
upload the compressed bytes to Supabase.

```powershell
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" `
  -v ON_ERROR_STOP=1 `
  -f backend/seed_career_v2_preview_2026-08-26.sql
```

The current population gate permits this development preview. The 11 reviewed
no-direct-local-match rows are intentionally represented as explicit gaps, not
invented Nigerian matches. This does not authorize production promotion.

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
7. `backend/migration_role_tools.sql`
8. `backend/migration_source_backed_career_layers.sql`
9. `backend/migration_enrichment_v1.sql`
10. `backend/migration_market_intelligence_v1.sql`
11. `backend/migration_role_detail_enrichment.sql`
12. `backend/migration_certification_lifecycle.sql`
13. `backend/migration_career_resources_v1.sql`
14. `backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql`

For the current career preview, the dependency-critical subset is:

```text
migration_career_v2.sql
  -> migration_admission_intelligence.sql
  -> migration_role_tools.sql
  -> migration_source_backed_career_layers.sql
  -> migration_enrichment_v1.sql
  -> migration_market_intelligence_v1.sql
  -> migration_role_detail_enrichment.sql (when role detail data is used)
  -> migration_certification_lifecycle.sql
  -> migration_career_resources_v1.sql (when resource data is used)
  -> migration_guidance_ownership_and_sociology_resources_2026-09-11.sql (when the reviewed Sociology/D078 guidance slice is used)
  -> migration_saved_resource_support.sql (after saved_items exists)
  -> seed_career_v2_preview_2026-08-26_parts_gz/ (reconstruct locally; development only)
  -> seed_certification_lifecycle.sql (apply provider lifecycle statuses and replacements after credential rows load; name matching is punctuation-normalized)
```

`migration_role_tools.sql` must precede
`migration_source_backed_career_layers.sql`, and both must precede the current
preview seed. The preview inserts the source-backed columns and role-scoped
tool ownership that those migrations create. This order is specific to the
current preview and does not authorize a production deployment.

`migration_guidance_ownership_and_sociology_resources_2026-09-11.sql` is an
additive reviewed-slice migration. Run it only after
`migration_career_resources_v1.sql` and the source-backed career layers. It
adds explicit programme/domain/subgroup/role resource ownership, labels old
D078 role-aggregated tool rows for audit rather than student guidance, adds
the staged domain-foundation table, and seeds the reviewed Sociology → Social
Sciences → Computational Social Science → Statistician links. It is
idempotent for its reviewed rows and must not be replaced by a broad resource
import. The API keeps its ownership checks as a fail-safe, but the migration
is the canonical data fix.

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
2. `backend/migration_school_identity.sql` (also adds source-backed
   `schools.official_name` and `schools.short_name`; populate them only from
   an authoritative institution registry, never by expanding acronyms in the
   frontend)
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
parsed-option tables before inserting the current 604 options and 8,007
items. Run both after `seed_career_pilot.sql`; take a backup before using the
replacement seed on an existing production database. The rule-record layer
preserves every source condition and blank cell; only matchable records become
subject-picker rows. “Any other subject” is an explicit open slot across the
active catalogue; “relevant”, “suitable”, and “appropriate” require an
explicit source/category scope or a narrow same-programme exam-layer scope.
Conditional NBC/NTC/TC-II wording is not merged into the ordinary national
rule, and one subject cannot satisfy two distinct groups.

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
   requirement rows, 604 national subject options, 8,007 national option items,
1,260 typed subject-rule records,
861 schools, 9,130 unique school-programme offerings, 3,884 university
exceptions, 2,031 university subject options, 12,213 university option items,
420 programme mappings, 160 visible domains, 460 subgroups, 5,038 roles,
2,058 programme-domain links, 709 JAMB-domain links, and 160,914 resource
rows. The 9,130 offering pairs and all 420 mapping chains were independently
audited with zero structural errors. The typed rule layer covers every
national requirement layer; 25 rows are explicitly source-missing and are not
invented into subject combinations.
All three orphan checks must return zero.

## Local verification already completed

- Resource gate: PASS; 160,914 rows and zero mechanical validation errors.
- Resource FK reconciliation: zero invalid domain, subgroup, or role IDs.
- JAMB inheritance audit: 420/420 names resolved; zero stale names and zero
  component mismatches.
- Seed regeneration: all 420 programme mappings link to a programme; the
  subject-option completeness audit passed for all 604 emitted options.
- Exhaustive subject matcher audit: 226 O-level options and 378 UTME options,
  220 negative mutations, and zero independent-oracle mismatches.
- Python compilation and JSON parsing passed for the generators and canonical
  artifacts.
