# SIFTER COMPASS — Career-Intelligence Design System

> Supersedes `DESIGN_UPGRADE_PLAN.md`. That plan chased the AI-default look
> (Bloomberg-meets-Notion, Plus Jakarta + Inter + JetBrains Mono, a gold gradient
> sweep). COMPASS is derived from *what this product actually is*: a wayfinding
> instrument for a young Nigerian's entire trajectory — programme → domain → role,
> plus skills, entrepreneurship, opportunities, pathways, admission, and the
> learning world.

---

## 0. Thesis

Nigerian students navigate a genuinely opaque system: JAMB, CCMAS/IBASS programme
names, shifting cut-offs, "what can I even *do* with this degree?". The product's
entire value is **clarity under opacity**. Every module — Explore, Opportunities,
Skills, Pathways, Admission, Admin, even the gamified World — is one thing:
**a move on a map toward a destination.**

So the design language is a **wayfinding instrument**. Intelligence-grade, not a
game skin, not a generic fintech dashboard. The category leader (Lightcast Career
Pathways) is literally a map of the job ecosystem with typed transitions; this
codebase already models typed edges (Direct / Functional / Adjacent domains,
Match / Adjacent roles, ready / bridge / stretch readiness). COMPASS makes that
structure *visible*.

---

## 1. Token System

### 1.1 Palette

Two families: **brand chrome** (re-founded) and **semantics** (preserved — the
data taxonomy depends on their meaning). The brand accent is reserved for
wayfinding + current-state only, kept chromatically clear of every semantic.

| Role | Token | Light | Dark ("Analyst") | Notes |
|------|-------|-------|------------------|-------|
| Base | `bg` | `#F6F7F4` | `#0F1729` | Bone (faint green) / deep indigo-navy. Not AI-cream, not pure black |
| Raised | `card` | `#FFFFFF` | `#161F33` | |
| Sunken | `bgSunken` | `#EDEFEA` | `#0B1120` | wells, track beds |
| Ink | `text` | `#141A2E` | `#EEF1F8` | |
| Ink-soft | `textSoft` | `#3B4256` | `#B7C0D6` | |
| Ink-muted | `textMuted` | `#6A7286` | `#7C879E` | freshness stamps, captions |
| Hairline | `border` | `#E2E4DE` | `#26314A` | |
| **Accent** | `cobalt` | `#3B3AC4` | `#6E6CF0` | **signature** — indigo. Wayfinding + active state only |
| Accent deep | `cobaltDeep` | `#2E2A8F` | `#3B3AC4` | pressed, spine origin |
| Accent wash | `cobaltWash` | `#EEEEFB` | `#1B2145` | active chip fill, node halo |
| Warmth | `apricot` | `#F5A65B` | `#F7B679` | one warm note — human CTAs, celebration |
| Apricot wash | `apricotWash`| `#FDF0E2` | `#2A2114` | |

**Preserved semantics** (unchanged meaning, values retuned to sit on the new base):

| Meaning | Token | Light | Dark |
|---------|-------|-------|------|
| Direct match / success / covered | `direct` / `success` | `#0E9F6E` | `#34D399` |
| Functional / bridge | `functional` | `#2563EB` | `#7C96FF` |
| Adjacent / stretch | `adjacent` | `#B45309` | `#F4B74A` |
| Demand ↑ | `demand` | `#0D9488` | `#2DD4BF` |
| Elite | `elite` | `#B8860B` | `#E9C46A` |
| Danger / gap | `danger` | `#DC2626` | `#F87171` |

> The three domain match colors (green / blue / amber) stay because
> `getDomainBadge`, `getRoleBadge`, `getReadinessBadge` and the whole taxonomy key
> off them. COMPASS re-founds only the *chrome* (bg / accent / warmth).

### 1.2 Typography

Loaded via `expo-font` (`@expo-google-fonts/*`).

| Role | Family | Use |
|------|--------|-----|
| Display | **Bricolage Grotesque** | Screen titles, hero numerals, eyebrows |
| Body | **Inter** | All UI text, labels, body |
| Data | **Spline Sans Mono** | JAMB scores, cut-offs, salary, %, every freshness stamp |

The body face was Hanken Grotesk in the first COMPASS pass. It is now **Inter**:
Inter is the agreed design direction recorded in the *Mandatory Sifter LevelUp
Design & Implementation Brief* section of the repo's `CLAUDE.md`, and the Figma
design library already uses Inter — so the shipped app and the design source now
name the same face. The monospace/data face is unchanged: still Spline Sans Mono.

Type scale (unchanged sizes — the *faces* carry the change):
`xs 9 · sm 11 · md 13 · lg 15 · xl 17 · xxl 19 · xxxl 22 · display 26 · hero 30`

Weights: Bricolage 600/700/800 for display; Inter 400/500/600/700 for body;
Spline 400/500 for data. Data face always tabular, letter-spacing `0`.

### 1.3 Signature — **The Route Line**

A *functional* wayfinding spine. Nodes ("stations") encode the real typed
structure, so the ornament carries information rather than decorating.

```
  ●━━━━━━━◑- - - - -◎         STATION STATES
  YOU     DOMAIN    ROLE       ● filled  = you / covered / reached
  │       │         │          ◑ ring    = functional / bridge / in-progress
  Found.  Bridge skills        ◎ target  = adjacent / stretch / locked
                               ━ solid  = Direct edge
                               - - dash = Adjacent edge
```

