# Onboarding to Discovery Unblock Plan

Status: active controlling scope
Date: 2026-08-14

## Product rules

- First signed-out visit: root page -> intro carousel -> auth landing -> login/signup/guest.
- Explicit logout from Settings: next website open goes to login/signup, not the intro carousel and not onboarding.
- Guest: creates a backend guest session and lands in Explore preview. Guest never enters onboarding.
- Signed-in user with incomplete onboarding: goes to the actual onboarding flow, resumed at the last saved onboarding step when possible.
- Browser/device back during incomplete onboarding: warn before leaving. The user can continue onboarding, continue later by signing out, or delete the newly created account.
- Signed-in user with completed onboarding: lands on the correct product surface for their role and journey state.
- Lesson/track resume is not the default post-auth return path. Learning routes live behind My World. Home should resume onboarding, admission selection, programme mapping, or the normal Home state.
- SkillUp learning is a My World-only product area for now. Career Intelligence,
  admission, onboarding, Explore, admin guidance, programme/domain/role detail,
  and student reports must not show `Close the gap`, `Ready to learn`, lesson,
  track, bridge-learning, or other CTAs that send users into SkillUp learning.
  Skill/tool/certification guidance may explain what matters, but it must remain
  informational until the user intentionally enters My World.
- Legacy learning, community, feed, diary, portfolio, and track URLs are also
  My World-gated. Direct, stale, or browser-restored entries redirect to My
  World (or sign-in when there is no session). Links opened from My World carry
  an explicit origin marker so nested learning navigation remains available
  without making those routes globally discoverable.
- Browser close/reopen is not logout. If the session is still valid, the app resumes from the current URL or the correct Home/resume surface. Only explicit logout sets the login redirect.
- Single-device enforcement is required: two devices cannot actively use the same account at the same time.
- PDFs generated for student-facing output must be watermarked with `Sifter LevelUp` and the student's school name when available from self-onboarding or admin-created/provisioned student records.
- Educator guidance must include student account creation/provisioning, but educators also need a way to skip that workflow and open other admin surfaces or the catalogue.
- Admission guidance must keep O-level and UTME separate:
  - O-level/WAEC/NECO subjects qualify the actual programme requirement;
  - UTME/JAMB subjects gate the JAMB application route;
  - a programme should not be presented as eligible unless both available layers are satisfied or clearly marked for review.

## Updated staged scope

This is the controlling scope for the onboarding/discovery unblock. Do not jump into broad visual redesign before the flow is stable and source-backed.

### 1. Finish onboarding first

- Account type gate current focus:
  - SS1/SS2 secondary student;
  - SS3/JAMB candidate;
  - undergraduate/current student;
  - educator/institution.
- Hide graduate from the normal account-type gate for now. Any later expert-review
  path is a separate product decision, not a graduate admission path.
- Hide artisan, skilled worker, professional, and career changer from normal onboarding for now.
- If a professional-style path appears later, frame it as expert review, not a normal student onboarding type.
- SS1/SS2 must capture class, school, stream, and O-level subjects for early advisory.
- SS3 must capture school, stream, O-level subjects, and UTME subjects when the student discovers from subjects.
- JAMB candidates must capture tutorial centre or self-taught status, stream, O-level subjects, and UTME subjects when the student discovers from subjects.
- Subject matching must require enough selected subjects to be meaningful.
- Choice switching must clear stale answers from the old branch while preserving common eligibility data such as O-level subjects when the new branch still needs it.
- All `Start onboarding`, `Continue onboarding`, and `Resume onboarding` entry points must route to the account-type gate or last saved onboarding checkpoint, not a loading/logo screen or Explore.
- Guest mode must never enter onboarding. Guest CTAs should say `Create account` and route to signup/auth, not Explore.
- Sign-out must ask for confirmation before ending the session.

### 2. Then admission/discovery flow

- Replace the three separate Admission Intelligence tabs with one guided discovery surface.
- Support these guided variants:
  - user knows programme and university;
  - user knows programme, not university;
  - user knows subjects, not programme;
  - undergraduate knows university, then picks programme from that university's own offering names.
- Programme variants should display as school-specific offerings, not bundled aliases.
- SS1/SS2 should use O-level subjects for early programme advisory, then preview UTME requirements as the next gate, especially for SS2.
- SS3/JAMB should use combined UTME + O-level matching where both are available.
- The sequence remains:
  - subjects/programme/university discovery;
  - programme plus university confirmation;
  - programme-to-domain mapping;
  - domains;
  - sub-groups;
  - career roles;
  - skills, tools, certifications, opportunities.

