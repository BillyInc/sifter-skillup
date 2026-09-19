# Goal resume status and agent handoff

Date: 2026-09-18  
Branch: `very-new`  
Goal: **Resume the platform work and include the user’s observations, finishing
the Sociology flow before scaling the pattern to every programme.**

This document is the current handoff for continuing work in another ChatGPT
surface or with agents. It is not a completion report. The goal remains open.

## Read these documents first

Agents must read these files before changing code or data:

1. `AGENTS.md`
2. `docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md` — controlling product and box
   mockup contract
3. `docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md`
   — implementation audit and Sociology closure gates
4. `docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md`
   — Sociology-first plan, latest observation addendum and scaling rules
5. `docs/user-facing-mockups/EXPLORE_ENTRY_DOORS_AND_PROGRAMME_UNIVERSITY_FLOW_2026-09-18.md`
   — Explore entry doors, subject gates and programme/university routing
6. `docs/user-facing-mockups/programme-domain-subgroup-role-guidance-corrections-2026-09-17.md`
   — user-facing language and hierarchy corrections

The mockup documents are controlling design documents. If implementation,
older code or generated data conflicts with them, do not silently choose one.
Record the conflict, resolve it against the latest agreed product decision,
and update the controlling mockup document in the same pass.

## What has been completed locally

### Data and mapping safeguards

- The programme-to-domain audit was regenerated with course/outcome evidence.
- The local mapping audit reports 1,343 active programme-domain evidence rows,
  zero active numeric-gate failures and zero active semantic-review rows.
- Review-only and weakly supported mappings were removed from active guidance
  and retained in the source audit/unverified records.
- The current mapping keeps `direct`, `functional` and `adjacent` as the
  relationship between a particular programme and a domain. The explanation,
  inherited foundation and “what to add next” must be programme-specific.
- Nursing was checked locally: it has a reviewed Direct Nursing connection and
  reviewed Functional connections; no source-backed Adjacent connection was
  invented.
- The local Sociology curriculum contract passed its quality gate with 34
  courses, 243 course-outcome rows, 234 unique normalized outcomes and 7
  separately stored programme abilities.
- Legacy flattened programme skill arrays and role-aggregated domain rows are
  not valid student curriculum fallbacks.
- Direct Entry remains stored for the future polytechnic route but is filtered
  out of current student, SS, JAMB and university guidance responses.

### Programme and university flow

The intended Sociology student route is now represented locally as:

```text
subject/programme selection
  -> short programme preview
  -> dedicated university grid
  -> university selection or same-programme comparison
  -> selected-university programme overview
  -> university-aware requirements
  -> programme learning and curriculum explanation
  -> direct / functional / adjacent domain cards
  -> domain
  -> subgroup grid
  -> role grid
  -> role detail
  -> completed guidance review
  -> report actions
```

Local changes already made include:

- Early-secondary preview hides university requirements and downstream domains
  until a university is selected.
- University offerings are no longer supposed to appear inside the programme
  search result or as an inline chooser below the preview.
- Selecting a programme in the dedicated programme/university door now moves
  to the programme preview; the separate university grid owns university
  search and comparison.
- University cards use a separate selection tick and comparison control.
- Comparison is restricted to offerings of the same JAMB programme.
- Full institution name and abbreviation are shown only when authoritative
  fields are returned; the frontend does not invent expansions.
- Address is shown only when recorded; user-facing “Address not listed” and
  similar placeholders were removed from the relevant route.
- Selected-university overview explains the general programme requirement and
  the exact university-specific rule together, including recorded subject
  pools for phrases such as “three Arts or Social Science subjects”.
- Browser Back and visible Back preserve the preview → university grid →
  selected-university sequence.
- The old inline university chooser block in `AdmissionBrowseScreen.tsx` was
  removed as unreachable legacy behaviour.

### Programme learning presentation

