# FIGMA MASTER DESIGN PROMPT — Sifter LevelUp / COMPASS Career Intelligence

> How to use: Section 0 is the **master context block** — paste it before EVERY generation
> prompt so Figma keeps the brand consistent. Then paste one numbered section at a time
> (1 → 10) to generate each surface. Do not generate everything in one shot; quality
> drops. One section = one Figma page.

---

## 0. MASTER CONTEXT BLOCK (prepend to every prompt)

Design a **premium, editorial, website-grade** product design for **COMPASS by Sifter LevelUp** — a career-intelligence and interactive upskilling platform for Nigerian students (senior secondary SS1–SS3, JAMB candidates, undergraduates, graduates, career changers) and for school guidance counsellors/educators.

This is **NOT a game and NOT a generic ed-tech template**. It is a serious, data-rich career-intelligence product — think the editorial confidence of Stripe.com, the data clarity of Linear/Vercel dashboards, the warmth and photography of Airbnb, and the trust signals of a financial-times-grade publication. Every screen must look like a crafted marketing-quality website page, not a bland admin skin.

### Brand system (use these exact tokens)
- **Primary accent — Cobalt `#3B3AC4`** (deep `#2E2A8F`, wash `#EEEEFB`). RULE: cobalt is reserved for *wayfinding and current-state only* — route lines, active tabs/chips, "you are here" markers, primary CTA. Never flood screens with it.
- **Warm note — Apricot `#F5A65B`** (wash `#FDF0E2`) — the single warm accent, for highlights, human moments, celebratory touches.
- **Ink & paper**: text `#111111`, soft `#374151`, muted `#6B7280`; background `#F0F2F6`, sunken `#EDEFEA`, cards pure white with soft layered shadows (y=4 blur=16 @9% and y=10 blur=24 @12%).
- **Semantic depth**: success `#0E9F6E`, warning `#B45309`, danger `#DC2626`, info `#2563EB`, **demand teal `#0D9488`**, **elite gold `#B8860B`** (each with a pale wash variant). Every metric is framed with one of these meanings — numbers never float contextless.
- **Dark mode**: bg `#11141A`, cards `#1A2029`/`#202733`, text `#E8EDF5` — generate every key screen in BOTH light and dark.
- **Typography**: Display = **Bricolage Grotesque** (ExtraBold/Bold — screen titles, hero numerals, eyebrow labels); Body = **Hanken Grotesk** (400–700); Data = **Spline Sans Mono** (all scores, cut-offs, salaries, percentages, dates, freshness stamps). Use big confident display sizes (28–56px) with tight tracking; generous line-height on body.
- **Geometry**: radius scale 6/9/11/14/18/24; spacing rhythm 3/6/10/14/18/22/28/40; hairline borders `#E5E7EB`.
- **Motion language — "travel down the line"**: a metro/route-line metaphor. Route lines draw themselves in (320ms inOut-cubic), stat numerals count up (520ms), cards lift on press (spring mass .6 damping 15 stiffness 220), staggered 240ms fade-and-rise reveals down the page. Annotate every screen with these motion notes.

### Imagery direction (critical — no bland screens)
- Use **real, warm, editorial photography of Nigerian / West-African students and young professionals**: students in secondary-school uniforms studying, university lecture halls, labs, moot courts, hospitals, engineering workshops, trading floors, design studios, courtrooms, farms with agritech, Lagos/Abuja skylines. Duotone or soft-gradient (cobalt→transparent) treatments over photos so text stays readable.
- Every **domain/field** gets a signature photographic identity: Law = courtroom/gavel/library; Medicine = teaching hospital/scrubs; Engineering = workshop/site helmets; Tech = code on screens/co-working; Finance = trading screens/skyline; Agriculture = drone-over-farm; Education = classroom; Creative = studio.
- Supplement photos with a **consistent line-icon set** (1.5px stroke, rounded caps, cobalt or ink) and **subtle geometric route-line illustrations** (thin cobalt lines with station dots) as background texture on hero sections and empty states.
- NEVER use: generic 3D blob illustrations, corporate-Memphis people, stock handshakes, or emoji as primary icons.

