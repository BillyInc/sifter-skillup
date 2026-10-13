# D078 Guided Experience: Granular UX Audit and Interaction Mockup

**Date:** 2026-10-09  
**Status:** design and audit checkpoint; not a canonical promotion or live-UI approval  
**Scope:** Sociology programme → Social Sciences & Behavioural Research → area of specialization/practice → role → focused learning plan

## Current implementation supersession — 2026-10-10

The historical audit observations below describe the starting state of this
pass. The current local implementation now includes the guided tray's explicit
granular selection, relationship/comparison surface, prerequisite guards,
multiple route stacks, route-local add/remove state, guarded reordering,
authenticated print/share actions, and My World saved-stack summary. The
backend resume snapshot preserves route-local removals and order. These changes
are verified locally but remain hidden/noncanonical until the remaining
rendered route, evidence and release gates pass; this document does not claim
student promotion or SQL deployment.

The remaining implementation gate is end-to-end rehydration and rendered
verification of the same versioned stacks through programme → domain → area →
role → My World/report, including stale-evidence and privacy-safe sharing
checks. Role-fit adjudication and the subject matcher remain outside this
implementation pass.

## Decision

This is the correct next step. The guided experience is not just four pages with
lists. It is a connected route in which every displayed item must explain its
place, its use, its relationships and its effect on the learner's focused plan.
The UI should be mapped and reviewed at this level before more learning-path
implementation is wired.

The current local D078 evidence envelope is ready for design but not for broad
student promotion: 206 in-scope item records have resolved evidence envelopes,
271 role-task references are matched, 206 learning records are present and 17
records have an exhaustive-search/no-established-Nigerian-claim disposition.
Student approval is still **0**. Review-only and no-local-claim records remain
hidden from confirmed student guidance.

The existing UI has useful pieces, but they are not yet one complete organism:

- `ContextualItemList` already provides an expandable “How it fits” card for
  approved skills, methods, competencies, knowledge and certifications.
- `ToolGroupsBlock` gives each named tool its own card, groups tools by use
  case, and now provides an individual “How this tool fits” expansion. The
  expansion is still subject to the same approved, source-backed item gate;
  it does not make an unapproved tool visible.
- `FoundationSkillsBlock` shows staged rows and now labels the item meaning,
  contextual use and expected output directly. Its staged list remains a
  separate expansion; the full shared item contract is still being aligned
  with the generic contextual card.
- `CertPlacementList` now labels what a credential is and how it is used in the
  selected route. Certification-specific issuer, eligibility, assessment
  scope, renewal and limitation details remain part of the expanded contract.
- `GuidedFieldSelectionScreen` selects programme/domain/area/role route records,
  but does not yet provide the full granular item-selection, comparison and
  stacked-plan experience.
- `GuidanceReportButton` currently toggles learning-focus entries in a loose
  path array. It does not yet provide a versioned layered plan with explicit
  inherited, added, alternative and complement placement.
- `MyWorldScreen` has saved guidance/report access, but not the dedicated
  editable learning-plan folder described below.
- Programme requirements already have a separate national and institution
  specific surface. JAMB/UTME and O'level requirements remain a later lane;
  they must not be mixed into curriculum themes or supplemental learning
  selection.

The current implementation pass has now extended the item explanation surface
to the area route: area-level tools and certifications receive the same
focused-plan target as the generic item list. This is still a client-contract
change; the versioned layered plan remains noncanonical and is not yet wired
to the API or My World.

## The connected model

The learner should always be able to see where they are:

```text
Programme curriculum (fixed starting point)
  ↓ explains the connection
Domain overview and shared foundation
  ↓ shows what is shared and what is only a useful edge
Area of specialization/practice
  ↓ adds area-specific capabilities
Role
  ↓ adds task-specific requirements
Focused learning plan / My World
  ↓ preserves route and layer context
Preview → Save → Print/Download → optional privacy-safe Share
```

