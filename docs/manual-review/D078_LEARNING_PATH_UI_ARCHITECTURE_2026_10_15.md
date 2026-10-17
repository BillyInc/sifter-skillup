# D078 learning-path UI architecture and interaction blueprint

**Date:** 2026-10-15  
**Status:** Architecture baseline for the remaining implementation; not a claim of rendered acceptance, database deployment, or student promotion.  
**Scope:** Sociology programme → Social Sciences & Behavioural Research → one or more canonical areas of specialization → optional role routes → saved/printed learning plan.

## 1. Purpose and controlling decisions

This document consolidates the user’s display and flow requirements with the
controlling guided-experience specification, implementation plan, Sociology
pilot, existing D078 granular UX mockup, current complaint audit, and rebuilt
programme-to-role graph. It is the design baseline for the remaining fixes; it
does not restart already-completed research or disposition decisions.

The experience must make one continuous story legible:

```text
What Sociology has already taught
          ↓ relevant connection, not equivalence
What is broadly needed to enter this domain
          ↓ selected area adds its own supported learning
What the chosen role adds (only if the learner chooses a role)
          ↓
One or more route-separated plans → My World → preview → print/download/share
```

The learner sees two kinds of learning at each applicable level:

1. **Compulsory learning path** — only items explicitly supported as needed for
   the selected route, with true prerequisites placed before what they support.
2. **Optional useful edges** — supported items that can help with a named task,
   area or role but are not required to continue. They may have their own useful
   ordering, alternatives and complements, but do not block the compulsory
   path.

Both sections may contain any mixture of skills, tools, methods, knowledge,
competencies and certifications. Do not create separate sections by item type.
“Shared foundation” is a coverage/reuse idea, not permission to call an item
compulsory. Requirement level and route evidence determine placement.

Programme curriculum, theme narrations, course outcomes and theme resources
are fixed context. They are not supplemental learning selections. Hiding
course codes in student copy must not remove course titles or distort source
outcomes. No course or enrichment item should be described as teaching or
proving something beyond its evidence.

Canonical areas are the seven current D078 areas. The retired pair of legacy
subgroups is never a student-facing layer, grouping, count, or output. A role
may have more than one supported area route; each route gets its own context.

## 2. Information architecture and route graph

### 2.1 Canonical route

```text
Programme overview
  ├─ programme themes (fixed curriculum + faithful outcomes + theme resources)
  ├─ programme-to-domain connection (why it appears; what transfers/does not)
  └─ domain entry
      ├─ domain overview (what it studies, asks, produces, who it works with,
      │  global/Nigerian context, entry expectations, opportunities/limits)
      ├─ programme learning already covered (only relevant outcomes/evidence)
      ├─ domain compulsory learning path (mixed item types; dependency ordered)
      ├─ optional useful edges (mixed item types; skippable, route-labelled)
      └─ choose/compare one or more of the seven canonical areas
          ├─ area explanation and boundary
          ├─ inherited relevant domain learning (shown once as inherited)
          ├─ this area adds: compulsory additions
          ├─ optional useful edges for this area
          └─ view roles supported by this area
              ├─ role overview and task/output context
              ├─ inherited domain/area learning (not re-labelled as new)
              ├─ this role adds: compulsory additions
              └─ optional useful edges for this role
```

“Compulsory” means needed for the selected learning route according to reviewed
evidence; it is not a claim of legal licensing or guaranteed job readiness.
If the evidence supports no hard prerequisite, show a sensible reviewed
learning order without inventing a blocker. If a role is supported by multiple
areas, the learner can inspect each area context and add the role under one or
more separate route branches; do not merge the branches into a universal role
checklist.

### 2.2 Whole-path learning sequence

The display order is derived from the selected route and approved graph, not
from item type, alphabetical order, tool popularity, or raw graph layout:

```text
Fixed programme context (not selectable)
  └─ relevant outcomes already covered (not re-taught as new requirements)
      └─ compulsory domain items
          └─ compulsory additions for selected area
              └─ compulsory additions for selected role

At each level, alongside—not inside—the compulsory route:
  optional useful edges → optional dependencies/companions/alternatives
```

Sequence rules:

- An approved hard `requires` edge places the prerequisite first and can block
  adding the dependent item until the learner adds or explicitly acknowledges
  the prerequisite according to the reviewed rule.
- A conditional prerequisite is shown with its condition and blocks only when
  that condition applies to the selected use case.
- `builds_on` may order learning without implying a universal hard gate unless
  its approved relationship contract says it is a requirement.
- `alternative_to` creates a choice/comparison group. It does not create two
  compulsory steps.
- `complements` and `works_with` show useful combinations but do not silently
  add the companion.
- `supports`/`used_for` explain a task or route connection; they do not by
  themselves create order or a requirement.
- Unknown, review-only, circular, out-of-route, or stale edges do not become
  blockers. Explain “relationship not established” only in staff/audit context;
  do not fabricate a student sequence.
- Carry inherited items forward once. Preserve the strongest route-specific
  explanation and provenance while distinguishing inherited context from a
  new area/role addition.

## 3. Student-facing screen mockups

These wireframes define hierarchy and behavior, not final visual styling.

### 3.1 Programme overview and theme details

```text
SOCIOLOGY
What this programme explores
[brief student-friendly, source-faithful overview]

WHAT YOU WILL STUDY
[Theme card] Social life and institutions
  What connects these courses: [short narration]
  [Explore theme] [Open learning materials]
[Theme card] Research and evidence
  ... (all curriculum-supported themes; no fixed four-theme cap)

WHERE THIS PROGRAMME CAN CONNECT
[Social Sciences & Behavioural Research]
  Why it appears · what your studies connect to · what they do not establish
  [Understand this field] [Compare connection]

Admission requirements (separate lane; not part of learning selection)
```

Opening a theme reveals: theme narration; course titles and student-friendly,
faithful outcome explanations; a “See source wording” evidence view; and
theme-scoped books/resources with “Why this helps with this theme,” exact
section/locator, provider/access, and a working learning/reference link.
Course identifiers remain available in evidence, not as unexplained student
headings. Theme resources are not silently added to the learner’s optional
focus.

The original CCMAS course-outline summary and original outcome wording are
preserved as source evidence but must not be shown as the default student
explanation. Show the learner-friendly outcomes first; provide a clearly
labelled, per-course “View original course outline” disclosure for users who
want the source wording, with a note that it may be technical or compressed.
Do not discard or rewrite the source text in the evidence record.

### 3.2 Domain overview and inherited programme context

```text
SOCIAL SCIENCES & BEHAVIOURAL RESEARCH
[What the field studies] [Questions it asks] [What practitioners produce]
[Who they work with] [Global practice] [Nigeria context]
[Entry expectations] [Opportunities and limits]

WHY YOUR SOCIOLOGY STUDIES CONNECT
What your Sociology programme covers: [faithful themes and outcomes]
How that learning carries into this field: [short evidence-backed narrative
that names directly transferable learning and explains its use here]
What this field adds: [compulsory domain foundations, then optional useful edges]
It does not by itself establish: [clear boundary]
[Open the programme evidence]

YOUR LEARNING ROUTE
1. Compulsory domain foundations
   [mixed-type items in reviewed order]
2. Optional useful edges
   [mixed-type items, grouped by supported task/route when helpful]

CHOOSE AN AREA OF SPECIALIZATION
[seven current areas; clear one-line distinctions]
```

Do not dump transferable programme capabilities as an unexplained list or
restrict the handoff to themes that happen to have an exact string-level match
in the transfer ledger. Where evidence supports a direct fit, explain it in the
transition narrative—for example, how studying social structures, culture,
socialisation, or human behaviour gives a Sociology learner a useful starting
point in Social Sciences. Then state plainly that this starting point is not
the whole field capability set and show what the domain adds next. Keep the
programme's full themes and outcomes available as inherited curriculum context;
describe an outcome as directly transferable only when its evidence supports
that claim. A missing exact transfer match is not evidence that programme
learning is irrelevant.