- `DegreeSkills` groups the cleaned curriculum into bounded explanatory cards.
- The preview uses a short teaser; the fuller learning view is shown after a
  university is selected.
- The expanded curriculum card now explains what that part helps the student
  practise and then shows the course areas behind the explanation.
- Raw outcome counts were removed from the student-facing theme card.
- Programme reading/open-learning links are matched to the learning card when
  an explicit item-level resource association exists.
- Raw source wording, parser annotations and source locators remain staff/audit
  evidence rather than the primary student narrative.

### Domain, subgroup and role renderers

The local refined render path includes:

- Programme-specific connection cards for Direct, Functional and Adjacent
  relationships.
- A domain Overview tab and a separate `Build in this domain` tab.
- Domain orientation fields for what the field studies, what people do,
  questions, outputs, work sequence, programme fit and decision guidance.
- Domain-owned foundations before specialization.
- Purpose-first tool groups with one named tool per card, tool icons, purpose,
  option/alternative wording, relationship lines and item-level links.
- Subgroup grids rather than flat role lists.
- Subgroup continuation showing inherited domain foundation and subgroup-added
  skills, competencies, tools, methods and qualification routes.
- Role pages showing parent domain/subgroup context, role work, outputs,
  preparation sequence, skills, tools, competencies and qualifications.
- `GuidanceContinuation` showing what comes from the programme, what the
  domain contributes, what the subgroup adds and what the role focuses on.
- `ExternalLinkGuard` for external learning, documentation, official and
  source links. Student career components do not call `Linking.openURL`
  directly.
- No active flat role list on the domain screen.
- No student-facing local-context/source inventory wall in the active refined
  domain renderer.
- No black/white lightning or zap artwork was added to this route.

### Backend/API safety work

- Career API ownership filters keep domain-owned content separate from
  role-aggregated evidence.
- Generic source categories, review-only rows and unresolved ownership are not
  valid student recommendations.
- Context relationships only render as guidance when their relationship status
  is source-backed.
- Resource links are filtered by ownership/review state and show an honest
  no-link state when no specific verified destination exists.
- Student payloads do not expose Direct Entry in current routes.
- Migration/runbook documents contain the required dependency order, but the
  migrations and seeds have not been applied to Supabase in this work session.

## Verification completed

The following local checks passed after the latest Sociology changes:

- `pnpm.cmd exec tsc --noEmit --pretty false --incremental true`
- Focused backend tests: **55 passed**
- `pnpm.cmd run build:web`
- `git diff --check`
- Local Sociology curriculum contract audit
- Local exhaustive subject matcher audit with zero oracle mismatches
- Static check that student career components have no direct
  `Linking.openURL` call

The Vite build still reports existing unrelated warnings, including duplicate
keys/attributes in older simulator files, dynamic-import chunk warnings and
large chunks. These warnings are not evidence that the Sociology route is
complete.

## What is still left to do

### 1. Finish the local Sociology render audit

The Sociology slice must not be marked complete until the following are
verified in the actual rendered route, not only by static inspection:

- SS1/SS2 preview is concise, contract-derived and does not expose domains or
  university requirements prematurely.
- Programme search selection closes the search state and consistently enters
  the preview for all three relevant entry behaviours.
- The university grid shows full source-backed institution identity, address,
  qualification/duration when the source provides them, selection ticks and a
  usable same-programme comparison modal.
- Selected-university requirements show national guidance, the university’s
  exact rule, expanded subject pools, exception notes and address without a
  detached requirements tab in the guided path.
- Back from university selection returns to preview; Back from the selected
  university returns to the university grid.
- Programme curriculum cards remain synthesized and bounded. No raw outcome
  wall, raw source search, parser annotation, LIS exception or developer label
  may appear to students.
- Domain, subgroup and role cards display the correct icons, narrative,
  inherited/added relationship, purpose-first tools, skills, competencies,
  methods, certifications and item-level resource actions.
