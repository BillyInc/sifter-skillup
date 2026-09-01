# Sifter LevelUp - Product Behavior Contract

Status: repository-wide audit and portable handoff contract

Audit date: 2026-08-21

Guidance-flow reconciliation: 2026-09-01. This revision aligns the admission
journey with the current programme-preview and university-offering decisions;
the original repository-wide audit date remains unchanged.

This document is the behavioral source of truth for future design and
implementation work. It was produced from the current repository, backend route
and migration inventory, tests, existing product documents, and the supplied
Figma file. It describes what the product currently does, what it is allowed to
claim, and what is missing or contradictory.

This audit does not implement application code or edit the Figma file. It defines
the evidence-backed behavior and design handoff that must precede those changes.

## Document authority and supporting specifications

This is the single master product behavior contract. If another product
document conflicts with it, this contract and the repository win until the
conflict is deliberately resolved here.

The following focused documents remain supporting specifications, not competing
contracts:

- [Account-type gate behavior](mockups/ACCOUNT_TYPE_GATE_BEHAVIOUR.md)
- [Admission programme overview behavior](mockups/ADMISSION_PROGRAMME_OVERVIEW_BEHAVIOUR.md)
- [Guidance report behavior](mockups/GUIDANCE_REPORT_BEHAVIOUR.md)
- [SS1 student flow](user-facing-mockups/ss1-student-flow.md)
- [SS2 student flow](user-facing-mockups/ss2-student-flow.md)
- [SS3 student flow](user-facing-mockups/ss3-student-flow.md)
- [JAMB candidate flow](user-facing-mockups/jamb-candidate-flow.md)
- [Undergraduate student flow](user-facing-mockups/undergraduate-student-flow.md)
- [Secondary-school owner/admin flow](user-facing-mockups/secondary-school-owner-flow.md)
- [Onboarding discovery plan](ONBOARDING_DISCOVERY_UNBLOCK_PLAN.md)
- [Figma coverage and gaps](FIGMA_COVERAGE_AND_GAPS.md)

Focused documents may provide screen-level examples and persona detail, but
they must not introduce alternate terminology, navigation, state semantics, or
permissions. When a focused document needs a new behavior, update this master
contract first and then update the focused document.

The repository is authoritative for routes, data contracts, permissions,
persistence, and real states. Figma is authoritative only for visual decisions
that have been reconciled against this document. Existing mockups are product
evidence and design input, but they do not override code or verified data.

## Audit scope and evidence

The audit covered:

- 102 Expo Router files under `app/`;
- 89 screen files under `src/screens/`;
- 153 component files under `src/components/`;
- 77 client, navigation, persistence, feature, and utility modules under
  `src/lib/`;
- 9 shared type files under `src/types/`;
- 177 backend files, including route modules, migrations, data scripts, and
  backend tests;
- 20 frontend test files and 26 backend test files;
- 90 product, mockup, audit, migration, and design documents under `docs/`;
- the supplied Figma file and its referenced nodes listed in
  `docs/FIGMA_COVERAGE_AND_GAPS.md`.

The detailed file inventories are at the end of this document. Where a screen
uses a shared primitive, the primitive's interaction and accessibility behavior
is inherited from that component and must not be reimplemented inconsistently.

## Canonical product decisions

- The canonical product name is `Opportunities`, never `Jobs`.
- The canonical admission capability is `Admission Intelligence`, never
  `Admission Path`.
- `professional`, `skilled_worker`, and `graduate` remain hidden/dormant. Their
  types and code may remain, but they are not visible account-type options.
- The visible account gate contains SS1 Student, SS2 Student, SS3 Student, JAMB
  Candidate, Undergraduate Student, and Educator / Institution.
- A subgroup is a grouping layer inside a domain. It is not a separate primary
  navigation destination.
- Opportunities are not live until verified opportunity rows exist. Empty or
  unavailable opportunity data must not become employment claims.
- Resources can be saved to My World by canonical URL.
- Individual skills are currently displayed as bridge/gap information but are
  not saveable entities. Saving a resource that teaches a skill is different
  from saving the skill itself.
- Code and verified backend data win over conflicting mockup copy.

## Product actors and access

| Actor | Entry | Primary job | Access boundary |
| --- | --- | --- | --- |
| Guest | Landing page -> guest session | Browse public discovery data | Cannot persist personal work or print a confirmed report; must be told why |
| SS1 student | Account gate -> SS1 onboarding | Start from school, stream, subjects, and early programme guidance | Student routes; no dormant professional flows |
| SS2 student | Account gate -> SS2 onboarding | Narrow subjects and programme choices before SS3/UTME | Student routes; class and stream are context |
| SS3 student | Account gate -> SS3 onboarding | Final-year subject and admission guidance | Student routes; admission context is primary |
| JAMB candidate | Account gate -> JAMB onboarding | Subject/programme/university admission decisions | Student routes; JAMB-specific requirements |
| Undergraduate student | Account gate -> university/programme setup | Understand current programme and connected career fields | Student routes; current programme context must be preserved |
| Educator / institution | Account gate -> educator onboarding | Verify institution, guide students, manage roster and sessions | Admin stack; student data is permission- and consent-bound |
| Dormant professional / skilled worker / graduate | Not visible | Future qualification, career-change, or graduate routes | Do not expose through normal onboarding until released |
| Internal/admin staff | Existing account permissions | Operational review and intelligence surfaces | Must be permission-checked; not equivalent to a student |

## Global runtime behavior

The app has three routing layers:

1. The root layout installs authentication, theme, fonts, legal acceptance,
   motion/shared-element providers, and error handling (`app/_layout.tsx`).
2. The auth stack handles sign-in, signup, forgot password, and onboarding.
   `app/(auth)/_layout.tsx` hydrates the session, account type, educator profile,
   admin resume, and explicit logout state before redirecting.
3. The student tab stack is wrapped by `ReferenceShell`; its visible information
   architecture is Home, Explore, Opportunities, My World, and Profile. Expo
   Router's native tab bar is hidden and the shell owns navigation chrome
   (`app/(tabs)/_layout.tsx`). The admin stack is separate and uses `AdminShell`.

Entry and redirect rules:

- Unknown or unauthenticated access resolves to sign-in unless the route is a
  public auth route or a guest session is intentionally created.
- A user without a selected account type is sent to onboarding.
- A non-guest user without completed onboarding is sent to onboarding.
- A completed admin account resumes the saved admin route or its profile home.
- A completed student account resumes the pending post-auth route or the
  student home/explore policy.
- A guest can browse Explore but does not receive false persistence success.
- Route guards must preserve a pending destination through authentication and
  reject destinations that the actor is not permitted to open.

Global state vocabulary is the `DataState` contract in `src/types/career.ts`:

| State | Meaning and required UI |
| --- | --- |
| `real` | Verified data exists and may be described as real |
| `fallback` | Reduced/standard data is shown and must be labelled |
| `pending` | Request or verified data is loading; show progress/skeleton |
| `coming_soon` | Surface exists but is not released or has no populated data |
| `locked` | Account, consent, access, or permission is required |
| `error` | Request failed; explain recovery and offer retry where possible |

Screens also need explicit empty, offline, validation, selected, saved, and
success feedback states when their interaction can produce them. A blank card is
not an acceptable substitute for a state.

## End-to-end product flows

### Flow A: public entry, authentication, and legal acceptance

```text
Landing
  -> Sign in | Sign up | Continue as guest
Sign up
  -> validate identity/password/legal choice
  -> send email code
  -> verify code
  -> account-type gate or resume target
Sign in
  -> validate credentials
  -> account/onboarding/admin/student redirect
Forgot password
  -> request reset -> email/provider response -> return to sign in
Authenticated non-guest
  -> legal acceptance gate when required
```

Evidence: `app/index.tsx`, `app/(auth)/_layout.tsx`,
`app/(auth)/sign-in.tsx`, `app/(auth)/signup.tsx`,
`app/(auth)/forgot-password.tsx`, `src/screens/AuthScreen.tsx`,
`src/screens/SignUpScreen.tsx`, `src/screens/ForgotPasswordScreen.tsx`,
`src/components/LegalAcceptanceGate.tsx`, `backend/routes/*auth*` and auth
tests.

Required behavior:

- Inputs validate locally before network submission and retain useful input on
  recoverable failure.
- Email-code sent, invalid-code, expired-code, duplicate-account, network, and
  password-reset states are visible and recoverable.
- Terms/privacy can be opened without losing the signup draft.
- Legal acceptance is explicit; leaving without acceptance signs out or returns
  to the appropriate boundary rather than silently creating a partial account.
- Guest mode is clearly labelled and does not imply a saved account.

Status: implemented in code with partial Figma coverage. The supplied Figma
contains signup send-code, code-sent, and code-rejected references (`75:2`), but
not the complete sign-in, forgot-password, legal, guest, loading, and provider
failure matrix.

#### `IntroCarousel` and public pre-auth landing

- Route/evidence: `app/index.tsx:33-185`; `src/components/brand/IntroCarousel.tsx:41-214`.
- Persona/entry/purpose: unauthenticated first-time visitor sees the intro once,
  then reaches the public entry actions; returning visitors resume the public
  entry or are redirected according to session/logout state.
- UI/components: three horizontal intro slides, skip, next/get-started,
  existing-account link, logo/parallax, progress indicators, root landing hero,
  sign-in, create-account, guest, view-intro, and guest error feedback.
- Actions/exits: skip/finish -> root public entry; existing account -> sign-in;
  sign-in/create account -> auth stack; guest -> guest session and Explore;
  view intro -> carousel again; authenticated user -> preserved student/admin
  resume route.
- States/data: intro hydration, first-launch, slide index, completion,
  explicit logout, auth/profile/admin-resume hydration, guest busy, guest error;
  `INTRO_SEEN_KEY`, auth session, educator profile, and admin resume are the
  sources of truth.
- Persistence/permissions/feedback: intro completion is local-only; guest mode
  is not a saved account; authenticated redirects preserve account/onboarding
  context; guest failure remains on the public entry.
- Motion/a11y: paging, parallax, progress animation, and haptic selection exist,
  but reduced-motion handling, slide announcements, explicit control labels,
  dynamic-width handling, and focus restoration still need completion.
- Decision: the root landing is the canonical pre-auth entry. The `welcome`
  branch in `AuthScreen.tsx:205-384` is unreachable because the screen starts in
  `login` mode and never sets `welcome`; it is obsolete/duplicate and should not
  receive a second competing design.
- Acceptance/status/Figma: functional first-launch and pre-auth behavior exists,
  but the copy still contains legacy “jobs” language and the interaction/accessibility
  contract is incomplete; implemented/partial; Figma coverage is missing for
  intro, landing, guest loading/error, and public legal links.

### Flow B: visible account-type onboarding

```text
Account-type gate
  -> SS1 -> SS1 setup
  -> SS2 -> SS2 setup
  -> SS3 -> SS3 setup
  -> JAMB -> JAMB setup
  -> Undergraduate -> current university/programme setup
  -> Educator / Institution -> organisation onboarding
  -> back/exit guard -> continue later, continue, or account boundary
```

Student evidence: `src/screens/onboarding/AccountTypeGate.tsx`,
`src/screens/OnboardingFlow.tsx`,
`src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx`,
`src/components/onboarding/JambSetupForm.tsx`,
`src/components/onboarding/CurrentStudentSetupForm.tsx`,
`src/components/onboarding/LiveAdmissionSearchField.tsx`, and
`src/lib/onboardingDraft.ts`.

Educator evidence: `src/screens/admin/EducatorOnboarding.tsx`,
`src/lib/educatorProfile.ts`, `src/lib/adminAudience.ts`, and institution
routes/migrations.

Required behavior:

- Account-type options are exactly the six visible choices above.
- School/university searches distinguish loading, no result, error, selected,
  and unavailable data.
- SS1/SS2/SS3 retain class, stream, school, subject, and intent context as
  appropriate. English Language and Mathematics are not silently removable when
  required by the current form contract.
- JAMB setup preserves subject and programme decisions and exposes real
  institution-scoped requirements only after the required selection.
- Undergraduate setup begins from the current university and its programme
  offering; it does not force the user through a JAMB path.
- Educator onboarding collects organisation type, identity, role, access code,
  verification context, and completion; it does not route to student tabs.
- Drafts persist locally and, for authenticated users, through the backend draft
  endpoint. Resume must restore the correct step and values.
- Back/exit guard offers a safe choice. It must not destroy the draft without an
  explicit destructive action.

Status: implemented in code; Figma partially covers the gate, picker, SS1/SS2
setup, school code, subject chips, and exit guard (`76:2`). SS3, JAMB,
undergraduate, educator, validation, loading, failure, and resume states remain
Figma gaps.

### Flow C: Admission Intelligence

Admission Intelligence resolves academic choices before career mapping.

```text
Admission Intelligence
  -> School mode: choose university -> choose its programme offering
  -> Programme mode: choose programme -> programme preview -> university offerings
  -> Subjects mode: choose subjects -> receive programme guidance
  -> institution-specific overview
  -> requirements / gaps / review notes
  -> connected programme domains
  -> Explore career mapping
```

Student routes: `app/(tabs)/explore/admission/index.tsx`,
`app/(tabs)/explore/admission/[jambName].tsx`,
`src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`,
`AdmissionInsightScreen.tsx`, `ProgrammeOverviewScreen.tsx`, and
`ProgrammeDetailRefinedScreen.tsx`.

Backend evidence: `backend/routes/admission_routes.py`,
`backend/routes/student_pipeline_routes.py`,
`backend/migration_admission_intelligence.sql`,
`migration_subject_catalog.sql`, `migration_subject_rule_records.sql`, and
`migration_student_pipeline_live.sql`.

The three modes are separate decisions, not three labels for the same form.
Requirements are institution-specific. Unsupported Post-UTME, score,
readiness, or market claims must not be invented. Missing or unparsed source
fields are unavailable, not silently filled.