### 3. Then model-first redesign audit

- Before redesigning detail pages, map the actual codebase hierarchy and data relationships.
- The expected product model is:
  - Programme / school offering;
  - direct, functional, and adjacent domain mappings;
  - domain;
  - sub-group;
  - career role.
- Each level may have its own data and must not be flattened:
  - domain skills, tools, certifications;
  - sub-group skills, tools, certifications;
  - role skills, tools, certifications;
  - technical skills and transferable skills where the data distinguishes them.
- The codebase and source data are the source of truth for hierarchy, labels, filters, mappings, skills, tools, certifications, and admission data.
- Mockups are visual and interaction references only. They must not invent, rename, merge, or substitute the actual product model.
- Search the existing docs/code for how `what the school teaches` is meant to be used before redesigning programme detail.

### 4. Then cleanup/hide incomplete product surfaces

- Remove `Close the gap` from student-facing surfaces until ready.
- Hide every learning CTA outside My World, including `Ready to close the gap`,
  `Continue Learning`, lesson/track prompts, and links to SkillUp learning
  routes. Preserve those surfaces only inside My World and its nested learning
  routes.
- Remove demand and in-demand language from student-facing surfaces until data and wording are ready.
- Remove elite/pathways from Home until consolidated according to the relevant pathway docs.
- Remove streak from Career Intelligence and Settings; learning streak belongs behind My World.
- Hide unavailable notification toggles.
- Remove `being populated`, raw parse-state language, and developer-facing copy from student/educator UI.
- Replace terse data dumps with guidance copy that explains what matters, what to do next, and what is unavailable.

### 5. Then test scenario generation

- Generate 100 manual test flows per relevant user type and variation.
- Separate sets for science, commercial, and art.
- Include:
  - subjects;
  - programmes;
  - universities;
  - requirements;
  - domains;
  - sub-groups;
  - roles;
  - skills/tools/certifications where available.
- Test flows must come from source-backed WAEC/JAMB/codebase data, not hand-invented examples.

### 6. Later platform mockup phase

- After onboarding/discovery is stable, scope the whole platform and generate structured mockups/wireframes for each user experience.
- Mockups should improve visual quality, interaction design, hierarchy, density, filters, cards, typography, and responsive behavior.
- Implementation should wait for product-owner refinement of those mockups.

### 7. Computational and quantitative evidence audit

- Computational content must distinguish source classifications from learner
  competence. ESCO-backed `social network analysis` and `game theory` are
  stored as method knowledge, with `competence_status = not_demonstrated`.
- Python and named libraries such as pandas, NumPy, scikit-learn, PyTorch and
  TensorFlow are tools used by supported roles where O*NET evidence names
  them. A tool association must never be rendered as proof of proficiency.
- `agent-based modelling` and `causal inference` remain explicit `not_mapped`
  items until an exact checked-in source mapping is verified. CASEVO appears
  only as an optional grant-proposal framework in the SkillUp Starknet learning
  curriculum, so it is recorded as `learning_content_only`, not as a Career
  Intelligence competency. The system must not fill these gaps with guessed
  role or skill data.
- The generated method evidence and computational subgroup links must be
  seeded and exposed as optional API enrichment. Older databases should still
  render the core domain/role response until the additive migration is run.

## Unified guidance-to-report scope

This is an update to the original goal, not a separate visual project. Every
route from onboarding through discovery, guidance, mapping, and report printing
must be treated as one product journey. Core data and state behaviour is fixed
first; the affected surface is then redesigned with a surface-specific mockup
before implementation is widened to related screens.

### Product operating rule

The product should behave like a guidance system, not a catalogue or a debug
panel. Every step must answer three questions for the user:

1. What decision am I making now?
2. Why does this information matter?
3. What is the next useful action?

The selected user type, class, stream, institution, programme, university, and
choice path control what appears next. Switching a choice clears dependent
answers and results. Returning to a saved account restores the last valid
checkpoint, not a generic onboarding screen, legacy route, or learning screen.

### Account-type gate behaviour

- The account-type gate is the first product decision after authentication. It
  must be a single guided selection, not a side-by-side grid of every persona.
- The first screen uses one `I am joining as` selector. Opening it presents the
  supported choices in a readable option sheet with the title, plain-language
  purpose, and the guidance the choice unlocks.
- Selecting an option previews the path but does not enter it until the user
  presses `Continue`. This prevents an accidental tap from committing the wrong
  student or admin flow.