- The domain Build tab is separate from the learning path.
- Roles appear only under subgroups, not as a domain-level role inventory.
- `not_established` relationship coverage and staff-only source rows never leak
  into student guidance.
- Report print/download/share actions remain unavailable until the guidance
  review step is complete.

The existing route interaction test is not currently reliable because the Jest
configuration reports `Preset jest-expo not found`. Fix the test harness or
add an equivalent browser/route smoke test before declaring the route closed.

### 2. Complete the Sociology item/resource audit

For every Sociology programme, Social Sciences domain, subgroup and selected
role item, verify:

- item type is correct: skill, tool, competency, certification or resource;
- the item belongs to the correct ownership/context level;
- the explanation says what it does in this specific programme/domain/
  subgroup/role context;
- prerequisites, complements, alternatives and qualification relationships
  are source-backed rather than inferred from name similarity;
- each item has its own verified HTTPS destination, or an honest explicit
  no-link state;
- supporting evidence links are distinct from learning/documentation links;
- tools are grouped by purpose and labelled as options, not universal
  requirements;
- certifications distinguish Nigerian, global and shared scope and identify
  licence, examination, qualification, training or reference-body status;
- methods are integrated with the skills/competencies they support and are not
  presented as a separate qualification requirement;
- generic categories, browsers, social platforms, unrelated office software,
  duplicate inherited tools and raw source taxonomy labels are excluded from
  student guidance.

### 3. Complete admin and institution views for Sociology

Extend the approved student hierarchy into:

- programme intelligence;
- institution curriculum/evidence view;
- skills-gap view;
- Explore clusters/domains;
- educator/admin self-guidance;
- guidance resume and student provisioning; and
- the final report.

Admin views may show granular course outcomes, source wording, provenance,
review state and audit evidence. They must use admin/institution-specific
language and must not show student users raw staff audit content.

The skills-gap view must show, separately:

1. what the institution teaches from the cleaned programme contract;
2. what the directly connected domain foundation uses;
3. what the domain’s subgroups add;
4. what selected roles add;
5. which skills, tools, competencies or qualifications are absent from the
   institution’s teaching record;
6. how each gap builds on existing teaching;
7. why the gap matters in that downstream context; and
8. how the items relate to one another.

Unavailable or unseeded data must be shown as unavailable. It must not be
renamed “market evidence” merely because a market layer is expected later.

### 4. Apply the approved pattern to all programmes

Only after Sociology passes its route, item/resource, admin and report gates,
propagate the contract and render pattern to:

- every direct domain mapping;
- every functional domain mapping;
- every adjacent domain mapping;
- partial CCMAS programmes;
- JAMB names split from one CCMAS programme;
- JAMB names combining several CCMAS programmes;
- external-only programmes; and
- programmes with no CCMAS curriculum.

Each programme must retain its own curriculum provenance and programme-specific
relationship explanation. Never copy Sociology prose or a generic fallback
into another programme.

Run a downstream sweep for duplicate tools, wrong categories, missing links,
incorrect subgroups, roles outside their subgroup, missing adjacent records,
bad role labels and hardcoded frontend data. All student-visible data must
come from the API/SQL contract, not from JSX arrays or placeholder text.

## Supabase and deployment boundary

This handoff is in **manual-only Supabase mode**.

- Do not write through REST, service client, RPC, `psql` or the SQL Editor.
- Do not claim that a migration or seed is live because it exists locally.
- The current live/partial database may show only a shell or limited domain
  content until the documented schema and seed sequence is applied manually.
- Use `backend/COMPLETE_DATA_MIGRATION_2026-08-17.md` and
  `backend/MIGRATION_RUNBOOK.md` for the exact order.
- After the user applies SQL, run the documented read-only preflight and
  compare live counts with the local contract before approving the live route.

## Agent operating rules

Every agent pass must follow this sequence:

1. Read `AGENTS.md` and all controlling mockup/audit documents listed at the
   top of this file.
