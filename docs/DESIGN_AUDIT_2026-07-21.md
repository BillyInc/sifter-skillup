# DESIGN AUDIT — implementation vs FIGMA_DESIGN_PROMPT.md + FIGMA_REDESIGN_BRIEF.md
2026-07-21. Verdict format: ✅ done · 🟡 partial · ❌ untouched.

## 0. The headline finding

You're right on both counts:
1. **No pre-login screen was touched.** `AuthScreen`, `authShared` (Google/Apple row still present), `SignUpScreen`, `ForgotPasswordScreen`, `app/index.tsx` landing, `AccountTypeGate` — zero redesign work, and the flow itself regressed (the shelved duplicate is live; the Next/skip transition flow is gone).
2. **FIGMA_DESIGN_PROMPT.md was not used at all.** The Codex pass implemented only the *brief's* visual grammar (calm HR-OS chrome). Everything the design prompt specifies beyond chrome — the 10-screen auth/onboarding set, editorial hero surfaces, route-line spec, search command-centre anatomy, realistic-data rule, per-surface state inventories, motion spec — is absent.

**Mechanical count: 28 of 88 screens import the new primitives; 60 screens untouched.**

## 1. Conflict between the two documents (needs one standing decision)

The two docs were written minutes apart (Jul 17) and disagree on visual language:
- **DESIGN_PROMPT**: cobalt #3B3AC4 wayfinding, Bricolage Grotesque display, editorial photography, route-line motif.
- **REDESIGN_BRIEF** (+ your reference screenshots): theme-agnostic semantic tokens, calm operational UI, one sans, no decoration.

The implemented theme follows the BRIEF (Hanken-only; Bricolage removed; blue accent `#1F5EFF`). **Working interpretation (flag if wrong):** BRIEF wins on visual chrome; DESIGN_PROMPT is authoritative for everything else — screen inventory, search anatomy, data realism, states, layout DNA, personas, motion restraint. Route-line as *information* (stepper/stations in onboarding + pathways) survives; route-line as *decoration* does not.

## 2. Audit vs FIGMA_DESIGN_PROMPT.md, section by section

| § | Requirement | Status | Gap detail |
|---|---|---|---|
| 0 | Brand tokens (semantic depth, mono data face, geometry) | 🟡 | Semantic tokens + Spline Mono in theme; data numerals not consistently mono across screens |
| 0 | Imagery direction (editorial photography, no emoji as icons) | ❌ | No photographic identity anywhere; emoji removed only from redesigned screens |
| 0 | Layout DNA (web 1440 grid, breadcrumb+title block, data-source footers) | 🟡 | Shells retuned; no breadcrumb/title-block pattern; no mono data-source footers |
| 0 | Realistic Nigerian data everywhere | 🟡 | Live-data rule covers most; redesigned screens OK; untouched screens vary |
| 0 | Search quality standard (anatomy, grouped results, all states) | 🟡 | ExploreScreen only: idle/recents/loading/guest-limited/data-limited built. Missing: keyboard hint, matched-term highlight, scope chips as specced, mobile full-screen sheet, admin search |
| 1 | Auth & onboarding (10 screens: landing, sign-in/up, forgot, intro carousel, account-type gate, 5 persona setups) | ❌ | Untouched + flow regression (errors.md): restore transition flow, email-only + guest, remove SocialRow, fix terms popup, GO_BACK |
| 2 | Student shell & home (shell, Career Home dashboard, global search overlay, notifications, streaks-as-consistency) | 🟡 | Shell ✅ (ReferenceShell pill nav). CareerHome ❌, notifications ❌, StreaksScreen ❌ |
| 3 | Explore core (hub, domain index/detail, role detail, programme overview, admission index/detail, elite, pathways hub + 5) | 🟡 | Done: Explore, DomainExplorer, DomainDetail, RoleDetail, ProgrammeOverview, ProgrammeCompare, AdmissionInsight. ❌: ElitePathwaysHub/Detail, PathwaysHub, CareerChanger, Phd, Chartered, QualificationUpgrades, Entrepreneurship |
| 4 | Opportunities (feed, detail, org profile, scholarships, application-windows timeline) | ❌ | All five untouched |
| 5 | My World (saved, notes, diary, portfolio, profile, settings, my-school, legal pages) | ❌ | Untouched (CareerProfile, Diary, MyWorld surfaces) |
| 6 | Learning & skills (hub, track map, lesson, simulators, interview, completion) | 🟡 | Skills/Lesson/QuantMap/simulators touched; InterviewMode, completion states, track-map-as-metro not per spec |
| 7 | Community (feed, leaderboard, guild, referral) | ❌ | Untouched |
| 8 | Admin (9 surfaces incl. provisioning, verification, feedback inbox, expert dossier) | 🟡 | AdminShell + InstitutionProfile + shared TableRow/StatCard styled. ❌: all analytics screens (DomainIntelligence, RoleDemand, Salary, SkillsGap, Trends, Remote, VsNational, Peers), StudentManagement/Provisioning, Verification, FeedbackInbox, ExpertDossier, EducatorOnboarding, SchoolGuidanceDashboard |
| 9 | Component library w/ variants+states | 🟡 | SearchBar/TextTabs/SectionLabel/ListRow/FilterChip/LockedTile/StatTile/RoleCard exist. Missing: result-row typed variants, demand meter/sparkline, bridge-view, data-table kit, tooltips, toasts/banners, skeleton set, empty/error illustrations, modals/sheets |
| 10 | Motion & reduce-motion spec | ❌ | No motion pass; reduce-motion not wired |

