# D078 method-aware learning path — Codex implementation handoff

**Date:** 2026-10-19  
**Audience:** Codex, implementing the Sociology → Social Sciences → D078 student journey.  
**Status:** Local UI specification. The route graph remains `student_visible: false`. Building this UI does not promote the experience, apply SQL, or approve the area task set.  
**Graph:** `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`  
**Human summary of that graph:** `docs/manual-review/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.md`

Do not edit the graph JSON. Do not apply Supabase SQL. Do not invent universities, programmes, themes, methods, areas, roles, tools, resources, or match scores. Read labels from the graph nodes. Where this document and an older UI note disagree, this document wins for display behaviour.

Section 14 is the student-facing copy. Use those words on screen. Do not rewrite an explanation that section 14 quotes from the graph.

---

## 0. The rule Codex must implement

The journey is method-aware.

Content **above** the method choice is always available: the Sociology curriculum, the field orientation, the programme-to-field handoff, and the three compulsory foundations.

Content **after** the method choice renders only for the methods and combination designs the learner has selected. Everything else is hidden. Hidden means not mounted. Do not grey it out, collapse it into “other areas”, or leave an empty card in its place.

The learner can select and deselect methods, combination designs, and the optional methods inside the participatory design. Each change recomputes the visible set. Areas, roles, task families, area items, role items, and method-linked tools that lose their last supporting selection leave the screen.

Areas and roles do not have an independent catalogue on this journey. They appear only because a current selection has a reviewed route to them.

This display rule is an explicit product decision. It overrides two sentences in the graph:

- `routing_policy.area_selection`: “do not hide non-top-ranked areas”.
- `method_area_routes[].ranking_rule`: “then show all seven”.

Keep using the graph to decide **which** area, role, and item a method supports. Stop using it to keep unsupported areas on screen. Rank is irrelevant once unsupported rows are hidden. Order the visible areas by how many selected routes point at them, then by area label.

A selected method does not make that method a requirement of a role. Every `method_area_role_routes[].method_to_role_fit_claim` in this graph is `not_inferred_from_area_membership`. Show the role when the route exists. Say that the method made the role visible, and that the method is not a job requirement.

Multiple individually selected methods show the **union of each method’s own route rows**. That union is not a new combination design and is not a Cartesian product. Do not attach method A’s items to an area that only method B supports.

A named combination uses that combination’s own `area_routes` when that array is non-empty. Do not rebuild it by crossing the member methods. `combo:participatory-method-choice` has `area_routes: []`. Its visible routes are the routes of its required method plus the optional methods the learner ticks inside that design.

---

## 1. Do not build

- A second Sociology screen tree, a prototype route, or a parallel tray.
- A student-facing list of the seven areas before a method or combination is selected.
- A student-facing list of roles before the area that contains them is visible.
- Role learning items on the area page. They appear after the learner opens that role.
- A studied combination just because two method toggles are on. The nine designs are the only combinations.
- Aggregate counts 19 or 46. The graph’s `aggregate_count_audit.learner_display_policy` forbids them. Use the 12 resolved course anchors and 12 resolved transferable outcomes.
- `not_established` relationship rows.
- Direct Entry.
- Any change to matcher, seed, or migration files.
- Uppercase section eyebrows on this journey.
- Text-only controls for Select, Deselect, Open, Continue, Save, or resource Open. Those are buttons.

---

## 2. Identity join

Route rows and area nodes do not share the same `id` string.

| Used on | Field | Example |
|---|---|---|
| Area node `id` | `area:d078-computational-digital-social-science` | Screen routes may already use this |
| Area node `area_id`, and `method_area_routes[].area_id` | `D078:computational-digital-social-science` | Join key |
| Role node `id`, and `method_area_role_routes[].role_id` | `role:D078:18:statistician` | Exact match |
| Method id | `domain-item:…` or `domain-method:…` | Exact match against `method_node_ids` |

Build one lookup, `areaByRouteId`, from area nodes: `node.area_id → node`. Accept either id form at the UI boundary and normalise to `node.area_id` before filtering. A failed join hides that row and logs a development warning. It never shows the row under a guessed name.

There are 7 area nodes, 22 method ids, 116 `method_area_routes`, 421 `method_area_role_routes`, and 9 `combination_designs`.

### Canonical labels already on the nodes

Use these strings. Do not replace them with older nicknames.

**Foundations, in this order**

| Id | Label |
|---|---|
| `domain-item:d078-research-question-design` | Frame a researchable social question and choose a fitting design |
| `domain-item:d078-evaluate-evidence-and-limits` | Evaluate evidence and explain what it can and cannot show |
| `domain-item:d078-communicate-evidence` | Communicate findings for the intended audience |

**Areas**

| `area_id` | Label |
|---|---|
| `D078:computational-digital-social-science` | Computational and Digital Social Science |
| `D078:economics-applied-analysis` | Economics and Applied Economic Analysis |
| `D078:human-geography-population` | Human Geography and Population Studies |
| `D078:politics-governance-public-policy` | Politics, Governance and Public Policy |
| `D078:psychology-social-behaviour` | Social Behaviour and Interaction |
| `D078:social-research-evaluation` | Social Research and Evaluation |
| `D078:sociology-social-anthropology` | Sociology and Social Anthropology |

**Themes:** 14 themes, 236 outcomes. The technology theme label is `Technology and information` (`programme-theme:sociology:technology`, 4 outcomes). The full theme table is in Appendix A.

Role `label` values are stored in lowercase (“statistician”, “economic adviser”, “behavioural scientist”). Display them in title case through the existing career-label formatter. Do not rename `behavioural scientist` to “social psychologist”, `political scientist` to “policy analyst”, or `social work researcher` to “social science researcher”.

---

## 3. New module

Create `src/lib/d078RouteProjection.ts` with tests in `src/lib/d078RouteProjection.test.ts`.

The module is pure. It loads the checked-in graph JSON (or a typed extract generated from it at build time) and does not fetch the network. If the JSON cannot be bundled, check in a small typed extract that preserves every method, combination, area route, and role route field used below. Do not hand-maintain a second shortened list.

```ts
type D078Selection = {
  methodIds: string[];
  combinationIds: string[];
  /** Optional methods ticked inside a design. Key is the combination id. */
  componentMethodIds: Record<string, string[]>;
  /** Normalised area_id. Absent until the learner opens a visible area. */
  areaId?: string;
  /** Role node id. Absent until the learner opens a visible role. */
  roleId?: string;
  /** Item ids the learner explicitly added. Foundations are not stored here. */
  addedItemIds: string[];
};

type VisibleArea = {
  areaId: string;
  nodeId: string;
  label: string;
  supportingMethodIds: string[];
  supportingCombinationIds: string[];
  taskFamilyIds: string[];
  routeCount: number;
};

type VisibleRole = {
  roleId: string;
  label: string;
  areaId: string;
  supportingMethodIds: string[];
  supportingCombinationIds: string[];
  fitClaim: "not_inferred_from_area_membership";
};

type D078Projection = {
  foundations: { id: string; label: string }[]; // always the three, fixed order
  methods: { id: string; label: string; selected: boolean }[]; // all 22, for the picker
  combinations: CombinationCard[]; // all 9, for the picker
  visibleAreas: VisibleArea[];
  visibleRoles: VisibleRole[]; // only roles whose area is visible
  domainItemIds: string[];
  toolIds: string[];
  areaItemIdsByArea: Record<string, string[]>;
  /** Present only when selection.roleId is set and that role is visible. */
  roleItemIds: string[];
  methodSpecificRoleItemIds: string[];
  hiddenBecause: "no_method_selected" | null;
};
```

### `project(selection)`

1. Start with empty visible areas, roles, domain items, tools, and area items.
2. For each id in `selection.methodIds` that exists in `method_node_ids`:
   - Take every `method_area_routes` row with that `method_id`.
   - Add its `area_id`, `task_family_ids`, `area_item_ids`, `task_linked_domain_item_ids`, `available_item_ids`, `domain_downstream_item_ids`, `tool_ids`, and `domain_tool_ids`.
   - Take every `method_area_role_routes` row with that `method_id` and add the role under that `area_id`.
3. For each id in `selection.combinationIds`:
   - If `area_routes.length > 0`, add those rows only. Read `area_id`, `task_family_ids`, `role_ids`. Do not also add the member methods’ routes unless those method ids are independently present in `selection.methodIds`.
   - If `area_routes` is empty, expand `required_method_ids` plus `selection.componentMethodIds[comboId]`, and run step 2 for those method ids. Ignore component ids that are not in that combination’s `selectable_component_method_ids`.
