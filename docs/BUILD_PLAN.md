# Sifter LevelUp — Full Build Plan

> Everything from the Figma Design Prompt, minus charts/graphs (sparklines, demand meters, competitiveness gauges, peer comparison charts) and photography (replaced with domain icon system — data-forward aesthetic like Levels.fyi / Linear).

## Completed Phases

| Phase | Status | Scope |
|-------|--------|-------|
| Phase 0 | ✅ | Foundation: CompassFonts, LayoutPrimitives, Brand→token migration, 5-tab shell |
| Phase 1 | ✅ | Auth & Onboarding (10 screens): AuthScreen, SignUp, ForgotPassword, AccountTypeGate, OnboardingFlow, IntroCarousel, authShared, OnboardingBackGuard, onboarding primitives |
| Phase 2 | ✅ | Student Core (5 screens): CareerHome, Streaks→Consistency, Opportunities, Scholarships, ApplicationWindows |
| Phase 3 | ✅ | Explore polish (8 screens): PathwaysHub, CareerChanger, PhdPathway, ElitePathwaysHub, ElitePathwayDetail, CharteredCredentials, QualificationUpgrades, EntrepreneurshipPathway |
| Phase 4 | ✅ | My World Family (9 screens): Settings, Privacy, Terms, MySchool, NotificationSettings, DiaryScreen, MyWorldScreen, ProfileScreen, CareerProfileScreen |
| Phase 5 | ✅ | Community (4 screens): ReferralScreen, GuildScreen, LeaderboardScreen, FeedScreen |
| Phase 6 | ✅ | Admin (25 screens): AdminShell + all admin screens — CompassFonts migration, zero FontWeight references remaining, `@/` import paths |
| Phase 7a | ✅ | Search components: SearchOverlay, SearchBar (enhanced), SearchResultRow, SearchResultsGroup, SearchLoadingSkeleton, SearchEmptyState, ScopeChip, TermHighlight. Added SearchResult type to career.ts. Fixed FeedScreen/LeaderboardScreen/ReferralScreen CompassFonts import paths. |
| Phase 7b | ✅ | Search integration: SearchOverlay wired into ReferenceShell (global search trigger on mobile + web), scoped SearchBar in OpportunitiesScreen. Removed legacy search stub from shell. |
| Phase 8a | ✅ | New components: Toast (provider + inline + showToast), StatusBadge (locked/pending/verified/live), SkeletonRedesign (shimmer bar + SkeletonText/Avatar/Card/Row/Stat), PersonaCard, ApplicationWindowTimeline. Secondary button variant added to SifterButton. |
| Phase 8b | ✅ | InputComponents (TextInput, Select, ChipSelect, DatePicker), TierBadgeView freshness stamp, MetricTooltip relocated to careerIntelligence/ + semantic tokens, Banner unified (offline/sync/streak/celebration variants + dismiss), SifterButton `danger` → `destructive` rename. |
| Phase 9 | ✅ | All 9 legacy screens migrated: PortfolioScreen, PortfolioHubScreen, SkillsScreen, QuantMapScreen, OnboardingScreen, HomeScreen, GitHubScreen, LessonScreen, InterviewModeScreen. All pre-existing type errors fixed (13→0). Zero TypeScript errors. |
| Phase 10 | ✅ | Structural screen redesigns: responsive retrofit + token cleanup for Explore, Opportunities, Auth, My World screens. StreaksScreen/IslandMapScreen/LessonScreen/LearnMoreScreen excluded per scope. |
| Phase 11 | ✅ | Motion System: all 11 animations built — route-line draw-in, count-up, stagger, tab slide, press lift, save pop, skeleton crossfade, celebration burst, theme crossfade, shared element, reduce-motion column |
| Phase 12 | ✅ | Asset Pipeline: 3-tier domain icon system (36 clusters → 167 domains → 4,092 roles), Feather icons replacing emoji in career-intelligence screens, DomainIcon component, temp Python files deleted |
| Fixes | ✅ | webContainer width (30+ errors), CareerProfileScreen, WebGrid, IslandMapScreen |

---

## Phase 4 — My World Family (9 screens) ✅