- After `Continue`, the selected type is locked into the flow. The following
  screens may change dependent choices such as class, stream, subjects,
  programme, or university, but they must not show a generic user-type switch.
- `Back to user selection` is an explicit correction action. It clears the
  selected path's dependent draft before the user chooses again; it is not a
  silent type switch and it must not route to a legacy page.
- The gate currently exposes SS1 Student, SS2 Student, SS3 Student, JAMB
  Candidate, Undergraduate Student, and Educator / Institution. Hidden types
  must not appear as disabled or placeholder options.
- The selected type controls the next form, required institution, exam layer,
  copy, and available discovery doors. The selection itself is never inferred
  from a default student value.

### Product and behaviour decisions by user type

- SS1 and SS2:
  - school is compulsory;
  - class is selected at the account-type gate and is locked inside the flow;
  - stream appears after school and before subject guidance;
  - subject-help uses O-level subjects and can show future UTME requirements as
    preparation, but does not ask for UTME subjects as an SS1/SS2 prerequisite;
  - programme-in-mind searches the programme first, then shows school-specific
    names, universities, and requirements.
- SS3:
  - school is compulsory;
  - the student chooses the discovery door before stream and subjects;
  - known programme/university shows requirements without forcing subject entry;
  - subject checking is optional for known choices and required only when the
    student asks for subject matching;
  - subject-first matching uses both O-level and UTME gates.
- JAMB candidate:
  - tutorial centre or self-taught status is compulsory;
  - the same three discovery doors apply;
  - known programme paths show requirements first;
  - subject-first matching requires the complete UTME combination and enough
    O-level subjects to check the actual programme requirement.
- Undergraduate/current university student:
  - show universities only in the current scope;
  - no year selector and no polytechnic or non-university institution path;
  - select the university first, then the programme names that university uses;
  - proceed to programme-to-domain mapping rather than admission onboarding.
- Educator, school owner, tutorial centre, and JAMB cafe:
  - their primary job is to guide a learner, not to use a student-shaped Home;
  - they can create or provision one student account at a time, upload a class
    list as a document or image, or skip provisioning to use other admin tools;
  - guidance must accept the learner's class, stream, institution, programme,
    university, and subject state and use the same matching rules as students;
  - the current learner context must be visible and switching learner must clear
    the previous learner's unsaved data.
- University admin:
  - use a university workspace and university peer comparison;
  - do not show school-owner, tutorial-centre, student, national aggregate,
    national competitiveness, or Post-UTME surfaces unless explicitly enabled
    by a later product decision.

### Surface decisions for the discovery-to-mapping journey

- Domain clusters are navigation and grouping, not demand rankings. They use a
  responsive grid of named cluster tiles; remove in-demand labels and fake
  counts until backed by real data.
- A domain card is a concise summary: name, plain-language purpose, actual
  relationship type, and the next action. It is not a container for every skill,
  role, and metadata field.
- Domain detail has a readable overview first, followed by explicit sections for
  sub-groups, roles, skills, tools, certifications, programmes, and mappings.
  Sections must be independently reachable instead of forcing a long raw list.
- A sub-group card explains the activity/category it represents and exposes its
  own skills, tools, certifications, and career roles. It must not inherit or
  flatten the entire parent domain payload.
- A role card identifies the career role and its parent sub-group/domain, then
  exposes role-specific skills, tools, certifications, and the next action.
  `Role` means a career role, not an organisation permission or temporary task.
- Skills, tools, and certifications are shown at the level where the data owns
  them. Present primary items first and supplementary items separately when the
  source data provides priority. If priority is not source-backed, say what the
  item is used for instead of inventing a ranking.
- Role details must include role-owned tools and certifications when those
  records exist. Role essential/optional skills, role tools, subgroup tools,
  and domain tools are separate data layers; one layer must never be relabelled
  as another. Role tools use `backend/migration_role_tools.sql`; role
  certifications use `backend/migration_role_detail_enrichment.sql`.
- Current seed audit: role essential/optional competencies are present in
  `domain_roles`, and regenerated career seed data emits source-backed role
  tool rows through `domain_tools` with `scope = role`. Role certification rows
  remain absent where a recognized issuer is not verified. The application must
  show each section only when source-backed rows exist; it must not inherit
  domain or subgroup data to fill a gap.
- `What the school teaches` belongs to the selected programme and must explain
  the actual programme learning outcomes in student language. It must not be
  presented as a promise that the university teaches a skill unless the source
  data supports that claim.
