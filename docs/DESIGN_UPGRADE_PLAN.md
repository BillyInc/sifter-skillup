# Design Upgrade Plan — Sifter LevelUp Career Intelligence Platform

## 1. Executive Summary

The current design is **functional and consistent but visually flat**. It reads like a utility app, not a career intelligence platform. The goal is to elevate it to feel **professional, authoritative, and data-rich** — like a Bloomberg Terminal meets Notion — with deliberate motion, clear visual hierarchy, and a distinctive identity that separates it from generic mobile apps.

**Core audience**: Nigerian SS1-SS3 students, graduates, and professionals exploring career paths. The design must feel aspirational but grounded, data-rich but not overwhelming.

---

## 2. Visual Identity & Token System

### 2.1 Typography (Biggest Impact, Lowest Effort)

**Current**: System UI font stack (San Francisco / Roboto). No character.

**Proposed**:
- **Display**: **Plus Jakarta Sans** (variable font, modern geometric with personality — pairs well with data-heavy UIs, has excellent weights from 200-800)
- **Body**: **Inter** (clean, highly legible at small sizes, excellent for data-heavy screens)
- **Mono**: **JetBrains Mono** (for salary figures, percentages, data points)

```typescript
// In theme/index.tsx — loaded via expo-font
export const Fonts = {
  display: { fontFamily: 'PlusJakartaSans_800ExtraBold' },
  body:    { fontFamily: 'Inter_400Regular' },
  bodySemibold: { fontFamily: 'Inter_600SemiBold' },
  bodyBold: { fontFamily: 'Inter_700Bold' },
  mono:    { fontFamily: 'JetBrainsMono_500Medium' },
};
```

### 2.2 Refined Color Palette

Keep the existing structure but **push contrast** and **add semantic depth**:

| Token | Light | Dark | Why |
|-------|-------|------|-----|
| `bg` | `#F7F8FA` → `#F0F2F5` | `#0E1015` → `#0A0C10` | Slightly cooler, more modern |
| `card` | `#FFFFFF` | `#161A22` | Keep white, darken dark slightly |
| `accent` | `#111111` | `#E8EDF5` | Keep high contrast |
| `gold` | `#F59E0B` | `#F4B74A` | Brand anchor — **use more prominently** |
| `text` | `#111111` | `#F0F4FA` | Warmer white in dark mode |
| `navy` | `#1A1F2E` → new `surfaceDark` | `#F8FAFC` | New deeper surface for headers |

**New semantic tokens**:
```typescript
chartLine: string;      // Data viz lines
chartFill: string;      // Data viz fill
success: string;        // Green for positive signals
warning: string;        // Amber for caution
danger: string;         // Red for gaps/negative
info: string;           // Blue for information
```

### 2.3 Signature Visual Element

**The "Career Signal" gradient line** — Every detail screen header gets a subtle animated gradient accent line (not just a border). This becomes the signature visual: a warm gold-to-amber gradient sweep that subtly pulses, anchoring the brand identity.

```
┌─────────────────────────────────┐
│ ← Back                    ★ ⬇ │  ← Top bar with gold accent line
│══════════▬══════════════════════│  ← 2px animated gradient line
│ DOMAIN                         │
│ Accounting & Finance           │
└─────────────────────────────────┘
```

---

## 3. Motion & Interaction System

### 3.1 Page Transitions

**Current**: Instant screen changes via React Navigation (no custom transitions).

**Proposed**: Use `react-native-reanimated` layout animations and screen transitions:

| Transition | When | Details |
|-----------|------|---------|
| `SlideInRight` | Navigate to detail | Content slides in from right, 300ms, spring |
| `FadeIn` | Data loads | Cards fade in with staggered delay (50ms * index) |
| `ScaleIn` | Filter chips appear | Spring scale 0.9→1.0 when search results update |
| `StaggerList` | Lists appear | Each item fades + slides up incrementally |

### 3.2 Micro-interactions