2. Inspect the current worktree and preserve unrelated user changes. Do not
   reset, clean, overwrite or delete broad directories.
3. State the exact observation or acceptance gate being addressed.
4. Trace the data from source/SQL contract → API → TypeScript type → renderer.
   Do not fix a display problem by hardcoding data in a component.
5. Keep student, educator, secondary-school owner, university and tutorial
   centre language/context separate.
6. Keep programme, domain, subgroup and role ownership separate. Do not use
   role aggregates as domain foundations.
7. Keep direct, functional and adjacent explanations specific to the selected
   programme-to-domain relationship.
8. Ensure each displayed item has an item-specific verified link or an honest
   no-link state. Never attach a generic homepage to satisfy a link check.
9. Run focused tests plus TypeScript and web-build checks proportional to the
   change.
10. **At the end of every pass, update all relevant mockup/audit documents.**
    At minimum update:

    - `docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`
    - `docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md`
    - `docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md`
    - this handoff file, if status, evidence, blockers or next actions changed

    Each update must record:

    - the observation addressed;
    - files/data contracts changed;
    - the resulting user-facing behaviour;
    - tests/checks run and their exact result;
    - live SQL/deployment status; and
    - remaining gaps or follow-up work.

11. Do not mark a row “complete” because code compiles. Mark it complete only
    after the relevant render path, data ownership, link behaviour and user
    type have been verified.
12. Do not push to any branch unless the user explicitly asks for a push.

## Suggested next pass

The next agent should do the following in order:

1. Fix or replace the Sociology route interaction test harness so the complete
   preview → university → overview → domain → subgroup → role path can be
   exercised.
2. Run a local browser smoke test against seeded/local fixtures or honest
   unavailable states and capture the exact visible route behaviour.
3. Audit `DegreeSkills`, `ContextualItemList`, `ToolGroupsBlock`,
   `CertPlacementList`, `SubgroupBody` and `RoleBody` against the controlling
   box mockup, especially methods, relationships and resource links.
4. Remove any remaining duplicate foundation or role/work presentation in the
   active Sociology render path.
5. Extend the admin skills-gap and programme-intelligence surfaces only after
   the student Sociology path passes.
6. Update the mockup documents and this handoff with evidence before moving to
   all-programme propagation.

## Current status

**Sociology: in progress — not approved for scaling.**  
**All-programme propagation: not started as an approved rollout.**  
**Supabase deployment: not performed in this session.**  
**Branch push: not requested and not performed.**

## 2026-09-19 local Sociology implementation pass

This pass was completed by the main agent only. No agents were deployed and no
Supabase write was attempted.

### Closed or narrowed in the local implementation

- `ContextualItemList` now keeps methods inside the expanded skill or
  competency card that exactly names the method. A subgroup method is not
  copied onto every nearby item merely because it belongs to the same area.
  Unmatched methods remain unavailable to the student rather than becoming a
  separate qualification-like wall.
- Relationship labels now resolve against the complete context-item set, so a
  competency can correctly explain its connection to skills or tools even when
  the visible section is filtered to competencies.
- The reviewed Sociology role gate now requires an exact case-insensitive
  role-owned `career_context_items` record. A legacy description, flattened
  skill array or unrelated source row cannot make an unreviewed D078 role
  appear as a student card.
- The active subgroup and role branches retain explicit item-type filters;
  the old unfiltered branches remain historical, unmounted source code and
  are still a cleanup item before final consolidation.

### Verification recorded for this pass

- `pnpm.cmd exec tsc --noEmit --pretty false --incremental true` - passed.
- `pnpm.cmd run build:web` - passed; Vite transformed 1,351 modules. Existing
  duplicate-key, duplicate-attribute, chunk-size and dynamic-import warnings
  remain unrelated warnings.
- `backend/.venv/Scripts/python.exe -m pytest backend/tests -q` - **335
  passed** in 24.48 seconds; existing dependency/deprecation warnings remain.
