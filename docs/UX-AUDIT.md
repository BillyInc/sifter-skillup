# Sifter LevelUp — UX Audit

Phases 1–2 of the design brief (Discover, Audit). Written before any redesign
work, per §4: *"Do not immediately start coding."*

Every finding below was verified against the code or the live dev API. Nothing
here is inferred from the brief's mockups, because **those mockups were not
supplied** — see "Blocked" at the end.

---

## Status

The audit was written before any redesign work; some findings have since been
acted on. Findings are amended in place when investigation contradicts the
original wording — H3 was materially wrong as first written, and says so.

| Finding | State | Where |
|---|---|---|
| C1. Global search returns nothing | **Fixed** | #97 |
| C2. Fabricated user data in search overlay | **Fixed** | #97 |
| H1. Accessibility largely absent | **Partly fixed** — app shell closed; rest concentrated in legacy simulators | #101 |
| H2. Design tokens leak (1,401 hex literals) | Open — reframed as a dark-mode consistency risk, not a broken rollout | — |
| H3. Competing breakpoints | Open — **finding corrected**; the token set exists, 13 sites bypass it | — |
| H4. `Opportunities` / `Jobs` mismatch | Open — **needs a product naming decision**, not a code change | — |
| M1. Thin loading states | Open | — |
| M2. Duplicate destinations | Open | — |