### Layout DNA (website-type, responsive)
- Design **web-first at 1440px** with a 12-col grid (max content 1200px), plus a 390px mobile variant per screen. Sidebar-shell for admin; top-tab/bottom-tab shell for the student app.
- Hero sections with photography + display type; asymmetric editorial grids; sticky section navs; card systems with clear hierarchy; generous whitespace; footers with data-source citations ("Data: JAMB 2025 · NUC CCMAS · refreshed Jan 2026" in mono).
- Every screen must include: realistic Nigerian data (real university names — UNILAG, UI, ABU, UNN, OAU, Covenant; real courses — Law, Medicine & Surgery, Computer Science, Accounting; naira salaries — ₦180k–₦2.4M/mo ranges; JAMB scores — 280/400 style), never lorem ipsum.
- Show all data states where relevant: loaded, loading (shimmer skeleton), empty (illustrated route-line empty state + one-line guidance), error, and "coming soon".

### Search quality standard (critical)
- Search must feel like a premium command centre, not a basic input. Design both **global search** and **scoped search** as first-class product surfaces.
- Search bar anatomy: 40–48px height, rounded but not pill-like unless in a command overlay, leading search icon, clear placeholder copy, keyboard shortcut hint on web, optional scope chip (`All`, `Programmes`, `Domains`, `Roles`, `Universities`), clear button, and focus state with a crisp cobalt/current-state ring or underline.
- Search results anatomy: grouped sections with clear labels (**Programmes / Domains / Roles / Universities / Scholarships / Opportunities / Admin records**), each result row with icon or thumbnail, title, one-line explanation, mono metadata, source/freshness where relevant, and a right-side action or chevron. Rows must be dense, readable, and full-width clickable.
- Highlight matched terms subtly in result titles/descriptions. Do not use loud highlight blocks.
- Include rich result previews:
  - Programme: programme name, institution count or university, JAMB/UTME requirement chips, linked domain count.
  - Domain: domain photo/icon, demand meter, role count, top programmes.
  - Role: salary range in mono, demand trend, route count.
  - University/institution: location, ownership type, programmes offered, verification/data freshness.
  - Scholarship/opportunity: deadline chip, eligibility chips, award/salary range in mono.
- Search must support filters without clutter: result-type tabs, chips for level/domain/location/school type/deadline, and a compact “More filters” drawer on mobile.
- Design all states: idle suggestions, typing/loading skeleton, no query, too-short query, no results, limited guest preview, locked result, error, offline, and data-limited source notice.
- Guest search must not expose the whole database. Show limited preview rows, teaser counts, and sign-in CTA without feeling punitive.
- Mobile search should become a full-screen sheet with sticky search input, grouped results, filters as horizontal chips, and thumb-friendly row height.
- Admin search must handle people/programmes/institutions separately from student search, with privacy-aware redaction where consent or verification is missing.

---

## 1. AUTH & ONBOARDING (page: "01 Auth & Onboarding")

Design 10 screens, light + dark, web 1440 + mobile 390:

1. **Landing/Sign-in** — split layout: left = full-bleed editorial photo collage of Nigerian students with a drawn cobalt route line connecting "SS3 → JAMB 280 → UNILAG Law → Called to Bar", right = clean auth card (email, Google, guest). Display headline: "Every career has a route. See yours." Trust row: schools/data-source logos.
2. **Sign-up** — same shell, progressive disclosure, live validation states.
3. **Forgot password** — calm, single-purpose, with route-line micro-illustration.
4. **Intro carousel (3 slides)** — full-bleed photo per slide with duotone wash + one bold claim each: "Real cut-offs, not rumours" / "Every role, mapped to a course" / "Your school sees the same truth" — progress dots as route stations.
5. **Account-type gate** — 6 large selectable persona cards with photography: Senior-Secondary Student (SS1–SS3), JAMB Candidate, Current University Student, Graduate, Skilled Worker/Professional, Career Changer. Hover lifts, selected = cobalt ring + station dot fills.
6.–10. **Persona setup forms** (one per persona) — multi-step with a horizontal route-line stepper (stations fill as you advance): school & class level, subjects/JAMB combo picker (chip grid), aspiration picker with photo cards, state-of-residence map chip. Finish = celebratory apricot moment "Your compass is set" with confetti restrained to a one-time particle burst along the route line.