For SS1/SS2, the university list is exploratory and optional. SS3 and JAMB
users see the canonical programme preview first, then the universities offering
that JAMB name, including address where available, and open one university to
inspect its requirements and notes. These journeys do not use programme or
university comparison. Undergraduates remain in the university-first flow;
comparison is only available where the specific account journey and product
surface explicitly support it.

Status: code and product mockups are substantial; Figma has no complete
Admission Intelligence flow. Existing Figma onboarding notes imply admission
context but do not cover all three modes, result states, requirements, or
programme-to-university transitions.

### Flow D: source-backed career exploration

```text
Explore
  -> browse/search programmes, domains, pathways, or admission
  -> programme detail
  -> domain detail
  -> subgroup sections within domain
  -> role detail
  -> save entity | select report branch | open resource | add note
  -> My World or report output
```

Routes: `app/(tabs)/explore/index.tsx`, `domains/index.tsx`,
`domain/[id].tsx`, `programme/[id].tsx`, `role/[id].tsx`, `compare.tsx`,
`elite/index.tsx`, `elite/[id].tsx`, and `pathways/*`.

Screens: `ExploreScreen.tsx`, `DomainExplorerScreen.tsx`,
`DomainDetailScreen.tsx`, `ProgrammeOverviewScreen.tsx`,
`ProgrammeDetailRefinedScreen.tsx`, `ProgrammeCompareScreen.tsx`,
`RoleDetailScreen.tsx`, `ElitePathwaysHubScreen.tsx`,
`ElitePathwayDetailScreen.tsx`, `PathwaysHubScreen.tsx`, and the pathway
screens.

Backend evidence: `backend/routes/career_routes.py` endpoints for programmes,
domains, roles, search, pivot, bridge plans, elite pathways, and resources.

Required hierarchy:

- Domain is the primary catalogue object.
- Subgroups appear as grouped/expandable content inside a domain.
- Roles appear under their source-backed subgroup. Unassigned roles must be
  labelled as other roles, never assigned to a fabricated subgroup.
- Direct, functional, and adjacent describe relationship distance to the
  programme, not ability or employability.
- Source ownership is preserved: domain skills are not shown as role skills just
  because a role has no enrichment row.
- Detail screens show verified metadata and honest missing-data notes.

Each data-backed surface needs pending, real, fallback, empty, coming-soon,
error, and locked variants where the client/backend can produce them. Explore
also supports guest browsing, search, recent search state, and notes.

Status: implemented source-backed code and detailed user-facing mockups exist;
Figma covers only a partial Explore mobile/desktop and Domain Detail mobile
reference (`28:3`, `28:4`, `28:5`). Programme, role, subgroup variants,
compare, pathways, resource, note, save, and data-state variants remain gaps.

### Flow E: skills, skills matching, and learning

These are three distinct products:

1. Legacy Skills / Fields: `SkillsScreen.tsx`, `FieldsScreen.tsx`,
   `src/data/fields.ts`, and `src/data/skills.ts`. It browses fields, tracks,
   labs, estimated hours, and learning actions through compatibility routes
   such as `/fields`, `/skills`, `/skills/quant-map`, and `/skills/interview`.
2. Skills Match: `SkillDiscoveryPanel.tsx` and `careerData.discoverBySkills`
   start from a learned or intended skill/tool/framework/certification and map
   it to domains, subgroups, roles, tools, and credentials. It supports match
   all/match any, quick searches, student starting-point context, and admin
   learner lenses.
3. SkillsBridge: `SkillsBridge.tsx` appears in contextual programme/domain
   mapping. It separates foundations to learn first, domain bridge skills, and
   role-specific skills, with covered versus gap pills.

The current saved entity type union in `src/types/career.ts` includes resource,
not skill. `LearningResourcesBlock.tsx` saves verified resource URLs to My
World. A skill gap itself is not independently saved. Figma must not show a
"save skill" success state until a saved-skill model is added.

Status: all three code paths exist, but the product hierarchy is not fully
reconciled in Figma. The legacy map is hidden from primary shell navigation but
not deleted. Source-backed skill matching is part of Explore. The future
first-class saved-skill checklist is a product gap.

### Flow F: My World and personal persistence

```text
My World
  -> saved programmes/schools/domains/subgroups/roles
  -> Saved learning resources
  -> comparisons and future opportunities/pathways
  -> notes
  -> subscriptions/notifications
  -> legacy learning/game/profile surfaces where enabled
```

Evidence: `src/screens/MyWorldScreen.tsx`,
`src/screens/CareerProfileScreen.tsx`, `src/lib/careerData.ts`,
`backend/routes/career_routes.py`, saved-item migrations, and
`src/lib/learningGate.ts`.

The personal saved entity union is programme, school, domain, subgroup, role,
comparison, opportunity, organisation, elite_pathway, and resource. My World
orders resources under `Saved learning`, opens resource URLs by canonical URL,
and removes items through the backend. Notes may attach to saveable entities or
be global. Save/remove failures must not appear as success.

The legacy learning layer is gated by `withMyWorldLearningGate` and feature
flags. It must not silently replace source-backed career guidance. Empty My
World is a meaningful state with an exploration action, not an error.

Status: implemented in code with partial user-facing mockups; Figma has no My
World saved-learning, notes, subscriptions, empty, remove, offline, or legacy
learning coverage.

### Flow G: guidance report, printing, download, and sharing

```text
Open domain/subgroup/role
  -> select Add to guidance
  -> guidance path persists
  -> report action
  -> HTML document / browser print / PDF or native export / share sheet
```

Evidence: `GuidanceReportButton.tsx`, `DetailScaffold.tsx`,
`PdfExportButton.tsx`, `ShareExportButton.tsx`, `RoleDetailScreen.tsx`,
`DomainDetailScreen.tsx`, `ProgrammeDetailRefinedScreen.tsx`,
`backend/routes/student_pipeline_routes.py`,
`backend/routes/provisioning_routes.py`,
`backend/migration_guidance_report_paths.sql`, and
`docs/mockups/GUIDANCE_REPORT_BEHAVIOUR.md`.

The report includes only explicitly selected branches, not every mapping. It
preserves the academic context, programme/university, requirements, selected
domain -> subgroup -> role path, source-backed skills/tools/certifications, and
only resources the student saved. Bookmarking is independent from report
selection.

States:

- no confirmed path: explain that programme and university resolution is needed;
- confirmed programme with no branch: show academic context and requirements;
- selected domain/subgroup/role: show exactly selected branches;
- guest: explain account creation is required for save/print;
- unavailable/incomplete source: show available fields and data notes;
- browser: open the browser print flow or authenticated report document;
- native export unavailable: show the explicit mobile export-locked message;
- share unavailable: explain that download/print remain available;
- admin target student: require authorisation and use the student's context.

Status: code and report behavior documentation exist. Figma has no report,
selection, export, print, share, or report error-state coverage.

### Flow H: Opportunities

Routes: `app/(tabs)/opportunities/index.tsx`,
`opportunity/[id].tsx`, `organisation/[id].tsx`, `scholarships/index.tsx`, and
`windows/index.tsx`; screens are `OpportunitiesScreen.tsx`,
`OpportunityDetailScreen.tsx`, `OrganisationProfileScreen.tsx`,
`ScholarshipsScreen.tsx`, and `ApplicationWindowsScreen.tsx`.

Backend evidence: `career_routes.py` opportunities, organisations,
scholarships, application-windows, subscriptions, and application-window
types; opportunity migrations and data validation documents.

The hub may render verified live opportunities, a fallback/reduced list, or an
honest coming-soon/empty state. A future or empty surface must not be labelled
Jobs, market demand, or employment prediction. Save and subscribe are separate
actions and require real backend confirmation. Detail routes must be locked or
empty when the referenced row is not real.

Status: routes and state-aware code exist, but the product is not necessarily
populated. Figma has no Opportunities coverage. This is a P1 design gap once
verified rows and release scope exist.

### Flow I: educator/admin workspace

```text
Educator onboarding
  -> organisation/access/verification
  -> admin home/dashboard
  -> roster/provision students
  -> claim/affiliate/consent
  -> start guidance session or workspace Explore
  -> view student guidance/report
  -> institution intelligence and feedback
```

Routes include `app/(admin)/dashboard.tsx`, `students.tsx`,
`students/[userId]/guidance.tsx`, `guidance.tsx`, `session.tsx`,
`verify.tsx`, `affiliation.tsx`, `feedback.tsx`, `skills-gap.tsx`,
`domain-reach.tsx`, `market-intelligence.tsx`, `peers.tsx`,
`expert-dossier.tsx`, and the separate `workspace-explore/*` stack.

Screens include `AdminShell`, `GeneralDashboardScreen`,
`StudentProvisioningScreen`, `SchoolGuidanceDashboardScreen`,
`SessionModeScreen`, `VerificationScreen`, `AffiliationScreen`,
`SkillsGapScreen`, `DomainReachAuditScreen`, `MarketIntelligenceScreen`,
`PeersScreen`, `ExpertDossierScreen`, `AdminFeedbackScreen`, and shared admin
detail screens.

Backend evidence: `institutions_routes.py`, `provisioning_routes.py`,
`student_pipeline_routes.py`, institution/provisioning/consent/verification
migrations, and admin escalation/access tests.

Required behavior:

- Admin navigation and student navigation are separate information
  architectures.
- Student records are visible only through institution access, claim/affiliate
  rules, and consent where required.
- Provisioning supports drafts, image/document/manual import, review, generate,
  merge candidates, deletion confirmation, codes, and resume.
- Guidance sessions use a target student identity and preserve the student's
  selected branch/report context.
- Verification, intelligence, peers, skills-gap, and market surfaces may be
  `coming_soon`, `locked`, or permission-limited. Admin UI must not imply a
  metric is real when the backend returns a placeholder.
- Admin reports use student-facing guidance content, not unsupported national
  aggregates substituted into an individual report.

Status: substantial code and backend support exist; the supplied Figma file has
no admin dashboard/workspace coverage. This is the highest-priority missing
design area because it cannot be inferred safely from student Explore screens.

### Flow J: profile, settings, school, community, portfolio, and legacy learning

The remaining routes are real product surfaces or compatibility surfaces and
must be documented rather than silently deleted:

- Profile/settings: `ProfileScreen`, `CareerProfileScreen`, `SettingsScreen`,
  `NotificationSettingsScreen`, `PrivacyScreen`, `TermsScreen`, `DiaryScreen`,
  `MySchoolScreen`, and `GitHubScreen`. These include account context, saved
  career data, school sharing, privacy/legal, notifications, notes/diary, and
  portfolio/GitHub connections.
- Community/social: `CommunityScreen`, `GuildScreen`, `LeaderboardScreen`,
  `ReferralScreen`, `FeedScreen`, and community routes. These include feed
  loading/empty/error, subscriptions, reactions, guild/game state, referrals,
  and leaderboard state.
- Portfolio: `PortfolioScreen`, `PortfolioHubScreen`, and portfolio routes.
  These include artifacts, GitHub, sharing, and backend portfolio ownership.
- Legacy learning/game: `WorldScreen`, `IslandMapScreen`, `LessonScreen`,
  `TrackRoomScreen`, `TrackSetupScreen`, `StreaksScreen`,
  `PostIslandTrackSelection`, `LearnMoreScreen`, `CairoBuilderTrackScreen`,
  `EcosystemTrackScreen`, `StarknetTrackScreen`, and related routes. These use
  content manifests, lesson mechanics, XP, badges, streaks, and feature gates.
- Commerce/other: `MerchandiseScreen` and merchandise routes are reward/commerce
  surfaces and are not part of the core admission-to-career path.

These surfaces inherit global auth, `DataState`, error boundary, motion, and
accessibility requirements but have separate backend contracts. They are
preserved under compatibility routes and should be folded into My World only as
an explicit product migration, not by changing a label in Figma.

Status: code exists for most surfaces; coverage in the supplied Figma file is
missing. Existing tests cover selected mechanics but do not constitute a full
end-to-end product behavior suite.

## Screen-by-screen behavior contracts

The following registry is the required implementation contract for every
user-facing screen. A route wrapper delegates to the screen component named in
the same record; wrapper-only routes are listed in the route alias appendix.

Where one heading names several screens, the contract applies to each named
screen individually. The screens share the listed behavior only where their
route, data, permission, persistence, and Figma fields are genuinely the same;
the route/evidence and acceptance lines identify the screen-specific override.
Helper exports that are not mounted as routes are explicitly classified in the
component/system section rather than silently counted as screens.

Every record inherits the following complete defaults and then supplies its
screen-specific values:

- `states`: data screens expose idle, pending/loading, real, fallback, empty,
  coming-soon, locked, error, offline, retry, and validation as applicable;
  action controls additionally expose selected, saving, saved, removing,
  success, and destructive-confirmation states;
- `data`: the listed client/endpoint is the source; source ownership and
  verification metadata must remain visible when data is partial or unavailable;
- `navigation`: entry and exit destinations are explicit in each record; back
  returns to the actual caller context, not generic Home;
- `persistence`: authenticated durable writes use the listed client/backend;
  local drafts are resumed; offline or non-real responses never claim durable
  success;
- `permissions`: account type, authentication, consent, institution access, and
  target-student access are enforced before rendering protected actions;
- `feedback`: every submit/save/remove/share/print/verify/delete action reports
  pending, success, and recoverable failure when the implementation can produce
  them;
- `motion`: shared motion primitives are used and reduced-motion removes
  non-essential transitions without hiding state;
- `accessibility`: every input/control has a role, name, focus path, and
  selected/checked/expanded/busy state; validation is associated with its field;
- `acceptance`: a screen is complete only when the user can perform its real
  product action through a verified data path and recover from every documented
  failure state;
- `decision`: where current code is incomplete, contradictory, obsolete, or
  poorly designed, record `current behavior`, `problem`, `recommended behavior`,
  `evidence/tradeoff`, and mark the recommendation `proposed` rather than
  implemented;
