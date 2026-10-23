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

## Current goal gate before SQL (2026-09-23)

The active scaling phase is local-first. Before any SQL is applied, complete
and record:

1. the canonical local subject/JAMB audits;
2. the corrected all-420 JAMB resource audit, including the 11 identities
   without a CCMAS anchor (`*_corrected_004_*`); and
3. the all-programme downstream/admin route checks for the 420 JAMB identities
   and 237 CCMAS supporting packages, including ownership, provenance,
   student-safe filtering and review-state gates.

Finish the remaining local scaling and browser-proof gates before entering the
manual SQL phase. The order below is the execution order for that final phase;
it does not authorize earlier SQL writes. Local audits, generator output,
REST reads and browser checks are not proof of live Supabase deployment.
When manual-only mode is requested, do not write through the service client,
REST API, RPC, `psql` or an automated SQL tool; prepare the files and
verification queries for the user to apply manually.

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

## Current career refresh since the last push (2026-09-12)

The current career seed is transported in compressed, ordered parts:

`backend/seed_career_v2_2026-09-12_parts_gz/`

The reconstructed local SQL output is
`backend/seed_career_v2_2026-09-12.sql`; it is ignored by Git because it is
about 660 MB. The compressed parts exist so the generated artifact can pass
repository file-size limits. There are 22 `.sql.gz` parts, each below 41 MB
compressed, and each contains complete SQL statements in order.

This is a generated development/staging seed, not a schema migration. It
contains the corrected ISCO-backed subgroup hierarchy, current source-backed
context/provenance payload and reviewed no-direct-local-match rows. It contains
160 visible domains, 545 subgroups, 5,093 roles, 48,163 tools and 5,090 role
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
14. `backend/migration_jamb_programme_learning_resources_2026-09-23.sql` after
    `migration_career_pilot.sql`; it stores identity-specific learning-resource
    evidence for all 420 canonical JAMB names, including the 11 without a
    CCMAS anchor
15. `backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql`
16. `backend/migration_domain_student_orientation_2026-09-18.sql`
    for the reviewed Sociology/D078 guidance slice, after the career resource
    schema and source-backed career layers exist
17. `backend/migration_saved_resource_support.sql` after `saved_items` exists
18. Decompressed current SQL parts in
    `backend/seed_career_v2_2026-09-12_parts_gz/`, in numeric order

The `.sql.gz` files are not executable by Supabase. Before applying the
preview, decompress/reassemble them from the repository root:

```powershell
python data/career-mapping/split_large_artifacts.py join-sql `
  backend/seed_career_v2_2026-09-12_parts_gz/manifest.json `
  backend/seed_career_v2_2026-09-12.sql
```

The command verifies every compressed-part checksum before writing the
reconstructed SQL. Then pass the reconstructed file to `psql` with
`ON_ERROR_STOP` enabled:

