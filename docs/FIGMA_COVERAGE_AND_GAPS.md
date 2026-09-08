# Sifter LevelUp - Figma Coverage and Gaps

Status: Figma audit for the current repository-wide product contract

Audit date: 2026-08-21

Figma file:

`https://www.figma.com/design/Pz3BxiBHSv9juAuKAYjfwq/Sifter-LevelUp-%E2%80%94-Design-System`

This document records what the current Figma file visibly covers and what it
does not cover. The repository and `docs/PRODUCT_BEHAVIOR_CONTRACT.md` remain
the behavior and content authority; Figma supplies the refined responsive
composition and state presentation.

## Audit method

The supplied node-specific links were inspected through Figma metadata. The
audit records node names, nested frames, labels, and annotated design-system
notes. Metadata confirms structure and content coverage; it is not a substitute
for reviewing every rendered visual, prototype interaction, or Figma variable
binding during the later reconciliation pass.

## Current Figma coverage

| Node | Current content | Coverage judgment |
| --- | --- | --- |
| `0:1` | Cover; says code is source of truth and references 94 variables, 5 collections, light/dark modes | Foundation only |
| `7:2` | Getting Started; semantic token guidance, contrast notes, known code/mockup disagreements, nav naming conflict | Useful reconciliation notes; not product-flow design |
| `7:3` | Foundations / Color; light and dark semantic token swatches and contrast annotations | Foundation |
| `7:5` | Foundations / Spacing & Radius | Foundation |
| `7:6` | Components page | Component inventory, not composed product flows |
| `7:7` | Button component | Component |
| `7:8` | Input component | Component |
| `7:10` | Badge component | Component |
| `7:11` | Chip component | Component |
| `7:13` | Changelog | Documentation |
| `28:3` | Explore mobile | Partial student Explore reference |
| `28:4` | Domain detail mobile | Partial domain detail reference |
| `28:5` | Explore desktop | Partial desktop Explore reference |
| `76:2` | Onboarding mobile: account gate, bottom sheet, SS1/SS2 setup, school code, subjects, exit guard | Partial onboarding |
| `75:2` | Signup: send code, code sent, code rejected | Partial auth |
| `148:2` | Public Entry — Intro & Access: paired mobile/web intro carousel, public entry, guest loading/error, and root loading states | New responsive public-entry slice; still needs auth/legal handoff |

The file therefore has a strong design-system foundation, partial Explore
references, and partial auth/onboarding references. It is not yet a complete
representation of the product in the repository.

### Added public-entry slice (`148:2`)

The new page is intentionally content-constrained by the repository and uses
the existing Inter typography, neutral surfaces, orange action token, and
Button component variants. The visual treatment follows the existing Figma
auth/onboarding/Explore language: bordered white cards, compact hierarchy,
restrained accent use, and responsive composition.

| Surface | Mobile | Web |
| --- | --- | --- |
| Intro slide 1 | `152:2` | `164:9` |
| Intro slide 2 | `152:34` | `164:29` |
| Intro slide 3 / completion | `152:64` | `164:49` |
| Public entry / default | `157:5` | `164:70` |
| Public entry / guest loading | `173:16` | `173:34` |
| Public entry / guest error | `157:35` | `164:89` |
| Root loading | `174:106` | `174:114` |

The copy is sourced from `IntroCarousel.tsx` and `app/index.tsx`, with the
canonical `Opportunities` wording and verified-data constraint applied from
the product contract. No programme/domain/skills selection prompt was added.

## Product coverage matrix