## 2. STUDENT SHELL & HOME (page: "02 Home & Shell")

1. **App shell** — web: top nav with logo, Explore / Opportunities / My World / Community tabs, search, streak flame, avatar; mobile: bottom tab bar (5 tabs, cobalt active station-dot indicator that slides between tabs).
2. **Career Home dashboard** — editorial magazine layout: greeting + persona context ("SS2 · Science · aiming Medicine & Surgery"), a **hero "Your Route" card** showing the student's personal route line (current station glowing cobalt, next milestones ahead, e.g. "SS2 → WAEC → JAMB (target 310) → UNILORIN Medicine → Housemanship"), then an asymmetric grid: "Admission windows closing soon" (urgency amber), "Roles rising in demand this month" (teal sparklines), "Continue your skill track" progress card, "New scholarships for you" — each block with its own photographic or data identity.
3. **Global search overlay** — command-palette quality, not a plain dropdown. Include focused search bar, keyboard shortcut hint, recent searches, suggested searches, grouped results (Domains / Roles / Programmes / Universities / Scholarships / Opportunities) with mono metadata, highlighted matched terms, loading skeletons, empty/no-results states, guest-preview limit, and mobile full-screen sheet variant.
4. **Notifications center** + notification settings screen.
5. **Streaks screen** — reframed as "Consistency" (NOT gamey): calendar heat-map in cobalt washes, current run counter in mono display numerals, gentle urgency banner.

## 3. EXPLORE — CAREER INTELLIGENCE CORE (page: "03 Explore")

The heart of the product. Design with maximum craft:

1. **Explore hub** — editorial front page: full-bleed domain hero carousel (photography per domain), "Browse 8 domains" grid, "Pathways" strip, "Admission intelligence" entry card with a big mono cut-off numeral, elite-pathways gold strip. Include a high-quality scoped search module for programmes/domains/roles with filters, typed loading state, grouped results, and guest-limited preview state.
2. **Domain explorer index** — masonry/editorial grid of domain cards: photo top, name, sub-group count, demand meter (teal), tap target whole-card.
3. **Domain detail** — magazine article layout: hero photo with duotone + display title, sticky in-page nav (Overview / Sub-groups / Roles / Programmes / Demand), role-cluster sections as horizontal card rails, demand-metrics block (teal stat tiles + 12-month sparkline), foundation-skills block, data-source badge footer.
4. **Role detail** — the flagship screen: hero with role title + photo, stat-tile row (median salary ₦, demand index, openings trend, remote share — mono numerals with count-up annotation), "Routes into this role" as a **vertical route-line diagram** (university path / credential path / skills path as branching lines with station nodes), skills bridge (have vs need), tool groups, certifications with placement, related roles rail, "Save" + "Subscribe to demand alerts" actions.
5. **Programme overview** — university programme page: institution crest + campus photo, CCMAS-aligned course outline accordion, admission block (cut-off mono numeral, subjects required chips, competitiveness gauge), career-outcomes route fan-out.
6. **Admission intelligence index + detail ([jambName])** — data-forward: searchable table/cards of programmes with cut-offs, o-level + UTME requirement chips, competitiveness bands (success/warning/danger washes), formula explainer card ("How UNILAG computes aggregate: UTME/8 + Post-UTME/2 = …" in a beautiful mono equation block), freshness stamp.
7. **Elite pathways hub + detail** — gold `#B8860B` identity: dark editorial hero ("The 1% routes"), elite pathway cards with prestige photography (Supreme Court, teaching hospitals, big-4 offices), detail = long-form route line with gates and requirements at each station.
8. **Pathways hub** + 5 pathway screens (**Career change, PhD, Credentials/Chartered, Qualification upgrades, Entrepreneurship**) — each with its own hero identity and a bridge-view diagram (current state → bridge steps → target state).