An item is never just a name in a list. Its path is:

```text
item → use case/task → expected learner output
     → prerequisite/complement/alternative
     → supported domain/area/role route
     → selected-plan layer → learning destination
```

The UI must not infer a relationship from being in the same category, appearing
in the same role record, sharing a subgroup, or being technically compatible.
Only an evidence-bearing relationship may create a downstream connection.

## Granular card contract

### Compact state

Every approved student-facing item gets a distinct card or row with:

- plain student-facing name and item type;
- one-sentence meaning in the selected programme/domain/area/role context;
- the use case or task it supports;
- a short expected output, such as a cleaned dataset, interview guide,
  evidence summary, model, map, coded transcript or evaluation brief;
- layer badge: **Programme context**, **Shared domain foundation**, **Useful
  additional edge**, **Area addition**, **Role addition**, **Alternative** or
  **Complement**;
- route badge showing which selected branch it supports;
- source/learning-link state;
- actions: **Expand details**, **Compare** where meaningful, **Add to my
  learning plan** or **Remove from my learning plan**.

The compact card must not claim that selecting the item proves competence.

### Expanded state

Expanding a card reveals a stable, ordered detail panel. The order is the same
for tools, skills, methods, competencies, knowledge and certifications so the
learner does not have to relearn the interface:

1. **What this is** — a plain professional explanation.
2. **What it means here** — why it matters in this programme, domain, area or
   role, with the owning checkpoint visible.
3. **What it helps you do** — the task/use case and a realistic learner output.
4. **Where it leads** — supported areas and roles, with a route link that opens
   the relevant branch rather than a dead name.
5. **Builds on** — genuine prerequisites or earlier capabilities.
6. **Works with** — complementary items that are commonly needed together.
7. **Other valid choices** — alternatives, with trade-offs and no implication
   that all alternatives must be learned.
8. **What it does not replace** — limits, non-equivalences and warnings. For
   example, a software tool does not prove research design, statistical
   judgement, ethics or occupational competence.
9. **Context** — global practice and separately labelled Nigerian context.
10. **Learn or inspect** — one official/reference destination for what the item
    does, one suitable explanatory destination where needed, and one free,
    task-specific learning destination when available. A generic “learn Python”
    link is not sufficient for a Python-for-social-research item.
11. **Evidence** — an expandable source panel with source title, locator,
    access date, checkpoint ownership and claim scope. Student copy is concise;
    admin view gets the full passage and review state.

For certifications, replace “what it helps you do” with the capability or
eligibility route it assesses and show issuer, jurisdiction, eligibility,
assessment scope, renewal and limits. A certificate must not be shown as a
universal requirement unless the evidence supports that claim.

### Tool-specific card behavior

Tools use the same contract, with additional fields:

```text
Tool: Python
Use-case group: Analyse evidence / compute and automate
In this route: used for the selected data workflow
Example output: reproducible table, chart or text-analysis result
Prerequisite: the relevant research question, data handling and method
Complements: pandas / Jupyter / a justified analysis method
Alternatives: R, SPSS or Stata where the same task and scope are supported
Limit: the tool does not replace study design, interpretation or ethics
Learning: task-specific verified destination
```

The actual card remains collapsed until opened, but the card header makes the
use-case and route obvious. “Open Python” must not be the only explanation.
The learner can expand the tool, compare it with alternatives, then deliberately
add one option to the plan. Choosing Python must not silently add every Python
library; each library needs its own task, evidence, relationship and learning
destination.

## How cards connect

Connections should be visible in three complementary ways rather than as a
raw graph that overwhelms the learner.

### 1. Inline relationship chips

The expanded card shows short chips such as:

```text
Builds on: research question design
Works with: data management
Alternative to: R statistical computing
Supports: Social Research and Evaluation
Useful for: survey analysis
```

Each chip is a button. Tapping it opens the target card or a small relationship
sheet. The sheet states **why the relationship exists**, what is shared, what is
different, and whether the target is required, optional, conditional or an
alternative. A chip must not silently add the target.