## 3. Audit vs FIGMA_REDESIGN_BRIEF.md

| Brief requirement | Status |
|---|---|
| Semantic tokens, theme-agnostic | ✅ theme layer |
| 4px grid, two spacing tiers, one sans two weights | ✅ theme; 🟡 legacy screens |
| Text-only tabs, thin underline | ✅ primitive; 🟡 adoption |
| Outline icons only for nav/core actions | 🟡 shells done; emoji remain in 60 screens |
| Cards only for repeated items; hairline structure | 🟡 |
| One accent meaning per screen | 🟡 unaudited on legacy screens |
| Search as premium command surface | 🟡 (see §0 search row) |
| Six-user flows complete | ❌ educator/institution/tutorial/platform-admin flows untouched |
| Auth family (sign-in/up, role selection, reset, access-code gate) | ❌ + regression |
| Locked pages: never plain "coming soon" | ✅ ComingSoon/LockedTile rework (adoption partial) |
| Access-code ≠ verification, visible states | 🟡 InstitutionProfile shows states; VerificationScreen untouched |
| Comparison surfaces | 🟡 ProgrammeCompare done |
| Guest teaser limits | ✅ Explore; ❌ elsewhere |
| Component inventory | 🟡 (see §9 row above) |

## 4. Finish plan (priority order)

1. **P0 — Pre-login restoration + redesign** (errors.md): restore transition flow (Next/skip → email-only auth + guest that works offline), remove SocialRow, terms popup, GO_BACK fix, landing page redesign, View-import crash ✅ already fixed.
2. **P1 — Onboarding**: AccountTypeGate (6 persona cards) + persona setup steppers (route-line stepper as information).
3. **P2 — Student core**: CareerHomeScreen dashboard, Opportunities family (5 screens), Pathways family (7), My World family.
4. **P3 — Admin family**: analytics screens onto TableRow/StatTile kit, provisioning, verification, feedback inbox, educator onboarding.
5. **P4 — Search completion**: scope chips, matched-term highlight, mobile sheet, admin search, remaining states everywhere.
6. **P5 — Component set completion + states**: skeleton set, toasts, modals, demand meter/sparkline, data-table kit; sweep remaining emoji/Shadow screens (Community, Learning tails).
7. **P6 — Motion + reduce-motion pass** (restrained per brief), then single `tsc` + Expo walkthrough.
