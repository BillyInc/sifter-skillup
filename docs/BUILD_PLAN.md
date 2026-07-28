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
| Phase 6 | ✅ | Admin (25 screens): AdminShell + all admin screens — CompassFonts migration, zero FontWeight references remaining |
| Phase 7a | ✅ | Search components: SearchOverlay, SearchBar (enhanced), SearchResultRow, SearchResultsGroup, SearchLoadingSkeleton, SearchEmptyState, ScopeChip, TermHighlight. Added SearchResult type to career.ts. Fixed FeedScreen/LeaderboardScreen/ReferralScreen CompassFonts import paths. |
| Phase 7b | ✅ | Search integration: SearchOverlay wired into ReferenceShell (global search trigger on mobile + web), scoped SearchBar in OpportunitiesScreen. Removed legacy search stub from shell. |
| Phase 8a | ✅ | New components: Toast (provider + inline + showToast), StatusBadge (locked/pending/verified/live), SkeletonRedesign (shimmer bar + SkeletonText/Avatar/Card/Row/Stat), PersonaCard, ApplicationWindowTimeline. Secondary button variant added to SifterButton. |
| Phase 8b | ✅ | InputComponents (TextInput, Select, ChipSelect, DatePicker), TierBadgeView freshness stamp, MetricTooltip relocated to careerIntelligence/ + semantic tokens, Banner unified (offline/sync/streak/celebration variants + dismiss), SifterButton `danger` → `destructive` rename. |
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

## Phase 9 — Legacy Screen Migration (9 screens)

Full Colors→semantic tokens + CompassFonts migration.

| Screen | Lines | Work |
|--------|-------|------|
| `GitHubScreen.tsx` | ~1043 | Full migration: Colors→semantic tokens, CompassFonts |
| `LessonScreen.tsx` | ~1414 | Full migration: Colors→semantic tokens, CompassFonts |
| `InterviewModeScreen.tsx` | ~570 | Full migration: Colors→semantic tokens, CompassFonts |
| `PortfolioScreen.tsx` | — | Remove Colors imports, use semantic tokens only |
| `PortfolioHubScreen.tsx` | — | Remove Colors imports, use semantic tokens only |
| `SkillsScreen.tsx` | — | Remove Colors imports, use semantic tokens only |
| `QuantMapScreen.tsx` | — | Remove Colors imports, use semantic tokens only, fix active_track_id |
| `OnboardingScreen.tsx` | — | Remove Colors imports, use semantic tokens only (legacy onboarding — may be dead code) |
| `HomeScreen.tsx` | — | Fix 5 string/number type errors |

---

## Phase 10 — Structural Screen Redesigns

Rebuild screens with editorial/magazine layouts per design prompt.

### Home & Shell
| Screen | Redesign |
|--------|----------|
| `HomeScreen` | Editorial magazine layout, hero "Your Route" card with route-line visualization, asymmetric grid |
| `ReferenceShell` | Mobile: cobalt station-dot that slides between tabs. Web: sidebar with route-line accent |
| `ExploreScreen` | Domain hero carousel, pathways strip, admission intelligence card |
| `Consistency` (StreaksScreen) | Calendar heatmap in cobalt washes (not gamey flame) |

### Explore
| Screen | Redesign |
|--------|----------|
| `DomainExplorerScreen` | Masonry grid layout |
| `DomainDetailScreen` | Magazine article layout with sticky nav, horizontal card rails |
| `RoleDetailScreen` | Flagship: vertical route-line diagram, skills bridge, stat-tile row |
| `ProgrammeOverviewScreen` | Institution crest, course outline accordion, career-outcomes route fan-out |
| `AdmissionInsightScreen` | Formula/equation display blocks ("beautiful mono equation") |
| `ProgrammeCompareScreen` | Side-by-side comparison table |

### Opportunities
| Screen | Redesign |
|--------|----------|
| `OpportunitiesScreen` | Job-board grade with filter rail, rich cards, deadline countdown chips |
| `OpportunityDetailScreen` | Requirement checklist vs. your profile (green/amber), application-window timeline |
| `OrganisationProfileScreen` | Company-page layout with cover photo, logo |
| `ApplicationWindowsScreen` | Horizontal timeline calendar view |

### My World
| Screen | Redesign |
|--------|----------|
| `MyWorldScreen` | Route-line spine, saved items grid, personal notes widget |
| `DiaryScreen` | Vertical route-line spine as date axis |
| `PrivacyScreen` / `TermsScreen` | Legal-editorial layout with anchored side nav, highlighted callouts |

### Auth (structural enhancements)
| Screen | Redesign |
|--------|----------|
| `AuthScreen` | Split-layout: domain icon mosaic left with route-line, form right |
| `IntroCarousel` | Domain icons + data visualisations with cobalt wash + bold claim text |
| `AccountTypeGate` | 6 persona cards with domain icons (icon-based identity) |
| `OnboardingFlow` | Horizontal route-line stepper (animated progress) |

### Learning
| Screen | Redesign |
|--------|----------|
| `IslandMapScreen` | Metro map style (NOT candy-crush path), station nodes |
| `LessonScreen` | Typography-first, code blocks, answer chips with press-lift |

### Legal
| Screen | Redesign |
|--------|----------|
| `LearnMoreScreen` | Legal-editorial layout matching Privacy/Terms |

---

## Phase 11 — Motion System

All 11 animations from design prompt Section 10, minus chart-related ones.