- `Figma`: the record names the existing node or says `missing`; required
  frames/variants/annotations are part of the design backlog, not inferred from
  the happy-path screenshot.

### Authentication, legal, and onboarding screen contracts

#### `AuthScreen`

- Route/evidence: `app/(auth)/sign-in.tsx:1-4`; `src/screens/AuthScreen.tsx:54`.
- Persona/entry/purpose: guest or returning user enters credentials; establish a
  verified session and route to the preserved destination, onboarding, student
  home, or admin home.
- UI/components: `AuthScaffold`, auth fields, password/recovery links, submit
  action, provider/legal affordances, `ErrorNote`.
- Actions/exits: submit -> authenticated redirect; forgot password -> reset;
  signup -> signup; back -> landing/auth boundary.
- States/data: idle, field validation, submitting, invalid credentials, network
  error, locked/disabled account, success; auth client/session endpoint is the
  verification source.
- Persistence/permissions/feedback: no password persistence; pending redirect
  is preserved; feedback must not reveal whether an unsafe account exists;
  guest and authenticated sessions are distinct.
- Motion/a11y: focus first invalid field, label password visibility and submit
  busy state, support keyboard submit, respect reduced motion.
- Acceptance/status/Figma: real sign-in routes correctly and recovers from
  failure; implemented/partial; Figma missing sign-in, loading, failure, and
  redirect variants.

#### `SignUpScreen`

- Route/evidence: `app/(auth)/signup.tsx:24-35,84-152`;
  `src/screens/SignUpScreen.tsx:125`.
- Persona/entry/purpose: new user creates an account before onboarding.
- UI/components: identity fields, DOB, email/password/confirmation, optional
  school and claim codes, legal footer, terms/privacy overlays, verification
  code field and submit controls.
- Actions/exits: validate -> send code -> verify -> account gate; sign in ->
  sign-in; terms/privacy -> modal and return; back -> landing.
- States/data: idle, field validation, duplicate email, code sent, code rejected,
  expired/resend, network failure, success; auth/email-verification backend is
  authoritative.
- Persistence/permissions/feedback: retain safe draft fields through legal
  modal and code retry; legal acceptance is explicit; never claim account success
  before verification.
- Motion/a11y: field errors are announced and linked; code entry exposes digit
  semantics and busy state; reduced motion removes sheet transitions.
- Acceptance/status/Figma: verified account reaches gate with optional codes
  preserved; implemented/partial; Figma `75:2` covers only send/sent/rejected,
  so legal, validation, expiry, and network variants are required.

#### `ForgotPasswordScreen`

- Route/evidence: `app/(auth)/forgot-password.tsx:1-4`;
  `src/screens/ForgotPasswordScreen.tsx:10`.
- Persona/entry/purpose: unauthenticated user requests account recovery.
- UI/components: email field, submit, result/error note, back/sign-in link.
- Actions/exits: submit -> neutral sent state or retryable failure; sign-in ->
  sign-in; back -> previous auth screen.
- States/data: idle, validation, submitting, sent, invalid/network error; reset
  endpoint/provider is authoritative.
- Persistence/permissions/feedback: email is local ephemeral state only; use
  non-enumerating copy; no authenticated permission required.
- Motion/a11y: focus email/error, announce sent/error, expose busy state.
- Acceptance/status/Figma: request completes without hanging on stale session;
  implemented; Figma missing.

#### `TermsScreen` and `PrivacyScreen`

- Route/evidence: `src/screens/AuthScreen.tsx:380-381,564-565`;
  `app/(auth)/signup.tsx:34-35,234-249`; `src/components/LegalAcceptanceGate.tsx:8-166`;
  `src/screens/TermsScreen.tsx:35`; `src/screens/PrivacyScreen.tsx:74`.
- Persona/entry/purpose: public or signup user reads legal content without
  losing the originating flow.
- UI/components: scrollable sections, section navigation, close/back, read-to-end
  tracking, legal modal wrapper.
- Actions/exits: close -> originating screen; section selection -> anchored
  scroll; acceptance is handled by signup/legal gate, not legal content itself.
- States/data: static content, scroll/loading if future remote content fails;
  local document source is authoritative for current copy.
- Persistence/permissions/feedback: preserve signup draft and acceptance state;
  no account permission required.
- Motion/a11y: headings and section labels are navigable; restore focus on close;
  scrolling is not the only way to find a section.
- Acceptance/status/Figma: user can read and return without losing signup or
  legal-gate context; implemented as modal-backed auth/legal content, but no
  standalone public Terms or Privacy route/public landing link exists. The
  privacy copy also retains a production-placeholder operator-address fallback;
  Figma coverage is missing.

#### `AccountTypeGate`

- Route/evidence: `app/(auth)/onboarding.tsx:1`;
  `src/screens/onboarding/AccountTypeGate.tsx:98`.
- Persona/entry/purpose: authenticated user selects one of the six visible
  personas to establish the correct flow.
- UI/components: account cards, selected state, continue CTA, explanatory copy,
  exit/back guard.
- Actions/exits: select -> selected; continue -> matching setup form; back/exit
  -> guard; dormant professional/skilled-worker/graduate types remain absent.
- States/data: idle, selected, pending account-type persistence, validation,
  error, completed; account type/profile client is authoritative.
- Persistence/permissions/feedback: save selected type to onboarding draft and
  resume; authenticated user only; show retry when save is non-real.
- Motion/a11y: cards expose radio/selected state, keyboard focus, descriptive
  labels, and no motion-only confirmation.
- Acceptance/status/Figma: only SS1, SS2, SS3, JAMB, undergraduate, educator
  appear; implemented/partial; Figma `76:2` covers gate/picker but not all
  state variants.

#### `OnboardingFlow`, `OnboardingScreen`, and `SeniorSecondaryExploreSetupForm`

- Route/evidence: `app/(auth)/onboarding.tsx:1`; `src/screens/OnboardingFlow.tsx:88`;
  `src/screens/OnboardingScreen.tsx:179`;
  `src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx`.
- Persona/entry/purpose: SS1, SS2, or SS3 student completes class-specific
  school, stream, subjects, intent, and programme guidance setup.
- UI/components: stepper, school/live search, stream selector, subject chips,
  intent selector, school code, validation notes, continue-later/exit guard.
- Actions/exits: select/validate -> next setup step; search -> selected record;
  continue -> Admission Intelligence or home; back -> prior step/guard.
- States/data: draft loading, search pending/no-result/error, selected, required
  subject validation, save pending/success/failure, offline resume; starting
  point, subject, school, and onboarding-draft endpoints are authoritative.
- Persistence/permissions/feedback: local draft plus authenticated draft API;
  restore exact step and values; report honest save failure.
- Motion/a11y: stepper announces progress, chips expose selected/disabled state,
  errors associate with fields, reduced motion supported.
- Acceptance/status/Figma: each visible class reaches its correct academic flow
  without losing draft; implemented/partial; Figma `76:2` only partially covers
  SS1/SS2 and needs SS3/validation/resume variants.

#### `JambSetupForm` and `CurrentStudentSetupForm`

- Route/evidence: `src/components/onboarding/JambSetupForm.tsx`;
  `src/components/onboarding/CurrentStudentSetupForm.tsx`;
  `src/screens/OnboardingFlow.tsx:88`.
- Persona/entry/purpose: JAMB candidate resolves subjects/programmes/university;
  undergraduate resolves current university and offering.
- UI/components: institution/programme live search, subject multiselect, faculty
  filtering, code/affiliation fields, validation and review summary.
- Actions/exits: choose university/programme -> requirements/overview; subjects
  -> programme guidance; continue -> Admission Intelligence/career home;
  back -> prior setup/guard.
- States/data: live search pending/no results/error, selected, institution-scoped
  programme, requirements real/fallback/partial, validation, offline draft;
  student pipeline/admission endpoints are authoritative.
- Persistence/permissions/feedback: starting point and onboarding draft resume;
  optional school code does not block completion; errors explain retry.
- Motion/a11y: typeahead results, combobox semantics, selected chips, labels and
  focus restoration are required.
- Acceptance/status/Figma: JAMB and undergraduate contexts never get conflated;
  implemented/partial; Figma missing both complete flows.

#### `EducatorOnboarding`

- Route/evidence: `src/screens/admin/EducatorOnboarding.tsx:131-322`.
- Persona/entry/purpose: educator/institution user establishes organisation,
  role, access, and verification before admin workspace.
- UI/components: four-step organisation/access/verification/confirmation flow,
  org search, access code, registry/work email, error and completion states.
- Actions/exits: choose org -> details -> validate access -> submit verification
  -> admin home; back -> prior step; request access -> external email flow.
- States/data: draft loading, access pending/invalid, proof required, submit
  pending/error, verification claimed/pending/success; institution/profile and
  verification endpoints are authoritative.
- Persistence/permissions/feedback: profile draft restores; admin routes require
  account type and permissions; no workspace access claim before verification.
- Motion/a11y: stepper and status live regions, labelled inputs, code errors,
  keyboard navigation, reduced motion.
- Acceptance/status/Figma: successful completion routes to admin profile home;
  implemented; Figma missing.

### Admission Intelligence and career-intelligence screen contracts

The following records use the same complete field order as the authentication
records above. They are intentionally explicit about the source-backed action
boundary: academic resolution first, career interpretation second.

#### `AdmissionBrowseScreen`

- Route/evidence: `app/(tabs)/explore/admission/index.tsx:1-4`;
  `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx:140`.
- Persona/entry/purpose: SS1/SS2/SS3/JAMB/undergraduate or educator session
  chooses the Admission Intelligence discovery door.
- UI/components: mode tabs/cards for school, programme, and subjects; live search,
  filters, result cards, selection summary, continue CTA.
- Actions/exits: choose mode -> query; select record -> next step; continue ->
  programme preview; preview -> university offerings or optional career
  guidance; back -> Explore or admin session.
- States/data: pending/no results/error/real/fallback/validation/locked; admission
  and student-pipeline endpoints plus source dates are authoritative.
- Persistence/permissions/feedback: save query/selection in starting-point and
  resume; admin target context is preserved; explain source gaps and retry.
- Motion/a11y: tabs expose selected, search is labelled combobox, results announce
  counts, keyboard focus remains in context.
- Acceptance/status/Figma: all three modes resolve through distinct flows;
  implemented/partial; Figma missing.

#### `AdmissionInsightScreen`

- Route/evidence: `app/(tabs)/explore/admission/[jambName].tsx:1-12`;
  `src/screens/careerIntelligence/AdmissionInsightScreen.tsx:62`.
- Persona/entry/purpose: student or authorised educator reviews one admission
  programme/university result and decides whether to continue.
- UI/components: result header, canonical programme context, university
  offering context, requirements, subject match/gaps, source notes, save and
  continue actions. Comparison is not shown in SS1/SS2/SS3/JAMB journeys.
- Actions/exits: select offering -> programme detail; save -> My World where
  supported; continue -> domain guidance where the journey allows it; back ->
  browse.
- States/data: real, partial requirements, fallback, pending, empty/error/locked;
  institution-specific admission endpoints are authoritative.
- Persistence/permissions/feedback: saved programme/comparison and starting point
  use backend confirmation; guest can preview but cannot claim saved.
- Motion/a11y: headings, requirement lists, expandable notes and CTA status are
  announced; reduced motion.
- Acceptance/status/Figma: never invent unsupported scores/Post-UTME;
  implemented/partial; Figma missing.

#### `ProgrammeOverviewScreen` and `ProgrammeDetailRefinedScreen`

- Route/evidence: `app/(tabs)/explore/programme/[id].tsx:1-6`;
  `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx`;
  `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx:96-199`.
- Persona/entry/purpose: student understands a specific programme offering and
  its academic-to-career mapping.
- UI/components: programme header, institution context, overview, requirements,
  domains, guidance/report action, save, notes, resources, PDF/share scaffold.
- Actions/exits: open domain -> domain detail; save -> My World; add guidance ->
  report path; print/share -> report; change offering -> the university-options
  list. Do not imply that a university offers a different programme version;
  requirements, notes and location are the university-specific differences.
- States/data: pending/real/partial/fallback/empty/error/locked; career and
  student-pipeline programme endpoints with source metadata are authoritative.
- Persistence/permissions/feedback: programme/save/guidance path persists;
  report selection is separate from card save; target student requires admin
  access.
- Motion/a11y: section headings and accordions expose expanded state, actions have
  labels, report busy state announced.
- Acceptance/status/Figma: current programme context survives navigation and
  report; implemented/partial; Figma missing.

#### `DomainExplorerScreen`

- Route/evidence: `app/(tabs)/explore/domains/index.tsx:1-4`;
  `src/screens/careerIntelligence/DomainExplorerScreen.tsx:51`.
- Persona/entry/purpose: student or educator browses source-backed domains and
  reaches a domain detail.
- UI/components: search/filter, domain cards, relationship badges, data-state
  view, admin/student lens.
- Actions/exits: search/filter -> results; open card -> domain detail; back ->
  Explore/admission context.
- States/data: pending, real, fallback, empty, coming_soon, error, locked; career
  domains endpoint and source metadata are authoritative.
- Persistence/permissions/feedback: search may use recent-search storage; no false
  save; admin lens requires workspace permission.
- Motion/a11y: filter chips selected state, card labels, result count/live region.
- Acceptance/status/Figma: only verified domains appear as real; implemented;
  Figma missing.

#### `DomainDetailScreen`

- Route/evidence: `app/(tabs)/explore/domain/[id].tsx:1-6`;
  `src/screens/careerIntelligence/DomainDetailScreen.tsx:68-97`.
- Persona/entry/purpose: student understands a domain and chooses subgroup/role
  branches for exploration and report.
- UI/components: domain header, relationship explanation, subgroup accordions,
  role clusters, SkillsBridge, resources, notes, SaveButton,
  GuidanceReportButton, DetailScaffold, PDF/share.
- Actions/exits: expand subgroup -> roles; open role -> role detail; save domain;
  add/remove guidance; save/open resource; add note; back -> prior catalogue.