4. Dedupe ids. An area supported by two selections appears once. `supportingMethodIds` lists every current reason.
5. Drop a role whose `area_id` is not in the visible area set.
6. If `selection.areaId` is set and that area is not visible, the projection reports `requestedAreaHidden: true`. The screen must clear it.
7. If `selection.roleId` is set and that role is not visible in the requested area, report `requestedRoleHidden: true`.
8. `roleItemIds` is empty unless `selection.roleId` is visible. Then fill it from the matching role-route rows’ `role_item_ids`. Fill `methodSpecificRoleItemIds` from `method_specific_role_item_ids`. Role items stay off the area page.
9. `addedItemIds` that are no longer in `domainItemIds`, `toolIds`, `areaItemIdsByArea[areaId]`, `roleItemIds`, or `methodSpecificRoleItemIds` are `orphanedItemIds`. The screen removes them from the route after the undo window.
10. Sort visible areas by `routeCount` descending, then label ascending. Sort roles by label ascending.
11. If `methodIds` and `combinationIds` are both empty, return the picker catalogues, the three foundations, and empty downstream arrays. Set `hiddenBecause` to `no_method_selected`.

### Combination card fields

Read these from each `combination_designs` record and from the matching `method_combination_design` node (`why_combine`, `how_used`, `condition`, `limits`, `selection_rule`):

| Id | Mode | What selecting it means |
|---|---|---|
| `combo:exploratory-sequential` | `fixed_evidence_combination` | Use its 7 `area_routes` |
| `combo:explanatory-sequential` | `fixed_evidence_combination` | Use its 7 `area_routes` |
| `combo:convergent-survey-interview` | `fixed_evidence_combination` | Use its 7 `area_routes` |
| `combo:focus-group-to-survey` | `fixed_evidence_combination` | Use its 7 `area_routes` |
| `combo:survey-followup-focus-group` | `fixed_evidence_combination` | Use its 7 `area_routes` |
| `combo:case-study-multiple-sources` | `fixed_evidence_combination` | Use its 7 `area_routes`. Member methods are options inside the design, not extra compulsory field requirements |
| `combo:interview-and-observation` | `fixed_evidence_combination` | 5 areas. Computational and Economics are absent |
| `combo:document-and-interview-elicitation` | `fixed_evidence_combination` | 6 areas. Economics is absent. Show the node’s condition |
| `combo:participatory-method-choice` | `design_frame_with_selectable_methods` | `area_routes` is empty. Required id: `domain-item:participatory-and-action-research`. Selectable: interviews, focus groups, surveys, observation |

Copy on every combination card comes from the node: why the sources are combined, the order of work, the condition, and the limit. Do not write a new rationale.

---

## 4. Selection state

Own `D078Selection` in the guided learning-plan state for this programme and domain, not in a one-off `useState` that dies on blur. Persist it inside the existing `LearningPlanSnapshot` so reopen restores the same methods, the same area, and the same role.

Initial state:

```ts
{ methodIds: [], combinationIds: [], componentMethodIds: {}, addedItemIds: [] }
```

Foundations are always on the route. They have no remove control.

### Controls

| Control | Press when off | Press when on |
|---|---|---|
| Method button | Append `methodId` if it is one of the 22 | Remove `methodId` |
| Combination button | Append `combinationId` | Remove `combinationId` and its `componentMethodIds` entry |
| Participatory component | Append that method id under `combo:participatory-method-choice` only | Remove that component id |
| Area “Open area” | Set `areaId`. Clear `roleId` | — |
| Role “Open role” | Set `roleId` | — |
| Item “Add this” / “Added” | Append item id if the item is in the current projection | Remove item id |
| “Clear selected methods” | — | Empty `methodIds`, `combinationIds`, and `componentMethodIds`. Then run the hide transition |

Ignore a second press while the first state update has not committed. One id is added or removed once.

Selecting a combination does not auto-select its member methods as independent method toggles. The design is one object. The learner may also toggle a member method on its own; that independent toggle is a separate `methodIds` entry and unions with the design.

The participatory required method is not a removable chip while the design is selected. The four selectable methods are removable.

Search filters the **picker list only**. It does not change `D078Selection` and does not change which areas are visible.

### Cascade when a selection disappears

After every toggle, run `project`.

1. If the open `areaId` is hidden, clear `areaId` and `roleId`.
2. If the open `roleId` is hidden, clear `roleId`. Leave `areaId` if that area is still visible.
3. Compute `orphanedItemIds`. Do not delete them in the same frame. Show the undo notice for 6 seconds. Undo restores the previous selection, not a partial item list. When the timer ends without undo, drop the orphaned ids.
4. If step 1 or 2 cleared the page the learner is standing on, run the return transition in section 8.

Closing an area returns to the field and clears `roleId`. The method selection stays. Closing a role returns to the area. The method selection stays.

---

## 5. What is on screen in each state

### State A — no method and no combination

Visible:

- Spine, with “How you investigate” current once the learner has reached the field.
- Field orientation paragraph from `programme_transition.domain_overview`.
- Handoff, using `transfer_summary` plus the individually resolved themes and outcomes only.
- Three foundation cards, already on the route.
- The method picker: all 22 methods.
- The combination picker: all 9 designs.

Hidden, with no placeholder cards:

- Areas.
- Roles.
- Method-linked domain items and tools.
- Area items.
- Role items.
- Area-specific task families.

Empty copy, in the region where areas will appear:

> Choose one or more ways to investigate. Areas and roles appear only for the methods you select.

### State B — one or more methods and/or combinations

Visible, in this order:

1. The same orientation, handoff, and foundations.
2. The picker, with selected buttons in the selected style.
3. “For the methods you selected” — the deduped domain items and tools from the projection. Split this list only by requirement lane (`needed` versus skippable). Mix skills, knowledge, tools, and methods inside a lane. Do not add a second tool catalogue.
4. “Areas for this choice” — `visibleAreas` only.
5. Inside an opened area: area items from `areaItemIdsByArea[areaId]` only, again split by requirement lane, mixed types.
6. Inside that area: `visibleRoles` whose `areaId` matches, and no others.
7. Inside an opened role: `roleItemIds` and `methodSpecificRoleItemIds`.

A lane with zero visible items is omitted, not rendered as an empty header.

### State C — area open

The area screen refuses to render when `requestedAreaHidden` is true. The learner is returned to the field.

Show a one-line reason built from labels, not ids:

> Shown because you selected Interviews.

When several supports exist:

> Shown because you selected Interviews and Observation and ethnographic approaches.

Carry the three foundations and the selected method labels in one collapsed block, “From your route”. Do not repeat the full method catalogue here.

### State D — role open

The role screen refuses to render when the role is hidden.

Under the title:

> Available with the method you selected. This does not make the method a requirement of the role.

If the same role id is visible in another currently visible area, show “Also in {Area label}” as a button. Pressing it sets `areaId` to that other area and keeps `roleId`. That is a move inside the current selection, not a second route.

A second route is created only when the learner uses “Build a separate route”, which copies the current selection into a new `LearningPlanStack` and then lets them change methods there. Stacks stay independent. The tray already warns when more than one stack exists. Keep that warning.

---

## 6. Worked examples

These are acceptance oracles. Area ids are the route `area_id`.

**No selection.** `visibleAreas.length === 0`. `visibleRoles.length === 0`.

**Select `domain-item:d078-interviews` only.** Visible areas:

- `D078:politics-governance-public-policy`
- `D078:psychology-social-behaviour`
- `D078:social-research-evaluation`
- `D078:sociology-social-anthropology`

Hidden: Computational and Digital Social Science, Economics and Applied Economic Analysis, Human Geography and Population Studies.

Roles on Politics include political scientist, economic development coordinator, tax policy analyst, economic policy officer. Statistician is visible under Social Research and Evaluation, not under Computational, because Interviews has no computational route.

**Deselect Interviews.** Return to State A. Those four areas unmount.

**Select `domain-item:d078-spatial-social-analysis` only.** Visible areas: Computational and Digital Social Science, Human Geography and Population Studies. The other five stay unmounted.

**Select Interviews and Spatial together.** Union. Economics stays hidden. Computational and Human Geography appear because of Spatial. The four Interviews areas appear because of Interviews. Do not invent an “Interviews + Spatial” combination card.

**Select `combo:interview-and-observation` only.** Use that record’s `area_routes` (5 areas). Computational and Economics stay hidden even if a member method, considered alone, would differ. Do not also light the member method toggles.

**Select the participatory design and tick nothing else.** Visible set equals the routes of `domain-item:participatory-and-action-research` only.

**Then tick Surveys inside the design.** Add the survey method’s routes. Areas that only the survey supports appear.

**Untick Surveys.** Those areas hide unless the participatory method route also contains them.

