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
- The local mapping audit reports 1,344 active programme-domain evidence rows,
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
while all 237 parsed programmes now have active domain mappings. The previously
unmapped `Sciences::Mathematics` programme now has a source-backed functional
`D009 Data Science` link; weaker Mathematics-to-Actuarial and partial JAMB
cases remain `review_required`. Admin provenance, review-state, student-leak
and report-gate coverage remains part of this pre-browser/pre-SQL phase.

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
and 420 JAMB identities; all parsed programmes now have an active mapping,
including the source-backed Mathematics → Data Science candidate.

Verification passed: the 4-test admin acceptance gate, 10 combined
population/JAMB coverage tests, `node scripts/adminGuidanceAuditSmoke.cjs`,
`node scripts/sociologyReportSmoke.cjs`, TypeScript and `git diff --check`.
Full admin rendering, live institution payloads, browser proof and SQL remain
deferred; student exposure is not approved.

### 2026-09-21 active scaling checkpoint

The regenerated local catalogue currently contains **121,377 contextual items**
across **5,668 contexts** and **408,163 relationships**. All **237 parsed
programmes** have active domain mappings (**1,344** links), and the local
scaling audit reports zero ownership, source-reference, locator, data-state, or
item-link-state gaps. The unresolved relationship backlog is **2,305** rows;
they remain `not_established` and fail closed.

The external-search queue now records all three append-only ledgers:
`d078_domain_subgroup_search_ledger_2026-09-20.jsonl`,
`full_population_tranche_001_search_ledger_2026-09-21.jsonl`, and
`full_population_tranche_002_search_ledger_2026-09-21.jsonl`. Their evidence is
carried separately until reviewed into the generated catalogue; no unsupported
relationship was promoted. Three new agents are active for tranche 003 item
search, relationship search, and student/admin language-card review. Their
checkpoints must be saved under
`data/career-mapping/_audit/external_enrichment_agent/` or the relevant audit
directory so work can resume without losing progress.

The local audit suite is green (**47 tests**). SQL application, live payload
verification, browser proof, and full-population admin render acceptance remain
end-of-scaling gates.

### 2026-09-21 external tranche 003 checkpoint

The next disjoint item tranche is now searched and saved incrementally:
**32 rows**, with **14 `linked`** and **18 `review_required`** decisions. The
next relationship tranche is also complete: **8 rows**, all
`review_required`, with **0 promotions** because no source established the
missing same-context typed endpoints. The merged queue now reports **110 item
search records** and **20 relationship search records** across the append-only
ledgers. No SQL, seed transport, browser-proof, or unsupported relationship
promotion occurred.

The current local queue totals are **10,009 unique items** and **2,305
unresolved relationships**: 62 item identities are externally linked, 38 are
explicitly review-required, 20 relationship candidates have retained search
evidence, and the rest remain pending. This is incremental progress toward the
full external-source requirement, not a claim that all records have been
searched.

The UI/admin audit is saved at
`data/career-mapping/_audit/ui_admin_guidance_audit_2026-09-21.md`. The role
hero summary and verified-link accessibility-label follow-ups are closed;
TypeScript, admin guidance smoke, report smoke and the local audit suite pass.
Student-facing titles remain presentation-formatted while canonical IDs and
admin raw titles are preserved. Full browser rendering and live payload proof
remain open.

## 2026-09-21 full-population downstream/admin audit checkpoint

The local audit is complete for the requested 237-programme/420-JAMB boundary.
It records 237/237 downstream route coverage: 1,344 domain routes, 3,580
subgroup routes and 46,941 role routes across 5,668 contexts. Curriculum/card
summary, friendly-title, bounded role-learning, source/link-state,
relationship-grouping, admin provenance/review queue and student-safe filtering
checks pass locally. The canonical catalogue is 121,377 items and 408,163
relationships; 2,305 unresolved/not-established edges and programme review
queues remain explicitly fail-closed. The broad enrichment inventory's
126,414/422,739 totals are kept separate and are not student-scaling counts.

The only bounded implementation change in this pass corrected the route-audit
Nursing smoke fixture to `Allied Health Sciences::Nursing Sciences`. No UI,
SQL, seed transport, external ledger or browser proof was changed. Scaling,
browser, live payload and manual Supabase gates remain open. Full report:
`data/career-mapping/_audit/full_population_downstream_admin_audit_2026-09-21.md`.

## 2026-09-21 tranche 004 enrichment checkpoint

Tranche 004 searched **32 item/relationship rows**: **11 linked item
records**, **21 review-required records**, and **0 relationship promotions**.
All 8 relationship candidates remained `review_required` because their local
target endpoint or exact typed edge was not established. The merged queue now
contains **138 item search records** and **32 relationship search records**.