- States/data: pending/real/partial/fallback/empty/error/locked/offline; domain,
  subgroup, role, skills, resources and report endpoints are authoritative.
- Persistence/permissions/feedback: domain save, guidance branch, resource URL,
  and notes persist independently; guest sees account explanation.
- Motion/a11y: accordion expanded state, action labels, resource link roles,
  save/report busy states, reduced motion.
- Acceptance/status/Figma: subgroups stay inside domain and only selected branches
  enter reports; implemented/partial; Figma partial `28:4`, missing state/action
  variants.

#### `RoleDetailScreen`

- Route/evidence: `app/(tabs)/explore/role/[id].tsx:1-6`;
  `src/screens/careerIntelligence/RoleDetailScreen.tsx:51-87`.
- Persona/entry/purpose: student understands a source-backed role's work, skills,
  tools, certifications, resources, and relationship to the selected domain.
- UI/components: DetailScaffold, role-owned enrichment, SkillsBridge/role skills,
  resources, notes, SaveButton, GuidanceReportButton, PDF/share.
- Actions/exits: save role, select/remove guidance, open/save resource, add note,
  back -> subgroup/domain; report -> export/share.
- States/data: real/partial/no enrichment/fallback/pending/error/locked/offline;
  role endpoint and role-owned tools/certifications/resources are authoritative.
- Persistence/permissions/feedback: role save, guidance, resources and notes
  remain separate; admin target report requires access; non-real actions show
  notices.
- Motion/a11y: role heading hierarchy, labelled action buttons, resource links,
  focus/error recovery, reduced motion.
- Acceptance/status/Figma: role-owned data is never fabricated from domain data;
  implemented/partial; Figma missing.

#### `ProgrammeCompareScreen`

- Route/evidence: `app/(tabs)/explore/compare.tsx:1-4`;
  `src/screens/careerIntelligence/ProgrammeCompareScreen.tsx:78`.
- Persona/entry/purpose: student compares selected programmes/university offerings
  before saving or choosing a path.
- UI/components: comparison header, selected cards/table, requirements/context,
  remove/select controls, save comparison, continue.
- Actions/exits: add/remove candidate -> comparison; select -> programme detail;
  save -> My World; back -> admission/explore.
- States/data: empty, one-item, full, pending, real, partial, error, locked;
  programme/admission endpoints and saved comparison client are authoritative.
- Persistence/permissions/feedback: comparison selection is local until saved;
  saved result is backend-confirmed; guest receives save explanation.
- Motion/a11y: table/card semantics, remove confirmation, selected labels, focus
  restoration after removal.
- Acceptance/status/Figma: comparison never overwrites current programme by
  accident; implemented/partial; Figma missing.

#### `PathwaysHubScreen`, `ElitePathwaysHubScreen`, and `ElitePathwayDetailScreen`

- Route/evidence: `app/(tabs)/explore/pathways/*`, `elite/*` route files;
  `src/screens/careerIntelligence/PathwaysHubScreen.tsx:84`,
  `ElitePathwaysHubScreen.tsx:5`, `ElitePathwayDetailScreen.tsx:9`.
- Persona/entry/purpose: student or authorised educator explores credential,
  career-change, entrepreneurship, PhD, upgrade, or elite routes.
- UI/components: pathway tabs/sections, cards, detail requirements, save,
  source/status badges, back/continue.
- Actions/exits: choose pathway -> detail/embedded context; save -> My World;
  programme/domain context may be passed into entrepreneurship; back -> Explore.
- States/data: pending/real/fallback/coming_soon/locked/empty/error; career
  pathway/elite endpoints and requirement metadata are authoritative.
- Persistence/permissions/feedback: saved pathway only after backend confirmation;
  admin route retains workspace context; no qualification claims from placeholders.
- Motion/a11y: tabs selected, cards labelled, requirement sections expandable,
  reduced motion.
- Acceptance/status/Figma: route-specific requirement focus is preserved;
  implemented/partial; Figma missing.

#### `CareerChangerScreen`, `QualificationUpgradesScreen`, `CharteredCredentialsScreen`, `PhdPathwayScreen`, and `EntrepreneurshipPathwayScreen`

- Route/evidence: pathway route files under `app/(tabs)/explore/pathways`;
  `src/screens/careerIntelligence/CareerChangerScreen.tsx:88`,
  `QualificationUpgradesScreen.tsx:5`, `CharteredCredentialsScreen.tsx:5`,
  `PhdPathwayScreen.tsx:5`, `EntrepreneurshipPathwayScreen.tsx:101`.
- Persona/entry/purpose: intentionally entered pathway user explores a specific
  route distinct from the canonical admission-to-career journey.
- UI/components: route-specific requirements/cards, context banner, source notes,
  save/continue/back, and shared pathway primitives.
- Actions/exits: inspect requirement -> external/source detail; save pathway;
  continue to programme/domain/opportunity where supported; back to pathway hub.
- States/data: real/fallback/coming_soon/locked/pending/error/empty; pathway,
  credentials, entrepreneurship, and career-change clients/endpoints govern data.
- Persistence/permissions/feedback: preserve passed programme/domain context;
  save/feedback is truthful; dormant persona types are not made visible by these
  routes.
- Motion/a11y: selected sections, headings, links, focus/error states, reduced
  motion.
- Acceptance/status/Figma: route never masquerades as Admission Intelligence;
  implemented/partial; Figma missing.

#### `OpportunitiesScreen`, `OpportunityDetailScreen`, `OrganisationProfileScreen`, `ScholarshipsScreen`, and `ApplicationWindowsScreen`

- Route/evidence: `app/(tabs)/opportunities/index.tsx:1-4`,
  `opportunity/[id].tsx:1-6`, `organisation/[id].tsx:1-6`,
  `scholarships/index.tsx:1-4`, `windows/index.tsx:1-4`;
  corresponding screens at `src/screens/OpportunitiesScreen.tsx:70`,
  `src/screens/careerIntelligence/OpportunityDetailScreen.tsx:91`,
  `OrganisationProfileScreen.tsx:41`, `ScholarshipsScreen.tsx:31`,
  `ApplicationWindowsScreen.tsx:33`.
- Persona/entry/purpose: student or authorised user browses verified
  opportunities, funding, organisations, and application windows.
- UI/components: search/filter, opportunity cards, detail/source fields, save,
  subscribe, date/status badges, empty/coming-soon panels.
- Actions/exits: search/filter -> results; open -> detail; save/subscribe -> My
  World/notifications; back -> Opportunities hub.
- States/data: pending, real, fallback, coming_soon, empty, locked, error,
  offline; career opportunity/organisation/scholarship/window endpoints and
  dates/source metadata are authoritative.
- Persistence/permissions/feedback: save/subscription is separate and backend
  confirmed; no data rows means honest not-live copy; admin may have different
  permission lens.
- Motion/a11y: filters selected, dates/status announced, subscribe/save busy and
  error state, reduced motion.
- Acceptance/status/Figma: never use Jobs or make employment claims from empty
  data; implemented/state-gated; Figma missing.

### Educator/admin screen contracts

Admin screens inherit the student data-state rules but add organisation access,
verification, consent, target-student, and role permissions. Their shell and
navigation are not student navigation.

#### `AdminShell`, `GeneralDashboardScreen`, and `InstitutionProfileScreen`

- Route/evidence: `app/(admin)/_layout.tsx:43-49`,
  `app/(admin)/dashboard.tsx:1-4`, `app/(admin)/workspace-profile.tsx:1-4`;
  `src/screens/admin/AdminShell.tsx:111`, `GeneralDashboardScreen.tsx:86`,
  `InstitutionProfileScreen.tsx:62`.
- Persona/entry/purpose: verified educator/institution member enters the admin
  workspace to understand organisation status and choose an operational task.
- UI/components: admin sidebar/header, organisation identity, verification/access
  status, metric cards, roster/guidance/workspace Explore links, sign-out.
- Actions/exits: dashboard -> students/session/intelligence/feedback; profile ->
  verification/settings; sidebar preserves admin route; sign-out -> sign-in.
- States/data: auth/profile hydration, verification pending/claimed/rejected,
  permission locked, metrics real/fallback/coming_soon/error; institution and
  admin-profile endpoints are authoritative.
- Persistence/permissions/feedback: admin resume route persists; role/org access
  is checked before data; route changes and sign-out report failures honestly.
- Motion/a11y: sidebar selected state, focus order, landmark headings, metric
  labels and reduced-motion transitions.
- Acceptance/status/Figma: admin user never lands in student shell and cannot
  see unauthorised data; implemented/partial; Figma missing admin system.

#### `StudentManagementScreen` and `StudentProvisioningScreen`

- Route/evidence: `app/(admin)/students.tsx:1-10`;
  `src/screens/admin/StudentManagementScreen.tsx:43`,
  `StudentProvisioningScreen.tsx:108-260,602-910`.
- Persona/entry/purpose: institution operator reviews roster and provisions or
  manages students.
- UI/components: roster tabs, filters, student rows, import/manual/upload draft
  flow, review table, merge candidates, selection checkboxes, delete dialog,
  consent request, generated cards and report actions.
- Actions/exits: load roster -> student guidance; import -> extract/review ->
  generate; merge -> confirm/dismiss; select -> delete confirmation; request
  consent -> pending/result; generated student -> guidance/login card.
- States/data: loading, empty roster, upload permission/error, draft pending,
  review validation, generate pending/error, merge, delete confirmation, consent
  pending/success/failure; provisioning routes and migrations are authoritative.
- Persistence/permissions/feedback: local and server drafts resume; deletion is
  explicit and permission-bound; generated student codes/reports are not shown as
  complete before backend response.
- Motion/a11y: checkbox selected state, confirmation dialog focus trap, table
  headings, upload progress, live notices, reduced motion.
- Acceptance/status/Figma: operator can safely provision, merge, or delete only
  permitted records; implemented/partial; Figma missing.

#### `AffiliationScreen`, `VerificationScreen`, and `AdminFeedbackScreen`

- Route/evidence: `app/(admin)/affiliation.tsx:1-6`, `verify.tsx:1-6`,
  `feedback.tsx:1-7`; `src/screens/admin/AffiliationScreen.tsx:48`,
  `VerificationScreen.tsx:101`, `AdminFeedbackScreen.tsx:65`.
- Persona/entry/purpose: educator establishes school affiliation, submits proof,
  or reports a product/data issue.
- UI/components: institution/code form, proof upload/status tiers, feedback
  category/message, submit and recovery controls.
- Actions/exits: validate affiliation -> status; upload proof -> review; submit
  feedback -> confirmation; back -> admin dashboard/profile.
- States/data: idle, validation, access-code pending/invalid, upload permission,
  proof pending/accepted/rejected, submit pending/error/success; institution and
  feedback endpoints/migrations are authoritative.
- Persistence/permissions/feedback: proof/affiliation/feedback only persists on
  backend confirmation; preserve form on retry; sensitive proof access is scoped.
- Motion/a11y: upload button labels, error association, progress/status live
  region, confirmation focus, reduced motion.
- Acceptance/status/Figma: user can see exactly whether access/proof/feedback was
  accepted; implemented/partial; Figma missing.

#### `SchoolGuidanceDashboardScreen`, `SessionModeScreen`, and `AdminCareerDetailScreen`

- Route/evidence: `app/(admin)/guidance.tsx:1-4`, `session.tsx:1-5`,
  `workspace-explore/domain/[id].tsx:1-6`, `programme/[id].tsx:1-6`,
  `role/[id].tsx:1-6`; `src/screens/admin/SchoolGuidanceDashboardScreen.tsx:95`,
  `SessionModeScreen.tsx:43`, `AdminCareerDetailScreen.tsx:161`.
- Persona/entry/purpose: educator selects a guidance mode, views institution
  progress, or inspects a shared catalogue entity in student context.
- UI/components: session mode choices, target student/context banner, dashboard
  summaries, admin shell, shared catalogue detail, guidance/report actions.
- Actions/exits: choose subject/programme/school mode -> workspace Explore;
  choose student -> guidance/report; open entity -> shared detail; back -> exact
  admin caller.
- States/data: profile loading, no roster, consent required, target locked,
  real/fallback/coming_soon/error; institution, provisioning, career, and
  student-pipeline endpoints are authoritative.
- Persistence/permissions/feedback: selected target and session context persist
  only within authorised admin resume; report uses target student ID; notices are
  truthful for consent or missing data.
- Motion/a11y: context is announced at route changes, mode cards selected state,
  detail accordions and report controls labelled, reduced motion.
- Acceptance/status/Figma: admin never silently edits a student's current path;
  implemented/partial; Figma missing.

#### `AdminExploreIntro`

- Route/evidence: `app/(admin)/workspace-explore/index.tsx:3-50`;
  `src/screens/admin/AdminExploreIntro.tsx:14`.
- Persona/entry/purpose: verified educator entering the admin catalogue Explore
  sees why this workspace is separate and chooses an admission/career discovery
  mode before catalogue results load.
- UI/components: admin context banner, intro explanation, mode/action cards,
  organisation/student context, shared Explore shell.
- Actions/exits: choose mode -> workspace admission/pathway/search; continue or
  dismiss -> Explore results; back -> admin dashboard.
- States/data: profile hydration, no organisation/permission locked, mode selected,
  pending, error/retry; admin profile and session context are authoritative.
- Persistence/permissions/feedback: preserve admin context and target student;
  do not show student-only save/report actions without permission; dismissal is
  local/session state unless the code persists it.
- Motion/a11y: cards expose selected state, context is announced, focus returns
  after dismissal, reduced motion.
- Acceptance/status/Figma: admin intro never routes into the student shell or
  hides the target context; implemented/partial; Figma missing.

#### `DomainReachAuditScreen`, `MarketIntelligenceScreen`, `PeersScreen`, `SkillsGapScreen`, `ProgrammeDashboardScreen`, `ProgrammeDemandTable`, `DomainRankPanel`, and `IntelligenceAlerts`