**Open a role, then deselect the only method that revealed it.** Leave the role screen. Land on the field, focus the method picker, and announce the update.

Appendix A is the full method → area → role oracle. Tests for the remaining 20 methods must assert against the JSON, not against a copied subset in the test file. The Interviews and Spatial cases above are pinned in the test file as readable regressions.

---

## 7. Screen specification

Extend the existing screens. Do not add routes.

| Screen | File | Change |
|---|---|---|
| Programme | `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx` and `DegreeSkills.tsx` | Curriculum reading. Admission stays on its own lane |
| Field | `src/screens/careerIntelligence/DomainDetailScreen.tsx` | Mount the picker and the filtered area list. Remove the unfiltered area grid on the D078 guided path |
| Area | `src/screens/careerIntelligence/SubgroupDetailScreen.tsx` | Render only when the projection says this area is visible. Stop passing every area item through `itemScope="learning-options"` |
| Role | `src/screens/careerIntelligence/RoleDetailScreen.tsx` | Render only when the projection says this role is visible in this area |
| Items | `src/components/careerIntelligence/ContextualItemList.tsx` | Compact card. Receive an already filtered item list |
| Resources | new `CompactResourceRow.tsx` | Small row with the type beside the title. Use it on this journey |
| Picker | new `MethodChoicePanel.tsx` | The 22 + 9 selectors |
| Tray | `GuidedLearningTray.tsx`, `src/lib/guidedLearningPlan.ts` | Persist `D078Selection`. Show only items still in the projection |
| Handoff | `ProgrammeCurriculumCarryForward.tsx` | Resolved rows only |

`ProgrammeOverviewScreen.tsx` stays a re-export.

On the D078 guided path, stop rendering these as peer sections: sequence-band method lists, specialist lists, a second tool list, `ToolGroupsBlock`, and `CertPlacementList`. Their records appear only when their ids are in the projection, inside the one lane list. Other domains may keep the existing sections.

### Programme

Purpose: read the degree, then continue into the field.

- Show every theme that has courses. The graph has 14, including Technology and information.
- First paint may show five theme cards, with a button “See all 14 learning areas” that exposes the rest. The button states the count. Do not stop at five.
- Inside a theme, group outcomes under the course that owns them. One outcome record renders once under its own course. Do not flatten by `studentText`.
- A theme resource renders only when `resourcesForTheme` returns a row. No empty resource button.
- Admission copy stays in the admission lane. It does not sit inside a theme card.
- Primary button: “Continue into Social Sciences”.

### Field, top to bottom

1. Title: Social Sciences & Behavioural Research. Size 26.
2. Orientation paragraph from the graph.
3. Handoff block:
   - “What your programme covers” — 14 themes, collapsed.
   - “What carries into this field” — only matched outcomes, each with its course title. The matched themes are Ideas and foundations, and People, groups and society.
   - “What this field adds” — the three foundations, then whatever the current method selection reveals.
   - “What this path does not establish” — the degree has not already taught the later additions, and the path does not say every employer requires every item.
   - Use `transfer_summary` as the narrative. Do not print `reported_course_anchor_count` or `reported_transferable_evidence_count`.
4. Section “Already on your route” — the three foundations, numbered 1–3. Copy under the list: “Recommended teaching order. You can open them in any order.”
5. `MethodChoicePanel`.
6. Filtered results, or the State A empty copy.

### MethodChoicePanel

Two groups inside one panel.

**One approach.** Search field, then 22 compact method cards. Each card:

- Title: the method node `label`.
- One line: the sentence in section 14 for that method. These nodes do not have `what_it_is`.
- Button “Select” or “Selected”.

**A studied combination.** Nine compact cards. Selecting one expands it in place and shows why, order, condition, and limit. The participatory card also shows the four component buttons. The other eight do not show a second set of method toggles.

“Clear selected methods” is a secondary button, enabled when the selection is non-empty. The label is specified in section 14.

### Area screen

- Back button: “Back to methods”. Clears `areaId` and `roleId` after the transition.
- Title is the area label, size 26.
- Reason line from `supportingMethodIds` / `supportingCombinationIds`, using section 14.
- Under that, the task-family `label` strings for the task families on the visible routes. Area nodes have no description. Do not write one.
- “From your route”, collapsed.
- “Needed for what you selected” and “Useful. You can skip it”, only for this area’s projected items. Wording is in section 14.
- Role cards for projected roles only. Each has an “Open role” button.
- If the area is visible and the role list is empty: “No reviewed role is linked to the methods you selected.” Do not fill the gap from `area_contains_supported_role` alone.

### Role screen

- Back button: “Back to {area label}”. Clears `roleId` only.
- Title in title case, size 26. Role nodes store only `label`. Do not add a paragraph about what the job does, who they work with, or what they produce.
- The fit sentence from section 14.
- “From your route”, collapsed, including the area label.
- “How your learning may apply in this role”, from `roleItemIds`, split by requirement lane, with the role-task context disclaimer in section 14.8.
- Method-specific role items, when the array is non-empty, under “Specific to the method you selected”.
- “Also in {area}” only for areas in `visibleAreas`.

### Item card

Collapsed height should sit around 96–120px, not a full essay.

- Title, 16px, maximum two lines.
- Lane chip: “On your route” for the three foundations; “Needed for what you selected” for a needed item; “Useful. You can skip it” or “Optional. Open it if this question fits” from section 14.6.
- One-line summary, 14px, maximum two lines.
- Buttons: “See more” / “Hide”, and “Add this” / “Added”. Foundations omit both. Exact labels and accessible names are in section 14.2.

Expanded, inside the same card, only sections that have text:

1. What it is
2. How it connects to your programme — only for an evidenced programme link
3. Why it matters in this field
4. How it connects to this area — area and role screens only
5. How it connects to this role — role screen only, and only when the sentence differs from the area sentence
6. How you might use it
7. What to keep in mind
8. Learn this first — only for a `prerequisite_for` edge whose blocking policy applies
9. Useful alongside — `works_with`
10. Another way — alternatives, opening the comparison sheet
11. Evidence context — the stored geographic scope
12. Resources — `CompactResourceRow` only

Missing explanation, when a required section is blank:

> A plain-language explanation has not been provided for this item yet.

Missing verified URL:

> A learning link has not been verified yet.

No button in that case.

### Comparison sheet

Opens over the current screen. It does not navigate to the tray. “Use this” switches the selected method or tool inside the current selection and closes the sheet. “Close” returns focus to the button that opened it.

### Tray

The tray shows the current stacks after the projection filter.

- Icon: a 44×44 button with the count of selected methods plus added items.
- Small: programme name, “3 foundations”, and the selected method labels, one line each.
- Mid: layer names and selected titles.
- Full: the same item sections as the card.

Stop points that can be saved:

- Field, with methods selected and no area.
- Field + area.
- Field + area + role.

Saving with zero methods is allowed and stores foundations plus programme context only. Reopening that snapshot shows State A.

Print and share render the full tray content for each stack. A hidden area is absent from the print.

---

## 8. Behaviour and transitions

Use `useReducedMotion`. When it is true, every duration below is 0 and there is no translate. Opacity may still flip in a single frame. Focus moves still happen.

When motion is allowed:

| Event | What moves | Duration | Easing | Then |
|---|---|---|---|---|
| Enter the field from the programme | Reading column opacity 0→1, translateY 12→0 | 240ms | ease-out | Focus the field title |
| Select a method or combination | New area cards and the “for the methods you selected” block opacity 0→1, translateY 8→0. Stagger cards by 30ms | 220ms | ease-out | Move focus to the results heading. `accessibilityLiveRegion="polite"` announces “Showing {n} areas for {labels}.” |
| Deselect, results remain | The rows that lost their last support opacity 1→0 | 160ms | ease-in | Unmount those rows. Do not leave a gap. Announce “Areas updated. Showing {n} areas.” |
| Deselect the last method | Downstream block opacity 1→0 | 160ms | ease-in | Unmount it and mount the State A empty copy |
| Clear selected methods | Same as deselect-last | 160ms | ease-in | Focus stays on “Clear selected methods”, then the empty copy |
| Open area | Area column enters, translateX 16→0, opacity 0→1 | 240ms | ease-out | Focus the area title |
| Back from a hidden area or role | Current screen opacity 1→0 | 160ms | ease-in | Replace with the field, scroll so `MethodChoicePanel` is at the top, focus the picker heading |
| Back from a visible area | Area exits translateX 0→16, opacity 1→0 | 180ms | ease-in | Field is underneath, scroll position of the field is restored |
| Open or close a card | Card content height | 200ms | ease-out | Focus stays on “See more” / “Hide” |
| Open comparison or relationship sheet | Sheet translateY from 24, opacity 0→1 | 220ms | ease-out | Focus the sheet title |
| Close sheet | Reverse | 180ms | ease-in | Focus the invoking button |
| Undo notice | Notice opacity 0→1 | 160ms | ease-out | Stays 6 seconds, then opacity 1→0 over 160ms |
| Button press | Opacity to 0.85 | 100ms | linear | Release restores opacity |
| Tray mode change | Height of the sheet | 200ms | ease-out | Focus stays on the mode button |