Do not show two competing labels such as “shared foundations” and “domain
foundation” for the same section. Recommended student labels are **Compulsory
domain foundations** and **Optional useful edges**. The programme context
precedes both. The list remains item-by-item and expandable, not a compressed
inline string.

### 3.3 Area and role route

```text
SOCIOLOGY AND SOCIAL ANTHROPOLOGY
What this area studies/does · its boundaries · how it differs from nearby areas

FROM YOUR SELECTED ROUTE
Inherited domain learning: [collapsed summary; expand to inspect]

WHAT THIS AREA ADDS
Compulsory additions: [only requirement-approved additions, mixed item types]
Optional useful edges: [task/use-case linked items, mixed item types]

ROLES IN THIS AREA
[role cards with task, output, route context and any other supported area links]
```

At a role:

```text
ROLE NAME
What people in this role do · typical outputs · who they work with
Why this role fits this area and D078

Carried forward: domain → selected area (shown once, expandable)
This role adds: compulsory role additions
Optional useful edges for this role
[Compare related route] [Add/remove focus] [Back to area]
```

If the learner has not selected an area, show the seven area choices as an
advisory next layer. Do not import area or role details into their saved route.
If the learner stops at programme + domain, that is a valid savable plan. If
the learner selects an area but no role, save the area-level plan and show
roles only as optional next choices, not as selected learning.

### 3.4 Reusable item card

```text
┌───────────────────────────────────────────────────────────┐
│ [Tool] Survey data analysis · Compulsory in this route   │
│ Helps you turn collected responses into checked findings.│
│ Used for: [named task]   Leads to: [area / role route]    │
│ [Details] [Relationships: 2] [Compare] [Add to my focus] │
└───────────────────────────────────────────────────────────┘

Expanded details
  What it is
  What it means in Sociology / this domain / this selected route
  What it helps you do (task and realistic output)
  Why it is included here (evidence-backed rationale)
  What to learn first / prerequisites (if established)
  Works with / complements
  Other valid choices (alternatives and trade-offs)
  What it cannot replace / limits
  Global context | Nigeria context (when supported)
  Learn or inspect: official/reference · explanation · free task-specific
  learning (or clearly labelled paid/video alternative)
  Evidence and source locator (expandable; student summary first)
```

Tools, methods, skills, competencies, knowledge and certifications use this
same detail order. Tool-specific facts (version, platform, cost/access) and
credential facts (issuer, jurisdiction, eligibility, assessment, renewal) are
shown only when relevant and sourced. Item inclusion is not a claim that the
student has mastered it. “Why it is included here” explains the route fit;
“What this helps you do” explains the task. Do not combine these into one
jumbled paragraph or expose internal audit phrases such as “task family,”
“route note,” “guardrail,” or raw disposition labels.

### 3.5 Relationship exploration and comparison

```text
Item card → tap “Relationships: 2”
  ┌───────────────────────────────────────────────┐
  │ BUILDS ON: Research question design           │
  │ Why: this method needs a clear question first. │
  │ [Open item] [Add prerequisite first] [Close]  │
  └───────────────────────────────────────────────┘
```

Relationship labels must be plain and explicit: **Learn first**, **Builds
on**, **Useful alongside**, **Choose one**, **Supports this task/route**.
The explanation distinguishes “must come first” from “helpful to learn first”
and “useful together.” Opening a target gives **Open this item**; closing or
Back returns to the exact expanded source card, scroll location and selected
route. No chip silently selects the target.