- Route/evidence: `app/(admin)/domain-reach.tsx:1-6`, `market-intelligence.tsx:1-7`,
  `peers.tsx:1-5`, `skills-gap.tsx:1-5`, `src/screens/admin/DomainReachAuditScreen.tsx:78`,
  `MarketIntelligenceScreen.tsx:726`, `PeersScreen.tsx:21`,
  `SkillsGapScreen.tsx:51`, `ProgrammeDashboardScreen.tsx:55`,
  `ProgrammeDemandTable.tsx:189`, `DomainRankPanel.tsx:37`,
  `IntelligenceAlerts.tsx:43`.
- Persona/entry/purpose: authorised institution or staff user reviews aggregated
  reach, demand, programme, peer, skills-gap, and alert intelligence.
- UI/components: admin shell, stat cards/tables, filters, charts/rank panels,
  source/date labels, alerts, `ComingSoonPanel`, retry and export/share where
  implemented.
- Actions/exits: select institution/filter -> refresh dataset; expand table/row
  -> detail; alert -> relevant student/catalogue route; back -> dashboard.
- States/data: loading, real, fallback, coming_soon, empty, permission locked,
  stale/error, retry; institution intelligence endpoints and source metadata are
  authoritative.
- Persistence/permissions/feedback: filters may remain local; no metric is saved
  as fact without source response; coming-soon panels explain release/data gate.
- Motion/a11y: tables have headers and sort/filter labels, charts have text
  summaries, alerts announce severity, reduced motion.
- Acceptance/status/Figma: admin sees only permitted, dated, correctly scoped
  aggregates; implemented/partial/coming_soon depending endpoint; Figma missing.

#### `ExpertDossierScreen`

- Route/evidence: `app/(admin)/expert-dossier.tsx:1-7`;
  `src/screens/admin/ExpertDossierScreen.tsx:80-308`.
- Persona/entry/purpose: authorised expert flags a mapping/data relationship and
  proposes a correction.
- UI/components: edge-type selector, source/target fields, required problem,
  optional correction, submit and status note.
- Actions/exits: choose edge -> enter evidence -> submit -> success/error;
  back -> admin dashboard or originating detail.
- States/data: idle, validation, submit pending, success, permission/error; admin
  mapping-flag endpoint is authoritative.
- Persistence/permissions/feedback: only submitted after backend confirmation;
  retain draft on failure; role permission required.
- Motion/a11y: radio selected state, field error association, submit busy status,
  focus recovery, reduced motion.
- Acceptance/status/Figma: correction is traceable and never silently mutates
  catalogue data; implemented; Figma missing.

### Student home, profile, settings, and personal-data screen contracts

#### `CareerHomeScreen`, `HomeScreen`, `CareerProfileScreen`, `ProfileScreen`, and `MyWorldScreen`

- Route/evidence: `app/(tabs)/home/index.tsx:1-4`, `app/(tabs)/map/index.tsx:1-5`,
  `app/(tabs)/profile/index.tsx:1-4`, `app/(tabs)/myworld/index.tsx:1-4`,
  `app/(tabs)/myworld/game-profile.tsx:1-8`; screen exports at
  `src/screens/CareerHomeScreen.tsx:216`, `HomeScreen.tsx:279`,
  `CareerProfileScreen.tsx:89`, `ProfileScreen.tsx:142`,
  `MyWorldScreen.tsx:225`.
- Persona/entry/purpose: signed-in student sees current academic context, career
  continuation, profile, saved data, and personal learning gateway.
- UI/components: starting-point card, quick actions, saved/bookmarked groups,
  notes, subscriptions, profile/settings links, `DataStateView`, learning gate.
- Actions/exits: continue mapping -> programme/domain; saved item -> its detail;
  resource -> URL; notes/settings/profile -> respective routes; legacy cards use
  gated compatibility routes.
- States/data: hydration, real/partial/fallback, empty, locked, coming_soon,
  offline, error/retry; career profile, saved, notes, subscription, starting-point
  clients are authoritative.
- Persistence/permissions/feedback: saved items/resources/notes/subscriptions
  refetch on focus; local starting-point/offline fallback; guest sees locked save
  actions; remove is confirmed and backend-backed.
- Motion/a11y: selected navigation, grouped headings, list/card labels, note
  dialog focus, empty-state action, reduced motion.
- Acceptance/status/Figma: My World is the destination for saved context and
  legacy learning; implemented/partial; Figma missing.

#### `DiaryScreen`, `NotificationSettingsScreen`, `SettingsScreen`, `MySchoolScreen`, and `GitHubScreen`

- Route/evidence: `app/(tabs)/profile/diary.tsx:1-4`, `github.tsx:1-4`,
  `app/(tabs)/settings/index.tsx:1-4`, `my-school.tsx:1-4`;
  `src/screens/DiaryScreen.tsx:241`, `NotificationSettingsScreen.tsx:40`,
  `SettingsScreen.tsx:46`, `MySchoolScreen.tsx:66`, `GitHubScreen.tsx:1017`.
- Persona/entry/purpose: signed-in student manages notes/diary, notifications,
  account settings, school sharing, or GitHub/portfolio connection.
- UI/components: settings rows, toggles, notes editor/list, school consent/share
  controls, GitHub connection and artifact controls.
- Actions/exits: edit/toggle/submit -> backend result; link GitHub -> provider
  flow; share school -> consent; back -> profile/My World.
- States/data: hydration, local validation, pending, success, denied/consent,
  offline, error, empty; respective profile, school, feedback, portfolio,
  notification, or GitHub clients are authoritative.
- Persistence/permissions/feedback: settings and notes persist only after
  confirmation; consent is revocable; preserve drafts on recoverable errors.
- Motion/a11y: switches expose checked, text fields labels/errors, dialogs trap
  focus, external links identify destination, reduced motion.
- Acceptance/status/Figma: user knows what is local, synced, shared, or revoked;
  implemented/partial; Figma missing.

## Component and supporting-system contracts

Screen contracts are not sufficient on their own. The same interaction must
behave consistently wherever it appears, so every reusable behavior-bearing
component and every supporting system must also be audited by this audit. This does not mean
writing a separate contract for every decorative wrapper, icon, artwork asset,
or one-off style fragment. It means documenting any component that owns or
changes user-visible behavior.

### Component contract required for behavior-bearing components

For each reusable component, record:

1. Component path/export and every known consumer screen.
2. UX responsibility and the product decision it enforces.
3. Props, controlled/uncontrolled state, defaults, and event callbacks.
4. Visual structure and semantic HTML/native roles.
5. States: idle, hover/focus/pressed, disabled, busy, selected/checked/expanded,
   error, empty, locked, saved, and destructive confirmation where applicable.
6. Data and side effects: whether it is presentational, client-backed, or
   persistence-bearing; never hide network writes in a visual primitive.
7. Navigation and whether it owns a route or emits an intent to the screen.
8. Feedback, retry, cancellation, optimistic-update, and non-real response
   behavior.
9. Motion, haptics, reduced-motion, and web/native differences.
10. Accessibility role, label, focus/keyboard behavior, live-region behavior,
    and state announcements.
11. Test coverage and known limitations.
12. Figma component/variant mapping and the screens that consume it.

### Behavior-bearing component inventory

Codex owns this component audit before any Figma component is created or
mapped. The following component families must be audited:

| Family | Repository evidence | Contract responsibility |
| --- | --- | --- |
| App shell/navigation | `src/components/shell/ReferenceShell.tsx`, `src/components/navigation/*`, `src/lib/exploreNav.ts`, `opportunitiesNav.ts`, `adminNav.ts` | Canonical destinations, selected state, route guards, responsive desktop/mobile behavior, back/resume semantics |
| Auth/legal | `src/screens/auth/authShared.tsx`, `src/components/auth/*`, `LegalAcceptanceGate.tsx`, `OAuthConsentModal.tsx` | Field semantics, legal acceptance, provider consent, error and focus behavior |
| Onboarding primitives | `src/components/onboarding/primitives.tsx`, `LiveAdmissionSearchField.tsx`, `LiveSubjectMultiSelect.tsx`, `OnboardingBackGuard.tsx` | Typeahead, chip selection, validation, draft persistence, exit protection |
| Data-state/error boundaries | `DataStateView.tsx`, `EmptyState.tsx`, `ScreenErrorBoundary.tsx`, `ErrorBoundary.tsx`, `src/screens/admin/ComingSoonPanel.tsx`, `Toast.tsx` | pending/real/fallback/coming-soon/locked/error/empty presentation and recovery |
| Catalogue cards | `DomainChip.tsx`, `RoleCard.tsx`, `OpportunityCard.tsx`, `OrganisationCard.tsx`, `ScholarshipCard.tsx`, `ApplicationWindowCard.tsx`, `ElitePathwayCard.tsx`, `PersonaCard.tsx` | Source ownership, verified labels, card actions, route intent, save/subscribe state |
| Detail actions | `SaveButton.tsx`, `SubscribeButton.tsx`, `GuidanceReportButton.tsx`, `NotesFab.tsx`, `NotesWidget.tsx`, `MappingFeedbackButton.tsx` | Separate save/guidance/note/subscribe/feedback persistence and truthful notices |
| Export/share | `PdfExportButton.tsx`, `ShareExportButton.tsx` | Web/native print, authenticated document access, mobile lock, share fallback |
| Skills/resources | `SkillsBridge.tsx`, `SkillDiscoveryPanel.tsx`, `LearningResourcesBlock.tsx`, `DegreeSkills.tsx`, `FoundationSkillsBlock.tsx`, `CertPlacementList.tsx` | Covered/gap semantics, skill-to-domain matching, verified links, resource save; no false saved-skill state |
| Forms/search | `InputComponents.tsx`, `SearchComponents.tsx`, onboarding fields, `TrackSearch.tsx` | Labels, validation, debounce/cancellation, keyboard, no-result and error recovery |
| Admin data controls | `src/components/admin/*`, `AdminDataTable.tsx`, `ReviewModal.tsx`, `FlagModal.tsx` | permissions, table semantics, bulk actions, review/confirm, proof/consent states |
| Social/community | `FeedCard.tsx`, `CommentSheet.tsx`, `ChallengeCard.tsx`, `FlagModal.tsx` | feed loading, reactions, comments, moderation, report and failure behavior |
| Learning/simulators | `SimulatorCard.tsx`, `QuantSimulatorCard.tsx`, `TrackSearch.tsx`, `DownloadTrackScreen.tsx`, simulator components | lesson gating, progress, content version, lab state, download and reward effects |
| Motion/feedback primitives | `src/components/animations/*`, `src/theme/motion.ts`, haptics helpers | shared timing/easing, reduced-motion, focus safety, feedback not dependent on animation |

### Repository component inventory and classification rule

The repository-wide component audit covers all 153 files under
`src/components/`: 146 `.tsx` files and 7 `.ts` helper files. The directory
inventory is:

| Directory | Files | Audit treatment |
| --- | ---: | --- |
| root | 37 | classify each export as behavior-bearing, presentational, or helper; do not omit root-level shared inputs, cards, modals, boundaries, or feedback |
| `careerIntelligence` | 53 | highest-risk shared catalogue, search, detail, save, report, skills, resource, and feedback contracts |
| `simulators` | 27 | learning, lesson, lab, progress, download, reward, and gating contracts |
| `onboarding` | 10 | input, typeahead, subject selection, validation, draft, and resume/exit contracts |
| `admin` | 7 | permission, data-table, review, proof, dashboard, and coming-soon contracts |
| `animations` | 7 | transition, haptic, focus-safety, and reduced-motion contracts |
| `artwork` | 3 | visual asset review; contract only when the asset conveys state or action |
| `auth` | 2 | authentication, provider, consent, and field-state contracts |
| `brand` | 2 | visual/token review unless the export owns interaction |
| `navigation` | 1 | route intent, selected state, back/resume, and accessibility contract |
| `shell` | 1 | global shell, responsive layout, search, and navigation contract |
| `ui` | 1 | shared primitive behavior and semantic state contract |
| `wallet` | 1 | reward/commerce side effects, permissions, and failure contract |
| `web` | 1 | web-only behavior and platform fallback contract |

The counts are an inventory, not a claim that every file needs a standalone
Figma frame. A behavior-bearing component receives the component contract above
and a Figma component/variant mapping. A pure wrapper, icon, artwork asset, or
style-only export is still checked for tokens, semantics, contrast, platform
compatibility, and consumers, but is represented through the design system or
component documentation rather than a fabricated product flow. A panel used by
a screen is contracted as a component; it becomes a screen only when routing or
full-page composition makes it independently user-facing.

#### File-level component register

This register prevents a directory-level count from hiding an unreviewed file.
Every file below is included in the audit. The disposition applies to all
exports in that file unless a named export has a more specific contract in the
high-risk component records or the screen contract that consumes it.