Scroll restoration:

- Remember the field scroll offset when opening an area.
- Remember the area scroll offset when opening a role.
- Remember the card key when opening a relationship target on the same page. After the target card expands, scroll it to 20px below the top of the scroll view and focus its title. “Back to {item}” returns the previous offset and focuses the source card.
- Do not restore a scroll offset onto a list that no longer contains that card. Use the return transition instead.

Reduced-motion users still get the live-region announcement and the focus move.

The undo notice copy:

> Removed {Area or role or item label} because you deselected {Method label}. Undo

If several rows disappear, one notice:

> Updated the route to match the methods you selected. Undo

Undo restores the whole previous `D078Selection`, including `areaId` and `roleId`.

---

## 9. Visual spec

The existing `FontSize` scale includes `sm: 11` and `xs: 9`. Do not use those for any sentence, button label, card title, or resource title on this journey. `FontSize.display` (26) is the screen title.

| Role | Size / line height | Weight | Colour token |
|---|---|---|---|
| Screen title | 26 / 32 | 700 | `colors.textRole.primary` |
| Section heading | 20 / 26 | 600 | primary |
| Card title | 16 / 22 | 600 | primary |
| Body | 16 / 24 | 400 | `colors.textRole.secondary` |
| Card summary | 14 / 20 | 400 | secondary |
| Meta and type chip | 13 / 18 and 12 / 16 | 600 for the chip, 400 for meta | muted |
| Button label | 16 / 20 | 600 | on accent, or accent for secondary |

Sentence case. No letter-spacing uppercase labels on this journey.

Layout:

- Desktop: persistent spine 240px, reading column max 720px, tray as a right rail from the mid mode up.
- Mobile: one column. Spine becomes a horizontal scroller of the five stops. Tray is a bottom sheet.
- Page padding 16 mobile, 24 desktop.
- Space between cards 8.
- Space between sections 22.

### Buttons

Create `RouteButton` in `src/components/careerIntelligence/RouteButton.tsx` and use it for every action in this spec.

| Property | Value |
|---|---|
| `minHeight` | 44 |
| `minWidth` | 44 for icon-only, otherwise hug content |
| `paddingHorizontal` | 16 |
| `paddingVertical` | 10 |
| `borderRadius` | `Radius.md` (9) |
| Label | 16 / 20, weight 600 |
| Gap between icon and label | 8 |
| Gap between buttons | 8 |
| Pressed | opacity 0.85 |
| Disabled | opacity 0.45, no press |
| Focus | 2px outline in the accent colour, offset 2 |

Variants:

| Variant | Fill | Border | Label | When |
|---|---|---|---|---|
| `primary` | `colors.accentRole.action` | none | on-accent | Continue, Open area, Open role, Save, Use this |
| `secondary` | transparent | 1px accent | accent | See more, Back, Clear selected methods, Close, Undo |
| `selected` | `colors.surface.subtle` | 2px accent | primary, text “Selected” | The toggle is on |
| `quiet` | transparent | 1px subtle border | primary | Add this, before it is added |

“Select” uses `quiet` until pressed, then the same button becomes `selected` and its label becomes “Selected”. Pressing “Selected” deselects. The accessible name includes the item: “Select Interviews”, “Deselect Interviews”.

Do not render these actions as `Text` with an `onPress`. `ExternalLinkGuard` on this journey receives the button container style below, not the current text-link style.

Mobile primary buttons stretch to the column width. Desktop primary buttons hug, with `minWidth` 160. Secondary buttons hug in both.

### Compact cards

| Property | Value |
|---|---|
| Padding | 12 |
| Gap | 6 |
| Border | 1px `colors.borderRole.subtle` |
| Radius | `Radius.md` |
| Background | `colors.surface.raised` |
| Shadow | none |
| Title lines | 2 |
| Summary lines | 2 |
| Expanded body | 16px, no line clamp |

One card, one object. Do not nest a card inside a card. The expanded sections are blocks separated by 8px, not child cards.

Area and role cards use the same shell. Their only action is one primary button, “Open area” or “Open role”.

### Learning resources

Add `CompactResourceRow`. Do not use the large `LearningResourcesBlock` row (`minHeight` 58, three-line description, uppercase group label) on this journey.

| Property | Value |
|---|---|
| Row `minHeight` | 44 |
| Padding | 8 horizontal, 6 vertical |
| Direction | row, vertically centred, gap 8 |
| Type chip | height 22, paddingHorizontal 8, radius full, font 12 / 16, weight 600 |
| Title | 14 / 18, one line, flex 1 |
| Open button | `RouteButton` `secondary`, label “Open”, `minHeight` 44 |

The type chip is the first element, immediately beside the title. Its text is `resourceKind()` from `LearningResourcesBlock.tsx`:

| `resourceType` | Chip |
|---|---|
| `programme_reading` | Programme reference |
| `domain_overview` | Field reference |
| `role_reference` | Role reference |
| `skill_learning` | Learning resource |
| `skill_reference` | Skill reference |
| `tool_learning` | Tool guide |
| `competency_reference` | Competency reference |
| `certification_exam` | Qualification information |
| `professional_body` | Professional body |
| any other | Reference |

Provider and access sit in the accessibility label, not as a second visual line: “{chip}. {title}. {provider}. {access}. Open.”

The description is not shown on the row. If a reviewer needs it, it is available after “See more” on the parent item, as one 14px line.

Render a row only when `isStudentResource` is true and `url` is present. Otherwise use the missing-link sentence and no button.

Save, when offered, is a `RouteButton` `quiet` labelled “Save”, 44px tall, on the same row when width allows and on the next row when the title would drop below 14px. Saved label: “Saved”. Failure copy stays “Could not save this resource yet. Try again.”

---

## 10. Relationship behaviour

| Edge `relationship` | Student control | Visible when |
|---|---|---|
| `prerequisite_for` | “Learn this first” | The edge is on a visible item and its blocking policy says it blocks |
| `builds_on` | Ordered above the dependent item | Both items are visible |
| `works_with` | “Useful alongside” | Both items are visible. Adding one does not add the other |
| `alternative_to`, `alternative_tool_option` | “Another way”, opens the comparison sheet | The alternative is also allowed by the current projection. A hidden alternative is not listed |
| `optional_analysis_tool`, `optional_tool_option`, visual, computational, `conditional_library` | Tool row under the selected method | The owning method is selected |
| Area and role reveal edges | Not a student relationship. They drive `project()` | Selection only |

“Open target” scrolls to the target card when that card is in the current filtered list. When the target belongs to a hidden method, do not navigate there. Copy:

> That item is hidden until you select a method that uses it.

“See {target}” follows the same rule.

---

## 11. Files

Create:

- `src/lib/d078RouteProjection.ts`
- `src/lib/d078RouteProjection.test.ts`
- `src/components/careerIntelligence/MethodChoicePanel.tsx`
- `src/components/careerIntelligence/MethodChoicePanel.test.tsx`
- `src/components/careerIntelligence/RouteButton.tsx`
- `src/components/careerIntelligence/CompactResourceRow.tsx`
- `src/components/careerIntelligence/CompactResourceRow.test.tsx`

Edit:

- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.test.ts`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.test.ts`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/screens/careerIntelligence/D078LearningPathScreenOrder.test.ts`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/ContextualItemList.test.tsx`
- `src/components/careerIntelligence/GuidedLearningTray.tsx`
- `src/components/careerIntelligence/DegreeSkills.tsx`
- `src/lib/guidedLearningPlan.ts`

Leave the graph generator and the graph JSON unchanged.

Implementation order:

1. Projection and its tests, including the Interviews, Spatial, union, interview-and-observation, and participatory cases.
2. `RouteButton` and `CompactResourceRow`.
3. `MethodChoicePanel` wired to selection state, with no areas mounted at zero selection.
4. Field screen filtered list, select, deselect, undo, and the return transition.
5. Area and role gates.
6. Compact item cards and resource rows.
7. Tray persistence and print.
8. Programme course-grouped outcomes, without reopening theme research.

---

## 12. Tests Codex must add

Projection:

- Zero selection yields zero areas and zero roles, and still yields 22 methods and 9 combinations.
- Interviews yields exactly the four area ids in section 6.
- Spatial yields exactly the two area ids in section 6.
- Interviews ∪ Spatial hides Economics.
- `combo:interview-and-observation` yields five areas and does not mark the member method ids as selected.
- Participatory with no components equals the participatory method’s routes.
- Participatory plus surveys adds survey-only areas.
- Removing surveys removes those areas again.
- A role id is absent when its area is absent.
- `roleItemIds` is empty until `roleId` is set.
- Joining `D078:computational-digital-social-science` resolves the node labelled “Computational and Digital Social Science”.
- Unknown method ids are ignored.
- The projection output contains neither `19` nor `46` as display counts.

UI:

- State A does not render area labels “Economics and Applied Economic Analysis” or any other area label.
- Selecting Interviews mounts four area cards and does not mount Economics.
- Pressing “Selected” on Interviews unmounts those cards.
- Opening a role and deselecting its last method leaves the role screen and focuses the picker.
- “Select” and “Open” nodes have accessible role `button` and a measured min height of 44.
- A resource row’s first text node is the type chip from the table in section 9, and the title has one line.
- Reduced motion runs the same state change with translate distance 0.
- Reopening a snapshot with Interviews selected shows the four areas without a new tap.

Run the projection test and the existing D078 screen-order test. A green unit run is not rendered acceptance. Say that in the implementation note.

---

## 13. Acceptance

The work is locally ready when a reviewer can do all of the following on the D078 guided path:

1. Open Sociology, see all 14 themes reachable, and continue into the field.
2. Confirm that no area card is present.
3. Select Interviews. See four areas. Confirm Economics, Computational, and Human Geography are absent.
4. Deselect Interviews. Confirm the four areas are gone.
5. Select Spatial. See two areas.
6. Add Interviews beside Spatial. See the union. Confirm Economics is still absent.
7. Clear methods. Confirm State A.
8. Select “Interview and observation”. See its five areas. Confirm the two member method toggles are still off.
9. Open a visible area, open a visible role, and confirm no role from a hidden area is listed.
10. Deselect the supporting method while the role is open. Land on the picker, with the undo notice.
11. Press Undo. Return to the same role.
12. Save, leave, and reopen. The same methods, area, and role return.
13. Confirm every Select, Open, Back, Save, and resource Open control is a 44px button.
14. Confirm each learning resource is a single compact row with the type chip beside the title.
15. Confirm the visible sentences match section 14. The screen does not show “D078”, “domain”, “route node”, “shared foundation”, or an evidence-file note.

Student-facing promotion stays closed until that rendered pass and a live payload check both succeed.

---

## 14. Student-facing words

Codex renders this section. The graph fields are the explanations. The short lines below only remove internal codes from chrome. They do not add a new claim.

### 14.1 What never appears on screen

Hide these wherever they occur in a stored string. Do not show the rest of that sentence if the sentence is only about the evidence file.

| Hide | Why it is internal |
|---|---|
| `D078`, `domain`, `domain sequence`, `route node`, `shared foundation`, `useful edges` | Staff structure words. The student sees “this field”, “Social Sciences”, and the headings in 14.2 |
| `category_rationale`, `evidence_limit`, `approval`, `student_visible` | Audit fields |
| Notes that mention a source gap, HTTP status, price, “promotion”, “reconciliation”, “local discovery inventory”, or “keep out of shared foundation” | Notes about the file, not about the method |
| Institution-as-evidence sentences such as “ESRC is UK postgraduate guidance” or “NISER is one Nigerian institution” | Source commentary. The learner-facing limit underneath it, when one exists, is listed in 14.6 |

`meaning`, `plain_language_meaning`, `meaning_in_domain`, theme `narration`, and combination `why_combine` / `how_used` / `condition` / `limits` are already written for a learner. Show them. Replace the token `D078` inside those sentences with “this field” and change nothing else in the sentence.

### 14.2 Screen words

| Place | Student sees |
|---|---|
| Screen title on the field | Social Sciences & Behavioural Research |
| Field intro, one paragraph only | The `programme_transition.domain_overview` text in 14.3. Do not also show the domain node’s second overview |
| Spine stop 1 | What you study |
| Spine stop 2 | The field |
| Spine stop 3 | How you will investigate |
| Spine stop 4 | An area |
| Spine stop 5 | A role |
| Foundations heading | Already on your route |
| Foundations note | Recommended teaching order. You can open them in any order. |
| Picker group 1 | One approach |
| Picker group 2 | A studied combination |
| Empty area region | Choose one or more ways to investigate. Areas and roles appear only for the methods you select. |
| After a selection | For the methods you selected |
| Area list heading | Areas for what you selected |
| Area reason | Shown because you selected {method or combination labels}. |
| Area with no roles | No role here is linked to the methods you selected. |
| Role fit line | Available with the method you selected. This does not make the method a requirement of the role. |
| Collapsed parent block | From your route |
| Needed lane, inside a visible method or area | Needed for what you selected |
| Skippable lane | Useful. You can skip it |
| Specialist chip, when the stored reason says “optional focus” | Optional. Open it if this question fits |
| Role additions | How your learning may apply in this role |
| Method-specific role items | Specific to the method you selected |
| Other visible area for the same role | Also in {area label} |
| Separate stack action | Build a separate route |
| Multi-stack warning, already in the tray | You are adding multiple routes. They will stay separate in your saved report. |
| Missing explanation | A plain-language explanation has not been provided for this item yet. |
| Missing link | A learning link has not been verified yet. |
| Hidden relationship target | That item is hidden until you select a method that uses it. |
| Undo, one row | Removed {label} because you deselected {method label}. Undo |
| Undo, many rows | Updated your learning to match the methods you selected. Undo |
| Live announcement | Showing {n} areas for {labels}. |

Buttons, all `RouteButton` at 44px:

| State | Label | Accessible name |
|---|---|---|
| Method off | Select | Select {label} |
| Method on | Selected | Deselect {label} |
| Card closed | See more | See more about {label} |
| Card open | Hide | Hide details for {label} |
| Item not added | Add this | Add {label} to your learning |
| Item added | Added | Remove {label} from your learning |
| Area | Open area | Open {area label} |
| Role | Open role | Open {role label} |
| Leave area | Back to methods | Back to methods |
| Leave role | Back to {area} | Back to {area label} |
| Clear | Clear selected methods | Clear selected methods |
| Resource | Open | Open {type chip}: {title} |
| Resource save | Save / Saved | Save {title} / {title} saved |
| Continue | Continue into Social Sciences | Continue into Social Sciences |

“Select” and “Selected” are the same button. Foundations do not get Add or Selected. They use the chip “On your route”.

### 14.3 Field introduction and handoff

Show this overview verbatim (expanded after the learner reported that the earlier short paragraph did not explain the field sufficiently):

> Social Sciences helps you understand how people live together, how groups and institutions shape everyday life, and how societies change. It connects questions about culture, family, work, inequality, crime, policy and community life to evidence gathered through research. The field looks at individual behaviour as well as the relationships between people, institutions, the environment and wider social systems. Different disciplines study these questions from different viewpoints: Sociology is one route into Social Sciences, not another name for the whole field. In Nigeria, the NUC places Sociology alongside programmes such as Economics, Political Science and Psychology within Social Sciences. Researchers use concepts, comparison and evidence to describe patterns, examine explanations and consider social responses; what a particular study can conclude depends on its question, evidence and method.

Handoff heading: Why your Sociology studies connect.

Display paragraph. This is the graph `transfer_summary` with only the internal phrase “shared domain foundations, optional useful edges” replaced. The claims are unchanged:

> Your Sociology studies introduce you to analysing social structures and society's dynamics, using ideas about culture and socialisation, and examining human behaviour. These are relevant starting points for Social Sciences—not the whole set of capabilities used across the field. Beyond the programme, the path shows three foundations already on your route, useful options you can skip, and additions for the areas or roles you choose. It does not claim every employer requires every item or that your degree already taught these additions.

Four headings under that paragraph:

| Heading | What fills it |
|---|---|
| What your programme covers | All 14 theme titles, collapsed |
| What carries into this field | Only the resolved outcome rows, each with its course title. The evidenced themes are Ideas and foundations, and People, groups and society |
| What this field adds | The three foundations, then whatever the current method selection reveals |
| What this path does not establish | The last sentence of the display paragraph |

A theme with no resolved outcome uses the carry-forward line already in `ProgrammeCurriculumCarryForward.tsx`:

> The route records a theme-level connection, but does not identify a particular course outcome as the transfer evidence.

### 14.4 The three foundations

Card title is the node `label`. Expanded body is the node `meaning`, verbatim. “What you might produce” is `learner_output`, verbatim. Chip: On your route.