The local audit suite remains green at **47 tests**. Completed agents were
closed after their artifacts were verified; SQL, seed transport, catalogue and
browser-proof artifacts were not changed by tranche 004.

## 2026-09-21 tranche 005 continuation checkpoint

The next item and relationship selections were saved before searching so the
work remains resumable. The three attempted agent sessions then terminated:
two reached the account usage limit and one lost its access token. No failed
agent result was promoted. The role-profile continuation did complete its
local audit: 20 additional roles are explicitly bounded/local-only and
`review_required`, leaving 79 missing work-profile records; no generated role
profile was invented.

The local pass recorded authoritative evidence for eight tranche-005
certifications. AWS Certified Solutions Architect – Associate, Certified
Kubernetes Administrator, ISTQB Certified Tester Foundation Level, AWS Data
Engineer Associate, Databricks Certified Data Engineer Associate and Google
Cloud Professional Data Engineer are `linked` to official item-specific
pages. The Azure Developer and Azure Data Engineer entries are
`review_required`: Microsoft retains the historical identities but its current
pages mark those certification/renewal paths retired. The queue now reports
**146 searched item records** (**79 linked**, **57 review-required**) and **32
searched relationship records** (**24 review-required**, no promotions), with
**9,873 item identities** and **2,281 relationships** still pending external
search. The overall unresolved relationship count remains **2,305**.

The 47-test local audit suite passes after queue regeneration. SQL, generated
seed transport, browser proof and live admin/student payload verification
remain deferred end-of-scaling gates.

## 2026-09-21 tranche 005 agent checkpoint

Agent tranche 005 completed the saved **32-item** selection: **27 linked** and
**5 review-required**, with zero unavailable results and zero relationship
promotions. The relationship agent completed its saved **8-row** selection:
all **8 remain review-required**, because authoritative role/tool pages did not
establish the missing typed target endpoints or edge type. The role-profile
agent audited 20 more roles without inventing profiles; **59 missing
work-profile roles remain**.

After merging the append-only ledgers and rebuilding the queue, the canonical
queue reports **170 searched item records** (**88 linked**, **59
review-required**, **9,862 pending**) and **40 searched relationship records**
(**32 review-required**, **2,273 pending**). The catalogue still contains
**2,305 unresolved relationships** in total. The local audit suite remains
green at **47 tests**. The full relationship-resource audit parser was also
corrected to consume the validated gzip JSON document, rather than failing on
the final bytes of the large relationship array.

The rerun now scans all **121,377 items** and **408,163 relationships** across
**237 programmes** and **420 JAMB identities**, reporting **405,858
source-backed** edges and **2,305 not-established** edges without parser
failure.

## 2026-09-21 role work-profile tranche 003 checkpoint

The read-only role work-profile continuation audited the next non-overlapping
20 roles (queue positions 41-60) after `role_work_profile_tranche_002`. All 20
have exact records in the vendored European Commission ESCO occupation extract,
including CSV row locators, concept URIs, definitions and occupation-skill
relation locators. The public ESCO API transport was attempted for every row
but was unavailable in this local run, so none was counted as an online exact
identity match. All 20 remain `bounded_local_only` and `review_required`.

No role record, work-profile row, Nigerian mapping, seed, SQL, UI or previous
tranche artifact was changed. The three tranche ledgers are disjoint (60
unique role keys); 59 missing work-profile roles remain. Evidence and report:
`data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_003_2026-09-21.json`.
Checkpoint:
`data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_003_checkpoint_2026-09-21.json`.

## 2026-09-21 tranche 006 agent checkpoint

The next disjoint item tranche searched **32** identities: **19 linked** and
**13 review-required**, with no unavailable results. The next relationship
tranche searched **8** rows: **0 promoted** and **8 review-required** because
the source evidence did not establish the missing typed target endpoints or
edge types. The role-profile agent audited queue positions 61-80: all **20
remain bounded/local-only and review-required**, leaving **39 missing role
profiles**. No profile, mapping, SQL, seed, catalogue or UI row was invented
or changed.

After queue regeneration, the append-only ledgers contain **202 searched item
records** (**99 linked**, **63 review-required**, **9,847 pending**) and **48
searched relationship records** (**40 review-required**, **2,265 pending**).
The catalogue-level relationship totals remain **405,858 source-backed** and
**2,305 not-established**. The local audit suite is green at **47 tests**;
admin and Sociology report smoke checks pass. All three agents were closed
after their artifacts were verified, leaving the agent slots available for the
next cycle.

## 2026-09-21 role work-profile tranche 005 checkpoint

