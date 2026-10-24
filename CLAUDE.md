# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sifter LevelUp is a Duolingo-style learning app for crypto literacy and quant finance. It has two main parts: a React Native/Expo mobile frontend and a FastAPI Python backend, backed by Supabase (Postgres) with Celery/Redis for background jobs.

## Windows local command runner contract

- The current operator workflow is the IDE and its integrated terminal, not the
  Codex CLI. Do not redirect instructions or diagnostics to a CLI workflow.
- If the IDE reports `Failed exit -1`, distinguish the IDE runner status from
  the child process: capture the exact command and child exit code/output before
  attributing the failure. A successful shell probe does not prove that a
  long-running IDE task runner is fixed.
- Prefer explicit executable paths for project launchers: `node.exe` with
  `node_modules/expo/bin/cli`, `uv.exe`, and `python.exe`. Do not invoke bare
  `npx`, `pnpm`, or `python` from PowerShell when a `.ps1` shim may be selected.
- Use `scripts/start-frontend.ps1` and `scripts/start-backend.ps1`; they run in
  the foreground and return the child process exit code. Do not detach services
  or hide their output when the user is diagnosing startup.
- Run one command per process invocation; avoid shell-nested quoting and
  `cmd.exe /c` wrappers for Python/Node arguments. In PowerShell, use `.cmd`
  only when a package-manager command is required, and preserve its
  `$LASTEXITCODE` immediately.
- Pytest scratch folders are ignored; do not recursively scan or delete
  permission-protected temporary folders to resolve a command failure.

## SUPABASE APPLY-NOW CONTRACT — READ BEFORE TESTING ADMIN, MATCHING, OR REPORTS

This is the visible deployment order Claude must follow when the task involves
Supabase, subject matching, school provisioning, account deletion, guidance
resume, or report printing. The configured REST keys cannot run DDL: use the
Supabase Dashboard SQL Editor or `psql` with the project database connection
string. The complete explanation and verification queries are in
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md` and
`backend/MIGRATION_RUNBOOK.md`.

### Current goal execution gate (2026-09-23)

For the current scaling goal, local evidence comes before every SQL action:

1. Run the canonical local subject/JAMB audits and the corrected all-420 JAMB
   resource audit (`*_corrected_004_*`), including the 11 identities without a
   CCMAS anchor.
2. Run the all-programme downstream/admin route checks against the 420 JAMB
   identities and 237 CCMAS supporting packages, including the student-safe and
   admin/provenance gates.
3. Complete the remaining local scaling and browser-proof gates. Only then
   enter the manual SQL phase below, using the dependency order exactly as
   written.

No local generator, audit, REST read, or browser result is a live deployment
claim. Do not apply SQL during the local scaling phase. In manual-only mode,
prepare and validate the files, then stop for the user to apply them manually.
The final contextual load is
`backend/seed_career_context_items_v1_parts/part-001.sql.gz` through
`part-035.sql.gz` in numeric order, after its migrations and prerequisite
curriculum seeds.

### Canonical 2026-09-11 order

When the task concerns the current JAMB/offering/subject refresh, use the
following order. Do not apply SQL files by filename order and do not use the
historical full-rebuild sections below as a substitute for this sequence.

#### 1. Regenerate and audit locally before applying SQL

From the repository root, run the source-confirmation replay and generators in
this order:

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

If the course/JAMB audit filename differs in the local checkout, use the
checked-in audit script whose name begins `_audit_course_and_jamb_mapping`.
The manual confirmation source is
`data/career-mapping/_audit/jamb_brochure_manual_source_confirmations_2026-09-11.json`.
Do not infer blank or missing brochure cells from a neighbouring programme.
Only matchable typed rules may become picker options.

#### 2. Apply the current schema dependencies

On an existing Supabase project, run a read-only preflight and apply only
missing files, one transaction at a time, in this order:

```text
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_school_subject_pass_conditions_2026-10-24.sql
backend/migration_jamb_programme_learning_resources_2026-09-23.sql
backend/migration_subject_rule_records.sql
backend/migration_student_pipeline_live.sql
backend/migration_school_faculty_filter_2026-09-09.sql
```

Then apply any requested additive onboarding, identity, institution, consent,
verification, guidance-report, or account-lifecycle migrations only after the
base tables they extend exist. Never run `migration_career_v2.sql` against a
populated project; it is a staging/empty taxonomy rebuild.

#### 3. Apply the generated data in dependency order

Keep each transaction intact and stop at the first error:

```text
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_jamb_programme_learning_resources_2026-09-23.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
```

`migration_school_subject_pass_conditions_2026-10-24.sql` must precede the
career-offering seed. The offering seed persists university-specific pass-only
subject conditions separately from credit totals; the matcher can require the
subject selection and flag that grades still need confirmation, but cannot
verify a student's grade.

`seed_subject_options.sql` is a controlled replacement of national matcher
rows. It must be applied after both the career/offering seed and the typed
rule-record seed. A successful local generation is not proof of a live
deployment; rerun the post-apply counts and exhaustive matcher audit in
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`.

The Sociology matcher audit dated 2026-10-24 is
`data/career-mapping/_audit/SOCIOLOGY_MATCHER_INSTITUTION_AUDIT_2026_10_24.json`.
It verifies 98 unique exact Sociology awarders and matching generated offering
rows; a matchable national O-level rule with Mathematics recorded as a separate
pass condition; a matchable UTME rule requiring three of the 15 listed Arts or
Social Science subjects; 8 parsed university-specific full-rule examples; and the
direct Sociology-to-Social-Sciences (D078) evidence link. Never infer a pass
grade from subject selection, and do not treat IGBINEDION's 'as in' note as a
a Sociology offering. This local audit does not prove that Supabase has been
seeded.

### D078/Sociology student-display reseed gate (2026-10-14)

Frontend fixes do not make Sociology data appear in a database that still has
an old or partial seed. Before retesting the programme → Social Sciences →
area → role flow, perform a read-only preflight and apply only missing schema
and seed files. Do not treat an empty student payload as proof that reviewed
content was rejected; compare it with the local approved contracts and seed
counts first.

The authoritative current migration and seed order is the dated
`Authoritative D078/Sociology apply order (15 October 2026)` section in
`backend/MIGRATION_RUNBOOK.md`. That section is the source of truth for this
slice; do not create a second order from this summary or reopen a content
stage that has already passed.

`backend/MIGRATION_RUNBOOK.md` is the single source of truth for the exact
D078/Sociology migration and seed order, prerequisites, transport format,
preflight and postflight checks. Do not maintain or invent a second ordered
list here; if this summary conflicts with the runbook, stop and correct the
summary/runbook before preparing a deployment.

Package gate: every required addition listed in the runbook must travel with it:
migration_career_item_relationship_target_context_2026-10-17.sql,
migration_d078_role_item_contracts_2026-10-15.sql,
migration_d078_requirement_lanes_2026-10-17.sql,
migration_d078_role_route_visibility_2026-10-15.sql,
migration_programme_theme_guidance_2026-10-08.sql,
migration_sociology_giddens_ideas_theme_2026-10-22.sql, and
migration_sociology_theme_resource_repair_2026-10-23.sql. The role, lane,
and relationship-context files are schema dependencies; route visibility is
a post-taxonomy recalculation. The Giddens file is an exact-edition resource
correction after the Sociology resource-ownership migration. The theme-resource
repair is a separate data correction that follows the Sociology programme-theme
seed. The authoritative runbook gives the full sequence; do not create a
competing order here.
Before staging or pushing, verify every runbook-listed migration and selected
compressed seed exists in the target-branch package, including contextual
seed parts 001–035. Never publish a runbook that references absent files or
push raw duplicate copies of a selected compressed seed. Keep the three final
D078 seed transactions separate: guided content, role-item contracts/cards,
then optional role tools. Decompress before SQL execution and never execute
both compressed and raw copies.