| Product surface | Repository source | Figma status | Required design output |
| --- | --- | --- | --- |
| Intro carousel / public landing / guest entry | `src/components/brand/IntroCarousel.tsx`, `app/index.tsx` | Partial `148:2` (mobile + web) | first-launch carousel, skip/next/complete, canonical pre-auth landing, guest loading/error, root loading; public legal links remain a documented code/design gap |
| Sign in | `app/(auth)/sign-in.tsx`, `AuthScreen.tsx` | Missing | validation, submitting, failure, success/redirect |
| Signup/email code | `app/(auth)/signup.tsx`, `SignUpScreen.tsx` | Partial `75:2` | full fields, legal consent, resend/expiry, duplicate/network states |
| Forgot password | `app/(auth)/forgot-password.tsx` | Missing | request, sent, invalid, expired, recovery |
| Legal acceptance and public legal content | `LegalAcceptanceGate.tsx`, `TermsScreen.tsx`, `PrivacyScreen.tsx` | Missing/partial code surface | required acceptance, terms/privacy overlay, read-to-end, leave/signout, standalone/public-link decision, operator metadata state |
| Account-type gate | `AccountTypeGate.tsx` | Partial `76:2` | canonical six choices, loading, validation, hidden dormant types |
| SS1 onboarding | `SeniorSecondaryExploreSetupForm.tsx` | Partial `76:2` | complete subject/programme flow and all data states |
| SS2 onboarding | `SeniorSecondaryExploreSetupForm.tsx` | Partial `76:2` | complete flow, resume, validation |
| SS3 onboarding | `ss3-student-flow.md`, forms | Missing | SS3-specific setup and states |
| JAMB onboarding | `JambSetupForm.tsx` | Missing | subjects, programme, university, requirements, errors |
| Undergraduate onboarding | `CurrentStudentSetupForm.tsx` | Missing | university-first flow and programme offering selection |
| Educator onboarding | `EducatorOnboarding.tsx` | Missing | organisation/access/verification/completion |
| Admission Intelligence | `AdmissionBrowseScreen.tsx`, `AdmissionInsightScreen.tsx` | Missing | school, programme, subjects modes and result states |
| Programme overview/detail | `ProgrammeOverviewScreen.tsx`, `ProgrammeDetailRefinedScreen.tsx` | Missing | source context, requirements, domains, actions |
| Explore mobile | `ExploreScreen.tsx` | Partial `28:3` | reconcile data, skills match, empty/error/locked states |
| Explore desktop | `ExploreScreen.tsx` | Partial `28:5` | same behavior as mobile, responsive differences |
| Domain detail | `DomainDetailScreen.tsx` | Partial `28:4` | subgroups, roles, skills, resources, save/guidance/note states |
| Subgroup content | `RoleClusterSection.tsx` and domain data | Missing | grouped content within domain, not separate nav |
| Role detail | `RoleDetailScreen.tsx` | Missing | role-owned skills/tools/resources, report/save/share |
| Compare | `ProgrammeCompareScreen.tsx` | Missing | selection, comparison, empty/error states |
| Pathways / elite | pathway and elite screens | Missing | route-specific states and dormant/locked distinctions |
| Skills / Fields legacy | `SkillsScreen.tsx`, `FieldsScreen.tsx` | Missing | compatibility IA, browse/track/locked states |
| Skills Match | `SkillDiscoveryPanel.tsx` | Missing | learned/intended, all/any, results, no-match, admin lens |
| SkillsBridge | `SkillsBridge.tsx` | Missing | foundations/domain/role bridge and covered/gap variants |
| Inline resources | `LearningResourcesBlock.tsx` | Missing | open/save/saved/missing-link/guest/failure |
| My World | `MyWorldScreen.tsx` | Missing | saved groups, Saved learning, notes, subscriptions, empty/remove |
| Career profile | `CareerProfileScreen.tsx` | Missing | saved/bookmarked and profile context |
| Guidance selection | `GuidanceReportButton.tsx` | Missing | add/remove guidance, pending/error/guest |
| Report output | `PdfExportButton.tsx`, backend reports | Missing | no-path, print, download, share, locked/unavailable |
| Opportunities hub | `OpportunitiesScreen.tsx` | Missing | coming-soon/empty/live only after verified data |
| Opportunity details | opportunity/organisation screens | Missing | real row, missing row, save/subscribe |
| Scholarships/windows | scholarship/application screens | Missing | availability and date-state variants |
| Admin shell/dashboard | `AdminShell`, `GeneralDashboardScreen` | Missing | separate admin IA and permission states |
| Student provisioning | `StudentProvisioningScreen.tsx` | Missing | import, draft, review, generate, merge, delete |
| Admin guidance/report | admin guidance/session screens | Missing | target-student context, consent, report/export |
| Verification/access | verification/affiliation screens | Missing | access, proof, pending, rejected, success |
| Admin intelligence | domain reach, skills gap, market, peers | Missing | verified/coming-soon/permission states |
| Community/feed/guild | community/feed/guild screens | Missing | social states and compatibility entry |
| Portfolio/GitHub | portfolio/profile routes | Missing | artifacts, sharing, empty/failure |
| Map/lessons/streaks | legacy learning screens | Missing | feature-gated learning and progression states |
| Settings/privacy/school | settings and profile routes | Missing | account, legal, notifications, school sharing |
| Rewards/commerce | game/rewards/merch routes | Missing | gated reward and redemption states |

