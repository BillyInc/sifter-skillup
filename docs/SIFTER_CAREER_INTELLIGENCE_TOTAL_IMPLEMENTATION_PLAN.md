# Sifter LevelUp Career Intelligence — Total Implementation Plan

## Purpose

Redesign and implement the complete career-intelligence experience to the quality and granularity of the supplied educational infographic mockups.

The mockups are the visual acceptance standard—not loose inspiration. The implementation must preserve the actual project routes, components, data contracts and user flows while improving weak information presentation, visual hierarchy, states, responsive behaviour and accessibility.

The plan is staged so the initial requested screens become an approval gate, followed by the total career-intelligence implementation.

## Scope boundary

### Included

- Student career-intelligence surfaces
- Admin career-intelligence surfaces
- Web/Vite and Expo/mobile layouts
- Light and dark mode
- Loading, populated, empty, error, locked, pending, selected and saved states
- Shared career-intelligence components and semantic tokens
- Student/admin data presentation and flow relationships
- Original career-intelligence illustration assets
- Screenshot-based visual verification

### Explicitly excluded

Legacy/gaming routes are not redesigned or migrated. This includes the world, map, island, lesson, track, streak, guild, leaderboard and related gaming surfaces.

## Source of truth

The implementation must use:

- Existing route files under `app/`
- Existing screen components under `src/screens/`
- Existing career-intelligence components under `src/components/careerIntelligence/`
- Existing `careerData` methods and `DataState<T>` envelopes
- Existing backend response types and source-backed data
- Existing onboarding, authentication, saved-item and notes persistence
- The supplied reference mockups for visual direction
- The supplied admin tone/data-presentation reference at `C:/Users/USER/.codex/attachments/34e82144-6159-4cb2-921c-0059593a0b69/pasted-text.txt`

No universities, programmes, subjects, cut-offs, roles, skills, opportunities, organisations, dates, metrics, salaries, match percentages or user details may be invented.

The canonical product relationship is:

```text
Subjects → Programmes → Universities → Domains → Subgroups → Roles → Skills → Opportunities
```

The canonical admin relationship is:

```text
Student guidance → Checkpoint → Review → Verify → Report
```

## Phase 0 — Audit and traceability

Before visual or code implementation, create a route and component registry.

Each screen dossier must record:

- Stable screen ID
- Route and source component
- Audience: student or admin
- Entry routes and exit routes
- Exact component tree
- Exact copy/data provenance
- `careerData` methods and response types
- User actions and state changes
- Loading, populated, empty, error, locked, pending, selected and saved states
- Web layout and mobile layout differences
- Light/dark requirements
- Associated mockup files

The first registry must cover the existing career-intelligence routes, including:

- Intro/auth/legal/onboarding
- Home, Explore, Opportunities, Profile and My World
- Admission browse and insight
- Programme overview, detail and compare
- Domain explorer, domain detail and subgroup detail
- Role detail
- Pathways: career change, credentials, entrepreneurship, PhD and upgrades
- Elite pathways
- Scholarships and application windows
- Admin dashboard, guidance, students, verification, market intelligence and workspace Explore

The registry is the traceability layer that prevents a mockup from becoming an invented standalone page.

## Phase 1 — Shared visual foundation

Create the shared foundation before migrating individual routes.

### Student career-intelligence language

Use the supplied reference language:

- Illustrated hero areas
- Rounded breadcrumb rails
- Pastel lilac, mint, sky and yellow surfaces
- Teal and purple accents
- Section headings with circular icon badges
- Dense educational explainer cards
- Connected journey/path sections
- Strong bottom CTAs
- Friendly but structured typography
- Clear source, locked and pending states

### Admin career-intelligence language

Use the same brand family and semantic tokens, but make admin surfaces more information-dense:

- Stronger table/list hierarchy
- Verification and source badges
- Filter and review controls
- Guidance checkpoints
- Audit/review panels
- Clear student context
- More restrained illustration use

### Theme and responsive foundation

Extend the existing semantic `LightColors` and `DarkColors` system with career-intelligence tokens for:

- pastel surfaces
- hero backgrounds
- teal/purple accents
- semantic status colours
- borders and dividers
- selected, disabled, locked, pending and error states
- illustration variants

Do not hardcode route-specific colours. Do not implement dark mode as inversion.

Create responsive layout primitives that support desktop web, compact web/tablet and Expo mobile with safe areas, touch-sized actions, stacked mobile cards, bottom sheets where needed and no horizontal overflow.

## Phase 2 — Dedicated illustration and component system

Create original reusable career-intelligence assets rather than relying on generic icon grids:

- intro/auth hero scenes
- student/profile scenes
- programme, university and domain motifs
- role and opportunity motifs
- journey/path illustrations
- source, verification, pending and locked illustrations
- light and dark variants

Refine and document the existing career-intelligence components, including `DataStateView`, `DetailScaffold`, `DataSourceBadge`, `StatusBadge`, `SearchComponents`, `SaveButton`, `OpportunityCard`, `RoleCard`, `DomainChip`, `RouteLine` and `LevelUpCTA`.

Every shared component must document its props, visual variants, interaction states, data requirements, consuming screens, web/mobile behaviour and light/dark behaviour.

Shared mechanics are allowed; every screen must still have its own composition and information hierarchy.

## Phase 3 — Initial gold-standard approval gate

Produce regular image mockups before implementation for:

1. Intro carousel
2. Terms and privacy/legal confirmation
3. Onboarding/account-type selection
4. Auth welcome
5. Login
6. Signup
7. Forgot password
8. Home
9. Explore
10. Opportunities
11. Profile
12. My World

Each receives a desktop/web image, mobile image, light variant, dark variant, relevant state images and a linked screen dossier.

These screens must be visually differentiated. They must not reuse one generic template with changed labels.

Implementation does not expand until this gate is approved against the supplied mockups for hierarchy, density, illustration, spacing, card treatment and CTA composition.

## Phase 4 — Core student implementation

After approval, migrate the approved designs in this order:

1. `IntroCarousel` and landing/auth handoff
2. `TermsScreen`, privacy and legal confirmation states
3. `AccountTypeGate` and `OnboardingFlow`
4. `AuthScreen`, `SignUpScreen` and `ForgotPasswordScreen`
5. `CareerHomeScreen`
6. `ExploreScreen`
7. `OpportunitiesScreen`
8. `CareerProfileScreen`
9. `MyWorldScreen`

Preserve existing `INTRO_SEEN_KEY`, guest browsing, login/signup transitions, onboarding draft persistence, saved items, notes, opportunity gating, back navigation and resume navigation.

Refine data presentation so the student sees understandable, source-aware information rather than raw structures or disconnected cards.

## Phase 5 — Full student career-intelligence rollout

After the core gate passes, migrate all remaining student career-intelligence routes:

- Admission browse and insight
- Programme overview, detail and compare
- Domain explorer, domain detail and subgroup detail
- Role detail
- Pathways hub and career-change, credentials, entrepreneurship, PhD and upgrade routes
- Elite pathways hub and detail
- Scholarships
- Application windows
- Opportunity detail
- Organisation profile
- Guided field selection

Each route must use the correct relationship in the guidance chain rather than presenting career mapping before its required academic context.

## Phase 6 — Full admin career-intelligence rollout

The admin product must feel deliberately different from the student product. It remains part of the same system through shared tokens, content hierarchy, evidence rules and data contracts, but it is designed for adult counsellors, teachers, school administrators and other operational users.

The pasted admin reference is used for tone, density, information hierarchy and action design. Its suggested left-sidebar/top-bar navigation is not adopted as a requirement. Existing routing and navigation must be preserved unless the route audit proves a navigation change is necessary.

### Admin design principles

- Tone: clear, precise, professional and calm
- Language: neutral, plain English with short, direct action labels
- Density: medium; tables, lists, filters, statuses and bulk actions are appropriate
- Visual weight: cleaner whites/grays, tighter spacing and sharper hierarchy; fewer decorative illustrations
- Goal: guide, monitor, review, annotate, decide and report
- Charts: only when they materially support an admin decision; no decorative dashboards
- Shared content: show the same student guidance hierarchy, but expose evidence, ownership and administrative actions more clearly

The implementation must not use student encouragement language in admin surfaces. Prefer `Guidance status`, `Recommended next step`, `Assign assessment`, `View assessment results`, `Add note`, `Mark as reviewed`, `Include in report` and `Recommend to student` where those actions exist.

### Admin data-presentation work

The admin pass is not limited to restyling the dashboard. Every admin screen and admin component must be audited and refined for data presentation:

- clear labels instead of raw IDs or ambiguous abbreviations
- visible source/evidence status
- explicit ownership and verification state
- filterable and sortable lists where the task requires scanning
- bulk actions only where the underlying operation exists
- precise empty, pending, error and permission states
- student context preserved through deep links and review flows
- no fabricated counts, charts, dates, outcomes or aggregate metrics

### Required admin screen patterns

#### Students list

Use a searchable/filterable working list with the fields supported by the actual data contract, such as student identity, class/stream, guidance status, last activity and available actions. Statuses must be source-backed and may include `Not started`, `In progress`, `Ready for review` and `Report generated` only when those states exist in the implementation.