| Directory | Files in audit | Disposition |
| --- | --- | --- |
| `admin` | `AdminDataTable.tsx`, `index.ts`, `MetricTooltip.tsx`, `NationalBenchmarkPanel.tsx`, `PeerComparisonChart.tsx`, `ScopeToggle.tsx`, `SparklineBar.tsx` | admin permission/table/metric/review component contract; `index.ts` helper export review |
| root | `AIExplainer.tsx`, `CelebrationOverlay.tsx`, `ChallengeCard.tsx`, `CharacterReaction.tsx`, `CharacterSystem.tsx`, `CommentSheet.tsx`, `CurriculumPreview.tsx`, `DatabaseProvider.tsx`, `DisclaimerFooter.tsx`, `EmptyState.tsx`, `ErrorBoundary.tsx`, `FeedCard.tsx`, `FeedWebLayout.tsx`, `FlagModal.tsx`, `GuildLeaderboardPrompt.tsx`, `LabObjects.tsx`, `LegalAcceptanceGate.tsx`, `LessonTransition.tsx`, `LessonXPBar.tsx`, `LoadingScreen.tsx`, `LocalLegalNotice.tsx`, `MascotLayer.tsx`, `NavigationLogger.tsx`, `OAuthConsentModal.tsx`, `OfflineBanner.tsx`, `OrientationLayout.tsx`, `ReviewModal.tsx`, `RewardsBadge.tsx`, `RoomMessage.tsx`, `RouteIntegrityGuard.tsx`, `ScreenErrorBoundary.tsx`, `Sidebar.tsx`, `Skeleton.tsx`, `StarknetFaucetButton.tsx`, `StreakUrgencyBanner.tsx`, `SyncIndicator.tsx`, `TrackSearch.tsx` | auth/legal, data-state, shell, social, learning, offline, navigation, or external-effect contract as applicable; style-only exports receive design-system review |
| `animations` | `CelebrationBurst.tsx`, `index.ts`, `PressLift.tsx`, `SharedElement.tsx`, `SkeletonCrossfade.tsx`, `StaggerReveal.tsx`, `ThemeCrossfade.tsx` | motion/reduced-motion/focus-safety contract; `index.ts` helper export review |
| `artwork` | `FieldArtwork.tsx`, `IslandGlobe.tsx`, `TrackIsometricScene.tsx` | asset, loading, fallback, semantics, and license/source review; no fabricated flow |
| `auth` | `PrivyStarknetBootstrap.tsx`, `StarknetWalletBridge.tsx` | auth/provider/wallet permission, consent, loading, and failure contract |
| `brand` | `IntroCarousel.tsx`, `LevelUpLogo.tsx` | intro interaction contract for `IntroCarousel`; brand asset/token review for logo |
| `careerIntelligence` | `ApplicationWindowCard.tsx`, `ApplicationWindowTimeline.tsx`, `BridgeView.tsx`, `CareerDisclaimer.tsx`, `CertPlacementList.tsx`, `CoachMark.tsx`, `ComingSoon.tsx`, `DataSourceBadge.tsx`, `DataStateView.tsx`, `DegreeSkills.tsx`, `DemandMetricsBlock.tsx`, `DetailScaffold.tsx`, `DomainChip.tsx`, `DomainIcon.tsx`, `DomainMappingExplainer.tsx`, `ElitePathwayCard.tsx`, `FoundationSkillsBlock.tsx`, `GuidanceReportButton.tsx`, `index.ts`, `InfoTooltip.tsx`, `InputComponents.tsx`, `LayoutPrimitives.tsx`, `LearningResourcesBlock.tsx`, `LevelUpCTA.tsx`, `MappingFeedbackButton.tsx`, `MethodEvidenceBlock.tsx`, `MetricTooltip.tsx`, `NotesFab.tsx`, `NotesWidget.tsx`, `OpportunityCard.tsx`, `OrganisationCard.tsx`, `PdfExportButton.tsx`, `PersonaCard.tsx`, `ReadinessBadgeView.tsx`, `RedesignPrimitives.tsx`, `RoleCard.tsx`, `RoleClusterSection.tsx`, `RoleMatchBadge.tsx`, `RoleTypeFilter.tsx`, `RouteLine.tsx`, `SaveButton.tsx`, `ScholarshipCard.tsx`, `SearchComponents.tsx`, `ShareExportButton.tsx`, `SkeletonRedesign.tsx`, `SkillDiscoveryPanel.tsx`, `SkillsBridge.tsx`, `StatTile.tsx`, `StatusBadge.tsx`, `SubscribeButton.tsx`, `TierBadgeView.tsx`, `Toast.tsx`, `ToolGroupsBlock.tsx` | catalogue, detail, search, data-state, skills/resources, report/export, notes, feedback, and save/subscribe component contracts; `index.ts`/primitives receive helper review |
| `navigation` | `LegacyRouteRedirect.tsx` | compatibility redirect, route-collision, caller-context, and accessibility contract |
| `onboarding` | `CurrentStudentSetupForm.tsx`, `GraduateSetupForm.tsx`, `JambSetupForm.tsx`, `LiveAdmissionSearchField.tsx`, `LiveSubjectMultiSelect.tsx`, `OnboardingBackGuard.tsx`, `primitives.tsx`, `ProfessionalSetupForm.tsx`, `SeniorSecondaryExploreSetupForm.tsx`, `SkilledWorkerSetupForm.tsx` | active student/JAMB/educator onboarding contracts; professional/skilled-worker/graduate forms are hidden/dormant and documented as non-exposed future states |
| `shell` | `ReferenceShell.tsx` | canonical shell, five destinations, responsive navigation, search, route guard, resume, and accessibility contract |
| `simulators` | `BranchingInterviewRenderer.tsx`, `CairoBuilderCodeSandbox.tsx`, `CairoBuilderPhase2Scorer.tsx`, `CairoBuilderSimulators.tsx`, `ChartReplayRenderer.tsx`, `island06SolanaSimulatorDefs.tsx`, `island08SimulatorDefs.tsx`, `island09_10SimulatorDefs.tsx`, `island12_13_15Sims.tsx`, `island14_16_17_18Sims.tsx`, `JudgmentRenderer.tsx`, `onchainSimulatorDefs.ts`, `Phase1BossRenderer.tsx`, `pythonSimulatorDefs.ts`, `QuantSimulatorCard.tsx`, `quantSimulatorDefs.ts`, `ResearchWriterSandbox.tsx`, `SandboxRenderers.tsx`, `SimulatorCard.tsx`, `SimulatorCard_ADDITIONS.tsx`, `SimulatorCard_PATCH.ts`, `SimulatorFactory.tsx`, `SimulatorRegistry.tsx`, `SimulatorShared.tsx`, `starknetSepoliaSupport.tsx`, `StarkzapSimulatorCard.tsx`, `walletEnhancedSims.tsx` | learning/simulator state, lesson gating, progress, scoring, persistence, download, wallet/network, reward, and content-version contract; definition/helper files are not standalone screens |
| `ui` | `index.tsx` | shared primitive export and semantic state review |
| `wallet` | `AddressPill.tsx` | wallet identity, privacy, truncation, network, and connection/error contract |
| `web` | `WebGrid.tsx` | web layout/platform accessibility contract |

This register is also the source for Figma component coverage. The Figma
document may group files into component sets, but it must not omit a file or
silently convert a behavior-bearing export into a static visual.

No component is considered mapped until Codex has recorded its evidence,
behavior contract, state source, persistence boundary, permissions, recovery,
accessibility, motion, test evidence, consumers, and Figma mapping. Component
status must distinguish `implemented`, `partial`, `missing`,
`contradictory`, `obsolete`, and `coming_soon`. A Figma component should not be
created merely because a similarly named visual exists; its states and code
consumer contract must be known first.

`src/screens/admin/ComingSoonPanel.tsx` is a reusable admin state component, not
a standalone user-facing route. Its contract is the honest `coming_soon` state,
release/data-gate explanation, and any permitted recovery or navigation action;
it is excluded from the standalone screen count but included in the component
and Figma state-family audit.

`src/screens/admin/StatCard.tsx` is likewise a presentational metric component,
not a route. Its contract is metric label/value/source/date/status formatting,
loading/empty/locked/coming-soon variants, and accessible text equivalents; it
does not own navigation or persistence.

### Concrete high-risk component contracts

These components are the most important shared behavior boundaries for the first
Figma-to-code slices. Their contracts are explicit because a visual mismatch in
one of them propagates across many screens.

#### `SaveButton`

- Evidence: `src/components/careerIntelligence/SaveButton.tsx:23-123`.
- Responsibility: save/remove a supported `SavedEntityType`; it is not a generic
  skill-save control.
- Inputs/state: entity type/id/label, initial saved state, callback; idle, busy,
  saved, remove, guest/locked/non-real notice, failure, and reduced-motion save
  pop.
- Side effect: `careerData.saveItem` or `removeSavedItem`; state changes only
  when the result is `real`. Optimistic success is prohibited.
- Navigation/feedback: emits local state to its screen; the screen decides where
  a saved item opens. Notice text must distinguish sign-in, coming-soon, offline,
  and backend failure.
- Accessibility/Figma: button role, “Save item”/“Remove from saved” label,
  busy/selected state, focus, keyboard activation; Figma needs save, saving,
  saved, removing, failed, guest, and reduced-motion variants.
- Acceptance/status: resource/domain/subgroup/role/etc. saves are durable only
  after backend confirmation; individual skills remain unsupported; implemented,
  with Figma missing.

#### `DataStateView`, `EmptyState`, `ScreenErrorBoundary`, and `Toast`

- Evidence: `DataStateView.tsx:15-118`, `EmptyState.tsx`,
  `ScreenErrorBoundary.tsx:16-50`, `Toast.tsx:23-166`.
- Responsibility: make data and recoverable failures visible consistently.
- Inputs/state: `DataState`, empty/retry action, screen error/retry/home, toast
  variant/message/duration; pending, fallback, coming-soon, locked, error,
  empty, retrying, dismissed, and success-notice states.
- Side effects: `ScreenErrorBoundary` logs and resets; `ToastProvider` manages
  transient feedback; neither may imply durable backend success.
- Navigation/feedback: retry repeats the owning request; home uses the route's
  recovery destination; toast is supplementary, never the only error message.
- Accessibility/Figma: state title/body are announced, retry is focusable,
  severity is not colour-only, dismiss is labelled; Figma needs reusable state
  variants with recovery actions.
- Acceptance/status: every screen maps its backend status to an honest state;
  implemented, with incomplete Figma coverage.

#### `DetailScaffold`, `PdfExportButton`, `ShareExportButton`, and `GuidanceReportButton`

- Evidence: `DetailScaffold.tsx:32-157`, `PdfExportButton.tsx:34-74`,
  `ShareExportButton.tsx:18-42`, `GuidanceReportButton.tsx:72-154`.
- Responsibility: provide shared detail navigation and keep save, report
  selection, print/export, and share actions separate.
- Inputs/state: route detail state, optional save config, report selection,
  document path, title/file name, busy/hint/selected; no-path, guest, locked,
  pending, selected, saved, native-export-locked, print, share-unavailable,
  and failure states.
- Side effect: guidance path and saves use career/provisioning clients; reports
  use authenticated document endpoints; browser uses `window.print`; native
  export/share uses provisioning helpers.
- Navigation/feedback: back returns to caller; report action does not redirect to
  generic Home; print/share failures leave the detail context intact and explain
  alternatives.
- Accessibility/Figma: action labels distinguish Save/Add to guidance/Print/
  Share; busy/selected state and focus restoration required; Figma needs the
  complete action-bar and document-state variants.
- Acceptance/status: selected report branches and saved cards never silently
  merge; implemented, with Figma missing.

#### `ReferenceShell`, `SearchOverlay`, and navigation helpers

- Evidence: `src/components/shell/ReferenceShell.tsx:34-273`,
  `src/components/careerIntelligence/SearchComponents.tsx:363-413`,
  `src/lib/exploreNav.ts`, `opportunitiesNav.ts`, `resumeNavigation.ts`.
- Responsibility: canonical five-destination shell, global search, responsive
  desktop/mobile navigation, and caller-preserving navigation.
- Inputs/state: active route, drawer, search query/scope/results/loading/recent
  searches, responsive width, auth/account context; idle, focused, loading,
  result, no-result, error, selected destination, drawer open, offline.
- Side effect: career search and recent-search persistence; route pushes and
  post-auth resume. Search cancellation/generation guards must prevent stale
  result overwrite.
- Navigation/feedback: Home, Explore, Opportunities, My World, Profile are
  canonical; legacy routes are compatibility-only; back/deep-link context is
  preserved.
- Accessibility/Figma: tabs expose selected state, drawer focus trap, search
  combobox/results and keyboard escape, responsive landmarks; Figma needs mobile
  bottom navigation, desktop sidebar, search overlay, and route-state variants.
- Acceptance/status: no Jobs label and no hidden dormant persona in shell;
  implemented, with partial design-system coverage.

#### `LiveAdmissionSearchField`, `LiveSubjectMultiSelect`, `SifterTextInput`, `SifterSelect`, and `ChipSelect`

- Evidence: onboarding live controls and `careerIntelligence/InputComponents.tsx:28-326`.
- Responsibility: validated, source-backed selection in onboarding and admission
  flows.
- Inputs/state: value/options/onChange/query/loading/open/error/disabled/fixed
  required subjects; idle, focus, searching, real result, no result,
  unavailable, selected, invalid, registering, and failure.
- Side effect: admission/subject catalogue queries and optional school
  registration; debounce and cancellation prevent stale results.
- Navigation/feedback: selection returns an entity/value to the owning form; it
  never silently submits onboarding; error and unavailable states explain retry
  or typed fallback.
- Accessibility/Figma: labels, combobox/listbox semantics, selected chips,
  required/disabled state, field error association, keyboard navigation and
  focus after selection; Figma needs all variants.
- Acceptance/status: English/Mathematics constraints and institution-scoped
  options remain correct; implemented, with Figma partial only.

#### `OfflineBanner`, `SyncIndicator`, `OnboardingBackGuard`, `AdminDataTable`, and `ReviewModal`

- Evidence: `OfflineBanner.tsx`, `SyncIndicator.tsx`,
  `OnboardingBackGuard.tsx:22-148`, `admin/AdminDataTable.tsx:23-28`,
  `ReviewModal.tsx`.
- Responsibility: communicate connectivity/sync, prevent destructive onboarding
  exit, and make admin review/bulk actions safe.
- Inputs/state: connection status, queued writes, navigation pop, selected rows,
  review payload, delete/confirm; offline, syncing, synced, sync failed, guard
  open, selected, validation, confirmation, cancelled, and completed.
- Side effect: offline queue/storage, navigation interception, admin mutations;
  rollback or retry is required when a write fails.
- Navigation/feedback: continue later preserves draft; delete/merge/review
  requires explicit confirmation; retry returns to the owning screen.
- Accessibility/Figma: persistent offline notice, dialog focus trap, checkbox/table
  semantics, selected counts, destructive wording; Figma needs banner, guard,
  table, review, and failure variants.