## Reconciliation rules for future Figma work

1. Use `Opportunities` everywhere. If a legacy mockup says `Jobs`, mark it as
   obsolete and do not propagate it.
2. Use `Admission Intelligence` everywhere. Treat `Admission Path` as legacy
   terminology that must not become a second product area.
3. Keep professional, skilled-worker, and graduate out of the visible gate.
4. Show subgroups as domain content. Do not create a primary subgroup tab unless
   the product decision changes.
5. Design each screen around actual route/data/persistence behavior, not only a
   static happy-path frame.
6. Every state the code can produce needs a named Figma variant or documented
   reason it is intentionally not designed in the current slice.
7. Use semantic variables from the existing Figma library and shared code
   tokens. Do not create ad-hoc component styles.
8. Preserve student/admin separation. Shared catalogue detail components may be
   reused, but the shell, permissions, context, and actions differ.
9. Resources are saveable; individual skills are not currently saveable. Do not
   draw a saved-skill success state until the data contract exists.
10. Report selection is independent from bookmarking. A selected report branch
    and a saved card are different states.
11. Opportunity cards must distinguish real, fallback, coming-soon, empty, and
    locked data. Do not show employment claims without verified rows.
12. Every composed screen must be annotated with entry route, data source,
    persistence, feedback, accessibility, and exit destinations.

## Required Figma state families

The following state families should be designed as reusable patterns and then
applied to composed screens:

- authentication: idle, field validation, submitting, code sent, code rejected,
  expired, duplicate, network error, success redirect;
- onboarding: unselected, selected, searching, no result, unavailable, invalid,
  saved draft, resume, exit guard, completed;
- data surfaces: pending, real, fallback, coming-soon, locked, empty, error,
  offline, retry;
- saveable entities: save, saving, saved, remove, removing, failed, guest;
- resources: open, missing trusted link, save resource, saved resource, failed
  save, guest;
- report: no path, path ready, branch selected, export pending, browser print,
  mobile locked, share unavailable, permission denied, incomplete source;
- admin: unauthorised, verification pending, proof required, consent required,
  roster empty, draft review, generation pending, generation failed, completed;
- accessibility: focus, keyboard, expanded/collapsed, selected/checked,
  reduced-motion, error association, destructive confirmation.

## Component and system coverage matrix

Figma implementation also requires component-level and system-level coverage.
The existing `7:6` Components page and `7:7`/`7:8`/`7:10`/`7:11` primitives are
not enough to implement the product behavior described in the repository.

Codex owns the repository audit and the complete behavior contract before any
Figma mapping or implementation is requested. The Figma handoff is not allowed
to defer missing state, data, permission, persistence, recovery, accessibility,
motion, or test decisions to an unspecified future implementer.