- Empty, locked, loading, unavailable, and error states must tell the user what
  happened and what action is possible. Do not expose parser states, raw SQL/API
  language, or `being populated` text.

### Report and printing decision

- Bookmarking and printing are separate actions. A user does not need to
  bookmark before printing.
- A signed-in user can print the confirmed programme/university report and an
  individual domain, sub-group, or career-role report when that detail exists.
- A guest can preview the discovery content but sees `Create account` before
  saving or printing a report. Guest mode must not pretend that private details
  or report history were saved.
- A report contains the user's selected academic context, source-backed
  requirements, programme-to-domain relationships, and the relevant skills,
  tools, and certifications. It must not contain fake demand, Post-UTME, or
  unsupported match claims.
- Student-facing PDFs carry a visible `Sifter LevelUp` watermark and the
  student's school name when the student supplied one or was provisioned by an
  institution. Admin-generated reports follow the same watermark rule and must
  respect student consent/access rules.
- Print, bookmark, share, and return actions preserve the current route context;
  they must not send the user to Community, Forgot Password, a legacy SkillUp
  route, or a generic Home page.

The report is a full selected-path record, not a compact replacement for the
guidance flow. It includes the learner's selected academic context, subjects,
programme, university, requirements, and only the domains, sub-groups, and
roles the learner selected. Detail belonging to each selected entity remains
available in the report; grouping and page breaks control readability rather
than silently truncating the data. The surface contract is recorded in
`docs/mockups/GUIDANCE_REPORT_BEHAVIOUR.md`.

Selection is multi-valued at every intelligence level. A learner or educator
may select several domains, several sub-groups, and several career roles. Each
selected branch keeps its parent identifiers and source names. Domain,
sub-group, and role competencies/skills, tools, and certifications remain
separate ownership layers; selecting a role never causes the resolver to copy
the whole parent catalogue into the report. Admin-guided selections are saved
against the learner being guided, not against the administrator's session.

### Mockup gate before surface implementation

Before changing the UI of a surface, produce a small surface-specific mockup or
wireframe showing:

- current behaviour and the proposed behaviour;
- the data hierarchy and primary action;
- loading, empty, locked, error, and success states;
- mobile and desktop composition;
- the user type and route context for which it applies;
- the exact source-backed labels and content blocks;
- what changes when the user switches a choice or uses browser back.

The mockup is a design and behaviour proposal. It must not invent entities or
content from the reference images. The implementation follows only after the
product decision is recorded and the current surface's data contract is known.

### Unified implementation order

1. Stabilise account type, checkpoint, browser navigation, logout, and session
   isolation.
2. Stabilise the choice-driven onboarding and admission data contracts for each
   student type and the educator guidance context.
3. Audit and fix one shared discovery surface at a time, beginning with the
   admission handoff and programme detail because they affect every user type.
4. For each surface, make the product decision, produce the mockup, implement
   behaviour and visual hierarchy together, and verify all state transitions.
5. Continue through clusters, domain detail, sub-groups, roles, skills/tools/
   certifications, admin guidance, and report printing.
6. Generate the 100-flow-per-variation manual test sets from the real data after
   the mapping contracts are stable, then run targeted automated and manual
   checks before broad platform polish.

### Acceptance criteria for the unified goal

- A user who knows the programme and university can see requirements without
  entering subjects.
- A user who asks for matching cannot receive a programme recommendation from
  an incomplete or conflicting subject combination.
- The same rules work when an educator guides a student, with the learner's
  context visible and isolated.
- Every discovery detail preserves the actual programme/domain/sub-group/role
  hierarchy and explains what the user should do next.
- Every changed surface has a reviewed mockup/specification before its visual
  implementation.
- A confirmed path can be printed with the required watermark and school name,
  while guests are directed to account creation.
- Refresh, browser back/forward, logout, account switching, and deep links
  preserve intended context and never fall into legacy routes.

### Programme search, overview, and detail-section behaviour

- Admission search is a discovery surface, not a place to expose database
  naming layers. When a user searches `Nursing`, the result should explain the
  programme and show the university-specific names beside the universities that
  use them. It must not present `Nursing/Nursing Science` as if it were a user
  choice between two aliases.
- A CCMAS canonical name is mapping infrastructure. It may resolve domains and
  skills behind the scenes, but it must not replace the JAMB name in a student
  heading, result card, or selected-programme context. If no student-facing JAMB
  name can be resolved, show an honest unavailable state rather than a CCMAS
  fallback.