```powershell
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" `
  -v ON_ERROR_STOP=1 `
  -f backend/seed_career_v2_2026-09-12.sql
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
production preflight, backup and explicit approval. The current population
gate passes its structural and source checks. Roles without a supported
subgroup taxonomy remain direct domain-to-role rows; reviewed
no-direct-local-match rows remain explicit. A green population gate is not a
substitute for production deployment verification.

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
| 12a-ii | `backend/migration_programme_domain_evidence_2026-09-17.sql` | Stores cleaned course anchors and transferable evidence for each programme-to-domain relationship so the explanation is specific to the selected programme. It does not alter mapping labels. | #5 and the canonical career seed |
| 12a-iii | `backend/migration_programme_domain_review_corrections_2026-09-18.sql` | Removes 715 programme-domain edges that fail the numeric/semantic evidence gate or are explicitly retained outside active guidance; the source mapping retains them as unverified audit records. | 12a-ii and the canonical career seed |
| 12a | `backend/migration_contextual_career_items.sql` | Adds the student-facing programme/domain/subgroup/role contextual evidence table. Each emitted skill, competency, tool and certification row carries its meaning, context-specific use, learning priority, connections, source links, source locator and evidence limitation. | #8, #9, #11a and #12 |
| 12a-claim | `backend/migration_career_context_claim_validation.sql` | Adds method/knowledge/resource item types and claim-by-claim review state/evidence plus learning-link metadata. Existing rows remain review-required until the exact checkpoint claims and their external learning links have been reviewed. | 12a |
| 12a-i | `backend/migration_career_item_relationships_2026-09-17.sql` | Adds normalized typed relationships between contextual skills, competencies, tools and certifications. It stores explicit source-backed `builds_on`/`works_with` edges and `not_established` coverage rows for every contextual tool/certification with no established cross-type edge. | #12a |
| 12a-i-fix | `backend/migration_career_item_relationships_item_type_widen_2026-10-22.sql` | Widens `from_item_type`/`to_item_type` on this table from 4 values to the same 7 `career_context_items` already allows (adding `method`, `knowledge`, `resource`). The original 4-value check, never updated when 12a-claim widened the item table, silently rejected every relationship naming one of the three newer types -- confirmed zero such rows existed on dev while 187 `career_context_items` rows already used them. Apply before any seed that links a method/knowledge/resource item. | 12a-i, 12a-claim |
| 12a-ia | `backend/migration_career_item_relationship_explanations_2026-10-12.sql` | Adds a separate learner-facing explanation field to typed item relationships. Existing relationships remain unchanged and stay out of learner relationship UI until a reviewed, non-empty explanation is present; source limitations are never used as positive explanations. | 12a-i |
| 12a-ib | `backend/migration_career_item_sequence_policy_2026-10-12.sql` | Adds explicit sequence approval, policy, condition and route-scope fields. Existing source-backed relationships default to advisory/unapproved; relationship type alone cannot create a learner prerequisite. | 12a-ia |
| 12a-ic | `backend/migration_career_item_relationship_target_context_2026-10-17.sql` | Adds target ownership context so an approved area route may explicitly point to an inherited domain item; the target must independently pass its student-content gate. | 12a-ib |
| 12a-ii | `backend/migration_career_context_path_targets.sql` | Adds theme/use-case grouping, item requirement status separate from learning order, and an evidence-backed item-to-specialization/role applicability table. Existing rows remain unclassified until explicitly enriched; the API exposes only source-backed links owned by the item's context. | #12a |
| 12b | `backend/migration_sociology_curriculum_contract_2026-09-17.sql` | Clean programme-owned Sociology CCMAS outcome/ability tables. It is the only student curriculum source for the reviewed Sociology slice; legacy flattened skill arrays remain audit-only. | #14 and the `programmes` seed |
| 12b-i | `backend/migration_programme_curriculum_contract_general_2026-09-18.sql` | Generalizes the cleaned programme curriculum contract for every non-Sociology parsed programme; it does not replace the source reconciliation or the Sociology slice. | 12b and the `programmes` seed |
| 12b-ii | `backend/migration_guidance_programme_reading_and_market_scope_2026-09-12.sql` | Allows lawful programme-reading references and records whether a credential has Nigerian, global, or both evidence scopes. | #12 |
| 12c | `backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql` | Explicit programme/domain/subgroup/role ownership, staged D078 foundations, reviewed Sociology learning links, programme reading references and programme context cards. | #8, #12, #12a and #12b |
| 12c-i-a | `backend/migration_sociology_giddens_ideas_theme_2026-10-22.sql` | Existing-project, exact-ISBN update that maps the Sociology Giddens/Sutton 9th-edition reference only to Ideas and foundations using Wiley's edition-specific chapter 3 locator. Fails unless exactly one base row matches; no curriculum-prescription claim. | 12c |
| 12c-ii | `backend/migration_domain_student_orientation_2026-09-18.sql` | Replaces the compressed D078 domain introduction with the reviewed student-orientation contract: what the field studies, what people do, questions, outputs, work sequence, programme fit and decision guidance. | #12c |
| 12c-i | `backend/migration_sociology_domain_tool_path_2026-09-18.sql` | Promotes only repeatedly evidenced named D078 tools into an optional domain pathway, groups them by source purpose, attaches item-specific learning links, and records unestablished cross-type relationships honestly. | #12c and #12a-i |
| 12d | `backend/migration_guidance_all_programmes_2026-09-12.sql` | Adds programme-owned CCMAS source locators, programme context cards and discipline-specific open foundation references for all 237 parsed programmes. | #12c and the `programmes` seed |
| 12e | `backend/migration_guidance_global_2026-09-11.sql` | Replaces role-derived domain foundations for the other visible domains with domain-owned orientation/foundation rows and applies ownership filters. | #12d |
| 13 | `backend/migration_provisioning.sql` | Institution provisioning, school codes, claim codes, student affiliations/consents, merge candidates. | #5 |
| 14 | `backend/migration_student_pipeline_live.sql` | Student starting points, selected subjects, structured subject options, pathway choices, JAMB/cutoff views. | #4, #6, #13 |
| 14aa | `backend/migration_school_faculty_filter_2026-09-09.sql` | Appends `jamb_faculty` to the school programme view so the university → faculty → programme picker filters real offerings. | #14 |
| 14a | `backend/migration_ss3_secondary_starting_point_patch.sql` | Existing-project patch that allows the split `ss3_secondary` starting-point type. | #14 |
| 14b | `backend/migration_guidance_report_paths.sql` | Durable, account-scoped selected guidance paths used by student and admin-guided reports. | #13 and #14 |
| 15 | `backend/migration_institution_team_access.sql` | Extends `institution_members` with scoped seats, creates `institution_member_invites`, and supports multiple officials per school/university/tutorial centre. | #5 and #13 |
| 16 | `backend/migration_user_feedback.sql` | Phase 12 `user_feedback` table (admin inbox + ReviewModal). | #0 |
| 17 | `backend/migration_school_identity.sql` | Adds address fields, source-backed official/short institution-name fields, and unique readable school affiliation codes for same-name disambiguation. Full names and abbreviations must be populated from an authoritative institution source; application code must not infer them from acronyms. | #13 |
| 18 | `backend/migration_goal_apply_now.sql` | Consolidated additive patch for auth compatibility, legacy account routing support, school identity, affiliation, provisioning, claim codes and account deletion. | base `users` + `schools` tables |
| 19 | `backend/migration_institution_verification_proof.sql` | Adds institution proof-submission metadata and the private verification-proofs storage bucket. | #18 + Supabase Storage |

The consolidated patch adds `users.account_type_selected_at`. This is required
to distinguish an old completed account that inherited the historical `student`
default from a student who explicitly selected that persona. Apply it before
testing login or finishing onboarding with the updated backend.

### Contextual career item transport

> **Superseded ordering.** The sequence in this paragraph predates the
> 2026-10-08 guidance files and places the 35 contextual parts after migrations
> 12d/12e. Use the "Authoritative D078/Sociology apply order" section below
> instead, which loads the parts earlier; see the note there on
> `seed_sociology_domain_guidance`. The transport, manifest and checksum rules
> in this paragraph still apply.

After the local goal gate and after applying migrations **12a–12e**, including
**12a-claim** and **12a-ia**, the
Sociology curriculum contract, and the base career seed, load the 35 ordered
gzip parts in
`backend/seed_career_context_items_v1_parts/` in numeric order through the
repository's normal seed loader. The manifest
`data/career-mapping/CONTEXTUAL_GUIDANCE_ITEMS_MANIFEST.json` is authoritative
for the generated row count, part count and checksums. Historical counts in
this runbook are not deployment proof. Reassemble or
decompress one part only in the controlled migration environment; do not
commit an uncompressed copy. Confirm that every row has
`data_state = 'source_backed'`, a non-empty context owner and at least one
public HTTPS source URL before treating the seed as complete. The row counts
include role skills/tools but do not promote them into domain foundations.

### JAMB resource-scope correction (2026-09-23)

The current student-facing denominator is **420 canonical JAMB identities**,
not 237 CCMAS packages. CCMAS is an optional curriculum complement. The 11
JAMB occurrences without a CCMAS anchor must still be enriched with external
learning resources and cannot be marked `genuinely_unavailable` merely because
the anchor is absent. Resource availability and downstream mapping review are
separate gates. The append-only local evidence ledger is generated by
`data/career-mapping/_audit/audit_programme_jamb_resource_evidence_2026-09-23_003.py`;
review its `*_corrected_004_*` manifest and batches before regenerating any
dependent SQL. It is not live deployment proof and must not be pasted into the
SQL Editor.

The corrected 420-row resource ledger is currently an append-only local audit
artifact. The existing guidance seed persists 237 CCMAS supporting packages,
not the 420-row JAMB resource ledger. A dedicated persistence migration/seed
must exist and be manually applied before anyone claims those 420 resource
rows are live.

#### Current D078 specialization taxonomy and guided-content seeds — local, not deployment proof

The reviewed D078 seven-area taxonomy and multi-area role routes are persisted
separately from the legacy ISCO subgroup taxonomy. Apply
`backend/migration_d078_specialization_taxonomy_2026-10-12.sql` after the
canonical career domain/role schema exists, and then apply
`backend/seed_d078_specialization_taxonomy_2026-10-12.sql` after the canonical
D078 domain and role rows have been seeded. This D078-only seed contains the
seven current areas and all 26 already-reviewed area-to-role routes (18
supported, 8 conditional). It preserves the conditional scope, task evidence,
negative boundary checks and provenance. It does not re-adjudicate role fit or
emit retired ISCO subgroup buckets as current areas. The schema is additive;
applying the seed does not itself switch the API from its checked-in
catalog/graph to database reads.

Generate the local taxonomy seed with
`python data/career-mapping/_build_d078_taxonomy_seed_2026_10_12.py`. Its
builder cross-checks the seven catalog area IDs against the consolidated D078
master and requires exact agreement between the current route graph and the
approved master graph before writing SQL.

The current route graph input is
`data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json`.
It carries all 14 reviewed Sociology curriculum themes and all 236 course
outcomes grouped under those themes. The two exact theme-to-domain evidence
matches are highlighted connections only: they do not filter the curriculum,
declare other themes irrelevant, or limit what a Sociology student may learn
next. The programme-to-domain transition narrates verified transferable
learning, then distinguishes additional domain, area and role capabilities.
The graph is a local design/audit artifact; the dedicated Sociology curriculum
contract seed remains the data source for course outcomes, so these graph nodes
do not require a new SQL table or imply that the UI already displays them.

The expanded method/area/role route graph is likewise currently a checked-in
design artifact, not a Supabase runtime table. Its D078 domain overview copies
the individually approved fields already persisted by
`migration_domain_student_orientation_2026-09-18.sql`; do not regenerate or
reapply the D078 guided-content seed solely because the graph now carries those
same fields. No route-graph schema/seed is defined yet. Add one only if the
accepted UI/API design requires the backend to fetch the graph dynamically;
then define its schema, generator, seed and dependency order together. Do not
load the graph JSON as SQL or claim that graph reconstruction updated Supabase.

After the 35 generic contextual seed parts have been loaded, the scoped D078
content seed may be applied to refresh the current locally approved Sociology
domain and Area-of-Specialization records:

```text
backend/seed_d078_guided_content_2026-10-12.sql
```

It is generated with
`python data/career-mapping/_build_d078_guided_content_seed_2026_10_12.py`
from the current consolidated master. The verified local seed contains **202
domain/area items**: 52 student-eligible domain items and 150 area-owned cards/options across
all seven current areas. The 150 area rows include the individually explained,
task-linked Human Geography and Social Behaviour tool options reconciled on
2026-10-15. It omits unapproved master rows and consolidated duplicate aliases.
The compressed transport is
`backend/seed_d078_guided_content_2026-10-12.sql.gz`; decompress it before
applying. The separate 173 role-item contracts are persisted by the additive
contract migration/seed below; that table is not itself the student role-card
payload and remains behind the independent display/API gate.
The actual Sociology programme curriculum has **14 themes**; the separate
three Research-theme claim records are explanatory curriculum items, not the
theme count. Programme curriculum/outcomes and theme-reading resources remain
in their own programme contract/resource seed layers. This contextual seed is
separate from the D078 taxonomy/role-route seed above; both files are required
for the current locally approved D078 data package. Neither seed rewrites
role-fit decisions or the 173 role-item dispositions. Regenerate only after
rebuilding and checking the D078 master, theme audits, sequence and
student-promotion gate. Local generation is not SQL application or student
release approval.

#### D078 SQL-to-student-display contract

Running the SQL is necessary but is not, by itself, student-display approval.
The following conditions must all hold before a programme, domain, area or role
card may be returned to the student UI:

1. The canonical Sociology programme, D078 domain, seven current areas and
   routed roles exist. The two retired ISCO-style subgroup labels are not
   current areas and must not be emitted by a student query.
2. The Sociology curriculum contract is loaded, including all 14 reviewed
   themes and its cleaned course/outcome records. A two-theme evidence
   crosswalk is an explanatory connection, not a filter on the other themes.
3. Contextual rows have matching ownership (`programme`, `domain`, `subgroup`
   or `role`), `data_state = 'source_backed'`,
   `claim_review_state = 'approved'`, `link_state = 'linked'`, and an HTTPS
   learning/reference URL with item-specific rationale. Rows with another
   owner, `review_required`, `excluded`, `review_only`, missing rationale or a
   missing link remain hidden with their audit reason.
4. The three shared D078 foundations are the only compulsory progression
   spine. Their `requirement_scope` is `needed`, `skippable = false` and
   `blocks_progression = true`, and they appear in their approved order.
   Later domain, area and role items are not silently converted into
   prerequisites: useful/optional items remain selectable and skippable;
   alternatives are presented as choices; complements and `works_with` edges
   explain co-learning without blocking progress.
5. The seven-area taxonomy and 26 area-role routes are loaded before the route
   visibility recalculation. A supported route needs source-backed rationale,
   positive task evidence and an HTTPS source; a conditional route additionally
   needs its explicit scope condition. A stale stored `false` must not override
   these current checks, while an actually failing current check remains
   hidden.
6. The 173 role-item contracts are loaded for audit/backend reconciliation
   (171 approved and 2 unapproved). The role contract table is deliberately
   staff/backend-only; it is not a student SELECT surface. The companion role
   contract seed must also materialize only approved, currently owned, linked
   role cards into `career_context_items` (202 deduplicated role-owned cards
   from the eligible records/owner routes). It must not expose the two
   unapproved records, ownerless records or retired legacy route labels.
7. The role-tool seed is loaded after the role-item contract and lane schemas.
   Its 95 tools are optional route choices, not compulsory requirements. A
   reused tool keeps its canonical identity while its selected area/role use,
   alternatives, complements, limitations and resource rationale remain
   route-specific.
8. Normalized relationship rows are returned only when the edge is
   source-backed, has a reviewed learner explanation, has a valid HTTPS source,
   and its visible target is present in the permitted context. `not_established`
   coverage rows are audit records and must never become learner relationships.

Required local post-seed checks are: 14 Sociology themes; 7 canonical areas;
26 area-role routes; 202 student-eligible domain/area rows (52 domain and 150
area); 3 compulsory foundations; 3 advisory route-scoped sequence edges; 173
role-item contracts (171/2 disposition split); 166 individually eligible role
records projecting to 202 deduplicated student-owned role cards; 224 supported
role-owner links; and 95 optional role-tool rows. Then
reload programme, domain, every area and every role response and verify that
the response contains the expected sections, item explanations, relationships,
alternatives, selection removal and tray/report payloads. A database count is
not visual proof, and a local seed is not live-deployment proof.

The role-item contract ledger and the checked-in D078 runtime contract remain
distinct concerns, but the seed now contains both required database writes:
the 173-row audit ledger and the approved role-card projection into
`career_context_items`. Applying only the ledger table would not populate a
role card; therefore the regenerated companion seed must be run in full after
`migration_contextual_career_items.sql` and
`migration_career_context_claim_validation.sql`. The API/runtime contract
still performs the same current gate and can merge the reviewed runtime
explanations, while the database projection makes the student route durable
after reseeding. This distinction prevents a successful ledger-only load from
being mistaken for a complete student display.

#### D078 role-item contract ledger — local seed ready, not student approval

The 173 role-item records now have nonblank plain-language definitions and an
item-level learning-link review. The older 2026-10-10 worksheet supplies those
content/link repairs only; placement decisions come from the consolidated
`D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json`. Current master
counts are **171 approved, 2 unapproved**. All 173 have a link-review record;
zero definitions are blank and zero link states remain candidate-only. The two
unapproved records remain persisted with their reasons. Five records have no
current canonical role owner (three approved item dispositions, two
unapproved); they are retained without inventing role routes. The seed contains
224 supported role-owner links and projects 202 deduplicated approved
role-owned contextual cards; 166 eligible ledger records can account for
multiple role-owner cards.

Generate and test locally:

```powershell
python data/career-mapping/_audit/merge_d078_role_item_content_repairs_into_master_2026_10_15.py
python data/career-mapping/_build_d078_role_item_contract_seed_2026_10_15.py
python -m pytest backend/tests/test_d078_role_item_contract_seed.py -q
```

After the canonical D078 taxonomy and role records exist, apply this additive
schema and seed in order:

```text
backend/migration_d078_role_item_contracts_2026-10-15.sql
backend/seed_d078_role_item_contracts_2026-10-15.sql
```

`backend/seed_d078_role_item_contracts_2026-10-15.sql.gz` is transport only;
decompress before SQL execution. Local generation does not apply the migration.
The contract table intentionally has no student SELECT policy. The seed now
records `student_display_approved = true` only for the **166 individual records**
that pass the current item gate: approved disposition, a current routed role
owner, and a reviewed HTTPS learning/reference link. Seven records retain
explicit non-eligible states (2 unapproved, 3 approved but ownerless, 2 with no
supported D078 learning route). This row flag is an API-contract eligibility
decision, not table access and not approval of the complete graph. The seed
materializes eligible role cards from the consolidated master; the API reads
those student-owned rows and may merge the same reviewed runtime contract;
role tools from
the selected area are returned as area-owned options, never relabeled as
role-owned or universal requirements. Verify post-apply counts (173 ledger
rows, 171/2 disposition split, 166 item-eligible records, 202 student-owned
role cards, 173 nonblank definitions and link reviews) before relying on the
route; no SQL is applied by local generation.

Older `student_display_approved = false` and visibility values inside the source
JSON are preserved under `contract_payload.historical_gate_values` for audit
only. They must not override the freshly computed top-level eligibility fields;
the source's legacy `role_task_relationship_verified = false` is likewise
history-only and is omitted from the active contract payload. Do not reopen
completed evidence review solely because those historical values are false.

The same seed contains normalized cross-type relationship rows. Apply
`backend/migration_career_item_relationships_2026-09-17.sql` before loading the
parts. Apply `backend/migration_career_context_path_targets.sql` before loading
any seed that includes the new theme/use-case, requirement-level or path-target
fields. Existing seed parts do not gain inferred path targets merely because
the schema exists; enrich those records from reviewed evidence first. Each
contextual tool and certification is covered by either a
source-backed typed edge or a `not_established` row. The latter means the
reviewed sources did not establish a relationship; it must not be rendered as
a student recommendation or used to infer a requirement. Verify the layer with:

```sql
select relationship_status, relationship_type, count(*)
from skillup_dev.career_item_relationships
group by relationship_status, relationship_type
order by relationship_status, relationship_type;
```

### Authoritative D078/Sociology apply order (15 October 2026)

Last dependency and transport reconciliation: 23 October 2026. This section is
the sole authoritative D078 order; `CLAUDE.md` points here and must not maintain
a competing copy of the ordered list.

This is the single authoritative order for the current D078 slice. It
supersedes the abbreviated D078 seed order in older sections and in
`COMPLETE_DATA_MIGRATION_2026-08-17.md`. For an existing database, run a
read-only preflight and apply only missing files. The canonical career seed
must already have created the Sociology programme, D078 domain and role rows.
Do not use `migration_career_v2.sql` for this additive update.

The canonical career taxonomy is a prerequisite, not part of the D078 overlay:
apply the career base migrations and `backend/seed_career_pilot.sql` first, in
the applicable career-seed runbook order. Then follow the D078-specific chain
below. This keeps programme/domain/role identity creation distinct from the
Sociology curriculum, area taxonomy and learning-content overlays.

#### End-to-end test scope: Sociology matcher to D078 to saved report

For the undergraduate test, choose the Sociology programme directly; university
selection is not a prerequisite for reaching the programme. A named institution
must nevertheless be attached to the student profile before report export.

First use the canonical subject-pipeline schema and seed orders at the top of
this runbook. Apply only files the read-only preflight proves missing. Then
complete the D078 schema and data order below. For authenticated save/reopen and
HTML/DOCX report export, also preflight migration_provisioning.sql,
migration_school_identity.sql, and migration_guidance_report_paths.sql; apply
missing ones after their base tables exist, in the dependency order in the
provisioning section. Do not rerun subject-option replacement seeds or account
migrations just to address a D078 display issue.

The theme-resource repair is a required final data correction for the current
Sociology theme links. It runs after the Sociology programme-theme seed below
and before checking that all 14 themes expose their reviewed resources.

#### 1. Apply missing schemas and prerequisite corrections in dependency order

Run one whole SQL file/transaction at a time, stopping at the first error:

```text
backend/migration_programme_domain_evidence_2026-09-17.sql
backend/migration_programme_domain_review_corrections_2026-09-18.sql
backend/migration_sociology_curriculum_contract_2026-09-17.sql
backend/migration_programme_theme_guidance_2026-10-08.sql
backend/migration_programme_curriculum_contract_general_2026-09-18.sql
backend/migration_contextual_career_items.sql
backend/migration_career_context_claim_validation.sql
backend/migration_career_item_relationships_2026-09-17.sql
backend/migration_career_item_relationships_item_type_widen_2026-10-22.sql
backend/migration_career_item_relationship_explanations_2026-10-12.sql
backend/migration_career_item_sequence_policy_2026-10-12.sql
backend/migration_career_item_relationship_target_context_2026-10-17.sql
backend/migration_career_context_path_targets.sql
backend/migration_guidance_programme_reading_and_market_scope_2026-09-12.sql
backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql
backend/migration_sociology_giddens_ideas_theme_2026-10-22.sql
backend/migration_domain_student_orientation_2026-09-18.sql
backend/migration_sociology_domain_tool_path_2026-09-18.sql
backend/migration_d078_specialization_taxonomy_2026-10-12.sql
backend/migration_d078_role_item_contracts_2026-10-15.sql
backend/migration_d078_requirement_lanes_2026-10-17.sql
```

Both lists above name migration DDL by its bare `.sql` filename, but most of
these files are committed only as `.sql.gz` transports — including
`migration_programme_theme_guidance_2026-10-08.sql`,
`migration_guidance_all_programmes_2026-09-12.sql` and
`migration_guidance_global_2026-09-11.sql`. A bare name here is therefore not
evidence that the file is absent from the package: check for both spellings
before declaring a runbook non-deployable, and decompress before executing. The
new additive files may be plain text while older migration files may be
compressed. Verify each exact migration path in the branch package; never infer
that a dependency is absent from its extension alone.

The relationship-target-context, role-item-contract and requirement-lane
files are required schema migrations; the role-route-visibility file is a
post-taxonomy data recalculation, not an optional seed or a permanent
hard-coded release gate. Before distributing this runbook, verify that all
required plain-text migration files are present in the same branch/package as
this document. This includes the programme-theme schema and the exact-edition
Giddens resource correction listed above, as well as the four D078 route and
role-contract dependencies. A runbook that references a missing migration is
an invalid, non-deployable package: stop rather than applying only the seeds.

If preflight shows missing canonical programme/domain/role rows, stop: this
additive sequence cannot create the base taxonomy.

Run the preflight as the **same role that will apply the seeds**, and before
reading anything into a row count of zero, check that role's `rolbypassrls`
together with `pg_class.relrowsecurity` and `pg_policies` for the table. On the
dev project (`xikcotwdgztaiksoylwg`) on 20 October 2026, row-level security was
enabled on the career tables in two different shapes, and a loader role that is
neither the table owner nor a `BYPASSRLS` holder fails differently under each:

- `programmes`, `schools` and `school_programmes` had RLS enabled with **no
  policies at all**, so every row was invisible and every write rejected.
  Reads fail **silently**: `seed_sociology_curriculum_contract` and
  `seed_sociology_programme_theme_guidance` are
  `INSERT ... SELECT ... FROM skillup_dev.programmes p WHERE lower(p.name) =
  lower('Sociology')`, so RLS filtered the *source* rows to zero and both
  committed successfully having written nothing. Both reported success with 0
  rows while `programmes` in fact held 244.
- `career_context_items`, `career_item_relationships`,
  `career_item_path_targets`, `career_areas_of_specialization` and
  `career_role_area_routes` each had a public **`SELECT`-only** policy and no
  write policy, so reads succeeded and writes failed loudly:
  `new row violates row-level security policy for table
  "career_context_items"` (observed applying `part-001`).

Note that **no committed migration enables RLS on `programmes`, `schools` or
`school_programmes`** — that state exists in the live dev project only, so a
fresh staging database will not reproduce it and a dump-based comparison will
not reveal it. The `SELECT`-only policies on the five career tables *are* in
the committed migrations, spread across four files:
`career_context_items_public_read` in `migration_contextual_career_items.sql`,
`career_item_relationships_public_read` in
`migration_career_item_relationships_2026-09-17.sql`,
`career_item_path_targets_public_read` in
`migration_career_context_path_targets.sql`, and both
`career_areas_of_specialization_public_read` and
`career_role_area_routes_public_read` in
`migration_d078_specialization_taxonomy_2026-10-12.sql`.

An apparently empty `programmes` is therefore not evidence that
`backend/seed_career_pilot.sql` is missing, and re-running that seed to
"repair" it does not work: it upserts `school_programme_requirement_exceptions`
with `ON CONFLICT (id)` while the table also carries
`UNIQUE (school_programme_id, exam_type, requirement_text)`, so an id-stable
re-run aborts on the natural key. Grant the loader `BYPASSRLS` for the duration
of the load and revoke it afterwards:

```sql
ALTER ROLE <loader> BYPASSRLS;    -- before
ALTER ROLE <loader> NOBYPASSRLS;  -- after
```

Relationship explanations
and sequence policy follow the relationship table; the target-context
extension follows sequence policy. The role-contract schema must exist before
`migration_d078_requirement_lanes_2026-10-17.sql`, because the lane migration
adds columns to that table. These schemas and the path-target table must exist
before loading the D078 content seed.

#### 2. Apply the D078 data refresh in dependency order

After the prerequisite migrations above exist, the Giddens correction has
run after the Sociology resource-ownership migration and before the theme
resource repair. Then apply only missing data in this order:

```text
backend/seed_programme_domain_evidence_2026-09-17.sql.gz
backend/seed_sociology_curriculum_contract_2026-09-17.sql.gz
backend/seed_sociology_programme_theme_guidance_2026-10-08.sql.gz
backend/migration_sociology_theme_resource_repair_2026-10-23.sql
backend/seed_career_context_items_v1_parts/part-001.sql.gz ... part-035.sql.gz
backend/seed_sociology_domain_guidance_2026-10-08.sql.gz
backend/migration_guidance_all_programmes_2026-09-12.sql
backend/migration_guidance_global_2026-09-11.sql
backend/seed_d078_specialization_taxonomy_2026-10-12.sql.gz
backend/migration_d078_role_route_visibility_2026-10-15.sql
backend/seed_d078_guided_content_2026-10-12.sql.gz
backend/seed_d078_role_item_contracts_2026-10-15.sql.gz
backend/seed_d078_role_tools_2026-10-16.sql.gz
```

After the theme-resource repair runs, execute this read-only postflight. It
should return 18 approved reading rows, 18 rows with theme links, and 14
distinct theme keys. If any value differs, stop and inspect the source rows;
do not replay the broad insert-only resource migration to conceal the mismatch.

```sql
WITH sociology_readings AS (
    SELECT r.id, r.source_provenance -> 'theme_keys' AS theme_keys
    FROM skillup_dev.career_learning_resources AS r
    JOIN skillup_dev.programmes AS p ON p.id = r.programme_id
    WHERE lower(p.name) = 'sociology'
      AND r.resource_type = 'programme_reading'
      AND r.ownership_scope = 'programme'
      AND r.review_status = 'approved_guidance_v1'
      AND r.data_state = 'source_backed'
      AND r.source_provenance ->> 'guidance_layer' = 'sociology_programme_v1'
), sociology_themes AS (
    SELECT r.id, theme.theme_key
    FROM sociology_readings AS r
    CROSS JOIN LATERAL jsonb_array_elements_text(
        CASE WHEN jsonb_typeof(r.theme_keys) = 'array' THEN r.theme_keys ELSE '[]'::jsonb END
    ) AS theme(theme_key)
)
SELECT
    (SELECT count(*) FROM sociology_readings) AS approved_reading_rows,
    (SELECT count(*) FROM sociology_readings
     WHERE jsonb_typeof(theme_keys) = 'array' AND jsonb_array_length(theme_keys) > 0)
        AS rows_with_theme_links,
    (SELECT count(DISTINCT theme_key) FROM sociology_themes) AS distinct_theme_keys;