| System/component family | Code evidence | Current Figma status | Required output |
| --- | --- | --- | --- |
| ReferenceShell/navigation | `src/components/shell/ReferenceShell.tsx`, navigation helpers | Partial design-system context | desktop/mobile shell, selected/keyboard/focus, auth/admin/legacy route variants |
| Auth fields/legal/consent | `src/screens/auth/authShared.tsx`, `LegalAcceptanceGate.tsx`, `OAuthConsentModal.tsx` | Input primitive only | validation, busy, error, legal modal, provider consent, focus restoration |
| Onboarding inputs/search/chips | `src/components/onboarding/*` | Partial onboarding `76:2` | combobox, no result, loading, invalid, selected/disabled chips, resume/exit guard |
| DataStateView/empty/error boundaries | `DataStateView.tsx`, `EmptyState.tsx`, `ScreenErrorBoundary.tsx` | Missing | reusable variants for all data states and recovery actions |
| Catalogue cards | `RoleCard`, `OpportunityCard`, `OrganisationCard`, `ScholarshipCard`, `ApplicationWindowCard`, `ElitePathwayCard` | Missing | verified/partial/locked/coming-soon cards and action variants |
| Save/subscribe/guidance/note actions | `SaveButton`, `SubscribeButton`, `GuidanceReportButton`, `NotesFab`, `NotesWidget` | Missing | idle/busy/saved/removed/failed/guest/permission variants |
| Report export/share | `PdfExportButton`, `ShareExportButton` | Missing | print/download/share, mobile locked, unavailable share, no-path |
| Skills/resources | `SkillsBridge`, `SkillDiscoveryPanel`, `LearningResourcesBlock` | Missing | covered/gap, learned/intended, match all/any, resource save/missing-link |
| Admin tables/review/modals | `src/components/admin/*`, `AdminDataTable`, `ReviewModal`, `FlagModal` | Missing | permissions, selection, bulk action, proof/consent, delete confirmation |
| Community/social | `FeedCard`, `CommentSheet`, `ChallengeCard`, `FlagModal` | Missing | loading/empty/error, reaction, comment, moderation and report states |
| Learning/simulator components | simulator cards, `TrackSearch`, animation/progression components | Missing | gated/progress/lab/download/reward and reduced-motion variants |
| Motion/feedback primitives | `src/components/animations/*`, `src/theme/motion.ts` | Foundation only | documented transition, reduced-motion, haptic and focus behavior |
| Tokens and typography | `src/theme/*`, Figma foundations `7:3`, `7:5` | Partial | reconcile code/Figma values, dark mode, contrast and platform variants |

For each component family, Figma must annotate the code consumer, state source,
event/persistence boundary, accessibility state, and the screens where the
component is used. A component variant is not complete if it only changes colour
or copy while leaving the interaction, data, permission, and recovery behavior
undefined.

The component inventory being handed to Figma is all 153 files under
`src/components/` (146 TSX components and 7 TypeScript helpers). The largest
groups are `careerIntelligence` (53), `simulators` (27), root-level shared
components (37), `onboarding` (10), `admin` (7), and `animations` (7); the
remaining auth, shell, navigation, design-asset, wallet, UI, and web modules
are also included. This is a coverage obligation, not a requirement to create
153 standalone frames: behavior-bearing exports need component variants and
consumer mappings, while pure wrappers/assets need token, semantic, contrast,
platform, and consumer review.

The complete file-level register and each directory's audit disposition are
maintained in `docs/PRODUCT_BEHAVIOR_CONTRACT.md` under “File-level component
register.” That register is authoritative; this document supplies the Figma
component-set, variant, consumer-screen, and prototype requirements.

Before implementation, Codex must identify for each mapped component its state source,
callbacks, persistence/network boundary, permission/consent rule, recovery
behavior, reduced-motion behavior, accessibility semantics, test evidence, and
the composed screens that consume it. Panels such as admin metrics or
intelligence summaries remain component-level unless routing makes them a
standalone page.

### High-risk component variants required

