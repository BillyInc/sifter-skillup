# Sifter LevelUp — UX Audit

Phases 1–2 of the design brief (Discover, Audit). Written before any redesign
work, per §4: *"Do not immediately start coding."*

Every finding below was verified against the code or the live dev API. Nothing
here is inferred from the brief's mockups, because **those mockups were not
supplied** — see "Blocked" at the end.

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

20 of 226 `.tsx` files under `src/screens` + `src/components` carry any
`accessibilityLabel` or `accessibilityRole` — about **9%**. §21 asks for an
accessible product; icon-only controls (the mobile bar, save buttons, carousel
arrows) are the most exposed.

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

### H3. Three competing breakpoints, one of them web-only

The shell switches to the sidebar at `width >= 1100` **and** `Platform.OS === 'web'`,
while screens independently use `width >= 768` (7 sites) and `width >= 900`
(4 sites). §17 asks for a responsive system; there is no shared breakpoint token,
and a large native tablet never receives the wide layout regardless of width.

### H4. Primary-nav label mismatch

The same destination is "Opportunities" in the desktop sidebar and "Jobs" in the
mobile bar (`ReferenceShell.tsx:42` vs `:50`). The brief treats Opportunities as
a first-class concept; the two names should not disagree across viewports.

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