```text
Compare valid alternatives (same task/use case)
                 Option A       Option B
Work supported  ...             ...
Output          ...             ...
Prerequisites   ...             ...
Access/cost     ...             ...
Limits          ...             ...
Learning links  ...             ...
[Choose A] [Choose B] [Keep comparing] [Close]
```

Comparison is available for tools and every other item type only where the
evidence supports comparable alternatives. Opening comparison changes no
selection. Choosing an alternative replaces the conflicting choice within the
same route/choice group after a clear confirmation. Complements remain
separately addable. Do not compare unrelated items just because they share a
category.

### 3.6 Tray, route stacks and save destinations

The tray is persistent but non-blocking, with tiny icon/count, compact, mid and
full states. A successful selection visibly drops/pulses into a collapsed tray;
reduced-motion and screen-reader users receive the same state change without
depending on animation. The tray opens automatically after “Add to my focus.”

```text
MY LEARNING PLAN · 4 items · 2 routes

STACK 1  Sociology → Social Sciences & Behavioural Research
  Programme context     fixed; not selected as extra learning
  Domain                compulsory path [ordered items]
                        optional useful edges [separate list]
  Area: Social Research and Evaluation
                        inherited · compulsory additions · optional edges
  Role: Evaluation Researcher (only if selected)
                        inherited · role additions · optional edges

STACK 2  Sociology → Social Sciences & Behavioural Research → [another area]
  [independent route and selections]

[Edit] [Save to My World] [Preview report] [Print / Download] [Share]
```

Multiple programmes, domains, areas and roles are separate route stacks. On
adding another route, warn that its learning remains separate; never combine
all route-specific items into one requirement list. An identical stable item
may be shown as shared across stacks only if the route context and ownership
remain visible. Alternatives are shown as choices, not accumulated
requirements. Removing a selection removes it from that personal route only;
it never deletes canonical content. Saving is allowed at programme/domain or
area stop points without choosing a role.

My World stores a versioned personal snapshot. Reopen/edit acts on a copy;
delete removes the user's saved copy only. The route, stop point, item order,
alternative choice, inherited/addition status and source/data version remain
clear. Print/download and sharing preserve separate route headings and explain
that selections are a chosen learning focus, not proof of competence, entry,
qualification or job readiness. Sharing excludes private evidence/audit
details and does not expose another learner's selections.

## 4. Interaction and state model

```text
Browse route
  ├─ expand item ── inspect details ── open relationship ── open target
  │                                      └─ Back/Close → same item + state
  ├─ compare alternatives ── choose one ── replace choice in this route only
  ├─ add item ── validate scoped prerequisites/choice conflicts ── tray opens
  ├─ remove item ── recompute dependent warnings ── preserve other stacks
  ├─ change area/role ── preview impact ── confirm route-local transition
  └─ save stop point ── My World snapshot ── reopen/edit/print/share
```

Selection is reversible preference-setting. Before adding an item with a hard
prerequisite, explain the dependency and offer to inspect/add the prerequisite;
do not silently stack it. If a prerequisite is already selected in the same
route, reflect that it is satisfied. If a route change makes an item irrelevant,
ask whether to remove it from that stack or retain it as a separate optional
focus; do not silently carry it into an unrelated route. Deselecting a
prerequisite surfaces the dependent item and explains the consequence before
the learner confirms.

Every view/sheet must have a visible close/back action, platform Back support,
and state restoration. Returning from a relationship, comparison or tray must
restore the selected programme/domain/area/role, card expansion, scroll
position and selections. Route transitions must be explicit; the tray must not
be the only place where a user can tell which route is active.

## 5. Visual and content hierarchy

Use the existing design system tokens where possible, but enforce this minimum
hierarchy for the redesigned content:

| Content | Recommended minimum on mobile | Treatment |
|---|---:|---|
| Screen title | 26 px | Strongest heading; one per screen |
| Main section heading | 20 px | Clear separation and generous top spacing |
| Card/item title | 18 px | Semibold; distinct from type/status metadata |
| Main body / explanation | 16 px | Comfortable line height; no essential prose below this |
| Supporting metadata/chips | 13–14 px | Secondary, high contrast, wrap instead of clipping |
| Source locator / low-priority metadata | 12 px | Expandable; never used for essential explanation |