| Code component | Required Figma component set/variants |
| --- | --- |
| `SaveButton` | save, saving, saved, remove, removing, failed, guest/locked, reduced-motion |
| `DataStateView` / `ScreenErrorBoundary` | pending, fallback, coming-soon, locked, empty, error, retrying, recovered |
| `DetailScaffold` action bar | back, save, add/remove guidance, print/download, share, unavailable/locked |
| `LiveAdmissionSearchField` | idle, focused, searching, real results, no results, unavailable, typed registration, error |
| `LiveSubjectMultiSelect` / `ChipSelect` | required fixed subject, selected, unselected, disabled, loading, no result, error |
| `ReferenceShell` / `SearchOverlay` | mobile/desktop, selected tab, drawer, search idle/loading/results/empty/error, keyboard focus |
| `OfflineBanner` / `SyncIndicator` | offline, syncing, synced, failed sync, queued write |
| `OnboardingBackGuard` | guard open, delete account, continue later, continue onboarding, focus restoration |
| `AdminDataTable` / `ReviewModal` | empty, loading, selected rows, bulk action, validation, confirmation, failure |
| motion primitives | normal motion, reduced-motion fade-only, interrupted/cancelled transition |

## Complete screen-file coverage register

This register is intentionally file-based so a future session can verify that no
screen was omitted from the design audit. Route wrappers delegate to these
screen files; wrapper-only layouts are covered by the shell/navigation and
supporting-system requirements below.

### Partial or existing Figma coverage

| Screen file | Figma coverage | Required additions |
| --- | --- | --- |
| `src/screens/SignUpScreen.tsx` | Partial: `75:2` | legal, validation, resend/expiry, network, focus, and redirect variants |
| `src/screens/onboarding/AccountTypeGate.tsx` | Partial: `76:2` | canonical six-choice gate, selected/error/loading states |
| `src/screens/OnboardingFlow.tsx` | Partial: `76:2` | complete SS1/SS2/SS3/JAMB/undergraduate/educator transitions |
| `src/screens/OnboardingScreen.tsx` | Partial/legacy | redirect or explicit compatibility treatment |
| `src/screens/ExploreScreen.tsx` | Partial: `28:3`, `28:5` | skill match, admin context, search/error/empty/offline variants |
| `src/screens/careerIntelligence/DomainDetailScreen.tsx` | Partial: `28:4` | subgroup/role/resources/save/report/note/state variants |

All other screen files below are currently missing from the supplied Figma file.
They still require a Figma coverage decision and a design-ready state family.

### Authentication and legal

- `src/screens/AuthScreen.tsx`
- `src/screens/ForgotPasswordScreen.tsx`
- `src/screens/TermsScreen.tsx`
- `src/screens/PrivacyScreen.tsx`

`src/screens/auth/authShared.tsx` is a helper/component module, not a standalone
route; its field, scaffold, legal modal, info, and error variants belong in the
auth component library.

### Admission and career intelligence

- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`
- `src/screens/careerIntelligence/AdmissionInsightScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx`
- `src/screens/careerIntelligence/DomainExplorerScreen.tsx`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeCompareScreen.tsx`
- `src/screens/careerIntelligence/PathwaysHubScreen.tsx`
- `src/screens/careerIntelligence/ElitePathwaysHubScreen.tsx`
- `src/screens/careerIntelligence/ElitePathwayDetailScreen.tsx`
- `src/screens/careerIntelligence/CareerChangerScreen.tsx`
- `src/screens/careerIntelligence/QualificationUpgradesScreen.tsx`
- `src/screens/careerIntelligence/CharteredCredentialsScreen.tsx`
- `src/screens/careerIntelligence/PhdPathwayScreen.tsx`
- `src/screens/careerIntelligence/EntrepreneurshipPathwayScreen.tsx`
- `src/screens/careerIntelligence/OpportunityDetailScreen.tsx`
- `src/screens/careerIntelligence/OrganisationProfileScreen.tsx`
- `src/screens/careerIntelligence/ScholarshipsScreen.tsx`
- `src/screens/careerIntelligence/ApplicationWindowsScreen.tsx`
- `src/screens/OpportunitiesScreen.tsx`

### Student personal, social, and settings surfaces