- Acceptance/status: no data-loss action occurs from back or bulk selection alone;
  implemented/partial, Figma missing.

#### Motion and animation primitives

- Evidence: `src/theme/motion.ts:44-81`, `src/components/animations/*`.
- Responsibility: shared timing/easing and reduced-motion fallback.
- Inputs/state: animation trigger, reduced-motion flag, theme/shared element
  context; entering, settled, interrupted, reduced-motion fade-only.
- Side effect: none beyond visual transition/haptic helpers; motion cannot be the
  only state signal.
- Accessibility/Figma: preserve focus/order and use reduced-motion-safe variants;
  Figma annotations must name timing, easing, trigger, and reduced-motion result.
- Acceptance/status: `useReducedMotion` is respected by shared primitives;
  implemented in code, Figma motion documentation incomplete.

### Supporting layers that must be audited

#### Shell, routing, and navigation

Audit every `app/` route wrapper, nested layout, redirect, deep-link parameter,
resume helper, and navigation helper. Record canonical route, caller context,
back behavior, auth/account guard, invalid-parameter behavior, and route
collision/legacy redirect behavior. Evidence includes `app/_layout.tsx`, the
auth/tabs/admin/nested layouts, `src/lib/resumeNavigation.ts`,
`postAuthRedirect.ts`, `adminResume.ts`, `LegacyRouteRedirect.tsx`, and route
collision tests.

#### Providers, hooks, and client state

Audit `AuthProvider`, theme and font providers, query/cache providers, reduced
motion, responsive layout, notifications, in-app notifications, shared-element
context, and every hook that loads or mutates user data. Record hydration order,
loading gates, cache invalidation, focus refetch, stale-data policy, and cleanup
on unmount. A Figma transition must not imply state that the provider cannot
hydrate or persist.

#### Data clients, types, and source/verification metadata

Audit `src/lib/api.ts`, `careerData.ts`, `provisioningData.ts`, `adminData.ts`,
`startingPoint.ts`, `onboardingDraft.ts`, `offlineQueue.ts`, `offlineStorage.ts`,
`careerCache.ts`, and all related types. For each operation record request,
response envelope, `DataState`, source/date metadata, cache key, retry policy,
guest behavior, mutation idempotency, and local fallback. Type unions must be
compared with backend constraints so a design never exposes an entity/action the
API cannot store.

#### Backend routes, migrations, and database invariants

Audit every route module under `backend/routes/`, every mounted legacy route,
every migration and runbook, row-level access rule, entity-type constraint,
source table, seed gate, and report/export endpoint. Record the frontend caller,
permission check, transaction/idempotency behavior, real versus placeholder
response, migration prerequisite, and rollback/data-loss risk. Backend tests are
evidence of behavior only where they cover the relevant route and state.

#### Tests and verification gates

Map every screen/component contract to existing frontend and backend tests. Record
whether coverage is unit, component, route, permission, migration, or end-to-end;
what states are untested; and the smallest test needed before Figma-to-code
implementation. A passing helper test cannot prove a full screen flow.

#### Design system, tokens, assets, typography, and content

Audit `src/theme/*`, fonts, semantic colors, spacing/radius/type tokens, dark
mode, component variants, illustrations, icons, source labels, legal copy, and
content manifests. Record token ownership, contrast result, platform override,
asset license/source, loading/error fallback, and whether copy is product truth
or placeholder. Figma variables and code tokens must not silently diverge.

#### Permissions, consent, privacy, and security

Audit account-type gates, institution roles, target-student access, consent
requests, school affiliation, legal acceptance, private report URLs, token
handling, external share links, uploads, deletion, and sign-out. Record what is
visible before authentication, after authentication, after consent, and after
revocation. Sensitive data must be absent or redacted in locked/error states.

#### Offline, sync, cache, and recovery

Audit local storage, Watermelon/offline models, queue processing, retries,
conflict resolution, connectivity detection, stale cache labels, and hydration
failure. For every optimistic UI state, record rollback behavior. Figma needs
offline and sync-failure variants wherever the user can initiate a write.

#### Analytics, notifications, feedback, and external effects

Audit consent-gated analytics, navigation logging, in-app/push notifications,
feedback submission, share sheets, email/provider redirects, GitHub/OAuth,
wallet/chain effects, rewards/XP, referrals, and commerce. Record the user-visible
confirmation, idempotency, privacy boundary, and failure recovery. Do not design
a celebratory success state for an external effect that has not completed.

### What is not a separate screen contract

Static icons, decorative artwork, pure typography wrappers, and styles with no
state or side effect should be catalogued under the design-system audit rather
than receiving an artificial flow contract. They still need token, contrast,
asset-source, platform, and accessibility review when they convey meaning.

This distinction keeps the audit complete without pretending that a decorative
rectangle has navigation behavior, while ensuring every reusable component that
can change what the user sees or does is specified before Figma implementation.

### Remaining student and compatibility screen contracts

#### `ExploreScreen`

- Route/evidence: `app/(tabs)/explore/index.tsx:1-4`; `src/screens/ExploreScreen.tsx:108`.
- Persona/entry/purpose: guest, student, or admin workspace user discovers
  admission, programmes, domains, pathways, and skill matches.
- UI/components: search bar, discovery doors, recent searches, result groups,
  `SkillDiscoveryPanel`, state view, notes FAB, route-specific context banner.
- Actions/exits: query -> grouped results; open result -> detail; admission ->
  Admission Intelligence; skill panel -> matches; notes -> NotesWidget; admin
  context -> workspace detail; back -> caller shell.
- States/data: idle, query loading, recent-search, real, fallback, no result,
  error, offline, locked admin lens; `careerData`, admission clients, and
  source metadata are authoritative.
- Persistence/permissions/feedback: recent searches are local; saved entities,
  notes, and admin target context use backend confirmation; guest can browse.
- Motion/a11y: labelled search/combo results, selected filters, live result count,
  focus retention after query, reduced motion.
- Acceptance/status/Figma: route leads to canonical detail surfaces without
  inventing data; implemented/partial; Figma partial `28:3`/`28:5`, missing
  skills-match, state, admin, and recovery variants.

#### `SkillsScreen` and `FieldsScreen`

- Route/evidence: `app/(tabs)/skills/index.tsx:1-4`, `app/(tabs)/fields/index.tsx:1-3`;
  `src/screens/SkillsScreen.tsx:500`, `src/screens/FieldsScreen.tsx:320`.
- Persona/entry/purpose: user intentionally opens the legacy Skills & Career
  Explorer to browse fields, tracks, labs, and learning paths.
- UI/components: field cards/accordions, browse/search tabs, track cards, locked
  previews, field detail modal, track navigation and legacy shell controls.
- Actions/exits: search/browse -> field/track; open track -> setup/room/lesson;
  locked action -> explanation; back -> My World or previous compatibility route.
- States/data: idle, search/no result, pending content, real/static catalogue,
  locked preview, coming-soon lab, error/offline where content fetches; fields
  and skills data plus content manifests are authoritative for each layer.
- Persistence/permissions/feedback: selected track/progress uses learning state;
  feature gate controls entry; do not present this as source-backed career
  taxonomy or as a saved-skill list.
- Motion/a11y: accordions/tabs/cards expose state, search labels, progress text,
  reduced motion and keyboard focus.
- Acceptance/status/Figma: compatibility route remains reachable but hidden from
  primary shell; implemented/partial; Figma missing.

#### `QuantMapScreen`, `InterviewModeScreen`, and `DownloadTrackScreen`

- Route/evidence: `app/(tabs)/skills/quant-map.tsx:1-4`,
  `skills/interview.tsx:1-17`, `app/track-room/index.tsx`/legacy track routes;
  `src/screens/QuantMapScreen.tsx:445`, `InterviewModeScreen.tsx:470`,
  `DownloadTrackScreen.tsx:31`.
- Persona/entry/purpose: legacy learner enters a quantitative map, interview
  practice, or track download action.
- UI/components: map chapters/gates, interview prompts/results, track metadata,
  progress, download/share controls, simulator/lab cards.
- Actions/exits: select chapter/start interview -> answer/result; complete gate ->
  next lesson; download -> permission/progress/result; back -> Skills/Fields or
  track room.
- States/data: idle, pending content, answer validation, in-progress, complete,
  locked prerequisite, offline/download failure, coming-soon content; content,
  interview, progression, and offline clients are authoritative.
- Persistence/permissions/feedback: answers/progress/streak/XP persist through
  learning engines; downloads are not reported complete before storage success;
  wallet-gated or dormant content remains hidden/locked.
- Motion/a11y: progress and answer state have text equivalents, controls labelled,
  focus advances deliberately, reduced-motion mode.
- Acceptance/status/Figma: learner can resume at the correct chapter and recover
  from content/download failure; implemented/partial; Figma missing.

#### `WorldScreen`, `IslandMapScreen`, `LessonScreen`, `TrackRoomScreen`, and `TrackSetupScreen`

- Route/evidence: `app/world/index.tsx:1-3`, `app/(tabs)/map/island.tsx:1-5`,
  `map/lesson.tsx:1-102`, `app/track-room/index.tsx:1-5`;
  `src/screens/WorldScreen.tsx:274`, `IslandMapScreen.tsx:221`,
  `LessonScreen.tsx:764`, `TrackRoomScreen.tsx:20`, `TrackSetupScreen.tsx:430`.
- Persona/entry/purpose: learner enters the legacy world/map, configures a track,
  opens a lesson, and progresses through a room.
- UI/components: world/map nodes, track setup, lesson content/questions, room
  stations, progress/streak/reward indicators, next/back actions.
- Actions/exits: choose track -> setup; open node -> lesson; answer/complete ->
  progression/reward/next; back -> map/world/Fields; locked node -> prerequisite.
- States/data: content manifest pending/real/version mismatch, locked, answer
  validation, complete, offline queue, error/retry, empty map; content, lesson,
  progression, XP, streak, and offline stores are authoritative.
- Persistence/permissions/feedback: resume exact track/lesson, queue offline
  events if supported, rollback failed rewards, and never duplicate XP; feature
  flags may gate access.
- Motion/a11y: map nodes have text labels, lesson progress and correctness are
  announced, motion can be reduced, focus returns after modal.
- Acceptance/status/Figma: legacy learning remains compatible and does not
  replace career guidance; implemented/partial; Figma missing.

#### `PostIslandTrackSelection`, `LearnMoreScreen`, `EcosystemTrackScreen`, `CairoBuilderTrackScreen`, and `StarknetTrackScreen`

- Route/evidence: `app/(tabs)/map/*`, `app/ecosystem-track/index.tsx:1-7`,
  `app/cairo-builder-track/index.tsx:1-5`, `app/starknet-track/index.tsx:1-7`;
  `src/screens/PostIslandTrackSelection.tsx:98`, `LearnMoreScreen.tsx:45`,
  `EcosystemTrackScreen.tsx:128`, `CairoBuilderTrackScreen.tsx:110`,
  `StarknetTrackScreen.tsx:195`.
- Persona/entry/purpose: learner chooses a next track or opens a specialised
  legacy ecosystem/build/wallet path.
- UI/components: track choice cards, about/resources/terms tabs, specialised
  progress/lab/wallet controls, gate banners, external resource links.
- Actions/exits: choose track -> setup/room; open resource -> external URL; begin
  specialised path -> gated simulator/lesson; back -> Fields/World.
- States/data: static/manifest loading, selected, locked, wallet/provider
  unavailable, resource missing, coming-soon, error/offline; track/content,
  Starknet/wallet and resource clients are authoritative.
- Persistence/permissions/feedback: preserve selected track and progress; wallet
  or external effects require explicit permission and completion response; no
  reward claim on failed chain/provider action.
- Motion/a11y: cards/tabs selected, external links named, wallet status announced,
  reduced motion.
- Acceptance/status/Figma: legacy paths are explicit compatibility features and
  not part of the primary admission flow; implemented/partial; Figma missing.

#### `CommunityScreen`, `FeedScreen`, `GuildScreen`, `LeaderboardScreen`, and `ReferralScreen`

- Route/evidence: `app/(tabs)/community/*`, `guild/index.tsx`, `feed/index.tsx`,
  `community/referral.tsx`; `src/screens/CommunityScreen.tsx`, `FeedScreen.tsx:130`,
  `GuildScreen.tsx:113`, `LeaderboardScreen.tsx:33`, `ReferralScreen.tsx:48`.
- Persona/entry/purpose: authenticated learner participates in community/feed,
  guild, leaderboard, or referral features.
- UI/components: feed cards, reactions/comments, guild/challenge cards, ranking
  rows, referral code/share, empty/error and moderation controls.
- Actions/exits: load/refresh -> feed; react/comment/report -> feedback; join or
  submit challenge -> guild progression; share referral -> system share; back ->
  My World/Home.
- States/data: loading, real, fallback, empty, offline, submit pending, duplicate,
  moderation/locked, error/retry; community/feed/guild/social-reward endpoints
  and consent are authoritative.
- Persistence/permissions/feedback: reactions/subscriptions/challenges/referrals
  persist only on confirmation; moderation errors do not erase local draft.
- Motion/a11y: comments modal focus, reaction pressed state, ranking semantics,
  live updates announced without motion dependency.
- Acceptance/status/Figma: social features remain separate from career guidance;
  implemented/partial; Figma missing.

#### `PortfolioScreen` and `PortfolioHubScreen`

- Route/evidence: `app/(tabs)/portfolio/index.tsx:1-4`, `portfolio/hub.tsx:1-4`;
  `src/screens/PortfolioScreen.tsx:629`, `PortfolioHubScreen.tsx:723`.
- Persona/entry/purpose: learner builds and reviews a portfolio of work/artifacts.
- UI/components: portfolio sections, artifact cards/editor, GitHub/share actions,
  empty state, save/delete confirmation, preview/export.
- Actions/exits: create/edit artifact -> save; GitHub -> OAuth/return; share ->
  share result; delete -> confirmation; back -> My World/Profile.