- The programme overview is the first detail state after a programme is opened.
  It is a readable summary and a deliberate navigation point, not a second
  search page. It answers what the programme is, what the university teaches,
  and what the student can do next. Requirements, schools/admission, and career
  mapping are separate destinations/sections with their own actions.
- Opening a programme from a known programme/university choice must preserve the
  selected university and open its requirements context directly. Opening from
  a programme-only or subject match must first show the available university
  offerings, then require the student to choose one before career mapping.
- Name variants are displayed as university offerings. Each offering keeps its
  university, exact programme name used by that university, requirements, and
  source context. A variant is never merged into the official JAMB name or
  displayed as a slash-delimited combined title.
- The remaining sections beside `Overview` are first-class detail destinations,
  not a generic cohort block. Programme detail uses `Requirements`,
  `Universities / schools`, and `Career mapping` where the source data supports
  them. Similar detail screens must expose their own relevant sibling sections
  rather than dumping every field below the overview.
- In admin guidance, learner scope is an independent concern. Educators see
  their own affiliated/provisioned learners where consent and access rules allow;
  universities see their own programmes and peer comparison; tutorial centres
  see their own guidance sessions. No admin type receives a national aggregate
  or another institution's private learner data by default.
- Changing learner, learner scope, institution, or comparison scope clears dependent
  filters/results and reloads the new scope. Browser back returns to the prior
  scope instead of resetting to Community, Forgot Password, or a legacy route.
- A cohort overview must expose the next useful action: open a learner, start a
  guidance session, review a programme/subject pattern, or export an allowed
  report. It must not pretend that a cohort-level insight is an individual
  student's recommendation.

## Mockup comparison and design direction

The supplied mockups are the visual-quality target, not the source of truth for product hierarchy or data.

### What the mockups do better than the current implementation

- They use a clear first-screen hierarchy: brand, page title, one primary action area, and only the fields needed for that step.
- Inputs, selects, chips, helper text, errors, and button states have consistent spacing and visual weight.
- The flow feels guided: each screen asks one decision at a time and uses the answer to reveal the next relevant choice.
- Cards are restrained and scannable instead of looking like raw developer/debug panels.
- Empty/locked states explain why the user cannot continue and what to do next.
- Search and filters are visible, predictable, and designed as controls, not just loose text inputs.
- Mobile and desktop layouts are related but not identical; desktop uses the extra width instead of stretching a mobile form across the page.

### Where the current implementation still falls short

- Onboarding screens are functionally branching, but visually they are still basic stacked forms.
- Some copy still explains implementation details instead of guiding the student.
- The SS1/SS2 form previously asked for subjects before asking what the student wanted help with; this is now being corrected.
- Admission Browse still feels like separate modes instead of one guided discovery surface.
- Programme detail and several deferred pathway surfaces still need the full visual pass.
- Domain, sub-group, and role detail now separate their own skills, tools, and certifications and explain the first-to-supplementary order; programme and deferred surfaces still need the same treatment.
- `What the school teaches` is not yet surfaced as a clear student-facing explanation in programme detail.
- Current UI still needs proper responsive composition, stronger type scale, cleaner cards, better select/search modals, and less raw metadata.

### Design rules to apply while building

- Build flow logic first, but every new screen/component should move toward the mockup quality rather than extending the current rough UI.
- Do not use the mockup example content as product truth.
- Use the codebase/source data for:
  - account types;
  - programme names and school-specific offerings;
  - subject requirements;
  - direct/functional/adjacent domain mappings;
  - domain, sub-group, and role hierarchy;
  - skills, tools, certifications, and `what the school teaches`.
- Use the mockups for:
  - spacing;
  - typography;
  - input states;
  - search/filter behavior;
  - chip and card polish;
  - guided progression;
  - desktop/mobile layout quality.
- Do not create fake demand, in-demand, market, skill-profile, or readiness sections just to match a mockup.
- If data exists but is incomplete, explain the limitation in user-facing language and avoid raw parser/status wording.

### Student-choice-driven UI rule

The user's selected type and answer path must decide what appears next.

- SS1/SS2:
  - show class, school/tutorial centre, stream, then the chosen guidance path;
  - if they want subject help, ask for UTME-facing subjects and explain that O-level requirements appear later;
  - if they have a programme in mind, search programme first, then show variants/universities/requirements;
  - do not show admin, graduate, professional, artisan, or My World learning setup.
- SS3/JAMB:
  - show the three admission doors: knows programme and university, knows programme only, or knows subjects;
  - require meaningful UTME subject selection before matching;
  - route to admission discovery until programme plus university is resolved.