- Direct route-helper smoke - passed for the Sociology D078 route with
  programme, JAMB programme, university and user context preserved.
- The fresh Jest route test remains unavailable because this worktree's pnpm
  Jest resolution reports `Preset jest-expo not found`; no speculative Jest
  configuration was left behind.
- The local contextual contract contains 727 D078 rows: 8 domain-owned, 20
  subgroup-owned and 699 role-owned. All 727 carry source references and
  source locators. This is local contract evidence, not proof of live
  deployment or proof that every destination URL is live.

### Status after this pass

The active local renderer is closer to the agreed Sociology box mockup, but
Sociology remains **OPEN - not approved for scaling**. Remaining gates are:

- route-level browser interaction and Back/context proof;
- live offering payload proof for full institution name, abbreviation,
  address, requirements, subject pools and exceptions;
- final content review of the synthesized Sociology curriculum narrative;
- removal or formal archival of the unmounted legacy domain/role branches;
- record-level verification of every student-visible learning/resource URL,
  relationship and certification scope; and
- end-to-end report gating proof.

The user must apply the documented migrations and seeds manually before any
live-data-dependent gate can be approved. All-programme propagation remains
paused until these Sociology gates are closed.

## 2026-09-19 local integration checkpoint

`pnpm.cmd run test:sociology-route` now provides a repeatable local route
smoke. It passed five transitions covering programme preview, university
context, domain, subgroup and role, while retaining the programme, JAMB
programme, university and user context in the generated URLs. This is
route-helper evidence, not browser-render evidence.

The local JAMB detail contract also includes an additive, source-backed
award/duration patch in `backend/migration_jamb_programme_award_fields_2026-09-19.sql`.
It has not been applied to Supabase; manual application and live payload
verification remain required. The Jest preset remains unresolved, so the
speculative Jest config was removed. Sociology remains OPEN - not approved for
scaling pending browser, live-payload, item/resource,
relationship/certification and report-gate evidence.

## 2026-09-19 visible report-gate agent checkpoint

Pasteur completed the bounded report/Review pass in local commit `187784c`
(no push). The pass gates print/download/share actions on an explicitly
completed Review with stable programme and university identities, preserves
the full guidance path during selection writes, and reopens the route when a
selection changes. The focused Jest run remains unavailable because this
checkout cannot resolve the Jest Expo/circus runner; live Supabase and
browser report E2E remain unverified. Avicenna and Huygens remain open on
their assigned student-item and admin surfaces.

## 2026-09-19 agent restart and curriculum audit checkpoint

The previous Avicenna and Huygens agent records reached a terminal Codex
usage-limit error and could not be resumed. Those terminal records were
closed; Pasteur's completed report-gate record remains visible. Fresh visible
agents were deployed with the same disjoint scopes:

- Aquinas (`01a0b98a-1306-78c3-920a-a37018508203`): student item/resource,
  relationship and certification surfaces.
- Lorentz (`01a0b98a-15d3-7850-a932-b79a7a5ba33f`): admin/institution and
  remaining local acceptance surfaces.

The local programme curriculum audit completed successfully with 237
programmes and 81,429 course-outcome rows. The Sociology slice contains 243
contract rows and 234 unique outcomes; legacy profile extras remain audit
evidence only and do not replace the clean student contract. This remains
local evidence, not live Supabase deployment evidence.

The original CCMAS review audit also completed successfully: 122 flagged
course rows were checked, with 119 source-backed rows, 3 review-only rows,
121 original rows checked and 1 row without an extracted page. This preserves
the distinction between source review and student-facing curriculum data; it
does not close the browser, live-payload or report gates.

The browser verification attempt was also bounded locally: the computer-use
surface returned no available browser, the in-app browser reported `iab` as
unavailable, and the local Vite dev server could not resolve its config under
the managed workspace (`Cannot read directory "../..": Access is denied`).
The production web build remains green, but browser interaction evidence is
therefore still missing rather than inferred from the build.