The read-only role work-profile continuation audited the next non-overlapping
20 missing roles, queue positions **81-100** after tranche 004. Fifteen O*NET
identities were verified against their official item-specific summary URLs;
five ESCO identities retain exact vendored occupation records, definitions,
concept URIs and occupation-skill locators. All 20 remain `review_required`.

No role record, work-profile row, Nigerian mapping, application code, seed,
SQL, UI or previous tranche artifact was changed. The tranche is disjoint from
the earlier role ledgers, and **19 missing work-profile roles remain**. Evidence,
report and checkpoint:
`data/career-mapping/_audit/external_enrichment_agent/role_work_profile_tranche_005_2026-09-21.json`.

The pass changed no user-facing behaviour. Local parity/non-overlap validation
passed; live SQL, browser proof and live-payload verification remain deferred.

## 2026-09-21 full-population item-enrichment tranche 007 checkpoint

The next canonical, non-overlapping item tranche searched **32 contextual
identities** after excluding D078 and tranches 001-006. **21** were linked to
authoritative item-specific evidence and **11** remain `review_required` because
the sources support a broad, combined or context-ambiguous label rather than
the exact catalogue item. Every ledger row retains HTTPS URLs, authorities,
locators, evidence summaries and access dates. No relationship row was searched
or promoted in this item-only pass.

Selection/ledger parity is **32/32**, with zero duplicate IDs, zero overlap with
prior item ledgers, zero D078 rows and zero missing required evidence fields.
The tranche artifacts are under
`data/career-mapping/_audit/external_enrichment_agent/` using the
`full_population_tranche_007_*_2026-09-21` names. No catalogue, generated seed,
SQL, UI, app code or browser-proof artifact changed. The local search scripts
compile successfully; live SQL, browser proof, live-payload verification and
the remaining item/relationship/role queues remain deferred/open.

## 2026-09-21 relationship tranche 007 and merged queue checkpoint

The next disjoint relationship tranche searched **8** rows. All **8 remain
`review_required`**: O*NET and first-party tool documentation confirmed
occupation/tool associations but did not establish complete typed source-target
edges, so no endpoint or relationship type was inferred. The relationship
ledger now contains **56 searched rows** with **48 review-required** results.

The merged external queue now reports **234 searched item records** (**112
linked**, **70 review-required**, **9,827 pending**) and **56 searched
relationship records** (**48 review-required**, **2,257 pending**). The
catalogue still has **405,858 source-backed** and **2,305 not-established**
relationships. The full local audit suite remains green at **47 tests**; all
tranche-007 agents were closed after verification.

## 2026-09-21 full-population item-enrichment tranche 008 checkpoint

The next canonical item tranche selected and searched **32** new contextual
identities after excluding D078 and all prior item tranches. **21** carry
authoritative item-specific evidence and **11** remain `review_required` because
the source is retired, broad, combined or context-ambiguous. Every searched row
retains the URL, authority, locator, evidence summary and access date. No
relationship rows were searched or promoted.

Selection/ledger parity is **32/32**, with zero missing rows, duplicate IDs,
D078 rows or non-HTTPS evidence. The merged audit queue now includes **266
searched item records** and **56 searched relationship records**; its current
item states are **121 linked**, **73 review-required** and **9,815 pending**
across 10,009 unique identities. The catalogue remains **405,858
source-backed** and **2,305 not-established** relationships. Tranche artifacts
are saved under
`data/career-mapping/_audit/external_enrichment_agent/full_population_tranche_008_*_2026-09-21`.

No catalogue, generated seed transport, SQL, UI, app code or browser-proof
artifact changed. The tranche is **not blocked**; live SQL, browser proof,
live-payload verification and the remaining enrichment queues remain open.

## 2026-09-21 faster-cycle checkpoint

The larger agent attempt was stopped by the account usage limit before it
produced usable tranche-009 evidence. Three smaller, checkpoint-first agents
then completed successfully. The item agent searched **16 contextual rows**
representing **10 deduplicated item names**: **14 linked** and **2
review-required**. The relationship agent searched **4** rows: **0 promoted**
and **4 review-required**, with no inferred endpoints or edge types. A separate
read-only downstream/admin slice covered **20 non-overlapping programmes** and
passed curriculum, ownership, provenance, category, language, bounded-role-
learning, relationship-state and fail-closed checks.

After merging the append-only ledgers, the queue reports **282 searched item
records** (**125 linked**, **72 review-required**, **9,812 pending**) and **68
searched relationship records** (**59 review-required**, **2,246 pending**).
The full catalogue relationship total remains **2,305 unresolved**. The
deduplicated search manifest shows **10,006 typed item groups** from **10,009
queue identities**, so larger parallel batches can be used safely without
duplicating most web searches. All three agents were closed after verification;
47 local audit tests pass. SQL, browser proof and live deployment remain
deferred.