These are product design targets, not a claim of standards compliance. Avoid
9–11 px for theme narration, outcomes, item use, limits, or explanations. Use
consistent capitalization, sentence case for headings, bold only to guide
scanning, distinct spacing/background/borders for independent sections, and
adequate contrast. Do not rely on color alone for compulsory/optional,
alternative, conditional, or warning states. Respect text scaling, keyboard,
screen-reader labels, focus return, and reduced motion.

Every page follows: **orientation → inherited context → compulsory path →
optional useful edges → next-route choices**. Each detail gets its own labelled
section; course outcomes, item rationale, use case, relationships, limits and
resources must not be concatenated into one paragraph or an unlabelled row.

## 6. Data, API and graph projection

The student UI is a projection of the approved graph, not a raw graph viewer.
Each projected item needs stable identity, type, student wording, owning
checkpoint, requirement level, route/use-case scope, learner output, source
and learning resources, review/visibility state, and typed relationships.
Each relationship must retain typed endpoints, direction, explanation,
evidence, confidence/review state and applicability/condition. Unsupported or
review-only evidence remains out of confirmed student content; a stale
aggregate flag does not override a current individual reviewed decision.

The route projection should return distinct collections/metadata for:

```text
programme_context (fixed curriculum themes/outcomes/resources)
inherited_items (stable IDs + provenance + inherited-from route)
compulsory_items (ordered within the selected route)
optional_edges (ordered/grouped by supported use case; skippable)
relationship_groups (prerequisites, conditional steps, alternatives,
                     complements, supports/used-for)
route_options (canonical areas; role options under supported area route(s))
snapshot_state (route IDs, selected IDs, removed IDs, chosen alternatives,
                per-route order, stop point, taxonomy/data version)
```

Do not repurpose `useCaseKey` presence as the compulsory/optional contract.
Use an explicit reviewed requirement/status field consistently for domain,
area and role; preserve `useCaseKey` for task grouping. The graph builder and
API must derive the full selected path across levels, not merely sort each
individual list. Alternatives are choice groups, not dependency edges that
require all members. Rebuild the graph after integrating newly accepted tool
records and route relationships; then regenerate only the required local seed
artifacts. SQL remains a separately guarded/manual deployment step per
`AGENTS.md`.

## 7. Implementation sequence and acceptance gates

Implement in this order; a stage that passes stays closed unless a specific
regression is evidenced:

1. **Freeze and map the data contract.** Reconcile this blueprint with the
   current graph, item contract and screen payload; record exact source files
   and owner fields. Do not reopen accepted evidence decisions.
2. **Requirement and whole-route projection.** Make compulsory/optional
   placement explicit; derive the complete programme → domain → area → role
   order from approved edges; preserve cross-area role branches and inherited
   items once. Add unit tests for cycles, missing prerequisites, alternatives,
   conditional edges and unrelated routes.
3. **Programme and inherited context.** Render all 14 reviewed themes with
   readable narration/outcomes/resources. Carry relevant programme outcomes
   into domain and area connection sections with course titles but no course
   codes in student prose.
4. **Domain/area/role grouping.** Replace competing “shared/domain foundation”
   labels with the two route concepts; remove duplicated inherited sections
   while retaining every approved mixed-type item; show role cards under each
   supported area.
5. **Card and relationship interaction.** Make explanation sections distinct;
   wire relationship target navigation, comparison, add/remove, prerequisites,
   alternatives and complements. Preserve back/close context.
6. **Tray and persistence integration.** Verify add opens tray, collapsed-tray
   motion/fallback, route-separated stacks, save without role, save/reopen/edit,
   and route-local remove/reorder. Keep canonical data immutable.