### 2. Route preview

After a learner selects an item, a preview updates immediately:

```text
Your selected route
Programme: Sociology
Domain: Social Sciences & Behavioural Research
Area: Social Research and Evaluation
Role: Evaluation Researcher

This choice adds
  ✓ One area task supported
  → Two role outputs supported
  ↔ One alternative remains available
  ! A prerequisite is recommended before this item
```

The preview is an explanation, not a score or employment promise. It must show
the exact relationship-backed route effects and keep unsupported or review-only
targets out of the confirmed result.

### 3. Layered plan stack

The tray/folder displays the route as connected layers:

```text
1. Programme starting point       fixed curriculum themes
2. Shared domain foundation       inherited by the selected route
3. Useful additional edge         selected optional cross-route support
4. Area additions                 only after an area is chosen
5. Role additions                 only for the selected role branch
6. Alternatives and complements   visible, deliberate choices
```

An inherited item appears once, with a “used again here” provenance note rather
than a duplicate card. A more specific area or role explanation can replace the
display wording while preserving the parent evidence. Removing an item means
“remove it from my current focus”; it does not delete a canonical requirement.

### 4. Multiple route stacks

The learner may deliberately build more than one route in the same report:

- more than one programme route;
- more than one domain connected to a programme;
- more than one area of specialization/practice within a domain; or
- more than one role branch within an area.

These are separate stacks, not one blended checklist. Each stack keeps its own
programme context, inherited domain foundation, area additions, role additions,
alternatives and complements. The tray and final report must show a route
header before each stack, for example “Sociology → Social Sciences & Behavioural
Research → Social Research and Evaluation”, and must show whether an item is
shared, inherited, or selected only for that route.

When a second route is added, show a clear warning before confirmation:
“You are adding another route. Its learning items will be kept separately so
your report does not treat different routes as one requirement.” The warning
must identify the relevant multiplicity—multiple programmes, domains, areas or
roles—and remain visible in the tray/report. Removing one route removes only
that route's personal selections; it does not change canonical data or another
stack.

## Screen-by-screen mockup

### Programme overview

```text
Sociology
What this programme studies: [short narrative]

What your programme teaches
[Theme card] Communities and social change       [Open theme]
[Theme card] Research and evidence                [Open theme]
[Theme card] Institutions and public life         [Open theme]

What these themes can connect to
[Domain connection card: Social Sciences & Behavioural Research]
  Close curriculum connection · Why this appears · Open domain

Admission requirements
[National JAMB/UTME and O'level] [Institution-specific requirements]
  Separate admission information; not part of learning-plan selection.

[Explore related domains]
```

Themes are derived from the full curriculum and can grow beyond four. Course
codes stay in the evidence drawer, not in the student heading. Fixed programme
content has no “Add to learning plan” control; it is the starting context.

### Programme-to-domain connection sheet

Open from a domain card or the programme page. It explains the close/useful/
related connection in ordinary language, shows course/outcome evidence, states
what transfers and what does not, and offers **Back to programme**, **Compare
connection** and **Open domain**. The connection sheet does not select a role.

### Domain overview

The first screen is orientation, not a raw skills dump:

```text
Social Sciences & Behavioural Research
What this field is about · questions it asks · what practitioners produce
Who they work with · where the work happens
Global practice | Nigeria context
What your programme connection gives you | what it does not establish

[Continue to shared foundation] [Compare routes]
```

The foundation then has two visibly different bands:

- **Most versatile foundation:** genuinely shared entry preparation;
- **Useful additional edge:** valuable only for named routes or conditions.

Each item is a card governed by the granular contract above. Domain items do not
pretend to make a learner employable in every role.

### Area of specialization/practice

The area page begins with its boundary and sibling comparison, then shows an
inheritance banner:

```text
You are carrying 4 approved foundation items from the domain.
This area adds 3 items because its work includes [specific tasks].
[Show inherited foundation] [Show area additions]
```