- Undergraduate/current student:
  - start from university/institution, then show that school's own programme names;
  - route to programme-to-domain mapping, not generic admission onboarding.
- Educator/institution:
  - show organisation onboarding and guidance/admin setup;
  - allow skipping student provisioning to reach other admin surfaces;
  - keep admin access guarded.

Current implementation status: account-type and student setup branching exist; the current pass is making Admission Browse, programme/domain/role detail, and admin learner guidance preserve the selected context and present only source-backed choices. Broader Home and platform-wide visual cleanup remain later stages.

## Current blockers found

- Patched: `app/(auth)/_layout.tsx` no longer redirects away from the onboarding route it is already rendering.
- Patched: guest sessions skip onboarding and land in Explore.
- Patched: Home/Profile onboarding entry points send guests to signup, not account onboarding.
- Patched: explicit logout marks a local logout flag so the next root open goes to sign-in instead of intro/onboarding.
- Patched: local starting point, account type, educator profile, and onboarding draft state are user-scoped to avoid same-device account leakage.
- Patched: AccountTypeGate, OnboardingFlow, and EducatorOnboarding hydrate/save user-scoped onboarding drafts.
- Patched: onboarding back/exit guard offers continue onboarding, continue later, or delete account.
- Patched: admin layout blocks signed-out, incomplete, guest, and non-admin direct admin access.
- Patched: educator onboarding does not silently enter admin when backend verification/completion fails.
- Patched: post-auth routing no longer resumes lesson/track routes by default; learning stays behind My World.
- Patched: the SkillUp/lightning loading blocker has been removed from auth/onboarding routing.
- Patched: PDF HTML report output includes a `Sifter LevelUp` watermark plus school name when available.
- Patched schema: `backend/migration_auth_onboarding_security_patch.sql` adds durable auth email codes, onboarding drafts, admin MFA settings, and resume/checkpoint user columns.
- Patched: onboarding drafts now keep the fast local copy and synchronize the current user's checkpoint/profile to `onboarding_drafts` when authenticated, with server-first hydration when the remote copy is newer.
- Patched: production signup verification uses hashed, durable `auth_email_codes` rows plus the configured transactional email provider; local DEBUG keeps the Redis/dev-code path for development.
- Patched: admin email MFA now has request/verify/defer endpoints, durable state in `user_mfa_settings`, an MFA claim in the issued session token, and enforcement on guarded admin APIs after enablement.
- Still to apply in the live project: `migration_school_identity.sql` is not present in the currently inspected database, so address-backed school search and compulsory admin address remain unavailable until that migration is applied.
- Still to audit separately: bulk imported seed SQL contains source-data encoding artifacts. App/source files touched for onboarding are repaired; imported data should be cleaned from source imports or regenerated.
- Replaced: the earlier UTME-only picker assumption is no longer valid. Onboarding and Admission Browse now request `exam_type=olevel` for O-level planning and `exam_type=utme` for UTME gates.
- Patched: O-level and UTME subjects are now separate in onboarding, persistence, and Admission Browse handoff.
- Patched: subject-to-programme matching can run as `utme`, `olevel`, or `combined`; combined results distinguish UTME match, O-level gaps, and O-level review-needed states.
- Patched: SS1/SS2 onboarding uses O-level subjects; SS3/JAMB onboarding collects O-level subjects for every admission door and UTME subjects for subject-first discovery.
- Patched: educator provider sessions open the same Admission Browse guidance flow instead of a disabled stub.

## Implementation plan

1. Replace post-auth lesson/track resume with a discovery-safe route contract:
   - guests -> Explore;
   - incomplete users -> onboarding;
   - admins -> admin home;
   - explicit non-learning deep links may be honored;
   - default students -> Home.
2. Make local user state account-scoped:
   - key `startingPoint`, `educatorProfile`, and `accountType` by user id;
   - clear both current-user and legacy global keys on login/logout/delete;
   - pass `user.id` from screens/hooks.
3. Make onboarding resumable:
   - hydrate `AccountTypeGate` from `onboardingDraft`;
   - persist selected persona/mode;
   - persist student step/profile while editing;
   - persist educator step/profile/access status while editing;
   - clear the draft after successful completion or account deletion.
4. Update back/exit handling:
   - modal copy explains that browser back leaves onboarding;
   - `Continue onboarding` closes modal;
   - `Continue later` signs out and preserves server account + user-scoped draft;
   - `Delete account` calls account deletion and clears local user state.