Scales across the whole product:
- **1px header rule** on `DetailScaffold` (subtle, draws in on mount)
- **Inline 3-station spine** in `SkillsBridge`, readiness banners
- **Full journey diagram** in `CareerChanger` pivot, `PathwaysHub`, elite/PhD
  flows, admission "you-are-here"
- **Progress spine** in My World / learning (stations = milestones reached)
- **Likelihood node** on `OpportunityCard` (fill = high/medium/low)

One device, every module, always meaningful.

---

## 2. Motion System — "travel down the line"

Orchestrated, not scattered. All configs in `src/theme/motion.ts`.

| Moment | Motion | Where |
|--------|--------|-------|
| Screen mount | Route line draws L→R (240ms), stations light in sequence (60ms stagger) | DetailScaffold, hubs |
| Data load | Cards fade + rise 8px, 45ms stagger by index | every list |
| Skill bridge | "Lays track" — segments extend sequentially | SkillsBridge |
| Stat tile | Numeral counts up from 0 (500ms ease-out) | StatTile, DemandMetricsBlock, admin StatCard |
| Chip toggle | Active chip springs (0.92→1) + accent wash fills | filter rows |
| Press | Card lift (shadow xs→md) + scale 0.98, spring back | PressableCard, RoleCard |
| Save | Node "arrives" — scale 1→1.25→1 pop | SaveButton |
| Search focus | Border hairline→cobalt, 180ms | AnimatedSearchBar |
| Collapse | Height + chevron 90° rotate, layout spring | RoleClusterSection |

**Accent discipline:** cobalt marks *active / current / you-are-here* only.
Everything at rest is ink + hairline.

**Reduce-motion:** `AccessibilityInfo.isReduceMotionEnabled` collapses every
animation to a 120ms opacity fade. No transforms, no count-up (show final value).

---

## 3. Always-On Data Context

From the category research: every metric ships with **scope + comparison +
freshness**. Stale data must *look* stale.

`StatTile` contract:
```
┌──────────────────┐
│ 240              │ ← value (Spline Sans Mono, xxxl)
│ JAMB aggregate   │ ← label (Inter 600, sm)
│ ▲ 12 vs 2024     │ ← delta (semantic color + arrow)
│ 2025 · indicative│ ← scope + freshness (mono, muted, xs)
└──────────────────┘
```
Freshness > 12 months → stamp desaturates + "indicative" tag. Wires through the
existing `DataSourceBadge` (`verified / inferred / pending`).

---

## 4. Module Coverage

| Module | COMPASS application |
|--------|---------------------|
| **Explore** | Route-line hero; typed DomainChips; three "doors" as route-origins; staggered result groups |
| **Domain / Role / Programme detail** | Route-line header; StatTile demand grids; skill-bar "lay track"; tool/cert groups with left-accent |
| **Opportunities · Scholarships · Internships · Windows** | StatTile deadlines w/ freshness; likelihood as node-fill; scope chips (local/global/remote) |
| **Skills · Entrepreneurship · Portfolio** | SkillsBridge "laying track"; portfolio = stations reached; progress spine |
| **Elite · PhD · Qualification · Chartership** | Full journey diagram at hero size; stage nodes |
| **Admission Intelligence** | "You-are-here" route to cut-off; StatTiles for floor/aggregate/competitiveness; mono numerals |
| **Admin Intelligence** | Analyst dark mode; StatCards count-up + delta arrows; typed transition colors on charts; sidebar active-rail |
| **My World / Learning** | Route-line as *progress* spine — unifies game side with career side; XP/streak as station fills |

---

## 5. Component Upgrades

### 5.1 Foundation (this pass)
- `theme/index.tsx` — new palette (light + dark), semantic tokens, type roles
- `theme/fonts.ts` — `useCompassFonts()` (expo-font loader)
- `theme/motion.ts` — spring/timing presets, reduce-motion helper
- `components/careerIntelligence/RouteLine.tsx` — **signature** (header rule →
  inline spine → journey diagram, one component, `variant` prop)
- `components/careerIntelligence/StatTile.tsx` — the data-context contract
- `DetailScaffold` — route-line header + back-slide + mono eyebrow
- `DomainChip` — press spring, glyph, in-demand node dot

### 5.2 Later phases (per module)
`AnimatedSearchBar` · `AnimatedFilterChip` · `SkillsBridge` (lay-track) ·
`DemandMetricsBlock` (StatTile grid) · `RoleClusterSection` (layout collapse) ·
`OpportunityCard` (likelihood node) · admin `StatCard` (count-up) · `Sidebar`
(active rail) · `SectionHeader` (accent rule) · empty states (route-map artwork).

---

## 6. Quality Floor
Responsive to mobile · visible keyboard focus · reduce-motion respected ·
dark-mode contrast AA · fonts behind `useCompassFonts` splash gate · one accent,
spent once per screen.

---

## 7. Build Order
1. **Foundation** (tokens · fonts · motion · RouteLine · StatTile · DetailScaffold · DomainChip) ← *this pass*
2. Explore + Domain/Role/Programme detail
3. Opportunities + Scholarships + Pathways
4. Skills + Portfolio + My World
5. Admin intelligence
6. Quality pass (contrast, reduce-motion, low-end perf)