## 2026-09-21 short-cycle tranche 011 checkpoint

The next checkpoint-first cycle completed all three assignments. Item tranche
011 searched **16** non-overlapping rows; **14 linked** and **2
review-required**. Relationship tranche 011 searched **4** rows; **0
promoted** and **4 review-required**, with no inferred endpoints or typed
edges. The downstream/admin slice audited **20 non-overlapping programmes**
covering **76 domains, 189 subgroups and 3,622 roles**; all programme gates and
the six static student/admin boundary checks passed. Student approval remains
false because review-required, unresolved and admin-pending states remain.

After merging the append-only ledgers, the queue reports **314 searched item
records** (**139 linked**, **76 review-required**, **9,794 pending**) and **76
searched relationship records** (**63 review-required**, **2,242 pending**).
The full catalogue relationship total remains **2,305 unresolved**. The local
audit suite remains green at **47 tests**; all three tranche-011 agents were
closed after artifact verification. SQL, browser proof and live deployment
remain deferred.

## 2026-09-21 relationship tranche 010 checkpoint

The relationship agent completed the next checkpoint-first batch of **4
unresolved rows**. All **4 remain `review_required`** after checking O*NET and
official Ansible, Jira, Bash and Docker documentation; no missing endpoint or
typed edge was inferred.

The merged queue now records **298 searched item records** (**127 linked**, **72
review-required**, **9,810 pending**) and **72 searched relationship records**
(**63 review-required**, **2,242 pending**). The full relationship backlog
remains **2,305 unresolved**. The local audit suite remains green at **47
tests**; the relationship agent was closed after verification. SQL, browser
proof and live deployment remain deferred.

## 2026-09-21 short-cycle tranche 010 checkpoint

The checkpoint-first cycle completed an item tranche of **16 contextual rows**
covering **10 deduplicated item names**: **14 linked**, **2 review-required**,
and zero unavailable. It also completed a read-only downstream/admin slice of
**20 non-overlapping programmes** covering **92 domains, 224 subgroups and
2,510 roles**. All curriculum, ownership, provenance, category, language,
bounded-role-learning, resource/relationship state and fail-closed gates passed
for the slice; student approval remains false because review, unresolved and
admin-pending states remain.

After queue regeneration, the current ledger totals are **298 searched item
records** (**127 linked**, **72 review-required**, **9,810 pending**) and **68
searched relationship records** (**59 review-required**, **2,246 pending**).
The catalogue relationship total remains **2,305 unresolved**. The item and
downstream agents were closed after verification. The relationship agent's
tranche-010 search had not yet produced a report at this checkpoint and remains
active; no relationship result was assumed or promoted. The deduplicated search
manifest and 47-test local audit suite remain green.

## 2026-09-21 external item-evidence checkpoint: tranche 010

The next stable-row, non-overlapping item batch after tranche 009 selected and
searched **16 contextual identities** outside D078. The append-only ledger
contains **14 linked** records and **2 `review_required`** records. The latter
is the combined engineering safety-and-reliability competency: NASA evidence
supports its safety and reliability components, but does not establish the
exact combined catalogue item as one source-backed destination.

Selection/ledger parity is **16/16**, with zero duplicate IDs, zero overlap,
zero D078 rows and zero missing required evidence fields. Each row retains an
authoritative HTTPS URL, authority, locator, evidence summary and access date.
No relationship rows were searched or promoted. The queue was regenerated and
now records **298 searched item rows** (**127 linked**, **72 review-required**)
and **68 searched relationship rows**; the canonical 2,305 unresolved
relationships remain unchanged. No catalogue, generated seed transport, SQL,
UI, app code or browser-proof file was changed. Browser proof, live-payload
verification and manual SQL remain deferred.

## 2026-09-21 short-cycle tranche 012 checkpoint

The checkpoint-first cycle completed all three assignments. Item tranche 012
searched **16** new non-D078 contextual identities: **12 linked with
authoritative item-specific evidence**, **4 `review_required`**, and zero
unavailable. Relationship tranche 012 searched **4** unresolved rows; all **4
remain `review_required`**, with no inferred endpoints or relationship types.
The downstream/admin slice audited **20 non-overlapping programmes** covering
**81 domains, 221 subgroups and 3,290 roles**; all programme gates, six static
student/admin boundary checks, and role-learning caps passed.