## 2026-09-19 visible admin/institution checkpoint

The local admin/institution pass is saved in the working tree. It adds
source-backed organisation identity fields to the admin contract and profile,
propagates official university name/short name/address through student
subject-match offerings, and partitions SkillsGap into taught records, gap
candidates for curriculum review, and source-review records excluded from both
counts. No SQL was applied and no live deployment is claimed.

Focused verification passed: 92 backend institution/subject tests, TypeScript,
the five-transition Sociology route smoke, and the web production build. The
build retains unrelated pre-existing duplicate-key/duplicate-JSX warnings.
The worktree remains intentionally uncommitted because the touched files also
contain unrelated dirty work; no push was made. Sociology remains open pending
browser render proof, live payload verification, item/link/relationship and
certification review, and completed-review report proof.

## 2026-09-19 visible admin/institution checkpoint

The local admin/institution pass is saved in the working tree. It adds
source-backed organisation identity fields to the admin contract and profile,
propagates official university name/short name/address through student
subject-match offerings, and partitions SkillsGap into taught records, gap
candidates for curriculum review, and source-review records excluded from both
counts. No SQL was applied and no live deployment is claimed.

Focused verification passed: 92 backend institution/subject tests, TypeScript,
the five-transition Sociology route smoke, and the web production build. The
build retains unrelated pre-existing duplicate-key/duplicate-JSX warnings.
The worktree remains intentionally uncommitted because the touched files also
contain unrelated dirty work; no push was made. Sociology remains open pending
browser render proof, live payload verification, item/link/relationship and
certification review, and completed-review report proof.
## 2026-09-19 integrated Sociology agent verification

Aquinas integrated `f57e4da` for student guidance ownership, relationships,
resources, methods, certifications and role continuation. Lorentz integrated
`e1635fc` for admin/institution context, source-backed university identity and
teaching-record language.

Current integrated checks: 336 backend tests passed; larger-heap TypeScript
passed; the five-transition Sociology route smoke passed; the production web
build passed; and `git diff --check` passed apart from normal line-ending
warnings. No Supabase SQL was applied. Browser/live payload and report E2E
proof remain unavailable in this environment, so Sociology remains OPEN and
all-programme propagation remains paused.

## 2026-09-19 bounded report-gate smoke

The fresh visible-agent connector was unavailable in this session, so no new
subagent handle was fabricated or hidden. Report verification was completed
locally with `scripts/sociologyReportSmoke.cjs`, a bounded non-Jest harness that
loads the real report readiness and selection-transition functions and renders
the real `DetailScaffold` with only native/UI boundaries stubbed for Node.

`node scripts/sociologyReportSmoke.cjs` passed. It proves locally that
print/download and share are absent before completed Review, appear after
completed Review, relock when a selected role changes the path, and reopen only
after Review is completed again. It also checks Review-to-`DetailScaffold`
action wiring. The direct Node import blocker was TSX left uncompiled by
ts-node and Flow syntax in real `react-native`; the harness resolves both
without changing Jest configuration. Browser and live Supabase verification
remain manual/unverified, and scaling remains paused.

## 2026-09-19 local Sociology source-contract audit

`data/career-mapping/_audit_sociology_student_guidance_contract.py` generated
`data/career-mapping/_audit/sociology_student_guidance_contract_2026-09-19.json`
and `data/career-mapping/_audit/SOCIOLOGY_STUDENT_GUIDANCE_CONTRACT_AUDIT_2026-09-19.md`.
The read-only audit found 725 D078 contextual items, all source-backed and
correctly owned with source references and locators; 2,519 normalized
relationships, all source-backed, resolved and duplicate-free; 51 reviewed
resource rows with valid HTTPS syntax; and 829 broad imported catalogue rows
kept separate from student approval. Generic credential signals are no longer
emitted as student-facing certifications; they remain in the source audit.
Only 27 contextual items match a reviewed item-specific resource; 698 retain
the honest no-link state. URL reachability was not tested, no SQL was applied,
and scaling remains paused.