7. **Typography and responsive rendered QA.** Apply the hierarchy above and
   inspect programme → domain → each canonical area → representative roles at
   mobile/desktop sizes. Check focus, text scaling, reduced motion, empty/error
   states, and interaction return paths.
8. **Reports and release.** Verify stacked report/print/download/share output
   reflects chosen stop point, routes, compulsory/optional distinction,
   alternatives, limitations and disclaimers. Only after complete rendered
   acceptance record student-facing approval and prepare/apply seeds through
   the documented manual SQL order.

### Acceptance matrix (must pass before student-facing release)

- Programme displays all reviewed themes, outcome explanations and correctly
  scoped materials; no false “not loaded” state when the local contract exists.
- Domain shows its real orientation, relevant Sociology programme outcomes,
  compulsory foundations and optional useful edges in that order.
- Every one of the seven canonical areas shows correct inheritance, its own
  additions and its applicable roles; no retired legacy subgroup labels appear.
- Every role card is attached to the domain and one or more evidence-supported
  areas, with route-specific task context; no role-only details leak into an
  unselected branch.
- Mixed item types remain mixed within compulsory and optional learning
  sections; no item is classified compulsory solely because it lacks a use-case
  key.
- Each displayed item clearly separates meaning, route fit, task/output,
  relationships, prerequisites, alternatives, limits and learning links with
  rationale.
- Alternative choice, complements, prerequisite prompts, include/remove,
  comparisons, back/close and tray opening behave as specified and preserve
  route state.
- Multiple routes remain separate through My World, report, print/download and
  share; saving at domain or area without a role is valid.
- No reviewed pass is reopened because an old aggregate, `false`, `pending`, or
  hidden snapshot is stale; only current individual evidence and a demonstrated
  regression may reopen it.

## 8. Source-of-truth and non-goals

Controlling references:

- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`
- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`
- `docs/SOCIOLOGY_GUIDED_EXPERIENCE_PILOT_2026_10_08.md`
- `docs/manual-review/D078_GUIDED_EXPERIENCE_GRANULAR_UX_AUDIT_AND_MOCKUP_2026_10_09.md`
- `docs/manual-review/D078_UI_AND_LEARNING_PATH_GAP_AUDIT_2026_10_15.md`
- `docs/manual-review/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.md`

This architecture does not reopen domain/area/role source research, curriculum
admission requirements, role-fit adjudication, analytics, or Supabase live
deployment. It does require incorporating already-researched tool items and
verified route relationships into the graph/seed where the accepted evidence
supports them. It is a design baseline and implementation contract, not proof
that any remaining UI work or live seeding is complete.

## 9. 2026-10-16 implementation clarification: inheritance is selection-aware

The following is an explicit acceptance rule for every transition, including
the tray, saved route, report and print projection:

- The programme stage carries its relevant themes and faithful learning
  outcomes forward as **already-studied context**. Explain in plain language
  which learning connects to the domain and what the domain adds. Do not turn
  programme outcomes into new domain requirements or claim a transfer that the
  evidence does not support.
- The domain's compulsory foundations continue into a selected area as
  **inherited domain learning**, shown once and not relabelled as new area
  requirements. The area then adds its own supported compulsory learning.
- Domain and area optional/useful edges remain separate from the compulsory
  path at every downstream layer. They are never automatically copied into an
  area, role, saved route or report. If the learner explicitly selects one, it
  may be shown downstream as a **learner-selected inherited option**, retaining
  its original owner, route/use-case context and optional status. If not
  selected, it may be offered as a role-relevant optional choice only when
  reviewed route evidence targets that role; label it as an available choice,
  never as inherited or already included in the learner's plan.
- A selected role inherits only the selected programme/domain/area context and
  learner-selected optional edges relevant to that route. Role-owned
  requirements/options are added separately; opening a role must not silently
  select its tools or other learning items.