After merging the append-only ledgers, the queue contains **330 searched item
records** and **80 searched relationship records**. Across the 10,009 unique
item identities, the current states are **149 linked**, **80 review-required**,
and **9,780 pending**. The relationship queue has **67 review-required** and
**2,238 pending** rows. The catalogue still has **405,858 source-backed** and
**2,305 not-established** relationships. The deduplicated manifest contains
**10,006 typed item groups**, preserving all programme/JAMB contexts while
avoiding repeated searches for the same typed item.

All tranche-012 artifacts were checkpointed before search, validated for
ledger parity and HTTPS evidence, and the full local audit suite remains green
at **47 tests**. No catalogue, generated seed, SQL, UI, app or browser-proof
artifact was changed. SQL, browser proof, live-payload verification and final
student approval remain deferred.

## 2026-09-21 short-cycle tranche 013 and downstream slice 006 checkpoint

The next checkpoint-first item tranche searched **16** non-D078 contextual
identities, representing **13 deduplicated item names**. **3** received exact
authoritative item-specific links and **13** remain `review_required`; none
were marked unavailable. The relationship tranche searched **4** additional
non-overlapping unresolved rows; all **4 remain `review_required`** after
checking O*NET plus first-party AWS, Microsoft, Docker and Git documentation.
No endpoint or typed edge was inferred.

The merged queue now records **346 searched item rows** and **84 searched
relationship rows**. Current item states are **152 linked**, **90
review-required**, and **9,767 pending** across **10,009** unique identities.
The relationship backlog remains **67 review-required** and **2,238 pending**
within the canonical **2,305 unresolved** rows. The deduplicated search
manifest reports **10,006 typed item groups** and **9,767 groups searchable
now**.

Read-only downstream/admin slice 006 covered **20 non-overlapping programmes**,
with **113 domain routes, 288 subgroup routes and 4,762 role routes**. Its
programme, student/admin boundary, provenance, category, bounded-role-learning
and fail-closed checks passed. It correctly leaves resource review, unresolved
relationships, full admin rendering, browser proof and live SQL open; it does
not authorize student exposure.

The complete local audit suite remains green at **47 tests**. All evidence was
saved in tranche/slice checkpoints before completion, with no catalogue, seed,
SQL, UI, app or browser-proof mutation. A subsequent slice-007 agent was
started from its existing checkpoint; if the account limit interrupts it, its
partial checkpoint must not be treated as an audit result.

## 2026-09-21 downstream/admin slice 007 checkpoint and static-contract repair

Slice 007 completed a read-only audit of **20 additional non-overlapping
programmes**, covering **73 domains, 197 subgroups and 3,948 roles**. Curriculum
evidence, source ownership/URLs, student/admin language, thematic category
boundaries, bounded role-learning, explicit review states and student fail-closed
handling passed for the slice.

The audit exposed and the local implementation now fixes one static-contract
gap: `ToolGroupsBlock` already rendered the canonical singular `alternative`
edge as the student-facing “Alternatives” group, but the full downstream audit
could not discover the plural UI-group marker. An explicit label constant was
added without changing stored relationship semantics, and the full
237-programme static relationship-grouping gate now passes.

The slice still correctly remains unapproved for student exposure: all 20
resource reviews, 1,430 unresolved/not-established relationships, and 20 admin
render acceptances remain open; 119 role work-profile identities remain
review-only. Browser proof and live SQL remain deferred by instruction. The
slice audit and the full local audit suite remain available for rerun after any
further enrichment merge.

## 2026-09-21 tranche 014 checkpoint

The next item lane selected **16** disjoint non-D078 identities (**6 unique
names**) and saved its pre-search checkpoint, but the delegated account limit
interrupted it before any external search. Its empty ledger is intentionally
not counted as searched evidence; those 16 rows remain pending.

The relationship lane completed **4** additional disjoint unresolved rows for
`D001|Information Technology Project Managers`. All **4 remain
`review_required`** after O*NET and first-party AWS, Atlassian and Microsoft
documentation checks; 12 HTTPS evidence URLs were retained, and no endpoint or
typed relationship was inferred.

After the append-only merge, the queue records **346 searched item rows** and
**88 searched relationship rows**. Item states are **152 linked**, **90
review-required**, and **9,767 pending**. Relationship states are **71
review-required** and **2,234 pending** within the unchanged **2,305
unresolved** catalogue rows. The search-group manifest remains **10,006 typed
item groups**, with **9,767 groups searchable now**.

The local audit suite remains green at **47 tests**. No catalogue, seed, SQL,
app, UI or browser-proof artifact was changed. SQL, browser proof, full admin
render acceptance and final student approval remain deferred.

## 2026-09-21 tranche 014 completion and source-only push checkpoint