| Order | Title to show |
|---|---|
| 1 | Frame a researchable social question and choose a fitting design |
| 2 | Evaluate evidence and explain what it can and cannot show |
| 3 | Communicate findings for the intended audience |

One kept limit under each, rewritten only to remove “D078”:

| Foundation | Keep in mind |
|---|---|
| 1 | Not every job or activity in this field includes a formal research study. |
| 2 | Checking evidence at this level is not advanced review training. Not every activity in this field uses data from a study. |
| 3 | A report, an article, a presentation, or a short brief is chosen for the audience. You do not have to produce all of them. |

Hide the other strings in those `limitations` arrays. They name source institutions or say the example is not a factual claim about a transport system. The bus example already lives inside `meaning` and stays there.

### 14.5 Themes

Collapsed line under the theme title: the node `description`, verbatim. Expanded text: the node `narration`, verbatim. Do not shorten these.

| Theme | Collapsed line |
|---|---|
| African and Nigerian societies | These courses examine African and Nigerian social structures, cultures, histories and regional settings. |
| Social work and practical change | These courses connect social-science knowledge with social work, community services, innovation and practical responses to social needs. |
| Politics and organisations | These courses examine political life, collective action, formal organisations and how institutions work with society. |
| Ideas and foundations | Courses in this part introduce the concepts, history and theories used to make sense of the programme’s subject area. |
| People, groups and society | Courses in this part help you examine the people, groups, institutions, cultures or systems named in the programme record. |
| Research and evidence | Courses in this part show how the programme asks questions, gathers information, examines evidence and communicates findings. |
| Communication and academic writing | Shared university learning in clear English, reading, writing, reasoning and presenting ideas. |
| Entrepreneurship and venture creation | Shared courses on identifying opportunities, developing ideas and understanding how ventures are planned. |
| Nigerian peoples and culture | A shared course on Nigerian peoples, history, culture and social life. |
| Peace, conflict and security | A shared course introducing peace, conflict, security and ways people respond to conflict. |
| Philosophy and reasoning | A shared course on philosophical questions, logic and clear reasoning. |
| Social change and development | These courses explore how societies change, what shapes development and how those changes affect people and institutions. |
| Inequality, gender and social problems | These courses examine inequality, gender relations, crime and other social problems, including their causes and effects. |
| Technology and information | Courses in this part cover the digital applications and information practices recorded for the programme. |

Expanded narrations, verbatim:

- African and Nigerian societies: You will study the histories, cultures, languages, institutions and social organisation of Nigerian and other African societies. Regional examples help you compare how societies differ and change; they are not presented as one story that describes every community.
- Social work and practical change: You will consider social causes of problems and the services and organisations that respond to them, then explore how social-science knowledge can support practical ideas and services. The curriculum’s examples are learning topics, not a guarantee of professional qualification.
- Politics and organisations: You will study how social conditions influence political activity, parties and movements, and how formal organisations are structured and operate. This connects institutions to the people and communities around them.
- Ideas and foundations: You will learn how Sociology developed, explore key concepts and compare sociological theories. The programme uses these ideas to help explain social institutions, relationships and change.
- People, groups and society: You will examine how people behave and relate to one another, and how families, groups, culture, language and social settings shape everyday life. The courses draw on Sociology, Anthropology and Psychology while keeping their different viewpoints distinct.
- Research and evidence: You will move from forming a research question and planning a study to choosing suitable methods, collecting and analysing information, and explaining what the evidence can—and cannot—show. The curriculum includes quantitative approaches, which work with numbers, and qualitative approaches, which examine words, experiences and meaning.
- Communication and academic writing: You will practise communicating clearly in speech and writing, understanding written information, and presenting ideas. These are shared university skills that support your Sociology studies; the course does not replace the discipline-specific research and reporting taught elsewhere in the programme.
- Entrepreneurship and venture creation: You will explore how people identify an unmet need, develop an idea and plan a possible venture. These shared courses introduce entrepreneurship and venture creation; they do not promise that an idea will succeed or replace Sociology's study of social and economic conditions.
- Nigerian peoples and culture: You will study Nigerian peoples and cultures through historical and social examples. This shared course adds Nigerian context to your university learning; it is not a complete account of every community or a substitute for the Sociology programme's own African and Nigerian society courses.
- Peace, conflict and security: You will learn key ways people describe peace, conflict and security, and consider how conflict can arise and be addressed. This shared course introduces broad concepts; the Sociology courses examine particular social institutions, inequalities and settings in greater depth.
- Philosophy and reasoning: You will examine philosophical questions and practise logic—checking whether reasons support a conclusion. These are shared reasoning foundations, while sociological theory and evidence are developed in the Sociology courses.
- Social change and development: You will compare explanations of social change and development, then consider how economic, political and historical conditions affect families, institutions and communities. The curriculum includes African and Nigerian contexts as well as wider theories.
- Inequality, gender and social problems: You will examine how inequality and gender relations shape people’s opportunities, and how crime and other social problems affect communities. The courses compare explanations and responses rather than treating any single cause or solution as universal.
- Technology and information: You will practise using a computer and common applications to create, organise and present information. The curriculum names these as general computing skills; it does not make a particular software brand a Sociology requirement.

### 14.6 Methods

Card title: node `label`. Collapsed line: the “One line” below, which is the first sentence of `meaning` or, for the two network methods, the learner sentence in the table. Expanded body: the full `meaning`, or `plain_language_meaning` plus `meaning_in_domain` for the two network methods. “What you might produce” is `learner_output` when the node has one.

Skip line, chosen from the stored `requirement_reason` and shown under the one line:

| Stored reason starts with | Chip | Line under the card |
|---|---|---|
| “This is a useful recommended learning option” | Useful. You can skip it | This is a useful option for the work it describes. It is not required for every Social Sciences student. You can continue without it and come back if you need it. |
| “This is an optional focus” | Optional. Open it if this question fits | This is an optional focus for a narrower question. You can continue through Social Sciences without it. Select it when that work fits what you want to learn. |
| No `requirement_reason` | Omit the chip | Omit the skip line. Network analysis and social network analysis are in this group today |

Useful-reason methods: archival and historical research; case-study and comparative-case design; document and content analysis; interviews; mixed methods; observation and ethnographic approaches; qualitative methods; quantitative methods; surveys and questionnaire design; focus groups and workshops; participatory and action research; programme evaluation and theory of change; evidence synthesis.

Optional-focus methods: agent-based modelling; computational and digital social-research methods; spatial analysis; discourse and conversation analysis; experiments, quasi-experiments and causal inference; longitudinal, panel and multilevel data; psychometrics and scale construction.