- States/data: hydration, empty, draft validation, upload/pending, real, offline,
  share/OAuth error, delete confirmation; portfolio routes/client are authoritative.
- Persistence/permissions/feedback: drafts and artifacts are user-owned; OAuth
  state resumes safely; delete is explicit and recoverable only if backend allows.
- Motion/a11y: form labels/errors, artifact list semantics, dialog focus,
  external share labels, reduced motion.
- Acceptance/status/Figma: artifact ownership and sharing are truthful;
  implemented/partial; Figma missing.

#### `GuildScreen` and `StreaksScreen`

- Route/evidence: `app/(tabs)/guild/index.tsx:1-3`, `streaks/index.tsx:1-4`;
  `src/screens/GuildScreen.tsx:113`, `StreaksScreen.tsx:56`.
- Persona/entry/purpose: learner reviews active guild challenges or streak status.
- UI/components: challenge list, progress, heatmap, milestones, continue-learning
  and My World actions.
- Actions/exits: open/submit challenge -> engine result; continue -> track/Fields;
  recover streak -> action where supported; back -> My World/Home.
- States/data: loading, real, empty, lost-streak, future days, submit pending,
  offline/error; guild, XP, challenge, and streak engines are authoritative.
- Persistence/permissions/feedback: XP/streak/challenge events are idempotent;
  failed sync is visible; no celebratory completion before server/local engine
  confirmation.
- Motion/a11y: heatmap has text summary, progress labels, challenge controls,
  reduced-motion celebration.
- Acceptance/status/Figma: progression reflects actual engine state;
  implemented/partial; Figma missing.

#### `MerchandiseScreen`

- Route/evidence: `app/merchandise/index.tsx:1-2`; `src/screens/MerchandiseScreen.tsx:30`.
- Persona/entry/purpose: authenticated learner browses or redeems reward/merchandise
  where the feature is released.
- UI/components: product/reward cards, balance/eligibility, redeem confirmation,
  error and coming-soon panel.
- Actions/exits: open item -> eligibility; redeem -> destructive/confirmation ->
  result; back -> reward/world context.
- States/data: loading, real, empty, coming_soon, locked balance/eligibility,
  pending, insufficient balance, error; merch/reward backend is authoritative.
- Persistence/permissions/feedback: redemption must be idempotent and confirmed;
  do not deduct or claim delivery on failed response.
- Motion/a11y: product labels, confirmation focus, balance updates announced,
  reduced motion.
- Acceptance/status/Figma: commerce remains outside core career journey;
  implemented/state-gated; Figma missing.

#### `OnboardingScreen`, `NotificationSettingsScreen`, and helper-only screen exports

- Route/evidence: `src/screens/OnboardingScreen.tsx:179`,
  `NotificationSettingsScreen.tsx:40`; `src/screens/auth/authShared.tsx:41-325`,
  `src/screens/admin/StatCard.tsx:33`, `AdminExploreIntro.tsx:14`.
- Persona/entry/purpose: `OnboardingScreen` is a legacy/intro wrapper if reached;
  notification screen manages preferences; `authShared`, `StatCard`, and
  `AdminExploreIntro` are reusable/helper exports rather than standalone routes.
- UI/components/actions/states/data: OnboardingScreen must route to the current
  account gate rather than create a second onboarding path; notifications use
  toggle pending/success/error; helper exports inherit their consumer contracts.
- Persistence/permissions/feedback: notification preferences require auth and
  backend confirmation; helper components have no independent persistence.
- Motion/a11y: toggles and modal fields expose checked/focus/busy; wrappers do not
  add a second transition or duplicate announcement.
- Acceptance/status/Figma: legacy intro is explicitly compatibility-only or
  redirected; helper exports are not separate Figma frames; implemented/partial.

## Cross-cutting interaction contract

For every screen, the design and implementation must specify:

```text
UX purpose
-> UI structure
-> reusable components
-> interaction states
-> data source and verification metadata
-> navigation entry and exit
-> persistence and resume
-> feedback and recovery
-> motion and reduced motion
-> accessibility
-> real-product acceptance criteria
```

Persistence:

- onboarding drafts persist locally and through authenticated draft endpoints;
- starting-point data uses API persistence with local fallback;
- guidance paths persist separately from saved cards;
- saved items, resources, notes, subscriptions, feedback, consent, portfolio
  artifacts, XP, streaks, and relevant learning state persist through their own
  clients/endpoints;
- offline writes must either queue through an explicit sync contract or tell the
  user that the action was not saved. The UI must not claim durable success.

Feedback:

- every save, remove, submit, share, print, verify, consent, delete, and retry
  action needs pending, success, and recoverable failure feedback where the code
  can produce them;
- a `coming_soon` or `locked` response must be explained in product language;
- errors must identify the next action without exposing raw backend details.

Motion:

- use shared motion primitives and respect reduced-motion settings;
- loading, transitions, save confirmation, navigation, and error recovery must
  not depend on motion alone to communicate state;
- shared-element and theme transitions must preserve context and not obscure
  focus or screen-reader order.

Accessibility:

- controls expose role, label, selected/checked/expanded/busy state;
- touch targets and keyboard focus are visible;
- validation errors are associated with their fields;
- dialogs trap/restore focus and destructive actions require clear confirmation;
- colour and motion never carry meaning alone;
- web and native routes preserve heading hierarchy and readable state changes.

## Evidence anchors with line references

These are the primary line-level anchors used in this audit. Line numbers refer
to the audited working tree on 2026-08-21 and should be refreshed when a file is
substantially rewritten.

| Behavior | Evidence anchor |
| --- | --- |
| Root providers and global shell | `app/_layout.tsx:24-59` |
| Student shell, redirect gate, five destinations, preserved legacy routes | `app/(tabs)/_layout.tsx:13-67` |
| Auth hydration and post-auth redirect policy | `app/(auth)/_layout.tsx:20-154` |
| Admin guard and separate stack | `app/(admin)/_layout.tsx:13-48` |
| DataState and state constructors | `src/types/career.ts:65-93` |
| Saved entity types, including resource but not skill | `src/types/career.ts:297-307` |
| Inline resources and local save feedback | `src/components/careerIntelligence/LearningResourcesBlock.tsx:62-143` |
| Guidance branch selection and persistence | `src/components/careerIntelligence/GuidanceReportButton.tsx:72-154` |
| Browser/native print behavior | `src/components/careerIntelligence/PdfExportButton.tsx:34-74` |
| Share behavior and unavailable-share feedback | `src/components/careerIntelligence/ShareExportButton.tsx:18-42` |
| My World saved groups and Saved learning | `src/screens/MyWorldScreen.tsx:61-106` |
| My World state views and saved/notes loading | `src/screens/MyWorldScreen.tsx:148-225` |
| Legacy Skills & Career Explorer | `src/screens/SkillsScreen.tsx:1-12`, `:640-650` |
| Skills Match entry point in Explore | `src/screens/ExploreScreen.tsx:48`, `:243` |
| Skills Match behavior and admin lens | `src/components/careerIntelligence/SkillDiscoveryPanel.tsx:53-220` |
| SkillsBridge layers | `src/components/careerIntelligence/SkillsBridge.tsx:24-146` |
| Student report endpoints | `backend/routes/student_pipeline_routes.py:570-585` |
| Admin target-student report endpoint | `backend/routes/provisioning_routes.py:1635-1667` |
| Admin provisioning states and target-student navigation | `src/screens/admin/StudentProvisioningScreen.tsx:183-260`, `:437` |
| Educator onboarding state machine | `src/screens/admin/EducatorOnboarding.tsx:131-322` |
| Resource saved-item database support | `backend/migration_saved_resource_support.sql:1-14` |
| Report selection contract | `docs/mockups/GUIDANCE_REPORT_BEHAVIOUR.md:1-91` |

The Figma node-level evidence and coverage classifications are maintained in
`docs/FIGMA_COVERAGE_AND_GAPS.md`.

## Contradictions and unresolved product gaps

| Finding | Evidence | Classification | Required decision |
| --- | --- | --- | --- |
| Jobs versus Opportunities | `docs/UX-AUDIT.md`, shell and route copy | Resolved | Use Opportunities everywhere |
| Admission Path versus Admission Intelligence | legacy brief title versus current flow/code | Resolved | Use Admission Intelligence |
| Dormant account types in types/forms | `src/types/onboarding.ts`, dormant forms | Intentional dormant behavior | Keep hidden until released |
| Legacy Skills/Fields versus source-backed Skills Match | `SkillsScreen`, `FieldsScreen`, `SkillDiscoveryPanel` | Two products, currently adjacent | Reconcile IA without deleting compatibility routes |
| Saved resource versus saved skill | `SavedEntityType`, `LearningResourcesBlock` | Resource implemented; skill missing | Decide whether to add a first-class saved-skill entity |
| Opportunities route exists before verified rows | career routes, coming-soon envelopes, migrations | State-gated | Do not call it live until data gate passes |
| Figma covers Explore but not full journey | Figma nodes in gap document | Incomplete design | Design missing states and surfaces before implementation |
| Admin code exists without an admin Figma system | admin routes/screens | Missing design | Create separate admin IA and shared-detail reuse plan |
| Shared design tokens have known AA failures | Figma Getting Started and Foundations / Color | Known accessibility debt | Resolve or explicitly constrain token usage |
| Existing mockups disagree with code on labels/tokens | Figma Getting Started annotations | Reconciliation required | Code/canonical decisions win and differences stay documented |

## Prioritized delivery backlog

### P0: behavior and handoff integrity

1. Treat this document and `FIGMA_COVERAGE_AND_GAPS.md` as the handoff source
   for every future Codex account.
2. Reconcile Figma navigation and copy to Opportunities, Admission Intelligence,
   My World, hidden dormant types, and subgroup-in-domain hierarchy.
3. Design and verify the complete visible onboarding and Admission Intelligence
   states before implementing another visual slice.
4. Add Figma coverage for detail actions: save, guidance selection, resources,
   notes, report print/download/share, and honest failure states.

### P1: missing product surfaces

1. Design the admin shell, dashboard, provisioning, consent, student guidance,
   verification, and admin workspace Explore.
2. Design My World saved learning, notes, subscriptions, empty/offline/remove
   states, and legacy learning entry points.
3. Design Skills/Fields versus Skills Match boundaries and decide whether a
   first-class saved-skill checklist is needed.
4. Design Opportunities only after the verified-data gate and release scope are
   confirmed.

### P2: follow-up reconciliation

1. Reconcile legacy community, portfolio, game, streak, commerce, settings, and
   notification flows with the shell.
2. Resolve known token/font/radius/contrast disagreements between code and Figma.
3. Expand automated route/state/accessibility tests to cover the documented
   transitions rather than only isolated helpers.

## Portability rule for a future Codex account

A new session must read, in order:

1. `docs/PRODUCT_BEHAVIOR_CONTRACT.md`;
2. `docs/FIGMA_COVERAGE_AND_GAPS.md`;
3. the relevant route file;
4. the screen and shared components;
5. the data client and types;
6. the backend endpoint and migration;
7. the relevant mockup/behavior document;
8. the relevant tests.

No Figma or code change is approved until the proposed change identifies its
persona, route, states, data, persistence, permissions, feedback, accessibility,
and acceptance criteria against this contract.

## Repository inventory appendix

### Primary route groups

- Auth: `app/(auth)/sign-in.tsx`, `signup.tsx`, `forgot-password.tsx`,
  `onboarding.tsx`.
- Student shell: `app/(tabs)/home`, `explore`, `opportunities`, `myworld`,
  `profile`.
- Student career routes: `app/(tabs)/explore/admission`, `programme`, `domain`,
  `role`, `compare`, `elite`, and `pathways`.
- Student legacy routes: `community`, `guild`, `feed`, `fields`, `skills`,
  `map`, `portfolio`, `streaks`, `settings`.
- Student opportunity routes: `opportunities`, `scholarships`, `windows`,
  opportunity and organisation details.
- Admin routes: `app/(admin)` and `app/(admin)/workspace-explore`.
- Direct compatibility routes: `app/world`, `app/track-room`,
  `app/cairo-builder-track`, `app/ecosystem-track`, `app/starknet-track`,
  `app/skills/lesson`, and `app/merchandise`.

The exact non-layout route manifest and its delegated screen/Figma mapping are
maintained in `docs/FIGMA_COVERAGE_AND_GAPS.md`. Layout files are behaviorally
covered as shell, provider, redirect, permission, and error-boundary systems.

### Backend capability groups

- Auth/profile/session/legal: auth modules, account lifecycle and auth/profile
  migrations.
- Admission/student pipeline: `admission_routes.py`,
  `student_pipeline_routes.py`, subject and admission migrations.
- Career catalogue: `career_routes.py`, career registry/intelligence/source-backed
  layers, enrichment, role tools, and resource migrations.
- Personal data: saved items, notes, subscriptions, feedback, guidance paths,
  report exports, and saved-resource support.
- Institution/admin: `institutions_routes.py`, `provisioning_routes.py`,
  institution access, consent, verification, and provisioning migrations.
- Legacy learning/social: content, community, feed, guild, game/rewards,
  interview, portfolio, entrepreneurship, Starknet, and social reward routes.

### Verification commands

The inventory can be refreshed without changing product state:

```powershell
rg --files app src/screens src/components src/lib src/types backend docs
rg -n '^@(router|app)\\.(get|post|put|patch|delete)' backend/routes
rg -n 'DataState|router\\.|careerData\\.|accessibilityRole|useReducedMotion' app src
```

The audit is complete only when a new route or product surface is added to this
contract or explicitly marked as outside the release scope.

Current coverage verification: 89 files exist under `src/screens/`, 87
non-layout route files exist under `app/`, and 153 files exist under
`src/components/`. The screen and route filename checks against the two handoff
documents currently return zero unlisted filenames, and all 153 component
filenames are explicitly present in this master register. `authShared`,
`ComingSoonPanel`, and `StatCard` are explicitly classified as helper/panel
components where they are not standalone routes.