Because delegated external-search agents repeatedly hit the account usage
limit, tranche 014 was completed locally from its saved deterministic
checkpoint. All **16 selected item identities** across D034-D036 received
append-only evidence rows for **6 unique procurement names**. OECD and UNOPS
authoritative sources were used; all 16 decisions are `linked`, with no
relationship endpoint or domain/role requirement inferred.

The merged queue now records **158 linked**, **90 review-required** and
**9,761 pending** item identities. Relationship coverage remains **71
review-required** and **2,234 pending** within the unchanged **2,305
unresolved** rows. The tranche report, completed markdown checkpoint and
ledger are saved under `data/career-mapping/_audit/external_enrichment_agent/`.

The source-only application push is complete at remote `very-new` commit
`644620a`. Its diff intentionally excludes JSON, SQL, gzip, audit and handoff
files. The newly updated enrichment queue, ledger, report and this handoff
remain local and unpushed for the protected-data review.

The local gates remain green: **47 audit tests**, full 237-programme
downstream/admin audit, admin guidance smoke, Sociology report smoke and
TypeScript check. Scaling approval remains closed because enrichment,
resources/relationship review, full admin render acceptance, browser proof and
live SQL are still deferred/open.

## 2026-09-21 slice 009 and three-agent scaling continuation

The downstream/admin audit agent completed the next **20 non-overlapping
programmes**, covering **110 domains, 242 subgroups and 3,586 roles**. The
Sociology-derived checks passed: curriculum evidence, ownership and source
URLs, student/admin language separation, thematic category boundaries,
role-level learnable-skill caps, relationship grouping, fail-closed review
states and admin provenance queues. Open gates are **20/20 resource reviews**,
**20/20 relationship reviews** with **3,154 unresolved/not-established rows**,
**20/20 admin render acceptances**, plus deferred browser proof and live SQL.

Three agents are now active in disjoint lanes: item external enrichment,
relationship external enrichment, and role work-profile/certification/resource
evidence. All three must read the handoff and mockup/spec documents before
acting, save checkpoints and retain HTTPS source URLs/locators. A local fix
also normalizes historical relationship ledger aliases (`missing`,
`unresolved`, and `review_only`) to the current `not_established` identity so
future tranches cannot duplicate earlier searches.

SQL, generated seed transport, browser proof and live deployment remain
explicitly deferred until the end of scaling. No scaling approval is claimed
from the slice result alone.

## 2026-09-21 tranche 015 continuation

Item tranche 015 completed from a pre-search checkpoint with **16 selected
and 16 searched non-D078 identities**, representing **10 unique item names**.
The ledger records **14 linked**, **2 review_required** and **0 genuinely
unavailable** decisions. The two review-required rows are repeated
`apply Nigerian law` competency identities whose official Nigerian sources
support the legal-training context but do not name the exact catalogue
competency. Selection/ledger parity, HTTPS evidence, zero overlap and the
47-test audit suite passed; relationships, SQL, seeds, UI and browser proof
were untouched.

The current queue is **167 linked**, **91 review-required** and **9,751
pending** item identities. Relationship coverage is **71 review-required** and
**2,234 pending** within the unchanged **2,305 unresolved** rows.

After closing the completed slice-009 agent, three disjoint agents were
redeployed for the next downstream/admin slice, the next item-enrichment
tranche and the next relationship-enrichment tranche. SQL, generated
transport, browser proof and live deployment remain end-of-scaling gates.

## 2026-09-21 continuous item and relationship lanes

The item lane completed tranche 016 as an append-only checkpoint: **100/100
rows searched**, representing **94 unique typed items**, with **43 linked**,
**57 review_required**, **0 unavailable**, and **0 D078** rows. The merged item
queue is now **210 linked**, **142 review_required** and **9,657 pending**.

The relationship lane completed the entire remaining **2,305-row** unresolved
non-D078 backlog in **22 saved batches** (21x100 plus a 72-row remainder).
All rows remain `review_required`/`not_established` with null endpoints preserved;
no unsupported edge was promoted. The merged relationship queue now records
**2,305/2,305 searched** and **0 pending**. Each batch has a selection,
pre-search checkpoint, ledger and report. The three item agents continue in
disjoint 100-row item lanes, saving after each batch and immediately claiming
the next pending rows.

The next three item tranches also completed with saved ledgers and reports:
tranche 017 searched **100/100** rows (**23 linked**, **77 review_required**),
tranche 018 searched **100/100** (**44 linked**, **56 review_required**), and
tranche 019 searched **100/100** (**36 linked**, **64 review_required**). All
excluded D078, preserved HTTPS evidence, and touched no relationships, SQL,
seeds, UI or browser proof. The item-selection template now serializes shared
claims with a lock so concurrent item lanes cannot claim the same row at the
same time.