The role-item migration stores the complete 173-row backend ledger. The
companion role-item seed also materializes approved, routed records as 202
student-owned `career_context_items` cards; the ledger alone does not make a
role card visible. The current local contract has 171 approved and 2
unapproved decisions, 166 individually eligible records, 224 supported
role-owner links, and 202 deduplicated role cards. The role-tool seed adds 95
optional role-owned tool cards across 19 routed roles. It does not make tools
compulsory or create prerequisite edges.

Repository transport rule: generated audit JSON and generated seed SQL are
stored as `.json.gz` or `.sql.gz` transport artifacts when the compressed
counterpart is present; their raw generated counterparts are not part of the
push package. Small manifest files and migration DDL remain plain text so the
files can be indexed and the schema can be inspected/executed. Supabase cannot
execute gzip bytes directly: decompress a numbered transport before applying
it, and never apply both a raw and compressed copy of the same seed.

For D078 guided content, the compressed transport is
`backend/seed_d078_guided_content_2026-10-12.sql.gz`; decompress the plain SQL
before applying. Never submit gzip bytes to Supabase and never apply both the
plain and compressed copy of the same seed. Use a read-only preflight, apply
only missing files in the order above, stop at the first SQL error, then verify
the seven canonical areas, multi-area role links, role cards, tools, themes,
outcomes, relationship explanations, item-specific links, and programme,
domain, area and role API payloads. Local generation and tests are not
live-deployment proof, and UI selection/tray/report behavior still requires
separate rendered acceptance.

Apply only missing files and preserve the dependency order in the runbook.
The local Sociology curriculum preview is a development fallback, not a
replacement for its seed. The D078 student flow uses seven canonical areas
and reviewed area-role routes; never restore the retired legacy subgroup
buckets. Verify all seven areas and their role routes after seeding, and make
sure programme themes are derived from the full source-backed outcome
contract rather than a fixed three-theme sample.

For participatory-method routing, treat participatory action research as a
governance/orientation frame and interviews, focus groups, surveys and
observation as the evidence methods selected within it. Rebuild the hidden
component route variants and compact UI bundle locally, in this order:

```powershell
python.exe data/career-mapping/_audit/integrate_d078_participatory_component_routes_2026_10_24.py
python.exe data/career-mapping/_audit/export_d078_method_aware_ui_data_2026_10_19.py
```

Each variant is a possible route configuration, not a universally suitable
research design. Its areas and roles are intersections of the reviewed local
method-to-area and method-to-role records. External sources support the frame,
method-choice logic and cautions; they do not independently prove each D078
area/role pairing. The UI projection, saved-selection sanitizer,
tray and HTML/DOCX report must all use the exact selected variant: only shared
area routes and same-area role routes supported by every selected method may
appear, with each method's own contribution and items/tools retained. Never
union unrelated individual-method routes or label every selection universally
appropriate. This is a checked-in graph/UI-data change, not a Supabase row
change: do not regenerate SQL or add a migration unless the graph becomes a
database-fetched runtime contract or the underlying learning-item records
change.

After applying, confirm row counts and request programme, domain, area and
role payloads again. Check that programme themes/outcomes, shared domain
foundations, separately scoped domain options, named tools/methods/knowledge,
area-owned additions, explained relationships, item-specific learning links,
and roles under their reviewed areas are returned as approved/source-backed.
The APSA “Rethinking Political Science Education” report remains an audit
source for a bounded political-science education claim, not a general
Social-Sciences learning resource.
Selection removal, tray opening, and report behavior are application checks
and must be tested separately; SQL success alone is not UI proof. This is a
manual migration flow: do not apply SQL from local code or claim a live reseed
without post-apply counts.

### Career guidance ownership and reviewed Sociology slice

When applying the source-grounded guidance framework, apply this additive
migration only after the career resource schema and source-backed career
layers exist:

This list starts after the canonical career base/schema and career seed have
been applied. `migration_career_v2.sql` is not part of this additive path; it
is a destructive empty/staging taxonomy rebuild and requires explicit staging
approval.

```text
backend/migration_role_tools.sql
backend/migration_source_backed_career_layers.sql
backend/migration_career_resources_v1.sql
backend/migration_jamb_programme_learning_resources_2026-09-23.sql
backend/migration_programme_domain_evidence_2026-09-17.sql
backend/migration_programme_domain_review_corrections_2026-09-18.sql
backend/migration_contextual_career_items.sql
backend/migration_career_item_relationships_2026-09-17.sql
backend/migration_sociology_curriculum_contract_2026-09-17.sql
backend/migration_programme_curriculum_contract_general_2026-09-18.sql
backend/migration_guidance_programme_reading_and_market_scope_2026-09-12.sql
backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql
backend/migration_domain_student_orientation_2026-09-18.sql
backend/migration_sociology_domain_tool_path_2026-09-18.sql
backend/migration_guidance_all_programmes_2026-09-12.sql
backend/migration_guidance_global_2026-09-11.sql
```

### Current JAMB resource-scope correction (2026-09-23)

Student programme lookup covers all **420 canonical JAMB identities**; the
**237 CCMAS packages** are supporting curriculum/evidence packages, not the
JAMB denominator. A CCMAS anchor is optional. Its absence must not make an
otherwise source-supported JAMB identity unavailable or hide it. Enrich all
420 identities, including the 11 anchor-absent occurrences, with external
learning resources while retaining URLs, locators and access dates.

The append-only local correction is generated by
`data/career-mapping/_audit/audit_programme_jamb_resource_evidence_2026-09-23_003.py`
and its `*_corrected_004_*` outputs. It separates resource availability from
downstream mapping review. `genuinely_unavailable` must never mean “no CCMAS
anchor”. This artifact is local evidence only, not live SQL or browser proof.

The corrected 420-row resource ledger is currently an append-only local audit
artifact. The existing all-programmes guidance migration/seed persists the
237 CCMAS supporting packages; it does not silently persist the 420-row JAMB
resource ledger. Do not describe the corrected ledger as live or SQL-loaded
until a dedicated persistence migration/seed is generated and manually
applied.

Run the files in this exact order. The contextual table must exist before the
Sociology migration because it now includes programme-level context cards. The
programme/domain evidence schema and correction migration must precede their
seed. The contextual relationship schema must exist before loading contextual
parts because those parts also contain normalized relationship rows. The
Sociology and generic programme curriculum migrations must precede their
curriculum seeds. The programme-reading/market-scope patch must precede the
Sociology resource migration. The all-programmes migration then adds
programme-owned CCMAS locators, context cards and discipline-specific open
foundation references for all 237 parsed programmes. It does not label those
references as prescribed books; the original PDF filename is retained in each
source locator. The global guidance migration must follow the reviewed
Sociology slice so it cannot overwrite D078. Finally load all 35 compressed
contextual seed parts in numeric order. The generated manifest is
`data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json`.