| Element | Interaction | Details |
|---------|-------------|---------|
| DomainChip | Tap scale 0.95 → spring back | 150ms |
| RoleCard | Lift + shadow deepen on press | Shadow goes from xs→md |
| Search input | Border colour animates on focus | Grey → gold accent, 200ms |
| Filter chips | Active chip scales and fills with spring | Spring config |
| Skill bars | Animate from 0→width on mount | Spring with 80ms stagger per bar |
| Save button | Star icon fills with a pop animation | Scale 1→1.3→1, 300ms |
| Back button | Slight slide on press | translateX -3→0 |
| Collapsible sections | Chevron rotates 90°, body height animates | Reanimated with layout |

### 3.3 Ambient Animations

- **Data loading shimmer**: Skeleton cards with a shimmer gradient sweep (Reanimated loop)
- **Demand metrics**: Numbers count up from 0 on mount (`react-native-countup` or custom)
- **Premium badge pulse**: Elite/verified badges get a subtle pulse (opacity 0.8→1, 2s loop)
- **Pull-to-refresh**: Custom gold-tinted spinner with the brand bolt ⚡

---

## 4. Screen-by-Screen Upgrade

### 4.1 ExploreScreen (Entry Point)

**Current**: Basic search + 3 "door" cards + text links. Feels sparse.

**Proposed**:
- **Hero section**: Full-width gradient header (deep navy to dark) with the search bar IN it — prominent, inviting
- **Search bar**: Elevated with shadow, larger text, animated border on focus, clear button with spring
- **3 "door" cards**: Replace flat bordered cards with subtle gradient backgrounds + icon treatments. First card (live) gets a **gold left accent bar** and slight elevation
- **Browse links**: Replace raw text with mini-cards with icons, grouped in a 2-column grid
- **Results**: Animated staggered entrance. Each result group (domains/roles/programmes) slides in with a section header that has a subtle underline accent
- **Empty state**: Illustrated with a branded graphic instead of just emoji text

### 4.2 MyWorldScreen (Personal Hub)

**Current**: Two branches (personal page / live hub). Flat sections, plain emoji icons, basic sheet.

**Proposed**:
- **Personal page**: 
  - Profile header with gradient background, avatar ring with subtle pulse
  - "Saved domains & roles" section with **masonry-like** layout instead of stacked rows
  - "My notes" with **animated folder expand** — folder icon animates to open state, chevron rotates smoothly
  - **LockedTracksCard**: Replace with a visually rich card that has a gradient overlay and semi-transparent blur behind the locked pill
- **Live hub**:
  - XP/streak snapshot gets a **radial progress indicator** around the emoji avatar
  - Primary cards get **icon treatments** with soft gradient backgrounds
  - "More" grid items get **hover/lift-on-press** effects

### 4.3 DomainExplorerScreen

**Current**: Search + flat filter chips + cluster groups. No visual distinction.

**Proposed**:
- **Filter chip row**: Active chip gets a **gold fill with white text** and spring animation on switch. Inactive chips are transparent with thin border
- **Cluster groups**: Each cluster section header gets a **thin coloured rule** (unique subtle colour per cluster, or use the brand gold consistently)
- **Domain chips**: Enhanced with **icon glyphs** next to each domain name. In-demand domains get a subtle 🔥 indicator
- **Background**: Search box integrated into a card that sticks to the top on scroll (sticky header)

### 4.4 DomainDetailScreen

**Current**: Plain scroll with stacked sections. Good structure but no visual rhythm.

**Proposed**:
- **Hero**: Domain name with animated gradient underline, cluster chip + elite badge row
- **Description**: Larger, more readable text with comfortable line height
- **FoundationSkillsBlock**: Animated skill bars that **fill on scroll** (use Reanimated with scroll-driven animation). Each bar animates sequentially
- **ToolGroupsBlock**: "Core tools" chips get a **filled style** (gold-tinted bg), "Also expected" get **outlined style**. Group labels as small caps with thin rule
- **CertPlacementList**: Cards with **left border accent** (gold for gateway, blue for specialisation, grey for boosters)
- **RoleClusterSection**: Improved collapse animation using **Reanimated with layout animation** — body height animates smoothly, not just fade
- **DemandMetricsBlock**: Redesign as **stat tiles** (4-column grid) with animated number count-up