- `src/screens/CareerHomeScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/CareerProfileScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/MyWorldScreen.tsx`
- `src/screens/DiaryScreen.tsx`
- `src/screens/NotificationSettingsScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `src/screens/MySchoolScreen.tsx`
- `src/screens/GitHubScreen.tsx`
- `src/screens/CommunityScreen.tsx`
- `src/screens/FeedScreen.tsx`
- `src/screens/GuildScreen.tsx`
- `src/screens/LeaderboardScreen.tsx`
- `src/screens/ReferralScreen.tsx`

### Skills and legacy learning

- `src/screens/SkillsScreen.tsx`
- `src/screens/FieldsScreen.tsx`
- `src/screens/QuantMapScreen.tsx`
- `src/screens/InterviewModeScreen.tsx`
- `src/screens/DownloadTrackScreen.tsx`
- `src/screens/WorldScreen.tsx`
- `src/screens/IslandMapScreen.tsx`
- `src/screens/LessonScreen.tsx`
- `src/screens/TrackRoomScreen.tsx`
- `src/screens/TrackSetupScreen.tsx`
- `src/screens/PostIslandTrackSelection.tsx`
- `src/screens/LearnMoreScreen.tsx`
- `src/screens/EcosystemTrackScreen.tsx`
- `src/screens/CairoBuilderTrackScreen.tsx`
- `src/screens/StarknetTrackScreen.tsx`
- `src/screens/StreaksScreen.tsx`

### Portfolio, rewards, and commerce

- `src/screens/PortfolioScreen.tsx`
- `src/screens/PortfolioHubScreen.tsx`
- `src/screens/MerchandiseScreen.tsx`

### Admin and educator workspace

- `src/screens/admin/EducatorOnboarding.tsx`
- `src/screens/admin/AdminCareerDetailScreen.tsx`
- `src/screens/admin/AdminExploreIntro.tsx`
- `src/screens/admin/AdminShell.tsx`
- `src/screens/admin/AffiliationScreen.tsx`
- `src/screens/admin/ComingSoonPanel.tsx`
- `src/screens/admin/DomainRankPanel.tsx`
- `src/screens/admin/GeneralDashboardScreen.tsx`
- `src/screens/admin/DomainReachAuditScreen.tsx`
- `src/screens/admin/ExpertDossierScreen.tsx`
- `src/screens/admin/AdminFeedbackScreen.tsx`
- `src/screens/admin/IntelligenceAlerts.tsx`
- `src/screens/admin/ProgrammeDashboardScreen.tsx`
- `src/screens/admin/ProgrammeDemandTable.tsx`
- `src/screens/admin/SchoolGuidanceDashboardScreen.tsx`
- `src/screens/admin/MarketIntelligenceScreen.tsx`
- `src/screens/admin/PeersScreen.tsx`
- `src/screens/admin/SessionModeScreen.tsx`
- `src/screens/admin/SkillsGapScreen.tsx`
- `src/screens/admin/StudentManagementScreen.tsx`
- `src/screens/admin/StudentProvisioningScreen.tsx`
- `src/screens/admin/StatCard.tsx`
- `src/screens/admin/VerificationScreen.tsx`
- `src/screens/admin/InstitutionProfileScreen.tsx`

`AdminDataTable`-style modules, `StatCard`, `DomainRankPanel`,
`ProgrammeDashboardScreen`, `ProgrammeDemandTable`, and `IntelligenceAlerts`
are supporting components/panels. They require component-level Figma variants,
not necessarily independent routes, unless a route mounts them as a full page.

### Route wrappers and compatibility aliases

The route inventory also includes nested layouts and aliases that must not create
duplicate design contracts. Their contract is the delegated screen plus the
route-specific context:

- Auth: `app/(auth)/*` and `app/index.tsx` landing/legal entry.
- Student shell: `app/(tabs)/home`, `explore`, `opportunities`, `myworld`,
  `profile`, and their nested routes.
- Admission/career: `app/(tabs)/explore/admission`, `domains`, `domain/[id]`,
  `programme/[id]`, `role/[id]`, `compare`, `elite`, and `pathways/*`.
- Admin: `app/(admin)/*` and `app/(admin)/workspace-explore/*`.
- Legacy: `app/(tabs)/fields`, `skills`, `map`, `community`, `guild`, `feed`,
  `portfolio`, `streaks`, `settings`, plus `app/world`, `app/track-room`,
  `app/skills/lesson`, `app/cairo-builder-track`, `app/ecosystem-track`,
  `app/starknet-track`, and `app/merchandise`.

For each alias, the Figma annotation must state the source route, delegated
screen, caller context, and whether the route is primary, compatibility-only,
hidden from the shell, locked, or obsolete.

### Exact route manifest audited

The following non-layout route files were present in the audit. Each delegates to
one of the screen contracts in the master document or is explicitly classified
as a wrapper/compatibility route:

```text
app/(admin)/affiliation.tsx
app/(admin)/dashboard.tsx
app/(admin)/domain-reach.tsx
app/(admin)/expert-dossier.tsx
app/(admin)/feedback.tsx
app/(admin)/guidance.tsx
app/(admin)/market-intelligence.tsx
app/(admin)/peers.tsx
app/(admin)/session.tsx
app/(admin)/skills-gap.tsx
app/(admin)/students.tsx
app/(admin)/students/[userId]/guidance.tsx
app/(admin)/verify.tsx
app/(admin)/workspace-explore/admission/[jambName].tsx
app/(admin)/workspace-explore/admission/index.tsx
app/(admin)/workspace-explore/compare.tsx
app/(admin)/workspace-explore/domain/[id].tsx
app/(admin)/workspace-explore/domains/index.tsx
app/(admin)/workspace-explore/elite/[id].tsx
app/(admin)/workspace-explore/elite/index.tsx
app/(admin)/workspace-explore/index.tsx
app/(admin)/workspace-explore/pathways/career-change.tsx
app/(admin)/workspace-explore/pathways/credentials.tsx
app/(admin)/workspace-explore/pathways/entrepreneurship.tsx
app/(admin)/workspace-explore/pathways/index.tsx
app/(admin)/workspace-explore/pathways/phd.tsx
app/(admin)/workspace-explore/pathways/upgrades.tsx
app/(admin)/workspace-explore/programme/[id].tsx
app/(admin)/workspace-explore/role/[id].tsx
app/(admin)/workspace-profile.tsx
app/(auth)/forgot-password.tsx
app/(auth)/onboarding.tsx
app/(auth)/sign-in.tsx
app/(auth)/signup.tsx
app/(tabs)/community/guild.tsx
app/(tabs)/community/index.tsx
app/(tabs)/community/leaderboard.tsx
app/(tabs)/community/referral.tsx
app/(tabs)/explore/admission/[jambName].tsx
app/(tabs)/explore/admission/index.tsx
app/(tabs)/explore/compare.tsx
app/(tabs)/explore/domain/[id].tsx
app/(tabs)/explore/domains/index.tsx
app/(tabs)/explore/elite/[id].tsx
app/(tabs)/explore/elite/index.tsx
app/(tabs)/explore/index.tsx
app/(tabs)/explore/pathways/career-change.tsx
app/(tabs)/explore/pathways/credentials.tsx
app/(tabs)/explore/pathways/entrepreneurship.tsx
app/(tabs)/explore/pathways/index.tsx
app/(tabs)/explore/pathways/phd.tsx
app/(tabs)/explore/pathways/upgrades.tsx
app/(tabs)/explore/programme/[id].tsx
app/(tabs)/explore/role/[id].tsx
app/(tabs)/feed/index.tsx
app/(tabs)/fields/index.tsx
app/(tabs)/guild/index.tsx
app/(tabs)/home/index.tsx
app/(tabs)/map/index.tsx
app/(tabs)/map/island.tsx
app/(tabs)/map/lesson.tsx
app/(tabs)/myworld/game-profile.tsx
app/(tabs)/myworld/index.tsx
app/(tabs)/opportunities/index.tsx
app/(tabs)/opportunities/opportunity/[id].tsx
app/(tabs)/opportunities/organisation/[id].tsx
app/(tabs)/opportunities/scholarships/index.tsx
app/(tabs)/opportunities/windows/index.tsx
app/(tabs)/portfolio/hub.tsx
app/(tabs)/portfolio/index.tsx
app/(tabs)/profile/diary.tsx
app/(tabs)/profile/github.tsx
app/(tabs)/profile/index.tsx
app/(tabs)/settings/index.tsx
app/(tabs)/settings/my-school.tsx
app/(tabs)/skills/index.tsx
app/(tabs)/skills/interview.tsx
app/(tabs)/skills/quant-map.tsx
app/(tabs)/streaks/index.tsx
app/cairo-builder-track/index.tsx
app/ecosystem-track/index.tsx
app/index.tsx
app/merchandise/index.tsx
app/skills/lesson.tsx
app/starknet-track/index.tsx
app/track-room/index.tsx
app/world/index.tsx
```

Layout files (`app/_layout.tsx`, auth/tabs/admin and nested `_layout.tsx` files)
are not omitted: they are covered by the shell, routing, provider, and
permission-system annotations and must be tested as route boundaries.

## Supporting-system coverage required before implementation

The design handoff must also account for systems that are not visible as a
single frame:

- route guards, nested stacks, deep links, legacy redirects, and resume routes;
- auth/session hydration, account-type gates, admin permissions, consent, and
  legal acceptance;
- data envelopes, source/date metadata, cache and retry behavior;
- persistence, local drafts, offline queue, sync failure, optimistic rollback,
  and focus refetch;
- backend migration/data gates, report authorization, saved-resource constraints,
  and opportunity verification;
- test coverage and known untested states;
- semantic tokens, typography, contrast, dark mode, icon/artwork source, and
  product/legal copy;
- analytics consent, notifications, feedback, external share/OAuth/GitHub,
  rewards, wallet, and commerce effects.

Where a Figma component is intended to represent a reusable code component,
record the code path and props/state mapping for Code Connect or the equivalent
handoff annotation. Code Connect is a mapping aid, not a substitute for the
behavior, data, permission, and acceptance contract.

These systems should be represented by annotations, prototype transitions,
state diagrams, or component documentation rather than forced into a static
screen. They are still required inputs to the Figma-to-code handoff.

## Prioritized design backlog

### P0 - reconcile the core release

1. Update navigation and terminology to canonical product decisions.
2. Complete visible onboarding for SS1, SS2, SS3, JAMB, undergraduate, and
   educator/institution.
3. Add all three Admission Intelligence modes and their state variants.
4. Complete Explore -> programme -> domain -> subgroup -> role with data,
   resource, save, note, and guidance actions.
5. Add My World saved learning and report output states.

### P1 - design missing product systems

1. Create the separate admin dashboard/workspace system.
2. Reconcile legacy Skills/Fields, Skills Match, and SkillsBridge.
3. Design Opportunities after the verified-data gate is confirmed.
4. Add compare, pathways, elite, scholarship, and application-window states.
5. Add profile, settings, school, community, portfolio, and legacy learning
   entry/compatibility flows.

### P2 - quality and maintenance

1. Resolve known code/Figma font, radius, colour, and contrast disagreements.
2. Add Code Connect mappings for shared components where useful.
3. Add Figma annotations linking each composed screen to route, data, state, and
   acceptance criteria.
4. Maintain this gap matrix whenever a route or feature is added.

## Handoff procedure

Before editing this Figma file, a future Codex session must:

1. Read `docs/PRODUCT_BEHAVIOR_CONTRACT.md`.
2. Read the relevant route, screen, components, data client, types, backend
   route, migration, tests, and existing mockup.
3. Mark the target row in this document as planned.
4. Load the relevant Figma skill and inspect the design-system components and
   variables to reuse.
5. Design the complete state family for the target slice, not just the happy
   path.
6. Verify route, data, persistence, feedback, motion, and accessibility before
   implementing code.

No Figma write or code implementation is authorized by this audit alone. The
next action should be a reviewed, vertical slice chosen from the P0 backlog.