| Method | One line | Limit to show | Limits to hide |
|---|---|---|---|
| Archival and historical research | Use records from archives and historical collections to investigate people, institutions or events while checking provenance, context, gaps and preservation limits. | Many records are missing, inaccessible, undigitised or created from one institution's perspective. A catalogue entry or archival record is not automatically a complete or neutral account. | The sentence that says current sources are thin and promotion must wait |
| Case-study and comparative-case design | Study one or a small number of bounded real-world cases in depth, or compare cases deliberately to understand similarities, differences and possible explanations. | A single or small set of cases does not automatically represent all similar cases. Comparison does not by itself prove causality. | The sentence that says the sources do not yet provide a focused design guide |
| Agent-based modelling of social processes | Agent-based modelling is a computer simulation in which represented people, groups or organisations follow stated rules and interact. | A simulation is a simplified model, not proof that real people will behave exactly that way. It is not the same thing as every kind of computational modelling. | Sentences that name National Academies, NCRM, or “not a shared D078 requirement” |
| Computational and digital social-research methods | Computational social research uses suitable digital or large-scale data and computational techniques to investigate social questions. | The method has to fit the question and the data. Privacy, bias, and limits still matter. | Sentences that name Edinburgh, UCSD, Cornell, a 403 response, or game theory’s verification status |
| Document and content analysis | Document and content analysis uses a planned way to examine texts or records. | The material and the coding rules have to fit the question. Software does not supply the categories or the interpretation. | None beyond that |
| Interviews | An interview is a planned conversation for learning how someone understands or experiences an issue. | It can add depth. It does not automatically measure how common an experience is. | None beyond that |
| Mixed methods | Mixed methods deliberately combine numerical evidence with words, observations or documents so each kind of evidence can answer a different part of the question. | Collecting several kinds of data without a plan is not mixed methods. It is not automatically stronger than one suitable method. | None beyond that |
| Observation and ethnographic approaches | Observation records what happens in a setting. Ethnographic approaches study practices and meaning in context over time. | Work with real people needs a clear purpose, permission, and safeguards. | Sentences that name OpenLearn levels or say “not needed for every social-science path” as a source note. The skip line already says it is not required |
| Qualitative methods | Qualitative research studies meanings, experiences and context using material such as interview answers, observations or documents. | A few interviews do not by themselves show how common a view is. Qualitative methods are not one technique. | The Taguette sentence |
| Quantitative methods | Quantitative research uses numbers to describe or compare patterns. | The design and the sample determine what the numbers can support. A chart does not establish cause. | “Statistics and software are not universally needed across D078.” The skip line covers that |
| Spatial analysis and mapping with suitable social data | Spatial analysis looks at how places and distances relate to a social question. | A map can mislead if the coverage, the boundaries, or the scale do not fit. | “Keep out of shared foundation.” |
| Surveys and questionnaire design | A survey asks people a planned set of questions so answers can be compared. | A survey form alone does not make the results representative. | Sentences that name Pew or Kobo |
| Discourse and conversation analysis | Study how language is used to construct meaning, identity, relationships or social positions, and how conversation is organised turn by turn. | These are families of approaches, not one fixed procedure. A detailed reading does not by itself measure how common something is, represent a population, or prove cause. | The sentence that says the curricula only establish a route option |
| Experiments, quasi-experiments and causal inference | Design comparisons that help estimate whether an intervention or exposure contributed to an outcome, while making the assumptions visible. | A randomised or quasi-experimental label does not automatically make a causal claim credible. Results may be specific to the people, the intervention, and the setting. | Sentences that name UCLA, HKUST, or Portsmouth |
| Focus groups and workshops | Use a guided group discussion to learn how people explain, agree, disagree and build on one another's views. | A dominant voice, silence, or the mix of people in the group can shape what gets said. The group does not automatically represent a wider population or establish cause. | Sentences that name Birkbeck, Portsmouth, or UK Data Service |
| Longitudinal, panel and multilevel data | Analyse data collected repeatedly over time, or data collected in groups within groups, while accounting for that structure. | A complicated model cannot repair poor measurement, missing data, or a design that does not fit. | The sentence about Stata and vendor documentation |
| Participatory and action research | Work with people affected by an issue so they can help shape the question, the evidence, the interpretation, and the possible action. | Participation does not guarantee equal power, agreement, or representativeness. | Sentences that name Carleton, ESRC, or Nigeria-specific legal obligations as an evidence gap |
| Programme evaluation and theory of change | Explain how a programme is expected to produce change, then gather evidence to judge how it was carried out, what resulted, and what is still uncertain. | A theory of change makes assumptions visible. It does not prove the programme caused the outcome. | The sentence that names the Magenta Book |
| Psychometrics and scale construction | Turn an abstract idea into a set of questions or indicators, then test whether that set works for the people it is meant for. | A consistent scale is not automatically a valid, fair, or transferable one. It needs checking in the population and language where it will be used. | The sentence that names GESIS and “D064” |
| Evidence synthesis | Evidence synthesis uses a documented method to find, select, assess and bring together existing studies. | A systematic review and a scoping review are related and not interchangeable. A general literature search is not either one. | Sentences that name PRISMA, Campbell, JBI, or a mismatched UK Data Service citation |
| Network analysis | Use this when the question is about relationships among people, organisations, places, or digital entities. | A network picture depends on who is included, what counts as a connection, and what is missing. The measures describe that picture. They do not establish cause, and they do not make the network representative. | None. Show `plain_language_meaning` and `meaning_in_domain` on expand, with “D078” changed to “this field” |
| Social network analysis | A way to study relationships between people, groups, or other social actors by deciding who counts and which connections count. | It is for questions where the relationships themselves matter. It is not the same as analysing the text of social-media posts. A picture of a network does not by itself establish a finding, prove cause, or show that someone is personally important. | None |

The expanded `meaning` remains the authority if a one-line above and the full `meaning` ever diverge. Show the full `meaning` on “See more”.

### 14.7 Combinations

Card title is the node `label`. These titles are already student language. Do not replace them with the internal `design` slug. On expand, show the four stored fields with these headings and the stored text verbatim.

| Heading on the card | Graph field |
|---|---|
| Why these belong together | `why_combine` |
| How the work proceeds | `how_used` |
| Use it when | `condition` |
| Keep in mind | `limits` |

Selection note under every combination, from `selection_rule`, with “D078” removed:

> Optional. Select this combination only when the question benefits from bringing the evidence together in this way. It does not make every method inside it required across Social Sciences.

Stored text to show:

**Explore first, measure next.** Why: Use interviews or focus groups to discover local language, experiences or response options, then build a survey to examine how widely those patterns appear. The first phase informs the second; the two are not just separate studies placed together. How: Qualitative inquiry, then refine concepts and questions, then pilot the survey, then collect and analyse survey data, then explain how the phases connect. When: Choose this when the topic or likely answer range is not yet understood well enough to design useful survey items. Limit: A small qualitative phase does not estimate prevalence; a later survey is only generalisable to the extent its sampling and measurement support that claim.

**Measure a pattern, then explain it.** Why: A survey can show which patterns are common in the sampled group; follow-up interviews can explore how participants understand or experience a surprising or important pattern. How: Survey, then identify a result needing explanation, then select interview participants and questions, then analyse interviews, then integrate the explanation with the survey findings. When: Choose this when the numerical result needs context or an explanation that the survey did not collect. Limit: Interviews explain meanings and mechanisms; they do not independently prove why the survey pattern occurred or make the survey causal.

**Compare survey and interview evidence.** Why: Collect numerical and interview evidence around the same question when the learner needs to compare whether they agree, differ or illuminate different parts of the issue. How: Plan the shared question and separate strands, then collect and analyse each appropriately, then compare or integrate results, then explain agreement, disagreement and remaining uncertainty. When: Choose this only when there is a planned integration question, not merely because both methods are available. Limit: Different samples, measures or timing may explain disagreement; convergence does not automatically prove truth.

**Use group discussion to shape a survey.** Why: Focus groups can reveal concepts, wording and response options participants use, helping a later questionnaire ask clearer and more relevant questions. How: Review the topic and evidence, then facilitate a bounded group discussion, then identify candidate concepts and language, then draft and cognitively test survey items, then pilot before wider use. When: Useful when the researcher cannot confidently anticipate the range of answers or locally meaningful terms. Limit: Group interaction can shape what people say; group findings do not establish how common a view is.

**Use group discussion to interpret survey findings.** Why: A survey can identify a distribution or subgroup difference; a focus group can explore how participants interpret the issue and what explanations merit further investigation. How: Analyse the survey, then define the unresolved question, then recruit a purposeful discussion group, then analyse interaction and accounts, then connect the qualitative interpretation back to the survey limits. When: Choose when the survey surfaces an ambiguity that can be explored through group discussion. Limit: A focus group is not a representative vote and should not be used to estimate population percentages.

**Build a case study from complementary evidence sources.** Why: A case study is a bounded research design, not a single collection method. Interviews, documents and observation can reveal different sides of the same case; a survey or existing dataset can be added when the case question needs numerical evidence. How: Define the case and question, then choose evidence sources that answer distinct parts, then collect and analyse each with its own method, then compare and integrate the sources, then report contradictions and gaps. When: Use multiple sources when each contributes distinct evidence about the bounded case and there is a plan to interpret them together. Limit: More sources do not guarantee better evidence; source access, quality, ethics and contradictions still need assessment.

**Compare what people say with situated observation.** Why: Interviews provide accounts and interpretations; observation can document actions, interactions and settings. Their comparison can expose context or differences between reported and observed practice. How: Frame the shared question, then conduct ethically appropriate interviews and observations, then keep distinct records, then compare what each source can show and explain divergence. When: Use when understanding both accounts and situated practice matters and observation is permitted and feasible. Limit: Observation is selective and may change behaviour; it cannot reveal private motives without additional evidence.

**Use documents to support an interview.** Why: A document, timeline or participant-created record can help an interview explore how its author understands a decision or experience, rather than treating the document as self-explanatory. How: Select an appropriate document, then assess provenance and sensitivity, then invite the participant to interpret it, then analyse the document and account separately, then connect them. When: Useful when the document has meaning to a participant or records a process the interview asks about. Limit: One person's interpretation does not establish the document's complete provenance or institutional meaning.

**Choose evidence methods with participants.** Why: Participatory research is a governance and collaboration approach; it can use interviews, group discussions, surveys or observation when participants and the question justify them. How: Agree the question, roles and decision rights, then choose accessible evidence methods together, then collect and analyse with appropriate participation, then share interpretation and action decisions transparently. When: Use where the research purpose and governance genuinely involve participants in shaping decisions. Do not label ordinary data collection participatory. Limit: Participation does not remove power imbalances, consent obligations, safety risks or the need to justify sampling and analysis.