### 4.5 RoleDetailScreen

**Current**: Simple vertical stack of labels, chips, and sections.

**Proposed**:
- **Role identity section**: Role name in XXL display type, aka line smaller, tier badge + elite badge
- **Essential skills**: Chip cloud with **filled prominent chips** (gold/brand coloured). Optional skills as outlined lighter chips
- **Reachable from**: Domain links as **tappable chips** with arrow icon, each with small domain icon
- **DemandMetricsBlock**: Full stat grid redesign (as above)
- **LevelUpCTA**: Redesigned as a **gradient banner card** with a clear action button, not just text

### 4.6 ProgrammeOverviewScreen

**Current**: Three tabs (Employment, Business, Admission) with tab buttons. Good structure.

**Proposed**:
- **Tab bar**: Enhanced with **animated indicator** (underline that slides between tabs) instead of just filled/unfilled buttons
- **Employment tab**: Domain groups with **animated section headers** that have a collapsible hint. Domain chips with better spacing
- **Business tab**: "Coming soon" card with a **gradient placeholder** and branded illustration
- **Admission tab**: Stat-driven layout with **year badges**, formula cards with **mono-spaced numbers**

### 4.7 CareerChangerScreen

**Current**: Heavy text, functional. Long scroll with many components.

**Proposed**:
- **Scenario tabs**: Animated pill switcher with spring motion
- **Background picker**: Integrated into a card with floating label animation on the search input
- **Pivot results**: Skill overlap bars animate on scroll with color-coded fills (green ≥40%, amber 15-39%, orange <15%)
- **Gap analysis**: "Have" vs "Bridge" sections as **side-by-side cards** (on wider screens) or stacked with clear visual separation. Readiness badge as a prominent banner with icon

### 4.8 Admin Shell & Screens

**Current**: Functional sidebar with plain navigation.

**Proposed**:
- **Sidebar**: Add **active indicator bar** (left border) instead of just background colour. Smooth transition between items. Brand header with subtle gradient
- **StatCard**: Animated number values. Icon background gets a soft gradient. Delta indicators with animated arrows
- **Data tables**: Row hover/lift effects. Sticky header with subtle shadow. Sort indicators animate on tap
- **DomainIntelligenceScreen**: Bar charts with **spring animation** on load. Scope toggle with **pill-style animated switch**

---

## 5. Component Library Upgrades

### 5.1 Core Primitives (`src/components/ui/index.tsx`)

| Component | Upgrade |
|-----------|---------|
| `SifterCard` | Add elevated variant with gradient border option. On-press lift animation |
| `PressableCard` | Use `Reanimated` instead of `Animated` for 60fps press animations |
| `SifterButton` | Add loading spinner animation, success state with checkmark animation |
| `ProgressBar` | Already animated — add gradient fill option (gold-amber gradient) |
| `SectionHeader` | Add bottom accent rule option, collapsible chevron variant |
| `Badge` | Add subtle pulse effect for live/premium badges |
| `AvatarBadge` | Replace `Animated.loop` pulse with Reanimated smoother loop |

### 5.2 Career Intelligence Components

| Component | Upgrade |
|-----------|---------|
| `DetailScaffold` | Add animated gradient underline. Back button with slide animation |
| `DataStateView` | Better illustrated empty states (SVG illustrations). Smoother transition when data loads |
| `DomainChip` | Add press animation, icon glyph support. In-demand variant with subtle glow |
| `RoleCard` | Enhanced card with lift-on-press, bottom stats row |
| `FoundationSkillsBlock` | On-scroll entrance animation for skill bars (staggered) |
| `ToolGroupsBlock` | Better visual separation between "core" and "common" tools |
| `RoleClusterSection` | Reanimated layout animation for collapse/expand |
| `CertPlacementList` | Left-border accent per cert group. Icons for region chips |
| `DemandMetricsBlock` | Complete redesign as animated stat grid |