5. Harden admin onboarding:
   - do not silently enter admin when `submitVerification` or `completeOnboarding` fails;
   - surface a concise error and keep the user on the confirm step;
   - use server-persisted `account_type` where possible, with local override as fallback only after successful server completion.
6. Add admin stack guard:
   - signed-out -> sign-in;
   - incomplete non-guest -> onboarding;
   - non-admin completed user -> student Home;
   - admin completed user -> admin stack.
7. Verification:
   - TypeScript check or lint if available;
   - targeted tests where existing tests cover auth/session/admin escalation;
   - run `npx expo start`/project start check and confirm whether the app boots;
   - manual route trace for first visit, explicit logout, browser close/reopen, incomplete student, incomplete admin, complete student, complete admin, guest.
8. Admission implementation audit:
   - compare implemented onboarding, Home, Explore, Programme Detail, admin Explore, and student-pipeline behavior against `docs/ADMISSION_PATH_IMPLEMENTATION_BRIEF.md`;
   - finish narrow blockers found in the admission-to-discovery route if they affect onboarding completion/resume.
9. PDF watermark audit:
   - find current PDF/export code;
   - add or document the required watermark path for Sifter LevelUp + school name.

## Supabase patch sequence

For an existing Supabase project, apply only migrations that have not already been applied. The patch order is:

1. `supabase-schema.sql` for the base `skillup_dev` schema and users table.
2. `backend/migration_auth_profile.sql` for first name, middle name, last name, and date of birth.
3. `backend/migration_v2.sql` for auth/session support, active device sessions, and legacy SkillUp/My World data.
4. `backend/migration_career_base_registry.sql`, then `backend/migration_career_v2.sql`, then `backend/migration_career_intelligence.sql` for programme/domain/role discovery foundations. Apply `backend/migration_role_tools.sql` after `migration_career_v2.sql` so role-owned tools use the canonical `domain_tools.role_id` layer.
5. `backend/migration_admission_intelligence.sql`, then `backend/migration_remove_postutme_from_cutoff_view.sql`, then `backend/migration_student_pipeline_live.sql` for Admission Intelligence and onboarding-to-discovery data.
6. `backend/seed_subject_catalog.sql`, `backend/seed_subject_options.sql`, `backend/seed_phase8_9_enrichment.sql`, and the admission importer/seed files already used by the project.
7. `backend/migration_role_detail_enrichment.sql` for role-owned certifications. Role-owned tools use `backend/migration_role_tools.sql`; seed only source-backed rows after both migrations are present.
8. `backend/migration_source_backed_career_layers.sql` for source confidence, data state, ESCO/O*NET identifiers, O*NET competencies, and tool provenance. Then apply the regenerated `backend/seed_career_v2.sql`.
9. `backend/migration_provisioning.sql` for institution-provisioned student accounts, school codes, claim codes, affiliations, and consent.
10. `backend/migration_guidance_report_paths.sql` for the account-scoped full selected guidance path used by students and admin-guided learners.
11. `backend/migration_admin_access_grant.sql` and `backend/migration_institution_team_access.sql` for guarded admin access and institution team membership.
12. `backend/migration_feedback_storage.sql`, `backend/migration_internal_staff.sql`, and related admin/support migrations if those surfaces are enabled.
13. `backend/migration_auth_onboarding_security_patch.sql` last, because it depends on users, active sessions, admission/student pipeline, and provisioning concepts being present.

## Application sequence

1. First signed-out root visit shows intro carousel, then auth landing.
2. Signup requires legal consent, profile fields, password confirmation, and email code verification before account creation.
3. Successful signup creates an incomplete account and routes to `/(auth)/onboarding`.
4. Account onboarding opens the real `AccountTypeGate`, not a loading/logo screen.
5. Student personas save a user-scoped onboarding draft and continue through student setup.
6. JAMB/senior-secondary users must resolve programme plus university through Admission Intelligence before onboarding is completed.
7. After admission resolution, the user moves into programme mapping, then domains, subgroups, roles, skills/opportunities.
8. Student users who do not require admission resolution complete onboarding and land on Home/Explore discovery, not lesson tracks. Graduate, professional, artisan, and career-change entry points remain hidden.
9. Educator/institution users complete educator onboarding, then land on the correct admin dashboard/guidance surface.
10. Guest creates a guest session and lands in Explore preview. Guest does not enter onboarding from Home, Profile, or Explore.
11. Explicit logout routes future opens to sign-in/signup. Browser close keeps the saved session and resumes from the current URL or correct post-auth surface.
12. A second active device invalidates the previous active session; the rejected device clears its token and returns to login.