All screens migrated to semantic tokens + CompassFonts.

| Screen | Work |
|--------|------|
| `MyWorldScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `CareerProfileScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `ProfileScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `DiaryScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `SettingsScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `PrivacyScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `TermsScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `MySchoolScreen.tsx` | ✅ Semantic tokens + CompassFonts |
| `NotificationSettingsScreen.tsx` | ✅ Semantic tokens + CompassFonts |

---

## Phase 5 — Community (4 screens)

| Screen | Current State | Work |
|--------|--------------|------|
| `GuildScreen.tsx` | Semantic tokens | Structural redesign: guild cover photo, collective route-line, member cards |
| `LeaderboardScreen.tsx` | Semantic tokens | Structural redesign: school-vs-school toggle, mono numerals, restrained identity |
| `ReferralScreen.tsx` | **LEGACY** | Full migration: Colors→semantic tokens, CompassFonts, shareable card design |
| `FeedScreen.tsx` | Semantic tokens | Structural redesign: rich role/programme embeds (mini route-cards), post cards |

---

## Phase 6 — Admin (25 screens) ✅

All 25 admin screens migrated to CompassFonts. Zero `FontWeight` or `fontWeight` references remain.

| Screen | Work |
|--------|------|
| `AdminShell.tsx` | Structural: sidebar shell with school crest, grouped nav |
| `SchoolGuidanceDashboardScreen.tsx` | KPI stat-card row, cohort route-distribution |
| `InstitutionProfileScreen.tsx` | School profile with crest, stats |
| `StudentManagementScreen.tsx` | Full data table: sortable headers, row hover, bulk actions, status pills |
| `StudentProvisioningScreen.tsx` | Provisioning flow modal: CSV upload with column mapping preview |
| `VerificationScreen.tsx` | Queue cards with document-free trust states, approve/reject |
| `FeedbackInboxScreen.tsx` | Triage list + detail pane with status workflow chips |
| `EducatorOnboarding.tsx` | Welcome sequence matching student onboarding craft level |
| `ExpertDossierScreen.tsx` | Editorial profile page for verified experts |
| `DomainIntelligenceScreen.tsx` | Domain analytics (minus charts — use stat tiles + tables) |
| `DomainRankPanel.tsx` | Domain ranking table |
| `ProgrammeDashboardScreen.tsx` | Programme stats dashboard (stat tiles, tables) |
| `SessionModeScreen.tsx` | Session/pairing mode UI |
| `AffiliationScreen.tsx` | School affiliation management |
| `PeersScreen.tsx` | Peer school comparison |
| `VsNationalScreen.tsx` | National comparison (stat tiles, tables — no charts) |
| `RemoteScreen.tsx` | Remote work analytics (stat tiles, tables) |
| `SalaryScreen.tsx` | Salary benchmarks (stat tiles, tables — no charts) |
| `TrendsScreen.tsx` | Trend data (stat tiles, tables — no charts) |
| `SkillsGapScreen.tsx` | Skills gap analysis (stat tiles, tables) |
| `RoleDemandScreen.tsx` | Role demand data (stat tiles, tables — no sparklines) |
| `IntelligenceAlerts.tsx` | Alert cards and notifications |
| `ComingSoonPanel.tsx` | Coming soon placeholder |
| `ProgrammeDemandTable.tsx` | Data table component |
| `StatCard.tsx` | Already semantic — verify CompassFonts |

---

## Phase 7 — Search System

Build the full search subsystem from the design prompt.

### New Components
| Component | Description |
|-----------|-------------|
| `SearchOverlay` | Command-palette quality full-screen overlay (mobile: full sheet; web: centered modal) |
| `SearchBar` | 40-48px, leading icon, scope chip (All/Programmes/Domains/Roles), clear button, cobalt focus ring |
| `SearchResultRow` | Icon/thumbnail, title, one-line explanation, mono metadata, source/freshness, chevron |
| `SearchResultsGroup` | Grouped section with label (Programmes/Domains/Roles/etc.) |
| `SearchEmptyState` | Illustrated empty state with route-line motif |
| `SearchLoadingSkeleton` | Skeleton shimmer for search results |
| `ScopeChip` | Horizontal filter chips for result type filtering |
| `TermHighlight` | Subtle matched-term highlighting in titles/descriptions |

### States to Implement
- Idle with suggestions
- Typing / loading with skeleton
- No query entered
- Too-short query
- No results found
- Guest-limited preview (limited rows, sign-in CTA)
- Locked result
- Error state
- Offline state
- Data-limited source notice

### Integration
- Global search accessible from shell (floating search bar or keyboard shortcut)
- Scoped search within Explore, Opportunities tabs
- Mobile: full-screen sheet with sticky input, grouped results
- Web: centered overlay/modal

---

## Phase 8 — Component Library Completion ✅

All structural components built. Input system complete. Badge system enhanced with freshness stamps. Button system finalized with destructive variant.

### New Structural Components
| Component | Status |
|-----------|--------|
| `RouteLine` | ✅ Built |
| `StatTile` | ✅ Built |
| `Skeleton` (redesign) | ✅ Built |
| `Toast` | ✅ Built |
| `Banner` (enhanced) | ✅ Unified with offline/sync/streak/celebration variants + dismiss |
| `PersonaCard` | ✅ Built |
| `ApplicationWindowTimeline` | ✅ Built |
| `BridgeView` (enhanced) | ✅ Built |
| `CoachMark` | ✅ Built |
| `AddressPill` | ✅ Built |
| `PdfExportButton` | ✅ Built |
| `TierBadge` | ✅ Enhanced with freshness stamp |
| `ReadinessBadge` | ✅ Built |
| `RoleMatchBadge` | ✅ Built |
| `DataSourceBadge` (enhanced) | ✅ Built |
| `InfoTooltip` | ✅ Built |
| `MetricTooltip` | ✅ Relocated to careerIntelligence/, migrated to semantic tokens |

### Button System ✅
| Variant | Sizes |
|---------|-------|
| Primary (cobalt) | sm / md / lg |
| Secondary (ink) | sm / md / lg |
| Ghost | sm / md / lg |
| Destructive | sm / md / lg |

### Input System ✅
| Type | Status |
|------|--------|
| TextInput | ✅ Semantic tokens, focus ring, error/disabled states |
| Search input | ✅ SearchBar (Phase 7) |
| Select | ✅ Dropdown modal picker |
| Chip-multiselect | ✅ ChipSelect container |
| Date picker | ✅ Native web + fallback |

### Badge System ✅
| Badge | Status |
|-------|--------|
| TierBadge | ✅ With freshness stamp |
| ReadinessBadge | ✅ ready / bridge / stretch |
| RoleMatchBadge | ✅ match percentage |
| StatusBadge | ✅ locked / pending / verified / live |

---

## Phase 9 — Legacy Screen Migration ✅

All 9 legacy screens migrated to semantic tokens + CompassFonts. All 13 pre-existing type errors fixed. **Zero TypeScript errors.**

| Screen | Status |
|--------|--------|
| `PortfolioScreen.tsx` | ✅ Colors→semantic tokens |
| `PortfolioHubScreen.tsx` | ✅ Colors→semantic tokens |
| `SkillsScreen.tsx` | ✅ Colors→semantic tokens |
| `QuantMapScreen.tsx` | ✅ Colors→semantic tokens + fixed `active_track_id` → `active_track` |
| `OnboardingScreen.tsx` | ✅ Colors→semantic tokens |
| `HomeScreen.tsx` | ✅ Fixed 5 string/number type errors (TrackIsometricScene width/height parsing) |
| `GitHubScreen.tsx` | ✅ Colors→semantic tokens + FontWeight constants |
| `LessonScreen.tsx` | ✅ Colors→semantic tokens (102 refs) |
| `InterviewModeScreen.tsx` | ✅ Colors→semantic tokens + fixed `statusSoft` → `${accentRole.status}18` |
| `GuildScreen.tsx` | ✅ Pre-existing errors resolved |
| `WorldScreen.tsx` | ✅ Pre-existing errors resolved |
| `FeedScreen.tsx` | ✅ CompassFonts spread fix (3 errors) |
| `StarknetLabRef` (type) | ✅ Added `title?: string` property |

---

## Phase 10 — Structural Screen Redesigns ✅

Rebuild screens with editorial/magazine layouts per design prompt.

**Full-device responsive requirement (desktop / palmtop / small laptop / tablet / phone)**
All Phase 10 screens use `useResponsive()` from `@/hooks/useResponsive` and adapt layout across every breakpoint:
- **Wide desktop** (≥1280px): 3–4 column grids, sidebar nav, full editorial layouts
- **Desktop** (≥1024px): 2–3 column grids, sidebar, compact hero sections
- **Palmtop / small laptop** (≥768px): 2 column grids, collapsed nav, tighter spacing
- **Tablet** (<768px): 1–2 column, bottom tabs, compact cards
- **Phone** (<480px): 1 column, full-width, smaller padding
- **Small phone** (<375px): compact padding, reduced font sizes

> **Excluded from scope**: StreaksScreen (Consistency), IslandMapScreen, LessonScreen, LearnMoreScreen

Status: ✅ token-migrated · 👾 redesigned · 🖥️ responsive-confirmed · ⬜ not started

### Home & Shell
| Screen | Status | Redesign |
|--------|--------|----------|
| `HomeScreen` | ✅ | Editorial magazine layout, CompassFonts, useResponsive, Reanimated → no legacy tokens |
| `ReferenceShell` | ✅ | Mobile cobalt station-dot, web sidebar route-line accent, @/ imports, CompassFonts |
| `ExploreScreen` | ✅ | Domain hero carousel, responsive grid (4/3/2/1 columns), @/ imports, CompassFonts |
| `Consistency` (StreaksScreen) | ➖ | Calendar heatmap in cobalt washes (not gamey flame) — excluded from scope |

### Explore
| Screen | Status | Redesign |
|--------|--------|----------|
| `DomainExplorerScreen` | ✅ | Responsive masonry grid with cluster color accents, useResponsive, CompassFonts |
| `DomainDetailScreen` | 👾 🖥️ | Magazine article layout with sticky nav, horizontal card rails |
| `RoleDetailScreen` | ✅ | Vertical route-line diagram, sticky section nav (desktop 2-column), useResponsive |
| `ProgrammeOverviewScreen` | 👾 🖥️ | Institution crest, course outline accordion, career-outcomes route fan-out |
| `AdmissionInsightScreen` | 👾 🖥️ | Formula/equation display blocks ("beautiful mono equation") |
| `ProgrammeCompareScreen` | 👾 🖥️ | Side-by-side comparison table — webContainer removed |

### Opportunities
| Screen | Status | Redesign |
|--------|--------|----------|
| `OpportunitiesScreen` | ✅ | Full migration: @/ imports, webContainer removed, CompassFonts, responsive filter rail |
| `OpportunityDetailScreen` | ✅ 👾 🖥️ | Requirement checklist vs. your profile (green/amber), application-window timeline, 2-column desktop sidebar |
| `OrganisationProfileScreen` | 👾 🖥️ | Company-page layout with cover photo, logo |
| `ApplicationWindowsScreen` | 👾 🖥️ | Horizontal timeline calendar view — webContainer removed |

### My World
| Screen | Status | Redesign |
|--------|--------|----------|
| `MyWorldScreen` | ✅ | Route-line spine, saved items grid, personal notes widget |
| `DiaryScreen` | ✅ | Vertical route-line spine as date axis |
| `PrivacyScreen` / `TermsScreen` | ✅ 👾 🖥️ | Legal-editorial layout with anchored side nav, highlighted callouts, useResponsive desktop nav |

### Auth (structural enhancements)
| Screen | Status | Redesign |
|--------|--------|----------|
| `AuthScreen` | ✅ 👾 🖥️ | Split-layout: domain icon mosaic left with route-line, form right, useResponsive desktop layout |
| `IntroCarousel` | 👾 🖥️ | Domain icons + data visualisations with cobalt wash + bold claim text |
| `AccountTypeGate` | 👾 🖥️ | 6 persona cards with domain icons — webContainer removed |
| `OnboardingFlow` | 👾 🖥️ | Horizontal route-line stepper — webContainer removed |

### Learning — excluded
| Screen | Status | Redesign |
|--------|--------|----------|
| `IslandMapScreen` | ➖ | Metro map style (NOT candy-crush path), station nodes — excluded from scope |
| `LessonScreen` | ➖ | Typography-first, code blocks, answer chips with press-lift — excluded from scope |

### Legal — excluded
| Screen | Status | Redesign |
|--------|--------|----------|
| `LearnMoreScreen` | ➖ | Legal-editorial layout matching Privacy/Terms — excluded from scope |

### Phase 10 Completion Gate

Before Phase 10 can sign off:

1. **Responsive retrofit sweep** — every 👾 screen now uses `useResponsive()` and adapts layout. ✅
2. **Token migration audit** — zero `FontWeight.*` or legacy color tokens remain in redesigned screens. ✅
3. **Emoji audit** — career-intelligence screens are Feather-only; learning/gamification (visualThemes, trackContext) retained emoji as low-priority. ✅
4. **Import audit** — all imports use `@/` alias, no relative `../` paths. ✅
5. **TypeScript** — `npx tsc --noEmit` returns zero errors. ✅
6. **Build plan** — status column updated to reflect actual state. ✅

---

## Phase 11 — Motion System

All 11 animations from design prompt Section 10, minus chart-related ones.

### Infrastructure
- **`src/theme/motion.ts`** — Timing presets (fast/base/route/count), Spring presets (press/arrive/layout), STAGGER delays (list/station/skillBar), FADE_ONLY reduce-motion fallback, `useReducedMotion()` hook, `motion.reveal()` and `motion.spring()` helpers. ✅
- **`src/components/animations/PressLift.tsx`** — Reanimated spring-wrapper using `Spring.press` (mass 0.6, damping 15, stiffness 220). Scales to 0.98 on press-in, springs back on release. Respects reduce-motion. ✅
- **`src/components/animations/StaggerReveal.tsx`** — Entrance animation: 240ms fade + 8px rise with configurable stagger (default 60ms). Uses `withDelay(index * stagger)` for sequenced reveals. Respects reduce-motion. ✅
- **`src/components/animations/SkeletonCrossfade.tsx`** — Crossfade wrapper: skeleton → content transition on `loading` prop change via `Timing.base`. Respects reduced motion. ✅
- **`src/components/animations/CelebrationBurst.tsx`** — Particle burst: configurable origin, 10 apricot dots animate outward (600ms cubic ease). Triggered by incrementing `trigger` prop. Respects reduced motion. ✅
- **`src/components/animations/ThemeCrossfade.tsx`** — Theme transition: captures previous bg color, animates overlay on toggle. Wired into `app/_layout.tsx`. Respects reduced motion. ✅
- **`src/components/animations/SharedElement.tsx`** — Shared element system: context-based registry (`SharedElementProvider`) + layout tracker (`SharedElement`) + `TransitionOverlay`. Wired into `app/_layout.tsx`. ✅

### Animation Status

| Animation | Status | Implementation |
|-----------|--------|----------------|
| Route-line draw-in | ✅ Built | `RouteLine.tsx` — 320ms inOut-cubic draw + spring station pops |
| Stat numeral count-up | ✅ Built | `StatTile.tsx` — 520ms out-quad count-up via useSharedValue + useAnimatedReaction |
| Staggered card cascade | ✅ Applied | `StaggerReveal` component wrapped into: ExploreScreen, OpportunitiesScreen, CareerHomeScreen, HomeScreen, FeedScreen, GuildScreen, LeaderboardScreen, AuthScreen, SignUpScreen, SettingsScreen, ProfileScreen, CareerProfileScreen, MySchoolScreen, NotificationSettingsScreen, DiaryScreen, MyWorldScreen, SkillsScreen, QuantMapScreen, PortfolioScreen, PortfolioHubScreen, OnboardingScreen, OnboardingFlow, AccountTypeGate, ForgotPasswordScreen, GitHubScreen, InterviewModeScreen, ReferralScreen, StreaksScreen, LearnMoreScreen + all 25 admin screens |
| Tab-change station-dot slide | ✅ Migrated | `ReferenceShell.tsx` — migrated from RN `Animated` to Reanimated `useSharedValue` + `useAnimatedStyle` + `Spring.arrive` preset. Respects `useReducedMotion()`. |
| Card press lift | ✅ Applied | `PressLift` component wired into: OpportunityCard, ScholarshipCard, OrganisationCard, ElitePathwayCard, ApplicationWindowCard, PersonaCard |
| Save-button pop | ✅ Built | `SaveButton.tsx` — Reanimated spring sequence (scale 1→0.9→1.15→1) using `Spring.press`/`Spring.arrive`. Respects reduced motion. |
| Skeleton-to-content crossfade | ✅ Built | `SkeletonCrossfade` component — wraps skeleton + content, crossfades on `loading` prop change via `Timing.base`. Respects reduced motion. |
| Celebration particle burst | ✅ Built | `CelebrationBurst` component — configurable origin, 10 apricot dots animate outward (600ms cubic ease). Respects reduced motion. |
| Dark/light theme crossfade | ✅ Built | `ThemeCrossfade` — wraps app content, captures previous bg color and animates overlay on theme toggle via `Timing.base`. Wired into `app/_layout.tsx`. |
| Screen-to-screen shared element | ✅ Built | `SharedElementProvider`/`SharedElement` — context-based registry with `TransitionOverlay`. Wired into `app/_layout.tsx`. |
| Reduce-motion column | ✅ Built | `useReducedMotion()` hook + `FADE_ONLY` config + branching in all components |

---

## Phase 12 — Asset Pipeline ✅ (simplified — no photography)

### Domain Hierarchy (from `data/career-mapping/`)
- **167 domains** across **36 clusters** (source: `cluster_map.json`)
- **278 subgroups** (101 domains have subgroups)
- **4,092 roles** across all domains
- Data files: `domain_meta.json` (names, clusters, elite flags), `domain_structure.json` (subgroups, roles, skills, certifications)

### Domain Icon System (3-tier visual identity) ✅

**Tier 1 — Cluster icons (36 icons) ✅**
All 36 clusters mapped in `src/data/clusterMaps.ts` with Feather icons + colors. Helper functions `getClusterColor()` and `getClusterIcon()`.

**Tier 2 — Domain icons (167 icons) ✅**
All 167 domains mapped in `src/data/domainIcons.ts` with Feather icons. `DOMAIN_CLUSTER` lookup map. Helper functions `getDomainIcon()` and `getDomainCluster()`.

**Tier 3 — Role-level visual differentiation ✅**
`DomainIcon` component in `src/components/careerIntelligence/DomainIcon.tsx`. Integrated into RoleCard, RoleClusterSection, DomainExplorerScreen, DomainDetailScreen.

### Expert Dossier Categories ✅
Cluster icon + colour feeds into expert profile cards via cluster identity system.

### Illustrations
- Route-line geometric backgrounds (thin cobalt lines + station dots)
- Empty/error state illustrations with route-line motif
- University crests (real Nigerian universities)
- Organisation logos

### Icon System ✅
- 36 cluster + 167 domain icons using Feather 1.5px-stroke line icons
- Career-intelligence screens use zero emoji-as-primary-icons
- Icons scale across: 16px (inline), 24px (card), 40px (hero), 64px (empty state)
- Learning/gamification section (`visualThemes.ts`, `trackContext.ts`) retains emoji — low priority, FIGMA spec primarily targets career-intelligence

---

## Pre-Existing Errors — RESOLVED ✅

All 13 pre-existing TypeScript errors fixed during Phase 9. Zero errors remain.

---

## Execution Order — All Complete ✅

```
Phase 4  → Phase 5  → Phase 6  → Phase 9  (token migration first)
Phase 7  → Phase 8                     (search + components in parallel)
Phase 10                                (structural redesigns)
Phase 11                                (motion)
Phase 12                                (assets — can start earlier)
```

> **4 screens excluded from scope**: StreaksScreen (Consistency), IslandMapScreen, LessonScreen, LearnMoreScreen
