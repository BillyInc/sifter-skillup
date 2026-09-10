# Sifter LevelUp platform behaviour audit and implementation plan

Status: active implementation plan
Date: 2026-09-10 (continued)
Source: `C:\Users\USER\.codex\attachments\a5517a27-a213-484f-bb4f-f0c1b335bd18\pasted-text-1.txt`

Implementation checkpoint (2026-09-10): Phases 0–4 are implemented in the
current worktree. Phase 3 now exposes exact source identity, addresses, and
review-only requirement status; Phase 4 exposes the selected-university
requirements separately from national requirements and keeps source evidence
collapsible. Phase 5 route/context work is present and is being re-audited
  across all admin guidance targets. The Phase 6–8 implementation pass is
  applied; Section 13 records the evidence-backed completeness audit and the
  remaining external verification boundaries.

This document converts the pasted test observations into a cross-platform
product and engineering plan. Repeated observations are consolidated, but the
original observation numbers remain in the traceability section.

## 1. Evidence and authority

The audit was checked against:

- `docs/PRODUCT_BEHAVIOR_CONTRACT.md`
- `docs/ONBOARDING_DISCOVERY_UNBLOCK_PLAN.md`
- `docs/GUIDANCE_FLOW_UI_UX_SPEC.md`
- `docs/ADMIN_DASHBOARD_UI_UX_SPEC.md`
- `docs/user-facing-mockups/undergraduate-student-flow.md`
- `docs/user-facing-mockups/ss1-student-flow.md`
- `docs/user-facing-mockups/ss2-student-flow.md`
- `docs/user-facing-mockups/ss3-student-flow.md`
- `docs/user-facing-mockups/jamb-candidate-flow.md`
- `docs/user-facing-mockups/secondary-school-owner-flow.md`
- current Expo routes, Vite routes, onboarding forms, home/resume logic,
  programme detail, Admission Browse, admin shell, guidance start, and
  programme/domain data clients.

The auth and consent refinement was also checked against these external
references:

- [Auth0 Universal Login experience](https://auth0.com/docs/authenticate/login/auth0-universal-login/universal-login-vs-classic-login/universal-experience)
  for one coherent login, signup, password-reset and email-verification family,
  identifier-first options, password-manager autocomplete, and explicit
  redirects after reset.
- [Auth0 Universal Login prompt reference](https://auth0.com/docs/customize/login-pages/universal-login/customize-templates)
  for the expected login, signup and reset-password labels, validation states,
  and recovery links.
- [Auth0 default login routes](https://auth0.com/docs/authenticate/login/auth0-universal-login/configure-default-login-routes)
  for returning a completed password-reset flow to the application login
  route.
- [ICO consent guidance](https://ico.org.uk/media/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/consent-1-0.pdf)
  for clear affirmative action, separate optional consent, demonstrable
  records, and withdrawal.

The current product contract already establishes these facts:

1. Undergraduate setup is university-first and must not be forced through the
   JAMB discovery route.
2. SS1/SS2, SS3, and JAMB are different discovery journeys.
3. A programme-only or subject match resolves the exact JAMB brochure programme
   name first, then its university offerings, before university-specific
   requirements are shown.
4. The exact JAMB programme name is the displayed programme identity. A source
   row that says `Library Science` stays `Library Science`; a source row that
   says `Library and Information Science` stays `Library and Information
   Science` (or its recorded acronym). These are not merged or renamed.
5. Admin guidance is separate from the student shell and must carry an explicit
   target student when a student is being guided.
6. Missing or incomplete data must be labelled or withheld; it must not be
   turned into a false eligibility or market claim.
7. Cutoff data is not part of the current user-facing flow.

## 2. Audit findings

### 2.1 Historical implementation conflicts and current state

| Area | Evidence | Effect |
|---|---|---|
| Undergraduate detail | `ProgrammeDetailRefinedScreen.tsx` still exposes Requirements, Universities, and Career guidance tabs | Resolved for the current selected-university flow: requirements are available only after a university is selected; the primary undergraduate flow remains overview-first |
| Programme loading | The detail scaffold receives a placeholder programme with `Programme name unavailable` while data is pending | Loading is presented as a missing programme |
| Saved guidance | Home and programme links do not consistently carry `jamb_programme_id`, selected school, and journey context together | Saved guidance can reopen a programme without enough identity to load its real data |
| Home hydration | Home starts guidance/saved-item state as `coming_soon` and renders state panels before hydration finishes | Locked/pending cards appear before the actual response arrives |
| Student onboarding handoff | `nextHrefForStartingPoint` sends several student paths through `/explore/admission` | A completed setup lands in the generic Admission Browse route instead of a dedicated continuation flow |
| Admin guidance handoff | `GuidanceStartScreen` sends admin work into the shared admission route with `mode=subjects` or `mode=programme` | Admin guidance looks anonymous/generic and can stop before the student context is usable |
| Vite admin routing | `web/src/WebApp.tsx` rewrites `/admin/explore` and `/admin/workspace-explore` to `/explore` | Admin Explore renders the student shell and student information architecture |
| User-type boundary | The onboarding gate can be reopened from routes that should be inside an account | Browser back or Home actions can return a completed user to user-type selection |
| Choice locking | Programme/university selection remains editable after continuation | A later edit can invalidate the programme, offering, requirements, and domain context |
| Search identity | Search and offering display do not consistently separate canonical JAMB names, exact university names, and official university display names | Resolved in the current pipeline for exact JAMB identity, university address enrichment, and source-preserving names; source-table cleanup remains a data task |
| Requirements | University requirement payloads can expose repeated raw brochure fragments without synthesis | Resolved in the selected-offering view: national and university-specific requirements are separate, with review-only status and collapsible evidence |
| Admin shell parity | Native admin routes exist, but the Vite router currently substitutes the student Explore surface | Partially resolved: Vite now has an admin shell boundary, but route-level parity and approved admin-specific responsive design are still required; a wrapper alone is not completion |
| Authentication surface | The former Metro/Expo web path and the newer Vite path can expose different auth entry, signup and recovery layouts | One Vite web auth family is required for login, signup, guest entry and forgot-password; Expo remains the mobile runtime and shares the behavior contract |
| Legal consent | A document can appear read or a checkbox can become selected from scrolling alone | Required terms/privacy acceptance must be an explicit post-read action; optional analytics is off by default, separately explained, and never bundled into required consent |

### 2.2 Confirmed data-quality risks requiring a data audit

These cannot be solved safely by copy changes alone:

- subject-only matches returning Library Science and Social Work for unrelated
  O-level combinations;
- duplicate Civil Law university rows;
- university/programme names containing multiple institutions in one search
  result;
- DELSU and Delta State University not consistently normalised;
- Library Science versus Library and Information Science identity;
- Nursing variants and whether each variant is a real JAMB identity or a
  university offering name;
- missing or partial university-scoped requirement records;
- programme result caps and pagination;
- faculty values that do not reflect the selected university;
- parsed brochure rows marked inferred, partial, or needs-confirmation.

The data audit must compare the catalogue, JAMB programme identity, offering,
faculty, and subject-rule tables. It must not silently repair source data in
the frontend.

## 3. Product rules already explicit in the pasted observations

These do not require another decision:

- Undergraduate users start with their current university and programme.
- Undergraduate users see curriculum outcomes before any career mapping.
- Undergraduate users do not need admission requirements or other university
  options in their primary programme flow.
- SS/JAMB programme search returns an exact JAMB programme result with its
  university offerings. Distinct JAMB names remain distinct results; they are
  not merged into a broader or inferred programme label.
- An offering shows the official university name and acronym, its address when
  recorded, and the exact JAMB programme name attached to that university's
  source row. The JAMB name is the university-specific offering identity for
  this purpose: if DELSU's source row says `Library Science`, display `Library
  Science`; if another row says `Library and Information Science`, display
  that exact name. Do not create a second normalized programme label.
- A programme-only or subject-match user sees a programme preview before
  choosing a university.
- A selected university opens its own university-aware programme context.
- National and university-specific requirements must be clearly separated and
  synthesized, not repeated as raw brochure text.
- Direct Entry must not appear beside ordinary UTME programme previews.
- Programme and university choices are locked after Continue; changing one
  clears dependent choices and results.
- Completed accounts must not return to generic user-type selection through
  ordinary Home or browser-back navigation.
- `njunudaniel1@gmail.com` remains an explicit testing exception for switching
  user type.
- Student guidance and admin guidance use the same matching rules but separate
  persistence, permissions, and context.
- Start guidance for an existing student resumes that student's checkpoint.
- Anonymous provider guidance must be visibly different from saved student
  guidance.
- Admin Explore is not student Explore.
- University-admin Explore is programme intelligence for the institution, not a
  school-owner student-advising surface.
- Programme Intelligence and Market Intelligence are separate concepts.
- Claim codes and QR codes belong in the final report, not account creation.
- Report actions belong at route review/final output and in My World, not on
  create-account or student-provisioning screens.
- The platform must use best-effort copy protection and report watermarking; a
  browser cannot guarantee prevention of screenshots or external copying.
- There is one unified public auth entry: Sifter branding, Log in, Create
  account, and Continue as guest. Intro-carousel actions may open that entry
  in the requested mode, but they must not create a second pre-auth page.
- Web auth is a Vite surface with responsive web layout; Expo remains the
  mobile runtime. They share validation, route, consent, and error behaviour,
  but web is not required to imitate a Metro screen or its sizing.
- Auth forms are isolated by mode: leaving login clears login-only draft data,
  leaving signup clears signup-only draft data, and no browser autofill or
  in-memory draft may copy credentials between the two forms.
- Login, signup, and forgot-password use labelled fields, visible focus,
  keyboard-friendly controls, correct `autocomplete` values, inline format
  errors, safe server credential errors, disabled/busy states, retry states,
  and a usable mobile layout without horizontal overflow.
- Forgot-password is a complete route: request reset, show a neutral
  confirmation, accept the reset code/link, set and confirm a new password,
  handle expired/used codes, and return to login. It must not reveal whether
  an email exists.
- Terms and Privacy are separate required documents. Each opens in a readable
  modal or route, the user must reach the end and then explicitly choose the
  document's `I have read and accept` action, and scrolling alone never checks
  the box. Optional anonymous analytics is initially off, appears only after
  the required documents are accepted, explains what it collects and why, and
  can be withdrawn later.

## 4. Proposed canonical journeys

### 4.1 Undergraduate

```text
Account type
  -> current university
  -> university's programme offering
  -> programme overview and curriculum outcomes
  -> Continue to career mapping
  -> domain
  -> subgroup
  -> role
  -> review / report
```

The undergraduate programme surface should have one primary Overview state. It
may contain anchored sections for `What you will study`, `Skills you may
develop`, and `Career connections`, but it should not expose admission
requirements, university comparison, or a separate generic Career Guidance tab.

### 4.2 SS1/SS2

```text
Class and school
  -> stream
  -> programme in mind OR subject discovery
  -> programme preview
  -> optional university exploration
  -> university-aware context when a school is selected
  -> early career mapping when appropriate
```

SS1/SS2 subject guidance is advisory. It must not imply admission eligibility.
The UI should show why a programme appeared and what still needs checking.

### 4.3 SS3/JAMB

```text
Preparation context
  -> known programme + university
     OR known programme
     OR subject matching
  -> canonical programme preview
  -> complete university offering list
  -> selected university context
  -> national/university requirement synthesis
  -> career mapping
```

Known programme + university skips unnecessary stream and subject questions.
Subject matching exposes only the selected exam layer: UTME only, O-level only,
or combined when explicitly selected.

### 4.4 School/tutorial/JAMB-café guidance

```text
Admin workspace
  -> preview anonymously OR select authorised student OR open provider session
  -> learner class/type and stream where relevant
  -> programme matching or subject matching
  -> programme preview
  -> offerings and selected university
  -> career mapping
  -> save to student checkpoint or discard anonymous session
```

The guidance workspace is a focused task surface. The normal Explore sidebar is
collapsed while the task is active; the admin identity, organisation, target
student, consent/access state, and exit action remain visible.

This same focused route contract applies to every admin guidance entry point:

- admin self-guidance;
- anonymous preview;
- provider-led or tutorial-centre session;
- guidance for an authorised existing student;
- guidance for a student account created/provisioned by the admin.

The route is selected from context rather than from a generic Admission
Intelligence page. A known programme and university opens the university-aware
programme details; a known programme opens its preview and offerings; an
unknown programme opens subject matching, programme options, and offerings.
Persistence and permissions differ by session type, but the visible guidance
sequence and matching rules do not.

### 4.5 University-admin intelligence

```text
University workspace
  -> scope selector: department / faculty / whole university
  -> programme intelligence
  -> programme curriculum outcomes
  -> domain/subgroup/role reach
  -> curriculum coverage and source-backed gaps
  -> aggregate student signals where permitted
  -> print/export programme intelligence
```

Market Intelligence remains a separate demand surface filtered by domain,
subgroup, and role. It must not be used as a substitute for curriculum gaps.

## 5. Programme and offering content contract

### Exact JAMB programme preview

The preview shows:

- exact JAMB programme name as recorded in the brochure/source row;
- short plain-language description of what the programme is about;
- `What you will study` from the actual programme curriculum/outcomes;
- a concise `Skills you may develop` section separated into technical and
  transferable skills;
- number of recorded university offerings, without exposing arbitrary result
  counts as demand or eligibility;
- a clear action to inspect university offerings.

It does not show:

- CCMAS discipline labels;
- raw database aliases;
- Direct Entry requirements in a UTME preview;
- cutoff/cycle data;
- university-specific requirements before a university is selected;
- unverified labour-market claims.

### University offering row

Each row is a list item, not a repeated full card dump:

- official university display name and acronym;
- address/location where recorded;
- exact JAMB programme name from the linked university source row;
- a short offering context;
- data status if requirements are absent or partial;
- `Open offering` action.

The offering row must not invent, abbreviate, merge, or normalize the programme
identity, and must not present a second inferred university programme name. The selected
offering page/modal contains synthesized requirements and source details.

### Requirement synthesis

The selected offering presents:

1. `What the national programme normally requires`;
2. `What this university adds, changes, or has not recorded`;
3. `How to read this` explanation;
4. source/status details in an expandable evidence section.

Direct Entry is only shown for a dedicated Direct Entry context. Missing
university-specific requirements must say that they are not recorded; they must
not be replaced by the national requirement and must not be duplicated three
times.

## 6. Guidance and navigation contract

- Every route stores a route context containing user type, class, stream,
  programme identity, university identity, journey mode, target student, and
  resume stage where applicable.
- `Continue` commits the current step. After commitment, prior choices are
  displayed as locked context with a `Change` action.
- `Change` clears all descendants: programme change clears university,
  requirements, domains, subgroups, roles, and report state; university change
  clears university requirements and downstream selections; stream change clears
  subject matches and programme results.
- Browser Back returns to the immediately preceding valid route context. It
  must not reconstruct the user-type gate unless the user explicitly chose
  `Back to user selection`.
- Browser Forward must restore the same route context or safely rehydrate from
  the checkpoint; it must not use stale global state from another user.
- Loading displays skeleton/progress. Locked is only used for permission,
  consent, or account requirements. Empty is used after a successful request
  with zero rows. `coming_soon` is not a temporary loading state.
- The active guidance route hides or collapses global Explore navigation and
  exposes a route stepper, back action, context banner, and one primary CTA.

## 7. Admin intelligence contract

### Programme Intelligence

This is the university's curriculum and programme view. It includes:

- programme catalogue grouped/filterable by faculty and department;
- programme curriculum outcomes;
- domain reach ranked by mapping coverage, not employer demand;
- subgroup and role reach under each domain;
- curriculum-to-skill/competency coverage where source-backed;
- source status and missing evidence;
- permitted aggregate student enrollment/selection signals;
- printable programme intelligence report.

### Market Intelligence

This is demand intelligence, separate from programme curriculum. It includes:

- domain demand;
- subgroup demand;
- role demand;
- source date, coverage, and evidence state;
- filters by domain/subgroup/role and organisation scope.

No placeholder demand, salary, employment, or rank values are presented.

## 8. Implementation phases

### Phase 0 — invariants and route telemetry

- Add a shared route-context type and transition helpers.
- Add an audit-safe route logger for route, context, and resume stage without
  logging student data.
- Add tests for account type isolation, target-student isolation, and stale
  route rejection.

### Phase 1 — Home, loading, resume, and browser navigation

- Distinguish pending, empty, locked, coming-soon, and error states on Home.
- Keep Quick Actions visible while guidance and saved items hydrate.
- Replace misleading locked saved-path state with a truthful empty state.
- Make saved guidance carry canonical JAMB ID, programme ID, university ID,
  user type, journey, and resume stage.
- Replace placeholder programme rendering during loading with a skeleton.
- Repair `Back to programme choices`, programme change, and university change.
- Prevent completed accounts from returning to user-type selection.
- Preserve the test-account exception only on the server-validated test email.

### Phase 1A - unified Vite web auth, recovery, and consent

- Move the browser-facing auth experience to the Vite web entry while keeping
  the mobile app on Expo. Share the auth behavior contract and API adapter;
  do not share Metro-specific layout assumptions with web.
- Consolidate all web auth entry points into one responsive auth family with
  Sifter branding, Log in, Create account, and Continue as guest. The intro
  carousel can select the initial mode, but must route into this same family.
  Remove legacy duplicate pre-auth surfaces and preserve deliberate back and
  mode-switch behavior.
- Use a responsive two-column branded layout on wide screens and a single
  column layout on narrow screens. Set a readable max-width for the form,
  usable field/button heights, visible focus, no horizontal overflow, and
  stable sizing for login, signup, forgot-password, code verification, and
  reset confirmation states.
- Keep login and signup drafts completely isolated. Leaving a mode clears its
  unsent credentials and changing mode must never transfer email, username,
  or password values through state, storage, query parameters, or browser
  autofill hints.
- Give every auth field an explicit label and correct autocomplete semantics:
  `email`/`current-password` for login, `email`/`new-password` for signup and
  reset. Validate email format and required password fields before the request;
  show a clear safe credential error for server rejection without exposing
  whether an account exists.
- Implement forgot-password as a complete, refresh-safe flow with request,
  neutral email confirmation, code/link entry, new-password confirmation,
  expired/used-code errors, resend/retry, and a clear return-to-login action.
  Auth pages must not wait for `/users/me` or home hydration before rendering.
- Make Terms and Privacy readable before acceptance. Opening either document
  shows the complete text in a scrollable modal or dedicated route; reaching
  the end only enables an explicit accept action and never checks the box by
  itself. The optional anonymous analytics choice is off by default, appears
  only after required documents are accepted, explains what is collected and
  why, and is recorded separately with versioned consent and withdrawal.
- Test all auth routes directly, after refresh, with browser Back, at desktop
  and mobile widths, and with failed API/network responses. A user must never
  become trapped in a legal modal or be silently treated as having consented.

### Phase 2 — canonical student discovery

- Split undergraduate programme mapping from SS/JAMB admission discovery.
- Route known programme + university directly to selected university context.
- Route programme-only and subject matches to canonical preview, then offerings.
- Make exam-layer selection exclusive and visible.
- Remove the generic Admission Browse screen from completed student paths.
- Keep old deep links as context-preserving redirects.

### Phase 3 — programme/offering data quality

- Audit school identities, aliases, addresses, faculty names, exact JAMB names,
  exact offering names, and duplicate keys. Normalise only university identity
  aliases; never normalize one programme name into another.
- Remove combined institution names from search/result rows.
- Add exact-name result grouping and complete pagination. Group only identical
  JAMB names; keep distinct JAMB names as separate results.
- Reconcile nursing variants, Civil Law rows, Library Science/Library and
  Information Science, and DELSU official naming against source data. Preserve
  `Library Science` and `Library and Information Science` as separate
  identities whenever the source distinguishes them.
- Add a review-only status for offerings with incomplete requirements.
- Do not make frontend fallbacks repair bad source records.
- The selected institution course list and programme offering list must not
  silently truncate valid rows; typeahead may be bounded, but committed
  university/programme views need a complete result or explicit pagination.

### Phase 4 — programme detail and requirements

- Implement the undergraduate reduced detail surface.
- Implement the SS/JAMB preview → offering → selected university flow.
- Synthesize national and university-specific requirements.
- Move full source text into a collapsible evidence view.
- Hide Direct Entry except in a dedicated context.
- Add university list filtering and compare/return behavior where permitted.

### Phase 5 — focused guidance workspace

- Collapse global navigation during guidance.
- Add student/admin context banners and route stepper.
- Separate anonymous, provider-session, and authorised-student persistence.
- Apply the focused route to admin self-guidance as well as anonymous,
  provider-led, authorised-student, and admin-created-student sessions.
- Keep the global Explore/navigation chrome collapsed while any of those
  guidance sessions is active; retain only the workspace identity, target
  student/account state, route stepper, back/change action, and primary CTA.
- Resume the exact student checkpoint from roster.
- Make students created through admin provisioning resume from their own saved
  checkpoint rather than entering generic Explore or the user-type gate.
- Make journey options progressive and context-aware.
- Prevent UTME/O-level cross-contamination.
- Ensure programme-to-career begins at the selected programme and does not
  reopen generic search.
- Keep generic Admission Intelligence as an Explore discovery entry point only;
  it must not be the destination after onboarding or after an admin guidance
  choice is submitted.

### Phase 6 — admin shells and intelligence

- Make Vite admin routes render the admin shell, not student Explore.
- Align native and Vite admin route maps.
- Treat the former Metro/Expo admin implementation as the mobile reference,
  not as the browser layout. Rebuild the browser-facing admin surfaces in Vite
  with the approved admin information architecture: persistent workspace
  identity, role-aware sidebar, focused guidance mode, responsive tables/cards,
  and desktop/mobile breakpoints that do not expose the student shell.
- Verify every admin route in Vite, including dashboard, guidance, roster and
  student provisioning, verification, programme intelligence, market
  intelligence, peers, feedback, profile/team, affiliation, session and
  Explore detail routes. A thin AdminShell wrapper around a student Explore
  screen is not sufficient parity.
- Redesign school/tutorial/JAMB guidance entry around their permitted jobs.
- Implement university scope hierarchy and Programme Intelligence.
- Reframe Domain Reach as programme intelligence domain reach.
- Fold curriculum skill coverage into Programme Intelligence.
- Keep demand filters in Market Intelligence.
- Make profile/team labels institution-role aware.
- Keep peer benchmarks permission- and scope-aware.
- Make curriculum coverage programme-first: each programme expands into its
  mapped domains, then each domain shows source-backed domain, subgroup, and
  role resources. Skills, tools, and certifications remain separate resource
  kinds; a bridge is an exact-name absence from the recorded programme
  outcomes, not an employer-demand claim or synonym inference.
- Keep university curriculum intelligence institution-scoped. A university
  may compare the same programme across universities only for recorded
  offering, requirements, and source completeness. Do not claim that one
  university teaches more bridge skills when the available curriculum profile
  is national CCMAS/JAMB data rather than institution-specific evidence.
- School owners and tutorial/JAMB providers receive guidance intelligence and
  university/programme lookup for advising; they do not receive peer
  benchmarking or cross-university curriculum rankings. Their useful
  comparison is the student-facing offering/requirements view inside a
  guidance session.

### Phase 7 — institution creation, roster, and verification

- Unify upload/manual student creation under one entry surface.
- Do not show Back to upload options until an upload/manual choice exists.
- Do not auto-select manual creation.
- Make tutorial-centre quick-add create a pending institution record.
- Collect institution details and verify ownership before access.
- Keep claim code/QR out of onboarding and inside the final report.
- Make delete remove roster rows optimistically after confirmed deletion.

### Phase 8 — reports, sharing, resilience, and privacy

- Place print/download/share at final report review and My World.
- Add email, WhatsApp, Drive, Dropbox, and native share adapters only where
  supported by the runtime; otherwise use a truthful unavailable state.
- Watermark generated reports.
- Disable ordinary web text selection and drag-copy as best effort.
- Improve retries, stale cache, offline notices, request cancellation, and
  Nigerian poor-network handling across search and guidance.

## 9. Applied product decisions

The user approved the recommended defaults for all previously listed gates,
with the programme identity rule explicitly replaced by the exact JAMB/source
rule above:

1. Undergraduate Career Mapping is an anchored continuation from Overview, not
   a duplicate primary tab.
2. Selected university details open as a full route/context screen so browser
   back, refresh, and resume remain reliable.
3. Direct Entry is hidden from ordinary UTME/SS/JAMB previews until a dedicated
   Direct Entry route exists.
4. Programme Intelligence is institution-scoped and permission-scoped; it is
   not a national educator surface by default.
5. Institution verification supports email and WhatsApp where configured, with
   a truthful unavailable state when a channel is not configured.
6. Best-effort copy protection and watermarking are used, with no claim that a
   browser can prevent screenshots.
7. Programme identity is exact JAMB/source identity: distinct JAMB names are
   never merged, and university-specific names are displayed only from the
   corresponding source offering record.

## 10. Acceptance checklist

- No undergraduate enters generic Admission Browse after selecting university
  and programme.
- No programme detail displays `Programme name unavailable` while loading.
- Home shows truthful loading/empty states and Quick Actions immediately.
- Saved guidance reopens the same canonical programme and university.
- Choice changes clear dependent downstream state.
- Browser back/forward preserves valid route context.
- SS/JAMB subject matches show the exact JAMB programme name and complete
  offerings, not merged variants or duplicated raw rows.
- `Library Science` and `Library and Information Science` remain visibly
  distinct whenever the source records them distinctly.
- University names show official names and useful acronyms.
- National and university requirements are synthesized and non-duplicative.
- Admin guidance remains inside the admin shell and preserves target context.
- Vite admin routes use the admin layout and information architecture at
  desktop and mobile widths; no Metro-only admin route or student-shell
  substitution remains on web.
- Auth entry, login, signup, forgot-password, code verification, and legal
  consent use one responsive family with isolated drafts and explicit consent.
- University admins see institution-scoped Programme Intelligence.
- Market Intelligence remains separate and source-backed.
- Reports contain claim/QR data only at final output.
- Guests and anonymous sessions cannot receive false persistence success.
- Mobile Expo and web Vite follow the same behavior contract.

## 11. Verification strategy

Every phase requires:

1. focused unit tests for data/state transformations;
2. route tests for direct entry, refresh, browser back/forward, and stale
   context;
3. source-backed fixtures for programme, university, faculty, subject, and
   requirement cases;
4. web build and TypeScript validation;
5. mobile/Expo bundle validation where the changed route is shared;
6. manual route traces for each visible user type and admin organisation type;
7. no Supabase mutation by Codex when the user is applying SQL manually.

## 12. Current implementation status

- Pasted observations: read in full and consolidated here.
- Repo/document audit: started; direct conflicts listed above.
- Product decisions: recommended defaults approved; exact JAMB/source identity
  rule recorded as the replacement for the former identity recommendation.
- Plan document: this document.
- Implementation checkpoint: Phases 0–4 route, discovery, offering, and
  requirements corrections are applied; Phase 5 focused guidance context is
  present and under final route audit. Phase 6 now has the programme-first
  curriculum coverage implementation for domain, subgroup, and role resources;
  context-specific comparison remains source-gated. Phase 1A is now an explicit
  auth/redesign gate: the Vite web auth family, responsive sizing, recovery,
  isolated drafts, and affirmative legal consent must be audited as one flow;
  Expo remains the mobile runtime. Phase 6 also requires full Vite admin route
  parity with the former Metro/Expo admin behavior, using the approved web
  admin design rather than a student-shell wrapper. No Supabase writes are
  part of this plan.
- Phase 0 evidence: `src/lib/guidanceRouteContext.ts` centralizes programme,
  JAMB, university, user-type, journey, target-student, resume, focus, and
  view-only context; admin self-guidance, provider sessions, and authorised
  student guidance now identify their target scope explicitly; `exploreNav`
  carries the same context from programme through domain, subgroup, role, and
  build transitions. Focused admin guidance collapses the admin navigation in
  both native and Vite web shells while retaining an exit action and context
  banner. `src/lib/guidanceRouteContext.test.ts` covers target isolation and
  context preservation without logging IDs. The test is present; local Jest
  execution still needs the repository's incomplete Expo Jest transformer
  installation. Domain, subgroup, role, and programme detail routes now keep
  the target marker and target-student identity across each transition.
- Phase 1 evidence: Home uses pending/error states during hydration, keeps
  Quick Actions visible, reopens saved domain/role rows, and carries canonical
  JAMB/university context when resuming a programme. Programme loading no
  longer injects a fake placeholder entity.
- Phase 1A status: the unified Vite auth family, responsive sizing, recovery,
  isolated drafts, and explicit post-read legal consent are implemented and
  build-checked. Manual browser route/width traces remain an external check;
  see the completeness audit in §13.
- Phase 2 evidence: known JAMB/SS3 programme+university setup routes directly
  to the university-aware programme screen; known-programme and subject routes
  retain focused guidance context; known JAMB doors do not require a stream
  unless the optional subject check is opened. Undergraduate detail is kept
  separate from admission tabs. Programme-only and subject routes now use the
  preview/offerings/selected-university sequence, legacy admission links retain
  their context, and transient admin self/provider sessions do not write to
  student or personal My World state or complete student onboarding.
- Exact JAMB identity correction applied in the backend response contract:
  source names are no longer shortened, and offering `programmeName` uses the
  exact JAMB/source row rather than a CCMAS/canonical replacement.
- Verification for this increment: TypeScript check passed, Vite web build
  passed, backend Python compilation passed, exact-identity pytest passed (2
  tests), and `git diff --check` passed. Existing build warnings remain in
  unrelated simulator/data files.

## 13. Phase 0–8 completeness audit (2026-09-10)

This is the implementation-completeness audit requested after Phase 1A,
Phase 3, and the full Phase 6–8 pass. “Implemented” below means the current
worktree contains the behavior and its relevant source/test evidence. It does
not mean that an external Supabase instance has been seeded or that a browser
session has been manually driven by Codex.

| Phase | Current result | Evidence and remaining boundary |
|---|---|---|
| 0 | Implemented; test execution limited | `guidanceRouteContext.ts`, focused context propagation, target isolation, and audit-safe telemetry are present. The dedicated Jest test is present, but this checkout cannot execute it because the configured `jest-expo` preset is not installed. |
| 1 | Implemented in source | Home hydration keeps quick actions visible, distinguishes pending/error/empty states, and resumes canonical programme/university context. The source is verified by TypeScript/build checks; browser back/forward and refresh still require a manual browser trace. |
| 1A | Implemented in source and build | `web/src/WebApp.tsx` is the single Vite auth family for entry, login, signup, forgot-password, and legal consent. Login/signup drafts are separate; legal documents require explicit post-read acceptance; analytics is optional and explained only afterwards. TypeScript and `build:web` pass. Manual desktop/mobile route traces remain external verification. |
| 2 | Implemented and pipeline-tested | Known programme/university, programme-only, and subject routes preserve the canonical JAMB identity and selected-university context. Legacy admission links redirect with context. |
| 3 | Implemented, with source-review rows intentionally retained | UTME, O-level-only, and combined matcher gates are explicit; Use of English is required for UTME/combined; broad unnamed qualifiers stay review-only; exact JAMB names and all recorded offerings are preserved. Focused matcher tests pass. Incomplete brochure/source rows remain excluded from eligibility or labelled review-only until manually sourced; they are not silently treated as complete. |
| 4 | Implemented in detail surfaces | Programme preview precedes offering selection; selected-university requirements are separate from national requirements; source evidence is collapsible; Direct Entry is not shown in ordinary UTME/SS/JAMB preview. |
| 5 | Implemented in route/context code | Focused guidance collapses navigation, carries user/admin/provider/student target context, and persists/resumes checkpoints. Native and Vite shells use the same context contract. Dedicated JS test execution is still blocked by the missing Jest preset noted above. |
| 6 | Implemented in current web/native surfaces | Vite maps dashboard, guidance, student provisioning/roster, student guidance, verification, Programme Intelligence, Market Intelligence, peers, domain reach, feedback, profile/team, affiliation, session, and Explore detail routes through the admin boundary. `AdminShell` uses role/audience-aware navigation and focused guidance mode; Programme Intelligence reads institution-scoped structural data and does not use demand data. TypeScript, build, and admin security tests pass. |
| 7 | Implemented and backend-tested | Upload/manual creation is unified without auto-selecting manual mode; drafts and resume checkpoints persist; institution address is required for admin registration; school claim codes are context-prefixed and UUID-unique; roster deletion is optimistic only after confirmed deletion; student visibility is consent-scoped. Focused provisioning/institution tests pass. |
| 8 | Implemented and report-tested | Final review and My World expose print/save, editable download, and share actions only for a saved programme+university path. HTML/DOCX reports contain watermarking and the final QR/claim section; the browser/device share sheet is used where supported and download fallback is truthful. Report CSS applies best-effort selection/drag-copy protection; API requests have timeout/retry/stale/offline handling. Report/provisioning tests pass. |

### Audit conclusion

No Phase 0–8 requirement was found to be silently replaced by a generic
student Explore destination in the current Vite route boundary. The remaining
items are verification/data-state boundaries rather than hidden frontend
fallbacks:

1. Supabase schema application and the remaining JAMB source-review rows must
   still be verified by the user against the live database; this worktree does
   not claim that external SQL has been applied.
2. A real browser trace is still required for direct auth refresh/back/width
   checks and for the complete admin route matrix. The source build cannot
   prove pointer-level browser behavior by itself.
3. The repository’s Jest command currently fails before test discovery because
   `jest-expo` is unavailable in the installed dependency set. This is recorded
   as a tooling limitation, not converted into a false passing result.
4. `build:web` passes but reports pre-existing duplicate simulator keys and a
   duplicate JSX `style` attribute in unrelated learning/simulator files. They
   are outside this phase’s behavior changes and remain visible for a separate
   cleanup task.