After those checkpoints, the merged queue reports **309 linked**,
**400 review_required** and **9,300 pending** unique item identities. The
relationship queue remains **2,305/2,305 searched**, all
`review_required`/`not_established` with no promoted unsupported edge. The full
237-programme downstream/admin audit still covers **237/237** routes with
scaling approval correctly closed. The audit suite remains **47 passed**.

## 2026-09-22 continuous item-lane continuation

The item-only lane resumed from tranche 065 and completed tranches **066–071**
as disjoint 100-row batches. Each tranche saved its selection, pre-search
checkpoint, append-only ledger and report before advancing. The six tranches
added **600 searched contextual item rows** and **491 unique typed-item
searches** in total; all selected rows excluded D078 and remain
`review_required` where the evidence was not exact. No relationship ledger,
catalogue, seed transport, SQL, UI or browser-proof file was touched.

After queue reconciliation, the item queue reports **344 linked**,
**4,476 review_required** and **5,189 pending** unique item identities out of
10,009. This continuation preserves the source URLs, locators and access dates
for each saved row; SQL, browser proof and remaining downstream/admin work
remain deferred.

The lane then completed tranches **072–073**, adding another **200 searched
contextual rows** (**187 unique typed items**), again with zero D078 rows and
zero relationship, SQL, seed, UI or browser-proof changes. The queue above is
reconciled through tranche 073.

The lane then recovered a concurrent tranche-075 selection overwrite by
preserving its **56** already-written valid ledger rows and processing the final
100-row claim as recovery tranche **075b**. Tranches **076–078** then completed
normally: **400 additional rows** searched, all `review_required`, with no D078
or relationship rows. The reconciled item queue is now **344 linked**,
**5,164 review_required** and **4,501 pending** unique identities. SQL, seeds,
UI and browser proof remain untouched.

## 2026-09-22 item queue closure

The local item-enrichment queue is now fully searched: **10,009/10,009**
unique item identities, with **344 linked_external_verified**, **9,665
review_required_external_search**, and **0 pending_external_search**. The
remaining stale selection-only claims were recovered in uniquely named,
lock-protected batches. The final D078 remainder was processed separately as
`recovery_20260922_d078_final6`: **6/6** rows searched, all retained
`review_required`.

The final report verifies selection/ledger parity (**6/6**), zero missing
rows, zero duplicates, zero prior-ledger overlap, valid HTTPS evidence and
zero relationship rows. Relationships, SQL, seeds, UI, browser proof,
catalogue promotion and prior ledgers were untouched.

## 2026-09-23 corrected JAMB scope and downstream checkpoint

The corrected JAMB resource lane now uses the actual student-facing population:
**420 canonical JAMB identities**, with **237 CCMAS packages** treated as
supporting curriculum evidence only. The append-only `corrected_004` ledger
contains **420/420 unique identities**, **420 available resource packages**,
**0 review-required resource packages**, and **0 genuinely unavailable
packages**. All **11** CCMAS-anchor-absent occurrences are retained as
available when external learning evidence exists; missing CCMAS is not an
unavailable decision. Four case-distinct source-name key collisions were
repaired with stable identity-qualified subject IDs, and broad unavailable
foundation endpoints were replaced with item-specific open-textbook sources.

The downstream route audit now distinguishes **154 CCMAS packages represented
by a JAMB identity** from **83 CCMAS-only supporting packages** without a JAMB
identity/offering. The 83 remain explicit admin findings and do not block the
420-identity JAMB route. The student-facing reachability gate passes locally;
student exposure, browser proof and live payload proof remain unapproved.

The role-profile continuation audited tranche 008: all **119** missing work
profiles remain explicitly absent/review-only, with no invented O*NET/ESCO
profile rows and three focused tests passing. The active agent pool is capped
at three lanes: downstream/admin reconciliation, item enrichment and
relationship enrichment. Every lane must preserve append-only checkpoints;
relationships remain internal non-blocking coverage, and SQL/seed generation
and browser proof stay at the end of scaling.

### 2026-09-23 bounded enrichment continuation

The next item lane checkpoint searched **100 distinct item identities** with
selection/ledger parity, HTTPS URL/locator/access-date validation and **0
promotions**; all remain `review_required`. The relationship lane searched the
next **100 unresolved candidates**, retained evidence for **100/100**, promoted
**0**, and preserved all as `review_required`/`not_established` because typed
endpoints or edge semantics were not established. Neither lane changed the
catalogue, SQL, seed transport, UI, live database or browser proof.

## 2026-09-23 SQL execution documentation-order checkpoint