---

## 6. Implementation Phases

### Phase 1: Foundation (Est. 3-5 days)
1. Install & configure custom fonts (Plus Jakarta Sans, Inter, JetBrains Mono)
2. Update theme tokens (new semantic colours, refined palette)
3. Create a shared `AnimationPresets` module with Reanimated configs
4. Build `AnimatedPressable` HOC — reusable press animation wrapper
5. Update `SifterCard` and `PressableCard` to use Reanimated

### Phase 2: Core Pattern Library (Est. 3-5 days)
1. Upgrade `DetailScaffold` with signature gradient underline + back animation
2. Upgrade `DataStateView` with illustrated states + load transitions
3. Build `AnimatedSearchBar` component (focused border animation, clear button)
4. Build `AnimatedFilterChip` component (spring toggle animation)
5. Upgrade `SectionHeader` with accent rule + collapsible variant

### Phase 3: Motion & Transitions (Est. 3-4 days)
1. Add screen transition animations (shared element transitions)
2. Add staggered list entrance animations
3. Add scroll-triggered animations for skill bars and stat tiles
4. Add shimmer loading skeletons
5. Add count-up animations for numeric stats

### Phase 4: Screen Polish (Est. 5-7 days)
1. Apply all upgrades to ExploreScreen (hero section, results animation)
2. Apply upgrades to MyWorldScreen (profile header, folder animations)
3. Apply upgrades to DomainExplorerScreen
4. Apply upgrades to DomainDetailScreen + RoleDetailScreen
5. Apply upgrades to ProgrammeOverviewScreen + CareerChangerScreen
6. Apply upgrades to Admin shell and screens

### Phase 5: Quality Pass (Est. 2-3 days)
1. Review dark mode contrast and consistency
2. Test all animations on low-end devices (reduce-motion support)
3. Audit for accessibility (keyboard focus, screen reader labels)
4. Performance profile — ensure 60fps on animations
5. Fix any regressions from style changes

---

## 7. Key Dependencies

```json
{
  "expo-font": "already installed",
  "react-native-reanimated": "already installed (v4.2.1)",
  "@expo-google-fonts/plus-jakarta-sans": "to add",
  "@expo-google-fonts/inter": "to add",
  "@expo-google-fonts/jetbrains-mono": "to add"
}
```

No new animation libraries needed — Reanimated v4 is already in the project and is the recommended path for all motion work.

---

## 8. Risk & Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Animation performance on low-end Android | Medium | Use `useNativeDriver` where possible, test on Moto G / Samsung A series. Reduced Motion API respected |
| Font loading flash | Low | Use `expo-font` with `useFonts` + splash screen until loaded |
| Over-animation / motion sickness | Low | Respect `AccessibilityInfo.isReduceMotionEnabled` — reduce all animations to opacity fades |
| Reanimated 4 breaking changes | Low | Already on v4.2.1 — stable API |
| Style regressions in data-dense screens | Medium | Incremental rollout per screen, visual regression check each phase |

---

## 9. Quick Wins (Do First, High Impact / Low Effort)

1. **Search bar animation**: 20 lines — animate border colour on focus (gold). High visibility
2. **Filter chip spring**: 10 lines — add spring scale to active chip toggle. High touch-point
3. **Font upgrade**: Load 3 font families, update theme. Changes every text element
4. **Card lift-on-press**: Widen shadow on press. Already have the mechanism, just tune
5. **Gradient accent line**: Add to DetailScaffold. Signature visual element, ~30 lines

---

## 10. Measuring Success

- **Before/after screenshots** for each major screen
- **Animation frame rate** on target devices (target: 55+ fps average)
- **User perception**: Does the app feel "more polished" and "more professional"?
- **Bundle size impact**: Fonts add ~150-200KB, negligible for the visual gain