The contextual seed parts contain the normalized `career_item_relationships`
rows. The generator stores only same-context source-backed `builds_on` and
`works_with` edges whose targets resolve to another typed item. Every
contextual tool and certification without an established edge receives a
`not_established` coverage row. This is an audit/source-review state, not a
student-facing relationship, and it must not be used to infer a requirement.

After the canonical career seed has created the programme and domain registry,
apply the programme/domain evidence migration, its correction migration, and
the generated evidence seed. Load the Sociology and generic programme
curriculum seeds before the contextual parts. Generic curriculum parts must be
decompressed and executed in numeric order; Supabase cannot execute gzip bytes
directly. Do not rebuild student curriculum from legacy skills arrays or role
aggregates.

`backend/migration_career_v2.sql` is not part of this additive path. It is a
staging/empty-taxonomy rebuild and must never be run against a populated
project without an explicit approved rebuild and backup. On an existing
project, use the read-only preflight to apply only missing additive files.

The Sociology migration is the canonical data fix for the reviewed D078 slice:
it records ownership for programme, domain, subgroup and role resources,
labels legacy role-aggregated D078 tools as audit evidence, adds the staged
domain-foundation contract, and seeds the reviewed reading/resource/context
links. The global migration applies the same ownership rule to the other
visible domains without using role-frequency aggregates as domain foundations.
The API ownership filter is a safety net, not a replacement for these
migrations.

### MANDATORY APPLY BEHAVIOUR

#### User-requested manual-only mode

If the user explicitly says that they will run Supabase SQL manually, this
instruction is overridden for that task: do not execute SQL writes through the
service client, REST, RPC, `psql`, or the Supabase SQL Editor. Local code edits,
read-only diagnostics, SQL validation, and local smoke checks remain allowed.
Stop after preparing the exact files and order for the user to apply. Do not
claim that the live database has been reseeded until the user confirms that
the SQL ran successfully.

When the user asks Claude to seed, migrate, update, or prepare Supabase, this
section is an execution instruction, not a reading list. Claude must actually
apply every missing SQL file in the applicable order above, then verify the
result. Do not merely report the filenames, generate a plan, or say that the
schema is ready. Do not proceed to the E2E test until the required migrations
and seeds have been executed successfully.

For an existing project, Claude must:

1. Run the read-only preflight and use its table/column counts to identify what
   is already applied.
2. Apply each missing migration in dependency order, one file at a time, using
   the Supabase Dashboard SQL Editor or `psql` with the configured project
   connection. Keep each file's transaction intact and wait for a successful
   result before applying the next file.
3. Apply the data seeds only after their schema tables exist, in the exact seed
   order listed below. A seed that reports an error is not applied; stop and
   report the file and database error instead of continuing as if it succeeded.
4. Re-run the preflight, record the post-apply counts, and run the exhaustive
   matcher audit. Only then run provisioning, guidance, report, or claim-code
   tests.

If Claude cannot reach the SQL Editor or does not have a usable `psql`
connection, it must say that application is blocked and give the exact next
command/file to run. It must not claim that SQL was applied, must not treat a
REST-only check as DDL execution, and must not fabricate rows to bypass a
missing migration. For a populated production project, apply only files proven
missing by preflight; never use a destructive rebuild or the staging-only
`migration_career_v2.sql` without explicit approval.

### Existing Supabase project: apply missing items only

The current project is not assumed to be fully migrated. First inspect the
schema and counts. Do not blindly rerun a destructive taxonomy migration on a
populated database. For the current student/admin test goal, the required
missing surfaces are commonly these:

1. `backend/migration_school_identity.sql` — `schools.address`, `city`,
   `state`, `country`, and unique school affiliation codes.
2. `backend/migration_guidance_report_paths.sql` — durable student/admin
   guidance checkpoints used by report generation.
3. `backend/migration_goal_apply_now.sql` and, if still absent, the current
   additive auth/account patches listed in the complete migration runbook —
   account-type selection, provisioning, claim-code and deletion support,
   including `account_deletion_cooldowns`.
4. `backend/migration_institution_team_access.sql` and
   `backend/migration_institution_verification_proof.sql` when team or proof
   flows are being tested.
5. `backend/migration_subject_rule_records.sql` — typed national subject-rule
   authority table. This must exist before the subject seeds.

Then run the subject data in this exact order:

```text
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
```

After `backend/seed_career_pilot.sql` creates the canonical JAMB registry,
apply `backend/seed_jamb_programme_learning_resources_2026-09-23.sql` after
its migration. This identity-specific seed covers all 420 JAMB names,
including the 11 without a CCMAS anchor, and retains each URL, source locator
and access date. It is generated from the corrected local ledger and remains
review-only until the separate admin/student approval gate is passed; a local
generation or manual file preparation is not live deployment proof.

`seed_subject_options.sql` is a replacement seed for the national matcher
tables; back up the affected tables first. The API intentionally fails closed
when `programme_subject_rule_records` is empty or does not agree with the
option seed. Do not call that state a passing matcher test.

For the current 2026-09-11 refresh, the complete prerequisite order is:

```text
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_school_subject_pass_conditions_2026-10-24.sql
backend/migration_subject_rule_records.sql
backend/migration_student_pipeline_live.sql
backend/migration_school_faculty_filter_2026-09-09.sql
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
```

On an existing project, use the preflight to skip only files already proven
to be applied. Keep each migration and seed transaction intact and stop at the
first error. The faculty-filter migration must follow
`migration_student_pipeline_live.sql` because it appends `jamb_faculty` to an
existing view without reordering its columns.

The latest local `seed_career_pilot.sql` contains 243 CCMAS/custom programme
rows (237 CCMAS packages plus 6 custom/external rows), 861
institutions, 420 JAMB identities, 9,130 university offerings, 2,706
requirement-source rows, 3,884 university exception rows, 1,998 structured
university option rows, and 12,813 structured option items. Confirm those
totals in Supabase after applying the seed; local generation is not deployment
proof. Do not rely on the older 596/604 option or 7,793/8,007 item counts in
historical notes.

Direct Entry remains stored in the generated seed and database for a future
polytechnic route. The current backend deliberately omits Direct Entry from
student, SS, JAMB, and university guidance responses. Do not remove its
columns/source rows and do not expose it in current UI payloads; this is an API
filtering policy, not a reason to create another migration.

### Fresh or explicitly approved staging database: full order

Apply the following groups in order, keeping each SQL file's transaction
intact:

```text
# 1. Base application
supabase-schema.sql
backend/migration_v2.sql
backend/migration_v2_atomic.sql
backend/migration_auth_profile.sql
backend/migration_fcm_device_tokens.sql
backend/migration_v2_offline_idempotency.sql
backend/migration_v2_offline_streak.sql

# 2. Career, subject, admission, and resource schema
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_subject_rule_records.sql
backend/migration_career_v2.sql       # staging/empty rebuild only
backend/migration_admission_intelligence.sql
backend/migration_role_tools.sql
backend/migration_source_backed_career_layers.sql
backend/migration_enrichment_v1.sql
backend/migration_market_intelligence_v1.sql
backend/migration_role_detail_enrichment.sql
backend/migration_career_resources_v1.sql

# 3. Provisioning, onboarding, guidance, and institution access
backend/migration_provisioning.sql
backend/migration_school_identity.sql
backend/migration_institution_team_access.sql
backend/migration_student_pipeline_live.sql
backend/migration_school_faculty_filter_2026-09-09.sql
backend/migration_ss3_secondary_starting_point_patch.sql
backend/migration_provisioning_guidance_variants.sql
backend/migration_guidance_report_paths.sql
backend/migration_saved_resource_support.sql
backend/migration_student_consent_requests.sql
backend/migration_institution_verification_proof.sql

# 4. Current auth/account/admin patches
backend/migration_goal_apply_now.sql
backend/migration_pending_account_type_patch.sql
backend/migration_signup_auth_apply_now_patch.sql
backend/migration_auth_onboarding_security_patch.sql
backend/migration_account_lifecycle_patch.sql
backend/migration_admin_access_grant.sql
backend/migration_internal_staff.sql
backend/migration_feedback_storage.sql
backend/migration_user_feedback.sql

# 5. Data seeds
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
backend/seed_career_v2.sql
backend/seed_phase8_9_enrichment.sql
backend/seed_career_resources_v1_parts/part-001.sql ... final part
backend/patch_subject_catalog_streams.sql
```

### Current career seed transport (generated 2026-09-12)

The current worktree contains the regenerated transport directory
`backend/seed_career_v2_2026-09-12_parts_gz/`. The corresponding reconstructed
SQL file is intentionally ignored by Git because it is about 672 MB. The
transport directory contains 22 gzip-compressed parts, each below 41 MB, and
is the form intended for repository storage. It was generated after the
source-backed ISCO subgroup repair, source-link rebuild, and current Nigerian
population-gate reconciliation. It contains 160 visible domains, 545
subgroups, 5,093 roles, 48,163 tools and 5,090 role work-profile rows.
Reviewed bounded/local-only states remain explicit and are not replaced with
invented Nigerian mappings.

For a fresh or explicitly approved staging database, the career-specific order
for this current development seed is:

```text
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_subject_rule_records.sql
backend/migration_career_v2.sql                 # staging/empty rebuild only
backend/migration_admission_intelligence.sql
backend/migration_role_tools.sql
backend/migration_source_backed_career_layers.sql
backend/migration_enrichment_v1.sql
backend/migration_market_intelligence_v1.sql
backend/migration_role_detail_enrichment.sql    # if role detail/cert data is used
backend/migration_career_resources_v1.sql       # if resources are used
backend/migration_saved_resource_support.sql    # after saved_items exists
backend/seed_career_v2_2026-09-12_parts_gz/part-001.sql.gz ... part-022.sql.gz
```

This is a generated development/staging seed. Do not apply it to a populated
production database or silently replace the production seed. On a fresh or
explicitly approved staging database, apply
the schema files above first. Then reconstruct the SQL from the compressed
parts:

```powershell
python data/career-mapping/split_large_artifacts.py join-sql `
  backend/seed_career_v2_2026-09-12_parts_gz/manifest.json `
  backend/seed_career_v2_2026-09-12.sql
```

The reassembler verifies every part checksum before writing the SQL file. Apply
that reconstructed file through a verified database connection:

```powershell
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" `
  -v ON_ERROR_STOP=1 `
  -f backend/seed_career_v2_2026-09-12.sql
```

If the SQL Editor must be used, decompress and execute the numbered parts one
at a time in order. Each part is a complete transaction. Supabase cannot
execute `.sql.gz` bytes directly. Before applying it, confirm that
`migration_role_tools.sql` and `migration_source_backed_career_layers.sql`
have been applied because the current seed writes role-owned tool fields and
source-confidence, data-state, provenance and Nigerian-context columns. Keep
the current seed transactions intact, record the database and date, and run the
post-seed count/orphan queries from
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`. The population gate now passes
its structural and source checks; roles without a supported subgroup taxonomy
remain direct domain-to-role rows. Reviewed
no-direct-local-match rows must stay explicit until stronger evidence is found.
This is not a production promotion.

Do not claim that this SQL was applied based on a local generator run. SQL is
only applied through the Supabase SQL Editor or a verified `psql` connection.

If Supabase was seeded from the 2026-08-31 preview or the historical standalone
JAMB refresh, apply
`backend/migration_jamb_domain_mapping_corrections_2026-09-08.sql` after that
load. It repairs the 147 adjacent links that older transport mislabelled as
functional and removes one extra Project Management link. The authoritative
2026-09-12 seed already has the corrected values, and the repair is idempotent.

After `backend/migration_student_pipeline_live.sql`, apply
`backend/migration_school_faculty_filter_2026-09-09.sql`. The undergraduate
setup reads faculties from `jamb_programmes` and filters the selected
university's programme typeahead by that same `jamb_faculty` value. The patch
appends the view column to preserve PostgreSQL view-column order; do not
recreate the view with reordered existing columns.

### Current live partial-seed evidence and manual recovery order

The last read-only preflight found a partially applied project, not a complete
career deployment:

```text
domains                         0
domain_roles                    0
domain_subgroups                460
jamb_programme_domain           3164
v_jamb_programme_domain_paths   missing
v_school_jamb_programmes        present, but old shape without jamb_faculty
```

This explains why Sociology can have a stored JAMB-domain row while its domain
detail and subgroup/role pages remain unavailable. Do not call this a complete
seed. `migration_career_v2.sql` is a staging/rebuild migration and drops
taxonomy tables; do not run it against a populated project without a backup and
explicit approval. On an approved staging rebuild, apply the current career
schema files, the 2026-09-01 compressed career seed parts in numeric order, and
then the live pipeline/view migrations. On the current project, the user must
first decide whether that controlled taxonomy rebuild is approved; the app-side
faculty fallback works even before the faculty view patch is applied.

After the approved career seed/rebuild, apply these additive files in order:

```text
backend/migration_student_pipeline_live.sql
backend/migration_school_faculty_filter_2026-09-09.sql
backend/migration_jamb_domain_mapping_corrections_2026-09-08.sql # only when an older JAMB seed was used
```

The correction file is idempotent and repairs the older 147 adjacent links
mislabelled as functional. The authoritative 2026-09-01 career seed already
contains the corrected mapping, so do not apply the correction as a substitute
for the career seed itself.

### Career seed regeneration rule

If role or subgroup data changes, regenerate from the source inputs in this
order before touching Supabase:

```powershell
python data/career-mapping/_apply_emerging_domain_structure.py
python data/career-mapping/_build_source_backed_layers.py
python data/career-mapping/_audit_role_completeness.py
python data/career-mapping/validate_career_resource_seed_gate.py
$env:CAREER_SEED_OUTPUT_PATH='C:\tmp\seed_career_canonical_2026-09-12.sql'
python data/career-mapping/_gen_career_seed.py
Remove-Item Env:CAREER_SEED_OUTPUT_PATH
python data/career-mapping/split_large_artifacts.py split-sql `
  C:\tmp\seed_career_canonical_2026-09-12.sql `
  backend/seed_career_v2_2026-09-12_parts_gz --max-bytes 40000000 --gzip