Separately, the primary action colour moved from blue to orange (#99), with
contrast and hue-collision pinned by `__tests__/paletteContrast.test.ts`.

---

## Scope reality: the codebase contains two products

This reframes the brief, so it comes first.

`app/` resolves to 88 routes. Roughly half belong to the career-intelligence
product the brief describes:

> `/explore`, `/explore/domains`, `/explore/domain/[id]`, `/explore/programme/[id]`,
> `/explore/role/[id]`, `/explore/admission`, `/explore/elite`, `/explore/pathways/*`,
> `/explore/compare`, `/opportunities/*`, `/myworld`, `/fields`, `/settings/my-school`

The other half belong to a Duolingo-style crypto/quant learning app — the
product `CLAUDE.md` still describes as the whole repo:

> `/map`, `/map/island`, `/map/lesson`, `/skills/quant-map`, `/skills/interview`,
> `/starknet-track`, `/cairo-builder-track`, `/ecosystem-track`, `/track-room`,
> `/portfolio`, `/streaks`, `/guild`, `/community/*`, `/merchandise`, `/world`

The brief's IA (Subjects → Programmes → Domains → Roles → Skills → Opportunities)
covers only the first. **The team has already chosen a direction** —
`app/(tabs)/_layout.tsx` registers a five-destination shell and comments the rest
as *"Preserved legacy learning routes (fold into My World in a later phase)"*.

So the redesign should not re-litigate the IA. It should execute the fold that
the layout already promises. Until it happens, `/world` and `/myworld`, and
`/guild` and `/community/guild`, are duplicate destinations.

---

## Critical

### C1. Global search returns nothing, and cannot

**Current behaviour.** `ReferenceShell` renders a `SearchOverlay` — the app-wide
search surface reachable from every screen. Its state is declared without
setters:

```ts
// src/components/shell/ReferenceShell.tsx:164
const [overlayResults] = useState<{ label: string; items: SearchResult[] }[]>([]);
const [overlayLoading] = useState(false);
```

`overlayResults` is therefore permanently `[]`. `searchQuery` is used at exactly
one place — the input's own `value` (line 430) — and is never queried against
anything. Selecting a result ignores it entirely:

```ts
onResultPress={(result) => {
  // Navigate based on result type — actual routing wired by screens
  router.push(`/(tabs)/explore` as any);
}}
```

**Why it is a problem.** §10 makes search-first exploration the product's
central interaction model. The app-wide search can never return a result, and
every query silently dead-ends on `/explore`.

**This is not a backend gap.** `GET /api/career/search` exists
(`backend/routes/career_routes.py:876`) and returns real, structured, routable
data today:

```
$ curl '.../api/career/search?q=nursing'
{"status":"real","data":{
  "domains":[{"id":"D024","name":"Nursing","cluster":"Health & Biomedical"}],
  "roles":[{"name":"nursing lecturer","tier":"mid",
            "domains":[{"domainId":"D039", ...}]}]}}
```

Domains carry `id`, roles carry `domainId` — everything routing needs.

**Recommended.** Wire the overlay to `/api/career/search`, debounced, honouring
the existing `scope` control; route on `result.type` to
`/explore/domain/[id]` / `/explore/role/[id]` / `/explore/programme/[id]`.

**Affected.** `src/components/shell/ReferenceShell.tsx`,
`src/components/careerIntelligence/SearchComponents.tsx`.

---

### C2. Fabricated user data in the search overlay

**Current behaviour.** Same component, same render:

```ts
recentSearches={["Medicine & Surgery", "UNILAG", "Computer Science"]}
suggestions={["Law", "Engineering", "Accounting", "Nursing"]}
```

**Why it is a problem.** §3 forbids fabricating user information, and §31
forbids presenting placeholder content as real. "Recent searches" is a claim
about *this user's own history*. A student who has never searched is shown three
searches they never made — including a specific university. This is the clearest
violation of the brief's non-negotiable rule anywhere in the product.

**Recommended.** Persist real recent searches locally and show the section only
when non-empty. `suggestions` is defensible as editorial content but must be
labelled as such ("Popular right now"), not rendered indistinguishably from
personal history — or better, derived from real query counts.

**Affected.** `src/components/shell/ReferenceShell.tsx:443–447`.

---

## High

### H1. Accessibility is largely absent

29 of 230 `.tsx` files under `src/screens` + `src/components` carry any
`accessibilityLabel` or `accessibilityRole` — about **12.6%**, up from 9% at
first audit. §21 asks for an accessible product; icon-only controls are the most
exposed, since a Feather glyph contributes no text to the accessibility tree.

**The app shell is now fixed** (#101). It was the highest-leverage single file —
it wraps every screen and had zero accessibility props, so its five icon-only
controls (menu, search, theme toggle, avatar, drawer close) each announced as a
bare "button", and the active nav item was distinguished by colour alone (a WCAG
1.4.1 failure). Both are closed, with tests that assert the rendered
accessibility tree.

One lesson from that work is worth recording, because it will recur across the
rest of this finding: **a naive "does this control contain a `<Text>`?" audit
gives false confidence.** `@expo/vector-icons` renders every glyph as a `<Text>`,
so a bare icon button looks named. Any coverage check has to ignore private-use
-area codepoints (U+E000–U+F8FF).

The remaining gap is concentrated, not diffuse — the untouched files with the
most controls are almost entirely the legacy simulator surface:

| Controls | File |
|---|---|
| 74 | `components/simulators/SimulatorCard.tsx` |
| 39 | `components/simulators/QuantSimulatorCard.tsx` |
| 34 | `screens/LessonScreen.tsx` |
| 32 | `components/simulators/island08SimulatorDefs.tsx` |

That concentration is useful for sequencing: the career-intelligence product
(the brief's actual subject) is in better shape than the 12.6% headline suggests,
and the bulk of the debt sits in the inherited quant/island learning components.
And `SimulatorCard_ADDITIONS.tsx` (22 controls) is **dead code** — nothing
imports it; its only mention anywhere is inside a comment in
`hooks/useSimulatorWallet.ts`. Its sibling `SimulatorCard_PATCH.ts` is dead too.
That is **1,394 lines** that should be deleted rather than made accessible, and
deleting them also removes 22 controls from this finding's denominator.

(`island08SimulatorDefs.tsx` is by contrast genuinely live — `SimulatorCard`
imports 15 simulators from it. The `_ADDITIONS` / `_PATCH` naming is the tell:
both are leftover scaffolding from a migration that landed elsewhere.)

Worth noting the opposite finding, because it is a genuine strength: **reduced
motion is properly implemented and consumed**. `src/theme/motion.ts` reads
`AccessibilityInfo.isReduceMotionEnabled()` and subscribes to changes, and six
animation components honour it (`StaggerReveal`, `SharedElement`,
`SkeletonCrossfade`, `CelebrationBurst`, `SaveButton`, the shell). §18's
reduced-motion requirement is already met.

### H2. Design tokens leak — 1,401 raw hex colours

`src/theme/index.tsx` exports a real token system (`Spacing`, `Radius`, `Shadow`,
`Colors`, `Fonts`). Despite that, `src/screens` + `src/components` contain
**1,401 raw `#rrggbb` literals across 62 files**. §26 asks for a token system;
one exists but is bypassed at scale, which makes consistent theming — and the
light/dark behaviour the shell already supports — unreliable.

### H3. Four competing breakpoints bypassing the token set that exists

*Corrected after investigation.* This finding originally said "there is no shared
breakpoint token". That is wrong: `src/hooks/useResponsive.ts` exports
`BREAKPOINTS` (`wide: 1280`, `desktop: 1024`, `tablet: 768`, `mobile: 375`) plus
`useResponsive()`, `useSidebarNav()` and `useCommandPalette()`, and it is used in
73 places. §17's responsive system is built.

The real defect is that **13 sites bypass it with raw literals**, across four
thresholds — `768`, `900`, `960`, `1100` — of which only `768` is a defined
breakpoint at all:

| Threshold | Sites | Notes |
|---|---|---|
| `1100` | `shell/ReferenceShell.tsx:194` | not a defined breakpoint; `useSidebarNav()` returns exactly this intent (`isWeb && isDesktop`) and is unused here |
| `960` | `web/WebGrid.tsx:41` | not a defined breakpoint |
| `900` | 3 admin dashboards | not a defined breakpoint; **no** `Platform.OS` guard, unlike the others |
| `768` | 6 screens + `Sidebar`, `AIExplainer` | matches `BREAKPOINTS.tablet`, hardcoded anyway |

Note the original claim that "a large native tablet never receives the wide
layout" holds only for the web-guarded sites, and those guards look deliberate.
The admin dashboards have no guard at all — so the inconsistency runs in both
directions.

Consolidating shifts layout at the margins (1100 → 1024 for the shell), so it
wants a visual check, not a blind sweep.

### H4. Primary-nav label mismatch — needs a naming decision, not a code fix

The same destination is "Opportunities" in the desktop sidebar and "Jobs" in the
mobile bar (`ReferenceShell.tsx:45` vs `:62`).

*Investigated:* this cannot be closed by renaming the mobile tab. "Opportunities"
is ~78px at 11px semibold, and a five-way split tab bar on a 375px screen leaves
each label ~59px — it does not fit inline or stacked.

Nor can it be papered over with `accessibilityLabel="Opportunities"` on a tab
that visibly reads "Jobs": that would *introduce* a WCAG 2.5.3 (Label in Name)
failure and break voice control. The accessible name correctly follows the
visible text today.

Resolving it means choosing one short, accurate word for the destination. "Jobs"
is not it — the section also covers scholarships and deadlines. **This is a
product vocabulary decision and is deliberately left open.**

---

## Medium

### M1. Loading states are thin

Five files reference `Skeleton` across the whole app. Several career-intelligence
screens transition straight from nothing to full content. §29 and the motion spec
(§18) both assume a considered loading state.

### M2. `/world` and `/myworld`, `/guild` and `/community/guild`

Duplicate destinations surviving the IA transition. Consolidate as part of the
fold that `(tabs)/_layout.tsx` already anticipates.

---

## Explicitly *not* a finding

**The career-intelligence product does not fabricate data.** Grepping for
hardcoded institutions, salaries and statistics returns hits only in the legacy
crypto simulators (`SimulatorCard_ADDITIONS.tsx`, `LabObjects.tsx`,
`ChartReplayRenderer.tsx`) — rug-pull training scenarios and synthetic candles,
where invented values are the pedagogy, not a data-integrity failure. No mock,
fixture or sample module ships in `src/`.

The career surfaces consistently degrade to `—` or an honest empty state rather
than invent a number, which is exactly what §3 asks for. This is the codebase's
strongest existing alignment with the brief and should be preserved as a rule
during redesign.

One decision this raises: read literally, §3 forbids the invented figures in the
simulators. They are legitimate teaching content, so the rule needs an explicit
carve-out for simulation surfaces rather than a silent exception.

---

## Blocked

**The reference mockups do not exist on disk.** §2A, §2B, deliverable #3, and
Phases 4–5 all depend on "supplied mockups". `~/Downloads` contains only the
brief itself — no images, no Figma export, no archive of screens.

The written direction in §8 (visual language), §18 (motion), and §26 (tokens) is
detailed enough to proceed without them. But "compare against the supplied
references" (Phase 5) cannot be performed, and any mockups produced will be
derived from the written brief plus the existing design system rather than from
the product owner's visual work.