## 4. OPPORTUNITIES (page: "04 Opportunities")

1. **Opportunities feed** — job-board-grade: filter rail (type, domain, deadline, location, remote), rich opportunity cards (org logo, title, ₦ range mono, deadline countdown chip in amber when <14 days, match badge).
2. **Opportunity detail** — hero with org photo, requirement checklist vs your profile (green ticks / amber gaps), application-window timeline bar, save/subscribe.
3. **Organisation profile** — company-page layout: cover photo, logo, stats row, open roles rail, "routes people took to get here".
4. **Scholarships index** — cards with award ₦ amounts in display mono, eligibility chips, deadline urgency.
5. **Application windows** — a beautiful **timeline/calendar view**: horizontal months, window bars per programme (JAMB reg, Post-UTME dates, scholarship deadlines), today-line in cobalt.

## 5. MY WORLD — PERSONAL SPACE (page: "05 My World")

Personal, private, calm. Include: saved items (roles/programmes/scholarships as collections with cover photos), personal notes widget (sticky-note-quality editor, mono timestamps), diary screen (journal entries with date route-line spine down the left), portfolio + portfolio hub (project cards, GitHub integration card, artifact showcase like a personal website), profile screen (avatar, persona summary, aspiration route card, edit states), settings + my-school screen (school affiliation card with verify state), privacy & terms screens designed as readable legal-editorial pages (not walls of text — anchored side nav, highlighted key-points callouts).

## 6. LEARNING & SKILLS — INTERACTIVE UPSKILLING (page: "06 Skills")

Frame as **professional upskilling, not a game** (no cartoon mascots on these designs; keep craft cues from pro tools):

1. **Skills hub** — track cards (Quant Trader, Quant Researcher, Quant Developer, Python, Crypto Literacy) with prerequisite-chain route lines between them, per-track progress rings, photography of real trading/coding contexts.
2. **Track map** — the level map as a **metro map**: a drawn cobalt route with station nodes (complete = filled, current = glowing, locked = muted `#C4C8D4`), branch lines for prerequisites, elegant labels — NOT a candy-crush path.
3. **Lesson screen** — focused learning canvas: progress bar top, question card typography-first, code blocks in Spline Sans Mono with syntax accents, answer chips with press-lift, correct = success wash sweep, XP toast minimal.
4. **Simulator screens** (chart-replay trading sim, code sandbox, branching interview, judgment scenario) — pro-tool aesthetics: dark canvas panels, mono data, restrained neon accents on charts.
5. **Interview mode** — split conversational layout, scenario cards.
6. **Completion states** — measured celebration: apricot accent, route-station fills in, "Next station" CTA.

## 7. COMMUNITY (page: "07 Community")

Feed (post cards with rich embeds of roles/programmes — sharing a role renders a mini route-card), leaderboard (restrained, mono numerals, top-3 with subtle gold/silver/bronze washes, school-vs-school toggle), guild/study-group pages (cover photo, member avatars, shared goals as collective route), referral screen (shareable card design with the route-line motif, code in display mono).

## 8. ADMIN / EDUCATOR — SCHOOL GUIDANCE DASHBOARD (page: "08 Admin")

A distinct **professional dashboard identity** — same tokens, denser layout, sidebar shell (school crest, nav groups: Overview / Students / Intelligence / Verification / Settings). Design all of:

1. **Guidance dashboard (overview)** — KPI stat-card row (mono numerals with count-up annotation, delta chips), "students by aspiration" horizontal bars, cohort route-distribution diagram, alerts panel.
2. **Student management + provisioning** — data-table system (sortable headers, row hover, bulk actions, status pills), provisioning flow modal (CSV upload with mapping preview, generated credentials cards), the visibility-rule callout designed as a trust banner ("Students control what you see").
3. **Domain intelligence** — analytics: domain rank panel, demand tables with sparkline bars, scope toggle (school / state / national) as segmented control.
4. **Role demand, Salary benchmarks, Skills gap, Trends, Remote, Vs-national** — each a crafted analytics screen: chart-forward, teal demand identity, peer-comparison charts, national-benchmark panels with clear "your school vs national" dual-tone bars.
5. **Expert dossier** — editorial profile page for verified experts.
6. **Verification screen** — queue cards with document-free trust states (approve/reject with reason).
7. **Feedback inbox** — triage list + detail pane, status workflow chips.
8. **Educator onboarding** — welcome sequence matching the student onboarding craft.
9. **Peers, Affiliation, Session mode, Programme dashboard + demand table, Coming-soon panel** — complete the set.

## 9. COMPONENT LIBRARY (page: "09 Components")

Build the full design-system sheet with variants + states (default/hover/pressed/focus/disabled/loading, light+dark):

Buttons (primary cobalt / secondary ink / ghost / destructive; sm-md-lg), inputs (text, search, select, chip-multiselect, date), **SearchBar** (idle/focused/typing/loading/error/disabled, with scope chip + shortcut hint + clear button), **SearchResultRow** (programme/domain/role/university/scholarship/opportunity/admin-record variants), **SearchResultsPanel** (grouped results, empty, no-results, guest-limited, locked, mobile sheet), chips & filter pills, **StatTile** (label eyebrow + mono numeral + delta + semantic wash), **RouteLine** (horizontal + vertical, 2–8 stations, states), **DomainChip**, **RoleCard / OpportunityCard / ScholarshipCard / OrganisationCard / ElitePathwayCard / ApplicationWindowCard**, badges (**TierBadge, ReadinessBadge, RoleMatchBadge, DataSourceBadge** with freshness stamp), demand meter + sparkline set, bridge-view diagram, tables (admin data-table kit), tooltips (**InfoTooltip, MetricTooltip**), coach mark, toasts & banners (offline, sync, streak-urgency, celebration overlay), skeleton shimmer set, empty/error/coming-soon state illustrations (route-line motif), modals & sheets (comment sheet, flag modal, review modal, OAuth consent), tab bars & sidebar nav, avatar & AddressPill, PDF-export button, save/subscribe buttons with micro-interaction notes.

## 10. MOTION & TRANSITION SPEC (page: "10 Motion")

Storyboard frames (before/during/after) for: route line draw-in on screen entry (320ms inOut-cubic, stations pop with spring as line reaches them); stat numeral count-up (520ms out-quad); staggered card cascade (240ms fade+8px rise, 60ms stagger); tab-change station-dot slide; card press lift (spring .6/15/220); save-button pop; screen-to-screen shared-element transition (role card photo expands into role-detail hero); skeleton→content crossfade; celebration particle burst along route line; dark/light theme crossfade. Include a reduce-motion column: fade-only, no transforms, final values shown immediately.

---

### Acceptance bar (apply to every generation)
- Would this screen look at home on stripe.com or linear.app? If not, redo.
- Is there at least one photographic or data-visual focal point per screen? No text-only walls.
- Is cobalt used ONLY for wayfinding/current-state/CTA? Is every metric semantically colored?
- Are numerals in the mono data face? Are Nigerian data details realistic?
- Are light + dark, web 1440 + mobile 390, and loading/empty states covered?
- Does search feel premium: scoped, grouped, metadata-rich, keyboard-friendly, mobile-sheet ready, and protected against bulk database browsing?