### 2026-09-19 live Sociology deployment checkpoint

The read-only Supabase preflight is healthy for the already-deployed base
surfaces: matcher ready, 1,260 typed rule rows, 604 option rows, 9,130
offerings sampled, zero duplicate school/programme rows, zero missing school
identities, and school identity count 872. This is not proof that the reviewed
Sociology guidance layer is deployed.

The live Sociology slice is still partial: the Sociology programme, D078
programme-domain links, two D078 subgroups and 24 roles are present, but the
live schema cache does not expose `programme_curriculum_outcomes`,
`programme_domain_evidence`, or `career_item_relationships`. The live
`career_context_items` and resource tables also lack the current ownership,
data-state and review columns required by the student contract. No SQL writes
were made; manual application and post-apply verification remain required.

### 2026-09-19 fresh visible-agent checkpoint

Fresh visible agents Boyle and Hegel were deployed with disjoint backend/API
and frontend route/report scopes. Boyle completed an incremental local seed-
transport audit in `eab2b8b`; it checks all 30 contextual SQL transport parts
and finds zero old generic D078 certification signal hits, without applying
SQL. Hegel remains visible while completing the frontend bounded pass. The
report smoke is now exposed as `pnpm run test:sociology-report` and passes.
Terminal usage-limit records were closed only to free agent capacity; no active
agent was hidden.

### 2026-09-19 scaling-phase decision

The user has explicitly authorized beginning the broader scaling work before
the deferred live SQL/browser closure. This authorizes local contract, API,
source-audit, relationship-population and UI-surface work across the remaining
parsed programmes; it does not authorize presenting the unapplied live
Sociology or generic contract as production-ready. SQL application, live
payload verification and browser acceptance remain end-of-phase gates.

Scaling must preserve the Sociology safeguards: programme-owned curriculum,
explicit programme-domain evidence, separate domain/subgroup/role ownership,
source-backed relationships with retained locators, honest no-link states, and
fail-closed handling for unresolved or review-only records.

### 2026-09-19 first cross-programme scaling audit

The existing downstream audits were rerun against the current parsed corpus.
The generic curriculum contract covers 236 non-Sociology programmes with
81,186 student-displayable course-outcome rows, while the curriculum audit
still flags legacy-profile boundary findings in 225 of 237 parsed programmes;
those legacy arrays remain audit-only. The review-state inventory reports 220
`partial` and 6 `not_established` findings. Subgroup/role traceability reports
5,209 merged role records with source evidence, but 119 without work-profile
rows. The tool-leakage audit flags 136 scopes and drops 553 items. These are
the scaling backlog, not student-facing approvals; no generic data is being
promoted merely because the route renders.

The shared navigation contract now has a local multi-programme smoke:
`pnpm run test:programme-scale` passes Sociology, Nursing and Accounting
fixtures through 15 programme/university/domain/subgroup/role transitions.

### 2026-09-19 scaling-agent pool checkpoint

To increase throughput without discarding work, two terminal completed records
were closed after their commits were verified, freeing two slots. The visible
scaling pool now covers: live-schema preflight (`e7705d0`/`24401ac`), contextual
transport integrity (`ea34176`), cross-programme downstream audit (Peirce),
relationship/source preservation (Goodall), and generic programme UI scaling
(Epicurus). SQL remains deferred and no agent is allowed to fabricate external
relationships or treat an unapplied seed as live.

### 2026-09-19 agent merge checkpoint