Inside the participatory card, the required method is labelled with its node title and the chip “Included in this combination”. The four optional methods use “Add this” / “Added” and the same one-line each method uses in 14.6. Helper line:

> Interviews, focus groups, surveys, and observation are options inside this combination. You do not have to use all of them.

### 14.8 Areas, roles, and items

Area card:

- Title: the area `label` from section 2.
- Reason: “Shown because you selected {labels}.”
- Explanation: each visible task-family `label`, verbatim. That is the only area explanation stored on the graph. Example, for the computational core family: “Use computational, digital-trace and data-intensive approaches to investigate social processes, digital technology and society, while applying social theory, research design and ethical interpretation.” Show only families whose ids are on the selected routes. The approval value `area_task_set_candidate_not_student_approved` stays a staff fact. Do not print it, and do not write a second area description to replace it.

Role card:

- Title: title case of the stored lowercase `label`.
- Fit line from 14.2.
- No invented duties, outputs, or workplace.

Before role items, show this explanation:

> These items show ways your selected learning may support work associated with this role. Actual duties vary by employer and position; this is not a checklist of tasks every employer assigns or proof that you are job-ready. “Needed” and “Useful” describe this learning route, not a universal job requirement.

Method-specific role items appear only when the route graph contains a reviewed method-to-role item link. Do not infer them from the role's general task list. If none are present, omit that section entirely; the absence does not mean the role has no tasks or that the learning path is incomplete.

Role item, when the graph node has only a label:

- Title: title case of `label`.
- If `requirement_reason` is “A source-backed option for a bounded role task, not a universal requirement or job-readiness claim.”, show: “An option for a specific task in this role. It is not required for every student, and choosing it does not mean you are ready for the job.”
- If `requirement_reason` is “A narrower specialist option; learners can continue without choosing it.”, show: “A narrower option. You can continue without choosing it.”

When a rendered item payload from the API already has a learner explanation, prefer that payload text over the graph one-liners above. Still apply 14.1 so staff notes inside it do not render. Do not fill a blank payload explanation with a sentence that is not in the graph or the payload.

### 14.9 Resource row words

The type chip uses the existing `resourceKind()` names: Programme reference, Field reference, Role reference, Learning resource, Skill reference, Tool guide, Competency reference, Qualification information, Professional body, or Reference. The chip sits on the same row as the title. The row does not repeat “Why this resource is here” unless the parent card is expanded, and then only the stored description.

---

## Appendix A — oracle

Generated from the graph at implementation time by reading `method_area_routes`, `method_area_role_routes`, and `combination_designs`. The tables below are the current contents. If a future graph file changes a route, the projection follows the file and this appendix is regenerated. Do not “correct” the file to match a nickname.

### A.1 Themes

| Theme id | Label | Outcomes |
|---|---|---|
| `programme-theme:sociology:african_societies` | African and Nigerian societies | 24 |
| `programme-theme:sociology:applied_practice` | Social work and practical change | 8 |
| `programme-theme:sociology:governance` | Politics and organisations | 8 |
| `programme-theme:sociology:ideas` | Ideas and foundations | 41 |
| `programme-theme:sociology:people` | People, groups and society | 40 |
| `programme-theme:sociology:research` | Research and evidence | 27 |
| `programme-theme:sociology:shared_communication` | Communication and academic writing | 6 |
| `programme-theme:sociology:shared_enterprise` | Entrepreneurship and venture creation | 17 |
| `programme-theme:sociology:shared_nigerian_culture` | Nigerian peoples and culture | 8 |
| `programme-theme:sociology:shared_peace_conflict` | Peace, conflict and security | 5 |
| `programme-theme:sociology:shared_philosophy` | Philosophy and reasoning | 16 |
| `programme-theme:sociology:social_change` | Social change and development | 8 |
| `programme-theme:sociology:social_issues` | Inequality, gender and social problems | 24 |
| `programme-theme:sociology:technology` | Technology and information | 4 |

Ideas and foundations, and People, groups and society, are the two themes with direct transfer evidence. The other twelve remain readable as programme context.

### A.2 Methods

The area and role lists are the visible set when that method is the only selection. Role labels are the stored node labels.

| Method id | Label | Visible `area_id` values |
|---|---|---|
| `domain-item:archival-and-historical-research` | Archival and historical research | computational, economics, human-geography, politics, social-research, sociology |
| `domain-item:case-study-and-comparative-case-design` | Case-study and comparative-case design | all 7 |
| `domain-item:d078-agent-based-modeling` | Agent-based modelling of social processes | computational, economics, psychology, sociology |
| `domain-item:d078-computational-social-research` | Computational and digital social-research methods | computational, economics, politics, psychology, sociology |
| `domain-item:d078-document-analysis` | Document and content analysis | computational, human-geography, politics, social-research, sociology |
| `domain-item:d078-interviews` | Interviews | politics, psychology, social-research, sociology |
| `domain-item:d078-mixed-methods` | Mixed methods (combining numerical and qualitative evidence when justified) | all except human-geography |
| `domain-item:d078-observation-ethnography` | Observation and ethnographic approaches | human-geography, psychology, social-research, sociology |
| `domain-item:d078-qualitative-approach` | Qualitative methods (working with words, observations and meaning) | computational, politics, psychology, social-research, sociology |
| `domain-item:d078-quantitative-approach` | Quantitative methods (working with numbers) | all 7 |
| `domain-item:d078-spatial-social-analysis` | Spatial analysis and mapping with suitable social data | computational, human-geography |
| `domain-item:d078-survey-method` | Surveys and questionnaire design | all 7 |
| `domain-item:discourse-and-conversation-analysis` | Discourse and conversation analysis | computational, politics, psychology, social-research, sociology |
| `domain-item:experiments-quasi-experiments-and-causal-inference` | Experiments, quasi-experiments and causal inference | computational, economics, politics, psychology, social-research |
| `domain-item:focus-groups-and-workshops` | Focus groups and workshops | human-geography, politics, psychology, social-research, sociology |
| `domain-item:longitudinal-panel-and-multilevel-data` | Longitudinal, panel and multilevel data | all 7 |
| `domain-item:participatory-and-action-research` | Participatory and action research | human-geography, politics, psychology, social-research, sociology |
| `domain-item:programme-evaluation-and-theory-of-change` | Programme evaluation and theory of change | computational, economics, politics, psychology, social-research |
| `domain-item:psychometrics-and-scale-construction` | Psychometrics and scale construction | computational, politics, psychology, social-research, sociology |
| `domain-item:systematic-and-scoping-evidence-synthesis` | Evidence synthesis: systematic reviews and scoping reviews | all 7 |
| `domain-method:network-analysis` | Network analysis | computational, politics, psychology, social-research, sociology |
| `domain-method:social-network-analysis` | Social network analysis | computational, politics, psychology, social-research, sociology |

Short area keys above expand to the `D078:…` ids in section 2. “All 7” means every `area_id` in that table.

### A.3 Roles visible inside each area

These role labels are the same on every method route that includes the area, in the current graph. Still read them from `method_area_role_routes` for the selected method. Do not hard-code this table in the UI.

| Area | Role labels |
|---|---|
| Computational and Digital Social Science | statistician |
| Economics and Applied Economic Analysis | economic adviser; economist; economic development coordinator; tax policy analyst; business economics researcher; economic policy officer |
| Human Geography and Population Studies | genealogist; geographer; demographer |
| Politics, Governance and Public Policy | political scientist; economic development coordinator; tax policy analyst; economic policy officer |
| Social Behaviour and Interaction | thanatology researcher; criminologist; behavioural scientist |
| Social Research and Evaluation | statistician; social work researcher |
| Sociology and Social Anthropology | genealogist; thanatology researcher; anthropologist; criminologist; sociologist; media scientist; archaeologist |

That is 19 distinct roles. A role listed under two areas is one role reached from two visible areas, not two careers.

### A.4 Combinations whose `area_routes` are non-empty

| Combination | Areas that mount |
|---|---|
| Exploratory sequential, explanatory sequential, convergent survey and interview, focus group then survey, survey then focus group, case study with several sources | all 7 |
| `combo:interview-and-observation` | human-geography, politics, psychology, social-research, sociology |
| `combo:document-and-interview-elicitation` | computational, human-geography, politics, psychology, social-research, sociology |

`combo:participatory-method-choice` mounts nothing from `area_routes`. It mounts the participatory method routes, plus the routes of each component the learner ticks.

Role lists inside a combination area follow that combination’s `area_routes[].role_ids`, which match the labels in A.3 for those areas. Role items stay hidden until the role is opened (`role_item_ids_exposed_only_after_role_selection: true` on combination area routes). Apply that same gate to single-method role routes.