The area additions are expanded cards. **Compare areas** presents the same
question/task/output/boundary structure side by side. **View supported roles**
continues only after the area explanation has been read or explicitly skipped.

### Role page

The role page repeats the route breadcrumb and explains the work before the
items:

```text
Programme → Domain → Area → Role
What this role does · typical outputs · collaborators
What comes from the domain · what this area adds · what this role adds

[Role-specific item cards]
[Compare route] [Add role focus] [Open evidence]
```

If a role has two supported areas or domains, show separate route branches.
Never merge their requirements into one universal checklist.

### Compare sheet

Compare only meaningful alternatives or routes. On desktop it is a modal; on
small screens it is a full-screen sheet. It has **Close**, platform back and
explicit actions:

```text
Compare: SPSS | R | Python
Best suited task · expected output · prerequisites
Works with · trade-offs · limits · cost/access
Nigeria/global context · evidence · learning links
[Select this option] [Keep comparing] [Close]
```

Opening comparison never changes selection. **Select this option** changes the
working plan and closes or returns to the unchanged route according to the
screen context.

### Learning-plan tray and My World

The tray is always reachable without losing the current page. It has:

- count of selected items and active route;
- expandable layer groups;
- why each item is present and what it supports;
- warnings for unmet prerequisites or selected alternatives;
- **Add**, **Remove from focus**, **Compare**, **Reorder**, **Save to My
  World**, **Print/Download** and **Share**.

My World stores immutable versioned snapshots. The learner can reopen, duplicate,
edit the copy, or delete the personal snapshot. Reopening checks the data and
evidence version and warns if a link or display decision changed. It does not
rewrite canonical curriculum or mappings.

## State and transition matrix

| Event | Working route | Working plan | Canonical data |
|---|---|---|---|
| Open programme | programme | unchanged | unchanged |
| Open domain | programme → domain preview | unchanged | unchanged |
| Choose domain | domain selected | domain context added | unchanged |
| Add foundation item | domain selected | item in shared-foundation layer | unchanged |
| Choose area | domain → area | relevant foundation inherited; area layer opened | unchanged |
| Add useful edge | area/role preview | optional item added with condition | unchanged |
| Choose role | area → role | relevant role layer opened | unchanged |
| Compare | same route | unchanged | unchanged |
| Select comparison option | same route | alternative branch replaces prior option explicitly | unchanged |
| Remove item | same route | item marked removed from current focus | unchanged |
| Reorder item | same route | order changes only within allowed sequence | unchanged |
| Save to My World | saved snapshot | immutable snapshot created | unchanged |
| Print/download | report preview | snapshot frozen for output | unchanged |
| Share | shared snapshot | privacy-filtered summary only | unchanged |
| Back/close | previous route | draft preserved | unchanged |

## Proposed data contract for the interactions

The current loose `learningFocus` array is insufficient for the complete design.
The eventual route payload needs these independently testable records:

```text
route: programme/domain/area/role IDs and route status
item: stable ID, type, label, meaning, use case, output
placement: inherited | domain | edge | area | role | alternative | complement
relationship: from, type, to, explanation, evidence, status
evidence: source, locator, scope, access date, review state
learning: official/reference URL, explanatory URL, task-specific free URL,
          verification date and access terms
selection: selected, removed_from_focus, included_in_report, timestamp
snapshot: route version, data version, item order, alternatives and share state
```

The client may derive the display stack from these records, but it must not
invent relationships or promote an item because it was selected. The API must
return inherited and added items separately and fail closed for unapproved
claim, checkpoint, relationship or learning-link states.

## Deterministic stacking and guardrails

The local pure model is now implemented in
`src/lib/guidedLearningPlan.ts` and tested in
`src/lib/guidedLearningPlan.test.ts`. It is deliberately not connected to the
API or canonical seed yet. Its computation is:

1. Combine programme, domain, area and role candidates.
2. Deduplicate by stable item ID, retaining the most specific explanation
   (role over area over domain over programme) while preserving the route layer.
3. Keep fixed programme themes as context; they are never added as supplemental
   selections.
4. Filter supplemental candidates through all gates: selectable visibility,
   approved claim, linked verified HTTPS destination, correct guidance owner and
   selected-route scope.
5. Resolve selected prerequisites recursively. A missing, out-of-route,
   circular or unselected prerequisite blocks the dependent item and records a
   user-readable guard issue.
6. Treat an alternative group as a choice. Selecting two members does not
   create a combined checklist; both are blocked until the learner explicitly
   replaces one choice with the other.
7. Classify confirmed selections into shared foundation, useful edge/conditional,
   area additions, role additions and complements. Alternatives remain visible
   as an explicit comparison group.
8. Preserve selected order separately from canonical display order and prevent a
   dependent item from being reordered before its prerequisite.
9. Mark removed items as personal `removedIds`; removal never deletes or edits
   canonical evidence.
10. Create a private, versioned snapshot containing route, selected IDs, order,
    removed IDs, data version and share state.
11. Build multiple route stacks independently and emit explicit warnings when
     the report contains multiple routes, programmes, domains, areas or roles.
     Never merge route-scoped candidates merely because their names match.
12. Save route-keyed selections and ordering so the report can reopen, edit,
     print or share each stack without losing its route boundary.

The model exposes guard issues instead of silently dropping a learner's choice.
The UI should use those issues to say, for example, “Choose Research design
before Modelling” or “Choose one option in this comparison.” It must never turn
an invalid selection into a false route or hide the reason from the learner.
The pure model now includes the multi-route stack set, route multiplicity
warnings and a private multi-stack report snapshot. It still needs client
wiring, API snapshot persistence and an integrated D078 fixture; those are
subsequent implementation steps.

## Relationship reveal interaction

Relationships should surface progressively, not as a permanent wall of text and
not as unexplained animation:

1. The collapsed card shows a small summary such as **Builds on 1 item · Works
   with 2 items · Supports 3 routes**.
2. **How this fits** expands the card with a short, animated height/opacity
   transition. The animation is only a cue that more information opened; the
   labels and content remain understandable with motion disabled.
3. Each relationship is a readable chip or row: **Builds on**, **Works with**,
   **Choose one**, **Supports** or **Limit**. The learner can tap the row.
4. Tapping a relationship opens a small inline explanation on desktop or a
   bottom sheet on mobile. It shows the target item/route, why the relationship
   exists, what is shared, what is different, and the evidence-backed status.
5. A prerequisite row offers **Open prerequisite** and, where approved,
   **Add prerequisite first**. It never silently adds the prerequisite.
6. An alternative row offers **Compare options**. Comparison does not alter the
   plan; **Select this option** is the explicit replacement action.
7. A complement row offers **Add as a related option**, not automatic inclusion.
8. A supported-route row offers **Preview this route**, which updates a preview
   branch without changing the active selection until the learner confirms.

This gives the learner a gentle visual transition from item → relationship →
route while preserving a clear mental model. Use `accessibilityState.expanded`,
platform Back and an explicit **Close** action. Respect reduced-motion settings,
keep focus inside the sheet while it is open, and never make motion the only
way to discover a relationship or guard reason.

## Net-new or substantially extended UI surfaces

This is the practical count after reusing existing cards and design primitives:

| Surface | Current support | Required change |
|---|---|---|
| Programme overview | Present | theme-level narrative/resource/evidence review and explicit later admission lane |
| Domain connection card/sheet | Partial | add transfer/limit explanation and compare action |
| Domain orientation | Partial | complete orientation narrative and global/Nigeria panels |
| Reusable item detail card | Partial | standardize expanded contract across item types |
| Expandable tool card | Card exists, no per-tool expand | add tool-specific details, relations and learning actions |
| Relationship target sheet | Inline text only | clickable evidence-backed relationship explanation |
| Route preview | Partial | live downstream effects and inherited/added distinction |
| Granular selection tray | Loose learning-focus toggle | layered temporary plan with add/remove/reorder/alternative handling |
| Compare modal/sheet | University comparison exists | add item and route comparison without changing selection |
| My learning plan folder | My World/report exists | versioned editable snapshots and duplicate/reopen behavior |
| Report preview | Report print/share exists | preserve route layers, relationships, limits and alternatives |
| Privacy-safe share | Generic share exists | revocable snapshot summary excluding private/hidden data |
| Admin provenance view | Partial source links | mirror the exact student card/relationship/visibility state with evidence |

Thus the minimum coherent product increment is approximately **six shared
interaction components** (item detail, tool detail, relationship sheet, route
preview, selection tray, comparison sheet) plus **seven existing-screen
extensions** (programme, connection, domain, area, role, My World/report and
admin provenance). This is a design estimate, not a claim that those files
already exist.

## Audit gates before implementation

1. Confirm programme themes and outcomes are fixed curriculum context, with
   source locators and theme-specific resources.
2. Confirm the pre-domain card explains why the categories exist and what the
   learner is entering.
3. Confirm D078 overview narration is source-backed and does not state that
   review-only candidates have verified destinations.
4. Keep the 17 no-local-claim records hidden; do not silently convert them into
   Nigerian requirements.
5. Confirm each item has checkpoint-specific meaning, task/output, limits,
   relationships and task-specific learning destination before approval.
6. Confirm the seven current D078 areas and psychology boundary are used as the
   area layer; do not resurrect retired legacy subgroup labels.
7. Build one populated fixture and one empty/review-only fixture before scaling.
8. Test add/remove/compare/back/close/reorder/save/reopen/print/share without
   changing canonical records.
9. Test route changes invalidate or recompute only the affected downstream
   layers and never carry an area/role item into an unrelated branch.
10. Test student and admin payloads use the same versioned evidence decision.
11. Keep admission requirements as a separate programme page lane for later
    subject-matcher/display work.

## Recommended implementation order

1. Freeze this information architecture and state contract.
2. Finish the programme, pre-domain and domain fixture audits.
3. Implement the shared item detail and relationship sheet using one approved
   D078 item plus honest empty states.
4. Implement route preview and layered tray with local state only.
5. Implement comparison, snapshot save/reopen and report rendering.
6. Run the integrated Sociology → D078 → area → role fixture.
7. Only then add approved learning items in evidence-backed batches.
8. After the learning flow is stable, handle the separate JAMB/O'level
   admission display/matcher lane.

No SQL, canonical promotion, role-fit reopening or subject-matcher change is
part of this design checkpoint.

### Tray states and the area stop point

The tray is a persistent, non-blocking folder rather than a single fixed-size
panel. It may be shown as a tiny folder icon with the selected-item count, a
small route summary, a mid-size route panel, or a full panel with every stack,
layer relationship choice and save/print/share action.

When a learner adds an item while the tray is collapsed, a short “drop into
your plan” motion moves the item label into the tray and briefly pulses the
count. The text confirmation remains available to assistive technology, and
reduced motion removes the transform while retaining the confirmation.

Alternatives and complements stay inside the layer where they were selected:
programme, domain foundation, area of specialization/practice or role. An
alternative remains a choose-one comparison; a complement is an additional
item. Neither is silently added by opening a card.

The learner may save at any stop point. A programme/domain save imports the
programme context and approved domain foundation only. It does not import
area-specific learning details or role details. Before an area is chosen, the
tray may show the available area names as an advisory layer with: “Choose an
area to add its learning items.” Those names are route options, not selected
requirements. Once an area is chosen, its additions and relationships may
enter the stack; role details enter only after a role is explicitly chosen.
This makes the area route the durable learning focus while treating roles as
optional, changeable downstream examples.