This documentation-only checkpoint audited the handoff, `CLAUDE.md`,
`AGENTS.md`, `backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`,
`backend/MIGRATION_RUNBOOK.md`, and the Sociology/product mockup
specifications. The current execution rule is now explicit and consistent:

1. complete local subject/JAMB audits;
2. complete and inspect the corrected all-420 JAMB resource/downstream checks;
3. complete local scaling and browser-proof gates; and
4. only then enter the manual SQL phase, using the documented dependency order.

The SQL phase is documented as: canonical base/schema prerequisites and seeds,
programme/domain evidence migration plus seed, contextual schema and
relationship schema, Sociology and generic curriculum migrations/seeds,
programme-reading/ownership/orientation/tool-path/all-programmes/global
migrations, then the 35 compressed contextual seed parts in numeric order.
The contextual relationship schema precedes those parts. The destructive
`migration_career_v2.sql` is explicitly staging-only and is excluded from the
additive Sociology path. Manual-only SQL constraints remain in force.

Current local status: the corrected resource ledger covers **420/420 JAMB
identities**, including **11 anchor-absent** occurrences, with **420 available**
and **0 review-required or genuinely unavailable resource packages**. The
all-programme downstream route audit covers the **420-JAMB/237-CCMAS** boundary
locally; the 83 CCMAS-only packages remain supporting/admin findings. Role
work-profile coverage still has **119 absent canonical profiles** after tranche
009. Items and relationships remain closed as student-facing gates: item search
is **10,009/10,009**, and the **2,305** unresolved relationships are searched,
retained as internal `not_established`/review-only coverage, and have no
unsupported promoted edge.

The earlier three-lane agent statement is historical. The item and relationship
lanes were stopped after the bounded audit; this documentation-only pass did
not redeploy them. The role-profile tranche 009 result is recorded above as
local evidence and remains review-only where a canonical profile is absent.

No SQL was applied, no implementation or item/relationship ledger was changed
by this checkpoint, and no live deployment claim is made. The corrected order
was text/order-validated after the documentation patches.

## 2026-09-23 role-profile blocker classification correction

The 119 canonical roles without complete work-profile rows are no longer a
scaling blocker. The missing-profile queue was fully audited against the
available authoritative identity/profile extracts; none met the promotion
criteria, so no profile was invented or promoted. They remain explicitly
absent/review-only and must stay out of student guidance until stronger
criteria-satisfying evidence appears. This is a closed evidence decision, not
an unfinished scaling lane.

The 83 CCMAS-only findings are a different kind of state: they are supporting
CCMAS curriculum packages that have no matching canonical JAMB identity or
university offering. They remain visible to staff as supporting evidence, but
they cannot reduce or invalidate the 420 JAMB student lookup population.

## 2026-09-23 current three-lane scaling checkpoint

Three fresh agents were deployed with disjoint scopes and then closed after
their artifacts were reviewed. The JAMB resource lane completed the corrected
all-420 transport: **420/420 unique names**, **11 anchor-absent identities**,
**1,273 source rows**, zero missing URL/locator fields, zero invalid URLs or
access dates, zero canonical-name mismatches, and **1,273 unique SQL tuples**.
The regenerated transport classifies **844 Nigerian** and **429 global** source
rows. Five OpenLearn endpoints returned 403 during reachability probing; those
records remain available with an access-verification caveat and were not
falsely marked unavailable.

The downstream/admin lane reports **420/420 JAMB identities**, **237/237 CCMAS
packages**, and zero broken domain/subgroup/role routes. The strict local admin
boundary has zero accepted rows and **529,540 internal/review rows**; source
presence alone does not promote a row into the dashboard-approved set. The 83
CCMAS-only packages, 86 mapping-review identities, 2,305 not-established
relationships, and review-only role profiles remain intentionally internal and
are not scaling blockers under the agreed policy.

The browser lane confirmed the shell render and local route/admin contract
smokes, but genuine browser proof remains open: the isolated guest session
redirected all four student deep links and both admin links to login, so the
accepted count is **0/4 student** and **0/2 admin** routes. The CUA surface
reported no available browser/app surface. No live SQL or Supabase payload
proof is claimed.

The identity-specific JAMB resource migration and seed are now generated and
documented in `AGENTS.md`, `CLAUDE.md`, `backend/MIGRATION_RUNBOOK.md`, and
this runbook. The student API reads that table only for rows explicitly marked
`approved_guidance_v1`, `available`, and `resource_available`; missing or
review-only tables/rows fail closed. Focused visibility tests pass (**3/3**).
The generated SQL remains unapplied pending the final browser/live gate and
the user's manual SQL deployment step.