## Scheduled source-backed domain population phase

This phase is scheduled after the current role-join and leakage audit and before
the final UI/data acceptance pass. It is deliberately separate from onboarding
logic: discovery must consume corrected role data before its visual surfaces are
refined.

1. Rebuild the canonical role tools and competencies using exact ESCO occupation
   identifiers and exact detailed O*NET SOC codes. Do not use ISCO groups as a
   competency join.
2. Reconcile the domain/subgroup structure with the canonical role layer and
   publish `data/career-mapping/_audit/ROLE_COMPLETENESS_REPORT.md`.
3. Populate the verified emerging-domain overlays:
   - D139 Game Design: TESDA's Philippine Skills Framework for Game Development;
   - D167 XR & Immersive Technology: JFF's four XR career clusters;
   - D140 Robotics Engineering: ARM RoboticsCareer plus Skills England
     robotics occupational maps;
   - D141 Quantum Computing: European Competence Framework for Quantum
     Technologies v3.0 (Quantum Flagship/QUCATS), with role mappings kept as
     medium-confidence specialist framework evidence;
   - D168 Esports & Creator Economy: British Esports and Pearson role pathways,
     with certifications left empty unless a recognized issuer is verified.
   - D070 Performing Arts & Entertainment: Singapore NAC Technical Theatre and
     Production, Skills England Live Event Technician, and the Malaysian
     Qualifications Agency Performing Arts standard.
4. Add computational and quantitative subgroup ownership without inventing
   occupations:
   - D078 Social Sciences: Quantitative & Computational Methods plus Social &
     Economic Research around existing ESCO roles such as sociologist,
     demographer, statistician and behavioural scientist;
   - D063 Economics: Economic Research & Quantitative Policy;
   - D142 Bioinformatics, Computational Biology: Computational Biology &
     Bioinformatics;
   - make the existing quantitative/statistical subgroups explicit in D009,
     D010, D011, D014 and D041.
   - add source-backed computational subgroup ownership to D001, D002, D003,
     D004, D005, D006, D012, D056 and D144 where the role layer already
     contains computational, systems, cyber, blockchain or modelling work.
   These layers use exact ESCO/O*NET role evidence, source-linked tools and
   Nigerian context sources from the domain registry. Local context is not
   presented as Nigerian demand, salary or licensing proof.
5. Build `data/career-mapping/cross_domain_role_families.json` from exact ESCO
   occupation URIs plus explicit source-backed family policies. A role family
   has one canonical family record, domain links and aliases; it does not copy
   role skills/tools into another domain. This supports discovery such as
   third-party cyber risk from Cybersecurity and its valid Supply Chain,
   Procurement and Compliance links.
6. Keep the overlay source-backed and explicitly labelled as a framework proxy;
   Nigerian sources are used later for local naming, training and credentials,
   not for inventing missing competencies.
7. Regenerate `backend/seed_career_v2.sql`, apply the additive source-backed
   migration, then verify role ownership, subgroup ownership, tool provenance,
   cross-domain family links, NaN-safe JSONB serialization, and medical-tool
   leakage before the discovery UI is accepted.

### Nigerian and global professional enrichment record

The generated source-backed layers now carry `nigerian_context` on every
visible domain, subgroup and role. The earlier provenance-only layer is not
treated as completed enrichment. Actual local skills, tools, competencies,
credentials, regulatory context and role names now come from the curated
`data/career-mapping/nigerian_global_professional_overlays.json` file, based on
the checked CPN, ICAN, COREN, NMCN, NDPC, NCAIR, NCC and NUC documents listed
there. Global CFA, GARP and RICS material is kept under `global_enrichment` so
it can enrich guidance without being mislabelled Nigerian.

The context object excludes salary, role-level demand and automatic licensing
claims. Source availability is explicit: `checked_in_extract`,
`checked_in_source_document` or `registry_reference`. A role or subgroup with
no evidence-backed Nigerian counterpart is reported as a gap rather than
filled with a guessed local title. The coverage audit is:

```text
python data/career-mapping/_audit_nigerian_context.py
```

The current audit covers 160 visible domains, 323 subgroups and 4,619 visible
role records with valid provenance. It currently finds actual local enrichment
for 61 domains, 74 subgroups and 704 role-family matches, plus global
enrichment for 19 domains, 23 subgroups and 116 roles. The remaining roles and
groups are explicit review queues, including domains with no demonstrated
Nigerian counterpart; they must not be filled with inherited or guessed
content. The generated JSON report contains the complete gap list.