```

Use the compressed files above as the canonical repository transport when
their matching `.sql` files are present locally. They are three separate,
ordered seed transactions—not one SQL file to concatenate: guided content
builds the programme/domain/area layer, the role-item seed writes both the
role-item audit ledger and approved role-owned contextual cards, and the role
tools seed adds optional role-scoped tool cards. Keeping these generators and
transactions separate prevents a later layer from overwriting an earlier
layer's ownership or review decisions. Apply each gzip payload only after
decompressing it, and never also execute its uncompressed counterpart.

migration_sociology_theme_resource_repair_2026-10-23.sql is an
idempotent, transactional data repair, not a schema migration. Run it
immediately after the Sociology programme-theme seed. It reconciles 18
programme-owned resource records and checks that all 14 active Sociology
themes have at least one verified resource mapping. Stop if its assertions fail;
do not proceed to later seeds with incomplete theme resources.

The order intentionally carries earlier data into the D078 overlay: the
programme/domain evidence and Sociology curriculum/theme seeds run first; the
35 generic contextual parts follow them; the Sociology domain-guidance seed
then edits one of the rows those parts create; all-programme and global
guidance migrations follow the reviewed local slice; the taxonomy seed creates
the seven canonical areas and their routes; the visibility recalculation
follows those routes; the contextual parts are in place before the
D078-specific guided-content overlay; role-item contracts and role tools are
last.

`seed_sociology_domain_guidance_2026-10-08.sql.gz` must run **after** the 35
contextual parts, not before them. It `UPDATE`s the single
`('domain', 'D078', 'D078', 'skill', 'research-design')` row in
`career_context_items` and raises `Expected exactly one existing D078
research-design row to update; updated 0` when that row is absent. The row is
created by `part-002`. Until 20 October 2026 this list placed the parts five
steps later, so a clean run of the documented order always aborted here.

Moving them earlier is safe, checked statement by statement against every file
now ordered after them. None of those files deletes from any of the three
tables the parts populate:

| File | Writes to `career_context_items` / `career_item_path_targets` / `career_item_relationships` |
|---|---|
| `seed_sociology_domain_guidance` | one `UPDATE` of the research-design row (the dependency above) plus `INSERT` of two path targets |
| `migration_guidance_all_programmes` | `INSERT` into `career_context_items` through `ON CONFLICT ... DO UPDATE` only |
| `migration_guidance_global` | none — it writes `domains`, `career_learning_resources`, `domain_tools` and `career_guidance_foundations` |
| `seed_d078_specialization_taxonomy` | none |
| `migration_d078_role_route_visibility` | none |

No `DELETE` against those three tables appears in any of them, so rows arriving
sooner cannot be removed or clobbered. The three tables also carry no
foreign-key constraints — true both of every committed migration and of the
live dev project (`pg_constraint` returns nothing for them) — so there is no
ordering requirement against the area taxonomy either. Do not skip the generic
contextual parts or reverse
The D078 overlay order. Before packaging, verify that this branch contains
every migration listed above, the Sociology theme-resource repair, all
compressed seed paths in this sequence, and exactly contextual parts 001
through 035. Only include compressed seed artifacts absent from the target
branch; do not resend existing files or include raw duplicates.

The route-visibility recalculation follows the seven-area/26-route taxonomy
seed. It repairs stale route visibility from current route evidence; it does
not adjudicate role fit or promote role-item candidates. The 173-row role-item
contract table remains separate backend evidence, while its companion seed also
projects 202 approved, deduplicated role-owned item cards into
`career_context_items`. The final additive seed adds 95 optional, role-owned tool cards (five distinct
choices for each of the 19 currently routed D078 roles). It reuses the existing
`career_context_items` schema and runs after the 173-row role-item seed so both
sets can be read through the same role-context API. No new migration is
required. The seed does not make a tool compulsory and creates no prerequisite
or sequence edge. The graph records 28 canonical tool identities, 95
tool-to-role-task support edges, and 104 named alternative-tool edges. Reused
domain/area tools retain one identity while role-specific use and alternatives
are attached to the selected route. Regenerate locally
with `python data/career-mapping/_audit/enrich_d078_role_tools_2026_10_16.py`
and `python data/career-mapping/_audit/integrate_d078_role_tools_into_graph_2026_10_16.py`.
The full local contract is
`data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json`;
the handoff is `docs/manual-review/D078_ROLE_TOOL_ENRICHMENT_2026_10_16.md`.
Local generation is not live SQL application or rendered-UI verification.

The generic four-part programme curriculum seed
(`backend/seed_programme_curriculum_contract_2026-09-18_parts_gz/`) is not a
prerequisite for the D078-only path when the dedicated Sociology contract is
seeded. If an all-programme curriculum refresh is also explicitly in scope,
run its four decompressed parts after the general curriculum schema and before
programme theme guidance.

#### 3. Transport, execution and rollback safeguards

- Repository transport rule: generated audit JSON and generated seed SQL are
  stored as `.json.gz` or `.sql.gz` transport artifacts when compressed
  counterparts are present. Small manifests and migration DDL remain plain
  text. Do not add or apply a raw generated counterpart when its compressed
  transport is the package selected for deployment.
- `.sql.gz` files are transport only. Decompress each numbered part and run
  each transaction in numeric order; never submit gzip bytes or run both the
  plain and compressed copy of the same seed.
- Use the Supabase SQL Editor or a verified `psql` connection with
  `ON_ERROR_STOP=1`; REST keys cannot run DDL. Back up the target database and
  record the project, date, file and result. Keep this workflow manual unless
  the user explicitly authorizes a database write.
- Never apply the destructive/staging-only `migration_career_v2.sql` here.
  Do not reseed retired legacy D078 subgroup buckets as current areas.
- Stop at the first SQL error. Fix the cause and retry only the failed file;
  do not rerun completed content research because an old summary or historical
  boolean is stale.

#### 4. Post-apply acceptance checks

Verify database and API results against these local expected values: 14
Sociology themes; seven canonical D078 areas; 26 area-role routes, including
multi-area roles; 202 approved domain/area runtime items (52 student-eligible domain and 150
area after area-tool integration); 173 role-item disposition rows (171
approved, 2 unapproved), 166 individually eligible role cards, 224
supported role-owner links, and 95 optional role-tool records across 19 roles
(five distinct choices each, 28 canonical identities, three route-scoped advisory sequence edges).
The unapproved domain certification-boundary
claim remains excluded. These numbers are expected local counts, not proof of
deployment until live queries and API responses match.

Then verify programme, domain, each area and each role response; the named
tools/methods/knowledge and resource rationale; role ownership; add/remove;
tray opening; no-area/no-role advisory behavior; report and print. A successful
SQL transaction or count query is not visual acceptance. Keep public release
blocked until authenticated rendered acceptance and explicit approval are
recorded. Do not re-open passed content dispositions merely because the graph
artifact is hidden or an old field says `false`.

### D078/Sociology student-display reseed and retest (historical summary)

The local UI fix is not visible to a student if the database still has the
previous or partial D078 content seed. Run a read-only preflight first and
apply only missing schema/data files; never use the taxonomy rebuild for this
additive correction. Preserve the full schema dependency order in this
runbook and the manual-only deployment rule.

The authoritative current D078 schema and data order is the preceding
“Authoritative D078/Sociology apply order (15 October 2026)” section. The list
below is retained as historical context only; do not execute it as an
independent or complete sequence.

The current D078 guided-content seed is also stored as the compressed transport
`backend/seed_d078_guided_content_2026-10-12.sql.gz`. Rebuild the plain SQL from
the generator before applying; never submit gzip bytes to the SQL editor.

Use the schema names and exact pre-seed order already documented above. In
particular, `migration_career_item_relationship_explanations_2026-10-12.sql`
must follow the relationship-table migration and precede seeds that write
relationship explanations; `migration_d078_specialization_taxonomy_2026-10-12.sql`
must follow the canonical career schema and precede its taxonomy seed. The
Sociology programme-theme seed is not a substitute for the complete
curriculum-contract seed.

Post-seed verification must confirm: the curriculum outcome count and theme
groups come from the full reviewed Sociology contract (not a fixed three-theme
sample); all seven canonical areas exist and the 26 reviewed area-role routes
are present; the student payload contains approved domain foundations
separately from use-case-specific options, and returns any approved named
tools, methods, knowledge, relationships and learning links; every area
returns its reviewed roles. Then reload the programme, domain and each area
payload and test selection removal plus tray opening. A successful SQL run is
not proof that the UI is wired or rendered correctly. If counts or payloads
remain empty, diagnose the missing/failed seed or ownership/review gate before
changing the student filter; do not lower the evidence gate or fall back to
legacy role-aggregated data.
The APSA “Rethinking Political Science Education” report remains an audit
source for a bounded political-science education claim, not a general
Social-Sciences learning resource.

### Programme-to-domain evidence contract

After the canonical career seed has created `programmes`, `domains`, and their
`programme_domain` edges, apply the following in order:

```text
backend/migration_programme_domain_evidence_2026-09-17.sql
backend/migration_programme_domain_review_corrections_2026-09-18.sql
backend/seed_programme_domain_evidence_2026-09-17.sql
```

The seed is generated from
`data/career-mapping/_audit/programme_domain_evidence_2026-08-17.json` and
contains 1,343 active resolved rows. It records the cleaned course anchors,
transferable evidence, mapping source, and review flags already produced by
the programme-to-domain audit. It does not create or relabel mappings. The API
uses these rows to explain why a domain is direct, functional, or adjacent for
the particular programme being viewed. A missing table or missing evidence row
must never be filled with guessed course anchors; the UI should retain only the
stored relationship label and omit unsupported evidence. The current audit has
zero active numeric-gate failures and zero active semantic-review rows. The
companion correction migration removes 715 gate-failing, generic-anchor, or explicitly retained-unverified rows
from active database guidance while retaining them in the source audit as
unverified review records.

For the reviewed Sociology programme, apply
`backend/seed_sociology_curriculum_contract_2026-09-17.sql` after
`seed_career_pilot.sql` and after
`migration_sociology_curriculum_contract_2026-09-17.sql`. It loads 243 cleaned
course outcomes and seven separate programme abilities. Do not populate the
student screen from `skills_technical`, `skills_transferable` or `skills_count`;
those legacy arrays are retained for staff audit and compatibility only.

The Sociology outcome rows include `display_group`, derived by the local
builder from the checked-in CCMAS course code for presentation only:
programme courses, supporting Social Sciences courses, and shared university
courses. This does not change the source course or its academic ownership.
The ability rows also include source-derived `display_title` values so the
student view can present the seven broader programme abilities as readable
cards while retaining the original wording for staff audit.

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

## 2026-09-12 authoritative career seed

The older seed counts above are historical and must not be used for the current
career refresh. The current source inputs produce 160 visible domains, 545 supported
subgroups, 5,093 roles, 48,163 tools, 240 certifications, 1,683
programme-domain links, 70,246 programme-role scores, 3,163 JAMB-domain links,
4,000 domain-overlap rows and 5,050 role work profiles.

Before rebuilding the current career seed after any role or structure change,
run these commands from the repository root:

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

1. Apply the career schema prerequisites through `migration_career_v2.sql` only
   on the explicitly approved empty/staging database; this recovery path does
   not apply to the current populated project or the local-first goal gate.
2. Apply the role/tools/source-backed/enrichment/resource schema migrations
required by the 2026-09-12 seed.
3. Apply `seed_career_v2_2026-09-12_parts_gz/part-001.sql.gz` through
   `part-022.sql.gz`, in numeric order, preserving each transaction.
   Then apply `migration_jamb_programme_learning_resources_2026-09-23.sql`
   and `seed_jamb_programme_learning_resources_2026-09-23.sql`; the latter
   loads the corrected all-420 identity-specific resource ledger, including
   the 11 JAMB names without a CCMAS anchor. Keep its rows review-only until
   the admin/student approval gate is explicitly passed.
4. Apply `migration_programme_domain_evidence_2026-09-17.sql` and
   `migration_programme_domain_review_corrections_2026-09-18.sql`, then
   apply `seed_programme_domain_evidence_2026-09-17.sql`,
   `migration_contextual_career_items.sql`,
   `migration_career_context_claim_validation.sql`,
   `migration_career_item_relationships_2026-09-17.sql`,
   `migration_career_context_path_targets.sql`,
   `migration_sociology_curriculum_contract_2026-09-17.sql`, and
   `migration_programme_curriculum_contract_general_2026-09-18.sql`.
5. Apply `migration_guidance_programme_reading_and_market_scope_2026-09-12.sql`,
   `migration_guidance_ownership_and_sociology_resources_2026-09-11.sql`,
   `migration_domain_student_orientation_2026-09-18.sql`,
   `migration_sociology_domain_tool_path_2026-09-18.sql`, and
   `migration_guidance_all_programmes_2026-09-12.sql` in that order.
6. Apply `migration_guidance_global_2026-09-11.sql` after the programme
   migration so domain-owned foundations remain separate from programme rows.
7. Apply the Sociology seed, then the four generic programme-curriculum parts,
   then `seed_career_context_items_v1_parts/part-001.sql.gz` through
   `part-035.sql.gz`, in numeric order, preserving each transaction.
   **Superseded for the D078 slice:** this step runs the contextual parts last,
   which aborts `seed_sociology_domain_guidance_2026-10-08.sql.gz`. For any
   deployment that includes the D078/Sociology overlay, follow the
   "Authoritative D078/Sociology apply order" section instead; this numbered
   recovery order also predates the 2026-10-08 guidance files and the D078
   taxonomy, visibility and role-item chain, and does not list them.
8. Apply `migration_student_pipeline_live.sql`.
9. Apply `migration_school_faculty_filter_2026-09-09.sql`.
10. If the older 2026-08-31 or historical JAMB transport was used, apply
   `migration_jamb_domain_mapping_corrections_2026-09-08.sql`.

The all-programmes guidance migration is separate from the compressed
domain/subgroup/role context seed. It adds **1,197 programme-owned context
rows** and **473 programme reading/source rows** for the 237 parsed CCMAS
programmes, including the original CCMAS JSON filename and matching PDF
locator. Sociology-specific books and resources remain owned by the reviewed
Sociology migration; the all-programmes file does not attach a generic
Sociology reference to every Social Sciences programme. Apply the all-programmes
file only after its programme-reading and ownership prerequisites exist.

The correction file is not a replacement for the career seed. The authoritative
2026-09-12 seed already has the corrected Sociology mapping, including the
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

The application also bounds national matcher reads at runtime. It narrows
candidate options through the indexed `subject_id` values selected by the
student and fails closed when the catalogue, authority rows or option items
are unavailable or exceed the safety bound. This runtime guard is code-only:
it does not add or change database tables and does not replace the required
seed/preflight sequence for a live deployment.

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
### Programme curriculum contract generalisation (2026-09-18)

After `migration_sociology_curriculum_contract_2026-09-17.sql`, apply
`migration_programme_curriculum_contract_general_2026-09-18.sql`. It removes
the Sociology-only presentation-group constraint and changes the default for
new contract rows to `programme_core`. It does not rewrite Sociology rows or
turn legacy `skills_profile` arrays into student-facing curriculum. Each
programme still needs its own source-backed contract seed before its cleaned
curriculum can be shown.

The local generic builder is:

```powershell
python data/career-mapping/_audit_original_ccmas_review.py --original-source-dir "C:\tmp\sifter-ccmas-original\ccmas original documents"
python data/career-mapping/_build_programme_curriculum_contract.py --out backend\seed_programme_curriculum_contract_2026-09-18.sql
python data/career-mapping/split_large_artifacts.py split-sql backend\seed_programme_curriculum_contract_2026-09-18.sql backend\seed_programme_curriculum_contract_2026-09-18_parts_gz --max-bytes 40000000 --gzip
```

After the Sociology seed, load the four compressed generic curriculum parts in
numeric order. They contain 81,186 cleaned source-backed outcomes across 236
non-Sociology programmes. The parts are complete SQL transactions and must be
decompressed before execution. Keep the generated monolithic SQL out of Git;
the manifest and compressed parts are the transport artifact. The original
CCMAS review manifest records the three rows that remain review-only and the
source reconciliation decisions for the remaining flagged rows. Those review
rows are retained for staff audit but are filtered from student responses.