- Requirement status—not item type, `useCaseKey` presence, a stale aggregate,
  or graph visibility—determines the compulsory versus optional branch. Only
  reviewed `needed` items enter the compulsory path; `useful`/`optional` items
  remain selectable non-blocking edges.
- Each transition and item card must use professional, student-understandable
  language, with separate headings/sections for meaning, why it appears,
  programme/domain/area/role relevance, task/output, relationships, preparation,
  alternatives, limits and learning resources. Follow the typography targets
  in section 5; do not combine these details into raw metadata prose.
- Explanatory narration must be substantive enough for a learner with little
  prior knowledge. Do not rely on a one-line definition or a single sentence
  for an unfamiliar concept or relationship. Normally use a short, connected
  paragraph of at least two sentences to explain what it is, what it helps the
  learner do, and why it belongs in this route. Keep headings and chips concise,
  but never use them as substitutes for the explanation. Apply this from the
  programme overview and theme/outcome narration through domain, area and role
  overviews, individual items, relationships, prerequisites, alternatives,
  limitations and learning-resource rationale. Add context rather than padding:
  separate the explanation into labeled sections and avoid duplicate or
  developer-facing metadata. Preserve source outcome meaning and show the
  learner explanation alongside it.
- At every transition, explain the connection, not only the two endpoints:
  what programme learning is carried as prior context, what is evidenced as
  transferable, what the next layer adds, and what remains optional. At a
  relationship or comparison view, explain what the relationship means for the
  learner and whether it is a prerequisite, complement, alternative or
  advisory connection. A bare relationship label is not a complete narration.

Current local implementation evidence (2026-10-16): the programme-to-domain
handoff renders the transferable-learning explanation and available
programme themes/outcomes; the area/role sequence labels compulsory learning
separately from optional edges; optional candidate categorization uses
requirement level; and the role screen can carry forward selected route context.
TypeScript and focused component/adapter tests pass. Authenticated desktop/mobile
rendering, live seeded-payload verification, and final public promotion remain
separate acceptance gates and are not claimed complete here.

### Priority order for remaining implementation: explanation gate first

Before other UI polish or acceptance work, implement and pass the D078
route-wide explanation-depth gate in the controlling implementation plan. Audit
programme details/themes/outcomes, programme-to-domain preview and handoff,
domain overview and item cards, every canonical area and its items, every
supported role and its items, relationship/alternative views, tray, saved route,
and report/print. Fix missing, repeated, developer-facing or insufficiently
explained copy from the already approved evidence. Keep this as one focused
pass; do not restart source research or reopen approved placement decisions.

For each unfamiliar concept, test the narration with this question: could a
senior-secondary learner explain what it is, what work it helps them do, why it
appears at this route stage, how it relates to other choices, and what selecting
it changes? If not, expand the explanation with accurate context in separate
labelled sections. A two-sentence expectation guides human review; it is not a
word-count approval rule. The Casevo example in the implementation plan is the
calibration example for a novel, technical, experimental tool: define “agent”
and interaction/network in place, explain the Sociology use as a hypothetical
simulation, label it optional/experimental, distinguish simulated output from
real-world evidence, and state what it cannot replace. Do not copy the example
as a generic template where the evidence or tool differs.

The route-wide gate must produce an explicit coverage record and focused
regression tests. Automated scans may flag blank or unusually short fields but
cannot certify meaning. Do not report all D078 explanations as complete until
the flagged text has been reviewed semantically and the representative rendered
surfaces pass. Local implementation now carries programme themes and their
matched outcomes into the domain theme by theme, distinguishes themes without
an exact transfer record, and expands remaining outcomes independently. It
also removes duplicated area summary prose and the repeated domain short intro.
Focused explanation component tests pass (32 tests across seven suites), and
the guided-sequence TypeScript check passes. Authenticated live-payload and
rendered acceptance remain unverified; the route-wide explanation gate is
therefore still open, not a claim that every narration has been semantically
approved.