```

The first pass materializes the roles' existing ISCO-backed subgroup ownership
and reconciles counts. Roles without a supported subgroup taxonomy remain on a
direct domain-to-role path. The next pass rebuilds source/provenance payloads.
Do not hand-edit the generated SQL or skip the audits. A green local gate proves
seed readiness only; Supabase still requires a production preflight, backup,
explicit approval and post-seed verification.

### Large generated artifact transport

GitHub transport stores the oversized generated artifacts as gzip-compressed
parts, each kept below the 41 MB file limit:

```text
backend/seed_career_v2_preview_2026-08-25_parts_gz/manifest.json   # historical transport
backend/seed_career_v2_preview_2026-08-25_parts_gz/part-*.sql.gz
backend/seed_career_v2_preview_2026-08-26_parts_gz/manifest.json   # current transport
backend/seed_career_v2_preview_2026-08-26_parts_gz/part-*.sql.gz
  backend/seed_career_v2_2026-09-12_parts_gz/manifest.json            # current transport
  backend/seed_career_v2_2026-09-12_parts_gz/part-*.sql.gz
data/career-mapping/role_tools_parts_gz/manifest.json
data/career-mapping/role_tools_parts_gz/part-*.json.gz
data/career-mapping/nigerian_entity_extraction_audit_2026-08-25_parts_gz/manifest.json
data/career-mapping/nigerian_entity_extraction_audit_2026-08-25_parts_gz/part-*.json.gz
```

These `.gz` files are transport artifacts; Supabase cannot execute them
directly. Before using them, run the reassembler from the repository root:

```powershell
python data/career-mapping/split_large_artifacts.py join-json `
  data/career-mapping/nigerian_entity_extraction_audit_2026-08-25_parts_gz/manifest.json `
  data/career-mapping/nigerian_entity_extraction_audit_2026-08-25.json
python data/career-mapping/split_large_artifacts.py join-sql `
  backend/seed_career_v2_2026-09-12_parts_gz/manifest.json `
  backend/seed_career_v2_2026-09-12.sql