Boyle completed `2df5c2e`, restricting student JAMB context rows to explicit
programme ownership and `source_backed` data state, with a regression test.
Hegel completed `55fe21e`, binding report readiness to the active programme and
university route so a stale completed Review cannot unlock another route.
After both merges, the full backend suite passes **337 tests**, TypeScript
passes with the configured larger heap, and both Sociology route and report
smokes pass. The production web build also passes. Live Sociology SQL and
browser proof remain outstanding; scaling stays paused.

### 2026-09-19 all-programme downstream handoff correction

The downstream scaling boundary is the full parsed corpus: **237 programmes**
(236 generic CCMAS programmes plus Sociology), their active programme-domain
links, and every owned domain/subgroup/role route reachable from those links.
Sociology plus Nursing and Accounting remain smoke fixtures only; passing those
fixtures is not evidence that the other programmes were audited.

The agent handoff is intentionally disjoint: source enrichment and retained
URL/locator evidence; source-state and fail-closed contract enforcement; and
downstream UI coverage/reporting. Each agent must save an incremental commit,
record full-population coverage separately from sample smoke coverage, and
leave unverified data as `review_required`, `no_link`, `not_established` or
`audit_only`. External-source enrichment applies to curriculum, resources,
contextual items and relationships alike. SQL, live payload verification and
browser acceptance remain deferred end-of-scaling gates.

### 2026-09-19 current scaling checkpoint

Scaling is active; browser proof and SQL remain reserved for the end. The
contextual catalogue now carries explicit item-level link fields through the
schema, generated SQL parts and student payload: **126,414 rows**, with
**1,000 linked** and **125,414 honest `no_link`** states, and zero missing
link-state rows in the local audit. This does not prove URL reachability or
live deployment.

The JAMB/CCMAS matrix covers all **420 unique JAMB names**: 273 partial-scope
rows, 28 combined-component rows, 6 external-source-required rows and 113
single-full-CCMAS baseline rows. Combined and split/fan-out cases retain
component evidence; unresolved source cases remain `review_required`.

The remaining data backlog includes **2,305** unresolved or
`not_established` relationship rows with retained source references/locators,
and one parsed programme without an active domain mapping:
`Sciences::Mathematics`. Admin provenance, review-state, student-leak and
report-gate coverage remains part of this pre-browser/pre-SQL phase.

### 2026-09-19 broad source-enrichment checkpoint

The local scaling pass now has a deterministic broad inventory at
`data/career-mapping/_audit/source_enrichment_batch_broad_2026-09-19.json`.
It covers all **420** canonical JAMB identities and all **237** canonical
programmes, including 273 partial-scope, 28 combined, 6 external-source-
required and 113 single-full-CCMAS identities. The split/fan-out inventory
retains 83 CCMAS components across 346 identities. Every row keeps an
authoritative URL plus a local source locator; resource and relationship gaps
remain explicitly `review_required`/`not_established`.

The local working mapping now has a source-linked Mathematics → Data Science
functional candidate, supported by the official NOUN and ABU Mathematics
curriculum pages and seven strong CCMAS course anchors. This is local evidence
only; it does not apply SQL or change live payloads. The broad checkpoint test
passes **3 tests**. The admin record in every programme row remains
`pending_full_population_render`, so admin provenance/state review is still
required before browser acceptance.

### 2026-09-19 admin/downstream acceptance checkpoint

The admin evidence contract now requires a stable context key and matching
guidance owner before a verified row can enter approval or student exposure.
It exposes explicit queue states for review-required, no-link,
not-established, audit-only, unavailable, identity-incomplete and
provenance-incomplete rows. The local checkpoint covers all 237 programmes
and 420 JAMB identities and records `Sciences::Mathematics` as the one
unmapped programme rather than assigning an inferred domain.

Verification passed: the 4-test admin acceptance gate, 10 combined
population/JAMB coverage tests, `node scripts/adminGuidanceAuditSmoke.cjs`,
`node scripts/sociologyReportSmoke.cjs`, TypeScript and `git diff --check`.
Full admin rendering, live institution payloads, browser proof and SQL remain
deferred; student exposure is not approved.