| Animation | Spec |
|-----------|------|
| Route-line draw-in | 320ms inOut-cubic, stations pop with spring |
| Stat numeral count-up | 520ms out-quad |
| Staggered card cascade | 240ms fade + 8px rise, 60ms stagger |
| Tab-change station-dot slide | Smooth indicator slide between tabs |
| Card press lift | Spring: mass 0.6, damping 15, stiffness 220 |
| Save-button pop | Micro-interaction on save |
| Skeleton-to-content crossfade | Smooth transition from skeleton to loaded |
| Celebration particle burst | Restrained apricot burst along route-line |
| Dark/light theme crossfade | Smooth color transition |
| Screen-to-screen shared element | Role card photo expands into role-detail hero |
| Reduce-motion column | Fade-only, no transforms, immediate values (accessibility) |

---

## Phase 12 — Asset Pipeline (simplified — no photography)

### Domain Hierarchy (from `data/career-mapping/`)
- **168 domains** across **37 clusters**
- **278 subgroups** (101 domains have subgroups)
- **4,092 roles** across all domains
- Data files: `domain_meta.json` (names, clusters, elite flags), `domain_structure.json` (subgroups, roles, skills, certifications)

### Domain Icon System (3-tier visual identity)

**Tier 1 — Cluster icons (37 icons)**
Each cluster gets a **signature 1.5px-stroke line icon + cluster colour**. These appear on cluster headers, domain grid cards, and navigation.

| Cluster | Icon Concept | Colour |
|---------|-------------|--------|
| Information & Communication Technology | Terminal brackets | Cobalt `#3B3AC4` |
| Health & Biomedical | Heartbeat line | Success `#0E9F6E` |
| Engineering & Built Environment | Structural node | Amber `#D97706` |
| Financial Services | Yield curve / chart | Teal `#0D9488` |
| Legal & Compliance | Scales of justice | Ink `#111111` |
| Agriculture & Food Systems | Leaf / seed | Warm amber `#F5A65B` |
| Education & Research | Book / open book | Info `#2563EB` |
| Creative & Media | Aperture / wave | Apricot `#F5A65B` |
| Data & Analytics | Scatter plot / dots | Teal `#0D9488` |
| Business & Management | Briefcase / org chart | Cobalt `#3B3AC4` |
| Public Sector & Social Services | Building / people | Info `#2563EB` |
| Supply Chain & Logistics | Link chain / route | Ink `#111111` |
| Emerging Technology | Circuit / spark | Cobalt `#3B3AC4` |
| Advanced Science & Engineering | Atom / flask | Success `#0E9F6E` |
| Community Health & Paramedical | Cross / pulse | Success `#0E9F6E` |
| Creative & Media | Aperture | Apricot `#F5A65B` |
| Defence & Military | Shield / star | Ink `#111111` |
| Energy & Resources | Lightning / flame | Amber `#D97706` |
| High-Performance Engineering | Rocket / gauge | Cobalt `#3B3AC4` |
| *... + 18 more clusters* | *To be designed* | *Per-cluster colour* |

**Tier 2 — Domain icons (168 icons)**
Each domain gets a **unique icon** within its cluster colour. Domains sharing a cluster share the cluster colour but have distinct icons. These appear on:
- Domain cards in Explore hub
- Domain detail hero
- Search results (domain grouping)
- Role cards (domain context badge)
- Saved items in My World
- Expert dossier domain tags

**Tier 3 — Role-level visual differentiation (4,092 roles)**
Roles don't get individual icons (too many). Instead, visual differentiation uses:
- **Match-type badges**: direct match (success green), functional match (cobalt), adjacent match (muted ink)
- **Demand level colour**: high demand (teal), elite low-volume (gold), emerging (info blue)
- **Salary range in mono**: ₦ display with count-up animation
- **Domain icon + role title**: the domain icon provides visual context, the role name provides specificity

### Expert Dossier Categories (from cluster structure)
The 37 clusters feed directly into expert dossier categories. Each cluster represents a domain expertise area that an expert can be verified in. The cluster icon + colour becomes the expert's domain identity on their profile card.

### Illustrations
- Route-line geometric backgrounds (thin cobalt lines + station dots)
- Empty/error state illustrations with route-line motif
- University crests (real Nigerian universities)
- Organisation logos

### Icon System
- Custom 1.5px-stroke line-icon set
- Rounded caps, cobalt or domain-specific colour
- Replace all emoji-as-icons with proper line icons
- Icons scale across: 16px (inline), 24px (card), 40px (hero), 64px (empty state)
- Total icon count: ~250+ (37 cluster + 168 domain + ~50 UI icons)

### Photography (Events section only)
- School visit documentation photos
- Career excursion moments
- Domain spotlight real-world context
- All other screens use icons + data visualisations as focal points

---

## Pre-Existing Errors Still Open (9)

| Error | File | Fix |
|-------|------|-----|
| string/number type | HomeScreen.tsx:305,306,767,768 | Fix prop types |
| track vs island comparison | HomeScreen.tsx:425 | Fix union type |
| title missing on StarknetLabRef | LessonScreen.tsx:852,918 | Add title to type |
| active_track_id → active_track | QuantMapScreen.tsx:444 | Rename property |
| accentColor missing | WorldScreen.tsx:344 | Add to FieldSkillTrack |

---

## Execution Order

```
Phase 4  → Phase 5  → Phase 6  → Phase 9  (token migration first)
Phase 7  → Phase 8                     (search + components in parallel)
Phase 10                                (structural redesigns)
Phase 11                                (motion)
Phase 12                                (assets — can start earlier)
```