```

For Supabase, apply the reconstructed SQL with `psql` as shown above, or apply
the decompressed SQL parts in numeric order. Never paste or upload the `.gz`
bytes. Each current SQL part is a complete transaction. The career generators
and audits load `role_tools_parts_gz` directly through
`data/career-mapping/_role_tools_loader.py`; reassembling `role_tools.json` is
optional. Reassemble the Nigerian audit JSON before
running its dependent review/gate scripts. The original local generated files
are not deleted by the transport process.

### Global search parameter and career-intelligence routing

When changing `useGlobalSearchParams` or any `globalSearchParam` fix, verify
that legacy routing cannot consume or redirect a career-intelligence route's
parameters. Career-intelligence screens should use route-local parameters for
their entity identity and should receive only an explicit, allow-listed
guidance context. If the global search parameter causes legacy routing to
interfere with career-intelligence routing, disable the global search parameter
for that path. If it is genuinely required by an admin or shell flow, resolve
the conflict properly with route namespacing/allow-listing and route-integrity
tests; do not leave a global-parameter fallback that can hijack the career
intelligence flow.

Do not run `backend/migration_career_intelligence.sql`; it is superseded.
After the subject seeds, run the exhaustive matcher audit:

```text
backend/.venv/Scripts/python.exe data/career-mapping/_audit_subject_match_exhaustive.py
```

Only after the audit reports zero oracle mismatches should Claude run the live
school-owner → school code → student provisioning → SS1 guidance → report →
claim-code test. Record the post-seed table counts and any remaining blocker
instead of silently substituting mock data.

### Current-database preflight (read-only)

When the user says to test against the database as it currently exists, run this
before the E2E flow. It never applies SQL or changes rows:

```text
cd backend
.venv\\Scripts\\python.exe _supabase_preflight.py
```

Use the JSON gates directly. `overall: blocked` means test the available paths
and report the exact blocked gates; it does not authorize bypassing the missing
schema with fabricated rows. In particular, `matcher: blocked` is expected
when `programme_subject_rule_records` is empty, and must be reported as no
personalized subject matches rather than as zero valid programmes.

## Commands

### Frontend (React Native / Expo)
```bash
# This project is pnpm, NOT npm. package.json pins
# "packageManager": "pnpm@10.33.0", pnpm-lock.yaml is the tracked lockfile,
# and CI installs with `pnpm install --frozen-lockfile`.
#
# Running `npm install` here looks fine locally — node_modules ends up correct,
# tsc and jest both pass — but it writes a stray package-lock.json and leaves
# pnpm-lock.yaml stale, so CI dies with ERR_PNPM_OUTDATED_LOCKFILE before a
# single test runs. Add and remove dependencies with pnpm.
pnpm install             # install dependencies
pnpm add <pkg>           # add a dependency (updates pnpm-lock.yaml)
npx expo start           # dev server (Expo Go or dev client)
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator
eas build --platform android  # EAS cloud build
eas build --platform ios      # EAS cloud build
```

### Lint / Format / Type-Check
```bash
npx tsc --noEmit                # TypeScript type check (no output)
npx expo lint                   # ESLint via Expo
npx prettier --check "src/**/*.{ts,tsx}"  # Check formatting
npx prettier --write "src/**/*.{ts,tsx}"  # Auto-format
```

### Backend (FastAPI — uses uv)
```bash
cd backend
uv sync                      # install dependencies (creates .venv)
uv run uvicorn main:app --reload  # dev server on :8000
uv run pytest                # run tests
```

### Backend Lint / Format
```bash
cd backend
uv run ruff check .          # Python linting
uv run ruff format .         # Python formatting
```

### Build
```bash
npx expo export              # Production JS bundle
eas build --platform android # EAS cloud build (Android)
eas build --platform ios     # EAS cloud build (iOS)
docker-compose build         # Build backend Docker image
```

### Docker (full stack)
```bash
docker-compose up -d   # starts api, celery worker, celery beat, redis
```

## Architecture

### Frontend (`app/`, `src/`)
- **Expo SDK 55**, React Native 0.76.7, React 19.2, TypeScript strict mode
- Path alias: `@/*` maps to `src/*`
- Navigation: **expo-router** (file-based) — routes live under `app/`, not in a
  navigator config. `@react-navigation/bottom-tabs` is NOT a dependency.
  `app/(tabs)/` currently holds the active destinations plus retained legacy
  learning routes: explore, feed, fields, guild, home, map, myworld,
  opportunities, portfolio, profile, settings, skills, and streaks. The old
  community route files are retired; stale `/community` browser entries are
  repaired by `RouteIntegrityGuard`.
  Which of these are surfaced in the visible tab bar is decided by
  `MOBILE_NAV` / `PRIMARY_NAV` in `src/components/shell/ReferenceShell.tsx`,
  not by the presence of a route directory.
- The `myworld` destination is labelled **Saved** pre-launch, via the
  flag-aware `WORLD_NAV`; it becomes **My World** when
  `featureFlags.myWorldLive` (`EXPO_PUBLIC_MY_WORLD_LIVE`) is on. The route,
  path and NavId stay `myworld` in both cases.
- UI typeface is **Inter** (`@expo-google-fonts/inter`, weights 400/500/600/700)
  with Spline Sans Mono for data/monospace — see `src/theme/fonts.ts`.
- Auth state managed via `src/hooks/useAuth` (React Context), token stored in SecureStore (migrated from AsyncStorage)
- API client in `src/lib/api.ts` — all requests go through FastAPI backend, uses `EXPO_PUBLIC_API_URL` env var
- Reanimated plugin must be last in `babel.config.js` plugins array
- Learning content defined as data files: `src/data/levels.ts`, `quantLevels.ts`, `pythonLevels.ts`, `islands.ts`

### Backend (`backend/`)
- **FastAPI** with Pydantic v2 models (`models.py`)
- Auth (`auth.py`): Telegram initData HMAC, Base wallet EIP-191 signatures, guest auto-create — all issue JWTs
- Database (`database.py`): Supabase client, schema `skillup_dev`
- Config (`config.py`): pydantic-settings, reads from `.env`
- Background jobs: Celery + Redis (`celery_worker.py`)
- Portfolio routes split into `portfolio_routes.py`

### Database (Supabase)
- Schema lives in `supabase-schema.sql` (+ `portfolio-schema.sql` for portfolio tables)
- All tables under the `skillup_dev` schema
- Key tables: `users`, `game_states`, `level_scores`, `transactions`
- User progress tracked via `completed_levels`, `perfect_levels`, `python_chapters_completed` arrays on the users table

### Learning Tracks
Three quant tracks with prerequisite chains:
- **Quant Trader**: Lab 0-7 (math) → Python ch. 1-5 → Lab 8 (applied)
- **Quant Researcher**: Lab 0 (math foundation), no prereqs
- **Quant Developer**: requires Python ch. 1-5 first

## Notable Patterns
- Frontend env: create `.env` with `EXPO_PUBLIC_API_URL=http://localhost:8000`
- Backend env: copy `backend/.env.example` to `backend/.env` and fill in Supabase credentials, JWT secret, etc.

## Skills to Load

Load these skills at the start of relevant work sessions:

### Frontend (React Native / Expo)
- `/react-native-expo` — Breaking changes, New Architecture, SDK 52+ migration
- `/react-native-expert` — Navigation, platform-specific code, FlatList optimization
- `/react-native-architecture` — Project structure, auth flows, offline-first patterns
- `/react-native-best-practices` — FPS, re-renders, bundle size, TTI optimization
- `/vercel-react-native-skills` — List performance, animations, UI patterns, state management

### Data Fetching
- `/tanstack-query-setup` — Query/mutation setup, optimistic updates, infinite queries
- `/tanstack-query-best-practices` — Query keys, caching, prefetching, SSR integration

### Backend (Python / FastAPI)
- `/python-patterns` — Framework selection, async vs sync, project structure, Pydantic
- `/python-performance-optimization` — Profiling, memory optimization, async I/O, caching

### Security
- `/senior-security` — Application security, penetration testing, secure coding practices

### QA & Testing
- `/senior-qa` — Quality assurance, test automation, testing strategy

### Git & Workflow
- `/git-workflow` — Conventional commits, branch naming, PR guidelines

## Mandatory Sifter LevelUp Design & Implementation Brief

This section is the startup contract for any Claude Code session that changes the
product experience. Read it before implementing UI, navigation, onboarding,
career intelligence, or opportunity features. The full source brief is kept at
[`docs/SIFTER_LEVELUP_CLAUDE_DESIGN_IMPLEMENTATION_INSTRUCTIONS-1.md`](docs/SIFTER_LEVELUP_CLAUDE_DESIGN_IMPLEMENTATION_INSTRUCTIONS-1.md),
and the supplied visual references are in
[`design/mockups-20260814T165448Z-1-001`](design/mockups-20260814T165448Z-1-001).
Use both, but treat the running code and real data as the product source of
truth.

### Mission and product principle

Act as the lead product designer, UX architect, interaction designer, and
senior frontend engineer for the existing Sifter LevelUp product. Improve the
real application in place; do not create a disconnected prototype or duplicate
route tree. The product should make complex education and career decisions
understandable to a secondary-school student while supporting deep exploration.

The guiding principle is **simple at the surface, deep underneath**. Make the
following relationship discoverable when the actual data model supports it:

`Subjects → Programmes → Domains/Sub-groups → Roles → Skills → Opportunities`

The user should move from uncertainty to clarity: know where to start,
understand the available options, understand why an option fits, and know the
next useful action.

### Non-negotiable source-of-truth rules

- Audit the repository, routes, components, state, API/data layer, persistence,
  and current UX before changing implementation.
- Use only values present in the codebase or returned by its real data sources.
  Never invent universities, programmes, subjects, cut-offs, JAMB facts,
  careers, skills, opportunities, companies, locations, salaries, dates,
  statistics, testimonials, user details, or match percentages.
- Mockup content is visual reference material only. Examples shown in a mockup
  must not be copied into the product as factual content.
- If data is unavailable, hide the section, derive a transparent value from
  existing data, or show an honest empty/locked state. Do not use fabricated
  filler to make a screen look complete.
- Do not silently change business rules, matching logic, filtering, or source
  data to satisfy a visual design. Record data defects separately.
- Prefer the existing routing, components, API client, hooks, state management,
  utilities, and tokens. Refactor shared patterns rather than creating a
  parallel architecture.

### Required work sequence

For a substantial redesign or feature, follow this order and report the result:

1. **Discover:** inspect the actual entry points, routes, screens, layouts,
   shared components, hooks, services, assets, styling/tokens, auth,
   persistence, API/data sources, and animation conventions.
2. **Audit:** document Critical, High, Medium, and Low UX issues. For each
   important issue state the current behavior, user impact, recommended fix,
   supporting reference pattern, and affected code area.
3. **Plan:** map navigation, information architecture, data relationships, and
   the core user journeys before writing UI code.
4. **Specify behavior:** create screen contracts, component inventories,
   state transitions, data flow, acceptance criteria, and edge-case handling.
5. **Visualize:** inspect the supplied mockups and create/validate visual
   representations of the proposed major states using actual routes and data.
6. **Implement:** build in the existing application, with reusable components
   and real data. Do not stop at a static screenshot match.
7. **Refine:** verify responsive behavior, accessibility, loading, empty/error/
   locked/success states, transitions, and long-content behavior.
8. **Verify:** run the relevant tests/type checks/lint/build and exercise the
   core journeys. Report what works, what is blocked, assumptions, and data
   limitations.

### Core journeys to preserve and improve

Audit these where the codebase supports them, plus any additional existing
journeys:

- New user: landing → onboarding → account/guest → setup → subjects → goals →
  exploration/recommendations.
- Programme discovery: explore → search → programme → requirements → schools/
  → careers → pathways. Cutoff data is not part of the current user-facing flow.
- Domain/career discovery: explore → domain or role → sub-groups/skills →
  programmes → opportunities.
- Opportunities: search/filter → result → detail → save/apply, using only
  supported actions and fields.
- Saved/My World: discover → save → review saved items → continue exploring.
- Returning user: authentication → personalized home/explore → recommendations
  and saved items, with state preserved according to existing persistence rules.

### Screen and component behavior contract

Treat every screen and control as a stateful interactive system, not a static
image. Before implementation, document for each major screen:

- name, route, purpose, entry/exit points, parent/children;
- real data required and its source;
- initial, loading, populated, empty, error, locked, selected, saved, and
  disabled states;
- user actions and the exact system response/state change after each action;
- success feedback, error recovery, retry behavior, and duplicate-submission
  handling;
- navigation/back behavior, deep links where applicable, and what persists
  across leaving, returning, refresh, and session changes;
- mobile, tablet, desktop, and large-screen behavior;
- labels, focus order, keyboard/touch behavior, contrast, target size, and
  reduced-motion behavior.

For every important component record its props/data dependency, local/shared
state, events, side effects, navigation effects, persistence effects, and
possible states. Use this event shape when reasoning about behavior:

`user action → system response → state/data change → UI feedback → next action`

Trace important data end-to-end, for example:

`input → search state → existing service/API/data source → results → selected
entity → parent form/onboarding state → persistence → next screen`.

Do not create a local UI state that contradicts the application's real state or
duplicate an important source of truth.

### Form, search, and selection requirements

Every form needs a behavior contract covering allowed values, required versus
optional fields, validation, character limits, formatting, focus/blur, keyboard
behavior, clear/edit, submit-disabled conditions, loading, success, failure,
retry, persistence, Back, and partial completion.

Search must have a clear focus state, contextual placeholder, query/update
behavior, loading state, real result hierarchy, no-results recovery, request
error recovery, clear/reset, keyboard accessibility, and selection behavior.

Subject selection should use search plus selectable chips/grid, selected count,
obvious selected state, and Continue—not five independent dropdowns—unless the
existing data model genuinely requires another interaction. The allowed
subjects and maximum selection count must come from product logic.

Goal selection should use selectable cards when multiple supported goals exist;
show only actual goals and explain each clearly.

For school or entity search, support the full lifecycle when the data model
allows it: empty → focused → typing → searching → results → selected → saved;
also no results → add flow → validating → adding → added, plus duplicate,
failure, retry, edit, cancel, Back, and repeated-submission behavior. Preserve
entered text on failure and keep a successful selection visible in parent state.
Continue must use the actual selected/created entity without requiring a second
search.

### Visual and responsive direction

Use the supplied references as the visual and interaction system, not as
immutable screens. Favor light surfaces, dark navy/charcoal text, orange
primary actions, green positive states, blue information, amber warnings, red
errors, thin borders, subtle shadows, moderate radius, generous whitespace,
clear Inter-style typography, compact chips, and strong contextual search.
Avoid excessive gradients, shadows, badges, nested cards, clutter, and generic
school-portal styling.

Mobile should use thumb-friendly stacked layouts, bottom navigation where the
existing app supports it, progressive disclosure, and bottom-sheet filters when
appropriate. Desktop must not merely stretch mobile: use the existing platform
capabilities for persistent navigation, wider content, multi-column layouts,
comparison/context panels, and search/filter toolbars. Follow the project's
actual responsive conventions and breakpoints rather than inventing competing
ones.

Centralize or reuse tokens for primary/semantic colors, text, muted text,
border, background/surface, radius, spacing, typography, shadows, motion
durations, and easing. Reuse or improve shared components such as Button,
IconButton, Input/SearchInput, Chip, Badge, Card, domain/programme/opportunity/
school cards, MatchScore, ProgressIndicator, Tabs, Modal/BottomSheet, Toast,
EmptyState, LockedState, LoadingState, FilterBar, Sidebar, and navigation—only
where the pattern is actually reused.

### Interaction, motion, and accessibility

Every interactive element must communicate default, hover (where relevant),
focus, pressed, disabled, loading, success, error, empty, selected, saved, and
locked states as applicable. Empty states explain what happened and the next
action. Locked states explain what is locked, why, and how it unlocks.

Keep motion purposeful and restrained: roughly 200–300 ms fade/slide-up page
transitions, 150–250 ms card appearance, about 100 ms button press feedback,
subtle input-focus transitions, short error feedback, and unobtrusive success
toasts. Match existing animation libraries/conventions and honor
`prefers-reduced-motion` or the platform equivalent. Audit semantic roles,
heading hierarchy, accessible labels, visible focus, keyboard navigation,
screen-reader context, contrast, touch targets, validation/error recovery, and
reduced motion.

### Acceptance and verification standard

A screen is not complete because it resembles a mockup. It is complete only
when hierarchy, real data, interactions, state changes, navigation, loading,
errors, empty/locked states, persistence, responsiveness, accessibility, and
integration with the rest of the product work together.

Deliberately test relevant edge cases: no/one/many results, duplicates, long
text, special characters, empty/invalid input, slow/failed requests, retry,
double submission, Back/cancel, refresh, navigation away and return, existing
saved state, partial completion, mobile keyboard, small screens, large screens,
long programme names, and large datasets. Run the appropriate frontend/backend
checks from the Commands section and report any pre-existing failures separately.

Final implementation notes should include:

1. UX audit and severity of findings.
2. Updated navigation, information architecture, and user journeys.
3. Screen/component behavior map: states, events, data, side effects,
   navigation, persistence, and error recovery.
4. Visual references/mockups used and how they were adapted to real data.
5. Reusable components/tokens and motion/accessibility decisions.
6. Verification performed, known limitations, assumptions, and blocked work.

Do not overwrite the product with screenshots. Preserve correct functionality
and data behavior first, then improve usability and adapt the visual system
around reality. The full brief in `docs/` is authoritative for the complete
design rationale and detailed examples; this section is the operational
checklist Claude Code must follow automatically.

## JAMB Subject SQL Pipeline

The JAMB subject data is split between matchable picker rows and a complete
typed rule-record layer. SQL files are generated from
`data/career-mapping/`; they are not automatically executed in Supabase.

Apply the schema in this dependency order:

1. `backend/migration_career_base_registry.sql`
2. `backend/migration_subject_catalog.sql`
3. `backend/migration_career_pilot.sql`
4. `backend/migration_school_subject_pass_conditions_2026-10-24.sql`
5. `backend/migration_subject_rule_records.sql`
6. `backend/migration_student_pipeline_live.sql`

Then apply the subject data in this order:

1. `backend/seed_subject_catalog.sql`
2. `backend/seed_career_pilot.sql`
3. `backend/seed_subject_rule_records.sql`
4. `backend/seed_subject_options.sql`

Current generated coverage is 46 catalog subjects, 420 JAMB programme names,
9,130 unique university offerings, 604 national matcher options, 8,007 option
items, and 1,260 typed requirement records. The typed records preserve
conditions, cross-references, direct-entry requirements, source variants, and
25 explicitly source-missing layers. Only directly matchable records become
subject-picker options; missing source text must never be guessed.

Subject wording policy is explicit. “Any other subject” is an open slot over
the active exam catalogue, including trade/vocational subjects, unless the
university-specific special-consideration text narrows it. “Relevant”,
“suitable”, and “appropriate” are not categories by themselves: they become
matchable only when the same source row names a list/category or a narrow
same-programme exam-layer rule supplies the scope. A broad unrestricted rule
must never be used as that cross-layer scope. Conditional NBC/NTC/TC-II text
is retained for review but cannot add subjects to the ordinary national rule.
Separate subject groups are assigned distinct slots so one selected subject
cannot satisfy two requirements. Direct-entry wording never supplies UTME or
O-level scope.

`seed_subject_options.sql` is a replacement transaction for the two national
matcher tables. It is not an ordinary additive seed and requires a backup or
controlled deployment on an existing Supabase project.

After regenerating `seed_subject_options.sql`, run
`python data/career-mapping/_audit_subject_option_seed.py`. The audit checks
option capacity, named-source subject coverage, option-item foreign-key codes,
and that every emitted programme and requirement ID exists in the prerequisite
career seed, and that every option agrees with a matchable typed rule record.
A passing generator run alone is not sufficient. The runtime matcher also
fails closed when the typed rule layer is absent or stale, so both replacement
subject seeds must be deployed together.

The runtime matcher is bounded as well as authority-gated. It first uses the
selected canonical `subject_id` values to find candidate option rows, then
limits catalogue, candidate, option, typed-rule and item reads. If the
catalogue identity, candidate set, authority set or item set is unavailable or
exceeds its safety bound, the endpoint returns no exact subject matches rather
than loading the full catalogue or guessing. Parser-expanded broad O-level
groups remain browseable but are review-only unless the source explicitly
defines the open subject scope. This is an application safety rule and does
not require a Supabase migration or seed.

Then run `python data/career-mapping/_audit_subject_match_exhaustive.py`.
This constructs valid selections and negative mutations for every emitted
UTME/O-level option and compares the runtime matcher with an independent
rule oracle. A release is not verified until it reports zero oracle
mismatches.

After applying the SQL, verify the counts and foreign-key checks in
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`. A successful local generator
run does not prove that Supabase has been updated; the SQL editor results are
the deployment proof.

## Career Resource SQL Migration

This repository does not use monolithic career-resource JSON or SQL files.
The resource population is partitioned so it remains pushable to GitHub.

### Source and generated artifacts

- JSON manifest: `data/career-mapping/learning_resource_population.manifest.json`
- JSON parts: `data/career-mapping/learning_resource_population_parts/part-*.json`
- JSON loader: `data/career-mapping/_learning_resource_population_io.py`
- SQL migration: `backend/migration_career_resources_v1.sql`
- SQL manifest: `backend/seed_career_resources_v1.manifest.json`
- SQL seed parts: `backend/seed_career_resources_v1_parts/part-*.sql`
- Full legacy files `learning_resource_population.json` and
  `seed_career_resources_v1.sql` are intentionally absent. Do not recreate
  them for deployment.

### Regenerate and validate

Run from the repository root after changing source data:

```powershell
python data/career-mapping/_build_learning_resource_population.py
python data/career-mapping/validate_career_resource_seed_gate.py
python data/career-mapping/_gen_career_resource_seed.py
python data/career-mapping/validate_career_resource_seed_gate.py
```

The builder recreates the JSON parts and checksum manifest. The SQL generator
loads those parts and recreates the ordered SQL parts and SQL manifest. The
gate must pass before applying or committing regenerated resource SQL. The
current mechanical build is 160,914 rows across 160 visible domains with zero
URL/price validation errors, and the source-reconciliation gate passes. Broad
provider catalogue rows remain audit/reconciliation data; the
student API must not expose them until they have explicit ownership, scope and
approved guidance status.

### Apply to Supabase

1. Apply `backend/migration_career_resources_v1.sql` once.
2. Apply `backend/migration_saved_resource_support.sql` after the `saved_items`
   table exists. It only permits canonical resource URLs to be stored as
   `resource` items; it does not invent or seed resource links.
3. Apply every file in `backend/seed_career_resources_v1_parts/` in numeric
   order, from `part-001.sql` through the final numbered part.
4. Keep each part's `BEGIN;` and `COMMIT;` transaction intact.
5. Do not paste JSON into Supabase. JSON is a build/audit input; the backend
   reads the seeded `skillup_dev.career_learning_resources` table.
6. Verify the final row count and orphan foreign-key checks using the queries
   in `backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`.

### Git workflow for this migration

After validation, commit the manifests, parts, generator changes, and
documentation together. Push project changes to `origin/new-changes`. Leave
machine-local files such as `.claude/settings.local.json` uncommitted.

## Never let a merge silently drop work that already landed

Long-running branches in this repo (`very-new`, `new-changes`, `json-seed`)
accumulate for weeks and then land in bulk. When such a branch is merged into
`main` and the conflicts are resolved **in favour of the branch**, every fix
that landed on `main` in the meantime is discarded. This has now happened
three times. It is the single most expensive recurring mistake in this
repository, and it is silent.

It is silent because history stays intact. The merge commits of the discarded
PRs remain ancestors of `main`, so `gh pr view` still says "merged" and
`git log --diff-filter=D -- <path>` finds **nothing** — there is no delete
commit to point at. Only the *tree* changed. The only way to see it is to
check whether the fix is still in the file.

### What happened on 17 October 2026

48 commits landed on `main` after PR #178 — ten `json-seed` merges (#183-#191)
and two `very-new` merges (#180, #181). Afterwards `main` was red on CI,
CodeQL and both deploy workflows, and the following had been reverted in the
tree while still showing as merged:

```text
.github/workflows/semgrep.yml            (#177)  removed; codeql.yml restored
__mocks__/starkzap.js                    (#170)  removed
__tests__/useAuth-updateActiveField.test.tsx (#178) removed
useAuth.tsx camelCase mirror fix         (#178)  removed
test_career_resource_visibility dataState fixtures (#175) removed
sanitizeRequirementText Direct Entry fix (#170)  removed
e2e*.json gitignore                      (#176)  removed
roster raises 500 instead of zeroed 200  (#169)  removed
settings.DEBUG exception echo removal    (#169)  removed, 4 occurrences back
```

Two details matter more than the list:

**A single PR was split in half.** #169's consent `HTTPException` guards and
`StartingPointIn` `Literal` validation survived; its roster fix and both
`settings.DEBUG` leak fixes did not. So the codebase claimed a security fix it
no longer had: `main.py` was interpolating raw exception text into 500
responses again while `backend/.env` had `DEBUG=true`.

**A half-surviving change was worse than the bug it fixed.** #170 added a jest
`moduleNameMapper` for `starkzap` *and* the `__mocks__/starkzap.js` it points
at. The mapper survived and the mock file did not, so jest resolved `starkzap`
to a file that does not exist — a harder failure than the original ESM
resolution error.

### Rules

1. **Rebase a long-running branch onto `main`; do not merge `main` into it and
   then merge it back.** A rebase forces each conflict to be resolved against
   current `main` one commit at a time. A bulk merge invites one wholesale
   resolution that discards everything else.
2. **Never resolve a merge into `main` with `-X theirs`, `-X ours`, "accept
   all incoming", or by checking out one side of a conflicted path wholesale.**
   If a conflict is genuinely unclear, stop and ask; do not pick a side to make
   the merge complete.
3. **A merge diff that touches files your branch never edited is a red flag.**
   Before pushing a merge to `main`, run `git diff --stat main@{1} main` and
   account for every path. A workflow file, a `__mocks__` entry or a test
   fixture you have never heard of appearing in your merge means you are
   deleting someone else's work.
4. **CI going red on `main` immediately after a large merge is evidence of
   dropped work, not of new bugs.** Check for reverted fixes before debugging
   the failures as if they were fresh.
5. **"Merged" is not proof the code is on `main`.** Verify the file, not the
   PR status.

### Post-merge verification

After any merge into `main`, confirm the landed fixes are still present. Each
of these returned a non-zero count before the 17 October incident and zero
after:

```bash
git show main:package.json            | grep -c starkzap
git show main:__mocks__/starkzap.js   | head -1
git show main:backend/main.py         | grep -c "settings.DEBUG"   # expect 0
git show main:backend/routes/provisioning_routes.py | grep -c "Could not load the roster"
git show main:backend/tests/test_career_resource_visibility.py | grep -c dataState
git show main:.github/workflows/semgrep.yml | head -1
```

Add a line here whenever a fix is landed that a future bulk merge could
plausibly discard. This list is the cheapest available defence, and it only
works if it is kept current.