Bulk actions such as assigning guidance, exporting or marking reviewed may be shown only when the corresponding operation is implemented. Selecting a student must open the same Programme → Domain → Subgroup → Role hierarchy the student followed, in an admin review context.

#### Individual student guidance view

This is the primary admin screen. It must show:

- the exact student guidance path
- the same content hierarchy the student sees
- source/evidence status at each layer
- private counsellor notes where supported
- `Mark as reviewed`
- `Recommend next step`
- `Include in report`
- print/download report actions where supported
- review/change history where supported

The guidance path remains soft and recognisable; a structured admin action panel provides the operational controls. The admin panel must not replace or distort the student’s path.

#### Programme, domain, subgroup and role review screens

The same entity must serve a different admin job:

- Programme: formal definition, curriculum coverage, recorded outcomes, learning sequence, source status and review/report actions
- Domain: shared foundation, current subgroups, ownership/data gaps and domain-level notes
- Subgroup: what it adds to the domain, carry-over versus new learning, tools labelled as options rather than requirements, resources and recommendation actions
- Role: occupational description, staged capability build, typed resources, evidence limits and recommendation/report actions

The numbers and evidence limits above must come from the project data. If they are unavailable, show an explicit unavailable/source state rather than an example value.

#### Reports

Design the clean school-facing report output before polishing the report list. The report contract should support, where available:

- student details
- current guidance path
- strengths/recommended areas
- optional counsellor notes
- suggested next actions
- source and generation status
- print/download/export state

The report list should use simple filtering by supported date, class and status fields. Avoid decorative charts; use a simple progress or traffic-light status only when its meaning is defined by the data contract.

#### Admin dashboard

Keep the dashboard light and action-oriented. Show only supported summary values, recent activity and direct links to students needing attention. Do not add radar charts, skill matrices or large graphs merely to fill space.

#### Role-scoped views

Where the project supports multiple admin roles, scope actions and data visibility appropriately:

- counsellor: individual guidance, notes, review and recommendations
- school administrator: students, classes, provisioning and bulk actions
- super administrator: schools, system settings and cross-organisation controls

The exact roles and permissions must be read from the existing auth/admin contracts, not invented in the UI.

Implement the admin surfaces after the student foundation is stable:

- Admin dashboard
- Guidance start and student guidance
- Student management and provisioning
- Workspace Explore
- Admission/domain/programme/role review surfaces
- Verification
- Market intelligence
- Skills gap
- Domain reach
- Affiliation
- Expert dossier
- Feedback and session surfaces

Admin screens must preserve student context, source ownership, verification state and permission boundaries. They must not invent aggregate metrics or create a parallel data model. Every admin screen and component must have its own dossier, mockup, state matrix and data-presentation review before it is considered migrated.

## Phase 7 — Verification and quality gates

Verify every migrated route across:

```text
web desktop × web compact × Expo mobile
light × dark
default × loading × populated × empty × error × locked
guest × authenticated
student × admin where applicable
```

Required flow checks include intro skip/completion, terms confirmation, onboarding draft resume, auth and guest entry, Home resume guidance, Explore search/filter/no-results, programme/domain/role save and return, opportunity gating, Profile saved items/notes, My World save/remove/empty/incomplete states and admin guidance review/verification/reporting.

Required commands/checks:

- `pnpm run build:web`
- `pnpm test`
- TypeScript validation
- rendered screenshot review
- contrast and focus checks on web
- touch-target and safe-area checks on mobile
- back navigation and deep-link checks
- no raw IDs or fabricated values in visible UI
- no legacy/gaming route changes

## Completion criteria

The total implementation is complete only when:

- every in-scope route has a screen contract and approved mockup
- every visible component maps to a real component or documented asset
- every data value maps to an existing source or explicit unavailable state
- every student/admin flow preserves its relationships
- each screen has a distinct, intentional composition
- dark mode is designed and verified independently
- mobile is composed intentionally for Expo
- web and mobile share behaviour and data contracts without sharing unsuitable layouts
- rendered screenshots meet the supplied mockup quality bar
- legacy/gaming routes remain untouched

## Assumptions

- The supplied mockups are the hard visual reference for student career-intelligence surfaces.
- Admin surfaces use a related hybrid visual language rather than an identical infographic layout.
- Explicit unavailable states are preferred over silently hiding structurally important sections.
- The initial core set is an approval gate, not the final scope.
- No backend schema or API changes are made unless the audit proves they are required.
- The LevelUp logo remains replaceable and does not determine the rest of the design system.
